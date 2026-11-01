/**
 * Pit: a crowd of forty on a round venue floor, seen from the balcony. Each
 * person is a round body with a head on top. Where the pointer lands on the
 * floor, a mosh pit opens: people near its centre are pushed out to its ring,
 * the crowd outside packs tighter without anyone crossing, and the ring jumps
 * clear of the floor. At rest a small pit is already open off centre.
 * The person nearest the pit's centre carries the bright stroke. The slider is
 * the pit's radius, in floor units.
 *
 * The pattern: a continuous field (as Terrain), with the field moving people
 * sideways as well as up, so paint order is re-sorted when it changes.
 */
const {
  Cam, clamp, circ, facing, fit, hull, open, poly, prism, proj, ringAt, run, unproj, spring, stepS,
  mk, pointer, put, register, disposer, solid,
} = HL;

const F = 58, PB = 5, FOOT = 2.6, SHOULDER = 4.6, HB = 15, HEAD = 2.9, HH = 5.4, GAP = 0.8, JUMP = 15;
const REST = [-10, 14];

/** A ring of samples moved to (x, y) on the floor. */
const at = (ring, x, y) => ring.map((s) => ({ u: s.u + x, v: s.v + y, nu: s.nu, nv: s.nv }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 2.75);
  fit(C, [[-F, -F, -PB], [F, F, -PB], [F, -F, -PB], [-F, F, -PB], [0, 0, HB + HH + JUMP]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value, over = null;

  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, circ(F, 48), circ(F - 2.2, 48), -PB, 0));

  // The crowd: a jittered hex grid inside the floor, the same every time.
  const footR = circ(FOOT, 16), shR = circ(SHOULDER, 16), shI = circ(SHOULDER - 0.9, 16);
  const headMid = circ(HEAD, 14), headCap = circ(HEAD * 0.62, 14), headI = circ(HEAD * 0.62 - 0.5, 14);
  const people = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let row = -4; row <= 4; row++) for (let col = -4; col <= 4; col++) {
    const x = (col + (row & 1 ? 0.5 : 0)) * 16.5 + (rnd() - 0.5) * 4, y = row * 14.3 + (rnd() - 0.5) * 4;
    if (Math.hypot(x, y) > F - 8) continue;
    const grp = mk("g", {}, g);
    people.push({
      x0: x, y0: y, k: 0.55 + 0.45 * rnd(), a: rnd() * Math.PI * 2,
      sx: spring(x, { eps: 0.03 }), sy: spring(y, { eps: 0.03 }), sz: spring(0, { eps: 0.03 }),
      grp, body: solid(grp), head: solid(grp), drawn: "",
    });
  }

  // Where a person stands and how high they jump, for a pit at c with radius R.
  function target(p, c) {
    let vx = p.x0 - c[0], vy = p.y0 - c[1], d = Math.hypot(vx, vy);
    if (d < 0.01) { vx = Math.cos(p.a); vy = Math.sin(p.a); d = 1; }
    const s = Math.max(0, 1 - d / (1.6 * R));
    const d2 = d + R * s ** 1.5;
    let x = c[0] + (vx / d) * d2, y = c[1] + (vy / d) * d2;
    const r = Math.hypot(x, y);
    if (r > F - 6) { x *= (F - 6) / r; y *= (F - 6) / r; }
    const z = JUMP * p.k * Math.exp(-(((d2 - R) / (0.45 * R)) ** 2)) * (d < 1.6 * R ? 1 : 0);
    return [x, y, z, d];
  }

  let lit = null;
  function retarget() {
    const c = over || REST;
    let best = null, bd = Infinity;
    for (const p of people) {
      const [x, y, z, d] = target(p, c);
      p.sx.t = x; p.sy.t = y; p.sz.t = z;
      if (d < bd) { bd = d; best = p; }
    }
    if (best !== lit) {
      if (lit) { lit.body.sil.classList.remove("hi"); lit.head.sil.classList.remove("hi"); }
      lit = best; lit.body.sil.classList.add("hi"); lit.head.sil.classList.add("hi");
    }
    if (over) {
      const i = clamp(Math.round(((c[0] + F) / (2 * F)) * 8), 0, 8), j = clamp(Math.round(((c[1] + F) / (2 * F)) * 8), 0, 8);
      read.textContent = `pit ${i},${j}`;
    } else read.textContent = "rest";
    B.wake();
  }

  function draw(p) {
    const x = p.sx.x, y = p.sy.x, z = Math.max(0, p.sz.x);
    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
    if (key === p.drawn) return;
    p.drawn = key;
    // Body: narrow at the feet, wide at the shoulders. Head: round, its widest ring in the middle.
    const zt = z + HB, h0 = zt + GAP, hm = h0 + HH / 2, h1 = h0 + HH;
    put(p.body, {
      sil: poly(hull(ringAt(P, at(footR, x, y), z).concat(ringAt(P, at(shR, x, y), zt)))),
      crease: open(ringAt(P, run(at(shI, x, y), front), zt)),
    });
    put(p.head, {
      sil: poly(hull(ringAt(P, at(headCap, x, y), h0).concat(ringAt(P, at(headMid, x, y), hm), ringAt(P, at(headCap, x, y), h1)))),
      crease: open(ringAt(P, run(at(headI, x, y), front), h1)),
    });
  }

  // Back to front: the nearer a person stands (larger x + y), the later they are painted.
  let order = "";
  function sort() {
    const sorted = people.slice().sort((a, b) => a.sx.x + a.sy.x - (b.sx.x + b.sy.x));
    const key = sorted.map((p) => people.indexOf(p)).join(",");
    if (key === order) return;
    order = key;
    for (const p of sorted) g.appendChild(p.grp);
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const p of people) {
      if (stepS(p.sx, dt)) m = true;
      if (stepS(p.sy, dt)) m = true;
      if (stepS(p.sz, dt)) m = true;
      draw(p);
    }
    sort();
    return m;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (pt) => {
      const w = unproj(C, pt[0], pt[1], 0), r = Math.hypot(w[0], w[1]);
      over = r > F ? null : w;
      retarget();
    },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  retarget();
  return {
    set: (v) => { R = v; retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "pit",
  means: "A crowd on a venue floor opens a mosh pit wherever the pointer lands, and the ring around it jumps.",
  rules: [1, 3, 5, 6],
  range: [16, 24, 32],
  tour: [[200, 170], [150, 205], [255, 140], null],
  mount,
});
