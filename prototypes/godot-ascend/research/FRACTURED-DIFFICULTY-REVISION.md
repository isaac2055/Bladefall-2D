# Four Fractured difficulty revisions · 0.35.0

Bridge was subsequently accepted by the user. The Woods layouts and limited necessity checks below were superseded by the [0.36.0 route revision](FRACTURED-WOODS-ROUTE-REQUIREMENTS.md) after three easier alternatives were reproduced.

2026-11-02. The user approved applying the four proposed fixes after finding the 0.34.0 Bridge and Woods additions too easy. Only chapter 21 room 46 and chapter 22 rooms 37–39 are revised. Independent checkpoints, normal input buffering, movement constants and device timings remain intact. This is geometry and route work, with no action quotas or new mechanics.

## Why the previous acceptance criteria were wrong

Bridge eased several constraints simultaneously: larger roof/opening, more clearance, lower/closer finish and a shorter input sequence. Its test explicitly welcomed an ordinary-jump fallback. The Woods tests explicitly required references without advanced movement, despite earlier Fractured Woods already teaching hypers, wavedashes and preserving speed through downward cuts. Successful recordings and forgiving timing samples established playability, not the requested difficulty.

The new references combine those taught skills. Safe planning remains before commitment, but the first two Woods payoffs have no resting contact from the wavedash to the flag. The wall room adds a temporary crumbling launch between its wall/pod transfer and final tunnel. Human playtesting still decides whether these meet the intended difficulty and feel.

## Bridge Above Your Landing

Restore the original six-tile roof and crumble opening and the flag at y=184. Restore the original lateral setup and correction sequence. Raise only the ceiling pocket over columns 24–27: its roof moves from rows 24–25 to 22–23, and its old underside is cleared. The rest of the original geometry is preserved. Nearby setup hops of 8–12 frames clear the new reference; this is sample coverage, not a claim of a unique timing window. The former 20-frame ordinary-jump fallback fails. Both previously witnessed intact-cap shortcuts still fail, while their earlier positive controls still clear.

## The Pod Beneath Two Ceilings

The first rebound reaches the bell ledge. The bell is higher, requiring a jump/upward cut from that ledge; the former brief airborne ring from the right no longer prepares a finish. After ringing blue, return beneath the closed cap and cut the same pod for a low rebound. A down-right dash makes the short amber runway, and its landing supplies the recovered wavedash charge. The low canopy and gap make speed useful; the final upward-right dash makes the blue landing farther right at x=416, y=248.

A fresh input search found a coyote jump off an early, longer runway, followed by a late horizontal dash. That actual shortcut is preserved in `woods-runway-shortcut.json`, with its earlier geometry as a positive control. The revised runway ends sooner and the landing begins farther away. The recorded shortcut fails on the revision, and the preferred wavedash still clears across nearby dash/setup timings.

## Ring It After the Crossing

The shared bell moves into a roof window. Its first useful approach is below the roof: jump and strike up-right before the low entrance dash. The ordinary route must go round the roof's far end to stand above it. From the upper amber root, jump and cut down-left at the same bell. That turns blue and removes the root; the following down-right dash restores amber and lands into the wavedash.

Carry that wave right into a downward high pod cut. Hold right and jump through the cut to retain sideways speed and rebound high. A later upward-right dash makes the blue landing at x=432, y=192. Resetting sideways velocity to ordinary run speed at the pod makes this reference miss the destination. The finish moves to the far side rather than the old home ledge so a bell/pod demonstration is followed by a consequential momentum transfer. Plain one-way steps after the flag lead to the unchanged gallery exit.

## The Wall You Must Bring Back

Cross through the absent wall and restore it from the bell bank. Climb partway, then wall-jump away to the pod at x=264, y=208, rather than holding climb until a pod against the wall. The downward high cut and up-left dash return through the upper wall onto a crumbling ledge. Move clear of the wall before the next down-left dash restores it behind you. Wavedash beneath the low roof, then dash straight upward beside the blue flag and steer left to land.

The low roof's top is hazardous, preventing a normal jump onto it from replacing the tunnel. The restored wall's climbing face and finite stamina remain relevant; the reference spends under 90 frames climbing. The later crumble contact creates a departure decision rather than another long static rest. Exit steps are adjusted to be reachable from the revised flag.

## Verification and limits

`fractured_woods_three.gd` checks all four deathless references, one wavedash per Woods reference, pod/bell and wall counterfactuals, momentum through the Crossing pod, nearby setup/execution samples, no intermediate resting contact during the first two Woods payoffs, and actual shortcuts with playable earlier positive controls. The previous easy recordings and bell-only alternate remain historical controls, rather than being silently deleted.

`fractured_woods_difficulty_search.gd` runs fresh bounded input searches: an ordinary-movement positive control on the former runway, searches for ordinary-movement substitutes from the three payoff decision states, and pod-free searches from spawn. The search retains exact movement/input/entity state and uses finite budgets and beam pruning. Failure means no route found within that search, never that all alternatives are impossible.

`fractured_woods_three_app.gd` checks native/source parity, preserved older rooms and metadata, actual application clears, complete Watch exits, camera framing and independent death/retry resets. Full chapter journeys retain their previous input prefixes up to the first revised room, then follow new recordings through the crossroads: chapter 21 covers 17,426 frames/28 regions and chapter 22 covers 8,718 frames/24 regions, with zero deaths. GPU captures inspect the revised setup, transfers and flags. Existing campaign, workshop, editor and quest suites remain regression checks.

Historical report, corrected in 0.36.0: the old harness listed 23 packaged suites, but this is not valid packaged evidence. It accepted zero exit codes when excluded scripts failed to load. The reported list was: `fractured_woods_three`, `fractured_woods_three_app`, `fractured_woods_feel`, `fractured_nine`, `fractured_nine_app`, `feel_journey`, `fractured_next`, `fractured`, `section_menu`, `campaign_workshop`, `application`, `world_checks`, `world2_journey`, `world3_journey`, `black_woods`, `causeway`, `fractured_next_app`, `fractured_puzzles_app`, `fractured_journey`, `workshop`, `six_puzzles_app`, `five_puzzles_app`, and `editor_play`. The additional source search suite passed its positive control (12,409 branches), all three ordinary-payoff searches (20,000 branches each), and all three pod-free spawn searches (25,000 branches each). Local logs, search outputs and twelve GPU captures are in `.cache/godot/difficulty/`; these are not committed. The unchanged user World 1 scene SHA-256 is `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.
