# Felix

A quiet light, a long way home. Willow Studios' story remake uses Bladefall's approved movement and puzzle rooms, with Felix's artwork, cast and music.

The playable sample contains three story chapters and six gameplay-only Fractured/Core routes. Its runtime starts at `felix.tscn` / `scripts/felix_main.gd`. The inherited `main.gd` is not the Felix entry point.

## Playing

Use the standalone macOS app, Windows ZIP, signed Android APK, or the browser build at https://felixsample.pages.dev. The apps include their engine and assets and play offline. `Play Felix.command` is the developer launcher and uses Godot 4.5.1.

Keyboard defaults: arrows move and aim, Space jumps, D dashes, A climbs/carries, W strikes, F parries, R retries, Escape pauses. Story abilities arrive as gifts. Controllers can be remapped. On phones, use landscape orientation and the touch stick/buttons; action buttons appear as their abilities are earned.

## The three chapters

1. **The New House.** At five, the boy imagines a light on his first night in a new house. Legs, a sock cape and arms arrive as gifts. After the parents' muffled argument, Felix finds ten family photos in the wardrobe boxes. The windowsill naming scene gives him his face.
2. **Sir Felix.** At seven, the walk to Dad's cabin becomes a knight's adventure. A storm cuts the power, and Dad tells a story through ten Woods exercises. The ending returns to the porch, with the boy asleep in Dad's lap.
3. **Phantom.** At ten, a Causeway handoff becomes a spy mission. Three clues are misread, then reconsidered during the ten-room drive to Dad's. The Sunday return and mask-off ending remain.

All thirty affixed exercises now connect through walkable geometry. Authored puzzle interiors and individual checkpoints remain; completing the original goal banks its photo/story reward and opens an earned passage. There are no basket, beam or headlight rides between exercises. Chapter entrances, family scenes and endings remain. Narration queues across doorways so fast movement cannot cut off a line.

## Fractured, Core and rewards

Finish all three stories to open Fractured Outskirts. Fractured routes unlock in order: Outskirts, Woods, Causeway. Clearing all three opens Core Outskirts, followed by Core Woods and Core Causeway. These routes use the current approved native layouts, Felix's costumes/materials, darker presentation and the full ability kit, without a family storyline.

Story clears earn roots; deathless clears make them shiny. Fractured clears earn crowns and Core clears earn keepsakes. Once earned, advanced rewards can be carried through a deathless attempt for their shiny forms. Death, Retry or resuming a carried attempt restarts the route. Normal attempts preserve checkpoints. Garden and records shows rewards, banked memories and local records. Restarting a chapter retains its permanent collection.

## Saves

Felix has its own application identity and storage, separate from Bladefall. Ordinary attempts save during play, at room changes, on pause, on focus loss and on quit. Saves include the world, machinery, inventory, checkpoint, gifts, collected items, story guards and queued narration. During a timed scene, the latest stable save is retained so remaining cues replay safely after relaunch.

Settings provides portable export/import across browser, macOS, Windows and Android. Import validates the complete bundle before replacing local progress and retains a prior-save backup. Browser storage belongs to that browser and site; keep an exported backup. The tested bundle containing all nine route checkpoints fits within the 32 MiB import limit.

## Building

Run from this folder. Desktop/web use Godot 4.5.1; set `GODOT` if it is not in the repository's `.cache/godot` directory.

```sh
bash tools/build-macos.sh
bash tools/build-windows.sh
node tools/build-web.mjs
bash tools/build-android.sh
```

Android uses the separate Godot 4.6.1 engine, SDK 35 and JDK 17. Its staging import cache is isolated from desktop/web. Set `ANDROID_GODOT` if needed. The persistent Felix release key is kept outside Git; on this Mac its password is in Keychain under `willowstudios.felix.android.release`. Other build hosts can provide the `GODOT_ANDROID_KEYSTORE_RELEASE_PATH`, `GODOT_ANDROID_KEYSTORE_RELEASE_USER` and `GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD` environment variables. Never commit keys or passwords.

Outputs go to `exports/`. The web packager verifies its compressed chunks and keeps each Pages asset within the existing size limit. Native downloads live in the `felix-v0.1.0` GitHub release. Deploy the web directory using this folder's `wrangler.jsonc`, never Bladefall's configuration.

## Verification

Run these with the matching Godot engine and `--path . --script`:

- `tests/story_road.gd`: original story approaches, family scenes and physical entry into the exercises.
- `tests/connected_story.gd`: all thirty original puzzle recordings, actual walking between rooms, individual checkpoints, rewards, all tale/drive lines and endings; no between-puzzle resets.
- `tests/story_saves.gd`: story/world resume, queued dialogue, stable-scene policy and portable bundles.
- `tests/challenge_saves.gd`: all six challenge checkpoint round trips and carried-attempt restart policy.
- `tests/portable_capacity.gd`: all nine saved routes in one importable bundle.
- `tests/release_shell.gd`: title, settings, touch start, remapping, garden, unlocks and challenge restart binding.
- `tools/test_felix_presentation.gd`: naming, all three original scores, live looping and menu audition.

`python3 tools/check-advanced.py` checks the six full advanced recordings. `tools/check-web.mjs` and `tools/check-web-mobile.mjs` exercise actual WASM gameplay and save flows. Screenshot tools write to ignored `shots/`; inspect the images, not just exit codes. Build helpers reject script errors even when Godot returns success.

macOS was exercised on Apple Silicon; Windows PE/ZIP/game-pack validation does not substitute for a physical Windows PC. Chromium/WebKit phone emulation and an Android emulator were used; physical iPhone testing remains outside the available hardware.

Chapter Four, *Borrowed Air*, remains a proposal and is not part of this sample. No new finale rooms or combined checkpoints were introduced.
