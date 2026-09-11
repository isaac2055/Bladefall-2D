import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://127.0.0.1:8877/index.html';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
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

function portalState() {
  return page.evaluate(() => ({
    state: window.__BF.portalProgressionState(),
    mouths: window.__BF.G.cratePortals.length,
    portalButton: document.querySelector('#bPortal')?.getAttribute('aria-disabled'),
    portalTag: document.querySelector('#portalTag')?.textContent.trim(),
  }));
}

async function installSlateAndPlayer(x = 500) {
  await page.evaluate((targetX) => {
    const game = window.__BF.G;
    const slate = { type: 'plat', x: targetX, y: 0, w: 240, h: 16, slate: 1 };
    game.obstacles.push(slate);
    Object.assign(game.p, {
      x: targetX, y: 0, vx: 0, vy: 0, onGround: true, onWall: false,
      floorPlat: slate, _tpCd: 0, _restMouth: null,
    });
  }, x);
  await delay(80);
}

async function placeOnFreshSlate(x) {
  return page.evaluate((targetX) => {
    const game = window.__BF.G;
    const slate = { type: 'plat', x: targetX, y: 0, w: 240, h: 16, slate: 1 };
    game.obstacles.push(slate);
    Object.assign(game.p, {
      x: targetX, y: 0, vx: 0, vy: 0, onGround: true, onWall: false,
      floorPlat: slate, _tpCd: 0, _restMouth: null,
    });
    return window.__BF.placePlayerPortal();
  }, x);
}

try {
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });
  await page.setBypassServiceWorker(true);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF?.VERSION, { timeout: 20_000 });
  await freshCampaign();

  await page.evaluate(() => {
    window.__BF.G.lportals = {};
    window.__BF.clearPlayerPortals(false, 'validation-reset');
  });
  await installSlateAndPlayer();
  const blocked = await page.evaluate(() => window.__BF.placePlayerPortal());
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'portal-memory-locked');
  let view = await portalState();
  assert.equal(view.mouths, 0);
  assert.equal(view.portalButton, 'true');
  assert.equal(view.state.profile.mode, 'none');

  const fixedBefore = await page.evaluate(() => {
    const game = window.__BF.G;
    const a = { type: 'lportal', x: 520, y: 2, pg: 'n08-fixed', nx: 1, ny: 0, portalLesson: 'fixed', col: '#b06bff', t: 0 };
    const b = { type: 'lportal', x: 980, y: 2, pg: 'n08-fixed', nx: 1, ny: 0, portalLesson: 'fixed', col: '#b06bff', t: 0 };
    game.lportals = { 'n08-fixed': [a, b] };
    game.obstacles.push(a, b);
    Object.assign(game.p, { x: a.x, y: 0, vx: 220, vy: 0, _tpCd: 0, _restMouth: null, onGround: false });
    return window.__BF.portalProgressionState();
  });
  assert.deepEqual(fixedBefore.activePairs, [{ id: 'fixed:n08-fixed', kind: 'fixed' }]);
  await page.waitForFunction(() => window.__BF.G.p.x > 900, { timeout: 2_000 });
  const fixedAfter = await page.evaluate(() => ({
    x: window.__BF.G.p.x,
    system: window.__BF.portalState(),
    progression: window.__BF.portalProgressionState(),
  }));
  assert.equal(fixedAfter.system.last.pairId, 'fixed:n08-fixed');
  assert.equal(fixedAfter.progression.diagnostics.fixedTransits > 0, true);

  await page.evaluate(() => {
    window.__BF.G.lportals = {};
    window.__BF.clearPlayerPortals(false, 'validation-reset');
    window.__BF.meta.capabilities = window.__BF.capabilities.createState({
      acquired: ['jump', 'weapon', 'dash', 'portal-single'],
    });
  });
  await installSlateAndPlayer(600);
  const singleWithoutAnchor = await page.evaluate(() => window.__BF.placePlayerPortal());
  assert.equal(singleWithoutAnchor.allowed, false);
  assert.equal(singleWithoutAnchor.reason, 'fixed-counterpart-required');

  await page.evaluate(() => {
    const game = window.__BF.G;
    const anchor = { type: 'lportal', x: 900, y: 0, pg: 'n08-anchor', nx: 1, ny: 0, anchor: 1, col: '#ff9a3b', t: 0 };
    game.lportals = { 'n08-anchor': [anchor] };
    game.obstacles.push(anchor);
  });
  await delay(80);
  const singleFirst = await page.evaluate(() => window.__BF.placePlayerPortal());
  assert.equal(singleFirst.action, 'add');
  view = await portalState();
  assert.equal(view.mouths, 1);
  assert.deepEqual(view.state.activePairs, [{ id: 'anchor:n08-anchor', kind: 'anchored' }]);
  assert.equal(view.portalButton, 'false');

  await installSlateAndPlayer(720);
  const singleSecond = await page.evaluate(() => window.__BF.placePlayerPortal());
  assert.equal(singleSecond.action, 'replace');
  const replacement = await page.evaluate(() => ({
    mouths: window.__BF.G.cratePortals.map((mouth) => ({ x: mouth.x, ownership: mouth.ownership })),
    diagnostics: window.__BF.portalProgressionState().diagnostics,
  }));
  assert.deepEqual(replacement.mouths, [{ x: 720, ownership: 'single' }]);
  assert.equal(replacement.diagnostics.replacements > 0, true);

  await page.evaluate(() => {
    const game = window.__BF.G;
    const entry = game.cratePortals[0];
    Object.assign(game.p, { x: entry.x, y: entry.y - 2, vx: 230, vy: 0, onGround: false, _tpCd: 0, _restMouth: null });
  });
  await page.waitForFunction(() => window.__BF.portalProgressionState().diagnostics.anchoredTransits > 0, { timeout: 2_000 });
  const anchoredAfter = await page.evaluate(() => ({
    x: window.__BF.G.p.x,
    system: window.__BF.portalState(),
    progression: window.__BF.portalProgressionState(),
  }));
  assert.equal(anchoredAfter.system.last.pairId, 'anchor:n08-anchor');
  assert.deepEqual(anchoredAfter.system.last.exit, { x: 900, y: 0 });
  assert.equal(anchoredAfter.progression.diagnostics.anchoredTransits > 0, true);

  await page.evaluate(() => {
    window.__BF.G.lportals = {};
    window.__BF.clearPlayerPortals(false, 'validation-reset');
    window.__BF.meta.capabilities = window.__BF.capabilities.createState({
      acquired: ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair'],
    });
  });
  assert.equal((await placeOnFreshSlate(500)).action, 'add');
  assert.equal((await placeOnFreshSlate(900)).action, 'add');
  await delay(80);
  view = await portalState();
  assert.equal(view.mouths, 2);
  assert.deepEqual(view.state.activePairs, [{ id: 'player-pair', kind: 'personal' }]);
  assert.equal(view.portalButton, 'false');
  assert.equal(await page.evaluate(() => document.querySelector('#bPortal').textContent), '×');

  const third = await page.evaluate(() => window.__BF.placePlayerPortal());
  assert.equal(third.action, 'clear');
  view = await portalState();
  assert.equal(view.mouths, 0);
  assert.equal(view.state.activePairs.length, 0);

  await placeOnFreshSlate(500);
  await placeOnFreshSlate(900);
  await page.evaluate(() => {
    const game = window.__BF.G;
    const entry = game.cratePortals[0];
    Object.assign(game.p, { x: entry.x, y: entry.y - 2, vx: 260, vy: 0, onGround: false, _tpCd: 0, _restMouth: null });
  });
  await page.waitForFunction(() => window.__BF.portalProgressionState().diagnostics.personalTransits > 0, { timeout: 2_000 });
  const personalAfter = await page.evaluate(() => ({
    x: window.__BF.G.p.x,
    system: window.__BF.portalState(),
    progression: window.__BF.portalProgressionState(),
  }));
  assert.equal(personalAfter.x > 850, true);
  assert.equal(personalAfter.system.last.pairId, 'player-pair');
  assert.equal(personalAfter.progression.diagnostics.personalTransits > 0, true);

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({
    ok: true,
    version: await page.evaluate(() => window.__BF.VERSION),
    fixedTransit: fixedAfter.system.last,
    anchoredTransit: anchoredAfter.system.last,
    personalTransit: personalAfter.system.last,
    diagnostics: personalAfter.progression.diagnostics,
  }, null, 2));
} finally {
  await browser.close();
}
