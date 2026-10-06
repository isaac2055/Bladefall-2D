"""Design cards: a title band; the sprite in a Fractured scene at in-game scale beside the knight; a close-up."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from px import Canvas, hero, ground, FRACTURED_SKY

FONT = '/System/Library/Fonts/Menlo.ttc'
BG = (13, 10, 22)

def scene(draw, w, h, gy, hero_x, silhouettes=True):
    c = Canvas(w, h); c.sky(FRACTURED_SKY, 0, gy)
    if silhouettes:
        for i, x in enumerate(range(-10, w, 29)):
            hh = 8 + (i * 13) % 12
            for r in range(hh): c.B(x + r // 2, gy - hh + r, 22 - r, 1, '#0d0a16')     # low broken hills
    ground(c, gy)
    if hero_x is not None: hero(c, hero_x, gy - 22, 1)
    draw(c, gy)
    return c

def sprite_only(draw, w, h, gy):
    """The sprite on a flat ground, and the same canvas without it, to find its box."""
    def base():
        c = Canvas(w, h); c.a[:] = BG; c.B(0, gy, w, h - gy, '#1a1622'); c.B(0, gy, w, 1, '#4a4556'); return c
    a = base(); draw(a, gy)
    b = base()
    diff = np.abs(a.a - b.a).sum(axis=2) > 24
    ys, xs = np.nonzero(diff)
    return a, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

def card(draw, title, desc, out, scene_size=(100, 64, 54, 18), scene_scale=6, close_h=None, pad=5, focus=None, close_note=None):
    w, h, gy, hero_x = scene_size
    scv = scene(draw, w, h, gy, hero_x); sc = scv.image(scene_scale)
    if focus:                                          # a detail of the scene itself (the giant's skull)
        x0, y0, x1, y1 = focus; src = scv
    else:
        src, (x0, y0, x1, y1) = sprite_only(draw, w + 60, h + 40, gy + 20)
        x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(src.w, x1 + pad), min(src.h, y1 + pad)
    crop = Image.fromarray(np.clip(src.a[y0:y1, x0:x1], 0, 255).astype(np.uint8), 'RGB')
    ch = close_h or sc.height
    k = max(1, ch // crop.height)
    close = crop.resize((crop.width * k, crop.height * k), Image.NEAREST)
    head = 96
    W = sc.width + 24 + close.width + 48; H = head + max(sc.height, close.height) + 24
    img = Image.new('RGB', (W, H), BG)
    img.paste(sc, (24, head)); img.paste(close, (24 + sc.width + 24, head + (sc.height - close.height) // 2 if close.height < sc.height else head))
    d = ImageDraw.Draw(img)
    d.text((24, 18), title, fill=(232, 226, 242), font=ImageFont.truetype(FONT, 30))
    d.text((24, 60), desc, fill=(165, 155, 190), font=ImageFont.truetype(FONT, 17))
    d.text((24, head + sc.height + 2), 'in-game scale, beside the knight', fill=(110, 100, 135), font=ImageFont.truetype(FONT, 13))
    d.text((24 + sc.width + 24, head + max(sc.height, close.height) + 2), close_note or f'close-up ({k * 2}x the game\'s pixel)', fill=(110, 100, 135), font=ImageFont.truetype(FONT, 13))
    img.save(out)
    return img

def sheet(images, title, out):
    """Stack a phase's three cards under one header."""
    head = 80; W = max(i.width for i in images); H = head + sum(i.height for i in images)
    s = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(s)
    d.text((24, 22), title, fill=(255, 233, 196), font=ImageFont.truetype(FONT, 34))
    y = head
    for i in images: s.paste(i, (0, y)); y += i.height
    s.save(out)

def card2(draw_a, draw_b, title, desc, notes, out, scene_size, scale=3):
    """Two beats side by side, both at in-game scale beside the knight."""
    w, h, gy, hero_x = scene_size
    a = scene(draw_a, w, h, gy, hero_x).image(scale); b = scene(draw_b, w, h, gy, hero_x).image(scale)
    head = 96; W = 24 + a.width + 24 + b.width + 48; H = head + a.height + 24
    img = Image.new('RGB', (W, H), BG); img.paste(a, (24, head)); img.paste(b, (48 + a.width, head))
    d = ImageDraw.Draw(img)
    d.text((24, 18), title, fill=(232, 226, 242), font=ImageFont.truetype(FONT, 30))
    d.text((24, 60), desc, fill=(165, 155, 190), font=ImageFont.truetype(FONT, 17))
    for x, t in ((24, notes[0]), (48 + a.width, notes[1])):
        d.text((x, head + a.height + 2), t, fill=(110, 100, 135), font=ImageFont.truetype(FONT, 13))
    img.save(out); return img
