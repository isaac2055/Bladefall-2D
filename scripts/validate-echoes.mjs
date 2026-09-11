import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://127.0.0.1:8877/index.html';
const browser = await puppeteer.launch({ headless: true, args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`); });
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

try {
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });
  await page.setBypassServiceWorker(true);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.evaluate(async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) await Promise.all((await navigator.serviceWorker.getRegistrations()).map((registration) => registration.unregister()));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#newBtn'));
  await page.click('#newBtn');
  await page.waitForSelector('#cutSkip:not(.hide)');
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF?.mode === 'play');

  const fresh = await page.evaluate(() => ({ version: window.__BF.VERSION, state: window.__BF.echoState(), tag: document.querySelector('#echoTag').style.display }));
  assert.equal(fresh.state.validation.ok, true);
  assert.deepEqual(fresh.state.progress.owned, []);
  assert.deepEqual(fresh.state.profile, { capacity: 2, used: 0, free: 2, owned: 0, equipped: 0, maxEquipped: 4 });
  assert.equal(fresh.tag, 'none');

  const brute = await page.evaluate(() => {
    window.__BF.reloadStage(2);
    window.__BF.grantEchoReward({ type: 'boss:defeated', boss: 'brute' });
    return { state: window.__BF.echoState(), mods: window.__BF.G.p.mods, tag: document.querySelector('#echoTag').textContent };
  });
  assert.deepEqual(brute.state.progress.equipped, ['fault-bell']);
  assert.equal(brute.state.profile.used, 2);
  assert.equal(brute.mods.shockwave, true);
  assert.match(brute.tag, /2\/2/);

  await page.evaluate(() => Object.assign(window.__BF.G.p, { x: window.__BF.G.zoneRestSite.x + 250, y: 0 }));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__BF.mode === 'pause' && document.querySelector('#echoLoomBtn'));
  await page.click('#echoLoomBtn');
  const away = await page.$eval('[data-echo="fault-bell"]', (button) => ({ disabled: button.disabled, text: button.textContent }));
  assert.equal(away.disabled, true);
  assert.match(away.text, /EQUIPPED/);
  await page.click('#echoBack');
  await page.click('#resBtn');

  await page.evaluate(() => {
    window.__BF.grantEchoReward({ type: 'boss:defeated', boss: 'archer' });
    window.__BF.grantEchoReward({ type: 'quest:completed', questId: 'kindling-the-sky' });
    Object.assign(window.__BF.G.p, { x: window.__BF.G.zoneRestSite.x, y: window.__BF.G.zoneRestSite.y });
  });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__BF.mode === 'pause' && document.querySelector('#echoLoomBtn'));
  await page.click('#echoLoomBtn');
  const atRest = await page.$eval('[data-echo="fault-bell"]', (button) => button.disabled);
  assert.equal(atRest, false);
  await page.click('[data-echo="fault-bell"]');
  await page.waitForFunction(() => !window.__BF.echoState().progress.equipped.includes('fault-bell'));
  await page.click('[data-echo="sky-kindling"]');
  await page.waitForFunction(() => window.__BF.echoState().progress.equipped.includes('sky-kindling'));
  if (process.env.BLADEFALL_ECHO_SCREENSHOT) await page.screenshot({ path: process.env.BLADEFALL_ECHO_SCREENSHOT });
  const woven = await page.evaluate(() => ({ state: window.__BF.echoState(), mods: window.__BF.G.p.mods }));
  assert.deepEqual(woven.state.progress.equipped, ['far-thread', 'sky-kindling']);
  assert.equal(woven.state.profile.used, 3);
  assert.equal(woven.mods.shockwave, false);
  assert.equal(woven.mods.pierce, true);
  await page.click('#echoBack');
  await page.click('#resBtn');

  await page.evaluate(() => {
    let state = window.__BF.equipmentEconomy.acquireTool(window.__BF.meta.equipment, 'cinder-capsule').state;
    state = window.__BF.equipmentEconomy.equipTool(state, 'cinder-capsule').state;
    window.__BF.meta.equipment = state;
  });
  await page.keyboard.press('KeyR');
  await delay(120);
  const toolHook = await page.evaluate(() => ({
    aoe: window.__BF.G.aoes.at(-1), echo: window.__BF.echoState(), equipment: window.__BF.equipmentState(), savedEchoes: JSON.parse(localStorage.getItem('bladefall_v2')).echoes,
  }));
  assert.equal(toolHook.aoe.r, 125);
  assert.equal(toolHook.aoe.t > 2, true);
  assert.equal(toolHook.echo.diagnostics.hooks > 0, true);
  assert.equal(toolHook.equipment.progress.charges['cinder-capsule'], 2);
  assert.deepEqual(toolHook.savedEchoes.equipped, ['far-thread', 'sky-kindling']);

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#contBtn'));
  await page.click('#contBtn');
  await page.waitForFunction(() => window.__BF?.mode === 'play');
  const persisted = await page.evaluate(() => ({ state: window.__BF.echoState(), mods: window.__BF.G.p.mods, errors: window.__errs || [] }));
  assert.deepEqual(persisted.state.progress.equipped, ['far-thread', 'sky-kindling']);
  assert.equal(persisted.mods.pierce, true);
  assert.equal(persisted.mods.shockwave, false);
  assert.deepEqual(persisted.errors, []);
  assert.deepEqual(pageErrors, []);

  console.log(JSON.stringify({
    ok: true, version: fresh.version,
    acquired: persisted.state.progress.owned,
    equipped: persisted.state.progress.equipped,
    capacity: persisted.state.profile,
    cinderPulse: { radius: toolHook.aoe.r, duration: toolHook.aoe.t },
    diagnostics: persisted.state.diagnostics,
  }, null, 2));
} finally {
  await browser.close();
}
