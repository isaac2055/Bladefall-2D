// The Fractured Inversion: Act Three's twelfth echo (stage 32). A B-side of the Inversion walked the right way up:
// the anchor (the flip, where it was), the Crossings (the floor and the roof both break, never over each other), the
// Gulf (both gone: under a spur and over a pillar in one flip), the Weave (walls up and walls down, thorns on your own
// surface) — and a C-side: the Keel (strike it only from the side it shows its keel to; flee the sweeps).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fi = read('bladefall-fractured-inversion.js');
const art = read('bladefall-fractured-inversion-art.js');
const renderer = read('bladefall-respec-renderer.js');
const camera = read('bladefall-camera.js');

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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam', 'Trap'].map(n => fnFrom(source, n)).join('\n')
  + '\n' + act + '\n' + core + '\n' + fi, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FI = sandbox.window.BladefallFracturedInversion;
const K = FI.constants;
const L = ACT.level(32);
// Measured (7.212, scripted input in the browser): the knight is 44 tall; a jump 78; a double jump ~147; a double jump
// and a dash ~191 high, ~564 far; a flip crosses 500 in 0.82 s and carries a runner ~173; a flipped jump reaches 79.
const M = { h:44, jump:78, dj:147, djDashHigh:191, djDashFar:564, flipDrift:173 };
const walls = L.objects.filter(o => o.type === 'wall');
const wallAt = (x) => walls.find(w => w.x === x);

test('stage 32 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /32:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(32\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 32);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b32\b[^\]]*\]\)/);
  assert.match(source, /32:Object\.freeze\(\{id:'fractured-inversion-road',src:'\.\/audio\/music\/fractured-chamber-of-inverted-gravity\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-chamber-of-inverted-gravity.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-abnormal-circumstances.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Inversion'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fcl-fi', 'fractured-colossus', 'east', 'walk', 0\.5, 'fractured-inversion', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(11), 32);
  assert.match(fnFrom(fi, 'seamSpec'), /connector:'fcl-fi', zone:ZONE, targetStage:31/);
  assert.match(fnFrom(fi, 'seamSpec'), /A\.keeled \? F\.seamOn\(STAGE, ZONE, 'fi-ft', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-colossus.js'), 'arrival'), /plan\.connectorId === 'fcl-fi'/);
  assert.match(fnFrom(fi, 'update'), /THE FRACTURED TYRANT/);
  assert.ok(L.flip && L.authoredEcology, 'the flip and the roof of the world; no random void-dwellers');
});

test('THE INVERSION\'S KIT: through the downward strike; the flip at the anchor, where it was', () => {
  assert.match(fnFrom(fi, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement', 'companion-command', 'downward-strike'\]/);
  assert.match(fnFrom(fi, 'init'), /A\.flip \? ids\.concat\('gravity-flip'\) : ids/);
  assert.match(fnFrom(fi, 'anchor'), /F\.grant\('gravity-flip'\)/);
  assert.ok(K.ROOF_FROM < K.ANCHOR.x, 'a roof over the anchor: the first flip lands somewhere');
  assert.ok(K.ANCHOR.x < K.FLOOR_GAPS[0][0], 'the flip before the first floor that fails');
  assert.match(fnFrom(fi, 'sky'), /hurtPlayer\(0, 1, false\);[^\n]*G\.gravityFlipped = false/, 'a fall into the sky rewinds you the right way up');
});

test('THE CROSSINGS: where the floor fails you walk the roof; where the roof fails you walk the floor', () => {
  const roof = FI.roofSegs(), floor = FI.floorSegs();
  const covered = (segs, a, b) => segs.some(([x0, x1]) => x0 <= a && x1 >= b);
  for(const [a, b] of K.FLOOR_GAPS){
    assert.ok(covered(roof, a, b), `roof over the floor gap ${a}`);
    const pillar = wallAt((a + b) / 2);
    assert.ok(pillar && pillar.y > M.djDashHigh + M.h, 'a pillar in it that no jump clears');
    assert.ok(b - a > M.djDashFar - 100 || pillar, 'no jumping it');
  }
  for(const [a, b] of K.ROOF_GAPS){
    assert.ok(covered(floor, a, b), `floor under the roof gap ${a}`);
    const spur = wallAt((a + b) / 2);
    assert.ok(spur && K.ROOF - (spur.y - spur.h) > M.dj + M.h, 'a spur in it that no flipped knight passes');
  }
  for(const [c0, c1] of K.CRUMBLE) assert.ok(K.FLOOR_GAPS.some(([a, b]) => a <= c0 && b >= c1), 'the roof crumbles only over a floor gap');
  const crumbles = L.objects.filter(o => o.crumble);
  assert.ok(crumbles.length >= 8 && crumbles.every(o => o.ceilingOnly), 'crumbling roof, stood on from below');
  // The teeth by the crumble sit on it: you wait on solid roof for them, never on the crumble.
  const solidBefore = K.CRUMBLE[1][0] - K.GULF.x1;
  assert.ok(solidBefore >= 300, `solid roof to wait on before the second crumble (${solidBefore})`);
});

test('THE GULF: both floors gone — under the spur, over the pillar, in one flip', () => {
  const G0 = K.GULF;
  assert.ok(!FI.floorSegs().some(([a, b]) => a < G0.x1 && b > G0.x0) && !FI.roofSegs().some(([a, b]) => a < G0.x1 && b > G0.x0));
  assert.ok(G0.spur.to < M.dj + M.h, 'a double jump puts your head into the spur');
  assert.ok(G0.pillar.to > M.djDashHigh + M.h, 'no jump clears the pillar');
  assert.ok(G0.spur.x < G0.pillar.x, 'low first, then high');
  assert.ok(K.VOID < -250 && K.SKY > 1000, 'room to turn: the void and the sky sit far enough off (windows ~0.57 s and ~0.43 s at a run, measured)');
  assert.match(fnFrom(fi, 'voidFloor'), /return VOID/);
});

test('THE WEAVE: walls up and walls down, each passed on the other surface; thorns on your own', () => {
  const W = K.WEAVE, ws = walls.filter(w => w.x >= W.x0 && w.x <= W.x1).sort((a, b) => a.x - b.x);
  assert.ok(ws.length >= 6);
  ws.forEach((w, k) => {
    if(k % 2 === 0) assert.ok(w.y - w.h <= 0 && w.y > M.djDashHigh + M.h, 'a pillar from the floor, unjumpable');
    else assert.ok(w.y >= K.ROOF && K.ROOF - (w.y - w.h) > M.dj + M.h, 'a spur from the roof, unpassable flipped');
  });
  assert.ok(W.step - 2 * 33 > M.flipDrift, 'a flip at a run, begun just past one wall, lands before the next');
  const thorns = L.objects.filter(o => o.type === 'spikes' && o.x > W.x0 && o.x < W.x1);
  for(const t of thorns){
    const before = ws.filter(w => w.x < t.x).pop(), pillarBefore = ws.indexOf(before) % 2 === 0;
    assert.equal(!!t.ceil, pillarBefore, 'past a pillar you walk the roof, so its thorns are on the roof');
  }
});

test('THE KEEL: bare to one side at a time; the sweeps burn where you were; one mark a cycle', () => {
  assert.equal(K.KEEL.phases.length, 3); assert.ok(K.KEEL.phases.every(ph => ph.marks === 2));
  const u = fnFrom(fi, 'updateKeel');
  assert.match(u, /e\.side = surfaceOf\(\) === 'floor' \? 'up' : 'down'/, 'it shows its keel to the surface you are not on');
  assert.match(u, /e\.first = e\.side === 'up' \? 'floor' : 'roof'; sweepAt\(A, e\.first\)/, 'and burns the one it turned away from');
  assert.match(u, /if\(ph\.double && !e\.second && e\.t >= W\.gap\)\{ e\.second = otherOf\(e\.first\); sweepAt\(A, e\.second\)/);
  assert.match(u, /e\.portalGate = right && bare\(A, e\) \? 'melee' : 'keel-never'/, 'only a blade from its keel side counts');
  assert.match(u, /\(e\.side === 'down' && !G\.gravityFlipped\) \|\| \(e\.side === 'up' && G\.gravityFlipped\)/);
  assert.match(fnFrom(fi, 'bare'), /if\(e\.struck\) return false;/, 'one mark a cycle');
  assert.match(fnFrom(fi, 'onBlow'), /e\.struck = true/);
  assert.match(fnFrom(fi, 'onBlow'), /A\.marks\+\+; A\.flash = \.4; e\.struck = true; e\.shake = KEEL\.stagger;/);
  assert.doesNotMatch(fi, /'staggered'/, 'a blow never cuts the cycle short: the second sweep and the dive still come');
  const W = K.KEEL.sweep, transit = .82;
  assert.ok(W.gap + W.tell - (W.tell + W.burn) > 0, 'the second sweep never burns while the first still does');
  assert.ok(W.tell > transit - .1, 'a sweep\'s tell is about a flip long');
  assert.ok(K.KEEL.near.floor < M.djDashHigh && K.HALL.roof - (K.KEEL.near.roof + K.KEEL.h) < M.dj, 'within reach of the side it shows');
  assert.match(fnFrom(fi, 'spawnKeel'), /actFoe:'keel', kind:'fly'/, 'drawn the right way up while the world is turned over');
  assert.match(fnFrom(fi, 'update'), /A\.fight && \(p\.dead \|\| p\.x < HALL\.x1 - 20\)\) resetKeel\(A\)/);
  assert.match(fnFrom(fi, 'onBlow'), /kit\.latch\(ZONE, 'fi-keel-' \+ \(A\.phase \+ 1\)\)/, 'a finished act is kept');
  const lintel = walls.find(w => w.actArt === 'lintel');
  assert.ok(lintel && lintel.x === K.HALL.x1 && lintel.y - lintel.h === K.HALL.roof, 'you walk into the hall on the floor');
});

test('both floors in view: a region may cap the camera, and this one does while you stand on the roof', () => {
  assert.match(camera, /const maximumY = finite\(state\.maximumY, Infinity\);/);
  assert.match(camera, /Math\.max\(minimumY, Math\.min\(maximumY, /, 'the floor still wins over the cap');
  assert.match(source, /maximumY:G&&G\.stageIndex>=16&&window\.BladefallActTwo&&BladefallActTwo\.cameraCeiling/);
  assert.match(act, /function cameraCeiling\(p\)\{ const s = stageImpl\(\); return s && s\.cameraCeiling \? s\.cameraCeiling\(p\) : null; \}/);
  assert.match(fnFrom(fi, 'cameraCeiling'), /G\.gravityFlipped/);
});

test('the art is registered: roof and crumble, teeth that hang, the sweeps, the Keel', () => {
  assert.match(art, /ART\.register\(32, /);
  assert.match(fnFrom(art, 'plat'), /case 'crumble':/);
  assert.match(fnFrom(art, 'object'), /o\.actArt === 'teeth'/);
  assert.match(fnFrom(art, 'world'), /A\.sweeps/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'keel'/);
});
