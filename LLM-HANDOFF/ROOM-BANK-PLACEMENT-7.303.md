# Completed final approvals and allocation analysis

All final approvals are handled. B60 is cut/archived. User’s “B32” lantern description identifies F32; its receiving phase platform extends 32px to the second beam and is banked. B32 stays unchanged. F59 has an ordinary reusable runway and a 24px higher overhead beam with a shorter west tip. A genuine wavedash route and preparatory jump/relanding pass; original reverse-hyper also still works. F59 is banked. Total **97 approved (54 Base /43 Fractured)**, nothing pending. Menu defaults to Banked.

**Analysis only:** all 87 non-superrooms are assigned exactly once across 40 actual Survive worlds (Base 1–20, Fractured 21–40). Every world gets2–3; third rooms go to 8/11/12/14/15/17/19. B56→21 and B57→26 use the user-approved early-Fractured alternatives, without changing saved bank.side. Existing 10 superrooms remain unassigned; no new superrooms, campaign imports/cuts, checkpoint changes or finale shortfall calculation. Last slot in each world is reserved for a later superroom decision.

Primary plan: docs/room-bank/WORLD-PLACEMENT-7.303.md; authoritative allocation: docs/room-bank/world-placement-7.303.json. Source inventory: docs/room-bank/WORLD-INVENTORY-7.303.md and world-inventory-7.303.json, covering 490 authored main rooms and 72 replacement-review candidates (14 limited-challenge,58 repetition candidates). Do not treat that shortlist as72 approved cuts. Preserve tutorials, quest/secret links, bosses, breathers and narrative exits. Retire early filler separately from locating additions later, after required teaching.

Native curriculum correction: World 21 B56/F40;23 B46/F23;24 F59/F60 after native wallbounce lessons;26 B57/F34. F61’s obsolete B60 preparation is replaced in the plan by F33/F28. F41 remains an explicit user-approved Base 14 reverse-super teaching exception. Every proposed bank/native prerequisite and action kit is checked. Numeric difficulty distribution still needs human tests; old campaign /10 ratings are not the current /5 scale.

Checks:97 canonical completions,412 positive variations,262 shortcut probes; focused F32/F59 browser routes/UI/camera pass. placement-check.mjs preserves 95 room definitions/tapes,89 prior approval records and 435 runtime/campaign sources; verifies all 87 IDs,40 quotas, actual candidate IDs and prerequisite order. Result: docs/room-bank/placement-7.303-audit.json. Version7.303.0/cachev468-room-bank-placement; catalog batch16. All further imports/finale work await a new user instruction. Earlier entries are historical.

## Publication and evidence locations

Standing authorization remains commit/push to GitHub main, with automatic Cloudflare Pages publication. This change does not modify the Pages/Worker split or deploy the separate online API. Publication is verified against the pushed commit and live bank asset after the push; local receipts are stored under ignored `scripts/climb/.cache/room-bank/`.

F32/F59 original maps and removed B60 are preserved in `scripts/room-bank/archive/before-placement-7.303/`. B60 is also in `archive/rejected-final-review/`. The preservation baseline points to ae83e67 and includes all prior room records, public assets and Climb layout sources. Do not rerun older run-specific preservation scripts expecting their historical counts; use `placement-check.mjs` for the current plan.

Final room change details: `docs/room-bank/FINAL-APPROVALS-7.303.md`. Route report: `docs/room-bank/route-report.json`. Browser receipt: `scripts/climb/.cache/room-bank/review16-browser.txt` with F32/F59 entrance and F59 intermediate captures. The source F59 contains normal-input wavedash trace evidence and both successful patrol crossings; original reverse route is a positive check.

The plan is ready for review and later implementation, not already installed in the campaign. Do not begin imports, create/assign superrooms or remove campaign rooms without the next user instruction. The user specifically deferred that phase.
