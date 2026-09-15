# Movement testing

Run `npm run serve` and open `/index.html?tas=1` on the local server. The opt-in TAS harness is `window.__BF.tas`; automatic gameplay updates/rendering are gated off in this mode, so manual calls control movement frames. Normal play is unaffected. Determinism is scoped to player movement within one loaded level, not enemy AI, combat, cosmetics, or asynchronous zone transitions.

## API

- `resetGame()` starts a fresh seeded test run at **The Outskirts (350, 0)**, frame zero. The default seed is `0xB1ADEFA1`; `resetGame(seed)` or `resetGame({seed})` selects another seed.
- `stepFrames(n, inputs)` advances exactly `n` fixed frames (currently `1/60` second each), applying the same boolean button state each frame. Examples: `{right: true}`, `{jump: true}`, `{right: true, dash: true}`. Omitted buttons are released; `{}` releases all buttons. Press edges persist across calls: release a button before pressing it again to trigger another press. Invalid inputs/counts and inactive or transitioning levels are rejected.
- `getPlayerState()` returns plain JSON using internal names: `frame`, `x`, `y`, `vx`, `vy`, `onGround`, `state`, `onWall`, `slamming`, `dead`, `hp`, `blood`, `coyote`, `wallCoyote`, `dodgeCdT`, `dodgeTimer`, `jumpBuf`, `atkBuf`, `dashBuf`, `slamCd`. Reset and stepping also return this snapshot.
- `resetGame({preset: 'portal-momentum'})` is the single setup hook. It grants session abilities `jump`, `weapon`, `dash`, `portal-single`, and `portal-pair`, then adds a one-way authored pair: left-facing entry `(450, 0)`, upward exit `(350, 0)`. The player still starts at `(350, 0)`. An optional `seed` can be supplied. There is no general position/velocity editor or arbitrary ability-grant API.

```js
const game = window.__BF.tas;
game.resetGame();
game.stepFrames(30, {right: true});
console.log(game.getPlayerState());
```

## Verified geometry and movement

- The default spawn sits on flat ground spanning `x=0–600`. The 30-frame rightward baseline stays clear of drafts, hazards, portals, and enemies, with `y=0`, `onGround=true`, and `state="grounded"`. No ability unlocks are required. Maximum normal run speed is **200**.
- Jump velocity is **480**; normal gravity is **1400**. Velocity `vy` is negative while rising. Gravity applies on the launch frame, so the first observed jump velocity is `-480 + 1400/60 = -456.6667` approximately. Hold jump when testing the full arc; releasing it cuts upward velocity.
- Coyote time is **0.1 seconds**. Walk right from the default spawn off the `x=600` ledge. The departure frame refreshes the timer; following frames decrement it before checking jump eligibility. Current boundary tests jump on the fifth and seventh subsequent frames: one frame inside and one after nominal closure. The sixth decrement can leave tiny positive floating-point residue.
- **The `wall-slide` state string is unreliable while rising:** the classifier can report it whenever `onWall` is true. Check `onWall`, `onGround`, and velocity together rather than inferring jump success from the state string alone.
- Portal transport preserves speed magnitude, transforms direction to the exit mouth, and clamps speed to **150–1400**. Use an entry speed comfortably inside that range. The existing portal test observes `portal:transit` before the remainder of the frame adds gravity.
- Normal campaign startup at `(70, 0)` is covered separately using the real title button and keyboard. The western spring and updraft stay dormant until the Keep seal opens; the resolved startup bug is recorded in `KNOWN_BUGS.md`. The movement baseline remains `(350, 0)`.

## Adding and running tests

Add movement tests to `tests/tas-runtime.test.mjs`, following its `node:test`, `node:assert/strict`, and `openMovementHarness(t)` pattern. It starts an isolated server and fresh Puppeteer browser; no existing dev server is required. Chrome defaults to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; override with `PUPPETEER_EXECUTABLE_PATH` when needed. `openMovementHarness(t, {tas: false})` exercises normal play: the startup regression clicks Start, skips the intro, waits 120 automatic frames at the real spawn, then runs and jumps using keyboard events. A separate gate test checks both locked and unlocked western return machinery.

Use tolerance-based assertions for floating-point values, not exact equality. Existing arc/transport checks use `near()` with `1e-7`; the ground baseline uses `1e-9` numerical slack and a 1% final-speed allowance. Exact checks remain appropriate for booleans, state strings, and frame counts. Read movement tuning from `window.__BF.movementState().profile.tuning` and timestep from `window.__BF.simulation.fixedDt`; follow the existing source extraction for gravity instead of guessing constants.

Run the focused suite (last verified: **19/19 passing**):

```sh
node --test tests/simulation.test.mjs tests/platformer.test.mjs tests/tas-runtime.test.mjs
```

## Save/restore for branching (TAS only)

`saveState(name)` stores an in-memory frame-boundary snapshot and returns its full serialized state string. `restoreState(name)` restores a fresh clone and returns `getPlayerState()`. Saves are reusable; saving the same name replaces it, unknown names throw, and `resetGame()` clears saved branches. Names are not part of the serialized state, so strings from different names can be compared directly.

Snapshots include the loaded world (`G`, including enemies, obstacles, fluids, particles, and shared platform/entity references), in-memory progression, injected input history, simulation ticks, every seeded RNG stream, input trace, and private subsystem state/caches. Legacy random draws and timestamps use simulation-owned sources during manual steps. Browser DOM, audio hardware, wall-clock performance metrics, and external event subscribers are not simulation snapshots. TAS playback is silent; asynchronous zone transitions and cinematics are rejected before scheduling. Use this within a single loaded level; it is not a disk save or a browser-session checkpoint.

```js
const game = window.__BF.tas;
game.resetGame();
game.stepFrames(30, {right: true});
game.saveState('branch');
game.stepFrames(10, {right: true});
const first = game.saveState('first');
game.restoreState('branch');
game.stepFrames(10, {right: true});
const second = game.saveState('second');
console.log({byteIdentical: first === second, player: game.getPlayerState()});
```

Replay identity deliberately uses exact serialized equality; movement expectations still use tolerances. The save/restore test in `tests/tas-runtime.test.mjs` compares all ten full-state snapshots, checks immediate restoration and reusable branches, and repeats the check through the portal preset.

## Frostfell route validation

Run `npm run validate:frostfell` (Chrome, or set `PUPPETEER_EXECUTABLE_PATH`). It starts an isolated server/browser and uses the existing TAS API to escort Nim, route actual emitted fire through a placed portal, acquire Double Jump, climb both galleries, collect the recollection, and open the return passage. It also checks campaign rewards and revisit persistence. The receipt and canvas captures live in `docs/charters/08-frostfell/evidence/`. It does not change your campaign save.

The stage bootstrap and isolated Counter encounter are in `scripts/frostfell-route.mjs`; the main traversal does not reposition the player or disable enemies. Preview jump strength now reads the same active capability state as jump count. Cross-zone streaming and the later White Court connection are outside this single-level check.

The Frostfell route validator also covers the new 20-landing finale. It uses TAS save/restore to find a damage-free route, stores the winning inputs in the receipt, replays them, checks the three intermediate checkpoint recoveries, and takes the summit passage back to the refuge. The validator additionally checks the engine activation and persistent Frostfell reinforcements, exact two-Blood hulk contact, and the three-stop service cycle. A normal-play browser page exercises both mine crossings while Left stays held, then verifies the music shift and playback.

## General traversal bot (run 2)

The runner is local and needs no model during an attempt:

```sh
npm run bot -- --stage 0 --out docs/bot/route.json
npm run bot -- --stages 0,1,2 --budget 20000 --out docs/bot/routes.json
npm run bot -- --stage 4 --goal 4700 --out docs/bot/linked.json
npm run bot -- --replay docs/bot/linked.stage-4.inputs.json --out docs/bot/replayed.json
node scripts/bot-geometry.mjs 4 3000 4600
node --test tests/bot.test.mjs
```

`--muster` loads the recall setup and earned return capabilities. `--segments`
and `--budget` limit search. `--goal` sets a horizontal target, which may be
reached in the air; it does not mean the level is complete. Defaults require the
far zone seam, or stop at the boss threshold if a living boss lies ahead. Boss
combat and asynchronous zone streaming are not part of this runner. The final
boundary input attempt is included in the reported input-frame count.

Every receipt has a sibling `*.stage-N.inputs.json` containing the actual button
states and a SHA-256 hash of the final full simulation snapshot. `--replay` checks
that artifact without searching. A replay-mode pass means the stored route was
reproduced, including a partial route; it does not upgrade that route to level
completion. Use the same game source for matching hashes. Chrome is used by
default; `PUPPETEER_EXECUTABLE_PATH` overrides its location.

`scripts/bladefall-bot.mjs` derives ledges and connections from loaded geometry.
It tries a direct movement policy, then branches over input macros using TAS
save/restore. The movement envelope accounts for nearby refill crystals, acquired
flight gear and linked anchors. Macros include steered jumps/dashes, jump releases
around refills, and fuel-consuming flight. The mechanism driver visits quest
actors/catches, strikes levers, stands on plates and approaches available pickups.
For independent floor pairs it visits both slates and a geometry-selected high
perch, then falls into the intake to launch over the obstruction. These are real
inputs, not capability grants, coordinate changes or direct mechanism activation.

`bootstrapStage` alone selects the stage and its constitutional capability prefix.
It restores an initial runtime snapshot before independent attempts, including
registered subsystem counters that `beginRun` alone does not reset. The harness
remains opt-in and campaign storage is untouched.

A solve pass requires the target/seam to be reached alive **and full serialized
simulation equality** when the committed inputs are replayed. Failed branches
cannot remain in the winning input list. Receipts retain the exact failing
segment, its starting ledge, attempted candidates, failure reasons and setup
visits. `evidence` counts actual crystal activations, successful portal placements
and frames that consumed flight fuel during replay. Player-state equality is
reported separately and is insufficient for a pass.

Run 2's focused routes cover Marksman's two crystal walls and anchored crossing,
Keep's independent-pair screen, and the Updrafts winch/pack/gate/flight sequence.
The Outskirts/Woods exits and Causeway boss threshold remain the whole-route
checks. See `LLM-HANDOFF/12-RECALL-WORK-ORDER.md` and `docs/bot/receipt-run2.json`
for the final sweep and remaining blocks. These fixtures are individual stage
attempts, not a continuous campaign or proof that every later puzzle is solved.

Important implementation traps:

- Held Jump is one press. Release it before spending a crystal refill.
- Keep Jump held through a dash when the route needs the full jump arc.
- Restores replace objects; resolve obstacles by stable identity or geometry.
- Split ledges at walls, but do not forbid jumping over a low wall outright.
- A slate can overlap ordinary ground. Detour completion must check the actual
  target position, not require a particular `floorPlat` object.
- A target can be reached during a macro. Stop immediately when its predicate is
  satisfied; don't discard an airborne target because it is not a landing.
- Nested detours must restore the parent graph/direction. Failed branches must
  trim inputs to the committed save before reporting or trying another route.
- Full snapshot identity is deliberately exact; movement tuning assertions use
  tolerances. A fuel value of zero after flight is valid and is not a free refill.

## Expanded recall (run 1, 7.97.0)

`node --test tests/muster-recall.test.mjs` covers the world-wide one-time baseline,
first ordinary-enemy re-garrison, later-death persistence, protected bosses and
circuits/shortcuts, four regional attack cycles, placement, and a real-input
Double Jump/Dash passage past the Causeway opening marshal.

`node scripts/capture-muster-recall.mjs` writes staged arrival and telegraph
screenshots to `docs/recall/evidence/`. It sets positions and hides defeated bosses
explicitly; screenshots are not natural route or boss-victory evidence.
`docs/bot/receipt-recall-run1.json` retains the unmodified bot's full sweep: recalled
Outskirts/Woods pass, Warden/Causeway fail. It compares final player snapshots and
uses per-stage bootstraps. Full-state replay and broader bot verbs belong to run 2.

## Return reserves and shortcuts (run 3, 7.98.0)

- `node --test tests/recall-return.test.mjs`: sealed first visits, idempotent
  installation, one-time advancement, campaign serialization/reload/rest/death,
  and real-input Double Jump access to each reserve (single jump cannot land).
- `node scripts/validate-recall-return.mjs`: all four physical shortcuts in both
  directions, with actual movement inputs after initial fixture setup. Writes
  `docs/recall-return/receipt.json` and local PNG evidence. Damage is suppressed
  to isolate geometry; this does not certify combat, a boss or continuous travel.
- Recalled `bootstrapStage` grants and synchronizes the earned kit, including
  `maxJumps`. A capability-list entry alone does not refresh player fields.
- Stored run-2 input hashes belong to 7.97.0. New obstacles in 7.98.0 change full
  snapshots; regenerate an artifact with the current build before expecting an
  exact cross-process hash match. Historical receipts remain historical evidence.

## White Court implementation (work in progress)

- `node --test tests/white-court.test.mjs`: 25 focused checks, including actual
  portal transport, unassisted Rusty Sword victory, delayed finishing retry,
  temporary ice, unsolved Glassworks basin recovery, local routes and persistence.
- `node scripts/white-court-boss-probe.mjs`: saves an unassisted arena receipt;
  `--approach=left` verifies a left entry with channel recovery and a side change;
  `--weapon=axe` checks another ordinary weapon and `--miss-finish` deliberately
  waits out the last exposure. `--invulnerable` is diagnostic only.
- `node scripts/validate-white-court-connections.mjs`: normal keyboard/automatic
  loop, six connector directions and the locked Emberdeep door. Endpoint setup
  and boss victory are fixtures, not full traversal or fight proof.
- `node scripts/validate-white-court-reload.mjs`: actual page reloads in campaign
  mode, saved-open aqueduct travel, reward idempotency, Attunement and absent boss.
  Boss advancement changes currency legitimately; compare revisits against the
  post-victory balance.

Receipts live in `docs/charters/09-frost-sorcerer/evidence/`. The generic stage8
bot receipt failed segment2 at its30,000-expansion budget; it is not a completed
level or proof of a softlock. Read `IMPLEMENTATION-STATUS.md` in that charter for
remaining acceptance work and fixture boundaries.

White Court probe input gotchas: ward impact causes hitstop, which consumes a
single-frame portal press without acting on it. Wait for hitstop to clear before
cycling the pair. After teleporting, wait for actual grounding before placing a
new mouth and verify the mouth count. A lure point inside the mouth teleports the
player and redirects later shots toward the wrong end. Probe receipts include
actual return coordinates, setup positions, damage and page errors. Victory heals
Blood, so inspect the damage trace rather than inferring a flawless fight from
final Blood alone.

The probe and fight tests share `scripts/white-court-fight-policy.mjs`. The current
winning right route rebuilds the entry on the dry eastern slate after its first
ward. Do not compare an ice patch against ordinary ground braking. White Court
blink completion must reset its timer to zero: a negative remainder previously
froze pursuit, invalidating the old left-entry and earlier timing receipts.

Current near-miss check uses real returned orbs at±50 and±65 horizontal offsets:
the former capture and the latter miss. Channel recovery checks ordinary walking
up both sloped banks before the first ward freezes the crossing. The left-entry
fight now has a passing permanent check against active pursuit; its four wounds
leave little margin, so this is completion evidence, not human balance approval.

`node scripts/white-court-high-route-probe.mjs` searches and records the high-cache
route; add `--gallery` for the recollection approach. Each searches jump timings
with save/restore, then replays the whole winning sequence from one start before
writing a receipt. This is local compute, with no model decisions per attempt.
The two focused tests consume these input receipts and verify actual landings;
the gallery test continues to the checkpoint. Damage suppression isolates geometry.
Normal stage8 capabilities are used; optional Echoes are not granted.

Add `--overlook` to the route probe to record the checkpoint-to-railing approach
and desktop/narrow captures. The permanent overlook test uses no invulnerability,
checks both1440×900 and640×360, verifies framing and quietness, then movement
cancellation and timeout. After a TAS bootstrap, set canvas size and call
`recalcVP()` before testing a particular viewport: snapshot restoration includes
the initial viewport values. The narrow preview uses reduced motion and muted audio.

`node scripts/validate-white-court-aqueduct-route.mjs` runs a normal-keyboard round
trip from the White Court refuge through the aqueduct and Frostfell service loop
and back. It takes real time (roughly a minute), does not reposition endpoints,
and logs actual wounds as well as final health. Its only setup is the normal
stage8 capability-prefix fixture. It does not certify recalled-enemy pressure or
an entire campaign. Receipt: `evidence/aqueduct-route.json` in the White Court charter.

### White Court routes with damage enabled

Run `node scripts/validate-white-court-route-pressure.mjs` to replay the saved high
cache and gallery inputs with damage enabled. It records actual Blood wounds,
landing checks, rewards and the gallery checkpoint, plus four room captures in
`docs/charters/09-frost-sorcerer/evidence/`. It exits nonzero if the routes fail or
page errors occur. The initial stage8 capability-prefix fixture is explicit:
high starts at4800; gallery starts at10820. No subsequent repositioning or restore
is used. This does not certify a full campaign-state traversal.

`node scripts/validate-white-court-continuous-approach.mjs` chains the authored
arrival, high cache, Glassworks emitter/portal/bridge, gallery recollection and
checkpoint12400 with damage enabled. It saves every input and wound in
`evidence/continuous-approach.json`; nonzero exit means failure or page errors.
There are no intermediate position fixtures or restores. The initial stage8
capability prefix is a fixture, and the run stops before the arena.

Add `--boss` to the continuous approach validator to walk into the arena and
continue with the same player state. `runWhiteCourtFight(..., liveStart=true)`
skips its initial position fixture and forbids weapon/invulnerability overrides.
The receipt includes all fight inputs and `maxWard` (death resets current wards).
The current continuous attempt passes all three wards, the Rusty Sword finish
and the final walk to the usable Emberdeep door in5361frames. TAS intentionally
stops before asynchronous crossings; normal connector validators cover the seam.

`node scripts/capture-white-court-phases.mjs` replays the successful continuous
receipt with muted audio/reduced motion and saves nine actual attack-state PNGs.
Keep the original simulation viewport: changing its width changes encounter
activation and can invalidate input replay. Export only VW/VH, not the larger
backing canvas. The entrance visibility fix was verified in a refreshed first-cast capture.
This script's success means replay/capture succeeded, not universal legibility.

Phase capture now saves eleven views, including refuge and Glassworks. Frost and
refuge close views temporarily center the camera for rendering only; restore it
before advancing simulation. The active frost cap draws after the portal skin.
Latest full regression:541/541; the subsequent visual-only cap change passes the
continuous replay/capture and baseline/parity rerun.
