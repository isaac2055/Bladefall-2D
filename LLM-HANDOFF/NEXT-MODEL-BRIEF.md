# Brief for a fresh model session — 2026-09-13

Read `LLM-HANDOFF/README.md`, current state, recent changes and the relevant
charter before editing. Source is `public/`; root `TESTING.md` and `KNOWN_BUGS.md`
are the test and defect authorities. Git tracks the whole tree and GitHub `main`
(`isaac2055/Bladefall-2D`) matches it since 2026-09-13. Version `7.96.0` / cache
`bladefall-v176`. `npm test` is 500/500 and `release:check` is green, re-verified
2026-09-13. Never deploy to Netlify without explicit owner instruction. The owner's
copy lives in iCloud-synced `~/Desktop`: if any command there hangs, check for
evicted placeholders first (`06-ESSENTIAL-FILES.md`, Git history) rather than retry.

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
one-time 55% HP upgrade, two-Blood hulks. The upgrade and hulks apply **only to
Frostfell** today; the owner wants that baseline world-wide.
Refuge/court/summit cycle after summit use; fresh Up each time. Both Warden mine
entrances use Up, safe arrival `(330, 0)`, no held-Left bounce. Latest changes
received positive owner feedback. White Court is not redesigned.

The recall outside Frostfell is the current work item: today it is three to five
posts per region (`MUSTER_ROSTERS`) and no change to existing enemies, which the
owner reviewed on 2026-09-13 as not noticeable. Read `12-RECALL-WORK-ORDER.md`
for the spec: one-time world-wide buff of the general enemies, a re-garrisoned
world, one unique enemy per region, evident on arrival. Keep it a surprise. `npm run bot` completes the first three levels from cold and reports
exact failures elsewhere; portal placement is its next verb. Future boss work
should offer active, recoverable setups and generous portal capture; never gate
mandatory routes on optional Echoes or require an ability its own boss awards.

TAS: `?tas=1`, `window.__BF.tas`, reset/input/read and named save/restore; see
`TESTING.md`. Baseline Outskirts `(350, 0)`, run 200, jump 480, gravity 1400.
Bram, Gilded Instinct and the inert Gifts are resolved; five secondary Echo hooks
stay unread by design until their chapters. Frost Sorcerer / White Court is the
next chapter to design.
