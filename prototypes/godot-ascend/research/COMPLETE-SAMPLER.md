# Bladefall sampler 0.44.0

Implemented in `/Users/computer/Projects/Bladefall-Complete` on `codex/bladefall-complete`.

## Delivered

- Native Cores 101–103 consolidated with the latest approved Woods and Causeway work.
- Normal extensions: ten approved rooms per world, thirty total, using their shared editable World 4 source.
- Fractured additions: nine Outskirts, nine Woods, ten Causeway. Existing bank rooms retained. The superseded cover is skipped by the main route; the unapproved original weight draft is not appended. The five accepted comparison rooms are consolidated into native World 23.
- Continuous Bladefall lantern hoists and walkable galleries replace normal-world Up/flag navigation. Existing Fractured physical routes remain. Ordinary individual checkpoints are preserved.
- Persistent three-world Garden: base perfect root, Fractured clear crown, both halves unlock Core, Core clear earns an animated themed reward. Plain and shiny presentation is original procedural artwork, separate from physics.
- Owned complete plants and Core rewards appear behind the replay spawn. Walking back opts into a fresh carried run. Every death visibly drops the item and restarts the whole world; Retry also restarts it. Core lanterns cannot provide respawn progress in that challenge. Ownership survives failure. Chapter changes, quit, Watch and room jumps cannot resume or qualify an interrupted shiny attempt.
- Active-play time and deaths, world completion cards, persistent local top-20 boards per world and normal/shiny category. Pause time is excluded. Ordinary Retry counts as a death. Developer/practice playback does not earn awards or records.
- Editor lists all ten chapters; Fractured additions remain native editable rooms. No quests or new voices were generated. No Felix story/art was imported.

## Verification

The signed macOS package passed all ten suites through `tools/check-macos.py`: sampler, sampler_app, sampler_journey, run_profile, cores, world_checks, world2_journey, world3_journey, fractured_journey, woods_nine. The test runner rejected its missing-script negative control. No suite failed; total measured suite time was 123.5 seconds on this Mac. Evidence: `.cache/sampler-package-check/pack-results.json` and individual packaged logs (local, not committed).

Additional source journey checks reached actual completion and saved one record for normal Woods/Causeway, all three Fractured worlds and all three Cores. All six carried Fractured/Core journeys upgraded the corresponding reward to shiny without deaths. Outskirts checks cover the original movement/quest/retry paths and a separate ending-area fixture that plays all ten appended puzzles and connecting galleries in the real preloaded world; that fixture does not claim to record a single full Outskirts start-to-end run.

All thirty normal extension recordings and the five newest Causeway recordings clear unchanged. Actual ordinary-input walking reaches the gallery docks and lowers into the correct puzzle; every landing sets its own ordinary checkpoint. All 43 earlier native Causeway room definitions match their pre-consolidation fingerprints. Existing continuous Fractured road recordings still clear with zero deaths (21: 17,426 frames; 22: 13,801; 23: 16,492). The live sampler additionally verifies the retired-cover bypass and every accepted extension through final completion.

Application checks cover reachable start pickups in all six replay worlds; death/Retry reset versus ordinary Core checkpoint retention; Core locking and closed-exit denial; practice invalidation, including chapter-switch attempts; Garden/results UI; and local save/reload. Rendered Garden, completion, carried Ivy and lantern hoist screenshots were inspected. `codesign --verify --deep --strict` passed.

The user's native World 1 scene remains byte-for-byte identical to its source checkout: SHA-256 `31dbed0936d4552718299175b24394ba5d0b1dc8fd073f3765949828cd056d47`.

## Scope

Local records only, as requested; no hosted leaderboard. The web game remains separate. Remote main's intervening browser editor publications were merged without overwriting them. Existing saves contain permanent rewards/records, not resumable challenge runs.
