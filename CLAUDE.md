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

## Look: grunge on a modern grid (1 Nov 2026)

The idea is the rehearsal-room wall: a black floor with dust and a spotlight, photocopied paper sheets with torn edges, amber gaffer tape, worn ink on the big words. Underneath, a strict grid, plain text and quiet controls, so it reads as designed rather than messy.

- **Logo leads:** a metal-style wordmark. `brand/coremosh-logo.svg` (light, header) and `brand/coremosh-logo-dark.svg` (black, on the amber footer) are vector traces of Stefanos's `brand-logo/` JPEGs. Never redraw it.
- **Colours** (tokens in `:root` of `css/site.css`): floor `#0d0c0b`, bone `#efe9de` text, dust `#a39d93` quiet text; paper `#ece6d9` and sheet `#f6f2e9` with ink `#161412` and smudge `#5b554c`; amber `#f2a33a` for tape, buttons, the stamp, the current nav item and the footer; screen panel `#181413` (the colour the product loops are filmed on).
- **Type:** Big Shoulders Display (headlines, weight 800 to 900, sentence case), Schibsted Grotesk (text), Martian Mono (labels, nav, buttons, meta). All self-hosted and preloaded, Latin subsets, OFL, credited on /privacy/.
- **Textures and marks**, all CSS or inline SVG: dust on the floor and speckle on paper (`--dust-tex`, `--speckle`, `--blotch`); torn edges (`--torn-top`, `--torn-bottom`) on `.paper` sections and the footer; the worn-ink filter `#worn` (inline in `_src/layout.html`) on big headings via `class="worn"`; `.tape` behind a word; `.print` for anything taped to the wall (paper mat, two tape strips, slightly crooked, straightens on hover); `.kicker` mono labels with a small square; buttons are amber blocks with a hard offset shadow.
- **Sections alternate** floor and paper. Kickers use music words sparingly (Latest releases, The lineup, Setlist, Encore).
- Numbering only for real sequences (the setlist of how we work).
- The hero figure "Pit" is a Hairline figure (`@lucasmarkes/hairline`, MIT), no caption, with a static "2026" stamp beside it. Keep its licence notice; credit on /privacy/.

## Motion

Only where it does something:
- One load sequence on the home page: the motto lines are slapped up, the tape goes on under "noise.", the stamp comes down, then the lead and buttons settle (about 1.5 s, CSS only, scoped to `.page-home`).
- Pit, the Hairline figure.
- The product loops (two-device on screens 600px and wider, phone-only crop on phones): play only on screen, never on their own under reduced motion, with a pause button.
- Short hover moves: prints straighten, buttons press into their shadow, arrows nudge.
Nothing else: no scroll effects, no tickers, no moving grain. With reduced motion, nothing moves.

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

First paint under 1.5 s on a phone over 4G, under 100 KB of JavaScript per page, no cookies, nothing loaded from other sites while reading (videos, fonts, textures and figures are self-hosted).
