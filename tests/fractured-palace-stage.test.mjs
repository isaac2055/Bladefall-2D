// The Fractured Palace: Act Three's twentieth and last echo (stage 40). A B-side of the Sunspire: the Sun Court (a
// shaft caught in a floor mouth, thrown out of its twin on a slate face into the seal), the Hall of Hours (the shaft
// moves; its twin sends the light up from the ledge under the seal) — and a C-side: the King in the Dark (struck only
// while light you sent touches him). After him, the end of the echoes: meta.actThreeDone and the closing card.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fpa = read('bladefall-fractured-palace.js');
const art = read('bladefall-fractured-palace-art.js');
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
  + '\n' + act + '\n' + core + '\n' + fpa, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FPA = sandbox.window.BladefallFracturedPalace;
const K = FPA.constants;
const L = ACT.level(40);

test('stage 40 is registered everywhere a stage must be, as Act Three\'s last echo', () => {
  assert.match(source, /40:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(40\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b40\b[^\]]*\]\)/);
  assert.match(source, /40:Object\.freeze\(\{id:'fractured-palace-road',src:'\.\/audio\/music\/fractured-white-marble-palace\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-white-marble-palace.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-the-fallen-champion-duel.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'Fractured Palace'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fp-fpa', 'fractured-path', 'east', 'walk', 0\.5, 'fractured-palace', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(20), 40);
  assert.equal(F.nextEcho(40), null, 'nothing after it');
  assert.match(fnFrom(read('bladefall-fractured-path.js'), 'arrival'), /plan\.connectorId === 'fp-fpa'/);
  assert.match(fnFrom(fpa, 'seamSpec'), /return null;\s+\/\/ the last echo: the road ends here/);
  assert.doesNotMatch(fpa, /F\.grant\(/);
});

test('THE SUN COURT: a floor mouth in the shaft, its twin on the face, the light across into the seal', () => {
  const C = K.COURT;
  const panel = L.objects.find(o => o.slate && Math.abs(o.x - C.shaft) < 5), face = L.objects.find(o => o.type === 'wall' && o.slate && o.x === C.face.x);
  assert.ok(panel && face, 'slate under the shaft; a slate face');
  assert.ok(C.face.bottom > 44, 'raised: walked under, clung to');
  assert.ok(C.seal.y - C.seal.h / 2 > C.face.bottom + 17 && C.seal.y + C.seal.h / 2 < C.face.top, 'the seal at a height a clinging knight can set a mouth');
  assert.ok(C.seal.x > C.face.x && C.gate > C.seal.x, 'across the court from the face, before the gate');
  assert.match(fnFrom(fpa, 'light'), /if\(a\.surf !== 'floor' \|\| Math\.abs\(a\.x - sx\) > 40\) continue;/, 'the shaft goes in at a floor mouth');
  assert.match(fnFrom(fpa, 'light'), /const dx = b\.surf === 'wall' \? \(b\.nx \|\| 0\) : 0, dy = b\.surf === 'wall' \? 0 : 1;/, 'and out of its twin the way the twin faces');
});

test('THE HALL OF HOURS: the shaft moves across the slate; the ledge sends it up into the seal', () => {
  const H = K.HALL;
  assert.ok(H.shaft.x - H.shaft.amp >= H.strip[0] && H.shaft.x + H.shaft.amp <= H.strip[1], 'the shaft never leaves the slate');
  assert.ok(Math.abs(H.seal.x - H.ledge.x) < 5 && H.seal.w >= H.ledge.w - 20, 'the seal over the whole slate of the ledge');
  let prev = 0; for(const [, , y] of H.steps.concat([[0, 0, H.ledge.y]])){ assert.ok(y - prev < 147 - 20, 'each rise a double jump'); prev = y; }
});

test('THE KING IN THE DARK: struck only while your light is on him; struck, he takes the mouth that sent it', () => {
  assert.ok(K.KING.phases.every(ph => ph.marks === 2));
  const u = fnFrom(fpa, 'updateKing');
  assert.match(u, /e\.portalGate = e\.exposedT > 0 && e\.st !== 'down' && e\.st !== 'wait' \? 'melee' : 'king-never'/);
  assert.match(fnFrom(fpa, 'light'), /if\(r\.hit && r\.hit\.king\)\{ r\.hit\.king\.exposedT = KING\.exposed; r\.hit\.king\.lightExit = b; \}/);
  assert.match(fnFrom(fpa, 'blink'), /if\(takeMouths && G\.cratePortals && G\.cratePortals\.length\)\{\s*const i = G\.cratePortals\.indexOf\(e\.lightExit\)/,
    'struck, he takes the sending mouth only; his own blinks take nothing (both once cleared every 8.5 s, before a knight could set them)');
  for(const ph of K.KING.phases) for(const S of ph.shafts) assert.ok(K.THRONE.panels.some(x => Math.abs(x - S.x) <= (S.amp || 0) + 40), 'every shaft passes over slate');
  const west = K.THRONE.faces.find(f => f.side > 0); assert.ok(K.THRONE.faceSpan.bottom + 17 < K.KING.h, 'a low mouth on the west face throws light across the room at his height');
  assert.match(fnFrom(fpa, 'light'), /Math\.abs\(p\.x - r\.x0\) > 40/, 'setting the mouth is not a burn');
  assert.match(fnFrom(fpa, 'update'), /A\.fight && \(p\.dead \|\| p\.x < THRONE\.x1 - 20\)\) resetKing\(A\)/);
  assert.match(fnFrom(fpa, 'struck'), /kit\.latch\(ZONE, 'fpa-king-' \+ \(A\.phase \+ 1\)\)/);
});

test('THE END OF THE ECHOES: the flag, the mouths cleared off the road out, the closing card', () => {
  const s = fnFrom(fpa, 'struck');
  assert.match(s, /meta\.actThreeDone = true; persist\(\);/);
  assert.match(s, /clearPlacedPortals\(true, 'king-yields'\)/, 'or the road out runs through your own mouths (the chained bot looped there)');
  assert.match(fnFrom(fpa, 'finale'), /END OF ACT THREE/);
  assert.match(fnFrom(fpa, 'update'), /if\(!A\.over && A\.yielded && p\.x > LEN - 150 && !p\.dead\)\{ A\.over = true; finale\(\); \}/);
});

test('the art is registered: the shafts, the light you sent, the seals, the King lit and dark', () => {
  assert.match(art, /ART\.register\(40, /);
  assert.match(fnFrom(art, 'world'), /for\(const r of A\.rays \|\| \[\]\)/);
  assert.match(fnFrom(art, 'object'), /case 'actSeal':/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'darkking'/);
});
