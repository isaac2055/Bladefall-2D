# Room bank — current final review

The 7.302 update has **89 approved rooms (51 Base / 38 Fractured)** and **nine revisions (4 Base / 5 Fractured)**. F62 is removed from the active pool. Open **Extras → Room Bank → Final review** for the remaining rooms; **Banked** holds the approved reserve with qualitative placement notes. No campaign imports are included.

See [the current guide](FINAL-REVIEW-7.302.md) for decisions, changes and release evidence. Historical run guides below describe their original sets and may contain superseded counts or approval status.

---

# Room bank

The room bank is a reserve outside campaign progression. The latest set is **Run 7: sixteen new candidates, eight Base and eight Fractured**, with smaller lessons preparing later timing and movement sequences. See the [Run 7 guide](RUN-7.md) and [synthesis report](../design/SURVIVE-ROOM-SYNTHESIS.md). Run 7 is ready for review locally in 7.299.0; the guide records the completed evidence and remaining human assessment.

[Open the local review menu](http://localhost:8371/precision.html?pitch=bank&mode=review) · [Review Run 7 Base](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run7) · [Review Run 7 Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run7)

## Current pool — Run 7 / 7.299.0

| Group | Base | Fractured | Total |
| --- | ---: | ---: | ---: |
| Run 7 candidates | 8 | 8 | 16 |
| Run 6 revisions | 3 | 2 | 5 |
| Run 5 review | 2 | 2 | 4 |
| Earlier Superrooms — review pending | 2 | 2 | 4 |
| Run 4 revisions | 2 | 0 | 2 |
| Run 3 revisions | 2 | 0 | 2 |
| Run 2 revision | 0 | 1 | 1 |
| Earlier review | 9 | 6 | 15 |
| Banked | 27 | 23 | 50 |
| Active | 55 | 44 | 99 |

The pool has **50 banked, 18 revised and 31 candidate** records. All 83 pre-Run-7 source records and earlier approval decisions are preserved. Stable IDs survive revisions and side transfers; B51 is currently Fractured despite its historical B prefix. [Run 5/6 feedback](RUN-56-REVIEW.md) is the current account of those revisions, cuts and approvals. Original release guides retain their historical counts.

The four earlier [Superrooms](SUPERROOMS.md) remain candidates with their requested edits deferred. The user's later clarification governs new work: endings may be the hardest part and should not be automatically softened. Make execution readable, learnable and human-achievable. Earlier requests about particular rooms do not imply a blanket rule that every finale must be easy.

Banked means the user approved keeping the room. Candidate and Revised mean the current version awaits approval. `route-proven` means a saved zero-death completion exists, not that subjective quality has been established. Suggested worlds and difficulty are author estimates until measured. No numeric human ratings are inferred from qualitative feedback, and no bank room enters a campaign without selection.

## Review and play

Review mode pauses after completion for **Fun /10, Difficulty /5, Suitability /5** and an optional comment. **Rate room** also records unfinished attempts. Reviews append locally and export to CSV with stable IDs and room-definition hashes. Revisions keep earlier rows attributable; testers must send their exports because there is no shared automatic review database.

Play mode has no survey and keeps the set timer. Each group and side has a separate room set. **Escape → Watch the intended route (review)** is available after a first attempt; demonstrations and other assisted starts are practice rather than leaderboard evidence.

Run 7's [learning order](RUN-7.md#suggested-learning-order) connects timed pogos, moving-anchor/cargo catches, spent wall faces, and projectile/thermal-cycle branches. Preparation links suggest useful prior practice; they do not impose unlock gates. Review should distinguish a difficult learned phrase from an unreliable contact, and record creative alternate solutions that keep the central problem meaningful.

## Authoring and evidence

- Source records and saved tapes: `scripts/room-bank/base/` and `scripts/room-bank/fractured/`.
- Membership and batch contract: `scripts/room-bank/catalog.json`.
- Generated [manifest](manifest.json) and [route report](route-report.json).
- [Run 7 baseline](run-7-baseline.json); original files under `scripts/room-bank/archive/before-run7/`.
- [Timing design](TIMING-DESIGN.md), [sweeper rules](TIMING-PATROLS.md), and [current synthesis](../design/SURVIVE-ROOM-SYNTHESIS.md).
- [Distributed playtest plan](../playtest/bladescent-pretest-plan.md).
- Historical reports: [batch 01](BATCH-01.md), [batch 02](BATCH-02.md), [batch 03](BATCH-03.md), and [original five-run plan](RUN-PLAN.md). Their counts and scope describe those releases.

Save each room separately before moving on and after meaningful edits. Preserve stable IDs and archive originals before authorized revisions. Document the intended discovery, nearest existing room and changed decision, estimated band, entrance/exit, visible timing cues, learning progression, route and focused shortcut checks. A larger map should add actual travel or shared consequences, not empty area for a quota.

Technical checks establish feasible routes and specific regression fixes; they do not prove that every alternate solution is blocked. Actively try the obvious ordinary jump/dash/climb or direct body-touch route from a useful launch point. Keep worthwhile alternatives that retain the central problem. Never gate an exit on invisible proof that a named mechanic was used.

When integrating an authorized batch, `node scripts/room-bank/build.mjs --check-batch` builds and checks its contract; `node scripts/room-bank/check.mjs --write` replays saved routes and recorded cases. Broad repetition without a new concern is unnecessary. Publication is separate. The current work is local only.
