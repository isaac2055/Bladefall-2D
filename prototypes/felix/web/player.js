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
let reportActivity, startupSignal;
const transfers = new Map();
async function loadAsset(name) {
  if (!transfers.has(name)) transfers.set(name, (async () => {
    const asset = manifest.files[name];
    const bytes = new Uint8Array(asset.size);
    // Sequential chunks bound decompression memory on smaller machines.
    let offset = 0;
    for (const part of asset.parts) {
      const response = await nativeFetch(part.url, { signal: startupSignal });
      if (!response.ok) throw Error(`Download failed (${response.status}). Please retry.`);
      let partBytes = 0;
      const compressed = response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
          partBytes += chunk.byteLength;
          if (partBytes > part.size) throw Error('Game download has an invalid size.');
          loaded += chunk.byteLength;
          reportActivity();
          $('progress').value = loaded / manifest.downloadBytes;
          $('status').textContent = loaded >= manifest.downloadBytes ? 'Starting Felix…' : `Downloading game · ${Math.min(100, Math.round(loaded / manifest.downloadBytes * 100))}%`;
          controller.enqueue(chunk);
        }
      }));
      const reader = compressed.pipeThrough(new DecompressionStream('gzip')).getReader();
      try {
        while (true) {
          const { value: raw, done } = await reader.read();
          if (done) break;
          if (offset + raw.length > bytes.length) throw Error('Game download has an invalid size.');
          bytes.set(raw, offset); offset += raw.length;
        }
      } finally { reader.releaseLock(); }
      if (partBytes !== part.size) throw Error('Game download was incomplete. Please retry.');
      reportActivity();
    }
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
    if (offset !== asset.size || hash !== asset.sha256) throw Error('Game download was incomplete. Please retry.');
    return bytes;
  })());
  return transfers.get(name);
}
if (!document.fullscreenEnabled) $('fullscreen').hidden = true;
let allowPortrait = false;
function updateOrientation() {
  $('rotate').hidden = !(window.felixReady && matchMedia('(pointer:coarse)').matches && innerHeight > innerWidth && !allowPortrait);
  if (document.hidden || !$('rotate').hidden) window.felixPauseForInterruption?.();
}
document.addEventListener('visibilitychange', updateOrientation);
$('portrait').onclick = () => { allowPortrait = true; updateOrientation(); $('canvas').focus(); };
window.addEventListener('resize', updateOrientation);
$('fullscreen').onclick = async () => {
  try { await document.documentElement.requestFullscreen(); $('canvas').focus(); }
  catch { $('fullscreen').textContent = 'Fullscreen unavailable'; }
};
$('start').onclick = async () => {
  $('start').hidden = true; $('progress').hidden = false;
  const abort = new AbortController();
  startupSignal = abort.signal;
  let timer, failStartup;
  const startupFailure = new Promise((_, reject) => { failStartup = reject; });
  reportActivity = () => {
    clearTimeout(timer);
    timer = setTimeout(() => failStartup(Error('Loading stopped responding. Please retry.')), 120000);
  };
  reportActivity();
  try {
    await Promise.race([(async () => {
      if (typeof DecompressionStream === 'undefined' || !window.WebAssembly) throw Error('Please use a current browser, or download the Mac app.');
      const missing = Engine.getMissingFeatures({ threads: false });
      if (missing.length) throw Error(`This browser needs: ${missing.join(', ')}. Try enabling hardware acceleration or use the Mac app.`);
      const response = await nativeFetch('manifest.json', { cache: 'no-store', signal: startupSignal });
      if (!response.ok) throw Error('Cannot load the game manifest. Please retry.');
      manifest = await response.json();
      reportActivity();
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
      window.felixEngine = new Engine({ executable: 'index', canvas: $('canvas'), canvasResizePolicy: 0, focusCanvas: true, persistentPaths: ['/userfs'], onPrint: (...args) => console.log(...args), onPrintError: (...args) => { console.error(...args); if (args.join(' ').includes('SCRIPT ERROR')) failStartup(Error('The game encountered a startup error. Please retry or use the Mac app.')); } });
      try { await window.felixEngine.startGame(); }
      finally { window.fetch = nativeFetch; }
    })(), startupFailure]);
    $('loading').hidden = true; $('canvas').focus();
    window.felixReady = true;
    updateOrientation();
    transfers.clear();
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  } catch (error) {
    $('progress').hidden = true; $('status').textContent = 'The game could not start.';
    $('error').textContent = error.message; $('retry').style.display = 'block';
    console.error(error);
  } finally {
    // Stop in-flight downloads on failure and release temporary asset buffers.
    abort.abort();
    clearTimeout(timer);
    reportActivity = () => {};
    transfers.clear();
    window.fetch = nativeFetch;
  }
};
