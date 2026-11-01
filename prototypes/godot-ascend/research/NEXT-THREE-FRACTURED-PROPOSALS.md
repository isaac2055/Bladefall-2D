# Three more Fractured Outskirts proposals

2026-11-01. **Approved and built for 0.31.0.** The user approved all three after accepting the earlier carriage and wavedash revisions. They now follow that trio, each with its own checkpoint. The descriptions below preserve the original design intent; implementation details and evidence follow them.

The builds use current one-dash movement, ordinary wall jumps, existing machinery and the wavedash introduced in the revised rooms. The aim is a distinct decision followed by a short execution. The layouts below began as untested hypotheses; each implemented room now has a normal-input reference.

## 1. The Ceiling You Walk On

**Question:** How can using the upper path make the lower path possible?

**Setup and plan.** A crumble slab is the landing of an accessible upper detour and the ceiling of a lower launch chamber. Its underside blocks the upward escape from that chamber. Take the upper detour, step onto the slab until it breaks, then drop to a safe lower landing. Wavedash from there, preserve the recovered dash and spend it upward through the opening where the slab used to be.

**Discovery.** The detour is preparation: walking on the ceiling changes the route below. The slab's disappearance should reveal the upper exit before the player commits to the wavedash. The lower landing should allow the player to settle and see that opening.

**Why this develops the earlier rooms.** Survey Stone and Cracked Road already use temporary footing; simply adding another crumble-to-super sequence would repeat them. Here the slab's useful final role is its absence. Unlike Falling Gallery, there is no ferry catch, shard circuit or return shaft: removing overhead collision creates the final dash direction. Unlike Door You Need Shut, the player removes a surface rather than creating one.

**Risks and acceptance checks.** The existing crumble respawn is a real deadline. Keep the upper-to-lower drop short, and verify that a comfortable settle, wavedash and exit fit within its ordinary duration. If the plan needs immediate frame-perfect departure, redesign or reject it. Try the unbroken ceiling, direct upper-route escapes and ordinary jumps from the lower landing. Breaking the slab must matter; a wavedash from the upper detour must not bypass the decision. Retry restores the slab.

## 2. The Catch Below the Exit

**Question:** Why should you lower yourself before trying to get higher?

**Setup and plan.** A moving hook carries the player toward a divider with a low opening. The high hanging position is tempting because the exit is above, but it meets the divider. Reel down while the approach is safe, pass beneath the divider, then reel up on its far side and jump onto a resting shelf. From that shelf, a short wavedash and the retained upward dash reach the exit above the divider.

**Discovery.** Hanging height is a route choice. Getting lower first preserves access to the high finish. The resting shelf separates the positioning puzzle from the final launch; it should restore stamina and give time to inspect the exit.

**Why this develops the earlier rooms.** Pass Below the Passing Thorn already teaches moving-hook control, so another timed duck under a sweeper would be repetitive. This uses fixed architecture and a deliberate change in rope length. It develops the successful carriage room's useful-contact question through height rather than another face swap. The rest prevents the whole puzzle becoming one long stamina test.

**Risks and acceptance checks.** Use the existing moving hook and reel limits; do not invent a new grapple action or attach a secret height check to the exit. Both the low opening and far shelf must fit the real actor and rope geometry. Test unchanged hanging height, early release, climbing the divider, and a direct dash from the near bank. An earlier safe reel adjustment is valid. Reject the concept if it reduces to catching a narrow moving target rather than choosing a useful hanging position.

## 3. The Runway Coming Toward You

**Question:** Where will your landing be when you actually need it?

**Setup and plan.** A horizontal carriage moves away from a sheltered starting ledge, pauses at a far stop, then returns beneath an open drop. Its roof is deliberately available as a landing. Activate it from a safe contact and step back onto the fixed ledge. Let it begin returning, hop into the open drop, dash diagonally down-left onto its moving roof and jump left with the recovered dash. Spend that dash upward-left to reach an elevated home-side exit.

**Discovery.** Aim at the future landing position, not the carriage's current one. The return brings the landing toward the player and toward the exit. This is an ordinary leftward wavedash, not a new reverse-dash technique.

The intended geometry puts an overhang above the fixed ledge: the useful departure is below its lip, followed by an upward escape beyond it. That is a layout requirement to test, not proof that a direct fixed-ledge launch is impossible.

**Why this develops the earlier rooms.** Other Side of the Carriage asks which vertical face to use; this makes its top the useful moving launch surface. The earlier static wavedash pads give a baseline before the player lands on something moving. Activating and stepping off is part of the plan, rather than riding every block automatically to its destination. There is one transfer and one finish, avoiding an extended series of similar jumps.

**Risks and acceptance checks.** This is the most timing-sensitive proposal, so build it last if approved. Tune the return speed and exposed roof width for several nearby successful departures. Try direct jumps and wavedashes from the fixed ledge. Compare a returning carriage, an outward-moving carriage, and both parked endpoints; test with horizontal inherited lift momentum disabled. The room must have a physical reason to use the return, not an invisible timer or compulsory waiting flag. If standing at the home stop supplies an equivalent easy launch, revise the height or clearance. Do not guard the roof so aggressively that the intended landing becomes a single-frame trick.

## Order and approval boundary

Recommended order: **change the architecture → choose the contact height → anticipate a moving landing**. This varies the reasoning while developing the same movement vocabulary. Each candidate needs its own ordinary-input witness, nearby timing and position samples, concrete bypass attempts, death/retry tests and actual app inspection before it can be called playable.

The user subsequently approved these three builds. Browser access to chapter 21 and voice generation remain outside this change.

## Implemented rooms · 0.31.0

**Play Next Fractured Rooms.command** opens room 42. Esc exposes all three in chapter 21, with optional H hints and full Watch references. Each owns an independent checkpoint; there is no combined finale or hidden action counter. The native editable source is `levels/world21.tscn`, with source/reference data in `data/world21.json`.

### The Ceiling You Walk On · menu 42

The upper detour reaches the exposed left end of one contiguous crumble slab. A ceiling-anchored divider blocks the direct upper crossing. Breaking the slab exposes the lower launch and the far upward opening; the final platform's guarded side prevents substituting a climb from below. The normal 24-frame shake and 120-frame respawn remain unchanged. The reference includes a lower rest, and still clears after 16 additional idle frames there. Making the slab permanent blocks both the demonstrated plan and the bounded alternative searches.

### The Catch Below the Exit · menu 43

The divider is a **fixed thorn screen**, because the existing rope simulation correctly releases a rope obstructed by solid stone. A solid ceiling denies standing on the carrier or bypassing the screen above it. The rope can pass between the teeth while the knight reels below them, then reels up after crossing. A one-way extension lets the knight rise onto the far recovery shelf without hitting its underside. The final bank permits full stamina and dash recovery before the launch.

The reference uses rope lengths from 12 to 80 pixels. Removing its downward reel fails. Fresh searches also compare the full route with a maximum high-catch length of 36 pixels and with no hook at all. Earlier safe low catches are legitimate alternatives; no particular key press is counted by the game. Nearby reel-duration variations reach the recovery shelf and have ordinary walk-and-settle finishing continuations. Those tests deliberately allow repositioning at the rest; they do not claim one blind finishing tape fits every different arrival position.

### The Runway Coming Toward You · menu 44

The build uses a safe lower approach and steps to the sheltered bank. Activate the carriage, leave it moving and reach the bank, then dash left to the thin one-way drop shelf. **Down + Jump** drops through it. A downward-left dash lands on the returning roof, refills the dash and supplies the leftward wavedash. Ordinary rightward air steering creates clearance beside the housing for the final upward dash. The home platform leads across a short gap to the upper exit gallery.

Both endpoint roofs are housed, so their parked positions do not supply the useful landing. The 48-pixel-wide carriage travels 128 pixels, holds for 480 frames and returns over 60 frames. Nearby return waits and landing/jump timings clear; the reference also works with horizontal inherited lift momentum disabled. The return's essential contribution is its landing position and dash recovery. Extra inherited speed helps but is not mandatory.

Seven actual shortcuts were found in drafts: ground-dashing from an overly long drop shelf, climbing the housing's lower face and wall-jumping onto an unguarded gallery edge. Their complete earlier room definitions and successful tapes are retained in `tests/fixtures/next-fractured-bypasses.json`. Each still clears its former layout and fails the final revision. Fresh searches target both the home platform and the actual upper exit gallery, with the carriage parked at either endpoint after a valid preparation replay.

## Preservation and verification

World 21 has **44 room definitions and 20 required main challenges**. The new sections start at tile coordinates (494,-215), (550,-227) and (630,-238). The crossroads moves to (710,-224), with its incoming link updated to the last addition. Its geometry, other sockets and outgoing links remain intact. All other previous definitions, placements, recordings, optional spaces, rewards and quest metadata are protected by the preservation fixture. The workshop remains 30 rooms, and no browser editor expansion, new quests, voices, art or movement constants were included.

The complete chapter reference is **12,502 normal-input frames through 25 regions with zero deaths**. Its entire previous 10,358-frame tape is an unchanged prefix. The next two Fractured chapters retain their existing 6,583- and 8,954-frame roads.

- `tests/fractured_next.gd` checks the three deathless wavedash routes, physical preparation and recovery, the seven reproduced bypasses, nearby timings and exact moving-rope snapshot/replay behavior. Its parked-carriage comparisons start from a valid prepared state.
- `tests/fractured_next_app.gd` checks all 41 previous definitions and tapes, documented placement/link changes, native/source equality and validation, actual controller clears, individual checkpoints, hints, complete Watch exits and interrupted death/retry restoration.
- `tests/fractured_next_search.gd` runs 12 fresh-input cases with positive controls. Each has a 24,000-branch budget, width 60 and depth 50. Negative results are bounded evidence, not exhaustive proofs.
- The search helper now restores moving-ring references to their actual entity after a snapshot. A 24-frame replay comparison checks exact rope evolution. The change is confined to test infrastructure; game rope physics are unchanged.
- The chapter journey and actual-camera journey checks exercise the continuous road. GPU captures cover starts, preparation, catches, launches, finishes, hints and menus.

Run these with the pinned Godot binary, `--headless --path prototypes/godot-ascend --script tests/<name>.gd`. The search accepts an optional report path after `--`, followed by an optional room index (41, 42 or 43). Exported apps omit tests; packaged verification runs external test scripts against the actual PCK.

Human playtesting remains the test of readability and enjoyment. Successful references, timing samples and bounded searches do not establish that every creative alternative has been eliminated.

Final validation used the signed 0.31.0 app: **18 packaged suites passed**, including the 12 new search cases, earlier puzzle regressions and the 264-check workshop suite. All three new live routes also clear after retry; the fixed hook recording waits for the ordinary next cycle before replay. The actual-camera chapter run completes all 12,502 frames with zero deaths. Runtime scripts and the workshop are unchanged, and the user's pre-existing world-1 scene edit retains its original hash.
