# v4 region redesign — current status

Owner authorized step 3: opening through Frost Sorcerer, one focused region /
puzzle pass at a time. Telegraphs are welcome; explicit warnings and instructional
text signals are the objection. Extend Fable's selected renderer. Follow
USAGE-POLICY.md; do not chase aesthetic approval or run traversal bots by default.

## Outskirts — first implementation pass (2026-09-16)
Version 7.103.0, cache 188. Runtime: index.html, bladefall-respec-renderer.js,
bladefall-dialogue.js. Fable palette, movement and shared pixel grid retained.

- Verge: shallow recoverable beds beneath the first three hops; seated Vey,
  collapsed shelter. Camp: raised refuges and a catch floor after its patrols.
- Watcher's Cut: continuous sheltered low road beneath a separate optional
  lookout route to GLASS / coin. Upper sentry ignores the lower lane, raises its
  weapon before firing, and locks aim at warning time so dropping away works.
- Hollow Mile: two extra refuges. Broken Muster: continuous peaceful ground,
  survey shelter, optional rise to IRON; removed its repeated patrol encounter.
- Six room landmarks now draw behind actual terrain. Opening tent, fence,
  survey post, mile stone, clock, mast, vigil pylon, lantern and gate use legacy
  footprints. Bright caps distinguish walkable masonry from muted scenery.
- Patrol windup / rush / recovery poses use simulation state; walking animation
  follows actual x movement. Vanishing shade leaves a destination shadow, even
  when its old position is offscreen. No awareness / routine text labels.
- Mara is the opening's one speaking resident; Vey/Olan remain quiet figures.
  Up owns one interaction. Mara relocates only after leaving the camera, and
  repeat conversations and completion also require Up. Shorter dialogue,
  physical aligned/unaligned vanes, no survey route/count HUD or NEXT banners.
  Same optional field chart and 35 gold reward; no bag operation needed.
- World endpoints, return hooks, capability order, one-Blood and saved quest
  identities remain. Six fresh avoidance encounters plus the return sentinel.

Verification: tests/outskirts-stage.test.mjs 32/32 pass. Actual production
floor, interaction/reward and perception/shot branches run in VM tests; jump
graph uses conservative single-jump reach. Main inline scripts and changed JS
parse. Local browser inspected Verge, Camp, upper/lower Cut, Muster, tunnel and
offscreen shade tell; warning/rush/recovery render calls completed. This is
bounded mechanics/render evidence, not a complete human traversal or aesthetic
acceptance. Mirror rebuilt; no commit or deployment.

Remaining opening detail: some small secondary props still use prototype sizes;
the return Sentinel still uses fractional canvas scaling (animation state now
persists). Broader boss/mechanism rendering debt remains in work order §6.

## Black Woods — first implementation pass (2026-09-16)
Version 7.104.0, cache 189. Same runtime files as Outskirts.

- Forest trunks, bark platforms, full-size root structures and a connected cord
  from the Oathblade stump to its counterweight extend Fable's pixel vocabulary.
  The cord slackens and the blade disappears when the actual mechanism changes.
- Released Oathblade equips on contact without bag capacity/access; the first
  guard waits farther from the stump and takes two ordinary sword hits. The
  Mothsilk Mantle equips on contact if stronger, changes the cloak's colours and
  never heals Blood. A stronger worn mantle is protected from an automatic swap;
  R still allows a deliberate swap. Other regions' equipment remains pending.
- Six encounters remain, with a quiet mirror-thicket deduction section. Duelists
  commit their direction through windup/lunge even after losing sight. The root
  stalker freezes its destination when vanishing. Drawers show physical attack,
  recovery, shield, root-growth, dive and destination tells, including an
  offscreen stalker's destination. No floating warning words are added.
- Mirror puzzle retains eight real branches, six copies and a wind reversal.
  Both materials share a palette: resin on the windward edge marks real bark;
  copies carry it on the opposite edge. Bram's lamp exposes disconnected grain.
  Two catch shelves and a midpoint checkpoint shorten retry climbs. No portal
  ability belongs in this region; the earlier queue's portal wording was wrong.
- Bram is the speaking resident and requires Up to start/repeat conversation.
  Orra/Pell/Hale remain quiet figures; the dead clock preserves pulse-one lore.
  Bram's essential lamp/follow behaviour, once-only reward and return presence
  remain. Completion has no automatic speech/banner; his lamp stays lit.
- Existing endpoints, rootbound descent, return secret, progression order,
  single-jump route and one-Blood remain. No exit sign.

Verification: Black Woods focused tests 22/22; affected inventory/dialogue and
capability compatibility tests 16/16. Production functions check full-bag
acquisition, no-heal equipment swaps, committed enemies, deliberate Bram and
once-only rewards. Conservative geometry checks cover the real single-jump route
and both recovery shelves. Changed JS and inline scripts parse. Browser checks
confirmed counterweight release → contact equip, mantle/Blood behaviour and Up
starting Bram; inspected clearing, mirror resin, lamp grain and forest tells.
This is bounded mechanics/render evidence, not a full human traversal or visual
acceptance. Mirror rebuilt; no commit or deployment.

## Broken Causeway / Brute — first implementation pass (2026-09-16)
Version 7.105.0, cache 190. Runtime also changes bladefall-quests.js.

- Drop Yard now has one physical contract: the first catch arms the moving
  hoist; its landed weight latches the cradle; this takes tension off the second
  catch, which completes the permanent gate repair. Handles work before talking
  to Oren (quietly starting the existing quest). Old completed repairs still
  open the gate. Missed falls reset. No repair/recall banners or weight sign.
- Oren is the speaking resident; Sable is quiet. Shorter copy removes the false
  instruction to return for completion. Oren moves to the repaired gate only
  while both positions are offscreen; quest identity and 160-gold reward remain.
- Counterweight Rise has opposing vertical carriers and a 325-high bulkhead,
  replacing the optional repeated stair pyramid. Board low, transfer high; both
  directions work before Dash. Continuous ground catches misses. Timing space
  is quiet; five authored encounters remain. Pursuer HP is 33 (was 50), with
  all regular encounters marked no-drop. Ordinary movement numbers unchanged.
- Bow equips on contact or R, without bag access/capacity or healing. Its prior
  blade survives saves/retries. The compact Dash reward offers Keep the bow /
  Return to the blade directly; Blood Vow equips automatically only when the
  campaign's Gift is still the default. Other worn Gifts are preserved.
- All actual player arrows count on rivets/releases; removed the invisible
  airborne-shot requirement. Three distinct rivets still wake the Brute; only
  weight impact breaks armour. Misses reset both releases. Exposed rush direction
  locks during windup, with longer readable warning/recovery. No ! / BREAK words.
- Pixel bow/hero, full-size machinery, connected chains, tension clamps, linked
  carriers, accurate target eyelets, armour shedding and distinct Brute poses
  extend Fable's renderer. Future White Court shaft is a pixel doorway with its
  original wall-jump + double-jump lock. Hidden bloom stays hidden until impact.
- Dash/death progression, one-Blood, no boss exit portal, westward Black Woods
  return and later Court entrance identities remain.

Verification: focused stage/runtime tests 29/29 pass. Production execution covers
repair order, once-only/isolated quest rewards, old saves, bow contact/R and saved
blade choice, arrow identity, weight miss/reset/impact and committed rushes.
Production oscillator + jump geometry checks cover both carrier approaches.
Renderer smoke: 40 finite frames plus targeted Court shaft closed/open checks.
Browser reviewed Drop Yard, carriers, bow, armoured windup/exposed slam and reward
UI; live contact equips, and Continue restores bow + prior blade. JS/inline syntax
and mirror match checked. No full human traversal or difficulty acceptance;
no commit or deployment.

## Updrafts — first implementation pass (2026-09-16)
Version 7.106.0, cache 191. Runtime: index.html, respec renderer and camera.

- Dash landing now checkpoints locally. The released harness equips on contact,
  persists through retries, and needs no bag or conversation. The high Kite
  Terraces mast remains an optional three-verb challenge at its original height;
  its Stormwright's Seal grants one Forge Seal directly, once per source.
- Choir now has two persistent actions: break the cinder vessel and turn the
  high damper. Heat travels through the connected flue before Gate I opens.
  Either action may come first; completed old gates restore both mechanisms.
- Needlewind retains its authored main current, optional branches and dead end.
  A refill nest/checkpoint at the middle low dip shortens retries. Gale Stitch
  fits the local harness directly, without bag access or spending an Echo slot.
- Rain-Catcher retains its sequential moving cups and permanent latches. Pixel
  catch brackets stay fixed at the actual catch coordinates; connected gutters
  show which cup is ready. Basin water/floor now lies above the local void cutoff;
  the camera follows into the recessed floor, and the solved return vent gives
  the service lift a viable westbound departure.
  Both service-lift signs are removed.
- Fields show their actual active bounds/direction, Needlewind art follows the
  collision curve, and the harness, brake cable, damper, sails, cups, Crown
  sockets and plinth use Fable's pixel system and live mechanism state.
- Ilyra recurs at Bellows, Needlewind, basin and Crown only while both old and
  new positions are offscreen. All speech requires Up; Talla/Edrin are quiet.
  Three restored gates release the Crown pickup directly; Ilyra grants no
  permission. First-mouth progression, local harness boundaries, one-Blood,
  return routes and physical high east exit retain their existing identities.

Verification: Updrafts tests 21/21 plus camera tests 8/8. Production-function
checks cover acquisitions, preview isolation, one-Blood recovery, real moving
cup docking, Choir ordering, safe pockets, quarter fuel, Ilyra and Gale Stitch.
Renderer smoke: 29 finite frames. Browser reviewed harness, Choir, Needlewind,
cups, basin floor and Crown; live release/contact and gate transitions work.
Reload → Continue retains local harness, Stitch, Choir and portal without
awarding campaign powers. Inline/external syntax and rebuilt mirror match.
No full human traversal or aesthetic acceptance; no commit or deployment.

## Hollow Marksman — first implementation pass (2026-09-16)
Version 7.107.0, cache 192. Runtime: index.html, respec renderer and quests.

- Watching Road remains the first linked-mouth crossing; Mantlet Works retains
  its moving cover and renewable sentry-arrow repair. Six no-drop encounters
  remain, with the second road runner and Works hound removed. Runners/guards
  now wind up before their committed rush instead of warning during movement.
- Windcut Gallery replaces the repeated wall crossing with a drop-speed launch.
  A 420-high scaffold feeds the floor intake; its horizontal fixed outlet at600
  faces a broad landing at300. Continuous lower ground catches misses. All new
  climb/return steps rise at most 70; the upper token remains at (11310,610).
  Production tuning/portal math gives a conservative 481px neutral launch across
  the 444px span; an ordinary Dash entry reaches only 320px. No new speed lock.
- Daro speaks deliberately on Up and moves to a sheltered far-bank bench only
  when both positions are offscreen after the road repair. Token-before-meeting
  works in one conversation; the optional quest keeps its identity and once-only
  180-gold reward. Senn is quiet. The token/return-loft Seals grant directly.
- The boss still loses its rangefinder to one marked banked arrow, then fights
  as a mobile hunter. Bow draws commit aim before release, grounded firing and
  recovery give melee windows, and failing rail covers warn before dropping.
  Target acceptance now checks the actual shot source and portal traversal.
  Plated covers actually intercept arrows, including a swept collision check;
  the low shelter roof blocks the decoy while the exposed bank remains clear.
- Fable pixel art follows the real bow/aim/shield/cover state and gallery
  scaffold/outlet. Far Thread works directly without bag/Echo-slot management;
  the smaller victory panel introduces the independent pair. Victory itself
  opens the road; practice is optional. Continue/return keeps the court cleared
  without awarding the victory again. Entry single-mouth, death-only pair,
  one-Blood, Grip return hooks, and west Updrafts/east Keep endpoints remain.

Verification: 31 focused stage/runtime checks pass. Production paths cover
committed shots, source/hop gates, one-Blood, actual portal launch and cover
collision, safe returns, Daro, direct rewards and multiplayer tell snapshots.
Renderer smoke: 33 finite states. Browser inspected the source thrower, release
linkage, gallery, rangefinder draw and grounded recovery; checked live shot
commitment/rejection, reward UI and Continue retaining pair/Far Thread/cleared
court without granting permanent preview powers. Inline/external syntax and
rebuilt mirror match. No full human traversal or aesthetic acceptance claimed;
no commit or deployment.

## Ruined Keep — first implementation pass (2026-09-16)
Version 7.108.0, cache 193. Runtime: index.html and Fable respec renderer.

- Refectory keeps the independent-pair body launch. Weight Hall lifts its named
  keystone vertically; Folded Belfry banks a different weight west into a narrow
  notch; the post-Grip bell catch moves ±50 on a 4.8-second carriage. Receivers
  require their own genuinely portal-routed payload, close on landing and retain
  their solved state. The bell carriage stops with the stone and clears its gate.
- Release handles lower real hoist shelves. Missed weights return after three
  resting seconds without warning text. The Fold contact shelf is at260: actual
  full-drop velocity overshot the old360 shelf. Pre-Grip approaches and the
  optional Mason's Quarter scaffold now have reachable steps; normal tuning stays.
- Grip fits on contact, introduces only its control, restores Blood and saves a
  local checkpoint. Archive braces have recovery points. The key requires Grip
  and the solved bell; it opens a visible reciprocal lift to the hearth and saves
  that progress. Level Select Continue now retains its own checkpoint position,
  without borrowing the campaign checkpoint. Progression/endpoints stay intact.
- Oren recurs from the Causeway, relocates offscreen and speaks only on Up; Veya
  is quiet. The Fold stormmote is removed and the quarter hound has33 base HP.
  Five no-drop encounters remain. Coins already bank on contact; no new bag item.
- Pixel hoists, release rods, weight footprints, clamps, moving carriage, slate
  faces, empty Grip niche and return lift follow real state. Large architecture
  sits behind playable surfaces. Portal/retry/route banners are quiet in the Keep.

Verification: 23 focused stage/data/runtime tests pass; renderer smoke60 finite
frames. Browser exercised actual keystone, sideways Fold and moving-bell portal
shots, one miss/recall, Grip contact, key/lift, and reload/Continue retaining local
powers, catches, key and checkpoint. Campaign preview powers remain unchanged.
Inline/external syntax and local mirror checked. No full human traversal or
visual acceptance claimed; no commit or deployment.

## Gaol / Warden — first implementation pass (2026-09-16)
Version 7.109.0, cache 194. Runtime: index.html and Fable respec renderer.

- Hush is now an elevated two-brake machine. Independent latched player plates
  stop their respective rotors at the actual captured angle; both brakes release
  the western gate. The low-gravity boundary matches the real circular field.
  A recessed service floor and reachable retry steps catch missed climbs.
- Turning Cells combines the original wall shaft with a moving cage, then a
  low-to-high personal-pair route. Its marked floor and west-facing wall supports
  require a real player transit to open the lower service return; the high route
  remains accessible beforehand. Catch floors, local recovery and void/camera
  limits agree. Moving court slates carry their placed mouths with them.
- Enna is the sole resident, speaks deliberately on Up, and moves to the open
  mine only when both positions are offscreen after Counter. Room captions and
  dialogue are short. Route/phase/portal instruction banners are quiet.
- Guard and boss windups commit their direction, including sentence rebounds;
  shields hold their chosen side through attacks/recovery. Phase-two mouth
  strikes target the actual mouth object, so clearing/replacing a pair during
  the tell protects the new pair. The three returned final rushes and final
  weapon hit remain. Warden health is capped at320 × NG scale (entry was672);
  Gaol Turnkeys have35 base HP without random elite inflation, hound33.
- Pixel machinery, cage, gates, gravity boundary, personal mouths and architecture
  follow real geometry/state. Warden and guards show distinct windups, committed
  motion and recovery; the rear armor seam follows the real exposure timer.
  Tell/shield/exposure state is included in co-op snapshots.
- Counter grants quietly, uses a compact control panel and saves at the opened
  mine. Continue retains the reward, solved machinery and mine access without
  replaying the boss or granting campaign powers from a Level Select preview.

Verification: 30 focused stage/runtime checks pass (26 base +3 new regressions
+1 snapshot test, without repeating unchanged groups). Renderer smoke132 states.
Browser checked live brake contacts/frozen angles, high-cell personal transit,
recessed floor without Blood loss, committed direction/actual mouth removal,
a real sentence-rush portal return, final weapon hit/reward UI and Continue at
(380,0) with Counter/open mine and unchanged campaign ability. Fresh entry checked
health values. Syntax and local mirror match. No full human or live co-op
traversal/visual acceptance claimed; no commit or deployment.

## Frostfell — first implementation pass (2026-09-16)
Version 7.110.0, cache 195. Runtime: index.html and Fable respec renderer.

- Nim joins by proximity, resumes following automatically and lights the three
  permanent hearths. Completion grants a Seal directly and saves at the workers'
  hearth. No automatic speech or visible relocation; his later appearances move
  only while both locations are offscreen. Essa/Holl and two spare fights removed.
- Thermal works routes its own fire source through a personal mouth, fixed exit
  and wind duct. A handwheel opens a raised shutter for1.2seconds; wrong-source
  shots cannot bypass the puzzle. Actual swept collision blocks the closed gate.
  Solving warms the works, clears the ice and opens the east gate without banners.
- Double Jump grants on contact after the thermal repair, with one control
  annotation and a saved local checkpoint. Washhouse reward advances vitality
  directly. Service routes save their supported arrival positions.
- The exposed gallery retains its original landings and checkpoints, adds two
  dry moving rafts and two lower retry decks. Local frost enemies have33/38/55
  base HP; toll guard35, without random elite or local health inflation. Existing
  global Recall logic, roster identities and far-side aqueduct latch remain.
- Hearths, windows, Nim's lantern, thermal machinery and embedded architecture
  reflect real state. The hanging muster bell follows the strike cinematic;
  cells open on its persistent circuit. The strike saves at the summit approach.
  Reduced-motion preference reaches the renderer; aqueduct bars follow its latch.

Verification: 17 focused authored-data/runtime checks pass (the earlier five
were a subset of this file, not additional tests). Renderer smoke12 finite
frames. Browser reviewed hearths, thermal works, upper galleries and bell strike;
tested real routed fire against closed/open shutter, direct memory, service and
muster saves. Reload/Continue retains Double Jump, all solved circuits, local
encounter HP and (14100,650), without granting the campaign ability. Syntax and
local mirror checked. No full human traversal or visual acceptance claimed;
no commit or deployment. Existing global Recall remains a separate work order.

## White Court / Frost Sorcerer — first implementation pass (2026-09-16)
Version 7.111.0, cache 196. Runtime: index.html and Fable respec renderer.

- Glassworks keeps its floor-to-wall cold route and moving condenser. Gallery
  instead takes a horizontal source into a wall mouth, then sends it upward
  from a lower floor mouth into a fixed hanging condenser. Its frozen bridge
  crosses a real gap to a high slick pier. The lower dry road and a return step
  allow retries. Floor portals retain negative height; local void, camera and
  projectile bounds permit the -80 basin. Each repair saves a supported checkpoint.
- Vey is the sole speaking resident and recurs at supported positions offscreen;
  Ada is removed. Wheel/cache contents grant once directly, without banners.
  Three ordinary encounters replace six; base health33/25/33 without random
  elites. Endpoints, optional high cache and recollection remain.
- White Court panels, background architecture, stateful cold machinery, portals,
  ice surfaces and Sorcerer phases now draw in pixels. Closed bridges are absent;
  warnings, cast targets, blink destinations, wards and exposure follow real
  state. Final hazards render once and reduced motion retains their actual timing.
- The existing harder fight keeps its health, three ward breaks, alternating
  volleys, three payloads per return window, exposure and final20% rupture.
  Follow-up casts hold their caster and target through the warning. Rupture
  stores its rush direction, protected from the normal enemy-facing update.
  Co-op snapshots carry tells, final hazards, ice state and court AoE identity.
- Final weapon death grants Attunement quietly, restores Blood and saves at
  (15320,0). White Hush applies without an Echo slot or duplicate stacking; its
  legacy auto-equip slot is released. One compact reward panel replaces toasts.
  Continue retains the empty tribunal, spent receiver and repaired crossings.

Verification: 7 authored-data +12 runtime +7 existing final-fight checks pass
(26 distinct). Only affected cases rerun after fixes. Renderer smoke30 finite
frames. Browser tested both real cold routes, a first ward return and harder
phase return, committed rush after crossing behind, actual final sword hit
(health/state fixtures), reward and reload/Continue. Preview powers stay separate
from campaign powers. Reviewed Gallery, arena exposure, rush and reward UI.
Syntax and mirror checked. No full human traversal, live co-op or difficulty
acceptance claimed; no commit or deployment.

## Shared systems / delivery (2026-09-16)
Version7.112.0, cache197. Regions0–8 and their shared no-bag flow are delivered
as the scoped Step3 implementation pass.

- R swaps found weapons/Mantles directly; prior equipment stays in the world
  for reversal. Locks and capability gates still apply. A full legacy bag
  cannot block collection; its saved contents remain untouched.
- One Mantle supplies Ward through8 without healing on equip. Shops supply
  Mantles and immediately carry purchased tools. Owned tools can be chosen at
  their seller without paying twice or replenishing charges.
- The eight early Echoes activate when earned, release old occupied slots and
  never stack with their legacy selection. Later selected Echoes remain valid;
  Level Select effects stay separate from campaign rewards.
- Journey is read-only; no bag, Tool Kit or Echo Loom is needed through8.
  The refuge Forge uses gold + named Seals and only the carried tool; stored
  materials remain intact. Anonymous material drops stop through8. Optional
  title archives/cosmetics are not required by the route.
- Portal instruction/warning text is quiet through8; placement particles,
  sound, physical machinery and enemy telegraphs remain.

Verification:18 Echo/module +10 loadout/shop/forge checks and3 affected region
cases pass. Browser reviewed Journey and Forge, performed a real temper/save,
counter tool switch with unchanged gold/charges, and a direct Mantle pickup
without healing. Test save restored. Inline/module syntax and local mirror
checked. Original scoped requirements audited with no implementation blocker.
Continuous fresh-save traversal, human visual/difficulty acceptance and live
co-op remain validation limits; later regions/NG+ and further polish are separate
work. Stop here for owner feedback. No commit or deployment.
