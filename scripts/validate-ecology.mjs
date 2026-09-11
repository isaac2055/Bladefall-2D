import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://127.0.0.1:8877/index.html';
const browser = await puppeteer.launch({ headless: true, args: ['--disable-background-timer-throttling'] });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`); });

try {
  await page.setBypassServiceWorker(true);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF?.ecologyState);
  const authority = await page.evaluate(() => ({
    version: window.__BF.VERSION,
    state: window.__BF.ecologyState(),
    storm: window.__BF.ecology.profile('stormmote'),
    pit: window.__BF.ecology.hazardPolicy({ type: 'grunt' }, 'pit'),
  }));
  assert.match(authority.version, /^7\./);
  assert.equal(authority.state.validation.ok, true);
  assert.equal(authority.state.validation.ordinary, 14);
  assert.equal(authority.storm.habitats.includes('updraft'), true);
  assert.equal(authority.pit.response, 'recover-safe-ground');

  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)');
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF?.mode === 'play');
  await page.evaluate(() => {
    window.__BF.reloadStage(1);
    window.__BF.meta.testMode = true;
    let equipment = window.__BF.equipmentEconomy.acquireTool(window.__BF.meta.equipment, 'cinder-capsule').state;
    equipment = window.__BF.equipmentEconomy.equipTool(equipment, 'cinder-capsule').state;
    window.__BF.meta.equipment = equipment;
    const enemies = window.__BF.G.enemies.filter((enemy) => !enemy.boss);
    const target = enemies[0];
    for (const enemy of enemies.slice(1)) enemy.x += 4000;
    Object.assign(target, { x: 900, y: 0, vx: 0, vy: 0, elite: { key: 'validation' },
      portalSentry: null, portalGate: null, frontShield: false });
    Object.assign(window.__BF.G.p, { x: 900, y: 0, vx: 0, vy: 0, invuln: 2 });
  });
  const before = await page.evaluate(() => window.__BF.equipmentState().progress.materials);
  await page.keyboard.press('KeyR');
  await new Promise((resolve) => setTimeout(resolve, 500));
  const combat = await page.evaluate(() => ({
    ecology: window.__BF.ecologyState(),
    materials: window.__BF.equipmentState().progress.materials,
    remaining: window.__BF.G.enemies.filter((enemy) => !enemy.dead).length,
    profiles: window.__BF.G.enemies.filter((enemy) => !enemy.boss).map((enemy) => enemy.ecology),
  }));
  assert.equal(combat.ecology.diagnostics.killed >= 1, true);
  assert.equal(combat.ecology.diagnostics.materialDrops >= 1, true);
  assert.equal(Object.values(combat.materials).reduce((sum, value) => sum + value, 0)
    > Object.values(before).reduce((sum, value) => sum + value, 0), true);
  assert.equal(combat.profiles.every((profile) => profile && profile.role && profile.material), true);
  await page.evaluate(() => {
    const enemy = window.__BF.G.enemies.find((candidate) => !candidate.dead && !candidate.boss && candidate.kind !== 'fly');
    Object.assign(enemy, { x: 1100, y: -100, safeX: 1000, safeY: 0, vx: 0, vy: 0, active: false });
  });
  await new Promise((resolve) => setTimeout(resolve, 250));
  const recovered = await page.evaluate(() => ({
    diagnostics: window.__BF.ecologyState().diagnostics,
    enemy: window.__BF.G.enemies.find((candidate) => !candidate.dead && !candidate.boss && candidate.kind !== 'fly'),
  }));
  assert.equal(recovered.diagnostics.pitRecoveries >= 1, true);
  assert.equal(recovered.enemy.y >= 0, true);
  assert.deepEqual(pageErrors, []);
  console.log(JSON.stringify({ ok: true, ...authority,
    combat: { diagnostics: combat.ecology.diagnostics, materials: combat.materials, remaining: combat.remaining,
      pitRecoveries: recovered.diagnostics.pitRecoveries } }, null, 2));
} finally {
  await browser.close();
}
