# A1 — canonical campaign baseline

## Purpose

A1 establishes evidence for the campaign before the interconnected-world
rebuild changes geometry. It is not a level-design pass and it does not certify
the current campaign as visually sound.

The capture set is permanently pinned to game version `7.8.0`. Later audit runs
retain it as archived pre-reimagining evidence and report whether it matches the
current runtime separately; they never relabel old recordings as current-version
playability evidence.

The canonical game source is `public/`. `netlify-deploy/` is a generated mirror
created by `build-deploy.sh`; it must never become an independent editing
surface.

Run:

```sh
npm run baseline:audit
npm run baseline:capture -- --url http://127.0.0.1:8372/
npm run baseline:interact -- --url http://127.0.0.1:8372/
npm run baseline:dynamics -- --url http://127.0.0.1:8372/
npm run baseline:bosses -- --url http://127.0.0.1:8372/
npm run baseline:routes:opening -- --url http://127.0.0.1:8372/
npm test
npm run release:check
```

The audit writes `docs/baseline/a1-structural-baseline.json`. It records:

- Game and service-worker versions.
- Source/deploy parity for the runtime assets linked by the game.
- All 16 campaign blueprints and their construction sources.
- Level acts, mechanics, portal assignments, and normalized capture positions.
- Late geometry-mutation passes.
- Automatically detected design risks.
- The visual and playthrough evidence still required for A1 signoff.

The capture command refuses to run if the served game version differs from the
canonical `public/index.html`. It writes:

- `docs/baseline/evidence/a1-visual-atlas.json`
- One assembled runtime manifest and analysis report per stage.
- Entrance, act-center, upper-layer, and exit stills.
- `docs/baseline/evidence/index.html`, a reviewable campaign contact sheet.

The interactive command also refuses a version mismatch. It selects each stage
with the development reload API, restores ordinary starting health once, and
then uses keyboard input only. It writes a short entrance-locomotion video and
sampled receipt for every stage under `docs/baseline/interactive/`. These
recordings are deliberately labeled as entrance probes; they do not claim
level completion or successful puzzle resolution.

The dynamics command records targeted portal, fluid, updraft, follower,
gravity, minecart, collapsing-rail, and checkpoint behavior under
`docs/baseline/dynamics/`. Every receipt distinguishes keyboard actions from
state-positioned setup and synthetic failure. This is mechanism evidence, not
proof that a player can naturally reach or resolve the room.

The bosses command inventories all seven boss contracts, records their live
arena behavior, crosses disclosed HP thresholds, and triggers a synthetic
lethal fall to verify reset plumbing. The Abyss King probe also exercises its
special final-checkpoint return. These recordings do not claim intended portal
rounds, boss-caused deaths, balance, or victories.

The opening-routes command performs longer runtime-assisted keyboard attempts
for The Outskirts through The Updrafts. It never edits player position, HP,
invulnerability, test mode, or geometry after stage start. Only The Outskirts
begins from a genuine fresh run; the other three use disclosed development
stage selection. These attempts locate execution boundaries but cannot certify
human comprehension or intended-route completion.

## Current structural findings

1. Five stages begin from custom level data, nine are procedurally assembled,
   and the Vault and Deep Line use bonus/secret construction paths.
2. Campaign blueprints describe intent but their authoring manifests contain no
   assembled runtime geometry. Runtime capture is therefore required to know
   what a player actually receives.
3. Multiple systems mutate a level after initial assembly.
4. The Updrafts fluid showcase places water on selected existing ground without
   requiring a constructed basin.
5. Generic environmental compositions can add fluid, airflow, gravity, or
   moving-platform geometry based on empty-space checks rather than room intent.
6. Static reachability cannot prove dynamic routes and is not a substitute for
   playing portal, fluid, wind, moving-platform, gravity, or follower rooms.

## Visual signoff contract

For every stage, the generated report specifies entrance, act-center, and exit
stills plus required dynamic recordings. Normalized positions must be replaced
with assembled runtime coordinates during capture.

Each stage requires:

- Intended fresh-save completion.
- Returning-save revisit.
- Optional branch and collectible route.
- Credible speedrun route.
- Two-player route and transition.
- Setup, failure, recovery, and success recordings for every dynamic room.
- Every boss phase, one death/restart, and the winning resolution.
- Ordinary presentation and collision/debug-overlay stills for suspicious rooms.

The static atlas has now been captured and reviewed, all 16 stages have
version-matched input-only entrance probes, eight targeted dynamic probes, and
seven forced-phase/reset boss probes and four extended opening-route attempts
have been recorded. A1 remains **open** until the required natural dynamic-room,
boss-victory, and human interactive route reviews are complete. A passing unit
suite, release report, structural audit, camera-positioned still atlas, short
entrance probe, state-positioned test, or runtime-assisted route controller does
not close the experiential gate.

## Known issue ledger

| ID | Severity | Finding | Required disposition |
| --- | --- | --- | --- |
| `fluid-showcase-surface-placement` | High | The Updrafts water volume can sit directly above existing ground with no authored shores. | Remove or rebuild it as a contained room during the Updrafts level runs. |
| `automatic-environment-composition` | High | A late recipe can add environmental gameplay wherever a generic clearance search succeeds. | Base-game rooms must own every gameplay field explicitly. |
| `detached-blueprint-geometry` | High | Blueprint manifests do not contain assembled geometry. | Attach runtime captures and room maps to every level charter. |
| `dynamic-route-proof-gap` | High | Static reachability reports dynamic traversal as unknown. | Require recorded traversal and reset evidence. |
| `late-stage-mutation-stack` | Medium | Many post-assembly passes can alter a room without clear ownership. | Give every final entity a room and authoring owner. |
| `visual-capture-incomplete` | Resolved for static coverage | The 137-still campaign atlas exists and has been reviewed. | Preserve version matching; dynamic evidence remains separate. |
| `interactive-evidence-incomplete` | Blocking | Entrance probes do not prove complete routes, dynamic rooms, bosses, or co-op. | Record the five route classes plus setup/failure/recovery/success for dynamic rooms. |
