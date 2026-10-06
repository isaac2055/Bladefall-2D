// The Landing Shores: Act Two's second region (stage 17). The Chainhook across a gut and up
// a stranded hull; the tide that is a road at low water and footing at high; three fights
// driven by a bell; and at the Colony Gate the act's one choice. These tests pin the
// numbers each of those claims rests on.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const shores = read('bladefall-landing-shores.js');
const art = read('bladefall-landing-shores-art.js');
const actArt = read('bladefall-act-two-art.js');
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
const sandbox = vm.createContext({ Math, Object, JSON, window:{} });
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Seam', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + shores, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const SH = sandbox.window.BladefallLandingShores;
const K = SH.constants;
const L = ACT.level(17);
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
const ring = (id) => one(o => o.actId === 'ring-' + id);
const REACH = { flat:671, dropped:774, jumpRise:82, doubleJumpRise:147 };   // measured, full kit
const HOOK = ACT.kit.HOOK_RANGE;
const centre = (x, y) => ({ x, y:y + 22 });                 // a standing knight's centre
const hang = (r) => ({ x:r.x, y:r.y - 58 + 22 });           // the centre of a knight hanging on a ring
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('stage 17 is registered everywhere a stage must be', () => {
  assert.match(source, /17:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(17\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 17);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b17\b[^\]]*\]\)/);
  assert.match(source, /17:Object\.freeze\(\{id:'shores-broken-ships'/, 'LEVEL_MUSIC');
  for(const f of ['the-shore-of-broken-ships', 'safe-harbor', 'the-last-spark-of-darrow', 'the-breaking-of-the-keeps'])
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
  assert.match(source, /<script src="bladefall-landing-shores\.js\?v=[\d.]+"><\/script>/);
  assert.match(source, /<script src="bladefall-landing-shores-art\.js\?v=[\d.]+"><\/script>/);
  assert.ok(source.indexOf('bladefall-act-two.js?v=') < source.indexOf('bladefall-landing-shores.js?v='), 'the region registers with the act, so it loads after it');
  assert.equal(L.portal, null);
  assert.equal(L.authoredEcology, true);
  assert.equal(L.len, 12800);
  assert.ok(ACT.handles(17));
});

test('the page hands stage 17 to the act at every seam it needs', () => {
  assert.match(source, /if\(e\.actFoe&&window\.BladefallActTwo\)\{BladefallActTwo\.updateFoe\(e,p,dt\);continue;\}/, 'its foes');
  assert.match(source, /if\(G\.stageIndex>16&&window\.BladefallActTwo\)BladefallActTwo\.swing\(p,w\);/, 'a blade on someone who is not a foe');
  assert.match(fnFrom(source, 'hudUpdate'), /BladefallActTwo\.hud\(bloodMeasures,p\)/, 'grey measures');
  assert.match(fnFrom(source, 'cameraMinimumY'), /BladefallActTwo\.cameraFloor\(p\)/, 'a camera that stands on the shelf you are on');
  assert.match(fnFrom(source, 'updraftsVoidFloor'), /G\.stageIndex>16&&window\.BladefallActTwo\)return BladefallActTwo\.voidFloor\(p\)/);
  assert.match(fnFrom(source, 'compatibilityZoneArrival'), /BladefallActTwo\.arrivalFor\(plan\)/);
  assert.match(source, /belled:\{hp:\d+,dmg:\d+,speed:\d+/);
  assert.match(source, /sunguard:\{hp:\d+,dmg:\d+,speed:\d+/);
  assert.match(fnFrom(act, 'updateCastOff'), /crossTo\('cliffs-landing', 'thunder-cliffs', CLIFFS \+ 1\)/, 'the helm sails on to the shore');
  assert.match(renderer, /case 'wall': if\(o\.actArt && ext\('object', o\)\) break;/);
  assert.match(renderer, /x\.hero\(EXT_API, p\)/, 'the white flower is drawn on the knight');
});

test('THE WRECK LINE: the gut and the hull gate on the Chainhook, and every hop is in range', () => {
  assert.ok(K.GUT.x2 - K.GUT.x1 > 800, `the gut is ${K.GUT.x2 - K.GUT.x1} wide: no jump crosses it`);
  const lip = centre(K.GUT.x1 - 10, K.STRAND_Y);
  assert.ok(dist(lip, ring('gut-a')) <= HOOK, 'the strand lip reaches the first mast ring');
  assert.ok(dist(lip, ring('gut-b')) > HOOK, 'but not the second');
  assert.ok(dist(hang(ring('gut-a')), ring('gut-b')) <= HOOK, 'mast to mast');
  assert.ok(K.GUT.x2 - ring('gut-b').x < 280, 'from the second ring a jump and a double jump make the far lip, no dash needed');
  // (A knight who jumps out of the first hang with a perfect dash can make the far lip: that is
  // mastery of the hook's jump-out, not a way round the hook — the gut itself is 980.)
  // The hull: 400 of wall with no face to climb, a ring off the stern and one on deck.
  const faces = objs(o => o.type === 'wall' && (o.x === K.HULL.x1 || o.x === K.HULL.x2));
  assert.equal(faces.length, 2);
  for(const f of faces){ assert.ok(f.slickL && f.slickR && f.noCling, 'coated both sides'); assert.equal(f.y, K.HULL.deck); }
  assert.ok(K.HULL.deck - K.STRAND_Y > REACH.doubleJumpRise + 200, 'the deck is far past a double jump');
  const under = centre(K.HULL.x1 - 20, K.STRAND_Y);
  assert.ok(dist(under, ring('hull-a')) <= HOOK && dist(under, ring('hull-b')) > HOOK, 'the stern ring from the strand, the deck ring only from a hang');
  assert.ok(dist(hang(ring('hull-a')), ring('hull-b')) <= HOOK);
  assert.ok(ring('hull-b').x > K.HULL.x1 && ring('hull-b').x < K.HULL.x2 && ring('hull-b').y - 58 > K.HULL.deck, 'letting go of the deck ring lands you on the deck');
});

test('THE TIDE: low water is a road, high water is footing, and neither alone crosses the flats', () => {
  const T = K.TIDE, period = T.lowT + T.floodT + T.highT + T.ebbT;
  let dry = 0; for(let t = 0; t < period; t += 0.05) if(SH.tideAt(t) < K.SWEPT_DEPTH) dry += 0.05;
  const run = (K.REFUGE.x1 - K.BASIN.x1) / 245;             // measured ground speed ~245
  assert.ok(dry > run + 3, `the sand is dry ${dry.toFixed(1)} s a cycle; the run to the refuge takes ${run.toFixed(1)} s`);
  assert.ok(T.high < K.STRAND_Y && T.high < K.REFUGE.deck && T.high < K.JETTY.y, 'the strand, the refuge deck and the jetty stand over the highest water');
  assert.equal(SH.tideAt(0), T.low); assert.equal(SH.tideAt(T.lowT + T.floodT + 1), T.high);
  // The refuge: over the high water, walled, and reached from the sand only by its ring.
  assert.ok(K.REFUGE.deck - REACH.doubleJumpRise > 0 + 90, 'no jump from the sand reaches the refuge deck');
  assert.ok(dist(centre(K.REFUGE.x1 - 15, 0), ring('refuge')) <= HOOK, 'its mast ring does');
  // The floats: footing only when the sea lifts them.
  const [f1, f2] = K.FLOATS, high = T.high + K.FLOAT_FREEBOARD, low = K.FLOAT_FREEBOARD;
  assert.ok(K.JETTY.y - high < REACH.doubleJumpRise - 25, `a float at high water is ${K.JETTY.y - high} under the jetty`);
  assert.ok(K.JETTY.y - low > REACH.doubleJumpRise + 100, 'at low water the jetty is out of reach');
  assert.ok(K.JETTY.x1 - (f2.x + f2.w / 2) < 140, 'the last float is close under the jetty');
  assert.ok((f2.x - f2.w / 2) - (f1.x + f1.w / 2) < 200 && (f1.x - f1.w / 2) - K.REFUGE.x2 < 200, 'float to float is a jump');
  assert.ok(K.JETTY.x1 - K.REFUGE.x2 > 800, 'without the floats the refuge is past every jump from the jetty');
  // The flats' east wall under the jetty refuses cling: low water cannot climb to the court.
  const court = one(o => o.type === 'wall' && o.x === K.COURT.x1);
  assert.ok(court.slickL && court.slickR && court.noCling);
  assert.match(shores, /Water is not dodged/);
});

test('THE BELL: three fights, each walled in, and its bars stand between you and any ring', () => {
  const bars = objs(o => o.actBars);
  assert.equal(JSON.stringify(bars.map(b => b.actBars).sort()), JSON.stringify(['bell-gate', 'sun-arch']));
  assert.equal(bars.find(b => b.actBars === 'sun-arch').gone, false, 'the landing is barred when you arrive');
  assert.equal(bars.find(b => b.actBars === 'bell-gate').gone, true);
  for(const b of bars) assert.ok(b.y - b.h === K.COURT.y && b.h > REACH.doubleJumpRise + 400, 'bars floor to lintel, over any jump');
  assert.match(fnFrom(act, 'hookTargets'), /bars\.some\(b => \(b\.x - cx\) \* \(b\.x - o\.x\) < 0\)/, 'no hooking out over the bars');
  const [landing, cliff, gate] = K.ENCOUNTERS;
  assert.ok(landing.trigger({ x:7300, y:K.COURT.y }) && !landing.trigger({ x:7100, y:K.COURT.y - 300 }));
  assert.ok(cliff.trigger({ x:8800, y:K.COURT.y }) && cliff.x1 > K.SUN_ARCH_X && cliff.x2 < K.BELL_GATE_X);
  assert.ok(gate.overseer && gate.refill > 0, 'at the gate the bell rings more of them out while it rings');
  const bellRing = one(o => o.actId === 'ring-bell-rig');
  assert.ok(K.OVERSEER_LEDGE.y - K.COURT.y > REACH.doubleJumpRise, 'the hoist is above an ordinary jump');
  assert.ok(dist(centre(bellRing.x, K.COURT.y), bellRing) < HOOK);
  assert.ok(one(o => o.actArt === 'bell-shelf'), 'the hoist has real footing');
  assert.equal(cliff.waves.length, 1, 'sabotage replaces the second wave');
  assert.match(fnFrom(act, 'updateSunguard'), /if\(e\.bell === 'ringing' && e\.hp < e\.lastHp\)\{ silence\(A, S, e\);/, 'the first blow that lands silences the bell');
  assert.match(fnFrom(act, 'silence'), /f\.st = 'flee'/, 'and they drop their pikes and go');
  // The climb out: a ring from the road, a ring over the lip.
  const road = centre(K.BELL_GATE_X + 400, K.COURT.y);
  assert.ok(dist(road, ring('cliff')) <= HOOK && dist(hang(ring('cliff')), ring('lip')) <= HOOK);
  assert.ok(ring('lip').x > K.HEAD.x1 && ring('lip').y - 58 > K.HEAD.y, 'letting go of the lip ring sets you on the headland');
  assert.ok(K.HEAD.y - K.COURT.y > REACH.doubleJumpRise + 200);
});

test('THE CHOICE: warned, then the hand, the walk past, or two strikes', () => {
  assert.match(shores, /It goes to whoever touches it/, 'he warns you before you choose');
  const take = fnFrom(shores, 'takeHand');
  assert.match(take, /P\.oren = 'helped'; kit\.afflict\(\);/);
  const swing = fnFrom(shores, 'swing');
  assert.match(swing, /!gateFightDone\(A\)\) return;/, 'a blade in the fight is not a choice');
  assert.match(swing, /if\(P\.strikes === 1\)/, 'the first time he only covers his head');
  assert.match(swing, /P\.oren = 'struck'; P\.forsaken = true;/, 'the second seals the forsaken path at once');
  assert.match(fnFrom(shores, 'reachColony'), /the kneeling man has not moved/, 'walking past leaves him kneeling');
  // The white flower: a measure every half-minute, never below three.
  assert.match(act, /const AFFLICTION_STEP = 30, AFFLICTION_FLOOR = 3\b/);
  assert.match(fnFrom(act, 'clampAfflicted'), /p\.blood > usable/, 'rest cannot fill a grey measure');
  assert.doesNotMatch(shores + art + act, /lepro/i, 'the sickness is never named');
  assert.match(fnFrom(act, 'path'), /if\(G\.levelSelectMode\)\{[\s\S]*?return G\.actTwoSessionPath;\s*\}/, 'a Level Select run keeps its own choice');
});

test('RECOVERY and ARRIVAL: the holed boat is the rest, and the current puts you beside it', () => {
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'holed-boat');
  assert.match(read('bladefall-recovery.js'), /\['holed-boat', 'landing-shores', 'The Holed Boat', [\d.]+, false\]/, 'not a fast-travel station');
  assert.deepEqual({ ...ACT.arrivalFor({ connectorId:'cliffs-landing', targetZoneId:'landing-shores' }) }, { ...K.SPAWN });
  assert.equal(ACT.arrivalFor({ connectorId:'king-thunder-cliffs', targetZoneId:'thunder-cliffs' }), null);
  assert.match(read('bladefall-progression.js'), /connector\('cliffs-landing', 'thunder-cliffs', 'landing-shores'/);
});

test('the art is registered for the region, and the flower is drawn on the knight', () => {
  assert.match(art, /ART\.register\(17, /);
  assert.match(actArt, /function handles\(stageIndex\)\{ return stageIndex === 16 \|\| !!STAGE_ART\[stageIndex\]; \}/);
  assert.match(fnFrom(actArt, 'hero'), /K\.kit\.greyMeasures\(p\)/);
  assert.match(fnFrom(art, 'drawWater'), /A\.water <= floorY \+ 1\) continue;/, 'the flats are dry at low water');
});


test('flooding wounds in place, gives recovery time, and never rewinds coordinates', () => {
  const p={x:4750,y:0,vx:0,vy:0,blood:5,invuln:0,onGround:true,dodgeTimer:1};
  const ctx=vm.createContext({p,A:{water:170,safe:{x:820,y:200}},meta:{soundOn:false},
    kit:{burst(){}},hurtPlayer(){p.blood--;}});
  vm.runInContext(fnFrom(shores,'swept')+';swept(A,p);',ctx);
  assert.equal(p.x,4750);assert.equal(p.y,0);assert.equal(p.blood,4);
  assert.ok(p.vy<0);assert.equal(p.onGround,false);assert.equal(p.dodgeTimer,0);
  vm.runInContext('swept(A,p);',ctx);assert.equal(p.blood,4);
  for(const perch of K.WRACK_PERCHES) assert.ok(perch.y >= K.TIDE.high + 20);
});

test('bell cap requires a descending slam and releases the encounter once', () => {
  const p={x:K.BELL_RIG.x,y:K.BELL_RIG.y+40,slamming:false,vy:400};
  const S={st:'live',foes:[{dead:false,st:'close'}]}, A={enc:{cliff:S}};
  let finishes=0;
  const ctx=vm.createContext({p,A,BELL_RIG:K.BELL_RIG,BELL_GATE_X:K.BELL_GATE_X,
    ENCOUNTERS:K.ENCOUNTERS,G:{shake:0},meta:{soundOn:false},kit:{burst(){}},
    finish(_a,_e,s){s.st='done';finishes++;}});
  vm.runInContext(fnFrom(shores,'updateBellRig')+';updateBellRig(A,p);',ctx);
  assert.equal(finishes,0);
  p.slamming=true;vm.runInContext('updateBellRig(A,p);',ctx);
  assert.equal(finishes,1);assert.ok(S.silenced);assert.equal(S.foes[0].st,'flee');
  p.slamming=true;vm.runInContext('updateBellRig(A,p);',ctx);assert.equal(finishes,1);
});
