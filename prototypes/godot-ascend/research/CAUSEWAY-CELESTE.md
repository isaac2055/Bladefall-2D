# Celeste research for future Causeway rooms

Research date: 2026-10-29. Scope: Ascend's native Godot prototype. No maps, mechanics, editor features, art or audio were built or changed. These are design findings and future evaluation criteria, not approved room proposals.

## Main finding

Causeway can develop its own identity around **storing force, releasing it, and changing the shape of the route**. Its existing recoil platforms and hinged arms provide more specific questions than another sequence of lifts and spikes. Celeste supplies useful principles for readable movement and forgiving execution; it does not establish that a particular Causeway layout will work.

## Evidence from Celeste's developers

1. **Make difficult movement tolerant of intent.** Maddy Thorson's [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) describes jump buffering, coyote time, reduced gravity near a held jump's apex, corner correction and momentum retained briefly after a moving platform stops. The common aim is to widen timing and positioning opportunities. Application to Causeway: a player should understand the launch decision without needing one exact departure frame. Evaluate several nearby successful timings and vary starting position; one successful recording is insufficient.

2. **Treat a moving platform as an interaction with a body, not animated scenery.** Thorson's [Celeste & TowerFall Physics](https://www.maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html) explains integer rectangular colliders, per-pixel actor movement, carrying versus pushing, and crush handling. Application: evaluate the whole trip, including leaving a carrier, catching it again, standing near an edge and being pushed into another surface. A visually clear landing can still be physically wrong.

3. **Revise individual rooms in their larger context.** In the [GDC 2017 workshop's written Q&A](https://www.gamedeveloper.com/design/gdc-2017-level-design-workshop), Thorson describes developing gameplay and story together, revisiting room/area/game scales, and cutting or repurposing material. Application: mechanical complexity alone is not a reason to retain a room. Its role in the Causeway progression should justify it. A successful isolated puzzle may still be redundant or poorly placed.

4. **Momentum consistency is a real design concern.** The [official Celeste changelog](https://www.celestegame.com/changelog.html), v1.4 physics section, records fixes involving vertically moving, horizontally steered blocks and wall-jump momentum. Application: distinguish predictable launch rules from accidental differences between approach directions. This is evidence of an implementation concern, not a complete specification for Celeste's moving blocks.

Source limitation: GDC Vault redirected to a maintenance page during this pass. The developer's written Q&A was readable; I did not watch or transcribe the talk, inspect Celeste's retail room files, or claim exact chapter-room reconstructions. The recommendations below are my synthesis of the accessible sources and our code.

## What Causeway actually has

Inspected `data/world3.json`, `scripts/causeway_devices.gd`, `scripts/core.gd`, native authoring generation, the editor model and server. These establish implemented behavior; this research did not run new gameplay proofs.

| Existing system | Source-backed behavior | Design implication |
| --- | --- | --- |
| Recoil platform | Standing normally and holding Down loads it; releasing the load triggers its rise. A resting lantern or combat actor can also supply weight. Default depth is three 8px cells, loading time 30 simulation frames, release speed 120. Partial-charge release speed depends on the square root of the charge fraction. Obstructed movement jams. | Charge amount can be a meaningful decision. Do not assume maximum charge is always best, or treat charge duration as a linear launch-height control. |
| Shared lift momentum | The core stores recent solid movement and applies configured horizontal/vertical caps and grace time. | Recoil studies can use the current movement system. Measure actual reachable landings before assigning distances; do not import Celeste measurements. |
| Hinged arm | Striking its hub advances right → down → left → up. An obstructed destination rejects the turn, including player, lantern and solid obstruction checks. The pose changes discretely. | Its useful decision is choosing which shape serves the current journey. It is not a continuously rotating ride, and the code does not carry the player around a circular arc. |
| Brute / braces / moving solids | Brutes commit to attacks; brittle barriers can open on impact. The solid-motion system also interacts with combat bodies. Armor cracking and grounded stamp waves are present. | An opponent can alter traversal space. Treat this as a separate, later design family: simultaneous combat and launch timing can obscure the lesson. |
| Existing return shards | Workshop finish rules support one or all shards, reset unbanked pickups on retry/death, and bank completion at the flag. | Required pickups are an available and user-approved way to enforce visiting route locations. They establish visits, not use of a particular machine or action. |

Two existing Causeway examples deserve a close look before future proposals:

- **Borrow Only Enough** (`cl3-bank-b39`) already asks how much rise clears both a landing and overhead teeth. Its authored hint explicitly removes dash as the solution. Future recoil work should develop that idea rather than duplicate it.
- **Door Becomes Stair** (`cl3-bank-b11`) already asks which arm shape serves a low outward trip and a high return. New hinge studies need a different consequence or dependency, rather than another cosmetically different return staircase.

## Important editor distinction

The native authoring generator supports recoil platforms, hinge arms and combat configuration as mechanism objects. The simple browser editor currently targets `levels/world4.tscn` and its palette does **not** expose those Causeway mechanisms. It can place existing workshop lifts, blocks, refills, springs, pods, bells, stakes, gates, phase branches and shards.

Therefore “implemented in the game” and “available for the user to tidy in the simple editor” are different states. If future Causeway studies are expected to be editable there, the mechanism controls and room access need explicit editor support. No editor expansion was made during this research.

## Design guidance for the next proposal stage

These are criteria, not room layouts:

- **State the physical question first.** What must the player understand: stored force, release timing, a changed surface, or preparing a later return? Choose one main question before adding support objects.
- **Give preparation a visible consequence.** The player's load or turn should explain the later movement. Keep hub, relevant landing and obstruction readable from a safe observation position where possible.
- **Develop dependencies rather than serial errands.** A stronger combination makes the first action change what the next action can accomplish. Two unrelated machines on consecutive ledges do not create that relationship by themselves.
- **Separate understanding from precision.** Teach a machine's behavior with forgiving execution before asking for tighter movement or multiple dependencies. Keep ordinary-input solutions as the baseline unless advanced movement is deliberately taught.
- **Use force routes deliberately.** Required shards can require a far-bank visit or a return; place them at meaningful route locations and show progress. If a room's teaching claim is “use recoil,” also test whether all pickups can be collected without recoil. Do not count the pickup requirement itself as proof of the movement lesson.
- **Allow useful shortcuts.** An alternative that still exercises the intended idea may be a good route. A direct jump that removes the whole idea needs a design decision. Do not add hazards to every alternate path by reflex.
- **Keep retry behavior part of the design.** Specify initial charge, arm pose, pickup inventory and relevant object positions. Do not inherit campaign persistence accidentally into a standalone checkpoint.
- **Preserve individual checkpoints.** Connections and world finales are outside this research request.

## What would count as evidence later

For each proposed room, specify its question, starting state, intended consequence, plausible bypasses, and reset behavior. Only after building is authorized should we measure movement and test:

1. A complete ordinary-input solution from the real spawn, with the actual finish rule.
2. Several successful nearby timings and starting positions.
3. Attempts to collect every required item and finish without the featured mechanism.
4. Relevant state changes disabled or frozen, alongside a positive control proving the test can find a legitimate route.
5. Death/retry and safe machine reactivation after a failed attempt.
6. Source/native/editor persistence and the actual packaged application.
7. Human clarity and enjoyment; automated completion cannot prove either.

No exact launch distances, new room count, future layouts or playability claims are established by this research.
