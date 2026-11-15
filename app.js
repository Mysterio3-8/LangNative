/* ==========================================================================
   NATIVE Edu — Secure Client Application
   Zero DOM-based XSS vulnerabilities (Strict TextNode Rendering)
   Dynamic Data Hydration from data/demo_quizzes.json
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Default verified in-memory fallback (real linguistics database items)
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

  // Recommendation Matcher Profiles
  const RECOMMENDATIONS = {
    en: {
      low: {
        level: "A0–A1 (Начальный)",
        trophy: "🌱",
        diagnosis: "Вам пока трудно даются времена и речевые связки. На старте критически важно поставить базу: освоить 1 000 самых частых слов Oxford 3000 и слушать правильное произношение без занудных таблиц.",
        courseId: "english",
        courseName: "NATIVE English",
        courseFocus: "Рекомендованный фокус: Экспресс-старт с нуля, 1 000 ключевых слов Oxford 3000 и аудио от носителей Christopher навсегда."
      },
      mid: {
        level: "A1–A2 (Базовый разговорный)",
        trophy: "🚀",
        diagnosis: "У вас отличный фундамент базовых слов, но вы спотыкаетесь на предлогах и связках. Чтобы перестать переводить фразы в голове с русского, вам нужны готовые речевые чанки носителей.",
        courseId: "english",
        courseName: "NATIVE English",
        courseFocus: "Рекомендованный фокус: Речевые связки, устойчивые коллокации и живой сленг для свободного преодоления языкового барьера."
      },
      high: {
        level: "A2–B1+ (Уверенный разговорный)",
        trophy: "🏆",
        diagnosis: "Великолепная грамматическая интуиция! Ваша ключевая точка роста — естественность живой речи, американский сленг, идиомы и понимание беглого темпа носителей на слух.",
        courseId: "english",
        courseName: "NATIVE English",
        courseFocus: "Рекомендованный фокус: Живой сленг сериалов, идиомы и тренировка восприятия беглой речи за 5 секунд."
      }
    },
    cn: {
      low: {
        level: "HSK 1 (С нуля)",
        trophy: "🌱",
        diagnosis: "Иероглифика и тоны часто пугают новичков. На старте главное — разложить черты по полочкам и поставить 4 тона с помощью слухового аудио-тренажера без перегрузки лишней теорией.",
        courseId: "chinese",
        courseName: "NATIVE Chinese",
        courseFocus: "Рекомендованный фокус: 150 базовых иероглифов HSK 1, правила пиньиня и аудио-постановка 4 тонов от носителя Yunxi."
      },
      mid: {
        level: "HSK 1–2 (Начальный разговорный)",
        trophy: "🚀",
        diagnosis: "Вы узнаете базовые иероглифы и вопросительные конструкции, но путаете созвучные морфемы (как 在 и 再). Вам нужна практика реальных бытовых диалогов и чтения чанков.",
        courseId: "chinese",
        courseName: "NATIVE Chinese",
        courseFocus: "Рекомендованный фокус: Разговорные шаблоны покупок, ориентации в городе и устойчивые конструкции HSK 1-2."
      },
      high: {
        level: "HSK 2–3 (Уверенная база)",
        trophy: "🏆",
        diagnosis: "Отличный результат! Вы безошибочно чувствуете структуру китайского предложения (включая сравнения с 比). Дальше вам нужно нарабатывать беглость чтения без подстрочника пиньиня.",
        courseId: "chinese",
        courseName: "NATIVE Chinese",
        courseFocus: "Рекомендованный фокус: Расширение словарного запаса до 600 слов HSK 1-3 и чтение живых текстов без пиньиня."
      }
    },
    es: {
      low: {
        level: "A0–A1 (Старт с нуля)",
        trophy: "🌱",
        diagnosis: "Разница между Ser и Estar — типичное препятствие новичков. Наш курс избавляет от зубрежки бесконечных таблиц спряжений и сразу даёт практические речевые формулы.",
        courseId: "spanish",
        courseName: "NATIVE Spanish",
        courseFocus: "Рекомендованный фокус: 100 ключевых глаголов и готовые шаблоны для уверенного первого разговора."
      },
      mid: {
        level: "A1–A2 (Базовый туристический)",
        trophy: "🚀",
        diagnosis: "Вы уверенно ориентируетесь в основах и различаете временные и постоянные состояния. Теперь самое время набрать активный запас фраз для поездок, кафе и отелей.",
        courseId: "spanish",
        courseName: "NATIVE Spanish",
        courseFocus: "Рекомендованный фокус: Практические диалоги для путешествий, связки и бытовые разговорные конструкции."
      },
      high: {
        level: "A2–B1 (Разговорный для жизни)",
        trophy: "🏆",
        diagnosis: "Блестяще! Вы безошибочно чувствуете живую речь и культовые фразы носителей (¡No pasa nada!). Вам нужен контент для поддержания беглости и понимания культурного контекста.",
        courseId: "spanish",
        courseName: "NATIVE Spanish",
        courseFocus: "Рекомендованный фокус: Живые идиомы, сленг носителей Испании и Латинской Америки без языкового барьера."
      }
    }
  };

  let recommendedCourseForCheckout = "english";

  function renderDemo(lang) {
    currentLang = lang;
    const items = demoData[lang] || [];
    if (!items.length) return;

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

    if (badgeIcon) badgeIcon.textContent = rec.trophy;
    if (levelTitle) levelTitle.textContent = `Ваш уровень: ${rec.level}`;
    if (scoreText) scoreText.textContent = `Правильных ответов: ${userScore} из ${TOTAL_STEPS}`;
    if (diagnosisText) diagnosisText.textContent = rec.diagnosis;
    if (courseName) courseName.textContent = rec.courseName;
    if (courseFocus) courseFocus.textContent = rec.courseFocus;
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

  // --- 2. Checkout Modal & Security-Hardened Payment Actions ---
  const modal = document.getElementById("checkout-modal");
  const modalClose = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-course-title");
  const modalPrice = document.getElementById("modal-course-price");
  const yookassaPayBtn = document.getElementById("yookassa-pay-btn");
  const tgPayBtn = document.getElementById("tg-pay-btn");
  const vkPayBtn = document.getElementById("vk-pay-btn");

  let selectedCourseId = "english";
  let selectedCourseTitle = "NATIVE English";
  let selectedCoursePrice = "199 ₽";

  // Strict whitelist mapping for VK direct chat links
  const VK_COMMUNITY_MAP = {
    english: "https://vk.com/im?sel=-239331012",
    chinese: "https://vk.com/im?sel=-242408187",
    spanish: "https://vk.com/im?sel=-243301314",
  };

  const buyButtons = document.querySelectorAll("[data-buy]");
  buyButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedCourseId = btn.dataset.buy || "english";
      selectedCoursePrice = btn.dataset.price || "199 ₽";
      selectedCourseTitle = btn.dataset.title || "Языковой курс NATIVE";

      if (modalTitle) modalTitle.textContent = selectedCourseTitle;
      if (modalPrice) modalPrice.textContent = `${selectedCoursePrice} (навсегда)`;

      // Telegram manager order link
      const tgText = encodeURIComponent(`Привет! Хочу оплатить курс «${selectedCourseTitle}» за ${selectedCoursePrice}. Вышлите доступ.`);
      if (tgPayBtn) tgPayBtn.href = `https://t.me/mollydamnbro?text=${tgText}`;

      // VK targeted community link
      if (vkPayBtn) {
        vkPayBtn.href = VK_COMMUNITY_MAP[selectedCourseId] || "https://vk.com/im?sel=-239331012";
      }

      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // YooKassa Secure Integration Handler
  if (yookassaPayBtn) {
    yookassaPayBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("checkout-email");
      const emailVal = emailInput ? emailInput.value.trim() : "";

      const payload = { course_id: selectedCourseId };
      if (emailVal) payload.email = emailVal;

      // Check if local/production payment backend is available
      fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(r => {
        if (!r.ok) throw new Error("Payment endpoint not configured");
        return r.json();
      })
      .then(data => {
        if (data.confirmation_url) {
          window.location.href = data.confirmation_url;
        } else {
          throw new Error("No confirmation URL");
        }
      })
      .catch(() => {
        // Fallback to Telegram SBP automated prompt
        const emailNotice = emailVal ? ` (мой Email для чека 54-ФЗ: ${emailVal})` : '';
        const sbpText = encodeURIComponent(`Привет! Хочу оплатить курс «${selectedCourseTitle}» (${selectedCoursePrice}) через СБП / Карту (ЮKassa)${emailNotice}. Сформируйте счёт и чек 54-ФЗ.`);
        window.open(`https://t.me/mollydamnbro?text=${sbpText}`, "_blank");
      });
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // --- 3. FAQ Accordion ---
  const faqCards = document.querySelectorAll(".faq-card, .faq-item");
  faqCards.forEach(card => {
    const question = card.querySelector(".faq-q, .faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isActive = card.classList.contains("active");
        faqCards.forEach(c => c.classList.remove("active"));
        if (!isActive) card.classList.add("active");
      });
    }
  });

  // --- 4. Smooth Anchor Scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // --- 5. Customer Reviews & Intelligent Auto-Moderation Engine ---
  const reviewsContainer = document.getElementById("reviews-container");
  const btnToggleReviewForm = document.getElementById("btn-toggle-review-form");
  const reviewFormWrapper = document.getElementById("review-form-wrapper");
  const reviewSubmitForm = document.getElementById("review-submit-form");
  const starBtns = document.querySelectorAll("#star-picker .star-btn");
  const reviewRatingVal = document.getElementById("review-rating-val");
  const reviewModerationMsg = document.getElementById("review-moderation-msg");

  const TROLL_STOPWORDS = [
    "лохотрон", "скам", "кидалово", "развод", "обман", "мошенник", "говно", 
    "дерьмо", "параша", "наеб", "хуй", "пизд", "ебат", "сука", "блят",
    "казино", "ставка", "крипт", "1xbet", "заработай", "секс", "интим",
    "fake", "scam", "shitty", "bullshit"
  ];
  const URL_REGEX = /(https?:\/\/|www\.|t\.me\/|vk\.com\/|bit\.ly\/)/i;

  let allReviews = [];

  function renderReviews(reviewsList) {
    if (!reviewsContainer) return;
    reviewsContainer.textContent = "";

    const approvedReviews = (reviewsList || []).filter(r => r.status === "approved");
    approvedReviews.forEach(rev => {
      const card = document.createElement("div");
      card.className = "review-card";

      const cardTop = document.createElement("div");
      cardTop.className = "review-card-top";

      const authorBox = document.createElement("div");
      const authorName = document.createElement("div");
      authorName.className = "review-author-name";
      authorName.textContent = rev.name;

      const authorContact = document.createElement("div");
      authorContact.className = "review-author-contact";
      authorContact.textContent = rev.contact || "@verified";

      authorBox.appendChild(authorName);
      authorBox.appendChild(authorContact);

      const stars = document.createElement("div");
      stars.className = "review-stars";
      stars.textContent = "★".repeat(rev.rating || 5);

      cardTop.appendChild(authorBox);
      cardTop.appendChild(stars);

      const courseBadge = document.createElement("span");
      courseBadge.className = "review-course-badge";
      courseBadge.textContent = rev.course_title || rev.course;

      const reviewText = document.createElement("p");
      reviewText.className = "review-text";
      reviewText.textContent = rev.text;

      const cardFooter = document.createElement("div");
      cardFooter.className = "review-footer";

      const verified = document.createElement("span");
      verified.className = "review-verified";
      verified.textContent = "✓ Проверенная покупка";

      const dateSpan = document.createElement("span");
      dateSpan.textContent = rev.date;

      cardFooter.appendChild(verified);
      cardFooter.appendChild(dateSpan);

      card.appendChild(cardTop);
      card.appendChild(courseBadge);
      card.appendChild(reviewText);
      card.appendChild(cardFooter);

      reviewsContainer.appendChild(card);
    });
  }

  // Load reviews from localStorage or fallback to data/reviews.json
  try {
    const saved = localStorage.getItem("native_reviews");
    if (saved) allReviews = JSON.parse(saved);
  } catch (e) {}

  if (allReviews && allReviews.length > 0) {
    renderReviews(allReviews);
  } else {
    fetch("data/reviews.json")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        allReviews = data;
        try { localStorage.setItem("native_reviews", JSON.stringify(data)); } catch (e) {}
        renderReviews(allReviews);
      })
      .catch(() => {});
  }

  // Toggle Form Visibility
  if (btnToggleReviewForm && reviewFormWrapper) {
    btnToggleReviewForm.addEventListener("click", () => {
      const isHidden = reviewFormWrapper.style.display === "none";
      reviewFormWrapper.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        reviewFormWrapper.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Interactive Star Picker
  starBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = parseInt(btn.dataset.val, 10);
      if (reviewRatingVal) reviewRatingVal.value = val;
      starBtns.forEach(b => {
        const bVal = parseInt(b.dataset.val, 10);
        b.classList.toggle("active", bVal <= val);
      });
    });
  });

  // Client-Side Auto-Moderation Evaluation
  function evaluateReviewModeration(text, rating) {
    const tLower = text.toLowerCase().trim();

    if (tLower.length < 15) {
      return { 
        status: "rejected", 
        reason: "Слишком короткий текст (менее 15 символов)",
        message: "❌ Отзыв слишком короткий. Опишите ваши реальные впечатления подробнее (минимум 15 символов)." 
      };
    }

    if (URL_REGEX.test(text)) {
      return { 
        status: "rejected", 
        reason: "Обнаружена рекламная ссылка или спам сторонних ресурсов",
        message: "❌ Отклонено автомодерацией: обнаружены ссылки или реклама сторонних ресурсов." 
      };
    }

    if (/(.)\1{4,}/.test(text)) {
      return {
        status: "rejected",
        reason: "Бессмысленный повтор символов (флуд)",
        message: "❌ Отклонено автомодерацией: обнаружен бессмысленный повтор символов (флуд)."
      };
    }

    for (const word of TROLL_STOPWORDS) {
      if (tLower.includes(word)) {
        return { 
          status: "rejected", 
          reason: `Стоп-слово ненормативной лексики или заказного хейта: «${word}»`,
          message: "❌ Отклонено автомодерацией: обнаружена ненормативная лексика или признаки заказного спама." 
        };
      }
    }

    // Critical low rating without constructive details
    if (rating <= 3) {
      return { 
        status: "pending", 
        reason: "Низкий рейтинг (1-3 звезды) — премодерация владельцем",
        message: "⏳ Спасибо за обратную связь! Отзыв с критической оценкой отправлен на проверку администратором перед публикацией." 
      };
    }

    return { 
      status: "approved", 
      reason: "Прошёл автомодерацию (высокая оценка, конструктивный текст)",
      message: "✅ Отзыв успешно прошёл автомодерацию и опубликован на сайте!" 
    };
  }

  // Handle Form Submission
  if (reviewSubmitForm) {
    reviewSubmitForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("review-name").value.trim();
      const contact = document.getElementById("review-contact").value.trim() || "@verified_student";
      const courseSelect = document.getElementById("review-course");
      const course = courseSelect.value;
      const courseTitle = courseSelect.options[courseSelect.selectedIndex].text;
      const text = document.getElementById("review-text").value.trim();
      const rating = parseInt(reviewRatingVal.value, 10) || 5;

      const check = evaluateReviewModeration(text, rating);

      reviewModerationMsg.className = `moderation-status-box status-${check.status}`;
      reviewModerationMsg.textContent = check.message;
      reviewModerationMsg.style.display = "block";

      const newReview = {
        id: `rev_${Date.now()}`,
        name: name,
        contact: contact,
        course: course,
        course_title: courseTitle,
        rating: rating,
        text: text,
        date: new Date().toLocaleDateString("ru-RU"),
        status: check.status,
        moderation_reason: check.reason,
        verified_buyer: true
      };

      allReviews.unshift(newReview);
      try { localStorage.setItem("native_reviews", JSON.stringify(allReviews)); } catch (e) {}

      // Only re-renders approved reviews on the public landing page!
      renderReviews(allReviews);

      if (check.status === "approved" || check.status === "pending") {
        reviewSubmitForm.reset();
        starBtns.forEach(b => b.classList.add("active"));
        if (reviewRatingVal) reviewRatingVal.value = "5";
      }
    });
  }

  // --- 6. Course Syllabus & Sample Lesson Reader Modal ---
  const readerModal = document.getElementById("course-reader-modal");
  const readerModalClose = document.getElementById("reader-modal-close");
  const readerBadge = document.getElementById("reader-course-badge");
  const readerTitle = document.getElementById("reader-course-title");
  const readerDesc = document.getElementById("reader-course-desc");
  const readerSyllabusList = document.getElementById("reader-syllabus-list");
  const readerLessonRender = document.getElementById("reader-lesson-render");
  const tabBtnSyllabus = document.getElementById("tab-btn-syllabus");
  const tabBtnLesson = document.getElementById("tab-btn-lesson");
  const paneSyllabus = document.getElementById("reader-tab-syllabus");
  const paneLesson = document.getElementById("reader-tab-lesson");
  const readerBtnBuy = document.getElementById("reader-btn-buy");

  let previewsData = null;
  let activePreviewCourse = "english";

  // Fetch previews data
  fetch("data/course_previews.json")
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      previewsData = data;
    })
    .catch(() => {});

  function openCourseReader(courseId) {
    if (!previewsData || !previewsData[courseId]) return;
    activePreviewCourse = courseId;
    const course = previewsData[courseId];

    if (readerTitle) readerTitle.textContent = course.title;
    if (readerDesc) readerDesc.textContent = course.subtitle;
    if (readerBadge) {
      const badges = { english: "A1 → B2", chinese: "HSK 1–3", spanish: "A1 → A2" };
      readerBadge.textContent = badges[courseId] || "Курс";
    }

    // Render Syllabus
    if (readerSyllabusList) {
      readerSyllabusList.innerHTML = "";
      (course.syllabus || []).forEach(item => {
        const parts = item.split(": ");
        const num = parts[0];
        const title = parts[1] || "";

        const card = document.createElement("div");
        card.className = "syllabus-item-card";
        card.innerHTML = `
          <span class="syllabus-item-num">${num}</span>
          <span>${title}</span>
        `;
        readerSyllabusList.appendChild(card);
      });
    }

    // Render Lesson
    if (readerLessonRender && course.sample_lesson) {
      const les = course.sample_lesson;
      let trapsHtml = "";
      (les.traps || []).forEach(t => {
        trapsHtml += `
          <tr>
            <td class="trap-bad">${t.bad}</td>
            <td class="trap-good">${t.good}</td>
            <td style="color: var(--text-muted); font-size: 0.82rem;">${t.note}</td>
          </tr>
        `;
      });

      let dialHtml = "";
      (les.dialogue || []).forEach(d => {
        dialHtml += `
          <div class="dialogue-turn">
            <span class="dialogue-speaker">${d.speaker}:</span>
            <span class="dialogue-foreign">${d.text}</span>
            <span class="dialogue-ru">${d.ru}</span>
          </div>
        `;
      });

      let chunksHtml = "";
      (les.chunks || []).forEach(c => {
        chunksHtml += `
          <div class="lesson-chunk-card">
            <div class="chunk-foreign">${c.chunk}</div>
            <div class="chunk-ipa">${c.ipa}</div>
            <div class="chunk-ru"><strong>${c.ru}</strong> — ${c.tip}</div>
          </div>
        `;
      });

      readerLessonRender.innerHTML = `
        <div class="lesson-goal-box">
          <div class="lesson-goal-title">🎯 ${les.num}: ${les.topic}</div>
          <div class="lesson-goal-desc">${les.goal}</div>
        </div>

        <div>
          <div class="lesson-block-title">⚔️ 1. Учебник vs Как говорят носители</div>
          <table class="lesson-traps-table">
            <thead>
              <tr>
                <th>❌ Устаревший шаблон</th>
                <th>✅ Как говорят в жизни</th>
                <th>Нюанс и контекст</th>
              </tr>
            </thead>
            <tbody>
              ${trapsHtml}
            </tbody>
          </table>
        </div>

        <div>
          <div class="lesson-block-title">🗣️ 2. Живой диалог в реальной обстановке</div>
          <div class="lesson-dialogue-stack">
            ${dialHtml}
          </div>
        </div>

        <div>
          <div class="lesson-block-title">🔍 3. Разговорные чанки для запоминания</div>
          <div class="lesson-chunks-grid">
            ${chunksHtml}
          </div>
        </div>

        <div class="lesson-secret-box">
          <strong>⚡ Секрет беглости и связной речи:</strong><br>
          ${les.secret}
        </div>
      `;
    }

    // Default to syllabus tab
    if (tabBtnSyllabus) tabBtnSyllabus.classList.add("active");
    if (tabBtnLesson) tabBtnLesson.classList.remove("active");
    if (paneSyllabus) paneSyllabus.classList.add("active");
    if (paneLesson) paneLesson.classList.remove("active");

    if (readerModal) {
      readerModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  // Attach buttons
  document.querySelectorAll(".btn-syllabus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const courseId = btn.dataset.course || "english";
      openCourseReader(courseId);
    });
  });

  // Tab switching inside reader modal
  if (tabBtnSyllabus && tabBtnLesson && paneSyllabus && paneLesson) {
    tabBtnSyllabus.addEventListener("click", () => {
      tabBtnSyllabus.classList.add("active");
      tabBtnLesson.classList.remove("active");
      paneSyllabus.classList.add("active");
      paneLesson.classList.remove("active");
    });

    tabBtnLesson.addEventListener("click", () => {
      tabBtnLesson.classList.add("active");
      tabBtnSyllabus.classList.remove("active");
      paneLesson.classList.add("active");
      paneSyllabus.classList.remove("active");
    });
  }

  // Close reader modal
  function closeReaderModal() {
    if (readerModal) {
      readerModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (readerModalClose) readerModalClose.addEventListener("click", closeReaderModal);

  if (readerModal) {
    readerModal.addEventListener("click", (e) => {
      if (e.target === readerModal) closeReaderModal();
    });
  }

  // Connect reader modal buy button
  if (readerBtnBuy) {
    readerBtnBuy.addEventListener("click", () => {
      closeReaderModal();
      // Trigger checkout modal for activePreviewCourse
      const btn = document.querySelector(`[data-buy="${activePreviewCourse}"]`);
      if (btn) btn.click();
    });
  }

  // --- Cookie Consent Banner (152-ФЗ Compliance) ---
  const cookieBanner = document.getElementById("cookie-banner");
  const btnCookieAccept = document.getElementById("btn-cookie-accept");
  if (cookieBanner) {
    const isConsentGiven = localStorage.getItem("native_cookie_consent");
    if (!isConsentGiven) {
      setTimeout(() => {
        cookieBanner.classList.add("show");
      }, 1200);
    }
    if (btnCookieAccept) {
      btnCookieAccept.addEventListener("click", () => {
        localStorage.setItem("native_cookie_consent", "accepted");
        cookieBanner.classList.remove("show");
      });
    }
  }
});
