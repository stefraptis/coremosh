/* Case-study loops: play only while on screen, never on their own when the
   reader asked for less motion, and always with a way to pause. */
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".case-media").forEach((fig) => {
    const video = fig.querySelector("video.loop"), btn = fig.querySelector(".loop-toggle");
    if (!video || !btn) return;
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
