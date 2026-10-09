# Room Bank — batch 02

> Historical build record. User review has since banked b11 (after repair), b12, b14, b15, f12, f14 and f15. B13, f11 and f13 were revised for another review. See [batch 03](BATCH-03.md) for the current bank and review queue.

**7.287.0 · 2026-10-07 · five new base and five new Fractured candidates.**

The user retained only **The Useful Ceiling (`bank-b05`)** from batch 01. It is the first banked base room, with its room definition and stable review ID unchanged. The other nineteen are archived under `scripts/room-bank/archive/rejected-batch-01/` and are excluded from the playable registry. The active bank therefore has **six base and five Fractured** rooms; the new batch itself is evenly split. No rooms were inserted into either campaign.

Open **Extras → Room Bank**. The Useful Ceiling is first and labelled **Banked**; the ten new rooms are labelled **Candidate**. Review mode records **Fun /10, Difficulty /5, Suitability /5** and an optional comment. Play mode omits ratings and uses the timer. Stable IDs and room-definition hashes remain in review exports. Starting partway through a set is practice.

The following table contains design spoilers. In-game hints explain the relevant rules; the intended route is available through **Escape → Watch the intended route (review)**. Author estimates below are not measured player ratings.

| Side / ID | Room | Estimate /5 | Central decision |
| --- | --- | ---: | --- |
| Base / bank-b11 | Door Becomes Stair | 3 | Retire the low outbound bridge and turn the same body into the high return wall. |
| Base / bank-b12 | Umbrella Exchange | 4 | Replace an arm’s shade with the lantern before committing the arm to its bridge pose. |
| Base / bank-b13 | The Missing Stop | 3 | Let the stone pass an empty mould, then cast a stopper for the stone’s return journey. |
| Base / bank-b14 | The Upside Delivery | 3 | Place cargo before inversion; ceiling conveyor transit happens between two gravity reversals. |
| Base / bank-b15 | No Place to Land | 3 | Keep the feather through a carried glide, then separate cargo and knight without landing. |
| Fractured / bank-f11 | Inside the Elbow | 5 | Reconfigure two mutually obstructing arms; lighting the objective changes the return ascent. |
| Fractured / bank-f12 | The Floor You Leave Behind | 5 | Prepare an arm before inversion, work from its opposite face, and reuse the altered structure. |
| Fractured / bank-f13 | Break the Wrong Bridge | 4 | Spend one beam shield to activate the objective while preserving the other for the return. |
| Fractured / bank-f14 | Empty Your Hands | 4 | Route the lantern through a current duct and the knight through void, then reunite for shade and glide. |
| Fractured / bank-f15 | Borrow the Mouth | 4 | Portal the stone as shelter, spend its temporary floor, lower it to expose a side, then remove it from that side. |

Four new rooms—two per side—use **hinged stone arms**. A strike at the hub turns a solid quarter-turn clockwise, changing a bridge into a wall or a roof. Occupied destination poses jam safely. It grants no dash refill or launch. See [hinge rules](hinge.md). The other six use existing mechanics, with one portal room in this batch.

Every room is saved separately, including its intended solution, nearest existing counterpart, explanation of the changed decision and a completion tape. The ordinary base routes use no super, hyper, ultra or wallbounce. Completion demonstrates feasibility; it does not establish fun, difficulty, suitability or uniqueness to a player. Those remain for review.

A real initialization bug surfaced while combining beam shields: light traced before some device bodies existed and could activate a sealed tally immediately. Initial beam tracing now happens after all device reset hooks. One existing beam-room tape was checked alongside the new rooms.

The local route report records one zero-death completion per active room. The browser check covers selection, review submission/export, play timing and room rendering. No broad campaign test sweep or publication is part of this batch.

The requested larger reserve and the full distributed playtest series remain future work. These ten candidates should be rated before deciding which deserve a permanent place in the bank.
