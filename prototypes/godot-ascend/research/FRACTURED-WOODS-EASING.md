# Woods playtest adjustments · 0.37.0

Pod and Crossing had narrow execution windows, while Wall needed a stronger requirement to visit its outward and returning locations. This revision adjusts landing space and adds the two-item return objective. It changes only chapter 22 rooms 37–39, their hints/references and the continuous Woods recording. Bridge remains banked. Player physics, device timings, other room definitions, quests and voices are unchanged.

## Pod

The Amber runway extends two 8px tiles toward the destination. The Blue landing starts one tile closer and gains a catching tile on its far edge. The sealed canopy and guarded outside face remain.

The initial proposed two-tile closer destination, combined with the wider runway, reopened the recorded coyote-jump shortcut. That candidate was rejected. The final one-tile adjustment blocks that exact shortcut and keeps the intended two-pod, one-bell powered route.

## Crossing

The upper Amber landing extends two tiles to the right. The Blue pod housing opens one tile higher across its guarded passage, and the destination begins two tiles closer with a wider catching surface. The upper approach demonstration walks farther left to reach the bell after the widened platform changes where its preceding jumps land.

The sequence still rings the upper bell without consuming the launch dash, lands a down-right dash on Amber, launches low and preserves horizontal speed through the high pod rebound. No midflight resting platform or extra refill is added.

## Wall

The Amber cap is two tiles thick and extends one tile farther outward. The pod retains its existing position. The demonstrated rebound continues outward briefly before turning back, clearing the enlarged cap.

Two required shards occupy the outward rise at (240,192) and the return near the crumble at (184,144). Both must reach the home flag. A full-height visible gate at x=544 opens only after the player stands on that flag with both shards. Merely collecting both away from home, or reaching home with either one missing, does not open it. The gold flag is drawn using the existing workshop flag renderer; the campaign HUD reports collection and return status.

`puzzle_returns.gd` applies these rules only to puzzle studies with the existing all-shards requirement. Core room reloads reset the returned state and gate. World progress does not bank these pickups as permanent campaign bearings. Ordinary campaign bearings and workshop rules retain their existing behavior. The return gate cannot be opened by the ordinary stake-gate condition.

The pickups enforce visiting the outward and returning locations. They are not an input quota or proof that every possible alternative movement route has been eliminated. The geometry and adversarial checks separately examine pod-free alternatives.

## Verification

`tests/fractured_woods_easing.gd` compares the same 108 dash-duration/follow-up-delay samples per room against `tests/fixtures/woods-036-before.json`. It counts deathless clears that actually perform a powered launch. Pod increases from **38 to 42** successful samples; Crossing increases from **11 to 24**. These finite samples establish more timing tolerance for the demonstrated sequences, not a measure of human enjoyment or a promise that the rooms will feel easy.

The same suite runs the actual application to check each missing-item arrival, physical exit blocking, both-items-without-return rejection, independent death/retry resets, HUD feedback, a complete intended clear, onward travel and complete Watch playback. Existing physical regression witnesses have been updated for Wall's new outward steering; five adjusted departures/returns remain deathless, with both pickups, one pod rebound and a final powered launch.

The existing route-family suite retains its historical positive controls and 1,221 shortcut variations. Source/native round-trip checks, individual app references, camera checks and the complete chapter tour remain applicable. The updated full tour visits the existing 24 regions in 8,696 frames with zero deaths. Packaged suites run against the actual signed application and shipping PCK, with the test-only overlay and missing-script negative control.

A fresh pickup-aware, pod-free Wall search starts before the capped climb, leaves powered moves available and finds no finish in 30,000 branches (budget exhausted). Its finite action set and beam pruning do not prove uniqueness. The search snapshots retain return state and distinguish which shards were collected.

The tour exporter now includes the final crossroads in its visited-region metadata, matching the application's actual 24-region playback.

All **25 suites** passed against the final signed 0.37.0 app and shipping PCK, including the complete Woods journey and 1,221 shortcut attempts. `final-verification.json` records every verified suite log and the shipping pack hash.

Private tuning, logs, screenshots and packaged results are under `.cache/godot/woods-ease/`; no evidence cache or private feedback is committed. The unrelated local World 1 scene retains SHA-256 `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.
