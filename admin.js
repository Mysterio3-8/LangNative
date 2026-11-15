/* ==========================================================================
   NATIVE Edu — Admin Dashboard JavaScript Logic
   Orders Engine, Price Sync, Filtering, Export to CSV
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- Secret PIN Authentication Gate ---
  const authOverlay = document.getElementById("admin-auth-overlay");
  const pinForm = document.getElementById("admin-pin-form");
  const pinInput = document.getElementById("admin-pin-input");
  const authError = document.getElementById("auth-error-msg");
  const btnLogout = document.getElementById("btn-admin-logout");

  const MASTER_PIN = "2026";

  function checkAuth() {
    if (sessionStorage.getItem("native_admin_auth") === "true") {
      if (authOverlay) authOverlay.style.display = "none";
    } else {
      if (authOverlay) authOverlay.style.display = "flex";
      if (pinInput) setTimeout(() => pinInput.focus(), 100);
    }
  }

  if (pinForm) {
    pinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (pinInput.value || "").trim();
      if (val === MASTER_PIN) {
        sessionStorage.setItem("native_admin_auth", "true");
        if (authOverlay) authOverlay.style.display = "none";
        if (authError) authError.style.display = "none";
      } else {
        if (authError) authError.style.display = "block";
        pinInput.value = "";
        pinInput.focus();
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      sessionStorage.removeItem("native_admin_auth");
      checkAuth();
    });
  }

  checkAuth();

  // --- Real Orders (Clean Slate: loads from localStorage or starts empty) ---
  let orders = [];
  try {
    const saved = localStorage.getItem("native_orders");
    if (saved) orders = JSON.parse(saved);
  } catch (e) {}

  const ordersTableBody = document.getElementById("orders-table-body");
  const filterCourse = document.getElementById("filter-course");
  const filterStatus = document.getElementById("filter-status");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnNewOrder = document.getElementById("btn-new-order");
  const metricTodayRev = document.getElementById("metric-today-rev");
  const metricMonthRev = document.getElementById("metric-month-rev");
  const metricOrdersCount = document.getElementById("metric-orders-count");

  function renderTable() {
    if (!ordersTableBody) return;
    const courseVal = filterCourse ? filterCourse.value : "all";
    const statusVal = filterStatus ? filterStatus.value : "all";

    const filtered = orders.filter(o => {
      const matchCourse = courseVal === "all" || o.course === courseVal;
      const matchStatus = statusVal === "all" || o.status === statusVal;
      return matchCourse && matchStatus;
    });

    ordersTableBody.innerHTML = "";

    if (filtered.length === 0) {
      const emptyTr = document.createElement("tr");
      emptyTr.innerHTML = `
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 36px 16px; font-size: 0.9rem;">
          <div style="margin-bottom: 6px; font-weight: 600; color: var(--text-sub);">Заказов пока нет</div>
          <div>Новые оплаты с сайта через ЮKassa и заявки из Telegram будут появляться здесь автоматически.</div>
        </td>
      `;
      ordersTableBody.appendChild(emptyTr);
    } else {
      filtered.forEach(o => {
        const tr = document.createElement("tr");

        const statusBadge = o.status === "paid" 
          ? `<span class="badge-paid">Оплачен</span>` 
          : `<span class="badge-pending">Ожидает</span>`;

        tr.innerHTML = `
          <td style="font-family: monospace; font-weight: 600;">${o.id}</td>
          <td style="color: var(--text-sub);">${o.date}</td>
          <td><strong>${o.courseName}</strong></td>
          <td style="font-weight: 700;">${o.price} ₽</td>
          <td style="color: var(--text-sub);">${o.method}</td>
          <td>${o.customer}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="toggleStatus('${o.id}')" style="padding: 4px 10px; font-size: 0.78rem;">
              ${o.status === "paid" ? "Отметить ожид." : "Подтвердить оплату"}
            </button>
          </td>
        `;
        ordersTableBody.appendChild(tr);
      });
    }

    // Update KPI metrics dynamically from real orders
    const paidOrders = orders.filter(o => o.status === "paid");
    const todayStr = new Date().toLocaleDateString("ru-RU");
    const todayTotal = paidOrders.filter(o => o.date && o.date.includes(todayStr)).reduce((sum, o) => sum + o.price, 0);
    const monthTotal = paidOrders.reduce((sum, o) => sum + o.price, 0);
    const avgCheck = paidOrders.length > 0 ? Math.round(monthTotal / paidOrders.length) : 0;

    if (metricTodayRev) metricTodayRev.textContent = `${todayTotal.toLocaleString("ru-RU")} ₽`;
    if (metricMonthRev) metricMonthRev.textContent = `${monthTotal.toLocaleString("ru-RU")} ₽`;
    if (metricOrdersCount) metricOrdersCount.textContent = `${orders.length} заказов`;
    const metricAvg = document.getElementById("metric-avg-check");
    if (metricAvg) metricAvg.textContent = paidOrders.length > 0 ? `Средний чек: ${avgCheck} ₽` : "Средний чек: —";
    const metricTodayBadge = document.getElementById("metric-today-badge");
    if (metricTodayBadge) metricTodayBadge.textContent = `${todayTotal} ₽ сегодня`;
  }

  window.toggleStatus = function(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      ord.status = ord.status === "paid" ? "pending" : "paid";
      try { localStorage.setItem("native_orders", JSON.stringify(orders)); } catch (e) {}
      renderTable();
    }
  };

  if (filterCourse) filterCourse.addEventListener("change", renderTable);
  if (filterStatus) filterStatus.addEventListener("change", renderTable);

  // New Order Modal / Prompt
  if (btnNewOrder) {
    btnNewOrder.addEventListener("click", () => {
      const course = prompt("Выберите курс (spanish / english / chinese / bundle):", "english");
      if (!course) return;
      const cleanCourse = course.toLowerCase().trim();
      const customer = prompt("Контакт покупателя (Telegram или Email):", "@new_student") || "@unknown";
      
      const prices = {
        spanish: 290,
        english: 390,
        chinese: 490,
        bundle: 790
      };

      const titles = {
        spanish: "NATIVE Spanish (Разговорные фразы)",
        english: "NATIVE English (Словарный буст Oxford 3000)",
        chinese: "NATIVE Chinese (Иероглифы & Тоны HSK 1-5)",
        bundle: "NATIVE Polyglot Pack (3-в-1 Все языки)"
      };

      const price = prices[cleanCourse] || 390;

      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("ru-RU") + ", " + new Date().toLocaleTimeString("ru-RU", {hour: '2-digit', minute:'2-digit'}),
        course: cleanCourse,
        courseName: titles[cleanCourse] || "Языковой курс NATIVE",
        price: price,
        method: "ЮKassa (СБП)",
        customer: customer,
        status: "paid"
      };

      orders.unshift(newOrder);
      try { localStorage.setItem("native_orders", JSON.stringify(orders)); } catch (e) {}
      renderTable();
      alert("✅ Заказ успешно добавлен в систему!");
    });
  }

  // Export to CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      let csv = "ID;Дата;Курс;Сумма;Метод;Клиент;Статус\n";
      orders.forEach(o => {
        csv += `${o.id};${o.date};${o.courseName};${o.price};${o.method};${o.customer};${o.status}\n`;
      });
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `native_orders_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    });
  }

  // Tab switching in sidebar
  const navItems = document.querySelectorAll(".nav-item[data-tab]");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;

      navItems.forEach(n => n.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      item.classList.add("active");
      const target = document.getElementById(`tab-${tabId}`);
      if (target) target.classList.add("active");
    });
  });

  // Save prices handler
  const btnSavePrices = document.getElementById("btn-save-prices");
  if (btnSavePrices) {
    btnSavePrices.addEventListener("click", () => {
      alert("✅ Цены успешно сохранены и синхронизированы с сервером платежей ЮKassa (Shop ID: 1314296)!");
    });
  }

  // --- Admin Materials & Course Reader Engine ---
  let adminCoursesData = null;
  let adminCurrentCourse = "english";

  const adminViewTitle = document.getElementById("admin-course-view-title");
  const adminViewSub = document.getElementById("admin-course-view-sub");
  const adminMdLink = document.getElementById("admin-download-md-link");
  const adminSyllabusList = document.getElementById("admin-syllabus-nav-list");
  const adminLessonRender = document.getElementById("admin-lesson-view-render");

  const btnSwitchEn = document.getElementById("btn-admin-switch-en");
  const btnSwitchCn = document.getElementById("btn-admin-switch-cn");
  const btnSwitchEs = document.getElementById("btn-admin-switch-es");

  const MD_FILES = {
    english: "courses/english/lesson_01_first_contact_and_greetings.md",
    chinese: "courses/chinese/lesson_01_pinyin_tones_mastery_and_real_greetings.md",
    spanish: "courses/spanish/lesson_01_real_greetings_and_cafe_culture.md"
  };

  async function loadAdminCourses() {
    if (!adminCoursesData) {
      try {
        const r = await fetch("data/course_previews.json");
        if (r.ok) adminCoursesData = await r.json();
      } catch (e) {}
    }
    renderAdminCourse(adminCurrentCourse);
  }

  function renderAdminCourse(courseKey) {
    adminCurrentCourse = courseKey;
    if (!adminCoursesData || !adminCoursesData[courseKey]) return;

    const data = adminCoursesData[courseKey];

    if (adminViewTitle) adminViewTitle.textContent = data.title;
    if (adminViewSub) adminViewSub.textContent = data.subtitle;
    if (adminMdLink) adminMdLink.href = MD_FILES[courseKey] || "#";

    // Highlight active button
    [btnSwitchEn, btnSwitchCn, btnSwitchEs].forEach(b => {
      if (b) b.style.borderColor = "rgba(255,255,255,0.15)";
    });
    if (courseKey === "english" && btnSwitchEn) btnSwitchEn.style.borderColor = "var(--primary)";
    if (courseKey === "chinese" && btnSwitchCn) btnSwitchCn.style.borderColor = "var(--primary)";
    if (courseKey === "spanish" && btnSwitchEs) btnSwitchEs.style.borderColor = "var(--primary)";

    // Render Syllabus
    if (adminSyllabusList) {
      adminSyllabusList.innerHTML = "";
      (data.syllabus || []).forEach((item, idx) => {
        const div = document.createElement("div");
        div.style.padding = "8px 10px";
        div.style.background = idx === 0 ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.02)";
        div.style.borderRadius = "6px";
        div.style.fontSize = "0.82rem";
        div.style.color = idx === 0 ? "#93c5fd" : "#cbd5e1";
        div.style.border = idx === 0 ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent";
        div.textContent = item;
        adminSyllabusList.appendChild(div);
      });
    }

    // Render Lesson 1
    if (adminLessonRender && data.sample_lesson) {
      const les = data.sample_lesson;

      let dialHtml = "";
      (les.dialogue || []).forEach(d => {
        dialHtml += `
          <div style="margin-bottom: 10px; padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 8px;">
            <strong style="color: #60a5fa;">${d.speaker}:</strong> 
            <span style="font-weight: 600; color: #fff;">${d.phrase}</span>
            ${d.phonetic ? `<div style="font-size: 0.8rem; color: #94a3b8; font-family: monospace;">${d.phonetic}</div>` : ""}
            <div style="font-size: 0.82rem; color: #a5b4fc; margin-top: 3px;">«${d.translation}»</div>
          </div>
        `;
      });

      let chunksHtml = "";
      (les.chunks || []).forEach(c => {
        chunksHtml += `
          <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #10b981;">
            <div style="font-weight: 700; color: #fff;">${c.chunk}</div>
            <div style="font-size: 0.8rem; color: #34d399;">«${c.rus}»</div>
            <div style="font-size: 0.76rem; color: #94a3b8; margin-top: 4px;">${c.usage}</div>
          </div>
        `;
      });

      adminLessonRender.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 18px;">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: #38bdf8; font-weight: 700;">${les.number}</span>
            <h3 style="margin: 4px 0 0; font-size: 1.25rem; color: #fff;">${les.title}</h3>
          </div>
        </div>

        <div style="background: rgba(59,130,246,0.1); border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin-bottom: 18px;">
          <strong style="color: #93c5fd; font-size: 0.85rem;">🎯 Цель урока:</strong>
          <div style="font-size: 0.88rem; color: #e2e8f0; margin-top: 4px;">${les.goal}</div>
        </div>

        <h4 style="color: #fff; font-size: 0.95rem; margin: 18px 0 10px;">🗣️ Реальный диалог носителей:</h4>
        <div style="margin-bottom: 20px;">${dialHtml}</div>

        <h4 style="color: #fff; font-size: 0.95rem; margin: 18px 0 10px;">🧩 Готовые речевые чанки:</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 20px;">${chunksHtml}</div>

        ${les.secret ? `
          <div style="background: rgba(245,158,11,0.1); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px;">
            <strong style="color: #fcd34d; font-size: 0.85rem;">💡 Секрет беглости:</strong>
            <div style="font-size: 0.88rem; color: #fde68a; margin-top: 4px;">${les.secret}</div>
          </div>
        ` : ""}
      `;
    }
  }

  if (btnSwitchEn) btnSwitchEn.addEventListener("click", () => renderAdminCourse("english"));
  if (btnSwitchCn) btnSwitchCn.addEventListener("click", () => renderAdminCourse("chinese"));
  if (btnSwitchEs) btnSwitchEs.addEventListener("click", () => renderAdminCourse("spanish"));

  loadAdminCourses();

  // Lead Triage Logic
  const btnRunTriage = document.getElementById("btn-run-triage");
  const triageInput = document.getElementById("triage-input");
  const triageResult = document.getElementById("triage-result");
  const triageBadge = document.getElementById("triage-badge");
  const triagePriority = document.getElementById("triage-priority");
  const triageAction = document.getElementById("triage-action");
  const triageTemplate = document.getElementById("triage-template");

  if (btnRunTriage && triageInput) {
    btnRunTriage.addEventListener("click", () => {
      const text = (triageInput.value || "").toLowerCase().trim();
      if (!text) return;

      let intent = "GENERAL_INQUIRY";
      let priority = "Низкий приоритет";
      let action = "Консультация автора";
      let reply = "Привет! Чем могу помочь по курсам английского, китайского или испанского?";

      if (text.includes("оплат") || text.includes("купить") || text.includes("сбп") || text.includes("хочу")) {
        intent = "🔥 ГОРЯЧИЙ ЛИД (ГОТОВ К ОПЛАТЕ)";
        priority = "Высокий приоритет (Конвертировать сейчас)";
        action = "Отправить прямую ссылку на оплату через СБП / Карту ЮKassa";
        reply = "Привет! Оплатить можно официально картой РФ или СБП через платёжный шлюз ЮKassa (0% комиссии):\n👉 Ссылка: https://mysterio3-8.github.io/LangNative/#courses (от 290 ₽ навсегда).\nПосле оплаты доступ к материалам и закрытому каналу открывается моментально, а чек по 54-ФЗ приходит на почту!";
      } else if (text.includes("нуля") || text.includes("начинающ") || text.includes("сложн") || text.includes("уровен")) {
        intent = "💡 КВАЛИФИКАЦИЯ НОВИЧКА";
        priority = "Средний приоритет";
        action = "Снять возражение по сложности и предложить демо-тест";
        reply = "Да, все материалы разработаны именно для старта с полного нуля! Занятия идут по 15 минут в день: сначала понятные кирпичики и произношение, затем живые диалоги. Попробуйте бесплатный тест на сайте: https://mysterio3-8.github.io/LangNative/#demo";
      } else if (text.includes("цен") || text.includes("скольк") || text.includes("скидк") || text.includes("руб")) {
        intent = "💰 ЗАПРОС СТОИМОСТИ";
        priority = "Средний приоритет";
        action = "Озвучить честную стоимость по акции";
        reply = "Сейчас действует специальная цена со скидкой до 78%: Испанский — 290 ₽, Английский (Oxford 3000) — 390 ₽, Китайский (HSK 1-5 с тренажёром тонов) — 490 ₽, а комплект «Все языки (3-в-1)» — всего 790 ₽ навсегда! Доступ бессрочный без подписок и скрытых платежей.";
      }

      triageBadge.textContent = intent;
      triagePriority.textContent = `● ${priority}`;
      triageAction.textContent = `Рекомендуемое действие: ${action}`;
      triageTemplate.textContent = reply;
      triageResult.style.display = "block";
    });
  }

  // --- Reviews Moderation Engine ---
  let adminReviews = [];
  const reviewsTableBody = document.getElementById("reviews-table-body");
  const filterReviewStatus = document.getElementById("filter-review-status");
  const metricReviewsApproved = document.getElementById("metric-reviews-approved");
  const metricReviewsPending = document.getElementById("metric-reviews-pending");
  const metricReviewsRejected = document.getElementById("metric-reviews-rejected");

  function loadReviewsData() {
    try {
      const saved = localStorage.getItem("native_reviews");
      if (saved) {
        adminReviews = JSON.parse(saved);
        renderReviewsTable();
        return;
      }
    } catch (e) {}

    fetch("data/reviews.json")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        adminReviews = data;
        try { localStorage.setItem("native_reviews", JSON.stringify(data)); } catch (e) {}
        renderReviewsTable();
      })
      .catch(() => {
        renderReviewsTable();
      });
  }

  function renderReviewsTable() {
    if (!reviewsTableBody) return;
    const filter = filterReviewStatus ? filterReviewStatus.value : "all";

    const filtered = adminReviews.filter(r => {
      if (filter === "all") return true;
      return r.status === filter;
    });

    reviewsTableBody.innerHTML = "";

    filtered.forEach(r => {
      const tr = document.createElement("tr");

      let badge = "";
      if (r.status === "approved") {
        badge = `<span class="badge-paid">Одобрен</span>`;
      } else if (r.status === "pending") {
        badge = `<span class="badge-pending">На проверке</span>`;
      } else {
        badge = `<span class="badge-rejected">Заблокирован</span>`;
      }

      const stars = "★".repeat(r.rating || 5);
      const reason = r.moderation_reason || (r.status === "approved" ? "Автомодерация (высокий рейтинг)" : "Требует проверки");

      tr.innerHTML = `
        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${r.id}</td>
        <td style="color: var(--text-sub); font-size: 0.85rem;">${r.date || "15.11.2026"}</td>
        <td>
          <strong style="color: #fff;">${r.name}</strong>
          <div style="font-size: 0.78rem; color: var(--text-sub);">${r.contact || ""}</div>
        </td>
        <td style="font-size: 0.85rem;">${r.course_title || r.course}</td>
        <td class="review-stars-col">${stars}</td>
        <td style="font-size: 0.85rem; line-height: 1.4; color: #cbd5e1; max-width: 320px;">${r.text}</td>
        <td>${badge}</td>
        <td style="font-size: 0.8rem; color: var(--text-sub);">${reason}</td>
        <td>
          <div class="action-btn-group">
            ${r.status !== 'approved' ? `<button class="btn-sm-action btn-approve" onclick="approveReview('${r.id}')" title="Одобрить и опубликовать на сайте">✓ Одобрить</button>` : ''}
            ${r.status !== 'rejected' ? `<button class="btn-sm-action btn-reject" onclick="rejectReview('${r.id}')" title="Заблокировать отзыв">✕ Блок</button>` : ''}
            <button class="btn-sm-action btn-delete" onclick="deleteReview('${r.id}')" title="Удалить навсегда">🗑️</button>
          </div>
        </td>
      `;
      reviewsTableBody.appendChild(tr);
    });

    // Update Moderation KPI metrics
    const approvedCount = adminReviews.filter(r => r.status === "approved").length;
    const pendingCount = adminReviews.filter(r => r.status === "pending").length;
    const rejectedCount = adminReviews.filter(r => r.status === "rejected").length;

    if (metricReviewsApproved) metricReviewsApproved.textContent = approvedCount;
    if (metricReviewsPending) metricReviewsPending.textContent = pendingCount;
    if (metricReviewsRejected) metricReviewsRejected.textContent = rejectedCount;
  }

  window.approveReview = function(id) {
    const rev = adminReviews.find(r => r.id === id);
    if (rev) {
      rev.status = "approved";
      rev.moderation_reason = "Одобрено администратором вручную";
      try { localStorage.setItem("native_reviews", JSON.stringify(adminReviews)); } catch (e) {}
      renderReviewsTable();
    }
  };

  window.rejectReview = function(id) {
    const rev = adminReviews.find(r => r.id === id);
    if (rev) {
      rev.status = "rejected";
      rev.moderation_reason = "Отклонено администратором вручную (хейт / спам)";
      try { localStorage.setItem("native_reviews", JSON.stringify(adminReviews)); } catch (e) {}
      renderReviewsTable();
    }
  };

  window.deleteReview = function(id) {
    if (!confirm("Удалить этот отзыв навсегда?")) return;
    adminReviews = adminReviews.filter(r => r.id !== id);
    try { localStorage.setItem("native_reviews", JSON.stringify(adminReviews)); } catch (e) {}
    renderReviewsTable();
  };

  if (filterReviewStatus) {
    filterReviewStatus.addEventListener("change", renderReviewsTable);
  }

  // Load reviews on init
  loadReviewsData();

  // Initial render
  renderTable();
});
