# Continuous lifts and story — 0.47.0

## Requested behavior

Title-menu Settings leaves the music playing. In-game Settings pauses it. Developer/test N completes the current challenge using real completion, perfect/shiny award and unlock logic; it preserves deaths. Normal player mode cannot use the shortcut. N deliberately writes local records and rewards, as requested.

Affixed-room travel is now one uninterrupted ride from the previous finish into the next puzzle, including the first boarding. The previous intermediate gallery landing, walking requirement and second descent are removed from the playing route. Galleries remain available for inspection. Each puzzle retains its own checkpoint. The same saved ride state and smooth curve cover the entire transfer. Older gallery-bound in-flight saves retarget the actual puzzle from their current point, preserving position and puzzle progress. Outskirts snapshots from before the added bonus metadata remain compatible with the unchanged scene/physics data.

## Story presentation

The first lantern-route landing establishes the broken upper road: district-specific skyline, ruined piers, lantern signals and an empty cradle lowering toward the knight. Outskirts uses the watch road; Woods uses the ranger crossings; Causeway uses the freight winches. A short caption provides context. The reveal is saved once per world; death does not replay it. Developer mode replays it once per restarted world so N can test it.

World clears persist rewards/unlocks before the ending begins. The knight steps along the existing finish ledge only where the actual terrain supports it. Lanterns dim in sequence, the next district appears in the skyline and the actual earned root/flower/Core reward appears above the knight. The results card fades over the same final camera/background. No finale rooms are created and individual checkpoints remain. Reduced motion shortens the scenes and removes the camera pan. No quests or generated voices were added.

## Bonus hearts

These are optional side-route rewards, separate from affixed main-road puzzles. Outskirts Hang Time previously had no secret-reward metadata; it now has a purple heart at the upper finish. The bell tower also has a purple pickup. Existing Woods/Causeway secrets and Fractured optional branches render purple and feed the persistent Garden count. Visible secret pickups are collectible by touch, including practice entry; hidden entry flags no longer silently disable them. Quest hand-in hearts remain.

## Evidence

`tests/road_presentation.gd` checks actual title/game audio pause state, normal-player rejection of N, complete developer base routes and their single first-time reveal, direct ride destinations/checkpoints/continuous position steps, perfect awards, all-three-base gating, Fractured clears and carried shiny flowers, Core/shiny rewards, retained deaths, ending before results, persistent story memory and heart collection in all six optional-route families.

`tests/bonus_routes.gd` verifies normal-input tapes physically reach all four base bonus pickups with zero deaths, including the newly positioned bell-tower heart. The Woods secret entrance/return test also passes its 1,116-frame route.

`tests/sampler_journey.gd` traverses the real Woods route and ten appended challenges with ordinary gameplay inputs, now docking directly in each puzzle. `tests/sampler.gd` verifies approved puzzle tapes and direct first boarding. Existing save/progression and complete sampler checks remain in the packaged suite.

Actual GPU captures from `tests/road_shots.gd` cover all three establishing shots, endings and results, plus the Hang Time heart. Captures are local `/tmp/bladefall-v47-*.png`; packaged verification is in `.cache/v47-package-check/pack-results.json`, with final bonus/story/save regression checks in `.cache/v47-package-final/pack-results.json`.

The native scene files, including the player's edited Outskirts, remain unchanged. Record route version sampler-3 keeps the shortened transfer times separate from old local records.

Release verification: all 13 broad packaged suites passed; the final bonus-route, story and save-compatibility checks passed; the final comparison-navigation/story check passed. ZIP integrity and the app's deep code signature verify, bundle version is 0.47.0, and edited World 1 retains SHA-256 31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47. Final navigation evidence is in `.cache/v47-package-navigation/pack-results.json`.

Direct developer-world startup also enables story triggers before N is used. This launch case and comparison navigation pass the packaged check in `.cache/v47-package-launch/pack-results.json`.
