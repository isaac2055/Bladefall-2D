#!/usr/bin/env bash
# Builds Bladefall for Android: android/dist/Bladefall-<version>.apk, a sideloadable app with the whole game
# bundled inside (plays offline; co-op still needs the network).
#
# Needs a JDK (17+) and the Android SDK's platform + build-tools (no Gradle, no Android Studio):
#   brew install --cask temurin@17 android-commandlinetools
#   sdkmanager "platforms;android-34" "build-tools;34.0.0"      (accepting the SDK licence)
# Then:  ./android/build-apk.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
BUILD="$HERE/build"
DIST="$HERE/dist"
PLATFORM_VER="${PLATFORM_VER:-34}"
BT_VER="${BT_VER:-34.0.0}"

# --- tools ---------------------------------------------------------------------------------------------
SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
for c in "$SDK" "/opt/homebrew/share/android-commandlinetools" "/usr/local/share/android-commandlinetools" "$HOME/Library/Android/sdk"; do
  if [ -n "$c" ] && [ -d "$c/build-tools/$BT_VER" ]; then SDK="$c"; break; fi
done
[ -d "$SDK/build-tools/$BT_VER" ] || { echo "Android build-tools $BT_VER not found (set ANDROID_SDK_ROOT)"; exit 1; }
BT="$SDK/build-tools/$BT_VER"
ANDROID_JAR="$SDK/platforms/android-$PLATFORM_VER/android.jar"
[ -f "$ANDROID_JAR" ] || { echo "platforms;android-$PLATFORM_VER not installed"; exit 1; }
if [ -z "${JAVA_HOME:-}" ]; then
  for c in /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home /usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home; do
    if [ -x "$c/bin/javac" ]; then JAVA_HOME="$c"; break; fi
  done
  if [ -z "${JAVA_HOME:-}" ]; then JAVA_HOME="$(/usr/libexec/java_home -v 17+ 2>/dev/null || true)"; fi
fi
[ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/javac" ] || { echo "A JDK 17+ is needed (JAVA_HOME)"; exit 1; }
export JAVA_HOME PATH="$JAVA_HOME/bin:$PATH"

VERSION="$(grep -o "const VERSION='[^']*'" "$ROOT/public/index.html" | sed "s/const VERSION='//;s/'//")"
# versionCode from the version: 7.258.0 -> 7258000
IFS=. read -r MA MI PA <<<"$VERSION"; CODE=$(( MA*1000000 + MI*1000 + ${PA:-0} ))
echo "Building Bladefall $VERSION (code $CODE) with build-tools $BT_VER, android-$PLATFORM_VER"

rm -rf "$BUILD"; mkdir -p "$BUILD"/{assets/www,res,classes,dex,gen} "$DIST"

# --- the game files: exactly what the website ships ---------------------------------------------------------
# Match the Cloudflare public output, including newly added campaign modules.
(cd "$ROOT" && node scripts/playtest-release/check-cloudflare-assets.mjs) >/dev/null
rsync -a --exclude 'serve.mjs' --exclude '*.bak' --exclude '_headers' --exclude '_redirects' "$ROOT/public/" "$BUILD/assets/www/"

# --- launcher icon ------------------------------------------------------------------------------------------
for d in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  dir="$BUILD/res/mipmap-${d%%:*}"; mkdir -p "$dir"
  sips -z "${d##*:}" "${d##*:}" "$ROOT/public/icon-512.png" --out "$dir/ic_launcher.png" >/dev/null
done

# --- compile, dex, package, align, sign --------------------------------------------------------------------
"$BT/aapt2" compile --dir "$BUILD/res" -o "$BUILD/res.zip"
"$BT/aapt2" link -o "$BUILD/unsigned.apk" -I "$ANDROID_JAR" --manifest "$HERE/AndroidManifest.xml" \
  -R "$BUILD/res.zip" -A "$BUILD/assets" --min-sdk-version 24 --target-sdk-version "$PLATFORM_VER" \
  --version-code "$CODE" --version-name "$VERSION" --java "$BUILD/gen" -0 mp3 -0 ogg -0 wav -0 png
# (the project path has a space in it: file lists go through -print0 / xargs -0)
find "$HERE/src" -name '*.java' -print0 | xargs -0 javac --release 11 -nowarn -classpath "$ANDROID_JAR" -d "$BUILD/classes"
find "$BUILD/classes" -name '*.class' -print0 | xargs -0 "$BT/d8" --release --lib "$ANDROID_JAR" --min-api 24 --output "$BUILD/dex"
(cd "$BUILD/dex" && zip -q -j "$BUILD/unsigned.apk" classes.dex)
"$BT/zipalign" -p -f 4 "$BUILD/unsigned.apk" "$BUILD/aligned.apk"

# A local signing key. Keep android/bladefall.keystore: updates must be signed with the same key, or the
# phone refuses them (and uninstalling to get round that loses the app's saves).
KS="$HERE/bladefall.keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -alias bladefall -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass bladefall -keypass bladefall -dname "CN=Bladefall, O=Bladefall" >/dev/null 2>&1
fi
OUT="$DIST/Bladefall-$VERSION.apk"
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:bladefall --key-pass pass:bladefall --ks-key-alias bladefall --out "$OUT" "$BUILD/aligned.apk"
"$BT/apksigner" verify "$OUT"
rm -f "$OUT.idsig"
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
