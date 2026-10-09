# Bladefall — deploy folder

This folder is a **self-contained copy of the game** (no server, no build step,
no external dependencies). Host it anywhere static and it runs — including as an
installable phone app, because it ships a web app manifest and a service worker.

## Publish it to Netlify

This folder is the static game. **Online leaderboards and feedback also need the
Netlify Function from the repository.** A drag-and-drop static upload alone cannot
provide that server. Offline saves remain on the player's device until an API is available.

Deploy from the repository root using its `netlify.toml` and `netlify/functions`,
with `public` as the publish directory. Run `./build-deploy.sh` locally first to
prepare local submissions as a private function seed. See
`docs/playtest/RELEASE-7.300.md` in the repository for data transfer and organizer exports.
No deployment is performed by the build script.

## How you and friends install it on a phone

Once it's live at an `https://` URL, anyone can install it — no app store,
no account:

- **Android (Chrome):** open the URL → tap the **Install app** prompt, or
  ⋮ menu → **Install app** / **Add to Home Screen**.
- **iPhone (Safari):** open the URL → **Share** → **Add to Home Screen**.

It then launches full-screen from the home-screen icon and works offline after
the first load.

## Rebuilding this folder

Don't edit files in here directly — they're copies. Change the game in
`../public/`, then from the project root run:

```
./build-deploy.sh
```

That regenerates this folder from `public/` plus the config in `deploy-assets/`.

## What's here

`index.html` (the whole game), `littlejs.min.js` (engine), `music.mp3`,
`manifest.webmanifest`, `sw.js` (offline/service worker), the icons, and
`netlify.toml` and `_headers` (host config). That's everything the game needs.
