#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$PROJECT_DIR/../.." && pwd)"
ENGINE_PATH="${GODOT:-$REPO_DIR/.cache/godot/Godot.app/Contents/MacOS/Godot}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-/opt/homebrew/share/android-commandlinetools}"
export ADB_LIBUSB="${ADB_LIBUSB:-1}"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export GODOT_ANDROID_KEYSTORE_RELEASE_PATH="${GODOT_ANDROID_KEYSTORE_RELEASE_PATH:-$REPO_DIR/android/bladefall.keystore}"
export GODOT_ANDROID_KEYSTORE_RELEASE_USER="${GODOT_ANDROID_KEYSTORE_RELEASE_USER:-bladefall}"
: "${GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD:?Set the persistent signing key password in this environment}"
export GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD
[ -x "$ENGINE_PATH" ] || { echo 'Set GODOT to the Godot 4.5.1 executable.'; exit 1; }
mkdir -p "$PROJECT_DIR/exports"
touch "$PROJECT_DIR/exports/.gdignore"
"$ENGINE_PATH" --headless --path "$PROJECT_DIR" --editor --import --quit
export GODOT="$ENGINE_PATH"
export ANDROID_DEBUG_KEYSTORE="$PROJECT_DIR/.godot/android-debug.keystore"
if [ ! -f "$ANDROID_DEBUG_KEYSTORE" ]; then
 "$JAVA_HOME/bin/keytool" -genkeypair -keystore "$ANDROID_DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug, O=Android" -noprompt
fi
python3 "$PROJECT_DIR/tools/configure-android.py"
"$ENGINE_PATH" --headless --path "$PROJECT_DIR" --export-release Android "$PROJECT_DIR/exports/Bladefall-Android.apk"
"$ANDROID_SDK_ROOT/build-tools/35.0.0/apksigner" verify "$PROJECT_DIR/exports/Bladefall-Android.apk"
printf 'Built signed Android APK: %s\n' "$PROJECT_DIR/exports/Bladefall-Android.apk"
