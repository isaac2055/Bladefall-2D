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
  await page.waitForFunction(() => window.__BF?.reactions && window.__BF?.react);
  const result = await page.evaluate(() => {
    const fireVsIce = window.__BF.react(
      { element: 'fire', delivery: 'weapon', owner: 'player', power: 20 },
      { kind: 'enemy', element: 'ice', boss: true },
    );
    const water = {};
    const frozen = window.__BF.react(
      { element: 'ice', delivery: 'projectile', owner: 'player' },
      { kind: 'fluid', material: 'water' },
    );
    const stateReceipt = window.__BF.reactions.applyState(water, frozen.receipt);
    const air = window.__BF.react(
      { element: 'storm', delivery: 'projectile', owner: 'player' },
      { kind: 'air' },
    );
    const blocked = window.__BF.react(
      { element: 'void', delivery: 'projectile', owner: 'player' },
      { kind: 'air' },
    );
    return {
      version: window.__BF.VERSION,
      fireVsIce,
      frozen,
      stateReceipt,
      state: window.__BF.reactions.activeState(water),
      air,
      blocked,
      diagnostics: window.__BF.reactionState(),
      runtime: {
        reactions: !!window.BladefallReactions,
        interactionFire: window.__BF.interactions.reactionFor('fire', { type: 'wind' })?.id,
      },
    };
  });
  assert.match(result.version, /^7\./);
  assert.equal(result.fireVsIce.receipt.damageMultiplier, 1.5);
  assert.equal(result.fireVsIce.receipt.bossDurationMultiplier, 0.5);
  assert.equal(result.frozen.receipt.id, 'flash-freeze');
  assert.equal(result.stateReceipt.fresh, true);
  assert.equal(result.state.id, 'flash-freeze');
  assert.equal(result.air.receipt.id, 'stormstream');
  assert.equal(result.blocked.reason, 'no-explicit-reaction');
  assert.equal(result.diagnostics.attempts, 4);
  assert.equal(result.diagnostics.resolved, 3);
  assert.equal(result.diagnostics.blocked, 1);
  assert.equal(result.runtime.reactions, true);
  assert.equal(result.runtime.interactionFire, 'firestream');

  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)');
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF?.mode === 'play');
  const beforeCombat = await page.evaluate(() => window.__BF.reactionState().resolved);
  await page.evaluate(() => {
    window.__BF.reloadStage(1);
    let equipment = window.__BF.equipmentEconomy.acquireTool(window.__BF.meta.equipment, 'cinder-capsule').state;
    equipment = window.__BF.equipmentEconomy.equipTool(equipment, 'cinder-capsule').state;
    window.__BF.meta.equipment = equipment;
    const enemy = window.__BF.G.enemies.find((candidate) => !candidate.dead && !candidate.boss);
    for (const other of window.__BF.G.enemies) if (other !== enemy) other.x += 4000;
    Object.assign(enemy, { x: 900, y: 0, vx: 0, vy: 0, portalSentry: null, portalGate: null, frontShield: false });
    Object.assign(window.__BF.G.p, { x: 900, y: 0, vx: 0, vy: 0, invuln: 2 });
  });
  await page.keyboard.press('KeyR');
  await new Promise((resolve) => setTimeout(resolve, 500));
  const combat = await page.evaluate(() => ({
    diagnostics: window.__BF.reactionState(),
    toolUses: window.__BF.equipmentState().diagnostics.toolUses,
    mode: window.__BF.mode,
  }));
  assert.equal(combat.mode, 'play');
  assert.equal(combat.toolUses, 1);
  assert.equal(combat.diagnostics.resolved > beforeCombat, true);
  assert.equal((combat.diagnostics.byTarget.enemy || 0) > 1, true);
  assert.deepEqual(pageErrors, []);
  console.log(JSON.stringify({ ok: true, ...result, combat }, null, 2));
} finally {
  await browser.close();
}
