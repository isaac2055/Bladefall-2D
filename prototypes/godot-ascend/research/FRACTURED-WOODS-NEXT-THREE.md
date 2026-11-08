# The next three Fractured Woods additions · 0.39.0

2026-11-06. The user approved these three proposals for implementation after banking Pod, Crossing and Wall. Those three accepted rooms are unchanged. These are additions four through six, awaiting human playtest acceptance.

## The Branch That Arrives Late

The permanent bank lets the player observe two resin branches alternating on a 120-frame beat. Jump onto the first, then leave before the lower branch hardens. The second branch supplies a down-diagonal landing and dash recovery beneath the canopy. Wavedash through the low passage, then spend the recovered dash toward the amber finish.

The resin clock is independent of dash/bell phase. Dashing does not conjure the timed branch. Its useful contribution is a future landing, while the final dash creates a separate amber surface. The canopy reaches the room ceiling so its top cannot replace the intended lower route. The landing extends beneath the canopy; the overhang and finish gap distinguish a slow departure from the powered transfer. The existing movement constants are unchanged.

## The Lantern Above the Door

Prepare blue, carry the lantern over the upper gap and set it on the pressure plate. Its blue support sits above the low pressure door. Drop through the gap on the left, then walk through the open door before dashing. Beyond the door, the down-diagonal landing dash creates the amber runway and removes the lantern's support. The subsequent wavedash crosses beneath the canopy; its retained dash restores the blue finish.

The upper wall prevents walking through at plate height. The lantern is actual movable cargo, the plate reads its weight, and the held door uses its existing collision. There is no delivery flag or new quest. Leaving the lantern is preparation for empty-handed movement; the later phase change deliberately dismantles that preparation. A stationary downward placement is demonstrated, rather than a narrow timed throw. An equivalent throw onto the plate is a legitimate alternative.

## The Runway Under the Roots

A lower-bank dash prepares blue, removing the amber ceiling above the seed. A high sword rebound reaches the far permanent shelf during the outward lash's rest. Cut the crown from that shelf: the existing crown mechanic silences both lashes. Hop back, dash down-left onto the restored amber runway, wavedash beneath the low roof, and spend the recovered dash toward the blue home flag.

The crown changes the hazard itself. It is not a hidden action quota or a new boss finale. The runway is shortened and the roof overhangs its homeward end; the finish has a guarded lower approach. This prevents the demonstrated walking and ordinary jump/dash replacements while leaving clearance above the guard for the preferred transfer. The far shelf supplies a real rest before the return.

## Celeste relationship and scope

These adapt the prior [Celeste research](FRACTURED-OUTSKIRTS-CELESTE-1B.md): anticipate contact, choose recovery order and let preparation change a later movement opportunity. They do not copy Celeste geometry or assume its physics. Thorson's [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) supports allowing timing and positioning tolerance around demanding moves. Here that means testing nearby successful inputs and keeping a safe place to inspect or prepare before each transfer, rather than changing the shared controller.

Each room has an independent checkpoint, optional H hint, complete Watch reference and native editable scene data. Machinery waits for the first input. The additions extend chapter 22's road before its crossroads; previous room definitions, recordings, placements, quests and secrets are preserved, apart from the crossroads position and incoming destination. There are 43 definitions and 19 required main challenges, including six native additions. The separate workshop remains 30 rooms.

No new art, voices, quests, runtime mechanics or movement constants were added. The browser game and browser editor are unchanged. Existing carried-lantern, resin, crown, lash and phase behavior supplies all gameplay.

## Verification

`fractured_woods_next.gd` checks deathless powered references, anticipated resin contact, lantern placement/open-door traversal/support loss, the seed/crown sequence, physical counterfactuals, nearby timings, reproduced earlier shortcuts and exact timed-device snapshot/replay. `woods_search.gd` now snapshots the independent resin and lash clocks and crown state; explicit options permit testing advanced alternatives separately from ordinary movement. These are test-infrastructure changes, not controller changes.

`fractured_woods_next_app.gd` checks preservation of all 40 prior definitions and recordings, previous checkpoint placements, shared constants, native/source parity, named selection, hints, actual clears, full Watch exits, independent death/retry restoration and replay after retry. Its optional source directory argument checks the user's unrelated World 1 scene in packaged runs.

`fractured_woods_next_search.gd` includes reachable positive controls, ordinary-movement attempts from prepared departures, missing resin contacts, an unloaded door, an uncut crown and seed-free ascent attempts. Each case allows at most 24,000 branches with beam pruning. A negative result means no route found within those limits; it does not establish uniqueness or eliminate all creative shortcuts. Earlier successful bypasses are retained as positive controls in fixtures.

The complete chapter recording and actual-camera journey verify the new rooms within the road. Packaged checks use the signed shipping application with a test-only overlay and require real assertion output, reject script/runtime errors, and reject a missing-script negative control. Private logs, search reports and gameplay captures are in `.cache/godot/woods-next/`.

Final signed-app verification: **29 packaged suites passed**, including all eleven search cases. The complete Woods road covers **11,450 normal-input frames through 27 regions with zero deaths**, preserving the previous 8,682-frame recording as an exact prefix. All forty prior room definitions and recordings are preserved apart from the documented crossroads incoming link; the user’s unrelated World 1 scene retains its original hash. Six reproduced earlier shortcut witnesses clear their earlier layouts and fail the revisions. Gameplay captures were inspected at preparation, launch and finish.
