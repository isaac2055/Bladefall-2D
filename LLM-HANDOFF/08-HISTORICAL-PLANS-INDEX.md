# Historical plans and how to use them

The project contains several generations of planning. None should be deleted:
they preserve intent and explain why apparently redundant systems exist. They
also should not be treated as one cumulative checklist. This index separates
durable decisions from superseded sequencing and stale status labels.

## Current planning authority

Use this handoff set for current sequencing:

- `02-MASTER-VISION.md` — durable product and narrative target.
- `03-LEVEL-BY-LEVEL.md` — current purpose and target for every region.
- `05-REMAINING-WORK.md` — next production order and acceptance gates.
- `09-DECISIONS-AND-NONREGRESSIONS.md` — owner-approved behavior that future
  edits must preserve.

Then consult the current runtime, tests, and appropriate charter. Code and live
behavior outrank every prose status table.

## Roadmap generations

### `docs/modernization-roadmap.md`

This was the engine/control modernization program. Its useful inheritance is
the modular authority layer, deterministic fixed-step simulation, camera and
rendering controls, environmental simulation hooks, diagnostics, performance
budgets, accessibility/settings growth, and multiplayer infrastructure. Much of
that foundation is implemented. It did **not** by itself author the slower,
interconnected Datura campaign now desired.

Keep its engineering principles; do not restart its run sequence merely because
later level content still looks old.

### `docs/experiential-remaster-roadmap.md`

This was the systemic-remaster program: biome profiles, ecology, improved enemy
behavior, environmental coupling, richer presentation, lore, and integration.
Its runtime layers are useful and partially implemented. The owner subsequently
found that globally distributed systems could still feel random or like a
mechanics showcase. The governing correction is now **authored placement with a
purpose**. A wind tunnel, hazard, NPC, collectible, or enemy belongs only when
its spatial and narrative role is legible.

### `docs/datura-reimagining-roadmap.md`

This is the major story/world reimagining plan. It describes an 88-run structure:
foundation work, deliberate multi-pass construction for each level, integration,
and final validation. Its narrative thesis, quality discipline, planning-first
level workflow, and requirement for physical world seams remain foundational.
Its progress ledger is stale: later work completed bespoke versions of Ruined
Keep and Warden after the ledger stopped being updated. Use this handoff's level
status instead.

The important method to retain is:

1. survey the existing level live;
2. write or update its charter and spatial route;
3. implement one bounded mechanic/space pass;
4. test the real traversal with ordinary progression abilities;
5. repair softlocks and reset behavior before adding decoration;
6. run a pacing/reward/story pass;
7. validate the entrance and exit seams in both directions.

### `docs/subsequent-level-run-plan.md`

This is the reusable P/G/S/E/V production pattern:

- **P — planning:** live survey, purpose, route, gates, rewards, story beats.
- **G — geometry/gameplay:** platforms, hazards, encounters, puzzle state.
- **S — systems/story:** progression, NPCs, memories, save/backtrack state.
- **E — experiential:** art, audio, signposting, pacing, visual hierarchy.
- **V — validation:** normal-input completion, death/reset, return traversal,
  level select, save/load, and release parity.

The exact number of passes may change by level; the separation of concerns
should remain. Frostfell has now completed its authored passes; White Court is the next unbuilt chapter.

### `docs/metroidvania-foundation.md`

This records the interconnected-world foundation: persistent cross-region save
state, physical seams, progressive abilities, return gates, and branch logic.
It remains structurally relevant. The canonical ability, key, zone, and
connector definitions are now in `public/bladefall-progression.js`; prefer that
file when prose and runtime disagree.

### `docs/opening-arc-systems-matrix.md`

This is the most useful detailed reference for the compact reward economy in
the opening arc: Blood, weapons, mantles, Gifts, Echoes, named rewards, quests,
and revisitation. Its guiding principle survives: fewer systems, each connected
to traversal, combat, environment, character, or story. Do not reintroduce
random stat debris just to populate space.

### `docs/campaign-conversion.md`

This explains the transition from isolated stages to an interconnected campaign
and the compatibility layer around older content. Treat it as architectural
history. The current campaign registry and source types in
`public/bladefall-campaign.js` are authoritative.

### `docs/level-authoring.md` and `docs/level-charters.md`

These define the authoring and charter process. They remain useful for future
levels, particularly acceptance criteria and integration receipts. Extend their
method rather than adding one-off geometry directly to the monolithic runtime.

### `docs/release-readiness.md`

This is the release checklist. Keep using it at release boundaries alongside
`./build-deploy.sh` and `npm run release:check`. Building the deploy mirror is
not permission to publish it.

## Existing level charters

Charters exist for levels 1–8 under `docs/charters/`. They are the detailed
design and evidence records for:

1. The Outskirts
2. The Black Woods
3. The Brute
4. The Updrafts
5. Hollow Marksman / Deadeye Court
6. Ruined Keep
7. The Warden
8. Frostfell (`README.md`, not `charter.md`)

Some charter prose predates final repair passes. Check the current validator,
runtime coordinates, and receipt before trusting a geometric number. Levels
9–16 need new charters or charter-quality planning before major rework.

## Plans deliberately deferred

- **Co-op adaptation:** keep the infrastructure, but do not let it constrain the
  Base single-player redesign until all sixteen regions work.
- **NG+1/NG+2:** later remix pass, not simple scalar difficulty.
- **Boss rush/leaderboards:** preserve existing systems, integrate after the Base
  route and completion accounting stabilize.
- **Unlocked original campaign/Recollections:** track one sealed discovery per
  level; unlock playable, darker remixes of the original fast campaign only with
  the endgame key.
- **Large presentation/engine replacement:** the existing engine is capable of
  the intended compact game. Improve authored composition and feedback before
  considering another wholesale engine rewrite.

## Supersession rule

When an old plan proposes bulk feature distribution and a newer owner decision
asks for slower, meaningful, authored use, the newer decision wins. Preserve the
underlying capability but deploy it only where a level's route, puzzle, encounter,
reward, or environmental story needs it.

## September additions

- `docs/frostfell-return-proposal.md`: original discussion plus subsequent scope
  decisions. Finale and Frostfell-only Muster activation are implemented; the
  world-wide encounter pass is still a proposal. The owner rejected the original
  advance-warning suggestion. Gemini observations are ancillary review prompts.
- `docs/charters/08-frostfell/README.md`: current eight-room level and implementation
  details; evidence receipt records what the bespoke validator exercised.
- `TESTING.md` / `docs/tas/README.md`: manual fixed-frame testing, named save/restore
  and smoke-run limits. The general autonomous campaign bot remains future work.
- `KNOWN_BUGS.md`: startup updraft is marked fixed; Bram reward mismatch is not.

Use `11-RECENT-CHANGES-AND-PLANS.md` for the reconciled follow-up timeline; do not
resume an old proposed step when the newer scope decision already completed it.
