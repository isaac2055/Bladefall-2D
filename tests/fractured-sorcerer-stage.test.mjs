// The Fractured Sorcerer: Act Three's ninth echo (stage 29). A B-side of the White Court, where nothing holds
// unless you feed it the cold: the Glassworks' bridge frozen only on the beat of the stream you route through
// the anchor, the Petition Gallery's intake set in a band of slate high on a wall — and a C-side: the Mirror,
// whose own spell must come back to it through your mouths, then by the Counter, then both.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fs = read('bladefall-fractured-sorcerer.js');
const art = read('bladefall-fractured-sorcerer-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam', 'LPortal', 'Anchor', 'RuneEmitter'].map(n => fnFrom(source, n)).join('\n')
  + '\n' + act + '\n' + core + '\n' + fs, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FS = sandbox.window.BladefallFracturedSorcerer;
const K = FS.constants;
const L = ACT.level(29);
// Measured (7.209, scripted input in the browser): the best jump, double jump and two dashes off the Glassworks' bank
// reaches 2420 (the far bank is at 2550); a single jump through a thaw falls, a double jump carries it; a knight with
// the double jump reaches the gallery wall's clingable face (a jump alone does not).
const M = { bestFlight:2420 };

test('stage 29 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /29:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(29\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 29);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b29\b[^\]]*\]\)/);
  assert.match(source, /29:Object\.freeze\(\{id:'fractured-sorcerer-road',src:'\.\/audio\/music\/fractured-glaciated-court-of-glass\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-glaciated-court-of-glass.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-the-sorcerers-hall-of-mirrors.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Sorcerer'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['ff-fs', 'fractured-frostfell', 'east', 'walk', 0\.5, 'fractured-sorcerer', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(8), 29);
  assert.match(fnFrom(fs, 'seamSpec'), /connector:'ff-fs', zone:ZONE, targetStage:28/);
  assert.match(fnFrom(fs, 'seamSpec'), /A\.mirrored \? F\.seamOn\(STAGE, ZONE, 'fs-fe', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-frostfell.js'), 'arrival'), /plan\.connectorId === 'ff-fs'/);
  assert.match(fnFrom(fs, 'update'), /THE FRACTURED EMBERDEEP/);
});

test('THE COURT\'S KIT: everything through the double jump; no Attunement', () => {
  assert.match(fnFrom(fs, 'init'), /F\.setKit\(\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump'\]\)/);
  assert.doesNotMatch(fs, /'attunement'/);
});

test('THE GLASSWORKS: the stream through your mouth and the anchor freezes the bridge, on the beat', () => {
  const G2 = K.GLASS, gap = K.GROUND[1][0] - K.GROUND[0][1];
  assert.ok(gap >= 900 && M.bestFlight < K.GROUND[1][0], 'the void is crossed only on the bridge');
  const em = L.objects.find(o => o.type === 'runeEmitter' && o.dir === 'down');
  assert.equal(em.x, G2.slate.x, 'the emitter drips onto the slate');
  const anc = L.objects.find(o => o.type === 'lportal' && o.anchor);
  assert.ok(anc && anc.nx === 1 && anc.anchorRange >= (G2.bridge.x + G2.bridge.w / 2) - anc.x, 'the anchor faces the condenser and holds across the bridge');
  assert.ok(anc.anchorRange < K.GALLERY.outlet.x - anc.x, 'but not over the gallery (its pair is two mouths)');
  assert.equal(anc.y, G2.condenser.y, 'the bolt flies level into the condenser');
  const br = L.objects.find(o => o.fwsBridge);
  assert.ok(br.gone && br.x - br.w / 2 <= K.GROUND[0][1] && br.x + br.w / 2 >= K.GROUND[1][0], 'the bridge spans the void, thawed until fed');
  assert.ok(G2.bridge.hold < G2.emitter.period - .5, 'it thaws for longer than one jump');
  assert.match(fnFrom(fs, 'condensers'), /pr\.portalHops > 0/, 'only a bolt that came through a mouth feeds it');
  assert.match(fnFrom(fs, 'condensers'), /bridge\.gone = !\(A\.frozenT > 0\)/);
});

test('THE PETITION GALLERY: the intake in the band, the outlet under the condenser; the wall is wet above the band', () => {
  const Gy = K.GALLERY, em = L.objects.find(o => o.type === 'runeEmitter' && o.dir === 'right');
  assert.ok(em.y > Gy.band.top - Gy.band.h && em.y < Gy.band.top, 'the emitter fires along the band');
  const walls = L.objects.filter(o => o.type === 'wall' && o.x === Gy.wall.x);
  assert.ok(walls[0].slate, 'the band is found first');
  const above = walls.find(w => w.y === Gy.wall.top);
  assert.ok(above.noCling && above.slickL && above.slickR && above.y - above.h === Gy.band.top, 'wet from the band to the top: no climbing over');
  const bars = walls.find(w => w.actBars === 'portcullis'), low = walls.find(w => w.y === Gy.wall.band);
  assert.equal(bars.w, low.w, 'the portcullis is as wide as the wall over it');
  assert.equal(Gy.outlet.x, Gy.condenser.x, 'the outlet is under the condenser');
  assert.ok(Gy.condenser.y > em.y + 60, 'the stream does not reach the condenser but through the pair');
  assert.match(fnFrom(fs, 'condensers'), /kit\.latch\(ZONE, 'fws-gallery'\); setBars\('portcullis', true\)/);
});

test('THE MIRROR: its spell back through your mouths, then countered, then countered into a mouth', () => {
  const acc = (phase, pr) => FS.accepts({ phase }, pr);
  const portaled = { owner:'enemy', portalHops:1 }, countered = { owner:'player', portalHops:0 }, both = { owner:'player', portalHops:1 };
  assert.deepEqual([acc(0, portaled), acc(0, countered), acc(0, both)], [true, false, true], 'I: through your mouths');
  assert.deepEqual([acc(1, portaled), acc(1, countered), acc(1, both)], [false, true, true], 'II: countered');
  assert.deepEqual([acc(2, portaled), acc(2, countered), acc(2, both)], [false, false, true], 'III: both');
  const P = K.M.phases;
  assert.deepEqual(Array.from(P, p => p.where), ['perch', 'floor', 'perch']); assert.ok(P[2].lob);
  assert.ok(P[1].twin >= .8, 'the twin cast is outside the Counter\'s .7 s cooldown');
  assert.ok(L.objects.some(o => o.slate && o.type === 'plat' && o.x === K.PERCH.x && o.y === 0), 'a slate under the perch');
  assert.ok(K.FRONT_SLATES.length >= 3, 'slates across the floor for the mouth in front of you');
  assert.match(fnFrom(fs, 'cast'), /puzzleOnly:1/, 'the engine never scores its orbs: the Mirror does');
  assert.match(fnFrom(fs, 'orbs'), /pr\.fwsLob && pr\.owner === 'player'/, 'a countered lob flies flat back');
  assert.match(fnFrom(fs, 'wardBreak'), /kit\.latch\(ZONE, 'fws-mirror-' \+ \(A\.phase \+ 1\)\)/, 'a finished phase is kept');
  assert.ok(K.WELL.x2 - K.WELL.x1 <= 1100);
  assert.ok(K.CHECKPOINTS.find(c => c.id === 'well').x < K.WELL.x1, 'a retry walks in');
});

test('the art is registered: the emitters, the condensers, the bridge\'s thaw, the band, the Mirror', () => {
  assert.match(art, /ART\.register\(29, /);
  assert.match(fnFrom(art, 'plat'), /case 'bridge':/);
  assert.match(fnFrom(art, 'object'), /case 'actCondenser':/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'mirror'/);
  assert.match(renderer, /case 'runeEmitter': if\(o\.actArt && ext\('object', o\)\) break;/);
});

test('cast cue origin is the actual projectile origin on perch and floor', () => {
  for(const where of ['perch','floor']) for(const face of [-1,1]){
    const e={x:8500,y:where==='perch'?300:0,where,face}, G={projectiles:[]};
    const c=vm.createContext({G,M:K.M,Math,e,A:{},p:{x:8200,y:0}});
    vm.runInContext(fnFrom(fs,'castOrigin')+';'+fnFrom(fs,'cast')+';cast(A,e,p,false)',c);
    assert.equal(G.projectiles[0].x,FS.castOrigin(e).x);assert.equal(G.projectiles[0].y,FS.castOrigin(e).y);
  }
});

test('death resets to the retained phase and removes only Mirror orbs', () => {
  const A={phase:1,fight:true,breaks:1,queue:[{}],mirror:{st:'twin',t:.8,twinLeft:1,x:8850,y:300}};
  const G={projectiles:[{fwsOrb:1,life:4},{life:4}]};
  const c=vm.createContext({A,G,M:K.M,PERCH:K.PERCH,Math,Object,setBars(){}});
  vm.runInContext(fnFrom(fs,'phaseOf')+';'+fnFrom(fs,'perchSpot')+';'+fnFrom(fs,'resetMirror')+';resetMirror(A)',c);
  assert.equal(A.phase,1);assert.equal(A.breaks,0);assert.equal(A.queue.length,0);
  assert.equal(A.mirror.where,'floor');assert.equal(A.mirror.y,0);assert.equal(A.mirror.twinLeft,0);
  assert.equal(G.projectiles[0].life,0);assert.equal(G.projectiles[1].life,4);
  c.e={t:.4};c.p={dead:true};
  vm.runInContext(fnFrom(fs,'updateMirror')+';updateMirror(A,e,p,.2)',c);assert.equal(c.e.t,.4);
});

test('phase transitions discard old orbs without removing emitter bolts', () => {
  const A={phase:0,breaks:1},e={x:8850,y:300},G={projectiles:[{fwsOrb:1,life:4},{life:4}]};
  const c=vm.createContext({A,e,G,M:K.M,Math,kit:{burst(){},latch(){}},ZONE:'fractured-sorcerer',meta:{soundOn:false}});
  vm.runInContext(fnFrom(fs,'phaseOf')+';'+fnFrom(fs,'wardBreak')+';wardBreak(A,e)',c);
  assert.equal(A.phase,1);assert.equal(A.breaks,0);assert.equal(e.st,'staggered');
  assert.equal(G.projectiles[0].life,0);assert.equal(G.projectiles[1].life,4);
});

test('completed Mirror restores ground-level fragments', () => {
  const A={phase:2,mirrored:true};
  const c=vm.createContext({A,M:K.M,PERCH:K.PERCH,spawnEnemy:()=>({}),Object});
  vm.runInContext(fnFrom(fs,'perchSpot')+';'+fnFrom(fs,'spawnMirror')+';spawnMirror(A)',c);
  assert.equal(A.mirror.st,'done');assert.equal(A.mirror.y,0);
});
