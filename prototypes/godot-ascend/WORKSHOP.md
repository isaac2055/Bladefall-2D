# Movement and Black Woods workshop · 0.20.0

These eleven standalone chapter-4 rooms include eight Outskirts movement puzzles and three Black Woods puzzles. Native scene: `levels/world4.tscn`. Source geometry and ordinary-input demonstrations: `data/world4.json`. No campaign scenes, quests, voices or connecting passages are part of this change.

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

The application checks use the actual gameplay controller for all eleven primary routes, completion awards, pickup death/retry, demonstration playback, next/previous controls, camera bounds and campaign isolation. GPU mode writes starts, critical machinery contacts, pickups, finishes and the menu:

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
