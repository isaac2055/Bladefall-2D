# Co-op shared world fixes — 7.229.0

Fixes guest Causeway hoist activation and shares authoritative door/circuit results, repair progress and session abilities. Session refreshes preserve earned abilities. Guest lever and projectile-device actions have one authoritative path; personal portals remain personal.

World snapshots now describe enemy creation/removal and boss state, instead of assuming matching local arrays forever. Unchanged obstacle rows are omitted between full refreshes, with a congestion check before constructing a snapshot. The Cloaked Man synchronizes its separate phase/health/hazard state and actor references; the guest does not independently run its phase controller.

Co-op Settings exposes Test Mode without the secret unlock. Guest action annotations no longer open dialogue on the host, and Escape closes conversations even after focus moves outside the panel.

Validation: paired real-browser checks across the current non-cut stage catalog; Causeway solved by the guest with 100 ms one-way simulated delay; enemy creation/removal; stale ability refresh; dialogue dismissal; test-mode visibility; Cloaked Man guest engagement, damage and phase change. Both precision courses replayed with staggered and simultaneous traversal. Local deployment mirror rebuilt. No public deployment or external PeerJS signaling/Internet playtest performed. Full playthroughs of every campaign puzzle and all four boss phases were not performed.
