# The Fractured Sorcerer (stage 29), built 2026-09-24 (7.209.0)

Act Three's ninth echo: the White Court after the Echo walked it backwards. It is lit, and every door
in it stands open, but nothing in it holds unless you feed it the cold.

- **Kit:** the one the Court was entered with. That is jump, the Oathblade, the dash, the twin mouths,
  the wall jump, the Counter and the double jump. Attunement was the Sorcerer's gift, so it is not here.
- **The Muster applies.**

**Code:** `public/bladefall-fractured-sorcerer.js` and `-art.js`.
- **Stage and seams:** stage 29, zone `fractured-sorcerer`. The seam `ff-fs` comes from Frostfell, and
  the east seam opens once the Mirror is broken.
- **Rest site:** `sluice-ash`.
- **Music:** `fractured-glaciated-court-of-glass.mp3` on the road, and
  `fractured-the-sorcerers-hall-of-mirrors.mp3` for the Mirror.

**Engine parts reused as they are:**
- rune emitters (they fire whatever the stage);
- the anchor, which pairs the player's single mouth while the player is inside its range;
- projectiles through the player's mouths (`portalHops`);
- the Counter, which reflects projectiles;
- slate and slatewalls.

**Built here, because the Court's are stage-8-only:**
- the condensers (`actCondenser`: a bolt that has come through a mouth feeds one);
- the Mirror.

**Renderer change (shared, one line):** `runeEmitter` asks the region's art first.

**Bug found in passing and fixed in stages 27–29:**
- Bars under a wall must be as wide as the wall. At 26 under 44, a knight pressed against the bars stood
  inside the stone's width, and a jump and a dash carried the knight up through it. That bypassed the
  Frostfell Toll: measured, the knight came down at x 1033, past bars at 900.
- The Warden's bays were safe only because their roof stops a jump. All three echoes now build their
  bars as wide as the wall above.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Glassworks | 0–2550 | the ice stream through your mouth and the anchor feeds a condenser, and the gate bridge freezes for good | the same stream, but the 900 void has **no floor**, and the bridge is frozen only for 1.0 s after each bolt arrives (a bolt every 1.8 s). Cross on the beat, and jump and double-jump through the thaw; a single jump falls. The best flight without the bridge is 2420 against a far bank at 2550 |
| The Petition Gallery | 2550–4600 | intake slatewall, outlet floor slate, condenser: the gallery bridge | the emitter fires high, along a **band of slate** (560–660) on the gallery wall. Climb the chimney with the double jump and wall jumps, cling in the band and set the intake. Set the outlet on the floor slate under the condenser (820), and the portcullis lifts. The wall is wet above the band, so you can't climb over it |
| The Court's way | 4600–7900 | the Sluice and the rooms | the Muster: a rimehulk and a frostpike on the road; a frostsinger on the Glassworks' far bank |
| The Mirror's well | 7900–9000 | the Frost Sorcerer: steal its spell through a portal into its receiver | **the C-side** |

## The C-side: the Mirror
A figure of glass stands where the Sorcerer stood. Only its own spell, sent back, breaks its ward, and
each phase asks for a different way back. The Mirror scores its own orbs: they are `puzzleOnly`, so the
engine never does.

Two breaks per phase:
1. **Through your mouths.** From its perch (300) it casts at you (0.9 s tell). Set a mouth on the slate
   under the perch and one on a floor slate in front of you, and stand just behind it. The orb passes
   through the front mouth, comes out under the perch and rises into the Mirror. A counter alone sends
   the orb back too shallow to reach the perch; measured, it gave no breaks.
2. **Countered.** It comes down to the floor, keeps 280–420 away, and blinks away if you close in. It
   casts flat, twice (0.9 s apart, outside the Counter's 0.7 s cooldown). Counter an orb straight back
   into it. Your mouths are no use here, because the orb would come out under the empty perch.
3. **Both.** It goes back to the perch and lobs the orb high, so that it comes down on you. Counter it:
   a countered lob flies flat back, through the mouth in front of you, and up into the Mirror. With both
   mouths set but no counter, measured, there were no breaks, and the lobs hit you (5 hits).

A death reloads the stage. A finished phase is kept (`fws-mirror-1`, `-2`), and the retry checkpoint
is outside the gate.

## Verified (scripted input in the browser; not a human playthrough)
Chained, with the Muster on, from spawn to the end card ("THE FRACTURED EMBERDEEP"):
- the Glassworks bridge on the first try;
- the Gallery: 13 wall jumps, the band mouth at y 613, and the portcullis opens 2.9 s later;
- the Mirror in 40.7 s: I 15.8 s, II 9.7 s, III 15.2 s; 6 counters, 1 hit.

Each phase refuses the others' answers:
- phase I with counters only: no breaks;
- phase II with mouths only: no breaks;
- phase III with mouths only: no breaks.

Changed while verifying:
- bars narrower than the wall above them (all three echoes);
- the gallery wall was climbable to its top, so it could be climbed over (it is now wet above the band);
- a single jump from the floor reaches neither the chimney's nor the gallery wall's clingable face, so
  the climb starts with the double jump (a design fact, not a change);
- the far-bank checkpoint sat behind where you land off the bridge.

## Fractured Sorcerer refinement — 7.211.9 / cache v303
The thawed bridge outline draws in the world pass (gone platforms skip the shared platform
pass). Its frozen surface shows remaining hold time; visible conduits connect condensers to
the bridge and Gallery gate. Mirror cast light and projectile share one world-space origin;
charge follows each cast/twin duration, with distinct twin/lob cues and ward return marks.
Dead actors stop casting/scoring; reset clears Mirror orbs, queued dialogue and twin/timing
state and restores the retained phase's position. Phase changes discard old Mirror orbs but
preserve emitter bolts. Victory and completed saves leave glass fragments on the floor.
18 focused tests pass (Sorcerer, campaign order, player checkpoint). Browser position fixtures
used native portal input to feed the Glassworks, observed freezing and thawing, reviewed both
bridge renders and the native Mirror tell/cast. Death fixture cleared orbs and reset the fight;
completed-circuit reload restored floor fragments and open east gate. No runtime errors.
Geometry and attack/bridge timings retained. Full crossing, Gallery climb, all-phase boss win
and co-op were not repeated; historical construction runs below are not new evidence.
Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Emberdeep.

## Open
- Owner playtest: whether "the orb through the mouth in front of you" reads without a sign; whether
  phase III's rule (counter it into the mouth) is discoverable. Its tell is the lob coming down steeply,
  missing your front mouth.
- The Glassworks asks you to wait for the stream to establish itself (~3 s) before the first crossing.
