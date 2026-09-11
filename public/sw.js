/* Bladefall service worker — offline play + fast reloads once installed.
   Bump CACHE_NAME on a deploy where you want returning players to pick up
   the change immediately instead of waiting on the network-first refresh. */
const CACHE_NAME = 'bladefall-v176';
const CORE_ASSETS = [
  './',
  './index.html',
  './authoring.html',
  './dialogue-editor.html',
  './recollection-player.html',
  './index.html.pre-multiplayer.bak',
  './bladefall-core.js',
  './bladefall-simulation.js',
  './bladefall-renderer.js',
  './bladefall-platformer.js',
  './bladefall-environment.js',
  './bladefall-reactions.js',
  './bladefall-interactions.js',
  './bladefall-portals.js',
  './bladefall-remix.js',
  './bladefall-fluids.js',
  './bladefall-ecology.js',
  './bladefall-ai.js',
  './bladefall-authoring.js',
  './bladefall-campaign.js',
  './bladefall-charters.js',
  './bladefall-progression.js',
  './bladefall-secrets.js',
  './bladefall-capabilities.js',
  './bladefall-movement-progression.js',
  './bladefall-portal-progression.js',
  './bladefall-weapon-progression.js',
  './bladefall-equipment-economy.js',
  './bladefall-echoes.js',
  './bladefall-gifts.js',
  './bladefall-recollections.js',
  './bladefall-advancement.js',
  './bladefall-zones.js',
  './bladefall-zone-state.js',
  './bladefall-recovery.js',
  './bladefall-streaming.js',
  './bladefall-world.js',
  './bladefall-story.js',
  './bladefall-shops.js',
  './bladefall-quests.js',
  './bladefall-milestones.js',
  './bladefall-foundation-audit.js',
  './bladefall-cinematics.js',
  './bladefall-storage.js',
  './bladefall-input.js',
  './bladefall-content.js',
  './bladefall-presentation.js',
  './bladefall-multiplayer.js',
  './bladefall-audio.js',
  './bladefall-camera.js',
  './bladefall-release.js',
  './bladefall-blood.js',
  './bladefall-inventory.js',
  './bladefall-dialogue.js',
  './bladefall-harness.js',
  './littlejs.min.js',
  './peerjs.min.js',
  './music.mp3',
  './audio/ATTRIBUTION.md',
  './audio/music/strange-worlds.ogg',
  './audio/music/sunlight-through-leaves.ogg',
  './audio/music/whispering-woods.ogg',
  './audio/music/heat-of-battle.mp3',
  './audio/music/wind-over-the-trees.ogg',
  './audio/music/floating-dream.ogg',
  './audio/music/drifting-memories.ogg',
  './audio/music/abnormal-circumstances.mp3',
  './audio/music/clockwork.mp3',
  './audio/music/element.mp3',
  './audio/sfx/level1/dirt-chain-run-1.ogg',
  './audio/sfx/level1/dirt-chain-run-2.ogg',
  './audio/sfx/level1/dirt-chain-run-3.ogg',
  './audio/sfx/level1/dirt-chain-jump.ogg',
  './audio/sfx/level1/dirt-chain-land.ogg',
  './audio/sfx/level1/stone-chain-run-1.ogg',
  './audio/sfx/level1/stone-chain-run-2.ogg',
  './audio/sfx/level1/stone-chain-run-3.ogg',
  './audio/sfx/level1/stone-chain-jump.ogg',
  './audio/sfx/level1/stone-chain-land.ogg',
  './audio/sfx/level1/sword-attack-1.ogg',
  './audio/sfx/level1/sword-attack-2.ogg',
  './audio/sfx/level1/sword-attack-3.ogg',
  './audio/sfx/level1/sword-impact-1.ogg',
  './audio/sfx/level1/sword-impact-2.ogg',
  './audio/sfx/level1/sword-impact-3.ogg',
  './audio/sfx/level1/pickup-lock.ogg',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isPage) {
    // Network-first for the page itself, so a fresh deploy shows up right
    // away for anyone online; falls back to the cached copy when offline.
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
    );
  } else {
    // Cache-first for the big static assets (engine, music, icons) — they
    // rarely change and this keeps repeat loads fast and fully offline.
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        return res;
      }))
    );
  }
});
