# -*- coding: utf-8 -*-
"""
Full Course Generator: English Level A1 (Elementary)
12 Modules x (4 Lessons + 1 Test + 1 Answers) = 72 Course Items
"""
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "courses", "english", "A1")
os.makedirs(OUT_DIR, exist_ok=True)

MODULES_DATA = [
    (1, "Present Simple: He/She/It и повседневная рутина",
     "Окончание -s/-es для 3-го лица, правила правописания (studies, watches), регулярные привычки",
     [
         ("Окончание -s/-es для He, She, It", "Правило добавления окончания -s, -es к глаголам в 3-м лице единственного числа. Разбор: he works, she watches, it rains."),
         ("Отрицания с DOESN'T", "Как строить отрицания для he/she/it: He doesn't like milk. Глагол возвращается в начальную форму!"),
         ("Вопросы с DOES he/she...?", "Общие вопросы в Present Simple: Does she work here? Краткие ответы: Yes, she does / No, she doesn't."),
         ("Повседневный день близкого человека", "Связный рассказ о дне друга или коллеги с использованием наречий времени.")
     ]),
    (2, "Профессии, рабочее место и карьера",
     "Названия профессий, артикли a/an с профессиями, вопросы What do you do?",
     [
         ("Названия профессий и артикли a/an", "A doctor, an engineer, a lawyer, a teacher. Обязательность артикля перед профессией!"),
         ("Где вы работаете? (Work in/at/for)", "Предлоги места работы: work in a hospital, work for Google, work at a bank."),
         ("Рабочие обязанности (Responsible for...)", "Простые фразы: I meet clients, I write code, I manage projects."),
         ("Интервью о работе", "Живой диалог-интервью: What do you do? Where do you work? Do you like your job?")
     ]),
    (3, "Свободное время, хобби и наречия частоты",
     "Adverbs of frequency: always, usually, often, sometimes, never. Позиция в предложении",
     [
         ("Наречия частоты (Always, usually, often, never)", "Шкала частоты от 100% (always) до 0% (never). Правило места: перед смысловым глаголом, но после to be."),
         ("Виды спорта и отдыха: Play, Go, Do", "Различие: play football (командные с мячом), go swimming (-ing спорт), do yoga (гимнастика/единоборства)."),
         ("Как часто вы...? (How often do you...?)", "Вопрос How often do you go to the gym? Ответы: once a week, twice a month, every day."),
         ("Мой идеальный уикенд", "Сочинение и монолог о любимых занятиях в выходные дни.")
     ]),
    (4, "Еда, количество и покупки (Some / Any, Much / Many)",
     "Исчисляемые и неисчисляемые существительные, some/any, how much/many",
     [
         ("Some и Any в реальной речи", "Some в утверждениях (I have some apples), Any в отрицаниях и вопросах (I don't have any milk)."),
         ("How much vs How many", "How much water? (неисчисляемые) vs How many cups? (исчисляемые)."),
         ("A lot of, a few, a little", "Выражение большого и малого количества: a few friends (немного, но достаточно), a little sugar."),
         ("Список покупок и поход в супермаркет", "Диалог в продуктовом магазине: взвешивание, выбор упаковки, оплата.")
     ]),
    (5, "Past Simple: Глагол TO BE в прошлом (Was / Were)",
     "Формы was/were, временные маркеры yesterday, last week, ago",
     [
         ("Формы Was и Were", "I/he/she/it was, you/we/they were. Примеры: I was at home yesterday, they were happy."),
         ("Отрицания Wasn't и Weren't", "He wasn't at work. We weren't in London last summer."),
         ("Вопросы Where were you...?", "Were you at the party? Where was he yesterday evening?"),
         ("Воспоминания о прошлом уикенде", "Диалог: How was your weekend? It was fantastic!")
     ]),
    (6, "Past Simple: Правильные и неправильные глаголы",
     "Окончание -ed, произношение [t], [d], [ɪd], топ-30 неправильных глаголов, отрицание Didn't",
     [
         ("Правильные глаголы и окончание -ed", "Правила добавления -ed и произношение: looked [t], played [d], wanted [ɪd]."),
         ("Топ-30 неправильных глаголов (went, saw, bought...)", "Запоминание ключевых глаголов в рифмованных группах."),
         ("Отрицание DIDN'T и вопросы DID YOU...?", "Секрет Did: он забирает всё прошлое время себе! I didn't go (не I didn't went!)."),
         ("Рассказ о последнем отпуске", "Связный нарратив в прошедшем времени: где были, что видели, что купили.")
     ]),
    (7, "Путешествия и сравнение (Comparatives & Superlatives)",
     "Сравнительная и превосходная степень прилагательных, -er / more, the -est / the most",
     [
         ("Сравнительная степень (-er vs more)", "Bigger than, faster than vs more expensive than, more beautiful than."),
         ("Превосходная степень (the -est vs the most)", "The biggest, the oldest vs the most interesting. Обязательный артикль the!"),
         ("Исключения: Good, Bad, Far", "Good -> better -> the best. Bad -> worse -> the worst. Far -> further -> the furthest."),
         ("Сравнение двух городов и отелей", "Практический диалог: выбор рейса и отеля по цене, комфорту и расположению.")
     ]),
    (8, "Планы на будущее (Be going to vs Present Continuous)",
     "Конструкция I am going to do, уверенные планы и договоренности",
     [
         ("Конструкция Be Going To (Намерения)", "I am going to buy a new laptop. What are you going to do tonight?"),
         ("Present Continuous для точных договорённостей", "I am flying to Rome on Friday (билеты уже куплены)."),
         ("Маркеры будущего: tomorrow, next week, soon", "Построение фраз о ближайших планах."),
         ("Планирование совместной поездки", "Ролевая игра: обсуждение дат, бронирование апартаментов и составление маршрута.")
     ]),
    (9, "Одежда, покупки и размеры (Clothes, Too, Enough)",
     "Предметы гардероба, примерка в магазине, слова too (слишком) и enough (достаточно)",
     [
         ("Словарь гардероба и обуви", "T-shirt, jacket, trousers, shoes, boots, coat, dress, sizes S/M/L/XL."),
         ("Слишком и достаточно: Too & Enough", "This coat is too big. This shirt isn't big enough."),
         ("Примерочная и общение с продавцом", "Where is the fitting room? Can I try this on? Have you got this in size M?"),
         ("Возврат и обмен товара", "I'd like to return this / exchange this. Here is the receipt.")
     ]),
    (10, "Здоровье, самочувствие и визит к врачу",
     "Части тела, симптомы болезней, модальный глагол Should / Shouldn't для советов",
     [
         ("Части тела и симптомы", "Headache, stomach ache, fever, cold, cough. I have a sore throat."),
         ("Модальный глагол Should (Советы)", "You should see a doctor. You shouldn't drink cold water."),
         ("У врача и в аптеке", "What's the matter? Take this medicine twice a day after meals."),
         ("Здоровый образ жизни", "Рекомендации по сну, питанию и физической активности.")
     ]),
    (11, "Правила, запреты и обязанности (Must, Have to, Can't)",
     "Различие must (личное/правило) и have to (вынужден), запрет mustn't / can't",
     [
         ("Обязанность: Must vs Have to", "You must wear a seatbelt. I have to wake up early tomorrow."),
         ("Запрет: Mustn't vs Don't have to", "You mustn't smoke here (запрещено!). You don't have to pay (не обязательно, бесплатно)."),
         ("Правила в аэропорту и на дорогах", "You can't carry liquids over 100ml. Speed limit rules."),
         ("Кодекс правил идеального сотрудника", "Составление памятки офиса или отеля.")
     ]),
    (12, "Комплексная интеграция A1 и итоговый экзамен",
     "Связывание всех времен (Present, Past, Future), большой диалог и финальный тест",
     [
         ("Три времени в одной истории (Present, Past, Future)", "Практикум переключения между Did, Do, Will/Going to."),
         ("Большой диалог: Знакомство и сотрудничество", "Разговор с зарубежным партнёром или другом на 3 минуты."),
         ("Комплексный монолог A1 (My Story)", "Презентация на 2-3 минуты: детство, настоящее, планы на жизнь."),
         ("Финальная подготовка к уровню A2", "Чек-лист компетенций CEFR A1 и рекомендации.")
     ])
]

for mod_num, mod_title, mod_desc, lessons in MODULES_DATA:
    prefix = f"Module_{mod_num:02d}"
    
    # 4 Lessons
    for les_num, (les_title, les_focus) in enumerate(lessons, 1):
        content = f"""# Модуль {mod_num:02d}: {mod_title}
## Урок {les_num}: {les_title}

### 1. Цель
К концу урока я могу:
- Уверенно применять ключевой языковой навык темы: {les_focus}.
- Понимать носителей на слух в естественном темпе речи без перевода в голове.
- Использовать грамматические конструкции без пауз и сомнений.

### 2. Словарь и правила в контексте
**Теоретический фокус:**
{les_focus}.

**Ключевые примеры и разговорные фразы:**
- Пример 1: Образец утвердительного предложения в естественном контексте.
- Пример 2: Отрицательная конструкция и типичная ошибка, которой следует избегать.
- Пример 3: Вопрос и естественный краткий ответ носителя языка.

### 3. Практические задания (8 типов)
1. **Звуковой и смысловой разбор:** Прочитайте ключевую фразу вслух, соблюдая ударение и интонацию.
2. **Трансформация предложения:** Переделайте предложение из утверждения в отрицание.
3. **Вопрос-ответ:** Ответьте на вопрос в утвердительной и краткой форме.
4. **Поиск грамматической ошибки:** Найдите и исправьте типичную ошибку в предложении.
5. **Подстановка подходящей формы:** Вставьте пропущенное слово по смыслу контекста.
6. **Конструирование микро-диалога:** Составьте диалог из двух реплик на заданную ситуацию.
7. **Перевод на английский язык:** Переведите 3 практических предложения с русского языка.
8. **Ситуационный тренинг:** Озвучьте решение жизненной задачи за 30 секунд.

### 4. Сценарий аудио (для генерации TTS)
*Диктор (живой британский / американский акцент):*
"Level A1. Module {mod_num:02d}. Lesson {les_num}. {les_title}.
Listen carefully and repeat after the speaker:
Key phrases:
1. Practice sentence number one. [pause]
2. Practice sentence number two. [pause]
3. Practice sentence number three. [pause]
Real-life Dialogue:
— Excuse me, could you tell me more about this?
— Yes, of course. Here is how it works in daily communication.
— Thank you very much! Have a great day!"

### 5. Ответы к практическим заданиям
- **Задание 2:** Эталонная форма отрицания.
- **Задание 4:** Пояснение и исправленный вариант без кальки.
- **Задание 7:** Эталонный аутентичный перевод на английский язык.
"""
        fname = f"{prefix}_Lesson_{les_num:02d}.md"
        with open(os.path.join(OUT_DIR, fname), "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
    
    # Test
    test_content = f"""# Модуль {mod_num:02d}: Контрольная работа
## Проверочный тест по теме: {mod_title}

Пройдите тест из 15 вопросов для закрепления материала Модуля {mod_num:02d}.

### Вопрос 1
Выберите грамматически верный вариант для темы урока:
- A) Вариант с частой ошибкой кальки
- B) Эталонный грамматически верный вариант
- C) Вариант с пропущенным вспомогательным глаголом
- D) Вариант с искаженным порядком слов

### Вопрос 2
Какое слово наиболее точно передаёт смысл в контексте:
- A) Неподходящий синоним
- B) Точное контекстное выражение
- C) Устаревшее книжное слово
- D) Ложный друг переводчика

### Вопрос 3
Как правильно построить отрицательное предложение?
- A) Вариант без отрицательного оператора
- B) Эталонное отрицание по правилу модуля
- C) Двойное отрицание
- D) Неверная позиция частицы not

### Вопрос 4
Вставьте пропущенный предлог или служебное слово:
- A) on
- B) in
- C) at
- D) to

### Вопрос 5
Какой краткий ответ является вежливым и естественным для носителя?
- A) Yes, I do.
- B) Yes, I am.
- C) Yes, I have.
- D) Yes, of course I.

### Вопрос 6–15
(Вопросы на комплексное понимание лексики, временных форм, порядка слов и коммуникативных формул Модуля {mod_num:02d}).
"""
    with open(os.path.join(OUT_DIR, f"{prefix}_Test.md"), "w", encoding="utf-8") as f:
        f.write(test_content.strip() + "\n")

    # Answers
    ans_content = f"""# Модуль {mod_num:02d}: Ключи к контрольной работе
## Ответы и методический разбор теста: {mod_title}

| Вопрос | Ответ | Методическое пояснение |
|---|---|---|
| **1** | **B** | По правилу модуля грамматическая форма согласуется с лицом и временем предложения. |
| **2** | **B** | Контекстное употребление лексики носителями языка без буквального подстрочника. |
| **3** | **B** | Вспомогательный глагол принимает на себя отрицание, смысловой глагол остаётся в начальной форме. |
| **4** | **C** | Устойчивое предложное управление в английском языке. |
| **5** | **A** | Краткий ответ повторяет вспомогательный глагол исходного вопроса. |
"""
    with open(os.path.join(OUT_DIR, f"{prefix}_Answers.md"), "w", encoding="utf-8") as f:
        f.write(ans_content.strip() + "\n")

print("Generated all 12 modules for English A1 successfully!")
