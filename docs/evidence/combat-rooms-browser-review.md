# Combat Rooms browser review — 2026-09-29

Reviewed the local app at `http://localhost:8371` using the in-app Browser.

- Title → Precision Courses shows **Combat Rooms**, and the button opens the new chapter.
- Inspected all ten rendered layouts and their corresponding pause-menu names/questions. Checked the fixed room view at 900×640; the entire room remains visible.
- The pause menu exposes all ten room selectors and each recorded route.
- First-room replay reaches room 2. Final-room replay reaches the Combat Rooms completion card with zero deaths. Full input-route coverage for all ten is supplied by the simulation verifier, not inferred from these two browser replays.
- Movement/parry input followed by R returns to the entrance; Escape opens the pause menu. The entrance waits for a movement or action, with a visible “Look first” cue.
- Controls lists keyboard and standard-controller mappings, including F/O and RT for parry. No physical controller was connected for this review.
- Chapter menu includes the Combat Rooms card and its ten-room count; controls remain reachable in the scrollable chapter menu.
- No browser error logs were reported during these checks.
- Returned the preview to the first room and restored the browser's normal viewport settings.

Automated verification: **36 combat checks** and **114 precision-core checks** pass. The local deployment folder was built; precision-page script URLs match the offline cache, and all twelve entry/runtime files checked match their source copies. No deployment was performed.

This is a functionality and presentation review, not an independent human assessment of combat feel or puzzle difficulty. The ten route recordings are deterministic, death-free examples; they do not prove every alternate route or optional-shard route.
