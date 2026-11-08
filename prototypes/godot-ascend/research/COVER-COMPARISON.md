# Two harder cover alternatives · 0.40.0

Open **Play Both Cover Ideas.command** to test A, then B. Walk through A's exit or press **N** to switch rooms. Each retains its own checkpoint, R retry, optional H hint and complete Watch reference. The alternatives remain isolated from the accepted chapter and its room count.

## A · Spend the Shelter

The first leftward charge opens a raised, low-ceiling shard tunnel. Its solid base prevents entering from below; the brute stops across the only entrance. Opening the wall is preparation, not immediate access to the required shard.

Climb to the upper pocket, expose yourself at its left edge to draw a rightward charge, and jump behind the upright arm. The charge breaks a small brittle buffer, leaving the brute away from the tunnel. Drop down the screened service chute and return to retrieve the shard. The escape line lifts you clear of the returning guard. Only afterward turn the same upright arm into the crossing and bait the final wall. The flag still has an ordinary-hop ending and a lower catch shelf with recovery steps.

This room opts its brute into `contactHazard`, so its body blocks a reckless dash through the resting guard by killing on contact. Ordinary brutes retain their existing behavior. The low tunnel prevents jumping over this guard; its base prevents dashing up behind it. No movement constants, global enemy tuning, new art, quests or voices were added.

## B · Deliver the Brute

Two lower bays are separated by a full-height fixed divider. The obvious first leftward stop sits over the sealed bay. Folding there drops a living brute into the wrong place, where it cannot reach the exit wall. R restarts this commitment at B's own checkpoint.

Instead, return to the exposed dock to draw a rightward charge, escape upward to the opaque refuge, then use the screened service approach to fold from the hub. The fixed buffer parks the brute over the useful bay. The refuge and service screens prevent waiting or merely approaching the mechanism from performing the return bait automatically.

The brute falls under ordinary gravity. The player takes a separate descent line to a receiving perch; a continuous screen prevents the falling brute from seeing the player early and opening the exit automatically. Drop below the screen to bait the lower wall, then retreat. Two ordinary hops finish the room. A missed final hop lands on a catch floor shielded from stamp waves by the raised approach block. The camera frames the upper brute and lower bays together at the operating shelf before the fold.

## Verification and preservation

The comparison has a separate JSON dataset, native editable scene, Watch tapes and a continuous ordinary-input recording. Normal chapter 23 still loads all 43 original definitions; its JSON, native scene and tour are unchanged. Player and enemy constants are identical. Comparison retry resets the shard, arm, walls and enemy locally.

The source suite passes **82 checks**, including actual application Watch/completion, independent checkpoints, Next/Previous, hints, retry, native round-trip validation, preservation, ordering, nearby successful timings, safe waiting, and ordinary-hop recoveries after misses in both rooms. Its continuous A-to-B recording reaches both flags in **2,439 frames with zero deaths**, without room warps or state resets. A second B witness waits 1,200 additional frames after the first charge, then repositions and finishes without resetting.

Five bounded search cases match their expected outcomes. Positive controls collect A's shard after clearance and finish B after correct delivery. Negative cases search for collecting A's guarded shard without a return bait, finishing A while retaining the upright arm, and finishing B after a wrong-bay delivery. Each search allows advanced movement and uses at most 12,000 nodes, width 28 and depth 32. Failure within that budget is limited evidence, not proof of impossibility.

`tests/woods_search.gd` adds an optional search-only filter for the forbidden return tell; it does not alter simulation behavior. All other searches retain their defaults. Packaged regression results are recorded privately under `.cache/godot/cover-hardening/`.

The signed 0.40.0 macOS app passes all five packaged suites: `cover_comparison` (82 checks), `causeway_next`, `cover_two_baits`, `fractured_causeway_studies`, and `fractured_journey`. Final rendered captures confirm the revised geometry and the camera framing at the operating shelf.
