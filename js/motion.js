/* Two small touches, no libraries.
   1. A light that follows the cursor across cards and panels (.spot), and the
      hero's stage light leaning toward the cursor. Only with a mouse or pen.
   2. "How we work" plays through once, 1 to 4, the first time it is on screen.
   With reduced motion, the steps simply show; the light still follows the cursor
   because it moves only when the reader moves.
   3. One page: the header turns solid once the page scrolls, the menu marks the
      section in view, and "Ask about ..." links pick the topic in the form.
      /?about=website does the same when someone arrives with a link. */
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fine) {
    const cards = document.querySelectorAll(".service, .print, .features li, .call-panel, .form-sheet, .facts");
    cards.forEach((el) => {
      el.classList.add("spot");
      const light = document.createElement("span");
      light.className = "spot-light";
      light.setAttribute("aria-hidden", "true");
      el.prepend(light);
    });
    const hero = document.querySelector(".hero");
    let frame = 0, last = null;
    const paint = () => {
      frame = 0;
      const e = last;
      const card = e.target.closest && e.target.closest(".spot");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      if (hero) {
        const r = hero.getBoundingClientRect();
        if (e.clientY >= r.top && e.clientY <= r.bottom) {
          hero.style.setProperty("--hx", `${((e.clientX - r.left) / r.width) * 100}%`);
          hero.style.setProperty("--hy", `${((e.clientY - r.top) / r.height) * 100}%`);
        }
      }
    };
    document.addEventListener("pointermove", (e) => { last = e; if (!frame) frame = requestAnimationFrame(paint); }, { passive: true });
  }

  const steps = document.querySelector(".steps");
  if (steps && !still && "IntersectionObserver" in window) {
    steps.querySelectorAll("li").forEach((li, i) => li.style.setProperty("--i", i));
    steps.classList.add("is-armed");
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      steps.classList.add("is-on");
      io.disconnect();
    }, { threshold: 0.45 });
    io.observe(steps);
  }

  const top = document.querySelector(".top");
  if (top) {
    const stick = () => top.classList.toggle("is-stuck", scrollY > 8);
    stick();
    addEventListener("scroll", stick, { passive: true });
  }

  const links = [...document.querySelectorAll('.nav a[href^="/#"]')];
  const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const seen = new Map();
    const mark = () => {
      let best = null;
      sections.forEach((s) => { if (seen.get(s) && (!best || s.offsetTop > best.offsetTop)) best = s; });
      links.forEach((a) => { if (best && a.hash === "#" + best.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    };
    const spy = new IntersectionObserver((entries) => { entries.forEach((e) => seen.set(e.target, e.isIntersecting)); mark(); }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  const pick = (topic) => {
    const radio = document.querySelector('input[name="about"][value="' + String(topic).replace(/[^a-z]/g, "") + '"]');
    if (radio) radio.checked = true;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-about]");
    if (a) pick(a.dataset.about);
  });
  const asked = new URLSearchParams(location.search).get("about");
  if (asked) pick(asked);
})();
