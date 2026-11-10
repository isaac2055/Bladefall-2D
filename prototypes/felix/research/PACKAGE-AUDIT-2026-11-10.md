# Bladefall and Felix package audit — November 10, 2026

The most useful next work is interruption/save recovery, real-phone playtesting, and startup/package optimization. Recorded puzzle solutions give good evidence that the approved routes remain solvable; they give much less evidence about confused players, backgrounding, slow connections, or sustained phone performance.

This is an investigation report. No gameplay, puzzles, checkpoints, rewards, releases or deployments were changed for the audit.

## Scope and evidence

| Package | Audited source | Published version |
| --- | --- | --- |
| Bladefall | `Bladefall-Complete`, `codex/continuous-lifts-and-story`, `3e1ebcf` | [0.53.1](https://bladefall2dsample.pages.dev/) |
| Felix | `Felix-Complete`, `codex/felix-connected-release`, `0053f78`; implementation `f5ac2a6` | [0.1.0](https://felixsample.pages.dev/) |

Both live manifests were fetched during this audit and report the versions above. Evidence comprises current source, local exported archives/APKs, public release metadata, existing release-verification records, and new isolated Felix runtime probes. Existing release tests were inspected for coverage; this audit does not claim a new full human walkthrough or a rerun of every release test.

**Confirmed** below means source/artifact inspection or an isolated reproduction established the finding. **Risk** means a plausible issue whose player impact still needs measurement. Priority 1 concerns progress or basic access; Priority 2 concerns performance, usability or distribution quality.

## Priority 1: interruptions, recovery and access

### Felix keeps simulating after focus loss — confirmed handler behavior

`scripts/felix_main.gd:448` saves on focus loss/application pause, but does not set the game's paused flag. Touch controls release held inputs. An isolated instance of the real scene received the real notification and then one physics tick: `paused=false`, `simulation_steps=1`. Bladefall explicitly pauses on focus loss (`scripts/main.gd:923`).

This establishes a Felix desktop focus-handling gap. It does not establish how long Android or iOS will schedule a backgrounded process. A player who switches away during a jump or conversation could return after unseen movement or dialogue.

**Next implementation:** pause through the existing pause path when focus is lost; test that saving, dialogue and resuming remain coherent. Also test browser visibility changes and orientation overlays. Both web wrappers display a rotate overlay without explicitly pausing the engine, so hidden gameplay during rotation is a separate, unconfirmed risk.

**Helpful player test:** in both games, switch apps for 10–20 seconds during a jump and during dialogue, then return. Rotate a phone mid-jump. Record whether the game paused, the character moved/died, or dialogue advanced unseen.

### Felix rejected checkpoints can be replaced by startup saving — confirmed sequence

`felix_save.gd:47–49` rejects incompatible content signatures. `felix_main.gd:138–143` then permits fresh-start saving when restore fails. An isolated QA checkpoint with a valid checksum and an old signature produced:

```text
incompatible_resume restored=false
subsequent_startup_save=true
old_file_replaced=true
```

The probe exercised the actual restore/save methods in their startup order, with a separate save directory and profile. It did not touch player saves. The same fallback structure also makes malformed-save recovery worth addressing, though the dynamic reproduction used signature mismatch specifically.

**Next implementation:** distinguish missing, corrupt and incompatible checkpoints; keep a last-good backup or quarantine the rejected file before any replacement. Provide an understandable recovery choice and explicit migration rules for updates. Keep checksum validation.

Bladefall's `resume_world()` also falls back to `restart_world()` after restore failure (`main.gd:1376`). That is a source-level recovery risk to investigate; this audit did not reproduce the same overwrite outcome there.

**Helpful player test:** export a backup, then test ordinary quit/relaunch and export/import around late checkpoints, opened passages and chapter handoffs. Do not damage your real save to test corruption; that belongs in isolated developer fixtures.

### Both web games have a slow-connection startup limit — confirmed source and arithmetic

Both `web/player.js` wrappers race engine startup, including asset loading, against a fixed 120-second timer. The current manifests require 50,427,216 compressed bytes for Bladefall and 59,226,879 for Felix. At a steady 3 Mbps, transfer alone takes at least 134.5 and 157.9 seconds respectively, before decompression, validation and compilation. A cold load at that rate cannot finish inside the timer.

This is a source-and-payload calculation, not a throttled-browser reproduction. Cached loads may behave differently.

**Next implementation:** use progress/inactivity-aware timeouts, clearer retry behavior and smaller payloads. Preserve the existing hash checks and Cloudflare chunk packaging. Measure peak startup memory: full asset buffers, decompression, engine memory and decoded audio can overlap. An out-of-memory failure has not been reproduced here.

**Helpful player test:** first load on Wi-Fi and mobile data, then a cached reload. Note time to playable, progress stalls and audio after the first tap. Test backgrounding during download separately from backgrounding during play.

## Priority 2: optimization opportunities

### Felix synchronous saves can consume a frame budget — measured

Eight headless Mac samples of the actual Chapter One capture/write helpers produced:

| Operation | Observed range |
| --- | --- |
| Capture world/story state | 6.21–6.66 ms |
| Serialize, hash and write | 12.31–13.70 ms |
| Combined per sample | 18.62–20.36 ms |
| Checkpoint size | 2,277,932 bytes |

The combined work exceeds the 16.7 ms budget for a 60 FPS frame on this setup. Profile saving adds work outside this measurement. This is evidence of hitch potential, not a measured rendered frame-time spike or a phone benchmark.

Felix requests saves every 120 simulation ticks, approximately two seconds, plus room/phase changes (`felix_main.gd:362–373,582`). Bladefall's periodic threshold is 600 frames, approximately ten seconds, plus important state changes (`main.gd:1364–1375`).

**Next implementation:** first record rendered frame-time percentiles and save timings on target devices. Coalesce redundant writes and use dirty state while retaining important checkpoint saves. If background serialization/I/O is warranted, hand it an immutable snapshot; do not let workers mutate the live world. Measure Bladefall independently before attributing Felix's numbers to it.

### macOS packages bundle the editor executable — confirmed size opportunity

| Current download/payload | Bladefall | Felix |
| --- | ---: | ---: |
| macOS ZIP | 189.9 MiB | 198.1 MiB |
| Windows ZIP | 71.5 MiB | 79.9 MiB |
| Android APK | 91.1 MiB | 99.4 MiB |
| Compressed web payload | 48.1 MiB | 56.5 MiB |
| Raw game pack | 44.1 MiB | 52.9 MiB |

Both `tools/build-macos.sh` scripts copy the Godot editor executable into the app. That executable alone is 342.5 MiB uncompressed in each bundle. A matching release export runtime is the first packaging optimization to evaluate. No exact savings are promised until a candidate is built and compared. Preserve Apple Silicon/Intel support and recheck launch, signing, audio and saves. See the official [macOS export guidance](https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_macos.html).

Audio is another candidate: inspected source audio totals about 37.9 MiB in Bladefall and 46.4 MiB in Felix; music accounts for about 35.0 and 43.6 MiB. Source sizes are not compressed-download sizes. Inventory actual track references, bitrate and load behavior before removing or recompressing anything. Voice clips are a much smaller target. Preserve the approved soundtrack and credits.

### World construction and background machinery need profiling — source-level opportunities

Bladefall constructs all chapter worlds/views before play (`main.gd:190` onward); inactive viewports have rendering disabled, but their worlds remain allocated. Compare startup time and memory with lazy creation, preserving the current behavior that switching routes retains state. Felix loads the selected world rather than eagerly constructing the same set.

Both games update machinery in inactive rooms each simulation step (`world.gd`, `tick_inactive`). Both landscape implementations rebuild road terrain across the road patch collection when the shared road revision changes. Profile these functions in dense late rooms and while passages reveal; consider narrower dirty updates where worthwhile.

These are not proven frame-rate bottlenecks. Do not simply stop offscreen machinery: moving platforms, phase timing, return routes and exact checkpoint restoration depend on that simulation.

### Touch ergonomics and sustained performance remain major coverage gaps

Controls use fixed positions and sizes, with no player layout/opacity customization. Button ownership begins on finger-down; sliding a held jump finger onto dash does not retarget the action. That is a design constraint to evaluate with thumbs, not automatically a defect. Small-screen obstruction of hazards, landing spots or text also needs human assessment.

Existing browser checks cover phone-sized layouts and basic simultaneous movement/jump. They cannot establish real thumb comfort, three-finger play, screen cutouts, accidental browser gestures, heat or battery behavior. Android emulator and WebKit emulation do not replace physical Android/iPhone checks.

For performance, compare the same late room at session start and after 20–30 minutes. Record device, OS/browser, room, regular versus irregular stutters, brightness and heat. The previously recorded Felix Woods improvement from 31–35 to 72–76 FPS applies to one controlled starting scene; it is not a whole-game guarantee.

### Bladefall packaging/release checks have two concrete gaps

The inspected Bladefall APK contains no entries named for Godot license or audio attribution; Felix's APK includes `assets/GODOT-LICENSE.txt` and `assets/audio/ATTRIBUTION.txt`. Bladefall's non-Mac include/exclude filters reference an attribution Markdown file while excluding Markdown. Add the intended plain-text credits to the APK and assert their presence in the produced archive. This finding concerns bundled files, not whether a separate in-game credit screen exists.

Bladefall's Mac build script trusts engine exit status. Felix additionally rejects logged `SCRIPT ERROR`, `Parse Error` and `ERROR:` messages. Bring comparable checks into Bladefall's release pipeline, alongside archive integrity, required asset/credit checks and source provenance. No current Bladefall runtime failure is inferred solely from this tooling gap.

Both Mac downloads remain unnotarized, and Windows signing/physical-PC testing remain distribution work. Those affect first-run trust and installation, not game frame rate.

## The most helpful playtests, in order

### 1. Real-phone controls and interruption recovery — both games, 10–15 minutes

Use a physical phone in landscape. Try movement+jump, diagonal dash, grab/carry+jump and rapid changes between them wherever abilities are earned. Hold one finger down while releasing another. Drag outside a button, then release. Check for stuck movement, unwanted actions and obscured landing spots. Try fullscreen/browser bars, rotation and app switching.

Success means every action releases reliably, controls remain reachable, important geometry is visible, and hidden gameplay does not advance unexpectedly. The Felix focus issue is already confirmed; testing here determines the actual player impact and other platform-specific cases.

### 2. Later Felix puzzles — highest-value room list

| Chapter | Rooms to prioritize | What to learn |
| --- | --- | --- |
| One | 8 **The Falling Gallery**, 9 **The Load That Opens the Lift**, 10 **The Descending Invitation** | Are the final puzzle exits and approach to the windowsill readable? Does each photo/reward appear once? |
| Two | 5 **The Returning Seed**, 8 **The Ferry Beneath the Roots**, 9 **The Lantern and the Missing Root**, 10 **The Landing You Make in Midair** | Are required pickups/return routes understandable? Can you recover after partial collection, a missed landing or a death? |
| Three | 6 **Your Shortcut Cannot Carry the Weight**, 7 **The Weight You Can Finally Move**, 8 **The Dock You Need Only Once**, 9 **The Spring Under the Stone**, 10 **The Launch Waiting on the Return** | Can a new player infer the order and recover after placing/dropping weight badly? Are return travel and the final pickup legible? |

Play without the reference recordings first. Try a plausible wrong order, leave an object on the wrong side, miss a moving platform, die after a pickup, and retry near an opening passage. Check that recovery is understandable and never requires sacrificing an already earned reward. Note where a hint would help rather than assuming the puzzle needs simplification.

At least once, play Chapter Three normally through its story entrance, late puzzles, drive and Sunday ending. Listen for speaker clarity, pauses, interruptions, reading time and whether movement makes dialogue hard to follow. Automated narration checks prove lines reach the player, not that their pacing feels right.

### 3. Save continuity around transitions — both games, 10 minutes

Export a backup first. Quit/reopen after a checkpoint, after a passage settles, after a reward and near a story/transport handoff. For Felix, check gifts, photos/memories, queued dialogue and ending progress. For Bladefall, check checkpoint location, machinery timing and transport state. Try one browser-to-native import and back; confirm position, abilities and earned rewards. A timed scene may intentionally resume from its last safe boundary rather than its exact frame.

### 4. Bladefall late Fractured/Core routes and desktop first launch

Prioritize Fractured Outskirts/Woods attached rooms and each available Core route's final transport/finish. Approach from normal play; test death/retry before and after handoffs, revisit a completed room, and check one-time rewards and persisted completion. These stress return travel and checkpoints more effectively than replaying opening rooms.

On an actual Windows PC, extract the whole ZIP, launch it, play a late room, save and relaunch, then test controller disconnect/reconnect. Windows package headers/PCK checks on Mac do not establish native Windows behavior. On Mac, try a fresh downloaded copy rather than only the developer launch path.

## How much confidence the existing tests provide

Felix's connected-story recordings traverse all thirty approved puzzles with real movement, individual checkpoints, one reward per room and all three endings. Separate road tests cover normal story entrances, and all six challenge recordings pass. This is strong happy-path coverage.

It is not a complete continuous human campaign playthrough. Connected tests skip the prologue/set up chapter routes; some save fixtures synthesize completed state. They do not exhaust wrong solutions, mid-conversation interruptions, repeated deaths or physical-device behavior. Historical November 5 playtest notes also contain issues already fixed, including drive visibility and some standing-place/rendering problems; those should be visually retested, not automatically counted as current defects.

New audit probes used an isolated profile/save directory. Their shutdown log reported retained test resources; that alone is not evidence of a shipped-game leak. No physical Windows/iPhone test or rendered frame-time/peak-memory capture was performed for this audit.

## Recommended next work

1. Protect rejected checkpoints and make Felix focus-loss pausing consistent; add isolated recovery/interruption regression checks.
2. Fix the web timeout policy, then measure slow cold loads and low-memory startup.
3. Run the phone and late-room playtests above; address concrete input/readability failures before changing puzzle designs.
4. Profile rendered save hitches, then reduce redundant synchronous work without weakening checkpoint guarantees.
5. Evaluate release runtimes/audio packaging; add Bladefall artifact credit checks and stricter build-log validation.

For a useful bug report, record **game/version, device/OS/browser, chapter and room name, starting checkpoint, held inputs, expected result, actual result and whether reopening changes it**. A short clip including the seconds before the problem is especially helpful. For confusing puzzles, the attempted plan and the clue you noticed are more useful than just “got stuck.”
