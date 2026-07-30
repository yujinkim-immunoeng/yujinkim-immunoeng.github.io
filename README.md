# Yujin Kim — Faculty Portfolio Website

A minimal, English-language academic portfolio site. Built as a **no-build
static site** (plain HTML + CSS + vanilla JS). All editable content lives in two
JSON files, so updates are: **edit JSON → refresh browser → done.** No
framework, no build step, no server-side code.

## Structure

```
index.html            Home — hero, research keywords, research interests
about.html            About — biography, education, funding, honors
research.html         Research themes
publications.html     Publications + Patents
news.html             News — press coverage
contact.html          Contact — email, address, profiles, map
css/style.css         Design system (colors, type, layout) as CSS variables
js/nav.js             Nav active-state + sticky-nav shadow
js/render-profile.js  Renders Home / About / Research / News / Contact
js/render-publications.js  Renders Publications from publications.json
data/profile.json     Profile, bio, research interests/themes, funding, honors ← edit this
data/publications.json Publications + patents                            ← edit this
data/news.json        Press coverage                                     ← edit this
assets/headshot.jpg   Portrait used in the Home hero
```

## Preview locally

Pages fetch the JSON files at runtime, which browsers block over `file://`.
Serve the folder over HTTP instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Updating content

- **New / changed publication** — edit `data/publications.json`. Copy an
  existing entry as a template. Set `status` to one of `published`, `accepted`,
  `under_review`, `submitted`, `in_prep`; non-published items are automatically
  pinned to the top of their group and show a status badge instead of a year.
  No HTML/JS changes needed.
  - Once it is published, add `"doi": "10.xxxx/…"` (the bare identifier, no
    `https://`) and a **Link ↗** chip appears automatically.
  - `special_notes` shows up in two different places depending on the entry: on
    an unpublished paper it is the status remark in the badge row, and on a
    published one it is a cover credit ("Inside Back Cover") shown at the end of
    the journal line.
  - In the author string, `†` marks co-first and `*` marks (co-)corresponding;
    both render as superscripts, and the legend at the top of the page explains
    them.
- **Profile, biography, research interests, research themes, funding, honors** —
  edit `data/profile.json`. Each `email` entry is `{"label": "...", "address":
  "..."}`; the label shows as a small Work / Personal chip. Blank lines in `bio`
  split it into paragraphs, and any phrase listed in `bio_highlights` is
  rendered in burgundy (keep those phrases clear of the names in `bio_links`).
- **New press coverage** — `data/news.json` holds **one entry per paper**, with
  every outlet that covered it listed in its `outlets` array.
  - *Another outlet covered a paper already listed?* Append
    `{"name": …, "url": …}` to that entry's `outlets`. Add `"kind": "video"`
    for a broadcast or YouTube segment.
  - *Coverage of a new paper?* Copy a whole entry. Only `date` (as `YYYY-MM`,
    the paper's issue date — it renders as `ACS Nano · June 2023`) and
    `headline` are required; the page sorts by date, newest first. Headlines
    are written in English because the site is English-only.
  - For the square thumbnail, put a square 320px image in `assets/news/` and
    set `"image": "assets/news/<file>"` plus an `"image_alt"` describing it.
    Without an image, `thumb` (e.g. `"ACS Nano"`) generates a text tile.
- **Research theme figure** — put the image in `assets/research/` and add
  `"figure": "assets/research/<file>"` to that theme in `data/profile.json`.
  Without one, the card shows the theme's line icon instead.
- **New headshot** — replace `assets/headshot.jpg` (see `assets/README.txt`).
- **Design (colors, fonts, spacing)** — edit the CSS variables at the top of
  `css/style.css`, then bump the `?v=` number on the stylesheet link in each
  HTML file so browsers pick up the change.

Everything in `data/*.json` is served publicly, whether or not a page currently
displays it.

## Deploy (GitHub Pages)

The repository is named `<username>.github.io`, so Pages serves it at the domain
root. Push to `main`, then enable Pages under Settings → Pages with source
`main` / root. No build step is required — the files are served as-is
(`.nojekyll` keeps Jekyll out of the way).
