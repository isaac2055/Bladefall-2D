// The Inversion, rebuilt as a vertical region: entered at the top right, left at
// the bottom left, and impassable without owing both floors in turn.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const renderer = await read('bladefall-respec-renderer.js');
const campaign = await read('bladefall-campaign.js');
const zones = await read('bladefall-zones.js');
const camera = await read('bladefall-camera.js');

function fnFrom(src, name){
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists');
  const brace = src.indexOf('{', start); let depth = 0;
  for(let i = brace; i < src.length; i++){
    if(src[i] === '{') depth++;
    else if(src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw Error('unterminated ' + name);
}
const fn = n => fnFrom(source, n);

const start = source.indexOf('const INVERSION_LEVEL='),
      end = source.indexOf('\n/* THE DEEP LINE', start);
assert.ok(start >= 0 && end > start);
const CEIL_Y = Number(/const CEIL_Y=(\d+);/.exec(source)[1]);
// The Path's two constants are read from the source, never restated here: a test that
// pins its own copy of a level constant passes happily while the level moves.
const PATH = /const PATH_FLOOR=(\d+),PATH_ROOF=(\d+)/.exec(source);
assert.ok(PATH, 'the Path declares its floor and roof');
const PATH_FLOOR = Number(PATH[1]), PATH_ROOF = Number(PATH[2]);
const PBOX = /const PATH_W=(\d+),PATH_E=(\d+),PATH_WALL=(\d+)/.exec(source);
assert.ok(PBOX, 'the Path declares its own extent');
const PATH_W = Number(PBOX[1]), PATH_E = Number(PBOX[2]), PATH_WALL = Number(PBOX[3]);
const ctors = ['Pl','Gr','GrAt','Wl','Slate','Check','LPortal','Anchor','DoorSeal','Plate','Scenery','Fluid','CoinOb','Sp','Br','Trap',
  'PathThorn','PathPillar','PathDrop','PathWeave','PathTube','WSp','Crate','StoryRelic','SealedRecollection','ElementBeat','InvBeat','InvScenery','Roof','CeilTeeth'];
const LEVEL = vm.runInNewContext(
  'const CEIL_Y=' + CEIL_Y + ';const PATH_FLOOR=' + PATH_FLOOR + ',PATH_ROOF=' + PATH_ROOF + ';' + /const PATH_H=[^;]+;/.exec(source)[0] + /const PATH_W=[^;]+;/.exec(source)[0] + 'const SPIKE_REACH=24;const G={};\n' + ctors.map(fn).join('\n') + '\n' + source.slice(start, end) + ';INVERSION_LEVEL',
  { Math, Object });
const at = p => LEVEL.objects.filter(p);
// Shipped TUNING. A double jump buys 154.6 units of rise and clears 355 of flat gap,
// in EITHER orientation — the flip changes which way those point, not how far.
const CEILING = (480 * 480) / 2800 + (450 * 450) / 2800;
const GAP = 355;
const span = o => ({ left: o.x - o.w / 2, right: o.x + o.w / 2 });
const floors = at(o => o.type === 'plat' && !o.invRoof && !o.ceiling && o.y != null && !o.slate)
  .map(o => ({ y:o.y, ...span(o), o }));
const roofs = at(o => o.invRoof).map(o => ({ under:o.y - (o.h || 14), ...span(o), o }));

test('registered, nine thousand wide, and its own length in the catalog', () => {
  assert.equal(LEVEL.len, 16100);
  assert.match(source, /11:INVERSION_LEVEL/);
  assert.match(campaign, /name: 'The Inversion', len: 16100, theme: 'void'/);
  assert.match(campaign, /id: 'inversion',[\s\S]*?source: 'custom'/);
  assert.equal(LEVEL.portal, null, 'travel is a place, not a completion reward');
  assert.equal(LEVEL.authoredEcology, true);
});

test('the procedural coda, its pickups and its void population are gone', () => {
  assert.match(campaign, /id: 'inversion',[\s\S]*?customExtension: 0/);
  assert.doesNotMatch(fn('buildCustomLevel'), /inversionAuthored/, 'no authored-coda branch survives');
  assert.doesNotMatch(fn('buildCustomLevel'), /G\.stageIndex===11\)\{\s*G\.obstacles\.push\(Pl\(endX/, 'no roof prize bolted past the finale');
  assert.match(fn('buildCustomLevel'), /if\(L\.flip\)\{addCeiling\(\);if\(!L\.authoredEcology\)populateVoid/,
    'an authored region populates itself');
  assert.equal(LEVEL.loot.length, 0, 'no loot drops');
  assert.equal(at(o => o.type === 'sign').length, 0, 'and not one sign');
  assert.ok(LEVEL.enemies.length <= 8, `${LEVEL.enemies.length} bodies is a population, not a cast`);
  for(const e of LEVEL.enemies) assert.equal(e.noDrop, true);
});

test('it is entered at the top right and left at the bottom left', () => {
  assert.equal(LEVEL.spawnX, 15800);
  assert.ok(LEVEL.spawnY >= 1100, 'you arrive on the high terrace, not the floor');
  assert.match(source.slice(start, end), /build\(\)\{G\.p\.face=-1;\}/, 'and facing the way you are going');
  const spec = fn('physicalSeamSpec');
  assert.match(spec, /connector:'inversion-tyrant',zone:'inversion',targetStage:12,\s*warm:G\.p\.x<=1400,\s*cross:G\.p\.x<=62&&G\.p\.face<0/,
    'the onward gate is the WEST edge');
  assert.match(spec, /requires:'gravity-flip'/);
  assert.doesNotMatch(spec, /G\.stageIndex===11&&G\.p\.x<G\.levelLength\/2/, 'no west-edge branch back to the Foundry');
  assert.match(zones, /'inversion-tyrant', 'inversion', 'west', 'walk', 0\.5, 'void-tyrant', 'east'/);
  // The way back is a height threshold in the Fall In, the wind-shaft pattern.
  const upd = fn('updateInversion');
  assert.match(upd, /Math\.abs\(G\.p\.x-INV_RETURN_X\)<110&&G\.p\.y>=INV_RETURN_Y/);
  assert.match(upd, /beginPhysicalBranchTransition\('colossus-inversion','inversion'/);
  const arrival = fn('compatibilityZoneArrival');
  for(const pin of [/colossus-inversion'&&plan\.targetZoneId==='inversion'\)\{x=15800;y=1200;\}/,
                    /colossus-inversion'&&plan\.targetZoneId==='ember-colossus'/,
                    /inversion-tyrant'&&plan\.targetZoneId==='void-tyrant'/,
                    /inversion-tyrant'&&plan\.targetZoneId==='inversion'/])
    assert.match(arrival, pin, 'all four endpoints are authored places');
});

test('every room owns an x-span and a height band, and none of them stack', () => {
  const rooms = [[14900,16100],[13700,14900],[12600,13700],[10000,12600],[8500,10000],[4000,8500],[1400,4000],[0,1400]];
  const bands = [];
  for(const [lo, hi] of rooms){
    const inside = floors.filter(f => f.left >= lo - 1 && f.right <= hi + 1);
    assert.ok(inside.length, `room ${lo}-${hi} has floor`);
    bands.push({ lo, hi, top:Math.max(...inside.map(f => f.y)), bottom:Math.min(...inside.map(f => f.y)) });
    assert.ok(at(o => o.type === 'check' && o.x >= lo && o.x < hi).length >= 1, `room ${lo}-${hi} has a checkpoint`);
  }
  // Rooms are x-spans in this engine, so two rooms may never occupy one x.
  for(let i = 1; i < bands.length; i++) assert.ok(bands[i].hi <= bands[i - 1].lo, 'rooms tile the level without overlapping');
  // And it descends, room by room, as the map draws it. The Path of Inversion is the
  // one exception and it is not a room in that sense: it is three lanes STACKED in one
  // footprint, so the height that carries the road is the lane you enter it on.
  // (its shaft floor sits at 0 with the fissure, so neither top nor bottom reads it —
  //  the carrying height is the lane you walk in on.)
  // Rooms 1-5 are terraces and descend one to the next. The Path of Inversion and the
  // Last Breath are not terraces at all — they are stacks, three lanes and a tube folded
  // into one footprint — so they are measured by the lane you enter them on, and the
  // Last Breath is entered from the TOP of the Path and climbs back down inside itself.
  const terraces = bands.filter(b => b.lo >= 8500);
  for(let i = 1; i < terraces.length; i++)
    assert.ok(terraces[i].top < terraces[i - 1].top, `room ${terraces[i].lo} does not descend`);
  const fissure = bands.find(b => b.lo === 0), path = bands.find(b => b.lo === 4000);
  assert.equal(fissure.top, 0, 'the fissure is the floor of the region');
  assert.ok(path.bottom < terraces[terraces.length - 1].top, 'and the Path drops below the last terrace');
  // Inside the survivable band at both ends.
  for(const f of floors) assert.ok(f.y >= 0, `floor at ${f.left} is below the world`);
  for(const r of roofs) assert.ok(r.under <= 1500, `a roof at ${r.left} is above the survivable band`);
  assert.ok(CEIL_Y + 400 >= 2000, 'the upper kill plane still clears the highest content');
});

// WHAT A GAP ACTUALLY COSTS. The region shipped with 400-unit voids because the
// charter budgeted a double jump (355) and forgot the knight owns a dash. Driving
// the real engine off a lip, the full kit — run, jump, dash, double jump — reaches
// 671 flat, 726 off a 210 drop and 774 off a 400 one, and all four of the old
// crossings fell to it, so the region named for Gravity Flip could be walked end to
// end without the verb. 800 is that measurement plus its margin.
const DASH_REACH = 800;
const PLAYER_H = 44;
// Flipped, a jump goes DOWN: the knight drops to the next underside and falls back
// up onto it, so a step down the roof line may never exceed what a jump buys.
const STEP = CEILING;
const covers = (a, b) => {          // an unbroken chain of roofs from x=b west to x=a
  let edge = b, guard = 0;
  while(edge > a && guard++ < 40){
    const next = roofs.filter(r => r.left < edge - 1 && r.right >= edge - 1)
      .sort((x, y) => x.left - y.left)[0];
    if(!next) return false;
    edge = next.left;
  }
  return edge <= a;
};

test('neither floor is a route on its own', () => {
  // THE RULE. West of the anchor every break in the floor is wider than the whole
  // kit can throw you, and every one of them is roofed end to end — so the floor
  // alone is never a route, and the roof is only a floor to a knight who has turned
  // the world over.
  const road = floors.filter(f => f.right <= 13700 && f.left >= 8500 && f.y > 0 && f.right - f.left > 150)
    .sort((a, b) => b.left - a.left);
  const voids = [];
  for(let i = 1; i < road.length; i++){
    const gap = road[i - 1].left - road[i].right;
    if(gap > 150) voids.push({ right:road[i - 1].left, left:road[i].right, gap });
  }
  assert.ok(voids.length >= 3, `three crossings at least, found ${voids.length}`);
  for(const v of voids){
    assert.ok(v.gap > DASH_REACH,
      `a ${Math.round(v.gap)} void at ${Math.round(v.left)} is inside the kit's ${DASH_REACH} reach`);
    assert.ok(covers(v.left - 100, v.right + 100),
      `the roof line breaks over the void at ${Math.round(v.left)} — step off there and you fall to the roof of the world`);
  }
  // EVERY ROOF HANDS ON TO A NEXT ONE. Not every neighbouring pair — the perch over
  // the crumble is deliberately out of reach of the road below it, which is what makes
  // it a retry and not a bypass. What must hold is that from each roof SOME roof to
  // the west is takeable: higher is free (flipped, you fall up onto it) and lower must
  // be inside the jump that has to make it.
  const chain = roofs.filter(r => r.right <= 13800 && r.left >= 9500).sort((a, b) => b.left - a.left);
  for(let i = 0; i < chain.length - 1; i++){
    const r = chain[i];
    const onward = roofs.some(n => n.left < r.left && n.right >= r.left - 40 &&
      (n.under > r.under || r.under - n.under <= STEP));
    // A perch hands DOWN instead of west — that is the whole of its job.
    const down = roofs.some(n => n !== r && n.under < r.under && r.under - n.under <= STEP &&
      n.left <= r.right && n.right >= r.left);
    // And the last roof of a crossing hands you to the FLOOR: you right the world
    // over the terrace it ends above and drop.
    const toFloor = floors.some(f => f.left <= r.left + 80 && f.right >= r.left - 80 && f.y < r.under);
    assert.ok(onward || down || toFloor,
      `the roof at ${Math.round(r.left)} (under ${Math.round(r.under)}) hands on to nothing`);
  }
  // Each crossing escalates exactly one thing.
  const gaunt = roofs.filter(r => r.left >= 9500 && r.right <= 12600);
  const crumble = gaunt.filter(r => r.o.crumble);
  assert.equal(crumble.length, 1, 'one that will not hold');
  // A CRUMBLING ROOF IS A STEPPING STONE. Its fuse is 0.45 s from the moment you
  // stand on it, which buys about 90 units of walking: the 620-wide crumbling roof
  // this region shipped with could not be crossed by anyone playing correctly.
  assert.ok(crumble[0].right - crumble[0].left <= 220,
    `a ${Math.round(crumble[0].right - crumble[0].left)}-wide crumble cannot be crossed inside its own fuse`);
  assert.ok(roofs.some(r => !r.o.crumble && r.under > crumble[0].under &&
    r.left <= crumble[0].left && r.right >= crumble[0].right),
    'and a perch above it to be dropped onto, so giving way is a setback and not a death');
  assert.equal(gaunt.filter(r => r.o.move).length, 1, 'one that does not wait');
  // TEETH ON THE ROAD, not 620 units above it. The gauntlet's five sets of CeilTeeth
  // hung at the world ceiling while the road they were meant to threaten ran at 874.
  const roadTeeth = at(o => o.type === 'spikes' && o.ceil && o.y < CEIL_Y - 400 && o.x > 8500);
  assert.ok(roadTeeth.length >= 1, 'and one with teeth you can actually reach');
  for(const t of roadTeeth) assert.ok(roofs.some(r => Math.abs(r.under - t.y) < 20 && r.left <= t.x && r.right >= t.x),
    `the teeth at ${t.x} hang off no road`);
  assert.ok(at(o => o.invBelt).length >= 1, 'plus a floor that runs the wrong way');
  // The roof of the world is the roof above the roofs: step off an underside with
  // open sky over it and you fall UP onto it, so it must not be a free road west.
  assert.ok(at(o => o.type === 'spikes' && o.ceil && o.y >= CEIL_Y - 40).length >= 4,
    'the world ceiling is toothed over the crossings');
});

test('the verb is paid for at a protected midpoint and required after it', () => {
  const anchor = at(o => o.inversionMemory)[0];
  assert.ok(anchor, 'the anchor exists');
  assert.ok(anchor.x > 10000 && anchor.x < 13700, 'at the middle of the road, not the end');
  assert.match(fn('claimInversionMemory'), /grantPermanentCapability\('gravity-flip','inversion-anchor'/);
  // It stands on solid ground with its own checkpoint, and the first thing west of
  // it is a break only the other floor crosses.
  const ground = floors.find(f => f.left <= anchor.x && f.right >= anchor.x);
  assert.ok(ground, 'granted on a floor, not over a void');
  assert.ok(at(o => o.type === 'check' && Math.abs(o.x - anchor.x) < 300).length >= 1, 'with its own checkpoint');
  const westOf = floors.filter(f => f.right <= ground.left && f.right - f.left > 150)
    .sort((a, b) => b.right - a.right)[0];
  assert.ok(ground.left - westOf.right > DASH_REACH, 'and the road west of it is broken past any jump');
  assert.ok(covers(westOf.right - 100, ground.left + 100), 'with a roof line over the break');
  // And the roof it hands you to reaches PAST the void, over the terrace you land on.
  assert.ok(roofs.some(r => r.left < westOf.right && r.right > westOf.right + 60),
    'the last roof stops over the landing, not on its knife edge');
});

test('the drop-lock needs both orientations and no pickup pays for it', () => {
  const roofSlates = roofs.filter(r => r.o.slate);
  assert.equal(roofSlates.length, 3, 'three roof slates, one of them true');
  assert.equal(roofSlates.filter(r => r.o.portalDecoy).length, 2, 'and two plausible decoys');
  for(const r of roofSlates) assert.ok((r.o.h || 14) < 16,
    'a roof slate must be thin, or playerSlate cannot find it from below (it measures against the top)');
  const truth = roofSlates.find(r => r.o.invTrue), plate = at(o => o.type === 'plate' && o.crateOnly)[0];
  assert.ok(truth && plate && Math.abs(truth.o.x - plate.x) < 60, 'the true slate hangs over the bin');
  const walls = at(o => o.type === 'wall' && Math.abs(o.x - plate.x) < 140).sort((a, b) => a.x - b.x);
  assert.equal(walls.length, 2, 'the bin is sealed on both flanks');
  // THE BUG THAT MADE THIS REGION UNFINISHABLE. The walls stand to 390 and the knight
  // is 44 tall; the true slate's underside was at 400. That ten-unit slit stopped the
  // ceiling walk dead at x 2084, and the bin could not be entered from below either,
  // so the ONE mouth that could fill the bin could only be set from inside the sealed
  // bin. Measured in the engine, not read off the source.
  assert.ok(truth.under - walls[0].y >= PLAYER_H,
    `the ceiling lane over the bin is ${Math.round(truth.under - walls[0].y)} high and the knight is ${PLAYER_H}`);
  for(const w of walls) assert.equal(w.y, walls[0].y, 'both lips at one height');
  // And because that lane is now high enough to hop the lip INTO the bin, the inside
  // faces are bare: a knight who drops in wall-jumps out. Slick stays on the outside,
  // so the bin is still no climbing frame. (slickL coats the WEST face, slickR the EAST.)
  assert.ok(walls[0].slickL && !walls[0].slickR, 'the west wall is slick outside, bare inside');
  assert.ok(walls[1].slickR && !walls[1].slickL, 'the east wall is slick outside, bare inside');
  const crate = at(o => o.type === 'crate');
  assert.equal(crate.length, 1, 'one crate');
  assert.equal(crate[0].targetPlate, plate.id, 'routed to this plate, so a miss comes straight back');
  assert.ok(floors.some(f => f.left < crate[0].x && f.right > crate[0].x && f.y === crate[0].y),
    'and it rests on the room floor, not on a shelf whose own underside denies the jump onto it');
  assert.equal(at(o => o.invEntry).length, 1, 'one floor mouth beside it');
  // THE KEEL GATE, the room's first sentence: a plate only a ceiling-walker can weigh,
  // sitting one player-height below a roof, with its door and a seal to the world roof.
  const keel = at(o => o.type === 'plate' && !o.crateOnly && o.id === 'inv-keel')[0];
  assert.ok(keel, 'the ceiling plate exists');
  assert.ok(roofs.some(r => Math.abs(r.under - PLAYER_H - keel.y) < 8 && r.left <= keel.x && r.right >= keel.x),
    'it sits exactly where a flipped knight standing on that roof does');
  assert.ok(!floors.some(f => Math.abs(f.y - keel.y) < 12), 'and on no floor the right way up');
  const keelDoor = at(o => o.type === 'door' && o.circuit === 'inv-keel')[0];
  assert.ok(keelDoor && keelDoor.x < keel.x && keelDoor.x > plate.x, 'its door stands between the plate and the bin');
  for(const id of ['inv-keel', 'inv-lock']){
    const d = at(o => o.type === 'door' && o.circuit === id)[0];
    assert.ok(at(o => o.type === 'wall' && Math.abs(o.x - d.x) < 6 && o.y >= CEIL_Y - 40).length >= 1,
      `${id} is sealed to the roof of the world, or it is a door you fall up over`);
  }
  const door = at(o => o.type === 'door' && o.circuit === 'inv-lock')[0];
  assert.ok(door && door.x < plate.x, 'and the way on is west of the lock');
  assert.match(fn('placePortal'), /p\.onGround && G\.gravityFlipped\)\{ surf='ceiling'/, 'a roof mouth ejects downward');
  assert.equal(LEVEL.loot.length, 0, 'nothing is paid for it but the way down');
});

test('a roof is only ever a ceiling, and exactly one place says so', () => {
  // The region's whole idea is that you may owe ONE floor at a time. A roof you can
  // climb on top of is not a ceiling, it is a mezzanine — and every roof here was one,
  // because a plat is standable from above by default. Room 2's overhangs were built
  // thick (h=96) to deny the perch from directly below, and a dash-jump from the
  // terrace beside them still landed on top in 12 of 28 tried timings, which handed
  // the ceiling's own reward to a knight who never turned the world over.
  assert.match(fn('Roof'), /invRoof:1,ceilingOnly:1/, 'the helper marks every roof');
  for(const r of roofs) assert.equal(r.o.ceilingOnly, 1, `the roof at ${Math.round(r.left)} is standable`);
  assert.match(fn('platTop'), /if\(o\.ceilingOnly\)return null;/, 'and platTop refuses it as a floor');
  assert.doesNotMatch(fn('platBottom'), /ceilingOnly/,
    'while platBottom does NOT consult it, or the flipped landing goes with it');
  // The architectural guard: one author, one reader. A third site means the spread
  // has restarted — the same rule the level-datum readers hold.
  const sites = source.split('ceilingOnly').length - 1;
  assert.equal(sites, 2, `ceilingOnly appears at ${sites} sites; it is written in ONE place and read in ONE place`);
  // No floor in the region is a roof, and no roof is a floor.
  for(const f of floors) assert.ok(!f.o.ceilingOnly, `the floor at ${Math.round(f.left)} is a roof`);
});

test('the verb does not kick the screen', () => {
  // The Inversion asks for this verb dozens of times in one region. Emberdeep's
  // playtest cut every shake in the level for being uncomfortable; a flip that
  // kicked the camera on each press was the same complaint waiting to happen.
  const flip = source.slice(source.indexOf('// Gravity Flipper'), source.indexOf('const gravDir'));
  assert.match(flip, /G\.gravityFlipped = !G\.gravityFlipped/, 'the toggle is here');
  assert.doesNotMatch(flip, /G\.shake\s*=/, 'and it does not shake the screen');
  assert.match(flip, /G\.flipTellAt = G\.time/, 'the whole-screen tell carries it instead');
});

test('the far side of the region answers only the second floor', () => {
  const relic = at(o => o.sealedRecollection)[0], sanctum = at(o => o.zenithSanctum)[0];
  assert.ok(relic && sanctum, 'the recollection and the Zenith socket');
  for(const o of [relic, sanctum]){
    const roof = roofs.find(r => r.left <= o.x && r.right >= o.x);
    assert.ok(roof, `nothing above ${o.x} to stand under`);
    assert.ok(Math.abs(roof.under - (o.y + 40)) < 60, 'it rests on that ceiling');
    const floor = floors.filter(f => f.left <= o.x && f.right >= o.x).sort((a, b) => b.y - a.y)[0];
    assert.ok(o.y - floor.y > CEILING, `${Math.round(o.y - floor.y)} up is reachable the right way up`);
  }
  assert.equal(sanctum.vaultKeyId, 'zenith-key');
  assert.match(fn('updateInversion'), /G\.gravityFlipped&&G\.p\.onGround[\s\S]*?activateVaultSecretObject\(sanctum,'gravity-sanctum'\)/);
});

test('the pixel renderer can show which way is down', () => {
  assert.match(renderer, /function flipWrap/);
  assert.match(renderer, /ctx\.translate\(0, 2 \* topY \+ boxH\); ctx\.scale\(1, -1\)/, 'a figure mirrors about its own box');
  assert.match(renderer, /flipWrap\(WY\(p\.y\) - 22, 22, \(\) => drawFigure/, 'the hero turns over');
  assert.match(renderer, /curG\.gravityFlipped && e\.kind !== 'fly'/, 'and so does every walker, but no flyer');
  assert.match(renderer, /function polarityTrim/);
  assert.match(fnFrom(renderer, 'polarityTrim'), /flipped \? by \+ h - 2 : by, w, 2, T\.cap\[1\]/, 'the cap moves to the side you owe');
  assert.match(renderer, /drawPlat\(o\); polarityTrim\(o\)/, 'on every platform');
  assert.match(fnFrom(renderer, 'drawPlat'), /o\.w \* Z > bw \* 3/, 'and the 200,000-wide world roof is clamped to the view');
  assert.match(renderer, /function flipTell/);
  assert.match(source, /G\.flipTellAt = G\.time/, 'a flip is stamped');
  assert.match(renderer, /alphaWrap\(tell \* \.22[\s\S]*?ctx\.fillRect\(0, 0, bw, bh\)/, 'and answered across the whole screen');
  // The camera has to re-frame, or half the screen shows the drop behind you.
  assert.match(source, /verticalThreshold:G\.gravityFlipped\?Math\.max\(60,GROUND_Y-\(VH-260\)\):GROUND_Y-260/);
  assert.match(camera, /fallLook = approach\(fallLook, targetFall/, 'and lead a long fall');
});

test('one speaking resident, and the recall has a unique of its own', () => {
  assert.equal(LEVEL.npcs.length, 1);
  assert.equal(LEVEL.npcs[0].profileId, 'sera', 'Oren carried forward, not a new face');
  assert.match(source, /keelman:\{muster:1/);
  assert.match(source, /keelman:\{[^}]*kind:'fly'/, 'the unique owes neither floor');
  assert.match(source, /\n  inversion:\[/, 'and the Inversion has a muster roster');
  const roster = /\n {2}inversion:\[([\s\S]*?)\n {2}\],/.exec(source)[1];
  assert.ok(/'keelman'/.test(roster));
  assert.ok(LEVEL.enemies.filter(e => e.t === 'keelman').length >= 3, 'it is a resident, not a cameo');
});

// ── THE PATH OF INVERSION ────────────────────────────────────────────────────
// Three lanes stacked in one 4,500-unit footprint and walked as a serpentine: west
// along the bottom, east along the middle, west along the top, then down the shaft.
// The first build of it was one straight tube, and the owner named what was wrong:
// "you can simply flip to ceiling, walk a bit, flip to floor, walk a bit, repeat."
const PATH_LANES = [40, 454, 868], PATH_CH = 400;
const CROSS_FOOT = 100;                       // a crossing costs ~100 units of ground
const pathAt = p => at(o => p(o) && o.x > PATH_W - 80 && o.x < PATH_E + 20);
const laneOf = y => y >= 860 ? 2 : y >= 450 ? 1 : 0;
const weave = pathAt(o => o.type === 'wall' && o.w === 34)
  .map(o => ({ x:o.x, top:o.y, bot:o.y - o.h,
               pillar: PATH_LANES.some(f => Math.abs(o.y - o.h - f) < 2) }))
  .sort((a, b) => a.x - b.x);
const lashes = pathAt(o => o.type === 'spikes' && !o.wall && o.w === 190);
// the Last Breath's own thorns start at the Path's mouth; they are not weave banks
const banks = pathAt(o => o.type === 'spikes' && !o.wall && o.w !== 190 && !o.lastBreath)
  .map(o => ({ o, y:o.y, left:o.x - o.w / 2, right:o.x + o.w / 2, ceil:!!o.ceil }));

test('the Path is a serpentine of three lanes, not a corridor', () => {
  // One lane's roof is the next one's floor, and each is solid end to end except for
  // the ONE hole that is the way on.
  const decks = pathAt(o => o.type === 'plat' && o.w > 1000 && !o.ceiling)
    .map(o => ({ y:o.y, left:o.x - o.w / 2, right:o.x + o.w / 2, roof:!!o.invRoof }))
    .sort((a, b) => a.y - b.y);
  assert.equal(decks.length, 4, 'a floor, two shared decks and a roof');
  for(let i = 0; i < 3; i++) assert.equal(decks[i].y, PATH_LANES[i],
    `lane ${i} does not stand where the constants say`);
  assert.equal(decks[3].y - 14, PATH_LANES[2] + PATH_CH, 'the top roof caps lane C at its own ceiling');
  // Lane A's hole is at its WEST end, lane B's at its EAST end — the two turns.
  assert.ok(decks[1].left > PATH_WALL + 40, 'lane A has no hole above its west end');
  assert.ok(decks[2].right < PATH_E - 60, 'lane B has no hole above its east end');
  // Lane C's roof has none at all: a hole there is a hole to the roof of the world,
  // which would be a free road west over the whole maze.
  assert.ok(decks[3].left <= PATH_W && decks[3].right >= PATH_E - 10,
    'the top roof is unbroken across the whole Path');
  for(let i = 0; i < 3; i++){
    const clear = (PATH_LANES[i] + PATH_CH) - PATH_LANES[i];
    assert.equal(clear, PATH_CH, `lane ${i} is not a ${PATH_CH} channel`);
  }
  // Three lanes of ~4,300 is three times the straight tube it replaces.
  assert.ok(PATH_LANES.length * (PATH_E - PATH_WALL - 200) > 12000,
    'the serpentine is not three times the road');
  assert.ok(pathAt(o => o.type === 'check').length >= 9, 'and every stretch has its retry');
});

test('the weave shuts half the channel at a time, and cannot be climbed', () => {
  assert.equal(weave.length, 24, 'eight steps to a lane, three lanes');
  for(const w of weave){
    const lane = laneOf(w.pillar ? w.bot + 5 : w.top - 5), f = PATH_LANES[lane], c = f + PATH_CH;
    if(w.pillar){
      assert.equal(w.bot, f, 'a pillar stands ON the lane floor');
      assert.ok(w.top - f >= 250, 'and shuts the bottom half outright');
      assert.ok(c - w.top > PLAYER_H + 60, 'while leaving the roof lane clear to run');
    }else{
      assert.equal(w.top, c, 'a stalactite hangs FROM the lane roof');
      assert.ok(c - w.bot >= 250, 'and shuts the top half outright');
      assert.ok(w.bot - f > PLAYER_H + 60, 'while leaving the floor lane clear to run');
    }
  }
  // A wall cannot be tanked, jumped or dashed past — which is the whole point of
  // using one. But it must not be a climbing frame either: a knight who could cling
  // one would go over it without ever turning the world over.
  const src = fn('PathPillar') + fn('PathDrop');
  assert.match(src, /slickL:1,slickR:1/, 'both faces are slick');
  // And they alternate, so every step is a change of floors.
  for(let lane = 0; lane < 3; lane++){
    const row = weave.filter(w => laneOf(w.pillar ? w.bot + 5 : w.top - 5) === lane);
    assert.equal(row.length, 8, `lane ${lane} has ${row.length} steps`);
    for(let i = 1; i < row.length; i++)
      assert.notEqual(row[i].pillar, row[i - 1].pillar, `lane ${lane} repeats a step at ${row[i].x}`);
  }
});

test('every step of the weave is thorned on the face it leaves open', () => {
  // The wall says which half; the thorns say you may not simply stand there. A bank
  // is 300 against a 500 spacing, so 200 of clear ground stands between one bank and
  // the next — twice what a crossing needs.
  assert.equal(banks.length, 24, 'one bank a step');
  for(const t of banks) assert.equal(t.o.dmg, 20,
    'one Blood a touch: at 12-14 a knight walks it the wrong way up and tanks it');
  for(const w of weave){
    const lane = laneOf(w.pillar ? w.bot + 5 : w.top - 5), f = PATH_LANES[lane];
    const want = w.pillar ? f : f + PATH_CH;          // pillar -> floor thorns, drop -> roof
    assert.ok(banks.some(t => Math.abs(t.y - want) < 2 && t.left < w.x && t.right > w.x),
      `the step at ${w.x} leaves its open face bare`);
  }
  // The gaps between consecutive banks in a lane are the crossing windows.
  for(let lane = 0; lane < 3; lane++){
    const row = banks.filter(t => laneOf(t.ceil ? t.y - 5 : t.y + 5) === lane)
      .sort((a, b) => a.left - b.left);
    for(let i = 1; i < row.length; i++){
      const gap = row[i].left - row[i - 1].right;
      assert.ok(gap >= CROSS_FOOT, `a ${Math.round(gap)} gap at ${Math.round(row[i].left)} cannot hold a crossing`);
    }
  }
});

test('each turn is a wall of thorns with the only way on above it', () => {
  const walls = pathAt(o => o.type === 'spikes' && o.wall);
  assert.equal(walls.length, 2, 'two turns, two walls');
  for(const w of walls){
    assert.equal(w.dmg, 20);
    assert.ok(w.len >= PATH_CH, `a ${w.len} band leaves a way past at ${w.x}`);
    const lane = laneOf(w.y);
    assert.ok(Math.abs(w.y - (PATH_LANES[lane] + PATH_CH / 2)) < 30, 'centred on its lane');
  }
  // West wall turns lane A up; east wall turns lane B up.
  const west = walls.find(w => w.face > 0), east = walls.find(w => w.face < 0);
  assert.ok(west && east, 'one faces east into lane A, one faces west into lane B');
  assert.equal(laneOf(west.y), 0);
  assert.equal(laneOf(east.y), 1);
  // And the shaft at the far end drops the whole way to the fissure floor.
  assert.ok(floors.some(f => f.y === 0 && f.left <= PATH_W && f.right >= PATH_WALL - 1),
    'the shaft has a floor into the fissure');
});

// ── THE LAST BREATH ──────────────────────────────────────────────────────────
// The finale: a curved tube of thorns with nowhere to land, laid in the 2,600 that
// opened west of the Path. "I want the end of it to be completely spikes — i.e.,
// there is absolutely nowhere to land. Nowhere."
const breath = at(o => o.lastBreath);
const breathWalls = breath.filter(o => o.type === 'plat')
  .map(o => ({ x:o.x, lo:o.y - (o.h || 14), hi:o.y }));
const channelAt = x => {
  const cols = breathWalls.filter(o => Math.abs(x - o.x) < 74).sort((a, b) => a.lo - b.lo);
  const m = [];
  for(const c of cols){ const t = m[m.length - 1];
    if(t && c.lo <= t.hi + 1) t.hi = Math.max(t.hi, c.hi); else m.push({ ...c }); }
  let best = 0, lo = 0, hi = 0;
  for(let i = 1; i < m.length; i++){ const g = m[i].lo - m[i - 1].hi;
    if(g > best){ best = g; lo = m[i - 1].hi; hi = m[i].lo; } }
  return best ? { lo, hi, gap:best } : null;
};

test('the Last Breath has nowhere to land, and begins where the serpentine ends', () => {
  assert.ok(breath.length >= 100, `${breath.length} pieces is not a tube`);
  const thorns = breath.filter(o => o.type === 'spikes');
  assert.equal(thorns.length, breathWalls.length, 'every wall carries thorns — both faces, whole length');
  for(const t of thorns) assert.equal(t.dmg, 20, 'one Blood a touch');
  assert.equal(thorns.filter(t => t.ceil).length, thorns.length / 2, 'half of them hang');
  // RIGHT after the serpentine: its mouth is inside the Path's own west wall, at the
  // height lane C leaves you, so there is no ground between the two and no fall onto
  // its teeth as you arrive.
  const mouth = breathWalls.reduce((a, b) => b.x > a.x ? b : a);
  assert.ok(mouth.x >= PATH_WALL - 120 && mouth.x <= PATH_WALL + 20,
    `the mouth at ${Math.round(mouth.x)} is not against the Path's end (${PATH_WALL})`);
  const c = channelAt(mouth.x);
  assert.ok(c && c.lo < PATH_LANES[2] && c.hi > PATH_LANES[2],
    'lane C hands you into the MIDDLE of the channel, not onto its floor');
});

test('the tube is wider than the jetpack tube and gentle enough to be flown', () => {
  // WIDER, because a jetpack holds a line and a flip cannot: you let go of one floor
  // and fall the whole way. Needlewind's tube is halfWidth 112 — 224 across.
  let narrowest = { gap: Infinity, x: 0 }, steepest = { slope: 0, x: 0 };
  const xs = breathWalls.map(o => o.x).sort((a, b) => a - b);
  for(let x = Math.ceil(xs[0]) + 80; x < xs[xs.length - 1] - 80; x += 20){
    const c = channelAt(x);
    if(c && c.gap < narrowest.gap) narrowest = { gap:Math.round(c.gap), x };
  }
  assert.ok(narrowest.gap > 224,
    `${narrowest.gap} at ${narrowest.x} is narrower than the jetpack tube it must beat`);
  assert.ok(narrowest.gap >= 400, `${narrowest.gap} leaves no room to oscillate in`);
  // THE CURVE IS SLOPED TO WHAT A FALLING BODY CAN TRACE. The knight flies this on
  // ballistic arcs — about 70 either side of the middle, 179 units of ground a swing.
  // Past a slope of about 0.5 the curve eats the whole channel and the thorns arrive
  // at 950 u/s with 163 units of stopping distance in hand; nothing survived the
  // first cut, which swung 260 over 240.
  // Measured over a 240-unit baseline, not sample to sample: the walls are discrete
  // blocks, so a reading taken across one block's edge sees a step, not the curve.
  const mids = [];
  for(let x = Math.ceil(xs[0]) + 90; x < xs[xs.length - 1] - 90; x += 20){
    const c = channelAt(x); if(c) mids.push({ x, mid:(c.lo + c.hi) / 2 });
  }
  for(let i = 12; i < mids.length; i++){
    const slope = Math.abs(mids[i].mid - mids[i - 12].mid) / Math.abs(mids[i].x - mids[i - 12].x);
    if(slope > steepest.slope) steepest = { slope:+slope.toFixed(2), x:mids[i].x };
  }
  // 0.7 is where the evidence sits, not where a guess put it: the first cut of this
  // tube swung 260 over 240 — a slope of 1.08 — and no flown line survived 500 units
  // of it. What ships swings about 150 over 240, reads as 0.6 here, and a bot holding
  // a steady twelve-frame beat clears the whole thing in 4 runs of 5.
  assert.ok(steepest.slope <= 0.7,
    `the centreline runs at ${steepest.slope} near ${steepest.x}; a falling body cannot trace that`);
  // And it lets you out over the fissure, whose roof catches nobody from above.
  const west = breathWalls.reduce((a, b) => b.x < a.x ? b : a);
  assert.ok(west.x <= 1500, 'the tube reaches the fissure');
  const fissureRoof = roofs.find(r => r.left <= 0 + 1 && r.right >= 1400 - 1);
  assert.ok(fissureRoof && fissureRoof.o.ceilingOnly,
    'and you fall THROUGH the fissure roof onto the safe floor, because it is ceilingOnly');
});

test('the lash bites the crossing, and wall thorns bite what they draw', () => {
  // "I like this thing that jumps out to hit you, but it should damage you at ALL
  // points/parts, so that you have to time your way past it."
  assert.ok(lashes.length >= 9, `${lashes.length} lashes is not a rhythm`);
  for(const l of lashes){
    assert.ok(l.period < 100 && l.upT < l.period, 'it throws out and pulls back');
    assert.equal(l.dmg, 20);
    const lane = laneOf(l.y - 200);
    assert.ok(Math.abs(l.y - (PATH_LANES[lane] + 200)) < 2,
      'it hangs in the MIDDLE of the channel, where nothing rests — so it can only ever hit a crossing');
  }
  // THE RENDER USED TO LIE. drawSpikes read a wall band's `len` as the distance its
  // teeth jut OUT and painted a bar that long lying on its side, while the hitbox is
  // a `len`-TALL strip only SPIKE_REACH wide against the wall: a 400 band drew a
  // 400-unit spear across the room and bit almost none of it.
  const draw = fnFrom(renderer, 'drawSpikes');
  assert.match(draw, /const reach = Math\.max\(3, Math\.round\(24 \* Z \* ext\)\)/,
    'the teeth jut SPIKE_REACH, which is what the collision reads');
  assert.match(draw, /half = Math\.round\(\(o\.len \|\| 80\) \* Z \/ 2\)/,
    'and the band runs `len` ALONG the wall, which is also what the collision reads');
  assert.doesNotMatch(draw, /for\(let k = 0; k < len; k\+\+\)/, 'the sideways bar is gone');
});
