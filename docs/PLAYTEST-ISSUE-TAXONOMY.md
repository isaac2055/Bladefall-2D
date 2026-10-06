# Playtest issue taxonomy

A running, categorized record of the problems the owner finds in play, what they were, how
they were fixed, and how to look for the same kind of thing next time. Started 2026-09-27
(7.231.0) from the owner's review of levels 1 and 2.

**Use it like this.** Before calling any region done:

1. Run the audit: `node scripts/audit-playtest-issues.mjs --stages <n,…>` (or `--stages all`).
   Each finding carries one of the codes below. A finding is a lead to look at on screen, not a
   verdict — some are intentional; the "known and intended" list at the bottom says which.
2. Walk the manual checks for the categories the audit cannot see (T, D, C, S).
3. Add every new owner report to the log at the bottom with its code, so patterns show up.

The audit reproduces the owner's 2026-09-27 reports on the pre-7.231 tree (E1 at 3240, P1 at
the start and 6520/6540, P2 at 6385/6455, F1 over Watcher's Cut and Broken Muster, I1 at the
Milekeeper's reserve, V1 in three drawers) and reports none of them on 7.231.

---

## Categories

### L · Level geometry and traversal

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **P1** | Clutter: stacked, duplicate or purposeless platforms | Ledges piled at nearly the same height; two routes drawn over each other; platforms that serve no job ("a lot of platform clutter here at the start", "platforms above the ground are completely pointless") | Audit P1 (spans overlap, <40 apart in height). Manual: for every ledge ask "what does the player HAVE to do with this?" | Merge into one readable structure, or cut. Keep quest geometry from overlapping road geometry. |
| **P2** | Threading: a ledge overlapping the one below by less than a body, with less than a jump of headroom | "The gap from the left-in is too narrow" — the way up is a precise diagonal under a lip | Audit P2 (overlap <26, height gap 40–64) | Either a clean diagonal gap (≥10 apart) or a generous overlap (≥40) so a straight jump lands. |
| **R1** | One-way ledge / no way back up | You drop somewhere and can't jump back to where you were; "requires a lot of backtrack" | Audit R1 (nothing within one jump below or level). For a real answer, `scripts/level-probe.mjs` `search()` with the stage kit. | Add a step on the way back, lower the ledge to within the kit's rise (single jump ≈ 78–82 up, ~136–148 across; see memory "full-kit reach"). |
| **F1** | Floor trivializes the platforms | "Being able to walk the floor trivializes all the platforms" | Audit F1 (≥3 raised platforms over walkable, harmless floor) | Blighted ground (7.231) under the route, a gate the platforms own, or cut the platforms (P1). Don't widen gaps (width gates nothing below ~800). |

### E · Enemies

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **E1** | Patrol authored past its footing | "This enemy facing left just aimlessly walks left constantly" — jittering at a ledge forever | Audit E1 (patrol end over no floor at the enemy's height) | Engine (7.231): a ledge is now the patrol's turn point (`outskirtsEncounterMove`). Data: keep patrol ends on the footing. |
| **E2** | Fall-and-respawn loop | An enemy "glitching out of the world over and over, endlessly falling"; flashing white | Audit E1 flags patrols/spawns over no footing; `scripts` probe: log enemies whose y drops below −40 repeatedly | Ledge guard after all AI movement (a grounded walker can't step into a drop it couldn't land from); fall resets use a footing inside the surface, and a second fall within 4 s sends it to its spawn |
| **E3** | Enemies standing in hazards | "This enemy ... shouldn't start on the poison ground, rather they should stay off it" | Manual; blight zones vs patrol ranges | Walkers treat blighted ground as a ledge (both the step guard and the ledge guard); patrol ranges kept on clean ground |
| **V1** | Perception clutter (vision cones) | "The red vision area enemies have should be removed entirely" | Audit V1 (a notice-range wedge filled with `lineTo`) | Removed everywhere (renderer `drawAwareness` and both legacy drawers). Seen = a small red "!" over the head only. |
| **E4** | An area attack that lands in mid-air | "Does an AOE that is way up in the air (those should only hit on the ground)" | Manual: stand on a ledge and in the air near each ground-attack enemy | Ground attacks resolve on the floor under the target; a target off the floor gets a projectile instead (Black Woods spore cloud, 7.234) |

### I · Interaction

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **I1** | Raised interactable usable from below | "I can interact with the Milekeeper's reserve without being on that platform (I just jump and click up when close)" | Audit I1 (installs the post-recall reserves, then tests a knight on the floor below and at jump height) | `standingOnSupportOf(o)`: relics, reserves, survey markers and the sentinel vigil need the knight standing on the surface they rest on. |
| **I2** | A prop stealing the Up key from a character | "The clockwork defector: someone here could use a hand" instead of talking to him | Manual: stand on every speaker and press Up | Backdrop props are scenery, not Up targets (7.234) |

### T · Transitions and set dressing

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **T1** | A door or exit floating over the backdrop; stepping off the map | "It doesn't make sense to have a door over the existing backdrop" | Manual: load the exit cold at the camera's end clamp and look. Ask: does the door belong to a wall that meets the edge of the world? | The Mothlight gatehouse: the door is cut into a boundary wall that runs to the screen edge and above the frame, with a buttress, roots, rubble and a canopy that thins into the backdrop. |
| **T3** | A reveal framed off-centre | "Want the oathblade to be more center screen when this happens" | Manual: trigger each cause→effect beat and look at the frame | Put the effect near the cause (stump down-right of the counterweight) and centre the scripted camera on both |
| **T4** | Arriving at the wrong end | "When I go back from causeway into blackwoods, it pops me into the very start" | Manual: cross every seam both ways | Pin each seam's arrival (`compatibilityZoneArrival`); world doors per seam (`WORLD_DOORS`) |
| **T2** | A region change with no motion | "I'd like the character animated into the door, coming animated out the door" | Manual: cross the seam both ways | `G.gateWalk`: walk to the door, into its depth (scale + fade), and out of the matching door on the other side. Used both directions. |
| **T5** | Props off their footing or behind play geometry | "The flowers are hanging over the side of the ground"; "the clock is behind a platform" | Screenshot every prop at in-game scale | Move the prop onto solid footing or into its own clear space |

### S · Systems and onboarding

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **S1** | A resource the level can't give | The weaponless Outskirts could never earn a flag (flags come from kills) — "I should start out with a checkpoint" | Manual: for each region, can the player earn every resource its rules assume? | Every fresh run starts with FLAG 1/1. |
| **S3** | Automatic checkpoints | Local "R · RETRY CROSSING" retries; story moments that silently move the respawn point ("never any auto-checkpoints beyond the start of every new level") | grep `activateRuntimeCheckpoint(` callers | `activateRuntimeCheckpoint` ignores plain checkpoint activations unless they are the knight's flag; progress and loadout are still saved at those moments. Level entrances and chosen rests remain. Crossing retries removed |
| **S2** | Teaching at the wrong moment, or more than once | "Be encouraged to place one after I first die and never again" | Manual: which hints fire, when, and whether they repeat | `showFirstFallFlagHint()`: after the first death of a save, only if a flag is in hand; `meta.flagHintShown` stops it forever. The flag counter pulses for 9 s. |
| **S4** | A reward that doesn't say what it gives | "What does 'you accepted the help offered here' do?" | Manual: finish each quest and read the message | Name the thing and its effect ("a vitality fragment — four add a measure of Blood"; "+2 Blood") |
| **S5** | A reward from the wrong source | Vitality from a shop counter on every visit; a fragment lying in the open; a Vault key for breaking the mandatory road | Manual: for every permanent reward, what earned it? | Permanent rewards come from optional quests or hidden routes, never the critical path or a store |
| **S6** | The world forgets what you took | "After getting the bow but dying … the bow spawns again in the level" | Manual: take each pickup, die before the next save, look again | Skip a pickup the loadout already holds |
| **S7** | The map points the wrong way | "The dream map … should not show White Court or the Gaol … only the Updrafts" | Open the map at each milestone | Show one next frontier, the lowest-stage one |
| **S8** | Progress on a set isn't shown | "It should show (Road Survey: 1/3) … glow green at 3/3 and then disappear" | Manual | A small HUD counter beside the flag while the set is in progress |

### D · Dialogue

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **D1** | Cryptic or portentous lines | "Make the dialogue more realistic and human-like, less cryptic" | Manual read-through in the Dialogue Editor (title screen) or `bladefall-dialogue.js` catalog | People talk about concrete things (the kettle, the patrols, a sore shoulder) and say what they want; instructions stay plain and true to what the player sees. |
| **D3** | Flat conversation presentation | "Like Celeste: zoomed on their face, mouths move, text scrolls unless skipped, game visible behind" | Manual: open each speaker | Portraits + typewriter + zoom (`bladefall-portraits.js`, `bladefall-conversation.js`) |
| **D4** | Text that can't be revised | "I want to be able to edit everything you can read" | Dialogue Editor catalog vs what the game shows | `BladefallText` override layer at every display sink + generated catalog + editor export/import |
| **D2** | Undifferentiated voices | "Voices individualized via prosody, vocabulary, dialect" | Hide the speaker names and try to tell who's talking | `docs/writing/VOICE-BIBLE.md` — rules per speaker (rhythm, vocabulary, dialect markers, what they never say). New lines are checked against it. |

### C · Characters

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **C1** | Interactable characters that look alike | "Interactable characters should be as visually distinct as … the fight 42 guy" (the Cloaked Man, phase 1) | Render each beside the knight at in-game scale (`docs/concept-art/residents/lineup.png`). The Cloaked Man's bar: unique silhouette, one signature colour, a signature moving element, readable at pixel scale. | `public/bladefall-resident-art.js`: a body per person keyed by id; design sheet `docs/concept-art/residents/DESIGNS.md`. Not green-hooded (that reads as an enemy), not the knight's blue. |
| **C2** | A character who is suddenly somewhere else | "Mara appears far ahead of you — it should show him going forward, faster than the knight" | Manual: follow each traveller after the first talk | The traveller runs the route on screen (jumps gaps, hops enemies) to the destination |

### M · Mechanics and their introduction

| Code | Name | What the player sees | How to find it | How we fix it |
|---|---|---|---|---|
| **M1** | Too much, too soon | Two new moves back to back when first met ("upslash immediately followed by down pogo"); a mechanic in a level whose job is something else ("for celeste mechanic in outskirts... how about none") | Manual: list every new verb/device per region, in order. One per region; used once alone, then chained | One lesson at a time: Outskirts none; Black Woods the up-strike (once over a short pit, then three in a row over a long one); the Causeway the counterweight lift. Down-strike stays for later regions |
| **M2** | A safety net that erases the risk | A walkway under a jump ("this big bar ... completely negates the risk") | Manual: under every timed/mechanic crossing, what does a miss land on? | Real void under crossings. If the route must be walked back, give the return its own mechanism that only helps someone already across (the freight lift comes up when called from its far landing) |
| **M3** | A first-time prompt that never goes away, or never appears | Players don't know what a new symbol wants | Manual | One label over the first instance ("Up and strike"), gone after the first hit, never again (`meta.upStrikeTaught`) |

---

## Log

| # | Date · ver | Owner report (short) | Code | Where | Fix | Verified |
|---|---|---|---|---|---|---|
| 1 | 2026-09-27 · 7.231 | Platform clutter at the start | P1 | Outskirts 1100–1900: Rowan's five quest ledges strung over the road's creek hops and the Chalice ledge | One compact zig-zag scaffold on the bell tower (4 steps, 1140–1425), starting from the road's own creek hop at 1220/58; the Chalice's double-jump ledge moved alone to 2060/215 | Quest verifier (real movement, ballast → bell → camp) passes; probe: tower climbable, Chalice still needs the double jump; audit P1 clean |
| 2 | 2026-09-27 · 7.231 | Remove the red vision areas everywhere | V1 | `drawAwareness` (renderer, used by every region's art), two legacy drawers in `index.html` | No cone; a small red "!" over an enemy that has seen you | Screenshot of an alerted Camp Echo grunt; audit V1 clean |
| 3 | 2026-09-27 · 7.231 | Enemy walks left aimlessly | E1 | Camp Echo grunt: patrol end 3240 past its ground (ends 3180) | Ledge = turn point in the shared patrol mover; patrol data [2780,3150]; same fix for the Hollow Mile grunt ([7120,7525]) | Watched 14 s: walks to the lip, pauses, turns, patrols back |
| 4 | 2026-09-27 · 7.231 | Can't jump back up-left to the enemy (4th image) | R1 + P2 | Watcher's Cut: from 6570/12 the next ledge was 98 up; the way round threaded a 25-unit overlap | Step 6420/64; 6360 lowered 146→130; the three dash stepping plats cut (one duplicated 6520/170) | Probe: 6570/12 → sentry's perch in four single jumps; eastward chain driven by hand |
| 5 | 2026-09-27 · 7.231 | Walking the floor trivializes the platforms | F1 | Outskirts creeks and the Watcher's Cut low road; Black Woods canopy floor and Rootbound floor | Blighted ground: a green-violet mist; 1 Blood per ~2.2 s inside, drains in 3 s outside | Walking the whole low road with real input: 5 → 2 Blood in 7.1 s |
| 6 | 2026-09-27 · 7.231 | Milekeeper's reserve usable by jumping at it | I1 | Reserve at 7180/152 on a 130 ledge (and IRON stake, sentinel vigil) | Must stand on its surface | Floor below: no; mid-jump: no; on the ledge: yes |
| 7 | 2026-09-27 · 7.231 | Start with a checkpoint; encourage one after the first death, never again | S1, S2 | Checkpoint flag system | FLAG 1/1 on every fresh run; one-time hint after the first death | Fresh run shows 1/1; first death shows the hint + pulse; second death doesn't |
| 8 | 2026-09-27 · 7.231 | Pointless platforms above the ground | P1 | Broken Muster "survey lookout" (three ledges over a safe camp floor) | Cut; IRON stands on the ground | Audit F1/P1 clean; Mara's survey still completes |
| 9 | 2026-09-27 · 7.231 | Animate into the door and out into Black Woods; connect the door to the edge | T1, T2 | Mothlight gate, Outskirts 13600 / Black Woods 120 | Gatehouse wall to the world's edge both sides; walk-in/walk-out both directions; invisible stop at the wall | Frame-stepped crossing both ways; screenshots at the end clamp |
| 10 | 2026-09-27 · 7.231 | Dialogue: realistic, less cryptic, individual voices (whole game) | D1, D2 | All spoken lines | See `docs/writing/VOICE-BIBLE.md` | Dialogue/side-story tests; see pass notes |
| 11 | 2026-09-27 · 7.231 | Interactable characters as distinct as the Cloaked Man | C1 | Every talkable character, stages 0–20 (44), plus the ten quiet residents | `bladefall-resident-art.js` | `docs/concept-art/residents/lineup.png`, before/after sheets 1–3 |

| 12 | 2026-09-27 · 7.233 | Oathblade release off-centre | T3 | Black Woods Oathblade clearing | Stump 2800→3640 (down-right of the 3425/205 counterweight); camera centres on both; guard to 3990 | Frame-stepped release: knight left of centre, freed blade right of centre |
| 13 | 2026-09-27 · 7.233 | Dialogue editor must work and cover everything readable | D4 | Every display sink | See the dialogue-editor pass notes | Headless edit → reload → shown, per text kind |
| 14 | 2026-09-27 · 7.233 | Celeste-style talking scenes | D3 | Every conversation | Portraits, mouth frames, typewriter, skip, zoom | Contact sheet `docs/concept-art/portraits/` |
| 15 | 2026-09-27 · 7.233 | Outskirts enemy standing on the poison | E3 | Camp Echo platform-bypass grunt (patrol ran into the creek) | Patrol [3480,3790]; walkers avoid blight | — |
| 16 | 2026-09-27 · 7.233 | Enemy endlessly falling after the jump (Outskirts); white enemy glitching over the edge (Black Woods) | E2 | 7.232 moved a Hollow Mile grunt to 8570 (over the pit) and a canopy toxling to the cut's edge | Outskirts crossing removed; ledge guard; repeat-fall → spawn | Probe: 20 s near each — no enemy below −40, no repeated resets |
| 17 | 2026-09-27 · 7.233 | Remove "R Retry crossing"; recommend a flag once after the first death; no auto-checkpoints | S3, S2 | Crossings (stages 0/1/2 and their echoes 21/22/25), every `activateRuntimeCheckpoint` caller | Retries removed; first-fall hint (7.231) kept; plain checkpoint activations ignored unless the knight's flag | Keep/Frostfell tests updated to "the respawn point stays put, progress still saves" |
| 18 | 2026-09-27 · 7.233 | Up-pogo only in Black Woods: once, then three in a row; "(up and strike)" once | M1, M3 | Black Woods 4480–4720 and 6200–6740 | One blade over a 240 pit; three blades 170 apart over a 540 pit; label until first hit | Lab: 1 strike crosses, 0 fails; 3 strikes cross both ways, 2 fail |
| 19 | 2026-09-27 · 7.233 | Animate Black Woods ↔ Causeway both ways | T2 | Root tunnels (Woods 12250, Causeway 130) | Root-wall gatehouse art; door walk both ways; a sealed door refuses before the walk | Frame-stepped both ways; refused without the Oathblade |
| 20 | 2026-09-27 · 7.233 | Coming back from the Causeway lands at the start of Black Woods | T4 | `black-woods-brute` arrival | Pinned to 12160 (out of the east root tunnel) | Crossed west: arrived at 12160 |
| 21 | 2026-09-27 · 7.233 | Causeway: the bar under the counterweight negates it; make the gap a LOT wider; the counterweight belongs here | M1, M2 | Causeway 8520–9225 | No floor/bridge under the lift; landing 100 above the lift top and 160 across (was 90 across, level); the lift comes up and waits for anyone on the far landing | Lab: lit launch lands, unlit falls; westbound return works at all 16 timings |
| 22 | 2026-09-27 · 7.233 | Pancaked platforms by the clockwork defector | P1 | Silas's steps duplicated 11240/195 and lay on the 130 court row; two boss "shot perches" sat 25 above the archery steps | Duplicates cut / merged | Audit P1 clean; Silas route passes; rivets still reachable (flat arrows from the 195 step and 260 perch) |
| 23 | 2026-09-27 · 7.233 | No Celeste mechanic in the Outskirts | M1 | Hollow Mile "salvage cradle" (7.232) | Removed; Hollow Mile back to its authored road | Audit clean on stage 0 |
| 24 | 2026-09-27 · 7.233 | (found while fixing) Interactables in levels 1–3 usable by jumping at them | I1 | Silas and his brake/gate, two levers, the court shaft | Stand-on-its-surface rule for every raised interactable in stages 0–2 | Audit I1 clean on 0–2 |
| 25 | 2026-09-27 · 7.234 | Mouth movement too much while talking | D3 | `bladefall-portraits.js`, `bladefall-conversation.js` | A one-pixel slit, at most two pixels open, no teeth; closed half the time | Portrait sheet re-rendered |
| 26 | 2026-09-27 · 7.234 | "You accepted the help offered here" — what does it give? | S4 | Side-story reward (all stories) | Elsie gives a vitality fragment and says so; the others "patch you up. +2 Blood." | Read in game |
| 27 | 2026-09-27 · 7.234 | Flowers hanging over the ground edge | T5 | Outskirts white trumpets at 1300 | Moved to 1500, fully on the ground | Screenshot |
| 28 | 2026-09-27 · 7.234 | Clock behind a platform | T5 | Outskirts field clock at 3140 | Raised on a 74-unit post, face clear above the platforms | Screenshot |
| 29 | 2026-09-27 · 7.234 | Mara should visibly run ahead after the first talk | C2 | Outskirts traveller | Mara runs the road on screen to the survey (see handoff) | Agent lab run |
| 30 | 2026-09-27 · 7.234 | Road Survey 1/3 … 3/3 in the HUD | S8 | HUD beside the flag | Counter, green at 3/3, then hides | Agent lab run |
| 31 | 2026-09-27 · 7.234 | Cut shops for now | S5 | `SHOPS_ENABLED=false`; Level Select previews skip workshop rewards | No shop objects in any stage; shopkeeper art kept | Stages 1/3/5: 0 shops |
| 32 | 2026-09-27 · 7.234 | Black Woods vitality fragment poorly placed | S5 | Free-standing fragment | Now Elsie's reward for her optional supper quest | Read in game |
| 33 | 2026-09-27 · 7.234 | Enemy AOE lands way up in the air | E4 | Black Woods canopy/tunnel controllers (roots) | Roots only on the floor; a knight off the floor gets a drifting spore cloud | Lab: floor → roots at y 0; air → spore projectile |
| 34 | 2026-09-27 · 7.234 | Dying in the Causeway before a flag sends you to the end of Black Woods | T4 | Cloaked Man arrival hook answered every seam with its own spawn (x 150, beside the root-tunnel door) | Hook answers only its own zone | Respawn and seams checked both ways |
| 35 | 2026-09-27 · 7.234 | Bow spawns again after dying | S6 | Causeway bow rack | Skipped when the loadout already holds a bow | Lab: no duplicate |
| 36 | 2026-09-27 · 7.234 | Say B switches bow to sword at the gear; "someone here could use a hand" blocks talking to Silas | M3, I2 | Defector side story | "B · sword" over the gear while the bow is out; backdrop no longer an Up target | Lab: Silas talkable after completion |
| 37 | 2026-09-27 · 7.234 | Dream map after the Brute shows White Court and the Gaol | S7 | Recovery map frontier | One frontier: the lowest-stage open zone (the Updrafts) | `tests/recovery.test.mjs` |
| 38 | 2026-09-27 · 7.234 | Dashing through the root seam gives a "room key" | S5 | Black Woods root seam → Updrafts | Opens the wind shaft only; no Vault key | Lab: keys 0 → 0, shaft open |
| 39 | 2026-09-27 · 7.234 | Too much going on at the Updrafts start | P1 | Bellows Rest 1500–2250 | Shop gone; the Cartographer's stairs/frames/anchor wait until the portal gun is owned; Ilyra moved to the east edge; four tanks → two | Screenshot; apparatus returns with the portal gun |

Before/after frames of rows 1–9: `docs/playtest/7.231-before-after.png`.

## Known and intended audit findings (7.231)

- **R1** Outskirts 2060/215 (Chalice) and 7180/130 (Milekeeper's reserve): double-jump return content, reachable only on a later visit by design.
- **R1** Black Woods 3900/118, 5980/185, 9230/350: the way *down* from the Oathblade climb, the canopy, and a Mirror Thicket rest — each is dropped onto, never climbed to.
- **P2** Black Woods 9600/620 → 9770/560: the drop off the root crown onto the Rootbound stair.
- **F1** Black Woods 2948–3985 (Oathblade climb) and 7735–9410 (Mirror Thicket): the floor can be walked, but the counterweight and the root wall make the climbs mandatory.
- **R1** Causeway 9115/300 (the freight landing): reachable only by the lift's lit launch, by design.
- **P1** Causeway 10750@130 / 10880@130: Silas's maintenance lift docks against the court row.
- **F1** Causeway 5810–7350 (the Chainwalk over the covered low road — an owner-accepted route choice), 9415–10050 (steps down off the bulkhead), 10590–11915 (the Brute arena's archery steps; the fight needs the floor).
- **P2** Causeway 12340@110 → 12455@170: arena exit steps (not yet reviewed with the owner).

## Open questions for the owner

- **Quiet residents beyond the first three regions.** 7.232 made the quiet residents of stages 0–2
  talkable (Olan, Orra, Pell, Hale, Vey, Sable). Talla, Edrin, Senn and Veya (stages 3–5) are still
  `quietV4` — their rewritten lines never show. Decide whether they should talk too.
- **The Root Key needs a quest (7.234).** The root seam no longer awards it, and the Vault still
  requires seven keys, so the Root Key currently has no source. Which Black Woods quest should give
  it — Elsie's supper (already gives the vitality fragment), a new errand, or a later return visit?
