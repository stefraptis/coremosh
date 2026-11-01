/* Drawings that play once when they come on screen. Marked in the page with
   data-play; this script arms them (.will-play) and starts them (.is-on), so
   without it, or with less motion asked for, they simply show finished. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-on"); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-play]").forEach((el) => {
    el.classList.add(el.dataset.play === "notes" ? "will-play-notes" : "will-play");
    io.observe(el);
  });
})();
