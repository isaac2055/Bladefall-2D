#!/usr/bin/env python3
"""contact-sheet.py <dir> [per-sheet] — tile a sweep's frames (000120_room_phase.png) into labelled sheets."""
import sys, os, glob
from PIL import Image, ImageDraw
d = sys.argv[1]; per = int(sys.argv[2]) if len(sys.argv) > 2 else 12
frames = sorted(f for f in glob.glob(os.path.join(d, "[0-9]*.png")))
for old in glob.glob(os.path.join(d, "sheet-*.png")): os.remove(old)
cols, w = 3, 520
for n in range(0, len(frames), per):
    chunk = frames[n:n + per]
    first = Image.open(chunk[0]); h = int(first.height * w / first.width)
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * (h + 18)), (20, 20, 24))
    draw = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        x, y = (i % cols) * w, (i // cols) * (h + 18)
        sheet.paste(Image.open(f).convert("RGB").resize((w, h)), (x, y + 18))
        draw.text((x + 4, y + 3), os.path.basename(f)[:-4].replace("_", "  "), fill=(235, 235, 200))
    out = os.path.join(d, "sheet-%02d.png" % (n // per + 1)); sheet.save(out); print(out)
