# Fractured Woods additions seven to nine · 0.44.0

The seven accepted additions, including The Branch You Must Stand Beside, are preserved. Rooms eight and nine are revised following playtest feedback. There remain 46 definitions, 22 main challenges and nine added puzzle rooms, each with an independent checkpoint, optional hint, full Watch reference and native editable data. No runtime mechanics, shared physics, art, voices or quests are changed.

## The Branch You Must Stand Beside

An upright hinged branch obstructs the useful runway. Its right-hand upper perch occupies the branch's next horizontal position: trying to rotate while standing there safely jams against the knight. Drop to the low footing, strike upward beside the pivot, then step left and jump onto the rotated branch. A down-diagonal landing dash and wavedash carry the player beneath the canopy; after clearing it, an upward-right dash restores the amber finish.

The existing hinge obstruction test supplies the positional puzzle. The branch's horizontal pose supplies actual landing/refill support over thorns. Early alternate-route searches found a lower launch that ignored the branch and ordinary movement that escaped by jumping from the canopy's outer corner. The lower thorn clearance and guarded canopy edge reject all three reproduced shortcut witnesses while retaining nearby successful powered inputs. The safe jam is demonstrated in a separate test; Watch shows the clean solution and does not require a failed attempt.

## The Rebound You Must Refuse · revised in 0.44.0

The oathblade setup is reduced to one jump/up-dash onto the nearby root footing and retrieving the blade beside it. The return is replaced with a rightward low/high rebound sequence. Release jump while cutting down-right at the first seed; its shallow rebound fits below the thorn canopy. Dash horizontally onto the raised intermediate bank. Jump toward the second seed, hold jump while cutting down-right, then use the high rebound and an up-right dash to reach the blue flag.

The raised intermediate bank, its guarded side, a low passage between upper and lower thorns, and the preparation alcove’s short upper footing prevent reproduced ground-boost/dash and ordinary jump/up-dash shortcuts from substituting for the first seed. The flag's lower approach is guarded to prevent a reproduced side climb from substituting for the second seed. These are visible collision hazards, not input quotas. Both seed removals, an unclaimed blade, a high first rebound and a low second rebound separately reject the same demonstrated clear. Sampled nearby timings retain several complete successes.

The room ID and chapter placement are unchanged; its checkpoint moves to the lower entry bank (column 2, row 37) to match the revised approach. Existing low/high rebound physics, room-local oath restriction and tile grid are unchanged.

## The Branch You Must Leave · revised in 0.44.0

The original seed/lid opening remains. Its temporary receiving branch is narrowed and no longer carries the finish. Leave its right edge, dropping into the permanent lower pocket beneath a hanging divider. On the next resin phase, a lower runway appears and the divider's resin lip disappears. Jump beneath the divider onto the runway, then make an airborne down-right landing dash and wavedash beneath the canopy. After clearing the guarded canopy edge, dash up-right onto the blue finish.

The resin clock remains independent of dash phase. Waiting on the first perch, starting the lower route too early, keeping the lid solid, removing the receiving branch, removing the seed, removing the lower runway, or holding the clock in the first receiving phase each prevents the demonstrated clear. A guarded lower edge at the finish closes a reproduced ordinary-movement side-climb shortcut. The lower pocket permits waiting for another beat; falling into thorns still resets the room. No checkpoint is added within the challenge.

## Original 0.43.0 preservation and verification

All 43 prior room definitions and recordings are preserved except the crossroads' incoming destination, which now points to the last addition. Prior section placements and checkpoints are unchanged; only the crossroads moves to follow the new rooms. The 19 prior main requirements remain an exact prefix of the new 22. Chapter metadata, quests, secrets, shared movement constants and the user's pre-existing World 1 edit are preserved.

The complete road reference clears 29 road sections and reaches the crossroads in 14,105 normal-input frames with zero deaths, visiting 30 regions including the final crossroads. The prior 11,581-frame recording is preserved as an exact input prefix. The ordinary post-flag exit climbs are included in Watch and the continuous recording.

`woods_nine.gd` checks physical dependencies, the knight-blocked hinge jam and its correction, nearby complete timing samples, three reproduced earlier shortcuts, and exact oath/resin search snapshot replay. `woods_nine_app.gd` checks preservation, native/source parity and validation, individual checkpoints, named selection, hints, idle preparation, real application clears, complete Watch exits, manual retries and death restoration. Retry witnesses must finish without adding another death.

`woods_nine_search.gd` runs three reachable positive controls and four bounded alternate-route cases: locked upright hinge, ordinary movement after preparing the hinge, blade acquired with no seed, and a lid that never disappears. Each negative case has a 24,000-node ceiling, beam width 36 and depth 36, with advanced movement enabled except the ordinary-only case. No route was found within those bounds. Beam pruning and finite input choices make this evidence of resistance to sampled shortcuts, not a proof of uniqueness. The helper now snapshots and hashes the room-local oath state as well as both device clocks.

Rendered application captures were inspected at preparation, movement and finish. The packaged checks use the signed shipping PCK with a test-only overlay and require actual assertion output, successful completion, no script/runtime errors and rejection of a missing-script negative control. Private logs, captures and search reports are in `.cache/godot/woods-nine/`.

## 0.44.0 verification

The seven accepted additions, all other room definitions and reference tapes, shared physics, chapter metadata and the unrelated World 1 edit are preserved. Tests retain the original hinge checks and add low/high choice checks, the new resin sequence, physical counterfactuals, nearby input timings and five reproduced seed/runway shortcuts. Real application checks cover both revised flags, complete Watch exits, manual retries, death resets, native/source parity and named room selection.

Bounded alternate-route searches include positive finish controls and attempts with either seed absent, a permanently solid initial lid and ordinary movement after reaching the lower pocket. Finite input choices and beam pruning limit these searches; a failed search is evidence within its bounds, not proof of a unique solution. Current evidence is stored privately in `.cache/godot/woods-revisions/`.

The revised full chapter tour clears 29 road sections through 30 visited regions in 13,801 normal-input frames with zero deaths. Its first 12,229 inputs are identical to the previous release, through all seven accepted additions and into the revised seed room approach.

Final validation: source physics and all six revised-room search cases passed. Four suites passed against the final signed application: `woods_nine`, `woods_nine_app`, `editor_play` and `fractured_journey`. Earlier packaged Lantern and accepted-room regression suites also passed. Final captures were inspected at preparation, traversal and both flags.
