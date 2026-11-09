const $ = id => document.getElementById(id);
const nativeFetch = window.fetch.bind(window);
function fitCanvas() {
  const box = document.querySelector('main').getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(box.width * ratio));
  const height = Math.max(1, Math.round(box.height * ratio));
  if ($('canvas').width !== width) $('canvas').width = width;
  if ($('canvas').height !== height) $('canvas').height = height;
}
new ResizeObserver(fitCanvas).observe(document.querySelector('main'));
fitCanvas();
let manifest, loaded = 0;
const transfers = new Map();
async function loadAsset(name) {
  if (!transfers.has(name)) transfers.set(name, (async () => {
    const asset = manifest.files[name];
    const bytes = new Uint8Array(asset.size);
    // Sequential chunks bound decompression memory on smaller machines.
    let offset = 0;
    for (const part of asset.parts) {
      const response = await nativeFetch(part.url);
      if (!response.ok) throw Error(`Download failed (${response.status}). Please retry.`);
      const compressed = await response.arrayBuffer();
      loaded += compressed.byteLength;
      $('progress').value = loaded / manifest.downloadBytes;
      $('status').textContent = loaded >= manifest.downloadBytes ? 'Starting Bladefall…' : `Downloading game · ${Math.min(100, Math.round(loaded / manifest.downloadBytes * 100))}%`;
      const raw = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
      if (offset + raw.length > bytes.length) throw Error('Game download has an invalid size.');
      bytes.set(raw, offset); offset += raw.length;
    }
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
    if (offset !== asset.size || hash !== asset.sha256) throw Error('Game download was incomplete. Please retry.');
    return bytes;
  })());
  return transfers.get(name);
}
if (!document.fullscreenEnabled) $('fullscreen').hidden = true;
let allowPortrait = false;
function updateOrientation() { $('rotate').hidden = !(window.bladefallReady && matchMedia('(pointer:coarse)').matches && innerHeight > innerWidth && !allowPortrait); }
$('portrait').onclick = () => { allowPortrait = true; updateOrientation(); $('canvas').focus(); };
window.addEventListener('resize', updateOrientation);
$('fullscreen').onclick = async () => {
  try { await document.documentElement.requestFullscreen(); $('canvas').focus(); }
  catch { $('fullscreen').textContent = 'Fullscreen unavailable'; }
};
$('start').onclick = async () => {
  $('start').hidden = true; $('progress').hidden = false;
  try {
    if (typeof DecompressionStream === 'undefined' || !window.WebAssembly) throw Error('Please use a current browser, or download the Mac app.');
    const missing = Engine.getMissingFeatures({ threads: false });
    if (missing.length) throw Error(`This browser needs: ${missing.join(', ')}. Try enabling hardware acceleration or use the Mac app.`);
    const response = await nativeFetch('manifest.json', { cache: 'no-store' });
    if (!response.ok) throw Error('Cannot load the game manifest. Please retry.');
    manifest = await response.json();
    // Godot receives standard Responses for its two large files; all underlying
    // Pages assets stay below 25 MiB. Names contain hashes to isolate releases.
    window.fetch = async (input, options) => {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href);
      const name = url.pathname.split('/').pop();
      if (url.origin === location.origin && url.pathname.startsWith('/play/') && manifest.files[name]) {
        return new Response(await loadAsset(name), { headers: { 'Content-Type': name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' } });
      }
      return nativeFetch(input, options);
    };
    let failStartup;
    const startupFailure = new Promise((_, reject) => { failStartup = reject; });
    window.bladefallEngine = new Engine({ executable: 'index', canvas: $('canvas'), canvasResizePolicy: 0, focusCanvas: true, persistentPaths: ['/userfs'], onPrint: (...args) => console.log(...args), onPrintError: (...args) => { console.error(...args); if (args.join(' ').includes('SCRIPT ERROR')) failStartup(Error('The game encountered a startup error. Please retry or use the Mac app.')); } });
    let timer;
    try {
      await Promise.race([window.bladefallEngine.startGame(), startupFailure, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Loading took too long. Please retry.')), 120000); })]);
    } finally { clearTimeout(timer); }
    $('loading').hidden = true; $('canvas').focus();
    window.bladefallReady = true;
    updateOrientation();
    transfers.clear();
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  } catch (error) {
    $('progress').hidden = true; $('status').textContent = 'The game could not start.';
    $('error').textContent = error.message; $('retry').style.display = 'block';
    console.error(error);
  }
};
