# Systems and architecture

## Runtime shape

Bladefall is a static browser game. `public/index.html` is still the main
composition root and contains substantial gameplay, stage assembly, DOM, draw,
and compatibility code. Forty-plus `public/bladefall-*.js` files provide
versioned authorities and reusable system boundaries. They load in explicit
order before `littlejs.min.js`; changing that order can break dependencies.

The architecture rule is: **simulation owns truth; presentation reads it.**
Diagnostics and authoring tools may observe or probe gameplay but must not become
the only way a player can complete a route.

## Main authorities

| Concern | Authoritative files |
| --- | --- |
| Composition, level geometry, compatibility runtime, UI | `public/index.html` |
| Core utilities/events/metrics | `bladefall-core.js` |
| Fixed simulation and seeded streams | `bladefall-simulation.js` |
| Rendering/quality/animation | `bladefall-renderer.js`, `bladefall-camera.js` |
| Movement/collision | `bladefall-platformer.js`, `bladefall-movement-progression.js` |
| Fields/mechanisms/physics | `bladefall-environment.js`, `bladefall-fluids.js` |
| Portal transport/progression | `bladefall-portals.js`, `bladefall-portal-progression.js` |
| Enemy navigation/abilities/ecology | `bladefall-ai.js`, `bladefall-ecology.js` |
| Elemental/system reactions | `bladefall-reactions.js`, `bladefall-interactions.js` |
| Campaign/world topology | `bladefall-campaign.js`, `bladefall-progression.js`, `bladefall-world.js`, `bladefall-zones.js` |
| Persistent zone state/streaming | `bladefall-zone-state.js`, `bladefall-streaming.js` |
| Capabilities and combat progression | `bladefall-capabilities.js`, `bladefall-weapon-progression.js` |
| Blood/equipment/builds | `bladefall-blood.js`, `bladefall-inventory.js`, `bladefall-equipment-economy.js`, `bladefall-echoes.js`, `bladefall-gifts.js`, `bladefall-advancement.js` |
| Shops/quests/secrets/recollections | `bladefall-shops.js`, `bladefall-quests.js`, `bladefall-secrets.js`, `bladefall-recollections.js` |
| Recovery/completion/leaderboards | `bladefall-recovery.js`, `bladefall-milestones.js` |
| Narrative/dialogue/endings | `bladefall-story.js`, `bladefall-dialogue.js`, `bladefall-cinematics.js` |
| Save/input/presentation/audio | `bladefall-storage.js`, `bladefall-input.js`, `bladefall-presentation.js`, `bladefall-audio.js` |
| Co-op | `bladefall-multiplayer.js` plus network/runtime integration in `index.html` |
| Authoring/charters/validation | `bladefall-authoring.js`, `bladefall-charters.js`, `bladefall-foundation-audit.js`, `authoring.html` |
| Release health | `bladefall-release.js`, `build-deploy.sh`, `scripts/release-check.mjs` |

## Saves and persistence

The browser save root is `bladefall_v2`; leaderboards are deliberately
reset-exempt. System modules normalize and migrate their own versioned documents.
World visited/cleared nodes, capability prefix, zone deltas, checkpoints,
equipment, materials, Echoes, Gifts, advancement, quests, shops, story clues,
secrets, Recollections, and completion receipts must survive appropriate death,
rest, traversal, reload, and New Dream boundaries.

Never casually rename storage keys or write raw unbounded values into saves.
Use the existing normalization/migration patterns and run migration tests.

## World and capability authority

`bladefall-progression.js` is the constitutional source for sixteen zones,
twelve permanent abilities, physical connectors, seven Vault Keys, target level
lengths, and intended itinerary. `bladefall-world.js` owns visited/cleared/map
truth. `bladefall-zones.js` describes reciprocal safe arrivals.
`bladefall-streaming.js` performs guarded preload/commit/settle transitions.

The authored opening through Frostfell uses explicit physical seams and local
passages in `index.html`; later stages still mix compatibility paths and need
their dedicated passes. The folded Warden/Frostfell mine requires an Up request
at both ends, consumed before streaming; boundary movement alone cannot cross. Fast travel
may revisit discovered anchors only; it must not reveal or skip a frontier.

## Movement and collision

The precision controller supports buffered/coyote jump, variable jump, Dash,
Wall Jump, Double Jump, Downward Strike, gravity inversion, ice/material drag,
moving-platform carry, slopes, and high-speed swept wall collision. Missing
abilities are stripped from runtime snapshots and should not leak from Test Mode
or Level Select. Level Select hydrates only the constitutional prefix earned
before a stage, then grants that stage's reward locally when tested.

Recent lesson: static gap arithmetic is not enough. Platform undersides, player
height, wall thickness, approach direction, air control, and service-worker cache
can make a visually plausible route impossible. Add input-driven probes for any
critical traversal.

## Portal contract

All actors, crates, travelers, ordinary enemies, projectiles, airflow, fluids,
and AI perception use the shared mouth/pair/frame transport model. Policies such
as one-way exits, payload filters, speed gates, boss weak points, reflection
ownership, portal hops, cooldowns, fixed links, linked anchors, and hijacks layer
on that transport result.

Progression modes are separate:

- fixed authored pair, when explicitly declared;
- one player mouth plus one authored counterpart (`portal-single`);
- independent player pair (`portal-pair`).

Stale mouths must be sanitized on capability/stage/checkpoint boundaries.

## Blood, equipment, and rewards

Blood uses whole measures. Armor banks whole-wound Ward rather than displaying a
fractional lifesteal economy. The bag contains deliberate named finds; the first
Oathblade auto-equips. The campaign build language is one Gift plus a bounded
weighted Echo loadout at refuges. Forge Seals, Blood fragments, armor reinforce,
weapon Temper, field tools, and materials exist, but authored levels 1–5 suppress
random gear/material carpet. Later level passes must decide which older drops to
retire or spatially author.

Costumes/appearances are cosmetic ownership. Gifts contain mechanics and may be
paired with any appearance. Do not move combat power back onto a skin.

## Enemies and environment

Ordinary enemies share perception, platform navigation, commitment lifecycles,
portal routes, environment sampling, and encounter-pressure budgets. Authored
roles can specialize without abandoning those shared contracts. Hazards can
soften an ordinary enemy only to the ecology floor; lethal pits recover it to a
grounded point. Bosses cannot be solved by ambient hazards.

Air, updraft, low gravity, directional wind, gravity wells, movers, rotors,
pendulums, ropes, ice, brittle surfaces, fluids, and portal-emitted fields share
deterministic samplers. Elements resolve through the reaction matrix rather than
one-off per-level checks. Fluids require bounded columns and authored containment.

## Shops, quests, map, and NPCs

The map uses persistent visited/frontier/hidden state. Quest arcs are ordered and
cross regions: A Road Without a Name, Kindling the Sky, The Courier's Proof, and
Inventory of Effects. Existing objectives include helping a named traveler,
reading physical evidence, igniting airflow, returning a projectile, and
revisiting people/shops. A local level pass may improve staging/dialogue but
should not create a second quest authority.

Regional shops begin at Ethereal Goods in Black Woods and are planned/partly
implemented for Ruined Keep, Frostfell, Emberdeep, and Inversion. Fixed stock,
one-time ownership, repeatable services, and ordinary gold are preferable to
another currency.

## Recollections

`bladefall-recollections.js` tracks one sealed discovery per stage.
`recollection-player.html` launches isolated preserved challenges only after the
Waking Key. Those sessions must not mutate campaign storage or leaderboards.
The current archive authority is implemented; later stages still need their
authored discovery placement and darker challenge redesign.

## Co-op status

The codebase contains host authority, snapshots, event channels, shared enemies,
personal loot, traveler state, transition votes, reconnect handling, and peer
support through `peerjs.min.js`. Earlier bugs included invisible partner weapons,
unsynchronized shots/enemy death, stale loadouts, unilateral level changes, and
unstable join-later state; several were improved and tests exist.

Nevertheless, co-op is not current single-player acceptance. After all Base
levels are complete, run genuine two-device sessions for every world seam,
mechanism, boss, loot drop, death/revive, traveler, shop boundary, and ending.

## Authoring and diagnostics

`authoring.html` and `bladefall-authoring.js` support a versioned level schema,
capture/import/export, transactions, diagnostics, geometry ownership, circuits,
softlock analysis, and encounter composition. `dialogue-editor.html` exposes the
central text registry. `window.__BF` exposes runtime diagnostics used by scripts.

Charters use a P/G/C/V or expanded P/G/S/E/V discipline:

- Planning/live visual survey;
- Geography and traversal;
- Society/story;
- Encounters/systemic synthesis;
- Validation/restraint.

Do not auto-place content just because the authoring engine permits it. The
player must see support, containment, occupation, and purpose.

## Audio and deployment

Audio files in `public/audio/` and legacy `public/music.mp3` are runtime assets.
`public/audio/ATTRIBUTION.md` records their sources. Music selection lives in
`index.html`/`bladefall-audio.js`; boss transitions must not let checkpoints
replace the intended exploration track.

`public/sw.js` caches the offline asset list. `build-deploy.sh` copies the
canonical runtime into `netlify-deploy/`; `release-check.mjs` verifies required
files, script references, service-worker cache membership, manifest validity,
size budgets, and byte parity. Do not hand-edit the mirror.


## TAS and branching state

The opt-in `?tas=1` API is `window.__BF.tas`: existing `run`, `digest`, `actions`
plus `resetGame`, `stepFrames`, `getPlayerState`, `saveState`, `restoreState`.
Injected inputs replace live reads during manual steps; automatic gameplay and
rendering are gated off. Fixed seed, RNG/time shims and subsystem snapshot hooks
support exact single-level branching. The snapshot is not a browser/DOM/audio
checkpoint and does not support arbitrary async cross-zone work.
[TESTING.md](../TESTING.md) is the API and movement-test authority.

`scripts/frostfell-route.mjs` contains bespoke route/setup and finale branching;
`scripts/frostfell-muster-checks.mjs` covers the engine and normal-play mine/music.
The general geometry-derived bot is separate: `scripts/bladefall-bot.mjs`
(`npm run bot`, driver `scripts/run-bot.mjs`) builds a ledge graph from live
platform geometry, searches macro-actions with `saveState`/`restoreState`, drives
door and switch detours, and writes `docs/bot/receipt.json`. It completes the first
three levels; see `TESTING.md`.

## Frostfell persistence and presentation

`FROSTFELL_LEVEL`, `frostfellFinale`, `interactFrostfell`,
`FROST_MUSTER_ROSTER` and the world-wide `MUSTER_ROSTERS` / `musterRecalled()` /
`installMusterRoster()` are in the composition root; `activateZonePersistence`
installs a region's recall roster once `frost-muster` is open, before hydration,
with stable `zoneEntityId`s and no health inflation. Three recall archetypes
(shieldbearer, linesman, signaler) share the ordinary AI; the signaler's call
wakes nearby foes and breaks when it is struck. `frost-hearths`, individual
brazier circuits, `frost-thermal` and `frost-muster` latch in existing zone state.
Nim's Seal uses the valid campaign source `authored:frost-hearths`.
`frost-service` opens the original return; `frost-summit-service` adds the third
stop after summit use. This is not generic map fast travel.

The six-second `G.frostMusterSequence` holds gameplay, advances scene time and
commits the permanent event at the bell strike. On load, the stable reinforcement
roster is installed before zone hydration. Existing entities retain IDs and
health/death state; max-health multiplication applies once. Resetting caches or
rebuilding a manifest must not duplicate foes or erase solved progress.
The three authored enemy types use shared AI/ecology; the two-Blood hulk passes
an explicit damage override. `bladefall-audio.js` owns the bell cue. The changed
music/atmosphere restore from the circuit without replaying the cinematic.
