# 7.308 — superroom redesign goal: COMPLETE (see 01-CURRENT-STATE 7.308.0 and docs/room-bank/FEEDBACK-7.308.md)

The complete user objective remains active: revise B72–B76, tighten F71, revise F73–F76, bank approved F64/F69, set approved F77 to 3/5 mid-Fractured, then integrate into campaign AND Room Bank and deploy web/APK. Do not mark complete until all requested rooms and publication are verified. Current public deployment remains 7.307.1 / 6102d3f.

## Evidence and diagnosis

Read the current clean repository and user screenshot. Screenshot is F73’s isolated stamina diamonds alongside an iron column; replace those with real supports/traversal. B74 does not threaten the player for its first 1200 frames, then fires only every 300. B73/F74 have 560-frame idle waits in their routes. B75/F76 use an invisible fresh-hook serial/grace prerequisite for damage, a tiny remotely moved collar, a fixed off-camera projectile origin, and a crude single-head drawing. These are design failures, not merely difficulty values. King/Tyrant/Hydra need actual reinvention, not just faster attack numbers.

## Saved so far

- F64/F69 approvals recorded; F77 approved at3/5 with mid-Fractured placement. No layout changes to these approved rooms.
- B72: thermal timings70stone/80molten/70glass with staggered offsets; permanent three-tile resting ends. Recorded route has three necessary pauses,1162frames0deaths. Old uninterrupted descent dies. +5frames first pause passes. Lift stops two tiles lower and overhead grate removed to eliminate its surprise headroom trap. Saved route-proven/revised, not integrated yet.
- F71: cargo rests reduced to three-tile fault footholds, overhead teeth on crossings, return ice lips fourtiles plus overhead teeth.1049frames0deaths; firstjump12/16frames bothpass, overheld middlefeatherjumpfails. Existing keep-cargo bypass check retained. Saved route-proven/revised, not integrated yet.
- Focused checker passes B72/F71. Human difficulty still needs review; no claim all requested revisions done.

## Still required

B73/F74: reinvent portal boss around active positional/projectile decisions with immediate visible feedback; eliminate long idle portal alignment. B74/F75: reinvent King into an actual threatening encounter with clear relationship between seals and attack opportunities. B75/F76: redesign native Hydra silhouette, readable physical jaw/weak point, telegraph and damage feedback; replace hidden hook prerequisite and confusing layouts in these two rooms. Preserve legacy encounters through opt-in configuration. B76: replace passive tide ride/lantern walk with a linked active tide/cargo/grapple puzzle. F73: remove refill string, build real return footholds, improve active pour decisions and closure.

## Work location and preservation

Original versions of all13feedback rooms saved under ignored scripts/climb/.cache/feedback-7.308/. User asks no agents on current policy unless explicitly requested; work solo. Root temporary author scripts /tmp/revise-b72.mjs, /tmp/revise-f71.mjs, /tmp/save-7308-progress.mjs reference former cache path; update to new ignored path if reused. Do not accidentally restore the original rooms.

Before publication sync catalog banked/revised lists; build Room Bank; integrate exact changed worlds (B72W10,B73W13,B74W14,B75W16,B76W17,F71W28,F73W31,F74W33,F75W34,F76W36). Preserve37? Here30unchanged worlds versus7.307.1, generate correct baseline from gitHEAD before importing. Focus checks on redesigned routes/changed joins, preserve personal checkpoints/co-op completion. Browser scripts and incremental --update world import available. Update version/cache, build signed APK, commit/push main and confirm Cloudflare/live hashes plus releaseAPK. AGENTS standing auth; never Netlify.

## Hydra prototype progress (still unfinished)

Existing rbr-cliffs.js and rbr-cliffs-view.js now have opt-in chainHydra.hunt mode: visible tell → committed bite → exposed jaw → normal blade hit, with optional hunt.spines physical footholds after damage. No hidden hook serial. Hunt notice/tell/bite/open/reach configurable; legacy branch unchanged and its original B75/F76 routes passed before B75 source replacement. Tests scripts/room-bank/check-hydra-jaw-7.308.mjs pass actual movement/attack inputs for exposure, damage without grapple, blocked-hit feedback, bite death and physicalspine. This runtime is not deployed.

B75 is now an individually saved NEW arena DRAFT, Leave Their Bones Behind. Three heads at(23,29),(47,23),(73,17); broken spines make ascentbridges; downexit is gatedfloor4–8 atrow33 throughbottom. Newmapandinputroute saved by scripts/room-bank/author-hydra-jaw-7.308.mjs (destructive authorcommand; do not rerun over later edits casually). Prototype threeheadroute passes0deaths but design NOT considered complete: current second/third engagements repeat first too closely, needs differentiated aerial approach (suggest suspended secondheadc52r20 reached by existing ring40r17, requiring crossing its bite while aboveplatform). Do not weaken goal to accepting this easy repeated prototype just because it passes. Need actual browser render inspection of new hydra and final route proof. F76 arena still original; use improvedopt-in mode only after redesign.

/tmp/step-jaw.mjs replays JSONargument tape for B75, writes /tmp/jaw-state.json with tape+trace, prints compactplayer/boss/events. All drafting checkpoints remain local; no bank build, campaign import, APK or deployment of7.308 yet. Whole objective remains active.


## Latest saved checkpoint — supersedes the Hydra prototype notes above

B75 and F76 are now finished local revisions, both route-proven and browser-proven (814/1196 frames, zero deaths). B75 Leave Their Bones Behind uses low jumping down-cut, suspended grapple approach/side-cut, then a longer faster bite. Two defeated heads become physical return bridges. F76 Cross the Bones You Made uses grapple down-cut, outward void dash, passing below a long bite then up-cut, upper bone return over the void, thorn timing and a final mast ascent/up-cut. No hidden fresh-grapple prerequisite. Final records are authoritative; the stale prototype author generator was removed. Runtime hunt supports per-stage attack settings and bone spines. Render now has long curved necks clipped behind terrain, inspected in the actual browser.

F73 now route-proven and browser-proven,1743frames0deaths: removed ALL floating stamina diamonds, added physical one-way scaffold rests beside first and middle castings, widened the central return landing. New opt-in colossus.coldPriority prioritizes chilled unrefused moulds during movement; legacy encounters retain original schedule. Two anvil launches chill successively higher moulds; final strike needs dash back clear of pour. Return uses cast pillars and scaffold landings. Canonical tape saved in record. An extra10frames firstwait variant did NOT complete because later prerecorded climbing began before the shifted pour; do not claim that variation passes. Source has no positive variant saved for this room.

Room Bank rebuilt with127playable records. Browser checks B75,F76,F73 pass; report docs/room-bank/superrooms-7.308-browser.json and screenshots ignored scripts/climb/.cache/room-bank/7.308. No campaign imports or deployment yet. Remaining requested redesigns: B73/F74 Tyrant, B74/F75 King, B76 tide/cargo room; then all integration/release work above. B72/F71 and approvedF64/F69/F77 still saved from previous checkpoint. Entire objective remains ACTIVE and incomplete.

/tmp/f73-route.mjs is an incremental input harness; /tmp/f73-prefix.json holds the successful fullroute (also saved in bank-f73.json). /tmp/f73-state.json holds its trace. Do not run old prototype/finalizer scripts over authoritative records.

## Claude checkpoint (2026-10-10) — supersedes "still required" for B73/B74/F74/F75; NOT integrated, NOT deployed

Work-in-progress files (author scripts, tapes, search/trace tools) are in ignored `scripts/climb/.cache/feedback-7.308/claude-wip/`. The tools import `scripts/pcore-tape.mjs` by absolute path. Runtime edits are uncommitted in the working tree:
- `bladefall-pcore-dev-rbr-king.js` / `-view.js`: new opt-in `court` mode. The King throws aimed bolts from the start. An unaimed parry sends his bolt straight home, and he kneels. His guard ring can't be crossed (crossing makes him slam); only an echo trade puts you inside. A wound shatters the echo and he leaps to the next throne. Per throne: `parry:false`, `winded`. `aim:'echo'` targets the echo (Fractured). Legacy crown/duel untouched.
- `bladefall-pcore-dev-rbr-tyrant.js` / `-view.js`: new opt-in `hunt` (aimed bolts every N frames, with a tell line), `home:true` (a bolt out of a door homes to him through stone; his whole body is the ward) and `perches` (he folds or unfolds between hits; per-perch overrides, including volley). The legacy old B73/F74 tapes still pass.

Route-proven in the node harness, zero deaths, not yet written into bank records:
- **B74 "The King Holds Court":** b74.mjs + b74.tape, 1000 frames.
- **F75 "He Looks Where You Left Yourself":** f75.mjs + f75.tape, 943 frames; trade windows 11–13 frames.
- **B73 "His Own Answer Comes Home":** b73.mjs + b73.tape, 832 frames.

B74, F75 and B73 still need human review.

**F74 "Be There When He Throws":** B73 reflected, with every shadow made of fault stone. Phases 1–2 are proven (f74.tape is the 415-frame prefix). Phase 3 (the timed ride from the fin door onto the fault landing) works, but its windows are only about 6 frames. Widen them before saving, e.g. fuse 40, a slower throw, or relocating the fault.

Remaining:
1. Finish F74.
2. Redesign B76 (passive tide/lantern; make it an active tide puzzle).
3. Write the records with `node mkinject.js`-style room+tape into `scripts/room-bank/{base,fractured}/bank-*.json`, keeping their bank metadata (requiredEvents need updating: court-*, tyrant-hit, portal-pass, echo-*). Then build the room bank and run check.mjs.
4. Run `scripts/climb/import-bank.mjs --update=N` for worlds 10, 13, 14, 16, 17, 28, 31, 33, 34, 36.
5. Version/cache bump, APK, then commit and push main (standing auth).
