# Precision Core — a puzzle-platforming engine for Bladefall

7.245.0, 29 September 2026; Part II added in 7.246.0 and Part III in 7.247.0 (69 rooms in 30 chapters); Part IV · Foes (levels 30–49, 22 rooms) merged in 7.250 — see [FOES.md](FOES.md); Part V · Portals (levels 50–59) and the optional Momentum run X1–X5 in 7.252 — see [PORTALS-AND-MOMENTUM.md](PORTALS-AND-MOMENTUM.md). Open it from **Title → Precision Courses → Precision Core · new physics**, or directly at `precision.html`. It is a separate page with its own engine. The campaign, the existing precision courses and the Workshop are unchanged.

## Why a separate engine

A Celeste room is a question you answer by looking, then execute. That only works if the player can predict exactly where a jump or dash lands. [PUZZLE-GAP.md](PUZZLE-GAP.md) found three reasons the existing engine can't support that:

- the view depends on the window size;
- positions are floating-point;
- each Workshop device writes its own velocity, with per-room exceptions such as `noDashFlight`, direction chords and bespoke vault impulses.

The Precision Core fixes the foundation:

- **One fixed screen per room.** Every room is 320×184 (40×23 tiles of 8 px), scaled by a whole number, so every player sees the same room.
- **Integer positions.** Each position is whole pixels plus a sub-pixel remainder. Actors move one pixel at a time and stop at the first collision.
- **Deterministic timing.** It runs at a fixed 60 Hz, and every timer is a frame count, so the same input tape always produces the same run.
- **Scarce dash.** There is one dash, and it refills only on the ground, from a crystal, or from a struck seed pod. It does not recharge on a timer.
- **No special cases.** Objects answer the same few verbs: stood on, dashed into, struck, grabbed or carried. No object writes a one-off launch.

## Movement

The constants follow the values published in Celeste's released `Player.cs`. The implementation is new code: `public/bladefall-pcore.js`.

| Quantity | Value |
|---|---|
| Run | 90 px/s, accel 1000, air control ×0.65 |
| Jump | −105 px/s, +40 horizontal boost, 12-frame hold, half gravity near the apex while held; full jump rises 27 px |
| Gravity / fall | 900 px/s², max fall 160 (240 holding down) |
| Dash | 240 px/s for 9 frames after a 3-frame freeze; ends at 160 px/s; 8 directions |
| Climb | 110 stamina; climbing up costs ~45/s, holding still 10/s, a climb-jump 27.5 |
| Hitbox / hurtbox | 8×11 / 8×9 — the feet cannot be hurt |

### Forgiveness (measured by the verification script)

- **Coyote time:** a jump is still accepted for 5 frames after walking off a ledge.
- **Jump buffer:** a jump pressed up to 4 frames before landing still happens. Presses made during the dash freeze are remembered.
- **Dash aim:** the dash reads its direction when the freeze ends. If no direction is held by then, it uses the direction held at the press.
- **Upward corner correction:** a jump that clips a ceiling corner by up to 4 px slides past it.
- **Dash corner correction:** a horizontal dash that clips a ledge by up to 4 px slides over or under it.
- **Wall jumps:** they work from 3 px away. Super wall jumps (wallbounces) work from 5 px away.
- **Momentum:**
  - Wall-speed retention lasts 4 frames.
  - Lift momentum from moving blocks is stored for 10 frames.
  - The climb-jump stamina refund applies if you press away within 0.2 s.
- **Spikes:** moving the way a spike points is safe.

### Tech that nobody designed

These moves are consequences of three general rules, not special cases:

- a dash sets your speed;
- a jump during a dash keeps it;
- touching the ground returns your dash.

The moves that follow:

- **Super:** jump out of a ground dash, reaching 260 px/s.
- **Hyper:** jump out of a down-diagonal ground dash, reaching 325 px/s with a low arc.
- **Wavedash:** a hyper started from a jump.
- **Ultra:** landing mid-dash multiplies speed by 1.2.
- **Wallbounce:** an up-dash beside a wall, then jump.

The optional **Momentum** chapter makes the super and the hyper the only answers to two rooms.

## Objects

| Glyph | Object | Verb → consequence |
|---|---|---|
| `o` | Crystal | Touch → returns a spent dash (or a tired grip). **Ignores you if you have nothing spent.** Respawns in 2.5 s |
| `b` | Seed pod | Strike → throws you away from the cut and returns your dash |
| `x` | Bell | Strike → flips the cyan/amber machinery without dashing |
| `c` / `G` | Tally stone / gate | Touch **or cut** every stone → the gate lifts |
| `A` / `B` | Cyan / amber machinery | Every dash flips which colour is solid. A block that would appear inside you waits until you leave |
| `K` | Slide stone | Dash into a face → it runs that way until something stops it, and stays there. You rebound; the dash is spent |
| `Z` | Zip block | Stand on it or hold its side → it runs to its mark, pauses, crawls home. Jump at the stop to keep its speed |
| `l` | Seed lantern | Grab to carry: slow fall, no dash, no climbing. Throw it, set it down, or roll it. If lost, it floats home |
| `_` / `H` | Plate / plate gate | Anything resting on the plate holds its gate open |
| `~` `s` `*` `=` `M` | Crumbling stone, spring, shard, one-way platform, one-way block | Engine support exists; not yet used in a room |

## Chapters and the question each room asks

Every puzzle room has a tempting wrong strategy that the verification script tries and shows failing.

| Room | Question | Wrong answer that fails |
|---|---|---|
| **Footing** — First Steps, The Dash, Ground Again | Teaching: jump, climb, dash; the dash returns on the ground | — |
| **One Dash** · Green Glass | Two dashes over one pit: where does the second come from? | Any single dash (242 variants) |
| · Height First | The ledge is out of reach: spend the dash going *up* to the crystal first | Dashing toward the ledge (363 variants) |
| · Spend It Low | Thorns guard the wall's base and a gap waits at the top. The crystal at the lip only pays back a dash you already spent | Climbing without dashing; the top gap without the refund |
| **The Blade** · Seed Pods / Above It | Pods return the dash; to pogo you must first be above the pod | — |
| · Cut Back | Under a thorn ceiling a pogo kills you: strike the pod *behind* you to be thrown forward | Any single dash |
| **The Tally** · Tally / Beyond the Thorns | Stones you cannot touch can be cut: from the edge, or down into a slot | — |
| · Last One Home | The high stone is only reachable on the way *down* | Dropping first, then trying to recover it from the pit (210 variants) |
| **Switchback** · Cyan and Amber | The dash that carries you also flips the floor | — |
| · Count | Your crossing dash would erase the cyan landing: flip it once on safe ground first | Crossing directly (220) |
| · The Bell | You stand on cyan, so you can't pre-flip on the ground: spend the flip in the air with the bell | Plain dash (220), plain jump (176) |
| **Slide Stones** · Stepping Stone | Push the stone out to the post; it becomes your footing | Crossing without the stone (320) |
| · A Step Up | The stone is the step; a floor nub is visibly too short | Every climb without moving it (434) |
| · Down the Well | Park the stone over the thorned shaft, then plunge it so it covers the thorns | Every descent without the plunge |
| **Seed Lantern** · Seed Lantern / The Plate | Carrying trades the dash for a float; a plate holds a door | Crossing without the lantern (520) |
| · Under the Door | The plate is *beyond* the gate: roll the lantern under the gate's slot | Every way past without it |
| **Hold On** · Ride | Jump as the zip stops to keep its speed | Reaching the ledge without riding |
| · Wait for It | A thorn ceiling makes the top lethal: hold on to the side until it clears | Riding on top; jumping or dashing across |
| **Summit** · Full Hands | You cannot flip the machinery while carrying: set the lantern down, dash, pick it up | Gliding the amber gap in the wrong phase (180) |
| · Machine Step | The dash that pushes the stone also flips the stopper that should catch it: flip once first | Pushing directly sends it to the far stopper (62) |
| **Momentum** (optional, listed last) · Super / Low Road | Only a super spans the pit; only a hyper or wavedash fits under the ceiling | Jump + dash (720 each); super under the ceiling (208) |

A variant count is how many input tapes of that family were tried. That is evidence against the obvious bypasses, not a proof that no other route exists. Thorson's rule applies: alternate solutions are fine when they are found on purpose.

## Part II — The Deep Climb (7.246.0)

Ten more levels, 21 rooms, easy to medium. No new objects: every room combines two or three ideas from Part I, and each has a tempting wrong answer that the verification script shows failing. The chapter menu now groups chapters into Part I, Part II and Optional.

| Level · room | The question | Wrong answer that fails (tries) |
|---|---|---|
| **Round Trip** · There and Back | Cross on a crystal, light the far stone, and wait for the same crystal to grow back before crossing home | Any single dash (462) |
| · Hang Time | The crossing spends both dashes. Glass on the wall pays one back for the stone, and the first crystal catches your fall on the way back | Climbing without the stone (144) |
| **Thorn Garden** · Pollen Count | Pods return the dash, so spend it on the high stone and let the next pod refund it | The chain alone (26) |
| · Cut Back Twice | Two cut-backs; the second cut lights a stone beside the pod as it throws you on | One dash (242) |
| **Gears** · Glass Counts Too | The crystal's dash is a flip too: two dashes bring the amber landing back to a ghost, so flip once first | Crossing directly (1792) |
| · Read the Colors | Read each hop: plain jump, dash hop, or a long hop that needs a dash **and** a bell to undo it | The long hop without the bell (810) |
| **Masonry** · Far Stone First | Push the tall far stone to the nub first; the near stone first jams everything | Near stone first (242) |
| · Bell Stop | Your push erases your own cyan ledge and the cyan stopper. Ring the bell as you rebound to bring back both | Pushing without the bell (32) |
| **Lamplight** · Hold the Door for the Light | Stand on the near plate and throw the lantern through the open gate onto the far plate, then carry it down the long glide | Leaving it on the near plate (288) |
| · Separate Ways | You cannot carry the lantern up a step you must dash, so throw it ahead, dash after it, and glide it down to the gate's plate | Carrying it up (210) |
| **Rails** · Zip Tally | Hang under the thorns past one stone; at the stop, leap for the high stone before the zip crawls back | Skipping the high stone (21) |
| · Handoff | Ride one rail to a second that rises into thorns, hang on its side, and wall-jump off at the top | Any apex-dash skip (544) |
| **Foundry** · Stone Cart | Set the lantern on the slide stone and push the cart across the pit you can only dash | Leaving the lantern (440) |
| · Lamp Down the Well | Plug the thorned well first (you cannot dash while carrying), then glide the lantern down. Or let the stone carry it | Going down without it (11) |
| **Keep of Tallies** · Sealed | Stones sealed inside cyan and amber pillars: open each colour to reach its stone | Walking past (42) |
| · Stepping Tally | The pushed stone is the only floor under the high stone | Crossing without it (176) |
| **Clockwork** · Zip Colors | Ring bells as you ride so each wall is gone when you reach it | Riding without bells (336) |
| · Bell Tower | A dash turns the next floor solid over your head. Ring the bell at the top of each jump instead | Dashing up (2016) |
| **Second Summit** · The Counted Crossing | Amber stone, crystal, cyan landing: the crystal's extra flip must be taken back with the bell | Crossing without the bell (840) |
| · Lantern Line | Ride with the lantern, throw it at the top of a jump off the moving rail so its speed carries it up, dash after it | Leaving the lantern (312) |
| · The Deep Climb | The pod climb uses two dashes, so the amber is gone when you arrive. Flip once on the step first | Arriving without the extra flip (4224) |

**One engine fix:** touching pieces of the same machinery colour now act as one body. A stone sealed inside a pillar splits it into rectangles, and they all wait together while anyone is inside. Previously the side pieces could turn solid around the knight.

## Part III — The High Road (7.247.0)

Ten more levels, 21 rooms, medium to hard. Still no new objects and no engine change. The step up comes from three places:

- **Rules that were always true but never asked for.** Down is a push direction. A lantern inside machinery holds it open. Only a lantern fits where a knight does not.
- **Longer counts.** Every push is a dash and every dash is a flip, so a room can hinge on the parity of three or four flips.
- **Tighter execution.** Launch jumps off a zip's stop, a mid-air grab of the lantern off a moving rail, and climbing a wall your own dash just made solid.

| Level · room | The question | Wrong answer that fails (tries) |
|---|---|---|
| **Glass Maze** · Unbroken | Pass the glass with your dash still full, so it is whole for the return: dash out, light the stone, and let the glass refill you on the way home | Dashing before the glass (4800) |
| · Glass Ladder | Glass takes 2.5 s to grow back. Hang on the wall until the glass you used is back, then climb glass to glass | Leaving the wall early (27) |
| **Cutting Garden** · Downstroke | Under a thorn roof, up-cut a pod overhead to drop and reload; pogo the low one | Pogo-and-dash without the up-cuts (2310) |
| · Double Cut | One swing catches a pod and a bell together: your dash back and a flip at once make the amber real | The pod alone (1848) |
| **Parity** · Inside Out | Jump into a ghost block and flip. It waits for you to leave, then it is solid under your feet: climb a chimney of them | Dashing up from outside a ghost (123) |
| · Ghost Wall | Dash at an amber ghost and your own flip turns it into the wall you grab. Climb it, then dash off onto cyan | Crossing without climbing it (1920) |
| **Heavy Stone** · Plumb | Dash down onto a hanging stone: it drives into the thorns and becomes the floor you jump from | Any route without the plunge (5166) |
| · Across, Then Down | Push the stone across to the roof, reach it through the glass, then drive it down | Plunging it where it hangs (400); going on from the high stone (1056) |
| **Lamp Keeper** · Lamp Stairs | You cannot climb holding the lantern. Throw it up each step at the top of a jump, climb after it, then glide or throw it to the plate | Carrying it up a step (1760) |
| · The Slot | Throw the lantern through a gap too low for you, go over the wall through a dash-only gap, and meet it | Carrying it over (3520) |
| **High Wire** · Slingshot | Jump as the rail stops to keep its speed, then dash up to the shelf | Without riding the rail (7056); jumping off early or late (1152) |
| · Relay | Launch off a rail, reload on glass mid-flight, grab the side of a rising block, and ride it to the sill | One dash only (6144) |
| **Stonewright** · Mason's Count | The push is a flip, so the stone stops at amber. The glass route adds two more flips. Cut the tally with the blade, which flips nothing, and a fourth flip brings the cyan landing back | Skipping the stone, or stopping it at cyan (3600) |
| · Sealed Step | Ring the bell before the push, so the stone stops at the cyan post under a tally sealed in amber. Dash up into the amber as it opens | Pushing without the bell (1680); lighting the tally in flight from the hanging stone (3360) |
| **Lantern Rails** · Lift and Toss | With the lantern in hand, the lift cannot get you onto the shelf. Toss it from the top of the launch, then ride again and dash | Carrying it up (2928) |
| · Under the Roof | The lantern rides a rail under a roof too low for a knight. Hold the rail's side, then snatch the lantern off it at the end of the ride | Riding on top with it, or throwing it (1211) |
| **The Engine** · Upstroke | Dash up into the hanging stone so it stops under a single amber block. Use the pod to climb onto it, then flip onto cyan | Going for the shelf from the pod (18144); flipping before the push (1) |
| · Doorstop | Machinery cannot close while the lantern is inside it. Open the cyan wall, leave the lantern in it, and push: the stone slides through the held wall to the cyan post | Any push without the lantern in the wall (704) |
| **Third Summit** · The Push Counts | Push the stone over the shaft (one flip) and drive it down (two). Cyan is solid when you land, so hop to it, then dash to amber | A dash on the way onto the stone (864); dropping down the open shaft (756) |
| · Last Lamp | Throw the lantern through the slot, climb the high wall, and toss it up the step onto the plate | Carrying it over (1408) |
| · Third Summit | Launch off the rail, dash at the amber ghost to make it a wall, climb it, flip onto the cyan sill, and go out the top | The launch alone (1617) |

**What the sweeps caught while building Part III:**

- **Plumb.** Walking off the hanging stone and dashing late under the roof reached the exit floor (2 in 18,606). Moved the floor two tiles out.
- **Mason's Count.** The route needs four flips. Refilling on the stone means the player can always fix the parity, so the room teaches counting rather than punishing a miscount.
- **Sealed Step.** Standing on the unpushed stone, a player could light the sealed tally in flight and land on the cyan post. The post is now thorned on top.
- **Relay.** Launching from the full-length rail reached the tall block without the glass (9,584). A search over rail length and crystal position chose a 6-tile rail with the crystal at (22,14): 441 intended runs, 0 without the glass.
- **Slingshot.** A search over shelf height and column chose (12,32): 174 intended, 0 without the launch.
- **Lift and Toss.** A carrying knight could land on the shelf's near end (2 in 2,928). The shelf now starts two tiles further out.
- **Last Lamp and the first Lantern Rails draft.** Two lift-based designs failed. In one, the launch carried the lantern over the wall as easily as a dash did. In the other, no route reached the shelf at all. Both were replaced.
- **The Push Counts.** The first version, where a dropped stone bridged into a tunnel, was bypassed by falling past the stone with one dash (422 in 3,570), which has the same parity. It became a shaft through a slab: the only way into the tunnel is down the shaft behind the stone.
- **Upstroke.** The pod was closer to the cyan shelf than the stone was (51 in 72,073 skipped the stone). The pod now sits on the far side of the stone.
- **Unbroken.** The earlier count of 34 accepted "alternate solutions" was a checker error. Lighting the stone, dying and respawning at home had counted as a return. Every state-based check now requires no deaths, and Unbroken's early-dash family is 0 in 4,800.

## Presentation

- **Dash state on the knight.** The plume and scarf are ember when the dash is ready, slate when spent, and flash white when it returns. Low stamina strobes the tunic red.
- **Feel.** Dash freeze frames, squash and stretch, dust, afterimages and small screen shake. Shake can be turned off.
- **Readable devices.** Each device has a distinct silhouette:
  - carved rune stones;
  - bars with a pip for each unlit stone;
  - chevrons on slide stones;
  - a dotted zip track to a marked target;
  - a dashed line from plate to gate;
  - a solid versus dotted outline for machinery.
- **Rooms read as carved spaces.** Masonry backwall sits next to rock, and roots hang under overhangs.
- **Hints.** Hint text appears only in rooms that introduce a control or an object, and it names the rule, never the sequence.
- **Assist.** Infinite stamina and game speed from 50 to 100%.
- **Review aid.** The pause menu can jump to any room or play the room's intended route. The music is *Crystalline Trials* from the owner's set.

## Files and tools

- `public/precision.html` — the page.
- `public/bladefall-pcore.js` — the simulation. It has no DOM, and Node and the browser share it.
- `public/bladefall-pcore-rooms.js` — chapters and ASCII rooms. The glyph legend is at the top.
- `public/bladefall-pcore-tapes.js` — one intended input tape per room.
- `public/bladefall-pcore-view.js` — renderer, input (keyboard and standard gamepad), audio, menus, save (`localStorage` key `bladefall.pcore.v1`).
- `npm run verify:precision-core` (`scripts/verify-precision-core.mjs`) runs 204 checks:
  - movement rules measured against constants;
  - every route replays to its exit with no deaths, deterministically;
  - every wrong-strategy family fails.
- `node scripts/pcore-validate.mjs` checks room shape.
- `node scripts/pcore-tape.mjs <room> '<tape json>' [every]` prints a trace and an ASCII picture of a run.
- `scripts/pcore-plan.mjs` is the staged planner used to author the tapes.

## Limits

- **No human playtest yet.** Automation shows each room is solvable, deterministic, and closed to the obvious bypasses. It does not show that a room is fun or has the right difficulty.
- **Input.** There are no touch controls and no co-op, and key rebinding is not shared with the main game's settings.
- **Audio.** Sound effects are synthesized placeholders.
- **Separate from the campaign.** Rooms are not placed in the campaign, and the campaign's own movement is untouched. Migrating campaign traversal to this core is the next decision after playtesting.
