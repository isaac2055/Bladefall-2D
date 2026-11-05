# Sir Felix / Chapter Two art

Forty-eight PNGs authored at world-pixel resolution in `../make_woods_art.py`.
Rebuild from the Felix project folder with `python3 art/make_woods_art.py`,
then run Godot's headless import. Pillow is only an offline art dependency.
Commit the PNGs and their `.import` files; no art tools run in the game.

- Cardboard helmet, crayon plume, stick sword, swing and laid-down variants
  fit around the unchanged shared Felix body center. The swing reads the existing
  strike timer and direction and never changes the strike or its hitbox.
- Isaac is 56 world pixels tall when standing, with the same tuft, cheeks
  and face palette as the younger Chapter One boy, now in weekend clothes.
  Kneeling retains the original stick tip on Felix. Following and outdoor standing
  use a cooler depth tint behind the foreground branches, with a translucent contact
  shadow on the ground. Claude's grounded `stand_spot()` and direct
  `boy_background_target()` are retained, without a clearance search or y-clamp in
  the view. The only story edit is `BOY_TALL=8`: 56 pixels plus one tile of clearance.
- Dad is a 116-pixel seated figure with shaped shoulders, bent arms, knees and boots,
  slightly smaller than his original 128-pixel silhouette. His seat and feet still
  meet the same porch step and ground; the extra height is in his upper body.
  His warm and cold silhouettes have no facial features. He sits on the existing
  porch step and leaves the doorway visible. The smaller curled-up sleeping sprite
  rests across his knees. Cabin wall grain, window, rope lights and the
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
- The 20-slot native tile atlas replaces masonry with moss, soil, roots, exposed
  bark and twig ledges. The base terrain builder and all cell positions are retained;
  higher hash bits select soil variants to avoid a repeating checkerboard. The
  TileSet has no physics layers. Four thorn sprites retain the original spike tile
  bounds and orientations. Rails and root-bound blocks keep their original bounds.

`woods_view.gd` keeps a chapter-specific copy of the base foreground draw function
so its hard-coded gold goal flag can be replaced without editing shared engine
code. That copy calls `draw_tale_goal()`, draws twig rails and bark blocks, and
adds the boy's contact shadow beneath devices and Felix. All entity mirroring,
device state handling, particles and gameplay draw order stay intact.

## Review

`art/preview_woods.gd` renders a pose sheet to `shots/ch2-poses.png`.
`art/check_chapter_menu.gd` checks the merged chapter menu, music controls and
selected score across Chapter Two story cuts. The small integration fix in
`felix_main.gd` preserves the selected stream and its position around the shared
`room_changed()` call; shared `audio.gd` is unchanged.

`art/check_woods_routes.py <output-folder>` runs the three required route checks
sequentially and stops each at its approved finish, retaining logs and results.
Run `tools/woods-shots.sh shots/ch2-after-N` separately, with one capture at a time.
Fix-pass baseline hashes in `shots/fix-protected.json` cover 249 protected files,
including layouts, shared engine code and Chapter One's sprites. The separate
`shots/fix-before/woods_story.gd.txt` snapshot verifies the single allowed constant
change. Review all eleven `shots/fix-before` and `shots/fix-after-N` captures, then
run the three routes sequentially before committing a pass.
