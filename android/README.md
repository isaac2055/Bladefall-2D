# Bladefall for Android

`./android/build-apk.sh` (or `npm run build:apk`) builds `android/dist/Bladefall-<version>.apk`. It is a full-screen, landscape app with the whole game inside it:
- the current Cloudflare `public/` assets, validated before packaging;
- it plays offline (co-op still needs the network);
- saves stay on the phone and survive updates.

## Install it on the phone (Galaxy S23 Ultra)

1. Get the APK onto the phone. Any of these works:
   - **Google Drive:** upload it, then on the phone open it from the Drive app.
   - **USB cable:** copy it into the phone's Download folder (OpenMTP or Android File Transfer on the Mac).
   - **adb:** `sdkmanager "platform-tools"`, turn on USB debugging (Settings → Developer options), then `adb install -r android/dist/Bladefall-<version>.apk`.
2. Open the file on the phone (My Files → Download).
3. Android asks to allow "Install unknown apps" for that app (My Files or Drive). Allow it, then **Install**.
4. Bladefall is now in the app drawer.

**Updating:** build again and install the new APK over the old one. The phone only accepts an update signed with the same key, so keep `android/bladefall.keystore`. It is not ignored by git on purpose. Uninstalling to get round a key mismatch deletes the app's saves.

## How it is built

The build uses no Gradle and no Android Studio. It needs a JDK 17+ and the SDK's `platforms;android-34` and `build-tools;34.0.0`. On this Mac those came from:

```bash
brew install openjdk@17 && brew install --cask android-commandlinetools
```

```bash
sdkmanager --sdk_root=/opt/homebrew/share/android-commandlinetools "platforms;android-34" "build-tools;34.0.0"
```

The script finds the Homebrew JDK before older system Java installations. Override with `JAVA_HOME` or `ANDROID_SDK_ROOT` if needed.

The app is one Java class, `src/com/bladefall/game/MainActivity.java`, holding a WebView:
- **Serving the game.** It serves `assets/www` from `https://appassets.bladefall/`, an address that exists only inside the app. Saves (localStorage), audio and scripts therefore behave exactly as on the website.
- **Screen.** It hides the system bars, keeps the screen on and draws under the camera cut-out.
- **Downloads:** external web links open in the phone browser. Co-op uses the existing online WebRTC connection; each Survive player runs their own room state.
- **Touch:** Survive starts with immediate action buttons and a low-deadzone stick. Existing custom or gesture layouts are retained; choose a different layout under Touch controls.
- **Controller:** Survive supports standard controllers with rebindings; Explore supports the standard mapping documented in Settings, including LB utility combinations.
- **Back gesture:**
  - In the Precision Core it pauses, or steps back a menu.
  - At the title, it presses Escape; a second back within two seconds closes the app.
