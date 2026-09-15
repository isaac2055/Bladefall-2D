# Current state — 2026-09-14

## Production status

The owner considers the opening through the Warden fight complete in substance.
More enemies, platforming adjustments and presentation polish can follow; do not
restart those levels' design passes. Hollow Marksman remains an accepted anchor.
Frostfell now has a full authored settlement, thermal puzzle, Double Jump reward,
exposed ice finale, service network and active Muster Engine. The latest mine,
shortcut and Frostfell reinforcement changes received the owner's “Love it.”
That feedback is not a claim of exhaustive fresh-save or full-world acceptance.

White Court (region9) is implemented locally and awaiting owner playtesting.
Its continuous authored route wins the three-ward Sorcerer and reaches the usable
Emberdeep exit in5361frames. Other later regions still need dedicated design passes. Run 1 of the three
follow-up runs implements the expanded recall; run 2 adds verified bot reliability
and traversal verbs. Run 3 implements return payoff and documents White Court planning. See `12-RECALL-WORK-ORDER.md`.

See `../docs/charters/09-frost-sorcerer/ACCEPTANCE-AUDIT.md` for current evidence
and the remaining human pacing/legibility gate. Automated success is not owner
acceptance; the generic bot still fails at the Glassworks gate.

## Source identity and verification

- Source `public/index.html`: **7.99.0**; `public/sw.js`: **bladefall-v179**.
- Mirror rebuilt; `release:check` passes all **93** assets. No deployment.
- Frostfell receipt retains **15/15** checks true and no runtime errors.
- Full suite **513/513**, recall/reserve focused checks **12/12**, and all eight
  directional shortcut checks pass. See `10-HANDOFF-VERIFICATION.md` for scope.
- Git is a complete source repository; run 1–3 changes are local and uncommitted,
  so GitHub main still reflects 7.96.0. The Desktop copy remains iCloud-synced.

## Current regional status

| Stages | Status |
| --- | --- |
| 1–5 | Authored opening; observed startup, return, follower and interaction repairs incorporated. Marksman balance protected. |
| 6 | Ruined Keep: two Belfry payloads, Wall Jump, Archive, Keep Key and westward return implemented. |
| 7 | Warden: Turning Cells and opposed-cross boss complete in substance; latest three-crash/final-strike rules below. |
| 8 | Frostfell: authored 15,100-unit level; its Muster Engine is the single source of the world-wide recall. |
| 1–3, 7 | Expanded return rosters: Outskirts 12, Woods 13, Causeway 15, Warden 14; four regional roles and early encounters. |
| 9–16 | Existing foundations/legacy content; full current level passes remain. |

Four reserve caches add two vitality fragments, two Forge Seals and permanent
physical return routes. See `12-RECALL-WORK-ORDER.md` for coordinates and proof
boundaries. White Court has a design plan, not new gameplay.

## Latest behavior to preserve

Warden phase changes clear placed portals. Phase three requires three returned
rushes, each consuming the pair. Crashes one and two remove the two lure platforms
in order; moving pillars and rotors continue. Crash three leaves the boss fixed
in place at one health, casting a telegraphed AOE at the player's current position
at regular intervals. One final weapon hit kills him. Sentence AOEs cost one
Blood without checkpoint teleport; Test Mode remains immune. Feedback is visual,
not a `1/3` counter. Exploration is Whispering Woods; combat is Element.

Frostfell's mine uses **Up at both ends**, arriving at `(330, 0)`. Held Left cannot
bounce between levels. The service route becomes **refuge → court → summit →
refuge** after the summit passage is used, requiring fresh Up for every move.
Muster activation is a six-second bell/camera sequence; the strike changes mood
and music from Drifting Memories to ClockWork. Frostfell retains its eleven authored reinforcements. All ordinary campaign
enemies now receive one ×1.55 health / ×1.25 raw-damage boost and at least 480
notice. First recall loads re-garrison ordinary enemies once; bosses/unique
encounters remain cleared (`12-RECALL-WORK-ORDER.md`). Larger hulks
cost two Blood on contact. No boss revival, duplicate roster or stacking health.

Read [recent changes](11-RECENT-CHANGES-AND-PLANS.md) for opening repairs, exact
Frostfell setup, harness status and proposal boundaries; read the
[Frostfell charter](../docs/charters/08-frostfell/README.md) for room details.

## Outstanding limitations

- Bram's escort now concludes at the root wall with an authored payoff; Gilded
  Instinct and the three formerly inert Gifts are implemented. Five secondary
  Echo hooks remain unread (see `KNOWN_BUGS.md`).
- The traversal bot now requires full-state replay identity, stores replayable
  input artifacts, and can perform crystal refills, pickups/flight, linked portals
  and an independent floor-pair launch. The final sweep passes Outskirts/Woods
  exits and the Brute threshold; five later full-stage attempts still fail. The
  recalled Causeway now passes. See `12-RECALL-WORK-ORDER.md` for exact blocks.
  Seven bot tests and the full 510-test suite pass. This is not a campaign bot.
- The White Court aqueduct's Frostfell half is validated; the far half waits for
  that level's pass.
- The new recall has runtime/test evidence, but subjective balance remains for
  player review. Rewards, caches and shortcuts follow in run 3. Co-op and NG+
  follow solo Base.

## Working-copy and release caveats

Git tracks the whole authoritative tree; GitHub `main` is the previous release
until these local run 1/run 2 changes are committed and pushed. A fresh clone contains
the previous complete release; the lean-copy generator remains the way to hand
over a runnable folder without the historical evidence. The owner's own copy lives
in iCloud-synced `~/Desktop`, which can evict files to placeholders that hang every
read; see the Git section of [essential files](06-ESSENTIAL-FILES.md) for the
one-line check. Preserve an independent archive before major work. Old size/copy
measurements are dated in [working-copy instructions](07-WORKING-COPY.md).

Edit `public/`, never the generated `netlify-deploy/`. At a release boundary,
bump version/cache as appropriate, rebuild and run parity. Preserve save and
leaderboard keys. Do not deploy without explicit owner instruction. Validate
critical traversal with real inputs and record where setup used debug helpers.
