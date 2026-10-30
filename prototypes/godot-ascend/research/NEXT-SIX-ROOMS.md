# Six rooms toward ten per biome

2026-10-30. The user authorized proposal and implementation in one goal. Append two Outskirts, two Black Woods and two Causeway rooms to the existing 24, preserving their definitions, recordings and positions. Target: 30 rooms, ten per biome. Use existing mechanics and the normal one-dash kit; no quests, voices, connections or movement tuning.

These are build hypotheses, not playability claims. Revise geometry when ordinary-input witnesses or counterexamples contradict them. Alternatives that retain the room's central relationship are welcome.

## Outskirts — The Load That Opens the Lift

**Question:** What keeps the door open while the lift brings you back?

Use the lift to reach a lantern, carry it down to a remote pressure plate, then reuse the lift empty-handed to pass the held door. The cargo cannot dash or cling, so its return differs from the final ascent. The plate and door connect the two uses of the same machine, rather than forming separate errands.

Test the unloaded door, standing briefly on the plate, thrown cargo, bypassing either lift journey and recovery after missing the moving platform. Expose the existing pressure plate and held gate in the simple editor.

## Outskirts — The Descending Invitation

**Question:** When should you board a lift that first moves away from the flag?

The resting lift has no standing headroom. Activate its descent, visit the lower pickup pocket, board while it is low, then use the upward return to reach the high flag. The downward trip makes boarding possible; its return supplies the later launch. Visible return items establish the lower excursion without pretending they prove use of the lift.

Test leaving the initial side, using an idle lift, dropping straight to the pocket, bypassing the return launch and nearby boarding/departure times. Prefer a generous holding interval over a collapse deadline.

## Black Woods — The Lantern and the Missing Root

**Question:** Which phase can your cargo bring home?

Prepare a blue carrying route through an absent amber root. Bring the lantern back across the blue bough and leave it on a pressure plate. The opened held gate admits the empty-handed final phase-changing dash to an amber landing. A bell gives a safe way to correct preparation before picking up cargo; carrying prevents changing phase by dash or strike.

Test wrong-phase pickup, putting the cargo down to correct the phase, throwing across the root, leaving the plate and reaching the flag without delivering the lantern. A different preparation route is valid if the carrying relationship remains.

## Black Woods — The Landing You Make in Midair

**Question:** When can the branch become solid without stopping your rise?

Use the pod while the blue cap is absent, then change phase during the later ascent to create the blue landing. An early phase change creates an obstruction too soon. An early landing on that cap is lower than the final flag and does not solve the remaining phase problem. This develops phase-preserving ascent into a deliberate later change, rather than requiring the player to avoid dash throughout the flight.

Test the occupied-root protection explicitly, early changes, pod-free ascent, climbing the cap or flag face, and several late-change timings. The useful timing band must be readable and forgiving.

## Causeway — The Spring Under the Stone

**Question:** Where should the ceiling go so it can catch your next jump?

Dash the stone away from the recoil launch and into a far dock. Use the newly opened launch to reach it, recover a dash there, then cross to the flag. The stone both obstructs the initial rise and supplies the distant recovery. This extends the existing stone-placement family with stored-force transfer.

Test leaving the stone stationary, reaching the dock from the service ledge without recoil, launching directly to the flag, substituting the permanent stop for the stone and normal nearby charge/release timings.

## Causeway — The Launch Waiting on the Return

**Question:** Which release prepares the launch you will need later?

Recoil reaches and activates a descending lift. Its low visit permits a required pickup excursion; its upward return supplies the final launch. The first stored release prepares a second moving body, rather than completing an unrelated bounce. This recalls the Outskirts return-lift relationship with a more demanding initial transfer.

Test activating the lift without recoil, dropping to the item without preparing the lift, using its parked position for the final jump, skipping the intermediate recovery and catching the return at several times. Guarded stationary faces should not become unintended substitute launchers.

## Delivery checks

For every room: ordinary-input clear from its real spawn, meaningful physical counterfactuals and targeted shortcut attempts, retry/death/Watch behavior, editor editing and old-file migration, native roundtrip and packaged application playback. Inspect actual rendered rooms. Keep the existing 24 unchanged, update the prototype version and launchers, and commit/push the isolated prototype branch. Automated checks cannot establish enjoyment; these six remain subject to the user's playtest verdict.


## Implemented · 0.28.0

All six are implemented as appended rooms 25–30, preserving the previous 24 definitions, sections and recordings. The two new cargo rooms expose the existing pressure plate and weight-held gate in the browser editor. Both descending lifts have standing recovery below and long holds; the midair phase change admits occupied-root protection as a valid wider timing band.

The first stone draft had a real recoil-free shortcut: a late coyote jump and dash caught the far stone's side, then climbed onto it. The final dock guards that face while preserving a landing from above. `tests/fixtures/six-puzzle-bypasses.json` retains the original draft and successful input tape; the bypass suite reproduces it in that draft and rejects it in the revision. A fresh search then found no recoil-free dock route within 12,000 branches. No negative search is an exhaustive proof.

Validation completed against the signed 0.28.0 macOS app: 17 packaged suites passed, including the six-room physical/application suites, positive-control searches and the reproduced bypass; the full workshop suite passed 264 checks. The six-room physical suite contains 36 assertions, including clearing input ranges. Browser editor integration passed 40 groups, including all six canvases, native editing/roundtrips and importing the actual previous-24 export. Actual GPU renders were inspected at spawn, intermediate decisions and finish for every room. The user's campaign scene retained its pre-task hash. No quests, voices or global movement constants changed.

These are playable additions awaiting human feedback, not an assertion that all six have joined the liked lineup. Detailed mechanics, launcher and test commands are in `../WORKSHOP.md`.
