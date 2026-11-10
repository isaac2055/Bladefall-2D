#!/bin/bash
set -euo pipefail

run_engine() {
 local build_log
 build_log="$(mktemp -t felix-godot-build)"
 if ! "$ENGINE_PATH" "$@" >"$build_log" 2>&1; then cat "$build_log"; rm -f "$build_log"; return 1; fi
 if rg -q 'SCRIPT ERROR|Parse Error|ERROR:' "$build_log"; then cat "$build_log"; rm -f "$build_log"; return 1; fi
 cat "$build_log"
 rm -f "$build_log"
}

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${ANDROID_GODOT:-$REPO_DIR/.cache/godot-android/Godot.app/Contents/MacOS/Godot}"
STAGE_DIR="$REPO_DIR/.cache/godot-android/project"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-/opt/homebrew/share/android-commandlinetools}"
export ADB_LIBUSB="${ADB_LIBUSB:-1}"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export GODOT_ANDROID_KEYSTORE_RELEASE_PATH="${GODOT_ANDROID_KEYSTORE_RELEASE_PATH:-$HOME/Library/Application Support/WillowStudios/signing/felix-release.keystore}"
export GODOT_ANDROID_KEYSTORE_RELEASE_USER="${GODOT_ANDROID_KEYSTORE_RELEASE_USER:-felix}"
if [ -z "${GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD:-}" ]; then
 GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD="$(security find-generic-password -a "$(id -un)" -s willowstudios.felix.android.release -w)"
fi
export GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD
[ -x "$ENGINE_PATH" ] || { echo 'Set ANDROID_GODOT to Godot 4.6.1 (Android scoped file access).'; exit 1; }
[[ "$("$ENGINE_PATH" --version)" == 4.6.1.* ]] || { echo 'Android exports require the tested Godot 4.6.1 editor and templates.'; exit 1; }
mkdir -p "$PROJECT_DIR/exports"
touch "$PROJECT_DIR/exports/.gdignore"
# Isolate 4.6 imports from the 4.5 desktop/web editor cache.
python3 - "$PROJECT_DIR" "$STAGE_DIR" <<'PY_STAGE'
import pathlib,shutil,sys
source,stage=map(pathlib.Path,sys.argv[1:])
# Keep the isolated 4.6 import cache; never share it with desktop/web's 4.5 cache.
if stage.exists():
 for item in stage.iterdir():
  if item.name=='.godot': continue
  if item.is_dir() and not item.is_symlink(): shutil.rmtree(item)
  else: item.unlink()
shutil.copytree(source,stage,dirs_exist_ok=True,ignore=shutil.ignore_patterns('.godot','exports','android','.DS_Store'))
PY_STAGE
export GODOT="$ENGINE_PATH"
export ANDROID_DEBUG_KEYSTORE="$PROJECT_DIR/.godot/android-debug.keystore"
if [ ! -f "$ANDROID_DEBUG_KEYSTORE" ]; then
 "$JAVA_HOME/bin/keytool" -genkeypair -keystore "$ANDROID_DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug, O=Android" -noprompt
fi
python3 "$PROJECT_DIR/tools/configure-android.py"
run_engine --headless --path "$STAGE_DIR" --editor --import --quit
run_engine --headless --path "$STAGE_DIR" --export-release Android "$PROJECT_DIR/exports/Felix-Android.apk"
"$ANDROID_SDK_ROOT/build-tools/35.0.0/apksigner" verify "$PROJECT_DIR/exports/Felix-Android.apk"
printf 'Built signed Android APK: %s\n' "$PROJECT_DIR/exports/Felix-Android.apk"
