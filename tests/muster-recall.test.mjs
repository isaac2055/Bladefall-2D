import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

// The recall is Frostfell's Muster Engine reaching the rest of the world. These
// tests load each return region as the recall left it, through the same zone
// hydration hook a real load uses, and check the things the owner's decisions
// forbid getting wrong: nothing spawns on a safe site, an arrival or a
// checkpoint; a reload never duplicates a post; no existing health is
// multiplied; and the signaler is a telegraphed, interruptible call.
async function openHarness(t) {
  const root = resolve('public');
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.bak': 'text/html' };
  const server = createServer(async (req, res) => {
    try {
      const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!path.startsWith(root + '/')) throw new Error('outside root');
      const bytes = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
      res.end(bytes);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600_000,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'] });
  t.after(async () => { await browser.close(); server.close(); });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__BF?.tas);
  const bot = await import('../scripts/bladefall-bot.mjs');
  return { page, bot, errors };
}

const REGIONS = [[6, 'warden'], [0, 'outskirts'], [1, 'black-woods'], [2, 'brute']];

test('every return region installs its roster once, clear of safe sites, arrivals and checkpoints', async (t) => {
  const { page, bot, errors } = await openHarness(t);
  for (const [stage, zoneId] of REGIONS) {
    await page.evaluate(bot.bootstrapStage, { stage, muster: true });
    const r = await page.evaluate((zoneId) => {
      const rows = MUSTER_ROSTERS[zoneId];
      const units = () => G.enemies.filter((e) => e.muster);
      const bad = [];
      const checks = G.obstacles.filter((o) => o.type === 'check');
      const residents = G.obstacles.filter((o) => o.type === 'ambientFigure' && (o.residentId || o.questActor));
      const npcs = G.npcs || [];
      for (const [type, x, y = 0, lo, hi] of rows) {
        if (x < 500 || x > G.levelLength - 500) bad.push(`${type}@${x}: within 500 of a level edge`);
        if (type === 'standard') continue;
        if (!EARCH[type]) bad.push(`${type}: no archetype`);
        if (!BladefallEcology.SPECIES[type]) bad.push(`${type}: no species profile`);
        if (!(lo < x && x < hi)) bad.push(`${type}@${x}: patrol ${lo}-${hi} does not contain it`);
        for (const c of checks) if (Math.abs(c.x - x) < 200 && Math.abs((c.y || 0) - y) < 60) bad.push(`${type}@${x}: on checkpoint ${c.x}`);
        for (const o of residents) if (Math.abs(o.x - x) < 350 && Math.abs((o.y || 0) - y) < 80) bad.push(`${type}@${x}: on resident ${o.residentId || o.questActor}`);
        for (const n of npcs) if (Math.abs(n.x - x) < 350 && Math.abs((n.y || 0) - y) < 80) bad.push(`${type}@${x}: on npc ${n.profileId || n.kind}`);
        // A post has to stand on something: a unit authored into a pit only
        // looks placed until the ecology recovers it somewhere else.
        if (type !== 'flyer') {
          const footing = G.obstacles.some((o) => o.type === 'plat' && !o.ceiling && !o.fake && !o.invisible &&
            x >= o.x - o.w / 2 && x <= o.x + o.w / 2 && Math.abs((o.y || 0) - y) <= 2);
          if (!footing) bad.push(`${type}@${x},${y}: no platform under it`);
        }
      }
      const expected = rows.filter((r) => r[0] !== 'standard').length;
      const first = units().length;
      // Reinstalling in place is a no-op; a real reload goes through the hook and must land on exactly one roster.
      installMusterRoster(zoneId);
      const reinstalled = units().length;
      loadStage(G.stageIndex);
      const reloaded = units().length;
      const bossesRecalled = G.enemies.filter((e) => e.boss).length;
      const musterBoss = units().filter((e) => e.boss).length;
      const ids = units().map((e) => e.zoneEntityId);
      const hpScale = G.ngHp * (1 + G.stageIndex * 0.10);
      const inflated = units().filter((e) => e.maxHp !== Math.round(EARCH[e.type].hp * hpScale)).map((e) => `${e.type}:${e.maxHp}`);
      const carriesLoot = units().filter((e) => !e.noDrop).length;
      const elite = units().filter((e) => e.elite).length;
      const standards = G.obstacles.filter((o) => o.musterStandard).length;
      // Like for like: the same load path without the recall must carry the
      // same bosses, so the event neither adds one nor brings one back.
      window.__BF_MUSTER_FORCE = undefined; G.musterForced = false;
      loadStage(G.stageIndex);
      const bossesQuiet = G.enemies.filter((e) => e.boss).length;
      window.__BF_MUSTER_FORCE = true;
      return { bad, expected, first, reinstalled, reloaded, uniqueIds: new Set(ids).size, ids: ids.length,
        inflated, carriesLoot, elite, standards, bossesRecalled, bossesQuiet, musterBoss };
    }, zoneId);
    assert.deepEqual(r.bad, [], `${zoneId}: roster hygiene`);
    assert.equal(r.first, r.expected, `${zoneId}: the roster installs`);
    assert.equal(r.reinstalled, r.expected, `${zoneId}: reinstalling is a no-op`);
    assert.equal(r.reloaded, r.expected, `${zoneId}: a reload lands on exactly one roster`);
    assert.equal(r.uniqueIds, r.ids, `${zoneId}: stable ids are unique`);
    assert.deepEqual(r.inflated, [], `${zoneId}: no unit's health is multiplied`);
    assert.equal(r.carriesLoot, 0, `${zoneId}: no loot carpet`);
    assert.equal(r.elite, 0, `${zoneId}: recall soldiers never roll elite`);
    assert.ok(r.standards >= 1, `${zoneId}: physical evidence is raised`);
    assert.equal(r.musterBoss, 0, `${zoneId}: no recall unit is a boss`);
    assert.equal(r.bossesRecalled, r.bossesQuiet, `${zoneId}: the recall neither adds a boss nor brings one back`);
  }
  // And without the recall, nothing changes.
  await page.evaluate(bot.bootstrapStage, { stage: 0, muster: false });
  const quiet = await page.evaluate(() => ({ units: G.enemies.filter((e) => e.muster).length, standards: G.obstacles.filter((o) => o.musterStandard).length }));
  assert.deepEqual(quiet, { units: 0, standards: 0 });
  assert.deepEqual(errors, []);
});

test('the signaler telegraphs, wakes the dormant posts, and can be interrupted', async (t) => {
  const { page, bot } = await openHarness(t);
  await page.evaluate(bot.bootstrapStage, { stage: 0, muster: true });
  const r = await page.evaluate(() => {
    const tas = window.__BF.tas;
    const signaler = G.enemies.find((e) => e.musterRole === 'signaler');
    const posts = G.enemies.filter((e) => e.muster && e.type === 'grunt');
    // Debug setup: the knight is placed inside the signaler's notice range but
    // outside the posts' own, so only the call can wake them.
    G.p.x = signaler.x - 150; G.p.y = 0; G.p.vx = 0; G.p.vy = 0;
    tas.saveState('near');
    const dormantBefore = posts.every((e) => !e.active);
    let calledAt = null;
    for (let i = 0; i < 160 && posts.some((e) => !e.active); i++) { tas.stepFrames(1, {}); if (signaler.signalT > 0 && calledAt === null) calledAt = i; }
    const woke = posts.every((e) => e.active && e.roused > 0);
    // Interrupt: strike during the wind-up and the call breaks.
    tas.restoreState('near');
    const s2 = G.enemies.find((e) => e.musterRole === 'signaler');
    const p2 = G.enemies.filter((e) => e.muster && e.type === 'grunt');
    for (let i = 0; i < 60 && !(s2.signalT > 0); i++) tas.stepFrames(1, {});
    const windingUp = s2.signalT > 0;
    hitEnemy(s2, 4, 1, 0, 0, null, 'melee');
    tas.stepFrames(70, {});
    return { dormantBefore, calledAt, woke, windingUp, brokenCall: s2.signalT === 0 && s2.signalCd > 0, stillDormant: p2.every((e) => !e.active) };
  });
  assert.equal(r.dormantBefore, true, 'the posts start dormant');
  assert.ok(r.calledAt !== null, 'the signaler winds up when the knight is near');
  assert.equal(r.woke, true, 'the call wakes the posts');
  assert.equal(r.windingUp, true);
  assert.equal(r.brokenCall, true, 'a strike during the wind-up breaks the call');
  assert.equal(r.stillDormant, true, 'a broken call wakes nothing');
});

test('recalled residents say so, and only once the recall has happened', async (t) => {
  const { page, bot } = await openHarness(t);
  await page.evaluate(bot.bootstrapStage, { stage: 2, muster: true });
  const r = await page.evaluate(() => {
    const oren = G.obstacles.find((o) => o.questActor === 'oren');
    const recalled = ambientFigureDialogue(oren, true);
    window.__BF_MUSTER_FORCE = undefined; G.musterForced = false;
    const before = ambientFigureDialogue(oren, true);
    return { recalled, before, registry: BFDialogueModule.text('causeway.oren.muster') };
  });
  assert.equal(r.recalled, r.registry);
  assert.notEqual(r.before, r.registry);
  assert.match(r.recalled, /chain counted again/);
});
