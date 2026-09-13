# Changes since the previous handoff — refreshed 2026-09-13

This reconciles the August handoff with current source, retained test evidence
and the owner's subsequent decisions. Implementation and future proposals are
separated deliberately. Stable source symbols are preferable to obsolete line
numbers in the large `public/index.html`.

## 2026-09-13 — pushed, merged, and the iCloud eviction

The branch was pushed and GitHub `main` fast-forwarded (`dd2d9a7` → `707e473`,
then handoff-only commits). Before that could happen, macOS had evicted almost
the whole working copy — every loose Git object and most of `public/` — to iCloud
placeholders, because the folder lives in iCloud-synced `~/Desktop` and the disk
had filled; iCloud refused to return them for ninety minutes while the account's
storage was full. Nothing was lost: after rehydration `git fsck` was clean and the
suite was 500/500. The hazard and its one-line check are in
`06-ESSENTIAL-FILES.md`. The public Netlify site was not redeployed.

## 2026-09-13 — owner review: the recall outside Frostfell is not enough

Playing `7.96.0` back from Frostfell, the owner met none of what Frostfell's
strike delivers — new, more, larger, smarter, tougher enemies — in the Warden.
Correct: the four return regions got three to five posts of three shared types
and no change to any existing enemy, and the Warden's posts stand two thirds of
the level away from the mine arrival while first-visit deaths persist. The
automated evidence proved hygiene, not impact, and `tests/muster-recall.test.mjs`
forbids the very buff the owner wants. The intent, the exact state and the
approved plan are in `12-RECALL-WORK-ORDER.md`; it supersedes the recall wording
below. Verified the same day: the event itself (strike → save → reload → any
region) works; the shortfall is content, not plumbing.

## 2026-09-11 — foundation, deferred issues, the bot, the recall

Eight commits on `chore/track-authoritative-tree` (`135fc6f` … `707e473`), grouped
here by theme, each with its own evidence:

- **Foundation.** The full suite, never rerun after Frostfell, had 8 failures: six
  stale source-shape guards and two real shipping defects. `bladefall-harness.js`
  was loaded by `index.html` but shipped by neither `sw.js` nor `build-deploy.sh`;
  `release-check.mjs` only validated manifest→index and kept its own drifting
  asset list. It now parses `build-deploy.sh` and checks index→manifest (73→93
  assets). `make-working-copy.sh` excluded `index.html.pre-multiplayer.bak`, which
  `recollection-player.html` loads, so lean copies had a broken postgame.
- **Deferred issues.** Bram never completed at all (nothing set `done`; the
  escort payoff lives in `nextStage()`, which Black Woods never calls); his lesson
  now concludes at the root wall with a persisted quest event and a regional
  payoff. Gilded Instinct, Rime Step, Cinder Oath and Hushed Shape are wired;
  `gifts.test.mjs` fails on any Gift with hooks and no runtime call, and
  `echoes.test.mjs` locks the five unread Echo hooks so the list can only shrink.
  The aqueduct's Frostfell half is validated in the running game.
- **The bot.** `scripts/bladefall-bot.mjs`: geometry-derived ledge graph, macro
  search with save/restore branching, a mechanism layer for doors, exact failure
  reports. It also exposed that `saveState()` threw on three stages because an
  elite roll stored a function on the entity. See `TESTING.md` for reach and the
  five lessons that cost the most time.
- **The recall.** `MUSTER_ROSTERS` for Warden, Outskirts, Black Woods and Broken
  Causeway; three archetypes (shieldbearer, linesman, signaler); one event source;
  idempotent install; deliberately no health inflation — which the owner has since
  rejected (see the 2026-09-13 section and `12-RECALL-WORK-ORDER.md`).

## Opening, followers and westward return

- The startup softlock came from the Outskirts western updraft ignoring
  `requiresWorld` in `activeEnvironmentFields()`, plus an ungated spring. Both
  now honor `keep-west-seal`; the spring visibly reads as locked before access.
  The normal spawn is still `(70, 0)`; the clean TAS baseline is `(350, 0)`.
- Camp Echo's Sentinel ignores damage until deliberately challenged
  (`sentinelVigil` / `vigilChallenge`), preventing early weapon cheese.
- Broken Causeway's two switches release the route without an extra return to
  a release interaction. Preserve the separate boss machinery sequence.
- Bram is an essential/invulnerable traveler and no longer renders health
  hearts. His truth-lamp reveals false/invisible footing within 660 horizontal
  and 520 vertical units; damage checks use a 660-unit radius and line of sight,
  applying 8 damage every 0.5 seconds to eligible enemies. Nearby revealed fake
  and invisible platforms have distinct visual treatment, without obvious labels.
- Bram already carries his lamp. There is no missing lantern pickup. His truth
  lesson ends at the root wall near x=9600. The old reward/continuation mismatch
  (the payoff lived in `nextStage()`, which this streamed exit never calls) was
  resolved on 2026-09-11 by `concludeRootboundLesson`; see above. Do not invent a
  promised reward or fetch quest when explaining him.
- The Aerie Harness is stage-local: it must not leak beyond Updrafts. Return
  handling restores access to its traversal rather than stranding a player who
  used the service shortcut. `restoreUpdraftsReturnGear` and stage-load handling own it.
- The Rain-Catcher Service Lift is the Updrafts shortcut between x=13790 and
  x=2410 (near Bellows Rest). It opens with the third collector, so it can
  legitimately be active before Ruined Keep. Keep-return text/map naming were
  corrected rather than treating that earlier activation as a second lift.
- Clinging Archive's objects respond to Up. The Keep Key opens the western
  seal; return barriers gain intended Wall Jump surfaces. The Outskirts breach
  platform breaks on the intended underside hit but supports a landing from
  the right pillar. The restored draft supports the final chimney; preserve
  real collision clearance, not just nominal jump-distance arithmetic.
- High sealed Recollections are optional return discoveries with later movement
  access, not initial-visit requirements; finding one does not make it playable
  before the Waking Key.
- Gilded Instinct was implemented on 2026-09-11 (`updateCacheSense`): standing
  still for 0.7 s makes unclaimed caches, keys and sealed memories within 560 units
  glint. It reveals only what already exists; the description says so.

## Warden's accepted final fight

The approach retains its three Turning Cells, with guard movement/commitment
repairs. Exploration changed from ClockWork to **Whispering Woods**; **Element**
remains the boss track. Opposed personal-pair crossings create punish windows
in the earlier phases. Phase transitions clear old placed portals.

Phase three uses a redirectable chained rush:

1. A returned rush visibly hurts him and consumes the pair. The first of the
   two blade-adjacent lure platforms disappears.
2. A second returned rush consumes its new pair and removes the other platform.
3. The final returned rush consumes its pair, breaks the armor and immobilizes
   him on the ground at one health. He needs one final weapon hit to die.

Pillars and rotors keep moving throughout; stopping them was explicitly rejected.
In the broken state he creates a telegraphed AOE at the player's current position
(first after 1.6 seconds, then every 3 seconds; 0.82-second warning). This can
threaten a distant player; it is not just a slam around his stationary body.
Sentence AOEs deal one Blood without checkpoint relocation, and respect Test
Mode immunity. Impact flash, particles, sound and shake communicate portal damage;
do not restore numeric `1/3` labels. Counter and the Frostfell road are the reward.

## Frostfell: implemented settlement and reward

Stage index 7 / displayed level 8 is a custom **15,100-unit** level. See the
[Frostfell charter](../docs/charters/08-frostfell/README.md) for room spans.

- Banked Refuge: White Exchange/Venn, Essa, stove, rest, ledger and a single
  Counter lesson on dry ground.
- Working Streets: ice with dry islands. Nim starts only on Up, is invulnerable,
  lights three persistent braziers (x=2590, 3260, 4100), then settles at x=4350.
  The hearth grants one Forge Seal (`authored:frost-hearths`) and opens the works.
- Thermal Works: emitter at `(5050,110)`, plausible low/high decoy slates,
  useful slate at `(5500,230)`, authored return at `(5800,340)`, wind and receiver
  `(6260,340)`. Actual portal-routed fire latches `frost-thermal`, thaws the floor
  and opens the gate. Ordinary sword hits cannot solve it. Attunement is not
  required here; it belongs to the later optional Rime Key.
- Thawed Court: Double Jump at x=7250 on safe ground, upper galleries, optional
  recollection near `(8110,270)`, and court passage `(7220,210)`.
- Preview/TAS jump velocity now reads `activeCapabilityProgress()`, matching
  jump-count authority. This fixes a locally earned second jump with no strength;
  ordinary campaign progression retains its same authority.

## Frostfell: implemented finale, travel and Muster

The owner's first review found the settlement uneventful. The follow-up added
Frozen Stair, Exposed Galleries and Muster Crown, with **20 elevated landings**,
ice braking, fixed spikes, timed strips, and three intermediate dry checkpoints.
The first exposed ascent has no slate or wall-cling bypass of the Double Jump
lesson. Heights reach y=700; the supported summit is y=650. Falls use one-Blood
checkpoint recovery. A bespoke TAS branching search found and replayed a
damage-free route; it is not a general autonomous level-solving bot.

Muster Engine `(14400,650)` activates on Up. Its six-second sequence holds gameplay
while camera, gears and bell animate; the strike at 2.4 seconds sets permanent
`frost-muster`, adds impact feedback and a burgundy atmosphere, and changes
**Drifting Memories → ClockWork**. The synthesized `muster-bell` cue has a caption.
The owner wants the consequence to be a surprise: no warning hints. Re-entry
restores the changed state without replaying the cinematic.

`FROST_MUSTER_ROSTER` adds **11** authored ordinary enemies: four frostpikes,
three frostsingers, four rimehulks. Original and new enemies get one 55% max-HP
increase; existing health ratios/deaths are preserved. Hulks have larger shielded
silhouettes and deal **two Blood** on contact; singers fire paired frost bolts.
Patrol bounds protect refuge/shelter approaches. Stable IDs and installation
before zone hydration prevent duplicate spawns or repeated HP multiplication;
ordinary rest-reset persistence remains. No defeated boss is revived. The new
roles are registered in ecology (17 ordinary species total). **That was 2026-09-10; the four-region recall followed on 2026-09-11** (see the
top of this file; 20 ordinary species now).

Both mine terminals use deliberate Up and arrive at `(330,0)`. Holding Left
alone cannot trigger another crossing. Counter still gates the Warden exit.
This preserves the folded connection without mirroring levels or controls.

Service passages are at refuge `(1330,0)`, court `(7220,210)` and summit
`(14680,650)`. Before summit use the two-stop route remains. Using the summit
sets `frost-summit-service`; thereafter fresh Up cycles refuge → court → summit
→ refuge. Old saves need to use the summit to register the third stop.

Rime Key's later Attunement/fire seam and the future White Court aqueduct sit
on the summit deck. Aqueduct arrival is aligned at `(14920,650)`, but that future
cross-zone connection has not been validated as a completed route.

## Harness and autonomous play: actual scope

See [TESTING.md](../TESTING.md) and [TAS notes](../docs/tas/README.md). The existing
opt-in runner was extended, not replaced: `?tas=1`, `window.__BF.tas`.

- `resetGame()` uses fixed seed `0xB1ADEFA1` and Outskirts `(350,0)`.
- Injected input drives the player; automatic gameplay/rendering is paused.
  `stepFrames(n, inputs)` advances exactly n fixed 1/60-second frames.
- `getPlayerState()` exposes the existing movement/timer names in plain JSON.
- `resetGame({preset:'portal-momentum'})` is the narrow ability/pair setup hook.
- `saveState(name)` / `restoreState(name)` clone full single-level simulation
  state, references, RNG streams, inputs, progression and private subsystem state.
  Manual steps use simulation-owned randomness/time. DOM, audio hardware and
  external subscribers are excluded; async transitions are outside the contract.
- Tests cover strictly rising ground speed to 200, jump 480 with gravity 1400
  (launch-frame vy about -456.6667), both boundaries of 0.1-second coyote time,
  portal speed magnitude/orientation with the 150–1400 clamp, and byte-identical
  branched replay. Movement assertions use tolerances; replay identity is exact.
  `wall-slide` can appear while rising; check contacts and velocity together.

The owner's broader goal was a local bot: heuristic toward a target, branching
search when stalled, then geometry-derived segments to the exit, reporting the
winning inputs or the exact failed segment. **That bot exists since 2026-09-11**
(`scripts/bladefall-bot.mjs`, `npm run bot`): it completes The Outskirts, Black
Woods and Broken Causeway from cold with byte-identical replay and reports the
exact failed segment elsewhere; portal placement is the verb it lacks. `tas:smoke`
is harness evidence, not campaign completion, and Frostfell's bespoke solver is
separate. See `TESTING.md` for reach and the lessons that cost the most time.

## Plans and design guidance — not new implementation orders

Read the [return proposal](../docs/frostfell-return-proposal.md). Its original
“proposal only” and foreshadowing paragraphs predate the subsequent decisions:
finale and Frostfell activation are implemented; advance-warning hints were
rejected; the world-wide recall has a thin first implementation that the owner
reviewed as not noticeable, and `12-RECALL-WORK-ORDER.md` now specifies it.

The proposed broader recall should make the long Warden → Outskirts → Woods →
Causeway return interesting through authored new roles, access, rewards and
changed occupation. Ultimately consider past and future regions, not only one
return corridor. Preserve solved gates, dead bosses, NPC progress and fast travel;
do not repeatedly inflate HP on reload — but do apply the one-time world-wide
buff the owner asked for on 2026-09-13. `12-RECALL-WORK-ORDER.md` is the spec;
the return's rewards and later regions follow it.

Frost Sorcerer / White Court remains the next chapter to design: aggressive
chase/blink and moving siphon, changing cold-state phases, active recoverable
setups, no permanent portal camping, Attunement reward and later elemental return.
Levels 10–16 retain their master-vision targets; they are not newly completed.

Gemini's observations are supporting review prompts, not a new constitution:
rewards should matter in the world; bosses should offer active ways to provoke
useful states; portal capture should tolerate sensible alignment; teach before
pressured use. Pre-Marksman projectile teaching already exists. Ember Step burning
roots is only an example, not approval to gate progress on optional equipment.
Colossus cannot require Downward Strike before awarding it. Future polish can
add enemies or adjust platforming in completed levels when requested.
