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
    // 1. Dynamic FAQ Accordion loader (Native <details name="faq-group"> & Modern Web Guidance)
    const faqContainer = document.getElementById("faq-accordion-list");
    if (faqContainer) {
      fetch("data/faq.json")
        .then(r => r.ok ? r.json() : [])
        .then(faqs => {
          if (!faqs || !faqs.length) return;
          faqContainer.innerHTML = "";
          faqs.forEach((item, idx) => {
            const card = document.createElement("details");
            card.className = "faq-card";
            card.setAttribute("name", "faq-group");
            if (idx === 0) card.open = true;
            card.innerHTML = `
              <summary class="faq-q">
                <span>${item.q}</span>
                <span class="faq-q-icon">+</span>
              </summary>
              <div class="faq-a"><p>${item.a}</p></div>
            `;
            faqContainer.appendChild(card);
          });
        })
        .catch(() => {});
    }

    // Modern Web Guidance: Mutually exclusive <details> fallback for older browsers
    if (!Object.hasOwn(HTMLDetailsElement.prototype, "name")) {
      document.addEventListener("toggle", event => {
        const details = event.target;
        if (!(details instanceof HTMLDetailsElement) || !details.open || !details.hasAttribute("name")) return;
        const name = CSS.escape(details.getAttribute("name"));
        for (const other of document.querySelectorAll(`details[name="${name}"]`)) {
          if (other !== details) other.open = false;
        }
      }, { capture: true });
    }

    // Modern Web Guidance: Native <dialog closedby="any"> light dismiss fallback for older browsers
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
        dialog.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
      }
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
