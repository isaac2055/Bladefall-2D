# A1 session notes — 2026-07-31

## Verified target

The current repository is:

`/Users/computer/Desktop/Bladefall-2D Antigravity`

Its canonical source reports:

- Game version: `7.8.0`
- Service-worker cache: `bladefall-v62`
- Campaign stages: `16`
- Release assets: `33`
- Source/deploy mirror parity: passing

## Localhost collision

Port `8371` was already owned by PID `66548`, launched as `node serve.mjs`
from:

`/Users/computer/Desktop/Bladefall-2D/public`

That server returned Bladefall version `6.1.0`; its `index.html` hash did not
match this repository. It was left untouched because it belongs to a different
project path.

The current repository was launched on:

`http://127.0.0.1:8372/`

Both `index.html` and `bladefall-campaign.js` served from port `8372` matched
the canonical `public/` files byte-for-byte.

All A1 screenshots and recordings must therefore identify both their URL and
game version. Evidence from port `8371` is not valid for this baseline while
the legacy process remains active.

## Verification

- `npm run baseline:audit`: passing; A1 correctly remains open.
- `npm test`: 124 passing, 0 failing.
- `npm run release:check`: passing.
- In-app browser control: unavailable because the session exposes no callable
  browser-control runtime.
- Project-local headless capture fallback: passing against the verified `8372`
  server with no page errors.
- Input-only entrance probe capture: 16/16 stages, no page errors. Each probe
  has a short MP4 plus a sampled JSON receipt. Stage selection used the
  development reload API; movement after load used ordinary keyboard input.
- Puppeteer's bundled screencast path and this machine's VP9 encoder were not
  usable. The fallback captures PNG frames, encodes H.264 locally, and removes
  its exact temporary frame directory after every stage.
- Targeted dynamic capture: eight videos and receipts, no page errors. The set
  covers anchored portal activation and its speed gate, water contact, updraft
  lift, follower commands, gravity flipping, Deep Line signaling/collapse, and
  a synthetic checkpoint rewind.
- Boss capture: seven phase/reset videos and receipts, no page errors. The set
  inventories each vulnerability contract, observes active arena behavior,
  crosses forced HP thresholds, and verifies synthetic death restart plumbing.
  Abyss King returns to its disclosed final checkpoint. Natural portal phases,
  boss-caused deaths, and victories remain open.
- Opening-route capture: four 35-second runtime-assisted, keyboard-only attempts
  with no page errors. No stage transitioned. The attempts preserve checkpoints,
  damage, upgrade choices, and reset loops; they do not use mid-route state
  injection or claim human playability.

## Open gate

The structural inventory, release parity, known-risk ledger, per-stage capture
requirements, 137-still atlas, 16 runtime manifests, static visual review,
16 input-only entrance probes, eight targeted dynamic probes, and seven
forced-phase/reset boss probes are complete. The following remain open:

- Natural setup, failure, recovery, and success recordings for every dynamic
  room.
- Natural boss mechanic phases, boss-caused deaths, victories, and co-op
  behavior.
- Human fresh-save, returning-save, optional, speedrun, and two-player route
  reviews.

A1 must not be marked complete until that evidence exists.
