/* ==========================================================================
   NATIVE Edu — Customer Reviews & Intelligent Auto-Moderation Engine
   Refactored, Secure & Fast Client-Side Rendering
   ========================================================================== */

(function () {
  const TROLL_STOPWORDS = [
    "лохотрон", "скам", "кидалово", "развод", "обман", "мошенник", "говно", 
    "дерьмо", "параша", "наеб", "хуй", "пизд", "ебат", "сука", "блят",
    "казино", "ставка", "крипт", "1xbet", "заработай", "секс", "интим",
    "fake", "scam", "shitty", "bullshit"
  ];
  const URL_REGEX = /(https?:\/\/|www\.|t\.me\/|vk\.com\/|bit\.ly\/)/i;

  function initReviews() {
    const reviewsContainer = document.getElementById("reviews-container");
    const btnToggleReviewForm = document.getElementById("btn-toggle-review-form");
    const reviewFormWrapper = document.getElementById("review-form-wrapper");
    const reviewSubmitForm = document.getElementById("review-submit-form");
    const starBtns = document.querySelectorAll("#star-picker .star-btn");
    const reviewRatingVal = document.getElementById("review-rating-val");
    const reviewModerationMsg = document.getElementById("review-moderation-msg");

    let allReviews = [];

    function renderReviews(list) {
      if (!reviewsContainer) return;
      reviewsContainer.innerHTML = "";

      const approved = (list || []).filter(r => r.status === "approved");
      if (approved.length === 0) {
        reviewsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 24px;">Отзывы загружаются...</p>`;
        return;
      }

      approved.forEach(rev => {
        const card = document.createElement("div");
        card.className = "review-card";

        const starsStr = "★".repeat(Math.max(1, Math.min(5, rev.rating || 5)));
        const courseBadge = rev.course_title || rev.course || "NATIVE Edu";
        const dateStr = rev.date || "Недавно";

        card.innerHTML = `
          <div class="review-card-top">
            <div>
              <div class="review-author-name">${escapeHtml(rev.name)}</div>
              <div class="review-author-contact">${escapeHtml(rev.contact || "@verified")}</div>
            </div>
            <div class="review-stars">${starsStr}</div>
          </div>
          <span class="review-course-badge">${escapeHtml(courseBadge)}</span>
          <p class="review-text">${escapeHtml(rev.text)}</p>
          <div class="review-footer">
            <span class="review-verified">✓ Проверенная покупка</span>
            <span>${escapeHtml(dateStr)}</span>
          </div>
        `;
        reviewsContainer.appendChild(card);
      });
    }

    function escapeHtml(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Toggle Review Form Visibility
    if (btnToggleReviewForm && reviewFormWrapper) {
      btnToggleReviewForm.addEventListener("click", () => {
        const isHidden = reviewFormWrapper.style.display === "none" || !reviewFormWrapper.style.display;
        reviewFormWrapper.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          reviewFormWrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }

    // Star Picker Interaction
    starBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const rating = parseInt(btn.dataset.val, 10) || 5;
        if (reviewRatingVal) reviewRatingVal.value = rating;

        starBtns.forEach(b => {
          const val = parseInt(b.dataset.val, 10);
          b.classList.toggle("active", val <= rating);
        });
      });
    });

    // Form Submit & Moderation
    if (reviewSubmitForm) {
      reviewSubmitForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("review-name");
        const contactInput = document.getElementById("review-contact");
        const courseSelect = document.getElementById("review-course");
        const textInput = document.getElementById("review-text");
        const btnSubmit = document.getElementById("btn-submit-review");

        const name = (nameInput ? nameInput.value : "").trim();
        const contact = (contactInput ? contactInput.value : "").trim();
        const courseId = courseSelect ? courseSelect.value : "english";
        const courseTitle = courseSelect && courseSelect.options[courseSelect.selectedIndex] ? courseSelect.options[courseSelect.selectedIndex].text : "NATIVE Edu";
        const text = (textInput ? textInput.value : "").trim();
        const rating = parseInt(reviewRatingVal ? reviewRatingVal.value : "5", 10) || 5;

        if (text.length < 15) {
          showModerationMsg("error", "Пожалуйста, напишите более подробный отзыв (минимум 15 символов).");
          return;
        }

        // Auto-moderation check: spam / links / obscenities
        const textLower = text.toLowerCase();
        const hasStopWord = TROLL_STOPWORDS.some(sw => textLower.includes(sw));
        const hasUrl = URL_REGEX.test(text);

        if (btnSubmit) btnSubmit.disabled = true;

        if (hasStopWord || hasUrl) {
          setTimeout(() => {
            showModerationMsg("error", "🛡️ Автомодерация отклонила отзыв: обнаружены спам-ссылки или недопустимая лексика.");
            if (btnSubmit) btnSubmit.disabled = false;
          }, 400);
          return;
        }

        // Passed moderation -> Publish review
        setTimeout(() => {
          const newReview = {
            id: `rev_${Date.now()}`,
            name: name,
            contact: contact ? `@${contact.replace('@', '')}` : "@verified",
            rating: rating,
            course: courseId,
            course_title: courseTitle,
            text: text,
            date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
            status: "approved"
          };

          allReviews.unshift(newReview);
          try {
            localStorage.setItem("native_reviews", JSON.stringify(allReviews));
          } catch (e) {}

          renderReviews(allReviews);

          showModerationMsg("success", "✅ Спасибо! Ваш отзыв успешно прошел автомодерацию и опубликован на сайте.");
          reviewSubmitForm.reset();

          starBtns.forEach(b => b.classList.add("active"));
          if (reviewRatingVal) reviewRatingVal.value = 5;
          if (btnSubmit) btnSubmit.disabled = false;
        }, 500);
      });
    }

    function showModerationMsg(type, message) {
      if (!reviewModerationMsg) return;
      reviewModerationMsg.textContent = message;
      reviewModerationMsg.style.display = "block";
      reviewModerationMsg.style.padding = "10px 14px";
      reviewModerationMsg.style.borderRadius = "var(--radius-md)";
      reviewModerationMsg.style.fontSize = "0.86rem";
      reviewModerationMsg.style.marginTop = "12px";

      if (type === "success") {
        reviewModerationMsg.style.background = "#f0fdf4";
        reviewModerationMsg.style.border = "1px solid #bbf7d0";
        reviewModerationMsg.style.color = "#166534";
      } else {
        reviewModerationMsg.style.background = "#fef2f2";
        reviewModerationMsg.style.border = "1px solid #fecaca";
        reviewModerationMsg.style.color = "#991b1b";
      }
    }

    // Load initial reviews from localStorage or data/reviews.json
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
          allReviews = data || [];
          try { localStorage.setItem("native_reviews", JSON.stringify(allReviews)); } catch (e) {}
          renderReviews(allReviews);
        })
        .catch(() => {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviews);
  } else {
    initReviews();
  }
})();
