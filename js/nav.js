/* Shared navigation behavior:
   - highlight the active page link (based on <body data-page="...">)
   - add a subtle shadow to the sticky nav once the page is scrolled */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    if (page) {
      var link = document.querySelector('.nav__link[data-page="' + page + '"]');
      if (link) link.classList.add("is-active");
    }

    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 4);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  });
})();
