# Survive movement tech and the Celeste comparison

Survive already has much of Celeste’s movement foundation. The strongest opportunity is to make those rules combine more consistently, then extend the combinations through the blade, enemies, cargo, hook and portals. Adding a long list of named moves would produce less depth than letting a smaller set of actions preserve useful speed, direction and resources across interactions.

Your latest feedback changes the design target: Shorten the Arc was enjoyable but not especially hard; the other timing rooms were too easy, including the Fractured set. More moving hazards and longer waits will not address that. Future movement should reward active control of an approach, a transfer and its consequence.

This is a proposal against the local 7.289 runtime, dated 7 October 2026. It changes no movement, rooms, ratings or banking decisions. Its companion is [Survive entities and interactions](</Users/computer/Projects/Bladefall-2D Antigravity/docs/design/SURVIVE-ENTITY-REPORT.md>).

## The recommendation

The first future milestone should be a small prototype of the two existing interaction chains described below. Then choose one missing interaction based on what limits those combinations—for example, a contact cargo catch or a moving anchor. The following three layers are the longer-term roadmap, not a simultaneous implementation batch:

1. **Make existing movement composable.** Establish one documented Survive movement profile; add reverse dash jumps, a short dash-contact grace period and deliberate delayed ultras; decide what happens to inherited speed on each action.
2. **Make the blade a movement instrument.** Give successful pogo, side-cut and parry contacts controllable outcomes while preserving useful incoming momentum. Enemy facing, survival and recovery should change the next traversal decision.
3. **Extend a few objects through those same rules.** Cargo regrabs, moving hook anchors and selected launch surfaces should feed into the same movement system. New entities are recommended separately, rather than each creating its own incompatible launch state.

Do not start with crouch-dash hitboxes, obscure collision exploits or the full catalogue of Celeste speedrun tricks. Several could eventually be worthwhile, but they are less direct answers to the present lack of demanding, expressive combinations.

## Scope and source interpretation

The supplied [Tech text](</Users/computer/.codex/attachments/cd1f78f0-5050-456c-9c4d-d9d3e55a6663/Pasted text.txt>) is the Celeste reference; its original page is [Celeste Wiki Tech](https://celeste.ink/wiki/Tech). The attached snapshot includes intended movement, emergent techniques, mod-specific variants and implementation exploits. These are different design categories, not an equally valuable feature checklist. Celeste-specific numbers below describe that supplied text, not measurements of a freshly downloaded game.

The Bladefall comparison uses the Precision Core loaded by Survive, its current device modules and the Climb wrapper. Explore and the older Fractured Workshop use other rules; older documents describing automatic airborne dash recharge are not evidence that current Survive has it. Runtime support does not establish campaign placement. The compiled Survive campaign currently has no V void-stone tiles; void, cargo clasps and several newer bank devices are available in the loaded engine and bonus/bank content. They are real existing systems to develop, but should not be described as already integrated throughout Survive.

**Exists** below means the functional rule is implemented, not that every Celeste variant or timing window matches. **Partial** means the foundation exists but a relevant interaction is missing or different. Recommendations are unimplemented unless explicitly described as current.

## What already exists and what is missing

### Movement foundations

| Celeste family | Current Survive | Recommended treatment |
| --- | --- | --- |
| Coyote time and input buffering | Exists. Jump grace and buffered jump/dash inputs are explicit. Blade, grab, parry and portal have shorter buffers. Freeze-time presses are remembered. | Preserve forgiveness. Make important new contact actions bufferable instead of compensating for awkward inputs with easy geometry. |
| Climbhop | Exists: reaching a ledge can initiate an automatic hop. | Keep it as assistance; assess predictable hazard and momentum behavior rather than adding a second climbhop system. |
| Corner correction | Exists: upward and dash correction both use a four-pixel allowance. | Preserve. Faster moves may need speed-aware contact checks, not smaller forgiveness windows. |
| Directional spikes | Exists, alongside a smaller hurtbox at the feet. | Teach readable safe directions where useful. Do not require invisible subpixel knowledge in ordinary Fractured progression. |
| Fastfall | Exists: normal maximum fall is 160 px/s; holding down raises the target to 240 with a gradual change. | Use it for arrival timing, low release and recovery. It is available design space already. |
| Liftboost | Partial. Moving solids store velocity for roughly ten frames, with horizontal/upward caps. Jump and super consume that storage; wall jumps apply it differently; ordinary dash does not add the stored lift vector. | Define a consistent inheritance rule and use it across launch surfaces. This is a composition gap, not a missing moving-platform system. |
| Dash attack | Gap. Celeste’s supplied reference describes a six-frame post-dash contact window. Our dash-contact behavior generally requires the active dash state. | Add a short, explicit contact grace period, separate from damage immunity and blade attacks. |
| Screen transitions | Deliberately different. Survive carries speed, dash count and stamina between sections rather than granting a universal transition refill. Some seamless terrain transitions preserve more motion state than ordinary section changes. | Preserve continuous-world identity. Fix inconsistent state loss where needed; do not add refill-by-crossing-an-invisible-seam. |
| Wind resistance | Wind and currents exist. Wall holding can suppress wind; crouching is not a general wind-bracing action. | Optional later stance interaction. Do not add it merely to match a heading in the wiki. |
| Berry mechanics | Shards, quest rewards and secrets exist, but Celeste’s collection conditions are a different objective system. | Address conditional collectibles in the entity report, not as missing locomotion. |
| Fastbubbling | No equivalent general captive bubble-launch system in this runtime. | Decide whether guided boosters are worth adding first; only then define immediate release and buffered departure. |

Evidence: core constants and input at [core movement](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:18>), [buffers](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:224>), [ground and retention rules](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:375>), [collision correction](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:540>), and [moving-solid lift](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:584>). Survive’s [section transfer](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-climb.js:57>) and [transition caller](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-climb-view.js:915>) determine which motion state survives a seam.

### Dash and wall techniques

| Celeste family | Current Survive | Gap or opportunity |
| --- | --- | --- |
| Super, hyper and wavedash | Exist. Super launches at 260 px/s; hyper multiplies that by 1.25 and halves the initial upward velocity; the resulting height also depends on hold and gravity rules. A midair down-diagonal approach can lead into the ground jump. | Use them as parts of routes, not as isolated long-gap passwords. |
| Extended super and hyper | Ground refill during a suitably delayed dash jump is supported, but the timing differs from Celeste. Our dash has nine movement ticks and three freeze ticks, rather than copying the supplied Celeste duration. | Document and teach the actual local window. Matching Celeste frame counts exactly is unnecessary. |
| Reverse super and hyper | Gap. The launch direction is chosen from the old dash direction, not the directional input at jump time. | High-value addition: land moving one way and deliberately launch the other way. Useful on small supports and moving objects. |
| Ultra | Partial. The current multiplier happens on ground contact during an active down-diagonal dash. | Keep existing behavior while specifying the full speed-preservation rule. |
| Delayed and chained ultras | The standard post-dash landing rule is missing. A later super/hyper also replaces horizontal speed with its prescribed launch speed. | Add a one-use landing opportunity from a qualifying dash; support real chains through geometry without applying a multiplier repeatedly while standing. |
| Wallbounce | Exists during an upward dash, with wider wall checking than an ordinary wall jump. | Extend contact grace if adopted. Add moving-wall, blade and portal continuations before making the launch more powerful. |
| Spiked wallbounce | The wallbounce path explicitly rejects a thorned face, in addition to lacking Celeste’s post-dash attack tail. | A deliberate change to the thorned-face rule would be needed; dash-contact grace alone is insufficient. |
| Crouch dash, demo, demohyper and diagonal demo | Gap. The player’s ducking flag selects hyper behavior; it does not shrink the body or hurtbox. There is no dedicated crouch-dash action. | Later option with real readable poses, bindings and safe uncrouching. Not a cheap tweak to the existing flag. |
| Spring cancel | Dash can replace a spring launch after contact, subject to local input/cooldown rules. | Retain the option, but first resolve the Survive spring policy discussed below. |

The decisive code is [jump launches](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:319>) and [dash update](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:506>). The fixed [body dimensions](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:137>) and [hurtbox](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:691>) matter when assessing demo-like claims.

### Dashless and entity techniques

| Celeste family | Current Survive | Recommended treatment |
| --- | --- | --- |
| Bunnyhops | Ground jumps add horizontal input boost to existing velocity; leaving the ground limits exposure to ground friction. | Existing vocabulary to exploit. A moving object can change the useful height or direction of the next hop. |
| Neutrals and wallboost | The neutral wall-jump path avoids the directional forced-movement timer; climb-jump stamina refunds and wall-speed retention exist. | Teach useful ordinary variants. Do not label every multi-jump Celeste corner sequence as verified here. |
| Cornerjump, cornerkick and cornerboost | Wall-jump reach, climb jumps and retained speed provide the ingredients. An isolated rising-climbjump probe demonstrated a cornerboost-like speed recovery; exact high-end sequences remain unestablished. | Support a small, readable corner-transfer vocabulary, then verify chosen sequences individually. |
| 5jump through 9jump, double/reverse cornerboosts, overhang variants | Not established as exact local equivalents. Their Celeste distances and subpixel conditions do not transfer simply because some constants match. | Optional expert research, not initial acceptance criteria. Favor generous, intentional contact surfaces over memorized fractional positions. |
| Ceiling pops, cornerslips, spike clips, spike jumps and stamina tapping | Some rely on particular collision ordering or implementation accidents. | Do not reproduce glitches to inflate the tech list. A deliberate blade-assisted ceiling release could serve the interesting movement role more clearly. |
| Dream jump and dream exit movement | Void stone already grants a dash refill, exit velocity and six-frame jump grace for level/downward exits. | Deepen exit choices; preserve the distinction between void’s fixed transit and portals’ rotated momentum. |
| Dream hyper, dream grab, double-jump and smuggle variants | Some exit-jump/dash combinations may compose; the complete Celeste family is not implemented. Void consumes grab/strike/portal buffers during transit and resets entry speed. | Define supported exit actions. Do not advertise cargo smuggling or double jumps just because the surface resembles a dream block. |
| Theo/Jelly regrabs, vators and holdable ultras | Carry/throw/glide exists, but normal cargo pickup cannot cancel an active dash. | High-value gap: permit a deliberate dash-to-catch transfer with momentum continuity. |
| Neutral drop and backboost | Downward release exists but retains half the knight’s horizontal speed. Throwing does not recoil the knight. | Provide predictable drop and modest throw recoil if cargo movement is expanded. Keep object motion and player recoil separately tunable. |
| Cloud/core/bubble/bumper launch tech | There are existing launch devices, but not all of these entity behaviors. | Create the entity first, then make it use the shared launch rules. Avoid one bespoke named move per object. |
| Fish, seeker and projectile bounces | Blade pogo, enemy rebound and parry provide a stronger Bladefall-specific starting point than a universal body stomp. | Make the weapon contact and enemy state matter. Preserve the need to aim and time the action. |
| Reform/cassette boosts, moon boosts, waterboosts and feather cancels | Related timed solids, water and moving surfaces exist; these exact techniques are not established. | Select deliberate interactions later. Safe materialization must not depend on a one-frame gap before spikes become lethal. |
| Bino exploits, cutscene warps, spinner disabling, pause exploits, Kermit dash and extreme subpixel tricks | Not a desirable compatibility target. | Keep collision active and transitions consistent. Do not turn menus, camera culling or long-running clock errors into required movement. |

Cargo evidence: [pickup and release](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:416>). Void evidence: [entry](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-void.js:24>) and [exit](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-void.js:64>). The rare-tech groupings cover the supplied page’s variants without treating every nickname as a separate system to build.

## Where existing rules interrupt combinations

Several boundaries deserve a deliberate decision before introducing more objects.

**Survive and the Room Bank differ on springs.** Survive enables a flag that centers the knight on a spring and sets horizontal velocity to zero. The generic Room Bank does not enable that same wrapper flag. A spring combination explored in the bank can therefore behave differently when placed in Survive. Keep the straight-up behavior where it serves passage navigation, but distinguish those routing springs from momentum-preserving launch springs. The same review profile should be available when assessing a future Survive room. [Survive flags](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-climb-view.js:549>), [spring contact](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:731>).

**Launching is not governed by one inheritance rule.** Pogo replaces vertical velocity; side-cut recoil replaces horizontal velocity; portals rotate motion and can reconstruct fall speed; void standardizes transit speed; moving solids store lift; jumping consumes that lift in some paths. These are not all defects. Each can have a distinct role, but players need to predict which component survives. Clearing the coast/fling flag on landing does not itself zero velocity; it removes the special preservation behavior and exposes motion to normal friction. [Blade rebound](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:713>), [portal transit](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-portals.js:165>).

**Several promising transfers are unavailable.** A blade or parry cannot start during a dash, carrying removes many actions, and hook capture requires normal movement with free hands. Rail carts intentionally cancel a landing dash and suppress ordinary ground dash refills. Keep the vehicle’s identity; do not silently make every cart a wavedash platform. Improve selected transfers through explicit rules or visibly different variants. [Action restrictions](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:391>), [hook capture](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-hook.js:45>), [cart rules](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-rail.js:44>).

**Echo, portals and companion commands need input arbitration before unrestricted mixing.** They reuse the portal action. The echo already moves the knight while retaining current velocity and cargo; that is substantial unique tech. New mixed encounters need a clear way to select an action, rather than relying on whichever module consumes the input first. Prefer a contextual selector or an optional separately bindable action over mandatory multi-button chords. [Existing controls](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-view.js:21>), [echo exchange](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-throne.js:29>).

## Two high value combinations using existing primitives

**Launch a living target and intercept it.** An upward cut can launch a surviving Combat actor. The knight then takes a separate portal route and reaches the actor with a downward cut. That pogo happens before its final damage is resolved, returns movement resources and keeps the knight’s horizontal approach speed. Killing the actor too early removes the target; missing it yields no refill. This would couple enemy preparation, route selection and aerial aim without adding a new enemy or movement rule. A complete authored route still needs to establish the geometry; the portal must not make the final contact optional. [Combat launch and pogo](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-combat.js:126>).

**Parry while a moving launch carries you.** Leave a zip or deck with lift momentum, aim a parry in flight, and send the returned shot through a portal to a protected receiver before the knight arrives at its gate. The successful parry preserves the ongoing player trajectory and restores dash for an arrival correction. Cutting the bolt instead destroys the needed projectile. An emitter aimed directly into the portal would be a bad setup: transit already makes the projectile friendly and could bypass the parry entirely. Use a projectile-only coil or protect an ordinary tally beyond blade/body reach. This is another supported set of primitives, not a previously completed demonstration. [Parry](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:274>), [projectile receivers](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-combat.js:163>).

## Proposed movement additions

### Reverse launches and delayed speed preservation

Allow directional input at the jump to choose a super/hyper’s launch direction, with the original direction as the neutral fallback. This creates reversals on tiny platforms, makes landing position matter and lets a moving support supply a return route. It also means the dash that approaches a platform can change the machinery while the subsequent jump leaves in another direction.

For ultras, keep an explicit, single-use opportunity from a qualifying down-diagonal dash until the next eligible landing. Keep the existing preservation of faster same-direction horizontal speed at dash start; add the missing later landing opportunity, multiply once on that landing, and clear the opportunity under documented interruptions. First establish the ordinary delayed landing and two chained landings. Exotic cargo or echo preservation can follow only after their resource rules are clear.

These are relatively contained additions with high movement value, but they can open shortcuts in existing rooms. Version the changed movement profile and review affected rooms; do not conceal compatibility changes by rewriting approved layouts.

### A short dash contact grace period

Introduce a short interval after dash motion ends in which a suitable wall or device can still recognize the dash direction. Four to six simulation frames is a prototype range, not an approved balance value. It should support a late wallbounce and a slightly late dash-reactive object contact.

The interval must not provide invulnerability, damage everything the knight touches or count as a second dash. A jump, firm grab or successful state-changing interaction should consume/cancel it according to one documented rule. Since a dash also flips machinery, a grace-window collision must not trigger another global flip.

### Pogo height and side-cut momentum

Keep the existing pogo that preserves horizontal velocity, then add an intentional choice at successful contact: a held jump produces a lofted rebound, while a released jump permits a lower, faster continuation. Downward contact should continue to preserve horizontal approach speed. For side cuts, evaluate retaining more incoming tangential motion and allowing a controlled launch magnitude; today the horizontal recoil is fixed while sufficiently fast upward motion can survive.

This creates blade-specific techniques: arrive quickly, make a low pogo beneath a roof, then use a later target for height; or cut a rear target to accelerate toward a ring while retaining an upward arc. The reward is earned by hitting a valid target. Swinging in empty air must not grant free lift, a refill or a universal dash cancel.

Enemies need a clear repeat-use rule. A durable armored target can support several pogo contacts without taking health damage; a vulnerable enemy might be consumed by a finishing cut. That makes “kill it now or keep it as a foothold” a real decision.

### Successful parry into movement

A successful parry already restores the dash and redirects threats; it does not itself refill stamina. Extend selected successful contacts to permit an aimed, bounded movement impulse or an immediate preserved-speed follow-up. This should depend on a live attack reaching the parry, not on pressing the button whenever convenient.

An example chain is a moving enemy’s telegraphed strike, a late parry that provides a lateral departure, and a portal that rotates that departure into an ascent. Whiffing gives no propulsion. Enemy recovery determines when another attempt is possible. This turns combat timing into platforming without making every enemy a stationary refill crystal.

### Cargo regrab and throw recoil

After an explicit compatibility decision for existing cargo puzzles, permit a buffered grab to catch a loose lantern during a dash. On a valid catch, end the dash movement state but preserve the actual velocity at contact; then apply the carry/glide rules. The player has already spent the dash, and catching does not automatically refund it. A later throw makes other verbs available again.

A small opposite impulse on a deliberate throw would add backboosting. Pair that with a genuinely neutral drop option so “leave this object here” is predictable. Possible techniques include throw ahead → dash catch → glide, and drop → upward dash → recatch. Those are useful Celeste imports with a different purpose here: the lantern also supplies weight, beam shade and clasp storage.

Do not initially allow free sustained climbing with the lantern or unlimited drop/regrab ascent. A repeated catch should transfer existing momentum, not manufacture vertical energy. A specialized holdable could later support stronger flight at the cost of losing the lantern’s puzzle functions.

### Shared lift and impact rules

Decide for each action whether it preserves, rotates, adds to or replaces velocity; whether it consumes inherited lift; and what happens to dash/stamina. Give launchable entities the same contract. Keep strict caps only where needed for stable collision and deliberate balance, with enough headroom for rewarding chains.

A sensible first prototype retains recent platform velocity through one jump and a subsequent dash, with a clearly bounded grace period. Compare that to the current consumed-on-jump behavior before deciding whether any reusable lift credit is desirable. Copying Celeste’s repeated lift application wholesale risks extreme speed amplification in a game that already has portal loops and movable machinery.

Moving hook anchors are a particularly strong extension: release should inherit the anchor’s motion as well as the knight’s tangential swing speed. Reel length controls clearance and release position. This extends the thing you liked in Shorten the Arc rather than replacing it with another passive waiting platform.

### Void exits, portals and echo

Void already supplies a powerful exit-jump foundation. Add a deliberately supported choice between grabbing its exit face, jumping with retained horizontal motion, or spending the refreshed dash on a reverse/low launch. Keep cargo passage as a separate decision; granting smuggling globally could erase the existing distinction between player-sized and cargo routes.

Portals already rotate dash direction and transmit lanterns, moving stones and projectiles. First exploit those rules: redirect a launched object and intercept it, or turn a successful blade departure through a different plane. The additional tech opportunity is preserving a well-defined pending action across transit, not inventing portal flinging again. Echo likewise already relocates velocity; its strongest new use is combining that with a moving observation/launch state once controls are unambiguous.

### Crouch movement later

Crouch jumps and demos could create a valuable compact-body movement family, especially for sliding below a blade sweep or releasing from an overhang. They require actual collision/hurtbox changes, a readable pose, clearance checks when expanding and convenient keyboard/controller binding. They would alter many existing gaps and combat collisions. Treat them as a separate feature with broad compatibility cost, after the higher-value contact and momentum work.

## Three example combinations to pursue later

These are interaction sketches, not authored levels or new bank entries.

| Combination | Already available | Proposed addition | What the player controls |
| --- | --- | --- | --- |
| Low pogo into a moving ring | Pogo, moving platforms, reelable hook | Adjustable pogo height; ring attached to moving support | Keep horizontal speed, clear the overhead hazard, catch at the useful rope length, release with anchor motion. |
| Lantern through a portal into a dash catch | Throwing, cargo portals, glide, plates and clasps | Dash-cancel catch; optional throw recoil | Choose where object and knight meet; preserve speed until the catch, then trade it for control and shade. |
| Enemy parry into a reverse departure | Telegraphs, parry/refill, dash-switched supports | Contact-earned parry launch and reverse hyper | Use the enemy’s attack timing to create an approach, change the support with the dash, and leave in the opposite direction before recovery. |

## Difficulty and the lesson from the last set

The saved event report shows no super, hyper, ultra, wallbounce, blade-strike or parry events in any of the ten new timing-room completion tapes. Shorten the Arc’s saved route instead uses hook capture, rope-length changes and releases. That does not prove that advanced tech is necessary for difficulty, but it explains why the batch did little to explore Survive’s higher movement ceiling. The earlier author difficulty estimates were not reliable measurements. [Saved route evidence](</Users/computer/Projects/Bladefall-2D Antigravity/docs/room-bank/route-report.json>).

My design inference from your feedback is that the interesting element was **changing the movement state while the hazard remained relevant**. A static refuge that completely resets the challenge after each ordinary jump can make even several hazards feel like disconnected easy actions. Keep observation points, but allow the harder part between them to demand two or three coupled decisions: release speed affects a catch, the catch changes what can be carried, and the next action must account for that result.

Base and Fractured should share understandable rules. Base can still be demanding through routing, accurate object placement and precise ordinary movement. Fractured should more often ask for controlled preservation of speed, active airborne adjustment, scarce resources or a coupled combat/traversal sequence. Neither mode should rely on unexplained collision exploits, unreadable hazards or tedious waits. Do not require every hard room to use every specialty move.

## Small consistency issues to settle before expanding combinations

A focused, isolated-state probe found that a feather jump and a swimming stroke can both run from one jump press. The shared device dispatcher invokes every air-jump provider; each of those providers can call the ordinary jump routine. Define which action owns the press and consumes the resource before treating multi-device behavior as intentional tech. This is a narrow interaction finding, not a claim that ordinary campaign jumping is broken. [Dispatcher](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:46>), [feather provider](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-frost.js:58>), [swimming provider](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-water.js:121>).

Carried lantern art extends above the knight, but carrying does not enlarge the player’s collision body. Future cargo puzzles must not assume that a low ceiling blocks the combined silhouette. A nearby hook can also claim held Grab before normal lantern pickup; any new dash-catch rule needs deliberate input priority. These are specific boundaries to clarify, not reasons to remove the useful full-hands tradeoff. [Carry positioning](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore.js:410>), [hook capture](</Users/computer/Projects/Bladefall-2D Antigravity/public/bladefall-pcore-dev-hook.js:51>).

## Suggested development order and evaluation

| Order | Deliverable | Why first | Main compatibility risk |
| --- | --- | --- | --- |
| 1 | Existing-interaction prototypes, movement contract and matching Survive review profile | Tests the unused depth while preventing designs against the wrong spring, carry or transition behavior. | Reveals intended differences that must remain explicit. |
| 2 | Reverse launches, dash-contact grace, ordinary delayed ultra | Broad movement depth from a small number of coherent rules. | New routes through existing geometry; duplicated dash side effects. |
| 3 | Adjustable successful blade rebounds and cargo dash catch | Strong Bladefall identity and many combinations with existing content. | Resource farming, enemy-dependent rebound inconsistencies, unlimited holdable ascent. |
| 4 | Moving anchors and one or two new launch entity families | Makes the new rules useful in distinct movement situations. | Moving attachment collision, inherited speed and reset correctness. |
| 5 | Crouch/demo family and selected high-end surface tech | Adds another expressive layer once the foundation is stable. | Wide collision and input compatibility impact. |

Advance through this roadmap one interaction at a time, rather than combining several new movement families before judging any of them. Evaluate future prototypes with a small set of explicit questions: Does earlier speed or angle materially change the next action? Is there a useful alternative to the default launch? Can the player recover through skill? Does a successful contact earn its resource change? Does the behavior match its animation? Can ordinary jump/dash movement ignore the central interaction? Preserve interesting alternate solutions that still engage the problem.

Use one demonstration of each new rule, a coupled example and a targeted failure case. Then get your judgment on feel and difficulty before building another large batch. The next milestone should be a small, expressive movement vocabulary that survives combination—not another catalogue of rooms whose main evidence is that one tape can finish them.
