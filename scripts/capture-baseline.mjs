import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const REPORT_PATH = resolve(ROOT, 'docs/baseline/a1-structural-baseline.json');
const DEFAULT_OUTPUT = resolve(ROOT, 'docs/baseline/evidence');
const DEFAULT_URL = 'http://127.0.0.1:8372/';

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function slug(value) {
  return String(value || 'stage')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function readExpectedVersion() {
  const index = await readFile(resolve(ROOT, 'public/index.html'), 'utf8');
  return index.match(/const VERSION='([^']+)'/)?.[1] || null;
}

async function placeCamera(page, normalizedX, view) {
  return page.evaluate(({ normalizedX: progress, view: requestedView }) => {
    const api = window.__BF;
    const game = api.G;
    const player = game.p;
    const length = Math.max(1, game.levelLength || api.STAGES[game.stageIndex].len);
    const x = Math.max(80, Math.min(length - 80, 80 + progress * (length - 160)));
    const supports = game.obstacles
      .filter((object) =>
        object && (object.type === 'plat' || object.type === 'wall')
        && !object.gone && !object.fake && !object.ceiling
        && Number.isFinite(object.x) && Number.isFinite(object.y))
      .map((object) => ({
        object,
        distance: Math.max(0, Math.abs(object.x - x) - (object.w || 0) / 2),
      }))
      .filter((candidate) => candidate.distance <= 720)
      .sort((left, right) => left.distance - right.distance || left.object.y - right.object.y);
    const nearby = supports.filter((candidate) => candidate.distance <= 120);
    const pool = nearby.length ? nearby : supports.slice(0, 10);
    let support = null;
    if (pool.length) {
      support = requestedView === 'upper-layer'
        ? pool.reduce((highest, candidate) =>
          !highest || candidate.object.y > highest.object.y ? candidate : highest, null)
        : pool.reduce((lowest, candidate) =>
          !lowest || candidate.object.y < lowest.object.y ? candidate : lowest, null);
    }
    const y = support ? Math.max(0, support.object.y) : 0;
    const viewportWidth = window.innerWidth || 1280;
    const cameraX = Math.max(0, Math.min(length - viewportWidth, x - viewportWidth * 0.38));
    const cameraY = Math.max(0, y - 420);

    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
    player.hp = player.maxHp;
    player.invuln = 9999;
    player.dead = false;
    player.onGround = true;
    player.hasJetpack = true;
    player.fuel = 100;
    player.floorPlat = support ? support.object : null;
    game.stageBanner = 0;
    game.shake = 0;
    game.cam = cameraX;
    game.camY = cameraY;
    api.camera.reset(cameraX, cameraY);
    api.camera.sync(cameraX, cameraY);
    return {
      x: Math.round(x),
      y: Math.round(y),
      cameraX: Math.round(cameraX),
      cameraY: Math.round(cameraY),
      levelLength: Math.round(length),
      supportType: support ? support.object.type : null,
    };
  }, { normalizedX, view });
}

async function startFreshRun(page) {
  await page.evaluate(async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#newBtn'), {
    timeout: 20000,
  });
  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)', { timeout: 10000 });
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF && window.__BF.mode === 'play', {
    timeout: 10000,
  });
}

function contactSheet(report, records) {
  const byStage = new Map();
  for (const record of records) {
    if (!byStage.has(record.stageId)) byStage.set(record.stageId, []);
    byStage.get(record.stageId).push(record);
  }
  const sections = report.stages.map((stage) => {
    const shots = (byStage.get(stage.id) || []).map((record) => `
      <figure>
        <img src="${escapeHtml(record.relativePath)}" alt="${escapeHtml(record.label)}">
        <figcaption>${escapeHtml(record.label)} · ${escapeHtml(record.view)}
          · x ${record.location.x} / ${record.location.levelLength}</figcaption>
      </figure>`).join('');
    return `<section><h2>${String(stage.index + 1).padStart(2, '0')} · ${escapeHtml(stage.name)}</h2>
      <p>${escapeHtml(stage.signature)}</p><div class="grid">${shots}</div></section>`;
  }).join('');
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Bladefall A1 visual atlas</title>
<style>
body{margin:0;padding:28px;background:#11141b;color:#edf0f4;font:15px system-ui,sans-serif}
h1{margin:0 0 6px}h2{margin:32px 0 4px;color:#ffd27a}p{color:#adb5c2}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
figure{margin:0;padding:8px;background:#1b202b;border:1px solid #333c4c;border-radius:8px}
img{display:block;width:100%;height:auto;background:#050608}
figcaption{padding:7px 2px 1px;color:#c8ced8;font-size:12px}
</style>
<h1>Bladefall A1 visual atlas</h1>
<p>Game ${escapeHtml(report.game.version)} · canonical localhost ${escapeHtml(report.capture.url)}
· ${records.length} stills. These images are baseline evidence, not level signoff.</p>
${sections}</html>`;
}

async function capture() {
  const url = argument('--url', process.env.BLADEFALL_BASELINE_URL || DEFAULT_URL);
  const output = resolve(argument('--output', DEFAULT_OUTPUT));
  const sourceReport = JSON.parse(await readFile(REPORT_PATH, 'utf8'));
  const expectedVersion = await readExpectedVersion();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
  });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`);
  });

  try {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setBypassServiceWorker(true);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForFunction(() => window.__BF && window.__BF.VERSION, {
      timeout: 20000,
    });
    const servedVersion = await page.evaluate(() => window.__BF.VERSION);
    if (servedVersion !== expectedVersion) {
      throw new Error(`Refusing baseline capture: expected ${expectedVersion}, received ${servedVersion} from ${url}`);
    }
    await startFreshRun(page);
    await mkdir(output, { recursive: true });

    const stageRecords = [];
    const screenshots = [];
    for (const stage of sourceReport.stages) {
      await page.evaluate((stageIndex) => window.__BF.reloadStage(stageIndex), stage.index);
      await delay(450);
      const runtime = await page.evaluate(() => {
        const exported = window.__BF.exportLevel();
        const manifest = typeof exported === 'string' ? JSON.parse(exported) : exported;
        const analysis = window.__BF.analyzeLevel();
        const game = window.__BF.G;
        game.stageBanner = 0;
        game.p.invuln = 9999;
        return {
          manifest,
          analysis: {
            summary: analysis.summary,
            validation: {
              errors: analysis.validation.errors,
              warnings: analysis.validation.warnings,
            },
            softlocks: analysis.softlocks,
            encounterWarnings: analysis.encounterWarnings,
          },
          runtime: {
            levelLength: game.levelLength,
            objects: game.obstacles.length,
            enemies: game.enemies.length,
            pickups: game.pickups.length,
            travelers: game.npcs.length,
            fluids: game.obstacles.filter((object) => object.type === 'fluid').map((fluid) => ({
              id: fluid.id || null,
              kind: fluid.kind || 'water',
              x: fluid.x,
              y: fluid.y,
              w: fluid.w,
              h: fluid.h,
            })),
          },
        };
      });
      const stageFolder = resolve(output, `${String(stage.index + 1).padStart(2, '0')}-${stage.id}`);
      await mkdir(stageFolder, { recursive: true });
      await writeFile(resolve(stageFolder, 'runtime-manifest.json'),
        `${JSON.stringify(runtime.manifest, null, 2)}\n`);
      await writeFile(resolve(stageFolder, 'analysis.json'),
        `${JSON.stringify(runtime.analysis, null, 2)}\n`);

      for (const still of stage.evidence.stills) {
        for (const view of still.views) {
          const location = await placeCamera(page, still.normalizedX, view);
          await delay(180);
          const filename = `${still.id}-${slug(still.label || still.id)}-${view}.png`;
          const path = resolve(stageFolder, filename);
          await page.screenshot({ path, type: 'png', fullPage: false });
          screenshots.push({
            stageIndex: stage.index,
            stageId: stage.id,
            stageName: stage.name,
            stillId: still.id,
            label: still.label || still.id,
            view,
            normalizedX: still.normalizedX,
            location,
            relativePath: relative(output, path),
          });
        }
      }
      stageRecords.push({
        index: stage.index,
        id: stage.id,
        name: stage.name,
        runtime: runtime.runtime,
        analysis: runtime.analysis.summary,
        screenshots: screenshots.filter((record) => record.stageId === stage.id).length,
      });
      console.log(`${String(stage.index + 1).padStart(2, '0')}/16 ${stage.name}: `
        + `${stageRecords.at(-1).screenshots} stills, ${runtime.runtime.objects} objects, `
        + `${runtime.analysis.summary.warnings} analyzer warnings`);
    }

    const report = {
      schema: 'bladefall.a1-visual-atlas',
      version: 1,
      gameVersion: expectedVersion,
      url,
      viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
      capturedStages: stageRecords.length,
      capturedStills: screenshots.length,
      pageErrors,
      stages: stageRecords,
      screenshots,
      limitations: [
        'Camera-positioned stills are visual inventory, not proof that a route is playable.',
        'Dynamic-room recordings and complete human playthroughs remain required.',
        'Upper-layer stills use nearby assembled support geometry and require human review.',
      ],
    };
    await writeFile(resolve(output, 'a1-visual-atlas.json'), `${JSON.stringify(report, null, 2)}\n`);
    sourceReport.capture = {
      url,
      gameVersion: expectedVersion,
      viewport: report.viewport,
      stills: screenshots.length,
    };
    await writeFile(resolve(output, 'index.html'), contactSheet(sourceReport, screenshots));
    console.log(JSON.stringify({
      ok: pageErrors.length === 0,
      output,
      stages: stageRecords.length,
      stills: screenshots.length,
      pageErrors,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  await capture();
}
