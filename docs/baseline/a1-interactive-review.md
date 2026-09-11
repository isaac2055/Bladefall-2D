# A1 interactive entrance review — 2026-07-31

## Evidence boundary

The 16 recordings under `docs/baseline/interactive/` are short entrance
locomotion probes against Bladefall `7.8.0` at the byte-verified localhost
`http://127.0.0.1:8372/`.

Each stage was selected with `window.__BF.reloadStage(index)` and starting
health was restored once. From that point onward the harness only pressed the
ordinary move-right, jump, dash, and attack keys. It did not grant
invulnerability, teleport the player, grant a jetpack, or edit position during
the probe. The videos support visual review; each `receipt.json` contains the
authoritative input log and sampled runtime state.

These results show that every entrance responds to ordinary input. They do not
show intended-route completion, puzzle resolution, boss completion, a revisit
route, optional completion, a credible speedrun, or co-op stability.

## Results

| Stage | Maximum entrance progress | Level fraction | Resets observed |
| --- | ---: | ---: | ---: |
| The Outskirts | 1,714 px | 22.5% | 1 |
| Black Woods | 1,194 px | 18.9% | 0 |
| The Brute | 995 px | 26.7% | 3 |
| The Updrafts | 1,481 px | 19.9% | 1 |
| Hollow Marksman | 2,314 px | 28.1% | 0 |
| Ruined Keep | 2,093 px | 23.5% | 0 |
| The Warden | 2,200 px | 26.7% | 0 |
| Frostfell | 2,251 px | 25.5% | 0 |
| Frost Sorcerer | 2,130 px | 25.9% | 0 |
| Emberdeep | 1,506 px | 16.7% | 1 |
| Ember Colossus | 1,566 px | 17.3% | 1 |
| The Inversion | 1,237 px | 11.3% | 1 |
| The Void Tyrant | 2,432 px | 26.8% | 0 |
| The Abyss King | 824 px | 8.2% | 0 |
| The Gilded Vault | 1,281 px | 13.0% | 2 |
| The Deep Line | 2,752 px | 19.8% | 0 |

## Initial observations

- Every stage produced forward movement and no browser page error.
- The Brute produced three reset-shaped position drops in six seconds, the
  highest entrance failure frequency in this probe.
- The Gilded Vault produced two resets and relatively low normalized progress,
  consistent with a more exacting entrance.
- The Abyss King produced the lowest normalized progress without a reset. That
  needs a human route review to distinguish deliberate combat friction from
  poor entrance flow.
- Hollow Marksman and Void Tyrant admitted long uninterrupted entrance runs.
  A short scripted probe cannot determine whether their later boss pressure is
  appropriately difficult.
- The Deep Line traveled furthest in raw pixels without a reset. Its minecart,
  signal, and ending systems still need targeted activation and recovery clips.

## A1 status

Entrance locomotion coverage is complete. Dynamic-room recordings and all five
route classes remain open, so A1 is not signed off.
