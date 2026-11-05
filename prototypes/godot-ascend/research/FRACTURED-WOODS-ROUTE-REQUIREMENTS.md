# Woods route requirements · 0.36.0

2026-11-02. Implements the approved three-room revision following the user's accepted Bridge and report that the Woods routes remained skippable. Bridge is banked at 0.35.0: its chapter data, native scene, complete chapter recording and room reference are unchanged. Only chapter 22 rooms 37–39 and their hints/recordings are revised. Existing movement constants, forgiving controls, device timings, checkpoints, other rooms, quests, voices and art remain unchanged.

## Actual bypasses used as positive controls

All three 0.35.0 shortcuts were reproduced with ordinary inputs in the actual application before this revision:

- **Pod:** climb onto the canopy, refill, change phase safely, then ordinary jump/dash to the flag. Two pod contacts, one bell, zero powered launches.
- **Crossing:** jump from the fixed roof to the pod at ordinary speed and delay the final dash. One bell, one pod, zero powered launches; the upper bell and wavedash were skipped.
- **Wall:** climb higher, jump away and dash back onto the crumble ledge without touching the pod. The final wavedash remains, but the outward transfer is skipped.

`tests/fixtures/woods-035-bypasses.json` retains the exact prior room definitions and successful inputs. Its SHA checks protect the accepted Bridge and unrelated data. These are executable positive controls, not fabricated negative attempts.

## Pod: a ceiling without a substitute launch

The existing canopy extends to the room ceiling, removing its accessible top. Its right face is guarded above the low exit; the normal low route has clearance underneath. An upward dash and climb can no longer create an elevated rest, refill and independent phase change. The short amber runway and distant blue destination remain. The preferred route still uses the high/low pod setup, a down-diagonal landing, a powered low launch with its recovered dash, and a later upward-right dash to the blue flag.

## Crossing: preserve a dash at the upper bell

Remove the fixed upper roof and adjacent high resting platforms that supplied the easy pod launch. Replace the approach with ascending amber roots, including a lower far step and intermediate root. They lead back to the upper face of the same bell. Ringing blue while jumping removes the approach root without spending the dash; a down-right dash restores amber for the landing and powered launch. Preparing blue by dashing off that amber root spends the charge needed for this next contact. The blue divider extends down to the hazardous bottom, closing the lower climb-around.

Move the pod to x=336, y=240 and the blue finish to x=472, y=192. Blue housing surrounds the pod and extends to the ceiling, so an incorrectly phased approach cannot use its roof as another rest. The housing is thick enough to block a blade reaching the enclosed pod from outside. Guarded sides leave the correct low passage clear while preventing ordinary lower-bank climbing approaches. The intended route traverses the housing while amber; its final blue dash occurs after leaving it. The pod cut preserves sideways speed, and the later dash reaches the higher landing. Arrival edges, delayed dashes and grabbing the finish face are included in adversarial checks.

The first lower bell is a convenient way to prepare the entrance phase; existing ground-dash phase preparation remains a normal mechanic. The difficulty requirement is the upper bell/resource sequence and powered pod traverse, not an invisible count of bell strikes. The guided reference uses both bell contacts.

## Wall: cap the departure, then rebound around it

The restored amber wall has an overhang at y=200 extending right to x=224. It caps the useful climb below the crumble return ledge. The pod moves outside the overhang to x=248, y=232. Jump outward beneath the cap and cut the pod downward while holding jump. Its high rebound supplies the return height; the up-left dash removes both wall and cap and reaches the crumble ledge. The final low wavedash and upward dash beside home remain.

The old higher-climb shortcut cannot simply follow a raised ledge upward: the separate cap limits its departure height. The intended route keeps finite stamina and nearby timing tolerance. Moving the pod closer than the earlier study is a geometric consequence of jumping beneath the cap; its high rebound now supplies access the capped wall lacks.

## Verification approach

Correctness and difficulty necessity are separate questions. Preferred deathless references, native parity, full Watch exits, camera framing and independent retries remain application checks. New structural controls and adversarial tests examine states before the actions that might be skipped:

- Exact 0.35.0 bypasses clear their original definitions and fail the new ones.
- `fractured_woods_routes_required.gd` varies canopy climbs/refills, ordinary pod approaches from the bank and each relevant root, ordinary departures after the upper bell, higher wall climbs and pod-free returns. It also varies pod contact and late dash timing after limiting carried pod speed to normal running speed. The final wavedash is allowed in the pod-free Wall attempts.
- `fractured_woods_difficulty_search.gd` starts ordinary-movement searches before the Pod return, before the Crossing upper bell, and before the Wall climb. Separate searches remove the upper bell after the initial crossing, or remove the Wall pod before departure, while leaving powered movement available. The helper supports mechanic removal after its starting replay, so it does not invalidate the legitimate initial phase preparation.
- Bounded searches use exact snapshots but finite action sets, beam widths and node budgets. A miss is not proof of uniqueness or enjoyment. Successful harder alternatives are acceptable; no runtime action quota, mechanic-use flag or input sequence check is added.

The native editor and app use the same revised geometry. The source JSON and generated chapter-22 scene remain in parity. The full chapter recording retains the previous input prefix through the earlier rooms and reaches the crossroads through all 24 recorded regions. Local diagnostic evidence is kept in `.cache/godot/woods-forced/`, outside Git.

## Packaged-test harness correction

The old local harness accepted a zero engine exit code even when the production PCK excluded the requested test script and no assertions ran. The earlier 0.34/0.35 packaged-suite counts are therefore unreliable; their historical notes now say so. Source recordings and source tests were separate actual executions.

`python3 tools/check-macos.py --output /absolute/path/to/evidence` checks the actual signed app and shipping PCK. `test-pack-overlay.gd` creates an overlay containing **only** files under `res://tests/`; it cannot replace game scripts, data or scenes. The external bootstrap mounts this overlay before compiling the selected test. The runner requires the selected test to start, actual assertion output or an explicit completed-suite marker, zero exit status and no failure/loading/runtime errors. A deliberately missing script is a negative control. Raw source-file preservation hashes use an explicit source directory because export transforms native scenes; native/source semantic parity is checked independently against the production PCK.

The revised Wall also has five regression witnesses spanning departure durations 8–12 and cut durations 4–8, with adjusted return steering. An additional 600 local timing combinations produced 31 complete deathless clears. A single fixed tape's narrower window is not treated as the mechanic's timing limit.

## Completed evidence

The signed 0.36.0 game passed 24 actual packaged suites, including the 1,221 adversarial route attempts and three historical positive controls. Full Watch exits, independent death/retry, native/source parity and camera checks pass. The full Woods application journey visits all 24 recorded regions and all 16 required challenges in 8,685 frames with zero deaths. The accepted Outskirts/Bridge chapter remains unchanged.

Fresh searches from the earlier decision states inspected 20,724 branches for Pod (frontier exhausted) and 80,000 each for Crossing and Wall (budget exhausted). Separate upper-bell-removal and outward-pod-removal searches inspected 80,000 branches each with powered movement still available. No finish was found in those five bounded searches; their finite action sets and beam pruning remain limitations. The former-runway search positive control finds its old easy route in 12,409 branches.

Evidence is in `.cache/godot/woods-forced/final-verification.json`, with suite logs under `final-pack/`, `family-pack-recheck/` and `section-pack-recheck/`. The latter two confirm explicit assertion/completion output after correcting reporting-format mismatches; every underlying suite execution completed without gameplay failures. These private cache artifacts are not committed. Production game resources always come from the signed shipping PCK; the overlay supplies test code and fixtures only.
