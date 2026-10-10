# Bladefall 7.306 — continuous worlds, mobile controls and ten finales

The forty Survive worlds now place their imported bank challenges on physical roads through the existing geography, with an individual checkpoint for every challenge. The detached bank galleries and their checkpoint teleport links are removed. Optional branches retain their original attachment and return geometry. Thirty worlds now have a superroom finale, including the previous ten and ten new world-specific rooms.

[Superroom reviews and solutions](../room-bank/SUPERROOMS-7.306.md) · [Campaign integration](../room-bank/CAMPAIGN-INTEGRATION-7.306.md) · [Mobile and Explore evidence](MOBILE-EXPLORE-7.306.md)

Survive defaults to swipe dash, with a button alternative in Touch controls. Both modes have an editor for moving and resizing touch controls. Landscape uses the full available viewport. Explore supports held-up interaction and up-diagonal dash; native settings dropdowns retain their touch behavior. Explore’s leaderboard appears at actual forward departure, without the Walk/Skip next-world menu. Undiscovered Fractured names remain hidden.

World map sits immediately above Controls in Survive’s pause menu. Its three skips apply only to compact normal challenges, with a mobile pause button; bosses, superrooms, extended sections and optional routes are protected. Skipping invalidates a ranked run.

Vesper deals three times his former damage and receives one quarter of former hit damage for Merge, Kill and Forget. His direct-entry resistance remains. The scripted first story encounter is unchanged.

B62 is reinvented. B63–66 and F63–67 are banked following the review; B64/B66 show white portal faces. F64 adds native arrow rain on vacated perches and remains available for review. The second “B64” in the Fractured feedback was interpreted as F64, the Marksman room. The ten new candidates are integrated and retain their individual review entries.

## Validation and release

- All 117 bank room completion routes pass, including the ten new superrooms and the revised B62/F64 routes and interaction probes.
- All 306 changed campaign joins pass in Chrome with zero deaths/errors, restored entrances and continuous world position, camera and velocity. Maximum transition displacement is 8.95px within the 12px limit. F31/F32 reach their fires without changing puzzle state. [Browser receipt](../room-bank/campaign-integration-7.306-browser.json).
- All 215 closed-room route proofs and all 40 atlas departures pass. All 87 optional branches and 112 dialogue records are preserved. Rebuilding from source reproduces the saved campaign exactly. [Structural audit](../room-bank/campaign-integration-7.306-audit.json).
- Mobile/Explore: 30 touch and Gamepad fixture checks, six campaign viewport/pause/skip checks and 35 focused unit tests pass. The new/revised superrooms also have a separate zero-death browser pass.
- Co-op: all 16 checks pass over actual PeerJS/WebRTC without fallback, using the final campaign registry. [Co-op receipt](COOP-7.306.json).
- Cloudflare asset build passes with 452 static files. The signed Android APK verifies with Android v2/v3 signatures; all 446 bundled web files match the final public assets byte-for-byte.

Release: [Bladefall 7.306.0](https://github.com/isaac2055/Bladefall-2D/releases/tag/v7.306.0) · [Play](https://bladefall2d.pages.dev) · [Download APK](https://github.com/isaac2055/Bladefall-2D/releases/download/v7.306.0/Bladefall-7.306.0.apk). GitHub main feeds Cloudflare Pages; no Netlify deployment is used.

APK: `Bladefall-7.306.0.apk`, version code `7306000`, **432,864,438 bytes** (about 413 MiB). SHA-256: `916a3e0cbddd242f4802175bbc795708221f2b0ed021e1e76428b90df281d5a4`. It keeps the existing signing identity for in-place updates and bundles the game for offline play; co-op and online leaderboards need a connection.

Physical Android/iOS hardware and a physical controller are not available in this environment; the recorded touch and Gamepad API checks use Chrome fixtures. Room fun, difficulty and suitability still need your human review.
