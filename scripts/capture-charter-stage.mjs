import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function slug(value) {
  return String(value || 'room').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function place(page, x, view) {
  return page.evaluate(({ x: target, view: requestedView }) => {
    const game = window.__BF.G, player = game.p;
    game.evidenceCapture = true;
    // Stills document authored composition, not combat simulation. Keep actors
    // visible but stop AI from moving the scene between placement and capture.
    for (const enemy of game.enemies || []) {
      enemy.active = false;
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.lunge = 0;
    }
    const supports = game.obstacles.filter((object) => object && object.type === 'plat'
      && !object.fake && !object.gone && !object.ceiling && Number.isFinite(object.x)
      && Math.abs(object.x - target) < 680);
    const nearby = supports.filter((object) => Math.abs(object.x - target) <= (object.w || 0) / 2 + 100);
    const pool = nearby.length ? nearby : supports;
    const support = pool.reduce((selected, object) => {
      if (!selected) return object;
      return requestedView === 'upper'
        ? (object.y > selected.y ? object : selected)
        : (object.y < selected.y ? object : selected);
    }, null);
    const y = support ? Math.max(0, support.y) : 0;
    const cameraX = Math.max(0, Math.min(game.levelLength - innerWidth, target - innerWidth * .38));
    const cameraY = Math.max(0, y - 390);
    Object.assign(player, { x: target, y, vx: 0, vy: 0, dead: false, onGround: true, invuln: 9999 });
    player.floorPlat = support;
    game.stageBanner = 0; game.shake = 0; game.cam = cameraX; game.camY = cameraY;
    window.__BF.camera.reset(cameraX, cameraY); window.__BF.camera.sync(cameraX, cameraY);
    return { x: Math.round(target), y: Math.round(y), cameraX: Math.round(cameraX), cameraY: Math.round(cameraY) };
  }, { x, view });
}

const stageIndex = Number.parseInt(argument('--stage', '0'), 10);
const url = argument('--url', 'http://127.0.0.1:8877/index.html');
const blueprintSource = await readFile(resolve(ROOT, 'public/index.html'), 'utf8');
const expectedVersion = blueprintSource.match(/const VERSION='([^']+)'/)?.[1];
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-background-timer-throttling'] });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()); });

try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setBypassServiceWorker(true);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.__BF && window.__BF.charters, { timeout: 20000 });
  const servedVersion = await page.evaluate(() => window.__BF.VERSION);
  if (servedVersion !== expectedVersion) throw new Error(`Expected ${expectedVersion}, received ${servedVersion}.`);
  const setup = await page.evaluate((index) => {
    beginRun(0, null, { hp: 1, dmg: 1 }, { intro: false });
    window.__BF.reloadStage(index);
    const state = window.__BF.charterState();
    const manifest = JSON.parse(window.__BF.exportLevel());
    return {
      name: state.charter.name,
      id: state.charter.id,
      levelLength: window.__BF.G.levelLength,
      charter: state.charter,
      validation: state.validation,
      geometry: state.geometry,
      evidence: state.evidence,
      analysis: window.__BF.analyzeLevel().summary,
      manifest,
    };
  }, stageIndex);
  // LittleJS defers its animation loop until the canvas receives a user gesture.
  // Activate it before camera placement so screenshots never race an idle renderer.
  await page.click('canvas', { delay: 20 });
  await page.waitForFunction(() => window.__BF.G.time > 0, { timeout: 5000 });
  const folder = resolve(ROOT, 'docs/charters', `${String(stageIndex + 1).padStart(2, '0')}-${setup.id}`, 'evidence');
  await mkdir(folder, { recursive: true });
  const positions = [
    { id: 'entrance', label: 'Entrance', x: 100 },
    ...setup.charter.rooms.map((room, index) => ({
      id: room.id, label: room.name,
      x: Math.max(100, Math.min(setup.levelLength - 100,
        room.focalX == null ? setup.levelLength * ((index + .5) / setup.charter.rooms.length) : room.focalX)),
    })),
    { id: 'exit', label: 'Exit', x: setup.levelLength - 500 },
  ];
  const stills = [];
  for (const position of positions) {
    for (const view of ['route', 'upper']) {
      const location = await place(page, position.x, view);
      await new Promise((done) => setTimeout(done, 180));
      const filename = `${position.id}-${slug(position.label)}-${view}.png`;
      await page.screenshot({ path: resolve(folder, filename), type: 'png' });
      stills.push({ ...position, view, location, file: filename });
    }
  }
  const receipt = {
    schema: 'bladefall.charter-evidence-receipt', version: 1,
    gameVersion: expectedVersion, stageIndex, stageId: setup.id, stageName: setup.name,
    url, viewport: { width: 1440, height: 900 }, pageErrors,
    charterValidation: setup.validation,
    geometryAudit: setup.geometry,
    analysis: setup.analysis,
    stills,
    limitations: [
      'Camera-positioned stills support spatial planning; they do not prove route completion or human readability.',
      'Enemy motion is frozen after assembly for deterministic composition; actors remain visible, but stills do not prove live AI behavior.',
    ],
  };
  await writeFile(resolve(folder, 'runtime-manifest.json'), `${JSON.stringify(setup.manifest, null, 2)}\n`);
  await writeFile(resolve(folder, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify({ ok: !pageErrors.length && setup.validation.ok && setup.geometry.ok, folder, receipt }, null, 2));
} finally {
  await browser.close();
}
