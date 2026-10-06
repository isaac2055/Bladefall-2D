# Current review — 7.244.0

Enter **Precision Courses → Workshop · Base & Fractured**. Visible tabs are **Candidates**, **Base Bank**, **Fractured Bank**. Ten candidates: K, K-F, M, O-F, Q, R, S, T, U, V. Base bank: H/Switchback, N, O, P. Fractured bank: G, H/Needle, I, J, L, H-F, M-F, N-F, P-F, Q-F. Original A–F is retired from navigation. Each bank includes twenty expandable written campaign placements; these are plans, not an automatic campaign rebuild.

See [current design and placement report](WORKSHOP-244-PLACEMENT.md) for all changes and the puzzle rationale. The historical reviews below retain earlier designs for context and are superseded by this entry.

# Precision Workshop — Base Bank, Fractured Bank and ten candidates

Local version **7.243.0**. Enter **Precision Courses → Workshop · Base & Fractured**. Four independent playlists: **Candidates** (H-F, K, K-F, M, M-F, N-F, O-F, P-F, Q, Q-F), **Base Bank** (H · Switchback Engine, N, O, P), **Fractured Bank** (G, H · Needle and Thread, I, J, L), and **Original A–F**. Each room can be selected separately; R retries and Pause → Choose workshop room returns to selection. The two H rooms have separate identities. Double jump and the 0.38-second eight-direction dash recharge remain available.

Current combinations, object explanations and verification: [Base and Fractured review](../../design/BASE-FRACTURED-ROOMS.md). Campaign placement: [Mechanics inventory](../../design/MECHANICS-INVENTORY.md). Earlier research: [Room rethink](../../design/CELESTE-ROOM-RETHINK.md). Older version sections below describe historical passes. Banking preserves approved rooms for later placement; it does not insert them into the campaign.

Current evidence covers 25 legal room recordings, 52 removal/delay counterfactuals, 30 simple bypass trials, four playlists, 200 direction vectors, native chord orders, nine protected layouts/input tapes, candidate mechanism fixtures and simulated two-client routes. Evidence files live in `evidence/workshop/`; these checks establish reproducibility, not human difficulty or internet performance.

The original six rooms each propose one new interaction. A–C extend Standard's existing objects; D–F introduce a new environmental object/system and combine it with existing abilities. G–L combine those interactions into longer, tighter relays. All are experiments for approval, not additions to the campaign route.

| Room | New interaction | Required sequence and precision | Possible campaign home |
|---|---|---|---|
| **A · The Second Train** | Linked rails: one dash starts two shuttles, the second delayed | Board the first; dash while riding; jump in its short gold window; intercept the second platform during its gold window; launch before it retracts and drops, air-jump over the tooth, then dash through the vein. The second catch depends on the first departure. | Broken Causeway machinery, then a faster Deep Line reprise |
| **B · Out of the Seam** | Vein-exit vault | Dash through the first vein and press Jump at its gold lip. The vault supplies a stronger rising arc; spend the restored dash to enter the elevated vein, then vault again above the taller tooth into a ring catch and jump release. Exit jump accepts a 0.14-second grace window and the course's existing jump buffer. | Early rift training, later Void Tyrant/Act Two portal routes |
| **C · Borrowed Seconds** | Collapsing footholds | Four irregular rock landings (80/54/70/44 units) alternate height and gap length. Each restores dash through ground contact, cracks and sags six units, then collapses 0.32 seconds after landing. A 0.10-second coyote window allows a late departure. Choose diagonal versus horizontal dash, delay the second jump, and leave immediately. Upper and lower teeth constrain the arcs. | Updrafts rock ledges; fragile fractured causeways |
| **D · Polarity Loom** | Gravity prisms | Dash into the first prism to invert and recover dash; reach the ceiling, cross the inverted arch, dash through its vein, then hit the second prism to return upright. Descend under the next tooth into a tension-ring catch and jump release, then a final rift vault. | Inversion's later acts; mixed Act Two trials |
| **E · Stormglass** | Aether spring pods and moving obstacles | A portal applies the learned aether form. Still air, stone passages and a moving cutter force high/low turns. Strike a spring pod for an aerial rebound, collect the mid-flight refill, recover direction after each bank, then dash out of aether into the exit tear. The plant recoils and sheds seeds on contact. | Thunder Cliffs, palace ascent, fractured weather routes |
| **F · The Recoil Choir** | Directional dash ricochet bells | Pogo the opening pearl; dash into three bells from the left. Their engraved arrows alternate rising and falling launches. Preserve each launch until the next dash; the third feeds a tear across the final gap. Unneeded zipline dividers are removed. Each bell restores dash once per attempt. | Blade training, Void Tyrant, late fractured blade relays |

## Bank and candidate pass — 7.240.0

G/L are banked with identical prior input recordings. I is banked after fresh-axis/chord input and crumble-jump restoration fixes; J after workshop dash gains a 0.38-second timed recharge. A 100 ms direction chord accepts Up/Right/Dash in either event order. Dash landings no longer erase a buffered jump. Approved authored geometry is preserved in `BANKED-ROOMS.json`; `verify:workshop-bank` compares it.

H is extended into a crumble/uppercut/bell/fourth-vault second half. K has two still-air caverns, three rebounds, an intervening zipline/form handoff, physical stepped boulders/branches and a braking corridor. New M grows a temporary foothold through bell resonance; N moves the uppercut target; O's second rail returns home before collapsing and ends with a ring release; P's last bell opens a timed sluice. Each has a complete legal-input route and its new interaction is checked independently.

There are sixteen routes and three playlists: A–F; G/I/J/L; H/K/M/N/O/P. The first three campaign levels receive visual integration only, retaining their abilities and collision: mossy stone footholds, reactive resin pods, and supported freight machinery. Full current placement inventory: `../../design/MECHANICS-INVENTORY.md` (repository `docs/design/MECHANICS-INVENTORY.md`). No workshop room has been automatically inserted into the campaign.

## Owner review pass — 7.239.0

Feedback A–F referred to Fractured G–L. G's accepted rail timing and L's movement sequence are preserved. The delayed-collapse-after-return rail is documented as a future occasional variant, not inserted into the approved room.

- Workshop contact with masonry, cutters, or an undashed rift now stops travel and lets the knight fall; only falling below the course or manual retry resets. Corner glances have a six-unit correction with a 70 ms local grace window. Left/right bounds constrain position without restarting. H's overshooting finish is explicitly tested to land in H, not the next room.
- All workshop rooms retain eight-direction dash and now accept an added direction within 65 ms of pressing dash. Releasing direction does not erase the initial aim. Tests cover 96 room/direction combinations plus real keyboard events in I; the old Standard opening keeps its original committed direction behavior.
- Inside Out has a lantern rest after its first two inversions and ring. It lights as you pass and resumes at its actual ledge on death or R. First-half progress survives; selecting/replaying the room resets it. A separate legal-input route proves the second half from this rest.
- E/K are still air. Moving cutters and rebound seed pods remain, with phases and one steering waypoint retuned for the changed travel times. Crosswind code is reserved for a later teaching sequence. No wind force is authored in these rooms.
- Mechanics inhabit six settings: mine railway, rift aqueduct, root-bound quarry, lodestone observatory, overgrown conservatory, and belfry. Pogo targets are shell beetles; uppercut targets are hanging seed pods. Ricochets are bronze bells on spring yokes; gravity devices are crystal-bearing lodestone cradles; aerial rebounds are rooted spring pods; flight/refill objects are split seed lanterns. Chains, stems, weathered mounting blocks, wheels, moving rack guides, cracks, bell recoil, pod compression/spores, beetle wings and crystal motion support their roles. These are bespoke environmental targets, not additions to campaign enemy AI.
- The compact workshop HUD retains room identity, dash readiness and controls. Long instructions appear only briefly at the entrance; mechanics no longer carry floating action labels.

Verification: `npm run verify:workshop-review` covers the reported regressions; `verify:precision-workshop` covers twelve full routes, both playlists and 26 counterfactuals (flight without aether / without rebound included); co-op verification uses two real browser clients over in-memory transport. These checks establish reproducibility, not a guarantee of human difficulty or visual perfection.

## Fractured Workshop G–L

| Room | Required combination | Added pressure |
|---|---|---|
| **G · Last Departure** | Two gold rail launches → vault → bell → crumbling rock → second vault | Smaller rails; both carriages drop on retraction; a long final commitment |
| **H · Needle and Thread** | Two rising vaults → downward bell → low rift → third vault | Narrow vein entrances; momentum must change direction between ceiling and floor hazards |
| **I · Faultline Fugue** | Four failing rocks → pogo → bell → tiny rock → vault | Shorter rock timers, varied gaps and a moving cutter; air jumps must be saved for later catches |
| **J · Inside Out** | Invert → ceiling vein → restore → ring → vault → invert again → ceiling vein → restore → bell | Four polarity changes with continuous dash planning between them |
| **K · Storm Chase** | Portal → fast aether → cutters → two rebounds → exit zipline | Still air, three moving cutters, narrow alternating high/low passages |
| **L · No Ground for Mercy** | Pogo → three bells → zipline → failing perch → uppercut → fourth bell → high vault | Smaller bell targets; the original choir becomes a longer mixed blade/dash relay |

Hard rocks collapse in 0.23 seconds rather than 0.32; flight speed rises from 350 to 410; bell targets shrink from 54 to 42 units and prisms from 46×110 to 36×84. Difficulty comes from linked catches and resource planning as well as smaller targets. Retry restores the entrance, machinery, and camera. No receipt checklist or invisible divider prevents completion: physically reaching the room's own landing is sufficient.

The workshop has its own pixel-built quarry/ironworks art: riveted rails, chain ziplines with gear anchors, cracked stone, worn stone boundaries, segmented rifts, spring pods, and a compact shard flight form. Red hazard bars and stray divider walls are removed. Collision boundaries remain unchanged by drawing.

## What comes from studying Celeste

[Maddy Thorson's forgiveness notes](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) describe buffers, coyote time, corner corrections and stored lift momentum. The principle applied here is to demand a particular movement sequence while accepting slightly early or late intent. Existing lift grace remains finite; the new vault has an explicit exit window and accepts buffered jump input. The courses keep their double jump rather than replacing Bladefall's movement wholesale.

[The developer's Farewell retrospective](https://exok.com/posts/2019-11-25-chapter-9-design/) describes remixed objects, new mechanics that support earlier teaching rooms, and a finale that changes from patient wind navigation to committed movement. E explores that change of pace within one room: smooth banking gives way to a precise dash/tear commitment. The new mechanics are separated here so each can be evaluated before becoming part of a longer act.

[The GDC level-design workshop](https://www.youtube.com/watch?v=4RlpMhBKNr0) is the broader reference for designing and arranging individual stages. These layouts and object identities are Bladefall proposals, not traced Celeste rooms. A–C isolate interactions on familiar objects; D–F ask the player to combine new rules with already learned verbs. None changes the user's existing difficult relay.

The new score is **Crystalline Trials** from the owner's Aerth collection: the existing 114 BPM training cue. Standard and Fractured keep the Aerth tracks chosen in 7.236.0.

## Verification and review

- `npm run verify:precision-workshop`: independent legal-input replays of all twelve rooms, both playlists, 26 counterfactuals, timing sensitivity sweeps, retry resets, native fresh-save room selection, double jump, and music selection.
- Each normal replay checks its intended interactions and landing in its own room. Separate checks confirm a waiting rider falls from the second rail and a jump after rock collapse uses coyote time.
- All twelve recorded routes fail when dash is removed. Separate trials remove the room's new interaction (aether activation in E/K); C/I instead pause on the first foothold until it collapses. E/K additionally fail without the rebound impulse. These prove dependencies for the recorded routes, not that no alternative solution exists.
- Timing sweeps shift one input and hold the rest of the recording fixed. They show sensitivity of the entire sequence; they do **not** measure the complete human-adjustable success window or claim a particular Celeste difficulty grade.
- `npm run verify:precision-workshop:coop`: two browser clients with production packet handlers, both simultaneous and staggered crossings of every room. Staggered moving-cutter recordings legally idle on the entrance until their recorded world phase; this does not test every possible phase. This checks movement/state behavior using an in-memory connection, not internet latency or matchmaking.
- `npm run verify:dash-foundry` preserves the original courses' geometry baseline; `npm run verify:celeste` replays all 19 Standard and nine Fractured rooms.

Evidence, input recordings, screenshots and source hashes: `evidence/workshop/`. Automated solvability is a floor for review, not a substitute for the owner's judgment of fun. The letter is the stable feedback identifier: “keep A,” “B needs a later vault,” “E needs tighter banking,” etc.

Authoring lives in `public/bladefall-precision-workshop.js`; each catalog entry and build branch owns its proposal. Shared dash, checkpoint and blade behavior remains in the Celeste course module. The isolated world slot is 44; existing campaign identities stay unchanged.

The local deployment mirror was rebuilt. Release checking still reports the four pre-existing editor-reference/size-budget failures (two unused editor script references, index size, renderer size); no new asset-stamp or mirror failures. Nothing was published.
