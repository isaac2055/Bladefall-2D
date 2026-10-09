# Room Bank — batch 03 and user review

> Historical release report for 7.288.0. Current approvals, revisions, side assignments and counts are in [batch 04](BATCH-04.md) and the [room-bank index](README.md). In particular, B13/B19 and five more Fractured rooms are now banked; F20 is banked under base with its stable ID retained.

**7.288.0 · 2026-10-07 · five new base and five new Fractured candidates.** All rooms are saved individually and remain outside campaign progression.

## Play the review queue

Open **Extras → Room Bank → To review**, or [open the local review menu](http://localhost:8371/precision.html?pitch=bank&mode=review). It contains **six base rooms** (one revision, then five new) and **seven Fractured rooms** (two revisions, then five new). The **Banked** tab contains approved reserves. Cards show stable IDs so approval and feedback no longer depend on a changing ordinal.

Review mode pauses at completion for Fun /10, Difficulty /5, Suitability /5 and an optional comment. Rate room remains available for an unfinished attempt. Play mode omits surveys and keeps the set timer. Existing reviews retain their stable room IDs and room-definition hashes; revisions do not erase earlier rows. Qualitative approval below does not invent numeric ratings.

## Banked from this review

| Side | Room | Action |
| --- | --- | --- |
| Base | B11 — Door Becomes Stair | Raised the exit and guarded the permanent roof/gallery faces that enabled the no-hinge route, then banked. |
| Base | B12 — Umbrella Exchange | Banked unchanged. |
| Base | B14 — The Upside Delivery | Banked unchanged. |
| Base | B15 — No Place to Land | Banked unchanged. |
| Fractured | F12 — The Floor You Leave Behind | Banked unchanged; the user's alternate solution is explicitly accepted. |
| Fractured | F14 — Empty Your Hands | Banked unchanged. |
| Fractured | F15 — Borrow the Mouth | Banked unchanged. |

B05 — The Useful Ceiling remains the first approved base room. The approved reserve therefore has **eight rooms: five base and three Fractured**. Nineteen rejected batch-01 rooms stay archived and excluded.

## Three revisions for another review

- **[B13 — The Missing Stop](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-b13):** the cast stopper now also shields a beam over the low delivery route. Pass it before closing it behind you; the resulting block makes the far-side manoeuvre safe and catches the returning stone. A lower receiving roof and higher exit remove the first-stop jump into the old exit. The stone must return to support the climb.
- **[F11 — Inside the Elbow](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f11):** the receiver is now deep in a light duct beyond body/blade reach. Guarding the low approach to the second arm makes the first arm's height useful, while overlapping poses preserve a visible rotation-order problem.
- **[F13 — Break the Wrong Bridge](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f13):** masonry protects the receiver in an eight-pixel horizontal duct. A second optical junction must be prepared from its safe side before the upper mirror activates the light. The lower spent foothold remains the return shield.

These remain **Revised**, not approved. Originals of all four changed batch-02 rooms, including B11, are preserved in `scripts/room-bank/archive/batch-02-before-review/`.

## Ten new candidates — design spoilers

The table describes the intended discoveries. For an unspoiled first attempt, use the menu above. **Escape → Watch the intended route (review)** is available after trying a room. Estimates below are author estimates, not measured ratings.

| Side / stable ID | Room | Estimate /5 | Central decision |
| --- | --- | ---: | --- |
| Base / bank-b16 | Hands for the Chimney | 4 | Send the lantern ahead to hold shade while both hands climb; retrieve it from a different side. |
| Base / bank-b17 | Ceiling Keeps the Key | 4 | Keep the cargo’s first gravity result while returning the knight to ordinary gravity. |
| Base / bank-b18 | Floor You Need Gone | 3 | Use the spent pier for access, then deliberately remove it to open the cargo duct below. |
| Base / bank-b19 | The Long Way First | 4 | Visit the high perch before fetching cargo; the echo transports the lantern and preserves a return. |
| Base / bank-b20 | The Door You Need Closed | 3 | Use the closed tally door as a ladder, create a permanent beam shield, then allow the door to disappear. |
| Fractured / bank-f16 | Return Freight | 4 | Dispatch cargo on the carriage, take the void shortcut, then intercept the cargo on its return. |
| Fractured / bank-f17 | Leave the Wall Standing | 4 | Clear the void exit from below and park its obstruction as a canopy before spending the preparation route. |
| Fractured / bank-f18 | The Thawing Track | 5 | Use the frozen cart for a high launch, then let the thaw move that same cart into a low light shield. |
| Fractured / bank-f19 | The Weight Must Stay | 5 | One swap must leave a gate weight behind while transporting both cargo and carriage launch. |
| Fractured / bank-f20 | Open the Other End | 5 | Relocate the portal through a slit to reach a stone’s blocked rear face and rebuild the high return step. |

**Cargo clasps** are the new base mechanic, used in **B16 and B17**. An open ring catches a loose lantern, preserving shade or weight while the knight leaves. Grab retrieves it; strike releases it. The empty ring is not a platform or beam shield. See [the mechanic rules](../design/CARGO-CLASP.md).

**F16 and F17** use the existing void dash-through mechanic. The other Fractured rooms develop thawed cart positioning, echo/weight/momentum exchange and portal relocation. Only one new room uses portals. Base routes use no advanced momentum; the harder side can depend on transporting launch momentum between places.

## Focused checks and limits

All **21 active room tapes** exit with zero deaths. The catalog verifies the 5+5 additions, both mechanic quotas, and the exact banking decisions. Recorded versions of the four reported shortcut routes no longer exit; the records also describe focused checks against obvious substitute routes in the new rooms. This does not claim that every possible alternate solution is excluded. Physical geometry carries the constraints; there are no hidden device-use receipts at exits.

The cargo-clasp check covers catch, ID-zero cargo, sustained shade, pickup/re-catch, blade release, gravity, retry and opt-in behaviour. The browser check passes approved/review group membership, real completion rating/CSV, play clock/pause and all **14 new or changed room renders and completions**. Changed layouts and the selection menu were visually inspected. Saved source/tapes are under `scripts/room-bank`; the manifest and route report are beside this guide; browser captures are under `scripts/climb/.cache/room-bank/`.

The local bundle was rebuilt without publishing. Human ratings will decide which new/revised candidates enter the approved reserve. The larger spare pool and distributed playtest series remain later work.
