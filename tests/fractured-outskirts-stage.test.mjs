// The Fractured Outskirts: Act Three's first echo (stage 21). A B-side of the first road — one
// jump, no steel, at night, with the Muster on it — and a C-side: the Mile Sentinel, a pattern to
// learn, bound by three bells, each reached only by standing on what one of its moves leaves.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const fo = read('bladefall-fractured-outskirts.js');
const art = read('bladefall-fractured-outskirts-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Seam', 'Slate', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + fo, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const FO = sandbox.window.BladefallFracturedOutskirts;
const K = FO.constants, S = K.S;
const L = ACT.level(21);
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
// The jump-only knight, measured in the browser: a 78 apex, 136 at a 199 run.
const KNIGHT = { h:44, w:26, run:199, g:1349, vy:459 };
const reach = (dy) => { const d = KNIGHT.vy * KNIGHT.vy - 2 * KNIGHT.g * dy; return d < 0 ? -1 : KNIGHT.run * (KNIGHT.vy + Math.sqrt(d)) / KNIGHT.g; };
const APEX = KNIGHT.vy * KNIGHT.vy / (2 * KNIGHT.g);

test('stage 21 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /21:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(21\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 20);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b21\b[^\]]*\]\)/);
  assert.match(renderer, /fractured:\{ sky:/);
  assert.match(source, /21:Object\.freeze\(\{id:'fractured-void-breach'/, 'LEVEL_MUSIC');
  for(const f of ['through-the-void-breach', 'crystalline-trials']) assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
  assert.ok(source.indexOf('bladefall-act-two.js?v=') < source.indexOf('bladefall-fractured-outskirts.js?v='), 'it registers after the core');
  assert.match(source, /<script src="bladefall-fractured-outskirts-art\.js\?v=[\d.]+"><\/script>/);
  assert.match(read('sw.js'), /bladefall-fractured-outskirts\.js\?v=/);
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Outskirts'[^}]*act: 3/);
  assert.match(source, /if\(st\.act===3\)return '';/, 'not on the Base list');
  assert.match(source, /G\.stageIndex>=21\?'ACT THREE · AN ECHO'/, 'its card says Act Three');
  assert.ok(ACT.handles(21));
  assert.equal(L.portal, null);
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'ash-watchfire');
  assert.match(read('bladefall-recovery.js'), /\['ash-watchfire', 'fractured-outskirts', 'The Ash Watchfire', [\d.]+, false\]/);
});

test('THE FIRST ROAD\'S KIT: one jump and the dash (never taken away), no blade — and the Muster walks it', () => {
  const init = fnFrom(fo, 'init');
  assert.match(init, /F\.setKit\(\['jump'\]\)/, 'a single jump, through the core that keeps the dash');
  assert.match(init, /acquired:\['dash'\]/, 'the fallback keeps the dash too');
  assert.match(init, /G\.p\.weapon = null/, 'no blade');
  const core = read('bladefall-fractured.js');
  assert.match(fnFrom(core, 'setKit'), /acquired:ids\.includes\('dash'\) \? ids\.slice\(\) : ids\.concat\('dash'\)/, 'every echo keeps the dash');
  assert.match(fnFrom(core, 'setKit'), /if\(!ids\.includes\('weapon'\)\)\{ G\.p\.weapon = null;/, 'the hands stay as authored');
  assert.match(read('index.html'), /if\(G\.echoNoArsenal\)return false;/, 'no second weapon handed over where the original had no dash');
  assert.match(init, /G\.musterForced = true/, 'the Muster is on the road');
  const first = fnFrom(fo, 'firstFrame');
  assert.match(first, /e\.musterRole = 'outrider'/, 'the outrider commits to a lunge and leaves a recovery');
  assert.match(first, /e\.musterRole = 'signaler'/);
  assert.match(first, /applyRecallBaseline\(e\)/, 'x1.55 health, x1.25 damage, eyes to 480');
  const types = L.enemies.map(e => e.t);
  for(const t of ['outrider', 'shieldbearer', 'linesman', 'signaler']) assert.ok(types.includes(t), t + ' walks the road');
  assert.ok(L.enemies.every(e => e.noDrop && e.encounterIntent === 'avoidance'), 'every one is avoided, never fought');
});

test('THE B-SIDE: every gap clears on the single jump — exactly', () => {
  const road = [...K.GROUND.map(g => ({ a:g[0], b:g[1], y:0 })), ...K.STONES.map(s => ({ a:s[0] - s[1] / 2, b:s[0] + s[1] / 2, y:s[2] }))].sort((u, v) => u.a - v.a);
  let tight = 999;
  for(let i = 0; i + 1 < road.length; i++){
    const A = road[i], B = road[i + 1]; if(B.a <= A.b) continue;
    const gap = B.a - A.b, dy = B.y - A.y, r = reach(dy);
    assert.ok(dy < APEX - 4, `${A.b}→${B.a}: a rise of ${dy} against a ${APEX.toFixed(0)} jump`);
    assert.ok(r >= gap + 15, `${A.b}→${B.a}: ${gap} of void for a jump of ${r.toFixed(0)}`);
    tight = Math.min(tight, r - gap);
  }
  assert.ok(tight < 25, 'and some of them are tight: it is a B-side');
  assert.ok(K.STONES.filter(s => s[3]).length >= 5, 'crumbling stones: land and go');
  for(const r of K.REFUGES) assert.ok(r[2] < APEX - 4, 'every refuge is one jump up');
  assert.equal(FO.groundAt(450), null, 'the creeks are gone: pits');
  assert.match(fnFrom(fo, 'voidFloor'), /return -140/);
});

test('THE VIGIL: the Sentinel is locked up early, and the gate\'s chain is its cell\'s lock', () => {
  assert.ok(K.CELL.x < 4000 && K.CELL.y > APEX + KNIGHT.h, 'you pass under its cell early, out of reach');
  assert.match(fnFrom(fo, 'updateCell'), /Math\.abs\(p\.x - CELL\.x\) < 140/, 'it wakes as you pass');
  const lever = one(o => o.actId === 'lever');
  assert.equal(lever.actVerb, 'PULL THE CHAIN');
  const i = fnFrom(fo, 'interact');
  assert.match(i, /kit\.latch\(ZONE, 'fo-released'\)/);
  assert.match(i, /e\.st = 'drop'/, 'release is performed visibly in play');
  assert.ok(K.LEVER_X - K.YARD.x1 < 140, 'the release is at the entrance, within sight of the falling Sentinel');
  assert.equal(one(o => o.actBars === 'mothlight-gate').gone, false, 'the Mothlight Gate is shut');
  assert.match(fnFrom(fo, 'bindSentinel'), /setBars\('mothlight-gate', true\)/, 'until the Sentinel is bound');
});

function encounter(){
  const circuits = {}, hits = [], checkpoints = [];
  let region;
  const G = { p:{x:140,y:0,w:26,h:44,onGround:true,invuln:0,dodgeTimer:0,weapons:[]}, enemies:[], obstacles:[], shake:0 };
  const A2 = { register:(_s, value) => {region=value;}, kit:{
    zoneCircuits:() => circuits, circuitSet:(c,id) => !!c[id], latch:(_z,id) => {circuits[id]=true;},
    burst(){}, say(){},
  }};
  const context = vm.createContext({ Math,Object,JSON,window:{BladefallActTwo:A2}, G,meta:{soundOn:false},
    BFCapabilitiesModule:{createState:s=>s},syncMovementCapabilities(){},syncWeaponCapabilities(){},applyRecallBaseline(){},
    spawnEnemy:(_t,x)=>{const e={x};G.enemies.push(e);return e;},
    hurtPlayer:(damage)=>hits.push(damage),activateRuntimeCheckpoint:(...args)=>checkpoints.push(args),
  });
  vm.runInContext(['Pl','GrAt'].map(n=>fnFrom(source,n)).join('\n')+'\n'+fo,context);
  const level=region.level();
  G.obstacles=JSON.parse(JSON.stringify(level.objects)); level.build(); region.update(0,G.p);
  return {G,region,circuits,hits,checkpoints,reload(){G.obstacles=JSON.parse(JSON.stringify(level.objects));level.build();region.update(0,G.p);}};
}

test('the approach teaches a persistent touch-bell gate and keeps recovery on stable ground',()=>{
  const h=encounter(),p=h.G.p;
  p.x=K.LESSON.x;p.y=20;h.region.update(0,p);
  assert.equal(h.G.actTwo.lesson,false,'standing below the bell does not ring it');
  p.y=95;h.region.update(0,p);
  assert.equal(h.G.actTwo.lesson,true);
  assert.equal(h.G.obstacles.find(o=>o.actBars==='lesson-gate').gone,true);
  h.reload();assert.equal(h.G.actTwo.lesson,true,'a reload retains the lesson');
  for(const c of K.CHECKPOINTS) assert.equal(FO.groundAt(c.x),0,`${c.id} remains on ground`);
  assert.ok(K.STONES.filter(s=>s[3]).length>=15,'extended crumble sequences replace flat running');
});

test('road chains warn without damage, sweep low once per cycle, and can be jumped',()=>{
  const h=encounter(),p=h.G.p,s=K.ROAD_SWEEPS[0]; p.x=s.x;p.y=0;
  h.G.actTwo.t=.5;h.region.update(0,p);assert.equal(h.hits.length,0,'warning is harmless');
  h.G.actTwo.t=K.ROAD_TELL+.05; p.y=s.y+45;h.region.update(0,p);
  assert.equal(h.hits.length,0,'a jump clears the live chain');
  p.y=0;h.region.update(0,p);h.region.update(0,p);
  assert.deepEqual(h.hits,[12],'one hit per sweep, no frame-by-frame damage');
  h.G.actTwo.t=s.period+K.ROAD_TELL+.05;h.region.update(0,p);assert.equal(h.hits.length,2);
  assert.ok(K.ROAD_TELL>2*KNIGHT.vy/KNIGHT.g,'the warning exceeds a full jump');
});

test('death removes both temporary boss platforms and retains rung bells across reload',()=>{
  const h=encounter(),p=h.G.p,A=h.G.actTwo,e=A.sentinel;
  h.region.interact({actId:'lever'});assert.equal(e.st,'drop');assert.equal(A.queue.length,0);
  p.x=9000;p.y=165;h.region.update(0,p);assert.equal(A.bells.centre,true);
  e.st='rush';e.rushDir=1;e.x=9170;e.hitThisRush=false;p.x=9400;p.y=0;
  h.region.updateFoe(e,p,.1);
  assert.equal(e.st,'stunned');assert.ok(h.G.obstacles.some(o=>o.sentinelShoulders));
  h.G.obstacles.push({sentinelHaft:1});
  p.dead=true;h.region.update(0,p);p.dead=false;p.x=8100;h.region.update(0,p);
  assert.equal(h.G.obstacles.some(o=>o.sentinelShoulders||o.sentinelHaft),false);
  assert.equal(A.bells.centre,true);assert.equal(e.hitThisRush,false);
  h.reload();assert.equal(h.G.actTwo.bells.centre,true);assert.equal(h.G.actTwo.rung,1);
});

test('THE C-SIDE: no bell from the floor; each bell only from what one of its moves leaves', () => {
  const head = (floor) => floor + APEX + KNIGHT.h;
  const bell = (id) => K.BELLS.find(b => b.id === id), bottom = (b) => b.y - K.BELL_R;
  for(const b of K.BELLS) assert.ok(head(0) < bottom(b), `${b.id}: out of reach from the floor`);
  const stoneTop = K.SENTINEL_STONES[0].h, haft = 64, shoulders = 130;
  assert.ok(stoneTop < APEX - 4, 'the yard\'s stones are one jump up');
  // The centre bell: the haft only — no stone is within a jump of it.
  assert.ok(head(haft) >= bottom(bell('centre')), 'the haft reaches the centre bell');
  for(const s of K.SENTINEL_STONES) assert.ok(Math.abs(s.x - bell('centre').x) - s.w / 2 > reach(0), 'no stone reaches it');
  // The east bell: its shoulders only — the stone under it is not high enough.
  assert.ok(head(stoneTop) < bottom(bell('east')), 'the stone does not reach the east bell');
  assert.ok(head(shoulders) >= bottom(bell('east')), 'its shoulders do');
  assert.ok(shoulders - stoneTop < APEX, 'and its shoulders are one jump from the stone');
  // The west bell: the haft, baited under it.
  assert.ok(head(haft) >= bottom(bell('west')));
  assert.ok(haft < APEX, 'the haft is one jump up');
});

test('THE SENTINEL: every move has a tell and an answer on foot', () => {
  // Hammerfall: it tracks you, then commits — and the rest of the tell is long enough to walk out.
  S.hfTell.forEach((T, ph) => {
    const walk = (1 - S.hfLock) * T * KNIGHT.run;
    assert.ok(walk >= S.hfHalf + 10 + 1, `phase ${ph}: ${walk.toFixed(0)} of walking against a ${S.hfHalf + 10} strike`);
  });
  assert.ok(S.hfTell[2] < S.hfTell[0], 'the tell shortens as the bells ring');
  assert.match(fnFrom(fo, 'updateSentinel'), /if\(e\.t < T \* S\.hfLock\) e\.target =/, 'it tracks you until it commits');
  assert.match(fnFrom(fo, 'updateWaves'), /p\.onGround && p\.y < 8/, 'the shock runs the floor: jump it, or be on the haft');
  // The rush: it charges until something stops it; a stone stops it and stuns it; the stone's top is above it.
  assert.ok(S.rushTell[1] >= 0.7);
  assert.match(fnFrom(fo, 'updateSentinel'), /stun\(A, e, S\.stunStone, stone\.id\)/);
  assert.match(fnFrom(fo, 'updateSentinel'), /p\.y < 60 && !e\.hitThisRush/, 'standing on a stone, you are above the crash');
  assert.ok(K.SENTINEL_STONES.every(s => s.h > 60));
  assert.match(fnFrom(fo, 'stun'), /Pl\(e\.x, 56, 130\)/, 'stunned, its shoulders are a step');
  // The sweep: the floor only — the haft and the stones are above it.
  assert.match(fnFrom(fo, 'sweep'), /p\.y < 40/);
  // It is a pattern, not a hard enemy: a fixed rhythm per phase.
  const A = (rung) => ({ rung }), E = (cycle) => ({ cycle });
  assert.deepEqual([0, 1, 2].map(c => FO.nextMove(A(0), E(c))), ['hammer', 'hammer', 'hammer']);
  assert.deepEqual([0, 1, 2, 3].map(c => FO.nextMove(A(1), E(c))), ['hammer', 'rush', 'hammer', 'rush']);
  assert.deepEqual([0, 1, 2].map(c => FO.nextMove(A(2), E(c))), ['hammer', 'rush', 'hammer']);
  assert.match(fnFrom(fo, 'strike'), /hurtPlayer\(12,/, 'a hit is a measure, never more');
  assert.match(fnFrom(fo, 'updateBells'), /kit\.latch\(ZONE, 'fo-bell-' \+ b\.id\)/, 'a rung bell stays rung through a death');
});

test('the art is registered and draws what the region owns', () => {
  assert.match(art, /ART\.register\(21, /);
  for(const f of ['sentinelFigure', 'drawCell', 'drawBell', 'drawStone', 'drawGate']) assert.ok(art.includes('function ' + f + '('), f);
  assert.match(fnFrom(art, 'sentinelFigure'), /ellipse\(tx/, 'the Hammerfall shows where it will fall');
  assert.doesNotMatch(fo + art, /lepro/i);
});
