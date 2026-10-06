# Workshop review and campaign placement — 7.244

29 September 2026. This is a placement proposal, not a campaign migration. The workshop has ten candidates, four approved Base rooms and ten approved Fractured rooms. The original A–F demonstrations are hidden from navigation; their internal IDs remain stable for existing saves and evidence.

## What Celeste contributes to the design

The useful puzzle is predicting a movement consequence: which landing must still exist, where a carried object needs to be before leaving it, which direction a launch will face, and whether the outward journey has prepared the return. Execution then tests that prediction. A sequence can be difficult without having that decision; simply making a corridor narrower does not add a puzzle.

Maddy Thorson’s [Farewell design notes](https://exok.com/posts/2019-11-25-chapter-9-design/) describe exploration around new objects, including carrying and throwing the jellyfish to activate a switch. Their [forgiveness notes](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) explain buffering, corner correction and stored lift momentum. Our interpretation is to make the route logic demanding while keeping the intended input reliable. Bladefall retains its renewable dash rather than copying Celeste’s one-dash economy: geometry and environmental state decide when using it is helpful.

## This review

- **H-F, M-F, N-F, P-F, Q-F:** approved and banked. Their authored layouts and saved input recordings are protected by the bank fixture.
- **K / K-F:** open, manually steered aether chambers with scattered floor/ceiling islands, turning space, directional spring encounters and deliberate dash exits into cables. Resting docks divide the flight chapters. These replace the automatic narrow flight corridors.
- **M:** the first grown vine now releases a visibly connected root brake on the later hoist. Skipping that vine leaves the hoist locked. Both dormant vines show curled growth before unfolding. The accepted second-vine placement remains.
- **O-F:** approach perches sit above and within diagonal dash reach of the pressure pods. Downward diagonal entries generate upward recoil; the third approach reverses the direction again before inversion and the exit cable.
- **Q:** two lift/rebound/cable sections, standing docks at both ends of both cables, a ring transition and a closing bell. The original opening remains the first half.

## Five new Fractured candidates

| Room | Decision to discover | Precision after solving it |
|---|---|---|
| **R · The Unspent Step** | Dashing changes both the current supports and the future route. A backward jump preserves a state that the next dash must change; a blade launch later avoids an unwanted toggle. | Reverse direction over a low roof, time the next state change, then connect pogo, bell and ring. |
| **S · Borrowed Weight** | A lantern can be carried for float or left in a socket to raise a ballast lift. The player and lantern travel different routes before being reunited. | Throw into the elevated receiver, climb around the lift, return to recover the lantern, then set up the second crossing. |
| **T · Second Impression** | The lower ledges remember actual landings. At the turnaround, only those remembered steps produce the upper return path. | Traverse outward, reverse through the prepared upper ledges, then catch the exit cable and blade launch. |
| **U · Quiet Garden** | The dash that grows a temporary vine also wakes nearby thorn growth. Choose where to trigger it and whether to clear the growth or let it settle. | Stage the next dash in a safe pocket, clear the waking branch and use the vine before it withers. |
| **V · Return Address** | Dash direction programs a remote carriage destination. The obvious forward command is not always the useful future landing; the later control sends the same carriage back toward the player. | Reach the first rendezvous, reposition the carriage for the upper route, then carry the solution into inversion and a ring release. |

These are candidates for review, not automatically banked. The puzzle state resets with each attempt. Decorative cues show device relationships before the player commits.

## Twenty-level organization

There is enough vocabulary for twenty distinct **level focuses**, without requiring twenty new permanent abilities. A focus can be an environmental rule, an ability introduction or a new application of a familiar action. Do not force a new unlock merely to fill a row.

| # | Level | New focus | Base approval | Fractured approval |
|---|---|---|---|---|
| 1 | Outskirts | Crumbling footing | Proposal | Proposal |
| 2 | Black Woods | Up-pogo pods | Proposal | Proposal |
| 3 | Broken Causeway | Counterweight momentum | Proposal | G |
| 4 | Updrafts | Jetpack | Proposal | Proposal |
| 5 | Hollow Marksman | Portal redirection | Proposal | Proposal |
| 6 | Ruined Keep | Wall jump | Proposal | Proposal |
| 7 | Warden | Directional recoil pods | O | Proposal |
| 8 | Frostfell | Double-jump commitment | Proposal | I |
| 9 | Frost Sorcerer | Aether form | Proposal | Proposal |
| 10 | Emberdeep | Dash-grown roots | Proposal | M-F |
| 11 | Ember Colossus | Ground-pound anvils | Proposal | Q-F |
| 12 | Inversion | Gravity prisms | Proposal | J |
| 13 | Void Tyrant | Ziplines / tears | Proposal | H / Needle |
| 14 | Abyss King | Delayed echoes | N | N-F |
| 15 | Deep Line | Rail-cart branching | Proposal | Proposal |
| 16 | Thunder Cliffs | Chainhook release | Proposal | L |
| 17 | Landing Shores | Ricochet bells | Proposal | Proposal |
| 18 | Colony | Carried lantern | P | P-F |
| 19 | Palace Path | Dash-switched machinery | H / Switchback | H-F |
| 20 | Sunspire Palace | Light routing | Proposal | Proposal |

Each base level should start with one readable demonstration and then combine its focus with the earlier vocabulary. The menu expands every row into a proposed introduction and later combination. Fractured placements may use the complete kit, but each still needs a recognisable central idea.

The existing permanent unlock order is unchanged. In particular, early rooms cannot assume double jump, ordinary enemy down-pogo, gravity flip or chainhook before their actual rewards. Warden’s approved O demonstration requires a reduced-kit adaptation; it is not ready to paste into the early campaign unchanged. Device-assisted up-pogo in Black Woods is separate from the later downward-strike unlock. Jetpack remains local gear. Zipline introduction could move earlier without changing its basic interaction, but that is still a proposal.

For the current shipped level-by-level mechanics and ability order, see [MECHANICS-INVENTORY.md](../../design/MECHANICS-INVENTORY.md). This table describes desired placement, not claims that those proposals are already implemented throughout the campaign.

## Verification and practical limits

- All thirty internal room recordings finish without a retry, including the ten current candidates. The three visible playlists and desktop/mobile picker pass. Forty-eight applicable mechanism-removal/delay trials pass.
- Fourteen approved layouts and input-recording hashes match their bank fixtures.
- Device checks cover the first-root brake, both ballast directions, selective recorded platforms, thorn warning/bloom/settling, carriage programming, attempt resets and standing on all four Q cable docks.
- Both flight revisions use all four steering directions, at least two spring interactions and two deliberate dash exits. Springs are no longer all mandatory. M’s successful recording includes five recoverable wall contacts; the other nine candidate recordings have none.
- Twenty two-browser candidate runs pass: ten simultaneous and ten staggered, using production packet handling over an in-memory transport. This is not an internet-performance or whole-campaign co-op claim.
- Local mirror rebuilt as **7.244.0**, cache **bladefall-v354-puzzle-workshop**, 236 game files. Not published. The release checker reports the same four existing failures: missing Astra/Fable editor references in the index and the index/respec-renderer size budgets.

Automated recordings establish that the routes work, not that their difficulty or feel is approved. R–V remain candidates for your playtest. The placement plan remains editable without moving campaign content.
