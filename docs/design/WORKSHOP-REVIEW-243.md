# Review 7.243 — verification and acceptance notes

No room is approved by this pass. Preserve both banks (nine layouts and tapes). M remains a candidate until user review.

## Acceptance contracts

-  H-F: independently authored switching layout with integrated mechanics throughout, no final high-wall vault requirement.
-  K/K-F: actual per-pickup remaining flight time shown at completion, including automatic transformations. All midflight refills <0.5 seconds on fastest feasible routes; no brake-dependent tuning. Flight expires before each zipline; its crossing cannot be replaced by flight/dash/air jump. Springs required for sharp redirects in varied directions. K-F has a separately authored route and no high-wall vault ending.
-  M: low hoist launch clears the first vine's pillar naturally. Both vines must be landed on to traverse their geometry. M-F is independently authored, with these same reliable transitions and a combined finish.
-  N-F/O-F: independently authored routes that mix pursuit/recoil with other mechanics throughout, not a base layout followed by an extension.
-  P-F: preserve accepted arrangement; repeated recharging dashes cannot produce flight/hover. Lantern automatically recovers after a missed throw so the puzzle cannot strand it.
-  Q: physical layout requires ground-pound rebound; lift-to-zipline shortcuts fail. Q-F gets a distinct arrangement, same rebound dependency.
-  Verification: legal successful routes plus active omission/shortcut searches, both-bank fixtures, retry/input checks, co-op, visual inspection and local build. Existing release failures remain tracked, no publication.

## Design approach

Timers alone cannot establish necessity if the player can coast through the next transfer. Use separated catch shafts and long zipline crossings; use spring-shaped hairpins with enough speed/turn-radius pressure to require the kick. Flight telemetry records real player performance; do not infer it from a single slow recording. Refills retain fixed authored durations, never adjust to the player's remaining time.

## Implemented

All ten requested candidates are revised. H-F/M-F/N-F/O-F/Q-F have independently placed geometry and different movement orders. P-F retains the accepted arrangement. M remains unbanked for the next user review. Both banks retain their nine approved layouts and input hashes.

The flight courses have three chapters each, with one fresh transformation and one refill per chapter. Fixed budgets are based on authored path length and spring turns; fresh transformations centre the form within their seed lantern. Straight, unbraked travel is the reference route. Small inner root spurs close two diagonal spring shortcuts while keeping the cardinal approaches clear. The widened sentry pockets leave room around the slow projectiles. Flat adjacent collision faces are merged without changing the carved free space.

| Course | Refill 1 | Refill 2 | Refill 3 | Successful input frames |
|---|---:|---:|---:|---:|
| K | 0.327 s | 0.327 s | 0.383 s | 2,122 |
| K-F | 0.217 s | 0.313 s | 0.347 s | 2,152 |

These are actual pickup-time samples from successful no-brake routes. The in-game completion table records each player's own times, rather than displaying these reference numbers. New transformations have no prior charge and are labelled separately. All six natural expirations occur before entering their ziplines.

## Evidence

- 25 legal routes and 52 removal/delay trials pass on final source in movement-only mode. All four room playlists remain. The full native picker check passed earlier in this pass; its final rerun stalled in headless UI automation, so that earlier result is retained as historical evidence. `movement-verification.json` carries final source hashes.
- Ten candidate routes, 30 simple skip policies, 20 integrated-mechanic removals, 6 individual refill removals, curved-passage clearance samples, and clean retries.
- Flight search: 260 spring omissions, testing 8 unbraked turn distances plus 2 braking strategies; 120 cable omissions, testing dash delay/direction/repetition after natural expiry. All 380 attempts were blocked on final geometry; results are recorded in `flight-shortcuts.json`.
- 600 targeted movement alternatives: 150 each for M's second vine, M-F's second vine, Q's ground pound and Q-F's second ground pound. No successful bypass found.
- P-F: repeated upward dashes from ground, isolated free-air up/diagonal/horizontal dashes with and without the lantern, missed-throw automatic recovery and hold-A recall. Recharge remains available while sustained flight fails.
- N-F: physical rock blocks the missing-pogo route; a second rock blocks the missing-ring route. Its ring alone uses a swept-body line-of-sight check to prevent pulling through the first rock. The intended pogo/ring route completes in 617 frames.
- Nine banked layout/input hashes, 200 direction vectors/native input chords, first-three presentation fixtures and 20 world/simulation/platformer unit tests passed.
- The full 50 simultaneous/staggered two-client runs passed earlier in this pass; all six subsequent K/K-F/N-F runs passed on final geometry. Transport uses production packet handlers in memory, not an internet latency test.
- Original Standard/Fractured routes passed with 7,641/4,017 frames and zero deaths. That runner completed its assertions/evidence but stalled during cleanup; its idle process was terminated. Dash Foundry passed its five recorded route/removal scenarios on this pass, but its native UI phase hit a browser automation timeout, so a fresh full Foundry pass is not claimed.
- Current candidate captures were inspected, including the narrow bend/sentry chamber and N-F's vault/pogo/ring arrangement. Completion-table content is checked against actual receipt values. Optional full-page captures use `verify:workshop-feedback -- --capture`; headless screenshot timeouts do not replace those content assertions.

Reports and legal tapes: `../charters/celeste/evidence/workshop/`. The reference paths prove completion and expose tested shortcuts; they are not an exhaustive path search or a human difficulty rating. Owner review still determines whether each candidate is ready to bank.

## Build scope

Local 7.243.0 / cache `bladefall-v353-distinct-routes`, 235 mirrored game assets. No publication. The release checker still reports its four existing failures: missing Astra/Fable editor references in the index, index size and respec-renderer size. No new release-check failure is accepted by this pass.

