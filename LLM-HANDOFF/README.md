# Bladefall Antigravity — model handoff

This folder is the durable starting point for a new Codex, Antigravity, Claude,
or other engineering/design session. It summarizes the intended game, the
current implementation, the level-by-level production state, and the files that
must accompany a working copy.

## Read in this order

1. [`01-CURRENT-STATE.md`](./01-CURRENT-STATE.md) — what is actually true in the
   current runtime, including version, validation, and known caveats.
2. [`02-MASTER-VISION.md`](./02-MASTER-VISION.md) — the product, narrative,
   world, progression, portal, reward, and pacing vision agreed with the owner.
3. [`03-LEVEL-BY-LEVEL.md`](./03-LEVEL-BY-LEVEL.md) — current and intended state
   of all sixteen playable regions.
4. [`04-SYSTEMS-AND-ARCHITECTURE.md`](./04-SYSTEMS-AND-ARCHITECTURE.md) — how the
   runtime, saves, progression, equipment, authoring, co-op, and deployment fit
   together.
5. [`05-REMAINING-WORK.md`](./05-REMAINING-WORK.md) — prioritized production
   backlog and the quality gate for future work.
6. [`06-ESSENTIAL-FILES.md`](./06-ESSENTIAL-FILES.md) — authoritative files,
   derived files, disposable bulk, and the current Git hazard.
7. [`07-WORKING-COPY.md`](./07-WORKING-COPY.md) — how to make a small runnable or
   code-only copy without dragging along hundreds of megabytes of evidence.
8. [`08-HISTORICAL-PLANS-INDEX.md`](./08-HISTORICAL-PLANS-INDEX.md) — what every
   older roadmap contributed, what remains authoritative, and what was superseded.
9. [`09-DECISIONS-AND-NONREGRESSIONS.md`](./09-DECISIONS-AND-NONREGRESSIONS.md) —
   accumulated owner decisions, accepted boss anchors, and recurring pitfalls.
10. [`10-HANDOFF-VERIFICATION.md`](./10-HANDOFF-VERIFICATION.md) — copy-generator,
    documentation checks, latest focused evidence and dated release history.
11. [`11-RECENT-CHANGES-AND-PLANS.md`](./11-RECENT-CHANGES-AND-PLANS.md) —
    changes since August, current Frostfell behavior, harness limits and future plans.
12. [`NEXT-MODEL-BRIEF.md`](./NEXT-MODEL-BRIEF.md) — concise context that can be
   pasted into a fresh model session after the working copy is attached.

## Authority order

When records conflict, use this order:

1. Current files in `public/`, especially `public/index.html` and the loaded
   `public/bladefall-*.js` authorities.
2. Current automated tests and live validators in `tests/` and `scripts/`.
3. This handoff folder, whose snapshot date is 2026-09-10.
4. Current level charters under `docs/charters/`.
5. Older roadmaps and baseline evidence. These are valuable history, but several
   status tables predate the completed Ruined Keep and Warden passes.

Never infer that an old roadmap's “Complete” means the current reimagining is
finished, and never infer that “Pending” is still accurate without checking the
runtime and tests.

## Fast start

From the project root:

```bash
npm install
npm run serve
```

Open `http://127.0.0.1:8371/index.html`. Use `?tas=1` only for the manual harness;
see [TESTING.md](../TESTING.md). Relevant checks and the release-boundary workflow:

```bash
npm test
npm run validate:ruined-keep
npm run validate:warden
npm run validate:frostfell
./build-deploy.sh
npm run release:check
```

The generated `netlify-deploy/` directory is never the editing source. Edit
`public/`, rebuild the mirror, and do not deploy to Netlify unless the owner
explicitly requests it.

## Snapshot identity — 2026-09-11

- Source version `7.96.0`, service-worker cache `bladefall-v176`. Both were bumped at
  this release boundary; earlier deployed or cached copies are older.
- The Git branch `chore/track-authoritative-tree` now tracks the whole authoritative
  tree (352+ files). A fresh clone rebuilds the game. It has not been pushed or merged.
- Start through Warden complete in substance per owner; Frostfell authored and
  reviewed; the Muster recall now reaches Warden, Outskirts, Black Woods and Broken
  Causeway with authored rosters.
- Latest evidence: full `npm test` **500/500**, `release:check` ok with **93** assets
  (the manifest is derived from `build-deploy.sh`), Frostfell receipt 15/15.
- A general traversal bot (`npm run bot`) completes The Outskirts, Black Woods and
  Broken Causeway from cold; later levels stop at portal placement.
- Frost Sorcerer / White Court remains the next chapter to design. No deployment
  authorized.
