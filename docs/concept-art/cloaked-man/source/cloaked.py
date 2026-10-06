"""The Cloaked Man — concept sprites in the Fable v4 respec style. Phase 1 (cloaked, chained, gloved)."""
import math
from px import Canvas, hx, hero, ground, FRACTURED_SKY

# ── Palette: a purple cloak on the game's night ramp ──────────────────────────
C1 = dict(cloak='#5b3a8c', lit='#8a63c7', dark='#34205a', deep='#1f1236', hoodIn='#0e0918', mouth='#8c7aa6',
          glove='#40364a', gloveLit='#7a6c8c', chain='#848b9b', chainLit='#d6deeb', glint='#ffffff', bone='#e6dcc6', boneDark='#8f8672')

def chain(c, pts, glint=4, col=None, lit=None, sparkle=True):
    """Links every 2 px along a polyline, alternating orientation; a lit pixel on each, a glint every few."""
    col = col or C1['chain']; lit = lit or C1['chainLit']
    seg = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / 2))
        for i in range(n): seg.append((x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n))
    seg.append(pts[-1])
    for k, (x, y) in enumerate(seg):
        if k % 2 == 0: c.B(x - 1, y, 2, 1, col); c.P(x - 1, y, lit)
        else: c.B(x, y - 1, 1, 2, col); c.P(x, y - 1, lit)
        if sparkle and k % glint == glint // 2:
            c.P(x, y, C1['glint']); c.glow(x + .5, y + .5, 3, (220, 235, 255), .35)

def shackle(c, x, y, w=5):
    """A cuff round the wrist: iron band, lit rim, one bright glint."""
    c.B(x - w // 2, y, w, 3, C1['chain']); c.B(x - w // 2, y, w, 1, C1['chainLit']); c.P(x + w // 2 - 1, y + 1, C1['glint'])
    c.glow(x + w // 2 - .5, y + 1.5, 3, (230, 240, 255), .22)

def glove(c, x, y, w=3, h=3):
    c.B(x, y, w, h, C1['glove']); c.B(x, y, w, 1, C1['gloveLit']); c.P(x + w - 1, y + h - 1, '#1a1520')

def hood(c, cx, top, w=12, h=11, droop=0, pal=C1):
    """Peaked hood; the face is only shadow — no eyes — and a faded mouth low in it."""
    c.P(cx, top, pal['dark'])
    for r in range(h):
        ww = min(w, 4 + r * 2) if r < 4 else w - (1 if r == h - 1 else 0)
        x = cx - ww / 2
        c.B(x, top + 1 + r, ww, 1, pal['cloak'])
        c.P(x, top + 1 + r, pal['lit'])                                  # lit edge, like the hero's hood rim
        c.B(x + ww - 2, top + 1 + r, 2, 1, pal['dark'])
    # the opening: deep shadow, deeper with the droop
    ow, oh = w - 5, 5 + droop
    oy = top + 4 + droop
    for r in range(oh):                                                   # an arch, deeper at the top
        inset = 2 if r == 0 else (1 if r in (1, oh - 1) else 0)
        c.B(cx - ow / 2 + inset, oy + r, ow - 2 * inset, 1, pal['hoodIn'] if r < oh - 2 else '#1a1128')
    c.B(cx - ow / 2 + 1, oy - 1, ow - 2, 1, pal['deep'])                  # the brim's own shadow
    # a faded mouth: thin, pale, half there, the corners barely turned
    my = oy + oh - 2
    for i, a in zip(range(-2, 2), (.38, .5, .5, .38)): c.P(cx + i, my, pal['mouth'], a)
    c.P(cx - 3, my - 1, pal['mouth'], .2); c.P(cx + 2, my - 1, pal['mouth'], .2)
    return oy

def robe(c, cx, top, bottom, w0, w1, pal=C1, folds=2, ragged=True, lean=0):
    """Cloak body: widening rows, a lit edge, a dark far side, fold lines, a torn hem."""
    for y in range(top, bottom):
        f = (y - top) / max(1, bottom - top - 1); ww = w0 + (w1 - w0) * f
        x = cx - ww / 2 + lean * f
        c.B(x, y, ww, 1, pal['cloak']); c.P(x, y, pal['lit']); c.B(x + ww - 3, y, 3, 1, pal['dark'])
        for k in range(1, folds + 1):
            fx = x + ww * k / (folds + 1)
            c.P(fx, y, pal['dark'] if (y + k) % 7 else pal['deep'])
            if k == 1 and f > .2: c.P(fx - 1, y, pal['lit'], .45)
    if ragged:
        ww = w1; x = cx - ww / 2 + lean
        for i in range(int(ww)):
            if (i * 7 + 3) % 5 < 2: c.P(x + i, bottom, pal['dark'])
            if (i * 11) % 7 == 0: c.P(x + i, bottom + 1, pal['deep'])
    c.B(cx - w1 / 2 + lean + 2, bottom + 1, w1 - 2, 2, (6, 3, 14), .35)  # its shadow on the ground

def tile(draw, label_text, w=120, h=96, gy=80, hero_x=None):
    c = Canvas(w, h); c.sky(FRACTURED_SKY, 0, gy)
    # far silhouettes, as the Fractured backdrop draws them
    for i, x in enumerate(range(-10, w, 26)):
        hh = 14 + (i * 13) % 17
        c.B(x, gy - hh, 16, hh, '#0d0a16')
    ground(c, gy)
    if hero_x is not None: hero(c, hero_x, gy - 22, 1)
    draw(c, gy)
    return c

# ── PHASE 1 ───────────────────────────────────────────────────────────────────
def p1_penitent(c, gy, cx=72):
    """Head bowed, hands clasped at the chest; a chain from each wrist to the floor, pooled in coils."""
    top = gy - 32
    robe(c, cx, top + 10, gy - 1, 12, 20, folds=2)
    hood(c, cx, top, w=12, h=11, droop=1)
    # sleeves meet at the chest; gloves clasped
    c.B(cx - 7, top + 13, 3, 7, C1['dark']); c.B(cx + 4, top + 13, 3, 7, C1['dark'])
    glove(c, cx - 4, top + 19, 4, 3); glove(c, cx + 1, top + 19, 4, 3); c.P(cx, top + 20, C1['deep'])
    shackle(c, cx - 5, top + 17, 3); shackle(c, cx + 6, top + 17, 3)
    chain(c, [(cx - 4, top + 21), (cx - 7, top + 27), (cx - 9, gy - 2), (cx - 14, gy - 1), (cx - 20, gy - 1)])
    chain(c, [(cx + 4, top + 21), (cx + 6, top + 26), (cx + 9, gy - 2), (cx + 13, gy - 1), (cx + 16, gy - 2), (cx + 19, gy - 1)])
    c.glow(cx, top + 8, 16, (120, 70, 190), .10)

def p1_keeper(c, gy, cx=74):
    """One arm raised, the chain whipped in a loop overhead; a shoulder mantle; a torn, uneven hem."""
    top = gy - 33
    robe(c, cx, top + 10, gy - 1, 13, 21, folds=3, lean=-1)
    # the mantle: a short cape over the shoulders, lighter
    for r in range(6):
        ww = 16 - abs(r - 2); x = cx - ww / 2
        c.B(x, top + 10 + r, ww, 1, C1['lit'] if r == 0 else C1['cloak']); c.P(x, top + 10 + r, '#a78ae0')
    for i in range(0, 16, 3): c.P(cx - 8 + i, top + 16, C1['deep'])
    hood(c, cx, top, w=12, h=11, droop=0)
    # raised right arm: sleeve up and out, glove gripping the chain
    c.limb(cx + 5, top + 12, cx + 10, top + 4, 3, C1['dark']); c.limb(cx + 5, top + 12, cx + 9, top + 5, 1, C1['cloak'])
    glove(c, cx + 9, top + 1, 3, 3); shackle(c, cx + 10, top + 4, 4)
    # the whip loop over the head, and down to the other hand
    loop = [(cx + 10, top + 1)] + [(cx + 1 + 11 * math.cos(a), top - 6 + 7 * math.sin(a)) for a in [i * 0.35 for i in range(-1, 19)]]
    chain(c, loop, glint=5)
    chain(c, [(cx + 10, top + 3), (cx + 16, top + 10), (cx + 18, top + 18), (cx + 14, top + 22)], glint=3)
    # low left hand, slack chain to the floor
    c.B(cx - 8, top + 14, 3, 6, C1['dark']); glove(c, cx - 9, top + 19, 3, 3); shackle(c, cx - 8, top + 17, 4)
    chain(c, [(cx - 8, top + 22), (cx - 11, top + 28), (cx - 12, gy - 1), (cx - 18, gy - 1)])
    c.glow(cx + 1, top - 6, 18, (140, 160, 230), .10)

def p1_drifter(c, gy, cx=72):
    """Hunched, the hood hanging forward like a beak; chains wrapped across the body; only the gloves show,
    at the cloak's edges, holding the ends; a broken shackle swinging."""
    top = gy - 30
    # a wide, hunched body: shoulders high and broad, the hem tattered and dragging
    robe(c, cx - 1, top + 9, gy - 1, 19, 22, folds=3, lean=1)
    for i in range(10): c.B(cx + 9 + i, gy - 2 + (i // 4), 1, 2, C1['dark'])            # the train
    # the hood thrust forward (facing left): offset, drooping, long
    hood(c, cx - 3, top - 1, w=13, h=12, droop=2)
    c.B(cx - 11, top + 7, 3, 3, C1['cloak']); c.P(cx - 11, top + 7, C1['lit']); c.P(cx - 12, top + 9, C1['dark'])   # the beak-tip of the hood
    # chains wrapped across the body, shoulder to hip, crossing
    chain(c, [(cx - 9, top + 12), (cx + 9, top + 22)], glint=6)
    chain(c, [(cx + 8, top + 13), (cx - 8, top + 25)], glint=7)
    # the gloves at the cloak's edges, holding the ends
    glove(c, cx - 12, top + 19, 3, 3); glove(c, cx + 10, top + 20, 3, 3)
    shackle(c, cx - 11, top + 17, 4); shackle(c, cx + 11, top + 18, 4)
    # the broken shackle, swinging from the right glove on a few links
    chain(c, [(cx + 12, top + 23), (cx + 14, top + 27), (cx + 15, top + 31)], glint=2)
    c.B(cx + 13, top + 31, 6, 4, C1['chain']); c.B(cx + 14, top + 32, 4, 2, C1['hoodIn']); c.B(cx + 13, top + 31, 6, 1, C1['chainLit'])
    c.P(cx + 18, top + 34, C1['glint']); c.glow(cx + 18.5, top + 34.5, 4, (230, 240, 255), .45)
    c.glow(cx - 3, top + 8, 14, (90, 50, 150), .12)

if __name__ == '__main__':
    import sys
    out = sys.argv[1]
    for name, fn in [('p1-a-penitent', p1_penitent), ('p1-b-keeper', p1_keeper), ('p1-c-drifter', p1_drifter)]:
        t = tile(fn, name, hero_x=24); t.image(6).save(f'{out}/{name}.png')
    print('ok')
