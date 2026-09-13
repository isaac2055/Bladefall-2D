# Level-by-level production record

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

## 9 — Frost Sorcerer / White Court

**Current runtime:** chasing/blinking boss, moving spell siphon, water/current
composition, and prior anti-camping improvements exist; full current pass pending.

**Target:** the Sorcerer must actively chase, blink, track shots, and deny ground.
The player steals three spells through an oscillating siphon whose alignment
window changes and accelerates each phase. Portals redirect/expose magic but do
not form permanent cover. Each phase changes the arena's cold state instead of
repeating one projectile bank. Reward Attunement and make the real/dream command
correspondence more legible without final diagnosis.

## 10 — Emberdeep

**Current runtime:** older foundry route with traveler relay, lava, timed
platforming, and portals; full current pass pending.

**Target:** a working industrial descent. Heat cycles, small supported landing
targets, contained molten channels, tools, enemies, and portal-carried reactions
must share one production logic. A specific traveler does not rubber-band through
the selective barrier. The player intentionally sends/commands them through it;
their held relay materializes a moving, crumbling bridge across the live furnace.
Reward Companion Command. Add an inhabited safe counter without turning the
whole level into exposition.

## 11 — Ember Colossus / The Foundry

**Current runtime:** molten projectile capture/coolant/slug mechanic exists, but
the stage remains below the current authored standard.

**Target:** replace the old third-cannon feeling with one moving industrial
failure. The Colossus changes machinery, heat, safe ground, and production state.
The player captures a molten shot, routes it through a visibly bounded coolant
current, and returns the forged slug as one integrated process. The boss stays
aggressive rather than standing behind the portal answer. Reward Downward Strike;
use it immediately as a physical foundry breach or combat-movement proof.

## 12 — The Inversion

**Current runtime:** custom gravity stage and two-mouth drop-lock exist; full
current long-form pass pending.

**Target:** make gravity a spatial language, not a short gimmick. Early openings
must be long enough that Dash/Double Jump cannot bypass flipping. A sustained
floor/ceiling/floor/ceiling sequence should require unmistakable commitments,
with secrets visible for later mastery. The finale combines both orientations
with a two-mouth payload/drop lock and plausible decoys. Reward/complete the
Gravity Flip memory in a protected, legible way. Hide the Zenith Key in a ceiling
sanctum reached through the actual ability.

## 13 — Void Tyrant / Paradox Citadel

**Current runtime:** three band/height phases and later systemic cleanup exist;
full current pass pending.

**Target boss:** the player places opposed mouths low to attack legs, rebuilds
at middle height for torso, then high for head. Each success clears/rejects the
old solved layout and accelerates the barrage, making the three phases easier to
lose without using unfair damage. The approach should remove unrelated relay,
gravity-well, and random accent clutter. Fight and narrative reveal together
confirm the real-world commander/right-hand correspondence and the delirium.

## 14 — Abyss King / Drowned Throne

**Current runtime:** portal hijack, crown phases, checkpoints, crown healing, and
tuned late teleports exist. The owner previously found the revised fight fun;
full current narrative/geography pass remains.

**Target:** hardest fair fight. The player constructs useful attack geometry;
the King steals/hijacks it, so hiding behind a mouth is unsafe. Crown destruction
restores Blood and serves as phase punctuation. Damage, teleport density, and
visual noise must preserve learnability. The last two phases use roughly 25%
fewer teleports than the chaotic older version. The encounter should own the
final-boss version of `music.mp3` unless later audio review changes it.

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
