/* ==========================================================================
   NATIVE Edu — Checkout Modal & YooKassa Pay Integration
   Refactored, High Reliability, 100% Card & SBP
   ========================================================================== */

(function () {
  const COURSE_DEFAULT_PRICES = {
    spanish: "290 ₽",
    english: "390 ₽",
    chinese: "490 ₽",
    bundle: "790 ₽"
  };

  const COURSE_NUMERIC_PRICES = {
    spanish: 290,
    english: 390,
    chinese: 490,
    bundle: 790
  };

  let selectedCourseId = "english";
  let selectedCourseTitle = "NATIVE English";
  let selectedCoursePrice = "390 ₽";

  function initCheckout() {
    const modal = document.getElementById("checkout-modal");
    const modalClose = document.getElementById("modal-close");
    const modalTitle = document.getElementById("modal-course-title");
    const modalPrice = document.getElementById("modal-course-price");
    const yookassaPayBtn = document.getElementById("yookassa-pay-btn");
    const yookassaBtnLabel = document.getElementById("yookassa-btn-label");

    function openModal(courseId, title, price) {
      selectedCourseId = courseId || "english";
      selectedCoursePrice = price || COURSE_DEFAULT_PRICES[selectedCourseId] || "390 ₽";
      selectedCourseTitle = title || "Языковой курс NATIVE";

      if (modalTitle) modalTitle.textContent = selectedCourseTitle;
      if (modalPrice) modalPrice.textContent = `${selectedCoursePrice} (навсегда)`;
      if (yookassaBtnLabel) {
        yookassaBtnLabel.textContent = `Оплатить картой РФ / СБП (ЮKassa) — ${selectedCoursePrice}`;
      }

      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }

    function closeModal() {
      if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      }
    }

    window.openCheckoutModal = openModal;
    window.closeCheckoutModal = closeModal;

    // Attach to all data-buy triggers
    document.querySelectorAll("[data-buy]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cid = btn.dataset.buy || "english";
        const cprice = btn.dataset.price || COURSE_DEFAULT_PRICES[cid] || "390 ₽";
        const ctitle = btn.dataset.title || "Языковой курс NATIVE";
        openModal(cid, ctitle, cprice);
      });
    });

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

    // YooKassa Payment Submit Handler
    if (yookassaPayBtn) {
      yookassaPayBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("checkout-email");
        const emailVal = emailInput ? emailInput.value.trim() : "";

        const payload = { course_id: selectedCourseId };
        if (emailVal) payload.email = emailVal;

        const originalBtnText = yookassaBtnLabel ? yookassaBtnLabel.textContent : "Оплатить картой РФ / СБП";
        if (yookassaBtnLabel) yookassaBtnLabel.textContent = "Переход к шлюзу ЮKassa...";
        yookassaPayBtn.disabled = true;

        const tryPayment = async () => {
          const endpoints = [
            "/api/create-payment",
            "https://langnative.vercel.app/api/create-payment"
          ];
          for (const ep of endpoints) {
            try {
              const resp = await fetch(ep, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });
              if (resp.ok) {
                const data = await resp.json();
                if (data && data.confirmation_url) {
                  window.location.href = data.confirmation_url;
                  return true;
                }
              }
            } catch (err) {}
          }
          return false;
        };

        tryPayment().then(success => {
          if (!success) {
            // Direct YooKassa Gateway Fallback
            const amount = COURSE_NUMERIC_PRICES[selectedCourseId] || 390;
            const yooUrl = `https://yookassa.ru/integration/simplepay?shopId=1314296&sum=${amount}&customerNumber=${encodeURIComponent(emailVal || 'buyer')}`;
            window.location.href = yooUrl;
          }
        }).finally(() => {
          setTimeout(() => {
            if (yookassaBtnLabel) yookassaBtnLabel.textContent = originalBtnText;
            yookassaPayBtn.disabled = false;
          }, 4000);
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCheckout);
  } else {
    initCheckout();
  }
})();
