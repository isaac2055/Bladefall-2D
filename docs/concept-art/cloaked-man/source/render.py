"""Render every design card and the four phase sheets into the directory given (default: out/)."""
import sys
import phase1 as K, phase2 as Q, phase3 as T, compose as C

out = sys.argv[1] if len(sys.argv) > 1 else 'out'
only = sys.argv[2:] or ['1', '2', '3', '4']
P3 = (256, 150, 136, 14)

if '1' in only:
    C.sheet([
        C.card(lambda c, gy: K.p1_penitent(c, gy, cx=64), 'PHASE 1 · A — The Penitent',
               'Head bowed, gloved hands clasped; a chain from each wrist, pooled at his feet.', f'{out}/p1-a-penitent.png'),
        C.card(lambda c, gy: K.p1_keeper(c, gy, cx=64), 'PHASE 1 · B — The Keeper',
               'A shoulder mantle; one arm up, the chain whipped in a loop over his head.', f'{out}/p1-b-keeper.png'),
        C.card(lambda c, gy: K.p1_drifter(c, gy, cx=64), 'PHASE 1 · C — The Drifter',
               'Hunched, the hood hanging forward; chains wrapped across him; a broken shackle.', f'{out}/p1-c-drifter.png'),
    ], 'THE CLOAKED MAN — PHASE 1', f'{out}/phase-1-sheet.png')

if '2' in only:
    S2 = (128, 80, 72, 10)
    C.sheet([
        C.card(Q.p2_gale, 'PHASE 2 · A — The Gale',
               'Arms level, the sleeves blown out like wings; the cloak split apart below him.', f'{out}/p2-a-gale.png', scene_size=S2),
        C.card(Q.p2_ascendant, 'PHASE 2 · B — The Ascendant',
               'Arms raised, the sleeves hanging from them like banners; chain shards orbit.', f'{out}/p2-b-ascendant.png', scene_size=S2),
        C.card(Q.p2_tempest, 'PHASE 2 · C — The Tempest',
               'Lunging through the air, one bone finger pointing; the cloak and chain stream back.', f'{out}/p2-c-tempest.png', scene_size=S2),
    ], 'THE CLOAKED MAN — PHASE 2', f'{out}/phase-2-sheet.png')

if '3' in only:
    C.sheet([
        C.card(T.p3_crouch, 'PHASE 3 · A — The Crouch', "At rest: legs arched high like a spider's, jaw shut, blank eyes on you.",
               f'{out}/p3-a-crouch.png', scene_size=P3, scene_scale=4, focus=(78, 76, 132, 136), close_note='close-up of the skull'),
        C.card2(T.p3_windup, T.p3_lunge, 'PHASE 3 · B — The Lunge',
                'It wrings its legs round its own body like a spring, then throws itself at you, hands first.',
                ('1. the wind-up', '2. the lunge'), f'{out}/p3-b-lunge.png', P3, 3),
        C.card(T.p3_unhinged, 'PHASE 3 · C — The Unhinged', 'Reared up, the jaw dropped open, far too long: a mouth down to the floor.',
               f'{out}/p3-c-unhinged.png', scene_size=P3, scene_scale=4, focus=(80, 34, 146, 136), close_note='close-up of the skull'),
    ], 'THE CLOAKED MAN — PHASE 3', f'{out}/phase-3-sheet.png')

if '4' in only:
    try:
        import phase4 as F
        F.render(out)
    except ImportError:
        pass
print('rendered', only)
