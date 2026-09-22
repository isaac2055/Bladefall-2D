/* Bladefall service worker — offline play + fast reloads once installed.
   Bump CACHE_NAME on a deploy where you want returning players to pick up
   the change immediately instead of waiting on the network-first refresh. */
const CACHE_NAME = 'bladefall-v243';
const CORE_ASSETS = [
  './',
  './index.html',
  './authoring.html',
  './astra-respec.html',
  './astra-respec.js?v=5',
  './fable-respec.html',
  './fable-respec.js',
  './dialogue-editor.html',
  './recollection-player.html',
  './index.html.pre-multiplayer.bak',
  './bladefall-core.js',
  './bladefall-simulation.js',
  './bladefall-renderer.js',
  './bladefall-respec-renderer.js?v=7.111.0',
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
  './bladefall-shops.js?v=7.112.0',
  './bladefall-quests.js?v=7.107.0',
  './bladefall-milestones.js',
  './bladefall-foundation-audit.js',
  './bladefall-cinematics.js',
  './bladefall-storage.js',
  './bladefall-input.js',
  './bladefall-content.js',
  './bladefall-presentation.js',
  './bladefall-multiplayer.js',
  './bladefall-audio.js',
  './bladefall-camera.js?v=7.107.0',
  './bladefall-release.js',
  './bladefall-blood.js',
  './bladefall-inventory.js',
  './bladefall-dialogue.js?v=7.107.0',
  './bladefall-harness.js',
  './littlejs.min.js',
  './peerjs.min.js',
  './music.mp3',
  './audio/ATTRIBUTION.md',
  './audio/music/midnight-field.mp3',
  './audio/music/watchful-greenwood.mp3',
  './audio/music/the-iron-causeway.mp3',
  './audio/music/iron-juggernaut.mp3',
  './audio/music/canyon-updrafts.mp3',
  './audio/music/crosshairs-over-open-ground.mp3',
  './audio/music/crosshairs-in-the-dark.mp3',
  './audio/music/stony-whispers-of-the-keep.mp3',
  './audio/music/iron-gavel-descent.mp3',
  './audio/music/sentence-of-the-shield-warden.mp3',
  './audio/music/hearthfire-in-the-frost.mp3',
  './audio/music/glaciated-court-of-glass.mp3',
  './audio/music/the-sorcerers-hall-of-mirrors.mp3',
  './audio/music/the-eternal-furnace.mp3',
  './audio/music/the-obsidian-foundry.mp3',
  './audio/music/forge-of-the-molten-colossus.mp3',
  './audio/music/chamber-of-inverted-gravity.mp3',
  './audio/music/paradox-void-assault.mp3',
  './audio/music/iron-oath-of-the-night-attack.mp3',
  './audio/music/the-black-procession.mp3',
  './audio/music/a-crown-of-ashes.mp3',
  './audio/music/engine-of-the-frozen-garrison.mp3',
  './audio/music/chasing-daylight-on-broken-rails.mp3',
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
  } else if (e.request.headers.has('range')) {
    // Media elements seek with Range requests. Answering one with the whole cached
    // file makes the track unseekable: music could not resume its saved position
    // or loop from a point after its intro. Slice the cached copy into a 206.
    e.respondWith(
      caches.match(e.request).then((cached) => cached ? rangeResponse(cached, e.request.headers.get('range')) : fetch(e.request))
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

function rangeResponse(res, header) {
  return res.arrayBuffer().then((buf) => {
    const size = buf.byteLength;
    const m = /^bytes=(\d*)-(\d*)$/.exec(header || '');
    if (!m || (!m[1] && !m[2])) return new Response(buf, { status: 200, headers: res.headers });
    const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    return new Response(buf.slice(start, end + 1), {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes',
      },
    });
  });
}
