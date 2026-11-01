# Coremosh website

The site of Coremosh, a software studio for music (a studio in the game-studio sense, not a recording studio). It shows the work (Bandeon, tiltguild.com) and what Coremosh makes: apps, design (logos and identities, album and single covers, posters for live shows, the look of sites and apps, release cards) and analytics for music, and websites for anyone (bands, artists, and businesses outside music). Every path ends at Contact.

Nav: Work, Design, Analytics, Contact. Studio and Privacy live in the footer.

Live address: https://www.coremosh.com (coremosh.com redirects there). Hosted on GitHub Pages from `main`. Stefanos commits and pushes from GitHub Desktop on Windows.

## Content rules

- Motto (Stefanos, 1 Nov 2026): "We build the core. You make the noise."
- English only.
- No prices, rates, packages or offers anywhere. Show the work, then "Get in touch".
- Brand only: Coremosh speaks as "we". No personal names, no employer, no CV.
- The idle game is not shown until Stefanos says so.
- Bandeon: studios are hidden in the app, so the site does not mention them.
- Plain verbs, sentence case, no em dashes, no all-caps labels.

## Look

- Dark. Tokens in `:root` of `css/site.css`: floor `#171513`, paper `#ede7dd`, aluminium `#958f86`, edge `#2e2a26`, amber `#f2a33a`.
- Amber is the only accent: what is live or what you can act on. No gradients, glows or shadows.
- One typeface, Bricolage Grotesque (self-hosted, width 75 to 100, weight 200 to 800): condensed and heavy for headlines, normal width for text. The one exception is Caveat (self-hosted, OFL, credited on /privacy/) for the handwritten notes on the Analytics charts.
- The Analytics charts are printed sheets on the dark floor, each with its own palette. Bars: cream `#fffdf7`, ink `#222`, red `#d62828` for the series that matters, blue `#457b9d` for the rest. Line: paper `#faf7f0`, ink `#1a1a1a`, accent `#c1121f`. Labels at least 28px. One reading per screen, only numbers from the data.
- Left-aligned, ruled lists rather than cards. Numbering only for real sequences.
- The hero figure "Pit" is a Hairline figure (`@lucasmarkes/hairline`, MIT). Keep its licence notice; credit on /privacy/.

## How pages are made

- Page bodies live in `_src/pages/*.html`, each with a header comment (path, title, description, nav). The shared header and footer are in `_src/layout.html`.
- `python3 scripts/build.py` writes every page to the repo root (`index.html`, `work/index.html`, ...). Edit `_src`, never the built files, then build.
- The stylesheet link carries a version tag from its contents, so browsers never mix new pages with an old cached stylesheet.
- `{{include:name}}` in a page pulls in `_src/partials/name.html`.
- Pit: the figure is `_figures/pit.js`; `build.py` bundles it with the engine (`_figures/hairline-kernel.js`, unchanged, MIT notice from `_figures/HAIRLINE-LICENSE`) and `_figures/host.js` into `js/pit.js`. Check a change with the Hairline look tool before building.
- Case-study loops and work images: `python3 scripts/make_loop.py <desktop-full.png> <phone-full.png> <name>` writes `media/<name>.mp4`, its poster and the 16:10 work images from two full-page screenshots. `js/loops.js` plays them only on screen, never under reduced motion, with a pause button.
- Every script in `js/` gets a version tag from its contents: `{{v_<name>}}` (for example `{{v_story}}`).
- Selected work scenes (home and /work/) are one partial, `_src/partials/scenes.html`: the two-device loop on screens 600px and wider, and a phone-only crop (`media/<name>-phone.mp4`, cropped from the two-device loop with ffmpeg `crop=420:710:1145:95`) on phones. Their posters load only as they come near (`data-poster`).
- The Analytics example lives in `_src/pages/analytics.html` as data (`data-chart`, made-up numbers, labelled as such) and is drawn by `js/story.js`: bars grow over 20 frames with an ease-out, counters roll to the exact value and stop, one handwritten note per bar chart; the line draws at 800px/s, never lifts, the camera keeps the pen in the middle third, the loop at the peak floods on the beat, then the camera pulls back. Each chart keeps a table version.
- The Bandeon construction on /design/ draws itself once on screen (`data-play`, `js/motion.js`). The official logo files in `media/design/` are used unchanged.

## Local preview

Stefanos previews on his laptop with `serve.cmd` (runs `node scripts/serve.mjs`, http://localhost:4000, no packages). The server mirrors GitHub Pages: folder index pages, redirect to a trailing slash, 404.html, and nothing under `_` or `.` folders. Hosting may move to papaki later; the site is plain files either way.

## Motion

- Nothing moves for readers who ask for less motion: hero intro, grain, drawings and scroll-linked effects sit under `prefers-reduced-motion: no-preference`, and the scripts show finished states.
- Scroll-linked effects (reveals, ticker, design reel, pinned work scenes) use CSS `animation-timeline` inside `@supports`; other browsers get the same page standing still.
- Anything that plays on its own has a pause or replay control, and plays only while on screen.

## Budgets

First paint under 1.5 s on a phone over 4G, under 100 KB of JavaScript per page, no cookies, nothing loaded from other sites while reading (videos and figures are self-hosted).
