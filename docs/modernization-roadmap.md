# Bladefall modernization roadmap

## Why this is fourteen runs

The program is divided by six factors: dependency order, gameplay regression
risk, save compatibility, co-op synchronization impact, content blast radius,
and whether a change can be tested independently. Engine infrastructure,
campaign conversion, and final polish deliberately do not share a run.

| Run | Focus | Principal deliverable |
| ---: | --- | --- |
| 1 | Foundation and observability | Deterministic utilities, runtime events, timing telemetry, tests, architecture contract |
| 2 | Runtime decomposition | Stable state, save, input, content, and presentation module boundaries |
| 3 | Deterministic simulation | Fixed-step driver, seeded gameplay RNG, replayable input traces |
| 4 | Rendering generation | Layered renderer, effects budget, lighting/shader and animation pipeline |
| 5 | Character/platforming generation | Precision controller, slopes, platform inheritance, collision improvements |
| 6 | Environmental physics | Ropes, pendulums, rotating/moving mechanisms, materials and gravity fields |
| 7 | Systemic portals | Shared portal transport contract for actors, objects, forces, projectiles, and senses |
| 8 | Fluid dynamics | Gameplay fluid grid, portal transfer, buoyancy/currents, GPU presentation |
| 9 | Enemy intelligence | Platform navigation, portal awareness, modular abilities, encounter direction |
| 10 | Level authoring tools | Data schema, editor/import pipeline, validators, softlock analysis |
| 11 | Campaign conversion | Existing levels migrated and recomposed around interacting systemic mechanics |
| 12 | Multiplayer generation | Host authority, prediction/interpolation, snapshots, reconnect and shared transitions |
| 13 | Audio, camera, accessibility | Adaptive mix, surface audio, camera grammar, feedback and accessibility settings |
| 14 | Integration and release | Profiling, browser/device matrix, balance, save migration, offline build and final QA |

## Architectural contract

1. Existing saves and leaderboard storage survive every run.
2. The playable campaign remains bootable at the end of every run.
3. Simulation owns truth; presentation reads it and never decides gameplay.
4. Gameplay randomness is seeded. Cosmetic randomness may remain ephemeral.
5. Portals transport through one shared contract rather than per-level exceptions.
6. Co-op synchronizes events and authoritative state, not independent copies of the game.
7. Existing handcrafted content is migrated only after its replacement schema and
   validators are proven.

## Run 1 acceptance criteria

- The shipped page loads the core layer before the game runtime.
- Deterministic RNG, events, fixed-step accumulation, and rolling metrics have unit coverage.
- Update and render timings are visible through the existing `window.__BF` diagnostic hook.
- Offline and deploy manifests include the new runtime asset.
- No existing save key, gameplay rule, input, stage, or rendering behavior changes.

## Run 2 acceptance criteria

- Save and leaderboard persistence use a fault-tolerant storage boundary while
  retaining the exact existing storage keys and JSON shapes.
- Keyboard held/pressed state has one owner and retains the game's current
  repeat, blur, rebinding, and frame-consumption semantics.
- Existing content collections are discoverable through a validated registry
  without duplicating or freezing gameplay-owned objects.
- Overlay and toast changes publish semantic presentation events without moving
  gameplay decisions into the DOM layer.
- All boundaries have isolated contract tests and ship in the offline bundle.

## Run 3 acceptance criteria

- Every playable run owns a stable 32-bit seed and every stage derives or
  receives a stable stage seed.
- World generation, loot, enemy traits, combat rolls, boss decisions, and
  upgrades consume isolated named random streams.
- Cosmetic randomness cannot perturb gameplay outcomes.
- Gameplay advances on an explicit 60 Hz simulation tick.
- Compact input traces retain stage markers and can be decoded into replay
  frames for debugging.
- Continued runs retain their original run seed, and co-op can override stage
  derivation with its shared authoritative seed.

## Run 4 acceptance criteria

- Rendering exposes measurable background, world, actor, effect, lighting, and
  post-processing phases.
- The default high profile supports dynamic colored lights and biome color
  grading while sustained frame pressure can reduce light, particle, and
  weather budgets without affecting simulation.
- Portals, elemental projectiles, active hazards, bosses, and powered players
  contribute reusable light sources.
- Off-screen and over-budget particles are omitted from drawing but remain
  simulation-neutral.
- Hero and enemy rendering samples semantic animation states and applies subtle
  pose motion without changing collision shapes.
- Renderer diagnostics and isolated unit tests cover quality transitions,
  budgets, lighting composition, layers, and animation states.

## Run 5 acceptance criteria

- The existing ground, air, reversal, overspeed, dash, cart, and ice response
  values live in an isolated motion profile and retain their fixed-tick feel.
- Horizontal collision is swept from the previous to the next position so a
  fast dash or portal launch cannot tunnel through a thin wall.
- Curved platforms expose one shared smooth height sample, local grade,
  normalized tangent, and normal for collision and future material systems.
- Moving supports carry the player by their actual two-axis frame delta under
  normal and inverted gravity, and donate one bounded burst of horizontal
  momentum when the player leaves them.
- Portal-ballistic, dash, cart, wall-slide, slope, moving-platform, ice, rising,
  and falling states are visible through traversal diagnostics without moving
  gameplay authority into the diagnostic layer.
- Unit and browser smoke tests cover acceleration profiles, slope continuity,
  high-speed wall contacts, moving-platform carry/departure, ordinary jumping,
  wall jumping, and gravity inversion.

## Run 6 acceptance criteria

- Stone, ice, brittle, slate, and conveyor behavior resolve through one material
  table shared by the player, ground enemies, and movable crates.
- Existing sine movers retain their authored position and phase at every tick,
  while the same mechanism contract supports ping-pong and orbital paths.
- Low-gravity volumes, updrafts, portal-emitted drafts, directional wind, and
  radial gravity wells resolve through one deterministic field sampler for
  players and non-boss enemies.
- Pendulums and rotors expose deterministic transforms plus reusable actor-hit
  geometry, ready for campaign authoring without level-specific collision code.
- A pinned Verlet rope solver supplies secondary motion to existing vertical
  platforms without altering their path, collision span, or puzzle timing.
- Environment diagnostics expose active forces, resolved surface material,
  mechanism count, and simulated rope-point budget.
- Unit and localhost browser tests cover legacy mover parity, materials, mixed
  fields, mechanism geometry, rope constraints, normal/inverted updraft rules,
  enemy field response, and moving-platform suspension.

## Run 7 acceptance criteria

- Player mouths, fixed pairs, and one-way anchored exits resolve into the same
  normalized pair and mouth-frame representation.
- Player, crate, traveler, ordinary-enemy, boss, and projectile transit share
  one touch, cooldown, rest-mouth, eligibility, momentum-gate, position, and
  velocity contract.
- The compatibility transform retains every authored fling and cannon trajectory;
  a frame-relative transform is available for new puzzles that preserve both
  normal and tangential velocity.
- Selective payload exits, forced eject speeds, reflection ownership, portal-hop
  counts, boss weak-point effects, echo trials, and hijacks remain gameplay-owned
  policies layered over the shared transport result.
- Updraft and wind volumes intersecting a mouth can emerge from the paired exit
  along its normal, with visible flow and the same force response for players and
  enemies.
- Ordinary enemies can perceive and pursue a shorter reachable route through the
  player's pair, while bosses retain authored arena targeting.
- Semantic transit/rejection events and diagnostics classify entity kind, route,
  rejection reason, and aggregate counts.
- Unit and localhost browser tests cover actors, crates, projectiles, travelers,
  momentum/payload gates, one-way pairs, frame transforms, routed forces,
  portal-aware pursuit, and every portal-boss stage startup.

## Run 8 acceptance criteria

- Water, lava, sludge, and void liquid resolve through one bounded deterministic
  column simulation with stable fixed-step waves, impulses, material properties,
  and a hard per-volume column ceiling.
- Players, ground enemies, travelers, crates, and projectiles share one
  submersion sampler for buoyancy, drag, current, and damage while retaining
  their existing vertical-coordinate conventions.
- Environmental liquid can soften ordinary enemies but cannot solve an encounter;
  travelers remain recoverable and existing molten boss-projectile rules retain
  their authored exceptions.
- A submerged portal entrance emits a finite oriented jet from its paired exit,
  respecting normalized mouth frames, one-way pairs, source material, and
  transfer rate.
- Fluid surfaces expose adaptive high/balanced/low tessellation, animated foam,
  material gradients, and optional dynamic light without feeding presentation
  state back into simulation.
- One shallow, non-damaging cistern on broad safe Updrafts footing demonstrates
  current and surface response without changing a campaign puzzle route.
- Diagnostics expose active volumes, simulated columns, entity samples, surface
  impulses, portal jets, and material counts.
- Unit and localhost browser tests cover deterministic stability, wave
  propagation, coordinate-aware submersion, material forces, portal jets,
  adaptive rendering, player/crate/projectile response, and campaign startup.

## Run 9 acceptance criteria

- Static walkable surfaces form a cached navigation graph with blocker-aware
  walk, jump, and drop connections.
- Active player portal mouths add temporary graph connections while respecting
  one-way pairs and otherwise unreachable platform groups.
- Ordinary ground enemies navigate stacked and disconnected routes, commit
  enough horizontal momentum to finish a jump, and recover to patrol when they
  are outside the active encounter.
- Enemy roles use modular charge, blink, zone, shot, and dive abilities with a
  shared telegraph, windup, execution, and cooldown lifecycle.
- An encounter director caps active pressure, limits simultaneous melee and
  ranged attacks, and assigns spatial slots so groups remain readable.
- Flyers pressure from vertical slots, while authored bosses and the Deep Line's
  fixed sniper behavior retain their purpose-built state machines.
- Diagnostics expose navigation nodes and edges, route plans, decisions, recent
  actions, and encounter pressure.
- Unit and localhost browser tests cover navigation, portal routes, abilities,
  targeting, encounter budgets, every stage startup, and boss regressions.

## Run 10 acceptance criteria

- A versioned `bladefall.level@1` schema describes stage metadata, traversal
  objects, enemies, pickups, travelers, start state, exit state, and annotations.
- Legacy level-shaped JSON migrates into the current schema, while import,
  normalization, validation, export, and compilation remain detached from the
  live campaign.
- An undoable programmatic editor and standalone browser workbench support
  common entity additions, JSON/file import, formatting, preview, analysis, and
  normalized downloads without touching save or leaderboard storage.
- Every assembled runtime stage can be captured after procedural generation,
  custom construction, circuits, cadence, portal composition, mechanisms, and
  fluids have finished.
- Static traversal analysis proves walk, jump, and drop reachability while
  reporting portal, mover, door, crumble, updraft, low-gravity, and spring routes
  as confidence-qualified dynamic unknowns rather than false failures.
- Encounter composition groups spatial threats, reports role mix and pressure,
  and warns about crowding, ranged overload, recovery gaps, and hazard overload.
- Runtime diagnostics expose the current manifest and analysis through
  `window.__BF`, and the content catalog exposes the immutable level schema.
- Unit and localhost browser tests cover migration, validation, circuits,
  softlock confidence, encounter composition, editing history, runtime capture,
  all 16 stage captures, workbench interaction, and campaign regressions.

## Run 11 acceptance criteria

- One immutable blueprint catalog owns all 16 stage records, progression order,
  source modes, signatures, systems, named acts, portal verbs, cadence,
  optional portal trials, and custom extension lengths.
- Existing stage, portal, cadence, trial, and extension lookup shapes compile
  from blueprint data so compatibility does not require duplicate ownership.
- Custom, bonus, and secret levels pass through a deep-cloning compatibility
  compiler that emits and validates `bladefall.level@1` data and records parity
  before runtime construction.
- Fully assembled runtime captures include blueprint, composition, and migration
  receipts; ordinary enemies and world objects carry discoverable act metadata.
- Thirteen stages receive one optional theme-specific composition combining
  existing wind, movers, pendulums, fluids, updrafts, gravity wells, ice,
  low-gravity, rotors, or precision stepping.
- The Brute, Gilded Vault, and Deep Line remain authored-complete rather than
  receiving generic additions, preserving their singular mechanical identity.
- Composition placement respects portal/circuit/boss hardware, never owns
  progression, and can build a raised optional deck when dense tile geometry has
  no safe uninterrupted span.
- Unit and localhost browser tests cover blueprint integrity, catalog parity,
  portal uniqueness, compatibility compilation, all 16 stage receipts, all
  composition recipes, stage stability, softlock validation, and boss regressions.

## Run 12 acceptance criteria

- `bladefall-multiplayer.js` owns a versioned protocol with independent control,
  event, input, and snapshot sequences, stale-packet rejection, reliable-event
  deduplication/acknowledgement, bounded retransmission, and stage epochs.
- The host alone advances shared enemies and publishes 20 Hz snapshots of enemy,
  device, crate, portal, hostile-projectile, hazard, and canonical player state.
- The guest keeps frame-local control of its own knight, sends a 30 Hz input/state
  stream, and reconciles softly or snaps only when host validation finds material
  divergence.
- Remote knights render from a delayed interpolation buffer with bounded
  extrapolation rather than chasing the most recently received coordinate.
- Guest combat, lever use, and portal placement are reliable intents; the host
  validates damage, owns deaths and canonical drops, and republishes shared state.
- Portal travel remains unanimous and runs as a prepared/load/resume transaction.
  Advancing changes the protocol epoch, so delayed packets from the prior stage
  cannot mutate the new one.
- A temporary connection loss preserves the room, player, stage, and resume token
  while the guest retries the same host. A successful handshake restores the
  authoritative stage and latest world snapshot.
- Protocol diagnostics are available from `window.__BF.multiplayerState()` and
  the new asset ships in the service-worker bundle.
- Unit and localhost browser tests cover sequencing, reliable deduplication,
  epochs, interpolation, reconciliation, movement validation, unanimous
  transitions, a linked host/guest exchange, all 16 stage startups, campaign
  seed/tier matrices, and portal-boss regressions.

## Run 13 acceptance criteria

- `bladefall-audio.js` owns semantic cue categories, bounded spatial pan,
  material-specific impact profiles, combat ducking, threat intensity, night
  compression, captions, and stable diagnostics without owning combat truth.
- The existing score responds smoothly to nearby pressure, bosses, player
  health, combo state, pause state, music volume, and important cue ducking.
- Stone, ice, brittle, and slate touchdowns resolve through the shared
  environment material identity and produce distinct gain and pitch profiles.
- `bladefall-camera.js` owns deterministic look-ahead, vertical tracking,
  shared co-op framing, nearby-boss composition, stage bounds, reduced-motion
  behavior, and tunable deterministic shake.
- Damage direction, directional sound captions, elemental projectile labels,
  reduced particles, reduced flashes, visible keyboard focus, larger text,
  high-contrast UI, haptics, and auto attack remain optional presentation or
  input aids and never alter encounter authority.
- Music, effects, dynamic score, night audio, captions, camera assist, screen
  shake, motion, flash, contrast, text, color, haptic, combat-cue, and
  auto-attack preferences persist through the existing save key.
- Audio, camera, and presentation diagnostics are available through
  `window.__BF`, and both new modules ship in the offline and local deploy
  bundles.
- Unit and localhost browser tests cover adaptive mix, cue compression,
  surface profiles, spatial pan, captions, player/co-op/boss framing, vertical
  tracking, bounds, deterministic shake, reduced motion, settings persistence,
  gameplay movement, and all 16 stage startups.

## Run 14 acceptance criteria

- Existing `bladefall_v2` saves migrate through an explicit versioned schema
  without changing the storage key, discarding unknown future fields, losing
  valid run snapshots, resetting unlocks, or touching permanent leaderboards.
- Corrupt scalar preferences and progression bounds are repaired conservatively,
  with a visible migration receipt and current schema version in diagnostics.
- Runtime device classification selects an initial high, balanced, or low
  renderer profile from viewport load, pointer type, memory, and processor
  information; players retain a persistent Auto/High/Balanced/Low override.
- A bounded release monitor evaluates combined update/render averages and p95,
  memory pressure, runtime errors, and storage failures without changing
  simulation behavior.
- Static balance validation covers all campaign stages, enemy health/damage,
  boss count, stage identity/length, and monotonic rarity progression.
- `window.__BF.releaseState()` combines version, device, migration, balance,
  performance, runtime-error, and storage health into one release-readiness
  report.
- The reproducible release checker verifies source assets, page references,
  service-worker coverage, manifest requirements, size budgets, forbidden local
  URLs, and byte-identical local deploy output.
- Unit and localhost browser tests cover save corruption and preservation,
  leaderboard permanence, desktop/phone/tablet layouts, keyboard/touch input,
  graphics overrides, performance stress, 144 seed/tier/stage builds, every
  boss, two-client stage barriers, reconnect, artifact integrity, and offline
  startup.
