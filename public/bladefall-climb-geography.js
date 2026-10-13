/* Permanent terrain coordinates for the Emerald Ascent.
   Compilation is separate from activation so invalid geography cannot replace
   a playable save. Units are tiles here, pixels in the view and physics. */
(function(root){
'use strict';
const TILE=8;
const anchors={1:[0,900],2:[-750,600],3:[750,600],4:[-750,300],5:[750,300],6:[0,0],8:[-750,0],7:[750,0],9:[0,-300],10:[-750,-600],11:[0,-600],12:[750,-600],13:[-910,-900],14:[910,-900]};
const rect=(s,d)=>({x:s.x,y:s.y,w:d.cols||40,h:d.rows||23});
const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function extent(rects){
 const x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y));
 return {x,y,w:Math.max(...rects.map(r=>r.x+r.w))-x,h:Math.max(...rects.map(r=>r.y+r.h))-y};
}
function compile(worlds,layout=anchors){
 const rooms=new Map(),regions=new Map(),buckets=new Map(),bucketSize=64;
 for(const world of worlds){
  const defs=new Map(world.rooms.map(d=>[d.id,d]));
  const sections=[...world.sections,...world.quests.flatMap(q=>q.sections),...(world.secrets||[]).flatMap(q=>q.sections)];
  const local=extent(sections.map(s=>rect(s,defs.get(s.room))));
  const [cx,cy]=layout?.[world.n]||[0,0],dx=layout?Math.round(cx-local.x-local.w/2):0,dy=layout?Math.round(cy-local.y-local.h/2):0;
  const region={world:world.n,name:world.name,offset:{x:dx,y:dy},bounds:{...local,x:local.x+dx,y:local.y+dy},rooms:[]};
  regions.set(world.n,region);
  for(const section of layout?sections:[...sections,...world.passages]){
   const def=defs.get(section.room),r=rect(section,def);
   const item={id:section.room,world:world.n,def,section,x:r.x+dx,y:r.y+dy,w:r.w,h:r.h};
   if(rooms.has(item.id))throw new Error('Duplicate terrain room: '+item.id);
   rooms.set(item.id,item);region.rooms.push(item.id);
   for(let y=Math.floor(item.y/bucketSize);y<=Math.floor((item.y+item.h-1)/bucketSize);y++)
    for(let x=Math.floor(item.x/bucketSize);x<=Math.floor((item.x+item.w-1)/bucketSize);x++){
     const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(item);
    }
  }
 }
 const query=area=>{
  const found=new Map();
  for(let y=Math.floor(area.y/bucketSize);y<=Math.floor((area.y+area.h)/bucketSize);y++)
   for(let x=Math.floor(area.x/bucketSize);x<=Math.floor((area.x+area.w)/bucketSize);x++)
    for(const r of buckets.get(x+','+y)||[])if(intersects(area,r))found.set(r.id,r);
  return [...found.values()].sort((a,b)=>a.y-b.y||a.x-b.x||a.id.localeCompare(b.id));
 };
 // Room ownership is deliberately not an input. A camera rectangle always
 // sees exactly the same terrain placements, whichever section is active.
 const visible=(camera,width=320,height=184)=>query({x:camera.x/TILE,y:camera.y/TILE,w:width/TILE,h:height/TILE});
 const toWorld=(id,point)=>{const r=rooms.get(id);if(!r)throw new Error('Unknown terrain room: '+id);return {x:r.x*TILE+point.x,y:r.y*TILE+point.y};};
 const toLocal=(id,point)=>{const r=rooms.get(id);if(!r)throw new Error('Unknown terrain room: '+id);return {x:point.x-r.x*TILE,y:point.y-r.y*TILE};};
 const transfer=(from,to,point)=>toLocal(to,toWorld(from,point));
 const collisions=[];
 for(const region of regions.values())for(const other of regions.values())if(region.world<other.world&&intersects(region.bounds,other.bounds))collisions.push([region.world,other.world]);
 if(layout&&collisions.length)throw new Error('Overlapping regional footprints: '+JSON.stringify(collisions));
 return {rooms,regions,query,visible,toWorld,toLocal,transfer,bounds:extent([...regions.values()].map(r=>r.bounds))};
}
function cameraTarget(geo,point,width=320,height=184){
 const raw={x:point.x-width/2,y:point.y-height*.55};
 const fold=geo.query({x:point.x/8,y:point.y/8,w:.01,h:.01}).find(r=>r.def.atlasFold);
 if(fold)return raw;
 const room=geo.query({x:point.x/8,y:point.y/8,w:.01,h:.01}).find(r=>!r.def.atlasTerrain&&r.def.cameraZone),zone=room&&geo.cameraZones?.get(room.def.cameraZone);
 if(!zone)return raw;
 const constrained={x:Math.max(zone.x*8,Math.min((zone.x+zone.w)*8-width,raw.x)),y:Math.max(zone.y*8,Math.min((zone.y+zone.h)*8-height,raw.y))};
 let distance=Infinity;
 for(const r of geo.rooms.values())if(r.def.cameraZone===zone.id)for(const s of r.def.atlasSockets||[]){
  const destination=geo.rooms.get(s.to);if(destination?.def.cameraZone===zone.id)continue;
  const x=r.x*8+(s.plane??(s.edge==='left'?0:r.w*8)),y=(r.y+s.floor)*8-6;
  distance=Math.min(distance,Math.hypot(point.x-x,point.y-y));
 }
 // Framing opens toward a permanent mouth before crossing it. The same world
 // position produces the same target on both sides of ownership transfer.
 const weight=Math.max(0,Math.min(1,(distance-96)/160));
 return {x:raw.x+(constrained.x-raw.x)*weight,y:raw.y+(constrained.y-raw.y)*weight};
}
function mapSvg(geo,visited={},active=null,open={},player=null){
 const escape=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const b=extent([...geo.regions.values()].filter(r=>r.world<=42).map(r=>r.bounds)),scaleX=1.65,margin=100,colors={1:'#b8b287',2:'#749881',3:'#b98b73',4:'#c0ae83',5:'#b29370',6:'#9b91bd',7:'#78999e',8:'#a4cbd8',9:'#c5e4ec',10:'#c97a52',11:'#b98a5a',12:'#9f92d8',13:'#8a73b8',14:'#6f93b8',15:'#b0905a',16:'#8aa0b8',17:'#c8bc8a',18:'#b08a68',19:'#d8c89a',20:'#e6c070'};
 let out=`<svg viewBox="${(b.x-margin)*scaleX} ${b.y-margin} ${(b.w+margin*2)*scaleX} ${b.h+margin*2}" role="img" aria-label="Physical map of the Emerald Ascent" style="width:100%;max-height:64vh">`;
 for(const route of geo.routes||[]){const unlocked=route.link.startsWith('turn-')?!!visited[route.a.world]:!!open[route.link];out+=`<path d="${route.points.map((p,i)=>(i?'L':'M')+(p.x*scaleX)+' '+p.y).join(' ')}" fill="none" stroke="${unlocked?'#c6b986':'#536171'}" stroke-width="5" ${unlocked?'':'stroke-dasharray="10 8"'}/>`;}
 // Explicit folded checkpoint links keep bank galleries legible in the room layout.
 for(const w of root.BladefallClimb?.worlds||[])for(const link of w.checkpointLinks||[]){
  const a=geo.rooms.get(link.from),z=geo.rooms.get(link.to);if(!a||!z)continue;
  out+=`<path d="M${(a.x+a.w/2)*scaleX} ${a.y+a.h/2} L${(z.x+z.w/2)*scaleX} ${z.y+z.h/2}" fill="none" stroke="#6db8d6" stroke-width="2" stroke-dasharray="4 5" opacity=".65"><title>Checkpoint passage</title></path>`;
 }
 // (7.309) the finale's two worlds stay off the map until all forty are complete
 const hidden=n=>n>=101||n>40&&!root.BladefallClimbFinale?.open();
 for(const r of geo.rooms.values())if(!r.def.atlasTerrain&&!hidden(r.world))out+=`<rect x="${r.x*scaleX}" y="${r.y}" width="${r.w*scaleX}" height="${r.h}" fill="${visited[r.world]?colors[r.world]:'#35414c'}" opacity=".75"/>`;
 for(const region of geo.regions.values()){if(hidden(region.world))continue;
  const a=root.BladefallClimbGeographyBuild.anchors[region.world],x=a[0]*scaleX,y=region.bounds.y-22,name=region.world+' · '+region.name;
  out+=`<text x="${x}" y="${y}" fill="${active===region.world?'#fff1b3':'#d9e3e8'}" stroke="#101823" paint-order="stroke" stroke-width="6" text-anchor="middle" font-size="30">${escape(name)}</text>`;
 }
 if(player){const room=geo.query({x:player.x/8,y:player.y/8,w:.01,h:.01}).find(r=>r.def.atlasFold);if(room){const route=geo.routes.find(r=>r.link===room.def.atlasTransit.link),path=room.def.atlasTerrain.path;let nearest=0,best=Infinity;for(let i=0;i<path.length;i++){const d=Math.hypot(player.x/8-room.x-path[i].c,player.y/8-room.y-path[i].r);if(d<best){best=d;nearest=i;}}const t=nearest/(path.length-1);player={x:(route.a.x+(route.b.x-route.a.x)*t)*8,y:(route.a.y+(route.b.y-route.a.y)*t)*8};}}
 if(player)out+=`<circle cx="${player.x/8*scaleX}" cy="${player.y/8}" r="24" fill="#ebbd67" stroke="#fff1c2" stroke-width="6"/>`;
 return out+'</svg>';
}
root.BladefallClimbGeography={compile,anchors,TILE,mapSvg,cameraTarget};
})(typeof window!=='undefined'?window:globalThis);
