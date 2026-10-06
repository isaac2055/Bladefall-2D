// The Fractured Colony: Act Three's eighteenth echo (stage 38). A B-side of the Colony emptied: the Watch (three lamps
// sweeping; tent to tent; held in a lamp and you are caught), the Dry Spring (rings to the conduit, its lamp, cisterns,
// the tap struck from above lifts the yard gate) — and a C-side: the Ringer's echo (hook across above his head, drop
// behind him, strike before he turns; stand in his lamp and the chained lunge).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fco = read('bladefall-fractured-colony.js');
const art = read('bladefall-fractured-colony-art.js');
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
const sandbox = vm.createContext({ Math, Object, JSON, Array, window:{} });
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam', 'Trap', 'Plate'].map(n => fnFrom(source, n)).join('\n')
  + '\n' + act + '\n' + core + '\n' + fco, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FCO = sandbox.window.BladefallFracturedColony;
const K = FCO.constants;
const L = ACT.level(38);
// Measured (7.218, scripted input in the browser): run 211; the hook: a ring within 470, a pull to 58 under it.
const M = { run:211 }, HOOK = { range:470, under:58 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('stage 38 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /38:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(38\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b38\b[^\]]*\]\)/);
  assert.match(source, /38:Object\.freeze\(\{id:'fractured-colony-road',src:'\.\/audio\/music\/fractured-the-waystation-refuge\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-the-waystation-refuge.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-village-vigil.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Colony'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fs-fco', 'fractured-shores', 'east', 'walk', 0\.5, 'fractured-colony', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(18), 38);
  assert.match(fnFrom(read('bladefall-fractured-shores.js'), 'arrival'), /plan\.connectorId === 'fs-fco'/);
  assert.match(fnFrom(fco, 'seamSpec'), /A\.silenced \? F\.seamOn\(STAGE, ZONE, 'fco-fp', LEN, true\)/);
  assert.match(fnFrom(fco, 'update'), /THE FRACTURED PATH/);
  assert.doesNotMatch(fco, /F\.grant\(/, 'nothing waits here');
});

test('THE WATCH: tent to tent; a lamp that holds you a breath catches you', () => {
  const W = K.WATCH;
  assert.ok(W.catchT <= .3, 'a breath, not a stroll (a knight running through was never caught at 0.6)');
  assert.match(fnFrom(fco, 'watch'), /A\.seenT = seen \? A\.seenT \+ dt : Math\.max\(0, A\.seenT - dt\);/);
  assert.match(fnFrom(fco, 'watch'), /if\(A\.seenT >= WATCH\.catchT && !p\.dead\)\{[^}]*fall\(p\)/);
  for(let i = 1; i < K.TENTS.length; i++){ const gap = K.TENTS[i][0] - K.TENTS[i - 1][1]; assert.ok(gap / M.run < 1.6, `a dash between tents (${gap})`); }
  for(const T of W.towers){ const vmax = 2 * Math.PI * T.amp / T.period; assert.ok(vmax < 700, 'a sweep a knight can read'); }
  // Every tent is inside some lamp's sweep: nowhere is safe for long except under canvas.
  for(const [a, b] of K.TENTS.slice(0, -1)){ const x = (a + b) / 2; assert.ok(W.towers.some(T => Math.abs(x - T.x) < T.amp), `tent at ${x} is swept`); }
});

test('THE DRY SPRING: rings up, the lamp stops short of the landing, the tap lifts the gate', () => {
  const S = K.SPRING, [a, b] = S.rings.map(([x, y]) => ({ x, y }));
  assert.ok(dist({ x:5150, y:22 }, a) < HOOK.range && dist({ x:a.x, y:a.y - HOOK.under + 22 }, b) < HOOK.range);
  assert.ok(S.conduit.y > 191 + 44, 'no jump reaches the conduit');
  assert.ok(S.lamp.x - S.lamp.amp >= S.conduit.x0 + 180, 'the lamp never lingers over where you land');
  assert.match(fnFrom(fco, 'tap'), /p\.slamFromY !== A\.slamSeen/);
  assert.match(fnFrom(fco, 'tap'), /setBars\('spring-gate', true\)/);
  const gate = L.objects.find(o => o.actBars === 'spring-gate'); assert.ok(gate && !gate.gone && gate.x > S.conduit.x1);
});

test('THE RINGER\'S ECHO: over his head by the rings, behind him before he turns', () => {
  const R = K.RINGER, T = K.TOWER, rings = K.YARD_RINGS.map(([x, y]) => ({ x, y }));
  assert.ok(R.phases.every(ph => ph.marks === 2));
  const [west, tw, te, east] = rings;
  assert.ok(dist({ x:west.x - 90, y:22 }, west) < HOOK.range && dist({ x:east.x + 90, y:22 }, east) < HOOK.range, 'an approach ring from the ground each side');
  assert.ok(dist({ x:west.x, y:west.y - HOOK.under + 22 }, tw) < HOOK.range && dist({ x:tw.x, y:tw.y - HOOK.under + 22 }, te) < HOOK.range);
  assert.ok(tw.y - 22 > HOOK.range, 'the tower\'s rings are out of reach from the ground');
  const mid = (T.x0 + T.x1) / 2;
  for(const r of [tw, te]) assert.ok(r.x > T.x0 && r.x < T.x1 && Math.abs(r.x - mid) < 60, 'dropping off one lands on his platform, within a blade of him');
  const pass = (te.x - tw.x) / 950 + Math.sqrt(2 * (te.y - HOOK.under - T.y) / 1424) + .1;
  assert.ok(pass < Math.min(...R.turn), `over and down before he turns (${pass.toFixed(2)} s)`);
  const u = fnFrom(fco, 'updateRinger');
  assert.match(u, /e\.portalGate = e\.st !== 'wait' && e\.st !== 'down' && behind \? 'melee' : 'ringer-never'/);
  assert.match(u, /if\(A\.yardSeenT >= RINGER\.lamp\.catchT\)\{ A\.yardSeenT = 0; toll\(A, e\); \}/, 'his lamp holds you and he rings');
  assert.match(fnFrom(fco, 'toll'), /c\.st = 'lunge'/, 'and the chained lunge');
  assert.match(fnFrom(fco, 'update'), /A\.fight && \(p\.dead \|\| p\.x < YARD\.x1 - 20\)\) resetRinger\(A\)/);
  assert.match(fnFrom(fco, 'struck'), /kit\.latch\(ZONE, 'fco-ringer-' \+ \(A\.phase \+ 1\)\)/);
});

test('the art is registered: the beams, the tents, the chained, the Ringer\'s shield and back', () => {
  assert.match(art, /ART\.register\(38, /);
  assert.match(fnFrom(art, 'world'), /beam\(api, T\.x, 520, k\.lampX\(T, A\.t\)/);
  assert.match(fnFrom(art, 'object'), /case 'actTent':/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe === 'chained'/);
  assert.match(fnFrom(art, 'enemy'), /e\.portalGate === 'melee'/);
});
