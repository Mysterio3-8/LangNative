import os
import json

a0_dir = 'courses_site/courses/english/A0'
catalog = json.load(open('courses_site/data/courses_catalog.json', encoding='utf-8'))

modules_meta = [
    {'id': 'm01', 'title': 'Модуль 01: Алфавит с нуля', 'status': 'ready', 'prefix': 'Module_01', 'focus': '26 букв, базовые звуки, чтение имен'},
    {'id': 'm02', 'title': 'Модуль 02: Первые согласные звуки', 'status': 'ready', 'prefix': 'Module_02', 'focus': 'Взрывные и щелевые согласные b/p, d/t, f/v, s/z, m/n, l/r'},
    {'id': 'm03', 'title': 'Модуль 03: Гласные и чтение слов', 'status': 'ready', 'prefix': 'Module_03', 'focus': 'Краткие гласные æ, e, ɪ, ɒ, ʌ, ʊ и CVC-слова'},
    {'id': 'm04', 'title': 'Модуль 04: Буквосочетания и чтение', 'status': 'ready', 'prefix': 'Module_04', 'focus': 'Буквосочетания sh, ch, th, ee, oo, Magic E'},
    {'id': 'm05', 'title': 'Модуль 05: Приветствие и знакомство', 'status': 'ready', 'prefix': 'Module_05', 'focus': 'Формулы приветствий, личные местоимения, to be в настоящем времени'},
    {'id': 'm06', 'title': 'Модуль 06: Числа и личная информация', 'status': 'ready', 'prefix': 'Module_06', 'focus': 'Числа 0-100, возраст, телефон, страна и email'},
    {'id': 'm07', 'title': 'Модуль 07: Цвета и предметы вокруг', 'status': 'ready', 'prefix': 'Module_07', 'focus': 'Цвета, свойства, артикли a/an, this/that/these/those'},
    {'id': 'm08', 'title': 'Модуль 08: Семья и друзья', 'status': 'ready', 'prefix': 'Module_08', 'focus': 'Члены семьи, my/your/his/her, have got / has got'},
    {'id': 'm09', 'title': 'Модуль 09: Дни, время и погода', 'status': 'ready', 'prefix': 'Module_09', 'focus': 'Дни недели, время по часам, погода, распорядок дня'},
    {'id': 'm10', 'title': 'Модуль 10: Действия и возможности', 'status': 'ready', 'prefix': 'Module_10', 'focus': 'Базовые глаголы действий, отрицания don’t, вопросы Do you...?, can/can’t'},
    {'id': 'm11', 'title': 'Модуль 11: Еда и предпочтения', 'status': 'ready', 'prefix': 'Module_11', 'focus': 'Базовые продукты, I’d like..., Can I have...?, цены и заказ в кафе'},
    {'id': 'm12', 'title': 'Модуль 12: Сборка первых диалогов', 'status': 'ready', 'prefix': 'Module_12', 'focus': 'Связующие слова and/but/because/so, рассказ All About Me, реальные диалоги, итоговый экзамен'}
]

for m in modules_meta:
    prefix = m['prefix']
    mid = m['id']
    items = []
    for num in range(1, 5):
        fname = f"{prefix}_Lesson_0{num}.md"
        fpath = os.path.join(a0_dir, fname)
        if os.path.exists(fpath):
            txt = open(fpath, encoding='utf-8').read()
            title = f"Урок {num}"
            for l in txt.splitlines():
                if l.startswith("## "):
                    title = l.replace("## ", "").strip()
                    break
            items.append({
                'id': f"{mid}_l{num}",
                'type': 'lesson',
                'title': title,
                'file': fname,
                'content': txt
            })
    
    test_fname = f"{prefix}_Test.md"
    test_path = os.path.join(a0_dir, test_fname)
    if os.path.exists(test_path):
        test_txt = open(test_path, encoding='utf-8').read()
        items.append({
            'id': f"{mid}_test",
            'type': 'test',
            'title': f"📝 Контрольная работа: {m['title'].split(':')[0]}",
            'file': test_fname,
            'content': test_txt
        })

    ans_fname = f"{prefix}_Answers.md"
    ans_path = os.path.join(a0_dir, ans_fname)
    if os.path.exists(ans_path):
        ans_txt = open(ans_path, encoding='utf-8').read()
        items.append({
            'id': f"{mid}_answers",
            'type': 'answers',
            'title': f"🔑 Ключи и ответы: {m['title'].split(':')[0]}",
            'file': ans_fname,
            'content': ans_txt
        })
    m['items'] = items

catalog['A0']['modules'] = modules_meta

with open('courses_site/data/courses_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

total_items = sum(len(m.get('items', [])) for m in modules_meta)
print(f'Updated catalog with ALL 12 Modules successfully! Total items: {total_items}')
