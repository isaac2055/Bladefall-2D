// The Fractured Frostfell: Act Three's eighth echo (stage 28). A B-side of Frostfell, warm: the Toll's
// tollmen (counter the thrust; it reels open), the Thaw Streets (thin ice that cracks under you in half a
// second), the frost memory (the double jump, where it was), the thawing Frozen Stair over the void — and
// a C-side: the Rimeguard, a pattern boss whose guard only its own countered thrust opens.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const ff = read('bladefall-fractured-frostfell.js');
const art = read('bladefall-fractured-frostfell-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + ff, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FF = sandbox.window.BladefallFracturedFrostfell;
const K = FF.constants;
const L = ACT.level(28);
// Measured (7.208, scripted input in the browser): a running jump 148 far; a jump and a dash 153 high; a double jump
// alone 147 high, with a dash 191 high and 564 far. The Counter: a 0.22 s window, a 0.7 s cooldown (index.html).
const M = { jumpFar:148, jumpDash:153, dj:147, djDash:191, counterCd:.7 };

test('stage 28 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /28:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(28\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 28);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b28\b[^\]]*\]\)/);
  assert.match(source, /28:Object\.freeze\(\{id:'fractured-frostfell-road',src:'\.\/audio\/music\/fractured-hearthfire-in-the-frost\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-hearthfire-in-the-frost.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-engine-of-the-frozen-garrison.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Frostfell'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fw-ff', 'fractured-warden', 'east', 'walk', 0\.5, 'fractured-frostfell', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(7), 28);
  assert.match(fnFrom(ff, 'seamSpec'), /connector:'fw-ff', zone:ZONE, targetStage:27/);
  assert.match(fnFrom(ff, 'seamSpec'), /A\.rimed \? F\.seamOn\(STAGE, ZONE, 'ff-fs', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-warden.js'), 'arrival'), /plan\.connectorId === 'fw-ff'/);
  assert.match(fnFrom(ff, 'update'), /THE FRACTURED SORCERER/);
});

test('FROSTFELL\'S KIT: the Warden\'s and the Counter; the double jump from the memory, where it was', () => {
  assert.match(fnFrom(ff, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter'\]/);
  assert.match(fnFrom(ff, 'init'), /A\.memory \? ids\.concat\('double-jump'\) : ids/);
  assert.match(fnFrom(ff, 'interact'), /F\.grant\('double-jump'\)/);
  assert.equal(L.objects.find(o => o.actId === 'memory').actVerb, 'REMEMBER');
  assert.ok(K.MEMORY.x > K.STREET_ICE[K.STREET_ICE.length - 1] && K.MEMORY.x < K.STAIR[0][0], 'past the streets, before the stair');
});

test('THE TOLL: the tollman\'s back is to the bars; only a countered thrust opens it', () => {
  for(const t of K.TOLL){
    const bars = L.objects.find(o => o.actBars === t.id); assert.ok(bars && !bars.gone);
    const stone = L.objects.find(o => o.type === 'wall' && o.x === t.bars && !o.actBars);
    assert.ok(stone.noCling && stone.y >= 1600 && stone.y - stone.h === bars.y, 'stone above the bars, to the top');
  }
  const g = fnFrom(ff, 'updateGuard');
  assert.match(g, /e\.frontShield = !open && e\.st !== 'down'; e\.portalGate = open \? 'melee' : 'rime-never'/, 'shut but for the blade in the reel');
  assert.match(fnFrom(ff, 'thrust'), /tryPlayerCounter\('melee', dir, e\)/);
  assert.match(fnFrom(ff, 'thrust'), /e\.counterStunT = 0/, 'the guard, not the engine, decides what a counter does');
  assert.match(g, /r === 'countered' && last\)\{ e\.st = 'reel'/);
  assert.match(fnFrom(ff, 'tolls'), /kit\.latch\(ZONE, 'ff-' \+ t\.id\); setBars\(t\.id, true\)/);
});

test('THE THAW STREETS: thin ice over meltwater; a running jump between plates, the dash onto and off them', () => {
  assert.ok(K.GROUND[0][1] < K.STREET_ICE[0] && K.GROUND[1][0] > K.STREET_ICE[K.STREET_ICE.length - 1], 'no floor under the streets');
  const stops = K.STREET_ICE.map(x => [x, 90]).concat(K.STREET_DRY).sort((a, b) => a[0] - b[0]);
  for(let i = 1; i < stops.length; i++){
    const gap = (stops[i][0] - stops[i][1] / 2) - (stops[i - 1][0] + stops[i - 1][1] / 2);
    assert.ok(gap <= 110 && gap < M.jumpFar - 35, `the gap before ${stops[i][0]} (${gap}) is a running jump with room`);
  }
  const first = K.STREET_ICE[0] - 45 - K.GROUND[0][1], last = K.GROUND[1][0] - (K.STREET_ICE[K.STREET_ICE.length - 1] + 45);
  assert.ok(first > M.jumpFar && last > M.jumpFar, 'onto and off the ice: the dash');
  assert.ok(L.objects.filter(o => o.ffThin === K.THIN.crack && o.ice).length === K.STREET_ICE.length);
  assert.match(fnFrom(ff, 'thaw'), /o\.crackT >= o\.ffThin\)\{ o\.gone = true/);
});

test('THE FROZEN STAIR: over the void; rises only the double jump and a dash make; thawing ice; spikes on a beat', () => {
  let prevY = 0, prevEdge = K.GROUND[1][1];
  const rises = [];
  for(const s of K.STAIR){
    const rise = s[2] - prevY, gap = s[0] - s[1] / 2 - prevEdge;
    if(rise > 0) rises.push(rise);
    assert.ok(rise <= M.djDash - 15, `the landing at ${s[0]} is within a double jump and a dash (${rise})`);
    prevY = s[2]; prevEdge = s[0] + s[1] / 2;
    assert.ok(gap > 0 && gap < 260, `a gap before ${s[0]}`);
  }
  assert.ok(rises.filter(r => r > M.jumpDash).length >= 3, 'three rises nothing before the memory makes');
  for(const s of K.STAIR.filter(s => s[3] === 'ice')) assert.equal(L.objects.find(o => o.type === 'plat' && o.x === s[0] && o.y === s[2]).ffThin, K.STAIR_THAW);
  for(const s of K.STAIR_SPIKES) assert.ok(K.STAIR.some(l => l[0] === s[0] && l[2] === s[1]), 'the spikes stand on a landing');
  for(const s of K.STAIR_SPIKES){ const i = K.STAIR.findIndex(l => l[0] === s[0]); assert.ok(K.STAIR[i - 2] && K.STAIR[i - 2][3] === 'dry', 'a dry landing two back to time them from'); }
  assert.ok(CROWN_ok(), 'the crown is the stair\'s end');
  function CROWN_ok(){ const last = K.STAIR[K.STAIR.length - 1]; return K.CROWN.x0 - (last[0] + last[1] / 2) < 200 && K.CROWN.y - last[2] < M.dj; }
});

test('THE RIMEGUARD: the drill, the feint, the thaw; no two thrusts closer than the Counter\'s cooldown', () => {
  const P = K.R.phases;
  assert.equal(P.length, 3); assert.ok(P.every(ph => ph.opens === 2));
  for(const ph of P) for(let i = 1; i < ph.combo.length; i++) assert.ok(.18 + ph.combo[i] >= M.counterCd + .08, 'a thrust never comes inside the Counter\'s cooldown');
  assert.ok(P[1].combo[1] > P[1].combo[0] + .4, 'the feint: the second thrust held');
  assert.ok(P[2].thaw && P[2].combo[2] > P[2].combo[1] + .3, 'the thaw: the third thrust held');
  assert.doesNotMatch(fnFrom(ff, 'harm'), /tryPlayerCounter/, 'the sweep and the shards are not answered by the Counter');
  assert.match(fnFrom(ff, 'onWound'), /kit\.latch\(ZONE, 'ff-rime-' \+ \(A\.phase \+ 1\)\)/, 'a finished phase is kept');
  assert.match(fnFrom(ff, 'onWound'), /kit\.latch\(ZONE, 'ff-rime'\); F\.clear\(STAGE\)/);
  assert.ok(K.ARENA.x2 - K.ARENA.x1 <= 1000, 'the arena fits the screen');
  assert.ok(K.CHECKPOINTS.find(c => c.id === 'crown').x < K.ARENA.x1, 'a retry walks in');
});

test('the art is registered: thin ice that cracks, meltwater, the spears, the shards, the memory', () => {
  assert.match(art, /ART\.register\(28, /);
  assert.match(fnFrom(art, 'plat'), /case 'thin':/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'tollman' && e\.actFoe !== 'rimeguard'/);
  assert.match(fnFrom(art, 'object'), /case 'actMemory':/);
});

test('dead player cannot advance a guard or claim the memory', () => {
  const e={t:.5,st:'wind'},p={dead:true};
  const c=vm.createContext({e,p,A:{},G:{p,actTwo:{stage:28,memory:false}},STAGE:28});
  vm.runInContext(fnFrom(ff,'updateGuard')+';updateGuard(A,e,p,.1)',c);
  assert.equal(e.t,.5);assert.equal(e.st,'wind');
  vm.runInContext(fnFrom(ff,'interact'),c);
  assert.equal(vm.runInContext("interact({actId:'memory'})",c),false);
});

test('thin ice cracks, sinks, waits for clearance, and refreezes', () => {
  const o={ffThin:.5,x:1980,y:0,w:90},p={x:1980,y:0,onGround:true,floorPlat:null};p.floorPlat=o;
  const c=vm.createContext({G:{obstacles:[o]},p,A:{},THIN:K.THIN,kit:{burst(){}},meta:{soundOn:false},Math});
  vm.runInContext(fnFrom(ff,'thaw')+';thaw(A,p,.49)',c);assert.ok(!o.gone);
  vm.runInContext('thaw(A,p,.02)',c);assert.equal(o.gone,true);
  vm.runInContext('thaw(A,p,3)',c);assert.equal(o.gone,true,'must not materialize inside the player');
  p.x=2400;vm.runInContext('thaw(A,p,.01)',c);assert.equal(o.gone,false);assert.equal(o.crackT,0);
});

test('final opening clears remaining attacks and opens both Crown gates', () => {
  const A={phase:2,opens:1,shards:[{}],aoes:[{}],queue:[],fight:true};
  const e={st:'reel',actFoe:'rimeguard',x:9000,y:620};const bars=[];
  const c=vm.createContext({A,e,p:{},R:K.R,ZONE:'fractured-frostfell',STAGE:28,kit:{burst(){},latch(){}},F:{clear(){}},setBars:(...v)=>bars.push(v),meta:{soundOn:false}});
  vm.runInContext(fnFrom(ff,'onWound')+';onWound(A,e,p)',c);
  assert.equal(A.rimed,true);assert.equal(e.st,'down');assert.equal(A.shards.length,0);assert.equal(A.aoes.length,0);
  assert.deepEqual(bars,[['crown-east',true],['crown-west',true]]);
});

test('completed save restores the kneeling Rimeguard', () => {
  const A={rimed:true,toll:{'toll-1':true,'toll-2':true}};
  const c=vm.createContext({A,F:{muster(){}},TOLL:K.TOLL,CROWN:K.CROWN,spawnGuard:(a,k,x,y,extra)=>extra});
  vm.runInContext(fnFrom(ff,'firstFrame')+';firstFrame(A)',c);
  assert.equal(A.rime.st,'down');assert.equal(A.rime.frontShield,false);
});
