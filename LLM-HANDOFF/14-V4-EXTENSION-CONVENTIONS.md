# Bladefall v4 — extension conventions (2026-09-16)

Owner selected Fable again after rejecting Astra's refinement. Extend the selected
implementation; do not continue Astra's competing direction unless asked.
Owner clarified the objection was visual finish / integration, not personality.

## Source map (inspected, not a new test receipt)
- Main implementation: `public/bladefall-respec-renderer.js`; prototype:
  `public/fable-respec.js`. The campaign renderer is authoritative for integration.
- `index.html`: `useRespecRenderer`, `respecLegacyDrawers`, and the call to
  `BFRespecRenderer.render(ctx, env)`; classic remains the fallback.
- `Z=.5`, `B`, `WX`, `WY`, `W2`: one shared buffer pixel grid, rounded positions,
  world y-up conversion, 2x output with smoothing off. Do not copy prototype
  y-down coordinates directly into the main game.
- `P`, `THEMES`, figure/walker palettes: reuse ramps, silhouette contrast and
  cap/edge colours. Add colour roles deliberately; avoid a separate art language.
- `drawFigure` + `heroState`: animation reads actual movement/combat states.
  `STRUCT` + primitives: extend existing scenery vocabulary at legacy dimensions.
- `drawEnemy` calls `drawAwareness` before type-specific rendering. Keep gameplay
  information when replacing a drawer, including telegraphs and shield facing.
- Circuit warmth, spinning wheels, taken bow, restored crown and read markers
  must reflect game state. Decoration must not promise an unavailable action.

## Next-work discipline
- Fable reports stages 0–8 converted, 14 focused checks passing, multi-position
  renders reviewed. This inspection confirms source coverage, not those receipts.
- §6 of 13-V4-RESPEC-WORK-ORDER.md records the staged implementation and debt.
  Consider missing boss telegraphs before judging difficulty: loss of a warning
  is a gameplay regression, not merely unfinished decoration.
- Remaining debt: court panels, weapon/armour pickups, linked portals, rune
  emitters/siphons, boss-specific warnings, undersized small opening props.
- Keep each region/puzzle redesign bounded and individually reviewed. Preserve
  progression and collision dimensions until an intentional redesign changes them.
- Validate affected states (before/after interaction; idle/warn/attack/recover),
  then inspect at actual play scale. A clean render alone proves no aesthetic
  acceptance. Follow the no-bag / low-management rules in work order §3.
- Current turn studied and documented the selected direction; no runtime edits,
  region redesign, commit or deployment performed in the game project.
