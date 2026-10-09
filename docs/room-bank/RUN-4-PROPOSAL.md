# Run 4 proposal — after the Run 2/3 review

> Historical proposal: superseded by the [original five-run plan](RUN-PLAN.md) and [Run 4 delivery](RUN-4.md). The user has now authorized Run 4. Its actual scope is new movement techniques combined with new entities; the broader directions below are design lessons, not a replacement scope.

**Proposal only. No Run 4 rooms have been built.** The immediate work is banking the approvals and making the requested revisions. Review those first; their reception should decide which directions earn more rooms.

## What the feedback tells us

| Evidence | Design lesson |
| --- | --- |
| B34 was a highlight: releasing cargo enables an upward dash; catching it preserves the useful rise. | A restriction becomes a problem to solve. The discovery is the order of familiar actions, not an unfamiliar button. |
| B35 was fun: the same weight loads a launch, travels with the knight, then returns to restore shade. | An object doing two causally connected jobs creates a room, while unrelated obstacles merely lengthen it. |
| F36 was approved: move the seed by the short route, take the long route around it, meet it on the useful side. | Planning an encounter in space is as valuable as executing it precisely. Setup and execution should affect one another. |
| F34 worked although F33's wallbounce felt redundant. | A familiar movement is worthwhile when another system changes why, where or when it must happen. A new timing allowance alone need not feel like new gameplay. |
| F31/F32 and F35 allowed ordinary movement to skip their central idea. | The route must physically require the important capability. A successful intended tape only proves possibility; it says nothing about necessity. |
| F37/F38 were approved as Base, not Fractured. | A moving object, long animation or imposing layout does not establish difficulty. Count the decisions and recoverable commitments the player actually makes. |
| F30's preview worked while manual attempts failed. | Input state is part of the design. The stale rope after echo swap was a bug, not an execution challenge. Test the ordinary way someone will hold the controls. |

B33 also has a useful place: easier material can still be strong. A balanced reserve needs well-made approachable rooms as well as demanding ones. Qualitative approvals are recorded as such; they are not fabricated numeric scores or a measured difficulty distribution.

## Recommended scope

Start with **four Base and four Fractured rooms**, once authorized. Use the current vocabulary for most of the set. Do not add an entity merely to make the batch look new. A new rule should solve a concrete missing interaction, then receive an explicit compatibility check before a room relies on it.

Each proposed room should answer a short question before layout work begins: **What must the player discover, and why does the obvious alternative fail?** It should also name its closest existing room. If the answer is only a longer crossing, a smaller landing or a vertical version of that room, replace the concept before polishing it.

I would investigate three directions:

- **Separate the traveller from the useful object.** For example, send a lantern through a fixed portal to provide shade at a destination reached by a different bodily route. The puzzle is arranging their reunion. This follows B34's ordering principle without repeating its throw/updash/recatch arrangement.
- **Prepare the encounter from the other side.** Let a blade interaction relocate a launch origin or alter access, then require approaching it by another route with useful speed or from a different angle. The follow-up must change the interaction, not simply make the first seed room longer. Avoid relying on seed portal transit, which is not supported.
- **Spend a support only when its second job is finished.** An enemy can be a barrier, weight or rebound target before the finishing hit changes the route. A moving solid can first block light and later supply departure velocity. Build the decision around when to stop preserving it. Check the specific actor's collision/weight rules rather than assuming all enemy families behave alike.

Keep the room questions different across the set. Limit repeated central cargo solutions; the current revisions already explore several. Use portals where their rotation or separation creates a discovery, rather than inserting a portal into every route.

## Base and Fractured should differ in the problem

Base should usually contain one substantial discovery followed by forgiving execution: a safe setup area, visible consequences and a useful landing. Ordinary movement can be difficult without requiring a named speed technique.

Fractured should connect two or three decisions: arrive with a selected state, preserve something during the transfer, then use it differently at the destination. A reverse launch, pogo choice or moving-anchor release should earn a particular trajectory or access that ordinary jumping cannot provide. Greater difficulty should come chiefly from these commitments and their combination; do not obtain it by turning the final input into a near frame-perfect demand.

The easier version of a good concept belongs in Base or in introductory material. Harder companions should change the route dependency, not duplicate the layout with extra thorns.

## A short authoring loop

1. Sketch the discovery, nearest comparison and obvious bypass before building.
2. Test the uncertain interaction in isolation only far enough to know its actual rules.
3. Build and save the full room and route immediately.
4. Try the obvious plain jump/dash, sword-reach and wall-climb alternatives that could remove its central decision. Keep clever alternatives that still solve that decision; close trivial bypasses with visible geometry. Never require an invisible receipt for using a named move.
5. Check several useful input timings and a human-style keyboard/controller attempt. If a player who knows the solution struggles to reproduce it, diagnose state/order/cues before tightening anything.
6. Stop once the room is reviewable. Human fun, difficulty and suitability scores determine whether it stays and where it belongs.

The original [tech report](../design/SURVIVE-TECH-REPORT.md) and [entity report](../design/SURVIVE-ENTITY-REPORT.md) remain references. This proposal applies the actual room feedback to those possibilities; it does not replace either report or authorize Run 4 construction.
