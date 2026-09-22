# The Drowned Throne (stage 13) — authored 2026-09-20

The last procedural region on the critical path. Walked **WEST to EAST**: you arrive at
x 240 through the Throne Gate and leave by the rail head behind the throne at 12240.
**12,400 long, and a two-boss level.**

| Room | Span | What it is |
| --- | --- | --- |
| 1 · The Drowned Stair | 0–2400 | Arrival, rest, one stele. A wall-face climb and a timed tooth before anything asks for a puzzle. |
| 2 · The Two Marks | 2400–4800 | **The King's own sentence, tried once.** |
| 3 · The Right Hand | 4800–7000 | The Void Tyrant, alive, between his own two faces. |
| 4 · The Long Drowning | 7000–9700 | Lethal floor crossed on a portal pair, a shielded body in the doorway, a wall climb out. |
| 5 · The Throne | 9650–12400 | The echo arena, the recollection, the rail head. |

## Room 2 is the boss mechanic, asked before the boss

The King is beaten by **splitting one path into two bodies** and standing both of them on
two crown sigils at the same moment. There is no echo until the fight, so the room asks
the identical question with the only other second body the knight owns: **Oren**. Two
plates 660 apart — further than one body can span — and the door answers only while
**both** are weighed. `circuitOpen('throne-marks')` is the AND.

Verified: shut at start, one mark alone does not open it, both together do.

## Numbers that are load-bearing

- **`setupKingBoss` culls every authored object whose CENTRE falls inside
  `bossX-1350 .. bossX+300`** and pushes its own arena floor across 9650–11350. A room-5
  floor centred inside that band is deleted outright — which is how the recollection and
  the rail head ended up standing on nothing on the first pass. Room 4's floor runs to
  **9700** (not the room line at 9600) to close the arena's west lip, and room 5's picks
  up at **11340**, east of the cull.
- The Right Hand's arena reuses the Citadel's geometry exactly: two slate faces **1,100
  apart**, the same separation his band fight used.
- **A boss-type row in a level's `enemies:` list does not survive the build pass.** The
  stage's own boss is installed separately and the authored row is dropped, so the hall's
  second boss is pushed in from the level's `build()` hook instead — which is also where
  his fight is configured. Authored as `{t:'tyrant',…}` in `enemies:` he simply never
  appeared, with no error. `tests/abyss-king-stage.test.mjs` now *runs* `build()` against
  a stub world and asserts the installed body, rather than reading the source text.
- **`spawnEnemy` already ends with `G.enemies.push(e)`.** Pushing the returned body again
  put the SAME object in the list twice: it updated and drew twice and took double damage
  from one swing. It only showed once the hall woke him, because `activateZonePersistence`
  matches ONE record per manifest id and removed just one of the two. `spawnEnemy` also
  does `if(e.boss)G.boss=e`, so he is transiently `G.boss` until `setupKingBoss` claims it.
- **The campaign blueprint is part of the level.** `abyss-king` still declared
  `source:'procedural'` with the generator's three act names and
  `cadence:{adds:3,foes:['shadeling','stormmote','sporecaster']}` — which was live, and
  dropped a shadeling at 5900 *inside the Right Hand's arena*, a stormmote at 8840 and a
  sporecaster at 1460 into the authored region. Authoring a stage is not finished until
  its blueprint stops describing the generated one.
- The `{type:'pit', x:(len+ext)/2, w:len+ext+2000}` that appears in this level (x 6200,
  w 14400) is **not** a hazard and not specific to this region: `buildCustomLevel` pushes
  one into every authored level. Ruined Keep, the Inversion and the Citadel all carry one.

## The Right Hand (built 7.141.0)

He lost the Citadel to an opposed pair held at a matched height, so he does not walk back
into that: **the band puzzle is gone and the faces are his now.**

- **He crosses the hall by his own seam**, marked on the floor for 0.8 s before he takes
  it — so it is a place you can be waiting at rather than a coin toss.
- **A mouth you leave sitting longer than six seconds, he TURNS.** Never deletes: the
  answer is to spend a pair before he reaches it, which is the exact opposite of the
  fight he lost, where taking your time to align was the whole skill.
- **Steel does nothing while he stands.** He is open for a moment at *each end* of a
  seam, and whenever a shot of his own is sent back into him. Three of those and he is
  finished — and **the King spends him**, from the throne, without standing up. The
  hall's road east (`throne-hand`) opens on the same beat.

Verified in the engine: six melee hits of 60 while he stands move his health **not at
all**; four seams marked with eight open windows and 246 frames of warning ring across
15 s; an open melee hit, a slam and a reflected shot are one knee each, and the third
ends him and opens the road.

The fuller moveset in `TYRANT-AS-GUARD-PROPOSAL.md` — him opening pairs you can steal
mid-transit, and Oren holding a face open — is still the next step; this is its spine.
