# Web audio repair

The 0.51.0 browser game was silent even with a running AudioContext. Real
speaker-bound analyser nodes measured zero output in the title and gameplay.
Music/ambience buffers contained valid nonzero samples, so merely checking that
streams were playing or the AudioContext was running missed the failure.

Godot 4.5.1's Web Audio sample backend implements bus insertion with a negative
append index using a move operation that reorders its bus array. Runtime
`AudioServer.add_bus()` calls left the game's bus sends disconnected from the
actual master output. Passing the explicit append index still normalized to
that path in this engine version.

The game now allocates missing buses with the `bus_count` setter, then assigns
names and sends. This preserves bus indices and the existing per-channel mixer,
user preferences, sample playback, music and effects. No autoplay-policy bypass,
replacement music or change to desktop playback is needed.

Run `node tools/check-web-audio.mjs https://bladefall2dsample.pages.dev/play/`
from the project directory (or use the repository-relative tools path). It runs
with restrictive autoplay behavior, instruments actual speaker-bound samples,
and checks title music, gameplay and a real jump sound. `AUDIO_RECEIPT` optionally
writes a private JSON receipt. The original build measured zero; the repaired
local build measured title peak 0.0467, gameplay 0.2392 and jump 0.4960, with no
browser errors. Exact peaks vary with playback time.
