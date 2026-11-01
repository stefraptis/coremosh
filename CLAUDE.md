# Coremosh website

The site of Coremosh, a software studio for music (a studio in the game-studio sense, not a recording studio). It shows the work (Bandeon, tiltguild.com) and what Coremosh makes: apps, websites and design (logos, album and single covers, posters for live shows, release cards, the look of sites and apps). Websites are for anyone, music or not. Every path ends at Contact.

Nav: Work, Design, Studio, Contact. Privacy in the footer.

Live address: https://www.coremosh.com (coremosh.com redirects there). Hosted on GitHub Pages from `main`. Stefanos commits and pushes from GitHub Desktop on Windows.

## Content rules

- Motto (Stefanos, 1 Nov 2026): "We build the core. You make the noise."
- English only.
- No prices, rates, packages or offers anywhere. Show the work, then "Get in touch".
- Brand only: Coremosh speaks as "we". No personal names, no employer, no CV.
- No analytics offering on the site (removed 1 Nov 2026 at Stefanos's request).
- Design: say what we offer and show the pieces. No write-ups that analyse the logos.
- The idle game is not shown until Stefanos says so.
- Bandeon: studios are hidden in the app, so the site does not mention them.
- Plain verbs, sentence case, no em dashes, no all-caps labels.

## Look (redesign, 1 Nov 2026)

- The Coremosh logo leads: a metal-style wordmark, in the header (52px tall on desktop) and full width in the footer. `brand/coremosh-logo.svg` (light, #f4f2ee) and `brand/coremosh-logo-dark.svg` are vector traces of Stefanos's `brand-logo/` JPEGs. Keep the logo as is; never redraw it.
- Black and white. Tokens in `:root` of `css/site.css`: bg `#0a0a0a`, text `#f4f2ee`, muted `#9a968f`, line `#262626`, screen panel `#181413` (the colour the product loops are filmed on, so they sit seamlessly), amber `#f2a33a`.
- Amber stays small: the current nav item, focus rings, and the one lit figure in Pit. Buttons are white pills; secondary buttons are outlined.
- One typeface, Archivo (self-hosted, latin, weight 100 to 900, OFL, credited on /privacy/), set quietly: weight 500 headings with tight tracking, 400 text. The logo carries the character.
- Generous space, left-aligned, thin rules. Big product media on rounded panels. Numbering only for real sequences.
- The hero figure "Pit" is a Hairline figure (`@lucasmarkes/hairline`, MIT). No caption under it. Keep its licence notice; credit on /privacy/.

## Motion

Only where it shows something:
- Pit, the Hairline figure in the hero.
- The product loops (two-device on screens 600px and wider, phone-only crop on phones): play only on screen, never on their own under reduced motion, with a pause button.
- Short hover transitions (150ms).
Nothing else moves: no scroll effects, no intros, no tickers, no grain.

## How pages are made

- Page bodies live in `_src/pages/*.html`, each with a header comment (path, title, description, nav). The shared header and footer are in `_src/layout.html`.
- `python3 scripts/build.py` writes every page to the repo root (`index.html`, `work/index.html`, ...). Edit `_src`, never the built files, then build.
- The stylesheet and every script in `js/` carry a version tag from their contents (`{{v_css}}`, `{{v_<name>}}`), so browsers never mix new pages with old cached files.
- `{{include:name}}` in a page pulls in `_src/partials/name.html`. The project blocks on Home and Work are one partial, `_src/partials/projects.html`.
- Pit: the figure is `_figures/pit.js`; `build.py` bundles it with the engine (`_figures/hairline-kernel.js`, unchanged, MIT notice from `_figures/HAIRLINE-LICENSE`) and `_figures/host.js` into `js/pit.js`. Check a change with the Hairline look tool before building.
- Loops: `python3 scripts/make_loop.py <desktop-full.png> <phone-full.png> <name>` writes `media/<name>.mp4`, its poster and 16:10 images. The phone-only version is cropped from it with ffmpeg `crop=420:710:1145:95` into `media/<name>-phone.mp4` plus a poster. In the projects partial the posters load only as they come near (`data-poster`, handled by `js/loops.js`).
- Design examples live in `media/design/`. The Bandeon logo files there are the official ones, used unchanged.

## Local preview

Stefanos previews on his laptop with `serve.cmd` (runs `node scripts/serve.mjs`, http://localhost:4000, no packages). The server mirrors GitHub Pages: folder index pages, redirect to a trailing slash, 404.html, and nothing under `_` or `.` folders. Hosting may move to papaki later; the site is plain files either way.

## Budgets

First paint under 1.5 s on a phone over 4G, under 100 KB of JavaScript per page, no cookies, nothing loaded from other sites while reading (videos, fonts and figures are self-hosted).
