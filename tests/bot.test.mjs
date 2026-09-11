import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

// The traversal bot must complete a whole authored level from its real spawn
// with only that level's constitutional capabilities, and the inputs it reports
// must reproduce the route exactly when replayed. The Outskirts is the fixture:
// one jump, no weapon, patrols that have to be timed and a zone seam at the end.
async function openBot(t) {
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
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 1_800_000,
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

test('the bot completes The Outskirts from spawn and its route replays identically', async (t) => {
  const { page, bot, errors } = await openBot(t);
  const boot = await page.evaluate(bot.bootstrapStage, 0);
  assert.equal(boot.stage, 0);
  assert.deepEqual(boot.capabilities, ['jump'], 'the Outskirts prefix is one jump and nothing else');
  const result = await page.evaluate(bot.solveLevel, { totalExpansions: 20000 });
  assert.equal(result.pass, true, `bot failed: ${result.reason} at segment ${result.failedSegment}`);
  assert.equal(result.crossedBoundary, true, 'completion is the eastern zone seam, not an arbitrary x');
  assert.equal(result.replayIdentical, true, 'the reported inputs must reproduce the reached state exactly');
  assert.ok(result.segments >= 20, `a real route has many segments, got ${result.segments}`);
  assert.equal(result.direction, 1);
  assert.deepEqual(errors, []);
});

test('the bot reports the exact failed segment rather than pretending', async (t) => {
  const { page, bot } = await openBot(t);
  await page.evaluate(bot.bootstrapStage, 0);
  // A tiny budget cannot finish the level; the report must still be honest and structured.
  const result = await page.evaluate(bot.solveLevel, { totalExpansions: 40 });
  assert.equal(result.pass, false);
  assert.match(result.reason, /budget exhausted|failed/);
  assert.equal(typeof result.failedSegment, 'number');
  assert.ok(result.from && typeof result.from.x0 === 'number', 'the failing ledge is named');
  assert.equal(result.replayIdentical, true, 'even a partial route replays exactly');
});

test('the bot works the Causeway\u2019s mechanisms and reaches the Brute\u2019s threshold', async (t) => {
  const { page, bot, errors } = await openBot(t);
  const boot = await page.evaluate(bot.bootstrapStage, 2);
  assert.deepEqual(boot.capabilities, ['jump', 'weapon']);
  const result = await page.evaluate(bot.solveLevel, { totalExpansions: 24000 });
  assert.equal(result.pass, true, `bot failed: ${result.reason} at segment ${result.failedSegment}`);
  assert.equal(result.goalKind, 'boss-threshold', 'a boss arena is not traversal; the bot stops short of it and says so');
  assert.equal(result.replayIdentical, true);
  // The Drop Yard door opens only when Oren's repair quest completes: talk to
  // him, then release both elevated catches. All three must register.
  const worked = result.mechanisms.filter((m) => m.after && !m.before).map((m) => m.id);
  assert.ok(worked.some((id) => id.includes(':oren:')), 'Oren was spoken to');
  assert.ok(worked.some((id) => id.includes('causeway-catch-yard')), 'the yard catch was released');
  assert.ok(worked.some((id) => id.includes('causeway-catch-rise')), 'the rise catch was released');
  assert.ok(result.solved.some((s) => s.mechanism), 'the route records a mechanism segment');
  assert.deepEqual(errors, []);
});
