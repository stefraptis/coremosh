/* Two small touches, no libraries.
   1. A light that follows the cursor across cards and panels (.spot), and the
      hero's stage light leaning toward the cursor. Only with a mouse or pen.
   2. "How we work" plays through once, 1 to 4, the first time it is on screen.
   With reduced motion, the steps simply show; the light still follows the cursor
   because it moves only when the reader moves.
   3. One page: the header turns solid once the page scrolls, the menu marks the
      section in view, and "Ask about ..." links pick the topic in the form.
      /?about=website does the same when someone arrives with a link.
   4. The home page logo travels from the hero into the header on scroll. */
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

  /* 4. The logo starts big and centred over the hero slot and travels into the
        header as the page scrolls. One image (the header's), scaled down, never
        up, so it stays sharp. With reduced motion it does not travel: the hero
        logo scrolls away and the header logo fades in once it has gone. */
  const slot = document.querySelector(".hero-logo .slot");
  const mark = document.querySelector(".top .mark");
  const logo = mark && mark.querySelector("img");
  if (slot && logo) {
    const body = document.body;
    if (still || !("IntersectionObserver" in window)) {
      body.classList.add("logo-still");
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => body.classList.toggle("logo-out", !e.isIntersecting), { rootMargin: "-72px 0px 0px 0px" }).observe(slot);
      } else body.classList.add("logo-out");
    } else {
      body.classList.add("logo-fly");
      let w = 1, top0 = 0, left0 = 0, range = 1, raf = 0, until = 0;
      const measure = () => {
        const r = slot.getBoundingClientRect();
        w = r.width; top0 = r.top + scrollY; left0 = r.left;
        logo.style.width = w + "px";
        range = Math.max(160, top0 + r.height * 0.5 - mark.getBoundingClientRect().top);
      };
      const place = () => {
        raf = 0;
        const m = mark.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, scrollY / range));
        const e = p * p * (3 - 2 * p);
        const s = 1 + (m.width / w - 1) * e;
        const x = (left0 - m.left) * (1 - e);
        const y = (top0 - scrollY - m.top) * (1 - e);
        logo.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
        // Keep following for a moment after scrolling stops: the header shrinks
        // when it turns solid, and the logo's resting place moves with it.
        if (performance.now() < until) raf = requestAnimationFrame(place);
      };
      const go = () => { until = performance.now() + 320; if (!raf) raf = requestAnimationFrame(place); };
      measure(); place();
      addEventListener("scroll", go, { passive: true });
      addEventListener("resize", () => { measure(); go(); });
      addEventListener("load", () => { measure(); go(); });
    }
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
