# Timing-room design notes — batch 04

The user asked for moving environmental hazards in the spirit of Celestial Resort: observe the path, time a jump/grab, reach a pause, then read the next move. Return Freight and The Weight Must Stay were their favourite prior rooms. Those preferences are stronger direction than generic difficulty inflation.

## Research

Maddy Thorson's [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) describes widening timing and positioning windows through coyote time, input buffering, corner correction and brief storage of moving-platform lift. The design lesson we apply is demanding movement with forgiving execution windows. This batch does not tighten the shared movement physics or remove its existing grace rules.

A [firsthand player critique of Celeste's cycles](https://stephensopinions.com/2019/05/19/celeste-2018/) describes frustration when later hazards cannot be seen early and there is no place to stop and adjust: small differences in earlier movement change later timings. This is one player's assessment, not a universal verdict. It motivates explicit observation/rest positions in these rooms.

Maddy's [GDC level-design workshop](https://gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste) is a further primary reference on building and arranging hundreds of individual Celeste stages. The practical rules below are our application to Bladefall, not quotations or a claim to reproduce Celeste's exact dust-bunny behaviour.

## Rules for this batch

- Use visible repeatable paths and an observable position/direction cue. A timer number or memorised frame count is not the player's instruction.
- Build at least two meaningful timing stages. Each has a place to observe/recover, an action, and a destination that prepares the next decision.
- Make arrival time matter differently across rooms: following and passing, climbing across patrols, timed boarding/interception, protected descent, return routes and synchronising two ends.
- Keep early timing windows readable and reasonably broad. Fractured can link more actions or require launch momentum, but should still make the next hazard legible.
- Avoid long compulsory waits, random phases, off-screen surprises and single exact-frame solutions. Room resets repeat the schedule; study rooms start it on the first action.
- Preserve interesting alternate solutions. Check the obvious route that ignores the hazard or skips the meaningful object, rather than forcing hidden event receipts.

Each new record documents its timing principle and at least two cue/action/rest stages. Saved tapes demonstrate one feasible route, not measured fun or universally enforced waiting. A skilled player may carry a favourable cycle through a rest spot without pausing.
