# Climb cleanup completion — 7.281.0

2026-10-06. All implementation and verification work authorized without further design input is complete locally.
The deployment folder is prepared, not published. No commit or APK was created.

## Completed

- All 40 worlds are assembled. Base 1–20 retain their completed cleanup; the harder Fractured builds now cover all of 21–40.
- Integrated/repaired this run: **21, 22, 23, 24, 29, 31, 32, 35, 36, 37, 38, 39, 40**. Their browser roads, branches,
  rewards, return passages and reverse entrances pass with zero deaths. Applicable ceiling lifts and drop-back checks pass.
- 21: both echoes have working ceiling entrances and returns. 22–24: lifts, gaps and entry elbows resolve their road overlaps.
- 29: its three departure roads have clear junction mouths. 31/32/38/39: cached roads reused, usable secrets and returns completed.
- 35: stationary Roof hosts **Lift and Toss**, with an actual entrance shaft and drop home. Cart-starting candidate secrets were
  rejected because they lacked a physical drop-back entrance. Replaced the obsolete junction arrangement with verified mouth sides;
  crowded arrivals use a compact layout and a middle-height hearth. All five connections work in both directions.
- 36: completed run-6 build integrated. 37: merged the two tiny return-corner pieces into one passage with a two-tile entrance;
  the authored challenge rooms are unchanged. Its redundant full-search process was stopped after the direct repair passed.
- 40: redesigned road and both branches integrated. Corrected return-corner demonstrations in 22/31/35/38/40; the builder now
  emits the browser-proven movement sequence for that exact corner shape.
- Door beams follow their owning world across boundaries; folded-mouth drawing order preserves visible floors.
- World 24's stale Crown route override was removed. Shaft's entrance closure preserves its authored upper exit.
- The Node geography fixture now exposes the same gravity module as the browser, so inverted exits are checked in upright
  coordinates. The lift test retreats immediately in shade rooms instead of idling until the shade kills the player;
  live hazard behavior and the user's pending protection decision are unchanged.

The existing zipline, map, inversion rendering, harder bosses, new Fractured mechanics and momentum relocation remain in place.

## Verification evidence

Logs and reviewed screenshots are in `scripts/climb/.cache/worlds-r7/` (local, gitignored).

| Coverage | Result / evidence |
|---|---|
| Room by Room | 40 regions, 578 rooms passed (`rbr.log`). |
| Base momentum restriction | 322 road/quest/side/bearing tapes and 20 selected secret routes: no advanced momentum events (`base-momentum.log`, `base-secret-momentum.log`). |
| Changed worlds | `page21.log`, `page22-final.log`, `page23.log`, `page24-final.log`, `page31-final.log`, `page32.log`, `page35-floor.log`, `page37-corner.log`, `page38-final.log`, `page39.log`, `page40-final.log`; 29/36 evidence also retained from integration. Lift logs include `lift23-32-40.log`, `lift35-floor.log`, `lift37-final.log`, `lift38-final.log`. |
| Runtime geography | 378 directed seams and 490 authored challenge routes passed (`runtime-gravity.log`). |
| Terrain / travel | 134 clear projections and repeated jump/dash trips (`projected-final.log`); all 67 corridors and 206 junction roads both ways (`traversal-final.log`). |
| Full journeys | Every connection both ways, plus multi-region trips, passes without repositioning after setup; 99,226 frames, hearth-to-hearth durations below 10 seconds (`journeys-compact.log`). |
| Geometry | Footprints and containment passed (`footprints37-corner.log`, `contained37-corner.log`). |
| Other required checks | Folds, Continue/resume, mouth views, co-op and junction regressions passed (`folds-final.log`, `resume-final.log`, `mouth-final.log`, `coop-final.log`, `junction-final.log`). |
| Browser features | Co-op connection/transfer, route replay and limited skips passed, no page errors (`feature-final.log`). |
| Rendering | 268 folded comparisons passed, worst 0.033913% against 0.05%; 15,678 floor probes, zero hidden floors; scroll worst 1.9763% against 5% (`render-final.log`). Changed branch, junction and repaired-corner screenshots inspected. |
| Local release | `./build-deploy.sh` passed: 397 game files plus configuration/readme (`build-deploy-final.log`). Changed runtime assets match `public/` byte for byte. |

## Release and cache state

- Changed runtime script versions are synchronized at **7.281.0** in `public/precision.html` and `public/sw.js`.
- Service-worker cache: **bladefall-v445-climb-complete**.
- Ready-to-publish folder: `netlify-deploy/`.
- Canonical local assembly artifacts: `scripts/climb/.cache/worlds/`. Keep the road caches and run-6/run-7 artifacts.
- World 37's repaired output is also saved as `worlds-r7/w37.json` and `w37-corner.json`; original is `w37-before-corner.json`.
- Rebuilds must be verified again: the manual World 37 passage merge is preserved in cached/generated output, while the builder
  now rejects one-tile mouths. Existing World 24 seam closure and corrected corner recordings are preserved in current outputs.
- No builder jobs remain running. The pre-existing development server was left alone.
- The user's existing `LLM-HANDOFF/locks/climb-15-20.json` modification was left untouched.

## Still needs Isaac's input

1. Should roads also unlock from their far end?
2. Keep or remove the old room-layout map toggle?
3. Keep the six momentum lessons in Fractured, or return them to base?
4. Approve lift speed/activation feel; should a lift protect against hazards such as watch lights?
5. Playtest fairness/variety of mirror panes, shades, tears and repeated three-lane rooms in Fractured 33–40.
6. Playtest boss twists, the King in Daylight's air-only hits, and Noon at three blooms.
7. Decide whether to add gate links **39–21** and **40–23/25/27**; these remain unbuilt as requested in the prior handoff.
8. Authorize publication when ready. `.agents/AGENTS.md` says: “Do not deploy to Netlify (`netlify deploy`) unless explicitly
   instructed by the user, as they want to save their deployment credits.” The local bundle is ready for that decision.

These design choices were not decided on Isaac's behalf. Passing automated checks does not replace his requested playtesting.
