// The Fractured Path: Act Three's nineteenth echo (stage 39). A B-side of the Palace Path at noon: Noon Road (pools of
// sun that burn; shelters and the vents' smoke are shade), the Burning Stair (six risers under wider pools, shade on
// every landing), the Overlook (the chasm by rings, a beam walking them) — and a C-side: the Sun Gate (the windlass
// turns only while the sun is on it; strike it lit from the ring above, and leave the light).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fp = read('bladefall-fractured-path.js');
const art = read('bladefall-fractured-path-art.js');
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
  + '\n' + act + '\n' + core + '\n' + fp, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FP = sandbox.window.BladefallFracturedPath;
const K = FP.constants;
const L = ACT.level(39);
// Measured (7.219, scripted input in the browser): a double jump 147; full-kit reach ~671; the hook: a ring within 470,
// a pull to 58 under it; a jump out of a hang is one jump from a standstill (the air jump is spent): it carried ~206
// before dropping 182.
const M = { dj:147, reach:671 }, HOOK = { range:470, under:58 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('stage 39 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /39:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(39\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b39\b[^\]]*\]\)/);
  assert.match(source, /39:Object\.freeze\(\{id:'fractured-path-road',src:'\.\/audio\/music\/fractured-towering-sea-cliffs\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-towering-sea-cliffs.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-element.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Path'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fco-fp', 'fractured-colony', 'east', 'walk', 0\.5, 'fractured-path', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(19), 39);
  assert.match(fnFrom(read('bladefall-fractured-colony.js'), 'arrival'), /plan\.connectorId === 'fco-fp'/);
  assert.match(fnFrom(fp, 'seamSpec'), /A\.opened \? F\.seamOn\(STAGE, ZONE, 'fp-fpa', LEN, true\)/);
  assert.match(fnFrom(fp, 'update'), /FRACTURED PALACE/);
  assert.doesNotMatch(fp, /F\.grant\(/);
});

test('NOON ROAD and THE BURNING STAIR: the sun burns on the ground; shade on every landing', () => {
  assert.match(fnFrom(fp, 'sun'), /!inShelter\(p\.x\) && !inSmoke\(p\.x, A\.t\)/);
  assert.match(fnFrom(fp, 'sun'), /if\(lit && A\.burnCd <= 0\)\{ A\.burnCd = BURN\.every; harm\(p, 0, BURN\.dmg\);/);
  for(let i = 0; i < K.STAIR.n; i++){
    const a = K.STAIR.x0 + i * K.STAIR.step;
    assert.ok(K.SHELTERS.some(([s0, s1]) => s0 > a && s1 < a + K.STAIR.step), `shade on landing ${i}`);
  }
  assert.ok(K.RISE < M.dj - 20, 'each riser a double jump');
  const coats = L.objects.filter(o => o.type === 'wall' && o.actArt === 'riser');
  assert.equal(coats.length, K.STAIR.n, 'every riser face coated: nothing clings up it');
  for(const M0 of K.MIRRORS) assert.ok(2 * Math.PI * M0.amp / M0.period < 700, 'a pool a knight can read');
});

test('THE OVERLOOK: only the rings cross; each in reach of the last; the last near enough to jump out of', () => {
  const O = K.OVERLOOK, r = O.rings.map(([x, y]) => ({ x, y }));
  assert.ok(O.x1 - O.x0 > M.reach + 300);
  assert.ok(dist({ x:O.x0, y:K.TOP + 22 }, r[0]) < HOOK.range);
  for(let i = 1; i < r.length; i++) assert.ok(dist({ x:r[i - 1].x, y:r[i - 1].y - HOOK.under + 22 }, r[i]) < HOOK.range);
  assert.ok(O.x1 - r[r.length - 1].x <= 180 && r[r.length - 1].y - HOOK.under - K.TOP >= 250, 'one jump from a standstill carries it (measured ~206)');
});

test('THE SUN GATE: the windlass turns only lit; one strike, one turn; a turn slips back', () => {
  const w = fnFrom(fp, 'windlass');
  assert.match(w, /if\(!gateLit\(A\.t\)\)\{ kit\.burst\([^\n]*return; \}/, 'cold iron: nothing');
  assert.match(w, /A\.turnCd = \.6;/, 'one strike, one answer (all three once registered on one strike)');
  assert.match(w, /if\(A\.slipT >= GATE\.slip\)\{ A\.slipT = 0; A\.turns--;/);
  assert.match(w, /p\.vy = -620;/, 'the iron throws you up out of the light');
  const G0 = K.GATE; assert.ok(dist({ x:G0.windlass.x - 110, y:K.TOP + 22 }, { x:G0.ring[0], y:G0.ring[1] }) < HOOK.range);
  assert.ok(G0.ring[1] - HOOK.under - (K.TOP + G0.windlass.h) > 250, 'a strike from the ring has room to fall');
  assert.ok(G0.slip > G0.mirror.period + 1, 'the next turn fits before a slip, one light later');
  assert.match(fnFrom(fp, 'sun'), /A\.fight && gateLit\(A\.t\) && p\.onGround/, 'and the light on the iron burns whoever stands in it');
  assert.match(fnFrom(fp, 'update'), /A\.fight && \(p\.dead \|\| p\.x < GATE\.arena\.x1 - 20\)\) resetGate\(A\)/);
});

test('the art is registered: the pools, the shade, the smoke, the lit windlass', () => {
  assert.match(art, /ART\.register\(39, /);
  assert.match(fnFrom(art, 'world'), /pool\(api, x, M\.w, g\)/);
  assert.match(fnFrom(art, 'object'), /case 'actShelter':/);
  assert.match(fnFrom(art, 'object'), /case 'actVent':/);
  assert.match(fnFrom(art, 'plat'), /case 'windlass':/);
});
