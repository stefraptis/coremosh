"""Builds the Coremosh site from _src/ into the repo root.

Each page in _src/pages/ starts with a header comment:

    <!--
    path: /work/
    title: Work
    description: One sentence for search results and link previews.
    nav: work
    -->

The page body is wrapped in _src/layout.html and written to <path>index.html
(or to the file named by path when it ends in .html). The stylesheet gets a
version tag from its contents, so browsers never mix a new page with an old
cached stylesheet.

Run from the repo root:  python3 scripts/build.py
"""

import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "_src"
NAV_KEYS = ["work", "design", "about", "contact"]


def short_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def parse(page):
    text = page.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    if not m:
        raise SystemExit(f"{page.name}: missing header comment")
    meta = {}
    for line in m.group(1).strip().splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    for key in ("path", "title", "description"):
        if not meta.get(key):
            raise SystemExit(f"{page.name}: header needs '{key}'")
    return meta, text[m.end():].rstrip() + "\n"


def build_figure():
    """js/pit.js: the Hairline engine (MIT, notice kept), the site's host, and the Pit figure."""
    fig = ROOT / "_figures"
    licence = (fig / "HAIRLINE-LICENSE").read_text(encoding="utf-8").strip()
    parts = [
        "/*! Hairline engine, @lucasmarkes/hairline 0.5.1\n\n" + licence + "\n*/",
        (fig / "hairline-kernel.js").read_text(encoding="utf-8"),
        (fig / "host.js").read_text(encoding="utf-8"),
        "(() => {\n" + (fig / "pit.js").read_text(encoding="utf-8") + "\n})();",
    ]
    out = ROOT / "js" / "pit.js"
    out.parent.mkdir(exist_ok=True)
    out.write_text("\n".join(parts) + "\n", encoding="utf-8")


def main():
    build_figure()
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    v_css = short_hash(ROOT / "css" / "site.css")
    # Every script in js/ gets a version tag from its contents: {{v_loops}}, {{v_story}}, ...
    versions = {"v_" + js.stem: short_hash(js) for js in sorted((ROOT / "js").glob("*.js"))}
    built = []
    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse(page)
        nav = meta.get("nav", "")
        title = meta["title"]
        title_full = "Coremosh" if title == "Coremosh" else f"{title} | Coremosh"
        values = {
            "title_full": title_full,
            "description": meta["description"],
            "path": meta["path"],
            "nav": nav or "none",
            "v_css": v_css,
            **versions,
        }
        for key in NAV_KEYS:
            values[f"cur_{key}"] = ' aria-current="page"' if nav == key else ""
        body = re.sub(r"\{\{include:([\w-]+)\}\}",
                      lambda m: (SRC / "partials" / (m.group(1) + ".html")).read_text(encoding="utf-8"), body)
        html = layout.replace("{{body}}", body)
        for key, value in values.items():
            html = html.replace("{{" + key + "}}", value)
        leftover = re.findall(r"\{\{\w+\}\}", html)
        if leftover:
            raise SystemExit(f"{page.name}: unfilled {leftover}")
        path = meta["path"]
        out = ROOT / path.lstrip("/")
        if not path.endswith(".html"):
            out = out / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        built.append(str(out.relative_to(ROOT)))
    print("built:", ", ".join(built))


if __name__ == "__main__":
    main()
