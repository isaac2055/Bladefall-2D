# Room by Room (7.259): the whole game after Merge Pitch A

Isaac's brief (1 Oct 2026, scheduled task `bladefall-2d-redesign`):

- Of the three Merge Pitches, **A · The Outskirts, room by room** is the one he likes best.
- Redesign the whole game in that format: the 20 base regions first, then the 20 Fractured ones.
- The Outskirts draft is too short.
- Integrate the quests. Keep them optional, and reconsider their rewards, because the game is now a different game.
- Work slowly and well. Stop when finished, not after endless testing. Stop if another agent is working in the tree.

**Where it is:** Title → Merge Pitches → **Room by Room · the whole game** (`precision.html?pitch=rbr`, or `&region=N` to start a region directly). Regions appear in the list as they are built. Nothing in the campaign, the Precision Courses, the gate trials or the other pitches changed.

## How a region plays

- **One region is one run of linked screens.** Rooms slide into each other as in Pitch A. Isaac requested per-room reviews on 1 Oct: these now appear at each exit by default (difficulty 1–10, fun 1–5, optional issue checkbox and note). Turn them off via Room reviews for uninterrupted transitions. The region summary follows its last room review.
- **People stand in the rooms.** They speak when the knight walks up, with no conversation screen.
  - A person can leave once you have heard them (`leave:'right'`). For example, Mara runs the road ahead of you to the Muster. This follows the "characters travel on screen" rule.
- **Every room asks one question.** The question is in the room definition and is not shown. The hint names a rule and never a sequence.
- **The kit:** jump, climb and dash from the start, as in Pitch A. Later verbs arrive with the region that earns them:

  | Verb | Arrives with |
  |---|---|
  | Blade | The Oathblade, Black Woods (2) |
  | Parry | The Marksman's returned shots (5) |
  | Portal key | The Ruined Keep (6) |

  Rooms lock any verb not yet granted (`lock`, enforced by the core, so tapes and verification respect it too).
- **One new device per region.** It is shown alone, then chained, then combined with what came before at the region's end. The device modules are the ones Parts VII–XX already use (see the table below).

## Quests and their rewards

Quests branch off the road and come back to it. A quest is never needed to finish a region.

- **A branch quest** (Rowan's bell) starts from a room with a second exit (`side`). Leaving by it plays the quest's own rooms, which are harder than the road. The last of them returns the knight to the room he left, at the quest's door (`back`).
- **A bearing quest** (Mara's survey) sets its pickups off the road in several rooms. Each pickup is a precision detour.
- **What the reward is, now that there is no health, gold or vitality.** A finished quest gives a **keepsake**: a named object from that quest (Rowan's Bell, Mara's Chart). Every keepsake says what it gives:
  1. **It changes the world you can see.** Rowan's bell hangs at Camp Echo's post, and the person's line changes.
  2. **It opens that person's echo in the Fractured counterpart.** This is an optional, harder side branch in the Fractured region. Only someone holding the keepsake can enter it. Clearing the echo gives a **remembrance**, shown at the end.

  So base quests feed the Fractured act. The reward is more of what a precision player wants (harder, optional rooms), plus the story of the person. It is not a stat. This follows the rule that rewards come from optional quests or hidden routes, never the road, and that a reward names what it gives.
- **Isaac's call:** whether keepsakes should also do something mechanical, for example a cosmetic, or opening the capstone at the end.

## Standards each room is held to

- **An intended tape.** Every room finishes on its tape with no deaths (`npm run verify:rbr`). The pause menu's "watch the intended route" plays it.
- **Branch rooms have a second tape.** A room with a side exit has a `#side` tape, and a room holding a bearing has a `#bearing` tape.
- **No ordinary-play skip in an introduction room.** A room that introduces a device must need it in ordinary play: `node scripts/rbr-skip.mjs <room> --without <event> --plain` finds no route without it. Useful events:

  | Event | Means the knight… |
  |---|---|
  | `refill` | took a crystal |
  | `crumble-shake` | stood on cracked stone |
  | `grab` | climbed |
  | `stone-lit` | touched a stake |

  `--plain` excludes the precision kit's expert tech (super/hyper, ultra, wall-bounce).
- **Combination rooms:** the intended route uses each device, and the skip hunt is advisory. A plain skip it finds is logged in the region's source header, not chased forever. In practice the kit nearly always finds a second use for a block, such as wall-jumping off a cracked ledge's side.
- **Tech skips are allowed** and noted, as mastery (Celeste's convention). The kit is strong: a hyper flies about 30 tiles, and any block's side is a wall jump. So a gap-width gate never holds. **Gate on height, poisoned faces and footholds that are the only surface.**
- **One new thing per region**, introduced alone, then chained, as in Isaac's levels 1–3 review.

## Region table

| # | Region | Device (module) | Kit added | Quests (optional) | Status |
|---|---|---|---|---|---|
| 1 | The Outskirts | crumbling road, crystals, survey stakes, lantern + plate (core) | jump, climb, dash | Rowan · A Bell for the Camp (branch); Mara · A Road Without a Name (bearings) | **built** |
| 2 | Black Woods | moth pods + bells/toggle blocks: true and false footing (core) | blade | Elsie · A Place for Supper | **built** |
| 3 | Broken Causeway | slide stones, zip lifts (core); the Brute (dev-rbr-causeway: a hound only weight can kill) | — | Silas · The Clockwork Defector (branch) | **built** |
| 4 | The Updrafts | winds (dev-frost winds: thermals, drafts, crosswinds), springs; dev-rbr-updrafts emits a `wind` event for skip hunts | — | The Blind Cartographer (branch) | **built** |
| 5 | Hollow Marksman | foes and combat actors (archers, bolts), parry-return | parry | The Recruit · Borrowed Courage; Daro · The Open Watch | **built** |
| 6 | Ruined Keep | lantern, plates, held doors, portals | portal | The Archivist's Burden; Tovin | **built** |
| 7 | The Warden | jailers, pressure pods (dev-gaol) | — | The Service Keeper · Stand Aside | **built** |
| 8 | Frostfell | ice, wind, frost feather (dev-frost); hearths | — | The Perfect Day | **built** |
| 9 | Frost Sorcerer | freezing pools (dev-water) | — | A Little Winter | **built** |
| 10 | Emberdeep | heat slabs (dev-ember) | — | The Quota | **built** |
| 11 | Ember Colossus | anvils, belts, moulds (dev-foundry) | — | Small Work | **built** |
| 12 | The Inversion | gravity prisms (dev-gravity) | — | Tea on the Ceiling | **built** |
| 13 | The Void Tyrant | spent footholds (dev-citadel), portal-return wards (dev-rbr-tyrant) | — | The Other Side | **built** |
| 14 | The Abyss King | echo and wake (dev-throne) | — | The Last Alarm | **built** |
| 15 | The Deep Line | carts, rails, switches (dev-rail) | — | The Bell Below | **built** |
| 16 | Thunder Cliffs | hook rings, moving decks (dev-hook) | — | Good Luck | **built** |
| 17 | The Landing Shores | the tide and floats (dev-water) | — | All at Once | **built** |
| 18 | The Colony | watch lights and smoke (dev-watch) | — | One Spoon at a Time | **built** |
| 19 | The Path to the Palace | beams, mirrors, shutters (dev-beam) | — | The Lightest Pilgrim | **built** |
| 20 | Sunspire Palace | light through portals (dev-beam + portals) | — | The Night Garden | **built** |
| 21 | Fractured Outskirts | moving hammer and shoulders, three bells (dev-rbr-f-outskirts) | strike locked | Mara and Rowan remembrances | **built** |
| 22 | Fractured Woods | bound Oathblade and timed resin branches (dev-rbr-f-woods) | blade reclaimed | Elsie’s remembrance | **built** |
| 23 | Fractured Causeway | lifts and stones, three Iron Echo weight courts | — | Silas’s remembrance | **built** |
| 24 | Fractured Updrafts | reversing thermals (dev-rbr-f-updrafts) | — | Cartographer’s remembrance | **built** |
| 25–40 | The remaining Fractured regions | the same device, harder: 3–5 linked decisions per room, few rests | — | each base person's **echo** (needs that keepsake) | planned |

The quest sources are `public/bladefall-side-stories.js` (20 regional stories) and the ledger quests in `docs/plans/campaign-quests-and-precision-integration.md`. The second has a physical route per story that translates directly into branch rooms.

## How to build a region

The files, all keyed by region number NN:

| File | Role |
|---|---|
| `scripts/rbr-src/NN-<key>.mjs` | The source. Rooms as ASCII. `scripts/rbr-src/build.mjs` paints rectangles. |
| `scripts/rbr-src/NN-<key>.tapes.json` | The tapes. |
| `public/bladefall-rbr-NN-<key>.js` | Generated by `node scripts/rbr-src/gen.mjs NN`. Never edit it by hand. |

**Add the region to the page:** append `'NN-<key>'` to `FILES` in `public/bladefall-rbr.js`, and add the file to `public/sw.js` and `build-deploy.sh`.

**The tools:**

| Command | What it does |
|---|---|
| `node scripts/rbr-find.mjs <room> [--side] [--shard --as bearing] [--via c,r] [--acts jump\|dash\|climbdash\|blade\|all] [--plain] [--require event,event] [--start prefix.json] --save` | Beam-searches an intended tape, polishes it and saves it. Prefer the smallest action set that solves the room, so the tape reads like ordinary play. Hand-written tapes are fine too. |
| `node scripts/rbr-skip.mjs <room> --without <event> --plain` | The skip hunt. |
| `node scripts/verify-rbr.mjs [NN]` | The region's checks. |
| `node scripts/rbr-shot.mjs <dir> play:NN` | Plays the region through the real view in headless Chrome, shooting each room. |
| `node scripts/pcore-digest-all.mjs --check <file>` | After any core change, proves every older room replays identically. |

**Conventions for rooms:**
- The floor is usually row 18, and the spawn is usually row 17.
- Room ids are `<letter><NN>-<slug>` (for example `o1-road`).
- People and props are drawn by the pitch view's helpers. Room by Room adds its own in `bladefall-rbr-view.js` (FOLK entries; `extraProp`).

## Progress log

| Date | Region | Main rooms | Quest rooms | Notes |
|---|---|---|---|---|
| 2026-10-01 | 1 · The Outskirts | 12 | 2 | Framework built. Pitch A's rooms kept, with Mothlight moved to Black Woods. |
| 2026-10-01 | 3 · Broken Causeway | 12 | 2 | Built by a helper; reviewed and accepted. The Brute is a Combat hound that only falling weight kills (`bladefall-pcore-dev-rbr-causeway.js`). Known advisory skips are listed in its source header. |
| 2026-10-01 | 4 · The Updrafts | 13 | 2 | Built by a helper; reviewed and accepted. Wind and springs; the Cartographer's branch. |
| 2026-10-01 | 2 · Black Woods | 12 | 2 | Built by a helper; reviewed and accepted. Rootbound Passage spawned the knight touching wall thorns (one idle frame killed him); fixed. `verify-rbr` now checks idling at every spawn and a 14-frame-late tape. |
| 2026-10-01 | 5 · Hollow Marksman | 12 | 2 + bearing | Built by a helper; reviewed and accepted. The Marksman is new code (`bladefall-pcore-dev-rbr-marksman.js`). Rooms with him or bows use `study` (wait for first input). |
| 2026-10-01 | 6 · Ruined Keep | 12 | 3 | Built by a helper; reviewed and accepted. The Gallery's hand-written tape desynced; re-found with `rbr-find --acts climbdash`. |
| 2026-10-01 | 7 · The Warden | 13 | 2 | Built by a helper; reviewed and accepted. The Warden is new code (`bladefall-pcore-dev-rbr-gaol.js`). |

| 2026-10-01 | 8–11 · Frostfell through Colossus | 51 | 8 | Reviewed and accepted by Codex. All routes and branches pass; corrected e10-moulds tape. |
| 2026-10-01 | 12 · The Inversion | 12 | 2 | New linked region; ordinary-movement tapes, gravity introduction skip check, real-view playthrough and neighbours branch pass. |
| 2026-10-01 | 13 · The Void Tyrant | 12 | 2 | Spent ledges, three portal-return wards, and the Figure’s echo-contact branch. All routes, real-view playthrough, quest return and portal-necessity checks pass. Crown withdraws instead of dying. |

| 2026-10-01 | 14 · The Abyss King | 13 | 2 | Paired body marks, echo swapping, wake, three-wound Right Hand and all-clear bells. All routes, browser playthrough and branch pass; device tests cover paired bodies, sustained seals and the exact signal. |
| 2026-10-01 | 15 · The Deep Line | 13 | 2 | Integrated Part XV cart courses as an east/west journey, with new cart-driven rescue cage and nearby Miner escort to the ledger. All routes, browser playthrough and branch pass. |
| 2026-10-01 | 16 · Thunder Cliffs | 13 | 2 | Integrated hook/deck courses plus new rigging/charm branch. Returned Fire now waits for first input, fixing idle-start parry desync. All rooms and branch reviewed in the real view. |
| 2026-10-01 | 17 · Landing Shores | 12 | 2 | Integrated tide/momentum courses plus new wreck-and-cabin birthday branch. Intended branch route rides the float then catches the ring. All rooms and branch reviewed in the real view. |

### Layout audit correction (Codex, 1 Oct)

The 15–19 main routes reused Precision Course geometry. The region brief explicitly disallows this. Passing replay/browser checks therefore does not accept these regions: their main layouts are being newly authored. Keep their new quest branches and device work, and review again after the replacements. Regions 1–14 remain accepted.

### Owner clarification (1 Oct, supersedes layout audit)

Isaac explicitly approved reusing some or most Precision Course rooms as long as they flow as one full level, like Claude’s early examples. Keep the integrated 15–19 work; no layout rebuild is required. Continue forward with the remaining levels.

| 2026-10-01 | 18 · The Colony | 12 | 2 | Integrated watch-light routes and new old-shelter branch, with a left-hand optional entry. Routes, browser playback and return/reward pass. |
| 2026-10-01 | 19 · Palace Path | 12 | 2 | Integrated mirror/light routes; new cargo sling delivers the Pilgrim’s sack only when the knight meets it at the dock. Routes, browser playback and return/reward pass. |

| 2026-10-01 | 20 · Sunspire Palace | 14 | 3 | Integrated light/portal routes, three two-bloom King in Daylight hours, permanently shaded garden and hydra boarding. All routes, necessity tests, real-view playback and quest return pass. |
| 2026-10-04 | 17–20 · momentum out, tears in, harder King (7.280) | 10 / 11 / 12 / 14 | unchanged | The base road is plain: `s17-launch s17-buoy s17-super c18-speed c18-low p19-low` moved to the Fractured 37–39 (their reflected copies already live there); `s17-belled s17-landfall c18-watch p19-road s20-deliveries` re-routed with plain moves; `p19-gate` gained two stepping stones so it crosses low without a hyper. New tear rooms: The Tide Line (17, reached only from the high sea), The Washing Line (18, two tears and a lamp-swept chimney), The Sun Line (19, louvres on opposite beats). King in Daylight (opt-in `dayKing.need/beat/wave/suns`): three blooms an hour, a quickening glove, a sun-wave along the floor from the second bloom, and each bloom moves his sun. Sea Terrace (`hydraRide:{shafts,heads}`): the King's last light falls in shafts; the heads shade you in turn. verify-rbr 17–20 and real-view playback pass. |

Story-continuity follow-up before the Fractured act: add the chained-Hydra set piece to 16; its current course-route ending does not yet show the release referenced by 20. Keep the existing rooms.

## First Fractured echoes — 1 Oct 2026, Codex

Owner-approved course reuse continues. Regions1–22 now include324 rooms; all core routes, spawn-idle and delayed-start checks pass. Reviews remain default-on and the browser survey test passes.

| Region | Road | Quest | Review |
|---|---:|---:|---|
|16 Thunder Cliffs|16|2|Added three Hydra collars before the shore. Each requires two fresh hooked downward cuts. Main route plays cleanly; no-hook/no-blade/upward-cut alternatives do not release it.|
|21 Fractured Outskirts|11|4|Reused crystal/stone/lantern courses, three weaponless Sentinel attack rides and bells. Mara/Rowan branches stay sealed without their original keepsakes, grant remembrances and return correctly.|
|22 Fractured Woods|12|2|Reused crystal/pod/bell/zip courses, released-and-taken Oathblade, timed resin crown with a false branch and permanent rest. Elsie’s echo requires her lantern; branch and main route play cleanly.|

New checks: `verify-rbr-cliffs.mjs`, `verify-rbr-sentinel.mjs`, `verify-rbr-woods.mjs`. Branch browser check now verifies prerequisite sealing before granting a fixture keepsake. Screenshot playback now fails its process on bad transitions, deaths or browser errors. Version7.263.0/cachev377; local package rebuilt, not deployed.

Next is RBR23 Fractured Causeway. Match charters by name rather than stable stage ID: Causeway25 → RBR23, Updrafts23 → RBR24, Marksman24 → RBR25. Remaining RBR26–40 align numerically. No23 draft yet.

## Causeway and Updrafts echoes — 1 Oct 2026, Codex

Regions1–24 now contain351 rooms. RBR23 reuses Precision lift/lantern/mass routes and the existing armored Brute in three courts: west mass, mirrored east mass, and a central buffer beneath the last mass. Each route wins by crush; removing the downward mass drop or striking the armor cannot clear it. Silas’s key opens the echo branch and grants his remembrance. The new physics keeps its dash-from-start kit (the old charter’s pre-Brute dash lock described the legacy campaign progression).

RBR24 reuses the connected wind courses; First Breath, Lower Turn and Signal Crown have real upward/downward force cycles, with full-height warning rails and direction arrows. The Cartographer’s chime opens the two-room echo branch. All routes, idle/delayed starts and both real-view branch returns pass. Source1–24 were visually reviewed. New regression scripts: `verify-rbr-iron-echo.mjs`, `verify-rbr-breathing.mjs`. Version7.264.0/cachev378, local package only. Next: RBR25 Marksman (charter24), then26–40.
