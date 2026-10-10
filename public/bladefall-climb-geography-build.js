/* Intact regional geography with short folded interworld passages.
   Map distance never determines the length of a playable connection. */
(function(root){
'use strict';
const opposite=e=>e==='left'?'right':'left';
function landscapeJunction(w,section,def){
 const arrival=def.id.endsWith('-atlas-arrival');
 const oldMain=def.atlasMain,cols=def.atlasSockets.length>5?40:56,mid=Math.floor(cols/2);
 // (7.275) a departure with no road onward (the Deep Line's last platform) hangs below its floor, not above it
 const empty=!arrival&&!def.atlasSockets.some(p=>p.kind!=='room');
 const main={...oldMain,floor:oldMain.edge==='down'?25:oldMain.edge==='up'?20:arrival?10:empty?8:20};
 const sockets=def.atlasSockets.map(p=>({...p})),used={left:0,right:0},roads=[];
 const orderedSockets=[...sockets].sort((a,b)=>Number(root.BladefallClimbAtlas.links.find(l=>l.id===b.link)?.kind==='crossing')-Number(root.BladefallClimbAtlas.links.find(l=>l.id===a.link)?.kind==='crossing'));
 // (7.275) an arrival takes a third mouth on a side (the Deep Line's); a departure entered from above (the Last Pour's)
 // opens its first road at the lower tier, nearer its hearth
 for(const p of orderedSockets){p.floor=p.kind==='room'?main.floor:(arrival?(sockets.length>5?[18,24,30]:[18,26,34]):main.edge==='up'?[14,8,22]:[8,14,22])[used[p.edge]++];if(p.floor==null)throw new Error('Too many mouths: '+def.id);}
 // Keep projected corridors physically clear of the original neighbouring room.
 const host=w.rooms.find(d=>d.id===oldMain.to),shared=sockets.filter(p=>p.kind!=='room'&&p.edge===main.edge);
 if(host&&shared.length){
  if(arrival){const lowest=main.floor-(oldMain.toFloor||0)+(host.rows||23)+8,offset=Math.max(0,lowest-Math.min(...shared.map(p=>p.floor)));for(const p of shared)p.floor+=offset;}
  else main.floor=Math.max(main.floor,(oldMain.toFloor||0)+Math.max(...shared.map(p=>p.floor))+4);
 }
 for(const p of sockets)if(p.kind==='room')p.floor=main.floor;
 const rows=arrival?Math.max(32,...sockets.map(p=>p.floor+6)):Math.max(26,main.floor+6),bottom=rows-2;
 const mouthFloors=sockets.filter(p=>p.kind!=='room').map(p=>p.floor).sort((a,b)=>a-b);
 // A many-road arrival meets halfway up its banks, keeping each climb short.
 const hearth=arrival?(mouthFloors.length>4?mouthFloors[Math.floor(mouthFloors.length/2)]:Math.max(...mouthFloors)):Math.min(bottom,24);
 const grid=Array.from({length:rows},()=>Array(cols).fill('.'));
 const openings=[...sockets];
 if(main.edge!=='down'&&main.edge!=='up'&&!openings.some(p=>p.kind==='room'))openings.unshift(main);
 for(const p of openings){
  const end=p.edge==='left'?1:cols-2,begin=p.edge==='left'?mid-3:mid+3;
  const points=[{c:mid,r:hearth},{c:begin,r:hearth}],steps=Math.max(1,Math.ceil(Math.abs(hearth-p.floor)/3));
  for(let i=1;i<=steps;i++)points.push({c:Math.round(begin+(end-begin)*i/steps),r:Math.round(hearth+(p.floor-hearth)*i/steps)});
  roads.push({edge:p.edge,floor:p.floor,points});
 }
 const decks=[];
 for(const road of roads)for(let i=1;i<road.points.length;i++){
  const p=road.points[i],q=road.points[i-1];let c=Math.max(0,Math.min(p.c,q.c)-2),end=Math.min(cols,Math.max(p.c,q.c)+3);
  if(i===road.points.length-1){if(road.edge==='left')c=0;else end=cols;}
  decks.push({c,r:p.r,w:end-c});
 }
 const floor=Array.from({length:cols},(_,c)=>Math.max(bottom,...[]));
 for(let c=0;c<cols;c++){
  const levels=decks.filter(d=>c>=d.c&&c<d.c+d.w).map(d=>d.r);floor[c]=levels.length?Math.max(...levels):bottom;
  for(let r=floor[c];r<rows;r++)grid[r][c]='#';
 }
 for(const d of decks)for(let c=d.c;c<d.c+d.w;c++)grid[d.r][c]='M';
 for(let r=0;r<rows;r++){grid[r][0]='#';grid[r][cols-1]='#';}
 // (7.275) a terminal room whose exit is taller than a mouth (the Sea Terrace's open shore) keeps its whole height open
 for(const p of openings){const c=p.edge==='left'?0:cols-1;for(let r=Math.max(1,p.floor-Math.max(5,p.kind==='room'?p.height||0:0));r<p.floor;r++)grid[r][c]='.';grid[p.floor][c]='M';}
 if(main.edge==='down')for(const c of main.cols||[]){for(let r=floor[c];r<rows;r++)grid[r][c]=r===floor[c]||r===rows-1?'M':'.';}
 if(main.edge==='up')for(const c of main.cols||[])for(let r=0;r<floor[c];r++)grid[r][c]='.';
 grid[hearth-1][mid]='P';
 const y=main.edge==='down'?section.y+(def.rows||23)-rows:main.edge==='up'?section.y:section.y+oldMain.floor-main.floor;
 return {section:{...section,x:section.x+(main.edge==='right'?def.cols-cols:0),y,fire:{c:mid,r:hearth-1}},def:{...def,cols,rows,map:grid.map(r=>r.join('')),atlasMain:main,atlasSockets:sockets,atlasRoads:roads,atlasDecks:decks,atlasFloor:floor}};
}
const anchors={1:[0,1050],2:[-900,700],3:[900,700],4:[-900,350],5:[900,350],6:[0,0],8:[-900,0],7:[900,0],9:[0,-350],
 10:[-900,-700],11:[0,-700],12:[900,-700],13:[-1090,-1020],14:[1090,-1020],
 // the apex and the outer circuit (7.275), from the emerald's coordinates (x·750, (y−3.95)·304), spread where footprints meet
 15:[0,-1250],16:[-1650,-440],17:[-2050,258],18:[-1450,958],19:[0,1430],20:[1850,258],
 // (7.278) the Fractured emerald below 19, clear of every footprint above it
 21:[0,1810],22:[-900,2160],23:[900,2160],24:[-900,2510],
 25:[900,2510],26:[0,2860],27:[900,2860],28:[-900,2860],29:[0,3210],30:[-900,3560],31:[0,3560],32:[900,3560],33:[-1090,3880],34:[1090,3880],35:[0,4110],36:[-1650,3300],37:[-2050,2602],38:[-1450,1902],39:[1500,1650],40:[1850,2602]};
// Translate an entire authored world as one unit. Never repack its rooms or
// insert travel sections into the original challenge sequence.
function frameWorld(w){
 const defs=new Map(w.rooms.map(d=>[d.id,d]));
 const sections=[...w.sections,...w.quests.flatMap(q=>q.sections),...w.secrets.flatMap(q=>q.sections)];
 const x=Math.min(...sections.map(s=>s.x)),y=Math.min(...sections.map(s=>s.y));
 const right=Math.max(...sections.map(s=>s.x+(defs.get(s.room).cols||40))),bottom=Math.max(...sections.map(s=>s.y+(defs.get(s.room).rows||23)));
 const id=`${w.n}-world`;
 for(const s of sections)defs.get(s.room).cameraZone=id;
 w._cameraRuns=[{id,x,y,w:right-x,h:bottom-y}];
 // Only a save migration table remains from the retired three-room grouping.
 // Each removed checkpoint resumes at the next original challenge, not a hub.
 const main=w.sections.filter(s=>!defs.get(s.room).connector),together=new Set();
 for(const q of [...w.quests,...w.secrets]){const a=main.findIndex(s=>s.room===(q.from||q.host)),b=main.findIndex(s=>s.room===q.returnTo);if(a>=0&&b>=0)for(let i=Math.min(a,b);i<Math.max(a,b);i++)together.add(i);}
 w.retiredPassages={...(w.retiredRooms||{})};let count=0,turn=0;
 for(let i=0;i<main.length-1;i++){count++;if(count>=3&&!together.has(i)&&['left','right'].includes(defs.get(main[i].room).exit)){w.retiredPassages[`cl${w.n}-turn-${w.n}-${++turn}`]=main[i+1].room;count=0;}}

}
function prepare(worlds){
 return worlds.map(w=>{
  const copy={...w,rooms:w.rooms.map(d=>({...d})),sections:w.sections.map(s=>({...s})),quests:w.quests.map(q=>({...q,sections:q.sections.map(s=>({...s}))})),secrets:(w.secrets||[]).map(q=>({...q,sections:q.sections.map(s=>({...s}))})),passages:[]};
  for(let i=0;i<copy.sections.length;i++){
   const section=copy.sections[i],index=copy.rooms.findIndex(d=>d.id===section.room),def=copy.rooms[index];
   if(!def.atlasJunction)continue;
   const rebuilt=landscapeJunction(copy,section,def);copy.sections[i]=rebuilt.section;copy.rooms[index]=rebuilt.def;
   if(rebuilt.def.atlasMain.to){const index=copy.rooms.findIndex(d=>d.id===rebuilt.def.atlasMain.to),host=copy.rooms[index];copy.rooms[index]={...host,atlasSockets:host.atlasSockets.map(s=>s.to===def.id?{...s,toFloor:rebuilt.def.atlasMain.floor}:{...s})};}
  }
  frameWorld(copy);return copy;
 });
}
function furnishPassage(def){
 const t=def.atlasTransit,path=def.atlasTerrain.path,p=t.route[Math.floor(t.route.length/2)]||path[Math.floor(path.length*.55)],style=t.style;
 const scene=(kind,c,r,w)=>({kind,c:p.c+c,r:p.r+r,...(w?{w}:{})});
 t.scenery={
  roots:[scene('hollow-tree',12,-5,22),scene('pool',-13,5,26),scene('root',-8,-12)],
  canopy:[scene('hollow-tree',-14,-20,25),scene('root',15,-14)],
  viaduct:[scene('broken-arch',-15,-3,36),scene('fallen-bell',13,5)],
  aqueduct:[scene('pipe',-18,-15,36),scene('waterfall',12,-15,3),scene('pool',-15,6,30)],
  belltower:[scene('bell',13,-15,12),scene('tower',-16,-17,30)],
  siege:[scene('ram',8,5,26),scene('torn-banner',-13,-15),scene('rubble',-16,6,16)],
  thaw:[scene('ice-roof',-18,-17,36),scene('pool',-14,5,30),scene('waterfall',15,-13,2)],
  chains:[scene('counterweight',14,-13,6)],
  glass:[scene('crystal',12,-15,9),scene('crystal',-16,-8,6),scene('mirror',-17,7,34)],
  procession:[scene('procession',12,-14,9),scene('torn-banner',-15,-16)],
  spillway:[scene('drain',-16,6,32),scene('pipe',-18,-16,36),scene('waterfall',13,-14,2)],
  windbridge:[scene('sail',-15,-18,12),scene('sail',12,-10,10)]
 }[style]||[];
}
// A compact local corridor connects two distant mouths. The overview keeps
// regional positions; crossing a folded socket maps between local mouth frames.
function foldedPassage(route,world,original,index,geo){
 const cols=48,rows=8,floor=6,left=4,right=44,same=route.a.edge===route.b.edge;
 const grid=Array.from({length:rows},(_,r)=>Array(cols).fill(r===0||r>=floor?'#':'.'));
 const ports=[route.a,route.b].map((p,i)=>({kind:'room',world:p.world,to:p.room,edge:opposite(p.edge),plane:(p.edge==='right'?left:right)*8,floor:i&&same?12:floor,toFloor:p.floor,link:route.link,folded:true}));
 const a={c:ports[0].plane/8,r:ports[0].floor},z={c:ports[1].plane/8,r:ports[1].floor};
 const corners=same?[a,{c:24,r:20},{c:24,r:12},z]:[a,z],path=[];
 for(let i=1;i<corners.length;i++){const p=corners[i-1],q=corners[i],n=Math.abs(q.c-p.c)+Math.abs(q.r-p.r);for(let j=0;j<n;j++)path.push({c:p.c+Math.sign(q.c-p.c)*j,r:p.r+Math.sign(q.r-p.r)*j});}path.push(z);
 const decks=[{c:0,r:floor,w:cols}];
 if(same){decks.push({c:19,r:16,w:10},{c:Math.min(z.c,24)-2,r:12,w:Math.abs(z.c-24)+5});for(const d of decks.slice(1))for(let c=d.c;c<d.c+d.w;c++)grid[d.r][c]='=';}
 // The entire collision corridor fits the visible mouth: one ceiling row,
 // five rows of clear headroom, and two rows of supporting floor.
 const spawn=a.c+(ports[0].edge==='left'?4:-5);grid[a.r-1][spawn]='P';
 const x=geo.bounds.x+(index%4)*80,y=geo.bounds.y+geo.bounds.h+160+Math.floor(index/4)*40;
 const def={...original,cols,rows,map:grid.map(r=>r.join('')),exit:'none',connector:true,dashes:1,atlasFold:true,
  atlasSockets:ports,atlasTerrain:{spans:Array.from({length:rows},()=>[[0,cols]]),path,origin:{x,y}},
  atlasTransit:{link:route.link,a:route.a.world,b:route.b.world,left:route.a.world,right:route.b.world,style:original.atlasTransit.style,name:original.name,floor:Array(cols).fill(floor),decks,route:[{c:24,r:floor}],scenery:[]},
  people:(original.people||[]).map((p,i)=>({...p,c:24+i*8,r:floor-1})),hint:'Follow the passage to the next region'};
 furnishPassage(def);
 return {def,section:{room:def.id,x,y,fire:{c:spawn,r:floor-1}}};
}
function build(worlds){
 const prepared=prepare(worlds),geo=root.BladefallClimbGeography.compile(prepared,anchors),passages=[];
 const endpoint=(link,n)=>{
  const w=prepared.find(w=>w.n===n),d=w.rooms.find(d=>d.atlasJunction&&d.atlasSockets.some(s=>s.link===link.id)),s=d.atlasSockets.find(s=>s.link===link.id),r=geo.rooms.get(d.id);
  return {room:d.id,world:n,edge:s.edge,floor:s.floor,x:r.x+(s.edge==='left'?0:r.w),y:r.y+s.floor};
 };
 const routes=root.BladefallClimbAtlas.links.map(link=>{const a=endpoint(link,link.a),b=endpoint(link,link.b);return {link:link.id,a,b,folded:true,length:40,points:[{x:a.x,y:a.y},{x:b.x,y:b.y}]};});
 for(const w of prepared){
  const shift=geo.regions.get(w.n).offset;for(const zone of w._cameraRuns){zone.x+=shift.x;zone.y+=shift.y;}
  for(const section of [...w.sections,...w.quests.flatMap(q=>q.sections),...w.secrets.flatMap(q=>q.sections)]){const r=geo.rooms.get(section.room);section.x=r.x;section.y=r.y;}
 }
 for(const [index,route] of routes.entries()){
  const w=prepared.find(w=>w.n===route.a.world),original=w.rooms.find(d=>d.atlasTransit?.link===route.link),made=foldedPassage(route,w,original,index,geo);
  Object.assign(original,made.def);made.def=original;w.passages.push(made.section);
  for(const [p,port] of [[route.a,made.def.atlasSockets[0]],[route.b,made.def.atlasSockets[1]]]){
   const d=prepared.find(w=>w.n===p.world).rooms.find(d=>d.id===p.room);
   const socket={kind:'room',world:w.n,to:made.def.id,edge:p.edge,plane:p.edge==='left'?0:d.cols*8,floor:p.floor,toFloor:port.floor,link:route.link,preview:false,folded:true};
   d.atlasSockets=[...(d.atlasSockets||[]).filter(s=>s.link!==route.link),socket];
  }
  passages.push(made);
 }
 return {worlds:prepared,geo,routes,passages};
}
function install(){
 const CL=root.BladefallClimb,R=root.BladefallPrecisionRooms;if(!CL?.wanted||CL.geography)return;
 const built=build(CL.worlds);
 for(const next of built.worlds){
  const w=CL.world(next.n),chapter=w.chapter;Object.assign(w,next);w.chapter=chapter;
  const def=id=>w.rooms.find(d=>d.id===id);
  chapter.rooms=[...w.sections,...w.quests.flatMap(q=>q.sections),...w.secrets.flatMap(q=>q.sections),...w.passages].map(s=>def(s.room));chapter.mainCount=w.sections.length;
 }
 R.all=R.chapters.flatMap(c=>c.rooms);
 CL.geography=root.BladefallClimbGeography.compile(CL.worlds,null);CL.geography.routes=built.routes;CL.geography.cameraZones=new Map(CL.worlds.flatMap(w=>w._cameraRuns.map(r=>[r.id,r])));
}
root.BladefallClimbGeographyBuild={prepare,anchors,build,install};
})(typeof window!=='undefined'?window:globalThis);
