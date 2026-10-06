// The Colony: Act Two's third region (stage 18). The Sunguard's glasses sweep the tents (tents
// and smoke hide you; the sick screen a knight who came in by the hand); Sable's dry well, the
// King's tap and the gate hung on the well's counterweight; the shackled yard — silenced alone,
// or freed by Oren. The choice carries in, and closes when you leave by the road.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const colony = read('bladefall-colony.js');
const art = read('bladefall-colony-art.js');
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
vm.runInContext(['Pl', 'Wl', 'GrAt', 'Seam', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act + '\n' + read('bladefall-landing-shores.js') + '\n' + colony, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const CO = sandbox.window.BladefallColony;
const K = CO.constants;
const L = ACT.level(18);
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
const ring = (id) => one(o => o.actId === 'ring-' + id);
const REACH = { flat:671, doubleJumpRise:147, run:212 };     // measured, full kit (run: ground speed)
const HOOK = ACT.kit.HOOK_RANGE;
const centre = (x, y) => ({ x, y:y + 22 });
const hang = (r) => ({ x:r.x, y:r.y - 58 + 22 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('stage 18 is registered everywhere a stage must be', () => {
  assert.match(source, /18:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(18\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 19);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b18\b[^\]]*\]\)/);
  assert.match(source, /18:Object\.freeze\(\{id:'colony-waystation'/, 'LEVEL_MUSIC');
  for(const f of ['the-waystation-refuge', 'village-vigil'])
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
  assert.ok(source.indexOf('bladefall-landing-shores.js?v=') < source.indexOf('bladefall-colony.js?v='), 'the region registers after the act');
  assert.match(source, /<script src="bladefall-colony-art\.js\?v=[\d.]+"><\/script>/);
  assert.equal(L.portal, null);
  assert.equal(L.authoredEcology, true);
  assert.ok(ACT.handles(18));
});

test('THE GATE is walked both ways: the kneeling man can still be reached', () => {
  const back = fnFrom(colony, 'seamSpec');
  assert.match(back, /targetStage:BACK/);
  assert.match(back, /cross:p\.x <= 62 && p\.face < 0/);
  assert.match(fnFrom(read('bladefall-landing-shores.js'), 'seamSpec'), /connector:'shores-colony'/);
  assert.match(read('bladefall-zones.js'), /\['shores-colony', 'landing-shores', 'east', 'walk', 0\.5, 'colony', 'west', 'walk', 0\.5\]/);
  assert.deepEqual({ ...ACT.arrivalFor({ connectorId:'shores-colony', targetZoneId:'colony' }) }, { ...K.SPAWN });
  assert.ok(ACT.arrivalFor({ connectorId:'shores-colony', targetZoneId:'landing-shores' }).x > 12420, 'coming back, you arrive inside the open gate');
});

test('THE TENTS: every dash between covers under a glass has a window', () => {
  // The pool's path, exactly as updateWatch drives it.
  const at = (W, t) => W.sweep[0] + (W.sweep[1] - W.sweep[0]) * (0.5 - 0.5 * Math.cos((t + W.phase) / W.period * Math.PI * 2));
  for(const W of K.WATCH){
    const covers = K.TENTS.filter(t => t.x2 > W.sweep[0] - K.POOL && t.x1 < W.sweep[1] + K.POOL).map(t => [t.x1, t.x2]);
    const stops = [[W.sweep[0] - K.POOL - 60, W.sweep[0] - K.POOL - 60], ...covers, [W.sweep[1] + K.POOL + 60, W.sweep[1] + K.POOL + 60]];
    for(let i = 0; i + 1 < stops.length; i++){
      const a = stops[i][1], b = stops[i + 1][0], travel = (b - a) / REACH.run;
      assert.ok(b - a < 520, `${W.id}: ${a}→${b} is open ground for ${Math.round(b - a)}`);
      // The longest spell in one period the pool stays clear of the whole stretch.
      let best = 0, run = 0;
      for(let t = 0; t < W.period * 2; t += 0.02){
        const g = at(W, t), clear = g < a - K.POOL - 20 || g > b + K.POOL + 20;
        run = clear ? run + 0.02 : 0; best = Math.max(best, run);
      }
      assert.ok(best > travel + 0.4, `${W.id}: ${a}→${b} needs ${travel.toFixed(1)} s, the light is away ${best.toFixed(1)} s`);
    }
  }
  assert.match(fnFrom(colony, 'updateWatch'), /if\(hidden\(A, p\)\)\{ w\.caught = 0;/, 'the flare can be escaped into cover');
  assert.match(fnFrom(colony, 'hidden'), /SCREENS\.some/, 'help adds physical cover, not map-wide invisibility');
  assert.match(fnFrom(colony, 'raiseAlarm'), /F\.spawnBelled/, 'being seen is a fight, not a death');
});

test('SABLE\'S SPRING: the conduit is reached by its rings, and the tap opens the yard', () => {
  const deck = one(o => o.actArt === 'conduit-deck');
  assert.equal(deck.y, K.CONDUIT.y);
  assert.ok(deck.y > REACH.doubleJumpRise + 250, 'no jump reaches the conduit walk');
  const foot = centre(ring('pier').x - 100, 0);
  assert.ok(dist(foot, ring('pier')) <= HOOK && dist(foot, ring('deck')) > HOOK, 'the pier ring from the ground; the deck ring only from a hang');
  assert.ok(dist(hang(ring('pier')), ring('deck')) <= HOOK);
  assert.ok(ring('deck').y - 58 > deck.y && ring('deck').x > deck.x - deck.w / 2, 'letting go of the deck ring puts you on the walk');
  assert.ok(Math.abs(K.TAP.x - K.WELL.x) < 1, 'the tap is over the well');
  const yardBars = one(o => o.actBars === 'yard-gate');
  assert.equal(yardBars.gone, false, 'the yard is barred until the water comes');
  assert.match(fnFrom(colony, 'updateSpring'), /setBars\('yard-gate', false\)/);
  assert.match(fnFrom(colony, 'updateSpring'), /p\.slamming && p\.vy > 0 && Math\.abs\(p\.x - TAP\.x\) < 55/, 'come down hard on the tap');
  assert.match(fnFrom(colony, 'ringAlms'), /A\.lure = \{/, 'the alms-bell draws the conduit guard down');
  assert.equal(one(o => o.restSiteAnchor).restSiteAnchor, 'sables-spring');
  assert.match(read('bladefall-recovery.js'), /\['sables-spring', 'colony', 'Sable’s Spring', [\d.]+, false\]/);
});

test('THE YARD: silenced alone, or freed by Oren — and the colony turns only for him', () => {
  const posts = objs(o => o.type === 'actPost').map(o => o.x).sort((a, b) => a - b);
  assert.equal(posts.length, 4);
  for(let i = 0; i + 1 < posts.length; i++) assert.ok(posts[i + 1] - posts[i] > 2 * K.CHAIN, 'the chains do not overlap: there is ground between them');
  const top = one(o => o.actArt === 'tower-top');
  assert.ok(top.y > REACH.doubleJumpRise + 200, 'the ringer is out of every jump');
  assert.ok(dist(centre(K.TOWER.x + 100, 0), ring('tower')) <= HOOK, 'his tower\'s ring is in reach from the yard');
  assert.ok(Math.abs(ring('tower').x - top.x) < top.w / 2 && ring('tower').y - 58 > top.y, 'and lets you down on his platform');
  assert.match(fnFrom(act, 'silence'), /if\(f\.shackle\)\{ f\.st = 'sit';/, 'silenced, the shackled sit where they are held');
  assert.match(fnFrom(act, 'updateBelled'), /e\.shackle && e\.st !== 'sit' && e\.st !== 'flee' && e\.hp < e\.maxHp \* 0\.4/, 'a beaten shackled man yields');
  assert.match(fnFrom(colony, 'updateYard'), /A\.oren\.st !== 'absent' && !bound\.length/, 'the colony turns when Oren has them all off');
  assert.match(fnFrom(colony, 'turnColony'), /P\.colony = 'turned'/);
  assert.equal(one(o => o.actBars === 'road-gate').gone, false, 'the road out is barred until the yard is done');
});

test('THE CHOICE carries in, is cured at the spring, and closes on the road', () => {
  assert.match(fnFrom(act, 'cure'), /P\.gold = Math\.max\(1, Math\.min\(max - 1, 1 \+ \(P\.grey \|\| 0\)\)\)/, 'every grey measure, and the touch, come back gold');
  assert.match(act, /MENDED_STEP = 6/, 'a gold measure mends after six seconds unhurt');
  assert.match(fnFrom(colony, 'sableWater'), /kit\.cure\(\)/);
  assert.match(fnFrom(colony, 'sableWater'), /A\.oren\.cured = true; P\.orenKnown = true;/, 'the bandage comes off: it is Oren');
  assert.match(fnFrom(colony, 'sableWater'), /does not fill yours/, 'struck, Sable fills everyone\'s cup but yours');
  assert.match(fnFrom(colony, 'closeChoice'), /if\(P\.oren === 'kneeling'\)\{ P\.oren = 'left'; P\.forsaken = true; kit\.savePath\(\); \}/, 'leaving without him seals the forsaken path');
  assert.match(fnFrom(colony, 'seamSpec'), /if\(cross\) closeChoice\(\);/, 'walking the road out closes it too');
  assert.doesNotMatch(colony + art, /lepro/i, 'the sickness is never named');
});

test('the art is registered and draws what the region owns', () => {
  assert.match(art, /ART\.register\(18, /);
  assert.match(fnFrom(art, 'drawBeam'), /The pool on the ground/);
  assert.match(fnFrom(art, 'enemy'), /e\.st === 'sit'/, 'a shackled man who yields is drawn kneeling');
});


test('compassion adds local blanket cover, without immunity outside it or above it', () => {
  const P={oren:'helped'};
  const ctx=vm.createContext({SCREENS:K.SCREENS,groundAt:x=>K.TERRACES.find(t=>x<t.x2)?.y || 0,
    underTent:()=>false,inSmoke:()=>false,kit:{path:()=>P},A:{},p:{x:K.SCREENS[0].x,y:100}});
  vm.runInContext(fnFrom(colony,'hidden'),ctx);
  assert.equal(vm.runInContext('hidden(A,p)',ctx),'screened');
  ctx.p.x=3600;assert.equal(vm.runInContext('hidden(A,p)',ctx),null);
  ctx.p.x=K.SCREENS[0].x;ctx.p.y=300;assert.equal(vm.runInContext('hidden(A,p)',ctx),null);
  ctx.p.y=100;P.oren='struck';assert.equal(vm.runInContext('hidden(A,p)',ctx),null);
});

test('Oren waits for the player before working, and freed shackles latch individually', () => {
  const e={x:8000,shackle:{x:8000},actFoe:'belled'}, A={oren:{x:8000,y:0,st:'break',t:1.5,target:e,face:1},enc:{yard:{st:'live',foes:[e]}}};
  const latches=[];
  const ctx=vm.createContext({A,p:{x:8600,y:0},POSTS:K.POSTS,ZONE:'colony',meta:{soundOn:false},
    kit:{burst(){},latch:(...args)=>latches.push(args)},Math});
  vm.runInContext(fnFrom(colony,'nextShackle')+fnFrom(colony,'freeShackled')+fnFrom(colony,'updateOren'),ctx);
  vm.runInContext('updateOren(A,1,p)',ctx);
  assert.equal(A.oren.t,0);assert.ok(e.shackle);
  ctx.p.x=8000;vm.runInContext('updateOren(A,1.7,p)',ctx);
  assert.equal(e.shackle,null);assert.equal(e.freedBy,'oren');
  assert.deepEqual(latches,[['colony','colony-shackle-0']]);
});
