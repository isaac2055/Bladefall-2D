# Browser sample release

The Godot 4.5.1 sample is published independently of the older JavaScript game:

- Site: https://bladefall2dsample.pages.dev
- Mac release: https://github.com/isaac2055/Bladefall-2D/releases/tag/ascend-v0.51.0
- Cloudflare Pages project: `bladefall2dsample`; no bindings or shared API.
- Export: Compatibility renderer, single thread, no cross-origin isolation required.

## Build and publish

Install the matching Godot web export templates through Godot's template manager.
From the repository root, with `GODOT` pointing to the 4.5.1 executable:

```
node prototypes/godot-ascend/tools/build-web.mjs
node prototypes/godot-ascend/tools/check-web.mjs http://localhost:8765
npx wrangler pages deploy --cwd prototypes/godot-ascend --branch main
```

Serve `prototypes/godot-ascend/exports/web` locally on port 8765 for the browser check.
The builder exports the real game and compresses the WASM/PCK in 16 MiB chunks.
The player reconstructs both files and verifies their SHA-256 hashes before Godot
uses them. Hashed chunk paths prevent mixing different releases. Every published
file must be below Pages' 25 MiB asset limit. Initial download is about 48 MiB.
No R2 subscription is required. The full Mac ZIP is a GitHub release asset;
create a versioned release marked prerelease so the older game's Latest release
is preserved. Update the landing link and version when making a new release.

## Saves

Godot `user://` persists through IndexedDB on the site origin. This is browser
storage, not an account or synchronized cloud save. Export a backup before
clearing browser data or changing hostname. Private browsing may discard saves.

Settings in the web and desktop builds include Export Save and Import Save.
The portable JSON bundle contains the Garden profile, each individual binary
world checkpoint, preferences and bindings. Imported snapshots retain the
existing save format, layout migration rules and scoring restrictions.
Imports validate every entry before writing; world payloads are object-free
and checksummed. Import replaces local progress, clears checkpoints absent from
the bundle, and keeps the previous bundle as `bladefall-before-import.json`.
This backup is local and is not sent to any service. Export a manual backup if
needed; the next import replaces the automatic backup.

The old `bladefall2d` Pages project and its playtest API are independent.

## Windows download

`tools/build-windows.sh` exports a Windows x64 executable and game pack with
Godot 4.5.1's Windows export templates. It writes `exports/Bladefall-Windows.zip`,
checks the PE signature/architecture and ZIP integrity, and includes a Windows
readme. Run `python3 tools/check-windows.py` with `GODOT` set to exercise the
Windows-exported game pack on the local host. This validates packaged resources
and save behavior, not the Windows executable's runtime on a Windows PC.

Upload the ZIP to the existing `ascend-v0.51.0` GitHub prerelease and redeploy Pages
after updating the landing page. Windows saves use the same portable format as
Mac and web. The Windows executable is unsigned.

## Android feasibility

Godot 4.5.1 supports APK export. This project does not yet have touch controls,
an Android export preset or a configured Android SDK/JDK 17 toolchain on the
release host. Android work needs those, signing with a persistent release key,
and device performance/control testing before advertising a phone download.
The repository's older JavaScript Android wrapper is a separate game build.
