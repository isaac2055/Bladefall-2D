# Room Bank — batch 01 (rejected except The Useful Ceiling)

**User review, 2026-10-07:** keep only `bank-b05`, The Useful Ceiling. The other nineteen are archived outside the playable bank as too basic or too close to existing rooms. The table below is historical, not an approved pool. The next batch uses new stable IDs.

Twenty experimental spare-room candidates: **10 base and 10 Fractured**, with **two new mechanics**: step relay in four rooms per side, and directional crystals in four Fractured rooms. They remain outside campaign progression and are not approved replacements. All human fun, difficulty and suitability ratings are pending; every difficulty below is an author estimate on the 1–5 scale.

Open **Extras → Room Bank**, choose Base or Fractured, then select a room or play the whole set. Review is the default: each completed room asks for **Fun /10, Difficulty /5, Suitability /5**, plus optional comments. Use **Play** for the timer without review prompts. The difficulty filter uses the estimates below. During a room, press **Escape → Watch the intended route (review)** to see its saved solution. A successful demonstration establishes one possible completion, not its fun or suitability.

**Relay** marks the new step-relay mechanic: landing switches all platforms with the same letter; riding does not switch them again. See [the mechanic guide](step-relay.md). **Arrow crystal** marks the second new mechanic: a crystal only refills your dash while you move along its arrow. Wrong-direction contact leaves it available for another approach. See [the directional-crystal guide](vector-refill.md).

## Base candidates

These saved routes use ordinary jumping, dashing and climbing; none requires super, hyper, ultra or wallbounce techniques.

| ID | Room | Estimate | Core problem |
| --- | --- | ---: | --- |
| bank-b01 | Borrowed Breath | 2 | Spend and recover the dash at two differently placed crystals. |
| bank-b02 | Late Departure | 2 | Stay aboard beneath the low roof; leave after its teeth. |
| bank-b03 | Carry the Landing | 2 | Glide with the lantern, then leave it holding the door open. |
| bank-b04 | Dip Before the Door | 3 | Spring to a brittle shelf, then descend for the high exit's refill. |
| bank-b05 | The Useful Ceiling | 3 | Collect one stone upside down and the other while returning upright. |
| bank-b06 | Three Beats | 3 | Dash to create the next coloured foothold before landing. |
| bank-b07 | Step and Stay | 1 | **Relay:** let the lift carry you while preserving your dash. |
| bank-b08 | Counterweight Courtesy | 2 | **Relay:** lower the distant partner, then board it to reverse the pair. |
| bank-b09 | Passenger Transfer | 3 | **Relay:** transfer from a covered horizontal shuttle to an independent lift. |
| bank-b10 | One Switch at a Time | 4 | **Relay:** coordinate a diagonal lift with platforms changed by dashing. |

## Fractured candidates

| ID | Room | Estimate | Core problem |
| --- | --- | ---: | --- |
| bank-f01 | Borrowed Runway | 5 | **Arrow crystal:** return left through the refill, then launch before the fault runway falls. |
| bank-f02 | Refund Below | 3 | **Arrow crystal:** descend through the low refill to earn the resource for climbing back. |
| bank-f03 | No Second Footfall | 4 | Chain downward pod cuts before the fragile balcony and last wall. |
| bank-f04 | Crosswind Receipt | 4 | **Arrow crystal:** brake below the roof, then collect the final refill while climbing. |
| bank-f05 | Forwarding Address | 4 | Arrive at the far runway, then reverse toward the exit behind you. |
| bank-f06 | Backstay | 5 | **Arrow crystal:** wallbounce away from the tall stay, refill on the leftward retreat, then cross its top. |
| bank-f07 | The Unfinished Bridge | 4 | **Relay:** borrow the rising runway's height for a low dash-jump. |
| bank-f08 | Debt in Motion | 4 | **Relay:** board the lowered receiver to reverse it into a rising launch. |
| bank-f09 | Two Clocks, One Breath | 5 | **Relay:** connect independently moving decks while a shade pursues. |
| bank-f10 | Parcel at Speed | 4 | **Relay:** turn shuttle speed into a narrow spring landing and high exit. |

## Saved sources and future use

Each room is checkpointed separately in `scripts/room-bank/base/` or `scripts/room-bank/fractured/`, with its stable ID recorded inside its JSON file. Records contain `room` (geometry and devices), `bank` (estimated difficulty, suggested worlds, solution and status), and `tape` (frame-count/input pairs). Drafts are retained; only records marked `route-proven` with a saved tape enter the playable bank. Room revisions accompany exported reviews so later edits can be distinguished.

Run `node scripts/room-bank/build.mjs` to rebuild the bank and manifest from those records. Run `node scripts/room-bank/check.mjs` for one deterministic completion per candidate and the batch constraints; individual room IDs can limit a check. These checks do not replace human ratings.

Future replacements require adapting the candidate's entrance, exit, available abilities, neighbouring difficulty and world fit. Suggested worlds are starting points for review, not automatic insertion instructions. Preserve the original bank candidate when making an adapted campaign version.
