# Tool-assisted route testing

`npm run tas:smoke` runs declared frame-by-frame input against a fresh seeded campaign in a real headless game page, records the native compressed input trace and state digests, then reruns the same plan and requires an exact receipt match.

The initial `opening-movement-smoke` pack validates the harness only. It must not be described as a campaign completion. A future route pack is complete only when it covers its named stage transitions, puzzles, bosses, deaths/recoveries, and final completion using declared inputs—never teleports, progress grants, or health edits.

Receipts are written to `docs/tas/tas-smoke-receipt.json` and include the plan, seed, snapshots, native trace, replay result, and explicit limitations.
