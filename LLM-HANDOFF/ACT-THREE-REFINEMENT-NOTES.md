# Fractured refinement — reusable working notes

Owner (2026-09-24): quality comes first, but reduce repeated reading, browser setup and
verification. The later owner request authorized all remaining regions in one batch. Outskirts refined7.211.1; Woods7.211.2; Updrafts7.211.3; Causeway7.211.4; Marksman7.211.5; Keep7.211.6; Warden7.211.7; Frostfell7.211.8; Sorcerer7.211.9; Emberdeep7.211.10; Colossus7.220.1.
Inversion through Palace refined7.220.2. No fractured refinement pass remains outstanding. All twenty echoes are now constructed. Campaign order corrected to source order in7.211.4; stage IDs remain stable. Current code wins over all notes.

## Bounded pass
- Read the region charter, its gameplay/art pair, and its tests. Search shared code only
  for a concrete dependency. Preserve all other dirty work; no commits/deploys unless asked.
- Preserve the region's concept, entry kit and owner cuts. Prefer visible physical causes,
  matching collision/art, learnable cues and reliable saved progress to wholesale redesign.
- One focused test batch and targeted native-input/browser checks of changed behavior.
  Do not rebuild a generic solver, retry whole routes, or rerun unrelated suites.
  State fixture boundaries; unchanged historical full runs are not new evidence.
- Update region facts in place, add a short current brief, bump changed asset queries and
  VERSION/cache together, then build-deploy.sh (local copy only).

## Reuse the browser fixture
- Follow the browser skill; reuse an existing browser binding and its documentation.
  Prior local server was public/serve.mjs on8386; confirm it is live before reuse.
- Use a new private localhost tab with ?tas=1. In this mode saves are isolated. Known setup:
  tasPrepareRun(); tasDeterministicCall(()=>beginRun(0,null,{hp:1,dmg:1},
  {startStage:22,levelSelect:true})); change22 for the region under test.
- window.__BF.tas.stepFrames(n,{right:true,jump:true}) supplies native movement.
  Initial position fixtures must be disclosed. Releasing direction does not immediately
  stop airborne motion; use brief opposite input to brake on narrow landings.
- A single render() is cleared by the engine: a private requestAnimationFrame loop calling
  recalcVP();render() makes manually stepped frames visible. Close that temporary tab after.
- During local development use the supported CDP cache-disable and service-worker-bypass
  controls, then reload after edits. Old versioned assets otherwise survive reloads.
- Inspect screenshots through image output; never print their base64 as text. Batch small
  state receipts and use screenshots only where visual judgment is needed.

Known shared checks: crumble fields are crT/crDur, not crumbleT; wind-controlled gone flags
can be overwritten by hydration; a platform's rendered top must match its actual world y.
