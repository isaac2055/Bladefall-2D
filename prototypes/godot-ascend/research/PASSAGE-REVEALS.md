# Passage reveals — offline sample 0.52.0

The instant terrain swap on the appended routes has been replaced with a short,
player-controlled reveal. The browser keeps its existing level build; only the
web audio repair is deployed there. These presentation changes are for the
native editing/build workflow.

## What the player sees

The exit has a permanent framed doorway before completion. Reaching the real
flag lights its lantern, retracts the obstructing machinery, and lifts the old
terrain away in a wave toward the next room. A bronze floor edge and warm lamps
lead into a gallery with repeated braces and lanterns. The existing camera spring
adds a small look ahead, then returns to normal tracking. The sequence takes
about a second; it neither teleports the knight nor removes control. Reduced
motion uses a quiet dissolve and omits the camera bias.

The implementation applies the earned safe collision path immediately, retaining
snapshots of the old visible tiles and machinery for the reveal. Delaying the
physical floor until its animation completes can drop a knight standing on a
retiring platform, so the safe route is available throughout the visual opening.
Snapshots don't modify the original puzzle maps. Machinery cannot continue to
hurt or push the knight after it visibly starts retracting.

The obsolete hoist captions have been replaced with passage/lantern directions.
The opening uses the existing lever/gate recordings at restrained levels. There
is no new dialogue, cutscene, automatic travel, forced wait or result delay.

## Scope and persistence

This covers the 35 appended puzzle rooms in the three base worlds and Fractured
Causeway, plus its existing delivery exit. Fractured Outskirts and Woods retain
their already-connected native roads. Original level files, puzzle objectives,
room IDs, placements, geometry fingerprints, scoring and rewards are unchanged.
Every room still has its own checkpoint. Retry from a corridor retains the
preceding puzzle checkpoint, and full/shiny attempts keep their existing rules.

Reveal snapshots are transient presentation state. A save during a reveal stores
the earned completion and safe geometry. Resume reconstructs that passage open,
without replaying the reveal or granting a reward. Restart restores the original
puzzle geometry and clears the transient state. The existing save format and
old-layout migration remain intact.

## Verification

- `passage_reveal`: every configured exit; old image retained on the completion
  frame, immediately safe collision path, staggered reveal, no restart while
  standing at the flag, mid-reveal save/resume, per-room checkpoint, eligibility,
  unchanged layout signature, and fresh-run reset.
- `connected_roads`: original input solutions for all appended rooms and normal
  walking between every pair with individual checkpoints and no transport.
- `connected_shots`: actual application input and continuous actor/camera motion
  across seams in all four worlds with normal/reduced motion.
- `passage_shots`: actual GPU frames at completion and frames 6, 18, 30, 54 and
  90, plus reduced-motion frames; caption/camera checks. Captures are written
  to `/tmp/passage-*.png`. Packaged GPU checks reject drawing errors even if
  Godot returns exit status zero.
- Packaged save, progression, player, rewards and legacy migration suites run
  against the shipping Mac PCK using a test-only overlay.

Use `tools/check-macos.py --output <cache-directory> --gpu --suite passage_shots`
for the real packaged renderer, with `GODOT` set as in the other native tools.
