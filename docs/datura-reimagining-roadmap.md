# Bladefall: Datura reimagining run ledger

## Program size

The full program is 88 independently verifiable runs. The count is not a promise
to make 88 arbitrary edits: it protects level-specific planning, authored layout,
narrative integration, and experiential verification from being collapsed into
one broad automated pass.

| Block | Runs | Purpose |
| --- | ---: | --- |
| Foundation `F01`–`F08` | 8 | Baseline, world state, story state, travel, shops, quests, endings, authoring gates |
| Level work `L01`–`L16` | 64 | Four runs per existing stage: charter, geometry, people/story, validation |
| Integration `I01`–`I16` | 16 | Cross-world pacing, economy, quest arcs, co-op, saves, endings, accessibility, performance, release |
| **Total** | **88** | |

Every level uses the same four-run contract:

- `P` — inspect the assembled level and write its spatial/narrative charter.
- `G` — replace geometry and environmental mechanics according to that charter.
- `C` — add its NPCs, quests, shops, memories, dialogue, and world-state effects.
- `V` — complete fresh/revisit/optional/co-op routes and visual/playability review.

The level sequence is `L01` Outskirts, `L02` Black Woods, `L03` Brute,
`L04` Updrafts, `L05` Hollow Marksman, `L06` Ruined Keep, `L07` Warden,
`L08` Frostfell, `L09` Frost Sorcerer, `L10` Emberdeep, `L11` Ember
Colossus, `L12` Inversion, `L13` Void Tyrant, `L14` Abyss King, `L15`
Gilded Vault, and `L16` Deep Line.

## Foundation ledger

| ID | State | Deliverable |
| --- | --- | --- |
| `F01` | Evidence open; structural work complete | Version-matched campaign baseline and explicit experiential evidence gaps |
| `F02` | Complete | Immutable interconnected world graph, persistent world progress, constrained branch and ending routes |
| `F03` | Complete | Datura delirium story-state model, memory ordering, clock witnesses, reality correspondence |
| `F04` | Complete | In-world map and anchor travel limited to visited places |
| `F05` | Complete | Persistent Ethereal Goods and five authored regional shop/economy counters beginning in Black Woods |
| `F06` | Complete | Four persistent multi-stage quest arcs, contextual dialogue/turn-ins, journal, and non-trivial objective verbs |
| `F07` | Complete | Illustrated poisoning prologue plus direct-death and Deep Line rusty-axe ending pipelines |
| `F08` | Complete | Versioned level-charter schema, assembled geometry ownership/containment checks, and P/G/C/V evidence gates for all 16 levels |

`F01` remains open because automated probes cannot honestly certify human
comprehension or co-op playability. That evidence debt is retained rather than
used to block safe, non-geometric foundation work.

## Level-authoring contract established by F08

- All sixteen campaign blueprints generate immutable, versioned charter stubs
  with named room owners and separate `P`, `G`, `C`, and `V` gates.
- Every charter requires fresh, revisit, optional, speedrun, and co-op route
  intent. Dynamic systems additionally require setup, failure, recovery,
  success, and co-op receipts; static reachability cannot close that gate.
- The fully assembled runtime level—not the detached blueprint—is captured and
  audited. Every object, enemy, pickup, and traveler reports its authoring owner
  and charter room; critical mechanisms are explicitly marked.
- The generic Updrafts puddle was removed. Blueprint composition recipes are now
  metadata only and cannot fabricate platforms, hazards, fields, or fluids after
  room assembly.
- Fluids require an explicitly authored basin and containment flag. Entrances
  reject nearby hazards/enemies, fixtures require stable support, and generic
  gameplay additions fail the geometry audit.
- `window.__BF.charterState()` exposes the current charter, validation, geometry
  audit, and evidence plan. The detailed contract lives in
  `docs/level-charters.md`.

## Level ledger

| Level | `P` charter | `G` geometry | `C` people/story | `V` validation |
| --- | --- | --- | --- | --- |
| `L01` The Outskirts | Complete | Complete | Complete | Pending |
| `L02` Black Woods | Complete | Complete | Complete | Automated complete; human/co-op pending |
| `L03` The Brute | Complete | Complete | Complete | Automated complete; human/live co-op pending |
| `L04` The Updrafts | Complete | Complete | Complete | Automated complete; human/co-op pending |
| `L05` Hollow Marksman | Complete | Complete | Complete | Pending |
| `L06` Ruined Keep | Pending | Pending | Pending | Pending |
| `L07` The Warden | Pending | Pending | Pending | Pending |
| `L08` Frostfell | Pending | Pending | Pending | Pending |
| `L09` Frost Sorcerer | Pending | Pending | Pending | Pending |
| `L10` Emberdeep | Pending | Pending | Pending | Pending |
| `L11` Ember Colossus | Pending | Pending | Pending | Pending |
| `L12` The Inversion | Pending | Pending | Pending | Pending |
| `L13` The Void Tyrant | Pending | Pending | Pending | Pending |
| `L14` The Abyss King | Pending | Pending | Pending | Pending |
| `L15` The Gilded Vault | Pending | Pending | Pending | Pending |
| `L16` The Deep Line | Pending | Pending | Pending | Pending |

`L01-P` is grounded in a version 7.15.0 assembled capture and a twelve-still
planning atlas. Its charter narrows the opening from a rapid mechanic sampler to
Fallen Verge → Watcher’s Cut → Signal Hollow → Sealed Breach, with a 12–18 minute
first-run target and a mandatory 3–5 minute speed line.

`L01-G` replaces the sampler geometry with those four room-owned spaces, adds a
real low/upper route split, makes the signal updraft depend on fire ignition,
removes the disconnected ice/spike/crumble/spring demonstrations, and preserves
the mandatory fixed-exit fling. The assembled version 7.16.0 audit owns 67/67
entities and reports no geometry or circuit errors.

`L01-C` replaces Mara's nearby fetch with a two-branch survey restoration,
adds the optional undiagnostic tin-cup memory, makes the warm ashes a persistent
searcher clue, and stages two non-vendor incidental figures with distinct roles.
The version 7.17.0 assembled audit owns 72/72 entities; runtime checks confirm
memory, clue, quest, revisit, co-op survey authority, and no-shop state without
page errors.

`L01-V` is in progress. Its first strict route capture exposed and repaired a
low-road/upper-wall clearance conflict. A clean rerun reached the Sealed Breach
(77.1%), placed its player mouth, and retained no page errors; targeted probes
record setup, low-speed rejection, and high-speed fixed-exit transit. Natural
completion, revisit/optional/speedrun and true two-player receipts—and human
clarity/fun review—remain open rather than being inferred from automation.

`L02-P` is grounded in a version 7.18.0 assembled capture and twelve-still atlas.
Its charter replaces the obstacle catalogue with Mothlight Refuge → Biting
Canopy → Mirror Thicket → Two-Mouth Hollow. The first shop becomes a safe place,
Bram's lamp and readable forest lies share one grammar, and the finale becomes
the first fully player-owned two-mouth portal puzzle with safe decoy outcomes.

`L02-G` and `L02-C` are complete. Version 7.22.0 closes the automated portion of
`L02-V`: the repaired Biting Canopy clears with ordinary keyboard wall jumps, the
false ledge and portal decoy both recover safely, Bram reveals rather than removes
deception, the correct two-mouth fling reaches the far bank, checkpoint rewind
clears the pair, reduced motion removes shake/look-ahead, and split co-op mouth
state converges on the reliable protocol channel. The 79/79 owned visual atlas and
five-probe receipt have no page or geometry errors. Natural fresh/revisit/100%/
speedrun completion, live co-op behavior, and human clarity/fun review remain open;
the next implementation run is `L03-P` for The Brute.

`L03-P` is grounded in a version 7.22.0 assembled capture and ten-still atlas.
Its charter expands the short trap sampler into Chainwake Camp → Drop Yard →
Counterweight Rise → Broken Gate. Falling mass progresses from shelter to latch
weight to stairs before the charging boss becomes the final payload. The portal
solution now occurs once: it drops the gate counterweight, permanently breaks the
Brute's armor, destroys the portal assembly, and transforms the encounter into an
active pursuit instead of repeating the same pylon loop. The next run is `L03-G`.

`L03-G` is complete in version 7.24.0. The level now spans four continuous,
room-owned causeway spaces with five distinct machinery landmarks and four
checkpoints. The Drop Yard hoist commits when correctly placed and visibly recalls
after a miss. In Broken Gate, ordinary damage deflects until a 960 px/s fixed-exit
launch carries the charging Brute into the counterweight; the impact clears the
mouths, destroys the salvage anchor, drops the mass, reveals the arena debris,
and permanently opens an aggressive slam/rush pursuit. The 51/51-owned visual
atlas has no page or geometry errors, and all five targeted runtime probes pass.
Human route/combat feel and live co-op convergence remain for `L03-V`.

`L03-C` is complete in version 7.25.0. Oren and Sable now inhabit Chainwake Camp
with distinct work roles, silhouettes, first/revisit dialogue, and persistent
resident records. The optional Release the Causeway quest sends the player to two
separate traversal branches, awards 160 gold on return, and permanently opens the
Drop Yard shortcut. The Broken Standard record and undiagnostic Wristguard of the
Bearer memory persist across reloads; the Brute death correspondence stays brief,
and white trumpet flowers appear only after the arena counterweight falls. All six
targeted runtime probes pass without page errors. The next run is `L03-V`.

`L03-V` is automated-complete in version 7.26.0. Its end-to-end assisted receipt
found and repaired two bypass/retry defects: the Drop Yard plate now accepts only
the committed hoist, the carriage freezes at release instead of drifting during
its warning, and a death after the Broken Gate checkpoint restarts at that
threshold with a clean portal pair. Nine probes now cover the mandatory transition
to Updrafts, a 6/6 optional completion score, persistent keyboard-traversable
revisit shortcut, failure recovery, world-snapshot convergence, and unanimous
co-op transition protocol with no page errors. State-positioned assistance and
single-process network simulation remain explicit; first-time human feel and a
live two-device session remain pending. The next implementation run is `L04-P`.

`L04-P` is grounded in a version 7.26.0 assembled capture and twelve-still atlas.
Its charter replaces an airy obstacle sampler with Bellows Rest → Kite Stair →
Rain-Catcher Span → Signal Crown. Jetpack fuel becomes a landing rhythm across
supported windwright infrastructure; enemies and elemental reactions use the same
authored air fields; the only water is a visibly contained recovery cistern. The
finale retires projectile routing in favor of two player-placed mouths that bend
the environmental crosswind itself, with useful nonlethal decoy outcomes. Ilyra's
help becomes a spatial repair rather than a nearby fetch, while the clean bandage
and third-note clue occupy optional but recoverable routes. The next implementation
run is `L04-G`.

`L04-G` is complete in version 7.28.0. The old 5,000 px sampler and generated
projectile coda are replaced by one 8,400 px authored windwright route. Supported
landing shelves, visually sourced thermals, enemy catch decks, a recessed and
fully bounded Rain-Catcher cistern, and two separated service vanes now share one
environmental language. Signal Crown uses both player-placed mouths to project the
crosswind itself into one sustained progression receiver; low and high decoys
produce useful recoverable outcomes without opening the gate. Cleared revisits
retain the repaired machinery and reissue the harness. The 82/82-owned atlas has
no geometry or page errors, and all eight targeted live probes pass. Human route
feel and live co-op remain open for `L04-V`; the next run is `L04-C`.

`L04-C` is complete in version 7.29.0. Ilyra's old nearby fetch is gone: restoring
both Rain-Catcher vanes and reaching her now completes the spatial repair,
persists her helped state, and starts Kindling the Sky. Talla the kite-mender and
Edrin the rain-keeper give Bellows Rest and the cistern distinct working residents
with revisit dialogue but no shop or follower behavior. The clean field bandage,
third-note record, pulse-skipping dialogue, and two sheltered white-trumpet
patches carry the searcher and symptom threads without adding a major memory.
Environmental records now persist even when read before their global quest is
active. All 11 targeted live probes pass, including save/reload and production
co-op snapshot round trips; human first-read and live two-device evidence remain
for `L04-V`. The next run is `L04-V`.

`L04-V` is automated-complete in version 7.30.0. Validation caught the remaining
route bypass: continuous ground had made both Rain-Catcher vanes and Ilyra
skippable. A full-height resident-controlled windbreak now keeps the mandatory
sequence intact—restore both vanes, ride the current, reach Ilyra, then enter
Signal Crown—and persists through the same traveler authority used by co-op. The
enemy overlapping her workstation moved to a lower service shelf. The refreshed
90/90-owned atlas has no geometry warnings or page errors, and all 16 live probes
pass across fuel failure/recovery, elemental winds, cistern containment, useful
portal decoys, fresh and optional routes, reload, checkpoint cleanup, reduced
motion, real stage transition, and production snapshot convergence. State-
positioned assistance, first-time human timing/clarity, and a real two-device
session remain explicitly disclosed. The next implementation run is `L05-P`.

`L05-P` is complete in version 7.31.0. The initial 8,300 px assembled baseline
owned all 109 entities but failed its entrance contract because a generated grunt
began at x=200. Disabling the generic composition recipe produces a clean
107/107-owned planning recapture, but its visual atlas still shows an unoccupied
generic obstacle stream before a flat arena. Executable inspection found the
deeper boss defect: 15 configured banks
combined with a one-third self-damage multiplier require about 45 ordinary
reflections. The charter replaces that loop with Shotfall Camp → Mantlet Road →
Windcut Gallery → Deadeye Court. Cover and hostile aim are taught separately;
both player mouths then combine once to bank a marked arrow into the rangefinder.
That single hit drops the perch and permanently changes the attempt into a
vulnerable, mobile three-tier duel. The stage carries the sentry correspondence
and missing-face symptom without adding a shop, follower, major memory, or fetch
quest. The next implementation run is `L05-G`.

`L05-G` is complete in version 7.32.0. Hollow Marksman is now a 7,600 px custom
watch road with four spatially distinct rooms and no generic composition,
cadence, or ecology injection. Its first encounter begins at x=1,150; the live
audit owns all 75 objects with no geometry warnings. Mantlet Road teaches hostile
arrow hardware, Windcut Gallery asks the player to choose both portal mouths with
a recoverable low outcome, and Deadeye Court asks for one renewable marked-arrow
bank. That hit breaks the rangefinder once, drops the perch, starts the cover
rails, and turns the former reflection grind into an ordinary vulnerable duel
that changes tiers and removes cover at two HP thresholds. Seven focused browser
probes pass with no page errors, including useful false targets, atomic transform,
post-break damage, escalation, and complete court-checkpoint reset. Automated
state positioning does not establish first-time clarity or live two-device
quality; those remain validation work. The next implementation run is `L05-C`.

`L05-C` is complete in version 7.33.0. The road now has two—and only two—
incidental workers: Daro, a surviving fletcher sheltered at Shotfall Camp, and
Senn, a veil-mender working beneath Mantlet Road. Both have occupation-specific
silhouettes, workstations, first/revisit lines, and independent persistent story
visits. Three racks of rubbed-smooth watch masks, the boss’s brief face-erasing
release glare, a local order recording a gate that recognized a voice but no
name, and two sheltered white-trumpet sites carry the missing-faces symptom and
sentry correspondence without diagnosing the delirium. The previously named
room scenery now renders as tents, braces, towers, counterweight rails, gallery
frames, and the three-tier court instead of disappearing into the generic canyon
background. All ten focused geometry/content probes pass on the 84/84-owned
assembly with no page errors. The chapter adds no traveler, shop, major memory,
quest item, or new quest. The next implementation run is `L05-V`.

## World graph contract established by F02

- The existing sixteen playable stages are persistent named places, not a menu
  playlist.
- The first thirteen nodes form the mandatory descent to the Void Tyrant.
- Defeating the Tyrant opens the Abyss King and nothing beyond him. Defeating
  the King ends the direct route; the existing coin-gated door can instead
  continue into Gilded Vault → Deep Line for the alternate ending.
- Both endings therefore pass through the final two bosses; the optional route
  cannot shortcut the campaign.
- Fast travel can target only activated anchors in already visited places.
- Ordinary completion selects the `wake-fall` ending state. Clearing the Deep
  Line selects `wake-armed`, supporting the agreed rusty-axe ending without
  making the branch mandatory.
- Legacy saves derive visited and cleared nodes from their existing Base-game
  reach and preserve prior Vault/Deep Line clears.

## Map and travel contract established by F04

- The title screen exposes a read-only, fogged descent map. The pause menu uses
  the same projection and adds travel controls during an eligible Base run.
- Current, cleared, visited, frontier, locked, and hidden locations/routes have
  distinct visual states; unreached names remain `Unknown`.
- Travel targets are limited to previously activated anchors. A target can
  never discover a new node or move beyond the cleared frontier.
- On a first visit, departure requires the player to stand at that location's
  entrance or active checkpoint with no nearby enemy or living boss. Revisited
  cleared locations remain convenient backtracking spaces.
- Battle, Boss Rush, transition, downed-player, NG+, and co-op states reject
  travel. Co-op anchor authority remains reserved for the later integration run
  rather than allowing either client to move the pair independently.
- A successful return preserves loadout, run timer, completion state, seed, and
  leaderboard eligibility, strips stage-only jetpack state, starts at the
  destination entrance, and persists the destination immediately.

## Regional economy contract established by F05

- The movement tutorial remains shop-free. Ethereal Goods opens at the safe
  Black Woods entrance, followed by authored counters in Ruined Keep,
  Frostfell, Emberdeep, and the Inversion.
- Every counter is placed on verified supporting ground with the procedural
  enemy allocator barred from its safe entrance radius; nothing is positioned
  by a generic scenery pass.
- Each region has fixed, readable stock: two appropriately tiered pieces of
  one-time equipment and one repeatable health or weapon-restoration service.
  Prices rise with route depth and do not introduce a second currency.
- Purchases and visits use their own versioned persistent state. Bought gear is
  sold out on revisit and cannot be charged or granted twice; services remain
  available but cannot be purchased while already full or pristine.
- The contextual companion control reads `SHOP` near a counter, supporting the
  same keyboard and touch paths without adding another permanent action button.
- Ethereal Goods identifies its keeper as the Assessor and frames the inventory
  as possessions that were already the knight's. The wording establishes the
  agreed effects-inventory clue without explicitly diagnosing the delirium.

## Quest and dialogue contract established by F06

- Four ordered Base-campaign arcs now cross multiple named worlds: `A Road
  Without a Name`, `Kindling the Sky`, `The Courier's Proof`, and `Inventory of
  Effects`. Out-of-order actions cannot silently complete later steps.
- Objectives use distinct verbs already supported by the game: help a named
  traveler, inspect physical history, ignite airflow with a fire weapon, return
  an enemy projectile through portals, revisit a person, and revisit a shop.
- Mara, Ilyra, Sera, and the Assessor have state-sensitive dialogue. Final
  reports require returning to their authored location; map backtracking now
  has quest value rather than serving only as level replay.
- The pause menu contains a persistent quest journal with current objective,
  route location, ordered progress, and completed-state display. The companion
  key/button becomes `TALK` when an awaited quest contact is in range, after
  giving `SHOP` first priority at a counter.
- Quest starts, progress, traveler-help history, completion, reward claims, and
  dialogue state use their own versioned save document. Gold rewards are claimed
  exactly once, and previously helped travelers remain helped on revisits.
- The shipped arcs are deliberately compatible with later level-specific C
  runs: those runs may expand dialogue and spatial staging without replacing
  quest authority or inventing another objective system.

## Cinematic contract established by F07

- A fresh Base run opens in the real night camp: enemy fires, a tampered cup,
  unmistakable white trumpet flowers, the 3:40 waking, deforming intruders, and
  the fall into the Hollow. The flowers are shown but the word `Datura` is never
  presented to the player.
- Both endings share the same first three beats: the knight wakes delirious,
  enemy soldiers cut into the tent, and he mounts a credible partial defense.
  The branch cannot rewrite the opening merely to make its outcome convenient.
- A direct King ending lets the delirium break his defense; real blades kill
  him and the screen resolves to `He did not wake again.`
- Clearing the Base Deep Line selects the truth ending after its world flag is
  persisted. At the killing stroke, flameblade and portal imagery returns; the
  knight uses the apparent weapon to kill the attackers, collapses, and the
  camera reveals an ordinary rusted axe. Darkness carries the exact line
  `He who saved us has awoken.` before his eyes slowly open.
- Ending selection remains owned by persistent story/world state, not the menu
  or cinematic renderer. Both branches retain skip controls, leaderboard
  submission, credits, co-op category selection, and the existing postgame/NG
  handoff.
- NG+1 and NG+2 retain their current wrappers until their dedicated future
  redesign runs; F07 changes Base narrative truth without prematurely defining
  those remix arcs.

## Integration ledger

`I01`–`I04` tune the whole-world route, pacing, backtracking, and shortcuts.
`I05`–`I08` tune economy, shops, quest arcs, memories, and NPC density.
`I09`–`I12` verify co-op authority, save migration, death/checkpoints, and both
endings. `I13`–`I16` cover accessibility, performance, complete route matrices,
and release signoff.
