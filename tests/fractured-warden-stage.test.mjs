// The Fractured Warden: Act Three's seventh echo (stage 27). A B-side of the Warden's Gaol walked west to
// east: the Blind Gallery's turnkeys under a roof too low to jump (dash through the lunge, strike the
// back, take the bay's keys), the Hush Engine's thin air over the void with no brakes on its bars, the
// Turning Cell (a mouth that rides the cage) — and a C-side: the Sentence, whose own rush is the only
// thing that reaches it once it pronounces sentence.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const core = read('bladefall-fractured.js');
const fw = read('bladefall-fractured-warden.js');
const art = read('bladefall-fractured-warden-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Sp', 'Cry', 'Slate', 'SlateWall', 'Crate', 'Lever', 'Seam'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + core + '\n' + fw, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const F = sandbox.window.BladefallFractured;
const FW = sandbox.window.BladefallFracturedWarden;
const K = FW.constants;
const L = ACT.level(27);
// Measured (7.207, scripted input in the browser): a knight 44 tall; jump 78, jump and dash 153; under a roof at 80
// a jump peaks at 40 (a turnkey is 38 tall), under 76 at 36; the fall from the perch enters its mouth at ~1100 (the
// fall-speed cap) and comes out ~470 above the cage; the best jump and two dashes off the Engine's deck, at 715 and
// above, is 183 short of the Cell's lip.
const M = { head:44, jump:78, jumpDash:153, turnkeyH:38, cellRise:470, deckShort:183 };

test('stage 27 is registered everywhere a stage must be, as Act Three', () => {
  assert.match(source, /27:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(27\):null\)/);
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 27);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b27\b[^\]]*\]\)/);
  assert.match(source, /27:Object\.freeze\(\{id:'fractured-warden-road',src:'\.\/audio\/music\/fractured-iron-gavel-descent\.mp3'/);
  assert.ok(existsSync(pub('audio/music/fractured-iron-gavel-descent.mp3')));
  assert.ok(existsSync(pub('audio/music/fractured-sentence-of-the-shield-warden.mp3')));
  assert.match(read('bladefall-campaign.js'), /name: 'The Fractured Warden'[^}]*act: 3/);
  assert.match(read('bladefall-zones.js'), /\['fk-fw', 'fractured-keep', 'east', 'walk', 0\.5, 'fractured-warden', 'west', 'walk', 0\.5\]/);
  assert.equal(F.echoFor(6), 27);
  assert.match(fnFrom(fw, 'seamSpec'), /connector:'fk-fw', zone:ZONE, targetStage:26/);
  assert.match(fnFrom(fw, 'seamSpec'), /A\.sentenced \? F\.seamOn\(STAGE, ZONE, 'fw-ff', LEN, true\)/);
  assert.match(fnFrom(read('bladefall-fractured-keep.js'), 'arrival'), /plan\.connectorId === 'fk-fw'/);
  assert.match(fnFrom(fw, 'update'), /THE FRACTURED FROSTFELL/);
});

test('THE GAOL\'S KIT: jump, blade, dash, the twin mouths, the wall jump; no Counter', () => {
  assert.match(fnFrom(fw, 'init'), /F\.setKit\(\['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump'\]\)/);
  assert.doesNotMatch(fw, /'counter'/);
});

test('THE BLIND GALLERY: a turnkey under every roof, too low to jump; the bay\'s bars lift when its turnkeys fall', () => {
  assert.ok(K.ROOF - M.head < M.turnkeyH, 'a jump under the roof does not clear a turnkey');
  for(const b of K.BAYS){
    const roof = L.objects.find(o => o.type === 'plat' && o.ceilingOnly && o.x === (b.x0 + b.x1) / 2);
    assert.ok(roof, b.id + ' has a roof'); assert.equal(roof.y - roof.h, K.ROOF, 'its underside is the roof');
    assert.equal(roof.x + roof.w / 2, b.x1, 'the roof runs to the gate');
    const bars = L.objects.find(o => o.actBars === b.id); assert.ok(bars && !bars.gone && bars.y === K.ROOF && bars.x === b.x1);
    const stone = L.objects.find(o => o.type === 'wall' && o.x === b.x1 && !o.actBars);
    assert.ok(stone.noCling && stone.slickL && stone.slickR && stone.y - stone.h === K.ROOF && stone.y >= 1600, 'stone above the bars, to the top');
    assert.ok(L.enemies.some(e => e.wardenRole === 'turnkey' && e.x > b.x0 && e.x < b.x1), 'a turnkey carries its keys');
  }
  assert.match(fnFrom(fw, 'keys'), /e\.fwBay === b\.id && !e\.dead/);
  assert.match(fnFrom(fw, 'keys'), /kit\.latch\(ZONE, 'fwd-' \+ b\.id\); setBars\(b\.id, true\)/);
  assert.match(fnFrom(art, 'darkness'), /wardenRole === 'turnkey'/, 'the turnkeys\' lanterns are the Gallery\'s only lights but yours');
});

test('THE HUSH ENGINE: thin air over the void, from the lip to the deck; the bars turn off the hops\' arcs', () => {
  const lip = K.GROUND[0][1], far = K.GROUND[1][0];
  assert.ok(far > K.ENGINE_WALL.x - 100 && lip < K.ENGINE_LEDGES[0][0] - K.ENGINE_LEDGES[0][1] / 2, 'no floor under the climb');
  const thin = (x, y) => K.LOWGS.some(f => Math.hypot(x - f.x, y + 22 - f.y) < f.r);
  assert.ok(thin(lip - 20, 0), 'the lip is in thin air');
  for(const l of K.ENGINE_LEDGES) assert.ok(thin(l[0] - l[1] / 2, l[2]) && thin(l[0] + l[1] / 2, l[2]), `the ledge at ${l[0]} is in thin air`);
  // Every ledge has somewhere to stand that no bar reaches (a bar may sweep a ledge's end: stand back from it).
  for(const l of K.ENGINE_LEDGES){
    let run = 0, best = 0;
    for(let x = l[0] - l[1] / 2; x <= l[0] + l[1] / 2; x += 5){
      const clear = K.ROTORS.every(r => Math.hypot(x - r.x, l[2] + 22 - r.y) > r.length + 24);
      run = clear ? run + 5 : 0; best = Math.max(best, run);
    }
    assert.ok(best >= 50, `the ledge at ${l[0]} has room to wait (${best})`);
  }
  const lower = L.objects.find(o => o.type === 'wall' && o.x === K.ENGINE_WALL.x && o.y === K.ENGINE_WALL.door[0]);
  assert.ok(lower && lower.y - lower.h <= -140, 'the Engine\'s wall goes down into the void');
  assert.ok(L.objects.some(o => o.type === 'wall' && o.x === K.ENGINE_WALL.x && o.y - o.h === K.ENGINE_WALL.door[1]));
});

test('THE TURNING CELL: a mouth rides the cage; only the rise out of it reaches the door', () => {
  const C = K.CELL, cage = L.objects.find(o => o.fwCage);
  assert.ok(cage.slate && cage.move && cage.move.dy === C.cage.dy, 'the cage is slate and rides the oscillator');
  const top = C.cage.y + C.cage.dy;
  assert.ok(C.lip.y > C.perch.y + M.jumpDash && C.lip.y > top + M.jumpDash, 'nothing else reaches the door');
  assert.ok(top + M.cellRise > C.lip.y + 40, 'from near the top of the ride the rise clears the lip');
  assert.ok(C.cage.y + M.cellRise < C.lip.y, 'from the middle of the ride it does not');
  assert.ok(Math.abs(C.slate.x - (C.perch.x + C.perch.w / 2)) < C.slate.w / 2, 'the floor slate is under the perch\'s edge');
  assert.ok(C.lip.x - C.lip.w / 2 > C.cage.x + C.cage.w / 2, 'the lip is past the cage: drift onto it on the way down');
  assert.ok(M.deckShort > 0, 'measured: the Engine\'s deck does not reach the lip');
  assert.match(fnFrom(fw, 'carryMouths'), /m\.x = cage\.x \+ m\._fwCage; m\.y = cage\.y/);
  assert.match(fnFrom(fw, 'update'), /carryMouths\(\)/);
});

test('THE SENTENCE: the blade from behind in the rush; in the sentence, only its own rush through your mouths', () => {
  const upd = fnFrom(fw, 'updateSentence');
  assert.match(upd, /e\.portalGate = open \|\| \(ph === 'rush' && e\.st !== 'wait'\) \? 'melee' : 'sentence-never'/, 'only the blade counts');
  assert.match(upd, /e\.to = p\.x \+ e\.dir \* S\.rush\.past/, 'the rush runs to where you stood');
  assert.match(upd, /e\.burnT = e\.poisonT = e\.bleedT/, 'nothing clings to it');
  const thr = fnFrom(fw, 'throughMouth');
  assert.match(thr, /\(was - a\.x\) \* \(e\.x - a\.x\) > 0/, 'it is thrown when its rush crosses a floor mouth');
  assert.match(thr, /clearPlacedPortals/, 'the pair is spent each time');
  assert.equal(K.S.marks, 3); assert.equal(K.S.crashes, 3);
  assert.ok(K.S.rush.recover >= 1, 'a recovery long enough to reach its back after the dash');
  assert.equal(K.WELL_SLATES.length, 3);
  for(const s of K.WELL_SLATES) assert.ok(s[0] > K.WELL.x1 && s[0] < K.WELL.x2);
  assert.ok(K.WELL.x2 - K.WELL.x1 <= 1000, 'the well fits the screen');
  assert.match(fnFrom(fw, 'onHit'), /kit\.latch\(ZONE, 'fwd-sentence'\)/);
  assert.match(fnFrom(fw, 'resetSentence'), /A\.marks = A\.rushed \? S\.marks : 0/, 'a death keeps a finished phase, not its marks');
});

test('the art is registered: the dark Gallery, the thin air, the bars, the cage and the Sentence', () => {
  assert.match(art, /ART\.register\(27, /);
  assert.match(fnFrom(art, 'object'), /o\.type === 'lowg' && o\.actArt === 'thin'/);
  assert.match(fnFrom(art, 'object'), /o\.type === 'rotor' && o\.actArt === 'bar'/);
  assert.match(fnFrom(art, 'enemy'), /e\.actFoe !== 'sentence'/);
  assert.match(renderer, /case 'rotor': if\(o\.actArt && ext\('object', o\)\) break;/);
  assert.match(renderer, /case 'lowg': if\(o\.actArt && ext\('object', o\)\) break;/);
});

test('cage mouth keeps its attachment and offset through JSON hydration', () => {
  const cage = {fwCage:true,x:6360,y:300,w:130};
  const G = {obstacles:[cage],cratePortals:[{surf:'floor',x:6370,y:300},{surf:'floor',x:6230,y:0}]};
  const c = vm.createContext({G,Object});
  vm.runInContext(fnFrom(fw,'carryMouths')+';carryMouths()',c);
  G.cratePortals = JSON.parse(JSON.stringify(G.cratePortals));
  cage.x += 20; cage.y = 410;
  vm.runInContext('carryMouths()',c);
  assert.equal(G.cratePortals[0].x,6390);
  assert.equal(G.cratePortals[0].y,410);
  assert.equal(G.cratePortals[1].y,0);
});

test('Sentence only enters a physical floor pair inside its well', () => {
  const G = {cratePortals:[]};
  const c = vm.createContext({G,Math,S:K.S,WELL:K.WELL,kit:{burst(){}},meta:{soundOn:false}});
  vm.runInContext(fnFrom(fw,'throughMouth'),c);
  for(const [height,exitX,exitSurf,valid] of [[0,8500,'floor',true],[300,8500,'floor',false],[0,6230,'floor',false],[0,8500,'wall',false]]){
    G.cratePortals=[{surf:'floor',x:8200,y:height},{surf:exitSurf,x:exitX,y:0}];
    c.A={};c.e={x:8210,y:0,st:'sentence'};
    assert.equal(vm.runInContext('throughMouth(A,e,8190)',c),valid);
    if(valid){assert.equal(c.e.st,'thrown');assert.equal(c.e.x,8500);assert.equal(G.cratePortals.length,0);}
  }
});

test('death clears Sentence transients while retaining the completed rush phase', () => {
  const A={sentence:{hp:1,hpWas:9999,hit:true,behindT:1,vyc:700},rushed:true,marks:1,crashes:2,aoes:[{}]};
  const c=vm.createContext({A,S:K.S,home:()=>({x:8700}),setBars(){},clearPlacedPortals(){}});
  vm.runInContext(fnFrom(fw,'resetSentence')+';resetSentence(A)',c);
  assert.equal(A.marks,3);assert.equal(A.crashes,0);assert.equal(A.aoes.length,0);
  assert.equal(A.sentence.hp,9999);assert.equal(A.sentence.hit,false);assert.equal(A.sentence.vyc,0);assert.equal(A.sentence.behindT,0);
  c.p={dead:true};c.e={t:5};
  vm.runInContext(fnFrom(fw,'updateSentence')+';updateSentence(A,e,p,1)',c);
  assert.equal(c.e.t,5);
});

test('completed Sentence restores inert armour with its shield lowered', () => {
  const A={sentenced:true};
  const c=vm.createContext({A,S:K.S,home:()=>({x:8700}),spawnEnemy:()=>({}),Object});
  vm.runInContext(fnFrom(fw,'spawnSentence')+';spawnSentence(A)',c);
  assert.equal(A.sentence.st,'done');assert.equal(A.sentence.frontShield,false);
  assert.equal(A.sentence.portalGate,'sentence-never');
});

test('slam preview matches damage radius and jump clearance at multiple zooms', () => {
  for(const Z of [.75,1,1.5]){
    const boxes=[];
    const api={Z,B:(...b)=>boxes.push(b),WX:x=>x*Z,WY:y=>600-y*Z};
    const A={fight:true,sentence:{x:8500,st:'slam-tell'}};
    const c=vm.createContext({api,A,W:()=>({constants:K}),C:{brassLit:'gold',brass:'dim'}});
    vm.runInContext(fnFrom(art,'sentenceTell')+';sentenceTell(api,A)',c);
    assert.equal(boxes[0][0],(8500-K.S.slam.r)*Z);
    assert.equal(boxes[0][2],2*K.S.slam.r*Z);
    assert.equal(boxes[1][1],600-40*Z);
    assert.equal(boxes[1][3],40*Z);
  }
});
