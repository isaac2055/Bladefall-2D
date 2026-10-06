// The Fractured Woods: Act Three's second echo (stage 22). A B-side of Black Woods — one jump,
// the Oathblade root-bound until a counterweight is stood on, the Muster on the road — and a
// C-side: the Mirror Thicket, whose branches hold only while the wind blows against their resin.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fw = read('bladefall-fractured-woods.js');
const art = read('bladefall-fractured-woods-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Seam', 'Slate', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fw, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FW = sandbox.window.BladefallFracturedWoods;
const K = FW.constants;
const L = ACT.level(22);
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
// The jump-only knight, measured in the browser: a 78 apex, 136 at a 199 run.
const KNIGHT = { h:44, w:26, run:199, g:1349, vy:459 };
const reach = (dy) => F.reach(dy, KNIGHT);
const air = (dy) => (KNIGHT.vy + Math.sqrt(KNIGHT.vy * KNIGHT.vy - 2 * KNIGHT.g * dy)) / KNIGHT.g;
const APEX = KNIGHT.vy * KNIGHT.vy / (2 * KNIGHT.g);
const span = (x, w, y) => ({ a:x - w / 2, b:x + w / 2, y });

test('stage 22 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /22:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(22\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 22);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b22\b[^\]]*\]\)/);
  assert.match(source, /22:Object\.freeze\(\{id:'fractured-woods-road',src:'\.\/audio\/music\/hall-of-the-violet-discipline\.mp3'/, 'LEVEL_MUSIC');
  for(const f of ['hall-of-the-violet-discipline', 'the-archive-of-violet-portals']){
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
    assert.match(read('sw.js'), new RegExp('audio/music/' + f + '\\.mp3'));
  }
  const at = (n) => source.indexOf('<script src="' + n + '?v=');
  assert.ok(at('bladefall-act-two.js') < at('bladefall-fractured.js') && at('bladefall-fractured.js') < at('bladefall-fractured-woods.js'), 'core, then the echo');
  assert.ok(at('bladefall-fractured-woods-art.js') > 0);
  for(const f of ['bladefall-fractured.js', 'bladefall-fractured-woods.js', 'bladefall-fractured-woods-art.js']){
    assert.match(read('sw.js'), new RegExp(f.replace(/\./g, '\\.') + '\\?v='));
    assert.match(readFileSync(new URL('../build-deploy.sh', import.meta.url), 'utf8'), new RegExp('\\n  ' + f.replace(/\./g, '\\.') + '\\n'));
  }
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Woods'[^}]*act: 3/);
  assert.match(read('bladefall-progression.js'), /\['fractured-woods', 22, 'The Fractured Woods'/);
  assert.match(read('bladefall-progression.js'), /connector\('fo-fw', 'fractured-outskirts', 'fractured-woods'/);
  assert.match(read('bladefall-world.js'), /\['fractured-woods', 22, 'The Fractured Woods', 22, 22,/);
  assert.match(read('bladefall-zones.js'), /\['fo-fw', 'fractured-outskirts', 'east', 'walk', 0\.5, 'fractured-woods', 'west', 'walk', 0\.5\]/);
  assert.match(read('bladefall-recovery.js'), /\['woods-embers', 'fractured-woods', 'The Refuge Embers', [\d.]+, false\]/);
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'woods-embers');
  assert.ok(ACT.handles(22));
  assert.equal(L.portal, null);
});

test('the echoes know each other: Level Select lists it, and the Outskirts walks on into it', () => {
  assert.equal(F.echoFor(1), 22, 'Black Woods\' echo is stage 22');
  assert.match(read('bladefall-rift-shards.js'), /\['Fractured Woods', 1\]/);
  assert.match(read('bladefall-rift-shards.js'), /return F \? F\.echoFor\(source\) : null;/, 'the Fractured tab asks the registry');
  const fo = read('bladefall-fractured-outskirts.js');
  assert.match(fo, /F\.seamOn\(STAGE, ZONE, 'fo-fw', LEN, A\.cleared\)/, 'east out of the Outskirts once the Sentinel is bound');
  assert.match(fo, /registerEcho\(SOURCE, STAGE\)/);
  const seam = fnFrom(fw, 'seamSpec');
  assert.match(seam, /connector:'fo-fw', zone:ZONE, targetStage:21/, 'west back into the Outskirts');
  assert.match(seam, /F\.seamOn\(STAGE, ZONE, 'fw-fc', LEN, true\)/, 'east into the next echo, when it is built');
  assert.match(fnFrom(fw, 'update'), /THE FRACTURED CAUSEWAY/, 'until then, the card names the next echo in the owner\'s order');
});

test('THE WOODS\' KIT: one jump; the blade only once the roots let it go', () => {
  const init = fnFrom(fw, 'init');
  assert.match(init, /F\.setKit\(armed \? \['jump', 'weapon'\] : \['jump'\]\)/);
  assert.match(init, /stump\.actMute = !\(G\.actTwo\.roots && !armed\)/, 'the stump cannot be taken from until the roots are released');
  assert.match(fnFrom(fw, 'firstFrame'), /F\.muster\(\)/, 'the Muster, with its roles, at the first frame');
  assert.match(fnFrom(core, 'muster'), /e\.musterRole = e\.type/);
  assert.match(fnFrom(core, 'muster'), /applyRecallBaseline\(e\)/);
  const cw = fnFrom(fw, 'updateCounterweight');
  assert.match(cw, /kit\.latch\(ZONE, 'fw-roots'\)/);
  assert.match(cw, /stump\.actMute = false/);
  const i = fnFrom(fw, 'interact');
  assert.match(i, /A\.roots && !A\.armed/);
  assert.match(i, /F\.grantBlade\(\)/);
  assert.match(i, /kit\.latch\(ZONE, 'fw-blade'\)/);
  assert.equal(one(o => o.actId === 'stump').actVerb, 'TAKE THE OATHBLADE');
  // The stump is past the loop, in the outrider's beat: one crossing, and the blade is used at once.
  assert.ok(K.STUMP_X > K.COUNTERWEIGHT.x + K.COUNTERWEIGHT.w / 2, 'no backtrack over the loop');
  const guard = L.enemies.find(e => e.t === 'outrider' && e.patrol[0] <= K.STUMP_X && e.patrol[1] >= K.STUMP_X);
  assert.ok(guard, 'an outrider patrols the stump');
  assert.ok(L.enemies.every(e => e.noDrop));
});

test('THE B-SIDE: every gap clears on the single jump, and the thorns are a rhythm, not a wall', () => {
  const S = (i) => span(K.STONES[i][0], K.STONES[i][1], K.STONES[i][2]);
  const loop = [S(4), S(5), S(6), S(7), span(K.COUNTERWEIGHT.x, K.COUNTERWEIGHT.w, K.COUNTERWEIGHT.y)];
  const canopy = [S(8), S(9), S(10), S(11)];
  for(const road of [loop, canopy]) for(let i = 0; i + 1 < road.length; i++){
    const A = road[i], B = road[i + 1], gap = B.a - A.b, dy = B.y - A.y;
    assert.ok(dy < APEX - 4, `${A.b}→${B.a}: a rise of ${dy}`);
    assert.ok(reach(dy) >= gap + 15, `${A.b}→${B.a}: ${gap} of void for ${reach(dy).toFixed(0)}`);
  }
  assert.ok(K.STONES.some(s => s[3]), 'a crumbling stone on the loop');
  // The clearing's bed is too long to run in its down time: the loop is the road.
  const bed = K.THORNS.find(t => t[0] === 2700);
  assert.ok((bed[1] + KNIGHT.w) / KNIGHT.run > bed[2] - bed[3], 'the clearing cannot be walked');
  // The refuge's wave and the road's beds: too wide to jump, but crossable on foot in the gap.
  for(const t of K.THORNS.filter(t => t !== bed)){
    assert.ok(t[1] > reach(0), `the bed at ${t[0]} is not jumped over`);
    assert.ok((t[1] + KNIGHT.w) / KNIGHT.run + 0.25 <= t[2] - t[3], `the bed at ${t[0]} is walked in its down time, with a quarter second to spare`);
  }
  // The canopy is the road: the floor under it is gone.
  assert.equal(FW.groundAt(4300), null);
  assert.match(fnFrom(fw, 'voidFloor'), /return -140/);
});

test('THE ROOTBOUND PASSAGE: every step is a hop over the void', () => {
  const steps = K.STAIRS.map(s => span(s[0], K.STEP_W, s[1]));
  for(let i = 0; i + 1 < steps.length; i++){
    const A = steps[i], B = steps[i + 1], gap = B.a - A.b, dy = B.y - A.y;
    // Walking off falls ~64 at a 70 drop; the knight is 26 wide: measured, a 70 gap still caught
    // the next step and a 90 gap did not.
    assert.ok(gap >= 90, `${A.b}→${B.a}: walking off would still land`);
    assert.ok(reach(dy) >= gap + 40, `${A.b}→${B.a}: the hop clears`);
  }
  assert.equal(FW.groundAt(8000), null, 'the void under the stair');
});

test('THE C-SIDE: the Mirror Thicket climbs only on the beat of the wind', () => {
  const holds = FW.holds;
  for(const w of ['E', 'W']){
    assert.equal(holds('B', w), true, 'resin on both edges: a rest');
    assert.equal(holds('N', w), false, 'no resin: the lie, never');
  }
  assert.equal(holds('E', 'E'), true); assert.equal(holds('E', 'W'), false);
  const route = K.BRANCHES.filter(b => b.r !== 'N');
  const lies = K.BRANCHES.filter(b => b.r === 'N');
  assert.ok(lies.length >= 3, 'the lie is everywhere in it');
  const path = [{ x:K.THICKET.x1 - 80, y:0, w:160, r:'B' }, ...route, { x:K.CROWN.x, y:K.CROWN.y, w:K.CROWN.w, r:'B' }];
  let beats = 0, reversals = 0, lastDir = 1;
  for(let i = 0; i + 1 < path.length; i++){
    const A = path[i], B = path[i + 1], dy = B.y - A.y, gap = Math.abs(B.x - A.x) - ((A.w || 70) + (B.w || 70)) / 2;
    assert.ok(dy > 0 && dy < APEX - 4, `hop ${i}: a rise of ${dy}`);
    assert.ok(reach(dy) >= gap + 30, `hop ${i}: ${gap} for ${reach(dy).toFixed(0)}`);
    const dir = Math.sign(B.x - A.x); if(dir !== lastDir) reversals++; lastDir = dir;
    // From a branch that drops at the turn to one that holds after it: a jump on the beat.
    if(A.r !== 'B' && B.r !== 'B'){ assert.notEqual(A.r, B.r, `hop ${i} is on the beat`); beats++; }
  }
  assert.ok(beats >= 5, 'most of the climb is on the beat');
  assert.ok(reversals >= 1, 'it turns back on itself');
  // The flutter is the cue: a jump made as it starts lands after the turn, and it is long enough to see.
  assert.ok(K.THICKET.warn < air(60), `the flutter (${K.THICKET.warn}) is shorter than a 60-rise jump's airtime (${air(60).toFixed(2)})`);
  assert.ok(K.THICKET.warn >= 0.4);
  assert.ok(K.THICKET.period - K.THICKET.warn > 1.5, 'and a beat is long enough to stand, look and walk to the edge');
  // Nothing under it: a missed beat is a fall.
  assert.equal(FW.groundAt((K.THICKET.x1 + K.THICKET.x2) / 2), null);
  const apply = fnFrom(fw, 'applyWind');
  assert.match(apply, /o\.gone = !holds\(o\.resin, A\.wind\)/);
  assert.match(fnFrom(fw, 'updateWind'), /A\.warn = A\.windT > THICKET\.period - THICKET\.warn/);
  assert.match(fnFrom(fw, 'update'), /kit\.latch\(ZONE, 'fw-crown'\)/, 'the crown is a checkpoint that survives a death');
});

test('the art is registered and draws the lie', () => {
  assert.match(art, /ART\.register\(22, /);
  const plat = fnFrom(art, 'plat');
  const branch = plat.slice(plat.indexOf("case 'branch'"));
  assert.doesNotMatch(branch.slice(0, branch.indexOf('return true')), /if\(o\.gone\) return true/, 'a branch that will not hold is still drawn');
  assert.match(fnFrom(art, 'leaves'), /A\.wind === 'E' \? -1 : 1/, 'the wind is visible anywhere on screen');
  assert.match(fnFrom(art, 'drawStreamer'), /A\.warn/, 'the streamers flutter before the turn');
  assert.match(renderer, /if\(o\.actArt && ext\('plat', o\)\) return;/, 'the renderer hands every plat to the art, gone or not');
});

test('only the first two wind hops have a catch floor; the upper thicket stays exact', () => {
  assert.equal(FW.groundAt(K.BRANCHES[0].x), 0);
  assert.equal(FW.groundAt(K.BRANCHES[1].x), 0);
  for(const b of K.BRANCHES.filter(b=>b.r!=='N').slice(2)) assert.equal(FW.groundAt(b.x), null);
  assert.ok(K.BRANCHES[1].y > APEX + 30, 'the catch floor cannot bypass the first hop');
  const ribbons=objs(o=>o.type==='actStreamer');
  for(const y of [240,480]) assert.ok(ribbons.some(o=>o.y===y),'a local ribbon at each rest');
});

test('wind repairs hydrated geometry immediately, and clears the warning at the turn', () => {
  const G={p:{x:6800},obstacles:K.BRANCHES.map(b=>({actArt:'branch',resin:b.r,gone:false}))};
  const ctx=vm.createContext({G,THICKET:K.THICKET,meta:{soundOn:false}});
  vm.runInContext(['holds','applyWind','updateWind'].map(n=>fnFrom(fw,n)).join('\n'),ctx);
  const A={wind:'E',windT:0,warn:false};ctx.updateWind(A,0);
  G.obstacles.forEach(o=>assert.equal(!o.gone,FW.holds(o.resin,'E')));
  A.windT=K.THICKET.period-.1;ctx.updateWind(A,0);assert.equal(A.warn,true);
  ctx.updateWind(A,.11);assert.equal(A.wind,'W');assert.equal(A.warn,false);
  G.obstacles.forEach(o=>assert.equal(!o.gone,FW.holds(o.resin,'W')));
  G.obstacles.forEach(o=>o.gone=!o.gone);ctx.updateWind(A,0);
  G.obstacles.forEach(o=>assert.equal(!o.gone,FW.holds(o.resin,'W')));
});

test('thorn presentation uses the collision clock, including phased beds at the exact boundaries', () => {
  const G={time:0},ctx=vm.createContext({G});
  vm.runInContext(fnFrom(source,'spikesUp')+'\n'+fnFrom(source,'spikesWarn'),ctx);
  for(const o of objs(o=>o.fracturedThorns)) for(const t of [0,.001,o.upT-.001,o.upT,o.period-.401,o.period-.399,o.period,13.317]){
    G.time=t;const shown=FW.thornState(o,t);
    assert.equal(shown.up,ctx.spikesUp(o));assert.equal(shown.warn,ctx.spikesWarn(o));
    assert.equal(o.actArt,'thorn-bed');
  }
});

test('the weight releases the roots only on a live landing, and the blade remains a deliberate one-time pickup',()=>{
  const A={stage:22,roots:false,armed:false,queue:[]},stump={actId:'stump',actMute:true};
  const latches=[],grants=[];
  const G={actTwo:A,obstacles:[stump],shake:0};
  const ctx=vm.createContext({G,STAGE:22,ZONE:'fractured-woods',COUNTERWEIGHT:K.COUNTERWEIGHT,STUMP_X:K.STUMP_X,
    meta:{soundOn:false},kit:{latch:(_z,id)=>latches.push(id),burst(){}},F:{grantBlade:()=>grants.push('weapon')}});
  vm.runInContext(fnFrom(fw,'updateCounterweight')+'\n'+fnFrom(fw,'interact'),ctx);
  const p={x:K.COUNTERWEIGHT.x,y:K.COUNTERWEIGHT.y,onGround:true,dead:true};
  ctx.updateCounterweight(A,p);assert.equal(A.roots,false);
  p.dead=false;p.onGround=false;ctx.updateCounterweight(A,p);assert.equal(A.roots,false);
  p.onGround=true;ctx.updateCounterweight(A,p);assert.equal(stump.actMute,false);assert.equal(grants.length,0);
  ctx.interact(stump);ctx.interact(stump);
  assert.deepEqual(latches,['fw-roots','fw-blade']);assert.deepEqual(grants,['weapon']);
});
