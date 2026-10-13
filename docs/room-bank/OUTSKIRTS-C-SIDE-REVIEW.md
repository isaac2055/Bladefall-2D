# Outskirts C-side playtest

Two versions of the first C-side are ready for local review in 7.322.0. Each has three short sections with separate fires and retries, ending in a Sentinel challenge. Both develop the Base Outskirts’ gaps, broken footing and dash control alongside the Fractured Outskirts’ supers and Sentinel surfaces. Difficulty is an author estimate of 5/5; your playtest decides whether the movement feels fair, satisfying and suitably harder than both campaigns.

Open **Extras → Room Bank → C-side candidates** in a localhost build or the offline app. The public website hides Extras and does not register these candidates. Run `npm run serve` for the default local server, then use [the C-side review menu](http://localhost:8371/precision.html?pitch=bank&mode=review&group=csides).

## The two versions

| Version | Main idea | Sections | Clean recorded play |
| --- | --- | --- | --- |
| [A The Broken Road](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f81) | Carry forward momentum across broken islands, learn a reversing road, then launch from the hammer through a rising finale. | F81–F83 | About 15 seconds |
| [B Homeward Bell](http://localhost:8371/precision.html?pitch=bank&mode=review&room=bank-f84) | Change direction on the broken road, use a reverse super, then launch home from the Sentinel’s raised shoulders. | F84–F86 | About 13 seconds |

Recorded times exclude retries, room transitions and reading. First attempts will take longer. Version A’s last room chains three supers from one hammer commitment; version B’s last room chains two shoulder-launched supers into a final upward crystal transfer. The boss’s native withdrawal animation supplies the deadline; its visible bell opens the gate.

## Playing and reviewing

Each fire restarts only its own section. **Escape → room select** lets you practise any of the three sections, and **Watch the intended route** shows its saved completion. Both versions have their own chapters and local timing records. Replaying a completed set starts that same version.

Review mode offers Fun, Difficulty and Suitability after each section. **Rate room** also accepts an unfinished attempt. Export your reviews when ready; the records include each section’s stable ID and revision.

Useful feedback is where the next action became unclear, which landing felt unreliable, whether the super or reverse super felt natural, and which finale you preferred. A creative alternate solution that keeps the movement challenge is welcome.

## Verification and scope

All six sections have saved zero-death routes. The core checker also passes twelve specific input-duration variations and eighteen ordinary jump/up-dash shortcut attempts. Bounded independent searches found no ordinary jump/dash/climb exit for F81, and no way to exit F83 or F86 without mounting the Sentinel; these searches are not an exhaustive proof against every alternate route.

The live browser completed all six sections through their own fires and chapter transitions with zero deaths. A later eight-pixel refill adjustment in F84 was checked in the core, including two positive timing variations; further browser access was declined. The checker verifies settled-fire starts, separate three-room registration, local/public visibility, and byte-for-byte preservation of all 132 earlier Room Bank source records and the campaign integration files.

Run `node scripts/room-bank/cside-outskirts-check.mjs`, or add `--search` for the independent bounded searches. `node scripts/room-bank/check.mjs` checks all 138 bank routes and their recorded cases. Evidence is in [cside-outskirts-check.json](cside-outskirts-check.json) and [cside-outskirts-browser.json](cside-outskirts-browser.json).

The offline copy builds successfully and the changed assets match their source files. The broad release audit still fails its existing reference-discovery and size-budget checks; those are separate from the candidate route and registration checks.

These are review candidates in batch 21, with no optional routes or hearts. They have not been imported as campaign world 101, do not award a C-side completion or plant reward, and do not settle the campaign skip policy. The other nineteen C-sides await the outcome of this first comparison.
