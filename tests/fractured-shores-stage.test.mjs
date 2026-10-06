// The Fractured Shores: Act Three's seventeenth echo (stage 37). A B-side of the Landing Shores at a higher tide:
// the Gut (three rings over the water; the hull climbed by two more), the Flats at Flood (a faster tide that
// drowns; refuge to refuge — a rib, a wreck, a float that rides it) — and a C-side: the Sunguard's echo (only a
// blow on its back, landed while the bell's toll still rings, counts).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fs = read('bladefall-fractured-shores.js');
const art = read('bladefall-fractured-shores-art.js');
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
  + '\n' + act + '\n' + core + '\n' + fs, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FS = sandbox.window.BladefallFracturedShores;
const K = FS.constants;
const L = ACT.level(37);
// Measured (7.217, scripted input in the browser): run 211; a double jump 147 (+ a dash 191 high); full-kit reach ~671;
// the hook: a ring within 470, a pull to 58 under it, a hang of 1.7 s. A knight drowns when the tide stands 26 over its feet.
const M = { run:211, dj:147, djDash:191, reach:671 }, HOOK = { range:470, under:58 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('stage 37 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /37:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(37\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b37\b[^\]]*\]\)/);
  assert.match(source, /37:Object\.freeze\(\{id:'fractured-shores-road',src:'\.\/audio\/music\/fractured-the-shore-of-broken-ships\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-the-shore-of-broken-ships.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-the-last-spark-of-darrow.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'Fractured Shores'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fc-fs', 'fractured-cliffs', 'east', 'walk', 0\.5, 'fractured-shores', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(17), 37);
  assert.match(fnFrom(read('bladefall-fractured-cliffs.js'), 'arrival'), /plan\.connectorId === 'fc-fs'/);
  assert.match(fnFrom(fs, 'seamSpec'), /A\.broken \? F\.seamOn\(STAGE, ZONE, 'fs-fco', LEN, true\)/);
  assert.match(fnFrom(fs, 'update'), /THE FRACTURED COLONY/);
  assert.match(fnFrom(fs, 'init'), /'gravity-flip', 'chain-hook'\]\)/, 'the whole kit through the hook; nothing waits here');
  assert.doesNotMatch(fs, /F\.grant\(/);
});

test('THE GUT and THE HULL: only the rings cross and climb', () => {
  assert.ok(K.GUT.x1 - K.GUT.x0 > M.reach + 200);
  const r = K.GUT.rings.map(([x, y]) => ({ x, y }));
  assert.ok(dist({ x:K.GUT.x0, y:K.STRAND.y + 22 }, r[0]) < HOOK.range);
  for(let i = 1; i < r.length; i++) assert.ok(dist({ x:r[i - 1].x, y:r[i - 1].y - HOOK.under + 22 }, r[i]) < HOOK.range);
  assert.ok(K.HULL.deck - K.FAR.y > M.djDash + 100, 'the deck is far above any jump');
  const coat = L.objects.find(o => o.type === 'wall' && o.actArt === 'coat' && Math.abs(o.x - K.HULL.x0) < 20);
  assert.ok(coat && coat.noCling, 'the hull\'s side is coated: nothing clings up it');
});

test('THE FLATS AT FLOOD: each refuge needed, each reached; the tide drowns', () => {
  const T = K.TIDE, P = T.phases.reduce((a, b) => a + b, 0);
  // The dry window: the tide below the drowning line (26 over the sand).
  let dry = 0; for(let t = 0; t < P; t += .01) if(FS.tideLevel(t, T) <= T.drown) dry += .01;
  const reachDry = dry * M.run;
  const legs = [ [K.STEP.x1, K.RIB.x0], [K.RIB.x1, K.WRECK.x0], [K.WRECK.x1, K.FLOAT.x], [K.FLOAT.x, K.SHORE[0][0]] ];
  for(const [a, b] of legs) assert.ok(b - a < reachDry - 150, `a leg of ${b - a} fits the ${dry.toFixed(1)} s dry window`);
  for(let i = 0; i < legs.length - 1; i++) assert.ok(legs[i + 1][1] - legs[i][0] > reachDry, 'but never two legs: every refuge is needed');
  for(const y of [K.RIB.y, K.WRECK.y]) assert.ok(y + T.drown > T.high, 'the refuges stand above high water');
  assert.ok(K.RIB.y > M.djDash && dist({ x:K.RIB.x0 - 60, y:22 }, { x:K.RIB.ring[0], y:K.RIB.ring[1] }) < HOOK.range, 'the rib is above a jump, reached by its ring');
  assert.match(fnFrom(fs, 'flats'), /A\.tide > p\.y \+ TIDE\.drown\) fall\(p\)/, 'the flood is a fall');
  assert.match(fnFrom(fs, 'flats'), /fl\.y = Math\.max\(0, A\.tide\) \+ 16/, 'the float rides the tide, resting on the sand at low water');
  const coats = L.objects.filter(o => o.type === 'wall' && o.actArt === 'coat');
  assert.ok(coats.length >= 8, 'every raised face coated: nothing walks into a refuge');
});

test('THE SUNGUARD\'S ECHO: only its back, only while the toll rings', () => {
  const g = fnFrom(fs, 'updateGuard');
  assert.match(g, /const behind = Math\.sign\(p\.x - e\.x\) === -e\.face;/);
  assert.match(g, /e\.portalGate = e\.st !== 'wait' && e\.st !== 'down' && behind && tolling \? 'melee' : 'sg-never'/);
  assert.match(fnFrom(fs, 'struck'), /A\.tollT = GUARD\.phases\[A\.phase\]\.ring;/, 'one blow a toll');
  const G0 = K.GUARD;
  assert.ok(G0.phases.every(ph => ph.marks === 2 && ph.ring < ph.toll));
  assert.ok(G0.h + 20 < M.dj, 'a double jump clears it: over it to its back');
  for(const [, , y] of K.COURT_PERCHES){ assert.ok(y < M.dj - 10, 'a perch a double jump up'); assert.ok(G0.tide.high <= y + 20, 'and above the court\'s high water'); }
  assert.match(fnFrom(fs, 'update'), /A\.fight && \(p\.dead \|\| p\.x < COURT\.x1 - 20\)\) resetGuard\(A\)/);
  assert.match(fnFrom(fs, 'struck'), /kit\.latch\(ZONE, 'fs-guard-' \+ \(A\.phase \+ 1\)\)/);
});

test('the art is registered: the tide, the refuges, the bell, the shield and its lit back', () => {
  assert.match(art, /ART\.register\(37, /);
  assert.match(fnFrom(art, 'world'), /water\(api, KC\.FLATS\.x0, KC\.FLATS\.x1, A\.tide/);
  assert.match(fnFrom(art, 'object'), /case 'actBell':/);
  assert.match(fnFrom(art, 'enemy'), /e\.portalGate === 'melee'/);
});
