"""A small Python port of the Fable v4 respec renderer's drawing vocabulary (public/bladefall-respec-renderer.js):
B() blocks on a half-resolution buffer, pixelLimb() segments, additive glow(), banded skies. Upscaled with
nearest-neighbour so every buffer pixel stays a hard square, exactly as the game blits it."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def hx(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))

class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.a = np.zeros((h, w, 3), dtype=float)

    def B(self, x, y, w, h, col, alpha=1.0):
        x0, y0 = int(round(x)), int(round(y))
        x1, y1 = x0 + max(1, int(round(w))), y0 + max(1, int(round(h)))
        x0, y0, x1, y1 = max(0, x0), max(0, y0), min(self.w, x1), min(self.h, y1)
        if x1 <= x0 or y1 <= y0: return
        c = np.array(hx(col) if isinstance(col, str) else col, dtype=float)
        if alpha >= 1: self.a[y0:y1, x0:x1] = c
        else: self.a[y0:y1, x0:x1] = self.a[y0:y1, x0:x1] * (1 - alpha) + c * alpha

    def P(self, x, y, col, alpha=1.0): self.B(x, y, 1, 1, col, alpha)

    def glow(self, x, y, r, rgb, a):
        """The renderer's glow: a radial gradient composited 'lighter' (additive)."""
        r = max(1, r); c = np.array(rgb, dtype=float)
        x0, x1 = max(0, int(x - r)), min(self.w, int(x + r) + 1)
        y0, y1 = max(0, int(y - r)), min(self.h, int(y + r) + 1)
        if x1 <= x0 or y1 <= y0: return
        yy, xx = np.mgrid[y0:y1, x0:x1]
        d = np.sqrt((xx - x) ** 2 + (yy - y) ** 2) / r
        k = np.clip(1 - d, 0, 1) * a
        self.a[y0:y1, x0:x1] += k[..., None] * c

    def limb(self, x0, y0, x1, y1, t, col, alpha=1.0):
        """pixelLimb: a run of t-wide blocks from one point to another."""
        n = max(1, int(max(abs(x1 - x0), abs(y1 - y0))))
        for i in range(n + 1):
            f = i / n
            self.B(x0 + (x1 - x0) * f - t / 2, y0 + (y1 - y0) * f - t / 2, t, t, col, alpha)

    def sky(self, cols, y0=0, y1=None):
        """Banded vertical ramp, like FA.sky: hard bands, not a smooth gradient."""
        y1 = self.h if y1 is None else y1
        n = len(cols) - 1; bands = 18
        for i in range(bands):
            f = i / (bands - 1); k = min(n - 1, int(f * n)); t = f * n - k
            a, b = np.array(hx(cols[k]), float), np.array(hx(cols[k + 1]), float)
            c = a + (b - a) * t
            ya = y0 + (y1 - y0) * i / bands; yb = y0 + (y1 - y0) * (i + 1) / bands
            self.B(0, ya, self.w, yb - ya + 1, c)

    # ── masks: filled shapes, shaded the way the renderer shades its sprites ──
    def grid(self):
        yy, xx = np.mgrid[0:self.h, 0:self.w]
        return xx + .5, yy + .5

    def mask_poly(self, pts):
        xx, yy = self.grid(); inside = np.zeros((self.h, self.w), bool); n = len(pts)
        with np.errstate(divide='ignore', invalid='ignore'):
            for i in range(n):
                (xi, yi), (xj, yj) = pts[i], pts[i - 1]
                if yi == yj: continue
                inside ^= ((yi > yy) != (yj > yy)) & (xx < (xj - xi) * (yy - yi) / (yj - yi) + xi)
        return inside

    def mask_ellipse(self, cx, cy, rx, ry):
        xx, yy = self.grid()
        return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1

    def mask_thick(self, pts, r0, r1=None):
        """A polyline swept by a disc whose radius tapers from r0 to r1 along its length."""
        r1 = r0 if r1 is None else r1
        xx, yy = self.grid(); m = np.zeros((self.h, self.w), bool)
        L = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])]; tot = sum(L) or 1; acc = 0
        for (ax, ay), (bx, by), l in zip(pts, pts[1:], L):
            dx, dy = bx - ax, by - ay; ll = dx * dx + dy * dy or 1e-9
            t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / ll, 0, 1)
            d = np.hypot(xx - (ax + t * dx), yy - (ay + t * dy))
            r = r0 + (r1 - r0) * (acc + t * l) / tot
            m |= d <= r; acc += l
        return m

    def fill(self, m, col, alpha=1.0):
        c = np.array(hx(col) if isinstance(col, str) else col, dtype=float)
        self.a[m] = self.a[m] * (1 - alpha) + c * alpha

    def shade(self, m, base, lit, dark, deep=None, far=1):
        """Fill, then the sprite's bands: a lit rim where the top or left is open, a dark far side (right and
        underneath), `far` pixels deep."""
        p = np.pad(m, far + 1)
        H, W = m.shape
        def nb(dy, dx): return p[far + 1 + dy:far + 1 + dy + H, far + 1 + dx:far + 1 + dx + W]
        self.fill(m, base)
        dk = np.zeros_like(m)
        for k in range(1, far + 1): dk |= ~nb(0, k) | ~nb(k, 0)
        self.fill(m & dk, dark)
        if deep: self.fill(m & ~nb(1, 0), deep)
        self.fill(m & (~nb(-1, 0) | ~nb(0, -1)), lit)
        return m

    def image(self, scale):
        img = Image.fromarray(np.clip(self.a, 0, 255).astype(np.uint8), 'RGB')
        return img.resize((self.w * scale, self.h * scale), Image.NEAREST)

# ── The game's own palette pieces ────────────────────────────────────────────
FRACTURED_SKY = ['#07060f', '#140d22', '#2a1330', '#4a1c2a']
STONE = dict(stone='#34303e', lit='#4a4556', dark='#22202a', line='#0d0b12')
HERO = dict(cloak='#2f4d8f', cloakLit='#4a76c8', cloakDark='#1d2f5c', hood='#1b2340', scarf='#ff7f5c', eye='#9ff4ff', skin='#f2c9a0')

def hero(c, px, py, f=1):
    """drawFigure's idle pose (bladefall-respec-renderer.js), for scale: 13 x 22 buffer px."""
    pal = HERO
    c.B(px + 1, py + 21, 11, 2, (6, 3, 14), .35)
    for i in range(6):
        w = 7 - (i - 3 if i > 3 else 0)
        c.B(px + 3 - (0 if f > 0 else 1), py + 8 + i, w, 1, pal['cloakLit'] if i < 2 else (pal['cloakDark'] if i > 4 else pal['cloak']))
    c.B(px + 4, py + 16, 2, 6, pal['hood']); c.B(px + 7, py + 16, 2, 6, pal['hood'])
    c.B(px + 3, py + 9, 7, 8, pal['cloak']); c.B(px + 3, py + 9, 7, 1, pal['cloakLit']); c.B(px + 5, py + 12, 3, 1, pal['cloakDark'])
    c.B(px + 3, py + 14, 7, 1, pal['scarf'])
    c.B(px + (1 if f > 0 else 9), py + 8, 3, 1, pal['scarf']); c.B(px + (0 if f > 0 else 11), py + 9, 2, 1, pal['scarf'])
    c.B(px + 2, py + 1, 9, 8, pal['hood']); c.B(px + 3, py, 7, 1, pal['hood']); c.B(px + 2, py + 1, 1, 6, pal['cloakLit'])
    c.B(px + (5 if f > 0 else 3), py + 4, 5, 4, pal['skin'])
    ex = px + 8 if f > 0 else px + 4
    c.B(ex, py + 5, 1, 1, pal['eye']); c.B(ex + (-2 if f > 0 else 2), py + 5, 1, 1, pal['eye'])
    gx, gy = px + (1 if f > 0 else 10), py + 7
    for i in range(7): c.B(gx + (i * -.3 if f > 0 else i * .3), gy + i, 1, 1, '#dff6ff')

def ground(c, y, x0=0, x1=None):
    """A strip of the Fractured region's stone: cap, lit line, dark body, seams."""
    x1 = c.w if x1 is None else x1
    c.B(x0, y, x1 - x0, c.h - y, STONE['dark']); c.B(x0, y, x1 - x0, 3, STONE['stone']); c.B(x0, y, x1 - x0, 1, STONE['lit'])
    for x in range(x0 + 7, x1, 23): c.B(x, y + 4, 1, 5, STONE['line'])
    for x in range(x0 + 3, x1, 11):
        if (x * 37) % 7 == 0: c.B(x, y + 2, 1, 1, '#8a5cd8')

def label(img, text, sub=None, font=None):
    d = ImageDraw.Draw(img)
    f1 = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 26) if font is None else font
    f2 = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 17)
    d.text((18, 14), text, fill=(232, 226, 242), font=f1)
    if sub: d.text((18, 48), sub, fill=(160, 150, 185), font=f2)
    return img
