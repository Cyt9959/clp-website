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

Deployed on Netlify from the `main` branch. Publish directory is the repo
root; there is no build command.
