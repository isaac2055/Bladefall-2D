# 7.333 — five Cores and The Two Banks

## Player-facing result

Garden & skins now has five implemented Cores. Turn of the Trumpet and The Oath Root remain banked and their geometry is unchanged. Revised Causeway and the two new Cores remain candidates for human review; automated proofs do not bank them.

- **Causeway / The Last Counterweight:** late-world `lines` removed. Seven Z counterweights, momentum relays, thorn-capped grip faces and crumbling landings. The first receiving shelf is one tile lower. A continuous counterweight launch can preserve its speed through a wavedash and refund the dash immediately; stopping or reversing loses that benefit. This is room-opt-in, with ordinary physics unchanged.
- **Updrafts / The Borrowed Sky:** a 136×120 connected tower with rising columns, crosswinds, seed rebounds, wall catches and real landings on both A/B dash-switched light platforms. Two save points.
- **Hollow Marksman / The Unbroken Answer:** a 160×112 continuous three-tier route. Airborne parries restore dash, including a wall-grip parry and a late double-parry exchange. Counterweights, thorn-capped blocks, seed rebound and crumbling catch ledges mix the movement. Two save points. Uses the region's watch-bow sprites and dash/strike/parry kit.

Native whole routes: Causeway 1,238 frames, Updraft 1,837 frames, Marksman 1,657 frames, zero deaths. Fresh parts: 308/492/448; 690/655/508; 547/575/558. The complete five-Core suite covers 18 independently reset sections, persistence, death resets, rewards, kits, Garden entry and hidden map placement. All 132 ordinary source hashes remain unchanged. Causeway's flow fixture passes 64 timing variants, including adjacent jump timings, and rejects 512 stopped variants. Finite ordinary opening probes and recorded-route mechanic-removal checks are saved in docs/room-bank/*-proof.json; these are not exhaustive shortcut or human-difficulty proofs.

## Online practice: The Two Banks

Open **Co-op → The Two Banks · 8 shared puzzle rooms**, or `coop-practice.html`. One player hosts and shares a six-character code; the other joins. Both press Ready. Roles swap between rooms, with a manual swap/retry option. A disconnect pauses both players and permits the same guest to rejoin while the host page remains open. This separate practice course never changes campaign saves.

All eight ideas from docs/design/COOP-SHARED-PUZZLES-DRAFT.md are distinct playable rooms:

1. Counterweight Exchange: transfer a single lantern from the left scale to the right; the partner rides the cage and latches a bridge; transfer it back to power the operator's return lift.
2. Portal Relay: each knight owns one pair; carry/throw the lantern through both sealed bays into a receiver, then ride the shared returns.
3. Two-Sided Brake: opposing lever actions expose the other player's crossing; six-second windows and a catch shelf.
4. Shield and Blade: hold a directional shield against the bolt stream while the partner cuts the tether from behind. Keep shielding until the arrows stop.
5. Lift and Release: hold/release a tilted lift to launch the rider; the rider opens the operator's return. Early held jump is buffered while riding, and the launch arc tolerates input delay.
6. Split Information: the observer's filtered snapshot contains the clue; the other player enters symbols while the observer holds the shutter. Shape/color pings make voice optional.
7. Partner Rescue: lift a catch basket under the key diver, then open the return portal. Both use the basket route to reach the upper exit.
8. Tandem Gate: different physical routes reach separated locks; hold both for 1.5 seconds, then meet at the central arch. Objects/portals cannot replace occupied locks.

Controls: arrows/WASD, Space/Z jump, Shift/X dash, G grab, J blade, K shield, E use/carry, Q portal, R shared retry. Touch buttons are included. Click a surface to ping it; 1–3 send color/shape pings and 4–6 send Ready/Wait/Here.

One authoritative host runs both native players and machinery; guests send only validated button input. Epochs reject pre-reset packets, sequence numbers reject reordered/duplicate input, and short press/release edges are retained. Private clue data is filtered per player. PeerJS uses the game's existing bundled library and signalling approach.

## Verification and release

- `node scripts/climb/cores-check.mjs`
- `node scripts/climb/new-cores-check.mjs`
- `node scripts/climb/counterweight-flow-check.mjs`
- `node scripts/climb/causeway-core-check.mjs`
- `node scripts/climb/test-tools-check.mjs`
- `node scripts/climb/garden-check.mjs`
- `node scripts/climb/coop-practice-check.mjs`
- `node scripts/climb/coop-session-check.mjs`
- `node scripts/climb/coop-latency-check.mjs`
- `node scripts/climb/coop-ui-check.mjs`
- `node scripts/climb/finale-check.mjs`
- `node scripts/playtest-release/check-recordings.mjs`
- `node scripts/playtest-release/check-review-sync.mjs`
- `node scripts/playtest-release/check-cloudflare-assets.mjs`

Co-op has native completion proofs for both roles, omission tests requiring the partner's actual mechanism work, shared resets, private clues, role swaps and reconnects. All 48 room/role/delay combinations (0/60/120ms delayed guest input) finish without deaths. DOM tests exercise real keyboard/pointer/menu handlers and ordered two-client messages, including 120 ms transport. Canvas calls are exercised but pixels are not browser-reviewed. No live browser automation or real internet co-op playtest was performed, following the earlier browser-access denial.

Version 7.333.0, serviceworker cache v501. Static offline assets include the practice page and its three modules. No API changes, Netlify deployment or APK rebuild. Standard main push triggers Cloudflare Pages; verify public asset bytes after publication.
