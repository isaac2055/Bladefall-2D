# Bladefall — deploy folder

This folder is a **self-contained copy of the game** (no server, no build step,
no external dependencies). Host it anywhere static and it runs — including as an
installable phone app, because it ships a web app manifest and a service worker.

## Publish it to Netlify

**Easiest — drag and drop:**

1. Go to <https://app.netlify.com/drop>
2. Drag this whole `netlify-deploy` folder onto the page. The source `public`
   folder is also directly uploadable, with no build step; it includes `_headers`.
3. Netlify gives you a URL like `https://your-site-name.netlify.app`. Done.

To publish updates to the **same** site later, open that site in Netlify →
**Deploys** tab → drag the freshly rebuilt folder onto the deploy area.

**Or connect the project Git repo:** the root `netlify.toml` sets the publish
directory to `public` with no build command. Leave the base directory at the
repository root. The game's `_headers` file applies to either upload method.

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
