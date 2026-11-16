"""
Vercel Serverless Function: Admin Authentication & Security Gate
Validates master admin credentials using salted SHA-256 and rate limits brute-force attempts.
"""

from http.server import BaseHTTPRequestHandler
import json
import hashlib
import time

SALT = "native_salt_2026:"
# Precomputed hash for default PIN "2026"
DEFAULT_HASH = "e0b3c0ce5f66c6f36e6cb2373c20ad62905ed1cdb06a99cb5445b153f89ec37d"

# In-memory IP rate limiter for serverless instance
FAILED_ATTEMPTS = {}  # ip -> {"count": int, "lockout_until": float}


def compute_hash(pwd: str) -> str:
    raw = (SALT + pwd).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
        client_ip = self.headers.get("x-forwarded-for", "").split(",")[0].strip() or self.client_address[0]
        now = time.time()

        # Check IP lockout
        ip_state = FAILED_ATTEMPTS.get(client_ip, {"count": 0, "lockout_until": 0})
        if ip_state["lockout_until"] > now:
            wait_sec = int(ip_state["lockout_until"] - now)
            return self._send_json(429, {
                "error": "Too Many Requests",
                "message": f"Доступ заблокирован на {wait_sec} сек. из-за множества неверных попыток.",
                "retry_after": wait_sec
            })

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0 or content_length > 4096:
            return self._send_json(400, {"error": "Invalid request body"})

        try:
            body = self.rfile.read(content_length)
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            return self._send_json(400, {"error": "JSON parse error"})

        password = str(payload.get("password", "")).strip()
        if not password:
            return self._send_json(400, {"error": "Password required"})

        pwd_hash = compute_hash(password)
        if pwd_hash == DEFAULT_HASH:
            # Reset failed attempts
            FAILED_ATTEMPTS.pop(client_ip, None)
            return self._send_json(200, {
                "authorized": True,
                "token": pwd_hash,
                "expires_in": 1800
            })
        else:
            # Record failed attempt
            count = ip_state["count"] + 1
            lockout_until = 0
            if count >= 5:
                lockout_until = now + 900  # 15 minutes lockout
            elif count >= 3:
                lockout_until = now + 30   # 30 seconds delay

            FAILED_ATTEMPTS[client_ip] = {
                "count": count,
                "lockout_until": lockout_until
            }

            return self._send_json(401, {
                "authorized": False,
                "error": "Invalid password",
                "attempts_left": max(0, 5 - count)
            })
