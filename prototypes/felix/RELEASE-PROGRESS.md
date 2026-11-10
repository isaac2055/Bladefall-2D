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
- Full recorded journeys for all six Fractured/Core routes pass with zero deaths and real completion records/rewards.
- Browser QA passes actual WASM gameplay, desktop/phone landing layouts, save downloads, IndexedDB persistence and file-picker import. The mobile pass found and corrected the SubViewportContainer shrink setting so the game fills the intended phone play area.
- Naming and live soundtrack checks pass with all three generated music tracks, looping, pause audition and saved volume/selection.
- Added a persistent garden/memory collection, full challenge costumes/materials, larger phone menu targets, and solid standing places for story characters.
- macOS, Windows and signed Android exports have been produced. A missing challenge texture reference was caught and corrected; all release builds are being regenerated with strict script-error checks before publication. Android 4.6.1 launches on the emulator using its exported launcher alias.
- Final browser/mobile/native verification, clean release builds and publication remain. Physical Windows/iPhone hardware is not available in this session. This document is not a completion claim.

## Final verification additions

- Connected journeys verify that every Woods tale line, the boy's interruptions and every Phantom drive line actually reach the player; narration queues across doorways and is included in saves.
- The same thirty-room journey passes under the Android engine (4.6.1).
- All six challenge checkpoint round trips preserve the exact player, checkpoint, machinery clock and score; carried reward resumes restart the route as intended.
- A bundle holding checkpoints for all nine routes is 22,065,881 bytes and imports successfully within the existing 32 MiB limit.
- Actual Android system-picker import of a browser save, then native export back to desktop, preserves Felix's legs and position. The macOS app bundle and Windows PCK both restore that real exported checkpoint.
- The standalone macOS bundle constructs the real title, world, artwork and audio without a source checkout.
- In a controlled native Woods starting-scene check, a smaller internal render target raised measured FPS from 31–35 to 72–76 while preserving the displayed world scale. This is a scene measurement, not a whole-game frame-rate guarantee.

## Published

Felix 0.1.0 is live at https://felixsample.pages.dev with browser play and macOS,
Windows and Android downloads. Implementation commit: `f5ac2a6`. Public release:
https://github.com/isaac2055/Bladefall-2D/releases/tag/felix-v0.1.0.

The public WASM gameplay/save checks and public asset status/digest checks pass.
See `RELEASE-VERIFICATION.md` for the final evidence and hardware limits. Earlier
in-progress entries above record the implementation checkpoints, not remaining work.
