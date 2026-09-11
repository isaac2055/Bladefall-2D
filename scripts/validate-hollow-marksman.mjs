import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FOLDER = resolve(ROOT, 'docs/charters/05-hollow-marksman/evidence/validation');
const OUTPUT = resolve(FOLDER, 'receipt.json');
const URL = process.env.BLADEFALL_URL || 'http://127.0.0.1:8877/index.html';
const source = await readFile(resolve(ROOT, 'public/index.html'), 'utf8');
const expectedVersion = source.match(/const VERSION='([^']+)'/)?.[1] || null;
const delay = (ms) => new Promise((done) => setTimeout(done, ms));

await mkdir(FOLDER, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  protocolTimeout: 60000,
  args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`); });

async function resetStage() {
  await page.evaluate(() => {
    mode = 'play';showOverlay(false);showGameUI(true);
    meta.capabilities = BFCapabilitiesModule.createState({ acquired: ['jump', 'weapon', 'dash', 'portal-single'] });
    window.__BF.reloadStage(4);
    const game = window.__BF.G;
    game.levelSelectMode = false;game.worldProgressEligible = true;game.sessionCapabilities = null;
    Object.assign(game.p, {
      hp: game.p.maxHp, dead: false, invuln: 9999,
      _restMouth: null, _tpCd: 0, vx: 0, vy: 0,
    });
    syncMovementCapabilities(game.p);syncPortalCapabilities();
  });
  await delay(100);
}

async function press(code) {
  await page.evaluate((key) => {
    window.__BF.input.pressed[key] = true;
    update(1 / 60);
    delete window.__BF.input.pressed[key];
  }, code);
  await delay(45);
}

async function standOnSlate(x) {
  await page.evaluate((targetX) => {
    const game = window.__BF.G;
    const slate = game.obstacles.find((object) => object.slate && object.type === 'plat' && Math.abs(object.x - targetX) < 5);
    Object.assign(game.p, { x: slate.x, y: slate.y, vx: 0, vy: 0, onGround: true, floorPlat: slate, _restMouth: null, _tpCd: 0 });
  }, x);
}

async function probeTopology() {
  await resetStage();
  return page.evaluate(() => {
    const game = window.__BF.G;
    const profile = BFPortalProgressionModule.profile(activeCapabilityProgress());
    const landmarks = game.obstacles.filter((object) => object.roomLandmark).map((object) => object.kind);
    const checks = game.obstacles.filter((object) => object.type === 'check').map((object) => object.x);
    const generic = game.obstacles.filter((object) => object.campaignComposition || object.cadenceBelt);
    const roles = game.enemies.filter((enemy) => !enemy.boss).map((enemy) => enemy.marksmanRole).filter(Boolean);
    return {
      name: 'five-room-linked-mouth-topology',
      pass: game.levelLength === 15000 && landmarks.join(',') === 'shotfall-camp,watching-road,mantlet-road,windcut-gallery,deadeye-court'
        && checks.includes(12100) && checks.length >= 7 && generic.length === 0 && game.geometryAudit.ok
        && profile.mode === 'single' && profile.maxPlayerMouths === 1 && !hasCapability('portal-pair')
        && new Set(roles).size === 3,
      levelLength: game.levelLength, landmarks, checkpoints: checks, genericObjects: generic.length,
      portalProfile: profile, roles: [...new Set(roles)], geometry: game.geometryAudit,
      expected: 'Five authored rooms, the one-mouth constitutional prefix, three authored enemy roles, and no generic coda objects.',
    };
  });
}

async function probeOpeningCrystalRoute() {
  await resetStage();
  return page.evaluate(() => {
    const game=window.__BF.G,p=game.p,keyboard=window.__BF.input,jumpCode=kbCode('jump');
    Object.assign(p,{x:70,y:0,vx:0,vy:0,dead:false,invuln:9999,onGround:true});
    keyboard.keys.ArrowRight=true;
    let westStarted=false,eastStarted=false,westRefilled=false,eastRefilled=false,jumpHold=0;
    for(let frame=0;frame<900&&p.x<1900&&!p.dead;frame++){
      let jump=false;
      if(!westStarted&&p.x>=930&&p.onGround){westStarted=true;jump=true;}
      else if(westStarted&&!westRefilled&&p.x<1120&&p.airRefill){westRefilled=true;jump=true;}
      else if(p.x>1250&&!eastStarted&&p.x>=1515&&p.onGround){eastStarted=true;jump=true;}
      else if(eastStarted&&!eastRefilled&&p.x<1710&&p.airRefill){eastRefilled=true;jump=true;}
      if(jump){keyboard.pressed[jumpCode]=true;jumpHold=24;}
      keyboard.keys[jumpCode]=jumpHold>0;
      update(1/60);keyboard.pressed[jumpCode]=false;if(jumpHold>0)jumpHold--;
    }
    keyboard.keys.ArrowRight=false;keyboard.keys[jumpCode]=false;
    const refills=game.obstacles.filter(object=>object.marksmanMantletRefill);
    return{
      name:'continuous-shotfall-crystal-route',
      pass:p.x>1770&&!p.dead&&westRefilled&&eastRefilled&&refills.length===2,
      player:{x:Math.round(p.x),y:Math.round(p.y),dead:p.dead},
      westRefilled,eastRefilled,
      refills:refills.map(object=>({x:object.x,y:object.y,for:object.refillFor})),
      expected:'From the entrance, two unsupported crystal touches restore one mid-air jump each and clear both mantlets without portals or wall-jump.',
    };
  });
}

async function probeAnchorContracts() {
  await resetStage();
  const rows = [];
  for (const lesson of [
    { slate: 3610, anchor: 'crossing' },
    { slate: 7200, anchor: 'arrow-release' },
    { slate: 9780, anchor: 'gallery' },
  ]) {
    await standOnSlate(lesson.slate);
    await press(await page.evaluate(() => kbCode('portal')));
    rows.push(await page.evaluate((expectedAnchor) => {
      const game = window.__BF.G, pair = portalPairs().find((entry) => entry.kind === 'anchored');
      const anchor = game.obstacles.find((object) => object.marksmanAnchor === expectedAnchor);
      const support = game.obstacles.some((object) => object.type === 'plat' && Math.abs(object.x - anchor.x) < object.w / 2 + 8 && Math.abs(object.y - anchor.y) < 8);
      return { anchor: expectedAnchor, mouths: game.cratePortals.length, pair: !!pair, distance: Math.round(Math.abs(anchor.x - game.p.x)), supported: support };
    }, lesson.anchor));
    await page.evaluate(() => clearPlacedPortals(false, 'validator-next-anchor'));
  }
  return {
    name: 'actual-input-anchored-placement',
    pass: rows.every((row) => row.mouths === 1 && row.pair && row.distance < 1500 && row.supported),
    rows,
    expected: 'The real portal key places exactly one mouth; every lesson resolves to a nearby, supported authored anchor.',
  };
}

async function probeRoadTarget() {
  await resetStage();
  const rejected = [];
  for (const packet of [
    { owner: 'enemy', sourceType: 'watchSniper', watchShot: true, reflected: false, portalHops: 0 },
    { owner: 'enemy', sourceType: 'watchSniper', watchShot: true, reflected: true, portalHops: 0 },
    { owner: 'player', sourceType: 'bow', watchShot: false, reflected: true, portalHops: 1 },
  ]) {
    rejected.push(await page.evaluate((raw) => {
      const game = window.__BF.G, target = game.obstacles.find((object) => object.marksmanTarget === 'road-release');
      resolveMarksmanTarget(target, { ...raw, life: 1 });return target.timer;
    }, packet));
  }
  await standOnSlate(7200);
  await press(await page.evaluate(() => kbCode('portal')));
  const natural = await page.evaluate(() => {
    const game=window.__BF.G,p=game.p;
    const sniper=game.enemies.find(enemy=>enemy.gateMechanismSniper);
    const mouth=game.cratePortals[0];let locked=false,spawned=false,hopped=false,minDistance=1e9,near=[];
    // Keep the bait beside the newly placed floor mouth for the lock frame. The
    // placement grace used by normal play prevents the placer from immediately
    // swallowing themself before the sniper commits.
    Object.assign(p,{x:7200,y:0,vx:0,vy:0,onGround:true,invuln:9999,_restMouth:mouth,_tpCd:999});
    sniper.watchCooldown=0;sniper.watchMoveT=0;sniper.railAimT=0;sniper.railAimX=null;sniper.railAimY=null;
    for(let frame=0;frame<360&&!circuitOpen('mantlet-release');frame++){
      update(1/60);
      if(sniper.railAimT>0&&!locked){locked=true;Object.assign(p,{x:7500,y:0,vx:0,vy:0,onGround:true,_restMouth:null,_tpCd:0});}
      const arrow=game.projectiles.find(projectile=>projectile.watchShot);
      if(arrow){spawned=true;minDistance=Math.min(minDistance,Math.hypot(arrow.x-mouth.x,arrow.y-mouth.y));
        if(Math.abs(arrow.x-mouth.x)<90&&near.length<12)near.push({x:Math.round(arrow.x),y:Math.round(arrow.y),vx:Math.round(arrow.vx),vy:Math.round(arrow.vy)});
        if((arrow.portalHops||0)>0)hopped=true;}
    }
    return{locked,spawned,hopped,sniperAlive:!sniper.dead,warded:sniper.gateMechanismSniper,
      mouth:{x:mouth.x,y:mouth.y,ori:mouth.ori},minDistance:Math.round(minDistance),near};
  });
  return page.evaluate((prior) => {
    const game = window.__BF.G, target = game.obstacles.find((object) => object.marksmanTarget === 'road-release');
    const door = game.obstacles.find((object) => object.type === 'door' && object.circuit === 'mantlet-release');
    return {
      name: 'portal-routed-watch-arrow-release',
      pass: prior.rejected.every((timer) => timer === 0) && prior.natural.locked && prior.natural.spawned &&
        prior.natural.hopped && prior.natural.sniperAlive && target.timer > 1e8 && doorOpen(door),
      rejectedTimers: prior.rejected, natural:prior.natural, validTimer: target.timer, doorOpen: doorOpen(door),
      expected: 'Direct, zero-hop, and player arrows fail; the live warded sniper locks, fires, and physically routes its renewable arrow through the linked mouth to open Mantlet Works.',
    };
  }, {rejected,natural});
}

async function probeMantletTurnWindow() {
  await resetStage();
  return page.evaluate(() => {
    const game=window.__BF.G,guard=game.enemies.find(enemy=>enemy.marksmanRole==='mantlet-guard');
    const player=game.p;guard.shieldFace=-1;guard.face=-1;guard.watchTurnT=guard.turnDelay;
    Object.assign(player,{x:guard.x+70,y:guard.y,vx:0,vy:0,invuln:9999});
    updateMarksmanRoadEnemy(guard,player,.2,100);
    const heldFacing=guard.shieldFace,hpBefore=guard.hp;
    hitEnemy(guard,1,1,0,0,null,'melee');const rearDamage=hpBefore-guard.hp;
    guard.hitFlash=0;guard._clangCd=0;
    for(let i=0;i<8;i++)updateMarksmanRoadEnemy(guard,player,.1,100);
    const turnedFacing=guard.shieldFace,hpAfterTurn=guard.hp;
    hitEnemy(guard,1,1,0,0,null,'melee');const frontDamage=hpAfterTurn-guard.hp;
    return{
      name:'mantlet-delayed-turn-flank-window',
      pass:heldFacing===-1&&rearDamage>0&&turnedFacing===1&&frontDamage===0,
      delay:guard.turnDelay,heldFacing,rearDamage,turnedFacing,frontDamage,
      expected:'Crossing a mantlet guard leaves its shield facing behind for 0.85 seconds, permitting a rear hit before the shield turns and blocks again.',
    };
  });
}

async function probeGalleryTransit() {
  await resetStage();await standOnSlate(9780);await press(await page.evaluate(() => kbCode('portal')));
  await page.evaluate(() => {
    const game = window.__BF.G, mouth = game.cratePortals[0];
    Object.assign(game.p, { x: mouth.x, y: mouth.y + 95, vx: 0, vy: -520, onGround: false, floorPlat: null, _restMouth: null, _tpCd: 0 });
  });
  await delay(850);
  return page.evaluate(() => {
    const game = window.__BF.G;
    const barriers = game.obstacles.filter((object) => object.linkedBarrier).map((object) => object.h);
    return {
      name: 'windcut-linked-transit-and-recovery',
      pass: game.p.x > 10600 && !game.p.dead && game.p.y >= 0 && barriers.every((height) => height >= 620),
      player: { x: Math.round(game.p.x), y: Math.round(game.p.y), dead: !!game.p.dead }, barriers,
      expected: 'A real one-mouth transit clears the gallery tower and exits over supported ground; both barriers exceed the current movement envelope.',
    };
  });
}

async function portalBreakRangefinder() {
  await standOnSlate(13540);
  await press(await page.evaluate(() => kbCode('portal')));
  await page.evaluate(() => {
    const game = window.__BF.G, mouth = game.cratePortals[0];game.p._restMouth = null;game.boss.shootT = 999;
    game.projectiles.push({ owner: 'enemy', sourceType: 'archer', markedRangeShot: true,
      x: mouth.x, y: mouth.y + 82, vx: 0, vy: -460, gravity: 0, size: 5,
      color: '#fff0a8', shape: 'arrow', glow: 1, dmg: 10, kb: 0, pierce: 0,
      el: null, life: 5, hitSet: [], isBoss: true });
  });
  await delay(900);
}

async function probeBossTransformation() {
  await resetStage();
  const deflected = await page.evaluate(() => { const boss = window.__BF.G.boss, hp = boss.hp;hitEnemy(boss, 80, -1, 0, 0, null, 'melee');return hp - boss.hp; });
  await portalBreakRangefinder();
  const atomic = await page.evaluate(() => {
    const game = window.__BF.G, boss = game.boss;
    return { broken: boss.rangefinderBroken, state: boss.marksmanState, gate: boss.portalGate,
      perchGone: game.obstacles.find((object) => object.marksmanPerch).gone,
      railsActive: game.obstacles.filter((object) => object.marksmanRailCover).every((object) => !object.gone && object.move),
      mouthsCleared: game.cratePortals.length === 0 };
  });
  await delay(500);
  const duel = await page.evaluate(() => {
    const game = window.__BF.G, boss = game.boss;boss.hp = boss.maxHp * .58;boss.rainT = 0;boss.marksmanLeapCd = 0;
    Object.assign(game.p, { x: boss.x - 170, y: 0, invuln: 9999 });return true;
  });
  await delay(420);
  const escalation = await page.evaluate(() => {
    const game = window.__BF.G, boss = game.boss;
    const first = { cover: game.obstacles.filter((object) => object.marksmanCoverTier === 1).every((object) => object.gone),
      rain: game.aoes.some((aoe) => aoe.type === 'arrowRain'), airborne: Math.abs(boss.vy || 0) > 20 || boss.y > 30 };
    boss.hp = boss.maxHp * .28;return first;
  });
  await delay(180);
  const secondCover = await page.evaluate(() => window.__BF.G.obstacles.filter((object) => object.marksmanCoverTier === 2).every((object) => object.gone));
  return {
    name: 'one-bank-three-phase-deadeye-court',
    pass: deflected === 0 && atomic.broken && atomic.perchGone && atomic.railsActive && atomic.mouthsCleared
      && atomic.state !== 'warded' && escalation.cover && escalation.rain && escalation.airborne && secondCover,
    directDamageBeforeBreak: deflected, atomic, escalation, secondCover, duel,
    expected: 'One physically banked marked arrow changes the fight once; pursuit, ground denial, elevation changes, and two cover collapses form later phases.',
  };
}

async function probeMarksmanPlatformGhost() {
  await resetStage();await portalBreakRangefinder();await delay(1250);
  return page.evaluate(() => {
    const game=window.__BF.G,boss=game.boss,raised=game.obstacles.find(object=>
      object.type==='plat'&&object.y===310&&Math.abs(object.x-13400)<5);
    const oldSpeed=boss.speed;
    game.aoes=game.aoes.filter(aoe=>aoe.type!=='arrowRain');
    Object.assign(boss,{x:raised.x,y:raised.y+230,vy:20,speed:0,marksmanLeapCd:999,
      shootT:0,rainT:9.8,phase:2,hp:boss.maxHp*.4});
    Object.assign(game.p,{x:boss.x-500,y:0,invuln:9999});
    let crossed=false,shotWhileAirborne=false,groundAttack=false;
    for(let frame=0;frame<240;frame++){
      const before=game.projectiles.length;update(1/60);
      if(boss.y<raised.y-4)crossed=true;
      if(boss.y>4&&game.projectiles.length>before)shotWhileAirborne=true;
      if(game.aoes.some(aoe=>aoe.type==='arrowRain'))groundAttack=true;
    }
    const noRainDuringLanding=!groundAttack;
    game.aoes=game.aoes.filter(aoe=>aoe.type!=='arrowRain');boss.rainT=9.8;
    for(let frame=0;frame<570;frame++)update(1/60);
    const rainBeforeHalfFrequency=game.aoes.some(aoe=>aoe.type==='arrowRain');
    for(let frame=0;frame<30;frame++)update(1/60);
    const rainAtHalfFrequency=game.aoes.some(aoe=>aoe.type==='arrowRain');
    boss.speed=oldSpeed;
    return{
      name:'marksman-raised-platform-pass-through',
      pass:boss.ignoreRaisedPlatforms&&crossed&&shotWhileAirborne&&noRainDuringLanding&&
        !rainBeforeHalfFrequency&&rainAtHalfFrequency&&boss.floorPlat&&boss.floorPlat.y===0,
      crossed,landedY:boss.y,floorY:boss.floorPlat&&boss.floorPlat.y,shotWhileAirborne,
      noRainDuringLanding,rainBeforeHalfFrequency,rainAtHalfFrequency,
      expected:'While enraged, the Marksman keeps airborne shots, passes through raised platforms, and produces ground rain only after the full 9.8-second half-frequency interval.',
    };
  });
}

async function probeCheckpointReset() {
  await resetStage();
  await page.evaluate(() => {
    const game = window.__BF.G;Object.assign(game.p, { x: 12100, y: 0, vx: 0, vy: 0, onGround: true });update(1 / 60);
  });
  await delay(120);await portalBreakRangefinder();
  await page.evaluate(() => { const game = window.__BF.G;game.p.invuln = 0;game.p.hp = 0;game.p.dead = true;die(); });
  await delay(180);
  return page.evaluate(() => {
    const game = window.__BF.G, lens = game.obstacles.find((object) => object.marksmanTarget === 'rangefinder');
    return {
      name: 'deadeye-threshold-full-reset',
      pass: game.stageIndex === 4 && Math.abs(game.p.x - 12100) < 4 && game.p.hp === game.p.maxHp
        && !game.boss.rangefinderBroken && game.boss.marksmanState === 'warded' && !lens.broken
        && game.cratePortals.length === 0 && game.projectiles.length === 0,
      x: game.p.x, hp: game.p.hp, maxHp: game.p.maxHp, state: game.boss.marksmanState,
      lensBroken: lens.broken, mouths: game.cratePortals.length, projectiles: game.projectiles.length,
      expected: 'Death returns to 12,100 with full Blood and a fresh lens, perch, rails, projectiles, and mouth state.',
    };
  });
}

async function probeVictoryAndSeams() {
  await resetStage();await portalBreakRangefinder();await delay(1500);
  const reward = await page.evaluate(() => {
    const game = window.__BF.G, boss = game.boss;boss.hp = 1;hitEnemy(boss, 5, -1, 0, 0, null, 'melee');
    const gate = game.obstacles.find((object) => object.type === 'door' && object.circuit === 'marksman-clearance');
    const profile=portalProgressionProfile();
    return { dead: boss.dead, pair: hasCapability('portal-pair'), gateOpenOnVictory: doorOpen(gate), portal: game.portal,
      portalMode:profile.mode,maxPlayerMouths:profile.maxPlayerMouths,
      blood: game.p.hp, maxBlood: game.p.maxHp, keyDrops: game.pickups.filter((item) => item.key).length,
      seam: physicalSeamSpec() };
  });
  const proof = await page.evaluate(() => {
    mode = 'play';showOverlay(false);showGameUI(true);
    const game = window.__BF.G;
    const slates = game.obstacles.filter((object) => object.secondMouthSlate && object.type === 'plat').sort((a, b) => a.x - b.x);
    clearPlacedPortals(false, 'validator-pair-proof');
    for (const slate of slates) {
      Object.assign(game.p, { x: slate.x, y: slate.y, vx: 0, vy: 0, onGround: true, floorPlat: slate, _tpCd: 0, _restMouth: null });
      window.__BF.placePlayerPortal();
    }
    const entry = game.cratePortals[0];
    Object.assign(game.p, { x: entry.x, y: entry.y - 2, vx: 260, vy: 0, onGround: false, floorPlat: null, _tpCd: 0, _restMouth: null });
    for (let frame = 0; frame < 18 && !game.secondMouthProved; frame++) update(1 / 60);
    const gate = game.obstacles.find((object) => object.type === 'door' && object.circuit === 'marksman-clearance');
    return { slates: slates.map((slate) => ({ x: slate.x, y: slate.y })), mouths: game.cratePortals.length,
      proved: !!game.secondMouthProved, persisted: !!meta.portalPairProved, gateOpen: doorOpen(gate) };
  });
  await page.evaluate(() => {
    const game = window.__BF.G;
    Object.assign(game.p, { x: game.levelLength - 45, y: 0, face: 1, vx: 0, vy: 0 });update(1 / 60);
  });
  await delay(650);
  const east = await page.evaluate(() => ({ stage: window.__BF.G.stageIndex, arrival: window.__BF.G.zoneArrival }));
  if (east.stage === 5) {
    await page.evaluate(() => { const game = window.__BF.G;Object.assign(game.p, { x: 45, y: 0, face: -1, vx: 0, vy: 0 });update(1 / 60); });
    await delay(650);
  }
  const west = await page.evaluate(() => ({ stage: window.__BF.G.stageIndex, arrival: window.__BF.G.zoneArrival }));
  return {
    name: 'portal-pair-reward-and-bidirectional-watch-gate',
    pass: reward.dead && reward.pair && reward.gateOpenOnVictory && reward.portalMode === 'pair'
      && reward.maxPlayerMouths === 2 && reward.portal === null && reward.keyDrops === 0
      && proof.slates.length === 2 && proof.mouths === 2 && proof.proved && proof.persisted && proof.gateOpen
      && reward.blood === reward.maxBlood && reward.seam?.connector === 'marksman-keep'
      && east.stage === 5 && west.stage === 4,
    reward, proof, east, west,
    expected: 'Victory immediately grants a live two-mouth pair, restores Blood, and opens the watch gate. The pale slates still accept both personal mouths as an optional lesson, and the physical seam crosses both directions.',
  };
}

async function probePeopleMemoryAndPresentation() {
  await resetStage();
  await page.evaluate(() => { meta.story = BFStoryModule.createProgress();persist();window.__BF.reloadStage(4); });
  for (const point of [{ x: 720, y: 0 }, { x: 2850, y: 0 }, { x: 11310, y: 610 }]) {
    await page.evaluate((position) => { Object.assign(window.__BF.G.p, { ...position, vx: 0, vy: 0, invuln: 9999 }); }, point);
    await press('ArrowUp');
  }
  return page.evaluate(() => {
    const game = window.__BF.G, residents = game.obstacles.filter((object) => object.type === 'ambientFigure');
    const memory = game.obstacles.find((object) => object.memoryId === 'watch-command-token');
    const forbidden = game.texts.filter((row) => ['SEEN', 'LOCK', 'MARKED SHOT', 'SHIFT', 'WARD BROKEN'].some((word) => String(row.txt).includes(word)));
    return {
      name: 'restrained-people-memory-and-immersive-signals',
      pass: residents.length === 2 && residents.every((resident) => resident.met)
        && meta.story.residentVisits.includes('marksman-fletcher') && meta.story.residentVisits.includes('marksman-veilmender')
        && memory.read && meta.story.memoriesRead.includes('watch-command-token') && forbidden.length === 0,
      residents: residents.map((resident) => ({ id: resident.residentId, met: resident.met })),
      memory: { read: memory.read, persisted: meta.story.memoriesRead.includes('watch-command-token') },
      forbiddenText: forbidden.map((row) => row.txt),
      expected: 'Up deliberately meets both workers and reads the optional command token; detection and boss-state labels remain absent.',
    };
  });
}

async function captureRooms() {
  await resetStage();
  const shots = [];
  for (const room of [
    ['01-shotfall-camp', 900, 0], ['02-watching-road', 4050, 120], ['03-mantlet-works', 7300, 80],
    ['04-windcut-gallery', 10400, 240], ['05-deadeye-court', 13650, 120],
  ]) {
    const [name, x, y] = room;
    await page.evaluate((position) => {
      const game = window.__BF.G;Object.assign(game.p, { x: position.x, y: position.y, vx: 0, vy: 0, invuln: 9999 });
      game.stageBanner=0;game.outskirtsAnnotation=null;game.outskirtsAnnotationPending=null;
      const toastNode=document.getElementById('toast');if(toastNode){toastNode.classList.remove('show');toastNode.innerHTML='';}
      game.cam = Math.max(0, Math.min(game.levelLength - 1280, position.x - 520));game.camY = Math.max(0, position.y - 160);BFCamera.sync(game.cam, game.camY);
    }, { x, y });
    await delay(90);
    const file = resolve(FOLDER, `${name}.png`);await page.screenshot({ path: file });shots.push(file.slice(ROOT.length + 1));
  }
  return shots;
}

try {
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.setBypassServiceWorker(true);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.__BF && window.__BF.VERSION, { timeout: 20000 });
  const servedVersion = await page.evaluate(() => window.__BF.VERSION);
  if (servedVersion !== expectedVersion) throw new Error(`Expected ${expectedVersion}, received ${servedVersion}.`);
  await page.evaluate(() => beginRun(0, null, { hp: 1, dmg: 1 }, { intro: false }));
  await page.click('canvas', { delay: 20 });await page.waitForFunction(() => window.__BF.G.time > 0, { timeout: 5000 });

  const probes = [];
  probes.push(await probeOpeningCrystalRoute());
  probes.push(await probeTopology());
  probes.push(await probeAnchorContracts());
  probes.push(await probeRoadTarget());
  probes.push(await probeMantletTurnWindow());
  probes.push(await probeGalleryTransit());
  probes.push(await probeBossTransformation());
  probes.push(await probeMarksmanPlatformGhost());
  probes.push(await probeCheckpointReset());
  probes.push(await probeVictoryAndSeams());
  probes.push(await probePeopleMemoryAndPresentation());
  const screenshots = await captureRooms();

  const receipt = {
    schema: 'bladefall.hollow-marksman-geometry-content-validation', version: 3,
    gameVersion: expectedVersion, url: URL,
    browserBridge: 'Version-verified project localhost Chromium runtime.',
    pageErrors, probes, screenshots,
    ok: pageErrors.length === 0 && probes.every((probe) => probe.pass),
    limitations: [
      'Actual-input placement, projectile transit, failure reset, rewards, and seams are automated; first-time human comprehension still requires a hands-on review.',
      'Single-player is the current design authority; co-op is intentionally deferred.',
    ],
  };
  await writeFile(OUTPUT, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
  if (!receipt.ok) process.exitCode = 1;
} finally {
  await browser.close();
}
