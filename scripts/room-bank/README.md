# Spare-room bank

The active contract is `catalog.json`. Run 7 adds **16 new candidates: eight Base and eight Fractured**, bringing the source pool to **99 rooms: 50 approved, 18 revised, 31 candidate**. All 83 pre-Run-7 records and previous decisions are preserved. The public guide is `docs/room-bank/RUN-7.md`; the set is ready for local review in 7.299.0, with saved routes and browser checks complete. No new candidate is approved or placed in a campaign.

Read `docs/design/SURVIVE-ROOM-SYNTHESIS.md` before further authoring. The original five-run sequence remains in `docs/room-bank/RUN-PLAN.md`; Run 7 follows the later request for meaningful timing and movement progression. The Run 5/6 feedback guide is `docs/room-bank/RUN-56-REVIEW.md`.

Rejected rooms remain under `archive/` and never enter registration. Stable IDs survive classification changes: several F-prefixed rooms are Base, while B40 and B51 are Fractured. Use `bank.side`, not the ID prefix, as authority. Approved records must not be altered without new authorization. The Run 7 preservation baseline is `docs/room-bank/run-7-baseline.json`, with originals in `archive/before-run7/`.

Save each new room individually under `base/` or `fractured/` as soon as it exists, then save meaningful geometry and partial-route improvements to the same record. Never recycle an ID. Reviews retain stable IDs and room-definition hashes; changing acceptance alone does not change the geometry hash. Preserve qualitative feedback without inventing numeric scores.

Records contain `room`, `bank` and `tape`. Metadata includes side, batch/run/collection, acceptance, format, difficulty estimate /5, role, suggested worlds, mechanic tags, intended solution, nearest existing room and changed decision, entrance/exit constraints, status and author. Run 7 also records `learningFamily`, `lessonRole` (`introduce`, `develop`, `combine`, `master`), `preparesFor`, `prerequisites`, visible timing cues and actual movement evidence. A prerequisite is a learning recommendation, not a runtime lock. Hints should be short (at most 95 characters), use remappable controls where appropriate, and teach a useful rule without narrating every input.

Study existing layouts and routes before inventing combinations. A new pairing alone is insufficient. Look for a changed decision: arrival phase, retained momentum, positioning with a later consequence, a return through changed space, separate player/object routes, or a resource that must survive the next transfer. Keep silhouettes varied and portals a minority. A larger room needs meaningful occupied travel and shared state; use `extended` for a scrolling phrase that does not warrant claiming three normal rooms of meaningful gameplay, even if its nominal canvas is larger. Do not enlarge a map solely to obtain a label.

The ending may be the hardest part. Do not automatically make it easy or add a broad rest after every action. Preserve a demanding linked phrase when it is readable, learnable and human-achievable; fix ambiguous cues or unreliable contacts without removing its purpose. Smaller rooms should prepare later combinations where that teaching relationship is claimed.

A clean intended tape proves feasibility, not that the puzzle matters. Actively test the obvious ordinary jump/dash/climb, roof ride, ground refill or body-touch alternative from a plausible launch point. For a reported skip, reproduce the successful old route before changing it. Use visible geometry and meaningful consequences; do not add hidden device-use receipts to exits. Interesting alternate solutions remain welcome when the problem survives. Save shortcut tapes in `bank.shortcutChecks`; feedback revisions also retain original successes under `bank.review.reportedBypasses`.

Use a focused zero-death completion, two or three useful early/late/contact variants and a handful of relevant bypass attempts. Save before searching; avoid endless parameter sweeps. `requiredEvents` document authoring evidence and must not become invisible gameplay prerequisites. Base routes use ordinary jump/dash/climb plus taught weapon/object interactions, without super, hyper, ultra or wallbounce; the catalog preserves the earlier explicit F41 Base exception. Fractured may demand linked execution. `status:"route-proven"` says nothing about human fun, measured difficulty, suitability or approval. `acceptance:"banked"` requires the user's decision.

Run 7's opt-in `spentThorns` device keeps each rectangle solid. Its marked face is safe throughout first contact; departure begins a visible 18-frame warning, then makes that face lethal until reset. Recontact does not cancel the warning and unmarked faces remain usable. Runtime/view sources are `public/bladefall-pcore-dev-spent-thorn.js` and `-view.js`; the focused contract is `spent-thorn-check.mjs`. Existing cargo-clasp and hinge rules remain in `docs/design/CARGO-CLASP.md` and `docs/room-bank/hinge.md`.

Commands from the repo root:

- `node scripts/room-bank/build.mjs --check-batch` assembles playable records, verifies the current contract and writes the manifest.
- `node scripts/room-bank/check.mjs --write` replays saved completions and recorded variations/shortcut cases and writes the route report. Individual IDs select a subset.
- `node scripts/room-bank/spent-thorn-check.mjs` checks the new opt-in device's interaction contract.
- `node scripts/room-bank/browser-check.mjs` checks group membership, reviews/revisions/CSV, the play clock and rendering against the local server. Optional IDs limit route captures.

`register.mjs` loads active sources for authoring tools. The generated public registry separates approved/review groups and corresponding timer sets. Current totals are 55 Base / 44 Fractured; the approved bank is 27 / 23 and the pending review pool is 28 / 21. Player review decides promotion. Local bundle assembly does not authorize publishing.
