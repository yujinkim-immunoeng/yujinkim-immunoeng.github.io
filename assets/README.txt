Assets
======

headshot.jpg
  Square portrait shown in the Home hero (currently 800x800).
  To replace it: crop a new photo to a square centred on the face, save it
  here under the same name, and bump the ?v= number on the image URL in
  js/render-profile.js so browsers fetch the new file.
  If the file is ever missing, the hero falls back to an initials circle.

news/
  Thumbnails for the News page, one per paper card. These are Yujin's own
  cover-style graphics - the paper's artwork with the journal wordmark on
  it - square, transparent background, downscaled to 320px:
    acs-nano-2023-fap-nanovaccine.png
    acs-nano-2021-influenza-nanobarrel.png
    angew-2020-cancer-nanovaccine.png
  The full-resolution originals live in source-figures/, which is
  git-ignored - same split as Photo.JPG vs. headshot.jpg.
  Drawn inside a 140px square with object-fit: contain, so nothing is ever
  cropped. Keep new ones square, or they will letterbox.
  Point at one with "image": "assets/news/<file>" plus "image_alt" on that
  entry in data/news.json. Without an image, a text tile is generated from
  "thumb" instead.
  To resize a replacement, see the PIL snippet in CLAUDE.md section 4 - it
  preserves transparency, which `sips` does not do reliably.

research/
  Figures for the Research theme cards. Landscape 16:9 works best - they
  fill the card's figure box with object-fit: cover.
  Point at one with "figure": "assets/research/<file>" on that theme in
  data/profile.json. Without it, the card shows the theme's line icon.
  Use figures from published papers only.
