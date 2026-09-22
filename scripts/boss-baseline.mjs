import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'docs/baseline/bosses');
const DEFAULT_URL = 'http://127.0.0.1:8372/';
const VIEWPORT = { width: 960, height: 600, deviceScaleFactor: 1 };
const FPS = 6;
const DURATION_MS = 7000;

const BOSSES = [
  { stageIndex: 2, stageName: 'The Brute', type: 'brute' },
  { stageIndex: 4, stageName: 'Hollow Marksman', type: 'archer' },
  { stageIndex: 6, stageName: 'The Warden', type: 'warden' },
  { stageIndex: 8, stageName: 'Frost Sorcerer', type: 'sorcerer' },
  { stageIndex: 10, stageName: 'Ember Colossus', type: 'colossus' },
  { stageIndex: 12, stageName: 'The Void Tyrant', type: 'tyrant' },
  { stageIndex: 13, stageName: 'The Abyss King', type: 'king' },
];

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
    '-y', '-loglevel', 'error', '-framerate', String(FPS),
    '-i', resolve(frameFolder, 'frame-%04d.png'),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', output,
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
  await page.waitForFunction(() => window.__BF && document.querySelector('#newBtn'), { timeout: 20000 });
  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)', { timeout: 10000 });
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF && window.__BF.mode === 'play', { timeout: 10000 });
}

async function setupBoss(page, definition) {
  return page.evaluate((bossDefinition) => {
    const api = window.__BF;
    api.reloadStage(bossDefinition.stageIndex);
    const game = api.G;
    const boss = game.boss;
    const player = game.p;
    const playerX = Math.max(100, boss.x - Math.min(300, Math.max(170, (boss.x - (boss.cadenceArenaL || boss.x - 500)) * 0.45)));
    const support = game.obstacles
      .filter((object) => object.type === 'plat' && !object.gone
        && playerX >= object.x - (object.w || 0) / 2
        && playerX <= object.x + (object.w || 0) / 2)
      .sort((left, right) => Math.abs((left.y || 0)) - Math.abs((right.y || 0)))[0] || null;
    player.x = playerX;
    player.y = support?.y || 0;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.floorPlat = support;
    player.hp = player.maxHp;
    player.dead = false;
    player.invuln = 9999;
    game.stageBanner = 0;
    game.shake = 0;

    let checkpointInjection = null;
    if (bossDefinition.type === 'king') {
      const checkpoint = game.obstacles
        .filter((object) => object.type === 'check' && object.x < boss.x)
        .sort((left, right) => right.x - left.x)[0] || null;
      if (checkpoint) {
        checkpoint.active = 1;
        player.ckSet = true;
        player.ckX = checkpoint.x;
        player.ckY = checkpoint.y;
        checkpointInjection = { x: checkpoint.x, y: checkpoint.y };
      }
    }

    const cameraX = Math.max(0, Math.min(game.levelLength - window.innerWidth, boss.x - window.innerWidth * 0.62));
    const cameraY = Math.max(0, boss.y - 300);
    game.cam = cameraX;
    game.camY = cameraY;
    api.camera.reset(cameraX, cameraY);
    api.camera.sync(cameraX, cameraY);
    return {
      stageIndex: bossDefinition.stageIndex,
      playerPosition: { x: player.x, y: player.y },
      support: support ? { x: support.x, y: support.y, w: support.w, type: support.type } : null,
      invulnerabilityInjected: true,
      checkpointInjection,
      bossContract: {
        id: boss.id || null,
        type: boss.type,
        label: boss.label,
        hp: boss.hp,
        maxHp: boss.maxHp,
        damage: boss.dmg,
        portalGate: boss.portalGate || null,
        phase: boss.phase,
        finalePhases: boss.finalePhases || null,
        reflectBanks: boss.reflectBanks || null,
        forgeHits: boss.forgeHits || null,
        paradoxHits: boss.paradoxHits || null,
        echoFractures: boss.echoFractures || null,
        special: {
          brutePortalFight: Boolean(boss.brutePortalFight),
          wardenPortalFight: Boolean(boss.wardenPortalFight),
          spellSiphonFight: Boolean(boss.spellSiphonFight),
          forgeFight: Boolean(boss.forgeFight),
          paradoxFight: Boolean(boss.paradoxFight),
          echoFight: Boolean(boss.echoFight),
        },
      },
    };
  }, definition);
}

async function sampleBoss(page, tMs) {
  return page.evaluate((time) => {
    const api = window.__BF;
    const game = api.G;
    const player = game.p;
    const boss = game.boss;
    return {
      tMs: time,
      mode: api.mode,
      stageIndex: game.stageIndex,
      player: {
        x: Math.round(player.x * 10) / 10,
        y: Math.round(player.y * 10) / 10,
        hp: Math.round(player.hp * 10) / 10,
        maxHp: player.maxHp,
        dead: Boolean(player.dead),
        invuln: Math.round((player.invuln || 0) * 10) / 10,
      },
      checkpoint: {
        set: Boolean(player.ckSet),
        x: Number.isFinite(player.ckX) ? Math.round(player.ckX) : null,
        y: Number.isFinite(player.ckY) ? Math.round(player.ckY) : null,
      },
      boss: boss ? {
        type: boss.type,
        hp: Math.round(boss.hp * 10) / 10,
        maxHp: boss.maxHp,
        hpFraction: Math.round((boss.hp / Math.max(1, boss.maxHp)) * 1000) / 1000,
        phase: boss.phase,
        phase2Started: Boolean(boss.phase2Started),
        phase3Started: Boolean(boss.phase3Started),
        x: Math.round(boss.x),
        y: Math.round(boss.y),
        bruteState: boss.bruteState || null,
        spellStunT: Math.round((boss.spellStunT || 0) * 1000) / 1000,
        forgeStunT: Math.round((boss.forgeStunT || 0) * 1000) / 1000,
        forgeQuenches: Math.round((boss.forgeQuenches || 0) * 100) / 100,
        forgeAct: boss.forgeAct || null,
        forgeBeat: boss.forgeBeat || null,
        paradoxRound: boss.paradoxRound ?? null,
        paradoxStunT: Math.round((boss.paradoxStunT || 0) * 1000) / 1000,
        echoRound: boss.echoRound ?? null,
        portalHijack: boss.portalHijack ? {
          timer: Math.round((boss.portalHijack.timer || 0) * 1000) / 1000,
          duringEcho: Boolean(boss.portalHijack.duringEcho),
        } : null,
        shootCd: Math.round((boss.shootCd || 0) * 1000) / 1000,
      } : null,
      activity: {
        projectiles: game.projectiles.length,
        aoes: game.aoes.length,
        livingEnemies: game.enemies.filter((enemy) => !enemy.dead).length,
      },
    };
  }, tMs);
}

export function summarizeBossProbe(samples, setup, definition) {
  const beforeRestart = samples.filter((sample) => sample.tMs < 4700 && sample.boss);
  const afterRestart = samples.filter((sample) => sample.tMs >= 4700 && sample.boss);
  const phases = [...new Set(beforeRestart.map((sample) => sample.boss.phase))];
  const phase2Observed = beforeRestart.some((sample) => sample.boss.phase >= 2 || sample.boss.phase2Started);
  const phase3Observed = beforeRestart.some((sample) => sample.boss.phase3Started);
  const attackActivityObserved = beforeRestart.some((sample) =>
    sample.activity.projectiles > 0 || sample.activity.aoes > 0
    || (sample.boss.bruteState && sample.boss.bruteState !== 'hunt'))
    || (beforeRestart.length > 1
      && Math.max(...beforeRestart.map((sample) => sample.boss.x))
        - Math.min(...beforeRestart.map((sample) => sample.boss.x)) > 35);
  const restartObserved = afterRestart.some((sample) =>
    sample.player.hp >= sample.player.maxHp * 0.95
    && sample.boss.hpFraction >= 0.95
    && sample.mode === 'play');
  const checkpointReturnObserved = definition.type === 'king'
    ? afterRestart.some((sample) => setup.checkpointInjection
      && Math.abs(sample.player.x - setup.checkpointInjection.x) < 70
      && sample.checkpoint.set)
    : null;
  return {
    phasesObserved: phases,
    phase2Observed,
    phase3Observed,
    attackActivityObserved,
    syntheticDeathRestartObserved: restartObserved,
    checkpointReturnObserved,
    victoryObserved: false,
    status: phase2Observed && restartObserved
      ? definition.type === 'king' && !checkpointReturnObserved
        ? 'phase-observed-restart-checkpoint-unproven'
        : 'phase-and-synthetic-restart-observed'
      : phase2Observed ? 'phase-observed-restart-unproven' : 'phase-and-restart-unproven',
  };
}

async function recordBoss(page, definition, frameFolder) {
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

  while (Date.now() - start < DURATION_MS) {
    const elapsed = Date.now() - start;
    await once('phase-two', 1350, async () => {
      const change = await page.evaluate(() => {
        const boss = window.__BF.G.boss;
        boss.hp = boss.maxHp * 0.48;
        return { hp: boss.hp, maxHp: boss.maxHp, fraction: 0.48 };
      });
      events.push({
        tMs: elapsed,
        kind: 'state-injection',
        mutation: change,
        purpose: 'cross generic enrage and Abyss King phase-two thresholds',
      });
    });
    if (definition.type === 'king') {
      await once('phase-three', 3250, async () => {
        const change = await page.evaluate(() => {
          const boss = window.__BF.G.boss;
          boss.hp = boss.maxHp * 0.24;
          return { hp: boss.hp, maxHp: boss.maxHp, fraction: 0.24 };
        });
        events.push({
          tMs: elapsed,
          kind: 'state-injection',
          mutation: change,
          purpose: 'cross Abyss King phase-three threshold',
        });
      });
    }
    await once('synthetic-death', 4700, async () => {
      await page.evaluate(() => {
        const player = window.__BF.G.p;
        player.hp = 1;
        player.invuln = 0;
        player.y = -90;
        player.vy = 0;
        player.onGround = false;
        player.floorPlat = null;
      });
      events.push({
        tMs: elapsed,
        kind: 'state-injection',
        mutation: 'player.hp=1, player.y=-90, invulnerability removed',
        purpose: 'synthetic lethal out-of-bounds event to exercise boss-stage restart',
      });
    });
    samples.push(await sampleBoss(page, elapsed));
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
  samples.push(await sampleBoss(page, Date.now() - start));
  return { events, samples, frames: frame, wallDurationMs: Date.now() - start };
}

async function runBossBaseline() {
  const url = argument('--url', process.env.BLADEFALL_BASELINE_URL || DEFAULT_URL);
  const output = resolve(argument('--output', DEFAULT_OUTPUT));
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
    await page.waitForFunction(() => window.__BF && window.__BF.VERSION, { timeout: 20000 });
    const servedVersion = await page.evaluate(() => window.__BF.VERSION);
    if (servedVersion !== expectedVersion) {
      throw new Error(`Refusing boss capture: expected ${expectedVersion}, received ${servedVersion} from ${url}`);
    }
    await startFreshRun(page);
    await mkdir(output, { recursive: true });

    const results = [];
    for (const definition of BOSSES) {
      const setup = await setupBoss(page, definition);
      await delay(350);
      const folder = resolve(output, `${String(definition.stageIndex + 1).padStart(2, '0')}-${definition.type}`);
      const frames = await mkdtemp(resolve(tmpdir(), `bladefall-a1-boss-${definition.type}-`));
      await mkdir(folder, { recursive: true });
      try {
        const recording = await recordBoss(page, definition, frames);
        const videoPath = resolve(folder, 'phase-reset-probe.mp4');
        await encodeFrames(frames, videoPath);
        const result = summarizeBossProbe(recording.samples, setup, definition);
        const receipt = {
          schema: 'bladefall.a1-boss-probe',
          version: 1,
          gameVersion: expectedVersion,
          url,
          stage: { index: definition.stageIndex, name: definition.stageName },
          bossType: definition.type,
          browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
          evidenceClass: 'state-positioned arena observation, disclosed invulnerability, forced HP thresholds, and synthetic lethal fall',
          setup,
          events: recording.events,
          samples: recording.samples,
          capture: {
            viewport: VIEWPORT,
            fps: FPS,
            frames: recording.frames,
            wallDurationMs: recording.wallDurationMs,
            video: 'phase-reset-probe.mp4',
          },
          result,
          limitations: [
            'This does not prove a natural boss phase transition, intended portal solution, or player victory.',
            'Arena positioning and invulnerability are disclosed setup mutations used to observe attacks safely.',
            'HP thresholds are forced directly and therefore validate runtime phase response, not balance or legitimate damage routing.',
            'The lethal fall validates restart plumbing; it is not evidence of boss lethality.',
            'Co-op boss ownership and synchronization remain untested.',
          ],
        };
        await writeFile(resolve(folder, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
        results.push({
          ...definition,
          contract: setup.bossContract,
          result,
          video: relative(output, videoPath),
          receipt: relative(output, resolve(folder, 'receipt.json')),
        });
        console.log(`${definition.stageName}: ${result.status}`);
      } finally {
        await rm(frames, { recursive: true, force: true });
      }
    }

    const report = {
      schema: 'bladefall.a1-boss-baseline',
      version: 1,
      gameVersion: expectedVersion,
      url,
      browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
      pageErrors,
      capturedBosses: results.length,
      bosses: results,
      coverage: {
        contractInventory: results.length === BOSSES.length ? 'complete' : 'partial',
        forcedPhaseResponse: results.every((result) => result.result.phase2Observed) ? 'complete' : 'partial',
        syntheticDeathRestart: results.every((result) => result.result.syntheticDeathRestartObserved) ? 'complete' : 'partial',
        abyssKingCheckpointRestart: results.find((result) => result.type === 'king')?.result.checkpointReturnObserved
          ? 'complete' : 'unproven',
        naturalPhaseProgression: 'pending',
        naturalDeathRestart: 'pending',
        victories: 'pending',
        coop: 'pending',
      },
      remaining: [
        'Complete each intended portal mechanic without state injection.',
        'Record every authored mechanic phase and vulnerability window.',
        'Record one boss-caused death and one legitimate victory for every boss.',
        'Repeat boss ownership and transitions in two-player campaign play.',
      ],
    };
    await writeFile(resolve(output, 'a1-boss-baseline.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: pageErrors.length === 0,
      output,
      bosses: results.length,
      pageErrors,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  await runBossBaseline();
}
