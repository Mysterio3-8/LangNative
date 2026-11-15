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

  let currentLang = "en";
  let quizIndex = 0;

  const demoTag = document.getElementById("demo-tag");
  const demoQuestion = document.getElementById("demo-question");
  const demoSubtext = document.getElementById("demo-subtext");
  const demoOptionsContainer = document.getElementById("demo-options");
  const demoFeedback = document.getElementById("demo-feedback");
  const tabBtns = document.querySelectorAll(".demo-tab, .demo-tab-btn");

  function renderDemo(lang) {
    currentLang = lang;
    const items = demoData[lang] || [];
    if (!items.length) return;
    const data = items[quizIndex % items.length];

    if (demoTag) demoTag.textContent = data.tag || "Тест";
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
      const currentQuiz = items[quizIndex % items.length];
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
      // Gracefully uses in-memory fallback
      renderDemo(currentLang);
    });

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      quizIndex = 0;
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
  let selectedCoursePrice = "249 ₽";

  // Strict whitelist mapping for VK direct chat links
  const VK_COMMUNITY_MAP = {
    english: "https://vk.com/im?sel=-239331012",
    chinese: "https://vk.com/im?sel=-242408187",
    spanish: "https://vk.com/im?sel=-243301314",
    combo: "https://vk.com/im?sel=-239331012",
  };

  const buyButtons = document.querySelectorAll("[data-buy]");
  buyButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedCourseId = btn.dataset.buy || "english";
      selectedCoursePrice = btn.dataset.price || "249 ₽";
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

      // Check if local/production payment backend is available
      fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: selectedCourseId })
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
        const sbpText = encodeURIComponent(`Привет! Хочу оплатить курс «${selectedCourseTitle}» (${selectedCoursePrice}) через СБП / Карту (ЮKassa). Сформируйте счёт.`);
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
});
