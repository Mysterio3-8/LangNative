/* ==========================================================================
   NATIVE Edu — Course Syllabus & Sample Lesson Reader Modal
   Refactored, Fast Loading, Full Level Preview
   ========================================================================== */

(function () {
  let previewsData = null;
  let activePreviewCourse = "english";

  const COURSE_PRICE_MAP = {
    spanish: "290 ₽",
    english: "390 ₽",
    chinese: "490 ₽",
    bundle: "790 ₽"
  };

  const BADGES = {
    english: "A0 → C1 (Все уровни)",
    chinese: "HSK 1 → 5 (Все уровни)",
    spanish: "A1 → B2 (Все уровни)"
  };

  function initReader() {
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

    async function loadData() {
      if (!previewsData) {
        try {
          const r = await fetch("data/course_previews.json");
          if (r.ok) previewsData = await r.json();
        } catch (e) {}
      }
      return previewsData;
    }

    // Pre-fetch
    loadData();

    async function openCourseReader(courseId) {
      activePreviewCourse = courseId || "english";
      const data = await loadData();
      if (!data || !data[activePreviewCourse]) return;

      const course = data[activePreviewCourse];

      if (readerTitle) readerTitle.textContent = course.title;
      if (readerDesc) readerDesc.textContent = course.subtitle;
      if (readerBadge) {
        readerBadge.textContent = BADGES[activePreviewCourse] || "Курс (Все уровни)";
        const badgeClass = activePreviewCourse === "english" ? "badge-en" : activePreviewCourse === "chinese" ? "badge-cn" : "badge-es";
        readerBadge.className = `course-badge ${badgeClass}`;
      }

      const priceText = COURSE_PRICE_MAP[activePreviewCourse] || "390 ₽";
      const buyTextSpan = document.getElementById("reader-btn-buy-text");
      if (buyTextSpan) {
        buyTextSpan.textContent = `Получить полный курс за ${priceText}`;
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

      // Render Lesson 1
      if (readerLessonRender && course.sample_lesson) {
        const les = course.sample_lesson;

        let dialHtml = "";
        (les.dialogue || []).forEach(d => {
          dialHtml += `
            <div class="dialogue-bubble">
              <div class="dialogue-speaker">${d.speaker}:</div>
              <div class="dialogue-text">${d.text}</div>
              <div class="dialogue-ru">${d.ru}</div>
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
          <div class="lesson-view-box">
            <div class="lesson-header-box">
              <div class="syllabus-item-num" style="display:inline-block; margin-bottom:6px;">${les.num}</div>
              <div class="lesson-topic-title">${les.topic}</div>
              <div class="lesson-goal-desc">${les.goal}</div>
            </div>

            <div>
              <div class="lesson-section-title">🗣️ Диалог носителей в реальной ситуации</div>
              <div class="lesson-dialogue-thread">${dialHtml}</div>
            </div>

            <div>
              <div class="lesson-section-title">🧩 Готовые речевые чанки и выражения</div>
              <div class="lesson-chunks-grid">${chunksHtml}</div>
            </div>

            ${les.secret ? `
              <div class="syllabus-header-note" style="border-left: 3px solid var(--brand-primary);">
                <strong>💡 Секрет беглой речи носителей:</strong><br>${les.secret}
              </div>
            ` : ""}
          </div>
        `;
      }

      // Switch to first tab by default
      if (tabBtnSyllabus && tabBtnLesson && paneSyllabus && paneLesson) {
        tabBtnSyllabus.classList.add("active");
        tabBtnLesson.classList.remove("active");
        paneSyllabus.classList.add("active");
        paneLesson.classList.remove("active");
      }

      if (readerModal) {
        readerModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }

    function closeReaderModal() {
      if (readerModal) {
        readerModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    }

    window.openCourseReader = openCourseReader;

    document.querySelectorAll(".btn-syllabus").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cid = btn.dataset.course || "english";
        openCourseReader(cid);
      });
    });

    if (readerModalClose) readerModalClose.addEventListener("click", closeReaderModal);

    if (readerModal) {
      readerModal.addEventListener("click", (e) => {
        if (e.target === readerModal) closeReaderModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && readerModal && readerModal.classList.contains("active")) {
        closeReaderModal();
      }
    });

    // Tab switcher
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

    // Direct Buy button inside reader modal
    if (readerBtnBuy) {
      readerBtnBuy.addEventListener("click", () => {
        closeReaderModal();
        const price = COURSE_PRICE_MAP[activePreviewCourse] || "390 ₽";
        const title = previewsData && previewsData[activePreviewCourse] ? previewsData[activePreviewCourse].title : "Курс NATIVE";
        if (typeof window.openCheckoutModal === "function") {
          window.openCheckoutModal(activePreviewCourse, title, price);
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReader);
  } else {
    initReader();
  }
})();
