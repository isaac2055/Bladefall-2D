// Battle 42 · the Cloaked Man (stage 43): the last fight, a four-phase boss designed by the owner's little brother.
// Registration and Level Select numbering, the road in, and the fight itself run against stub engine hooks: his three
// Phase I attacks as written (the dash-slash, the slash from far that comes out behind you, the bat that carries you
// to him for three cuts), escaping the bat, each phase handing to the next, and Phase IV's eyes/hands struck only
// while they are open.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const cm = read('bladefall-cloaked-man.js');
const art = read('bladefall-cloaked-man-art.js');

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

/* The module against stubs: the Act Two registry and the Fractured core replaced by recorders, the page's globals by
   the few the fight calls. */
function load(opts){
  opts = opts || {};
  const circuits = Object.assign({}, opts.circuits || {}), impls = {}, hurts = [];
  const G = { stageIndex:43, obstacles:[], enemies:[], particles:[], shake:0, boss:null, _enemySeq:0 };
  const window = {
    BladefallActTwo:{ register(i, impl){ impls[i] = impl; },
      kit:{ zoneCircuits:() => circuits, circuitSet:(c, id) => !!c[id], latch:(z, id) => { circuits[id] = true; }, burst(){}, say(){} } },
    BladefallFractured:{ setKit(){}, checkpoints(){} },
    BladefallExploreFinale:{choice:()=> 'merge',ending(){ctx.__card=true;}},
  };
  const keys = { pressed:false };
  const ctx = vm.createContext({ Math, Object, JSON, Array, window, G, meta:{ soundOn:false }, SFX:{}, mode:'play',
    spawnEnemy(type, x){ const e = { type, x, y:0, w:30, h:40, hp:100, maxHp:100, vx:0, vy:0, dead:false }; G.enemies.push(e); return e; },
    hurtPlayer(dmg, dir, real, measures){ const p = G.p; p.blood -= measures || 1; p.invuln = .5; hurts.push({ t:ctx.__t, measures:measures || 1 }); },
    tryPlayerCounter(){ return false; }, restoreBlood(p, n){ p.blood = n === Infinity ? 10 : Math.min(10, p.blood + n); },
    keyPressedFor(){ return keys.pressed; }, showOvHTML(){ ctx.__card = true; }, showGameUI(){}, titleScreen(){}, persist(){},
    document:{ getElementById(){ return { classList:{ remove(){} }, onclick:null }; } }, __t:0 });
  vm.runInContext(['Pl', 'Wl', 'GrAt'].map(n => fnFrom(source, n)).join('\n') + '\n' + cm, ctx);
  const impl = impls[43], L = impl.level();
  G.obstacles = L.objects.map(o => Object.assign({}, o));
  G.p = { x:150, y:0, w:26, h:44, face:1, blood:10, invuln:0, dodgeTimer:0, dead:false, onGround:true, vx:0, vy:0 };
  L.build();
  const A = () => G.actTwo, p = G.p;
  function step(n, each){
    for(let i = 0; i < n; i++){
      ctx.__t += 1 / 60;
      impl.update(1 / 60, p);
      for(const e of G.enemies.slice()) impl.updateFoe(e, p, 1 / 60);
      impl.lateUpdate(1 / 60, p);
      p.invuln = Math.max(0, p.invuln - 1 / 60);
      if(each) each(i);
    }
  }
  return { ctx, impl, L, G, A, p, step, hurts, circuits, keys, K:window.BladefallCloakedMan.constants, CM:window.BladefallCloakedMan };
}

test('stage 43 is registered everywhere a stage must be, and Level Select shows it as 42', () => {
  assert.match(source, /43:BladefallActTwo\.level\(43\)/);
  assert.match(source, /<script src="bladefall-cloaked-man\.js\?v=[^"]+"><\/script>\n<script src="bladefall-cloaked-man-art\.js\?v=[^"]+"><\/script>/);
  assert.match(read('bladefall-respec-renderer.js'), /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b43\b[^\]]*\]\)/);
  assert.match(read('sw.js'), /'\.\/bladefall-cloaked-man\.js\?v=[^']+',\n  '\.\/bladefall-cloaked-man-art\.js\?v=[^']+',/);
  assert.match(read('bladefall-campaign.js'), /name: 'Vesper'[^}]*finalBattle: true, selectTag: '42'/);
  assert.match(read('bladefall-progression.js'), /\['cloaked-man', 43, 'Vesper'/);
  assert.match(read('bladefall-world.js'), /\['cloaked-man', 43, 'Vesper'/);
  for(const f of ['iron-oath-of-the-night-attack.mp3', 'through-the-void-breach.mp3', 'fractured-the-black-procession.mp3', 'the-breaking-of-the-keeps.mp3', 'fractured-the-last-spark-of-darrow.mp3'])
    assert.ok(existsSync(pub('audio/music/' + f)), f);
  const L = fnFrom(source, 'openLevelSelect');
  assert.match(L, /if\(st\.precisionCourse\)return '';/, 'Celeste Standard is on the title screen, not in Base');
  assert.match(L, /const tag=st\.selectTag\|\|String\(i<BONUS_STAGE\?i\+1:i\)\.padStart\(2,'0'\);/, 'the Deep Line is 15, the Sunspire 20');
  assert.match(L, /!st\.finalBattle&&!dev/, 'the last fight is open to Level Select');
});

test('Level Select numbering: Base 01–14 then 15–20 from the Deep Line; the fight is 42', () => {
  const tag = (i, st) => st.selectTag || String(i < 14 ? i + 1 : i).padStart(2, '0');
  assert.equal(tag(0, {}), '01'); assert.equal(tag(13, {}), '14');
  assert.equal(tag(15, {}), '15'); assert.equal(tag(16, {}), '16'); assert.equal(tag(20, {}), '20');
  assert.equal(tag(43, { selectTag:'42' }), '42');
});

test('THE ROAD IN is basic: a 130 pit, single-jump steps (60, 130, the wall at 200), a vestibule checkpoint', () => {
  const { L, K } = load();
  const floors = L.objects.filter(o => o.type === 'plat' && o.deep).map(o => [o.x - o.w / 2, o.x + o.w / 2]).sort((a, b) => a[0] - b[0]);
  assert.equal(floors[1][0] - floors[0][1], 130);
  const ledges = L.objects.filter(o => o.actArt === 'cmLedge').map(o => o.y);
  assert.deepEqual(Array.from(ledges), [60, 130]);
  const wall = L.objects.find(o => o.actArt === 'cmWall');
  assert.equal(wall.y, 200);
  assert.ok(wall.y - 130 <= 78 && 60 <= 78, 'every step within a single jump');
  assert.deepEqual(Array.from(K.CHECKPOINTS, c => c.id), ['approach', 'vestibule']);
  assert.ok(K.CHECKPOINTS[1].x < K.ARENA.x1);
});

test('the fight begins on entering the arena: the bars shut, the bar reads THE CLOAKED MAN, Blood full', () => {
  const T = load(); const { G, A, p, step, K } = T;
  step(2); p.blood = 4;
  p.x = K.ARENA.x1 + 120; step(1);
  assert.equal(A().fight, true);
  assert.equal(G.boss, A().bar);
  assert.equal(G.boss.label, 'VESPER');
  assert.equal(G.boss.maxHp, K.POOLS.reduce((a, b) => a + b, 0));
  assert.equal(p.blood, 10);
  assert.equal(G.obstacles.find(o => o.actBars === 'west').gone, false);
});

test('I · his three attacks as written: the dash-slash, the far slash that comes out behind you, the bat and its three cuts', () => {
  const T = load(); const { A, p, step, hurts, K } = T;
  step(2); p.x = K.ARENA.x1 + 150; p.face = 1; step(1);
  const seen = new Set(); let behind = null, cuts = 0, carried = false;
  step(60 * 30, () => {
    const m = A().man; if(!m) return;
    seen.add(m.st);
    if(m.st === 'appear' && behind == null) behind = Math.sign(m.x - p.x) === -(p.face || 1);
    if(A().grab && A().grab.st === 'hover') carried = true;
    if(m.st === 'upslash' || m.cuts) cuts = Math.max(cuts, m.cuts || 0);
    if(p.blood < 3) p.blood = 10;
  });
  for(const s of ['dash-tell', 'dash', 'slash', 'phantom-tell', 'vanish', 'appear', 'slash2', 'cast', 'upslash']) assert.ok(seen.has(s), s);
  assert.equal(behind, true, 'the far slash finishes from behind the knight');
  assert.ok(carried, 'the bat carried the knight over him');
  assert.equal(cuts, 3, 'three cuts while it holds you');
  assert.ok(hurts.length >= 4);
  assert.equal(K.MAN.bat.life, 5, 'the bat flies for up to five seconds');
});

test('I · the bat: one blow ends it; pressing Jump / Attack while it holds you breaks free before the cuts', () => {
  const T = load(); const { A, p, step, K, keys } = T;
  step(2); p.x = K.ARENA.x1 + 150; step(1);
  const m = A().man; m.x = p.x + 400; m.st = 'cast'; m.t = 0; A().batCd = 0; A().cool = 99;   // within the bat's five seconds
  step(50);
  const bat = A().bat; assert.ok(bat && bat.st === 'hunt');
  bat.hp = bat.hpWas - 10; step(2);
  assert.equal(A().bat, null, 'struck, it is gone');
  m.st = 'cast'; m.t = 0; A().batCd = 0; step(50);
  let grabbed = false; step(60 * 6, () => { if(A().grab && !grabbed){ grabbed = true; } });
  assert.ok(grabbed, 'it reached the idle knight');
  // Again, and struggle this time.
  m.st = 'cast'; m.t = 0; A().batCd = 0; A().grab = null; step(50);
  let released = false, i = 0, blood0 = p.blood;
  step(60 * 6, () => { if(A().grab){ keys.pressed = (i++ % 2) === 0; } else if(i > 0 && !released){ released = true; keys.pressed = false; } });
  assert.ok(released, 'broke free');
  assert.ok(blood0 - p.blood < 3, 'before all three cuts');
});

test('each phase hands to the next, keeps what was won through a retry, and gives one measure back', () => {
  const T = load(); const { A, p, step, K, circuits } = T;
  step(2); p.x = K.ARENA.x1 + 150; step(1);
  const push = (phase) => { const a = A(); a.hp = K.POOLS.slice(phase + 1).reduce((s, v) => s + v, 0) + 1;
    const e = phase <= 1 ? a.man : phase === 2 ? a.spider.head : a.eyes[0]; e.hp = e.hpWas - 5; };
  p.blood = 5; push(0); step(1);
  assert.ok(A().trans && A().trans.from === 0); assert.equal(p.blood, 6, 'one measure back'); assert.equal(circuits['cm-p1'], true);
  step(60 * 3); assert.equal(A().phase, 1); assert.equal(T.G.boss.label, 'VESPER · UNBOUND');
  push(1); step(60 * 4); assert.equal(A().phase, 2); assert.ok(A().spider); assert.equal(A().man, null, 'the cloak is empty');
  push(2); step(60 * 5); assert.equal(A().phase, 3); assert.ok(A().giant); assert.equal(A().eyes.length, 2);
  // A retry comes back into IV.
  const R = load({ circuits:{ 'cm-p1':true, 'cm-p2':true, 'cm-p3':true } });
  R.step(2); assert.equal(R.A().phase, 3); assert.equal(R.A().hp, R.K.POOLS[3]);
  // And IV to the end.
  push(3); step(60 * 9);
  assert.equal(A().won, true); assert.equal(T.ctx.__card, true, 'the closing card');
});

test('II · the swarm leaves one gap per curtain, and each gap is within a run of the last', () => {
  const T = load(); const { A, p, step, K } = T;
  step(2); p.x = K.ARENA.x1 + 150; step(1);
  const a = A(); a.hp = K.POOLS.slice(1).reduce((s, v) => s + v, 0) + 1; a.man.hp = a.man.hpWas - 5; step(60 * 3);
  const m = a.man; m.st = 'swarm-rise'; m.t = 0; step(80);
  const gaps = a.waves.map(w => w.gap).concat();
  assert.ok(gaps.length >= 2);
  for(let i = 1; i < gaps.length; i++) assert.ok(Math.abs(gaps[i] - gaps[i - 1]) <= 340, 'reachable');
  step(30);
  const xs = a.swarm.map(b => b.x).sort((x, y) => x - y);
  let widest = 0; for(let i = 1; i < xs.length; i++) widest = Math.max(widest, xs[i] - xs[i - 1]);
  assert.ok(widest >= 2 * K.AIR.swarm.gap - 20, 'a gap a knight fits through');
});

test('III · the jaw opens all the way to the floor, and the snap costs two measures in the mouth', () => {
  const T = load({ circuits:{ 'cm-p1':true, 'cm-p2':true } }); const { A, p, step, K, CM, hurts } = T;
  step(2); p.x = K.ARENA.x1 + 150; step(1);
  const S = A().spider; S.x = p.x + 300; S.face = -1; S.st = 'rear'; S.t = 0; A().cool = 99;
  step(Math.round((K.BONES.jaw.rear + K.BONES.jaw.drop) * 60) + 4);
  assert.ok(CM.jawChin(S) <= 6, 'the chin at the floor');
  p.x = CM.skullAt(S).x; p.invuln = 0; hurts.length = 0;
  step(Math.round((K.BONES.jaw.inhale + K.BONES.jaw.snap) * 60) + 2);
  assert.ok(hurts.some(h => h.measures === 2));
});

test('IV · the eyes are struck only while open; a hand only while it rests', () => {
  const T = load({ circuits:{ 'cm-p1':true, 'cm-p2':true, 'cm-p3':true } }); const { A, p, step, K } = T;
  step(2); p.x = K.ARENA.x1 + 150; step(1);
  const Gi = A().giant;
  step(10); assert.ok(A().eyes.every(e => e.portalGate === 'cm-closed'));
  Gi.st = 'gaze'; Gi.sub = 'tell'; Gi.t = 0; A().cool = 99;
  step(Math.round((K.GIANT.gaze.tell + K.GIANT.gaze.beam) * 60) + 4);
  assert.ok(Gi.exposed > 0); assert.ok(A().eyes.every(e => e.portalGate === null));
  const x0 = A().eyes[0].x; A().eyes[0].x += 40; step(1); assert.equal(A().eyes[0].x, x0, 'a blow cannot walk an eye off the skull');
  step(Math.round(K.GIANT.gaze.exposed * 60) + 4); assert.ok(A().eyes.every(e => e.portalGate === 'cm-closed'));
  assert.equal(A().hand.portalGate, 'cm-closed');
  Gi.st = 'idle'; A().cool = 0; A().order = 1; p.invuln = 99;
  let rested = false; step(60 * 5, () => { if(Gi.hands.some(h => h.st === 'rest') && A().hand.portalGate === null && A().hand.y === 0) rested = true; });
  assert.ok(rested);
});

test('the fight keeps no closures in its state (TAS snapshots and checkpoint flags serialise it)', () => {
  const T = load(); const { A, p, step, K } = T;
  step(2); p.x = K.ARENA.x1 + 150; step(1); step(60 * 8);
  const walk = (v, seen = new Set()) => { if(v && typeof v === 'object'){ if(seen.has(v)) return; seen.add(v); for(const k of Object.keys(v)) walk(v[k], seen); } else assert.notEqual(typeof v, 'function'); };
  walk(A());
  assert.doesNotMatch(cm, /pending\.push\(\(\)/);
});

test('the art registers for stage 43 and draws every tell the fight uses', () => {
  assert.match(art, /ART\.register\(STAGE, Object\.freeze\(\{ draw \}\)\);/);
  for(const cue of ["m.st === 'dash-tell'", "m.st === 'vanish'", "m.st === 'dive-tell'", 'A.stabs', 'A.beams', "Gi.st === 'maw'", 'A.waves', 'BREAK FREE'])
    assert.ok(art.includes(cue), cue);
});
