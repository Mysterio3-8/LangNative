import json
import os
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler

YOOKASSA_SHOP_ID = os.getenv("YOOKASSA_SHOP_ID", "1314296")
YOOKASSA_SECRET_KEY = os.getenv("YOOKASSA_SECRET_KEY", "")

COURSE_PRICES = {
    "spanish": 390,
    "english": 390,
    "chinese": 390,
    "spanish-base": 290,
    "english-base": 290,
    "chinese-base": 290,
    "spanish-full": 490,
    "english-full": 490,
    "chinese-full": 490,
}

RETURN_URL = "https://mysterio3-8.github.io/LangNative/download.html"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            req = json.loads(body.decode("utf-8")) if body else {}

            course_id = req.get("course_id", "english")
            email = req.get("email", "")
            amount = COURSE_PRICES.get(course_id, 390)

            # Direct fallback if secret key is not in Vercel env
            if not YOOKASSA_SECRET_KEY:
                simple_url = f"https://yookassa.ru/integration/simplepay?shopId={YOOKASSA_SHOP_ID}&sum={amount}&customerNumber={email or 'buyer'}"
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"confirmation_url": simple_url, "amount": amount}).encode("utf-8"))
                return

            # Call official YooKassa V3 API
            idempotence_key = str(uuid.uuid4())
            payload = {
                "amount": {"value": f"{amount}.00", "currency": "RUB"},
                "capture": True,
                "confirmation": {
                    "type": "redirect",
                    "return_url": RETURN_URL,
                },
                "description": f"Курс NATIVE ({course_id})",
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

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"confirmation_url": conf_url}).encode("utf-8"))

        except Exception as e:
            # Fallback to SimplePay
            amount = 390
            simple_url = f"https://yookassa.ru/integration/simplepay?shopId={YOOKASSA_SHOP_ID}&sum={amount}&customerNumber=buyer"
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"confirmation_url": simple_url, "error": str(e)}).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
