/* ==========================================================================
   NATIVE Edu — Checkout Modal & YooKassa Fast Pay Integration (100% Card & SBP)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("checkout-modal");
  const modalClose = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-course-title");
  const modalPrice = document.getElementById("modal-course-price");
  const yookassaPayBtn = document.getElementById("yookassa-pay-btn");
  const yookassaBtnLabel = document.getElementById("yookassa-btn-label");

  let selectedCourseId = "english";
  let selectedCourseTitle = "NATIVE English";
  let selectedCoursePrice = "290 ₽";

  const buyButtons = document.querySelectorAll("[data-buy]");
  buyButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedCourseId = btn.dataset.buy || "english";
      selectedCoursePrice = btn.dataset.price || (selectedCourseId === "chinese" ? "390 ₽" : "290 ₽");
      selectedCourseTitle = btn.dataset.title || "Языковой курс NATIVE";

      if (modalTitle) modalTitle.textContent = selectedCourseTitle;
      if (modalPrice) modalPrice.textContent = `${selectedCoursePrice} (навсегда)`;
      if (yookassaBtnLabel) {
        yookassaBtnLabel.textContent = `Оплатить картой РФ / СБП (ЮKassa) — ${selectedCoursePrice}`;
      }

      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // YooKassa Secure Integration Handler (Only Bank Cards & SBP via YooKassa)
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

      // Try local and production payment endpoints
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
          // Official fallback to YooKassa Fast Pay Gateway
          const pricesNum = { english: 290, chinese: 390, spanish: 290 };
          const amount = pricesNum[selectedCourseId] || 290;
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

  function closeModal() {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

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


});
