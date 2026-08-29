# Choo, Lee & Partners — firm website

Static site. Nothing is compiled at deploy time: every file is served exactly as
committed. The inner pages are *generated* from a content file and committed
alongside everything else (see [Editing the inner pages](#editing-the-inner-pages)).

## Structure

    index.html            homepage — hand-maintained, not generated
    practice-areas/       index + one folder per practice area (generated)
    people/               index + one folder per partner (generated)
    privacy/, terms/      stub pages, awaiting final text from the firm (generated)
    sitemap.xml           every page (generated)
    robots.txt            points crawlers at the sitemap (generated)
    favicon.ico           CL monogram on brand navy (generated)
    styles.css            all styles (@font-face declarations first, then site CSS)
    script.js             mobile nav, hero slider, scroll reveal, enquiry form
    images/               logos, favicons, photography, partner portraits
    fonts/                self-hosted Cormorant Garamond + Inter woff2 subsets
    tools/                the generators — see below; not served to visitors

`script.js` is shared by every page and no-ops on the parts that only exist on
the homepage (hero slider, enquiry form), so inner pages load it safely.

## Editing the inner pages

Do **not** hand-edit files under `practice-areas/` or `people/` — they are
overwritten. Edit the copy in `tools/content.js`, then regenerate:

    node tools/build-pages.js      # rewrites the inner pages, sitemap.xml, robots.txt
    python tools/verify-site.py    # checks every internal link, title, meta, canonical, H1

`verify-site.py` exits non-zero if anything is broken, so it is worth running
before every push. `index.html` is hand-maintained and is never touched by the
generator; if you change the nav or footer there, mirror it in the `head()` and
`foot()` templates in `tools/build-pages.js`.

The favicon set is rebuilt from the logo only if the branding changes:

    python tools/build-favicon.py  # needs Pillow

All copy is subject to Malaysian Bar publicity rules — no superlatives,
rankings, success claims or client names.

## Local preview

    npx serve .          # or: python -m http.server

## Deployment

Deployed on GitHub Pages from the root of the `main` branch. There is no build
command — pushing to `main` publishes the site.

    CNAME       custom domain (chooleepartners.com) claimed by GitHub Pages
    .nojekyll   skip Jekyll processing; files are served exactly as committed

DNS is hosted at GoDaddy. The apex has four A records pointing at GitHub Pages
(185.199.108-111.153), and `www` is a CNAME to `cyt9959.github.io`. MX and SPF
records point at GoDaddy email and are unrelated to hosting — do not change them
when adjusting the website.

## Enquiry form

The form posts to Formspree (free tier). The endpoint is the `action` attribute
on `#enquiry` in `index.html`; `script.js` reads it from there, so the endpoint
is only written in one place. Submissions are delivered to
office@chooleepartners.com.
