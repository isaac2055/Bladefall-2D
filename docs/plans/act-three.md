# Act Three — the Echoes (started 2026-09-24, 7.201.0)

Owner's direction (2026-09-24): require all rift shards and make it clear they need collecting;
put them behind dialogue trees, quests, hidden spots and optional alternative routes; once all
are held, the Act Three levels open — harder, darker versions of every original (Celeste
B-sides), each with one C-side section. Start with the Outskirts: no abilities, the Muster
applies, completely reworked; its locked-up enemy is the C-side, played as a puzzle to learn — a
boss with learnable patterns (Hollow Knight, Dark Souls). Level Select: one bar for the twenty
Fractured regions in place of the two extra screens.

The story it rests on (Act Two's ending, owner decision 6): the Echo stayed on the Throne's beach;
it walked your roads backwards; the hydra carries you back to the island to find it.

## The rift shards (`public/bladefall-rift-shards.js`)

Twenty, one per region of Acts One and Two. Never on the road. The first one found explains itself
on a card; each after says its region and the count ("RIFT SHARD · Black Woods — 3 of 20"); the
ledger (title screen ✦ button, and straight after END OF ACT TWO) lists every region, what you hold,
and a hint for each missing one. With all twenty, the ledger's button enters Act Three.

| Region | How | Where |
|---|---|---|
| The Outskirts | route | the Sealed Recollection above the Watcher's Cut (6830, 515), a wall-jump return climb (Olan is a quiet v4 figure and cannot be asked) |
| Black Woods | route | the Lying Wood recollection's optional route (9430, 605) |
| Broken Causeway | quest | Release the Causeway (Oren) |
| The Updrafts | route | the Needlewind's dead-end branch (9020, 900) |
| Hollow Marksman | quest | The Open Watch (Daro) |
| Ruined Keep | hidden | the masked belfry (16810, 1080) |
| The Warden | route | the sealed cell's optional route (5480, 805) |
| Frostfell | quest | Kindling the Sky (Ilyra) |
| Frost Sorcerer | route | the petitioners' gallery (11370, 200) |
| Emberdeep | quest | The Courier's Proof (Sera) |
| Ember Colossus | hidden | where the Furnace General was cast (16150, -100) |
| The Inversion | hidden | the ceiling sanctum (520, 262) |
| The Void Tyrant | hidden | the refugee's roof loft (15900, 260) |
| The Abyss King | hidden | the Throne's beach, above the tide (18370, -900) |
| The Deep Line | route | the line that remembers (13700, 90) — the secret region itself |
| Thunder Cliffs | hidden | past the end of the yard, in the rigging (moves with the ship) |
| The Landing Shores | dialogue | the violet silk on the jetty's nails (LOOK) |
| The Colony | dialogue | the woman by the gate: "What did it leave behind?" |
| The Path to the Palace | route | a new ledge below the Hydra Overlook's lip; the first ring takes you back up |
| Sunspire Palace | dialogue | the servant in the gold mask: "What did it leave?" |

A shard someone holds is its own conversation (its own attitude key): choosing another line leaves
the question open for the next visit. Hidden and route shards sit at the existing Sealed
Recollection / vault-key / secret-cache spots, which were already authored as reachable
return-visit places. Level Select runs keep their own shards and never write the save.

**Not yet verified in play:** the fifteen Act One placements were chosen at existing designed spots
but not each walked to in the browser; the four quest shards depend on those quests completing.
Verified: a dialogue shard (Sunspire's servant, wrong answer then right), a world shard (the
Overlook ledge, down and back up by the ring), the first card, the ledger, the gate.

## The Fractured regions

All twenty are constructed and refined as of7.220.2; table versions below record original
construction. Per-region charters record refinement and verification limits.

Each is a new stage registered with the Act Two core's region registry (it owns seams, arrivals,
foes, art). Rules: the original's road, remixed and made exact (B-side), darker; the original's
kit at that point of the journey; the Muster applies; one C-side section, short and strict, a
puzzle to learn. Some will have bosses; some will not.

| # | Region | Status |
|---|---|---|
| 21 | The Fractured Outskirts | built 7.201.0 (`docs/charters/21-fractured-outskirts/DESIGN-PLAN.md`) |
| 22 | The Fractured Woods | built 7.202.0 (`docs/charters/22-fractured-woods/DESIGN-PLAN.md`) — C-side: the Mirror Thicket, climbed on the beat of the wind |
| 23 | The Fractured Updrafts | built 7.203.0 (`docs/charters/23-fractured-updrafts/DESIGN-PLAN.md`) — the thermals breathe; C-side: the Lung |
| 24 | The Fractured Marksman | built 7.204.0 (`docs/charters/24-fractured-marksman/DESIGN-PLAN.md`) — the region's own watch; C-side: the Tallyman, a pattern boss (the count) |
| 25 | The Fractured Causeway | built 7.205.0 (`docs/charters/25-fractured-causeway/DESIGN-PLAN.md`) — masses; C-side: the Iron Echo, a pattern boss (bait the committed charge) |
| 26 | The Fractured Keep | built 7.206.0 (`docs/charters/26-fractured-keep/DESIGN-PLAN.md`) — your own twin mouths; C-side: the Belfry (throw the bell-stone into a swinging cradle) |
| 27 | The Fractured Warden | built 7.207.0 (`docs/charters/27-fractured-warden/DESIGN-PLAN.md`) — the dark Gallery's turnkeys, thin air over the void, a mouth that rides the cage; C-side: the Sentence (dash through its rush; then its own rush thrown through your mouths) |
| 28 | The Fractured Frostfell | built 7.208.0 (`docs/charters/28-fractured-frostfell/DESIGN-PLAN.md`) — the Toll's tollmen (counter the thrust), thin ice over meltwater, the double jump remembered, the thawing Stair; C-side: the Rimeguard (a guard only its own countered thrust opens) |
| 29 | The Fractured Sorcerer | built 7.209.0 (`docs/charters/29-fractured-sorcerer/DESIGN-PLAN.md`) — a bridge frozen only on the beat of the stream you route, the band intake; C-side: the Mirror (its spell back through your mouths, then countered, then both) |
| 30 | The Fractured Emberdeep | built 7.210.0 (`docs/charters/30-fractured-emberdeep/DESIGN-PLAN.md`) — the Pour Schedule walked backwards, the Slag Stair, the post with no one to command; C-side: the Purge (a sweep faster than a run, survived on the slabs it cools) |
| 31 | The Fractured Colossus | built 7.211.0–7.211.11 (`docs/charters/31-fractured-colossus/DESIGN-PLAN.md`) — the Anvil's strike, the Casting Line, the Shaft's moulds over rising lava; C-side: the Warm Machine (refuse the pour, counter the slug, strike from above) |
| 32 | The Fractured Inversion | built 7.212.0 (`docs/charters/32-fractured-inversion/DESIGN-PLAN.md`) — the flip at the anchor, the Crossings (walk whichever floor holds), the Gulf (under the spur, over the pillar, in one flip), the Weave; C-side: the Keel (strike from the side it shows, flee the sweeps) |
| 33 | The Fractured Tyrant | built 7.213.0 (`docs/charters/33-fractured-tyrant/DESIGN-PLAN.md`) — the Torn Road, the Blinking Chain (tears chained in the air), the Spent Line (both mouths on the face, thrown over the teeth); C-side: the Tearer (ride its tear through it) |
| 34 | The Fractured King | built 7.214.0 (`docs/charters/34-fractured-king/DESIGN-PLAN.md`) — the First Mark, the Return (trade places back up to the gate), Two Marks at Once; C-side: the Weighed Crown (pulled onto your echo; trade and strike) |
| 35 | The Fractured Line | built 7.215.0 (`docs/charters/35-fractured-line/DESIGN-PLAN.md`) — a cart ride: the cut fork, the falling bridge, the trick gaps (a clean 360 buys the next); C-side: the Black Line (pace the cart to a travelling light) |
| 36 | Fractured Cliffs | built 7.216.0 (`docs/charters/36-fractured-cliffs/DESIGN-PLAN.md`) — the Chainhook from the wreck's windlass, the Iron Road (follow the lightning along the rings), the Breakers (hang while the sea passes); C-side: the Last Head (strike its lock from above) |
| 37 | Fractured Shores | built 7.217.0 (`docs/charters/37-fractured-shores/DESIGN-PLAN.md`) — the Gut and the Hull by rings, the Flats at Flood (refuge to refuge on a drowning tide); C-side: the Sunguard's echo (its back, on the toll) |
| 38 | The Fractured Colony | built 7.218.0 (`docs/charters/38-fractured-colony/DESIGN-PLAN.md`) — the Watch (tent to tent under the lamps), the Dry Spring (rings, the conduit's lamp, the tap); C-side: the Ringer's echo (over his head, behind him) |
| 39 | The Fractured Path | built 7.219.0 (`docs/charters/39-fractured-path/DESIGN-PLAN.md`) — Noon Road and the Burning Stair (shade to shade), the Overlook (rings under a walking beam); C-side: the Sun Gate (strike the windlass lit, leave the light) |
| 40 | Fractured Palace | built 7.220.0 (`docs/charters/40-fractured-palace/DESIGN-PLAN.md`) — the Sun Court and the Hall of Hours (send the light through your mouths); C-side: the King in the Dark (struck only in your light); the end of Act Three |


**Echo bodies (7.205):** `spawnEnemy` scales an echo's enemies by the SOURCE region's depth and rolls
no random elite in an echo (each echo's init sets `G.actTwo.echoSource`). Before, every body in stage
21+ had ×3.1–3.5 its original's health on top of the Muster's ×1.55.

### Music for the echoes
Only two unused score tracks remained after the Woods, so an echo's road music is **its original's
own theme, walked backwards**: 8% slower and lower, the top end dulled, a long echo under it
(`fractured-<original>.mp3`, made by `scripts/fractured-music.py`, then −21 LUFS). The
spare Aerth tracks go to C-sides.

Campaign and Level Select follow the originals: Outskirts, Woods, **Causeway, Updrafts, Marksman**,
Keep, Warden, Frostfell, Sorcerer, Emberdeep, Colossus, Inversion, Tyrant, King, Line, Cliffs,
Shores, Colony, Path, Palace. Stage IDs retain construction identity for saves (Causeway25,
Updrafts23, Marksman24); `nextEcho()` orders by source region. Corrected in7.211.4.

### The shared core (`public/bladefall-fractured.js`, 7.202.0)
What every echo shares, so each module is only its own rooms and its C-side: `registerEcho(source,
stage)` / `echoFor` / `nextEcho` (the Fractured tab and the seams read it); `setKit(ids)` and
`grantBlade()` (session capabilities, never the save's); `muster()` (roles, frontal shields, the
recall baseline — call it at the first frame, after the enemies exist); `checkpoints`; `seamOn()`
(walk east into the next built echo); `endCard()` (the card naming the next echo when it is not
built yet); `JUMP` / `reach(dy)` (the measured single jump); art helpers (`sky`, `bands`, `ash`,
`seams`, `vignette`). Registering a new echo everywhere is mechanical: campaign row + blueprint,
progression zone + connector, world node + route, zones seam, recovery site, renderer
`SUPPORTED_STAGES`, `CUSTOM_LEVELS`, `LEVEL_MUSIC`, `V4_LAST_STAGE`, sw, build-deploy, attribution.
`scripts/register-echo.py '<json>'` makes every one of those edits (each anchor asserted before
anything is written; the argument list is in its header), then `node scripts/repin-stage-counts.mjs`
re-pins the data-module count tests to what the modules report.

## Level Select
Tabs: **Base** and **Fractured** (the NG+1 / NG+2 tabs are gone). The Fractured tab lists all twenty
in the owner's order (spelled "Fractured Frostfell" and "The Fractured Line"); a built echo starts
from its row, the rest are marked NOT YET BUILT. Level Select lets you try the echoes without the
shards (it is for testing); the campaign requires all twenty.
