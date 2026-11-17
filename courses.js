/* ==========================================================================
   NATIVE — Courses Interactive Platform & Lesson Review Engine
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  let catalogData = null;
  let currentLevel = "A0";
  let currentItemKey = "m01_l1"; // default to Module 1, Lesson 1

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

      const levelMods = (catalogData && catalogData[currentLevel] && catalogData[currentLevel].modules) || [];
      const firstReady = levelMods.find(m => m.status === "ready" && m.items && m.items.length > 0);
      if (firstReady) {
        currentItemKey = firstReady.items[0].id;
      } else {
        currentItemKey = "curriculum";
      }

      renderSidebar();
      renderContent();

      if (window.innerWidth <= 860 && coursesSidebar) {
        coursesSidebar.classList.remove("open");
      }
    });
  }

  // Global navigator helper
  window.navigateToItem = function(id) {
    currentItemKey = id;
    renderSidebar();
    renderContent();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth <= 860 && coursesSidebar) {
      coursesSidebar.classList.remove("open");
    }
  };

  // Render Sidebar Tree
  function renderSidebar() {
    if (!sidebarTree || !catalogData) return;
    sidebarTree.innerHTML = "";

    const levelData = catalogData[currentLevel];
    if (!levelData) return;

    const modules = levelData.modules || [];

    // Curriculum Overview button
    const overviewBtn = document.createElement("button");
    overviewBtn.className = `nav-item-btn ${currentItemKey === "curriculum" ? "active" : ""}`;
    overviewBtn.innerHTML = `
      <span class="nav-item-icon">📋</span>
      <span style="font-weight: 600;">Программа курса (${modules.length} модулей)</span>
    `;
    overviewBtn.addEventListener("click", () => {
      currentItemKey = "curriculum";
      renderSidebar();
      renderContent();
      if (window.innerWidth <= 860 && coursesSidebar) {
        coursesSidebar.classList.remove("open");
      }
    });
    sidebarTree.appendChild(overviewBtn);

    modules.forEach(mod => {
      const isReady = mod.status === "ready" && mod.items && mod.items.length > 0;

      const modHeader = document.createElement("div");
      modHeader.className = "nav-module-title";
      modHeader.style.cursor = "pointer";
      modHeader.innerHTML = `
        <span style="flex:1;">${mod.title}</span>
        <span class="${isReady ? 'nav-badge-ready' : 'nav-badge-plan'}">${isReady ? 'Готов (6)' : 'План'}</span>
      `;
      modHeader.addEventListener("click", () => {
        currentItemKey = "mod_" + mod.id;
        renderSidebar();
        renderContent();
        if (window.innerWidth <= 860 && coursesSidebar) {
          coursesSidebar.classList.remove("open");
        }
      });
      sidebarTree.appendChild(modHeader);

      if (isReady) {
        mod.items.forEach(item => {
          const btn = document.createElement("button");
          btn.className = `nav-item-btn ${currentItemKey === item.id ? "active" : ""}`;
          btn.dataset.itemId = item.id;

          let icon = "📄";
          if (item.type === "test") icon = "📝";
          if (item.type === "answers") icon = "🔑";

          btn.innerHTML = `
            <span class="nav-item-icon">${icon}</span>
            <span style="flex:1; font-size: 0.85rem;">${item.title}</span>
          `;

          btn.addEventListener("click", () => {
            window.navigateToItem(item.id);
          });

          sidebarTree.appendChild(btn);
        });
      }
    });
  }

  // Render Main Content
  function renderContent() {
    if (!contentContainer || !catalogData) return;
    contentContainer.innerHTML = "";

    const levelData = catalogData[currentLevel];
    if (!levelData) return;

    const allModules = levelData.modules || [];
    const allItems = allModules.flatMap(m => m.items || []);
    const activeItem = allItems.find(i => i.id === currentItemKey);

    // 1. If an active lesson/test/answer is selected
    if (activeItem) {
      renderLessonDetail(activeItem, allItems, allModules);
      return;
    }

    // 2. Specific module clicked
    if (currentItemKey && currentItemKey.startsWith("mod_")) {
      const modId = currentItemKey.replace("mod_", "");
      const mod = allModules.find(m => m.id === modId);
      if (mod) {
        const isReady = mod.status === "ready" && mod.items && mod.items.length > 0;
        let itemsHtml = "";
        if (isReady) {
          itemsHtml = `
            <div style="margin-top: 24px;">
              <h3 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--reader-text);">Материалы модуля:</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${mod.items.map(it => `
                  <a href="#" class="nav-item-btn" style="text-decoration:none;" onclick="event.preventDefault(); window.navigateToItem('${it.id}')">
                    <span class="nav-item-icon">${it.type === 'test' ? '📝' : it.type === 'answers' ? '🔑' : '📄'}</span>
                    <span>${it.title}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        }
        contentContainer.innerHTML = `
          <div class="content-header-card">
            <span class="content-level-tag">${currentLevel} • ${isReady ? 'Готовый модуль' : 'Учебный план'}</span>
            <h1 class="content-title">${mod.title}</h1>
            <div class="content-goal-box">
              <strong>🎯 Языковой фокус и результаты:</strong><br>
              ${mod.focus || "4 урока по 12 шагов методики, контрольная работа и ключи."}
            </div>
            ${itemsHtml}
          </div>
        `;
        return;
      }
    }

    // 3. Default: Full Curriculum Overview
    renderLevelCurriculumOverview(levelData);
  }

  // Simple Markdown Parser for Tests & Answers
  function formatMarkdown(md) {
    if (!md) return "";
    let html = md;

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1 style="color:#fff; font-size:1.4rem; margin-top:0;">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color:#60a5fa; font-size:1.15rem; margin:20px 0 10px;">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 style="color:#e2e8f0; font-size:1.02rem; margin:16px 0 8px; font-weight:700;">$1</h3>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em style="color:#93c5fd;">$1</em>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr style="border:0; border-top:1px solid var(--reader-border); margin:20px 0;">');

    // Lists (- Option)
    html = html.replace(/^- (.*$)/gim, '<div style="padding: 4px 0 4px 18px; position:relative;"><span style="position:absolute; left:0; color:#3b82f6;">•</span>$1</div>');

    // Tables
    const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+[\|\r\n]+)+)/g;
    html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
      const headers = headerRow.split('|').filter(c => c.trim().length > 0);
      const thHtml = headers.map(h => `<th style="padding:10px 12px; background:rgba(30,41,59,0.8); border:1px solid #334155; color:#93c5fd; text-align:left;">${h.trim()}</th>`).join('');
      
      const rows = bodyRows.trim().split('\n');
      const trHtml = rows.map(r => {
        const cells = r.split('|').filter(c => c.trim().length > 0);
        return `<tr>${cells.map(c => `<td style="padding:8px 12px; border:1px solid #334155; color:#cbd5e1;">${c.trim()}</td>`).join('')}</tr>`;
      }).join('');

      return `<div style="overflow-x:auto; margin:16px 0;"><table style="width:100%; border-collapse:collapse; font-size:0.88rem;"><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`;
    });

    // Paragraph line breaks
    html = html.replace(/\n\n/g, '<div style="height:12px;"></div>');
    return html;
  }

  // Render Lesson Detail
  function renderLessonDetail(item, allItems, allModules) {
    const raw = item.content || "";

    // Find parent module title
    let moduleTitle = "Модуль курса";
    for (const m of allModules) {
      if ((m.items || []).some(it => it.id === item.id)) {
        moduleTitle = m.title;
        break;
      }
    }

    // Parse sections
    let goal = "";
    let phoneticsRaw = "";
    let exercisesRaw = "";
    let audioScript = "";
    let answersRaw = "";

    const lines = raw.split("\n");
    let currentSec = "";
    let secLines = [];

    lines.forEach(l => {
      if (l.startsWith("### 1. Цель") || l.startsWith("### 1. ")) {
        saveSec(); currentSec = "goal";
      } else if (l.startsWith("### 2. Словарь") || l.startsWith("### 2. Правила") || l.startsWith("### 2. Ключевые") || l.startsWith("### 2. ")) {
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
      phoneticsHtml = `
        <div style="background: var(--reader-card); border: 1px solid var(--reader-border); border-radius: 12px; padding: 22px; margin-top: 20px; line-height: 1.65;">
          <h3 style="font-size: 1.1rem; color: #60a5fa; margin: 0 0 14px;">📖 Словарь, фонетика и правила урока:</h3>
          <div style="color: #e2e8f0; font-size: 0.92rem;">
            ${formatMarkdown(phoneticsRaw)}
          </div>
        </div>
      `;
    }

    // Build Exercises HTML with interactive answers reveal
    let exercisesHtml = "";
    if (exercisesRaw) {
      const exLines = exercisesRaw.split("\n");
      let exCards = "";
      let currentExNum = "";
      let currentExText = "";

      exLines.forEach(l => {
        const m = l.match(/^(\d+)\.\s+\*\*(.+?)\*\*:?\s*(.*)$/);
        if (m) {
          if (currentExNum) {
            exCards += renderExCard(currentExNum, currentExText);
          }
          currentExNum = m[1];
          currentExText = `<strong>${m[2]}:</strong> ${m[3]}`;
        } else if (currentExNum) {
          currentExText += `<br>${l}`;
        }
      });
      if (currentExNum) {
        exCards += renderExCard(currentExNum, currentExText);
      }

      function renderExCard(num, text) {
        return `
          <div class="exercise-item-card" style="margin-bottom: 12px;">
            <div style="display: flex; gap: 12px;">
              <span class="exercise-num-badge">${num}</span>
              <div style="flex: 1; font-size: 0.9rem; line-height: 1.5; color: #f1f5f9;">
                ${text}
              </div>
            </div>
            <button class="exercise-show-btn" onclick="this.nextElementSibling.classList.toggle('revealed')">
              👁️ Показать подсказку и ответ
            </button>
            <div class="exercise-answer-box">
              <strong>Ключ к заданию ${num}:</strong> См. раздел «Ответы к уроку» ниже или сверьтесь с правилом.
            </div>
          </div>
        `;
      }

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
        <div class="audio-scenario-card" style="margin-top: 24px;">
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
          <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6;">${formatMarkdown(answersRaw)}</div>
        </div>
      `;
    }

    // If item is test or answers
    let specialHtml = "";
    if (item.type === "test" || item.type === "answers") {
      specialHtml = `
        <div style="background: var(--reader-card); border: 1px solid var(--reader-border); border-radius: 12px; padding: 26px; line-height: 1.7; font-size: 0.92rem; color: #e2e8f0;">
          ${formatMarkdown(raw)}
        </div>
      `;
    }

    contentContainer.innerHTML = `
      <div class="content-header-card">
        <span class="content-level-tag">${currentLevel} • ${moduleTitle} • Английский язык</span>
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

    // Next / Prev listeners across all modules of current level
    const idx = allItems.findIndex(i => i.id === item.id);
    const btnPrev = document.getElementById("btn-prev-lesson");
    const btnNext = document.getElementById("btn-next-lesson");

    if (btnPrev) {
      btnPrev.disabled = idx <= 0;
      btnPrev.style.opacity = idx <= 0 ? "0.35" : "1";
      btnPrev.addEventListener("click", () => {
        if (idx > 0) {
          window.navigateToItem(allItems[idx - 1].id);
        }
      });
    }

    if (btnNext) {
      btnNext.disabled = idx >= allItems.length - 1;
      btnNext.style.opacity = idx >= allItems.length - 1 ? "0.35" : "1";
      btnNext.addEventListener("click", () => {
        if (idx < allItems.length - 1) {
          window.navigateToItem(allItems[idx + 1].id);
        }
      });
    }
  }

  // Render Full Curriculum Overview for Level
  function renderLevelCurriculumOverview(levelData) {
    let modsHtml = "";
    (levelData.modules || []).forEach(m => {
      const isReady = m.status === "ready" && m.items && m.items.length > 0;
      modsHtml += `
        <div style="background: var(--reader-card); border: 1px solid var(--reader-border); border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; cursor: pointer;" onclick="window.navigateToItem('mod_${m.id}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 0.95rem;">${m.title}</strong>
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: ${isReady ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)'}; color: ${isReady ? '#34d399' : '#60a5fa'}; font-weight: 700;">
              ${isReady ? 'Готов (6)' : 'План'}
            </span>
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
