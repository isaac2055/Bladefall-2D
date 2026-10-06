/* Room by Room (7.259): the whole of Bladefall rebuilt in the Precision Core as linked screens, after Merge
   Pitch A ("The Outskirts, room by room"). Twenty base regions, then their twenty Fractured echoes.

   This file is the registry. Each region lives in its own file (bladefall-rbr-NN-<key>.js) and calls
   BladefallRoomByRoom.addRegion({...}). Regions register only on a Room by Room page (precision.html?pitch=rbr…)
   or in node with globalThis.BLADEFALL_RBR=true, so the Precision Courses' menu, level numbers and gate trials
   never see them. Flow and drawing: bladefall-rbr-view.js. Plan, conventions and progress: docs/plans/room-by-room.md.

   A region is one chapter: its main rooms in order, then each optional quest's side rooms. A room that opens a
   quest has `side` (a second way out, e.g. 'up'); leaving by it plays that quest's rooms, and the last of them
   returns the knight to the room he left, at the quest's `back` tile. Quests are never needed to finish a region. */
(function(root){
'use strict';
const wanted=root.BLADEFALL_RBR||(root.location&&/[?&]pitch=rbr/.test(root.location.search||''));

/* All forty regions, built or not. `kit` names the verbs the region grants (everything else is locked in its rooms):
   jump and climb are always there; dash from the start (as in Pitch A); the blade with the Oathblade (Black Woods);
   the parry with the Marksman's returned shots; the portal key in the Ruined Keep. */
const MANIFEST=[
 {n:1, key:'outskirts', name:'The Outskirts',           act:'base', palette:'outskirts', device:'crumbling road, crystals, survey stakes'},
 {n:2, key:'woods',     name:'Black Woods',             act:'base', palette:'woods',     device:'the Oathblade: moth pods and bells (true and false footing)'},
 {n:3, key:'causeway',  name:'Broken Causeway',         act:'base', palette:'causeway',  device:'committed mass: slide stones and counterweight lifts; the Brute'},
 {n:4, key:'updrafts',  name:'The Updrafts',            act:'base', palette:'updrafts',  device:'thermals (wind) and springs'},
 {n:5, key:'marksman',  name:'Hollow Marksman',         act:'base', palette:'marksman',  device:'archers, the parry and returned shots; the Marksman'},
 {n:6, key:'keep',      name:'Ruined Keep',             act:'base', palette:'keep',      device:'the keystone lantern, plates and portals'},
 {n:7, key:'gaol',      name:'The Warden',              act:'base', palette:'gaol',      device:'jailers and pressure pods; the Warden'},
 {n:8, key:'frostfell', name:'Frostfell',               act:'base', palette:'frost',     device:'ice, wind and the frost feather'},
 {n:9, key:'court',     name:'Frost Sorcerer',          act:'base', palette:'court',     device:'freezing pools; the Sorcerer'},
 {n:10,key:'emberdeep', name:'Emberdeep',               act:'base', palette:'ember',     device:'heat slabs on the pour schedule'},
 {n:11,key:'foundry',   name:'Ember Colossus',          act:'base', palette:'foundry',   device:'anvils, belts and moulds; the Colossus'},
 {n:12,key:'inversion', name:'The Inversion',           act:'base', palette:'inversion', device:'gravity prisms'},
 {n:13,key:'citadel',   name:'The Void Tyrant',         act:'base', palette:'citadel',   device:'spent footholds and the tear (zipline); the Tyrant'},
 {n:14,key:'throne',    name:'The Abyss King',          act:'base', palette:'throne',    device:'the echo and the wake, the King\u2019s blinking tear; the King'},
 {n:15,key:'deepline',  name:'The Deep Line',           act:'base', palette:'deepline',  device:'carts, boost strips and switches'},
 {n:16,key:'cliffs',    name:'Thunder Cliffs',          act:'base', palette:'cliffs',    device:'hook rings and moving decks; the Hydra'},
 {n:17,key:'shores',    name:'The Landing Shores',      act:'base', palette:'shores',    device:'the tide and its floats'},
 {n:18,key:'colony',    name:'The Colony',              act:'base', palette:'colony',    device:'watch lights and smoke'},
 {n:19,key:'path',      name:'The Path to the Palace',  act:'base', palette:'palace',    device:'sun-beams, mirrors and shutters'},
 {n:20,key:'sunspire',  name:'Sunspire Palace',         act:'base', palette:'sunspire',  device:'light through portals; the King in Daylight'},
 {n:21,key:'f-outskirts',name:'The Fractured Outskirts',act:'fractured',palette:'fractured',echo:1},
 {n:22,key:'f-woods',   name:'The Fractured Woods',     act:'fractured',palette:'fractured',echo:2},
 {n:23,key:'f-causeway',name:'The Fractured Causeway',  act:'fractured',palette:'fractured',echo:3},
 {n:24,key:'f-updrafts',name:'The Fractured Updrafts',  act:'fractured',palette:'fractured',echo:4},
 {n:25,key:'f-marksman',name:'The Fractured Marksman',  act:'fractured',palette:'fractured',echo:5},
 {n:26,key:'f-keep',    name:'The Fractured Keep',      act:'fractured',palette:'fractured',echo:6},
 {n:27,key:'f-gaol',    name:'The Fractured Warden',    act:'fractured',palette:'fractured',echo:7},
 {n:28,key:'f-frostfell',name:'The Fractured Frostfell',act:'fractured',palette:'fractured',echo:8},
 {n:29,key:'f-court',   name:'The Fractured Sorcerer',  act:'fractured',palette:'fractured',echo:9},
 {n:30,key:'f-emberdeep',name:'The Fractured Emberdeep',act:'fractured',palette:'fractured',echo:10},
 {n:31,key:'f-foundry', name:'The Fractured Colossus',  act:'fractured',palette:'fractured',echo:11},
 {n:32,key:'f-inversion',name:'The Fractured Inversion',act:'fractured',palette:'fractured',echo:12},
 {n:33,key:'f-citadel', name:'The Fractured Tyrant',    act:'fractured',palette:'fractured',echo:13},
 {n:34,key:'f-throne',  name:'The Fractured King',      act:'fractured',palette:'fractured',echo:14},
 {n:35,key:'f-deepline',name:'The Fractured Line',      act:'fractured',palette:'fractured',echo:15},
 {n:36,key:'f-cliffs',  name:'The Fractured Cliffs',    act:'fractured',palette:'fractured',echo:16},
 {n:37,key:'f-shores',  name:'The Fractured Shores',    act:'fractured',palette:'fractured',echo:17},
 {n:38,key:'f-colony',  name:'The Fractured Colony',    act:'fractured',palette:'fractured',echo:18},
 {n:39,key:'f-path',    name:'The Fractured Path',      act:'fractured',palette:'fractured',echo:19},
 {n:40,key:'f-sunspire',name:'The Fractured Palace',    act:'fractured',palette:'fractured',echo:20},
];
const ALL_VERBS=['dash','strike','parry','portal'];

/* Region files that exist, in order. precision.html loads them on a Room by Room page; node loads every file present. */
const FILES=['01-outskirts','03-causeway','04-updrafts','02-woods','05-marksman','06-keep','07-gaol','08-frostfell','09-sorcerer','10-emberdeep','11-colossus','12-inversion','13-tyrant','14-king','15-deepline','16-cliffs','17-shores','18-colony','19-path','20-sunspire','21-f-outskirts','22-f-woods','23-f-causeway','24-f-updrafts','25-f-marksman','26-f-keep','27-f-gaol','28-f-frostfell','29-f-court','30-f-emberdeep','31-f-foundry','32-f-inversion','33-f-citadel','34-f-throne','35-f-deepline','36-f-cliffs','37-f-shores','38-f-colony','39-f-path','40-f-sunspire'];
const RBR={MANIFEST,FILES,regions:[],wanted:!!wanted};
/* addRegion({n, name, blurb, outro, kit:[verbs granted], rooms:[...main], quests:[{id,title,giver,from,back:{c,r},rooms:[...],
   keepsake:{id,name,gives}, needs:'keepsakeId'}], tapes:{roomId:[[frames,keys],…], 'roomId#side':[…], 'roomId#bearing':[…]},
   folk:{who:{cloak,trim,skin,hood|cap|helm,spear|staff|flame}},   // the region's people (drawn by the pitch view's person())
   props:{kind:[[dx,dy,w,h,colour],…]},                             // simple props: rectangles from the tile's left edge and floor line
   palettes:{name:{sky0,sky1,far,rock,rockD,edge,moss,accent}}})     // tile palettes for rooms whose palette names them
   so a region never needs to edit the shared view. */
RBR.addRegion=function(reg){
 const m=MANIFEST.find(x=>x.n===reg.n);if(!m)throw new Error('Room by Room: no region '+reg.n);
 const region={...m,...reg,quests:reg.quests||[]};
 region.kit=reg.kit||['dash'];
 const lock=ALL_VERBS.filter(v=>!region.kit.includes(v));
 const mark=(r,extra)=>{r.rbr=region.n;if(lock.length&&!r.lock)r.lock=lock;if(!r.palette)r.palette=region.palette;Object.assign(r,extra||{});return r;};
 region.rooms.forEach(r=>mark(r));
 for(const q of region.quests){
  q.rooms=q.rooms||[];
  if(!q.rooms.length)continue;   // a quest with no rooms of its own (Mara's bearings: pickups set off the road)
  const from=region.rooms.find(r=>r.id===q.from);if(!from)throw new Error(`Room by Room: quest ${q.id} opens from unknown room ${q.from}`);
  if(!from.side)throw new Error(`Room by Room: room ${q.from} opens quest ${q.id} but has no side exit`);
  from.sideQuest=q.id;q.rooms.forEach(r=>mark(r,{quest:q.id}));
 }
 region.mainCount=region.rooms.length;
 RBR.regions.push(region);RBR.regions.sort((a,b)=>a.n-b.n);
 if(!wanted||!root.BladefallPrecisionRooms||!root.BladefallPrecisionRooms.addPart)return region;
 const chapter={id:'rbr-'+region.key,name:region.name,rbr:region.n,pitch:'rbr',bonus:true,palette:region.palette,blurb:region.blurb||'',outro:region.outro||'',
  rooms:[...region.rooms,...region.quests.flatMap(q=>q.rooms)],mainCount:region.mainCount};
 region.chapter=chapter;
 root.BladefallPrecisionRooms.addPart({part:'rbr',title:'Room by Room',chapters:[chapter],tapes:reg.tapes||{}});
 return region;
};
RBR.region=n=>RBR.regions.find(r=>r.n===n)||null;
RBR.built=()=>RBR.regions.map(r=>r.n);
root.BladefallRoomByRoom=RBR;
})(typeof window!=='undefined'?window:globalThis);
