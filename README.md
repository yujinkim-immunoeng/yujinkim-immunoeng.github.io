# Yujin Kim — Faculty Portfolio Website

A minimal, English-language academic portfolio site. Built as a **no-build
static site** (plain HTML + CSS + vanilla JS). All editable content lives in two
JSON files, so updates are: **edit JSON → refresh browser → done.** No
framework, no build step, no server-side code.

## Structure

```
index.html            Home — hero, research keywords, research interests
about.html            About — biography, education, funding, honors
publications.html     Publications + Patents
contact.html          Contact — email, address, profiles, map
research.html         Research themes (not currently linked from the site)
css/style.css         Design system (colors, type, layout) as CSS variables
js/nav.js             Nav active-state + sticky-nav shadow
js/render-profile.js  Renders Home / About / Research / Contact from profile.json
js/render-publications.js  Renders Publications from publications.json
data/profile.json     Profile, bio, research interests, funding, honors ← edit this
data/publications.json Publications + patents                            ← edit this
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
- **Profile, biography, research interests, funding, honors** — edit
  `data/profile.json`.
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
