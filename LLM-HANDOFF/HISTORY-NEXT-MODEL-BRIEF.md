# Brief for a fresh model session — White Court WIP, 2026-09-15

Read `../docs/charters/09-frost-sorcerer/IMPLEMENTATION-STATUS.md` and
`ACCEPTANCE-AUDIT.md` for current White Court work. Stage8 is now custom: refuge,
workers/wheel task, aqueduct, real thaw water, Glassworks stolen-cold bridge,
gallery recollection/overlook and a three-ward Sorcerer with protected Attunement.

The current continuous bot route wins all three wards with a Rusty Sword and
walks to the usable Emberdeep door in5361frames, without intermediate resets or
health/progress grants. Full inputs and wounds: `evidence/continuous-boss.json`.
The initial capability prefix is a fixture; the asynchronous exit crossing is
verified separately using normal keyboard input. Muted/reduced replay also wins.

First engagement waits for both characters onscreen while retaining pursuit.
Cast silhouettes differ; local frost cycles1s warning/2s ice/3s dry. The overlook,
high chest and nine actual attack/phase captures have been inspected. Earlier
continuous failures and older isolated fight timings are historical, not current
results. There are28 focused checks; full regression passes541/541. Generic bot refresh fails at segment4/x10386 after30,000 expansions/303.7s
with no mechanism interactions or runtime errors; receipt is retained. The final visual-only frost cap passed replay/capture and baseline
parity afterward.

Source version/cache are7.99.0/179; the93-asset mirror is rebuilt. No deployment
is authorized. Close frost/refuge/Glassworks views are reviewed; the frost cap now remains
visible above its portal slate. Remaining work includes final receipts/charter/
handoff/version update and owner judgment of pacing and
legibility. Do not report White Court complete or human-playtest-approved.

Read README, current state, and `12-RECALL-WORK-ORDER.md`. Historical pre-White-Court context follows. Runs 1–3 are implemented
locally: source **7.98.0**, cache **bladefall-v178**, rebuilt mirror, 93-asset
release parity, full suite 513/513, eight directional shortcut checks. See `10-HANDOFF-VERIFICATION.md` for the full-suite
receipt. These changes are uncommitted; GitHub main remains the previous release.
No deployment was authorized. This Desktop folder remains iCloud-synced; check
for evicted placeholders if reads hang instead of retrying indefinitely.

Bladefall is a compact, interconnected, single-player action-adventure with
portals as its signature. The knight's unnamed-on-screen Datura delirium is
revealed through clocks, flowers, military correspondences, people and physical
evidence. Direct completion ends in death; Gilded Vault/Deep Line leads to the
ambiguous rusty-axe rescue and “He who saved us has awoken.” Preserve the sixteen
regions, constitutional ability/key order, named rewards, whole Blood, one Gift,
bounded Echoes and cosmetic-only appearances. Solo Base precedes co-op and NG+.

The owner considers start through Warden complete in substance; later polish is
welcome when requested. Do not reopen Marksman balance or duplicate its already
present projectile-redirection teaching. Keep Ruined Keep's two-weight Belfry,
Wall Jump → Archive → Keep Key ordering and westward return.

Warden phase three: three returned rushes; clear the pair after each; remove one
lure platform after each of the first two; keep pillars/rotors moving. Third
crash immobilizes him, leaves one health and starts repeated player-targeted
AOEs until a final weapon strike. Sentence damage is one Blood, no checkpoint
teleport. No numeric crash labels. Whispering Woods exploration, Element combat.

Frostfell is now authored, not the old next-to-build shell: 15,100 units, Nim's
three persistent braziers/Forge Seal, portal-fire thermal works, protected Double
Jump, galleries/recollection, and a 20-landing ice finale. Up activates the summit
Muster Engine: cinematic bell strike, darker atmosphere, ClockWork, 11 new foes,
one-time 55% HP upgrade, two-Blood hulks. Run 1 now applies the ordinary-enemy baseline across the world; Frostfell keeps
its own eleven actors and hulks.
Refuge/court/summit cycle after summit use; fresh Up each time. Both Warden mine
entrances use Up, safe arrival `(330, 0)`, no held-Left bounce. Latest changes
received positive owner feedback. White Court is not redesigned.

Run 1 expands recall reinforcements to 14 Warden / 12 Outskirts / 13 Woods /
15 Causeway actors. Gaolers pull with a warned lash; outriders charge a locked
direction; canopy wings dive at a locked target; chain marshals advance with
linesman cover. Large gaolers/marshals deal two Blood. Ordinary campaign enemies
get one ×1.55 max-health / ×1.25 raw-damage boost, minimum 480 notice. Raw damage
still maps to ordinary one-Blood wounds. These use the proposed tuning defaults.
First recalled loads re-garrison dead ordinary enemies once; subsequent deaths
use normal persistence/rest. No boss/unique revival, progress reset or stacking.
Preserve original roster indices for old-save entity identity.

Run 2 is implemented: full-simulation replay gates, pristine repeated bootstraps,
input artifacts with `--replay`, crystal-refill/flight/pickup actions and linked or
independent floor-pair setup. Seven bot tests and the full 510 tests pass. The
recalled Causeway now reaches the Brute threshold. The full eight-stage sweep
still fails five later routes; see `12-RECALL-WORK-ORDER.md` for exact segments.
Don't confuse those failures with proven softlocks, scoped portal/flight successes
with full levels, or boss thresholds with victory. Fixtures remain per-stage,
not a continuous saved campaign. Run 2 itself changed scripts/tests only.

Run 3 adds one reserve per return region (two fragments + two Forge Seals total),
permanent physical shortcuts, recalled resident clues and focused persistence/
movement proofs. All four shortcuts pass both directions in geometry fixtures.
White Court is design only: `docs/charters/09-frost-sorcerer/DESIGN-PLAN.md`.
Implementing that plan needs the next instruction. Bram and formerly inert Gifts are fixed;
five secondary Echo hooks still await their chapters. TAS remains `?tas=1`,
`window.__BF.tas`; see `TESTING.md`. Baseline Outskirts (350,0), run 200,
jump 480, gravity 1400. Solo Base precedes co-op/NG+; do not reopen accepted
boss designs or deploy without instruction.
