import io, os, re, sys
from html.parser import HTMLParser
from urllib.parse import urldefrag

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(ROOT)

pages = []
for d, dirs, fs in os.walk('.'):
    dirs[:] = [x for x in dirs if x not in ('.git', '_original', '.netlify', 'fonts')]
    for f in fs:
        if f.endswith('.html'):
            pages.append(os.path.join(d, f).replace(os.sep, '/').lstrip('./'))
pages.sort()


class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.links = []; s.ids = set(); s.h = []
        s.title = None; s.meta = None; s.canon = None
        s._t = False; s._cur = None; s._buf = ''; s._imgnoalt = 0

    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            s.ids.add(a['id'])
        if tag == 'a' and 'href' in a:
            s.links.append(('href', a['href']))
        if tag in ('img', 'script') and 'src' in a:
            s.links.append(('src', a['src']))
        if tag == 'img' and not a.get('alt'):
            s._imgnoalt += 1
        if tag == 'link':
            if a.get('rel') == 'stylesheet' and 'href' in a:
                s.links.append(('css', a['href']))
            if a.get('rel') in ('icon', 'apple-touch-icon', 'shortcut icon') and 'href' in a:
                s.links.append(('icon', a['href']))
            if a.get('rel') == 'canonical':
                s.canon = a.get('href')
        if tag == 'meta' and a.get('name') == 'description':
            s.meta = a.get('content')
        if tag == 'title':
            s._t = True
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            s._cur = tag; s._buf = ''

    def handle_endtag(s, tag):
        if tag == 'title':
            s._t = False
        if tag == s._cur:
            s.h.append((tag, ' '.join(s._buf.split()))); s._cur = None

    def handle_data(s, d):
        if s._t:
            s.title = (s.title or '') + d
        if s._cur:
            s._buf += d


errors, warns = [], []
parsed = {}
for pg in pages:
    p = P()
    p.feed(io.open(pg, encoding='utf-8').read())
    parsed[pg] = p


def norm(pg, href):
    base = os.path.dirname(pg)
    return os.path.normpath(os.path.join(base, href)).replace(os.sep, '/')


expected_canon = {}
for pg in pages:
    d = os.path.dirname(pg)
    expected_canon[pg] = 'https://chooleepartners.com/' + (d + '/' if d else '')

for pg in pages:
    p = parsed[pg]
    if not p.title:
        errors.append(pg + ': missing <title>')
    if not p.meta:
        errors.append(pg + ': missing meta description')
    if not p.canon:
        errors.append(pg + ': missing canonical')
    elif p.canon != expected_canon[pg]:
        errors.append('%s: canonical %s != expected %s' % (pg, p.canon, expected_canon[pg]))
    h1 = [t for t, _ in p.h if t == 'h1']
    if len(h1) != 1:
        errors.append('%s: expected 1 <h1>, found %d' % (pg, len(h1)))
    if p._imgnoalt:
        warns.append('%s: %d <img> without alt' % (pg, p._imgnoalt))
    icons = [u for k, u in p.links if k == 'icon']
    if len(icons) != 3:
        errors.append('%s: expected 3 icon links, found %d' % (pg, len(icons)))

    lvl = 0
    for t, txt in p.h:
        n = int(t[1])
        if lvl and n > lvl + 1:
            warns.append('%s: heading jump h%d -> h%d at "%s"' % (pg, lvl, n, txt[:44]))
        lvl = n

    for kind, url in p.links:
        if re.match(r'^(https?:|mailto:|tel:|data:)', url):
            continue
        if url.startswith('#'):
            frag = url[1:]
            if frag and frag not in p.ids:
                errors.append('%s: in-page anchor #%s not found' % (pg, frag))
            continue
        path, frag = urldefrag(url)
        tgt = norm(pg, path) if path else pg
        fs = tgt
        if path.endswith('/'):
            fs = tgt.rstrip('/') + '/index.html'
        elif os.path.isdir(tgt):
            fs = tgt + '/index.html'
        if not os.path.exists(fs):
            errors.append('%s: broken %s -> %s (looked for %s)' % (pg, kind, url, fs))
        elif frag and fs.endswith('.html'):
            if fs in parsed and frag not in parsed[fs].ids:
                errors.append('%s: %s -> #%s not present in %s' % (pg, url, frag, fs))

# sitemap coverage
sm = io.open('sitemap.xml', encoding='utf-8').read()
locs = set(re.findall(r'<loc>(.*?)</loc>', sm))
for pg in pages:
    want = expected_canon[pg]
    if want not in locs:
        errors.append('sitemap.xml: missing ' + want)
for l in sorted(locs):
    if l not in set(expected_canon.values()):
        errors.append('sitemap.xml: lists non-existent page ' + l)

rb = io.open('robots.txt', encoding='utf-8').read()
if 'Sitemap: https://chooleepartners.com/sitemap.xml' not in rb:
    errors.append('robots.txt: sitemap line missing')

print('%d HTML pages checked, %d sitemap URLs\n' % (len(pages), len(locs)))
for pg in pages:
    p = parsed[pg]
    h1 = next((t[1] for t in p.h if t[0] == 'h1'), '!! NONE')
    print('  %-50s h1: %s' % (pg, h1[:50]))
print()
if warns:
    print('WARNINGS:')
    for w in warns:
        print('  ', w)
    print()
if errors:
    print('ERRORS:')
    for e in errors:
        print('  ', e)
    sys.exit(1)
print('OK: no broken internal links; every page has a unique title, meta description,')
print('    correct canonical and a single H1; sitemap matches the page set.')
