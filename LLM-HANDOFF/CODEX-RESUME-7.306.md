# Resume after Bladefall 7.306

Repository: `/Users/computer/Projects/Bladefall-2D Antigravity`. Hosting is Cloudflare Pages at https://bladefall2d.pages.dev, with the existing separate score API Worker. Follow `.agents/AGENTS.md`: authorized updates go to GitHub main after relevant checks; do not deploy to Netlify. Local caches/private feedback are not committed.

## Completed implementation

- Mobile Explore: held-up interaction, upward/diagonal dash, actual-exit leaderboard timing and no Walk/Skip completion choice. Undiscovered Fractured names are hidden; native selects retain touch behavior.
- Mobile Survive: swipe dash by default, button alternative; both modes have independently saved control position/size editors. Landscape viewport fills the display. World map is directly above Controls; mobile pause exposes the three skips. Bosses, finales, extended rooms, connectors and optional branches are unskippable.
- Vesper damage×3 and incoming blade/hit damage×0.25 across Merge/Kill/Forget, with direct-entry resistance retained.
- B62 reinvented; approved B63–66/F63–67 banked. B64/B66 portal faces render white. The second “B64” in Fractured feedback was interpreted as F64 Marksman; its added native arrow rain remains reviewable despite banked status.
- Ten new individually saved superrooms: B67–71/F68–72. All are imported with review access retained. 30/40 worlds now have finales; remaining worlds 10,13,14,16,17,31,33,34,36,39 are not yet authored.
- All 40 campaign worlds rebuilt into continuous physical roads: 87 ordinary imports plus 30 finales; 555 mandatory challenges; 52 compact/boss retirements. No bank checkpoint teleport links. Every challenge retains its checkpoint and all 87 optional branches retain their native relative geometry. The three retired footprints needed by branches become quiet passages.
- Co-op checked with actual PeerJS/WebRTC: partner ghosts remain visible; boss/device/heart/death/completion state remains private; following starts at the follower’s checkpoint and cannot grant a clear.

## Read first

- `docs/playtest/RELEASE-7.306.md`: release receipts, APK checksum and validation limits.
- `docs/playtest/MOBILE-EXPLORE-7.306.md`: touch/controller fixtures and Explore behavior.
- `docs/room-bank/SUPERROOMS-7.306.md`: new/revised room placement and solutions.
- `docs/room-bank/CAMPAIGN-INTEGRATION-7.306.md`: full placement table and reproducible build.
- `docs/room-bank/campaign-integration-7.306-audit.json`: structural, route and preservation results.
- `docs/playtest/COOP-7.306.json`: networked independent-player checks.
- `docs/room-bank/campaign-integration-7.306-browser.json`: all 306 real browser joins, zero deaths/errors.

## Authoring details

`scripts/climb/source-worlds-7.303.json` remains the preserved native source. `import-bank.mjs` + `continuous-bank.mjs` rebuild the current registry; successful layout caches are in ignored `.cache/continuous-bank/`, and movement proof caches are replayed before reuse. Do not run the old generator over the new registry. `check-bank-import.mjs` audits the already saved result without repeating the search.

The compiler preserves branch clusters, reserves actual atlas arrival/departure footprints, and adds visible stairs/drops for mismatched mouths. F31/F32 use a temporary ceiling approach beside the phase roof; it preserves phase0 and the opening tally. Restoring an entrance uses parsed collision/portal tiles and waits for the entire player body to clear and reach the original floor or moving checkpoint support. Backtracking derives its entrance edge from the proved previous exit, so a vertically offset side join cannot swallow a forward exit. World 24’s leftward finale requires an 80-wide upper corridor followed by a narrow drop so its atlas hall clears the earlier climb.

The only inherited atlas-footprint exception is World 38’s existing shared secret-return/arrival mouth, guarded by exact relative geometry in the checker. No new room overlaps are accepted. All 40 terminal exits are checked against their real atlas departure, with collision-free settling.

`node scripts/climb/import-bank.mjs --check` reproduces the saved forty-world registry. `--update=N` can rebuild one world from the preserved native source while retaining the other 39, but requires a complete current registry. World 35’s F25 approach preserves its original fire pedestal; do not reopen that pedestal as part of an alternate entrance.

Human room ratings and a physical handset/controller check remain the next useful work. Browser fixtures do not establish real-device ergonomics or internet latency between machines. Do not recreate the already completed Celeste reports or generate more rooms unless requested.
