/* ==========================================================================
   NATIVE Edu — Interactive Diagnostic Level Trainer & Course Matcher
   Refactored, Lightweight & Modular Architecture
   ========================================================================== */

(function () {
  const TOTAL_STEPS = 3;
  const STEP_DIFFICULTIES = [
    "Базовый уровень (A0 → A1)",
    "Средний уровень (A1 → A2)",
    "Разговорный уровень (A2 → B1+)"
  ];

  const COURSE_PRICE_MAP = {
    spanish: "290 ₽",
    english: "390 ₽",
    chinese: "490 ₽",
    bundle: "790 ₽"
  };

  const RECOMMENDATIONS = {
    en: {
      low: {
        level: "A0–A1 (Начальный)",
        trophy: "🌱",
        diagnosis: "Вам пока трудно даются времена и речевые связки. В курсе NATIVE English модуль уровня A0-A1 поставит базовые кирпичики Oxford 3000 и произношение, а следующие ступени доведут до свободного B2-C1.",
        courseId: "english",
        courseName: "NATIVE English (A0 → C1: Все уровни)",
        courseFocus: "Рекомендованный фокус: Экспресс-старт с нуля, 500 частых слов, речевые связки и тренировка 5 навыков навсегда."
      },
      mid: {
        level: "A1–A2 (Базовый разговорный)",
        trophy: "🚀",
        diagnosis: "У вас отличный фундамент базовых слов, но вы спотыкаетесь на предлогах и временах. В курсе NATIVE English модули A2-B1 уберут перевод в голове, добавят чтение живых текстов и аудирование.",
        courseId: "english",
        courseName: "NATIVE English (A0 → C1: Все уровни)",
        courseFocus: "Рекомендованный фокус: Разговорные чанки носителей, преодоление языкового барьера и восприятие речи на слух."
      },
      high: {
        level: "A2–B1+ (Уверенный разговорный)",
        trophy: "🏆",
        diagnosis: "Великолепная интуиция! Продвинутые блоки курса B2–C1 прокачают понимание быстрой уличной речи сквозь городской шум, современный сленг сериалов, идиомы и свободную спонтанную речь.",
        courseId: "english",
        courseName: "NATIVE English (A0 → C1: Все уровни)",
        courseFocus: "Рекомендованный фокус: Сленг сериалов, идиомы, техника Shadowing и восприятие любых акцентов на слух."
      }
    },
    cn: {
      low: {
        level: "HSK 1 (С нуля)",
        trophy: "🌱",
        diagnosis: "Иероглифика и тоны часто пугают новичков. Курс NATIVE Chinese разложит черты по полочкам, поставит 4 тона с помощью аудио-тренажера и проведет через все ступени до HSK 5.",
        courseId: "chinese",
        courseName: "NATIVE Chinese (HSK 1 → 5: Все уровни)",
        courseFocus: "Рекомендованный фокус: 150 базовых иероглифов HSK 1, правила пиньиня и слуховой тренажер 4 тонов от носителя Yunxi."
      },
      mid: {
        level: "HSK 1–2 (Начальный разговорный)",
        trophy: "🚀",
        diagnosis: "Вы узнаете базовые иероглифы, но путаете созвучные морфемы. В блоках HSK 2-3 вы наработаете беглость чтения вывесок и меню без пиньиня, живые диалоги в такси и WeChat-переписку.",
        courseId: "chinese",
        courseName: "NATIVE Chinese (HSK 1 → 5: Все уровни)",
        courseFocus: "Рекомендованный фокус: Набор 600+ иероглифов, разговорные шаблоны покупок, ориентации в городе и устойчивые связки."
      },
      high: {
        level: "HSK 2–3 (Уверенная база)",
        trophy: "🏆",
        diagnosis: "Отличный результат! Вы чувствуете структуру китайского предложения. Продвинутые модули HSK 4-5 помогут освоить идиомы чэнъюй, чтение прессы и восприятие быстрой речи носителей.",
        courseId: "chinese",
        courseName: "NATIVE Chinese (HSK 1 → 5: Все уровни)",
        courseFocus: "Рекомендованный фокус: Расширение словаря до 1 200+ иероглифов, чтение живых текстов и свободное аудирование."
      }
    },
    es: {
      low: {
        level: "A0–A1 (Старт с нуля)",
        trophy: "🌱",
        diagnosis: "Разница между Ser и Estar часто пугает новичков. Курс NATIVE Spanish избавит от зубрежки таблиц спряжений формулой «Voy a + инф.», даст 100 ключевых глаголов и проведет по всем уровням до B2.",
        courseId: "spanish",
        courseName: "NATIVE Spanish (A1 → B2: Все уровни)",
        courseFocus: "Рекомендованный фокус: 100 ключевых глаголов, формула заказа ¿Me pones...? и старт говорения с первых минут."
      },
      mid: {
        level: "A1–A2 (Базовый туристический)",
        trophy: "🚀",
        diagnosis: "У вас хорошая база. В блоках A2-B1 вы наберете запас до 1 500 слов, разберете аутентичные ресторанные чеки и научитесь понимать быструю речь барменов и кассиров за 5 секунд.",
        courseId: "spanish",
        courseName: "NATIVE Spanish (A1 → B2: Все уровни)",
        courseFocus: "Рекомендованный фокус: Практические диалоги для путешествий, связки и бытовые разговорные конструкции."
      },
      high: {
        level: "A2–B1 (Разговорный для жизни)",
        trophy: "🏆",
        diagnosis: "Блестяще! В продвинутых блоках B1–B2 вы освоите сослагательное наклонение Subjuntivo без страха, сленг Испании и Латама, а также спонтанную речь без неловких пауз.",
        courseId: "spanish",
        courseName: "NATIVE Spanish (A1 → B2: Все уровни)",
        courseFocus: "Рекомендованный фокус: Живые идиомы, сленг носителей Испании и Латинской Америки без языкового барьера."
      }
    }
  };

  // Embedded Safe Fallback Dataset (3 core questions per language)
  const FALLBACK_QUIZZES = {
    en: [
      {
        tag: "Английский • Грамматика носителей",
        question: "Что пропущено в предложении?\n«I'm really looking forward ____ you.»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) to seeing", correct: true },
          { text: "B) to see", correct: false },
          { text: "C) for seeing", correct: false },
          { text: "D) seeing", correct: false }
        ],
        explanation: "to seeing — после фразового оборота «look forward to» глагол всегда идёт с окончанием -ing (герундий)."
      },
      {
        tag: "Английский • Времена & Предлоги",
        question: "Какое слово пропущено в предложении?\n«She has been working here ____ 2019.»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) for", correct: false },
          { text: "B) since", correct: true },
          { text: "C) from", correct: false },
          { text: "D) during", correct: false }
        ],
        explanation: "since — используется для указания конкретной точки отсчёта в прошлом (since 2019)."
      },
      {
        tag: "Английский • Устойчивые коллокации",
        question: "Какое слово пропущено в предложении?\n«Can you ____ me a favour?»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) make", correct: false },
          { text: "B) give", correct: false },
          { text: "C) do", correct: true },
          { text: "D) take", correct: false }
        ],
        explanation: "do — устойчивое словосочетание носителей «do someone a favour» (оказать услугу)."
      }
    ],
    cn: [
      {
        tag: "Китайский • HSK 1-2 Различия",
        question: "Какой иероглиф пропущен?\n我们明天____见。\n[Wǒmen míngtiān ____ jiàn.]",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) 在 [zài]", correct: false },
          { text: "B) 再 [zài]", correct: true },
          { text: "C) 还 [hái]", correct: false },
          { text: "D) 也 [yě]", correct: false }
        ],
        explanation: "再 (zài) — «снова, ещё раз»: 明天再见 (до завтра)."
      },
      {
        tag: "Китайский • Вопросительные слова",
        question: "Какое вопросительное слово пропущено?\n这本书____钱？\n[Zhè běn shū ____ qián?]",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) 什么 [shénme]", correct: false },
          { text: "B) 哪里 [nǎli]", correct: false },
          { text: "C) 多少 [duōshao]", correct: true },
          { text: "D) 怎么 [zěnme]", correct: false }
        ],
        explanation: "多少 (duōshao) — «сколько»: 多少钱？ — универсальный вопрос о цене в Китае."
      },
      {
        tag: "Китайский • Сравнительные конструкции",
        question: "Какое слово пропущено в конструкции с 比?\n他比我____。\n[Tā bǐ wǒ ____.]",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) 很高 [hěn gāo]", correct: false },
          { text: "B) 高 [gāo]", correct: true },
          { text: "C) 非常高 [fēicháng gāo]", correct: false },
          { text: "D) 最高 [zuì gāo]", correct: false }
        ],
        explanation: "高 (gāo) — в сравнительных предложениях с предлогом 比 нельзя ставить усилительные наречия 很 или 非常."
      }
    ],
    es: [
      {
        tag: "Испанский • Разница Ser и Estar",
        question: "¿Cuál es la palabra correcta?\n«Yo ____ estudiante de español en la universidad.»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) soy", correct: true },
          { text: "B) estoy", correct: false },
          { text: "C) tengo", correct: false },
          { text: "D) hago", correct: false }
        ],
        explanation: "soy — глагол ser (yo soy) используется для профессии и постоянных характеристик."
      },
      {
        tag: "Испанский • Местоположение в моменте",
        question: "Какое слово пропущено?\n«¿Dónde ____ las llaves del coche?»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) son", correct: false },
          { text: "B) están", correct: true },
          { text: "C) tienen", correct: false },
          { text: "D) hacen", correct: false }
        ],
        explanation: "están — глагол estar (están) используется для указания местоположения предметов."
      },
      {
        tag: "Испанский • Разговорные формулы заказа",
        question: "Какая фраза носителя подходит для заказа кофе в баре?\n«____ un café con leche, por favor.»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) ¿Me pones", correct: true },
          { text: "B) Yo quiero", correct: false },
          { text: "C) Dame", correct: false },
          { text: "D) Necesito", correct: false }
        ],
        explanation: "«¿Me pones...?» — естественная, вежливая и живая формула заказа в Испании."
      }
    ]
  };

  function initTrainer() {
    let demoData = FALLBACK_QUIZZES;
    let currentLang = "en";
    let currentStep = 0;
    let userScore = 0;
    let recommendedCourseId = "english";

    // Attempt to load full quiz database asynchronously
    fetch("data/demo_quizzes.json")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.en && data.cn && data.es) {
          demoData = data;
          renderCurrentQuestion();
        }
      })
      .catch(() => {});

    // DOM Elements
    const demoQuizView = document.getElementById("demo-quiz-view");
    const demoResultCard = document.getElementById("demo-result-card");
    const demoStepLabel = document.getElementById("demo-step-label");
    const demoDifficultyLabel = document.getElementById("demo-difficulty-label");
    const demoProgressFill = document.getElementById("demo-progress-fill");
    const demoScoreChip = document.getElementById("demo-score-chip");
    const demoTag = document.getElementById("demo-tag");
    const demoQuestion = document.getElementById("demo-question");
    const demoSubtext = document.getElementById("demo-subtext");
    const demoOptionsContainer = document.getElementById("demo-options");
    const demoFeedback = document.getElementById("demo-feedback");
    const demoNextBox = document.getElementById("demo-next-box");
    const btnNextDemoQuiz = document.getElementById("btn-next-demo-quiz");
    const btnNextText = document.getElementById("btn-next-text");
    const btnRetryQuiz = document.getElementById("btn-retry-quiz");
    const btnResultBuy = document.getElementById("btn-result-buy");
    const tabBtns = document.querySelectorAll(".demo-tab, .demo-tab-btn");

    function renderCurrentQuestion() {
      const items = demoData[currentLang] || [];
      if (!items.length) return;

      if (demoQuizView) demoQuizView.style.display = "block";
      if (demoResultCard) demoResultCard.style.display = "none";
      if (demoNextBox) demoNextBox.style.display = "none";

      const questionData = items[currentStep % items.length];
      const progressPercent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

      if (demoStepLabel) demoStepLabel.textContent = `Вопрос ${currentStep + 1} из ${TOTAL_STEPS}`;
      if (demoDifficultyLabel) demoDifficultyLabel.textContent = STEP_DIFFICULTIES[currentStep] || "Тест уровня";
      if (demoProgressFill) demoProgressFill.style.width = `${progressPercent}%`;
      if (demoScoreChip) demoScoreChip.textContent = `Баллы: ${userScore} / ${TOTAL_STEPS}`;
      if (demoTag) demoTag.textContent = questionData.tag || "Тест уровня";

      if (demoQuestion) {
        if (typeof window.setSafeMultilineText === "function") {
          window.setSafeMultilineText(demoQuestion, questionData.question);
        } else {
          demoQuestion.textContent = questionData.question;
        }
      }

      if (demoSubtext) {
        demoSubtext.textContent = questionData.subtext || questionData.translation || "Выберите правильный вариант:";
      }

      if (demoFeedback) {
        demoFeedback.textContent = "";
        demoFeedback.style.display = "none";
        demoFeedback.className = "demo-explanation";
      }

      if (demoOptionsContainer) {
        demoOptionsContainer.textContent = "";
        (questionData.options || []).forEach(opt => {
          const btn = document.createElement("button");
          btn.className = "demo-opt";

          const textSpan = document.createElement("span");
          textSpan.textContent = opt.text;
          const statusSpan = document.createElement("span");
          statusSpan.className = "opt-status";

          btn.appendChild(textSpan);
          btn.appendChild(statusSpan);
          btn.addEventListener("click", () => handleAnswer(btn, opt.correct, questionData.explanation));
          demoOptionsContainer.appendChild(btn);
        });
      }

      tabBtns.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
      });
    }

    function handleAnswer(selectedBtn, isCorrect, explanation) {
      const buttons = demoOptionsContainer.querySelectorAll(".demo-opt");
      buttons.forEach(b => b.disabled = true);

      if (isCorrect) {
        userScore++;
        selectedBtn.classList.add("correct");
        const status = selectedBtn.querySelector(".opt-status");
        if (status) status.textContent = "✓ Верно";
      } else {
        selectedBtn.classList.add("incorrect");
        const status = selectedBtn.querySelector(".opt-status");
        if (status) status.textContent = "✗ Ошибка";

        // Highlight correct button
        buttons.forEach(b => {
          const optText = b.querySelector("span") ? b.querySelector("span").textContent : "";
          if (explanation && explanation.includes(optText.split(")")[1] ? optText.split(")")[1].trim().split(" ")[0] : "---")) {
            b.classList.add("correct");
          }
        });
      }

      if (demoScoreChip) demoScoreChip.textContent = `Баллы: ${userScore} / ${TOTAL_STEPS}`;

      if (demoFeedback) {
        demoFeedback.textContent = (isCorrect ? "Отлично! " : "Пояснение: ") + (explanation || "");
        demoFeedback.className = `demo-explanation ${isCorrect ? "show-correct" : "show-incorrect"}`;
      }

      if (demoNextBox) {
        demoNextBox.style.display = "block";
        if (btnNextText) {
          btnNextText.textContent = (currentStep + 1 >= TOTAL_STEPS) ? "Посмотреть результат теста" : "Следующий вопрос";
        }
      }
    }

    function showResults() {
      if (demoQuizView) demoQuizView.style.display = "none";
      if (demoResultCard) demoResultCard.style.display = "block";

      let rank = "low";
      if (userScore === TOTAL_STEPS) rank = "high";
      else if (userScore >= 1) rank = "mid";

      const rec = (RECOMMENDATIONS[currentLang] || RECOMMENDATIONS.en)[rank];
      recommendedCourseId = rec.courseId;

      const badgeIcon = document.getElementById("result-badge-icon");
      const levelTitle = document.getElementById("result-level-title");
      const scoreText = document.getElementById("result-score-text");
      const diagnosisText = document.getElementById("result-diagnosis-text");
      const courseName = document.getElementById("result-course-name");
      const courseFocus = document.getElementById("result-course-focus");
      const resultPrice = document.getElementById("result-course-price");
      const resultBuyText = document.getElementById("btn-result-buy-text");

      const price = COURSE_PRICE_MAP[rec.courseId] || "390 ₽";

      if (badgeIcon) badgeIcon.textContent = rec.trophy;
      if (levelTitle) levelTitle.textContent = `Ваш уровень: ${rec.level}`;
      if (scoreText) scoreText.textContent = `Правильных ответов: ${userScore} из ${TOTAL_STEPS}`;
      if (diagnosisText) diagnosisText.textContent = rec.diagnosis;
      if (courseName) courseName.textContent = rec.courseName;
      if (courseFocus) courseFocus.textContent = rec.courseFocus;
      if (resultPrice) resultPrice.textContent = price;
      if (resultBuyText) resultBuyText.textContent = `Оформить курс за ${price}`;
    }

    // Tab buttons click
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (lang && lang !== currentLang) {
          currentLang = lang;
          currentStep = 0;
          userScore = 0;
          renderCurrentQuestion();
        }
      });
    });

    // Next step button
    if (btnNextDemoQuiz) {
      btnNextDemoQuiz.addEventListener("click", () => {
        currentStep++;
        if (currentStep < TOTAL_STEPS) {
          renderCurrentQuestion();
        } else {
          showResults();
        }
      });
    }

    // Retry test
    if (btnRetryQuiz) {
      btnRetryQuiz.addEventListener("click", () => {
        currentStep = 0;
        userScore = 0;
        renderCurrentQuestion();
      });
    }

    // Buy recommended course
    if (btnResultBuy) {
      btnResultBuy.addEventListener("click", (e) => {
        e.preventDefault();
        const price = COURSE_PRICE_MAP[recommendedCourseId] || "390 ₽";
        const title = (RECOMMENDATIONS[currentLang] || RECOMMENDATIONS.en).mid.courseName;

        if (typeof window.openCheckoutModal === "function") {
          window.openCheckoutModal(recommendedCourseId, title, price);
        } else {
          const buyTrigger = document.querySelector(`[data-buy="${recommendedCourseId}"]`);
          if (buyTrigger) buyTrigger.click();
        }
      });
    }

    // Initial render
    renderCurrentQuestion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTrainer);
  } else {
    initTrainer();
  }
})();
