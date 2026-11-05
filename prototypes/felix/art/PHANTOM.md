# Chapter Three pixel art

Rebuild the hand-authored PNGs with `python3 art/make_phantom_art.py`, then run
Godot with `--headless --path . --import`. Pillow is only an offline art dependency.
All sprites have transparent margins and use nearest-neighbor filtering.

`phantom_view.gd` alone connects these assets to the story. Isaac, Mom and the man
remain 56, 70 and 82 world pixels tall, with the same feet and floor-clearance
anchors. Each has four walk frames; the story selects the other poses unchanged.
The cap, beard, jacket seams and pale collar connect the 24 × 16 Brute caricature
to the man. The enemy's original envelope is deliberately retained.

The hood, mask, scarf tails, snapped stick and folded costume use the existing
Felix body center. The dagger follows the original strike direction, arc and timer.
Dad's 80 × 32 car retains the wheel/window anchors, with Isaac in the rear window
only while `story.in_car`. Mom's downcast face and cheek-touch pose are distinct
from her smile and wave. The lot selects the warmer work-jacket palette.

The sky blends through `story.late`; `story.streetlight()` still controls the night
sweep. The workshop goal is a sodium lamp and pool over the unchanged goal region.
Rivets, rust, chains, gravel, a bottle cap and parking stripes are drawing overlays;
the existing tile atlas and every collision remain intact.

The foreground copy in `phantom_view.gd` retains the engine's scene/device loops
and draw order; only bridge dressing and the goal flag's rendering differ.
It keeps this chapter's drawing independent of Chapters One and Two.

Capture all 13 scenes with `tools/phantom-shots.sh shots/ch3-after-1` and inspect
them. `python3 art/check_phantom_routes.py shots/ch3-after-1-routes` runs the four
required routes one at a time and stops each at its exact success state. Scratch
screenshots, pose sheets and route reports stay under ignored `shots/`.
