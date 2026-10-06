"""The Cloaked Man, Phase 2: aloft, the cloak blown apart, shinier; skeleton hands."""
import math
import numpy as np
from cloaked import hood, chain, C1

# a brighter, glossier purple than Phase 1, with a satin sheen
C2 = dict(cloak='#6b41b0', lit='#a883ee', sheen='#eadcff', dark='#3b2170', deep='#22113f', hoodIn='#0c0716',
          mouth='#9a86b8')
BACK = dict(cloak='#3b2170', lit='#6b41b0', dark='#22113f', deep='#150a28')     # the cloak's inner face
BONE = dict(bone='#e9dfc9', lit='#fff8e8', dark='#9a8f78', joint='#6f6656')
IRON = dict(iron='#848b9b', lit='#d6deeb')

def cloth(c, pts, pal=C2, far=1):
    return c.shade(c.mask_poly(pts), pal['cloak'], pal['lit'], pal['dark'], pal.get('deep'), far)

def band(c, m, p0, p1, lo, hi, col, alpha=1.0):
    """Paint the part of mask m lying lo..hi to the left of the line p0→p1: the satin's sheen."""
    xx, yy = c.grid(); dx, dy = p1[0] - p0[0], p1[1] - p0[1]; L = math.hypot(dx, dy) or 1
    s = (dx * (yy - p0[1]) - dy * (xx - p0[0])) / L
    t = ((xx - p0[0]) * dx + (yy - p0[1]) * dy) / (L * L)
    c.fill(m & (s >= lo) & (s < hi) & (t > 0) & (t < 1), col, alpha)

def sparkle(c, x, y, big=False):
    c.P(x, y, '#ffffff'); c.glow(x + .5, y + .5, 4 if big else 3, (230, 215, 255), .45 if big else .3)
    if big:
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)): c.P(x + dx, y + dy, '#ffffff', .55)

def sleeve(c, s, e, w0, w1, sweep=0, tatters=4, seed=0, pal=C2):
    """A bell sleeve from shoulder s to cuff e, flaring from w0 to w1. The cuff's edge is torn into tatters and
    swept back along the arm by `sweep` at one corner (blown)."""
    dx, dy = e[0] - s[0], e[1] - s[1]; L = math.hypot(dx, dy); d = (dx / L, dy / L); n = (-d[1], d[0])
    P = lambda o, a, b: (o[0] + n[0] * a + d[0] * b, o[1] + n[1] * a + d[1] * b)
    pts = [P(s, w0 / 2, 0)]
    rng = np.random.default_rng(seed)
    for k in range(tatters * 2 + 1):
        f = k / (tatters * 2); a = w1 / 2 - w1 * f
        tip = (2.5 + rng.random() * 2.5) if k % 2 else 0
        pts.append(P(e, a, tip - sweep * f))
    pts.append(P(s, -w0 / 2, 0))
    m = c.shade(c.mask_poly(pts), pal['cloak'], pal['lit'], pal['dark'], pal.get('deep'))
    band(c, m, s, e, -w1 * .32, -w1 * .32 + 1.3, pal['sheen'], .9)          # the satin catching the light
    band(c, m, s, e, -w1 * .32 + 1.3, -w1 * .32 + 2.6, pal['lit'], .6)
    band(c, m, s, e, w1 * .12, w1 * .12 + 1, pal['deep'], .7)                # a fold
    return m

def bone_hand(c, x, y, ang, L=7, spread=.34, curl=.35, n=4, point=None, thumb=-1):
    """Carpals, then four long finger bones in two phalanges, knuckles darker, tips lit. `point` extends one
    finger (index) straight while the rest curl short."""
    B = BONE
    for i in range(n):
        a = ang + (i - (n - 1) / 2) * spread
        ll = L * (1.35 if point == i else (.45 if point is not None else 1))
        cc = 0 if point == i else (curl * 2.4 if point is not None else curl)
        kx, ky = x + math.cos(a) * 2, y + math.sin(a) * 2
        mx, my = kx + math.cos(a) * ll * .5, ky + math.sin(a) * ll * .5
        tx, ty = mx + math.cos(a + cc) * ll * .5, my + math.sin(a + cc) * ll * .5
        c.limb(kx, ky, mx, my, 1, B['bone']); c.limb(mx, my, tx, ty, 1, B['bone'])
        c.P(kx, ky, B['joint']); c.P(mx, my, B['dark']); c.P(tx, ty, B['lit'])
    a = ang + thumb * ((n - 1) / 2 + 1.2) * spread
    tx, ty = x + math.cos(a) * L * .6, y + math.sin(a) * L * .6
    c.limb(x, y, tx, ty, 1, B['bone']); c.P(tx, ty, B['lit'])
    c.B(x - 1, y - 1, 3, 3, B['bone']); c.P(x - 1, y - 1, B['lit']); c.P(x + 1, y + 1, B['dark'])

def wrist(c, e, h):
    """The two forearm bones from inside the cuff out to the hand."""
    for o in (-.6, .6): c.limb(e[0], e[1] + o, h[0], h[1] + o, 1, BONE['bone'])
    c.P((e[0] + h[0]) / 2, (e[1] + h[1]) / 2, BONE['dark'])

def broken_shackle(c, x, y):
    """A cuff split open, floating free of the wrist."""
    c.B(x, y, 2, 3, IRON['iron']); c.B(x + 3, y, 2, 3, IRON['iron']); c.B(x, y, 2, 1, IRON['lit']); c.B(x + 3, y, 2, 1, IRON['lit'])
    c.P(x + 4, y + 1, '#ffffff'); c.glow(x + 4.5, y + 1.5, 3, (230, 240, 255), .25)

def link(c, x, y, v=False):
    if v: c.B(x, y, 1, 2, IRON['iron']); c.P(x, y, IRON['lit'])
    else: c.B(x, y, 2, 1, IRON['iron']); c.P(x, y, IRON['lit'])

def hover_shadow(c, cx, gy, w=16):
    c.B(cx - w / 2, gy + 1, w, 1, (6, 3, 14), .28); c.B(cx - w / 2 + 3, gy, w - 6, 1, (6, 3, 14), .18)
    c.glow(cx, gy - 1, 14, (120, 70, 200), .14)

# ── A: THE GALE — arms level, sleeves blown out like wings, the cloak split below ──
def p2_gale(c, gy, cx=78):
    top = gy - 54
    hover_shadow(c, cx, gy, 18)
    c.glow(cx, top + 18, 30, (130, 80, 220), .10)
    for sgn in (-1, 1):                                                   # the cloak's sides, blown apart behind
        X = lambda dx: cx + sgn * dx
        cloth(c, [(X(3), top + 12), (X(9), top + 16), (X(20), top + 25), (X(26), top + 33), (X(20), top + 32),
                  (X(18), top + 38), (X(13), top + 33), (X(10), top + 39), (X(4), top + 30)], BACK)
    body = cloth(c, [(cx - 6, top + 10), (cx + 6, top + 10), (cx + 8, top + 24), (cx + 5, top + 28), (cx + 6, top + 37),
                     (cx + 2, top + 31), (cx, top + 41), (cx - 2, top + 31), (cx - 6, top + 37), (cx - 5, top + 28), (cx - 8, top + 24)])
    band(c, body, (cx - 2, top + 30), (cx - 3, top + 10), 0, 1.2, C2['sheen'], .85)
    band(c, body, (cx + 3, top + 10), (cx + 3, top + 30), 0, 1, C2['deep'], .6)
    for sgn in (-1, 1):
        s, e = (cx + sgn * 5, top + 13), (cx + sgn * 24, top + 10)
        sleeve(c, s, e, 5, 14, sweep=-3, seed=3 + sgn)
        h = (cx + sgn * 28, top + 10); wrist(c, e, h)
        bone_hand(c, h[0], h[1], 0 if sgn > 0 else math.pi, L=7, spread=.38, curl=.2 * sgn, thumb=-sgn)
        broken_shackle(c, cx + sgn * 30 - 2, top + 3)
        for k, (lx, ly) in enumerate([(33, 1), (36, -1), (39, 0)]): link(c, cx + sgn * lx, top + ly, k % 2)
    hood(c, cx, top, w=12, h=11, pal=C2)
    for x, y, big in [(cx - 5, top + 8, 0), (cx - 16, top + 11, 0), (cx + 13, top + 13, 0), (cx - 2, top + 22, 1), (cx + 18, top + 27, 0)]:
        sparkle(c, x, y, big)

# ── B: THE ASCENDANT — arms up in a V, the sleeves hanging out from them like banners; chain shards orbit ──
def p2_ascendant(c, gy, cx=78):
    top = gy - 52
    hover_shadow(c, cx, gy, 16)
    ring = [(cx + 24 * math.cos(a), top + 22 + 7 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 9)[:-1]]
    for i, (x, y) in enumerate(ring):                                      # the far half of the orbit, behind him
        if y < top + 22: chain(c, [(x - 2, y), (x + 3, y + 1)], glint=9, sparkle=False)
    c.glow(cx, top - 8, 12, (190, 150, 255), .5); c.glow(cx, top - 8, 5, (255, 240, 255), .6)   # a light gathered overhead
    for sgn in (-1, 1):                                                   # the skirt, blown open like petals
        X = lambda dx: cx + sgn * dx
        cloth(c, [(X(2), top + 22), (X(8), top + 25), (X(19), top + 31), (X(22), top + 37), (X(15), top + 35),
                  (X(12), top + 41), (X(7), top + 35), (X(4), top + 44), (X(1), top + 34)], BACK)
    body = cloth(c, [(cx - 6, top + 10), (cx + 6, top + 10), (cx + 7, top + 26), (cx + 3, top + 34), (cx, top + 45),
                     (cx - 3, top + 34), (cx - 7, top + 26)])
    band(c, body, (cx - 3, top + 34), (cx - 4, top + 10), 0, 1.2, C2['sheen'], .85)
    for sgn in (-1, 1):
        X = lambda dx: cx + sgn * dx
        # the banner: the sleeve's slack falling from the raised arm, blown outward
        m = cloth(c, [(X(5), top + 12), (X(15), top - 3), (X(19), top - 2), (X(21), top + 6), (X(26), top + 14), (X(23), top + 15),
                      (X(25), top + 21), (X(20), top + 19), (X(19), top + 25), (X(15), top + 20), (X(11), top + 23), (X(7), top + 17)])
        band(c, m, (X(8), top + 12), (X(18), top - 1), -.6 * sgn - (1.2 if sgn > 0 else 0), -.6 * sgn + (0 if sgn > 0 else 1.2), C2['sheen'], .9)
        band(c, m, (X(10), top + 20), (X(22), top + 8), -.5, .5, C2['deep'], .6)
        e, h = (X(17), top - 4), (X(19), top - 8); wrist(c, e, h)
        bone_hand(c, h[0], h[1], -math.pi / 2 + sgn * .45, L=8, spread=.36, curl=-.25 * sgn, thumb=-sgn)
    hood(c, cx, top, w=12, h=11, pal=C2)
    for i, (x, y) in enumerate(ring):                                      # the near half, in front
        if y >= top + 22: chain(c, [(x - 2, y), (x + 3, y + 1)], glint=2)
    for x, y, big in [(cx - 3, top + 16, 1), (cx - 20, top + 8, 0), (cx + 14, top + 4, 0), (cx + 12, top + 33, 0)]:
        sparkle(c, x, y, big)

# ── C: THE TEMPEST — lunging through the air at the knight, one bony finger pointing; everything streams back ──
def p2_tempest(c, gy, cx=80):
    top = gy - 50
    hover_shadow(c, cx + 4, gy, 22)
    # the chain still fast to the front wrist, whipping back behind him
    chain(c, [(cx - 16, top + 17), (cx - 8, top + 24), (cx + 4, top + 22), (cx + 16, top + 27), (cx + 28, top + 23),
              (cx + 38, top + 28), (cx + 44, top + 25)], glint=5)
    for pts in ([(cx + 2, top + 18), (cx + 18, top + 16), (cx + 33, top + 19), (cx + 42, top + 16), (cx + 34, top + 22), (cx + 20, top + 24), (cx + 4, top + 26)],
                [(cx + 2, top + 24), (cx + 16, top + 28), (cx + 30, top + 34), (cx + 38, top + 33), (cx + 28, top + 38), (cx + 14, top + 35), (cx, top + 31)]):
        cloth(c, pts, BACK)                                                 # tails streaming back, the inner face
    # the back arm swept behind: a long streamer of sleeve
    sleeve(c, (cx + 3, top + 13), (cx + 22, top + 7), 5, 11, sweep=4, seed=11, pal=BACK | {'sheen': C2['lit']})
    wrist(c, (cx + 22, top + 7), (cx + 25, top + 6))
    bone_hand(c, cx + 25, top + 6, -.15, L=7, spread=.28, curl=.5, thumb=1)
    body = cloth(c, [(cx - 7, top + 10), (cx + 4, top + 9), (cx + 10, top + 20), (cx + 26, top + 27), (cx + 34, top + 26),
                     (cx + 24, top + 31), (cx + 12, top + 31), (cx + 16, top + 37), (cx + 4, top + 33), (cx - 3, top + 27)])
    band(c, body, (cx - 5, top + 12), (cx + 30, top + 27), 1, 2.2, C2['sheen'], .85)
    band(c, body, (cx - 1, top + 22), (cx + 20, top + 31), -.5, .5, C2['deep'], .6)
    hood(c, cx - 3, top, w=12, h=11, droop=1, pal=C2)
    c.B(cx - 10, top + 6, 2, 3, C2['cloak']); c.P(cx - 10, top + 6, C2['lit'])     # the hood's brim, pushed forward
    # the front arm, pointing: the sleeve's bell blown back along the arm
    sleeve(c, (cx - 5, top + 14), (cx - 16, top + 16), 5, 11, sweep=-4, seed=7)
    wrist(c, (cx - 16, top + 16), (cx - 20, top + 16)); c.B(cx - 18, top + 15, 3, 3, IRON['iron']); c.B(cx - 18, top + 15, 3, 1, IRON['lit'])
    bone_hand(c, cx - 21, top + 16, math.pi, L=8, spread=.3, point=1, thumb=1)
    c.glow(cx - 31, top + 15, 5, (190, 140, 255), .6); c.P(cx - 31, top + 15, '#ffffff')   # at the fingertip, a mote
    for x, y, big in [(cx - 7, top + 8, 0), (cx + 14, top + 22, 0), (cx - 11, top + 12, 0), (cx + 30, top + 18, 0)]:
        sparkle(c, x, y, big)
