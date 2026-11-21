import json
import os
import re
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler

YOOKASSA_SHOP_ID = os.getenv("YOOKASSA_SHOP_ID", "1314296")
YOOKASSA_SECRET_KEY = os.getenv("YOOKASSA_SECRET_KEY", "")

# Server-authoritative prices (cannot be overridden by client)
COURSE_PRICES = {
    "english": 390,
    "english-base": 290,
    "english-full": 490,
    "spanish": 390,
    "spanish-base": 290,
    "spanish-full": 490,
    "chinese": 390,
    "chinese-base": 290,
    "chinese-full": 490,
    "korean": 390,
    "korean-base": 290,
    "korean-full": 490,
    "turkish": 390,
    "turkish-base": 290,
    "turkish-full": 490,
}

RETURN_URL = "https://mysterio3-8.github.io/LangNative/download.html"
EMAIL_REGEX = re.compile(r"^[\w\.\+-]+@[\w\.-]+\.[a-zA-Z]{2,}$")


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 8192:
                return self._send_json(400, {"error": "Payload too large"})

            body = self.rfile.read(content_length)
            req = json.loads(body.decode("utf-8")) if body else {}

            raw_course_id = str(req.get("course_id", "english")).lower().strip()
            course_id = raw_course_id if raw_course_id in COURSE_PRICES else "english"
            
            raw_email = str(req.get("email", "")).strip()
            email = raw_email if (raw_email and EMAIL_REGEX.match(raw_email) and len(raw_email) <= 120) else ""

            # Server-verified amount (tamper-proof)
            amount = COURSE_PRICES.get(course_id, 390)

            # Direct fallback if secret key is not in Vercel env
            if not YOOKASSA_SECRET_KEY:
                customer_param = email if email else "buyer"
                simple_url = f"https://yookassa.ru/integration/simplepay?shopId={YOOKASSA_SHOP_ID}&sum={amount}&customerNumber={customer_param}"
                return self._send_json(200, {
                    "confirmation_url": simple_url,
                    "amount": amount,
                    "course_id": course_id,
                    "status": "pending"
                })

            # Call official YooKassa V3 API
            idempotence_key = str(uuid.uuid4())
            payload = {
                "amount": {"value": f"{amount}.00", "currency": "RUB"},
                "capture": True,
                "confirmation": {
                    "type": "redirect",
                    "return_url": RETURN_URL,
                },
                "description": f"Обучающий курс NATIVE ({course_id})",
            }
            if email:
                payload["receipt"] = {
                    "customer": {"email": email},
                    "items": [{
                        "description": f"Обучающий курс NATIVE ({course_id})",
                        "quantity": "1.00",
                        "amount": {"value": f"{amount}.00", "currency": "RUB"},
                        "vat_code": 1,
                        "payment_mode": "full_payment",
                        "payment_subject": "service",
                    }],
                }

            auth_str = f"{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}"
            import base64
            auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            req_obj = urllib.request.Request(
                "https://api.yookassa.ru/v3/payments",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Idempotence-Key": idempotence_key,
                    "Authorization": f"Basic {auth_b64}",
                },
                method="POST"
            )

            with urllib.request.urlopen(req_obj, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                conf_url = data.get("confirmation", {}).get("confirmation_url")

            return self._send_json(200, {
                "confirmation_url": conf_url,
                "amount": amount,
                "course_id": course_id
            })

        except Exception as e:
            # Fallback to SimplePay
            amount = 390
            simple_url = f"https://yookassa.ru/integration/simplepay?shopId={YOOKASSA_SHOP_ID}&sum={amount}&customerNumber=buyer"
            return self._send_json(200, {
                "confirmation_url": simple_url,
                "amount": amount,
                "course_id": "english"
            })
