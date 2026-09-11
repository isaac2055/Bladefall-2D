# Opening arc systems matrix — Levels 1–5

Status: production authority for the single-player opening arc as of 7.86.0.
This matrix supersedes older opening-arc references to random equipment drops,
fractional lifesteal, costume perks, automatic level-up choices, and loose
crafting materials. Those legacy systems remain available only in regions that
have not yet received their authored level pass.

## The compact player economy

Bladefall's campaign now has five reward families. They must remain few enough
that a player can understand why every find matters.

| Family | Meaning | Opening-arc rule |
| --- | --- | --- |
| Permanent memories | New verbs that reopen the connected world | Granted only at authored milestones and never unequipped |
| Weapon and Mantle | The player's direct combat verb and one visible defensive garment | Named physical finds enter the bag with `R`; the first weapon equips automatically |
| Gift | One major rule modifier, independent of appearance | Costumes are cosmetic trophies; one Gift may be equipped from the bag |
| Echo | Small, spatially earned build modifiers | Up to three equipped within capacity; changes happen only at a refuge |
| Advancement | Whole Blood measures and finite Forge Seals | Four Blood fragments form a Knot; Seals authorize later permanent equipment work |

Gold remains the ordinary shop currency. Levels 1–5 do not emit random gear,
anonymous crafting materials, random stat choices, or XP-derived skill screens.
Optional branches instead own a named reward, a story correspondence, a sealed
Recollection, or a deliberate combination of those.

## Progressive disclosure

- A new game exposes only movement and the whole-measure Blood display. The bag
  and build screen are absent because the player owns nothing that needs them.
- The bag first appears when the Oathblade is recovered in Black Woods.
- The Mothsilk Mantle teaches that later named finds are bagged before equipping.
- The Brute introduces appearances, Gifts, and Echoes together because each is
  causally tied to that victory, but only the Gift and Echo alter rules.
- Updrafts demonstrates optional mastery rewards and the first Blood fragment.
- Hollow Marksman expands Echo capacity, gives a ranged Echo, awards the first
  Forge Seal on its high optional route, and completes the two-mouth portal verb.
- Sealed Recollections appear once in every level. They are tracked in the bag,
  remain locked until the Waking Key at the end of the game, and then launch an
  isolated, darker and more dangerous copy of the preserved original stage.

## Level ownership

| Level | Entry verbs | Mandatory gain | Optional authored value | Return promise |
| --- | --- | --- | --- | --- |
| 1 · Outskirts | Jump; unarmed | Mara's map/journal if helped | Road Knot Echo, First Draught correspondence, Sealed Recollection, weapon-return Sentinel route | Weapon, Dash, and later Wall Cling each reveal distinct old boundaries |
| 2 · Black Woods | Jump; unarmed | Recovered Oathblade, auto-equipped and stored | Mothsilk Mantle on a veteran's canopy rack, Red Clasp correspondence, Sealed Recollection | Dash breaks the bruised root seam; the physical tunnels stay reciprocal |
| 3 · Broken Causeway | Jump, Oathblade | Chainwake Longbow for the encounter; Dash after the Brute | Fault Bell Echo, Blood Vow Gift plus cosmetic Crimson Reaver, Chain Vow from Oren, wristguard correspondence, Sealed Recollection | Dash makes the westward return and Black Woods root seam meaningful |
| 4 · Updrafts | Jump, Oathblade, Dash | Stage-local Aerie Harness; Linked Portal at Signal Crown | Gale Stitch Echo in Needlewind mastery, one high-route Blood fragment, Ilyra's world quest, Sealed Recollection | Recovered machines and service shortcut persist; the harness stays local |
| 5 · Hollow Marksman | Jump, Oathblade, Dash, Linked Portal | Twin Portals after the Marksman and a deliberate two-slate traversal proof; Far Thread, capacity, Blood fragment, and Forge Seal from victory | Worn Command Token plus a separate Forge Seal, Sealed Recollection | Twin Portals open Ruined Keep; later Wall Cling restores the difficult western route |

## Reward causality

Every reward must answer an action the player can describe:

- “I finished the survey,” not “a meter filled.”
- “I climbed around the roots and released the blade,” not “loot spawned.”
- “I learned the Brute's machinery and broke its armor,” not “the boss dropped
  three unrelated currencies.”
- “I mastered the turn inside Needlewind,” not “a crystal happened to float on a
  platform.”
- “I reached the command shelf under fire,” not “an enemy rolled a rare item.”

This is the design boundary for Ruined Keep: it may add one new permanent verb
and new authored rewards, but it should deepen these five families rather than
introduce another parallel inventory or currency.

## Automated evidence

- `docs/charters/opening-systems-integration.json` proves progressive disclosure,
  Oathblade/Mantle acquisition, independent Gift/appearance ownership, usable
  Fault Bell behavior, Updraft mastery rewards, and the single-to-pair portal
  transition in the actual browser runtime.
- Each level charter owns its geometry and encounter receipt. The integration
  matrix does not substitute for first-time human play, readability, or taste.
