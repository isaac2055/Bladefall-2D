// The Climb (7.265): which Room by Room rooms make each world, in what order, and what is set aside.
// Isaac's ratings (docs/playtest/room-reviews-2026-10-01.csv, difficulty 1–10, fun 1–5) through Frost Sorcerer:
//  - nothing rated above 7 is in the game yet; those rooms are kept for later in the game (SAVED, never deleted);
//  - easy in the starting worlds, harder later: a room much harder than its world (Biting Canopy, 7, in world 2)
//    is kept for later too, and within a world the harder rooms move towards its end where the story allows.
// Story beats stay where they are: Mara's three bearings, the bosses' last rooms (the Brute, the Marksman, the
// Warden, the Sorcerer), and each quest's door.

export const MAX_DIFFICULTY=7;
// aim8 (Isaac, 2026-10-02): the oathblade cuts in each direction a dash goes. Worlds 1–2 first; the rest after his playtest.

export const WORLDS=[
 {n:1,aim8:true,secret:{rooms:['r2','g2','w2','n2','q2','y2','o2','h2']},order:['o1-road','o1-verge','o1-flowers','o1-camp','o1-lookout','o1-cut','o1-cracked','o1-mile','o1-muster','o1-yard','o1-gate'],
  quests:['rowan','mara'],
  patch:{'o1-camp':[[36,10,'.'],[37,10,'.']]},   // the shaft's rest leaves a gap: no stranding under the shut gate
  // (7.276) the Outskirts have no arrival junction (a new game starts in the road): the 19–1 spoke from the Path to the
  // Palace ends at a gate room over the first rooms instead (nothing lies west of the road, so its corridor may)
  sockets:[{link:'19-1',name:'The Pilgrims’ Postern',minX:-999,hosts:['o1-verge','o1-road','o1-flowers']}]},
 {n:2,aim8:true,secret:{rooms:['w2','n2','q2','y2','o2','h2','v2','u3']},order:['w2-tunnel','w2-refuge','w2-clearing','w2-descent','w2-briar','w2-kitchen','w2-edge','w2-mirror','w2-called','w2-rootbound'],
  quests:['refuge'],                        // Elsie's errand keeps The Lantern Tree; The Lantern Bough (9) is saved
  // Isaac (7.270): Briar Run is too hard this early — two pods should do, not three. The third pod is gone and the
  // second moves on toward the bank (17,6 → 22,7); the bank is as it was. The route below (found by the beam search
  // with the blade: two cuts) replaces Room by Room's three-cut one for the Climb.
  patch:{'w2-briar':[[25,4,'.'],[17,6,'.'],[22,7,'b']]},
  tapes:{'w2-briar':[[12, "rj"], [12, "rj"], [5, "rux"], [12, "rj"], [1, "ds"], [12, "rj"], [12, "rj"], [12, "rj"], [5, "rx"], [12, "rj"], [1, "ds"], [12, "rj"], [5, "rx"], [12, "rj"], [12, "rj"], [5, "rdx"], [12, "j"]]}},
 {n:3,secret:{rooms:['e2','i2','j2','a2','c2','p2','st2','lr2']},order:['c3-camp','c3-drop','c3-hoist','c3-patrol','c3-chain','c3-upper','c3-rise','c3-well','c3-road','c3-gantry','c3-brace','c3-counterweight'],
  quests:['defector']},                     // Rise Gantry (6) moves to the end, before the Brute
 {n:4,secret:{rooms:['i2','j2','a2','c2','p2','st2','en2','ts3']},order:['u4-lift','u4-shaft','u4-bellows','u4-draw','u4-kites','u4-lines','u4-choir','u4-needle','u4-eye','u4-catcher','u4-span','u4-flue','u4-crown'],
  quests:['cartographer']},                 // the Choir Flue (4) moves to the end, before the Signal Crown
 {n:5,secret:{rooms:['fb1','fb3','fb4','fb5','fc1','fc2','fc3','combat-08']},order:['m5-camp','m5-watch','m5-road','m5-post','m5-works','m5-release','m5-court','m5-tiers','m5-perch'],
  quests:['recruit'],dropPeopleOf:['daro']},// Daro's token lies in Windcut Gallery (8): his errand waits for it
 {n:6,secret:{rooms:['vi3','vi4','vi5','vi6','vi7','vi2']},order:['k6-hearth','k6-refectory','k6-table','k6-weight','k6-cradle','k6-quarter','k6-cells','k6-belfry','k6-loft','k6-archive','k6-stacks','k6-arch'],
  quests:['archivist']},
 {n:7,secret:{rooms:['p77','p78','p79','p80','p76']},order:['g7-crown','g7-gallery','g7-door','g7-engine','g7-bellows','g7-cells','g7-back','g7-pair','g7-vigil','g7-court','g7-mouth','g7-well','g7-sentence'],
  quests:['keeper']},
 {n:8,secret:{rooms:['p86','p87','p88','p89','p85']},order:['f8-refuge','f8-streets','f8-shelves','f8-hearth','f8-works','f8-court','f8-rehearsal','f8-stair','f8-galleries','f8-landings','f8-engine','f8-crown'],
  quests:['winter']},
 {n:9,secret:{rooms:['p93','p94','p95','p96','p92']},order:['s9-aqueduct','s9-sluice','s9-wheel','s9-refuge','s9-court','s9-cache','s9-glass','s9-gallery','s9-overlook','s9-ante','s9-white','s9-gglass','s9-ward'],
  quests:['creature']},                     // the creature errand keeps The Pen Line; The Cold Intake (10) is saved

 // Worlds 10–14 (Isaac, 2026-10-04: "make the rest of the game, one level at a time… through Abyss King").
 // No ratings yet for these regions, so each keeps Room by Room's designed order; the cap still applies to any
 // room he rates later. Each secret comes from that region's own Precision Course part (X–XIV).
 {n:10,secret:{rooms:['px99','px100','px101','px102','px103','px104','px105']},order:['e10-door','e10-cooling','e10-draw','e10-schedule','e10-spouts','e10-bridge','e10-line','e10-ledger','e10-moulds','e10-window','e10-pourfloor','e10-stair','e10-foot'],
  quests:['quota']},
 {n:11,secret:{rooms:['p107','p108','p109','p110','p111','p112','p114a']},order:['f11-stair','f11-anvil','f11-gate','f11-climb','f11-hall','f11-crane','f11-line','f11-heap','f11-feeder','f11-look','f11-pit','f11-bed','f11-pour'],
  quests:['automaton']},
 {n:12,secret:{rooms:['p115','p116','p118','p119','p120','p121','p122']},order:['i12-fall','i12-line','i12-reversal','i12-lip','i12-alternating','i12-landing','i12-court','i12-divide','i12-glass','i12-lock','i12-fissure','i12-threshold'],
  quests:['neighbours']},
 {n:13,secret:{rooms:['p123','p124','p125','p126','p127','p128','p129','p130']},order:['v13-mouth','v13-ledgers','v13-tower','v13-rest','v13-opposed','v13-spent','v13-tear','v13-vigil','v13-tears','v13-broken','v13-high','v13-crossing','v13-low','v13-middle','v13-crown'],
  quests:['figure']},
 {n:14,secret:{rooms:['p132','p133','p134','p135','p136','p137','p138']},order:['k14-stair','k14-marks','k14-seam','k14-hand','k14-alcove','k14-echo','k14-return','k14-trade','k14-wake','k14-climb','k14-bellkeeper','k14-hall','k14-throne','k14-last','k14-rail'],
  quests:['alarm']},

 // Worlds 15–20 (the hourly Climb routine, 2026-10-04): the apex and the outer circuit. Still unrated, so each keeps
 // Room by Room's designed order, and each secret comes from that region's Precision Course part (140–199).
 // The Deep Line comes back west under its own start, so the ground of its arrival (five mouths) and their projected
 // corridors is kept free (relative to Thorn Line): the junction, its left mouths, its right mouths below Thorn Line.
 {n:15,reserve:[{x:-56,y:-2,C:56,R:50},{x:-96,y:10,C:40,R:30},{x:0,y:24,C:40,R:20}],secret:{hosts:['d15-buffer','d15-backup','d15-thorn','d15-high'],rooms:['p140','p141','p142','p143','p144','p145','p146','p147','p148']},order:['d15-thorn','d15-buffer','d15-backup','d15-high','d15-siding','d15-fork','d15-west','d15-tally','d15-bell','d15-speed','d15-lamp','d15-moths','d15-boat'],
  quests:['miner']},
 {n:16,secret:{rooms:['p150','p151','p152','p153','p155','p156','p157','p158']},order:['t16-chain','t16-release','t16-deck','t16-run','t16-ladder','t16-sailors','t16-deck-ring','t16-seam','t16-moth','t16-long','t16-return','t16-staple','t16-lip','t16-bite','t16-tide-head','t16-storm','t16-tide'],
  quests:['sailors']},
 {n:17,secret:{rooms:['p160','p161','p162','p164','p166']},order:['s17-slack','s17-wreck','s17-spring','s17-line','s17-tern','s17-porch','s17-mooring','s17-belled','s17-landfall','s17-road'],
  quests:['birthday']},
 {n:18,secret:{wide:true,hosts:['c18-fling','c18-release','c18-smoke','c18-lamps'],rooms:['p170','p171','p172','p173','p176','p177','p178']},order:['c18-lamps','c18-smoke','c18-glance','c18-lantern','c18-family','c18-line','c18-fling','c18-release','c18-shade','c18-watch','c18-road'],
  quests:['mother']},
 {n:19,secret:{wide:true,shaft:true,hosts:['p19-beat','p19-throw','p19-shade','p19-lantern','p19-engine','p19-road'],rooms:['p180','p181','p182','p183','p184','p185','p186','p188']},order:['p19-windows','p19-glass','p19-tally','p19-lantern','p19-pilgrim','p19-engine','p19-beat','p19-throw','p19-line','p19-shade','p19-road','p19-gate'],
  quests:['pilgrim']},
 {n:20,secret:{wide:true,hosts:['s20-crown','s20-engine','s20-flume','s20-glass','s20-ends','s20-hours'],rooms:['p190','p191','p192','p193','p195','p196','p197']},order:['s20-court','s20-hours','s20-ends','s20-glass','s20-garden','s20-shade','s20-flume','s20-crown','s20-engine','s20-deliveries','s20-dawn','s20-morning','s20-noon','s20-sea'],
  quests:['garden'],
  // (7.276) Sunspire's entrances opposite the inner braid, in climb order: a gate room over the road with a mouth
  // facing the braid, opposite the Broken Causeway (3) early, Hollow Marksman (5) midway, the Warden (7) late
  sockets:[{link:'20-3',name:'The Causeway Postern',hosts:['s20-hours','s20-ends','s20-glass','s20-court']},
   // (the Noon Engine's left is the Ring Light secret's way back, and Two Deliveries sits higher on its right: its
   // gate opens right, lifted eight tiles on its own shaft)
   {link:'20-5',name:'The Marksman’s Postern',edge:'right',lift:8,hosts:['s20-engine','s20-deliveries']},
   // (light beams cross most of the late rooms and the Last Noon's route needs its seam's wall: the Sea Terrace's left
   // ledge is a safe drop, and a corridor there clears 20–5's. The Warden's first room takes its left wall, so this
   // gate opens left and arrives on the Warden's right)
   {link:'20-7',name:'The Warden’s Postern',hosts:['s20-sea','s20-morning']}]},
 // The Fractured worlds (the hourly Climb routine, 2026-10-04 run 3): Room by Room's converted 21–24, unrated, so
 // each keeps its designed order. A Fractured world's errand is its echo: only someone holding the base quest's
 // keepsake can enter it (q.needs, sealed in the page). Secrets come from the optional courses no world uses yet:
 // Momentum X (21), the vertical dash and spring sets (22), the portal set (23), the summit set (24).
 {n:21,questCeilings:{'mara-echo':{force:true,hosts:['fo21-map']},'rowan-echo':{force:true,hosts:['fo21-shoulder']}},mirror:['fo21-yard','fo21-hammer','fo21-last'],   // (7.280) laid reflected: the road meets them from the far side after a room that turns back
 secret:{rooms:['x1','x2','xm2','xm3','xm4','xm5']},order:['fo21-ash','fo21-mile','fo21-ridge','fo21-map','fo21-lookout','fo21-cracked','fo21-camp','fo21-torn','fo21-gate','fo21-yard','fo21-hammer','fo21-shoulder','fo21-last'],
  quests:['mara-echo','rowan-echo'],
  // (7.278) The Ash Steps is climbed up its left wall, so an arrival junction on that side would break it: the road
  // down from the Path to the Palace ends at a gate room over the first rooms instead, as 19–1 does in the Outskirts
  sockets:[{link:'19-21',name:'The Cracked Postern',minX:-999,hosts:['fo21-ash','fo21-mile','fo21-ridge']}]},
 {n:22,roadLifts:{'fw22-oath2':32},mirror:['fw22-briar','fw22-kitchen','fw22-edge','fw22-wind','fw22-tower','fw22-oath1','fw22-oath2'],   // (7.280) laid reflected: the road meets them from the far side after a room that turns back
 secret:{hosts:['fw22-oath3','fw22-tower'],rooms:['p113','pv1','pv2','pv3','pv4','vi1']},order:['fw22-refuge','fw22-root-loop','fw22-clearing','fw22-canopy','fw22-briar','fw22-kitchen','fw22-edge','fw22-wind','fw22-tower','fw22-oath1','fw22-oath2','fw22-oath3'],
  quests:['elsie-echo']},
 {n:23,questCeilings:{'silas-echo':{force:true,hosts:['fc23-camp']}},roadRises:{'fc23-east':32,'fc23-middle':32},roadEntrances:{'fc23-standard':{side:'right',height:32}},roadLifts:{'fc23-chainwalk':32},roadGaps:{'fc23-well':48},mirror:['fc23-counterpoise','fc23-well','fc23-gantry'],   // (7.280) laid reflected: the road meets them from the far side after a room that turns back
 secret:{hosts:['fc23-middle','fc23-standard'],rooms:['p117','pw2','pw3','pw4','vi8','vi9']},order:['fc23-camp','fc23-yard','fc23-relay','fc23-silas','fc23-rise','fc23-counterpoise','fc23-chainwalk','fc23-well','fc23-gantry','fc23-standard','fc23-west','fc23-east','fc23-middle'],
  quests:['silas-echo']},
 {n:24,entryOptions:{'fu24-catcher':[0]},roadLifts:{'fu24-catcher':64},roadGaps:{'fu24-span':48},mirror:['fu24-draw','fu24-kites','fu24-choir','fu24-flue','fu24-catcher'],   // (7.280) laid reflected: the road meets them from the far side after a room that turns back
 secret:{hosts:['fu24-needle','fu24-shaft'],rooms:['p200b','p200c','p200d','p200e','fa1','fa3']},order:['fu24-lift','fu24-shaft','fu24-draw','fu24-kites','fu24-choir','fu24-flue','fu24-needle','fu24-catcher','fu24-span','fu24-eye','fu24-lung','fu24-crown'],
  quests:['cartographer-echo']},
 // (7.278) The Fractured worlds 25–40: Room by Room regions made by scripts/rbr-src/fracture.mjs from 5–20 (each base room
 // reflected, or kept where its reflection does not play), in the base world's Climb order, so its ratings and saved rooms
 // carry over. Each echo is sealed until its base keepsake is held. Secrets from Precision courses no world uses yet.
 {n:25,secret:{rooms:['combat-01','combat-03','combat-05','combat-07','combat-09']},order:['fm25-seam','fm25-shaft','fm25-bowline','fm25-air','fm25-works','fm25-release','fm25-approach','fm25-court','fm25-tiers','fm25-perch'],
  quests:['recruit-echo']},
 {n:26,secret:{rooms:['l1','l2','l3','q1','h1','c1']},order:['fk26-hearth','fk26-table','fk26-refectory','fk26-weight','fk26-cradle','fk26-quarter','fk26-cells','fk26-archive','fk26-stacks','fk26-arch'],
  quests:['archivist-echo']},
 {n:27,secret:{rooms:['fd1','fd2','combat-06','combat-10','p82a','p82b']},order:['fg27-shadow','fg27-crown','fg27-gallery','fg27-door','fg27-engine','fg27-bellows','fg27-cells','fg27-back','fg27-pair','fg27-vigil','fg27-court','fg27-mouth','fg27-well','fg27-sentence'],
  quests:['keeper-echo']},
 {n:28,secret:{first:true,rooms:['p83','p90','f1','f2','f3','p84']},order:['ff28-refuge','ff28-streets','ff28-shelves','ff28-hearth','ff28-works','ff28-court','ff28-rehearsal','ff28-stair','ff28-galleries','ff28-landings','ff28-engine','ff28-crown'],
  quests:['winter-echo']},
 {n:29,secret:{rooms:['p97','p98a','p98b','e1']},order:['fs29-pane','fs29-stair','fs29-sluice','fs29-falls','fs29-court','fs29-glass','fs29-cache','fs29-overlook','fs29-glazed','fs29-ante','fs29-white','fs29-gglass','fs29-ward'],
  quests:['creature-echo']},
 {n:30,secret:{rooms:['px106a','px106b','o1','d1','d2','d3']},order:['fe30-door','fe30-cooling','fe30-draw','fe30-schedule','fe30-spouts','fe30-tear','fe30-line','fe30-shift','fe30-moulds','fe30-pourfloor','fe30-stair','fe30-foot'],
  quests:['quota-echo']},
 {n:31,questCeilings:{'automaton-echo':{force:true,hosts:['ff31-anvils'],entry:'left',height:48}},secret:{hosts:['ff31-anvils','ff31-look'],rooms:['p114b','w1','v1']},order:['ff31-stair','ff31-anvils','ff31-bridge','ff31-shaft','ff31-crane','ff31-mouth','ff31-heap','ff31-hot','ff31-look','ff31-pit','ff31-bed','ff31-pour'],
  quests:['automaton-echo']},
 {n:32,secret:{wide:true,hosts:['fi32-threshold','fi32-line','fi32-lip'],rooms:['j1','i1','g1']},order:['fi32-fall','fi32-line','fi32-reversal','fi32-lip','fi32-alternating','fi32-landing','fi32-court','fi32-divide','fi32-glass','fi32-lock','fi32-fissure','fi32-threshold'],
  quests:['neighbours-echo']},
 {n:33,secret:{rooms:['p131','k1','k2','k3','a1','st1']},order:['fv33-mouth','fv33-blink','fv33-spent','fv33-ledgers','fv33-thrown','fv33-faults','fv33-vigil','fv33-broken','fv33-high','fv33-low','fv33-middle','fv33-crown'],
  quests:['figure-echo']},
 {n:34,secret:{rooms:['p139','t1','t2','t3','s1','s2']},order:['fk34-stair','fk34-marks','fk34-seam','fk34-gallery','fk34-echo','fk34-hand','fk34-wake','fk34-climb','fk34-bellkeeper','fk34-hall','fk34-throne','fk34-last'],
  quests:['alarm-echo']},
 {n:35,reserve:[{x:-56,y:-2,C:56,R:50},{x:-96,y:10,C:40,R:30},{x:0,y:24,C:40,R:20}],   // World 15's arrival ground (7.280: the rebuilt first room is entered from the left again)
  secret:{hosts:['fd35-roof','fd35-siding'],rooms:['y1','lr1','p194']},order:['fd35-thorn','fd35-buffer','fd35-backup','fd35-high','fd35-siding','fd35-fork','fd35-blink','fd35-boat','fd35-roof','fd35-shadeline','fd35-glass'],
  quests:['miner-echo']},
 {n:36,mirror:['ft36-ladder'],   // (7.280) laid reflected: the road meets them from the far side after a room that turns back
 secret:{rooms:['p159b','p154','p159a','p1','z1','z2']},order:['ft36-chain','ft36-release','ft36-run','ft36-ladder','ft36-sailors','ft36-deck-ring','ft36-moth','ft36-long','ft36-staple','ft36-bite','ft36-tide-head','ft36-storm'],
  quests:['sailors-echo']},
 {n:37,secret:{rooms:['p163','p165','p167','p168','p169']},order:['fs37-slack','fs37-wreck','fs37-launch','fs37-spring','fs37-tern','fs37-porch','fs37-buoy','fs37-super','fs37-belled','fs37-landfall','fs37-road'],
  quests:['birthday-echo']},
 {n:38,questCeilings:{'mother-echo':{force:true,hosts:['fc38-family']}},secret:{wide:true,hosts:['fc38-family','fc38-lamps','fc38-line'],rooms:['p174','p175','p179']},order:['fc38-lamps','fc38-smoke','fc38-glance','fc38-line','fc38-family','fc38-speed','fc38-low','fc38-glass','fc38-release','fc38-shade','fc38-watch','fc38-road'],
  quests:['mother-echo']},
 {n:39,secret:{wide:true,shaft:true,hosts:['fp39-line','fp39-glass'],rooms:['p187','p189a','p189b']},order:['fp39-windows','fp39-engine','fp39-low','fp39-pilgrim','fp39-beat','fp39-line','fp39-panes','fp39-shade','fp39-road','fp39-glass','fp39-gate'],
  quests:['pilgrim-echo']},
 {n:40,secret:{wide:true,hosts:['fs40-crown','fs40-engine','fs40-flume','fs40-glass','fs40-ends','fs40-hours'],rooms:['p198','p199a','p199b','p200f']},order:['fs40-court','fs40-hours','fs40-ends','fs40-glass','fs40-garden','fs40-shade','fs40-flume','fs40-crown','fs40-engine','fs40-deliveries','fs40-dawn','fs40-morning','fs40-noon','fs40-sea'],
  quests:['garden-echo']},
];

// Kept for later in the game: harder than this part of it allows. Each stays playable in Room by Room.
export const SAVED_FOR_LATER={
 'o1-ridge':'rated 8',
 'w2-canopy':'rated 7 — too hard for the second world; a later world gets it',
 'w2-door':'rated 8',
 'w2-q-bough':'rated 9 (Elsie’s errand ends at The Lantern Tree for now)',
 'm5-drop':'rated 9',
 'm5-gallery':'rated 8 (holds Daro’s token)',
 'm5-approach':'rated 10',
 's9-q-intake':'rated 10 (the creature errand starts at The Pen Line for now)',
};
