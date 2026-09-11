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

  const fresh = await page.evaluate(() => ({ version: window.__BF.VERSION, state: window.__BF.equipmentState(), toolTag: document.querySelector('#toolTag').style.display }));
  assert.equal(fresh.state.validation.ok, true);
  assert.deepEqual(fresh.state.progress.ownedTools, []);
  assert.equal(fresh.toolTag, 'none');

  await page.evaluate(() => {
    window.__BF.reloadStage(1);
    window.__BF.meta.gold = 999;
    Object.assign(window.__BF.G.p, { x: 620, y: 0, vx: 0, vy: 0, onGround: true });
  });
  await page.keyboard.press('KeyE');
  await page.waitForFunction(() => window.__BF.mode === 'shop');
  await page.evaluate(() => [...document.querySelectorAll('[data-shop-item]')].find((button) => button.textContent.includes('Assessor Lens')).click());
  await page.waitForFunction(() => window.__BF.meta.equipment.ownedTools.includes('assessor-lens'));
  const bought = await page.evaluate(() => ({
    state: window.__BF.equipmentState(),
    sold: [...document.querySelectorAll('[data-shop-item]')].find((button) => button.textContent.includes('Assessor Lens'))?.disabled,
  }));
  assert.equal(bought.state.progress.equippedTool, 'assessor-lens');
  assert.equal(bought.state.progress.charges['assessor-lens'], 5);
  assert.equal(bought.sold, true);
  await page.click('#shopLeave');
  if (process.env.BLADEFALL_EQUIPMENT_SCREENSHOT) {
    await page.keyboard.press('Escape');
    await page.waitForSelector('#toolKitBtn');
    await page.click('#toolKitBtn');
    await page.waitForSelector('[data-tool="assessor-lens"]');
    await page.screenshot({ path: process.env.BLADEFALL_EQUIPMENT_SCREENSHOT });
    await page.click('#toolBack');
    await page.click('#resBtn');
  }

  await page.keyboard.press('KeyR');
  await delay(120);
  const used = await page.evaluate(() => ({ state: window.__BF.equipmentState(), tag: document.querySelector('#toolTag').textContent }));
  assert.equal(used.state.progress.charges['assessor-lens'], 4);
  assert.equal(used.state.diagnostics.toolUses, 1);
  assert.match(used.tag, /4\/5/);

  await page.evaluate(() => {
    const armor = window.__BF.makeArmor('rare', 'chest');
    window.__BF.G.pickups.push({ x: window.__BF.G.p.x, y: window.__BF.G.p.y, armor, bob: 0 });
  });
  await page.waitForFunction(() => window.__BF.mode === 'upgrade', { timeout: 3_000 });
  await page.evaluate(() => document.querySelector('[data-i="2"]').click());
  await page.waitForFunction(() => window.__BF.mode === 'play');
  const salvaged = await page.evaluate(() => window.__BF.equipmentState());
  assert.equal(salvaged.progress.salvageCount, 1);
  assert.equal(salvaged.progress.materials.iron, 6);
  assert.equal(salvaged.progress.materials.weave, 4);

  await page.evaluate(() => {
    window.__BF.G.p.gear.helmet = window.__BF.makeArmor('common', 'helmet');
    const credited = window.__BF.equipmentEconomy.credit(window.__BF.meta.equipment, { iron: 10, weave: 10, prism: 3 }, 'validation');
    window.__BF.meta.equipment = credited.state;
    window.__BF.meta.gold = 999;
  });
  await page.keyboard.press('Escape');
  await page.waitForSelector('#forgeBtn');
  await page.click('#forgeBtn');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-f]')].some((button) => button.textContent.includes('Reinforce')));
  await page.evaluate(() => [...document.querySelectorAll('[data-f]')].find((button) => button.textContent.includes('Reinforce')).click());
  await page.waitForFunction(() => window.__BF.G.p.gear.helmet.reinforce === 1);
  const reinforced = await page.evaluate(() => ({ armor: window.__BF.G.p.gear.helmet, state: window.__BF.equipmentState(), saved: window.__BF.meta.run?.p?.gear?.helmet }));
  assert.equal(reinforced.armor.reinforce, 1);
  assert.equal(reinforced.armor.defense, 6.5);
  assert.equal(reinforced.saved.reinforce, 1);
  assert.equal(reinforced.state.diagnostics.reinforcements, 1);

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForFunction(() => window.__BF && document.querySelector('#contBtn'));
  await page.click('#contBtn');
  await page.waitForFunction(() => window.__BF?.mode === 'play');
  const persisted = await page.evaluate(() => ({ state: window.__BF.equipmentState(), armor: window.__BF.G.p.gear.helmet, errors: window.__errs || [] }));
  assert.equal(persisted.state.progress.ownedTools.includes('assessor-lens'), true);
  assert.equal(persisted.state.progress.charges['assessor-lens'], 4);
  assert.equal(persisted.state.progress.salvageCount, 1);
  assert.equal(persisted.armor.reinforce, 1);
  assert.deepEqual(persisted.errors, []);
  assert.deepEqual(pageErrors, []);

  console.log(JSON.stringify({
    ok: true, version: fresh.version,
    tool: { id: persisted.state.progress.equippedTool, charges: persisted.state.progress.charges['assessor-lens'] },
    salvage: { count: persisted.state.progress.salvageCount, materials: persisted.state.progress.materials },
    armor: { name: persisted.armor.name, reinforce: persisted.armor.reinforce, defense: persisted.armor.defense },
  }, null, 2));
} finally {
  await browser.close();
}
