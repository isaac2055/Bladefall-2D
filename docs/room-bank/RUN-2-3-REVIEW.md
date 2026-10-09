> Historical delivery: the next user review has been applied. See [Run 4 and latest banking/revisions](RUN-4.md) for current status.

# Run 1/2/3 review decisions and revisions

**Ready for review — 7.293.0, 8 October 2026.** Ten approvals are saved, including F37/F38 transferred to Base. Eight requested revisions and three companion rooms are ready. Run 4 remains a proposal only.

| Review queue | Rooms | Open |
| --- | --- | --- |
| Run 1 revision | F30 | [Review the echo fix](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f30) |
| Run 2 revisions | F31–F33 | [Review Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run2) |
| Run 3 Base | B36–B39 | [Review Base](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run3) |
| Run 3 Fractured | F35, F39, F40 | [Review Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run3) |

Open **Extras → Room Bank** for all groups. Approved rooms are now under **Banked**, with stable IDs and room hashes retained. Review records Fun /10, Difficulty /5, Suitability /5 and optional comments; Rate room can record an unfinished attempt. Use the pause-menu intended route after an attempt if helpful. Play mode has no survey and keeps the set timer. Numeric human scores remain unmeasured.

## Banking applied

| Decision | Rooms | Recorded feedback |
| --- | --- | --- |
| Banked — Base | B26 | Works now. |
| Banked — Base | B31, B32 | Strong, hard, suitable for late Base. |
| Banked — Base | B33 | Easier but strong; promising for further interactions. |
| Banked — Base | B34 | Creative, fun; the interaction principle is especially valuable. |
| Banked — Base | B35 | Fun. |
| Banked — Fractured | F34 | Good wall/phase combination; easier Fractured material. |
| Banked — Fractured | F36 | Good; somewhat easier, but still Fractured. |
| Moved and banked — Base | F37, F38 | Good ideas at Base difficulty. Their unchanged originals retain IDs F37/F38; harder companions are F39/F40. |

The bank now contains **32 approved rooms: 19 Base and 13 Fractured**. All ten newly approved room definitions and tapes match their archived originals. Classification and review metadata changed; no approved geometry was rewritten. The second repeated B37 comment was interpreted as B38, the adjacent vertical-carrier variation.

## F30: a reproduced input-state bug, now fixed

The old echo code moved the knight but left his rope attached to its original ring. If Grab remained held during the swap, the same frame's rope constraint pulled him toward that distant ring and generated extreme velocity. The old preview released the rope first, so its successful tape concealed the problem. On the archived room, the held-Grab attempt failed and exceeded 2,000 pixels/second; the same input completes cleanly after the fix.

A successful echo swap now invokes ordinary hook release before teleporting. It preserves the actual departure velocity, remembers the released ring to prevent an immediate held-input recatch, and handles moving-ring release through the same path. An exchange into solid terrain still fizzles and leaves the current rope intact. No blanket invulnerability or teleport-through-solid rule was added.

F30's canonical route now **keeps Grab held and presses Echo on the rising rightward swing**. Jump is optional for a higher departure; there is no mandatory release-then-swap sequence. The landing is also three tiles wider and one tile lower than the previous revision. The first-input hint displays the currently bound Echo control; the room's Controls card labels the action Echo rather than only Portal.

The revised room has 14 consecutive successful direct-swap timings for the recorded setup, and 108 clean finishes among 132 sampled swing/reel/input combinations. Twelve representative successful tapes remain in the shared checker. These are actual tested combinations, not independent ranges that can all be mixed freely. Default keyboard P, a remapped E, and controller RB each completed through the real view input path with Grab held and no deaths. [Timing and before/after evidence](../../scripts/room-bank/evidence/run23/f30-echo.json) · [Browser input evidence](../../scripts/room-bank/evidence/run23/f30-browser-input.json).

## Revised and new rooms

Difficulty numbers below remain designer estimates. The fixed Base recoil room B39 is deliberately a teaching room; F35 supplies its more involved Fractured companion. F39/F40 retain moving-hook vocabulary but add distinct route dependencies to the approved Base originals.

| ID | Room | Side | Estimate | Positive variations |
| --- | --- | --- | ---: | ---: |
| F30 | [Bring Back the Arc](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f30) | Fractured | 4/5 | 12 |
| F31 | [Cut Behind You](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f31) | Fractured | 4/5 | 6 |
| F32 | [Take the Shade With You](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f32) | Fractured | 5/5 | 9 |
| F33 | [The Shield You Spend](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f33) | Fractured | 4/5 | 17 |
| B36 | [Short Runway, Tall Exit](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b36) | Base | 4/5 | 11 |
| B37 | [Make a Place to Leave](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b37) | Base | 4/5 | 10 |
| B38 | [Hands Below, Cargo Above](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b38) | Base | 4/5 | 11 |
| B39 | [Borrow Only Enough](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b39) | Base | 3/5 | 10 |
| F35 | [The Weight Leaves First](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f35) | Fractured | 5/5 | 7 |
| F39 | [Leave Someone at the Station](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f39) | Fractured | 5/5 | 11 |
| F40 | [Leave the Light Behind](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f40) | Fractured | 5/5 | 12 |

<details>
<summary>Solutions — spoilers</summary>

### F30 — Bring Back the Arc

Place the echo on the upper isolated perch. Catch the lower ring, pay out for the low tally, then reel in through the leftward return. Pump right. During the next rising rightward arc, press Echo while continuing to hold Grab: the swap now releases the old tether automatically and preserves the swing velocity. Jump + Echo remains an optional higher departure. The receiving shelf is three tiles wider and one tile lower than the previous revision.

Why this differs: There is no dash fallback. The low tally asks for an extended outward arc; the exit asks for a shortened rising return. The same controllable pendulum must supply both trajectories, and the echo transports its velocity across an otherwise lethal beam partition. The upper route is deliberately beyond an ordinary jump from the echo perch.

[Source and saved routes](../../scripts/room-bank/fractured/30-bank-f30.json). Canonical completion: 307 frames, no deaths.

### F31 — Cut Behind You

Dash down-right while cutting toward the remote tally: the dash shields the vertical beam, and the outgoing movement puts the advancing blade in reach. The small spent foothold disappears as you leave it. Jump Left during that same dash to reverse into the low, fast crossing to the newly solid west shore; keep moving to the exit.

Why this differs: The dash buys access to a key in the wrong direction, and the launch floor is spent before the return. The same dash must therefore become the leftward launch; walking out and returning to prepare a forward hyper loses the floor and meets the beam.

[Source and saved routes](../../scripts/room-bank/fractured/31-bank-f31.json). Canonical completion: 137 frames, no deaths.

### F32 — Take the Shade With You

Begin by dashing down-right and cutting: the dash shades the departure beam while the advancing blade reaches the outside tally. The spent launch tongue disappears, committing the return to the same dash. Reverse-hyper left, then press Grab as you pass the lantern suspended in the clasp. Its shade crosses the second beam and its glide reaches the far chamber. Settle on the brass strip, drop the lantern with Down+Grab to hold the roof open, then climb the west wall to the upper gate.

Why this differs: The outward/reverse commitment is now physical: a dash-operated shade permits the cut, and the spent footing removes the second launch setup. The return must then collect portable shade, cross a second beam, and turn that cargo into stationary weight so the knight can climb empty-handed.

[Source and saved routes](../../scripts/room-bank/fractured/32-bank-f32.json). Canonical completion: 286 frames, no deaths.

### F33 — The Shield You Spend

The jailer blocks a horizontal beam, keeping the starting floor safe but hiding a tally in its low western duct. Jump over his shield and use a low downward cut on the helm; the low rebound stays beneath the thorn ceiling while letting you settle on his back side. Turn left and cut his back as you descend. That one cut destroys the beam shield, lights the inaccessible tally, and recoils you rightward above the now-open beam. Spend the returned dash diagonally right before falling to beam height, then land on the far shelf.

Why this differs: Opening the gate destroys the shelter you started inside. The lethal cut must be a departure, not routine cleanup. The player faces back toward the target while the recoil launches away from it.

[Source and saved routes](../../scripts/room-bank/fractured/33-bank-f33.json). Canonical completion: 203 frames, no deaths.

### B36 — Short Runway, Tall Exit

Cut the seed left so it charges closer to the western portal mouth. Walk past it, face back toward it, and use a fresh rightward cut: the radial burst sends you left into the portal. The short runway retains enough horizontal speed for the floor outlet to turn it into useful height. Steer right after emerging onto the raised balcony. Walking into the portal supplies too little height; preparing the seed farther away loses too much speed before reaching the entrance.

Why this differs: Seed placement determines how much launch survives the approach; the portal turns that preserved horizontal speed into height in another chamber. The strike points away from the wanted destination because the linked route changes the useful direction.

[Source and saved routes](../../scripts/room-bank/base/bank-b36.json). Canonical completion: 132 frames, no deaths.

### B37 — Make a Place to Leave

Catch the travelling hook and reel in. Its visible carriage stops against the upright hinged arm. Pump gently toward the hub; jump-release and cut right so the obstruction becomes a horizontal landing beneath your departure. Walk out on that newly made bridge, then make an ordinary jump to the raised east gallery. No dash or special movement profile is needed.

Why this differs: A transport obstruction becomes your dismount surface. The solution changes from hanging to standing at the same moment it changes the route, rather than adding another rope-length checkpoint.

[Source and saved routes](../../scripts/room-bank/base/bank-b37.json). Canonical completion: 229 frames, no deaths.

### B38 — Hands Below, Cargo Above

Pick up the lantern, take a few steps and stop, then throw it onto the approaching carriage. The low tunnel leaves room for cargo above the deck but not for a knight. Drop beneath and catch the mounted hook with free hands. Ride east; the dock clasp catches and holds the cargo separately from its transport. Jump-release onto the dock, let the returning deck clear the lantern, then jump and grab it from the clasp. Carry its shade through the final beam.

Why this differs: The carriage transports the lantern on top and the knight underneath. The dock clasp separates freight arrival from passenger arrival, making return motion create the pickup opening. Lantern shade remains necessary beyond the carriage.

[Source and saved routes](../../scripts/room-bank/base/bank-b38.json). Canonical completion: 353 frames, no deaths.

### B39 — Borrow Only Enough

Choose a partial compression, release Down and step right as the plate rises. Use an ordinary held jump while its lift is available to reach the shelf without touching the teeth. There is no dash fallback.

Why this differs: A low receiving corridor sets both a minimum useful rise and a maximum safe arc; the player chooses the stored lift instead of accepting a fixed spring launch.

[Source and saved routes](../../scripts/room-bank/base/bank-b39.json). Canonical completion: 181 frames, no deaths.

### F35 — The Weight Leaves First

The lantern compresses the recoil support. Pick it up to release the stored lift, then throw it east from the edge into the broad lower switch basin. Carrying the lantern would prevent dashing; sending it down gives it a second job while freeing the knight. As the plate returns near its original height, make a lifted hyper across the upper route. The arriving lantern holds open the gate, and its basin lies too low to replace the upper launch.

Why this differs: Removing the weight creates the moving launch, but carrying it forbids the hyper. Giving it an independent useful destination simultaneously frees the knight and opens the receiving route.

[Source and saved routes](../../scripts/room-bank/fractured/35-bank-f35.json). Canonical completion: 138 frames, no deaths.

### F39 — Leave Someone at the Station

Catch the lower carriage and let its rail stop at the held gate. Pay out onto the broad station plate below; it briefly restarts the train. Leave an echo on the plate before reeling away, so the gate stays open as the train carries you out. Shorten the rope, then jump-release into the independently moving upper carriage when it comes alongside. The higher rail supplies the final approach to the east gallery.

Why this differs: The platform is first a locked station lift and later the lower half of a moving transfer. Arriving on the plate starts the train leaving: the echo must preserve that permission while the knight reels back up. The meeting with the independently moving upper train is downstream of this spatial preparation.

[Source and saved routes](../../scripts/room-bank/fractured/39-bank-f39.json). Canonical completion: 376 frames, no deaths.

### F40 — Leave the Light Behind

Ride close under the carriage through the central beam. At the western end, pay out on the east side of the mirror and cut left to turn its horizontal light upward. The carriage itself initially shades the high sealed tally: leave with it so the light can reach the receiver. Reel clear of the new upward beam and stay beneath the moving cover for the eastern return.

Why this differs: The travelling cover must protect the knight while allowing the newly aimed light to work behind them. Rope length, approach side and departure order now change what the same solid carriage protects.

[Source and saved routes](../../scripts/room-bank/fractured/40-bank-f40.json). Canonical completion: 430 frames, no deaths.

</details>

## Evidence and next step

The full reserve is **58 playable rooms: 32 Base and 26 Fractured**. Groups: Run 1 revision 0+1, Run 2 revisions 0+3, Run 3 revisions/companions 4+3, earlier review 9+6, banked 19+13. All 58 canonical routes, **264 positive variations** and **124 negative probes** pass. Exact catalog membership checks every requested revision, variant, banking decision and side.

The original ordinary sword/jump/dash shortcuts were reproduced in archived F31, F32 and F35 before replacing their layouts. An independent pass also found a separate-cut/forward-hyper route in the first F31/F32 revisions; the final live-beam approach and spent foothold reject those exact routes, a downward pre-toggle and a recovery hop while retaining five consecutive reversal timings. [Replayable before/after checks](../../scripts/room-bank/run23-f3x-evidence.mjs). F33 explicitly retains an ordinary jump over the guard as an alternate: it still requires removing the shield, exposing the sealed tally to light and using the back-cut launch; pogo is optional. The new room records retain those tapes and focused negative checks. Required-event assertions verify intended tapes only; no exit requires an invisible named-tech receipt. Tested shortcut families do not constitute proof that every alternate solution is impossible.

The focused echo, recoil, impulse, moving-hook and 21 Run 2 movement contracts pass; all eight existing campaign echo-room tapes also finish with no deaths. The final browser check covers all eleven revised/new rooms, review forms from both runs, exports, current groups and counts, timer/pause behavior and legacy links for F20/F37/F38 now classified as Base. Each changed layout received a visual pass. The local static bundle is current; nothing was published.

All 47 non-revised original room definitions and tapes are preserved. Earlier source metadata changes are limited to the ten approvals/transfers. Both design reports, the main movement core and the unrelated world lock remain unchanged. Original records are archived at `scripts/room-bank/archive/runs-2-3-before-review/`; the pre-edit hashes are in [the review baseline](run-2-3-review-baseline.json). Current [manifest](manifest.json) and [route report](route-report.json) provide machine-readable results.

Read the [Run 4 proposal](RUN-4-PROPOSAL.md) for the design lessons and recommended next approach. It favors causally connected interactions, physical route requirements and harder decisions over smaller timing windows. **No Run 4 rooms were built.** Review this queue before choosing that set.
