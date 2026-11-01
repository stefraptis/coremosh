/* Case-study loops: play only while on screen, never on their own when the
   reader asked for less motion, and always with a way to pause. Loops further
   down a page fetch their poster only as they come near (data-poster), so they
   never compete with the top of the page. */
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const near = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.poster = e.target.dataset.poster;
      near.unobserve(e.target);
    });
  }, { rootMargin: "800px 0px" });
  document.querySelectorAll(".case-media").forEach((fig) => {
    const video = fig.querySelector("video.loop"), btn = fig.querySelector(".loop-toggle");
    if (!video || !btn) return;
    if (video.dataset.poster) near.observe(video);
    let paused = still;
    btn.hidden = false;
    const label = () => { btn.textContent = paused ? "Play" : "Pause"; };
    label();
    let visible = false;
    const sync = () => { if (visible && !paused) video.play().catch(() => {}); else video.pause(); };
    btn.addEventListener("click", () => { paused = !paused; label(); sync(); });
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && video.preload === "none") video.preload = "auto";
      sync();
    }, { threshold: 0.35 }).observe(video);
  });
})();
