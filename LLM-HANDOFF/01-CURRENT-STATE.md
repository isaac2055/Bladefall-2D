# Current state — 2026-09-22

Rewritten in place; the per-region table and engine orientation live in
[`NEXT-MODEL-BRIEF.md`](./NEXT-MODEL-BRIEF.md). History before 7.134 is in
`HISTORY-BRIEF-7.103-TO-7.133.md`; 7.134–7.166 in the owner's Claude Brain session logs.

## Production status
Act 1 is built end to end: fifteen reachable regions (stage 14, the Gilded Vault, was cut on
2026-09-20 and its slot is inert), the v4 pixel renderer and v4 rules (`V4_LAST_STAGE=15`) on the
whole critical path, and an Act 1 ending (ship parts → westbound Deep Line → Throne beach → boat
→ "ACT TWO / The Thunder Cliffs" card). Act 2 has no content yet.

Owner-accepted: the opening through the Warden, Frostfell, the White Court (beaten, then made
harder), the Inversion rebuild. Built and awaiting the owner's next playtest: Emberdeep, the
Foundry and Colossus (7.164 fixes), the Inversion's Last Breath, the Paradox Citadel (7.166
restore), the Drowned Throne (7.157 fixes) and the Deep Line (7.150/7.157 fixes). Automated
success is never owner acceptance.

## Source identity and verification
- `public/index.html` **7.169.0**; `public/sw.js` **bladefall-v246**. Deploy mirror matches `public/`.
- `main` = `16b3408` (tag `act-1-draft`), pushed to GitHub; `chore/track-authoritative-tree` is at
  the same commit. 7.169.0 is live on bladefall.netlify.app (deploy 6ab2ae5f, from `netlify-deploy/`; the site id is f8c7b854…, not the one in `.netlify/state.json`).
- Full suite **847 tests / 825 pass / 22 fail** (7.169.0); the 22 are the long-standing baseline set,
  identical by test name (list in the brief's Harness section).
- `release:check` reports only astra-respec.js / fable-respec.js (standalone pages, by design).

## Latest change — 7.169.1 / cache v247 (2026-09-22)
Owner, with two screenshots: a platform stood at the bottom of the Needlewind's last stretch
and trivialized it; only the jetpack refill below the Needle platform was wanted.
- The fourth safe pocket `Pl(11660,150,105,{aerieNest:1,safePocket:'rainward'})` and its
  `Check(11660,85)` are gone. Back to the authored three (entrance, heart, exit), which is what
  `scripts/validate-updrafts.mjs` always expected. The heart → Needle platform run is now one
  flight of ~3,125 units, relieved only by the quarter-tank crystal at the last dip (13020), and
  a miss past the heart costs the whole second half.
- Tests updated: three pockets, no platform between heart and exit, 8 `Check(` in the level, and
  the rewind test now returns to the heart. `tests/updrafts-stage` + `updrafts-runtime` 22/22.
  The owner said the flight is already proven, so no route re-validation was run.

## Latest change — 7.169.0 / cache v246 (2026-09-22; committed to `main`; deployed to bladefall.netlify.app at the owner's request)
Owner request: "Please add co-op back into the game. This way, I can show my friend the game
without him going crazy by showing him the way + helping him (so actions should be shared, only
way it is really co-op.)"
- **Co-op is on the title screen again** (`showCoop=true`): Co-op → Host → share the 4-letter code
  → the friend joins. The host then picks **Start from the Beginning**, **Continue My Journey**
  (a copy of the host's kit, zone state, clears and resume point) or **Choose a Region** (Level
  Select rules). A co-op journey is a session like Level Select: `saveRunAtStage` is skipped and
  checkpoints/deaths go to `G.coopRecovery`, so neither save or Continue is written.
- **One world.** Snapshots sync obstacles/enemies by list index, so both machines build every
  region from the host's seed and the host's session (`coopSessionPacket` / `applyCoopSession`).
  Verified identical object and enemy counts on all 15 regions.
- **Travel together.** Whichever knight reaches a seam, the host runs the crossing
  (`coopHostSeamIntent` → `runPhysicalCrossing`) and the friend lands beside the host
  (`coopBroadcastStage` / `coopEnterStage`, reasons start/seam/wipe/resume). The tether only acts
  within one region and only on a fresh partner body (`ghost.synced`); a wipe restarts both at
  the host's checkpoint. Fast travel and rest are closed while together. Quitting brings the
  friend back to the lobby, still connected. The boat ends Act 1 on both saves.
- **Shared actions.** The friend's world-changing Up interactions (ship parts, the boat, keys,
  wall-jump and other grants, recall, dampers, collectors and the rest in
  `coopHostRunsInteraction`) run on the host AS the friend (`coopAsGhost`), then zone state
  syncs back. Ground pounds (`slamIntent` → `slamWorldEffects`), weight on plates, the Echo and
  crumbling footing act on the host's world. Abilities earned by either knight are shared.
- **The partner is drawn as a knight** in the v4 renderer (`drawPartner`, crimson cloak, weapon,
  swing, dash/slam/wall/downed poses, cart, Echo) with a tag; the HUD shows the partner's Blood.
- Reloading the friend's tab rejoins the host's journey where the host is (`resumeState.coop`).
  A `resume` for the region the friend is already playing only refreshes the session. The
  friend's connection hello can be answered after the host presses Start, and a reload there
  pulled both knights back to the entrance.
- The new journey code lives in `public/bladefall-coop-journey.js` (plain functions over the
  page's globals). Moving it out keeps `index.html` inside its 1.6 MB release budget: the
  page is 1,593,482 bytes, and it would be about 1,605,000 with the code inline. The network
  layer (NET, netOnMessage, netTick, downs/revives) stays in `index.html`. Every co-op branch
  added inside game code is gated on `G.coopSession` first, so solo play and the stage tests'
  `vm` slices never reach a co-op name. The ground-pound world half stays inside `slamImpact`
  (the host replays a partner's strike with `remote`), and the crossing stays inside
  `updatePhysicalWorldSeams(partnerSpec)`, because tests read those functions' source.
- Verified: `tests/coop-runtime.test.mjs` (10 tests, two real browser contexts with a relayed
  PeerJS stand-in, no internet) — join from a fresh save, guest- and host-led crossings, the friend
  claiming the sail / a grant / a ground pound on the host's world, Continue leaving the host's
  save and recovery untouched, tab-reload rejoin, 15-region parity, wipe and quit, the Act 1 boat
  for both, partner drawing, a stale resume after Start. Screens of both machines were looked at (partner, tag, swing, downed);
  a Battle duel still starts with both at opposite ends. Full suite 847 / 825 / 22, failing set
  identical to the baseline by name. **Not yet played on two real devices over the real PeerJS
  broker.**
- Known limits: gravity flip is per player; bats the friend summons may not show on the friend's
  own screen; pickups remain personal copies.

## Previous change — 7.168.0 / cache v245 (2026-09-22)
- **Two weapons, one key.** After the Causeway bow, **B** (`swap`, rebindable) switches bow ⇄
  Oathblade; the other is `p.stowedWeapon` (saved in `snapOf`, migrated from the old
  `causewayBlade`). Both are `bound`, so neither spends ammo or durability. The post-Brute
  "keep the bow / return to the blade" choice is gone. Owning Dash ⇒ the bow was taken (the Brute
  wakes only to arrows), so `ensureTwoWeaponArsenal` makes the pair whole on every load; Level
  Select now starts every stage with the Oathblade (it gave 5+ the legacy Rusty Sword).
- **Void Tyrant:** no Blood refill between Citadel bands or on Right Hand knees.
- **Abyss King:** no Blood refill between phases or on crown fractures; the final phase brings
  void bats (2 at once, then 1 every 7 s, max 3), which hover in the air; they leave with him.
- Verified in a real browser: B toggles both ways, bow fires with ammo fixed at max, old save
  migrates, no heals at phase changes, bats airborne. Suite 837 / 815 / 22 (baseline set).
  The White Court browser tests that expect the Rusty Sword were already in the failing baseline.

## Before that — 7.167.0 / cache v244 (2026-09-21)
Owner request: Level Select → Deep Line → Keep → three ship parts → back to the Abyss King was
blocked; westbound, Right still sped the cart up; the high/low line switch was unreliable.
- **Level Select assumes everything before the selected stage is won** (`seedLevelSelectPriorWorld`,
  called from `beginRun`): session clears for every earlier zone, plus the latches a gate or a
  boss-skip reads — `keep-key-recovered`, `frost-muster` (not under the test harness, matching the
  amnesty), `foundry-colossus`, `citadel-tyrant`, `throne-king`. A stage's own boss is untouched.
  `savedRunSession` now carries `sessionClearedZones` and `deepLineReturn`, so Continue keeps both.
- **The King stays gone.** `kingRetreats` writes `throne-king` (the level's `bossSkipCircuit`,
  which nothing wrote, so he respawned on every reload, including the Act 1 return). A skipped
  King leaves his hall floor (`throneHallFloor`) and does not leave the Right Hand as `G.boss`.
- **Cart lean is measured along the ride**: westbound, Left is speed and Right is brake.
- **One switch rule**: hold the way you ride as the cart passes a brass switch → high line.
  Decided on passing the post (a hop over it still counts), by lean alone (the second switch's
  hidden banked-boost gate is gone), with a fixed launch floor so the high plank is always reached.
  Switch arrows, cart tilt and the 360 spin mirror with direction.
  The switch launch holds its speed until touchdown (`p.railSwitchFlight`), so letting go or
  braking once it has spoken still lands on the plank; the second switch's floor is 580.
- Found on the route and fixed: the sail sat on the Keep Key's belfry (Up always read the belfry)
  — moved 16810 → 16970, clear of both reaches; the throne boat was never an Up target, so Act 1
  could not end by input.
- From an adversarial review (8 agents, findings verified in the engine): a hall whose King ran
  has no Right Hand and no Oren (`retireThroneHall`, run AFTER hydration because enemy zone ids
  are index-keyed and the Hand is index 0); his death can no longer raise the generic portal on
  stage 13; a bossClear gate also accepts the boss's own skip latch (`bossLatchClears`), so a
  Continue can't strand a King-less hall behind a sealed rail head; a pre-7.167 campaign save
  whose world records the King beaten skips him too; a Level Select session skips the boss of any
  stage it counts as won (the Brute, the Marksman on NG+ tabs, the Right Hand); `sw.js` precaches
  every stamped script under the page's own stamp (offline boot was broken), and
  `scripts/release-check.mjs` now understands stamps — it reports only astra/fable (standalone
  pages, by design) and flags any service-worker stamp that differs from the page.
Verification: TAS probes of the switch rule and landing margins in both directions (second switch
lands ≥109 past the plank lip); a real-browser run of the owner's whole route with real seams and
key presses (teleports only between seams) through the Act 2 card; `tests/act-one-return.test.mjs`
(9, including that route and a campaign King-retreat reload); full suite 837 / 815 / 22, failing set
identical to the baseline by name; release-check mirror parity clean. The owner still has to play it.

## Outstanding limitations
- `winGame()`, credits, NG+ unlock and `meta.secretCleared` are unreachable on the current route
  (they hang off `nextStage()`, and no campaign stage opens a completion portal).
- Level Select is not isolated from the campaign save: `meta.run` is one slot, and some latches,
  `meta.recovery` and `bestStage/reach` are written from Level Select.
- Five secondary Echo-equipment hooks are declared but unread (`KNOWN_BUGS.md`).
- Co-op (7.169) is verified in two browser contexts only, not on two devices over the real broker.
  NG+ still follows a human-accepted solo Base journey and has not been adapted to stages 9–15.

## Working-copy caveats
Edit `public/`, never `netlify-deploy/`. At a release boundary bump `VERSION`, `CACHE_NAME` and
the `?v=` stamp of every edited module, rebuild with `./build-deploy.sh`, and check mirror parity.
Preserve save (`bladefall_v2`) and leaderboard (`bladefall_leaderboards_v1`) keys. Validate critical
traversal with real inputs, and say where setup used debug helpers.
