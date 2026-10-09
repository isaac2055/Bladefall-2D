# Room-bank review handoff — 7.293.0

Ten approvals saved: B26, B31–B34, F34, B35, F36, F37/F38. The last two moved to Base with stable IDs and original geometry/tapes. Bank now32: 19 Base/13 Fractured. Eight revisions ready: F30, F31/F32/F33, B36/B37/B38, F35. Three new companions: B39 fixed Base selected-lift lesson, F39/F40 harder versions of the two banked hook rooms. Repeated B37 feedback treated as B38. All eleven await user review; no invented numeric scores. Run4 proposal saved, no Run4 rooms built.

F30's real bug was an echo swap retaining its old rope. The rope then converted teleport displacement into extreme velocity. Successful swaps now release via the hook module first; blocked swaps preserve the tether. Canonical keeps Grab held and presses Echo; landing widened/lowered. 108/132 varied finishes,14 consecutive direct-swap timings. Actual default P, remapped E and RB controller routes pass with no deaths. Controls/hints identify the Echo binding.

F31/F32 final opening uses a live beam, phase shade and spent launch foothold. This blocks both original ordinary-movement routes and the independent walk-cut/forward-hyper routes without narrowing the original7–11 reversal timings. F32 adds lantern catch, beam shade and a pressure-roof deposit. F33 replaces wallbounce with guard as support/shield/sealed-tally cover and one-time back-cut launch; ordinary jump over guard is a recorded valid alternative, pogo not mandatory. B36 seed placement becomes portal exit height; B37 obstruction becomes dismount bridge; B38 cargo rides above while knight hooks below, then clasp/retrieval supplies final shade. F35 sends its lantern launch weight into the gate basin. F39 leaves an echo holding a rail opening before moving-hook transfer; F40 redirects light and lets the carrier expose a sealed tally before returning under shade.

58 active rooms:32 Base/26 Fractured; groups Run1 0+1, Run2 0+3, Run3 4+3, earlier review9+6, banked19+13. All58 canonical routes,264 positive variations,124 negative probes pass. Focused echo/recoil/impulse/moving-hook and21 movement contracts pass, plus all8 existing campaign echo routes. Final browser check completes all11 revised/new rooms, reviews/CSV/current counts/play timer/pause and F20/F37/F38 legacy transfer links. Eleven layouts visually inspected. Browser harness now stops on first exit; otherwise a valid B38 tape's trailing input incorrectly counted a death in next room B39. This was a harness fix, not a room change.

47 non-revised original room definitions/tapes remain unchanged. Both design reports, main movement core and unrelated world lock are unchanged. Originals: `scripts/room-bank/archive/runs-2-3-before-review`. Baseline: `docs/room-bank/run-2-3-review-baseline.json`. Independent audit: `scripts/room-bank/run23-preservation-check.mjs`. Version7.293.0/cachev458-room-bank-review-23. Local bundle rebuilt; no publication or commits.

Current guide: `docs/room-bank/RUN-2-3-REVIEW.md`; next proposal: `docs/room-bank/RUN-4-PROPOSAL.md`; index `README.md`. Old Run1/2/3 guides are explicitly historical. Start at Extras → Room Bank. Stop for user review, do not begin Run4 automatically.

## Reproduction commands

```sh
node scripts/test-echo-hook.mjs
node scripts/room-bank/f30-input-check.mjs
node scripts/room-bank/run23-f3x-evidence.mjs
node scripts/room-bank/run23-preservation-check.mjs
node scripts/room-bank/build.mjs --check-batch
node scripts/room-bank/check.mjs --write
node scripts/room-bank/browser-check.mjs bank-f30 bank-f31 bank-f32 bank-f33 bank-b36 bank-b37 bank-b38 bank-b39 bank-f35 bank-f39 bank-f40
```

The local browser server is port8371. Preserve unrelated work and never publish without an explicit request. Detailed F30 evidence is in `scripts/room-bank/evidence/run23/`; per-room positives/negatives are embedded in each source. The exact independent pre-repair F31/F32 forward-hyper rooms and tapes are saved in `run23-f3x-before-commitment.json`. Any later revision should archive the current record and update its source hash; stable IDs keep older reviews attributable.
