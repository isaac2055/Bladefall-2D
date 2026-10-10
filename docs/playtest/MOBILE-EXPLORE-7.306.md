# Mobile and Explore changes — 7.306

Survive defaults to an eight-direction swipe dash, with buttons for its other actions. Controls → Touch controls retains a Buttons only preset and individual action bindings. Both Explore Settings and Survive Controls have a Move / resize touch controls editor; dragging and sizing a control changes its actual hit area. Positions and sizes are stored separately for each mode and follow viewport size. Reset layout restores defaults.

Explore accepts a brief upward stick hold for nearby dialogue and interactions. Once Dash is available, aiming straight up or diagonally up works with touch, keyboard and controller. Survive's mobile landscape view expands horizontally while preserving core room coordinates and physics; Explore fills the viewport and requests browser fullscreen/landscape on a gameplay touch. Native dropdowns retain their own touch behavior. The tap fallback now distinguishes a real click on the same control from a recent tap on another control.

Explore's reward and boss-clear hooks no longer interrupt gameplay with world-completion menus. A forward physical exit or accepted stage portal offers the leaderboard with Continue playing, without Walk/Skip next-world actions. The real Frostfell-to-Court transfer was checked. Undiscovered Fractured names remain hidden until unlocked.

Vesper deals three times his previous Blood damage and receives one quarter of previous blade/hit damage for Merge, Kill and Forget. His direct-entry resistance remains. Ordinary Merge contact now costs three Blood; its jaw snap costs six. Kill and Forget retain their much harsher nine-Blood ordinary contact. The first story-loss encounter remains its existing scripted encounter.

Survive pause places World map directly above Controls and offers Skip section with the remaining allowance. Protected sections show the reason the skip is unavailable; the underlying eligibility and skip implementation belongs to the campaign integration.

## Evidence

- `node scripts/verify-mobile-7.306.mjs`: 30 passing checks. Real Chrome touch events cover eight swipe directions, touch up/diagonal dashes, held-up interaction, button alternatives, editor dragging, relocated hit areas, dropdown focus, saved preferences, resized viewport placement, a standard Gamepad API diagonal dash, and the real Frostfell exit. Nearby sign/progress state is accelerated for focused fixtures. Size-slider and dropdown choice values are driven through DOM change events after verifying native touch focus.
- `node --test tests/explore-finale.test.mjs tests/cloaked-man-stage.test.mjs tests/rift-shards.test.mjs`: 29 passing tests, including all three damage outcomes and direct-entry resistance.
- Syntax and Git whitespace checks passed for the edited modules.
- Local evidence: `scripts/climb/.cache/mobile-7.306/receipt.json`, `survive-landscape.png`, `explore-landscape.png`.

Chrome mobile emulation is not a physical Android/iOS handset or physical controller test. Native OS dropdown rendering, orientation permission and full-screen behavior should receive a brief handset check. See [RELEASE-7.306.md](RELEASE-7.306.md) for the overall APK and website publication status.
