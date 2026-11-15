/* ==========================================================================
   NATIVE Edu — Customer Reviews & Intelligent Auto-Moderation Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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


});
