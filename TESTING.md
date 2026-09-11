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

## General traversal bot

`npm run bot -- --stage 0` (or `--stages 0,1,2`, `--goal 2600`, `--budget 20000`,
`--segments 40`, `--out path.json`) runs `scripts/bladefall-bot.mjs` in a headless
browser and writes a receipt. Unlike `scripts/frostfell-route.mjs` it reads no
bespoke authoring flag: it derives its own route from whatever geometry the level
has loaded. `node scripts/bot-geometry.mjs <stage> <xFrom> <xTo>` prints what the
bot sees for a stretch of a level; read a failure with it before changing the bot.

How it works, in the order the owner specified:

1. **Geometry.** Every standable surface is a `type:'plat'` (`Gr()` is a `Pl()`).
   Ledges are keyed by their span, not by object, because `restoreState()` hands
   back a fresh clone of the world; and a platform is split into separate ledges
   at any wall or closed door standing on it.
2. **Ledge graph.** Edges are envelope-reachable hops (run/jump/dash/double-jump
   bounds read from the runtime) that no wall or closed door bars. Distances are
   computed from the goal side, so a candidate is simply a neighbour closer to the
   goal than the current ledge; a hop that fails removes its edge.
3. **Hop search.** Depth-first over short macro-actions (runs, jumps with three
   holds, edge-aware jumps, launch-point "approach" jumps before an elevated
   target, crystal launches, dashes, waits, retreats) with `saveState`/`restoreState`
   branching and pruning for Blood loss, pits, overshoots and stalled progress.
   Each candidate gets a cheap pass, the closest two a deep pass, then one costed
   pass that accepts spending Blood.
4. **Mechanisms.** When the graph says the goal is unreachable and a closed door is
   ahead, the bot works the level's activators: quest residents and catches (Up),
   plain levers (a weapon swing), plates (stand). Each is a multi-segment detour in
   its own direction, and activators are re-resolved by a stable id after every
   restore.
5. **Report.** The winning inputs, or the exact failed segment with the ledge it
   started from, the candidates tried, and a histogram of why each attempt ended.
   The inputs are replayed from the origin and compared, so `replayIdentical` is
   real determinism evidence.

Completion is the level's far zone seam when there is one, and the boss arena's
threshold when a boss lies ahead, since a boss fight is not traversal.

**Measured reach** (from `docs/bot/receipt.json`; budgets of 20,000 expansions):

| Stage | Result | What the run shows |
| --- | --- | --- |
| The Outskirts | complete | seam crossed; ~45 segments; patrols timed, no Blood spent |
| Black Woods | complete | seam crossed; the high route over the root wall via approach jumps |
| Broken Causeway | complete to the Brute | Oren, both elevated catches, door opened, threshold reached |
| The Updrafts | opening only | the first door needs the Aerie Pack: a winch strike, then a pickup |
| Hollow Marksman | opening only | the wall needs a crystal-refill jump the search does not yet land; the road beyond needs the linked portal |
| Ruined Keep | opening only | the level is built on the twin-portal pair |
| The Warden | entry only | wall-jumps up the entry wall but the cells need a personal portal pair |
| Frostfell | opening only | portal-routed fire; the bespoke validator covers this level |

So: traversal plus mechanisms is solved end to end on the three levels that are
made of those verbs, and every later level is gated on a verb the bot does not
have - portal placement first of all. That is the next tier, not a tuning
problem, and the receipts say exactly where each level stops.

Lessons that cost real time, recorded so they are not paid twice:

- **A held button is one press.** Keeping `jump` true across frames presses once;
  every repeated hop must release between presses.
- **`restoreState()` replaces every object.** Anything held across a restore (a
  ledge, an activator, a door) must be addressed by geometry or a stable id.
- **A wall can stand in the middle of a ledge.** "Is there a wall between these two
  ledges" is the wrong question until the ledge has been split at its walls.
- **A thin platform's underside is solid.** Jumping from directly beneath one
  bonks; the launch point has to be short of its near edge.
- **Fixed frame budgets hide geometry.** A 220-frame walk is about 733 units;
   authored rooms are thousands wide.
