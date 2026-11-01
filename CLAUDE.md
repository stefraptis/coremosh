# Coremosh website

The site of Coremosh software studios. It shows the work (Bandeon, tiltguild.com) and what Coremosh makes: apps, websites and design (logos, album and single covers, posters for live shows, release cards, the look of sites and apps). Websites are for anyone, music or not. Every path ends at Contact.

Nav: Work, Design, About, Contact (About is /about/, titled "About the studio"). Privacy in the footer.

Live address: https://www.coremosh.com (coremosh.com redirects there). Hosted on GitHub Pages from `main`. Stefanos commits and pushes from GitHub Desktop on Windows.

## Content rules

- Motto (Stefanos, 1 Nov 2026): "We build the core. You make the noise."
- English only.
- No prices, rates, packages or offers anywhere. Show the work, then "Get in touch".
- Brand only: Coremosh speaks as "we". No personal names, no employer, no CV.
- No analytics offering on the site (removed 1 Nov 2026 at Stefanos's request).
- Design: say what we offer and show the pieces. No write-ups that analyse the logos. The Bandeon logo is not final: do not show it anywhere.
- Say "Coremosh software studios". Do not explain the name with a game-studio comparison.
- The idle game is not shown until Stefanos says so.
- Bandeon: studios are hidden in the app, so the site does not mention them.
- Plain verbs, sentence case, no em dashes, no all-caps labels.

## Look: a rehearsal room at night, drawn clean (1 Nov 2026)

The idea stays (dark room, warm stage light, the metal logo) but the execution is modern and crisp. Stefanos rejected the "sketchy" version: no worn-ink filters, torn paper, tape, crooked prints or stamps. Do not copy outside references; they only show what "modern" means.

- **Logo leads:** a metal-style wordmark, the one rough thing on the page. `brand/coremosh-logo.svg` (light, header) and `brand/coremosh-logo-dark.svg` (black, on the amber footer) are vector traces of Stefanos's `brand-logo/` JPEGs. Never redraw it.
- **Colours** (tokens in `:root` of `css/site.css`): bg `#0b0a09`, surfaces `#13110f` and `#1a1714`, hairline borders in bone at 9% and 18%, text `#efe9de`, muted `#a39d93`, amber `#f2a33a` (buttons, the current nav item, kickers, step numbers, the footer, the word "noise."), ember `#b8321f` only as a faint light. Screen panel `#181413` (the colour the product loops are filmed on).
- **Atmosphere:** soft amber and ember stage-light glows behind the hero, page heads and closing call, and a fine still grain. No gradients on text, no glows on buttons.
- **No hard colour edges.** Every light fades out (masks on the hero and page-head glows), bands fade in and out, and the room warms into the amber footer over 260px (`.foot::before`). A colour that stops at a straight line looks unfinished.
- **Type:** Pirata One for headlines (chosen 1 Nov as a clean relative of the logo: tall, condensed, angular, not metal; one weight, so never bold it; its OFL has a Reserved Font Name, so use the published file unmodified, no own subsetting), Schibsted Grotesk (text), Martian Mono (badge, nav, kickers, meta). All self-hosted and preloaded, OFL, credited on /privacy/. Alternative Stefanos saw: Grenze Gotisch.
- **Components:** a pill badge ("Coremosh software studios") with an amber light; pill nav with the current page filled amber; rounded amber buttons and outlined secondary buttons; rounded panels with hairline borders for project media, services (with small line icons), features, facts and the form; a numbered timeline for how we work; a lit panel for the closing call.
- Kickers use music words sparingly (Latest releases, The lineup, Setlist, Encore). Numbering only for real sequences.
- The hero figure "Pit" is a Hairline figure (`@lucasmarkes/hairline`, MIT), no caption. Keep its licence notice; credit on /privacy/.

## Motion

Only where it does something:
- One load sequence on the home page: the stage light comes up, the badge, the two motto lines and then the lead and buttons rise in (about 1.3 s, CSS only, scoped to `.page-home`).
- Pit, the Hairline figure.
- The product loops (two-device on screens 600px and wider, phone-only crop on phones): play only on screen, never on their own under reduced motion, with a pause button.
- "How we work" plays once, the first time it is on screen: 01 lights, the line draws to 02, and so on to 04, then all settle (`js/motion.js` adds `.is-armed` and `.is-on`).
- A light follows the cursor across cards and panels (`.service`, `.print`, `.features li`, `.call-panel`, `.form-sheet`, `.facts`): a soft amber glow inside and a brighter edge near the pointer. `js/motion.js` adds `.spot` and a `.spot-light` span, only with a mouse or pen. The hero's stage light leans toward the cursor (registered `--hx`/`--hy`).
- Short hover moves: panels lift 2px, videos zoom 1.5%, arrows nudge.
Nothing else: no scroll effects, no tickers, no moving grain. With reduced motion, nothing plays on its own (the cursor light still follows the pointer).
- The hero headline is sized to its own column (`container-type` on `.hero-copy`, `cqi` units), so it never runs into Pit at any screen width.

## How pages are made

- Page bodies live in `_src/pages/*.html`, each with a header comment (path, title, description, nav). The shared header and footer are in `_src/layout.html`.
- `python3 scripts/build.py` writes every page to the repo root (`index.html`, `work/index.html`, ...). Edit `_src`, never the built files, then build.
- The stylesheet and every script in `js/` carry a version tag from their contents (`{{v_css}}`, `{{v_<name>}}`), so browsers never mix new pages with old cached files.
- `{{include:name}}` in a page pulls in `_src/partials/name.html`. The project blocks on Home and Work are one partial, `_src/partials/projects.html`.
- Pit: the figure is `_figures/pit.js`; `build.py` bundles it with the engine (`_figures/hairline-kernel.js`, unchanged, MIT notice from `_figures/HAIRLINE-LICENSE`) and `_figures/host.js` into `js/pit.js`. Check a change with the Hairline look tool before building.
- Loops: `python3 scripts/make_loop.py <desktop-full.png> <phone-full.png> <name>` writes `media/<name>.mp4`, its poster and 16:10 images. The phone-only version is cropped from it with ffmpeg `crop=420:710:1145:95` into `media/<name>-phone.mp4` plus a poster. In the projects partial the posters load only as they come near (`data-poster`, handled by `js/loops.js`).
- Design examples live in `media/design/` (the Tilt Guild release cards).

## Local preview

Stefanos previews on his laptop with `serve.cmd` (runs `node scripts/serve.mjs`, http://localhost:4000, no packages). The server mirrors GitHub Pages: folder index pages, redirect to a trailing slash, 404.html, and nothing under `_` or `.` folders. Hosting may move to papaki later; the site is plain files either way.

## Budgets

First paint under 1.5 s on a phone over 4G, under 100 KB of JavaScript per page, no cookies, nothing loaded from other sites while reading (videos, fonts, textures and figures are self-hosted).
