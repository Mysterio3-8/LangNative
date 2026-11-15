/* ==========================================================================
   NATIVE Edu — Common UI, Accordion, Smooth Scroll & Cookie Consent
   Refactored, XSS Immune, Clean DOM Helpers
   ========================================================================== */

(function () {
  // Safe DOM Helper (Immune to XSS)
  function setSafeMultilineText(element, text) {
    if (!element) return;
    element.textContent = "";
    const lines = String(text || "").split("\n");
    lines.forEach((line, index) => {
      element.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) {
        element.appendChild(document.createElement("br"));
      }
    });
  }
  window.setSafeMultilineText = setSafeMultilineText;

  function initCommon() {
    // 1. Dynamic FAQ Accordion loader
    const faqContainer = document.getElementById("faq-accordion-list");
    if (faqContainer) {
      fetch("data/faq.json")
        .then(r => r.ok ? r.json() : [])
        .then(faqs => {
          if (!faqs || !faqs.length) return;
          faqContainer.innerHTML = "";
          faqs.forEach((item, idx) => {
            const card = document.createElement("div");
            card.className = `faq-card ${idx === 0 ? "active" : ""}`;
            card.innerHTML = `
              <div class="faq-q">
                <span>${item.q}</span>
                <span class="faq-q-icon">+</span>
              </div>
              <div class="faq-a">${item.a}</div>
            `;
            const qEl = card.querySelector(".faq-q");
            qEl.addEventListener("click", () => {
              const isActive = card.classList.contains("active");
              faqContainer.querySelectorAll(".faq-card").forEach(c => c.classList.remove("active"));
              if (!isActive) card.classList.add("active");
            });
            faqContainer.appendChild(card);
          });
        })
        .catch(() => {});
    } else {
      // Fallback for static cards
      const staticCards = document.querySelectorAll(".faq-card");
      staticCards.forEach(card => {
        const question = card.querySelector(".faq-q");
        if (question) {
          question.addEventListener("click", () => {
            const isActive = card.classList.contains("active");
            staticCards.forEach(c => c.classList.remove("active"));
            if (!isActive) card.classList.add("active");
          });
        }
      });
    }

    // 2. Smooth Anchor Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // 3. Cookie Consent Banner
    const cookieBanner = document.getElementById("cookie-banner");
    const btnCookieAccept = document.getElementById("btn-cookie-accept");
    if (cookieBanner) {
      const isConsentGiven = localStorage.getItem("native_cookie_consent");
      if (!isConsentGiven) {
        setTimeout(() => {
          cookieBanner.style.display = "flex";
        }, 1200);
      } else {
        cookieBanner.style.display = "none";
      }

      if (btnCookieAccept) {
        btnCookieAccept.addEventListener("click", () => {
          localStorage.setItem("native_cookie_consent", "accepted");
          cookieBanner.style.display = "none";
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommon);
  } else {
    initCommon();
  }
})();
