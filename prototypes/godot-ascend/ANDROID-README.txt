BLADEFALL — ASCEND
Willow Studios · Sample 0.53.1 · Android

Download Bladefall-Android.apk from https://bladefall2dsample.pages.dev
Open the download and allow your browser to install this app when Android asks.
Requires Android 10 or later, an ARMv7/ARM64 device and OpenGL ES 3.0 support.
This is a signed APK for direct installation. No Play Store account is needed.
It uses a separate app identifier from the older browser-based Bladefall APK.

Play in landscape. Move and aim with the left thumb. Use the right-hand Jump,
Dash, Carry, Strike, Parry and Portal buttons. Hold Carry to climb or carry;
aim with the left stick while pressing Dash. Pause or Android Back opens Settings.
Keyboard and controller controls remain available.

The app includes the game and plays offline. Progress saves automatically.
Settings > Export Save backs up your Garden, checkpoints and preferences.
Settings > Import Save moves progress from the browser or desktop apps.
Import replaces this app's local progress. Keep a backup before uninstalling.

Complete the three base worlds, then all three Fractured worlds, to unlock
Core Outskirts. Core worlds then unlock in order. Existing rewards and individual
puzzle checkpoints are preserved. Connected passages and their reveals match
the browser, Windows and Mac builds.

BUILDING
Use Godot 4.6.1, its Android export templates, JDK 17, Android SDK platform 35,
build-tools 35.0.0 and platform-tools. Set ANDROID_GODOT, ANDROID_SDK_ROOT and JAVA_HOME
as needed. tools/build-android.sh uses the persistent release keystore specified
by GODOT_ANDROID_KEYSTORE_RELEASE_PATH and GODOT_ANDROID_KEYSTORE_RELEASE_USER.
Supply GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD in the environment; never commit it.
Keep the same signing key and increase version/code for future updates.
The helper configures Android tool paths in the matching host Godot editor settings.
Android uses Godot 4.6.1 for permission-free scoped save import/export; desktop
and web remain on 4.5.1. Android imports run in an isolated ignored staging project.

MOBILE WEB
On iPhone, use https://bladefall2dsample.pages.dev and choose Play in browser.
Rotate sideways for the touch controls. Browser saves stay in that browser on
that site; export a backup before clearing site data. The APK is for Android.
