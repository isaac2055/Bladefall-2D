// The Drowned Throne: the last authored region on the critical path, walked west to
// east, and a TWO-boss level — the Void Tyrant did not die in the Citadel and stands
// in the middle of it as the King's right hand.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const world = await read('bladefall-world.js');
const progression = await read('bladefall-progression.js');
const zones = await read('bladefall-zones.js');

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
const fn = n => fnFrom(source, n);
const start = source.indexOf('const ABYSS_KING_LEVEL='),
      end = source.indexOf('\nconst CUSTOM_LEVELS=', start);
assert.ok(start >= 0 && end > start);
const ctors = ['Pl','Gr','GrAt','Wl','Slate','SlateWall','Check','DoorSeal','Plate','Scenery','CoinOb','Sp','Br',
  'Crate','StoryRelic','SealedRecollection','ElementBeat','KingBeat','KingScenery','Seam','Sign',
  'setupRightHand'];   // the real one — build() calls it, so the test runs it for real
const THRONE = Number(/const THRONE_ARENA_X=(\d+)/.exec(source)[1]);
// The beach band's y. It is declared beside two siblings on one line, which the
// generic SHOUT_CASE sweep does not pick up, so the harness names it explicitly.
const BEACH_Y = Number(/THRONE_BEACH_Y=(-?\d+)/.exec(source)[1]);
// An explicit context, not runInNewContext: build() is a closure over this global, so the
// test has to be able to reach in afterwards and stand up a G for it to install into.
const sandbox = vm.createContext({ Math, Object });
const LEVEL = vm.runInContext('const THRONE_ARENA_X=' + THRONE + ';const THRONE_BEACH_Y=' + BEACH_Y + ';\n' +
  ctors.map(fn).join('\n') + '\n' + source.slice(start, end) + ';ABYSS_KING_LEVEL', sandbox);
const at = p => LEVEL.objects.filter(p);

// Run the level's own build() hook against a minimal world and report what it installed.
function runBuild(){
  const spawned = [];
  sandbox.G = { p:{ face:0 }, enemies:[], killGoal:0 };
  // The real spawnEnemy ENDS with G.enemies.push(e). The stub must too, or the test
  // cannot see a build() that pushes him a second time — which is the bug that put
  // the same object in the list twice.
  sandbox.spawnEnemy = (t, x) => {
    const e = { t, x, maxHp:1600, speed:70, shot:{ speed:300, gravity:220, count:1 } };
    spawned.push(e); sandbox.G.enemies.push(e); return e;
  };
  LEVEL.build();
  return { spawned, G:sandbox.G };
}

test('it is registered, walked west to east, and ends at the rail head', () => {
  assert.match(source, /13:ABYSS_KING_LEVEL/, 'stage 13 is no longer procedural');
  assert.equal(LEVEL.spawnX, 240, 'you arrive through the Throne Gate');
  assert.equal(runBuild().G.p.face, 1, 'facing the way you are going');
  assert.equal(LEVEL.physicalExit, 'king-deep-line');
  const seams = new Set(at(o => o.physicalSeam).map(o => o.physicalSeam));
  assert.ok(seams.has('tyrant-king'), 'in at the Throne Gate');
  assert.ok(seams.has('king-deep-line'), 'out at the rail head');
  const gate = at(o => o.physicalSeam === 'king-deep-line')[0];
  assert.ok(gate.x > LEVEL.len - 400, 'and the rail head is the far end');
  assert.equal(LEVEL.len, 18600, 'the finale is the biggest level in the game');
  for(const [lo, hi] of [[0,2400],[2400,5000],[5000,7400],[7400,10600],
                         [10600,13900],[13900,15900]])
    assert.ok(at(o => o.type === 'check' && o.x >= lo && o.x < hi).length >= 1, `room ${lo} has a retry`);
});

test('the boss mechanic is tried once before the boss', () => {
  // The King is beaten by splitting one path into two bodies and standing BOTH on two
  // sigils together. There is no echo until the fight, so the road asks the identical
  // question with the only other second body the knight owns.
  const a = at(o => o.type === 'plate' && o.id === 'throne-marks-a')[0];
  const b = at(o => o.type === 'plate' && o.id === 'throne-marks-b')[0];
  assert.ok(a && b, 'two marks');
  assert.ok(a.followerOnly && a.sendPost, 'one is a companion order');
  assert.ok(!b.followerOnly, 'and one is yours');
  assert.ok(Math.abs(a.x - b.x) > 500, `${Math.round(Math.abs(a.x - b.x))} apart is a span one body could hold`);
  const door = at(o => o.type === 'door' && o.circuit === 'throne-marks')[0];
  assert.ok(door, 'and a door that answers the pair');
  assert.ok(at(o => o.type === 'wall' && Math.abs(o.x - door.x) < 6 && o.y >= 1400).length >= 1, 'sealed above');
  // The AND is real, and it is an AND.
  const co = fn('circuitOpen');
  assert.match(co, /id==='throne-marks'/, 'the circuit is defined');
  assert.match(co, /ps\.length===2&&ps\.every\(o=>o\.pressed\)/, 'and it needs BOTH, at once');
});

test('the Right Hand stands in the hall, with his own geometry', () => {
  // He is pushed in from build(), NOT listed in enemies[] — a boss-type row does not
  // survive the build pass, and when he was authored there he silently never appeared.
  // So this asserts the installation itself, not the source text that describes it.
  assert.equal((LEVEL.enemies || []).filter(e => e.t === 'tyrant').length, 0,
    'no boss row in enemies[] — the build pass drops them');
  const { spawned, G } = runBuild();
  assert.equal(spawned.length, 1, 'one Tyrant, alive');
  const hand = spawned[0];
  assert.equal(hand.t, 'tyrant');
  assert.ok(G.enemies.includes(hand), 'and he is actually in the world');
  assert.equal(G.enemies.filter(e => e === hand).length, 1,
    'exactly ONCE — spawnEnemy already pushed him, so build() must not push again');
  assert.equal(G.killGoal, 1, 'and the hall is not clear until he is');
  assert.ok(hand.rightHandFight, 'wearing his own fight, not the Citadel one');
  assert.ok(hand.noDrop, 'he holds the hall floor');
  const faces = at(o => o.rightHandFace);
  assert.equal(faces.length, 2, 'between two faces');
  for(const f of faces) assert.ok(f.slate, 'both slate — they are mouths, not walls');
  assert.equal(Math.abs(faces[0].x - faces[1].x), 1100, 'the same 1,100 the Citadel used');
  assert.ok(hand.x > Math.min(...faces.map(f => f.x)) && hand.x < Math.max(...faces.map(f => f.x)),
    'and he stands between them');
});

test('he is not worn down: steel only lands while he is open', () => {
  const hit = fn('hitEnemy');
  assert.match(hit, /if\(e\.rightHandFight&&!e\.rightHandDone\)\{/, 'he owns the damage rule');
  assert.match(hit, /if\(!\(e\.rightHandStun>0\)\)\{/, 'and steel does nothing while he stands');
  assert.match(hit, /reflected.*rightHandKnee/s, 'a shot sent back is a knee');
  const upd = fn('updateRightHand');
  assert.match(upd, /type:'warning'/, 'his seam is marked before he takes it');
  assert.match(upd, /rightHandOpen\(e,0\.8,'THROUGH'\)/, 'and he is open on the far end');
  assert.match(upd, /rightHandOpen\(e,0\.55,'THE SEAM'\)/, 'and on this one');
  assert.match(upd, /m\.nx=-m\.nx/, 'a mouth left sitting is TURNED, never deleted');
  // The fuller moveset the proposal promised, not just its spine.
  assert.match(upd, /const stolen=echoWeighs/, 'his seam can be STOLEN by an echo');
  assert.match(upd, /rightHandOpen\(e,1\.6,'WRONG-FOOTED'\)/, 'and he lands wrong-footed');
  assert.match(upd, /n\.kind==='escort'&&n\.state==='wait'/, 'Oren can hold a face');
  assert.match(upd, /rightHandOpen\(e,1\.2,'THE FACE IS HELD'\)/, 'which forces him onto the floor');
  const knee = fn('rightHandKnee');
  assert.match(knee, /e\.rightHandKnees>=3\)rightHandSpent\(e\)/, 'three knees finish him');
  assert.match(fn('rightHandSpent'), /THE THRONE TAKES HIM BACK/, 'and the King spends him, not you');
});

test('the King is telegraphed, deterministic, and heals you every phase', () => {
  assert.match(fn('kingMarkBlink'), /e\.kingSide=-\(e\.kingSide\|\|1\)/, 'the side alternates, never rolls');
  assert.match(fn('kingMarkBlink'), /type:'warning'/, 'and the destination is marked first');
  assert.match(fn('kingResolveBlink'), /e\.kingBlinkShoot\)\{e\.shootT=/, 'the volley is a beat after the arrival');
  assert.match(fn('kingPhaseReset'), /restoreBlood\(G\.p,Infinity\)/, 'every phase starts whole');
  assert.match(fn('kingRetreats'), /meta\.kingRetreated=true/, 'he retreats rather than dies');
  const chase = fn('updateKingChase');
  for(const beat of ["'caught'", "'clash'", "'done'"]) assert.match(chase, new RegExp(beat));
  assert.match(chase, /oren\.dead=true/, 'and the clash takes Oren with him');
});

test('the Gilded Vault is gone and the line comes out under the Keep', () => {
  assert.doesNotMatch(world, /'gilded-vault', 14/, 'not a world node');
  assert.doesNotMatch(progression, /\['gilded-vault', 14/, 'not a zone');
  assert.match(progression, /connector\('king-deep-line', 'abyss-king', 'deep-line'/);
  assert.match(progression, /connector\('deep-line-keep', 'deep-line', 'ruined-keep'/);
  assert.match(zones, /'deep-line-keep', 'deep-line', 'east'[\s\S]*?'ruined-keep', 'east'/);
  assert.match(source, /const VAULT_ROUTE_OPEN=false/, 'and its door opens on nothing');
});

test('the region has two acts, one verb each, and asks for both', () => {
  // ACT I is HIS seams — you learned the verb in the Citadel and here it is timed.
  // COUNT IS NOT THE MEASURE — spread and necessity are. The room-1 seam was cut
  // because both its ends sat on the same bank, which made it a flourish beside the
  // road; `tests/necessity.test.mjs` is what proves the survivors are load-bearing.
  const seams = at(o => o.type === 'seam');
  assert.ok(seams.length >= 5, `${seams.length} seams is not a developed verb`);
  assert.ok(seams.some(o => !o.period), 'one is steady, to restate the verb safely');
  assert.ok(seams.filter(o => o.period).length >= 3, 'and the rest are on a clock');
  const systems = new Set(seams.map(o => o.elementalActSystem));
  assert.ok(systems.size >= 3, `seams live in ${systems.size} sections; a verb used once is a gimmick`);
  assert.ok(seams.some(o => o.x > 13900), 'and it is still asked for at the exam');

  // ACT II is YOUR echo: a second body that weighs a mark you are nowhere near.
  const echoMarks = at(o => o.type === 'plate' && o.echoOnly);
  assert.ok(echoMarks.length >= 3, `${echoMarks.length} echo marks is not a developed verb`);
  // Each mark must open something: either a door named for it, or — for the two-mark
  // AND — a door on the circuit it is one half of. A mark that opens nothing is scenery.
  const doorCircuits = new Set(at(o => o.type === 'door').map(o => o.circuit));
  for(const m of echoMarks){
    const own = doorCircuits.has(m.id);
    const shared = [...doorCircuits].some(c => m.id.startsWith(c));
    assert.ok(own || shared, `the echo mark ${m.id} opens nothing`);
  }
  // The first door of the region needs BOTH kinds of second body at once, which is
  // the King's entire sentence rehearsed at walking pace.
  const a = at(o => o.id === 'throne-marks-a')[0], b = at(o => o.id === 'throne-marks-b')[0];
  assert.ok(a.followerOnly && a.sendPost, 'one is Oren, commanded');
  assert.ok(b.echoOnly, 'and one is you, left behind');
  assert.ok(!b.followerOnly, 'the echo mark is not answerable by the companion');

  // The slam is the road, not a lid on a loot box.
  const slam = at(o => o.throneSlamFloor)[0];
  assert.ok(slam && slam.brittle, 'a brittle span carries the road');
});

test('the echo is a real verb: bound, gated, and it weighs', () => {
  assert.match(source, /echo:'KeyQ'/, 'it has a key');
  assert.match(source, /echo:'Leave \/ Recall Echo'/, 'and a rebindable label');
  const avail = fn('echoVerbAvailable');
  assert.match(avail, /G\.stageIndex===13/, 'the Throne owns it');
  assert.match(avail, /G\.echoTrial&&G\.echoTrial\.active/, "and it yields to the King's own trial");
  const leave = fn('leaveEcho'), recall = fn('recallEcho');
  assert.match(leave, /G\.echoBody=\{/, 'leaving stands a body up');
  assert.match(recall, /p\.x=e\.x;p\.y=Math\.max\(0,e\.y\)/, 'recall TRADES places');
  assert.match(recall, /G\.echoCd=ECHO_COOLDOWN/, 'and it costs the echo to do it');
  assert.match(fn('echoWeighs'), /echoStanding\(\)/, 'a standing echo has weight');
  assert.match(fn('updateObstacles'), /o\.echoOnly\)\{/, 'and a mark can demand it');
  assert.match(fn('updateEcho'), /e\.life-=dt/, 'it is on a clock');
  /*   AND THE PLAYER IS TOLD IT EXISTS. This is the assertion whose absence shipped an
     unopenable region: the suite proved the verb was bound, gated and weighed, and never
     that anything hands it over. Three doors here are gated on it, ordinary hint signs
     are deliberately not drawn in this game, and the HUD already said "ECHO" for the
     unrelated equipment system — so without a rite the region asks for a verb it never
     gave. The Inversion's gravity-flip anchor is the pattern being matched. */
  assert.match(fn('claimThroneEchoRite'), /showOutskirtsAnnotation/, 'a card names the verb');
  assert.match(fn('claimThroneEchoRite'), /keyLabel\(kbCode\('echo'\)\)/, 'and prints its actual key');
  assert.match(fn('updateThroneEchoRite'), /throneEchoRite/, 'and walking to the rite triggers it');
  const rite = at(o => o.throneEchoRite)[0];
  assert.ok(rite, 'the rite is placed in the world');
  const firstEchoMark = at(o => o.type === 'plate' && o.echoOnly).sort((a, b) => a.x - b.x)[0];
  assert.ok(rite.x < firstEchoMark.x, 'and it stands BEFORE the first door that needs it');
  // The HUD must not leave the verb invisible either.
  assert.match(source, /echoVerbTag/, 'the HUD carries an echo tag');
});

test('the Throne is inside the respec, and wears its own furniture', () => {
  // 15 since 2026-09-21: the Deep Line came inside too, so the whole critical path
  // plays by v4 rules. What matters here is that the Throne is under the boundary.
  const boundary = Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]);
  assert.ok(boundary >= 13, `V4_LAST_STAGE=${boundary} leaves the finale outside the respec`);
  // AND THE RENDERER HAS TO BE ASKED. useRespecRenderer() gates on
  // BFRespecRenderer.supports(stageIndex); with 13 missing from SUPPORTED_STAGES the
  // whole stage was drawn by the LEGACY renderer, so no art added here could appear —
  // the literal meaning of "the Abyss King level is not respec'd".
  const renderer = readFileSync(new URL('../public/bladefall-respec-renderer.js', import.meta.url), 'utf8');
  const set = /const SUPPORTED_STAGES = new Set\(\[([^\]]*)\]\)/.exec(renderer)[1];
  assert.ok(set.split(',').map(n => Number(n.trim())).includes(13),
    'the respec renderer must claim stage 13 or none of its art is reachable');
  assert.match(renderer, /function drawThroneProp/, 'the Throne has prop art');
  assert.match(renderer, /function drawKingFigure/, 'and the King his own figure');
  assert.match(renderer, /curG\.stageIndex === 13 && drawThroneProp/, 'dispatched for the stage');
  assert.match(renderer, /e\.type === 'king' && !e\.dead\) return drawKingFigure/, 'and for the boss');
  // The echo silhouette must NOT be inside the additive particle pass: 'lighter'
  // blending sums a mid-tone body over a near-black room to nothing.
  const echoCall = renderer.indexOf('drawEchoBody(G);');
  const particlePass = renderer.indexOf("globalCompositeOperation = 'lighter'; drawParticles(G)");
  assert.ok(echoCall > 0 && particlePass > 0 && echoCall < particlePass,
    'the echo draws before the additive particle pass, not inside it');
  // Outside it, killEnemy rolled random gear, paid legacy crafting and dropped a
  // boss chest key — the Tyrant's legendary fault, applied to the whole level.
  assert.match(fn('killEnemy'), /G\.stageIndex>V4_LAST_STAGE\)rollDrop/, 'drops are boundary-gated');
  assert.match(fn('fieldLoadoutActive'), /v4Region\(G\.stageIndex\)/, 'and so is the field loadout');
  // And it is no longer dressed in the Citadel's props.
  const props = at(o => o.type === 'scenery' || o.roomLandmark);
  assert.ok(props.length > 0);
  for(const o of props)
    assert.ok(!/^citadel-/.test(o.kind || ''), `${o.kind} is the Citadel's furniture, not the Throne's`);
  assert.ok(props.some(o => /^throne-/.test(o.kind || '')), 'the Throne has its own');
});

/* SECOND PASS ON THE FINALE, 2026-09-21. Owner, after playing the first one:
   "abyss king is too powerful still: put him further back so player has room to avoid
   his shots, and make them more spread out and less frequent so there is time to dodge
   and setup the winning echo moves. Also, an artifactual portal appears after beating
   him, which should be cut."
     These are measured in-engine by tests/king-cadence.test.mjs; what is asserted here
   is that the three causes stay removed, because each was a line that quietly undid a
   fix somewhere else in the same function. */
test('the King holds the back of his hall, on one clock, and leaves no portal behind', () => {
  const ai = fn('update');   // the King's AI lives inside the main update(dt)
  // 1. THE STATION. bossX-260 put him 40 units off the nearest echo panel (-300), in
  //    the middle of the floor the trial makes the player work on.
  assert.match(ai, /e\.kingStation=Math\.max\(e\.echoArenaL\+120,Math\.min\(e\.echoArenaR-120,e\.x\+160\)\)/,
    'he stations at the east clamp, not mid-arena');
  assert.match(ai, /e\.x=e\.kingStation;e\.vx=0;e\.lunge=0;/, 'and is pinned there, not merely slowed');
  // 2. ONE CLOCK. A per-phase `summonT` burst fired alongside the stationed volley on a
  //    period that did not divide it; standing still in phase 1 the measured gaps were
  //    2.4, 0.82, 2.0, 1.22, 1.6, 1.77 — a metronome with no rest in it.
  const kingBlock = ai.slice(ai.indexOf("if(e.type==='king'){"), ai.indexOf('// === ENRAGE at <50% HP'));
  assert.ok(kingBlock.length > 200, 'found the King block');
  assert.equal(/e\.summonT<=0\)\{e\.summonT=[\d.]+;[^}]*bossShoot/.test(kingBlock), false,
    'no second firing clock: the phases change the volley SHAPE, not its rate');
  assert.equal(/e\.shootCd=1\.05/.test(kingBlock), false,
    'and phase 3 no longer overwrites the cadence it was given');
  // 3. THE SHAPE. Wider than stock (0.22) at every phase, so a volley has gaps in it.
  assert.match(source, /e\.shot=Object\.assign\(\{\},e\.shot,\{spread:0\.52\}\);\s*\n\s*e\.shootCd=3\.2;/,
    'the fight opens wide and slow');
  assert.match(kingBlock, /e\.shot\.count=4;e\.shot\.spread=0\.48;/, 'phase 2 adds a bolt, stays wide');
  assert.match(kingBlock, /e\.shot\.count=5;e\.shot\.spread=0\.44;e\.shot\.speed=410;/, 'phase 3 likewise');
  // 4. NO PORTAL. killEnemy spawns a completion portal for every boss NOT named in one
  //    exclusion list, and the King was missing from it — so felling him dropped an
  //    orange exit portal in a level whose way on is a seam.
  const kill = fn('killEnemy');
  assert.match(kill, /\(e\.type==='king'&&G\.stageIndex===13\)\)G\.portal=null;/,
    'the Abyss King is excluded from the completion portal');
});
