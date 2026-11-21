import json
import html
import time
from http.server import BaseHTTPRequestHandler
from pathlib import Path

REVIEWS_FILE = Path(__file__).resolve().parent.parent / "data" / "reviews.json"
FAILED_POSTS = {} # ip -> last_timestamp


def sanitize_text(text: str, max_length: int = 500) -> str:
    if not isinstance(text, str):
        return ""
    # Strip dangerous HTML tags and convert entities
    cleaned = html.escape(text.strip())
    return cleaned[:max_length]


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict | list):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        try:
            if REVIEWS_FILE.exists():
                with open(REVIEWS_FILE, "r", encoding="utf-8") as f:
                    reviews = json.load(f)
            else:
                reviews = []
        except Exception:
            reviews = []

        self._send_json(200, reviews)

    def do_POST(self):
        client_ip = self.headers.get("x-forwarded-for", "").split(",")[0].strip() or self.client_address[0]
        now = time.time()

        # Rate limiting: 1 review per 30 seconds per IP
        last_post = FAILED_POSTS.get(client_ip, 0)
        if now - last_post < 30:
            return self._send_json(429, {"error": "Слишком частая отправка. Пожалуйста, подождите 30 секунд."})

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 4096:
                return self._send_json(400, {"error": "Текст отзыва слишком длинный"})

            body = self.rfile.read(content_length)
            raw_review = json.loads(body.decode("utf-8")) if body else {}

            author = sanitize_text(str(raw_review.get("author", "Аноним")), max_length=50)
            text = sanitize_text(str(raw_review.get("text", "")), max_length=600)
            course = sanitize_text(str(raw_review.get("course", "NATIVE English")), max_length=60)
            city = sanitize_text(str(raw_review.get("city", "Москва")), max_length=50)

            try:
                rating = max(1, min(5, int(raw_review.get("rating", 5))))
            except Exception:
                rating = 5

            if not text or len(text) < 5:
                return self._send_json(400, {"error": "Текст отзыва слишком короткий"})

            clean_review = {
                "id": str(int(now * 1000)),
                "author": author or "Ученик NATIVE",
                "city": city,
                "course": course,
                "rating": rating,
                "text": text,
                "date": time.strftime("%d.%m.%Y"),
                "verified": True
            }

            reviews = []
            if REVIEWS_FILE.exists():
                try:
                    with open(REVIEWS_FILE, "r", encoding="utf-8") as f:
                        reviews = json.load(f)
                except Exception:
                    reviews = []

            reviews.insert(0, clean_review)
            FAILED_POSTS[client_ip] = now

            # Save
            try:
                with open(REVIEWS_FILE, "w", encoding="utf-8") as f:
                    json.dump(reviews, f, ensure_ascii=False, indent=2)
            except Exception:
                pass

            self._send_json(200, {"ok": True, "review": clean_review})

        except Exception as e:
            self._send_json(500, {"error": "Внутренняя ошибка сервера"})
