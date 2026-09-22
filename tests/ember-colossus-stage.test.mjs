// The Foundry, rebuilt around the casting line and the verb that MAKES ground.
// The Colossus fight is out of scope here; these guard the region.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const renderer = await read('bladefall-respec-renderer.js');
const campaign = await read('bladefall-campaign.js');
const zones = await read('bladefall-zones.js');

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
const start = source.indexOf('const FOUNDRY_LEVEL='),
      end = source.indexOf('\n/* ---- STAGE 10 · EMBERDEEP', start);
assert.ok(start >= 0 && end > start);
const ctors = ['Pl','Gr','Wl','Slate','SlateWall','Check','LPortal','Anchor','DoorSeal','Plate','Scenery','Fluid','CoinOb','Sp','Br','Trap',
  'ForgeCoolant','StoryRelic','SealedRecollection','ElementBeat','FoundryBeat','FoundryScenery','Cap','FoundryVent',
  'FHeat','FSlag','FSpout','Line','Ladle'];
const LEVEL = vm.runInNewContext(ctors.map(fn).join('\n') + '\n' + source.slice(start, end) + ';FOUNDRY_LEVEL',
  { Math, Object });
const at = p => LEVEL.objects.filter(p);
// Shipped TUNING: a double jump buys 154.6 units of rise, and the widest flat gap
// it clears is 355. Every authored reach in this file is measured against those.
const CEILING = (480 * 480) / 2800 + (450 * 450) / 2800;
const GAP = 355, RUN = 200;
const span = o => ({ left: o.x - o.w / 2, right: o.x + o.w / 2 });

test('registered, the right length, and reached by a seam at both ends', () => {
  assert.equal(LEVEL.len, 16600);
  assert.match(source, /10:FOUNDRY_LEVEL/);
  assert.match(campaign, /name: 'Ember Colossus', len: 16600, theme: 'volcano'/);
  assert.equal(LEVEL.portal, null, 'no completion portal at either end');
  const spec = fn('physicalSeamSpec');
  assert.match(spec, /G\.stageIndex===10&&G\.p\.x<G\.levelLength\/2/, 'the Deep Stair goes back up');
  assert.match(spec, /connector:'colossus-inversion'[\s\S]*?targetStage:11/, 'and the fissure goes on');
  assert.doesNotMatch(fn('updateFoundry'), /G\.portal=\{/, 'the region opens no portal');
});

test('the strike is paid at a protected midpoint, before the arena', () => {
  const claim = fn('claimFoundryMemory');
  assert.match(claim, /grantPermanentCapability\('downward-strike','foundry-hammer'/);
  assert.doesNotMatch(claim, /G\.boss&&G\.boss\.dead/, 'no longer withheld until after the fight');
  const memory = at(o => o.foundryMemory)[0];
  assert.ok(memory, 'the anvil exists');
  assert.ok(memory.x < LEVEL.bossX, 'and it stands west of the arena');
  const gate = at(o => o.foundryAnvilGate)[0];
  assert.ok(gate && gate.x > memory.x, 'the first thing it asks for stands east of the grant');
});

test('the strike MAKES ground, not only breaks it', () => {
  const slam = fn('slamImpact'), setter = fn('setHeatStone');
  assert.match(slam, /o\.heatState!==HEAT_SETTING/, 'only inside the setting window');
  assert.match(slam, /setHeatStone\(/, 'and then the slab is handed to the setter');
  assert.match(setter, /o\.heatSet=true/, 'which makes it yours for good');
  assert.match(slam, /o\.brittle/, 'the breaking half survives too');
  // The climb exists only because you build it: no slab is cold long enough to be
  // the step to the next one, and the top is out of reach until they are yours.
  const climb = at(o => o.heatCycle && o.x > 4400 && o.x < 5300).sort((a, b) => a.y - b.y);
  assert.equal(climb.length, 3, 'three slabs');
  for(const s of climb){
    const c = s.heatCycle, cold = (1 - c.set) * c.period;
    assert.ok(cold < 1, `slab at ${s.x} is cold for ${cold.toFixed(2)}s, which is a place to wait`);
  }
  const shelf = at(o => o.foundryShelf)[0];
  assert.ok(shelf.y > CEILING * 3, 'the shelf is three double jumps up');
  // THE FLOOR IS LAVA (owner, 2026-09-19). The climb stood over ordinary floor, so a
  // miss cost a walk and nothing made it the road. Now lava runs under it from the
  // first slab to the far side of the casting line, and the floor stops under the
  // first slab — its underside is at 124, and a jump started at a lava edge put the
  // knight's head into it — so the first step is still the only step.
  const lava = at(o => o.id === 'foundry-line-pit')[0];
  assert.ok(lava && lava.kind === 'lava', 'lava under the climb');
  assert.ok(span(lava).left <= climb[1].x - climb[1].w / 2 && span(lava).right >= shelf.x + shelf.w / 2,
    'from the second slab past the shelf');
  const floorEnd = Math.max(...at(o => o.deep && span(o).left < 4400).map(o => span(o).right));
  assert.ok(floorEnd < climb[0].x + climb[0].w / 2, 'the floor ends under the first slab');
  assert.ok(floorEnd >= climb[0].x - climb[0].w / 2 + 40, 'but reaches under it, so a bonk lands on stone');
  for(const s of climb.slice(1)) assert.ok(s.y > CEILING, `slab at ${s.x} can be reached from the floor`);
});

test('the gate cannot be waited out, only answered', () => {
  const gate = at(o => o.foundryAnvilGate)[0], mould = at(o => o.anvilMould)[0];
  assert.ok(gate && mould);
  assert.match(fn('doorOpen'), /o\.foundryAnvilGate[\s\S]*?m\.heatSet\|\|m\.heatState===HEAT_COLD/,
    'the weight is held by that one mould being solid');
  const c = mould.heatCycle, cold = (1 - c.set) * c.period, walk = Math.abs(gate.x - mould.x) / RUN;
  assert.ok(cold < 0.6, `the natural window is ${cold.toFixed(2)}s`);
  assert.ok(walk > cold * 2, 'and the gate is more than twice that away at a dead run');
  // Nor is there anything to jump from: nothing within a gap of the gate stands
  // high enough that a double jump clears its head.
  for(const t of at(o => o.type === 'plat' && !o.deep && o.y > 0)){
    if(Math.abs(t.x - gate.x) > GAP) continue;
    assert.ok(t.y + CEILING < gate.y, `tier at ${t.x} vaults the gate`);
  }
  assert.ok(at(o => o.type === 'wall' && Math.abs(o.x - gate.x) < 40 && o.y > gate.y).length,
    'and the roof above it is sealed');
});

test('the ladle is the Colossus in miniature, on one code path', () => {
  const update = fn('updateFoundryLadles'), pour = fn('ladlePour'), seize = fn('seizeLadle');
  // Gathering MAKES the window — the same pourHold the machine's arm uses.
  assert.match(update, /mould\.pourHold=Math\.max/, 'a gather holds its mould in SETTING');
  assert.match(fn('updateHeatStone'), /o\.quenchHold>0\|\|o\.pourHold>0/, 'which the stone reads as its setting window');
  assert.match(pour, /if\(mould\.heatSet\)\{jamLadle/, 'a pour onto stone you set is refused');
  assert.match(pour, /mould\.heatCycle\.phase=-G\.time/, 'and a pour onto open stone fills it');
  assert.match(fn('jamLadle'), /l\.jams>=\(l\.ladle\.seizeAt\|\|1\)\)seizeLadle/, 'enough refusals and it stops');
  assert.match(seize, /foundryAnvilGate[\s\S]*?gate\.dropped=1/, 'the gate weight drops');
  assert.match(seize, /o\.lineCrossing\)\{o\.belt=0/, 'the line stalls');
  // The same tell, drawn by the same function the fight uses.
  assert.match(renderer, /const aimed = \(boss && fb\.forgeTargetBed === o\) \|\| !!o\.ladleAimed/,
    'and an aimed mould wears the fight\'s own collar');
  assert.match(renderer, /'pour-ladle':/, 'the ladle is pixel-drawn');
});

test('three machines, and the last one is the road', () => {
  const ladles = at(o => o.ladle).sort((a, b) => a.x - b.x);
  assert.equal(ladles.length, 3, 'one per teaching beat');
  assert.equal(ladles.map(l => l.ladle.seizeAt).join(), '1,2,3', 'teach, test, combine');
  assert.equal(ladles.map(l => l.ladleCircuit).join(), 'anvil-gate,line-belt,hall-feeder');
  const line = ladles[1];
  assert.equal(line.ladle.targets.length, 4, 'the line ladle walks the four moulds');
  // The line's ladle is the room's second reading: slow, with a long warning and a
  // long rest, so the rhythm stays the test.
  assert.ok(line.ladle.gather >= 1.8 && line.ladle.idle >= 2.5, 'the line ladle is a threat you watch for, not a metronome');
  // THE FEEDER IS THE WAY OUT, AND IT CANNOT BE SKIPPED (owner, 2026-09-19 — a dash
  // cleared the old 368 gap). Width cannot enforce it: an air dash carries ~500 u/s
  // and the full kit crosses ~1,100. So the far bank is GATED on the seizure.
  const feeder = ladles[2];
  assert.equal(feeder.feeder, 1);
  const bed = at(o => o.hallBed).sort((a, b) => a.x - b.x);
  assert.equal(bed.length, 4, 'a bed of four');
  const east = span(bed[3]).right;
  const bank = at(o => o.deep && span(o).left > east).sort((a, b) => a.x - b.x)[0];
  assert.ok(bank && span(bank).left - east > GAP, 'the bank is further than any jump from the bed');
  for(const t of at(o => o.type === 'plat' && !o.deep && !o.heatCycle))
    assert.ok(!(t.x > east && t.x < span(bank).left), `something authored bridges the feeder gap at ${t.x}`);
  const gate = at(o => o.foundryFeederGate)[0];
  assert.ok(gate && gate.type === 'door' && Math.abs(gate.x - span(bank).left) < 40, 'a gate stands at the bank edge');
  assert.ok(at(o => o.type === 'wall' && o.slickL && o.x === gate.x && o.y - o.h <= gate.y + 10 && o.y >= 1000).length,
    'with a seal over it: no roof route');
  const door = fn('doorOpen');
  assert.match(door, /if\(o\.foundryFeederGate\)\{\s*if\(persistentCircuitOpen\('foundry-feeder'\)\)return true;\s*return foundryLadles\(\)\.some\(l=>l\.feeder&&l\.seized\);/,
    'the gate opens only for a seized feeder');
  assert.match(fn('seizeLadle'), /hall-feeder'\)markPersistentCircuitOpen\('foundry-feeder'/, 'and the seizure is kept');
  assert.match(fn('updateFoundryLadles'), /l\.feeder&&!l\.seized&&persistentCircuitOpen\('foundry-feeder'\)/,
    'so a revisit finds the wreck and the open gate, for the road back west');
  // The wreck is the step, in both directions, inside a plain double jump.
  const L = feeder.ladle, wl = L.railX2 - feeder.wreckW / 2, wr = L.railX2 + feeder.wreckW / 2;
  assert.ok(wl - east <= 230 && wl - east > 0, `bed -> wreck is ${wl - east}`);
  assert.ok(span(bank).left - wr <= 160 && span(bank).left - wr > 0, `wreck -> bank is ${span(bank).left - wr}`);
  assert.ok(bed[3].y - feeder.wreckY <= 90 && feeder.wreckY <= CEILING, 'and the heights a double jump spans both ways');
});

test('the casting line runs one way, and stalls when it is refused', () => {
  const belts = at(o => o.belt && o.lineCrossing).sort((a, b) => a.x - b.x);
  assert.equal(belts.length, 3, 'a track in each gap');
  // Strong enough to throw you in (owner, 2026-09-19): a track you can stand on was
  // a road over the moulds. 3.5x the conveyor is faster than the knight can run.
  for(const b of belts) assert.ok(b.belt <= -3 && -b.belt * 130 > RUN * 2, `the track at ${b.x} can be stood on`);
  assert.ok(at(o => o.belt && !o.lineCrossing).every(b => b.belt > 0),
    'the one you are introduced to on the receiving floor still carries you the way you are going');
  const moulds = at(o => o.lineMould).sort((a, b) => a.x - b.x);
  assert.equal(moulds.length, 4, 'four moulds');
  for(const b of belts) assert.ok(moulds.some(m => m.x < b.x) && moulds.some(m => m.x > b.x), 'each track lies between two moulds');
  // Only the moulds are a road: nothing else to stand on over the line.
  const lava = at(o => o.id === 'foundry-line-pit')[0];
  const over = at(o => o.type === 'plat' && !o.deep && !o.heatCycle && !o.belt && !o.foundryShelf &&
    o.x > moulds[0].x - 200 && o.x < span(lava).right);
  assert.equal(over.length, 0, `a dry route is back over the line at ${over.map(o => o.x)}`);
  // WAIT, THEN JUMP: each mould sets one beat after the one behind it.
  const P = moulds[0].heatCycle.period, beat = P / 3;
  for(let i = 1; i < moulds.length; i++){
    const lag = (((moulds[i - 1].heatCycle.phase - moulds[i].heatCycle.phase) % P) + P) % P;
    assert.ok(Math.abs(lag - beat) < 0.01, `mould at ${moulds[i].x} is not one beat behind its neighbour`);
  }
  // A pour on the line holds the mould open and hands it back to its clock; it
  // must not restart it, or a few pours scramble the rhythm the room is built on.
  assert.match(fn('ladlePour'), /if\(mould\.lineMould\)\{mould\.ladleMoltenT=/);
  assert.match(fn('updateHeatStone'), /if\(o\.ladleMoltenT>0\)/);
  // The two engine fixes that make a strong belt a hazard rather than a perch.
  assert.match(source, /if\(Math\.abs\(p\.x-fp\.x\)>fp\.w\/2&&Math\.sign\(p\.x-fp\.x\)===Math\.sign\(fp\.belt\)\)p\.vx=beltV;/,
    'a belt that carries you off its end throws you with its speed');
  assert.match(source, /const carriedOff=!!\(near\.o&&near\.o\.belt&&near\.o===p\.beltCarry/,
    'and the ledge assist never catches you back onto it');
  assert.match(renderer, /function drawCastingLine/);
  assert.match(renderer, /castingTread\(bx, by, w, depth, dir, true\)|castingTread\(bx, by, w, depth, dir/, 'the line draws its own tread');
  assert.match(renderer, /const scroll = still \? 0 : \(\(time \* 46 \* dir\)/, 'the tread travels the way it carries you, and holds still under reduced motion');
});

test('no water anywhere, and nothing left that only existed for it', () => {
  // The owner cut every water pool (2026-09-19): the Sluice header floated in the
  // air, and the arena tank did not read as anything. The puzzle pieces that only
  // served them go too.
  assert.equal(at(o => o.type === 'fluid' && o.kind === 'water').length, 0, 'a water pool is back');
  assert.equal(at(o => o.quenchTarget || o.sluiceHeaderSlate || o.sluiceAimSlate).length, 0, 'a Sluice piece is back');
  // Nothing in the fight reaches for the tank any more: the last order that knelt
  // under it was replaced with phases 2 and 3.
  for(const name of ['installFoundryBed', 'updateColossusAscent', 'updateColossusPursuit'])
    assert.doesNotMatch(fn(name), /foundry-coolant/, `${name} reaches for the tank`);
  // No lava pit brims above the floor beside it: at 104 deep the surface stood 34
  // over the floor, and standing within half a body of an edge counted as lava.
  for(const f of at(o => o.type === 'fluid' && o.kind === 'lava' && /^foundry-(line|mould)-pit$/.test(o.id)))
    assert.ok(f.y + f.h <= 0, `${f.id} brims above the floor`);
});

test('one coin, on the road, never up a chimney', () => {
  // "What is the point of climbing this coin route?" (owner). The Vault counts one
  // coin per stage, so the Foundry keeps exactly one — on the mandatory line, over
  // a mould, a double jump while it is solid. No detour, no chimney, no sealed box.
  const coins = at(o => o.type === 'coin');
  assert.equal(coins.length, 1, `${coins.length} coins`);
  const under = at(o => o.lineMould && Math.abs(o.x - coins[0].x) < 20)[0];
  assert.ok(under, 'it hangs over a line mould');
  assert.ok(coins[0].y - under.y > 82 + 22 + 38 && coins[0].y - under.y <= 148 + 22 + 38, 'a double jump, not a single');
  assert.equal(at(o => o.foundryCache || o.foundryPerch).length, 0, 'a coin perch or cache is back');
});

test('the Foundry leaves through its own floor', () => {
  const caps = at(o => o.foundryFissureCap).sort((a, b) => a.x - b.x);
  assert.equal(caps.length, 3, 'three caps close the cracked bay');
  for(const c of caps) assert.equal(c.y, 0, 'in the GROUND, not overhead');
  const band = /const FOUNDRY_FISSURE_X1=(\d+),FOUNDRY_FISSURE_X2=(\d+),FOUNDRY_FISSURE_CROSS=(-?\d+)/.exec(source);
  assert.ok(band, 'the band is one named constant');
  const [x1, x2, cross] = band.slice(1).map(Number);
  assert.ok(span(caps[0]).left >= x1 && span(caps[2]).right <= x2, 'the caps fill the band');
  // No floor under them, and nothing rewinds you out of the hole you made.
  assert.ok(!at(o => o.deep && span(o).left < x2 && span(o).right > x1).length, 'the bay has no floor');
  assert.match(fn('updraftsVoidFloor'), /G\.stageIndex===10&&p\.x>FOUNDRY_FISSURE_X1&&p\.x<FOUNDRY_FISSURE_X2\)return -\d+/,
    'the void is exempt inside it, stage-first so the sliced harnesses never touch the constants');
  assert.match(fn('physicalSeamSpec'), /cross:inFoundryFissure\(G\.p\.x\)&&G\.p\.y<FOUNDRY_FISSURE_CROSS/,
    'and the crossing is height-triggered, not an east edge');
  assert.doesNotMatch(fn('physicalSeamSpec'), /colossus-inversion'[\s\S]{0,200}G\.p\.x>=G\.levelLength-62/,
    'the old walk-off-the-east-edge branch is gone');
  assert.match(fn('physicalSeamSpec'), /G\.stageIndex===10&&G\.boss&&!G\.boss\.dead&&G\.boss\.type==='colossus'\)return null/,
    'and you still do not walk past the machine');
  assert.match(fn('shatterBrittle'), /o\.foundryFissureCap&&foundryColossusStanding\(\)/, 'nor open the floor early');
  // The recollection is inside the mouth, on a ledge you land on as you fall.
  const ledge = at(o => o.fissureLedge)[0], relic = at(o => o.sealedRecollection)[0];
  assert.ok(ledge && ledge.y < 0 && ledge.y > cross, 'the ledge hangs above the crossing height');
  assert.ok(Math.abs(relic.x - ledge.x) < 40, 'and what this place was sits on it');
  // Both ends of a vertical seam are authored places, not side ratios.
  assert.match(zones, /'colossus-inversion', 'ember-colossus', 'south', 'plunge'[\s\S]*?'inversion', 'north', 'emerge'/,
    'the world graph agrees the road goes down');
  const arrival = fn('compatibilityZoneArrival');
  assert.match(arrival, /colossus-inversion'&&plan\.targetZoneId==='inversion'/);
  assert.match(arrival, /colossus-inversion'&&plan\.targetZoneId==='ember-colossus'/);
});

test('every authored tier can be stood on', () => {
  const tiers = at(o => o.type === 'plat' && !o.deep && o.y > 0)
    .map(o => ({ x:o.x, y:o.y, left:o.x - o.w / 2, right:o.x + o.w / 2, set:!!o.heatCycle }));
  // A chimney answers as well as a step: one wall jump buys 89 units of rise, so a
  // cling face beside a perch is a route the same way a ledge below it is.
  const walls = at(o => o.type === 'wall' && o.clingSurface && !o.slickL);
  for(const t of tiers){
    if(t.y <= CEILING || t.set) continue;                  // set-the-slag tiers are built, not reached
    const step = tiers.some(o => o !== t && o.y < t.y && t.y - o.y <= CEILING &&
      o.right > t.left - 240 && o.left < t.right + 240);
    const chimney = walls.some(w => Math.abs(w.x - t.x) < 150 && w.y + 89 >= t.y && w.y - w.h <= t.y);
    assert.ok(step || chimney, `tier at ${t.x} is ${t.y} up with no step or wall under it`);
  }
});

test('no chimneys: the region’s height is the climb over the lava', () => {
  // The owner cut every rune-faced chimney (2026-09-19): the coin chimney off the
  // climb, the dry-route chimney over the line and the last one by the fissure all
  // led somewhere nobody needed to go.
  const clings = at(o => o.type === 'wall' && o.clingSurface && !o.slickL);
  assert.equal(clings.length, 0, `${clings.length} climbable walls are back`);
  const tiers = at(o => o.type === 'plat' && !o.deep && o.y > 0);
  const top = Math.max(...tiers.map(t => t.y));
  assert.equal(top, at(o => o.foundryShelf)[0].y, 'the highest thing in the region is the top of the climb');
  assert.ok(top >= 450, 'and it is real height');
});

test('the arena keeps its shape, without the tank', () => {
  const anchor = at(o => o.anchor)[0], forge = at(o => o.type === 'forgeCoolant')[0];
  assert.ok(anchor && forge, 'the outlet and the forge stand');
  assert.equal(anchor.ejectSpeed, 420);
  assert.ok(anchor.x < forge.x, 'outlet, then forge');
  assert.equal(at(o => o.forgeCircuit).length, 0, 'and the coolant tank is gone');
  assert.ok(at(o => o.foundryFloor)[0].w >= 2000, 'one long slate floor');
});

test('no room shares a skeleton with Emberdeep', () => {
  const ed = source.indexOf('const EMBERDEEP_LEVEL=');
  const block = source.slice(ed, source.indexOf('\nconst CUSTOM_LEVELS=', ed));
  // The two regions used to mirror each other down to coordinates. Every basin,
  // loft and corridor centre in the Foundry must now be its own number.
  for(const o of at(x => x.type === 'fluid' || x.foundryShelf || x.foundryOverlook))
    assert.ok(!new RegExp('\\(' + Math.round(o.x) + ',').test(block), `${o.x} is still an Emberdeep coordinate`);
  assert.equal(at(o => o.slagCycle).length, 0, 'slag rain belongs to Emberdeep; the Foundry pours on purpose');
});

test('one recollection, no loot, no signage, no droppers', () => {
  assert.equal(at(o => o.sealedRecollection).length, 1);
  assert.equal(LEVEL.loot.length, 0);
  assert.equal(at(o => o.type === 'sign').length, 0);
  assert.equal(LEVEL.enemies.filter(e => !e.noDrop).length, 0);
  assert.equal(LEVEL.npcs[0].profileId, 'sera');
});

test('every room owns a checkpoint', () => {
  const checks = at(o => o.type === 'check').map(o => o.x);
  for(const [lo, hi] of [[0,2800],[2800,6200],[6200,9200],[9200,12280],[12280,15400],[15400,16600]])
    assert.ok(checks.some(x => x >= lo && x < hi), `room ${lo}-${hi} has a checkpoint`);
});

test('the recall reaches the Foundry, with the cinderling as its unique', () => {
  assert.match(source, /'ember-colossus':\[/);
  const roster = /'ember-colossus':\[([\s\S]*?)\n {2}\],/.exec(source)[1];
  assert.ok(/'cinderling'/.test(roster));
  // Every row stands on ground, clear of the arena. Two of the old rows stood in the
  // Sluice pit and the owner saw them standing in lava.
  const rows = [...roster.matchAll(/\['(\w+)',(\d+),(\d+)(?:,(\d+),(\d+))?\]/g)].map(m => ({ t: m[1], x: +m[2], lo: +m[4], hi: +m[5] }));
  const ground = at(o => o.deep && o.y === 0 && !o.foundryFloor);
  for(const r of rows){
    const xs = r.t === 'standard' ? [r.x] : [r.x, r.lo, r.hi];
    for(const x of xs) assert.ok(ground.some(g => x >= span(g).left && x <= span(g).right), `${r.t}@${r.x} stands over nothing at ${x}`);
    assert.ok(r.x < 12280 || r.x > 14400, `${r.t}@${r.x} is in the arena`);
  }
  // Its signature is ground denial: it burns out where it falls.
  assert.match(fn('killEnemy'), /e\.type==='cinderling'[\s\S]*?emberPool:1/);
});
