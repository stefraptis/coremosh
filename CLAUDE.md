# Coremosh website

The site of Coremosh software studios. It shows the work (Bandeon, tiltguild.com) and what Coremosh makes: apps, websites, and design and artwork. Websites are for anyone, music or not.

**Design is back as a service** (Stefanos, 9 Nov 2026; it was off from 8 Nov). Three areas of work: Apps, Websites, Design and artwork (visual identities, music artwork and graphic design). On the site: a third card in What we do ("Design and artwork", link "Ask about design", which picks the topic in the form). No separate list of design areas: Stefanos removed the `#design` strip on 9 Nov because the card already says it. The contact form has the topic "Design and artwork" (`design`, also `/?about=design`). It must not read like a generic design agency: same cards, same voice, music first. The old Design section with Tilt Guild release cards (`media/design/`, styles `.offer` and `.wall`) is still off; it is in commit `6df29c0` if Stefanos wants to show pieces. Every path ends at Contact.

**One page** (Stefanos, 2 Nov 2026; order changed 9 and 14 Nov). Everything is on the home page, in this order: hero, About the studio (`#about`, title big on the left, text on the right), What we do (`#services`, apps, websites, design and artwork), How we work (`#process`, kicker "Setlist", intro "From the first conversation to long after launch."; moved before Work on 14 Nov), Work (`#work`), Contact with the form (`#contact`). The only other pages are /privacy/ and the 404 page. The menu links to `/#about`, `/#work`, `/#contact` (so it also works from Privacy); `js/motion.js` marks the section in view. Contact buttons everywhere: hero "Get in touch", "Start yours", and "Ask about an app / a website / design" links that also pick the topic in the form (`data-about`, or `/?about=website`).

Live address: https://www.coremosh.com (coremosh.com redirects there). Hosted on GitHub Pages from `main`. Stefanos works on Windows and uses git in the terminal for this repo (not GitHub Desktop): `git pull` to get changes.

## Content rules

- Motto (Stefanos, 1 Nov 2026): "We build the core. You make the noise."
- English only, British spelling (organise, colour, centralised, optimisation). Proper names keep their own spelling (SIL Open Font License).
- The home page copy is Stefanos's own text (9 Nov 2026, "Website Copy 2026"): About, What we do, the two projects and How we work (Discover, Design, Develop, Maintain). Keep it as written; only adapt headings to sentence case with "and" instead of "&" (so "Design & Artwork" is "Design and artwork"). Each service card has a one-line summary (`.service-line`, Stefanos's wording) above its description.
- Tone (Stefanos): professional, direct and confident; no generic SaaS terms or promotional language; the link between music and software stays clear without limiting the studio to music; describe real functions; concise over marketing.
- No prices, rates, packages or offers anywhere. Show the work, then "Get in touch".
- Brand only: Coremosh speaks as "we". No personal names, no employer, no CV.
- No analytics offering on the site (removed 1 Nov 2026 at Stefanos's request).
- Design: say what we offer (and show pieces if Stefanos adds them). No write-ups that analyse the logos. The Bandeon logo is not final: do not show it anywhere.
- Say "Coremosh software studios". Do not explain the name with a game-studio comparison.
- The idle game is not shown until Stefanos says so.
- Bandeon: studios are hidden in the app, so the site does not mention them.
- Plain verbs, sentence case, no em dashes, no all-caps labels.
- Write for clients, not developers: no stack, frameworks, stylesheets, file sizes, speed budgets or accessibility test results on the site. Benefits a client understands are fine (fast, responsive, search engine optimisation, accessible across devices).

## Look: a rehearsal room at night, drawn clean (1 Nov 2026)

The idea stays (dark room, warm stage light, the metal logo) but the execution is modern and crisp. Stefanos rejected the "sketchy" version: no worn-ink filters, torn paper, tape, crooked prints or stamps. Do not copy outside references; they only show what "modern" means.

- **Logo leads:** a metal-style wordmark, the one rough thing on the page. On the home page it starts big and centred above the motto (hero slot `.hero-logo .slot`) and travels into the header top-left as the page scrolls (9 Nov). Elsewhere it sits in the header. `brand/coremosh-logo.svg` (light) and `brand/coremosh-logo-dark.svg` (black) are vector traces of Stefanos's `brand-logo/` JPEGs. Never redraw it.
- **Colours** (tokens in `:root` of `css/site.css`): bg `#0b0a09`, surfaces `#13110f` and `#1a1714`, hairline borders in bone at 9% and 18%, text `#efe9de`, muted `#a39d93`, amber `#f2a33a` (buttons, the current nav item, kickers, step numbers, the word "noise."), ember `#b8321f` only as a faint light. Screen panel `#181413` (the colour the product loops are filmed on).
- **Atmosphere:** soft amber and ember stage-light glows behind the hero (centred above the logo), page heads and the contact panel, and a fine still grain. Below the hero, each section has a faint worn-surface patch (light scratches, specks, scuffs) on alternating sides, fading out at the edges (Stefanos, 9 Nov: "extremely subtle", hardcore/underground, not grungy). No gradients on text, no glows on buttons. Still no worn-ink filters, torn paper, tape or stamps.
- **No hard colour edges.** Every light fades out (masks on the hero and page-head glows), and bands fade in and out. A colour that stops at a straight line looks unfinished.
- **Type:** Big Shoulders Display (headlines, crisp, weight 800 to 900, sentence case), Chivo (text; replaced Schibsted Grotesk on 9 Nov, which Stefanos found generic), Martian Mono (badge, nav, kickers, meta). All self-hosted and preloaded, Latin subsets, OFL, credited on /privacy/. Pirata One (closer to the logo) was tried on 1 Nov and rejected by Stefanos; keep Big Shoulders.
- **Hero:** a gig poster, centred: the logo, the badge, the motto, the lead, the buttons, then Pit (the crowd) below.
- **Components:** a pill badge ("Coremosh software studios") with an amber light; a plain text menu where each link gets a glowing amber hairline, faded at both ends like the lit card edges, drawn from the centre on hover and kept under the section in view (no pill); rounded amber buttons and outlined secondary buttons; rounded panels with hairline borders for project media, services (with small line icons), what-we-built cards and the form; a numbered timeline for how we work; a lit contact panel; the topic field as amber radio pills. The header is sticky and turns solid with a blur once the page scrolls.
- **Footer:** one quiet line on the dark page, like the Tilt Guild site: "© 2026 Coremosh software studios" and the links About, Work, Contact, Privacy. No logo, no amber, no motto (Stefanos, 2 Nov: the big amber footer was too much).
- Kickers use music words sparingly (Latest releases, The lineup, Setlist, Encore). Numbering only for real sequences.
- The hero figure "Pit" is a Hairline figure (`@lucasmarkes/hairline`, MIT), no caption. Keep its licence notice; credit on /privacy/.

## Motion

Only where it does something:
- One load sequence on the home page: the stage light comes up, the logo fades in, then the badge, the two motto lines, the lead and buttons rise in (about 1.4 s, CSS only, scoped to `.page-home`).
- The logo's trip from the hero to the header, tied to the scroll (Stefanos asked for it, 9 Nov). It is the header's own image, laid out at the hero size and scaled down into place (never up, so it stays sharp); `js/motion.js` adds `.logo-fly`. With reduced motion it does not travel: `.logo-still`, the header logo fades in once the hero logo has scrolled away. An inline script in the head adds `.js` so the header logo is hidden on the home page until it is placed. On the home page the menu also waits: it fades in as the logo lands (`.is-docked`, or `.logo-out` with reduced motion), so the opening shows no menu (Stefanos, 9 Nov). It shows at once if someone tabs into it (`:focus-within`). Privacy, the 404 page and deep links show it from the start.
- Pit, the Hairline figure.
- The product loops (two-device on screens 600px and wider, phone-only crop on phones): play only on screen, never on their own under reduced motion, with a pause button.
- "How we work" plays once, the first time it is on screen: 01 lights, the line draws to 02, and so on to 04, then all settle (`js/motion.js` adds `.is-armed` and `.is-on`).
- A light follows the cursor across cards and panels (`.service`, `.print`, `.call-panel`; add `.built li` or others in `js/motion.js` if wanted): a soft amber glow inside and a brighter edge near the pointer. `js/motion.js` adds `.spot` and a `.spot-light` span, only with a mouse or pen. The hero's stage light leans toward the cursor (registered `--hx`/`--hy`).
- Short hover moves: panels lift 2px, videos zoom 1.5%, arrows nudge.
Nothing else: no other scroll effects, no tickers, no moving grain or textures. With reduced motion, nothing plays on its own (the cursor light still follows the pointer).
- The hero motto keeps its two lines from 760px up (sized in `vw`), and wraps on phones.

## How pages are made

- Page bodies live in `_src/pages/*.html`, each with a header comment (path, title, description, nav). The shared header and footer are in `_src/layout.html`.
- `python3 scripts/build.py` writes every page to the repo root (`index.html`, `work/index.html`, ...). Edit `_src`, never the built files, then build.
- The stylesheet and every script in `js/` carry a version tag from their contents (`{{v_css}}`, `{{v_<name>}}`), so browsers never mix new pages with old cached files.
- `build.py` also writes `sitemap.xml` (every page with a folder path, so not the 404 page). `robots.txt` points to it. The sitemap is submitted in Google Search Console (domain property coremosh.com, verified by a TXT record at papaki: keep that record).
- Textures: `python3 scripts/make_textures.py` (numpy, Pillow, fixed seed) writes `media/texture-scratch.webp`, `-speck` and `-worn`; the placement is at the end of `css/site.css`. Sections clip them sideways (`overflow-x: clip`).
- `{{include:name}}` in a page pulls in `_src/partials/name.html` (none in use now).
- Pit: the figure is `_figures/pit.js`; `build.py` bundles it with the engine (`_figures/hairline-kernel.js`, unchanged, MIT notice from `_figures/HAIRLINE-LICENSE`) and `_figures/host.js` into `js/pit.js`. Check a change with the Hairline look tool before building.
- Loops: `python3 scripts/make_loop.py <desktop-full.png> <phone-full.png> <name>` writes `media/<name>.mp4`, its poster and 16:10 images. The phone-only version is cropped from it with ffmpeg `crop=420:710:1145:95` into `media/<name>-phone.mp4` plus a poster. On the page the posters load only as they come near (`data-poster`, handled by `js/loops.js`). The 16:10 images are not used now.

## Local preview

Stefanos previews on his laptop with `serve.cmd` (runs `node scripts/serve.mjs`, http://localhost:4000, no packages). The server mirrors GitHub Pages: folder index pages, redirect to a trailing slash, 404.html, and nothing under `_` or `.` folders. Hosting may move to papaki later; the site is plain files either way.

## Budgets

First paint under 1.5 s on a phone over 4G, under 100 KB of JavaScript per page, no cookies, nothing loaded from other sites while reading (videos, fonts, textures and figures are self-hosted).
