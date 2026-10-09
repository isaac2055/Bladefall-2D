# Final room-bank approvals — 7.303

The bank is complete for now: **97 approved rooms, 54 Base / 43 Fractured**, with nothing pending. B60 is cut and recoverable from `scripts/room-bank/archive/rejected-final-review/bank-b60.json`. The six unconditional approvals are B24, B58, B59, F24, F25 and F45. The two conditional approvals are fulfilled below. Earlier approvals and room-side labels remain unchanged.

## Lantern landing: F32

The request calls this “B32,” but the lantern and second-laser description uniquely matches **F32, Take the Shade With You**. B32 is Height Becomes Distance, the dashless pogo/portal room, and remains unchanged.

F32’s receiving phase platform now extends through column22 beneath the second encountered beam, adding **32 pixels** of landing width. Only four tiles change. Five lanterns remain; the saved completion and its five positive variations pass. F32 is banked.

## F59: reusable runway and wavedash

The nine-tile initial runway is ordinary solid ground. It no longer arms after departure, so preparatory jumps and repeat landings are safe. The marked return wall retains its spent-face behavior. The overhead spike/stone beam is **24 pixels higher**, and its west end is shortened by three tiles to leave the wallbounce corridor open.

The new saved route starts with a short hop, airborne down-left dash, landing/refill and jump out as a wavedash. It crosses the two dust-bunny patrols, uses the remaining dash for the second opening, then completes the original return-wall/crystal sequence. Normal inputs only; no runtime movement changes or injected player state.

- New wavedash completion:343 frames, zero deaths.
- Preparatory jump and relanding, followed by the wavedash:493 frames, zero deaths.
- Departure three frames earlier:340 frames, zero deaths.
- Original reverse-hyper route:295 frames, zero deaths.

The source stores the actual airborne-dash/landing/refill/hyper trace and both patrol crossings in `bank.wavedashProof`. F59 is banked under the requested successful-wavedash condition.

## Checks and next scope

All97 canonical routes,412 positive variations and 262 targeted shortcut probes pass. Actual browser routes for F32/F59 complete without deaths or page errors; the menu shows97 banked and no pending group. Local receipt and images are in ignored `scripts/climb/.cache/room-bank/`.

The next artifact is the [40-world placement analysis](WORLD-PLACEMENT-7.303.md): every ordinary room is assigned once, with at least two per world. It is a plan only. No bank room enters the campaign in this update, no existing campaign room is cut, and no superroom is created or assigned to a finale. Individual checkpoints remain unchanged.
