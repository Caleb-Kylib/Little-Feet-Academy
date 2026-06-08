from pathlib import Path

d = "div"
html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page not found • Little Feet Academy</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body class="d-flex flex-column min-vh-100">
    <main class="flex-grow-1 d-flex align-items-center section-pad">
      <{d} class="container text-center py-5">
        <p class="display-1 fw-bold text-primary mb-2">404</p>
        <h1 class="h2 fw-bold mb-3">This page wandered off the playground</h1>
        <p class="text-muted mb-4">The link may be outdated. Head back home or contact us.</p>
        <{d} class="d-flex flex-wrap gap-2 justify-content-center">
          <a href="index.html" class="btn btn-kid pill-btn px-4">Back to home</a>
          <a href="contact.html" class="btn btn-outline-dark pill-btn px-4">Contact us</a>
        </{d}>
      </{d}>
    </main>
  </body>
</html>
"""
(Path(__file__).resolve().parent.parent / "404.html").write_text(html, encoding="utf-8")
print("ok")
