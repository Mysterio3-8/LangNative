/* ==========================================================================
   NATIVE Edu — Interactive Level Diagnostic Trainer & Recommendation Matcher
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let demoData = {
    en: [
      {
        id: "en_r_quiz_001",
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
      }
    ],
    cn: [
      {
        id: "cn_r_quiz_001",
        tag: "Китайский • HSK 1-2 Различия",
        question: "Какой иероглиф пропущен?\n我们明天____见。\n[Wǒmen míngtiān ____ jiàn.]",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) 在 [zài]", correct: false },
          { text: "B) 再 [zài]", correct: true },
          { text: "C) 还 [hái]", correct: false },
          { text: "D) 也 [yě]", correct: false }
        ],
        explanation: "再 (zài) — «снова, ещё раз»: 明天再见 (до завтра). Иероглиф 在 звучит точно так же, но означает «находиться где-то»."
      }
    ],
    es: [
      {
        id: "es_r_quiz_001",
        tag: "Испанский • Разница Ser и Estar",
        question: "¿Cuál es la palabra correcta?\n«Yo ____ estudiante de español en la universidad.»",
        subtext: "Выберите правильный вариант:",
        options: [
          { text: "A) soy", correct: true },
          { text: "B) estoy", correct: false },
          { text: "C) tengo", correct: false },
          { text: "D) hago", correct: false }
        ],
        explanation: "soy — глагол ser (yo soy) используется для профессии, статуса и постоянных характеристик. Estar используется для временных состояний и местоположения."
      }
    ]
  };

  // Safe DOM Helper (Immune to XSS)
  function setSafeMultilineText(element, text) {
    if (!element) return;
    element.textContent = "";
    const lines = String(text || "").split("\n");
    lines.forEach((line, index) => {
      element.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) {
        element.appendChild(document.createElement("br"));
      }
    });
  }

  // --- 1. Interactive Level Diagnostic Test & Course Matcher ---
  let currentLang = "en";
  let currentStep = 0;
  let userScore = 0;
  const TOTAL_STEPS = 3;

  const STEP_DIFFICULTIES = [
    "Базовый уровень (A0 → A1)",
    "Средний уровень (A1 → A2)",
    "Разговорный уровень (A2 → B1+)"
  ];

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

  // Recommendation Matcher Profiles (5 Skills & Full Level Coverage)
  const RECOMMENDATIONS = {
    en: {
      low: {
        level: "A0–A1 (Начальный)",
        trophy: "🌱",
        diagnosis: "Вам пока трудно даются времена и речевые связки. В курсе NATIVE English модуль уровня A0-A1 поставит базовые кирпичики Oxford 3000 и произношение, а следующие ступени доведут до свободного B2-C1 по всем 5 направлениям.",
        courseId: "english",
        courseName: "NATIVE English (A0 → C1: Все уровни)",
        courseFocus: "Рекомендованный фокус: Экспресс-старт с нуля, 500 частых слов, речевые связки и тренировка 5 навыков навсегда."
      },
      mid: {
        level: "A1–A2 (Базовый разговорный)",
        trophy: "🚀",
        diagnosis: "У вас отличный фундамент базовых слов, но вы спотыкаетесь на предлогах и временах. В курсе NATIVE English модули A2-B1 уберут перевод в голове, добавят практику чтения живых текстов и аудирование за 5 секунд.",
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
        diagnosis: "Иероглифика и тоны часто пугают новичков. Курс NATIVE Chinese разложит черты по полочкам, поставит 4 тона с помощью аудио-тренажера и проведет через все ступени до HSK 5 по всем 5 направлениям.",
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

  let recommendedCourseForCheckout = "english";

  function renderDemo(lang) {
    currentLang = lang;
    const items = demoData[lang] || [];
    if (!items.length) return;

    // Apply language-specific theme palette to demo console
    const demoConsole = document.querySelector(".demo-console");
    if (demoConsole) {
      demoConsole.classList.remove("theme-en", "theme-cn", "theme-es");
      demoConsole.classList.add(`theme-${lang}`);
    }

    // Show quiz view, hide result card
    if (demoQuizView) demoQuizView.style.display = "block";
    if (demoResultCard) demoResultCard.style.display = "none";
    if (demoNextBox) demoNextBox.style.display = "none";

    const data = items[currentStep % items.length];

    // Stepper & Progress Bar
    const progressPercent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
    if (demoStepLabel) demoStepLabel.textContent = `Вопрос ${currentStep + 1} из ${TOTAL_STEPS}`;
    if (demoDifficultyLabel) demoDifficultyLabel.textContent = STEP_DIFFICULTIES[currentStep] || "Тест уровня";
    if (demoProgressFill) demoProgressFill.style.width = `${progressPercent}%`;
    if (demoScoreChip) demoScoreChip.textContent = `Баллы: ${userScore} / ${TOTAL_STEPS}`;

    if (demoTag) demoTag.textContent = data.tag || "Тест уровня";
    if (demoQuestion) setSafeMultilineText(demoQuestion, data.question);
    if (demoSubtext) demoSubtext.textContent = data.subtext || data.translation || "Выберите правильный вариант:";
    
    if (demoFeedback) {
      demoFeedback.textContent = "";
      demoFeedback.style.display = "none";
      demoFeedback.className = "demo-explanation";
    }

    if (demoOptionsContainer) {
      demoOptionsContainer.textContent = "";
      data.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "demo-opt";

        const textSpan = document.createElement("span");
        textSpan.textContent = opt.text;
        const statusSpan = document.createElement("span");
        statusSpan.className = "opt-status";

        btn.appendChild(textSpan);
        btn.appendChild(statusSpan);
        btn.addEventListener("click", () => handleOptionClick(btn, opt.correct, data.explanation));
        demoOptionsContainer.appendChild(btn);
      });
    }

    tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  function handleOptionClick(selectedBtn, isCorrect, explanation) {
    const allButtons = demoOptionsContainer.querySelectorAll(".demo-opt");
    allButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
      userScore++;
      selectedBtn.classList.add("correct");
      const status = selectedBtn.querySelector(".opt-status");
      if (status) status.textContent = "✓ Верно";

      demoFeedback.className = "demo-explanation visible";
      demoFeedback.style.display = "block";
      demoFeedback.style.background = "#ecfdf5";
      demoFeedback.style.border = "1px solid #10b981";
      demoFeedback.style.color = "#065f46";

      demoFeedback.textContent = "";
      const strong = document.createElement("strong");
      strong.textContent = "Отлично! ";
      demoFeedback.appendChild(strong);
      demoFeedback.appendChild(document.createTextNode(explanation || "Правильный ответ!"));
    } else {
      selectedBtn.classList.add("wrong");
      const status = selectedBtn.querySelector(".opt-status");
      if (status) status.textContent = "✕ Неверно";

      demoFeedback.className = "demo-explanation visible";
      demoFeedback.style.display = "block";
      demoFeedback.style.background = "#fef2f2";
      demoFeedback.style.border = "1px solid #ef4444";
      demoFeedback.style.color = "#991b1b";

      demoFeedback.textContent = "";
      const strong = document.createElement("strong");
      strong.textContent = "Не совсем так. ";
      demoFeedback.appendChild(strong);
      demoFeedback.appendChild(document.createTextNode(explanation || "Обратите внимание на правило!"));

      // Highlight correct option safely
      const items = demoData[currentLang] || [];
      const currentQuiz = items[currentStep % items.length];
      if (currentQuiz) {
        allButtons.forEach(b => {
          const text = b.textContent;
          const opt = currentQuiz.options.find(o => text.includes(o.text));
          if (opt && opt.correct) {
            b.classList.add("correct");
          }
        });
      }
    }

    // Update score chip
    if (demoScoreChip) demoScoreChip.textContent = `Баллы: ${userScore} / ${TOTAL_STEPS}`;

    // Show next button
    if (demoNextBox) {
      demoNextBox.style.display = "block";
      if (btnNextText) {
        btnNextText.textContent = (currentStep + 1 < TOTAL_STEPS) 
          ? "Следующий вопрос" 
          : "Узнать результат и подобрать курс";
      }
    }
  }

  // Next Question Button Handler
  if (btnNextDemoQuiz) {
    btnNextDemoQuiz.addEventListener("click", () => {
      if (currentStep + 1 < TOTAL_STEPS) {
        currentStep++;
        renderDemo(currentLang);
      } else {
        showLevelResults();
      }
    });
  }

  // Show Level Diagnosis & Matched Course
  function showLevelResults() {
    if (demoQuizView) demoQuizView.style.display = "none";
    if (demoResultCard) demoResultCard.style.display = "block";

    const langRecs = RECOMMENDATIONS[currentLang] || RECOMMENDATIONS.en;
    let tier = "mid";
    if (userScore <= 1) tier = "low";
    else if (userScore === 3) tier = "high";

    const rec = langRecs[tier];
    recommendedCourseForCheckout = rec.courseId;

    const badgeIcon = document.getElementById("result-badge-icon");
    const levelTitle = document.getElementById("result-level-title");
    const scoreText = document.getElementById("result-score-text");
    const diagnosisText = document.getElementById("result-diagnosis-text");
    const courseName = document.getElementById("result-course-name");
    const courseFocus = document.getElementById("result-course-focus");
    const resultPrice = document.getElementById("result-course-price");
    const resultBuyText = document.getElementById("btn-result-buy-text");

    const recPrice = rec.courseId === "chinese" ? "390 ₽" : "290 ₽";

    if (badgeIcon) badgeIcon.textContent = rec.trophy;
    if (levelTitle) levelTitle.textContent = `Ваш уровень: ${rec.level}`;
    if (scoreText) scoreText.textContent = `Правильных ответов: ${userScore} из ${TOTAL_STEPS}`;
    if (diagnosisText) diagnosisText.textContent = rec.diagnosis;
    if (courseName) courseName.textContent = rec.courseName;
    if (courseFocus) courseFocus.textContent = rec.courseFocus;
    if (resultPrice) resultPrice.textContent = recPrice;
    if (resultBuyText) resultBuyText.textContent = `Оформить курс за ${recPrice}`;
  }

  // Retry Quiz Button Handler
  if (btnRetryQuiz) {
    btnRetryQuiz.addEventListener("click", () => {
      currentStep = 0;
      userScore = 0;
      renderDemo(currentLang);
    });
  }

  // Result Course Buy Button Handler
  if (btnResultBuy) {
    btnResultBuy.addEventListener("click", () => {
      const targetBtn = document.querySelector(`[data-buy="${recommendedCourseForCheckout}"]`);
      if (targetBtn) {
        targetBtn.click();
      } else {
        if (modal) {
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      }
    });
  }

  // Load external real quiz database asynchronously
  fetch("data/demo_quizzes.json")
    .then(resp => {
      if (resp.ok) return resp.json();
      throw new Error("HTTP error " + resp.status);
    })
    .then(loadedData => {
      if (loadedData && (loadedData.en || loadedData.cn || loadedData.es)) {
        demoData = loadedData;
        renderDemo(currentLang);
      }
    })
    .catch(() => {
      renderDemo(currentLang);
    });

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentStep = 0;
      userScore = 0;
      renderDemo(btn.dataset.lang);
    });
  });


});
