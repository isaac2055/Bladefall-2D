// The Fractured Updrafts: Act Three's third echo (stage 23). A B-side of Updraft Canyons in a storm
// — the thermals BREATHE: they lift on the inhale and throw you down on the exhale; the Pack is gone —
// and a C-side, the Lung: four columns over the void, each left for the next on the breath.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fu = read('bladefall-fractured-updrafts.js');
const art = read('bladefall-fractured-updrafts-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Seam', 'Slate', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fu, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FU = sandbox.window.BladefallFracturedUpdrafts;
const K = FU.constants;
const L = ACT.level(23);
const one = (p) => { const r = L.objects.filter(p); assert.equal(r.length, 1); return r[0]; };
const col = (id) => K.COLUMNS.find(c => c.id === id);
// The canyons' kit, measured in the browser (jump + Oathblade + dash, 7.203):
const M = {
  jumpFar:148, jumpApex:78,              // a running jump
  apexDashFar:373, apexDashTop:81,       // dash at the top of the jump (0.3 s)
  earlyDashFar:504, earlyDashTop:153,    // dash straight off the ground (0.02 s)
  head:44,                               // the knight's height
  lift:330, overshoot:40,                // a column lifts at 330/s and throws you ~40 past its top
  kiteDoubleDash:6354,                   // jump + two dashes from the last terrace (no crystal) lands here
  kiteCrystal:6492,                      // jump + dash, the crystal, jump + dash: lands here
};

test('stage 23 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /23:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(23\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 23);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b23\b[^\]]*\]\)/);
  assert.match(source, /23:Object\.freeze\(\{id:'fractured-updrafts-road',src:'\.\/audio\/music\/fractured-canyon-updrafts\.mp3'/);
  for(const f of ['fractured-canyon-updrafts', 'archives-of-the-archmage']){
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
    assert.match(read('sw.js'), new RegExp('audio/music/' + f + '\\.mp3'));
  }
  for(const f of ['bladefall-fractured-updrafts.js', 'bladefall-fractured-updrafts-art.js']){
    assert.match(source, new RegExp('<script src="' + f.replace(/\./g, '\\.') + '\\?v='));
    assert.match(read('sw.js'), new RegExp(f.replace(/\./g, '\\.') + '\\?v='));
  }
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Updrafts'[^}]*act: 3/);
  assert.match(read('bladefall-progression.js'), /connector\('fc-fu', 'fractured-causeway', 'fractured-updrafts'/);
  assert.match(read('bladefall-zones.js'), /\['fc-fu', 'fractured-causeway', 'east', 'walk', 0\.5, 'fractured-updrafts', 'west', 'walk', 0\.5\]/);
  assert.match(read('bladefall-recovery.js'), /\['aerie-cinders', 'fractured-updrafts',/);
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'aerie-cinders');
  assert.equal(F.echoFor(3), 23);
  assert.match(fnFrom(fu, 'seamSpec'), /connector:'fc-fu', zone:ZONE, targetStage:25/);
  assert.match(fnFrom(fu, 'seamSpec'), /F\.seamOn\(STAGE, ZONE, 'fu-fm', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-causeway.js'), 'arrival'), /plan\.connectorId === 'fc-fu' \? \{ x:LEN - 160/, 'back into the woods at its east end');
  assert.match(fnFrom(fu, 'update'), /THE FRACTURED MARKSMAN/);
});

test('THE CANYONS\' KIT: jump, blade, dash — and no Pack', () => {
  assert.match(fnFrom(fu, 'init'), /F\.setKit\(\['jump', 'weapon', 'dash'\]\)/);
  assert.doesNotMatch(fu, /hasJetpack|aeriePack|acquireAerieHarness/, 'the Pack is gone');
  assert.match(fnFrom(fu, 'firstFrame'), /F\.muster\(\)/);
  assert.ok(L.enemies.every(e => e.noDrop));
});

test('THE ROOTBREACH: three dash gaps, each asking for a different dash', () => {
  const g = K.GROUND;
  const gapA = g[1][0] - g[0][1], gapB = g[2][0] - g[1][1], gapC = g[3][0] - g[2][1];
  assert.ok(gapA > M.jumpFar + 40 && gapA < M.apexDashFar - 40, `A: ${gapA} needs a dash`);
  const t = K.TEETH[0];
  assert.ok(t.x1 > g[1][1] && t.x2 < g[2][0], 'the teeth hang over the second gap');
  assert.ok(M.earlyDashTop + M.head > t.y, 'the early dash\'s arc meets them');
  assert.ok(M.apexDashTop + M.head < t.y && M.jumpApex + M.head < t.y, 'the jump and the late dash pass under');
  assert.ok(gapB > M.jumpFar + 40 && gapB < M.apexDashFar - 40, `B: ${gapB} — the late dash clears it`);
  assert.ok(gapC > M.apexDashFar + 30 && gapC < M.earlyDashFar - 40, `C: ${gapC} — only the early dash`);
  assert.match(fnFrom(fu, 'teeth'), /hurtPlayer\(12,/);
  assert.match(fnFrom(fu, 'teeth'), /p\.vy = Math\.max\(p\.vy, 240\)/, 'bitten, you are knocked down into the gap');
});

test('THE BREATH: an inhale is the engine\'s updraft; an exhale throws you down; a dash rides through it', () => {
  const B = K.BREATH;
  for(const c of K.COLUMNS){
    const u = L.objects.find(o => o.fuColumn === c.id);
    assert.equal(u.type, 'updraft'); assert.equal(u.pulsePeriod, B.period); assert.equal(u.pulsePhase, c.phase); assert.equal(u.pulseDuty, B.duty);
  }
  // breath() and the engine's own pulse test agree on every frame of a beat.
  const engineLive = (o, t) => ((t + (o.pulsePhase || 0)) % o.pulsePeriod) < o.pulsePeriod * (o.pulseDuty || .62);
  for(const c of K.COLUMNS){ const u = L.objects.find(o => o.fuColumn === c.id); for(let t = 0.01; t < 6; t += 0.07) assert.equal(FU.breath(c, t).inhale, engineLive(u, t)); }
  const ex = fnFrom(fu, 'exhale');
  assert.match(ex, /if\(p\.dodgeTimer > 0 \|\| p\.dead\) return;/, 'a dash cuts through an exhale');
  assert.match(ex, /p\.vy = Math\.min\(p\.vy \+ BREATH\.exhale \* dt, BREATH\.exhaleCap\)/);
  assert.ok(B.tell >= 0.4 && B.tell < B.period * B.duty / 2, 'the column warns before it turns');
  // Every ride fits its inhale with a window to spare: rise the column, at 330/s.
  const inhale = B.period * B.duty;
  assert.ok(col('first').h / M.lift < inhale - 0.45, 'the First Breath is a lesson: half a second to enter');
  for(const id of ['b1', 'b2', 'l2', 'l3', 'l4']) assert.ok(col(id).h / M.lift < inhale, `${id} can be ridden in one inhale`);
  assert.equal(K.GROUND.find(g => g[0] <= col('first').x && g[1] >= K.LEDGES[0][0] + K.LEDGES[0][1] / 2)[0], 2300, 'the First Breath is over solid floor');
});

test('THE BELLOWS and THE LUNG: each column breathes against the next, and none reaches the next', () => {
  const B = K.BREATH, half = B.period * B.duty;
  const chain = (ids) => ids.map(col);
  for(const ids of [['b1', 'b2'], ['l1', 'l2', 'l3', 'l4']]){
    const cs = chain(ids);
    for(let i = 0; i + 1 < cs.length; i++){
      const a = cs[i], b = cs[i + 1];
      assert.ok(Math.abs(((b.phase - a.phase) % B.period + B.period) % B.period - half) < 1e-9, `${b.id} inhales as ${a.id} exhales`);
      assert.ok(Math.abs(b.x - a.x) >= 250, `${a.id}→${b.id}: a dash apart`);
      assert.ok(a.y + a.h + M.overshoot < b.y + b.h, `${b.id} goes higher`);
    }
  }
  // In the Lung the left columns are one above the other with a gap no jump spans: you must go by the right.
  const l1 = col('l1'), l3 = col('l3');
  assert.equal(l1.x, l3.x); assert.equal(l1.phase, l3.phase);
  assert.ok(l3.y - (l1.y + l1.h + M.overshoot) > M.jumpApex, 'L1 does not reach L3');
  assert.ok(K.COLUMNS.filter(c => c.lung).every(c => FU.groundAt(c.x) === null), 'the Lung is over the void');
  // The crown is only reached off the last column's top.
  const l4 = col('l4');
  assert.ok(K.CROWN.y < l4.y + l4.h + M.overshoot && K.CROWN.y > l4.y + l4.h - 60);
  assert.ok(K.CROWN.x1 >= l4.x + l4.w / 2, 'beside it, not over it');
  assert.match(fnFrom(fu, 'update'), /kit\.latch\(ZONE, 'fu-crown'\)/);
  // The camera looks up in the climbs.
  assert.match(fnFrom(fu, 'cameraFloor'), /Math\.max\(0, p\.y - 170\)/);
});

test('THE KITE DROP: two dashes fall short; the crystal on the way down does not', () => {
  const floor = K.GROUND.find(g => g[0] > 6000)[0];
  assert.ok(floor > M.kiteDoubleDash + 50, `the floor starts at ${floor}: two dashes land at ${M.kiteDoubleDash}`);
  assert.ok(floor < M.kiteCrystal - 30, `and the crystal route lands at ${M.kiteCrystal}`);
  assert.equal(K.CRYSTALS.length, 1);
  const [cx, cy] = K.CRYSTALS[0], lastTerrace = K.LEDGES.find(l => l[0] === 5315);
  assert.ok(cx > lastTerrace[0] && cx < floor && cy > lastTerrace[2], 'on the arc, above the terrace, before the floor');
});

test('the art is registered, draws its own air, and the renderer lets it', () => {
  assert.match(art, /ART\.register\(23, /);
  assert.match(renderer, /case 'updraft': if\(o\.actArt && ext\('object', o\)\) break; drawUpdraft\(o\); break;/);
  assert.ok(L.objects.filter(o => o.fuColumn).every(o => o.actArt === 'column'));
  assert.match(fnFrom(art, 'drawGrate'), /b\.left < u\.constants\.BREATH\.tell/, 'the column warns before the turn');
  assert.match(fnFrom(art, 'world'), /b\.inhale \? yb - q \* h : yt \+ q \* h/, 'the air rises on the inhale and pours down on the exhale');
});

test('teeth use the player height, damage once per cooldown, and ignore dead actors', () => {
  let hits = 0;
  const ctx = vm.createContext({ Math, TEETH:K.TEETH, hurtPlayer:() => { hits++; if(ctx.player) ctx.player.vy = -120; } });
  vm.runInContext(fnFrom(fu, 'teeth'), ctx);
  const A = { bitten:0 }, p = { x:1450, y:87, h:44, vy:-100 };
  ctx.player = p; ctx.teeth(A, p, .016); assert.equal(hits, 0);
  p.y = 88; ctx.teeth(A, p, .016); assert.equal(hits, 1); assert.equal(p.vy, 240);
  ctx.teeth(A, p, .016); assert.equal(hits, 1);
  p.dead = true; ctx.teeth(A, p, 1); assert.equal(hits, 1);
  p.dead = false; p.h = 30; ctx.teeth(A, p, 1); assert.equal(hits, 1);
});

test('exhale affects only live, undashing players inside its actual bounds', () => {
  const ctx = vm.createContext({ Math, COLUMNS:K.COLUMNS, BREATH:K.BREATH, G:{ time:1.5 } });
  vm.runInContext(['breath','inside','exhale'].map(n => fnFrom(fu,n)).join('\n'),ctx);
  for(const extra of [{}, {dodgeTimer:.1}, {dead:true}, {y:280}, {x:2900}]){
    const p = { x:2800, y:100, vy:0, ...extra };
    ctx.exhale(p,.1); assert.equal(p.vy, Object.keys(extra).length ? 0 : 300);
  }
});

test('column warning is steady and visible at the top; tooth pixels stay inside the hazard height', () => {
  const calls = [], ctx = vm.createContext({ Math, C:{grate:'grate',inhale:'up',exhale:'down',tooth:'rock',toothTip:'tip'}, U:()=>FU });
  vm.runInContext(['colOf','drawGrate','drawTeeth'].map(n=>fnFrom(art,n)).join('\n'),ctx);
  const api = {B:(...a)=>calls.push(a),WX:x=>x*.5,WY:y=>500-y*.5,Z:.5,G:{time:1.1}};
  ctx.drawGrate(api,L.objects.find(o=>o.fuColumn==='first'));
  assert.equal(calls.filter(c=>c[4]==='#ffd18a' && c[3]>100).length,2);
  calls.length=0; api.G.time=.5; ctx.drawGrate(api,L.objects.find(o=>o.fuColumn==='first'));
  assert.equal(calls.filter(c=>c[4]==='#ffd18a').length,0);
  calls.length=0;ctx.drawTeeth(api,{x:1465,w:270,y:132});
  assert.ok(calls.every(c=>c[1]>=414 && c[1]+c[3]<=434));
  assert.equal(Math.max(...calls.map(c=>c[1]+c[3])),434);
});
