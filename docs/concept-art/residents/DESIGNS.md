# Residents: character designs

The owner's bar is the Cloaked Man in phase 1: you can pick him out from across a room. He has a silhouette no one else has, one strong colour, a moving signature element (the chain), and he is taller than the knight. Every person the knight can talk to, trade with, take a quest from or lead now meets that bar. Before this change most of them were the knight's own body with a palette swap, or a flat vector blob in the quest's accent colour.

Rules applied to every design:

- **Silhouette:** unlike anyone else's in the same region (height, bulk, headwear, posture). Most people are taller than the knight (22 px). The shortest are the Frostfell Woman (17), Nim (19) and Elsie (20).
- **Signature colour:** no one else in the same region has it, and it is never the knight's navy and orange or a grunt's green hood. Violet is kept for the Cloaked Man.
- **Prop:** comes from the person's job or story.
- **Idle motion:** one small movement per person.
- **Face:** at least two eye pixels (or a deliberate blindfold, mask or shadow), plus a nose or beard where the head allows.

**Code:** `public/bladefall-resident-art.js`.
**Sheets:**
- `lineup.png`: every design beside the knight, buffer pixels ×4.
- `before-after-1.png`, `before-after-2.png` and `before-after-3.png` (the residents who only talk): in-game frames at 1280×720, shown 2×. Each "before" frame is the same tree with the module withheld.

## The cast

Sizes are in buffer pixels: the knight is 22 tall, and the Cloaked Man is 35.

| Name | Region (stage) | Silhouette | Colour | Prop | Idle |
|---|---|---|---|---|---|
| **Rowan** | Outskirts (0) | 31 tall, broad and square, wide-brimmed kettle helm, grey moustache | crimson quilted gambeson `#a8392f` | spear with a strip of his brother's blanket tied under the head | the strip flutters; he glances back down the road |
| **Mara** | Outskirts (0), Marksman road (4) | 35 tall, lanky, long legs, leather cap with brass goggles, auburn braid | mustard duster `#c8962a` | the field chart held open in both hands; spyglass on her belt | coat tail flaps; chart corner lifts; goggles glint |
| **Vey** | Outskirts (0, quiet), Gaol (6), White Court (8) | 25 tall, wiry, one arm in a cream sling, headband with long trailing tails | rose `#c4487a` (headband, sash, banner) | the broken standard with a torn rose banner; the Gaol key ring; the brass sluice key in the Court | headband tails stream; the banner stirs; the keys swing |
| **Elsie** | Black Woods (1) | 20 tall, short and round, knotted headscarf whose ears stand up | tomato-red scarf and shawl with white spots `#c8443a` | big wooden ladle; a steaming bowl | ladle stirs the air; steam rises; at supper the bowl slides to your place |
| **Bram** | Black Woods (1) | 40 with cap, tallest in the woods, a tall bent lamplighter's cone cap | bone-white duster `#d8d0b8`, amber scarf | big iron lantern at his side; lighting pole over his shoulder | lantern swings and glows once he trusts you; scarf tail moves |
| **Tamsin** (shop) | Black Woods (1) | behind her counter: top hat with a gold band, round spectacles, silver hair | saffron waistcoat under a black frock coat `#d9a42c` | a coin lifted to her eye | the coin flashes |
| **Oren** | Causeway (2), Updrafts (3), Keep (5), Emberdeep to the Throne (9–13) | 28 tall and 16 wide, the widest man in the game: bald, black spade beard | copper leather apron `#c0652a` over iron grey | a chain worn as a bandolier; the sledge resting beside him (on his shoulder while he walks) | the chain loop at his hip swings; his head bobs with his breath |
| **Silas** | Causeway (2) | 36 with shako, stiff and narrow, legs that do not bend | verdigris coat `#2e8a84` with a column of brass buttons | the wind-up key in his back | the key turns while the Governor Gear walks him, and stops when he is free (he sits in the sun) |
| **Sable** | Causeway (2, quiet), Colony (18) | stooped black hood, folded stretcher strapped to his back with its poles above his head | sable black `#2c2830` with a long ivory scarf `#e6dfcc` | a tin cup in both hands (filled once the Colony tap runs) | steam off the cup |
| **The Cartographer** | Updrafts (3) | stooped over a cane, blindfolded, long white beard, a quiver of map rolls | plum robe `#7c3470` | brass ear-trumpet | the trumpet sweeps for the wind; sound rings; the cane taps |
| **Aven** (shop) | Updrafts (3) | wind-wild hair swept back, brass goggles on the forehead | cyan scarf `#3cc4dc` on a canvas smock | the great sail shears | shears open and shut; scarf and hair stream |
| **The Recruit** | Marksman road (4) | 20 tall, skinny, big ears, ginger tuft; then an oversized brass helmet with a red plume | scarlet tabard `#cc3a32` | small round shield; his uncle's helmet (dropped on the road during the escort) | knees knock; he glances both ways |
| **Tovin** (shop) | Keep (5) | behind the counter: square head, flat cap, grey walrus moustache | slate-teal apron `#2f8f86` | mallet and chisel | taps the chisel; chips fly |
| **The Archivist** | Keep (5) | 30 tall and gaunt, a tower of tomes strapped to his back, higher than his head (35), half-moon spectacles | wine robe `#8c2c44` | the open volume | a page turns |
| **The Service Keeper** | Gaol (6) | short, wide, pot-bellied, peaked cap | khaki `#b08a4e`, red cap band | clipboard and pencil | taps the pencil; a huge yawn |
| **Nim** | Frostfell (7) | 19 tall, a puffy parka with a fur-ringed hood, red mittens | saffron parka `#e8a42a` | the banked flame in an iron cage (held up while you walk together) | flame flickers; breath smokes |
| **Venn** (shop) | Frostfell (7) | behind the counter: round fur ushanka with its flaps down, white walrus moustache | coal-black coat `#26222a`, white fur | pipe with a red coal | smoke curls up |
| **The Frostfell Woman** | Frostfell (7) | 17 tall, bent double under a patchwork quilt, white bun, cane | dusty rose `#c46e8a` | the glued blue cup | steam; she trembles |
| **The Creature Keeper** | White Court (8) | round as a stove in a padded coat, leather flying cap, big goggles, fireproof mitts | amber `#e08a2a` | long tongs | tongs open and shut; embers spit |
| **Vey's service drawer** (shop) | White Court (8) | nobody behind the counter: a cabinet of brass-pulled drawers | Vey's rose ribbon | — | the ribbon sways |
| **Sera** (shop) | Emberdeep (9) | behind the counter: peaked courier's cap, dark ponytail, satchel strap | turquoise `#23a8a4` | quill and ledger | the quill wags as she writes |
| **The Foundry Workers** | Emberdeep (9) | the crew's speaker: hard hat, goggles round the neck | soot-black overalls `#2e2c2e` with a hazard-yellow band and hat | tally board | a new chalk mark appears |
| **The Breaker** (support) | Emberdeep (9) | 33 tall, huge and bare-armed | grey singlet, red neckerchief, the crew's yellow hat | pick over his shoulder | — (sits when the quota is met) |
| **The War Automaton** | Foundry (10) | 44 tall and 22 wide, hunched iron boiler body, piston legs, fists hanging to its knees | gunmetal `#4a5058`, brass bands, cyan visor | furnace grate in its chest; smokestack on its back | the furnace breathes light; smoke rises |
| **The Sleepless Clerk** (shop) | Inversion (11) | behind the counter: a long nightcap drooping down her back with a bobble, purple under the eyes | butter-yellow nightshirt `#e6cc5a` | candle on a saucer | flame flickers; she yawns |
| **The Neighbor** (downstairs) | Inversion (11) | grey bun, and a broom raised to the ceiling (48 to the bristles) | pink bathrobe `#e0789e` | the broom | thumps the ceiling |
| **The Upstairs Neighbor** (support) | Inversion (11) | stands upside down on the other floor, pink curlers | aqua dressing gown `#3cbccc` | kettle | steam |
| **The Figure** | Paradox Citadel (12) | 40 tall to its ring, translucent, a silver veil over a faceless dark with gold eye-points, a gold ring above, floating | silver `#c8cee2`, gold | a light held at its heart | bobs; its hem moves on no wind; the ring pulses |
| **The Bellkeeper** | Drowned Throne (13) | built like a bell: narrow shoulders, a hem flaring to 18 wide, a little brass bell of a cap | teal `#1f8a80` with brass hem | handbell | the bell swings and rings |
| **The Tired Defender** (support) | Drowned Throne (13) | dented steel, slumped, eyes shut | steel with a crimson scarf and a crimson shield | tall shield | head nods as he dozes |
| **The Lookout** (support) | Drowned Throne (13) | taller, standing straight | steel with a mustard scarf | spyglass to the eye | the spyglass sweeps |
| **The Volunteer** (support) | Drowned Throne (13) | young, bareheaded | white tunic `#ece6d6` | torch | flame |
| **The Miner** | Deep Line (15) | stooped under the low roof, hard hat with a lamp | rust overalls `#b04a2a`, yellow hat | pick; the lamp's beam | the beam sweeps the dark; behind bars until you raise them |
| **The Sailor** | Thunder Cliffs (16) | sturdy, grey beard, long-tailed sou'wester | yellow oilskin `#e8b820` | coil of rope | rain runs off the brim |
| **The Stranded Sailor** (support) | Thunder Cliffs (16) | clinging to the spar, arms up | red-and-white striped jersey, red knit cap | — | waves |
| **The Organizer** | Landing Shores (17) | striped paper party hat with a bobble | hot pink `#e2508e` | bunting over the shoulder; a little cake with a candle | candle flickers; bobble bounces |
| **The Soldier** (support) | Landing Shores (17) | steel helm with a red plume | steel with a dark-red cloak | spear | — (sits once invited) |
| **The Mother** | Colony (18) | a clay water jar balanced on her head (33 to the jar), baby in a sling | deep teal `#1e7a78` | the baby; the jar | rocks foot to foot; a tiny hand waves |
| **The Sick Woman** | Colony (18) | sitting, bandaged head, the white flower at her temple (the Act Two disease motif is kept) | brick-red shawl `#a8402e` | tin cup held up | lifts the cup to you |
| **The Pilgrim** | Palace Path (19) | wide straw hat, a pack taller than he is with a bedroll on top | saffron-orange robe `#e0782a` | staff with a bell; hanging pot | pot and bell swing (the pack is set down when you are cruel) |
| **The Palace Gardener** | Sunspire (20) | wide straw sun hat with red and white flowers on the band | coral smock `#d8543c` | copper watering can; shears at the belt | the can drips |
| **The Servant** | Sunspire (20) | tall and slender, white gloves, gold mask over the bandages, white flower (Act Two motif kept); kneels in the hall | black livery with gold buttons `#26222c` | gold cup and cloth | polishes the cup; the cup glints |

### The residents who only talk

These are the `ambientFigure`s with a `dialogue` line and reply voices in `bladefall-conversation.js`. They meet the same bar, drawn a step quieter than the quest givers: softer colours, no glow and no marker. Vey (Outskirts) and Sable (Causeway) are listed above; they are the same people you meet again later.

| Name | Region (stage) | Silhouette | Colour | Prop | Idle |
|---|---|---|---|---|---|
| **Olan** | Outskirts (0) | 33 tall, listing to one side on a crutch, a wooden peg for one leg, knit watch cap | sea-grey teal greatcoat `#4a7a7c` | notched tally stick for counting patrols | his thumb walks the notches |
| **Orra** | Black Woods (1) | 26 tall, small and round-shouldered, white bun with a pencil through it, big round spectacles | dusky plum shawl and dress `#74486c` | her daughter's pocket watch on a chain | the watch swings; every few seconds it goes up to her ear |
| **Pell** | Black Woods (1) | 27 tall, stocky, and 27 wide with the yoke across both shoulders, sleeves rolled | sea-blue kerchief `#3a94a2` on a grey smock, resin-spotted leather apron | a resin bucket at each end of the yoke | the buckets sway; one drips amber |
| **Hale** | Black Woods (1) | sat heavily on his bedroll with his legs out, a dented pauldron on one shoulder, the other shoulder bandaged, eye patch, cropped grey beard | steel-grey gambeson `#767a82` with a leather baldric | canteen; his helmet on the ground beside him | now and then he drinks |
| **Talla** | Updrafts (3) | 27 tall, wiry, two black braids; a test kite flies above her (48 to the kite) | scarlet kite, sash and kerchief `#c83c3c` on a cream sailcloth smock | the kite on its line | the kite bobs in the draught; its tail of bows streams |
| **Edrin** | Updrafts (3) | 29 tall and stout, a long rain cape and rubber boots, white round beard, an upturned brass bowl for a hat | slate rain cape `#5a6a76`, brass | a tin cup held out for the drips | rain spills over the bowl's rim and drips into the cup |
| **Senn** | Marksman road (4) | 32 tall, thin and bald, a bolt of mottled veil-cloth draped over one shoulder to the knee | sea-teal apron stuck with pins `#2f7a78` over a linen shirt | a long needle; a spool at the belt | the needle rises and draws its thread |
| **Veya** | Keep (5) | sat on a stool by the fire, a silver braid over her shoulder | cream wool shawl `#e0d4ba` | knitting needles and a rose scarf that hangs to the floor with its ball of yarn | the needles click |

**Colour checks by region.**
- **Outskirts:** crimson, mustard, rose, sea-grey teal.
- **Woods:** red, bone white, saffron, plum, sea-blue, steel grey.
- **Causeway:** copper, verdigris, black.
- **Updrafts:** plum, copper, cyan, scarlet, slate with brass (Edrin stands alone at x=13560).
- **Marksman road:** mustard, scarlet, sea teal.
- **Keep:** copper, slate teal, wine, cream.
- **Frostfell:** saffron, black with white fur, dusty rose.
- **White Court:** rose, amber.
- **Emberdeep:** turquoise, black with yellow, copper.
- **Inversion:** butter yellow, pink, aqua, copper.
- **Throne:** teal, steel with crimson, mustard or white.
- **Colony:** teal, black, brick red.
- **Sunspire:** coral, black with gold.

## Where each is drawn (inventory and hooks)

| Who | Stage | Object | Hook |
|---|---|---|---|
| Rowan, Elsie and every later side-story giver (Silas, Cartographer, Recruit, Archivist, Service Keeper, Frostfell Woman, Creature Keeper, Foundry Workers, Automaton, Neighbors, Figure, Bellkeeper, Miner, Sailors, Organizer, Mother, Pilgrim, Gardener) | 0–20 | `sideStoryActor` (`sideStoryRole:'actor'`) | `BladefallSideStoryWorld.draw` → `BladefallResidentArt.drawStory` |
| Breaker, Upstairs Neighbor, Tired Defender, Lookout, Volunteer, Stranded Sailor, Soldier | 9, 11, 13, 16, 17 | `sideStoryPerson` (`sideStoryRole:'support'`) | same |
| Mara, Bram; residents Vey, Olan, Orra, Pell, Hale | 0–1 | `G.npcs` (`profileId`), `ambientFigure` | `BladefallOpeningStories.drawResident` → `drawLegacy` (the props and hand-overs around them are unchanged) |
| Oren (`brute-chainwright`, `questActor:'oren'`, `keepKeeper`), Mara (`questActor:'daro'`), Vey (`gaolKeeper`, `courtKeeper`); residents Sable, Talla, Edrin, Senn, Veya | 2–8 | `ambientFigure` | renderer `drawResident` → `draw` |
| Oren (profiles `ilyra`, `sera`), Nim | 3, 7, 9–13 | `G.npcs` | renderer `drawResident` → `draw` |
| Tamsin | 1 | `shop` `ethereal-goods` | `BladefallOpeningStories.drawShop` → `drawKeeper` |
| Aven, Tovin, Venn, Vey's drawer, Sera, Clerk | 3, 5, 7, 8, 9, 11 | `shop` | renderer `case 'shop'` (legacy stall, then `drawShop` puts the keeper behind a redrawn counter) |
| Sable | 18 | `actSable` | `bladefall-colony-art.js` `drawSable` → `draw` |
| Sick woman | 18 | `actSick` | `bladefall-colony-art.js` `case 'actSick'` → `draw` |
| Servant (standing, kneeling) | 20 | `actServant` | `bladefall-sunspire-art.js` `drawServant` → `draw` |

**Not changed:**
- **Oren in Act Two** (`actOren`, Landing Shores): his bandaged, kneeling story poses are bespoke Act Two art.
- The redesign covers every `ambientFigure` with a `dialogue` line in stages 0–20. Stages 21–43 have none.

**Note on the quiet residents' interaction (2026-09-27):** they all carry `quietV4:true`. In the current tree, `outskirtsAuthoredInteractable()` in `index.html` returns `false` for `quietV4` before its `ambientFigure` line, and the prompt loop skips `quietV4` too. A runtime check that stands the knight beside each one confirms that none of them becomes the Up target. Their `dialogue` strings and the reply voices in `bladefall-conversation.js` are in place, so Up opening them depends on that gate, which lives outside this art.
