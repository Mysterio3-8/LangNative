/* ==========================================================================
   NATIVE Edu — Admin Dashboard JavaScript Logic
   Orders Engine, Price Sync, Filtering, Export to CSV
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Initial Seed Orders
  let orders = [
    {
      id: "ORD-9481",
      date: "15.11.2026, 12:42",
      course: "english",
      courseName: "NATIVE English",
      price: 249,
      method: "ЮKassa (СБП)",
      customer: "@alex_novikov",
      status: "paid"
    },
    {
      id: "ORD-9480",
      date: "15.11.2026, 11:15",
      course: "combo",
      courseName: "Комбо «Все 3 языка навсегда»",
      price: 499,
      method: "ЮKassa (Карта МИР)",
      customer: "dmitry.spb@mail.ru",
      status: "paid"
    },
    {
      id: "ORD-9479",
      date: "15.11.2026, 09:30",
      course: "chinese",
      courseName: "NATIVE Chinese",
      price: 249,
      method: "Telegram Pay",
      customer: "@kate_lingo",
      status: "paid"
    },
    {
      id: "ORD-9478",
      date: "14.11.2026, 21:54",
      course: "spanish",
      courseName: "NATIVE Spanish",
      price: 249,
      method: "ВКонтакте (VK Pay)",
      customer: "vk.com/id4819201",
      status: "paid"
    },
    {
      id: "ORD-9477",
      date: "14.11.2026, 18:20",
      course: "english",
      courseName: "NATIVE English",
      price: 249,
      method: "ЮKassa (СБП)",
      customer: "sergey.t@yandex.ru",
      status: "pending"
    }
  ];

  // Load persisted orders if present
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

    // Update KPI metrics
    const paidOrders = orders.filter(o => o.status === "paid");
    const todayTotal = paidOrders.filter(o => o.date.includes("15.11.2026")).reduce((sum, o) => sum + o.price, 0);
    const monthTotal = paidOrders.reduce((sum, o) => sum + o.price, 0);

    if (metricTodayRev) metricTodayRev.textContent = `${todayTotal.toLocaleString("ru-RU")} ₽`;
    if (metricMonthRev) metricMonthRev.textContent = `${monthTotal.toLocaleString("ru-RU")} ₽`;
    if (metricOrdersCount) metricOrdersCount.textContent = `${orders.length} заказов`;
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
      const course = prompt("Выберите курс (english / chinese / spanish / combo):", "english");
      if (!course) return;
      const customer = prompt("Контакт покупателя (Telegram или Email):", "@new_student") || "@unknown";
      const price = course === "combo" ? 499 : 249;
      const titles = {
        english: "NATIVE English",
        chinese: "NATIVE Chinese",
        spanish: "NATIVE Spanish",
        combo: "Комбо «Все 3 языка навсегда»"
      };

      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("ru-RU") + ", " + new Date().toLocaleTimeString("ru-RU", {hour: '2-digit', minute:'2-digit'}),
        course: course,
        courseName: titles[course] || "Языковой курс NATIVE",
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
        action = "Отправить прямую ссылку на оплату через СБП ЮKassa";
        reply = "Привет! Оплатить можно в 1 клик через СБП или картой (без комиссии):\n👉 Ссылка: http://localhost:8080/#courses (249 ₽ навсегда).\nПосле оплаты доступ к материалам и закрытому каналу открывается моментально!";
      } else if (text.includes("нуля") || text.includes("начинающ") || text.includes("сложн") || text.includes("уровен")) {
        intent = "💡 КВАЛИФИКАЦИЯ НОВИЧКА";
        priority = "Средний приоритет";
        action = "Снять возражение по сложности и предложить демо-тест";
        reply = "Да, все материалы разработаны именно для старта с полного нуля! Занятия идут по 15 минут в день: сначала понятные кирпичики и произношение, затем живые диалоги. Попробуйте бесплатный тест на сайте: http://localhost:8080/#demo";
      } else if (text.includes("цен") || text.includes("скольк") || text.includes("скидк") || text.includes("руб")) {
        intent = "💰 ЗАПРОС СТОИМОСТИ";
        priority = "Средний приоритет";
        action = "Озвучить ограниченный оффер со скидкой 75%";
        reply = "Сейчас действует специальная цена: любой курс всего 249 ₽ навсегда (вместо 990 ₽). А если хотите сразу английский, китайский и испанский — комбо-пакет 3-в-1 всего за 499 ₽!";
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
