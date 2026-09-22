// A LEVEL'S FLOOR IS NOT ALWAYS THE WORLD'S.
//
// For thirteen regions the ground was world zero, so a literal 0 and "the floor"
// were the same number, and every shared installer and recovery rule wrote
// whichever it felt like. Emberdeep's rooms stand 640 units up. Every one of those
// literals became a bug at once: the counter was installed inside the fill, the
// camera framed the road along the top of the screen with two thirds of the view
// inside the plateau, and the essential relay traveler who stepped into the pour
// channel lodged under the world and never came back — which alone made the region
// uncompletable, because the gated bridges east of her need her on a pad.
//
// These pin the RULE rather than those three instances: a level declares its floor,
// and everything that positions or rescues reads it from there. A fourth region
// with a datum gets the same protection without a new test.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

function fn(name){
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists');
  const brace = source.indexOf('{', start); let depth = 0;
  for(let i = brace; i < source.length; i++){
    if(source[i] === '{') depth++;
    else if(source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error('unterminated ' + name);
}

// Run the two readers for real against stand-in levels, so the contract is tested
// rather than its spelling.
function evaluate(stage, levels, extra){
  const ctx = vm.createContext(Object.assign({
    G: { stageIndex: stage },
    CUSTOM_LEVELS: levels,
    updraftsVoidFloor: () => -50,
  }, extra || {}));
  vm.runInContext(fn('levelFloorY') + '\n' + fn('cameraMinimumY'), ctx);
  return ctx;
}

const PLAIN = { 5: { len: 1000 } };
const PLATEAU = { 9: { len: 16400, datum: 640, datumDescent: { from: 14800, to: 16060, y: 0 } } };

test('a level without a datum is left exactly as it was', () => {
  const ctx = evaluate(5, PLAIN);
  for(const x of [0, 500, 20000, -40])
    assert.equal(ctx.levelFloorY(x), 0, 'the floor moved under a level that never asked');
  for(const y of [0, 300, -80])
    assert.equal(ctx.cameraMinimumY({ x: 400, y }), 0, 'the camera clamp moved under a plain level');
  // Including a stage with no custom level at all.
  const bare = evaluate(14, PLAIN);
  assert.equal(bare.levelFloorY(900), 0);
  assert.equal(bare.cameraMinimumY({ x: 900, y: 0 }), 0);
});

test('a level with a datum reports its own floor, and the ground you can count on', () => {
  const ctx = evaluate(9, PLATEAU);
  assert.equal(ctx.levelFloorY(330), 640, 'the plateau is the floor of rooms 1-5');
  assert.equal(ctx.levelFloorY(14800), 640, 'up to the head of the descent');
  // Past the head the answer is deliberately the LOWER datum, not an interpolation.
  // The Deep Stair switches back on itself, so two landings share an x; anything
  // asking "has this fallen out of the world" must never fire on a good landing.
  assert.equal(ctx.levelFloorY(14990), 0, 'a switchback landing is not out of the world');
  assert.equal(ctx.levelFloorY(16400), 0);
});

test('the camera may not look below the floor, nor clamp above the player’s feet', () => {
  const ctx = evaluate(9, PLATEAU);
  // Standing on the plateau, the clamp is the plateau: this is the whole bug. A 0
  // here puts the camera 354 units inside solid rock.
  assert.equal(ctx.cameraMinimumY({ x: 330, y: 640 }), 640);
  assert.equal(ctx.cameraMinimumY({ x: 10000, y: 640 }), 640);
  // Jumping does not drag the clamp up with you — the ground is still the ground.
  assert.equal(ctx.cameraMinimumY({ x: 10000, y: 1090 }), 640);
  // On the switchbacks the eased line runs above the landing you are standing on,
  // and a clamp above your feet pushes you off the bottom of the screen.
  for(const [x, y] of [[14990, 260], [15180, 440], [15930, 110], [16150, 0]])
    assert.ok(ctx.cameraMinimumY({ x, y }) <= y, `clamped above the floor at ${x}`);
  // It eases down the descent instead of dropping the instant you cross its head.
  const head = ctx.cameraMinimumY({ x: 14801, y: 640 });
  assert.ok(head > 500, 'the clamp falls off a cliff at the head of the stair');
  assert.ok(ctx.cameraMinimumY({ x: 15400, y: 640 }) < head, 'and it does descend');
  // A shaft that genuinely runs below the world floor still wins.
  const deep = evaluate(10, { 10: { len: 100, datum: 0 } }, { updraftsVoidFloor: () => -1400 });
  assert.equal(deep.cameraMinimumY({ x: 50, y: 0 }), -1400);
});

test('the camera frame asks for the level’s floor, not a literal zero', () => {
  const frame = source.slice(source.indexOf('const cameraFrame='), source.indexOf('G.cam=cameraFrame.x'));
  assert.match(frame, /minimumY:cameraMinimumY\(p\)/);
  assert.doesNotMatch(frame, /minimumY:[^,]*\?[^,]*:0,/, 'the camera still falls back to world zero');
});

test('everything installed into a level lands on that level’s ground', () => {
  // The regional counter. This one was floating 640 units under its own plateau,
  // visible in the dark and impossible to reach.
  const shop = fn('applyRegionalShop');
  assert.match(shop, /type:'shop'[^}]*y:levelFloorY\(shop\.x\)/, 'the counter installs at world zero');
  assert.doesNotMatch(shop, /type:'shop'[^}]*,y:0,/);
  // The rest site prefers its authored anchor; its silent ratio fallback must still
  // land on the level's floor when it finds nothing to stand on.
  assert.match(fn('compatibilityRecoveryPosition'), /return\{x:targetX,y:levelFloorY\(targetX\),/);
  // And Emberdeep's door back to the White Court, which was buried by the plateau.
  assert.match(fn('installCourtConnections'), /CourtScenery\(180,ED,'court-doors'/);
  // And the Muster recall. Its rows were authored at y=0 for a flat Emberdeep, so
  // once the rooms went up every standard and soldier spawned inside the rock — the
  // owner saw a banner and a soldier standing in the stair sump. A row's y is now
  // its height above the level's floor, for every region.
  const muster = fn('installMusterRoster');
  assert.match(muster, /const \[type,x,dy,lo,hi,extra\]=row,y=levelFloorY\(x\)\+\(dy\|\|0\)/,
    'the recall roster places at world zero again');
});

test('falling out of the world is measured from the floor of the level you are in', () => {
  // The NPC block. Sera fell 680 units into rock and the rescue never fired, because
  // it was written against world zero. She is the relay: the region cannot be
  // finished without her.
  const npc = source.slice(source.indexOf('// OUT OF THE WORLD, MEASURED FROM'),
                           source.indexOf('// Companions ride the mouths too'));
  assert.ok(npc.length > 200 && npc.length < 2000, 'the NPC out-of-world block moved');
  assert.match(npc, /if\(n\.y<levelFloorY\(n\.x\)-60\)/, 'the threshold is world zero again');
  assert.match(npc, /n\.y=levelFloorY\(n\.relayHome\)/, 'a home recall still lands at world zero');
  assert.match(npc, /p\.y>levelFloorY\(p\.x\)-60/, 'the player-is-in-the-world check is world zero');
  assert.doesNotMatch(npc, /n\.y=0[;,]/, 'a recall still drops the traveler to world zero');
  // Crates recover to their authored origin, but only once they have fallen far
  // enough to notice — which on a plateau was a 700-unit drop.
  assert.match(source, /if\(o\.y<levelFloorY\(o\.x\)-60\)\{\s*\n?\s*o\.x=o\.x0/,
    'a shoved crate still waits for world zero before it resets');
});

test('the declared descent agrees with the death plane', () => {
  // Two numbers that must not drift: where the plateau stops being the floor, and
  // where the rewind stops being the plateau's. updraftsVoidFloor is pinned
  // separately and deliberately written stage-first, so this reads it as text.
  const level = source.slice(source.indexOf('const EMBERDEEP_LEVEL='), source.indexOf('\nconst CUSTOM_LEVELS='));
  const descent = /datumDescent:\{from:(\d+),to:(\d+),y:(\d+)\}/.exec(level);
  assert.ok(descent, 'Emberdeep no longer declares where its plateau ends');
  const plane = /G\.stageIndex===9&&p\.x<(\d+)\)return ED-160/.exec(fn('updraftsVoidFloor'));
  assert.ok(plane, 'the plateau death plane moved');
  assert.equal(descent[1], plane[1], 'the descent head and the death plane disagree');
  assert.equal(Number(descent[3]), 0, 'the stair is supposed to reach the world floor');
  assert.ok(Number(descent[2]) > Number(descent[1]), 'the descent runs east');
  // And the level it belongs to actually declares the datum they describe.
  assert.match(level, /datum:ED,/);
});

test('only the two readers know what a datum is', () => {
  // THE RULE THAT KEEPS THE NEXT PLATEAU HONEST. This bug happened because "the
  // floor" was common knowledge written as a literal 0 in half a dozen unrelated
  // places. The cure is not to teach those places about datums — it is to keep the
  // knowledge in one reader they all call. If a third function starts reading
  // `.datum` to work out where something goes, the spread has started again.
  const readers = new Set();
  // Property READS only — `datum:` and `datumDescent:` in a level literal are the
  // declaration this rule exists to protect, not a second interpreter of it.
  for(const m of source.matchAll(/\.datum\b|\.datumDescent\b/g)){
    const before = source.slice(0, m.index);
    const at = before.lastIndexOf('function ');
    const name = /^function ([A-Za-z0-9_]+)/.exec(source.slice(at))?.[1];
    if(name) readers.add(name);
  }
  assert.deepEqual([...readers].sort(), ['cameraMinimumY', 'levelFloorY'],
    'something other than the two readers is interpreting a level datum');
});

test('a declared descent is well formed, and nothing declares one without a datum', () => {
  const table = /const CUSTOM_LEVELS=\{([^}]*)\}/.exec(source)[1];
  const named = [...new Set([...table.matchAll(/\d+:([A-Z_]+)/g)].map(m => m[1]))];
  let withDatum = 0;
  for(const name of named){
    const start = source.indexOf('const ' + name + '=');
    if(start < 0) continue;                       // LEVELS[n] entries live elsewhere
    const body = source.slice(start, source.indexOf('\n};', start));
    const head = body.slice(0, body.indexOf('objects:'));
    const hasDatum = /\bdatum:/.test(head), descent = /datumDescent:\{([^}]*)\}/.exec(head);
    if(descent) assert.ok(hasDatum, `${name} declares a descent but no datum to descend from`);
    if(!hasDatum) continue;
    withDatum++;
    // A raised level has to say where its arrival lands, or the seam falls back to
    // a side ratio and drops the run into the fill.
    assert.match(head, /spawnY:/, `${name} raises its floor but does not say where you arrive`);
    if(descent){
      const d = Object.fromEntries(descent[1].split(',').map(p => p.split(':').map(s => s.trim())));
      assert.ok(Number(d.to) > Number(d.from), `${name}'s descent does not run forward`);
      assert.ok(Number.isFinite(Number(d.y)), `${name}'s descent has no target height`);
    }
  }
  assert.ok(withDatum >= 1, 'no level declares a datum — has the plateau been flattened?');
});
