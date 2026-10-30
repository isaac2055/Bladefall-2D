# Next five workshop rooms — proposals only

2026-10-29. Approved and implemented in prototype 0.27.0 as rooms 20–24: three Black Woods rooms and two Causeway rooms. The retained lineup is eight per biome, 24 total. All five have ordinary-input demonstrations and editor support; no voices or quests were generated. The design proposals below record the approved intent; implementation details and validation are in `../WORKSHOP.md`. The Root room also supports a deliberate restored-root climb followed by a blue dash, alongside its pod route. In the final Dock build, B starts down; visible housing obstructs its unused right pose so cycling it back into a bridge cannot skip relocating the stone. B's left pose provides the return bridge before relocating the stone; the player then revisits the far ledge for the upright pose. A low housing over the initial stone prevents it serving as the temporary dock. The temporary-platform and second-dock relationship is retained.

All five use the existing 8px grid, one normal dash, current collision and carrying rules, and existing editor objects. These are spatial hypotheses; dimensions and mandatory relationships remain to be measured after approval. A useful alternative solution is welcome if it preserves the main discovery. No hidden machine-use counters are proposed.

## Black Woods 1 — The Root That Stops the Stone

**Question:** When do you need an obstruction to exist?

A sliding stone sits on a horizontal track. An amber root lies partway along it; a permanent stop lies much farther away. A pod and the next blue bough are positioned so that the stone is useful at the intermediate root stop, but poorly placed at the distant stop.

The obvious action is to dash the stone toward the pod. Because a dash also changes phase, doing this from amber removes the very stop needed to position the stone: it runs too far.

Intended plan:

1. Set blue at the starting bell.
2. Dash into the stone. This simultaneously shoves it and restores the amber root that arrests it at the useful position.
3. Reach the parked stone and recover on its top.
4. Ring the accessible bell to remove that root and create the blue onward bough. Removing a stop does not restart an idle stone.
5. Use the pod from the new approach while preserving blue, reaching the onward bough without reflexively dashing it away.

**Discovery:** the root is first useful because it blocks something, then useful because it disappears. The dash prepares both the stone and its stopping geometry.

**Why add it:** this develops the coupled movement/phase decision through a persistent, visible spatial consequence. It gives the pod an approach that preparation created, rather than simply raising a destination until pogoing is compulsory. The sliding stone is an existing palette object, not a new forest mechanism.

**Before accepting a build:** confirm the phase stop actually arrests the stone; a stone at the permanent far stop must not provide the same easy pod approach. Check reverse shoves and diagonal hits, dash skips, alternate bell access, and grounded recovery. Prefer a way to reposition the stone over an unnecessary dead end. Do not make the phase root materialize through the stone or player.

## Black Woods 2 — Two Ways Through the Canopy

**Question:** Which phase plan matches the route you chose?

A central bell housing has an upper outside route and a lower inside route to the same amber finish. Each route reaches a different useful side of the housing. Both are intentional solutions, but they need opposite early preparation and different later phase transitions.

The temptation is to take whichever nearby bell or bough looks useful, then improvise the rest. That can provide an immediate foothold while setting up the wrong route farther ahead.

**Upper plan:** ring the bell to blue before the approach dash; that dash restores the amber upper catch. Use the pod while preserving amber. Reach the bell's far service face, set blue, then make the finishing dash that restores the amber goal landing.

**Lower plan:** leave the starting bell alone. The approach dash sets blue and opens the amber entrance root. Use the pod to keep blue through the inside crossing. Ring the bell from inside to amber; the next dash removes the amber exit partition and lands on a fixed staging ledge in blue. From that recovered position, the finishing dash restores the amber goal landing.

Phase ledger, where A is amber and B is blue:

- Upper: A → bell B → approach dash A → pod A → bell B → finish dash A.
- Lower: A → approach dash B → pod B → bell A → exit dash B → finish dash A.

The ledges between dash crossings must provide ordinary recovery; neither plan assumes two stored dashes. Bell approach positions and the housing separate the routes, rather than requiring an invisible route selection.

**Discovery:** there is no universally correct bell setting. A coherent plan must account for the changes caused by its own dashes. Two different plans can be correct; mixing their preparation is the mistake.

**Why add it:** this aims to earn two routes through different reasoning, rather than repeating the retired Forked Canopy's simple choice of movement corridor. It extends the successful multiple-solution idea of Divided Tower into phase planning. It also gives room for player preference without making either solution advanced movement.

**Before accepting a build:** test both from spawn, mixed preparation, repeated bell strikes, access through the other route's service face, and direct access to the shared staging/finish. Reject a layout where one generic bell sequence solves both corridors without understanding their different arrivals. Physical geometry must enforce the distinction; do not lock a route by script.

## Black Woods 3 — The Ferry Beneath the Roots

**Question:** What must be ready before you remove your route back?

A blue bough offers an outward path above a moving ferry. The far bell removes that bough and a staggered blue barrier across the lower return throat. The flag is back above the entrance. The ferry's useful return position is beyond its starting housing, where its launch can reach the homeward approach.

The tempting plan is to walk straight along the bough and ring the far bell. That opens a shaft but leaves the ferry parked in its unhelpful starting position. An attempted rescue dash restores blue and restores the next barrier ahead.

Intended plan:

1. Activate the ferry from its side on the outward trip, then use the blue route to reach the far bell.
2. Ring the bell to amber. This opens the lower shaft while removing the easy upper walk back.
3. Drop through the opened shaft and catch the returning ferry without dashing; a normal grab/jump approach preserves amber until the body has cleared the last barrier.
4. Use the ferry's return position and launch to reach the homeward approach.
5. Dash after leaving the shaft. This restores the blue goal catch when it is finally useful.

**Discovery:** the action that opens your descent also removes the old return route. The dash that would normally rescue you changes the room in the wrong way until you have cleared the shaft.

**Why add it:** this combines preparing a moving object for a later journey with Black Woods' changing geometry. The ferry's motion, the removed floor, and the delayed dash participate in the same return problem. It develops an existing successful relationship rather than introducing another mandatory bounce.

**Before accepting a build:** the ferry must have a broad, readable catch window with ordinary fixture timing overrides if needed; no tight collapse timer or permanently broken crumble is assumed. Test an idle ferry, late activation, a direct dash home, alternate shaft approaches, all eight dash directions, the existing protection against materializing phase geometry through the player, and whether a player can leave the starting ferry's housing directly for the flag. If the room is solved by simply racing, revise the geometry and planning rather than tightening timing.

## Causeway 1 — The Weight You Can Finally Move

**Question:** When has the machine taken over the job your weight was doing?

One lantern and two recoil plates affect successive poses of one exit arm. At rest, the first plate blocks the arm's right pose. The second plate blocks the end of its later down pose. The arm's right pose also provides the carrying route toward the second plate.

The tempting plan is to carry the lantern directly to the second plate, or to remove it from the first before turning the arm. Both leave the first required pose obstructed.

Intended plan:

1. Leave the lantern loading plate 1, clearing the arm's next pose.
2. Turn the arm right. Its bridge now occupies part of the space into which plate 1 would rise.
3. Retrieve the lantern from an adjacent service ledge outside the arm’s footprint, rather than standing beneath the rising plate/arm gap. The unloaded plate starts rising but safely jams against the already-positioned arm; that arm has taken over the weight's holding job.
4. Use the exposed end to step/jump onto the arm and carry the lantern across the new route and load plate 2, clearing the arm's downward destination.
5. Turn the arm down. Removing its horizontal body also releases plate 1 to return fully.
6. Return to the now-unobstructed first plate and use its recoil launch and normal dash to finish.

**Discovery:** the lantern is needed to establish a state, but does not need to maintain it once another solid takes over. Moving it becomes possible only after that change.

**Why add it:** Leave Your Weight Behind asks the player to maintain one remote load. This develops that idea into transferring a single resource between dependencies. The intermediate bridge holds a plate, transports the weight, and later must move away to free the final launch.

**Before accepting a build:** verify the existing safe recoil jam retains the necessary clearance and automatically resumes when the arm leaves. This is a physical obstruction, not a new latch mechanic. Check both carrying approaches, player clearance while retrieving the lantern, thrown-lantern shortcuts, skipping either plate and reaching the finish from an intermediate arm pose. Do not assume the hinge sweeps the player or carries the lantern through its turn.

## Causeway 2 — The Dock You Need Only Once

**Question:** Why would you deliberately park something short of its final destination?

A sliding stone initially blocks arm A from becoming a bridge. Arm B can become a temporary stop in the stone's track; later, that same B must become the upright launch/climb surface. A permanent far stop will eventually place the stone at the final recovery point.

The tempting plan is to send the stone straight to that distant final dock and cycle B immediately to its final upright pose. The intended layout denies the service access needed to make that ordering work.

Intended plan:

1. Put B down into the stone's track, making an intermediate stop.
2. Dash the stone against it. This clears A while parking the stone where it can complete access to B's far service ledge.
3. Turn A into the bridge and use the bridge/temporary dock to reach that service ledge.
4. Cycle B through left to up, removing the temporary stop and preparing the later climb. The service ledge provides safe clearance through these turns.
5. Return along A and shove the stone again, now sending it to the permanent far stop.
6. Use B's upright route to jump/dash onto the remotely parked stone, recover there, then dash through the final gap.

**Discovery:** the first dock is a work platform for changing the room, not the final answer. One object needs different positions at different stages, and B changes from a stop into a traversal surface.

**Why add it:** The Obstruction Is Your Landing chooses one useful destination; this asks the player to create a temporary destination, use it, dismantle it, and reposition the same object for a second job. A and B affect how the stone can be moved and where the player can operate them.

**Before accepting a build:** this proposal depends on genuine service-access geometry. In particular, B must not be freely cyclable from the near service slot before A/stone preparation; the next pose and near-side headroom can provide physical clearance constraints, while the far ledge permits the later cycle. Test that first. Also test sending the stone straight to the permanent stop, keeping the temporary dock forever, bypassing the final recovery via B, and recovering a wrong shove. Reject the layout if it needs a scripted ordering lock or compulsory advanced movement.

## Approval boundary

The user approved all five concepts. Their builds preserve the nineteen existing rooms, normal movement and individual retries. The new Root alternate is a different phase plan, rather than a mandatory pod requirement. Discovered simple shortcuts have replay fixtures; bounded searches and application/editor checks document their practical coverage. User playtesting remains the test of whether these belong in the liked lineup.
