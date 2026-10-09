> Historical 7.294 delivery. Latest banking, B41/B42 redesigns, other revisions and new Superrooms are in [the current guide](SUPERROOMS.md).

# Run 4 — new movement × new entities

**Local review set — 7.294.0, 8 October 2026.** Four Base and four Fractured rooms. Run 5 has not started. The [original five-run plan](RUN-PLAN.md) governs the scope.

[Review Base](http://localhost:8371/precision.html?pitch=bank&mode=review&side=base&group=run4) · [Review Fractured](http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run4)

Find both under **Extras → Room Bank → Run 4**. Every room is saved separately with a completion tape. Numbers shown in the menu are author estimates; human fun, difficulty and suitability scores remain unmeasured.

## Latest decisions

Eight approvals saved: **F30, F33, B36, B38, B39, F35, F39, F40**. F35 and F39 are banked as Base with stable IDs; F40 remains early Fractured. F30, B36, B39, F39 and F40 retain their approved geometry and tapes. The bank contains **40 approvals: 24 Base and 16 Fractured**.

| Room | Result |
| --- | --- |
| [F31 — Cut Behind You](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f31) | Revised for review: 14 consecutive successful reversal timings, up from five; Strike can follow Dash instead of requiring a simultaneous chord. Receiving shore widened. |
| [F32 — Take the Shade With You](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f32) | Revised for review: same reversal forgiveness; wider receiving shore and cargo-weight strip. |
| [F33 — The Shield You Spend](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f33) | Banked. Geometry unchanged; intended preview now parries, finishes the staggered guard to uncover the tally, retreats to the western shelf, wavedashes, then spends the returned dash at the finish. The older route remains an allowed alternative. |
| [B37 — Make a Place to Leave](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b37) | Revised for review: the seven-tile divider is fixed stone. Let the carriage move ahead, run off, catch lower, slingshot toward the end wall and climb. |
| [B38 — Hands Below, Cargo Above](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b38) | Fixed and banked. Pick the lantern from its clasp and carry it through the three overhead beams. |
| [F35 — The Weight Leaves First, now Base](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f35) | Fixed and banked. A short covered cargo pocket removes the lower walking launch route. The ordinary spring jump reaches the bridge; this Base version has no dash fallback. |

The added reversal grace applies only to the opt-in `survive-2` movement profile. It lasts eight ticks after a grounded dash ends and accepts the opposite-direction jump while the original support is still present or during the initial departure. A new landing cancels it. It preserves existing forward launch and dash-refill rules. Strike may be pressed during a ground-skimming dash in this profile; ordinary movement elsewhere is unchanged.

## New rooms

Each room requires an actual new-movement interaction and contains a Run 3 entity. There are no new entity families in this batch. Combinations are meant to change the route decision, rather than merely place two demonstrations in sequence.

| Room | Movement × entity | Role |
| --- | --- |
| [B40 — Unshade the Lock](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b40) | recoil-platform, cargo-dash-catch | Base · estimated 3/5 |
| [B41 — Below the Last Rail](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b41) | moving-hook, controlled-pogo | Base · estimated 3/5 |
| [B42 — A Weight With Teeth](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b42) | controlled-pogo, recoil-platform | Base · estimated 4/5 |
| [B43 — Collect Above the Dock](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b43) | moving-hook, cargo-dash-catch | Base · estimated 4/5 |
| [F41 — Cut Under the Eaves](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f41) | recoil-platform, reverse-dash-jump | Fractured · estimated 4/5 |
| [F42 — Two Jobs in One Cut](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f42) | controlled-pogo, impulse-seed | Fractured · estimated 4/5 |
| [F43 — The Lift Becomes a Wall](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f43) | moving-hook, wallbounce-grace | Fractured · estimated 4/5 |
| [F44 — Take the Moving Passenger](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f44) | moving-hook, cargo-dash-catch | Fractured · estimated 4/5 |

## Solutions and comparisons

### B40 — Unshade the Lock

Fully compress the plate, release Down and jump during the rise. Near the top of the arc dash up-right while holding Grab. Taking the suspended lantern exposes the sealed tally to its beam and opens the gate; the caught cargo preserves dash speed and supplies shade for the far crossing.

**Why this pairing:** The cargo transfers two jobs in one catch: uncover the fixed receiver, then shield its moving carrier. The new recoil supplies height while the new dash catch supplies range. The high clasp is beyond an ordinary jump plus diagonal dash; the recoil is needed to meet it.

**Nearest comparison:** B33 catches cargo along a ground runway; B35 carries a recoil weight from the start. Here the recoil lift makes an otherwise inaccessible midair catch possible, and removing the shade opens the exit while taking that shade along.

### B41 — Below the Last Rail

Jump and catch the travelling ring, reel in while it moves east, then pump right. Before the carriage stops at the low roof, release Grab and fall toward the pod. A downward cut without Jump gives the low rebound that carries the departure across to the receiving shelf. Jumping straight from the ring hits the roof; a lofted rebound also rises into it.

**Why this pairing:** The useful route outlasts its transport. Select a departure position from a moving rail, then preserve enough motion through a low rebound to fit the receiving corridor.

**Nearest comparison:** B32 rotates a stationary portal launch into a low pogo; here departure is selected from a moving anchor with a physical rail stop. The anchor cannot deliver the knight directly to the landing.

### B42 — A Weight With Teeth

Wake the plate and let the guard carry it down. Walk off the west ledge and cut downward with Jump released. Remain above the guard for a second low rebound; the fatal hit releases the loaded plate. Steer right as you settle onto its rising eastern edge, then make an ordinary rightward jump with its lift to the high gallery.

**Why this pairing:** The enemy is a load and a platforming target. Removing it starts the return of the support needed for the next jump; a high rebound misses the required space.

**Nearest comparison:** B39 manually loads a spring. Here the living enemy holds the energy and the low rebound leaves time to catch the support it releases.

### B43 — Collect Above the Dock

Load the carriage with the lantern and catch its ring from below. The stone tunnel fits cargo above the deck but not a standing knight. At the far end, the clasp collects the lantern high above the low dismount dock. Release onto the dock and wait for the carriage to clear. Jump straight up, dash Up, and press/hold Grab while rising through the clasp. The dash-catch keeps enough rise to carry the shade onto the high eastern balcony; walk through its sunlight to leave.

**Why this pairing:** The required transport creates an elevated pickup, which changes from storage into a momentum-preserving transfer. Catching after the dash has finished loses the height needed for the shaded balcony.

**Nearest comparison:** Builds deliberately on B38’s separate cargo/knight routes and B34’s rising catch. In B38 the clasp is within ordinary jumping reach and the exit is at dock height. Here the lower dismount cannot reach the clasp normally, and the exit is a further elevated gallery: collection and ascent must become one continuous action.

### F41 — Cut Under the Eaves

Hold Down until the plate sinks and the tally sits beside the blade under the eaves. Dash Right, then Strike during the outward slide: the dash shades the live beam and creates the opposite shore. At the visible right wall, hold Left and press Jump, including just after the burst ends, to reverse that dash into a super with the rising floor's lift. The high westward arc reaches the opposite landing; another dash switches that landing off.

**Why this pairing:** The temporary low position is needed for the outward cut, while the returning lift is needed for the high exit. The new reverse super joins both purposes without a second phase-changing dash.

**Nearest comparison:** F31 makes a low reverse cut across spent ground. This room instead makes compression solve access to a low target, then uses that same stored displacement for a high return. F35 sends away a lantern weight; here the knight alone controls the spring and the single phase change must be kept.

### F42 — Two Jobs in One Cut

Walk off the west balcony. Cut diagonally down-right with Jump released: the same blade contact makes a low pod rebound and knocks the adjacent impulse seed down-right. Drift past the moved seed while its charge finishes, then face down-left and cut its gold face during the descent. The seed launches up-right toward the distant pod pair. Hold Jump on the next downward cut to loft onto the high exit, preserving the seed's lateral speed.

**Why this pairing:** One diagonal blade stroke prepares two different objects at once. The knight goes up while the seed goes down, then the same arc brings them together in a new relative position. Low versus lofted rebound is selected twice for opposite purposes.

**Nearest comparison:** B32 chooses low and lofted rebounds around a portal, while F36 relocates an impulse before a separate return climb. Here the first low rebound is also the physical preparation of the later seed launch; the return interception occurs during that rebound, and its sideways speed carries through the final loft.

### F43 — The Lift Becomes a Wall

Catch the vertical carrier from the west and swing right through the low tally. Reel in as it climbs. Near its upper station, pay out and gently pump right so the knight hangs just outside its right side, about five tiles below its lower corner. Updash along that side and hold Jump as the burst finishes. The last residual rise reaches the moving wall during the new grace window, producing the rightward wallbounce. The carrier also shades the horizontal beam during departure; the twin overhead beams make standing on its top unsafe.

**Why this pairing:** The attachment must be lengthened before it can be abandoned: maximum reeling is not the best launch. The knight returns upward along the carrier instead of simply flinging away from the rope.

**Nearest comparison:** F34 creates a fixed phase wall and trades it for a landing. F37 transfers between moving rings. Here the same carrier is transport, a moving beam shade, and the wall contacted after the dash has finished; rope length sets whether its lower corner arrives in time.

### F44 — Take the Moving Passenger

Catch the freight ring and reel in below the low roof. The lantern fits above the carriage; the knight does not. As the train emerges, pay out and pump toward its cargo edge. Jump free during the rising outward swing, dash straight up beside the platform, and hold Grab after starting the dash. The moving lantern ends the burst while retaining its full upward speed. Steer right on the carrying glide and keep the pack above the knight through the sun shafts.

**Why this pairing:** The moving platform simultaneously carries the required shade above the route and the knight below it. Departure changes attachment from its rope to its moving cargo, and the act of catching supplies the usable vertical continuation.

**Nearest comparison:** B38 loads a carriage and retrieves its cargo from a stationary dock. Run 4 B43 also has a stationary pickup. Here the freight never parks its cargo: rope length, a live edge rendezvous, and the new velocity-preserving catch replace docking. The wide receiving shelf keeps the final landing forgiving.

## Verification and limits

The saved Node routes and browser checks cover successful completion, recorded control variations and specific obvious shortcuts. These checks establish that the routes work and the listed bypasses fail; they do not prove exhaustive route uniqueness or human difficulty. Clever alternatives that preserve the problem are welcome.

The targeted movement contracts check the reversal grace, delayed strike, new-landing cancellation and legacy behavior. A separate preservation check compares 47 untouched room sources and both existing design reports against the pre-edit baseline. Review submission, room revision identifiers, CSV export, play timer and old Fractured links for Base transfers are checked in the browser.

Sources live in `scripts/room-bank/base/` and `scripts/room-bank/fractured/`. Run `node scripts/room-bank/check.mjs --write` for the saved route report, `node scripts/room-bank/run4-preservation-check.mjs` for banking/preservation, and `node scripts/room-bank/browser-check.mjs <room IDs>` for browser checks. The old Run 2/3 preservation script describes its historical 58-room release and is not the current contract.

Review these candidates before deciding what earns a bank slot. Run 5 is the later full synthesis of old and new systems; it has not been built in this request.
