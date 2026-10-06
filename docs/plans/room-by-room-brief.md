# Room by Room: brief for building one region

You are building **one region** of *Bladefall · Room by Room*. This is the whole game rebuilt in the Precision Core as linked screens, after Merge Pitch A. The owner, Isaac, judges a region by its first minute of play. Work slowly and well.

## Read first

1. **`docs/plans/room-by-room.md`**: the whole plan, the standards and the tools. Read all of it.
2. **`scripts/rbr-src/01-outskirts.mjs` and `scripts/rbr-src/01-outskirts.tapes.json`**: the finished reference region. Copy its shape: header comment, builder use, room fields, people, quests and keepsakes.
3. **`public/bladefall-rbr.js`**: the manifest, `addRegion`, and the region-level `folk`, `props` and `palettes`.
4. **`public/bladefall-rbr-view.js`**: what the view draws and does. Skim it, and do not edit it.
5. **The Precision Core**:
   - The header of `public/bladefall-pcore.js`, with its tile glyphs in `parseRoom`.
   - The header of your region's device module(s): `public/bladefall-pcore-dev-*.js`, `-foes.js`, `-combat.js` or `-portals.js`.
6. **Your region's existing precision part**, if it has one (`public/bladefall-pcore-part-NNN-*.js`, with design notes in `docs/design/precision-parts/`). Use it to learn how the device is authored. Owner clarification (1 Oct): reuse some or most of these rooms where they make a cohesive full level. Preserve connected transitions, pacing, regional story and optional quests.
7. **The base game's version of your region**:
   - Its section in `LLM-HANDOFF/03-LEVEL-BY-LEVEL.md`, and `docs/charters/` if it has a folder there. These give the room names, people, story beats and boss.
   - Its quest: the entry in `public/bladefall-side-stories.js`, and its row in `docs/plans/campaign-quests-and-precision-integration.md` (the physical route proposed for each story).

## What to build

| Item | Base region | Fractured region |
|---|---|---|
| Main rooms ("the road") | 12–14 | 10–12, harder |
| Optional quest branch rooms (per quest) | 2–3 | — |

- **Name the road's rooms after the base game's rooms and places.** When a base room becomes two screens, give each its own name (for example "Cracked Road", then "The Hollow Mile").
- **The quest branch is harder than the road.** It is the optional challenge.
- **The device:** one new device for the region. Introduce it alone, in the room after it is first seen. Then chain it, then combine it with earlier things, then finish with the region's synthesis room. Use only devices that already exist in the core and its modules.
- **Earlier verbs** stay in play, but each room's question is about this region's thing.
- **The kit:** set the region's `kit` from the table in the plan.
  - A verb granted mid-region (the Oathblade in Black Woods) is locked in the rooms before the grant: give those rooms `lock:[...]` with the extra verb.
  - The grant itself is a room event the player can see: a person or a prop, and one line.
- **People:** the base game's people for this region, standing where the story has them.
  - Lines are one to three natural sentences in each person's voice. They are practical, sometimes funny or private, never exposition or a list of instructions.
  - A person who reappears ahead must be seen leaving: use `leave:'right'`.
  - Add each person's look to the region's `folk`. The keys are `cloak`, `trim` and `skin`, plus one of `hood`/`cap`/`helm`, and optionally `spear`/`staff`/`flame`.
- **Quests: optional, never needed for the road.**
  - **A branch quest:** a room on the road has `side:'up'|'down'|'left'|'right'`. The quest's `rooms` play from there, and the last one returns to `back:{c,r}` (open ground near the side opening).
  - The keepsake object is a `*` in the last quest room (or the one before it), on the quest's own route.
  - The giver has `quest:'<id>'`, a `line` and a `lineDone`.
  - Show the outcome too: a region prop named `'<kind>@<keepsakeId>'` is drawn instead of `'<kind>'` once that keepsake is held.
  - The keepsake has an `id`, a `name`, and a `gives` sentence. A base region's keepsake: "<what you see change>. In the Fractured <Region> it opens <Name>'s echo."
  - **A bearing quest** (pickups set off the road, like Mara's) is fine where the story suits it.
- **A boss** (regions 3, 5, 7, 9, 11, 13, 14, 16, 20) is a set piece of two to four rooms at the region's end.
  - Its solution defeats it. Use the existing foe and combat actors (`bladefall-pcore-foes.js`, `-combat.js`, Part IV's "Living Stair" and "Stepping Ram") and the region's device.
  - If a boss truly needs new code, write a new device module in your own files, `public/bladefall-pcore-dev-rbr-<key>.js` (plus `-view.js`), following the device pattern in the core's header. Then say so in your report, because the page's script list is a shared file.

## Files you may write (and only these)

- `scripts/rbr-src/NN-<key>.mjs`: your source.
- `scripts/rbr-src/NN-<key>.tapes.json`.
- `public/bladefall-rbr-NN-<key>.js`: generated with `node scripts/rbr-src/gen.mjs NN`. Never hand-edit it.
- Optionally, `public/bladefall-pcore-dev-rbr-<key>.js` and `-view.js`.

**Do not edit any other file.** Other agents are building other regions at the same time. That includes the core, the view, `bladefall-rbr.js` (its `FILES` list), `precision.html`, `sw.js`, tools, docs and other regions. If you need a change there, describe it exactly in your report.

**Do not run git commands that change anything.**

## How to work

- **Author with the builder** (`scripts/rbr-src/build.mjs`) or literal rows. Every row must be exactly the room's width (40 by default). Floor is usually row 18 and spawn row 17. Room ids are `<letter><NN>-<slug>`.
- **Find tapes** with `node scripts/rbr-find.mjs <room> --acts <set> --save`:
  - Use the smallest action set that solves the room (`jump`, `dash`, `climbdash`, `blade`, `all`), so the tape reads like ordinary play.
  - Add `--via c,r` waypoints for stakes and the like. Add `--side` for a side exit, `--shard --as bearing` for a bearing detour, and `--avoid shard` to keep a road or side tape off a pickup.
  - A hand-written tape is better when the search's tape looks erratic.
  - Run at most two searches at a time; the machine is shared.
- **Hunt skips:**
  - Every room that *introduces* the device must pass `node scripts/rbr-skip.mjs <room> --without <event> --plain`. The event names are in the core's `emit(g,'…')` calls and the device modules.
  - For combination rooms the hunt is advisory. List known plain skips in your source header.
  - Gate on height, poisoned faces and footholds that are the only surface. A hyper flies about 30 tiles, so gap width never holds.
- **Verify:**
  - `node scripts/verify-rbr.mjs NN` must say "all passed".
  - It also checks that the knight can stand still at every spawn for a second, and that every tape still finishes when started 14 frames late (the real view idles first). Never put a spawn touching thorns. A room whose hazards run on a beat (bows, timed foes) uses `study:true` so it waits for the first input.
  - Play the region through the real view with `node scripts/rbr-shot.mjs <your scratch dir> play:NN`. **Open and look at every screenshot**, and fix what reads badly: walls of dead rock, clutter, unreadable hazards, a person standing in a wall, a line over the hint.
  - For each branch quest, run `node scripts/rbr-branch-check.mjs <dir> NN <questId>`. It must print BRANCH OK.
- **A room is not finished** until it has a name, a `hint` that names a rule (never a sequence), and a `question` (one sentence: the question the room asks).

## Report back

- The room list: name, what it asks, and which device step it is.
- The quests and keepsakes.
- Known skips.
- The verification results.
- Exact requests for shared files: the `FILES` entry, any new script tags, props or people the view should know about.

## Fractured regions (21–40): extra rules

A Fractured region is the echo of base region N−20, after the fall. It is the same places, broken.

- **Read the charter** in `docs/charters/<NN>-fractured-<key>/`. It gives the echo's concept, its entry kit, the owner's cuts, and the echo's boss (for example, the Fractured Outskirts' three-bell Mile Sentinel).
- **Read the base region's Room by Room source**, `scripts/rbr-src/<N−20>-<key>.mjs`, so the echo answers it. Rooms with the same names come back changed: fewer footholds, more of the device, and earlier devices returning in combination.
- **Kit:** everything the base campaign has granted by the end of region 20 (`['dash','strike','parry','portal']`) unless the charter cuts something. For example, the Fractured Outskirts keep "no weapon", so lock the strike there.
- **Size and difficulty:**
  - 10–12 road rooms, each with three to five linked decisions and few resting places.
  - A room is about 10–25 seconds of successful play.
  - Palette `fractured`. A region-specific palette goes in `palettes`.
- **The echo branch (the reward for the base quest).** It is one quest, and it is the person's echo:
  - It has `needs:'<base keepsake id>'`, so its side door is sealed (violet void) unless the player holds that keepsake. Every base keepsake id is in the base region's source, `quests[].keepsake.id`.
  - It has two or three rooms, harder than the road, ending with a `*`.
  - Its own keepsake is a **remembrance**: `{id:'<who>-remembered', name:'<Name>, remembered', gives:'<one line of what is remembered>. Shown at the end.'}`.
  - The echo person stands at the end of the branch, with `quest:'<id>'`, a `line`, and a `lineDone`, in a quieter, changed voice.
- **The boss** is the charter's echo boss, built as in the base brief: a two-to-four-room set piece from existing actors and the region's device, or a new device module in your own files.
