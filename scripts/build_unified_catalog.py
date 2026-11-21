# -*- coding: utf-8 -*-
"""
Build Unified Multi-Language Catalog for NATIVE Courses Platform
Indexes all 5 languages, levels, modules, lessons, tests and answer keys.
"""
import os
import json

BASE_COURSES = "courses_site/courses"
CATALOG_PATH = "courses_site/data/courses_catalog.json"

catalog = {
    "languages": [
        {"id": "english", "name": "English", "flag": "🇬🇧", "title": "NATIVE English (A0–C2)"},
        {"id": "spanish", "name": "Español", "flag": "🇪🇸", "title": "NATIVE Spanish (A1–B2)"},
        {"id": "chinese", "name": "中文", "flag": "🇨🇳", "title": "NATIVE Chinese (HSK 1–4)"},
        {"id": "korean", "name": "한국어", "flag": "🇰🇷", "title": "NATIVE Korean (Базовый–TOPIK)"},
        {"id": "turkish", "name": "Türkçe", "flag": "🇹🇷", "title": "NATIVE Turkish (A1–B1)"}
    ]
}

def scan_module_files(dir_path, prefix, mod_id, mod_title):
    items = []
    # 4 Lessons
    for les_num in range(1, 5):
        fname = f"{prefix}_Lesson_{les_num:02d}.md"
        fpath = os.path.join(dir_path, fname)
        if os.path.exists(fpath):
            content = open(fpath, encoding="utf-8").read()
            title = f"Урок {les_num}"
            for line in content.splitlines():
                if line.startswith("## "):
                    title = line.replace("## ", "").strip()
                    break
            items.append({
                "id": f"{mod_id}_l{les_num}",
                "type": "lesson",
                "title": title,
                "file": fname,
                "content": content
            })
    # Test
    test_fname = f"{prefix}_Test.md"
    test_path = os.path.join(dir_path, test_fname)
    if os.path.exists(test_path):
        content = open(test_path, encoding="utf-8").read()
        items.append({
            "id": f"{mod_id}_test",
            "type": "test",
            "title": f"📝 Контрольная работа: {mod_title.split(':')[0]}",
            "file": test_fname,
            "content": content
        })
    # Answers
    ans_fname = f"{prefix}_Answers.md"
    ans_path = os.path.join(dir_path, ans_fname)
    if os.path.exists(ans_path):
        content = open(ans_path, encoding="utf-8").read()
        items.append({
            "id": f"{mod_id}_answers",
            "type": "answers",
            "title": f"🔑 Ключи и ответы: {mod_title.split(':')[0]}",
            "file": ans_fname,
            "content": content
        })
    return items

# 1. English A0
a0_modules = []
a0_meta = [
    ("m01", "Модуль 01: Алфавит с нуля", "Module_01", "26 букв, звуки, чтение имен"),
    ("m02", "Модуль 02: Первые согласные звуки", "Module_02", "Согласные b/p, d/t, f/v, s/z, m/n, l/r"),
    ("m03", "Модуль 03: Гласные и чтение слов", "Module_03", "Краткие гласные æ, e, ɪ, ɒ, ʌ, ʊ и CVC-слова"),
    ("m04", "Модуль 04: Буквосочетания и чтение", "Module_04", "sh, ch, th, ee, oo, Magic E"),
    ("m05", "Модуль 05: Приветствие и знакомство", "Module_05", "Приветствия, местоимения, to be в Present Simple"),
    ("m06", "Модуль 06: Числа и личная информация", "Module_06", "Числа 0-100, возраст, телефон, страна и email"),
    ("m07", "Модуль 07: Цвета и предметы вокруг", "Module_07", "Цвета, свойства, a/an, this/that/these/those"),
    ("m08", "Модуль 08: Семья и друзья", "Module_08", "Члены семьи, my/your/his/her, have got / has got"),
    ("m09", "Модуль 09: Дни, время и погода", "Module_09", "Дни недели, время o'clock, погода, распорядок"),
    ("m10", "Модуль 10: Действия и возможности", "Module_10", "Глаголы действия, don't, Do you...?, can/can't"),
    ("m11", "Модуль 11: Еда и предпочтения", "Module_11", "Продукты, I'd like..., Can I have...?, цены в кафе"),
    ("m12", "Модуль 12: Сборка первых диалогов", "Module_12", "Связующие слова, All About Me, экзамен A0")
]
for mid, title, prefix, focus in a0_meta:
    items = scan_module_files(os.path.join(BASE_COURSES, "english", "A0"), prefix, mid, title)
    a0_modules.append({
        "id": mid,
        "title": title,
        "status": "ready" if items else "planned",
        "focus": focus,
        "items": items
    })

# 2. English A1
a1_modules = []
a1_meta = [
    ("m01", "Модуль 01: Present Simple для He/She/It", "Module_01", "Окончание -s/-es, отрицания doesn't, вопросы Does"),
    ("m02", "Модуль 02: Профессии и рабочее место", "Module_02", "Артикли с профессиями, work in/at/for, интервью"),
    ("m03", "Модуль 03: Хобби и наречия частоты", "Module_03", "Always, usually, often, never, play/go/do"),
    ("m04", "Модуль 04: Еда и количество (Some/Any)", "Module_04", "Some, any, much, many, покупки в супермаркете"),
    ("m05", "Модуль 05: Past Simple: Was/Were", "Module_05", "Глагол to be в прошлом, yesterday, ago, диалоги"),
    ("m06", "Модуль 06: Past Simple: Глаголы и Didn't", "Module_06", "Окончание -ed, неправильные глаголы, didn't, did you"),
    ("m07", "Модуль 07: Сравнение: Comparatives", "Module_07", "Bigger than, more expensive, the best, the worst"),
    ("m08", "Модуль 08: Будущее время: Be going to", "Module_08", "Намерения, планы на отпуск, договоренности"),
    ("m09", "Модуль 09: Одежда, покупки и размеры", "Module_09", "Too, enough, примерочная, возврат товара"),
    ("m10", "Модуль 10: Здоровье и модальный Should", "Module_10", "Симптомы, советы у врача, аптека"),
    ("m11", "Модуль 11: Обязанности: Must и Have to", "Module_11", "Must, have to, запреты mustn't, правила аэропорта"),
    ("m12", "Модуль 12: Финальный экзамен уровня A1", "Module_12", "Интеграция трех времен, монолог My Story, экзамен")
]
for mid, title, prefix, focus in a1_meta:
    items = scan_module_files(os.path.join(BASE_COURSES, "english", "A1"), prefix, f"a1_{mid}", title)
    a1_modules.append({
        "id": f"a1_{mid}",
        "title": title,
        "status": "ready" if items else "planned",
        "focus": focus,
        "items": items
    })

# 3. Spanish
es_modules = []
es_titles = [
    "Модуль 01: Алфавит, звуки и приветствия", "Модуль 02: Глаголы Ser и Estar", "Модуль 03: В ресторане и заказ тапас",
    "Модуль 04: Повседневные глаголы -AR, -ER, -IR", "Модуль 05: Семья и притяжательные формы", "Модуль 06: Город и направления",
    "Модуль 07: Покупки, одежда и цвета", "Модуль 08: Хобби и глагол GUSTAR", "Модуль 09: Прошедшее Pretérito Indefinido",
    "Модуль 10: В отеле и путешествиях", "Модуль 11: Планы: Ir a + Infinitivo", "Модуль 12: Итоговый экзамен A1-B1"
]
for idx, title in enumerate(es_titles, 1):
    prefix = f"Module_{idx:02d}"
    mid = f"es_m{idx:02d}"
    items = scan_module_files(os.path.join(BASE_COURSES, "spanish"), prefix, mid, title)
    es_modules.append({
        "id": mid,
        "title": title,
        "status": "ready" if items else "planned",
        "focus": f"Испанская практическая программа: {title}",
        "items": items
    })

# 4. Chinese
zh_modules = []
zh_titles = [
    "Модуль 01: Пиньинь и 4 тона", "Модуль 02: Первые фразы и вежливость", "Модуль 03: Глагол 是 (Shì) и страны",
    "Модуль 04: Числа, цены 块 и телефон", "Модуль 05: Вопросительные частицы 吗 и 呢", "Модуль 06: Семья и частица 的 (De)",
    "Модуль 07: В ресторане и китайский чай", "Модуль 08: Время, дата и дни недели", "Модуль 09: Базовые действия и глагол 去",
    "Модуль 10: Модальный глагол 会 (Huì)", "Модуль 11: Предлог 在 (Zài) и локация", "Модуль 12: Финальный экзамен HSK 1"
]
for idx, title in enumerate(zh_titles, 1):
    prefix = f"Module_{idx:02d}"
    mid = f"zh_m{idx:02d}"
    items = scan_module_files(os.path.join(BASE_COURSES, "chinese"), prefix, mid, title)
    zh_modules.append({
        "id": mid,
        "title": title,
        "status": "ready" if items else "planned",
        "focus": f"Практический китайский: {title}",
        "items": items
    })

# 5. Korean
ko_modules = []
ko_titles = [
    "Модуль 01: Хангыль: Гласные и согласные", "Модуль 02: Патчим (받침) и слоги", "Модуль 03: Приветствия и этикет",
    "Модуль 04: Связка 이에요 / 예요", "Модуль 05: Падежи 은/는 и 이/가", "Модуль 06: Корейские и китайские числа",
    "Модуль 07: Вежливый стиль -아요 / -어요", "Модуль 08: В кафе и уличная еда", "Модуль 09: Место и направление (에 / 에서)",
    "Модуль 10: Отрицания 안 и 못", "Модуль 11: Желания: -고 싶어요", "Модуль 12: Итоговый экзамен уровня 1"
]
for idx, title in enumerate(ko_titles, 1):
    prefix = f"Module_{idx:02d}"
    mid = f"ko_m{idx:02d}"
    items = scan_module_files(os.path.join(BASE_COURSES, "korean"), prefix, mid, title)
    ko_modules.append({
        "id": mid,
        "title": title,
        "status": "ready" if items else "planned",
        "focus": f"Корейский разговорный: {title}",
        "items": items
    })

# 6. Turkish
tr_modules = []
tr_titles = [
    "Модуль 01: Турецкий алфавит и звуки", "Модуль 02: Гармония гласных (A/E, I/İ/U/Ü)", "Модуль 03: Приветствия и этикет",
    "Модуль 04: Множественное число (-lar/-ler)", "Модуль 05: Вопрос mı/mi/mu/mü", "Модуль 06: Числа и торг на базаре",
    "Модуль 07: Местный падеж -da / -de", "Модуль 08: Заказ в локанте и чай", "Модуль 09: Настоящее время -iyor",
    "Модуль 10: Падежи -dan/-den и -a/-e", "Модуль 11: Конструкция Var / Yok", "Модуль 12: Итоговый экзамен A1"
]
for idx, title in enumerate(tr_titles, 1):
    prefix = f"Module_{idx:02d}"
    mid = f"tr_m{idx:02d}"
    items = scan_module_files(os.path.join(BASE_COURSES, "turkish"), prefix, mid, title)
    tr_modules.append({
        "id": mid,
        "title": title,
        "status": "ready" if items else "planned",
        "focus": f"Турецкий разговорный: {title}",
        "items": items
    })

# Attach to catalog
catalog["english"] = {
    "title": "NATIVE English",
    "levels": {
        "A0": {"title": "A0 — Абсолютный ноль (Pre-A1)", "modules": a0_modules},
        "A1": {"title": "A1 — Начальный элементарный", "modules": a1_modules},
        "A2": {"title": "A2 — Предпороговый уровень", "modules": []},
        "B1": {"title": "B1 — Пороговый разговорный", "modules": []},
        "B2": {"title": "B2 — Уверенное владение", "modules": []},
        "C1": {"title": "C1 — Профессиональный", "modules": []},
        "C2": {"title": "C2 — Владение в совершенстве", "modules": []}
    }
}

catalog["spanish"] = {
    "title": "NATIVE Spanish",
    "levels": {
        "A1": {"title": "A1 — Испанский с нуля", "modules": es_modules},
        "A2": {"title": "A2 — Разговорный опыт", "modules": []},
        "B1": {"title": "B1 — Свободное общение", "modules": []}
    }
}

catalog["chinese"] = {
    "title": "NATIVE Chinese",
    "levels": {
        "HSK1": {"title": "HSK 1 — Базовый старт (150 слов)", "modules": zh_modules},
        "HSK2": {"title": "HSK 2 — Разговорный фундамент (300 слов)", "modules": []},
        "HSK3": {"title": "HSK 3 — Уверенная речь (600 слов)", "modules": []}
    }
}

catalog["korean"] = {
    "title": "NATIVE Korean",
    "levels": {
        "L1": {"title": "Ступень 1 — Хангыль и базовые фразы", "modules": ko_modules},
        "L2": {"title": "Ступень 2 — Разговорная речь и K-Drama", "modules": []},
        "L3": {"title": "Ступень 3 — TOPIK 1-2 и свободное общение", "modules": []}
    }
}

catalog["turkish"] = {
    "title": "NATIVE Turkish",
    "levels": {
        "A1": {"title": "A1 — Турецкий для жизни и путешествий", "modules": tr_modules},
        "A2": {"title": "A2 — Повседневный Стамбул", "modules": []},
        "B1": {"title": "B1 — Свободная речь и дискуссии", "modules": []}
    }
}

# Backwards compatibility for root A0/A1
catalog["A0"] = catalog["english"]["levels"]["A0"]
catalog["A1"] = catalog["english"]["levels"]["A1"]

with open(CATALOG_PATH, "w", encoding="utf-8") as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

total_items = (
    sum(len(m["items"]) for m in a0_modules) +
    sum(len(m["items"]) for m in a1_modules) +
    sum(len(m["items"]) for m in es_modules) +
    sum(len(m["items"]) for m in zh_modules) +
    sum(len(m["items"]) for m in ko_modules) +
    sum(len(m["items"]) for m in tr_modules)
)

print(f"Catalog rebuilt successfully! Total active course items across 5 languages: {total_items}")
