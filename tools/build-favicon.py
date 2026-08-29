"""Build the site favicon from the CL monogram in images/logo-dark.png.

The monogram is cropped out of the wordmark lockup, recoloured to the paper
tint used on dark UI, and centred on the brand navy square so the icon stays
legible in both light and dark browser chrome.
"""
import os

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
NAVY = (11, 20, 36)        # --navy-950
INK = (243, 233, 216)      # warm off-white, matches .firm-facts .v

src = Image.open(os.path.join(ROOT, 'images/logo-dark.png')).convert('RGBA')
W, H = src.size

# --- locate the monogram: the leftmost ink cluster, before the wordmark gap
alpha = src.split()[3]
rgb = src.convert('RGB')
cols = []
for x in range(W):
    ink = 0
    for y in range(0, H, 2):
        a = alpha.getpixel((x, y))
        r, g, b = rgb.getpixel((x, y))
        if a > 40 and (r + g + b) / 3 < 170:
            ink += 1
    cols.append(ink)

first = next(x for x, c in enumerate(cols) if c > 0)
# walk right until a sustained blank gutter (the space before "CHOO")
gap, last = 0, first
for x in range(first, W):
    if cols[x] > 0:
        last, gap = x, 0
    else:
        gap += 1
        if gap > 40:
            break

rows = []
for y in range(H):
    ink = 0
    for x in range(first, last + 1):
        a = alpha.getpixel((x, y))
        r, g, b = rgb.getpixel((x, y))
        if a > 40 and (r + g + b) / 3 < 170:
            ink += 1
    rows.append(ink)
top = next(y for y, c in enumerate(rows) if c > 0)
bot = H - 1 - next(y for y, c in enumerate(reversed(rows)) if c > 0)
print('monogram box: x %d-%d  y %d-%d  (%dx%d)' % (first, last, top, bot, last - first + 1, bot - top + 1))

mono = src.crop((first, top, last + 1, bot + 1))

# --- recolour the ink to the warm off-white, keeping the glyph's own alpha
mask = Image.new('L', mono.size)
mpx, spx = mask.load(), mono.convert('RGB').load()
apx = mono.split()[3].load()
for y in range(mono.size[1]):
    for x in range(mono.size[0]):
        r, g, b = spx[x, y]
        darkness = max(0, 255 - int((r + g + b) / 3))     # dark ink -> opaque
        mpx[x, y] = min(255, darkness * apx[x, y] // 255 * 255 // max(1, 200))

glyph = Image.new('RGBA', mono.size, INK + (0,))
glyph.putalpha(mask)


def icon(size, pad_ratio):
    """Monogram centred on a navy square, sized to `pad_ratio` of the box."""
    canvas = Image.new('RGBA', (size, size), NAVY + (255,))
    box = int(size * pad_ratio)
    w, h = glyph.size
    scale = min(box / w, box / h)
    g = glyph.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    canvas.alpha_composite(g, ((size - g.size[0]) // 2, (size - g.size[1]) // 2))
    return canvas


# multi-resolution .ico for the browser tab / bookmarks
master = icon(256, 0.70)
master.convert('RGB').save(
    os.path.join(ROOT, 'favicon.ico'),
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

# PNG for modern browsers, and the iOS home-screen icon (no transparency)
icon(32, 0.70).save(os.path.join(ROOT, 'images/favicon-32.png'))
icon(180, 0.62).convert('RGB').save(os.path.join(ROOT, 'images/apple-touch-icon.png'), quality=95)

for f in ['favicon.ico', 'images/favicon-32.png', 'images/apple-touch-icon.png']:
    print('%-32s %6.1f KB' % (f, os.path.getsize(os.path.join(ROOT, f)) / 1024))
