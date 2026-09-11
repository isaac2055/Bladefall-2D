# L01-P2 — The Outskirts level-production charter

Status: geometry and content implemented in 7.50.0; automated acceptance complete;
human visual/playthrough review remains open.

## Full-success promise

The Outskirts is the slow awakening Bladefall previously lacked. The knight
wakes unarmed at a distorted camp perimeter with exactly one permanent ability:
jump. A first-time player spends roughly 25–32 minutes learning the feel and
limits of that jump, reading safe recovery, avoiding enemies they cannot yet
fight, meeting Mara, and walking into Black Woods through a physical tunnel.
A practiced player retains a deterministic 5–8 minute line.

The level must never feel like a tutorial sampler. Dash, wall-jump, double-jump,
portals, gravity flip, weapons, Crites, tools, and followers are unavailable.
Several of them are deliberately foreshadowed by readable places the player can
see but cannot yet use. Every such place remains reachable on a later visit and
none is required for the first exit.

## Superseded implementation

The 7,700-unit Outskirts shell is not the target. It teaches crystals, moving
platforms, wall-jumps, fire airflow, portal placement, and a speed-gated fling;
it also places generic weapons before the weapon memory and exits through a
level portal. Those decisions predate the N01–N16 progression foundation and
are retired rather than preserved for compatibility.

Reusable material is limited to the camp-edge visual motifs, Mara, the warm-ash
and first-draught clues, stable collision primitives, checkpoints, persistent
zone entities, and the existing world-streaming adapter. Old gameplay geometry
does not receive automatic grandfathering.

## Spatial charter

| Owner | Span | Place and dramatic job | Fresh-route requirement | Later return promise | Recovery |
| --- | ---: | --- | --- | --- | --- |
| `outskirts:01` | 0–1,800 | **Poisoned Verge.** The knight wakes beneath predawn canvas and white trumpet silhouettes. Wide banks establish walk, one jump, variable jump height, and deliberate landing without signs explaining the fiction. | Cross three increasingly exact but nonlethal gaps. | A high shelf behind the tent hints at double-jump and holds the optional First Draught memory. | Every miss lands on a lower shelf or rolls back to the waking bank. No enemies. |
| `outskirts:02` | 1,800–3,900 | **Camp Echo.** Warm ash, broken bedrolls, a stopped field clock, and distant soldier-like silhouettes make the place inhabited and wrong. The first enemy patrol turns locomotion into avoidance. | Read its patrol, use terrain and shelter, and pass without combat. | A weapon-marked vigil reveals the Sentinel chamber and Vault Key silhouette. | Broad hiding alcoves and a checkpoint before the patrol; contact never pins the player between bodies. |
| `outskirts:03` | 3,900–6,200 | **Watcher’s Cut.** Two single-jump routes cross one broken observation trench: the low route has patient moving hazards; the upper route demands precise landings on fixed masonry. | Choose either honest route and rejoin at Mara’s post. | Dash and wall-jump silhouettes lead to distinct sealed overlooks without contaminating the fresh route. | Both routes fall to a stable common floor and can be walked backward. |
| `outskirts:04` | 6,200–8,500 | **Hollow Mile.** A longer pursuit landscape uses sightlines, grass shelves, fallen shields, and two enemy roles. The player learns to create distance rather than rush every screen. | Evade the muster patrol and reach the milestone refuge. | Defeating the patrol later yields salvage and opens a compact correspondence cache. | Enemies turn at lethal outer pits; internal ledges remain chaseable. Refuge checkpoint divides the sequence. |
| `outskirts:05` | 8,500–10,700 | **Broken Muster.** Mara’s request pays off across the level: three permanent survey bearings, each visible from a different route, reconstruct where the road once led. The final iron bearing lies just east of Mara, so completion asks for one short, legible backtrack rather than an immediate handoff. | Reading bearings is optional; the main road stays open. Helping Mara requires all three and a return conversation. | Completed bearings mark the western wall-jump breach on the map without opening it. | Every bearing stands on stable ground; no timed reset or consumable state. |
| `outskirts:06` | 10,700–13,000 | **Mothlight Descent.** The open sky narrows into a root-and-stone tunnel whose far light belongs to Black Woods. A final jump synthesis uses only known distances and changing headroom. | Walk through the tunnel seam; no completion portal or confirmation prompt. | The same tunnel streams both directions. The west edge of Room 1 later connects to the Warden route after wall-jump. | Entrance checkpoint, reversible slopes, no one-way drop, and safe streamed arrival in both zones. |

## Progression and equipment contract

- Fresh capabilities are exactly `jump`; the level neither grants nor simulates
  another permanent ability.
- The player begins and ends the level weaponless. Generic weapon/armor drops,
  power-up blocks, Crites, combat quests, and mandatory kills are forbidden.
- Ordinary enemies exist as spatial pressure, with routes that permit clean
  avoidance. Completion may later count defeating them after the player returns
  armed; first-time level completion cannot require it.
- The Sentinel is a persistent, clearly superior optional enemy. It stays behind
  a weapon-readable threshold while unarmed. Defeating it on a return visit is
  the exact `defeat-sentinel` evidence for the Sentinel Vault Key.
- The sole ordinary coin is obtainable with jump on the fresh route. The First
  Draught memory and later-ability caches are separate optional objectives.

## Story, NPC, and ecology contract

- Mara remains the level’s only quest-giver. Her survey task spans three rooms
  and teaches that backtracking is normal.
- One huddled survivor at the warm ash and one watch keeper at Mara’s rejoin may
  provide optional observations. They have distinct silhouettes, names, and
  persistent dialogue; neither follows the player or becomes a shop.
- The field clock first reads `3:40`, the first of the three repeated time clues.
  Each physical return from Black Woods advances the shared opening clock by one
  minute; every clock keeper and clock display reads the same saved value.
- White trumpet flowers are visible and unnamed. The First Draught memory shows
  a tin cup, gloved hand, tent edge, and painful light without naming Datura,
  poison, hallucination, or dream.
- Enemy placement follows habitat and patrol logic: camp sentry, trench watcher,
  and muster pair. Peripheral sight creates suspicion, clear cone sight creates
  alert pursuit, and the patrol remembers the last seen position before searching.
  Pursuit may leave the tiny patrol strip but remains bounded away from lethal pits.
- World annotations identify their source through presentation: people speak in
  tailed bubbles, signs use inset timber plaques, survey markers use compact teal
  plates, memories use restrained violet text, and objects use a neutral card.

## Route matrix

| Route | Required evidence |
| --- | --- |
| Fresh | New save; only jump; no weapon pickup; all six rooms crossed; Black Woods streamed through the east tunnel; no test mutation or death softlock. |
| Revisit | Walk from Black Woods back into Mothlight Descent; persistent clues and bearings do not duplicate; both world seams remain honest. |
| Optional/100% | Coin, First Draught memory, Mara’s three bearings, all ordinary enemies after returning armed, and Sentinel Key recovery are all independently recoverable. |
| Speedrun | Deterministic physical line under eight minutes; no forced dialogue, random mover wait, mandatory collectible, or level-transition prompt. |

## Production passes

1. `L01-P2` — this survey and charter; retire the obsolete portal-sampler plan.
2. `L01-G1` — replace the shell with six room-owned, 13,000-unit jump geometry.
3. `L01-G2` — implement east/west physical seams, backtracking, checkpoints,
   later-ability overlooks, and Sentinel chamber topology.
4. `L01-E` — author weaponless patrol encounters, avoidance readability, ecology,
   and post-weapon return behavior.
5. `L01-C` — rebuild Mara’s survey, residents, clock, flowers, memory, coin,
   persistence, and secret reward.
6. `L01-A` — environment art, lighting, landmarks, audio layers, camera framing,
   accessibility, and performance budgets.
7. `L01-V` — fresh/revisit/optional/speedrun route recordings, failure recovery,
   room stills, visual inspection, full regression, and packaged-deploy parity.

## Planning acceptance

`L01-P2` closes only when code and tests agree that Outskirts is 13,000 units,
contains six named rooms, owns no portal verb or generic composition, starts
weaponless with jump alone, has four single-player route contracts, and leaves
geometry/content phases open. No old evidence receipt may be cited as proof of
the new geometry.
