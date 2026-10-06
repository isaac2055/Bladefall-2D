# Act Two — preparation for refinement

Reviewed 2026-09-24 against local 7.195.0. Preparation only; no gameplay changes.
Read the five region design plans and targeted implementation/art paths; loaded and
updated stages 16–20 in a private browser fixture and inspected representative renders.
This was not a traversal, victory, balance or co-op verification. Teleported fixture
positions are not evidence of collision bugs. Code supersedes stale plan sections.

## Preserve and develop

| Stage | Strong foundation to preserve | Refinement focus, subject to playtest |
| --- | --- | --- |
| 16 Thunder Cliffs | Stable ship deck against moving sea; rigging/tow/chain voyage; freeing the Hydra; Chainhook return to the ship | Keep threats and hook targets legible against large sails. Assess timed-leg downtime before adding more events. Preserve the stable deck's mechanical intent. |
| 17 Landing Shores | Wreck climbing, tide-dependent routes, bells controlling conscripts, consequential meeting with Oren | Differentiate the repeated bell encounters. Check whether tide waits provide decisions. Integrate route surfaces into wrecks and shoreline rather than merely decorating flat runs. |
| 18 Colony | Smoke and tent cover, the King's tap and bucket counterweight, freeing chained conscripts, curing Oren | Refined in 7.198: two physical blanket refuges replace global immunity; watch victories and freed shackles persist; local Sable conversations, clearer spring feedback and a nearby-player rescue sequence. Owner playtest pending. |
| 19 Palace Path | Reflected sun, changing elevation, Hydra overlook, allies affecting the gate | Refined 7.199: apron shutter rhythm, physical canvas bearer, bank regrouping, nearby Oren work, persistent gate steps, clearer gate/backdrop. Three-hook chasm retained; owner playtest pending. |
| 20 Sunspire | Portal-routed sunlight, returning water to the Colony, King's opposite-side vulnerability, friendly Hydra payoff | Refined 7.200: distinct routed rays/charging seals; clearer King telegraphs and harmless setup previews; saved bloom/yielded presentation; Hydra boarding. Three progressively different locks retained. Focused checks pass; complete solo-balance playtest pending. |

Oren's choice carries through mechanics, appearance and the ending; this is the strongest
cross-region structure. Preserve it. The regional palettes already distinguish the voyage,
shore, settlement and palace. Prioritize foreground/background separation, visible causes
and consequences, and purposeful geometry over adding decorative density.

## Concrete issues to revisit

- Resolved in 7.197.0: Shores floodwater damages and knocks upward in place; dry-ground
  teleport removed. Raised wreck ribs provide recovery footing. See stage 17 charter.
- Sunspire exposure genuinely depends on an ally or routed light touching the side away
  from the player; six successful blooms advance three hours. Completed hours persist
  through death. Hour changes clear portals deliberately. Preserve the distinction
  between this transition and the player's ability to recover a bad placement.
- Sunspire's documented solo bot runs used healing intervention and took many hits.
  They do not establish an unassisted human completion or fair tuning.
- Review the choice branches separately: assistance should change the experience without
  removing every meaningful action. Preserve the darker branch's consequences.
- Act Two co-op coverage and maps are incomplete according to the plans; do not claim
  them verified from this review. Several plans' “not yet done” lists are stale.

## Implementation boundaries / next pass

Shared core is `public/bladefall-act-two.js`; stages 17–20 have separate region and art
modules. Start with each region's `docs/charters/*/DESIGN-PLAN.md`, then its code. Existing
dirty Act Two and music work belongs to the current shared workspace and must be preserved.
Work one region at a time, incorporating owner playtest findings; refine and extend the
existing ideas rather than replacing the campaign wholesale. No new automated solvers,
full-suite runs or broad redesign were needed for this preparation.
