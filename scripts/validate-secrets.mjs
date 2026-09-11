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
  await page.waitForFunction(() => window.__BF?.secretState);
  const fresh = await page.evaluate(() => ({ version: window.__BF.VERSION, state: window.__BF.secretState(),
    legacy: window.__BF.secrets.migrate(null, { coins: { s0: true, s3: true, s13: true } }) }));
  assert.match(fresh.version, /^7\./);
  assert.equal(fresh.state.validation.ok, true);
  assert.deepEqual(fresh.state.progress.recovered, []);
  assert.deepEqual(fresh.legacy.state.recovered, ['sentinel-key', 'gale-key']);

  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)');
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF?.mode === 'play');
  await page.evaluate(() => {
    window.__BF.reloadStage(1);
    window.__BF.meta.capabilities.acquired = ['jump', 'weapon', 'dash'];
    window.__BF.meta.capabilities.revision++;
    let equipment = window.__BF.equipmentEconomy.acquireTool(window.__BF.meta.equipment, 'assessor-lens').state;
    equipment = window.__BF.equipmentEconomy.equipTool(equipment, 'assessor-lens').state;
    window.__BF.meta.equipment = equipment;
    const wall = { type: 'wall', x: 900, y: 0, w: 70, h: 110, vaultKeyId: 'root-key',
      secretVerb: 'dash-impact', landmarkId: 'old-root-seam', secretCue: 'A bruised knot.' };
    window.__BF.G.obstacles.push(wall);
    Object.assign(window.__BF.G.p, { x: 900, y: 0, dodgeTimer: 0, vx: 0, vy: 0, invuln: 1 });
    window.__secretWall = wall;
  });
  await page.keyboard.press('KeyR');
  await new Promise((resolve) => setTimeout(resolve, 150));
  const sighted = await page.evaluate(() => ({ marker: window.__BF.secretState().markers[0],
    reveal: window.__secretWall.toolRevealedT }));
  assert.equal(sighted.marker.status, 'sighted');
  assert.equal(sighted.marker.landmarkId, 'old-root-seam');
  assert.equal(sighted.reveal > 0, true);
  await page.evaluate(() => { window.__BF.G.p.dodgeTimer = 0.3; });
  await new Promise((resolve) => setTimeout(resolve, 250));
  const root = await page.evaluate(() => ({
    state: window.__BF.secretState(), wall: { gone: window.__secretWall.gone, used: window.__secretWall.used },
    tag: document.querySelector('#keyTag').textContent,
    saved: JSON.parse(localStorage.getItem('bladefall_v2')).secrets,
  }));
  assert.deepEqual(root.state.progress.recovered, ['root-key']);
  assert.deepEqual(root.wall, { gone: true, used: true });
  assert.match(root.tag, /1\/7/);
  assert.deepEqual(root.saved.recovered, ['root-key']);

  const complete = await page.evaluate(() => {
    let state = window.__BF.meta.secrets;
    for (const id of window.__BF.secrets.KEY_IDS) {
      const spec = window.__BF.secrets.keySpec(id);
      state = window.__BF.secrets.attempt(state, id, { zoneId: spec.zone, capabilities: spec.requirements,
        verb: spec.verb, evidence: true }).state;
    }
    window.__BF.meta.secrets = state;
    return { gateBeforeKing: window.__BF.secrets.vaultEligibility(state, { kingCleared: false }),
      gateAfterKing: window.__BF.secrets.vaultEligibility(state, { kingCleared: true }),
      traversal: window.__BF.zoneTraversalState(), state: window.__BF.secretState() };
  });
  assert.equal(complete.gateBeforeKing.reason, 'boss-clear-required');
  assert.equal(complete.gateAfterKing.allowed, true);
  assert.equal(complete.traversal.vaultKeys.length, 7);
  assert.equal(complete.state.progress.recovered.length, 7);
  assert.deepEqual(pageErrors, []);
  console.log(JSON.stringify({ ok: true, version: fresh.version,
    root: { recovered: root.state.progress.recovered, wall: root.wall, tag: root.tag },
    vault: complete.gateAfterKing, traversalKeys: complete.traversal.vaultKeys,
    diagnostics: complete.state.diagnostics }, null, 2));
} finally {
  await browser.close();
}
