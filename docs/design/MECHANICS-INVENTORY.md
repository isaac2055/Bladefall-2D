# Bladefall mechanics inventory and placement workbook

Campaign snapshot: local **7.243.0**, 28 September 2026; workshop organization updated in **7.244.0**, 29 September. This separates mechanisms already in the campaign, accepted workshop rooms, and proposals awaiting review. **Banked means approved and preserved for placement; it does not mean silently inserted into the campaign.**

The inventory was checked against constructed levels, current ability records, and authored region modules. The companion `mechanics-inventory-runtime.json` records object types, counts and example coordinates across every active stage. That is an authored-content inventory, not proof of a complete human playthrough or of every optional quest state. Older opening-platforming notes describe a removed Outskirts lift and return walkways; the current code below takes precedence.

## Latest workshop organization

The visible workshop now has Candidates (K, K-F, M, O-F, Q, R–V), Base Bank (H/Switchback, N, O, P), and Fractured Bank (G, H/Needle, I, J, L, H-F, M-F, N-F, P-F, Q-F). Old A–F is hidden. New puzzle systems: lantern-powered ballast, landing-recorded return platforms, dash-awakened thorns, and a direction-programmed carriage; R recombines existing dash-switched supports and pogo into a state-preservation route. Dormant vines are visible, and M links its first vine to the later lift brake.

[The twenty-level placement proposal](../charters/celeste/WORKSHOP-244-PLACEMENT.md) is also embedded in both bank menus. These assignments are proposals; the existing campaign and permanent ability order below remain unchanged. Older workshop lists later in this inventory are historical and superseded by this paragraph.

## Current permanent ability order

| Order | Ability | Current introduction |
|---|---|---|
| 1 | Jump | Outskirts; sole starting traversal ability |
| 2 | Sword | Black Woods |
| 3 | Dash | Brute / Broken Causeway reward |
| 4 | Single placeable portal linked to an anchor | Updrafts |
| 5 | Twin placeable portals | Hollow Marksman |
| 6 | Wall jump | Ruined Keep |
| 7 | Counter | Warden |
| 8 | Double jump | Frostfell |
| 9 | Attunement | Frost Sorcerer |
| 10 | Companion command | Emberdeep |
| 11 | Downward strike | Ember Colossus |
| 12 | Gravity flip | Inversion |
| 13 | Chainhook | Thunder Cliffs |

Source: `public/bladefall-progression.js`, `abilityRecords`. The Updrafts jetpack is **level gear**, not another permanent step: the Aerie harness pickup is ritual-gated and the pack is removed when changing levels. The Echo is a separate throne/story system. Device-assisted upward strikes in the early Woods do not grant the later enemy-pogo ability.

## Where mechanics currently live: base campaign

Numbers in parentheses are internal stage IDs, not suggested playing order. The campaign has branches and return routes.

| Region | Existing traversal/environment vocabulary |
|---|---|
| **Outskirts (0)** | Single-jump creek stepping stones, high/low routes, raised refuges and ordinary crumble ledges. Later-ability overlooks foreshadow return visits. Western spring/updraft and breach are progression-gated; there is no new timed carrier in the opening. |
| **Black Woods (1)** | Sword discovery, thorn/spike beds and pits. Up-strike resin pod at x4600, then three at x6290/6460/6630. These are environmental launch devices with a short reuse delay. |
| **Broken Causeway (2)** | Pressure plates, doors, levers, traps, moving supports and Brute machinery. Freight hoist travels x8520→8790, y65→200, then a momentum jump reaches the upper landing near x9230. Silas's optional brake/lift/governor/gate route adds a machinery puzzle. |
| **Updrafts (3)** | Wind, thermals, wind tunnels, crystals, moving platforms, water/fluids, switches and linked portals. The Aerie pack supports flight/portal-placement routes. |
| **Hollow Marksman (4)** | Portal anchors and twin-portal progression, crystals, moving walls, switches/doors and pressure from the marksman road. |
| **Ruined Keep (5)** | Wall-jump introduction, crate/plate/door puzzles, moving platforms and plates, crystals and portal routing. |
| **Warden (6)** | Low gravity, rotors, moving supports, plates/doors and crystals, mixed with the gaol encounter. |
| **Frostfell (7)** | Ice, wind, moving platforms, spikes, portals and rune emitters; double-jump discovery. |
| **Frost Sorcerer (8)** | Ice, water/fluids, portals, rune emitters, spell siphons, switches and crystals. |
| **Emberdeep (9)** | Hazardous fluids, spikes, crumble ledges, portals, plates and gates; foundry machinery and companion progression. |
| **Ember Colossus (10)** | Conveyor belts, hazardous fluids, coolant/forge interactions, portals, spikes and crystals; downward strike introduction. |
| **Inversion (11)** | Authored floor/ceiling routes, crumbling ceiling ledges, gravity changes, conveyors, spikes, crates and plate/door puzzles. Serpentine-style passages combine surface choice and route timing. |
| **Void Tyrant (12)** | Momentum-carrying tears/ziplines, crumble ledges, spikes and plates; breakable return surfaces. Gravity is not simply enabled everywhere despite owning the ability. |
| **Abyss King (13)** | Tears, fixed portals, pressure marks/doors, spikes and the Echo system. |
| **Deep Line (15)** | Cart movement, rail forks/switches, boost strips, collapsing track and spike gaps. The cart has its own jump/trick rules. |
| **Thunder Cliffs (16)** | Ship/wreck traversal, tears, moving supports, cliff anchors and chain rings; Chainhook introduction. |
| **Landing Shores (17)** | Tide/water pressure, moving wreckage, ring transfers, bell rig and raised safe landings. |
| **Colony (18)** | Ring routes, watch towers, bell/conduit/well interactions and shelter-based traversal. |
| **Palace Path (19)** | Rings, mirrors, vents, shelters, sun gates, anchors and windlass structures. |
| **Sunspire Palace (20)** | Rings, cisterns, light sources, seals and portal/light routing through the palace. |

## Fractured campaign: what is already remixed

These levels enforce their authored early kits; possession of later campaign powers is not permission to skip their introduction order.

| Region (stage) | Existing emphasis |
|---|---|
| Outskirts (21) | Single-jump precision, crumbles and a two-carrier transfer with a narrow perch |
| Woods (22) | Thorn timing, crumbles and four alternating up/down blade devices |
| Updrafts (23) | Thermals alternate lift and downward expulsion; crystals; the pack is absent |
| Marksman (24) | Single linked portal mouth, fixed anchors and target/watch pressure |
| Causeway (25) | Falling hoist masses, releases/plates and two timed momentum carriers |
| Keep (26) | Twin portals, crates, moving structures and wall-jump discovery |
| Warden (27) | Floor/ceiling construction, low gravity, rotors and moving platforms |
| Frostfell (28) | Ice/melting-route pressure and the double-jump memory |
| Sorcerer (29) | Rune emitters, portals, ice and a condenser/cold-maintenance premise |
| Emberdeep (30) | Foundry spouts, traps, spikes and command progression |
| Colossus (31) | Anvil/valve/lava mechanisms and downward-strike discovery |
| Inversion (32) | Ceiling and crumbling-ceiling routes, spikes and gravity-anchor discovery |
| Tyrant (33) | Temporary tears and spike routes; no unrestricted gravity shortcut |
| King (34) | Pressure marks, tears and solo Echo coordination |
| Line (35) | Cart forks, collapsing track, earned airborne speed and spikes |
| Cliffs (36) | Wreck/cliff traversal and Chainhook recovery from the windlass |
| Shores (37) | Higher tide, wider water gaps, bells and ring transfers |
| Colony (38) | Sweeping watch lights, shelters, rings and cistern structures |
| Path (39) | Moving mirror sunlight, vents, shelters and ring movement |
| Palace (40) | Twin-portal light routing, seals and pillars |

## Developed precision mechanics: ready to place versus still being reviewed

| Mechanism | Current demonstration / location | State and distinction |
|---|---|---|
| Short, generous lift-momentum window | Campaign freight/early Fractured carriers; Standard/Fractured tests; A/G | Already used in campaign. Workshop rails are separately dash-driven. |
| Linked dash-driven rails | A, **G** | **G banked.** One dash drives both; two gold departures feed the route. |
| Rail drops as retraction begins | A, **G** | Accepted timing preserved. |
| Independent counterweights / return trap | **M · Rootworks** | Four separate hoists: launch, ride home before hatch collapse, low transfer, final launch. The return opens the physical lower passage. |
| Wall-root growth and decay | **M** | A nearby dash grows a vine rightward from a visible left wall socket over 0.28 s; it withers after 2.75 s and is gone at 3.4 s. The reachable surface grows/shrinks with the drawing. |
| Rift/vein exit vault | B/D, **G/H/I/J/L** | Banked combinations. Jump at the gold exit supplies the rising impulse. |
| Sagging crumble rocks with coyote departure | C, **G/H/I/L** | Landing restores both jumps; visible sag precedes collapse. |
| Dash-operated gravity lodestones | D, **J** | **J banked after recharge fix.** Environmental inversion differs from manual gravity flip. |
| Smooth aether form / brake / dash exit | E, **K**, original precision courses | K and K-F each have three separately authored flight passages and mandatory cable crossings. |
| Crosswind acting on aether | Available prototype code; no active E/K fields | Deferred to a later dedicated introduction. |
| Rebound seed pods / moving cutters | E/K | Cardinal redirect pods in K/K-F; moving cutters remain in E. |
| Rooted spore sentries | **K** | Three enemies per K/K-F course swell and aim before shooting slow projectiles. Shots collide with the terrain and knock the knight out of flight. |
| Directional ricochet bells | F, **G/H/I/J/L** | Fixed outgoing impulse on dash impact. |
| Up/down blade launch targets | Campaign Woods/Fractured Woods; precision courses; **H/I/L** | Early pods are devices. Workshop beetles/pods restore movement resources. |
| Dash-switched footholds and gates | **New H · Switchback Engine** | Every dash changes cyan/amber machinery. A folded upward route requires reversals; the descent requires preserving the needed state. |
| Delayed route-following pursuers | **N · The Wake Behind** | Two moth shades follow your earlier path at different delays. The ruin turns back over your approach; waiting becomes dangerous. |
| Aimable opposing recoil | **O · Recoil Well** | Three pressure pods rebound opposite the incoming dash. Down, down-left and up-left approaches solve different launch/ceiling problems and open visible valves. |
| Carried seed lantern / throw / recover | **P · The Lantern Thief** | A picks up or throws; arrows aim. Send the lantern through a small opening, follow a separate passage, recover it, then repeat across a rising and falling route. Removing it leaves a 1.8 s gate grace period. |
| Halfway lantern rest | **J** | Existing checkpoint retained. |
| Eight-direction workshop dash | All workshop rooms | Fresh-axis aim, 100 ms additive chord, automatic recharge after 0.38 s; ground/devices can refresh sooner. Intentionally differs from Celeste. |

**Fractured Bank:** G · Last Departure; H · Needle and Thread; I · Faultline Fugue; J · Inside Out; L · No Ground for Mercy. Their layouts and approved input-tape hashes are preserved in `../charters/celeste/BANKED-ROOMS.json`.

**Base Bank:** H · Switchback Engine; N · The Wake Behind; O · Recoil Well; P · The Lantern Thief. Approved layouts and input-tape hashes are preserved in `../charters/celeste/BASE-BANKED-ROOMS.json`. P's new carried-lantern aura changes presentation only.

**Ten candidates:** H-F, K, K-F, M, M-F, N-F, O-F, P-F, Q, Q-F. A–F remain under Original Demonstrations. There are 25 rooms in four independent playlists. Full combinations and verification: [Base and Fractured review](BASE-FRACTURED-ROOMS.md).

K and K-F use fixed, individually authored flight charges, sharp spring redirects in all four cardinal directions, and three long cable gaps after natural flight expiry. Their completion screens show each real pickup's remaining time. Rounded carved passages share their collision geometry with their artwork. M's first launch is raised and its second vine is required for the exit; M-F has a separate hoist/return/root/bell/anvil route.

H-F connects switched supports to ring, pogo and bell, ending in a plain dash-through rift. N-F descends under delayed pursuit before a vault/pogo/ring climb. O-F uses three recoil directions, a crumble transfer, ceiling inversion, cable and ring. P-F retains its approved layout, prevents sustained dash flight, and returns missed lantern throws. Q and the independently arranged Q-F require anvil rebounds to reach their cable mouths; Q-F ends with uppercut, bell and a plain rift. Full review: [Current room guide](BASE-FRACTURED-ROOMS.md).

P's slow fall comes from CARRYING the lantern. It is not a fixed low-gravity region. Rising green motes and a contained aura follow the knight only while carrying it; throwing releases the effect.

## Changes applied to the first three levels now

- **Outskirts:** the existing jumping stones/refuges gain layered stone, moss, hanging roots and crack detail on actual crumble surfaces. Collision and the single-jump opening remain unchanged.
- **Black Woods:** the existing up-strike targets become resin pods rooted in the canopy, with a pale underside, recoil and shedding seeds. The first-use input hint remains. The one-pod and three-pod challenges remain in place.
- **Broken Causeway:** the freight carrier gains its supporting gantry, routed cable, wheels and moving counterweight. Its motion, launch window and mandatory return behavior remain unchanged.

## Placement decisions to make next

| Introduce after… | Good first use | Later combination to consider |
|---|---|---|
| Basic jump | Broad crumble rock with safe recovery | Narrow ledge chain, then a moving carrier transfer |
| Sword | One obvious hanging pod | Pod → landing → second pod; eventually moving pod N |
| Dash | One ricochet bell or one dash-driven rail | Rail → vault; full G only once its component abilities are available |
| Double jump | I's crumble cadence in a shorter teaching section | Full I with pogo/bell/vault after downward strike is established |
| Downward strike | Shell-beetle rebound above visible safe ground | Full L once chainhook/tear use is familiar |
| Gravity flip | One lodestone and an obvious opposite surface | J's two woven halves, preserving the rest during introduction |
| Chainhook / tears | Catch and release with a clear destination | Hook → vault, or O's final release after the rail relay |
| Aether form | Still air and one seed lantern | K's three passages; only then a separate wind lesson |
| Bell familiarity | M's visible seed/branch response | P's timed sluice, then mixed reactive environmental puzzles |

These are placement proposals, not changes to unlock order. G/H/I/J/L are demanding complete sequences: transplanting them before their kit exists would recreate the missing-ability problem. Short excerpts can teach their vocabulary earlier without unlocking every advanced move at once.

The useful lesson from [Celeste's forgiveness notes](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) is to make demanding geometry coexist with tolerant input interpretation. Its [Farewell design retrospective](https://exok.com/posts/2019-11-25-chapter-9-design/) also describes new objects supporting a coherent setting and remixes building into longer sequences. K's crags therefore have physical stepped silhouettes; their collision is not an invisible rectangular column hidden behind thorn art.

## Verification and scope

The workshop has 25 legal-input recordings, four playlists and nine protected banked layouts/tapes. Current candidate checks cover mechanic dependencies, pickup telemetry, flight expiry, active shortcut searches, lantern recall and clean retries. Native input, original-course and simulated two-client checks remain available. See [current verification](WORKSHOP-REVIEW-243.md) for results and limits.

The existing five opening carrier/blade routes and the first-three presentation checks remain available. The removed Outskirts carrier is not current content. Co-op verification uses production packet handlers and simulated transport, not internet latency. Nothing has been published.

Earlier source research and design rationale: [CELESTE-ROOM-RETHINK.md](CELESTE-ROOM-RETHINK.md). Local release audit still has four known failures: the Astra/Fable editor references and index/renderer size budgets; these are outside this room-design pass.
