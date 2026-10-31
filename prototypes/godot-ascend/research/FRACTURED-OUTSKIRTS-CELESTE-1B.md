# Celeste 1B research for Fractured Outskirts

Research date: 2026-10-31. Scope: research only, ahead of a separate proposal/build step. No rooms, layouts, movement, editor behavior, progression, art or audio changed. The target is the existing native **Fractured Outskirts, world 21**, rather than a new side of the 30-room workshop.

## Finding

Celeste's first B-side is a useful reference for **familiar movement with more consequential choices about contact, departure and recovery**. My reading of its layouts is that much of its difficulty comes from reading and executing connected moves, rather than long switch-and-key puzzles. For Bladefall, the useful adaptation is to give the player a preparation decision that changes a later movement opportunity. Merely shrinking an Outskirts landing or extending a sequence of supers would add execution difficulty without necessarily adding a puzzle.

This is a design interpretation, not a statement of the Celeste developers' intent or proof of a required route. Exact future geometry and difficulty remain untested.

## Evidence and limits

- Inspected the [Forsaken City B-side atlas](https://berrycamp.github.io/celeste/city/b), its level-map metadata, and **all 16 full-room images**, including the offscreen portions of scrolling rooms. The atlas groups them into Start, Contraption and Scrap Pit. Its descriptive room names are community atlas labels; debug IDs below are the more useful references.
- The atlas is community-hosted. The room images reproduce the game's authored geometry and are the basis of my visual observations; its labels are not treated as developer commentary. Static images establish geometry, fixture placement and scale, but not exact movement timings, the only possible solution, or what a blind player understands.
- Read Maddy Thorson's [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html), [Celeste & TowerFall Physics](https://www.maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html), and the developer's answers in the [GDC 2017 workshop Q&A](https://www.gamedeveloper.com/design/gdc-2017-level-design-workshop). These establish general principles, not a room-by-room 1B commentary.
- The [GDC talk](https://www.youtube.com/watch?v=4RlpMhBKNr0) is a useful further reference; I did not watch or transcribe it in this pass. I did not play Celeste, inspect its retail executable, or time successful 1B routes. Optional speedrun techniques should not be mistaken for mandatory solutions on the basis of these images.
- Inspected our source definitions, native chapter compilation, loader, movement code and editor scope. The native world-21 compilation exactly matches its source baseline. No new gameplay proofs were run during this research.

## What the first B-side actually offers

The useful progression is visible at several scales. The opening group already combines moving blocks with guarded surfaces. Contraption varies contact, refills and walls instead of repeating one launch. Scrap Pit combines these relationships in larger spaces before the distinct cassette-block ending. This is a reading of the [whole-side map](https://berrycamp.github.io/map/celeste/city/b), not an instruction to copy its room count or overall length.

| Reference | Observation from the full room image | Transferable design question |
| --- | --- | --- |
| [01](https://berrycamp.github.io/celeste/city/b/01) | Two vertical zipper tracks sit in separate pockets; spiked upper faces and a central divider make the available contacts asymmetric. | Which face of the next carrier is usable, and from where should the transfer begin? A carrier can be useful without being a safe standing platform. |
| [04](https://berrycamp.github.io/celeste/city/b/04) | A horizontal zipper route lies below a guarded central mass. Overhead and underside hazards distinguish the low travel space from upper recovery surfaces. | When does the same moving body provide transport, clearance or a launch? Read the obstruction and the eventual exit together. The image alone does not establish a mandatory departure frame. |
| [05b](https://berrycamp.github.io/celeste/city/b/05b) | Refills sit between columns and ledges with differently guarded faces. Their positions matter in relation to the next obstacle. | What should the player have left after reaching each recovery point? A refill should alter a route choice, rather than reward an otherwise unrelated jump. |
| [06](https://berrycamp.github.io/celeste/city/b/06) | Spiked islands, tall narrow walls and a refill pocket replace the previous rooms' moving-block emphasis. | Where can the player pause, recover or change wall contact? Varying resource pressure can deepen a familiar kit without adding another machine. |
| [08](https://berrycamp.github.io/celeste/city/b/08) | Crumble footholds sit among moving blocks, guarded terrain and limited resting space. | Which contact is temporary, and what must be decided before touching it? Temporary support should make preparation meaningful rather than obscure the next destination. |
| [10](https://berrycamp.github.io/celeste/city/b/10) | The full 496×192 image shows moving blocks below a ledge system, an exposed refill, guarded upper lips and an exit beyond the rightmost track. | Can the low journey and upper escape demand different uses of the same space? One-way geometry can distinguish travel from recovery without an invisible rule. |
| [11](https://berrycamp.github.io/celeste/city/b/11) | The full room is 320×720, with horizontal, vertical and diagonal zipper routes distributed along the climb. The small preview hides most of it. | Can several transfers develop one readable relationship? Its length also raises the cost of a late mistake; copying its scale is not automatically appropriate for our appended rooms. |
| [end](https://berrycamp.github.io/celeste/city/b/end) | A quiet approach precedes the blue/pink cassette-block space and red heart. | A closing section can change pace and emphasize one clear rule. The image does not establish the blocks' exact timing. Bladefall's dash-switched phase branches are a different mechanic; copying the music-clock behavior would require separate work. |

## Developer principles that matter here

**Difficulty can coexist with forgiving inputs.** Thorson documents jump buffering, coyote time, gentler gravity at a held jump's apex, corner correction and briefly retained lift momentum. These widen the player's timing or position opportunities. Our inference: make the decision demanding while keeping a readable execution window. A one-frame recording is weak evidence of a good B-side challenge. [Source](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html)

**Standing and clinging are both meaningful moving-body contacts.** The physics article explains carrying versus pushing, riding from a block's side, integer rectangular collision and crush handling. A proposed transfer must account for the whole moving body and surrounding surfaces. A screenshot that looks traversable is not enough. Our dimensions, acceleration and collision rules must determine our eventual distances. [Source](https://www.maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html)

**Evaluate the addition in chapter context.** In the workshop Q&A, Thorson describes revisiting room, area and full-game scales, and cutting or repurposing material when it does not fit. For our extension, a working room still needs to add something beyond the current ending and workshop studies. [Source](https://www.gamedeveloper.com/design/gdc-2017-level-design-workshop)

## Our current B-side

Authoritative sources inspected: `data/world21.json`, `levels/world21.tscn` through `Authoring.read`, `scripts/room_loader.gd`, `scripts/core.gd`, and chapter/section metadata. Native/source parity was exact. The chapter contains **38 authored room definitions**, including passages and optional spaces, and **14 IDs in requiredMainRooms**. These are structural counts, not a count of user-liked rooms.

Its established vocabulary is already different from Celeste 1B:

- **The Ash Verge → The Hollow Mile → Watcher's Ridge** teaches ground-dash supers, repeating a super from temporary support, and recovering a spent dash at a crystal. Supers are explicitly named in the authored hints.
- **The Survey Stone, The Cracked Road and The Gatehouse** already combine temporary runways, commitment and route objectives. A new crumble-and-super chain alone would be repetitive.
- **Muster Yard** already asks for tear, cracked perch, super and refill in sequence. More objects in that order would extend the existing execution test without adding a new dependency.
- **Pass Below the Passing Thorn** adds moving-hook positioning around a sweeper. **Leave the Light Behind** combines moving cover, a mirror/receiver and a gate; it explicitly has zero dashes. The rest of the required main rooms parse with one dash. There is no uniform one-dash requirement across the whole existing chapter.
- **The Centre Bell, The East Bell and Ring It from the Other Side** develop Sentinel movement as traversal. The last of these already asks for an outward action, a return below a crossing and use of the Sentinel's changed position. Another bell/relocated-boss return would need a clearly different question.

There are **no `Z` zipper fixtures or lantern pickups anywhere in current world 21**. Its existing moving-cover puzzle is not a lantern-carrying puzzle. The ordinary Outskirts does contain one in **Leave the Lift for Later**, and the standalone Outskirts workshop develops moving-block relationships extensively. Zippers and lantern carrying are implemented and available, but future Fractured use needs an introduction in context; it should not assume everyone played the workshop. Neither recoil platforms nor Causeway arms need to be imported just to make this extension harder.

The main-road section order ends at **Ring It from the Other Side** (`cl21-bank-f63`) and then **The Broken Gate** crossroads. The raw room array also contains optional spaces and passage previews, so appending to the JSON array is not equivalent to adding playable rooms at the end of the road. Future placement must respect the actual section order, completion requirements and existing optional exits. No placement or completion rule was changed here.

The simple browser editor currently edits world 4's 30-room workshop. It does not presently edit world 21. Any later request to edit these Fractured additions there would need explicit chapter access support; existing palette support alone is insufficient.

## Direction for the later proposal step

These are design families and evaluation criteria, not room proposals or approved layouts:

1. **Prepare a future launch surface.** Develop an already-taught super or moving-body departure by making an earlier action determine which runway or recovery surface will exist later. The preparation should have a visible physical consequence.
2. **Choose the recovery order.** Give one dash, a temporary contact and a useful refill different roles. The puzzle is deciding which resource to preserve for the next leg, not simply collecting a string of refills.
3. **Change the route by using it.** A temporary surface can serve the outward journey but leave a different return problem. Make that change legible and test recovery after a failed attempt. Distinguish it from our existing lift-return and Gallery studies.
4. **Carry first, move freely later.** Existing carrying restrictions can create a meaningful commitment: where to leave the load so that empty-handed movement becomes useful. This must develop beyond workshop rooms 25/27 and the existing moving-cover puzzle; delivery alone is not a new idea.

For any family, retain Fractured Outskirts' taught skills and existing physics. New mandatory hypers, wavedashes or wallbounces would need their own teaching decision; they should not appear merely because this is a B-side. A harder room can ask the player to understand more about a familiar action.

The extension should preserve the existing chapter and give each addition its own checkpoint. The user has requested later puzzle-like rooms at the end, not a combined world finale, replacement of current rooms or new connecting passages. No new room count is selected by this research.

## Evidence needed after building is authorized

- State the new decision and explain how it differs from the relevant existing room.
- Show a readable start and visible consequence before asking for a committed sequence.
- Prove a complete route from the real checkpoint with the intended taught kit and normal stamina; do not silently use test assists or undeclared advanced techniques.
- Try nearby departure times and starting positions, and distinguish a timing failure from a mistaken plan.
- Test the important alternatives: ordinary jump/climb substitutes, unused machine positions, early/late activation, standing resets and item-only bypasses. Use positive controls; a bounded search failure is not a proof of impossibility.
- Check death/retry, machine reuse and item state. Preserve individual checkpoints and the old chapter's progress and exits.
- Verify native persistence and actual app behavior. If editor access is included later, verify that separately.
- Obtain the user's playtest feedback. Neither a successful demonstration nor a harder execution requirement establishes that a room is enjoyable or puzzle-like.

Research artifacts and downloaded reference images are kept in ignored `.cache/fractured-research/`; Celeste art was not added to game assets. No rooms were built or altered.
