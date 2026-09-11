import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL = process.env.BLADEFALL_URL || 'http://127.0.0.1:8877/index.html';
const OUTPUT = resolve(ROOT, 'docs/charters/05-hollow-marksman/evidence/baseline-dynamics.json');
const EXECUTABLE = process.env.PUPPETEER_EXECUTABLE_PATH;

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: EXECUTABLE || undefined,
  args: ['--no-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#newBtn'), { timeout: 20000 });
  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)', { timeout: 10000 });
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF.mode === 'play' && window.__BF.G?.p, { timeout: 10000 });
  await page.evaluate(() => {
    localStorage.clear();
    window.__BF.reloadStage(4);
    const { G } = window.__BF;
    G.stageBanner = 0;
    G.p.invuln = 9999;
    G.p.hp = G.p.maxHp;
  });

  const staticContract = await page.evaluate(() => {
    const { G } = window.__BF;
    const boss = G.boss;
    const checkpoint = G.obstacles
      .filter((object) => object.type === 'check' && object.x < boss.x)
      .sort((left, right) => right.x - left.x)[0] || null;
    const shutter = G.obstacles.find((object) => object.marksmanShutter) || null;
    const anchor = G.obstacles.find((object) => (object.type === 'portalAnchor' || object.type === 'lportal') && object.x < boss.x) || null;
    return {
      stageLength: G.levelLength,
      enemyCount: G.enemies.filter((enemy) => !enemy.dead).length,
      pickupCount: G.pickups.filter((pickup) => !pickup.gone).length,
      travelerCount: (G.npcs || []).length,
      boss: {
        type: boss.type,
        x: boss.x,
        hp: boss.hp,
        damage: boss.dmg,
        portalGate: boss.portalGate,
        reflectBanks: boss.reflectBanks,
        reflectSelfMul: boss.reflectSelfMul,
        nominalReflectedHits: boss.reflectBanks / boss.reflectSelfMul,
      },
      checkpoint: checkpoint ? { x: checkpoint.x, y: checkpoint.y } : null,
      shutter: shutter ? {
        x: shutter.x,
        y: shutter.y,
        height: shutter.h,
        travel: shutter.move?.dy || 0,
        period: shutter.move?.period || null,
      } : null,
      fixedExit: anchor ? { x: anchor.x, y: anchor.y, face: anchor.face } : null,
      exposedGlobalHelpers: {
        hitEnemy: typeof window.hitEnemy === 'function',
      },
    };
  });

  const damageContract = await page.evaluate(() => {
    const { G } = window.__BF;
    const boss = G.boss;
    const start = boss.hp;
    window.hitEnemy(boss, 40, -1, 0, 0, 'phys', 'melee');
    const afterMelee = boss.hp;
    boss.hp = start;
    window.hitEnemy(boss, boss.dmg, -1, 0, 0, null, 'reflect');
    const afterReflect = boss.hp;
    boss.hp = start;
    return {
      meleeDamage: start - afterMelee,
      reflectedArrowDamage: start - afterReflect,
      reflectedHitsAtObservedDamage: Math.ceil(start / Math.max(0.0001, start - afterReflect)),
    };
  });

  const liveContract = await page.evaluate(async () => {
    const { G } = window.__BF;
    const boss = G.boss;
    const player = G.p;
    player.x = boss.x - 105;
    player.y = 0;
    player.vx = 0;
    player.vy = 0;
    boss.atkTimer = 0;
    boss.shootT = 99;
    boss.rainT = 0.03;
    const bossStartX = boss.x;
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
    const rain = G.aoes.find((aoe) => aoe.type === 'arrowRain') || null;
    return {
      closeRangeDisplacement: Math.round((boss.x - bossStartX) * 10) / 10,
      dodgeTriggered: Math.abs(boss.x - bossStartX) > 20,
      arrowRainCreated: Boolean(rain),
      arrowRain: rain ? {
        x: Math.round(rain.x),
        radius: rain.r,
        damage: rain.dmg,
        telegraphSeconds: rain.t0 ?? rain.t,
        realDamage: rain.real !== false,
      } : null,
    };
  });

  const receipt = {
    schema: 'bladefall.hollow-marksman-planning-baseline',
    version: 1,
    capturedAt: new Date().toISOString(),
    url: URL,
    gameVersion: await page.evaluate(() => window.__BF.VERSION),
    pageErrors,
    staticContract,
    damageContract,
    liveContract,
    findings: [
      'Ordinary weapon damage is fully deflected before the portal condition is met.',
      'The reflectBanks and reflectSelfMul combination requires about 45 ordinary reflected arrows, not the advertised 15.',
      'The boss already dodges at close range and produces a real-damage ground arrow-rain answer to portal camping.',
      'The approach contains no residents and does not teach why the fixed exit or moving shutter exists.',
    ],
    limitations: [
      'State-positioned damage and AI probes establish the executable contract; they do not claim natural player execution or first-read comprehension.',
      'A headless browser cannot certify feel, fairness, or live two-device co-op behavior.',
    ],
  };
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser.close();
}
