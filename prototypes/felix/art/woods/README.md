# Sir Felix / Chapter Two art

Forty PNGs authored at world-pixel resolution in `../make_woods_art.py`.
Rebuild from the Felix project folder with `python3 art/make_woods_art.py`,
then run Godot's headless import. Pillow is only an offline art dependency.
Commit the PNGs and their `.import` files; no art tools run in the game.

- Cardboard helmet, crayon plume, stick sword, swing and laid-down variants
  fit around the unchanged shared Felix body center. The swing reads the existing
  strike timer and direction and never changes the strike or its hitbox.
- Isaac is roughly 80 world pixels tall when standing, with the same tuft, cheeks
  and face palette as the younger Chapter One boy, now in weekend clothes.
  Kneeling retains the original stick tip on Felix. Following uses a softer tint
  and a presentation-only far-path position which avoids foreground ceilings.
  His story position, route, targets, speed, poses and every cue are unchanged.
- Dad's warm and cold silhouettes have no facial features. The boy's curled-up
  sleeping sprite rests on his lap. Cabin wall grain, window, rope lights and the
  carved sign are visible from the existing porch camera. Exact sign text stays
  in the view. The doorway and bulbs go cold after the power cut, including when
  a reference route starts directly in the flashlight story.
- Three dithered skies, stepped tree sprites, sun shafts and changing tree colors
  provide the afternoon-to-night transition. Rain, splashes and lightning use
  the existing rain strength and thunder triggers.
- A cold story lantern replaces the gold finish flag. The finish bounds, entry
  hatches, goals, platforms and devices are untouched. Its pool has a real point
  light; the textured beam lifts or lowers Felix using the existing ride values.
- Ferns, mushrooms, leaves, acorns and sparse near grass are dressing, selected
  away from hazards. The red-pinned paper is the boy's existing secret drawing.

`woods_view.gd` keeps a chapter-specific copy of the base foreground draw function
so its hard-coded gold goal flag can be replaced without editing shared engine
code. That copy differs only at the flag block, which calls `draw_tale_goal()`.
All entity mirroring, hazards, devices, particles and draw order stay intact.

## Review

`art/preview_woods.gd` renders a pose sheet to `shots/ch2-poses.png`.
`art/check_chapter_menu.gd` checks the merged chapter menu, music controls and
selected score across Chapter Two story cuts. The small integration fix in
`felix_main.gd` preserves the selected stream and its position around the shared
`room_changed()` call; shared `audio.gd` is unchanged.

`art/check_woods_routes.py <output-folder>` runs the three required route checks
sequentially and stops each at its approved finish, retaining logs and results.
Run `tools/woods-shots.sh shots/ch2-after-N` separately, with one capture at a time.
Baseline hashes in `shots/ch2-before-source.json` cover 191 protected files,
including story code, layouts, shared engine code and Chapter One's sprites.
