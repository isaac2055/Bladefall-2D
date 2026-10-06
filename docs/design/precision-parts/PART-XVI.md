# Part XVI · Thunder Cliffs (levels 150–159, 7.254)

Act 2's opener. The base game's verb here is the chainhook, and the cliffs are timber that won't hold still. The
precision mirror is the **hook ring** (swing, haul, pay out, let go at speed) and the region's device is the
**moving deck**. From here, momentum can be required, so each piece of it gets its own room first: the ring let go of
on the upswing (151) and the deck left while it runs (153). Supers and hypers are *not* taught here; Part XVII
teaches them (163, 165).

Files: `public/bladefall-pcore-part-150-thunder-cliffs.js` (written by `scripts/pcore-author/gen.py`),
`scripts/verify-precision-part-150.mjs`, device `public/bladefall-pcore-dev-hook.js` (+ `-view.js`).
Gates (already placed): the Pier Gate holds 150–154 (teach), the Staple Gate holds 155–159 (combine).

## The devices (as the rooms use them)

- **Hook ring** (glyph `O`). In the air, hold grab within 56 px and the chain catches. The chain takes up its own
  slack, so its length is how close you came. Up hauls in (to 12 px), down pays out (to 80 px). Let go of grab and you
  fly on at the swing's speed with no air drag until you land; jump to let go with a little lift. With grab still
  held, the next ring in reach catches you, never the one you just left.
- **Moving deck** (`decks:[{c,r,w,h,to,period,phase}]`). A solid platform that runs its track and back, easing at
  each end. It carries you, and a jump off it takes its speed. Decks start with the room's first input.

What the hook's physics mean for room design (measured, and worth knowing before building more ring rooms):
catching a ring while you *rise* toward it gives a weak swing (you close in radially and the chain snaps short). The
big swing comes from *falling past* a ring about 45 px to its side: you meet the chain tangentially and keep all of
the fall. So the fling rooms start on a ledge above the ring and you walk off. A hyper or a deck's speed into a ring
is the same trick with more speed, which is where most skips came from (below).

## Device changes

- **None to the module.** The failing fixture "a deck carries the knight (40 px)" was the fixture's fault: its tape
  gave no input, and decks start with the room's first input (the module's documented rule, same as the watch
  lamps and the foes). `scripts/verify-precision-devices.mjs` now presses grab on the ground for one frame (which
  moves nothing), and a new fixture checks that a deck waits for that first input. Fixtures: 50 passed, 0 failed.

## The levels

| Level | Room | The question (and the answer) | Wrong answer that fails (count) |
|---|---|---|---|
| 150 | First Chain | The ledge is higher than a jump and a dash. What can you hang from on the way up? (Jump, catch the ring, haul in, jump off, dash up.) | Jump, dash and climb from the floor, 594 tapes, 0 succeed; search without the chain: none |
| 151 | Let Go | The far ledge is higher than where you start. What does the swing give you if you let go on the way up? (Walk off beside the ring, swing, jump off on the upswing, dash.) | Jump and dash, super or hyper from the start (232, 0); hang from the ring at rest, then jump and dash (54, 0); let go on the way down (126, 0); search without the chain: none |
| 152 | Deck | No jump reaches the ledge, and its face is thorned. What will carry you up? (Wait for the deck, ride it, step off at the top.) | Jump, dash and climb from the floor with the deck anywhere (192, 0); step off before the top (15, 0); search without riding: none |
| 153 | Running Start | From the end of the track the far ledge is out of reach. When is the deck worth more? (Walk with it while it runs, jump, dash.) | Jump and dash, super or hyper from the deck at rest at either end (272, 0); search that never leaves a moving deck: none |
| 154 | Chain Ladder | The shaft is taller than any jump, and its walls are thorned. How do you climb it? (Ring to ring, holding grab.) | One ring then jump and dash (108, 0); search that may use only one ring: none |
| 155 | Deck to Ring | The ring is out of reach from the cliff, and from the deck at rest it swings you nowhere. What does the deck lend the chain? (Jump from the moving deck into the ring, swing, jump off, dash.) | Jump and dash or super off the deck without the chain (550, 0); jump for the ring while the deck rests, at either end (48, 0); search without the chain: none |
| 156 | Moth Between | A fling and a dash fall short of the far cliff. What else in the air can you push off? (Fling, down-cut the moth, dash.) | Fling and dash without a cut (162, 0); search without the moth: none |
| 157 | Long Chain | The tally stone hangs below the bottom of the swing. How long is the chain? (Pay the chain out to its full length, touch the stone, haul in, jump off.) | Swing and cross without paying out (75, 0); pay out too little (18, 0); search that never lights the stone: none |
| 158 | Returned Fire | The tally stone is out of every reach. What can you send up there? (Hang on the ring and parry the spitter's bolt with up held.) | Cut the bolt, dodge it, or parry it any way but up (77, 0); search without a parry: none |
| 159 | Thunder Cliffs (two rooms) | *The Staple:* the ledge is higher than any swing throws you; what is left in the air after the chain? (Deck, ring, fling, down-cut the moth, dash.) *The Lip:* the warder faces the drop with no room in front; where do you land? (Behind him, off the fling, and cut his back.) | Staple: deck, ring and dash without the moth (96, 0); search without the moth: none. Lip: at the shield from the front (192, 0); search that fells him without landing behind him, supers and hypers excluded: none (see below) |

Enemies are in 156 (moth), 158 (spit) and 159 (moth, jailer): four of eleven rooms.

What the player does, in feel:
- **150** is a breather after the Deep Line. You jump, the ring lights up, you hang in the air, and a small hop and a
  dash put you on a ledge you couldn't reach. One new idea: the ring holds you.
- **151** is the first real swing: step off, drop past the ring, and the chain turns the fall into a big arc. Let go
  as it climbs and you're thrown higher than you started. The fling is the reward you feel.
- **152** is a patience room: the deck comes down, you step on, it lifts you. Nothing to execute.
- **153** asks you to jump while the ground is moving. Jump at the end of the track and you fall short; jump
  mid-run and the deck throws you.
- **154** is a rhythm: catch, swing, hop to the next ring, up and out of a shaft with no walls.
- **155–158** each cross the hook with one thing: the deck's speed into a swing, a moth to push off after the
  fling, a chain paid out to its full length (the stone is exactly at the bottom of it, so holding down is enough),
  and a bolt sent straight up from the ring.
- **159** is two rooms, each a checkpoint: the whole region in one flight (deck, ring, moth), then a warder on the
  lip you swing over and cut from behind before he turns.

## What the sweeps caught, and the fixes

- **Rock corners at the top of a thorned face** were catchable: a hyper plus an up-dash grabbed the solid top tile
  above the thorns and climbed onto the ledge (150, 155, 156, and the warder's lip in 159b). Those faces are now
  thorned right to the lip (`lip=True` in the build), so there is no corner to hold.
- **Hypers.** Untaught here, and strong: a hyper keeps ~300 px/s, a jump after landing from one keeps it too, and a
  hyper *into a ring* is a very big swing whose release coasts. Fixes, room by room:
  - 153 (Running Start): a hyper or super from the deck crossed the first two layouts. The far ledge is now four
    tiles above the deck and nearer; a hyper's flat arc hits its thorned face, a lifted jump and dash clears it.
  - 156 (Moth Between): a hyper along the start ledge, a jump that kept its speed, and later a hyper into the ring.
    A low roof now covers the start ledge and runs two tiles past its edge (no jump from it clears the roof), and
    the ring is a row lower, out of reach of the hyper's flat path; the walk-off drop still meets it.
  - 159a (The Staple): a hyper off the deck into the ring (and, without the hyper, a deck-speed swing hauled in hard)
    reached the ledge without the moth. The ring moved down and left one tile; the moth and ledge moved right. The
    search now finds nothing even with hypers allowed.
  - **159b (The Lip): not fixed; the check is narrowed.** A hyper off the start ledge reaches the warder's shield face
    (his body is solid, so you can wall-jump on it), and from there a parry of his thrust and a cut fell him from
    the front. That needs the gaol module's jailer body to be unclimbable, which isn't mine to change. The search
    excludes supers and hypers and finds nothing; everything else is searched. Isaac's call whether that line is fine
    for Act 2 or the jailer's body should refuse a grab.
- 158's first family counted the right answer (parry with up held) as a wrong one; the family now holds only real
  wrong answers.
- 150's "never haul in" family was dropped: hanging on a long chain and hopping off also works, and it still answers
  the question (the ring holds you).

## Dropped designs

- A **horizontal** fling room (ring over a flat gap): the catch radius collapses to ~32 px when you approach a ring,
  so the fling's head start is small and jump-and-dash or a super crosses anything the fling crosses. All ring rooms
  are vertical instead: the ring is a place to stand in the air.
- **Crystal Swing** (fling, dash, crystal, dash): one success in 864 tapes and no layout above 5 in 180. Replaced by
  the Chain Ladder.
- **Ring to Ring sideways** (fling from one ring into another): a low, fast release skipped the second ring.
- **Bell in the Arc**: every dash also flips the two-phase blocks, so the bell wasn't the only way to ring them.
- **Wallbounce** rooms: every wall in the core is climbable unless thorned, and thorns block the wallbounce too, so no
  room needed it.

## Difficulty curve (intended)

150 sits below the Deep Line's close: one ring, no timing, generous windows (haul in anywhere from 15 frames on).
151, 153 and 154 each teach one momentum idea with windows around 10–12 frames. 152 is a rest. 155–158 each add one
thing to the hook; 156 and 158 are the tightest (a 4–5 frame release window over the moth, a 7-frame parry). 159 is
the peak: two rooms, the Staple needing a 6-frame jump off the deck, a 10-frame release and a well-timed down-cut,
then the Lip's fling and a turn-and-cut before the warder turns. That should sit a little above the Throne and
Deep Line peaks, and every retry is one short room.

Verifier: 38 checks, all green, 86 s wall on a quiet machine (about 5 minutes when nine builders were loading it). The page (`precision.html`, `sw.js`,
`build-deploy.sh`) doesn't list the part file yet; `scripts/pcore-sync-page.mjs` adds it.
