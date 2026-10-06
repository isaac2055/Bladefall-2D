# The Fractured Path (stage 39), built 2026-09-25 (7.219.0)

## Second look — 7.220.3

Slam landing detection now remains armed during the entire descent, including repeated
launch heights. Focused regression tests cover both cases. A native-input Path fixture
registered two successive long slams from exactly the same height. No timing or geometry
retuning. See current brief for the second-look verification scope.

## Refinement — 7.220.2 (2026-09-25)

Windlass shows remaining light/dark cycle and time before a turn slips. Dead players cannot turn it; retry clears keeper/slam/cooldown/dialogue state; completed keeper remains. Fixed missing phase on overlook beam producing NaN, breaking rendering and disabling its ring hazard. Native slam in a lit-window fixture advanced one turn; timing render reviewed.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's nineteenth echo: the Palace Path after the Echo walked it backwards. It is always noon on the climb
now. The mirrors have been turned to the road, and nobody carries canvas over anyone.

**The kit** is the one the Path was entered with: everything through the Chainhook. Nothing waits here; the
original granted nothing either.

**The Muster applies.**

**Code:** `public/bladefall-fractured-path.js` and `-art.js`.
- **Stage and seams:** stage 39, zone `fractured-path`. The seam `fco-fp` comes from the Colony; the east seam
  `fp-fpa` opens once the Sun Gate is up.
- **Rest site:** `path-ash` (The Noon Shade).
- **Music:** `fractured-towering-sea-cliffs.mp3` on the road, and `fractured-element.mp3` at the Sun Gate. "Element"
  was the Warden's supplied theme and was unused.

**Engine parts reused:**
- the Chainhook and `actRing`;
- the downward strike, read from where it began (`p.slamFromY`);
- coated riser walls.

**Built here:** the pools of sun, the shelters and the vents' smoke, the overlook's beam, the Sun Gate's windlass
and mirror, and its keeper. The original's mirrors and windlass are local to its region file.

**No shared changes.**

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| Noon Road | 0–2600 | the Smoke Line: one mirror's pool, shelters, vents | two mirrors' pools (110 wide) sliding ±480–700 on 6–7 s swings. Standing in one burns: 14, every 0.9 s. Four shelters are shade, and two vents' smoke is shade while it stands (2 s of every 4) |
| The Burning Stair | 2600–4760 | the Mirror Stair (five risers, two mirrors) | six risers of 110 (a double jump each, coated faces), two wider pools (170), and a shelter on every landing |
| The Overlook | 4960–6240 | the Hydra Overlook (1,300 of chasm, three rings) | 1,280 of chasm and three rings. A mirror's beam walks the rings, and a ring in it burns you while you hang. The last ring is 160 short of the far lip and 320 above it |
| The Sun Gate | 6600–8600 | the Sun Gate (a windlass slammed three times beside a shielded guard) | **the C-side** |

## The C-side: the Sun Gate
A windlass of black iron, a ring above it (400 over the apron), and a mirror that lights it 2.8 s of every 5.4.
- **Only lit:** the iron turns only while the sun is on it. Strike it from the ring above (drop out of the hang
  and bring the downward strike down on it) while it's lit.
- **Leave the light:** the iron throws you up and away, and the light on it burns whoever stands in it. From the
  last turn, the light covers ±260 around it.
- **Three turns** open the gate, one per strike, and each shows on the gate bars. A turn slips back if 7 s pass
  without the next.
- **The keeper** walks the apron, shield to you, and bashes (0.5 s tell) whoever stands near the windlass. He
  can't be put down, only kept away.

Leaving the apron resets the fight; turns already made are kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("FRACTURED PALACE") in 65 s:
- the road with no burns;
- the stair with 4 burns (the bot was topped up before the gate);
- the overlook;
- the gate in 16.5 s.

Separately:

| Check | Result |
|---|---|
| Noon Road, shade to shade, from three start times | 0 burns each |
| Noon Road, running straight through | 3 burns |
| The Burning Stair, landing shade to landing shade | 2 burns each |
| The Burning Stair, reckless | 2–4 burns |
| The Overlook | 6/6 across, 0 burns |
| The Sun Gate, from three start times | 3/3 open in 15–18 s. The bot took 4 burns each, as it lingers in the light after the throw |
| A strike on the windlass while dark | no turn |

A death reloads the stage at the last checkpoint with full blood, so burns wear you down rather than stop you.
There is a checkpoint mid-stair.

Changed while verifying:
- **The windlass** registered all three turns on one strike (the same strike was counted again next frame). It
  now takes one turn per strike, with a 0.6 s lockout.
- **The stair** first had shade on only half its landings. A careful climber waiting on an open landing burned
  more than a reckless one.
- **The stair's pools** were first 110 wide on 1,200-wide sweeps, and hardly ever found a climber.
- **The overlook's far lip** first sat 300–400 past the last ring. A jump out of a hang is a single jump from a
  standstill (the air jump is spent), and it carried ~206 before dropping 182. The last ring is now higher, and the
  lip nearer.

## Open
- Owner playtest: whether burns-as-attrition feels fair on the stair (a careful climb still costs ~2), whether
  "strike it lit, then leave the light" reads at the gate, and whether the keeper is more than an obstacle.
- The original's allies (the colony holding the guard; Oren breaking the anchors) have no echo here.
