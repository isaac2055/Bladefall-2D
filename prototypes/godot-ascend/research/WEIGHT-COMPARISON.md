# Two weight alternatives · 0.43.0

Open **Play Both Weight Fixes.command** (`--weight-comparison --world 23 --room 0`). N switches between A and B, R retries the current checkpoint, H gives an optional hint, and Watch solution plays a full ordinary-input demonstration. The comparison has its own source JSON and native editable scene. The previous Roof room, original launch comparison, cover alternatives and regular chapter remain unchanged.

## A · The Throw During the Launch

The lantern starts on the launch plate and lowers it beneath a low roof. Move onto the plate, hold Down while picking up the lantern, and approach its right end. Release into a rightward launch. Throw during the ascent so the lantern lands in the elevated settling trough and travels through the object letterbox. Only after releasing the lantern can the knight dash up-right over the guarded divider.

Brake in the gap beside the full-height receiving roof, drop through the small shelf, and board the plate lowered by the lantern. Leave the lantern there and finish with an ordinary hop from the uncovered end. There is no retrieval-and-relaunch cleanup after the main encounter.

This is one committed launch in the demonstration. Returning the first plate to its unloaded height leaves only an eight-pixel gap beneath its roof; the eleven-pixel-tall knight cannot stand anywhere on it. Thorned upper and outer faces prevent using that roof as a replacement staging platform. The throw trough is raised above ground-throw reach, and its run-up gives more than one successful airborne release timing. The receiving roof extends to the level ceiling, preventing an airborne shortcut over it to the flag bank.

## B · Meet the Weight on Its Way Down

Throw from the initial raised plate into the lower letterbox. Charge that plate yourself and launch over the two-sided thorn divider. Brake onto the shelf, descend to the lower sill, and jump through the side window to intercept the receiving plate while the lantern is lowering it.

Hold Down while taking the lantern. Throw it clear, let the plate rise a short distance, then dash through the low exit before the rising plate closes the headroom beneath its roof. The reference uses the existing airborne cargo catch during that dash; no new lantern interaction is introduced. An ordinary hop from the catch floor reaches the flag.

The exit floor prevents walking beneath the unloaded receiver to skip the delivery. Its entrance has an eight-pixel object port and a separate player interception window. Its deep dip is thorned, so a late attempt cannot simply land at the bottom and perform the same routine at leisure. The load, charge, movement and lantern return determine the opportunity; there is no new countdown or sequence flag. Other successful interceptions, including the return stroke if achievable, remain valid rather than being rejected by hidden state.

## Shortcut closure and preservation

Both dividing walls continue from their letterboxes to the lethal floor. There is no lower-right recovery passage. Both faces of each upper divider are thorned; the right face no longer supplies an unguarded climb. The receiving roofs meet the ceiling, so jumping over a second row of spikes does not reach the flag. A's remaining lower shelves return only toward its starting bank. A solid outer lip beneath its ordinary-hop finish also closes climbing around the exposed receiver end from below. B's receiver-side floor and exit lip close the underside bypass.

The comparison uses the existing recoil, carry, throw, dash, collision and hazard code. No movement constants, enemy tuning, art, quest, voice or other chapter/editor scene changes are included. Native generation round-trips both rooms without data loss. Preservation hashes cover the regular Causeway JSON/native/tour, the full earlier launch comparison containing Roof, the cover alternatives, and the unchanged core and mechanism scripts. Export compiles scripts and scenes, so the packaged suite checks compiled availability alongside exact JSON preservation; source runs also check raw hashes.

## Verification

`tests/weight_comparison.gd` covers ordinary-input flags without deaths, real loading before boarding, the airborne throw and single launch in A, geometric exclusion of reboarding the unloaded first plate, a throw-and-retreat witness, B's descending interception and handoff, late and missing-handoff counterfactuals, the timed exit dash, nearby successful input timings, safe completed flags, native validation/round-trip, actual application menus, hints, Watch solutions, completion tracking and independent checkpoint retry.

`tests/weight_comparison_search.gd` includes both prepared-finish positive controls, no-lantern searches allowing advanced movement in both complete rooms, attempted return to A's first plate after delivery, and removal of A's airborne cargo before delivery. The searches use at most 16,000 nodes, width 32 and depth 36. Failure to find a shortcut is evidence within that budget, not proof of universal impossibility; structural collision checks and witnessed counterfactuals separately cover the identified routes.

A separate exhaustive body-position flood uses the runtime solid-collision function at every pixel, removes the launch plate, permits free flight and ignores hazard deaths. With each receiver unloaded, neither its standing surface nor the flag is reachable; with the receiver lowered, the flag becomes reachable. These positive controls distinguish closed collision geometry from a failed search caused by movement sampling. This check covers the frozen receiver gate; normal-input recordings separately verify the real load and motion sequence.

The source and signed macOS weight suites pass all 80 checks. The packaged earlier launch suite passes all 62 checks, including Roof, and all three Fractured chapter journeys pass. The packaged harness rejects its missing-script negative control. All six bounded-search outcomes match their expectations. Actual rendered captures show A's committed launch and B's loaded interception chamber. The separate World 1 native edit retains its existing SHA-256 hash.
