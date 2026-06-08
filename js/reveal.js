/**
 * Scroll reveal animations + footer year + about metrics counter.
 */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  var statusBar = document.getElementById("about-status-bar");
  if (statusBar) {
    var statusObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var numbers = statusBar.querySelectorAll(
            ".about-metric-value[data-target], .about-stat-number[data-target]"
          );
          numbers.forEach(function (value) {
            var target = Number(value.getAttribute("data-target") || 0);
            var suffix = value.getAttribute("data-suffix") || "";
            var current = 0;
            var step = Math.max(1, Math.round(target / 40));
            var timer = setInterval(function () {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              value.textContent = String(current) + suffix;
            }, 22);
          });
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    statusObserver.observe(statusBar);
  }
})();
