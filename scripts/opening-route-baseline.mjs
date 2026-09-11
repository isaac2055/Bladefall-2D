import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'docs/baseline/routes/opening');
const DEFAULT_URL = 'http://127.0.0.1:8372/';
const VIEWPORT = { width: 960, height: 600, deviceScaleFactor: 1 };
const FPS = 4;
const DEFAULT_DURATION_MS = 35000;
const OPENING_STAGES = [
  { index: 0, id: 'outskirts', name: 'The Outskirts' },
  { index: 1, id: 'black-woods', name: 'Black Woods' },
  { index: 2, id: 'brute', name: 'The Brute' },
  { index: 3, id: 'updrafts', name: 'The Updrafts' },
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
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '29',
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

async function prepareStage(page, stage) {
  if (stage.index === 0) {
    return page.evaluate(() => ({
      stageSelection: 'fresh-run-natural-first-stage',
      healthNormalization: false,
      x: window.__BF.G.p.x,
      y: window.__BF.G.p.y,
      levelLength: window.__BF.G.levelLength,
    }));
  }
  return page.evaluate((stageIndex) => {
    window.__BF.reloadStage(stageIndex);
    const game = window.__BF.G;
    game.p.hp = game.p.maxHp;
    game.p.dead = false;
    game.p.invuln = 0;
    return {
      stageSelection: 'development-stage-start-selection',
      healthNormalization: true,
      x: game.p.x,
      y: game.p.y,
      levelLength: game.levelLength,
    };
  }, stage.index);
}

async function routeState(page, tMs) {
  return page.evaluate((time) => {
    const api = window.__BF;
    const game = api.G;
    const player = game.p;
    const feet = game.gravityFlipped ? player.y + player.h : player.y;
    const onSlate = game.obstacles.some((object) => object.slate && object.type === 'plat'
      && Math.abs(player.x - object.x) < object.w / 2 + player.w / 2
      && Math.abs(feet - object.y) < 18);
    const ahead = game.obstacles.filter((object) => {
      const dx = object.x - player.x;
      return dx > 0 && dx < 190 && !object.gone;
    });
    const hazardAhead = ahead.some((object) =>
      object.type === 'spikes' || object.type === 'pit' || object.type === 'trap');
    const wallAhead = ahead.some((object) => {
      if (!(object.type === 'wall' || (object.type === 'door' && !object.gone))) return false;
      const bottom=(object.y||0)-(object.h||0),top=object.y||0;
      return player.y+player.h>bottom&&player.y<top;
    });
    return {
      tMs: time,
      stageIndex: game.stageIndex,
      mode: api.mode,
      levelLength: game.levelLength,
      player: {
        x: Math.round(player.x * 10) / 10,
        y: Math.round(player.y * 10) / 10,
        vx: Math.round(player.vx * 10) / 10,
        vy: Math.round(player.vy * 10) / 10,
        hp: Math.round(player.hp * 10) / 10,
        maxHp: player.maxHp,
        dead: Boolean(player.dead),
        onGround: Boolean(player.onGround),
        onWall: Boolean(player.onWall),
        wallDir: player.wallDir || 0,
        hasJetpack: Boolean(player.hasJetpack),
        fuel: Math.round((player.fuel || 0) * 10) / 10,
      },
      checkpoint: {
        set: Boolean(player.ckSet),
        x: Number.isFinite(player.ckX) ? Math.round(player.ckX) : null,
        y: Number.isFinite(player.ckY) ? Math.round(player.ckY) : null,
      },
      routeSensors: {
        onSlate,
        hazardAhead,
        wallAhead,
        portalsPlaced: (game.cratePortals || []).length,
        livingEnemies: game.enemies.filter((enemy) => !enemy.dead).length,
        boss: game.boss && !game.boss.dead ? {
          type: game.boss.type,
          x: Math.round(game.boss.x),
          distance: Math.round(Math.abs(game.boss.x - player.x)),
          hpFraction: Math.round((game.boss.hp / game.boss.maxHp) * 1000) / 1000,
          phase: game.boss.phase,
          specialRound: game.boss.paradoxRound ?? game.boss.echoRound ?? null,
        } : null,
      },
    };
  }, tMs);
}

function countResets(samples, stageIndex) {
  let count = 0;
  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    if (previous.stageIndex === stageIndex && current.stageIndex === stageIndex
      && previous.player.x - current.player.x > 500) count += 1;
  }
  return count;
}

export function summarizeOpeningRoute(samples, setup, stage) {
  const ownStage = samples.filter((sample) => sample.stageIndex === stage.index);
  const xs = ownStage.map((sample) => sample.player.x);
  const maxX = xs.length ? Math.max(setup.x, ...xs) : setup.x;
  const progressFraction = Math.min(1, Math.max(0, maxX - setup.x)
    / Math.max(1, setup.levelLength - setup.x));
  const transition = samples.find((sample) => sample.stageIndex !== stage.index)?.stageIndex ?? null;
  const resets = countResets(samples, stage.index);
  const checkpointXs = [...new Set(ownStage
    .filter((sample) => sample.checkpoint.set && Number.isFinite(sample.checkpoint.x))
    .map((sample) => sample.checkpoint.x))];
  const maxPortals = Math.max(0, ...ownStage.map((sample) => sample.routeSensors.portalsPlaced));
  const bossReached = ownStage.some((sample) =>
    sample.routeSensors.boss && sample.routeSensors.boss.distance < 900);
  const lastOwn = ownStage.at(-1);
  const status = transition !== null
    ? 'stage-transition-observed'
    : resets >= 3
      ? 'extended-route-repeated-resets'
      : progressFraction >= 0.5
        ? 'extended-route-majority-progress'
        : progressFraction >= 0.15
          ? 'extended-route-partial-progress'
          : 'extended-route-limited-progress';
  return {
    status,
    maxX: Math.round(maxX),
    levelLength: setup.levelLength,
    progressFraction: Math.round(progressFraction * 10000) / 10000,
    resetCount: resets,
    checkpointXs,
    maxPortalsPlaced: maxPortals,
    bossReached,
    transitionedToStage: transition,
    finalObservedPosition: lastOwn ? { x: lastOwn.player.x, y: lastOwn.player.y } : null,
    humanPlayabilitySignoff: false,
  };
}

async function recordRoute(page, stage, durationMs, frameFolder) {
  const samples = [];
  const events = [];
  const start = Date.now();
  let frame = 0;
  let nextFrameAt = 0;
  let nextAttack = 250;
  let nextJump = 550;
  let nextDash = 950;
  let nextPortal = 0;
  let nextWallKick = 0;
  let recoveryUntil = 0;
  let moving = 'right';
  let outskirtsPortalPlan = null;
  let outskirtsPortalApproach = false;
  let finished = false;

  const setDirection = async (direction, elapsed, purpose) => {
    if (direction === moving) return;
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('ArrowRight');
    if (direction === 'left') await page.keyboard.down('ArrowLeft');
    if (direction === 'right') await page.keyboard.down('ArrowRight');
    moving = direction;
    events.push({ tMs: elapsed, kind: 'keyboard-policy', action: `direction-${direction}`, purpose });
  };

  await page.keyboard.down('ArrowRight');
  events.push({ tMs: 0, kind: 'keyboard', input: 'ArrowRight', action: 'down' });
  try {
    while (Date.now() - start < durationMs && !finished) {
      const elapsed = Date.now() - start;
      const state = await routeState(page, elapsed);
      samples.push(state);

      if (state.stageIndex !== stage.index) {
        finished = true;
      } else if (state.mode === 'upgrade') {
        await page.keyboard.press('1', { delay: 40 });
        events.push({
          tMs: elapsed,
          kind: 'keyboard',
          input: 'Digit1',
          purpose: 'select first offered level-up or item choice and resume route',
        });
      } else if (state.mode === 'portal_prompt') {
        await page.keyboard.press('Enter', { delay: 40 });
        events.push({ tMs: elapsed, kind: 'keyboard', input: 'Enter', purpose: 'accept portal transition prompt' });
      } else if (state.mode === 'play') {
        if (state.routeSensors.onSlate && elapsed >= nextPortal) {
          await page.keyboard.press('f', { delay: 40 });
          events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyF', purpose: 'place or clear mouth on encountered slate before leaving its surface' });
          nextPortal = elapsed + 1800;
        }
        if(stage.index===0&&state.routeSensors.portalsPlaced===0)outskirtsPortalPlan=null;
        if(stage.index===0&&state.routeSensors.portalsPlaced===0&&state.player.x>5300)outskirtsPortalApproach=true;
        if(stage.index===0&&state.routeSensors.portalsPlaced===1&&!outskirtsPortalPlan)outskirtsPortalPlan='arm-current';
        let authoredPortalControl=false;
        if(stage.index===0&&outskirtsPortalApproach&&state.routeSensors.portalsPlaced===0){
          authoredPortalControl=true;recoveryUntil=0;
          if(state.player.x<5400)await setDirection('right',elapsed,'settle onto the breach slate');
          else if(state.player.x>5480)await setDirection('left',elapsed,'return to the breach slate');
          else await setDirection('none',elapsed,'stand on the breach slate before placing the mouth');
        }else if(stage.index===0&&outskirtsPortalPlan){
          authoredPortalControl=true;recoveryUntil=0;
          if(outskirtsPortalPlan==='arm-current'){
            await setDirection('left',elapsed,'return across the signal plate after placing the floor mouth');
            if(state.player.x<4960)outskirtsPortalPlan='ride-current';
          }else if(outskirtsPortalPlan==='ride-current'){
            if(state.player.y>500){outskirtsPortalPlan='cross-high-bank';await setDirection('right',elapsed,'leave the ignited current toward the high bank');}
            else if(state.player.x<5065)await setDirection('right',elapsed,'center in the ignited updraft');
            else if(state.player.x>5095)await setDirection('left',elapsed,'center in the ignited updraft');
            else await setDirection('none',elapsed,'hold inside the ignited updraft');
          }else if(outskirtsPortalPlan==='cross-high-bank'){
            if(state.player.x>6000){outskirtsPortalPlan='exit-breach';await setDirection('right',elapsed,'continue after fixed-exit transit');}
            else if(state.player.y<40&&state.player.x>5500){
              outskirtsPortalPlan='arm-current';
              await setDirection('left',elapsed,'retry the high drop after missing the floor mouth');
            }else if(state.player.y>570){
              await setDirection(state.player.x<5360?'right':'left',elapsed,'brake at the high-bank edge above the floor mouth');
            }else if(state.player.x>5450)await setDirection('left',elapsed,'correct the falling line toward the floor mouth');
            else if(state.player.x<5430)await setDirection('right',elapsed,'correct the falling line toward the floor mouth');
            else await setDirection('none',elapsed,'hold the falling line over the floor mouth');
          }else if(outskirtsPortalPlan==='exit-breach'){
            authoredPortalControl=false;await setDirection('right',elapsed,'continue after fixed-exit transit');
          }
        }
        if (!authoredPortalControl&&elapsed >= nextAttack) {
          await page.keyboard.press('w', { delay: 28 });
          events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyW', purpose: 'attack' });
          nextAttack += 620;
        }
        if (!authoredPortalControl&&state.player.onWall && elapsed >= nextWallKick) {
          await page.keyboard.up('ArrowLeft');
          await page.keyboard.up('ArrowRight');
          const away = state.player.wallDir > 0 ? 'ArrowLeft' : 'ArrowRight';
          await page.keyboard.down(away);
          moving = away === 'ArrowLeft' ? 'left' : 'right';
          await page.keyboard.press('Space', { delay: 36 });
          recoveryUntil = elapsed + 420;
          nextWallKick = elapsed + 500;
          nextJump = elapsed + 440;
          events.push({
            tMs: elapsed,
            kind: 'keyboard-policy',
            input: `${away}+Space`,
            purpose: `commit away from wall direction ${state.player.wallDir} after wall jump`,
          });
        } else if (!authoredPortalControl&&(elapsed >= nextJump || state.routeSensors.hazardAhead || state.routeSensors.wallAhead)) {
          await page.keyboard.press('Space', { delay: 36 });
          events.push({ tMs: elapsed, kind: 'keyboard', input: 'Space', purpose: 'jump/traversal response' });
          nextJump = elapsed + (state.player.onGround ? 760 : 470);
        }
        if (!authoredPortalControl&&elapsed >= nextDash) {
          await page.keyboard.press('d', { delay: 32 });
          events.push({ tMs: elapsed, kind: 'keyboard', input: 'KeyD', purpose: 'dash' });
          nextDash = elapsed + 1280;
        }
        const recent = samples.filter((sample) => sample.stageIndex === stage.index
          && sample.tMs >= elapsed - 2800);
        const recentRange = recent.length
          ? Math.max(...recent.map((sample) => sample.player.x)) - Math.min(...recent.map((sample) => sample.player.x))
          : Infinity;
        if (!authoredPortalControl&&recoveryUntil === 0 && recent.length >= 6 && recentRange < 70) {
          await page.keyboard.up('ArrowRight');
          await page.keyboard.down('ArrowLeft');
          moving = 'left';
          recoveryUntil = elapsed + 650;
          await page.keyboard.press('Space', { delay: 36 });
          await page.keyboard.press('d', { delay: 32 });
          events.push({
            tMs: elapsed,
            kind: 'keyboard-policy',
            action: 'reverse+jump+dash',
            purpose: 'recover from 2.8 seconds of limited horizontal movement',
          });
        } else if (!authoredPortalControl&&recoveryUntil > 0 && elapsed >= recoveryUntil) {
          await page.keyboard.up('ArrowLeft');
          await page.keyboard.down('ArrowRight');
          moving = 'right';
          recoveryUntil = 0;
          events.push({ tMs: elapsed, kind: 'keyboard-policy', action: 'resume-right' });
        }
      }

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
    for (const key of ['ArrowLeft', 'ArrowRight', 'Space', 'w', 'd', 'f', 'Enter']) {
      try { await page.keyboard.up(key); } catch {}
    }
    if (moving === 'left') events.push({ tMs: Date.now() - start, kind: 'cleanup', input: 'ArrowLeft', action: 'up' });
  }
  samples.push(await routeState(page, Date.now() - start));
  return { samples, events, frames: frame, wallDurationMs: Date.now() - start };
}

async function runOpeningRoutes() {
  const url = argument('--url', process.env.BLADEFALL_BASELINE_URL || DEFAULT_URL);
  const output = resolve(argument('--output', DEFAULT_OUTPUT));
  const durationMs = Number(argument('--duration-ms', DEFAULT_DURATION_MS));
  const requestedStages = argument('--stages', '');
  const selectedStages = requestedStages
    ? OPENING_STAGES.filter((stage) => requestedStages.split(',').map(Number).includes(stage.index))
    : OPENING_STAGES;
  if (!selectedStages.length) throw new Error(`No opening stages matched --stages ${requestedStages}.`);
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
      throw new Error(`Refusing opening-route capture: expected ${expectedVersion}, received ${servedVersion} from ${url}`);
    }
    await startFreshRun(page);
    await mkdir(output, { recursive: true });

    const stages = [];
    for (const stage of selectedStages) {
      const setup = await prepareStage(page, stage);
      await delay(350);
      const folder = resolve(output, `${String(stage.index + 1).padStart(2, '0')}-${stage.id}`);
      const frames = await mkdtemp(resolve(tmpdir(), `bladefall-a1-route-${stage.id}-`));
      await mkdir(folder, { recursive: true });
      try {
        const recording = await recordRoute(page, stage, durationMs, frames);
        const videoPath = resolve(folder, 'runtime-assisted-route-attempt.mp4');
        await encodeFrames(frames, videoPath);
        const result = summarizeOpeningRoute(recording.samples, setup, stage);
        const receipt = {
          schema: 'bladefall.a1-opening-route-attempt',
          version: 1,
          gameVersion: expectedVersion,
          url,
          stage,
          browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
          evidenceClass: 'runtime-state-assisted keyboard-only stage-start route attempt',
          setup,
          policy: {
            stateRead: 'player motion, nearby hazard/wall flags, slate contact, portal count, enemy/boss presence, mode and checkpoint',
            allowedActions: ['move', 'jump', 'dash', 'attack', 'place/clear portal', 'accept portal prompt'],
            positionInjectionAfterStart: false,
            hpInjectionAfterStart: false,
            invulnerability: false,
            testMode: false,
          },
          events: recording.events,
          samples: recording.samples,
          capture: {
            viewport: VIEWPORT,
            fps: FPS,
            requestedDurationMs: durationMs,
            wallDurationMs: recording.wallDurationMs,
            frames: recording.frames,
            video: 'runtime-assisted-route-attempt.mp4',
          },
          result,
          limitations: [
            'Runtime-assisted keyboard routing is not a human playability or puzzle-comprehension review.',
            'Only The Outskirts begins from a genuine fresh-run transition; later stages use disclosed development stage selection.',
            'No position, HP, invulnerability, test-mode, or geometry mutation occurs after stage start.',
            'Failure to complete may reflect the simple controller, while completion would prove traversal execution but not clarity or fun.',
            'Optional, revisit, speedrun, and co-op route classes remain separate.',
          ],
        };
        await writeFile(resolve(folder, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
        stages.push({
          ...stage,
          setupClass: setup.stageSelection,
          result,
          video: relative(output, videoPath),
          receipt: relative(output, resolve(folder, 'receipt.json')),
        });
        console.log(`${stage.name}: ${result.status}, ${(result.progressFraction * 100).toFixed(1)}%, ${result.resetCount} reset(s)`);
      } finally {
        await rm(frames, { recursive: true, force: true });
      }
    }

    const report = {
      schema: 'bladefall.a1-opening-route-baseline',
      version: 1,
      gameVersion: expectedVersion,
      url,
      browserBridge: 'In-app browser-control bridge unavailable; version-verified local Chromium fallback used.',
      pageErrors,
      capturedStages: stages.length,
      routeClass: 'runtime-state-assisted keyboard-only stage-start attempts',
      stages,
      coverage: {
        openingStageAttempts: stages.length === OPENING_STAGES.length ? 'complete' : 'partial',
        genuineFreshRunStart: stages.find((stage)=>stage.index===0)?.setupClass === 'fresh-run-natural-first-stage' ? 'complete' : 'missing',
        stageTransitions: stages.filter((stage) => stage.result.transitionedToStage !== null).length,
        humanIntendedRoute: 'pending',
        returningRevisit: 'pending',
        optionalCollectible: 'pending',
        credibleSpeedrun: 'pending',
        twoPlayer: 'pending',
      },
    };
    await writeFile(resolve(output, 'a1-opening-route-baseline.json'), `${JSON.stringify(report, null, 2)}\n`);
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
  await runOpeningRoutes();
}
