import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const BASELINE_PATH = resolve(ROOT, 'docs/baseline/a1-structural-baseline.json');
const DEFAULT_OUTPUT = resolve(ROOT, 'docs/baseline/interactive');
const DEFAULT_URL = 'http://127.0.0.1:8372/';
const VIEWPORT = { width: 960, height: 600, deviceScaleFactor: 1 };
const DEFAULT_DURATION_MS = 6000;
const DEFAULT_FPS = 6;

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function slug(value) {
  return String(value || 'stage')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function readExpectedVersion() {
  const index = await readFile(resolve(ROOT, 'public/index.html'), 'utf8');
  return index.match(/const VERSION='([^']+)'/)?.[1] || null;
}

function runCommand(command, args) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', rejectCommand);
    child.once('close', (code) => {
      if (code === 0) {
        resolveCommand({ stdout, stderr });
        return;
      }
      rejectCommand(new Error(`${command} exited ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

async function encodeFrames(frameFolder, output, fps) {
  await runCommand('ffmpeg', [
    '-y',
    '-loglevel', 'error',
    '-framerate', String(fps),
    '-i', resolve(frameFolder, 'frame-%04d.png'),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    output,
  ]);
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

async function loadProbeStage(page, stageIndex) {
  return page.evaluate((index) => {
    window.__BF.reloadStage(index);
    const game = window.__BF.G;
    const player = game.p;
    player.hp = player.maxHp;
    player.dead = false;
    player.invuln = 0;
    game.stageBanner = 0;
    game.shake = 0;
    return {
      stageIndex: game.stageIndex,
      x: player.x,
      y: player.y,
      hp: player.hp,
      maxHp: player.maxHp,
      levelLength: game.levelLength,
    };
  }, stageIndex);
}

async function sampleRuntime(page, startedAt) {
  return page.evaluate((time) => {
    const api = window.__BF;
    const game = api.G;
    const player = game.p;
    return {
      tMs: time,
      stageIndex: game.stageIndex,
      mode: api.mode,
      x: Math.round(player.x * 10) / 10,
      y: Math.round(player.y * 10) / 10,
      vx: Math.round(player.vx * 10) / 10,
      vy: Math.round(player.vy * 10) / 10,
      hp: Math.round(player.hp * 10) / 10,
      maxHp: player.maxHp,
      dead: Boolean(player.dead),
      checkpoint: {
        set: Boolean(player.ckSet),
        x: Number.isFinite(player.ckX) ? Math.round(player.ckX) : null,
        y: Number.isFinite(player.ckY) ? Math.round(player.ckY) : null,
      },
      gravityFlipped: Boolean(game.gravityFlipped),
      enemyCount: game.enemies.filter((enemy) => enemy && !enemy.dead).length,
    };
  }, startedAt);
}

export function summarizeRoute(samples, setup, stageIndex) {
  const stageSamples = samples.filter((sample) => sample.stageIndex === stageIndex);
  const xs = stageSamples.map((sample) => sample.x);
  const startX = setup.x;
  const maxX = xs.length ? Math.max(startX, ...xs) : startX;
  const progressPx = Math.max(0, maxX - startX);
  const progressFraction = Math.min(1, progressPx / Math.max(1, setup.levelLength - startX));
  let resetCount = 0;
  for (let index = 1; index < stageSamples.length; index += 1) {
    if (stageSamples[index - 1].x - stageSamples[index].x > 250) resetCount += 1;
  }
  const checkpointXs = [...new Set(stageSamples
    .filter((sample) => sample.checkpoint?.set && Number.isFinite(sample.checkpoint.x))
    .map((sample) => sample.checkpoint.x))];
  const transitionedTo = samples.find((sample) => sample.stageIndex !== stageIndex)?.stageIndex ?? null;
  const deadFrames = samples.filter((sample) => sample.dead || sample.hp <= 0).length;
  const status = transitionedTo !== null
    ? 'stage-transition-observed'
    : progressFraction >= 0.05
      ? 'entrance-progress-observed'
      : 'blocked-or-insufficient-progress';
  return {
    status,
    startX,
    maxX,
    progressPx: Math.round(progressPx),
    progressFraction: Math.round(progressFraction * 10000) / 10000,
    resetCount,
    deadFrames,
    checkpointXs,
    transitionedTo,
  };
}

async function recordInputProbe(page, {
  frameFolder,
  durationMs,
  fps,
  stageIndex,
}) {
  const samples = [];
  const inputEvents = [];
  const start = Date.now();
  let frame = 0;
  let nextJump = 450;
  let nextDash = 900;
  let nextAttack = 250;
  let nextFrameAt = 0;

  await page.keyboard.down('ArrowRight');
  inputEvents.push({ tMs: 0, input: 'ArrowRight', action: 'down' });
  try {
    while (Date.now() - start < durationMs) {
      const elapsed = Date.now() - start;
      if (elapsed >= nextAttack) {
        await page.keyboard.press('w', { delay: 30 });
        inputEvents.push({ tMs: elapsed, input: 'KeyW', action: 'press' });
        nextAttack += 720;
      }
      if (elapsed >= nextJump) {
        await page.keyboard.press('Space', { delay: 38 });
        inputEvents.push({ tMs: elapsed, input: 'Space', action: 'press' });
        nextJump += 880;
      }
      if (elapsed >= nextDash) {
        await page.keyboard.press('d', { delay: 35 });
        inputEvents.push({ tMs: elapsed, input: 'KeyD', action: 'press' });
        nextDash += 1350;
      }
      samples.push(await sampleRuntime(page, elapsed));
      await page.screenshot({
        path: resolve(frameFolder, `frame-${String(frame).padStart(4, '0')}.png`),
        type: 'png',
        fullPage: false,
      });
      frame += 1;
      nextFrameAt += 1000 / fps;
      const wait = nextFrameAt - (Date.now() - start);
      if (wait > 0) await delay(wait);
    }
  } finally {
    await page.keyboard.up('ArrowRight');
    inputEvents.push({ tMs: Date.now() - start, input: 'ArrowRight', action: 'up' });
  }
  samples.push(await sampleRuntime(page, Date.now() - start));
  return { samples, inputEvents, frames: frame, wallDurationMs: Date.now() - start };
}

function receiptLimitations() {
  return [
    'This is an entrance locomotion probe, not an intended-route completion or level signoff.',
    'The stage was selected with the development reload API; all movement after load was ordinary keyboard input.',
    'Full health was restored once at probe setup. Invulnerability, teleporting, jetpack grants, and live position edits were not used.',
    'Frame-sequence video is visual evidence only; the JSON samples are the authoritative movement and reset receipt.',
    'Optional, revisit, speedrun, and co-op route reviews remain separate A1 requirements.',
  ];
}

async function runInteractiveBaseline() {
  const url = argument('--url', process.env.BLADEFALL_BASELINE_URL || DEFAULT_URL);
  const output = resolve(argument('--output', DEFAULT_OUTPUT));
  const durationMs = Number(argument('--duration-ms', DEFAULT_DURATION_MS));
  const fps = Number(argument('--fps', DEFAULT_FPS));
  const sourceReport = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
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
    await page.setViewport(VIEWPORT);
    await page.setBypassServiceWorker(true);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForFunction(() => window.__BF && window.__BF.VERSION, {
      timeout: 20000,
    });
    const servedVersion = await page.evaluate(() => window.__BF.VERSION);
    if (servedVersion !== expectedVersion) {
      throw new Error(`Refusing interactive capture: expected ${expectedVersion}, received ${servedVersion} from ${url}`);
    }
    await startFreshRun(page);
    await mkdir(output, { recursive: true });

    const stages = [];
    for (const stage of sourceReport.stages) {
      const stageFolder = resolve(output, `${String(stage.index + 1).padStart(2, '0')}-${slug(stage.id)}`);
      const frameFolder = await mkdtemp(resolve(tmpdir(), `bladefall-a1-${String(stage.index + 1).padStart(2, '0')}-`));
      await mkdir(stageFolder, { recursive: true });
      try {
        const setup = await loadProbeStage(page, stage.index);
        await delay(350);
        const recording = await recordInputProbe(page, {
          frameFolder,
          durationMs,
          fps,
          stageIndex: stage.index,
        });
        const videoPath = resolve(stageFolder, 'entrance-input-probe.mp4');
        await encodeFrames(frameFolder, videoPath, fps);
        const summary = summarizeRoute(recording.samples, setup, stage.index);
        const receipt = {
          schema: 'bladefall.a1-interactive-probe',
          version: 1,
          gameVersion: expectedVersion,
          url,
          stage: {
            index: stage.index,
            id: stage.id,
            name: stage.name,
            levelLength: setup.levelLength,
          },
          evidenceClass: {
            stageLoad: 'development-stage-selection',
            movement: 'input-only-after-load',
            positionInjectionAfterLoad: false,
            invulnerability: false,
            probeScope: 'entrance-locomotion',
          },
          capture: {
            viewport: VIEWPORT,
            requestedDurationMs: durationMs,
            wallDurationMs: recording.wallDurationMs,
            fps,
            frames: recording.frames,
            video: relative(stageFolder, videoPath),
          },
          setup,
          inputs: recording.inputEvents,
          samples: recording.samples,
          result: summary,
          limitations: receiptLimitations(),
        };
        await writeFile(resolve(stageFolder, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
        stages.push({
          index: stage.index,
          id: stage.id,
          name: stage.name,
          video: relative(output, videoPath),
          receipt: relative(output, resolve(stageFolder, 'receipt.json')),
          result: summary,
          frames: recording.frames,
        });
        console.log(`${String(stage.index + 1).padStart(2, '0')}/16 ${stage.name}: `
          + `${summary.status}, ${summary.progressPx}px, ${summary.resetCount} reset(s)`);
      } finally {
        await rm(frameFolder, { recursive: true, force: true });
      }
    }

    const report = {
      schema: 'bladefall.a1-interactive-baseline',
      version: 1,
      gameVersion: expectedVersion,
      url,
      viewport: VIEWPORT,
      captureMethod: 'Puppeteer keyboard input plus PNG frame sequence encoded locally with ffmpeg',
      browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
      pageErrors,
      capturedStages: stages.length,
      routeClass: 'input-only entrance locomotion probes',
      stages,
      coverage: {
        entranceLocomotion: stages.length === sourceReport.stages.length ? 'complete' : 'partial',
        intendedRoute: 'pending',
        revisitRoute: 'pending',
        optionalRoute: 'pending',
        credibleSpeedrunRoute: 'pending',
        twoPlayerRouteAndTransition: 'pending',
      },
      limitations: receiptLimitations(),
    };
    await writeFile(resolve(output, 'a1-interactive-baseline.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: pageErrors.length === 0,
      output,
      stages: stages.length,
      pageErrors,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  await runInteractiveBaseline();
}
