// Emberdeep, rebuilt on the pour cycle. These checks guard the constitution rules
// the first pass broke — travel by place, one recollection, no loot, no signage,
// nothing authored above the jump ceiling — and the clock the region is built on.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const renderer = await read('bladefall-respec-renderer.js');
const campaign = await read('bladefall-campaign.js');

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
function fn2(src, name){
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists in the renderer');
  const brace = src.indexOf('{', start); let depth = 0;
  for(let i = brace; i < src.length; i++){
    if(src[i] === '{') depth++;
    else if(src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw Error('unterminated ' + name);
}
const start = source.indexOf('const EMBERDEEP_LEVEL='),
      end = source.indexOf('\nconst CUSTOM_LEVELS=', start);
assert.ok(start >= 0 && end > start);
// The slice runs to CUSTOM_LEVELS, so it evaluates every later level too; SlateWall is
// declared far above it and the Drowned Throne is the first level in here to use one.
const ctors = ['Pl','Gr','Wl','Slate','SlateWall','Check','LPortal','Anchor','DoorSeal','Plate','Scenery','Fluid','CoinOb','Sp','Br','Trap',
  'StoryRelic','SealedRecollection','ElementBeat','EmberBeat','EmberScenery','EmberVent','Heat','Slag','Spout','GrAt','Landing','Seam'];
const ED = Number(/\nconst ED=(\d+);/.exec(source)[1]);
// The slice runs to CUSTOM_LEVELS, so it evaluates the Drowned Throne too — including
// its beach band, whose y is declared beside two siblings on one line.
const THRONE_BEACH_Y = Number(/THRONE_BEACH_Y=(-?\d+)/.exec(source)[1]);
const LEVEL = vm.runInNewContext('const ED=' + ED + ';const THRONE_BEACH_Y=' + THRONE_BEACH_Y + ';\n' + ctors.map(fn).join('\n') + '\n' + source.slice(start, end) + ';EMBERDEEP_LEVEL',
  { Math, Object });
const at = p => LEVEL.objects.filter(p);
const V4_LAST = Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]);
const CEILING = (480 * 480) / 2800 + (450 * 450) / 2800;      // 154.6: a double jump from flat
const WALL_JUMP = (500 * 500) / 2800;                         // 89.3: one push off a rune face
const span = o => ({ left: o.x - o.w / 2, right: o.x + o.w / 2 });

test('registered, volcano, and inside the v4 boundary', () => {
  assert.equal(LEVEL.len, 16400);
  assert.match(source, /9:EMBERDEEP_LEVEL/);
  assert.match(campaign, /name: 'Emberdeep', len: 16400, theme: 'volcano'/);
  assert.ok(V4_LAST >= 9);
});

test('travel is a place, never a completion portal', () => {
  assert.equal(LEVEL.portal, null);
  assert.equal(LEVEL.physicalExit, 'emberdeep-colossus');
  assert.ok(at(o => o.physicalSeam === 'emberdeep-colossus').length >= 1, 'the Deep Stair is a real seam');
  const spec = fn('physicalSeamSpec');
  assert.match(spec, /G\.stageIndex===9&&G\.p\.x>G\.levelLength\/2/);
  assert.match(spec, /connector:'emberdeep-colossus'[\s\S]*?targetStage:10/);
});

test('the pour cycle is one clock with three readings', () => {
  const slabs = at(o => o.heatCycle), spouts = at(o => o.pourSpout), slag = at(o => o.slagCycle);
  assert.ok(slabs.length >= 8, 'a region built on heat-state stone');
  assert.ok(spouts.length >= 5, 'the spouts are the tell');
  // The owner cut every falling weight (2026-09-19): they shook the screen, cluttered
  // the rooms and let the high line skip the lesson. The clock is slabs and spouts.
  assert.equal(slag.length, 0, 'a falling weight is back in Emberdeep');
  for(const s of slabs){
    const c = s.heatCycle;
    assert.ok(c.period > 0 && c.molten > 0 && c.set > c.molten && c.set < 1,
      'molten, then setting, then cold — in that order and all three present');
  }
  // A spout and the slab under it must share a clock, or the tell lies.
  for(const sp of spouts){
    const under = slabs.find(s => Math.abs(s.x - sp.x) < 120);
    if(!under) continue;
    assert.equal(under.heatCycle.period, sp.pourSpout.period, `spout at ${sp.x} runs its own slab's clock`);
    assert.equal(under.heatCycle.phase, sp.pourSpout.phase);
  }
  // Neighbouring slabs must be staggered or the "rhythm" is one wide platform.
  const run = slabs.filter(s => s.x > 3400 && s.x < 5400).sort((a, b) => a.x - b.x);
  for(let i = 1; i < run.length; i++)
    assert.notEqual(run[i].heatCycle.phase, run[i - 1].heatCycle.phase, 'no two neighbours fire together');
});

test('room 2 is read, not guessed: every slab sets a beat after the one behind it', () => {
  // The owner's words for this challenge: wait for the platform to not be lava, then
  // jump onto it while it is solid. That is only possible if the slab AHEAD sets
  // while the one under you is still stone — so each slab's phase trails its west
  // neighbour's by one beat. The old order ran the other way: the slab ahead melted
  // first and you had to be airborne across the moment your own slab opened, with
  // two falling weights as the only places to stand. Measured in-engine: a bot that
  // only ever waits-then-jumps crosses from every one of 40 arrival times.
  const run = at(o => o.heatCycle && o.x > 3300 && o.x < 5600).sort((a, b) => a.x - b.x);
  assert.equal(run.length, 8, 'eight slabs, and nothing standing in for one');
  const P = run[0].heatCycle.period, M = run[0].heatCycle.molten * P;
  const solid = (s, t) => ((((t + s.heatCycle.phase) % P) + P) % P) >= M;
  for(let i = 1; i < run.length; i++){
    const west = run[i - 1], east = run[i];
    assert.equal(east.heatCycle.period, P);
    const lag = (((west.heatCycle.phase - east.heatCycle.phase) % P) + P) % P;
    assert.ok(Math.abs(lag - 1.4) < 1e-9, `slab at ${east.x} does not set one beat after ${west.x}`);
    let best = 0, span = 0;
    for(let t = 0; t < 2 * P; t += .005){ if(solid(west, t) && solid(east, t)) best = Math.max(best, span += .005); else span = 0; }
    assert.ok(best >= 1.3, `the hop onto ${east.x} gives only ${best.toFixed(2)}s with both slabs solid`);
  }
});

test('cold stone says when it is about to open, earlier than a hop takes', () => {
  // Cold stone used to look the same until the instant it went molten, so the
  // safest-looking slab on screen was the one with a quarter-second left.
  const upd = fn('updateHeatStone');
  assert.match(upd, /o\.heatWarn=0;/, 'the tell is cleared every frame');
  const lead = /if\(state===HEAT_COLD\)\{const f=heatFractionOf\(o\);if\(f>([\d.]+)\)o\.heatWarn=/.exec(upd);
  assert.ok(lead, 'cold stone no longer warns before it opens');
  // A full double-jump hop is ~1s in the air; at a 20% lead (0.84s) the bot still
  // left for un-glowing stone and landed on lava. The lead must outlast the hop.
  assert.ok((1 - Number(lead[1])) * 4.2 >= 1.2, 'the warning is shorter than a hop');
  assert.match(renderer, /if\(o\.heatWarn > 0\)\{/, 'the renderer draws the tell');
  assert.doesNotMatch(/if\(o\.heatWarn > 0\)\{[\s\S]{0,400}?\}/.exec(renderer)[0], /Math\.sin\(time/,
    'the tell must be steady, not a strobe — flash reduction has nothing to suppress');
});

test('the runtime actually drives the three states, and molten is a hole', () => {
  assert.match(source, /const HEAT_MOLTEN=0,HEAT_SETTING=1,HEAT_COLD=2;/);
  const upd = fn('updateHeatStone');
  assert.match(upd, /o\.gone=state===HEAT_MOLTEN/, 'molten removes footing');
  assert.match(upd, /o\.ice=state===HEAT_SETTING\?1:0/, 'setting is slick');
  assert.match(upd, /if\(o\.heatSet\)/, 'a slab set by the strike stays set');
  const slagUpd = fn('updateSlagRain');
  assert.match(slagUpd, /o\.state='warn'/);
  assert.match(slagUpd, /o\.state==='landed'/, 'slag lands as footing before it sinks');
});

test('Oren inherits the clock instead of a health bar', () => {
  const pad = at(o => o.heatPad)[0], slab = at(o => o.heatPadFloor)[0];
  assert.ok(pad && slab, 'the seal pad sits on a slab of the cycle');
  assert.ok(Math.abs(pad.x - slab.x) < 160);
  const upd = fn('updateEmberdeep');
  assert.match(upd, /slab\.heatState===HEAT_MOLTEN/);
  assert.match(upd, /n\.relayHold=false;n\.padWaiting=true/, 'he steps clear of a pour');
  assert.match(upd, /n\.relayHold=true;n\.padWaiting=false/, 'and returns once it sets');
});

// The region no longer sits at y=0, so "reachable" is measured against the LOCAL
// floor: the highest deep slab at or below a tier, within a screen of it. A tier is
// answered by that floor, by a lower tier, or by a rune face beside it.
const deeps = at(o => o.type === 'plat' && o.deep).map(o => ({ y:o.y, ...span(o) }));
const localFloor = t => {
  let best = 0;
  for(const g of deeps) if(g.y <= t.y && g.right > t.x - 3000 && g.left < t.x + 3000 && g.y > best) best = g.y;
  return best;
};

test('every authored tier can be stood on, at the new datum', () => {
  const tiers = at(o => o.type === 'plat' && !o.deep).map(o => ({ x:o.x, y:o.y, ...span(o) }));
  const walls = at(o => o.type === 'wall' && o.clingSurface && !o.slickL);
  for(const t of tiers){
    if(t.y - localFloor(t) <= CEILING) continue;             // a step off the floor it stands over
    const step = tiers.some(o => o !== t && o.y < t.y && t.y - o.y <= CEILING &&
      o.right > t.left - 240 && o.left < t.right + 240);
    const chimney = walls.some(w => Math.abs(w.x - t.x) < 150 && w.y + WALL_JUMP >= t.y && w.y - w.h <= t.y);
    assert.ok(step || chimney, `tier at ${t.x} is ${t.y} with no step or face under it`);
  }
});

test('rooms 1-5 stand on a plateau, and room 6 walks you down off it', () => {
  assert.equal(LEVEL.spawnY, ED, 'you arrive on the plateau, not under it');
  assert.equal(LEVEL.datum, ED);
  assert.ok(ED >= 600, 'a descent worth the name');
  // Every authored floor west of the stair is at the datum, and it is SOLID rock
  // to the world floor rather than a shelf with open air beneath it.
  for(const g of deeps){
    if(g.left >= 14800) continue;
    assert.equal(g.y, ED, `a floor at ${g.left} is off the datum`);
    assert.ok(g.y - (at(o => o.deep && o.x === (g.left + g.right) / 2)[0].h) <= 0,
      'the plateau is filled to the world floor, so nothing walks under it');
  }
  // The stair: four flights, a landing each, and the foot at the world's own datum.
  const landings = at(o => o.emberLanding).sort((a, b) => b.y - a.y);
  assert.ok(landings.length >= 3, 'a recovery landing per flight');
  assert.ok(landings[0].y < ED && landings[landings.length - 1].y < 160, 'they descend');
  const foot = deeps.filter(g => g.y === 0);
  assert.ok(foot.length === 1 && foot[0].right >= 16400, 'and the shaft floor runs out east at y=0');
  assert.ok(at(o => o.physicalSeam === 'emberdeep-colossus')[0].y === 0, 'so the east seam is an edge walk');
  // Stepping off the head of the stair costs a rewind, not the whole descent.
  const sump = at(o => o.id === 'emberdeep-stair-sump')[0];
  assert.ok(sump && sump.kind === 'lava');
  assert.ok(span(sump).left < 15200 && span(sump).right > 14900, 'the sump lies under the head');
  assert.match(fn('updraftsVoidFloor'), /G\.stageIndex===9&&p\.x<14800\)return ED-160/,
    'and the plateau rooms rewind at their own depth, not 640 units down');
  const arrival = fn('compatibilityZoneArrival');
  assert.match(arrival, /sorcerer-emberdeep'&&plan\.targetZoneId==='emberdeep'\)\{x=330;y=ED;\}/);
  assert.match(arrival, /emberdeep-colossus'&&plan\.targetZoneId==='emberdeep'/);
});

test('room 2 is one line over one clock, and everyone crosses it', () => {
  // The owner cut the chimney, the whole high line and its weights (2026-09-19): it
  // let a player climb over the lesson instead of learning it. Nothing may put a way
  // round it back.
  assert.equal(at(o => o.emberHighLine).length, 0, 'the high line is back');
  assert.equal(at(o => o.type === 'wall' && o.clingSurface && o.x > 2700 && o.x < 6000).length, 0,
    'a climbable face is back in room 2');
  const over = at(o => o.type === 'plat' && !o.deep && !o.heatCycle && o.x > 3300 && o.x < 5600);
  assert.equal(over.length, 0, `something to stand on besides the slabs, over the channel: ${over.map(o => o.x)}`);
  // Every hop is inside a measured double jump. From 24 in from the lip, a full
  // double jump covers 196 at +90 and 176 at +125 on the way down (in-engine).
  const run = at(o => o.heatCycle && o.x > 3300 && o.x < 5600).sort((a, b) => a.x - b.x);
  const lips = [{ right: 3300, y: ED }, ...run.map(s => ({ ...span(s), y: s.y }))];
  for(let i = 1; i < lips.length; i++){
    const from = lips[i - 1].right - 24, to = lips[i], rise = to.y - lips[i - 1].y;
    assert.ok(rise <= 90, `the hop onto ${to.left} rises ${rise}`);
    assert.ok(to.left + 10 - from <= 176, `the hop onto ${to.left} is ${to.left + 10 - from} long`);
  }
  // The coin rides the rhythm: out of reach of a single jump from the slab under it
  // (feet +82, centre +22, pickup 38), inside a double jump's (feet +148).
  const coin = at(o => o.type === 'coin' && o.x > 2700 && o.x < 6000);
  assert.equal(coin.length, 1, 'room 2 keeps exactly one coin');
  const under = run.find(s => Math.abs(s.x - coin[0].x) < 20);
  assert.ok(under, 'and it hangs over a slab');
  assert.ok(coin[0].y - under.y > 82 + 22 + 38, 'a single jump takes it — it is not a detour');
  assert.ok(coin[0].y - under.y <= 148 + 22 + 38, 'a double jump cannot reach it');
});

test('the kit and the metrics', () => {
  // Two chimneys used to stand west of the stair, one over the lesson in room 2
  // and one beside the seal arch leading to an empty shelf. The owner cut both.
  // The only faces left are the stair's controlled drop.
  const walls = at(o => o.type === 'wall' && o.clingSurface && !o.slickL);
  const westFaces = walls.filter(w => w.x < 14400);
  assert.equal(westFaces.length, 0, `a climbable face is back west of the stair: ${westFaces.map(w => w.x)}`);
  assert.equal(walls.length, 2, 'the stair keeps its two faces');
  assert.equal(at(o => o.emberLookout).length, 0, 'the empty lookout is back');
  // The region's vertical is the DESCENT, not a climb: west of the stair nothing
  // sits more than a double jump above the plateau.
  const tiers = at(o => o.type === 'plat' && !o.deep);
  for(const t of tiers.filter(t => t.x < 14400))
    assert.ok(t.y - ED <= 170, `a tier at ${t.x} stands ${t.y - ED} over the plateau`);
  const overBand = tiers.filter(t => t.y - localFloor(t) > 450);
  assert.ok(overBand.length / tiers.length < 0.12, 'nine tiers in ten sit inside the readable band');
  // The clock has residents that use it, not six of the same walker.
  const types = LEVEL.enemies.map(e => e.t);
  assert.equal(types.filter(t => t === 'slagwright').length, 2, 'two that GIVE ground');
  assert.equal(types.filter(t => t === 'cinderling').length, 2, 'and a pair that takes it away');
  assert.ok(types.filter(t => t === 'emberling').length <= 3, 'the plain walker is no longer the region');
  for(const e of LEVEL.enemies) assert.ok(e.y === ED || e.y > ED, 'every resident stands on the plateau');
});

test('the stair shows you the next region without a word', () => {
  const dead = at(o => o.deadLadle)[0], mould = at(o => o.deadMould)[0];
  assert.ok(dead && mould, 'a jammed ladle over the stone that jammed it');
  assert.equal(dead.seized, 1, 'it is not running');
  assert.equal(mould.heatSet, true, 'and the mould under it is set cold for good');
  assert.ok(Math.abs(dead.x - mould.x) < 40);
  assert.equal(at(o => o.type === 'sign').length, 0, 'nothing says what it is');
  assert.match(renderer, /deadLadle/, 'the renderer knows it is a corpse, not a machine');
});

test('the backdrop never shows sky underground', () => {
  assert.match(renderer, /const INTERIOR_STAGES = new Set\(\[9, 10, 11, 12\]\)/, 'and the Citadel joined it in Run 5');
  assert.match(renderer, /function drawInteriorBackdrop/);
  assert.match(renderer, /if\(interior\) return drawInteriorBackdrop\(\)/, 'and it replaces the sky, not covers it');
  const body = fn2(renderer, 'drawInteriorBackdrop');
  assert.doesNotMatch(body, /sky\(\)|hills\(/, 'no horizon');
  assert.doesNotMatch(body, /groundBy/, 'and nothing in it is pinned to the ground line');
  assert.match(body, /camYb/, 'it scrolls with the camera in both axes');
});

test('one recollection, no loot, no signage, no droppers', () => {
  assert.equal(at(o => o.sealedRecollection).length, 1);
  assert.equal(LEVEL.loot.length, 0);
  assert.equal(at(o => o.type === 'sign').length, 0);
  assert.equal(LEVEL.enemies.filter(e => !e.noDrop).length, 0);
  assert.equal(LEVEL.npcs.length, 1);
  assert.equal(LEVEL.npcs[0].profileId, 'sera', 'Oren carried forward, not a new face');
});

test('every room owns a checkpoint, and no room owns three', () => {
  const checks = at(o => o.type === 'check').map(o => o.x);
  for(const [lo, hi] of [[0,2700],[2700,6000],[6000,9000],[9000,12200],[12200,14400],[14400,16400]])
    assert.ok(checks.some(x => x >= lo && x < hi), `room ${lo}-${hi} has a checkpoint`);
  // Sparse and intentional: one per room, plus one on the way down the stair.
  assert.equal(checks.length, 7, `${checks.length} checkpoints is a trail of breadcrumbs`);
});

test('the recall finally reaches this region, with a unique of its own', () => {
  assert.match(source, /slagwright:\{muster:1/);
  assert.match(source, /cinderling:\{muster:1/);
  assert.match(source, /\n  emberdeep:\[/, 'Emberdeep has a muster roster at last');
  const roster = /\n {2}emberdeep:\[([\s\S]*?)\n {2}\],/.exec(source)[1];
  assert.ok(/'slagwright'/.test(roster), 'and its unique stands in it');
  // The first raised standard is in sight of the arrival; the counter, Oren's post
  // and the rest site now own the first 1,200 units, so the first SOLDIER waits
  // just past them.
  const std = /\['standard',(\d+),/.exec(roster);
  assert.ok(Number(std[1]) < 1000, 'the recall is visible from the Ember Door');
  // Every row stands on this level's ground. They were authored at y=0 for a flat
  // Emberdeep and, once the rooms went up 640, all twelve spawned inside the rock —
  // a standard and a soldier were visible in the stair sump. The installer adds the
  // level's floor; each row must then be on the plateau, on real ground, and clear
  // of every safe place.
  assert.match(fn('installMusterRoster'), /y=levelFloorY\(x\)\+\(dy\|\|0\)/, 'roster y is world zero again');
  const rows = [...roster.matchAll(/\['(\w+)',(\d+),(\d+)(?:,(\d+),(\d+))?\]/g)]
    .map(m => ({ type: m[1], x: +m[2], dy: +m[3], lo: +m[4], hi: +m[5] }));
  const checks = at(o => o.type === 'check').map(o => o.x);
  const safe = [[330, 'the arrival'], [560, 'the Cinder Ledger'], [840, "Oren's post"], [980, 'the rest site'],
    ...at(o => o.type === 'plate').map(o => [o.x, 'a relay pad']), ...at(o => o.emberMemory).map(o => [o.x, 'the memory post'])];
  for(const r of rows){
    assert.ok(r.x < 14400, `${r.type}@${r.x} is past the head of the stair`);
    assert.equal(r.dy, 0);
    const ground = at(o => o.deep && o.y === ED).some(g => r.x >= span(g).left && r.x <= span(g).right);
    assert.ok(ground, `${r.type}@${r.x} has no plateau under it`);
    if(r.type === 'standard') continue;
    assert.ok(r.lo < r.x && r.x < r.hi, `${r.type}@${r.x}: patrol does not contain it`);
    for(const c of checks) assert.ok(Math.abs(c - r.x) >= 200, `${r.type}@${r.x} is on the checkpoint at ${c}`);
    for(const [x, what] of safe)
      assert.ok(r.hi < x - 60 || r.lo > x + 60, `${r.type}@${r.x} patrols over ${what} at ${x}`);
  }
});

test('the renderer can show the clock', () => {
  assert.match(renderer, /function drawHeatStone/);
  assert.match(renderer, /function drawSlagBlock/);
  assert.match(renderer, /if\(o\.heatCycle\)\{ drawHeatStone/);
  assert.match(renderer, /o\.pouring/, 'the spout shows when it lets go');
  assert.match(renderer, /o\.pourWarn/, 'and when it is gathering');
});

test('the camera holds still: no screen shake and no haptics anywhere in the region', () => {
  // Six slag weights drop on the pour schedule, and each landing added 7 to the
  // screen shake wherever the player stood — the frame at the Ember Door shook about
  // once a second from weights 4,000 units away. The owner found it uncomfortable.
  // The cut is declared on the level and applied where shake and vibration LEAVE the
  // engine, so no present or future source can slip past it.
  assert.equal(LEVEL.stillCamera, true, 'Emberdeep no longer declares a still camera');
  const ctx = vm.createContext({ G: { stageIndex: 9 }, CUSTOM_LEVELS: { 9: LEVEL, 8: { len: 100 } } });
  vm.runInContext(fn('levelIsStill'), ctx);
  assert.equal(ctx.levelIsStill(), true);
  ctx.G.stageIndex = 8;
  assert.equal(ctx.levelIsStill(), false, 'the still camera leaked into another region');
  ctx.G.stageIndex = 14;
  assert.equal(ctx.levelIsStill(), false, 'a stage with no custom level must still shake');
  // The render path is the only reader of G.shake; gate it there.
  assert.match(source, /BFCamera\.shakeOffset\(G\.time,levelIsStill\(\)\?0:G\.shake\)/,
    'the screen-shake offset is no longer gated');
  assert.equal((source.match(/BFCamera\.shakeOffset\(/g) || []).length, 1,
    'a second shake consumer appeared and bypasses the still-camera gate');
  assert.match(fn('buzz'), /!levelIsStill\(\)/, 'haptic vibration is no longer gated');
});
