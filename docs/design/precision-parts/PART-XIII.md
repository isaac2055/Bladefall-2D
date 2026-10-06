# Part XIII · The Citadel (levels 123–131)

Built 30 September 2026 (7.254). Files:

- `public/bladefall-pcore-part-123-citadel.js`: the rooms and their tapes, palette `citadel`.
- `scripts/verify-precision-part-123.mjs`: the foothold rule fixtures, routes, wrong-strategy families and hunts. `node scripts/verify-precision-part-123.mjs p127` checks one room's wrong strategies.
- Devices: `public/bladefall-pcore-dev-citadel.js` (spent footholds, `Y`), unchanged this pass. The echo at the close lives in `-dev-throne.js`, which the Throne builder owns and this part only uses.

The Citadel's base-game signature is footholds spent by use, plus ziplines into your portal. The precision mirror is the **spent foothold**. It bears you for as long as you stand on it or hold its side, and it falls away the moment you leave, for the rest of the attempt. The zip block (old) is paired with a portal, so its throw is carried through a portal. The **echo** (Throne's device) is introduced in 130 and closes the region at 131.

## Shape and difficulty

| Stage | Levels | What they do |
|---|---|---|
| Teach | 123 | Footholds alone. |
| Spend in order | 124, 127, 128 | Out-and-back rooms where what you spend going out decides whether you can come home. 127 adds moths as a second thing that is good once. |
| Zip into a portal | 125, 126, 129 | The zip's throw kept through a portal. 126 and 129 cross it with footholds (aim first, and a foothold that stands in the throw). |
| Echo | 130, 131 | 130 teaches the echo alone. 131 is the summit: stair, zip and echo. |

**Intended curve:** 123 (easy, under Inversion's 122) < 124 ≈ 125 (easy–medium) < 126 < 127 ≈ 128 (medium) < 129 (medium–hard) > 130 (a teaching dip for the echo) < 131 (hard, a little above 122, and Act 1's second-to-last summit before the Deep Line). Momentum is optional. Hunts in 124 and 129 reject supers and hypers only where the question is about spending, not speed. Enemies appear in 127 (moths). Portals appear in 125, 126 and 129.

## The rooms

The counts come from `node scripts/verify-precision-part-123.mjs`. "Clean" means the tape reaches the exit with no deaths.

| Level | Room | Question | What fails (checked) |
|---|---|---|---|
| 123 | Good Once | Each foothold bears you once. Can you cross without needing one twice? | Hop on a foothold, then carry on (27, 0). Leap the thorns without the footholds (264, 0). |
| 124 | Out and Back | A low line and a high road both reach the stone, and only the high road reaches the way out. Which do you spend going there? | High road out, then any way home (240, 0). Hunt for a way home once the high road is spent: none. |
| 125 | Thrown Through | The zip throws you sideways, and the way out is straight up. What must you be doing when you go in? | Into the portal at walking, jumping or dashing speed (66, 0). Hunt with no zip-jump: none. |
| 126 | One Stand | From the foothold you can see the far ceiling and reach the orange end. You will stand there once. Which comes first? | Up into the orange end first, aim after (27, 0). Aim from the start ledge instead (20, 0). Hunt that never stands on the foothold: none. |
| 127 | Moth Road | The bridge and the moths are each good once, and only one of them can take you back up. Which do you spend going out? | Bridge out, home on jumps and dashes alone (120, 0). Hunt for a way home without a moth: none. |
| 128 | First Step | The stair and the low road begin on the same foothold. Which stone do you light first? | The low stone first, then any way up (36, 0). Hunt that lights the low stone first: none. |
| 129 | Clear the Way | The foothold is the only place to aim from, and it stands in the zip's throw. How do you use it, and lose it? | Throw before the foothold is spent (54, 0). Aim from the zip, not the foothold (40, 0). Hunt with no zip-jump: none. |
| 130 | Leave a Body | You can drop to the stone, and you cannot climb back. What can you leave up here? | Down to the stone with no echo above (12, 0). Hunt with no swap: none. |
| 131 | The Citadel | The zip is fast and low, the top of the stair is high and still, and the way out needs both. Where do you leave your echo? | Jump or dash for the way out from the top of the stair (32, 0). Trade places standing still, or with the echo left at the bottom (39, 0). Hunt with no swap: none. |

### What the player does and feels

- **123 Good Once.** Three pale footholds over thorns. Hop on one twice and it crumbles under you, so you learn to keep moving forward.
- **124 Out and Back.** The long high bridge is tempting on the way out, but it is the only way home. You cross the low footholds going out and save the bridge.
- **125 Thrown Through.** You open a portal in the wall and ride the zip toward it, jumping as it stops. You go into the wall sideways and come out of the floor straight up, fast enough to reach the ledge. Walking in drops you out of the floor in a hop.
- **126 One Stand.** You land on the only foothold and stop. From here you can aim at the far ceiling, so you aim first and then jump into the orange end above you. Jumping first leaves you nowhere to stand.
- **127 Moth Road.** You take the bridge out and light the stone. It is gone behind you, so you cut the moths on the way home, each one a bounce up and the dash back.
- **128 First Step.** The stair's first step is also the low road's first step. You go up first, then down. The low road first spends the stair.
- **129 Clear the Way.** You aim from the foothold, which stands in the zip's line, then leave it so it falls away, then ride the zip through the gap it left and into the portal.
- **130 Leave a Body.** You leave an echo at the top, drop down to the stone, and trade places with the echo to be back up in an instant. It is the first "oh" of the Throne's device, given a room to itself.
- **131 The Citadel.** You climb the spent stair and leave your echo at the top. You come back down to the zip, and as it throws you, you trade places. You arrive at the top of the stair still moving at the zip's speed, and one dash carries you to the high door. The stair is gone behind you.

## What the sweeps caught this pass, and the fixes

- **125 Thrown Through (1 of 72 "succeeded").** The one success was a jump the moment the zip stops, which is the intended answer. The family's grid included it: `w=0` with a jump is exactly the tape. **Check fixed honestly:** that one combination is now left out. The walking, dashing, late-jump and jump-then-dash variants still all fail (66, 0), and the hunt that forbids a zip-jump still finds nothing. The room is unchanged.
- **127 Moth Road ("the bridge does reach the stone" failed).** The sanity tape walked off the end of the bridge into the thorns, so the family "bridge out, home without moths" built on it had been testing nothing. **Fixed** the tape (walk 132 frames, not 150), so the family now starts from a knight really standing at the lit stone. It still fails all 120 tapes, and the hunt still finds none. The room is unchanged.
- **131 The Citadel (3 of 12 "succeeded").** The three successes were the echo left at the top and traded for while riding the zip. That is the intended route, generated by the family's `top × still=0` combinations. **Check fixed honestly:** those combinations are now left out, and the wait before the swap is swept wider (8–32 frames, 39 tapes). Trading places standing still, or with the echo left at the bottom, fails in every case. The room is unchanged.
- The verifier gained a one-room filter (`node scripts/verify-precision-part-123.mjs p131`).

## Dropped designs

- None this pass. All three failures were faults in the checks, not skips in the rooms. Each was replayed to confirm that the "successful" tape was the intended answer (125, 131) or never reached the stone (127).
