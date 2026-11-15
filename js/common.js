/* ==========================================================================
   NATIVE Edu — Common UI, Accordion, Smooth Scroll & Cookie Consent (152-ФЗ)
   ========================================================================== */

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

document.addEventListener("DOMContentLoaded", () => {
  // --- FAQ Accordion ---
  const faqCards = document.querySelectorAll(".faq-card, .faq-item");
  faqCards.forEach(card => {
    const question = card.querySelector(".faq-q, .faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isActive = card.classList.contains("active");
        faqCards.forEach(c => c.classList.remove("active"));
        if (!isActive) card.classList.add("active");
      });
    }
  });

  // --- Smooth Anchor Scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // --- Cookie Consent Banner (152-ФЗ Compliance) ---
  const cookieBanner = document.getElementById("cookie-banner");
  const btnCookieAccept = document.getElementById("btn-cookie-accept");
  if (cookieBanner) {
    const isConsentGiven = localStorage.getItem("native_cookie_consent");
    if (!isConsentGiven) {
      setTimeout(() => {
        cookieBanner.classList.add("show");
      }, 1200);
    }
    if (btnCookieAccept) {
      btnCookieAccept.addEventListener("click", () => {
        localStorage.setItem("native_cookie_consent", "accepted");
        cookieBanner.classList.remove("show");
      });
    }
  }
});
