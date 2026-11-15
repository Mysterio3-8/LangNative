"""
NATIVE Edu — Интеллектуальный модуль автомодерации отзывов
Защита от заказного хейта, накрутки конкурентов, спама и троллинга.
"""

import re
import json
from pathlib import Path
from typing import Dict, Any, Tuple

BASE_DIR = Path(__file__).resolve().parent
REVIEWS_FILE = BASE_DIR / "data" / "reviews.json"

# Стоп-слова заказного хейта, спама и мата
TROLL_STOPWORDS = [
    "лохотрон", "скам", "кидалово", "развод", "обман", "мошенник", "говно", 
    "дерьмо", "параша", "наеб", "хуй", "пизд", "ебат", "сука", "блят",
    "казино", "ставка", "крипт", "1xbet", "заработай", "секс", "интим",
    "fake", "scam", "shitty", "bullshit"
]

SPAM_URL_PATTERN = re.compile(r"(https?://|www\.|t\.me/|vk\.com/|bit\.ly/)", re.IGNORECASE)
REPETITIVE_CHARS_PATTERN = re.compile(r"(.)\1{4,}")


def auto_moderate_review(review: Dict[str, Any]) -> Tuple[str, str]:
    """
    Проверяет отзыв на спам, токсичность и накрутку хейта.
    Возвращает (verdict, reason):
    - 'approved': честный положительный/конструктивный отзыв -> публикуется сразу.
    - 'rejected': заказной хейт, спам, мат -> автоблокировка, не публикуется.
    - 'pending': требует ручного подтверждения владельцем в админке.
    """
    text = (review.get("text") or "").strip()
    name = (review.get("name") or "").strip()
    rating = int(review.get("rating", 5))

    # 1. Проверка длины текста (защита от бессмысленных накруток)
    if len(text) < 15:
        return "rejected", "Текст отзыва слишком короткий или не содержит аргументации"

    if len(text) > 2000:
        return "rejected", "Превышена максимальная длина отзыва"

    # 2. Проверка на спам-ссылки и рекламу
    if SPAM_URL_PATTERN.search(text):
        return "rejected", "Обнаружены рекламные или спам-ссылки"

    # 3. Проверка на бессмысленный флуд / залипание клавиш
    if REPETITIVE_CHARS_PATTERN.search(text):
        return "rejected", "Обнаружен бессмысленный повтор символов (флуд)"

    text_lower = text.lower()

    # 4. Проверка на мат, токсичность и стоп-слова заказного хейта
    for stopword in TROLL_STOPWORDS:
        if stopword in text_lower:
            return "rejected", f"Сработал контентный фильтр: стоп-слово «{stopword}»"

    # 5. Анализ рейтинга и умысла:
    # Если рейтинг 4 или 5 звёзд и текст прошёл проверки — одобряем моментально
    if rating >= 4:
        return "approved", "Отзыв успешно прошёл автомодерацию"

    # Если рейтинг 1-3 звезды без мата, но критический — отправляем на премодерацию владельцу
    # Ни в коем случае не публикуем на витрину до проверки владельцем!
    return "pending", "Отзыв с низким рейтингом отправлен на ручную проверку администратором"


def save_review(review_data: Dict[str, Any]) -> Dict[str, Any]:
    verdict, reason = auto_moderate_review(review_data)
    review_data["status"] = verdict
    review_data["moderation_reason"] = reason

    try:
        if REVIEWS_FILE.is_file():
            reviews = json.loads(REVIEWS_FILE.read_text(encoding="utf-8"))
        else:
            reviews = []
    except Exception:
        reviews = []

    reviews.insert(0, review_data)
    REVIEWS_FILE.parent.mkdir(parents=True, exist_ok=True)
    REVIEWS_FILE.write_text(json.dumps(reviews, ensure_ascii=False, indent=2), encoding="utf-8")

    return review_data
