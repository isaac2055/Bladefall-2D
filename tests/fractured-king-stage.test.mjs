// The Fractured King: Act Three's fourteenth echo (stage 34). A B-side of the Drowned Throne with no Oren and no
// Right Hand: the First Mark (a mark only the echo weighs holds the gate beside it), the Return (a plate far below a
// gate holds it for a breath; only the echo left at the gate brings you back in time), Two Marks at Once (the echo's
// mark behind you, yours past a gauntlet, a span that comes while both are weighed) — and a C-side: the Weighed
// Crown (weigh both marks and it is pulled onto your echo; trade places and strike).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fk = read('bladefall-fractured-king.js');
const art = read('bladefall-fractured-king-art.js');
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
  + '\n' + act + '\n' + core + '\n' + fk, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FK = sandbox.window.BladefallFracturedKing;
const K = FK.constants;
const L = ACT.level(34);
// Measured (7.214, scripted input in the browser): a run 211; a double jump 147 (a jump + dash 191); the echo lasts
// 14 s (ECHO_LIFE); a trade is instant. A clean run of Two Marks at Once takes ~7 s after the echo is left.
const M = { run:211, dj:147, djDash:191, echoLife:14 };
const plates = L.objects.filter(o => o.type === 'plate');
const bars = (id) => L.objects.find(o => o.actBars === id);

test('stage 34 is registered everywhere a stage must be, as Act Three, with the Echo', () => {
  assert.match(source, /34:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(34\):null\)/);
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b34\b[^\]]*\]\)/);
  assert.match(source, /34:Object\.freeze\(\{id:'fractured-king-road',src:'\.\/audio\/music\/fractured-the-black-procession\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-the-black-procession.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-a-crown-of-ashes.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured King'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['ft-fk', 'fractured-tyrant', 'east', 'walk', 0\.5, 'fractured-king', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(13), 34);
  assert.match(fnFrom(fk, 'seamSpec'), /connector:'ft-fk', zone:ZONE, targetStage:33/);
  assert.match(fnFrom(fk, 'seamSpec'), /A\.crowned \? F\.seamOn\(STAGE, ZONE, 'fk-fl', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-tyrant.js'), 'arrival'), /plan\.connectorId === 'ft-fk'/);
  assert.match(fnFrom(fk, 'update'), /THE FRACTURED LINE/);
  assert.ok(L.echoVerb && L.authoredEcology);
  assert.match(fnFrom(source, 'echoVerbAvailable'), /G\.stageIndex===13/);
  assert.match(fnFrom(source, 'echoVerbAvailable'), /CUSTOM_LEVELS\[G\.stageIndex\]\.echoVerb/, 'a level may ask for the Throne\'s verb');
  assert.match(renderer, /case 'plate': if\(o\.actArt && ext\('object', o\)\) break; drawPlate\(o\);/);
});

test('THE THRONE\'S KIT: everything through the gravity flip, and the Echo from the first step', () => {
  assert.match(fnFrom(fk, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',\s*'companion-command', 'downward-strike', 'gravity-flip'\]/);
  assert.doesNotMatch(fk, /F\.grant\(/);
});

test('THE FIRST MARK: only the echo weighs it; passing lets the echo go', () => {
  const m = plates.find(o => o.id === 'fk-first');
  assert.ok(m.echoOnly && !m.latch);
  assert.ok(bars('first').x - m.x < 200 && bars('first').h >= 600, 'the gate beside it, full height');
  assert.match(fnFrom(fk, 'road'), /setBars\('first', A\.firstDone \|\| !!first\.pressed\)/);
  assert.match(fnFrom(fk, 'road'), /A\.firstDone = true; kit\.latch\(ZONE, 'fk-first'\); release\(FIRST\.mark\)/,
    'an echo still standing behind you would turn the next press into a trade back to it');
});

test('THE RETURN: the plate holds the gate a breath; only the trade gets you back up in one', () => {
  const R = K.RETURN, p = plates.find(o => o.id === 'fk-return');
  assert.ok(!p.echoOnly && !p.latch && p.x > R.hole[0] && p.x < R.hole[1], 'your own plate, straight under the hole');
  assert.ok(R.ledge.y > M.djDash + 44, 'no jump back up through the hole');
  const wall = L.objects.find(o => o.type === 'wall' && o.actArt === 'wall');
  assert.ok(wall.noCling && wall.slickL && wall.slickR && wall.y >= R.ledge.y - 20, 'the room below is closed and wet');
  // The long way: back west to the stair, up two steps and the ledge, east to the gate.
  const walk = (p.x - R.stair[0][0]) + (R.gate - R.stair[0][0]);
  assert.ok(walk / M.run > R.hold * 3, `the stair route (${(walk / M.run).toFixed(1)} s) is far longer than the hold (${R.hold} s)`);
  let prev = 0; for(const [, , y] of R.stair.concat([[0, 0, R.ledge.y]])){ assert.ok(y - prev < M.dj - 20, 'each rise a double jump'); prev = y; }
  assert.match(fnFrom(fk, 'road'), /if\(ret && ret\.pressed\) A\.returnT = RETURN\.hold; else A\.returnT = Math\.max\(0, A\.returnT - dt\);/);
});

test('TWO MARKS AT ONCE: the span comes only while both are weighed together, inside the echo\'s life', () => {
  const e = plates.find(o => o.id === 'fk-marks-echo'), k = plates.find(o => o.id === 'fk-marks-knight');
  assert.ok(e.echoOnly && !k.echoOnly && k.x > e.x);
  assert.match(fnFrom(fk, 'road'), /if\(e && k && e\.pressed && k\.pressed\)\{\s*A\.spanned = true;[^}]*release\(MARKS\.echo\)/);
  const spans = L.objects.filter(o => o.fkSpan);
  assert.ok(spans.length && spans.every(o => o.gone), 'the span is not there until then');
  assert.ok(K.MARKS.bridge.x1 - K.MARKS.bridge.x0 > 677, 'and nothing else crosses');
  // Run to the tear, wait at worst a whole beat, ride it (1150), run on through the teeth to your mark.
  const T = K.MARKS.tear, ride = (T.bx - T.ax) / 1150, run = ((T.ax - K.MARKS.echo) + (K.MARKS.knight - T.bx)) / M.run;
  const best = run + ride + T.period;
  assert.ok(best < M.echoLife - 3, `a clean run fits the echo's life with room (${best.toFixed(1)} s; the bot took ~10 with its waits at the teeth)`);
});

test('THE WEIGHED CROWN: pulled onto your echo, struck after the trade; it breaks the echoes it sees', () => {
  assert.ok(K.CROWN.phases.every(ph => ph.marks === 2));
  const u = fnFrom(fk, 'updateCrown');
  assert.match(u, /if\(em && km && em\.pressed && km\.pressed\)\{ e\.st = 'pulled'; e\.t = 0; e\.tx = em\.x; \}/, 'onto the echo\'s mark');
  assert.match(u, /e\.portalGate = e\.st === 'kneel' && !e\.struck \? 'melee' : 'crown-never'/, 'only while it kneels, once');
  assert.ok(K.CROWN.hoverY > M.djDash + 44, 'hung out of reach');
  for(const ph of K.CROWN.phases.filter(p => !p.perch)) assert.ok(ph.apart / M.run > K.CROWN.kneel, 'too far to walk to while it kneels: trade');
  assert.match(u, /if\(!echo \|\| e\.st !== 'hover'\) A\.breakT = 0;/, 'an echo stands here a while, and never breaks while the crown is down');
  assert.match(fnFrom(fk, 'breakers'), /if\(A\.crown && A\.crown\.st !== 'hover'\) A\.breakers = \[\];/);
  assert.match(fnFrom(fk, 'layMarks'), /ex = perch\.x - side \* 420/, 'in the last act the echo\'s mark is on the perch\'s side: a walk and a climb inside the echo\'s time');
  for(const s of K.HALL_STEPS){ const perch = K.HALL_PERCHES.find(q => Math.abs(q.x - s.x) < 250); assert.ok(s.y < M.dj - 20 && perch.y - s.y < M.dj - 20); }
  assert.match(fnFrom(fk, 'update'), /A\.fight && \(p\.dead \|\| p\.x < HALL\.x1 - 20\)\) resetCrown\(A\)/);
  assert.match(fnFrom(fk, 'struck'), /kit\.latch\(ZONE, 'fk-crown-' \+ \(A\.phase \+ 1\)\)/);
  assert.match(fnFrom(fk, 'spawnCrown'), /actFoe:'crown', kind:'fly'/);
});

test('the art is registered: the two kinds of mark, the span, the Crown, the blow at your echo', () => {
  assert.match(art, /ART\.register\(34, /);
  assert.match(fnFrom(art, 'object'), /o\.type === 'plate' && o\.actArt === 'mark'/);
  assert.match(fnFrom(art, 'plat'), /case 'span':/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'crown'/);
  assert.match(fnFrom(art, 'overlay'), /A\.breakers/);
});
