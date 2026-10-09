# Bladescent pre-playtest plan — 2026-10-07

## Recommendations for the open decisions

1. **Roads reached from either end:** permanently unlock an ordinary road when the player reaches either mouth through legitimate play. Preserve explicit story/keepsake gates. This makes backtracking predictable without requiring a second clear just to return. Freeze the rule before recruiting testers; this recommendation is not yet implemented.
2. **Old room-layout map:** retain it for review/debugging, with the nested-diamond map as the normal player map. The layout view is valuable for identifying the exact room behind feedback. Do not remove the underlying tool. Restricting its player-facing toggle remains a recommendation, not a change in this release.
3. **Momentum lessons:** keep super/hyper/ultra/wallbounce lessons in Fractured. Base progression should remain completable without advanced momentum. Teach each required move before assessing combinations, then offer optional mastery rooms. This matches the current implementation.
7. **Additional gate links:** defer 39–21 and 40–23/25/27 through the first room-rating study. They change route order, shortcuts and player preparation, which would confound the room difficulty data. Decide their unlock rules later as a navigation/content pass.

## Implemented at 7.282.0

The bullets below record the original implementation. The current title names are **Explore** and **Survive** (7.283); Continue resumes whichever resumable game was played last, and Co-op offers either. Room Bank is now available inside Extras.

- Main title retains BLADEFALL. Bladevain starts the existing metroidvania campaign; Bladescent opens the connected platforming ascent below it. Extras contains Precision Courses, Merge Pitches and Dialogue Editor. Level Select, Sound, Controls, Leaderboards and Co-op remain available.
- Bladescent Review mode: `precision.html?pitch=climb&mode=review`. Each authored room's completion pauses for Fun 1–10, Difficulty 1–5, Suitability 1–5 and optional comments. Skipping a road room also requests feedback, recorded as skipped. Rate room allows feedback before completion, including a room the tester cannot finish. Passage/junction machinery is excluded from room surveys.
- Suitability means fit with the world's theme/mechanics and the room's position in progression. Do not interpret it as another difficulty score.
- Ratings are stored locally, appended rather than overwritten, with tester code, session, build, world/room/source IDs, completion outcome, time/deaths and assistance/practice annotations. Export reviews produces CSV. Testers must send their exports; there is no automatic upload or shared review database.
- Play mode: `precision.html?pitch=climb&mode=play`. No rating prompts. A per-world simulation timer includes retries and excludes pauses. Completed unassisted world runs enter a build-specific local leaderboard. Skips, room warps, demonstrations, co-op, slow speed and stamina assistance exclude a run. Interrupted/resumed rooms are practice starts. This is a local time-trial feature, not a hosted or cheat-resistant global leaderboard, and not yet a full-campaign leaderboard.
- Existing technical `?review` diagnostics are separate from player-facing `mode=review`.

## Spare-room pool — reviewed reserves and current candidates

Create an initial pool of about **80 spare rooms**, approximately 16 in each intended difficulty band 1–5. These are authoring estimates until tested. Cover existing object/mechanic families, combat/traversal/puzzle roles and base/Fractured suitability. Include both focused lessons and combinations; avoid many cosmetic variants of one layout.

Each spare needs a stable ID, source, mechanic/object tags, intended act/world/role, estimated band, completion tape, entrance/exit constraints and verified challenge/return routes where relevant. Keep it outside campaign progression until selected. Test the pool alongside the campaign so replacements can use measured ratings rather than estimates. Authorship, technical verification and a short pilot precede the first full distributed series. The 7.282 menu/mode change created no spare rooms. **Update 7.289:** the saved pool now contains **31 active rooms**: **16 user-approved reserves** (eight base, eight Fractured), **five revisions** awaiting another review (four base, one Fractured), and **ten new candidates** (five per side). B13 is banked after removal of its invisible upper platform; B19 and F11/F13/F16/F18/F19 are banked unchanged. F20 is banked under base with its original stable ID and unchanged geometry/tape. This makes the active total 17 base and 14 Fractured despite equal 5+5 additions. The Useful Ceiling remains the first banked base room; nineteen rejected batch-01 rooms remain archived. Extras → Room Bank separates Banked from To review and labels revised rooms distinctly. See [the current room-bank guide](../room-bank/BATCH-04.md).

The ten new rooms focus on visible environmental timing, safe observation positions and at least two cue/action/rest stages per room; see [the timing design notes](../room-bank/TIMING-DESIGN.md) and [patrol rules](../room-bank/TIMING-PATROLS.md). The five revisions retain their original puzzles while addressing difficulty or a reported shortcut. Final batch validation passes: 31 clean routes, 34 recorded negative routes, exact membership and timing-stage checks, and browser review/play flow plus all sixteen new/changed rooms. Designer difficulty estimates and suitability assignments still need measured ratings; qualitative approval is not a numeric survey score. The approximately 80-room reserve remains a planning target, not a completed pool.

## Distributed room study

1. Agree the recommendations, finish the spare pool, then freeze one build and room manifest. Complete technical checks before asking for subjective ratings.
2. Use consistent tester codes; collect a separate self-reported experience band. Give everyone the same control introduction and the three rating definitions. Explain how to rate an unfinished room and export results.
3. Assign manageable blocks (roughly 10–20 rooms), preserve local progression where teaching matters, and rotate blocks between testers to reduce fatigue/order effects. Aim initially for 5–8 independent ratings per room, spanning experience bands; recruit more where responses disagree strongly.
4. Collect CSVs unchanged. Keep completed, skipped and incomplete outcomes distinct. Deduplicate for analysis by tester/build/room using an explicit first-attempt or latest-rating rule; do not count repeated attempts as independent people. Separate assisted/co-op observations.
5. Use per-room rating distributions, medians, spread and completion/skip rates. Plot difficulty against progression within each act and experience band, plus rolling medians to find spikes and long stretches without variation. Treat the 1–5 scales as ordinal; a mean alone hides polarized results.
6. Do **not** force all rooms into a bell curve. Aim for an intentional rising progression with recovery rooms and optional peaks. Review low fun/suitability rooms even when their difficulty looks statistically normal. A high skip rate is evidence, not missing data to discard.
7. Select replacements from the measured spare pool with matching role/mechanics and the desired band, then retest the changed room and adjacent sequence.

Readiness: menu/mode implementation is ready for a pilot. The full distributed series still waits for enough reviewed spare rooms and the agreed test manifest/protocol. Publication remains a separate explicit action.
