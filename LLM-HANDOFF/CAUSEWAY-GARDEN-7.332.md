# 7.332 — Causeway Core, extra saves and progressive Garden

## Player requests implemented

- During test camera inspection, double-click copies the hovered room/pixel/tile coordinates. A persistent copied message remains in the toolbar; clipboard denial falls back to legacy copy and then stable visible text. Normal gameplay double-click does nothing.
- Supplemental permanent saves: Trumpet c116/r11, Woods c108/r26 and c88/r11 (the platform tops are rows12,27, 12 in the user's screenshots). Trumpet now has four sections; Woods five. UI and feedback part validation support variable counts.
- Woods crumble bonus is 60 frames, for a total of 84. Supplemental saves do not reset live device clocks as you cross them; fresh respawns reset devices normally. All 12 sections across three Cores have clean fresh-reset route proofs. Existing save revisions map to their corresponding original checkpoints rather than losing earned progress.
- Garden reveals rows as worlds are reached. Its top column appears after a Fractured world unlock, not on a fresh save. Initial plant title is Trumpet Bulb; Woods subsequently reveals Black Woods Oak / Taproot. Bottom/Top headings omit campaign labels. Spoiler instructions and “never spent” text are removed; locked-skin five-click peeking is removed too.
- Completed and unlocked Cores are playable buttons. A legacy recorded Core clear also allows replay. The existing five-press full-map override reveals all plants and permits all implemented Cores, reversibly.

## Causeway Core: The Last Counterweight

Authoritative source: scripts/room-bank/fractured/98-bank-f98.json. One 160×100 room with three legs over shared structural ribs, two save points, three native counterweight lifts, two airborne tears, low brake housings, ten crumble contacts and a final aerial dash refill. Core 3 / world 103. Registered in Garden and Room Bank; awaiting human review, not marked banked merely because a native route passes.

The full route exits at frame 1258 with zero deaths. Native route evidence: three lift starts/stops, two tear entries/exits, 11 hypers, 12 ultras, two supers and one reverse hyper. These are evidence about the chosen route, not hidden prerequisites. Independent starts complete sections in 398/388/485 frames. 608 ordinary run/jump/single-airdash opening probes found no first-shelf landing without lift or advanced movement assistance. Three simple full-route probes fail. First-input perturbations ±1/±2 frames still land the first shelf; replaying all later inputs unchanged does not necessarily finish. Human readability, flow and difficulty remain unverified by live browser playtesting.

Authoring/reproduction tools:
- scripts/climb/author-causeway-core.mjs creates the geometry draft (overwrites the source; do not rerun over a finished source casually).
- scripts/climb/prove-causeway-core.mjs saves stage-by-stage native route progress.
- scripts/climb/refresh-core-checkpoint-proofs.mjs verifies independent starts; optional room numbers limit it.
- scripts/climb/causeway-core-check.mjs writes docs/room-bank/causeway-core-proof.json with honest finite probe outcomes.

## Co-op concept only

Read docs/design/COOP-SHARED-PUZZLES-DRAFT.md. It proposes counterweight exchange, two-pair portal relays, alternating brakes, shield/blade dependency, lift releases, split information, partner rescue and paired locks, with a first-course outline and recovery/networking requirements. No co-op gameplay implementation was made.

## Verification / release

Native whole routes and all 12 checkpoint restarts; exact requested anchors and Woods 84-frame crumble timer; saved-index migration; actual pointer/keyboard/clipboard and five-press full-map DOM checks; progressive Garden state tests; private feedback/recording regression checks; compiled Pages→Worker→SQLite API check; unchanged finale checks; generated bank 135 rooms (71 Base/64 Fractured). No browser automation, Netlify deployment or APK rebuild. Public release 7.332.0 uses cache v500. API validation expanded the allowed feedback part range to 32; existing score validation is unchanged. Private data and credentials remain outside Git.
