# Main-game optional stories: delivery audit

The functional first pass implements 20 optional quests with short, medium and harsh dialogue routes. This is feature delivery, not certification of the entire game or the final v4 design. Combat, final rewards, richer art, map redesign and Fractured quests remain separate work.

## Player-facing requirements

- All 20 characters appear in their main-game regions, with local objectives, ordinary Up targeting and return conversations. Slot 14 is cut. None of the 20 Fractured stages installs these quests.
- Short accepts promptly. Medium offers two optional follow-ups, an acceptance and a longer closing exchange. Harsh is a specific insult or dismissal with a lasting social consequence and no reward; four stories defer it until after the relevant physical work.
- Short and medium give the same provisional rank 2/3 reward. The usable placeholder is a one-use regional rest restoring two blood measures. There is no carried quest inventory or new currency.
- Saves retain decisions, completed work and reward claims. Refusal does not undo a rescue or erase physical work. The service keeper intentionally rebolts his optional entrance after an insult; the ordinary route remains available.
- Campaign, level-select preview and shared co-op decisions have separate persistence. Host-confirmed rewards are replay-safe, including a lost acknowledgment followed by reconnect.
- Keyboard selection, Escape, landscape touch taps and scrolling work. The journal is available without the map. Portrait gameplay still uses the existing rotate-device overlay.

## Character and consequence review

Every row below has short/medium/harsh state and rendered-dialogue coverage. The loop column identifies a continuous local route check, including real movement, objective interaction, return and reward collection.

| Stage | Quest / voice | Successful consequence | Harsh consequence | Loop |
|---|---|---|---|---|
| 0 | Gatekeeper: clipped, watchful, repeats conditions | Tries a chair toward camp after the bell moves | Remains at his post | Simple |
| 1 | Place That Will Not Remain: affectionate, practical interruptions | Shares supper; refuge disappears on a later visit | Eats by candlelight without you | Simple |
| 2 | Clockwork Defector: careful complete sentences, literal uncertainty | Follows briefly, then chooses sunlight | Repeats his patrol despite the stopped gear | Ability |
| 3 | Blind Cartographer: precise qualifications and self-correction | Moves his desk to listen to the chimes | Secures chimes and withdraws directions | Puzzle |
| 4 | Borrowed Courage: defensive starts, anxious practical questions | Crosses despite losing the helmet; can rescue the knight | Practices behind cover alone | Ability |
| 5 | Archivist’s Burden: restrained, exact, personally evasive | Takes books outside; separate burn choice remains consequential | Packs but ends the conversation | Simple |
| 6 | Stand Aside: dry workplace language, short replies | Leaves service entrance on the latch | Rebolts entrance | Simple |
| 7 | Perfect Day: plain domestic instructions, understated affection | Thaws room and shares a meal | Thaws it without your company | Simple |
| 8 | Little Winter: quick handling instructions, affectionate profanity | Creature chooses cold and settles | Keeper rigs another cooling arrangement | Puzzle |
| 9 | Quota: irritated maker versus literal procedural breaker | Counters loop scrap while both rest | Workers refuse your help | Simple |
| 10 | Small Work: formal technical accuracy revealing nervousness | Bird inspects intact birdhouse | Automaton withdraws its hands | Ability |
| 11 | Tea on the Ceiling: familiar interruptions, different assumptions | Shares tea through linked tables | Neighbors complain about you together | Puzzle |
| 12 | Other Side: simple sensory observations and hesitant requests | Freed figure chooses the lights | Freed figure avoids you | Puzzle |
| 13 | Last Alarm: brisk safety commands, patient instruction | All-clear lets defenders rest | Bellkeeper finds another volunteer | Simple |
| 15 | Bell Below: urgent fragments, worksite vocabulary | Miner restores his name to the ledger | Rescue stands; he ends the exchange | Ability |
| 16 | Good Luck: economical deck instructions, dry understatement | Sailors share charm and work together | Sailors cooperate without you | Ability |
| 17 | All at Once: hurried organizer versus wary, blunt soldier | Soldier chooses a quiet seat at his party | Party continues without your invitation | Simple |
| 18 | One Spoon at a Time: firm boundaries, specific evidence requests | Mother chooses to try water in her own cup | Accepts Sable’s help but rejects yours | Ability |
| 19 | Lightest Pilgrim: genteel circumlocution and self-conscious humor | Admits contradiction and makes lunch | Carries his own sack without inviting you | Simple |
| 20 | Night Garden: formal address mixed with practical horticulture | Closed shutters allow flowers to bloom | Gardener withdraws; closed shutters stay closed | Simple |

Voices use syntax, rhythm, occupational vocabulary, familiarity and conversational habits. Regional and educational implications stay light; accents are not rendered through heavy phonetic spelling. These are text performances, not recorded voice acting. Ideas emerge through requests and consequences rather than explicit philosophical explanations.

## Verification and limits

Evidence lives in `docs/evidence/side-stories/`; runnable checks are `scripts/validate-side-story*.mjs` and `scripts/validate-side-stories.mjs`.

- **101 focused tests pass**, including 64 side-story tests. Evidence: `focused-tests.log`.
- **60 browser dialogue paths pass**, with reload persistence, reward claim-once and harsh lockouts. These use physical fixtures and granted abilities; they prove dialogue/state integration, not traversal. Evidence: `dialogue-validation.json`.
- **20 continuous local loops pass**: ten simple, six ability/escort/transport, four portal/Echo/gravity puzzles. They start at regional checkpoints with earned-kit fixtures, then use real inputs and normal interaction selection. The mother starts with the restored spring; actual tap opening is independently checked. The figure starts at a post-Tyrant checkpoint. These are not a full campaign playthrough from a fresh save. Evidence: `route-validation.json`, `ability-loop-validation.json`, `puzzle-loop-validation.json`, `water-validation.json`.
- Save/Continue, checkpoint death, harsh-after-work, refuge return timing, keyboard, landscape touch and Fractured exclusion have separate checks. Their JSON receipts document fixtures.
- Two browser clients pass production packet encode/receive integration for shared decisions, guest progress, follower poses, conflicts, rewards and reconnect/replay. The transport is in-memory: real remote WebRTC signaling was not tested. Evidence: `coop-validation.json`.
- All 40 success/refusal return tableaux were captured and visually inspected across five sheets in `outcomes/`. They use saved-state fixtures and simple placeholder art, not staged gameplay proof.

## Wider regression report

The broader suite finished with **1,153 passing and 71 failing of 1,224 tests** before the final fixes. Preserve this as a historical result, not a current failure count. Full output: `full-suite.log`.

Three isolated Continue harnesses omitted the newly referenced side-story module; their contexts were corrected and the three tests rerun. One genuine geometry regression put the gatekeeper climb over the first mandatory gap. The climb now stays on the gate side of camp; the original coyote-boundary test and the full gatekeeper loop pass.

The remaining basic-jump expectation still fails with side-story obstacles removed. The existing shared ground-pound test fails identically with the entire world adapter replaced by no-op methods. These comparison runs isolate those failures from quest geometry/world behavior; they do not prove every other failure predates this work. Evidence: `tas-without-side-stories.log`, `coop-regression.log`, `coop-without-side-stories.log`.

Other broad failures include missing globals in isolated VM contexts, source-text assertions and existing campaign/White Court/recall runtime checks. They have not all been independently isolated. **The repository-wide suite remains non-green and whole-game release QA is still outstanding.** The optional-quest checks above pass; unrelated game systems were not rewritten to satisfy the broad suite.

## Deferred design work

Refine knight/Echo motivations and endings; multidirectional regional maps; weapons and damage; enemy/boss resistance and pacing; powers and revisit uses; regional consumables and shops; actual reward balance; Fractured optional quests; richer character art and full-playthrough pacing/accessibility. These are the later passes requested by the user, not missing functional branches in this delivery.
