import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(root, 'public');
const mirror = resolve(root, 'netlify-deploy');
// build-deploy.sh is the single source of truth for what ships. Parse it
// rather than keeping a second list here, which drifted and left modules
// and the Level 1 SFX unverified.
const deployScript = await readFile(resolve(root, 'build-deploy.sh'), 'utf8');
const assets = (deployScript.match(/^ASSETS=\(([\s\S]*?)^\)/m)?.[1] || '')
  .split('\n').map((line) => line.replace(/#.*$/, '').trim()).filter(Boolean);

const failures = [];
if (assets.length < 80) failures.push(`build-deploy.sh asset list did not parse (${assets.length} entries)`);
const sizes = {};
const sourceBytes = new Map();
for (const asset of assets) {
  try {
    const path = resolve(source, asset);
    const data = await readFile(path);
    sourceBytes.set(asset, data);
    sizes[asset] = (await stat(path)).size;
  } catch {
    failures.push(`missing source asset: ${asset}`);
  }
}

const index = sourceBytes.get('index.html')?.toString() || '';
const worker = sourceBytes.get('sw.js')?.toString() || '';
const manifestText = sourceBytes.get('manifest.webmanifest')?.toString() || '{}';
const version = index.match(/const VERSION='([^']+)'/)?.[1] || null;
const cache = worker.match(/const CACHE_NAME = '([^']+)'/)?.[1] || null;

for (const asset of assets.filter((name) => name.endsWith('.js') && name !== 'littlejs.min.js' && name !== 'sw.js' && name !== 'peerjs.min.js')) {
  if (!index.includes(`src="${asset}"`) && asset !== 'bladefall-release.js') failures.push(`index does not reference ${asset}`);
}
if (!sourceBytes.get('dialogue-editor.html')?.toString().includes('bladefall-dialogue.js')) failures.push('dialogue editor does not reference dialogue registry');
if (!index.includes('src="bladefall-release.js"')) failures.push('index does not reference bladefall-release.js');
for (const asset of assets) if (!worker.includes(`'./${asset}'`) && asset !== 'sw.js') failures.push(`service worker does not cache ${asset}`);
for (const [, src] of index.matchAll(/<script\s+src="([^"]+)"/g)) {
  if (/^(https?:)?\/\//.test(src)) continue;
  if (!assets.includes(src)) failures.push(`index references unshipped script: ${src}`);
}
if (/https?:\/\/localhost|file:\/\//.test(index)) failures.push('index contains a local-only absolute URL');

try {
  const manifest = JSON.parse(manifestText);
  if (manifest.display !== 'standalone') failures.push('manifest display is not standalone');
  if (manifest.orientation !== 'landscape') failures.push('manifest orientation is not landscape');
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 4) failures.push('manifest icon set is incomplete');
} catch {
  failures.push('manifest is invalid JSON');
}

for (const asset of assets) {
  try {
    const built = await readFile(resolve(mirror, asset));
    const original = sourceBytes.get(asset);
    if (!original || !built.equals(original)) failures.push(`deploy mirror differs: ${asset}`);
  } catch {
    failures.push(`missing deploy asset: ${asset}`);
  }
}
try {
  const headers = await readFile(resolve(source, '_headers'), 'utf8');
  const built = await readFile(resolve(mirror, '_headers'), 'utf8');
  if (headers !== built) failures.push('deploy mirror differs: _headers');
  if (!/\/sw\.js\s+Cache-Control: no-cache/.test(headers)) failures.push('missing service-worker revalidation header');
  if (!headers.includes('Content-Type: application/manifest+json')) failures.push('missing manifest MIME header');
} catch { failures.push('missing public or deploy _headers'); }
if ((sizes['index.html'] || 0) > 1_600_000) failures.push('index.html exceeds the release size budget');
for (const [asset, size] of Object.entries(sizes)) {
  if (asset.startsWith('bladefall-') && size > 320_000) failures.push(`${asset} exceeds the module size budget`);
}

const report = {
  ok: failures.length === 0,
  version,
  cache,
  assets: assets.length,
  sourceBytes: Object.values(sizes).reduce((sum, size) => sum + size, 0),
  failures,
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
