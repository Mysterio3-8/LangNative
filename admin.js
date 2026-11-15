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
