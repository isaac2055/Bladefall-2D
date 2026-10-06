# Opening roads and their Fractured counterparts — 7.232.0

Scope: stages 0, 1, 2 and 21, 22, 25. Local implementation; not published.

## Character and quest pass

Reviewed Claude's resident designs and rendered lineup, retaining the distinct bodies, props, idles and compact Rowan bell staircase. The two existing opening quest routes still pass with that staircase. Quiet authored resident conversations are accessible in the first three regions.

Silas now has a physical maintenance route: release the brake beside his patrol, ride and jump from the maintenance lift to a separate shelf, strike the governor horizontally, return to unlatch the patrol fence, then speak to him. The governor stops visibly; completion lets him walk to the bench, while refusal keeps his patrol without restarting the governor. The fence has collision until released. The workshop draws behind his body. Existing endings, saved completion and one-use reward logic remain in the shared side-story system.

## Movement progression

| Region | New crossing | Available movement |
| --- | --- | --- |
| Outskirts | Broad salvage cradle; timed momentum jump to the road | Jump |
| Black Woods | Upward blade latch then downward rebound | Jump and the acquired sword |
| Broken Causeway | Freight lift launches to upper landings and the existing wall beyond | Jump and sword; does not require dash |
| Fractured Outskirts | Two narrow cradles with a small transfer landing | Jump only |
| Fractured Woods | Four alternating blade launches over a continuous gap | Jump and the acquired sword |
| Fractured Causeway | Two counterweights with a higher, narrower transfer | Jump, sword and dash already introduced by base Causeway |

Carrier charge is limited to the final 0.12 seconds of outward travel and 0.18 seconds at the top, with 0.12 seconds of departure grace. The lit strip indicates the window. Launches inherit actual carrier motion; blade devices add vertical impulse without granting another jump or later abilities. Existing ordinary-enemy pogo restrictions remain intact.

These are physical gaps with reachable landings, not invisible completion checks. Base crossings unlock a persistent return walkway; Fractured crossings retain their precision route. Local retries do not consume a flag, rewind the shared clock or reset the partner. Flags cannot be planted on moving carriers. Existing patrols formerly standing on removed supports are relocated to supported road.

Co-op predicts carrier movement from a shared clock instead of overwriting the rider's platform on every snapshot. Personal launch receipts and retries remain separate. Guest completion opens the shared return walkway through the host. Early Fractured sessions reject later ability grants and stale session capabilities. Silas's tasks and fence use shared quest state.

## Evidence and limits

- `verify-early-platforming.mjs`: all six crossings completed with legal movement from their approach fixtures, zero retries and no damage. Woods fixtures grant the sword that is acquired earlier on the road. This is not entrance-to-exit playthrough evidence.
- `replay-early-platforming.mjs`: independent replay of the exact recorded key states passes all six. Disabling launch impulses makes all six recorded routes fail. This does not prove every possible shortcut impossible. Evidence: `evidence/routes.json`, `evidence/replay.json`.
- `verify-causeway-story.mjs`: brake → lift → gear → gate → giver traversal succeeds without position edits during the route; completion walks Silas to the bench and opens his fence. Outcome check uses a completion fixture after the route. Evidence: `evidence/silas-route.json`.
- The existing first-two-quest movement checks and all 60 side-story dialogue/save/reward paths pass. 77 focused side-story, dialogue and checkpoint unit checks pass.
- Production co-op runtime checks pass for retained dash/test mode/dialogue, Causeway machinery and changing enemy rosters, Cloaked Man combat, capped early Fractured abilities, personal retries, carrier snapshot handling, guest-opened shared return walkway, and Silas's shared tasks/fence.
- The two-browser world-construction test passes every active stage. These use simulated transport; they do not establish real WebRTC signaling, internet latency, sustained frame rate or complete campaign co-op playthroughs.
- Desktop crossing/outcome screenshots and mobile Causeway presentation were reviewed. Fixed the workshop obscuring Silas's body. `evidence/review-sheet.png` and `evidence/silas-mobile.png` retain captures.
- Local deployment mirror rebuilt with 228 assets. Release checker verifies matching asset stamps/mirror but still fails the four pre-existing checks: the two editor scripts are not referenced by the main page, and index/renderer exceed size budgets. No clean release-gate claim.

Source version: **7.232.0**. Service worker: **bladefall-v342-early-platforming**. Human difficulty/feel acceptance remains for playtesting.
