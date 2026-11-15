/* ==========================================================================
   NATIVE Edu — Course Syllabus & Sample Lesson Reader Modal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
      const badges = { english: "A0 → C1 (Все уровни)", chinese: "HSK 1 → 5 (Все уровни)", spanish: "A1 → B2 (Все уровни)" };
      readerBadge.textContent = badges[courseId] || "Курс (Все уровни)";
      const badgeClass = courseId === "english" ? "badge-en" : courseId === "chinese" ? "badge-cn" : "badge-es";
      readerBadge.className = `course-badge ${badgeClass}`;
    }

    const priceText = courseId === "chinese" ? "390 ₽" : "290 ₽";
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
