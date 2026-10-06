# The Fractured act, made hard (7.280 brief)

Isaac, 2026-10-04: *"The fractured levels are not hard enough — they should be significantly more difficult than the
base game and get harder from fractured outskirts onwards."* And: *"the momentum moves … I'd like for them to be
reserved for the fractured levels."* And: *"Some additional/new/creative mechanics should also be added to fractured
levels."* This brief is what the Fractured authors (regions 21–40) follow. Devices and their exact fields are in
the device section at the end; teaching rooms for each are in `scripts/pcore-lab/rooms.mjs`.

## 1. What "harder" means here, measured

Harder means **more linked decisions with fewer rests**, and **more devices asking things of each other** at once.
It does not mean longer rooms. Measure every room you author with:

```
node scripts/pcore-lab/difficulty.mjs <region> ...      # per room: presses, chain, stops, run, tech
```

- **chain** is the most presses (jump, dash, grab, tear ride) between two *safe stops*. A safe stop is ground where
  standing still for a second does not kill you. A cracking fault, a deck, a shade on your heels or a timed slab
  is not a stop. This is the "linked decisions" number.
- **stops** is how many separate rests the route passes. **run** is the longest stretch (frames) between two rests.

Measured on 2026-10-04 (means per room; the Fractured act today is *not* harder than the base, so the claim was right):

| stage | regions | presses | chain (max) | stops | run (frames) | momentum rooms |
|---|---|---|---|---|---|---|
| base | 1–4 | 4.8 | 3.0 (10) | 2.8 | 92 | 1/49 |
| base | 5–8 | 3.7 | 2.3 (7) | 3.5 | 80 | 0/47 |
| base | 9–12 | 3.3 | 1.9 (5) | 3.0 | 69 | 0/51 |
| base | 13–16 | 4.1 | 2.8 (13) | 2.6 | 74 | 0/54 |
| base | 17–20 | 2.8 | 2.0 (8) | 2.6 | 68 | 12/50 |
| fractured now | 21–24 | 4.6 | 2.4 (8) | 3.3 | 117 | 0/46 |
| fractured now | 25–28 | 3.8 | 2.2 (7) | 3.6 | 80 | 0/49 |
| fractured now | 29–32 | 3.3 | 2.0 (5) | 3.0 | 69 | 0/49 |
| fractured now | 33–36 | 4.1 | 2.8 (13) | 2.6 | 74 | 0/54 |
| fractured now | 37–40 | 2.8 | 2.0 (8) | 2.6 | 68 | 12/50 |

Presses count movement only (jump, dash, grab, a tear ride); strikes, parries and portal shots are not counted, so
judge boss and combat rooms by section 4 as well as by these numbers. 25–40 measure the same as 5–20 because they are
its reflections.

### Targets (every Fractured region must also beat its own base region's mean chain by at least 2, and beat the Fractured region before it)

| stage | regions | mean chain | hardest room chain | stops per room | devices asking at once | new in the stage |
|---|---|---|---|---|---|---|
| I | 21–24 | ≥ 4 | ≥ 7 | ≤ 3 | momentum tech + the region's base device | the four momentum techs, one per region |
| II | 25–28 | ≥ 5 | ≥ 8 | ≤ 3 | 2 | fault lines (25), the shade (27) |
| III | 29–32 | ≥ 6 | ≥ 9 | ≤ 2.5 | 2–3 | mirror panes (29) |
| IV | 33–36 | ≥ 7 | ≥ 10 | ≤ 2 | 3 | tear variants: blinking, spent, chained over faults (33) |
| V | 37–40 | ≥ 8 | ≥ 12 (40: ≥ 14) | ≤ 2 | momentum + 3 | nothing new: everything, back to back |

- **One rest room per region at most** (a room whose chain is ≤ 2), placed before the boss.
- **Timing:** by play, every required press has at least 4 frames of slack in stages I–II and at least 3 in III–V.
  Never 1–2 (frame-perfect). Test it: take the found route, press the key 3 frames early and 3 late in the view
  (`?pitch=rbr&region=N`), or nudge the tape and re-run `rbr-find --start`.
- **Every section mandatory** (Isaac's rule holds here too): `rbr-skip <room> --without <device-event> --plain`
  finds no way past a device you introduced (device events: `zip-in`, `fault-crack`, `mirror`; the shade cannot be
  skipped, only outrun).

### What "harder" must NOT mean

- **No blind jumps.** Every landing is on screen before you commit, and every hazard is drawn before it acts.
- **No luck.** Everything is on fixed clocks; nothing random; the same input always does the same thing.
- **No softlocks.** No device state may strand the knight: fallen fault stone comes back, a spent tear comes
  back on retry, and a mirrored knight can always reach a pane or finish swapped.
- **Nothing a player cannot read.** Fault tiles glow as their fuse runs; the shade shows the path it will walk;
  the mirrored state is on the knight and on both screen edges; a shut tear is a dotted scar.
- **Not longer.** A long empty corridor between two hard moves is not difficulty. Raise *chain*, not *frames*.
- **No unteachable tech.** Each momentum tech is taught alone (one room), then chained, in stage I, before any later
  room needs it. A base room never needs one.
- **No air AOE.** Enemy ground attacks stay on the floor; a knight in the air is answered with a projectile.
- **Echo quests stay** exactly as they are: `q.needs` = the base quest's keepsake id (sealed until held), its own
  remembrance keepsake, its echo lines. Harder rooms inside an echo are fine; the gate and reward are not changed.
- **Regenerated is not redesigned.** Regions 25–40 came out of `scripts/rbr-src/fracture.mjs` as reflections. Keep a
  reflected room only if it meets the stage targets after you add to it; otherwise rebuild it.

## 2. Momentum belongs to the Fractured act

The core's momentum techs (all in `public/bladefall-pcore.js`; Precision Core's optional Momentum chapters X1–X5,
rooms `x1 x2 xm2 xm3 xm4 xm5`, teach them):

| tech | input | core rule | event |
|---|---|---|---|
| **super** | jump while a ground dash (level) is still running | `superJump`: 260 px/s across, a full jump up | `super` |
| **hyper** | dash down-diagonally into the floor, jump | super with ×1.25 across, ×0.5 up: low and very long | `ultra` then `hyper` |
| **wavedash** | a hyper started from the air (land the down-diagonal dash, then jump) | as hyper | `ultra` then `hyper` |
| **ultra** | land during a down-diagonal dash (no jump) | the dash turns into a ground dash ×1.2 faster | `ultra` alone |
| **wallbounce** | dash straight up beside a wall (within 5 px), jump | `superWallJump`: 170 across, −160 up, long hold | `wallbounce` |

Also inherited, not "tech": wall-speed retention (4 frames), the climb-jump refund, lift boost off moving solids.

**Where each is taught, then used (stage I):**

- **21 Fractured Outskirts: super.** Alone (a gap only a super crosses, a flat runway, nothing else), then twice in
  a row, then off a crumbling road. Harder versions of `o1-ridge` (its road route uses two supers today).
- **22 Fractured Woods: hyper and wavedash.** A low roof only a hyper passes, then the airborne version (wavedash),
  then hyper into a pod cut. Harder versions of `c18-low`, `p19-low`. Secret pool: add `p113` (ultra+hyper ×2).
- **23 Fractured Causeway: ultra.** The faster ground dash off a landed diagonal, used to outrun a sliding stone or
  a lift; then ultra into super. Harder versions of `s17-buoy`, `p19-road`. Secret pool: add `p117`.
- **24 Fractured Updrafts: wallbounce.** Shafts with no handholds but a wall: dash up, jump. Then wallbounce into
  a thermal. Harder versions of the side routes `fm25-release#side`, `ff28-hearth#side`, `fi32-court#side` and the
  bearing route `o1-camp#bearing`.
- **25–36:** any tech may be asked, never as the only new thing in a room that also introduces a device.
- **37–40: the base momentum rooms move here, harder.** 37 Fractured Shores ← `s17-launch s17-super s17-belled
  s17-landfall s17-buoy`; 38 Fractured Colony ← `c18-speed c18-low c18-watch`; 39 Fractured Path ← `p19-low p19-road
  p19-gate`; 40 Fractured Palace ← `s20-deliveries` and all five techs back to back. (Their reflected copies
  `fs37-* fc38-* fp39-* fs40-deliveries` already carry the same routes: make them harder, do not just keep them.)
- **Climb secret pools (Precision Core rooms with momentum routes):** `p163 p165 p167 p168 p169` → World 37's pool,
  `p174 p175 p179` → 38, `p187` → 39, `p198` → 40, `p113` → 22, `p117` → 23. World 21's pool already holds the
  Momentum chapters (`x1 x2 xm2 xm3 xm4 xm5`): keep them there, they are the act's first lesson.

Base rooms whose current routes use momentum (scan on 2026-10-04; the base agent re-routes them with
`rbr-find --plain`): `o1-ridge` (road), `o1-camp#bearing`, `s17-launch s17-buoy s17-super s17-belled s17-landfall`,
`c18-speed c18-low c18-watch`, `p19-low p19-road p19-gate`, `s20-deliveries`. An earlier scan also named
`o1-lookout o1-cut#bearing o1-cracked o1-muster#bearing o1-yard m5-release#side f8-hearth#side i12-court#side`; they
no longer show momentum events. Re-scan with:

```
node --input-type=module -e "import {Rooms,sideRun} from './scripts/rbr-lib.mjs';const M=['super','hyper','ultra','wallbounce'];
for(const [k,t] of Object.entries(Rooms.tapes)){const id=k.split('#')[0],d=Rooms.all.find(r=>r.id===id);if(!d)continue;
const ev=sideRun(id,t).events.filter(e=>M.includes(e.type)).map(e=>e.type);if(ev.length)console.log(k,ev.join(' '));}"
```

## 3. Where the new devices go

One new device per region at most, introduced alone (one room, real void under it, a visible reward of progress),
then chained, then combined with the region's own base device. Teaching rooms to copy from: `scripts/pcore-lab/rooms.mjs`.

- **The tear (zipline, `lines`).** *Base 13 Void Tyrant* teaches it: one tear alone over the void (`lab-zip-1`),
  two chained with a perch between (`lab-zip-2`), then the main game's approach to the Tyrant: three back-to-back
  rides, each landing on a perch, a thorned face between each ride's ends so a dash chain cannot skip it, one ride
  rising. *Base 14 Abyss King*: tears with the echo (leave the echo, ride away, trade back) and a tear the King opens
  on a rhythm (`period`). *Base 15–20*: one or two rooms each where a crossing wants it (16 between decks, 17 over
  the tide, 19 across a beam, 20 on the dawn clock). *Fractured*: a known tool everywhere from 21; the variants
  (`period`/`upT` blinking, `once` spent, `oneWay`) arrive in 33 and are combined after: a chain of three tears
  whose perches are fault stone; a tear entered swapped; a tear the shade also rides (it arrives at the far mouth
  one delay after you, so do not wait on the landing).
- **Fault lines (`fault`, glyph `T`)** — 25 Fractured Marksman: perches that crack under a parry duel (stand, parry,
  go). Chained in 26 (fault + plates and the lantern) and 28; the Colossus' arena in 31; carts on fault track in 35.
- **The shade (`shade`)** — 27 Fractured Warden: jailers ahead, your own shadow behind. 28 Fractured Frostfell: ice,
  where stopping is hard and the shade is a second behind. 34 Fractured King: two shades (`count:2`).
- **Mirror panes (`mirror`, glyph `|`)** — 29 Fractured Sorcerer (the base's glass rooms `s9-glass`, `s9-gglass` are
  the place): each pane costs your dash, and the far side is swapped. 30 with the pour schedule; 32 Fractured
  Inversion with gravity prisms (both axes turned: the hardest reading test in the game); 36 with hook rings.

## 4. Fractured bosses

Each Fractured boss must be clearly harder than its base boss (shorter openings, more hits, less safe ground) and
add **one** new twist. The twists below are proposals: a boss author may pick a better one, but each boss gets one. New behaviour on an existing boss device is opt-in through a new room field, default
unchanged, so the base fight stays as it is.

| region | boss (device) | harder | the twist |
|---|---|---|---|
| 21 | Mile Sentinel (`sentinel`) | shorter stun windows | the bells are only reachable by a super off the hammer's landing |
| 22 | the Oath Root (`oathRoot`, `resinWind`) | resin timer much shorter | hyper under the root's lash to reach the crown |
| 23 | Armoured Brute (`combat`) | more hits, faster charge | ultra under the charge; his slam drops the far half of the floor |
| 24 | the Lung (`breathing`) | breath flips more often | the arena is a shaft: wallbounce between breaths |
| 25 | Marksman (`marksman`) | volleys from two perches | your parry perches are fault stone: parry, then move |
| 27 | Warden (`warden`, `jailers`) | jailers faster | your shade walks behind you, so no loops |
| 29 | Frost Sorcerer (`sorcerer`) | pools freeze sooner | mirror panes across the arena: return his shot while swapped (parry aim swaps too) |
| 31 | Ember Colossus (`colossus`) | more anvils | the arena floor is fault stone that his slams crack (on the floor, never in the air) |
| 33 | Void Tyrant (`tyrant`) | three bands each need two returns | he opens and closes tears (`period`): ride his own seam to the lit band |
| 34 | Abyss King (`crown`, `hand`, `wake`) | the Hand's openings shorter | your shade is the second body: a crown mark counts the shade (opt-in field) |
| 36 | Thunder Hydra (`chainHydra`) | heads bite faster | tears between heads; a head bites at a mouth on a rhythm |
| 40 | King in Daylight (`dayKing`, `hydraRide`) | the hardest fight in the game | mirror glass in his light: every device of the act once, in order |

## 5. Devices (exact fields)

All four are deterministic, run inside `Core.step` through the device hooks, turn over with a gravity prism, and
are seen by the route search's state key. A room that does not name the field is untouched.

- **Tear:** `lines:[{a:[c,r], b:[c,r], setDown, oneWay, once, period, upT, phase}]`. Tile coordinates of the two
  mouths; the mouth point is the knight's body standing on the floor below that tile. Dash with the knight's centre
  within 10 px across / 12 px up-down of a mouth (any dash that does not point away from the tear) and you ride to the other end at 400 px/s,
  untouchable by thorns. Out of the far end: dash back; a level or falling ride throws you 220 px/s along the line
  (no air drag for 24 frames); a climbing ride keeps a third of that and a −110 hop; `setDown:true` sets you down
  (30 px/s nudge). Events `zip-in`, `zip-out`. Lines must not cross rock (the ride ignores it). Reflecting a room:
  `c → cols−1−c`.
- **Fault stone:** glyph `T` + `fault:{fuse:12, spread:6, rest:120}` (frames, all optional). Touch from any side →
  that tile falls after `fuse`, each joined tile `spread` frames later per tile of distance; back after `rest`.
  Events `fault-crack`, `fault-fall`, `fault-back`.
- **Shade:** `shade:{delay:60, count:1, gap:40}`. From your first input, a shade walks your exact path `delay`
  frames behind (more shades every `gap`); touching one kills (6×8 box). Events `shade-wake`, death cause `shade`.
- **Mirror pane:** glyph `|` + `mirror:{}`. Glass is a wall to everything but a dashing knight; a dash through it
  swaps left/right (moves, dash aim, cuts, parry aim) until the next dash through glass. Event `mirror` (`on`).

Proofs: `node --import ./scripts/pcore-lab/register.mjs scripts/rbr-find.mjs lab-zip-1 --plain` (the preload makes
the lab rooms findable by every tool); `node --import ./scripts/pcore-lab/register.mjs scripts/pcore-lab/check.mjs`;
screenshots `node scripts/pcore-lab/shot.mjs <dir> lab-zip-2@40`.
