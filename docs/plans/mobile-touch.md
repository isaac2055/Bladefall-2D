# The new physics on mobile (7.258.0)

Isaac asked for the Precision Core to play well on his Galaxy S23 Ultra:
- on the website first;
- then as an app he can install from an APK;
- with swipe-friendly menus;
- with re-mappable touch controls.

His suggested gestures are the defaults.

## Controls

| Thumb | Gesture | Action |
|---|---|---|
| Left | Drag anywhere on the left 42% of the screen | A floating stick that appears where the thumb lands and follows it if it drifts |
| Right | Tap | Jump |
| Right | Swipe (8-way) | Dash in that direction |
| Right | Hold | Grab: cling and climb; by a lantern, pick it up; while carrying, hold again to throw (stick down + hold sets it down) |
| Right | Double-tap | Parry |
| Two fingers | Swipe | Blade strike, aimed by the swipe |
| Two fingers | Tap | Portal, aimed by the stick |
| Corner buttons | Top right | Pause and retry |
| — | Android back gesture | Pauses, or steps back a menu |

## Where the controls differ from Isaac's suggestions, and why

- **Jump fires about 65 ms after the thumb lands, not at once.** That is how a swipe (dash) is told from a tap (jump) without a stray jump before every dash. If the thumb is already moving at that point, the decision waits about 70 ms longer, so a slower swipe still dashes cleanly. A quick tap jumps the moment it lifts.
- **A tap gives a full jump.** In this physics a quick 4-frame tap would only rise 12 px against a full jump's 27 px. Settings → "Tap jump height: follows the finger" restores short hops.
- **Throwing the lantern is a second hold, not a tap.** Tap must stay jump while carrying, because carrying rooms need jumps.
- **By a wall or a lantern, or while carrying, the right thumb waits to see tap or hold.** A tap is then a (wall) jump and a hold is a grab, so holding to cling never makes the knight jump first. Elsewhere a hold that follows a jump also grabs, so you cling to whatever wall the jump reaches.
- **Double-tap still jumps on its first tap.** Waiting to rule out a double-tap would delay every jump by a quarter second. Parry can be moved to a two-finger tap or a button.
- **Two-finger gestures are hard with thumbs alone.** The "Gestures + buttons" layout puts blade, parry and portal on buttons instead.

## Touch controls (the mobile keybinds)

On a touch device, Pause → Controls or Main menu → Controls opens the Touch controls card:

| Setting | Options |
|---|---|
| Layout | Gestures; Gestures + buttons for blade, parry and portal; Buttons only |
| Per-action gesture | Each action has its allowed gestures plus "On-screen button". Double-tap and two-finger tap can each carry one action; choosing one moves the other. |
| Tap jump height | Full; follows the finger |
| Swipe distance | Short / medium / long |
| Stick | Floating or fixed |
| Hands | Left-handed swap |
| Size and opacity | — |
| Vibration | On / off |
| Gesture reminder | Shown in the side margins for five seconds per room |
| Full screen on play | In the browser |

The keyboard and controller page stays one tap away.

## Screen and menus

- **Rendering.** On touch screens the canvas renders at device pixels with an integer scale where it fits. On the S23 that is 5×: crisp pixel art at 85% of the height. Desktop rendering is unchanged.
- **Chapter menu.** It becomes swipeable pages, one per part, with a tab strip (I … XX, Mo, R, V, C). It remembers the last page.
- **Menus generally.** Buttons and selects are larger. A tap shim catches the clicks some Android builds drop inside scrolling menus; the base game already used the same shim.
- **Portrait.** During play a "turn your phone sideways" card appears; menus work either way.
- **Room hints read in gestures**, for example "Tap jumps · Swipe dashes in 8 directions".

## The app

There are two ways to get a dedicated app on the phone:

1. **Website, installed.** Deploy `netlify-deploy/`, open it in Chrome on the phone, then menu → **Install app**. Chrome makes a real installed app from the existing manifest: landscape and standalone. The service worker caches the files for offline play.
2. **The APK.** `./android/build-apk.sh` builds `android/dist/Bladefall-<version>.apk`, about 350 MB, almost all music. It is a full-screen WebView app with the game bundled; installation steps are in `android/README.md`.

## Checked

`npm run verify:touch` runs headless Chrome emulating the S23 Ultra in landscape and sends real touch events. Its 14 checks:
- the swipeable menu turns pages;
- tap jumps;
- a sideways flick dashes with no jump; an up-left flick dashes diagonally;
- the stick moves the knight;
- a hold on a wall clings without jumping;
- by the lantern: hold picks it up, tap jumps while carrying, and a second hold throws;
- double-tap parries in a Foes room;
- a two-finger swipe strikes;
- the pause button pauses;
- no page errors.

Screens were checked at device resolution: the menu, play with gesture reminders, the buttons layout, the Touch controls card and the portrait card. Desktop regressions passed.

The APK passes `aapt2 dump badging` and `apksigner verify`. **It has not been run on a phone or emulator yet; Isaac's S23 is the first real device.**
