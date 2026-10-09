# Survive room design: timing, movement and player learning

Bladefall has made real progress in spatial puzzles: objects changing jobs, routes reopening from another direction, enemies becoming useful terrain, and architecture shared between the outward and return trip. The main shortfall is what the player does **after understanding the answer**. Too many recent rooms become an ordinary jump, a passive ride, or a sequence of safe resets. Several can ignore the supposed answer altogether.

My assessment is that I overemphasized clever mechanisms and building a large reserve, while underemphasizing continuous movement, pattern learning, visual explanation, and independent attempts to bypass the central problem. The earlier reports identified many of these risks. Implementing some of their named features did not ensure that later rooms made good use of them. More entity types alone will not close that gap.

This synthesis uses your latest feedback, the delivered Run 5 and Run 6 sources, the earlier [movement report](SURVIVE-TECH-REPORT.md) and [entity report](SURVIVE-ENTITY-REPORT.md), current engine code, and Celestial Resort reference layouts. It recommends future work; this delivery implements only the requested cuts, banking and room revisions. The [revision guide](../room-bank/RUN-56-REVIEW.md) records their final disposition and evidence.

## What the recent rooms actually exercised

The [reproducible movement audit](ROOM-MOVEMENT-AUDIT-2026-10-09.json) covers the 16 author completion routes delivered before this feedback. It counts rooms containing an event, not button presses, player success rates, or mechanics proved necessary.

| Interaction in the saved route | Run 5 out of 8 | Run 6 out of 8 |
| --- | ---: | ---: |
| Super, hyper, wavedash or ultra family | 0 | 0 |
| Wallbounce, including late wallbounce | 1 | 1 |
| Controlled low or lofted pogo | 2 | 0 |
| Cargo dash catch | 0 | 0 |
| Successful parry | 1 | 1 |
| Attachment to a moving hook | 0 | 0 |
| Configured path sweepers | 0 | 0 |

A wavedash uses the hyper/ultra event paths rather than a separate event name. The zero launch-family count is therefore meaningful. B52 and F54 contain moving carriers, but their delivered routes rode the top instead of using the hook. F53's wallbounce did not make the room interesting to you. Technique presence and technique quality are separate questions. [Audit script](../../scripts/room-bank/feedback-movement-audit.mjs), [historical route evidence](../room-bank/run56-before-routes.json).

Your description that recent rooms mostly use standard movement is substantially right. It would be inaccurate to say they contain *only* ordinary dashes: F48/F49 use controlled pogo, F50 uses a late wallbounce, and B52 parries. But those exceptions do not amount to sustained synthesis of the new movement vocabulary.

The pattern in your approvals also matters. F49 combines route decisions with enjoyable platforming. F50's companion/door/recoil relationship works despite being relatively easy. B51 combines preparation, expiry and an active release. B48 becomes interesting precisely when the freeze must happen before the moving cart reaches its consequence. F48 is a useful reminder that an easy room can still be cute and fun. The answer is not to make everything harder.

## Why the earlier reports did not translate into the intended result

**The entity report undervalued timing design.** It correctly noted that we already had moving hazards, but treated the principal function of dust bunnies as largely covered by sweepers, and ranked rhythm groups and departure-armed thorns lower. That collapsed very different experiences into “hazard exists.” A moving lethal circle, a surface that becomes lethal after use, and a stamina-limited wall sequence are different design tools even when they share dust art. The new priority should be making those temporal relationships expressive, rather than adding another cosmetic obstacle.

**The movement report's central recommendation was not enforced in later designs.** It recommended preserving meaningful momentum through interactions, not simply adding named moves. Reverse launches, controlled pogo, cargo dash catch and late wallbounce were implemented under the opt-in movement profile; recoil plates, impulse seeds and moving anchors followed. Runs 5 and 6 then returned mainly to stopping, arranging objects, and making conventional jumps. The machinery changed, but the player's physical decisions often did not. [Run 2 implementation record](../room-bank/RUN-2.md), [current movement code](../../public/bladefall-pcore.js).

**The successful-route tests answered the wrong question too often.** A tape that touches a refill proves that a refill can be touched. It does not prove that the refill is needed. A negative tape made by removing the intended action may fail because it leaves the player in the wrong place; a human simply chooses a better launch point. Your F51 and F52 routes demonstrate this directly. The current revision work reproduces those successful alternatives on the old rooms before testing the replacements.

**“More forgiving” sometimes became “less consequential.”** Broad final landings are useful. Broad resets between every action can dissolve an entire sequence into unrelated easy moves. The right adjustment is to make contacts reliable and failure readable while preserving the demanding phrase wherever it belongs, including at the finish. The earlier reverse-launch revisions are a better example of this than removing all execution pressure.

**Large rooms amplified travel more reliably than play.** Connected architecture is valuable when its earlier state changes a later action. Extra map area, an empty quadrant, a long carrier ride or a repeated walk is not additional depth. B53's unused basin and dispensable float, and B52's passive ride, expose this. Superrooms need a stronger reason for each stretch of travel and a way to practise the difficult phrase without repeatedly paying for solved setup.

**Presentation did not keep pace with mechanical complexity.** B52's smoke and watch cone look atmospheric before they look like a protection/detection system. F54's usable but unmarked portal face contradicts the established material language. Body-operated tallies, projectile receivers, ordinary beams and watch sight also have different rules. Players should reason about those rules from what happens and what they see, rather than needing the intended-route film to identify them.

## What Celestial Resort is doing with dust

The useful comparison is between several kinds of constraints, rather than one enemy called a dust bunny. Your supplied [entity reference](</Users/computer/.codex/attachments/4688b14a-7da9-4737-94a1-99a19d998dca/Pasted text.txt>) distinguishes static/moving dust from **trigger spikes**: safe-looking hairs can be touched, then become lethal after departure. Removing a floor and making its retained surface dangerous are not equivalent; the latter can remove a future wall grab as well as a landing.

| Dust use | Decision it creates | Bladefall application |
| --- | --- | --- |
| Static dust around a useful surface | Which face or approach remains safe? | Define an honest movement envelope around a pogo target or launch wall. |
| Linear patrol across a route | When will the hazard occupy the place where I will arrive? | Wavedash or fastfall through a moving opening, with a visible approach. |
| Out-and-back patrol | Can I complete the transfer before its return stroke? | Release from an anchor while the outgoing gap still gives a safe landing. |
| Circular or closed-loop patrol | Which part of the orbit gives both entry and departure clearance? | Travel around an island, or vary rope length while a hazard returns around it. |
| Two paths with a phase offset | Where can I pause, and what does that delay do to the second crossing? | A short linked sequence with one adjustment point, rather than two unlimited rest bays. |
| Departure-armed surface | Which landing or grip am I spending for the rest of the attempt? | A wall section supports a first pass, then forces the return onto a different face. |
| Wall hold plus moving danger and refill | How long can I wait before stamina or the next pass makes waiting unsafe? | Climb, release through the opening, recover resources in air, and reach the next usable wall. |

These are design applications, not claims that every pattern above occurs in every Resort room or that its exact periods have been measured here. The actual game layouts provide concrete examples:

- **A-side 00-a, the dust introduction**, puts small useful supports between clearly lethal boundaries. The support and the hazard share the player's route; the dust is not decoration beside a long safe corridor. The lesson to borrow is to teach one readable encounter before combining several. [Game-room capture](https://berrycamp.github.io/celeste/resort/a/00-a).
- **A-side 06-d**, combines a bent central support, low surfaces with trigger hairs, and dust occupying the surrounding space. A support's shape and whether it remains usable are part of the route. For Bladefall, this suggests preserving the object-manipulation puzzle while making the outward trip consume a useful face needed later. [Game-room capture](https://berrycamp.github.io/celeste/resort/a/06-d).
- **B-side 02 and 06** reduce the generous structure to isolated small supports surrounded by dust. The key design escalation is the relationship between landing and next departure: solving one crossing must leave a useful position for the next. Replacing every support with a large permanent refuge would remove much of that relationship. [B-side 02](https://berrycamp.github.io/celeste/resort/b/02), [B-side 06](https://berrycamp.github.io/celeste/resort/b/06).
- **B-side 11**, visibly repeats narrow wall passages with overhead refills and dust constraining the wall faces. This directly matches your interest in climbing, managing a limited hold, reaching a resource reset, and repeating a learned pattern. The crystal is positioned as part of the climb's continuation. A floor that freely restores the same resources underneath it would undermine that structure. [Game-room capture](https://berrycamp.github.io/celeste/resort/b/11).

The layout observations above are my analysis of game captures hosted by Berry Camp. They establish geometry and placements; they are not measurements of animation periods. I have not assigned frame-perfect Celeste timings or claimed to have played those chapters in this session.

For Base, the useful model is a readable first encounter, then a variation that asks the player to apply the same rule. For Fractured, the useful model is several related decisions within one continuous phrase, with fewer opportunities to erase the consequences of an earlier choice. This does not require Celeste's extreme speedrun techniques: ordinary wall movement can become demanding when route, resources and hazard phase remain coupled.

## Timing that rewards learning

A good timing room lets the player learn a repeatable sequence and then feel themselves perform it more cleanly. “Wait, jump to a huge safe floor, wait again” can teach a rule, but should not be the default Fractured structure. Equally, a blind one-frame opening trains imitation and frustration rather than understanding.

Design around **arrival**, not just departure. If a jump or swing lasts longer because of its approach speed or rope length, the hazard will be somewhere else at contact. That is the missing link between movement mastery and the environment. A faster route should sometimes catch the first opening; a controlled slower route might catch the next. Both can be legitimate if they still engage the pattern.

Use three kinds of breathing space deliberately. A full rest before the phrase permits observation. A small adjustment point within it permits braking, a short cling, or a refill without erasing all timing pressure. A stable landing can reward success; a demanding final transfer can also be the point of the room. A superroom can have several such phrases connected by a shared object or changed route. It does not need to be one enormous deathless performance, nor a collection of disconnected rooms with long walks between them.

Player-triggered changes and periodic movement are especially productive together. The route can decide *which* opening exists, while the cycle decides *when* it can be used. B48's cart/freeze interception is already close to this. A pressure plate that merely waits forever for cargo is usually a spatial puzzle; a plate that prepares a moving surface for a chosen crossing adds temporal execution, provided its rule is visible.

Keep reset behavior predictable. The existing sweepers use a shared input-started clock and reset to their authored phase. That is a useful foundation. A fresh attempt and a local retry should give comprehensible cues; a preview should explain the departure cue rather than train an arbitrary count of idle frames. Rhythmic visual movement need not be synchronized to music. If audio supplies a beat, provide an equivalent visible cue. [Sweeper implementation](../../public/bladefall-pcore-dev-sweeper.js), [existing authoring contract](../room-bank/TIMING-PATROLS.md).

Stamina can create the pressure you described without increasing hazard speed. A safe starting ledge gives time to observe; the next wall gives only a limited hold; a crystal then restores the resource budget in midair. Our directional crystals already restore dash and, when collected, stamina. The room must remove unnecessary ground refills and let the player understand what the crystal returns. Avoid arranging a wall sequence around mandatory exhaustion tricks before the basic resource loop feels reliable. [Directional refill rules](../../public/bladefall-pcore-dev-vector-refill.js).

## Where the engine is ready and where it is not

| Area | Current state | Recommendation after this review |
| --- | --- | --- |
| Wavedash, super and hyper | Existing movement; neglected in the latest author routes. | Use approach speed and jump height to meet a timed opening or moving target, instead of only crossing a long empty gap. |
| Reverse launches and late wallbounce | Implemented under `survive-2`; reverse grace was widened after your feedback. | Build a continuation that needs the direction change or late contact, with a readable receiving surface. |
| Controlled pogo | Implemented under `survive-2`. | Couple low/loft choice to a moving danger, target lifetime, or the next catch. A pogo should do more than unlock an isolated vertical jump. |
| Cargo dash catch | Implemented under `survive-2`; absent from the latest routes. | Intercept moving cargo inside a pattern, then use the captured momentum or shade immediately. Avoid another slow transport-only lantern puzzle. |
| Moving anchors | Implemented with reel control and carrier-relative motion. | Make reel length, release point or interception matter. Riding the carrier roof does not explore this system. |
| Linear and closed paths | Sweepers already support two-point out-and-back motion and closed polylines with phase offsets. | Author patterns with those tools first. Exact smooth circles or dwell/easing profiles are additional work; polygonal loops must not be described as a completed circular-motion feature. |
| Departure-armed hazards | Still a distinct gap. Spent floors, fault chains and existing crumbles are not the same behavior. | High-value next entity candidate: a clearly marked surface that remains solid but becomes dangerous after departure, including selected wall faces. Prototype its timing and reset contract before mass placement. |
| Resin groups, root lashes and heat slabs | Existing cycle families with different solid/warning/lethal phases. | Use their phase relationships and warning cues; do not invent a redundant timer object merely to satisfy a novelty quota. |
| Delayed and chained ultras | The current multiplier is still tied to landing during the active down-diagonal dash. | A real pending-landing rule and momentum contract remain future implementation, not something the previous runs have completed. |
| Contact parry launch, throw recoil, oriented/cargo springs and radial touch bumpers | Still proposals or partial analogues rather than the full report behavior. | Select one only when a promising existing interaction is blocked by that missing transfer. Do not schedule all of them together. |
| Shared movement profile in Survive | New movement remains opt-in; campaign spring behavior can differ from the generic bank. | Before campaign insertion, test chosen rooms under the actual Survive wrapper and explicitly decide which profile and spring contract they use. A banked candidate is not already integrated campaign content. |

Evidence: [movement and grace rules](../../public/bladefall-pcore.js), [moving anchors](../../public/bladefall-pcore-dev-moving-hook.js), [timed resin and lashes](../../public/bladefall-pcore-dev-rbr-f-woods.js), [heat slabs](../../public/bladefall-pcore-dev-ember.js), [Survive wrapper](../../public/bladefall-climb-view.js). This delivery does not broaden those engine features or enable new movement across the campaign.

Our impulse seed illustrates another composition limit: its burst sets a new radial velocity rather than preserving the incoming trajectory, and it grants no refill. That is a valid object identity, but repeatedly using it as a fixed launcher will not develop approach-speed mastery. Keep that identity and choose a different interaction when the point is momentum preservation. [Impulse seed](../../public/bladefall-pcore-dev-impulse.js).

## Bladefall combinations worth pursuing next

These are future design directions, not new rooms created in this delivery. Their purpose is to connect the timing vocabulary to Bladefall's own verbs.

| Proposed interaction | What the player learns | What must stay necessary |
| --- | --- | --- |
| Wavedash into a low pogo between two patrol passes | Choose the launch phase; retain speed under the first hazard, then select the rebound height for the second. | Ordinary jump/dash must not reach the final shelf without encountering the same timing problem. |
| Reel around a moving anchor while an orbit returns | Shorten to clear the low hazard, pay out under the high one, then release toward a safe arc. | Hanging posture and rope adjustment matter; a roof ride must not solve the same stretch automatically. |
| Wall climb, airborne refill, reverse departure | Spend hold time until an opening arrives; recover resources and change direction before the next pass. | No unnoticed floor or corner grants the refill for free. The wall and crystal must be clearly readable. |
| Launch a surviving enemy, then pogo the interception | Enemy recovery and the player's travel time determine the meeting point. | The enemy has a meaningful surviving state; killing it early or missing the contact changes the route. |
| Parry a pulse while crossing a moving opening | The attack's tell supplies a cue; the returned shot changes a later passage while the knight is already moving. | A hostile bolt must not reach the receiver automatically via a portal, which currently converts it to friendly. |
| Throw cargo through a pattern, dash catch and glide | Object and knight use different travel times, then reunite while moving. | The catch changes the next movement or shelter decision; carrying everything from the start cannot replace it. |
| An outward wall becomes unsafe for the return | Learn a path once, then apply the same movement vocabulary to its changed usable faces. | The changed surface is visible and the return offers a fair new route, not an unexpected unavoidable death. |

The design priority is a few strong examples across different movement families. It is reasonable to repeat a mechanic while developing mastery; the repetition should change the player's decision. Repeated “transport shade, open gate, walk home” structure is the repetition to reduce. No arbitrary requirement for one new mechanic every batch should take priority over this.

## A better standard for accepting rooms

1. **State the experience before the mechanism.** For example, “learn a three-part release rhythm while preserving a dash,” or “discover that the outgoing shield becomes the incoming wall.” Name the movement decisions and the discovery separately.
2. **Check the obvious escape routes early.** Attempt start-to-exit, climb around the door cap, jump/dash from the nearest edge, ride the full carrier path, and exploit an ordinary ground refill. Seal intended exits visibly. Do this for the room being authored, without using this review as authorization for an unrelated campaign retrofit.
3. **Prove centrality with an active alternative.** A rejected route should genuinely try to solve the room without the claimed interaction. If it succeeds while retaining an interesting problem, keep it or make it the intended route—as your F33 solution demonstrated. If it makes the central problem irrelevant, revise geometry or choose a better problem.
4. **Tune one continuous phrase.** Check a few distinct early/late starts and realistic landing positions. A broad timing window in one strike is not proof that the whole route tolerates variation; equally, hundreds of permutations are not a substitute for playing it.
5. **Make failures intelligible and retries useful.** The player should be able to say “I left before the return pass” or “I spent the dash on the wrong landing.” Limit repeated solved setup. An ending may be the hardest part. Require reliable, learnable execution there; do not automatically widen or simplify it.
6. **Get human feel feedback before producing another large set.** Keep Fun /10, Difficulty /5 and Suitability /5. Use the optional comment to capture whether the pattern was understood, what failed, and whether the successful route used the main idea. Separate discovery difficulty from execution difficulty when interpreting those comments.

This is a smaller, more informative review process, not a request for endless verification. A clean route, a few honest variations, the obvious bypass attempts, a visual pass and your playtest answer different questions. Passing one cannot stand in for the rest. Numerical author difficulty remains a provisional estimate, and a reasonable final distribution needs several human testers rather than deductions from tape length.

## Why the feel still falls short

My strongest explanation is design and iteration: the recent levels did not consistently ask players to exercise the movement that had been added. The feedback provides direct evidence of passive intervals, unnecessary objects, unclear hazards and bypassable central mechanics. The route audit independently shows the neglect of advanced launch techniques and patrol patterns. That combination explains much more than a shortage of named entities.

Engine feel still matters. Reliable corner handling, buffered intent, launch inheritance and generous contact windows allow a demanding route to feel fair. Maddy Thorson's account of Celeste's forgiveness describes coyote time, buffered jumps, correction, stored lift and wider wall-jump opportunities as ways to favor player intent. The useful lesson is to put difficulty in reading and performing a sequence while keeping individual contacts dependable. [Celeste and Forgiveness](https://maddymakesgames.com/articles/celeste_and_forgiveness/index.html).

A consistent physical foundation also helps objects compose. Thorson's [physics article](https://maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html) describes explicit actor/solid carrying and pushing rules. Bladefall needs similarly clear contracts across its blade, cargo, carriers and portals; matching Celeste's exact constants is not the objective. Camera look-ahead, hazard contrast, animation, sound and retry duration then make those contracts perceptible. The B52 cover cues and B53 tide gauge address concrete examples, not the entire feel gap.

Finally, a room bank does not yet provide a curated learning progression. Celeste's designer explicitly treats arranging stages into larger areas as part of the design work. Our five-run plan organized development experiments; it did not automatically create an equivalent player curriculum. [GDC session overview](https://gdcvault.com/play/1024307/). Campaign placement, teaching order, optional mastery routes and difficulty distribution remain later work after these candidate reviews.

We have a useful interaction vocabulary and several rooms you want to keep. We have not yet established that their movement, readability and progression consistently produce the experience you want. The next improvement should be judged by a player's increasing control over a demanding, readable sequence—not by another feature list, a larger map, or a larger count of passing tapes.

## Ending difficulty clarification — 9 October 2026

The user clarified that earlier criticism concerned endings they could not execute despite many attempts, not a preference for easy finishes. A final action may be the hardest part of a room. Preserve that difficulty when the controls, collision and timing are dependable. Nearby successful timing variants are useful author evidence, but human review still decides whether the execution is practical and fun. Campaign placement, teaching order, optional mastery routes and the difficulty distribution remain later work after candidate reviews.
