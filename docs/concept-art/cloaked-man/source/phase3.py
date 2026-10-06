"""The Cloaked Man, Phase 3: a spider-like skeleton ~5x the knight. A massive skull, blank eyes, an odd
(iridescent) shine; legs that end in hands with long, skinny fingers; a jaw that opens very long."""
import math
import numpy as np
from cloaked import C1, chain

NEAR = dict(bone='#e9dfc9', lit='#fff8e8', dark='#a89d86', deep='#6f6656')
FAR = dict(bone='#8f869c', lit='#b3a9bf', dark='#655d72', deep='#433c50')          # the far legs, in the dusk
VOID = '#110818'
SHINE = ['#8ff5e6', '#9fc4ff', '#c7a2ff', '#ff9fd8', '#ffe0a0']                     # oil on bone

def shade(c, m, pal, far=1): return c.shade(m, pal['bone'], pal['lit'], pal['dark'], pal['deep'], far)

def bone(c, a, b, r0, r1, pal=NEAR):
    return shade(c, c.mask_thick([a, b], r0, r1), pal)

def knob(c, p, r, pal=NEAR):
    shade(c, c.mask_ellipse(p[0], p[1], r, r * .9), pal)

def finger(c, x, y, a, L, curl, pal, floor=None):
    """Three phalanges, 1 px wide, knuckles darker; the tip lit. Curls by `curl` a joint; stops at the floor."""
    pts = [(x, y)]
    for k, l in enumerate((L * .42, L * .34, L * .24)):
        a += curl if k else 0
        nx, ny = pts[-1][0] + math.cos(a) * l, pts[-1][1] + math.sin(a) * l
        if floor is not None: ny = min(ny, floor)
        pts.append((nx, ny))
    for (ax, ay), (bx, by) in zip(pts, pts[1:]): c.limb(ax, ay, bx, by, 1, pal['bone'])
    for p in pts[1:-1]: c.P(p[0], p[1], pal['deep'])
    c.P(pts[-1][0], pts[-1][1], pal['lit'])

def hand(c, x, y, a, L=15, n=4, spread=.26, curl=.18, pal=NEAR, floor=None):
    """Knuckles, then long skinny fingers fanned about the angle a, plus a thumb."""
    for i in range(n):
        fa = a + (i - (n - 1) / 2) * spread
        finger(c, x + math.cos(fa) * 2, y + math.sin(fa) * 2, fa, L * (1 - abs(i - 1.2) * .08), curl, pal, floor)
    finger(c, x, y, a - (n / 2 + .9) * spread, L * .5, curl, pal, floor)
    shade(c, c.mask_ellipse(x, y, 2.6, 2.2), pal)

def planted(c, x, y, out, gy, L=15, pal=NEAR):
    """Long fingers arched like a spider's legs, each set down on its tip; one reaches back."""
    for reach, lift in ((-.38, 3), (.42, 4), (.72, 6), (1.0, 5)):
        sg = 1 if reach > 0 else -1
        tx = x + out * L * reach; ax = x + out * L * reach * .45; ay = y - lift
        pts = [(x + out * sg, y), (ax, ay), (tx - out * 1.5 * sg, ay + 1.5), (tx, gy - 1)]
        for (a0, b0), (a1, b1) in zip(pts, pts[1:]): c.limb(a0, b0, a1, b1, 1, pal['bone'])
        c.P(ax, ay, pal['lit']); c.P(pts[2][0], pts[2][1], pal['deep']); c.P(tx, gy - 1, pal['dark'])
    shade(c, c.mask_ellipse(x, y, 2.6, 2.2), pal)

def leg(c, pts, pal=NEAR, r=2.4, hand_a=None, L=15, gy=None, **hk):
    """A long leg-arm: bones tapering from r, knobbed joints, and a hand of long fingers at the end."""
    n = len(pts) - 1
    for i, (a, b) in enumerate(zip(pts, pts[1:])):
        f0, f1 = max(.6, 1 - .18 * i), max(.6, 1 - .18 * (i + 1))
        bone(c, a, b, r * f0, r * f1 * .9, pal)
    for i, p in enumerate(pts[1:-1]): knob(c, p, r * max(.6, 1 - .18 * (i + 1)) + .9, pal)
    x, y = pts[-1]
    if hand_a is None:                                           # set down on the floor: fingers arched, on their tips
        planted(c, x, y, -1 if pts[-2][0] > x else 1, gy, L, pal)
    else:
        hand(c, x, y, hand_a, L, pal=pal, **hk)

def iridescent(c, m, cx, cy, r0, r1, a0=-2.7, a1=-.4, alpha=.6):
    xx, yy = c.grid(); d = np.hypot(xx - cx, yy - cy); ang = np.arctan2(yy - cy, xx - cx)
    band = m & (d >= r0) & (d < r1) & (ang > a0) & (ang < a1)
    k = np.floor((ang - a0) / (a1 - a0) * len(SHINE) * 1.5).astype(int) % len(SHINE)
    for i, col in enumerate(SHINE): c.fill(band & (k == i), col, alpha)

def skull(c, sx, sy, R, jaw=0, ghost=None, gy=None, fangs=False, pal=NEAR, hinge=.66, chin=.34, eye=1.0):
    """A front-facing skull of half-width R. jaw: 0 shut; otherwise how far below the upper teeth the chin hangs.
    Every detail (teeth, rims, the crack) grows with R, so the same skull serves a sprite or a sky."""
    u = max(1.0, R / 21); U = lambda k: max(1, round(k * u))
    cran = c.mask_ellipse(sx, sy, R, R * .86)
    face = c.mask_poly([(sx - R * .84, sy + R * .2), (sx + R * .84, sy + R * .2), (sx + R * .62, sy + R * .98), (sx - R * .62, sy + R * .98)])
    ty = sy + R * .98                                                   # the upper teeth's edge
    if jaw == 0:
        mand = c.mask_poly([(sx - R * .64, ty - u), (sx + R * .64, ty - u), (sx + R * .52, ty + R * .3), (sx + R * .22, ty + R * .44),
                            (sx - R * .22, ty + R * .44), (sx - R * .52, ty + R * .3)])
        mouth = None
    else:
        hw, cw, cy = R * hinge, R * chin, ty + jaw                      # hinge half-width, chin half-width, chin y
        outer = c.mask_poly([(sx - hw - u, sy + R * .5), (sx + hw + u, sy + R * .5), (sx + cw + 3 * u, cy), (sx + cw - u, cy + 4 * u),
                             (sx - cw + u, cy + 4 * u), (sx - cw - 3 * u, cy)])
        mouth = c.mask_poly([(sx - hw + 3 * u, ty), (sx + hw - 3 * u, ty), (sx + cw - 2 * u, cy - 3 * u), (sx - cw + 2 * u, cy - 3 * u)])
        mand = outer & ~mouth
    if ghost is not None:
        c.fill(cran | face | mand, '#8a5cff', ghost); return
    shade(c, mand, pal, U(2))
    if mouth is not None:
        c.fill(mouth, VOID); xx, yy = c.grid()
        c.glow(sx, ty + jaw * .5, jaw * .5, (150, 80, 255), .45); c.fill(mouth & (yy > ty + jaw * .9), '#2a1245')
        for y in np.arange(ty + 5 * u, ty + jaw - 3 * u, 3 * u):        # teeth down the long jaw's inner edges
            f = (y - ty) / jaw; x0 = sx - (hw - 3 * u) + (hw - cw - u) * f; x1 = sx + (hw - 3 * u) - (hw - cw - u) * f
            c.B(x0, y, U(2), U(1), pal['bone']); c.P(x0 + 1, y, pal['lit']); c.B(x1 - U(2), y, U(2), U(1), pal['bone'])
        for x in np.arange(sx - cw + 2 * u, sx + cw - 2 * u, 2.5 * u):  # the chin's teeth, pointing up
            c.B(x, cy - 5 * u, U(2), U(3), pal['bone']); c.B(x, cy - 5 * u, U(2), U(.5), pal['lit'])
    shade(c, cran | face, pal, U(2))
    xx, yy = c.grid(); head = cran | face
    c.fill(head & ~c.mask_ellipse(sx - R * .22, sy - R * .12, R * 1.02, R * 1.05), pal['dark'], .55)            # its round
    c.fill(head & ~c.mask_ellipse(sx - R * .36, sy - R * .2, R * 1.12, R * 1.2), pal['deep'], .45)
    c.fill(head & (yy > sy + R * .72) & (np.abs(xx - sx) > R * .5), pal['dark'], .5)                                # cheek hollows
    iridescent(c, cran, sx - R * .08, sy + R * .08, R * .68, R * .76, alpha=.7)    # the odd shine: a thin oily arc
    iridescent(c, cran, sx - R * .08, sy + R * .08, R * .5, R * .54, a0=-2.4, a1=-1.1, alpha=.35)
    c.B(sx - R * .5, sy - R * .55, U(2), U(2), '#ffffff'); c.glow(sx - R * .5 + u, sy - R * .55 + u, 5 * u, (255, 255, 255), .35)
    k = [(sx + R * .15, sy - R * .86), (sx + R * .05, sy - R * .6), (sx + R * .22, sy - R * .45), (sx + R * .12, sy - R * .22)]
    for (ax, ay), (bx, by) in zip(k, k[1:]): c.limb(ax, ay, bx, by, U(1), '#3a1d5c')                            # a crack, violet light in it
    c.glow(sx + R * .15, sy - R * .5, 6 * u, (140, 80, 255), .25)
    for sgn in (-1, 1):                                                 # sockets, and in them blank eyes
        ex, ey = sx + sgn * R * .38, sy + R * .2
        c.fill(c.mask_ellipse(ex, ey - R * .2, R * .34, R * .08) & head, pal['dark'], .7)      # under the brow
        c.fill(c.mask_ellipse(ex, ey, R * .29, R * .25), VOID)
        c.glow(ex, ey, R * .45, (170, 120, 255), .35 * eye)
        c.fill(c.mask_ellipse(ex, ey + .5, R * .17, R * .14), '#efe6ff')
        c.fill(c.mask_ellipse(ex - R * .05, ey - R * .03, R * .07, R * .06), '#ffffff')
    c.fill(c.mask_poly([(sx, sy + R * .44), (sx - R * .13, sy + R * .72), (sx, sy + R * .66), (sx + R * .13, sy + R * .72)]), VOID)
    for x in np.arange(sx - R * .56, sx + R * .56, (2.2 if R < 18 else 2.6) * u):   # the upper teeth
        L = U(4) if (fangs and abs(x - sx) > R * .3 and abs(x - sx) < R * .42) else U(2)
        c.B(x, ty - 2 * u, U(2), L, pal['bone']); c.B(x, ty - 2 * u, U(2), U(.5), pal['lit']); c.B(x + U(2) - U(.5), ty - 2 * u, U(.5), L, pal['deep'])
    if jaw == 0:
        for x in np.arange(sx - R * .5, sx + R * .5, 2.4 * u): c.B(x, ty, U(1), U(1), VOID)

def cage(c, cx, cy, rx, ry, pal=NEAR, heart=True):
    """The ribcage it carries behind the skull like a spider's body: ribs bowed round a hollow; an ember inside."""
    inside = c.mask_ellipse(cx, cy, rx, ry)
    c.fill(inside, '#150b22', .8)
    if heart: c.glow(cx, cy + 2, rx * .8, (140, 70, 230), .35); c.glow(cx, cy + 2, 4, (230, 200, 255), .6)
    for i, f in enumerate(np.linspace(-.8, .8, 6)):
        x = cx + rx * f; h = ry * math.sqrt(1 - f * f)
        pts = [(x + rx * .12 * (1 - abs(f)), cy - h), (x - rx * .15, cy), (x + rx * .05, cy + h * .9)]
        shade(c, c.mask_thick(pts, max(1.1, rx / 20), max(.7, rx / 32)), pal, max(1, round(rx / 22)))

def spine(c, pts, pal=NEAR, r=2.2):
    """Vertebrae every few pixels along a curve, each with a spur."""
    seg = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(bx - ax, by - ay) / 3.2))
        seg += [(ax + (bx - ax) * i / n, ay + (by - ay) * i / n) for i in range(n)]
    for i, (x, y) in enumerate(seg):
        rr = r * (1 - .5 * i / len(seg))
        shade(c, c.mask_ellipse(x, y, rr + .4, rr), pal); c.P(x, y - rr - 1, pal['dark'])

def rag(c, pts):
    """What's left of the purple cloak."""
    return c.shade(c.mask_poly(pts), C1['cloak'], C1['lit'], C1['dark'], C1['deep'])

def shackle_on(c, x, y):
    c.B(x - 3, y, 6, 3, '#848b9b'); c.B(x - 3, y, 6, 1, '#d6deeb'); c.P(x + 2, y + 1, '#ffffff'); c.glow(x + 2.5, y + 1.5, 3, (230, 240, 255), .25)

def floor_shadow(c, x0, x1, gy):
    c.B(x0, gy + 1, x1 - x0, 2, (6, 3, 14), .35)

# ── A: THE CROUCH — at rest, legs arched high over the body like a spider's, jaw shut, watching ──
def p3_crouch(c, gy):
    floor_shadow(c, 60, 245, gy)
    for pts in ([(148, gy - 62), (126, gy - 116), (72, gy - 5)], [(163, gy - 64), (172, gy - 122), (204, gy - 5)], [(178, gy - 60), (220, gy - 104), (248, gy - 5)]):
        leg(c, pts, FAR, 2.1, gy=gy, L=14)
    cage(c, 166, gy - 58, 26, 17)
    rag(c, [(146, gy - 76), (170, gy - 80), (192, gy - 72), (198, gy - 58), (192, gy - 54), (194, gy - 44), (186, gy - 50), (182, gy - 40),
            (176, gy - 50), (170, gy - 42), (166, gy - 54), (158, gy - 52), (150, gy - 62)])
    spine(c, [(118, gy - 50), (134, gy - 66), (152, gy - 77), (172, gy - 79), (192, gy - 72), (206, gy - 58), (212, gy - 46), (208, gy - 38)])
    chain(c, [(206, gy - 56), (214, gy - 44), (216, gy - 30), (213, gy - 18)], glint=4)
    shackle_on(c, 213, gy - 18)
    leg(c, [(176, gy - 48), (208, gy - 94), (232, gy - 4)], gy=gy)
    leg(c, [(160, gy - 46), (150, gy - 106), (164, gy - 4)], gy=gy)
    leg(c, [(142, gy - 50), (110, gy - 98), (50, gy - 4)], gy=gy)
    shackle_on(c, 70, gy - 34)
    skull(c, 104, gy - 36, 21)

# ── B: THE LUNGE — first the wind-up, legs wrung round its own body; then it throws itself at you, hands first ──
def p3_windup(c, gy):
    floor_shadow(c, 60, 236, gy)
    c.glow(108, gy - 26, 30, (140, 80, 255), .18)
    leg(c, [(142, gy - 46), (124, gy - 66), (148, gy - 82), (180, gy - 74), (194, gy - 50), (214, gy - 5)], FAR, 2.2, gy=gy, L=13)
    leg(c, [(160, gy - 46), (180, gy - 66), (156, gy - 84), (124, gy - 76), (100, gy - 58), (78, gy - 5)], FAR, 2.2, gy=gy, L=13)
    cage(c, 152, gy - 38, 22, 14)
    rag(c, [(132, gy - 50), (156, gy - 54), (178, gy - 48), (186, gy - 36), (180, gy - 34), (182, gy - 24), (174, gy - 30), (170, gy - 20),
            (164, gy - 30), (156, gy - 22), (150, gy - 34), (138, gy - 38)])
    spine(c, [(120, gy - 40), (136, gy - 50), (154, gy - 54), (172, gy - 50), (186, gy - 42), (190, gy - 30)])
    leg(c, [(126, gy - 36), (86, gy - 44), (72, gy - 5)], r=2.2, gy=gy)
    leg(c, [(146, gy - 28), (176, gy - 22), (186, gy - 46), (160, gy - 64), (132, gy - 58), (122, gy - 74), (96, gy - 5)], r=2.4, gy=gy, L=14)
    leg(c, [(160, gy - 28), (134, gy - 20), (130, gy - 46), (154, gy - 66), (184, gy - 60), (196, gy - 76), (228, gy - 5)], r=2.4, gy=gy, L=14)
    skull(c, 108, gy - 30, 19, eye=1.8)
    for x0, y0, x1, y1 in ((118, gy - 92, 122, gy - 98), (186, gy - 90, 191, gy - 95), (200, gy - 58, 206, gy - 60), (98, gy - 66, 93, gy - 70)):
        c.limb(x0, y0, x1, y1, 1, '#b99cff')                           # strain

def p3_lunge(c, gy):
    c.B(40, gy + 1, 190, 2, (6, 3, 14), .25)
    for k, a in ((2, .12), (1, .22)):                                  # where the skull just was
        skull(c, 82 + 28 * k, gy - 50 - 6 * k, 20, jaw=0, ghost=a)
    for y, x0, x1 in ((gy - 92, 150, 210), (gy - 76, 120, 236), (gy - 44, 128, 230), (gy - 28, 150, 220), (gy - 60, 196, 250)):
        c.B(x0, y, x1 - x0, 1, (138, 92, 255), .4)
    leg(c, [(156, gy - 68), (190, gy - 92), (232, gy - 86)], FAR, 2.0, hand_a=.15, L=13)
    leg(c, [(160, gy - 58), (196, gy - 50), (236, gy - 58)], FAR, 2.0, hand_a=-.1, L=13)
    cage(c, 148, gy - 62, 22, 14)
    rag(c, [(128, gy - 76), (152, gy - 80), (172, gy - 76), (192, gy - 74), (204, gy - 70), (190, gy - 66), (196, gy - 58),
            (182, gy - 62), (176, gy - 52), (168, gy - 60), (158, gy - 52), (150, gy - 64), (136, gy - 64)])
    spine(c, [(96, gy - 62), (118, gy - 70), (140, gy - 76), (164, gy - 74), (184, gy - 68), (198, gy - 60), (204, gy - 50)])
    leg(c, [(150, gy - 54), (186, gy - 34), (228, gy - 22)], r=2.3, hand_a=.35, L=14)
    leg(c, [(164, gy - 66), (200, gy - 80), (240, gy - 76)], r=2.2, hand_a=-.2, L=12)
    leg(c, [(124, gy - 60), (104, gy - 90), (58, gy - 76)], r=2.3, hand_a=math.pi + .1, L=19, spread=.2, curl=.12)
    leg(c, [(126, gy - 50), (106, gy - 26), (56, gy - 38)], r=2.3, hand_a=math.pi - .12, L=19, spread=.2, curl=-.12)
    skull(c, 82, gy - 50, 20, jaw=7)

# ── C: THE UNHINGED — reared up, the jaw dropped open, far too long: a mouth to the floor ──
def p3_unhinged(c, gy):
    floor_shadow(c, 30, 250, gy)
    for pts in ([(140, gy - 94), (112, gy - 126), (66, gy - 5)], [(160, gy - 96), (184, gy - 128), (222, gy - 5)]):
        leg(c, pts, FAR, 2.1, gy=gy, L=14)
    cage(c, 150, gy - 88, 24, 16)
    rag(c, [(128, gy - 104), (150, gy - 108), (174, gy - 100), (180, gy - 86), (174, gy - 82), (176, gy - 72), (168, gy - 78),
            (164, gy - 68), (158, gy - 78), (150, gy - 70), (146, gy - 82), (132, gy - 88)])
    spine(c, [(124, gy - 88), (136, gy - 100), (156, gy - 106), (176, gy - 100), (190, gy - 88), (196, gy - 74), (192, gy - 64)])
    chain(c, [(190, gy - 86), (200, gy - 70), (202, gy - 52), (198, gy - 40)], glint=4)
    leg(c, [(170, gy - 80), (214, gy - 112), (246, gy - 4)], gy=gy)
    leg(c, [(132, gy - 80), (80, gy - 110), (32, gy - 4)], gy=gy)
    leg(c, [(162, gy - 74), (184, gy - 46), (170, gy - 4)], r=2.2, gy=gy)          # braced beside the jaw
    leg(c, [(128, gy - 74), (78, gy - 58), (74, gy - 4)], r=2.2, gy=gy)
    shackle_on(c, 78, gy - 30)
    skull(c, 112, gy - 80, 23, jaw=int(gy - 4 - (gy - 80 + 23 * .98)), fangs=True)
