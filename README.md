# Little Feet Academy — website

Static multi-page site (HTML, CSS, Bootstrap 5). Deployed on [Vercel](https://vercel.com) with no build step.

## Local preview

Open `index.html` in a browser, or use a static server:

```bash
python -m http.server 8080
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel (framework: **Other**, output directory: **`.`**, build command: empty).
3. Set your production domain in `tools/seo-pages.json`, `robots.txt`, `sitemap.xml`, and `js/site-config.js` if it differs from `https://littlefeetacademy.co.ke`.
4. Deploy: `npx vercel --prod` (requires Vercel CLI login).

## Forms (Formspree)

Forms post to Formspree. In the [Formspree dashboard](https://formspree.io):

- Allow your production domain.
- Enable spam filtering.
- Confirm notification email.

Forms include a honeypot field (`_gotcha`).

## Maintenance scripts

From the project root:

```bash
python tools/patch_html.py      # favicon, SEO meta, social links, reveal.js
python tools/dedupe_css.py      # remove duplicate rules in style.css
python tools/compress_images.py # compress assets/img (requires Pillow)
python tools/generate_assets.py # logo.png, og-share.jpg
```

## Key files

| File | Purpose |
|------|---------|
| `vercel.json` | Clean URLs, security/cache headers |
| `robots.txt` / `sitemap.xml` | Search engines |
| `js/reveal.js` | Scroll animations + footer year |
| `js/parent-chatbot.js` | Parent FAQ assistant (no API keys in production) |
| `404.html` | Custom not-found page |
