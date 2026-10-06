// The Fractured Causeway: Act Three's fifth echo (stage 25). A B-side of the Broken Causeway with the
// machines running backwards — masses let go on whoever walks under, a yard gate only a mass can press,
// lifts over the void — and a C-side pattern boss: the Iron Echo, armoured, committed to its charge,
// crushed only by what you drop on it.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fc = read('bladefall-fractured-causeway.js');
const art = read('bladefall-fractured-causeway-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Seam', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fc, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FC = sandbox.window.BladefallFracturedCauseway;
const K = FC.constants;
const L = ACT.level(25);
const one = (p) => { const r = L.objects.filter(p); assert.equal(r.length, 1); return r[0]; };
const M = { jumpApex:78, jumpFar:148, bowSpeed:680, g:2600 };   // the Causeway's kit: one jump and the blade (the bow is found)

test('stage 25 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /25:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(25\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 25);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b25\b[^\]]*\]\)/);
  assert.match(source, /25:Object\.freeze\(\{id:'fractured-causeway-road',src:'\.\/audio\/music\/fractured-the-iron-causeway\.mp3'/);
  for(const f of ['fractured-the-iron-causeway', 'fractured-iron-juggernaut']){
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
    assert.match(read('sw.js'), new RegExp('audio/music/' + f + '\\.mp3'));
  }
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Causeway'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fw-fc', 'fractured-woods', 'east', 'walk', 0\.5, 'fractured-causeway', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(2), 25);
  assert.match(fnFrom(fc, 'seamSpec'), /connector:'fw-fc', zone:ZONE, targetStage:22/);
  assert.match(fnFrom(fc, 'seamSpec'), /A\.buried \? F\.seamOn\(STAGE, ZONE, 'fc-fu', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-woods.js'), 'arrival'), /plan\.connectorId === 'fw-fc'/);
  assert.match(fnFrom(fc, 'update'), /THE FRACTURED UPDRAFTS/);
});

test('ECHO BODIES are as tough as the original\'s, and no random elite rolls in (spawnEnemy)', () => {
  const spawn = fnFrom(source, 'spawnEnemy');
  assert.match(spawn, /G\.actTwo&&G\.actTwo\.stage===G\.stageIndex&&G\.actTwo\.echoSource!=null\?G\.actTwo\.echoSource:null/);
  assert.match(spawn, /hpScale=G\.ngHp\*\(1\+\(echo!=null\?echo:G\.stageIndex\)\*0\.10\)/);
  assert.match(spawn, /gameChance\('enemy',0\.07\+G\.stageIndex\*0\.004\)&&echo==null\)\{/, 'no elites in an echo');
  for(const f of ['outskirts', 'woods', 'updrafts', 'marksman', 'causeway'])
    assert.match(read('bladefall-fractured-' + f + '.js'), /echoSource:SOURCE/, f + ' declares its source');
});

test('THE CAUSEWAY\'S KIT: one jump and the blade; the Longbow on the Standard', () => {
  assert.match(fnFrom(fc, 'init'), /F\.setKit\(\['jump', 'weapon'\]\)/);
  assert.equal(one(o => o.actId === 'bow').actVerb, 'TAKE THE LONGBOW');
  assert.match(fnFrom(fc, 'takeBow'), /makeWeapon\('bow', 'rare', 'Chainwake Longbow'\)/);
  assert.match(fnFrom(fc, 'takeBow'), /p\.stowedWeapon = /, 'the blade is stowed, not lost');
  assert.match(fnFrom(fc, 'interact'), /kit\.latch\(ZONE, 'fc-bow'\)/);
  // The Rise is a jump at a time with no dash: lifts close enough, their travel within a jump.
  const lifts = K.LEDGES.filter(l => l[3] === 'lift');
  let prevEdge = K.GROUND[0][1];
  for(const l of lifts){ const gap = l[0] - l[1] / 2 - prevEdge; assert.ok(gap <= 80, `a ${gap} gap to the lift at ${l[0]}`); prevEdge = l[0] + l[1] / 2; }
  assert.ok(K.LIFT.dy * 2 <= 2 * M.jumpApex, 'the lifts rise and fall within reach of each other');
});

test('THE MASSES: under one it rattles and falls; a release cut drops it at once; landed it is a block you jump', () => {
  assert.ok(K.MASS.warn >= .3, 'the rattle is long enough to step out');
  assert.ok(K.MASS.h < M.jumpApex - 10, 'a landed mass is one jump');
  assert.match(fnFrom(fc, 'drop'), /if\(cut\)\{ s\.st = 'fall'; s\.vy = 0; \} else s\.st = 'warn';/);
  assert.match(fnFrom(fc, 'releases'), /pr\.owner !== 'player'/, 'only your arrows cut a release');
  assert.match(fnFrom(fc, 'updateMasses'), /hurtPlayer\(MASS\.hitDmg/, 'it crushes the knight under it');
  // The yard: its hoist lets go only over the plate, and the plate opens the gate.
  const yard = K.MASSES.find(m => m.id === 'yard');
  assert.equal(yard.trigger, 'plate'); assert.equal(yard.x, K.PLATE.x);
  assert.match(fnFrom(fc, 'updateMasses'), /Math\.abs\(s\.x - PLATE\.x\) < 24/);
  assert.match(fnFrom(fc, 'updateMasses'), /kit\.latch\(ZONE, 'fc-yard'\); setBars\(PLATE\.bars, true\)/);
  // The Chainwalk's beds are walked in their down time.
  for(const t of K.THORNS) assert.ok((t[1] + 26) / 199 + .25 <= t[2] - t[3], `the bed at ${t[0]}`);
});

test('THE IRON ECHO: bait the committed charge, drop a mass on it — three masses, three crushes', () => {
  const I = K.IRON, C = K.COURT;
  // Armoured: nothing the knight carries lands.
  assert.match(fnFrom(fc, 'spawnIron'), /portalGate:'iron-never'/);
  // The charge is head-down: a jump carries you over it; walking into it does not.
  assert.ok(I.chargeReach < M.jumpApex - 10 && I.huntReach > M.jumpApex - 20);
  // What stops a charge: the buffer stops' faces, and the wreckage.
  assert.match(fnFrom(fc, 'stops'), /\[COURT\.faceW, COURT\.faceE\]/);
  assert.match(fnFrom(fc, 'stops'), /m\.x - MASS\.w \/ 2, m\.x \+ MASS\.w \/ 2/);
  for(const b of K.BULKHEADS) assert.ok(b.h < M.jumpApex - 10, 'a buffer stop is one jump — you walk into the court');
  // Each bulkhead's mass hangs over where a charge stops against it.
  const stopW = C.faceW + I.w / 2, stopE = C.faceE - I.w / 2;
  const A = K.MASSES.find(m => m.id === 'A'), B = K.MASSES.find(m => m.id === 'B'), Cm = K.MASSES.find(m => m.id === 'C');
  const reach = K.MASS.w / 2 + I.w / 2 - 6;
  assert.ok(Math.abs(A.x - stopW) < reach && Math.abs(Cm.x - stopE) < reach, 'the masses are over the stops');
  // The releases, along the floor: the first one in your line is the mass over the dazed Echo.
  const rel = (id) => K.RELEASES.find(r => r.id === id);
  assert.ok(rel('rA').x > A.x && rel('rA').x < rel('rB-w').x && rel('rB-w').x < B.x && B.x < rel('rB-e').x && rel('rB-e').x < rel('rC').x && rel('rC').x < Cm.x);
  // Timing: an arrow from beside the dazed Echo reaches its release and the mass falls inside the daze.
  const fall = (m) => Math.sqrt(2 * (m.y - K.MASS.h - I.h) / M.g);
  for(const [m, r] of [[A, rel('rA')], [Cm, rel('rC')]]){
    const flight = (Math.abs(r.x - m.x) - I.w / 2 - 40) / M.bowSpeed;
    assert.ok(0.45 + flight + fall(m) < I.daze, `${m.id}: ${(0.45 + flight + fall(m)).toFixed(2)} s against a ${I.daze} s daze`);
  }
  // The last count: it charges to where you stood and digs in long enough to be dropped on.
  assert.match(fnFrom(fc, 'updateIron'), /e\.target = ph >= 2 \? p\.x : null/);
  assert.ok(I.recover[2] > fall(B) + 0.6, 'dug in long enough to escape, turn and shoot');
  assert.match(fnFrom(fc, 'crush'), /kit\.latch\(ZONE, 'fc-crush-' \+ m\.id\)/, 'a crush stays through a death');
  assert.match(fnFrom(fc, 'crush'), /setBars\('court-east', true\)/);
  // It cannot be dodged forever: in its reach too long, it shoves you out — and then it can charge.
  assert.match(fnFrom(fc, 'updateIron'), /e\.close >= IRON\.shove\.after/);
  // The court fits: a charge crosses it in under two seconds.
  assert.ok((C.faceE - C.faceW) / I.charge[0] < 2);
});

test('the art is registered: masses on their chains, the release chains, the stamp, the edge tell', () => {
  assert.match(art, /ART\.register\(25, /);
  assert.match(fnFrom(art, 'world'), /s\.st === 'warn' \? Math\.round\(Math\.sin\(t \* 60\) \* 2\) : 0/, 'the chain rattles');
  assert.match(fnFrom(art, 'enemy'), /e\.st === 'windup' && Math\.floor\(e\.t \* 6\) % 2 === 0/, 'the stamp');
  assert.match(fnFrom(art, 'edgeTell'), /\['windup', 'charge'\]\.includes\(e\.st\)/, 'off the screen, the edge tells you');
});

test('the bow lesson weighs a real gate and survives reconstruction with grounded wreckage', () => {
  const circuits = new Set(['fc-lesson','fc-yard','fc-crush-A']);
  const obstacles = L.objects.map(o=>({...o}));
  const ctx = vm.createContext({ Math, MASSES:K.MASSES, MASS:K.MASS, ZONE:'fractured-causeway', STAGE:25, SOURCE:2,
    G:{obstacles}, F:{setKit(){}}, kit:{zoneCircuits:()=>circuits,circuitSet:(c,id)=>c.has(id)}, takeBow(){} });
  vm.runInContext(['done','setBars','syncMass','init'].map(n=>fnFrom(fc,n)).join('\n'),ctx);
  ctx.init();
  for(const id of ['yard','lesson','A']){
    assert.equal(ctx.G.actTwo.masses[id].y,K.MASS.h);
    assert.equal(obstacles.find(o=>o.fcMass===id).gone,false);
  }
  assert.equal(obstacles.find(o=>o.actBars==='lesson-gate').gone,true);
  assert.equal(ctx.G.actTwo.masses.B.st,'hang');
  assert.ok(K.RELEASES.find(r=>r.mass==='lesson').x>K.BOW.x);
  assert.ok(K.LESSON.gateX<K.COURT.x1);
});

test('shooting the lesson release drops its weight and persistently opens the practice gate', () => {
  const latches=[], obstacles=L.objects.map(o=>({...o}));
  const ctx=vm.createContext({Math,MASSES:K.MASSES,MASS:K.MASS,PLATE:K.PLATE,RELEASES:K.RELEASES,ZONE:'fractured-causeway',
    G:{time:0,obstacles,projectiles:[{owner:'player',life:1,x:8010,y:30}]},
    kit:{latch:(z,id)=>latches.push(id),burst(){}},meta:{soundOn:false}});
  vm.runInContext(['massX','syncMass','under','drop','updateMasses','setBars','releases'].map(n=>fnFrom(fc,n)).join('\n'),ctx);
  const A={masses:Object.fromEntries(K.MASSES.map(m=>[m.id,{id:m.id,st:'hang',x:m.x,y:m.y,t:0,vy:0}]))};
  ctx.releases(A);assert.equal(A.masses.lesson.st,'fall');assert.equal(ctx.G.projectiles[0].life,0);
  for(let i=0;i<90;i++)ctx.updateMasses(A,{x:7950,y:0},1/60);
  assert.equal(A.lesson,true);assert.deepEqual(latches,['fc-lesson']);
  assert.equal(obstacles.find(o=>o.actBars==='lesson-gate').gone,true);
  obstacles.find(o=>o.fcMass==='lesson').gone=true;
  for(let i=0;i<180;i++)ctx.updateMasses(A,{x:7950,y:0},1/60);
  assert.equal(A.masses.lesson.st,'landed');assert.equal(obstacles.find(o=>o.fcMass==='lesson').gone,false);
});

test('a dead player cannot advance the Iron Echo attack', () => {
  const ctx=vm.createContext({});vm.runInContext(fnFrom(fc,'updateIron'),ctx);
  const e={st:'windup',t:.3};ctx.updateIron({},e,{dead:true},1);
  assert.equal(e.st,'windup');assert.equal(e.t,.3);
});
