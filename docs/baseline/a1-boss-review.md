# A1 boss contract and reset review — 2026-07-31

## Evidence boundary

All seven campaign bosses were recorded against Bladefall `7.8.0` at the
byte-verified localhost `http://127.0.0.1:8372/`. The in-app browser-control
bridge remained unavailable, so the version-verified local Chromium fallback
produced the videos and runtime receipts under `docs/baseline/bosses/`.

This is intentionally constrained evidence. Each probe positions the player in
the arena, grants disclosed observation-only invulnerability, directly lowers
the boss to its HP thresholds, and triggers a synthetic lethal fall. It proves
that runtime phase and restart plumbing responds; it does not prove legitimate
damage routing, intended portal phases, balance, boss lethality, or victory.

## Contract inventory

| Boss | Vulnerability contract | Recorded response | Still required |
| --- | --- | --- | --- |
| The Brute | Portal its charge into the pylon, then punish the exposed window | Phase 1/2 response and full-stage restart | Natural charge, pylon impact, punish, boss-caused death, win |
| Hollow Marksman | Bank reflected arrows through the timed shutter | Phase 1/2 response, projectiles, restart | Natural reflection cadence, ground AoE avoidance, death, win |
| The Warden | Cross its body through opposed personal mouths for a flank window | Phase 1/2 response, arena activity, restart | Valid pair, traversal, shield timing, death, win |
| Frost Sorcerer | Capture frost shots and strike the moving siphon rhythm | Phase 1/2 response, projectiles, restart | Three captures, chase pressure, break window, death, win |
| Ember Colossus | Portal molten shot through coolant, forge obsidian ammunition | Phase 1/2 response, attacks, restart | Full portal→water→forge circuit, rush pressure, death, win |
| Void Tyrant | Opposed mouths low, mid, then high; loop each bolt three times | Generic HP enrage and restart | All three paradox rounds, rebuilding pairs, death, win |
| Abyss King | Four temporal-echo separations; portal hijack begins in rounds 3–4 | HP phases 1–3 and checkpoint restart | Four crown fractures, both hijacks, boss-caused death, win |

## Findings

1. Every boss creates a fresh full-health encounter after the synthetic lethal
   fall. The first six return to their stage start.
2. Abyss King preserves and returns to its final checkpoint with full health,
   matching its retry-heavy encounter contract.
3. Every boss entered the generic phase-two state when forced below 50% HP.
   Abyss King also entered its distinct below-25% phase-three state.
4. Void Tyrant's low/mid/high `paradoxRound` sequence and Abyss King's four
   `echoRound` crown fractures are mechanic phases, not ordinary HP phases. They
   remain completely open despite the generic phase evidence.
5. The Warden has no `portalGate` string because its immunity is enforced by the
   separate `wardenPortalFight`/flank-window rule. The null field is not evidence
   that ordinary damage is allowed.
6. Hollow Marksman's current contract stores 15 reflected banks and a one-third
   self-damage multiplier. A legitimate fight recording is needed to judge
   whether that produces deliberate mastery or excessive repetition.

## A1 status

Boss contract inventory and synthetic reset coverage are complete. Natural
mechanic phases, boss-caused deaths, victories, and co-op boss authority remain
pending. A1 remains open.
