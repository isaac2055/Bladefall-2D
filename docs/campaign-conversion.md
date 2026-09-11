# Bladefall campaign conversion

Run 11 moves campaign ownership into `bladefall-campaign.js`. The module is the
single source for stage order, progression metadata, portal verbs, cadence,
optional portal trials, custom extension lengths, act names, systemic themes,
and the optional composition assigned to each stage.

Existing boss arenas and progression gates remain authored gameplay code. This
preserves the mechanical work already validated while making the surrounding
campaign discoverable and testable as data.

## Blueprint contract

Each immutable blueprint contains:

- Stable index and id.
- The complete stage catalog record used by gameplay and level select.
- Construction source: custom, procedural, bonus, or secret.
- A one-sentence mechanical signature.
- System vocabulary and named acts.
- Optional portal verb and mastery trial.
- Cadence and custom-extension configuration.
- One optional systemic composition recipe.

`stageCatalog()`, `portalVerbs()`, `cadence()`, `portalTrials()`, and
`customExtensions()` return detached compatibility views. Existing gameplay code
can keep its familiar lookup shapes without retaining separate ownership.

## Handcrafted parity compiler

Custom, bonus, and secret levels pass through `compileLegacyLevel()` before
construction. The compiler:

- Deep-clones the authored records.
- Preserves build hooks and every gameplay property.
- Produces a detached `bladefall.level@1` manifest.
- Validates the manifest before runtime construction.
- Reports object, enemy, loot, traveler, quest-item, and build-hook parity.

The runtime capture includes this migration receipt. Procedural stages have no
legacy receipt because their stage catalog and composition recipe are already
compiled directly from the blueprint.

## Campaign compositions

Compositions are optional mastery spaces placed only on safe existing footing.
They do not own doors, exits, boss vulnerability, coins, travelers, or required
portal hardware. Dense rooms can receive a raised practice deck while leaving
the original route open beneath it.

| Stage | Blueprint composition |
| --- | --- |
| The Outskirts | Wind plus suspended moving-platform lift |
| Black Woods | Alternating pendulum passage |
| The Brute | Authored-complete charge and pylon fight |
| The Updrafts | Water current, updraft, and moving catch |
| Hollow Marksman | Pendulum sightline passage |
| Ruined Keep | Gravity well with moving optional route |
| The Warden | Low-gravity rotor crossing |
| Frostfell | Ice and crosswind control lane |
| Frost Sorcerer | Water current and updraft crossing |
| Emberdeep | Shallow lava with precision stepping stones |
| Ember Colossus | Coolant current and updraft catch |
| The Inversion | Gravity-well ceiling-route variation |
| The Void Tyrant | Gravity-well approach variation |
| The Abyss King | Low-gravity rotor rehearsal |
| The Gilded Vault | Authored-complete precision gauntlet |
| The Deep Line | Authored-complete rail expedition |

The three authored-complete stages deliberately receive no generic addition:
their existing structure is already a singular composed mechanic.

## Runtime inspection

```js
window.__BF.campaign.blueprint(stageIndex)
window.__BF.campaign.authoringManifest(stageIndex)
window.__BF.campaign.validateBlueprints()
window.__BF.campaignState()
```

`campaignState()` reports blueprint identity, the applied or skipped composition,
and the handcrafted migration receipt for the current stage.
