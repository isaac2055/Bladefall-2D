/* THE ACT 1 RETURN, AS THE OWNER TESTS IT (7.167.0).
   Owner: "When I use level select to choose the deep line, take it to ruined keep, get the
   three ship parts, and travel back to get to abyss king, it still blocks me. Entering deep
   line from level select should assume all levels before are completely cleared so that
   this test works. In addition, when going backwards on deep line from ruined keep, you
   hold right to speed up still, which is backwards since you are going left. Also, how
   activate the high line/low line thing? The switch is seemingly unreliable, and
   activating it should be simpler."
     The fast tests pin each rule; the last one plays the whole route in a real browser,
   because every earlier fix to this road passed a test of the declaration and failed in
   play. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import puppeteer from 'puppeteer';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
await import('../public/bladefall-progression.js');
await import('../public/bladefall-zones.js');
await import('../public/bladefall-world.js');
await import('../public/bladefall-zone-state.js');
const { BladefallZones: Zones, BladefallWorld: World, BladefallZoneState: ZoneState } = globalThis;

function fn(name) {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists');
  let depth = 0, i = source.indexOf('{', start);
  for (; i < source.length; i++) { if (source[i] === '{') depth++; else if (source[i] === '}' && --depth === 0) break; }
  return source.slice(start, i + 1);
}
const latchesSrc = /const LEVEL_SELECT_PRIOR_LATCHES=Object\.freeze\(\[[\s\S]*?\n\]\);/.exec(source)[0];
function seededSession(startStage) {
  const ctx = vm.createContext({ G: { levelSelectMode: true, sessionZoneState: ZoneState.createState() },
    BFWorldModule: World, BFZoneStateModule: ZoneState, Math, Number, Object });
  vm.runInContext(latchesSrc + '\n' + fn('seedLevelSelectPriorWorld') + '\nseedLevelSelectPriorWorld(' + startStage + ');', ctx);
  return ctx.G;
}
const circuit = (state, zone, id) => !!ZoneState.hydrate(state, zone, []).circuits[id]?.open;

test('Level Select starts in a world where every earlier stage is won', () => {
  const g = seededSession(15);
  const expected = [...Array(15).keys()].map(i => World.stageId(i)).filter(Boolean);
  assert.deepEqual([...g.sessionClearedZones], expected, 'stages 0-13 are cleared for this run (14 is the cut slot)');
  assert.ok(g.sessionClearedZones.includes('abyss-king'));
  for (const [zone, id] of [['ruined-keep', 'keep-key-recovered'], ['frostfell', 'frost-muster'],
    ['ember-colossus', 'foundry-colossus'], ['void-tyrant', 'citadel-tyrant'], ['abyss-king', 'throne-king']])
    assert.ok(circuit(g.sessionZoneState, zone, id), `${zone}:${id} is latched`);
  // The gate the owner hit, with the state the game would hand it.
  const state = { capabilities: [], clearedZones: g.sessionClearedZones, openedConnectors: [], vaultKeys: [] };
  assert.equal(Zones.eligibility('king-deep-line', 'deep-line', state).allowed, true, 'the west end opens');
  assert.equal(Zones.eligibility('king-deep-line', 'deep-line', { ...state, clearedZones: [] }).reason,
    'boss-clear-required', 'and without the seed it refuses, which is the bug');
});

test('a selected stage still owns its own boss', () => {
  const at13 = seededSession(13), at12 = seededSession(12), at5 = seededSession(5);
  assert.equal(at13.sessionClearedZones.includes('abyss-king'), false);
  assert.equal(circuit(at13.sessionZoneState, 'abyss-king', 'throne-king'), false, 'the King waits for you');
  assert.equal(circuit(at13.sessionZoneState, 'void-tyrant', 'citadel-tyrant'), true);
  assert.equal(circuit(at12.sessionZoneState, 'void-tyrant', 'citadel-tyrant'), false, 'so does the Tyrant');
  assert.equal(circuit(at5.sessionZoneState, 'ruined-keep', 'keep-key-recovered'), false, 'and the Keep its key');
  assert.match(fn('beginRun'), /seedLevelSelectPriorWorld\(\(opts&&opts\.startStage\)\|\|0\);/);
});

test('Continue keeps the session clears and the direction of the ride', () => {
  const body = fn('savedRunSession');
  const ctx = vm.createContext({ JSON, Array, String, BFQuestsModule: { createProgress: () => ({}) },
    BFZoneStateModule: ZoneState, levelSelectCapabilitiesForStage: () => ({}) });
  vm.runInContext(body, ctx);
  const saved = JSON.parse(JSON.stringify(ctx.savedRunSession({ levelSelectMode: true, stageIndex: 15,
    sessionCapabilities: {}, sessionQuests: {}, sessionZoneState: {}, sessionClearedZones: ['abyss-king'], deepLineReturn: true })));
  assert.deepEqual(saved.sessionClearedZones, ['abyss-king']);
  assert.equal(saved.deepLineReturn, true);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.savedRunSession({ levelSelectMode: false }))).sessionClearedZones, []);
});

test('the King stays gone once he runs, and his hall keeps its floor', () => {
  assert.match(fn('kingRetreats'), /markPersistentCircuitOpen\('throne-king','king-retreat'\)/,
    'the retreat writes the circuit the level skips on');
  assert.match(source, /bossSkipCircuit:'throne-king',bossSkipZone:'abyss-king'/);
  assert.match(fn('buildCustomLevel'), /G\.throneHallEmpty=G\.stageIndex===13&&bossDone;/, 'a skipped King empties the hall');
  assert.match(fn('buildCustomLevel'), /throneHallFloor:1/, 'and still leaves a floor under his arena');
  assert.match(fn('activateZonePersistence'), /applyZoneHydration\(view,manifest\);\n  if\(G\.throneHallEmpty\)retireThroneHall\(\);/,
    'the Right Hand and Oren are retired after hydration, so no stored enemy id shifts');
});

test('the cart leans along the ride, and every switch answers the lean', () => {
  assert.match(source, /const leanFwd=cdir>0\?input\.right:input\.left,leanBack=cdir>0\?input\.left:input\.right;/,
    'westbound, LEFT is forward');
  assert.doesNotMatch(fn('drawRailSwitch'), /requireBoost/, 'the drawer shows one rule');
  assert.doesNotMatch(/RailSwitch\(7480[^)]*\)/.exec(source)[0], /requireBoost/, 'and no switch hides a second condition');
  assert.match(source, /RailSwitch\(7480,0,\{label:'LEAN',pow:1050,launch:580,signalSlot:1\}\)/);
  assert.match(source, /const passed=cdir>0\?\(wasX<o\.x&&p\.x>=o\.x\):\(wasX>o\.x&&p\.x<=o\.x\);/,
    'it decides when the cart passes the post, not on one grounded frame');
  assert.match(source, /p\.vx=cdir\*Math\.max\(Math\.abs\(p\.vx\),o\.launch\|\|RAIL_SWITCH_LAUNCH\);/,
    'and throws a fixed distance onto the high line');
  assert.match(fn('drawRailSwitch'), /c\.scale\(G\.cartDirection\|\|1,1\);/, 'its arrows point the way you ride');
});

test('every ship part is the Up target on its own ledge', () => {
  // The sail was authored on the exact point of the Keep Key's belfry, which always wins.
  const sail = /'ruined-keep':\{id:'ship-part-sail',x:(\d+),y:(\d+)/.exec(source);
  const belfry = /Scenery\((\d+),(\d+),'masked-belfry',\{keepVaultKey:1/.exec(source);
  assert.ok(Math.abs(Number(sail[1]) - Number(belfry[1])) > 82 + 66, 'the belfry key and the sail reaches never overlap');
  assert.match(fn('outskirtsAuthoredInteractable'), /o\.throneBoat\b/, 'and the boat can be pushed off');
});

async function openGame(t, query = '') {
  const root = fileURLToPath(new URL('../public/', import.meta.url));
  const server = createServer(async (request, response) => {
    try {
      const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
      if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('invalid path');
      const data = await readFile(path);
      response.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript' }[extname(path)] || 'application/octet-stream' });
      response.end(data);
    } catch { if (!response.headersSent) response.writeHead(404); response.end(); }
  });
  t.after(() => new Promise(done => { server.close(() => done()); server.closeAllConnections(); }));
  await new Promise((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
  const browser = await puppeteer.launch({ headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__BF && typeof beginRun === 'function');
  return { page, errors };
}

test('both switches, both directions: lean takes the high line and lands on it', { timeout: 120000 }, async (t) => {
  const { page, errors } = await openGame(t, '?tas=1');
  const rows = await page.evaluate(() => {
    const B = window.__BF, len = 13950, out = [];
    const cases = [[null, 2390, 2800, 3340, 220, 600], [null, 7480, 8050, 8540, 260, 300],
      ['deep-line-keep:deep-line', len - 2390, len - 3340, len - 2800, 220, 600],
      ['deep-line-keep:deep-line', len - 7480, len - 8540, len - 8050, 260, 300]];
    for (const [endpoint, sx, x1, x2, highY, runup] of cases) for (const lean of [true, false, 'tap']) {
      B.tas.resetGame(); if (endpoint) B.G._pendingZoneEndpoint = endpoint; B.reloadStage(15); B.tas.stepFrames(1, {});
      const G = B.G, dir = G.cartDirection, fwd = dir > 0 ? 'right' : 'left';
      Object.assign(G.p, { x: sx - dir * runup, y: 0, vx: dir * 270, vy: 0, onGround: true });
      const sw = G.obstacles.find(o => o.type === 'railSwitch' && o.x === sx);
      let landed = null;
      for (let f = 0; f < 300 && !landed; f++) {
        G.enemies.length = 0; G.p.invuln = 9;
        // 'tap': forward only for the last 25 units, let go the moment the switch speaks.
        const tapping = lean === 'tap' && (sx - G.p.x) * dir <= 25 && !sw.choice;
        B.tas.stepFrames(1, lean === true || tapping ? { [fwd]: true } : {});
        if (sw.choice && G.p.onGround && (G.p.x - sx) * dir > 60) landed = { x: G.p.x, y: G.p.y };
      }
      out.push({ dir, sx, lean: !!lean, mode: String(lean), choice: sw.choice, onHigh: !!landed && landed.y >= highY - 5 && landed.x >= x1 + 10 && landed.x <= x2 });
    }
    return out;
  });
  for (const r of rows) {
    assert.equal(r.choice, r.lean ? 'high' : 'low', `switch ${r.sx} (${r.dir > 0 ? 'east' : 'west'}bound), ${r.mode}`);
    assert.equal(r.onHigh, r.lean, `switch ${r.sx} (${r.mode}): ${r.lean ? 'lands on the high plank, not its lip' : 'stays low'}`);
  }
  // And the speed key follows the ride: westbound, LEFT goes fast and RIGHT brakes.
  const speeds = await page.evaluate(() => {
    const B = window.__BF, v = {};
    for (const key of ['left', 'right']) {
      B.tas.resetGame(); B.G._pendingZoneEndpoint = 'deep-line-keep:deep-line'; B.reloadStage(15); B.tas.stepFrames(1, {});
      Object.assign(B.G.p, { x: 13200, y: 0, vx: -270, vy: 0, onGround: true });
      for (let f = 0; f < 90; f++) { B.G.enemies.length = 0; B.tas.stepFrames(1, { [key]: true }); }
      v[key] = Math.round(B.G.p.vx);
    }
    return v;
  });
  assert.ok(speeds.left < -400, `westbound LEFT is the speed key (${speeds.left})`);
  assert.ok(speeds.right > -150, `westbound RIGHT brakes (${speeds.right})`);
  assert.deepEqual(errors, []);
});

test('the owner\'s route: Level Select Deep Line -> three parts -> back to the Throne -> the boat',
  { timeout: 300000 }, async (t) => {
  const { page, errors } = await openGame(t);
  const ev = (f, ...a) => page.evaluate(f, ...a), sleep = ms => new Promise(r => setTimeout(r, ms));
  const waitFor = async (pred, ms = 20000) => { const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (await ev(pred)) return true; await sleep(100); } return false; };
  const place = (x, y, vx = 0) => ev((x, y, vx) => { Object.assign(G.p, { x, y, vx, vy: 0, onGround: false, dead: false }); G.p.face = vx < 0 ? -1 : 1; }, x, y, vx);
  const hold = async (key, ms) => { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); };
  const walkTo = async (key, stage) => { await page.keyboard.down(key); const ok = await waitFor(new Function(`return G.stageIndex===${stage}&&mode==='play'`)); await page.keyboard.up(key); return ok; };
  const at = () => ev(() => ({ x: Math.round(G.p.x), y: Math.round(G.p.y) }));
  await page.mouse.click(10, 10); await hold('ArrowUp', 60);   // a first gesture, so no test press is spent unlocking audio
  await ev(() => { window.__toasts = []; const t0 = toast; window.toast = function (m) { window.__toasts.push(String(m)); return t0.apply(this, arguments); };
    setInterval(() => { if (G && G.p) G.p.invuln = Math.max(G.p.invuln || 0, 2); }, 150); });
  const claim = async () => {
    const part = await ev(() => { const o = G.obstacles.find(o => o.shipPart); return { x: o.x, y: o.y, id: o.shipPart }; });
    await place(part.x, part.y + 2);
    assert.ok(await waitFor(() => G.p.onGround && mode === 'play', 4000), 'standing on the ' + part.id + ' ledge');
    await ev(x => { G.p.x = x; G.p.vx = 0; }, part.x); await hold('ArrowUp', 120); await sleep(300);
    const why = await ev(id => shipPartHeld(id) ? null : { p: [Math.round(G.p.x), Math.round(G.p.y), !!G.p.onGround], mode,
      target: (outskirtsInteractionCandidate() || {}).kind || (outskirtsInteractionCandidate() || {}).type || null,
      stream: BFZoneStreamer.diagnostics().phase, crossing: !!G.physicalSeamCrossing }, part.id);
    assert.equal(why, null, part.id + ' is claimed by pressing Up on its ledge');
  };

  await ev(() => beginRun(0, null, { hp: 1, dmg: 1 }, { startStage: 15, levelSelect: true }));
  assert.ok(await waitFor(() => mode === 'play' && G.stageIndex === 15));
  await place(13820, 0, 400);
  assert.ok(await waitFor(() => G.stageIndex === 5 && mode === 'play'), 'the line surfaces at the Keep');
  await claim();
  await place(120, 0, -250); assert.ok(await walkTo('ArrowLeft', 4), 'west into the Marksman');
  const marksman = await at(); await claim();
  await place(120, 0, -250); assert.ok(await walkTo('ArrowLeft', 3), 'west into the Updrafts');
  const updrafts = await at(); await claim();
  await place(updrafts.x, updrafts.y, 250); assert.ok(await walkTo('ArrowRight', 4), 'back east');
  await place(marksman.x, marksman.y, 250); assert.ok(await walkTo('ArrowRight', 5), 'back to the Keep');
  assert.ok(await ev(() => shipComplete()), 'the ship is whole');
  await place(17400, 0, 250); assert.ok(await walkTo('ArrowRight', 15), 'boarding at the Keep\'s far east');
  assert.deepEqual(await ev(() => [G.deepLineReturn, G.cartDirection]), [true, -1], 'the westbound line');
  await ev(() => { saveRunAtStage(15); continueRun(); });
  assert.ok(await waitFor(() => G.stageIndex === 15 && mode === 'play'));
  assert.deepEqual(await ev(() => [G.deepLineReturn, G.cartDirection, (G.sessionClearedZones || []).includes('abyss-king')]),
    [true, -1, true], 'a Continue mid-ride keeps its direction and its clears');
  await place(160, 0, -400);
  assert.ok(await waitFor(() => G.stageIndex === 13 && mode === 'play'), 'the west end opens into the Throne');
  assert.equal(await ev(() => window.__toasts.some(m => /does not know this road is won/.test(m))), false, 'no refusal');
  await sleep(600);
  assert.deepEqual(await ev(() => ({ king: G.enemies.some(e => e.type === 'king' && !e.dead), boss: G.boss && G.boss.type,
    floor: G.obstacles.some(o => o.throneHallFloor), lid: !!G.obstacles.find(o => o.throneHoleLid).gone })),
    { king: false, boss: null, floor: true, lid: true }, 'the hall is floored and open to the water');
  assert.equal(await ev(() => G.enemies.some(e => e.rightHandFight) || G.npcs.some(n => n.profileId === 'sera')), false,
    'and empty: no Right Hand, no Oren');
  await place(17790, 60);
  assert.ok(await waitFor(() => G.p.y < -800 && G.p.onGround, 8000), 'down to the beach');
  const boat = await ev(() => { const o = G.obstacles.find(o => o.throneBoat); return { x: o.x, y: o.y }; });
  await place(boat.x, boat.y + 2); await sleep(500); await hold('ArrowUp', 120);
  let done = false;
  for (let i = 0; i < 40 && !done; i++) { await sleep(1500); done = await ev(() => meta.actTwoReached === true);
    if (!done) { await page.keyboard.press('Space'); await page.mouse.click(640, 360); } }
  assert.ok(done, 'the boat ends Act 1');
  assert.deepEqual(errors, []);
});

test('the King\'s retreat keeps him gone on every reload, in the campaign and from old saves', { timeout: 120000 }, async (t) => {
  const { page, errors } = await openGame(t);
  const r = await page.evaluate(() => {
    mainCanvas.width = 1280; mainCanvas.height = 720; recalcVP();
    const hall = () => ({ king: G.enemies.some(e => e.type === 'king' && !e.dead), hand: G.enemies.some(e => e.rightHandFight),
      oren: G.npcs.some(n => n.profileId === 'sera'), boss: G.boss ? G.boss.type : null, floor: G.obstacles.some(o => o.throneHallFloor),
      gate: BFZonesModule.eligibility('king-deep-line', 'abyss-king', zoneTraversalState()).allowed });
    const out = {};
    // A campaign-mode run at the Throne (not Level Select): the King stands, then runs.
    beginRun(0, null, { hp: 1, dmg: 1 }, { startStage: 13 });
    out.before = hall();
    kingRetreats(G.enemies.find(e => e.type === 'king'));
    out.latch = !!BFZoneStateModule.hydrate(meta.zoneState, 'abyss-king', []).circuits['throne-king']?.open;
    loadStage(12); loadStage(13); out.reload = hall();
    // A save from before the latch existed: the world records the clear, the circuit does not.
    const zs = JSON.parse(JSON.stringify(meta.zoneState)); delete zs.zones['abyss-king'].circuits['throne-king']; meta.zoneState = zs;
    if (!(meta.world.cleared || []).includes('abyss-king')) meta.world.cleared = [...(meta.world.cleared || []), 'abyss-king'];
    loadStage(13); out.oldSave = hall();
    // A Level Select world started past the Throne and the Causeway: neither boss is back.
    beginRun(0, null, { hp: 1, dmg: 1 }, { startStage: 15, levelSelect: true });
    loadStage(13); out.select15Throne = hall();
    loadStage(2); out.select15Brute = G.enemies.some(e => e.type === 'brute' && !e.dead);
    return out;
  });
  assert.equal(r.before.king, true, 'the King is there to fight');
  assert.equal(r.latch, true, 'his retreat writes the latch the level skips on');
  for (const k of ['reload', 'oldSave', 'select15Throne'])
    assert.deepEqual(r[k], { king: false, hand: false, oren: false, boss: null, floor: true, gate: true }, k + ': an empty, floored hall with an open rail head');
  assert.equal(r.select15Brute, false, 'a won Causeway does not stand its Brute back up');
  assert.deepEqual(errors, []);
});
