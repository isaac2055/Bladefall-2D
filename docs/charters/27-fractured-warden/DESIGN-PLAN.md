# The Fractured Warden (stage 27), built 2026-09-24 (7.207.0)

Act Three's seventh echo: the Warden's Gaol after the Echo walked it backwards. The Gaol was walked
east to west, so the echo runs west to east, toward the Sentence Well. Every lamp is lit and no one is
in the cells. The kit is the one the Gaol was entered with: **jump, the Oathblade, the dash, the twin
mouths (portal key on slate) and the wall jump**. The Counter was the Warden's gift, so it is not
here. The Muster applies.

**Code:** `public/bladefall-fractured-warden.js` and `-art.js`. Stage 27, zone `fractured-warden`. The
seam `fk-fw` comes from the Keep. The rest site is `vigil-ash` (the vigil fire, cold). The east seam
opens once the Sentence is sentenced. Music: `fractured-iron-gavel-descent.mp3` on the road, and
`fractured-sentence-of-the-shield-warden.mp3` during the fight.

Engine parts reused as they are: the turnkey and gaol-hound AI (`wardenRole`: guard, windup, lunge, then
a recovery with the shield still forward), front shields, lowg fields, rotors, moving platforms, slate,
the player's pair, and `ceilingOnly` roofs. Re-implemented here because the originals are
stage-6-only: mouths riding a moving support (`carryMouths`), and the boss.

Renderer change (shared, two lines): `rotor` and `lowg` now ask the region's art first
(`if(o.actArt && ext('object', o)) break;`), as `updraft` already did.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Blind Gallery | 0–3640 | turnkeys on rails, where shield facing is taught by bodies | dark: the only lights are yours and the turnkeys' lanterns, and the hounds show only their eyes. There are three bays under a roof at 76. Under it a jump peaks at 36 (measured), and a turnkey is 38 tall. Each bay is shut by bars under stone and its turnkey carries the keys, so the bars lift when it falls. Dash through the lunge and strike its back while it recovers. Two strikes per turnkey (HP 110; the Oathblade hits ~63 here) |
| The Hush Engine | 3640–5620 | a lightened climb to two flywheel brakes over a service floor | thin air (×.35, two circles) over the **void**, with five ledges to a doorway at 700 in the Engine's wall. Three bars turn in the air and none has a brake. Each hub sits off its hop's arc, so only the bar's tip crosses the float |
| The Turning Cell | 5620–6800 | a wall shaft, a cage past an offset bar, and a high/low pair | the door is at 800. Set a mouth on the cage (it rides with the cage) and one on the floor slate under the perch's east edge. From the perch (480), fall into the floor mouth while the cage is high, rise out of the cage mouth and drift onto the lip |
| The Red Court | 6800–8000 | Enna's vigil | the vigil fire, cold; one cell-shadow |
| The Sentence Well | 8000–9000 | the Warden: a front shield, struck only through a portal flank | **the C-side** |

## The C-side: the Sentence Well
THE SENTENCE is a warden's armour with no one inside and a shield the height of a door, always turned
toward you (it turns after 0.45 s). Only the blade counts: the dash's fire echo, passing behind it,
once counted as a strike.

1. **The rush** (three marks). It crouches (0.55 s), then rushes at 500 to where you stood and 60
   beyond. Dash through it (the dash's i-frames) and strike its back while it recovers (1.1 s, shield
   still forward). Up close it slams, and you jump the slam.
2. **The sentence** (three crashes). It pronounces sentence: a ring of shields turns about it, and it
   rushes wall to wall at 560 for three legs, then winds. Every blow clangs. Only its own rush reaches
   it: set your mouths on two of the three floor slates. When its rush crosses one, it is thrown out
   of the other and lands on its back. Strike it there (open from every side for 2 s). Each throw
   spends the pair.

A death reloads the stage. A finished rush phase is kept (`fwd-rush`) and the sentence's count starts
again. The retry checkpoint is outside the gate, and the fight starts when you walk in.

## Verified (scripted input in the browser; not a human playthrough)
Chained, with the Muster on, from spawn to the end card ("THE FRACTURED FROSTFELL"):
- the three bays: 6–7 s each, no hits;
- the Engine: 21 hops including retries, 5 bar hits;
- the Cell: first try;
- all eight checkpoints;
- a death mid-sentence: respawned outside the gate with the Sentence waiting, marks kept, crashes reset;
- the Sentence: phase 1 in ~11 s (three back-strikes, no hits); phase 2 in ~14 s (three throws, 5 hits
  from the bot dashing late).

Measured windows:
- **the Engine's hops**, sweeping the start time: two hops are free, one is free except at one start
  time, and the others land from 13/16, 11/16 and 7/16 of start times;
- **the Cell**: the rise lands when the cage is above ~345 (about 28% of its 5.2 s ride);
- **no bypass**: the best jump and two dashes off the Engine's deck, at 715 or higher, is 183 short of
  the lip. Jump and dash top out at 633 from the perch and 573 from the cage.

Changed while verifying:
- the first draft's cell wall had no door, and its Engine had floor under it (optional);
- the Gallery roof was 80 (a jump peaked at 40, over a turnkey's 38);
- a turnkey fell to one strike (48 HP);
- the thin-air circle did not reach the lip, so the first hop was a normal jump into the void;
- two bars' hubs sat on their hops' arcs, leaving no window at all;
- the step up to the cage was out of reach;
- the door was first at 840 (unreachable: the fall-speed cap limits the rise), then at 720 (a 43%
  window);
- the rush ran a fixed time, so after a dash-through it was ~180 away when it recovered;
- the dash's fire echo counted as a back-strike;
- the retry checkpoint was inside the well, so a respawn started the fight on top of you.

Found later (7.209): the bays' bars (26 wide) stood under stone 44 wide, the pattern that let a jump and a dash
rise through the Frostfell Toll's stone. Here the roof at 76 stopped any rise, but the bars are now as wide as the
stone anyway.

## Fractured Warden refinement — 7.211.7 / cache v301
Gallery lanterns mark a turnkey's committed lunge and exposed recovery side. The cage has
an upper-height band and current-height pointer; its mouth attachment survives JSON hydration.
Sentence cues show the slam's actual reach, the rush's committed destination, and the floor
slates during pronunciation. Portal capture requires a floor pair physically inside the well.
Death clears transient hit/throw/slam state and preserves only a completed rush phase;
completed saves retain the empty armour with its shield lowered. Geometry and timings retained.
20 focused tests pass (Warden, campaign order, and the actual player-checkpoint.test.mjs).
Audit correction: the original 13-test command named a nonexistent checkpoint-flags file;
those 13 results covered Warden/order only. Two added tests cover completed armour and
slam cue dimensions across zoom levels. Browser recheck verified a native jump avoids the
slam, death clears throw/hit/AOE transients but keeps the finished rush phase, and a
completed-circuit reload restores lowered armour and an open east gate. The save fixture
seeded completion circuits; it did not win the fight.
Browser position/phase fixtures used native portal input: a cage mouth rode through JSON
hydration, and a well pair caught the Sentence's native charge and threw it. Cage and rush
renders reviewed; no runtime errors. Full traversal, full fight, timed Cell exit and co-op
were not repeated. Historical construction evidence below is not evidence from this pass.
Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Frostfell.

## Open
- Owner playtest: whether the Gallery's dark reads (lantern radius 150, yours 230); whether "set your
  mouths in its path" is discoverable without a sign; the pronunciation now highlights the three floor slates alongside the shield ring and clang.
- The Engine's void and bars together may be the hardest non-C-side stretch in Act Three so far.
