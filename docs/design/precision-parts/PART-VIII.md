# Part VIII · Frostfell (levels 83–90)

Files: `public/bladefall-pcore-part-083-frostfell.js` (rooms and tapes), `scripts/verify-precision-part-083.mjs`
(routes, wrong answers, hunts). Devices: `public/bladefall-pcore-dev-frost.js` (ice `I`, wind `winds:[…]`,
frost feather `f`) and the core's fractured stone `~`, used here for the first time as the Faultline.
No device module was changed.

**The region's one new thing** is the frost feather, the precision mirror of Frostfell's double jump: touch it
in the air and you carry one more jump; it melts when you land; you carry one at a time; it grows back like a
crystal. Ice and wind are the region's physics, taught once each and then used as ground and weather. The
fractured stone is the region's one precision-only device (the Faultline). Old friends that return: the
crystal (86), the lantern (87), the moth (89).

## The levels

| Level | Room | The question | The wrong answer that fails (machine-checked) |
|---|---|---|---|
| 83 | Frost Feather | The ledge is higher than a jump and a dash can take you. What can you pick up on the way? | One jump and one dash, any run-up, hold, timing and aim (693 tapes, 0 exit); a super off the lip then an up-dash (216, 0). Hunt: the room with the feather taken out has no way up. |
| 84 | Black Ice | Every floe is ice, and every one ends in thorns. How do you cross ground you cannot stop on? | Land on the first floe and stand, or brake, before the next jump (140, 0 exit). |
| 85 | Updraft | The wind carries you up the shaft and lets go below the ledge. What do you still need when it does? | Dash your way into the wind, then ride it up (243, 0). Hunt: no way up with the wind taken out. |
| 86 | One at a Time | Two feathers and a crystal up a wall of thorns. When do you spend the first feather? | Dash up past the second feather still carrying the first (300, 0). Hunts: no way up without the second feather; none without the crystal. |
| 87 | Kite | The updraft only slows your fall. What would it do to someone who falls slowly already? (No dash in this room.) | Ride the updraft empty-handed, jumping from anywhere on the ledge (324, 0). Hunt: no way up with the lantern taken out. |
| 88 | Faultline | Every stone gives way a moment after you land. What does each one give you before it goes? | Stop on the first stone to line up the next jump (27, 0). Hunt: no way up with the feather taken out. |
| 89 | Moth Wing | The feather melts when you land, and you need it at the far wall. What can you come down on that is not the ground? | Pass the moth by, feather and dash in any order (140, 0); spend the feather on the way to the moth (125, 0). Hunt: no way across with the moth taken out. |
| 90 | Muster Crown | A floe, an updraft, a thorned pillar, a stone that falls and a feather past it. What must you still have when the wind lets go, and when do you catch the feather? | Dash into the wind off the floe (198, 0); from the stone, one jump and one dash, walking off its edge included (630, 0). Hunts: no way up without the feather, without the stone, or without the wind. |

Hints appear only where an object is introduced (83 feather, 84 ice, 85 wind, 88 fractured stone). 86, 87, 89
and 90 have none: their pieces are all known.

## What the player does and feels

- **83 Frost Feather.** A thorn-faced ledge too high to climb. You run off the lip, a pale quill is hanging
  right where the jump peaks, you touch it and jump again in mid-air, then dash up onto the ledge. The first
  "one more jump" of the game, handed over at the top of an ordinary jump.
- **84 Black Ice.** Three short floes over a frozen river of thorns. Land on one and you keep sliding, so you
  jump again as you land, floe to floe, and only stop on the far hearth. The ice is felt, not explained.
- **85 Updraft.** You jump into a column of rising streaks and it carries you up a thorn-faced shaft, slowly,
  until it lets you go just below the ledge. The dash you did not spend getting in is what takes you the rest
  of the way. Dashing into the wind feels natural and is exactly wrong.
- **86 One at a Time.** Two feathers stacked up a wall of thorns, a crystal above. Catch the first, spend it
  at once, and the second is there to catch; hold on to the first and the second ignores you. Then dash,
  crystal, dash.
- **87 Kite.** A thorn-walled chimney with an updraft that barely slows a falling knight, and no dash to
  cheat with (the knight's plume is grey from the start). Pick up the lantern and hop into the wind: carrying the
  light you fall slowly, so the same wind now lifts you, all the way to the roof. Walk off the top of the column
  onto the ledge. The lantern returns as a sail.
- **88 Faultline.** Two fractured stones shake the moment you land and drop a moment later. Each still counts as
  ground: it gives the dash back. Hop, dash, land, go; from the second stone jump into the feather overhead
  and climb the last wall on it.
- **89 Moth Wing.** The feather is caught at the start and needed at the far wall, and there is no ground in
  between that would not melt it. A moth hangs low in the pit: cut down on it, bounce, dash back, and spend the
  feather at the wall.
- **90 Muster Crown.** The region in one climb. Hop the floe into the wind without spending the dash, ride it
  to the top, and when it lets go, dash straight across, over a thorn-capped pillar, down onto the fractured
  stone. It shakes as you land; jump at once, touch the feather ahead of you, jump again and dash up onto the
  crown. The pillar is what makes the ride necessary: from the floe you cannot get over it.

## Difficulty curve (intended)

Sawtooth reset, then a gentle climb. 83–85 are teaching rooms, each easier than Part VII's close (82) and well
below *Everything Before*: one device, a generous window (83's feather route passes for 32 of 144 timing
variants; 84's landing window is about 12 frames including the jump buffer). 86 and 87 pair the new things with
an old friend, still short. 88 and 89 are the first real execution: the stone's 0.4 s, the moth's placement.
90 chains four devices in about 3.6 seconds, meant to sit a little above 82 and around
*Everything Before*, leaving Act 1 room to climb to 149 without exceeding the ceiling. Momentum (super, hyper,
wavedash) is never required.

## What the sweeps caught, and how the rooms changed

- **Supers and hypers cross any flat pit.** The first drafts of 83 (a long flat pit) and 84 (the ice
  slide-jump) were crossed by a hyper or a super with no feather and no ice. In this engine ice adds almost
  nothing to distance either: a dash on rock followed at once by a jump carries the same speed as a slide on
  ice (123 px against 125). So every Frostfell room asks for **height** (supers add none), and 84 became a room
  about not being able to stop.
- **83**: the ledge's top corner was grabbable (the super + up-dash hunt climbed it); the thorns now run up the
  whole face and the ledge sits one row lower so the feather route clears the corner.
- **84**: the first floe layout landed you at the far end of each floe; the gaps are now four tiles.
- **85**: the updraft was too far from the ledge for the dash at the top; it moved two columns right and its
  top one row up.
- **88**: the first Faultline (three stones in a flat line) was bunny-hopped by a hyper with no feather,
  grabbing the last stone's side. The stones now climb, and the last wall is thorn-faced and 80 px above the
  last stone, higher than a jump and an up-dash.
- **90** took four drafts. (1) A super kept the dash for the top of the wind and skipped the feather and the
  stone. (2) A super to the floe and an up-dash from it grabbed the stone's side (the stone hung over the
  floe). (3) With the feather at the top of the wind: a dash onto the ice floe, a slide-jump into the wind and
  an up-dash climbed as high as the feather would have: **a jump carried into an updraft keeps its whole
  height on top of the ride**, so a short updraft entered on the way up is worth a feather. (4) The final room
  asks for the feather *after* the stone, where no wind helps: the crown is 72 px above the stone, more than a
  jump and an up-dash (65), and the stone is too far from the wind to drift to. The crystal the drafts had is
  gone.
- **87**: the same carried-jump effect. A running jump into the weak updraft plus an up-dash reached the first
  draft's ledge without the lantern. The morning moved the ledge near the ceiling; that was still reachable
  (see below).

## This pass (30 September afternoon)

Both remaining failures were real skips; both rooms were rebuilt.

- **87 Kite** (hunt found a way up with no lantern). A running jump into the updraft, then an up-dash inside
  it: the wind keeps lifting until you fall faster than it blows, so a dash spent in the wind is worth far more
  than its 58 px, and the empty-handed rise reached the ledge. Weakening the wind (tried 110, 100, 90, 80 px/s)
  never closed it without making the lantern ride a slow crawl, and a narrow thorn chimney let the search
  wall-jump off the thorns (a thorn wall can be wall-jumped from 3 px out) and grab the ledge's rock lip. The
  room now has **no dash** (`dashes:0`, the knight's plume shows it), a chimney nine tiles wide so no wall-jump
  chain reaches across, thorns on both walls and on the lip, and the column against the right wall so the
  lantern rider steps straight off onto the ledge. Without the lantern the best rise is a jump into the wind,
  about 70 px of the 136 needed. Checked with the verifier's hunt and a larger one (beam 1,200): none found.
  Kept with the dash, the same room is still skippable (found in 38 s), so the no-dash rule is load-bearing.
- **90 Muster Crown** (hunt found a way up with no wind). With ice speed off the floe, a jump and a diagonal
  dash reached the fractured stone directly. A thorn-capped pillar now stands between the wind and the stone.
  First tries: a short pillar was cleared by wall-jumping off its thorned face; a tall one right next to the
  wind let you spend the dash inside the wind and still drift over it (the "dash into the wind" family caught
  2 of 108); a pillar two tiles from the wind had its far face used for a wall-jump from the stone, then a dash
  onto the crown. The final room: wind column rows 7–19, a two-tile gap, the pillar (thorn face, thorn cap,
  rows 9–20), the stone three tiles past it, the feather and the crown moved right (feather col 31, crown face
  col 35) so the pillar's far face is out of range of the crown. You must arrive at the top of the wind with the
  dash and spend it flat across. Hunts without the wind, the stone and the feather find nothing (the feather
  hunt also at beam 1,200); the dash-into-wind family now tries 198 timings.

Verifier: 29 checks, all green (about 6.5 CPU-minutes on a machine running nine builders at once; expect
roughly three on a quiet one).

## Alternate solutions kept

- A super or hyper is always a faster way to *reach* a device (off the hearth in 85, 88, 89, 90). None of the
  hunts finds one that removes a device, so they stay as optional expert lines.
- In 84 a careful player can land slowly and stop on a floe. It gains nothing; the naive stop fails.
- In 86 the planner found the same devices in a different order (dash first, then the feathers); kept.

## Designs dropped

- **Ice slide-jump** ("the ice keeps the dash's speed across the pit"): the engine's ice gains only a couple of
  pixels over a dash-then-jump on rock, and supers beat it outright.
- **Faultline return trip** (light a stone across fractured ground and come back while the stones are down):
  the stones return after two seconds, about the length of the trip, so the question dissolved.
- **Crystal in the summit**: it could not be made necessary in a 40-tile room without letting a super skip the
  fractured stone; the summit is cleaner without it.
- **Ice walls you cannot hold** would be a strong Frostfell rule, but it needs a core hook (grabbing is decided
  in `bladefall-pcore.js`, which devices cannot reach). Proposed rather than built.
