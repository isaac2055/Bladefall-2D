# Chapter One pixel art

All production PNGs are authored on the world-pixel grid, with transparent margins
where needed. Nearest-neighbor filtering comes from the unchanged project settings.
The original point lights, night modulation, glow effects, strings, UI and story text
remain live; the character, furniture, terrain and prop surfaces use these textures.

## Editing

The three Python files are editable source art: explicit pixel patterns, limited
palettes and offline raster drawing. They require Pillow to rebuild, but the game
only needs the committed PNGs and Godot `.import` metadata. Run from the project:

```sh
python3 art/make_pixel_art.py
python3 art/make_room_art.py
python3 art/make_prop_art.py
/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path . --import
```

- `felix/`: 8 × 9 body canvases, face and slime variants, and small limb, foot,
  cape and drip parts. The original walk, squash, dash, climb and cape trail
  calculations animate these parts. The returned body center is unchanged.
- `tiles/bedroom.png`: twenty 8 × 8 cells, in the original atlas order. Tile
  assignment, connectivity, collision and shadows remain in `build_terrain()`.
- `boy/`: the shared head anchor is (-19, -26) relative to the old head center.
  Sitting, standing, kneeling, running, pointing, waving, sleep and hiding retain
  the original story poses, body positions and animation clocks.
- `room/`: furniture is drawn at the existing furniture anchors. Repeating wood,
  wallpaper and corrugated cardboard stay aligned with world coordinates.
- `props/`: eight-pixel hazard cells, devices, ten 14 × 14 family photos, torn
  paper, baskets, slime, and soft shadow silhouettes. Device state still selects
  visibility, readiness, opening, breaking and bobbing in the view code.

## Checking

Run `tools/felix-shots.sh shots/after-N` and inspect all 17 captures, including the
opening, darker rooms and ending. Run the unchanged reference route with
`--reference workshop-relay --chain --report`; stop after the repeated
`AT cl1-atlas-crossroads ... deaths=0 ... phase=end` report. No `SCRIPT ERROR` or
`Parse Error` is acceptable. Screenshots and route logs are scratch under `shots/`.

For a full-bright visual pose sheet using the production drawing functions, run:

```sh
/Users/computer/Projects/Bladefall-Godot-Ascend/.cache/godot/Godot.app/Contents/MacOS/Godot --path . --script art/preview.gd -- shots/art-preview.png
```

This standalone art preview does not load or change the game simulation.
