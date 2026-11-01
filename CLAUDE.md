# Coremosh website

The site of Coremosh, a software studio for music (a studio in the game-studio sense, not a recording studio). It shows the work (Bandeon, tiltguild.com) and what Coremosh makes (apps, websites, analytics), and every path ends at Contact.

Live address: https://www.coremosh.com (coremosh.com redirects there). Hosted on GitHub Pages from `main`. Stefanos commits and pushes from GitHub Desktop on Windows.

## Content rules

- English only.
- No prices, rates, packages or offers anywhere. Show the work, then "Get in touch".
- Brand only: Coremosh speaks as "we". No personal names, no employer, no CV.
- The idle game is not shown until Stefanos says so.
- Bandeon: studios are hidden in the app, so the site does not mention them.
- Plain verbs, sentence case, no em dashes, no all-caps labels.

## Look

- Dark. Tokens in `:root` of `css/site.css`: floor `#171513`, paper `#ede7dd`, aluminium `#958f86`, edge `#2e2a26`, amber `#f2a33a`.
- Amber is the only accent: what is live or what you can act on. No gradients, glows or shadows.
- One typeface, Bricolage Grotesque (self-hosted, width 75 to 100, weight 200 to 800): condensed and heavy for headlines, normal width for text.
- Left-aligned, ruled lists rather than cards. Numbering only for real sequences.
- The hero figure "Pit" is a Hairline figure (`@lucasmarkes/hairline`, MIT). Keep its licence notice; credit on /privacy/.

## How pages are made

- Page bodies live in `_src/pages/*.html`, each with a header comment (path, title, description, nav). The shared header and footer are in `_src/layout.html`.
- `python3 scripts/build.py` writes every page to the repo root (`index.html`, `work/index.html`, ...). Edit `_src`, never the built files, then build.
- The stylesheet link carries a version tag from its contents, so browsers never mix new pages with an old cached stylesheet.

## Budgets

First paint under 1.5 s on a phone over 4G, under 100 KB of JavaScript per page, no cookies, nothing loaded from other sites while reading (videos and figures are self-hosted).
