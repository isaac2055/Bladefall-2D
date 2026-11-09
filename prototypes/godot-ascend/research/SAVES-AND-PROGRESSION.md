# Saves and progression — 0.46.0

Implemented title-only Settings, removed tagline and opening skip, default-off speech with subtitles, eligible mid-world saves, local records, persistent unlocks/hearts, revised flower rewards and smoother affixed-room travel. Watch Stairs and world-ending story scenes remain proposals in WATCH-STAIRS-AND-ENDINGS-PROPOSAL.md.

## Save behavior

Autosaves preserve active/checkpoint rooms, puzzle machinery, carried-item identity, inventory, quest progress, current travel, deaths and eligible run time. Continue restores the saved attempt. Saves use atomic replacement, checksums and a content signature; incompatible/corrupt snapshots are rejected. Practice and detached references cannot overwrite a real attempt. Resuming a carried shiny challenge starts the whole world again, so checkpoint saves cannot bypass the challenge.

## Progression

Every base clear earns its root; a zero-death eligible base clear makes it shiny. Finishing a base world persists the next world's unlock immediately, independently of arriving there. All three base clears gate Fractured. A Fractured crown opens the corresponding Core. Existing Fractured/Core carried shiny rules remain. Prior completion records migrate to root ownership. Purple bonus hearts persist uniquely by chapter and source, with family totals in Garden.

Garden & records appears in Settings after Outskirts; the first clear announces it. Collection shows earned rewards and hearts, with records in a separate view. The floating Garden button is removed.

## Records

Records stay on the player's Mac, as confirmed by the user. The existing hosted playtest board targets browser campaign routes/seasons and lacks native Core routes. It is not directly compatible with this sampler. Route version sampler-2 separates revised transfer timing from prior records; old record data is retained.

## Travel

Transfers use a continuous cubic arc with quintic easing, interpolated actor movement, blended camera tracking and a lantern cradle. Individual room checkpoints and approved geometry remain intact.

## Validation

All twelve packaged suites passed: saves_progression, player_release, sampler, sampler_app, sampler_journey, run_profile, cores, world_checks, world2_journey, world3_journey, fractured_journey and woods_nine. Evidence: .cache/v46-package-check/pack-results.json.

Save tests restore Returning Seed, Lantern Above the Door, an airborne-weight puzzle and Core 2, comparing live state and 120 subsequent identical inputs. They cover carried-object identity, in-flight restoration, shiny restart markers, corruption/content mismatch, unique heart persistence, progression gates and actual title/settings/Continue UI behavior. Final UI changes receive focused packaged regression checks in .cache/v46-package-final.

Actual GPU captures were inspected for title Settings, completion, Garden and travel using tests/saves_presentation.gd. The app remains locally signed, without Apple notarization. Controller input validation uses injected events, not physical hardware.
