# Frostfell — the banked settlement

Frostfell receives this authored pass. The Warden fight and Frost Sorcerer are unchanged; the shared mine entrance now requires deliberate Up interaction. Enter with Up at the Warden's western mine mouth with Counter, Wall Jump and Twin Portals; earn Double Jump here and return toward the old Causeway high shaft. The eastern aqueduct remains a visibly barred future connection from the White Court.

| Room | Span | Purpose |
| --- | --- | --- |
| Banked Refuge | 0–2200 | Mine exit, shop, stove, rest site, ledger and a single counterable guard on dry ground |
| Working Streets | 2200–4250 | Ice interrupted by dry islands, optional raised shelves and Nim's three permanent braziers |
| Workers' Hearth | 4250–4720 | Nim settles at the shelter, grants a Forge Seal in campaign and opens the works access |
| Thermal Works | 4720–6620 | Bank a fire signal through the correct-height slate and the fixed return duct into wind; heat thaws the floor and latches the sluice |
| Thawed Court | 6620–9000 | Double Jump memory, protected rehearsal, optional sealed recollection and original high service return |
| Frozen Stair | 9000–10400 | First exposed Double Jump ascent and fixed ice spikes |
| Exposed Galleries | 10400–13000 | Ice landings, alternating heights, timed ground spikes and three dry checkpoint islands |
| Muster Crown | 13000–15100 | Final ascent, frozen bell-and-gear engine, summit return passage, later Rime Key seam and aqueduct |

Nim starts following only after an Up interaction. He cannot die during this required route. Fires remain lit after he settles, and continue providing traction nearby. No exposure meter is added. The settlement retains its recovery floor. The exposed finale uses chasms and checkpoint recovery. Mandatory solved gates remain open on returns; legacy Double Jump ownership also restores them. The court service passage has to be opened from its upper end. Using the summit passage adds the third stop: refuge → court → summit → refuge. Each move requires a fresh Up press.

The thermal signal uses the existing emitter, portal, firestream and receiver contracts. Low and high slate panels visibly miss the source height. Circuit pipes connect the source and return receiver to the frozen gate. The player can retry placement indefinitely. This is environmental heat routing, not an Attunement check; the optional Rime Key separately requires the later Attunement capability and a fire projectile.

Music: Drifting Memories (Pizza Doggy, already bundled and attributed), mixed at 0.88 cue gain. Houses have snow-laden roofs, cold windows and copper pipes. Hearths glow amber; solved works animate and vent steam. Local lore uses ledgers and footprints without naming the underlying diagnosis.

Validation: `node scripts/validate-frostfell.mjs` runs against an isolated local server. It uses the existing TAS frame API after a stage-specific test setup. See the evidence receipt for exactly which paths and interactions were exercised. `node --test tests/frostfell-runtime.test.mjs` checks permanent hearths, warmth, reward idempotency and the thermal latch. Neither command writes the player's campaign save or deploys the build.

## Player feedback and next proposal

The first player review found this pass too uneventful. That feedback led to the implemented Double Jump ice gauntlet and the Frostfell-only recall below. The broader world-wide military recall remains a proposal. See [Frostfell return proposal](../../frostfell-return-proposal.md), which also preserves the ancillary Gemini design observations.

## Implemented finale (2026-09-10)

The level now spans 15,100 units. Twenty elevated landings carry the player from the court to a summit at y=650, reaching y=700 along the way. Most landings are icy; three dry islands carry checkpoints separated from their timed spike strips. Fixed ice crystals occupy selected far edges. The finale has no portalable slate or wall-cling bypass around its initial 130-unit ascent. The existing court shortcut remains available, with an additional summit passage returning directly to the refuge.

The Muster Engine is activated with Up. A six-second camera sequence turns the gears and swings the bell; its strike changes the atmosphere and shifts the music to Engine of the Frozen Garrison. The upgrade is permanent and applies to Frostfell only. No advance hints announce the surprise. The Rime Key and future aqueduct are now on the supported summit deck; the aqueduct arrival is aligned to that deck. Enemy escalation outside Frostfell remains a separate, unimplemented task.

The TAS validator now branches to find a damage-free input sequence across every landing, replays it, checks recovery from each intermediate checkpoint, verifies deliberate activation, its persistent roster, and two-Blood hulk contact and uses the summit return. It retains the settlement and campaign checks. This proves traversal and recovery, not subjective difficulty.

## Muster activation and folded mine (2026-09-10)

The mine is a deliberate Up entrance at both ends, with arrivals at (330, 0). Holding Left cannot trigger a crossing; this accommodates the folded connection without reversing input or mirroring either level.

Activation adds 11 authored enemies: four pikemen, three frost singers and four shielded rime hulks. Existing enemies and the new roster receive a one-time 55% max-health increase. Hulks are larger and inflict exactly two Blood on contact; singers fire paired frost bolts. Patrol bounds keep the refuge and Nim's shelter out of their walking routes. Defeated ordinary enemies retain rest-reset persistence, and repeated activation/revisits do not stack health or duplicate the roster. No bosses are revived.

`npm run validate:frostfell` covers the prior route, activation timing, input lock, roster/health persistence, actual hulk contact, singers' projectiles and the three-stop cycle. A separate normal-play page holds Left across both mine transitions and checks real music playback after activation. Browser data is isolated from the user's game.
