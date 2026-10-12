## 7.317.0: Smooth touch controls, a four-phase Echo, "Vesper" (2026-10-12)

- **Vesper's first form** is labelled "VESPER" (was "THE CLOAKED MAN").
- **Your Echo's final room** ("Stay With Me", cl41-stay) has four phases and fourteen wounds; one death restarts it. Phases come from `echoDuel.phases`: per-phase need/tell/recover/wave/ghost, plus `double` (a run turns and comes straight back) and `leapEvery`. Between phases the Echo breaks away and is untouchable for 70 frames. The phase name is announced and shown with pips.
  - New route: 2,361 frames (was 551), recorded by the fight bot.
  - The Room Bank's F80 is updated to match (difficulty 5).
- **Survive touch, the new "Smooth" default** (everyone is migrated once, `dashPreferenceVersion` 2):
  - Tap anywhere to jump; a quick tap on the stick side jumps too.
  - Swipe to dash in 32 directions: touch only, sent to the core as `raw.aim`. Keyboard, pad and tapes are unchanged.
  - No grab button: the stick on a diagonal (20–80°) into an adjacent wall holds grab, so you cling and climb; once clinging, anything but pushing away keeps you on.
  - A jump button stays on screen (can be hidden, moved and resized).
  - The blade, parry, portal and carry ("interact", grab) buttons appear only in rooms whose intended route presses them; carry only where a lantern or cargo exists.
  - The earlier layouts stay selectable in Touch controls.

**Checks** (Chrome, iPhone profile):
- the default is Smooth; a tap on either side jumps (24 px);
- a 30° swipe dashes at (0.83, −0.56);
- pushing the stick up-right climbs a wall in o1-road;
- a plain room shows only the jump button; w2-clearing shows jump and blade;
- the editor lists jump, carry, blade, parry and portal.
- All 132 bank routes pass (core change), plus finale-check and the co-op feature checks.

Version 7.317.0, cache `bladefall-v485-smooth-touch`.

## 7.316.0: A heart in every optional route, purple hearts open the Fractured worlds, no death-warp stakes (2026-10-12)

Isaac's notes and decisions:
- **Hearts:** every optional route (each world's quest and secret, the rooms you are lifted into) holds one heart. That makes 81 hearts across worlds 1–40: 2 per world, 3 in world 21, socket gate rooms excluded. The earlier "rarities" idea is dropped.
- **Earned properly:**
  - every room of the route must be left by its own way out, having passed its two waypoints (35% and 65% of its intended route, within 28 px), since the last death;
  - a room proven once stays proven (`save.proper`);
  - touching the heart without that says "The heart stays · finish every room of this route by its own way";
  - coming in the back way is still sealed.
- **Purple hearts:**
  - In base worlds 1–20, the secret's heart (the route the white light lifts you into) is purple. Its lift light and heart are drawn purple.
  - Fractured world n+20 opens only once you hold that purple heart and have beaten world n; the two can happen at separate times (`fracturedOpen`).
  - The rift portal and the leaderboard unlock follow the same rule.
  - The old keepsake unlock is gone. Quest hearts are the keepsakes, so the Fractured errands' seals still need them.
  - The map card shows the purple heart and what it opens, and nodes mark it (♥/♡ in purple).
- **Death resets:** stakes no longer persist where that lets you death-warp.
  - Imported Room Bank rooms reset all their stakes on death, as they were designed.
  - Native rooms keep a stake lit unless the fire is 8+ open tiles nearer the exit than the stake (cl9-s9-wheel, cl21-fo21-gate).
- **Skip line:** "Skip costs 1 · n left" now sits top left under the room name, clear of the bottom hint. It is hidden in junctions and passages.
- **Leaderboard roster:** survival heart counts updated (2 or 3 per world); check-hearts.mjs updated to match.

**Checks** (Chrome):
- World 21 is closed on a fresh save, and still closed with the purple heart while world 1 is unbeaten.
- Being set straight onto world 1's purple heart earns nothing; playing its room in full earns it.
- A bank room's lit stake is unlit after a death.
- The skip line sits top left in the Echo room; the purple beam renders.
- The map reads 0/81 (some) and 81/81 (100% view).
- finale-check, the co-op feature checks and check-hearts pass.

Version 7.316.0, cache `bladefall-v484-purple-hearts`.

## 7.315.0: Hearts on the Survive map (2026-10-11)

There is one heart per world: a secret, saved in `bladefall.climb.v1` `secrets`.
- **World card:** selecting a world shows "♥ found/total" in the card and the chip bar, plus how many are still hidden.
- **Toolbar:** shows the grand total across worlds 1–40.
- **Nodes:** each node shows ♥n/n up close. A world that is cleared with every heart found glows rose (new legend entry).
- **100% view:** counts every heart as found.

Checks: in Chrome, with a save of two cleared worlds the total is 0/40; in the 100% view it is 40/40 and every node glows rose. No errors.

Version 7.315.0, cache `bladefall-v483-map-hearts`.

## 7.314.0: Review mode toggle, test mode, a reversible 100% view, no route takeover (2026-10-11)

- **Review mode.** It already existed as "Feedback mode", hidden in Controls (Survive) and Settings → Playtesting (Explore). It is now named "Review mode · rate each room/level when you finish it", and it is off by default.
  - It is in Survive's Assist & options, reachable from the world map's Settings and from pause.
  - A new "Show the run timer" toggle hides the run clock (BladefallPlaytest `settings.clock`). Times are still recorded.
  - Explore's Settings → Playtesting has both toggles.
- **Survive Assist & options:**
  - "Show the full map" appears only from the Survive menu (Settings on the world map with no world running), never mid-world.
  - Music no longer says "(Crystalline Trials)".
  - Infinite climbing stamina is removed as an option.
- **Test mode.** Every five presses of Screen shake turn it on or off (`save.assist.testMode`). It gives:
  - infinite skips (bosses and large rooms too; shown as ∞);
  - infinite climbing stamina;
  - the ability to take over a watched route.
- **Watched routes.** Outside test mode, input no longer takes over the intended-route replay in Survive. When a watch ends without leaving the room, you restart from the fire. This closes the free-skip exploit.
- **100% view.** Every five presses of "Show the full map" turn it on or off (`bladefall.climb.unlock-all.v1`).
  - On: every world is playable, 41 and 42 included, and the map shows the game complete (every region visited and cleared, every road open), drawn over a copy of the atlas.
  - Off: it reverts to your real progress. The view no longer writes permanent unlocks; unlocks granted by 7.312 cannot be undone.
  - Hearts are not drawn on the map.

**Checks** (Chrome):
- the menu card has the full map, review and timer toggles, no stamina option, and music labelled "Music";
- the 100% view goes on and off (world 30 playable, then locked);
- test mode gives stamina and ∞ skips;
- the in-game card has no full map;
- takeover works only in test mode; the end of a watch returns you to the fire;
- the Explore timer setting works;
- the 100% map renders.
- finale-check and the co-op feature checks pass.

Version 7.314.0, cache `bladefall-v482-review-test-mode`.

## 7.312.0: Finale rooms in the Room Bank, and a hidden unlock-all (2026-10-11)

- **Room Bank.** The five finale rooms are in the review group ("Superrooms for review"): B77 The Throne Road, B78 Vesper, F78–F80 your Echo's three rooms.
  - Saved records are in `scripts/room-bank/{base,fractured}/` (batch 20, `acceptance:'review'`, `needsReview`). They are added to `retained`/`order`.
  - B77/B78 are base movement exceptions, because Vesper's route uses dash-jumps.
  - The bank copies of the two boss rooms get a right-wall gate that opens when the boss is beaten. Their routes walk out.
  - The bank's Vesper is always the merged fight: only Survive's World 42 reads the finale save.
- **Hidden unlock-all.** Pressing Settings → Assist & options → "Show the finished map" five times unlocks every Survive world (21–40 via BladefallPlaytest) and opens 41/42 (`bladefall.climb.unlock-all.v1`). A line in the card confirms it.
- **Fixes:**
  - Vesper's form announcement crashed the bank page; climb-only calls are now guarded.
  - browser-check.mjs groups `needsReview` rooms the way the view does.

**Checks:**
- All 132 bank routes pass.
- The bank browser check passes for the five rooms (scrolling routes, reviews, CSV, clock).
- In Chrome, the five presses unlocked world 30 and opened 41/42; startWorld(42) succeeded.
- finale-check passes.

Version 7.312.0, cache `bladefall-v480-bank-finale-unlock`.

## 7.311.0: Skip and go-to-partner on touch, and an iPhone pass (2026-10-11)

Isaac: on mobile in Survive you can't teleport to your friend or skip. Make sure it works on iPhone.

**Survive touch controls (bladefall-pcore-touch.js):** two new buttons sit in the top row beside pause and retry.
- **Skip** (as N): it is dim when the section cannot be skipped and shows the skips left under it. A tap calls `skipSection`, so it obeys the same rules and messages.
- **P2**, shown only while co-op is linked: hold it, as T, and a ring fills over 36 frames, then you arrive beside your partner. Releasing early cancels.
- Both can be moved and resized in the touch-layout editor (ids `skip`, `friend`).
- The co-op hint reads "hold P2 to go" on touch.

**iPhone:**
- Every touch control is now inset by the safe-area insets (notch, rounded corners, home bar). They come through CSS variables `--sat/--sar/--sab/--sal`.
- The canvas uses `100dvh`, so Safari's toolbars no longer crop the bottom.
- Menu buttons use `touch-action: manipulation`, so a double tap cannot zoom.
- `text-size-adjust` is set, so landscape fonts are not inflated.
- The first touch or key unlocks Web Audio with a silent buffer. iOS only starts sound inside a gesture.
- Fullscreen, orientation lock and vibration were already guarded; iPhone has none of them, and they fail silently.

**Run clock:** it sat over the top-right buttons on phones.
- In Survive it now sits under the touch button row (`--pcTopRow`, set by the touch drawer).
- In Explore, on touch screens, it sits left of the pause button.

**Checks:** headless Chrome with an iPhone profile (844×390, touch, iOS Safari user agent):
- Skip moved World 1 from the Verge Road to the next section (3 skips → 2).
- With local co-op, holding P2 for 70 frames carried the guest to the host's room.
- No page errors.
- The desktop co-op T/N/replay feature checks and finale-check pass, and the Explore flag button check still passes.
- Not tested on a real iPhone or in WebKit: this Mac has no simulator or Safari automation.

Version 7.311.0, cache `bladefall-v479-touch-skip-partner`.

## 7.310.0: The finished map, the Fractured band to 19, and a touch flag in Explore (2026-10-11)

Isaac's notes on the 7.309 map, plus one Explore request.

**Map:**
- **Band to 19.** The Fractured Palace band now runs 34 → 40 → 39 → 19, the exact mirror of Sunspire's 14 → 20 → 19.
- **Emerald faces, always.** The space between regions is now cut gem: two gradients per emerald, fine facet edges, a glow at each emerald's heart and small glints where the outer cuts meet.
- **Show the finished map.** A new toggle in Settings → Assist & options, also reachable from a new Settings button on the world map. It draws ChatGPT's "100% complete" look:
  - the whole gem at full brilliance, with a blue band where the emeralds meet and star glints;
  - one outline round both emeralds that runs gold → teal → violet;
  - both crowns shown, labelled "100% COMPLETE · VESPER DEFEATED" and "ECHO MERGED".
  It is only a view: nothing unlocks, and Play on 41/42 stays locked until all forty worlds are done. Stored in `bladefall.climb.map-preview.v1`.
- Without the toggle, the real finish keeps 7.309's two wraps. Once both crowns are actually beaten, 42's label also reads "100% COMPLETE".

**Explore:** a ⚑ touch button (`#bFlag`) sits upper right, under the pause button and the run clock. It plants your checkpoint flag, the same as R (and retries where R retries, shown as ↺). It shows the 1/0 charge, dims when spent, and is hidden in boss rush and hardcore. It can be moved and resized in the touch-layout editor. The whole `#controls` layer is hidden on a mouse, so desktop never shows it.

**Checks:**
- Headless Chrome:
  - the default map, the finished map, and the toggle round trip (Settings → checkbox → back to the map);
  - on a phone viewport, the flag button is visible at the top right, and a tap plants the flag (charge 1 → 0, button dims);
  - on desktop it is hidden.
  - No page errors.
- finale-check, the co-op feature checks and the map-flow states pass.

Version 7.310.0, cache `bladefall-v478-finished-map-flag`.

## 7.309.0: Survive's finale, Worlds 41 and 42, and the crowned map (2026-10-11)

Isaac asked to finish the game: face your Echo at the bottom of the Fractured emerald (Explore's level 41, in Survive's form), then Vesper at the top of the Emerald Ascent. Merged with your Echo, Vesper is beatable; otherwise only someone who can go a very long time without being hit will finish him. The map changes to match.

**Map (bladefall-climb-map.js):**
- The Fractured half is mirrored left to right (display only; the atlas and every physical road keep their coordinates). The Fractured Palace band now hugs the left edge, mirroring Sunspire's band on the right. 39 stands top left, opposite 38.
- Every region is a crystal, after Isaac's "41 · Your Echo" sketch:
  - Fractured regions are shattered: the rim breaks into slivers and loose chips fly off.
  - Base regions are the same crystal whole: a cut double rim with two glints.
- 20 and 40 carry boss highlights (gold and violet).
- 41 and 42 appear only once all forty worlds are complete. They are crown gems with chevron wings, hanging from 35 and 15, with their names beside them. Vesper's label lists both fights (unmerged / merged); the one that applies is lit.
- Beating your Echo wraps the Fractured emerald in a violet double outline. Beating Vesper wraps the Ascent in gold.

**Worlds (bladefall-climb-finale.js):** registered off the atlas, with geography anchors 41 [0,4500] and 42 [0,−1700]. They start from the map's Play button. Saved state: `bladefall.climb.finale.v1` {echo, choice, vesper}. A `?finale` link forces them open for testing.
- **41 · Your Echo:**
  1. Where You Left Yourself: it runs at you once and lands once, then runs ahead.
  2. The Part You Left: three wounds.
  3. Stay With Me: three wounds. Each run comes twice; an afterimage follows.
  When it yields, the Kill/Merge/Forget card appears (Explore's text). The choice is saved, and beating it again lets you choose again.
- **42 · Vesper, True King:**
  1. The Throne Road: walls of bats, each with one gap at the floor, low-ledge or high-ledge height.
  2. The arena, with four forms:
     - the Cloaked Man: a phantom slash from his ghost, then chains along the floor;
     - Unbound: a bat wall, then a dive;
     - the Bones: teeth across the floor, or a lunge;
     - All of Him: a hand slams the third you stand in, then rests there, open.
  Cuts per form: merged 3, killed 10, unmerged 15, forgot 18. A death resets the whole fight. The ending card's line depends on your choice.

**Engine (opt-in, bladefall-pcore-dev-finale.js + -view.js):** `echoDuel`, `vesper` and `curtain` room fields. Every attack is drawn before it lands, openings are drawn bright, and Vesper's ward is drawn pale. Climb view changes:
- gating for worlds above 40;
- no rift portal in 41/42;
- `g.solvedBefore`, so an Echo that has already run ahead stays gone;
- Explore's finale music, with one theme per Vesper form.

**Checks:**
- `node scripts/climb/finale-check.mjs`:
  - all five finale routes finish with zero deaths (recorded by a scripted player);
  - walking past your Echo is stopped and blind cutting never wounds it;
  - the merged route cannot beat Vesper at 15, 10 or 18 cuts a form.
- The scripted player also beat unmerged Vesper (15 a form): 16,316 frames, about 4.5 minutes without a hit. Merged takes 2,795 frames (about 47 s).
- In Chrome, World 41 → choice → Merge → World 42 → "Vesper is still", played through the real Climb view with zero deaths. The map was checked before and after both wraps.
- 127 bank routes pass.
- All 327 joins pass in Chrome, with no script errors.
- The co-op/T/N/replay feature checks pass.
- walkback.mjs still flags 7 shade/bolt deaths in native Fractured rooms (25, 35, 36, 37, 39). The result is identical with the finale device removed, so it is not from this release.

Version 7.309.0, cache `bladefall-v477-finale-crowns`. Human play of the finale is still to come.

## 7.308.2: Floor entrances into imported rooms are two-way again (2026-10-10)

Imported rooms keep their reviewed drop-through rules (g.dropThru off). That made the one-way ledge capping a floor entrance shaft a one-way door. In bladefall-climb-view.js, `onDoorwayLedge` now allows Down + Jump when you stand only on seam ledges that were cut out of the wall (closed char rock). Every other ledge in the room keeps its rule. Retracting entry bridges (closed char '.') stay walkways.

**Checks:**
- Chrome drop test: all 12 imported floor doorways drop you back into the previous section alive. (B51 needs you partly in its smoke; that is the room's own watch rule.)
- 127 bank routes pass.
- The full 40-world audit passes, with all joins in Chrome.
- Walk-back has no doorway deaths, and the co-op/T/N/replay feature checks pass.

Version 7.308.2, cache `bladefall-v476-doorway-ledges`.

## 7.308.1: Entrances only seal where the room needs them; doorway thorns cleared (2026-10-10)

Isaac reported doors closing behind him (World 1, 3→4, 8→9 and 13→14) and a glitch entering 8→9. Two causes:
- **Too many seals.** The 7.307 import sealed every bank room, and every room after a new connection, at its fire: 333 rooms.
- **A deadly doorway.** B22's entrance tunnel cut through its spiked west wall. Walking in was safe; walking back killed.

New `scripts/climb/relax-seals.mjs` (run by import-bank.mjs, or alone on the saved registry) handles both:
- **Seals:** a room keeps its seal only if one of these holds:
  - its own route exits differently with the entrance open (same frame and same exit state required, so every join proof stays exact);
  - the original 7.265 build sealed it;
  - it has a retracting entry ledge.
  Result: 31 rooms keep their seal and 302 rooms now stay open.
- **Doorway thorns:** thorns inside a side doorway's opening that face into the room are now part of that doorway. They are open while it is open and restored if it seals (46 rooms).

**Checks:**
- Full structural audit of all 40 worlds: 327 joins (feedback-7.308.1-audit.json).
- All 40 worlds' joins pass in Chrome.
- Walking back along the floor from every open side doorway: no doorway deaths.
- World 1's 3→4, 8→9 and 13→14 played in the page: no seal, walk-back works, 0 deaths.

Version 7.308.1, cache `bladefall-v475-open-doorways`.

## 7.308.0: Superroom feedback answered; King, Tyrant and tide finales reinvented (2026-10-10)

Every B72–F77 note is answered and integrated. F64 and F69 are banked, and F77 is banked at 3/5.
- **Reinvented by Claude:** B74 King (court), F75 Fractured King (aims at your echo), B73 Tyrant (hunt and home), F74 Fractured Tyrant (fault shadows) and B76 tide.
- **Revised earlier by Codex in this batch:** B72, B75 and F76 (Hydra), F71 and F73.

Guide: docs/room-bank/FEEDBACK-7.308.md. New opt-in runtime: King `court`, Tyrant `hunt`/`home`/`perches`, tide `holdLow`/`holdHigh`.

**Checks:**
- All 127 bank routes pass. The ten changed finales pass in Chrome, and the Hydra jaw contract passes.
- Worlds 10/13/14/16/17/28/31/33/34/36 were re-imported, with 88 Chrome joins and the structural audit passing (feedback-7.308-audit.json).
- The other 30 worlds are hash-identical (feedback-7.308-baseline.json).

Version 7.308.0, cache `bladefall-v474-feedback-7308`; stale `?v=` tags on the changed device scripts were bumped. Human ratings are pending. Authoring tools for these rooms are in the ignored scripts/climb/.cache/feedback-7.308/claude-wip/. Earlier entries are historical.

## 7.303.0: Bank complete; 40-world allocation analyzed (2026-10-09)

All final approvals are handled. B60 is cut/archived. User’s “B32” lantern description identifies F32; its receiving phase platform extends 32px to the second beam and is banked. B32 stays unchanged. F59 has an ordinary reusable runway and a 24px higher overhead beam with a shorter west tip. A genuine wavedash route and preparatory jump/relanding pass; original reverse-hyper also still works. F59 is banked. Total **97 approved (54 Base /43 Fractured)**, nothing pending. Menu defaults to Banked.

**Analysis only:** all 87 non-superrooms are assigned exactly once across 40 actual Survive worlds (Base 1–20, Fractured 21–40). Every world gets2–3; third rooms go to 8/11/12/14/15/17/19. B56→21 and B57→26 use the user-approved early-Fractured alternatives, without changing saved bank.side. Existing 10 superrooms remain unassigned; no new superrooms, campaign imports/cuts, checkpoint changes or finale shortfall calculation. Last slot in each world is reserved for a later superroom decision.

Primary plan: docs/room-bank/WORLD-PLACEMENT-7.303.md; authoritative allocation: docs/room-bank/world-placement-7.303.json. Source inventory: docs/room-bank/WORLD-INVENTORY-7.303.md and world-inventory-7.303.json, covering 490 authored main rooms and 72 replacement-review candidates (14 limited-challenge,58 repetition candidates). Do not treat that shortlist as72 approved cuts. Preserve tutorials, quest/secret links, bosses, breathers and narrative exits. Retire early filler separately from locating additions later, after required teaching.

Native curriculum correction: World 21 B56/F40;23 B46/F23;24 F59/F60 after native wallbounce lessons;26 B57/F34. F61’s obsolete B60 preparation is replaced in the plan by F33/F28. F41 remains an explicit user-approved Base 14 reverse-super teaching exception. Every proposed bank/native prerequisite and action kit is checked. Numeric difficulty distribution still needs human tests; old campaign /10 ratings are not the current /5 scale.

Checks:97 canonical completions,412 positive variations,262 shortcut probes; focused F32/F59 browser routes/UI/camera pass. placement-check.mjs preserves 95 room definitions/tapes,89 prior approval records and 435 runtime/campaign sources; verifies all 87 IDs,40 quotas, actual candidate IDs and prerequisite order. Result: docs/room-bank/placement-7.303-audit.json. Version7.303.0/cachev468-room-bank-placement; catalog batch16. All further imports/finale work await a new user instruction. Earlier entries are historical.

## 7.302.0: Final review after all-room feedback (2026-10-09)

39 new approvals are banked at the requested Base/Fractured difficulty bands, bringing the bank to **89 (51 Base / 38 Fractured)**. Eight side transfers preserve stable IDs. F62 is archived/removed. Active pool **98 (55 / 43)**; exactly nine revisions remain: **B24/B58/B59/B60/F24/F25/F32/F45/F59**. Room Bank now opens to **Final review**, with **Banked** beside it; approved superrooms retain their labels. No new rooms or campaign imports.

B58/B59 rebuild around independently spent patches, fixed thorns and varied patrols; dust-bunny routes are hidden globally. B60’s airborne reply restores the same wall needed for its catch. B24/F24/F25 are rebuilt around more consequential cargo, portal and return timing. F32 has five lanterns; F45 has a wider final pressure dock and sequential swap/jump; F59 gains8px lower-spike clearance. Guide/review links: docs/room-bank/FINAL-REVIEW-7.302.md. Full handoff: LLM-HANDOFF/ROOM-BANK-FINAL-REVIEW-7.302.md.

All98 saved routes pass with zero deaths, plus417 positive variations and268 targeted shortcut probes. Nine-room browser checks cover routes, menus/counts, historical links, review/revision/CSV, play timer/pause and scrolling. All89 approved definitions/tapes,50 prior approval records, movement constants, campaign checkpoints and unrelated runtime are preserved. These are route checks, not human ratings or exhaustive shortcut proof.

Version7.302.0/cachev467-room-bank-final-review; catalog batch15, reviewCycle/defaultGroup pending. Publication uses the authorized GitHub main push to Cloudflare Pages. Root Pages config now publishes public/; original Worker config is preserved as wrangler.worker.jsonc. The separate online API still requires deployment/connection—do not claim it is live. Build439 assets and Worker dry run pass. No further run is underway; await the nine-room review. Earlier entries below are historical.

## 7.301.0: original checkpoints and Cloudflare GitHub release

The user's correction supersedes the 7.300 finale implementation. Every Survival room again has its own checkpoint/fire and feedback opportunity. There are no shared final-three-room resets. Future finales will be imported from approved Room Bank work when requested; no bank rooms or approvals changed here. Survival pause now has one World map entry, no duplicate Level select and no Connecting passages section.

Cloudflare Workers Builds is the current host target. `wrangler.jsonc` deploys the static game and a SQLite Durable Object for public scores/private feedback. Canonical API: `/api/playtest`; a legacy endpoint alias remains for older clients. GitHub main must contain the complete current game; standing instruction in `.agents/AGENTS.md` authorizes committing/pushing every completed run/change set after relevant checks. Never force-push. Setup and data transfer: `docs/playtest/RELEASE-7.301.md`.

All other 7.300 playtest features remain: Explore/Survival times and deaths, separate Base/Fractured aggregate boards, optional feedback, offline queue/backup transfer, Fractured portals/unlocks, map selection, pause scrolling, 70–115% zoom and public Extras hiding. Previous Netlify files are a legacy adapter, not the current deployment path. No Cloudflare production deployment has been made by this change. Room Bank Run 7 remains available locally and awaits review; do not recreate reports or author new rooms from historical notes below.

Version 7.301.0; offline cache `bladefall-v466-cloudflare-checkpoints`. Current verification receipt: `scripts/playtest-release/progress.json`. The prior 7.300 guide is marked superseded. Earlier entries below describe historical authoring work.

## 7.299.0: Run 7 ready for human review (2026-10-09)

The user authorized a new set after the Run 5/6 synthesis. Run 7 is complete locally: **16 candidates, eight Base B54–B61 and eight Fractured F55–F62**, saved individually. Extras → Room Bank defaults to Run 7. Four learning families connect smaller encounters to later combinations: timed launch/pogo, moving anchor/cargo, spent faces/resource-carrying climbs, and airborne replies/thermal cycles. Twelve rooms are compact and four are extended; no padded superroom claim. Guide: docs/room-bank/RUN-7.md. Full handoff: LLM-HANDOFF/ROOM-BANK-RUN-7-7.299.md.

The user's latest clarification governs difficulty: endings may be the hardest part. Do not automatically soften them or require broad safe resets; make the execution readable, learnable and human-achievable. The synthesis was corrected accordingly. The two original tech/entity reports remain unchanged. Prior specific requests about older endings remain deferred and do not imply a blanket rule for new work.

Active pool: **99 (55 Base / 44 Fractured)**; banked **50 (27 / 23)**, revised 18, candidate 31. All 83 prior source records are byte-for-byte unchanged, and all prior approval/side decisions are retained. All 16 new rooms await human review; none is inserted into a campaign. The four older Superrooms stay in their separate pending-review group. No numeric human ratings are inferred from the authoring results.

A new opt-in spent-thorn device keeps a marked face safe during first contact, warns for 18 simulation frames after departure, then makes only that face lethal until reset while the body stays solid. Four new rooms use it. Its view communicates the actual face and warning. Existing movement code is unchanged. Other rooms use existing systems in consequential timed sequences; there are no invisible required-event exit locks.

All 99 canonical routes finish with zero deaths. Saved checks pass 410 positive variations and 260 specific shortcut probes; Run 7 contributes 47/53. The focused spent-thorn contract passes. Actual routes include wavedash/hyper, reverse launch, wallbounce, controlled pogo, cargo dash catch, airborne parry and recoil. These establish feasible routes and named checks, not exhaustive anti-cheese proof or measured human fun/difficulty/suitability.

Browser checks complete all 16, review/revision/CSV, play timer/pause and camera travel. The final six-room hint/format/phase refresh passes; 16 entrance views and 17 intermediate views were inspected without an observed rendering/camera issue. The local 418-file bundle is rebuilt with relevant byte parity confirmed. Version 7.299.0; cache bladefall-v464-room-bank-run7; catalog batch 14 / active Run 7. Nothing published or committed.

Preservation: docs/room-bank/run-7-baseline.json and scripts/room-bank/archive/before-run7/. Result docs/room-bank/run-7-preservation.json records 415 baseline hashes: 409 unchanged, 6 expected shared integration/synthesis changes; all old sources, movement runtime, original reports and world lock preserved. Movement evidence: docs/room-bank/run-7-movement-audit.json. Browser receipt: scripts/climb/.cache/room-bank/run7-browser-review.json. Stop for human review; no next set or campaign placement is underway. Older entries below are historical.

## 7.298.0: Run 5/6 feedback applied; synthesis saved (2026-10-09)

Current scope is complete: B47/F53/F54 cut; B48 banked after fixes; F49 banked Fractured; F50 banked early Fractured; B51 moved to middle Fractured and banked without geometry/tape changes. F48 remains unchanged and available for review. Nine rooms revised: B46/B48/B49/B50/B52/B53/F47/F51/F52. Eight await approval; B48 fulfills conditional approval. No new rooms or next run were authorized or created.

Guide: docs/room-bank/RUN-56-REVIEW.md. New synthesis: docs/design/SURVIVE-ROOM-SYNTHESIS.md. Both original Celeste reports remain byte-for-byte unchanged. The synthesis examines temporal pattern learning, movement/entity composition, presentation, weak centrality tests and neglected existing systems. Its reproducible audit finds zero super/hyper/wavedash/ultra-family uses in the 16 pre-feedback Run 5/6 author routes; recommendations remain future work.

Active pool: 83 (47 Base / 36 Fractured); banked 50 (27 / 23). Seventy source records outside this feedback remain byte-for-byte unchanged; the four old Superrooms remain candidates with edits deferred. B52 alone opts into clearer smoke/watch drawing; B53 alone adds a sight glass showing the real tide when the float is below the camera. Detection and all movement rules are unchanged. No broad door retrofit or campaign integration.

All 83 canonical routes finish without deaths; 363 positive variations and 207 specific shortcut probes pass. 12 archived successful shortcuts now fail on the revisions. Browser playback covers all nine revisions plus B51/F49/F50, including real scrolling, groups, reviews/revisions/CSV and timer/pause. Visual layouts and intermediate views inspected. These checks establish working routes and named fixes, not exhaustive uniqueness or human quality.

Version 7.298.0; cache v463-room-bank-review56; catalog batch13, reviewCycle true, activeRun6. Local bundle rebuilt; nothing published or committed. Exact originals: scripts/room-bank/archive/before-run56-feedback/. Baseline: docs/room-bank/run56-feedback-baseline.json. Main preservation check: scripts/room-bank/run56-preservation-check.mjs. Full handoff: LLM-HANDOFF/ROOM-BANK-REVIEW-7.298.md. Stop for human review; do not start another run or implement synthesis proposals without user direction. Older entries below are historical.

## 7.297.0: Run 6 ready for review (2026-10-09)

The user requested another set after Run 5. Run 6 now contains eight new candidates: Base B50–B53 and Fractured F51–F54, with two compact rooms and two continuous superrooms per side. Extras → Room Bank defaults to Run 6. Each room is saved individually with a complete route and focused variations/probes. New guide: docs/room-bank/RUN-6.md. Full handoff: LLM-HANDOFF/ROOM-BANK-RUN-6-7.297.md.

All 78 earlier sources are byte-for-byte unchanged, including Run 5 and the four earlier Superrooms. All previous banking/side decisions remain intact; approved bank stays 46 (26 Base / 20 Fractured). Total active pool: 86 (49 Base / 37 Fractured). Do not infer approvals for any new candidate. Both existing design reports and the unrelated world lock are preserved.

All 86 canonical routes finish with zero deaths. Saved checks pass 371 positive variations and 214 targeted bypass probes, including 23/24 for Run 6. Actual browser checks cover all eight, scrolling, review/revision/CSV, play timer/pause and all menu groups. Layouts and intermediate views were inspected. This establishes working routes and the checked protections, not human quality or exhaustive uniqueness.

Version 7.297.0; cache v462-room-bank-run6. Local bundle rebuilt; nothing published or committed. Baseline docs/room-bank/run-6-baseline.json; originals scripts/room-bank/archive/before-run6/; current audit scripts/room-bank/run6-preservation-check.mjs. Catalog batch 12 / active Run 6. Stop for human review; no further run is underway. Earlier entries below are historical.

## 7.296.0: Run 5 ready for review (2026-10-09)

Run 5 is complete: eight new candidates, four Base B46–B49 and four Fractured F47–F50. Each side has two compact rooms and two continuous superrooms. Extras → Room Bank now defaults to Run 5. The user strongly liked the previous four Superrooms; all four remain unchanged in their separate Superrooms review queue. Their smaller edits, especially more forgiving Fractured endings, are deferred. Do not infer banking from that praise.

Run 5 synthesizes track choice and beam shade, linked landing relays and optics, an outbound/return cart route, repeated recoil through changed architecture, pressure-pod approach direction and phase control, a ram transported by a hinged floor for three later uses, a travelling fault opening its own lower return, and Oren's recorded path changing a door into a recoil-assisted return wall. New rooms are saved individually with routes and focused checks. All 70 older records are unchanged byte-for-byte, including their approval/side classifications; bank size remains 46. Total active pool: 78, with 45 Base / 33 Fractured.

All 78 canonical routes complete with zero deaths; 348 saved positive variations and 190 specific bypass probes pass. The new set contributes 24 variations and 24 probes. Browser checks complete all 8, verify actual large-map camera travel, existing review/revision/CSV flows, play timer/pause and Oren's contextual Controls label. Runtime changes are narrow: rail/water parsing, collision and drawing use actual room dimensions; companion hints use the remappable Portal binding. No ordinary movement constants changed. These checks establish feasibility and the specified protections, not measured fun or proof against every alternate route.

Version 7.296.0, cache v461-room-bank-run5. Local bundle rebuilt, no publication or commits. Current guide: docs/room-bank/RUN-5.md; full handoff: LLM-HANDOFF/ROOM-BANK-RUN-5-7.296.md. Catalog batch 11 / active Run 5. Baseline docs/room-bank/run-5-baseline.json and originals scripts/room-bank/archive/before-run5/. Current audit scripts/room-bank/run5-preservation-check.mjs; focused large-device fixture run5-device-check.mjs. Both existing design reports and the unrelated world lock are preserved. Stop for user review; no additional run is underway. Earlier entries below are historical.

## 7.295.0: Feedback applied and four Superrooms ready (2026-10-09)

Seven approvals banked: F31, B40, B43, F41, F42, F43 and F44. B40 is now late Fractured; F41/F44 are Base. F35's old approval is superseded and its new controlled-recoil revision awaits review. F32 has a higher spike roof and two lanterns. B41/B42 are substantially redesigned. Approved geometry/tapes are preserved. Bank: 46 approved, 26 Base / 20 Fractured; total active: 70, 41 Base / 29 Fractured.

Four continuous Superroom candidates B44/B45/F45/F46 each exceed three normal room areas and use shared state/return paths. Extras → Room Bank now defaults to Superrooms. All 70 saved routes, focused variations/bypass probes, browser review/play flows and real scrolling pass. Larger-room device bounds and teleport/respawn camera behavior are fixed. Local bundle rebuilt; nothing published. Version 7.295.0, cache v460-room-bank-superrooms.

Current guide: docs/room-bank/SUPERROOMS.md. Full handoff: LLM-HANDOFF/ROOM-BANK-SUPERROOMS-7.295.md. Plan: docs/room-bank/RUN-5-PLAN.md. Run 5 is planned but NOT BUILT; stop for review. Original records are archived in scripts/room-bank/archive/run4-before-superrooms/. Current audit: scripts/room-bank/superrooms-preservation-check.mjs. Older state below is historical.

## 7.294.0: Feedback applied; Run 4 ready (2026-10-08)

Eight approvals banked: F30, F33, B36, B38, B39, F35, F39 and F40. F35/F39 are now Base, retaining IDs. The approved bank contains 40 rooms: 24 Base and 16 Fractured. F40 is suggested for early Fractured; placement estimates reflect the qualitative feedback without inventing numeric user scores. F31/F32/B37 remain revised for review.

F31/F32 accept 14 consecutive reverse timings (7–20), up from five. Dash and Strike need not share a frame; the previews press Strike five frames later. Changes apply only to survive-2: eight ticks of reverse grace after a grounded dash, retained on the original support; a new landing cancels before buffered Jump. Reversing clears stale wall retention. A ground-skimming dash accepts delayed Strike. Receiving shores were widened. F33's preview follows the user's parry, guard finish, retreat, wavedash and final dash; geometry is unchanged. B37 has fixed stone matching the original seven-tile divider and uses the slingshot/climb route. B38 requires retrieving cargo for three overhead beams. F35 has a shorter covered lower basin and an ordinary recoil jump with no dash; banked as Base.

Run 4 follows its original new movement × new entities scope. Four Base rooms B40–B43 and four Fractured rooms F41–F44 are saved separately. Base: Unshade the Lock (recoil and cargo dash catch), Below the Last Rail (moving anchor and low pogo), A Weight With Teeth (enemy-loaded recoil and low pogos), Collect Above the Dock (cargo rail and upward dash catch). Fractured: Cut Under the Eaves (recoil and late reverse super), Two Jobs in One Cut (pogo and impulse seed), The Lift Becomes a Wall (moving anchor and late wallbounce), Take the Moving Passenger (moving cargo and airborne dash catch). All eight await review. The original five-run plan is saved in docs/room-bank/RUN-PLAN.md; the prior Run 4 proposal is marked historical. Run 5 has not started.

There are 66 active records: 38 Base and 28 Fractured. Groups: Run 4 4+4, Run 3 1+0, Run 2 0+2, earlier review 9+6, banked 24+16. All 66 canonical routes, 328 recorded positive variations and 147 negative probes pass. The 71 focused reversal contracts and 21 existing movement contracts pass. Actual keyboard/controller paths pass for F31/F32. Browser checks complete all 14 new/revised rooms, including reviews, CSV, revision hashes, play clock and Base-transfer links. Final layouts were inspected. Forty-seven untouched source hashes and both existing design reports match the baseline. These checks establish working routes and specific regression fixes, not measured quality or exhaustive route uniqueness.

Version 7.294.0, cache v459-room-bank-run4. Local bundle rebuilt with 416 game files; nothing published or committed. Primary guide: docs/room-bank/RUN-4.md. Current index: docs/room-bank/README.md. Source catalog: batch 9, active Run 4. Baseline: docs/room-bank/run-4-baseline.json. Audits: scripts/room-bank/run4-preservation-check.mjs and run4-input-check.mjs. The old run23 preservation script describes its historical 58-room release. Stop for user review; Run 5 remains the later full synthesis.

## 7.293.0: User approvals and Run 1/2/3 revisions complete (2026-10-08)

Ten approvals saved: B26, B31–B34, F34, B35, F36, F37/F38. The last two moved to Base with stable IDs and original geometry/tapes. Bank now32: 19 Base/13 Fractured. Eight revisions ready: F30, F31/F32/F33, B36/B37/B38, F35. Three new companions: B39 fixed Base selected-lift lesson, F39/F40 harder versions of the two banked hook rooms. Repeated B37 feedback treated as B38. All eleven await user review; no invented numeric scores. Run4 proposal saved, no Run4 rooms built.

F30's real bug was an echo swap retaining its old rope. The rope then converted teleport displacement into extreme velocity. Successful swaps now release via the hook module first; blocked swaps preserve the tether. Canonical keeps Grab held and presses Echo; landing widened/lowered. 108/132 varied finishes,14 consecutive direct-swap timings. Actual default P, remapped E and RB controller routes pass with no deaths. Controls/hints identify the Echo binding.

F31/F32 final opening uses a live beam, phase shade and spent launch foothold. This blocks both original ordinary-movement routes and the independent walk-cut/forward-hyper routes without narrowing the original7–11 reversal timings. F32 adds lantern catch, beam shade and a pressure-roof deposit. F33 replaces wallbounce with guard as support/shield/sealed-tally cover and one-time back-cut launch; ordinary jump over guard is a recorded valid alternative, pogo not mandatory. B36 seed placement becomes portal exit height; B37 obstruction becomes dismount bridge; B38 cargo rides above while knight hooks below, then clasp/retrieval supplies final shade. F35 sends its lantern launch weight into the gate basin. F39 leaves an echo holding a rail opening before moving-hook transfer; F40 redirects light and lets the carrier expose a sealed tally before returning under shade.

58 active rooms:32 Base/26 Fractured; groups Run1 0+1, Run2 0+3, Run3 4+3, earlier review9+6, banked19+13. All58 canonical routes,264 positive variations,124 negative probes pass. Focused echo/recoil/impulse/moving-hook and21 movement contracts pass, plus all8 existing campaign echo routes. Final browser check completes all11 revised/new rooms, reviews/CSV/current counts/play timer/pause and F20/F37/F38 legacy transfer links. Eleven layouts visually inspected. Browser harness now stops on first exit; otherwise a valid B38 tape's trailing input incorrectly counted a death in next room B39. This was a harness fix, not a room change.

47 non-revised original room definitions/tapes remain unchanged. Both design reports, main movement core and unrelated world lock are unchanged. Originals: `scripts/room-bank/archive/runs-2-3-before-review`. Baseline: `docs/room-bank/run-2-3-review-baseline.json`. Independent audit: `scripts/room-bank/run23-preservation-check.mjs`. Version7.293.0/cachev458-room-bank-review-23. Local bundle rebuilt; no publication or commits.

Current guide: `docs/room-bank/RUN-2-3-REVIEW.md`; next proposal: `docs/room-bank/RUN-4-PROPOSAL.md`; index `README.md`. Old Run1/2/3 guides are explicitly historical. Start at Extras → Room Bank. Stop for user review, do not begin Run4 automatically.

## 7.292.0: Runs 2 and 3 ready for combined review (2026-10-08)

Run 3 is complete: eight new entity rooms, four Base B35–B38 and four Fractured F35–F38. Recoil plates (B35/F35) combine load/removal/partial lift with cargo, beams and hyper height. Movable impulse seeds (B36/F36) require a positioning cut followed by a separate radial launch. Moving hook carriers (B37/B38/F37/F38) cover changing rope clearance, vertical release lift, moving-ring transfer and moving beam shade. The final B35 returns the actual lantern to reload its beam shield; F36’s hint correctly says the burst goes away from the seed centre. Each room, canonical route and timing variations is saved individually. All remain candidates, with numeric human scores unmeasured.

Run 2 remains available beside Run 3, entirely unchanged. All 47 prior room records, both completed design reports and the unrelated world lock match `docs/room-bank/run-3-baseline.json`. Prior banking/revisions are preserved: 22 banked (11 per side), including easy B27; B26 and F30 stay revised for review. Do not regenerate reports, infer new approvals or start Run 4.

Current pool: 55 active (29 Base / 26 Fractured). Groups: Run 3 4+4, Run 2 4+4, Run 1 revisions 1+1, earlier review 9+6, banked 11+11. All 55 canonical routes, 243 positive variations and 100 negative probes pass. The new set contributes 82 positive variations and 20 probes. Focused recoil, impulse and moving-hook tests pass, as do all 21 Run 2 movement contracts. Combined browser checks render/complete all 16 Run 2/3 rooms, save separate surveys, export CSV and verify all five groups/timer/pause. Eight new layouts visually inspected. Local bundle rebuilt with 416 game files; no publication. Version 7.292.0, cache v457-room-bank-run3.

Start at **Extras → Room Bank → Run 3** or **Run 2**. Guides: `docs/room-bank/RUN-3.md`, `RUN-2.md`, `README.md`; handoff: `LLM-HANDOFF/ROOM-BANK-RUN-3-7.292.md`. The new families are opt-in; the existing fixed-hook module has a narrow moving-ring callback, and old F23 remains covered. Run 3 does not use Run 2’s movement profile. Moving carriers are authored for ordinary gravity and nonteleporting rails; do not assume inversion/portal-transport support. Stop for the combined user review.

## 7.291.0: Run 1 decisions and Run 2 movement review (2026-10-08)

The user's six Run 1 approvals are banked: B27 (early/easy Base), B29/B30, F26/F27/F28. Their room definitions/tapes equal the archived originals; F26 records the accepted dash-first/wavedash/pogo alternative. B26 and F30 are revised, not banked. B26 now parks the uppercut guard on a higher ledge and adds a stone-shade/beam-return puzzle; 12 representative positive tapes plus the broader 119-clean-case sample establish a usable execution range. F30 preserves rope/tally/echo/zero-dash design with a wider, lower final shelf; 72/72 sampled release/swap routes pass versus 18/72 originally.

Run 2 is complete: four Base B31–B34 and four Fractured F31–F34. Shared-core `movement: 'survive-2'` enables controlled pogo height, buffered cargo dash catch, reverse super/hyper and six-frame late wallbounce only for these rooms. Existing-room rules remain intact. Hints are visible before first input. The existing two design reports were used, not regenerated. No new entities; Run 3 has not started.

Current pool: 47 active (25 Base / 22 Fractured). Run 2 4+4; Run 1 revisions 1+1; earlier review 9+6; banked 11+11. All 47 clean routes, 161 positive variations, 80 negative probes and the exact catalog contract pass. Movement tests: 21 permanent contracts plus a successful one-time legacy trace comparison. Browser review/export/play flow passes; all ten new/revised rooms rendered and completed. Local bundle rebuilt (410 files), no publication. Version 7.291.0; cache v456-room-bank-run2.

Start at **Extras → Room Bank → Run 2**. Guides: `docs/room-bank/RUN-2.md`, updated `RUN-1.md`, and `README.md`. Sources save each room individually. Broader timing evidence: `scripts/room-bank/b26-tolerance.json` and `scripts/room-bank/evidence/run-1-review/30-bank-f30-tolerance.json`. Numeric player scores remain unmeasured. Preserve unrelated edits and the world lock file. Stop before Run 3 until the user continues.

## 7.290.0: Run 1 existing-system interaction rooms (2026-10-07)

Eight new candidates, four Base and four Fractured, are saved and integrated under **Extras → Room Bank → Run 1**. The earlier 31 records and all movement/device/course files match the saved pre-run hashes. Nothing newly banked, no new mechanics/entities, no publication. Runs 2–5 are not started.

Active pool: 39 rooms (21 Base / 18 Fractured). Run 1: 4+4. Earlier review: 9+6. Banked: 8+8. All 39 clean routes, exact catalog membership, recorded shortcut checks and the browser review/play flow pass. Eight new rooms rendered and completed in the browser. The local bundle is rebuilt. Version 7.290.0; cache v455-room-bank-run1.

Guide and selection rationale: `docs/room-bank/RUN-1.md`; index: `docs/room-bank/README.md`. Sources and tapes remain individually saved under `scripts/room-bank/base` and `fractured`; generated manifest and route report are in `docs/room-bank`. The baseline is `docs/room-bank/run-1-baseline.json`. Scores remain unmeasured until the user reviews them. Preserve unrelated edits and the world lock file.

## 7.289.0: Timing batch and latest user decisions (2026-10-07)

**Active membership: 31 rooms. Banked: 16 (eight base / eight Fractured). To review: 15 (nine base / six Fractured), comprising five revisions and ten new candidates. The complete set is saved, integrated and ready for review.**

User decisions: B13 is banked after removal of its invisible upper one-way platform; B19 and F11/F13/F16/F18/F19 are banked unchanged. F20, Open the Other End, is transferred to base and banked with its geometry/tape unchanged; retain stable ID `bank-f20` for prior reviews. Existing eight banked rooms remain approved. Overall side totals are now 17 base / 14 Fractured; the new additions remain evenly split 5+5. Numeric player ratings remain unmeasured unless supplied; these are qualitative banking decisions.

Revised, not banked: B16 Hands for the Chimney adds a second cargo-only duct, replacement shade and timed shutter descent; B17 Ceiling Keeps the Key adds a deliberate release through a heat throat; B18 Floor You Need Gone adds beam shelter lost when its spent pier goes; B20 The Door You Need Closed adds a cycling stop that must catch its beam-shield stone. F17 Leave the Wall Standing has two visible downward thorns blocking the reported non-void side approach. All five have saved clean routes. Originals are in `scripts/room-bank/archive/batch-03-before-review/`; B19 is untouched.

Added B21 Passing Places, B22 Wait Below the Lip, B23 Miss One Ferry, B24 Carry the Quiet Moment, B25 A Floor Until It Opens; F21 Between Passes, F22 The Return Window, F23 Shorten the Arc, F24 Both Ends Clear, F25 Freight Has Right of Way. Each new record describes at least two visible cue/action/rest stages. New opt-in sweepers have deterministic visible patrol paths, a first-input clock, reset/gravity handling and swept collision. No new-mechanic quota this batch. Existing movement forgiveness is retained; base uses ordinary movement. See `docs/room-bank/TIMING-DESIGN.md` and `TIMING-PATROLS.md`.

Checks complete: all 31 saved routes finish without deaths; all 34 recorded negative routes fail to exit. Exact catalog membership and five new timing rooms per side pass, with at least two cue/action/rest stages each. Sweeper smoke passes. Browser checks cover Extras, group counts, rating/CSV revision IDs, play clock/pause, F20 legacy-link reclassification, and actual rendering/completions for all 16 new/changed rooms. All 16 received a visual pass. F25 finishes in 413 frames. Existing one-way platforms now have a generic visible rendering; B13's unwanted upper strip is removed entirely. B25 opts into existing Down + Jump drop-through. F20 geometry/tape match its archive. Version 7.289.0, cache v454-room-bank-timing; local bundle rebuilt with 410 game files. No broad campaign sweep or publication. Focused negative checks address specific mistimings and shortcuts, not every alternate route. Exits have no hidden device-use requirements.

Current guide: `docs/room-bank/BATCH-04.md`; index: `docs/room-bank/README.md`; generated manifest/report beside them. Batch 03 remains historical. Sources/tapes are under `scripts/room-bank`; browser captures under `scripts/climb/.cache/room-bank`. Review mode, group-specific sets, stable IDs and hashes retain earlier feedback. The broader reserve and full distributed study remain later work. All work is local; no publication. Preserve unrelated changes and `LLM-HANDOFF/locks/climb-15-20.json`.

## 7.288.0: User decisions banked, three revisions and ten new rooms ready (2026-10-07)

**Active pool: 21 rooms. Banked: eight (five base / three Fractured). To review: thirteen (six base / seven Fractured).** Extras → Room Bank now separates Banked and To review, with stable IDs on cards, independent chapters/timer sets and group-preserving mode links. Reviews retain room-definition hashes and prior rows.

User approvals: b11 repaired then banked; b12/b14/b15 and f12/f14/f15 banked unchanged. Prior b05 remains first. The user explicitly accepts f12's alternate route. Revised but not banked: b13, f11, f13. Four original room records are archived in `scripts/room-bank/archive/batch-02-before-review/`. Nineteen rejected batch-01 records remain excluded.

B11's exit is higher and the permanent roof/gallery grabs are guarded, making the vertical arm necessary. B13's cast stopper doubles as a low beam shield, and its first-stop launch is blocked by a low roof/high exit. F11's receiver is sealed and the second arm approach requires preparing the first. F13 has a sealed horizontal light duct and an additional optical junction preparation decision. Specific reported shortcut tapes were reproduced on the originals and fail on the revisions; this is not an exhaustive no-alternate-route claim.

Added five base b16–b20 and five Fractured f16–f20, saved individually with solutions, nearest antecedents, estimates and clean tapes. Cargo clasps are new in B16/B17: open non-solid rings hold loose lanterns; Grab retrieves and blade releases. Device, renderer, focused check, page, service-worker and local bundle registration are complete. The clasp settles last in browser and headless device order. F16/F17 reuse void transit. Remaining new puzzles use spent floor/cargo timing, echo delivery/return, closed-gate access before unlocking, cart freeze/thaw relocation, echo weight/launch exchange and portal rear-face access. Only one new room uses portals.

Checks passed: all 21 zero-death routes and recorded shortcut regressions; exact bank/revision/new membership and mechanic quotas; clasp interaction smoke; browser bank/review groups, rating/CSV, play clock/pause, and 14 new/changed room renders plus actual completions. Visual pass completed. No broad campaign sweep. Full guide: `docs/room-bank/BATCH-03.md`; generated manifest/report alongside it. Sources under `scripts/room-bank`; screenshots under `scripts/climb/.cache/room-bank`. Version 7.288.0; cache v453-room-bank-review. Local bundle rebuilt, not published.

The larger reserve and full distributed playtest study remain later work. Keep numeric player ratings unmeasured until supplied. Preserve unrelated existing changes, particularly `LLM-HANDOFF/locks/climb-15-20.json`.

## 7.287.0: Replacement room bank complete (2026-10-07)

User rejected nineteen of the first batch as derivative. **The Useful Ceiling (`bank-b05`) is retained unchanged as the first banked base room**, with ratings pending. The other nineteen are preserved in `scripts/room-bank/archive/rejected-batch-01/`, excluded from registration; their original generators are guarded.

Added **five new base (`bank-b11–b15`) and five new Fractured (`bank-f11–f15`) candidates**, saved individually. Active bank: **6 base / 5 Fractured**; the new batch is evenly split. Extras → Room Bank opens Review mode. The approved room is labelled Banked; the ten new rooms remain Candidate. Room hashes and old review IDs are preserved. Full room list, decisions and spoiler guide: `docs/room-bank/BATCH-02.md`.

Four rooms use new hinged stone arms (two per side). Six use existing tools: manufactured stone stopper, gravity/conveyor cargo delivery, airborne lantern/feather handoff, selective spent light shields, water/void cargo split, and portal-delivered stone with successive shelter/access roles. Exactly one new room uses portals. Authors studied the existing rooms and documented nearest antecedents in each record. Fun, measured difficulty, suitability and acceptance remain for the user's reviews.

The new hinge scripts are opt-in and included in the page, service worker and local bundle. One real core fix: initial beam tracing now runs in a post-reset ready hook after every device body exists, preventing premature tally activation through uninitialized blockers. Existing beam room p183 still completes with its saved tape.

Validation complete: all **11 active room tapes exit with zero deaths**, base routes use no advanced momentum, the hinge's focused mechanic check passes, and the browser check passes Extras/menu selection, review submission/CSV, play timer/pause and all 11 actual room renders/completions. Visually inspected all ten new room screenshots. No broad campaign sweep. Sources/tapes live under `scripts/room-bank`; manifest and route report under `docs/room-bank`; browser captures under `scripts/climb/.cache/room-bank`. Local bundle rebuilt; no publication. Version 7.287.0, cache v452-room-bank-puzzles.

`catalog.json` is the batch contract. The larger reserve and full distributed playtest series remain later work. Preserve other pre-existing Climb/menu changes and the user-modified world lock file.

## 7.286.0: First spare-room bank complete (2026-10-07)

20 experimental candidates: **10 base + 10 Fractured**, saved separately after each room under `scripts/room-bank/base/`
and `scripts/room-bank/fractured/`. Maps, metadata, estimated difficulty and zero-death completion tapes live in each JSON.
All 20 are route-proven; human fun/difficulty/suitability remain unmeasured. Campaign placements are unchanged.

Two new opt-in mechanics: **Step relay** (landing switches linked moving platforms; four base + four Fractured rooms)
and **directional crystals** (refill only while moving along the arrow; four Fractured rooms). Other rooms recombine existing
platforms, dash resources, lanterns, gravity, springs, pods, wind, faults and advanced Fractured movement. No base proof uses
super/hyper/ultra/wallbounce. Difficulty estimates: base 1–4; Fractured 3–5.

Extras → Room Bank opens the candidate browser in Review mode. Base/Fractured tabs, estimated-difficulty filter, per-room
selection and full sets are available; Play mode keeps the timer. Existing three rating scales/CSV export now include bank side,
batch and room revision. Mode links preserve bank/room. Pause room selection invalidates time eligibility (also fixed in Survive).

Guide: `docs/room-bank/BATCH-01.md`. Manifest: `docs/room-bank/manifest.json`. Route results: `docs/room-bank/route-report.json`.
Rebuild sources: `node scripts/room-bank/build.mjs --check-batch`; replay once: `node scripts/room-bank/check.mjs --write`.
Checks passed: all 20 zero-death tapes and mechanic quotas; both new-device focused checks; bank menu/review/CSV/timer browser
checks; all 20 room renders; four directional-crystal browser tapes; existing Survive review/timer regression. Screenshots/logs
are in `scripts/climb/.cache/room-bank*`. Local deployment bundle rebuilt with 404 game files, not published. Cache v451-room-bank.

This is the first 20-room batch, not the entire earlier suggested ~80-room reserve. Further batches and subjective ratings can
expand/refine the pool before the full distributed study. Do not overwrite these bank candidates when adapting campaign copies.

## 7.285.0: Co-op height refinement (2026-10-07)

Co-op is now 98px tall, matching the measured Level Select and Controls buttons. Cache: `bladefall-v449-title-height`.

## 7.284.0: Title button proportions and icons (2026-10-07)

Co-op is 120px tall (previously 60px). Explore uses 🧭, Survive uses ⚔️, and Sound reads On 🔊 / Off 🔇.
Continue and Extras remain unchanged. Co-op mode-choice labels share the new icons. Browser measurements, both sound states
and the rendered title were checked. Cache: `bladefall-v448-title-icons`. Local bundle rebuilt; not published.

## 7.283.0: Explore / Survive title and last-played Continue (2026-10-07)

Player-facing names are now Explore (metroidvania) and Survive (connected ascent). Continue selects the last played
resumable game. Survive resumes its saved room and preserves review/play mode through the existing checkpoint restoration;
Explore uses the existing campaign resume. Browsing a menu does not change the last-played marker. Older saves with no
marker retain Explore-first fallback when both have saves. Storage keys and existing review/time records are retained.
Co-op on the title offers Explore or Survive, leading to their respective host/join panels. Extras is full-width like Co-op.

Browser verification: `scripts/verify-title-modes.mjs` (both Continue directions, saved room/mode, co-op routes, names,
Extras width, menu browsing); review/timer regression: `scripts/verify-bladescent-modes.mjs`. Screenshots reviewed.
Runtime URLs 7.283.0 for changed scripts; service-worker cache `bladefall-v447-title-modes`. Local bundle rebuilt, not published.

## 7.282.0: Bladevain / Bladescent menus and room review mode (2026-10-07)

BLADEFALL remains the title. Bladevain launches the metroidvania; Bladescent launches the connected ascent. Extras groups
Precision Courses, Merge Pitches and Dialogue Editor. Level select, Sound, Controls, Leaderboards and Co-op remain.

Bladescent `mode=review` pauses after authored room completion/road skips for Fun /10, Difficulty /5, Suitability /5 and
optional comments; Rate room handles unfinished attempts. Ratings persist locally and export as CSV with tester/build/room
identifiers, outcomes, time/deaths and assistance annotations. `mode=play` has no surveys and adds per-world timers and local
build-specific time records; assisted/skipped/warped/co-op/demo runs are practice. No shared/server leaderboard is claimed.
New module: `public/bladefall-climb-session.js`. Browser integration check: `scripts/verify-bladescent-modes.mjs`.

Recommendations and the deferred spare-room pool (before the first distributed study):
`docs/playtest/bladescent-pretest-plan.md`. Recommendations 1/2/7 are not implemented without a design decision; momentum
lessons stay in Fractured. No spare rooms authored yet, matching the request to do that later. Local bundle only, not published.

## 7.281.0: Climb cleanup completed locally (2026-10-06)

All remaining harder Fractured worlds are integrated: 21–24, 29, 31, 32, 35, 36, 38–40; 37's return corner is repaired.
All 40 worlds are assembled. Changed worlds' browser routes/branches/lifts pass, and every section-8 geography verifier,
feature checks, both rendering audits and the local deployment build passed. Full report and evidence:
`LLM-HANDOFF/CLIMB-COMPLETION-7.281.md`.

World 35 now uses Lift and Toss above Roof with a real drop-back shaft. Its arrival junction and World 32's outgoing
mouths are placed clear of authored terrain. The 37 repair merges only the broken return corner, preserving its rooms.
The geography test fixture now includes the browser's gravity module; shade lift tests retreat promptly without changing hazards.

Changed script URLs: 7.281.0; cache: `bladefall-v445-climb-complete`. `netlify-deploy/` rebuilt and ready, **not published**.
No commit/APK. All builder jobs stopped/completed; local caches retained. Isaac's design decisions and gate links remain
open exactly as listed in the completion report. Older entries below are historical.

## 7.280.0: Isaac's seven-item cleanup (map, flip, secret lift, zipline, harder bosses, momentum moved, harder Fractured)

A multi-agent run (workflow wf_20007fbe-744, 11 agents) plus orchestration. Details: docs/plans/climb-worlds-15-20-progress.md
(run 6), per-region notes docs/plans/fractured-progress/NN.md, the Fractured brief docs/plans/fractured-hard.md.

- **Map (item 7):** new schematic, zoomable nested-diamond map `public/bladefall-climb-map.js` (both emeralds, open/locked links,
  YOU pin, progress, region details with what opens each sealed mouth). Junction signs name each mouth's real destination, and
  sealed mouths are barred with the reason.
- **Inversion (item 3):** the flip is seamless in the Climb (camera, connected drawing, frozen rooms, scarf).
- **Secrets (item 6):** every ceiling door has a beam of light; hold Up under it and the knight is lifted smoothly in
  (`scripts/climb/lift-check.mjs`). Climbing ways back carry through upward seams.
- **Zipline (item 1):** `bladefall-pcore-dev-zipline.js` (the main game's seam/tear): taught in the Void Tyrant (three-ride
  crossing to the arena), used in the Abyss King, Thunder Cliffs, Landing Shores, Colony, Path, and across the Fractured act.
- **Bosses (item 5):** Brute, Marksman, Warden, Sorcerer, Colossus, Tyrant, King, Hydra, King in Daylight: more phases, a second
  attack, one twist each (opt-in room fields; each device header lists them).
- **Momentum (item 2):** no base route in 1-20 uses super/hyper/ultra/wallbounce; six momentum-lesson rooms and the momentum
  secret rooms moved to the Fractured worlds.
- **Fractured (items 4, 5):** new devices fault stone, the shade, mirror panes (+ the tear); all 20 Fractured regions rebuilt
  harder in Room by Room with a ramp from 21 to 40 (measured by scripts/pcore-lab/difficulty.mjs; verify-rbr passes 1-40).
- **Engine/build fixes:** page loads device modules in the checker's sorted order; builder proves way-back pieces in rock and
  cuts each route at the real seam (`ringed`, `cutAtSeam`), turns a flipped exit upright, and can lay a room reflected
  (`spec.mirror`, scripts/rbr-src/mirror-lib.mjs).
- **In the page (deployed build, 7.280.0):** base 1-20 rebuilt; Fractured 25-28, 30, 33, 34, 37 rebuilt hard (roads at 0 deaths,
  branches home; 37's echo way back stalls in one piece but you can walk back). **Still their 7.279 builds:** 21-24, 29, 31, 32,
  35, 36, 38-40. Open: 22/23/24 roads double back after the reflection fix (spec.mirror); 29's departure has no free wall for
  29-31/29-32 (both right heights cross fs29-gglass); 35's secret door sits in a cart room (the lift cannot hold him: pick other
  secret.hosts) and, when the new 35 goes in, remove its '3x-35' SIDE overrides in passages.js; 31, 32, 38, 39 spend hours in
  the secret-door search; 36, 40 were building. Builds: scripts/climb/.cache/worlds-r6 (23's retry in worlds-r6b).
- `?v=7.280.0` on every changed script; cache `bladefall-v444-game-cleanup`. Not committed.

## 7.279.0: The Climb, all 40 worlds in the page (Fractured 25–40 converted, built and connected)

The Climb routine, run 5 (a continuous session at Isaac's request). Details: `docs/plans/climb-worlds-15-20-progress.md`.

- **Room by Room 25–40 converted** by a new generator, `scripts/rbr-src/fracture.mjs`: each Fractured region is its base
  region (5–20) reflected left to right (maps, spikes, belts, rail boosts, devices, people, routes; each room checked in
  the core), or kept in base orientation when any room's reflection does not play (33, 38, 39, 40). Each base quest is
  that person's **echo** (sealed by the base keepsake, new lines, a remembrance). `verify-rbr`: 40 regions, 589 rooms.
  **A first pass, not the harder redesign the Room by Room plan describes**: Isaac's call.
- **Climb 25–40 built and connected:** the base emerald turned over below 21; 27 new links (braid, crown, apex, circuit,
  crossings 24–25, 36–28, 37–24, 38–22). Gate links 39–21 and 40–23/25/27 not yet. 40 worlds, 67 passages.
- **Fixes (builder):** a way back may not double back into its exit corridor (the page set the knight into the second
  piece and he walked back: World 21's echoes); `spec.noLoop` (24's echo), `spec.exits`, quest rooms take `spec.patch`,
  `spec.secret.first`. **(passages.js):** side overrides for 35's reflected arrival and 27–29.
- **Checks at 40 worlds, all pass:** footprints, projected terrain (134), folds (268), contained, runtime (378 seams /
  494 tapes), resume (134), traversal (67 / 206), mouth views (268), co-op, junction regressions; `feature-check` OK.
  `page-check 25–40`: every road at 0 deaths; most branches fully OK.
- **Open:** seven ways back stop in a climbed shaft in page-check (27, 33, 35, 36, 40; and 15's secret): the view hands
  the knight into the piece above when his head crosses (`p.y<=-3`), so a wall climb drops back; springs pass. Proposed
  fix in the vertical seam handoff (shared, every world), not made. Several echoes return into their own last room.
- `?v=7.279.0` (atlas, geography-build, passages, passage-art, worlds); cache `bladefall-v443-fractured-worlds-25-40`;
  `./build-deploy.sh` run. Not committed.
- **Decisions for Isaac:** keep the reflected Fractured regions or redesign them; one road into the Fractured emerald
  (or keepsake rifts); the gate links still missing; ratings for 10–40 and the cap above 7; the Deep Line's ending;
  `aim8` beyond 1–2.

## 7.278.0: The Climb, the Fractured emerald (worlds 21–24) is in the page

The hourly routine (worlds 15–20, then the fractured worlds), run 4. Details: `docs/plans/climb-worlds-15-20-progress.md`.

- **Placed:** 21 The Fractured Outskirts, 22 Woods, 23 Causeway, 24 Updrafts, below the Path to the Palace. Links: road
  19–21 (into a gate room, The Cracked Postern, over 21's Glass Mile: 21 has no arrival junction because its first room
  is climbed up the wall an arrival would cut), roads 21–22, 21–23, 22–24 and crossing 22–23. 24 worlds, 40 passages.
  New `fractured` passage style and sky. Echoes stay sealed until the base keepsake is held (run 3's seal), so the
  planned keepsake rifts 1–21 … 4–24 were not needed and not built; worlds 1–4 are untouched.
- **World 24's echo** now has a way back: the Funnel's chute turns right at its foot in the Climb (`spec.patch` + new
  `spec.exits`); quest rooms now take `spec.patch` too.
- **Shared fixes (`passages.js`, `atlas.js`):** a last room left by the same wall it was entered keeps its departure on
  the opening above its fire; a world reached only through gates gets no arrival junction; 24's Signal Crown takes World
  4's retimed route. Every verifier on the handoff list passes (runtime 224 seams / 293 tapes, traversal 40 corridors /
  122 junction roads, footprints, folds 160, mouth views 160, resume 80, co-op, junction regressions); `feature-check` OK.
- `page-check 21`–`24`: roads at 0 deaths; secrets and the echoes of 22 and 23 fully OK; open by eye: 24's echo walk
  home stops in its shaft and returns into the Funnel, 21's Mara (walk home) and Rowan (reverse).
- `?v=7.278.0` (atlas, art, passage-art, passages, geography-build, worlds); cache `bladefall-v442-fractured-emerald`;
  `./build-deploy.sh` run. Not committed.
- **Decisions for Isaac:** keep one road into the Fractured emerald, or add the keepsake rifts from 1–4; ratings for
  10–24 and the cap above 7; the Deep Line's ending (and 23/24 ending with no road onward); `aim8` beyond 1–2; the Deep
  Line's long westbound drop.

## 7.277.0: The Climb, a death at every secret's door fixed, the echo seal, and the first Fractured builds

The hourly routine (worlds 15–20, then the fractured worlds), run 3. Details: `docs/plans/climb-worlds-15-20-progress.md`.

- **Fixed, every world:** climbing into a secret's or errand's ceiling door and falling straight back down killed the knight
  (walking back was held off for 45 frames after entering a room; the fall takes about 10). A fall back the way you came now
  goes home after 8 frames. Probed in worlds 1, 2, 16, 17: one death each before, none after.
- **Echo seal (`bladefall-climb-view.js`):** a quest with `needs` (a Fractured echo) stays sealed (door, side way and way
  back's opening, drawn violet) until its keepsake is held, and says which keepsake. No base world has one.
- **Fractured worlds started:** `WORLDS` 21–24 in `scripts/climb/spec.mjs` (Room by Room's order, unrated; secrets from
  the unused Momentum X, vertical-dash, portal and summit courses). Builds in `scripts/climb/.cache/worlds21/`:
  21, 22 and 23 build with every branch (23 needed a second road turn: builder change `buildChain(…, road)`, only
  reached after every older option fails); 24's Cartographer echo has no way back yet. **Not in the page:** a placed world with no incoming link hangs its arrival
  junction, so 21–24 go in with their links (reflected emerald under 19, keepsake rifts 1–21, 2–22, 3–23, 4–24; plan in
  the progress doc).
- **Checks:** `feature-check` OK; geography runtime (195 seams, 247 tapes) and resume (70) pass; `page-check 1` road OK.
  `page-check 1`'s miss on World 1's secret is in its own sequence; the door works by eye on fresh and cleared saves.
  `verify-climb-passage-seams` is stale (old passage model), like `verify-climb-atlas`.
- View `?v=7.277.0`; cache `bladefall-v441-echo-seals`; `./build-deploy.sh` run. Not committed.
- **Decisions for Isaac (unchanged):** ratings for 10–20 and the cap above 7; the Deep Line's ending; `aim8` beyond 1–2;
  the Deep Line's long westbound drop; the fractured placement (a reflected emerald reached by keepsake rifts).

## 7.276.0: The Climb, Sunspire's three entrances and the 19–1 spoke (the whole emerald is connected)

The hourly routine (worlds 15–20, then the fractured worlds), run 2. Details: `docs/plans/climb-worlds-15-20-progress.md`.

- **The map is complete:** 20 regions, 39 links (35 folded passages). Nothing in the atlas is reserved any more.
- **Gate rooms (mid-world sockets), new in the builder (`spec.sockets`).**
  - What a gate is: a 16×14 room hung off a road room's ceiling by the secrets' `ceilingDoor`, with a fire and one passage mouth.
    You climb up into it through the door and drop home through its ledge.
  - How the page sees it: it carries `atlasJunction` + `atlasGate`, a passage socket and a one-step road, so the folds and every
    junction verifier treat it as a junction. It is stored as a key-less quest (`socket:'20-5'`), so heart and keepsake counts
    are unchanged.
  - Where one is allowed: only where its projected corridor (46×10) is clear of every room and of earlier gates' corridors, and
    where a simulated drop through its door lands safely at three moments of the room's clock.
  - Options: `edge`, `lift` (a taller shaft) and `minX`.
- **Where they are:**
  - Sunspire: 20–3 over Both Ends; 20–5 over the Noon Engine (lifted 8, opens east, arrives on the Sentry Landing's left via
    `SIDE`); 20–7 over the Sea Terrace's left ledge.
  - The Outskirts: 19–1 over The Verge. A new game still starts on the road.
  - World 1 was not rebuilt: the gate, its door and two tapes were grafted onto the existing `w1.json`. A fresh World 1 build now
    moves its secret's shaft 3 tiles; don't take that without a look.
- **Atlas:** crossings 19–1, 20–3, 20–5, 20–7; `endpoint()` returns a link's gate room. **Passages:** four designs. A gate's
  link stays out of its world's arrival.
- **View fix:** a downward walk-back (dropping home out of a short shaft) now sets the knight just inside the room below, within
  the door's columns. Before, the core's closed top held him standing on the ceiling, and the door took him back up.
- **Checks:** footprints, projected terrain (70), folds (140 seams), contained worlds, traversal (35 corridors, 106 junction
  roads), runtime (195 seams, 247 tapes), resume (70), mouth views (140), junction regressions (106), co-op: all pass.
  `page-check 20` and `1`: road OK, gates entered and dropped home at 0 deaths. `feature-check` OK. Screenshots looked at.
- **Failing / open:**
  - 13–15 still takes 10.05 s (the Deep Line arrival's middle tier is slow whichever link takes it).
  - `verify-climb-junction-regressions` failed intermittently 3 times, error not captured; it passes when run alone.
  - `page-check 1` shows World 1's existing secret (The Cut) as not entered; this predates the run, so look by eye.
- Scripts `?v=7.276.0` (atlas, passages, view, worlds); cache `bladefall-v440-sunspire-gates`; `./build-deploy.sh` run. Not
  committed.
- **Decisions for Isaac (unchanged):**
  - Ratings for 10–20, and whether the cap rises above 7 there.
  - The Deep Line has no road onward: end of the game, or a loop?
  - `aim8` beyond worlds 1–2.
  - The Deep Line's long westbound drop.
  - The fractured placement: a reflected emerald reached by keepsake rifts (proposal in the progress doc).

## 7.275.1: The Climb, the apex and the outer circuit, worlds 15–20 (the Deep Line to Sunspire)

The hourly routine (worlds 15–20, then the fractured worlds), run 1. Progress, proposals and next steps:
`docs/plans/climb-worlds-15-20-progress.md`.

- **Worlds** (`scripts/climb/spec.mjs`, appended after 14): 15 The Deep Line, 16 Thunder Cliffs, 17 The Landing Shores, 18 The Colony,
  19 The Path to the Palace, 20 Sunspire Palace. Unrated, so Room by Room's order; secrets from Precision Course parts 140–199;
  errands miner, sailors, birthday, mother, pilgrim, garden. Builds emit to `scripts/climb/.cache/worlds15/`, then are copied into
  `.cache/worlds/` for `--assemble` (worlds 1–14 come out byte-identical).
- **All six are in the page and connected:** the crown's five roads into the Deep Line, the outer circuit 13–16–17–18–19–20–14, and
  spokes 16–8, 17–4, 18–2. Reserved: 19–1 (needs an Outskirts arrival junction) and 20–7/5/3 (need Sunspire's mid-world sockets;
  proposal in the progress doc).
- **The Deep Line** returns west under its own start: a "turn" connector drops 48 tiles into Westbound's ceiling (61 tiles of fall in
  all), and `spec.reserve` keeps its five-mouth arrival's ground free. Its last platform has no road onward.
- **Builder** (`build-climbs.mjs`), each reached only when every older option fails, so 1–14 rebuild as before: a tunnel over a ceiling
  onto a fire on a cart; the turn connector; up-shafts further along the floor; a fire set above its footing counts where the knight
  settles; `connector()` no longer throws for a 4-tile side shaft (it was skipping every errand-door shaft after the first);
  `spec.secret.wide/shaft/hosts` (opt-in: thick ceilings, chosen hosts); `spec.reserve`; drop-connector tapes recovered for cached
  roads. Road cache keys moved: rebuild 1–14 with `--reuse-road`.
- **Geography:** `SIDE` overrides 13–16 and 20–14; anchors 15–20; a third arrival mouth per side (18, 26, 34); a departure with no road
  onward hangs below its floor; a departure entered from above opens its first road at the lower tier; a terminal exit taller than a
  mouth stays open its whole height, and `bladefall-pcore.js`'s walking seam honours that height (the Sea Terrace). The road order
  13–16, 11–15, 13–15, 10–15 sets the Deep Line's mouth heights.
- **Art:** world themes deepline, cliffs, shores, colony, palace, sunspire; passage styles rail, cliffs, shores, colony, sunpath,
  sunspire.
- **Checks (20 worlds):** footprints, projected terrain (62), folds (124 seams, 31 passages), contained worlds, traversal (31 corridors,
  98 junction roads), runtime (179 seams, 247 tapes), resume (62), mouth views (124), junction regressions (98), co-op: all pass.
  `page-check` 15–20: every road OK at 0 deaths; every branch entered, rewarded, its way back reversed. `feature-check` OK.
  Screenshots looked at.
- **One failure left:** `verify-climb-geography-journeys` asserts every trip is under 10 s; 13–15 into the Deep Line takes 10.05 s
  (its third tier of mouths). Two other layouts I tried made a junction road stall the walker, which is worse. A fix is in the
  progress doc.
- Scripts `?v=7.275.1` (pcore, atlas, passages, worlds, geography, geography-build, art, passage-art); cache `bladefall-v439-deep-line`;
  `./build-deploy.sh` run. Not committed.
- **Decisions for Isaac:** ratings for 10–20; whether the cap rises above 7 there; the Deep Line has no road onward (end of the game, or
  a loop?); `aim8` beyond worlds 1–2; the Deep Line's long westbound drop; the fractured placement (a reflected emerald reached by
  keepsake rifts, proposed in the progress doc).

## 7.274.0: The Climb, the crown, worlds 10–14 (Emberdeep to the Abyss King)

Isaac: "make the rest of the game, one level at a time… go ahead and go through abyss king." Built on Codex's connected Emerald Ascent (see `LLM-HANDOFF/EMERALD-ASCENT-TRANSITIONS.txt`), extended rather than rebuilt.

- **Worlds:** 10 Emberdeep, 11 Ember Colossus, 12 The Inversion, 13 The Void Tyrant, 14 The Abyss King (`scripts/climb/spec.mjs`).
  - **Order:** Room by Room's designed order, because Isaac hasn't rated these regions yet; the card says "not yet rated".
  - **Errands:** quota, automaton, neighbours, figure, alarm.
  - **Secrets:** from each region's Precision Course part (X–XIV): Cooling Road, First Stroke, The Other Floor, Out and Back, Hold the Door.
  - **Hearts:** Cinder, Anvil, Prism, Ledger, Tide.
  - **Music** (the main game's): Embers of the Weary Forge; The Obsidian Foundry with Forge of the Molten Colossus; Chamber of Inverted Gravity; Paradox Void Assault with Iron Oath; The Black Procession with A Crown of Ashes. The Right Hand duel (`k14-hand`) plays Iron Oath.
- **Map:**
  - Five new roads: 9–10 The Cinder Stair, 9–11 The Foundry Shaft, 9–12 The Upturned Gallery, 10–13 The Ledger Breach, 12–14 The Drowned Approach.
  - Atlas positions and anchors come from the emerald coordinates. The Deep Line (15) and the outer circuit stay reserved.
  - Junction names: Pour Gate / Cinder Landing, Ladle Rest / Foundry Mouth, Upturned Crown / Hanging Vestibule, Ledger Summit / Fissure Court, Drowned Throne / Drowned Steps.
  - `SIDE` override in `bladefall-climb-passages.js`: 10–13 opens on the right of the Pour Gate and arrives on the left of the Fissure Court. Emberdeep ends under its Deep Stair, so the left-hand projection overlapped it. A corridor's two mouths must face apart.
- **Art:**
  - `bladefall-climb-art.js` has themes ember, foundry, inversion, citadel and throne: skies, silhouettes (forge chimneys, cranes with ladles, hanging upside-down towers and prisms, ledger towers with void cracks, drowned columns), stone detail, and rising embers, sparks, pages or bubbles.
  - `bladefall-climb-passage-art.js` has corridor styles cinder, foundry, prism, void and drowned, plus region colours 10–14.
- **New capability: a road that ends by dropping** (World 11's Last Pour exits down).
  - The atlas crossroads is placed under the room and entered from above (`entry:'up'`) in atlas, passages and geography-build.
  - The view sets a knight crossing its top edge just inside it.
- **Builder:**
  - Downward doors try rooms shifted sideways.
  - A new drop connector (`connector('down')`), with no fire. An errand blocked past its first room retries with a shaft at its door, 4–20 tiles, keeping a height that leaves a way back.
  - Rooms may share one row of wall (`sharedWall`).
  - Secrets may use any road section when the middle ones are full.
  - An errand may loop back into its own last room by its entrance (cost 20). `--trace` logs each placement rejection.
  - Unrated worlds get null difficulty. `--assemble` skips worlds not built yet.
- **Checks:**
  - All of Codex's geography verifiers pass on the 14-world map. Their counts now follow the number of atlas links:
    - 34 projected corridors clear;
    - 68 mouths render true destinations;
    - 105 directed seams;
    - 168 original challenge tapes exit with zero deaths;
    - every link is walked both ways, 8.4–10.0 s between hearths.
  - `node scripts/climb/page-check.mjs N` for all 14 worlds: road OK; every errand and secret entered, rewarded and walked back in reverse. The road check now skips the arrival and departure junctions.
  - The deploy folder serves worlds 10–14.

## 7.273.41: The Climb, co-op checked on the connected map; plan for worlds 10–20

Isaac asked me to study how Codex got the connected world working (`LLM-HANDOFF/EMERALD-ASCENT-TRANSITIONS.txt`, `emerald-ascent-map.html`), make sure co-op works as he asked, and prepare for worlds 10–20 without starting them. Touch controls on the APK come next.

- **Co-op** (`public/bladefall-climb-coop.js`):
  - Only joining puts you in your partner's world. Later world changes no longer pull the other player along (Isaac: "explore at our leisure").
  - A partner in a folded passage is placed along that passage's route between its mouths (`mapPos`/`partnerLocal`), not in the off-map fold space; the arrow and drawing use it.
  - The co-op status line moved above the hint line, because the top left carries the landmark title.
  - Checked in two tabs (`node scripts/climb/feature-check.mjs`):
    - link, seeing the partner, hold T within a world, across worlds and into a passage (landing clear), N ×3, and "Your turn";
    - the host stays put when the guest changes world;
    - `verify-climb-geography-coop` passes.
- **Worlds 10–20:** `docs/plans/climb-worlds-10-20.md`.
  - Room by Room has all 11 regions built, with routes; ratings are missing except five rooms of region 13.
  - 23 new links. Junction capacity overflows at the Deep Line's arrival (3 on one side) and Sunspire's (4).
  - Sunspire needs mid-world sockets (entrances along its climb). The Outskirts needs an arrival junction for the 19–1 spoke.
- Script URL `bladefall-climb-coop.js?v=7.273.41`; cache `bladefall-v435-coop-explore`.

## 7.270.0: The Climb, rewards you pick up, co-op, skips, Briar Run, springs, pits, walking back

Isaac's playtest of 7.269:
- the bonus rooms need a point (unique items, quest rewards, or a Celeste-heart-like tracker);
- drop-through must be taught before a bonus room needs it;
- Briar Run should need two pods, not three;
- co-op with a friend: each clears every section, sees the other do it, may go ahead; hold T to teleport to the partner;
- "see intended route" must not skip the room;
- three skips per world on N;
- springs shoot you forward into a wall instead of up;
- "Glass Ladder found" appeared with no item;
- a blank floor in the Clockwork Defector kills;
- you can't go back past a fire in Broken Causeway; dashing between rooms hits an invisible wall in Black Woods.

- **Rewards you pick up** (`bladefall-climb-view.js`):
  - Each secret's far end holds its world's heart (`HEARTS`: Lantern, Moss, Cog, Wind, Ash, Bell, Iron, Frost, Glass); each quest's holds its keepsake.
  - The item sits on the room's own route, about 22 frames before its way out (`routePath`). Touch it to claim it.
  - Once taken it stays as a faint outline. Come in the back way and it's sealed.
  - The world list shows ♥ and ◆ counts; the end card lists the secret's heart.
- **Drop-through lesson:** standing on a one-way ledge over a drop shows "↓ + jump: drop through" until you've used it once (`save.dropUsed`). The first one is the Lookout's shaft cap in World 1, before any bonus room.
- **Briar Run (World 2)** now has two pods: the third (25,4) is removed and the second moves from (17,6) to (22,7); the bank is unchanged. It uses `spec.patch`, plus a two-cut route found by the beam search with the blade (`spec.tapes`, read into `EXTRA_TAPES`). Room by Room's own room is untouched.
- **Springs:** `g.springUp` (`bladefall-pcore.js`) sends the knight straight up, centred on the spring.
  - The builder no longer opens tiles from other stretches of a passage that runs alongside, which caused the holes, pillars and misplaced walls beside springs.
- **Pits** below an open floor are drawn as black falling away, no longer like rock.
- **Walking back:**
  - Works through any open entrance, walking, jumping or dashing, as long as the knight's body is in the opening.
  - A room whose entrance needed no tunnel (Broken Causeway's "0 rock" joins) has no seam, so its open edge counts as the way in. That was the invisible wall.
- **Watch the intended route:** when the route reaches the exit, the room resets and says "Your turn".
- **Skips:** N moves you to the next road section's fire, three per world, with an HUD counter. Not in quests or secrets.
- **Co-op** (`public/bladefall-climb-coop.js`, new):
  - PeerJS, using the main game's bundled `peerjs.min.js`, with 4-letter codes; `?coop=local` uses a BroadcastChannel for two tabs.
  - Each player has their own run and the partner's knight is drawn live (teal, "P2"), with an edge arrow when off screen.
  - Starting a world brings the partner along.
  - Hold T (36 frames) to fold into light beside the partner. A quest or secret entered that way is sealed.
  - The view exports `drawKnight`. The climb view exposes `teleport`, `sectionOf`, `defOf` and `announce`.
- **Checked:**
  - `node scripts/climb/page-check.mjs N` per world: roads at 0 deaths, items picked up by touch, ways back walked in reverse, drop home from secrets.
  - `node scripts/climb/feature-check.mjs`: co-op link, hold T, N ×3 then refused, the route handing the room back.

## 7.269.0: The Climb, branches are places to explore, never shortcuts (worlds 1–9)

Isaac on 7.268: "get rid of the verifiers and speed this up"; launches are janky ("make it realistic, like the knight hits a spring"); ways back that "take you to future parts of the level" are disliked; "No shortcuts — I want them to open distinct areas of the map that you can personally explore (basically extra levels with a reward at the end, similar to strawberry rooms in Celeste)". He wants it to feel like one interconnected world.

- **No launch.** The 7.268 launch is gone. A branch's way back is a passage you walk; a spring (map char `s`) sits at the foot of any climb of three tiles or more.
- **Back only to where you came in** (`passage(..., targets)` in `scripts/climb/build-climbs.mjs`).
  - Targets are the branch's door room, then the branch's own first room by its entrance. A secret usually loops back into itself near its fire.
  - Last resort: the road one or two sections behind the door, never ahead. Used once, World 5's errand.
- **Walkable both ways.**
  - Passage pieces are real rooms again, carrying `entry` and `seam`; backtracking uses `def.entry`, with an 8-frame grace in passages.
  - The opening where a way back comes out can be gone into: it walks the passage the other way (`settleInside` keeps him from bouncing straight out of an exit edge).
  - The reward only counts when you come in by the branch's door (`st.branchVia`).
  - Pieces are named "<branch> · the way back" and kept out of the pause menu's room list (`bladefall-pcore-view.js`).
- **Drop-through.** `g.dropThru`, set by the climb view: down + jump on a one-way ledge (`=`) falls through it (`bladefall-pcore.js`: `p.dropT`). Every capped shaft you came up, on the road or into a branch, is a way back down. Doors only take a rising knight.
- **Builder.**
  - Passages are cut three tiles either side of each turn (no slivers). A way back may cut through up to four tiles of wall or ceiling, may use an edge already in use if it keeps clear of its openings, and gets a second, wider search only when the first fails. A* uses a heap.
  - **Road cache:** `scripts/climb/.cache/road-N-<key>.json`. `--reuse-road` takes the newest one. `--emit DIR` / `--assemble DIR` build worlds in parallel. Worlds are emitted to `scripts/climb/.cache/worlds/` (/tmp was wiped by a reboot).
- **Checked:** `node scripts/climb/page-check.mjs N [shots]`, one quick pass per world.
  - Every road plays with 0 deaths.
  - Every branch is entered by its door, gives its reward, and its way-back opening walks it the other way.
  - From a secret's entrance, drop-through lands you back in the door room.
  - Known artifact: replaying the builder's recorded passage inputs drifts a frame in some branches. The builder proves each piece passable; it is not a game fault.
- Long verifiers were not run (Isaac).

## 7.268.0: The Climb, Isaac's playtest of worlds 1–2: launches, seamless branches, eight-way blade

Isaac's report (worlds 1–2):
- invisible walls at the holes where passages come down (Outskirts rooms 3 and 7; he wants to go up and explore);
- entering A Bell for the Camp, and Black Woods 4→15 and 6→11, "glitches" (a visible transition);
- a death near "the shortcut" respawned him in mid-air in a top-left corner;
- the long walk after the Bell Tower is tedious (he asked for a speed launch);
- Black Woods "levels" 12–14 and 16–21 are tunnel pieces, and some kill you instantly;
- the oathblade should hit in each direction of the dash.

- **Passages are launches, both ways** (`bladefall-climb-view.js`: `launchPath`, `startLaunch`, `stepLaunch`):
  - Out of a branch's far end, the reward is claimed and the knight darts along the passage to the road (a BFS over the passage tiles, eased, at most 84 frames, with a streak).
  - Up the hole in the road, he darts the other way, to the branch's far end. If letting go there would kill him, he goes on to its fire instead (checked by simulation).
  - The reward is only for coming in by the branch's door (`st.branchVia`).
  - Passage rooms are no longer in the chapter's room list (`bladefall-climb.js`). They are drawn from `w.rooms` via `CL.def`/`defOf`, so they can't be jumped into or died in.
- **Seamless entries.**
  - The camera no longer cuts when the chain changes; it only cuts for a jump of more than 420 px (the pause list).
  - `CL.carry` lets a knight rising through a floor opening hang below the room's edge (`room.h-1`; the core kills at `room.h+2`), so a ceiling door no longer pops him up by his height. Door entries keep him rising.
  - The builder hangs branches from the host as played (seam open), and finds a new side or door route if the old one needed the seam's wall. The Black Woods errand entrance had shifted him 16 px.
  - Measured: every entry moves the camera at most 3 px and the knight at most 8.5 px per frame.
- **Eight-way oathblade:**
  - The room flag `aim8` is read by `bladefall-pcore.js`: the strike follows the stick in all eight dash directions, with down only in the air, and diagonal strike boxes.
  - Set by `spec.aim8` for worlds 1–2 only; Isaac extends it after his playtest. No other content is affected.
  - All World 1–2 rooms re-proved with it.
- **Nothing closes behind you in worlds 1–2** now. `w2-kitchen` and `o1-cut` stay open.
- **Built:**
  - Worlds 1, 2 and 5 rebuilt with this builder; 3, 4 and 6–9 keep their 7.267 build. Their rebuild was stopped while the machine was loaded.
  - Their roads (0 deaths) and launches (both ways, alive, no free reward) pass in the page with the new carry.
- **Checked in headless Chrome:**
  - all 9 roads, 0 deaths;
  - all 18 branches launch both ways;
  - entries are smooth;
  - walking back, persistence and Mara work;
  - the room lists show real rooms only;
  - the diagonal cut is drawn.

## 7.267.0: The Climb, interconnected and persistent (worlds 1–9)

Isaac asked for worlds 1–9 to be fully interconnected and persistent, with no softlocks. His reports: Mara vanishes when caught; the Bell Tower dead-ends behind spikes; the Camp Echo door shuts again; seams close behind you (Watcher's Cut).

- **Every branch has a way back.** Each quest and secret ends in a return passage to the road (`passage()` in `scripts/climb/build-climbs.mjs`).
  - The passage is A* through rock, cut into straight `pass-N` segment rooms.
  - It enters through a new ceiling hole or a side-wall door in a road section, or opens straight in when the branch already touches the road.
  - Each segment and the landing are proved, including that standing still on landing is safe.
  - The reward is claimed when stepping into the passage.
  - Secrets are chosen only where a way back exists. Frostfell's errand lifts its last room on a 12-tile shaft so its flue opens into rock.
- **Persistent.** A lit stake stays lit, so its gate stays open, through deaths and after leaving and returning (`keepProgress` in `bladefall-climb-view.js`).
- **Seams stay open.**
  - The builder tries tunnels at other heights, and re-searches door and side routes with the seam open.
  - Only `s9-wheel` still closes while played (its route uses that wall); it reopens when you leave.
  - Walking back through a side opening counts only on the ground; a jump or climb beside it doesn't count.
- **Mara travels.** She runs each road section's own route until the section where she next appears, then stands there. Catching her up no longer removes her.
- **Builder.**
  - `CL.snap`/`CL.carry` carry held keys and buffered presses across seams, as the page does, so proofs match play.
  - `--only N --emit DIR` builds one world; `--assemble DIR` writes the page file. About 10 minutes per world, so build the nine in parallel.
- **Checked in headless Chrome:**
  - all 9 roads end to end with 0 deaths;
  - all 18 branches go in, pay out, and come home alive;
  - walking back works;
  - stake persistence holds;
  - Mara crosses five sections.
- Not committed.

## 7.266.0: The Climb, Isaac's fixes: walking back, connected quests, secrets, Mara on foot, no softlock

- **Walking back.** Seams stay open, so you can walk back into earlier sections, but only through the opening itself. Ten rooms whose own routes need the wall their seam cuts close it while you play them (`closeWhilePlayed`, detected by the builder) and reopen as you leave. A branch's far end always reopens.
- **Quests are physical branches.** A side door carries you straight into the quest's rooms. Where the road is in the way, a generated connector shaft lifts the branch clear. Reaching the last room's exit claims the keepsake; that edge becomes a wall, and you walk back.
- **Secrets.** Each world has one ceiling-corner opening (found by search, mid-world) into a harder-than-average room from the matching Precision Courses part, locked to that world's kit:

  | World | Secret room | Opening above |
  |---|---|---|
  | 1 | Hang Time | o1-cut |
  | 2 | Read the Colors | w2-descent |
  | 3 | Glass Ladder | c3-upper |
  | 4 | Double Cut | u4-kites |
  | 5 | Shell Road | m5-road |
  | 6 | Lantern Flight | k6-weight |
  | 7 | Back Door | g7-engine |
  | 8 | One at a Time | f8-court |
  | 9 | Undertow | s9-refuge |

  Reaching its end saves "Secret found" (`bladefall.climb.v1` secrets). The actual reward is still to decide.
- **Outside the sections is drawn as solid rock,** so nothing looks passable that isn't.
- **Mara walks the ground** (steps up, drops down, stops at high walls) and vanishes once out of sight.
- **Camp Echo's shaft rest is narrowed** (spec `patch`), so you can't strand yourself under the shut gate.
- **Checked in headless Chrome:** all 9 roads with 0 deaths, all 9 quests (door → branch → keepsake at the far end) and all 9 secrets (door → room → found).
- The build takes about 25 minutes now (the branch searches).
- The cache is `bladefall-v382-climb-branches`.

## 7.265.0: The Climb — worlds 1–9 as continuous places (Merge Pitch B), from Isaac's ratings

Isaac's favourite merge is Pitch B (Frostfell as one scrolling climb, with a fire at the start of each section). He asked for the existing worlds to be remade that way using his room ratings:
- **The ratings:** `docs/playtest/room-reviews-2026-10-01.csv` and `.json`, 134 Room by Room rooms through Frost Sorcerer, difficulty 1–10 and fun 1–5.
- **The rules:** easy first, nothing above 7 in the game yet, and the hard rooms kept for later.

Plan and tables: `docs/plans/climb-worlds.md`.

- **Where.** Title → Merge Pitches → **The Climb · worlds 1–9** (`precision.html?pitch=climb&world=N`). Room by Room, the Precision Courses and the other pitches are unchanged.
- **How it plays.**
  - Each world is one continuous place: its Room by Room rooms are sections set side by side or stacked where each exit leads. The camera follows over the whole world, and the sections around you are drawn where they sit; those behind look as you left them.
  - Walking out of a section carries you into the next with your speed. Its opening (a tunnel, a capped shaft up through the floor, or a hole in the ceiling) closes behind you at its fire.
  - A death returns you to that section's fire, and only that section resets.
  - Every section keeps its own rules, bosses and intended route; no core physics changed.
  - Quests leave by their side doors and come back. Keepsakes are shared with Room by Room's save.
- **What the ratings did.**
  - Seven rooms rated 8–10 are kept for later; they still play in Room by Room.
  - Biting Canopy (7) is kept for later too: too hard for world 2.
  - Within worlds, harder rooms move towards the end where the story allows.
  - Daro's errand waits for Windcut Gallery. Elsie's and the creature errands each lost a room.
  - Worlds now run 1–3 / 1–5 / 1–6 / 1–4 / 1–6 / 1–3 / 1–4 / 1–3 / 1–4.
- **Open (in the plan):** the curve still falls after world 5, because the later worlds lack 5–7 material. Many fun-1 sections are kept but listed for possible trimming.
- **New files:**
  - `scripts/climb/spec.mjs`: the world orders and what is kept for later. This is the one to edit.
  - `scripts/climb/build-climbs.mjs`: `npm run build:climb`, or `npm run verify:climb` to re-prove every seam and route and check the page file is current.
  - `public/bladefall-climb.js`: the registry and the seam carry.
  - `public/bladefall-climb-worlds.js`: generated, about 225 KB.
  - `public/bladefall-climb-view.js`.
- **Shared view hooks** in `bladefall-pcore-view.js` (no-ops elsewhere): `PV.camera` and `PV.drawWorld`; `drawOther` and `palettes` exported; a multi-room static cache keyed by `room.rev`.
- **Checked:**
  - Every world played through every seam in headless Chrome, with 0 deaths, including the four bosses.
  - Rowan's errand runs through its door and back, and the keepsake is saved.
  - Regressions: Precision Courses, Room by Room, Pitches A and B, touch (14) and merge-pitches all unchanged.
- **Versions.** `VERSION` is 7.265.0 and the `sw.js` cache is `bladefall-v379-climb`. The climb files sit after `bladefall-rbr-view.js` in `sw.js`, `build-deploy.sh` and `precision.html`.
- **Room by Room's hourly task** (`bladefall-2d-redesign`) is disabled and was not touched. If Room by Room's rooms change, rerun `npm run build:climb`.

## 7.264.0: Room reviews and Room by Room (the whole game in Merge Pitch A's format), in progress

Isaac picked Merge Pitch A and asked for the whole game in that format: the 20 base regions, then the 20 Fractured. He also asked for optional quests with rethought rewards. The work runs as the hourly scheduled task `bladefall-2d-redesign`.
- **Docs.** Plan, standards, region table and progress log: `docs/plans/room-by-room.md`. Brief for building one region: `docs/plans/room-by-room-brief.md`.
- **Where it is.** Title → Merge Pitches → **Room by Room · the whole game** (`precision.html?pitch=rbr`, `&region=N`). Nothing else changed for players.
- **Region 1, The Outskirts, is built.**
  - 12 road rooms. Pitch A's rooms are kept; Mothlight moves to Black Woods because its pods need the blade.
  - Rowan's bell, an optional two-room branch up the old tower.
  - Mara's survey: three optional bearings.
  - It plays end to end in the real view.
- **Regions 1–24 are playable and on the page** (351 rooms with quests). Isaac asked to continue through all 40 and explicitly permits Precision Course reuse when it forms a coherent level. The pending Claude 8–11 batch was reviewed and corrected; 12–24 are now integrated. Thunder Cliffs includes its three Hydra releases; Fractured Outskirts includes the weaponless three-bell Sentinel and Mara/Rowan echoes; Fractured Woods includes a counterweight-bound blade, wind-clock resin crown and Elsie’s echo. All 351 rooms pass spawn-idle and delayed-input routes; new regions/branches pass in the real view. RBR23 adds three crush-only Iron Echo courts and Silas’s echo; RBR24 adds breathing thermals and the Cartographer’s echo. Next: RBR25 Fractured Marksman (charter directory24), then26–40. Version7.264.0/cachev378. Avoid concurrent editing.
- **`verify-rbr` also checks** that idling at every spawn is safe and that every tape finishes when started 14 frames late (the real view's idle). It caught Black Woods' Rootbound Passage spawning the knight on wall thorns.
- **Room reviews (Codex, 1 Oct).** Default on in Room by Room: each normal or quest room exit asks difficulty 1–10, fun 1–5, and “Something seemed off” with optional note. Shared card in `bladefall-pcore-survey.js`, separate `bladefall.rbr.survey.v1` storage. Region menu → Room reviews toggles/exports. `node scripts/verify-rbr-survey.mjs` checks real browser flow, ratings persistence, frozen simulation, quest return/reward and final room. Route screenshot scripts explicitly turn reviews off in their isolated browser.
- **Rewards.** A finished quest gives a named **keepsake**. It changes what you see (Rowan's bell hangs at the camp) and opens that person's **echo**, an optional sealed branch, in the Fractured counterpart.
- **Region 13 boss.** `bladefall-pcore-dev-rbr-tyrant.js` (+ view) fires telegraphed horizontal bolts. Portal returns at the lit band break a ward; three rooms change the alignment, and the last needs two returns. `node scripts/verify-rbr-tyrant.mjs` checks intended wins and failure without portal input. No shared core physics changed.
- **Authoring improvements (Codex).** `rbr-find` scores gravity rooms in screen coordinates; `--plain` forbids expert movement; `--require event,event` keeps intended routes using their devices. RBR scenery is drawn in screen space under gravity, and NPCs support `ceiling:true` and an optional display `name`.
- **Core change (opt-in, per room):** `side` (a second exit, for quest branches), `lock` (verbs not yet earned) and `g.sideSealed`. All 282 earlier taped rooms replay identically (`scripts/pcore-digest-all.mjs`).
- **View exports** `goRoom` and `persist`. The HUD numbers only road rooms.
- **New files:**
  - Runtime: `public/bladefall-rbr.js` (registry and manifest of 40), `public/bladefall-rbr-view.js` (wraps `BladefallPitchView`; saves under `bladefall.rbr.v1`) and `public/bladefall-rbr-NN-<key>.js` (generated).
  - Tooling: `scripts/rbr-src/` (sources, `gen.mjs`, `build.mjs`), `scripts/rbr-lib.mjs`, `rbr-find.mjs`, `rbr-skip.mjs`, `verify-rbr.mjs` (`npm run verify:rbr`), `rbr-shot.mjs`, `rbr-branch-check.mjs` and `pcore-digest-all.mjs`.
- **Local package.** Rebuilt `netlify-deploy`: all 334 packaged assets match source, all 13 menu entries load, reviews default on, no browser JavaScript errors. Not deployed.
- **Versions.** `VERSION` is 7.260.0, and the `sw.js` cache is `bladefall-v374-room-reviews`. New region files go between the `rbr-regions` markers in `sw.js` and `build-deploy.sh`, and into `FILES` in `bladefall-rbr.js`.

## 7.258.0: the new physics on mobile (touch controls, swipeable menus) and an Android APK

Isaac wants to play the Precision Core on his Galaxy S23 Ultra: on the website first, then as an installed app from an APK. Design, deviations and checks: `docs/plans/mobile-touch.md`. App build and install: `android/README.md`.

- **Touch controls.** `public/bladefall-pcore-touch.js` (new) provides them; Isaac's suggested gestures are the defaults.
  - Left thumb: a floating stick.
  - Right thumb: tap jumps, swipe dashes (8-way), hold grabs (cling and climb; lantern pick-up and throw), double-tap parries.
  - Two fingers: a swipe strikes and a tap fires the portal.
  - Pause and retry buttons sit top right, and Android back pauses.
- **Where the gestures deviate, and why:**
  - Jump waits about 65 ms (longer if the thumb is moving) to tell a swipe from a tap.
  - A tap gives a full jump; short hops are an option.
  - Throwing the lantern is a second hold, not a tap.
  - By a wall or lantern, the thumb waits to see tap or hold, so clinging never jumps first.
- **Touch controls card (the mobile keybinds).** Presets (Gestures / Gestures + buttons / Buttons), a gesture or on-screen button per action, jump height, swipe distance, fixed or floating stick, left-handed swap, size, opacity, vibration, the reminder, and full screen.
- **View changes** (`bladefall-pcore-view.js`; all no-ops without touch):
  - input merged on game time (`currentInput(dt)`);
  - device-pixel rendering at an integer scale on touch screens (5× on the S23);
  - gesture wording in room hints, with long hints wrapping to two lines;
  - swipeable chapter pages with tabs, and Controls opening the touch card;
  - no focus ring under a thumb;
  - Android back pauses or steps back.
- **`precision.html`:** mobile meta tags and the manifest link, touch CSS, a portrait "turn sideways" card, and service-worker registration (top-level page only).
- **APK.** `android/` holds `AndroidManifest.xml`, one Java class (a full-screen WebView serving `assets/www` from `https://appassets.bladefall/`) and `build-apk.sh`, which uses no Gradle (`npm run build:apk`).
  - Output: `android/dist/Bladefall-7.258.0.apk` (352 MB, almost all music; signed with `android/bladefall.keystore`, keep it for updates). `android/build` and `android/dist` are git-ignored.
  - Toolchain, installed with Isaac's approval: `brew install openjdk@17` and `brew install --cask android-commandlinetools`, then `sdkmanager "platforms;android-34" "build-tools;34.0.0"` with the SDK licence accepted. The `temurin@17` cask needed sudo, so the formula was used.
- **Versions.** `VERSION` is 7.258.0; the `sw.js` cache is `bladefall-v372-touch`. `npm run verify:touch` is new: 14 headless-Chrome checks emulating the S23, all passing.
- **Not yet done:** the APK has not run on a real device or emulator. Isaac's S23 is the first.

## 7.257.0: Merge Pitches (three playable prototypes of the new physics carrying the base game)

Isaac asked to see the new physics applied to the base game "like a merge", with the Outskirts and Frostfell as examples. **Title → Merge Pitches** offers three prototypes. Nothing in the campaign changed. Plan, room table and open calls: `docs/plans/merge-pitches.md`.

- **A · The Outskirts, room by room** (`precision.html?pitch=outskirts`). Six linked screens that slide into each other with no wipe: Verge, Camp Echo, Watcher's Cut, Hollow Mile, Mothlight Descent and the Gatehouse.
  - Vey, the sentinel, Olan and Mara stand in the rooms and speak when the knight walks up.
  - Mara's bearings (ASH, GLASS, IRON) are the tally stakes that open each room. Her chart fills in on screen and appears on the end card.
- **B · Frostfell, one mountain** (`precision.html?pitch=frostfell`). One 120×46-tile room with a following camera.
  - Ice, the wind duct, an updraft, feathers and the galleries make one climb.
  - Five hearths keep your place (death respawns at the last one). Nim follows the knight's path.
- **C · The road itself** (base game). A Level Select–style Outskirts session from Hollow Mile. Two pockets (x 7440–8720 and 9640–10920) hand the road to the new physics in place:
  - the camera pulls back about 2× until the stretch fills the screen;
  - the pocket is a transparent `precision.html?pitch=pocket-…` frame laid exactly over the world, with its floor on the road's ground line;
  - walking out of its right edge puts the knight back on the road.
- **Core change.** A room may now be bigger than a screen (`cols`/`rows`, default 40×23). The view adds a following camera for such rooms.
  - All 273 taped rooms replay identically: the frame-for-frame digest matches the pre-change core.
  - `npm run verify:precision-core` and `verify:precision-parts` were rerun.
- **New files:**
  - `public/bladefall-pcore-pitches.js`: rooms and tapes. They register only when the URL has `?pitch=`, so the menu, level numbers and gate trials never see them.
  - `public/bladefall-pcore-pitches-view.js`: `BladefallPitchView`.
  - `public/bladefall-merge-road.js`: the menu and Pitch C.
  - `scripts/verify-merge-pitches.mjs`: `npm run verify:merge-pitches`.
- **Hooks in shared files.** Each is one line, and each is a no-op outside pitches:
  - **View:** `palette`, `background`, `draw`, `hud`, `holding`, `exit`, `chapterDone` and `menu`. `SV()` is null on pitch pages, and the backwall is skipped in pockets.
  - **`index.html`:** `saveRunAtStage` returns early on `G.mergeRoad`, so the Continue save is untouched. The title gains a "Merge Pitches" button.
  - **`bladefall-respec-renderer.js`:** `drawHeroAt` skips a knight with `p.mergeHidden`.
  - **`bladefall-gate-trials.js`:** `bypassed()` honours `G.mergeRoad`.
- **Versions.** `VERSION` is 7.257.0. The `sw.js` cache is `bladefall-v371-merge-pitches`, and the late pcore files are re-synced at 7.257.0 via `scripts/pcore-sync-page.mjs`.
- **Checked in headless Chrome at 1280×720:**
  - A: all rooms, slides and bearings, then the card.
  - B: all five hearths, and respawn at a hearth.
  - C: title → menu → both pockets → back on the road → end card, with no page errors.
  - Regressions: the Precision Courses menu still has 218 chapters with no pitch chapters; level 1 and a gate trial play; `?pitches` opens the menu.
- **Open for Isaac:** which direction, if any, to take further, plus the two questions in the plan doc.

## 7.256.0: Precision Core difficulty survey (owner review tool)

Isaac wants to reorder the precision levels by difficulty and theme. This is the data-gathering step; nothing has been reordered yet.

- **What it does.** `public/bladefall-pcore-survey.js` (new) is switched on from the main menu (Difficulty survey) or with `precision.html?survey`.
  - Every level counts its own deaths, time and retries from zero, and notes "watched the intended route", per room. It also records whether the level was cleared before and which assists were on.
  - After each level, a card asks for difficulty 1–10 and fun 1–5, with optional flags (out of place, feels like a repeat, weak, found a skip) and a one-line note.
  - In the menu, each card shows its survey result instead of best deaths.
  - Export downloads `precision-survey-<date>.csv` and `.json`. Put them in `docs/playtest/` for the reordering pass.
- **Where the data lives.** Its own localStorage key, `bladefall.pcore.survey.v1`. The normal save (cleared levels, shards, best deaths) is never touched. Gate trials never show the survey.
- **View hooks.** Ten one-line calls in `bladefall-pcore-view.js`, all through `SV()`, which is null in trials or when the file is absent: start, frame, death, retry, watch, level done, and the menu tag and button. `precision.html`, `sw.js` (cache `bladefall-v370-precision-survey`) and `build-deploy.sh` list the new file.
- **Checked in headless Chrome:**
  - Rate, save and store work. Per-room counts are right for level 1 (3 rooms) and level 200 (6 rooms), including a death and a retry.
  - The menu tag and the "n/218 rated" counter update.
  - Export writes both files.
  - With the survey off, the normal end card appears. A gate trial shows no survey.
  - No page errors.
- **Next, once Isaac's ratings are in:** group the levels by difficulty and theme, then renumber. The gate ranges in `bladefall-gate-trials.js` must move with the renumbering.

## 7.254.0 — Precision Core levels 75–199 (Parts VII–XX)

Isaac asked for levels 75–200 following `docs/plans/precision-levels-75-200.md`. A morning run drafted the device modules and most part files, then stopped. The 13:04 scheduled run (session c2900fd8) had eleven builders finish one part each. Level 200 and the bonus sets belong to the 15:04 run (7.255; see `docs/design/precision-parts/PART-CAPSTONE-AND-BONUS.md`).

- **Levels:** 125 levels, 75–199, in 14 parts, one region each, with 141 rooms.
  - VII Gaol: jailers, pressure pods. VIII Frostfell: ice, wind, the frost feather. IX White Court: freezing water, currents.
  - X Emberdeep: heat slabs on a clock. XI Foundry: anvils, belts, moulds. XII Inversion: gravity prisms. XIII Citadel: spent footholds, then the echo.
  - XIV Throne: echo, wake, re-aimed portals. XV Deep Line: carts, switches, boost strips; 149 is a three-room Act 1 finale.
  - XVI Thunder Cliffs: hook rings and moving decks. Act 2 opens here.
  - XVII Landing Shores: the tide and floats; super, hyper and wavedash are taught again. XVIII Colony: watch lights, smoke.
  - XIX Palace Path: beams, mirrors, louvres, the Switchback Engine. XX Sunspire: light through portals; 199 is the summit.
  - Each region's two gates in `GATES` already pointed at these ranges.
- **Files:** each device's module is `public/bladefall-pcore-dev-*.js` with a `-view.js` drawer. Parts are in `public/bladefall-pcore-part-NNN-*.js`, loaded through `bladefall-pcore-parts.js` (`addPart`). The page is synced by `scripts/pcore-sync-page.mjs`. Tools are in `scripts/pcore-author/`.
- **Engine:** `bladefall-pcore.js` changed only in the morning run: a device registry, and thorned faces no longer give a wallbounce. Parts I–VI are unchanged and still pass.
- **Checks:**
  - **Room checks:** each part has `scripts/verify-precision-part-NNN.mjs` with routes, a wrong-strategy family for every room, and adversarial beam searches for skips. `npm run verify:precision-parts` runs them all with the device fixtures.
  - **Results this pass (21:45):** device fixtures 50/0. Every part passes: VII 25, VIII 29, IX 31, X 30, XI 36, XII 35, XIII 34, XIV 36, XV 44, XVI 38, XVII 39, XVIII 33, XIX 36, XX 38. That is 2–10 minutes per part on a loaded machine.
  - **Core suite:** `verify:precision-core` passes 438. Its only 2 failures are br3 and br6 in the 15:04 run's unfinished relay bonus set.
  - **Replays:** every 75–199 tape also replays from a reset room, the way the pause menu's "play the intended route" does. Chapter index equals level number for 1–199.
- **What the searches caught:** dozens of skips in the morning drafts were fixed by changing rooms, not checks. Hyper and wall-climb skips were the most common. A few checks were narrowed where a found route still answers the room's question: 98a, 161, 163, 165, 168, 189a, 189b, 199a and 159b. Each part doc says why.
- **For Isaac to judge:**
  - **87 Kite** removes the dash for the room (`dashes:0`).
  - **108 and 113** keep hyper skips, because momentum is optional before 150.
  - **113** borrows Emberdeep's heat slab, and two-thirds of its screen is blank rock.
  - **159b:** a hyper plus a wall-jump off the jailer's body still reaches his front. Closing it needs jailer bodies to refuse a grab.
  - **Thunder Cliffs** requires ring and deck momentum, but supers and hypers are taught only at 160+.
- **Engine quirks found:**
  - You can wall-jump off a thorned wall while touching the thorns.
  - You can jump out of water you have only just touched.
  - Floats start low even when a tide begins high.
  - Builders designed around all three. Fixing any of them means rerunning every part.
- **Docs:** `docs/design/precision-parts/PART-VII.md` … `PART-XX.md` have each room's question, the wrong answers with counts, what the player feels, and the designs that were dropped. The working brief is `BRIEF.md`.
- **Build:** cache `bladefall-v369-precision-75-199`. Not committed and not deployed. No human playtest of any level past 74.

## 7.255.0: Precision Core level 200 and three bonus sets (Oren's Relay, Void Stone, Crossings)

- **Level 200, The Summit Road.** Six rooms, a checkpoint each:
  1. lantern through a floor door;
  2. freezing a water wall;
  3. an anvil while upside down;
  4. a cart's speed carried by the echo;
  5. a portal fling into a hook ring;
  6. light and the lantern through one portal.
- **Bonus sets** have menu labels instead of numbers (`bonus:true`):
  - **Oren's Relay (R1–R6):** the companion device's first levels.
  - **Void Stone (V1–V6):** a new device, `bladefall-pcore-dev-void.js`, glyph `V`. A dash travels straight through it and comes out with the dash back and the speed kept.
  - **Crossings (C1–C6):** devices from different regions meet.
- **Files:** `public/bladefall-pcore-part-{200,901,902,903}-*.js`, `scripts/verify-precision-part-{200,901,902,903}.mjs` (all green), and docs in `docs/design/precision-parts/` (PART-200, BONUS-*). The index is `PART-CAPSTONE-AND-BONUS.md`, which also lists the engine issues found and designed around.
- **Relay device:** three bug fixes (mid-air hold, hovering, walking through shut doors).
- **Page:** `pcore-sync-page.mjs 7.255.0`. Checked in headless Chrome: menu order and labels, and all 24 new rooms replay with no deaths. No human playtest yet.

## 7.253.1 — every gate opens real levels; plan for levels 75–200

- **The five placeholder gates** now open the other session's levels:

  | Gate | Region | Levels |
  |---|---|---|
  | Mantlet | Marksman | 50–54 |
  | Deadeye | Marksman | 55–59 |
  | Weight | Keep | 60–64 |
  | Grip | Keep | 65–69 |
  | Stair (optional) | Keep | 70–74 |

  No `levels:null` gates remain.
- **Checked:** headless Chrome played all five trials to "The gate yields" and saw each wall open. The trial driver now clicks "Next" and replays in one step, because Part VI's timed rooms desync when real-time frames slip in between.
- **Plan:** `docs/plans/precision-levels-75-200.md` (guideline only).
  - The rest of Act 1 gets about 8 levels per region, 75–139. The Deep Line gets 140–149. Act 2, where momentum lives, gets 150–199, plus capstone 200.
  - Principles: the mirror rule, two gates per region, the sawtooth, a difficulty ceiling, and a base↔precision exchange list.
- **Build:** cache `bladefall-v368-gates-complete`.

## 7.253.0 — Precision Core Part VI · Portals and Everything Before (levels 60–69); Loop and Let Go gets a gate

Isaac liked Part V and Momentum. He found one skip in Loop and Let Go (56): you could dash over the first jump. He asked for a coin-like fix that makes the intended route necessary, and it should make sense to the player. He then asked for the next ten levels: portal puzzles integrated with the earlier mechanics, with new portal ideas or expansions left to Claude.

- **56 Loop and Let Go.**
  - A tally stone now hangs over the pit where only the loop's flight passes, and it opens a gate at the exit.
  - A super, a hyper or a jump-dash still crosses the pit, but the gate stays shut.
  - All of Isaac's skip family (super, hyper, jump-dash-strike, wall climb, one drop) now fails.
- **Part VI (60–69), one room each, pairing portals with an earlier idea:**
  - 60 Spring Loaded: spring.
  - 61 Behind the Cyan: machinery. One dash clears the stone and takes the bridge; a mid-air dash brings the bridge back.
  - 62 Bell from Afar: bolts relayed into a sealed bell, then a lantern climb on the bell's beat.
  - 63 Parry Through: parry a bolt up into your portal.
  - 64 Lantern Flight: two passes with the lantern, the first for height and the second for speed.
  - 65 Tally Tour: loop and let go twice.
  - 66 Moth Flight: pogo while flung.
  - 67 Hold the Door: shoot through a door only you can hold open.
  - 68 Ram Breach: drop into an arena and let the ram's charge break the wall.
  - 69 Everything Before: door, loop, tally gate and moth in one flight.
- **Engine.** A knight carrying the lantern keeps its slow glide when flung. The fling's no-drag sideways speed still applies. This is one line in `bladefall-pcore.js`.
- **Menu.** Part VI heading. Momentum is now chapters 70–74, still labelled X1–X5.
- **Gate Trials** (the other session's file, not edited): Weight → `[60,64]`, Grip → `[65,69]`, Stair (Momentum) → `[70,74]`.
- **Design doc:** `docs/design/PORTALS-AND-MOMENTUM.md` (Part VI section, dropped designs, gate table).
- **Dropped designs:**
  - Stone Drop: the knight could follow the stone and skip it.
  - Its Own Shot: a parry sends a sentry's shot straight back without the portals.
  - Barrier Order: it reduced to "who goes first".
- **Build.** Cache `bladefall-v367-part-six`. Local build only; no human playtest.

## 7.251.2 — close-view zoom setting

Settings → Zoom adjusts the close view in steps of 90 / 95 / 100 / 105 / 110%, saved as `meta.viewZoom`. The visible height runs from 444 units (90%) to 363 units (110%); 100% stays at 400. Checked in headless Chrome at 1280×720, and the Settings menu lists all five options. Cache `bladefall-v366-view-zoom`.

## 7.251.1 — close view by default; the party is quiet on Up

- **Close view (new default).** The base game frames a fixed 400 world units of height, whatever the window size. The knight stands about a ninth of the screen tall. The width follows the window's aspect: 640 units at 16:10, 711 at 16:9.
  - How it works: `applyViewScale()` sets LittleJS `canvasPixelRatio` to 400/innerHeight, and the canvas is stretched back over the window with pixelated scaling. The DOM HUD keeps its size.
  - To switch back: Settings → View → Wide (fits window), saved as `meta.viewScale`. TAS runs and `index.html?view=wide` keep the old one-unit-per-pixel view.
  - Level work: with this view a long gap (full-kit reach is 671) can be wider than the screen at 16:10. Check readability in the close view.
- **Olan and Mara no longer answer Up.** Up is for looking and striking upward. The lamp-bearing Olan also no longer speaks Bram's lines.
- **Checked:**
  - Headless Chrome at 1440×900, 2560×1440 and 900×900: the same framing each time, and the camera still follows vertically (Updrafts at y 1500).
  - The region tests are unchanged: the same 47 failures, the same set.
- **Build:** cache `bladefall-v365-close-view`.

## 7.252.0 — Precision Core Part V · Portals (levels 50–59) and Momentum X1–X5

Isaac asked for a Momentum run (X1–X5: the two old Momentum rooms plus four new ones, relatively easy, with X5 ending on a super then a hyper where missing either kills you) and for portal levels (50–54 with one portal, 55–59 with two). His decisions:
- **P** is the portal key and pause stays on Esc/Start. On a pad, **RB** is portal and Y stays the blade.
- One key alternates blue and orange, with the next colour shown on the knight.
- Which creatures can pass through portals is left to Claude.
- Part V is portals; Momentum comes after it and keeps being pushed back.

**Code**
- New `bladefall-pcore-portals.js` and `-portals-view.js`.
- In the core: the `%` portal stone and `!` barrier line, the portal input, the fling state (no air drag above a run, fall up to 420), and fall-height memory into a floor end.
- In the view: the portal action and bindings (a migration moves an old P/RB pause binding to portal), a Part V heading, and chapter labels (the menu shows X1–X5).

**Rooms:** 14 new, generated as before.

**Checks**
- `verify:precision-core` adds portal-rule fixtures and a wrong-strategy family for every new room. The count is in `TESTING.md`.
- All 16 X/Part V rooms replay to their exit through the page. There are no console errors.

**Gate Trials:** `bladefall-gate-trials.js` was not edited. Mantlet → `[50,54]`, Deadeye → `[55,59]`, Stair → `[60,64]` (the X1–X5 chapters).

**Build:** cache `bladefall-v365-portals`. Local build only; no human playtest.

**Design doc:** `docs/design/PORTALS-AND-MOMENTUM.md`.

## 7.251.0 — Gate Trials: the Precision Core inside the campaign

Abyssal walls crash down across the road and are answered in the Precision Core, which opens in a frame over the world. Olan and Mara join the knight.

- **Outskirts:** Olan's Gate (levels 1–5; help or be kicked in) and Mara's Gate (6–9).
- **Black Woods:**
  - Hale's Gate (10–14).
  - Bram's Gate (15–19). Bram hands his truth-lamp to Olan, who then carries it as the Thicket escort, and Mara runs ahead.
- **Causeway:** behind the Drop Yard door (20–24), and across the road west once the Brute dies (25–29).
- **Updrafts:** behind wind gates 1 and 2 (30–34, 35–39).
- **Marksman:**
  - The Watch Gate right after Mara at the start (40–49).
  - Mantlet and Deadeye gates placed, levels not built.
- **Ruined Keep:** Weight and Grip gates behind doors 1 and 2, levels not built. The optional Stair Gate, with Idris the Bell-Sweeper, stands on the return stair, not behind door 3, because the Keep Key there completes the stage.
- **Unbuilt gates** let the knight through for the current visit.
- **Code:**
  - New `public/bladefall-gate-trials.js`.
  - Trial mode in `bladefall-pcore-view.js` (`?trial`, reported to the host by `postMessage`).
  - Five `index.html` hooks and two respec-renderer draw hooks.
- **State:** `meta.gateTrials`, with a session copy in Level Select.
- **Gates count as open** in TAS, co-op and `?gates=off`.
- **Checked:**
  - Headless Chrome drove a fresh campaign through the four story gates and 19 levels, plus the help, kick and leave/resume paths and every later gate.
  - The region tests show no new failures: 48 of 194 fail with gates off, 47 with gates on.
- **Build:** cache `bladefall-v364-gate-trials`. Local build only; no human playtest.
- **Docs:** plan, decisions and the remaining 24 levels in `docs/plans/gate-trials.md`.

## 7.250.0 — Part IV · Foes: both combat sets merged into levels 30–49

Isaac asked for Claude's Foes and the other session's Combat Rooms to be merged into one Part IV so future levels can use both, with overlaps kept as variations. Levels: 30–39 are the easier ones and 40–49 the harder ones, capped at The Living Stair and Stepping Ram.

- **Cuts (Isaac's calls):** Borrowed Wings, Bait and the old Bank Shot. Kept instead: Moth Wing, Aim Above and Make a Breach.
- **Return to Sender** is one two-room level (GPT's room, then Claude's *Up the Shaft*).
- **Second Wind** is reworked: the first shot comes almost at once, there is a second falling line, and a platform sits between the two lines.
- **New rooms:**
  - Shieldbreaker (37), Knock It Over (38) and Moth and Coil (39) mix both sets;
  - Wardens' Hall and a strict-schedule Bank Shot (48).
- **Engine:**
  - One parry, armed in the core (`parryStep`, using GPT's timings), plus a core study beat (`g.awake`). GPT's nine recordings replay frame-for-frame identically.
  - Contact rule: attacks hurt; bodies hurt only if thorned, and thorned bodies wear pale spikes.
  - Returned shots cross between the sets (coils, husks, shellbacks, enemies), and charges break both kinds of wall.
- **Structure:** the chapters file places GPT's rooms by `{ref}`, and the combat-rooms file resolves them. Menu part "Part IV · Foes"; the main-game button is renamed.
- **Checks:** `verify:precision-core` passes 204/204, including 13 shared-rule checks and 18 Part IV wrong-strategy families. `verify:combat-rooms` passes 34/34 on the nine rooms. All 22 Part IV rooms replay through the page.
- **Build:** cache `bladefall-v363-part-four`. Design and level table: `docs/design/FOES.md`. Local build only; no human playtest.

## 7.249.0 — Precision Core: controller menus and rebindable controls

Isaac asked for the Precision Core to work on a controller and for keybinding changes. Only `public/bladefall-pcore-view.js`, `precision.html` (styles, script version) and `sw.js` (cache `bladefall-v362-precision-controls`) changed; the simulation and every room are untouched. Every action (move, jump, dash, grab, strike, parry, retry, pause) now holds a list of keys and a list of controller buttons, saved in `bladefall.pcore.v1` under `binds`; defaults equal the old hard-wired map. Controls screen (main menu and pause menu): select a chip to remove it, "+ key" / "+ button" captures the next input (6 s timeout, Esc or B cancels), a binding already in use moves to the new action with a note, and each device has its own reset. Fixed and never rebindable: the left stick moves and aims, Esc pauses and backs out, and menus always answer arrows / d-pad / stick, Enter / Space / A and Esc / B, so no bindings can lock a player out. All overlays (chapters, pause, assist, controls, chapter card) are navigable by keyboard and controller with spatial focus; Start / the pause binding backs out of submenus. Action buttons held when a menu closes are ignored until released, so the A that picks a chapter is not a jump. A controller input now takes over an intended-route replay. The last-touched controller is used; button names follow Xbox, PlayStation or Nintendo layout from the pad id. Room hints and the combat prompt show the player's current bindings (controller names while a controller is in use). Verified: `verify:precision-core` 182/182; a simulated standard gamepad drove menu navigation, controller and keyboard capture, conflict moves, removal, persistence, pause/back, the latch, stick movement and a rebound jump in the browser. Release check: only the four prior failures. Mirror rebuilt. Not committed, not deployed; not tried with a physical controller.

## 7.248.0 — Precision Core Foes: Claude's combat-as-platforming take (10 rooms)

Isaac asked for an independent answer to the combat brief (HK + Celeste + Nine Sols; one weapon plus parry; small fry that are part of puzzles), to compare with the other session's Combat Rooms. New module `public/bladefall-pcore-foes.js` (simulation) and `-foes-view.js` (sprites). The other session's combat files were not read. Five small fry: moth, shellback, spitter, ram and husk. Two verbs: the blade answers bodies (pod rebound, pogo, flip a shellback into a step); the parry (F, 9-frame ward) answers attacks (aimed bolt return; stops a ram dead into a standable block) and returns the dash. Two levels under a new menu part "Foes": *First Blood* (5 introductory) and *Hunting Ground* (5 easy/medium). Core engine: four additive hook lines (`BladefallPrecisionFoes` reset/before/after, `foeSolid` entity); view: one draw hook and the menu part. `npm run verify:precision-core` 182/182, including 11 foe wrong-strategy families; all ten tapes also replay through the page view. Cache `bladefall-v361-precision-foes`. Design, roster and proposals for the main game: `docs/design/FOES.md`. Local build only; no human playtest.

## 7.247.0 — Precision Core Part III: ten medium-to-hard levels

Twenty-one new rooms in ten levels (Glass Maze, Cutting Garden, Parity, Heavy Stone, Lamp Keeper, High Wire, Stonewright, Lantern Rails, The Engine, Third Summit), medium to hard, no new objects and no engine change. They lean on rules that were always true but never asked for: down-pushes drive a stone into a pit; a lantern inside machinery holds it open; only the lantern fits under a low roof; the push counts as a flip. Menu adds "Part III · The High Road". 69 rooms / 30 chapters, plus the ten combat rooms another session added (their `-combat*` files and stamps untouched). `npm run verify:precision-core` 161/161, including 27 Part III wrong-strategy families. State-based checks now require no deaths: a lit stone survives in the event log after a respawn, which had faked 34 "alternates" in Unbroken. All 21 Part III tapes also replay to their exit through the real page view. Release check: only the four prior failures. Cache `bladefall-v360-precision-part3`. Local build only; no human playtest yet. Room table and what the sweeps caught: `docs/design/PRECISION-CORE.md` → Part III.

## 7.246.0 — Precision Core Part II: ten more levels

Twenty-one new rooms in ten levels (Round Trip, Thorn Garden, Gears, Masonry, Lamplight, Rails, Foundry, Keep of Tallies, Clockwork, Second Summit), easy to medium, no new objects — each combines Part I ideas and names one question. Menu groups chapters into Part I, Part II and Optional (Momentum moved last). One engine fix: touching pieces of one machinery colour share a body, so a stone sealed in a pillar no longer lets side pieces turn solid around the knight; machinery draws under small objects. 45 rooms / 20 chapters. `npm run verify:precision-core` 104/104 (every room's tape exits with no deaths; every puzzle room's wrong-strategy family fails). Cache `bladefall-v356-precision-part-two`. Local build only; no human playtest yet. Room table: `docs/design/PRECISION-CORE.md` → Part II.

## 7.245.0 — Precision Core: a new physics and puzzle rooms built on it

New standalone engine and page: Title → Precision Courses → **Precision Core · new physics** (`public/precision.html`). Integer-pixel, fixed-60 Hz, one 320×184 screen per room, one dash that refills only on ground / crystal / struck pod, Celeste-style forgiveness (5 coyote frames, 4-frame buffer, corner correction, wall-jump reach, lift momentum) and emergent super/hyper/wavedash/wallbounce. Ten chapters, 24 rooms: Footing, One Dash, The Blade, The Tally, Switchback, Slide Stones, Seed Lantern, Hold On, Summit, Momentum (optional). Each puzzle room's tempting wrong strategies are machine-checked to fail. Files: `bladefall-pcore.js` (simulation, no DOM), `-rooms.js`, `-tapes.js`, `-view.js`. Campaign, precision courses and Workshop untouched apart from the new menu button. `npm run verify:precision-core` 62/62. Release check: only the four prior failures (it now also accepts scripts referenced by `precision.html`). Mirror rebuilt, cache `bladefall-v355-precision-core`. Local build only; no deployment; no human playtest yet. Design, room questions and limits: `docs/design/PRECISION-CORE.md`; diagnosis that motivated it: `docs/design/PUZZLE-GAP.md`.

## 7.244.0 — three tabs, fourteen approvals, puzzle candidates

Base Bank=[16,13,14,15]. Fractured Bank=[6,7,8,9,11,17,19,20,22,24]. Candidates=[10,18,12,21,23,25,26,27,28,29]. Retired0–5 remain internal only. Stage44 length129380; thirty internal / twenty-four visible rooms. Active stage count unchanged. K/KF are freely steered two-chapter flights, M has a first-root brake release and visible dormant curls, OF has downward-diagonal approach perches, Q is longer with four cable docks. New R/S/T/U/V implement dash-state decisions, lantern ballast, recorded return steps, dash-awakened thorns and a programmable return carriage. New public module bladefall-precision-puzzles.js.

Both bank menus contain twenty written campaign placements. These do not change permanent unlock order or insert banked layouts into campaign stages. Details: docs/charters/celeste/WORKSHOP-244-PLACEMENT.md. Fourteen approved object fixtures and tape hashes remain protected. Current verification commands/evidence and legacy limitations are in TESTING.md. Local build only; no deployment.

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

## 7.237.0 — Precision Workshop A–F

Six selectable stage-44 experiments: linked rails, vein-exit vault, collapsing footholds, gravity prisms, aether crosswinds, dash ricochet bells. Title → Precision Courses → Precision Workshop; pause picker and completion replay/next. Three Standard-object extensions and three new-object/old-ability combinations. Standard/Fractured layouts unchanged. Aerth Crystalline Trials. See docs/charters/celeste/PRECISION-WORKSHOP.md and evidence/workshop. Local only, not published.

## 7.236.0 — precision jump and music fix

Restored double jump in the Standard Dash Foundry opening. Standard uses Aerth’s Towering Sea Cliffs; Fractured uses Through the Void Breach. Course geometry unchanged. Added airborne second-jump and both music-cue checks to the Foundry verifier. Local build only.

## Dash Foundry prototype — 7.235.0 / bladefall-v345-dash-foundry (2026-09-28)
Standard Precision Course now begins with one new room: committed eight-direction dash, a finite airborne charge/refill, dash-driven shuttle and momentum jump, then an aether vein with a required exit redirect. Prototype controls are confined to this room. Fractured has no new clone; all previous layouts remain unchanged apart from Standard's positional translation. Both favorite relay input tapes and all Fractured tapes are unchanged. Local mirror rebuilt; not published.

New opening, negative-route and eight-direction contracts, native keyboard/UI, geometry preservation, complete Standard/Fractured replays and shared two-player routes pass. See `docs/charters/celeste/DESIGN-PLAN.md` and `npm run verify:dash-foundry`. Standard now has 19 rooms (7,641 replay frames), Fractured nine (4,017); zero retries. Existing four release-check failures remain. Real internet performance and human difficulty are not claimed.

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

## Opening roads and Fractured precision — 7.232.0 / bladefall-v342-early-platforming (2026-09-27)
Reviewed and retained Claude's resident upgrades and compact bell scaffold. New timed cradle/blade crossings in stages 0/1/2 and harder relays in 21/22/25; early Fractured kits cannot import later abilities. Silas has a brake/lift/strike/return-fence quest with visible governor and escort outcomes. Base crossings open shared return walkways; personal retries and carrier launch receipts stay independent in co-op. Quiet first-three resident conversations are accessible. Local build rebuilt; not published.

Six legal crossing routes and independent replays pass without retries; disabled-impulse replays fail. All three opening quest routes, 60 side-story branches and 77 focused units pass. Co-op issue regressions, new bridge/carrier/Silas contracts and every-active-stage world construction pass. Desktop/mobile captures reviewed. Real-network performance and full campaign/human balance are not claimed. Release checker retains its four known editor-reference/size failures. Details and evidence: `docs/charters/early-platforming/PLAN.md`.

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

## Opening quest refresh — local 7.230.0

Outskirts and Black Woods now have authored remote bell/lantern routes, physical ballast prerequisite, kitchen repair, distinct resident art/props, natural dialogue and animated outcomes. See `docs/charters/opening-quest-refresh/PLAN.md` for full verification and known release-check limitations. 72 focused units, 60 dialogue paths, both movement routes, desktop/mobile presentation, shared quest state and three reported co-op issue regressions pass. Local mirror rebuilt, not published.

# Current state — 2026-09-26

Rewritten in place; the per-region table and engine orientation live in
[`NEXT-MODEL-BRIEF.md`](./NEXT-MODEL-BRIEF.md). History before 7.134 is in
`HISTORY-BRIEF-7.103-TO-7.133.md`; 7.134–7.166 in the owner's Claude Brain session logs.

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

## Production status
Act 1 is built end to end: fifteen reachable regions (stage 14, the Gilded Vault, was cut on
2026-09-20 and its slot is inert), the v4 pixel renderer and v4 rules (`V4_LAST_STAGE=15`) on the
whole critical path, and an Act 1 ending (ship parts → westbound Deep Line → Throne beach → boat
→ "ACT TWO / The Thunder Cliffs" card, whose Continue now sails into **Act Two's stage 16, Thunder
Cliffs** (7.188.0), whose helm casts off onto **stage 17, the Landing Shores** (7.189.0), whose gate
is walked into **stage 18, the Colony** (7.190.0), whose road is walked up **stage 19, the Path to the
Palace** (7.191.0), whose Sun Gate opens into **stage 20, Sunspire Palace** (7.192.0): the King in
Daylight, the hydra, the ride, END OF ACT TWO. Act Two is built and refined end to end. Act Three's twenty
rift shards gate twenty constructed and refined echoes (stages21–40); the Palace closes
the act. Owner playtesting remains distinct from scoped automated verification.

Owner-accepted: the opening through the Warden, Frostfell, the White Court (beaten, then made
harder), the Inversion rebuild. Built and awaiting the owner's next playtest: Emberdeep, the
Foundry and Colossus (7.164 fixes), the Inversion's Last Breath, the Paradox Citadel (7.166
restore), the Drowned Throne (7.157 fixes) and the Deep Line (7.150/7.157 fixes). Automated
success is never owner acceptance.

## Source identity and verification
- Local `public/index.html` **7.227.0**; `public/sw.js` **bladefall-v336-coop-together**. Deploy mirror rebuilt. Production remains the separately identified deployment below.
- `main` = `16b3408` (tag `act-1-draft`), pushed to GitHub; `chore/track-authoritative-tree` is at
  the same commit. 7.169.0 is live on bladefall.netlify.app (deploy 6ab2ae5f, from `netlify-deploy/`; the site id is f8c7b854…, not the one in `.netlify/state.json`).
- Full suite **847 tests / 825 pass / 22 fail** (7.169.0); the 22 are the long-standing baseline set,
  identical by test name (list in the brief's Harness section).
- `release:check` reports only astra-respec.js / fable-respec.js (standalone pages, by design).

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

## Preceding construction — 7.210.0 / cache v293 (2026-09-24)
Stage 30, the Fractured Emberdeep: the Pour Schedule walked backwards (the slab ahead melts first), the Slag Stair up a
wet forge wall, the Command Post (Companion Command, no one to command), and the C-side, the Purge (a sweep of fire
faster than a run, survived only on the slabs it cools as it passes). Renderer: `trap` and `spikes` ask the region's
art first. Tests: the fifteen stage tests that pinned `V4_LAST_STAGE` by regex now check a minimum. Not committed or
deployed.

## Earlier change — 7.209.0 / cache v292 (2026-09-24)
Stage 29, the Fractured Sorcerer: the Glassworks (the bridge over the void frozen only on the beat of the stream you
route through the anchor), the Petition Gallery (the intake in a band of slate high on the wall), and the C-side
pattern boss, the Mirror (its own spell back through your mouths, then countered, then countered into a mouth).
Fixed in stages 27–29: bars under a wall are now as wide as the wall (a jump and a dash rose through the Frostfell
Toll's stone). Renderer: `runeEmitter` asks the region's art first. Not committed or deployed.

## Earlier change — 7.208.0 / cache v291 (2026-09-24)
Stage 28, the Fractured Frostfell: the Toll (tollmen opened only by a countered thrust), the Thaw Streets (thin ice
that cracks in half a second over meltwater), the frost memory (the double jump), the thawing Frozen Stair over the
void, and the C-side pattern boss, the Rimeguard (the drill, the feint, the thaw — every opening a countered
thrust). Not committed or deployed.

## Earlier change — 7.207.0 / cache v290 (2026-09-24)
Stage 27, the Fractured Warden: the dark Blind Gallery (turnkeys under a roof too low to jump; dash through the lunge,
strike the back, the bay's bars lift), the Hush Engine's thin air over the void with unbraked bars, the Turning Cell
(a mouth that rides the cage), and the C-side pattern boss, the Sentence (dash through its rush and strike its back;
then only its own rush, thrown through your mouths, opens it). Renderer: `rotor` and `lowg` ask the region's art
first. Not committed or deployed.

## Earlier change — 7.206.0 / cache v289 (2026-09-24)
Stage 26, the Fractured Keep: twin-mouth momentum, the keystone to its dock, the Grip, the wet Archive, and the C-side,
the Belfry (throw the bell-stone through your mouths into a swinging cradle). Not committed or deployed.

## Earlier change — 7.205.0 / cache v288 (2026-09-24)
Stage 25, the Fractured Causeway: masses on hoists, the Drop Yard plate, lifts over the void, the Longbow, and the
C-side pattern boss, the Iron Echo (bait its committed charge into a buffer; drop a mass on it; three). Engine:
`spawnEnemy` scales echo bodies by their source stage and rolls no elites in echoes. Not committed or deployed.

## Earlier change — 7.204.0 / cache v287 (2026-09-24)
Stage 24, the Fractured Marksman: the region's own watch archers (sightline, lock, lead by the flight), the slick
tower, the works gate opened by a returned arrow, the Windcut launch, and the C-side pattern boss, the Tallyman (the
count; the Reckoning sent home through your mouth). Full suite 990 / 923 / 67 — exactly the 7.201 failing set. Not
committed or deployed.

## Earlier change — 7.203.0 / cache v286 (2026-09-24)
Act Three's shared core (`bladefall-fractured.js`) and two more echoes: stage 22, the Fractured Woods (C-side: the
Mirror Thicket, climbed on the beat of the wind) and stage 23, the Fractured Updrafts (the thermals breathe; C-side:
the Lung). One renderer hook (a region draws its own updrafts). Scripts: `register-echo.py`, `repin-stage-counts.mjs`,
`fractured-music.py`. Full suite at 7.203: 983 / 916 / 67 — exactly the 7.201 failing set (co-op runtime tests are timing-flaky). Mirror
rebuilt. Not committed or deployed.

## Earlier change — 7.201.0 / cache v284 (2026-09-24)
Act Three begins: the rift shards (twenty, off the road, a ledger and a gate), the Fractured Outskirts (stage 21:
a B-side of the first road and the Mile Sentinel's C-side, a weaponless pattern boss), and Level Select's Fractured
tab in place of the NG+ tiers. See `docs/plans/act-three.md` and the brief's "Latest pass". Full suite 969 / 902 / 67: the 61 baseline names plus six that fail on the other agent's 7.193–7.200 edits, already in the tree before this pass (checked against my pre-pass snapshot): muster-recall ×2 (the Muster's standards removed), outskirts-stage ×3 (its Up-interaction and quietV4 lines rewritten), ruined-keep-v4 ×1 (interactEchoMachine). Two of mine — hooks that assumed `window` inside functions tests lift into sandboxes — were fixed and pass. `release:check`: only the four known failures. Mirror
rebuilt. Not committed or deployed.

## Earlier change — 7.200.0 / cache v283 (2026-09-24)
Sunspire refinement: distinct routed light/charging seals, unblocked puzzle rays, longer harmless
King setup previews, physical helper contact, full blink windup and visible flare reach. Saved
blooms and yielded King persist visually. Animated Hydra boarding leads to the existing ending.
35 focused tests and targeted browser fixtures; stage 20 charter states evidence and limits.
Prior Colony/Path refinements retained. Local mirror rebuilt, no commit/deployment.

## Prior Act Two build — 7.192.0 / cache v274 (2026-09-24)
Act Two's last region: Sunspire Palace — light through portals (three locks), the colony's water sent
home, the King in Daylight (two-sided touch), the hydra's warning and the ride that ends the act. See the
brief's "Latest pass" and `docs/charters/20-sunspire/DESIGN-PLAN.md`. Code: `public/bladefall-sunspire.js`
+ `-art.js`; in index.html the usual registration lines (level table, music, V4 boundary, journey cap,
two script tags) and one new one, the `dayking` enemy row. Full suite 927 / 860 / 67: the 61 baseline names; the stage 16/17 tests' V4 regexes (fixed after: the five Act Two stage files pass 43/43); one load-sensitive co-op test (passes alone); and three that fail on another agent's concurrent index.html/renderer edits made during this pass (the Muster's recall standards removed — muster-recall ×2; a new void-slime rung in the Void Tyrant's climb — void-tyrant-stage), not this pass's and left alone. `release:check`: only the four known failures. Mirror rebuilt. Not committed or deployed.

## Earlier change — 7.191.0 / cache v273 (2026-09-24)
Act Two's fourth region: the Path to the Palace — the mirror stair, the hydra overlook, the Sun Gate —
plus MENDED in every stage, the forsaken path's sick fighting for the King, and Level Select path
choices for 18-19. See the brief's "Latest pass" and `docs/charters/19-palace-path/DESIGN-PLAN.md`.
Code: `public/bladefall-palace-path.js` + `-art.js`; one new page hook (`BladefallActTwo.everywhere(dt)`)
and the Level Select handler's `pickPath`. Full suite 916 / 853 / 63: the 61 baseline names plus two co-op tests that fail only under full-suite load (both pass alone). `release:check`: only the four known failures. Mirror rebuilt. Not committed or deployed.

## Earlier change — 7.190.0 / cache v272 (2026-09-24)
Act Two's third region: the Colony — the glasses and the smoke, Sable's spring and the cure
(MENDED), the shackled yard and the colony's turn, the choice closing on the road. See the brief's
"Latest pass" and `docs/charters/18-colony/DESIGN-PLAN.md`. Code: `public/bladefall-colony.js` +
`public/bladefall-colony-art.js`; the act-wide cast moved into `bladefall-act-two.js` /
`bladefall-act-two-art.js`; no new page hooks. Full suite 907 / 844 / 63: the 61 baseline names, plus the zones stream-cell count (fixed after
the run: 280) and a co-op test that fails only under full-suite load (passes alone). `release:check`: only the four
known failures. Mirror rebuilt. Not committed or deployed.

## Earlier change — 7.189.0 / cache v271 (2026-09-23)
Act Two's second region and the act's one choice. See the brief's "Latest pass" and
`docs/charters/17-landing-shores/DESIGN-PLAN.md`. Code: `public/bladefall-landing-shores.js` +
`public/bladefall-landing-shores-art.js` (registered with the Act Two core, which became a region
registry and now owns the Chainhook in every Act Two region and the white flower); one-line hooks in
index.html (foes, a blade on a non-foe, grey HUD measures, camera/void floors, arrival) and the
renderer (art-tagged walls, the knight). Full suite 900 / 839 / 61 — the same 61 names as the
7.187 baseline. `release:check`: only the four known failures. Mirror rebuilt. Not committed or deployed.

## Earlier change — 7.188.0 / cache v270 (2026-09-23)
Act Two's first region. See the brief's "Latest pass", `docs/plans/act-two.md` (the owner's
decisions) and `docs/charters/16-thunder-cliffs/DESIGN-PLAN.md` (what was built, the numbers it
rests on, what was verified and how). Code: `public/bladefall-act-two.js`, `public/bladefall-act-two-art.js`,
one-line hooks in index.html and the respec renderer. Suite on an exact 7.187 tree: 884 / 823 / 61;
7.188.0 adds no failure to that set by name (see the brief's Harness). Not committed or deployed.
(Versions 7.170-7.187 were other passes; their notes are in the brief's "Latest pass".)

## Earlier change — 7.169.1 / cache v247 (2026-09-22)
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
