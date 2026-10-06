// The Fractured Emberdeep: Act Three's tenth echo (stage 30). A B-side of Emberdeep with the Foundry cold:
// the Pour Schedule walked backwards (the cooling runs against you), the Slag Stair up a wet forge wall, the
// Command Post with no one to command — and a C-side: the Purge, a sweep of fire faster than a run, survived
// only on the slabs it cools as it passes.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fe = read('bladefall-fractured-emberdeep.js');
const art = read('bladefall-fractured-emberdeep-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam', 'Trap'].map(n => fnFrom(source, n)).join('\n')
  + '\n' + act + '\n' + core + '\n' + fe, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FE = sandbox.window.BladefallFracturedEmberdeep;
const K = FE.constants;
const L = ACT.level(30);
// Measured (7.210, scripted input in the browser): a run 211 u/s; a running jump 148 far; a double jump and a dash
// 191 high, the dash carrying ~185 across; a slag lands as a 58 step; without the slag a double jump and a dash
// falls short of each stair ledge; a runner who never stops is caught by the purge just past the first refuge.
const M = { run:211, jumpFar:148, djDash:191, slag:58 };

test('stage 30 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /30:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(30\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 30, 'the heat slabs, slag and spouts run only while the stage is inside V4');   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b30\b[^\]]*\]\)/);
  assert.match(source, /30:Object\.freeze\(\{id:'fractured-emberdeep-road',src:'\.\/audio\/music\/fractured-embers-of-the-weary-forge\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-embers-of-the-weary-forge.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-the-eternal-furnace.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Emberdeep'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fs-fe', 'fractured-sorcerer', 'east', 'walk', 0\.5, 'fractured-emberdeep', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(9), 30);
  assert.match(fnFrom(fe, 'seamSpec'), /connector:'fs-fe', zone:ZONE, targetStage:29/);
  assert.match(fnFrom(fe, 'seamSpec'), /A\.purged \? F\.seamOn\(STAGE, ZONE, 'fe-fcl', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-sorcerer.js'), 'arrival'), /plan\.connectorId === 'fs-fe'/);
  assert.match(fnFrom(fe, 'update'), /THE FRACTURED COLOSSUS/);
});

test('EMBERDEEP\'S KIT: through Attunement; Companion Command at the post, where it was', () => {
  assert.match(fnFrom(fe, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement'\]/);
  assert.match(fnFrom(fe, 'init'), /A\.command \? ids\.concat\('companion-command'\) : ids/);
  assert.match(fnFrom(fe, 'post'), /F\.grant\('companion-command'\)/);
  assert.ok(K.POST.x > K.FORGE_WALL.x && K.POST.x < K.PURGE.x0, 'on the road, past the stair, before the purge');
});

test('THE POUR SCHEDULE, backwards: the slab ahead is always the first to melt; the gaps are past a running jump', () => {
  const slabs = L.objects.filter(o => o.heatCycle && o.x < K.GROUND[1][0]).sort((a, b) => a.x - b.x);
  assert.equal(slabs.length, K.POUR.n);
  for(let k = 1; k < slabs.length; k++){
    assert.ok(slabs[k].heatCycle.phase > slabs[k - 1].heatCycle.phase, 'each slab is further along its cycle than the one west of it');
    assert.ok(slabs[k].x - slabs[k].w / 2 - (slabs[k - 1].x + slabs[k - 1].w / 2) > M.jumpFar, 'past a running jump');
  }
  assert.ok(K.GROUND[0][1] < slabs[0].x - slabs[0].w / 2 && K.GROUND[1][0] > slabs[slabs.length - 1].x + slabs[slabs.length - 1].w / 2, 'no floor under them');
  for(const s of K.POUR_SPOUTS) assert.ok(L.objects.some(o => o.type === 'actSpout' && o.x === K.POUR.x0 + s.slab * K.POUR.step));
});

test('THE SLAG STAIR: each ledge is out of reach but for the slag landed below it; the forge wall is wet', () => {
  let prev = 0;
  for(let i = 0; i < K.STAIR.length; i++){
    const ledge = K.STAIR[i], rise = ledge[2] - prev, slag = K.SLAG[i];
    assert.ok(rise > M.djDash, `the ledge at ${ledge[2]} is out of reach without the slag (${rise})`);
    assert.ok(rise - M.slag <= M.djDash - 10, 'and in reach from its top');
    assert.equal(slag.floor, prev, 'the slag lands on the level below');
    const across = Math.abs(slag.x - (ledge[0] - Math.sign(ledge[0] - slag.x) * ledge[1] / 2));
    assert.ok(across >= 150, `the ledge is far enough across for the dash (${across})`);
    prev = ledge[2];
  }
  const wall = L.objects.find(o => o.type === 'wall' && o.x === K.FORGE_WALL.x);
  assert.ok(wall.noCling && wall.slickL && wall.slickR && wall.y < K.STAIR[K.STAIR.length - 1][2], 'wet, and lower than the top ledge');
  assert.ok(K.STAIR[K.STAIR.length - 1][0] + K.STAIR[K.STAIR.length - 1][1] / 2 >= K.FORGE_WALL.x - K.FORGE_WALL.w / 2 - 10, 'the top ledge runs to the wall');
  for(const o of L.objects.filter(o => o.type === 'trap')) assert.ok(o.slagCycle && o.slagReal);
});

test('THE PURGE: a sweep faster than a run; the refuges are cooled exactly while their sweep passes', () => {
  const P = K.PURGE;
  assert.ok(P.speed > M.run * 1.8, 'no one outruns it');
  const catchAt = M.run * (P.period - P.upT) * P.speed / (P.speed - M.run);
  assert.ok(catchAt < (P.x1 - P.x0) / 2, 'a runner who never stops is caught well short (' + Math.round(catchAt) + ')');
  const vents = L.objects.filter(o => o.fedPurge);
  for(const v of vents){ assert.ok(v.decorative, 'the engine only draws them: the echo\'s sweep rewinds'); assert.ok(Math.abs(v.phase + v.x / P.speed) < 1e-9); }
  for(const s of K.PURGE_SLABS){
    const o = L.objects.find(o => o.fedRefuge && o.x === s.x), H = K.PURGE_HEAT;
    assert.equal(H.period, P.period, 'one clock');
    // Its window opens `lead` before its sweep reaches its west edge and holds past the sweep's tail leaving its east edge.
    const opens = ((((s.x - s.w / 2) / P.speed - H.lead) % P.period) + P.period) % P.period;
    const f = ((((opens + o.heatCycle.phase) % P.period) + P.period) % P.period) / P.period;
    assert.ok(Math.abs(f - H.molten) < 1e-6, 'solid from lead before its sweep');
    const solid = (1 - H.molten) * P.period, needed = H.lead + (s.w + P.upT * P.speed) / P.speed + .15;
    assert.ok(solid > needed, `solid through its sweep (${solid.toFixed(2)} > ${needed.toFixed(2)})`);
    assert.ok(!vents.some(v => Math.abs(v.x - s.x) < s.w / 2), 'no vents on a refuge');
  }
  assert.match(fnFrom(fe, 'sweep'), /hurtPlayer\(0, 1, false\)/, 'caught: back to where the purge began');
  assert.doesNotMatch(fnFrom(fe, 'sweep'), /dodgeTimer/, 'no dashing through it');
  assert.ok(K.CHECKPOINTS.find(c => c.id === 'purge').x < P.x0);
});

test('the art is registered: the slabs\' three states and their warning, the slag, the vents, the spouts', () => {
  assert.match(art, /ART\.register\(30, /);
  assert.match(fnFrom(art, 'plat'), /case 'heat':/);
  assert.match(fnFrom(art, 'object'), /o\.type === 'trap' && o\.actArt === 'slag'/);
  assert.match(fnFrom(art, 'object'), /o\.type === 'spikes' && o\.actArt === 'vent'/);
  assert.match(renderer, /case 'trap': if\(o\.actArt && ext\('object', o\)\) break;/);
  assert.match(renderer, /case 'spikes': if\(o\.actArt && ext\('object', o\)\) break;/);
});

test('Purge sweep rewinds on an active floor vent, but not above it or on a refuge', () => {
  const vent=L.objects.find(o=>o.fedPurge),calls=[];
  const G={obstacles:[vent],time:-vent.phase+.1};
  const A={},p={x:vent.x,y:0,dead:false};
  const c=vm.createContext({G,A,p,Math,kit:{burst(){}},hurtPlayer:(...args)=>calls.push(args)});
  vm.runInContext(fnFrom(fe,'sweep')+';sweep(A,p)',c);
  assert.deepEqual(calls,[[0,1,false]]);assert.equal(A.swept,1);
  p.y=31;vm.runInContext('sweep(A,p)',c);assert.equal(calls.length,1);
  p.y=0;p.x=K.PURGE_SLABS[0].x;vm.runInContext('sweep(A,p)',c);assert.equal(calls.length,1);
});

test('Purge completion requires a living grounded player and ends its music state', () => {
  const A={purged:false},p={x:K.PURGE.x1+90,onGround:false};
  const c=vm.createContext({A,p,PURGE:K.PURGE,ZONE:'fractured-emberdeep',STAGE:30,kit:{latch(){}},F:{clear(){}},meta:{soundOn:false}});
  A.queue=[];vm.runInContext(fnFrom(fe,'purge')+';purge(A,p)',c);assert.equal(A.purged,false);
  p.onGround=true;p.dead=true;vm.runInContext('purge(A,p)',c);assert.equal(A.purged,false);assert.equal(A.inPurge,false);
  p.dead=false;vm.runInContext('purge(A,p)',c);assert.equal(A.purged,true);assert.equal(A.inPurge,false);
});

test('spout warning and pouring envelope cover the actual 44-unit damage corridor', () => {
  for(const Z of [.75,1,1.5]) for(const pouring of [false,true]){
    const boxes=[],o={type:'actSpout',x:200,y:520,w:40,warn:!pouring,pouring};
    const api={Z,time:0,B:(...b)=>boxes.push(b),WX:x=>x*Z,WY:y=>600-y*Z,glow(){}};
    const c=vm.createContext({api,o,st:()=>({}),C:{iron1:'iron',ironLit:'lit',iron0:'dark',lava:'lava',lavaLit:'bright',glassLit:'edge',ember:'255,140,60'},Math});
    vm.runInContext(fnFrom(art,'object')+';object(api,o)',c);
    assert.ok(boxes.some(b=>b[0]===(200-22)*Z&&b[2]===44*Z));
  }
});

test('world pass draws molten slabs skipped by the platform pass', () => {
  const molten={actArt:'heat',gone:true},solid={actArt:'heat',gone:false},drawn=[];
  const api={G:{obstacles:[molten,solid]},B(){},WX:x=>x,WY:y=>y};
  const c=vm.createContext({api,st:()=>({}),K:()=>({constants:{GROUND:[]}}),plat:(a,o)=>drawn.push(o)});
  vm.runInContext(fnFrom(art,'world')+';world(api)',c);
  assert.deepEqual(drawn,[molten]);
});
