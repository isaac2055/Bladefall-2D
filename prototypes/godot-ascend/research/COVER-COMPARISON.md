# Two cover alternatives · 0.39.0

The two proposed alternatives are playable back to back in an isolated comparison. Open **Play Both Cover Ideas.command** (`--cover-comparison --world 23 --room 0`). Walk through A's exit into B, or select either under **Esc → Explore a section**. They remain proposals for human playtesting, separate from the accepted chapter count.

## A · Spend the Shelter

One arm starts left as the cover over the first bait. From the lower right service shelf, strike up to turn it into an upright wall. A low beam continues to screen the waiting area; rise onto the exposed left bait ledge to draw the brute's leftward charge, then drop below it. The first breach reveals a required shard and the line to the upper operating pocket. The gold flag requires that visible shard, so opening only the second wall cannot complete the room.

That pocket is safe to wait in, but its upright wall blocks the way out. Drop to the operating ledge, turn the same arm right, cross ahead of the returning brute, and jump onto the small refuge. The rightward arm supplies the crossing across the void. The second charge opens the flag bay. Its raised flag prevents the brute following onto it; the final transfer is an ordinary hop. Missing it lands on the lower catch shelf, with small steps for a local retry.

The preparation and bait ledge are distinct: waiting below the beam does not substitute for exposing yourself. The upper brute lane has the existing armored-brute hazard clearance, so the knight cannot simply walk into the lane to lure it without uncovering the lower bait. An expert can use a harder movement route to the upper pocket after the first breach instead of its line; the shard requirement preserves the first task in either route. This uses the existing return-shard finish rule. No new movement, enemy behavior, artificial turn counter or timer is introduced.

## B · Deliver the Brute

The brute starts on fixed upper ground. Lure it left onto the horizontal loading dock, jump up-right to the refuge, and return to the right-hand hub while it recovers. Turning the dock upright removes its floor and creates a divider. The brute drops alive into the left lower corridor. Folding before loading closes that divider with the brute still on the wrong side.

The knight takes a separate one-way descent line to a screened receiving perch. Waiting there leaves the lower wall intact. Drop into view to draw the relocated brute right, then jump and dash up to the perch. That breach opens the raised walkway and short final hop. The brute cannot climb its raised edge. The gap's catch floor allows an ordinary-jump retry without redoing the delivery.

The current reference uses the normal recovery opportunity. A missed approach can be retried by re-baiting the brute on the upper dock before folding; the dock's fixed buffer remains. There is no added countdown or scripted teleport. The folded arm's geometry and ordinary gravity perform the delivery.

## Isolation and verification

The comparison has its own two-room JSON dataset, native scene, full references and continuous A-to-B recording. It uses the existing chapter 23 art/audio palette and identical player and enemy constants. The regular chapter JSON, native scene, tour and all 43 room definitions remain intact. A launch flag selects the comparison; normal launches still load the regular chapter. Native editor play selects the same comparison scene.

`tests/cover_comparison.gd` exercises preparation, ordered breaches, live delivery, separate player descent, safe waits, required reference actions, nearby input timings, ordinary finishes, missed-hop catch-and-retry routes, safe standing at the flags, native round-trip/validation, preservation, continuous room transition, actual menu/hints/Watch/retry, and default launch isolation.

`tests/cover_comparison_search.gd` supplies prepared positive controls and bounded alternate-route searches. Each uses at most 12,000 nodes, width 28 and depth 32, with advanced movement allowed. A failed search is limited evidence within that budget, not proof of impossibility.

The source comparison suite passes **72 checks**. The continuous recording reaches both flags in **1,639 ordinary-input frames with zero deaths**, including the physical A-to-B entry and B checkpoint. All six bounded search outcomes match their expectations, including the valid expert alternative after the first breach. Both final hops have separately demonstrated catch-and-retry witnesses; standing at each completed flag for 1,200 frames is safe. The comparison resets its required shard on death/retry using the existing workshop behavior, while normal campaign shard persistence is unchanged.

A separate ordinary-input recovery witness waits out B's initial docking opportunity, re-baits the brute onto the dock, then finishes the delivery and flag with zero deaths and no reset. It is preserved in `tests/fixtures/cover-comparison-recovery.json` and checked by the comparison suite.

The signed macOS build passes all five packaged regression suites: comparison, Causeway additions, the prior cover room, fractured Causeway studies, and the fractured journey. The supplemental comparison run also passes all 72 checks, including the missed-docking recovery witness.
