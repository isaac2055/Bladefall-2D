# First two levels: quest and character refresh

Scope: Outskirts and Black Woods, including their existing residents, Mara’s survey, Bram’s lamp route, the Gatekeeper and the woodland Host. Later levels retain their current implementation.

Required completion evidence:
- Natural, distinct dialogue for every speaker in these levels; longer optional conversations and outcomes without making the quick route laborious.
- Unique silhouettes, clothing, tools and grounded personal surroundings for every resident. Verify rendered scenes, not only data definitions.
- Clear quest staging: quiet backdrop behind interactable people and props, no stacked text or competing overlapping scenery, readable foreground routes.
- Gatekeeper: an actual remote bell tower, staged release/lowering/installation, a visible link to the occupied camp, animated relocation and refusal outcomes.
- Host: an actual damaged woodland kitchen and a lantern in a separate branch route; recovery and a modest practical repair lead to a staged supper. Visible, animated positive and refusal outcomes, with readable return-visit state.
- Existing survey and lamp routes remain integrated, with descriptions that accurately explain what the player sees and does.
- Tasks require meaningful movement and one clear next objective, without extra inventory bookkeeping. No capabilities unavailable in these levels.
- Every route playable from its giver and back using real movement inputs. Check all dialogue branches, persistence, co-op receipts, keyboard/touch dismissal, and desktop/mobile visuals.
- Existing campaign progression and personal saves remain intact. Rebuild local deployment after verification; do not publish without a request.

Initial finding: both optional quests currently spawn the same small staircase near the regional rest point. Props described as distant locations are within roughly 100–300 units of the giver. Most characters share generic silhouettes. Outcomes primarily switch static poses.

## Completed implementation — local 7.230.0

- Rowan’s bell quest has three sequential actions: push a ballast cart onto its stop, climb the supported tower route to lower/recover the bell, and install it at camp. The bell lowers, travels with the knight, rises onto the post and swings. Completion walks Rowan to his bench; refusal moves him aside.
- Elsie’s supper quest has four actions: loosen the branch line, retrieve the remote lantern, repair the kitchen step, and set the table. The line slackens, lantern transfers/carries through the repair, board lowers, installed light rises, supper steams, and refusal puts away the spare bowl. The completed kitchen disappears gradually on return, leaving its boards and hook.
- All opening speakers now use direct, distinct language. Rowan and Elsie have longer optional endings and descriptive brief outcomes. Orra’s runtime clock override uses the catalog. Mara names the three actual survey locations and waits at Broken Muster; her relocation now lands on supported ground. Bram correctly says the player is across while he holds the lamp on the near side.
- Rowan, Elsie, Mara, Vey, Olan, Orra, Pell, Hale, Bram and Tamsin have individual pixel clothing, tools and personal surroundings. Tower supports and woodland branches connect routes to their settings. Quiet scene backgrounds draw behind residents, and the kitchen sits clear of Tamsin’s shop.
- Survey handover, lamp raising and shop gift transfer animate. Outcome clocks continue during dialogue. Dialogue fits desktop and mobile landscape with keyboard/touch dismissal.
- Old quest saves migrate once; completed rewards stay claimed. Shared quest actions validate prerequisites on the host, synchronize decisions, rewards and return scenes, and preserve solo saves.

## Verification and limits

- `verify-opening-quest-refresh.mjs`: both complete objective routes reach ready using legal movement from a giver fixture; actual cart push and all ledge jumps. No position writes during traversal.
- `verify-opening-presentations.mjs`: positive/refusal choices on desktop and mobile, actual keyboard/touch activation, dialogue bounds, animated time progression during conversation, dismissal, return states, supported Mara relocation, all residents captured. Screenshots reviewed.
- `verify-opening-animation.mjs`: each task transition resets and advances its animation clock; carried props persist through their intended steps and disappear on installation. Three-time rendered fixtures cover Mara, Bram and Tamsin.
- 72 side-story/dialogue unit checks pass, including migration. All 60 side-story dialogue paths pass with reload persistence and one-time rewards.
- Two-browser side-story co-op validation passes both opening quests, rejecting an unweighted cart on the host, guest-led progress, shared completion/return state, acknowledged rewards, conflicting choices and solo isolation. Uses an in-memory transport, not real WebRTC signaling.
- Three targeted production co-op runtime regressions pass: Causeway doors/enemy roster, retained abilities/test mode/dialogue, and Cloaked Man shared combat.
- Local build contains 225 game assets. The release checker confirms exact mirror bytes and matching service-worker script stamps, but its overall result remains FAILED on four separate checks: editor scripts astra-respec/fable-respec are not referenced by the main page, and index/renderer exceed configured size limits. No claim of a clean release gate or publication.
- The older opening-systems integration script also remains FAILED: its pre-journey inventory/echo/reward expectations conflict with current field-loadout/journey behavior. No runtime page errors. Its report is retained, not weakened to pass.
- This verifies authored quest routes and runtime contracts; it does not claim a new full campaign playthrough, real-network performance measurement, or human balance acceptance.

Source, asset query stamps and service-worker cache are updated to local 7.230.0 / v340-opening-quests. Deployment mirror rebuilt; not published.
