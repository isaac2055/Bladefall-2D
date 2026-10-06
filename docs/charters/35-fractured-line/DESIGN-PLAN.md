# The Fractured Line (stage 35), built 2026-09-25 (7.215.0)

## Refinement — 7.220.2 (2026-09-25)

Ghost rails remain visible between solid windows. HOLD/REIN/LEAN posts announce the three light speeds. Black Line music state stops on death/completion. Pace/ghost rail render reviewed; route and wave speeds retained.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's fifteenth echo: the Deep Line after the Echo walked it backwards. It is the same rail and the same
cart, but the line has been cut where it was whole. Every fork has lost its safe road, and the only speed that
counts is speed you earn in the air. It is a cart ride east, as the original was.

**The kit** is the one the rider brought: everything through the gravity flip. The cart takes most of it away,
as it always did. It jumps once, a second press throws a 360, and the sword still swings.

**The Muster applies.**

**Code:** `public/bladefall-fractured-line.js` and `-art.js`.
- **Stage and seams:** stage 35, zone `fractured-line`. The seam `fk-fl` comes from the King; the east seam
  `fl-fc` opens once the Black Line is behind you.
- **Rest site:** `line-ash` (The Dead Lamp).
- **Music:** `fractured-chasing-daylight-on-broken-rails.mp3` on the road, and `fractured-clockwork.mp3` on the
  Black Line. ClockWork was Frostfell's old cue and was unused.

**Engine parts reused, all driven by level flags, not stage number:**
- cart mode (`L.cart`);
- `RailSwitch` (lean at the post);
- `RailCollapse`;
- `Slope`;
- `FJ` jets;
- the cart's 360 and its clean-landing surge;
- the momentum window, which is hard-coded to x > 6800 in every cart level, so the tricks start after it.

**Built here:** the Black Line's travelling light.

**No shared changes.**

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Dead Signal | 0–2540 | Signal Descent | the head of the line and the descent, with two jets on a beat on the flat |
| The Cut Fork | 2540–4750 | the First Fork (a fragile high line, or the low road among jets) | the switch, and no low road: it ends in 1,500 of dark. Lean at the post or fall. The high line's two failing spans go in 1.35 and 1.3 s (the original's took 1.75 and 1.7) |
| The Falling Bridge | 5000–6800 | four spans | six, each failing 1.6 s after the cart comes within 420. That needs ~440 u/s: a lean, not a rest |
| The Trick Gaps | 7700–9750 | the takeoff gap sized for one 360 | three gaps. The first (340) asks for the lean. The next two (505) are past the cart's best without a surge (496 at full momentum), and inside it only with the surge a clean 360 over the gap before gave (+190 for 1.5 s). Take-off windows are ~20–100 units before each edge |
| The Black Line | 10500–12900 | the Black Gap (one leap on sustained lean) | **the C-side** |

## The C-side: the Black Line
The rail over the dark is there only while a travelling light is on it. The light is an island of planks, lit
1.8 s of every 2.8 s, moving at each stretch's own pace:
- **at rest (270)** for 900;
- **reined in (110)** for 300, where the island is only ~200 long;
- **leaning (570)** for 1,200.

Ride inside it. Enter while an island is leaving the start, and change pace where the light does. The tail's
ties turn amber just before those planks go. A fall rewinds you to the stretch's head.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("FRACTURED CLIFFS") in 30 s with no hits: the fork, the
bridge, all three trick gaps with clean 360s, and the Black Line.

Separately:

| Check | Result |
|---|---|
| No lean at the fork | falls into the dark every time |
| No lean on the bridge | falls every time |
| Trick gaps without 360s | fall in the second gap, even taken 4 units from the edge |
| Trick-gap take-off sweep (offsets before each edge) | 1st: 10–80 clear. 2nd and 3rd: 20–80 clear, 5 or 120+ fall |
| Black Line, pacing bot | 3/3 through, 2 of them clean |
| Black Line, no input / full lean / full rein | fall at ~10,600 / ~11,660 / ~10,700 |

Measured on the flat:
- a held cart jump is 0.87 s in the air and peaks at 108;
- speeds are 110 reined, 270 at rest, 430 leaning, 570 with full momentum, and +190 for 1.5 s after a clean 360;
- a clean 360 needs the second press by ~0.39 s after the first.

Changed while verifying:
- **The Black Line's first build** had spans blinking on a fixed beat. A cart can't wait, and its momentum ramps,
  so no steady pace fit the beat. It became a travelling light at each stretch's pace.
- **The trick gaps** were first 420 / 580 / 580, with take-off windows of ~40 units (0.07 s). Now 340 / 505 / 505.

## Open
- Owner playtest: whether "ride inside the light" reads on the first attempt, and whether the reined stretch
  (an island ~200 long at 110) is fair.
- The rail snipers never hit the bot's cart at these speeds. They may be scenery here.
- The original's momentum window is hard-coded to x > 6800 for every cart level. The echo builds around it, but
  a future cart echo may want it read from the level.
