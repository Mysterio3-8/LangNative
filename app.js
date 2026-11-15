/* ==========================================================================
   NATIVE Edu — Application Entrypoint & Modular Loader
   Code is modularized into dedicated high-cohesion scripts under js/
   ========================================================================== */

(function () {
  const modules = [
    "js/common.js",
    "js/trainer.js",
    "js/checkout.js",
    "js/reviews.js",
    "js/reader.js"
  ];

  modules.forEach(src => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
})();
