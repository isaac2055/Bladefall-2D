## Active Room by Room goal — 1 Oct 2026, Codex

Isaac explicitly requested continuing through **all 40 regions**, plus post-room reviews. The goal remains active; do not call the whole rebuild complete.

- **Owner clarification:** Isaac permits reusing some or most Precision Course rooms when they flow as one full level. Regions **1–24 (351 rooms)** now pass route/browser/branch review. Thunder Cliffs now includes the three chained-Hydra encounters; each collar needs two downward cuts with a fresh hook ascent between them. Region 21 has the three weaponless Mile Sentinel bells and separate Mara/Rowan remembrance branches. Region 22 reuses crystal/pod/bell/zip courses, adds the bound Oathblade counterweight and deliberate pickup, and a timed resin-branch crown; Elsie’s branch requires her old lantern. Region 23 reuses the mass/lift courses and armored Brute for three crush-only courts (west, east and a central stop), with Silas’s remembrance. Region24 reuses wind courses with three breathing-shaft rooms; warning rails match the actual force reversal, and the Cartographer’s echo requires the base chime. **Next: Fractured Marksman (RBR25), then26–40.** Read the charter by name: its original stable stage ID is24. No region25 draft exists. RBR23 keeps the established dash-from-start kit for course reuse; the legacy charter’s “dash from Brute” progression belongs to old campaign physics.
- Reviews default on after each room: difficulty 1–10, fun 1–5, issue checkbox and optional note. Region menu → Room reviews toggles/exports. Separate storage `bladefall.rbr.survey.v1`; standard Precision survey remains separate.
- Read `docs/plans/room-by-room.md`, region source references and original campaign charters before building more. Sources in `scripts/rbr-src`; generated region JS must not be edited directly.
- `rbr-find --plain` excludes expert movement; `--require event,event` enforces device use in intended tapes. Gravity scoring uses screen coordinates. The waypoint stages now enforce plain constraints too (corrected 13 tower/light tapes). `--start prefix.json` supports staged puzzles. Tide snapshots rebind spikeSafe to each cloned game; no runtime physics was changed. Keep authoring processes that write the same tapes file sequential.
- Checks: `npm run verify:rbr`, `npm run verify:rbr-survey`, `node scripts/verify-rbr-tyrant.mjs`, `node scripts/verify-rbr-king.mjs`, `node scripts/verify-rbr-deepline.mjs`, `node scripts/verify-rbr-sunspire.mjs`, `node scripts/verify-rbr-cliffs.mjs`, `node scripts/verify-rbr-sentinel.mjs`, `node scripts/verify-rbr-woods.mjs`, `node scripts/verify-rbr-iron-echo.mjs`, `node scripts/verify-rbr-breathing.mjs`, real-view `rbr-shot` and `rbr-branch-check`. Existing touch and Merge Pitch checks passed. Region screenshot scripts disable room reviews in their isolated browser; survey checks exercise them separately.
- Local version 7.264.0, cache v378. Build the Netlify folder with `./build-deploy.sh`; **do not deploy**. Preserve the large existing dirty tree.
- Newest review: `/tmp/rbr23-final`, `/tmp/rbr23-silas`, `/tmp/rbr23-boss`, `/tmp/rbr24-final`, `/tmp/rbr24-cartographer`, `/tmp/rbr24-detail`. All main rooms and branches played in the real view.
- Earlier review: `/tmp/rbr16-final`, `/tmp/rbr21-final`, `/tmp/rbr21-mara-review`, `/tmp/rbr21-rowan-review`, `/tmp/rbr21-boss`, `/tmp/rbr22-final`, `/tmp/rbr22-elsie`, `/tmp/rbr22-detail`. Branch check now tests prerequisite sealing and seeds the base keepsake only after proving the gate is closed. `rbr-shot` now exits nonzero for failed transitions/deaths/page errors.
- Earlier review evidence: `/tmp/rbr-review-8-11`, `/tmp/rbr-review-12`, `/tmp/rbr-review-13`, `/tmp/rbr-review-14`, `/tmp/rbr-review-15`, `/tmp/rbr-review-16`, `/tmp/rbr-review-17`, `/tmp/rbr-review-18`, `/tmp/rbr-review-19`, `/tmp/rbr-review-20`; survey screenshot `/tmp/rbr-survey-card.png`.

---

## 7.244.0 — three tabs, fourteen approvals, puzzle candidates

Base Bank=[16,13,14,15]. Fractured Bank=[6,7,8,9,11,17,19,20,22,24]. Candidates=[10,18,12,21,23,25,26,27,28,29]. Retired0–5 remain internal only. Stage44 length129380; thirty internal / twenty-four visible rooms. Active stage count unchanged. K/KF are freely steered two-chapter flights, M has a first-root brake release and visible dormant curls, OF has downward-diagonal approach perches, Q is longer with four cable docks. New R/S/T/U/V implement dash-state decisions, lantern ballast, recorded return steps, dash-awakened thorns and a programmable return carriage. New public module bladefall-precision-puzzles.js.

Both bank menus contain twenty written campaign placements. These do not change permanent unlock order or insert banked layouts into campaign stages. Details: docs/charters/celeste/WORKSHOP-244-PLACEMENT.md. Fourteen approved object fixtures and tape hashes remain protected. Current verification commands/evidence and legacy limitations are in TESTING.md. Local build only; no deployment.

## 7.243.0 — independently authored candidate routes

Current candidate review: docs/design/BASE-FRACTURED-ROOMS.md and WORKSHOP-REVIEW-243.md. Preserve BaseBank=[16,13,14,15], FracturedBank=[6,7,8,9,11], their geometry fixtures and tapes. Candidates stay [17,10,18,12,19,20,21,22,23,24]; M needs user review before banking.25rooms/fourplaylists, stage44length109580,45stages. Local build only; no deployment.

H-F/M-F/N-F/O-F/Q-F are independently authored (only P-F intentionally builds from its base). K/K-F: three narrow rounded flight passages each, cardinal spring kicks, fixed per-leg budgets and three long ziplines after natural expiry. Completion table records actual pickup times, fresh forms separately. M's first vine launch clears the pillar; second root required. P-F recalls missed throws and cannot sustain flight through repeated recharging dashes. Q/Q-F require anvil rebound via physical ceiling/exit geometry. N-F's scoped ceLineOfSight ring check prevents hooks through its intervening rock. Banks and original-course behavior remain unchanged.

New checks: verify:workshop-flight, verify:workshop-shortcuts, verify:workshop-feedback. Do not treat fixed-tape failures as exhaustive proof against alternate routes. Runtime inventory refreshed by candidate verifier. Final results/limits live in the review report; older sections below are historical.

## 7.242.0 — Base Bank and ten Base/Fractured candidates

Base Bank=[16,13,14,15] (H Switchback/N/O/P); Fractured Bank=[6,7,8,9,11] remains protected. Candidates=[17,10,18,12,19,20,21,22,23,24] (H-F,K,K-F,M,M-F,N-F,O-F,P-F,Q,Q-F). 25 workshop rooms, four playlists, stage44 length93540; active stage count45. New module bladefall-precision-fractured.js is registered before candidates/workshop in HTML, cache and build. Version7.242.0/cachev352-base-fractured. Local build only.

K/KF have fixed4.85/4.6-second charges, near-empty refills, smoother physical contours and clearer spring kicks. M/MF grow roots RIGHT; ballast cable/pulley/weight are visibly connected. Banked P's carried slow-fall gains a player-following aura without changed movement/layout. All harder counterparts add actual combinations; Q/QF restore the user's counterweight/ground-pound/zipline/hook relay. Read docs/design/BASE-FRACTURED-ROOMS.md for exact combinations, evidence and limits. Never overwrite the nine banked fixtures or tapes during candidate tuning.

## 7.241.0 — independent room designs

H · Needle and Thread is now banked with G/I/J/L; all five layouts and approved input tapes are unchanged. Six candidates: NEW H · Switchback Engine (dash switches footholds/physical gates; climb and reverse), K · Storm Chase (longer enclosed third flight with slow spore enemies), M · Rootworks (four independent hoists, home-return trap, wall-grown decaying vines), N · The Wake Behind (delayed route-following moth shades), O · Recoil Well (player-aimed opposing recoil and three valve gates), P · The Lantern Thief (carry/throw/recover a seed through separate passages). Old M–P aliases removed. New H is index16; banked H stays index7. Bank=[6,7,8,9,11], candidates=[16,10,12,13,14,15]. Stage44 length57520; stage count45.

Primary-source research and design comparison: docs/design/CELESTE-ROOM-RETHINK.md. Current mechanics inventory updated. New module: public/bladefall-precision-candidates.js, registered in HTML, service worker and local build. Checks:17 legal routes,35 removal/delay trials,18 simple bypass policies,mechanic failure fixtures,17-room input/retry/UI checks,bank hashes and two-client transport. See scripts/verify-workshop-candidates.mjs. Difficulty/fun remain for owner review; no internet-network claim. Local build only.

## 7.240.0 — bank, six candidates, opening presentation

Banked G/I/J/L; preserved G/L tapes. I: fresh-axis 100 ms direction chords, dependable crumble landing/double jump, retained dash-jump buffer. Workshop dash recharges after 0.38 s (J fix). H extended; K has two flight passages and scattered physical crags. New M growth branch, N swinging uppercut target, O return-then-collapse rail, P bell-timed sluice. Six candidates H/K/M/N/O/P, bank four, original A–F: all separately playable; three playlists. Banked geometry fixture: docs/charters/celeste/BANKED-ROOMS.json. Stage count stays 45; workshop length 55760.

First three campaign levels get visual integration without changed collisions/kit. Current-code mechanics report: docs/design/MECHANICS-INVENTORY.md; runtime object inventory alongside it. Tests: verify:precision-workshop, verify:workshop-review, verify:workshop-bank, precision-workshop:coop, original course regressions and current early-route replays. Local build only.

## 7.239.0 — workshop review and world integration

Accepted rail timing and L's combo retained. Workshop wall/rift contact now falls instead of instantly rewinding; corner forgiveness and physical room bounds fix backtracking/end overshoot resets. Eight-direction dash has a 65 ms direction chord. Inside Out gets a halfway lantern checkpoint with a verified continuation. E/K lose wind, retain retuned moving obstacles/rebounds. Six environmental themes and animated beetles, pods, bronze bells, lodestones, seed lanterns, mounted cables and carriage wheels replace abstract targets. HUD is compact during traversal. Details/evidence: docs/charters/celeste/PRECISION-WORKSHOP.md. Local build only.

## 7.238.0 — revised Workshop and Fractured Workshop

Stage 44 now has two six-room playlists: revised A–F and harder G–L, each independently selectable. Falling reload rails; sagging varied crumble rocks with coyote time; integrated vault/ring/inversion routes; tighter aether flight with moving cutters and rebound drums; longer mixed blade/dash relays. Pixel quarry/ironworks art replaces red bars and removes stray dividers. Original Standard/Fractured geometry retained. Aerth Crystalline Trials retained. Details: docs/charters/celeste/PRECISION-WORKSHOP.md. Local only, not published.

## Latest: 7.237.0 / bladefall-v347-precision-workshop

Precision Workshop (stage 44) adds six individually selectable rooms A–F; original Standard and Fractured retained. Details and verification: docs/charters/celeste/PRECISION-WORKSHOP.md. User will review rooms separately for campaign inclusion. Do not replace their existing difficult relay. Local build only.

# Bladefall — current brief (7.235.0 · cache bladefall-v345-dash-foundry · 2026-09-27)

## Dash Foundry prototype — 7.235.0 / bladefall-v345-dash-foundry (2026-09-28)
Standard Precision Course now begins with one new room: committed eight-direction dash, a finite airborne charge/refill, dash-driven shuttle and momentum jump, then an aether vein with a required exit redirect. Prototype controls are confined to this room. Fractured has no new clone; all previous layouts remain unchanged apart from Standard's positional translation. Both favorite relay input tapes and all Fractured tapes are unchanged. Local mirror rebuilt; not published.

New opening, negative-route and eight-direction contracts, native keyboard/UI, geometry preservation, complete Standard/Fractured replays and shared two-player routes pass. See `docs/charters/celeste/DESIGN-PLAN.md` and `npm run verify:dash-foundry`. Standard now has 19 rooms (7,641 replay frames), Fractured nine (4,017); zero retries. Existing four release-check failures remain. Real internet performance and human difficulty are not claimed.

## Opening roads and Fractured precision — 7.232.0 / bladefall-v342-early-platforming (2026-09-27)
Reviewed and retained Claude's resident upgrades and compact bell scaffold. New timed cradle/blade crossings in stages 0/1/2 and harder relays in 21/22/25; early Fractured kits cannot import later abilities. Silas has a brake/lift/strike/return-fence quest with visible governor and escort outcomes. Base crossings open shared return walkways; personal retries and carrier launch receipts stay independent in co-op. Quiet first-three resident conversations are accessible. Local build rebuilt; not published.

Six legal crossing routes and independent replays pass without retries; disabled-impulse replays fail. All three opening quest routes, 60 side-story branches and 77 focused units pass. Co-op issue regressions, new bridge/carrier/Silas contracts and every-active-stage world construction pass. Desktop/mobile captures reviewed. Real-network performance and full campaign/human balance are not claimed. Release checker retains its four known editor-reference/size failures. Details and evidence: `docs/charters/early-platforming/PLAN.md`.

Read this first, then search the code. Rewritten in place on 2026-09-21; the previous
chronological brief (7.103–7.133) is `HISTORY-BRIEF-7.103-TO-7.133.md`, kept for traceability
only. **The code wins over every document, including this one.** Session-by-session detail for
7.134–7.166 lives in the owner's Claude Brain vault: `~/Vaults/Claude Brain/_System/Logs/2026-09-19..21-bladefall-*.md`
— useful for *why*, but several of its claims are wrong against the code (noted below).

## Owner revise pass 3, levels 1–4 — 7.234.0 / bladefall-v344-owner-round-3 (2026-09-27)
On top of 7.233. Every report is logged in **`docs/PLAYTEST-ISSUE-TAXONOMY.md`** (rows 25–39; new codes E4, I2, T5,
S4–S8, C2). Before/after sheet: `docs/playtest/7.234-before-after.png`.
- **Mara runs ahead (C2):** after her first talk she folds the board and runs to Broken Muster (10410) at 340 u/s on
  fixed waypoints over real surfaces (`MARA_RUN`, `beginMaraRun`/`updateMaraRun` in index.html): Camp Echo refuges,
  the creek ledges, the Watcher's Cut high road, the vigil staircase (she leaps the dormant sentinel), the Hollow Mile.
  Kinematic (can't fall), hops patrols timed to their speed, never touches blight, not an Up target mid-run; ~28 s.
  `departForMuster` (the off-screen jump) is gone. Co-op: the host runs her; snapshots carry her pose.
- **Road Survey counter (S8):** `surveyTag` beside the flag — "Road Survey: 1/3", 2/3, green at 3/3 for 2.5 s, then
  hidden; stakes restored on load don't replay the glow (`hudBase`).
- **Shops cut (S5):** `SHOPS_ENABLED=false` gates `applyRegionalShop`; Level Select previews skip `workshop:` rewards.
  Shop code and the shopkeeper art are kept for later.
- **Rewards say what they give (S4):** side-story `grantReward` — Elsie (Black Woods refuge) gives the stage's vitality
  fragment ("Four of them add a measure of Blood"); others "patch you up. +2 Blood." Prop titles/prompts match.
- **Black Woods (E4/S5):** canopy/tunnel controllers raise roots only on the floor (y ≤ 10); a knight off the floor
  gets a slow `gasCloud` spore projectile (`drawGasCloud`). The root seam (6470) opens the Updrafts wind shaft in every
  mode and **awards no Vault key** — the Root Key now has no source (open question in the taxonomy doc).
- **Arrivals (T4):** `bladefall-cloaked-man.js` `arrival()` answered every seam plan with its own spawn (x 150 by the
  root-tunnel door) since 7.228; now only its own zone. That was "die in the Causeway → end of Black Woods".
- **Causeway (S6/M3/I2):** the bow rack skips when the loadout already holds a bow; "B · sword" (live keybind) over the
  gear while the bow is out; side-story backdrops are no longer Up targets (they stole Silas's conversation).
- **Map (S7):** `mapModel` keeps one frontier, the lowest-stage open zone (after the Brute: the Updrafts only).
- **Outskirts props (T5):** white trumpets 1300 → 1500; field clock on a 74-unit post. **Portraits (D3):** talking is
  a one-pixel slit, at most two pixels open.
- **Bellows Rest (P1):** the Cartographer's stairs, task frames, slates and portal anchor stay hidden until the knight
  owns `portal-single` (`waitsFor`; he says to come back with the portal gun and doesn't offer the quest until then);
  Ilyra's first post 2050 → 2200; the backdrop draws two bellows tanks instead of four.
- **Verified (headless, frame-stepped, screenshots reviewed):** spores/roots per position; Silas talkable after his
  errand; no shops in stages 1/3/5; seam opens with keys 0 → 0; Cartographer apparatus 0 → 9 pieces with the portal
  gun; Mara 1950 → 10410 in 28.1 s; HUD counter 1/3 and 3/3. Not verified: human feel, real-network co-op.
- **Full suite** (`node --test tests/*.test.mjs`): 1238 tests, 80 fail vs the 7.233 tree at 1236 / 88. Nine
  names now pass that failed before (incl. both Mara relocation tests, rewritten for the run). Two co-op timing tests
  flap under load ("both knights must reach an exit", "the boat ends Act 1"); each passes when run alone.
- Catalog rebuilt (3,101 entries, `--check` passes). Release check: the four known editor-reference/size failures
  only. Mirror rebuilt at 7.234.0; not committed, not published.
- Noticed, not changed: the HUD label "BLOOD" is clipped to "BLOO" (`.barlabel` width 26 px; same in 7.233); a
  traveller's "↑ TALK" prompt shows at 78 units but the talk triggers only within 52.

## Owner revise pass, levels 1–3 — 7.233.0 / bladefall-v343-revise-levels-1-3 (2026-09-27)
On top of 7.232 (early crossings). Every report is logged in **`docs/PLAYTEST-ISSUE-TAXONOMY.md`** (rows 12–24; new
codes M1–M3, E2, E3, T3, T4, S3, D3, D4). Run `node scripts/audit-playtest-issues.mjs --stages 0,1,2`: stages 0–2
report only the intended leads listed there.
- **Mechanics, one per region (M1):** the Outskirts crossing (7.232 "salvage cradle") is gone. Black Woods teaches the
  up-strike only — one blade over a 240 pit (4480–4720) up onto the first canopy branch, then three blades 170
  apart over a 540 pit (6200–6740), authored in LEVELS[1]; down-blades belong to later regions. "Up and strike
  (↑ + attack)" labels the first blade until it is first struck (`meta.upStrikeTaught`). The Causeway introduces
  the counterweight: the freight lift (8520/65 → 8790/200) over a real void (8560–9225), landing `Pl(9115,190,300)`
  100 above the lift top and 160 across — only the lit launch reaches it. Westbound (the critical path returns
  through here), standing on the landing calls the lift up and it waits (`callBlend` in bladefall-early-platforming.js).
- **No safety walkway (M2)** under any crossing (the 7.232 return bridges are gone). **No local retries and no
  "RETRY CROSSING" sign; no auto-checkpoints (S3):** `activateRuntimeCheckpoint` ignores plain checkpoint
  activations unless they are the knight's own flag (it still saves progress and the death loadout). Entrances and
  rests remain. The 7.231 first-fall flag hint remains. Keep/Frostfell tests now assert the respawn point stays put.
- **Enemies (E2/E3):** a ledge guard runs after every AI routine (a grounded walker can't step into a drop it
  couldn't land from, or onto blight); fall resets use a footing inside the surface, and a second fall within 4 s
  sends it to its spawn. 7.232's relocated enemies (a grunt over the Hollow Mile pit, a toxling at the canopy cut)
  were the endless fallers.
- **Oathblade reveal (T3):** stump 2800 → 3640, down-right of the counterweight; the scripted camera centres on both;
  climb steps 3020/70, 3225/135; guard to 3990 [3900,4160].
- **Doors (T2/T4):** `WORLD_DOORS` now covers `black-woods-brute` (Woods 12250 ↔ Causeway 130, root-wall gatehouse
  art); a sealed door refuses before the walk-in. Coming back from the Causeway lands at Black Woods 12160 (it used
  to be 150). Causeway `spawnX:220`.
- **Clutter (P1):** Silas's duplicate steps merged into the 130 court row / dropped (11240/195 already existed); the
  Brute's two shot perches (25 above the archery steps) cut. **Interaction (I1):** in stages 0–2 anything on a raised
  surface is used standing on that surface.
- **Talking scenes (D3):** `public/bladefall-portraits.js` (53 faces, blink, mouth frames) + Celeste-style
  `bladefall-conversation.js` (framed top box, typewriter with skip, knight reply beats, 1.16× lean-in, letterbox;
  reduced motion respected). Sheet: `docs/concept-art/portraits/sheet.png`.
- **Everything readable is editable (D4):** `public/bladefall-text.js` override layer at every display sink,
  `public/bladefall-text-catalog.js` (3,092 strings; rebuild with `node scripts/build-text-catalog.mjs`, `--check`
  in tests), editor `public/dialogue-editor.html` with export/import, write-back `scripts/apply-text-edits.mjs`.
  Workflow: `docs/writing/DIALOGUE-EDITOR.md`. **Rebuild the catalog whenever player-facing text changes.**
- **Verified:** crossing lab (scratch) and 7.232's own crossing verifier — all five crossings complete with zero
  retries; lesson 1 fails without a strike, lesson 2 fails with two; the lift fails unlit and returns west at every
  timing tried; Rowan/Elsie/Silas quest routes pass; both root-tunnel crossings frame-stepped; screenshots reviewed.
  `docs/charters/early-platforming/evidence/` predates 7.233. Not verified: human feel, real-network co-op.
- **Full suite** (`node --test tests/*.test.mjs`): 1236 tests, 88 fail vs a pre-pass 7.232 copy at 1230 / 86. Names
  failing now and not before, after test updates: two co-op tests ("every region builds the same world", "the boat
  ends Act 1") that pass when coop-runtime runs alone; five baseline failures now pass. Tests rewritten to the new
  rules: outskirts/black-woods/brute stage geometry, Keep/Frostfell/White Court auto-checkpoint assertions,
  co-op carrier/wipe tests. `release-check`: the same four known failures (the editor-only text catalog is now
  accepted when dialogue-editor.html loads it). Mirror rebuilt at 7.233.0; not committed, not published.
  Before/after sheet: `docs/playtest/7.233-before-after.png`.

## Owner review of levels 1–2 — 7.231.0 / bladefall-v341-owner-review (2026-09-27)
Owner played the Outskirts and Black Woods after the 7.230 quest refresh and named eleven changes. Every
report is categorized in **`docs/PLAYTEST-ISSUE-TAXONOMY.md`** (codes P1/P2/R1/F1/E1/V1/I1/T1/T2/S1/S2/D1/D2/C1,
with a dated log). **`node scripts/audit-playtest-issues.mjs --stages 0,1`** (or `all`) measures the
geometry/AI/interaction classes in the real engine; on the 7.230 tree it reproduces every one of the owner's
geometry reports, on 7.231 it reports only the intended leads the doc lists.
- **Start clutter (P1):** Rowan's five quest ledges (1190–1710) plus the road's hop plats are now one zig-zag
  scaffold on the bell tower at 1370 (`bladefall-opening-stories.js` install/draw): the road's creek hop 1220/58, then
  1300/114, 1190/170, 1300/226, 1370/282. The Chalice's double-jump ledge moved alone to 2060/215.
- **Vision cones (V1): removed game-wide.** `drawAwareness` (renderer; every region art calls it) and both legacy
  wedges in `index.html` now draw only a small red "!" over an alerted enemy. Don't bring the cone back.
- **Aimless enemy (E1):** `outskirtsEncounterMove` (shared by the Outskirts and Black Woods patrols) treats a ledge as the
  turn point; patrols [2780,3150] and [7120,7525] no longer end over air.
- **Watcher's Cut (R1/P2, owner's 4th screenshot):** new step `Pl(6420,100,64,{eastReturnStep})`, 6360 lowered to 130,
  the three dash stepping plats cut (6540/170 duplicated 6520/170). Hollow Mile refuge 8120→8140 and vigil ledge
  3760→3780 get clean diagonals (same class).
- **Floor trivializing platforms (F1): blighted ground.** Level `blight:[[x0,x1,top],…]` (Outskirts: three creeks,
  Camp Echo creek, the whole low road; Black Woods: canopy floor 4420–6090, Rootbound floor 9700–11290).
  `updateBlight` fills a meter in the mist (1 Blood per 2.2 s) that drains in 3 s out of it; renderer `drawBlight`
  draws the sickly soil, the fog and a meter over the knight. NG+/Boss Rush/test mode exempt. Walking the whole
  low road costs 3 of 5 Blood (measured).
- **Reserve usable from below (I1):** `standingOnSupportOf` gates relics, reserves, survey stakes and the sentinel
  vigil in `outskirtsInteractionCandidate`. Broken Muster's lookout ledges were cut; IRON is at 11370/0.
- **Checkpoints (S1/S2):** every fresh run starts with FLAG 1/1 (Level Select too); `showFirstFallFlagHint` shows
  once per save after the first death (`meta.flagHintShown`), and pulses the flag counter.
- **Mothlight gatehouse (T1/T2):** `MOTHLIGHT_DOORS` {0:13600, 1:120}; the exit/return seam crosses at the door
  (`atMothlightDoor`), `G.gateWalk` walks into the door's depth and out of the other, both directions;
  invisible `gatehouseWall` stops at 13652 / 68; Black Woods `spawnX:210`. Art `drawMothlightGatehouse` (renderer).
- **Dialogue (D1/D2):** ~200 spoken lines rewritten across all acts to one voice bible,
  **`docs/writing/VOICE-BIBLE.md`** (owner-verbatim lines kept). Hollow Marksman's quest label DARO → MARA.
- **Characters (C1):** `public/bladefall-resident-art.js` — a body per talkable person (44) plus the ten quiet
  residents; one-line hooks in the renderer, opening-stories, side-story-world, colony-art, sunspire-art.
  `docs/concept-art/residents/DESIGNS.md`, lineup and before/after sheets.
- **Open (owner decides):** the ten `quietV4` residents (Olan, Orra, Pell, Hale, Outskirts Vey, Sable, Talla,
  Edrin, Senn, Veya) can't be talked to — their rewritten lines never show. Blight is only on levels 1–2.
- **Verified:** probe (jump-only kit) and hand-driven input on every new climb; both quest routes via
  `scripts/verify-opening-quest-refresh.mjs` (stage 0 now waypoints the creek hop); both gatehouse crossings
  frame-stepped; co-op exit test (two browsers) passes through the door. Tests updated where they pinned moved
  geometry (outskirts-stage, coop-runtime guest placement, muster-recall text). Not verified: a human playthrough.
- **Full suite** (`node --test tests/*.test.mjs` — Node 25 rejects `tests/`): 1227 / 1148 pass / 79 fail vs a
  pre-pass copy of the tree at 1220 / 1133 / 86. The only name failing now and not before is co-op
  "a reloaded guest returns to its own checkpoint", which passes alone (load-sensitive, as documented).
  `release-check` fails the same four checks as 7.230; `index.html` (+8 KB) and the renderer (+10 KB) grew
  further past their budgets — the gatehouse/blight drawers are candidates to move into a module.
  Local mirror rebuilt at 7.231.0; not committed, not published.

## The dash is kept in every echo — 7.228.1 / bladefall-v338-dash-kept (2026-09-27)
Owner: "at some point lost the ability to dash despite what level I chose". The cause was Act Three's echo kits.
Each echo gave the kit its original region was entered with, so from the start of Act Three (the Fractured
Outskirts) until the Fractured Updrafts there was no dash, in the campaign and in Level Select.
- `F.setKit` (bladefall-fractured.js) now always includes the dash. The Outskirts echo goes through it.
- The authored kit stays in `G.echoKit`, so the blade is still handed over where the original handed it over.
- Dash implies the blade's memory. Where the original had no dash, `G.echoNoArsenal` stops `ensureTwoWeaponArsenal`
  from arming the knight.
- Verified with real key presses: the dash fires repeatedly in the Fractured Outskirts, Woods and Causeway, in
  Level Select and in the campaign's Act Three start. The hands stay as authored (none; none; the blade).
- Fractured tests: 223 / 225 pass; the 2 failures pre-date this change.

## Battle 42 · the Cloaked Man — 7.228.0 / bladefall-v337-cloaked-man (2026-09-26)
The last fight in the game (stage 43, zone `cloaked-man`): a four-phase boss designed by the owner's little brother.
- **Phases:** I on his feet (the dash-slash, the far slash that comes out behind you, the bat that carries you to him
  for three cuts); II aloft (bat curtains with a gap, the gale dive, the shackle ring); III a spider-skeleton five
  times the knight (the lunge, the long jaw, the finger stabs); IV the whole of him behind the arena (the gaze, then
  open eyes to strike, the hand drag, the teeth, the storm).
- **Code:** `public/bladefall-cloaked-man.js` and `-art.js`. Plan and numbers: `docs/charters/42-cloaked-man/DESIGN-PLAN.md`.
  Concept sheets: `docs/concept-art/cloaked-man/` (Phase 1 made slimmer, at the owner's request).
- **Level Select** (owner's numbering):
  - Base lists 01–14, then the Deep Line 15 through the Sunspire 20, then this fight, 42, always open.
  - Celeste Standard left Base; it is on the title screen.
  - Fractured is numbered 21–40, and Fractured Celeste left it.
  - The Fractured tab's last row is a disabled placeholder, 41, for the final echo's battle.
- **Catalog:** 44 stages. The campaign, progression and world validators count the final battle.
  `tests/campaign.test.mjs`, `tests/rift-shards.test.mjs` and `scripts/verify-celeste.mjs` were updated to match.
- **Verification** (scripted TAS input and headless renders, not a human playthrough):
  - the road from spawn to the fight;
  - every phase's attacks against a knight standing still;
  - striking I down and IV to the closing card;
  - a death in II returns to the vestibule with II kept and Blood full.
- **Tests:** 12 focused tests in `tests/cloaked-man-stage.test.mjs`.
- **Full suite:** 1238 tests. The failures are 71 that already failed before this change (a pre-change copy of the
  tree gives 1226 / 1153 / 73). Renumbering fixed two stale Level Select tests (`fractured-order`, `rift-shards`).
  Count assertions in `progression`, `zones`, `world` and `campaign` were updated for the 44th stage. The co-op
  exit test fails under full-suite load and passes alone.
- **Deploy mirror:** `build-deploy.sh` now also ships `bladefall-side-stories.js` and `bladefall-side-story-world.js`,
  which the page loads but the list had missed. The mirror was rebuilt and smoke-tested as a static site. Not published.
- **Not verified:** co-op and human balance. The road in is a placeholder the owner will design.

## Precision courses — 7.227.0 / bladefall-v336-coop-together
Standalone stages 41 **Celeste Standard** (9 lessons + 9 combinations) and 42 **Fractured Celeste** (9 difficult combinations). Title → Precision Courses; also Level Select. Course-only counterweights, rebound anvils, pogo pearls, upward-slash lift bells, aether transformation and tension rings combine with real tears, hooks, gravity and portals. Local checkpoint retries; fixed course movement; no permanent progress changes. Both complete courses replay with legal TAS inputs, zero retries (7,276 / 4,017 frames); fresh-save UI, native slash input, sixteen blade/momentum checks and eight retry fixtures verified. 47 focused checks pass. Additional regressions cover slash input ordering, held-pound rearming, timed lift boosts, burst exits and four-direction flight. The final room now chains tears, floorless gravity weaving and a ring catch. Course lengths are now 44,000 / 24,200. All five counterweight crossings are widened, with lit/dim charge cues; 240 expired-charge trials fail to land. All five flights have eight alternating obstacles and a necessary refill, with 6.7 / 6.2 seconds per charge. Timed gates follow waitable rings, never forced zipline landings. Purple rings invert gravity on release and grant three seconds of G control. Only the first target per blade direction carries text. Extended verification includes missing-refill trials, ring waiting, release, lease expiry and retry cleanup. See `docs/charters/celeste/DESIGN-PLAN.md` and `npm run verify:celeste`. Local mirror rebuilt; not published. Co-op now requires BOTH players to finish every section: personal device receipts and retries, shared lift activation with return rides, both-arrival checkpoint advancement. All 27 course rooms pass with staggered starts AND simultaneous movement (`npm run verify:celeste:coop`). Campaign exits, boarding and endings likewise require both arrivals. Movement and cameras are independent everywhere; falls, wipes and reconnects use personal checkpoints. Enemy deaths/world actions stay shared. Placed portals are personal, with decorative partner outlines. Campaign co-op checks cover all 40 regions, and dialogue regressions now keep networking/world actions active during conversations and carry saved side-story state into co-op Continue. Title menu is simplified; footer only shows version. External signaling/latency and human balance acceptance are not claimed.

## Targeted second look — 7.220.3 / cache v317
Reviewed the final batch's attack bounds, timed openings, slam activation and victory
transitions. Found and fixed a missed slam edge case in Cliffs, Colony and Path:
the landing window now stays armed throughout a slam. Repeated launch heights and
long descents no longer lose the strike when the engine clears slamming on landing.
57 focused tests pass, including four new slam cases and four real final-hit/next-update
checks (Crown, Sunguard, Ringer, Palace King). Browser native-input fixture performed
two long Path slams from exactly the same height and registered two turns, alive.
This adds targeted evidence, not a complete traversal or human balance endorsement.
Local mirror rebuilt; no deployment. The original batch's verification limits still apply.

## Final fractured refinement — 7.220.2 / cache v316
All twenty echoes are constructed and have received a refinement pass. This batch covers
stages32–40 (Inversion through Palace); the earlier eleven passes remain recorded below.
Warnings now show attack bounds and opening time; Line has ghost rails/pace posts, Shores
has tide staffs, Colony has a detection meter, and Path has windlass timing cues.
Fixed Cliffs final victory being overwritten, Path's NaN overlook beam/render failure,
and Palace removing a guessed portal mouth instead of the actual light exit.
Dead actors stop progressing local encounters; retry clears transient fight/dialogue state;
seven completed boss poses persist on reload. Geometry and authored timing values retained.

78 focused tests pass (nine regions, refinement regressions, campaign order, checkpoints);
all18 gameplay/art files pass syntax checks. Browser startup/render checks cover all nine.
Representative changed cues reviewed, including King gate timer and Shores tide staffs.
Position/clock/phase fixtures with native inputs verified Inversion flip, Cliffs final collar
strike, and one lit Path windlass turn. Completed-circuit reload fixtures retained all seven
boss poses; death fixtures reset all eight encounters and cleared queued dialogue.
No uninterrupted route, full boss sequence, co-op or human balance acceptance is claimed;
construction bot runs remain historical. Local mirror rebuilt; no commit/push/deployment.

## Fractured Colossus refinement — 7.220.1 / cache v315
Construction was complete before this pass; all twenty echoes are now built. The targeted
pour bay shows its actual splash width/height, remaining gather time and a plumb line; the
cue turns blue when its mould is set. These cues draw independently of hull visibility.
Glass moulds show the remaining setting window; machine-bed stone shows its six-second
lifetime. Molten moulds remain visible via the world pass. Slug charge, gantry sweep direction
and head-strike height cues are added. Geometry and timing windows retained.
Dead actors stop scoring/attacking; dead players cannot claim the anvil/valve. Retry clears
slugs, AOE, aim, queued dialogue, volley and slam-origin state while preserving the act.
Act transitions clear old slugs. Completed saves retain the kneeling hull. Local machine
knockback now uses negative-up player velocity and disables jump-cut on the throw.
19 focused tests pass (Colossus, campaign order, player checkpoint). Browser position/clock/
phase fixtures with native slam input set the anvil mould, refused one pour and scored one
head strike. The pour fixture explicitly cleared the strike cooldown; head-strike scoring
was checked, not successful recovery onto the deck. Death cleared hazards and marks;
completed-circuit reload restored kneeling hull/open exit. Pour and completed-pose renders
reviewed; no runtime errors. Full Casting Line/Shaft traversal, complete fight and co-op
were not repeated. Historical construction runs remain historical evidence.
Local mirror rebuilt; no commit/push/deploy. This earlier pass is complete; final remaining batch is recorded above.

## Fractured Palace construction — 7.220.0 / cache v314 (2026-09-25): the last echo
Stage 40, the Sunspire with its light yours to send:
- the Sun Court: a floor mouth in the shaft, its twin on a slate face, the light across into the seal;
- the Hall of Hours: a moving shaft over slate; the twin on the ledge sends it up into the seal;
- the C-side pattern boss, the King in the Dark. He is struck only while light you sent touches him. When struck
  he blinks and takes the mouth that sent it; his timed blinks take nothing.

**The echoes end here.** The King yielding sets `meta.actThreeDone` (saved). Walking out shows the closing card
(END OF ACT THREE / THE ECHOES / All twenty walked). There was no existing hook, and `F.endCard` would have named a
next echo. The Path's east seam `fp-fpa` now walks into the Palace; the Palace has no east seam.

Chained bot run with the Muster: spawn to the closing card in 144 s (blood kept up during the King: 11 hits); the
King 3/3 separately (63–126 s).

**No shared changes.**

6 focused tests. Suite at 7.220.0: 1132 / 1065 pass / 67 fail, the same failures as 7.213.0. Charter `40-*`. Not committed or
deployed. The Palace is ready for its refinement pass.

**Act Three construction is complete: stages 21–40, all twenty echoes built and registered** (sources 0–20, in the
originals' order). Every echo was bot-verified chained from spawn to its end card, in the browser, by scripted
input — none by a human. The owner's playtest of every C-side is the open item.

## Fractured Path construction — 7.219.0 / cache v313 (2026-09-25)
Stage 39, noon on the climb:
- Noon Road: pools of sun that burn; shelters and the vents' smoke are shade;
- the Burning Stair: six risers under wider pools, with shade on every landing;
- the Overlook: rings over the chasm with a beam walking them;
- the C-side, the Sun Gate. The windlass turns only while its mirror lights it: strike it from the ring above
  while it's lit, and leave the light. Three turns open it, a turn slips back after 7 s, and a keeper walks the
  apron.

Found: a jump out of a hang is one jump from a standstill (the air jump is spent). Chained bot run with the
Muster: spawn to the end card in 65 s; the gate 3/3 separately (15–18 s).

**No shared changes.**

5 focused tests. Suite at 7.219.0: 1126 / 1058 pass / 68 fail — the 7.213.0 set plus the co-op runtime test that passes
alone. Charter `39-*`. Not committed or deployed. The Path is ready for its refinement pass.

## Fractured Colony construction — 7.218.0 / cache v312 (2026-09-25)
Stage 38, the Colony emptied:
- the Watch: three lamps sweeping; tent to tent; held in a lamp 0.25 s and you're caught;
- the Dry Spring: rings up to the conduit, its lamp, cisterns; strike the tap from above for the yard gate;
- the C-side pattern boss, the Ringer's echo. Hook across over his head, drop behind him, strike before he
  turns; his lamp makes him ring and the chained lunge.

Chained bot run with the Muster: spawn to the end card in 75 s; the Ringer 3/3 separately (15–17 s).

**No shared changes.**

5 focused tests. Suite at 7.218.0: 1121 / 1054 pass / 67 fail, the same failures as 7.213.0. Charter `38-*`. Not committed or
deployed. The Colony is ready for its refinement pass.

## Fractured Shores construction — 7.217.0 / cache v311 (2026-09-25)
Stage 37, the strand at a higher tide:
- the Gut (three rings) and the Hull (two rings);
- the Flats at Flood: a 15 s tide that drowns. Dry ~6.2 s a cycle; refuge to refuge — a rib and a wreck by their
  rings, and a float that rides the tide. Every raised face is coated (a raised block is solid only from above);
- the C-side pattern boss, the Sunguard's echo: a turning shield and a bell. Only a blow on its back while the
  toll rings counts. From the second act the court floods.

Chained bot run with the Muster: spawn to the end card in 105 s; the Sunguard 3/3 separately (31–46 s).

**No shared changes.**

5 focused tests. Suite at 7.217.0: 1116 / 1049 pass / 67 fail, the same failures as 7.213.0. Charter `37-*`. Not committed or
deployed. The Shores are ready for their refinement pass.

## Fractured Cliffs construction — 7.216.0 / cache v310 (2026-09-25)
Stage 36, the ship wrecked and the sea up the cliffs:
- the Wreck: the windlass gives the Chainhook to a downward strike; two rings over the first gap;
- the Iron Road: six rings over the sea, with the lightning walking east along them — follow it;
- the Breakers: 260-high walls of water off the sea every 3.4 s; be hanging from a ring as one passes;
- the C-side pattern boss, the Last Head. It lunges at the ring you stand under and strains its chain; hook that
  ring and strike its collar lock from above. From the second act the breakers come into the hall, and in the
  third the lightning finds the head's rings.

Chained bot run with the Muster: spawn to the end card in 72 s; the Last Head 3/3 separately (22–26 s).

**No shared changes.** The hook works on every stage from 16 up; the Hydra and the ship are stage-16-only and
unused. The echo draws the chain from your hand to the ring itself (only stage 16's art did).

6 focused tests. Suite at 7.216.0: 1111 / 1043 pass / 68 fail — the 7.213.0 set plus one co-op runtime test that passes
alone. Charter `36-*`. Not committed or deployed. The Cliffs are ready for their refinement pass.

## Fractured Line construction — 7.215.0 / cache v309 (2026-09-25)
Stage 35, a cart ride east, as the original was:
- the Cut Fork: the switch, and the low road ends in the dark;
- the Falling Bridge: six spans at 1.6 s;
- the Trick Gaps (340 / 505 / 505): the last two are past the cart's best without a surge (496), so each needs a
  clean 360 over the one before;
- the C-side, the Black Line: rail that's solid only while a travelling light is on it. The light moves at 270,
  then 110, then 570; pace the cart to stay in it.

Chained bot run with the Muster: spawn to the end card in 30 s, no hits.

**No shared changes.** Cart mode, switches, collapse spans and slopes are all flag-driven. The cart's momentum
window stays hard-coded to x > 6800 in every cart level; the echo is built around it. The Black Line uses
`fractured-clockwork.mp3` (added to the precache and build lists by hand).

6 focused tests. Suite at 7.215.0: 1105 / 1038 pass / 67 fail, the same failures as 7.213.0. Charter `35-*`. Not committed or
deployed. The Line is ready for its refinement pass.

## Fractured King construction — 7.214.0 / cache v308 (2026-09-25)
Stage 34, the Throne with the Echo and no Oren:
- the First Mark: an echo-only mark holds the gate beside it;
- the Return: a plate far below a gate holds it for 2.5 s; only the echo left at the gate gets you back up in
  time;
- Two Marks at Once: the echo's mark behind you and yours past a tear and teeth; a span comes while both are
  weighed together;
- the C-side pattern boss, the Weighed Crown. Weigh both marks and it is pulled down onto your echo; trade places
  and strike. From the second act it breaks echoes that stand 4.2 s; in the third your mark is on a perch.

Marks let their echo go once their work is done, or the next key press would trade you back. Chained bot run
with the Muster: spawn to the end card in 116 s; the Crown 3/3 separately (64–67 s).

**Shared, both additive:**
- `echoVerbAvailable` also honours a level's `echoVerb` flag.
- The renderer's `plate` case asks the region's art first.

7 focused tests. Suite at 7.214.0: 1099 / 1031 pass / 68 fail — the 7.213.0 set plus one co-op runtime test that passes
alone. Charter `34-*`. Not committed or deployed. The King is ready for its refinement pass.

## Fractured Tyrant construction — 7.213.0 / cache v307 (2026-09-25)
Stage 33, walked west to east (the original ran east to west):
- the Torn Road: one tear across a void;
- the Blinking Chain: three tears stepping down over a 2300 void, each open 0.7 s, each opening as a knight off
  the last arrives; chained in the air;
- the Spent Line: the Citadel's room 4 walked the other way. Both mouths go on a raised slate face; a tear ridden
  into the lower one throws you out of the upper, over 1400 of teeth that rewind like a fall;
- the C-side pattern boss, the Tearer. It can't be cut; ride its own tear through it — from the floor, from a
  perch, then off a spent lift into a second tear in the air. It fires volleys, and from the second act strikes
  the floor where you stand.

Chained bot run with the Muster: spawn to the end card in 82 s; the Tearer 3/3 separately (39–58 s).

**Shared:** the Fractured core's `muster()` fell back to undefined Muster bounds for an enemy with no patrol. The
engine clamps to them every frame, so the enemy's x went NaN the first frame it moved. It now falls back to ±240
around the spawn. `bladefall-fractured.js` is stamped 7.213.0.

7 focused tests. Suite at 7.213.0: 1092 / 1025 pass / 67 fail, the same failures as 7.212.0. Charter `33-*`. Not committed or
deployed. The Tyrant is ready for its refinement pass.

## Fractured Inversion construction — 7.212.0 / cache v306 (2026-09-25)
Stage 32, walked west to east (the original ran east to west):
- the anchor (the flip, where it was);
- the Crossings: where the floor fails a pillar stands in the gap, so you walk the roof; where the roof fails a
  spur hangs in it, so you walk the floor. One roof crumbles, one has teeth on a beat;
- the Gulf: both floors gone, under a spur and over a pillar in one flip;
- a last crossing: a crumbling roof with teeth in it, and solid roof to wait on before it;
- the Weave: walls up and walls down, 300 apart, with thorns on your own surface;
- the C-side pattern boss, the Keel. It shows its keel to the surface you're not on and burns the one you're on;
  flip at a run and strike from its side; a second sweep follows you from the second act, a dive in the third.

Chained bot run with the Muster: spawn to the end card in 77 s; the Keel 3/3 separately (23–24 s). The Gulf's flip
windows are ~0.57 s and ~0.43 s at a run.

**Shared:**
- The camera takes an optional `maximumY`, set per region through Act Two's `cameraCeiling`. The Inversion
  uses it so a knight on the roof still sees the floor. Without a region cap the camera is unchanged.
- The renderer draws every floor spike standing up, so the echo draws its own hanging teeth.
- The Level Select test now expects the echoes in the originals' order, following another agent's reorder of
  `bladefall-rift-shards.js`.

8 focused tests. Suite at 7.212.0: 1085 / 1018 pass / 67 fail, the same failures as 7.210. Charter `32-*`. Not committed or
deployed. The Inversion is ready for its refinement pass.

## Fractured Colossus construction — 7.211.11 / cache v305 (2026-09-25)
Construction finished (registered at 7.211.0; the refinement passes 7.211.1–7.211.10 ran alongside). Stage 31:
the Anvil (the downward strike, where it was; its mould on an iron pedestal, set to lift the bars), the Casting
Line (six moulds never solid together; set each to wait on it; gaps 90), the Shaft (a wet chimney, eleven moulds
90 apart set as you climb, lava at 40/s behind you, the valve's full-height bars), and the C-side pattern boss, the
Warm Machine (refuse the pour by setting the bay it gathers over; counter the slug — a countered slug gets a fresh
life; strike its head from the gantry — thrown back onto the deck). Chained bot run with the Muster: spawn to the
end card in 98 s; the Line, the Shaft and the Machine each 3/3 separately. Found: `p.vy` is positive-down; a
released jump cuts an upward throw unless `jumpCutOk` is off. 6 focused tests pass. Charter `31-*`. Not committed
or deployed. The Colossus is ready for its refinement pass. Suite at 7.211.11: 1077 / 1008 pass / 69 fail — the 7.210
set, plus the Level Select echo list (a stale test after the reorder, fixed at 7.212.0) and one co-op test that
passes alone.

## Fractured Emberdeep refinement — 7.211.10 / cache v304
Molten slabs render in the world pass because gone platforms skip the shared platform pass.
Solid slabs show remaining time before melting; refuge brackets mark the safe span. Slag
has a landing footprint while warning/falling and a remaining-dwell rim once landed.
Spout warning brackets and the pouring envelope cover its actual 44-unit damage corridor.
Purge vents gain steady eastward warning ticks and a 30-unit heat envelope. Purge music
state stops on death/completion. Route, collision and hazard timings retained.
18 focused tests pass (Emberdeep, campaign order, player checkpoint). Browser position/clock
fixtures confirmed active-vent rewind to x6250 and standing safely on the first refuge during
a sweep window. Position fixtures granted Command and completed the Purge; both survived
stage reload. Pour Schedule, Slag Stair and refuge renders inspected; no runtime errors.
No full Pour/Stair/Purge traversal or co-op check was repeated. Historical construction
runs remain historical evidence. Local mirror rebuilt; no commit/push/deploy.
Next refinement: Fractured Colossus; inspect its current construction status before editing.

## Fractured Sorcerer refinement — 7.211.9 / cache v303
The thawed bridge outline draws in the world pass (gone platforms skip the shared platform
pass). Its frozen surface shows remaining hold time; visible conduits connect condensers to
the bridge and Gallery gate. Mirror cast light and projectile share one world-space origin;
charge follows each cast/twin duration, with distinct twin/lob cues and ward return marks.
Dead actors stop casting/scoring; reset clears Mirror orbs, queued dialogue and twin/timing
state and restores the retained phase's position. Phase changes discard old Mirror orbs but
preserve emitter bolts. Victory and completed saves leave glass fragments on the floor.
18 focused tests pass (Sorcerer, campaign order, player checkpoint). Browser position fixtures
used native portal input to feed the Glassworks, observed freezing and thawing, reviewed both
bridge renders and the native Mirror tell/cast. Death fixture cleared orbs and reset the fight;
completed-circuit reload restored floor fragments and open east gate. No runtime errors.
Geometry and attack/bridge timings retained. Full crossing, Gallery climb, all-phase boss win
and co-op were not repeated; historical construction runs below are not new evidence.
Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Emberdeep.

## Fractured Frostfell refinement — 7.211.8 / cache v302
Spear cues use each actual windup duration: a held thrust stays blue until the final .22 s,
with a filling shaft line and combo notches distinguishing the guard-opening final thrust.
Reels show their remaining opening, sweeps their floor reach/clearance, and shards their
remaining count. Thin ice loses its bright edge as it weakens; a sunk plate now has a
refreezing outline drawn outside the shared platform pass. Geometry and timings retained.
Dead guards/players stop attack progression, dead players cannot claim the memory or toll,
and death/victory clears remaining low attacks. Completed saves restore the kneeling Rimeguard.
19 focused tests pass (Frostfell, campaign order, player checkpoint). Browser position/timing
fixtures with native inputs verified counter-and-blade damage on a tollman, held second and
final Rimeguard counters (only the last opens the guard; no damage), and ice collapse/return.
Completed-circuit reload restores kneeling armour, lowered guard and open east gate.
Spear, held-beat, weakening ice and refreeze renders inspected; no runtime errors.
No new full traversal, complete boss fight, timed Stair run or co-op verification is claimed;
historical construction runs were not repeated. Local mirror rebuilt; no commit/push/deploy.
Next refinement: Fractured Sorcerer.

## Fractured Warden refinement — 7.211.7 / cache v301
Gallery lanterns mark a turnkey's committed lunge and exposed recovery side. The cage has
an upper-height band and current-height pointer; its mouth attachment survives JSON hydration.
Sentence cues show the slam's actual reach, the rush's committed destination, and the floor
slates during pronunciation. Portal capture requires a floor pair physically inside the well.
Death clears transient hit/throw/slam state and preserves only a completed rush phase;
completed saves retain the empty armour with its shield lowered. Geometry and timings retained.
20 focused tests pass (Warden, campaign order, and the actual player-checkpoint.test.mjs).
Audit correction: the original 13-test command named a nonexistent checkpoint-flags file;
those 13 results covered Warden/order only. Two added tests cover completed armour and
slam cue dimensions across zoom levels. Browser recheck verified a native jump avoids the
slam, death clears throw/hit/AOE transients but keeps the finished rush phase, and a
completed-circuit reload restores lowered armour and an open east gate. The save fixture
seeded completion circuits; it did not win the fight.
Browser position/phase fixtures used native portal input: a cage mouth rode through JSON
hydration, and a well pair caught the Sentence's native charge and threw it. Cage and rush
renders reviewed; no runtime errors. Full traversal, full fight, timed Cell exit and co-op
were not repeated. Historical construction evidence below is not evidence from this pass.
Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Frostfell.

## Fractured Keep refinement — 7.211.6 / cache v300
Keystones draw as inlaid masonry via an opt-in crate art hook. Visible release-to-hoist and
receiver-to-gate cables explain the mechanisms; a tensioning cable marks failed-stone recall.
Wet faces have a steady rim, the cradle deck matches its collision top, and the bell/chain use
consistent world coordinates. A plumb line gives the cradle swing a fixed centre reference.
The Belfry camera now includes the bell while standing at the release.
Completed weights use the engine's seated-weight path. The docked stone stays in its socket;
the rung bell-stone attaches to the moving cradle, including after reload/hydration, instead
of respawning on its hoist. Dead players cannot take the Grip or complete a mechanism.
19 focused tests pass (Keep, campaign order, player flags). Browser position fixtures with
native mouth/attack inputs completed the hall route without damage and native interaction
took the Grip. A native Belfry throw missed; its stone returned to the hoist. A separate
landing fixture verified the physical catch, opening gate, moving seated stone and stage
reload retention. No successful timed portal throw, full traversal or co-op verification is
claimed for this pass; historical construction runs below were not repeated. Representative
dock and Belfry renders reviewed; no runtime errors. Geometry, swing period and catch window
retained. Local mirror rebuilt; no commit/push/deploy. Next refinement: Fractured Warden.

## Fractured Marksman refinement — 7.211.5 / cache v299
Held strokes now identify the attack: I single, II brace, III Reckoning in every phase (formerly
sequence position could show II for a single or IV for Reckoning). Off-screen count/lock cues,
shared projectile/preview origins, exact brace spread, world-scaled figures and brighter coats
improve legibility. The works target has a visible gate cable; the exposed tally board fades
its lit rims over the actual blade window. A returned Reckoning clears the Tallyman volley;
watch arrows remain. Dead actors stop advancing attacks; death clears transient aim/volley state.
A completed save restores the kneeling Tallyman, cut board and laid-down bow.
20 focused tests pass (Marksman, campaign order, player flags). Browser: native mouth placement
and stepping away opened the works gate without damage. A targeted Reckoning-state fixture,
with a freshly placed native mouth, returned the real shot; native dash/jump/blade inputs cut
one tally with no damage or healing. Reload retained that earned tally and the works gate.
Completed-save fixture verified the kneeling figure and open exit. Representative warning,
exposure and victory renders inspected; no browser errors. No full fight/level/co-op claim.
Road geometry, kit, Windcut, attack sequences and timings retained. Local mirror rebuilt;
no commit/push/deployment. Next refinement: Fractured Keep.

## Fractured order and Causeway refinement — 7.211.4 / cache v298
Level Select, map columns, forward/backward seams and transition graphs now follow the originals:
Outskirts → Woods → Causeway → Updrafts → Marksman → Keep. Stable stage IDs preserve save identity;
nextEcho orders by source region. New connectors: fw-fc, fc-fu, fm-fk; fu-fm retained.
Causeway: a mandatory bow-release/weight gate after the Standard teaches the boss mechanism.
Persistent practice and yard weights and crushed wreckage restore at floor height with solid
collision. Falling masses show a ground warning; matching cable/mass colors and severed releases
clarify the target. Iron Echo art uses world scale and a lowered charging body; the last-count
stamp marks its tracked target. Dead actors cannot advance the fight or take the bow.
47 focused tests pass. Browser fixtures: native bow pickup/shot opens the lesson without damage;
reload retains the gate and grounded weight. Native jump/shot completes one boss crush without
damage; reload retains the grounded wreck. Rendered lesson, warning and boss frames reviewed.
Native Woods exit reaches the corrected Causeway boundary; TAS intentionally stops at seams,
so transition plans were checked separately in both directions. No full-level/co-op claim.
Local deploy mirror rebuilt; no commit/push/deployment. Next refinement: Fractured Marksman.

## Fractured Updrafts refinement — 7.211.3 / cache v297
Full-height steady amber rails warn before thermal reversal; repeated arrows and brighter
exhale air reveal direction even above the grate. Storm motion/flashes respect reduced motion.
Ceiling teeth now end at their actual lower damage boundary; damage uses player height and
applies downward knockback after the shared hurt response. Dead players cannot trigger teeth
or crown completion. Geometry, kit, breath timings, crystal route and Lung remain intact.
21 focused tests pass. Native browser fixtures checked the First Breath, a Bellows transfer
without damage, and tooth contact (one Blood, downward velocity). Representative thermal and
teeth frames reviewed. No full-level/co-op playthrough claim. Local mirror rebuilt; no deployment.

## Fractured Woods refinement — 7.211.2 / cache v296
Stage22: catch basin under the first two wind hops; upper climb/timings/patrols retained.
Solid/incoming/false branches have distinct rims, with local wind ribbons at both rests.
Visible counterweight-to-stump linkage, root release, real thorn and crumble warnings.
Wind now repairs restored branch solidity each frame.26 focused tests; native fixtures
verified release/pickup/reload, safe early fall, two wind changes to the first rest, and
thorn timing. No full-level/co-op claim. Charter records evidence; local mirror rebuilt,
no commit/deploy. See ACT-THREE-REFINEMENT-NOTES.md for bounded workflow reuse.

## Fractured Outskirts refinement — 7.211.1 / cache v295
Owner found the road easy and the weaponless boss opaque. Stage21 now has narrower,
longer crumble sequences, three warned low chain sweeps and a persistent practice
bell/gate teaching touch-to-ring. Boss release is at the entrance; bronze foothold rims,
physical hammer grip/shoulders, emphasized next bell and gate cables clarify the puzzle.
Longer early tells/climb windows still tighten by phase. Death clears both temporary
platforms; crumble warnings now read the actual timer. 29 focused tests pass; native
fixtures checked the new road sequence, lesson and sweep, and completed all three boss
bells continuously without damage/healing from an initial entrance fixture. Reload
retains bells/open gate. No full road or co-op claim. Charter records limits. Local
mirror rebuilt; no commit/push/deploy. Other Fractured work, including Colossus, preserved.

## Checkpoint system — retained from 7.177.0
Owner requested removing every preset checkpoint FLAG, preserving other saving. All campaign/bonus stage loads now strip authored flags; dynamic flags cannot activate or draw. Authored Check definitions remain as assembly/authoring inputs, removed from live play after assembly. Rest, entrance, story/mechanism and boss-act recovery are unchanged.
Kills grant `G.checkpointCharge=1`, capped at one; `R` places a flag on stable clear footing and spends it to zero. No negative balance, no extra banking, no kill required until choosing to place. The previous player flag is replaced. Charge and flag persist in savedRunSession and survive death/Continue. HUD button shows R · FLAG 0/1 or 1/1 and supports click/tap. Take Item moved to C; old R bindings migrate without intentionally resetting other custom keys. Existing no-checkpoint modes (hardcore/Boss Rush) remain excluded. Moving/crumbling/gated footing and upside-down gravity reject placement without spending. During a live boss, solid heat slabs may hold a flag, and Colossus acts 2/3 are allowed.
Validation: 12/12 new checkpoint + existing recovery checks; all 16 runtime stages loaded with zero authored flags; actual kill cap, duplicate-kill guard, placement/spend, second-placement refusal, death and Continue exercised; input-loop checkpoint action exercised. Other rest sites retained. Local mirror rebuilt, no commit/push/deploy.
Prior Colossus first visual refinement and accepted Emberdeep/door work remain. Unrelated audio/music changes preserved. Boss flags now capture a JSON-safe encounter graph: boss HP/phase/timers, arena geometry and shared references, enemies, companions, projectiles, machinery, gravity and clock. Death, nonlethal rewind and Continue restore it only when the recovery position matches that flag. Rebuild the persistence manifest after restore; victory discards the snapshot so the boss stays defeated. Other recovery sources remain unchanged. Validation: 30 focused tests; all seven campaign bosses restored HP/phase in runtime; Colossus acts 2/3 survived death and serialized Continue; victory cleanup checked. No full fights replayed. Health-bar recommendation discussed only: understated bars for damage fights, physical phase cues for puzzle bosses. Next: owner feedback.

## Sunspire Palace refinement — 7.200.0
Teal routed rays with travelling highlights and charging seal rims distinguish puzzle light.
Followers no longer block rays. King rise/climb previews do not burn; setup is 4.5s/6.5s, blink
has its full windup, flare shows actual reach, helper touches commit to a physical side.
Saved hours restore flowers; victory reload retains the seated King. Hydra boarding now walks
and hops onto the lowered head before the existing ride/ending. Choices, six blooms, three
locks and Act Three story retained. 35 focused tests and targeted browser fixtures; stage 20
charter records scope and solo-balance caveat. Local mirror rebuilt; no commit/deploy.

## Path to the Palace refinement — 7.199.0
The apron mirror has a 2.6s shutter interval and 0.65s warning. Allied shade comes from the
actual nearby canvas carrier; companions wait on the bank during the retained three-hook
crossing. Oren works on anchors only near the player. Each anchor and windlass turn persists.
The windlass has the established slam cap; a visible counterweight and a 540-high gate fit the
camera. Palace backdrop now sits on its ridge; Hydra swims in world space. Branches/MENDED
retained. 32 focused tests plus targeted native fixtures; stage 19 charter records scope.
Local mirror rebuilt; no commit/deploy. Owner playtest pending.

## Colony refinement — 7.198.0
Compassion now adds two visible blanket refuges, not global searchlight immunity. Warning is
0.85s; cleared watches shutter and persist. The tap has a matching slam cap, progressive water
and moving counterweight highlights. Sable talks near himself; recognition includes Oren's
hammer explanation. Oren works while the player stays near the next post. Freed shackles
persist individually, including returning after silencing the yard. Cure, choices and road
consequences retained. Focused tests and native fixtures documented in stage 18 charter.
Local mirror rebuilt; no commit/deploy. Owner playtest remains the pacing check.

## Landing Shores refinement — 7.197.0
Tide begins on first dune approach, with two raised wreck ribs and wider floating footholds.
Flooding damages/knocks upward in place; only the actual void recovers position. The cliff's
second wave is replaced by a hook-to-hoist/slam-cap encounter: bell silences, conscripts flee,
bars open. Its cap uses Thunder Cliffs' established visual cue. Oren's choices and gate
Sunguard retained. 17 focused tests plus native-input water, hoist, refuge and float checks;
representative renders reviewed. See stage 17 charter for current design and evidence.

## Thunder Cliffs refinement — 7.196.1
Shorter progressive voyage; rolling foam/spray waves; longer rigging access around breakers.
Chainhook now auto-equips from slamming the wreck windlass, with three stable return rings
ending over the forecastle. Hydra lunges always strain the chain: A hooks its bright collar
(or retain dash riding), then slam the matching gold cap. Longer openings, earned slam grace,
separated storm volley/lunge, visible high-lock framing, and freed-head encounter recovery.
Old post-Tow saves receive the moved unlock. Full current design/evidence:
`docs/charters/16-thunder-cliffs/DESIGN-PLAN.md`. Local mirror only; no commit/deploy.

## Project and rules
- Act Two preparation: `ACT-TWO-REFINEMENT-NOTES.md` records the stage 16–20 review, ideas to preserve, and targeted refinement concerns. Review only; no gameplay changes.
- Path `~/Projects/Bladefall-2D Antigravity` (outside iCloud since 2026-09-15; the Desktop path is a
  symlink; never touch `~/Desktop/Bladefall-2D Antigravity (old iCloud copy)`).
- Runtime: `public/index.html` (~25.8k lines: engine, every level, UI) + `public/bladefall-*.js`
  (51 modules; `bladefall-coop-journey.js` is plain functions over the page's globals, not a
  module object) + `public/bladefall-respec-renderer.js` (the v4 pixel renderer). Edit `public/`,
  never `netlify-deploy/`. **Never deploy to Netlify without explicit owner permission.**
- `main` (pushed to github.com/isaac2055/Bladefall-2D) holds 7.169.0, the first full draft of
  Act 1: commit `16b3408`, tag `act-1-draft`. `chore/track-authoritative-tree` is at the same commit.
  `main` is still at 2d6fe28. Commit or push only when asked.
- `USAGE-POLICY.md` still applies: targeted reads, one implementation pass plus one focused
  validation pass, a full suite only at integration boundaries.

## How the owner judges work (non-negotiable)
- **Every section is mandatory, or it is cut.** No optional side routes, coin climbs, chimneys,
  props without a job. One coin per stage, on the road.
- **Width gates nothing below ~800.** Full-kit reach is 671 flat / 726 off a 210 drop / 774 off a
  400 drop. Gate a verb with a mechanism (a plate, a door, a surface only it can use).
- **When the owner names a change, make exactly that change.** Report forced deviations with the
  number that forced them. The Citadel's second pass substituted redesigns and was rejected in capitals.
- **Felt impact, not mechanism.** Say what the player meets in the first minute from the real
  arrival. Load a region cold in the browser and look at the frame before calling it verified.
- No signs, banners, loot carpets, "memory missing" text or `1/3` counters. A switch needs
  visible feedback; a closed gate draws as a dashed outline, never as a floor.
- Level Select must give exactly the kit a real playthrough would have on entering that level
  (09-DECISIONS "Verification truthfulness").
- Frozen/accepted: Hollow Marksman balance; opening through Warden "complete in substance";
  Emberdeep `stillCamera` (no shake anywhere in it) and its owner cuts; Foundry owner cuts;
  White Court finale "longer AND harder". Region charters' OWNER CUTS sections override their plans.

## The world (code indices are 0-based; docs/charters are 1-based)
| # | Region | Level const | len | Walk | Verb granted | Owner status |
|---|---|---|---|---|---|---|
|0|Outskirts|LEVELS[0]|13800|E|jump|accepted in substance|
|1|Black Woods|LEVELS[1]|12400|E|weapon|accepted|
|2|Broken Causeway / Brute|LEVELS[2]|14000|E|dash|accepted|
|3|Updrafts|UPDRAFTS_LEVEL|18000|E|portal-single|accepted; return-spawn fix (7.164) unconfirmed; holds the **keel**|
|4|Hollow Marksman|HOLLOW_MARKSMAN_LEVEL|15000|E|portal-pair|accepted, frozen; holds the **mast**|
|5|Ruined Keep|RUINED_KEEP_LEVEL|18000|E|wall-jump|accepted; holds the **sail**; Deep Line boarding at far east|
|6|Gaol / Warden|WARDEN_LEVEL|15000|W|counter|accepted|
|7|Frostfell|FROSTFELL_LEVEL|15100|E|double-jump|"Love it"; Muster bell = world recall|
|8|White Court|WHITE_COURT_LEVEL|16000|E|attunement|beaten; harder finale built|
|9|Emberdeep|EMBERDEEP_LEVEL|16400|E, then down|companion-command|failed 09-19, fixed, re-playtest pending|
|10|Foundry / Colossus|FOUNDRY_LEVEL|16600|E, exits down|downward-strike|owner accepted after refinement|
|11|Inversion|INVERSION_LEVEL|16100|W, down|gravity-flip|refinement ready for owner playtest (7.183.2)|
|12|Paradox Citadel / Void Tyrant|VOID_TYRANT_LEVEL|17000|W|—|refinement ready for owner playtest (7.185.1)|
|13|Drowned Throne / Right Hand + Abyss King|ABYSS_KING_LEVEL|18600|E|the Echo (stage-local verb)|refinement ready for owner playtest (7.186.0)|
|14|(cut Gilded Vault)|— inert slot|—|—|—|kept so later indices keep their numbers|
|15|Deep Line|SECRET_LEVEL / SECRET_LEVEL_RETURN|13950|cart E; mirrored return W|—|played 09-21; 7.167 return fixes (Level Select, westbound lean, switches) pending; content is still procedural-era|
|16|**Act Two** · Thunder Cliffs / the Chained Hydra|`BladefallActTwo.level(16)` (bladefall-act-two.js)|6400|a TIMED voyage (the ship stands still), then E along the quay|**chain-hook** (13th ability, key A)|built 7.188.0; owner playtest pending|
|17|**Act Two** · The Landing Shores / the choice|`BladefallActTwo.level(17)` (bladefall-landing-shores.js)|12800|E and rising (shelves 200, 0, 300, 720)|the tide (region-only); the white flower if the hand is taken|built 7.189.0; owner playtest pending|
|18|**Act Two** · The Colony / the cure and the turn|`BladefallActTwo.level(18)` (bladefall-colony.js)|10800|E and down (shelves 300, 200, 100, 0); the gate W is walked back to 17|glasses + smoke (region-only); MENDED if cured|built 7.190.0; owner playtest pending|
|19|**Act Two** · The Path to the Palace / the Sun Gate|`BladefallActTwo.level(19)` (bladefall-palace-path.js)|10400|E and up (0 → 770); a 1300 chasm crossed by three rings; the road W is walked back to 18|mirrors + shelters + smoke (region-only)|built 7.191.0; owner playtest pending|
|20|**Act Two** · Sunspire Palace / the King in Daylight|`BladefallActTwo.level(20)` (bladefall-sunspire.js)|11800|E (flat; the flume dips to -120); the Sun Gate W is walked back to 19|light through portals (region-only: sun-seals, slate); the King's two-sided touch|built 7.192.0 — ends Act Two; owner playtest pending|
|21|**Act Three** · The Fractured Outskirts / the Mile Sentinel|`BladefallActTwo.level(21)` (bladefall-fractured-outskirts.js)|9900|E; pits to the void; a single jump, no blade; the Muster forced|the Sentinel (a weaponless pattern boss: three bells)|built 7.201.0; owner playtest pending; hidden from the Base list (`act:3`), on Level Select's Fractured tab|
|22|**Act Three** · The Fractured Woods / the Mirror Thicket|`BladefallActTwo.level(22)` (bladefall-fractured-woods.js)|10400|E; the canyon of the thicket and the root stair over the void; one jump; the blade from the stump once the counterweight is stood on|the thicket (branches hold only while the wind is against their resin; the wind turns every 2.6 s)|built 7.202.0; owner playtest pending|
|23|**Act Three** · The Fractured Updrafts / the Lung|`BladefallActTwo.level(23)` (bladefall-fractured-updrafts.js)|10400|E and up to 1040; jump + blade + dash, no Pack; the thermals breathe (inhale lifts, exhale throws down)|the Lung (four columns, left for the next on the breath)|built 7.203.0; owner playtest pending|
|24|**Act Three** · The Fractured Marksman / the Tallyman|`BladefallActTwo.level(24)` (bladefall-fractured-marksman.js)|10800|E; pits, a slick tower, the Windcut launch over the void; jump + blade + dash + one mouth|the Tallyman (a pattern boss: I one arrow, II three, III the Reckoning — sent home through your mouth; cut a tally while it is down; three)|built 7.204.0; owner playtest pending|
|25|**Act Three** · The Fractured Causeway / the Iron Echo|`BladefallActTwo.level(25)` (bladefall-fractured-causeway.js)|11400|E; masses let go on whoever walks under, lifts over the void; one jump + blade, the Longbow on the Standard|the Iron Echo (a pattern boss: bait its committed charge into a buffer, shoot the release of the mass over it; three)|built 7.205.0; owner playtest pending|
|26|**Act Three** · The Fractured Keep / the Belfry|`BladefallActTwo.level(26)` (bladefall-fractured-keep.js)|10600|E and up to 920; twin mouths, the keystone to its dock, the Grip (wall jump) mid-level|the Belfry (no boss: the bell-stone thrown through your mouths into a swinging cradle)|built 7.206.0; owner playtest pending|
|27|**Act Three** · The Fractured Warden / the Sentence Well|`BladefallActTwo.level(27)` (bladefall-fractured-warden.js)|9600|E; the dark Gallery, thin air over the void, the Turning Cell up to 800|the Sentence (pattern boss: dash through its rush, strike its back; then its own rush thrown through your mouths)|built 7.207.0; owner playtest pending|
|28|**Act Three** · The Fractured Frostfell / the Crown|`BladefallActTwo.level(28)` (bladefall-fractured-frostfell.js)|9800|E and up to 690; the Toll, thin ice over meltwater, the double jump (memory), the thawing Stair|the Rimeguard (pattern boss: every opening a countered thrust; the drill, the feint, the thaw)|built 7.208.0; owner playtest pending|
|29|**Act Three** · The Fractured Sorcerer / the Mirror's well|`BladefallActTwo.level(29)` (bladefall-fractured-sorcerer.js)|9600|E; the beat bridge over the void, the band intake, the portcullis|the Mirror (pattern boss: through your mouths / countered / countered into a mouth)|built 7.209.0; owner playtest pending|
|30|**Act Three** · The Fractured Emberdeep / the Purge|`BladefallActTwo.level(30)` (bladefall-fractured-emberdeep.js)|10000|E, up the Slag Stair (630) and down; heat slabs, spouts, slag|the Purge (no boss: a sweep faster than a run; the slabs it cools are the refuges)|built 7.210.0; owner playtest pending|
|31|**Act Three** · The Fractured Colossus / the Warm Machine|`BladefallActTwo.level(31)` (bladefall-fractured-colossus.js)|9000|E, up the Shaft (990) and down; moulds set by the downward strike|the Warm Machine (pattern boss: refuse the pour / counter the slug / strike from above)|built 7.211.11; owner playtest pending|
|32|**Act Three** · The Fractured Inversion / the Keel|`BladefallActTwo.level(32)` (bladefall-fractured-inversion.js)|10200|E; two floors, each broken in places (roof 500), the Gulf, the Weave; the flip at the anchor|the Keel (pattern boss: strike from the side it shows; flee the sweeps)|built 7.212.0; owner playtest pending|
|33|**Act Three** · The Fractured Tyrant / the Tearer|`BladefallActTwo.level(33)` (bladefall-fractured-tyrant.js)|10000|E; tears over voids (one steady, three blinking), both mouths on a raised slate face for the throw over the teeth|the Tearer (pattern boss: ride its tear through it — floor, perch, off a lift)|built 7.213.0; owner playtest pending|
|34|**Act Three** · The Fractured King / the Weighed Crown|`BladefallActTwo.level(34)` (bladefall-fractured-king.js)|10400|E; the Echo from the first step — an echo-only mark, the Return (360 ledge, plate below), two marks at once over a tear and teeth|the Weighed Crown (pattern boss: weigh both marks, trade places, strike)|built 7.214.0; owner playtest pending|
|35|**Act Three** · The Fractured Line / the Black Line|`BladefallActTwo.level(35)` (bladefall-fractured-line.js)|13900|E by cart; the cut fork, the falling bridge, three trick gaps (clean 360s)|the Black Line (gauntlet: rail lit by a travelling light — pace the cart)|built 7.215.0; owner playtest pending|
|36|**Act Three** · Fractured Cliffs / the Last Head|`BladefallActTwo.level(36)` (bladefall-fractured-cliffs.js)|9800|E; the hook from the windlass, rings over the sea under walking lightning, breakers over the cliff top|the Last Head (pattern boss: hook the ring over it, strike the lock from above)|built 7.216.0; owner playtest pending|
|37|**Act Three** · Fractured Shores / the Sunguard's echo|`BladefallActTwo.level(37)` (bladefall-fractured-shores.js)|10000|E; the gut and hull by rings, the flats at a drowning tide (refuge to refuge)|the Sunguard's echo (pattern boss: its back, on the toll)|built 7.217.0; owner playtest pending|
|38|**Act Three** · The Fractured Colony / the Ringer's echo|`BladefallActTwo.level(38)` (bladefall-fractured-colony.js)|10000|E; the Watch (lamps, tents), the Dry Spring (rings, conduit lamp, the tap)|the Ringer's echo (pattern boss: over his head by the rings, behind him before he turns)|built 7.218.0; owner playtest pending|
|39|**Act Three** · The Fractured Path / the Sun Gate|`BladefallActTwo.level(39)` (bladefall-fractured-path.js)|10400|E and up to 660; burning pools of sun, shade; the stair; rings over the overlook|the Sun Gate (a windlass that turns only lit, struck from the ring above)|built 7.219.0; owner playtest pending|
|40|**Act Three** · Fractured Palace / the King in the Dark|`BladefallActTwo.level(40)` (bladefall-fractured-palace.js)|10200|E; send the light through your mouths (court, hall)|the King in the Dark (pattern boss: struck only in your light); then the end of Act Three (`meta.actThreeDone`)|built 7.220.0; owner playtest pending|

**Road:** 0→1→2, back to 1, wind shaft→3→4→5, west back to 0, west breach→6 (walked west)→mine→7,
back east, Causeway high shaft→8→9→10→fall into 11→12 (west; the Tyrant withdraws, his seam is the
road)→13 (east; Right Hand at 5850, King at 17200)→15 by cart eastbound→surfaces at 5's far east.
**Act 1 ending:** after the Frostfell bell, claim keel/mast/sail (stages 3/4/5) → board at the Keep's
far east → mirrored westbound Deep Line → Throne (18300,0) → the hole's lid (17600–17980) is gone
once the ship is whole → beach at y=-900 → boat → "END OF ACT ONE / ACT TWO / The Thunder Cliffs"
→ its Continue sails (`BladefallActTwo.setSail`, connector `king-thunder-cliffs`) onto the deck of stage 16.
**Act Two** (plan + the owner's decisions: `docs/plans/act-two.md`; charters `docs/charters/16-thunder-cliffs/`,
`docs/charters/17-landing-shores/`, `docs/charters/18-colony/`, `docs/charters/19-palace-path/`, `docs/charters/20-sunspire/`): the
helm's cast-off at 16 crosses (`cliffs-landing`) onto 17's strand; 17's Colony Gate is walked both ways
into 18 (`shores-colony`); 18's road east is walked both ways into 19 (`colony-path`; walking it closes
the choice); 19's open Sun Gate is walked both ways into 20 (`path-sunspire`); 20 ends Act Two (the hydra, the
ride, `meta.actTwoDone`, a card; Continue returns to the title until Act Three exists). The Act Two core is
`bladefall-act-two.js` + `bladefall-act-two-art.js` (stage 16 itself, the Chainhook in every Act Two
region, the white flower, the region registry); each later region is its own pair of files that
registers with it (`bladefall-landing-shores.js` + `-art.js`). index.html and the renderer carry
one-line hooks only (both are over their size budgets — never inline Act Two there).

## Engine orientation (grep anchors in public/index.html)
- **Level blocks:** `^const [A-Z_]*_LEVEL=`, `^const CUSTOM_LEVELS` (keys 0–13, 15), `resolveCustomLevel`
  (stage 15 direction from `G._pendingZoneEndpoint`, kept in `G.deepLineReturn`).
- **Helpers:** `Pl` (h14) · `Gr` · `GrAt` (ground at a height) · `Slope` · `Sp`/`FJ`/`WSp` · `Wl`
  (cling) · `Slate`/`SlateWall` (only surfaces that hold a player mouth) · `Br` (brittle) · `Plate`
  (`circuitOpen(id)` = every plate with that id pressed) · `LPortal`/`FixedPortal`/`Anchor` · `Seam`
  (dash-entered zipline; `gate`, `setDown`, `once`, `period`) · `Roof` (ceilingOnly) · `Spent`
  (crumbles once, 0.45 s fuse — its `collapseDelay` is ignored) · `RailSwitch`/`RailCollapse`.
- **Loading:** `loadStage` → `resolveCustomLevel` → `buildCustomLevel` (objects, `L.build()`, cart
  setup, circuits, enemies, boss or boss-skip, the `apply*` passes) → `activateZonePersistence`
  (muster roster if recalled, recall routes, ship parts, court connections, hydrate, rest site,
  entrance checkpoint). There is no engine `reloadStage`; `__BF.reloadStage` is `loadStage`.
- **Frame order in `update(dt)`:** region keepers → input buffers → hitstop gate (early return) →
  obstacles → dash / cart block / run → `placePortal` → flip → jump → x move + wall sweep → player
  `portalTransit` (skipped while riding a seam or a cart) → gravity → floor/ceiling → spikes,
  checkpoints, out-of-bounds → camera → `updatePhysicalWorldSeams` → enemies → projectiles →
  **`updateSeams` near the very end** so a ride's position survives collision.
- **Out of bounds:** `p.y < updraftsVoidFloor(p)` (default -50, per-stage clauses written stage-first
  because tests eval that function bare) or `p.y > CEIL_Y+400 = 2000` → rewind to checkpoint.
  Nothing may be authored above 2000.
- **Datum:** only `levelFloorY(x)` and `cameraMinimumY(p)` may read `.datum` (a test enforces it).
  Only Emberdeep declares one (ED=640). Anything installed at runtime uses the level's datum.
- **Authored bosses must early-return before `bossArena`'s purge** (1,270-unit sweep) and before
  `applyFinaleActRemaster`. Record your own clear when a seam is gated on a boss.
- **Up interactions compete:** `outskirtsInteractionCandidate()` picks ONE nearest target by a
  distance score, and a scenery prop is only ever a target if `outskirtsAuthoredInteractable()`
  lists it. Two Up targets on one spot make one unreachable (the sail sat on the Keep Key), and an
  unlisted prop can never be used (the throne boat). Check both when placing anything Up-driven.
- **Zone entity ids are index-keyed** for enemies without an authored id
  (`enemies:type:x:y:index`, `buildZonePersistenceManifest`). Never remove an enemy from
  `G.enemies` before the manifest is built — every later body's stored identity shifts.
- **Physical seams:** `physicalSeamSpec()` (hand-written per stage) + `updatePhysicalWorldSeams`;
  gates checked by `bladefall-zones.js eligibility()` against `zoneTraversalState()` (capabilities,
  `meta.world.cleared ∪ G.sessionClearedZones`, `openedConnectors`, vault keys).
- **Renderer:** `SUPPORTED_STAGES` (0–13, 15) decides whether the pixel renderer draws a stage at
  all; `INTERIOR_STAGES` {9,10,11,12}. New object type → a `case` in the renderer's `switch(o.type)`
  or a `byType` bridge in `respecLegacyDrawers` (index.html); `legacyDraw` fails silently. Engine
  state reaches the renderer only through `respecLegacyDrawers` predicates. Tests regex the
  one-line `SUPPORTED_STAGES = new Set([...])`.

## Kit and numbers (TUNING in bladefall-movement-progression.js; gravity 1400 is a literal)
- Run 200 · jump 480 · second jump 450 · jump cut 220 · dash .22 s at 3× · wall jump 350/500 ·
  coyote .1 · y is up, **vy is positive downward**. 60 Hz fixed step.
- Capability ladder is prefix-closed (owning step N means owning 1..N): jump, weapon, dash,
  portal-single, portal-pair, wall-jump, counter, double-jump, attunement, companion-command,
  downward-strike, gravity-flip. Level Select grants every ability whose stage is **below** the
  entered stage. The Echo is stage 13 only and is not a capability.
- Weapons: after the Causeway, B swaps bow ⇄ Oathblade (`swapWeapon`, `p.stowedWeapon`); both infinite.
- Portals: exit speed = `ejectSpeed` or clamp(incoming,150,1400) along the exit normal; `_tpCd` .7.
  Seams: mouth 46, ride 1150, exit 640; a portal taken inside a seam's ballistic window ×2.4 (cap
  1200, side-mouth lift 1100). **Any player transit leaves no air jumps.**
- Double-jump apex ≈148 (continuous formula 154.6). The Knowledge note's "standing rise 210" does
  not reproduce from jump+double-jump alone (≈148); it probably included a dash. Measure in the
  engine before designing a tower against it.
- Cart (stage 15 only): see `G.cartMode`, `G.cartDirection`, `G.cartLean`, `RailSwitch`,
  `markRailTrestles`. Dash, slam, portals, echo and fields are off in the cart. `cartLean` is
  measured along the ride (+1 = the key pointing where the cart goes, either direction). A brass
  switch decides as the cart passes its post: lean > 0.18 → high line with a fixed launch floor.

## Level Select and saves (known sharp edges)
- `beginRun(..., {startStage:i, levelSelect:i!==0})` — stage 01 is NOT Level Select mode.
- Level Select seeds `sessionCapabilities`, fresh `sessionQuests` and a session zone state, and
  (7.167.0) `seedLevelSelectPriorWorld` treats every earlier stage as won: session clears for
  zones below the start plus the Keep key, Frostfell bell (not under the harness) and the three
  bossSkip latches. `worldProgressEligible=false`, so `recordWorldClear` never runs; the Tyrant
  and King kills also add session clears. Continue keeps them (`savedRunSession`).
- `meta.run` is one slot: a Level Select checkpoint overwrites the campaign Continue.
  Level Select also still writes `meta.recovery`, some `meta.zoneState` latches, `bestStage/reach`.
- `musterRecalled()` grants a Level Select amnesty for stage ≥ 8 and the ship stages 3/4/5.
- The vault logs say `openedConnectors` "is written by the crossing" — **nothing writes
  `king-deep-line` or `deep-line-keep` into it**; that bypass only passes in unit tests.
- `winGame()` (credits, NG+ unlock, `meta.secretCleared`) is reachable only through `nextStage()`,
  which only a completion portal or the co-op gate calls — and no campaign stage has a portal now.

## Harness
- `node --test` runs the tests in `tests/` (~6 min). **The 7.170-7.187 passes grew the failing set
  from 22 to 61** (measured 2026-09-23 on an exact 7.187 tree: 884 / 823 / 61 — bag/reward/Gift/
  checkpoint rewrites the old tests still describe). Its names are in the vault log for 2026-09-23;
  diff every run against that set by test name. `coop-runtime` is load-sensitive: two of its tests
  can fail in a full run and pass alone — rerun the file before believing it.
- `tests/coop-runtime.test.mjs` drives two isolated Chrome contexts with an in-page PeerJS stand-in
  relayed by the test (no internet). Its relay slows under full-suite load, so teleport both knights
  with `placeBoth` (it re-places until both machines agree) — never one alone, or the tether acts
  on stale positions.
- Stage tests slice `index.html` between two markers and eval in a `vm`; a new constant or
  constructor used by a later level can break an earlier level's slice. VM arrays need `[...]`
  before `deepStrictEqual`. Each test file has its own helpers — read its harness first.
  Several VM tests stub `V4_LAST_STAGE:9`; the real value is 15.
  Other tests read one function's source by name (`fn('slamImpact')`, `fn('updatePhysicalWorldSeams')`)
  and match exact text (`recordDeath(meta.recovery,zoneId,fallback)`): keep new behaviour inside the
  function a test reads, and put a new helper where every slice that calls it can see it (7.169's
  first co-op pass broke 19 tests this way, all fixed).
- TAS (`?tas`): `resetGame()` boots stage 0 with only `jump`; set `G.sessionCapabilities` BEFORE
  `__BF.reloadStage(n)`, then step one frame. `scripts/level-probe.mjs` does this, runs its own
  headless Chrome, and does macro BFS with `forbid` predicates (its `--validate` room-3 case is stale).
  `scripts/necessity-audit.mjs` answers "can this section be skipped" for stages 11–13.
- **Browser pane:** hidden pane → rAF stops, canvas composites black. Use `__BF.drawFrame()`, blit
  the canvas into an `<img>`, wait ~1 s, then screenshot. Freeze a live loop with `window.update=()=>{}`.
- **Cache stamps are manual.** Bumping `VERSION` (index.html) and `CACHE_NAME` (sw.js) does not
  bust a module: bump that module's own `?v=` in its `<script>` tag (only 8 carry one). When a
  correct edit "does nothing", unregister the service worker and delete caches.
- `./build-deploy.sh` rebuilds the mirror (a new public file must also join its `ASSETS=` list);
  `npm run release:check` is stamp-aware and exits 1 only on astra-respec.js / fable-respec.js
  (standalone pages, by design). Anything else it prints is real, including the 1.6 MB `index.html`
  budget — 7.169 moved the co-op journey code out to stay under it.

## Open items (not scheduled unless the owner asks)
- Owner playtests pending for 9–13 and 15 (see the table).
- The Abyss King's leftward approach (needs an 86-entity eastward shift of the Throne).
- Crownguard has no AI role / ecology profile. Hollow Marksman is excluded from roster hygiene.
- Citadel: 35 object-level skippables unexplained (all six sections are "the road").
- Colossus act-checkpoint restore never exercised in a live death.
- Deep Line: six acts are the procedural-era design; no charter.
- Act Two stages 19-20 (the Path, Sunspire) per `docs/plans/act-two.md`. They must read
  `meta.actTwoPath` (`oren`: 'helped' | 'struck' | 'left'; `colony:'turned'` = the sick march with
  you; `mended`). MENDED only runs in Act Two stages today (the core's update hook is ≥16).
  Adding each stage: campaign row + blueprint (count check), progression zone + connector (count),
  world node + route (count), zones seam, recovery site, a region file registered with
  `BladefallActTwo.register(i, …)` and its art with `BladefallActTwoArt.register(i, …)`,
  `CUSTOM_LEVELS`, the renderer's SUPPORTED_STAGES, V4_LAST_STAGE, LEVEL_MUSIC, `journeyActive`,
  sw.js + build-deploy ASSETS, and the count tests (campaign, charters, world, zones, progression,
  recovery, baseline stageCount). The how-to is at the end of `docs/plans/act-two.md`.
- The master vision's endings still assume the Gilded Vault; the direct/truth endings are unreachable.

## Latest pass
- 7.210.0 / cache v293: **Stage 30, the Fractured Emberdeep.** The Pour Schedule walked backwards (each slab 1.0 s
  further along than the one west of it: the slab ahead melts first — hop two). The Slag Stair: ledges 210 apart over
  a wet forge wall; a slag lands as a 58 step under each (the dash that lifts you carries ~185 across, so each ledge
  sits ~200 across). The Command Post grants Companion Command with no Oren. C-side **the Purge**: one 3.0 s clock —
  decorative `Sp` vents drawn as a sweep east at 450 (a run is **211**, measured, not 280), the echo's own check sends
  you back like a fall; heat-slab refuges cooled 0.6 s before their sweep. Engine: heat slabs, slag and spouts run only
  for `stage>=9 && v4Region` — the registration raises `V4_LAST_STAGE`. Renderer: `trap`/`spikes` ask the region's art.
  Tests: fifteen `V4_LAST_STAGE` regex pins (some capped at 29) are now minimums. Charter `30-*`. Full suite
  1029 / 962 / 67 — exactly the 7.207 failing set.
- 7.209.0 / cache v292: **Stage 29, the Fractured Sorcerer.** The Glassworks: an emitter drips onto a slate; your
  single mouth + the anchor (`anchorRange` 1300) send the bolt to a condenser (`actCondenser`, the echo's own: a bolt
  with `portalHops>0`) and the bridge over a floorless 900 void is solid 1.0 s per bolt (every 1.8 s) — jump and
  double-jump the thaw. The Gallery: the emitter fires along a slate band (560–660) on a wall wet above it; chimney
  up, intake in the band, outlet under the condenser; the portcullis lifts. C-side: **the Mirror** — its orbs are
  `puzzleOnly` and it scores them itself (`accepts`): I portaled, II countered, III countered and portaled (a
  countered lob flies flat back into the front mouth). **Fixed in 27–29: bars under a wall as wide as the wall** —
  at 26 under 44 a jump and a dash rose through the Frostfell Toll's stone (measured, x 1033 past bars at 900).
  Renderer: `runeEmitter` asks the region's art first. Charter `29-*`. Full suite 1023 / 955 / 68: the 7.207 set plus
  one `coop-runtime` test that passes alone (timing under load).
- 7.208.0 / cache v291: **Stage 28, the Fractured Frostfell.** The Toll: tollmen with their backs to the bars — only a
  countered thrust opens them (the engine's Counter stuns but never opens a front shield, so the guard is the echo's:
  `thrust()` calls `tryPlayerCounter` and zeroes `counterStunT`). The Thaw Streets: thin ice (`ffThin`: gone after 0.5 s
  of standing, back after 2.6) over meltwater, 100 gaps. The frost memory grants the double jump (measured: 147 alone,
  191/564 with a dash). The Frozen Stair: rises of 160–170 over the void, thawing landings, `Sp` spikes timed from the
  dry rest two back. C-side: **the Rimeguard** — drill / feint (held second thrust) / thaw (held third; a low sweep or
  low shards, uncounterable, jumped). Thrusts never closer than 0.8 s (the Counter's cooldown is 0.7). Charter `28-*`.
  Full suite 1017 / 948 / 69: the 7.207 set plus two `coop-runtime` tests that pass alone (timing under load).
- 7.207.0 / cache v290: **Stage 27, the Fractured Warden.** The Blind Gallery is dark (your light and the turnkeys'
  lanterns): three bays under a roof at 76 (a jump peaks at 36; a turnkey is 38), each shut by bars its turnkey holds
  the keys to — dash through the lunge, strike the back (the engine's `wardenRole` AI is not stage-gated). The Hush
  Engine: thin air (two lowg circles) over the void, three unbraked bars off the hops' arcs. The Turning Cell: a
  mouth set on the cage rides it (`carryMouths`, re-implemented: the engine tracks supports only on stage 6); fall
  from the perch into the floor mouth while the cage is high, rise to the lip at 800. C-side: **the Sentence** —
  rush phase (dash through, strike the back; only `'melee'` counts: the dash's fire echo once landed from behind),
  then the sentence (all-round shield; its rush over a floor mouth throws it out of the other; strike it down).
  Found: a lethal hit reloads the stage (not `p.dead`); the fall-speed cap (~1100) caps a mouth's rise at ~470.
  Renderer: `rotor`/`lowg` ask the region's art first. Charter `27-*`. Full suite 1010 / 943 / 67 — exactly the
  7.206 failing set.
- 7.206.0 / cache v289: **Stage 26, the Fractured Keep.** Your own twin mouths: the Refectory (fall into a floor mouth, rise
  out of the balcony over a wet screen), the Weight Hall (the keystone through the pair onto its dock), the Grip
  (`F.grant('wall-jump')`, a new core helper), the wet Archive chimney. C-side: **the Belfry** — the bell-stone thrown
  through your mouths (floor slate under its hoist; the wall's slate band facing the cradle) into a cradle swinging on
  the engine's oscillator; a ~0.4 s window twice a swing. Found: a crate's `y` is its foot; a clinging knight's
  `wallObj` is the first wall found (the band is listed first). Charter `26-*`. Full suite 1003 / 936 / 67 — exactly
  the 7.204 failing set.
- 7.205.0 / cache v288: **Stage 25, the Fractured Causeway.** Masses (hang, rattle, fall, a block to jump, hoisted back;
  or cut by an arrow in a release), the Drop Yard plate, four lifts over the void, the Longbow on the Standard. C-side:
  **the Iron Echo** — armoured; stamps, then charges head-down (jump it) until a buffer stop or wreckage stops it; while
  dazed, shoot the release of the mass over it; the last count charges to where you stood and digs in; three crushes.
  **Engine change (shared): `spawnEnemy` scales an echo's bodies by its SOURCE stage and rolls no elite there** (every
  echo sets `G.actTwo.echoSource`; before, stage 21+ bodies had ×3.1–3.5 HP on top of the Muster). Charter `25-*`.
  The echo check sits at the END of the elite condition: `outskirts-stage` and `black-woods-stage` pin that line's
  text (the first cut, with the check in the middle, failed them). Full suite at 7.205 after that fix: the 7.201
  failing set plus, in some runs, one timing-flaky co-op test.
- 7.204.0 / cache v287: **Stage 24, the Fractured Marksman.** The region's own watch (the engine's watch-sniper AI
  and arrow cover are stage-4-only): archers that see you past no mantlet, draw (a dotted sightline), lock (solid) and
  loose, leading by the arrow's whole flight — break your pace after the lock. The Watching Road's slick tower (mouth
  onto the anchor), the Mantlet Works (the gate opens only to its own watch's arrow sent back), the Windcut (fall into
  the mouth, launch from the anchor tower's far face). C-side: **the Tallyman**, a pattern boss that counts — I one
  arrow, II three, III the Reckoning (aimed at your feet: stand with your mouth between you and it); the Reckoning home
  knocks it down for 2.6 s; cut a tally with the blade; three. Engine rule found: a mouth pairs with an anchor only
  while the PLAYER is inside the anchor's range. Charter `docs/charters/24-*`. Full suite 990 / 923 / 67 — exactly the
  7.201 failing set. Not committed or deployed.
- 7.202.0–7.203.0 / cache v286: **Act Three's shared core and two more echoes.** `bladefall-fractured.js` (the echo
  registry Level Select and the seams read, kit, Muster, checkpoints, the walked seam to the next built echo, the end
  card, the measured jump, the night art). **Stage 22, the Fractured Woods**: a rolling thorn wave, a crumbling loop to a
  counterweight that frees the Oathblade below (taken under the outrider's nose), the canopy over the void, and the
  C-side, the **Mirror Thicket** (branches hold only while the wind blows against their resin edge; the wind turns every
  2.6 s; a 0.45 s flutter/gust/stir is the cue — shorter than a 60-rise jump's 0.50 s airtime), then a root stair of
  hops. **Stage 23, the Fractured Updrafts**: the thermals breathe (engine pulsing updraft for the inhale; the region's
  own downforce for the exhale, skipped while dashing), three Rootbreach dash gaps each asking for a different dash (the
  canyon's teeth punish the early dash's high arc), the Bellows, a crystal-only drop, and the C-side, the **Lung** (four
  columns left–right–left–right). Renderer: one hook so a region can draw its own updrafts. Echo music = the original's
  theme walked backwards (`scripts/fractured-music.py`). Registration is scripted: `scripts/register-echo.py` then
  `node scripts/repin-stage-counts.mjs`. Build order is the owner's Level Select order (next: the Marksman, then the
  Causeway). Charters `docs/charters/22-*`, `23-*`. Full suite at 7.203: **983 / 916 / 67 — exactly the 7.201 failing
  set.** The co-op runtime tests are timing-flaky under a full run (at 7.202 one extra co-op test failed; a different
  one each run; `what the friend does…` also failed on the pre-7.202 tree). Not committed or deployed.
- 7.201.0 / cache v284: **ACT THREE begins.** (1) **Rift shards** (`bladefall-rift-shards.js`): twenty, one per region of
  Acts One and Two, behind dialogue (the Colony woman, the Sunspire servant, the Shores' violet silk), quests
  (Oren's Causeway, Daro, Ilyra, Sera), hidden spots (vault/secret-cache places) and optional routes (Sealed
  Recollection routes; a new ledge under the Hydra Overlook). First find explains itself on a card; the rest toast
  'n of 20'; the ledger (title ✦ button, and after END OF ACT TWO) lists every region with a hint; all twenty enter
  Act Three. Page hooks: update, conversation (converse/chose), questDone, title button, renderer draw. (2) **The
  Fractured Outskirts** (stage 21, `bladefall-fractured-outskirts.js` + art): a B-side of the first road — jump only,
  no blade, the Muster forced, darker — and a C-side, the Mile Sentinel: locked in its cell early, released by the
  gate's chain, unhittable; three bells, each reached only from what one of its moves leaves (Hammerfall's haft, the
  Rush stunned against a stone → its shoulders, the haft again under the Chain Sweep). (3) **Level Select**: Base +
  one Fractured tab (the NG+1/NG+2 tabs are gone) listing all twenty echoes. Docs: `docs/plans/act-three.md`,
  `docs/charters/21-fractured-outskirts/DESIGN-PLAN.md`. Full suite 969 / 902 / 67: the 61 baseline names plus six that fail on the other agent's 7.193–7.200 edits, already in the tree before this pass (checked against my pre-pass snapshot): muster-recall ×2 (the Muster's standards removed), outskirts-stage ×3 (its Up-interaction and quietV4 lines rewritten), ruined-keep-v4 ×1 (interactEchoMachine). Two of mine — hooks that assumed `window` inside functions tests lift into sandboxes — were fixed and pass. `release:check`: only the four known failures. Not committed or deployed.
- 7.193.0 / cache v275: Owner polish pass. Shared menus/cards/toasts use crisp respec panels and readable monospace; title fits its panel. Decorative muster standards no longer spawn or render (player R flags preserved). Portal-pair instruction text removed. Inversion canonical Path retains 3 Blood; lastBreath curved exit costs 2. Citadel column 9280 now has a 180-wide T cap; final caps 9520/9280/9040 have purple slime costing 5 Blood on contact.
- Tyrant ordinary/contact/projectile wounds cost 2 Blood. Throughout the three-band fight, a fixed-position area attack warns 1.15 seconds then costs 3; repeats every 5.5 seconds. No victory heal; existing no-phase-heal rule preserved. Echo phase four is **proposal only**: docs/plans/2026-09-24-echo-fourth-phase-proposal.md (False Pursuit, manual leave/swap decoy, unlike portal echo marks).
- Optional Oren “The Long Repair” available by Up interaction in stages 9–12: collect existing washhouse wrap, White Court high cache, and Cinder Ledger workshop reward, then choose any turn-in attitude. Grants oren-dash + Ember Step automatically. Colossus no longer grants damaging dash; fire wake requires the optional unlock. Perfect-entry previews include it from 10.
- First Abyss King defeat grants Pure Nail automatically (white sword, down+attack enemy pogo, up+dash vertical dash/white effects). Sword and stowed sword updated; bow preserved. Down alone retains slam. Preview includes from 14; gift persists through normal journey saves. Pogo gives brief contact protection so the successful rebound is not overwritten by a same-frame enemy collision.
- Verified 59 focused tests plus live fixtures: 3/2 Path damage, slime 5, Tyrant 2/3 and no victory heal, no muster flags, Oren normal Up interaction/turn-in, one-time Pure Nail, upward dash and stable enemy pogo rebound. Reviewed title menu and all three T caps. No uninterrupted campaign/fight playthrough claimed. Mirror rebuilt; no commit/deploy. Preserve concurrent Act Two/Sunspire/audio work.
- 7.192.0 / cache v274: **ACT TWO, REGION FIVE — stage 20, Sunspire Palace, and the end of the act.**
  Light is a portal noun: the King's shafts burn, and a shaft on slate can be caught in a mouth and let
  out of its twin (region code: `trace` in bladefall-sunspire.js — no beam had passed a portal before).
  Three locks teach it (floor to floor into the Sun Court's seal; floor to wall across the Hall of Hours
  onto the dial that reads a quarter to four; from a Chainhook ring onto the Aqueduct Crown's sluice —
  the colony's water goes home and the flume is the road). **The King in Daylight** (a `dayking` row;
  a `portalGate` boss spawned by the region) is exposed only while touched on the side away from you —
  a sick hand (the turned colony) or routed sunlight (alone). Six blooms over dawn/morning/noon; blink
  rings, the glove, the flare; the sun-climb interlude; the forsaken sick fight for him; he does not run.
  **The hydra** rises on the sea terrace to boss music, does not strike, warns of the Echo; ↑ CLIMB ON;
  the ride; END OF ACT TWO. `tests/sunspire-stage.test.mjs` traces every lock over every mouth position.
  Full suite 927 / 860 / 67: the 61 baseline names; the stage 16/17 tests' V4 regexes (fixed after: the five Act Two stage files pass 43/43); one load-sensitive co-op test (passes alone); and three that fail on another agent's concurrent index.html/renderer edits made during this pass (the Muster's recall standards removed — muster-recall ×2; a new void-slime rung in the Void Tyrant's climb — void-tyrant-stage), not this pass's and left alone. `release:check`: only the four known failures. Not committed or deployed.
- 7.191.0 / cache v273: **ACT TWO, REGION FOUR — stage 19, the Path to the Palace**, and the owner's
  three follow-ups. The Colony's road is a walked seam up to it. The smoke line, the mirror stair (the
  Sunspire's mirrors throw burning pools; pilgrims' shelters and the colony's smoke hide you), the
  hydra overlook (1300 of drop, three rings; the hydra circles in the sea below), the Sun Gate (alone:
  go over the one Sunguard, strike his back, slam the windlass three times; with the turned colony: the
  sick hold canvas over you and hold the Sunguard, Oren breaks both chains). **The forsaken path's sick
  fight for the King** (`e.zealot`: no bell drives or stops them) — three come up the road behind you at
  the smoke line, three more at the gate. **MENDED follows the knight to Act One** (`BladefallActTwo.everywhere`,
  called by the page in every stage; `peekPath()`; the renderer draws the stitches everywhere). **Level
  Select asks which road the knight took** for 18 and 19 (`pickPath`, `PATHS`, seeding the run's own
  path). Verified by scripted runs on both paths (see the charter; one lesson: the harness moves with the
  arrows — `KeyD`/`KeyA`/`KeyS` are dash, hook, counter). `tests/palace-path-stage.test.mjs` pins it.
  Full suite 916 / 853 / 63: the 61 baseline names plus two co-op tests that fail only under full-suite load (both pass alone). `release:check`: only the four known failures. Not committed or deployed.
- 7.190.0 / cache v272: **ACT TWO, REGION THREE — stage 18, the Colony.** The Landing Shores' gate is
  walked both ways into it (so the kneeling man can still be reached). The Sunguard's gilt glasses
  throw pools of sun across the tents — tents and pit-fire smoke hide you, a half-second flare can be
  escaped into cover, being seen is a bell and a fight; the sick screen a knight who came in by the
  hand. Sable (the Causeway's stretcher-keeper) at a dry well; the King's conduit took the spring and
  the yard gate hangs on the well's counterweight: ring the alms-bell to draw the conduit's Sunguard
  down, hook up the piers, slam the King's tap. Sable's water cures (grey measures → gold; MENDED: a
  measure mends after 6 s unhurt) and Oren's bandage comes off. The shackled yard: alone, hook up the
  bell tower and silence its ringer; with Oren, he breaks every shackle and the colony turns ("Village
  Vigil"). Leaving without him seals the forsaken path ('left'). The act-wide cast moved into the Act
  Two core (`kit.foes`, figures in the art core). Verified by continuous bot runs on both paths and a
  predictive sneak (8/8). `tests/colony-stage.test.mjs` pins the geometry. Full suite 907 / 844 / 63: the 61 baseline names, plus the zones stream-cell count (fixed after the run: 280) and a co-op test that fails only under full-suite load (passes alone). Not committed or deployed.
- 7.189.0 / cache v271: **ACT TWO, REGION TWO — stage 17, the Landing Shores.** The helm's cast-off
  crosses onto the strand. The Chainhook taught across a 980 gut and up a stranded hull; the tide
  (region-only: low water is a road to a walled wreck, high water floats wreckage into footing to
  the King's gilt jetty; caught, you are swept to dry ground for one measure); three fights driven
  by the Sunguard's bell (the Belled hesitate until a bell drives them; the last fight ends when the
  bell is silenced from behind); the choice at the Colony Gate — a bearded, bandaged man (Oren,
  unnamed) warns you, then TAKE HIS HAND (the white flower: a measure greys every 30 s, floor 3,
  flowers on the cloak; he follows), walk past, or strike twice (forsaken at once). Aerth score:
  Shore of Broken Ships, Safe Harbor, Last Spark of Darrow, Breaking of the Keeps. The Act Two core
  became a registry; the camera and void floor are per-region hooks. Verified by one continuous bot
  run from landfall to the frontier card plus every branch (stepped browser, not a human
  playthrough). `tests/landing-shores-stage.test.mjs` pins the geometry. Suite 900 / 839 / 61, the
  same 61 names as the 7.187 baseline. Not committed or deployed.
- 7.188.0 / cache v270: **ACT TWO BEGINS — stage 16, Thunder Cliffs.** The Act One card's Continue
  sails onto the deck. A timed voyage (push-off, swells + lightning on iron, breakers only the yard
  clears via rigging pulled taut by the sail, a derelict fouled to the bow crossed by its tow lines or
  a slate pair and cut loose by slamming its windlass, a chain gate sweeping LOW/HIGH), docking, then
  the Chained Hydra: three heads chained to staples high in the cliff; bait a head to the end of its
  chain, dash into the taut chain, ride it up, slam the lock (cracks only under strain, for a knight
  who came up it); two cracks free a head. It is released, not killed; its wake breaks the pier and
  shoves the ship off. Oren's hook in the storm lock is the **Chainhook** (ability 13, key A): three
  hooks across pilings to the ship; the helm casts off to a frontier card. Aerth score (Red Wake /
  Chains of the Deep / Unburdening), loudness-matched. Verified with scripted input in a stepped
  browser (every lesson, every lock, release, hook, cast-off, reload, Act One crossing) — not a human
  playthrough. `tests/thunder-cliffs-stage.test.mjs` pins the geometry. Not committed or deployed.
- 7.187.0 / cache v269: Deep Line/Act 1 departure refinement. Both rides retain their mirrored routes, switches, jumps and sniper timings. Interior mine ribs/lamps, matching iron track/slope materials, failing-span cracks and pixel fork signals replace mixed presentation. Collapse anticipation now measures along cart direction (westbound previously triggered from the wrong side). Automatic Gifts/readable interactions now cover the remaining campaign stages through 15; legacy random gear is stripped.
- Ship parts have distinct lashed timber/canvas silhouettes, while the assembled boat has a tapered planked hull and pixel sail. Part positions and progression gates retained; final pickup no longer explicitly instructs returning to the throne. Shaft masonry links the opening to the shore. Fixed beach void boundary: all authored beach footing is safe, not just the narrow shaft; outside the beach still rewinds.
- Validation: 32 focused Deep Line/Throne/Journey tests pass. Browser checked both directional starts/lean/high-line launches and collapse warning, all six sections rendered in both directions, correct destination gate requests, full 900-unit descent, far shore footing, and complete-ship ending launch. Visual review of outbound arrival, return fork and assembled ship. No full uninterrupted ride claimed. Local mirror rebuilt; owner pacing/playtest pending.
- 7.186.0 / cache v268: Drowned Throne refinement. Existing routes, echo puzzles, Right Hand/King mechanics, ship and rail exit preserved. Stage 13 now uses an interior backdrop: recessed halls, throne, salt-stained masonry and shoreline band. Distinct slate surfaces, pixel echo marks, destination warnings. King's crown correctly shows four fractures including the first; Right Hand clasps/eyes now read his own knees and stun state. Removed routine vulnerability/fracture hit labels.
- Automatic Gifts/progression and readable dialogue now cover stage 13. Optional manual Oren repair conversation after the Right Hand grants one Forge Seal with any of three attitudes; inspectable shoreline cache at (18370,-900) grants one Vitality Fragment. Both enter perfect Level Select from stage 14, never on stage 13 entry. Complete ship launches directly without leaving a conversation over its ending UI.
- Verified 38 focused Throne/Citadel/Journey tests; browser fixtures checked repair choices/rude-choice reward, manual cache award and arena/shoreline rendering. No full traversal or complete boss playthrough claimed; owner playtest remains pending. Existing King/Oren departure relies on its old scripted chase and captions; that cinematic was not redesigned in this pass.
- 7.185.1 / cache v267: Void Tyrant/Citadel refinement. Traversal timings, approved wall/climb/seam layouts, Oren's powered line, portal fling and three-band boss mechanics preserved. Stone shelves, cracked spent ledges, smooth slick iron and cyan slate have distinct materials. Recessed refuge/chapel/arena architecture; Tyrant mantle/armour, quieter phase rails and live wall sockets. A suspended seal shows the actual upper-band projectile origin and brightens before firing. Removed the false between-band “BLOOD RESTORED” receipt; no phase heal added.
- Automatic progression/readable three-attitude dialogue now covers stage 12. Two optional inspectable caches: refuge loft (two jumps, Vitality Fragment), chapel interior (Forge Seal). New reward IDs enter perfect Level Select from stage 13, never at stage 12 entry. No milestone or boss-withdrawal payout; no new inventory/shops. Existing Gifts carry through. Lore and the Right Hand story relic now use the readable conversation panel. Cache repeat text correctly reports empty and saved claims remain one-time.
- Evidence: 36 focused Citadel/progression/hazard/checkpoint tests pass. Browser rendered seven route points and boss phase states; loft reached using live jump inputs, cache duplicate prevention and chapel reward checked; Oren negative choice persisted; story relic opened in conversation mode. Phase changes held health at 4, withdrawal opened the exit with zero pickups. Screenshots reviewed at refuge, long climb and arena. No full traversal/fight playthrough claimed. Local mirror rebuilt; no commit or deployment. Inversion corrections still await owner playtest.
- 7.184.0 / cache v266: owner playtest corrections to Inversion. Deep terrain now blocks sideways movement; removed three cramped overhead blocks and raised the remaining lintel for return jumps. Moving roof is stationary. Removed the near-overlapping crate-room balcony; an optional cache ledge now sits outside the room's east lip. A solid slick seal joins lane A's eastern roof edge to the world ceiling, preventing entry directly into the upper serpentine lanes. All serpentine spikes/lashes/wall thorns cost three Blood measures; Ward can block the wound, i-frames still apply, no nonlethal relocation.
- No progress-triggered Inversion upgrades: existing reward IDs retained for save compatibility but moved to inspectable caches (Forge Seal on the opening's overhead return route; Vitality Fragment on the optional crate-room side ledge). Last Inventory retains its explicit dialogue reward. Owner preference for all future rewards: deliberate exploration, dialogue or optional quests; never silent coordinate/milestone payouts. Existing claimed rewards cannot be farmed again.
- Global sword trail stays in front in both directions; removed routine hit labels (crit, surge, vow, oath, fault bell, execute/flank), preserving damage numbers and Ward. Current fresh Inversion load has zero authored flags; owner screenshot flags were not reproduced. Player R flags remain supported; cache/version refreshed.
- Verification: 34 Inversion/hazard/progression tests plus 12 checkpoint/blood/dialogue checks pass. Browser exercised blocked ground sides, return jump to higher terrace, upper-entry seal, three-bar spike damage in place and physical cache interaction. Reviewed opening/sword and crate-room screenshots. No full traversal claim; owner playtest remains the pacing check. Local mirror rebuilt; no commit/deployment.
- 7.181.0 / cache v262: opening–Ember Colossus now uses automatic fragment/seal progression, fixed sword/bow, automatic Gifts, private perfect-entry Level Select profiles, and readable in-world three-attitude conversations/workshops. Later region content deferred. Implementation and scoped verification: `docs/plans/early-campaign-journey.md` (102 focused tests; stage 0–10 runtime audit; six workshops × three attitudes; save/Continue/Gale Stitch/Ward checks). Local mirror only, not deployed.
- 7.178.0 / cache v258: compact muted boss HP bars appear for nearby active damage fights (Brute, Marksman, Warden, Sorcerer). Mechanic-based Colossus, Tyrant, King and Right Hand encounters retain physical progress cues. Bars read current boss HP directly, including checkpoint restoration; hide on defeat/pause/menu. 25 focused HUD/checkpoint/Colossus tests pass; browser verified Warden layout and encounter filtering. Local mirror rebuilt, no deployment.
_See `01-CURRENT-STATE.md` "Latest change" for the most recent work and its verification._

## 7.195.0 — Echo encounters (includes 7.194 cleanup)
- Removed automatic stage-13 refill, last-breath floating spikes and throne-terrace overlay. Wall 14240 clings on both faces. Collected story relics no longer remain invisible Up/Read targets (shared Inversion fix too). Cut the two King chase captions.
- F clears completed pairs anywhere and cancels an active portal-clone trial; boss fractures remain. King hijacking preserved. Opening volleys now 2.5s; marked 2-Blood AoE every 6s, first after 4s, 1.15s warning.
- King rail-head boarding starts at x18280 after victory; 1.7s board/ride/fade precedes streaming. Keep arrival rolls from a new mine mouth at17580, brakes at17470, hops off at17400. Existing Deep Line ride unchanged. Stage reload clears animation state.
- Missing muster sprite dispatches filled: Outrider (Hollow Marksman blob), Frostpike/Singer/Hulk, Keelman and Canopywing. Existing enemy logic retained.
- Implemented Echo encounters: after Citadel's third paradox band, Q bait/grab/lift exposes first sword hit; second bait causes a turn-and-strike while Q Echo counters; third needs player and portal-clone sword hits within .32s. Tyrant retreats over western steps to x40, leaving void traces; trail continues to the Right Hand. Manual Q and combat portal clone are distinct (G.echoBody/G.combatEcho).
- Right Hand now requires paired sword, paired bow (.7s timing window), then paired sword plus nearby Q Echo. Clones originate from actual personal portal transit and copy movement/attacks. F clears them with the pair. Actor state uses e.echoDuel; existing flag graph now also captures manual/combat Echoes and support references.
- King's fourth fracture starts a two-hit recall finale: anchor in the lit shelter, bait marked conduit strike, recall before impact; switch shelter for second. Ordinary dodging cannot break a conduit. No heal. New phases are campaign-only; Boss Rush keeps previous behavior.
- Echo gates latch after crossing and consume only the Echo on their own plate. Post-Hand crossing now fixed portal to lever/released lift, recall aboard moving anchor, ride to connected upper walkway; lever resets if anchor expires. Shield guard commits its facing; optional press cache at10800,y520 grants secret:echo-press Forge Seal once, included in perfect entries from14. All changes scoped to existing late Act 1; newer Claude regions untouched.
- Removed title respec buttons/handlers. Details and evidence: docs/plans/2026-09-24-throne-echo-proposals.md.
- Validation (7.195): 59 focused tests pass. Native fixtures verified three bands → phase4, Q input, first bait beats, synchronized sword and bow, three-body rematch finish, King recall resolution, serialized flag restoration, fixed portal/lift recall/carry/walkway exit, deliberate salvage reward and title. Reviewed lift/grab and King finale visuals. No uninterrupted campaign playthrough claimed. Local mirror rebuilt; no commit/deploy.
