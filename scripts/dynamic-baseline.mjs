import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'docs/baseline/dynamics');
const DEFAULT_URL = 'http://127.0.0.1:8372/';
const VIEWPORT = { width: 960, height: 600, deviceScaleFactor: 1 };
const FPS = 6;

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function runCommand(command, args) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', rejectCommand);
    child.once('close', (code) => {
      if (code === 0) resolveCommand();
      else rejectCommand(new Error(`${command} exited ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

async function encodeFrames(frameFolder, output) {
  await runCommand('ffmpeg', [
    '-y',
    '-loglevel', 'error',
    '-framerate', String(FPS),
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

async function readExpectedVersion() {
  const index = await readFile(resolve(ROOT, 'public/index.html'), 'utf8');
  return index.match(/const VERSION='([^']+)'/)?.[1] || null;
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

async function loadStage(page, stageIndex) {
  await page.evaluate((index) => {
    window.__BF.reloadStage(index);
    const game = window.__BF.G;
    game.stageBanner = 0;
    game.shake = 0;
    game.p.hp = game.p.maxHp;
    game.p.dead = false;
    game.p.invuln = 0;
  }, stageIndex);
  await delay(350);
}

async function positionPlayer(page, setup) {
  return page.evaluate((request) => {
    const api = window.__BF;
    const game = api.G;
    const player = game.p;
    let target = null;
    if (request.target === 'slate-floor') {
      target = game.obstacles
        .filter((object) => object.type === 'plat' && object.slate)
        .sort((left, right) => Math.abs(left.x - request.x) - Math.abs(right.x - request.x))[0] || null;
    } else if (request.target === 'traveler') {
      target = game.npcs
        .slice()
        .sort((left, right) => Math.abs(left.x - request.x) - Math.abs(right.x - request.x))[0] || null;
    } else if (request.target === 'checkpoint') {
      target = game.obstacles
        .filter((object) => object.type === 'check')
        .sort((left, right) => Math.abs(left.x - request.x) - Math.abs(right.x - request.x))[0] || null;
    } else if (request.target === 'rail-switch') {
      target = game.obstacles
        .filter((object) => object.type === 'railSwitch')
        .sort((left, right) => Math.abs(left.x - request.x) - Math.abs(right.x - request.x))[0] || null;
    }
    const x = request.playerX ?? (target?.x ?? request.x);
    const y = request.playerY ?? (target?.y ?? request.y ?? 0);
    const support = game.obstacles
      .filter((object) => object.type === 'plat' && !object.gone
        && x >= object.x - (object.w || 0) / 2
        && x <= object.x + (object.w || 0) / 2
        && Math.abs((object.y || 0) - y) < 25)
      .sort((left, right) => Math.abs((left.y || 0) - y) - Math.abs((right.y || 0) - y))[0] || null;
    player.x = x;
    player.y = y;
    player.vx = request.vx || 0;
    player.vy = request.vy || 0;
    player.hp = player.maxHp;
    player.dead = false;
    player.invuln = 0;
    player.onGround = request.onGround ?? Boolean(support);
    player.floorPlat = player.onGround ? (target?.type === 'plat' ? target : support) : null;
    player._tpCd = 0;
    const cameraX = Math.max(0, Math.min(game.levelLength - window.innerWidth, x - window.innerWidth * 0.38));
    const cameraY = Math.max(0, y - 360);
    game.cam = cameraX;
    game.camY = cameraY;
    api.camera.reset(cameraX, cameraY);
    api.camera.sync(cameraX, cameraY);
    return {
      requested: request,
      resolvedTarget: target ? {
        type: target.type || target.kind || null,
        x: target.x,
        y: target.y,
        slate: Boolean(target.slate),
        id: target.id || null,
      } : null,
      player: { x: player.x, y: player.y, onGround: player.onGround },
      support: support ? { type: support.type, x: support.x, y: support.y, id: support.id || null } : null,
    };
  }, setup);
}

async function runtimeSample(page, tMs) {
  return page.evaluate((time) => {
    const api = window.__BF;
    const game = api.G;
    const player = game.p;
    return {
      tMs: time,
      mode: api.mode,
      stageIndex: game.stageIndex,
      player: {
        x: Math.round(player.x * 10) / 10,
        y: Math.round(player.y * 10) / 10,
        vx: Math.round(player.vx * 10) / 10,
        vy: Math.round(player.vy * 10) / 10,
        hp: Math.round(player.hp * 10) / 10,
        maxHp: player.maxHp,
        onGround: Boolean(player.onGround),
        dead: Boolean(player.dead),
        fluidSubmersion: Math.round((player._fluidSub || 0) * 1000) / 1000,
        fluidKind: player._fluidKind || null,
      },
      checkpoint: {
        set: Boolean(player.ckSet),
        x: Number.isFinite(player.ckX) ? Math.round(player.ckX) : null,
        y: Number.isFinite(player.ckY) ? Math.round(player.ckY) : null,
      },
      gravity: {
        flipped: Boolean(game.gravityFlipped),
        unlocked: Boolean(game.flipUnlocked),
      },
      portals: (game.cratePortals || []).map((mouth) => ({
        x: Math.round(mouth.x),
        y: Math.round(mouth.y),
        nx: mouth.nx,
        ny: mouth.ny,
        surf: mouth.surf,
      })),
      followers: (game.npcs || []).map((traveler) => ({
        name: traveler.name || null,
        kind: traveler.kind,
        state: traveler.state,
        x: Math.round(traveler.x),
        y: Math.round(traveler.y || 0),
      })),
      deepLine: {
        cartMode: Boolean(game.cartMode),
        lean: Math.round((game.cartLean || 0) * 1000) / 1000,
        boost: Math.round((game.cartBoost || 0) * 1000) / 1000,
        signals: game.deepLineSignals || 0,
        switches: game.obstacles
          .filter((object) => object.type === 'railSwitch')
          .map((object) => ({
            x: object.x,
            choice: object.choice || null,
            choiceT: Math.round((object.choiceT || 0) * 1000) / 1000,
            signalLit: Boolean(object.signalLit),
          })),
        collapsing: game.obstacles
          .filter((object) => object.railCollapse)
          .map((object) => ({
            x: object.x,
            activeTimer: Math.round((object.crT || 0) * 1000) / 1000,
            gone: Boolean(object.gone),
          })),
      },
    };
  }, tMs);
}

function unique(values) {
  return [...new Set(values)];
}

export function summarizeDynamicProbe(id, samples, setup) {
  const players = samples.map((sample) => sample.player);
  const rewindObserved = players.some((player, index) =>
    index > 0 && players[index - 1].x - player.x > 500);
  if (id === 'portal-anchor-transit') {
    const maxMouths = Math.max(0, ...samples.map((sample) => sample.portals.length));
    const maxX = Math.max(setup.player.x, ...players.map((player) => player.x));
    return {
      maxPlacedMouths: maxMouths,
      maxPlayerX: Math.round(maxX),
      anchorExitReached: maxX > 5900,
      status: maxMouths > 0 && maxX > 5900 ? 'activation-and-transit-observed'
        : maxMouths > 0 ? 'activation-observed-transit-unproven' : 'activation-not-observed',
    };
  }
  if (id === 'portal-anchor-speed-gate') {
    const maxMouths = Math.max(0, ...samples.map((sample) => sample.portals.length));
    const maxX = Math.max(setup.player.x, ...players.map((player) => player.x));
    return {
      maxPlacedMouths: maxMouths,
      maxPlayerX: Math.round(maxX),
      forcedEntrySpeed: 950,
      anchorExitReached: maxX > 5900,
      status: maxMouths > 0 && maxX > 5900
        ? 'state-positioned-high-speed-transit-observed'
        : maxMouths > 0 ? 'speed-gate-transit-unproven' : 'activation-not-observed',
    };
  }
  if (id === 'water-current-response') {
    const maxSubmersion = Math.max(0, ...players.map((player) => player.fluidSubmersion));
    const kinds = unique(players.map((player) => player.fluidKind).filter(Boolean));
    return {
      maxSubmersion,
      fluidKinds: kinds,
      displacementX: Math.round(players.at(-1).x - setup.player.x),
      checkpointRewindObserved: rewindObserved,
      status: maxSubmersion > 0.08
        ? rewindObserved ? 'fluid-contact-and-rewind-observed' : 'fluid-contact-observed'
        : 'fluid-contact-not-observed',
    };
  }
  if (id === 'updraft-response') {
    const maxY = Math.max(setup.player.y, ...players.map((player) => player.y));
    return {
      verticalGain: Math.round(maxY - setup.player.y),
      maxY: Math.round(maxY),
      checkpointRewindObserved: rewindObserved,
      status: maxY - setup.player.y > 80
        ? rewindObserved ? 'lift-and-rewind-observed' : 'lift-observed'
        : 'lift-not-observed',
    };
  }
  if (id === 'follower-command-cycle') {
    const states = unique(samples.flatMap((sample) => sample.followers.map((follower) => follower.state)));
    return {
      observedStates: states,
      status: states.includes('wait') && states.includes('follow')
        ? 'hold-and-follow-observed' : 'command-cycle-incomplete',
    };
  }
  if (id === 'gravity-flip-cycle') {
    const states = unique(samples.map((sample) => sample.gravity.flipped));
    return {
      observedGravityStates: states,
      status: states.includes(true) && states.includes(false)
        ? 'flip-and-righting-observed' : 'gravity-cycle-incomplete',
    };
  }
  if (id === 'deep-line-signal-collapse') {
    const signals = Math.max(0, ...samples.map((sample) => sample.deepLine.signals));
    const choices = unique(samples.flatMap((sample) =>
      sample.deepLine.switches.map((railSwitch) => railSwitch.choice).filter(Boolean)));
    const collapseTriggered = samples.some((sample) =>
      sample.deepLine.collapsing.some((platform) => platform.activeTimer > 0 || platform.gone));
    return {
      maxSignals: signals,
      switchChoices: choices,
      collapseTriggered,
      status: signals > 0 && collapseTriggered
        ? 'signal-and-collapse-observed'
        : signals > 0 ? 'signal-observed-collapse-unproven' : 'signal-not-observed',
    };
  }
  if (id === 'checkpoint-forced-rewind') {
    const activated = samples.some((sample) => sample.checkpoint.set);
    const checkpointX = samples.find((sample) => sample.checkpoint.set)?.checkpoint.x ?? null;
    const rewindObserved = checkpointX !== null && samples.some((sample) =>
      sample.tMs > 1800 && Math.abs(sample.player.x - checkpointX) < 70 && sample.player.y > 20);
    return {
      checkpointActivated: activated,
      checkpointX,
      forcedFailureSetup: true,
      rewindObserved,
      status: activated && rewindObserved ? 'checkpoint-and-rewind-observed'
        : activated ? 'checkpoint-observed-rewind-unproven' : 'checkpoint-not-observed',
    };
  }
  return { status: 'unknown-probe' };
}

const PROBES = [
  {
    id: 'portal-anchor-transit',
    stageIndex: 0,
    stageName: 'The Outskirts',
    durationMs: 4600,
    mechanic: 'player mouth plus fixed anchor',
    setup: { target: 'slate-floor', x: 5440, onGround: true },
    evidenceClass: 'state-positioned setup; keyboard activation and traversal attempt',
    async act({ page, once, elapsed, events }) {
      await once('place-mouth', 450, async () => {
        await page.keyboard.press('f', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyF', purpose: 'place portal mouth' });
      });
      await once('walk-off', 1050, async () => {
        await page.keyboard.down('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'down' });
      });
      await once('return', 1750, async () => {
        await page.keyboard.up('ArrowRight');
        await page.keyboard.down('ArrowLeft');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'up' });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowLeft', action: 'down' });
      });
      await once('stop', 2700, async () => {
        await page.keyboard.up('ArrowLeft');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowLeft', action: 'up' });
      });
    },
  },
  {
    id: 'water-current-response',
    stageIndex: 3,
    stageName: 'The Updrafts',
    durationMs: 4000,
    mechanic: 'bounded water and horizontal current',
    setup: { x: 1300, playerX: 1300, playerY: 8, onGround: false },
    evidenceClass: 'state-positioned mechanic contact; keyboard movement',
    async act({ page, once, elapsed, events }) {
      await once('move', 500, async () => {
        await page.keyboard.down('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'down' });
      });
      await once('stop', 2600, async () => {
        await page.keyboard.up('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'up' });
      });
    },
  },
  {
    id: 'portal-anchor-speed-gate',
    stageIndex: 0,
    stageName: 'The Outskirts',
    durationMs: 4000,
    mechanic: 'anchored portal minimum-speed gate and high-speed transit',
    setup: { target: 'slate-floor', x: 5440, onGround: true },
    evidenceClass: 'state-positioned setup; keyboard activation; explicitly injected high-speed drop',
    async act({ page, once, elapsed, events }) {
      await once('place-mouth', 450, async () => {
        await page.keyboard.press('f', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyF', purpose: 'place portal mouth' });
      });
      await once('force-speed-entry', 1250, async () => {
        await page.evaluate(() => {
          const player = window.__BF.G.p;
          player.x = 5440;
          player.y = 130;
          player.vx = 0;
          player.vy = 950;
          player.onGround = false;
          player.floorPlat = null;
          player._restMouth = null;
          player._tpCd = 0;
        });
        events.push({
          tMs: elapsed,
          kind: 'state-injection',
          mutation: 'player positioned 130px over entry with vy=950; rest guard and transit cooldown cleared',
          purpose: 'exercise the authored minSpeed=800 anchor gate',
        });
      });
    },
  },
  {
    id: 'updraft-response',
    stageIndex: 3,
    stageName: 'The Updrafts',
    durationMs: 4000,
    mechanic: 'authored updraft lift',
    setup: { x: 4400, playerX: 4400, playerY: 8, onGround: false },
    evidenceClass: 'state-positioned mechanic contact; passive physics response',
    async act() {},
  },
  {
    id: 'follower-command-cycle',
    stageIndex: 5,
    stageName: 'Ruined Keep',
    durationMs: 4600,
    mechanic: 'traveler follow, hold, and resume',
    setup: { target: 'traveler', x: 1593, playerX: 1560, playerY: 0, onGround: true },
    evidenceClass: 'state-positioned greeting range; keyboard commands',
    async act({ page, once, elapsed, events }) {
      await once('hold', 1450, async () => {
        await page.keyboard.press('e', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyE', purpose: 'command hold' });
      });
      await once('follow', 3100, async () => {
        await page.keyboard.press('e', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyE', purpose: 'command follow' });
      });
    },
  },
  {
    id: 'gravity-flip-cycle',
    stageIndex: 11,
    stageName: 'The Inversion',
    durationMs: 4600,
    mechanic: 'gravity flip and righting',
    setup: null,
    evidenceClass: 'ordinary stage start; keyboard activation',
    async act({ page, once, elapsed, events }) {
      await once('flip', 700, async () => {
        await page.keyboard.press('g', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyG', purpose: 'flip gravity' });
      });
      await once('right', 2850, async () => {
        await page.keyboard.press('g', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyG', purpose: 'right gravity' });
      });
    },
  },
  {
    id: 'deep-line-signal-collapse',
    stageIndex: 15,
    stageName: 'The Deep Line',
    durationMs: 6500,
    mechanic: 'cart lean, first route signal, and collapsing rail',
    setup: { target: 'rail-switch', x: 2390, playerX: 2210, playerY: 0, onGround: true },
    evidenceClass: 'state-positioned approach; keyboard cart lean and jump',
    async act({ page, once, elapsed, events }) {
      await once('lean', 100, async () => {
        await page.keyboard.down('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'down' });
      });
      await once('jump', 1700, async () => {
        await page.keyboard.press('Space', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'Space', purpose: 'cart jump' });
      });
      await once('trick', 2050, async () => {
        await page.keyboard.press('Space', { delay: 45 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'Space', purpose: 'cart trick attempt' });
      });
      await once('stop', 6000, async () => {
        await page.keyboard.up('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'up' });
      });
    },
  },
  {
    id: 'checkpoint-forced-rewind',
    stageIndex: 14,
    stageName: 'The Gilded Vault',
    durationMs: 4400,
    mechanic: 'checkpoint activation and hazard-style rewind',
    setup: { target: 'checkpoint', x: 2180, playerX: 2140, playerY: 0, onGround: true },
    evidenceClass: 'state-positioned approach; keyboard activation; explicitly forced out-of-bounds failure',
    async act({ page, once, elapsed, events }) {
      await once('cross-checkpoint', 150, async () => {
        await page.keyboard.down('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'down' });
      });
      await once('stop', 850, async () => {
        await page.keyboard.up('ArrowRight');
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'ArrowRight', action: 'up' });
      });
      await once('force-failure', 1800, async () => {
        await page.evaluate(() => {
          const player = window.__BF.G.p;
          player.y = -90;
          player.vy = 0;
          player.onGround = false;
          player.floorPlat = null;
          player.invuln = 0;
        });
        events.push({
          tMs: elapsed,
          kind: 'state-injection',
          mutation: 'player.y=-90 and grounded state cleared',
          purpose: 'force out-of-bounds checkpoint rewind',
        });
      });
    },
  },
];

async function recordProbe(page, probe, frameFolder) {
  const fired = new Set();
  const events = [];
  const samples = [];
  const start = Date.now();
  let frame = 0;
  let nextFrameAt = 0;
  const once = async (id, threshold, action) => {
    if (fired.has(id) || Date.now() - start < threshold) return;
    fired.add(id);
    await action();
  };

  try {
    while (Date.now() - start < probe.durationMs) {
      const elapsed = Date.now() - start;
      await probe.act({ page, once, elapsed, events });
      samples.push(await runtimeSample(page, elapsed));
      await page.screenshot({
        path: resolve(frameFolder, `frame-${String(frame).padStart(4, '0')}.png`),
        type: 'png',
        fullPage: false,
      });
      frame += 1;
      nextFrameAt += 1000 / FPS;
      const wait = nextFrameAt - (Date.now() - start);
      if (wait > 0) await delay(wait);
    }
  } finally {
    for (const key of ['ArrowLeft', 'ArrowRight', 'Space', 'e', 'f', 'g']) {
      try { await page.keyboard.up(key); } catch {}
    }
  }
  samples.push(await runtimeSample(page, Date.now() - start));
  return { events, samples, frames: frame, wallDurationMs: Date.now() - start };
}

async function runDynamicBaseline() {
  const url = argument('--url', process.env.BLADEFALL_BASELINE_URL || DEFAULT_URL);
  const output = resolve(argument('--output', DEFAULT_OUTPUT));
  const expectedVersion = await readExpectedVersion();
  const requestedProbes = argument('--probes', '');
  const selectedProbes = requestedProbes
    ? PROBES.filter((probe) => requestedProbes.split(',').includes(probe.id))
    : PROBES;
  if (!selectedProbes.length) throw new Error(`No dynamic probes matched --probes ${requestedProbes}.`);
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
    await page.waitForFunction(() => window.__BF && window.__BF.VERSION, { timeout: 20000 });
    const servedVersion = await page.evaluate(() => window.__BF.VERSION);
    if (servedVersion !== expectedVersion) {
      throw new Error(`Refusing dynamic capture: expected ${expectedVersion}, received ${servedVersion} from ${url}`);
    }
    await startFreshRun(page);
    await mkdir(output, { recursive: true });

    const results = [];
    for (const probe of selectedProbes) {
      await loadStage(page, probe.stageIndex);
      const setup = probe.setup
        ? await positionPlayer(page, probe.setup)
        : await page.evaluate(() => ({
          requested: null,
          resolvedTarget: null,
          player: { x: window.__BF.G.p.x, y: window.__BF.G.p.y, onGround: window.__BF.G.p.onGround },
          support: null,
        }));
      await delay(250);
      const probeFolder = resolve(output, probe.id);
      const frameFolder = await mkdtemp(resolve(tmpdir(), `bladefall-a1-dynamic-${probe.id}-`));
      await mkdir(probeFolder, { recursive: true });
      try {
        const recording = await recordProbe(page, probe, frameFolder);
        const videoPath = resolve(probeFolder, 'probe.mp4');
        await encodeFrames(frameFolder, videoPath);
        const result = summarizeDynamicProbe(probe.id, recording.samples, setup);
        const receipt = {
          schema: 'bladefall.a1-dynamic-probe',
          version: 1,
          gameVersion: expectedVersion,
          url,
          id: probe.id,
          stage: { index: probe.stageIndex, name: probe.stageName },
          mechanic: probe.mechanic,
          evidenceClass: probe.evidenceClass,
          browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
          setup,
          events: recording.events,
          samples: recording.samples,
          capture: {
            viewport: VIEWPORT,
            fps: FPS,
            frames: recording.frames,
            wallDurationMs: recording.wallDurationMs,
            video: 'probe.mp4',
          },
          result,
          limitations: [
            'This is a targeted mechanic probe, not a complete level route or signoff.',
            'State-positioned setup is disclosed above and cannot prove natural route access.',
            'Only the listed events occurred during capture; forced failure is synthetic where explicitly identified.',
            'Co-op ownership, complete puzzle resolution, and boss phase coverage remain separate requirements.',
          ],
        };
        await writeFile(resolve(probeFolder, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
        results.push({
          id: probe.id,
          stageIndex: probe.stageIndex,
          stageName: probe.stageName,
          mechanic: probe.mechanic,
          evidenceClass: probe.evidenceClass,
          result,
          video: relative(output, videoPath),
          receipt: relative(output, resolve(probeFolder, 'receipt.json')),
        });
        console.log(`${probe.id}: ${result.status}`);
      } finally {
        await rm(frameFolder, { recursive: true, force: true });
      }
    }

    const report = {
      schema: 'bladefall.a1-dynamic-baseline',
      version: 1,
      gameVersion: expectedVersion,
      url,
      browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
      pageErrors,
      capturedProbes: results.length,
      probes: results,
      coverage: {
        portalAnchorLowSpeedAttempt: results.find((result) => result.id === 'portal-anchor-transit')?.result.status || 'missing',
        portalAnchorSpeedGate: results.find((result) => result.id === 'portal-anchor-speed-gate')?.result.status || 'missing',
        fluidCurrent: results.find((result) => result.id === 'water-current-response')?.result.status || 'missing',
        updraft: results.find((result) => result.id === 'updraft-response')?.result.status || 'missing',
        followerCommands: results.find((result) => result.id === 'follower-command-cycle')?.result.status || 'missing',
        gravityFlip: results.find((result) => result.id === 'gravity-flip-cycle')?.result.status || 'missing',
        deepLineSignalCollapse: results.find((result) => result.id === 'deep-line-signal-collapse')?.result.status || 'missing',
        checkpointRewind: results.find((result) => result.id === 'checkpoint-forced-rewind')?.result.status || 'missing',
      },
      remaining: [
        'Natural intended-route access and successful resolution for every dynamic room.',
        'Failure and recovery clips for every portal puzzle and moving hazard.',
        'Every boss phase, one death/restart, and a winning resolution.',
        'Returning-save, optional, credible speedrun, and two-player routes.',
      ],
    };
    await writeFile(resolve(output, 'a1-dynamic-baseline.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: pageErrors.length === 0,
      output,
      probes: results.length,
      pageErrors,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  await runDynamicBaseline();
}
