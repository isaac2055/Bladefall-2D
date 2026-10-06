# Six candidates: changing the movement problem

## Diagnosis

7.240's M/O called G's geometry builder, N called L's, and P called J's. The new object changed a moment, while the player still performed almost the same ordered inputs. Their successful recordings even reused the parent policy. That was evidence of duplication, not evidence of good new room design.

This pass preserves approved G/H/I/J/L. It replaces all four derivative builders. The replacement for H gets a distinct internal room ID and title so the approved H is not overwritten.

## Research and application

These are design conclusions for Bladefall, not claims that Celeste uses our proposed objects or layouts.

- **One control can change the world as well as move the player.** A dash-triggered platform makes dash timing a decision about the future landing. A second dash can undo that landing. Changing where the player must stand, which side they approach from, and what the same activation closes produces different problems without another ability button.
- **Spatial relationships matter more than a list of devices.** A launch across an open void, a launch under a low roof, and a launch back toward a previously visited shaft require different trajectories. The earlier workshop mostly used left-to-right corridors and fixed outgoing impulses.
- **Object state can carry a puzzle.** Chung and Demaine's primary analysis documents moving blocks, thrown jellyfish, directional pufferfish interactions and blocks that retrace their route. Their playable constructions change which passages can be traversed by moving an object, transferring it through a separate passage, or waiting for a return. These are research constructions, not examples of shipped chapter difficulty. [Paper, definitions and sections 3.2–3.4](https://erikdemaine.org/papers/Celeste_TJM/paper.pdf).
- **Pacing can reverse the role of a familiar mechanic.** In Farewell's finale, careful gliding gives way to discarding the carried object and a fast committed sequence. Maddy also distinguishes that long ending from 7-C's precision: length alone is not difficulty. [Developer retrospective](https://exok.com/posts/2019-11-25-chapter-9-design/).
- **Precision requires forgiving interpretation.** Buffered jumps, corner correction, stored lift momentum and a short window to reinterpret inputs let geometry demand accuracy without requiring perfect button ordering. Retain Bladefall's reliable chords and airborne dash recharge. [Developer's movement notes](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html).
- **Test the intended experience, then cut work that doesn't fit.** In the GDC workshop's first-person Q&A, Maddy describes revisiting levels, areas and the whole game, cutting or repurposing them as their context changes. A green route replay proves feasibility, not novelty or fun. [Workshop Q&A](https://www.gamedeveloper.com/design/gdc-2017-level-design-workshop). The [official talk](https://www.youtube.com/watch?v=4RlpMhBKNr0) is an additional reference; the accessible page provides its description, not a transcript, so no detailed claims here rely on having watched it.

## Candidate contracts

| Candidate | New movement problem | Why it is not a banked route with an extra object |
|---|---|---|
| New H · Switchback Engine | Dash repositions the footholds you need next; climb a folded route, cross back over your approach, then commit to the final configuration. | Remote dash consequences and deliberate direction reversals. No vault/bell/rail relay. |
| K · Storm Chase | Enter a narrow enclosed final passage after the existing flight, brake around rock teeth, and dodge slow, telegraphed shots from rooted enemies. | Preserves the improving flight route, adds a distinct pressure phase and tighter enclosure. |
| M · Rootworks | Four independent counterweights have different roles: launch, ride home and drop, low transfer, final launch. Dash grows a wall-rooted vine that extends and then withers. | The route doubles back and falls through its machinery; no G bell/vault suffix or linked two-train opening. |
| N · The Wake Behind | Climb and reverse through a compact ruin while a delayed pursuer follows your own route. | Your previous movement determines future danger. Waiting and retracing now have consequences. |
| O · Recoil Well | Aim into pressure pods from different directions to rebound away, use the height to cross between shelves, then descend through the opened route. | Player-chosen opposing impulse and vertical routing instead of fixed rightward bell launches. |
| P · The Lantern Thief | Carry, throw, and recover a seed lantern through passages the knight and object traverse differently. | Manage a second object's position while platforming; abandon and recapture it instead of following an inversion chain. |

## Acceptance evidence to collect

1. Preserve existing bank snapshots and G/H/I/J/L input recordings. Append H to the bank; do not regenerate old approved geometry to conceal changes.
2. Six candidates in the picker, with five independently authored layouts and no parent-shape aliases.
3. Successful real-input routes for every candidate, independently replayed. Include directional reversals, new device interactions and K's enclosed finish in the traces.
4. Remove the essential new interaction and replay to check that it matters. Also try simple dash/jump bypass policies; an identical recorded route failing alone is insufficient to prove a room cannot be skipped.
5. Verify retries clear transient hazards, projectiles, object state and carried items. Preserve automatic dash recharge and direction-chord reliability.
6. Inspect actual rendering at entrances, decision points and finales: visible supports, consistent collision silhouettes, readable warning/activation/decay states.
7. Run the existing courses and banked room regressions, plus two-player local transport checks. State the limit: neither automation nor screenshots establish human difficulty or real-network performance.

## What changed in 7.241.0

All six candidates are implemented and independently selectable under **Precision Courses → Fractured Workshop → Candidates**. Approved H · Needle and Thread is preserved in **Banked** with G/I/J/L. The replacement H is **Switchback Engine**, with a separate room identity. There are seventeen total workshop rooms and three playlists. Campaign placement remains a separate decision.

Bladefall's rechargeable dash is a crucial difference. Copying a long gap from a game with a scarce airborne dash often creates a trivial repeated-dash route here. These candidates instead constrain approach angles, overhead clearance, future platform state, a second object's location, and the space you occupied earlier. H's lower passages require retaining the right machinery configuration; M's lower passage opens when the returned hatch releases; O's pods open physical valves; P's lantern operates visible gates. These are physical world changes, not invisible completion receipts.

### Actual route evidence

| Room | Recorded completion | What happened during the run |
|---|---:|---|
| New H | 827 frames | Nine dash switches; climb right, reverse left, climb right, then descend through state-dependent openings. |
| K | 1,459 frames | Three flight sections, three spring rebounds, eight enemy shots during the enclosed finale; no projectile hits. |
| M | 845 frames | All four hoists, one return-before-collapse, and both growing wall roots. The trap detached the rider at home at 2.33 s; the roots visibly grew and later shrank. |
| N | 838 frames | Outward climb, higher return, then a zipline escape over the earlier route; no wake contact. A separate wait-at-perch trial caused contact and a fall. |
| O | 674 frames | Three distinct approach vectors; all outgoing impulses opposed the incoming dash. The last rebound descends under the overhang. |
| P | 1,001 frames | Four pickups, three aimed throws, three socket deliveries; both separate object/player routing and timed recovery crossings. |

Frame counts describe one successful recording at 60 Hz; they are not a difficulty score. Each route starts at the normal entrance and uses normal input controls throughout. Failure fixtures that reposition the player or advance a clock are explicitly separate from these routes.

### Reliability and verification

- All seventeen recordings replay with zero deaths; all three playlists advance correctly. The five banked authored layouts and input-tape hashes match their approved versions.
- Thirty-five removal/delay counterfactuals pass. Additional tests remove M's roots, wait for N's wake, verify K's finite 110-unit/s projectiles can hit, check O's opposite impulses, and confirm P's gate closes after its 1.8 s recovery grace.
- Eighteen simple jump/run/dash bypass policies fail to finish. This is useful evidence against obvious skips, not proof that no alternative route exists.
- Retries restore hoists, gates, folds, pursuers, projectiles and the lantern. Native keyboard aim, late chords, both crumble jumps, airborne dash recharge and 136 room/direction combinations pass.
- Staggered co-op exposed an exact-100-ms direction-chord boundary that depended on accumulated floating-point clock error. It now expires consistently; dedicated fixtures check different room ages. All seventeen rooms pass simultaneous and staggered two-client production packet-handler tests (34 runs). Transport is simulated; internet latency and matchmaking are not covered.
- Original Standard/Fractured course replays, Dash Foundry regressions, five banked snapshots, first-three campaign presentation checks, and 25 campaign/world unit tests pass.
- Rendered entrances, decision points and finales were inspected. Hoist cables and moving weights, a splitting return hatch, wall sockets and withering leaves, mechanical fold brackets, pressure tubing, lantern conduits, animated moth silhouettes, swelling sentries and layered root/rock surfaces explain the devices. Collision silhouettes stay legible.

Local version **7.241.0** and the deployment-folder mirror agree. Nothing was published. Release checking still reports the four prior failures: unused Astra/Fable editor references and the index/renderer size budgets.

Machine-readable results, legal recordings, screenshots and current source hashes: `../charters/celeste/evidence/workshop/`. The current campaign/development inventory is [MECHANICS-INVENTORY.md](MECHANICS-INVENTORY.md). Human playtesting still decides whether a room is enjoyable, appropriately difficult, and ready to bank.

