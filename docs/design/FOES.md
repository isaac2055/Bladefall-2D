# Part IV · Foes: both combat sets, merged (7.250.0)

Part IV is levels **30–49** of the Precision Core. It merges the two independent answers to Isaac's combat brief (Hollow Knight + Celeste + Nine Sols: one weapon plus a parry, small fry that take part in puzzles):

- Claude's **Foes**: moth, shellback, spitter, ram and husk. Built in `bladefall-pcore-foes.js`.
- The **Combat actors** from the other session (ChatGPT/Codex): guard, wing, sentry, hound, coils and cracked masonry. Built in `bladefall-pcore-combat.js`; their original rules are in [COMBAT-ROOMS.md](COMBAT-ROOMS.md).

Where the two sets overlap, both versions are kept as design variations. Future levels can use either or both in the same room.

- **Levels 30–39:** the easier ones.
- **Levels 40–49:** the harder ones, capped at the difficulty of The Living Stair and Stepping Ram.

Play: **Title → Precision Courses → Part IV · Foes**, or `precision.html?foes=1`.

## What was kept and cut (Isaac's calls)

| Overlap | Kept | Cut or changed |
|---|---|---|
| Pogo a flier for a dash | **Moth Wing** (Claude) | Borrowed Wings (GPT). Wings still appear in Keep the Landing and The Living Stair |
| Aim a returned shot up at a high target | **Aim Above** (GPT): an enemy is more immersive than a bare target | Bank Shot (Claude), rebuilt as a strict-schedule room at level 48 |
| Bait a charge into a breakable wall | **Make a Breach** (GPT) | Bait (Claude). The ram is used later to stun |
| Return a bolt | Both, as one level: GPT's *Return to Sender* (straight back into a coil), then Claude's *Up the Shaft* (aimed up into a husk) | — |
| Second Wind was too easy | Reworked: the first shot comes almost at once, a second falling line is added, and a platform sits between them. Each crossing needs its own mid-air parry | — |

## Shared rules (the engine merge)

- **One parry.** The core arms it: `parryStep` in `bladefall-pcore.js`, using GPT's timings.
  - A press arms a 9-tick ward. A whiff costs 18 ticks. A success ends the ward at once, clears the cooldown, returns the dash and freezes the game for 3 ticks.
  - The direction held **at the press** aims a returned projectile. With nothing held, the projectile goes straight back.
  - Both foe modules read the same `parryTimer` and `parryAim`, so a press is answered once, whichever set's attack meets it.
  - The move changed nothing for GPT's rooms: all nine recordings replay frame-for-frame identically.
- **Study beat.** Every Part IV room waits, still, until the first input: study the room, then act. The core owns this as `g.awake`. Foes keep their own clock from that moment, so a rhythm can be learned and replayed.
- **Contact rule.** Attacks hurt: thrusts, dives, charges and hostile bolts. Bodies hurt only if **thorned**, and a thorned body always wears pale spikes on a dark outline, in the same colour as tile thorns.
  - A shellback is thorned; flipped belly-up, it is safe.
  - Any foe placed with `thorns:true` is thorned (a thorned moth is a ready variation).
  - Moths, spitters, walking rams and all of GPT's actors are plain and safe to touch.
  - A charging ram's horns glow, the same as an active Combat weapon.
- **Returned shots cross between sets.**
  - A GPT shot returned by a parry breaks husks, flips shellbacks, dazes rams, fells moths and spitters, and lights tally stones.
  - A foe bolt returned by a parry powers coils and damages GPT's enemies.
  - Both ring bells.
- **Charges break both kinds of wall.** A hound breaks a husk, and a ram breaks cracked masonry.

## Enemy variations

| Role | Claude's | GPT's |
|---|---|---|
| Flier | **Moth**: drifts on a fixed line; a cut fells it and rebounds you | **Wing**: patrols, tells, then dives at you; intercept it for a pogo or an air parry |
| Shooter | **Spitter**: fixed direction, fixed rhythm, swells before each shot | **Sentry**: aims at you when its tell starts and locks that line |
| Charger | **Ram**: a parry stops it dead into a solid step (2.5 s); the blade glances off it | **Hound**: commits to a charge; a parry stops it early |
| Wall | **Husk**: a returned projectile or a charge breaks it | **Cracked masonry**: a charge breaks it |
| Door | Tally stones with `G` gates, and husks | **Coil gates** (returned shots only) and **ward gates** (open when the linked enemy falls) |
| Only one version | **Shellback**: pogo off its thorned back, or cut it from the side and it flips into a step | **Guard**: shield front; a parry exposes it; a side cut finishes it |

## The twenty levels

The wrong-answer counts come from `npm run verify:precision-core` → "Part IV". GPT's rooms are also covered by `npm run verify:combat-rooms`, which checks that removing their key action breaks each route.

| # | Level · room | Origin | The question | Wrong answer that fails (tries) |
|---|---|---|---|---|
| 30 | An Opening | GPT | Which side of a guard opens after its thrust? | *(combat checks)* |
| 31 | Moth Wing | Claude | Too wide for one dash: what gives it back? | One dash, or one moth (5976) |
| 32 | Return to Sender · Return to Sender | GPT | A returned bolt powers the coil | *(combat checks)* |
| | · Up the Shaft | Claude | Aim the return up into the husk | Cutting, dashing, or returning it straight (858) |
| 33 | Aim Above | GPT | Where to stand for the return to reach the high coil | *(combat checks)* |
| 34 | Make a Breach | GPT | Bait the hound through the masonry | *(combat checks)* |
| 35 | Belly Up | Claude | Flip the shellback where you need the step (a pogo also works) | The ledge from the floor (2016) |
| 36 | Stand Your Ground | Claude | Dodge the ram and it dazes itself uselessly; parry it under the shelf | Dodging (2064) |
| 37 | **Shieldbreaker** (new) | both | A sentry's shot, aimed ←, fells a guard out of blade reach, shield or not. Two returns | The blade (1344); sending shots home (41) |
| 38 | **Knock It Over** (new) | both | A returned sentry shot flips the shellback on the ledge you must land on | Crossing without dealing with it (672) |
| 39 | **Moth and Coil** (new) | both | Cross on moths, then return a sentry shot up into the coil | One dash (2178) |
| 40 | Keep the Landing | GPT | Two wing pogos without dashing away the cyan footing | *(combat checks)* |
| 41 | Shell Road | Claude | Pogo one shellback, flip the other | Without the first shellback (924) |
| 42 | Leave the Light | GPT | The lantern holds the plate so your hands can parry | *(combat checks)* |
| 43 | The Passing Shot | GPT | Return a shot from a moving rail | *(combat checks)* |
| 44 | Second Wind (reworked) | Claude | Two falling bolt lines, one mid-air parry each | Reaching the platform without a parry (4928); crossing from the platform on one dash (616) |
| 45 | Two Angles | GPT | Flip the machinery to open a line of fire; power both coils | *(combat checks)* |
| 46 | Stepping Ram | Claude | Parry the ram as a step, then pogo the moth | Without the dazed ram (7344) |
| 47 | Hunting Ground | Claude | Let the charge break the husk, keep the bow alive, bank a parry into the stone | Parrying the charge (363); sending a bolt home (121) |
| 48 | **Wardens' Hall** (new) | both | Parry the ram into a step up to the gallery, get past the shellback, parry the guard and cut it | The gallery without the ram (4992) |
| | **Bank Shot** (new, strict schedule) | Claude | Leave the ledge on the spitter's beat and parry up-right in mid-air. The bolt lights the stone, and the refilled dash carries you under the roof and through the gate | One dash (1764); any parry from a ledge (405); lighting the stone by hand (2728) |
| 49 | The Living Stair | GPT | Guard, wing, rail and a final returned shot | *(combat checks)* |

On difficulty: the new hard rooms stay within the brief's cap.

- **Wardens' Hall** asks for five sequential answers (parry, climb, pogo or flip, parry, cut), the same count as Stepping Ram. None of them is a new kind of input.
- **Bank Shot** is short, but its jump is timed against a learnable rhythm. After the study beat, the spitter always fires on the same count, and it swells before every shot.
- I tried to measure difficulty from each room's input timing windows, but the measure gave one-frame windows even in the easiest rooms, so it proved nothing. Only a playtest can confirm the ordering.

## Files

- `public/bladefall-pcore.js`: the core engine. It owns the shared parry (`parryStep`, `parrySuccess`, `PARRY`), the study beat (`g.awake`), the foe hooks and `foeSolid`.
- `public/bladefall-pcore-foes.js`: moth, shellback, spitter, ram and husk. It exports `projectileHit` and `breakProxy` for the Combat actors.
- `public/bladefall-pcore-foes-view.js`: foe sprites, thorn outlines and the ward (drawn to match the Combat view's).
- `public/bladefall-pcore-combat.js`: GPT's actors, now reading the core's parry and study beat. It exports `projectileHit` for foe bolts.
- `public/bladefall-pcore-combat-rooms.js` and `-combat-tapes.js`: GPT's nine rooms. The chapters file places them by id (`{ref:'combat-01'}`), and this file resolves those slots.
- `public/bladefall-pcore-rooms.js`: generated. It holds Part IV's twenty chapters and Claude's rooms (`foes` lists, with `combat` defs where both sets appear).

## Limits

- **No human playtest yet.** Parry feel, the width of the ward, and whether tells and thorn outlines read at speed can only be judged by hand.
- **Placeholder audio.** The sounds are synthesized placeholders shared by both sets.
