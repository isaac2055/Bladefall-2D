# Main-game optional stories — implementation ledger

User scope: place the characters and implement functional short, medium and harsh dialogue routes for all 20 main-game optional quests. Preserve the natural, distinct voices approved in the conversation. Short and medium have equal provisional reward value 2/3; harsh permanently closes that quest's reward. Keep usable items regional, with no bag. Do not extend this pass to Fractured levels or rebalance combat/shops.

## Delivered functional implementation

Final scope, character matrix, verification and known wider-suite failures: [delivery audit](OPTIONAL-STORIES-AUDIT.md). The progress notes below are historical; the audit is the current status. Offline cache is v329.

- `public/bladefall-side-stories.js`: all 20 story definitions, dialogue trees, two medium follow-up choices per story, ordered regional objectives, persisted terminal outcomes, abstract reward values and exactly-once claims. Separate from the legacy six-quest ledger to preserve existing progression.
- `public/bladefall-side-story-world.js`: main-game character and prop installation, Up interactions, dialogue panel adapter, basic outcome tableaux, local reward/rest interaction, journal rows, ability/task gates, temporary local climbing paths. Portal tasks check real portal connections; gear and mould require dash/downward strike; the release checks an Echo contact; the signal accepts three short then two long notes; the hoist checks a local pushable cart; the sail task records hook use; the Colony water task requires its actual tap open.
- `public/index.html`: script includes, session/campaign save fields, load/update/render/input hooks and journal integration.
- `public/bladefall-respec-renderer.js`: delegates new objects to their small renderer. Existing work in this already-modified file was preserved.
- `public/sw.js`: includes new modules and advances offline cache generation.
- Rest is a provisional, region-local one-use reward (two blood measures), with rank 2 stored independently for future balancing. No new inventory or currency.

## Evidence and its limits

- `node --test tests/side-stories.test.mjs`: 64 passing tests, all 20 short/medium/harsh states, objective order, capability rejection, persistence, claim-once and archive burn distinction.
- Existing quests/story/dialogue/journey tests plus the new tests: 101 passed.
- `node scripts/validate-side-stories.mjs`: 60 browser dialogue paths through rendered buttons, task dispatch, level reload and rewards. **Uses explicit physical fixtures/teleports and granted capabilities. Does not prove authentic traversal or acquisition.** Receipt and desktop/mobile screenshots are in `docs/evidence/side-stories/`.
- Initial physical simulation found the original 90-unit optional steps exceeded the early jump. Changed to 56-unit rises and 90-unit horizontal increments. Sample movement checks reached all three steps in stages 0, 1, 7, 9, 11, 16 and 18. This early gap was subsequently closed by the 20 continuous local-loop checks below.

### Additional verified progress

- Reconnect/replay reward handling now retains host receipts in shared session packets and deduplicates receipt IDs on the guest. Two-client test verifies repeated receipts do not heal twice and an acknowledgment lost before reconnect still grants exactly once. Offline cache v328.
- Captured and inspected all 40 completed/harsh return-visit scenes across five sheets in `docs/evidence/side-stories/outcomes/`. Added small shade/awning/tea-link cues to make the garden, disappearing refuge and ongoing tea connection legible without extra dialogue. All 40 renders were subsequently refreshed after these cues and the final gatekeeper layout change.
- Broader `npm test` run finished (session 91919 terminal): 1,153 passed, 71 failed before final fixes. Archived log: `docs/evidence/side-stories/full-suite.log`. Three missing-module Continue harnesses were fixed and pass. The gatekeeper climb was moved off the mandatory gap; the coyote-boundary check passes. Basic-jump and shared-ground-pound failures reproduce with side-story geometry/world behavior disabled. Other broader failures remain unisolated; do not claim the whole suite is green. See the final audit.

- Added shared co-op side-story state to stage/session packets. Guest actions are submitted to the host; host decisions and acknowledgments are rebased over pending local dialogue input. A guest receives the one-use rest only after host confirmation. Host moves followers using either player and sends shared scene poses; remote recruit rescue uses the existing teleport message. Solo state stays untouched. Offline cache v327.
- `node scripts/validate-side-story-coop.mjs`: two browser instances exercise production packet encoding and `netOnMessage` over an in-memory transport. Guest acceptance/tasks/turn-in/reward, host-confirmed healing, shared stage state, conflicting decisions, solo isolation, and guest-led host-authoritative escort poses pass. This is transport integration coverage, not a real WebRTC signaling run. Receipt: `coop-validation.json`.

- Ability-loop validator now includes the miner and mother, bringing continuous local routes to all 20 quests. Miner uses actual ride/park/push/escort/ledger/turn-in/reward; mother uses an initial restored-spring checkpoint and actual cup retrieval, Sable interaction, return and reward. The separate water validator proves actual tap opening. No intermediate quest-state fixture or teleport.
- Earlier co-op audit found a gap, subsequently fixed and verified above: `coopSessionPacket` and `applyCoopSession` omit side-story state; guest world interactions bypass host authority via the early side-story hook. Decisions can diverge between players. Must add host-authoritative shared decisions/physical progress and preserve solo-save isolation before claiming co-op compatibility.

- `node scripts/validate-side-story-puzzle-loops.mjs`: four more complete local loops pass with real inputs and unforced interaction selection: cartographer, ember creature, tea neighbors and freed figure. Only initial earned-capability/post-Tyrant checkpoint fixtures; no intermediate teleport or objective fixture. Receipt: `puzzle-loop-validation.json`.
- Fixed companion interception when standing within 24 units of a quest speaker/prop. Oren had been taking the neighbors’ turn-in interaction.
- Citadel geometry fixed: the Echo contact now clears the existing overhead balcony, upper steps leave jumping room, and the scene/reward/refused figure stay inside the chamber walls. Full-loop check exposed the old reward outside the west wall. Offline cache v326.

- `node scripts/validate-side-story-ability-loops.mjs`: four continuous loops from regional rest through acceptance, real dash/slam/hook or escort, turn-in and reward claim now pass: Silas, automaton, recruit, sailors. No intermediate teleports or objective-state fixtures. Receipt: `ability-loop-validation.json`.
- Full-loop checks exposed and fixed actual selection/placement faults: recruit arrival now completes the crossing automatically instead of competing with the actor at the same position; the miner ledger sits 60 units apart from the miner; the sailors’ sharing marker is now on the aft deck rather than floating above its drop, and the speaker stands clear of the existing ship interaction. Recovery/journal check updated for automatic crossing completion. Offline cache v325.

- `node scripts/validate-side-story-consequences.mjs`: all 20 harsh branches after partial/full physical work preserve completed-step state and hide rewards on reload. Fixed the keeper’s specific refusal consequence: the service gate rebolts even if he previously opened it. Also verifies refuge remains during supper, disappears only on return, preserves unclaimed rest, and installs no side-story objects in any of the 20 Fractured stages. Receipt: `consequence-validation.json`; offline cache v324.

- Simple-route validator now also walks back to each actor, completes the conversation and collects the one-time regional reward through ordinary target selection (all ten pass). It walks close to actors/rewards so the adjacent scene-inspection prop is not selected instead.
- `node scripts/validate-side-story-recovery.mjs`: a mid-rescue fixture survives actual checkpoint placement/death/rebuild, and the restored recruit completes his walk under normal input in campaign and preview. Also verifies the journal objective through its pause-menu button without Mara’s chart. Receipt: `recovery-validation.json`.
- Fixed the remaining pause-menu chart gate on the quest journal. The journal function was accessible, but its button was still hidden. Offline cache v323.
- Native mobile-landscape swipe now verified to scroll overflowing dialogue without selecting a response, in addition to the existing consecutive tap check.

- `node scripts/validate-side-story-routes.mjs`: ten simple quest routes (gatekeeper, refuge, archivist, service keeper, winter, quota, alarm, birthday, pilgrim, garden) reach every objective from the existing rest checkpoint with ordinary movement and unforced interaction selection; all complete turn-in and reward collection. The keeper’s handle is beneath a ledge, so the route steps back before jumping. Receipt: `route-validation.json`.
- Harsh outcome visuals corrected: winter/refuge retain candlelight, winter thaws and the ember creature receives an improvised cooling pipe; the gardener/automaton withdraw and the pilgrim takes the sack farther along. Inspected `winter-harsh.png` in the running renderer. Offline cache v322.

- `node scripts/validate-side-story-placement.mjs`: all 20 actors reached with movement from their existing regional rest checkpoints, handling automatic Oren/Sable conversations through their buttons. Does not prove every task route or narrative setting. Receipt: `placement-validation.json`.
- Portal validator now includes the cartographer’s second/chimes climb and connection.
- Save validator now covers campaign and preview mid-rescue persistence (including the fallen brace), plus completed refuge disappearance on Continue with its unclaimed reward preserved. These use explicit state fixtures before actual reload/Continue.
- `node scripts/validate-side-story-water.mjs`: actual jump/downward-strike opens the Colony tap; the mother’s water task rejects the dry spring and succeeds afterward through ordinary target selection beside Sable. Uses cup-completed and conduit/return checkpoint fixtures. Receipt: `water-validation.json`.
- Bell quest now has two visible resting defenders after the signal and an alternate volunteer after refusal. The 60-path browser validator checks wrong-signal rejection, correct signal and these restored outcomes. Offline cache v321.

- `node scripts/validate-side-story-transport.mjs`: actual cart pushing, miner escort and return to riding pass from the local mine checkpoint; actual Chainhook input reaches the stranded sailor. Receipt: `transport-validation.json`. Real ship drift also preserves the actor, rescued sailor and ring offsets after the harbour-wake event fixture. Full regional approaches remain to check.
- Corrected basic outcome tableaux: the harsh sailors branch brings both sailors to the deck as promised; both quota workers sit after successful completion; the mother’s refused-player outcome still shows water received from Sable. Offline cache advanced to v320.

- `node scripts/validate-side-story-actions.mjs`: actual movement from local actor checkpoints and actual dash, downward-strike and gravity-flip inputs complete the Governor Gear, cooling mould and tea-service objectives. Uses granted earned-capability checkpoints, not synthetic action flags. Receipt: `action-validation.json`. This does not establish the full regional approaches.

- `node scripts/validate-side-story-escorts.mjs`: real movement input leads the recruit, miner and Silas from their local escort checkpoints. All wait when the player is absent, all arrive, and the recruit drops the helmet. Earlier item acquisition uses a saved-state fixture and is explicitly outside this test’s scope. Receipt: `escort-validation.json`.
- `node scripts/validate-side-story-saves.mjs`: Tab/Enter chooses harsh in the actual DOM; Escape closes; browser reload and Continue retain the refusal, hide its reward and restore the character. Separate campaign and preview contexts prove preview isolation. Receipt: `save-validation.json`.
- `scripts/validate-side-stories.mjs` now walks followers through the adapter rather than bypassing the escort gate; the 60 paths still pass.
- Shared `bladefall-conversation.js` version updated to 7.181.1; service-worker cache to v319.
- `node scripts/validate-side-story-portals.mjs`: actual portal key plus local walking/jumping successfully connects the wind funnel, cold channel and tea tables. Earned-ability checkpoint fixtures are used; tea-service retrieval is covered separately by the action validator; the second wind/chimes climb is now included.
- `node scripts/validate-side-story-echo.mjs`: the Citadel climb was moved inside its existing walls (old layout crossed the west wall). Actual movement, Echo key and release succeed before the Echo expires. The Echo is locked before the teaching encounter and available after a cleared-region return. Added a visible contact pad. Receipt: `echo-validation.json`.
- Conversation touch events are kept local so LittleJS cannot cancel menu taps; swipes scroll the panel without selecting an answer. `node scripts/validate-side-story-touch.mjs` passes with real mobile-landscape taps through two consecutive nodes. Portrait touch gameplay retains the game’s existing rotate-device overlay; the earlier portrait image was a layout check, not a portrait touch-play claim.

## Final verification status

- All 20 continuous local loops, all 60 rendered dialogue branches, 101 focused tests, save/Continue, consequence persistence, landscape touch and shared-session checks pass. Final ability/puzzle, branch, co-op, consequence, save and touch reruns also pass after the last changes.
- All 40 simple success/refusal tableaux were inspected. Latest captures include the gatekeeper layout and refuge/garden/tea cues.
- The three corrected Continue harness tests pass. Broader regression failures and test-fixture limitations are explicitly retained in the final audit; no full-campaign or live remote signaling claim is made.
- All requirements for the authorized functional optional-quest pass are covered. Remaining v4 design and whole-game QA are separate work.

## Current stories by stage

0 Gatekeeper; 1 Place That Will Not Remain; 2 Clockwork Defector; 3 Blind Cartographer; 4 Borrowed Courage; 5 Archivist’s Burden; 6 Stand Aside; 7 Perfect Day; 8 Little Winter; 9 Quota; 10 Small Work; 11 Tea on the Ceiling; 12 Other Side; 13 Last Alarm; 15 Bell Below; 16 Good Luck; 17 All at Once; 18 One Spoon at a Time; 19 Lightest Pilgrim; 20 Night Garden. Slot 14 is cut; 21 onward remain untouched by this feature.

## Remaining v4 design passes requested by the user

- Finalize knight/Echo wants, flaws, integration and ending sequence.
- Finish full branch scripts and return-visit continuity.
- Refine maps into more multidirectional routes and loops.
- Refine weapons, damage scaling, enemy health/resistances and bosses.
- Refine powers, unlock order and revisit uses.
- Design regional consumables/drops and no-bag handling.
- Refine shops and replace provisional reward ranks with balanced outcomes.
- Design Fractured quests and how previous choices return there separately.
- Full-playthrough pacing and accessibility review for mixed dialogue preferences.
