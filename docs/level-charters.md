# Bladefall level-charter and evidence contract

F08 establishes the guardrail for every `L01`–`L16` run. A campaign blueprint
states intent; it does not own placement. Gameplay geometry may be introduced
only by a named room in that level's charter, after inspecting the fully
assembled runtime level.

## The P/G/C/V gate

| Phase | Required result before the phase can close |
| --- | --- |
| `P` | Runtime capture, room map, five route intents, and a dynamic evidence plan |
| `G` | Room-owned geometry, supported fixtures, bounded fluids, safe entry and recovery |
| `C` | Authored people/place, story/quest/shop continuity, and revisit state |
| `V` | Route receipts, failure/reset/success recordings, visual review, and co-op review |

The five route classes are fresh, revisit, optional, speedrun, and co-op.
Dynamic mechanics additionally require setup, failure, recovery, success, and
co-op receipts. Static reachability is supporting evidence, not a substitute.

## Non-negotiable geometry rules

- Every assembled object, enemy, pickup, and traveler reports an
  `authoringOwner` and `authoringRoom`.
- Room ids use `<level-id>:<act-number>` and must exist in the active charter.
- Generic campaign/decorator passes cannot invent gameplay fields, hazards,
  platforms, or liquids. They may annotate intent or add presentation-only
  motion that does not affect collision or routes.
- Fluids require `contained: true` and an authored `basinId`; placement must be
  reviewed with visible shores/walls, support, collision, and an escape route.
- Entrances are protected from hazards and enemies. Shops, travelers, and other
  fixtures require stable support in the final assembled level.
- A level phase does not become complete because automated tests pass. Its named
  receipt set must also be present.

## Sixteen charter stubs

The runtime catalog in `bladefall-charters.js` generates a versioned stub from
each immutable campaign blueprint. Each starts pending and is filled by its
dedicated planning run.

| Level run | Charter | Source | Next gate |
| --- | --- | --- | --- |
| `L01` | The Outskirts | custom | `L01-P` |
| `L02` | Black Woods | custom | `L02-P` |
| `L03` | The Brute | custom | `L03-P` |
| `L04` | The Updrafts | custom | Automated `L04-V` complete; human/co-op signoff |
| `L05` | Hollow Marksman | custom | `L05-V` |
| `L06` | Ruined Keep | procedural | `L06-P` |
| `L07` | The Warden | procedural | `L07-P` |
| `L08` | Frostfell | procedural | `L08-P` |
| `L09` | Frost Sorcerer | procedural | `L09-P` |
| `L10` | Emberdeep | procedural | `L10-P` |
| `L11` | Ember Colossus | procedural | `L11-P` |
| `L12` | The Inversion | custom | `L12-P` |
| `L13` | The Void Tyrant | procedural | `L13-P` |
| `L14` | The Abyss King | procedural | `L14-P` |
| `L15` | The Gilded Vault | bonus | `L15-P` |
| `L16` | The Deep Line | secret | `L16-P` |

At runtime, `window.__BF.charterState()` exposes the active charter, charter
validation, assembled geometry audit, and evidence plan for inspection.
