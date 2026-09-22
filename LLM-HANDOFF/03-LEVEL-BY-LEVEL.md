# Level-by-level production record

> **The late road (stages 9–13) is built and unplayed.** Runs 2–6 of
> `16-LATE-GAME-WORK-ORDER.md` authored Emberdeep, the Foundry, the Inversion and the
> Paradox Citadel, and then walked the whole road from the White Court's Ember Door to
> the Throne Gate in both directions (`tests/late-game-road.test.mjs`). Every seam
> crosses, every arrival is on solid ground facing the way its level runs, each verb is
> required before the exit past it, and Continue resumes mid-road. What this record calls
> "playtest pending" below means exactly that.
>
> **2026-09-19 — the owner played it and Emberdeep was broken.** Verdict: "I can work
> with all of this minus Emberdeep." Three defects, all one mistake — a literal `0`
> standing for "the floor" in a region whose floor is at 640. The camera framed 354
> units of solid rock, the counter floated in the void beneath the plateau, and the
> relay traveler fell out of the world and stayed there, which made the region
> **unfinishable**. Fixed in Run 7; see `16-LATE-GAME-WORK-ORDER.md` and
> `tests/level-datum.test.mjs`. **Stages 10–13 are still unplayed.**

Updated 2026-09-13. “Implemented” means present in source; automated verification
is reported separately from owner acceptance. After Frostfell's engine strikes,
The Outskirts, Black Woods, Broken Causeway and the Warden currently install only
three to five recall posts each with no change to existing enemies; the owner
reviewed that on 2026-09-13 as not noticeable, and `12-RECALL-WORK-ORDER.md`
specifies what each region must become. The entries below describe the quiet
first visit. The owner considers the opening
through Warden complete in substance, with later polish deferred. Historical
“Remaining” notes below are polish/review prompts, not orders to reopen those
levels. Frostfell's latest changes received positive owner feedback. See
[recent changes](11-RECENT-CHANGES-AND-PLANS.md) for the full follow-up record.

## Recall follow-up, run 1

The first four return regions now have substantial regional reinforcements and
one unique role each; all campaign ordinary enemies receive the one-time recall
baseline. See `12-RECALL-WORK-ORDER.md` for current counts and preservation rules.
This changes post-Muster encounters, not the accepted first-visit boss designs.
Frostfell's original eleven reinforcements and finale remain the reference.

## 1 — The Outskirts

**Identity:** slow, unarmed awakening at a broken predawn military camp.

**Implemented:** six authored rooms across 13,800 units: Poisoned Verge, Camp
Echo, Watcher's Cut, Hollow Mile, Broken Muster, and Mothlight Descent. The player
has one jump and no weapon. Mara's three-bearing survey, named incidental
survivors, the 3:40 clock, white trumpet flowers, warm ash, First Draught
correspondence, compact anchored dialogue, avoidance enemies, a later weapon
Sentinel, later Dash/Wall Jump boundaries, and the physical Black Woods tunnel
exist. The west breach later reaches Warden after the Keep route.

**Purpose:** teach movement, variable jump height, patrol reading, recovery,
route choice, and backtracking without dumping future systems into the HUD.

**Return value:** weapon Sentinel/Vault Key route, Dash cache, later Wall Jump
breach, clock progression, Mara/quest returns.

**Remaining:** human fresh/revisit/optional/speed-route review; confirm dialogue
density, Mara placement, enemy perception/pursuit, western breach readability,
checkpoint spacing, and full transition flow after all later systems settle.

## 2 — Black Woods

**Identity:** inhabited refuge and forest whose honest/copy footing can be read
through resin and wind.

**Implemented:** five authored rooms across 12,400 units: Mothlight Refuge,
Oathblade Clearing, Biting Canopy, Mirror Thicket, and Rootbound Passage. Orra,
Pell, Hale, Bram, Ethereal Goods, clocks, the ceremonially recovered Oathblade,
first weapon combat, distinct enemy roles, recoverable false surfaces, the
Mothsilk Mantle, a Dash-return root seam, and reciprocal physical exits exist.

**Purpose:** reveal the bag and weapon only when earned; turn the first refuge
into an inhabited safe place; teach combat in one isolated encounter before
terrain/combat synthesis.

**Remaining:** refreshed human visual/playthrough review, especially resin
clarity without over-explanation, the canopy wall, return-route usefulness,
enemy behavior, and checkpoint economy.

## 3 — Broken Causeway / The Brute

**Identity:** a stopped civic machine where committed mass changes from hazard
to terrain to boss solution.

**Implemented:** five authored rooms across 14,000 units: Chainwake Camp, Drop
Yard, Chainwalk, Counterweight Rise, Broken Standard. Oren's repair is mandatory
for the route; Sable contextualizes the causeway. The Chainwake Longbow awakens
the Brute by three precise airborne rivet shots. The Brute must break a cracked
brace, revealing climbable wreckage and an armed chain; a final arrow/cut drops
the counterweight, breaks armor, and starts the direct pursuit duel. Failure and
death reset the machinery. Victory grants Dash. Echo/Gift/appearance disclosure,
optional memory/correspondence, and physical return paths exist.

**Do not regress:** no held/charged attack here; no obvious `0/3` solution text;
the bow is the new verb; the player can always return to the firing route; boss
state must reset after death and Level Select must grant Dash on victory.

**Remaining:** human readability and balance review as part of the opening
package; confirm Oren's dialogue duration and machinery inference remain fair
without direct hints.

## 4 — The Updrafts

**Identity:** a windwright settlement whose capture/carry/land language belongs
to maintained civic weather, not a random aerial sampler.

**Implemented:** seven authored rooms across the live 18,000-unit level:
Rootbreach Lift, Bellows Rest, Kite Terraces, Choir of Drafts, Needlewind
Labyrinth, Rain-Catcher, Signal Crown. Dash opens the incoming wind column. A
stage-local Aerie Harness has a landing/refuel rhythm. Wind fields affect player,
enemies, payloads, and elemental reactions. Needlewind is the precision flight
maze and owns Gale Stitch. Rain is visibly contained. Talla, Edrin, and Ilyra
occupy distinct work. Three persistent machines restore the Crown. Linked Portal
is claimed at the final plinth and intentionally used in the next level, avoiding
same-level overload. Music remains one uninterrupted cue.

**Return value:** recovered machines, service shortcut, optional Echo/Blood
fragment/Recollection, Ilyra quest, Gale Vault once the portal pair is owned.

**Remaining:** natural human play of fuel recovery and the winding spike path;
confirm no empty opening, unreachable lever, useless crystal, checkpoint music
swap, or dry-fuel softlock has returned. The older four-room charter sections are
historical; use the current seven-room runtime and validator.

## 5 — Hollow Marksman / Marksman Road

**Identity:** exposure, sightlines, and one linked portal mouth; then a learned
mobile duel.

**Implemented:** five authored rooms across 15,000 units: Shotfall Camp,
Watching Road, Mantlet Works, Windcut Gallery, Deadeye Court. Crystal-refill
jumps cross opening walls. One movable blue mouth links to authored orange
anchors. Uses progress from barrier crossing, to routing a hostile watch arrow
into machinery, to crossing under fire, to banking one marked boss arrow into
the rangefinder. After the one-time bank, the Marksman becomes ordinarily
vulnerable, stays on arena ground while retaining vertical shots, repositions,
splinters cover, and uses a half-frequency enraged ground AOE. He takes 50% more
damage while enraged. Victory grants Twin Portals, Far Thread/capacity, Blood
restoration, and opens Ruined Keep.

**Owner verdict:** the final current fight produced the desired learn/practice/
master satisfaction and should not be changed without a specific new playtest
problem. It was intentionally made slightly easier than its hardest iteration
while retaining the AOE.

**Remaining:** only regression/human route review and optional reward clarity.
Do not “clean up” the boss based on an older cached build.

## 6 — Ruined Keep

**Identity:** a ruined civic place whose portal verb is reconstruction.

**Implemented:** six authored rooms across 18,000 units: Gatehouse Hearth,
Fallen Refectory, Weight Hall, Mason's Quarter, Split Belfry, Clinging Archive.
Tovin/Veya, shop/hearth, 3:41 clock, cells, craft evidence, Floating Dream, and
the sealed Recollection exist. The player owns both mouths. Body traversal leads
to broad retryable payload routing. Split Belfry requires two differentiated
portal-routed weights; the second depends on Mason's Grip. Mason's Grip grants
Wall Jump only. The Archive gives an immediate real-physics climb, then the Keep
Key/Masked Belfry opens the western world seal. The eastern collapse is not an
exit. The player must return west.

**Latest implementation:** wall contact retains a physical skin across small
vertical seams. The Keep-Key return converts three old slick barriers into
explicit Mason's Grip surfaces, gives stage-specific westward cues, and names
the Rain-Catcher Service Lift consistently in-world and on the Dream Map. The
seam validator now reports topology honestly instead of calling it a continuous
input-driven route.

**Remaining:** human first-read review of the two Belfry weights, Archive key
ceremony/map cue, visual density, and whether the westward objective is clear
without an oversized instruction panel. Preserve the no-softlock guarantees.

## 7 — The Warden / The Gaol

**Identity:** reverse east-to-west prison descent; “behind” becomes a portal
relationship rather than a simple facing direction.

**Implemented:** six authored rooms across 15,000 units: Eastern Crown, Blind
Gallery, Hush Engine, Turning Cells, Red Court, Sentence Well. Entry from
Outskirts is high and east. Shielded jailers delay their turn and commit attacks.
Hush Engine contains its low gravity and rotors. Turning Cells now require live
Wall Jump movement through hazards and a final personal-pair transit rather than
walking past decorative cells. Prisoners and Gaol Vigil precede the boss.

A personal portal crossing from one side of the Warden to the other opens a
punish window; same-side transit does not. Phase 2 adds rotors and attacks one
mouth at a time. Phase changes clear placed portals. In phase 3, three returned
rushes break him; every successful crash consumes the pair. The first two remove
one blade-adjacent lure platform each. Pillars and rotors continue moving.
The third immobilizes him at one health, casting a telegraphed AOE at the player's
current position every three seconds until a final weapon hit. Sentence AOEs
cost one Blood without checkpoint relocation; no numeric crash labels.
An open threshold and arena-edge checkpoint keep death returns reachable.
Victory restores Blood, grants Counter/Red Tempo and opens the Frostfell mine.
The mine now uses deliberate Up at either end, preventing held-Left bounce.
Whispering Woods is exploration music and Element the boss cue.

**Status:** complete in substance per owner. Later requested polish may refine
Turning Cells, telegraphs, dialogue and pacing; preserve the accepted fight rules.
Focused mechanics/music evidence is recorded separately from full-route review.

## 8 — Frostfell — authored; latest changes positively reviewed

The 15,100-unit custom settlement now contains the Banked Refuge, Working Streets, Workers’ Hearth, Thermal Works, and Thawed Court. Nim lights three permanent traction-providing braziers, grants one Forge Seal, and settles at the endpoint. Portal-routed fire through wind permanently thaws the works. Double Jump is acquired on safe ground and rehearsed on raised galleries, with an optional recollection and an upper service passage back to the refuge. The Rime Key retains its later Attunement/fire requirement; the eastern aqueduct remains a future connection. Music is Drifting Memories before activation, ClockWork afterward. Beyond the court, a 20-landing ice gauntlet leads to a Muster Engine and a summit return. Up activates a cinematic bell strike and a permanent reinforcement roster in Frostfell. The three service stops cycle once the summit has been used; the Warden mine now uses deliberate Up entrances to avoid held-direction bounce. Outside Frostfell the recall is so far only a few posts per region with no buff; the owner rejected that on 2026-09-13 and `12-RECALL-WORK-ORDER.md` specifies the real thing.

See `docs/charters/08-frostfell/README.md` and its evidence receipt. `npm run validate:frostfell` exercises the actual TAS route and campaign persistence. The latest receipt also includes normal-keyboard mine crossings in both directions and actual music playback. A full continuous campaign playthrough and the future White Court seam remain separate from those checks. Frost Sorcerer has not been redesigned. See [recent changes](11-RECENT-CHANGES-AND-PLANS.md) for roster counts, shortcuts, setup coordinates and deferred world escalation.

Run 3 adds one reserve and permanent physical shortcut in each return region;
see `12-RECALL-WORK-ORDER.md` for exact coordinates, rewards and input proofs.

## 9 — Frost Sorcerer / White Court

**Current runtime:** chasing/blinking boss, moving spell siphon, water/current
composition, and prior anti-camping improvements exist; full current pass pending.
Run 3 produced `docs/charters/09-frost-sorcerer/DESIGN-PLAN.md`, design only.
Its proposed total ward-break count remains playtest tuning, not shipped behavior.

**Target:** the Sorcerer must actively chase, blink, track shots, and deny ground.
The player steals spells through a moving siphon whose alignment
window and cold state change each phase. Portals redirect/expose magic but do
not form permanent cover. Each phase changes the arena's cold state instead of
repeating one projectile bank. Reward Attunement and make the real/dream command
correspondence more legible without final diagnosis.

## 10 — Emberdeep

**Current runtime (2026-09-18):** authored v4 region, six rooms, and after Run 3 an
actual **descent**. Rooms 1-5 stand on a plateau at `const ED=640` — deep ground at a
height via `GrAt()`, filled to the world floor so nothing walks under it — and room 6
walks you 640 units down off it in four switchback flights to y=0, where the east seam
into the Foundry is an ordinary edge walk. Every y in the level is written through ED.
A lava sump under the head of the stair means stepping off costs a rewind, not the
whole descent, and the plateau rooms rewind at ED-160 rather than at the world's void.

Room 2 is now **two lines over one clock**: the low line is the slab rhythm, the high
line is a chimney and a run of cold stone over the spouts — faster, and the slag falls
on it. Room 3 has a lookout level with the top of the seal arch. Three of six plain
emberlings are gone: two **slagwrights** (lob slag that lands as a burning pool and
cools into footing) and a **cinderling pair** (burn out where they die) put the clock
in the fight. Checkpoints cut from 12 to 7. In the stair, one **dead ladle** hangs
jammed over a set mould with the slag gone hard up its arm — no text; it is what the
player spends the next region doing.

**Interior backdrop.** Stages 9-11 now use `INTERIOR_STAGES` in the renderer: tiled
rock wrapped in both axes, pinned to nothing, no horizon, no abyss gradient, plus y
culling. The outdoor backdrop assumed a sky, hills 196px above the GROUND LINE, and
darkness below it — raise a floor 640 units and all three break at once.

**Target (remaining):** owner playtest.

## 11 — Ember Colossus / The Foundry

**Current runtime (2026-09-18):** authored v4 region, five rooms, and a rebuilt
fight. The wet-forge cannonball circuit described in earlier revisions of this file
is GONE: the Colossus now runs "The Last Pour" (docs/charters/11-ember-colossus/
BOSS-DESIGN-PLAN.md). You beat its arm to the mould it banked, set that mould cold
with Downward Strike, and the pour is refused; progress counts refusals, not health.
Run 1 of 16-LATE-GAME-WORK-ORDER.md made that legible — the banked bay is marked,
the machine stands behind the bench at 2.2x, and a jam leaves its arm in the stone
as the fight's melee window. Downward Strike is granted at the Anvil midpoint.

Run 2 (7.125.0) rebuilt the region around the fight's own sentence. The new
primitive is the **ladle** (`updateFoundryLadles`): a machine that goes to a
mould, gathers over it — which holds it in its setting window — and pours. Pour
into open stone and it fills; pour onto stone you set and it jams. Three of them,
seizing at one, two and three refusals: the **Anvil** counterweight gate (the
strike is required, the natural cold window is half a second and 560 units from
the gate), the **Casting Line** whose belt stalls when you refuse two different
bays, and the **Mould Hall feeder** that walks beneath your bed and whose wreck is
the only step east. Rooms 2 and 3 swapped so the test follows the grant. The
**Sluice** is the chapter's portal room: a mould whose setting window is a fifth
of a second, a coolant header to stand a mouth in, and a slate under the mould —
carry the cold to the stone. The arena's outlet anchor now declares a 700-unit
envelope (`anchorRange`) so it stops demoting the Sluice to one-mouth mode.

The region **leaves through its own floor**: three casting caps in the GROUND at
the east end, a height-triggered crossing inside that band, and the recollection
on a ledge inside the mouth. `colossus-inversion` is now ember-colossus `south` →
inversion `north`, with authored arrivals at both ends.

**Target (remaining):** owner playtest. The fight itself is playtest-pending, not
accepted; Emberdeep's descent is Run 3.

## 12 — The Inversion

**Current runtime (2026-09-18):** rebuilt in Run 4 as the game's first **vertical**
region. About 9,000 wide by 1,500 tall, entered at the top right by falling out of the
Foundry's floor and left at the bottom left by the west gate at y=0 — right to left and
downward, as the map draws it. The old 8,400-unit flat level, its procedural coda
(`customExtension` 2600, `spGravity`, both weapon pickups, five signs) and the
unconditional `populateVoid` spawn are gone; `populateVoid` now runs only for a level
without `authoredEcology`.

**The rule:** there are two floors and you may owe only one at a time. The grammar is
the switchback — a floor run ends at a 400-wide gap (a double jump clears 355 in either
orientation), the only thing over it is a roof whose UNDERSIDE you reach by stepping off
the lip and flipping in the air, and that roof reaches ~200 past the gap over the next
floor, where you right the world and drop. Six rooms, each owning its own x-span AND
height band, because rooms are x-spans in this engine and two may never share one.

**Renderer.** The pixel path had no handling of `gravityFlipped` at all. Now: the hero
and every non-flying walker mirror about their own box (`flipWrap`; `p.y` stays the box
bottom either way, see `playerSlate`); `polarityTrim` moves each platform's lit cap to
the side you currently owe and grows the hanging fringe on the other; a flip stamps
`G.flipTellAt` and gets a half-second whole-screen tell with the motes reversed; the
200,000-wide world roof is clamped to the view before its per-pixel brick loop; and the
camera mirrors `verticalThreshold` when flipped and leads a long fall from `vy`.

**Cast.** Oren only, plus the **keelman** — a flyer that owes neither floor — as the
region's recall unique. Eight authored bodies, all `noDrop`. No loot, no signs. The
Zenith Key socket is claimed by standing beside it on the ceiling.

**Target (remaining):** owner playtest. The Void Tyrant fight is Run 5.
## 13 — The Void Tyrant / The Paradox Citadel

**Current runtime (2026-09-18):** authored in Run 5, six rooms over 17,000 units, walked
**east to west** — you arrive at the east gate out of the Inversion's bottom-left corner
and the Throne Gate is beyond the arena at the west end. The Gaol's pattern: `spawnX`
16700, `bossX` 1100, `build(){G.p.face=-1}`, every authored body facing the arrival.
The charter (`docs/charters/13-void-tyrant/DESIGN-PLAN.md`) plans it west-to-east; read
each of its x values as `17000 − x`.

**The rule:** every answer is spent by being right. A ledge you use to solve something
gives way behind you and does not come back — introduced in room 1 over floor you never
leave, raised in rooms 3 and 4, and finally handed to a fight whose every correct
alignment clears the pair that made it. The arena's geometry (two slate faces 1,100
apart, 360 tall) is rehearsed as ordinary traversal **three times** before the arena.

**The fight's maths is untouched.** `TYRANT_PARADOX_BANDS`, `tyrantPairStatus`,
`chargeParadoxOrb` and `advanceTyrantParadox` are byte-for-byte what they were. What
changed is that it is now *visible*: `setupParadoxBoss` builds the arena from absolute
coordinates (an early return in `bossArena`'s tyrant branch, the `setupFoundryBoss`
pattern) so the authored rooms are never purged by the legacy 1,270-unit sweep;
`installParadoxFloor` keeps the floor, the faces and five stairs after the victory, so
the region's only road still runs through its arena; `drawTyrantFigure` puts the three
bands on the BODY as greaves, cuirass and crown with the live one lit; and
`drawParadoxRails` draws the bands across the floor plus an alignment line that snaps
straight when the pair answers and sags when it does not.

**Three things that were outright broken and are not now.** The forward seam is the
game's first `bossClear`-gated physical seam and **nothing recorded the clear** — the
Throne Gate would have refused forever; `latchVoidTyrant` records it on the kill.
`applyFinaleActRemaster` deleted every `lowg`/`updraft`/`gravityWell`/`rotor` in stages
12–13, authored or not. And the seam-failure nudge assumed forward meant east, so a
failed crossing pushed the player further into a west gate.

**Also:** `right-hand-seal` — the memory that flips the story to *confirmed*, declared
since the story module was written and placed nowhere in the runtime — is a found
object in the Paradox Vigil. Oren only; a twelve-row `void-tyrant` Muster roster with
the **crownguard** unique. The camera anchor now follows travel direction, so a
westward run sees ahead of itself.

**Target (remaining):** owner playtest. The Drowned Throne is still procedural and
still left-to-right; the Throne Gate lands the player at its west start for now.
## 14 — Abyss King / Drowned Throne

**Current runtime:** portal hijack, crown phases, checkpoints, crown healing, and
tuned late teleports exist. The owner previously found the revised fight fun;
full current narrative/geography pass remains.

**Target:** hardest fair fight. The player constructs useful attack geometry;
the King steals/hijacks it, so hiding behind a mouth is unsafe. Crown destruction
restores Blood and serves as phase punctuation. Damage, teleport density, and
visual noise must preserve learnability. The last two phases use roughly 25%
fewer teleports than the chaotic older version. Music (2026-09-19): "The Black
Procession" on the approach; "A Crown of Ashes" from the King's first notice. Its
ten-second music-box intro plays once; repeats loop from the orchestral entrance
(`loopFrom:9.98`). The hall's second boss, the Right Hand, takes the Tyrant's own
"Iron Oath of the Night Attack" through the stage-13 `duel` cue (2026-09-20) — the
walk's ambience must never play under that fight.

## 15 — The Gilded Vault

**Current runtime:** six-act combat-free precision course exists in a legacy/
bonus form and is linked to the seven-key gate.

**Target:** the game's pure platforming chapter: furnace timing, periodic fire,
tiny but readable safe landings, lava/void containment, high climbs with lethal
consequence, moving crucible, and exact recovery boundaries. The portal idea is
architectural—a three-height arc/furnace fold where exit height is one
platforming decision, not another separate portal room. Seven Vault Keys and the
Abyss King are prerequisites. The Vault should feel physically beneath/adjacent
to the Deep Line and earn the alternate route.

## 16 — The Deep Line

**Current runtime:** secret minecart stage with lean, forks, collapsing rail,
snipers, route signals, black-gap launch, ending authority, and original-game
Recollection hooks. Full current long-form pass pending.

**Target:** optional truth route that synthesizes earlier verbs without becoming
a sequence of recycled rooms. Dangerous high routes bank one or two signal
charges; a visible capacitor converts them into a more durable final launch, but
the ordinary full-speed route remains viable. Environmental evidence should
complete the poison/searcher/command story through play. Completion selects the
rusty-axe ending and eventually supplies the Waking Key for the sealed original
challenge stages.

## Global level acceptance gate

A stage is not complete until a normal-speed fresh route, death/retry route,
revisit route, required backtrack, optional/100% route, and practiced line have
been exercised. Every required object must be reachable with the capability
prefix owned at that point. Dynamic mechanisms need setup, failure, recovery,
success, reload, and stale-state checks. A human must review clarity, pacing,
visual support, dialogue density, audio continuity, and fun in the in-app Browser.
