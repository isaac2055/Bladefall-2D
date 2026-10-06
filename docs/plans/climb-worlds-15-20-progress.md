# The Climb · worlds 15–20, then the fractured worlds — progress

The hourly routine (`bladefall-climb-15-20-fractured`) keeps this file. The newest run is at the top. The plan is
`docs/plans/climb-worlds-10-20.md`; the working design is `LLM-HANDOFF/EMERALD-ASCENT-TRANSITIONS.txt`.
Worlds 10–14 belong to the other chat (built at 7.274.0). This routine does not edit them.

## Status at a glance (7.279.0, 2026-10-04, end of run 5: worlds 25–40 summarised in the run 5 entry)

| World | Road | Branches | Atlas / junctions | Art | page-check |
|---|---|---|---|---|---|
| 15 The Deep Line | built (a 48-tile turn drop into Westbound) | errand (the Bell Below) + secret (High Line, above Buffer Stop) | in: arrival 11–15, 13–15, 10–15 left, 12–15, 14–15 right; no road onward | rail / deepline | road OK, both OK* |
| 16 Thunder Cliffs | built | errand + secret | in: 13–16, 16–8; 16–17 | cliffs | road OK, both OK |
| 17 The Landing Shores | built | errand + secret | in: 16–17, 17–4; 17–18 | shores | road OK, both OK |
| 18 The Colony | built | errand (ceiling door) + secret (Lamplight, above Let Go) | in: 17–18, 18–2; 18–19 | colony | road OK, both OK |
| 19 The Path to the Palace | built | errand + secret (Sun Window, thick-ceiling door) | in: 18–19; 19–20, 19–1 (to the Outskirts' gate) | sunpath / palace | road OK, both OK |
| 20 Sunspire Palace | built | errand + secret (Ring Light) | in: 19–20; 20–14; gates 20–3, 20–5, 20–7 over the road | sunspire | road OK, both OK |

| 21 The Fractured Outskirts | built | Mara's + Rowan's echoes (ceiling doors, sealed until their keepsakes) + secret Super | in: 19–21 at a gate over the Glass Mile (no arrival junction); out 21–22, 21–23 | fractured | road OK, all entered* |
| 22 The Fractured Woods | built | Elsie's echo + secret Where You Stand | in: 21–22, 22–23; out 22–24 | fractured | road OK, both OK |
| 23 The Fractured Causeway | built (two turns) | Silas's echo + secret Stone Through Stone | in: 21–23, 22–23; end has no road onward | fractured | road OK, both OK |
| 24 The Fractured Updrafts | built | the Cartographer's echo (way back via a sideways chute) + secret Frozen Fall | in: 22–24; end has no road onward | fractured | road OK, both entered* |

*World 15's secret: entered, rewarded, its way back's opening works in reverse; page-check's scripted walk stops partway up the way
back's climbing shaft (`cl15-pass-56`) and the drop home from its entrance is not available (the secret starts on a cart). Worth a
look by eye next run.

"Both OK" = entered, reward saved, way back walked, its opening works in reverse, 0 deaths; the same pattern World 14 shows.

Ratings: **none of regions 15–20 are rated** (checked `docs/playtest/room-reviews*.csv/json` and `~/Downloads/room-reviews*` on
2026-10-04). Every world keeps Room by Room's designed order, as worlds 10–14 did. The cap (7) still applies to anything rated later.

## Run log

### 2026-10-05 evening, run 6 resumed (latest; read this first)

- **Base 1-20 done and in the page:** all rebuilt (worlds-r6, seam-cut builder), assembled; geography verifiers pass; page-check:
  every road at 0 deaths, every errand home. Secrets of 1 and 6: page-check's scripted door route misses, but the hold-Up lift
  enters both (lift-check). Secrets of 8, 15, 20: the scripted way back stalls in one climbing piece, but plain grab+up+side
  climbs through to home at 0 deaths (probe-wayback with hand-climb fallbacks). Gate rooms have no reward/home by design.
- **Device load order fixed:** precision.html now loads the 36 device modules in sorted file order, the order pcore-tape.mjs
  verifies every route in (the mirror pane was last on the page, so swapped rooms could differ between check and play).
- **Fractured 21-36:** agents finished; Climb orders applied (pool clashes fixed: p84 only in 28, p159a only in 36; fs29-q-intake
  unsaved; 21's gate hosts; 24's Funnel overrides dropped; 35's reserve back on the left). Builds queued (worlds-r6, run.sh).
- **Fractured 37-40:** agent resumed (third time).

### 2026-10-05 ~09:30, run 6 STOPPED AGAIN (usage limit) — latest state, read this first

- Base worlds 1-20: all rebuilt in .cache/worlds-r6 and assembled into the page (worlds/ now = new 1-20 + old 21-40; the
  7.279 set is backed up in .cache/worlds-7279). All geography verifiers pass. Roads in 1-20 play at 0 deaths.
- **Regression found and fixed in the builder, not yet rebuilt:** my `ringed()` proof let each piece's route run a tile past
  the real seam, so ways back stalled in page-check in most rebuilt worlds. `cutAtSeam()` now cuts each route at the real
  edge. Proven on World 10 (errand and secret home). **Next: rebuild 1-20 with run-reuse.sh (roads cached), assemble,
  page-check 1-20.**
- Fractured agents (workflow wf_20007fbe-744) stopped mid-work again; check verify-rbr 21-40 and the notes in
  docs/plans/fractured-progress/ before resuming (update the RESUME state line in the script; keep RESUME_BASE unchanged).

### 2026-10-04/05, run 6 (PAUSED by Isaac, 2026-10-05 ~04:00): Isaac's seven-item cleanup

**Pause state:** workflow resumed once and stopped again. Finished agents (cached on resume): map, runtime, devices, base 1-12,
**base 13-16, base 17-20**. Their Climb orders are applied to spec.mjs (11, 12 secret pools; 13, 14, 16-20 orders/pools; 18 hosts).
**Not finished:** Fractured 21-24, 25-28, 29-32, 33-36, 37-40 (stopped mid-work: run verify-rbr 21-40 first; netlify-deploy/
holds the pre-agent region files). Resume: Workflow scriptPath .../bladefall-game-cleanup-wf_20007fbe-744.js resumeFromRunId
wf_20007fbe-744 (prompts already carry a RESUMING note; update its verify-state line before resuming).
Climb rebuilds into scripts/climb/.cache/worlds-r6/ (run.sh N): done 1 3 5 6 7; left running 8 9 11 12 13 14 16-20 (local CPU,
may have finished); not yet assembled. Builder fixes ringed()/upright snapshot tested on World 10 (ways back built).

(earlier notes of this run:)

Workflow `wf_20007fbe-744` (resume: Workflow scriptPath .../workflows/scripts/bladefall-game-cleanup-wf_20007fbe-744.js with
resumeFromRunId wf_20007fbe-744; finished agents return cached). Results in its journal.jsonl.
- **Done (phase 1):** schematic zoomable map `public/bladefall-climb-map.js` + junction signs/bars (map agent); Inversion flip,
  hold-Up lift into ceiling doors (`scripts/climb/lift-check.mjs`), climbed-shaft handoff (runtime agent, climb-view.js);
  devices `bladefall-pcore-dev-{zipline,fault,shade,mirror}.js` + brief `docs/plans/fractured-hard.md` + lab
  `scripts/pcore-lab/` (devices agent); harder bosses 3/5/7/9/11 (opt-in fields) and no momentum in 1-12 routes (base agent;
  proposes p113->p114a for World 11, p113 to World 31).
- **Running/queued when stopped (phase 2):** base 13-16 (ziplines, Tyrant/King/Hydra), base 17-20 (momentum rooms out, ziplines,
  King in Daylight), Fractured 21-24, 25-28, 29-32, 33-36, 37-40 (queued). Check their RBR regions with verify-rbr before use.
- **Builder fixes made by the orchestrator (untested build):** `ringed()` (passage pieces proved inside rock, for 33/40) and
  upright-before-exit snapshot in runTape (World 12 ways back). Test build of World 10 in `.cache/test280/` was cut off.
- **Still to do:** apply agents' climbOrders with `scripts/climb/.cache/apply-orders.mjs orders.json`; rebuild every changed
  world (all of 1-40 except 2, 4, 10 at least); assemble; section-8 verifiers; page-check; bump ?v= (map/devices are at
  7.279.0/7.280.0 in precision.html and sw.js) and CACHE_NAME; ./build-deploy.sh. A stale headless-Chrome profile leak fills
  the disk (TMPDIR puppeteer_dev_chrome_profile-*): clean profiles older than 45 min.


### 2026-10-04, run 5 (7.279.0, a continuous session at Isaac's request): all 40 worlds are in the page

**Fixed**
- **Ways back that doubled back into the exit corridor.** The passage search could turn straight back into the three
  cells out of a branch's exit; the page joins pieces in order, so the knight was set into the second piece and walked
  back into the room (World 21's Mara and Rowan echoes). `astar(…, avoid)` now keeps the path out of that corridor.
  Probed in the page (`.cache/probe-wayback.mjs`): 21's two echoes and 24's echo all walk home at 0 deaths.
- **World 24's echo** no longer loops back into the Funnel (`spec.noLoop`); its way back leads into the Channel.

**Converted: Room by Room regions 25–40** (`scripts/rbr-src/fracture.mjs`, new; then `gen.mjs`, `accept.mjs`).
- Each Fractured region is made from its base region (5–20): rooms reflected left to right (map, spikes, foundry belts,
  rail boosts, devices, people, routes), each checked in the core (its route, a 14-frame late start, standing at the
  spawn, its side way). A reflected route that acts before moving starts with one frame of left (the knight always
  spawns facing right). A floor or ceiling portal is two tiles wide.
- A region is reflected only if all its rooms reflect (a road mixing both doubled back on itself in the Climb).
  **Reflected: 25–32, 34–37. Base orientation: 33 (the Tyrant's device), 38 (watch lights), 39 (sun-beams and
  mirrors), 40 (light through portals)**; each source's `note` names the rooms that do not reflect yet.
- Each base quest becomes that person's **echo**: sealed until the base keepsake is held, new lines at the door and at
  the far end, a remembrance (`<quest>-remembered`). Everyone else is gone from the Fractured world. Daro's errand (no
  rooms) has no echo yet.
- `verify-rbr 25–40`: 238 rooms, all pass. Six regions looked at on screen.
- **This is a first pass, not the "harder, 3–5 decisions per room" redesign** the Room by Room plan asks for: the
  rooms are the base rooms, reflected. Isaac's call whether to keep it or redesign region by region.

**Climb: worlds 25–40 built and connected.**
- `WORLDS` 25–40 in `spec.mjs`: the base world's Climb order and saved rooms mapped to the Fractured ids (`fs29-q-intake`
  is saved, as `s9-q-intake` is). Secrets from Precision courses no world used (p84 and p83 dropped from 28, p159a from
  36: placed with no way out; 32's secret kept off its first room, whose arrival opening breaks the way in). 35 keeps
  World 15's reserved arrival ground, reflected; 38–40 the wide secret search.
- **Map:** the base emerald turned over below 21 (positions and anchors in the atlas and geography); 39 to the right of
  19, which sits on the axis. **Links (27 new):** the braid, crown, apex and circuit as the base's (23–25, 24–26, 25–26,
  26–28, 26–27, 28–29, 27–29, 29–30/31/32, 30–33, 32–34, 33–36, 30/31/32/33/34–35, 36–37–38–39–40–34) and crossings 24–25,
  36–28, 37–24, 38–22. **Not yet:** 39–21 and 40–23/25/27 (they need gate rooms, as 19–1 and 20–3/5/7 have).
- `passages.js` side overrides: the five links into 35 (its arrival is the Deep Line's reflected) and 27–29 (its
  corridor crossed its last rooms). Folded passages cannot have both mouths on the same wall (the builder writes past
  its 8-row grid), so each override sets both ends.
- **Checks, all pass at 40 worlds:** footprints (25728 passage tiles), projected terrain (134 corridors), folds (268
  seams, 67 passages), contained worlds (454 joins), runtime (378 seams, 494 tapes), resume (134), traversal (67
  corridors, 206 junction roads), mouth views (268), co-op, junction regressions (206). `feature-check` OK. The world map
  shows both emeralds (`.cache/map-40.png`).
- `page-check 25–40`: **every road plays at 0 deaths from each fire.** Branches fully OK in 25, 26, 29, 30, 31, 32, 34,
  37, 38, 39 and the secrets of 35 (its drop test does not apply: it is entered from above), 36.

**Open (by eye next)**
- **Ways back that stop in a climbed shaft** (27's secret, 33's echo and secret, 35's echo, 36's echo, 40's echo and
  secret; World 15's secret earlier): in the page the knight is handed into the piece above as soon as his head crosses
  the seam, with his body still below it, so a wall climb loses its wall and he drops back. Springs carry him through,
  which is why spring shafts pass. Not a softlock (seams stay open both ways). The fix is in the view's vertical seam
  handoff (shared, touches every world): proposed, not made.
- Several echoes come back into their own last room (the builder's accepted fallback, as World 16's and 17's do).

### 2026-10-04, run 4 (7.278.0): the Fractured emerald is in the page (worlds 21–24, five links)

**Built**
- **World 24's echo has a way back.** The Last Interval's chute fell into the Needle, which the road holds under it. In the
  Climb its foot now turns right (`spec.patch` + new `spec.exits` for `fu24-q-funnel`, with a route that walks out); the
  echo room itself is unchanged. The way back is 3 pieces with a spring. Builder: `spec.exits` (a room left by another
  side) and quest rooms now take `spec.patch` like road rooms (no other world patches a quest room, so nothing else moves).
- **21–23 rebuilt with `--reuse-road`** from today's builder; all four assembled with 1–20 (`worlds/`, 24 worlds, 772 KB).
- **Placed (atlas + geography):** positions 21 (0, 9.8), 22 (−1.2, 10.95), 23 (1.2, 10.95), 24 (−1.2, 12.15); anchors
  21 [0, 1810], 22 [−900, 2160], 23 [900, 2160], 24 [−900, 2510]. Links: roads **19–21**, 21–22, 21–23, 22–24 and the
  crossing 22–23 (the base 1–2, 1–3, 2–4, 2–3 reflected). Passages: The Cracked Stair, The Ashen Hollow, The Split Viaduct,
  The Hollow Vent, The Echo Spillway, in a new **`fractured`** passage style (violet shards and cracks of light,
  `bladefall-climb-passage-art.js`) and a `fractured` sky in `bladefall-climb-art.js`. Junction names in `passages.js`.
- **Deviation from run 3's plan (keepsake rifts 1–21 … 4–24): not built.** One road down from the Path to the Palace is
  enough, because every Fractured echo is already sealed until its base keepsake is held (the run-3 echo seal), and it
  leaves worlds 1–4 untouched. The rifts remain an option if Isaac wants each echo reached from its own base world.
- **World 21 has no arrival junction.** Its first room (The Ash Steps) is climbed up its left wall, and a left arrival mouth
  cut that wall away (the knight could not climb out). Like the Outskirts' 19–1, the road from 19 ends at a gate room,
  **The Cracked Postern**, hung over **the Glass Mile** (room 2; no room over Ash). `passages.js`: a world with no
  ungated incoming link gets no arrival junction (only 21 today; World 1 keeps its own rule). From the gate you drop into
  the Glass Mile; the Ash Steps lie behind it.
- **Junction fix (`passages.js`):** a last room entered and left by the same wall (the Fractured Woods' door) had its
  departure built on the opening by its fire, the way in; it now uses the next opening above. Only rooms with the fire in
  an exit-side opening and a second opening change; 1–20 still pass every verifier.
- **Atlas:** World 24's Signal Crown is World 4's room, so it gets the same retimed route (`prepareWorld`).
- **page-check** hands over the keepsakes a world's echoes need (they are sealed on a fresh save), nothing else.

**Checked**
- Verifiers, all pass: footprints (15360 passage tiles), projected terrain (80 corridors), folds (160 seams, 40 passages),
  contained worlds, runtime (224 seams, 293 tapes), resume (80), traversal (40 corridors, 122 junction roads), mouth views
  (160), co-op, junction regressions (122). `feature-check`: co-op, T, N, route OK.
- `page-check 21`–`24`: every road plays at 0 deaths from each fire. 22 (Elsie) and 23 (Silas): echo and secret entered,
  rewarded, home, reverse, 0 deaths. Secrets of 21, 22, 23, 24 all OK. The 19–21 gate: entered, drop home OK.
- Screenshots looked at: the Cracked Postern with its mouth sign and the fractured passage beyond; Mara's way back.

**Failing / open**
- *World 24, the Cartographer's echo: entered, reward, reverse OK, but page-check's walk home stops in the way back's
  12-tile shaft (`cl24-pass-13`), as World 15's secret did. The way back also comes back into the Funnel's top, not the
  Choir: you walk back through the echo's rooms. Look by eye; a lift into the Choir would be better.
- *World 21: Mara's echo walk home not completed by page-check (came out in its own last room); Rowan's opening did not
  work in reverse. Both rewards picked up at 0 deaths. Look by eye next run.
- The atlas map (fallback SVG) is still drawn for y ≤ 8.65; the physical map (the default) fits 21–24 automatically.
- The Fractured worlds 23 and 24 end with no road onward (like the Deep Line).

**Versions:** atlas, art, passage-art, passages, geography-build, worlds `?v=7.278.0`; cache
`bladefall-v442-fractured-emerald`; `./build-deploy.sh` run. Not committed.

**Next run, in order**
1. By eye: World 24's echo way back (and whether to lift it into the Choir), World 21's Mara / Rowan ways back.
2. Convert 25–40 in Room by Room's format, a region at a time (the Fractured regions not yet converted), then climb and
   connect them below 21–24.
3. Still open: the 13–15 journey (10.05 s).

### 2026-10-04, run 3 (7.277.0): a death at every secret's door, the echo seal, and the first Fractured builds

**Fixed (in the page, every world)**
- **Dropping back out of a secret's or errand's ceiling door killed the knight.** Climb in, miss the shaft, and he fell
  through the floor he had just come up through and died. Walking back was blocked for 45 frames after entering a room
  (against bouncing straight back out of a side), and a fall back down the shaft takes about 10. Now a fall back down the
  way you came goes home after 8 frames, the same grace a passage piece has; sideways and upward ways back keep the 45.
  Probed in worlds 1, 2, 16 and 17: before, 1 death each; after, home in The Cut, the Descent, Long Chain and the Mooring
  Ring with 0 deaths (`scripts/climb/.cache/probe-secret.mjs N`).
- World 1's secret (The Cut), which `page-check 1` reports as not entered: entering works by eye in the probe, on a fresh
  save and after clearing The Cut. The miss is in page-check's own order (it walks the 19–1 gate just before and ends in
  The Lookout), not in play. Left as is.

**Built**
- **Echo seal (`bladefall-climb-view.js`).** A quest with `needs` (a Fractured echo) stays sealed until that keepsake is
  held, as in Room by Room: its ceiling door, side way and way back's opening do not let you in, a violet seal is drawn
  over them, and the page says "Sealed · this echo needs Rowan's Bell" (the keepsake's name, looked up across the worlds).
  No base world has a `needs`, so nothing changes there.
- **`spec.mjs`: `WORLDS` 21–24** (appended after 20). Room by Room's order (unrated). Echoes: mara-echo + rowan-echo (21),
  elsie-echo (22), silas-echo (23), cartographer-echo (24). Secret pools from the optional courses no world uses: Momentum X
  (x1, x2, xm2–xm5) for 21, the vertical-dash and spring set (pv0–pv4, vi0, vi1) for 22, the portal set (pw0–pw4, vi8, vi9)
  for 23, the summit set (p200a–e, fa1–fa3) for 24.
- **Builds** emit to `scripts/climb/.cache/worlds21/` (not assembled, not in the page):
  - **21 The Fractured Outskirts: built.** 11 sections; both echoes open from ceilings (Mara's in the Survey Stone, Rowan's
    in the Camp: their side ways were blocked by the Glass Mile and the Lantern); secret Super (x1) above the Fallen Chain;
    every branch has a walked way back with springs.
  - **22 The Fractured Woods: built.** 12 sections; Elsie's echo by its side way; secret Where You Stand (pv0) above the
    Canopy.
  - **23 The Fractured Causeway: built, after a builder change.** The West court exits right; the East court exits left with
    its fire on the far right, past the armoured charger, and the Middle court (The Last Count) faces back again. The turn
    (drop in through the ceiling over the fire) worked for the East court, but the rebuilt road could not turn a second
    time (`buildChain` refused a turn whenever it had a `start`). `buildChain(…, road)` now lets the road after a turn turn
    again; only reached after every older option fails, so other roads are unchanged. Both courts are entered by an 8-tile
    drop onto their fires. Silas's echo and the secret Stone Through Stone (pw2, above the Rise) have walked ways back.
    (The road cache key includes the builder source: 21 and 22 should be rebuilt with `--reuse-road`.)
  - **24 The Fractured Updrafts: road and secret built, the echo has no way back.** The Cartographer's echo goes up from
    the Choir, through the Channel, to the Funnel, which exits down into ground the road already holds. The builder's
    lift (an up shaft before the last room, 12–36 tiles) fails at every height: entered from below (shaft at 38–39), the
    Funnel's fire (bottom left, behind its pipe walls) cannot be reached. Moving the Choir would break the rule that a
    quest's door stays where it is. Next: a lift whose shaft turns and enters the Funnel from its left wall, by the fire
    (a new connector, opt-in), or the way back leaving the Funnel's chute sideways. The road is cached (`--reuse-road`).

**Why the Fractured worlds are not in the page yet**
The atlas map and the geography index every world by its position and anchor, and a world placed with no incoming link
leaves an empty arrival junction, which loops forever (run 1). So 21–24 go in together with their links, as one piece:

1. Positions (the reflected emerald): 21 (0, 9.8) under 19; 22 (−1.2, 10.95); 23 (1.2, 10.95); 24 (−1.2, 12.15).
   Anchors: 21 [0, 1810]; 22 [−900, 2160]; 23 [900, 2160]; 24 [−900, 2510]. Today's lowest footprint is 19 (y 1383–1478),
   and 18 reaches x −1154 at y ≤ 1002, so these clear everything; confirm with the footprint verifier.
2. Links: roads 21–22, 21–23, 22–24 and the crossing 22–23 (the base pattern 1–2, 1–3, 2–4, 2–3), and the **rifts**
   1–21, 2–22, 3–23, 4–24, a new link kind that opens when the base quest's keepsake is held (the atlas's `refresh` needs a
   `has(keepsakeId)`; the view passes it in). A rift arrives at the Fractured world's arrival junction; it leaves its base
   world from a gate room over the road (`spec.sockets`, as 19–1 does), because 1 has no arrival junction and the others'
   are full.
3. Then passage designs and a "fractured" passage style, the atlas map's height (it is drawn for y ≤ 8.65), and
   `page-check 21`–`24`.

**Failed / found**
- `verify-climb-passage-seams.mjs` throws in the camera code (`defOf(room)` is null for a passage's `to`): an old passage
  model, like `verify-climb-atlas.mjs`. Neither is on the handoff's list.
- The hidden browser pane does not run the page (`javascript_tool` timed out). Use headless probes (`probe-secret.mjs`).

**Checked**
- `feature-check`: co-op, T, N, the route, all OK. `verify-climb-geography-runtime` (195 seams, 247 tapes) and
  `verify-climb-geography-resume` (70) pass. `page-check 1`: road OK at 0 deaths, Rowan's errand and the 19–1 gate OK.

**Versions:** view `?v=7.277.0`; cache `bladefall-v441-echo-seals`; `./build-deploy.sh` run. Not committed.

**Next run, in order**
1. World 24's echo way back (above). Then rebuild 21–24 with `--reuse-road` so all four come from today's builder.
2. Put 21–24 in the page with their links (the plan above), then `page-check 21`–`24` and screenshots.
3. Then convert 25–40 in Room by Room's format, a region at a time.
4. Still open: the 13–15 journey (10.05 s).

### 2026-10-04, run 2 (7.276.0): Sunspire's three entrances and the 19–1 spoke

Nothing about the map is reserved any more: all 20 regions and all 39 links (35 folded passages) are in the page.

**Built**
- **Gate rooms (mid-world sockets), `spec.sockets` in the builder.** A gate is a small room (16×14, fire, a mouth in one wall at
  floor 10) hung off a road room's ceiling with the same `ceilingDoor` machinery as a secret. You climb up into it through the door
  and drop home through its ledge (down + jump). It carries `atlasJunction`/`atlasGate`, a passage socket and a one-step road, so
  every junction verifier and the passage fold treat it like a junction. It is stored as a key-less quest (`socket:'20-3'`, no
  keepsake), so no heart or keepsake count changes. A gate is only hung where
  1. the corridor projected beyond its mouth (46×10 tiles) is clear of every room and of earlier gates' corridors, and
  2. a drop through its door, simulated at three moments of the room's clock, lands with no death (Sunspire's light beams cross
     most of its rooms, and the Sea Terrace is a leap over a spiked shore).
  - `lift` adds rock under a gate's floor (a taller shaft), and `minX` lets a corridor run west of the first room.
- **Sunspire (20):**
  - 20–3 *The Causeway Postern* over Both Ends (corridor west, The Low Sun Causeway).
  - 20–5 *The Marksman's Postern* over the Noon Engine, lifted 8 tiles and opening east (The Sightline Gallery). Its west side is
    the Ring Light secret's way back, and Two Deliveries stands higher on its east. It arrives on the Sentry Landing's left wall
    (`SIDE`).
  - 20–7 *The Warden's Postern* over the Sea Terrace's left ledge (The Sunward Gaol Road).
  - Worlds 3, 5 and 7 each take one more arrival mouth.
- **The Outskirts (1):** 19–1 *The Pilgrims' Postern* over The Verge's left corner (The Pilgrim Underway). A new game still starts
  on the road.
  - World 1 was **not** rebuilt. A fresh build of World 1 now places its secret's shaft 3 tiles over (a side effect of run 1's
    builder changes), so only the gate, its door in The Verge and their two tapes were grafted onto the existing `w1.json`.
  - Backup: `scripts/climb/.cache/worlds1x/w1-before-gate.json.bak`.
- **Atlas:** crossings 19–1, 20–3, 20–5, 20–7; `reserved` is now empty; `endpoint()` returns a link's gate room when it has one.
- **Passages:** four designs (sunpath and sunspire styles); a gate's link stays out of its world's arrival junction.
- **View (`bladefall-climb-view.js`), one fix in the walk-back.** Dropping home out of a short shaft left the knight with his feet
  on the host's top edge. The core blocks any body above y=0 in a room with no exit up, so he stood on the ceiling, and the host's
  door carried him straight back up. The gate's shaft can also sit one column off the door, because the builder places a branch
  from where the knight leaves the door.
  - Now a downward walk-back sets him just inside the room below, within the columns of the door he came up through.
  - Secrets' drops are unaffected: page-check still drops home from all of them.

**Checked**
- Verifiers: footprints (13,440 passage tiles), projected terrain (70 corridors), folds (140 seams, 35 passages), contained
  worlds, traversal (35 corridors both ways, 106 junction roads), runtime (195 seams, 247 tapes), resume (70), mouth views (140),
  junction regressions (106 apertures), co-op. All pass.
- `page-check 20` and `page-check 1`: road OK at 0 deaths. Every gate can be entered and dropped home from, at 0 deaths. A probe
  dropping from both halves of each shaft lands home with 0 deaths. `feature-check`: co-op, T, N and the route all OK.
- Screenshots looked at: the Marksman's Postern (corridor and destination drawn through its mouth, the sign reads "Hollow
  Marksman →"), the Pilgrims' Postern, and the Warden's Receiving Yard.
- Journeys: every new link both ways is under 10 s.

**Failed / found**
- First tries: a gate over the Noon Engine's west side (blocked by the secret's way back), and 20–7 over the Sea Terrace's
  shore (spikes) and the Glove of Morning (a light beam under the door). That is why the landing simulation exists.
- Turning 20–7 east put its mouth on the Warden's left wall, which the Warden's first room uses, and the junction road stalled.
  So 20–7 faces west.
- The gate's own walk-out tape no longer exits once it becomes `exit:'none'`, so the builder had marked it close-while-played
  (that would have sealed the shaft). Gates are now skipped there.
- **Still failing (unchanged from run 1): 13–15 takes 10.05 s.** Swapping it with 10–15 only moves the 10.05 s to 10–15. The
  Deep Line's middle-tier road is slow whichever link takes it, so the fix is the tier geometry itself (every arrival uses it),
  not the order.
- `verify-climb-junction-regressions --geography` failed 3 times, each the first run in a chained loop right after a
  reassembly. It passed 9 times otherwise, including 6 runs in a row, and the error was never captured. Watch for it.
- `page-check 1` reports World 1's *existing* secret (door in The Cut) as not entered; the knight ends in The Lookout. It does
  the same with this run's view change reverted, and The Cut and its tapes are byte-identical to before, so it predates this
  run. It may be a page-check scripting issue with The Cut's seam. **Next run: look at it by eye.**
- `verify-climb-atlas.mjs` is stale (it asserts 9 worlds) and has failed since 7.274. It is not on the handoff's list.
- (Tooling) Probes looped in zsh need `${=g}`: an unsplit `$g` asked for `world=NaN`, and the page sat at the menu.

**Versions:** atlas, passages, view and worlds at `?v=7.276.0`; cache `bladefall-v440-sunspire-gates`; `./build-deploy.sh` run.
Not committed.

**Next run, in order**
1. The 13–15 journey (10.05 s): the Deep Line arrival's middle tier.
2. Look by eye: World 1's secret in The Cut (above), the Deep Line's westbound drop, the Junction Hall, and the secret's way back.
3. Then the fractured worlds (placement proposal below; still for Isaac to confirm).

### 2026-10-04, run 1 (first run)

**Built**
- `scripts/climb/spec.mjs`: `WORLDS` entries 15–20, appended after 14 (nothing above it touched).
  - Order: Room by Room's own order for each region (unrated).
  - Quests: miner (15), sailors (16), birthday (17), mother (18), pilgrim (19), garden (20).
  - Secret pools: each region's own Precision Course part: 140–148, 150–158 (not p154, which exits up), 160–169, 170–179,
    180–188, 190–198 (not p194, which exits down).
- Builds emit to `scripts/climb/.cache/worlds15/` (a separate folder, so the other chat's `worlds/` is never touched). To assemble,
  copy `w15…w20.json` next to `w1…w14.json` and run `--assemble` (see "Assembling" below).
- `scripts/climb/build-climbs.mjs`, two new ways into a room, both only reached when every older option has failed (so worlds 1–14
  build exactly as before):
  1. **Over the ceiling.** A fire with no floor to walk to (Back Up: the knight starts on a cart over a spike strip) gets a tunnel through
     the rock above it and a two-wide hole that drops him onto the fire.
  2. **A turn.** A room that cannot be walked into from its side at all (Westbound: the fire is on a cart at the far right, entered from
     the left over a pit) gets a short connector (`connector('turn-left'|'turn-right')`): walked into from the side, a drop out of its
     floor, and the room below is entered through its ceiling over its fire. The rest of the road is rebuilt from there.
  - `hostOf` and `patchRoad` now find a road room by its origin rather than by its index in `spec.order`, so a connector on the road
    cannot shift a quest's door.
  - Note: the road cache key includes the builder's source, so any later first build of 1–14 without `--reuse-road` relays its road.
    The other chat already builds with `--reuse-road`.

  3. **Up-shafts further along the floor** (the Bell Below's Drive Cradle: the fire is on a cart with track under it, so no shaft fits
     beside it). After every nearer way in, a shaft at any column whose floor is solid rock, starting at that column's own floor.
  4. **A fire set above its footing** (the same cart: `P` sits two rows over the cart, so the knight always settles 8 px lower).
     `reachFire` also accepts the spot where the knight settles from the spawn. Rooms whose spawn is already standing are unaffected.
  5. `connector()` with a side way in shorter than 5 rows returned an error instead of `null`, which skipped every quest door shaft
     after the first (`Cannot set properties of undefined (setting '1')`). It now returns `null`. Pre-existing bug; it cost World 18's
     errand its side door (it opens from a ceiling instead, which is fine).
  6. `spec.secret.wide` / `spec.secret.shaft` (opt-in, World 19 only): the secret's door may be cut anywhere along a ceiling, middle
     first, and only with a lifting shaft. World 19's road has exactly one usable ceiling (the Lower Rest), and its neighbours sit two
     rows higher, so a room straight above a corner always overlaps them.

**Failed / found**
- World 15: `d15-backup cannot reach the fire` → fix 1; `d15-west cannot reach the fire` → fix 2 (the road turns down through a
  28-tile drop into Westbound's ceiling, a long fall: worth Isaac's eye); the Bell Below's first room → fixes 3–4.
- World 19: `no secret room fits` → fix 6.
- 16, 17, 18, 20 built first time. 17's secret (Wreck Lift, p161) hangs above the Mooring Ring with a shaft; 16's (First Chain, p150)
  above Long Chain; 18's (Lamplight, p170) above Beyond the Watch; 20's (Sun Through Stone, p190) above the Glove of Morning.
- A geography dry run in a scratch copy (worlds 1–14 + 16 + 18, the new atlas/anchors) passes: no regional footprints overlap, no
  passage overlaps authored terrain, 13–16, 16–8 and 18–2 junctions take their mouths. A junction with no passage mouths at all
  (an arrival with no incoming link) loops forever in `landscapeJunction` (`hearth=Math.max()` is −∞). Sunspire's arrival always has
  19–20, so this does not bite, but never leave an arrival empty.

**Pending (decisions for Isaac)**
- Ratings for 10–20 (none yet).
- Whether the difficulty cap rises above 7 for 15–20, and where the rooms kept for later (o1-ridge, w2-canopy, m5-drop, …) go.
- The Deep Line has no outgoing road (it is the apex): does the game end there, or does it loop?
- The oathblade's eight-way cut (`aim8`) is on in worlds 1–2 only.

**Connected (7.275.0, same run)**
- Atlas: positions 16–20; roads 13–16, 16–17, 17–18, 18–19, 19–20, 20–14; spokes 16–8, 17–4, 18–2. Reserved: 10/11/12/13/14→15,
  1→19, 7/5/3→20.
- Passages: 14 designs (the X–15 five wait with 15), names/high/low/palettes 15–20, `SIDE` overrides 13–16 (13 right, 16 left) and
  20–14 (20 right, 14 left): both departures' left walls projected their corridors over their own worlds' branches.
- Geography-build: anchors 15–20 (x·750, (y−3.95)·304, spread where footprints meet), a third arrival floor (34), and a terminal room
  whose exit is taller than a mouth keeps its whole height open (the Sea Terrace's shore is 10 rows).
- `bladefall-pcore.js`: a walking seam honours a socket's `height` (same terminal case). One line.
- Art: world themes deepline, cliffs, shores, colony, palace, sunspire (skies, silhouettes, terrain detail, a sun for 19–20);
  passage styles rail, cliffs, shores, colony, sunpath, sunspire (colours, materials, silhouettes, deck materials).
- Verifiers, all passing on the 19-world map: footprints (9,984 passage tiles), projected terrain (52 corridors, 52 trips),
  folds (104 seams, 26 passages), contained worlds (215 joins), traversal (26 corridors both ways, 86 junction roads), runtime
  (156 directed seams, 234 tapes), resume (52 entries), mouth views (104 mouths), junction regressions (86 apertures), co-op,
  journeys (hearth to hearth 8.4–10.0 s). `feature-check.mjs`: co-op, T, N, the route, all OK.
- Screenshots looked at: Thunder Cliffs (Deck), Landing Shores (Tern), Colony (Lantern Thief), Path (Beat and Glass), Sunspire
  (Ring Light), The Thunder Stair and The Sun Road passages. The shores dunes first read as mountains with crosses: lowered, masts
  given sails.
- Versions: the eight changed scripts at `?v=7.275.0`, cache `bladefall-v438-outer-circuit`; `./build-deploy.sh` run.

**World 15 joined (later in run 1)**
- Fix 4 had a bug (a new game starts `onGround`, so "where the knight settles" read the spawn itself); fixed, and `floorAt` now
  treats track as floor. The Bell Below's first room is entered by an up-shaft in the rock right of its cart.
- In the page, 15's arrival overlapped its own last platform (the road comes back west underneath). `spec.reserve` keeps the arrival
  and its mouths' corridors free in the builder, so the turn drops 48 tiles; a departure with no road onward now hangs below its
  floor. The only room overlap left on the map is World 7's Well touching its crossroads (2×2, from before 7.274).
- World 18's secret sat above Beyond the Watch, where the departure junction grows over it: rehosted (`hosts`, `wide`), now above Let Go.
  World 15's secret above High Line could not be climbed to in the page (its door tape fails there, as World 20's did above the Glove of
  Morning): rehosted above Buffer Stop. World 20's is above Ring Light.
- Journey times: the Deep Line's top mouth was 10.3 s from 13. A Last-Pour departure now opens its first road at the lower tier, and the
  road order sets the heights; 13–15 is 10.05 s, everything else under 10. Lower arrival tiers ([26,34,42]) or a hearth at the middle
  mouth made the walker stall on the long road up to Thorn Line, so I kept [18,26,34]. Next idea: a lift in the Junction Hall (the
  Chainwell's counterweight already exists), or bring the right-hand mouths one row closer once the junction road's steps are made
  robust to the rounding that stalled it.
- A road connector's tape lived only in the run that laid the road; `dropTape` recovers it for cached roads, and the current w15 has it
  patched in (`scripts/climb/.cache/patch-conn-tape.mjs`). A fresh `--reuse-road` rebuild of 15 was still running at the end of the run;
  its output should be identical apart from that tape.
- Versions `?v=7.275.1`, cache `bladefall-v439-deep-line`, `./build-deploy.sh` run.

**Next run, in order**
1. Look at the Deep Line by eye: the westbound drop, the Junction Hall, the secret's way back.
2. Sunspire's mid-world sockets for 20–3, 20–5, 20–7 (proposal below), then the Outskirts arrival junction for 19–1.
3. The 13–15 journey (10.05 s).
4. Then the fractured worlds (placement proposal below).

## Plan for connecting 15–20 (the handoff's order)

Graph → reciprocal sockets → footprints → junction roads → envelopes → motion/camera → rendering. Concretely:

1. **Atlas** (`bladefall-climb-atlas.js`, shared): positions 15–19 from the emerald coordinates, 20 at its label (2.43, 4.8).
   Roads 13–15, 10–15, 11–15, 12–15, 14–15, 13–16, 16–17, 17–18, 18–19, 19–20, 20–14. Crossings (spokes) 16–8, 17–4, 18–2, 19–1,
   20–7, 20–5, 20–3. Small, additive edit at the end of each list.
2. **Junction capacity** (side rule `side(l,n)` in passages):
   - 15's arrival: left 13–15, 10–15, 11–15 (11 sits directly below, so it counts as left), right 12–15, 14–15. Geography-build allows
     two mouths per side on an arrival (`[18,26]`). Proposal: a third arrival floor (`[18,26,34]`), which no existing junction reaches,
     so nothing else changes.
   - 16: arrival right 13–16 and the 16–8 spoke (2, fits). 17: right 16–17 and 17–4 (fits). 18: left 17–18, right 18–2 (fits).
     19: left 18–19, right 19–1 (fits).
   - 1 (the Outskirts) has no arrival junction (`w.n!==1` in passages). The 19–1 spoke needs one, holding only 19–1, without moving
     where a new game starts (check the view's start logic before building it).
   - 20: arrival 19–20 plus the 20–7, 20–5, 20–3 spokes = 4 on one side → by design these become **mid-world sockets** along its climb
     (a side mouth cut into a chosen road section at a given floor, reciprocal socket, the same folded corridor and projected view).
3. **Anchors** (geography-build, shared): after the builds, from each world's footprint, so no regional bounding boxes overlap.
4. **Passages** in a new module of this routine's own (`bladefall-climb-passages-15-20.js`?) if the shared `designs`/names tables can be
   extended from outside; otherwise small additive entries. Styles for the new biomes: rail (Deep Line), cliffs, shores, colony, path,
   sunspire.

## Proposal: Sunspire's mid-world sockets (20–3, 20–5, 20–7)

**Done in run 2 (7.276.0)** as gate rooms over the road: Both Ends, the Noon Engine and the Sea Terrace (see the run log). The
same mechanism serves 19–1 in the Outskirts. The proposal below is kept for the reasoning.

Sunspire's climb runs from the Path (19, its arrival) up to the Abyss King (14, its departure), so its early rooms face the lower braid
and its late rooms the upper. Entrances opposite 3, 5 and 7, in climb order: **20–3 near the Evening Bench / Lantern Post (rooms 5–6),
20–5 near Ring Light / Noon Engine (8–9), 20–7 near the Throne at Dawn (11)**.

- A road room's challenge map must not change at play time, so the socket is cut at **build** time, like an errand's door: a small
  socket room (a connector with one side mouth) hung off the chosen road room's free wall or ceiling, with its way back. The builder
  already does exactly this for errands (`buildChain` with a `start`), so it is a new `spec.sockets:[{link:'20-5',host:'s20-crown'}]`.
- Geography: the socket room carries `atlasSockets:[{kind:'passage',link,edge,floor}]`; `endpoint()` in geography-build finds it by
  link like any junction, and `foldedPassage` builds the same 48×8 corridor, projected at that mouth. `landscapeJunction` must skip
  it (it is not an `atlasJunction`, so its footprint is not reshaped).
- Passages: `prepare` leaves these links out of the arrival hub (an `ATLAS_MID` table), and the atlas `endpoint()` returns the socket
  room for them. The spokes stay crossings (both ends' last rooms solved).
- Checks: footprints, projected terrain (the corridor must clear Sunspire's own rooms), runtime seams, mouth views.

## Fractured worlds (after 15–20)

Started in run 3: `WORLDS` 21–24 in the spec; 21, 22 and 23 build; 24 does not yet (its echo has no way back). Not in the page. Room by Room has converted 21–24 only (Fractured Outskirts, Woods, Causeway, Updrafts); 25–40 (the Fractured
counterparts of 5–20) are planned there, not built.

**Placement proposal (for Isaac to confirm or redirect):** a second, reflected emerald. Each Fractured region sits as its own
continuous climb in a mirrored copy of the map below the Path to the Palace (y reflected, so the Fractured Outskirts lies just under
19 and the Fractured Deep Line at the very bottom). Each is reached from its base region by a **rift**: a folded crossing from the base
region's arrival junction to the Fractured one's, opening when the base region's errand keepsake is held (Room by Room's rule: the
keepsake opens that person's echo). Inside a Fractured world the echo branch is the keepsake-gated errand. The Fractured worlds join
each other with the same roads as the base map, so the reflection is walkable as a whole once entered. This reuses every piece of the
connected Climb (atlas links with a new opening rule, the same junctions and folds); the only new rule is "open when keepsake K is held".

Order of work: climb and connect 21–24 (already converted), then convert 25–40 in Room by Room's format, a region at a time.

## Assembling

```
cp scripts/climb/.cache/worlds15/w1[5-9].json scripts/climb/.cache/worlds15/w20.json scripts/climb/.cache/worlds/
node scripts/climb/build-climbs.mjs --assemble scripts/climb/.cache/worlds
```
`--assemble` writes every world found in that folder; check that w1–w14 are all present first (they are as of 2026-10-04 06:00).
