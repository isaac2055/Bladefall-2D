# The Cloaked Man: concept designs

Example designs for a four-phase boss idea. Three designs per phase, drawn in the Fable v4 respec style: the
renderer's half-resolution pixel blocks, the lit rim on the top and left of each shape, the dark far side, and
additive glows. The knight stands beside each one at in-game scale.

These are examples only and are not in the game. Nothing under `public/` was touched.

## The brief
1. **Phase 1:** a fully cloaked man in a purple cloak. Shiny chains round his wrists, gloved hands. No eyes;
   only a faded mouth.
2. **Phase 2:** the cloak's sleeves flare out as if the wind were blowing the sides apart. The cloak is
   shinier. He hovers most of the time, and his hands are skeleton hands.
3. **Phase 3:** a spider-like skeleton about 5x the player's size. A massive skull with blank eyes and an odd
   shine. It contorts its legs around itself to lunge. Its fingers are long and skinny. The jaw is usually
   shut, and very long when it opens.
4. **Phase 4:** an overarching creature so large it has to be a background that interacts with the arena.
   Like Phase 3.

## The designs
| Phase | A | B | C |
|---|---|---|---|
| 1 | **The Penitent**: head bowed, gloves clasped, a chain from each wrist pooled at his feet | **The Keeper**: a shoulder mantle; one arm up, the chain whipped in a loop overhead | **The Drifter**: hunched, the hood hanging forward, chains wrapped across him, a broken shackle |
| 2 | **The Gale**: arms level, sleeves blown out like wings, the cloak split below | **The Ascendant**: arms raised, sleeves hanging from them like banners, chain shards orbiting | **The Tempest**: lunging through the air, one bone finger pointing, cloak and chain streaming back |
| 3 | **The Crouch**: at rest, legs arched high like a spider's, jaw shut | **The Lunge**: legs wrung round its own body (the wind-up), then thrown at you hands first | **The Unhinged**: reared up, the jaw dropped open down to the floor |
| 4 | **The Horizon**: rises behind the arena rim; its fingers lie across the floor | **The Cradle**: the arena is its palm; the fingers are the wall and the thumb is a ramp | **The Maw**: it fills the sky; you fight inside its open mouth, on its lower teeth |

Threads that run through all four phases:
- The purple cloak survives as a rag on the Phase 3 ribcage.
- The Phase 1 chains break in Phase 2 and still hang from the Phase 3 creature.
- A violet ember glows inside the ribcage.

**Revision, 2026-09-26:** Phase 1 was made slimmer, at the owner's request, to match his body in Phase 2. It now uses the same
tapered, shaded cloth: narrow shoulders widening to a torn hem, and a narrower, rounded hood (`source/phase1.py`;
the first version is `source/cloaked.py`). The fight in the game draws this version: Battle 42, stage 43,
`public/bladefall-cloaked-man.js`.

## Files
- `phase-N-sheet.png`: one sheet per phase, with all three designs.
- `pN-x-name.png`: each design on its own card. For Phases 1 and 2, the card shows the in-game scene plus a
  close-up. For Phase 3 it shows the scene plus a close-up of the skull; the Lunge shows two beats instead.
  For Phase 4 it shows the whole arena plus notes on how it plays.
- `source/`: the Python (PIL and numpy) that draws them. It is a small port of the renderer's drawing
  vocabulary, `px.py`. To re-render every card into a folder, run `python3 render.py <out-dir>` from `source/`.
