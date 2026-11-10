#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$PROJECT_DIR/tools/run-build-engine.sh"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${ANDROID_GODOT:-$REPO_DIR/.cache/godot-android/Godot.app/Contents/MacOS/Godot}"
STAGE_DIR="$REPO_DIR/.cache/godot-android/project"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-/opt/homebrew/share/android-commandlinetools}"
export ADB_LIBUSB="${ADB_LIBUSB:-1}"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export GODOT_ANDROID_KEYSTORE_RELEASE_PATH="${GODOT_ANDROID_KEYSTORE_RELEASE_PATH:-$REPO_DIR/android/bladefall.keystore}"
export GODOT_ANDROID_KEYSTORE_RELEASE_USER="${GODOT_ANDROID_KEYSTORE_RELEASE_USER:-bladefall}"
: "${GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD:?Set the persistent signing key password in this environment}"
export GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD
[ -x "$ENGINE_PATH" ] || { echo 'Set ANDROID_GODOT to Godot 4.6.1 (Android scoped file access).'; exit 1; }
[[ "$("$ENGINE_PATH" --version)" == 4.6.1.* ]] || { echo 'Android exports require the tested Godot 4.6.1 editor and templates.'; exit 1; }
mkdir -p "$PROJECT_DIR/exports"
touch "$PROJECT_DIR/exports/.gdignore"
# Isolate 4.6 imports from the 4.5 desktop/web editor cache.
python3 - "$PROJECT_DIR" "$STAGE_DIR" <<'PY_STAGE'
import pathlib,shutil,sys
source,stage=map(pathlib.Path,sys.argv[1:])
if stage.exists(): shutil.rmtree(stage)
shutil.copytree(source,stage,ignore=shutil.ignore_patterns('.godot','exports','android','.DS_Store'))
PY_STAGE
cp "$PROJECT_DIR/audio/ATTRIBUTION.md" "$STAGE_DIR/audio/ATTRIBUTION.txt"
export GODOT="$ENGINE_PATH"
export ANDROID_DEBUG_KEYSTORE="$PROJECT_DIR/.godot/android-debug.keystore"
if [ ! -f "$ANDROID_DEBUG_KEYSTORE" ]; then
 "$JAVA_HOME/bin/keytool" -genkeypair -keystore "$ANDROID_DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug, O=Android" -noprompt
fi
python3 "$PROJECT_DIR/tools/configure-android.py"
run_engine --headless --path "$STAGE_DIR" --editor --import --quit
run_engine --headless --path "$STAGE_DIR" --export-release Android "$PROJECT_DIR/exports/Bladefall-Android.apk"
"$ANDROID_SDK_ROOT/build-tools/35.0.0/apksigner" verify "$PROJECT_DIR/exports/Bladefall-Android.apk"
python3 - "$PROJECT_DIR/exports/Bladefall-Android.apk" <<'PY_APK'
import sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
 assert archive.testzip() is None, 'Corrupt APK'
 for name in ('assets/GODOT-LICENSE.txt','assets/audio/ATTRIBUTION.txt'):
  assert archive.read(name).strip(), f'Missing packaged credits: {name}'
PY_APK
printf 'Built signed Android APK: %s\n' "$PROJECT_DIR/exports/Bladefall-Android.apk"
