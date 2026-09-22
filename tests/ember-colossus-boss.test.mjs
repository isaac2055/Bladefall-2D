// THE LAST POUR. The Colossus fight is a runtime arena — nothing it needs is in
// FOUNDRY_LEVEL.objects — so these run installFoundryBed for real in a sandbox and
// measure what it builds. See docs/charters/11-ember-colossus/BOSS-DESIGN-PLAN.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const renderer = await read('bladefall-respec-renderer.js');

function fn(name){
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists');
  const brace = source.indexOf('{', start); let depth = 0;
  for(let i = brace; i < source.length; i++){
    if(source[i] === '{') depth++;
    else if(source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error('unterminated ' + name);
}
function konst(decl){
  const i = source.indexOf(decl);
  assert.ok(i >= 0, decl + ' exists');
  return source.slice(i, source.indexOf('\n', i));
}

// The arena builder plus every constructor it reaches, in a bare realm.
const ctors = ['Pl','Slate','Br','Trap','Plate','Scenery','ElementBeat','FoundryBeat','FoundryScenery','Cap','FHeat','Wl','DoorSeal'];
const decls = [
  konst('const HEAT_MOLTEN=0,HEAT_SETTING=1,HEAT_COLD=2;'),
  konst('const COLOSSUS_BED_X0='),
  konst('const COLOSSUS_BED_PERIOD='),
  konst('const COLOSSUS_ACT_FLOOR='),
  konst('const COLOSSUS_SHAFT='),
  konst('const COLOSSUS_RISE='),
];
const parts = [...decls, ...ctors.map(fn),
  fn('foundryBeds'), fn('installFoundryBed'), fn('colossusBodyBridge'),
  fn('heatStateOf'), fn('updateHeatStone'), fn('colossusActFloor'), fn('colossusExposeDamage'), fn('colossusBankBed'),
  fn('colossusMould'), fn('installColossusShaft'), fn('installColossusCrane'), fn('updateColossusCrane')];

function build(boss){
  const G = { stageIndex: 10, bossRush: false, obstacles: [
    { type:'lportal', x:12980, y:220, anchor:1, foundryOutlet:1, ejectSpeed:420 },
  ], time: 0 };
  const ctx = { Math, Object, JSON, G, meta:{}, console };
  ctx.globalThis = ctx;
  vm.runInNewContext(parts.join('\n') + '\n;(' + String(function(boss){ installFoundryBed(boss); }) + ')(BOSS)',
    Object.assign(ctx, { BOSS: boss }));
  return G;
}

const G = build({ maxHp: 800, hp: 800, forgeQuenches: 0, forgeAct: 1, forgeFight: true, colossusForge: 1 });
// The shaft and the crane, built by the real installers in a bare realm.
function realm(){ const g = { stageIndex: 10, obstacles: [], time: 0 };
  const ctx = { Math, Object, JSON, G: g, meta:{}, console }; ctx.globalThis = ctx;
  vm.runInNewContext(parts.join('\n') + '\n;installColossusShaft();installColossusCrane();', ctx); return { g, ctx }; }
const SHAFT = realm().g;
const beds = G.obstacles.filter(o => o.castingBed).sort((a, b) => a.x - b.x);
const P = { run: 200, jump: 480, second: 450, grav: 2800 };
const CEILING = (P.jump * P.jump) / P.grav + (P.second * P.second) / P.grav;   // 154.61

test('the bed is six moulds, flush, with head clearance under a 112-tall machine', () => {
  assert.equal(beds.length, 6, 'six moulds');
  for(const m of beds){
    assert.equal(m.y, 130, 'the bed is one plane above the pit floor');
    assert.equal(m.h, 12, 'underside at 118 — six pixels of clearance under a 112-tall head, not two');
    assert.equal(m.w, 204, '204 on 200 centres, so there is no seam to fall through');
  }
  for(let i = 1; i < beds.length; i++)
    assert.ok(beds[i].x - beds[i].w / 2 < beds[i - 1].x + beds[i - 1].w / 2, 'moulds overlap, never abut');
  assert.equal(beds[0].x - beds[0].w / 2, 12798);
  assert.equal(beds[5].x + beds[5].w / 2, 14002);
});

test('one clock, six phases, and never two holes at once', () => {
  const c0 = beds[0].heatCycle, period = c0.period;
  assert.equal(period, 6.0, 'six moulds on a one-second stride need six seconds of clock');
  const molten = c0.molten * period, setting = c0.set * period - molten;
  assert.ok(Math.abs(molten - 0.832) < 0.01, 'the hole is 0.832s');
  assert.ok(Math.abs(setting - 1.664) < 0.01, 'the window is 1.664s, against a 1.3s strike cooldown');
  assert.ok(setting > 1.3, 'so a missed strike still leaves a chance inside the same window');
  beds.forEach((m, i) => assert.equal(m.heatCycle.phase, (6 - i) % 6, 'a wave that travels east'));
  // The hole walks at exactly the player's run speed, and only ever one of them.
  const holes = t => beds.filter(m => (((t + m.heatCycle.phase) % period) + period) % period < molten).length;
  for(let t = 0; t < period; t += 0.02) assert.ok(holes(t) <= 1, 'at most one hole in the bed at t=' + t.toFixed(2));
  assert.equal(200 / 1.0, P.run, 'and it walks at run speed');
});

test('phase 2 is a climb of +120 steps, a chimney and a shutter, to a valve at the top', () => {
  // PHASE 2 · OUTCLIMB IT (owner, 2026-09-19): the old second and third acts used
  // the strike and nothing else. Every rise is +120: at +140 (the double jump tops
  // out near +148) the takeoff window was ~40 units wide — fine once, not in a race.
  const A = SHAFT.obstacles.filter(o => o.colossusAscent);
  const route = A.filter(o => o.type === 'plat' && !o.brittle).sort((a, b) => a.y - b.y || a.x - b.x);
  const heights = [...new Set(route.map(o => o.y))];
  let prev = 0;
  for(const y of heights){
    const rise = y - prev;
    if(rise > 125) assert.ok(prev === 380 && y === 840, `a ${rise} rise from ${prev} to ${y} with no chimney`);
    prev = y;
  }
  // The chimney: two rune faces, walked under from the ledge below and left by a
  // ledge that sits ON the east pillar's top.
  const faces = A.filter(o => o.type === 'wall' && o.clingSurface).sort((a, b) => a.x - b.x);
  assert.equal(faces.length, 2, 'one chimney');
  assert.ok(faces[1].x - faces[0].x >= 170 && faces[1].x - faces[0].x <= 190, 'as wide as the region\'s other chimneys');
  const below = route.find(o => o.y === 380), exit = route.find(o => o.y === 840 && o.x < 13360);
  assert.ok(faces[0].y - faces[0].h - below.y > 44, 'your head clears the pillars\' feet from the ledge below');
  assert.ok(exit.x - exit.w / 2 <= faces[1].x - faces[1].w / 2, 'the exit ledge covers the east pillar\'s top');
  // The shutter: open 0.35s in 2.4, nothing under it, nothing over it.
  const door = A.find(o => o.colossusShutter), seal = A.find(o => o.type === 'wall' && o.slickL && o.x === door.x);
  assert.ok(door && seal, 'a shutter with a seal above it');
  // Under it means your HEAD clears its bottom edge, so your feet are 44 lower.
  assert.ok(exit.y - (door.y - door.h - 44) > CEILING, 'you cannot drop under it and climb back up the far side');
  assert.ok(seal.y > exit.y + CEILING, 'or jump over it from the ledges');
  const gantry = A.find(o => o.colossusGantry), valve = A.find(o => o.colossusValve);
  assert.ok(seal.y < gantry.y, 'and it stops under the gantry, which it once cut in two');
  assert.ok(valve && valve.y === gantry.y && valve.brittle, 'the valve is breakable rock at the end of the gantry');
  // The side walls are SLICK: a rune face the whole way up would be a staircase.
  const sides = SHAFT.obstacles.filter(o => o.colossusShaft);
  assert.ok(sides.length === 2 && sides.every(w => !w.clingSurface && w.slickL && w.slickR), 'slick shaft walls');
  const metal = SHAFT.obstacles.find(o => o.colossusRise);
  assert.ok(metal && metal.kind === 'lava' && metal.damage === 0, 'the metal is drawn as lava; the fight owns what it does');
});

test('phase 2 is a race, not a trap', () => {
  const asc = fn('updateColossusAscent');
  assert.match(asc, /o!==under/, 'a pour never lands on the mould you have to wait on');
  assert.match(asc, /pouredAt/, 'and a poured mould is left alone long enough to come back');
  assert.match(asc, /A\.lava=Math\.min\(S\.top-60,A\.lava\+COLOSSUS_RISE\*dt\)/, 'the metal rises at one steady rate');
  assert.match(asc, /p\.y<A\.lava-6\)\{colossusAscentCaught/, 'and catches you when it reaches your feet');
  const caught = fn('colossusAscentCaught');
  assert.match(caught, /hurtPlayer\(/, 'being caught costs Blood');
  assert.match(caught, /A\.grace=5/, 'and restarts the climb with time to reach the first mould');
  assert.doesNotMatch(caught, /heatSet=false/, 'moulds you set stay set');
  assert.match(fn('updateColossusPours'), /o\.colossusAscent&&o\.heatCycle&&!o\.heatSet/, 'set stone rings a pour off');
  assert.match(source, /if\(e\.kind !== 'fly'&&!e\.wardenBroken&&!e\.colossusHang\)/, 'it hangs on the outside of the shaft');
  assert.match(fn('shatterBrittle'), /o\.colossusValve&&crackColossusValve\(o\)/, 'and the valve is the end of the phase');
});

test('the approach keeps its anchor, silenced rather than deleted', () => {
  assert.match(fn('setupFoundryBoss'), /outlet\.gone=true/, 'both mouths are the player’s for the fight');
  assert.match(source, /if\(e\.colossusForge\)\{const outlet=G\.obstacles\.find\(o=>o\.foundryOutlet\);if\(outlet\)outlet\.gone=false;/, 'and it is handed back on the kill');
  assert.ok(G.obstacles.find(o => o.foundryOutlet), 'never deleted');
});

test('the working area is narrower than the pair-wipe distance', () => {
  const xs = [...beds.map(m => m.x), ...G.obstacles.filter(o => o.sluiceShelf || o.foundryGate).map(o => o.x)];
  assert.ok(Math.max(...xs) - Math.min(...xs) < 1500, 'so the fight can never wipe the player’s own mouths');
});

test('damage can never buy an act', () => {
  const ctx = { Math, Object, G: { }, console };
  const F = vm.runInNewContext(decls[3] + '\n' + fn('colossusActFloor') + '\n' + fn('colossusExposeDamage') +
    '\n;({colossusActFloor,colossusExposeDamage})', ctx);
  const e = { forgeFight: true, colossusForge: 1, maxHp: 800, hp: 800, forgeAct: 1 };
  assert.equal(F.colossusActFloor(e, 9999), 800 - 800 * 0.62, 'phase 1 holds it above 62%');
  // After phase 1 no weapon moves it at all: the valve and the three plates are
  // the only way through, and they set its health themselves.
  e.forgeAct = 2; e.hp = 800 * 0.62;
  assert.equal(F.colossusActFloor(e, 9999), 0, 'the climb is not a damage race');
  e.forgeAct = 3; e.hp = 800 * 0.40;
  assert.equal(F.colossusActFloor(e, 9999), 0, 'and neither is the pursuit');
  e.forgeAct = 1; e.foundryOrphan = 1; e.hp = 64;
  assert.equal(F.colossusActFloor(e, 9999), 63, 'the body it leaves behind cannot be killed');
  // An exposure window is a flourish, not an answer.
  const w = { forgeFight: true, colossusForge: 1, maxHp: 800, hp: 800, exposeT: 1, forgeExposeBudget: 40 };
  assert.equal(F.colossusExposeDamage(w, 9999, 'melee'), 12, 'capped at 1.5% of max per blow');
  assert.equal(F.colossusExposeDamage(w, 9999, 'quench'), 9999, 'but a refusal is exempt');
  let total = 12; for(let i = 0; i < 10; i++) total += F.colossusExposeDamage(w, 9999, 'melee');
  assert.ok(total <= 800 * 0.05 + 0.001, 'and at 5% of max across the whole window');
});

test('phase 3: three plates, three verbs, and each breaks once', () => {
  const brk = fn('breakColossusPlate');
  assert.match(brk, /if\(!e\|\|e\.dead\|\|e\.forgeAct!==3\|\|!e\.plates\|\|e\.plates\[which\]\)return false;/, 'once each, and only in phase 3');
  assert.match(brk, /if\(broken>=3\)\{e\.pursuit\.state='still'/, 'the third ends it');
  // COUNTER: a countered slug goes home to it.
  assert.match(source, /if\(G\.boss&&G\.boss\.colossusForge&&G\.boss\.forgeAct===3&&pr\.sourceType==='colossus'\)\{pr\.colossusReturn=true;/);
  // PORTALS: a slug through your mouths is forged — no coolant, no water.
  assert.match(source, /if\(G\.boss\.forgeAct===3\)\{pr\.tracking=false;pr\.forgedSlug=true;/);
  // Either one hits the BODY YOU SEE (drawn 2.2x its hitbox), steered at its chest.
  assert.match(source, /breakColossusPlate\(e,pr\.forgedSlug\?'portal':'counter'\);pr\.life=0;continue;/);
  // STRIKE: from real height only — the perch or the hook — never a hop.
  const pur = fn('updateColossusPursuit');
  assert.match(pur, /\(p\.slamFromY\|\|0\)-e\.y>=300/, 'a strike from above means from above');
  assert.match(source, /p\.slamming = true; p\.slamFromY = p\.y;/, 'and the slam records where it started');
  // The rings ARE the wind-up: every attack raises the same arm.
  assert.match(pur, /else\{P\.state='sweepWind';P\.t=\.7;\s*G\.aoes\.push\(\{x:e\.x\+e\.face\*140,y:10,r:120,t:\.7,/, 'the sweep ring is on the floor for the whole wind');
  assert.match(fn('finishColossus'), /colossusBodyBridge\(\);\s*latchFoundryColossus\(\);/, 'and the end is the same bridge and latch');
});

test('the crane: Oren runs the hook, and the chimney is the way without him', () => {
  const C = SHAFT.obstacles.filter(o => o.colossusCrane);
  const faces = C.filter(o => o.type === 'wall' && o.clingSurface).sort((a, b) => a.x - b.x);
  assert.equal(faces.length, 2, 'the mast and a face behind it');
  assert.ok(faces[1].x - faces[0].x >= 160 && faces[1].x - faces[0].x <= 190, 'a chimney you can wall-jump');
  const perch = C.find(o => o.cranePerch);
  assert.ok(perch.y - faces[1].y <= 20 && perch.x - perch.w / 2 <= faces[1].x + faces[1].w / 2, 'the perch is on the mast top');
  assert.ok(perch.y >= 300 + 112, 'high enough for a real strike onto its head');
  const pad = C.find(o => o.craneControl);
  assert.ok(pad.sendPost && pad.followerOnly, 'a pad the Foundry\'s Oren can hold (he is not a relay traveler)');
  // Run the hook: parked far from the mast, it answers only a held pad.
  const { g, ctx } = realm(), hook = g.obstacles.find(o => o.craneHook);
  assert.ok(hook.x0 > 13800, 'parked at the far end of the jib, out of the drop from the perch');
  const boss = { x: 13600, dead: false };
  for(let i = 0; i < 120; i++) ctx.updateColossusCrane(boss, 1 / 60);
  assert.equal(hook.hookState, 'park', 'it does nothing without Oren');
  g.obstacles.find(o => o.craneControl).pressed = true;
  const seen = [];
  for(let i = 0; i < 60 * 12; i++){ ctx.updateColossusCrane(boss, 1 / 60); if(!seen.includes(hook.hookState)) seen.push(hook.hookState); }
  assert.deepEqual([...seen], ['down', 'wait', 'up', 'over', 'hold', 'home'], 'down to you, up, over the machine, hold, and home');
  assert.match(source, /if\(p\.slamming&&fl\.o&&fl\.o\.craneHook\)fl=\{y:-200,o:null\};/, 'a strike from the hook goes through it');
});

test('the boss stays dead, and the pit is a monument when you come back', () => {
  assert.match(source, /bossSkipCircuit:'foundry-colossus'/, 'the region latches');
  assert.match(source, /BFZoneStateModule\.hydrate\(zs,L\.bossSkipZone/, 'read from the save, not from G.persistentCircuits, which is empty this early in loadStage');
  const cooled = build(null);
  const cbeds = cooled.obstacles.filter(o => o.castingBed);
  assert.ok(cbeds.length === 6 && cbeds.every(m => m.heatSet), 'every mould finished');
  const body = cooled.obstacles.find(o => o.colossusBody);
  assert.ok(body, 'and its body is the bridge east');
  assert.equal(body.x - body.w / 2, 14400); assert.equal(body.x + body.w / 2, 15400);
  assert.ok(body.slate, 'slate, so you can still set mouths on it');
});

test('phase 1 is unchanged, and the old second and third acts are gone', () => {
  assert.equal(G.obstacles.filter(o => o.type === 'trap').length, 0, 'nothing hangs over the bed');
  assert.ok(!/spawnFoundryOrphan\(e,bed\)/.test(fn('releaseColossusPour')), 'no add spawns mid-pour');
  const upd = fn('updateColossusForge');
  assert.match(upd, /forgeHammerMelt/, 'the hammer opens the floor ON the blow, not when the warning is drawn');
  assert.match(upd, /Math\.abs\(stand\.x-e\.x\)<=COLOSSUS_BED_STEP/, 'and it has to be standing at the bay');
  assert.match(upd, /if\(e\.forgeAct===2\)\{updateColossusAscent\(e,p,dt\);return;\}/, 'phase 2 has its own update');
  assert.match(upd, /if\(e\.forgeAct===3\)\{updateColossusPursuit\(e,p,dt\);return;\}/, 'and so does phase 3');
  // Cut (owner): the conveyor bed, the fronts, the last order and its lid and tank.
  for(const gone of ['beginColossusMount', 'startColossusFront', 'beginLastOrder', 'updateLastOrder', 'spillFoundryCap', 'foundryDumpChannel'])
    assert.ok(!source.includes('function ' + gone + '('), `${gone} is back`);
  assert.equal(G.obstacles.filter(o => o.sluiceShelf || o.sluiceStep || o.foundryLid || o.foundryGate).length, 0, 'and none of their pieces');
});

test('the next bay is legible, and the refusal is reachable', () => {
  // Nothing marked the banked mould while the machine walked at it: the whole fight
  // was a race to a target the game never showed. Two of six bays have no spout
  // (the header stands over them), so the MOULD carries the tell and the spout
  // agrees with it.
  assert.match(renderer, /function bankedCollar/, 'the banked mould wears a collar');
  assert.match(renderer, /forgeTargetBed === o/, 'read straight off the machine');
  assert.match(renderer, /forgeHammerBed === o/, 'and the hammer target wears a shadow instead');
  assert.match(fn('updatePourSpouts'), /forgeTargetBed\|\|fb\.forgeHammerBed/, 'the spouts follow the machine, not the bed clock');
  // The body stands behind the bench, out of a sword's reach on purpose. A jammed
  // arm is left in the mould, on the bed, and that is what the refusal opens up.
  assert.match(fn('resolveColossusQuench'), /forgeArmStuck=mould\.x/, 'a jam leaves the arm in the stone');
  assert.match(source, /const armX=\(e\.colossusForge&&e\.forgeArmStuck!=null/, 'and melee finds it there');
  assert.match(renderer, /benchBoss\) drawColossusFigure\(benchBoss\)/, 'it draws behind the bed');
  assert.match(renderer, /if\(e !== benchBoss\)/, 'and only once');
});

test('the fight reads with the sound off', () => {
  assert.match(renderer, /function heatCrater/, 'craters and a notch tally: the bed is the health bar');
  assert.match(renderer, /o\.stackDark/, 'one flue goes dark per refusal');
  assert.match(renderer, /forgeQuenches \|\| 0\) \/ 8/, 'the core seam narrows as it cools');
  assert.match(renderer, /function drawFoundryAOE/, 'and the arena draws its own warnings in the pixel frame');
  assert.match(renderer, /drawFoundryAOE\(a\)\) legacyDraw/, 'wired into the dispatch chain');
  assert.match(renderer, /const still = !!\(curEnv && curEnv\.reducedMotion\)/, 'the tread holds still under reduced motion');
});

test('nothing here is HP-keyed, and the legacy fight is left alone', () => {
  assert.match(source, /if\(!e\.whiteCourtFight&&!e\.colossusForge&&hpR<0\.50/, 'the generic enrage does not touch the authored acts');
  assert.match(source, /if\(e\.type==='colossus'&&!e\.colossusForge/, 'and the legacy rush AI does not run beside them');
  const advance = fn('advanceColossusAct');
  //   THREE REFUSALS, COUNTED AS REFUSALS. This asserted `forgeQuenches>=3`, which reads
  // as three but is a sum of GRADES — 1.0 for beating the arm to the bed, 0.45 for
  // capping the pour with the arm still in it — so a player leaning on the panic answer
  // owed seven. Owner: "reduce the number of hits required to move to phase 2 from all
  // of them (current) to just 3." The grade still decides damage, stun and blow-back.
  assert.match(advance, /if\(\(e\.forgeRefusals\|\|0\)>=3\)beginColossusAscent\(e\);/, 'three refusals start the climb');
  assert.match(fn('resolveColossusQuench'), /e\.forgeRefusals=\(e\.forgeRefusals\|\|0\)\+1;/,
    'and a refusal counts once however it was earned');
  // Each one pays two measures back, because the act had no other source of healing.
  assert.match(fn('resolveColossusQuench'), /restoreBlood\(G\.p,2\)/, 'a refusal pays Blood');
  assert.doesNotMatch(advance, /hp/, 'and never HP');
  assert.match(fn('setupFoundryBoss'), /finalePhases:\['the bed','the climb','the turn'\]/, 'three phases on the HUD');
});

/* THE SECOND PLAYTEST PASS, 2026-09-21. Owner, on the Foundry: "the first phase of ember
   colossus is too hard"; "in phase 3, if oren is on this side of the wall, you can't send
   him to activate the platform, as he can't pass through the wall"; "he doesn't shoot his
   fireball that you need to counter/have hit a portal often enough… it is needed for 2 of
   his 3 needed hits"; "if you die during phase 2, it should reset you to start of phase 2.
   Same with phase 3." */
test('the crane pad stands where the companion it belongs to can walk to it', () => {
  const crane = fn('installColossusCrane');
  const walls = [...crane.matchAll(/Wl\((\d+),(\d+),(\d+)\)/g)].map(m => Number(m[1]));
  const pad = /Plate\((\d+),0,'colossus-crane'/.exec(crane);
  assert.ok(walls.length >= 2 && pad, 'the crane has its two faces and its pad');
  const padX = Number(pad[1]);
  // The two faces are the KNIGHT's chimney to the perch, and they rise from the floor.
  // An escort has no climb at all, so a pad between them is a pad only the one body that
  // cannot reach it was ever asked to stand on.
  for(const wx of walls)
    assert.ok(padX > wx + 40, `the pad at ${padX} is behind the crane face at ${wx}`);
});

test('the slug that opens two of the three plates runs on its own clock', () => {
  const pursuit = fn('updateColossusPursuit');
  // It used to live inside the ranged branch, which only runs at dist>=260 and then only
  // on alternate picks — while the thing walks at you at 150 u/s all act.
  assert.match(pursuit, /const needsSlug=!\(e\.plates&&e\.plates\.counter&&e\.plates\.portal\);/,
    'it keeps firing while either plate it feeds is shut');
  assert.match(pursuit, /P\.slug=\(P\.slug==null\?2\.0:P\.slug\)-dt;/, 'on a timer, not a distance test');
  assert.match(pursuit, /if\(P\.slug<=0&&needsSlug\)\{\s*\n\s*P\.slug=2\.0;P\.state='slugWind';/,
    'every 2.0 s of clock — a measured 2.72 s of wall time, at any range');
  // And the two plates really are opened by that projectile and nothing else.
  assert.match(source, /breakColossusPlate\(e,pr\.forgedSlug\?'portal':'counter'\)/,
    'countering it opens one plate and putting it through a mouth opens the other');
});

test('an act is a checkpoint: a death inside acts 2 or 3 resumes there', () => {
  assert.match(source, /let colossusActCheckpoint=0;/, 'the attempt remembers its act');
  assert.match(fn('die'), /colossusActCheckpoint=Math\.max\(colossusActCheckpoint,G\.boss\.forgeAct\|\|1\)/,
    'a death records it before the reload');
  assert.match(fn('loadStage'), /if\(i!==10\)colossusActCheckpoint=0;/,
    'and leaving the region clears it — it is a retry, not an unlock');
  assert.match(fn('finishColossus'), /colossusActCheckpoint=0;/, 'the kill clears it too');
  const setup = fn('setupFoundryBoss');
  assert.match(setup, /if\(colossusActCheckpoint>=2\)\{/, 'the rebuilt boss resumes the act');
  assert.match(setup, /beginColossusAscent\(e\);/);
  assert.match(setup, /if\(colossusActCheckpoint>=3\)enterColossusAct3\(e\);/);
  // Act 3 must be enterable WITHOUT the valve object, or a resumed act 3 needs a valve
  // to break a second time.
  assert.match(source, /function enterColossusAct3\(e\)\{/, 'the act is separable from its trigger');
  assert.doesNotMatch(fn('enterColossusAct3'), /\bo\./, 'and does not reach for the valve');
  // die() repositions AFTER loadStage, so the act's own spawn has to win.
  assert.match(fn('die'), /G\.p\.x=COLOSSUS_SHAFT\.floor;G\.p\.y=0;/,
    'a restored act keeps its own spawn inside the shaft');
});
