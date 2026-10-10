# Bladefall 7.304 — campaign integration, mobile and Explore finale

Release target: [bladefall2d.pages.dev](https://bladefall2d.pages.dev/). The signed Android build is distributed through the [7.304 GitHub release](https://github.com/isaac2055/Bladefall-2D/releases/tag/v7.304.0), with its download directly below Leaderboards on the title screen.

## Survive campaign

The forty-world campaign has 548 main challenges: 451 retained native rooms, 87 approved ordinary bank rooms, and all 10 existing superrooms. Thirty-nine simple or repetitive native challenges were retired. Boss fights, quest/secret routes, and individual room checkpoints remain. Old saves at a removed checkpoint move to a named surviving checkpoint.

The [integration guide](../room-bank/CAMPAIGN-INTEGRATION-7.304.md) records every cut, placement and rationale. Imported puzzles retain their approved geometry and room-specific movement rules. Changed joins use explicit checkpoint passages so inherited momentum or held controls cannot spoil a room's opening. Return through passage is a pause-menu action.

The [next-ten proposal](../room-bank/SUPERROOMS-NEXT-10-7.304.md) has five Base and five Fractured finales, including six boss finales. These are plans only. Survive's eventual Vesper/Echo ending remains deferred.

## Menus, scores and independent co-op

Survive appears above Explore and is the default leaderboard mode. Continue still opens the last-played mode. Survival's pause menu puts World Map first, optional routes inside Room Select as O1/O2 tiles, and Return to title last.

Each Survival time records hearts collected during that run. The heart ranking prioritizes collection, then time; the API retains both a player's fastest run and their best collectible run. Already-owned hearts can be collected again for a fresh attempt, but only once per run. Changed courses start leaderboard season `playtest-2026-10-v2`; earlier local records, feedback and queued submissions are archived and included in backup exports. Completion requires the player's own required-room clears; a fresh timed run cannot borrow historical clears.

Survive co-op is a race with visible partner ghosts. Devices, portals, enemies, collectibles, deaths and completion remain local to each player. Following a partner into an unfinished room places the visitor at their own authored checkpoint, invalidates the timed trial, and does not grant the partner's solutions.

**Public leaderboard syncing is live.** The API Worker and persistent SQLite storage are deployed, and production Pages is connected through `PLAYTEST_API`. The public endpoint returns the current season's JSON, the live browser board loads it, Android GET/preflight access passes, and foreign-origin preflight is rejected. Private feedback export remains disabled until its optional organizer secret is configured. Offline scores and feedback remain queued for automatic retry. Cloudflare's production configuration contains the binding; preview configuration is unbound. See [deployment evidence and maintenance](PAGES-API-7.304.md).

## Input and Android

Keyboard movement normalizes letter case in both modes, including saved bindings. Survive's controller mappings remain supported; Explore now polls standard controllers for movement, combat, utility combinations and menus. Fresh mobile installs use immediate action buttons, a responsive stick and release-sensitive short jumps. Existing custom/gesture preferences are retained.

The APK packages the current `public/` game directly, works offline, follows extensionless internal links, and opens external downloads in the phone browser. Network co-op still requires a connection. APK leaderboard requests target the public API with a narrowly allowed app origin. See [Android build/install notes](../../android/README.md).

- File: `Bladefall-7.304.0.apk`, 432,785,574 bytes (about 413 MiB).
- Existing signing certificate retained; Android v2/v3 signatures verified.
- All 435 packaged game files match current public assets byte-for-byte. Hosting-only files are excluded.
- SHA-256: `6c8c5c69502d5367f77979a2ec469bbc1460adf44df72702dc9a52de6ef04661`.

## Explore conclusion

The existing World 40 boss remains. Beyond it, the first Vesper encounter is overwhelming; defeat leads to the new Final Echo duel, then Kill / Merge / Forget. Choices persist and change actual power. Merge makes the final Vesper fight viable; Kill retains extreme difficulty; Forget weakens the knight. Defeating Vesper saves Explore completion.

The finale rows display as 41 and 42, while legacy internal stage identities remain compatible. Public Level Select hides them until all forty ordinary Explore worlds are personally completed; local previews can show them. See [finale implementation and verification](EXPLORE-FINALE-7.304.md).

## Verification and limits

- All 97 imported canonical routes complete with zero deaths through actual campaign/browser hooks. All 68 changed native exits and three changed arrival passages pass. Structural checks preserve the 40-world map and quest/secret routes.
- Browser input checks cover touch, case-insensitive keyboard, and synthetic standard Gamepad input in both modes; all 14 previous gesture checks also pass.
- Sixteen co-op checks use actual PeerJS/WebRTC between two isolated browser profiles, including ordinary imports, a superroom and Fractured material.
- Fifty-six focused unit tests cover input and Explore progression/finale compatibility. Browser finale checks exercise actual defeat, retry, choice persistence and all four concluding phases with accelerated HP/Palace-clear fixtures; they are not a full unassisted campaign playthrough.
- Score checks cover fresh and repeat heart collection, slower collectible bests surviving API storage, archive preservation, invalid records and complete-world aggregation. Browser release checks cover menus, optional tiles, heart routes and both current-run completion guards.
- Android build, signature, asset parity, source syntax, Pages asset validation and diff whitespace checks pass. The public APK download returns 200, and nine deployed game files match local release hashes. Live mobile browser checks load both modes.
- Production API checks pass: JSON 200/current season, APK GET 200 and preflight 204 with the expected origin, foreign preflight 403, and unauthenticated feedback export 404. A live browser invalid POST reaches validation with 400 without writing a test score. Actual score/heart persistence is covered by the local compiled Worker/SQLite integration proof; no synthetic leaderboard entries were published.

Physical Android hardware and a physical controller have not been tested. Difficulty and comfort still need human playtesting. Current evidence is in ignored local directories `scripts/climb/.cache/integration-7.304/`, `mobile-7.304/`, `coop-7.304/`, `explore-finale-7.304/`, and `scripts/playtest-release/.cache/checks/`.
