/* Drives scripts/bladefall-bot.mjs over one or more stages in a headless browser
 * and writes a receipt. Usage:
 *   node scripts/run-bot.mjs --stage 0
 *   node scripts/run-bot.mjs --stages 0,1,2 --out docs/bot/receipt.json
 *   node scripts/run-bot.mjs --stage 7 --goal 8800
 *   node scripts/run-bot.mjs --replay docs/bot/receipt.stage-0.inputs.json --out docs/bot/replay.json
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, dirname, basename } from 'node:path';
import puppeteer from 'puppeteer';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const replayPath = arg('replay', null);
const replayPlan = replayPath ? JSON.parse(await readFile(resolve(replayPath), 'utf8')) : null;
const stages = (arg('stages', arg('stage', String(replayPlan?.stage ?? 0)))).split(',').map((s) => Number(s.trim()));
const goalX = arg('goal', null) === null ? null : Number(arg('goal'));
const budget = arg('budget', null) === null ? undefined : Number(arg('budget'));
const maxSegments = arg('segments', null) === null ? undefined : Number(arg('segments'));
const muster = replayPlan ? !!replayPlan.muster : argv.includes('--muster');
const outPath = resolve(arg('out', 'docs/bot/receipt.json'));

const root = resolve('public');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.bak': 'text/html' };
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

const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 1_800_000,   // a hard level can search for minutes in-page
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const runs = [];
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__BF?.tas);
  const bot = await import('./bladefall-bot.mjs');

  for (const stage of stages) {
    const started = Date.now();
    let boot, result;
    try {
      boot = await page.evaluate(bot.bootstrapStage, muster ? { stage, muster: true } : stage);
      result = replayPlan ? await page.evaluate(bot.replayInputs, replayPlan) : await page.evaluate(bot.solveLevel, { goalX, totalExpansions: budget, maxSegments });
    } catch (error) {
      // One stage the TAS snapshot cannot serialize must not abort the sweep.
      runs.push({ stage, pass: false, reason: 'harness error: ' + error.message,
        seconds: +((Date.now() - started) / 1000).toFixed(1) });
      console.log(`stage ${stage}: ERROR ${error.message}`);
      continue;
    }
    // Keep every winning/partial route runnable locally, alongside its summary.
    const { winningInputs, ...summary } = result;
    const inputPath = outPath.replace(/\.json$/, '') + '.stage-' + stage + '.inputs.json';
    await mkdir(dirname(inputPath), { recursive: true });
    await writeFile(inputPath, JSON.stringify({ stage, muster, stateHash: result.stateHash, inputs: winningInputs || replayPlan?.inputs || [] }) + '\n');
    runs.push({ stage, muster, inputFile: basename(inputPath), boot: { levelLength: boot.levelLength, capabilities: boot.capabilities, spawn: { x: Math.round(boot.p.x), y: Math.round(boot.p.y) } },
      seconds: +((Date.now() - started) / 1000).toFixed(1), ...summary,
      inputFrames: winningInputs ? winningInputs.length : 0 });
    const r = runs.at(-1);
    console.log(`stage ${stage}: ${r.pass ? 'PASS' : 'FAIL'} ` +
      `${r.reachedX ?? '-'}/${r.goalX ?? '-'} segments=${r.segments ?? 0} frames=${r.frames ?? 0} ` +
      `${r.pass ? `replayIdentical=${r.replayIdentical}` : `failedSegment=${r.failedSegment} (${r.reason})`}`);
  }
} finally {
  const child = browser.process();
  await browser.close();
  for (const stream of child?.stdio || []) stream?.destroy();
  server.closeAllConnections(); server.close();
}

const receipt = {
  schema: 'bladefall.traversal-bot',
  mode: replayPlan ? 'replay' : 'solve',
  generatedAt: new Date().toISOString(),
  pass: !errors.length && runs.length > 0 && runs.every((r) => r.pass && r.replayIdentical),
  runtimeErrors: errors,
  runs,
};
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(receipt, null, 2) + '\n');
console.log(`\nreceipt -> ${outPath}\npass: ${receipt.pass}${errors.length ? `\npage errors: ${errors.length}` : ''}`);
process.exit(receipt.pass ? 0 : 1);
