/* Nine authored combat studies (Borrowed Wings was retired in the 7.250 merge; Moth Wing teaches the pogo) using Claude's unchanged movement constants and room format.
   Coordinates here are tiles for geometry and pixels for actors and their visible links. */
(function(root){
'use strict';
const R=root.BladefallPrecisionRooms;
function room(id,name,question,make){
 const m=Array.from({length:23},()=>Array(40).fill('.'));
 const b={combat:{waitForMove:true,enemies:[],receivers:[],doors:[]},exit:'right',hint:'',
  rect(x,y,w,h,ch='#'){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)m[j][i]=ch;},
  put(x,y,ch){m[y][x]=ch;},
  enemy(kind,x,y,extra={}){this.combat.enemies.push({kind,x,y,...extra});},
  coil(id,x,y){this.combat.receivers.push({id,x,y});},
  gate(x,y,w,h,coils){this.combat.doors.push({x,y,w,h,coils});}
 };
 b.rect(0,0,40,1);b.rect(0,1,1,22);b.rect(39,1,1,22);
 make(b);
 return {id,name,question,combat:b.combat,hint:b.hint,exit:b.exit,zips:b.zips,map:m.map(r=>r.join(''))};
}
const rooms=[
 room('combat-01','An Opening','Which side of a guard becomes reachable after its thrust?',b=>{
  b.rect(0,20,40,3);b.rect(39,17,1,3,'.');b.put(3,19,'P');
  b.enemy('guard',132,144,{ward:'watch'});
  b.combat.doors.push({x:272,y:8,w:8,h:152,ward:'watch'});
  b.rect(23,17,5,1,'=');b.put(25,15,'*');
  b.hint='F parries · W strikes · a parry opens the guard and restores your dash';
 }),
 room('combat-03','Return to Sender','A hostile bolt passes a dormant coil. What changes on its return?',b=>{
  b.rect(0,20,40,3);b.rect(39,17,1,3,'.');b.put(3,19,'P');
  b.enemy('sentry',252,144,{delay:48});b.coil('return',222,147);b.gate(288,8,8,152,['return']);
  b.rect(12,18,4,1,'=');b.put(14,15,'*');
  b.hint='Parry a bolt to charge it · arrows aim the return · no arrow sends it back';
 }),
 room('combat-04','Keep the Landing','Can you gain height without dashing away your future footing?',b=>{
  b.exit='left';b.rect(0,9,5,14);b.rect(0,6,1,3,'.');b.rect(5,9,15,1,'A');
  b.rect(29,20,11,3);b.put(35,19,'P');
  b.enemy('wing',239,129,{left:228,right:246,delay:90});
  b.enemy('wing',170,91,{left:154,right:184,delay:90});b.put(11,6,'*');
 }),
 room('combat-05','Aim Above','Where must the knight stand for a returned shot to reach the high coil?',b=>{
  b.rect(0,20,40,3);b.rect(39,17,1,3,'.');b.put(3,19,'P');
  b.rect(15,16,7,1,'=');b.enemy('sentry',256,144,{delay:40});
  b.coil('high',148,66);b.gate(288,8,8,152,['high']);b.put(19,13,'*');
 }),
 room('combat-06','The Passing Shot','Where along a moving rail can you return a bolt and still make the landing?',b=>{
  b.rect(0,20,8,3);b.rect(31,16,9,7);b.rect(39,13,1,3,'.');b.put(3,19,'P');
  b.rect(8,19,4,1,'Z');b.zips=[[14,-3]];
  b.enemy('sentry',256,112,{delay:70});b.coil('rail',230,115);b.gate(288,8,8,120,['rail']);
  b.put(24,12,'*');
 }),
 room('combat-07','Make a Breach','From which side should the hound begin its charge?',b=>{
  b.rect(0,20,40,3);b.rect(39,17,1,3,'.');b.put(3,19,'P');
  b.enemy('hound',120,150,{delay:65});b.combat.doors.push({x:224,y:8,w:16,h:152,brittle:true});
  b.rect(12,15,9,1,'=');b.put(17,12,'*');
  b.hint='A hound commits to its charge. Cracked masonry yields to heavy impact';
 }),
 room('combat-08','Leave the Light','Where can the lantern keep working while your hands defend you?',b=>{
  b.rect(0,20,40,3);b.rect(39,17,1,3,'.');b.put(3,19,'P');b.put(6,19,'l');b.put(11,19,'_');
  b.rect(14,1,1,19,'H');b.rect(23,16,6,1,'=');
  b.enemy('sentry',264,144,{delay:30});b.coil('light',239,147);b.gate(296,8,8,152,['light']);
  b.put(26,13,'*');b.hint='Full hands cannot strike or parry · ↓ + A sets the lantern down';
 }),
 room('combat-09','Two Angles','How do you power both sides of the chamber without losing your footing?',b=>{
  b.rect(0,20,40,3);b.rect(39,17,1,3,'.');b.put(3,19,'P');
  b.rect(18,13,3,7);b.rect(8,16,7,1,'A');b.put(15,16,'x');
  b.enemy('sentry',40,104,{delay:65});b.coil('west',103,64);
  b.enemy('sentry',264,144,{delay:80});b.coil('east',240,147);
  b.gate(288,8,8,152,['west','east']);b.put(19,10,'*');
 }),
 room('combat-10','The Living Stair','Which opening becomes your next foothold?',b=>{
  b.exit='left';b.rect(0,7,7,16);b.rect(0,4,1,3,'.');
  b.rect(7,7,8,1,'A');b.put(13,5,'x');
  b.rect(7,20,33,3);b.put(35,19,'P');
  b.rect(27,17,5,1,'=');b.rect(19,14,4,1,'Z');b.zips=[[-2,-3]];
  b.enemy('guard',247,144,{ward:'stair',face:1});
  b.enemy('wing',139,99,{left:132,right:151,delay:90});
  b.enemy('sentry',24,16,{delay:85});b.coil('crown',72,29);
  b.gate(8,8,8,48,['crown']);b.put(12,3,'*');
 })
];
// Part IV (7.250) places these rooms by id among the Foes levels: the chapters file holds {ref:id} slots.
const byId=Object.fromEntries(rooms.map(r=>[r.id,r]));
for(const ch of R.chapters)ch.rooms=ch.rooms.map(r=>r.ref?byId[r.ref]:r).filter(Boolean);
R.all=R.chapters.flatMap(c=>c.rooms);
root.BladefallCombatRooms={rooms};
})(typeof window!=='undefined'?window:globalThis);
