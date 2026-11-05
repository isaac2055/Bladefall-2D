# The first three Fractured Causeway studies

2026-11-05, Claude, branch `claude/fractured-causeway` (from `3dd93c0`). Design source: the deep-research report "Celeste style Causeway puzzle rooms" (rooms 1–3 of its seven-room arc; Isaac wants nine in total). Decisions from Isaac: parry and portal locked; required rooms; hints ask a question rather than list inputs.

## The idea

World 23's road uses tears only as transport. The studies each make one tear property the question, read straight from `scripts/fractured_devices.gd`:

| Room | Property | Assumption it breaks |
| --- | --- | --- |
| The Line That Carries You Away from the Exit | a tear returns the dash on exit; a steep line throws you upward | a line pointing away from the exit is not your road |
| The Line That Will Not Set You Down | a plain flat line keeps 220 px/s with a 24-frame coast; `setDown` parks you | the safe perch is the goal |
| The Line That Only Runs Home | `oneWay` lines open only at end `a` | the mouth in front of you is the way forward |

Measured in the real core (not estimated): running jump 7.5 tiles across and 3 up; ground dash about 6 tiles; up-dash 5; jump plus up-dash about 8. A flat tear throws about 12 tiles while dropping 7. A dash entering a tear must not oppose the line's direction, so a line leaning back toward the entrance is entered with an up-dash. The dash direction is read a few frames after the press, so a press near a mouth can re-enter the same line if the stick is still pointing along it.

## Layouts

- **Away:** the shelf sits under a slab whose top is spiked; the corridor to the exit is above. The line runs from over the pit back up into the shaft above the slab. The shaft wall is spiked so the returned dash, not a climb, gets you into the corridor.
- **Keeps speed:** the upper `setDown` line delivers to a perch under an overhang with a spiked cage behind it. The lower plain line ends over the pit and its throw carries through the slot under a spiked mass.
- **Runs home:** the same shaft-and-corridor frame as the first room, so the change is the property alone. Three cracked sills (default 24-frame shake, 120-frame respawn) lead out to a far perch under the lit mouth. The sill run needs one jump-dash.

Sizes 48×22, 60×32 and 56×25. Openings between rooms are four rows, matching the Quiet Passage and the crossroads. The first room is 22 rows tall so it does not share cells with the Pogo Up secret above the Quiet Passage. The crossroads moved from (354,−223) to (518,−240); passages are absolute and unchanged.

## Verification

- `tests/fractured_causeway_three.gd` (26 checks): each reference clears with no deaths and leaves by the exit. Each fails with its tears removed. Counterfactuals:
  - riding without spending the returned dash;
  - climbing the shaft wall;
  - jump-dashing toward the exit;
  - the caged perch;
  - 36 drop-and-dash attempts from the perch;
  - walking back over the sills.
  
  Nearby timings: 4 of 4, 4 of 4 and 4 of 4.
- `tests/fractured.gd`: 119 of 119. That is the baseline's 116 plus Watch completing the three rooms; the chapter-23 room count is updated to 40.
- `tests/fractured_journey.gd`, `world_checks`, `refinements`, `revision`, `fractured_nine`, `fractured_next`, `fractured_woods_feel`, `causeway`, `world3_journey` and `world3_secret` give the same results as the baseline.
- `connectivity`, `seams`, `fractured_render` and `parity` fail or time out identically on the untouched baseline `3dd93c0`, so they are not caused by this change.
- `tools/record-fractured.gd 23` re-recorded `data/world23-tour.json`: 10,073 frames, 23/23 road sections, zero deaths, ending at the crossroads.
- `authoring/generate.gd --world 23 --force`: 40 rooms round-trip; `levels/world23.tscn` regenerated.
- Rendered captures of all three rooms were checked by eye (titles, questions, the caged perch, the dim closed end).

Not established: human clarity and enjoyment, and whether the rooms are hard enough for Fractured. The sill run is the only advanced-ish execution; none of the three requires a wavedash or hyper. The macOS app was not rebuilt.
