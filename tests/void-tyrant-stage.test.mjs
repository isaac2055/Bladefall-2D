// The Paradox Citadel, authored and mirrored: walked east to west, with the arena
// rehearsed three times before the arena and a road that outlives the victory.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = n => readFile(new URL('../public/' + n, import.meta.url), 'utf8');
const source = await read('index.html');
const renderer = await read('bladefall-respec-renderer.js');
const campaign = await read('bladefall-campaign.js');
const zones = await read('bladefall-zones.js');
const camera = await read('bladefall-camera.js');
const story = await read('bladefall-story.js');

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

const start = source.indexOf('const VOID_TYRANT_LEVEL='),
      end = source.indexOf('\nconst SECRET_LEVEL=', start);
assert.ok(start >= 0 && end > start);
const ctors = ['Pl','Gr','GrAt','Wl','Slate','SlateWall','Check','LPortal','Anchor','DoorSeal','Plate','Scenery','Fluid',
  'CoinOb','Sp','Br','Trap','Crate','StoryRelic','SealedRecollection','ElementBeat','TyrantBeat','TyrantScenery','Spent','Faces','Seam'];
const CITADEL_ARENA_X = Number(/const CITADEL_ARENA_X=(\d+)/.exec(source)[1]);
const LEVEL = vm.runInNewContext(
  'const G={};const CITADEL_ARENA_X=' + CITADEL_ARENA_X + ';\n' + ctors.map(fn).join('\n') + '\n' + source.slice(start, end) + ';VOID_TYRANT_LEVEL',
  { Math, Object });
const at = p => LEVEL.objects.filter(p);
const CEILING = (480 * 480) / 2800 + (450 * 450) / 2800;
const span = o => ({ left: o.x - o.w / 2, right: o.x + o.w / 2 });
const num = (name) => Number(new RegExp('\\b' + name + '=(-?\\d+)').exec(source)[1]);
const ARENA_X = num('PARADOX_FLOOR_X'), ARENA_W = num('PARADOX_FLOOR_W');
const FACE_W = num('PARADOX_FACE_W'), FACE_E = num('PARADOX_FACE_E');

test('authored, seventeen thousand wide, and registered as a custom stage', () => {
  assert.equal(LEVEL.len, 17000);
  assert.match(source, /12:VOID_TYRANT_LEVEL/);
  assert.match(campaign, /name: 'The Void Tyrant', len: 17000/);
  assert.match(campaign, /id: 'void-tyrant',\s*source: 'custom'/);
  assert.equal(LEVEL.portal, null, 'no completion portal at either end');
  assert.equal(LEVEL.physicalExit, 'tyrant-king');
  assert.equal(LEVEL.authoredEcology, true);
  assert.equal(at(o => o.type === 'sign').length, 0, 'and not one sign, in the arena or out of it');
  assert.equal(LEVEL.loot.length, 0);
});

test('it is mirrored: you arrive east and walk to a boss in the west', () => {
  assert.ok(LEVEL.spawnX > LEVEL.bossX, 'the Gaol pattern: spawn high, boss low');
  assert.ok(LEVEL.spawnX > LEVEL.len - 500 && LEVEL.bossX < 1500);
  assert.match(source.slice(start, end), /build\(\)\{G\.p\.face=-1;\}/, 'facing the way the level runs');
  for(const e of LEVEL.enemies) assert.equal(e.face, -1, `${e.t} at ${e.x} faces the wrong way`);
  const spec = fn('physicalSeamSpec');
  // Back out the EAST gate to the Inversion; on through the WEST one to the Throne.
  assert.match(spec, /G\.stageIndex===12&&G\.p\.x>G\.levelLength\/2\)return\{connector:'inversion-tyrant'[\s\S]*?cross:G\.p\.x>=G\.levelLength-62&&G\.p\.face>0/);
  assert.match(spec, /connector:'tyrant-king'[\s\S]*?cross:G\.p\.x<=62&&G\.p\.face<0/);
  assert.match(spec, /G\.stageIndex===12&&G\.boss&&!G\.boss\.dead&&G\.boss\.type==='tyrant'\)return null/,
    'and the Throne Gate is shut while he stands');
  assert.match(zones, /'tyrant-king', 'void-tyrant', 'west'/);
  const arrival = fn('compatibilityZoneArrival');
  assert.match(arrival, /tyrant-king'&&plan\.targetZoneId==='abyss-king'\)\{x=240;y=0;\}/,
    'and the Throne, now authored, is still entered at its west end running east');
  assert.match(arrival, /tyrant-king'&&plan\.targetZoneId==='void-tyrant'/);
  // A failed crossing must nudge you off the seam you were on, either edge.
  assert.match(fn('updatePhysicalWorldSeams'), /G\.p\.x\+=\(G\.p\.x<\(G\.levelLength\|\|0\)\/2\?1:-1\)\*48/);
});

test('the arena is absolute, keeps its rooms, and outlives its own victory', () => {
  // The legacy branch derives the arena from bx and then PURGES a 1,270-unit sweep.
  const arena = fn('bossArena');
  assert.match(arena, /if\(CUSTOM_LEVELS\[G\.stageIndex\]===VOID_TYRANT_LEVEL\)\{setupParadoxBoss\(e,bx\);return;\}/,
    'the authored region never reaches the sweep');
  const setup = fn('setupParadoxBoss');
  assert.match(setup, /paradoxFight:true/);
  assert.match(setup, /installParadoxFloor\(true\)/);
  assert.doesNotMatch(setup, /G\.obstacles=G\.obstacles\.filter/, 'and deletes nothing');
  // Its geometry is room 3's geometry: two faces, 1,100 apart, 360 tall.
  assert.equal(Math.abs(FACE_W - FACE_E), 1100);
  // ONE rehearsal pair now, not two. The ground-level pair belonged to the crate
  // puzzle, which is cut: "the solution is still to portal the walls and push it
  // through… just cut this entirely." The raised pair in the spent line survives and
  // is the rehearsal, and it now does traversal work — it is how the teeth get crossed.
  const rehearsals = at(o => o.tyrantFace);
  assert.ok(rehearsals.length >= 2, 'the pair is rehearsed before the arena');
  //   THE REHEARSAL PAIR IS NOW WIDER THAN THE ARENA'S, ON PURPOSE. It used to match
  // the arena's 1,100 exactly, which was tidy and wrong: owner, second playtest, "the
  // path of spikes needs to, again, be significantly longer, with MORE distance between
  // the two walls." The bed the pair spans has to beat a measured 881-unit wall-cling
  // throw with room to spare, and the arena's span is set by a fight, not by a hazard.
  // What still has to hold is that it IS a matched pair at the arena's height.
  for(let i = 0; i < rehearsals.length; i += 2){
    const gap = Math.abs(rehearsals[i].x - rehearsals[i + 1].x);
    assert.ok(gap >= 1100, `a rehearsal pair is ${gap} apart, narrower than the arena's 1,100`);
    assert.equal(rehearsals[i].h, 360, 'and the same height');
  }
  // Nothing authored stands where installParadoxFloor will push the arena, and no
  // authored checkpoint sits inside it — a checkpoint in the pen respawns you mid-fight.
  const arenaL = ARENA_X - ARENA_W / 2, arenaR = ARENA_X + ARENA_W / 2;
  for(const o of LEVEL.objects){
    const s = o.w ? span(o) : { left:o.x, right:o.x };
    assert.ok(s.right <= arenaL || s.left >= arenaR,
      `${o.type || 'object'} at ${o.x} overlaps the arena floor`);
  }
  // The road runs THROUGH the arena, so a cleared region must still have a floor.
  const install = fn('installParadoxFloor');
  assert.match(install, /if\(full\)/, 'the floor and faces come back only when the fight does not');
  assert.match(install, /paradoxStep:1/, 'but the stairs over the faces are always pushed');
  assert.match(fn('buildCustomLevel'), /G\.stageIndex===12&&bossDone&&!G\.obstacles\.some\(o=>o\.paradoxFloor\)/);
  assert.match(fn('killEnemy'), /latchVoidTyrant\(\);installParadoxFloor\(false\)/);
  // And an authored region's own fields survive the finale remaster.
  assert.match(fn('applyFinaleActRemaster'), /if\(!CUSTOM_LEVELS\[G\.stageIndex\]\)\{[\s\S]*?detached\.has\(o\.type\)/);
});

test('the forward seam can actually open, which it could not before', () => {
  // tyrant-king is the game's first bossClear-gated physical seam. The gate reads
  // meta.world.cleared, which only commitPhysicalDeparture writes — and that runs
  // AFTER the seam has been asked. Nothing recorded the clear on the kill.
  assert.match(fn('latchVoidTyrant'), /recordWorldClear\(\)/, 'the kill records the zone clear');
  assert.match(fn('killEnemy'), /e\.type==='tyrant'&&G\.stageIndex===12\)\{completeTyrantReward\(\);latchVoidTyrant\(\)/);
  const reward = fn('completeTyrantReward');
  // HE PAYS NOTHING. Rare drops are cut, and a boss who withdraws cannot leave loot
  // behind him without contradicting his own exit — the region's reward is the
  // Hollow Crown recollection, authored in the world and not taken off his body.
  assert.doesNotMatch(reward, /dropBossItem/, 'no legendary comes off him');
  assert.doesNotMatch(reward, /chest/i, 'with no chest and no bag');
  assert.match(reward, /tyrantWithdraws\(e\)/, 'he withdraws instead');
  // And the withdrawal is the ABSENCE of a death, not a death plus particles.
  assert.match(fn('killEnemy'), /e\.noDeathSpectacle=true/, 'the kill grammar is suppressed');
  assert.match(fn('killEnemy'), /if\(meta\.soundOn&&!e\.noDeathSpectacle\)SFX\.enemyDie\(\)/, 'no death sound');
  assert.match(fn('killEnemy'), /if\(!e\.noDeathSpectacle\)\{const ex=e\.x/, 'and no body burst');
  // The seam he leaves by is the road west: the faces outlive the victory and the
  // kit cannot clear 360, so the exit has to be the thing he just used.
  assert.match(fn('tyrantWithdraws'), /installWithdrawalSeam\(\)/, 'and it opens the way on');
  assert.match(fn('installParadoxFloor'), /installWithdrawalSeam\(\)/, 'which survives a reload');
});

test('one bolt through the pair kills the band, from either mouth', () => {
  const charge = fn('chargeParadoxOrb');
  // The ONLY refusal left is "that is not a loop yet".
  assert.match(charge, /if\(!align\.opposed\)\{/, 'height no longer rejects a bolt');
  assert.doesNotMatch(charge, /if\(!align\.ok\)\{/, 'the band check cannot refuse the kill');
  // THE FIRST TRANSIT ARMS IT. Three real traversals of a 1,100 pair at 460 u/s is
  // 2.4 s each — seven seconds per kill — and every volley added three more counters,
  // so the room filled with 1/3 and 2/3 readouts cycling past each other and the
  // mechanic read as an infinite loop. It was never stuck; it was unreadable.
  assert.match(charge, /pr\.paradoxCharge=3;/, 'the first transit arms it outright');
  assert.match(charge, /pr\.y=axis;pr\.vy=0;/, 'and squares it to the pair');
  assert.match(charge, /G\._paradoxLoaded=pr;/, 'exactly one bolt is the loaded one');
  assert.match(charge, /G\._paradoxLoaded!==pr/, 'and the rest pass through as ordinary shots');
  assert.match(fn('advanceTyrantParadox'), /G\._paradoxLoaded=null;/, 'the slot frees each band');
  assert.doesNotMatch(charge, /pr\.tracking=true/, 'it must not home on the PLAYER');
  // The armed orb needs time to reach a boss who is faster every band.
  assert.match(charge, /pr\.life=9;/, 'and it lives long enough to land');
  assert.doesNotMatch(fn('killEnemy'), /paradoxBand!==/, 'no wrong-band deflect anywhere');
  // The band is a height the bolts actually fly at, not a caption on a rule.
  const shoot = fn('bossShoot');
  assert.match(shoot, /if\(e\.paradoxFight&&!e\.rightHandFight\)\{/, 'the volley owns the band height');
  assert.match(shoot, /\? fan\*0\.45/, 'and runs flat across the room');
  const status = fn('tyrantPairStatus');
  assert.match(status, /opposed:true/, 'and a pair reports "loop" separately from "in band"');
});

test('every room rehearses the fight before the fight', () => {
  const rooms = [[14400,17000],[11200,14400],[8100,11200],[5200,8100],[2600,5200],[0,2600]];
  for(const [lo, hi] of rooms)
    assert.ok(at(o => o.type === 'check' && o.x >= lo && o.x < hi).length >= 1, `room ${lo}-${hi} has a checkpoint`);
  // 1 · the rule, where it costs nothing: a spent ledge over floor you never leave.
  // The spent rule is introduced in the long climb, where it is the point: the last
  // two rungs do not come back, so the top third is a commitment. Room 1 no longer
  // carries a spent ledge because room 1 is now a void, and a ledge inside a 900-wide
  // void is a bridge across it — the kit crosses 671 flat.
  const firstSpent = at(o => o.spentLedge).sort((a, b) => b.x - a.x)[0];
  assert.ok(firstSpent, 'the region still teaches that a ledge answers once');
  assert.ok(firstSpent.x > 8400, 'and it does so on the climb, before the spent line');
  // And it is introduced over a VOID, not over ground that is always there. That is
  // the change: the rule only means something when spending the ledge costs you the
  // climb, and the checkpoint behind it is what keeps that fair.
  const floorUnder = at(o => o.deep && span(o).left <= firstSpent.x && span(o).right >= firstSpent.x);
  assert.equal(floorUnder.length, 0, 'over the void it hangs in, not over a safety net');
  // Every spent ledge is over real floor: being right must never cost the run.
  // A SPENT LEDGE MAY HANG OVER NOTHING. The old rule demanded a catch under every one
  // — "being right must never cost the run" — and that safety net is exactly why the
  // region was boring: a ledge over a floor is never a commitment. What must never
  // happen is a SOFTLOCK, so the requirement is now a checkpoint within reach behind
  // it, not a floor beneath it.
  const checks = at(o => o.type === 'check').map(o => o.x).sort((a, b) => a - b);
  for(const sp of at(o => o.spentLedge)){
    assert.ok(sp.respawnDelay >= 1e9, `the ledge at ${sp.x} comes back`);
    const behind = checks.filter(c => c >= sp.x);
    assert.ok(behind.length && behind[0] - sp.x < 3000,
      `no checkpoint behind the spent ledge at ${sp.x}: a fall there costs the region`);
  }
  // 2 · the one gate: a latched plate that lays planks over a void, permanently.
  const latch = at(o => o.citadelLatch)[0], gated = at(o => o.gate === 'citadel-planks');
  assert.ok(latch && latch.latch, 'the plate latches');
  //   WHAT HE LAYS IS ONE LINE, NOT THREE PLANKS. Owner: "this pressure plate activates
  // when I send oren to it, but I still don't know what is actually meant to do?" The
  // planks were a stepping-stone road 1,000-1,700 units WEST of the post — off-screen
  // when the order is given — so the latch had no visible consequence. One tear, strung
  // from the vantage to the far bank, put where the pan can reach it.
  assert.equal(gated.length, 1, 'and powers exactly one crossing');
  assert.equal(gated[0].type, 'seam', 'the right-hand zip-line, not a plank road');
  assert.equal(gated[0].period, 3.2, 'on the beat it had when the owner played it');
  assert.equal(latch.wiresTo, 'citadel-line', 'wired to it, visibly');
  assert.ok(latch.latchShow, 'and the latch shows what it just woke');
  assert.match(fn('updateObstacles'), /o\.latch&&o\.id!==undefined\)markPersistentCircuitOpen/, 'a latch has no inverse');
  // 5 · the vigil is opened by standing on its roof, and holds the confirmation.
  const cap = at(o => o.citadelCap)[0], chapel = at(o => o.citadelChapel);
  assert.ok(cap && cap.brittle && cap.reform >= 9999, 'a roof broken once stays broken');
  assert.equal(chapel.length, 2, 'closed on both flanks');
  // 220, not 300: the real requirement is that the inner step's plain double jump
  // clears the flank (150 + 148 = 298 >= 216), so escaping needs no dash-jump. At 300
  // the chapel was a one-way pocket you could slide into and never leave.
  for(const w of chapel) assert.ok(w.h <= 220, 'the flanks are clearable from the inner step');
  assert.ok(cap.breakFromBelow, 'and the roof opens from underneath, so nobody is sealed in');
  assert.ok(cap.w >= 440, 'the lid overhangs both flanks, so a lip is not a slide-in');
  //   THE OVERLOOK WENT WITH THE GROUND IT STOOD ON. Owner: the road from the ground-poundable
  // floor to the Tyrant was "lackluster - let's beef that up too with some back-to back
  // ziplines". It is now a void crossed by three rides, each through a slick pillar, each onto
  // a perch; the middle one rises. That chain is what stands before the fight.
  const chain = at(o => o.type === 'seam' && o.elementalActSystem === 'vigil-crossing');
  assert.equal(chain.length, 3, 'three back-to-back zip-lines from the chapel to the arena');
  assert.ok(chain.some(o => (o.bx < o.ax ? o.by > o.ay : o.ay > o.by)), 'one of them rises');
  assert.equal(at(o => o.citadelPillar && o.elementalActSystem === 'vigil-crossing').length, 3,
    'each through its own pillar, so a glide cannot replace a ride');
});

test('the story payload is placed, not merely declared', () => {
  const seal = at(o => o.memoryId === 'right-hand-seal')[0];
  assert.ok(seal, 'right-hand-seal exists in the runtime at last');
  assert.ok(seal.x > 2600 && seal.x < 5200, 'in the Vigil');
  assert.match(story, /id: 'right-hand-seal', order: 8, stage: 'void-tyrant'/);
  const crown = at(o => o.sealedRecollection)[0];
  assert.ok(crown && crown.x < ARENA_X - ARENA_W / 2, 'and the Hollow Crown sits beyond the arena');
  assert.equal(LEVEL.npcs.length, 1);
  assert.equal(LEVEL.npcs[0].profileId, 'sera', 'Oren only');
  assert.match(source, /crownguard:\{muster:1/);
  assert.match(source, /\n  'void-tyrant':\[/);
  const roster = /\n {2}'void-tyrant':\[([\s\S]*?)\n {2}\],/.exec(source)[1];
  assert.ok((roster.match(/\[/g) || []).length >= 12, 'a twelve-row roster');
  assert.ok(/'crownguard'/.test(roster));
  // Nine: the eighth-body cap plus the long climb's rail sniper, which the owner approved
  // as the climb's pressure beat.
  assert.ok(LEVEL.enemies.length <= 9 && LEVEL.enemies.every(e => e.noDrop));
});

test('every authored tier can be stood on', () => {
  const tiers = at(o => o.type === 'plat' && !o.deep && o.y > 0).map(o => ({ x:o.x, y:o.y, o, ...span(o) }));
  const deeps = at(o => o.type === 'plat' && o.deep).map(o => ({ y:o.y, ...span(o) }));
  // A wall answers a tier through the FACE that faces it: slickL makes only the WEST face
  // slick, slickR only the EAST. (The ledgers' tall column is slick on its west face so the
  // bottom layer cannot climb it; its east face is the climb to the top layer.)
  const walls = at(o => o.type === 'wall' && o.clingSurface && !(o.slickL && o.slickR));
  // A SEAM IS A WAY UP, so the reachability proof has to know about it. A tier with a
  // seam end on it is reached by dashing into the other end — that is the whole point
  // of the verb, and without this the proof calls the region's own mechanic a hole.
  const seamEnds = at(o => o.type === 'seam')
    .flatMap(o => [{ x:o.ax, y:o.ay }, { x:o.bx, y:o.by }]);
  /*   THE RIGHT-HAND LINE IS JUMPED FOR, SO ITS ENDS HANG IN THE AIR ON PURPOSE. Owner:
     "I WANT THE AREA YOU HAVE TO CLEAR BACK, and TO JUMP FOR THE RIGHT-MOST ZIPLINE" and
     "have the player simply dash to the end". So neither end has a surface under it:
     the east end is caught by a jump + air jump + dash off the bottom layer, the west end
     throws you to the bank. What must hold is that both of those hops are inside the kit
     — measured in the real engine by scripts/level-probe.mjs (17-frame boarding window,
     crossing found), and asserted here against the audit's conservative kit. */
  const line = at(o => o.citadelLine)[0];
  assert.ok(line && line.type === 'seam', 'the right-hand line is a seam');
  const bottom = at(o => o.type === 'plat' && o.x === 13300 && o.y === 500)[0];
  const bank = at(o => o.type === 'plat' && o.deep && span(o).right === 11880)[0];
  assert.ok(bottom && bank, 'the bottom layer and the far bank exist');
  assert.ok(line.ax < span(bottom).left && line.ax > span(bottom).left - 300 && line.ay < bottom.y,
    'the east end is a short jump forward and down from the bottom layer');
  assert.ok(line.bx - span(bank).right <= 700 && line.by <= 360,
    'and the west end is within a dash of the bank ("simply dash to the end")');
  // and the pillar stands between the ends, so the glide cannot replace the ride
  const pillar = at(o => o.citadelPillar && o.x > line.bx && o.x < line.ax)[0];
  assert.ok(pillar && pillar.slickL && pillar.slickR && pillar.y >= 1200, 'a slick pillar the ride passes through');
  for(const t of tiers){
    if(t.o && t.o.citadelPlank) continue;
    if(deeps.some(g => g.right > t.left - 240 && g.left < t.right + 240 && t.y - g.y <= CEILING)) continue;
    const step = tiers.some(o => o !== t && o.y < t.y && t.y - o.y <= CEILING &&
      o.right > t.left - 240 && o.left < t.right + 240);
    const sideways = tiers.some(o => o !== t && o.y === t.y &&
      (Math.abs(o.right - t.left) <= 355 || Math.abs(t.right - o.left) <= 355));
    // A cling face answers too: wallJumpHorizontalVelocity is 350, so a ledge
    // within ~300 of a face you can ladder is a place you can reach.
    const face = walls.some(w => Math.abs(w.x - t.x) <= 300 && w.y >= t.y - 40 && w.y - w.h <= t.y &&
      !(t.x > w.x ? w.slickR : w.slickL));
    const seam = seamEnds.some(m => m.x >= t.left - 120 && m.x <= t.right + 120 && Math.abs(m.y - t.y) <= 90);
    assert.ok(step || sideways || face || seam, `tier at ${t.x} is ${t.y} up with nothing under it`);
  }
});

test('the fight is legible in pixels', () => {
  assert.match(renderer, /function drawTyrantFigure/);
  assert.match(renderer, /e\.type === 'tyrant' && e\.paradoxFight\) return drawTyrantFigure/);
  const fig = fnFrom(renderer, 'drawTyrantFigure');
  assert.match(fig, /\[48, 178, 302\]/, 'the three bands are on the BODY, at the heights the fight measures');
  assert.match(fig, /k < round \? COLD : k === round \? LIVE/, 'and the live one is lit');
  assert.match(renderer, /function drawParadoxRails/);
  assert.match(renderer, /G\.stageIndex === 12\) drawParadoxRails\(\)/);
  const rails = fnFrom(renderer, 'drawParadoxRails');
  assert.match(rails, /L\.paradoxBands/, 'the rails read the real band table');
  assert.match(rails, /L\.tyrantPairOk/, 'and the alignment line reads the real status');
  assert.match(rails, /sag = ok \? 0 :/, 'it sags when the pair does not answer');
  assert.match(source, /paradoxBands:\(\)=>TYRANT_PARADOX_BANDS/, 'both are bridged out of the legacy path');
  // The fight's own maths is untouched.
  assert.match(source, /const TYRANT_PARADOX_BANDS=\[/);
  assert.match(fn('tyrantPairStatus'), /Math\.abs\(a\.x-b\.x\)>700/);
  assert.match(fn('advanceTyrantParadox'), /e\.paradoxRound/);
});

test('the camera leads the way the level runs', () => {
  // Fixed at .38 from the left, walking WEST showed 620 units ahead against 930
  // walking east — backwards in three regions now authored right to left.
  assert.match(camera, /anchorBias = approach\(anchorBias, lean/);
  assert.match(camera, /const anchorFrac = framing === 'player' \? 0\.5 - anchorBias \* 0\.12 : 0\.5/);
});

// ── THE ROAD THAT ASKS FOR SOMETHING ─────────────────────────────────────────
// The owner's reading of this approach: "No unique portal puzzles, no real platforming
// challenges, all enemies can easily be skipped, no need for Oren, artifactual coin
// route, and no real call for knight to use his wide arsenal of abilities."
const objAt = p => LEVEL.objects.filter(p);

test('the road pays nothing for a detour, and the planks are Oren\'s', () => {
  assert.equal(objAt(o => o.type === 'coin').length, 0,
    'a coin route is a second road that exists only to be collected');
  // THE ONE GATE ON THIS ROAD IS A COMPANION ORDER. Oren was carried the whole region
  // without ever being needed; the void at 11880-13140 has no floor under it and the
  // planks that cross it do not exist until he is told to stand on the post.
  const plate = objAt(o => o.type === 'plate' && o.id === 'citadel-planks')[0];
  assert.ok(plate, 'the planks have a plate');
  assert.ok(plate.followerOnly && plate.sendPost, 'and only the companion can weigh it');
  assert.ok(plate.latch, 'once, because a latch has no inverse');
  assert.equal(plate.y, 0, 'at the foot of the ledgers, on ground he can walk to');
  const line2 = objAt(o => o.citadelLine);
  assert.equal(line2.length, 1, 'one line, so the order IS the road and not a second one');
  assert.equal(line2[0].gate, 'citadel-planks', 'gated on that order');
  // A seam has to honour a gate at all, or the line is strung before he is sent.
  assert.match(fn('seamOpen'), /o\.gate&&!circuitOpen\(o\.gate\)\)return false/);
  // And the flag survives the spawn loop, which copies only what it is told to.
  assert.match(fn('buildCustomLevel'), /if\(en\.frontShield\)\{e\.frontShield=true;/,
    'an authored front shield reaches the enemy it was authored on');
});

test('the crate puzzle is cut, and the climb the owner asked for is in its place', () => {
  // "For the portal puzzle, zip line also serves no purpose and is clutter, and the
  //  solution is still to portal the walls and push it through. Just cut this entirely."
  // Three passes of enhancement never changed the solution, so the room is gone: crate,
  // shelf, ledger plate, its door and its seal.
  assert.equal(objAt(o => o.type === 'crate').length, 0, 'no crate anywhere in the region');
  assert.equal(objAt(o => o.id === 'citadel-ledger').length, 0, 'and no ledger plate');
  assert.equal(objAt(o => o.type === 'door' && o.circuit === 'citadel-ledger').length, 0, 'nor its door');
  // "I like how I have to climb it, jump to right, then dash to left to get on top of
  //  the T. I want multiple iterations of that kind of thing in a long row, back to
  //  back, for a fun climbing platforming challenge."  — nine rungs, in its place.
  const rungs = objAt(o => o.elementalActSystem === 'long-climb' && o.type === 'wall');
  assert.ok(rungs.length >= 9, `${rungs.length} faces is not "a long row, back to back"`);
  //   `climbRung` MEANS THE LONG CLIMB AND ONLY THE LONG CLIMB. Room 2's ledgers are a
  // separate ladder at overlapping heights; tagging one of them here interleaved the two
  // and this check reported their overlap as an impossible 20-unit rise. The tag stayed
  // off room 2 rather than the check being scoped, because the two Spent() rungs carry
  // 'spent-answer' as their own system and a system filter would have dropped them.
  const shelves = objAt(o => o.climbRung);
  assert.ok(shelves.length >= 7, 'seven T-bars, each a face with a shelf past it');
  //   "8 byte-identical transitions" was the complaint, so the rule is no longer one rise.
  // A standing double jump measurably reaches 210, so every climbing rise must exceed it
  // (or the bar is hopped and the column skipped). And twice the rung sits BELOW the last:
  // a bare drop column stands between, and you overshoot it and fall onto the bar.
  const byX = shelves.slice().sort((a, b) => b.x - a.x);
  let drops = 0;
  for(let i = 1; i < byX.length; i++){
    const rise = byX[i].y - byX[i - 1].y;
    if(rise < 210){
      drops++;
      const col = rungs.find(w => !shelves.some(sh => sh.x === w.x) && w.x < byX[i - 1].x && w.x > byX[i].x);
      assert.ok(col && col.y > byX[i].y, `the ${rise} step at ${byX[i].x} has no drop column over it`);
    } else assert.ok(rise <= 350, `a ${rise} rise is beyond the kit`);
  }
  assert.equal(drops, 2, 'two drop rungs');
  assert.ok(objAt(o => o.climbRung && o.spentLedge).length >= 2, 'two spent rungs');
  //   The world resets anything above CEIL_Y+400 = 2000. Every surface on the tower must
  // leave a full jump (210) under that, and so must the sniper that hangs over it.
  for(const w of rungs) assert.ok(w.y + 210 < 2000, `the column at ${w.x} reaches ${w.y}`);
  const sniper = LEVEL.enemies.find(e => e.citadelRole === 'long-climb-sniper');
  assert.ok(sniper && sniper.railSniper && sniper.y < 1950, 'a rail sniper over the top third, inside the world');
  // And it hangs over nothing — except the ENTRY rung, which is how you board it from
  // the east bank. Every rung above the first is over the void, so there is no point
  // on the chain you can step off onto ground and walk on.
  const above = shelves.slice().sort((a, b) => a.y - b.y).slice(1);
  for(const sh of above)
    assert.equal(objAt(o => o.deep && span(o).left <= sh.x && span(o).right >= sh.x).length, 0,
      `the rung at ${sh.x} has floor under it, so the climb can be left mid-way`);
});

test('the spent line is lethal under it, and one body must be answered', () => {
  // The floor between the raised pair used to be open ground with three teeth on it.
  const teeth = objAt(o => o.type === 'spikes' && o.x > 6300 && o.x < 7000)
    .map(o => ({ l:o.x - o.w / 2, r:o.x + o.w / 2 })).sort((a, b) => a.l - b.l);
  assert.ok(teeth.length >= 4, 'the line is continuous, not three islands of timing');
  for(let i = 1; i < teeth.length; i++)
    assert.ok(teeth[i].l - teeth[i - 1].r <= 1, `open ground at ${Math.round(teeth[i - 1].r)}`);
  //   THE WAY OVER IS THE PORTAL, NOT LEDGES. This used to demand two spent ledges over
  // the teeth — which is precisely what made the bed hoppable and the crossing optional.
  // The bed now lies between the two raised faces with nothing in it at all.
  const spent = objAt(o => o.spentLedge && o.x > 5200 && o.x < 8100);
  assert.equal(spent.length, 0, 'nothing stands in the bed');
  assert.ok(objAt(o => o.type === 'seam' && o.ax > 7000 && o.ax < 7900).length === 1,
    'a seam feeds the east face at speed');
  // One body on this road cannot be walked past.
  const shielded = (LEVEL.enemies || []).filter(e => e.frontShield);
  assert.equal(shielded.length, 1, 'exactly one, in the chapel doorway');
  assert.equal(shielded[0].citadelRole, 'vigil-guard');
});

test('a band restores Blood, the last one fires slower, and he does not die', () => {
  const adv = fn('advanceTyrantParadox');
  assert.match(adv, /restoreBlood\(G\.p,Infinity\)/,
    'every band is its own puzzle and you come to it whole');
  assert.match(adv, /e\.shootCd=e\.paradoxRound===1\?1\.55:1\.15\/0\.75/,
    'the head band fires a quarter slower: rate x0.75 is interval /0.75');
  // HE DOES NOT FALL. The third band is the halfway point of a fight that finishes in
  // the King's hall, so the beat that ends it must not read as a death.
  const wd = fn('tyrantWithdraws');
  assert.match(fn('completeTyrantReward'), /tyrantWithdraws\(e\)/, 'the victory calls it');
  assert.match(wd, /meta\.tyrantWithdrew=true/, 'and records that he left rather than died');
  assert.match(wd, /G\.tyrantSeam=\{x:bx,y:by,at:G\.time\}/, 'leaving one seam behind');
  assert.match(wd, /THE CROWN DOES NOT FALL/, 'and one line that does not explain itself');
  assert.doesNotMatch(wd, /vx:\(Math\.random\(\)-0\.5\)\*3[0-9][0-9]/,
    'the body folds INWARD; a scatter would read as a corpse');
  const seam = fnFrom(renderer, 'drawTyrantSeam');
  assert.match(seam, /G\.tyrantSeam/, 'the renderer draws it');
  assert.match(seam, /2\.6/, 'for the couple of seconds after he is gone');
});

test('the spike crossing is a crossing: nothing spans it, and the fling survives a footfall', () => {
  /*   THE JUMP IS THE LANDING SPOTS, NOT THE HAZARD. The bed was widened from 680 to 2,160
     while the ledges stayed at 7180/7000/6300/5840 — widest gap 540 against a 671 reach —
     so the owner still hopped it and reported, correctly, that "it is the SAME distance;
     the spikes are simply extended further, which is nonsense". Asserting the hazard's
     width would have passed. Assert the GAP. */
  const teeth = at(o => o.type === 'spikes' && o.x > 5000 && o.x < 7600)
    .map(o => ({ l: o.x - o.w / 2, r: o.x + o.w / 2 })).sort((a, b) => a.l - b.l);
  assert.ok(teeth.length >= 4, 'there is a bed');
  const bedL = teeth[0].l, bedR = teeth[teeth.length - 1].r;
  // Nothing to stand on between the lips.
  const inside = at(o => o.type === 'plat' && !o.deep && o.y > 100 &&
    o.x - o.w / 2 > bedL - 40 && o.x + o.w / 2 < bedR + 40);
  assert.deepEqual([...inside.map(o => o.x)], [], 'a ledge inside the bed is a hop, not a crossing');
  // And the lips are further apart than the kit can reach off a drop.
  const lips = at(o => o.type === 'plat' && o.y > 100 && o.y < 400 && o.x > 4800 && o.x < 7600)
    .map(o => ({ l: o.x - o.w / 2, r: o.x + o.w / 2 })).sort((a, b) => a.l - b.l);
  const east = lips.find(p => p.l >= bedR - 40), west = [...lips].reverse().find(p => p.r <= bedL + 40);
  assert.ok(east && west, 'a lip on each side');
  const gap = east.l - west.r;
  assert.ok(gap > 774, `${Math.round(gap)} of gap is inside the kit's 774 off a drop`);
  // The west slate face must be OUTSIDE the bed, or the authored crossing ends in spikes.
  const faces = at(o => o.tyrantFace && o.x > 5000 && o.x < 7600).map(o => o.x).sort((a, b) => a - b);
  assert.ok(faces.length === 2, 'the raised pair');
  assert.ok(faces[0] <= bedL + 40, `the west face at ${faces[0]} stands inside the bed`);

  /*   AND THE FLING HAS TO SURVIVE THE FOOTFALL. The seam sets the knight down ON a ledge
     forty units short of the mouth; the ballistic window used to zero the instant he
     touched ground, so friction took 640 u/s to 236 in four frames — and a portal's exit
     speed is just its incoming speed clamped. Measured after this fix: exit 640, carried
     past the bed, zero Blood. The old assertion checked the SEAM's exit speed, which was
     always 640 and never the number that mattered. */
  assert.doesNotMatch(source, /_ballisticT>0\)\{p\._ballisticT-=dt; if\(p\.onGround\)p\._ballisticT=0;\}/,
    'the ballistic window must not be cleared by landing');
  assert.match(source, /const flung=\(p\._ballisticT>0\);/, 'and it applies on the ground too');
});

/* THE OWNER'S THIRD CITADEL PASS, 2026-09-21. Each assertion quotes the ask it keeps true.
   The routes themselves were measured in the real engine with scripts/level-probe.mjs
   (reachability search over real inputs, validated against climbs the owner has played);
   these static checks pin the geometry those measurements were taken on. */
test('room 2 is the room as played, plus the wall the owner prescribed', () => {
  // "Extending the wall up to where the top platform is should do the trick."
  const wall = objAt(o => o.type === 'wall' && o.x === 13450 && o.y === 690)[0];
  assert.ok(wall, 'the ledgers column reaches the top layer (690)');
  assert.ok(wall.slickL && !wall.slickR, 'its EAST face is the climb; its WEST face cannot be climbed from below');
  // "the top layer was simply cut! Not what I wanted" — both layers and the first line are back
  assert.ok(objAt(o => o.type === 'plat' && o.x === 13540 && o.y === 690).length, 'the TOP layer');
  assert.ok(objAt(o => o.type === 'plat' && o.x === 13300 && o.y === 500).length, 'the BOTTOM layer');
  const first = objAt(o => o.type === 'seam' && o.ax === 13480 && o.ay === 690)[0];
  assert.ok(first && first.setDown, 'the first line runs from the top down onto the bottom layer, and sets you down');
  // "the bottom platform should only be accessible via the zip-line to force using it"
  const cap = objAt(o => o.citadelUpperCap)[0];
  assert.ok(cap && cap.slickL && cap.slickR && cap.y - cap.h >= 690 && cap.y >= 1100,
    'an unclimbable cap above 690 stops the drop and the over-the-top hop onto the bottom layer');
  // the false platforms and the left line are gone; the right line is back
  assert.equal(objAt(o => o.citadelPlank).length, 0, 'no planks ("the false platforms")');
  assert.equal(objAt(o => o.type === 'seam' && o.ax === 12480).length, 0, 'no left-hand line');
});

test('room 4: the pair is the player\'s, and the zip-line is what throws you across', () => {
  // "YOU REMOVED MY ABILITY TO SET THE PORTAL UP ... THERE IS A SOLID PORTAL ON THE LEFT PART"
  assert.equal(objAt(o => o.type === 'lportal' && o.anchor).length, 0, 'no fixed anchor mouth in the Citadel');
  // "the path of spikes needs to... be significantly longer, with MORE distance between the two walls (THIS IS FIXED, GOOD)"
  const faces = [...objAt(o => o.tyrantFace && o.citadelRaised).map(o => o.x)].sort((a, b) => a - b);   // [...]: VM-realm array
  assert.deepEqual(faces, [5620, 7200], 'the faces the owner signed off on');
  // "zip line should send you FLYING out of the second portal"
  const carry = source.slice(source.indexOf('function portalTransit('), source.indexOf('function portalTransit(') + 5000);
  assert.match(carry, /if\(ent===G\.p&&\(ent\._ballisticT\|\|0\)>0\)\{/, 'only a seam-fed transit is carried');
  assert.match(carry, /if\(Math\.abs\(ex\.nx\|\|0\)>0\.7\)ent\.vy=-\(tune\.lift\|\|SEAM_CARRY_LIFT\);/, 'out of a wall mouth it arcs');
  assert.match(source, /const SEAM_CARRY_MAX=1200;/);
  assert.match(source, /const SEAM_CARRY_LIFT=1100;/);
});
