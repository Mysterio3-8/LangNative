# -*- coding: utf-8 -*-
"""
Add Korean and Turkish quizzes to demo_quizzes.json
Progressive difficulty from absolute beginner to conversational.
"""
import json

PATH = "courses_site/data/demo_quizzes.json"

with open(PATH, "r", encoding="utf-8") as f:
    quizzes = json.load(f)

# Korean progressive test (10 questions)
quizzes["ko"] = [
    {
        "id": "ko_quiz_001",
        "level": "С нуля",
        "difficulty": "Начальный (С нуля)",
        "tag": "Корейский • Хангыль: Гласные",
        "question": "Какая буква хангыля обозначает звук [а]?",
        "subtext": "Выберите правильную букву:",
        "options": [
            {"text": "A) ㅏ", "correct": True},
            {"text": "B) ㅓ", "correct": False},
            {"text": "C) ㅗ", "correct": False},
            {"text": "D) ㅜ", "correct": False}
        ],
        "explanation": "ㅏ — это базовая корейская гласная [а]. Буква ㅓ читается как [о/э] (открытый о), ㅗ — как закрытый [о], ㅜ — как [у]."
    },
    {
        "id": "ko_quiz_002",
        "level": "С нуля",
        "difficulty": "Начальный (С нуля)",
        "tag": "Корейский • Приветствие",
        "question": "Как по-корейски вежливо сказать «Здравствуйте»?",
        "subtext": "Выберите вежливую разговорную форму:",
        "options": [
            {"text": "A) 안녕하세요 (Annyeonghaseyo)", "correct": True},
            {"text": "B) 감사합니다 (Kamsahamnida)", "correct": False},
            {"text": "C) 죄송합니다 (Joesonghamnida)", "correct": False},
            {"text": "D) 안녕 (Annyeong)", "correct": False}
        ],
        "explanation": "안녕하세요 (Annyeonghaseyo) — стандартное универсальное вежливое приветствие. 감사합니다 — это «спасибо», 죄송합니다 — «извините», а просто 안녕 — фамильярное «привет» только для близких друзей."
    },
    {
        "id": "ko_quiz_003",
        "level": "Ступень 1",
        "difficulty": "Базовый",
        "tag": "Корейский • Связка 이에요 / 예요",
        "question": "Вставьте правильную связку «являться кем-то»:\n«저는 학생____» (Я студент). Слово 학생 оканчивается на согласную (патчим ㅇ).",
        "subtext": "Выберите верное окончание:",
        "options": [
            {"text": "A) 이에요", "correct": True},
            {"text": "B) 예요", "correct": False},
            {"text": "C) 입니다", "correct": False},
            {"text": "D) 있어요", "correct": False}
        ],
        "explanation": "После согласной (с патчимом) всегда присоединяется 이에요 (학생이에요). Окончание 예요 используется только после гласных (например: 의사예요 — врач)."
    },
    {
        "id": "ko_quiz_004",
        "level": "Ступень 1",
        "difficulty": "Базовый",
        "tag": "Корейский • Заказ в кафе",
        "question": "Как сказать бариста: «Дайте это, пожалуйста»?",
        "subtext": "Выберите естественную речевую формулу:",
        "options": [
            {"text": "A) 이거 주세요 (Igeo juseyo)", "correct": True},
            {"text": "B) 이거 먹어요 (Igeo meogeoyo)", "correct": False},
            {"text": "C) 이거 있어요 (Igeo isseoyo)", "correct": False},
            {"text": "D) 이거 사요 (Igeo sayo)", "correct": False}
        ],
        "explanation": "이거 주세요 (Igeo juseyo) — золотая речевая формула заказа в любом кафе и магазине Кореи (буквально: «это + дайте, пожалуйста»)."
    },
    {
        "id": "ko_quiz_005",
        "level": "Ступень 2",
        "difficulty": "Средний",
        "tag": "Корейский • Желания -고 싶어요",
        "question": "Как перевести фразу: «Я хочу поехать в Корею»?",
        "subtext": "Выберите грамматически верный вариант:",
        "options": [
            {"text": "A) 한국에 가고 싶어요", "correct": True},
            {"text": "B) 한국에 가요", "correct": False},
            {"text": "C) 한국에 갔어요", "correct": False},
            {"text": "D) 한국에서 가요", "correct": False}
        ],
        "explanation": "Конструкция -고 싶어요 выражает желание субъекта («хочу сделать»). Глагол 가다 (идти/ехать) -> 가고 싶어요. С направлением движения используется падеж 에: 한국에."
    }
]

# Turkish progressive test (10 questions)
quizzes["tr"] = [
    {
        "id": "tr_quiz_001",
        "level": "A1",
        "difficulty": "Начальный (A1)",
        "tag": "Турецкий • Алфавит и звуки",
        "question": "Как произносится буква «Ç» в турецком слове «Çay» (чай)?",
        "subtext": "Выберите верный звук:",
        "options": [
            {"text": "A) Как русский звук [Ч]", "correct": True},
            {"text": "B) Как русский звук [С]", "correct": False},
            {"text": "C) Как русский звук [Ц]", "correct": False},
            {"text": "D) Как русский звук [К]", "correct": False}
        ],
        "explanation": "Буква Ç с хвостиком внизу всегда читается как четкий звук [Ч] (çay — чай, çok — очень). Обычная буква C читается как звонкий [ДЖ]."
    },
    {
        "id": "tr_quiz_002",
        "level": "A1",
        "difficulty": "Начальный (A1)",
        "tag": "Турецкий • Приветствия",
        "question": "Как сказать «Здравствуйте / Привет» по-турецки?",
        "subtext": "Выберите универсальное приветствие:",
        "options": [
            {"text": "A) Merhaba", "correct": True},
            {"text": "B) Günaydın", "correct": False},
            {"text": "C) Teşekkürler", "correct": False},
            {"text": "D) Güle güle", "correct": False}
        ],
        "explanation": "Merhaba — самое популярное и универсальное приветствие в Турции в любое время суток. Günaydın — «доброе утро», Teşekkürler — «спасибо»."
    },
    {
        "id": "tr_quiz_003",
        "level": "A1",
        "difficulty": "Базовый (A1)",
        "tag": "Турецкий • Гармония гласных: Множественное число",
        "question": "Какой аффикс множественного числа нужен слову «Kitap» (книга)? Последняя гласная — твердая «a».",
        "subtext": "Выберите правильный аффикс (-lar или -ler):",
        "options": [
            {"text": "A) Kitaplar", "correct": True},
            {"text": "B) Kitapler", "correct": False},
            {"text": "C) Kitapi", "correct": False},
            {"text": "D) Kitaplarim", "correct": False}
        ],
        "explanation": "По закону малой гармонии гласных: после твердых гласных (A, I, O, U) ставится аффикс -lar (kitaplar, arabalar). После мягких (E, İ, Ö, Ü) — аффикс -ler (evler, günler)."
    },
    {
        "id": "tr_quiz_004",
        "level": "A1-A2",
        "difficulty": "Средний",
        "tag": "Турецкий • Местный падеж: Где?",
        "question": "Как сказать «Я дома»? (Ev — дом, последняя гласная мягкая «e»).",
        "subtext": "Выберите правильную форму:",
        "options": [
            {"text": "A) Evdeyim", "correct": True},
            {"text": "B) Evdayım", "correct": False},
            {"text": "C) Evden", "correct": False},
            {"text": "D) Eve", "correct": False}
        ],
        "explanation": "Местный падеж отвечает на вопрос Nerede? (Где?). Корень ev (дом) + падеж -de (в доме) + соединительная y + аффикс 1-го лица -im: Evdeyim (Я дома)."
    },
    {
        "id": "tr_quiz_005",
        "level": "A2",
        "difficulty": "Средний",
        "tag": "Турецкий • Наличие: Var / Yok",
        "question": "Как вежливо спросить в отеле или кафе: «Есть ли у вас Wi-Fi?»?",
        "subtext": "Выберите естественный вопрос носителей:",
        "options": [
            {"text": "A) Wi-Fi var mı?", "correct": True},
            {"text": "B) Wi-Fi yok mu?", "correct": False},
            {"text": "C) Wi-Fi nerede?", "correct": False},
            {"text": "D) Wi-Fi kaç para?", "correct": False}
        ],
        "explanation": "Конструкция Var mı? переводится «Есть ли...?». Вопросительная частица mı согласуется по гармонии с твердой гласной слова."
    }
]

with open(PATH, "w", encoding="utf-8") as f:
    json.dump(quizzes, f, ensure_ascii=False, indent=2)

print("Added Korean and Turkish quizzes to demo_quizzes.json successfully!")
