/* Fetches data/profile.json and renders the Home, About, Research, and Contact
   pages; News comes from its own data/news.json. The page to render is
   determined by <body data-page="...">. Content lives entirely in the JSON
   files so it stays editable without touching this code. */
(function () {
  "use strict";

  var DATA_URL = "data/profile.json";
  var NEWS_URL = "data/news.json";

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    // News is the one page that does not read the profile.
    if (page === "news") {
      load(NEWS_URL, renderNews);
      return;
    }
    load(DATA_URL, function (data) {
      if (page === "home") renderHome(data);
      else if (page === "about") renderAbout(data);
      else if (page === "research") renderResearch(data);
      else if (page === "contact") renderContact(data);
    });
  });

  function load(url, done) {
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + url + " (" + res.status + ")");
        return res.json();
      })
      .then(done)
      .catch(function (err) {
        console.error(err);
        showError(err.message);
      });
  }

  /* ---------- helpers ---------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function isDraft(status) {
    return typeof status === "string" && /^DRAFT/i.test(status);
  }
  function reveal(node) { if (node) node.classList.add("reveal"); }
  /* Turn known names into links. Runs on already-escaped text, so the only
     markup introduced is the anchors built here. */
  function linkify(escaped, map) {
    if (!map) return escaped;
    Object.keys(map).forEach(function (name) {
      var re = new RegExp(esc(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      escaped = escaped.replace(re,
        '<a href="' + esc(map[name]) + '" target="_blank" rel="noopener">' +
        esc(name) + '</a>');
    });
    return escaped;
  }
  /* Wrap known phrases in an accent span. Same contract as linkify(): runs on
     already-escaped text, escapes the needle before building the regex, and the
     only markup introduced is the span built here. Safe to compose with
     linkify() because neither can match inside what the other emits — the link
     names are people, the highlights are research phrases. A future highlight
     that overlaps a linked name would break that, so keep them disjoint. */
  function highlight(escaped, phrases) {
    if (!Array.isArray(phrases)) return escaped;
    phrases.forEach(function (phrase) {
      var re = new RegExp(esc(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      escaped = escaped.replace(re,
        '<span class="prose__accent">' + esc(phrase) + '</span>');
    });
    return escaped;
  }
  function showError(msg) {
    var main = document.querySelector("main");
    if (!main) return;
    var box = document.createElement("div");
    box.className = "container section";
    box.innerHTML =
      '<p class="draft-note">Could not load content: ' + esc(msg) +
      '.<br>If viewing locally, serve the folder over HTTP ' +
      '(e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</p>';
    main.prepend(box);
  }

  /* Inline line-art icons for the research-interest cards. stroke follows the
     CSS color, and nothing is fetched from outside. */
  var INTEREST_ICONS = {
    "nanoparticle":
      '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4">' +
      '<circle cx="16" cy="16" r="7"/><circle cx="16" cy="16" r="11.5" stroke-dasharray="2 3"/>' +
      '<circle cx="16" cy="4.5" r="1.6" fill="currentColor" stroke="none"/>' +
      '<circle cx="27.5" cy="16" r="1.6" fill="currentColor" stroke="none"/>' +
      '<circle cx="16" cy="27.5" r="1.6" fill="currentColor" stroke="none"/>' +
      '<circle cx="4.5" cy="16" r="1.6" fill="currentColor" stroke="none"/></svg>',
    "delivery":
      '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
      '<path d="M3 9c4-3 7 3 11 0s7 3 11 0"/><path d="M3 16c4-3 7 3 11 0s7 3 11 0"/>' +
      '<path d="M3 23c4-3 7 3 11 0s7 3 11 0"/></svg>',
    "immune-cell":
      '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4">' +
      '<circle cx="12" cy="13" r="6.5"/><circle cx="21" cy="20" r="6.5"/>' +
      '<circle cx="12" cy="13" r="2" fill="currentColor" stroke="none"/>' +
      '<circle cx="21" cy="20" r="2" fill="currentColor" stroke="none"/></svg>',
    "vaccine":
      '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
      '<path d="M20 5l7 7"/><path d="M23.5 8.5l-13 13-5.5 1.5 1.5-5.5 13-13z"/>' +
      '<path d="M14 12l4 4"/><path d="M11 15l4 4"/></svg>'
  };

  /* ---------- Home / index ---------- */
  function renderHome(d) {
    // Hero
    var hero = el("hero");
    if (hero) {
      var initials = (d.name || "")
        .replace(/,.*$/, "").trim().split(/\s+/)
        .map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
      var keywords = Array.isArray(d.research_keywords) ? d.research_keywords : [];
      hero.innerHTML =
        '<img class="hero__photo" src="assets/headshot.jpg?v=3" alt="Portrait of ' +
          esc(d.name) + '" />' +
        '<div class="hero__intro">' +
          '<h1 class="hero__name">' + esc(d.name) + '</h1>' +
          '<p class="hero__title"><strong>' + esc(d.title) + '</strong>, ' +
            esc(d.department) + ', ' + esc(d.institution) + '</p>' +
          '<p class="hero__tagline">' + esc(d.tagline) + '</p>' +
          (keywords.length
            ? '<div class="hero__keywords">' +
              '<p class="eyebrow">Research Keywords</p>' +
              '<div class="keywords">' +
              keywords.map(function (k) {
                return '<span class="keyword">' + esc(k) + '</span>';
              }).join("") +
              '</div></div>'
            : "") +
        '</div>';
      // If the headshot is missing, fall back to an initials circle.
      var photo = hero.querySelector(".hero__photo");
      if (photo) {
        photo.addEventListener("error", function () {
          var ph = document.createElement("div");
          ph.className = "hero__photo hero__photo--placeholder";
          ph.setAttribute("role", "img");
          ph.setAttribute("aria-label", "Headshot placeholder");
          ph.textContent = initials;
          photo.replaceWith(ph);
        });
      }
      reveal(hero);
    }

    // Research interests — compact summary; full cards live on research.html
    var interests = el("interests");
    // Prefer the CV research fields; fall back to the themes if absent.
    var items = Array.isArray(d.research_interests) && d.research_interests.length
      ? d.research_interests
      : d.research_themes;
    if (interests && Array.isArray(items) && items.length) {
      interests.innerHTML =
        '<h2>Research Interests</h2>' +
        (d.research_interests_tagline
          ? '<p class="interest-grid__tagline">' + esc(d.research_interests_tagline) + '</p>'
          : "") +
        '<div class="interest-grid">' +
        items.map(function (t) {
          var icon = INTEREST_ICONS[t.icon];
          return '<article class="interest-card">' +
            (icon ? '<span class="interest-card__icon" aria-hidden="true">' + icon + '</span>' : "") +
            '<h3 class="interest-card__title">' + esc(t.title) + '</h3>' +
            '<p class="interest-card__desc">' + esc(t.description) + '</p>' +
            '</article>';
        }).join("") +
        '</div>' +
        '<p class="interests__more"><a href="research.html">View research in detail →</a></p>';
      reveal(interests);
    }

  }

  /* ---------- About ---------- */
  function renderAbout(d) {
    // Bio
    var bio = el("bio");
    if (bio) {
      var paras = String(d.bio || "").split(/\n{2,}/).filter(Boolean);
      bio.innerHTML =
        '<h2>Biography</h2>' +
        '<div class="prose">' +
          paras.map(function (p, i) {
            return '<p' + (i === 0 ? ' class="prose__lead"' : '') + '>' +
              highlight(linkify(esc(p), d.bio_links), d.bio_highlights) + '</p>';
          }).join("") +
        '</div>' +
        (isDraft(d.bio_status)
          ? '<p class="draft-note">Draft text — to be reviewed before publishing.</p>' : "");
      reveal(bio);
    }

    // Education + career timeline
    var edu = el("education");
    if (edu && Array.isArray(d.career) && Array.isArray(d.education)) {
      // Advisor sits on its own line rather than trailing the institution.
      var careerRows = d.career.map(function (c) {
        return timelineItem(c.years, c.position, [
          c.institution,
          c.advisor ? "Advisor: " + c.advisor : ""
        ]);
      }).join("");
      var eduRows = d.education.map(function (e) {
        return timelineItem(e.years, e.degree, [
          e.institution + (e.note ? " · " + e.note : ""),
          e.advisor ? "Advisor: " + e.advisor : ""
        ], e.second_degree);
      }).join("");
      edu.innerHTML =
        '<h2>Experience &amp; Education</h2>' +
        '<h3 class="eyebrow" style="margin-top:0">Appointments</h3>' +
        '<div class="timeline">' + careerRows + '</div>' +
        '<h3 class="eyebrow" style="margin-top:var(--s5)">Education</h3>' +
        '<div class="timeline">' + eduRows + '</div>';
      reveal(edu);
    }

    // Research funding
    var funding = el("funding");
    if (funding && Array.isArray(d.research_funding) && d.research_funding.length) {
      funding.innerHTML =
        '<h2>Research Funding</h2>' +
        '<div class="timeline">' +
        d.research_funding.map(function (f) {
          // Each detail on its own line — a single joined string wraps badly.
          var terms = [f.role ? "Role: " + f.role : "", f.amount ? "Funding: " + f.amount : ""]
            .filter(Boolean).join(" · ");
          return '<div class="timeline__item">' +
            '<div class="timeline__years">' + esc(f.years) + '</div>' +
            '<div><div class="timeline__role">' + esc(f.title) + '</div>' +
            (f.program ? '<div class="timeline__meta">' + esc(f.program) + '</div>' : "") +
            (terms ? '<div class="timeline__meta">' + esc(terms) + '</div>' : "") +
            '</div></div>';
        }).join("") +
        '</div>';
      reveal(funding);
    }

    // Honors & awards
    var awards = el("awards");
    if (awards && Array.isArray(d.honors_awards) && d.honors_awards.length) {
      awards.innerHTML =
        '<h2>Honors &amp; Awards</h2>' +
        '<div class="timeline timeline--tight">' +
        d.honors_awards.map(function (a) {
          // Award name leads; the awarding body / venue sits muted beneath it.
          return '<div class="timeline__item">' +
            '<div class="timeline__years">' + esc(a.year) + '</div>' +
            '<div><div class="timeline__role">' + esc(a.award) + '</div>' +
            (a.detail ? '<div class="timeline__meta">' + esc(a.detail) + '</div>' : "") +
            '</div></div>';
        }).join("") +
        '</div>';
      reveal(awards);
    }

  }

  /* `meta` may be a string or an array — each entry gets its own line so long
     details don't run together. `roleExtra` adds a second heading-weight line
     (used for a double-major degree). */
  function timelineItem(years, role, meta, roleExtra) {
    var lines = (Array.isArray(meta) ? meta : [meta]).filter(Boolean);
    return '<div class="timeline__item">' +
      '<div class="timeline__years">' + esc(years) + '</div>' +
      '<div><div class="timeline__role">' + esc(role) + '</div>' +
      (roleExtra ? '<div class="timeline__role">' + esc(roleExtra) + '</div>' : "") +
      lines.map(function (m) {
        return '<div class="timeline__meta">' + esc(m) + '</div>';
      }).join("") +
      '</div></div>';
  }

  /* ---------- Research ---------- */

  /* A real figure once `figure` names one, otherwise the theme's own line icon
     on the same tinted panel — so a card without artwork still reads as
     finished rather than as a placeholder. */
  function themeFigure(t) {
    if (t.figure) {
      return '<img class="theme__figure theme__figure--image" src="' + esc(t.figure) +
        '" alt="' + esc(t.figure_alt || t.title) + '" loading="lazy" />';
    }
    return '<div class="theme__figure theme__figure--icon" aria-hidden="true">' +
      (INTEREST_ICONS[t.icon] || "") + '</div>';
  }

  function renderResearch(d) {
    var grid = el("themes");
    if (!grid || !Array.isArray(d.research_themes)) return;
    grid.innerHTML = d.research_themes.map(function (t) {
      return '<article class="theme">' +
        themeFigure(t) +
        '<div class="theme__body">' +
          '<h3 class="theme__title">' + esc(t.title) + '</h3>' +
          '<p class="theme__desc">' + esc(t.description) + '</p>' +
        '</div></article>';
    }).join("");
    reveal(grid);

    // Teaching (if present)
    var teach = el("teaching");
    if (teach && Array.isArray(d.teaching) && d.teaching.length) {
      teach.innerHTML =
        '<h2>Teaching</h2>' +
        '<div class="timeline">' +
        d.teaching.map(function (t) {
          return timelineItem(t.years, t.course,
            t.role + " · " + t.institution);
        }).join("") +
        '</div>';
      reveal(teach);
    }
  }

  /* ---------- News ---------- */

  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

  /* "2023-06" -> "June 2023". The date is the paper's issue date, so it reads
     as the tail of a citation ("ACS Nano · June 2023") rather than a timestamp. */
  function newsDate(iso) {
    var m = /^(\d{4})-(\d{2})/.exec(String(iso == null ? "" : iso));
    return m ? MONTHS[parseInt(m[2], 10) - 1] + " " + m[1] : String(iso == null ? "" : iso);
  }

  /* A supplied logo once one exists, otherwise a tile built from `thumb` —
     "ACS Nano" becomes ACS over NANO. Same ship-now-drop-art-in-later pattern
     as themeFigure(). */
  function newsThumb(n) {
    if (n.image) {
      return '<img class="news-item__thumb news-item__thumb--image" src="' +
        esc(n.image) + '" alt="' + esc(n.image_alt || (n.thumb || "") + " logo") +
        '" loading="lazy" />';
    }
    var words = String(n.thumb || "Press").trim().split(/\s+/);
    return '<div class="news-item__thumb news-item__thumb--tile" aria-hidden="true">' +
      '<span class="news-item__tile-main">' + esc(words[0]) + '</span>' +
      (words.length > 1
        ? '<span class="news-item__tile-sub">' + esc(words.slice(1).join(" ")) + '</span>'
        : "") +
      '</div>';
  }

  /* One outlet link. `language` and `kind` become a small trailing hint so a
     reader knows a link is Korean, or a video, before following it. */
  function outletLink(o) {
    var hint = [o.kind === "video" ? "video" : "", o.language]
      .filter(Boolean)
      .map(esc)
      .join(", ");
    return '<a class="news-outlet" href="' + esc(o.url) + '" target="_blank" rel="noopener">' +
      esc(o.name) +
      (hint ? ' <span class="news-outlet__hint">' + hint + '</span>' : "") +
      '</a>';
  }

  /* A card groups every outlet that covered one paper — the Korean articles all
     restate the same press release, so listing them separately would repeat the
     same headline four deep. The card is a <div>, not an <a>: it holds many
     links. */
  function newsItem(n) {
    // Journal first, then issue month — "ACS Nano · June 2023".
    var meta = [n.related, newsDate(n.date)].filter(Boolean).map(esc).join(" · ");
    var outlets = Array.isArray(n.outlets) ? n.outlets : [];

    return '<div class="news-item">' +
      newsThumb(n) +
      '<div class="news-item__body">' +
        '<p class="news-item__headline">' + esc(n.headline) + '</p>' +
        (meta ? '<div class="news-item__meta">' + meta + '</div>' : "") +
        (outlets.length
          ? '<div class="news-item__outlets">' + outlets.map(outletLink).join("") + '</div>'
          : "") +
      '</div>' +
      '</div>';
  }

  function renderNews(d) {
    var wrap = el("news");
    if (!wrap) return;
    var items = (Array.isArray(d.press) ? d.press : []).slice();
    if (!items.length) {
      wrap.innerHTML = '<p class="text-secondary">No coverage listed yet.</p>';
      reveal(wrap);
      return;
    }
    // ISO dates sort correctly as plain strings; newest first.
    items.sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
    wrap.innerHTML = '<div class="news-list">' + items.map(newsItem).join("") + '</div>';
    reveal(wrap);
  }

  /* Inline SVG so the icons need no external requests or build step.
     fill="currentColor" makes them follow the link color and hover state. */
  var PROFILE_ICONS = {
    "Google Scholar":
      '<span class="contact-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M12 2 1 8l11 6 9-4.91V17h2V8L12 2z"/>' +
      '<path d="M5 12.4V16c0 2.2 3.13 4 7 4s7-1.8 7-4v-3.6l-7 3.82-7-3.82z"/>' +
      '</svg></span>',
    "ORCID":
      '<span class="contact-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z' +
      'M7.37 17.4H5.63V7.5h1.74v9.9zM6.5 6.36a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1z' +
      'M17.9 12.6c0 2.9-1.86 4.8-4.72 4.8H9.6V7.5h3.58c2.86 0 4.72 1.9 4.72 5.1z' +
      'M16.1 12.6c0-2.1-1.2-3.5-3.1-3.5h-1.6v7h1.6c1.9 0 3.1-1.4 3.1-3.5z"/>' +
      '</svg></span>',
    "LinkedIn":
      '<span class="contact-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28z' +
      'M5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z' +
      'M22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>' +
      '</svg></span>'
  };

  /* ---------- Contact ---------- */
  function renderContact(d) {
    var box = el("contact");
    if (!box) return;
    var links = d.links || {};
    var linkDefs = [
      ["Google Scholar", links.google_scholar],
      ["ORCID", links.orcid],
      ["LinkedIn", links.linkedin]
    ].filter(function (l) { return l[1]; });

    var map = mapHtml(d.map_query || d.address);

    box.innerHTML =
      '<div class="contact-layout">' +
        '<div class="contact-grid">' +
          contactRow("Email", emailsHtml(d.email)) +
          contactRow("Address", esc(d.address)) +
          contactRow("Profiles",
            '<div class="contact-links">' +
            linkDefs.map(function (l) {
              return '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' +
                (PROFILE_ICONS[l[0]] || "") + '<span>' + esc(l[0]) + '</span></a>';
            }).join("") +
            '</div>') +
        '</div>' +
        (map ? '<div class="contact-map-col">' + map + '</div>' : "") +
      '</div>';
    reveal(box);
  }

  /* Keyless Google Maps embed — no API key or build step required. */
  function mapHtml(query) {
    if (!query) return "";
    var q = encodeURIComponent(query);
    return '<div class="contact-map">' +
        '<iframe src="https://maps.google.com/maps?q=' + q + '&amp;output=embed" ' +
          'title="Map showing ' + esc(query) + '" loading="lazy" ' +
          'referrerpolicy="no-referrer-when-downgrade"></iframe>' +
      '</div>' +
      '<p class="contact-map__link">' +
        '<a href="https://www.google.com/maps/search/?api=1&amp;query=' + q + '" ' +
          'target="_blank" rel="noopener">View on Google Maps ↗</a>' +
      '</p>';
  }

  /* "email" may be a single address, or an array of addresses, or an array of
     {label, address} — the labelled form adds a Work / Personal chip. Bare
     strings still work, so older data needs no migration. */
  function emailsHtml(email) {
    var list = Array.isArray(email) ? email : (email ? [email] : []);
    return '<div class="contact-links">' +
      list.map(function (e) {
        var addr = typeof e === "string" ? e : (e && e.address);
        if (!addr) return "";
        var label = typeof e === "string" ? "" : (e && e.label);
        return '<span class="contact-email">' +
          '<a href="mailto:' + esc(addr) + '">' + esc(addr) + '</a>' +
          (label ? '<span class="contact-email__tag">' + esc(label) + '</span>' : "") +
          '</span>';
      }).join("") +
      '</div>';
  }

  function contactRow(label, valueHtml) {
    return '<div class="contact-row">' +
      '<div class="contact-row__label">' + esc(label) + '</div>' +
      '<div>' + valueHtml + '</div></div>';
  }
})();
