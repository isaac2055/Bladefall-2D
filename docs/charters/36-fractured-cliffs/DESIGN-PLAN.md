# The Fractured Cliffs (stage 36), built 2026-09-25 (7.216.0)

## Second look — 7.220.3

Slam landing detection now remains armed during the entire descent, including repeated
launch heights. Focused regression tests cover both cases. A native-input Path fixture
registered two successive long slams from exactly the same height. No timing or geometry
retuning. See current brief for the second-look verification scope.

## Refinement — 7.220.2 (2026-09-25)

Lock opening has a remaining-time bar; lunge shows its committed target. Decorative wave spray uses deterministic visual hash. Fixed final collar strike overwriting the released/down state with the return animation. Retry clears slam origin, waves and dialogue. Native slam from a positioned last-strike fixture freed the head and retained down state.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's sixteenth echo: the Thunder Cliffs after the Echo walked it backwards. The ship is a wreck on the
beach, and the sea has come up the cliffs to meet you. It is the same storm.

**The kit** is the one the Cliffs were entered with: everything through the gravity flip.

**The Chainhook** waits on the wreck's windlass and is taken with the downward strike, as the hulk's was
(`F.grant('chain-hook')`).

**The Muster applies.**

**Code:** `public/bladefall-fractured-cliffs.js` and `-art.js`.
- **Stage and seams:** stage 36, zone `fractured-cliffs`. The seam `fl-fc` comes from the Line; the east seam
  `fc-fs` opens once the Last Head is free.
- **Rest site:** `wreck-ash` (The Wreck Fire).
- **Music:** `fractured-navigating-the-red-wake.mp3` on the road, and `fractured-chains-of-the-deep.mp3` for the
  Last Head.

**Engine parts reused:**
- the Chainhook and `actRing`. It works on every stage from 16 up: a ring within 470, a pull to 58 under it, a
  hang of 1.7 s, and a jump out counts as a ground jump;
- the downward strike;
- the shared ring art (`BladefallActTwoArt.shared.drawRing`).

**Built here:**
- the lightning on the iron;
- the breakers;
- the chain drawn from your hand to the ring (only stage 16's art drew it);
- the Last Head.

The Hydra and the ship machinery are stage-16-only, so none of it is used.

**No shared changes.**

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Wreck | 0–1900 | the voyage's deck; the hulk's windlass (the hook) | the ship on its side. The windlass is a low drum (24): jump and strike it from above for the hook. Then two rings over an 800 gap: hook, hang, hook again from the hang, jump out |
| The Iron Road | 1900–4450 | lightning on the ship's iron | six rings over 2,300 of sea, each within the hook's reach from the last one's hang. The lightning finds ring i at 0.5 s × i of every 3.0 s, warned 1.2 s before (a white crawl on the rim), and the ring is gone for 0.7 s. A knight hanging on it is hurt and dropped. The strike walks east, the way you go: follow behind it. The hang (1.7 s) runs out before the next strike (2.3 s), so you keep moving |
| The Breakers | 4450–7000 | the 262 breakers over the deck; the rigging | walls of water 260 high and 140 wide come off the sea every 3.4 s at 520. They spawn 1,200 ahead of you (spray shows at the screen's edge first), and none spawn in the last 450. Seven rings at 340: be hanging from one as it passes, which puts your feet at 282. Hook the ring behind you, not the one you'd be pulled into the water toward. A wave catches you on the ground and it's a fall |
| The Last Head | 7200–8800 | the Hydra (three heads chained to staples; a downward strike on the lock while the chain is taut) | **the C-side** |

## The C-side: the Last Head
The Hydra's last head was chained to the cliff and forgotten.
- **The lunge:** it rears (0.8 s tell), then lunges at the ring you stand under and ends low (y 90), 18 damage if
  it catches you.
- **The strain:** its chain pulls taut for 2.6 / 2.4 / 2.2 s, and the lock on its collar lights.
- **The blow:** hook the ring over it (440, in reach from the floor 150 to either side), drop out of the hang
  and strike down. The strike must begin at least 150 above the lock, which nothing in the hall but a hang
  reaches. It throws you back up.

Two blows in each of three acts: the second brings the breakers into the hall (14 damage, no rewind), the third
the lightning onto the head's rings. Leaving the hall resets the fight; a finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the end card ("FRACTURED SHORES") in 72 s:
- the windlass, the first gap;
- the Iron Road on the first try;
- the Breakers (six hangs);
- the Last Head in 26 s (2 hits).

Separately:

| Section | Result |
|---|---|
| The Iron Road, following the lightning from three start times | 3/3 |
| The Iron Road, hooking every ring as soon as it's in reach | through at start times 0–1.2 s, hurt and rewound at 1.6–2.4 |
| The Breakers | 3/3, ~20 s, 5–7 hangs |
| The Breakers, running without hooking | 8 rewinds, never through |
| The Last Head, from three entry points | 3/3, 22–26 s |

Changed while verifying:
- **The windlass** first stood 60 high. A jump (78) left no room for a strike, and a strike begun a few units up
  lands in the same frame, so the echo never saw it. It is now 24 high, and a new strike is read from where the
  engine says it began (`p.slamFromY`).
- **The first ring** was 487 from the gap's edge, past the hook's 470. It is now 396, with a second ring from its
  hang.
- **The head's rings** were first at 480, out of reach from the floor more than ~110 to either side. Now 440.
- **The breakers** spawned at the cliff's end when you neared it, arriving with no warning. They now spawn 1,200
  ahead, never in the last 450.
- **The staple's rock** was a wall across the road to the exit. It is drawn only.

## Open
- Owner playtest: whether the lightning's rim-crawl reads as "not this ring", whether "hook the ring behind you"
  is found at the Breakers, and whether the head's lit lock reads as the place to strike.
- The Iron Road is forgiving at its natural pace: a knight hooking as fast as it can keeps up with the lightning
  about half the time without meaning to.
