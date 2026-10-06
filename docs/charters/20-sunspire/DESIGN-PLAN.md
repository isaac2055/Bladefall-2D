# Sunspire Palace (stage 20) — refined 2026-09-24 (7.200.0)

Act Two's last region, and the end of the act. The top of the mountain in full sun: white marble
and gold, too bright to look at. The palace is drowning in the colony's water — fountains run
over, the gardens are green in a dry country — and sick servants in gold masks scrub the gold.
Every dial in the house reads a quarter to four. It ends with the King in Daylight, the hydra you
set free coming up out of the sea, and the ride away.

**Code:** `public/bladefall-sunspire.js` and `public/bladefall-sunspire-art.js`, registered with the
Act Two core. Besides the usual registration lines, one new page line: the `dayking` row in the enemy
table (index.html). The King is spawned
by the region, not by a campaign boss key, so Act One's King code (`kingRetreats`, `bossArena`)
never touches him.

## Light is a portal noun

The King's mirrors and windows throw shafts of sun that burn whoever stands in them (0.6 s in the
light, then a measure; 1.2 s before the next). A shaft that falls on **slate** can be caught in a
mouth and let out of its twin: the region traces each shaft as a ray through the level
(`trace`) — solids stop it, a mouth of a complete pair takes it in against its face and lets it
out of the twin along the twin's normal (as the engine throws a body: a floor mouth straight up,
a wall mouth straight out across the room), a seal takes it, the knight or an enemy stops it. Friendly followers do not plug puzzle rays. No beam had ever
passed through a portal in this game; this is the region's own code, on `G.cratePortals`.

## The shape (11,800 long)

| Room | x | Idea | Answer |
|---|---|---|---|
| The Sun Court | 0–2700 | the broken Sun Gate behind you; gardens, cypresses, runnels of wasted water, a servant in a gold mask (LISTEN). A King's mirror throws a shaft onto a slate slab; the garden gate's sun-seal hangs dark over another slab, under the colonnade | **floor to floor**: a mouth in the light, its twin under the seal; step off it and the light goes up into the seal |
| The Hall of Hours | 2700–4600 | the Hour Door's great dial across the hall (it reads a quarter to four); a window's shaft on a slate slab; a slate panel low on the Hall's arch | **floor to wall**: the light leaves the arch and crosses the hall onto the dial. Forsaken: three of the sick come in behind you |
| The Aqueduct Crown | 4600–8000 | the King's cistern and its sluice tower; the Crown's mirror throws a shaft onto a slab; the arch's slate panel is high (360–480), out of every jump; a ring beside it | **floor to wall, from the Chainhook**: hang from the ring, let go onto the panel, set the twin. The light crosses the Crown onto the sluice's seal. The water goes home: down the conduit, down the mountain, to the tents (you can see it run on the conduit in the distance) |
| The Flume | 8000–8900 | the aqueduct's last span: full, its current carries you back to the lip, and it is 900 long | drained, its bed is the road to the throne |
| The Throne of Noon | 9000–10700 | the King in Daylight (below) | — |
| The Sea Terrace | 10700–11700 | the hydra | ↑ CLIMB ON |

## The King in Daylight (owner decision 1; the plan's two-sides rule)

- **Untouched.** He is a `portalGate` boss: the engine turns every blade (`bossDeflect`) unless he is
  exposed. He is exposed only while something touches him on the side away from you — a sick hand
  on his back, or sunlight you have caught and let out again (his own windows' light does not count).
  A blow that lands then is a **bloom**: a white flower opens on his gold. Six blooms, two per hour.
- **With the colony:** one at a time, a sick ally (or Oren) goes round to his far side and lays a hand
  on his back; he throws them off when he blinks or flares. A reaching helper commits to one side and must
  actually reach him; moving across the King no longer teleports the helper to the other side. They are knocked down, never killed.
- **Alone:** catch the hour's shaft on its slab, set the twin low on either door's slate panel; the
  light crosses the hall at his height. Fight from the far side, so the light is on his back. He
  can blink behind you, so the geometry keeps changing. *Much harder*, as the owner wanted.
- **His moves:** the glove (a telegraphed sweep, reach 170); **the blink** — a ring of light on the
  floor behind you, then he is standing in it (his Act One blink-rings were dead code; these are the
  first the player sees); from morning, **the flare** (a telegraphed burst, radius 200).
- **The sun climbs** (dawn → morning → noon) at blooms 2 and 4: the windows' shafts move and multiply,
  the shade shrinks, the mouths you set are lost in the glare, and he goes back to the throne and
  lifts his arms to the sun for 6.5 s — the time you have to catch the new light. During rise/climb the shafts are dim, harmless previews so portal setup does not itself burn
  the knight; enemies remain active. Blink now gives the full attack windup. The hour reached
  holds through a death (latched, like the Foundry's acts); you come back at the flume.
- **On the forsaken road the sick fight for him:** two come in at each hour (`e.zealot`: no bell
  drives them, none stops them). Light you route through them burns them.
- **He does not run.** He sits on the step of the throne and takes off the glove; the hand is all
  flowers. "Every dial in this house says a quarter to four. I had them cut that way. I wanted it
  to be morning a little longer." With the colony, the sick sit on the steps around him and Oren
  puts his hammer down; forsaken, the sick who fought for him put their cups down beside him.
- Flowers matching the saved hour return on reload/death. Victory reload keeps the yielded King
  visibly seated with six flowers and the sea door open, rather than removing him.
- The great mirror behind the throne shows the knight a beat late (an Act Three seed).

## The end of Act Two (owner decision 6)

The sea door opens. On the terrace the hydra comes up over the balustrade — **boss music**
("Chains of the Deep") — and **does not strike**. Its three heads speak: you broke our chains, so we
came to tell you; *the one you left on the beach did not stay on the beach — it walks your roads
backwards, and it does not stop; where it passes, the echoes of the fights you won get up again.
Climb on. We will carry you back to the island.* The middle head lowers: ↑ CLIMB ON. A 1.8-second walk-and-hop boarding animation puts the knight onto the lowered head. The ride
(13 s, "Passing the Flame"): the hydra swims west with the knight at the root of its middle neck,
the Sunspire going away on its mountain. **END OF ACT TWO / ACT THREE / The Echoes** —
`meta.actTwoDone`; Continue returns to the title (Act Three is not built).

## Numbers that are load-bearing (tests/sunspire-stage.test.mjs)
- Every lock is traced with the region's own ray code, over **every** mouth position the engine
  allows: floor mouths anywhere the knight's feet overlap the slab, wall mouths at every height the
  knight can cling to the panel (`p.y + p.h·0.4`). All reach their seal.
- No shaft lights a seal by itself; only the lock shafts fall on slate (the heat shafts do not).
- The Crown's panel (360–480) is out of every jump (147); its ring (470) is in hook range from the
  floor, and its hang puts the knight level with the slate.
- From either throne door, every hour's routed light crosses the hall at the King's height.
- The full flume is 900 long (> 800): it gates on the sluice, not on width.

## Presentation
- Palette: marble `#ece6d8`, gold ramp, slate the one dark stone (blue-grey, rune-cut); the King's
  robe is cloth of gold with a white mantle and an ink outline, so he reads in his own white hall.
- Music: "White Marble Palace above the Clouds" (−21.65 LUFS) on the road; "The Fallen Champion Duel"
  (−21.26) for the King; "Chains of the Deep" when the hydra rises; "Passing the Flame" (−21.26) for
  the ride.
- Rest: the Servants' Fountain. Checkpoints: past the garden gate, past the Hour Door, at the flume's
  far end (the Throne's door), the terrace.
- The first shaft lands on the first slab: no signs; the slate is the only dark stone.
- Routed rays have a dark teal edge and moving highlights, distinct from warm natural shafts.
  Charging seals show a filling rim. The King's flare draws its actual circular reach and floor
  extent; his leftward glove animation now reaches in the direction of the attack.

## Refinement verification (7.200.0)
35 focused Sunspire/Path/Colony tests cover lock rays across supported mouth placements,
route/choice integration, fixed-side helper contact, saved bloom presentation and boarding.

Targeted browser fixtures opened all three locks using portal input (wall-contact positions
were set for the Hall/Crown), checked harmless setup light versus live damage, and landed
native sword hits with routed light on the opposite side. Two blooms entered morning; reload
restored that hour and two flowers. A victory-latch fixture restored the yielded King with six
flowers and an open sea door. Boarding moved the knight onto the lowered head, then the ride
reached the Act Two ending. Arrival, routed light, flare and boarding renders reviewed.
No uninterrupted palace traversal or complete newly balanced solo/assisted fight is claimed.

Historical 7.192 evidence covered the hook-to-panel route, full scripted fights, seams and
story dialogue. Its solo bot required artificial heals; that is not evidence of current
human-play balance. Owner playtest remains necessary for the refined solo setup windows.

## Not yet done
- The owner's playtest (the solo fight's difficulty; whether the light rule reads without a sign).
- Co-op through 16–20. Act Three.
