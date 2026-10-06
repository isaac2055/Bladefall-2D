// The Fractured Keep: Act Three's sixth echo (stage 26). A B-side of the Ruined Keep with every gate
// open — your own twin mouths turn a fall into a rise, carry the keystone to its dock, the Grip, the
// wet Archive — and a C-side: the Belfry, where the bell-stone is thrown through your mouths into a
// swinging cradle.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fk = read('bladefall-fractured-keep.js');
const art = read('bladefall-fractured-keep-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fk, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FK = sandbox.window.BladefallFracturedKeep;
const K = FK.constants;
const L = ACT.level(26);
const one = (p) => { const r = L.objects.filter(p); assert.equal(r.length, 1); return r[0]; };
// Measured (7.206): a knight 44 tall; jump 78; a mouth's exit speed is its entry speed; out of the Refectory's
// balcony after the 480 drop he rose to 730; a keystone out of a wall mouth at ~1360 crosses y 320 ~600 on.
const M = { jumpApex:78, head:44, earlyDashTop:153, refectoryApex:730, throwAt320:600 };

test('stage 26 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /26:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(26\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 26);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b26\b[^\]]*\]\)/);
  assert.match(source, /26:Object\.freeze\(\{id:'fractured-keep-road',src:'\.\/audio\/music\/fractured-stony-whispers-of-the-keep\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-stony-whispers-of-the-keep.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Keep'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fm-fk', 'fractured-marksman', 'east', 'walk', 0\.5, 'fractured-keep', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(5), 26);
  assert.match(fnFrom(fk, 'seamSpec'), /connector:'fm-fk', zone:ZONE, targetStage:24/);
  assert.match(fnFrom(fk, 'seamSpec'), /A\.rung \? F\.seamOn\(STAGE, ZONE, 'fk-fw', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-marksman.js'), 'arrival'), /plan\.connectorId === 'fm-fk'/);
  assert.match(fnFrom(fk, 'update'), /THE FRACTURED WARDEN/);
});

test('THE KEEP\'S KIT: jump, blade, dash, twin mouths — and the Grip once taken', () => {
  assert.match(fnFrom(fk, 'init'), /\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair'\]\)/);
  assert.equal(one(o => o.actId === 'grip').actVerb, 'TAKE THE GRIP');
  assert.match(fnFrom(fk, 'interact'), /F\.grant\('wall-jump'\)/);
  assert.match(fnFrom(core, 'grant'), /setKit\(ids\)/, 'the core grants for the session only');
  assert.ok(K.GRIP.x > K.DOCK.x, 'the Grip is past the hall\'s gate');
});

test('THE REFECTORY: the drop perch, a floor mouth under it, a balcony mouth — exactly over the screen', () => {
  const perch = K.LEDGES.find(l => l[2] === 480), balcony = K.LEDGES.find(l => l[3] && l[2] === 240);
  const floor = K.FLOOR_SLATES[0];
  assert.equal(perch[0], floor[0], 'the floor slate is under the perch');
  // A mouth's exit speed is its entry speed: you rise out of the balcony as far as you fell into the floor.
  assert.ok(balcony[2] + perch[2] > K.SCREEN.h + 40, 'high enough to clear the screen');
  assert.ok(M.refectoryApex > K.SCREEN.h + 60, 'measured: the rise clears it');
  assert.ok(K.SCREEN.h > M.earlyDashTop + 200, 'and nothing else does');
  assert.ok(balcony[0] < K.SCREEN.x && K.SCREEN.x - balcony[0] < 200, 'the balcony sits close enough under the screen to carry over it');
  const scr = one(o => o.actArt === 'screen'); assert.ok(scr.noCling && scr.slickL && scr.slickR, 'wet: nothing clings');
});

test('THE WEIGHT HALL: the keystone through your mouths onto the dock opens the hall', () => {
  const ks = one(o => o.fkKeystone);
  assert.equal(ks.keepMasonry, 1, 'a keystone clears your mouths when it passes (it cannot loop)');
  assert.equal(K.KEYSTONE.x, K.FLOOR_SLATES[1][0], 'a floor slate under the hoist');
  assert.ok(K.LEDGES.some(l => l[3] && l[0] === K.DOCK.x && l[2] === K.DOCK.y), 'a slate on the dock');
  assert.equal(one(o => o.type === 'plat' && o.dropOnCircuit === 'fk-drop').y, K.KEYSTONE.shelf);
  assert.equal(one(o => o.type === 'lever' && o.id === 'fk-drop').dur, K.RELEASE.dur);
  assert.match(fnFrom(fk, 'dock'), /Math\.abs\(k\.y - DOCK\.y\) < 14/, 'a crate\'s y is its foot');
  assert.match(fnFrom(fk, 'dock'), /kit\.latch\(ZONE, 'fk-docked'\); setBars\('hall-gate', true\)/);
  // Nothing between the keystone's hoist and its floor slate (a stair once caught it).
  const hoistX = K.KEYSTONE.x;
  for(const l of K.LEDGES) if(l[2] < K.KEYSTONE.shelf) assert.ok(Math.abs(l[0] - hoistX) > l[1] / 2 + 20, `the ledge at ${l[0]} is clear of the keystone's fall`);
});

test('THE ARCHIVE: in under the outer wall, up the chimney, the wet band climbed on one wall', () => {
  const outer = K.WALLS.find(w => w[0] === 7300), wet = K.WALLS.find(w => w[0] === 7460 && w[4] === 'L');
  assert.ok(outer[1] - outer[2] >= 60, 'hung high enough to walk under');
  assert.equal(outer[4], 'L', 'its outside is wet: no climbing it from outside');
  assert.ok(wet[1] - wet[2] >= 200 && wet[1] <= 700, 'the wet band on the inner wall\'s inside');
  assert.equal(K.WALLS.find(w => w[0] === 7920)[4], 'L', 'the east wall is met from the crown, over the top');
  assert.ok(K.LEDGES.find(l => l[0] === 7700)[2] > 900, 'the crown');
});

test('THE BELFRY: the bell-stone thrown through your mouths into the swinging cradle', () => {
  const band = K.BELFRY_SLATE, belfryWall = K.WALLS.filter(w => w[0] === band.x);
  assert.ok(band.h >= 100, 'the band is taller than the knight clinging in it (' + M.head + ')');
  const bandObj = L.objects.find(o => o.slate && o.type === 'wall');
  const first = L.objects.findIndex(o => o.type === 'wall' && o.x === band.x);
  assert.equal(L.objects[first], bandObj, 'the band is found before the stone around it');
  assert.ok(belfryWall.some(w => w[1] - w[2] === 60), 'the wall hangs from 60: walk in under it, a jump reaches its face');
  assert.equal(K.HOIST.x, K.FLOOR_SLATES[2][0], 'a floor slate under the bell-stone');
  const c = one(o => o.fkCradle);
  assert.deepEqual({ dx:c.move.dx, period:c.move.period }, { dx:K.CRADLE.dx, period:K.CRADLE.period }, 'the cradle rides the engine\'s oscillator');
  assert.ok(Math.abs(K.CRADLE.x - (band.x + 15 + M.throwAt320)) < K.CRADLE.dx, 'the throw comes down inside the cradle\'s swing');
  // Strict: the cradle is under the landing point for ~0.4 s twice a swing (measured).
  const passSpeed = K.CRADLE.dx * 2 * Math.PI / K.CRADLE.period;
  assert.ok(K.CRADLE.w / passSpeed < 0.35, 'a narrow window');
  assert.match(fnFrom(fk, 'cradle'), /kit\.latch\(ZONE, 'fk-bell'\); setBars\('tower-gate', true\)/);
  assert.equal(one(o => o.fkBellStone).keepMasonry, 1);
});

test('the art is registered: slate, wet stone, the band, the cradle and its chain', () => {
  assert.match(art, /ART\.register\(26, /);
  assert.match(fnFrom(art, 'object'), /case 'slatewall':/);
  assert.match(fnFrom(art, 'object'), /case 'wet': case 'screen':/);
  assert.match(fnFrom(art, 'world'), /o\.fkCradle/);
});

test('completed weights restore into their seats and remain attached after hydration and swing', () => {
  const stone={fkKeystone:1,x:3920,y:726,vy:90,_portalExit:{}},bell={fkBellStone:1,x:8960,y:726,vx:800,stuck:2};
  const cradle={fkCradle:1,x:9370,y:320};
  const ctx=vm.createContext({Object,DOCK:K.DOCK,G:{obstacles:[stone,bell,cradle]}});
  vm.runInContext(['seatWeight','seatWeights'].map(n=>fnFrom(fk,n)).join('\n'),ctx);
  const A={docked:true,rung:true};ctx.seatWeights(A);
  assert.equal(stone.x,K.DOCK.x);assert.equal(stone.y,K.DOCK.y);assert.equal(stone._portalExit,null);
  assert.equal(bell.x,9370);assert.equal(bell.y,320);assert.equal(bell.keepSeated,true);assert.equal(bell.vx,0);
  cradle.x=9210;bell.x=8960;bell.y=726;bell.keepSeated=false;
  ctx.seatWeights(A);assert.equal(bell.x,9210);assert.equal(bell.yPrev,320);assert.equal(bell.keepSeated,true);
  assert.equal(stone.fkDocked,true);assert.equal(bell.fkRung,true);
  assert.match(source,/if\(o\.keepSeated\)\{o\.vx=o\.vy=0;continue;\}/);
});

test('the cradle rejects a passing stone and latches a resting one only once', () => {
  const stone={fkBellStone:1,x:9300,y:320,vy:200},cradle={fkCradle:1,x:9300,y:320};
  const latches=[],bars=[];
  const ctx=vm.createContext({Math,CRADLE:K.CRADLE,BELL:K.BELL,ZONE:'fractured-keep',STAGE:26,
    G:{obstacles:[stone,cradle]},kit:{latch:(z,id)=>latches.push(id)},setBars:(...a)=>bars.push(a),F:{clear(){}},meta:{soundOn:false}});
  vm.runInContext(fnFrom(fk,'cradle'),ctx);
  const A={rung:false,queue:[]};ctx.cradle(A);assert.equal(A.rung,false);
  stone.vy=0;ctx.cradle(A);ctx.cradle(A);
  assert.equal(A.rung,true);assert.deepEqual(latches,['fk-bell']);assert.deepEqual(bars,[['tower-gate',true]]);
});

test('stone art is opt-in and the cradle landing rim matches its collision top', () => {
  assert.ok(L.objects.filter(o=>o.fkKeystone||o.fkBellStone).every(o=>o.actArt==='keystone'));
  assert.match(renderer,/case 'crate': if\(o\.actArt && ext\('object', o\)\) break; drawCrate\(o\); break;/);
  const calls=[],ctx=vm.createContext({Math,C:{iron:'iron',ironLit:'rim',bronzeLit:'gold'},st:()=>({rung:false})});
  vm.runInContext(['span','plat'].map(n=>fnFrom(art,n)).join('\n'),ctx);
  const api={B:(...a)=>calls.push(a),WX:x=>x/2,WY:y=>500-y/2,Z:.5,bw:600,bh:500,camX:0,glow(){}};
  ctx.plat(api,{x:300,w:74,y:320,h:12,actArt:'cradle'});
  assert.ok(calls.some(a=>a[1]===340&&a[3]===1&&a[4]==='rim'));
});

test('a dead player cannot take the Grip or finish a mechanism', () => {
  const ctx=vm.createContext({G:{actTwo:{stage:26},p:{dead:true}},STAGE:26});
  vm.runInContext(fnFrom(fk,'interact'),ctx);assert.equal(ctx.interact({actId:'grip'}),false);
  assert.match(fnFrom(fk,'update'),/if\(!p\.dead\)\{ dock\(A\); cradle\(A\); \}/);
});
