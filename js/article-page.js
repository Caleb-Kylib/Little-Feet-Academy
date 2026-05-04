/**
 * Related articles (from articles-data.js) and scroll-to-top.
 * Expects: window.ARTICLES_CATALOG, window.getRelatedArticles
 */
(function () {
  function escapeHtml(str) {
    if (str == null) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function cardHtml(a, opts) {
    const o = opts || {};
    const btnClass = o.btnClass || "btn btn-primary";
    return (
      '<div class="card h-100 border-0 shadow-sm">' +
      '<img src="' +
      escapeHtml(a.image) +
      '" class="card-img-top img-fluid" alt="" style="height: 200px; object-fit: cover;">' +
      '<div class="card-body d-flex flex-column">' +
      '<p class="small text-muted mb-1">' +
      escapeHtml(a.date) +
      "</p>" +
      '<h2 class="card-title h5">' +
      escapeHtml(a.title) +
      "</h2>" +
      '<p class="card-text text-muted small flex-grow-1">' +
      escapeHtml(a.excerpt) +
      "</p>" +
      '<a href="' +
      escapeHtml(a.slug) +
      '" class="' +
      btnClass +
      ' mt-2 align-self-start">' +
      (o.linkLabel || "Read article") +
      "</a>" +
      "</div>" +
      "</div>"
    );
  }

  function renderRelated() {
    const root = document.getElementById("related-articles-root");
    const id = document.body.getAttribute("data-article-id");
    if (!root || !id || typeof window.getRelatedArticles !== "function") return;
    const items = window.getRelatedArticles(id, 3);
    root.innerHTML = items
      .map(function (a) {
        return (
          '<div class="col-12 col-md-6 col-lg-4">' +
          cardHtml(a, { btnClass: "btn btn-primary", linkLabel: "Read article" }) +
          "</div>"
        );
      })
      .join("");
  }

  function scrollTopBtn() {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "btn btn-primary rounded-circle shadow-lg position-fixed bottom-0 end-0 m-3 m-md-4 opacity-0";
    b.style.zIndex = "1080";
    b.style.width = "3rem";
    b.style.height = "3rem";
    b.style.transition = "opacity 0.25s ease";
    b.setAttribute("aria-label", "Back to top");
    b.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(b);
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 320) {
          b.classList.remove("opacity-0");
          b.classList.add("opacity-100");
        } else {
          b.classList.add("opacity-0");
          b.classList.remove("opacity-100");
        }
      },
      { passive: true }
    );
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function run() {
    renderRelated();
    scrollTopBtn();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
