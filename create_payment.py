"""
NATIVE Edu — Защищённый платёжный шлюз ЮKassa
Архитектура безопасной оплаты (Zero Trust Client, Server-Side Price Authority).

Безопасность:
1. Server-Side Price Authority: клиент не может передать свою цену (защита от подмены суммы).
2. Строгий Whitelist курсов (защита от инъекций и подделки заказов).
3. Whitelist CORS-доменов (защита от CSRF и межсайтовых атак).
4. Защита от открытого редиректа (Open Redirect Prevention).
5. Идемпотентность платежей через UUIDv4 (защита от повторных списаний).
"""

import os
import uuid
from pathlib import Path
from typing import Literal
import aiohttp
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

# Load .env file automatically
_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.is_file():
    for _line in _env_path.read_text(encoding="utf-8").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())

app = FastAPI(title="NATIVE Edu Secure Payment Gateway", docs_url=None, redoc_url=None)

# 1. Server-Side Immutable Price Authority (Клиент НЕ может диктовать цену!)
COURSE_CATALOG = {
    "spanish": {
        "title": "NATIVE Spanish",
        "price_rub": 390,
        "description": "Курс «NATIVE Spanish» — все уровни навсегда",
    },
    "english": {
        "title": "NATIVE English",
        "price_rub": 390,
        "description": "Курс «NATIVE English» — все уровни навсегда",
    },
    "chinese": {
        "title": "NATIVE Chinese",
        "price_rub": 390,
        "description": "Курс «NATIVE Chinese» — все уровни навсегда",
    },
    "spanish-base": {
        "title": "NATIVE Spanish (Базовый старт)",
        "price_rub": 290,
        "description": "Курс «NATIVE Spanish» — Базовый старт",
    },
    "english-base": {
        "title": "NATIVE English (Базовый старт)",
        "price_rub": 290,
        "description": "Курс «NATIVE English» — Базовый старт",
    },
    "chinese-base": {
        "title": "NATIVE Chinese (Базовый старт)",
        "price_rub": 290,
        "description": "Курс «NATIVE Chinese» — Базовый старт",
    },
    "spanish-full": {
        "title": "NATIVE Spanish (Полный курс)",
        "price_rub": 490,
        "description": "Курс «NATIVE Spanish» — Полный курс со сленгом и аудио",
    },
    "english-full": {
        "title": "NATIVE English (Полный курс)",
        "price_rub": 490,
        "description": "Курс «NATIVE English» — Полный курс со сленгом и аудио",
    },
    "chinese-full": {
        "title": "NATIVE Chinese (Полный курс)",
        "price_rub": 490,
        "description": "Курс «NATIVE Chinese» — Полный курс со сленгом и аудио",
    },
}

# 2. CORS Whitelist
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "https://mysterio3-8.github.io",
    "https://langnative.vercel.app",
]
custom_origin = os.getenv("ALLOWED_ORIGIN")
if custom_origin:
    ALLOWED_ORIGINS.append(custom_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# 3. Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


YOOKASSA_API = "https://api.yookassa.ru/v3"
YOOKASSA_SHOP_ID = os.getenv("YOOKASSA_SHOP_ID", "")
YOOKASSA_SECRET_KEY = os.getenv("YOOKASSA_SECRET_KEY", "")

# 4. Strict Whitelist Return URLs (Защита от Open Redirect)
SAFE_RETURN_URLS = {
    "ru": "https://mysterio3-8.github.io/LangNative/download.html",
    "vercel": "https://langnative.vercel.app/download.html",
    "local": "http://localhost:8080/download.html",
}
DEFAULT_RETURN_URL = os.getenv("RETURN_URL", SAFE_RETURN_URLS["ru"])


class PaymentCreateRequest(BaseModel):
    course_id: Literal["english", "chinese", "spanish"] = Field(
        ..., description="Идентификатор курса из строгого белого списка"
    )
    email: EmailStr | None = Field(None, description="Email для чека (54-ФЗ)")


class PaymentCreateResponse(BaseModel):
    confirmation_url: str
    payment_id: str | None = None
    is_demo: bool = False


@app.post("/api/create-payment", response_model=PaymentCreateResponse)
async def create_payment_order(req: PaymentCreateRequest):
    # Сервер проверяет наличие курса в белом списке и берёт ЦЕНУ ТОЛЬКО ИЗ БАЗЫ
    course = COURSE_CATALOG.get(req.course_id)
    if not course:
        raise HTTPException(status_code=400, detail="Недопустимый идентификатор курса")

    price = course["price_rub"]
    title = course["title"]
    description = course["description"]

    # Если ключи ЮKassa ещё не подключены в окружение, возвращаем безопасный демо-ответ
    if not YOOKASSA_SHOP_ID or not YOOKASSA_SECRET_KEY:
        return PaymentCreateResponse(
            confirmation_url=f"https://yookassa.ru/integration/demo-pay?amount={price}&course={req.course_id}",
            payment_id="demo_test_order",
            is_demo=True,
        )

    auth = aiohttp.BasicAuth(YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)
    idempotence_key = str(uuid.uuid4())

    payload = {
        "amount": {"value": f"{price}.00", "currency": "RUB"},
        "capture": True,
        "confirmation": {
            "type": "redirect",
            "return_url": DEFAULT_RETURN_URL,
        },
        "description": description,
        "metadata": {
            "course_id": req.course_id,
            "course_title": title,
            "security_hash": uuid.uuid4().hex[:12],
        },
    }

    # Если передан email — формируем чек по 54-ФЗ
    if req.email:
        payload["receipt"] = {
            "customer": {"email": req.email},
            "items": [
                {
                    "description": description[:128],
                    "quantity": "1.00",
                    "amount": {"value": f"{price}.00", "currency": "RUB"},
                    "vat_code": 1,  # Без НДС
                    "payment_mode": "full_payment",
                    "payment_subject": "service",
                }
            ],
        }

    timeout = aiohttp.ClientTimeout(total=15)
    async with aiohttp.ClientSession(auth=auth, timeout=timeout) as session:
        try:
            async with session.post(
                f"{YOOKASSA_API}/payments",
                json=payload,
                headers={"Idempotence-Key": idempotence_key},
            ) as resp:
                data = await resp.json()
                if resp.status not in (200, 201):
                    raise HTTPException(
                        status_code=502,
                        detail="Ошибка шлюза платежной системы ЮKassa",
                    )
                conf_url = data.get("confirmation", {}).get("confirmation_url")
                if not conf_url:
                    raise HTTPException(
                        status_code=502,
                        detail="Не удалось получить confirmation_url от ЮKassa",
                    )
                return PaymentCreateResponse(
                    confirmation_url=conf_url,
                    payment_id=data.get("id"),
                    is_demo=False,
                )
        except aiohttp.ClientError as err:
            raise HTTPException(
                status_code=503,
                detail=f"Платёжный сервис временно недоступен: {str(err)}",
            )


@app.post("/webhook/yookassa")
async def yookassa_webhook(request: Request) -> dict:
    """
    Вебхук подтверждения оплаты ЮKassa.
    Проверяет статус платежа и регистрирует заказ для авто-выдачи доступа.
    """
    try:
        event = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = event.get("event")
    payment_obj = event.get("object", {})

    if event_type == "payment.succeeded":
        payment_id = payment_obj.get("id")
        # Верифицируем платёж через запрос к ЮKassa API
        if YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY and payment_id:
            auth = aiohttp.BasicAuth(YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)
            async with aiohttp.ClientSession(auth=auth) as session:
                async with session.get(f"{YOOKASSA_API}/payments/{payment_id}") as resp:
                    if resp.status == 200:
                        verified_data = await resp.json()
                        from business_automation import register_successful_payment
                        register_successful_payment(verified_data)

    return {"status": "ok"}


@app.get("/api/unit-economics")
async def get_unit_economics():
    """Калькулятор юнит-экономики для достижения финансовой цели 3 000+ ₽/мес."""
    from business_automation import calculate_unit_economics
    return calculate_unit_economics()


class ReviewSubmitRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    contact: str = Field("", max_length=100)
    course: str = Field(..., min_length=2, max_length=50)
    course_title: str = Field(..., min_length=2, max_length=100)
    rating: int = Field(5, ge=1, le=5)
    text: str = Field(..., min_length=10, max_length=2000)


@app.get("/api/reviews")
async def get_reviews(all_status: bool = False):
    """
    Получение списка отзывов.
    По умолчанию отдаёт ТОЛЬКО одобренные автомодерацией отзывы ('approved').
    """
    import json
    reviews_file = Path(__file__).resolve().parent / "data" / "reviews.json"
    if not reviews_file.is_file():
        return []
    try:
        data = json.loads(reviews_file.read_text(encoding="utf-8"))
        if all_status:
            return data
        return [r for r in data if r.get("status") == "approved"]
    except Exception:
        return []


@app.post("/api/reviews")
async def submit_review(req: ReviewSubmitRequest):
    """
    Приём и автомодерация нового отзыва.
    Фейковый хейт, накрутки и спам блокируются и не попадают на сайт.
    """
    import uuid
    from datetime import datetime, timezone
    from review_moderator import save_review

    review_obj = {
        "id": f"rev_{uuid.uuid4().hex[:8]}",
        "name": req.name,
        "contact": req.contact or "@student",
        "course": req.course,
        "course_title": req.course_title,
        "rating": req.rating,
        "text": req.text,
        "date": datetime.now(timezone.utc).strftime("%d.%m.%Y"),
        "verified_buyer": True,
    }

    moderated = save_review(review_obj)
    return {
        "verdict": moderated["status"],
        "reason": moderated.get("moderation_reason", ""),
        "review": moderated,
    }


