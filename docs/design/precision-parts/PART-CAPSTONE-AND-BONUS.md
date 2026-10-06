# Level 200 (capstone) and the bonus demonstration sets: built (7.255.0)

The 15:04 and evening scheduled runs (Claude session 46f4f1e9) built level 200 and three bonus sets, while the 13:04 run
(session c2900fd8) built 75–199. Each set has its own design doc:

| What | File | Checker (2026-09-30, run in parallel) | Doc |
|---|---|---|---|
| Level 200 · The Summit Road (6 rooms, one checkpoint each) | `part-200-capstone.js` | 23 passed, 0 failed | PART-200.md |
| Bonus · Oren's Relay, R1–R6 | `part-901-bonus-relay.js` | 25 passed, 0 failed | BONUS-RELAY.md |
| Bonus · Void Stone, V1–V6 (new device) | `part-902-bonus-void.js` | 43 passed, 0 failed (includes the device's rule fixtures) | BONUS-VOID.md |
| Bonus · Crossings, C1–C6 | `part-903-bonus-crossings.js` | 24 passed, 0 failed | BONUS-CROSSINGS.md |

The checkers are `scripts/verify-precision-part-{200,901,902,903}.mjs`.

**Other checks:**
- `pcore-validate`: all rooms well-formed. `verify-precision-devices`: 50 passed, 0 failed.
- `pcore-sync-page.mjs 7.255.0` was run.
- In headless Chrome on the real `precision.html`:
  - The menu shows 200 after 199, then the three bonus headings with labels R1–R6, V1–V6 and C1–C6. Level 150 lines up.
  - All 24 new rooms play their intended tape to the exit with no deaths and no page errors.
- No human playtest yet.

## Device changes
- **New:** `bladefall-pcore-dev-void.js` and `-view.js`, the void stone (glyph `V`). A dash into it travels straight through it. Coming out gives the dash back and keeps the speed. Anything solid inside is fatal.
- **Relay** (`bladefall-pcore-dev-relay.js`) had three bug fixes:
  - Oren no longer freezes in mid-air when told to hold. He plants where he first touches ground.
  - He finishes a jump or fall while waiting, instead of hanging in the air.
  - He no longer walks through a held door that has shut.

## Engine issues found and designed around (not fixed: they are in core or portal files)
- **A free jump after a floor portal.** Touching rock beside the door as you enter gives 6 frames of mid-air jump after you come out.
  - Fix: zero `jumpGrace` on a portal pass.
  - 195 and 199b may have this skip.
- **A wall slide can undo a portal fling.** Holding toward a wall just before a floor door restores the old wall speed after the fling.
  - Fix: clear `retainTimer` on a portal pass.
- **The light ignores some device objects on the first frame.** At room start, the light is traced before footholds, carts, decks, slabs, moulds and jailer bodies exist, so a tally stone hidden behind one is lit on frame 0.
- **The route search shares room tiles between branches.** Frozen water leaks between search branches, so a search can report a skip that isn't real.
- **A climb-jump off a spent foothold's bottom corner** does not spend it.
- **Partial-tape screenshots replay from the wrong moment.** `pcore-shot.mjs @frames` starts the tape during the room wipe and then keeps running in real time.
