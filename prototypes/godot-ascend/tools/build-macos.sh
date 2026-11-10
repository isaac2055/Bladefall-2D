#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$PROJECT_DIR/tools/run-build-engine.sh"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
APP_DIR="$PROJECT_DIR/exports/Bladefall.app"
[ -x "$ENGINE_PATH" ] || { echo 'Run Play Ascend.command once to obtain Godot, or set GODOT.'; exit 1; }
engine_version="$("$ENGINE_PATH" --version)"
template_version="${engine_version%%.official*}"
MACOS_TEMPLATE="${MACOS_TEMPLATE_ZIP:-$HOME/Library/Application Support/Godot/export_templates/$template_version/macos.zip}"
[ -r "$MACOS_TEMPLATE" ] || { echo 'Install matching Godot export templates or set MACOS_TEMPLATE_ZIP.'; exit 1; }
mkdir -p "$PROJECT_DIR/exports"
run_engine --headless --path "$PROJECT_DIR" --editor --import --quit
run_engine --headless --path "$PROJECT_DIR" --export-pack 'macOS Prototype' exports/BladefallAscend.pck
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"
# Replace mapped executables/packs atomically; overwriting a running Mach-O can
# invalidate its mapped pages and crash signing or another local test process.
runtime_tmp="$(mktemp "$APP_DIR/Contents/MacOS/.godot-release.XXXXXX")"
trap 'rm -f "$runtime_tmp"' EXIT
unzip -p "$MACOS_TEMPLATE" macos_template.app/Contents/MacOS/godot_macos_release.universal >"$runtime_tmp"
chmod 755 "$runtime_tmp"
lipo "$runtime_tmp" -verify_arch arm64 x86_64
[[ "$("$runtime_tmp" --version)" == "$engine_version" ]] || { echo 'macOS runtime must match the build engine.'; exit 1; }
mv -f "$runtime_tmp" "$APP_DIR/Contents/MacOS/Godot"
cp "$PROJECT_DIR/exports/BladefallAscend.pck" "$APP_DIR/Contents/Resources/game.pck.new"
mv -f "$APP_DIR/Contents/Resources/game.pck.new" "$APP_DIR/Contents/Resources/game.pck"
xcrun clang -arch arm64 -arch x86_64 -mmacosx-version-min=11.0 -O2 -Wall -Wextra "$PROJECT_DIR/tools/launcher.c" -o "$APP_DIR/Contents/MacOS/BladefallAscend.new"
mv -f "$APP_DIR/Contents/MacOS/BladefallAscend.new" "$APP_DIR/Contents/MacOS/BladefallAscend"
cat > "$APP_DIR/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>BladefallAscend</string>
<key>CFBundleIdentifier</key><string>com.bladefall.ascend.prototype</string>
<key>CFBundleName</key><string>Bladefall</string>
<key>CFBundleDisplayName</key><string>Bladefall</string>
<key>CFBundleIconFile</key><string>AppIcon.icns</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>0.53.1</string>
<key>LSMinimumSystemVersion</key><string>11.0</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
cp "$PROJECT_DIR/art/AppIcon.icns" "$APP_DIR/Contents/Resources/AppIcon.icns"
cp "$PROJECT_DIR/PLAYER-README.txt" "$APP_DIR/Contents/Resources/Read Me.txt"
cp "$PROJECT_DIR/GODOT-LICENSE.txt" "$APP_DIR/Contents/Resources/GODOT-LICENSE.txt"
codesign --force --deep --sign - "$APP_DIR"
codesign --verify --deep --strict "$APP_DIR"
printf 'Built %s\n' "$APP_DIR"

ditto -c -k --sequesterRsrc --keepParent "$APP_DIR" "$PROJECT_DIR/exports/Bladefall-macOS.zip"

cp "$PROJECT_DIR/PLAYER-README.txt" "$PROJECT_DIR/exports/Read Me.txt"
zip -g -j "$PROJECT_DIR/exports/Bladefall-macOS.zip" "$PROJECT_DIR/exports/Read Me.txt"
