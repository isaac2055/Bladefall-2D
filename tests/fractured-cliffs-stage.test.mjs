// The Fractured Cliffs: Act Three's sixteenth echo (stage 36). A B-side of the Thunder Cliffs with the ship a wreck
// and the sea up the cliffs: the Wreck (the windlass gives the Chainhook to a downward strike, where the hulk's did;
// two rings over the first gap), the Iron Road (rings over the sea, the lightning walking along them), the Breakers
// (walls of water off the sea: be on a ring) — and a C-side: the Last Head (it lunges and strains; hook the ring over
// it and strike its collar's lock from above).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fc = read('bladefall-fractured-cliffs.js');
const art = read('bladefall-fractured-cliffs-art.js');
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
  + '\n' + act + '\n' + core + '\n' + fc, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FC = sandbox.window.BladefallFracturedCliffs;
const K = FC.constants;
const L = ACT.level(36);
// The hook (bladefall-act-two.js): a ring within 470 of the knight's centre; a pull to 58 under it; a hang of 1.7 s.
// Measured (7.216, scripted input in the browser): full-kit reach ~671 flat; a double jump 147 (+ a dash, 191 high).
const HOOK = { range:470, under:58, hang:1.7 }, M = { reach:671, djDash:191, h:44 };
const rings = L.objects.filter(o => o.type === 'actRing');
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('stage 36 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /36:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(36\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b36\b[^\]]*\]\)/);
  assert.match(source, /36:Object\.freeze\(\{id:'fractured-cliffs-road',src:'\.\/audio\/music\/fractured-navigating-the-red-wake\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-navigating-the-red-wake.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-chains-of-the-deep.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'Fractured Cliffs'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fl-fc', 'fractured-line', 'east', 'walk', 0\.5, 'fractured-cliffs', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(16), 36);
  assert.match(fnFrom(read('bladefall-fractured-line.js'), 'arrival'), /plan\.connectorId === 'fl-fc'/);
  assert.match(fnFrom(fc, 'seamSpec'), /A\.freed \? F\.seamOn\(STAGE, ZONE, 'fc-fs', LEN, true\)/);
  assert.match(fnFrom(fc, 'update'), /FRACTURED SHORES/);
  assert.ok(L.authoredEcology);
});

test('THE CLIFFS\' KIT: through the gravity flip; the Chainhook from the windlass, to a downward strike', () => {
  assert.match(fnFrom(fc, 'init'), /A\.hook \? ids\.concat\('chain-hook'\) : ids/);
  assert.match(fnFrom(fc, 'windlass'), /F\.grant\('chain-hook'\)/);
  assert.match(fnFrom(fc, 'windlass'), /p\.slamFromY !== A\.slamSeen/, 'a short strike can begin and land in one frame: read where it began');
  assert.ok(K.WINDLASS.y < 78 - 30, 'low: a jump gives a real fall onto it');
  const gap = K.GROUND[1][0] - K.GROUND[0][1];
  assert.ok(gap > M.reach + 100, 'the first gap is the hook\'s');
  const edge = { x:K.GROUND[0][1], y:22 };
  assert.ok(dist(edge, K.FIRST_RINGS[0]) < HOOK.range, 'the first ring in reach from the edge');
  assert.ok(dist({ x:K.FIRST_RINGS[0].x, y:K.FIRST_RINGS[0].y - HOOK.under + 22 }, K.FIRST_RINGS[1]) < HOOK.range, 'the second from the first\'s hang');
});

test('THE IRON ROAD: rings over the sea, each in reach from the last\'s hang; the lightning walks east behind you', () => {
  const iron = FC.ironRings(), I = K.IRON;
  assert.ok(dist({ x:K.GROUND[1][1], y:22 }, iron[0]) < HOOK.range);
  for(let i = 1; i < iron.length; i++) assert.ok(dist({ x:iron[i - 1].x, y:iron[i - 1].y - HOOK.under + 22 }, iron[i]) < HOOK.range);
  assert.ok(K.GROUND[2][0] - iron[iron.length - 1].x < 300, 'a jump out of the last hang reaches the cliff');
  assert.ok(K.GROUND[2][0] - K.GROUND[1][1] > 2 * M.reach, 'only the rings cross it');
  assert.ok(I.offset > 0, 'the strike walks east, the way you go: follow it');
  assert.ok(I.period - I.gone - I.warn > .5, 'a quiet stretch on every ring to take it in');
  assert.ok(I.period - I.gone > HOOK.hang, 'the hang runs out before the next strike: keep moving');
  assert.match(fnFrom(fc, 'lightning'), /if\(p\.actHook && p\.actHook\.ring === o\)\{ harm\(p, 1, IRON\.dmg\); p\.actHook = null; \}/);
});

test('THE BREAKERS: walls of water taller than a jump, hung over; seen coming', () => {
  const W = K.BREAK.wave, br = FC.breakRings();
  assert.ok(W.h > M.djDash + M.h, 'no jumping it');
  for(const r of br) assert.ok(r.y - HOOK.under > W.h, 'a hang clears it');
  for(let i = 1; i < br.length; i++) assert.ok(br[i].x - br[i - 1].x < 2 * Math.sqrt(HOOK.range ** 2 - (br[i].y - 22) ** 2), 'a ring always in reach from the cliff top');
  assert.match(fnFrom(fc, 'breakers'), /p\.x \+ 1200/, 'spawned well ahead of you');
  assert.match(fnFrom(fc, 'breakers'), /p\.x < BREAK\.x1 - 450/, 'none in the last stretch, where one would spawn on top of you');
  assert.ok((W.w + 26) / W.speed < HOOK.hang, 'one passes under a hang');
});

test('THE LAST HEAD: it lunges at the ring you stand under; strike its lock from above, off that ring', () => {
  assert.ok(K.HEAD.phases.every(ph => ph.marks === 2));
  const u = fnFrom(fc, 'updateHead');
  assert.match(u, /const r = HEAD_RINGS\.slice\(\)\.sort\(\(a, b\) => Math\.abs\(a\.x - p\.x\) - Math\.abs\(b\.x - p\.x\)\)\[0\];/);
  assert.match(u, /p\.slamming && Math\.abs\(p\.x - e\.x\) < e\.w \/ 2 \+ 8/);
  assert.match(u, /p\.fcSlamFrom - \(e\.y \+ e\.h\) >= HEAD\.slamFrom/, 'a strike begun well above it');
  const head = K.HEAD, top = head.low + head.h;
  for(const r of K.HEAD_RINGS){
    assert.ok(r.y - HOOK.under - top >= head.slamFrom, 'the ring\'s hang is high enough to strike from');
    assert.ok(Math.hypot(150, r.y - 22) < HOOK.range, 'and in reach from the floor 150 to either side');
  }
  assert.ok(M.djDash < top + head.slamFrom, 'no strike from a jump off the floor counts');
  assert.match(fnFrom(fc, 'update'), /A\.fight && \(p\.dead \|\| p\.x < ARENA\.x1 - 20\)\) resetHead\(A\)/);
  assert.match(fnFrom(fc, 'mark'), /kit\.latch\(ZONE, 'fc-head-' \+ \(A\.phase \+ 1\)\)/);
  assert.ok(!L.objects.some(o => o.type === 'wall' && o.actArt === 'rockface'), 'the staple\'s rock is drawn behind the road, not across it');
});

test('the art is registered: the rings (and the lightning on them), the chain to your hand, the breakers, the head', () => {
  assert.match(art, /ART\.register\(36, /);
  assert.match(fnFrom(art, 'object'), /case 'actRing':/);
  assert.match(fnFrom(art, 'world'), /p\.actHook && p\.actHook\.ring/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'lasthead'/);
});
