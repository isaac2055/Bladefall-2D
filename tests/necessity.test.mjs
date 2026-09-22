/* "CAN THE PLAYER SKIP THIS?" — the check this repo never had.
 *
 * Every other geometry test here proves authored content can be REACHED. None proved it
 * had to be USED, so decoration beside a continuous floor passed review indefinitely: the
 * Citadel shipped eight seams, a cling tower, five spent ledges and a slam pocket, and a
 * floor-walk to the arena skipped all of it.
 *
 * The rule, in the owner's words: EVERY SECTION MANDATORY OR CUT. A beat tagged
 * teach/test/twist is the level claiming it asks something of the player. If that object
 * can be deleted and the boss is still reachable, the level is not asking — it is
 * decorating. 'recovery' and 'reward' beats may be skippable; a checkpoint ledge or a
 * lore stone beside the road is furniture on purpose.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { audit, canCross, KIT, standingRoom } from '../scripts/necessity-audit.mjs';

const label = o => o.type === 'seam'
  ? `seam ${Math.round(o.ax)},${Math.round(o.ay)}->${Math.round(o.bx)},${Math.round(o.by)}`
  : `${o.type} x=${Math.round(o.x)} y=${Math.round(o.y || 0)}`;

test('the reach model only ever grants moves the kit measurably has', () => {
  // Generous to the player on purpose: anything the audit calls skippable really is.
  assert.equal(KIT.reachFlat, 671);
  assert.equal(KIT.reachDrop, 774);
  assert.ok(canCross(660, 0), 'a flat 660 is inside the kit');
  assert.ok(!canCross(700, 0), 'a flat 700 is not');
  assert.ok(canCross(760, -400), 'but 760 off a 400 drop is');
  assert.ok(!canCross(400, 200), 'and nothing lands above the apex');
});

for(const stage of [12, 13]){
  test(`stage ${stage} asks for everything it claims to ask for`, () => {
    const r = audit(stage);
    assert.equal(r.baselineReachable, true, 'the boss is reachable at all');
    // 1. The headline. A continuous walkable floor makes every challenge optional by
    //    construction, whatever is built on top of it.
    assert.equal(r.floorOnlyRouteExists, false,
      `${r.name}: a floor-only walk reaches the boss, so nothing authored is required`);
    // 2. The invariant, at the granularity that means something. A climbing chain has
    //    redundancy on purpose — pull one rung of seven and the rest still make a route
    //    — so the question is not "is this object load-bearing" but "can the player get
    //    past this SECTION without doing it". Each authored system is removed whole.
    const named = r.skippableSections.map(x => `${x.system} (${x.objects} objects)`);
    assert.deepEqual(named, [],
      `${r.name}: ${named.length} authored sections can be bypassed entirely:\n    ` + named.join('\n    '));
    assert.ok(r.requiredSections.length >= 2, 'and the road is made of more than one section');
  });
}

/* EVERY STAGE THE AUDIT CAN LOAD, not just the two being edited. The Citadel's three
   floating crownguards came from its MUSTER roster, which this sweep did not read, in a
   level whose own enemy list was clean — so "stage 12: every body has a surface" passed
   while three bodies hung in voids I had cut myself. */
/*   ASSERTED FOR 12 AND 13 ONLY, and that is a limit of the MODEL, not a convenience.
   Run over stage 11 it flags bodies that stand on CEILINGS — legitimate in a region built
   on flipped gravity — and over stage 15 it flags a checkpoint sitting on a SLOPE, whose
   y is stored as the span's maximum. Both are support the sweep cannot yet reason about.
   `node scripts/necessity-audit.mjs 11 15` still prints them for review; asserting them
   here would train me to silence a real check to make a red suite green. */
for(const stage of [12, 13]){
  test(`stage ${stage}: every body has a surface under it`, () => {
    /* Eight entities were standing on nothing after voids were carved into these levels —
       enemies suspended mid-air, a companion post Oren could never reach, and two
       CHECKPOINTS hanging over holes. An armed checkpoint with no floor is a death loop:
       you can only touch it while falling, and it respawns you into the same hole. */
    const r = standingRoom(stage);
    const named = r.floating.map(f => `${f.kind} ${f.label} at ${f.x},${f.y}`);
    assert.deepEqual(named, [],
      `${r.name}: ${named.length} bodies stand on nothing:\n    ` + named.join('\n    '));
  });
}
