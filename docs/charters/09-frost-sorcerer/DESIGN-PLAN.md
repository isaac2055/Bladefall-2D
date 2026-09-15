# White Court — next-level design plan

Status: implementation in progress, 2026-09-15. The original run-3 plan below
remains the acceptance scope. See IMPLEMENTATION-STATUS.md for verified work
and outstanding requirements. This work does not reopen Brute, Marksman or Warden.

## What exists and what must survive

The runtime already has a chasing/blinking Sorcerer, tracking ice shots, a
vertically oscillating siphon and ground denial. `captureSorcererSpell` currently
collects three redirected shots, opens a 4.5-second stun/exposure and deals 12%
of maximum health. The receiver resets and the loop repeats. Camping near the
first mouth accelerates the blink. The old arena has a broad slate floor and an
authored horizontal exit; nearby-anchor rules force one-place mode even if the
player owns the pair. These are starting points, not a finished phase design.

Entry is the Causeway high shaft (`brute-sorcerer`, Wall Jump + Double Jump).
The aqueduct (`frostfell-sorcerer`) is initially sealed and opens from White Court;
its Frostfell landing is already implemented at (14920,650). The exit to Emberdeep
requires Attunement, awarded by this boss. Preserve these contracts and saved
endpoint identities. Verify the exact generated arrival before placing geometry:
the current south endpoint is nominally 30% across the White Court, not x=0.

The player owns Jump, Weapon, Dash, the portal pair, Wall Jump, Counter and Double
Jump. No route or boss deduction may require Attunement, Companion Command,
Downward Strike, a specific drop, or an equipped optional Echo. Jetpack stays in
Updrafts. Counter can offer an advantage without becoming the only solution.

## Purpose and pace

Frostfell taught endurance and exposed ice landings. The changed return gave the
new movement a use in familiar places. White Court should now turn *positioning*
into control over hostile magic: stay mobile, select a useful surface, lure a
committed shot, and use the stolen spell to change the arena.

Give the arrival a quiet, inhabited landing and a small service task before
resuming pressure. Open the aqueduct from this side early, before the boss, so a
return to Frostfell no longer requires the entire long itinerary. This is an
access reward, not a new fast-travel system or an excuse to remove known anchors.

Working spatial outline for the existing ~16,000-unit region (ranges are design
reservations; final placement must fit the measured connector arrivals):

| Space | Draft range | Player experience / physical change |
| --- | --- | --- |
| West sluice | 0–3600 | Optional short walk from the entry refuge to unbar the aqueduct. A visible water wheel, reciprocal landings and a readable return route. |
| Sluice yard and refuge | 3600–5600 | Causeway arrival near its preserved south endpoint; rest, shop and two workers with separate occupations. No hostile line of fire through the refuge. |
| Thaw court | 5600–8200 | Broad ground with two optional elevated paths. Enemy ice briefly turns a water channel into footing; the player spends the second jump to leave it before it fractures. Misses return to dry shelves. |
| Glassworks | 8200–10800 | Show the *new* consequence of a stolen spell: a small moving condenser freezes a crossing when struck. This is not another basic portal tutorial. Give the emitter a visible cadence and limitless retries. |
| Petition gallery | 10800–12500 | Mix an honest moving receiver with a few repositioning enemies. A quiet overlook shows the boss, receiver and reachable slate surfaces together. Rest/checkpoint before commitment. |
| White Court and exit | 12500–16000 | Distinct boss arena, then protected Attunement acquisition and a short safe demonstration opening the Emberdeep door. |

Keep most jumps forgiving. Reserve one optional high route for a delayed second
jump, with a visible landing and a reward rather than mandatory maximal gaps.
Water, ice and supports must be real geometry; no attractive scenery that looks
like a usable floor but is not one. The aqueduct latch must remain open after
rest, death, loading another zone and reloading a save.

## People, rewards and narrative

The refuge's sluice keeper maintains a channel that no longer reaches a river.
A glassworker warms empty molds; the shapes resemble familiar medical vessels
without naming them. Their small task is to restore the service wheel locally,
not fetch objects back through completed levels. They remain out of combat and
react to the reopened waterway.

Use one optional material/reward cache on the high thaw route and one readable
sealed recollection in the gallery. Do not scatter a second currency economy.
The boss's Attunement is the compulsory access payoff; an Echo or equipment drop
is additional, never the key to beating the boss itself.

The Sorcerer mistakes petitioners for an absent court. Glass, white cloth and
repeated orders echo earlier imagery. Do not explain the diagnosis or reveal the
ending. The two workers' practical needs should remain intelligible without
knowing the metaphor.

## Boss: three different cold states

Use the existing chase, theft and siphon primitives, but make each state change
what the player does. Keep the Sorcerer active between casts and expose him near
a reachable attack position. Tentative tuning is an implementation starting
point, not a claim about current balance.

1. **Still water.** A clearly marked single orb commits toward the player's last
   visible position. The receiver traverses a slow, generous height band. The
   player redirects the orb and earns a melee opening; the first break freezes
   a *small* useful crossing, visibly changing the arena. A dry route always remains.
2. **Divided current.** Two staggered casts and a lateral receiver path ask the
   player to change approach side. The first orb's tell identifies it as the
   useful payload; the second pressures the previous position. Brief, local floor
   frost changes braking, not every surface at once. A stolen spell clears one
   pressure patch and exposes the Sorcerer on the newly safe side.
3. **Breaking court.** The receiver uses two readable stop points separated by a
   moving interval. Committed targeted ground marks and a faster reposition force
   the player to act at range and then close. Double Jump crosses a warning sweep;
   Counter can reclaim space but is not required. The last ward visibly collapses
   into a conventional, short finishing opportunity with a safe retry if missed.

Keep two or three *total successful ward breaks* as the first timing target,
then measure a typical fight around two to three minutes. Do not blindly retain
three captured orbs for every exposure across every phase; that is why the old
loop can feel repetitive. Set final counts from playtests, not HP arithmetic alone.
No numerical “1/3” labels: use missing ward segments, posture, impact flash,
receiver charge lights and distinct sounds. Readability must also survive muted
audio and reduced-motion settings.

Prototype the boss with independent player mouths on a few broad, reachable
floor/wall slates. Remove the old automatic anchor *inside that arena* if this
mode is chosen, because its proximity rule otherwise silently overrides pair
placement. Preserve the earlier glassworks teaching setup. Both required slates
must be accessible without using the spell they are meant to redirect. Confirm
mouth ownership and capture normals in the real portal system before finalizing
layout; do not emulate a successful teleport by moving the projectile directly.

## Active control and fair retries

A strikeable condenser paddle requests the next committed cast sooner. It costs
position and a short warning, not a consumable. Natural casts continue if the
player ignores it. This gives an active recovery from a missed payload without
making a permanent stun loop. Never require waiting through an entire slow
receiver revolution before another useful shot can exist.

Anti-camping should be a warned attack at the stale position, not an untelegraphed
teleport onto the knight or a secret portal cooldown. Movement of the receiver
should be readable before a shot is committed. Give strategically correct shots
forgiving capture bounds; inspect near misses instead of requiring exact pixels.
Missed spells dissipate safely at arena bounds. A wrong pair can be cleared and
replaced with the existing controls. No accumulating irreversible ice walls,
scarce ammunition, lethal checkpoint teleport attacks or Test Mode requirements.

Death restores the starting arena, boss state, receiver charge and hazards, while
keeping the aqueduct, earlier rewards and campaign progress. A previously defeated
boss stays defeated. Attunement must have a recoverable pickup/interaction state
if the player leaves immediately after victory or reloads before claiming it.

## Implementation order and acceptance evidence

1. Record the live connector coordinates, old boss transport contract and a clean
   capability prefix. Author the refuge/aqueduct and prove both directions with
   real inputs, including loading a save whose aqueduct was already opened.
2. Build and input-test each ordinary traversal beat. Prove that mandatory paths
   work without optional Echoes; use negative capability checks where a new
   Double Jump lesson is supposed to matter. Keep a recovery landing below misses.
3. Prototype one complete theft → receiver → exposure loop with the real portal
   system before expanding phases. Test correct orientation, a near miss, a stale
   pair, repeated misses and the active cast request.
4. Add phase-specific geometry/cold changes, then time real fights. Check damage
   readability, muted audio, reduced motion, both approach directions, different
   ordinary weapons and players who never Counter. Do not mistake a state mutation
   fixture or a boss threshold for a won fight.
5. Verify death, checkpoint retry, rest, reload, completed-boss revisit, reward
   idempotency, aqueduct persistence and the post-reward Emberdeep door. Update
   charter receipts, handoff, version/cache and deployment mirror. No deployment
   without the owner's explicit request.

Before shipping, the room-by-room bot should report its exact remaining failures;
a human playthrough must still judge pace and legibility. The current generic bot
is not proof that a later boss or an entire new level is completable.
