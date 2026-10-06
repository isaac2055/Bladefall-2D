# The Fractured Colossus (stage 31), built 2026-09-25 (7.211.0 registered; finished 7.211.11)

Act Three's eleventh echo: the Foundry after the Echo walked it backwards. The great machine stands where
it fell, and it is warm. Stone you set here does not stay set for long.

**The kit** is the one the Foundry was entered with: jump, the Oathblade, the dash, the twin mouths, the
wall jump, the Counter, the double jump, Attunement and Companion Command.

**The downward strike** waits at the anvil, where it did (`F.grant('downward-strike')`).

**The Muster applies.**

**Code:** `public/bladefall-fractured-colossus.js` and `-art.js`.
- **Stage and seams:** stage 31, zone `fractured-colossus`. The seam `fe-fcl` comes from Emberdeep; the
  east seam `fcl-fi` opens once the machine kneels.
- **Rest site:** `crucible-ash`.
- **Music:** `fractured-the-obsidian-foundry.mp3` on the road, and `fractured-forge-of-the-molten-colossus.mp3`
  for the Warm Machine.

**Engine parts reused:**
- heat moulds (`heatCycle`), which run only while the stage is inside `V4_LAST_STAGE`;
- the downward strike: `slamImpact` sets a mould that is struck while glass (`setHeatStone`).

**Built here, because the Foundry's own parts are stage-10-only:**
- the ladles, the casting bed and the boss;
- the warmth (set stone on the machine's bed warms back after 6 s; the road's moulds you keep);
- the shaft's lava and the valve;
- the machine.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Receiving Floor | 0–1300 | the belt, Oren | a cinderling; the forge warm again |
| The Anvil | 1300–2400 | the anvil (downward strike), a mould and its gate | the same: touch the anvil for the strike. Its mould sits on an iron pedestal (stand on it, never jump at it from under). Strike it while it is glass and the bars lift |
| The Casting Line | 2400–3760 | moulds between belts, a ladle | six moulds over the void, each solid 30% of 3.6 s and half a cycle from its neighbours, so no two neighbours are ever solid together. Land on one in its glass with the downward strike and it sets; wait on it for the next. Gaps are 90: a standing jump from a mould only just reached a 120 gap's edge, too late to strike down on it |
| The Shaft | 3760–6800 | the act-2 shaft: rising lava, moulds, the shutter, the valve | a wet chimney (no wall jumps) and eleven moulds 90 apart, alternating sides, each set as you reach it, with the lava rising behind you at 40/s. On the beat you climb 90 every 1.8 s (50/s), so it only catches you on a missed window. At the top, strike the valve: the lava drains and the gantry's bars lift. Those bars run full height |
| The Warm Machine | 6800–7900 | the Molten Colossus | **the C-side** |

## The C-side: the Warm Machine
Two marks in each of three acts.

1. **Refuse the pour.** It pours into the bay nearest you, after a 1.5 s gather with its ladle over the
   bay. Strike that bay's mould while it is glass before the metal comes, and the pour is refused; the
   refusal is the blow. Set stone on its bed warms back after 6 s, and a refused pour breaks it.
2. **Counter the slug.** It throws slugs, in singles and pairs 0.9 s apart. Counter one and it flies
   home into its core. A countered slug is given a fresh life: it had ~1.6 s of 4 left for a 2.4 s
   flight.
3. **Strike from above.** It lowers its gantry: two steps of 120 and a deck at 360 that ends short of
   its head. Its arm sweeps the deck (0.7 s tell; jump it). Jump off the deck's end and bring the
   downward strike down on its head, begun at least 150 over it. It throws you nearly straight up, back
   onto the deck, for the second.

A fall into the bed rewinds you outside the gate, so the fight starts again when you walk back in. A
finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("THE FRACTURED INVERSION") in 98 s:
- the anvil's strike and its mould on the first try;
- the Casting Line;
- the Shaft and the valve on the first try;
- the Warm Machine in 25.9 s.

Separately:

| Section | Result |
|---|---|
| Casting Line | 3/3, all six set |
| Shaft | 3/3, all eleven set, lava 400 below at the top |
| Warm Machine | 3/3, 26–30 s |
| Plain chimney climb (before the rework) | 4.4 s by wall jumps; nothing behind it mattered |

Changed while verifying:
- **Anvil mould:** first floated over open floor, where a jump from under it hit its underside.
- **Casting Line:** gaps 120 → 90.
- **Shaft:** first a plain chimney with spouts, which was unavoidable or else trivial; then rises of 110,
  which a double jump barely reached; lava 70 → 40.
- **Gantry:** a rise of 140, too close to a double jump's 147. The first step stood against the gate, so
  it could only be jumped at from under. The deck ran out over the head, so strikes landed on the deck.
- **Strike height:** 230 → 150.
- **Arm sweep:** began level with the deck's end, and cancelled the strike.
- **The bounce:** `p.vy` is positive-down in this engine, so a +900 "bounce" drove the knight into the
  floor, and releasing jump cut the throw (`jumpCutOk`).
- **Head-strike scoring:** once lost to a trailing comment (the `mark()` call sat inside it).

## Fractured Colossus refinement — 7.220.1 / cache v315
Construction was complete before this pass; all twenty echoes are now built. The targeted
pour bay shows its actual splash width/height, remaining gather time and a plumb line; the
cue turns blue when its mould is set. These cues draw independently of hull visibility.
Glass moulds show the remaining setting window; machine-bed stone shows its six-second
lifetime. Molten moulds remain visible via the world pass. Slug charge, gantry sweep direction
and head-strike height cues are added. Geometry and timing windows retained.
Dead actors stop scoring/attacking; dead players cannot claim the anvil/valve. Retry clears
slugs, AOE, aim, queued dialogue, volley and slam-origin state while preserving the act.
Act transitions clear old slugs. Completed saves retain the kneeling hull. Local machine
knockback now uses negative-up player velocity and disables jump-cut on the throw.
19 focused tests pass (Colossus, campaign order, player checkpoint). Browser position/clock/
phase fixtures with native slam input set the anvil mould, refused one pour and scored one
head strike. The pour fixture explicitly cleared the strike cooldown; head-strike scoring
was checked, not successful recovery onto the deck. Death cleared hazards and marks;
completed-circuit reload restored kneeling hull/open exit. Pour and completed-pose renders
reviewed; no runtime errors. Full Casting Line/Shaft traversal, complete fight and co-op
were not repeated. Historical construction runs remain historical evidence.
Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Inversion.

## Open
- Owner playtest: whether "strike the bay it's about to pour into" reads (the ladle over the bay is the
  tell); whether the head strike reads (the deck ending short of its head is the cue).
- From the arena's west end the machine's body is off-screen; its arm reaching over the bed is what you
  see. A camera lean may help.
- Local machine knockback corrected in7.220.1 to negative-up velocity; earlier echoes were not changed.
