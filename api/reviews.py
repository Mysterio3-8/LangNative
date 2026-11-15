import json
from http.server import BaseHTTPRequestHandler
from pathlib import Path

REVIEWS_FILE = Path(__file__).resolve().parent.parent / "data" / "reviews.json"

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            if REVIEWS_FILE.exists():
                with open(REVIEWS_FILE, "r", encoding="utf-8") as f:
                    reviews = json.load(f)
            else:
                reviews = []
        except Exception:
            reviews = []

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(reviews, ensure_ascii=False).encode("utf-8"))

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            new_review = json.loads(body.decode("utf-8"))

            reviews = []
            if REVIEWS_FILE.exists():
                try:
                    with open(REVIEWS_FILE, "r", encoding="utf-8") as f:
                        reviews = json.load(f)
                except Exception:
                    reviews = []

            reviews.insert(0, new_review)

            # Attempt saving
            try:
                with open(REVIEWS_FILE, "w", encoding="utf-8") as f:
                    json.dump(reviews, f, ensure_ascii=False, indent=2)
            except Exception:
                pass

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True, "review": new_review}, ensure_ascii=False).encode("utf-8"))
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
