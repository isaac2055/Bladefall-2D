# Room Bank — batch 04: readable timing

**7.289.0 · 2026-10-07 · five new base and five new Fractured candidates, plus five revisions.** Rooms remain outside campaign progression. The complete set is saved, integrated and ready for room review.

## What is ready for review

Open **Extras → Room Bank → To review**, or [the local review menu](http://localhost:8371/precision.html?pitch=bank&mode=review). The queue has **nine base rooms** (four revisions and five new) and **six Fractured rooms** (one revision and five new). The **Banked** tab holds **16 approved reserves: eight per side**. The active pool is **31 rooms: 17 base and 14 Fractured**.

Review mode requests Fun /10, Difficulty /5, Suitability /5 and an optional comment; Rate room also records unfinished attempts. Play mode omits surveys and keeps the set timer. Cards retain stable IDs, and exported reviews retain room-definition hashes, so earlier feedback remains attributable after a revision. The estimates in this guide are designer estimates, not user ratings. Banking records qualitative approval only.

## Decisions from the latest user review

| Current side | Stable ID / room | Decision |
| --- | --- | --- |
| Base | bank-b13 — The Missing Stop | Removed the invisible upper one-way strip; the finish crosses between visible stone surfaces. Banked after this requested fix. |
| Base | bank-b19 — The Long Way First | Banked unchanged. |
| Base | bank-f20 — Open the Other End | Transferred from Fractured and banked; geometry and intended tape are unchanged. Its historic ID remains `bank-f20` to preserve reviews. |
| Fractured | bank-f11 — Inside the Elbow | Banked unchanged from the previous revision. |
| Fractured | bank-f13 — Break the Wrong Bridge | Banked unchanged from the previous revision. |
| Fractured | bank-f16 — Return Freight | Banked unchanged. |
| Fractured | bank-f18 — The Thawing Track | Banked unchanged. |
| Fractured | bank-f19 — The Weight Must Stay | Banked unchanged. |

Earlier approved B05, B11, B12, B14, B15, F12, F14 and F15 remain banked. The nineteen rejected batch-01 rooms remain archived and excluded. The new additions are evenly split 5+5; the overall side totals differ because the user moved F20 into base.

## Five harder revisions — design spoilers

These are **Revised**, awaiting another review, not banked. Originals are preserved under `scripts/room-bank/archive/batch-03-before-review/`. B19 was not revised.

| Stable ID / room | Estimate /5 | Meaningful change | Saved route |
| --- | ---: | --- | ---: |
| bank-b16 — Hands for the Chimney | 4 | After the shaded climb, send the recovered lamp through a second eight-pixel cargo duct. It replaces the opened gate's shade; wait safely on the duct roof, then descend through the shutter's dark window. | 688 frames |
| bank-b17 — Ceiling Keeps the Key | 4 | Launch the lamp through a cycling heat throat during glass. A premature release destroys the cargo, so waiting for an automatic delivery no longer solves the timing. The ceiling clasp still preserves its weight through the second gravity change. | 803 frames |
| bank-b18 — Floor You Need Gone | 4 | The spent pier also shields a beam. Time the departure that removes it, then keep the final return low beneath the exposed light. | 1,138 frames |
| bank-b20 — The Door You Need Closed | 4 | The sliding stone's old permanent stop now cycles between stone, heat and glass. Use the closed gate as a safe observation perch; push while the stop will catch the stone beneath the beam. | 591 frames |
| bank-f17 — Leave the Wall Standing | 4 | Two visible downward thorns guard the plug's reachable side. The lower passage still allows the upward strike; void transit supplies the receiving approach above the lip. | 602 frames |

The four base revisions retain ordinary movement. B16 retains its one original cargo clasp; its second duct stops cargo naturally. The B17 release window is a player choice with a recoverable room retry, not a timer that cargo can simply wait through. Each revision retains a safe place to observe before committing.

## Ten new timing candidates — design spoilers

The user favoured **Return Freight** and **The Weight Must Stay**, then asked for moving environmental hazards with visible paths, places to wait and timed actions. This set explores that request. See [timing design](TIMING-DESIGN.md) for the research and design rules, and [timing patrols](TIMING-PATROLS.md) for the new opt-in hazard's behaviour. No new-mechanic quota applies to this batch.

Every new source record describes at least two cue/action/rest stages. A clean route may carry a favourable cycle through a rest spot without stopping; the goal is readable timing decisions, not mandatory idle time.

| Side / stable ID | Room | Estimate /5 | Timing problem and rest space |
| --- | --- | ---: | --- |
| Base / bank-b21 | Passing Places | 3 | Follow a departing patrol, duck into a recess before its return, then climb out behind it. A broad middle bay separates the two passages. |
| Base / bank-b22 | Wait Below the Lip | 4 | Judge the landing and climb after a crossing, not only the opening at takeoff. Alternate between protected outer ledge ends. |
| Base / bank-b23 | Miss One Ferry | 4 | Choose a ferry by the patrol it will meet later; the central pier lets the player reject a poor second connection. |
| Base / bank-b24 | Carry the Quiet Moment | 4 | A slow cargo glide reaches a patrol later than a normal fall. The middle pier resets the decision before a longer drop and beam-shade delivery. |
| Base / bank-b25 | A Floor Until It Opens | 4 | Cross two patrol lanes via a raised refuge, then return during glass and drop through the former floor. A lower island prepares the last horizontal-patrol crossing. |
| Fractured / bank-f21 | Between Passes | 4 | Climb after a wall patrol passes downward, then cross to a hanging rest below a second patrol before the final launch. |
| Fractured / bank-f22 | The Return Window | 4 | Spend the upper bridge on the outward trip; use recesses to let patrols reverse before the lower return. |
| Fractured / bank-f23 | Shorten the Arc | 5 | Reel a chain into a safe short hang, pay out for the tally after a pass, then read a separate patrol before transferring rings. |
| Fractured / bank-f24 | Both Ends Clear | 4 | Check both portal approach and receiving mouth before entering. The receiving shelf gives a separate safe read for the exit jump. |
| Fractured / bank-f25 | Freight Has Right of Way | 5 | Step off the moving deck into a central refuge; choose outward and returning boardings around distinct patrol crossings. |

Sweepers have deterministic, visibly dotted routes and direction cues. They are lethal moving hazards, not platforms, shields or cargo carriers. The clock starts with input and resets with the room. Jump forgiveness is preserved; B25 enables the existing Down + Jump drop-through action. Base routes require no super, hyper, ultra or wallbounce.

## Checks, limits and next step

**Validation complete.** All 31 saved routes finish with zero deaths; all 34 recorded negative routes remain unable to exit. The membership contract passes: 16 banked, five revised and ten new, with five new per side and at least two timing stages each. The focused sweeper smoke passes. The browser check passes Extras entry, group counts, rating submission and CSV revision IDs, play clock/pause, F20's legacy deep link resolving to base, and rendering plus clean completions for all 16 new/changed rooms. All 16 received a visual pass. F25's saved route is 413 frames.

The missing generic one-way-platform renderer is fixed, so existing platforms such as B20's are visible. F20's geometry and tape match its archived Fractured record exactly. The local bundle was rebuilt with 410 game files; no publication or broad campaign sweep was performed.

Focused negative routes cover the reported F17 shortcut, premature beam crossings, lost/overshot cargo, and obvious patrol rushes or skipped connections. These checks demonstrate specific failures; they are not an exhaustive claim that alternate solutions are impossible. Constraints are physical, with no hidden device-use requirements at exits. The saved routes establish feasibility, not fun, measured difficulty or suitability.

Sources and tapes: `scripts/room-bank/base/` and `scripts/room-bank/fractured/`. The exact membership contract is `scripts/room-bank/catalog.json`. Generated manifest and route report live beside this guide; browser evidence lives under `scripts/climb/.cache/room-bank/`. This work is local only; nothing is published. The remaining review queue, broader reserve and agreed distributed-study protocol precede the full playtest series.
