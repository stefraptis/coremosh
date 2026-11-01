"""Writes _src/partials/dashboard.html: the made-up example on the Analytics page.

Three small single-series charts as inline SVG (viewBox 360 x 230, so text stays
readable at phone width), each with hover values (<title>) and a table version.
Run: python3 scripts/make_dashboard.py, then scripts/build.py.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, L, R, T, B = 360, 230, 40, 12, 22, 34   # plot box: left, right, top, bottom margins


def eur(v):
    s = f"{abs(v):,}".replace(",", ".")
    return ("-" if v < 0 else "+") + s + " €"


def table(caption, head, rows):
    body = "".join(f"<tr><th scope=\"row\">{a}</th><td>{b}</td></tr>" for a, b in rows)
    return (f'<details class="dash-table"><summary>Show as a table</summary><table><caption>{caption}</caption>'
            f'<thead><tr><th scope="col">{head[0]}</th><th scope="col">{head[1]}</th></tr></thead><tbody>{body}</tbody></table></details>')


def gigs():
    data = [("Jan", "Athens", 180), ("Feb", "Thessaloniki", 90), ("Mar", "Athens", 260), ("Apr", "Patras", -40),
            ("May", "Volos", 120), ("Jun", "Athens", 310), ("Sep", "Larissa", -15), ("Oct", "Athens", 230)]
    lo, hi = -60, 350
    ph = H - T - B
    y = lambda v: T + (hi - v) / (hi - lo) * ph
    n, pw = len(data), W - L - R
    bw = pw / n
    best = max(data, key=lambda d: d[2])
    out = [f'<line class="grid" x1="{L}" x2="{W-R}" y1="{y(v):.1f}" y2="{y(v):.1f}"/><text class="tick" x="{L-6}" y="{y(v)+4:.1f}" text-anchor="end">{v}</text>' for v in (0, 100, 200, 300) if True]
    out.append(f'<line class="base" x1="{L}" x2="{W-R}" y1="{y(0):.1f}" y2="{y(0):.1f}"/>')
    for i, (m, city, v) in enumerate(data):
        x = L + i * bw + bw * 0.22
        w = bw * 0.56
        top, bot = (y(v), y(0)) if v >= 0 else (y(0), y(v))
        cls = "bar hl" if (m, city, v) == best else "bar"
        out.append(f'<g class="mark"><title>{m}, {city}: {eur(v)} after costs</title>'
                   f'<rect class="hit" x="{L + i*bw:.1f}" y="{T}" width="{bw:.1f}" height="{ph}"/>'
                   f'<rect class="{cls}" x="{x:.1f}" y="{top:.1f}" width="{w:.1f}" height="{max(1, bot-top):.1f}" rx="2"/></g>')
        out.append(f'<text class="tick" x="{x + w/2:.1f}" y="{H-B+16}" text-anchor="middle">{m}</text>')
    bx = L + data.index(best) * bw + bw / 2
    out.append(f'<text class="value" x="{bx:.1f}" y="{y(best[2])-7:.1f}" text-anchor="middle">{eur(best[2])}</text>')
    svg = f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Bar chart: what each gig earned after costs, in euros. Best: June in Athens, {eur(best[2])}. Two gigs lost money.">{"".join(out)}</svg>'
    return ("What each gig earned after costs", "Euros per gig. Two of eight lost money.", svg,
            table("What each gig earned after costs, in euros", ("Gig", "After costs"), [(f"{m}, {c}", eur(v)) for m, c, v in data]))


def streams():
    months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
    vals = [8.1, 7.6, 11.9, 9.4, 10.2, 16.8, 13.1, 11.0, 12.4, 15.2, 13.9, 14.6]   # thousands
    shows = {0, 2, 4, 5, 8, 9}
    hi = 20
    ph = H - T - B
    y = lambda v: T + (hi - v) / hi * ph
    pw = W - L - R
    x = lambda i: L + 6 + i * (pw - 12) / 11
    out = [f'<line class="grid" x1="{L}" x2="{W-R}" y1="{y(v):.1f}" y2="{y(v):.1f}"/><text class="tick" x="{L-6}" y="{y(v)+4:.1f}" text-anchor="end">{str(v) + "k" if v else "0"}</text>' for v in (0, 5, 10, 15, 20)]
    pts = " ".join(f"{x(i):.1f},{y(v):.1f}" for i, v in enumerate(vals))
    out.append(f'<polyline class="line" points="{pts}"/>')
    for i in shows:
        out.append(f'<path class="show" d="M{x(i):.1f} {y(0)-1:.1f} v-7"/>')
    peak = vals.index(max(vals))
    for i, v in enumerate(vals):
        cls = "dot hl" if i == peak else "dot"
        out.append(f'<g class="mark"><title>{months[i]}: {v:.1f}k streams{", show that month" if i in shows else ""}</title>'
                   f'<rect class="hit" x="{x(i)-12:.1f}" y="{T}" width="24" height="{ph}"/>'
                   f'<circle class="{cls}" cx="{x(i):.1f}" cy="{y(v):.1f}" r="4"/></g>')
        if i % 2 == 0:
            out.append(f'<text class="tick" x="{x(i):.1f}" y="{H-B+16}" text-anchor="middle">{months[i]}</text>')
    out.append(f'<text class="value" x="{x(peak):.1f}" y="{y(vals[peak])-10:.1f}" text-anchor="middle">16.8k</text>')
    svg = f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Line chart: streams per month, in thousands, with show months marked. Streams peak in June at 16.8 thousand, the month after two shows.">{"".join(out)}</svg>'
    return ("Streams per month", "Thousands. Ticks on the baseline mark months with a show.", svg,
            table("Streams per month, in thousands", ("Month", "Streams"), [(months[i], f"{v:.1f}k" + (" (show)" if i in shows else "")) for i, v in enumerate(vals)]))


def sizes():
    data = [("S", 18), ("M", 46), ("L", 39), ("XL", 21), ("XXL", 7)]
    hi = 50
    ph = H - T - B
    y = lambda v: T + (hi - v) / hi * ph
    pw = W - L - R
    bw = pw / len(data)
    best = max(data, key=lambda d: d[1])
    out = [f'<line class="grid" x1="{L}" x2="{W-R}" y1="{y(v):.1f}" y2="{y(v):.1f}"/><text class="tick" x="{L-6}" y="{y(v)+4:.1f}" text-anchor="end">{v}</text>' for v in (0, 25, 50)]
    for i, (s, v) in enumerate(data):
        x = L + i * bw + bw * 0.25
        w = bw * 0.5
        cls = "bar hl" if (s, v) == best else "bar"
        out.append(f'<g class="mark"><title>{s}: {v} shirts</title>'
                   f'<rect class="hit" x="{L + i*bw:.1f}" y="{T}" width="{bw:.1f}" height="{ph}"/>'
                   f'<rect class="{cls}" x="{x:.1f}" y="{y(v):.1f}" width="{w:.1f}" height="{y(0)-y(v):.1f}" rx="2"/></g>')
        out.append(f'<text class="tick" x="{x + w/2:.1f}" y="{H-B+16}" text-anchor="middle">{s}</text>')
        out.append(f'<text class="value{" strong" if (s, v) == best else ""}" x="{x + w/2:.1f}" y="{y(v)-7:.1f}" text-anchor="middle">{v}</text>')
    out.append(f'<line class="base" x1="{L}" x2="{W-R}" y1="{y(0):.1f}" y2="{y(0):.1f}"/>')
    svg = f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Bar chart: shirts sold by size. M sells most, 46; XXL least, 7.">{"".join(out)}</svg>'
    return ("Shirts sold by size", "This year. Order more M and L, fewer XXL.", svg,
            table("Shirts sold by size", ("Size", "Shirts"), [(s, str(v)) for s, v in data]))


panels = []
for title, sub, svg, tbl in (gigs(), streams(), sizes()):
    panels.append(f'<figure class="dash-panel"><figcaption><span class="dash-title">{title}</span><span class="dash-sub">{sub}</span></figcaption>{svg}{tbl}</figure>')
html = ('<div class="dash">\n  <p class="dash-note">Example only. A band\'s year, with made-up numbers.</p>\n  <div class="dash-grid">\n    '
        + "\n    ".join(panels) + "\n  </div>\n</div>\n")
out = ROOT / "_src" / "partials"
out.mkdir(exist_ok=True)
(out / "dashboard.html").write_text(html, encoding="utf-8")
print("wrote _src/partials/dashboard.html", len(html), "bytes")
