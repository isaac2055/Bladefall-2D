# Six linked movement rooms · 0.16.0

These standalone chapter-4 rooms use Outskirts movement and contact-activated blocks. Native scene: `levels/world4.tscn`. Source geometry and ordinary-input demonstrations: `data/world4.json`. No campaign scenes, quests, voices or connecting passages are part of this change.

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

## Editing and timing

A moving fixture's optional Parameters dictionary accepts `holdFrames` and `returnFrames`, whole numbers from 1 to 3600. Defaults remain 30 and 120; activation and outward travel remain 4 and 30. The JSON route format is `[dx_tiles, dy_tiles, {"holdFrames": 60}]`; native scene compilation preserves the optional dictionary. Timing edits belong to the individual fixture. The ferry uses holdFrames=60; Circuit's finishing lift uses returnFrames=600. Campaign fixtures omit overrides and retain their existing behavior.

## Verification and limits

`tests/workshop.gd` checks six native editable rooms, preserved accepted-room definitions, timing validation/serialization/defaults, six deathless clears without advanced movement, observed contacts and resources, timing variations, causal counterfactuals and bounded shortcut searches. The search includes 270 Lintel departure variants, 288 late-gate variants, 60 return-wall jump/dash variants across Ferry and Circuit, and 48 Circuit entrance attempts. Positive controls reproduce the old Lintel shortcut and earlier late-preparation Ferry win.

The application checks use the actual gameplay controller for all six routes, completion awards, pickup death/retry, demonstration playback, next/previous controls, camera bounds and campaign isolation. GPU mode writes starts, critical machinery contacts, pickups, finishes and the menu:

```sh
.cache/godot/Godot.app/Contents/MacOS/Godot --path prototypes/godot-ascend --script tests/workshop.gd -- /absolute/output/directory
```

Use `--headless` to run without captures. The report contains individual checks, route observations, counterfactual results and search counts. Browser parity separately protects default movement and machinery behavior.

A failed counterfactual replay proves a dependency of that replay; it does not establish impossibility of every alternative. Bounded searches broaden evidence but are not exhaustive. The authored timing choices and geometry still need human playtesting for readability, satisfaction and recovery options. Alternatives preserving the central relationships are welcome.
