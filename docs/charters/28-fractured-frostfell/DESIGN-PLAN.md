# The Fractured Frostfell (stage 28), built 2026-09-24 (7.208.0)

Act Three's eighth echo: Frostfell after the Echo walked it backwards. Frostfell is warm, which it
never was. Every hearth burns, no one tends them, and the ice they were lit against is going.

The kit is the one Frostfell was entered with: **jump, the Oathblade, the dash, the twin mouths, the
wall jump and the Counter**. **The double jump** waits in the frost memory, where it was
(session-only, `F.grant('double-jump')`). The original had no boss; the echo's C-side is a pattern boss
built on the Counter. The Muster applies.

**Code:** `public/bladefall-fractured-frostfell.js` and `-art.js`.
- Stage 28, zone `fractured-frostfell`.
- The seam `fw-ff` comes from the Warden, and the east seam opens once the Rimeguard kneels.
- Rest site: `refuge-ash`, a hearth that burns with no one beside it.
- Music: `fractured-hearthfire-in-the-frost.mp3` on the road. The fight uses
  `fractured-engine-of-the-frozen-garrison.mp3` (the Muster Engine's theme, walked backwards).

Engine parts reused as they are: the Counter (`tryPlayerCounter`: a 0.22 s window and a 0.7 s
cooldown; it reflects projectiles), ice friction (`ice:1`), timed spikes (`Sp`), `gone` plats, and
the Muster.

Built here, because the engine's counter only stuns and never opens a front shield:
- the tollmen's and the Rimeguard's guard, which only a countered thrust opens;
- the thaw (thin ice that gives way under a standing knight and freezes again).

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Toll | 0–1760 | one turnkey teaches the Counter | two tollmen, each with its back to the toll's bars and stone above them. Nothing reaches a tollman except its own spear: counter the thrust and it reels open (1.1 s) for one blow of the blade. The first takes 2 blows (0.6 s windup), the second 3 (0.45 s) |
| The Thaw Streets | 1760–4300 | ice streets with dry islands; Nim's warmth for grip | meltwater with no floor. Nine plates of thin ice (they crack after 0.5 s of standing and sink for 2.6 s) and two dry stones (a frostpike on one, a frostsinger on the other). Gaps are 100 (a running jump, 148, with room). Onto and off the ice, 175 and 235, takes the dash |
| The Frost Memory | 4300–5300 | the double jump (after the thermal works) | ↑ REMEMBER (the double jump); a rimehulk on the bank |
| The Frozen Stair | 5300–8100 | icy landings, rafts, fixed and timed spikes, dry rests, recovery shelves | nine landings over the void, with no shelves. Four rises (160–170) are made only by a double jump and a dash (191; jump and dash is 153). Ice landings give way after 0.9 s. Spikes stand up out of two landings (1.0 s in every 2.4), each two landings past a dry rest, so you time them from the dry stone |
| The Crown | 8100–9800 | the Muster Engine | **the C-side** |

## The C-side: the Rimeguard
The last of the garrison, its ice armour running with meltwater. Its guard cannot be broken. Only a
countered thrust opens it: it reels for 1.1 s and takes one blow. Two openings per phase, three phases:
1. **The drill:** one thrust (0.6 s windup).
2. **The feint:** three thrusts; the second is held (1.2 s against 0.62), so an early counter is
   speared. Only the last thrust's counter opens it; the earlier ones are only turned aside.
3. **The thaw:** three thrusts, the third held (1.1 s). Between combos it either sweeps low (a red edge,
   0.6 s tell) or throws three ice shards low along the floor. The Counter does not answer either one;
   you jump them, and the double jump clears a volley.

No two thrusts come closer than 0.8 s apart. The Counter's own cooldown is 0.7 s; the first draft's
feint had thrusts 0.63 s apart, and they could not be countered through. A death reloads the stage: a
finished phase is kept (`ff-rime-1`, `ff-rime-2`), and the retry checkpoint is outside the gate.

## Verified (scripted input in the browser; not a human playthrough)
Chained, with the Muster on, from spawn to the end card ("THE FRACTURED SORCERER"):
- the two tollmen: 7.1 and 6.2 s, no hits;
- the streets: 13 s, one fall near the frostpike;
- the memory: the double jump granted;
- the Stair: 17 hops including retries, 2 falls, 5 hits;
- the Rimeguard: 24 s, 14 counters, 6 openings, no hits.
- Separately, a death mid-fight respawned outside the gate with phase 2 kept and its openings reset.
- A counter pressed 0.3 s early is speared.

Timing windows:
- **the streets:** a jump lands from roughly the second half of a plate. At 130 gaps only the last
  ~20 units worked, so the gaps are now 100.
- **the Stair:** a bot that waited on a thawing landing for the next spikes lost the landing. The beat
  is taken from the dry landing two back.

Changed while verifying:
- the street gaps (130 → 100);
- the Rimeguard's combos (at 0.63 s apart they could not be countered);
- the Rimeguard now closes the distance while it winds up, so a countered thrust no longer pushes the
  next one out of reach.

Found later (7.209): the toll's bars (26 wide) stood under stone 44 wide. A knight pressed against the bars stood
inside the stone's width, and a jump and a dash carried the knight up through it and past the toll (measured: down at
x 1033, past bars at 900). The bars are now as wide as the stone. The bot runs above had fought the tollmen and
never tried it.

## Fractured Frostfell refinement — 7.211.8 / cache v302
Spear cues use each actual windup duration: a held thrust stays blue until the final .22 s,
with a filling shaft line and combo notches distinguishing the guard-opening final thrust.
Reels show their remaining opening, sweeps their floor reach/clearance, and shards their
remaining count. Thin ice loses its bright edge as it weakens; a sunk plate now has a
refreezing outline drawn outside the shared platform pass. Geometry and timings retained.
Dead guards/players stop attack progression, dead players cannot claim the memory or toll,
and death/victory clears remaining low attacks. Completed saves restore the kneeling Rimeguard.
19 focused tests pass (Frostfell, campaign order, player checkpoint). Browser position/timing
fixtures with native inputs verified counter-and-blade damage on a tollman, held second and
final Rimeguard counters (only the last opens the guard; no damage), and ice collapse/return.
Completed-circuit reload restores kneeling armour, lowered guard and open east gate.
Spear, held-beat, weakening ice and refreeze renders inspected; no runtime errors.
No new full traversal, complete boss fight, timed Stair run or co-op verification is claimed;
historical construction runs were not repeated. Local mirror rebuilt; no commit/push/deploy.
Next refinement: Fractured Sorcerer.

## Open
- Owner playtest: whether the held thrust reads as "wait" (its shaft fills blue until the final counter beat); whether the
  counter window (0.22 s) is fair against the Rimeguard's windup tells.
- The streets' dry stones carry Muster bodies (frostpike 127 HP, frostsinger 110 HP), and a knight
  fighting on a 150-wide stone next to thin ice is a hard ask. It was bot-verified only by passing them.
