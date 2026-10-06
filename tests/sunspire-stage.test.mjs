// Sunspire Palace: Act Two's last region (stage 20). Light is a portal noun: the King's shafts
// are caught in a mouth on slate and let out of its twin — up into the court's seal, across the
// Hall of Hours onto the dial, down from a ring onto the sluice. The colony's water goes home;
// the King in Daylight is touched from two sides at once; the hydra comes, and you ride it.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const sun = read('bladefall-sunspire.js');
const art = read('bladefall-sunspire-art.js');
const renderer = read('bladefall-respec-renderer.js');

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
const sandbox = vm.createContext({ Math, Object, JSON, window:{} });
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Seam', 'Slate', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n'
  + ['bladefall-landing-shores.js', 'bladefall-colony.js', 'bladefall-palace-path.js'].map(read).join('\n') + '\n' + sun, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const SS = sandbox.window.BladefallSunspire;
const K = SS.constants;
const L = ACT.level(20);
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
const REACH = { flat:671, doubleJumpRise:147 };                 // measured, full kit
const HOOK = ACT.kit.HOOK_RANGE;
const KNIGHT = { w:26, h:44, cling:0.4 };                        // placePortal: a wall mouth at p.y + p.h * 0.4
const solids = () => objs(o => (o.type === 'plat' || o.type === 'wall') && !o.gone);
const shaft = (id) => K.SHAFTS.find(s => s.id === id);
const panel = (id) => K.PANELS.find(p => p.id === id);
// Where the engine puts a mouth: a floor mouth under the knight's centre (anywhere its feet
// overlap the slab), a wall mouth 2 in from the knight's centre, at any height it can cling.
const floorMouths = (slab) => [slab.x - slab.w / 2 - KNIGHT.w / 2 + 1, slab.x, slab.x + slab.w / 2 + KNIGHT.w / 2 - 1].map(x => ({ x, y:0, nx:0, ny:1 }));
function wallMouths(P){
  const face = P.x + P.face * 20, px = face + P.face * KNIGHT.w / 2, bottom = P.top - P.h, out = [];
  for(let py = bottom - KNIGHT.h + 2; py < P.top - 2; py += 12) out.push({ x:px - P.face * 2, y:Math.max(20, py + KNIGHT.h * KNIGHT.cling), nx:P.face, ny:0 });
  return out;
}
const hits = (src, mouths, bods) => SS.trace(src, solids(), bods || [], mouths);

test('stage 20 is registered everywhere a stage must be', () => {
  assert.match(source, /20:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(20\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 20);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(source, /G\.stageIndex<=20\)/, 'the journey runs through the palace');
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b20\b[^\]]*\]\)/);
  assert.match(renderer, /sunspire:\{ sky:/, 'its theme');
  assert.match(source, /20:Object\.freeze\(\{id:'sunspire-white-marble'/, 'LEVEL_MUSIC');
  assert.match(source, /dayking:\{hp:\d+,dmg:\d+,speed:\d+,w:\d+,h:\d+,xp:0,color:'#[0-9a-f]+',kind:'boss',boss:true,label:'THE KING IN DAYLIGHT'\}/);
  for(const f of ['white-marble-palace', 'the-fallen-champion-duel', 'passing-the-flame', 'chains-of-the-deep'])
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
  assert.ok(source.indexOf('bladefall-palace-path.js?v=') < source.indexOf('bladefall-sunspire.js?v='), 'the region registers after the act');
  assert.match(source, /<script src="bladefall-sunspire-art\.js\?v=[\d.]+"><\/script>/);
  assert.match(read('sw.js'), /bladefall-sunspire\.js\?v=/);
  assert.equal(L.portal, null);
  assert.equal(L.authoredEcology, true);
  assert.ok(ACT.handles(20));
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'servants-fountain');
  assert.match(read('bladefall-recovery.js'), /\['servants-fountain', 'sunspire', 'The Servants’ Fountain', [\d.]+, false\]/);
});

test('THE SUN GATE is walked both ways between the Path and the palace', () => {
  assert.match(read('bladefall-zones.js'), /\['path-sunspire', 'palace-path', 'east', 'walk', 0\.5, 'sunspire', 'west', 'walk', 0\.5\]/);
  const out = fnFrom(read('bladefall-palace-path.js'), 'seamSpec');
  assert.match(out, /connector:'path-sunspire'/);
  assert.match(out, /!A\.gateOpen/, 'only through the open gate');
  assert.match(fnFrom(read('bladefall-palace-path.js'), 'update'), /!A2\.handles\(STAGE \+ 1\)\) reachPalace\(A\)/, 'the frontier card only while there is no palace');
  assert.deepEqual({ ...ACT.arrivalFor({ connectorId:'path-sunspire', targetZoneId:'sunspire' }) }, { ...K.SPAWN });
  assert.ok(ACT.arrivalFor({ connectorId:'path-sunspire', targetZoneId:'palace-path' }).x > 10000, 'coming back, you arrive inside the gate');
});

test('LIGHT: every shaft falls where it says, and only the lock shafts fall on slate', () => {
  const slabs = Object.values(K.SLABS);
  const onSlate = (x) => slabs.some(s => Math.abs(x - s.x) <= s.w / 2);
  for(const s of K.SHAFTS){
    const h = hits(s, null); assert.equal(h.hit.kind, 'solid', s.id + ' lands on the floor');
    assert.ok(Math.abs(h.segs[0].x2 - s.tx) < 2, s.id + ' lands at ' + s.tx);
  }
  assert.ok(onSlate(shaft('court').tx) && onSlate(shaft('hall').tx) && onSlate(shaft('crown').tx));
  assert.ok(!onSlate(shaft('hall-2').tx), 'the Hall\'s second shaft is only heat');
  K.HOURS.forEach((H, i) => H.shafts.forEach(s => assert.equal(onSlate(s.tx), !s.w, `${H.id}: the shaft at ${s.tx} ${s.w ? 'is only heat' : 'falls on slate'}`)));
  for(const S of K.SEALS) for(const s of K.SHAFTS){ const h = hits(s, null); assert.notEqual(h.hit.kind, 'seal', `${s.id} does not light ${S.id} by itself`); }
  assert.match(fnFrom(sun, 'rayMouth'), /dx \* m\.nx \+ dy \* m\.ny >= 0\) return null/, 'light goes into a mouth only against its face');
  assert.match(fnFrom(sun, 'trace'), /dx = exit\.nx; dy = exit\.ny;/, 'and leaves its twin along the twin\'s normal, as the engine throws a body');
});

test('THE SUN COURT: floor to floor — the light goes up into the seal, wherever on the slab the mouths are set', () => {
  for(const a of floorMouths(K.SLABS.court1)) for(const b of floorMouths(K.SLABS.court2)){
    const h = hits(shaft('court'), [a, b]);
    assert.equal(h.hit.kind, 'seal', `mouths at ${a.x} and ${b.x}`); assert.equal(h.hit.S.id, 'court');
  }
  assert.match(fnFrom(sun, 'lightSeal'), /if\(S\.bars\) setBars\(S\.bars, false\)/);
  assert.equal(one(o => o.actBars === 'court-gate').gone, false, 'the garden gate is shut');
  assert.ok(one(o => o.actBars === 'court-gate').h > REACH.doubleJumpRise * 3, 'and no jump clears it');
});

test('THE HALL OF HOURS: floor to wall — across the hall onto the dial, from any height the panel holds a mouth', () => {
  const walls = wallMouths(panel('hall-arch'));
  assert.ok(walls.length >= 10);
  for(const a of floorMouths(K.SLABS.hall)) for(const w of walls){
    const h = hits(shaft('hall'), [a, w]);
    assert.equal(h.hit.kind, 'seal', `wall mouth at y ${Math.round(w.y)}`); assert.equal(h.hit.S.id, 'hour');
  }
  // It reads a quarter to four.
  assert.match(fnFrom(art, 'drawSeal'), /3\.75 \/ 12/);
});

test('THE AQUEDUCT CROWN: the panel is out of every jump, reached from a ring; the light crosses onto the sluice', () => {
  const P = panel('crown-arch');
  assert.ok(P.top - P.h > REACH.doubleJumpRise + 150, 'no jump reaches the Crown\'s slate');
  const foot = { x:K.RING.x - 40, y:22 };
  assert.ok(Math.hypot(foot.x - K.RING.x, foot.y - K.RING.y) <= HOOK, 'its ring is in reach from the floor');
  const hangY = K.RING.y - 58;
  assert.ok(hangY + KNIGHT.h > P.top - P.h && hangY < P.top, 'hanging from it, the knight is level with the slate');
  for(const a of floorMouths(K.SLABS.crown)) for(const w of wallMouths(P)){
    if(w.y < P.top - P.h || w.y > P.top) continue;                              // the stone below and above is not slate
    const h = hits(shaft('crown'), [a, w]);
    assert.equal(h.hit.kind, 'seal', `wall mouth at y ${Math.round(w.y)}`); assert.equal(h.hit.S.id, 'sluice');
  }
  assert.match(fnFrom(sun, 'openSluice'), /down the conduit, down the mountain, to the tents/, 'you watch the water go home');
  assert.ok(K.FLUME.x2 - K.FLUME.x1 > 800, 'the full flume is too long to jump');
  assert.match(fnFrom(sun, 'updateFlume'), /p\.x -= 300 \* dt/, 'and its current carries you back');
  assert.match(fnFrom(sun, 'updateFlume'), /if\(A\.drained && A\.drainT > 2\.5\) return;/, 'drained, it is the road');
});

test('THE KING IN DAYLIGHT: untouched until he is touched from two sides at once', () => {
  assert.match(fnFrom(sun, 'firstFrame'), /portalGate:'daylight'/, 'every blade is turned (hitEnemy deflects a portalGate boss)');
  assert.match(source, /if\(e\.portalGate && !\(e\.exposeT>0\) && src!==e\.portalGate\)\{bossDeflect\(e\);return;\}/);
  const t = fnFrom(sun, 'updateThrone');
  assert.match(t, /const open = !!side && you === -side/, 'open only while the touch is on the side away from you');
  assert.match(t, /K\.exposeT = open \? 0\.12 : 0/);
  assert.match(fnFrom(sun, 'updateBeams'), /if\(h\.kind === 'king'\)\{ if\(b\.routed\) A\.beamSide/, 'only light you have caught touches him — his own windows do not');
  assert.match(fnFrom(sun, 'swing'), /K\._bloomSwing === p\.swingHits/, 'one bloom per blow');
  assert.equal(K.BLOOMS, 6);
  // Alone: the hour's shaft, caught on its slab and let out low on either door's slate, crosses
  // the hall at his height and lands on him.
  const king = (x) => [{ kind:'king', l:x - 42, r:x + 42, b:0, t:200, ref:{} }];
  K.HOURS.forEach(H => {
    const route = H.shafts.find(s => !s.w), src = { id:H.id, x:route.x, y:K.WINDOW_Y, tx:route.tx, ty:0 };
    const slab = Object.values(K.SLABS).find(s => Math.abs(s.x - route.tx) < 2);
    for(const P of [panel('throne-west'), panel('throne-east')]) for(const w of wallMouths(P).filter(m => m.y <= 190)){
      const kx = P.face > 0 ? K.ARENA.x2 - 120 : K.ARENA.x1 + 120;
      const h = hits(src, [floorMouths(slab)[1], w], king(kx));
      assert.equal(h.hit.kind, 'king', `${H.id}: from ${P.id} at y ${Math.round(w.y)}`);
    }
  });
  assert.match(fnFrom(sun, 'moveCompanion'), /a\.st = 'touch'; a\.t = 0; a\.side = side/, 'with the colony, a sick hand on his back');
  assert.match(fnFrom(sun, 'moveCompanion'), /const side = a\.side \|\| -\(Math\.sign\(p\.x - K\.x\) \|\| 1\)/, 'the committed touch keeps its side');
});

test('THE THRONE OF NOON: the sun climbs, the hour holds, the sick fight for him, and he does not run', () => {
  const b = fnFrom(sun, 'bloom');
  assert.match(b, /K\.st = 'climb';/, 'at each hour he goes back to the throne: time to catch the new light');
  assert.match(b, /clearPlacedPortals\(false, 'sunspire-hour'\)/, 'the old mouths are lost in the glare');
  assert.match(b, /kit\.latch\(ZONE, h === 1 \? 'sunspire-morning' : 'sunspire-noon'\)/, 'and the hour reached holds through a death');
  assert.match(fnFrom(sun, 'init'), /done\(c, 'sunspire-noon'\) \? 4 : done\(c, 'sunspire-morning'\) \? 2 : 0/);
  assert.match(fnFrom(sun, 'addsForHour'), /if\(!kit\.path\(\)\.forsaken\) return;/, 'the sick fight for him only on the forsaken road');
  assert.match(fnFrom(sun, 'updateHall'), /if\(!P\.forsaken \|\| p\.x < 3600/, 'and come in behind you in the Hall');
  assert.match(fnFrom(act, 'updateBelled'), /else if\(e\.zealot\) windUp\(e, BELLED\.drivenWind\);/);
  const y = fnFrom(sun, 'yieldKing');
  assert.match(y, /He does not run\./);
  assert.match(y, /a quarter to four/);
  assert.doesNotMatch(sun, /kingRetreats/, 'nothing of Act One\'s escape');
  assert.doesNotMatch(sun + art, /lepro/i, 'the sickness is never named');
});

test('THE SEA TERRACE: the hydra comes, does not strike, warns you of the Echo, and you ride it out of the act', () => {
  const h = fnFrom(sun, 'updateHydra');
  assert.match(h, /It does not strike\./);
  assert.match(h, /The one you left on the beach did not stay on the beach/);
  assert.match(fnFrom(sun, 'musicCue'), /A\.hydra && A\.hydra\.st !== 'below'\) return CUES\.hydra/, 'boss music, and then it does not attack');
  assert.equal(one(o => o.actId === 'hydra').actVerb, 'CLIMB ON');
  assert.equal(one(o => o.actId === 'hydra').actMute, 1, 'only once it has said what it came to say');
  assert.match(fnFrom(sun, 'updateRide'), /endOfAct\(\)/);
  const e = fnFrom(sun, 'endOfAct');
  assert.match(e, /meta\.actTwoDone = true/);
  assert.match(e, /END OF ACT TWO/);
  assert.match(fnFrom(art, 'drawRide'), /the knight/i);
});

test('MENDED and Level Select carry into the last region', () => {
  assert.match(fnFrom(act, 'pickPath'), /PATHS\[Math\.min\(stage, 19\)\]/, 'stage 20 asks the same question as 19');
  assert.match(source, /if\(i>=18&&window\.BladefallActTwo&&BladefallActTwo\.pickPath\(i,go\)\)return;/);
  assert.match(fnFrom(sun, 'init'), /allies:allied\(P\)/);
  assert.match(fnFrom(sun, 'allied'), /P\.oren === 'helped' && P\.colony === 'turned'/);
});

test('the art is registered and draws what the region owns', () => {
  assert.match(art, /ART\.register\(20, /);
  for(const f of ['drawKing', 'drawHydra', 'drawRide', 'drawBeam', 'drawSeal', 'drawFountain', 'drawLateMirror']) assert.ok(art.includes('function ' + f + '('), f);
  assert.match(fnFrom(art, 'drawKing'), /const ink = /, 'an ink line round him, so he reads in his own white hall');
});


test('saved hours restore visible blooms and a defeated King remains seated', () => {
  const A={enc:{throne:{st:'done',foes:[]}},blooms:6};
  const ctx=vm.createContext({A,THRONE:K.THRONE,ARENA:K.ARENA,G:{},spawnEnemy:()=>({})});
  vm.runInContext(fnFrom(sun,'flowersFor')+fnFrom(sun,'firstFrame'),ctx);
  vm.runInContext('firstFrame(A)',ctx);
  assert.equal(A.king.st,'yield');assert.equal(A.king.active,false);assert.equal(A.king.flowers.length,6);
  A.enc.throne.st='idle';A.blooms=4;vm.runInContext('firstFrame(A)',ctx);
  assert.equal(A.king.st,'throne');assert.equal(A.king.flowers.length,4);
});

test('a touching ally keeps its physical side when the knight crosses the King', () => {
  const a={x:1052,y:0,side:1,st:'touch',t:0}, king={x:1000}, p={x:1200,y:0};
  const ctx=vm.createContext({a,king,p,groundAt:()=>0});
  vm.runInContext(fnFrom(sun,'moveCompanion'),ctx);
  vm.runInContext('moveCompanion({},a,.1,p,king,true,100)',ctx);
  assert.equal(a.side,1);assert.equal(a.x,1052);
});

test('boarding moves onto the lowered head before the sea ride begins', () => {
  const A={board:{t:0,fx:11480,fy:0,x:11480,y:0},hydra:{st:'board'}}, p={};
  const ctx=vm.createContext({A,p,TERRACE:K.TERRACE});
  vm.runInContext(fnFrom(sun,'updateBoard'),ctx);
  vm.runInContext('updateBoard(A,.7,p)',ctx);assert.equal(A.ride,undefined);assert.equal(p.y,0);
  vm.runInContext('updateBoard(A,.45,p)',ctx);assert.ok(p.y>80);assert.equal(A.ride,undefined);
  vm.runInContext('updateBoard(A,.7,p)',ctx);assert.equal(A.board,null);assert.equal(A.hydra.st,'ride');assert.equal(A.ride.t,0);
});
