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

# Studies four to six

2026-11-05, same branch. Rooms 4–6 of the report's arc, with two changes forced by measurement.

| Room | Idea | Assumption it breaks |
| --- | --- | --- |
| The Sill That Starts the Clock | a cracked sill's shake is a timer you start; the tear's mouth opens on a cycle (`period` 96, `upT` 30) | cracked sills are hazards to leave fast |
| The Line You Must Ride Downhill | an uphill exit (slope steeper than 0.25) drops to 35% speed; a downhill exit keeps it | the climbing line takes you further |
| The Weight You Keep Off the Hound | the brute's charge is the only thing that breaks the brittle door | drop the counterweight on the brute (the West and East courts) |

**Forced changes from the report:**
- **No wavedash in room 4.** Under a low lintel every technique I measured (jump-dash, hyper, wavedash) reached within a tile of the others, so a wavedash could not be made necessary. The room keeps the clock idea and its finish is the tear's flat throw.
- **No runway in room 5.** On any floor, the road's own ultra and hyper match a tear's downhill throw from a better start: a hyper reached about 300 px where the tear jump plus dash reached about 260. So room 5 starts on a high ledge over a pit with nothing to run on. A spiked mass hangs between the two line ends: whoever rides the climbing line has to drop under it first and falls short.
- **Covered walkway in room 6.** Brutes only notice the knight within 180 px and in line of sight, and a charge lasts 80 frames. From the left wall a second charge can never reach the door. Felix therefore crosses a covered walkway the brute cannot see through and drops in front of the door, so its first charge goes into the door. The weight hangs under a hole in the walkway; dropping onto it and dashing down crushes the brute.

Camera: `puzzleCameraAnchorY` 40 (room 4, so the shaft and mouth show from the spawn) and 60 (room 6, so the whole 184-pixel room shows). Placement: (518,−232), (574,−222), (638,−206); the crossroads is now at (678,−206).

**Verification:**
- `tests/fractured_causeway_studies.gd` (renamed from `fractured_causeway_three.gd`): 47 of 47. New checks:
  - room 4: 6 of 16 starting moments across the cycle pass, and jumping the shaft reaches nothing;
  - room 5: the throw alone falls short, and 216 rides up the climbing line, each with a dash after, all fail;
  - room 6: the reference breaches with the brute alive; dropping the weight kills it and the door stays shut; standing still dies;
  - nearby timings: 3 of 3 and 4 of 4.
- `fractured`: 122 of 122. `fractured_journey`, `world_checks`, `causeway`, `world3_journey`, `world3_secret`, `refinements`, `revision`, `fractured_next` and `fractured_nine` all pass.
- The tour was re-recorded: 10,994 frames, 26 of 26 sections, 0 deaths. Captures of all three rooms were checked by eye.

Room 6's jump window is about 7 frames, after a 36-frame tell. That is tighter than the "breather" the report planned; widen it if it plays tense.
