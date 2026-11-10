# Felix connected release

Authorized November 10, 2026: implement the agreed Felix upgrade, preserving the three existing stories and approved puzzles. Work in `codex/felix-connected-release`, separate from the published Bladefall build. The old art-only ownership brief is superseded by this game-wide task; its rendering contracts, checkpoint preservation and branch protection still apply.

## Required deliverables

- Reconcile latest art (1bfab1d) and relevant story fixes (43e47c2), retaining the removed counter tutorial.
- Connect all 30 affixed exercises, with completion-gated passages and individual checkpoints. Keep chapter entrances, family scenes, photos, clues, abilities and endings.
- Persist story progress and safe checkpoint state; support resume and portable saves without mixing Bladefall storage.
- Add the current three Fractured and three Core routes as gameplay-only Felix variants, preserving their approved mechanics and rewards.
- Willow Studios opening, Felix title, Continue, route selection, settings, controller and touch controls.
- Felix website/browser play and standalone macOS, Windows and Android downloads, adapting the proven Bladefall release tools.
- Verify full story journeys, physical connections, death/retry, relaunch, save portability, mobile UI/audio and exported artifacts. Recorded puzzle routes alone do not prove a complete story journey.

Chapter Four remains a proposal and is outside this release. No new finale rooms or combined checkpoints.

## Progress

- Created isolated integration worktree from the latest art branch.
- Baseline screenshot capture started before changing the runtime.
- Integrated the latest drive visibility guard without reintroducing the counter tutorial.
- All thirty approved puzzle recordings pass with physical travel from each chapter entrance, individual checkpoints, one reward per room, and all three endings. No between-room resets or transports are used.
- Full Woods and Causeway road recordings pass through the original story scenes to the first affixed puzzle with zero deaths; the normal handoff keeps Felix visible and the family at the lot.
- Story save tests pass for all three chapters, including initial gifts, completed beats, photos, checkpoint position, settled passages, unsafe-scene deferral, signature mismatch rejection and portable bundle round trips.
- Release shell checks pass for title, touch-start prologue, settings, remapping, all nine unlocked routes and full challenge abilities.
- All seventeen Chapter One screenshots captured successfully after the connected-room changes. The wardrobe backdrop now follows the relocated room elevations.
- First web build produced 56.5 MiB of compressed assets, each within the existing Pages packaging limit. Browser QA and full advanced-route verification are in progress.
- Native builds, signing, physical-device verification, final visual polish and publication remain. This document is not a completion claim.
