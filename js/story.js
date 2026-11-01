/* The Analytics example, told one reading per screen.

   Bar charts ("editorial data storytelling"): bars grow from the baseline over
   20 frames with an ease-out, the counter rolls to the exact value and stops
   dead, then one handwritten note says why it matters.

   Line chart ("single continuous line"): one line, 4px, round caps, drawn at a
   steady 800px a second on screen and never lifted. The camera stays close and
   pans to keep the pen in the middle third; where the line loops round the
   peak, the loop floods with the accent on the beat it closes. Then the camera
   pulls back to show the whole year.

   Charts are drawn at real pixel sizes, so every label is at least 28px. All
   numbers come from the page (data-chart); nothing is computed for show.
   Each chart plays once when it is on screen, and "Play again" replays it.
   With less motion asked for, the finished chart is shown and nothing moves. */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FRAME = 1000 / 60; // frames are counted at 60 a second
  const GROW = 20;         // bars and counters take 20 frames
  const SPEED = 800;       // the pen moves 800px a second on screen
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const make = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const write = (parent, x, y, str, cls, anchor) => {
    const t = make("text", { x, y, class: cls, "text-anchor": anchor || "start" }, parent);
    t.textContent = str;
    return t;
  };
  const widthOf = (svg, str, cls) => {
    const t = write(svg, 0, -100, str, cls);
    const w = t.getComputedTextLength();
    t.remove();
    return w;
  };
  // Break the note into lines no wider than max.
  const wrap = (svg, str, cls, max) => {
    const lines = [];
    let line = "";
    for (const word of str.split(" ")) {
      if (word === "/") { lines.push(line); line = ""; continue; } // a forced break
      const next = line ? line + " " + word : word;
      if (line && widthOf(svg, next, cls) > max) { lines.push(line); line = word; } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  const number = (v, c) =>
    (c.prefix || "") + v.toLocaleString("en-GB", { minimumFractionDigits: c.decimals || 0, maximumFractionDigits: c.decimals || 0 }) + (c.suffix || "");

  // A frame clock: calls step(frame) once per 60th of a second until it returns false.
  function run(step) {
    let start = 0, id = 0, last = -1;
    const tick = (now) => {
      if (!start) start = now;
      const f = Math.floor((now - start) / FRAME);
      if (f !== last) { last = f; if (step(f) === false) return; }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }

  /* The handwritten note: written on left to right, then its arrow is drawn. */
  function note(svg, lines, x, y, anchor, size, from, to) {
    const g = make("g", {}, svg);
    const id = "clip" + Math.random().toString(36).slice(2, 8);
    const clip = make("clipPath", { id }, make("defs", {}, g));
    const texts = lines.map((l, i) => write(g, x, y + i * size * 1.05, l, "s-note", anchor));
    const w = Math.max(...texts.map((t) => t.getComputedTextLength()));
    const left = anchor === "end" ? x - w : x;
    const wipe = make("rect", { x: left - 4, y: y - size, width: 0, height: lines.length * size * 1.05 + size * 0.4 }, clip);
    texts.forEach((t) => t.setAttribute("clip-path", `url(#${id})`));
    // A pencil curve with an open arrowhead at the end.
    const [ax, ay] = from, [bx, by] = to;
    const mx = (ax + bx) / 2 + (by - ay) * 0.18, my = (ay + by) / 2 - (bx - ax) * 0.18;
    const ang = Math.atan2(by - my, bx - mx), h = 12;
    const head = (a) => `${bx - h * Math.cos(ang + a)} ${by - h * Math.sin(ang + a)}`;
    const arrow = make("path", { class: "s-arrow", d: `M${ax} ${ay}Q${mx} ${my} ${bx} ${by}M${head(0.5)}L${bx} ${by}L${head(-0.5)}`, pathLength: 1 }, g);
    return {
      // f counts frames after the bars land: the note is written over 30, the arrow drawn over 14.
      set(f) {
        wipe.setAttribute("width", clamp((f - 6) / 30, 0, 1) * (w + 8));
        arrow.style.strokeDasharray = "1 1";
        arrow.style.strokeDashoffset = 1 - clamp((f - 36) / 14, 0, 1);
      },
    };
  }

  /* ---------- Horizontal bars: one row per item, label on the left (or above on a phone) ---------- */
  function rows(host, d, W) {
    const narrow = W < 640;
    const svg = make("svg", { width: W, height: 10, "aria-hidden": "true" }, host);
    const vals = d.values, hi = new Set(d.hi);
    const lo = Math.min(0, ...vals), top = Math.max(0, ...vals);
    const labelW = narrow ? 0 : Math.max(...d.labels.map((l) => widthOf(svg, l, "s-label"))) + 32;
    const valuePad = Math.max(...d.valueLabels.map((l) => widthOf(svg, l, "s-value"))) + 18;
    const k = (W - labelW - valuePad) / (top - lo), base = labelW - lo * k;
    const barH = narrow ? 24 : 30, rowH = narrow ? 70 : 50;
    const noteSize = narrow ? 28 : 36;
    const lines = wrap(svg, d.note.text, "s-note", narrow ? W - base - 56 : Math.min(420, W * 0.4));
    const noteH = lines.length * noteSize * 1.05 + 28;
    let y = 4;
    const bars = vals.map((v, i) => {
      const row = { v };
      const t = write(svg, narrow ? Math.max(0, base - 2) : 0, narrow ? y + 26 : y + barH / 2 + 10, "", "s-label");
      const [month, ...place] = d.labels[i].split(" ");
      make("tspan", {}, t).textContent = month + " ";
      make("tspan", hi.has(i) ? { "font-weight": 700 } : {}, t).textContent = place.join(" ");
      row.y = narrow ? y + 36 : y;
      row.rect = make("rect", { x: base, y: row.y, width: 0, height: barH, class: hi.has(i) ? "s-hi" : "s-rest" }, svg);
      const vx = v >= 0 ? base + v * k + 10 : base + 10;
      row.value = write(svg, vx, row.y + barH / 2 + 10, d.valueLabels[i], "s-value" + (hi.has(i) ? " is-hi" : ""));
      y += rowH;
      if (i === d.note.at) { row.noteTop = y - (narrow ? 4 : 10); y += noteH; }
      return row;
    });
    // The baseline: one rule down the chart, or on a phone a short one at each bar so it stays clear of the labels.
    if (narrow) bars.forEach((b) => make("line", { x1: base, x2: base, y1: b.y - 4, y2: b.y + barH + 4, class: "s-base" }, svg));
    else make("line", { x1: base, x2: base, y1: 0, y2: y - (rowH - barH) + 4, class: "s-base" }, svg);
    svg.setAttribute("height", y);
    // The note sits just under the bar that matters, its arrow pointing up at the bar's end.
    const t = bars[d.note.at], ex = base + t.v * k, barBottom = t.y + barH + 8;
    let memo;
    if (narrow) {
      const x = base + 8, w0 = widthOf(svg, lines[0], "s-note");
      memo = note(svg, lines, x, t.noteTop + noteSize + 8, "start", noteSize,
        [Math.min(x + w0 + 16, W - 10), t.noteTop + noteSize * 0.3], [Math.min(ex - 6, W - 8), barBottom]);
    } else {
      const tw = Math.max(...lines.map((l) => widthOf(svg, l, "s-note")));
      const endX = clamp(ex - 36, tw, W - 40);
      memo = note(svg, lines, endX, t.noteTop + noteSize + 8, "end", noteSize,
        [endX + 12, t.noteTop + noteSize * 0.6], [Math.min(ex - 6, W - 8), barBottom]);
    }
    return {
      set(f) {
        const g = easeOut(clamp(f / GROW, 0, 1));
        bars.forEach((b) => {
          const w = Math.abs(b.v) * k * g;
          b.rect.setAttribute("width", w);
          b.rect.setAttribute("x", b.v >= 0 ? base : base - w);
          b.value.setAttribute("opacity", f >= GROW ? 1 : 0);
        });
        memo.set(f - GROW);
      },
    };
  }

  /* ---------- Columns: one column per item, the note in the clear space at the top ---------- */
  function cols(host, d, W) {
    const narrow = W < 640;
    const H = narrow ? 420 : clamp(W * 0.42, 380, 500);
    const svg = make("svg", { width: W, height: H, "aria-hidden": "true" }, host);
    const vals = d.values, hi = new Set(d.hi), max = Math.max(...vals);
    const step = W / vals.length, bw = Math.min(step * 0.62, 132), at = d.note.at;
    const noteSize = narrow ? 30 : 36;
    const noteX = narrow ? at * step + step / 2 + 30 : (at + 1) * step + 8;
    const lines = wrap(svg, d.note.text, "s-note", W - noteX - 8);
    const noteBottom = lines.length * noteSize * 1.05 + 18;
    const plotTop = noteBottom + 44, plotBottom = H - 48;
    const Y = (v) => plotBottom - (v / max) * (plotBottom - plotTop);
    const bars = vals.map((v, i) => {
      const cx = step * i + step / 2;
      write(svg, cx, H - 8, d.labels[i], "s-label", "middle");
      return {
        v, cx,
        rect: make("rect", { x: cx - bw / 2, y: plotBottom, width: bw, height: 0, class: hi.has(i) ? "s-hi" : "s-rest" }, svg),
        value: write(svg, cx, Y(v) - 12, d.valueLabels[i], "s-value" + (hi.has(i) ? " is-hi" : ""), "middle"),
      };
    });
    make("line", { x1: 0, x2: W, y1: plotBottom, y2: plotBottom, class: "s-base" }, svg);
    const t = bars[at];
    const memo = note(svg, lines, noteX, noteSize + 4, "start", noteSize,
      [noteX - 8, noteSize * 0.8], [t.cx + (narrow ? 14 : 34), Y(t.v) - 36]);
    return {
      set(f) {
        const g = easeOut(clamp(f / GROW, 0, 1));
        bars.forEach((b) => {
          const h = (plotBottom - Y(b.v)) * g;
          b.rect.setAttribute("y", plotBottom - h);
          b.rect.setAttribute("height", h);
          b.value.setAttribute("opacity", f >= GROW ? 1 : 0);
        });
        memo.set(f - GROW);
      },
    };
  }

  function barStory(sheet, d) {
    const host = sheet.querySelector(".story-plot");
    const counter = sheet.querySelector(".story-counter-value");
    let chart, stop = () => {};
    const build = () => { host.textContent = ""; chart = (d.kind === "cols" ? cols : rows)(host, d, host.clientWidth); };
    const show = (f) => {
      chart.set(f);
      // The counter climbs at a steady rate in whole steps and lands on the exact value on frame 20.
      const v = f >= GROW ? d.counter.value : Math.floor((d.counter.value * f) / GROW);
      counter.textContent = number(v, f >= GROW ? d.counter : { ...d.counter, decimals: 0 });
    };
    return {
      final() { stop(); build(); show(1000); },
      arm() { stop(); build(); show(0); },
      play() { stop(); build(); stop = run((f) => { show(f); return f < GROW + 50; }); },
    };
  }

  /* ---------- The continuous line ---------- */
  function lineStory(sheet, d) {
    const host = sheet.querySelector(".story-plot");
    let stop = () => {};

    function build() {
      host.textContent = "";
      const W = host.clientWidth, narrow = W < 640;
      const H = narrow ? 400 : clamp(W * 0.46, 420, 560);
      const vals = d.values, n = vals.length, peak = d.peak;
      const padX = narrow ? 24 : 44;
      const S = (W - padX * 2) / (n - 1);
      const R = clamp(S * 0.42, 18, 40);
      const every = S >= 72 ? 1 : 3;
      const top = 28 + 16 + 2 * R + 6, bottom = 70;
      const vmax = Math.max(...vals), vmin = Math.min(...vals), lo = vmin - (vmax - vmin) * 0.2;
      const X = (i) => padX + i * S, Y = (v) => top + ((vmax - v) / (vmax - lo)) * (H - top - bottom);
      const cam = document.createElement("div");
      cam.className = "l-camera";
      host.appendChild(cam);
      const svg = make("svg", { width: W, height: H, "aria-hidden": "true" }, cam);
      const world = make("g", {}, svg);

      // One path: in from the lower left, through every month (level at the
      // peak), once round a loop standing on the peak, on to December and out.
      const P = vals.map((v, i) => [X(i), Y(v)]);
      const m = P.map((p, i) => {
        if (i === peak) return [S, 0];
        const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], span = i === 0 || i === n - 1 ? 1 : 2;
        return [(b[0] - a[0]) / span, (b[1] - a[1]) / span];
      });
      const [x0, y0] = P[0], [xn, yn] = P[n - 1];
      let toPeak = `M${x0 - padX * 0.85} ${y0 + 22}C${x0 - padX * 0.45} ${y0 + 22} ${x0 - m[0][0] / 3} ${y0 - m[0][1] / 3} ${x0} ${y0}`;
      let rest = "";
      for (let i = 1; i < n; i++) {
        const a = P[i - 1], b = P[i];
        const seg = `C${a[0] + m[i - 1][0] / 3} ${a[1] + m[i - 1][1] / 3} ${b[0] - m[i][0] / 3} ${b[1] - m[i][1] / 3} ${b[0]} ${b[1]}`;
        if (i <= peak) toPeak += seg; else rest += seg;
      }
      const [px, py] = P[peak];
      const loop = `A${R} ${R} 0 0 0 ${px} ${py - 2 * R}A${R} ${R} 0 0 0 ${px} ${py}`;
      const out = `C${xn + m[n - 1][0] / 3} ${yn + m[n - 1][1] / 3} ${xn + padX * 0.45} ${yn + 22} ${xn + padX * 0.85} ${yn + 22}`;
      const flood = make("path", { d: `M${px} ${py}${loop}Z`, class: "l-flood", opacity: 0 }, world);
      const ink = make("path", { d: toPeak + loop + rest + out, class: "l-ink" }, world);
      const probe = make("path", { d: toPeak + loop, fill: "none" }, world);
      const closeAt = probe.getTotalLength();
      probe.remove();
      const L = ink.getTotalLength();
      const peakLabel = write(world, px, py - 2 * R - 14, d.peakLabel, "l-peak", "middle");
      const labels = vals.map((_, i) => (i % every === 0 ? write(world, X(i), H - 18, d.labels[i], "l-label", "middle") : null));
      const pen = make("circle", { r: 5, class: "l-pen", opacity: 0 }, world);
      ink.style.strokeDasharray = `${L} ${L}`;
      return { W, H, world, ink, flood, peakLabel, labels, pen, L, closeAt, X, narrow };
    }

    // Draw s pixels of the line, seen through a camera at (tx, ty) with zoom z.
    function frame(p, s, tx, ty, z, penOn) {
      p.world.setAttribute("transform", `translate(${tx} ${ty}) scale(${z})`);
      p.ink.style.strokeWidth = 4 / z; // 4px on screen at any zoom
      p.ink.style.strokeDashoffset = p.L - s;
      const tip = p.ink.getPointAtLength(s);
      p.pen.setAttribute("cx", tip.x); p.pen.setAttribute("cy", tip.y); p.pen.setAttribute("r", 5 / z);
      p.pen.setAttribute("opacity", penOn ? 1 : 0);
      const closed = s >= p.closeAt;
      p.flood.setAttribute("opacity", closed ? 1 : 0);
      p.peakLabel.setAttribute("opacity", closed ? 1 : 0);
      p.labels.forEach((t, i) => t && t.setAttribute("opacity", tip.x >= p.X(i) - 6 || s >= p.L ? 1 : 0.2));
      return tip;
    }

    return {
      final() { stop(); const p = build(); frame(p, p.L, 0, 0, 1, false); },
      arm() { stop(); const p = build(); frame(p, 0, 0, 0, 1, false); },
      play() {
        stop();
        const p = build();
        const z = p.narrow ? 2.4 : 2;
        const minX = p.W - p.W * z, minY = p.H - p.H * z;
        const t0 = p.ink.getPointAtLength(0);
        let s = 0, beat = false, prev = 0, endAt = 0, from, id = 0;
        let tx = clamp(p.W / 2 - t0.x * z, minX, 0), ty = clamp(p.H / 2 - t0.y * z, minY, 0);
        const follow = (tip) => {
          // Keep the pen tip inside the middle third of the view, both ways.
          const sx = tx + tip.x * z, sy = ty + tip.y * z;
          if (sx > (2 * p.W) / 3) tx = (2 * p.W) / 3 - tip.x * z;
          if (sx < p.W / 3) tx = p.W / 3 - tip.x * z;
          if (sy > (2 * p.H) / 3) ty = (2 * p.H) / 3 - tip.y * z;
          if (sy < p.H / 3) ty = p.H / 3 - tip.y * z;
          tx = clamp(tx, minX, 0);
          ty = clamp(ty, minY, 0);
        };
        const tick = (now) => {
          const dt = prev ? Math.min(64, now - prev) : 0;
          prev = now;
          if (s < p.L) {
            s = Math.min(p.L, s + (SPEED / z) * (dt / 1000)); // the same speed from start to end
            follow(frame(p, s, tx, ty, z, true));
            if (!beat && s >= p.closeAt) { beat = true; p.flood.classList.add("is-beat"); }
            if (s >= p.L) { endAt = now + 350; from = { tx, ty }; }
          } else {
            // Then the camera pulls back to the whole year.
            const k = easeInOut(clamp((now - endAt) / 1100, 0, 1));
            frame(p, p.L, from.tx * (1 - k), from.ty * (1 - k), z + (1 - z) * k, false);
            if (k >= 1) return;
          }
          id = requestAnimationFrame(tick);
        };
        id = requestAnimationFrame(tick);
        stop = () => cancelAnimationFrame(id);
      },
    };
  }

  function init() {
    document.querySelectorAll(".story").forEach((sheet) => {
      const d = JSON.parse(sheet.dataset.chart);
      const story = d.kind === "line" ? lineStory(sheet, d) : barStory(sheet, d);
      const again = sheet.querySelector(".story-again");
      let played = false;
      if (still) {
        story.final();
      } else {
        story.arm();
        if (again) {
          again.hidden = false;
          again.addEventListener("click", () => { played = true; story.play(); });
        }
        new IntersectionObserver((entries, io) => {
          if (entries[0].isIntersecting) { played = true; story.play(); io.disconnect(); }
        }, { threshold: 0.5 }).observe(sheet.querySelector(".story-plot"));
      }
      let width = sheet.clientWidth;
      new ResizeObserver(() => {
        if (Math.abs(sheet.clientWidth - width) < 8) return;
        width = sheet.clientWidth;
        if (played || still) story.final(); else story.arm();
      }).observe(sheet);
    });
  }

  // Labels are measured, so wait for the fonts first.
  const fonts = document.fonts
    ? Promise.all([document.fonts.load("500 28px Bricolage"), document.fonts.load("600 36px Caveat")])
    : Promise.resolve();
  fonts.catch(() => {}).then(init);
})();
