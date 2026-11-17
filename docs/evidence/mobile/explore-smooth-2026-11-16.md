# Explore / Outskirts Smooth mobile controls

Reference: the live Ascend Smooth preset at https://bladefall2d.pages.dev/precision.html?pitch=climb&mode=play and `bladefall-pcore-touch.js?v=7.334.0`, inspected before implementation. The Godot versions on 2dvibes had already received the native counterpart; this change covers the original Explore player and its Outskirts trial.

Default touch UI now uses tap-to-jump and right-side swipe-to-dash, with the movement stick visible only while held. The checkpoint flag sits compactly beside pause, with the trial timer clear of both controls. Ability-based button gating remains in place. Explore retains its own existing movement, wall-jump and dash physics and unlock sequence. Smooth gestures do not grant dash before the game earns it.

Settings offers an on-screen-button fallback and keeps the existing layout editor. The selected preset survives ordinary new games. Trial settings and the isolated dash fixture do not write ordinary campaign saves. Input clears on cancellation, lost capture, pause, hidden page, blur and resize. Touch releases do not release physical keys. Deterministic replay/TAS stepping bypasses gesture ticks.

Verification:

- `node --test tests/explore-smooth-touch.test.mjs tests/mobile-input.test.mjs tests/2dvibes-*.test.mjs`: 16 pass.
- Chrome iPhone landscape emulation: empty Jump/Dash button area, invisible idle stick, real tap jump, simultaneous stick movement and jump, temporary dash aim, release cleanup, stopped timer during pause, no page errors.
- Dash test uses an explicitly invalidated practice fixture with session-only abilities; it does not represent a legitimate trial clear or publish a score.
- Safari/WebKit iPhone landscape emulation: tap jump, switch to buttons and successfully jump, switch back to Smooth, simultaneous keyboard input, and unchanged seeded ordinary-save bytes.
- `node scripts/playtest-release/check-cloudflare-assets.mjs`: passes, 1,891 assets.
- Broad `node --test`: 1,106 pass and 101 fail. The exact pre-change HTML produces the same 1,106 passes and the same 101 named failures, including missing jsdom and pre-existing isolated-function fixture errors. No new failure appears. This does not claim the full legacy suite is green.

Reproduce the Chrome integration check with `node scripts/verify-explore-smooth.mjs BASE_URL` after installing the repository's existing dev dependencies. Physical-phone playtesting remains open.
