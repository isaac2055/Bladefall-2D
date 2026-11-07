# Fractured Woods additions seven to nine · 0.43.0

The six accepted rooms—Pod, Crossing, Wall, Branch, Lantern and Runway—are preserved. Three approved proposals are implemented as individual rooms with independent checkpoints, optional hints, full Watch references and native editable chapter data. There are now 46 definitions and 22 main challenges, including nine added puzzle rooms. No new runtime mechanics, physics changes, art, voices or quests are introduced.

## The Branch You Must Stand Beside

An upright hinged branch obstructs the useful runway. Its right-hand upper perch occupies the branch's next horizontal position: trying to rotate while standing there safely jams against the knight. Drop to the low footing, strike upward beside the pivot, then step left and jump onto the rotated branch. A down-diagonal landing dash and wavedash carry the player beneath the canopy; after clearing it, an upward-right dash restores the amber finish.

The existing hinge obstruction test supplies the positional puzzle. The branch's horizontal pose supplies actual landing/refill support over thorns. Early alternate-route searches found a lower launch that ignored the branch and ordinary movement that escaped by jumping from the canopy's outer corner. The lower thorn clearance and guarded canopy edge reject all three reproduced shortcut witnesses while retaining nearby successful powered inputs. The safe jam is demonstrated in a separate test; Watch shows the clean solution and does not require a failed attempt.

## The Seed You Cannot Use Yet

The seed is visible near the entrance, but the existing room-local oathblade restriction suppresses sword attacks until the blade is released and retrieved. Cross to the counterweight root, climb three offset shelves, and hold up beside the blade. Return toward the same seed, jump out from the root bank, and cut down-left while holding jump for the high rebound. Dash upward-left over the thorn-topped roof to restore the amber home landing.

Existing roots decorate the counterweight bank. The blade is not a new inventory item or quest. Tests confirm root release, blade acquisition before the rebound, and the seed's physical contribution. Without acquisition the demonstrated attack is suppressed; without the seed the acquired blade alone does not reach the home landing. The six banked rooms do not inherit the restriction.

## The Branch Above Your Head

A timed resin branch forms a lid above the seed. Its solid state blocks the high rebound. From a permanent pocket, jump above the seed and strike down while holding jump as the lid disappears. Steer right during the rebound, then dash upward-right onto the receiving branch that is solid during the same interval.

The resin clock is independent of dash phase. A permanently solid lid blocks the demonstrated route; departing too early fails; removing the seed or receiving branch separately prevents the same clear. The permanent pocket permits safe observation, and all three sampled timing segments have nine nearby successful complete witnesses. No precision single-frame opening is required.

## Preservation and verification

All 43 prior room definitions and recordings are preserved except the crossroads' incoming destination, which now points to the last addition. Prior section placements and checkpoints are unchanged; only the crossroads moves to follow the new rooms. The 19 prior main requirements remain an exact prefix of the new 22. Chapter metadata, quests, secrets, shared movement constants and the user's pre-existing World 1 edit are preserved.

The complete road reference clears 29 road sections and reaches the crossroads in 14,105 normal-input frames with zero deaths, visiting 30 regions including the final crossroads. The prior 11,581-frame recording is preserved as an exact input prefix. The ordinary post-flag exit climbs are included in Watch and the continuous recording.

`woods_nine.gd` checks physical dependencies, the knight-blocked hinge jam and its correction, nearby complete timing samples, three reproduced earlier shortcuts, and exact oath/resin search snapshot replay. `woods_nine_app.gd` checks preservation, native/source parity and validation, individual checkpoints, named selection, hints, idle preparation, real application clears, complete Watch exits, manual retries and death restoration. Retry witnesses must finish without adding another death.

`woods_nine_search.gd` runs three reachable positive controls and four bounded alternate-route cases: locked upright hinge, ordinary movement after preparing the hinge, blade acquired with no seed, and a lid that never disappears. Each negative case has a 24,000-node ceiling, beam width 36 and depth 36, with advanced movement enabled except the ordinary-only case. No route was found within those bounds. Beam pruning and finite input choices make this evidence of resistance to sampled shortcuts, not a proof of uniqueness. The helper now snapshots and hashes the room-local oath state as well as both device clocks.

Rendered application captures were inspected at preparation, movement and finish. The packaged checks use the signed shipping PCK with a test-only overlay and require actual assertion output, successful completion, no script/runtime errors and rejection of a missing-script negative control. Private logs, captures and search reports are in `.cache/godot/woods-nine/`.
