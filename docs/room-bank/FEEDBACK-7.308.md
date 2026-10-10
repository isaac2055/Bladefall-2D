# Superroom feedback — 7.308

This release answers the B72–F77 notes. Every room listed here is integrated at its world's finale and available in **Extras → Room Bank → Superrooms**. Human difficulty, fun and suitability ratings are still to come.

## Approved

- F64 and F69 are banked; their layouts are unchanged.
- F77 is banked at 3/5 for the middle of the Fractured act.

## Reinvented

### B74 — The King Holds Court (World 14)

The King attacks from the first second. Parry his bolt with no direction held and it flies straight back; he drops to his knees. His guard ring cannot be crossed, even while he kneels. Only a trade with your echo puts you inside it, so the echo must already be in place. Each wound shatters your echo and sends him leaping to a new throne:

1. Pogo the pit anvil and leave the echo floating over his head. Parry from the stepping stone, trade in and cut down.
2. Land beside him on his high ledge, leave the echo and dash back to the perch. Parry, trade in and cut.
3. His last ward turns parries aside. Swing in, leave the echo inside his ring and trade out just as he slams. Trade back while he is winded and cut.

### F75 — He Looks Where You Left Yourself (World 34)

The Fractured King throws at your echo, not at you. Leave the echo inside his ring and get clear before he slams. Once his bolt is flying, trade into the echo and parry it home; you are already inside his ring, so cut.

- His second throne is reached by a cracking fault stair and a void dash; you leave the echo in mid-flight.
- His third is reached by the long void and a ring.
- The trade window is 11–13 frames after each throw.

### B73 — His Own Answer Comes Home (World 13)

The Void Tyrant hunts you with aimed bolts about once a second. Put your door on the side of a pale stone that faces him, then get behind it. His bolt goes in, the white door in the ceiling sends it home, and it wounds him. After each hit he folds into the void and reappears at a new perch, so you need a different shelter:

1. A hanging stone you duck under.
2. A high hanging stone you wait beneath.
3. A fin on the high stone. Drop through a door in the ledge, fall out of the ceiling and door the fin's far face. Then walk into that door to land behind the fin.

### F74 — Be There When He Throws (World 33)

B73 reflected, with one inversion: every shadow is cracked fault stone. He aims at where you stand at the instant he throws, so be behind your door at that moment. Run through his shadow as he throws, dart across the cracked ledge, and drop out of the ceiling into the fin's cracked shadow just in time.

### B76 — The Tide Lends Its Lift (World 17)

One tide cycle, and every phase of it has a job:

1. **Low water:** cross the bare reef by its posts and ring.
2. **Rising water:** each float lifts only when the sea reaches it. Jump and dash from float to float as they rise.
3. **High water:** touch the tally.
4. **Ebb:** dive into the undertow, slip under the two rocks and climb out onto the home shore before the thorns surface. The tally has opened your gate.

## Earlier in this batch (Codex)

B72, B75, F71, F73 and F76 were revised earlier in this batch, before the five rooms above:

- B72: rests between the heat sections.
- B75 and F76: a readable Hydra bite and jaw, with physical bone bridges.
- F71: tighter footholds.
- F73: real scaffolds in place of the refill string.

## Runtime (opt-in; every older room plays as before)

- **King `court`:** aimed bolts and the guard slam. An unaimed parry returns his bolt home. The ring can't be crossed while he kneels, but a trade gets you inside. He leaps between thrones. Per throne: `parry:false` and `winded`. `aim:'echo'` targets the echo.
- **Tyrant `hunt`, `home` and `perches`:** aimed bolts, a homing return through any door, and folding between perches, with per-perch overrides.
- **Tide `holdLow` / `holdHigh`:** separate low and high hold times.

## Evidence

- All 127 bank routes replay with zero deaths, and the new rooms each carry a bypass probe that must fail.
- The ten finales in this batch were checked in Chrome. Results are in `superrooms-7.308-browser.json`.
- The ten changed worlds were re-imported. All 88 physical joins pass in Chrome, and the structural audit passes (`feedback-7.308-audit.json`).
- The other 30 worlds are byte-identical to 7.307.1.
- These checks prove that each room can be completed. They don't prove every alternative route is blocked.

## 7.308.1 — doors no longer close behind you

An entrance seals only where that room's own route needs the wall: 31 rooms keep their seal and 302 rooms now stay open. In 46 doorways the thorns faced into the room inside the opening, so you could walk in but not back (B22's spiked west wall was one). Those thorns now open with the doorway and return only if it seals.
