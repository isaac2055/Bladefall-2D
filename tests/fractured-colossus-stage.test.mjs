// The Fractured Colossus: Act Three's eleventh echo (stage 31). A B-side of the Foundry with the machine warm:
// the Anvil (the downward strike, where it was; its mould set opens the bars), the Casting Line (moulds that are
// never solid together — set each to wait on it), the Shaft (moulds up a wet chimney, lava rising behind you,
// the valve) — and a C-side: the Warm Machine (a refused pour, a countered slug, a strike from above).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fc = read('bladefall-fractured-colossus.js');
const art = read('bladefall-fractured-colossus-art.js');
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
  + '\n' + act + '\n' + core + '\n' + fc, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FC = sandbox.window.BladefallFracturedColossus;
const K = FC.constants;
const L = ACT.level(31);
// Measured (7.211, scripted input in the browser): a jump 78; a double jump from a standstill ~147 (with the second
// press after the first is released); a standing jump from a mould crossed ~140; the knight's rise and fall are
// p.vy < 0 up; releasing jump cuts an upward throw unless jumpCutOk is off.
const M = { jump:78, dj:147, standJump:140 };

test('stage 31 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /31:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(31\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 31, 'the moulds cycle only inside V4');
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b31\b[^\]]*\]\)/);
  assert.match(source, /31:Object\.freeze\(\{id:'fractured-colossus-road',src:'\.\/audio\/music\/fractured-the-obsidian-foundry\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-the-obsidian-foundry.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-forge-of-the-molten-colossus.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Colossus'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fe-fcl', 'fractured-emberdeep', 'east', 'walk', 0\.5, 'fractured-colossus', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(10), 31);
  assert.match(fnFrom(fc, 'seamSpec'), /connector:'fe-fcl', zone:ZONE, targetStage:30/);
  assert.match(fnFrom(fc, 'seamSpec'), /A\.machined \? F\.seamOn\(STAGE, ZONE, 'fcl-fi', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-emberdeep.js'), 'arrival'), /plan\.connectorId === 'fe-fcl'/);
  assert.match(fnFrom(fc, 'update'), /THE FRACTURED INVERSION/);
});

test('THE FOUNDRY\'S KIT: through Companion Command; the downward strike at the anvil, where it was', () => {
  assert.match(fnFrom(fc, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement', 'companion-command'\]/);
  assert.match(fnFrom(fc, 'init'), /A\.strike \? ids\.concat\('downward-strike'\) : ids/);
  assert.match(fnFrom(fc, 'anvil'), /F\.grant\('downward-strike'\)/);
  assert.ok(K.ANVIL.x < K.ANVIL.mould.x && K.ANVIL.mould.x < K.ANVIL.bars, 'the strike, then its first use, then the bars it opens');
  const ped = L.objects.find(o => o.actArt === 'pedestal'), m = L.objects.find(o => o.fclAnvil);
  assert.equal(ped.y, m.y - m.h, 'iron under the mould: stood on, never jumped at from under');
  assert.match(fnFrom(fc, 'anvil'), /m\.heatSet\)\{ A\.anvil = true[^}]*setBars\('anvil', true\)/);
});

test('THE CASTING LINE: never two neighbours solid together; a standing jump reaches the next', () => {
  const H = K.LINE.heat, solid = (1 - H.molten) * H.period;
  assert.ok(solid < H.period / 2, 'each solid for less than half its cycle');
  const line = L.objects.filter(o => o.fclLine && o.fclShaft == null).sort((a, b) => a.x - b.x);
  assert.equal(line.length, K.LINE.n);
  for(let i = 1; i < line.length; i++){
    assert.ok(Math.abs(Math.abs(line[i].heatCycle.phase - line[i - 1].heatCycle.phase) - H.period / 2) < 1e-9, 'half a cycle apart');
    const gap = line[i].x - line[i].w / 2 - (line[i - 1].x + line[i - 1].w / 2);
    assert.ok(gap < M.standJump - 30, `a standing jump crosses it with room to strike down (${gap})`);
  }
  assert.ok(K.GROUND[0][1] < line[0].x - line[0].w / 2 && K.GROUND[1][0] > line[line.length - 1].x + line[line.length - 1].w / 2, 'no floor under them');
  assert.match(fnFrom(fc, 'warmth'), /o\.fclKeep \|\| o\.fclLine/, 'the road\'s set moulds stay set; only the machine\'s bed warms back');
});

test('THE SHAFT: moulds up a wet chimney, lava behind at less than the climb\'s own pace, the valve', () => {
  const S = K.SHAFT_LEDGES;
  let prev = 0;
  for(const l of S){ const rise = l[1] - prev; assert.ok(rise > M.jump && rise < M.dj - 40, `a double jump with room to strike (${rise})`); prev = l[1]; }
  for(let i = 1; i < S.length; i++) assert.ok(Math.abs(S[i][0] - S[i - 1][0]) >= 90, 'alternating sides: climbed from beside, never from under');
  const beat = (S[1][1] - S[0][1]) / (K.LINE.heat.period / 2);
  assert.ok(K.LAVA.speed < beat, `the lava (${K.LAVA.speed}) is slower than a climber on the beat (${beat.toFixed(0)}/s)`);
  for(const w of L.objects.filter(o => o.type === 'wall' && (o.x === K.SHAFT.x0 || o.x === K.SHAFT.x1))) assert.ok(w.noCling && w.slickL && w.slickR, 'wet: no wall-jumping it');
  const bars = L.objects.find(o => o.actBars === 'valve');
  assert.equal(bars.y - bars.h, 0, 'the valve\'s bars run to the floor: no walking round them');
  assert.match(fnFrom(fc, 'shaft'), /p\.slamming && Math\.abs\(p\.x - SHAFT\.valve\.x\)/, 'the valve takes a downward strike');
});

test('THE WARM MACHINE: refuse the pour, counter the slug, strike from above', () => {
  assert.equal(K.W.phases.length, 3); assert.ok(K.W.phases.every(ph => ph.marks === 2));
  const g = fnFrom(fc, 'updateMachine');
  assert.match(g, /if\(b && b\.heatSet\)\{ b\.heatSet = false; b\.fclSetT = 0;[^}]*mark\(A, e, 'refused'\)/, 'a set bay refuses the pour');
  assert.match(fnFrom(fc, 'nearestBay'), /Math\.abs\(o\.x - p\.x\)/, 'it pours where you stand');
  assert.ok(K.SET_HOLDS > K.W.pour.gather + K.W.pour.pour, 'set stone holds through a pour, then warms back');
  assert.match(fnFrom(fc, 'slugs'), /A\.phase === 1 && e\.st !== 'stagger'\) mark\(A, e, 'counter'\)/);
  assert.match(fnFrom(fc, 'slugs'), /pr\.fclBack = 1; pr\.life = 4/, 'a countered slug lives long enough to come home');
  assert.match(fnFrom(fc, 'slug'), /puzzleOnly:1/);
  assert.match(g, /mark\(A, e, 'from above'\);/, 'the head strike is scored (once lost to a trailing comment)');
  assert.match(g, /p\.vy = -900; p\.vx = -60; p\.jumpCutOk = false/, 'thrown back up onto the deck');
  const deck = K.GANTRY.deck;
  assert.ok(deck.x + deck.w / 2 < K.COLOSSUS.x - K.COLOSSUS.w / 2, 'the deck ends short of its head');
  assert.ok(deck.y - (K.COLOSSUS.h) >= K.W.slam.from, 'a strike begun on the deck is high enough');
  assert.match(g, /e\.sweepX = GANTRY\.deck\.x \+ GANTRY\.deck\.w \/ 2/, 'the arm sweeps the deck only');
  for(let i = 0; i < K.GANTRY.ledges.length; i++){ const l = K.GANTRY.ledges[i], prevY = i ? K.GANTRY.ledges[i - 1][2] : 0; assert.ok(l[2] - prevY < M.dj - 15, 'each gantry step within a double jump'); }
  assert.match(fnFrom(fc, 'update'), /A\.fight && \(p\.dead \|\| p\.x < ARENA\.x1 - 20\)\) resetMachine\(A\)/, 'a fall into the bed rewinds outside the gate: the fight starts again');
  assert.match(fnFrom(fc, 'mark'), /kit\.latch\(ZONE, 'fcl-machine-' \+ \(A\.phase \+ 1\)\)/, 'a finished act is kept');
});

test('the art is registered: the moulds\' states and the set sheen, the valve, the lava, the machine', () => {
  assert.match(art, /ART\.register\(31, /);
  assert.match(fnFrom(art, 'plat'), /case 'mould':/);
  assert.match(fnFrom(art, 'object'), /case 'actValve':/);
  assert.match(fnFrom(art, 'object'), /case 'actLava':/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'machine'/);
});

test('retry preserves the act but clears slugs, aim, dialogue and unfinished marks', () => {
  const A={phase:2,marks:1,fight:true,volley:3,aoes:[{}],sweeps:[{}],queue:[{}],machine:{st:'twin',t:.8,bay:{},sweepX:7200,twinLeft:1}};
  const G={p:{fclSlamFrom:500},projectiles:[{fclSlug:1,life:4},{life:3}]};
  const c=vm.createContext({A,G,Object,setBars(){}});
  vm.runInContext(fnFrom(fc,'resetMachine')+';resetMachine(A)',c);
  assert.equal(A.phase,2);assert.equal(A.marks,0);assert.equal(A.machine.st,'wait');assert.equal(A.machine.bay,null);
  assert.equal(A.machine.twinLeft,0);assert.equal(A.aoes.length,0);assert.equal(A.queue.length,0);
  assert.equal(G.p.fclSlamFrom,null);assert.equal(G.projectiles[0].life,0);assert.equal(G.projectiles[1].life,3);
});

test('dead players cannot advance the machine or claim anvil progress', () => {
  const e={t:.2},p={dead:true},A={};
  const c=vm.createContext({e,p,A});
  vm.runInContext(fnFrom(fc,'updateMachine')+';updateMachine(A,e,p,.5);'+fnFrom(fc,'anvil')+';anvil(A,p)',c);
  assert.equal(e.t,.2);assert.equal(A.anvil,undefined);
});

test('machine knockback lifts using the engine negative-up velocity', () => {
  const p={dead:false,invuln:0,dodgeTimer:0};
  const c=vm.createContext({p,hurtPlayer(){}});
  vm.runInContext(fnFrom(fc,'harm')+';harm(p,-1,18)',c);
  assert.equal(p.vx,-280);assert.equal(p.vy,-260);assert.equal(p.jumpCutOk,false);
});

test('completed save restores the kneeling machine', () => {
  const A={machined:true};
  const c=vm.createContext({A,COLOSSUS:K.COLOSSUS,spawnEnemy:()=>({}),Object});
  vm.runInContext(fnFrom(fc,'spawnMachine')+';spawnMachine(A)',c);
  assert.equal(A.machine.st,'down');
});

test('targeted pour cue uses the actual splash reach and height', () => {
  const boxes=[],A={fight:true,phase:0,machine:{st:'gather',t:.5,bay:{x:7000,w:120}}};
  const api={Z:1.5,B:(...b)=>boxes.push(b),WX:x=>x*1.5,WY:y=>600-y*1.5};
  const c=vm.createContext({api,A,K:()=>({constants:K}),C:{setLit:'set',lavaLit:'hot'},Math});
  vm.runInContext(fnFrom(art,'machineTells')+';machineTells(api,A)',c);
  assert.equal(boxes[0][0],(7000-K.W.pour.reach)*1.5);assert.equal(boxes[0][2],K.W.pour.reach*3);
  assert.equal(boxes[1][3],90);
});
