# Choo, Lee & Partners — firm website

Static single-page site. No build step: the files are served as-is.

## Structure

    index.html      markup
    styles.css      all styles (@font-face declarations first, then site CSS)
    script.js       mobile nav, hero slider, scroll reveal, enquiry form
    images/         logos, hero photography, partner portraits
    fonts/          self-hosted Cormorant Garamond + Inter woff2 subsets

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
