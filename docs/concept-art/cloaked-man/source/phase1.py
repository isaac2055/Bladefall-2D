"""The Cloaked Man, Phase 1, slimmer: the same tapered, shaded cloth as Phase 2 (a narrow shoulder line, the robe
widening to a torn hem), a narrower rounded hood. Still on his feet, gloved, chained, eyeless, a faded mouth."""
import math
from cloaked import C1, chain, shackle, glove
from phase2 import cloth, band, sparkle

P1 = dict(C1, sheen='#b596e6')
BACK1 = dict(cloak=C1['dark'], lit=C1['cloak'], dark=C1['deep'], deep='#150a28')

def hood(c, cx, top, w=10, h=11, droop=0, pal=P1, lean=0):
    """A narrow peaked hood, its crown rounded rather than stepped; shadow for a face, a faded mouth."""
    prof = [2, 4, 6, 8, 9] + [w] * (h - 6) + [w - 1]
    for r, ww in enumerate(prof):
        x = cx - ww / 2 + lean * r / h
        c.B(x, top + r, ww, 1, pal['cloak']); c.P(x, top + r, pal['lit']); c.B(x + ww - 2, top + r, 2, 1, pal['dark'])
    c.P(cx + lean * .1, top - 1, pal['dark'])
    ow, oh = w - 4, 5 + droop
    oy = top + 4 + droop; ox = cx + lean * .5
    for r in range(oh):                                                   # an arch, deeper at the top
        inset = 2 if r == 0 else (1 if r in (1, oh - 1) else 0)
        c.B(ox - ow / 2 + inset, oy + r, ow - 2 * inset, 1, pal['hoodIn'] if r < oh - 2 else '#1a1128')
    c.B(ox - ow / 2 + 1, oy - 1, ow - 2, 1, pal['deep'])
    my = oy + oh - 2
    for i, a in zip(range(-1, 2), (.4, .5, .4)): c.P(ox + i, my, pal['mouth'], a)
    c.P(ox - 2, my - 1, pal['mouth'], .2); c.P(ox + 2, my - 1, pal['mouth'], .2)
    return oy

def hem(cx, gy, half, n=6, lean=0):
    """A torn hem, right to left: points alternating on the floor and just above it."""
    return [(cx + lean + half - 2 * half * i / n, gy - (0 if i % 2 == 0 else 2 + (i % 3))) for i in range(n + 1)]

def robe(c, cx, top, gy, sh=5, hip=7, foot=9, lean=0, pal=P1):
    """The slim robe: shoulders `sh` either side, hips `hip`, the hem `foot`; lean pushes the top forward."""
    pts = [(cx - sh + lean, top), (cx + sh + lean, top), (cx + hip + lean * .4, top + 14)] + hem(cx, gy, foot) + [(cx - hip + lean * .4, top + 14)]
    m = cloth(c, pts, pal)
    band(c, m, (cx - 2, gy - 2), (cx - 3 + lean, top), 0, 1, pal['sheen'], .55)          # a dull sheen: less than Phase 2
    band(c, m, (cx + 2 + lean, top + 2), (cx + 3, gy - 2), 0, 1, pal['deep'], .5)
    c.B(cx - foot + 2, gy + 1, 2 * foot - 2, 1, (6, 3, 14), .35)
    return m

def sleeve(c, a, b, w=3, pal=P1):
    """A narrow sleeve, shoulder to wrist."""
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1; n = (-dy / L, dx / L)
    pts = [(a[0] + n[0] * w / 2, a[1] + n[1] * w / 2), (b[0] + n[0] * (w / 2 + .5), b[1] + n[1] * (w / 2 + .5)),
           (b[0] - n[0] * (w / 2 + .5), b[1] - n[1] * (w / 2 + .5)), (a[0] - n[0] * w / 2, a[1] - n[1] * w / 2)]
    return cloth(c, pts, pal)

# ── A: THE PENITENT — head bowed, gloves clasped at his chest, a chain from each wrist pooled at his feet ──
def p1_penitent(c, gy, cx=64):
    top = gy - 34
    robe(c, cx, top + 10, gy)
    sleeve(c, (cx - 5, top + 12), (cx - 2, top + 19)); sleeve(c, (cx + 5, top + 12), (cx + 2, top + 19))
    glove(c, cx - 3, top + 18, 3, 3); glove(c, cx, top + 18, 3, 3); c.P(cx, top + 19, C1['deep'])
    shackle(c, cx - 4, top + 17, 3); shackle(c, cx + 4, top + 17, 3)
    chain(c, [(cx - 4, top + 21), (cx - 7, top + 27), (cx - 9, gy - 2), (cx - 14, gy - 1), (cx - 19, gy - 1)])
    chain(c, [(cx + 4, top + 21), (cx + 6, top + 26), (cx + 9, gy - 2), (cx + 13, gy - 1), (cx + 18, gy - 1)])
    hood(c, cx, top, droop=1)
    c.glow(cx, top + 8, 14, (120, 70, 190), .10)

# ── B: THE KEEPER — one arm up, the chain whipped in a loop over his head; a narrow mantle ──
def p1_keeper(c, gy, cx=64):
    top = gy - 35
    robe(c, cx, top + 10, gy, foot=10)
    m = cloth(c, [(cx - 6, top + 10), (cx + 6, top + 10), (cx + 8, top + 15), (cx + 4, top + 17), (cx, top + 15), (cx - 4, top + 17), (cx - 8, top + 15)],
              dict(P1, cloak=C1['lit'], lit='#a78ae0'))                  # the mantle, over the shoulders
    sleeve(c, (cx + 5, top + 12), (cx + 10, top + 4)); glove(c, cx + 9, top + 1, 3, 3); shackle(c, cx + 10, top + 4, 3)
    loop = [(cx + 10, top + 1)] + [(cx + 1 + 11 * math.cos(a), top - 6 + 7 * math.sin(a)) for a in [i * 0.35 for i in range(-1, 19)]]
    chain(c, loop, glint=5)
    chain(c, [(cx + 10, top + 3), (cx + 16, top + 10), (cx + 18, top + 18), (cx + 14, top + 22)], glint=3)
    sleeve(c, (cx - 5, top + 12), (cx - 7, top + 20)); glove(c, cx - 9, top + 20, 3, 3); shackle(c, cx - 8, top + 18, 3)
    chain(c, [(cx - 8, top + 23), (cx - 11, top + 28), (cx - 12, gy - 1), (cx - 18, gy - 1)])
    hood(c, cx, top)
    c.glow(cx + 1, top - 6, 18, (140, 160, 230), .10)

# ── C: THE DRIFTER — stooped, the hood pushed forward, chains wrapped across him, a broken shackle swinging ──
def p1_drifter(c, gy, cx=64):
    top = gy - 32
    for i in range(12): c.B(cx + 7 + i, gy - 1 + (i // 5), 1, 2, C1['dark'])               # the train
    robe(c, cx, top + 9, gy, sh=5, hip=7, foot=10, lean=-3)
    chain(c, [(cx - 8, top + 12), (cx + 7, top + 22)], glint=6)
    chain(c, [(cx + 5, top + 12), (cx - 7, top + 24)], glint=7)
    sleeve(c, (cx - 7, top + 12), (cx - 10, top + 20)); glove(c, cx - 12, top + 19, 3, 3); shackle(c, cx - 11, top + 17, 3)
    sleeve(c, (cx + 2, top + 12), (cx + 8, top + 19)); glove(c, cx + 8, top + 19, 3, 3); shackle(c, cx + 9, top + 17, 3)
    chain(c, [(cx + 10, top + 22), (cx + 12, top + 26), (cx + 13, top + 30)], glint=2)
    c.B(cx + 11, top + 30, 5, 4, C1['chain']); c.B(cx + 12, top + 31, 3, 2, C1['hoodIn']); c.B(cx + 11, top + 30, 5, 1, C1['chainLit'])
    c.P(cx + 15, top + 33, C1['glint']); c.glow(cx + 15.5, top + 33.5, 3, (230, 240, 255), .3)
    hood(c, cx - 4, top - 1, droop=2, lean=-2)
    c.glow(cx - 4, top + 8, 14, (90, 50, 150), .12)
