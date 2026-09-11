import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'docs/charters/02-black-woods/evidence/validation/receipt.json');
const EVIDENCE_FOLDER = dirname(OUTPUT);
const URL = process.env.BLADEFALL_URL || 'http://127.0.0.1:8877/index.html';
const delay = (ms) => new Promise((done) => setTimeout(done, ms));

const source = await readFile(resolve(ROOT, 'public/index.html'), 'utf8');
const expectedVersion = source.match(/const VERSION='([^']+)'/)?.[1] || null;
const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 60000,
  args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`);
});

async function resetStage() {
  await page.evaluate(() => {
    mode = 'play';
    window.__BF.reloadStage(1);
    const game = window.__BF.G;
    game.p.hp = game.p.maxHp;
    game.p.dead = false;
    game.p.invuln = 9999;
    game.p._restMouth = null;
    game.p._tpCd = 0;
  });
  await delay(120);
}

async function probeProductionContract() {
  await resetStage();
  return page.evaluate(() => {
    const receipt = window.__BF.blackWoodsState();
    return {
      name: 'five-room-production-contract',
      evidenceClass: 'live runtime production receipt',
      pass: receipt?.length === 12400 && receipt?.rooms?.length === 5 && receipt?.portalFree === true
        && receipt?.refugeEnemies === 0 && receipt?.refugeResidents?.length === 3
        && receipt?.authoredEncounters?.length === 8 && receipt?.recoverableCopies === 6
        && receipt?.mirrorTruths === 8 && receipt?.windReversals?.length === 2
        && receipt?.rootboundSteps === 8 && receipt?.rootThornBeds === 4
        && new Set(receipt?.behaviorRoles || []).size === 8,
      receipt,
      expected: 'Five authored rooms, three refuge residents, eight encounters, a 6-copy/8-truth wind grammar, eight rootbound steps, four thorn beds, and no portal hardware.',
    };
  });
}

async function probeAuthoredEnemyBehaviors() {
  const contracts = {
    'oathblade-guard': ['challenge', 'advance', 'strike-wind', 'lunge', 'recover'],
    'canopy-controller': ['seed-wind', 'seed-recover'],
    'canopy-diver': ['dive-mark', 'dive', 'rise'],
    'mirror-pursuer': ['challenge', 'advance', 'strike-wind', 'lunge', 'recover'],
    'mirror-diver': ['dive-mark', 'dive', 'rise'],
    'root-stalker': ['veil', 'strike-wind', 'lunge', 'recover'],
    'root-guard': ['challenge', 'advance', 'strike-wind', 'lunge', 'recover'],
    'tunnel-controller': ['seed-wind', 'seed-recover'],
  };
  const observations = {};
  for (const [role, expectedModes] of Object.entries(contracts)) {
    await resetStage();
    await page.evaluate((targetRole) => {
      const game = window.__BF.G;
      for (const enemy of game.enemies) enemy.active = false;
      const enemy = game.enemies.find((candidate) => candidate.forestRole === targetRole);
      enemy.active = true;
      Object.assign(enemy, {
        y: 0, baseY: 0, safeY: 0, forestHomeY: 0, face: -1,
        forestMode: 'patrol', forestTimer: 0, forestCooldown: 0,
        forestSight: 0, forestAlertT: 0, forestAwareness: 'unaware',
      });
      Object.assign(game.p, { x: enemy.x - 65, y: 0, vx: 0, vy: 0, onGround: true, dead: false });
    }, role);
    const modes = new Set();
    let committedContact = false;
    for (let sample = 0; sample < 15; sample += 1) {
      await delay(125);
      const state = await page.evaluate((targetRole) => {
        const enemy = window.__BF.G.enemies.find((candidate) => candidate.forestRole === targetRole);
        return { mode: enemy?.forestMode || null, contact: !!enemy?.forestContactDanger };
      }, role);
      if (state.mode) modes.add(state.mode);
      committedContact ||= state.contact;
    }
    const seen = [...modes];
    observations[role] = {
      modes: seen,
      expectedModes,
      enteredAuthoredCommitment: expectedModes.some((mode) => modes.has(mode)),
      committedContact,
    };
  }
  return {
    name: 'eight-authored-enemy-behaviors',
    evidenceClass: 'live perception and state-machine timeline probe',
    pass: Object.values(observations).every((entry) => entry.enteredAuthoredCommitment),
    observations,
    expected: 'Every forest role leaves generic patrol and enters its terrain-authored, visibly telegraphed behavior loop when it perceives the player.',
  };
}

async function probeAnchoredDialogue() {
  await resetStage();
  await page.evaluate(() => {
    const game = window.__BF.G;
    Object.assign(game.p, { x: 430, y: 0, vx: 0, vy: 0, onGround: true });
  });
  await page.keyboard.press('ArrowUp');
  await delay(350);
  const near = await page.evaluate(() => {
    const annotation = window.__BF.G.outskirtsAnnotation;
    return annotation ? { title: annotation.title, sourceX: annotation.source?.x, radius: annotation.radius } : null;
  });
  await page.evaluate(() => Object.assign(window.__BF.G.p, { x: 820, y: 0, vx: 0, vy: 0 }));
  await delay(350);
  const far = await page.evaluate(() => window.__BF.G.outskirtsAnnotation);
  return {
    name: 'anchored-refuge-dialogue',
    evidenceClass: 'runtime deliberate-read and expiry probe',
    pass: near?.sourceX === 430 && near?.radius <= 250 && far === null,
    near,
    clearedAfterLeaving: far === null,
    expected: 'Up deliberately reads Orra’s one compact point-anchored annotation, which clears outside its reading radius.',
  };
}

async function probeWeaponAwakening() {
  await resetStage();
  const before = await page.evaluate(() => ({
    capability: window.__BF.meta.capabilities?.acquired?.includes('weapon') || false,
    pickup: window.__BF.G.pickups.find((item) => item.acquisitionId)?.x || null,
  }));
  const ritual = await page.evaluate(() => {
    const game=window.__BF.G,weight=game.obstacles.find(object=>object.oathbladeCounterweight);
    Object.assign(game.p,{x:weight.x,y:weight.y,vx:0,vy:0,onGround:true,floorPlat:null});
    updateObstacles(1/60);
    const blade=game.pickups.find(item=>item.acquisitionId);
    Object.assign(game.p,{x:blade.x,y:blade.y||0,vx:0,vy:0,onGround:true,floorPlat:null});
    const bagged=collectNearbyItem();
    return{weightReleased:!!weight.released,bladeUnlocked:!blade.ritualLocked,bagged,
      cameraFocus:game.authoredCameraFocus?{...game.authoredCameraFocus}:null};
  });
  await delay(520);
  const framing = await page.evaluate(() => ({
    cam:window.__BF.G.cam,viewport:innerWidth,
    stumpX:window.__BF.G.obstacles.find(object=>object.weaponAwakening)?.x,
    counterweightX:window.__BF.G.obstacles.find(object=>object.oathbladeCounterweight)?.x,
    focus:window.__BF.G.authoredCameraFocus?{...window.__BF.G.authoredCameraFocus}:null,
  }));
  await page.screenshot({path:resolve(EVIDENCE_FOLDER,'oathblade-release-framing.png'),type:'png'});
  await delay(40);
  const after = await page.evaluate(() => ({
    capability: window.__BF.meta.capabilities?.acquired?.includes('weapon') || false,
    weapon: window.__BF.G.p.weapon?.arche || null,
    pickupRemaining: window.__BF.G.pickups.some((item) => item.acquisitionId),
    baggedWeapon: window.__BF.meta.inventory?.items?.some(row=>row.item?.arche==='sword')||false,
    guardActive: window.__BF.G.enemies.find((enemy) => enemy.forestRole === 'oathblade-guard')?.active === true,
  }));
  return {
    name: 'authored-oathblade-awakening',
    evidenceClass: 'fresh-state ritual release and deliberate-bagging probe',
    pass: before.capability === false && before.pickup === 2800 && after.capability === true
      && ritual.weightReleased && ritual.bladeUnlocked && ritual.bagged
      && after.weapon === 'sword' && after.baggedWeapon && after.pickupRemaining === false && after.guardActive === true
      && framing.focus?.x === 3110 && framing.cam <= framing.stumpX && framing.cam + framing.viewport >= framing.counterweightX,
    before,
    ritual,
    framing,
    after,
    expected: 'The player enters weaponless, releases the rooted Oathblade, sees stump and counterweight in one authored camera frame, and auto-equips the first weapon.',
  };
}

async function probeCanopyGeometry() {
  await resetStage();
  return page.evaluate(() => {
    const surfaces = window.__BF.G.obstacles.filter((object) => object.truthSurface && object.type === 'plat'
      && object.x >= 4400 && object.x < 6700).sort((a, b) => a.x - b.x);
    const rises = surfaces.slice(1).map((surface, index) => surface.y - surfaces[index].y);
    const gaps = surfaces.slice(1).map((surface, index) => {
      const prior = surfaces[index];
      return Math.max(0, Math.round((surface.x - surface.w / 2) - (prior.x + prior.w / 2)));
    });
    const upwardGaps = gaps.filter((gap, index) => rises[index] > 0);
    const ground = window.__BF.G.obstacles.some((object) => object.type === 'plat' && object.x === 5450 && object.w === 2500);
    return {
      name: 'single-jump-canopy-contract',
      evidenceClass: 'live collision geometry audit',
      pass: surfaces.length === 8 && Math.max(...rises) <= 65 && Math.max(...upwardGaps) <= 75 && ground,
      surfaces: surfaces.map((surface) => ({ x: surface.x, y: surface.y, w: surface.w })),
      rises,
      gaps,
      upwardGaps,
      recoveryGround: ground,
      expected: 'Every ascent rises no more than 65 px, leaves no upward gap wider than 75 px, and has continuous recovery ground below.',
    };
  });
}

async function probeFalseLedge() {
  await resetStage();
  await page.evaluate(() => {
    const game = window.__BF.G;
    Object.assign(game.p, { x: 7935, y: 150, vx: 0, vy: -100, onGround: false, floorPlat: null });
  });
  await delay(900);
  return page.evaluate(() => {
    const game = window.__BF.G;
    const fake = game.obstacles.find((object) => object.fake && object.mirrorCopy && object.x === 7935);
    return {
      name: 'mirror-copy-safe-failure',
      evidenceClass: 'state-positioned collision outcome probe',
      pass: !!fake?.gone && game.p.y >= 0 && !game.p.dead,
      fakeGone: !!fake?.gone,
      landing: { x: Math.round(game.p.x), y: Math.round(game.p.y), dead: !!game.p.dead },
      expected: 'The false branch vanishes, but the continuous lower trail keeps the player alive and able to retry.',
    };
  });
}

async function probePhysicalExit() {
  await resetStage();
  return page.evaluate(() => {
    const game = window.__BF.G;
    const tunnel = game.obstacles.find((object) => object.routeReveal === 'brute');
    const eligibility = window.__BF.zones.eligibility('black-woods-brute', 'black-woods', {
      capabilities: window.__BF.meta.capabilities?.acquired || [],
    });
    return {
      name: 'physical-root-tunnel-exit',
      evidenceClass: 'live world-graph and landmark probe',
      pass: !!tunnel && game.portal === null && eligibility.allowed === true,
      tunnel: tunnel ? { x: tunnel.x, kind: tunnel.kind, routeReveal: tunnel.routeReveal } : null,
      portal: game.portal,
      eligibility,
      expected: 'The east boundary is a visible root tunnel with an eligible bidirectional world seam, never a completion portal.',
    };
  });
}

async function probeWindShaftTransition() {
  await resetStage();
  const opened = await page.evaluate(() => {
    const game=window.__BF.G,seam=game.obstacles.find(object=>object.woodsReturnSecret);
    // The authored branch is reached after Brute; reproduce that earned
    // constitutional state while leaving the transition itself untouched.
    let progress=window.__BF.meta.capabilities;
    for(const [id,zone] of [['weapon','black-woods'],['dash','brute']]){
      const grant=BFCapabilitiesModule.grant(progress,id,{zone,earned:true,source:'validation-earned-route'});
      progress=grant.state;
    }
    window.__BF.meta.capabilities=progress;syncMovementCapabilities(game.p);
    openBlackWoodsWindShaft(seam);
    const shaft=game.obstacles.find(object=>object.blackWoodsAscent);
    Object.assign(game.p,{x:seam.x,y:0,vx:0,vy:0,onGround:true});
    game.cam=Math.max(0,seam.x-innerWidth*.5);game.camY=0;game.shake=0;
    window.__BF.camera.reset(game.cam,0);window.__BF.camera.sync(game.cam,0);
    return{seamX:seam.x,shaft:{x:shaft?.x,y:shaft?.y,w:shaft?.w,h:shaft?.h},
      threshold:game.blackWoodsWindShaft?.threshold,stage:game.stageIndex};
  });
  await delay(140);
  await page.screenshot({path:resolve(EVIDENCE_FOLDER,'black-woods-wind-shaft.png'),type:'png'});
  await page.evaluate(() => {
    const game=window.__BF.G,shaft=game.blackWoodsWindShaft;
    Object.assign(game.p,{x:shaft.x,y:shaft.threshold+10,vx:0,vy:-80,onGround:false});
    updateBlackWoodsWindShaft();
  });
  await page.waitForFunction(()=>window.__BF.G.stageIndex===3,{timeout:4000});
  const arrival=await page.evaluate(() => ({stage:window.__BF.G.stageIndex,x:window.__BF.G.p.x,y:window.__BF.G.p.y,
    checkpoint:{x:window.__BF.G.p.ckX,y:window.__BF.G.p.ckY,set:window.__BF.G.p.ckSet},
    rootbreach:window.__BF.G.obstacles.some(object=>object.kind==='rootbreach-lift')}));
  return{name:'conscious-wind-shaft-transition',evidenceClass:'live shaft creation, canopy threshold, streaming transition, and authored arrival',
    pass:opened.stage===1&&opened.shaft?.h===1700&&opened.threshold===1480&&arrival.stage===3
      &&arrival.x===70&&arrival.y===0&&arrival.checkpoint.set&&arrival.rootbreach,
    opened,arrival,expected:'Breaking the seam leaves the player in Black Woods until they ride the visible current through the canopy, then places them safely at Rootbreach Lift.'};
}

async function probeRootboundReturnRoute() {
  await resetStage();
  return page.evaluate(() => {
    const game = window.__BF.G;
    const steps = game.obstacles.filter((object) => object.rootboundStep).sort((a, b) => a.x - b.x);
    const wall = game.obstacles.find((object) => object.rootWall);
    const west = game.obstacles.find((object) => object.mirrorTruth && object.x === 9430);
    const thorns = game.obstacles.filter((object) => object.rootThorns);
    const checkpoint = game.obstacles.find((object) => object.type === 'check' && object.x === 9780);
    const edgeGap = (a, b) => Math.max(0, Math.abs(a.x - b.x) - (a.w + b.w) / 2);
    const route = [west, wall, ...steps].filter(Boolean);
    const rises = route.slice(1).map((step, index) => step.y - route[index].y);
    const gaps = route.slice(1).map((step, index) => edgeGap(step, route[index]));
    return {
      name: 'rootbound-bidirectional-high-route',
      evidenceClass: 'live collision-geometry and hazard ownership probe',
      pass: !!west && !!wall && steps.length === 8 && thorns.length === 4
        && checkpoint?.y === 560 && Math.max(...rises.map(Math.abs)) <= 70
        && Math.max(...gaps) <= 60
        && !game.obstacles.some((object) => object.mirrorCopy && object.x >= 9700),
      steps: steps.map(({ x, y, w }) => ({ x, y, w })),
      thornBeds: thorns.map(({ x, w, period, phase }) => ({ x, w, period, phase })),
      rises,
      gaps,
      checkpoint: checkpoint ? { x: checkpoint.x, y: checkpoint.y } : null,
      expected: 'The wall has reachable landings on both sides; eight 70 px steps remain reversible and protect a recoverable lower route over four timed root beds.',
    };
  });
}

async function probeReducedMotion() {
  return page.evaluate(() => {
    const camera = window.__BF.camera;
    const previous = camera.diagnostics().settings;
    camera.applySettings({ reducedMotion: true, screenShake: 1 });
    const shake = camera.shakeOffset(12.5, 20);
    const state = camera.update({
      player: { x: 1800, y: 420, vx: 850, face: 1 },
      viewportWidth: 960,
      levelLength: window.__BF.G.levelLength,
    }, 1 / 60);
    const result = {
      name: 'reduced-motion-camera-readability',
      evidenceClass: 'runtime accessibility-controller probe',
      pass: shake.x === 0 && shake.y === 0 && state.lookAhead === 0,
      shake,
      lookAhead: state.lookAhead,
      expected: 'Reduced motion removes shake and velocity look-ahead while leaving collision and hazard timing unchanged.',
    };
    camera.applySettings(previous);
    return result;
  });
}

try {
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });
  await page.setBypassServiceWorker(true);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.__BF && window.__BF.VERSION, { timeout: 20000 });
  const servedVersion = await page.evaluate(() => window.__BF.VERSION);
  if (servedVersion !== expectedVersion) throw new Error(`Expected ${expectedVersion}, received ${servedVersion}.`);
  await page.evaluate(() => beginRun(0, null, { hp: 1, dmg: 1 }, { intro: false }));
  await page.click('canvas', { delay: 20 });
  await page.waitForFunction(() => window.__BF.G.time > 0, { timeout: 5000 });

  const probes = [];
  probes.push(await probeProductionContract());
  probes.push(await probeAnchoredDialogue());
  probes.push(await probeWeaponAwakening());
  probes.push(await probeAuthoredEnemyBehaviors());
  probes.push(await probeCanopyGeometry());
  probes.push(await probeFalseLedge());
  probes.push(await probeRootboundReturnRoute());
  probes.push(await probePhysicalExit());
  probes.push(await probeWindShaftTransition());
  probes.push(await probeReducedMotion());

  const receipt = {
    schema: 'bladefall.black-woods-validation',
    version: 1,
    gameVersion: expectedVersion,
    url: URL,
    browserBridge: 'Version-verified local Chromium validation; in-app browser review is recorded separately.',
    pageErrors,
    screenshots: ['oathblade-release-framing.png','black-woods-wind-shaft.png'],
    probes,
    ok: pageErrors.length === 0 && probes.every((probe) => probe.pass),
    limitations: [
      'State-positioned probes isolate authored outcomes and are not natural-route or human-comprehension evidence.',
      'The canopy probe audits live collision geometry; the in-app browser pass supplies human-readable visual review.',
      'Full fresh, optional/100%, speedrun, and live two-player routes remain human review gates.',
    ],
  };
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, ok: receipt.ok, probes: probes.map(({ name, pass }) => ({ name, pass })) }, null, 2));
  if (!receipt.ok) process.exitCode = 1;
} finally {
  await browser.close();
}
