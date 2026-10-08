# Natsuku website — "The Director's Cut"

A static site: plain HTML, one stylesheet, one script, self-hosted fonts and WebP photos.
No build step, no platform fees, no outside services. Works on GitHub Pages as-is.

## What's in the folder

| File | Page |
|---|---|
| `index.html` | Prologue (home): showreel, the name, now showing, film, approach, prices, enquire |
| `stories.html` | Chapter I · Stories (four reels + moments from other weddings) |
| `story-rizqi-shuraifah.html`, `story-khair-syakirah.html`, `story-haris-erlynna.html`, `story-razalee-amirah.html` | The four story pages |
| `film.html` | Chapter II · Film with ThroughWebbedLens: screening room, Sakti & Tharenii on film and in stills, photo & film packages |
| `approach.html` | Chapter III · Approach (crew, not cast; 懐く; the six steps; the crew) |
| `investment.html` | Chapter IV · Investment (all packages, extras, booking terms) |
| `enquire.html` | Chapter V · Enquire (the slate → WhatsApp) |
| `404.html` | Shown by GitHub Pages for missing pages |
| `assets/css/site.css` | All styling. Colours and type sizes are the tokens at the top; scroll effects are in “scroll reveals” and “camera moves” near the end |
| `assets/js/site.js` | Page cuts, timecode, scroll reveals, showreel, lightbox, film player, WhatsApp slate |
| `assets/img/` | Photos as `name-WIDTH.webp` (portraits 600/1200, landscapes 720/1440, heroes 960/1600/2400) |
| `assets/fonts/` | Bodoni Moda (headings), Figtree (text, used where Avenir Next isn't installed) and a two-character Noto Serif JP subset for 懐く |
| `assets/brand/` | Logo badge, favicon, share image (`og.jpg`), film grain |

## Put it online (GitHub Pages, free)

1. On GitHub (account `natsukuco`), the site lives in the repository **`website`**.
2. Upload everything in this folder to the repository root. The web uploader takes about 100 files per commit, so upload `assets/img` in two or three goes, or use GitHub Desktop and push once.
3. Repository → **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`.
4. After a minute the site is live at **https://natsukuco.github.io/website/**. Your rate cards keep working at their current addresses.

## Using natsuku.co later

`natsuku.co` doesn't exist yet (no DNS record), so register it first. Then:

1. Settings → Pages → Custom domain: `natsuku.co`. GitHub adds a `CNAME` file for you.
2. At your domain registrar, add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus a `CNAME` record for `www` pointing to `natsukuco.github.io`.
3. Tick **Enforce HTTPS** once it's available.
4. Find and replace `https://natsukuco.github.io/website/` with `https://natsuku.co/` in all `.html` files (these are the share-preview links), and `/website/` with `/` in `404.html`.

## Common edits

- **WhatsApp number**: `assets/js/site.js` → `CONFIG.whatsapp` (digits only, with 65), plus the visible number `+65 9247 5310` in every `.html` file.
- **Prices**: they follow the 2026/27 rate card PDF. Package prices are in `investment.html` and `film.html` (search for the package name), the home page "From" prices are in `index.html`, and the enquiry form's package list is the `f-package` dropdown in `enquire.html`.
- **Rate card link**: the Drive link to the rate card PDF appears in every page footer, on `investment.html` and on `film.html`. Search for `1qA7vYu13YQF0fBHz8c6XMIGLbBtwfNn7` to replace it.
- **Text font**: visitors on iPhone, iPad and Mac see Avenir Next, which is built into those devices. Everyone else sees Figtree, a free lookalike (SIL Open Font License) in `assets/fonts`. To use a font you've licensed for the web instead (Avenir, Anko), add its `.woff2` files to `assets/fonts`, add an `@font-face` rule for it at the top of `site.css`, and put its name first in `--sans`.
- **Story text**: each `story-*.html` file. Scene titles are the `<h2 class="scene__title">` lines.
- **Films**: the screening room in `film.html` and the “Watch a wedding film” link in `index.html` play ThroughWebbedLens films from Google Drive in the site’s own player. Each film link holds the Drive file id twice: in `href` (`…/file/d/ID/view`) and in `data-film="ID"`. To swap a film, set the video in Drive to *Anyone with the link · Viewer*, copy the id from its share link (the part after `/d/`) and replace both. Drive needs to finish processing a new upload before it plays. MP4 (H.264) files play most reliably.
- **Scroll effects**: as you scroll, titles come into focus word by word, labels wipe on, lines draw, photos open from a letterbox, and the footer logo draws itself. Which elements get which effect is the `REVEALS` list in `assets/js/site.js`; the timings are under “scroll reveals” in `site.css`. The scroll-linked moves (parallax inside photos, the opening frame drifting away, full-width photos opening, the playhead tracking your place) are plain CSS under “camera moves”. Browsers without scroll timelines skip those and keep the reveals. Anyone whose device asks for reduced motion gets a still page.
- **Swapping a photo**: export a WebP at the two widths above, give it the same file name pattern, and update the `src`/`srcset` in the page.
- The bars, menu and footer are repeated in every page. If you change a link there, change it in all pages (or ask Claude to regenerate the site).

## Previewing on your computer

Double-clicking `index.html` works, but browsers block the page-to-page cuts on local files, so pages load plainly.
To see the transitions, run a local server in this folder: `python3 -m http.server 8000`, then open http://localhost:8000.
