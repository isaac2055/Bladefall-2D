# L02 — Black Woods implementation charter

Status: single-player planning, geometry, content, and automated runtime
validation complete; refreshed human visual/playthrough review pending.

## Purpose

Black Woods applies the lessons established by the authored Outskirts opening.
It is a place with a readable rhythm, not an obstacle sampler. The player enters
unarmed, receives information one landmark at a time, permanently recovers the
Oathblade, and then learns to combine ordinary jumping with combat. No portal,
wall-jump, dash, or gravity-flip ability is required before its constitutional
unlock.

The forest has one governing visual rule: both honest footing and copied footing
carry warm resin, but honest resin faces the visible wind while copied resin sits
on the sheltered edge. Two animated streamers reverse the wind mid-room, so the
player must apply the rule rather than memorize one side. False commitments teach
it through recoverable falls onto a continuous lower trail. The level ends through
a physical root tunnel into Broken Causeway and remains walkable in both directions.

Target pacing is 22–30 minutes for a first run and 5–7 minutes for a practiced
line. The assembled stage is 12,400 px long.

## Room plan

| Room | Span | Primary purpose | Optional layer | Recovery |
| --- | ---: | --- | --- | --- |
| **Mothlight Refuge** | 0–2,400 | A quiet arrival with Orra, Ethereal Goods, the shelter, Pell, and Hale each owning a discrete stretch. | Clock clue, ordinary resin explanation, trade, and revisit dialogue. | Continuous ground, checkpoint, and no enemies or ecology filler. |
| **Oathblade Clearing** | 2,400–4,200 | The first weapon receives a dedicated landmark and pause; one isolated guard teaches approach, swing, recoil, and pursuit. | None before the duel, preserving the acquisition beat. | Continuous ground and checkpoint before acquisition. |
| **Biting Canopy** | 4,200–6,700 | Eight single-jump surfaces rise in 65 px steps over three timed thorn windows while two authored enemies use the terrain. | Red-clasp memory and a visibly bruised root seam for a later dash return. | Continuous ground under the entire route; missed jumps never reset the room. |
| **Mirror Thicket** | 6,700–9,700 | Irregular truth and copy branches teach windward versus sheltered resin; consecutive truths/copies prevent an alternating answer pattern. | Bram and the called-name clue; a high cache on the successful line. | Every false surface dissolves onto the same broad lower trail without an arcade label. |
| **Rootbound Passage** | 9,700–12,400 | A genuine east staircase makes the root wall reversible, then eight elevated steps form a safe combat route over four timed root-thorn beds. | Coin and weapon rewards sit directly on the authored high route. | A fall reaches a survivable timed ground route; the high checkpoint and physical tunnel prevent repetition or softlock. |

## People and narrative

- **Orra, Clock Keeper** reports the same saved minute as the Outskirts field
  clock. A westward return advances it from 3:40 to 3:41, then one minute per
  later crossing, making slow clock drift a consistent world motif.
- **Pell, Resin Worker** explains the amber edge as forest craft, making the
  platform grammar concrete rather than cryptic.
- **Hale, Quiet Veteran** points toward the abandoned blade before its recovery,
  then acknowledges the sword and gives practical handling advice afterward.
- **Bram** waits immediately before the first consequential copied route. He is
  useful context, not a progression requirement.
- The optional red-clasp memory and called-name intrusion remain restrained,
  initially ambiguous correspondences.
- All first readings use the same compact world-anchored annotation system as
  Level 1. Leaving its radius clears it; returning and pressing Up replays text
  without replaying rewards or persistence mutations.

## Progression and encounter rules

- The stage loads with jump only and no usable weapon memory.
- Touching the authored Oathblade at x=2,800 permanently grants `weapon`, equips
  the recovered sword, removes the pickup, and activates all eight authored
  Black Woods encounters.
- The Mothlight Refuge has zero enemies. Generic ecology seeding and random elite
  promotion are disabled for this stage.
- Every ordinary enemy has a bounded patrol, notice range, and explicit room
  role. The first guard is isolated so weapon learning is not buried under a mob.
- Those roles own distinct commitment loops rather than falling back to generic
  pursuit: the Oathblade guard salutes and lunges; canopy and tunnel controllers
  mark root eruptions; canopy and mirror divers mark their descent; the mirror
  pursuer investigates a copied ledge collapsing; the root stalker veils before
  striking; and the root guard braces before a deliberately open recovery.
  Awareness moves through suspicious, alert, and search states using facing,
  peripheral vision, a full-length visible cone, and remembered disturbance
  positions. Alert enemies may chase beyond their small patrol strip while their
  larger authored room leash still prevents suicidal pit falls. Contact damage is active
  only during a committed lunge or dive, never merely because a role is awake.
- The mandatory canopy ascent uses no rise above 65 px. Upward gaps are at most
  75 px and continuous recovery ground remains beneath it.
- The later dash seam is visible on the first visit but cannot award its key
  until the player returns with the correct permanent capability.
- The east and west boundaries use physical, reciprocal world connectors. The
  stage owns no completion portal or portal-placement lesson.

## Acceptance evidence

The current runtime validator is
[`evidence/validation/receipt.json`](./evidence/validation/receipt.json). It loads
the actual browser game and proves:

1. the five-room, 12,400 px, portal-free production contract;
2. three refuge residents and zero refuge enemies;
3. compact anchored dialogue deliberately opened with Up and expiring by distance;
4. weaponless entry, Oathblade acquisition, permanent memory, and encounter wake;
5. all eight authored enemies leaving patrol for their role-specific live state
   machines after perceiving the player;
6. the live single-jump canopy geometry and recovery floor;
7. a copied branch dissolving into a safe retry state;
8. a visible, eligible physical root-tunnel exit; and
9. reduced-motion camera behavior with no page errors.

Existing room stills in [`evidence/visual`](./evidence/visual) predate the windward
resin and Rootbound revision and therefore remain historical evidence only. A new
human visual/playthrough pass is still required before those visuals can be used
as acceptance evidence for this revision.

## Review boundary

This charter covers the requested single-player Level 2 update. Live co-op
behavior is deliberately outside this pass. Long-form player pacing, subjective
difficulty, and narrative taste remain appropriate playtest feedback, but the
implemented route no longer depends on the discarded prototype mechanics.
