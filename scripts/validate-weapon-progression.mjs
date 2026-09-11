import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://127.0.0.1:8877/index.html';
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
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function freshCampaign() {
  await page.evaluate(async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#newBtn'), { timeout: 20_000 });
  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)', { timeout: 10_000 });
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF?.mode === 'play' && window.__BF.G?.p, { timeout: 10_000 });
}

async function continueSavedRun() {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#contBtn'), { timeout: 20_000 });
  await page.click('#contBtn');
  await page.waitForFunction(() => window.__BF?.mode === 'play' && window.__BF.G?.p, { timeout: 10_000 });
}

try {
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });
  await page.setBypassServiceWorker(true);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await freshCampaign();

  const opening = await page.evaluate(() => ({
    version: window.__BF.VERSION,
    stage: window.__BF.G.stageIndex,
    weapon: window.__BF.G.p.weapon,
    state: window.__BF.weaponProgressionState(),
    attackDisabled: document.querySelector('#bAttack').getAttribute('aria-disabled'),
    attackLabel: document.querySelector('#bAttack').textContent,
    weaponLabel: document.querySelector('#weaponTag').textContent,
    lockedWeapons: window.__BF.G.pickups.filter((pickup) => pickup.weaponMemoryLocked).length,
  }));
  assert.equal(opening.stage, 0);
  assert.equal(opening.weapon, null);
  assert.equal(opening.state.profile.openingWeaponless, true);
  assert.equal(opening.attackDisabled, 'true');
  assert.equal(opening.attackLabel, 'UNARMED');
  assert.match(opening.weaponLabel, /UNARMED/);
  assert.equal(opening.lockedWeapons > 0, true);

  await page.keyboard.down('KeyW');
  await delay(120);
  await page.keyboard.up('KeyW');
  await delay(60);
  const blocked = await page.evaluate(() => ({
    weapon: window.__BF.G.p.weapon,
    attackTimer: window.__BF.G.p.atkTimer,
    projectiles: window.__BF.G.projectiles.length,
    blocked: window.__BF.weaponProgressionState().diagnostics.blockedAttacks,
  }));
  assert.equal(blocked.weapon, null);
  assert.equal(blocked.attackTimer, 0);
  assert.equal(blocked.projectiles, 0);
  assert.equal(blocked.blocked > 0, true);

  const woods = await page.evaluate(() => {
    window.__BF.reloadStage(1);
    const game = window.__BF.G;
    const acquisition = game.pickups.find((pickup) => pickup.acquisitionId === 'black-woods-oathblade');
    return {
      weapon: game.p.weapon,
      acquisition: acquisition && { x: acquisition.x, y: acquisition.y, name: acquisition.weapon.name },
      laterWeapons: game.pickups.filter((pickup) => pickup.weapon && !pickup.acquisitionId)
        .map((pickup) => ({ x: pickup.x, locked: pickup.weaponMemoryLocked })),
      nearestEnemy: Math.min(...game.enemies.map((enemy) => enemy.x)),
    };
  });
  assert.equal(woods.weapon, null);
  assert.deepEqual(woods.acquisition, { x: 1180, y: 10, name: 'Recovered Oathblade' });
  assert.equal(woods.laterWeapons.length > 0, true);
  assert.equal(woods.laterWeapons.every((weapon) => weapon.locked), true);
  assert.equal(woods.nearestEnemy > woods.acquisition.x + 1_000, true);
  if (process.env.BLADEFALL_WEAPON_SCREENSHOT) {
    await page.evaluate(() => Object.assign(window.__BF.G.p, { x: 930, y: 0, vx: 0, vy: 0, onGround: true }));
    await delay(150);
    await page.screenshot({ path: process.env.BLADEFALL_WEAPON_SCREENSHOT });
  }

  await page.evaluate(() => Object.assign(window.__BF.G.p, {
    x: 1180, y: 0, vx: 0, vy: 0, onGround: true, dead: false,
  }));
  await page.waitForFunction(() => window.__BF.hasCapability('weapon') && window.__BF.G.p.weapon?.arche === 'sword', { timeout: 2_000 });
  const acquired = await page.evaluate(() => ({
    stage: window.__BF.G.stageIndex,
    weapon: window.__BF.weaponProgressionState().weapon,
    profile: window.__BF.weaponProgressionState().profile,
    acquisitionRemaining: window.__BF.G.pickups.some((pickup) => pickup.acquisitionId === 'black-woods-oathblade'),
    laterLocked: window.__BF.G.pickups.filter((pickup) => pickup.weapon && !pickup.acquisitionId)
      .some((pickup) => pickup.weaponMemoryLocked),
    savedWeapon: window.__BF.meta.run?.p?.weapon,
    attackDisabled: document.querySelector('#bAttack').getAttribute('aria-disabled'),
  }));
  assert.equal(acquired.profile.mayAttack, true);
  assert.equal(acquired.weapon.name, 'Recovered Oathblade');
  assert.equal(acquired.weapon.bound, true);
  assert.equal(acquired.acquisitionRemaining, false);
  assert.equal(acquired.laterLocked, false);
  assert.equal(acquired.savedWeapon.name, 'Recovered Oathblade');
  assert.equal(acquired.attackDisabled, 'false');

  await continueSavedRun();
  const persisted = await page.evaluate(() => ({
    stage: window.__BF.G.stageIndex,
    weapon: window.__BF.G.p.weapon,
    capability: window.__BF.hasCapability('weapon'),
    acquisitionPresent: window.__BF.G.pickups.some((pickup) => pickup.acquisitionId === 'black-woods-oathblade'),
  }));
  assert.equal(persisted.stage, 1);
  assert.equal(persisted.weapon.name, 'Recovered Oathblade');
  assert.equal(persisted.capability, true);
  assert.equal(persisted.acquisitionPresent, false);

  await page.evaluate(() => {
    const game = window.__BF.G;
    const enemy = game.enemies.find((entry) => !entry.dead);
    Object.assign(game.p, { x: 2500, y: 0, vx: 0, vy: 0, onGround: true, face: 1 });
    game.p.weapon.crit = 0.75;
    Object.assign(enemy, {
      x: 2530, y: 0, hp: 10_000, maxHp: 10_000, active: true,
      speed: 0, dmg: 0, freezeT: 999, dead: false,
    });
  });
  for (let attempt = 0; attempt < 12; attempt++) {
    await page.keyboard.down('KeyW');
    await delay(70);
    await page.keyboard.up('KeyW');
    await delay(430);
    const criticals = await page.evaluate(() => window.__BF.weaponProgressionState().diagnostics.criticals);
    if (criticals > 0) break;
  }
  const combat = await page.evaluate(() => ({
    attacks: window.__BF.G.p.swingId,
    criticals: window.__BF.weaponProgressionState().diagnostics.criticals,
    critKind: window.__BF.G.critFx.at(-1)?.kind,
    durability: window.__BF.G.p.weapon.dur,
    maximum: window.__BF.G.p.weapon.maxDur,
  }));
  assert.equal(combat.attacks > 0, true);
  assert.equal(combat.criticals > 0, true);
  assert.equal(combat.critKind, 'crossSlash');
  assert.equal(combat.durability, combat.maximum);

  await page.evaluate(() => { window.__BF.meta.gold = 2_000; });
  await page.keyboard.press('Escape');
  await page.waitForSelector('#forgeBtn');
  await page.click('#forgeBtn');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-f]')].some((button) => button.textContent.includes('Temper')));
  await page.evaluate(() => [...document.querySelectorAll('[data-f]')].find((button) => button.textContent.includes('Temper')).click());
  await page.waitForFunction(() => window.__BF.G.p.weapon.temper === 1);
  const tempered = await page.evaluate(() => ({
    temper: window.__BF.G.p.weapon.temper,
    damage: window.__BF.G.p.weapon.dmg,
    savedTemper: window.__BF.meta.run.p.weapon.temper,
  }));
  assert.deepEqual(tempered, { temper: 1, damage: 12.1, savedTemper: 1 });

  await page.evaluate(() => [...document.querySelectorAll('[data-f]')].find((button) => button.textContent.includes('Ascend')).click());
  await page.waitForFunction(() => window.__BF.G.p.weapon.rarity === 'uncommon');
  const reforged = await page.evaluate(() => ({
    rarity: window.__BF.G.p.weapon.rarity,
    temper: window.__BF.G.p.weapon.temper,
    crit: window.__BF.G.p.weapon.crit,
    saved: window.__BF.meta.run.p.weapon,
  }));
  assert.equal(reforged.rarity, 'uncommon');
  assert.equal(reforged.temper, 1);
  assert.equal(reforged.crit, 0.75);
  assert.equal(reforged.saved.rarity, 'uncommon');
  assert.equal(reforged.saved.temper, 1);

  await continueSavedRun();
  const final = await page.evaluate(() => ({
    weapon: window.__BF.G.p.weapon,
    validation: window.__BF.weaponProgressionState().validation,
    errors: window.__errs || [],
  }));
  assert.equal(final.weapon.rarity, 'uncommon');
  assert.equal(final.weapon.temper, 1);
  assert.equal(final.weapon.crit, 0.75);
  assert.equal(final.validation.ok, true);
  assert.deepEqual(final.errors, []);
  assert.deepEqual(pageErrors, []);

  console.log(JSON.stringify({
    ok: true,
    version: opening.version,
    opening: { weapon: opening.weapon, attackDisabled: opening.attackDisabled, blockedAttacks: blocked.blocked },
    acquisition: { stage: acquired.stage, weapon: acquired.weapon.name, saved: acquired.savedWeapon.name },
    combat,
    upgrade: { temper: final.weapon.temper, rarity: final.weapon.rarity, damage: final.weapon.dmg, crit: final.weapon.crit },
  }, null, 2));
} finally {
  await browser.close();
}
