# Explore in Godot — opening journey draft

A standalone native Godot 4.5.1 draft of **The Outskirts and Black Woods**, alongside the Ascend prototype. It imports the existing Explore maps, people, encounters and recordings. The browser game and Ascend prototype are unchanged. Work is isolated on `codex/godot-explore-prototype`.

## Play

Open the local application at `exports/Bladefall Explore Prototype.app`. It carries the engine and packed project; it does not need the repository, Node, a browser, or a network connection. The bundle is ad-hoc signed for this Mac, using the pinned universal Godot editor binary as its runtime carrier. It is a local prototype, not a notarized distribution build.

`Play Explore.command` runs the source project. `tools/run.sh` imports assets and starts the pinned engine; it can fetch the official SHA-256-verified engine on a fresh Mac. `tools/build-macos.sh` rebuilds and verifies the standalone bundle.

**Arrows** move; **Space** jumps; **Up** talks/uses; **W** strikes; **Up + W** strikes a resin pod from below; **C** takes a pickup; **R** plants an earned checkpoint flag. **Esc** pauses, **M** opens Mara’s earned field chart and **F11** toggles fullscreen. Keyboard defaults are imported from the browser. Named controller equivalents are mapped: stick/d-pad, A jump, X strike, Y talk, LB take and Back plant flag. Physical controller hardware has not been tested.

The pause menu includes retry from your flag, full journey restart, region preview, **Watch a new journey / Take control**, separate music/effects/voices/ambience volumes, voices, reduced motion and lighting. Watch starts a fresh journey and plays genuine recorded native inputs through both regions; take control keeps the exact live player position. There is one checkpoint flag initially, one when entering a region, and a replacement earned through a kill. A retry restores blood at your flag and retains equipment and quest progress.

## What is playable

- Both authored regions and all **240 world objects** are constructed before play. Terrain stays present across rooms; the physical tunnel connects the regions in both directions. Machinery, collected objects and slain enemies persist within the session.
- Explore’s own 200-unit run speed, acceleration/reversal/braking, buffered single jump, coyote time, variable jump height and apex hang. Start unarmed with the original opening capability limits. This is a GDScript simulation with swept wall collision and one-way floors, not an embedded browser or an Ascend reskin.
- All **13 authored encounters**: patrols, rushes, sentries, feints, shielded duelists, diving flyers, stalkers and the forest’s ground-root/spore casters. Wind-ups and recovery have distinct visual cues; root attacks stay on actual floor surfaces. Steel can flank a shield. Health, invulnerability, death, the first weapon and the Mothsilk Mantle work natively.
- The Oathblade’s original hanging counterweight, all four resin launch pods, crumbling footholds, timed thorns, poisonous flowers, false branches, and Bram physically jumping through the canopy with his lamp. He leaves the return light at the far landing.
- Mara’s three survey vanes and field-chart handover. The earned map shows both regions, their rooms, your position, your flag and the aligned bearings.
- Rowan’s existing bell quest: push the stone cart, lock the brake, climb the tower, release/carry/hang the bell, then return. The earned drake travels both ways.
- Elsie’s existing quest: follow the moths through their authored perches, carry the lantern home without taking a hit, split Hale’s log with three separate swings, and return. A hit sends the lantern back. The earned moth flight travels both ways. Completion has persistent objective feedback, particles, a sound and the existing ending recordings.
- Layered night landscapes, forest canopy, weathered stone and grass, original landmarks, people, props, animated fire/moths/plume, interpolated movement, an eased world camera, GPU motes/embers, real point lights and terrain shadow occluders, restrained grading and action feedback.
- The actual Midnight Field and Watchful Greenwood recordings, regional ambience, fire, footsteps and effects. **141 existing recordings**, including **68 existing Explore speech clips**, are copied with source hashes. Conversations are one-way and pause gameplay; readable matching subtitles remain with voices disabled. Music crossfades between regions and ducks under speech. Settings persist locally. No dialogue was rewritten and no voice generation or ElevenLabs calls were made.

## Verification

From the repository root:

```sh
node prototypes/godot-explore/tools/export-world.mjs --check
node prototypes/godot-explore/tools/import-controls.mjs --check
node prototypes/godot-explore/tools/import-audio.mjs --check
node prototypes/godot-explore/tools/reference.mjs
.cache/godot/Godot.app/Contents/MacOS/Godot --headless --path prototypes/godot-explore --script res://tests/parity.gd -- "$PWD/.cache/godot/explore/reference.json"
```

The movement reference is generated fresh by running the actual browser update. Four flat-ground control traces compare **741 frames** of native/browser position, velocity, grounded state and jump count with tolerance 1e-8. They cover running, braking, reversal, a held jump, a tapped jump and a running jump. This establishes those opening movement cases, not complete engine or combat parity.

Run these with the same Godot prefix (`--headless --audio-driver Dummy --path prototypes/godot-explore --script res://tests/…`):

- `journey_replay.gd`: **8,299 frames** across both complete regions with no deaths. Collects all three bearings, physically releases/takes the Oathblade, uses all four resin pods, equips the mantle and crosses Bram’s canopy. Bram arrives without a recall. The final forest blood count is four of five.
- `quests_replay.gd`: complete real-input routes for Rowan (**1,849 frames**) and Elsie (**4,897 frames**), including both directions of each earned ride, with no deaths or blood loss. These traces never warp the player, remove enemies or grant abilities.
- `mechanics.gd`: targeted fixtures for the weapon lock/release, pod impulse, vanes/handover, lantern hit recovery, distinct log swings, cart/brake, bell carry, reward, interrupted ride, death/retry retention and full reset. These are component fixtures, separate from the continuous route evidence.
- `combat.gd`: guarded wind-up, shield blocking/flanking, roots on actual floor, airborne spore projectiles and the diver’s mark/attack/recovery sequence.
- `application.gd`: real keyboard input, actual retry/restart/Watch/Take control/map widgets, conversation input, pause, all 141 recording hashes/decodes, non-silent Godot mixing, mute sliders and the complete two-region Watch run.

`data/tours.json` and `data/quest-tours.json` contain the proven input traces. The test-only controller and generators in `tools/` search normal input sequences against the real native world; they are excluded from the application. `tests/shots.gd -- OUTPUT_DIRECTORY` captures staged views of the actual renderer for visual QA; the screenshots themselves are not movement proofs. Logs, captures and audio evidence are in `.cache/godot/explore/`.

For a packed-app check, launch `exports/Bladefall Explore Prototype.app/Contents/MacOS/BladefallExplore` with an **absolute external test-script path**. Its `res://` loads then resolve from the packed game, so the tests verify the shipped resource and audio layout.

The 0.1 standalone bundle passes all six verification scripts against its packed resources with no engine errors or warnings. Actual macOS LaunchServices launch and GPU captures were inspected. One capture observed 88 fps on this Mac, with 10 point lights and 113 terrain shadow occluders; this is an observation, not a portable performance guarantee. Its 17.02-second mixed WAV includes music, effects and speech, with peak 0.673, RMS 0.059 and zero clipped samples. The bundle passes deep code-signature verification.

## Draft boundaries

This is an opening-journey engine study, not a full Explore campaign port. It ends at the forest’s Causeway entrance. Later regions, bosses, progression trees, campaign saves, co-op, workshop, online services and later movement abilities are outside this draft. Journey progress lasts until restart or quit; audio/display preferences are saved. Original dialogue and the shipping browser sources stay untouched. The renderer is a native treatment of the authored world, not a pixel-for-pixel browser reproduction.

Godot’s license is in `GODOT-LICENSE.txt`; audio provenance is in `audio/ATTRIBUTION.md` and `data/audio.json`.
