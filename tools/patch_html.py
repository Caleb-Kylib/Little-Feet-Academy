"""
Patch all public HTML pages: favicon, SEO meta, social links, honeypot, reveal.js, font display swap.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEO = json.loads((ROOT / "tools" / "seo-pages.json").read_text(encoding="utf-8"))
SITE_URL = "https://littlefeetacademy.co.ke"
SOCIAL = {
    "facebook": "https://www.facebook.com",
    "twitter": "https://twitter.com",
    "instagram": "https://www.instagram.com",
    "youtube": "https://www.youtube.com",
}

HEAD_SNIPPET = """
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
"""

FONT_FIX = "family=Fredoka:wght@400;500;600;700&display=swap"
FONT_OLD = re.compile(r"family=Fredoka:wght@400;500;600;700(?!\&display=swap)")


def seo_block(filename: str, title: str, desc: str) -> str:
    path = page_path(filename)
    url = SITE_URL + (path if path != "/" else "")
    return f"""
    <link rel="canonical" href="{url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Little Feet Academy" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{desc}" />
    <meta property="og:url" content="{url}" />
    <meta property="og:image" content="{SITE_URL}/assets/img/og-share.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{desc}" />
    <meta name="twitter:image" content="{SITE_URL}/assets/img/og-share.jpg" />
"""


def patch_social(html: str) -> str:
    for label, url in [
        ("Facebook", SOCIAL["facebook"]),
        ("Twitter", SOCIAL["twitter"]),
        ("Instagram", SOCIAL["instagram"]),
        ("YouTube", SOCIAL["youtube"]),
    ]:
        html = re.sub(
            rf'(<a href="#")([^>]*aria-label="{label}")',
            rf'<a href="{url}" target="_blank" rel="noopener noreferrer"\2',
            html,
            count=0,
        )
    return html


def add_honeypot(html: str) -> str:
    if "_gotcha" in html:
        return html

    def repl(m: re.Match) -> str:
        form_open = m.group(0)
        if "formspree" not in form_open.lower():
            return form_open
        return (
            form_open
            + '\n                <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="visually-hidden" aria-hidden="true" />'
        )

    return re.sub(r"<form[^>]*action=\"https://formspree\.io[^\"]*\"[^>]*>", repl, html, flags=re.I)


def page_path(filename: str) -> str:
    if filename in SEO:
        return SEO[filename].get("path", "/" + filename.replace(".html", ""))
    stem = filename.replace(".html", "")
    if stem == "index":
        return "/"
    return "/" + stem


def inject_head(html: str, filename: str) -> str:
    if "favicon.svg" not in html:
        title_m = re.search(r"<title>([^<]+)</title>", html, re.I)
        desc_m = re.search(r'<meta name="description" content="([^"]*)"', html, re.I)
        title = title_m.group(1) if title_m else "Little Feet Academy"
        desc = desc_m.group(1) if desc_m else "Little Feet Academy in Ongata Rongai"
        if filename in SEO:
            title = SEO[filename].get("title", title)
            desc = SEO[filename].get("description", desc)
        SEO.setdefault(filename, {"path": page_path(filename), "title": title, "description": desc})
        block = HEAD_SNIPPET + seo_block(filename, title, desc)
        html = html.replace("</head>", block + "  </head>", 1)
    html = FONT_OLD.sub(FONT_FIX, html)
    return html


def replace_reveal_script(html: str) -> str:
    """Remove inline reveal/year/about-status observers; use reveal.js."""
    patterns = [
        r"\s*// Intersection Observer for Scroll Animations[\s\S]*?revealElements\.forEach\([^)]+\);\s*",
        r"\s*const revealElements = document\.querySelectorAll\(['\"]\.reveal['\"]\);[\s\S]*?revealElements\.forEach\([^)]+\);\s*",
        r"\s*// About status strip animation[\s\S]*?statusObserver\.observe\(statusBar\);\s*\}\s*",
        r"\s*document\.getElementById\(['\"]year['\"]\)\.textContent = new Date\(\)\.getFullYear\(\);\s*",
    ]
    for pat in patterns:
        html = re.sub(pat, "\n", html, count=1)
    if "js/reveal.js" not in html:
        html = html.replace(
            '<script src="js/parent-chatbot.js" defer></script>',
            '    <script src="js/reveal.js" defer></script>\n    <script src="js/parent-chatbot.js" defer></script>',
        )
        if "js/reveal.js" not in html:
            html = html.replace("</body>", '    <script src="js/reveal.js" defer></script>\n  </body>')
    return html


def fix_index_activities(html: str, filename: str) -> str:
    if filename != "index.html":
        return html
    html = html.replace(
        'src="assets/img/science-club.jpg" class="activity-mini-img" alt="Science club activity" />\n              <div class="p-4">\n                <h5 class="fw-bold mb-2">Football Academy</h5>\n                <p class="text-muted mb-0">Hands-on experiments that spark curiosity and problem-solving.</p>',
        'src="assets/img/sports.jpg" class="activity-mini-img" alt="Students playing football" loading="lazy" />\n              <div class="p-4">\n                <h5 class="fw-bold mb-2">Football Academy</h5>\n                <p class="text-muted mb-0">Teamwork, fitness, and discipline through coached football sessions.</p>',
    )
    return html


def add_json_ld(html: str, filename: str) -> str:
    if "EducationalOrganization" in html or "schema.org" in html:
        return html
    if filename not in ("index.html", "contact.html"):
        return html
    ld = """
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Little Feet Academy",
      "url": "https://littlefeetacademy.co.ke/",
      "email": "hello@littlefeetacademy.co.ke",
      "telephone": "+254796609626",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Barclays Road",
        "addressLocality": "Ongata Rongai",
        "addressCountry": "KE"
      }
    }
    </script>
"""
    return html.replace("</head>", ld + "  </head>", 1)


def main():
    for path in sorted(ROOT.glob("*.html")):
        if path.name.startswith("_") or path.name == "404.html":
            continue
        html = path.read_text(encoding="utf-8")
        html = patch_social(html)
        html = inject_head(html, path.name)
        html = add_honeypot(html)
        html = replace_reveal_script(html)
        html = fix_index_activities(html, path.name)
        html = add_json_ld(html, path.name)
        path.write_text(html, encoding="utf-8")
        print("patched", path.name)


if __name__ == "__main__":
    main()
