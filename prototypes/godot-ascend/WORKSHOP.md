# Active workshop · 0.26.0

The active list contains **30 rooms, ten per biome**: Outskirts 1–8 and 25–26; Black Woods 9–13, 20–22 and 27–28; Causeway 14–19, 23–24 and 29–30. New rooms are appended so earlier indices stay stable. Stored Rise, Turned Span and Loaded Span remain retired. Older imports retain the six additions. **Play Six New Rooms.command** starts at room 25.

The design history below retains original release numbering; references to the cut introductory studies describe historical work.

# Movement and Black Woods workshop · 0.21.0

These thirteen standalone chapter-4 rooms include eight Outskirts movement puzzles and five Black Woods puzzles. Native scene: `levels/world4.tscn`. Source geometry and ordinary-input demonstrations: `data/world4.json`. No campaign scenes, quests, voices or connecting passages are part of this change.

The Broken Relay and Behind the Counterweight are preserved from 0.15. The revised Lintel and Ferry address reported shortcuts and missing preparation; Engine and Circuit combine these relationships in larger spaces. Larger rooms scroll within their boundaries. The first two retain their fixed camera.

## The Broken Relay

Board the first carrier without spending the dash. Jump with horizontal momentum and dash onto the rising counterweight's lower side. Arrive with zero dashes, then use its upward launch to finish. Fixed overhead housing prevents standing on the second block to reset the dash. The witnessed route fails without either horizontal or vertical inherited momentum.

## Behind the Counterweight

Activate the weight, release and dash through its opened lower passage to the far wall. Catch the weight during its descent, then jump from that temporary higher foothold to the flag. Its parked low position and raised stop both fail to provide that foothold. The route survives disabled inherited momentum: the return supplies position, not an upward boost.

## Under the Lintel

Use the first lift to transfer onto the horizontal carrier while preserving the dash. The carrier takes you beneath a substantial dividing wall. Leave beyond that barrier with horizontal momentum and spend the dash toward the flag. Covered track prevents a standing reset.

The former layout could be bypassed with an ordinary jump retaining the first lift's upward momentum. The regression fixture reproduces that successful escape in the former room, then confirms it fails in the revision. The new partition makes the carrier's passage relevant. The recorded route needs horizontal inherited momentum but does not require vertical inherited momentum.

## The Return Ferry

Board the ferry from its side. Activate the gate on the outward crossing, climb and jump over its housing, then drop to the shard. Return beneath the low roof lip through the passage the gate has opened, collecting the return refill and dashing onto the retreating ferry. Recover there, then dash up and left over its home housing to the flag.

The gate must be prepared before the pickup in the demonstrated route. A real late-preparation route succeeded in an earlier draft; it is retained as a positive regression control. The revised geometry and cycle reject that route and the tested timing variants. Spikes on the roof lip prevent turning it into a safe return stepping stone. The home housing prevents an idle ferry from being an equivalent recovery point.

The ferry pauses for 60 frames rather than the default 30. A 90-frame draft admitted late gate preparation; the current duration accommodates the correct route without retaining that witnessed bypass. The goal requires returning with the shard; touching it and dying does not bank it.

## The Counterweight Engine

Launch from the horizontal block and dash onto the central counterweight with zero dashes. Its upward launch reaches an upper pocket containing a seal and a dash refill. There is no standing landing there. Drop and dash beneath the partition through the opened throat, catching the opposite wall with zero dashes. Then catch the same weight during its return and jump to the flag.

The central weight travels upward and slightly right, aligning its return with the far-wall catch. It supplies three connected functions: launch, cleared passage and returning foothold. A continuous partition prevents a direct pocket-to-flag dash. Freezing the weight at either endpoint after the pocket trip prevents the demonstrated finish. Removing the pocket refill or either launch-momentum component also breaks the route. The only recorded ground landings are the starting carrier and the finish.

## The Smuggler's Circuit

Prepare the gate outward and bring the seal back through the lower passage as in Ferry. Catch the returning ferry and recover a dash. Make an ordinary jump and upward dash to the high refill, dash onto the final lift with zero dashes remaining, ride it upward and jump toward the high home flag.

The final lift should be saved for the return. Its authored 600-frame return leaves a prematurely activated lift too high during the ordinary ferry recovery window. The early-activation counterfactual still collects the seal but fails the return chain. Removing the high refill, the ferry's return position or vertical inherited momentum also breaks the witnessed route. The high refill and finishing lift cannot be reached from the entrance floor in the tested jump/dash samples.

## The Divided Tower

The tall counterweight initially seals a narrow lower throat. Its initial overhead housing denies a standing dash reset on the parked block. Activating it changes both the opening and the reachable launch position.

The high route departs during ascent, uses the upward launch and an upward dash to reach the airborne refill pair, then dashes across the upper partition and stepped housing toward the flag. The low route releases into the opened throat, spends the dash crossing to the far wall, and catches the counterweight during its return before jumping toward the flag.

These are deliberately separate plans: removing refills breaks the high demonstration while leaving the low route playable; holding the weight at its raised stop leaves the high route playable but breaks the low route. The low route does not need upward inherited momentum. Static surfaces are guarded to prevent replacing either plan with a standing reset.

The independent search exposed actual stationary-block shortcuts in earlier drafts. Their full earlier room definitions and successful input sequences are retained as positive regression controls. A search failure in the revision is only evidence within its declared node/action budget.

## The Falling Gallery

Cling to the horizontal ferry and move outward beneath the dividing wall. Climb onto its exposed far section, jump and dash up beside the gallery cap, then steer onto the crumble platform. Landing restores the spent dash while the ferry's clock continues. Jump left to the shard on the interior wall. The used platform collapses, exposing the return shaft. Drop through it and dash to catch the ferry during its return, then leave for the home flag.

The shard is on the interior wall rather than the outer wall of the first sketch: this places the return shaft beside the pickup while the outward ascent remains farther right. The ceiling-anchored divider blocks a direct high return home. The exposed ascent area on the right remains a possible alternate route to investigate, rather than being declared impossible by inspection.

The cap has two connected jobs: outward foothold/resource recovery and return opening. The demonstrations fail when the cap is made permanent, the ferry is static/parked, or return dashes are removed. The normal collapse and respawn durations are unchanged. The ferry uses the existing authored 60-frame pause.

The second demonstration was found by a beam search choosing new inputs from a reachable pickup state. It uses a different return sequence, with no advanced movement. The same bounded search finds no return with the cap made permanent within 20,000 branches; that comparison supplies stronger evidence than replaying the first demonstration alone.

## Editing and timing

A moving fixture's optional Parameters dictionary accepts `holdFrames` and `returnFrames`, whole numbers from 1 to 3600. Defaults remain 30 and 120; activation and outward travel remain 4 and 30. The JSON route format is `[dx_tiles, dy_tiles, {"holdFrames": 60}]`; native scene compilation preserves the optional dictionary. Timing edits belong to the individual fixture. The ferry uses holdFrames=60; Circuit's finishing lift uses returnFrames=600. Campaign fixtures omit overrides and retain their existing behavior.

## Verification and limits

`tests/workshop.gd` checks six native editable rooms, preserved accepted-room definitions, timing validation/serialization/defaults, six deathless clears without advanced movement, observed contacts and resources, timing variations, causal counterfactuals and bounded shortcut searches. The search includes 270 Lintel departure variants, 288 late-gate variants, 60 return-wall jump/dash variants across Ferry and Circuit, and 48 Circuit entrance attempts. Positive controls reproduce the old Lintel shortcut and earlier late-preparation Ferry win.

The application checks use the actual gameplay controller for all thirteen primary routes, completion awards, pickup death/retry, demonstration playback, next/previous controls, camera bounds and campaign isolation. GPU mode writes starts, critical machinery contacts, pickups, finishes and the menu:

```sh
.cache/godot/Godot.app/Contents/MacOS/Godot --path prototypes/godot-ascend --script tests/workshop.gd -- /absolute/output/directory
```

Use `--headless` to run without captures. The report contains individual checks, route observations, counterfactual results and search counts. Browser parity separately protects default movement and machinery behavior.

A failed counterfactual replay proves a dependency of that replay; it does not establish impossibility of every alternative. Bounded searches broaden evidence but are not exhaustive. The authored timing choices and geometry still need human playtesting for readability, satisfaction and recovery options. Alternatives preserving the central relationships are welcome.

## Additional verification for the new rooms

Run `tests/new_workshop_rooms.gd` headlessly for preservation of the original six, both ordinary-input Tower routes, both Gallery routes, mechanic restrictions, timing variations, actual second-demonstration playback and independent searches. It saves checks and search reports when given an absolute JSON output path after `--`.

`tests/workshop_search.gd` branches over ordinary movement, climbing, jumping and eight dash directions. Branches retain exact player state, input buffers, fractional motion and device timers. It uses a bounded beam and a static spatial heuristic, so it is not exhaustive. Positive controls reproduce witnessed shortcuts in previous Tower drafts, and an independent successful Gallery return calibrates the search. The static-block cases start from spawn; the Gallery recovery comparison begins from a reachable pickup state and searches fresh subsequent inputs.

Human playtesting is still required for route readability, pacing and satisfaction. The tests establish playability and selected causal relationships, not a universal claim that no other solutions exist.


## Black Woods rooms 9–11

| Room | Decision |
| --- | --- |
| 9 · The Borrowed Branch | Short introduction: use blue for the approach, then ring the bell to restore a climbable trunk. |
| 10 · The Crooked Orchard | Prepare blue for the approach dash. That dash restores amber; use the pod's phase-preserving rebound to retain the catch. At the upper bough, ring the bell before the final dash so the exit landing will be amber again. |
| 11 · The Hollow Crown | Remove the approach bough and roots together. Cross using the pod while roots remain ghosted, restore them after passing the earlier stems, recover on the far bank, climb their far side, then dash out to create the blue goal landing. |

Orchard separates preparation, preservation and a later deliberate change. A rebound dash can remove the landing it seems to help reach. Crown ties the disappearing approach to the passage through the roots, then reuses those roots for the return climb. There are no stake quotas or crumble deadlines in these rebuilt rooms. Both larger rooms scroll within separate bounds and retain their own retries. H reveals an optional hint; Esc offers demonstrations.

The Sideways Orchard, Unwanted Bell, Hollow Landing, Last Stake, Forked Canopy and Two Boughs are retired. Older native backups and Git retain them. Old portable editor documents merge matching active IDs and keep a complete browser backup of documents containing retired rooms. Loading an older surviving room replaces that room's draft layout for review; it does not save automatically.

### Black Woods verification

`tests/woods_workshop.gd` compares all eight original definitions, roundtrips the native scene, plays the three deathless ordinary-input routes, observes the important phase/position decisions, checks multiple arrival timings and plays the demonstrations through the actual application. Restrictions on the recorded routes check their dependencies; they do not establish that every alternative needs the same mechanic.

Fresh input searches found two actual pod skips during rebuilding: a low wall catch in Orchard and safe pockets below ghosted roots in Crown. The former layouts and successful recordings remain positive controls in `tests/fixtures/woods-consolidation-bypasses.json`. The revised geometry rejects those recordings. `tests/woods_shortcuts.gd` searches for new inputs toward the relevant intermediate landings, with positive controls against both former layouts. These are bounded beam searches; failure to find a bypass does not prove none exists. Automation also does not establish that a room is enjoyable.

The simple editor checks Woods object roundtrips, old six/eight-room imports, seventeen-room draft consolidation and unknown-ID rejection. `tests/workshop.gd` plays every primary solution through the real application and checks completion, camera bounds and campaign isolation.

Art replacement continues to use the fixed 8px gameplay grid and logical object rectangles. Rendering is separate from collision. Pods, bells and phase branches remain individual native authoring objects; terrain spikes remain grid hazards. No movement rules were changed for these rooms.

## New rooms 12–13 · 0.21.0

**The Overturned Hollow.** Dash to blue to remove the starting amber floor and descend to the pocket. Walk under the fixed divider. The pod rebound passes through the absent far cap; restore amber after entering the upper opening so the cap catches your feet and refills the dash. Leave from that recovered landing toward the flag. The fixed divider separates the starting and finishing halves, preventing the final floor from being reachable at the beginning. A permanent-cap counterfactual blocks the upward route.

**The Returning Seed.** A low window accepts a diagonal cut while keeping the player outside. Hold jump during that cut to rebound outward without changing blue. The low canopy and guarded face prevent replacing that rebound with the discovered ordinary-jump crossing. Follow the blue branches around to the high bell, entering its side of the adjacent phase partitions first. Amber removes the pod roof and the outward branches, while closing the outside approach. Return to the same pod from above and the other side, then dash to blue to create the homeward landing. The initial side-shot sketch was revised because it allowed a direct ordinary jump to the far bank; the completed route uses the existing diagonal downward loft.

These rooms retain separate retries and optional demonstrations. `tests/new_woods_rooms.gd` checks the preserved three Woods layouts, both ordinary routes, physical phase/position decisions, the single pod's two uses, multiple timings, former shortcut recordings and actual application playback. The original eight are still compared by the existing Woods suite. `tests/new_woods_shortcuts.gd` chooses fresh inputs, with positive controls, looking for a pod-free Hollow ascent, a Seed finish without its far loop, and a pod-free Seed crossing. Searches are bounded evidence, not proofs that every shortcut is impossible or that the rooms are enjoyable.

The editor integration checks cover thirteen rooms and merging older eleven-room files. All gameplay geometry remains on the 8px grid, with rendering separate from collision. No simulation changes were made.


## Return pickup modes · 0.22.0

Returning Seed requires three shards: one on the far bank (296, 216), one among the upper branches (272, 144), and one at the upper bell approach (184, 104). Every shard must be collected during the current attempt and brought to the gold flag. The existing ordinary-input demonstration collects all three. This adds the explicitly requested route requirement; it does not claim that only one precise movement sequence is possible.

The editor exposes **Return shard · one** and **Return shards · all**. Both place the existing shard; choosing a tool also sets the room's finish rule. Room settings can change that rule or make pickups optional. This avoids separate lookalike collectibles with conflicting requirements. The all mode counts every enabled shard in the room and displays collected/total progress. Retry or death resets unbanked inventory; the successful return banks the room award. Older editor files default to the existing single/optional behavior.

`tests/return_pickups.gd` checks the three ordinary-route collections, rejects each missing shard separately, verifies single-return behavior, HUD progress, reset/banking behavior and demonstrations. The browser integration checks both tools and their native save roundtrips. The older outward-crossing search uses a physical stage goal with pickup requirements disabled so it continues to test the geometry independently of the new finish rule.


## Causeway machinery studies · 0.23.0

Three separate rooms follow the Woods rooms, with the Causeway dusk palette and existing mechanical artwork. The original thirteen source definitions and input recordings are preserved. No connecting passages, finale, quest, new voice, new art asset or movement tuning is included.

**14 · The Stored Rise.** Two independent plates form a climb with a stable recovery between releases. Hold Down to load, release, and jump during the rise. The second landing is higher and asks for a later departure. Guarded cliff faces discourage replacing the launch with a side climb. Both plates retain the existing three-cell depth, 30-frame loading and 120 px/s release rules.

**15 · The Turned Span.** The upright arm blocks access to the far bank. Strike the visible hub to turn it right, converting that obstacle into an eleven-cell bridge. The overhead teeth make a short entry hop useful and guard the former upright route. A final ordinary jump/climb reaches the flag. The hub can safely reject a blocked turn; retry restores its upright pose.

**16 · The Loaded Span.** The initial plate reaches the otherwise elevated hub landing. The turned arm bridges the gap to the second plate. Its final launch has a different approach: go up before steering across the guarded cliff. This develops the preparation → changed surface → new launch relationship with the existing physics. The far plate is deliberately compact; its full two-cell deck is visible in the editor.

All three are explicitly no-dash studies. The editor supports creating, moving, duplicating and deleting both mechanism types, editing their meaningful parameters, native save/load, backup and import. Arm hit testing and validation use the complete initial pose, including up/left extensions around the hub; terrain cannot be painted through that body. The runtime's rejected-turn rule remains authoritative for subsequent poses. Native Godot mechanism previews also show their actual plate/arm geometry.

`tests/causeway_workshop.gd` verifies ordinary deathless routes, observed recoil and turn events, nearby timing variations, counterfactual recordings, application awards, resets, demonstrations and biome switching. `tests/causeway_shortcuts.gd` runs fresh finite input searches with legitimate late-approach positive controls and loading/turning disabled in separate cases. A negative search means no bypass found within that budget; neither it nor an intended tape proves a unique route or human enjoyment. Browser checks cover new mechanism placement, native runtime parameters, edited settings and older thirteen-room imports. The normal workshop suite continues to play every primary route through the actual application.


## Approved Causeway puzzles · 0.24.0

Rooms **17–19** implement the three approved proposals as new checkpoints, preserving all sixteen earlier rooms and recordings. Completion remains physical flag contact plus the visible return shard in the first two rooms; there are no hidden machine-use counters.

**The Bridge You Must Remove.** The right-facing arm is needed to reach the far shard. A guarded low passage discourages launching over the missing bridge. After returning with the shard, a downward-left cut near the hub folds the surface away and drops the player onto the spring. The intact bridge is also a ceiling: a real alternative route below it can reach and charge the plate, but its launch cannot reach home until the bridge is removed. The return launch crosses above the folded hub into the starting side's upper flag shelf.

**The Wrong First Turn.** A starts upright and B starts left. A right conflicts with B up; A down conflicts with B left. A first therefore locks both next moves. B must pass through up and continue right before A can cycle to left. A's left bridge reaches the required shard shelf. B can then cycle through down and left to its final upright climb. A one-way landing at the top makes the exit movement forgiving; a preserved positive-control recording reproduces the former climbable-landing bypass. Camera framing keeps the primary machine relationships and upper exits visible from the service ledges. The player can reach both service ledges; initial jams, premature B-up, temporary staging and final positions are checked independently. R resets the short puzzle after a mutual lock.

**Leave Your Weight Behind.** The resting plate occupies the arm's next horizontal position. A lantern depresses the plate and remains in contact as it descends, allowing the player to reach the distant hub and advance the arm through right to down. Self-loading and walking over releases the plate too early, restoring the obstruction. Once the upper passage is clear, the player retrieves the lantern and launches through it. The carried lantern already existed; the simple editor now exposes it.

The recoil contact fix carries resting lanterns with the plate and rejects movement that would collide their load with solid geometry. It is restricted to recoil platforms; existing lift/player movement rules and constants are unchanged. Search snapshots also reconnect the carried-lantern reference to the restored entity so independent input branches represent real inventories.

`tests/causeway_puzzles.gd` checks hashes for the sixteen preserved rooms, ordinary deathless solutions, the actual proposed wrong plans and mechanical dependencies, nearby timings, real application clears, demos, retries and deaths. `tests/puzzle_shortcuts.gd` searches for alternate ordinary-input routes that omit specific puzzle dependencies, with late-approach positive controls. These finite searches are evidence against easy bypasses, not exhaustive route-uniqueness or enjoyment proofs. Browser integration checks lantern creation/movement, native persistence and sixteen-room imports. The packaged regression suites retain the existing workshop and Causeway campaign coverage.


## Causeway puzzles with the normal dash · 0.25.0

These are independent rooms **20–22**, opened by **Play Dash Puzzles.command**. Each keeps the standard one-dash kit and existing machinery rules. There are no hidden objective counters or custom dash locks.

**The Landing You Must Spend.** Recoil and dash onto the horizontal shaft lid. Landing restores the dash; folding that same surface opens the shaft. The lower opening requires the saved charge. The capped left wall and tall right wall prevent an alternate ground refill or walking around the lid.

**The Obstruction Is Your Landing.** The initial sliding stone blocks the arm’s next pose. Both horizontal docks clear that pose, but only the right dock puts the stone inside the shaft. Entering the shaft spends a dash; landing on the relocated obstruction restores the charge for the lower exit. The small port admits the stone but guards against following it. A wrong left dock is recoverable by jumping back around the stone and shoving right through the lower service clearance. The one-way service ledge allows a drop-strike at the hub, then an upward dash back to the ledge.

**Your Shortcut Cannot Carry the Weight.** Carry the lantern over B and park it on the plate. B must then fold upright, removing the carrying route and clearing A’s downward pose. Dash back empty-handed and turn A through right to down while the lantern holds the plate below A’s first pose. Return across the gap, recover and set aside the lantern, then recoil and dash through the opened upper route. The high flag and guarded upper B prevent substituting a normal jump from the newly upright arm for the final launch. Carrying restrictions are unchanged.

`tests/dash_puzzles.gd` checks all original 19 room fingerprints, native roundtrips, normal-dash solutions, actual refills, obstruction reasons, wrong-dock recovery, nearby input timings, application awards, retry/death reset and Watch. Browser integration also edits all three rooms through native saves and checks older nineteen-room imports. Shortcut searches are bounded evidence, not proofs that every unintended sequence is impossible.

## Five appended puzzles · 0.27.0

The five approved concepts are implemented as rooms 20–24, using the normal one-dash kit. No movement constants or new gameplay mechanics were introduced. Rooms 1–19 retain their exact definitions, placements and recordings. Their indices stay stable; the new Woods and Causeway rooms are appended.

**20 · The Root That Stops the Stone.** Prepare blue before the shove so its dash recreates the amber stopping root. The parked stone gives access to the upper bell. The main demonstration opens blue and uses the pod to preserve it. A second deliberate plan rings amber again while airborne, climbs the restored root, then dashes blue through it to the finish. That alternative keeps the useful-stop-then-remove relationship; the pod is not mandatory on every valid solution. The protection against materializing geometry through the player remains unchanged.

**21 · Two Ways Through the Canopy.** Both routes finish at the same amber flag. The upper prepares blue before its approach dash, preserves amber at its pod, rings blue inside, and dashes back to amber. The lower approaches without ringing the first bell, uses two blue-preserving pod rebounds, rings amber inside, then clears its partition before dashing blue and finally amber. Watch offers both routes. A normal hop through a one-way ledge is part of the lower service approach.

**22 · The Ferry Beneath the Roots.** The idle ferry covers the outward pod approach. Activate it, use the blue upper path, collect the visible far shard and ring amber. That removes the old walkway and reveals the return ledge. Catch the ferry without dashing; its return movement carries the normal walljump past the entry root. Delay the upward blue dash until clear of the home divider. The ferry uses a broad hold window of 420 frames and the existing 120-frame return; no collapse timer or hidden machine-use quota is added. A counterfactual search with horizontal inheritance disabled still finds a finish using the transported foothold, so the velocity boost is not claimed as the room's global dependency. A separate search freezes the ferry at its remote dock to test removal of return transport.

**23 · The Weight You Can Finally Move.** One lantern loads the first plate so the arm can turn right. Retrieve it from the side ledge; the rising plate safely jams against that arm, leaving its charge ready to resume. Carry the lantern across, descend to the second plate, and load it to clear the downward pose. Turn the arm down, freeing the first plate completely. Return to that plate and use its recoil plus the normal dash to reach the flag. Standing beneath the arm during the first plate's release is unnecessary.

**24 · The Dock You Need Only Once.** B begins down as the temporary stop. The starting stone sits beneath a low roof, and the upright A is guarded, so those stationary shapes cannot replace the preparation. Shove the stone to clear A, turn A into a bridge, then use the exposed temporary dock to reach the far service ledge. Turn B left for the return bridge, return and send the stone to its permanent dock. B's left pose also supplies the recovery needed to revisit the far ledge; only then turn it upright for the final launch. Recover on upright B, reach the relocated stone, recover again and jump/dash to the flag. The near slot rejects the left pose when occupied; the far ledge gives clearance. B's down pose meets the lower foundation so an underpass cannot replace the dock. A visible guarded housing obstructs B's unused right pose, preventing a substitute bridge. The permanent stop and flag face are guarded, and the final gap rejects the tested direct launches from B. These are physical changes to the proposal's initial pose and turn order, with no scripted lock or new mechanic.

`tests/five_puzzles.gd` checks ordinary routes and physical decision states. `tests/five_puzzles_app.gd` compares preservation fingerprints, native compilation, actual application clears, all demonstration selections, rewards, retries and deaths. `tests/five_puzzle_bypasses.gd` reproduces witnessed shortcuts in their original drafts before checking revisions. `tests/five_puzzle_search.gd` chooses fresh inputs for specific omitted preparations, with a successful Canopy control; finite budgets limit what its negative results establish. These checks do not establish route uniqueness or enjoyment. The browser integration suite covers the actual preceding nineteen-room export, all five canvases, and native editing of their mechanisms and fixtures.


## Six appended rooms · 0.28.0

Rooms 25–30 implement the proposals in [NEXT-SIX-ROOMS.md](research/NEXT-SIX-ROOMS.md), bringing each biome to ten. The previous 24 room definitions, section placements and recordings remain identical. All six use existing mechanics and the normal one-dash kit. No campaign rooms, movement constants, quests or voices changed.

**25 · The Load That Opens the Lift.** Use the lift to reach the lantern, carry it down to the remote pressure plate, then board again without cargo. The delivered weight holds the distant full-height gate open. Its guarded lower face prevents climbing the closed gate to substitute for the lift. The lift waits long enough to climb onto its top before crossing to the lantern shelf; wait for it to move down before carrying the lantern across its shaft.

**26 · The Descending Invitation.** Touch the initial side to send the lift down. Visit both visible return shards, board below, move to its left edge, and jump from the upward return toward the home flag. The parked lift's roof prevents it supplying a standing reset at the start. The flag needs both shards; collecting them alone does not prove use of the machine.

**27 · The Lantern and the Missing Root.** Dash onto the blue bridge and pass through the ghost amber trunk to the far lantern. The bell lets the player correct phase before pickup. Carry home, leave the lantern on the plate, then dash through the opened ceiling to restore the amber landing. Setting cargo down to correct phase or throwing it are legitimate alternatives to explore; no hidden action counter enforces the demonstrated order.

**28 · The Landing You Make in Midair.** Down-cut the pod in amber. Pass through the absent cap, then dash upward to make both blue surfaces solid and land on the higher flag. Early changes catch the player below the cap. Occupied-root protection admits an earlier valid timing too; the useful change is a band, rather than an exact threshold. The guarded higher landing cannot be replaced by jumping normally from the lower cap.

**29 · The Spring Under the Stone.** Dash the stone to its distant stop, then load the freed recoil platform. Its release reaches the relocated stone, where the player recovers a dash for the final crossing. This fixture uses a release speed of 150 with the existing movement cap; global movement is unchanged. The fixed stop has guarded faces and a spiked top.

**30 · The Launch Waiting on the Return.** Load and recoil onto the initially high lift, sending it down. Visit the visible shard, board again below, and use its upward return for the final jump and dash. The first recoil prepares the machine needed for the later launch. Both descending lifts use generous holding intervals, with standing recovery available below.

The browser editor exposes the existing `_` pressure plate and rectangular `H` weight-held gate as separate editable objects. Any held plate opens all weight-held gates in its room; a resting lantern can keep it held after the player leaves. The gate closes once the plate is empty and its opening is clear. These differ from stake gates.

`tests/six_puzzles.gd` checks ordinary-input clears, observable load/phase/machine states, counterfactuals and nearby input timings. `tests/six_puzzles_app.gd` checks preservation, native parity, real controller playback, retry/death and Watch without awards. `tests/six_puzzle_search.gd` uses fresh ordinary inputs with positive controls and bounded shortcut searches. Negative searches establish only what was not found within the stated budget. Browser checks cover every new room, editable pressure/gate objects and actual previous-24 export migration. These checks do not establish enjoyment or exhaustive route uniqueness.
