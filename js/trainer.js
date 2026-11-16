/* ==========================================================================
   NATIVE — Progressive Interactive Diagnostic Test (A0 → C1 / HSK 1 → 5)
   Full 10-Question Progressive Difficulty Engine (Easiest to Hardest)
   ========================================================================== */

(function () {
  const COURSE_PRICE_MAP = {
    spanish: "290 ₽",
    english: "390 ₽",
    chinese: "390 ₽"
  };

  const RECOMMENDATIONS = {
    en: {
      low: {
        level: "A0–A1 (Старт с нуля)",
        trophy: "🌱",
        diagnosis: "Вы в самом начале пути. Пока сложно даются времена и речевые связки. Модуль уровня A0–A1 поставит базовые кирпичики повседневной лексики и базовое произношение, избавит от страха говорить и выведет на уверенный уровень A2.",
        courseId: "english",
        courseName: "NATIVE English",
        courseFocus: "Рекомендованный фокус: Экспресс-старт с нуля, 500 частых слов, простые предложения и восприятие речи на слух."
      },
      mid: {
        level: "A1–A2 (Базовый разговорный)",
        trophy: "🚀",
        diagnosis: "У вас хороший фундамент базовых слов, но вы пока спотыкаетесь на временах (Past / Present Perfect) и предлогах. Модули A2–B1 курса NATIVE English снимут языковой барьер, уберут перевод в голове и научат говорить готовыми речевыми чанками.",
        courseId: "english",
        courseName: "NATIVE English",
        courseFocus: "Рекомендованный фокус: Разговорные фразы носителей, живые диалоги без таблиц правил и практика аудирования."
      },
      high: {
        level: "B2–C1 (Уверенный разговорный)",
        trophy: "🏆",
        diagnosis: "Великолепный результат! Вы отлично чувствуете грамматические тонкости и инверсию. Продвинутые блоки курса B2–C1 помогут отточить восприятие беглой уличной речи с акцентами, живые идиомы и свободную спонтанную речь носителей.",
        courseId: "english",
        courseName: "NATIVE English",
        courseFocus: "Рекомендованный фокус: Сленг, идиомы, техника Shadowing и понимание быстрой разговорной речи носителей."
      }
    },
    cn: {
      low: {
        level: "HSK 1 (Старт с нуля)",
        trophy: "🌱",
        diagnosis: "Иероглифы и тоны кажутся сложными только на первый взгляд. Курс NATIVE Chinese разложит базовые ключи по полочкам, поставит 4 тона с помощью аудио-тренажера и даст первые 150 самых нужных слов для уверенного старта.",
        courseId: "chinese",
        courseName: "NATIVE Chinese",
        courseFocus: "Рекомендованный фокус: Базовая иероглифика, правила пиньиня и тренировка 4 тонов с носителем."
      },
      mid: {
        level: "HSK 2–3 (Базовый разговорный)",
        trophy: "🚀",
        diagnosis: "Вы знаете базовые иероглифы и структуру простых фраз, но иногда путаете модальные глаголы (会 / 想 / 要) и порядок слов. В курсе NATIVE Chinese вы наработаете беглость чтения вывесок, диалоги в поездках и WeChat-переписку.",
        courseId: "chinese",
        courseName: "NATIVE Chinese",
        courseFocus: "Рекомендованный фокус: 600+ иероглифов, разговорные шаблоны покупок, ориентации в городе и устойчивые связки."
      },
      high: {
        level: "HSK 4–5 (Уверенная база & Продвинутый)",
        trophy: "🏆",
        diagnosis: "Отличный уровень! Вы уверенно ориентируетесь в конструкциях 比 и 把. Модули HSK 4–5 помогут расширить словарный запас, освоить чтение живых текстов, новости и свободное понимание быстрой речи на слух.",
        courseId: "chinese",
        courseName: "NATIVE Chinese",
        courseFocus: "Рекомендованный фокус: 1 200+ иероглифов, разбор аутентичных диалогов носителей и восприятие беглой речи."
      }
    },
    es: {
      low: {
        level: "A0–A1 (Старт с нуля)",
        trophy: "🌱",
        diagnosis: "Вы только знакомитесь с испанским. Разница между Ser и Estar больше не будет проблемой. Курс NATIVE Spanish даст фундамент без заучивания скучных таблиц спряжений, базовые фразы и старт общения с первых уроков.",
        courseId: "spanish",
        courseName: "NATIVE Spanish",
        courseFocus: "Рекомендованный фокус: Ключевые глаголы, полезные разговорные формулы и постановка произношения."
      },
      mid: {
        level: "A1–A2 (Базовый туристический)",
        trophy: "🚀",
        diagnosis: "У вас крепкая база. Вы знаете основные глаголы, но путаетесь в временах прошлого (Indefinido vs Imperfecto) и предлогах Por / Para. Курс NATIVE Spanish выведет вашу речь на уверенный уровень для поездок и общения.",
        courseId: "spanish",
        courseName: "NATIVE Spanish",
        courseFocus: "Рекомендованный фокус: Практические диалоги для жизни, связки и бытовые разговорные конструкции."
      },
      high: {
        level: "B2–C1 (Уверенный разговорный)",
        trophy: "🏆",
        diagnosis: "Блестяще! Вы легко справляетесь с условными конструкциями и наклонением Subjuntivo. Продвинутые блоки курса помогут отточить беглость спонтанной речи, сленг Испании и Латинской Америки без пауз.",
        courseId: "spanish",
        courseName: "NATIVE Spanish",
        courseFocus: "Рекомендованный фокус: Живые идиомы, сослагательное наклонение в беглой речи и сленг носителей."
      }
    }
  };

  function initTrainer() {
    let demoData = {};
    let currentLang = "en";
    let currentStep = 0;
    let userScore = 0;
    let recommendedCourseId = "english";

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

    function getTotalSteps() {
      const items = demoData[currentLang] || [];
      return items.length > 0 ? items.length : 10;
    }

    function renderCurrentQuestion() {
      const items = demoData[currentLang] || [];
      const totalSteps = getTotalSteps();

      if (!items || items.length === 0) {
        if (demoQuestion) demoQuestion.textContent = "Загрузка вопросов теста...";
        return;
      }

      const item = items[currentStep];
      if (!item) {
        showResults();
        return;
      }

      if (demoQuizView) demoQuizView.style.display = "block";
      if (demoResultCard) demoResultCard.style.display = "none";
      if (demoNextBox) demoNextBox.style.display = "none";
      if (demoFeedback) {
        demoFeedback.className = "demo-explanation";
        demoFeedback.textContent = "";
      }

      // Update Header & Progress UI
      if (demoStepLabel) {
        demoStepLabel.textContent = `Вопрос ${currentStep + 1} из ${totalSteps}`;
      }
      if (demoDifficultyLabel) {
        demoDifficultyLabel.textContent = item.difficulty || item.level || `Уровень ${currentStep + 1}`;
      }
      if (demoProgressFill) {
        const pct = Math.round(((currentStep + 1) / totalSteps) * 100);
        demoProgressFill.style.width = `${pct}%`;
      }
      if (demoScoreChip) {
        demoScoreChip.textContent = `Баллы: ${userScore} / ${totalSteps}`;
      }
      if (demoTag) {
        demoTag.textContent = item.tag || "Диагностический тест";
      }

      // Format Question text (support linebreaks)
      if (demoQuestion) {
        demoQuestion.innerHTML = (item.question || "").replace(/\n/g, "<br>");
      }
      if (demoSubtext) {
        demoSubtext.textContent = item.subtext || "Выберите правильный вариант:";
      }

      // Render Options
      if (demoOptionsContainer) {
        demoOptionsContainer.innerHTML = "";
        (item.options || []).forEach((opt, idx) => {
          const btn = document.createElement("button");
          btn.className = "demo-opt";
          btn.type = "button";
          btn.innerHTML = `
            <span>${opt.text}</span>
            <span class="opt-status"></span>
          `;
          btn.addEventListener("click", () => handleSelectOption(btn, opt.correct, item.explanation));
          demoOptionsContainer.appendChild(btn);
        });
      }
    }

    function handleSelectOption(selectedBtn, isCorrect, explanation) {
      const buttons = demoOptionsContainer.querySelectorAll(".demo-opt");
      buttons.forEach(b => b.disabled = true);

      const totalSteps = getTotalSteps();

      if (isCorrect) {
        userScore++;
        selectedBtn.classList.add("correct");
        const status = selectedBtn.querySelector(".opt-status");
        if (status) status.textContent = "✓ Верно";
      } else {
        selectedBtn.classList.add("incorrect");
        const status = selectedBtn.querySelector(".opt-status");
        if (status) status.textContent = "✗ Ошибка";

        // Highlight the correct option
        const currentItem = (demoData[currentLang] || [])[currentStep];
        if (currentItem && currentItem.options) {
          const correctIdx = currentItem.options.findIndex(o => o.correct);
          if (correctIdx !== -1 && buttons[correctIdx]) {
            buttons[correctIdx].classList.add("correct");
          }
        }
      }

      if (demoScoreChip) {
        demoScoreChip.textContent = `Баллы: ${userScore} / ${totalSteps}`;
      }

      if (demoFeedback) {
        demoFeedback.textContent = (isCorrect ? "Отлично! " : "Пояснение: ") + (explanation || "");
        demoFeedback.className = `demo-explanation ${isCorrect ? "show-correct" : "show-incorrect"}`;
      }

      if (demoNextBox) {
        demoNextBox.style.display = "block";
        if (btnNextText) {
          btnNextText.textContent = (currentStep + 1 >= totalSteps) ? "Посмотреть результат теста 🎯" : "Следующий вопрос →";
        }
      }
    }

    function showResults() {
      if (demoQuizView) demoQuizView.style.display = "none";
      if (demoResultCard) demoResultCard.style.display = "block";

      const totalSteps = getTotalSteps();
      const pct = (userScore / totalSteps) * 100;

      let rank = "low";
      if (pct >= 80) rank = "high";
      else if (pct >= 40) rank = "mid";

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
      if (scoreText) scoreText.textContent = `Правильных ответов: ${userScore} из ${totalSteps} (${Math.round(pct)}%)`;
      if (diagnosisText) diagnosisText.textContent = rec.diagnosis;
      if (courseName) courseName.textContent = rec.courseName;
      if (courseFocus) courseFocus.textContent = rec.courseFocus;
      if (resultPrice) resultPrice.textContent = price;
      if (resultBuyText) resultBuyText.textContent = `Оформить курс за ${price}`;

      // Smooth scroll to results
      demoResultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Tab buttons click (switch language)
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const lang = btn.dataset.lang;
        if (lang) {
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
        const totalSteps = getTotalSteps();
        currentStep++;
        if (currentStep < totalSteps) {
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

    // Load quiz database
    fetch("data/demo_quizzes.json")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && (data.en || data.cn || data.es)) {
          demoData = data;
        }
        renderCurrentQuestion();
      })
      .catch(() => {
        renderCurrentQuestion();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTrainer);
  } else {
    initTrainer();
  }
})();
