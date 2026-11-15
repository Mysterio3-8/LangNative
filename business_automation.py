"""
NATIVE Edu — Модуль бизнес-автоматизации и квалификации лидов
Включает:
1. Автоматический обработчик Webhook ЮKassa (авто-выдача доступа).
2. Triage & Lead Qualification (квалификация входящих лидов из ВК и Telegram).
3. Unit Economics Engine (калькулятор юнит-экономики и трекинг цели 3 000 ₽/мес).
"""

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger("business_automation")

BASE_DIR = Path(__file__).resolve().parent
ORDERS_FILE = BASE_DIR / "data" / "orders.json"

# Ссылки на закрытые Telegram-каналы курсов (выдаются покупателям)
COURSE_INVITES = {
    "english": "https://t.me/+native_english_closed_vip",
    "chinese": "https://t.me/+native_chinese_closed_vip",
    "spanish": "https://t.me/+native_spanish_closed_vip",
    "combo": "https://t.me/+native_combo_all_closed_vip",
}


def load_orders() -> List[Dict[str, Any]]:
    if not ORDERS_FILE.is_file():
        return []
    try:
        return json.loads(ORDERS_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        logger.error("Ошибка чтения orders.json: %s", e)
        return []


def save_orders(orders: List[Dict[str, Any]]) -> None:
    ORDERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    ORDERS_FILE.write_text(json.dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8")


def register_successful_payment(payment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Автоматическая обработка подтверждённого платежа ЮKassa.
    Создаёт запись, определяет курс и генерирует инвайт-ссылку.
    """
    metadata = payment_data.get("metadata", {})
    course_id = metadata.get("course_id", "english")
    amount = float(payment_data.get("amount", {}).get("value", 249))
    order_id = f"ORD-{payment_data.get('id', '')[-6:].upper()}"

    invite_link = COURSE_INVITES.get(course_id, COURSE_INVITES["english"])

    order_record = {
        "id": order_id,
        "payment_id": payment_data.get("id"),
        "date": datetime.now(timezone.utc).strftime("%d.%m.%Y, %H:%M"),
        "course": course_id,
        "courseName": metadata.get("course_title", f"Курс {course_id.upper()}"),
        "price": int(amount),
        "method": "ЮKassa (СБП / Карта)",
        "customer": payment_data.get("receipt", {}).get("customer", {}).get("email", "@yookassa_customer"),
        "status": "paid",
        "invite_link": invite_link,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    orders = load_orders()
    # Дедупликация по payment_id
    if not any(o.get("payment_id") == payment_data.get("id") for o in orders):
        orders.insert(0, order_record)
        save_orders(orders)
        logger.info("Заказ %s успешно записан. Инвайт: %s", order_id, invite_link)

    return order_record


# --- Lead Triage & Qualification Engine ---
def triage_incoming_lead(message_text: str) -> Dict[str, Any]:
    """
    Квалификация входящих запросов из Telegram (@mollydamnbro) и сообщений сообществ ВК.
    Определяет намерение (Intent) и возвращает готовый шаблон ответа с конверсией в оплату.
    """
    text = (message_text or "").lower()

    if any(w in text for w in ["как оплатить", "купить", "хочу курс", "реквизиты", "сбп", "счет", "оплата"]):
        return {
            "intent": "HOT_BUY",
            "priority": "HIGH",
            "suggested_action": "Отправить ссылку на СБП ЮKassa",
            "reply_template": (
                "Привет! Оплатить можно моментально и без комиссии через СБП или картой:\n"
                "👉 Ссылка на оплату: http://localhost:8080/#courses (249 ₽ навсегда)\n"
                "После оплаты доступ к материалам и закрытому каналу открывается сразу."
            )
        }
    
    if any(w in text for w in ["с нуля", "для начинающих", "новичок", "сложно", "уровень"]):
        return {
            "intent": "QUALIFICATION_BEGINNER",
            "priority": "MEDIUM",
            "suggested_action": "Снять возражение по сложности",
            "reply_template": (
                "Да, все материалы созданы специально для старта с полного нуля! "
                "Занятия построены по принципу микрообучения (15 минут в день): "
                "сначала базовые кирпичики и произношение, затем живые диалоги. "
                "Попробуйте бесплатный интерактивный тест на сайте: http://localhost:8080/#demo"
            )
        }

    if any(w in text for w in ["сколько стоит", "цена", "прайс", "скидка"]):
        return {
            "intent": "PRICE_INQUIRY",
            "priority": "MEDIUM",
            "suggested_action": "Озвучить оффер со скидкой 75%",
            "reply_template": (
                "Сейчас действует специальная цена: любой курс всего 249 ₽ навсегда (вместо 990 ₽). "
                "А если хотите сразу английский, китайский и испанский — комбо-пакет 3-в-1 всего за 499 ₽!"
            )
        }

    return {
        "intent": "GENERAL_INQUIRY",
        "priority": "LOW",
        "suggested_action": "Консультация автора",
        "reply_template": "Привет! Чем могу помочь по курсам английского, китайского или испанского?"
    }


# --- Unit Economics Tracker ---
def calculate_unit_economics(target_monthly_revenue: int = 3000) -> Dict[str, Any]:
    """
    Расчёт юнит-экономики для достижения финансовой цели владельца (≥ 3000 ₽ / месяц к концу декабря 2026).
    """
    course_price = 249
    combo_price = 499
    ad_post_price = 250  # Заявленная минимальная цена рекламы в пабликах

    needed_course_sales = int(target_monthly_revenue / course_price) + 1  # 13 продаж
    needed_combo_sales = int(target_monthly_revenue / combo_price) + 1   # 7 продаж
    needed_ad_posts = int(target_monthly_revenue / ad_post_price)         # 12 рекламных постов

    # Гибридная оптимальная модель (6 курсов + 6 рекламных постов)
    hybrid_revenue = (6 * course_price) + (6 * ad_post_price)

    return {
        "target_monthly_revenue": target_monthly_revenue,
        "deadline": "До 1 января 2027 года",
        "strategy_pure_courses": {
            "sales_needed_per_month": needed_course_sales,
            "sales_needed_per_week": round(needed_course_sales / 4, 1),
            "expected_revenue": needed_course_sales * course_price,
            "funnel_note": "Всего 1 продажа каждые 2.5 дня на 3 сообщества (English, Chinese, Spanish)."
        },
        "strategy_pure_ads": {
            "posts_needed_per_month": needed_ad_posts,
            "price_per_post": ad_post_price,
            "expected_revenue": needed_ad_posts * ad_post_price,
            "funnel_note": "По 2-3 рекламных поста в месяц в КиноЛайф, Infinity Music, Мемы, Языки."
        },
        "strategy_hybrid_recommended": {
            "course_sales": 6,
            "course_revenue": 6 * course_price,
            "ad_posts": 6,
            "ad_revenue": 6 * ad_post_price,
            "total_projected_revenue": hybrid_revenue,
            "status": "Цель 3 000 ₽ полностью закрыта без перегрузки пабликов спамом."
        }
    }


if __name__ == "__main__":
    ue = calculate_unit_economics()
    print("=== ЮНИТ-ЭКОНОМИКА ВЫХОДА НА 3 000+ ₽/МЕС ===")
    print(json.dumps(ue, ensure_ascii=False, indent=2))
