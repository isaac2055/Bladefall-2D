import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import puppeteer from 'puppeteer';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const manifest=await readFile(new URL('../package.json',import.meta.url),'utf8');

test('the opt-in TAS starts a seeded fresh test run and advances real game updates',()=>{
  assert.match(source,/const BF_TAS_ENABLED=.*URLSearchParams\(location\.search\)\.has\('tas'\)/);
  assert.match(source,/beginRun\(0,null,\{hp:1,dmg:1\},\{testRun:true,runSeed:seed\}\)/);
  assert.match(source,/tasApplyFrame\(command\.held,localTick===0\?command\.press:\[\]\);gameUpdate\(\);/);
  assert.match(source,/nativeTrace=BFSimulation\.exportTrace\(\)/);
  assert.match(source,/It cannot teleport, grant progress, edit/);
  assert.match(manifest,/"tas:smoke": "node scripts\/tas-smoke\.mjs"/);
});


async function openMovementHarness(t, { tas = true } = {}) {
  // Serve this working copy on an isolated port; no running dev server or saved
  // browser session is required. Exercise the real TAS API and full game update.
  const root = fileURLToPath(new URL('../public/', import.meta.url));
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const path = resolve(root, '.' + decodeURIComponent(pathname));
      if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('invalid path');
      const data = await readFile(path);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' }[extname(path)];
      response.writeHead(200, { 'Content-Type': type || 'application/octet-stream' });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  t.after(() => new Promise((resolveClose, rejectClose) => {
    server.close(error => error ? rejectClose(error) : resolveClose());
    server.closeAllConnections();
  }));
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
  });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html${tas ? '?tas=1' : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__BF);
  if (tas) await page.waitForFunction(() => window.__BF.tas);
  return page;
}

test('ground run reaches max speed cleanly', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t);
  const { initial, frames } = await page.evaluate(() => {
    const game = window.__BF.tas;
    const initial = game.resetGame();
    const frames = [];
    for (let i = 0; i < 30; i++) {
      game.stepFrames(1, { right: true });
      frames.push(game.getPlayerState());
    }
    return { initial, frames };
  });

  const maxSpeed = 200;
  const epsilon = 1e-9; // Numerical noise only; the final-speed allowance is 1%.
  let previousVx = initial.vx;
  for (const [index, state] of frames.entries()) {
    const label = `frame ${index + 1}`;
    assert.ok(state.vx - previousVx > epsilon, `${label}: vx must increase strictly`);
    assert.ok(state.vx <= maxSpeed + epsilon, `${label}: vx must not exceed ${maxSpeed}`);
    assert.ok(Math.abs(state.y) <= epsilon, `${label}: y must remain zero`);
    assert.equal(state.onGround, true, `${label}: must stay on ground`);
    assert.equal(state.state, 'grounded', `${label}: must stay grounded`);
    previousVx = state.vx;
  }
  assert.ok(Math.abs(frames[29].vx - maxSpeed) <= maxSpeed * 0.01 + epsilon,
    'frame 30: vx must be within 1% of max speed');
});


// Read the normal (non-dash) gravity expression rather than duplicating tuning.
const gravity = Number(source.match(/p\.vy\+=([\d.]+)\*dt\*gravDir\*gMul/)?.[1]);
const movementTolerance = 1e-7;
function near(actual, expected, message) {
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected)
    && Math.abs(actual - expected) <= movementTolerance, `${message}: ${actual} vs ${expected}`);
}

test('basic jump has correct initial velocity and arcs under gravity', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t);
  const { initial, frames, tuning, dt } = await page.evaluate(() => {
    const game = window.__BF.tas;
    const initial = game.resetGame(); // Outskirts (350, 0): clear flat ground and headroom.
    const tuning = window.__BF.movementState().profile.tuning;
    const dt = window.__BF.simulation.fixedDt;
    const frames = [];
    for (let i = 0; i < 120; i++) {
      game.stepFrames(1, { jump: true }); // Hold to avoid jump-release velocity cutting.
      frames.push(game.getPlayerState());
      if (frames.at(-1).onGround) break;
    }
    return { initial, frames, tuning, dt };
  });
  assert.equal(initial.onGround, true);
  assert.equal(initial.state, 'grounded');
  assert.equal(frames[0].onGround, false);
  assert.equal(frames[0].state, 'rising');
  near(frames[0].vy, -tuning.jumpVelocity + gravity * dt, 'launch frame includes gravity');
  let previousVy = -tuning.jumpVelocity;
  let sawFalling = false;
  for (const [index, state] of frames.entries()) {
    assert.equal(state.onWall, false, `frame ${index + 1}: clear of walls`);
    if (state.onGround) {
      assert.ok(sawFalling, 'must fall before landing');
      assert.equal(state.state, 'grounded');
      near(state.y, initial.y, 'lands at starting height');
      near(state.vy, 0, 'landing stops vertical velocity');
      break;
    }
    near(state.vy, previousVy + gravity * dt, `frame ${index + 1}: gravity increment`);
    if (state.vy < -movementTolerance) assert.equal(state.state, 'rising');
    if (state.vy > movementTolerance) {
      sawFalling = true;
      assert.equal(state.state, 'falling');
    }
    previousVy = state.vy;
  }
  assert.equal(frames.at(-1).onGround, true, 'jump must complete its arc');
});

test('coyote time works at both boundaries', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t);
  const result = await page.evaluate(() => {
    const game = window.__BF.tas;
    function attempt(inside) {
      game.resetGame();
      const tuning = window.__BF.movementState().profile.tuning;
      const dt = window.__BF.simulation.fixedDt;
      let departure;
      // Walk from (350, 0) off the existing x=600 ground edge. No teleport,
      // ability grants, walls, or artificial timer values are used.
      for (let i = 0; i < 200; i++) {
        game.stepFrames(1, { right: true });
        departure = game.getPlayerState();
        if (!departure.onGround) break;
      }
      if (departure.onGround) throw new Error('Did not walk off the opening ledge');
      // The departure frame still refreshes coyote. Subsequent frames decrement
      // BEFORE checking jump eligibility. Ignore tiny positive residue at zero:
      // test one frame before nominal closure and one frame after it.
      const closingFrame = Math.ceil(tuning.coyoteSeconds / dt - 1e-9);
      const jumpFrame = closingFrame + (inside ? -1 : 1);
      game.stepFrames(jumpFrame - 1, { right: true });
      const before = game.getPlayerState();
      game.stepFrames(1, { right: true, jump: true });
      return { departure, before, after: game.getPlayerState(), tuning, dt, jumpFrame };
    }
    return { inside: attempt(true), outside: attempt(false) };
  });
  for (const [name, trial] of Object.entries(result)) {
    near(trial.departure.coyote, trial.tuning.coyoteSeconds, `${name}: departure refreshes coyote`);
    near(trial.after.coyote, trial.tuning.coyoteSeconds - trial.jumpFrame * trial.dt,
      `${name}: eligibility uses decremented timer`);
    assert.equal(trial.before.onGround, false, `${name}: starts airborne`);
    assert.equal(trial.before.onWall, false, `${name}: not a wall-coyote test`);
    assert.equal(trial.after.onGround, false, `${name}: remains airborne`);
    assert.equal(trial.after.onWall, false, `${name}: no wall interference`);
  }
  const { inside, outside } = result;
  near(inside.departure.x, outside.departure.x, 'both cases use the same ledge departure');
  assert.ok(inside.after.coyote > movementTolerance, 'inside: one frame remains');
  near(inside.after.vy, -inside.tuning.jumpVelocity + gravity * inside.dt, 'inside: jump succeeds');
  assert.equal(inside.after.state, 'rising');
  assert.ok(outside.after.coyote < -movementTolerance, 'outside: window has closed');
  near(outside.after.vy, outside.before.vy + gravity * outside.dt, 'outside: falls without a jump impulse');
  assert.ok(outside.after.vy > movementTolerance, 'outside: still descending');
  assert.equal(outside.after.state, 'falling');
});


test('portal preserves momentum (wave-dash)', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t);
  const portalSource = await readFile(new URL('../public/bladefall-portals.js', import.meta.url), 'utf8');
  const minimum = Number(portalSource.match(/settings\.minimumExitSpeed\) \|\| ([\d.]+)/)?.[1]);
  const maximum = Number(portalSource.match(/settings\.maximumExitSpeed\) \|\| ([\d.]+)/)?.[1]);
  const result = await page.evaluate(() => {
    const game = window.__BF.tas;
    game.resetGame({ preset: 'portal-momentum' });
    const tuning = window.__BF.movementState().profile.tuning;
    const dt = window.__BF.simulation.fixedDt;
    const dashResponse = window.__BF.platformer.profiles.precision.dash;
    const pair = window.__BF.portalPairs().find(pair => pair.id === 'fixed:tas-momentum');
    const exitNormal = { x: pair.b.nx, y: pair.b.ny };
    let transit = null;
    // Observe the existing event immediately after transport, before the rest
    // of this frame adds gravity. No new harness observation API or state edits.
    const off = window.__BF.runtime.events.on('portal:transit', receipt => {
      if (receipt.kind === 'player' && receipt.pairId === pair.id) {
        const p = window.__BF.G.p;
        transit = { vx: p.vx, vy: p.vy, receipt };
      }
    });
    let before, after;
    try {
      for (let i = 0; i < 60 && !transit; i++) {
        before = game.getPlayerState();
        game.stepFrames(1, { right: true, dash: true });
        after = game.getPlayerState();
      }
    } finally { off(); }
    return { before, after, transit, tuning, dt, dashResponse, exitNormal,
      ownsPair: window.__BF.hasCapability('portal-pair') };
  });
  assert.ok(result.transit, 'must actually traverse the authored pair');
  assert.equal(result.ownsPair, true, 'reset preset grants session portal abilities');
  const { before, after, transit, tuning, dt, dashResponse, exitNormal } = result;
  assert.equal(before.onGround, true, 'entry approach is on flat ground');
  assert.equal(before.onWall, false, 'no wall collision changes approach speed');
  assert.ok(before.dodgeTimer > dt, 'entry occurs during the scripted dash');
  near(before.vy, 0, 'entry has no vertical velocity');
  // Horizontal dash acceleration precedes transit. Derive the entry velocity
  // from the actual tuning rather than using the previous frame's speed.
  const targetVx = tuning.runSpeed * tuning.dashSpeedMultiplier;
  const entrySpeed = before.vx + (targetVx - before.vx) * Math.min(1, dashResponse * dt);
  assert.ok(Number.isFinite(minimum) && Number.isFinite(maximum), 'read transport clamp from source');
  assert.ok(entrySpeed > minimum + 100 && entrySpeed < maximum - 100,
    'entry speed is comfortably inside the clamp');
  near(Math.hypot(transit.vx, transit.vy), entrySpeed, 'transport preserves speed magnitude');
  near(transit.vx, exitNormal.x * entrySpeed, 'exit follows horizontal mouth normal');
  near(transit.vy, -exitNormal.y * entrySpeed, 'exit follows vertical mouth normal (vy points down)');
  assert.equal(after.onGround, false, 'exit launches the player');
  assert.equal(after.state, 'portal-ballistic');
  near(after.vx, transit.vx, 'post-transit horizontal momentum');
  near(after.vy, transit.vy + gravity * dt, 'end-of-frame velocity includes gravity after transit');
});


test('TAS restores complete state for byte-identical branches', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t);
  const results = await page.evaluate(async () => {
    const game = window.__BF.tas, results = [];
    for (const preset of [undefined, 'portal-momentum']) {
      game.resetGame(preset ? { preset } : undefined);
      const inputs = preset ? { right: true, dash: true } : { right: true };
      const n = preset ? 5 : 30;
      game.stepFrames(n, inputs);
      const saved = game.saveState('branch');
      const first = [];
      for (let i = 0; i < 10; i++) {
        game.stepFrames(1, inputs);
        first.push(game.saveState('first'));
      }
      const end = game.getPlayerState();
      await new Promise(resolve => setTimeout(resolve, 30));
      game.restoreState('branch');
      if (game.saveState('restored') !== saved) throw new Error('Immediate restore differs: ' + preset);
      const second = [];
      for (let i = 0; i < 10; i++) {
        game.stepFrames(1, inputs);
        second.push(game.saveState('second'));
      }
      for (let i = 0; i < 10; i++) {
        if (first[i] !== second[i]) {
          let at = 0; while (first[i][at] === second[i][at]) at++;
          throw new Error(`Full-state mismatch ${preset || 'ground'} frame ${i+1} at ${at}: `
            + first[i].slice(at-120, at+180) + ' vs ' + second[i].slice(at-120, at+180));
        }
      }
      // An unrelated branch must not mutate the stored checkpoint or its edges.
      game.restoreState('branch');
      game.stepFrames(10, { left: true, jump: true });
      game.restoreState('branch');
      if (game.saveState('reused') !== saved) throw new Error('Save mutated by alternate branch');
      if (window.__BF.G.p.floorPlat && !window.__BF.G.obstacles.includes(window.__BF.G.p.floorPlat))
        throw new Error('Player support reference detached from world');
      results.push({ scenario: preset || 'ground', savedFrame: n, comparedFrames: 10,
        byteIdentical: true, serializedBytes: new TextEncoder().encode(first.at(-1)).length, end });
    }
    return results;
  });
  assert.equal(results.length, 2);
  console.log('Save/restore verification:', JSON.stringify(results));
});


test('normal campaign startup stays grounded and accepts keyboard movement', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t, { tas: false });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal(await page.evaluate(() => window.__BF.tas), null, 'normal play must not enable TAS');
  assert.equal(await page.evaluate(() => typeof window.BladefallHarness), 'undefined');
  // Exercise the real title button, intro, default (70, 0) spawn and automatic
  // engine loop. The clean TAS spawn at (350, 0) bypasses this entire path.
  await page.click('#newBtn');
  await page.waitForSelector('#cutscene:not(.hide) #cutSkip', { visible: true });
  await page.click('#cutSkip');
  await page.waitForFunction(() => window.__BF.mode === 'play' && window.__BF.simulation.tick >= 120);
  const idle = await page.evaluate(() => {
    const p = window.__BF.G.p;
    return { x: p.x, y: p.y, vy: p.vy, onGround: p.onGround };
  });
  near(idle.x, 70, 'real default spawn');
  near(idle.y, 0, 'no automatic lift at spawn');
  near(idle.vy, 0, 'no automatic spring impulse at spawn');
  assert.equal(idle.onGround, true);
  await page.keyboard.down('ArrowRight');
  try {
    await page.waitForFunction(() => window.__BF.G.p.x > 300, { timeout: 4000 });
  } finally { await page.keyboard.up('ArrowRight'); }
  const moved = await page.evaluate(() => ({ x: window.__BF.G.p.x, y: window.__BF.G.p.y, onGround: window.__BF.G.p.onGround }));
  near(moved.y, 0, 'can walk beneath the dormant western machinery');
  assert.equal(moved.onGround, true);
  await page.keyboard.down('Space');
  try {
    await page.waitForFunction(() => window.__BF.G.p.y > 20 && window.__BF.G.p.vy < 0, { timeout: 2000 });
  } finally { await page.keyboard.up('Space'); }
  await page.waitForFunction(() => window.__BF.G.p.onGround, { timeout: 2000 });
  const landed = await page.evaluate(() => ({ x: window.__BF.G.p.x, y: window.__BF.G.p.y }));
  near(landed.y, 0, 'normal keyboard jump lands on opening floor');
  assert.deepEqual(errors, [], 'normal updates and rendering must not throw');
  console.log('Normal startup verification:', JSON.stringify({ idle, moved, landed }));
});


test('western return machinery stays locked until its authored world requirement opens', { timeout: 60000 }, async (t) => {
  const page = await openMovementHarness(t);
  const rows = await page.evaluate(() => {
    const game = window.__BF.tas, rows = [];
    for (const setup of [
      { label: 'fresh campaign', select: false, grip: false, seal: false, open: false },
      { label: 'Grip before Archive key', select: false, grip: true, seal: false, open: false },
      { label: 'campaign return with seal', select: false, grip: true, seal: true, open: true },
      { label: 'fresh level select', select: true, grip: false, seal: false, open: false },
      { label: 'fresh preview ignores campaign seal', select: true, grip: false, seal: true, open: false },
      { label: 'equipped level-select return', select: true, grip: true, seal: false, open: true },
    ]) {
      game.resetGame();
      const g = window.__BF.G;
      g.levelSelectMode = setup.select;
      g.sessionCapabilities = window.BladefallCapabilities.createState({ acquired: setup.grip ? ['jump','wall-jump'] : ['jump'] });
      window.__BF.meta.world.keepWestSealOpen = setup.seal;
      const draft = g.obstacles.find(o => o.type === 'updraft' && o.westernBreach);
      const spring = g.obstacles.find(o => o.type === 'spring' && o.westernBreach);
      const active = activeEnvironmentFields().includes(draft);
      // Isolate the authored spring from the draft to observe its own gate.
      // This is a test fixture only; the public harness gains no state editor.
      draft.gone = true;
      g.p.x = spring.x; g.p.y = spring.y + 5; g.p.vy = 60; g.p.onGround = false; g.p.floorPlat = null;
      game.stepFrames(1, {});
      rows.push({ ...setup, active, vy: g.p.vy, power: spring.pow });
    }
    return rows;
  });
  for (const row of rows) {
    assert.equal(row.active, row.open, `${row.label}: draft eligibility`);
    if (row.open) near(row.vy, -row.power, `${row.label}: spring activates`);
    else assert.ok(row.vy >= -movementTolerance, `${row.label}: spring must not launch`);
  }
});
