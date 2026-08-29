/* Static page generator for the CLP website.
   Regenerates every page under /practice-areas/ and /people/, the /privacy/
   and /terms/ stubs, sitemap.xml and robots.txt from the copy in content.js.
   The homepage (index.html) is hand-maintained and is NOT touched.

   Run from anywhere:  node tools/build-pages.js
   Then check it:      python tools/verify-site.py */
const fs = require('fs');
const path = require('path');
const { SITE, partners, practices } = require('./content.js');

const ROOT = path.join(__dirname, '..');
const bySlug = Object.fromEntries(partners.map(p => [p.slug, p]));

const write = (rel, html) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html.replace(/\r?\n/g, '\n'), 'utf8');
  console.log('wrote', rel);
};

/* ---------- shared chrome ---------- */

const head = (base, { title, meta, canonical }) => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${meta}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${base}favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${base}images/favicon-32.png">
<link rel="apple-touch-icon" href="${base}images/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link rel="stylesheet" href="${base}styles.css">
</head>
<body>

<div class="topline"></div>
<header>
  <div class="wrap nav">
    <a class="brand" href="${base}index.html" aria-label="Choo, Lee &amp; Partners — home">
      <div>
        <img src="${base}images/logo-dark.png" alt="Choo, Lee &amp; Partners — Advocates &amp; Solicitors">
      </div>
    </a>
    <nav>
      <ul class="nav-links" id="navLinks">
        <li><a href="${base}index.html#firm">About</a></li>
        <li><a href="${base}practice-areas/">Practice Areas</a></li>
        <li><a href="${base}people/">Our People</a></li>
        <li><a href="${base}index.html#insights">Insights</a></li>
        <li><a href="${base}index.html#contact">Contact</a></li>
        <li><a class="cta" href="${base}index.html#contact">Discuss a matter</a></li>
      </ul>
      <button class="burger" id="burger" aria-label="Open menu"><span></span><span></span><span></span></button>
    </nav>
  </div>
</header>
`;

const pageHeader = (base, { eyebrow, h1, lede, crumbs, role }) => `
<section class="page-header">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${base}index.html">Home</a>${crumbs.map(c =>
        `<span class="sep">/</span>` + (c.href ? `<a href="${c.href}">${c.label}</a>` : `<span>${c.label}</span>`)
      ).join('')}
    </nav>
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    ${role ? `<div class="role">${role}</div>` : ''}
    <p class="lede">${lede}</p>
  </div>
</section>
`;

const ctaBand = (base, { title, copy, second }) => `
<section class="cta-band">
  <div class="wrap">
    <div class="reveal">
      <span class="eyebrow">Contact</span>
      <h2>${title}</h2>
      <p>${copy}</p>
    </div>
    <div class="cta-actions reveal">
      <a class="btn btn-solid" href="${base}index.html#contact">Discuss a matter</a>
      ${second ? `<a class="btn btn-ghost" href="${second.href}">${second.label}</a>` : ''}
    </div>
  </div>
</section>
`;

const foot = (base) => `
<footer>
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <img src="${base}images/logo-light.png" alt="Choo, Lee &amp; Partners — Advocates &amp; Solicitors">
      </div>
      <div class="foot-links">
        <a href="${base}index.html#firm">About</a>
        <a href="${base}practice-areas/">Practice Areas</a>
        <a href="${base}people/">Our People</a>
        <a href="${base}index.html#insights">Insights</a>
        <a href="${base}index.html#contact">Careers</a>
        <a href="${base}index.html#contact">Contact</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Messrs Choo, Lee &amp; Partners. All rights reserved.</span>
      <span><a href="${base}privacy/">Privacy Notice</a> &nbsp;·&nbsp; <a href="${base}terms/">Terms of Use</a> &nbsp;·&nbsp; This website is for general information only and does not constitute legal advice.</span>
    </div>
  </div>
</footer>

<a class="wa" href="https://wa.me/60105639869" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4.7 27l5.3-1.6c1.9 1.1 4 1.6 6 1.6 6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.7c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.1.9.9-3-.2-.4c-1.2-1.7-1.9-3.7-1.9-5.7 0-5.4 4.5-9.8 10-9.8s10 4.4 10 9.8-4.5 9.9-10 9.9zm5.5-7.3c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"></path></svg>
</a>

<script src="${base}script.js"></script>

</body></html>
`;

/* ---------- reusable fragments ---------- */

const partnerCard = (base, p, label) => `
        <a class="partner-card reveal" href="${base}people/${p.slug}/">
          <span class="eyebrow">${label}</span>
          <img src="${base}images/${p.photo}" alt="${p.name.replace(/ \(.*\)$/, '')}">
          <h3>${p.name}</h3>
          <div class="role">${p.role}</div>
          <span class="more">View profile<span>→</span></span>
        </a>`;

const practiceSideNav = (base, currentSlug) => `
        <nav class="side-nav reveal" aria-label="Practice areas">
          <h2>All practice areas</h2>
          <ul>
${practices.map(pr => `            <li><a href="${base}practice-areas/${pr.slug}/"${pr.slug === currentSlug ? ' aria-current="page"' : ''}>${pr.name}</a></li>`).join('\n')}
          </ul>
        </nav>`;

/* ---------- 1. practice area pages ---------- */

for (const pr of practices) {
  const base = '../../';
  const lead = bySlug[pr.lead];
  const body = `
<section class="page-body">
  <div class="wrap page-grid">
    <div class="page-main">
      <div class="prose reveal">
${pr.intro.map(t => `        <p>${t}</p>`).join('\n')}
      </div>

      <div class="reveal">
        <h2 class="block-title">How we help</h2>
        <ul class="help-list">
${pr.help.map(h => `          <li>${h}</li>`).join('\n')}
        </ul>
      </div>
${pr.experience ? `
      <div class="experience reveal">
        <h2 class="block-title">Representative experience</h2>
        <p>${pr.experience}</p>
      </div>
` : ''}    </div>

    <aside class="page-side">
${partnerCard(base, lead, 'Lead partner')}
${practiceSideNav(base, pr.slug)}
    </aside>
  </div>
</section>
`;
  const html =
    head(base, { title: pr.title, meta: pr.meta, canonical: `${SITE}/practice-areas/${pr.slug}/` }) +
    (pr.note ? `\n<!-- NOTE: ${pr.note} -->\n` : '') +
    pageHeader(base, {
      eyebrow: 'Practice Area',
      h1: pr.name,
      lede: pr.lede,
      crumbs: [{ label: 'Practice Areas', href: `${base}practice-areas/` }, { label: pr.name }],
    }) +
    body +
    ctaBand(base, {
      title: 'Discuss a matter',
      copy: 'Tell us briefly about the matter and the outcome you are looking for. A partner will respond with the practical next step.',
      second: { href: `${base}practice-areas/`, label: 'All practice areas' },
    }) +
    foot(base);
  write(`practice-areas/${pr.slug}/index.html`, html);
}

/* ---------- 2. practice areas index ---------- */
{
  const base = '../';
  const body = `
<section class="page-body alt">
  <div class="wrap">
    <div class="card-grid">
${practices.map((pr, i) => `      <a class="pcard reveal" href="${base}practice-areas/${pr.slug}/">
        <span class="zh-tag">${String(i + 1).padStart(2, '0')}</span>
        <h2>${pr.name}</h2>
        <p>${pr.blurb}</p>
        <span class="more">View practice<span>→</span></span>
      </a>`).join('\n')}
    </div>
  </div>
</section>
`;
  const html =
    head(base, {
      title: 'Practice Areas | Choo, Lee &amp; Partners — Advocates &amp; Solicitors',
      meta: 'The practice areas of Choo, Lee &amp; Partners: corporate &amp; commercial, conveyancing &amp; real estate, dispute resolution, employment, PDPA, IP &amp; technology, estate planning and criminal practice.',
      canonical: `${SITE}/practice-areas/`,
    }) +
    pageHeader(base, {
      eyebrow: 'Practice Areas',
      h1: 'Where we act',
      lede: 'Three core practices, supported by adjacent commercial capabilities. Each practice is led by a partner and scoped to the matter at hand.',
      crumbs: [{ label: 'Practice Areas' }],
    }) +
    body +
    ctaBand(base, {
      title: 'Not sure which practice covers your matter?',
      copy: 'Tell us briefly about the matter and the outcome you are looking for. A partner will respond with the practical next step.',
      second: { href: `${base}people/`, label: 'Meet the partners' },
    }) +
    foot(base);
  write('practice-areas/index.html', html);
}

/* ---------- 3. partner profile pages ---------- */

for (const p of partners) {
  const base = '../../';
  const mine = practices.filter(pr => p.practices.includes(pr.slug));
  const body = `
<section class="page-body">
  <div class="wrap profile-grid">
    <div class="profile-photo reveal">
      <img src="${base}images/${p.photo}" alt="${p.name.replace(/ \(.*\)$/, '')}, ${p.role.replace(/&middot;/g, '—').replace(/&amp;/g, '&')}">
    </div>

    <div class="profile-body prose">
${p.bio.map(([h, t]) => `      <section class="reveal">
        <h2>${h}</h2>
        <p>${t}</p>
      </section>`).join('\n')}

      <section class="reveal">
        <h2>Practice areas</h2>
        <ul class="practice-links">
${mine.map(pr => `          <li><a href="${base}practice-areas/${pr.slug}/">${pr.name}</a></li>`).join('\n')}
        </ul>
      </section>
    </div>
  </div>
</section>
`;
  const html =
    head(base, { title: p.title, meta: p.meta, canonical: `${SITE}/people/${p.slug}/` }) +
    pageHeader(base, {
      eyebrow: 'Our People',
      h1: p.name,
      role: p.role,
      lede: p.lede,
      crumbs: [{ label: 'Our People', href: `${base}people/` }, { label: p.name }],
    }) +
    body +
    ctaBand(base, {
      title: `Discuss a matter with ${(p.name.match(/\(([^)]+)\)/) || [, p.name])[1]}`,
      copy: 'Tell us briefly about the matter and the outcome you are looking for. A partner will respond with the practical next step.',
      second: { href: `${base}people/`, label: 'All partners' },
    }) +
    foot(base);
  write(`people/${p.slug}/index.html`, html);
}

/* ---------- 4. people index ---------- */
{
  const base = '../';
  const body = `
<section class="page-body">
  <div class="wrap">
    <div class="team-grid people-index">
${partners.map(p => `      <div class="person reveal">
        <a href="${base}people/${p.slug}/">
          <div class="frame"><img src="${base}images/${p.photo}" alt="${p.name.replace(/ \(.*\)$/, '')}"></div>
        </a>
        <h2><a href="${base}people/${p.slug}/">${p.name}</a></h2>
        <div class="role">${p.role}</div>
        <p class="focus">${p.focus}</p>
        <a class="plink" href="${base}people/${p.slug}/">View profile</a>
      </div>`).join('\n')}
    </div>
  </div>
</section>
`;
  const html =
    head(base, {
      title: 'Our People — The Partners | Choo, Lee &amp; Partners',
      meta: 'The partners of Choo, Lee &amp; Partners: corporate &amp; commercial, conveyancing &amp; real estate, litigation, estate planning and criminal practice.',
      canonical: `${SITE}/people/`,
    }) +
    pageHeader(base, {
      eyebrow: 'Our People',
      h1: 'The partners',
      lede: 'Every matter at the Firm is handled with direct partner involvement.',
      crumbs: [{ label: 'Our People' }],
    }) +
    body +
    ctaBand(base, {
      title: 'Discuss a matter',
      copy: 'Tell us briefly about the matter and the outcome you are looking for. A partner will respond with the practical next step.',
      second: { href: `${base}practice-areas/`, label: 'Our practice areas' },
    }) +
    foot(base);
  write('people/index.html', html);
}

/* ---------- 5. privacy / terms stubs ---------- */

const stubs = [
  {
    dir: 'privacy',
    h1: 'Privacy Notice',
    title: 'Privacy Notice | Choo, Lee &amp; Partners',
    meta: 'Privacy Notice for chooleepartners.com — Messrs Choo, Lee &amp; Partners, Advocates &amp; Solicitors, Kuala Lumpur.',
    lede: 'How Messrs Choo, Lee &amp; Partners handles personal data under the Personal Data Protection Act 2010.',
  },
  {
    dir: 'terms',
    h1: 'Terms of Use',
    title: 'Terms of Use | Choo, Lee &amp; Partners',
    meta: 'Terms of Use for chooleepartners.com — Messrs Choo, Lee &amp; Partners, Advocates &amp; Solicitors, Kuala Lumpur.',
    lede: 'The terms on which this website is made available.',
  },
];

for (const s of stubs) {
  const base = '../';
  const body = `
<section class="page-body">
  <div class="wrap">
    <div class="stub reveal">
      <h2 class="block-title">Page under preparation</h2>
      <div class="notice">
        <p>This page is currently under preparation. The final ${s.h1.toLowerCase()} will be published here once settled by the Firm.</p>
        <p>In the meantime, any question about this website or about how the Firm handles your information can be directed to <a href="mailto:office@chooleepartners.com">office@chooleepartners.com</a> or <a href="tel:+60105639869">+60 10-563 9869</a>.</p>
      </div>
      <p class="lede">This website is for general information only and does not constitute legal advice.</p>
    </div>
  </div>
</section>
`;
  const html =
    head(base, { title: s.title, meta: s.meta, canonical: `${SITE}/${s.dir}/` }) +
    pageHeader(base, { eyebrow: 'Legal', h1: s.h1, lede: s.lede, crumbs: [{ label: s.h1 }] }) +
    body +
    foot(base);
  write(`${s.dir}/index.html`, html);
}

/* ---------- 6. sitemap + robots ---------- */

const today = '2026-08-29';
const urls = [
  { loc: `${SITE}/`, pri: '1.0' },
  { loc: `${SITE}/practice-areas/`, pri: '0.9' },
  ...practices.map(pr => ({ loc: `${SITE}/practice-areas/${pr.slug}/`, pri: '0.8' })),
  { loc: `${SITE}/people/`, pri: '0.9' },
  ...partners.map(p => ({ loc: `${SITE}/people/${p.slug}/`, pri: '0.7' })),
  { loc: `${SITE}/privacy/`, pri: '0.3' },
  { loc: `${SITE}/terms/`, pri: '0.3' },
];

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>
`);

write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

console.log('\nDone —', urls.length, 'URLs in sitemap.');
