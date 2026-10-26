#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
APP_DIR="$PROJECT_DIR/exports/Bladefall Ascend Prototype.app"
[ -x "$ENGINE_PATH" ] || { echo 'Run Play Ascend.command once to obtain Godot, or set GODOT.'; exit 1; }
mkdir -p "$PROJECT_DIR/exports"
"$ENGINE_PATH" --headless --path "$PROJECT_DIR" --editor --import --quit
"$ENGINE_PATH" --headless --path "$PROJECT_DIR" --export-pack 'macOS Prototype' exports/BladefallAscend.pck
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"
# Replace mapped executables/packs atomically; overwriting a running Mach-O can
# invalidate its mapped pages and crash signing or another local test process.
cp "$ENGINE_PATH" "$APP_DIR/Contents/MacOS/Godot.new"
mv -f "$APP_DIR/Contents/MacOS/Godot.new" "$APP_DIR/Contents/MacOS/Godot"
cp "$PROJECT_DIR/exports/BladefallAscend.pck" "$APP_DIR/Contents/Resources/game.pck.new"
mv -f "$APP_DIR/Contents/Resources/game.pck.new" "$APP_DIR/Contents/Resources/game.pck"
xcrun clang -O2 -Wall -Wextra "$PROJECT_DIR/tools/launcher.c" -o "$APP_DIR/Contents/MacOS/BladefallAscend.new"
mv -f "$APP_DIR/Contents/MacOS/BladefallAscend.new" "$APP_DIR/Contents/MacOS/BladefallAscend"
cat > "$APP_DIR/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>BladefallAscend</string>
<key>CFBundleIdentifier</key><string>com.bladefall.ascend.prototype</string>
<key>CFBundleName</key><string>Bladefall Ascend Prototype</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>0.13.0</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
cp "$PROJECT_DIR/GODOT-LICENSE.txt" "$APP_DIR/Contents/Resources/GODOT-LICENSE.txt"
codesign --force --deep --sign - "$APP_DIR"
codesign --verify --deep --strict "$APP_DIR"
printf 'Built %s\n' "$APP_DIR"
