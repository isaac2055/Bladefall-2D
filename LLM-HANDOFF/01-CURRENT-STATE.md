# Current state — 2026-09-13

## Production status

The owner considers the opening through the Warden fight complete in substance.
More enemies, platforming adjustments and presentation polish can follow; do not
restart those levels' design passes. Hollow Marksman remains an accepted anchor.
Frostfell now has a full authored settlement, thermal puzzle, Double Jump reward,
exposed ice finale, service network and active Muster Engine. The latest mine,
shortcut and Frostfell reinforcement changes received the owner's “Love it.”
That feedback is not a claim of exhaustive fresh-save or full-world acceptance.

Levels 9–16 still need their dedicated current-design passes, even where legacy
boss mechanics or custom geometry already exist. Frost Sorcerer / White Court is
the next untouched chapter. The Muster recall outside Frostfell is the current
work item: what exists is a handful of posts per region and no change to existing
enemies, which the owner reviewed on 2026-09-13 as not noticeable. The intent and
plan are in `12-RECALL-WORK-ORDER.md`.

## Source identity and verification

- Canonical runtime: `public/index.html`, version `7.96.0`.
- Offline cache: `public/sw.js`, `bladefall-v176`.
- Both identifiers were bumped on 2026-09-11 at the release boundary. `sw.js` now
  also caches `bladefall-harness.js`, which earlier builds never shipped.
- Latest retained Frostfell validator receipt: **15/15 checks true**, `pass: true`,
  no runtime errors. Includes the settlement, finale, persistence, Muster and
  normal-keyboard mine crossings. See [verification](10-HANDOFF-VERIFICATION.md).
- Latest full run: **`npm test` 500 passed, 0 failed**; `npm run release:check` ok,
  **93** assets checked (the manifest is parsed from `build-deploy.sh`, so it cannot
  drift again). Mirror rebuilt. No Netlify deployment was performed or authorized.
- Git tracks the whole tree. Pushed and merged on 2026-09-13: GitHub `main` is at
  the release commit plus handoff-only commits. A fresh clone rebuilds and passes
  `release:check`; re-verified after the 2026-09-13 iCloud rehydration (`git fsck`
  clean, 500/500, 93 assets).

## Current regional status

| Stages | Status |
| --- | --- |
| 1–5 | Authored opening; observed startup, return, follower and interaction repairs incorporated. Marksman balance protected. |
| 6 | Ruined Keep: two Belfry payloads, Wall Jump, Archive, Keep Key and westward return implemented. |
| 7 | Warden: Turning Cells and opposed-cross boss complete in substance; latest three-crash/final-strike rules below. |
| 8 | Frostfell: authored 15,100-unit level; its Muster Engine is the single source of the world-wide recall. |
| 1–3, 6 | After Frostfell's strike: 3–5 recall posts each, no buff to existing enemies, first Warden post 10,900 units from the mine arrival. Rejected as insufficient on 2026-09-13; see `12-RECALL-WORK-ORDER.md`. |
| 9–16 | Existing foundations/legacy content; full current level passes remain. |

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
and music from Drifting Memories to ClockWork. Eleven authored reinforcements
and a one-time 55% max-health increase apply **only in Frostfell** today; the
owner wants the same baseline world-wide (`12-RECALL-WORK-ORDER.md`). Larger hulks
cost two Blood on contact. No boss revival, duplicate roster or stacking health.

Read [recent changes](11-RECENT-CHANGES-AND-PLANS.md) for opening repairs, exact
Frostfell setup, harness status and proposal boundaries; read the
[Frostfell charter](../docs/charters/08-frostfell/README.md) for room details.

## Outstanding limitations

- Bram's escort now concludes at the root wall with an authored payoff; Gilded
  Instinct and the three formerly inert Gifts are implemented. Five secondary
  Echo hooks remain unread (see `KNOWN_BUGS.md`).
- The traversal bot (`npm run bot`) completes Outskirts, Black Woods and the
  Causeway and reports the exact failed segment elsewhere; every later level
  stops at a verb it lacks, portal placement first. It is not a campaign bot.
- The White Court aqueduct's Frostfell half is validated; the far half waits for
  that level's pass.
- The recall outside Frostfell does not yet deliver more, larger, smarter or
  tougher enemies; `12-RECALL-WORK-ORDER.md` is the spec. Its rewards, caches and
  shortcuts follow. Co-op and NG+ follow solo Base.

## Working-copy and release caveats

Git tracks the whole authoritative tree and GitHub `main` matches it, so a fresh
clone is a complete working copy; the lean-copy generator remains the way to hand
over a runnable folder without the historical evidence. The owner's own copy lives
in iCloud-synced `~/Desktop`, which can evict files to placeholders that hang every
read; see the Git section of [essential files](06-ESSENTIAL-FILES.md) for the
one-line check. Preserve an independent archive before major work. Old size/copy
measurements are dated in [working-copy instructions](07-WORKING-COPY.md).

Edit `public/`, never the generated `netlify-deploy/`. At a release boundary,
bump version/cache as appropriate, rebuild and run parity. Preserve save and
leaderboard keys. Do not deploy without explicit owner instruction. Validate
critical traversal with real inputs and record where setup used debug helpers.
