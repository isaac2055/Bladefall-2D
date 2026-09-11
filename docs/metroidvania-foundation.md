# Bladefall Metroidvania Foundation

This document is the human-readable companion to the executable constitution in
`public/bladefall-progression.js`. The executable contract is authoritative when
the prose and runtime disagree.

## Product boundary

Foundation acceptance is single-player only. Existing cooperative code is kept
intact but is not allowed to constrain world, progression, encounter, or save
decisions during this program. Cooperative adaptation happens after the
single-player game is satisfying.

The existing playable campaign remains a temporary linear compatibility adapter.
Its routes are not evidence that the new interconnected topology is implemented.
N02 through N04 replace that adapter with physical, bidirectional zone travel and
persistent revisit state.

## N02 streaming and seam contract

`public/bladefall-zones.js` gives every world connection two reciprocal authored
entrances. Each entrance owns a boundary trigger, a distinct safe-arrival region,
an inward facing direction, a target preload region, camera-settle data, and a
short retrigger lock. A transition may commit only after the target arrival is
ready; failed loads retain and restore the source zone.

The contract supports walking roads and tunnels, climbs, doors, companion-opened
conduits, a committed plunge, and the Deep Line rail. None is a transition portal.
Every crossing uses the same seam for its return, and no return consumes a tool or
key. The White Court aqueduct is the only initially one-sided seam: opening it
from White Court permanently makes it bidirectional. Geometry is currently an
explicit long-form shell; dedicated level runs replace shells with reviewed
authored geometry without changing connector identity or save state.

## N03 live transition controller

`public/bladefall-streaming.js` executes seams as a guarded state machine:
idle → preloading → armed → committing → settling → idle. Target content may be
warmed without changing the active zone. Commit captures the source player,
position, camera, and mode; swaps the zone only after a ready receipt; places the
player at the reciprocal safe arrival; and retains the snapshot until camera
settlement completes. Cancellation invalidates stale asynchronous loads. Any
exception after source capture invokes rollback rather than leaving the player
in a partly loaded zone.

The browser runtime uses this controller and has an executable two-way
Outskirts/Black Woods crossing. Until dedicated geometry exists, it maps authored
seam coordinates onto the legacy level length and labels the receipt
`compatibility: true`; this mapping is deliberately not counted as finished level
geometry. N04 replaces disposable entity state with persistent zone snapshots.

## N04 persistent revisits

`public/bladefall-zone-state.js` stores semantic deltas under stable zone/entity
identities. Static platforms and scenery never enter the save. Permanent pickups,
bosses, opened mechanisms, circuits, shortcuts, secrets, encounter outcomes, NPC
state, and cell discovery survive unloading and a full browser reload. Ordinary
enemy defeats use a separate `rest-reset` policy so N05 can repopulate them only
at an intentional rest rather than whenever the player crosses a seam.

Freshly assembled zones register deterministic manifests, hydrate saved removals
and patches, and capture changes before any load replaces their objects. Capture
is idempotent: revisiting without changing anything does not inflate save data or
revision history. Streaming rollback restores the source zone-state snapshot as
well as the player and camera. Opened world shortcuts feed directly into seam
eligibility, so a shortcut cannot appear open visually while remaining locked in
the travel authority.

## N05 recovery, rest, travel, and map

`public/bladefall-recovery.js` replaces stage-restart death logic with named,
zone-aware recovery points. Entrance arrivals and authored checkpoint banners
become valid respawn locations. Death preserves permanent world changes and
ordinary-enemy defeats, clears only transient combat state, restores the carried
loadout, and returns the player to the latest checkpoint in the current zone.

Every zone has one deliberately positioned refuge; ten are connected
waystations. The runtime maps compatibility refuges onto the nearest existing
wide, non-crumbling support rather than inventing random platforms. Pressing the
interaction key lights and rests at a refuge, heals fully, saves, and resets only
`rest-reset` entities across visited zones. Crossing a seam or using a waystation
does not itself respawn enemies.

Fast travel requires both stations to have been physically found and lit, the
player to stand at the source station, and the area to be safe. It never unlocks
a destination or clears an encounter. The new map uses constitution coordinates,
discovered stream cells, visited-zone evidence, and physical seams to show current,
explored, frontier, and hidden regions. Undiscovered names and stations remain
hidden rather than leaking the complete route through level-select data.

## World shape

The first road runs Shallow March → Black Woods → Broken Causeway. Black Woods
climbs to Updraft Canyons → Marksman Road → Ruined Keep. A later return to the
left edge of Shallow March descends to The Gaol → Frostfell. A high route from
Broken Causeway reaches White Court and continues through Emberdeep, The Foundry,
The Inversion, Paradox Citadel, and The Drowned Throne. A late Frostfell ↔ White
Court aqueduct becomes a physical shortcut.

After the Abyss King, a seven-socket door opens only when all seven Vault Keys
have also been recovered. It leads to the Gilded Vault, then through a rail tunnel
to the Deep Line. Portals are puzzle tools, never level-transition devices.

## Permanent capability sequence

1. Jump — Shallow March
2. Weapon — Black Woods
3. Dash — Broken Causeway
4. One placed portal with a fixed counterpart — Updraft Canyons
5. Two placed portals — Marksman Road
6. Wall jump — Ruined Keep
7. Guard/counter — The Gaol
8. Double jump — Frostfell
9. Attunement and a second tool slot — White Court
10. Companion command — Emberdeep
11. Downward strike — The Foundry
12. Gravity flip — The Inversion

Core traversal abilities are permanent and cannot be unequipped. Weapons, tools,
Echoes, armor, and Crites change combat and optional solutions but cannot be
mandatory consumable gates on the critical path.

## Vault Keys

Seven authored secrets test remembered capabilities: the Outskirts sentinel,
Black Woods root wall, Updraft crosswind vault, Ruined Keep belfry, Frostfell
elemental seam, Emberdeep projectile seal, and Inversion ceiling sanctum. At
least four deliberately require a return visit after the player recognizes an
earlier unreachable landmark.

## Foundation ledger

| Run | Acceptance subject | State |
| --- | --- | --- |
| N01 | World and progression constitution | Complete |
| N02 | Streamable zone schema and physical connector contract | Complete |
| N03 | Bidirectional loading, camera handoff, and preload | Complete |
| N04 | Persistent zone state, revisits, shortcuts, secrets, and entities | Complete |
| N05 | Checkpoints, death, rest, respawn, fast travel, and map | Complete |
| N06 | Permanent capability authority, new game, UI, and migration | Complete |
| N07 | Progressive controller and movement tuning | Complete |
| N08 | Fixed, single, and twin portal progression | Complete |
| N09 | Weaponless play, weapons, upgrades, and Crites | Complete |
| N10 | Armor, tools, salvage, materials, and shops | Complete |
| N11 | Echo capacity, equip flow, semantic hooks, limits, and UI | Complete |
| N12 | Unified world reaction matrix | Complete |
| N13 | Enemy ecology, hazards, drops, and encounter persistence | Complete |
| N14 | Breakable walls, secret grammar, Vault Keys, markers, and rewards | Complete |
| N15 | Ability-aware bosses, quests, completion, and leaderboards | Pending |
| N16 | Vertical slice, diagnostics, performance, accessibility, and migration audit | Pending |

Level 1 authoring is blocked until all sixteen foundation gates pass. Each main
level then receives six dedicated passes: survey/charter, geometry/traversal,
encounters/systems, quests/secrets/narrative, boss or climax/rewards, and visual
QA/balance/regression. Gilded Vault and Deep Line receive an additional ending
integration pass.

### N06 runtime acceptance

`public/bladefall-capabilities.js` is the sole permanent-capability authority.
A clean campaign begins with Jump and nothing else; the remaining eleven
memories can only be granted in constitutional order, in their authored zone,
and with explicit acquisition evidence. Save migration infers an older player's
fair capability prefix from visited/cleared world evidence instead of granting
the entire kit or erasing earned traversal. The HUD and Memories screen expose
the acquired set and next destination without revealing later locked abilities.

Beginning a New Dream clears campaign-local world, zone, recovery, capability,
equipment, material, Echo, narrative, quest, shop, currency, and secret state while preserving settings,
leaderboards, achievements, lifetime records, and earned cosmetic skins. N07
connects the movement controller to this authority; N09 completes genuinely
weaponless opening play, so compatibility combat remains isolated until those
dedicated gates land.

### N07 runtime acceptance

`public/bladefall-movement-progression.js` is the executable bridge between
permanent memories and locomotion. A new knight has one buffered, coyote-assisted
jump: no dash, wall jump/slide, second jump, downward strike, or gravity flip can
leak from player defaults, run snapshots, point-buy perks, level-up rolls, death
restores, crystals, or stale active timers. Each verb becomes live only when its
N06 memory is present. The first and second jumps use separately tuned impulses,
while dash, wall movement, downward strike, and gravity flip share one validated
tuning table instead of scattered magic numbers.

Keyboard attempts at a missing contextual verb receive restrained, throttled
world-space feedback; touch controls and HUD status remain absent until their
memory exists. Air crystals refill only the movement resources the player has
actually acquired. Runtime diagnostics count accepted and blocked movement uses
so future authored-room probes can prove that geometry requires its stated verb.

### N08 runtime acceptance

`public/bladefall-portal-progression.js` separates the portal language into three
authored steps. A zero-placement fixed pair works only when both mouths explicitly
declare the fixed-link lesson. The first portal memory permits one blue mouth only
inside the local envelope of a live fixed counterpart; moving that mouth replaces
it atomically. The second portal memory permits a free blue/orange pair, while an
authored anchor can still deliberately constrain a later puzzle to one mouth.

Generic or legacy level mouths do not silently become links. Personal, anchored,
and fixed pairs are classified before they reach player, crate, traveler, enemy,
projectile, AI-perception, airflow, or fluid transit. Stale player mouths are
removed at capability and stage boundaries. HUD and touch controls distinguish a
walk-through fixed link, a dormant anchor, a one-mouth/fixed-counterpart puzzle,
and full pair ownership. Placement, replacement, clearing, rejection, and transit
diagnostics provide direct evidence for each authored portal lesson.

### N09 runtime acceptance

`public/bladefall-weapon-progression.js` makes weaponlessness a real player state,
not a disguised fists loadout. A fresh campaign holds no weapon, cannot buffer or
perform an attack, renders empty-handed, labels the HUD `UNARMED · EVADE`, and
hides the touch attack control. Save restoration, stage loading, death recovery,
and malformed legacy state no longer manufacture a Rusty Sword or fists fallback.
Diagnostic warps and standalone challenge modes retain an isolated compatibility
blade and are not accepted as proof of campaign progression.

The first combat memory is the one authored `Recovered Oathblade` in the inhabited,
enemy-free opening refuge of Black Woods. Touching it atomically grants the Weapon
memory, equips the blade, unlocks later weapon pickups, updates the checkpoint
loadout, and persists the run. A migrated player who owns the memory but lacks a
valid weapon can recover the same blade without receiving the memory twice.
Generic weapon finds and shop stock cannot bypass the acquisition contract.

Primary weapons are bound: durability/ammunition metadata remains readable for
legacy migration, but ordinary attacks cannot consume the weapon into an unarmed
softlock. The Forge now offers three deterministic Temper tiers; damage and
sharpening survive same-archetype rarity ascension and persist immediately.
Combat-only level-up choices remain absent before the Weapon memory.

“Crites” are formalized as critical techniques. All eighteen playable archetypes
have a unique technique id, unique rendered silhouette, multiplier, status verb,
combat role, and environment-facing interaction tags. Normal, charged, and
critical attacks emit semantic receipts for the later N12 reaction matrix, while
runtime diagnostics distinguish blocked inputs, acquisition, equips, upgrades,
and criticals.

### N10 runtime acceptance

`public/bladefall-equipment-economy.js` owns equipment and field-tool state as a
versioned campaign document. Four deliberately legible resources replace a
second pile of anonymous gold: Memory Iron, Pale Weave, Dream Prism, and rare
Datura Essence. Salvaging an unwanted ground weapon or armor piece yields a
deterministic bundle based on rarity, equipment family, and elemental content;
the decision consumes only that find and persists immediately. Invalid save
values, unknown tools, impossible charges, and negative materials are filtered
without inventing inventory.

Armor now has three bounded Reinforce tiers in addition to rarity. Reinforcement
increases the piece's base defense through one formula, costs both gold and
authored materials, survives same-slot rarity ascension, and is visible in the
Forge before payment. Resource spending is atomic: a missing material or coin
prevents every part of the transaction. Existing affixes remain intact until a
deliberate rarity reforge, preserving the useful armor system already present.

Five distinct field tools enter through the five regional shops: Assessor Lens,
Retrieval Coil, Rime Ampoule, Cinder Capsule, and Grounding Spike. Each is a
one-time persistent acquisition with one semantic action, explicit world-facing
tags, a finite charge count, and one active-tool slot. The Tool Kit exposes
materials, ownership, charges, descriptions, and equip state; the rebindable Tool
input uses the equipped instrument, updates the HUD, emits a semantic `tool:use`
receipt, saves immediately, and never substitutes for a critical-path ability.
Resting refills owned tools. The existing world already responds with survey,
safe retrieval, and elemental pulse primitives; N12 owns the unified reaction
matrix that will make those same receipts interact consistently with every
authored enemy and environment.

Regional shops still begin in Black Woods rather than the opening tutorial.
Their fixed stock is deterministic and persistent, now pairing one local tool
with weapons, armor, and restorative services. The catalog, save schema,
deployment manifest, live debug state, diagnostics, and migration path all share
the same N10 authority.

### N11 runtime acceptance

`public/bladefall-echoes.js` gives gameplay Echoes one unambiguous meaning: they
are persistent, optional, charm-like memories recovered from seven bosses and
five multi-stage quests. Narrative “boss echoes” remain story evidence and the
Abyss King’s temporal echo remains an encounter mechanic; neither is silently
treated as equipped gear. The previous random golden level-up flags have been
removed. Level-ups now remain transparent run statistics, while build-defining
effects come from authored world accomplishments.

A fresh knight owns no Echo and has two capacity. Each Echo costs one to three
capacity, no more than four forms may be equipped, and six named boss milestones
expand the weighted budget to a hard maximum of eight. A newly recovered Echo
auto-equips only when it honestly fits. Further loadout changes require the
player to stand beside a refuge; away from one the Echo Loom is deliberately
read-only. The HUD, pause menu, Loom, save document, migration receipt, and debug
state all report the same owned/equipped/capacity truth.

The twelve Echoes cover movement, melee, ranged combat, Crites, portals, tools,
air reactions, travelers, damage, and enemy deaths. Each exposes typed semantic
hooks with an explicit operation and optional qualifier. Runtime receipts are
emitted for attacks, criticals, hits, slams, dashes, hurt, kills, tool use, and
personal portal transit. Existing proven effects—fire trails, piercing shots,
kill haste, corpse bursts, contact reflection, expanded slam, and execution—are
now projections of the equipped Echo loadout rather than independent booleans.
Additional tool duration, retrieval, stat, and portal-afterimage effects consume
the same hook model. N12 will route these receipts through one world-reaction
matrix instead of adding another set of one-off checks.

Legacy saves carrying the old random synergy flags recover the corresponding
Echoes as owned items, auto-equipping only the prefix that fits base capacity.
Unknown or corrupt ids cannot enter the loadout, capacity knots are bounded and
deduplicated, duplicate rewards are idempotent, and unequipping immediately
removes the runtime projection without erasing the recovered Echo.

### N12 runtime acceptance

`public/bladefall-reactions.js` is the versioned authority for elemental and
physical world combinations. It accepts a typed signal (element, delivery,
owner, power, and tags) and a typed target (enemy, air, fluid, surface,
destructible, mechanism, or projectile), then returns either one immutable
reaction receipt or an explicit blocked reason. Unknown pairs never acquire an
invented fallback, immune targets stay inert, and stateful reactions refresh
idempotently before expiring on a bounded clock.

The matrix preserves the established enemy weakness/resistance values and all
seven elemental combat identities while moving their status operations into
receipts. Weapon strikes, projectiles, physical AoEs, tools, and Echo-generated
damage share that path. Air-channel priming now derives its fire, frost, and
storm definitions from the same authority. Water, lava, sludge, and void fluids
can be steamed, frozen, conducted, cooled, ignited, or suppressed through
explicit pairs; portal jets transport the source fluid's reaction state rather
than creating a second state. Brittle slam destruction is the first live
surface consumer, while the surface, destructible, and mechanism contracts are
ready for the authored secrets and circuits in N14 and later level passes.

Boss-only spell siphons, forge coolant capture, and paradox-orb rules remain
encounter logic by design. The matrix supplies ordinary world causality without
flattening unique puzzle permissions. Runtime diagnostics expose attempts,
resolved and blocked counts, reaction and target families, blocked reasons, and
the last semantic receipt through `window.__BF.reactionState()`.

N12 closes on version `7.45.0` with cache `bladefall-v99`: 298 unit and
structural tests pass, the 51-asset deploy mirror passes release parity, and the
localhost deploy validator proves enemy weakness, boss duration scaling,
expiring fluid state, air priming, an explicit rejected pair, and a real Cinder
Capsule hit flowing through the tool-to-enemy reaction path. Weapon, equipment,
and Echo browser validators also remain green.

### N13 runtime acceptance

`public/bladefall-ecology.js` owns the ecological contract for all fourteen
ordinary species and the seven boss families. Each ordinary species has one
combat role, locomotion family, bounded encounter pressure, meaningful habitat
tags, rest-reset persistence, and a material identity. The runtime normalizes
both generated enemies and legacy hand-authored encounter enemies after stage
assembly, so authored set pieces retain their placement while sharing one
ecology and lifecycle vocabulary.

Hazards now read one policy instead of embedding unrelated constants. Spikes
and harmful fluids can soften an ordinary enemy only to 25% health; a pit
recovers it to its last grounded position at no less than that floor; bosses
cannot be solved by geometry. Enemies remain free to leave ledges, ride wind and
updrafts, traverse an armed player portal pair, and pursue the knight—the pit
recovery applies only after they genuinely leave the world shell.

Ordinary kills now have two independent, bounded reward channels. The existing
gear roll retains its stage curve and elite guarantee, while a smaller
species-owned craft yield feeds iron, weave, prism, or essence directly into the
N10 forge economy. A dedicated `ecology` random stream prevents the new material
roll from perturbing established loot sequences. Ordinary defeated enemies are
captured as rest-reset zone deltas; unique enemies and bosses are permanent.
Death, traversal, and fast travel preserve current encounter truth, while a
deliberate refuge rest clears only the rest-reset deltas.

Encounter-budget reports expose role mixtures and flag pressure above an
authored room's cap without automatically changing its composition. Runtime
diagnostics report spawns, kills, species, material yields, hazard contacts, pit
recoveries, and the current encounter budget through
`window.__BF.ecologyState()`.

N13 closes on version `7.46.0` with cache `bladefall-v100`: 305 unit and
structural tests pass, the 52-asset deploy mirror passes release parity, and the
localhost deploy validator proves complete species metadata on an assembled
level, an elite Cinder Capsule kill producing its species material, and a live
ground enemy recovering from a simulated world-shell fall. The N12 combat and
reaction validator remains green against the same packaged build.

### N14 runtime acceptance

`public/bladefall-secrets.js` owns seven persistent Vault Key identities and
seven distinct solution verbs: sentinel combat, dash impact, crosswind portal
work, wall ascent, elemental thaw, returned projectile, and gravity sanctum.
Every recovery requires the exact authored zone, all named permanent
capabilities, the correct verb, and explicit world evidence. Recovery is
idempotent and cannot consume a capability, tool, Echo, or key.

Secret markers progress from unknown to sighted to recovered without leaking an
undiscovered key name. The Assessor Lens now marks obstacle secrets as well as
pickups, stores a restrained landmark cue, renders a timed world ring, and
persists the sighting. Authored `vaultKeyId` obstacles can consume dash impacts,
elemental thaw shots, or returned projectiles through the shared secret-object
adapter; later level passes provide their final geometry and visual disguise.

The old stage-local chest key remains a chest key. Vault Keys live in their own
save schema, appear as `◆ n/7`, survive death, rest, backtracking, and full
application reload, and reset only with a New Dream. Seven corresponding legacy
stage coins migrate one-for-one so an established player keeps fair evidence;
unrelated coins grant nothing. Coins remain optional completion collectibles.

Both gate paths now read the same key set: the physical `king-vault` seam carries
Vault Keys in its traversal state, and the Drowned Throne door uses the secret
authority directly. Each reports the Abyss King requirement separately from the
missing sockets. The former “all coins” door condition has been removed.

N14 closes on version `7.47.0`, save schema 13, and cache
`bladefall-v101`: 313 unit and structural tests pass, the 53-asset deploy mirror
passes release parity, and the packaged localhost validator proves a Lens
sighting, live dash-wall break, persistent Root Key and HUD update, fair legacy
migration, seven-key traversal state, and post-King Vault eligibility.

### N15 runtime acceptance

`public/bladefall-milestones.js` is the single-player authority for bosses,
completion receipts, and permanent leaderboard records. All seven existing boss
encounters now carry explicit required-capability, authored-solution, phase, and
retry contracts. These contracts describe and diagnose the mechanics already in
the fights; they do not replace them with generic damage gates. A live boss
instance exposes both its contract and any missing permanent abilities.

Every quest now declares a permanent-progression prerequisite. Discovery events
that occur early are retained in quest history and reconcile once the required
ability is owned, so gating never destroys legitimate evidence. Active quests
remain ordered and persistent across backtracking.

Run completion is now keyed by world-zone identity instead of old linear stage
slots. Each receipt separately counts defeated authored enemies, the zone coin,
and helped travelers. A return visit may improve a result but cannot overwrite a
better receipt; if a future level pass expands the objective denominator, the
larger manifest replaces the obsolete one. This makes backtracking compatible
with honest 100% scoring.

Solo Base, NG+1, NG+2, and Boss Rush archives are sanitized without truncation,
remain stored under the reset-exempt leaderboard key, and share deterministic
time-first and completion-first ranking rules. Level-select, Test Mode,
previously submitted, and co-op runs cannot enter these solo boards. Legacy
co-op records are preserved while multiplayer remains outside foundation scope.

N15 closes on version `7.48.0`, save schema 13, and cache
`bladefall-v102`. Unit, structural, packaged parity, and live-browser receipts
cover all seven boss contracts, a capability-gated quest, an improving revisit,
four distinct solo boards, and a runtime Hollow Marksman contract.

### N16 final foundation acceptance

`public/bladefall-foundation-audit.js` turns the foundation into an executable
release gate. It requires sixteen named authorities, the first five zones as an
opening vertical slice, bounded update/render telemetry, live accessibility
semantics, and a hostile old-save migration receipt. Missing evidence is a
failure rather than an implied success.

The packaged browser audit loads Outskirts, Black Woods, Brute, Updrafts, and
Hollow Marksman. Every charter and geometry audit passes with 100% semantic
ownership coverage; each shell is longer than 5,000 world units and contains at
least 53 authored obstacles. The Brute and Marksman expose their existing
ability-aware solution contracts at runtime.

The performance gate retains exactly the bounded 180-sample telemetry window.
On the packaged headless acceptance run, update p95 was 1.4 ms and render p95
was 1.2 ms against a 16.67 ms target, with no warning or hard-budget breach.
These numbers are regression evidence for this environment, not a claim about
every device.

The accessibility gate proves a labeled gameplay canvas and pause control,
twelve live settings, eleven remappable controls, and immediate body-state
application for reduced motion, high contrast, and larger text. The migration
gate starts from deliberately corrupt schema-0 data and proves schema 13,
bounded presentation settings, repaired world/capability/secret/quest states,
and zero storage failures.

N16 closes the complete N01–N16 foundation ledger on version `7.49.0`, save
schema 13, cache `bladefall-v103`, and a 55-asset offline deploy. The full test
suite, source audit, packaged audit, and source/deploy byte-parity check are the
required handoff before Level 1’s dedicated authoring runs begin.

## Reuse boundary

Keep proven low-level runtime, rendering, camera, input, portal physics,
environment simulation, enemy primitives, migration, and accessibility work.
Adapt campaign loading, map, checkpoints, quests, shops, Echoes, Crites, bosses,
and completion metrics. Replace linear unlock authority, completion-portal
travel, all-abilities-at-spawn, disposable level state, and random environment
placement masquerading as authored level design.
