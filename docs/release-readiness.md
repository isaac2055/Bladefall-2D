# Bladefall 7.0 release readiness

## Release identity

- Game version: `7.0.0`
- Save key: `bladefall_v2` (unchanged)
- Save schema: `4`
- Permanent leaderboard key: `bladefall_leaderboards_v1` (unchanged)
- Offline cache: `bladefall-v54`
- Deployment: local mirror only; no production deployment was performed

## Automated gates

| Gate | Result |
| --- | --- |
| Unit contracts | 96 passing |
| Balance catalog | 16 stages, 21 enemy archetypes, 7 boss stages; no issues |
| Seed/tier matrix | 3 seeds × 3 tiers × 16 stages = 144 valid builds |
| Determinism replay | Identical world signatures across repeated seeded builds |
| Boss startup/runtime | All 7 bosses active, finite, camera-framed, and error-free |
| Save migration | Progress, skins, secret state, valid run data, and future fields preserved |
| Factory-reset boundary | Campaign reset; permanent leaderboard archive preserved |
| Co-op transition | One-player wait enforced; shared seed and stage after unanimous Go |
| Co-op reconnect | Session token and stage preserved through forced disconnect |
| Performance stress | 2,400 particles bounded to 900 drawn; release monitor healthy |
| Responsive matrix | Desktop, phone landscape/portrait, and tablet landscape passed |
| Touch controls | Jump and attack accepted at release mobile viewport |
| Offline startup | Service-worker-controlled reload from `bladefall-v54` |
| Artifact integrity | Source, service worker, manifest, and local mirror verified |

## Supported presentation profiles

- Auto selects High on capable desktop hardware.
- Auto selects Balanced on touch/mobile and moderate devices.
- Auto selects Low on constrained processors, memory, or extreme pixel load.
- High, Balanced, and Low can be forced in Settings and persist in the existing
  save.
- Reduced motion, flash reduction, shake, contrast, larger text, captions,
  element labels, damage direction, haptics, and auto attack remain independent
  options.

## Release procedure

1. Run `npm test`.
2. Run `./build-deploy.sh`.
3. Run `npm run release:check`.
4. Serve `netlify-deploy/` locally and verify an offline reload.
5. Deploy only when the owner explicitly authorizes production publishing.
