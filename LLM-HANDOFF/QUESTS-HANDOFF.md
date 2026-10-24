> Current voice rule: read [VOICE-POLICY.md](VOICE-POLICY.md). Quest implementation approval does not authorize dialogue or recordings.

# Quests handoff (written at 7.376.0, 2026-10-23)

Read `00-START-HERE.md` first, then this. The code wins over any document. Owner is Isaac (they/them).

## The job, in order

1. **Fix six things** in the three reworked quests (list below). Ship per the START-HERE recipe.
2. **Then propose 5 more quests for each game in base mode** (Explore base regions, Ascend base worlds 1–20; the Outskirts is done and stays as it is). **Write the proposal as a document and stop. Build nothing until Isaac approves.** Format at the end.

## What exists (3 quests, both modes)

Elsie (Black Woods), Silas (Broken Causeway) and the Archivist (Ruined Keep) were rebuilt in 7.375.0 so each step has you go somewhere and do something different. The old steps were "walk to a marker beside the giver and press Up". Do not bring those back.

| Quest | Explore steps | Ascend steps |
|---|---|---|
| Elsie · A Place for Supper | follow the lantern moths east until they settle; carry the lantern home (a hit and the moths take it back); split Hale's log with the blade | chase the moths through her branch; carry the lantern back (a death and the moths take it) |
| Silas · The Clockwork Defector | strike the governor's bright tooth; walk Silas west to the sunlight (he moves only while you move; patrol arms knock him back); hang his key on the toll tower hook | strike the governor's bright tooth in his branch; take the key from his back and hang it at the top of the next climb |
| The Archivist · The Archivist's Burden | any order: break the bricked reading room; climb to the steward's account on the wall top; gather 5 belfry pages in 22 s | the same three accounts in his branch rooms; then bring them to him |

### Where it lives

- **Explore**
  - `public/bladefall-quest-errands.js`: the `STORIES` table (positions, step kinds) plus `install`/`update`/`draw`. Step kinds: `chase`, `carry`, `chop`, `tooth`, `lead`, `find`, `gather`.
  - `public/bladefall-side-story-world.js`: hooks (install, update, draw), `completeTask(id,task)`, `KEEPS`, `rideLine`, `grantReward` (reward text).
  - `public/bladefall-side-stories.js`: the quest records (`tasks`) and the spoken lines (`SPOKEN`, a JSON blob near the end).
  - `public/bladefall-explore-mounts.js`: the shortcut rides (Elsie's moths, Silas's trolley, the Archivist's bell-ropes).
  - `public/bladefall-causeway-story.js`: now only Silas's layout.
- **Ascend**
  - `public/bladefall-climb-errands.js`: `QUESTS` (step lists, lines, HUD text), `tick`, `draw`. Every spot is a point on a room's intended route (`routePath`), so it is always reachable. Progress is in localStorage `bladefall.climb.errands.v1`.
  - `public/bladefall-climb-view.js`: `errandCtx()`, `touchReward` and `drawReward` skip these quests' branch-end hearts (`ownsReward`). The heart is granted by `ctx.claim(q)` → `grant(q)` when you hand the thing over. `announce('♥ Heart · …')` is the only feedback today.
- **Shared rules:** Isaac's design rules are in `~/.claude/projects/-Users-computer-Projects-Bladefall-2D-Antigravity/memory/quests-do-different-things.md`. Design notes for all 19 regions are in `docs/plans/quests-and-coop-proposal.md` (seeds, not approved).

## Isaac's rules for quests (keep every one)

- Steps are different things to do, out in the region. No "press Up at three markers", nothing right beside the giver.
- No dialogue options. Conversations run one way; a decision is allowed only if it serves the quest and is never forced.
- Explore rewards: the region's unique shortcut ride, sometimes plus a vitality fragment, forge seal or weapon boost. **No healing** (checkpoints make it pointless). Ascend rewards: hearts (shortcuts also fine).
- Nothing in the story is off limits.
- People who reappear elsewhere are seen travelling there. Ground attacks stay on the floor. Rewards come from optional quests.
- Judge by the first minute of play. Look at the screen, not only the tests.

## Part 1 · The six fixes (Isaac's feedback after playing 7.376.0)

1. **Ascend: finishing a quest must be obvious.** Add a small award animation: a quest heart appears and flies or settles into the HUD heart count, with a short sound. There is already `st.burst` (a heart burst, used by `touchReward`) and `BladefallClimbRewards.celebrate` (the plant growth) to reuse. Do it for all three quests; the Archivist's three accounts, Silas's key and Elsie's lantern each need an unmistakable "this is the end".
2. **Explore, Silas: the "Strike the bright tooth" prompt never goes away, even after you succeed.** Cause: in `draw` of `bladefall-quest-errands.js` the tip is shown whenever the quest is active and you are near; it does not check that the step is still the current one. Show a tip only for the current step, and give success a clear beat (the gear stops, the line changes, the next goal is stated).
3. **Explore, Silas: the walk past the patrol arms is a chore.** He follows too slowly (`lead()`, 70 px/s, and only while you are moving), so you walk back and forth until he happens to pass. Isaac wants a direct path with occasional pauses. Make his pace match the knight's run, keep the arms as the thing you pause for (they should read clearly and be passable by waiting a beat), and make knock-back rarer and obvious. `scripts/quests/errands-check.mjs` currently zigzags to pass this; rewrite that part of the check to walk straight with pauses.
4. **Explore, Archivist: the pages are too easy.** They sit close together on the belfry ledges and do not move, so the step has no interest. Rework it: spread them across the belfry, and make the wind matter (pages that drift, blow along a route, or sit where you must use the room's own movement). Keep it a timed gather only if the time creates tension. Update the check.
5. **Explore, Archivist: the end of the quest is not shown.** After the last page, nothing says "done, return to him". Use the same clear completion beat as fix 1 and 2 for every Explore quest: a visible cue at the thing finished and a pointer to the giver (the floating "DONE · RETURN TO …" text in `completeTask` fades too fast to notice).
6. **Check the same clarity for Elsie** (last step: the log) and the other steps; any step that finishes silently needs a cue.

When finished, keep these passing:

- `node scripts/quests/errands-check.mjs` (Explore, headless)
- `node scripts/quests/climb-errands-check.mjs` (Ascend)
- `node scripts/climb/watch-check.mjs 2 3 6`, then `npm run verify:watch` (all 71 routes must reach their exit)
- `node scripts/quests/branch-rules-check.mjs` and `node scripts/quests/published-refresh-check.mjs`
- `node --test tests/side-stories.test.mjs`; the Silas test in `tests/coop-runtime.test.mjs` (`--test-name-pattern=Silas`)
- `node scripts/verify-precision-core.mjs` (440)
- Screenshots: `scripts/quests/errands-shots.mjs` and `climb-errands-shots.mjs` write to `.cache/quest-shots/`. Look at them.

## Part 2 · Propose 5 more quests per game (no building)

Write `docs/plans/quests-round-2-proposal.md`. For **each game mode, 5 quests in base regions** (not the Outskirts, Black Woods, Causeway or Ruined Keep). The Ascend quests should be the same characters and stories as the Explore ones, told as a climb (that is how the first three work). For each quest give:

- region, giver, and the story in two or three lines;
- every step: **what the player does** (verbs differ from step to step and from quest to quest), where it is, and which region device it uses (the region's device, in a combination the main road does not use);
- the turn: one thing that goes differently from what was asked, discovered in the world;
- what the giver does (moves, works beside you, is seen going somewhere);
- what changes in the region afterwards: the Explore shortcut ride (what kind: flight, zip, blink, ground, cage, throw, etc.), and for Ascend which room on the road changes;
- reward: Explore shortcut, and say where a vitality fragment, forge seal or weapon boost makes sense; Ascend: heart;
- how it would be proven (the checks it needs; Ascend spots must be on the intended route; nothing may break `verify:watch`);
- risks (boss arenas, geometry you would have to touch; **do not change level geometry without asking Isaac**).

Seeds for each region are in `docs/plans/quests-and-coop-proposal.md` (Part 3 for Explore, Part 4 for Ascend); improve or replace them. Aim for variety across the five: chase, escort, carry, timed, a machine or mechanism, a stealth or a pursuit, a puzzle that uses the region's own device. Then stop and tell Isaac.

## Harness traps (learned the hard way)

- Preview servers started by Claude are sometimes stopped from Isaac's side. Use the headless harness `scripts/quests/harness.mjs` (serves `public/`, no service worker, installs `window.__q` helpers).
- A weapon is not equipped in the harness: set `G.p.weapon=oathbladeWeapon()` before striking.
- Starting an Ascend world forgets who you spoke to: `st.spoke` must contain `<room>:<person>` (the Ascend checks do this).
- Ascend ticks that run quest logic skip dead/respawning states; keep that.
- Never run more than 2 headless Chrome jobs at once. Never use bare `git stash`.
- Explore watch/TAS determinism: quest code that uses randomness or real time must not run under watch/record. The errands module uses `G.time` and frame counts only; keep it so.
- Ascend Together (the two-player puzzle rooms, 7.375.0) is a separate feature: `public/bladefall-climb-together*.js`, `scripts/together/`. Not part of this job.

## Open items, for context

- The new quest lines are not voiced (`scripts/voice/lines.json` + `build-voice.mjs`).
- The other 16 base regions still use the old marker steps.
- Real PeerJS between two machines has not been tested; Isaac tests Ascend Together online.
