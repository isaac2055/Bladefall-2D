// The Path to the Palace: Act Two's fourth region (stage 19). The colony's smoke line, the
// Sunspire's mirror stair (pools of burning light; pilgrims' shelters and the smoke hide you),
// the broken road over the hydra's sea (three rings), and the Sun Gate — slammed open alone,
// or its chains broken by Oren. The turned colony walks with you; on the forsaken path the
// sick come up the road and fight for the King. MENDED follows the knight back to Act One,
// and Level Select asks which road the knight took.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const colony = read('bladefall-colony.js');
const path = read('bladefall-palace-path.js');
const art = read('bladefall-palace-path-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Seam', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n'
  + read('bladefall-landing-shores.js') + '\n' + colony + '\n' + path, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const PP = sandbox.window.BladefallPalacePath;
const K = PP.constants;
const L = ACT.level(19);
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
const REACH = { flat:671, doubleJumpRise:147, run:212 };     // measured, full kit (run: ground speed)
const HOOK = ACT.kit.HOOK_RANGE;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const hang = (r) => ({ x:r.x, y:r.y - 58 + 22 });

test('stage 19 is registered everywhere a stage must be', () => {
  assert.match(source, /19:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(19\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 19);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b19\b[^\]]*\]\)/);
  assert.match(source, /19:Object\.freeze\(\{id:'path-towering-cliffs'/, 'LEVEL_MUSIC');
  assert.ok(existsSync(pub('audio/music/towering-sea-cliffs.mp3')));
  assert.ok(source.indexOf('bladefall-colony.js?v=') < source.indexOf('bladefall-palace-path.js?v='), 'the region registers after the act');
  assert.match(source, /<script src="bladefall-palace-path-art\.js\?v=[\d.]+"><\/script>/);
  assert.match(source, /G\.stageIndex<=(19|20)\)/, 'the journey runs through the Path');
  assert.equal(L.portal, null);
  assert.equal(L.authoredEcology, true);
  assert.ok(ACT.handles(19));
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'pilgrims-shelter');
  assert.match(read('bladefall-recovery.js'), /\['pilgrims-shelter', 'palace-path', 'The Pilgrims’ Shelter', [\d.]+, false\]/);
});

test('THE ROAD UP is walked both ways, and walking it closes the choice', () => {
  assert.match(read('bladefall-zones.js'), /\['colony-path', 'colony', 'east', 'walk', 0\.5, 'palace-path', 'west', 'walk', 0\.5\]/);
  const out = fnFrom(colony, 'seamSpec');
  assert.match(out, /connector:'colony-path'/);
  assert.match(out, /A\.enc\.yard\.st !== 'done'/, 'the road out is the yard\'s reward');
  assert.match(out, /if\(cross\) closeChoice\(\);/);
  assert.match(fnFrom(path, 'seamSpec'), /targetStage:BACK/);
  assert.deepEqual({ ...ACT.arrivalFor({ connectorId:'colony-path', targetZoneId:'palace-path' }) }, { ...K.SPAWN });
  assert.ok(ACT.arrivalFor({ connectorId:'colony-path', targetZoneId:'colony' }).x > 10500, 'coming back, you arrive on the Colony\'s road');
});

test('THE MIRROR STAIR: every dash between shelters under a mirror has a window', () => {
  // The pool's path, exactly as aim() drives it.
  const at = (M, t) => M.sweep[0] + (M.sweep[1] - M.sweep[0]) * (0.5 - 0.5 * Math.cos((t + M.phase) / M.period * Math.PI * 2));
  const risers = (a, b) => K.STEPS.filter(s => s.x1 > a && s.x1 < b && s.y > PP.groundAt(s.x1 - 1)).length;
  for(const M of K.MIRRORS){
    const covers = K.SHELTERS.filter(s => s.x2 > M.sweep[0] - K.POOL && s.x1 < M.sweep[1] + K.POOL).map(s => [s.x1 + 8, s.x2 - 8]);
    const stops = [[M.sweep[0] - K.POOL - 60, M.sweep[0] - K.POOL - 60], ...covers, [M.sweep[1] + K.POOL + 60, M.sweep[1] + K.POOL + 60]];
    for(let i = 0; i + 1 < stops.length; i++){
      const a = stops[i][1], b = stops[i + 1][0];
      if(b <= a || (a < K.CHASM.x2 && b > K.CHASM.x1)) continue;
      // Each riser costs a jump: a quarter second, generously.
      const travel = (b - a) / REACH.run + 0.25 * risers(a, b);
      assert.ok(b - a < 520, `${M.id}: ${a}→${b} is open ground for ${Math.round(b - a)}`);
      let best = 0, run = 0;
      for(let t = 0; t < M.period * 2; t += 0.02){
        const g = at(M, t), clear = g < a - K.POOL - 20 || g > b + K.POOL + 20;
        run = clear ? run + 0.02 : 0; best = Math.max(best, run);
      }
      assert.ok(best > travel + 0.4, `${M.id}: ${a}→${b} needs ${travel.toFixed(1)} s, the light is away ${best.toFixed(1)} s`);
    }
  }
  const burn = fnFrom(path, 'updateMirrors');
  assert.match(burn, /if\(underShelter\(p\) \|\| inSmoke\(A, p\.x, p\.y \+ 24\)\) return;/, 'a shelter or the smoke hides you');
  assert.match(burn, /canopyFor\(A, p\)/, 'protection comes from a nearby carrier');
  assert.match(burn, /hurtPlayer\(12,/, 'the light burns a measure, not a life');
});

test('THE HYDRA OVERLOOK: no jump crosses; three rings do', () => {
  assert.ok(K.CHASM.x2 - K.CHASM.x1 > 800, 'the gap gates on the Chainhook, not on width');
  const [o1, o2, o3] = K.RINGS;
  const lip = { x:K.CHASM.x1 - 100, y:770 + 22 };
  assert.ok(dist(lip, o1) <= HOOK, 'the first ring from the lip');
  assert.ok(dist(hang(o1), o2) <= HOOK && dist(hang(o2), o3) <= HOOK, 'each ring from the hang of the last');
  assert.ok(dist(lip, o2) > HOOK, 'and not two at once');
  assert.ok(K.CHASM.x2 - o3.x < REACH.flat / 2, 'the far lip is a swing\'s release from the last ring');
  for(const r of K.RINGS) assert.equal(PP.groundAt(r.x), null, 'every ring stands over the drop');
  assert.match(fnFrom(path, 'voidFloor'), /p\.x > CHASM\.x1 && p\.x < CHASM\.x2 \? 300/, 'fall and the sea gives you back at the lip');
});

test('THE SUN GATE: alone, the windlass under the Sunguard; with the colony, Oren and the chains', () => {
  const bars = one(o => o.actBars === 'sun-gate');
  assert.equal(bars.gone, false, 'the gate is shut');
  assert.equal(bars.x, K.GATE_X);
  assert.ok(K.FRONTIER_X > K.GATE_X, 'the palace is through it');
  const guard = fnFrom(path, 'firstFrame');
  assert.equal((guard.match(/F\.spawnSunguard\(/g) || []).length, 1, 'one Sunguard holds the gate: no second shield closes the room behind him');
  const off = Number(/x:WINDLASS_X \+ (\d+)/.exec(guard)[1]), reach = Number(/const SUNGUARD = \{[^}]*reach:(\d+)/.exec(act)[1]);
  assert.ok(off < reach, `the windlass turns inside his reach (${off} < ${reach})`);
  assert.ok(K.GATE_X - (K.WINDLASS_X + off) > 200, 'room behind him to fight his back');
  const m4 = K.MIRRORS.find(m => m.id === 'm4');
  assert.ok(m4.sweep[1] + K.POOL < K.WINDLASS_X + off - reach, 'the gate fight stands clear of the light');
  const gate = fnFrom(path, 'updateGate');
  assert.match(gate, /p\.slamming && p\.vy > 0 && Math\.abs\(p\.x - WINDLASS_X\) < 45/, 'come down hard on the windlass');
  assert.match(gate, /A\.gateLift >= 3\) openGate\(A, 'windlass'\)/, 'three turns');
  assert.match(gate, /A\.anchors\.every\(Boolean\)\) openGate\(A, 'chains'\)/, 'or both chains broken');
  assert.match(fnFrom(path, 'updateOren'), /A\.anchors\[i\] = true/, 'Oren breaks them');
  assert.match(fnFrom(path, 'updateOren'), /Math\.abs\(p\.x - O\.x\) > 900 && Math\.abs\(ax - O\.x\) > 900/, 'he catches up only when far from the knight AND his work');
  assert.match(fnFrom(path, 'updateAllies'), /e\.shieldFace = side/, 'the sick hold the Sunguard with his shield turned');
  assert.match(fnFrom(path, 'openGate'), /e\.fleeX = LEN/, 'the gate down, the Sunguard fall back to the palace');
  assert.match(fnFrom(path, 'openGate'), /kit\.latch\(ZONE, 'path-gate'\)/);
});

test('THE CHOICE, CARRIED UP: the turned colony walks with you; forsaken, the sick fight for the King', () => {
  assert.match(fnFrom(path, 'allied'), /P\.oren === 'helped' && P\.colony === 'turned'/);
  const init = fnFrom(path, 'init');
  assert.match(init, /allied\(P\)/, 'the sick walk with you only if the colony turned');
  assert.match(init, /P\.oren === 'helped'/, 'Oren walks with you if you took his hand');
  const ambush = fnFrom(path, 'updateAmbush');
  assert.match(ambush, /if\(!P\.forsaken \|\| p\.x < 1300 \|\| p\.dead\) return;/, 'only on the forsaken road');
  assert.match(ambush, /p\.x - 620 - i \* 70/, 'they come up behind you');
  assert.match(fnFrom(path, 'zealot'), /e\.zealot = true/);
  assert.match(fnFrom(path, 'updateGate'), /if\(P\.forsaken\) for\(let i = 0; i < 3; i\+\+\)/, 'and at the gate');
  // No bell drives them and none stops them.
  assert.match(fnFrom(act, 'updateBelled'), /else if\(e\.zealot\) windUp\(e, BELLED\.drivenWind\);/, 'they do not hesitate');
  assert.match(fnFrom(act, 'silence'), /if\(f\.zealot\) continue;/, 'silencing a bell does not stop them');
  assert.match(fnFrom(actArt, 'belledFigure'), /zealot/, 'drawn without a pike, reaching');
  const palace = fnFrom(path, 'reachPalace');
  assert.match(palace, /allied\(P\) \?/);
  assert.match(palace, /P\.forsaken \?/);
  assert.doesNotMatch(path + art, /lepro/i, 'the sickness is never named');
});

test('MENDED follows the knight back to Act One', () => {
  assert.match(source, /if\(window\.BladefallActTwo\)BladefallActTwo\.everywhere\(dt\);/, 'called for every stage, not only Act Two');
  assert.match(fnFrom(act, 'everywhere'), /updateMended\(dt, G\.p\)/);
  assert.match(fnFrom(act, 'updateMended'), /const P = peekPath\(\);/, 'it reads the path without creating one');
  assert.doesNotMatch(fnFrom(act, 'updateAffliction'), /updateMended/, 'and is not run twice in Act Two');
  assert.match(fnFrom(actArt, 'hero'), /P\.mended \|\| \(P\.infected && api\.G\.stageIndex > 16\)/, 'gold stitches everywhere; the white flower only in Act Two');
  assert.match(renderer, /if\(x && x\.hero && curG\) x\.hero\(EXT_API, p\);/, 'the renderer draws the knight\'s marks in every region');
});

test('LEVEL SELECT asks which road the knight took', () => {
  assert.match(source, /if\(i>=18&&window\.BladefallActTwo&&BladefallActTwo\.pickPath\(i,go\)\)return;/);
  const pick = fnFrom(act, 'pickPath');
  assert.match(pick, /pendingPath = Object\.assign\(\{\}, row\[3\]\);/);
  assert.match(pick, /id="pathBack"/, 'with a way back');
  assert.match(fnFrom(act, 'path'), /Object\.assign\(freshPath\(\), pendingPath \|\| \{\}\)/, 'the run starts on the chosen road');
  for(const [stage, ids] of [[18, ['hand', 'past', 'struck']], [19, ['hand', 'left', 'struck']]]){
    const at = act.indexOf('  ' + stage + ':['), block = act.slice(at, act.indexOf('\n  ],', at));
    for(const id of ids) assert.match(block, new RegExp("\\['" + id + "', "), stage + ': ' + id);
  }
  assert.match(act, /\['hand', 'The colony turned', [^\]]*\{ oren:'helped', mended:true, gold:2, orenKnown:true, colony:'turned' \}\]/,
    'stage 19 by the hand is the cured knight with the turned colony');
});

test('the art is registered and draws what the region owns', () => {
  assert.match(art, /ART\.register\(19, /);
  assert.match(art, /hydra|Hydra/, 'the beast in the sea below the overlook');
  assert.match(art, /canopy/, 'the colony\'s canvas over the knight');
  assert.match(art, /anchors/, 'the chains Oren breaks');
});


test('canvas protects only beside its actual carrier, not across the map or above the roof', () => {
  const ctx=vm.createContext({A:{allies:[{x:100,y:220,st:'cover'}]},p:{x:130,y:220}});
  vm.runInContext(fnFrom(path,'canopyFor'),ctx);
  assert.ok(vm.runInContext('canopyFor(A,p)',ctx));
  ctx.p.x=300;assert.equal(vm.runInContext('canopyFor(A,p)',ctx),null);
  ctx.p.x=130;ctx.p.y=330;assert.equal(vm.runInContext('canopyFor(A,p)',ctx),null);
  ctx.p.y=220;ctx.A.allies[0].st='grab';assert.equal(vm.runInContext('canopyFor(A,p)',ctx),null);
});

test('apron shutter gives a warned dark crossing long enough for the widest shelter gap', () => {
  const ctx=vm.createContext({SHUTTER:K.SHUTTER,M:{shutter:true,phase:0}});
  vm.runInContext(fnFrom(path,'mirrorPower'),ctx);
  assert.equal(vm.runInContext('mirrorPower(M,1).open',ctx),true);
  assert.equal(vm.runInContext('mirrorPower(M,3).open',ctx),false);
  assert.equal(vm.runInContext('mirrorPower(M,5).warning',ctx),true);
  assert.equal(vm.runInContext('mirrorPower(M,5).open',ctx),false);
  assert.equal(vm.runInContext('mirrorPower(M,5.4).open',ctx),true);
  const shelters=K.SHELTERS.filter(s=>s.x1>=K.CHASM.x2);
  const widest=Math.max(...shelters.slice(1).map((s,i)=>s.x1-shelters[i].x2+16));
  assert.ok(K.SHUTTER.period-K.SHUTTER.open > widest/REACH.run+.4);
});

test('Oren cannot open the Sun Gate offscreen and latches each completed anchor', () => {
  const A={oren:{x:K.ANCHORS[0],y:770,st:'break',t:1.9,face:1},enc:{gate:{st:'live'}},anchors:[false,false],gateOpen:false};
  const calls=[];
  const ctx=vm.createContext({A,p:{x:8400,y:770},ANCHORS:K.ANCHORS,ZONE:'palace-path',G:{shake:0},meta:{soundOn:false},
    kit:{follow(){},burst(){},latch:(...a)=>calls.push(a)},snapToGround(){}});
  vm.runInContext(fnFrom(path,'updateOren'),ctx);
  vm.runInContext('updateOren(A,.2,p)',ctx);assert.equal(A.anchors[0],false);assert.equal(A.oren.t,0);
  ctx.p.x=9400;vm.runInContext('updateOren(A,2.1,p)',ctx);
  assert.equal(A.anchors[0],true);assert.deepEqual(calls,[['palace-path','path-anchor-0']]);
});
