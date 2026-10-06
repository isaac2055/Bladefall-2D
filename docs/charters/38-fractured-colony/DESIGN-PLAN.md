# The Fractured Colony (stage 38), built 2026-09-25 (7.218.0)

## Second look — 7.220.3

Slam landing detection now remains armed during the entire descent, including repeated
launch heights. Focused regression tests cover both cases. A native-input Path fixture
registered two successive long slams from exactly the same height. No timing or geometry
retuning. See current brief for the second-look verification scope.

## Refinement — 7.220.2 (2026-09-25)

Detection meter uses actual Watch/yard catch thresholds. Dead players cannot activate the tap; dead actors stop attacks. Completed Ringer and freed chained remain visible. Retry clears transient bell/turn/health/slam state and dialogue. Bash throw disables jump cut. Detection render reviewed.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's eighteenth echo: the Colony after the Echo walked it backwards. The tents are empty and the lamps
still sweep for the people who left. The spring is dry, and the ringer still drives the chained.

**The kit** is the one the Colony was entered with: everything through the Chainhook. Nothing waits here; the
original granted nothing either.

**The Muster applies.**

**Code:** `public/bladefall-fractured-colony.js` and `-art.js`.
- **Stage and seams:** stage 38, zone `fractured-colony`. The seam `fs-fco` comes from the Shores; the east seam
  `fco-fp` opens once the Ringer is silenced.
- **Rest site:** `colony-ash` (The Cold Pit).
- **Music:** `fractured-the-waystation-refuge.mp3` on the road, and `fractured-village-vigil.mp3` for the Ringer
  (the original's "colony turned" cue).

**Engine parts reused:**
- the Chainhook and `actRing`;
- the downward strike, read from where the engine says it began (`p.slamFromY`), as at the Cliffs' windlass.

**Built here:** the lamps (tower beams), the tents and cisterns as cover, the tap and gate, the Ringer, and the
chained. The original's watch, spring and yard are all local to its region file.

**No shared changes.**

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Gate | 0–1200 | the gate, the sick woman | empty; the road in |
| The Watch | 1200–5000 | two towers' spotlights; a 0.85 s warning to reach cover, then a bell and two conscripts | three towers; each lamp sweeps ±600–650 on a 6.2–6.8 s swing, 180 wide. Nine empty tents are cover. Held in a lamp for 0.25 s and you're caught, back to the gate of the watch (cumulative; it drains at the same rate). Tent to tent: wait for the gap, then go |
| The Dry Spring | 5000–7350 | the conduit by two rings; the alms-bell lure; a slam on the King's tap; the bucket lifts the yard gate | two rings up to the conduit (440). Its lamp sweeps 5800–6760, stopping short of where you land. Two cisterns are cover. At the end, the tap: strike it from above and the yard gate lifts |
| The Ringer's echo | 7500–9500 | the Conscription Yard (hook the tower ring, strike the shielded ringer from behind, the chained sit down) | **the C-side** |

## The C-side: the Ringer's echo
The ringer stands on his tower platform (380), shield to whoever comes, turning to you 1.0 / 0.9 / 0.8 s late.
He bashes (0.45 s tell) anyone in front of him on the deck.

The tower's own rings (560) are out of reach from the ground, so you take an approach ring on either side (400)
first. From there, hook the tower ring on your side, then the one across, 110 over his head, and drop onto his
platform behind him. Strike his back before he turns (the pass takes ~0.5 s). He throws you off.

His lamp sweeps the yard. Held in it 0.3 s, he rings, and the four chained lunge along their chains (160 from
their posts). From the second act he rings every 5 s regardless, then every 4 s; in the third there are two
lamps. Two blows in each of three acts. Leaving the yard resets the fight; a finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("THE FRACTURED PATH") in 75 s: the Watch (tent to tent,
never caught), the Spring (the rings, the conduit, the tap), and the Ringer in 17 s.

Separately:

| Check | Result |
|---|---|
| The Watch, tent to tent, from three start times | 3/3, 23–27 s |
| The Watch, running straight through | caught 3 times each, never past ~4,700 |
| The Spring | 3/3 tapped; twice caught afterward, standing on the tap in the lamp (the gate had latched) |
| The Ringer, from three entry points | 3/3, 15–17 s, 0–2 hits |

Changed while verifying:
- **The Watch** first caught you after 0.6 s in a lamp, draining twice as fast out of it, on 4.4–5.4 s
  sweeps. A knight running straight through was never caught. It is now 0.25 s, drained at the same rate, on
  slower, wider sweeps.
- **The conduit's lamp** reached, and lingered at, the spot where you land off the rings. You were caught on
  landing.
- **The Ringer's rings** were first out of reach from the ground (at 560) and then 80 from him, just past a
  blade. There are now approach rings, and the tower's rings are 55 either side of him.

## Open
- Owner playtest: whether the beams read at a glance (amber, turning red while one holds you), whether tents
  read as cover without a sign, and whether the Ringer is too quick once the ring pattern is learned. The bot
  was never touched by the chained; the yard's lamp matters only to a knight who lingers on the ground.
- The original's rescue (Oren breaking shackles, the colony turning) and Sable's cure have no echo here.
