"""The Cloaked Man, Phase 4: too big for the stage. The Phase 3 creature as a background, reaching into the
arena: behind it (hands on the rim), under it (the arena is its palm), around it (you fight inside its mouth)."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from px import Canvas, hero, STONE, FRACTURED_SKY
from phase3 import skull, leg, cage, spine, shade, bone, knob, NEAR, VOID
from cloaked import C1

W, H = 320, 180
GIANT = dict(bone='#a397ae', lit='#cdc1d6', dark='#6d6384', deep='#473f5c')      # in the sky, a step back in the dusk
DISTANT = dict(bone='#5f5670', lit='#786e8a', dark='#433b54', deep='#2d2740')    # its far legs, further still

def ledge(c, x, y, w, h=9):
    """A slab of the Fractured stone, as the arena draws it: cap, lit line, seams, a violet fleck, a dark underside."""
    c.B(x, y, w, h, STONE['dark']); c.B(x, y, w, 3, STONE['stone']); c.B(x, y, w, 1, STONE['lit'])
    for sx in range(int(x) + 6, int(x + w) - 2, 17): c.B(sx, y + 4, 1, h - 5, STONE['line'])
    c.P(x + w * .6, y + 2, '#8a5cd8')
    for i in range(0, int(w), 3): c.B(x + i, y + h, 2, 1 + (i * 7) % 3, STONE['dark'])       # the broken underside

def big_finger(c, pts, r0, r1, pal=NEAR):
    """A long, skinny finger at the giant's scale: phalanges swept by a tapering disc, knobbed knuckles."""
    n = len(pts) - 1
    for i, (a, b) in enumerate(zip(pts, pts[1:])):
        bone(c, a, b, r0 + (r1 - r0) * i / n, r0 + (r1 - r0) * (i + 1) / n, pal)
    for i, p in enumerate(pts[1:-1]): knob(c, p, r0 + (r1 - r0) * (i + 1) / n + .8, pal)
    c.P(pts[-1][0], pts[-1][1], pal['lit'])

def stars(c, seed=4):
    rng = np.random.default_rng(seed)
    for _ in range(40):
        x, y = rng.integers(0, W), rng.integers(0, 90)
        c.P(x, y, '#d8c4ff', .25 + .5 * rng.random())

def haze(c, y0, y1, a=.18):
    """The dusk in front of the giant, thickest low down, the way the Fractured sky's last band sits on the horizon."""
    for y in range(y0, y1):
        c.B(0, y, W, 1, '#4a1c2a', a * (y - y0) / max(1, y1 - y0))

# ── A: THE HORIZON — it rises behind the arena's rim; its fingers are draped over the platform ──
def p4_horizon(c):
    stars(c)
    for pts in ([(128, 96), (70, 16), (-8, 150)], [(142, 86), (112, 2), (40, 200)], [(200, 86), (228, 2), (300, 200)], [(214, 96), (270, 18), (330, 150)]):
        leg(c, pts, DISTANT, 6, hand_a=math.pi / 2)
    cage(c, 170, 70, 52, 30, DISTANT, heart=False)
    skull(c, 170, 92, 60, pal=GIANT, eye=1.4)
    haze(c, 100, 160, .35)
    c.B(0, 146, W, H - 146, '#0a0712')                                  # the abyss below the rim
    ledge(c, 34, 146, 252, 30)
    ledge(c, 86, 108, 40); ledge(c, 196, 100, 40)
    for side in (-1, 1):                                                # its hands on the rim, fingers across the floor
        wx = 26 if side < 0 else 294
        for o in (-2.5, 2.5): bone(c, (wx - side * 18 + o, 184), (wx + o, 150), 4.2, 3.4)
        knob(c, (wx, 148), 4.6)
        for i in range(4):
            k = (wx + side * 2, 145 - i * .5)
            reach = 16 + 9 * i
            big_finger(c, [k, (wx + side * reach * .35, 132 - i * 2), (wx + side * reach * .75, 138 - i), (wx + side * reach, 145)], 1.8, 1.1)
        big_finger(c, [(wx - side * 1, 146), (wx - side * 6, 136), (wx - side * 10, 141)], 1.6, 1.1)
    hero(c, 144, 124, 1)
    c.glow(160, 146, 40, (140, 80, 230), .06)

# ── B: THE CRADLE — the arena is its palm; the fingers are the far wall, the thumb a ramp; the jaw hangs open ──
def p4_cradle(c):
    stars(c, 9)
    for pts in ([(250, 60), (286, -6), (330, 70)], [(226, 66), (190, -8), (150, 40)], [(262, 76), (318, 40), (340, 120)]):
        leg(c, pts, DISTANT, 5.5, hand_a=0)
    cage(c, 244, 64, 46, 28, DISTANT)
    spine(c, [(120, 56), (160, 40), (200, 38), (240, 40), (280, 52), (300, 70)], DISTANT, 4)
    skull(c, 84, 52, 44, jaw=96, pal=GIANT, fangs=True, eye=1.4)
    haze(c, 70, 180, .3)
    # the forearm, out of the dark below
    for o in (-3, 3): bone(c, (50 + o, 196), (104 + o, 152), 5.2, 4.2)
    for x, y in ((104, 148), (110, 142), (100, 142), (108, 154)): knob(c, (x, y), 4)          # carpals
    # the palm: metacarpals laid side by side, their upper edge the floor
    for k, y in enumerate((156, 150, 144, 138)):
        bone(c, (112, y + 2), (250, y), 3.6 - .2 * k, 3.8 - .2 * k, NEAR)
        knob(c, (252, y), 4.6 - .3 * k)
    # the thumb, a ramp on the left; the fingers, curling up into the far wall and an overhang
    big_finger(c, [(106, 136), (94, 118), (98, 100), (110, 92)], 2.6, 1.6)
    for k, (pts, pal) in enumerate([
            ([(256, 150), (292, 140), (312, 116), (316, 90)], GIANT),
            ([(256, 144), (286, 128), (300, 100), (294, 76), (280, 66)], GIANT),
            ([(254, 138), (274, 118), (282, 90), (270, 68), (252, 60), (236, 62)], NEAR)]):
        big_finger(c, pts, 2.8 - .2 * k, 1.5, pal)
    ledge(c, 178, 92, 30, 7)                                           # a slab of the old arena, still falling
    hero(c, 166, 112, 1)

# ── C: THE MAW — it fills the sky, jaw hung open around the arena: its lower teeth are the floor ──
def p4_maw(c):
    stars(c, 2)
    for pts in ([(110, 30), (40, -10), (-10, 60), (-6, 200)], [(96, 60), (20, 70), (6, 200)],
                [(210, 30), (280, -10), (330, 60), (326, 200)], [(224, 60), (300, 70), (314, 200)]):
        leg(c, pts, DISTANT, 6.5, hand_a=math.pi / 2)
    skull(c, 160, 22, 76, jaw=80, pal=GIANT, fangs=True, hinge=.84, chin=.64, eye=1.6)
    # the floor: the chin's teeth, ground flat on top where it bites down, and two slabs of the arena inside the mouth
    ty = 22 + 76 * .98; cy = ty + 80
    for i, x in enumerate(np.arange(122, 196, 12)):
        c.shade(c.mask_poly([(x, cy - 16), (x + 10, cy - 16), (x + 9, cy - 4), (x + 1, cy - 4)]), NEAR['bone'], NEAR['lit'], NEAR['dark'], NEAR['deep'], 2)
        c.B(x, cy - 16, 10, 1, NEAR['lit'])
    ledge(c, 126, 132, 26, 7); ledge(c, 170, 118, 26, 7)
    hero(c, 150, cy - 38, 1)
    c.glow(160, 30, 90, (120, 70, 200), .05)

PHASE4 = [
    (p4_horizon, 'p4-a-horizon', 'PHASE 4 · A — The Horizon', 'It rises behind the arena rim. Its skull fills the sky; its fingers lie across the floor.',
     ['It never comes up past the rim: the skull, the far legs and', 'the cage are the backdrop, drawn a step back into the dusk.',
      '', 'Its two hands are part of the stage. The fingers lie over the', "platform's ends, and it lifts one and drags it across the floor:",
      'jump the fingers as they come.', '', 'The two slabs in front of its face are where you stand to hit', 'the eyes when they flare.']),
    (p4_cradle, 'p4-b-cradle', 'PHASE 4 · B — The Cradle', 'The arena is its palm. The fingers are the far wall; the thumb is a ramp.',
     ['You fight standing in its hand. The floor is the palm, the', 'right wall is its curled fingers, and the thumb is a way up.',
      '', 'It closes the hand to crush: the fingers come in from the', 'right and the arena gets smaller. Ride a knuckle up, or run.',
      '', 'The jaw hangs open, very long, beside the wrist. Get knocked', 'off the palm on the left and you fall into it.']),
    (p4_maw, 'p4-c-maw', 'PHASE 4 · C — The Maw', 'It fills the sky, jaw hung open around the arena: its lower teeth are the floor.',
     ['You fight inside its open mouth. The chin\'s ground-flat teeth', 'are the floor; two slabs of the arena hang in the dark.',
      '', 'Each time it bites, the upper teeth come down like a ceiling.', 'The gaps between the fangs are the only safe places.',
      '', 'The shine on its skull runs toward the side it will bite; the', 'blank eyes flare white just before.']),
]

def card4(draw, title, desc, notes, out, scale=3):
    c = Canvas(W, H); c.sky(FRACTURED_SKY, 0, H); draw(c)
    sc = c.image(scale)
    F = '/System/Library/Fonts/Menlo.ttc'
    head = 96; col = 470
    import textwrap
    paras = ' '.join(l if l else '\n' for l in notes).split('\n')
    notes = []
    for para in paras:
        notes += textwrap.wrap(para.strip(), 50) + ['']
    img = Image.new('RGB', (24 + sc.width + 28 + col, head + sc.height + 30), (13, 10, 22))
    img.paste(sc, (24, head)); d = ImageDraw.Draw(img)
    d.text((24, 18), title, fill=(232, 226, 242), font=ImageFont.truetype(F, 30))
    d.text((24, 60), desc, fill=(165, 155, 190), font=ImageFont.truetype(F, 17))
    d.text((24 + sc.width + 28, head), 'HOW IT PLAYS', fill=(255, 233, 196), font=ImageFont.truetype(F, 17))
    for i, line in enumerate(notes):
        d.text((24 + sc.width + 28, head + 34 + i * 22), line, fill=(190, 182, 210), font=ImageFont.truetype(F, 14))
    d.text((24, head + sc.height + 4), 'the whole arena, at in-game scale: the knight stands on the platform',
           fill=(110, 100, 135), font=ImageFont.truetype(F, 13))
    img.save(out); return img

def render(out):
    from compose import sheet
    sheet([card4(fn, t, d, n, f'{out}/{name}.png') for fn, name, t, d, n in PHASE4], 'THE CLOAKED MAN — PHASE 4', f'{out}/phase-4-sheet.png')
