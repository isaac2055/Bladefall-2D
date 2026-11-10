# Felix 0.1.0 release verification

Implementation source: `f5ac2a6290e4c5a901a94315d8249fbc4983f6cf`, branch `codex/felix-connected-release`.

- Public site: https://felixsample.pages.dev
- Public browser game: https://felixsample.pages.dev/play/
- Downloads and checksums: https://github.com/isaac2055/Bladefall-2D/releases/tag/felix-v0.1.0
- Cloudflare production deployment: `381f99bf-4de0-4e7a-8e0b-79a45320bc3f`, from the implementation commit above.

## Verified behavior

- All thirty original affixed puzzle recordings pass with real movement between rooms, individual checkpoints, one story reward per room and all three endings. The actual stair-to-wardrobe approach also passes; Woods and Causeway road recordings retain their family scenes and enter their connected puzzle routes.
- Every Woods tale line/interruption and every Phantom drive line reaches the player. The same connected-story checks pass on Godot 4.6.1, used for Android.
- All six full Fractured/Core recordings pass with zero deaths and real completion rewards/records. No family cast is used on those routes.
- Story saves retain gifts, memories, completed beats, exact checkpoints, opened passages and queued dialogue. Timed scenes retain a stable checkpoint. All six challenge saves retain the exact actor, machinery clock and score, with the intended carried-attempt restart rule.
- One portable bundle containing all nine route checkpoints is 22,065,881 bytes and imports successfully within the existing limit.
- Chromium and WebKit phone-sized WASM checks pass for touch menus, exported checkpoints and orientation guidance. Chromium also passes simultaneous movement/jump and touch scrolling. Desktop WASM checks pass gameplay, actual download, IndexedDB persistence and file-picker import.
- The desktop WASM checks also pass against the public Cloudflare production URL.
- Android emulator verification uses the signed APK and the real Android document picker: a browser save imports, exports from Android and restores in desktop with the same position and earned legs. Godot 4.5.1 and 4.6.1 both restore the real exported checkpoint.
- The standalone macOS bundle constructs the real title/world/art/audio without the source checkout. Its bundled engine contains Apple Silicon and Intel architectures. macOS and Windows game packs restore the Android-exported checkpoint.
- Windows executable PE/x64 headers, companion PCK and ZIP integrity pass. Android signing and package identity pass. Godot license and audio credits are included in the packages.
- Naming and live music checks pass with all three original scores, loop boundaries, saved selection/volume and pause-menu audition.
- All seventeen Chapter One screenshots and six advanced-route screenshots were captured. Title/garden and relevant scene images were visually inspected. Phone controls wait for earned story abilities.
- The native Woods starting-scene render check improved from 31–35 FPS to 72–76 FPS with the same displayed world scale; this does not claim that frame rate across the whole game.

## Publication integrity

All four public GitHub assets return HTTP 200. Server-reported SHA-256 digests match the locally built macOS ZIP, Windows ZIP, Android APK and checksum file. The published release tag resolves to the implementation commit above. Production landing, play page, credits and manifest respond successfully; the manifest reports `0.1.0`.

## Limits

Windows was package/game-pack checked on macOS, with no physical Windows PC available. Phone browser checks use Chromium/WebKit emulation; Android uses an emulator, with no physical iPhone test. The macOS sample is locally signed and not Apple-notarized. These limits are also disclosed with the downloads.

The published Bladefall worktree and original Felix art worktree remain unchanged. Chapter Four and new finale rooms remain outside this release.
