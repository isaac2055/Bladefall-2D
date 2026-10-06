// The Fractured Tyrant: Act Three's thirteenth echo (stage 33). A B-side of the Citadel walked west to east: the
// Torn Road (one tear across a void), the Blinking Chain (three tears opening in turn, chained in the air), the Spent
// Line (both mouths on a raised slate face; a tear ridden into the lower throws you over the teeth from the upper) —
// and a C-side: the Tearer (it cannot be cut; ride its own tear through it: from the floor, from a perch, off a lift).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const ft = read('bladefall-fractured-tyrant.js');
const art = read('bladefall-fractured-tyrant-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam', 'Trap'].map(n => fnFrom(source, n)).join('\n')
  + '\n' + act + '\n' + core + '\n' + ft, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FT = sandbox.window.BladefallFracturedTyrant;
const K = FT.constants;
const L = ACT.level(33);
// Measured (7.213, scripted input in the browser): two dashes 677 far; a double jump 147; a tear rides at 1150 and
// throws you on at 640, the dash back only after 0.28 s; a tear ridden into a mouth on the face throws you out of the
// other ~2050 on, landing 7284-7341 wherever the upper mouth sits (300-520).
const M = { twoDash:677, dj:147, seamSpeed:1150, exit:640, flung:.28, flingLand:[7284, 7341] };
const seams = L.objects.filter(o => o.type === 'seam');

test('stage 33 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /33:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(33\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b33\b[^\]]*\]\)/);
  assert.match(source, /33:Object\.freeze\(\{id:'fractured-tyrant-road',src:'\.\/audio\/music\/fractured-paradox-void-assault\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-paradox-void-assault.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-heat-of-battle.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Tyrant', len: 10000[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fi-ft', 'fractured-inversion', 'east', 'walk', 0\.5, 'fractured-tyrant', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(12), 33);
  assert.match(fnFrom(ft, 'seamSpec'), /connector:'fi-ft', zone:ZONE, targetStage:32/);
  assert.match(fnFrom(ft, 'seamSpec'), /A\.torn \? F\.seamOn\(STAGE, ZONE, 'ft-fk', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-inversion.js'), 'arrival'), /plan\.connectorId === 'fi-ft'/);
  assert.match(fnFrom(ft, 'update'), /THE FRACTURED KING/);
  assert.ok(L.authoredEcology, 'no seeded variant enemies on the tears\' perches');
});

test('THE CITADEL\'S KIT: everything through the gravity flip; nothing waits here', () => {
  assert.match(fnFrom(ft, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',\s*'companion-command', 'downward-strike', 'gravity-flip'\]/);
  assert.doesNotMatch(ft, /F\.grant\(/);
  assert.ok(!L.flip, 'like its original, the Citadel never turns the flip on');
});

test('THE TORN ROAD and THE BLINKING CHAIN: only a tear crosses; the tears open in turn at your own pace', () => {
  const gap = (a, b) => { const g = K.GROUND, x = (a + b) / 2; for(let i = 0; i < g.length - 1; i++) if(g[i][1] <= x && g[i + 1][0] >= x) return g[i + 1][0] - g[i][1]; return 0; };
  assert.ok(gap(K.ROAD_TEAR.ax, K.ROAD_TEAR.bx) > M.twoDash + 200, 'the road void outruns two dashes');
  const chain = FT.chainTears();
  assert.ok(gap(chain[0].ax, chain[chain.length - 1].bx) > 2 * M.twoDash, 'the chain void too');
  const ride = K.CHAIN.len / M.seamSpeed, flight = K.CHAIN.gap / M.exit;
  assert.ok(Math.abs(K.CHAIN.lag - (ride + flight)) < .1, `each tear opens as a knight off the last arrives (${(ride + flight).toFixed(2)} s)`);
  assert.ok(K.CHAIN.upT < 1, 'a strict window: go as the first opens (measured 0.6 s)');
  assert.ok(K.CHAIN.gap / M.exit > M.flung, 'the next mouth lies beyond the dash lock');
  for(let i = 1; i < chain.length; i++) assert.ok(chain[i - 1].ay - chain[i].ay <= 72, 'each mouth within reach of a knight falling off the last');
  const top = L.objects.filter(o => o.actArt === 'ledge' && o.x < 3000).sort((a, b) => a.y - b.y);
  let prev = 0; for(const s of top){ assert.ok(s.y - prev < M.dj - 20, 'each step a double jump with room'); prev = s.y; }
  assert.ok(Math.abs(prev + 22 - K.CHAIN.y0) <= 26, 'the first mouth at the top step\'s dash height');
});

test('THE SPENT LINE: both mouths on the face; the tear into the lower throws you over the teeth', () => {
  const face = L.objects.find(o => o.actArt === 'face');
  assert.ok(face.slate && face.y - face.h === K.FACE.bottom && K.FACE.bottom > 44, 'raised slate: walked under, clung to');
  assert.ok(K.LINE_TEAR.ax > K.LINE_TEAR.bx && Math.abs(K.LINE_TEAR.bx - (K.FACE.x + K.FACE.w / 2)) < 20, 'the tear runs back into the face');
  assert.ok(K.LINE_TEAR.ay > K.FACE.bottom + 17, 'at a height a clinging knight can set a mouth');
  assert.ok(K.BED.x1 - K.BED.x0 > 800 + M.twoDash / 2, 'no jump crosses the teeth');
  assert.ok(M.flingLand[0] > K.BED.x1 + 200 && M.flingLand[1] < K.HALL.x1 - 300, 'the throw lands clear of the teeth and short of the hall');
  assert.ok(L.objects.filter(o => o.type === 'spikes' && o.actArt === 'teeth').every(o => o.decorative), 'the teeth are drawn...');
  assert.match(fnFrom(ft, 'update'), /p\.y < 12 && p\.x > BED\.x0 \+ 6 && p\.x < BED\.x1 - 6\)\{ try\{ hurtPlayer\(0, 1, false\);/, '...and touching them is a fall');
});

test('THE TEARER: only a tear passes through it; three ways to reach the mouth', () => {
  assert.equal(K.TEARER.phases.map(ph => ph.how).join(), 'floor,perch,chain');
  assert.ok(K.TEARER.phases.every(ph => ph.marks === 2));
  const u = fnFrom(ft, 'updateTearer');
  assert.match(u, /e\.portalGate = 'tearer-never'/, 'steel finds nothing');
  assert.match(u, /r\.o\.ftyHeart && !r\.o\.ftyStruck && Math\.abs\(p\.x - e\.x\)/, 'ridden through: the blow, once a tear');
  assert.match(u, /case 'tell':\s*if\(e\.t >= TEARER\.tell\)\{ for\(const t of A\.tears\) t\.spent = false;/, 'the tear shows (spent) before it opens');
  const o = fnFrom(ft, 'openTear');
  assert.match(o, /Seam\(nx, 30, top, cy - 10, \{ ftyLift:1, once:true \}\)/, 'the lift is spent, or its own top end takes the dash back');
  assert.match(o, /Seam\(top \+ dir \* 100, cy, /, 'the heart\'s mouth beyond the lift\'s capture');
  for(const s of K.PERCH_STEPS){ const perch = K.PERCHES.find(q => Math.abs(q.x - s.x) < 200); assert.ok(s.y < M.dj - 20 && perch.y - s.y < M.dj - 20, 'step and perch each a double jump'); }
  assert.match(fnFrom(ft, 'update'), /A\.fight && \(p\.dead \|\| p\.x < HALL\.x1 - 20\)\) resetTearer\(A\)/);
  assert.match(fnFrom(ft, 'mark'), /kit\.latch\(ZONE, 'fty-tear-' \+ \(A\.phase \+ 1\)\)/, 'a finished act is kept');
  assert.match(fnFrom(ft, 'spawnTearer'), /actFoe:'tearer', kind:'fly'/);
});

test('the Fractured core: a mustered body with no patrol keeps a real x', () => {
  assert.match(fnFrom(core, 'muster'), /musterMin:e\.patrolMin \?\? e\.x - 240, musterMax:e\.patrolMax \?\? e\.x \+ 240/);
  assert.match(source, /e\.x=Math\.max\(e\.musterMin,Math\.min\(e\.musterMax,e\.x\)\)/, 'the engine clamps to them every frame');
});

test('the art is registered: the face, the teeth, the tell, the Tearer', () => {
  assert.match(art, /ART\.register\(33, /);
  assert.match(fnFrom(art, 'object'), /o\.actArt === 'face'/);
  assert.match(fnFrom(art, 'object'), /o\.type === 'seam' && o\.ftyDyn && o\.spent/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'tearer'/);
  assert.ok(seams.length >= 5);
});
