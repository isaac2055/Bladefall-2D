// The Fractured Line: Act Three's fifteenth echo (stage 35). A B-side of the Deep Line, a cart ride east: the Dead
// Signal (the descent, jets on a beat), the Cut Fork (the switch and no low road), the Falling Bridge (six spans that
// fail before you reach them), the Trick Gaps (each past the cart's reach but for the surge a clean 360 over the last
// one gave) — and a C-side: the Black Line (rail that is there only while the travelling light is on it: pace the cart).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fl = read('bladefall-fractured-line.js');
const art = read('bladefall-fractured-line-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'FJ', 'Slope', 'RailSwitch', 'RailCollapse', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam', 'Trap', 'Plate']
  .map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fl, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FL = sandbox.window.BladefallFracturedLine;
const K = FL.constants;
const L = ACT.level(35);
// Measured (7.215, scripted input in the browser, on the flat): a held cart jump is 0.87 s in the air and peaks at
// 108; speeds 110 (reined) / 270 (rest) / 430 (lean) / 570 (lean, full momentum past x 6800) / +190 for 1.5 s after a
// clean 360. Reach ≈ 0.87 × speed: 229 / 374 / 496 at those; the surge gaps are cleared from 20-100 before the edge.
const M = { air:.87, rest:270, lean:430, full:570, surge:190, reachFull:496 };

test('stage 35 is registered everywhere a stage must be, as Act Three, and it is a cart', () => {
  assert.match(source, /35:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(35\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b35\b[^\]]*\]\)/);
  assert.match(source, /35:Object\.freeze\(\{id:'fractured-line-road',src:'\.\/audio\/music\/fractured-chasing-daylight-on-broken-rails\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-chasing-daylight-on-broken-rails.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-clockwork.mp3')));
  assert.match(read('sw.js'), /fractured-clockwork\.mp3/);
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Line', len: 13900[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fk-fl', 'fractured-king', 'east', 'walk', 0\.5, 'fractured-line', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(15), 35);
  assert.match(fnFrom(read('bladefall-fractured-king.js'), 'arrival'), /plan\.connectorId === 'fk-fl'/);
  assert.match(fnFrom(fl, 'seamSpec'), /A\.blacked \? F\.seamOn\(STAGE, ZONE, 'fl-fc', LEN, true\)/);
  assert.match(fnFrom(fl, 'update'), /FRACTURED CLIFFS/);
  assert.ok(L.cart && L.authoredEcology);
});

test('THE CUT FORK: the low road ends in the dark; the high line crumbles faster than the original', () => {
  const sw = L.objects.find(o => o.type === 'railSwitch');
  assert.ok(sw.x < K.FORK.lowEnd && K.FORK.voidTo - K.FORK.lowEnd > 1000, 'no low road past the switch');
  assert.equal(FL.groundAt(K.FORK.lowEnd + 10), null);
  const rc = L.objects.filter(o => o.railCollapse && o.y === K.FORK.y);
  assert.ok(rc.length === 2 && rc.every(o => o.collapseDelay < 1.7), 'the original gave 1.75 and 1.7');
});

test('THE FALLING BRIDGE: six spans, only a leaning cart outruns them', () => {
  const spans = L.objects.filter(o => o.railCollapse && o.y === 0);
  assert.equal(spans.length, K.BRIDGE.n);
  const need = (K.BRIDGE.trigger + K.BRIDGE.w) / K.BRIDGE.delay;
  assert.ok(need > M.rest && need < M.lean + 30, `each span needs ~${need.toFixed(0)} u/s: more than rest, about a lean`);
});

test('THE TRICK GAPS: the lean for the first, a clean 360\'s surge for each after', () => {
  const [g1, g2, g3] = K.TRICK.gaps;
  assert.ok(g1[1] > M.air * M.rest && g1[1] < M.air * M.lean, 'the first asks for the lean');
  for(const g of [g2, g3]) assert.ok(g[1] > M.reachFull && g[1] < M.air * (M.full + M.surge) - 60, 'past the best without the surge, inside it with');
  const surgeRun = (M.full + M.surge) * 1.5;
  assert.ok(g2[0] - (g1[0] + g1[1]) < surgeRun - 400 && g3[0] - (g2[0] + g2[1]) < surgeRun - 400, 'the next take-off lies inside the surge');
  assert.ok(g1[0] > 6800 + 700, 'past the momentum window\'s start, with room to build it');
});

test('THE BLACK LINE: the light travels at each stretch\'s pace; only a paced cart stays in it', () => {
  const B = K.BLACK, planks = L.objects.filter(o => o.flWave != null);
  assert.equal(planks.length, (B.end - B.x0) / B.plank);
  assert.equal(B.secs.map(s => s[2]).join(), '270,110,570', 'rest, reined in, leaning');
  assert.ok(B.secs[0][0] === B.x0 && B.secs[B.secs.length - 1][1] === B.end);
  for(const [a, b, v] of B.secs) assert.ok(Math.abs((FL.waveT(b) - FL.waveT(a)) - (b - a) / v) < 1e-9, 'the light crosses each stretch at its pace');
  assert.ok(B.upT * 110 > 150, 'the reined stretch still leaves an island a cart fits in');
  assert.match(fnFrom(fl, 'beats'), /o\.gone = f >= BLACK\.upT/);
  assert.equal(FL.groundAt(B.x0 + 50), null, 'nothing under it but the dark');
  assert.match(fnFrom(fl, 'update'), /A\.blacked = true; A\.inBlack = false; kit\.latch\(ZONE, 'fl-black'\); F\.clear\(STAGE\)/);
});

test('the art is registered: rail irons, the collapse warning, the travelling light', () => {
  assert.match(art, /ART\.register\(35, /);
  assert.match(fnFrom(art, 'plat'), /case 'beat':/);
  assert.match(fnFrom(art, 'plat'), /o\.railCollapse && o\.crT > 0/);
});
