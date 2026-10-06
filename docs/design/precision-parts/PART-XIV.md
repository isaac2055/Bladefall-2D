# Part XIV · The Throne (levels 132–139, 7.254)

The Abyss King's region. The base game's verbs here are the echo (two marks held at once) and the King hijacking
your portals. The precision mirrors are the **echo** (leave a body, trade places with it), **re-aimed portals** (a
pair the room owns and moves on a clock) and the Base Bank's **Wake Behind** (a shade that walks your own path).

Files: `public/bladefall-pcore-dev-throne.js` (+ `-view.js`), `public/bladefall-pcore-part-132-throne.js`,
`scripts/verify-precision-part-132.mjs`. The Citadel (123–131) introduces the echo at its close.

## The devices

- **Echo** (`echo:true`). The echo key leaves an echo where you stand; press it again and you trade places. You
  arrive still moving as you were; the echo stands where it is left, in the air if need be, and presses a plate.
- **Wake** (`wake:{delay}`). A shade walks your exact path `delay` frames (40 here) behind you, from your first
  move. Touching it is death. It follows a trade too, `delay` frames late. Two consequences players find: you
  cannot double back past it, and you cannot stand still for more than about two thirds of a second, but you
  can wait as long as you like *before your first move*.
- **Re-aimed portals** (`portalMode:'fixed'`, `reaim:{every,sets}`). Both ends are the room's; every `every`
  frames the pair moves to the next set. You cannot fire.

No device constants changed this pass.

## The levels

| Level | Room | The question | Wrong answer that fails |
|---|---|---|---|
| 132 | Hold the Door | The plate holds the door only while something stands on it. Who stands there while you go through? (Your echo.) | Step off and run (22); the echo left anywhere but the plate (6); search without the echo |
| 133 | Still Moving | The way out is higher than any spring. Where do you want to be going up from? (Leave the echo at the top of a jump and dash from the step, then trade while the spring throws you up.) | Spring and dash, no trade (176); echo left low (132); straight up from the step (18); search without a trade |
| 134 | Re-aimed | The far end moves every three quarters of a second and the fall takes longer. When do you step off? (While it points the wrong way.) | Step off as it turns to the way out (23); search without the pair, climbs included |
| 135 | Wake Behind | The stone is at the far end of a ring. How do you reach it without coming back the way you went? (Go round.) | Up the far shaft and back down (27); along the top and back (10); search that forbids going round the ring |
| 136 | Swap Past It | The stone is at the head of a dead end with the shade behind you. How do you get back down past it? (Echo at the foot, trade at the head.) | Climb or drop back down (18); echo left at the head (9); search without a trade |
| 137 | Onto the Plate | The plate is sealed away up high and there is no way back from it. Where do you leave your echo? (Down by the door; the trade puts it on the plate.) | No echo below (18); echo on the plate, then out the way you came (24); search without a trade |
| 138 | Room Above | The lower passage is a dead end and the shade is right behind you. Where is there room to turn round? (Above: pogo the moth up the thorn shaft into the upper passage.) | Back along the passage, with or without a hop into the shaft first (12); up the shaft on a jump and a dash (36); search without the moth |
| 139 | The Throne | A door that will not wait, a shade that will not let you, and no way back from the throne. What do you leave behind, and when do you go? (Leave the echo on the ledge, wait *before* your first move, step off so you land as the door turns to the throne, sit on the throne and trade.) | Set off at once and wait at the edge (66); step off so you land while it shows the thorns (21); no echo until the throne room (6); the echo left in the pit (15); trading anywhere but the throne (6); searches without a trade and without the door |

What the player does, in feel: 132–134 each hand over one idea alone (leave yourself behind; arrive still moving;
go when it's wrong, arrive when it's right). 135 is the shade alone — a lap of a ring, never looking back. 136 and
137 pair the echo with one friend each (the shade; a re-aimed door). 138 pairs the shade with an old one, the moth:
you drop into a passage you can't climb out of, light the stone and go *up* past the thorns. 139 is the summit: you
stand at the start watching the far door flick between a thorn cell and the throne room, leave your echo by the
barred door, and only then move — because once you move, the shade won't let you stop. You drop down a long pit,
land in the blue as the door turns, are flung into the throne room, sit on the plate (the barred door far away
swings open) and trade: you are home at the door and your echo keeps the throne.

## What the sweeps caught this pass, and the fixes

- **134 Re-aimed: a plain route over.** A hyper from the ledge, a second hyper off the corner of the exit ledge,
  and a jump from the top of the portal pillar crossed without the pair. The pillar is now a full wall from roof to
  thorns with the orange slot on its far face, so the only way to the right half is through the pair. The hunt now
  includes grabs and climbs.
- **135 Wake Behind: "along the top and back" succeeded 2 of 6.** Both "successes" were the intended loop: the
  stone sits over the far shaft, so walking on to touch it drops you down the shaft and round. The room was right,
  the family was mislabelled. It now stops short of the shaft (or jumps back from it) and turns round, and a new
  hunt that rejects any route that has been down both shafts (i.e. round the ring) finds no way to the door.
- **138 Room Above: up without the moth.** Two skips. (1) Hop into the 3-wide thorn shaft on a jump and a dash,
  fall back beside the shade (the shaft is wide enough to step 6 px aside), run back and climb out by the old left
  shaft. (2) After a redesign, a foothold where the drop shaft met the passage let a jump and a dash reach the
  rock lip of the drop. The room now starts in the upper passage: you drop into the lower passage down a thorn-walled
  shaft that cannot be climbed (its thorns run to the passage floor, the passage is two tiles deeper than a jump and
  a dash), so running back gets you nowhere and the only way up is the moth. The upper passage is four tiles tall so
  the jump over the drop at the end is an ordinary jump.
- **139 The Throne: "trade back at once, whatever the door shows" succeeded 2 of 16.** In the old room the far
  door showed the hall half the time, so a blind trade worked whenever it happened to be right — the question
  could be answered by luck, and the room was far easier than a summit. Redesigned (below).

## 139, redesigned

The old room: echo by the floor door, climb a dead-end shaft to a stone, trade back, step in when the door shows the
hall. The new room keeps the idea (the echo waits where you can't) and makes timing a real question:

- The far door shows the throne for 30 frames in every 90, so luck rarely helps.
- Walking straight to the edge and dropping lands a few frames after the throne window closes; waiting at the edge for
  the next one takes longer than the shade allows (the family of 66 edge waits all fail). The answer is to wait
  *before your first move* (the shade only rises when you move), 56–85 frames at the start, or to creep.
- The throne room is sealed. You cannot come back from it except by trading, and the barred door is held by the
  throne plate, so the echo must be left on the ledge before the drop (in the pit or in the throne room fails).
- Hurrying (a dash to catch the first window) was checked and does not reach it.

Difficulty: about Part VI's *Everything Before* in reading (three things to see before moving) and a notch below it
in execution (one timed step, one steered drop onto a two-tile door, one trade on a plate).

## The verifier

`node scripts/verify-precision-part-132.mjs`: 36 checks (8 routes, 17 wrong-answer families, 11 adversarial
searches). The new searches are kept small because geometry already rules the skips out: 134's right half is behind a
roof-to-floor wall, 139's throne room is sealed, 138's drop is thorned to the floor. 138's search runs at the size
that found the old skip (beam 100, depth 50). About 3 minutes on a quiet machine; much longer while nine builders
share it.

## Dropped along the way

- **138 with a one-tile thorn shaft** (so a hop and fall must meet the shade head-on): it closed the excursion
  skip, but entering an 8 px shaft between thorns needed pixel-exact placement. Dropped for the one-way drop.
- **139 with the fling carried through the trade** (133's idea with a portal instead of a spring): a normal jump
  carried to an echo left at the top of a jump and dash reached nearly as high as the fling, so the fling was not
  needed. Dropped for the throne-room design.

## Open

- 139's creep (stop, step, stop) is a legitimate way to wait with the shade behind you; it is not in the tape but
  nothing forbids it.
