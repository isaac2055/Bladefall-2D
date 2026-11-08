# Complete Bladefall sampler implementation

User approved: worlds 1–3 normal + Fractured with all approved affixed rooms and continuous connections; Cores 101–103; persistent garden, animated Core rewards, opt-in carried shiny full-world challenges; automatic final time/deaths and local leaderboard (confirmed).

Requirements still to verify before completion:
- Consolidated editable rooms: normal 10/world; Fractured additions 9 Outskirts, 9 Woods, 10 Causeway. Keep previous bank rooms too. Exclude superseded cover and weight drafts.
- Preserve user's World 1 native edits. No Felix story/art imported.
- Continuous connections, individual normal checkpoints, correct final finish after additions.
- Base perfect bottom half; Fractured clear top half; both unlock Core; Core clear animated reward.
- Owned plant/Core reward at start for opt-in replay. Every death/retry resets whole world; checkpoints cannot resume shiny; quit/switch/practice cancels. Movement unaffected. Permanent ownership retained.
- Persistent Garden and shiny marks; animated award and carried presentation.
- Active run timer/deaths, end results, separate per-world/mode local records, no practice/watch awards, persistence.
- Verify actual gameplay routes, transitions, failure/reset, save/reload and rendered UI. Package and launch final sampler.

Source worktree: /Users/computer/Projects/Bladefall-Complete, codex/bladefall-complete. Started from latest Fractured Causeway; imported Cores via cherry-pick and latest native Woods from codex/godot-outskirts-refinements. World1 copied byte-for-byte from user's edited native scene.
