/* THE DEEP LINE — the truth route, respec'd 2026-09-21.
 *
 * It was the last region outside the v4 boundary AND outside the respec renderer, and it
 * was still built as a secret: a completion portal, no props, no physical seams. The
 * seams are the part that mattered — the world graph has routed King → Deep Line →
 * Ruined Keep since the Gilded Vault was cut, but `physicalSeamSpec` stopped at stage 12,
 * so with the King dead and the knight on the rail head it returned null. The Throne had
 * no exit and this level had no entrance.
 *
 * The test that was supposed to cover that asserted `LEVEL.physicalExit` — the
 * DECLARATION. So this file asserts the BEHAVIOUR: that the spec has a branch which
 * opens each seam, and that arriving through it puts the knight somewhere real.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { audit } from '../scripts/necessity-audit.mjs';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const renderer = await read('bladefall-respec-renderer.js');
const campaign = await read('bladefall-campaign.js');
const progression = await read('bladefall-progression.js');

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
const fn = n => fnFrom(source, n);

const start = source.indexOf('const SECRET_LEVEL='),
      end = source.indexOf('\nconst WHITE_COURT_LEVEL=', start);
assert.ok(start >= 0 && end > start);
const ctors = ['Pl','Gr','Wl','Slate','SlateWall','Check','Plate','Scenery','Fluid','CoinOb','Sp','Br',
  'Slope','FJ','RailSwitch','RailCollapse','PBox','StoryRelic','SealedRecollection','ElementBeat',
  'DeepBeat','DeepScenery','Seam'];
const LEVEL = vm.runInNewContext('const G={};\n' + ctors.map(n => fnFrom(source, n)).join('\n') +
  '\n' + source.slice(start, end) + '\n;SECRET_LEVEL', { Math, Object });
const at = p => LEVEL.objects.filter(p);

test('it is a road now, not a secret: gates at both ends, no completion portal', () => {
  assert.equal(LEVEL.portal, null, 'the completion portal is gone');
  assert.equal(LEVEL.physicalExit, 'deep-line-keep', 'it leaves by a seam like every other region');
  assert.equal(LEVEL.cart, true, 'and it is still the cart level — that was never the problem');
  assert.equal(LEVEL.authoredEcology, true);
  // [...] on purpose: LEVEL is built inside a vm context, so its arrays carry the VM
  // realm's Array.prototype and deepStrictEqual — which compares prototypes — fails on
  // two arrays that print identically. Copy into this realm before comparing.
  const seams = [...at(o => o.physicalSeam).map(o => o.physicalSeam)].sort();
  assert.deepEqual(seams, ['deep-line-keep', 'king-deep-line'], 'a gate at each end');
  const head = at(o => o.physicalSeam === 'king-deep-line')[0];
  const tail = at(o => o.physicalSeam === 'deep-line-keep')[0];
  assert.ok(head.x < 400, 'the head is at the west end, under the Throne');
  assert.ok(tail.x > LEVEL.len - 400, 'and the tail comes out under the Keep');
  assert.ok(at(o => o.sealedRecollection).length === 1, 'the region pays its recollection');
});

test('the last two seams of the game actually open', () => {
  // This is the assertion that was missing. `physicalExit` is a declaration; a seam the
  // runtime never checks is a label on a wall.
  const spec = fn('physicalSeamSpec');
  assert.match(spec, /G\.stageIndex===13&&G\.boss&&!G\.boss\.dead&&G\.boss\.type==='king'\)return null/,
    'the Throne is shut while the King stands');
  assert.match(spec, /G\.stageIndex===13\)return\{connector:'king-deep-line'[\s\S]*?targetStage:15/,
    'and opens onto the Deep Line once he falls');
  // THE RIDE IS ONE-WAY. A cart pins p.face=1 and is doing 200 u/s east within eight
  // frames, so the usual `face<0` back-seam is a branch that can never fire. The head is
  // an arrival; shipping a route that cannot be taken is worse than not shipping one.
  //   THE HEAD IS AN ARRIVAL ON THE WAY OUT AND AN EXIT ON THE WAY BACK. A forward cart
  // still cannot turn round — cartMode pins face — so the forward ride leaves only by its
  // tail. The RETURN ride is a mirrored level travelling the other way and it ENDS here,
  // so the same end is a route for it and a dead end for the other.
  assert.match(spec, /if\(!G\.deepLineReturn\)return null;/, 'the forward ride cannot turn round');
  assert.match(spec, /connector:'king-deep-line',zone:'deep-line',targetStage:13/,
    'but the return ride leaves at the head, into the Throne');
  // And you can board it at the Keep, once the ship is whole.
  assert.match(spec, /G\.stageIndex===5&&G\.p\.x>G\.levelLength-900&&shipComplete\(\)/,
    'boarding at the Keep needs all three ship parts');
  assert.match(spec, /G\.stageIndex===15\)return\{connector:'deep-line-keep'[\s\S]*?targetStage:5/,
    'and runs on to the Keep at its tail');
  // Arriving has to land somewhere real. The rail starts 300 up, so y=0 is under it.
  const arrival = fn('compatibilityZoneArrival');
  assert.match(arrival, /'king-deep-line'&&plan\.targetZoneId==='deep-line'\)\{x=120;y=300;\}/,
    'you arrive ON the rail, not beneath it');
  assert.match(arrival, /'deep-line-keep'&&plan\.targetZoneId==='ruined-keep'/, 'and out under the Keep');
  // AND THE RETURN RIDE ARRIVES ON ITS RAIL TOO. Its head is the mirror of the forward
  // ride's tail and that end of the line stands at 300; pinned at 0 it dropped the rider
  // under an elevated track, in the void, dead before a frame of input. Owner: "deep line
  // reverse loads below track and fails, as you die instantly."
  assert.match(arrival, /'deep-line-keep'&&plan\.targetZoneId==='deep-line'\)\{x=13820;y=300;\}/,
    'and the return ride is set down on the rail, not beneath it');
  // The arrival back into the Throne still exists: the world graph is two-way even
  // though the cart is not, and level select can put you on either side.
  assert.match(arrival, /'king-deep-line'&&plan\.targetZoneId==='abyss-king'/, 'the graph stays two-way');
});

test('it is inside the respec, and it has furniture at last', () => {
  const boundary = Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]);
  assert.ok(boundary >= 15, `V4_LAST_STAGE=${boundary} leaves the last road on the legacy economy`);
  // Outside the boundary its gargoyles rolled random gear and every kill paid legacy
  // crafting — the same fault as the Tyrant's legendary, on the truth route.
  assert.match(fn('killEnemy'), /G\.stageIndex>V4_LAST_STAGE\)rollDrop/, 'drops are boundary-gated');
  // The renderer has to be ASKED, or no art added here is reachable.
  const set = /const SUPPORTED_STAGES = new Set\(\[([^\]]*)\]\)/.exec(renderer)[1];
  assert.ok(set.split(',').map(n => Number(n.trim())).includes(15),
    'the respec renderer must claim stage 15 or it draws through the legacy path');
  assert.match(renderer, /function drawDeepProp/, 'the Deep Line has prop art');
  assert.match(renderer, /curG\.stageIndex === 15 && drawDeepProp/, 'dispatched for the stage');
  // It had none at all before: not one Scenery in 13,950 units.
  assert.ok(at(o => o.type === 'scenery').length >= 2, 'and the level actually places some');
});

test('one length, in all three places that claim to know it', () => {
  // It was 13950 in the level, 6600 in the campaign stage table and 21000 in the
  // progression catalog — three different answers for one road.
  assert.equal(LEVEL.len, 13950);
  assert.match(campaign, /name: 'The Deep Line', len: 13950/);
  assert.match(progression, /\['deep-line', 15, 'The Deep Line', 0, 6, 'truth-route', 13950/);
});

test('the necessity audit refuses to judge a cart level, and says so', () => {
  // The walking model has no meaning here: the rail is the road, gaps are launches.
  // Reporting "nothing is required" would be a confident wrong answer.
  const r = audit(15);
  assert.equal(r.model, 'not-applicable');
  assert.equal(r.cart, true);
  assert.match(r.reason, /cart level/);
});

test('the line runs both ways: a mirrored return level, and a cart that knows which way it points', () => {
  // A SIGNED REUSE OF THE FORWARD LEVEL WOULD NOT DO. The RailCollapse spans are tuned to
  // give way AHEAD of an eastbound cart, so a reversed ride arrives on track that has
  // already fallen. Mirroring keeps every hazard's relationship to the direction intact.
  assert.match(source, /function mirrorDeepLine\(L\)\{/, 'there is a mirror');
  const mirror = fn('mirrorDeepLine');
  assert.match(mirror, /cartDir:-1/, 'the return level is westbound');
  assert.match(mirror, /c\.slopeY0=c\.slopeY1/, 'and its hills point the other way');
  assert.match(mirror, /physicalExit:'king-deep-line'/, 'it leaves into the Throne');
  assert.match(source, /const SECRET_LEVEL_RETURN=mirrorDeepLine\(SECRET_LEVEL\);/);
  // The resolver must not replace CUSTOM_LEVELS: that object is in the content registry
  // and read in five other places.
  assert.match(fn('resolveCustomLevel'), /CUSTOM_LEVELS\[i\]/, 'everything else resolves as before');
  assert.match(source, /const customL = resolveCustomLevel\(i\);/, 'loadStage uses it');
  // The cart was eastbound in three independent places.
  assert.match(source, /G\.cartDirection=L\.cartDir\|\|1;/, 'direction comes from the level');
  assert.match(source, /const cdir=G\.cartDirection\|\|1;/);
  assert.match(source, /p\.face=cdir;/, 'it faces the way it travels');
  assert.match(source, /cdir\*\(270\+G\.cartLean/, 'and accelerates that way');
  assert.match(source, /cdir>0\?p\.x>6800:/, 'with a momentum window that mirrors too');
});

test('the cart is a prop with two states, and "ridden" crosses zones', () => {
  // Circuits are ZONE-scoped, so a flag set at the Deep Line's tail is invisible from the
  // Ruined Keep — the prop would silently never change and read as an art bug. Opened
  // CONNECTORS are world-scoped, and riding the line is what opens deep-line-keep.
  assert.match(fn('deepLineRidden'), /openedConnectors\(state\)\.includes\('deep-line-keep'\)/);
  assert.match(fn('deepLineRidden'), /G\.levelSelectMode\?G\.sessionZoneState:meta\.zoneState/,
    'and it honours the Level Select split');
  assert.match(source, /frostAqueductOpen,deepLineRidden,/, 'bridged to the renderer');
  assert.match(renderer, /function drawRailCart/, 'the cart prop exists');
  assert.match(renderer, /L\.deepLineRidden/, 'and branches on the world state');
});

test('a branch that rejoins the road is carried over it, not carved through it', () => {
  /* Owner: "there are quite a few sections where you go straight into a wall and come
     out the other side magically onto the tracks."
       Both forks on this line send a high ore branch up and bring it back down with a
     Slope, and Slope() carries deep:1 — so the renderer filled the whole wedge under it
     down to the bottom of the screen, burying the low road the player was still on. The
     cart's anti-burrow rule then finished it: more than 48 units under a slope surface
     and you are shoved 240 units a FRAME toward its low end, which is the teleport he
     watched. Exactly two slopes overlap a road; the other six are real hillside. */
  const roads = at(o => o.type === 'plat' && o.deep && !o.slope)
    .map(o => [o.x - o.w / 2, o.x + o.w / 2, o.y || 0]);
  const expect = [];
  for(const s of at(o => o.slope)){
    const x1 = s.x - s.w / 2, x2 = s.x + s.w / 2, hi = Math.max(s.slopeY0, s.slopeY1);
    const over = roads.some(([a, b, y]) => !(b <= x1 + 8 || a >= x2 - 8) && y <= hi - 80);
    if(over) expect.push(Math.round(x1) + '-' + Math.round(x2));
  }
  assert.deepEqual(expect, ['4200-4600', '9140-9700'],
    'the two rejoining branches, and only those, run over a live road');
  // The flag is computed ONCE at load so physics and renderer cannot disagree.
  assert.match(source, /markRailTrestles\(\);\s*\n\s*registerCircuits\(\);/, 'stamped during loadStage');
  assert.match(fn('markRailTrestles'), /if\(ry>hi-80\)continue;/, 'against the branch’s HIGH end');
  assert.match(fn('markRailTrestles'), /!G\.cartMode\)return;/,
    'and only on a cart level — the piers and the exemption are both mine-rail vernacular');
  assert.match(fn('markRailTrestles'), /s\.railTrestle=deck;/);
  // Physics: the anti-burrow shove must skip them, or the low road still teleports.
  assert.match(source, /if\(!o\.slope\|\|o\.railTrestle!=null\|\|Math\.abs\(p\.x-o\.x\)>=o\.w\/2\)continue;/,
    'the cart drives under a trestle instead of being walled out of it');
  // Renderer: piers, not a filled wedge.
  assert.match(renderer, /if\(o\.railTrestle != null\)\{/, 'the renderer branches on the same flag');
  assert.match(renderer, /function drawRailIrons/, 'and both branches lay the same irons');
});

test('the knight rides IN the cart, and the 360 is visible', () => {
  // Owner: "both direction of deep line don't show knight in cart (you can see him
  // overlayed ontop of it, which doesn't make sense). In addition, you can't see the
  // flip." The respec port drew the cart and THEN the hero — the legacy renderer had
  // the order the other way round — and carried no rotation wrapper at all.
  assert.match(renderer, /drawCartRide\(G\.p\);/, 'one call site owns the rider and his cart');
  const ride = /function drawCartRide\(p\)\{[\s\S]*?\n\}/.exec(renderer)[0];
  assert.ok(ride.indexOf('drawHeroAt(p)') < ride.indexOf('drawCartRig(p)'),
    'the hero draws BEFORE the tub, so the tub’s front face covers his legs');
  assert.match(ride, /ctx\.translate\(0, -Math\.round\(12 \* Z\)\)/,
    'and he stands on the tub floor, so head and shoulders ride above the rim');
  assert.match(ride, /ctx\.rotate\(-prog \* 6\.2832\)/, 'the flip turns a full 360');
  assert.match(ride, /WY\(p\.y\) - Math\.round\(26 \* Z\)/, 'about the tub centre, so he stays in it');
  assert.match(source, /CART_FLIP_DUR,/, 'and the duration is bridged rather than guessed');
});

test('the three ship parts are countable while you are still looking for them', () => {
  /* Owner: "in the three biomes that the ship parts are hidden/guarded, where exactly
     are they, and is there an inventory tracker for how many have been collected so
     player knows when to try to return to abyss king? (They won't be told to do this,
     and will have to figure it out on their own.)"
       Nothing is ever going to tell them to go back — that is the design — so the one
     thing they must be able to see is the COUNT. It lived only on the claim card, which
     is shown once, in a zone they may not return to for hours. */
  const spec = /const SHIP_PARTS=Object\.freeze\(\{[\s\S]*?\n\}\);/.exec(source)[0];
  for(const [zone, id, x, y] of [['updrafts', 'ship-part-keel', 15480, 400],
                                 ['hollow-marksman', 'ship-part-mast', 11040, 300],
                                 ['ruined-keep', 'ship-part-sail', 16810, 1080]]){
    assert.ok(spec.includes(`id:'${id}',x:${x},y:${y}`), `${zone} keeps its part at ${x},${y}`);
  }
  // One per zone, and each of those three zones is a stage the installer runs in.
  assert.match(source, /const SHIP_PART_STAGES=Object\.freeze\(new Set\(\[3,4,5\]\)\)/);
  // The tracker: an element, and a HUD branch that fills it from the same predicate the
  // seam at the Keep gates on — not a second count that can drift out of step.
  assert.match(source, /<span id="shipTag"/, 'the HUD has somewhere to put it');
  const hud = fn('hudUpdate');
  assert.match(hud, /const held=shipPartsHeld\(\),total=SHIP_PART_IDS\.length;/, 'one source of truth');
  assert.match(hud, /if\(held>0&&G\.ngPlus===0&&!G\.battle&&!G\.bossRush\)\{/,
    'it appears with the first part — at zero it would be a marker for an unrevealed goal');
  assert.match(hud, /held>=total\?' · SEAWORTHY':''/, 'and says when the ship is whole');
});
