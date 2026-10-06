// The Fractured Marksman: Act Three's fourth echo (stage 24). A B-side of Marksman Road at night —
// archers that see you past no mantlet draw, lock and loose, one linked mouth on the slate, the works
// gate that opens only to its own watch's arrow sent back — and a C-side pattern boss: the Tallyman,
// who counts; only its third shot, the Reckoning, turned back through your mouth, brings it down.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fm = read('bladefall-fractured-marksman.js');
const art = read('bladefall-fractured-marksman-art.js');
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
const helpers = ['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'LPortal', 'Anchor', 'Seam', 'SlateWall'];
const sandbox = vm.createContext({ Math, Object, JSON, window:{} });
vm.runInContext(helpers.map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fm, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FM = sandbox.window.BladefallFracturedMarksman;
const K = FM.constants;
const L = ACT.level(24);
const one = (p) => { const r = L.objects.filter(p); assert.equal(r.length, 1); return r[0]; };
const M = { jumpApex:78, jumpFar:148, earlyDashTop:153, windcutJumpDash:8310 };   // measured (7.203/7.204)

test('stage 24 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /24:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(24\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 24);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b24\b[^\]]*\]\)/);
  assert.match(source, /24:Object\.freeze\(\{id:'fractured-marksman-road',src:'\.\/audio\/music\/fractured-crosshairs-over-open-ground\.mp3'/);
  for(const f of ['fractured-crosshairs-over-open-ground', 'the-wayfarers-hearth']){
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
    assert.match(read('sw.js'), new RegExp('audio/music/' + f + '\\.mp3'));
  }
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Marksman'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fu-fm', 'fractured-updrafts', 'east', 'walk', 0\.5, 'fractured-marksman', 'west', 'walk', 0\.5\]/);
  assert.match(read('bladefall-recovery.js'), /\['watch-embers', 'fractured-marksman',/);
  assert.equal(F.echoFor(4), 24);
  assert.match(fnFrom(fm, 'seamSpec'), /connector:'fu-fm', zone:ZONE, targetStage:23/);
  assert.match(fnFrom(fm, 'seamSpec'), /A\.freed \? F\.seamOn\(STAGE, ZONE, 'fm-fk', LEN, true\)/, 'east only once the Tallyman is done');
  assert.match(fnFrom(read('bladefall-fractured-updrafts.js'), 'arrival'), /plan\.connectorId === 'fu-fm'/);
  assert.match(fnFrom(fm, 'update'), /THE FRACTURED KEEP/, 'the next echo in the owner\'s order');
});

test('THE ROAD\'S KIT: jump, blade, dash, and one mouth', () => {
  assert.match(fnFrom(fm, 'init'), /F\.setKit\(\['jump', 'weapon', 'dash', 'portal-single'\]\)/);
  assert.match(fnFrom(fm, 'firstFrame'), /F\.muster\(\)/);
  assert.ok(L.enemies.every(e => e.noDrop));
});

test('THE WATCH: it sees past no mantlet, draws, locks, and leads you by the arrow\'s whole flight', () => {
  // Sightlines: blocked by a mantlet between; clear otherwise.
  const w = { x:2350, y:240, range:1450 }, m = { x:2050, y:64, h:64, w:40, fmMantlet:1 };
  assert.equal(FM.segHitsRect(w.x, w.y + 30, 2030, 24, m), true, 'right behind a mantlet: hidden');
  assert.equal(FM.segHitsRect(w.x, w.y + 30, 1700, 24, m), false, 'far behind it, the line passes over');
  const watch = fnFrom(fm, 'updateWatch');
  assert.match(watch, /e\.t < e\.tell \* \.72/, 'it follows you, then locks for the last 28% of the draw');
  assert.match(fnFrom(fm, 'lead'), /Math\.hypot\(p\.x - e\.x, p\.y \+ 22 - \(e\.y \+ 34\)\) \/ speed \+ Math\.max\(0, rest\)/, 'it leads by the flight and the rest of the draw');
  assert.match(fnFrom(fm, 'cover'), /pr\.life = 0/, 'a mantlet stops an unreturned arrow');
  for(const x of K.WATCHES) assert.ok(x.perches.every(pp => pp[1] > M.earlyDashTop + 44), `${x.id}: out of the blade's reach`);
  const wSpawn = fnFrom(fm, 'spawnWatch');
  assert.match(wSpawn, /portalGate:'reflect', reflectBanks:1/, 'its own arrow, sent back, kills it; nothing else does');
  // Mantlets are cover you jump, never walls.
  for(const mm of K.MANTLETS) assert.ok(mm[1] < M.jumpApex - 10, `the mantlet at ${mm[0]} is one jump`);
});

test('THE MOUTH: each slate is inside exactly one anchor\'s range (the pair holds only while you are)', () => {
  for(const [sx] of K.SLATES){
    const inRange = K.ANCHORS.filter(a => Math.abs(a.x - sx) < a.range);
    assert.equal(inRange.length, 1, `the slate at ${sx} pairs with exactly one anchor`);
    const a = inRange[0];
    assert.ok(a.range - Math.abs(a.x - sx) >= 150, `and stays paired while you step 150 off it (${a.id})`);
  }
  assert.ok(L.objects.filter(o => o.type === 'lportal' && o.anchor).length === K.ANCHORS.length);
  assert.ok(L.objects.filter(o => o.slate).length === K.SLATES.length);
  // The slick tower: nothing climbs it; the mouth is the road.
  assert.ok(K.SLICK.h > 600);
  assert.equal(FM.groundAt(3700), null, 'and beyond it, the void until the anchor\'s ledge');
});

test('THE WORKS and THE WINDCUT: the gate listens for a returned watch arrow; the tower makes the launch the only way', () => {
  const t = fnFrom(fm, 'targets');
  assert.match(t, /!pr\.reflected \|\| !pr\.fmArrow/, 'only a watch arrow that has been through a mouth');
  assert.match(t, /kit\.latch\(ZONE, 'fm-works'\)/);
  const works = K.ANCHORS.find(a => a.id === 'works');
  assert.equal(works.dir, 'wallR'); assert.equal(works.y, K.TARGET.y, 'the anchor fires level at the target');
  assert.ok(K.TARGET.x > works.x && K.BARS.find(b => b.id === 'works-gate').x > K.TARGET.x);
  // The Windcut: a jump and two dashes from the perch reach as far as the launch (measured) — the tower stops them.
  const perch = K.LEDGES.find(l => l[2] === 480), tower = K.WINDCUT_TOWER, wc = K.ANCHORS.find(a => a.id === 'windcut');
  assert.ok(tower.x > perch[0] + perch[1] / 2 && tower.x < wc.x, 'the tower stands between the perch and the anchor');
  assert.ok(tower.h > perch[2] + M.earlyDashTop + 100, 'and no arc goes over it');
  // The climb to the perch is a jump at a time.
  const climb = K.LEDGES.filter(l => l[0] >= 7100 && l[0] <= 7400 && l[2] <= 480).sort((a, b) => a[2] - b[2]);
  for(let i = 1; i < climb.length; i++) assert.ok(climb[i][2] - climb[i - 1][2] <= 60, 'rises of 60');
});

test('THE TALLY COURT: a count to learn — and only the Reckoning, sent home, opens the blade\'s window', () => {
  const T = K.T;
  assert.deepEqual(Array.from(T.counts[0]), ['single', 'single', 'reckon']);
  assert.deepEqual(Array.from(T.counts[1]), ['single', 'brace', 'reckon']);
  assert.deepEqual(Array.from(T.counts[2]), ['brace', 'single', 'brace', 'reckon']);
  assert.ok(T.recover[2] < T.recover[0], 'faster as it loses');
  assert.ok(T.tell.reckon - T.lock.reckon >= 0.4, 'the Reckoning holds its aim long enough to be read');
  const draw = fnFrom(fm, 'updateTallyman');
  assert.match(draw, /e\.aimY = e\.kind === 'reckon' \? p\.y \+ 2 : p\.y \+ 22/, 'the Reckoning is aimed at your feet');
  assert.match(draw, /reckoning:1, puzzleOnly:1/, 'it never strikes him by the engine\'s rules — only by the tally post');
  assert.match(fnFrom(fm, 'spawnTallyman'), /portalGate:'tally-never'/, 'nothing else touches it');
  assert.match(fnFrom(fm, 'reckonings'), /pr\.reckoning \|\| !pr\.reflected/);
  assert.match(draw, /if\(e\.hp < e\.hpAtDown\)\{ cutTally\(A, e\); return; \}/, 'the blade, once, while it is down');
  assert.match(fnFrom(fm, 'cutTally'), /kit\.latch\(ZONE, 'fm-tally-' \+ A\.tallies\)/, 'a cut tally stays cut through a death');
  assert.match(fnFrom(fm, 'cutTally'), /setBars\('court-east', true\)/);
  // The geometry: the tally post fires level at its perch; the perch is out of every reach.
  const post = K.ANCHORS.find(a => a.id === 'tally');
  assert.equal(post.dir, 'wallR'); assert.ok(post.x < K.COURT.perch.x);
  assert.ok(post.y >= K.COURT.perch.y && post.y <= K.COURT.perch.y + 74, 'level with its body on the perch');
  assert.ok(K.COURT.perch.y > M.earlyDashTop + 200, 'the perch is out of every reach');
  // The stand: a mouth set just in front of you. Its line, from the perch to your feet, crosses the
  // mouth's box when you stand 5–45 west of it.
  const px = K.COURT.perch.x, py = K.COURT.perch.y + 34, mouth = 9700;
  const yAt = (stand) => 2 + (py - 2) * (mouth - stand) / (px - stand);
  assert.ok(yAt(mouth - 22) < 38 && yAt(mouth - 22) > 2, 'standing 22 west, the Reckoning goes in');
  assert.ok(yAt(mouth - 120) > 60, 'standing far back, it passes over the mouth — and finds you');
  assert.ok(T.down >= 2.4, 'the window is long enough to cross the court with a dash');
});

test('the art is registered: sightlines that lock, the count, the tally board', () => {
  assert.match(art, /ART\.register\(24, /);
  assert.match(fnFrom(art, 'world'), /if\(!e\.locked\) ctx\.setLineDash/, 'dotted while it follows, solid once locked');
  assert.match(fnFrom(art, 'tallymanFigure'), /const cut = k < \(A\.tallies \|\| 0\)/, 'the board shows each cut tally');
  assert.match(fnFrom(art, 'tallymanFigure'), /for\(let k = 0; k < e\.count; k\+\+\)/, 'it holds up the count');
});

test('held counts identify the shot across every phase, not its position in the sequence', () => {
  const ctx=vm.createContext({Math,T:K.T});
  vm.runInContext(['tier','shotCount','updateTallyman'].map(n=>fnFrom(fm,n)).join('\n'),ctx);
  for(let phase=0;phase<3;phase++)for(let move=0;move<K.T.counts[phase].length;move++){
    const e={st:'recover',t:0,move,aimX:123,locked:true};
    ctx.updateTallyman({tallies:phase},e,{},1);
    assert.equal(e.count,{single:1,brace:2,reckon:3}[e.kind]);
    assert.equal(e.aimX,null);assert.equal(e.locked,false);
  }
});

test('locked brace arrows share the preview origin and exact spread', () => {
  const ctx=vm.createContext({Math,T:K.T,G:{projectiles:[]},meta:{soundOn:false}});
  vm.runInContext(['tier','shotOrigin','loose','updateTallyman'].map(n=>fnFrom(fm,n)).join('\n'),ctx);
  const e={actFoe:'tallyman',x:10150,y:420,face:-1,st:'draw',kind:'brace',t:.89,aimX:9700,aimY:22,move:0};
  ctx.updateTallyman({tallies:1},e,{x:9700,y:0},.02);
  const origin=FM.shotOrigin(e),base=Math.atan2(22-origin.y,9700-origin.x);
  assert.equal(ctx.G.projectiles.length,3);
  ctx.G.projectiles.forEach((p,i)=>{
    assert.equal(p.x,origin.x);assert.equal(p.y,origin.y);
    const angle=base+(i-1)*K.T.spread;
    assert.ok(Math.abs(p.vx-Math.cos(angle)*K.T.speed.brace)<1e-8);
    assert.ok(Math.abs(p.vy-Math.sin(angle)*K.T.speed.brace)<1e-8);
  });
  assert.match(fnFrom(art,'world'),/M\(\)\.shotOrigin\(e\)/);
});

test('a returned Reckoning opens one punish window and clears only the Tallyman volley', () => {
  const e={x:10150,y:420,h:74,st:'draw',t:.5,locked:true};
  const hit={sourceType:'fm-tallyman',reckoning:1,reflected:true,life:3,x:e.x,y:440};
  const stray={sourceType:'fm-tallyman',life:3},watch={sourceType:'fm-watch',life:3};
  const ctx=vm.createContext({Math,T:K.T,G:{projectiles:[hit,stray,watch]},kit:{burst(){}},meta:{soundOn:false}});
  vm.runInContext(['clearTallyArrows','reckonings'].map(n=>fnFrom(fm,n)).join('\n'),ctx);
  ctx.reckonings({tallyman:e});
  assert.equal(e.st,'struck');assert.equal(e.locked,false);
  assert.equal(hit.life,0);assert.equal(stray.life,0);assert.equal(watch.life,3);
  e.t=.3;ctx.reckonings({tallyman:e});assert.equal(e.t,.3);
});

test('dead actors do not fire, and a completed Tallyman restores its yielded pose', () => {
  const ctx=vm.createContext({Math,COURT:K.COURT,spawnEnemy:()=>({})});
  vm.runInContext(['updateWatch','updateTallyman','spawnTallyman'].map(n=>fnFrom(fm,n)).join('\n'),ctx);
  const e={st:'draw',t:.6};ctx.updateTallyman({},e,{dead:true},1);assert.equal(e.t,.6);
  ctx.updateWatch(e,{dead:true},1);assert.equal(e.t,.6);
  const A={freed:true};ctx.spawnTallyman(A);
  assert.equal(A.tallyman.st,'kneel');assert.equal(A.tallyman.y,0);assert.equal(A.tallyman.exposeT,0);
});

test('the off-screen cue shows the attack kind and its lock, then disappears in view', () => {
  const calls=[],ctx=vm.createContext({Math,M:()=>FM});
  vm.runInContext(fnFrom(art,'edgeCount'),ctx);
  const api={WX:x=>x,WY:y=>y,bw:500,bh:360,B:(...a)=>calls.push(a)};
  const e={x:700,y:70,h:74,st:'draw',kind:'reckon',locked:true};
  ctx.edgeCount(api,{fight:true,tallyman:e});
  assert.equal(calls.filter(a=>a[2]===2&&a[3]===9).length,3);
  assert.equal(calls.filter(a=>a[3]===2).length,1);
  calls.length=0;e.x=250;ctx.edgeCount(api,{fight:true,tallyman:e});assert.equal(calls.length,0);
});
