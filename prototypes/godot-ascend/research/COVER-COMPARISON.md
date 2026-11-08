# Cover alternatives: execution revision · 0.41.0

Open **Play Both Cover Ideas.command** to play A, then B. Walk through A's exit or press **N**. Each room keeps its own checkpoint, R retry, optional H hint and complete Watch reference. The accepted chapter and its room count remain separate.

## A · Spend the Shelter

The arm starts upright and the knight starts at the encounter. The sheltered setup loop has been removed. A solid base closes the old lower retreat; tall roof shoulders and thorned sides close the broad perch above the encounter.

Bait the first leftward charge, jump and dash straight up through the narrow overhead opening, and stay centered while the charge and stamp pass below. Land, draw the guard back right, and repeat the airborne maneuver. You now land behind the guard and enter its shard tunnel as part of that encounter, rather than walking back through a safe service loop. Take the shard and its escape line; only then spend the upright arm as the final crossing.

The ending retains the broad raised flag, ordinary hop, catch shelf and recovery steps. The reference takes 790 frames, substantially less preparation than the preceding 1,147-frame version. Its added difficulty comes from the overhead movement and charge/stamp timing rather than more errands.

## B · Deliver the Brute

The high refuge is now left of the exposed dock, opposite the hub. The former right refuge and sheltered service approach are removed. After drawing the brute left, expose yourself on its right to bait the return charge, then jump, steer and dash back up onto the left refuge.

The return charge breaks the right buffer. Use the short run-up on the left refuge, jump and dash over the spiked gantry, brake on the small upper bank, drop to the hub landing and fold promptly. The next ordinary enemy charge carries the brute off the useful dock position. A witnessed 70-frame hesitation at the hub loses the delivery; the brute no longer remains parked indefinitely behind an intact stop. The enemy's existing tell, recovery, cooldown and speed are unchanged.

The gantry closes the easy low approach from the bait to the right hub. Its high route requires the left launch and controlled aerial movement. The reference uses the return-bait-and-retreat sequence; other sufficiently skilled crossings and correctly timed folds are valid. Both comparison brutes use the existing opt-in contact danger, preventing walking through the resting upper guard.

After delivery, a separate descent line and screened lower bait open the exit. A one-way catch at the opened doorway keeps the ordinary-hop ending clear of the brute's body. A missed hop still recovers from the protected catch floor. A separate normal-input witness folds over the first stop early and commits the living brute to the sealed wrong bay; the player can descend and inspect the failed delivery without dying.

## Verification and preservation

The comparison has its own JSON, native editable scene, Watch tapes and ordinary-input A-to-B recording. Native generation validates and round-trips both rooms without loss. The regular chapter's JSON, native scene, tour and 43 definitions are unchanged. No movement constants, global enemy tuning, art, quests or voices changed in this revision.

`tests/cover_comparison.gd` covers the airborne dependencies, closed lower retreat, refuge return, high gantry crossing, prompt versus late fold, wrong-bay delivery, ordinary-hop recoveries, nearby successful input timings, safe flags, real application Watch/completion, hints, Next/Previous, independent checkpoints and retry. Retry restores A's initial upright arm and B's horizontal dock, along with the shard, walls and enemies.

The continuous recording reaches both flags in 1,925 frames with zero deaths, without room warps or state resets. It uses a different ordinary-input entry approach into B's left refuge and records the resulting timing adjustments. The isolated references and the actual application tests separately exercise each room from its own checkpoint.

Five bounded searches include positive controls for cleared-shard retrieval and B's ordinary finish, plus attempts to bypass A's guard without the return bait, retain A's upright arm through the finish, and escape from a committed wrong-bay delivery. Each allows advanced movement and uses at most 12,000 nodes, width 28 and depth 32. Search failure is limited evidence within that budget, not proof that every alternative is impossible.

Private captures, traces and packaged results are under `.cache/godot/cover-execution/`.

The source and signed 0.41.0 macOS comparison suites pass all 85 checks. All five bounded search cases match their expected outcomes. The packaged `fractured_journey` regression also passes, and final rendered captures confirm the shaft, gantry, hub landing and preserved ordinary-hop endings.
