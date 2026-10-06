# Part IX · The White Court (levels 91–98)

Built 30 September 2026 (7.254). Files:

- `public/bladefall-pcore-part-091-white-court.js`: the rooms and their tapes, palette `court`.
- `scripts/verify-precision-part-091.mjs`: routes, wrong-strategy families and hunts.
- The device is `public/bladefall-pcore-dev-water.js` and its view (see *Device changes*).

The White Court's verb in the base game is attunement. Its signature is the condenser that freezes a crossing when struck, plus the water wheel and the siphon. The precision mirror is water:

- A **strike freezes** the pool it touches into slippery ice, which thaws on a clock you can see.
- A **condenser** freezes every pool in the room at once, from wherever it hangs.
- **Currents** carry the knight and the lantern.

The mirror rule holds. The Court's condenser is a base-game object the player has already struck on the road, and freezing by the blade is its precision form.

## Shape and difficulty

The part teaches each piece alone, pairs it with one old friend, then crosses the pieces.

| Stage | Levels | What they do |
|---|---|---|
| Teach | 91, 92, 93 | 91 is the strike. 92 is the condenser, paired with the lantern because the lantern is the reason a blade cannot do the job. 93 is currents. |
| Pair | 94, 95, 96 | Each crosses water with one old friend: the lantern, a warder (Gaol jailer) and a portal. |
| Rhythm | 97 | Per-pool clocks. |
| Summit | 98 | A two-room level. Each room is a checkpoint. |

**Intended curve.** Difficulty rises gently, with dips at the teaching rooms:

> 91 (easy) < 92 (easy–medium) ≈ 93 (easy, new sub-device) < 94 < 95 ≈ 96 (medium) < 97 (medium–hard) < 98 (hard)

- 91 is easier than Part VI's *Everything Before* and far easier than Frostfell's close.
- 98 sits a little above *Everything Before*. Each of its rooms is roughly a 95/92 difficulty, with the clocks tightened, so Act 1 can still end near that level at 149.
- Momentum is never required. Where an expert momentum line exists it is listed below as kept or blocked.
- Enemies appear in 95 and 98b (two of nine rooms). A portal appears in 96.

## The rooms

The counts are from `node scripts/verify-precision-part-091.mjs`. "Hunt" is an adversarial beam search that forbids the intended device; every find is replayed from scratch before it counts.

| Level | Room | Question | What fails (checked) |
|---|---|---|---|
| 91 | Still Water | The pool drags everything down to the grate, and it is too wide to jump. What does the blade do to water? | Jump, dash, super or hyper across without the blade (352 tapes, 0 cross). Swim for it, stroking all the way (54, 0). Hunt with no freeze: none. |
| 92 | Hands Full | The light has to reach the far plate, and with it in your hands the blade is useless. What can freeze the pool from up here? | Glide over with the light and no condenser (66, 0). Freeze the pool with the blade, then climb back for the light (30, 0). Hunt with no condenser: none. |
| 93 | Undertow | Two flooded culverts under the court, and the water turns in a ring. Which one runs your way? | Swim, stroke, dive or dash along the upper culvert (48, 0). Hunt that never enters the lower lane: none. |
| 94 | Downstream | The light floats and you sink, and the dam runs to the roof. Who goes which way? | Carry the light down the drain and up the well (45, 0). Hunt in which the light never passes the surface slot: none. |
| 95 | Under the Warder | The warder faces the water, and his roof is too low to leap. Where does the water go when it passes under him? | Over the ice and at his shield (264, 0 fell him). Hunt that never enters the culvert: none. |
| 96 | Down Is a Door | The siphon drags everything to the bottom. What if the bottom were a door? | Jump, dash or swim at the pier without a portal (108, 0). Hunt with no floor portal: none. |
| 97 | Drains | Three drains climb to the door, and the ice lasts a moment. When do you strike each one? | Jump and dash up without the blade (270, 0). Three hunts, each forbidding one basin's freeze (first, middle, last): none. |
| 98a | Refresh | The ice will not last the whole crossing, and with the light in your hands you cannot strike. Where do you put it down? | Carry the light straight across (66, 0). Hunt that never lets go of the light: none. |
| 98b | Two Lanes | The warder faces the water again, and this time it runs two ways beneath him. Which way is yours? | Swim the upper lane (54, 0 fell him). Hunt that never enters the lower lane: none. |

The verifier's hunts run at beam 80 so the script takes about two minutes (129 s CPU, 31 checks). Every hunt was also run at beam 250 and 500 while authoring. `PCORE_BEAM=500` repeats the deep run.

### What the player does and feels

**91 Still Water**

- The first try is a jump. It lands in the siphon and the knight is pulled under onto the grate.
- The hint names the rule. You jump off the edge, cut down, and the whole pool goes white with a crack. You walk out on it.
- The ticks along the top go out one by one. You hop onto the far bank past a thorned lip.
- It is the Court's first "oh".

**92 Hands Full**

- The condenser is next to the lantern on the gallery shelf.
- You strike it, pick up the lantern, and float down onto ice that is already there. You carry the light to the plate and walk out.
- A player who tries the blade first finds the pool thawing under them on the way back up for the light.

**93 Undertow**

- The water under the court turns in a slow ring. The upper culvert pushes you home and lifts you off its thorned floor.
- You dive, and the bottom culvert throws you along and up the far well.
- It is a relaxed ride, a breather after 92.

**94 Downstream**

- The dam runs from the floor to the roof. There is a slot at the waterline and a drain along the bottom.
- You throw the lantern in. It bobs to the dam, slips under the lip and through the slot, and comes up on the far side, drifting toward the plate.
- You dive, walk the drain, and climb the well while the water tries to pull you back down. By the time you climb out, the door is open.
- The first try is usually to carry the light down the drain. It works until the well: you cannot climb with your hands full, and the light will not rise against the pull.

**95 Under the Warder**

- The warder's shield faces the pool.
- You freeze the siphon (91's skill), cross, and drop into the spring. You swim under his walk, surface behind him, and cut before he turns.

**96 Down Is a Door**

- The pier runs from the floor to the vault. Its far face is thorned, and the fixed portal juts out between the thorns.
- The only pale stone is on the siphon's floor. You fire down through the water at it, jump in from the bank, and let the drain take you.
- The fixed end throws you across the thorn field as hard as your fall. The water does not take the height away.

**97 Drains**

- Three basins sit on thorned towers, each one five tiles above the last. Their rims are thorned too, so the only footing is the water, once it is ice.
- The rhythm is the same three times: walk to the edge, jump, dash up and right, cut down as you come over the basin, land on the ice.
- The ice lasts a second and a half, so you cannot stand and think on it. It reads as a staircase you build as you climb.

**98 Glass Court, room a: Refresh**

This is 92 again, with a shorter clock and no second condenser:

1. Strike the condenser, pick up the light, and float down onto the ice.
2. Carry it as far as you can, then throw it ahead. It skids into the trench at the far end and lands on the plate.
3. Jump as the ice goes, cut the water on the way down, and walk out on the new ice.

The feel is a handoff: your hands are full, so you empty them, and the blade does the rest.

**98 Glass Court, room b: Two Lanes**

This is 95 with 93's ring under the warder:

1. Freeze the siphon.
2. Dive to the lower lane and ride it up the well.
3. Hop onto his walk and cut his back.

The warder turns after 60 frames here, not the default 45, because the well lifts you slowly.

## What the sweeps caught, and the fixes (first pass)

**91: the pool was widened twice.**
- At 18 tiles, a hyper reached the far wall and grabbed it under the water.
- At 22 tiles, a hyper plus an up-right dash out of the water did the same.
- Now the pool is 26 tiles. The far bank stands two steps higher, with thorns on its lip, so there is nothing to grab or stroke up to.

**92: the plate and the lantern moved.**
- The plate was one tile from the door, so a knight running at speed slipped through the held door while it was still open. The plate now sits three tiles short of the door.
- A hyper on the shelf could pick up the lantern in flight and glide across the whole pool, which skipped the condenser. The lantern now starts against the back wall, so you pick it up from a standstill.
- The condenser stands beside the lantern, and the thaw is 300 frames.

**94: a device bug.** The current could not carry the lantern into a lantern-sized culvert. See *Device changes*.

**96: the pier now runs floor to vault** (its stone was later cut; see *Second pass*). The first pier could be stood on, and a jump plus dash from its top nearly crossed the thorns.

**97: the basins are three tiles wide, not two.** A hyper passed straight through two-tile basins. They also now drain to their own grates, where before they were free-standing columns.

**98a: the second condenser moved** (later cut; see *Second pass*). It now sits just past the landing point, and the thaw is 170 frames. The route that skips it fails by about 40 frames, and the route that uses it has about 45 frames to spare.

**Search tools snapshot the room grid.** Frozen water writes into `room.grid`, which `pcore-search`'s snapshots share between branches. An early hunt reported a false skip on 92 because of this. The verifier uses its own `huntW`, which saves and restores the grid and ice per branch and replays any find from scratch.

## Second pass (30 September, afternoon)

Six hunts found real skips after the engine settled. Each was fixed in the room; no check was weakened.

**93: dash chains along the upper culvert's floor.** Standing on the culvert floor refills the dash, so down-dashes and short dashes beat the current. The culvert now also lifts a swimmer (dy −60) and its floor is thorned, so there is nothing to refill on.

**94: the lantern was juggled over the dam.** Throwing, climbing the dam face and catching the light in the air lifted it over the top. The room is rebuilt around the fact that the light floats and the knight sinks:
- The dam now runs to the roof.
- The light goes through a one-tile slot at the waterline. A sill in front of the slot lets the current press the lantern level with it.
- The knight goes down a drain under the dam and climbs a well against a downward current (100 px/s). The current beats both the lantern's float and a carrying knight's rise, and you cannot climb while carrying.

**96: a slow exit wall-jumped off the pier.** First off the pier's far face, then off its base. The face and base are thorned now, as is the far bank's face. A second skip wall-jumped into the pier's own stone, and the jump's lift went through the portal and carried a slow exit over the thorns. That stone was cut. The siphon's floor is now the only pale stone.

**97: the basins could be skipped.** Three things did it: a stroke off a basin's corner (the knight's centre just inside the water for one frame), side strikes from the stalks, and wall-jumps off the stalks. The room is now a climbing staircase:
- The basins sit on thorned towers, five tiles apart in height. Reaching the next basin takes a jump and a dash. Two basins apart is ten tiles, beyond a jump and a dash (about eight).
- Thorn rims flank each basin's water, so a corner entry dies on the rim and a stroke never starts.
- The left wall and the exit bank's face are thorned.
- The thaw is 90 frames.

**98a: the second condenser was optional.** Throwing the light onto the far bank and refreezing with the blade after the thaw skipped it. That route was the better question, so it became the room:
- The second condenser is cut.
- The plate sits in a three-tile trench at the end of the pool, so a thrown light stops in it and bounces back off its far wall.
- The thaw is 150 frames.

Two lines that skip the second freeze were kept. Both still answer the question, because the light has to leave your hands either way:
- **Glide and dash.** Throw the light early and follow it. Pick it up again, jump as the ice goes and glide over the water with it. Throw it into the trench and air-dash to the bank. The beam-250 hunt found this; no momentum is needed.
- **Hyper.** Throw early, hyper after the light on the ice, catch it and glide.

So the hunt was narrowed honestly, from "no second freeze" to "never let go of the light", and it finds nothing. The intended line (cut the pool as it goes) is what the pause menu plays. It is the one a first-time player finds, because the thaw arrives while they are still carrying.

## Designs dropped

- **Black Ice** (dash on frozen pools to jump a long pit). Ice keeps speed only on the ground, and air drag takes it away within a quarter second, so the "speed" never reached the pit.
- **Pocket** (strike while swimming to stop in a notch). The notch gives no height over a stroke, so it never became a question.
- **A strike-versus-condenser room** where freezing every pool is wrong. There was always a safe place to wait out the thaw.
- **Frozen waterfalls as climbable pillars.** Floor-to-ceiling columns leave no way round.
- **Downstream over the dam** (knight climbs the dam, light through the culvert). A lantern can be thrown, caught mid-air and re-thrown up any climbable face, so nothing the knight can climb keeps the light out.
- **Drains on the level** (three basins on stalks in a row). Supers and hypers from the ice skipped the middle basin at any width that fits a screen.
- **The pier stone in 96** as a tempting wrong answer. See above.

## Device changes (water module and view)

Each change is a bug fix. `node scripts/verify-precision-devices.mjs` stays green for water. Its one failure, "a deck carries the knight", comes from the hook module and was already failing before these changes.

1. **`WK.drag` changed from 500 to 1500 px/s².**
   - At 500 the drag was weaker than gravity (900), so under water the knight fell at almost full speed. The "slow sink" at 30 px/s, the 45 px/s rise and the lantern's float all failed.
   - The lantern's float now also uses `WK.drag` instead of 600.
   - Measured after the fix: sink 30 px/s, rise 45 px/s, swim 70 px/s. A held stroke rises about a jump, and the lantern floats at the surface.
2. **Splash once per entry.** Bobbing at the surface crosses it every few frames and played a splash sound each time. A splash now waits 20 frames.
3. **The lantern's current is applied down first, then across.** The float lifted the lantern one pixel each frame, which jammed it against the lip of a one-tile culvert. It now slides in.
4. **View:** no surface line is drawn where water meets a rock ceiling. In flooded culverts the line read as an air gap.

## Open points

- The one surface-stroke quirk remains in the water module by design: a knight whose centre is just inside the water for one frame can stroke out. Rooms guard against it with thorn rims or rock around the water, not with a rule change, because Part XVII's tide rooms rely on stroking at the surface.

- 91's pool is about as wide as the room allows. A player who knows supers will still try one first; that is intended to fail.
- Surface-skipping (stroking out of the water the moment you touch it) works on calm water, and on siphons only on a grazing, high-speed entry. The hunts found no route that uses it without momentum. Rooms 91, 92, 95 and 97 use siphon currents of 150–180 px/s, which beat a stroke (105 px/s).
- 98b's warder has `turn:60`.
