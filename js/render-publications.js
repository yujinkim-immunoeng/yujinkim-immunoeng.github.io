/* Fetches data/publications.json and renders the Publications page:
   two author-role groups (First & Corresponding, then Co-Author), each
   sorted by year descending with non-published items pinned to the top,
   followed by a Patents subsection. No publication data is hard-coded here
   — the JSON file is the single source of truth. */
(function () {
  "use strict";

  var DATA_URL = "data/publications.json";
  var AUTHOR_NAME = "Yujin Kim";

  var STATUS_LABELS = {
    under_review: "Under Review",
    submitted: "Submitted",
    accepted: "Accepted",
    in_prep: "In Preparation",
    published: "Published"
  };

  document.addEventListener("DOMContentLoaded", function () {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + DATA_URL + " (" + res.status + ")");
        return res.json();
      })
      .then(render)
      .catch(function (err) {
        console.error(err);
        var main = document.querySelector("main");
        if (main) {
          var box = document.createElement("div");
          box.className = "container section";
          box.innerHTML = '<p class="draft-note">Could not load publications: ' +
            esc(err.message) + '.<br>If viewing locally, serve the folder over ' +
            'HTTP (e.g. <code>python3 -m http.server</code>) rather than opening ' +
            'the file directly.</p>';
          main.prepend(box);
        }
      });
  });

  function render(data) {
    // Impact factor / journal ranking are shown only for first & corresponding
    // author papers; co-author papers omit them.
    // The generalized-title note applies only to her own unpublished work, so
    // it goes to the first/corresponding group — co-author titles are other
    // labs' real ones.
    renderGroup("pub-first", data.first_and_corresponding_author || [], true,
      data.unpublished_title_note);
    renderGroup("pub-coauthor", data.co_author || [], false);
    renderPatents("pub-patents", data.patents || []);
  }

  function renderGroup(containerId, entries, showMetrics, titleNote) {
    var c = document.getElementById(containerId);
    if (!c) return;
    var head = c.querySelector(".pub-group__count");
    if (head) head.textContent = "(" + entries.length + ")";
    var list = c.querySelector(".pub-list");
    if (!list) return;
    list.innerHTML = sortEntries(entries).map(function (p) {
      return pubHtml(p, showMetrics, titleNote);
    }).join("");
    c.classList.add("reveal");
  }

  /* Non-published pinned to top (keep their given order), then published by
     year descending. */
  function sortEntries(entries) {
    var copy = entries.slice();
    copy.sort(function (a, b) {
      var ap = a.status !== "published";
      var bp = b.status !== "published";
      if (ap !== bp) return ap ? -1 : 1;
      if (ap && bp) return (a.order || 0) - (b.order || 0);
      return (b.year || 0) - (a.year || 0);
    });
    return copy;
  }

  function pubHtml(p, showMetrics, titleNote) {
    var isPub = p.status === "published";
    // Year sits in the narrow left column only for published items; status
    // badges live in the body so their width never collides with the title.
    var yearCell = isPub && p.year ? esc(p.year) : "";
    var statusTag = isPub ? "" :
      '<span class="badge badge--status">' + esc(statusLabel(p.status)) + '</span>';

    var journalLine = "";
    if (p.journal) {
      journalLine = '<em>' + esc(p.journal) + '</em>';
      if (p.volume_issue_pages) {
        journalLine += ' <span class="pub__meta">' + esc(p.volume_issue_pages) + '</span>';
      }
      if (isPub && p.year) {
        journalLine += ' <span class="pub__meta">(' +
          (p.month ? esc(p.month) + " " : "") + esc(p.year) + ')</span>';
      }
      journalLine = '<p class="pub__journal">' + journalLine + '</p>';
    }

    var badges = [];
    if (showMetrics && p.impact_factor != null) {
      badges.push('<span class="badge">IF ' + esc(p.impact_factor) + '</span>');
    }
    if (showMetrics && p.journal_ranking) {
      badges.push('<span class="badge badge--rank">' + esc(p.journal_ranking) + '</span>');
    }
    // Status wording and the generalized-title note read as one phrase, so they
    // share a single span — a second span could wrap away from it.
    var noteParts = [];
    if (p.special_notes) noteParts.push(p.special_notes);
    if (!isPub && titleNote) noteParts.push(titleNote);
    if (noteParts.length) {
      badges.push('<span class="pub__note">' + esc(noteParts.join(" · ")) + '</span>');
    }
    var badgeLine = badges.length ? '<div class="pub__badges">' + badges.join("") + '</div>' : "";

    return '<div class="pub">' +
      '<div class="pub__year">' + yearCell + '</div>' +
      '<div class="pub__body">' +
        (statusTag ? '<div class="pub__status">' + statusTag + '</div>' : "") +
        '<p class="pub__title">' + esc(p.title) + '</p>' +
        '<p class="pub__authors">' + boldAuthor(p.authors) + '</p>' +
        journalLine +
        badgeLine +
      '</div></div>';
  }

  function renderPatents(containerId, patents) {
    var c = document.getElementById(containerId);
    if (!c) return;
    var list = c.querySelector(".pub-list");
    if (!list) return;
    list.innerHTML = patents.map(function (pt) {
      return '<div class="patent">' +
        '<p class="patent__title">' + esc(pt.title) + '</p>' +
        '<p class="patent__inventors">' + boldAuthor(pt.inventors) + '</p>' +
        '<p class="patent__status">' + esc(pt.status) + '</p>' +
        '</div>';
    }).join("");
    c.classList.add("reveal");
  }

  /* ---------- helpers ---------- */
  function statusLabel(s) { return STATUS_LABELS[s] || s || ""; }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Escape first, then bold every occurrence of the author's name. The name
     has no special HTML chars, so matching post-escape is safe. */
  function boldAuthor(authors) {
    var safe = esc(authors);
    var re = new RegExp(AUTHOR_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    return safe.replace(re, "<strong>" + AUTHOR_NAME + "</strong>");
  }
})();
