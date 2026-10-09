# Survive entities and interactions

Survive needs more ways for entities to change a player’s movement and the next decision. It does not need a one-for-one copy of Celeste’s object list. The best additions are a few missing physical behaviors—loaded recoil, movable launch objects and controllable moving supports—combined with Bladefall’s weapon, enemies, portals, cargo and hook.

A large part of the reference vocabulary already exists in some form. The immediate opportunity is therefore split between extending existing entities, making their interactions consistent, and adding genuinely different families. A moving hazard becomes interesting when the player must manipulate a trajectory, target or resource around it; simply waiting for its path to clear has already proved too easy for your intended audience.

This report covers the local 7.289 runtime on 7 October 2026. It implements and banks nothing. The companion [movement tech report](</Users/computer/Projects/Bladefall-2D Antigravity/docs/design/SURVIVE-TECH-REPORT.md>) explains the movement rules these proposals should share.

## What to develop first

My ranked shortlist is below. First prototype the existing interaction chains; then select one missing interaction or entity family. The list is a set of development options, not a proposal to build all six together:

1. **Use the existing enemy transformations, projectile routing and momentum transfers more deeply.** There is substantial room for new problem solving without a new entity.
2. **Add a load-and-release platform family.** A player-controlled compression or recoil cycle creates meaningful departure timing and works with cargo, enemies and launch techniques.
3. **Add a movable impulse object.** Unlike a fixed refill or recoil pod, its position and state become something the player prepares, changes and intercepts.
4. **Attach hook anchors to moving machinery.** This extends the active trajectory control that made Shorten the Arc enjoyable.
5. **Expand springs and selected launch contacts through shared motion rules.** Sideways launches and cargo responses offer several combinations for comparatively little new conceptual burden.
6. **Then consider a steerable carrier.** It adds continuous control, but has more collision, input and compatibility cost than the preceding extensions.

Rhythm platforms, more hazard skins and additional gate types rank below these. We already have several versions of those functions, and they will not solve the recent difficulty problem on their own.

## Sources and availability

The supplied [Entities text](</Users/computer/.codex/attachments/4688b14a-7da9-4737-94a1-99a19d998dca/Pasted text.txt>) is the Celeste reference, originally [Celeste Wiki Entities](https://celeste.ink/wiki/Entities). Comparisons are by gameplay function; names, art, exact constants and behavior do not need to match. The supplied [Tech text](</Users/computer/.codex/attachments/cd1f78f0-5050-456c-9c4d-d9d3e55a6663/Pasted text.txt>) informs the interaction opportunities.

There are three different meanings of “we have it”:

- **In the current Survive campaign:** authored into the compiled worlds, such as regional resin platforms, slick surfaces, echo interactions and existing enemy machinery.
- **Available in the loaded precision engine or bank:** implemented and usable for future placement, but not necessarily authored into the current campaign. Void stone, the newer hinge, cargo clasp, sweeper, step relay and directional-refill systems fall into this distinction; the compiled campaign currently contains no V void-stone tiles. The relay companion is also available through bonus content rather than established campaign placement.
- **Proposed:** a new behavior or interaction described here, with no implementation implied.

The page loads these modules through [precision.html](</Users/computer/Projects/Bladefall-2D Antigravity/public/precision.html:76>); the actual campaign data is [bladefall-climb-worlds.js](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-climb-worlds.js:1>). Older Explore/Workshop inventories are not interchangeable with this runtime. The following table describes available functionality, and explicitly identifies major bank-only examples.

## Comparison with the supplied entity list

“Partial” means an analogue exists but omits an important behavior. “Gap” means no equivalent was found in the loaded precision implementations. “Later” is a priority judgment, not a claim that the reference entity has no value.

| Celeste entities | Bladefall equivalent or gap | Recommended direction |
| --- | --- | --- |
| Tiles and Jumpthroughs | Solid tiles and one-way surfaces exist. Survive additionally supports Down + Jump drop-through. | Keep the readable collision vocabulary. Do not copy Celeste’s inability to drop through merely for parity. |
| Spikes | Four directional spike faces exist. | Preserve directional behavior and consistent visual hurtboxes. |
| Spinners, Dust Bunnies, Blades/Stars, Fireballs | Static lethal geometry plus new path sweepers cover the principal functions. Sweepers are available in the bank, not yet campaign placement. | Keep ordinary hazards predictable. Additional skins are presentation, not four new mechanics. |
| Badeline Chasers | Delayed path replay exists through shade/wake systems. | Use the player’s earlier route as a future constraint; do not add a redundant generic pursuer. |
| Moving Platforms and Zip Movers | Automatic decks and rider-triggered fast-out/slow-return zip blocks already carry riders and provide lift velocity. | Explore interception and launch composition before adding another fixed track. |
| Badeline Blocks | Existing platforms cover motion; boss-directed, multi-stage movement is only a partial analogue. | Tie a moving platform to a meaningful encounter event only where that relationship changes routing. |
| Kevin/Crush Blocks | Dash-driven K stones travel until blocked and remain there; another dash can redirect them after they stop. They can travel through portals. No Kevin-style automatic retrace. | Keep persistent placement as a strength; add return behavior only as a distinct, readable variant. Sword-driven impulse would be new. |
| Move Blocks | Carts, K stones and decks cover some movement roles, but not a continuously steerable, contact-awakened carrier that reforms after stalling. | A real candidate for a new family, after shared moving-solid behavior is settled. |
| Swap Blocks | Landing-triggered step relays move grouped supports; dash-switched A/B changes solidity. Neither is exactly a dash-driven translating shuttle. | A dash-triggered shuttle is an extension, not a foundational missing platform. Prioritize only if it creates a new launch relationship. |
| Cassette Blocks | Timed resin groups already alternate solidity; heat slabs cycle solid, lethal and one-way states. | Generalize the existing timed-group system and improve phase cues. Music synchronization is optional; sound must not be the only cue. |
| Clouds and Pink Clouds | Gap in load, compression and timed upward release. A spring or timed zip is not the same behavior. | High priority: a loaded platform offers player-controlled departure timing and launch combinations. |
| Hot and Cold Core Blocks | Heat-state terrain exists, but directional elastic recoil and load-triggered falling are not supplied by it. | Develop directional recoil as part of the loaded-solid family. Do not equate a thermal skin with a shared behavior. |
| Sinking Platforms | Floats follow water height; they do not provide a general weight-sinking/recovering support. | Useful extension for weight, buoyancy and deliberate departure timing. |
| Moon and Starjump Blocks | Ordinary/static supports exist; a general impact-displaced springy solid does not. | Elastic response is useful; decorative bobbing alone is low priority. |
| Crumble Blocks and Bridge | Renewable crumbles, leave-once footholds and fault surfaces already cover commitment and disappearing footing. | Use the differences in trigger and recovery. Do not make another cosmetic crumble family. |
| Falling Blocks and Intro Crusher | Falling carts and encounter machinery supply specific cases, but there is no general activated falling slab that remains a moving support/crusher. | Add a reusable falling solid when the player must ride, divert or exploit the falling mass. |
| Exit Blocks | Leave-once footholds remove support; mould can create support. Automatic solidification behind the player is a different, partial gap. | Lower priority unless it produces a meaningful return-path problem. |
| Breakable Walls and Temple Cracked Blocks | Rams, hostile machinery and returned projectiles can breach selected obstacles. A generic player-dash breakable wall is not the same contract. | Preserve “lure the breaching actor” puzzles. Add directly breakable surfaces selectively, with clear material differences. |
| Dream Blocks | V void stone is a strong implemented analogue: dash transit, refill and exit jump grace. It is currently engine/bonus/bank content, not compiled campaign terrain. | Expand useful exits and interactions before adding another dash-through material. |
| Bumpers and Hot Bumpers | Pressure pods launch opposite an entering dash; blade pods use strike direction. There is no equivalent general touch/radial bumper with the same cooldown behavior. | A radial-contact variant can be useful, but should earn its distinction through approach angle and cargo/enemy interaction. |
| Pufferfish | Gap in a movable object with different top-contact and lower/radial burst behavior. | High priority: combine repositioning, pogo, a telegraphed burst and later interception. |
| Springs | Vertical knight-only spring exists. Side springs and loose cargo responses are missing; actual Survive also removes horizontal spring momentum. | Extend orientation and actor support through explicit profiles. Keep passage-routing springs distinct. |
| Ice Balls and Snowballs | Moving foes and projectiles exist, but ordinary body contact does not provide the reference top-bounce contract. | A blade/pogo-compatible moving target would fit better than making every projectile stompable. |
| Oshiro, Seekers and Badeline Boss | Enemies already aim, charge, guard, relocate, launch attacks and become terrain. There is no identical free-flying seeker/barrier system. | Reuse encounter behaviors and add traversable states. Copying a particular named boss is unnecessary. |
| Green/Red Boosters, Badeline Orbs and Bird | Recoil pods, blade launches and tear ziplines cover some directional transfer. Captured eight-way launch and sustained vector travel are different missing states. | Medium priority. Introduce only if aiming or choosing the exit changes the problem, rather than giving another automatic refill. |
| Feather and Shielded Feather | Frost feather gives an extra air jump, not timed free flight. There is no equivalent freely steered flight state in this precision runtime. | High implementation cost; defer until the current swing, portal and launch vocabulary is fully used. |
| Single and Double Refills | Ordinary and directional refills exist. They return the configured maximum; they do not inherently grant a temporary second dash above a one-dash maximum. | A temporary two-charge crystal is a useful modest extension, with clear charge display and expiry rules. |
| Theo Crystal and Jellyfish | Seed lantern combines throwable weight with slow fall, wind/current response, beam shade, portals and echo transport; clasps add storage in the bank. | Deepen existing cargo transfers. Consider a separate heavy/gliding holdable only when its different physics matter. |
| Seeker Barriers | Portal-shot/grill barriers and actor-specific void passage exist, but no general visible actor-filter volume. | Add only with a real enemy/cargo route to separate. The material must explain what crosses. |
| Dash Switches, Touch Switches and Touch Switch Gates | Tallies, bells, plates, linked Combat receivers and doors already provide much of this vocabulary. | Generalize addressed receivers and accepted interactions instead of proliferating one-off switches. |
| Gray and Gold Temple Gates | Global tally/weight gates and addressed Combat gates exist; proximity-to-cargo is not the default weight-gate behavior. | Prefer a visible socket or local sensor for cargo conditions, so opening rules remain legible. |
| Clutter, Cabinets, Doors and Switches | Phase terrain and gates offer partial state clearing. Typed remote obstacle removal is not a general family. | Useful only when the removal order changes the route or available footing; otherwise it is another lock. |
| Generator and Lightning | A cut root crown already disables scheduled root lashes; beams provide lethal routed light. A reusable linked electrical breaker is only a partial match. | Generalize source-to-hazard dependencies when needed. Do not call every beam a lightning field. |
| Core Switch | Water freeze/thaw, thermal clocks and phase toggles exist; there is no single shared global hot/cold mode for all entities. | A broad mode switch needs several interesting consequences, not just recolored hazards. |
| Conveyor Walls and Ice Walls | Floor belts and low-traction ice exist. Slick surfaces prohibit ordinary grip and wall jumps while allowing wallbounce—stricter than Celeste ice walls. | Add vertical grip conveyors and a separate no-grab/yes-wallkick surface if their movement roles are wanted. |
| Trigger Spikes | Gap in contact-then-departure arming. Existing spent/fault terrain captures commitment but removes support instead of making it lethal. | Later, as a clearly telegraphed commitment variant. |
| Water and Wind | Swimming, connected-pool freezing, currents, tide, floats, wind boxes and breathing reversals already exist. | Deepen material and cargo interactions; this is not a sparse area of the game. |
| Rising and Sandwich Lava/Ice | Tide, molten cycles and timed hazards provide partial analogues. No generic pursuing/reversing lethal-front system. | Later. Pressure should create choices rather than turn every room into a compulsory sprint. |
| Strawberries, seeded/winged/golden variants and Moon Berry | Shards and secrets exist, but the listed no-ground/no-dash/deathless conditions are not equivalent current objectives. | Conditional side objectives can expose mastery without requiring every hard technique on the main route. |
| Hearts, Heart Doors, Keys/Locks, Cassette and Checkpoint Flags | Progression rewards, gates and section retries already serve related roles. Exact Celeste persistence rules are not implied. | Treat as progression/goal design, not missing locomotion. Avoid resetting campaign progress rules casually. |
| Blue Torch, Bonfire, Intro Car, White Block and PICO-8 | Feedback, scenery, secrets or an embedded minigame, rather than a core missing platforming family. | Later presentation/bonus ideas. They do not answer the current execution-depth problem. |
| Binoculars | Scouting utility rather than a movement object. Many precision rooms fit one screen; Survive’s larger continuous spaces can still benefit from previews. | A readable look-ahead tool may be valuable, without importing camera-related exploits. |

Core entities and triggers are defined in [room parsing](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:53>) and [entity updates](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:606>). Important distinctions above come from [resin platforms](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-rbr-f-woods.js:12>), [slick surfaces](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-rbr-f-updrafts.js:1>), [water](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-water.js:1>), [thermal slabs](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-ember.js:1>), [recoil pods](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-gaol.js:1>), [step relays](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-step-relay.js:1>) and [void](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-void.js:1>).

## Bladefall strengths to use before inventing replacements

### An enemy can be a threat and later become terrain

Flipped shells and stunned rams can create solid bodies. A ram can breach selected masonry. Some targets survive a cut, while others disappear after providing a rebound. Combat actors can be launched upward by a nonfatal uppercut and then intercepted with a downward cut. These are already more involved relationships than “enemy blocks the exit.” [Foes](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-foes.js:166>), [Combat damage and launch](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-combat.js:126>).

A strong future sequence could ask the player to launch a living target, take a separate portal route, and pogo it during the aerial intercept. The enemy itself would not pass through the portal: creatures currently lack that capability. The target’s remaining life is a finite movement resource. This is a proposal using existing primitives, not a claim that a complete route has been built.

### A projectile can alter a route while the knight is moving

Aimed parries redirect shots and restore the dash. Returned projectiles can affect receivers, tallies, bells, shells, rams and breakable obstacles. Portals rotate projectile routes and make hostile projectiles friendly on transit. That permits problems where launch timing, parry position and a remote geometry change must line up. [Projectile interactions](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-foes.js:135>), [Combat receivers](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-combat.js:163>), [portal transport](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-portals.js:123>).

That last rule also creates an important shortcut: aiming the original hostile shot directly through a portal can remove the need to parry it. If the intended problem is a parry, the physical layout must make the redirected line necessary. An ordinary tally behind a thin wall is not automatically safe from the blade’s reach either; Combat coil receivers are projectile-only. These checks matter more than adding another decorative switch.

### Weight and shade can travel independently of the player

The lantern can hold weight, block a beam, glide with the knight, pass a portal and be suspended by a clasp. Echo relocates the knight while retaining velocity and carried cargo, while leaving a plate-pressing presence behind. The Thawing Track already uses a cart first as elevated transport and later as lower beam shade. Those changing roles are the model to extend. [Lantern physics](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:675>), [clasp](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-cargo-clasp.js:22>), [echo](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-throne.js:29>), [Thawing Track source](</Users/computer/Projects/Bladefall-2D Antigravity/scripts/room-bank/fractured/18-bank-f18.json>).

Do not assume every light uses the same blocking rule: lanterns shade the beam system, but do not automatically block watch lights. Do not assume every solid enemy presses a plate either. Those distinctions need visible presentation, or an intentional shared rule where appropriate. [Beam blockers](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-beam.js:33>), [watch sight](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-watch.js:24>).

## Proposed additions and extensions

The working names below describe original Bladefall designs. All are proposals; none is a new saved level.

### Load and release platforms

Develop one family of visible elastic supports: a spring-loaded forge plate, tensioned root shelf or counterweighted bell platform. Standing or landing compresses it; unloading or reaching the recoil point launches it back. The useful departure depends on the moving surface’s velocity, not just a timer since the room started.

Start with a vertical support, then consider a side-mounted recoil surface using the same rule. Loose cargo and a surviving Combat actor should be able to load it if their mass category is accepted. A downward blade strike could impart a larger impulse, at the cost of spending the player’s current approach and committing to the rebound. Carrying a lantern changes how the player can jump, dash and attack during the cycle.

**Why it adds depth:** the player chooses compression, takeoff and what remains on the support. A late jump can gain height; an early low departure can meet a different target. A portal can rotate the resulting launch. A later hyper can use the support’s motion once the shared lift policy is settled.

**Limit:** do not make holding jump yield the same maximum launch every time, or standing indefinitely solve every state automatically. Keep a useful ordinary bounce, with additional control earning a different trajectory. Define total mass and impulse limits so cargo does not amplify energy without bound.

### A movable impulse seed

Create a portable or pushable launch object with visibly distinct contact regions and a windup. A controlled top pogo nudges it; a side cut changes its position or primes a burst; a committed hit during its charged state produces a launch away from the seed. Its location at the burst determines the outgoing direction.

This borrows the useful distinction between repositioning and detonating from Celeste’s pufferfish, while tying the preparation to Bladefall’s weapon. Begin with existing targets and player motion; portal transport, beam occlusion and receiver activation should be added only with explicit contracts. A beam might charge it without moving it, making the lantern’s shade a way to delay the charge.

**Why it adds depth:** the player prepares the launch origin, leaves it, then meets it from a chosen side. Moving the seed to the obvious location may remove needed shade or put its burst outside the receiver’s reach. The player and object can take different paths.

**Limit:** a missed cut must not pay a movement reward. A burst needs a clear rearm/consumption rule. Keep ordinary sweepers lethal; this should look like an interactable object, not teach that any moving thorn can be parried.

### Moving hook anchors

Allow an anchor to attach to a deck, sliding stone or other selected moving body. The current hook already supports length adjustment, pumping and velocity-preserving release; adding a moving origin extends that vocabulary considerably. Release should combine swing motion with the anchor’s physical motion, using the shared lift rule.

A first variant could use a ring bolted to a moving beam shield. Shortening the chain preserves clearance while the carrier passes a hazard; paying out reaches a target; releasing at another point uses the carrier’s direction. A later enemy-mounted ring could move according to a telegraphed attack, with a successful parry creating a temporary stable attachment.

**Why it adds depth:** both the trajectory and its origin change. Waiting at minimum length is one useful configuration, but the player must still choose where to extend, recover and release. This follows the successful principle from Shorten the Arc.

**Limit:** moving anchors need collision-aware rope handling, attachment identity through resets, and an explicit decision about portal travel. Do not let an anchor teleport while keeping an invisible cross-room rope. Start with ordinary moving solids before enemy or portal variants.

### Springs and radial bumpers with shared actor responses

Extend spring orientation to up/left/right and distinguish two visible roles: navigation springs that center and launch predictably, and movement springs that preserve tangential approach speed. Define how loose cargo responds, rather than making it ignore a spring that clearly moves the knight.

For a bumper, extend the pressure-pod family with radial contact response. The current R pod reverses an entering dash; a touch bumper should instead care where contact occurs relative to its center, have a short disabled interval, and accept a deliberate dash continuation after the bounce. Its difference must be useful: grazing a moving side gives a different departure from striking head-on.

**Why it adds depth:** launches can route both actor and cargo, or change a flight into a wall/ceiling approach. These are reusable vector transformations, especially strong with portals and moving anchors.

**Limit:** preserve the current recoil pod as a distinct object. Do not replace its predictable input-vector reversal with radial behavior globally. Do not silently change Survive passage springs and invalidate navigation.

### A steerable carrier

Add a moving solid whose direction can be adjusted while it advances. A Bladefall version could be an armored carriage with exposed control faces: strike a face to redirect one axis, stand on a pressure edge to steer another, or parry a governor pulse to pause it briefly. Choose one control language for the initial version.

The interesting problem is staying in contact while changing the carrier’s route, then leaving with useful momentum. A cargo load can alter which control face is reachable; the carrier can shield a beam temporarily; enemies can be transported or crushed where the existing Combat rider rules support it.

**Why it adds depth:** the player creates the moving platform’s path rather than choosing when to board a predefined one. The control action also changes the player’s position or resources, coupling navigation to traversal.

**Limit:** avoid a slow vehicle minigame that replaces normal movement for an entire room. Define stall, return and reformation behavior. It needs predictable collision and a way to recover from a parked carrier without erasing all consequences.

### Enemy mobility and selective barriers

Rather than add several Celeste-like enemies, extend one existing family with a traversable recovery state. A charging guard could become a temporary moving wall after a parry; a hanging armored creature could offer a short-lived hook point; an uppercuttable actor could carry a receiver whose angle matters while airborne.

Selective barriers become useful when they separate these actors’ paths from the knight’s. A visible mesh might admit projectiles and the player but stop a heavy creature, or carry a charge that a metal object loses on crossing. Give each material one concise rule; show the interaction before demanding it.

Creature portal travel would be a larger, deliberate extension. It needs size/exit-clearance handling, allegiance and targeting rules, re-entry cooldowns and readable facing after rotation. Start with one enemy type, not “all entities can portal.” Existing projectile transit already changes allegiance, while player/cargo transit does not follow that same rule.

**Why it adds depth:** the player shapes an enemy’s future location or state to create a route. The enemy remains an active participant rather than a generic wall with health.

**Limit:** one enemy providing infinite dash refills can erase the room. Use finite life, recovery, positioning or a state transition to make repeat use meaningful. Preserve one-hit readability where the object is meant to be a simple target.

## Secondary additions worth keeping in reserve

| Candidate | Useful opportunity | Why it follows the first group |
| --- | --- | --- |
| General timed platform groups | Multiple visible phases, attached hazards and readable transition grace. | Existing resin and heat systems already cover much of the behavior; first deepen those. |
| Temporary double refill | A two-dash resource puzzle without permanently changing the room’s normal maximum. | Valuable but easy to reduce to “two dashes over a bigger gap.” |
| Vertical conveyor and no-grab wall | Hold/release momentum on the first; stamina-independent wall kicks without gripping on the second. | Strong surface variants once wall/lift contracts are consistent. |
| Generic falling solid and return stone | Ride, redirect, crush, catch or use a falling/returning mass as shade. | Existing carts, zips and boss machinery can answer some of these roles already. |
| Departure-armed thorns | The player’s route becomes unsafe after use. | Spent footholds and shades already create commitment; add only a distinct return problem. |
| Guided capture booster | Choose a direction and release timing, with buffered instant departure. | A new state should offer more than a free launch/refill. |
| Timed free flight | Continual steering with entry/exit momentum tradeoffs. | Broad controls and collision impact; could undermine existing hook and portal problems. |
| Conditional side collectibles | No-ground sequences, preservation of an enemy/object, or resource-limited returns. | Useful for mastery and optional difficulty, after movement rules and feedback are stable. |
| Linked hazard source or typed clutter removal | Change several connected parts of a route at once. | Best when order matters physically, rather than adding more key colors. |

## Interaction rules that matter more than entity count

Before an entity is treated as reusable, answer the following consistently:

| Interaction | Current concern | Recommended contract |
| --- | --- | --- |
| Contact and velocity | Several systems prescribe different launch outcomes. | State which component is preserved, rotated, added or replaced; distinguish intentional differences visually. |
| Blade and parry | Ordinary foes, jailers and Combat actors do not all rebound or take damage the same way. | Keep enemy identities, but use clear contact categories: glance, damage, recoil, stagger, launch and finish. |
| Carrying | Carry blocks many verbs; the player can still transit portals and swap with echo. | Preserve meaningful full-hands constraints; add selected contact transfers rather than allowing everything while carrying. |
| Weight and switches | Core plates share a room-wide H-gate condition, while Combat doors already have addressed requirements. | Build new wiring on explicit receiver groups. Accept player, cargo or enemy weight only when declared and visible. |
| Light | Beam shade and watch sight have different blocker sets. | Give the systems distinct presentation or deliberately reconcile them; never assume a lantern blocks every light. |
| Portal transit | Knight, loose lantern, moving K stones and projectiles are supported; creature bodies are not. | Specify accepted actor class, velocity transform, alignment and cooldown for each new type. |
| Reforming solids | Different systems handle overlap/materialization differently. | A safe, visible appearance rule for player, cargo and relevant enemies; no accidental one-frame spike immunity. |
| Gravity and coordinates | Gravity mirrors supported actors/devices, but water/tide combinations are explicitly unsupported and some older devices retain fixed-size assumptions. | Do not promise arbitrary new combinations until their coordinate and reset contracts are explicit. |
| Damage silhouettes | Sweepers currently test the full 11-pixel player body; ordinary spikes use the shorter 9-pixel hurtbox. | Resolve whether that difference is intentional before authoring very tight mixed-hazard passages. |

Relevant implementation: [plate/gate handling](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:615>), [Combat actor transport](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-combat.js:101>), [gravity mirror](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-gravity.js:51>), [sweeper collision](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-sweeper.js:33>).

Two additional compatibility risks emerged from source inspection. Echo is inserted into the ordinary entity list, which gravity mirrors, then its own mirror hook appears to mirror the same position again. Moving decks retain a private vertical travel offset that the generic gravity mirror does not change. Those combinations need a focused check before being used as the basis of a new entity interaction; they are not proven working merely because both modules are loaded. [Echo insertion and mirror](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-throne.js:33>), [gravity dispatch](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-gravity.js:51>), [deck motion](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-hook.js:20>).

Held cargo also does not enlarge the knight’s collision body, and moving-solid support for Combat actors does not automatically extend to every ordinary foe. A future design must use the actual actor contract rather than assume that appearance, weight or the word “enemy” implies the same response everywhere.

## How to judge whether an addition earns its place

A promising new entity should support several materially different interactions with existing verbs. That is a design criterion, not a requirement to immediately make several rooms. For a loaded platform, test a normal jump, a weapon impulse, cargo weight and a moving departure. For a movable seed, distinguish repositioning from triggering and interception. If every use reduces to touching it for the same refill and fixed launch, it adds little.

A strong Fractured combination should make the first action constrain the next: launching changes where a target can be intercepted; parrying changes which gate opens before arrival; reeling changes which release velocity is possible. A protected observation point can precede the sequence, but a full stable reset after every ordinary action should not be the default structure.

Judge route discovery and execution separately. A complicated-looking mechanism with an effortless physical solution is not automatically difficult. A narrow blind jump is not automatically an interesting puzzle. Your feedback on Shorten the Arc is a useful reference because the same system asks the player to observe, change the trajectory, recover it and commit again.

For future prototypes, collect one clean demonstration and a few relevant counterexamples, then prioritize your feel and difficulty review. The previous mistiming checks only showed that specific rushed tapes failed. They did not establish a challenging room. Do not keep adding verification or more hazards as a substitute for that judgment.

The recommended first milestone is the two existing enemy/projectile combinations, evaluated in a small future sandbox. Choose one next addition based on the limitation exposed: a contact cargo catch or moving anchor if an existing transfer is missing, or a loaded platform or movable impulse seed if a new physical behavior is needed. Keep the other options in reserve. This preserves an ambitious direction while judging each addition by the movement and problem solving it actually creates.
