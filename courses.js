/* ==========================================================================
   NATIVE — Courses Interactive Platform & Lesson Review Engine
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  let catalogData = null;
  let currentLevel = "A0";
  let currentItemKey = "l01"; // default to Lesson 1

  const sidebarTree = document.getElementById("sidebar-nav-tree");
  const contentContainer = document.getElementById("lesson-content-container");
  const levelPillsContainer = document.getElementById("level-pills-container");
  const currentLevelLabel = document.getElementById("current-level-name");
  const mobileToggleBtn = document.getElementById("mobile-toggle-btn");
  const coursesSidebar = document.getElementById("courses-sidebar");

  // Mobile drawer toggle
  if (mobileToggleBtn && coursesSidebar) {
    mobileToggleBtn.addEventListener("click", () => {
      coursesSidebar.classList.toggle("open");
    });
  }

  // Load catalog
  fetch("data/courses_catalog.json")
    .then(res => res.json())
    .then(data => {
      catalogData = data;
      renderSidebar();
      renderContent();
    })
    .catch(err => {
      if (contentContainer) {
        contentContainer.innerHTML = `<div style="color: #f87171; padding: 20px;">Ошибка загрузки каталога курсов: ${err.message}</div>`;
      }
    });

  // Level selector
  if (levelPillsContainer) {
    levelPillsContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".level-pill");
      if (!pill) return;

      levelPillsContainer.querySelectorAll(".level-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      currentLevel = pill.dataset.level;
      if (currentLevelLabel && catalogData && catalogData[currentLevel]) {
        currentLevelLabel.textContent = catalogData[currentLevel].title || currentLevel;
      }

      currentItemKey = (currentLevel === "A0") ? "l01" : "curriculum";
      renderSidebar();
      renderContent();

      if (window.innerWidth <= 860 && coursesSidebar) {
        coursesSidebar.classList.remove("open");
      }
    });
  }

  // Render Sidebar Tree
  function renderSidebar() {
    if (!sidebarTree || !catalogData) return;
    sidebarTree.innerHTML = "";

    const levelData = catalogData[currentLevel];
    if (!levelData) return;

    if (currentLevel === "A0") {
      // Ready Module 01
      const mod01 = (levelData.modules || [])[0];
      if (mod01) {
        const modHeader = document.createElement("div");
        modHeader.className = "nav-module-title";
        modHeader.innerHTML = `
          <span>${mod01.title}</span>
          <span class="nav-badge-ready">Готов</span>
        `;
        sidebarTree.appendChild(modHeader);

        (mod01.items || []).forEach(item => {
          const btn = document.createElement("button");
          btn.className = `nav-item-btn ${currentItemKey === item.id ? "active" : ""}`;
          btn.dataset.itemId = item.id;
          
          let icon = "📄";
          if (item.type === "test") icon = "📝";
          if (item.type === "answers") icon = "🔑";

          btn.innerHTML = `
            <span class="nav-item-icon">${icon}</span>
            <span style="flex:1;">${item.title}</span>
          `;

          btn.addEventListener("click", () => {
            currentItemKey = item.id;
            renderSidebar();
            renderContent();
            if (window.innerWidth <= 860 && coursesSidebar) {
              coursesSidebar.classList.remove("open");
            }
          });

          sidebarTree.appendChild(btn);
        });
      }

      // Other planned modules (2-12)
      (levelData.modules || []).slice(1).forEach(mod => {
        const modBox = document.createElement("div");
        modBox.className = "nav-module-title";
        modBox.style.cursor = "pointer";
        modBox.innerHTML = `
          <span style="color: var(--reader-sub); font-size: 0.8rem;">${mod.title}</span>
          <span class="nav-badge-plan">В плане</span>
        `;
        modBox.addEventListener("click", () => {
          currentItemKey = "mod_" + mod.id;
          renderContent();
        });
        sidebarTree.appendChild(modBox);
      });

    } else {
      // Other levels (A1–C2) show Curriculum overview
      const overviewBtn = document.createElement("button");
      overviewBtn.className = `nav-item-btn ${currentItemKey === "curriculum" ? "active" : ""}`;
      overviewBtn.innerHTML = `
        <span class="nav-item-icon">📋</span>
        <span>Программа уровня (12 модулей)</span>
      `;
      overviewBtn.addEventListener("click", () => {
        currentItemKey = "curriculum";
        renderSidebar();
        renderContent();
      });
      sidebarTree.appendChild(overviewBtn);

      (levelData.modules || []).forEach(mod => {
        const modBox = document.createElement("div");
        modBox.className = "nav-module-title";
        modBox.style.cursor = "pointer";
        modBox.innerHTML = `
          <span style="color: var(--reader-sub); font-size: 0.8rem;">${mod.title}</span>
          <span class="nav-badge-plan">12×4</span>
        `;
        modBox.addEventListener("click", () => {
          currentItemKey = "mod_" + mod.id;
          renderContent();
        });
        sidebarTree.appendChild(modBox);
      });
    }
  }

  // Render Main Content
  function renderContent() {
    if (!contentContainer || !catalogData) return;
    contentContainer.innerHTML = "";

    const levelData = catalogData[currentLevel];
    if (!levelData) return;

    if (currentLevel === "A0" && catalogData.A0 && catalogData.A0.modules && catalogData.A0.modules[0]) {
      const items = catalogData.A0.modules[0].items || [];
      const activeItem = items.find(i => i.id === currentItemKey);

      if (activeItem) {
        renderLessonDetail(activeItem);
        return;
      }
    }

    // Planned module or curriculum overview
    if (currentItemKey && currentItemKey.startsWith("mod_")) {
      const modId = currentItemKey.replace("mod_", "");
      const mod = (levelData.modules || []).find(m => m.id === modId);
      if (mod) {
        contentContainer.innerHTML = `
          <div class="content-header-card">
            <span class="content-level-tag">${currentLevel} • Учебный план</span>
            <h1 class="content-title">${mod.title}</h1>
            <div class="content-goal-box">
              <strong>🎯 Языковой фокус и результаты:</strong><br>
              ${mod.focus || "4 урока по 12 шагов методики, контрольная работа и ключи."}
            </div>
            <p style="color: var(--reader-sub); font-size: 0.88rem; margin-top: 16px;">
              Этот модуль утверждён в генерационном мастер-плане линейки A0–C2. Сейчас на проверке находится Модуль 01.
            </p>
          </div>
        `;
        return;
      }
    }

    // Default: Level Curriculum Overview
    renderLevelCurriculumOverview(levelData);
  }

  // Render Lesson Detail
  function renderLessonDetail(item) {
    const raw = item.content || "";

    // Parse sections
    let goal = "";
    let phoneticsRaw = "";
    let exercisesRaw = "";
    let audioScript = "";
    let answersRaw = "";

    const lines = raw.splitlines ? raw.splitlines() : raw.split("\n");
    let currentSec = "";
    let secLines = [];

    lines.forEach(l => {
      if (l.startsWith("### 1. Цель") || l.startsWith("### 1. ")) {
        saveSec(); currentSec = "goal";
      } else if (l.startsWith("### 2. Словарь") || l.startsWith("### 2. ")) {
        saveSec(); currentSec = "phonetics";
      } else if (l.startsWith("### 3. Практические") || l.startsWith("### 3. ")) {
        saveSec(); currentSec = "exercises";
      } else if (l.startsWith("### 4. Сценарий") || l.startsWith("### 4. ")) {
        saveSec(); currentSec = "audio";
      } else if (l.startsWith("### 5. Ответы") || l.startsWith("### 5. ")) {
        saveSec(); currentSec = "answers";
      } else {
        secLines.push(l);
      }
    });
    saveSec();

    function saveSec() {
      const text = secLines.join("\n").trim();
      if (currentSec === "goal") goal = text;
      if (currentSec === "phonetics") phoneticsRaw = text;
      if (currentSec === "exercises") exercisesRaw = text;
      if (currentSec === "audio") audioScript = text;
      if (currentSec === "answers") answersRaw = text;
      secLines = [];
    }

    // Build Phonetics Grid HTML
    let phoneticsHtml = "";
    if (phoneticsRaw) {
      const letterMatches = phoneticsRaw.matchAll(/\*\*(.+?)\*\*\s*(\[.+?\])?\s*(\(.+?\))?/g);
      let cards = "";
      for (const m of letterMatches) {
        const letter = m[1].trim();
        const ipa = (m[2] || "").trim();
        const ru = (m[3] || "").replace(/[()]/g, "").trim();
        cards += `
          <div class="phonetic-card">
            <div class="phonetic-letter">${letter}</div>
            <div class="phonetic-ipa">${ipa}</div>
            <div class="phonetic-ru">${ru}</div>
            <button type="button" onclick="window.speakLetter('${letter}')" style="margin-top: 8px; background: rgba(59,130,246,0.15); border: none; color: #60a5fa; border-radius: 4px; padding: 3px 8px; font-size: 0.72rem; cursor: pointer;">🔊 Звук</button>
          </div>
        `;
      }
      if (cards) {
        phoneticsHtml = `
          <h3 style="font-size: 1.1rem; color: #fff; margin: 24px 0 10px;">🔤 Буквы и правильное произношение:</h3>
          <div class="phonetic-grid">${cards}</div>
        `;
      }
    }

    // Build Exercises HTML
    let exercisesHtml = "";
    if (exercisesRaw) {
      const exLines = exercisesRaw.split("\n");
      let exCards = "";
      exLines.forEach(l => {
        const m = l.match(/^\s*(\d+)\.\s*\*\*(.+?):\*\*\s*(.+)$/);
        if (m) {
          const num = m[1];
          const type = m[2];
          const text = m[3];
          exCards += `
            <div class="exercise-card">
              <div class="exercise-head">
                <span class="exercise-num">Задание ${num}</span>
                <span class="exercise-type">${type}</span>
              </div>
              <div class="exercise-body">${text}</div>
              <button type="button" class="btn-toggle-answer" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                👁️ Показать подсказку и ответ
              </button>
              <div class="exercise-answer-box">
                <strong>Ключ к заданию ${num}:</strong> См. раздел «Ответы к уроку» ниже или в книге ответов модуля.
              </div>
            </div>
          `;
        }
      });
      if (exCards) {
        exercisesHtml = `
          <h3 style="font-size: 1.1rem; color: #fff; margin: 28px 0 14px;">📝 8 форматов практических заданий:</h3>
          <div>${exCards}</div>
        `;
      }
    }

    // Build Audio Scenario HTML
    let audioHtml = "";
    if (audioScript) {
      audioHtml = `
        <div class="audio-scenario-card">
          <div class="audio-scenario-header">
            <span>🎙️ Сценарий аудирования и отработки с диктором (TTS)</span>
          </div>
          <div class="audio-speech-text">${audioScript.replace(/\n/g, "<br>")}</div>
        </div>
      `;
    }

    // Build Answers HTML
    let answersHtml = "";
    if (answersRaw) {
      answersHtml = `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 18px 20px; margin-top: 24px;">
          <h4 style="margin: 0 0 10px; font-size: 0.95rem; color: #34d399;">🔑 Эталонные ответы к уроку:</h4>
          <div style="font-size: 0.86rem; color: #cbd5e1; line-height: 1.6;">${answersRaw.replace(/\n/g, "<br>")}</div>
        </div>
      `;
    }

    // If item is test or answers
    let specialHtml = "";
    if (item.type === "test" || item.type === "answers") {
      specialHtml = `
        <div style="background: var(--reader-card); border: 1px solid var(--reader-border); border-radius: 12px; padding: 24px; line-height: 1.7; font-size: 0.9rem; color: #e2e8f0;">
          ${raw.replace(/\n/g, "<br>")}
        </div>
      `;
    }

    contentContainer.innerHTML = `
      <div class="content-header-card">
        <span class="content-level-tag">A0 • Модуль 01 • Английский язык</span>
        <h1 class="content-title">${item.title}</h1>
        ${goal ? `
          <div class="content-goal-box">
            <strong>🎯 Практический результат:</strong><br>
            ${goal.replace(/\n/g, "<br>")}
          </div>
        ` : ""}
      </div>

      ${specialHtml ? specialHtml : `
        ${phoneticsHtml}
        ${exercisesHtml}
        ${audioHtml}
        ${answersHtml}
      `}

      <!-- Bottom lesson pagination -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--reader-border);">
        <button id="btn-prev-lesson" class="btn-topbar btn-topbar-secondary">← Предыдущий урок</button>
        <button id="btn-next-lesson" class="btn-topbar btn-topbar-primary">Следующий урок →</button>
      </div>
    `;

    // Next / Prev listeners
    const items = catalogData.A0.modules[0].items || [];
    const idx = items.findIndex(i => i.id === item.id);

    const btnPrev = document.getElementById("btn-prev-lesson");
    const btnNext = document.getElementById("btn-next-lesson");

    if (btnPrev) {
      btnPrev.disabled = idx <= 0;
      btnPrev.style.opacity = idx <= 0 ? "0.4" : "1";
      btnPrev.addEventListener("click", () => {
        if (idx > 0) {
          currentItemKey = items[idx - 1].id;
          renderSidebar();
          renderContent();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    if (btnNext) {
      btnNext.disabled = idx >= items.length - 1;
      btnNext.style.opacity = idx >= items.length - 1 ? "0.4" : "1";
      btnNext.addEventListener("click", () => {
        if (idx < items.length - 1) {
          currentItemKey = items[idx + 1].id;
          renderSidebar();
          renderContent();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  // Render Full Curriculum Overview for Level
  function renderLevelCurriculumOverview(levelData) {
    let modsHtml = "";
    (levelData.modules || []).forEach(m => {
      modsHtml += `
        <div style="background: var(--reader-card); border: 1px solid var(--reader-border); border-radius: 10px; padding: 16px 20px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 0.95rem;">${m.title}</strong>
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: rgba(59,130,246,0.15); color: #60a5fa; font-weight: 700;">4 урока</span>
          </div>
          <div style="font-size: 0.84rem; color: var(--reader-sub);">${m.focus || "Лексика, грамматика, аудирование и разговорная практика."}</div>
        </div>
      `;
    });

    contentContainer.innerHTML = `
      <div class="content-header-card">
        <span class="content-level-tag">${currentLevel} • Полная программа курса</span>
        <h1 class="content-title">${levelData.title || currentLevel}</h1>
        <p style="color: var(--reader-sub); font-size: 0.9rem; line-height: 1.5; margin: 0;">
          12 полноценных модулей (48 основных уроков + 12 контрольных работ + 1 итоговый экзамен). Разработано по стандартам CEFR и British Council.
        </p>
      </div>

      <h3 style="font-size: 1.1rem; color: #fff; margin: 24px 0 14px;">Модули курса:</h3>
      <div>${modsHtml}</div>
    `;
  }

  // Helper Speech Synthesis
  window.speakLetter = function(char) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(char);
      utter.lang = "en-US";
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    } else {
      alert(`Звук буквы: ${char}`);
    }
  };
});
