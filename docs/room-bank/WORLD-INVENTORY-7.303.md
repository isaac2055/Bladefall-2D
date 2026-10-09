# Survive world inventory — placement planning, 7.303

Read-only inventory of the current shipped local campaign asset, prepared 2026-10-09 UTC. No campaign room, map, route, checkpoint or bank record was changed.

## What this inventory establishes

All 40 Survive worlds are present in `public/bladefall-climb-worlds.js`. The names below come from that asset, not Explore’s differently numbered roster. Base is worlds 1–20; Fractured is 21–40. Counts are **authored main-road rooms**, excluding connector stairways, passages, optional quest rooms, secrets and atlas sockets. A second count includes every room definition in the built world so these categories cannot be confused.

Candidate **A** means the current geometry and saved input route demonstrate a limited challenge (for example, a plain movement road or passive ride). Candidate **B** means an established interaction is repeated with fewer consequential object roles than another named room; it is a review target, not evidence of low human difficulty. A short tape alone is never treated as easy. Frames below are the total length of the stored tape, often including exit padding, not measured completion times. No new simulation or human difficulty rating was performed for this planning pass.

The first nine worlds carry old human difficulty measurements on a **1–10** scale; the current review form uses difficulty /5. Do not compare or convert these automatically. Worlds 10–40 are unrated in the current campaign asset. All projected bank-room fit still needs in-context playtesting.

For at least two bank placements per world, use the named slots as the first review targets, then add a separate checkpointed room where only one responsible replacement exists. Do not remove two teaching rooms merely to hit a quota. No superrooms or world finales are assigned here. Endings may be demanding; post-boss breathers are distinguished from challenge finales so difficulty is not increased by accident.

Important global constraints: preserve each individual room checkpoint; preserve first introductions, bosses and narrative arrival/exit state. Quest entrances, bearings, keepsake requirements, secret doors, atlas sockets and the original exit direction must be transplanted deliberately if their host is replaced. A banked map cannot be dropped into a continuous-world coordinate slot without rebuilding and checking the adjoining seams.

## Progression and complete world roster

The broad sequence is clear in the source: W1 movement → W2 blade/pod/phase → W3 lift/weight → W4 wind/spring → W5 parry/projectiles → W6 cargo/portal → W7 pressure pods/shields → W8 ice/feathers → W9 freeze/thaw → W10 heat cycles → W11 moulds/anvils/belts → W12 gravity → W13 spent footholds/tears → W14 echo/wake/crown → W15 carts → W16 ropes/decks → W17 tide/floats → W18 watch light/smoke → W19 mirrors/shutters/shade → W20 portal optics. Fractured W21–24 explicitly introduce super, hyper/wavedash, ultra and wallbounce; W25–40 recombine fault floors, following shades, input-swapping glass and world-specific machinery. Preserve those movement introductions before placing rooms that require them.

| World | Current Survive name | Side | Main / all definitions | Old measured difficulty /10 | Late-road mechanics |
|---|---|---|---:|---|---|
| 1 | The Outskirts | Base | 11 / 23 | 1–3; mean 1.9 | Cracked footing + refill crystal, then cargo weight/held gate |
| 2 | Black Woods | Base | 10 / 21 | 1–5; mean 2.9 | Dash-swapped branches; sword bell correction; pod + bell in one cut |
| 3 | Broken Causeway | Base | 12 / 22 | 1–6; mean 2.2 | Moving weight/lift interaction, Brute breach, two-weight armour kill |
| 4 | The Updrafts | Base | 13 / 27 | 1–4; mean 1.5 | Weak-draft/pod recovery, single draft/pod, spring/wind/pod summit chain |
| 5 | Hollow Marksman | Base | 9 / 29 | 1–6; mean 3.7 | Marksman lens, moving perches/cover, airborne parry dash refill |
| 6 | Ruined Keep | Base | 12 / 23 | 1–3; mean 1.3 | Portal momentum + cargo transfer, warded portal-shot slit |
| 7 | The Warden | Base | 13 / 25 | 1–4; mean 2.2 | Pod/jailer combinations, Warden rush reflection, parry-only duel |
| 8 | Frostfell | Base | 12 / 23 | 1–3; mean 1.7 | Feather + temporary landings + crystal; draft/feather lift; icy summit |
| 9 | Frost Sorcerer | Base | 13 / 25 | 1–4; mean 2.3 | Multi-pool freeze timing; Sorcerer ward, condenser, reflected frost |
| 10 | Emberdeep | Base | 13 / 23 | Unrated | Multi-phase slab route, travelling safe stair, single timed slab exit |
| 11 | Ember Colossus | Base | 13 / 27 | Unrated | Mould/anvil descent; Colossus pours refused by pre-cast iron |
| 12 | The Inversion | Base | 12 / 26 | Unrated | Lantern to ceiling plate via gravity; repeated flips; ordinary exit road |
| 13 | The Void Tyrant | Base | 15 / 27 | Unrated | Tear chains/spent ledges, then portal-routed Tyrant bolts to changing bands |
| 14 | The Abyss King | Base | 15 / 30 | Unrated | Echo/crown occupancy, timed seal hold, wake pursuit, ordinary rail exit |
| 15 | The Deep Line | Base | 13 / 27 | Unrated | Cart + portal momentum, lantern glide, moth pogo, pod-assisted dismount |
| 16 | Thunder Cliffs | Base | 17 / 32 | Unrated | Chain + enemy/landing side, three Hydra collar fights, plain shore transition |
| 17 | The Landing Shores | Base | 10 / 26 | Unrated | Float-to-ring momentum, behind-shield landing, float/moth/ring flight |
| 18 | The Colony | Base | 11 / 26 | Unrated | Portal-speed sightline crossing, concealed rope release, moving shade |
| 19 | The Path to the Palace | Base | 12 / 26 | Unrated | Shutter/tear alignment, enemy belly shade, phase shadow and low beam crossing |
| 20 | Sunspire Palace | Base | 14 / 33 | Unrated | Rope/phase/portal light routing, bolt-before-light delivery, Day King sequence |
| 21 | The Fractured Outskirts | Fractured | 13 / 30 | Unrated | Super from enemy-created footholds, cracked runways and crystal recovery |
| 22 | The Fractured Woods | Fractured | 12 / 26 | Unrated | Low launch with phase/lash timing, resin wind, Oath Root crown circuits |
| 23 | The Fractured Causeway | Fractured | 13 / 32 | Unrated | Ultra/lift/cracked-sill combinations, then three weight-and-Brute courts |
| 24 | The Fractured Updrafts | Fractured | 12 / 24 | Unrated | Wallbounce from wind/tear arrivals; alternating breathing air summit |
| 25 | The Fractured Marksman | Fractured | 10 / 24 | Unrated | Fault perches under projectile timing, then Marksman fights on failing ground |
| 26 | The Fractured Keep | Fractured | 10 / 21 | Unrated | Cargo throw/catch before fault failure; tear logistics; portal archive |
| 27 | The Fractured Warden | Fractured | 14 / 24 | Unrated | Shade-chased pod/jailer combinations; Warden rush parries without resting |
| 28 | The Fractured Frostfell | Fractured | 12 / 23 | Unrated | Feather, fault, ice and shade budget; wind/feather summit |
| 29 | The Fractured Sorcerer | Fractured | 13 / 25 | Unrated | Mirrored freeze/fall routes, then Sorcerer basins reached by redirected frost |
| 30 | The Fractured Emberdeep | Fractured | 12 / 25 | Unrated | Slab/pane/fault timing, shade through hatches, timed descent and tear exit |
| 31 | The Fractured Colossus | Fractured | 12 / 22 | Unrated | Anvil/mould/glass/fault paths, then Colossus pours that destroy footing |
| 32 | The Fractured Inversion | Fractured | 12 / 24 | Unrated | Three-pass gravity/fault routes; mirror remapping; shade pursuit |
| 33 | The Fractured Tyrant | Fractured | 12 / 26 | Unrated | Blinking/one-use tears and fault perches; Tyrant seams to lit bands |
| 34 | The Fractured King | Fractured | 12 / 26 | Unrated | Two shades as pursuit/weight, echo occupancy, crown timing and return |
| 35 | The Fractured Line | Fractured | 11 / 26 | Unrated | Cart launch/fork timing, low launch under roof, shade and glass through tears |
| 36 | The Fractured Cliffs | Fractured | 12 / 24 | Unrated | Rope/tear/glass transfer, adjustable rope tally, shade-chased Hydra fights |
| 37 | The Fractured Shores | Fractured | 11 / 30 | Unrated | Low launch from rising floats, mirror, behind-shield arrivals, aerial synthesis |
| 38 | The Fractured Colony | Fractured | 12 / 28 | Unrated | Watch-light timing over fault, low launches, pane reversal, smoke/rope release |
| 39 | The Fractured Path | Fractured | 11 / 26 | Unrated | Phase shade, timed windows, mirrored low launch, then all machines combined |
| 40 | The Fractured Palace | Fractured | 14 / 28 | Unrated | Timed optics/phase/rope lanes, then three Day King fights and hydra return |

## Replacement candidates and teaching safeguards

Stable campaign IDs below are the IDs an eventual placement manifest must target. The shorter origin IDs are the corresponding `scripts/rbr-src`/Climb spec identifiers. Listed candidates are alternatives for review, not instructions to delete them.

### 1. The Outskirts — Base, 11 main rooms

**Keep as scaffolding or protected sequence:** `o1-road` — The Verge Road; `o1-verge` — The Poisoned Verge; `o1-flowers` — White Flowers; `o1-camp` — Camp Echo; `o1-cut` — Watcher’s Cut; `o1-cracked` — Cracked Road; `o1-gate` — The Gatehouse.

**Current ending sequence:** `o1-muster` (Broken Muster) → `o1-yard` (Muster Yard) → `o1-gate` (The Gatehouse).

- **B — `cl1-o1-mile` (The Hollow Mile)**, main slot 8/11. Four separated three-tile cracked islands form a single rightward line, followed by one reachable tally. The immediately preceding Cracked Road already introduces collapse; this repeats timed departure rather than introducing a new verb. Preserve at least one chained-crumble application before Muster Yard. Stored route: 144 frames, 11 held-input segments. Old recorded human difficulty: 2/10, fun 2/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 2. Black Woods — Base, 10 main rooms

**Keep as scaffolding or protected sequence:** `w2-clearing` — Oathblade Clearing; `w2-descent` — Mothlight Descent; `w2-briar` — Briar Run; `w2-edge` — Thicket’s Edge; `w2-mirror` — Mirror Thicket; `w2-kitchen` — Elsie’s Kitchen.

**Current ending sequence:** `w2-mirror` (Mirror Thicket) → `w2-called` (The Called Name) → `w2-rootbound` (Rootbound Passage).

- **A — `cl2-w2-tunnel` (The Root Tunnel)**, main slot 1/10. No active entity or switch: a thorn gap and climbable high bank, using only travel/jump/grab inputs. Wall climbing was taught by White Flowers in W1. Keep the arrival/rest function if replacing it. Stored route: 274 frames, 6 held-input segments. Old recorded human difficulty: 1/10, fun 1/5. Attachment check: NPC/dialogue.
- **B — `cl2-w2-called` (The Called Name)**, main slot 9/10. Two bells and twenty cyan phase tiles extend the same dash/strike parity lesson as Mirror Thicket; Rootbound Passage immediately adds the more consequential pod-plus-bell combined cut. A new phase puzzle can occupy this middle repetition without removing the first bell lesson. Stored route: 216 frames, 16 held-input segments. Old recorded human difficulty: 4/10, fun 3/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 3. Broken Causeway — Base, 12 main rooms

**Keep as scaffolding or protected sequence:** `c3-camp` — Chainwake Camp; `c3-hoist` — The Hoist; `c3-rise` — Counterweight Rise; `c3-well` — The Weigh Well; `c3-brace` — Broken Standard; `c3-counterweight` — The Counterweight.

**Current ending sequence:** `c3-gantry` (Rise Gantry) → `c3-brace` (Broken Standard) → `c3-counterweight` (The Counterweight).

- **A — `cl3-c3-drop` (Drop Yard)**, main slot 2/12. One four-tile vertical lift rises eleven tiles beside a thorned far bank. The saved route includes a 56-frame idle ride and no blade interaction; Chainwake Camp already establishes weight-triggered lift travel, while The Hoist follows with its new momentum lesson. Stored route: 216 frames, 8 held-input segments. Old recorded human difficulty: 1/10, fun 1/5. Attachment check: NPC/dialogue.
- **B — `cl3-c3-patrol` (The Patrol Road)**, main slot 4/12. One four-tile flat lift and a far landing; the three-segment route is another lift throw after The Hoist. This is also the defector quest entrance: preserve that branch and its dialogue rather than deleting the junction. Stored route: 129 frames, 3 held-input segments. Old recorded human difficulty: 1/10, fun 2/5. Attachment check: quest branch, NPC/dialogue.

### 4. The Updrafts — Base, 13 main rooms

**Keep as scaffolding or protected sequence:** `u4-lift` — Rootbreach Lift; `u4-shaft` — The Old Shaft; `u4-bellows` — Bellows Rest; `u4-kites` — Kite Terraces; `u4-lines` — The Kite Lines; `u4-needle` — Needlewind Labyrinth; `u4-crown` — Signal Crown.

**Current ending sequence:** `u4-span` (The Catcher Span) → `u4-flue` (The Choir Flue) → `u4-crown` (Signal Crown).

- **B — `cl4-u4-flue` (The Choir Flue)**, main slot 12/13. One four-tile-wide updraft and one pod beside a tall thorned wall; the tape has one downward strike and then a long held up/right exit. The preceding Catcher Span already combines draft, spring and two pods, so this late single-pod reprise is a stronger replacement candidate than the wind introductions. Stored route: 180 frames, 7 held-input segments. Old recorded human difficulty: 4/10, fun 4/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 5. Hollow Marksman — Base, 9 main rooms

**Keep as scaffolding or protected sequence:** `m5-camp` — Shotfall Camp; `m5-watch` — Shotfall Watch; `m5-road` — The Watching Road; `m5-works` — Mantlet Works; `m5-release` — The Brass Release; `m5-court` — Deadeye Court; `m5-tiers` — The Court Tiers; `m5-perch` — The Last Perch.

**Current ending sequence:** `m5-court` (Deadeye Court) → `m5-tiers` (The Court Tiers) → `m5-perch` (The Last Perch).

- **B — `cl5-m5-post` (The Watchpost)**, main slot 4/9. A single watchman on a pillar asks for his own arrows to be returned; directional returns have already been taught in Watching Road, and the later Marksman courts revisit aimed returns with lens/perch changes. This is a repetition candidate, not a demonstrated easy room: the old human difficulty rating should decide whether its longer encounter is worth keeping. Stored route: 515 frames, 15 held-input segments. Old recorded human difficulty: 4/10, fun 4/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 6. Ruined Keep — Base, 12 main rooms

**Keep as scaffolding or protected sequence:** `k6-refectory` — Fallen Refectory; `k6-table` — The Long Table; `k6-quarter` — Mason’s Quarter; `k6-cells` — The Cells; `k6-belfry` — Split Belfry; `k6-loft` — The Bell Loft; `k6-archive` — Clinging Archive; `k6-arch` — The Broken Arch.

**Current ending sequence:** `k6-archive` (Clinging Archive) → `k6-stacks` (The Upper Stacks) → `k6-arch` (The Broken Arch).

- **A — `cl6-k6-hearth` (Gatehouse Hearth)**, main slot 1/12. The lantern starts inside a sealed overhead pocket directly above its plate; the eighteen door tiles are already held open. The saved tape contains only rightward walking/jumping and no pickup/throw. W1 Gatehouse already taught active plate weighting. Good slot for an early cargo puzzle that requires the player to establish the state. Stored route: 198 frames, 7 held-input segments. Old recorded human difficulty: 1/10, fun 1/5. Attachment check: NPC/dialogue.

### 7. The Warden — Base, 13 main rooms

**Keep as scaffolding or protected sequence:** `g7-gallery` — Blind Gallery; `g7-door` — The Gallery Door; `g7-engine` — Hush Engine; `g7-cells` — Turning Cells; `g7-mouth` — The Well Mouth; `g7-well` — Sentence Well; `g7-sentence` — The Sentence.

**Current ending sequence:** `g7-mouth` (The Well Mouth) → `g7-well` (Sentence Well) → `g7-sentence` (The Sentence).

- **A — `cl7-g7-crown` (Eastern Crown)**, main slot 1/13. The jailer/gate sits in a sealed side pocket while the main road descends around it. The four-segment route uses only left and jump, including 144 frames held left; no combat input. Keep the region arrival, but the actual shield/back and parry lessons are the next two rooms. Stored route: 192 frames, 4 held-input segments. Old recorded human difficulty: 1/10, fun 1/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl7-g7-bellows` (The Bellows)**, main slot 5/13. Two vertically staged pressure pods repeat Hush Engine’s newly introduced reversal/refill in a second launch. A replacement can combine that known resource with another decision, provided it still supplies a forgiving second pod practice before the jailer combinations. Stored route: 230 frames, 9 held-input segments. Old recorded human difficulty: 2/10, fun 3/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 8. Frostfell — Base, 12 main rooms

**Keep as scaffolding or protected sequence:** `f8-refuge` — Banked Refuge; `f8-streets` — Working Streets; `f8-shelves` — Raised Shelves; `f8-court` — Thawed Court; `f8-stair` — Frozen Stair; `f8-crown` — Muster Crown.

**Current ending sequence:** `f8-landings` (The Twenty Landings) → `f8-engine` (Muster Engine) → `f8-crown` (Muster Crown).

- **B — `cl8-f8-rehearsal` (The Rehearsal)**, main slot 7/12. One feather over a fully solid floor and a single high thorn-faced exit bank. Thawed Court immediately precedes it with the first feather pickup lesson, while Frozen Stair follows with two feather expenditures. This intermediate one-feather height demonstration is replaceable if the new room still rehearses pressing jump again. Stored route: 230 frames, 7 held-input segments. Old recorded human difficulty: 3/10, fun 3/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl8-f8-engine` (Muster Engine)**, main slot 11/12. One feather at the top of wind and a single far bank, with no switches/cargo/enemies. Thermal Works already combines drafts with unstable icy arrivals and Frozen Stair teaches feather budgeting; this is a focused repeat of the two established resources before the fuller Crown. Stored route: 150 frames, 15 held-input segments. Old recorded human difficulty: 1/10, fun 1/5. Attachment check: NPC/dialogue.

### 9. Frost Sorcerer — Base, 13 main rooms

**Keep as scaffolding or protected sequence:** `s9-aqueduct` — The Aqueduct; `s9-sluice` — West Sluice; `s9-wheel` — The Service Wheel; `s9-refuge` — The Sluice Refuge; `s9-glass` — The Glassworks; `s9-gallery` — Petition Gallery; `s9-white` — The White Court; `s9-gglass` — The Glass Gallery; `s9-ward` — The Last Ward.

**Current ending sequence:** `s9-white` (The White Court) → `s9-gglass` (The Glass Gallery) → `s9-ward` (The Last Ward).

- **B — `cl9-s9-court` (Thaw Court)**, main slot 5/13. Three independent basins form a forward ladder; the solution repeats freezing each basin on arrival. It develops rather than introduces freezing, after Sluice/Service Wheel/Refuge. Replace only with a room retaining repeated blade-to-water use, not an unrelated early lesson. Stored route: 195 frames, 16 held-input segments. Old recorded human difficulty: 4/10, fun 4/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl9-s9-overlook` (The Overlook)**, main slot 9/13. A large pool, one three-tile cracked landing and a high thorn-faced exit. Its added dependency is two expiring floors; the next Cold Antechamber is the stronger multi-pool/condenser timing combination. Suitable for a bank room with a more consequential freeze/thaw state change. Stored route: 209 frames, 12 held-input segments. Old recorded human difficulty: 1/10, fun 1/5. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 10. Emberdeep — Base, 13 main rooms

**Keep as scaffolding or protected sequence:** `e10-door` — The Ember Door; `e10-draw` — The Draw; `e10-spouts` — Under the Spouts; `e10-schedule` — The Pour Schedule; `e10-pourfloor` — The Pour Floor; `e10-stair` — The Deep Stair.

**Current ending sequence:** `e10-pourfloor` (The Pour Floor) → `e10-stair` (The Deep Stair) → `e10-foot` (The Stair Foot).

- **A — `cl10-e10-foot` (The Stair Foot)**, main slot 13/13. A six-tile heat slab lies flush with otherwise continuous row-18 floor. Saved tape is exactly right 65, idle 55, right 133; no jump/dash/weapon input. It revisits the first cycle lesson after the multi-slab descent. Keep a short arrival-safe seam if replacing this post-sequence breather. Stored route: 253 frames, 3 held-input segments. Attachment check: NPC/dialogue.
- **B — `cl10-e10-window` (The Casting Window)**, main slot 10/13. One five-tile heat window plus an anchored portal: a shot crosses when the slab is not stone, followed by portal travel. This is the first shot/slab combination, so a richer replacement must retain that specific readable lesson rather than simply remove it. Stored route: 229 frames, 7 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 11. Ember Colossus — Base, 13 main rooms

**Keep as scaffolding or protected sequence:** `f11-stair` — The Deep Stair; `f11-anvil` — The Anvil; `f11-climb` — The Slab Climb; `f11-hall` — The Mould Hall; `f11-crane` — The Crane; `f11-feeder` — The Feeder; `f11-pit` — The Casting Pit; `f11-bed` — The Bed; `f11-pour` — The Last Pour.

**Current ending sequence:** `f11-pit` (The Casting Pit) → `f11-bed` (The Bed) → `f11-pour` (The Last Pour).

- **B — `cl11-f11-line` (The Casting Line)**, main slot 7/13. One lantern, one plate and a leftward belt solve a remote held hatch; there are no moulds, anvils or hazards in the map. The later Feeder adds a cast stop to the same belt/cargo/plate problem. Strong place to substitute a cargo machinery puzzle while keeping belt introduction in Deep Stair. Stored route: 173 frames, 10 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl11-f11-look` (The Overlook)**, main slot 10/13. Three mould tiles provide sequential stops in a downward shaft over lava, without another state-bearing entity. Mould casting/landing is already taught by Slab Climb, Mould Hall and Crane. A replacement should preserve the downward exit and transition to the boss pit. Stored route: 225 frames, 16 held-input segments. Attachment check: NPC/dialogue.

### 12. The Inversion — Base, 12 main rooms

**Keep as scaffolding or protected sequence:** `i12-fall` — The Fall In; `i12-reversal` — The Reversal; `i12-lip` — The Roof Has Teeth; `i12-alternating` — The Second Down; `i12-landing` — The Hanging Landing; `i12-lock` — The Drop-Lock.

**Current ending sequence:** `i12-lock` (The Drop-Lock) → `i12-fissure` (The Void Fissure) → `i12-threshold` (The Quiet Threshold).

- **A — `cl12-i12-line` (The Unreachable Line)**, main slot 2/12. Two shallow thorn beds in the row-18 road and one overhead stone block; no prism or other active device. Tape uses only walking/jump/dash. At W12, this repeats the W1 movement lesson immediately before the actual gravity introduction. Stored route: 166 frames, 8 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **A — `cl12-i12-threshold` (The Quiet Threshold)**, main slot 12/12. Two five-tile thorn beds and a short solid block on a steady floor; no prisms, gravity cargo, crystal or switch. It follows Void Fissure’s repeated gravity reversals. An obvious low-complexity slot, although its breather/region-exit purpose should be retained. Stored route: 159 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 13. The Void Tyrant — Base, 15 main rooms

**Keep as scaffolding or protected sequence:** `v13-mouth` — The Fissure Mouth; `v13-ledgers` — The Rising Ledgers; `v13-tear` — The First Tear; `v13-tears` — Tear to Tear; `v13-low` — The Lower Ward; `v13-middle` — The Middle Ward; `v13-crown` — The Crown Does Not Fall.

**Current ending sequence:** `v13-low` (The Lower Ward) → `v13-middle` (The Middle Ward) → `v13-crown` (The Crown Does Not Fall).

- **A — `cl13-v13-opposed` (The Opposed Faces)**, main slot 5/15. A pale-face wall crossing with anchored portal, no hazard glyphs or dynamic obstacle besides the portal pair. Portal joining has already been taught extensively in W6. Preserve the attached secret doorway if this becomes a more developed portal problem. Stored route: 207 frames, 6 held-input segments. Attachment check: attached door/secret or socket, secret host.
- **B — `cl13-v13-crossing` (The Vigil Crossing)**, main slot 12/15. Three tears carry the knight through a thorn field; there is no spent ledge, pod or crystal in the map. The six-segment saved tape revisits chain transfer after Tear to Tear already adds a disappearing perch. Keep the pre-boss transition but give its route a second consequential resource. Stored route: 79 frames, 6 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 14. The Abyss King — Base, 15 main rooms

**Keep as scaffolding or protected sequence:** `k14-marks` — The Two Marks; `k14-seam` — The King’s Seam; `k14-hand` — The Right Hand; `k14-alcove` — The Empty Alcove; `k14-echo` — The Borrowed Body; `k14-return` — The Place You Left; `k14-trade` — Ride Away, Trade Back; `k14-wake` — The Long Drowning; `k14-throne` — The First Seal; `k14-last` — The Last Seal.

**Current ending sequence:** `k14-throne` (The First Seal) → `k14-last` (The Last Seal) → `k14-rail` (The Rail Head).

- **B — `cl14-k14-hall` (The Audience Hall)**, main slot 12/15. Two-body crown occupancy repeats Borrowed Body after the more involved momentum swap and one-way-tear return rooms. Its map has only gate tiles and seven floor thorns beside the echo/crown state. Preserve a last crown rehearsal before the seals, but a bank replacement can ask more than leaving the echo on the low mark. Stored route: 177 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **A — `cl14-k14-rail` (The Rail Head)**, main slot 15/15. One five-tile thorn bed and a two-tile-high stone bump, with only movement inputs. No echo, wake, crown or rail entity. This is an explicit post-boss breather; replace only if the plan deliberately wants challenge after the boss, otherwise insert before the seals instead. Stored route: 150 frames, 10 held-input segments. Attachment check: NPC/dialogue.

### 15. The Deep Line — Base, 13 main rooms

**Keep as scaffolding or protected sequence:** `d15-thorn` — Thorn Line; `d15-buffer` — Buffer Stop; `d15-backup` — Back Up; `d15-high` — High Line; `d15-fork` — The Cut Fork; `d15-tally` — Tally Line; `d15-bell` — Bell Line; `d15-boat` — The Boat.

**Current ending sequence:** `d15-lamp` (Lamp Car) → `d15-moths` (Moth Line) → `d15-boat` (The Boat).

- **B — `cl15-d15-west` (Westbound)**, main slot 7/13. One cart on seventeen rail tiles, one refill crystal and a tall exit over spikes. The decision is a conventional second dash after dismount, whereas subsequent carts change bell state, portal momentum or cargo/enemy jobs. Preserve the westward road turn and receiving checkpoint if substituting. Stored route: 178 frames, 7 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 16. Thunder Cliffs — Base, 17 main rooms

**Keep as scaffolding or protected sequence:** `t16-chain` — First Chain; `t16-release` — Let Go; `t16-run` — Running Start; `t16-ladder` — Chain Ladder; `t16-deck-ring` — Deck to Ring; `t16-long` — Long Chain; `t16-bite` — The First Chain; `t16-tide-head` — The Tidal Chain; `t16-storm` — The Storm Chain.

**Current ending sequence:** `t16-tide-head` (The Tidal Chain) → `t16-storm` (The Storm Chain) → `t16-tide` (The Tide Below).

- **A — `cl16-t16-deck` (Deck)**, main slot 3/17. One five-tile deck cycles vertically eleven tiles over a small safe approach; the saved tape includes idle blocks of 70 and 120 frames, then jump/right. It teaches autonomous deck riding, so any replacement must retain readable deck arrival before Running Start uses its momentum. Stored route: 407 frames, 6 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **A — `cl16-t16-tide` (The Tide Below)**, main slot 17/17. A five-tile thorn bed and a low solid block; no chain, deck, tide or enemy. Movement-only tape after the Hydra trilogy. As with W14 Rail Head, this is a post-boss decompression slot rather than proof that the boss needs more difficulty. Stored route: 150 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 17. The Landing Shores — Base, 10 main rooms

**Keep as scaffolding or protected sequence:** `s17-slack` — Slack Water; `s17-wreck` — Wreck Lift; `s17-spring` — Spring Tide; `s17-line` — The Tide Line; `s17-mooring` — Mooring Ring; `s17-landfall` — Landfall.

**Current ending sequence:** `s17-belled` (Belled) → `s17-landfall` (Landfall) → `s17-road` (The Colony Road).

- **A — `cl17-s17-road` (The Colony Road)**, main slot 10/10. A single five-tile thorn bed and a three-tile-high block on dry continuous floor; no tide or float. The ten-segment tape contains only ordinary movement after Landfall’s multi-entity flight. Strong geometry-based replacement slot if retaining a short safe transition into the Colony. Stored route: 151 frames, 10 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 18. The Colony — Base, 11 main rooms

**Keep as scaffolding or protected sequence:** `c18-lamps` — Lamplight; `c18-smoke` — Pit Smoke; `c18-glance` — A Glance; `c18-lantern` — Lantern Thief; `c18-shade` — Shade; `c18-watch` — The Watch.

**Current ending sequence:** `c18-shade` (Shade) → `c18-watch` (The Watch) → `c18-road` (Beyond the Watch).

- **A — `cl18-c18-road` (Beyond the Watch)**, main slot 11/11. One five-tile thorn bed plus a three-tile-high block; no watch light, smoke or moving cover. It repeats the same plain transition family as W17 Colony Road, one tile farther right. Keep its seam/checkpoint but it need not consume a whole challenge slot. Stored route: 168 frames, 8 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl18-c18-fling` (Fling)**, main slot 7/11. Portal momentum crosses one otherwise open light curtain; the map has no glyph hazards, cargo or switches. This is a distinct speed-through-vision lesson, so replace only with a richer room that still makes portal entry speed matter. Avoid replacing Smoke or Lamplight’s first cover lessons instead. Stored route: 283 frames, 7 held-input segments. Attachment check: entrance closes while played.

### 19. The Path to the Palace — Base, 12 main rooms

**Keep as scaffolding or protected sequence:** `p19-windows` — Sun Window; `p19-glass` — Turn the Glass; `p19-tally` — Light It, Then Turn It Back; `p19-lantern` — Carried Shade; `p19-engine` — Switchback Engine; `p19-shade` — Belly Shade; `p19-gate` — The Sun Gate.

**Current ending sequence:** `p19-shade` (Belly Shade) → `p19-road` (The Engine Road) → `p19-gate` (The Sun Gate).

- **B — `cl19-p19-line` (The Sun Line)**, main slot 9/12. Two shutter tiles and a tear span a single thorn field; only four held-input segments are saved. It revisits shutter departure timing without the mirror preparation in Beat and Glass. Good slot for two linked timing/arrival decisions while retaining the Sun Line’s clear beam cue. Stored route: 153 frames, 4 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl19-p19-road` (The Engine Road)**, main slot 11/12. Nine phase tiles over a thorn road, toggled by dash and tied to beam shade. Switchback Engine already teaches that same dual effect; the later room adds jumps but no new object role. Prefer a replacement with a meaningful state return, while preserving the region’s phase/light identity. Stored route: 157 frames, 10 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 20. Sunspire Palace — Base, 14 main rooms

**Keep as scaffolding or protected sequence:** `s20-court` — Sun Through Stone; `s20-ends` — Both Ends; `s20-glass` — Glass in the Dark; `s20-shade` — Lantern Post; `s20-flume` — The Light’s Door; `s20-crown` — Ring Light; `s20-deliveries` — Two Deliveries; `s20-dawn` — The Throne at Dawn; `s20-morning` — The Glove of Morning; `s20-noon` — The Last Noon; `s20-sea` — The Sea Terrace.

**Current ending sequence:** `s20-morning` (The Glove of Morning) → `s20-noon` (The Last Noon) → `s20-sea` (The Sea Terrace).

- **B — `cl20-s20-hours` (Light It, Then Let Go)**, main slot 2/14. One seal/tally, one anchored portal and a single one-way ledge; the five-segment solution lights the seal then removes the hazardous route. Persistent illumination was already taught in W19 Tally, while Court introduces portal-carried light. Useful order-of-operations lesson, but a reasonable replacement slot for a stronger version of that same idea. Stored route: 217 frames, 5 held-input segments. Attachment check: entrance closes while played.
- **B — `cl20-s20-engine` (Noon Engine)**, main slot 9/14. Cyan/gold machinery controls both a portal aiming position and the beam. It revisits W19 Engine/Road’s phase-and-shadow system with a portal alignment added. This is a lower-confidence repetition candidate, not an easy-room claim; preserve the more distinctive Two Deliveries and all three boss rooms. Stored route: 228 frames, 7 held-input segments. Attachment check: attached door/secret or socket.

### 21. The Fractured Outskirts — Fractured, 13 main rooms

**Keep as scaffolding or protected sequence:** `fo21-ash` — The Ash Verge; `fo21-mile` — The Hollow Mile; `fo21-ridge` — Watcher’s Ridge; `fo21-map` — The Survey Stone; `fo21-camp` — Camp Echo, Empty; `fo21-hammer` — The Centre Bell; `fo21-shoulder` — The East Bell; `fo21-last` — The West Bell.

**Current ending sequence:** `fo21-hammer` (The Centre Bell) → `fo21-shoulder` (The East Bell) → `fo21-last` (The West Bell).

- **B — `cl21-fo21-cracked` (The Cracked Road)**, main slot 6/13. Eleven cracked tiles form islands over thirty-five thorn tiles; the central long gap is the super and shorter gaps are jumps. Hollow Mile and Survey Stone already teach repeated supers on unstable footing. Preserve its secret door if substituted. Stored route: 176 frames, 14 held-input segments. Attachment check: attached door/secret or socket, secret host.
- **B — `cl21-fo21-torn` (The Torn Mile)**, main slot 8/13. Three tears deliver to cracked perches before a last super; the next Muster Yard adds a crystal to the same tear/perch/super chain. A new room can replace this intermediate chain while retaining the first tear lesson in Camp Echo. Stored route: 159 frames, 13 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 22. The Fractured Woods — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fw22-refuge` — The Burnt Refuge; `fw22-root-loop` — The Root Loop; `fw22-clearing` — The Bound Oathblade; `fw22-edge` — Thicket’s Broken Edge; `fw22-wind` — The Resin Crown; `fw22-oath1` — The Oath Root; `fw22-oath2` — The Oath Root, Waking; `fw22-oath3` — The Oath Root’s Crown.

**Current ending sequence:** `fw22-oath1` (The Oath Root) → `fw22-oath2` (The Oath Root, Waking) → `fw22-oath3` (The Oath Root’s Crown).

- **B — `cl22-fw22-tower` (The Hollow Crown)**, main slot 9/12. A tear, one pod and eight cracked tiles form a lift/cut/low-launch sequence. All three verbs have been introduced earlier, while this room does not use the chapter’s lashes or resin wind. A replacement can combine low launch with a more consequential timed arrival; retain any attached secret host. Stored route: 158 frames, 12 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 23. The Fractured Causeway — Fractured, 13 main rooms

**Keep as scaffolding or protected sequence:** `fc23-camp` — Chainwake, After the Bell; `fc23-yard` — The Drop Yard; `fc23-relay` — The Relay Gantry; `fc23-silas` — The Forty-First Pace; `fc23-gantry` — The Last Gantry; `fc23-standard` — The Broken Standard; `fc23-west` — The West Counterweight; `fc23-east` — The East Counterweight; `fc23-middle` — The Last Count.

**Current ending sequence:** `fc23-west` (The West Counterweight) → `fc23-east` (The East Counterweight) → `fc23-middle` (The Last Count).

- **A — `cl23-fc23-well` (The Unlit Well)**, main slot 8/13. A descending solid staircase with no hazard glyph, enemy or device; the entire saved route is [200, left]. The hint explicitly calls it a breath before the courts. This is the clearest Fractured low-complexity slot, but keep some safe boss preparation rather than filling every breather. Stored route: 200 frames, 1 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl23-fc23-rise` (The Counterweight Rise)**, main slot 5/13. One rising lift launches to a cracked lip and then a second cracked sill; the main demand is two supers in succession. The first lift/ultra route and Relay Gantry already teach lift momentum and unstable arrival, while Last Gantry is the fuller combination. Preserve vertical/horizontal seam orientation. Stored route: 166 frames, 14 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 24. The Fractured Updrafts — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fu24-lift` — Rootbreach in the Storm; `fu24-shaft` — The Polished Shaft; `fu24-draw` — The Empty Aerie; `fu24-choir` — The Silent Choir; `fu24-eye` — The Lung’s Lower Turn; `fu24-lung` — The Lung; `fu24-crown` — The Lung’s Crown.

**Current ending sequence:** `fu24-eye` (The Lung’s Lower Turn) → `fu24-lung` (The Lung) → `fu24-crown` (The Lung’s Crown).

- **B — `cl24-fu24-catcher` (The Cracked Rain-Catcher)**, main slot 8/12. Four cracked cups alternate between polished walls; the repeated action is landing and immediately wallbouncing to the next cup. It develops an already established wallbounce chain, whereas the following lung rooms add changing wind direction. Replace with a distinctive wallbounce combination, not an ordinary jump room. Stored route: 292 frames, 16 held-input segments. Attachment check: entrance closes while played.

### 25. The Fractured Marksman — Fractured, 10 main rooms

**Keep as scaffolding or protected sequence:** `fm25-seam` — The Seam; `fm25-bowline` — The Bow Line; `fm25-air` — Windcut Seams; `fm25-works` — Mantlet Seams; `fm25-release` — The Brass Release; `fm25-court` — Deadeye Court; `fm25-tiers` — The Court Tiers; `fm25-perch` — The Last Perch.

**Current ending sequence:** `fm25-court` (Deadeye Court) → `fm25-tiers` (The Court Tiers) → `fm25-perch` (The Last Perch).

- **B — `cl25-fm25-shaft` (The Cracked Shaft)**, main slot 2/10. Exactly five separate three-tile fault ledges climb a shaft, with no projectile, moving cover or other object. The author source describes each as a jump and dash from the last. Keep Seam as the first fault lesson; this second single-system repetition can become a broader fault application. Stored route: 250 frames, 17 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl25-fm25-approach` (Deadeye Approach)**, main slot 7/10. Two bolt lines over a fault runway/perch and one exit tear; the nine-segment route repeats airborne parry refill after Windcut Seams already uses two projectile lines. Lower confidence: it is a legitimate pre-boss synthesis, so prefer replacing the shaft first. Stored route: 153 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 26. The Fractured Keep — Fractured, 10 main rooms

**Keep as scaffolding or protected sequence:** `fk26-hearth` — Gatehouse Seam; `fk26-table` — The Long Table; `fk26-refectory` — Fallen Refectory; `fk26-weight` — Weight Hall; `fk26-cradle` — The Cradle; `fk26-cells` — The Cells; `fk26-stacks` — The Torn Stacks; `fk26-arch` — The Broken Arch.

**Current ending sequence:** `fk26-archive` (Clinging Archive) → `fk26-stacks` (The Torn Stacks) → `fk26-arch` (The Broken Arch).

- **B — `cl26-fk26-quarter` (Mason’s Quarter)**, main slot 6/10. One anchored portal crosses the masons’ full wall from fault footing; the palette/fault pressure changes, but the portal topology repeats Base Mason’s Quarter. A stronger portal/cargo state puzzle can go here without removing portal training from W6. Stored route: 153 frames, 13 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl26-fk26-archive` (Clinging Archive)**, main slot 8/10. The map retains the long thorned portal-fling shaft and has no fault/shade fields; its fourteen-segment 328-frame tape length matches the Base Archive. This is a reflected reprise and also an archivist-echo branch host: any replacement must retain the branch access and fling prerequisite. Stored route: 328 frames, 14 held-input segments. Attachment check: quest branch, NPC/dialogue.

### 27. The Fractured Warden — Fractured, 14 main rooms

**Keep as scaffolding or protected sequence:** `fg27-shadow` — Your Own Shadow; `fg27-gallery` — Blind Gallery; `fg27-door` — The Gallery Door; `fg27-engine` — Hush Engine; `fg27-cells` — Turning Cells; `fg27-mouth` — The Well Mouth; `fg27-well` — Sentence Well; `fg27-sentence` — The Sentence.

**Current ending sequence:** `fg27-mouth` (The Well Mouth) → `fg27-well` (Sentence Well) → `fg27-sentence` (The Sentence).

- **B — `cl27-fg27-crown` (Eastern Crown)**, main slot 2/14. A descending jailer-gate arrival with shade and twenty floor thorns; the shield/back problem is developed more directly in the next Gallery/Door pair. The new shade rule already has its own first room, so this is a sensible early repeated traversal slot. Stored route: 146 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl27-fg27-bellows` (The Bellows)**, main slot 6/14. Two pressure pods with shade and thorned walls repeat the Hush Engine launch/refill, before subsequent rooms add jailer facing and cells. Keep Hush Engine’s first pod practice; replace this duplicate family with another pressure-pod interaction if matching bank material exists. Stored route: 180 frames, 14 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 28. The Fractured Frostfell — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `ff28-refuge` — Glazed Street; `ff28-streets` — Working Streets; `ff28-shelves` — Raised Shelves; `ff28-court` — Thawed Court; `ff28-stair` — Frozen Stair; `ff28-galleries` — Exposed Galleries; `ff28-crown` — Muster Crown.

**Current ending sequence:** `ff28-landings` (The Twenty Landings) → `ff28-engine` (Muster Engine) → `ff28-crown` (Muster Crown).

- **B — `cl28-ff28-rehearsal` (The Rehearsal)**, main slot 7/12. Two feathers plus one three-tile fault perch repeat the preceding Court’s two-feather climb and the next Stair’s longer turning climb. Replace the middle repeat while retaining Court’s readable first feather-in-Fractured explanation. Stored route: 141 frames, 13 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl28-ff28-engine` (Muster Engine)**, main slot 11/12. One feather at the top of a draft, shade pursuit and no fault glyph despite a fault option. This preserves the Base Engine’s single wind/feather idea rather than adding another object state. A more developed aerial resource chain can fit before Crown without taking away the introductory ice rooms. Stored route: 172 frames, 8 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 29. The Fractured Sorcerer — Fractured, 13 main rooms

**Keep as scaffolding or protected sequence:** `fs29-pane` — The Cold Pane; `fs29-stair` — The Pane Stair; `fs29-sluice` — The Mirrored Sluice; `fs29-falls` — The Two Falls; `fs29-glass` — The Glassworks; `fs29-ante` — The Cold Antechamber; `fs29-white` — The White Court; `fs29-gglass` — The Glass Gallery; `fs29-ward` — The Last Ward.

**Current ending sequence:** `fs29-white` (The White Court) → `fs29-gglass` (The Glass Gallery) → `fs29-ward` (The Last Ward).

- **B — `cl29-fs29-glazed` (The Glazed Gallery)**, main slot 9/13. Four full-height panes, two crystals and one four-tile fault perch; the core task is repeated left/right remapping with refill management. Pane Stair already teaches four-pane traversal on fault ledges. This later pane-only reprise is a stronger replacement candidate than the first mirror lesson. Stored route: 221 frames, 18 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl29-fs29-court` (Thaw Court)**, main slot 5/13. Three freeze basins and one eleven-tile pane repeat the Base Thaw Court ladder with a final handedness change. Sluice/Falls have already introduced mirrored water use; a replacement can make freeze timing change the route rather than add another basin ladder. Stored route: 207 frames, 16 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 30. The Fractured Emberdeep — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fe30-door` — The Ember Door; `fe30-draw` — The Draw; `fe30-schedule` — The Pour Schedule; `fe30-spouts` — Under the Spouts; `fe30-moulds` — The Mould Pits; `fe30-pourfloor` — The Pour Floor; `fe30-stair` — The Deep Stair.

**Current ending sequence:** `fe30-pourfloor` (The Pour Floor) → `fe30-stair` (The Deep Stair) → `fe30-foot` (The Stair Foot).

- **B — `cl30-fe30-cooling` (The Cooling Road)**, main slot 2/12. One four-tile fault perch and one four-tile heat slab, with no mirror or shade. It reprises the basic temporary-floor handoff after Ember Door already chains three slabs with a pane. Good compact slot for a more causal timing problem. Stored route: 175 frames, 10 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl30-fe30-shift` (The Glass Shift)**, main slot 8/12. Two heat slabs on opposite beats separated by one pane; the theme is the same beat-plus-handedness transfer as Door and Schedule. Retain the broader Pour Floor synthesis; this intermediate two-stop reprise is the more replaceable slot. Stored route: 178 frames, 14 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 31. The Fractured Colossus — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `ff31-stair` — The Cracked Stair; `ff31-anvils` — Off the Glass; `ff31-bridge` — The Mould Bridge; `ff31-shaft` — The Cold Shaft; `ff31-look` — The Overlook; `ff31-pit` — The Casting Pit; `ff31-bed` — The Bed; `ff31-pour` — The Last Pour.

**Current ending sequence:** `ff31-pit` (The Casting Pit) → `ff31-bed` (The Bed) → `ff31-pour` (The Last Pour).

- **B — `cl31-ff31-crane` (The Crane)**, main slot 5/12. One anvil, one cast landing group, one full pane and a refill crystal reproduce Base Crane’s throw-over-teeth/set-a-landing idea with mirror/shade. By this point Anvils, Mould Bridge and Cold Shaft have covered those resources individually. A replacement should still join a launch to manufactured footing. Stored route: 177 frames, 21 held-input segments. Attachment check: quest branch, NPC/dialogue.
- **B — `cl31-ff31-hot` (The Hot Line)**, main slot 8/12. Two anvils, two full panes and one three-tile fault perch form another stepping-stone line. The previous Slag Heap already combines anvils, glass, fault and shade with a meaningful low roof. Prefer replacing this repeated forward line before the richer Overlook. Stored route: 167 frames, 13 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 32. The Fractured Inversion — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fi32-fall` — The Fall Up; `fi32-line` — Both Ways; `fi32-reversal` — The Cracked Roof; `fi32-alternating` — Prism to Prism; `fi32-glass` — Glass Between Floors; `fi32-fissure` — The Void Fissure; `fi32-threshold` — The Quiet Threshold.

**Current ending sequence:** `fi32-lock` (Polarity Gauntlet) → `fi32-fissure` (The Void Fissure) → `fi32-threshold` (The Quiet Threshold).

- **B — `cl32-fi32-lip` (The Turned Teeth)**, main slot 4/12. One prism strip, one vertical pane and a thorned cracked roof produce a single remapped inverted run. Both Ways already traverses pane/gravity combinations on three passes. This shorter one-pass repetition is a review candidate, not proof of low execution difficulty. Stored route: 148 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl32-fi32-lock` (Polarity Gauntlet)**, main slot 10/12. Four prism crossings across short fault slabs with one pane; no cargo or held gate despite the former Drop-Lock ancestry. Prism to Prism already asks for repeated flips and refills. A replacement could restore a causal gravity/object task to a world dominated by traversal strings. Stored route: 163 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 33. The Fractured Tyrant — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fv33-mouth` — The Fissure Mouth; `fv33-blink` — The Blinking Seam; `fv33-spent` — The Spent Seam; `fv33-ledgers` — The Rising Ledgers; `fv33-broken` — The Broken Ledger; `fv33-low` — The Lower Ward; `fv33-middle` — The Middle Ward; `fv33-crown` — The Crown Does Not Fall.

**Current ending sequence:** `fv33-low` (The Lower Ward) → `fv33-middle` (The Middle Ward) → `fv33-crown` (The Crown Does Not Fall).

- **B — `cl33-fv33-thrown` (The Thrown Line)**, main slot 5/12. A forward chain of one-way tears over thorns, with no fault perch, cargo, enemy, tally or second resource in the room. It repeats sequential mouth-to-mouth transfer after Spent Seam already establishes one-way commitment. Stored route: 130 frames, 12 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl33-fv33-faults` (Three on Fault)**, main slot 6/12. Three tear stops on fourteen fault tiles, with no other active object. Fissure Mouth and the two following tear rooms already teach leaving a failing perch quickly; Broken Ledger later adds the more distinctive pod-to-mouth height decision. Good place to vary what a tear is used for. Stored route: 147 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 34. The Fractured King — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fk34-stair` — Two Behind; `fk34-marks` — Your Second Body; `fk34-echo` — The Borrowed Body; `fk34-hand` — The Right Hand; `fk34-wake` — The Long Drowning; `fk34-throne` — The First Seal; `fk34-last` — The Last Seal.

**Current ending sequence:** `fk34-hall` (The Audience Hall) → `fk34-throne` (The First Seal) → `fk34-last` (The Last Seal).

- **B — `cl34-fk34-seam` (The King’s Seam)**, main slot 3/12. Blinking tears plus one three-tile fault perch and two following shades; no mark or other object state. Two Behind has already introduced that timing pressure, while Your Second Body makes it consequential for a crown. Replace a movement-only repeat before removing either of those lessons. Stored route: 124 frames, 12 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl34-fk34-climb` (The Drowning Stair)**, main slot 8/12. Nine spent foothold tiles and six fault tiles climb with the shades behind; this repeats Long Drowning’s consumed footholds and pursuit but lacks its return over the earlier route. Keep that stronger return problem and use the later climb slot for a different shared-state application. Stored route: 168 frames, 14 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 35. The Fractured Line — Fractured, 11 main rooms

**Keep as scaffolding or protected sequence:** `fd35-thorn` — Cracking Line; `fd35-buffer` — Two Carts; `fd35-backup` — Back Up; `fd35-high` — High Line; `fd35-fork` — The Cut Fork; `fd35-blink` — The Blinking Line; `fd35-boat` — The Boat; `fd35-glass` — Glass on the Line.

**Current ending sequence:** `fd35-roof` (The Low Roof) → `fd35-shadeline` (Shade on the Line) → `fd35-glass` (Glass on the Line).

- **B — `cl35-fd35-roof` (The Low Roof)**, main slot 9/11. A fault runway, low thorn roof and tears with shade; there is no cart or rail glyph in the room. Low launch was introduced in W22 and revisited in W23. This is a plausible slot for a new cart or other world-object job, provided any secret entrance stays connected. Stored route: 166 frames, 16 held-input segments. Attachment check: attached door/secret or socket, secret host.
- **B — `cl35-fd35-shadeline` (Shade on the Line)**, main slot 10/11. One cart on three rail tiles hands into a long fault/tear chain with shade. Two Carts already ties moving seats to shade pressure, and Blinking Line adds a route-relevant arrival phase. This later single-seat continuation is a lower-confidence repetition candidate. Stored route: 229 frames, 12 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 36. The Fractured Cliffs — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `ft36-chain` — Glass Chain; `ft36-release` — Two Panes; `ft36-ladder` — Glass Ladder; `ft36-deck-ring` — Deck to Ring; `ft36-long` — Long Chain; `ft36-bite` — The First Chain; `ft36-tide-head` — The Tidal Chain; `ft36-storm` — The Storm Chain.

**Current ending sequence:** `ft36-bite` (The First Chain) → `ft36-tide-head` (The Tidal Chain) → `ft36-storm` (The Storm Chain).

- **B — `cl36-ft36-moth` (Glass Between)**, main slot 7/12. Despite its stable ID, this room has no moth: one ring, two panes, two three-tile fault perches and two tears. Glass Seam already combines one ring, two panes, fault perches and tears; the geometry differs, but the object jobs repeat. Stronger slot for actual rope/enemy or rope/cargo interaction. Stored route: 142 frames, 12 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl36-ft36-staple` (The Staple)**, main slot 9/12. One ring, one pane, one three-tile fault perch and tear transfer repeat the resources already used through Glass Chain, Glass Seam and Glass Between. Unlike Long Chain there is no rope-length-dependent tally. Replace this simple resource chain before the adjustable-rope puzzle. Stored route: 141 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 37. The Fractured Shores — Fractured, 11 main rooms

**Keep as scaffolding or protected sequence:** `fs37-slack` — Slack Water; `fs37-launch` — Launch; `fs37-spring` — Spring Tide; `fs37-buoy` — Buoy; `fs37-super` — Spring Super; `fs37-belled` — Belled; `fs37-landfall` — Landfall; `fs37-road` — The Colony Road.

**Current ending sequence:** `fs37-belled` (Belled) → `fs37-landfall` (Landfall) → `fs37-road` (The Colony Road).

- **B — `cl37-fs37-wreck` (Wreck Lift)**, main slot 2/11. Sixteen float tiles lift fault perches toward a tear while shade follows. Slack Water has already used tide/floats in a three-lane sequence, and Launch follows with a stronger two-launch relationship. This isolated lift reprise is a possible slot for a new tide-controlled object role. Stored route: 169 frames, 14 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl37-fs37-tern` (Under the Spray)**, main slot 5/11. No tern or other enemy is present: fault footing, a low roof, a tear and shade form a super-to-rise transfer. The later Landfall really combines float, moth and ring. Prefer the latter for the enemy lesson; this former enemy slot can regain an interactive timing target. Stored route: 141 frames, 13 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 38. The Fractured Colony — Fractured, 12 main rooms

**Keep as scaffolding or protected sequence:** `fc38-lamps` — Lamplight; `fc38-smoke` — Pit Smoke; `fc38-glance` — A Glance; `fc38-family` — A Quiet Question; `fc38-speed` — Faster Than a Hop; `fc38-release` — Let Go; `fc38-watch` — The Watch; `fc38-road` — Beyond the Watch.

**Current ending sequence:** `fc38-shade` (Two Shadows) → `fc38-watch` (The Watch) → `fc38-road` (Beyond the Watch).

- **B — `cl38-fc38-line` (Lines Out)**, main slot 4/12. Two tear crossings pass thorn curtains under a sweeping lamp; ten fault tiles are the perches. It repeats the tear/sightline interaction of W18 Washing Line and the immediately preceding smoke/tear teaching. A more developed exposure/arrival problem can fit here. Stored route: 111 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl38-fc38-shade` (Two Shadows)**, main slot 10/12. A short line of smoke-covered fault stones with a lamp ahead and shade behind. Lamplight/Smoke already establish shelter departure and Glance adds shade across three lanes. This later one-line restatement has fewer distinct object jobs than the neighbouring Release/Watch combinations. Stored route: 106 frames, 9 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 39. The Fractured Path — Fractured, 11 main rooms

**Keep as scaffolding or protected sequence:** `fp39-windows` — Sun Window; `fp39-engine` — Switchback Engine; `fp39-low` — Low Light; `fp39-beat` — The Beat; `fp39-pilgrim` — The Lower Rest; `fp39-shade` — The Shade; `fp39-gate` — The Sun Gate.

**Current ending sequence:** `fp39-road` (The Engine Road) → `fp39-glass` (Glass in the Sun) → `fp39-gate` (The Sun Gate).

- **B — `cl39-fp39-line` (Line of Sun)**, main slot 6/11. A tear crosses one thorn curtain to fault footing under two shutters. Beat already combines shutters with phase, glass and a longer route. Keep the two-mouth arrival timing if replacing this shorter reprise; it also hosts a secret doorway. Stored route: 154 frames, 10 held-input segments. Attachment check: attached door/secret or socket, secret host.
- **B — `cl39-fp39-panes` (Panes)**, main slot 7/11. Two panes, six phase tiles, six fault tiles and a tear, but no beam/shutter field. It repeats remapped dash parity after Low Light and Beat without making a light change matter. A bank replacement should restore a physical light/state consequence rather than merely add another pane. Stored route: 113 frames, 13 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

### 40. The Fractured Palace — Fractured, 14 main rooms

**Keep as scaffolding or protected sequence:** `fs40-court` — Sun Through Stone; `fs40-ends` — Both Ends; `fs40-glass` — Glass in the Dark; `fs40-flume` — The Light’s Door; `fs40-crown` — Ring Light; `fs40-engine` — Noon Engine; `fs40-dawn` — The Throne at Dawn; `fs40-morning` — The Glove of Morning; `fs40-noon` — The Last Noon; `fs40-sea` — The Sea Terrace.

**Current ending sequence:** `fs40-morning` (The Glove of Morning) → `fs40-noon` (The Last Noon) → `fs40-sea` (The Sea Terrace).

- **B — `cl40-fs40-hours` (The Hours)**, main slot 2/14. Four timed tears over thorn curtains onto six fault tiles; no beam, portal or phase field. It repeats the sequenced tear-clock family established in W33/W35. Keep the chapter opening synthesis in Court; this early reprise can be replaced by a fresh timing problem. Stored route: 110 frames, 10 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.
- **B — `cl40-fs40-deliveries` (Two Deliveries)**, main slot 10/14. Three folded lanes use fault footholds, shade and two connecting tears; no lantern, projectile, beam or portal remains. The saved route repeatedly performs low long launches from similar fault stones. This is a concrete repetitive-pattern candidate immediately before the boss, not a claim that its execution is easy. Stored route: 292 frames, 25 held-input segments. Attachment check: no named quest/secret/bearing attachment detected in this room definition.

## Practical placement cautions

- **Worlds 1–6:** several rooms that look sparse are the first lesson for a new verb. A creative room can replace one only if its early safe geometry teaches that verb before combining it. In particular, do not require blade/parry/portal inputs before the corresponding campaign unlock.
- **Worlds 12–18:** the repeated plain road family is objectively present, but several such rooms are intentional decompression or quest hubs. W14 Rail Head and W16 Tide Below come after bosses. W12 Middle Landing, W14 Last Landing, W18 Quiet Question and corresponding Fractured hubs are deliberately protected; a simple map is not enough reason to remove a narrative junction.
- **Worlds 21–24:** introduce advanced movement in order. Preserve a readable first super, hyper/wavedash, ultra and wallbounce. Later bank rooms can then test their use under hazard timing or changed world state.
- **Worlds 25–40:** often already combine three or more pressures. Do not equate an old room name, a short route or a repeated symbol count with low difficulty. The B candidates identify repeated object jobs; varied geometry may still make them valuable. Compare human ratings after placement.
- **Names can mislead:** Fractured Glass Between (`ft36-moth`) has no moth; Under the Spray (`fs37-tern`) has no tern; W40 Two Deliveries has no cargo, projectiles or optical delivery. Match bank rooms against the actual map/device fields, not names inherited from the Base room.
- **Difficulty distribution:** current /5 bank estimates and old /10 campaign ratings are not a common dataset. Plan a measured sample across each world after substitutions, including the first room, both replacement slots, a pre-finale room and the finale, before claiming a balanced statistical distribution.

## Evidence and reproducibility

- `public/bladefall-climb-worlds.js`: the current 40-world built registry, including exact main sequence, maps, device definitions, per-room tapes, quest/secret links and old difficulty aggregates. Each `CL.addWorld` is one JSON record.
- `scripts/climb/spec.mjs`: authored main-road orders, rooms deliberately saved for later, road reflection/lift constraints and protected narrative structure. Connector definitions in the built asset are excluded from the main counts above.
- `scripts/climb/build-climbs.mjs`: how entrances/seams and separate checkpoint fires are composed; some room entrances must close while played to preserve their puzzle.
- `scripts/rbr-src/*.mjs` and `*.tapes.json`: authoring geometry and canonical input provenance. Actual placement should use the built Climb definition because it may be reflected or patched.
- `docs/playtest/room-reviews-2026-10-01.csv`: old human ratings cited verbatim, with their original scale.

Checks for this document: all forty world IDs exist exactly once; every named candidate and keep ID belongs to that world’s authored main road; counts derive from the built sections with connectors/passages excluded. Candidate map/device fields and stored input tapes were inspected; this is a placement inventory, not an exhaustive anti-bypass audit.

Asset SHA-256 at inventory time: `6ec7abd2fcb90f033e5e5336d32591ba9984335d223a0d2bb057f7c958e4effa`.
