/* ==========================================================================
   The Craft Collective — Shared Interaction Layer (behavior)
   Referenced by all six pages. Pairs with assets/css/interactions.css.

   What this does:
   - Finds existing headings and card elements already in the page
     (no new markup or classes needed in the HTML itself).
   - Adds a .reveal-init class to each at runtime, then flips to
     .is-visible the first time it scrolls into view.
   - Because .reveal-init only gets added by this script, a page with
     JS disabled or blocked simply shows the normal static content —
     nothing is ever hidden by default in the CSS.
   - Skips all of this entirely if the visitor has requested reduced
     motion, or if IntersectionObserver isn't supported.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    return; // Static page, no motion. Nothing to wire up.
  }

  // Elements to reveal on scroll. Deliberately targets tags/classes that
  // already exist across all six pages — see the class survey this was
  // built from (format-card, pkg-card, who-card, track-card,
  // credential-card, occasion-card, step-card, plus every h2 and the
  // page's own h1). Safe to extend this list later without touching HTML.
  var selector = [
    "h1", "h2",
    ".format-plan-card", ".pkg-card", ".who-card",
    ".track-card", ".credential-card", ".occasion-card", ".step-card",
    ".faq-item"
  ].join(", ");

  var targets = document.querySelectorAll(selector);

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // reveal once, not on every scroll
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  });

  targets.forEach(function (el, i) {
    el.classList.add("reveal-init");
    // Small stagger for elements that share a row (cards), so a group
    // doesn't all snap in at the exact same millisecond.
    var delay = Math.min(i % 4, 3) * 60;
    el.style.transitionDelay = delay + "ms";
    observer.observe(el);
  });
})();

/* ==========================================================================
   Hero video — reduced-motion handling.
   Only present on the homepage (#heroVideo); no-ops everywhere else.
   Autoplaying video ignores CSS prefers-reduced-motion entirely, so this
   has to be handled in JS: pause the loop and fall back to the poster
   frame (already set as the video's poster attribute in the HTML) for
   anyone who has that preference set.
   ========================================================================== */
(function () {
  "use strict";

  var heroVideo = document.getElementById("heroVideo");
  if (!heroVideo) return; // Not on this page.

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
  }
})();

/* ==========================================================================
   Footer "Submit Inquiry" form — present identically on all six pages.
   Single shared handler rather than duplicating this in six inline scripts.
   Feedback is shown inline via the existing .footer-note text (swapped
   temporarily) since this compact widget has no room for a separate
   success/error box like the Book/Private Celebrations forms have.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("footerInquiryForm");
  if (!form) return;

  var note = document.getElementById("footerNote");
  var noteDefault = note.textContent;
  var input = document.getElementById("footerEmail");
  var button = form.querySelector("button[type=submit]");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    button.disabled = true;
    var data = new FormData(form);

    fetch("https://formspree.io/f/mnjejprk", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    }).then(function (response) {
      button.disabled = false;
      if (response.ok) {
        input.value = "";
        note.textContent = "Thanks — we'll be in touch soon.";
      } else {
        note.textContent = "Something went wrong. Please try again.";
      }
      setTimeout(function () { note.textContent = noteDefault; }, 6000);
    }).catch(function () {
      button.disabled = false;
      note.textContent = "Something went wrong. Please try again.";
      setTimeout(function () { note.textContent = noteDefault; }, 6000);
    });
  });
})();
