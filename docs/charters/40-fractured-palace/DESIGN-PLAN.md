# The Fractured Palace (stage 40), built 2026-09-25 (7.220.0): the last echo

## Refinement — 7.220.2 (2026-09-25)

King exposure time, sweep reach/height and flare bounds are visible. Light remembers its exact exit mouth: hit blink removes that mouth only, regardless of surface or array order; timed blink preserves both. Death stops light/attack progression; retry clears exposure, health, flares and dialogue; completed King remains seated. Warning render and completed reload reviewed; finale retained.

Part of the final nine-region batch: 78 focused tests passed; all18 modules passed syntax
checks. Browser fixtures reviewed changed cues, death cleanup and applicable completed
reloads. These are scoped checks, not new full-route or co-op verification. Authored
geometry/timing retained. Local mirror only; no deployment.

Act Three's twentieth and last echo: the Sunspire after the Echo walked it backwards. The light still comes
down through the skylights, and it still goes where you send it.

**The kit** is the one the Sunspire was entered with: everything through the Chainhook. The palace asks mostly
for the twin mouths. Nothing waits here; the original granted nothing either.

**The Muster applies.**

**Code:** `public/bladefall-fractured-palace.js` and `-art.js`.
- **Stage and seams:** stage 40, zone `fractured-palace`. The seam `fp-fpa` comes from the Path. There is no
  east seam: the road ends here.
- **Rest site:** `palace-ash` (The Last Hearth).
- **Music:** `fractured-white-marble-palace.mp3` on the road, and `fractured-the-fallen-champion-duel.mp3` for the
  King (the original's King cue).

**Engine parts reused:**
- the player's portal pair (`G.cratePortals`: floor mouths on slate, wall mouths on slate faces set while
  clinging);
- `portalGate` deflection;
- `clearPlacedPortals`.

**Built here:** the light. The original's ray tracing through mouths is local to its region file, so the echo has
its own, simpler one:
- Shafts fall straight down.
- A floor mouth within 40 of a shaft sends the light out of its twin: up out of a floor mouth, or across out of a
  wall mouth the way it faces.
- The ray runs axis-aligned to the first solid, seal or the King.
- Shafts and sent light burn (12, every 1.2 s), but not within 40 of the mouth the light leaves.

Also built here: the seals, and the King in the Dark.

**The end of Act Three:** the last echo sets `meta.actThreeDone` (saved) when the King yields. Walking out of the
palace shows the closing card: END OF ACT THREE / THE ECHOES / All twenty walked. There was no existing
"all echoes cleared" hook; `F.endCard` would have named a next echo.

## The B-side
| Room | x | The original | The echo |
|---|---|---|---|
| The Sun Court | 0–2800 | a shaft caught in a floor mouth; its twin on the floor sends it up into the seal | a shaft onto a slate panel; a raised slate face (100–620); a seal across the court at 330. Catch the shaft in a floor mouth, cling to the face at the seal's height for its twin, and the light crosses the court. The gate lifts |
| The Hall of Hours | 2800–5700 | floor mouth to wall mouth across the hall | the shaft moves with the hour (±450 on a 6 s swing) across a strip of slate. Catch it where it will pass; climb to the ledge (a step at 110, the ledge at 220) and set the twin on its slate, under the seal: the light goes up into it |
| The King in the Dark | 6200–9400 | the King in Daylight (six blooms from routed light; hours; his glove sweep, blink, flare) | **the C-side** |

## The C-side: the King in the Dark
The throne room is dark except for the shafts: one at dawn, two in the morning, two moving at noon. Slate panels
lie under their paths, and slate faces stand at both ends.
- **Exposure:** the King is struck only while light you have sent touches him, for 1.6 s after it last did. A low
  mouth on the west face throws the light across the room at his height, so it finds him wherever he stands east
  of it.
- **When struck:** he blinks elsewhere and takes the mouth that sent the light. The one in the shaft stays, so
  each new try is one cling.
- **Timed blinks:** every 8.5 / 7 / 5.5 s he blinks on his own. These move him but take nothing.
- **Other moves:** a glove sweep (reach 170, 0.6 s tell), and from noon a flare where you stand.
- **Don't step in your own mouth:** walking onto the floor mouth throws you out of the wall mouth, into your own
  light.

Two blows in each of three acts. Leaving the hall resets the fight; a finished act is kept.

## Verified (scripted input in the browser; not a human playthrough)
Chained with the Muster on, from spawn to the closing card in 144 s, with `meta.actThreeDone` saved:
- the Court (both mouths on the first try);
- the Hall (lit 1.7 s after the twin was set);
- the King in 94 s. The bot's blood was kept topped up: it took 11 hits, mostly walking into his sweep.

Separately:

| Check | Result |
|---|---|
| The King, from three start times | 3/3 yielded in 63–126 s (blood kept up; 10–16 hits) |

Changed while verifying:
- **Mouths lost on blink:** the King's timed blinks cleared your mouths every 8.5 s, sooner than a knight could
  set both. He landed one blow in 150 s. Only a blow now takes a mouth, and only the one that sent the light.
- **Self-burn:** the light burned the knight setting the mouth it came from.
- **The chained bot looped** after the fight: walking out, it kept falling into its own floor mouth and out of
  the wall mouth. The palace now clears your mouths when the King yields.
- **The hall's seal** was narrower than the slate under it, so a mouth at the slate's end could miss it.

## Open
- Owner playtest: whether sending light reads without a sign (the shafts, the slate, the gold ray), whether
  "don't step in your own mouth" is learnable in the throne room, and whether the fight's length (≥6 set-ups) is
  right for a finale.
- The original's allies, hours as a system, sick adds and the hydra ride have no echo here. The closing card is
  new, and its words are for the owner to change.
