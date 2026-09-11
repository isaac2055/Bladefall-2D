# Bladefall experiential remaster roadmap

## Factor analysis

This program is eight runs because the remaining work is content-wide but no
longer engine-wide. The split is driven by six factors: shared-system dependency,
campaign blast radius, boss regression risk, co-op authority, authored-content
volume, and whether each result can be playtested independently.

| Run | Focus | Principal deliverable |
| ---: | --- | --- |
| 1 | Causal interaction foundation | Elemental airflow, shared interaction state, diagnostics, visuals, tests |
| 2 | Opening act | Outskirts, Black Woods, Brute, and Updrafts authored around teach/test/twist |
| 3 | Keep act | Hollow Marksman, Ruined Keep, Warden, and Frostfell environmental integration |
| 4 | Elemental act | Frost Sorcerer, Emberdeep, Ember Colossus, and Inversion interaction chains |
| 5 | Finale act | Void Tyrant, Abyss King, Gilded Vault, and Deep Line authored synthesis |
| 6 | People and place | Distinct travelers, follower utility, environmental lore, and NPC presentation |
| 7 | Remix and reward | Rule-changing NG+1/NG+2 variants and the NG+2 second-follower secret skin |
| 8 | Integration | Campaign balance, co-op authority, completion, performance, accessibility, and release QA |

Four level groups keep a failed encounter edit from destabilizing the entire
campaign. NPC/lore work stays separate because it touches save, dialogue,
followers, rendering, and co-op state. NG+ and its reward wait until the base
campaign's causal grammar is stable, so remixing changes known rules rather than
moving targets.

## Run 1 acceptance

- Fire, ice, and storm projectiles can prime wind, updraft, and portal-routed
  airflow without introducing a new player input.
- Ignited air burns ordinary enemies, frost currents slow and briefly freeze
  them, and charged currents deal readable pulse damage.
- Element-matched enemies resist their own environmental reaction, while bosses
  remain protected from accidental interaction cheese.
- The reaction follows projected airflow through portals because the source
  field owns truth.
- Air force changes are shared by player and ordinary-enemy physics.
- Each reaction has distinct field visuals, a semantic activation event, and
  diagnostics available through `window.__BF.interactionState()`.
- Unit tests cover channel geometry, source ownership, reaction aggregation,
  expiry, projectile authority, and force modification.

## Run 2 acceptance

- The opening quartet no longer resumes the generic coda hazard rotation after
  its signature portal set-piece. Each stage ends on an authored synthesis and
  exposes its beat/system receipt through `window.__BF.openingActState()`.
- Outskirts teaches the elemental-airflow rule with a latching plate that sends
  fire through an updraft, then tests the resulting current before the
  portal-airflow fling.
- Black Woods teaches both-mouth placement with a deliberately plausible low
  exit. A nearby traveler can mark that surface as a crossed-out decoy, while
  the high exit remains the momentum-preserving solution.
- The Brute arena replaces its repeated wall-jump/crumble chimney with an
  escalating falling-mass staircase: hostile falling blocks become the timed
  platforms that carry the player to the reward.
- Updrafts turns its sky portal into a storm-current circuit. The direct bolt
  misses the current; the high portal route charges it and carries the attack
  into a defender guarding the exit.
- Tagged teach, test, twist, recovery, and reward beats make the intended
  campaign grammar inspectable without coupling the game to a level editor.

## Run 3 acceptance

- The Keep quartet suppresses incidental low-gravity and updraft tiles, so its
  signature fields appear only where they participate in an authored lesson.
  Receipts are available through `window.__BF.keepActState()`.
- Hollow Marksman connects pendulum timing and a moving approach sightline to a
  shuttered arena. The shutter blocks incoming and reflected arrows while closed,
  so the bank shot must be timed while arrow rain prevents passive camping.
- Ruined Keep makes the rescued traveler an essential second body: the traveler
  holds the starter, the player portals a cube upward, and a gravity catch guides
  it into a broad crate-only receiver. The vertical catch basin and cube recall
  remove the old wall-edge softlock.
- Warden removes the fixed exit mouth. The player must place both personal mouths
  on opposite sides of the boss; only a traversal that crosses the Warden creates
  a short damage window, and the slowly turning shield can still spoil a frontal
  punish.
- Frostfell turns its three-height sightline into a thermal circuit. The miner's
  lamp marks two plausible decoys, warmth restores grip on the ice gallery, and
  only a portaled fire bolt that ignites the wind can open the receiver. Its coin
  now rests on a reachable post-gate shelf.
- Crates now sample the same authored wind, updraft, low-gravity, and gravity-well
  forces as other actors, allowing environment fields to route payloads without a
  one-off puzzle physics path.

## Run 4 acceptance

- The elemental quartet exposes its authored receipts through
  `window.__BF.elementalActState()`. Incidental accents and detached optional
  compositions no longer compete with each stage's causal interaction chain.
- Frost Sorcerer retains active pursuit, blinking, tracking shots, and ground
  denial. Its siphon now oscillates and accelerates after each stolen spell, so
  hiding beside the portal mouth is not a complete solution; capture must be
  timed across three increasingly brief alignment windows.
- Emberdeep fuses its traveler and lava mechanics into one room. The essential
  traveler does not rubber-band through the barrier; holding the relay opens the
  barrier and materializes a moving, crumbling bridge across the live furnace.
- Ember Colossus removes the detached crossfire trial and random elemental
  accents. A captured molten shot must physically travel through the bounded
  coolant current before the forge accepts it and creates an armor-breaking slug.
- The Inversion's second interval alternates ceiling, floor, ceiling, and floor
  footing, forcing repeated polarity changes. Its coda uses no generic hazard
  roulette or detached gravity well and culminates in the existing two-mouth
  crate lock with four plausible decoy surfaces.

## Run 5 acceptance

- The finale quartet exposes its authored receipts through
  `window.__BF.finaleActState()`, including boss phase metadata and the Deep
  Line's live route-signal count.
- Void Tyrant's approach no longer inserts the unrelated living-enemy relay,
  gravity-well composition, or random low-gravity/updraft accents. The arena's
  opposed walls explicitly communicate the low, middle, and high rebuild order;
  each phase still clears the pair and accelerates the barrage.
- Abyss King's approach similarly removes detached airflow and rotor accents.
  The four floor panels are numbered and the active separation is highlighted,
  while later crown fractures retain the approved mid-echo portal hijack.
- Gilded Vault preserves its tuned six-act, combat-free precision course. Its
  furnace clock, needle walk, vertical shaft, three-height two-mouth arc, moving
  crucible, and prize gallery are now tagged as one inspectable authored chain;
  the low and high arc bands remain physically plausible decoys.
- Deep Line's two dangerous high routes now bank persistent signal charges. A
  visible capacitor before the Black Gap converts one or two earned signals into
  an increasingly durable launch surge; the ordinary full-speed route remains
  viable with no signals, so route mastery rewards rather than gates completion.

## Run 6 acceptance

- Every campaign traveler now has a deterministic regional identity, name,
  occupation, palette, silhouette, dialogue voice, and environmental role. The
  authored cast comprises Mara, Bram, Ilyra, Tovin, Nim, and Sera;
  deterministic assignment keeps both co-op clients visually consistent without
  creating a second authority path.
- Retrieval objectives are no longer two copies of a generic lantern story:
  Mara's rolled field chart and Ilyra's animated brass wind-vane have different
  world art, pickup text, requests, and return dialogue while retaining the
  existing reward and completion contract.
- Follower utility is legible as character knowledge. Bram's and Nim's working
  lamps reveal deceptive stone, Nim's banked flame alone restores frost traction,
  Tovin is identified with the Keep's two-body gate, and Sera remains the
  essential portal relay. Command feedback and the HUD name the companion being
  ordered.
- One non-solid lore artifact is safely placed on stable terrain in every stage.
  Each is a regional memory tied to an existing mechanic or place; ordinary hint
  boards remain hidden, and reading lore changes no objective, hazard, save,
  completion, or co-op authority state.
- Traveler names and occupations appear only at conversational distance, active
  companions retain their health and HOLD/FOLLOW cues, and each role gains
  silhouette-specific equipment without replacing the game's established
  hooded-Hollow visual language.
- Runtime receipts are available through `window.__BF.peopleState()`, including
  traveler identities, abilities, lore positions, and read state.

## Run 7 acceptance

- NG+ is now a deterministic remix rather than number scaling alone. All 16
  stages have a unique named contract drawn from seven reusable environmental
  laws: Rift Renewal, Crystal Resonance, Elemental Wake, Living Weather, Hazard
  Tide, Marked Quarry, and Brittle Breath.
- NG+1 activates one stage law. NG+2 preserves that law and layers a distinct
  second law, so learned variants deepen without silently replacing their first
  rule. Contracts appear in the stage banner and HUD with readable descriptions.
- Existing world events drive every remix: air crystals leave low-gravity
  echoes, elemental deaths create primed currents, crumble collapses exhale
  updrafts, timed spikes travel in waves, personal portals renew movement, and
  portal-routed ordinary enemies become marked quarry.
- Living Weather cycles authored wind and updraft fields through the existing
  fire, frost, and storm reaction system. Temporary fields share normal force,
  interaction, portal-projection, and rendering paths rather than using bespoke
  physics.
- The evolved familiar now remains aboard the Deep Line cart in NG+2. Completing
  that level together outside Test Mode permanently earns the hidden Linewalker
  skin through save-schema version 5.
- The Linewalker’s playful perk is Rift Bloom: the player’s own portal transit
  releases small twin blasts at both mouths and refreshes movement on a four
  second cooldown. Bosses are explicitly immune, preserving encounter balance.
- Catalog validation and director cooldown behavior are covered by unit tests;
  runtime diagnostics are exposed through `window.__BF.remixState()`.

## Run 8 acceptance

- All 48 campaign combinations (16 stages across Base, NG+1, and NG+2) assemble
  without runtime errors or authoring failures. The campaign blueprint and
  release balance catalogs remain valid after every remaster layer is applied.
- Completion truth now matches visible combat truth. The Inversion’s ceiling
  residents are included in its enemy total, so a 100% result requires all 23
  enemies, its coin route, and any traveler objective rather than silently
  ignoring the optional-ceiling population.
- Co-op world snapshots now include named travelers, quest-item state, crystal
  cooldowns, and temporary NG+ fields. Guest traveler and crystal interactions
  travel over the reliable event channel; the host validates them and republishes
  canonical state while ordinary loot remains personal to each player.
- A partner can ask, recruit, command, relay, or finish a traveler objective
  without the next host snapshot undoing it. Completed fetch rewards are locally
  deduplicated, and a shared quest item cannot become stranded on a disconnected
  authority path.
- Temporary low-gravity echoes, elemental wakes, and brittle updrafts retain
  identity, lifetime, and elemental reaction state across host snapshots.
  Environment-field composition is cached per simulation tick to avoid repeated
  array construction across actors and crates.
- Remix status exposes an accessible spoken description, the gameplay canvas and
  pause control have semantic labels, and the Linewalker’s rift mark stops pulsing
  and rotating under Reduced Motion. Existing large-text, contrast, captions,
  camera, and combat-cue settings remain intact.
- `window.__BF.integrationState()` reports current completion truth, authority
  surface, accessibility settings, runtime timings, renderer budget, and release
  health from one browser-test receipt.
- Sustained high-quality rendering on the densest audited campaign stage remains
  inside the release budget with no long samples, runtime/storage errors, or
  release blockers. The offline and deploy manifests include the complete
  versioned asset set.
