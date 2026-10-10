/* Walkable borderlands. The shared room at each regional boundary is entered
   through its geometry, with speed and camera carried across the seam. */
(function(root){
'use strict';
const AT=()=>root.BladefallClimbAtlas;
const designs={
 '1-2':['Rootwater Descent','roots',48,28,108],
 '1-3':['Pilgrims’ Viaduct','viaduct',36,28,116],
 '2-4':['The Canopy Vent','canopy',62,24,88],
 '3-5':['Sentry’s Aqueduct','aqueduct',36,30,112],
 '4-6':['Bellwind Stair','belltower',68,20,80],
 '5-6':['The Forgotten Siegeway','siege',30,40,120],
 '6-8':['Thawline Cloister','thaw',32,42,112],
 '6-7':['The Chainwell','chains',18,82,72],
 '8-9':['Glasswater Gallery','glass',38,28,108],
 '7-9':['Condemned Procession','procession',22,50,120],
 '2-3':['The Buried Spillway','spillway',42,42,112],
 '4-5':['Windcut Underpass','windbridge',30,30,108],
 '9-10':['The Cinder Stair','cinder',30,30,108],
 '9-11':['The Foundry Shaft','foundry',30,30,108],
 '9-12':['The Upturned Gallery','prism',30,30,108],
 '10-13':['The Ledger Breach','void',30,30,108],
 '12-14':['The Drowned Approach','drowned',30,30,108],
 // the apex and the outer circuit (7.275)
 '13-15':['The Severed Ledger Line','rail',30,30,108],
 '10-15':['The Ember Spur','rail',30,30,108],
 '11-15':['The Ore Lift','rail',30,30,108],
 '12-15':['The Inverted Siding','rail',30,30,108],
 '14-15':['The Bell Tunnel','rail',30,30,108],
 '13-16':['The Thunder Stair','cliffs',30,30,108],
 '16-17':['The Storm Ledges','cliffs',30,30,108],
 '17-18':['The Tideline Path','shores',30,30,108],
 '18-19':['The Smoke Trail','colony',30,30,108],
 '19-20':['The Sun Road','sunpath',30,30,108],
 '20-14':['The Dawn Ascent','sunspire',30,30,108],
 '16-8':['The Frost Lift','cliffs',30,30,108],
 '17-4':['The Windworks Gap','shores',30,30,108],
 '18-2':['The Root Tunnel','colony',30,30,108],
 // (7.276) Sunspire's three entrances, from gate rooms over its road
 '20-3':['The Low Sun Causeway','sunpath',30,30,108],
 '20-5':['The Sightline Gallery','sunspire',30,30,108],
 '20-7':['The Sunward Gaol Road','sunspire',30,30,108],
 '19-1':['The Pilgrim Underway','sunpath',30,30,108],
 // (7.278) the Fractured emerald below the Path to the Palace: one way down into it, then its own braid
 '19-21':['The Cracked Stair','fractured',30,30,108],
 '21-22':['The Ashen Hollow','fractured',30,30,108],
 '21-23':['The Split Viaduct','fractured',30,30,108],
 '22-24':['The Hollow Vent','fractured',30,30,108],
 '22-23':['The Echo Spillway','fractured',30,30,108],
 '23-25':['The Glass Aqueduct','fractured',30,30,108],
 '24-26':['The Breathing Stair','fractured',30,30,108],
 '25-26':['The Turned Siegeway','fractured',30,30,108],
 '26-28':['The Cold Cloister','fractured',30,30,108],
 '26-27':['The Hollow Chainwell','fractured',30,30,108],
 '28-29':['The Mirror Gallery','fractured',30,30,108],
 '27-29':['The Silent Procession','fractured',30,30,108],
 '29-30':['The Ash Stair','fractured',30,30,108],
 '29-31':['The Still Foundry','fractured',30,30,108],
 '29-32':['The Righted Gallery','fractured',30,30,108],
 '30-33':['The Torn Ledger','fractured',30,30,108],
 '32-34':['The Dry Approach','fractured',30,30,108],
 '33-36':['The Quiet Stair','fractured',30,30,108],
 '31-35':['The Empty Lift','fractured',30,30,108],
 '33-35':['The Lost Ledger Line','fractured',30,30,108],
 '30-35':['The Cold Spur','fractured',30,30,108],
 '32-35':['The Level Siding','fractured',30,30,108],
 '34-35':['The Unrung Tunnel','fractured',30,30,108],
 '36-37':['The Calm Ledges','fractured',30,30,108],
 '37-38':['The Ebb Path','fractured',30,30,108],
 '38-39':['The Cold Trail','fractured',30,30,108],
 '39-40':['The Shade Road','fractured',30,30,108],
 '40-34':['The Dusk Ascent','fractured',30,30,108],
 '24-25':['The Breathless Underpass','fractured',30,30,108],
 '36-28':['The Thaw Lift','fractured',30,30,108],
 '37-24':['The Still Gap','fractured',30,30,108],
 '38-22':['The Ash Tunnel','fractured',30,30,108]
};
const highNames={1:'Wayside Arches',2:'Rootbound Overlook',3:'The Chain Confluence',4:'The Bellwind Crown',5:'The Last Watch',6:'The Split Cloister',7:'The Sentence Steps',8:'The Thawing Crown',9:'The Sealed Crown',10:'The Pour Gate',11:'The Ladle Rest',12:'The Upturned Crown',13:'The Ledger Summit',14:'The Drowned Throne',15:'The Last Platform',16:'The Lightning Crown',17:'The Harbour Light',18:'The Watch Gate',19:'The Gate Road',20:'The Dawn Stair',21:'The Broken Gate',22:'The Mirror Door',23:'The Last Count',24:'The Silent Crown',25:'The Turned Watch',26:'The Split Hall',27:'The Open Cells',28:'The Cold Crown',29:'The Glass Crown',30:'The Cooling Gate',31:'The Quiet Anvil',32:'The Level Crown',33:'The Spent Summit',34:'The Silent Throne',35:'The Last Siding',36:'The Calm Crown',37:'The Low Light',38:'The Dark Gate',39:'The Pilgrims’ Rest',40:'The Dusk Stair'};
const lowNames={2:'Rootwater Hollow',3:'Pilgrims’ Landing',4:'The Canopy Mouth',5:'The Sentry Landing',6:'The Broken Cloister',7:'The Receiving Yard',8:'The Meltwater Court',9:'The Glass Vestibule',10:'The Cinder Landing',11:'The Foundry Mouth',12:'The Hanging Vestibule',13:'The Fissure Court',14:'The Drowned Steps',15:'The Junction Hall',16:'The Chain Anchorage',17:'The Slack Water Quay',18:'The Lamplit Square',19:'The Pilgrims’ Gate',20:'The Sun Court',21:'The Cracked Landing',22:'The Ashen Refuge',23:'The Echo Camp',24:'The Still Lift',25:'The Turned Landing',26:'The Fallen Cloister',27:'The Empty Yard',28:'The Frozen Court',29:'The Glass Hall',30:'The Ash Landing',31:'The Cold Mouth',32:'The Level Court',33:'The Ledger Hall',34:'The Hall of Echoes',35:'The Long Platform',36:'The Still Anchorage',37:'The Dry Quay',38:'The Dim Square',39:'The Pilgrims’ Gate Reflected',40:'The Shaded Court'};
const names={1:'The Outskirts',2:'Black Woods',3:'Broken Causeway',4:'The Updrafts',5:'Hollow Marksman',6:'Ruined Keep',7:'The Warden',8:'Frostfell',9:'Frost Sorcerer',10:'Emberdeep',11:'Ember Colossus',12:'The Inversion',13:'The Void Tyrant',14:'The Abyss King',15:'The Deep Line',16:'Thunder Cliffs',17:'The Landing Shores',18:'The Colony',19:'The Path to the Palace',20:'Sunspire Palace',21:'The Fractured Outskirts',22:'The Fractured Woods',23:'The Fractured Causeway',24:'The Fractured Updrafts',25:'The Fractured Marksman',26:'The Fractured Keep',27:'The Fractured Warden',28:'The Fractured Frostfell',29:'The Fractured Sorcerer',30:'The Fractured Emberdeep',31:'The Fractured Colossus',32:'The Fractured Inversion',33:'The Fractured Tyrant',34:'The Fractured King',35:'The Fractured Line',36:'The Fractured Cliffs',37:'The Fractured Shores',38:'The Fractured Colony',39:'The Fractured Path',40:'The Fractured Palace'};
const palettes={1:'outskirts',2:'woods',3:'causeway',4:'updrafts',5:'marksman',6:'keep',7:'gaol',8:'frost',9:'court',10:'ember',11:'foundry',12:'inversion',13:'citadel',14:'throne',15:'deepline',16:'cliffs',17:'shores',18:'colony',19:'palace',20:'sunspire',21:'fractured',22:'fractured',23:'fractured',24:'fractured',25:'fractured',26:'fractured',27:'fractured',28:'fractured',29:'fractured',30:'fractured',31:'fractured',32:'fractured',33:'fractured',34:'fractured',35:'fractured',36:'fractured',37:'fractured',38:'fractured',39:'fractured',40:'fractured'};
const residents={
 '1-2':{who:'orra',name:'Root tender',line:'The Keep’s water finds its way down here. Follow the pale roots; they drink from the same river.'},
 '4-6':{who:'rowan',name:'Bell keeper',line:'Hear that? The wind still rings the Keep’s bells. Follow the stair toward their sound.'},
 '6-7':{who:'keeper',name:'Chainwell keeper',line:'Prisoners went down. Empty cages came up. The empty cages still make a stair, if you ever need to climb back.'},
 '8-9':{who:'ada',name:'Glazier',line:'Snow on this side. Glass on the other. Look up—the court is already watching over the road.'}
};
const dir=l=>Math.sign(AT().positions[l.b][0]-AT().positions[l.a][0])||1;
// A mouth may be moved to a junction's other wall where the map's direction would set its corridor over an original room
// (Emberdeep ends below its Deep Stair, so its road up to the Void Tyrant opens to the right, over clear rock).
const SIDE={'10-13':{10:'right',13:'left'},   // and arrives on the Fissure Court's free left wall (a corridor's two mouths must face apart)
 '13-16':{13:'right',16:'left'},   // (7.275) the Ledger Summit's and the Dawn Stair's left walls project over their worlds'
 '20-14':{20:'right',14:'left'},  // branches, so those roads leave by the right, and arrive on the far side's free wall
 '20-5':{5:'left'},
 '32-34':{32:'left',34:'right'},
 // The Cooling Gate's right mouth crosses Deep Stair; approach World 35 from its right.
 '30-35':{30:'left',35:'right'},'31-35':{31:'left',35:'right'},
 '33-35':{33:'right',35:'left'},'32-35':{32:'left',35:'right'},'34-35':{34:'right',35:'left'},
 // The rebuilt Sorcerer's road occupies the right of its departure; all three roads leave on the left.
 '29-30':{29:'left',30:'right'},'29-31':{29:'left',31:'right'},'29-32':{29:'left',32:'right'},
 '27-29':{27:'right',29:'left'}};   // (the Fractured Warden's last rooms lie west of its crossroads)   // (7.276) Sunspire's middle gate opens to the right, so this one arrives on the Sentry Landing's left
const side=(l,n)=>SIDE[l.id]?.[n]||((n===l.a?1:-1)*dir(l)>0?'right':'left');
const passageId=l=>`cl${l.a}-passage-${l.id}`;
function grid(cols,rows){return Array.from({length:rows},()=>Array(cols).fill('.'));}
function span(g,r,c,n,ch){for(let x=c;x<c+n;x++)if(g[r]&&x>=0&&x<g[r].length)g[r][x]=ch;}
function hub(w,id,name,main,connections,spawnSide){
 const crowded=['left','right'].some(edge=>connections.filter(l=>side(l,w.n)===edge).length+Number(main.edge===edge)>3);
 // A finale can leave far below row22 or through columns beyond the old 40-tile canvas.
 const vertical=main.edge==='down'||main.edge==='up';
 const cols=vertical?Math.max(40,...(main.cols||[]).map(c=>c+2)):({1:88,2:100,3:96,4:84,5:104,6:88,7:92,8:100,9:88}[w.n]||88),rows=Math.max(crowded?31:23,(main.floor||0)+2),mid=Math.floor(cols/2),g=grid(cols,rows);
 const sockets=[],used={left:[],right:[]},roads=[],floor=Array(cols).fill(22);
 function opening(edge,y){
  if(edge==='down')return;
  used[edge].push(y);
  const left=edge==='left',end=left?2:cols-3,begin=left?mid-3:mid+3;
  // Long banks meet in a sheltered basin. Each branch has its own road;
  // climbing is spread across the landscape rather than stacked in one shaft.
  const points=[{c:mid,r:22},{c:begin,r:22}];
  const steps=Math.max(1,Math.ceil(Math.abs(22-y)/3));
  for(let i=1;i<=steps;i++)points.push({c:Math.round(begin+(end-begin)*i/steps),r:Math.round(22+(y-22)*i/steps)});
  roads.push({edge,floor:y,points});
 }
 if(main.edge!=='down'&&main.edge!=='up')opening(main.edge,main.floor);
 if(main.to)sockets.push({...main,kind:'room'});
 for(const l of connections){
  const edge=side(l,w.n),y=[18,10,4,26].find(r=>used[edge].every(v=>Math.abs(v-r)>=5));
  if(y==null)throw new Error(`No road for ${w.n} ${l.id}`);
  opening(edge,y);sockets.push({edge,floor:y,kind:'passage',link:l.id,to:passageId(l),world:l.a});
 }
 const decks=[];
 for(const road of roads){
  const points=road.points;
  for(let i=1;i<points.length;i++){
   const p=points[i],prev=points[i-1],left=road.edge==='left';
   const c=left?p.c:prev.c-2,end=left?prev.c+2:p.c+4;
   const start=i===points.length-1&&left?0:c,stop=i===points.length-1&&!left?cols:end;
   span(g,p.r,start,stop-start,'M');decks.push({c:start,r:p.r,w:stop-start});
  }
 }
 // The lowest road is terrain, not a floating shelf. Higher roads cross
 // above it on arches, roots or ice, depending on the region.
 for(let c=0;c<cols;c++){
  const levels=decks.filter(d=>c>=d.c&&c<d.c+d.w).map(d=>d.r);
  floor[c]=levels.length?Math.max(...levels):22;
  for(let r=floor[c];r<rows;r++)g[r][c]='#';
 }
 for(let r=0;r<rows-1;r++){g[r][0]='#';g[r][cols-1]='#';}
 for(const road of roads){const c=road.edge==='left'?0:cols-1;for(let r=Math.max(0,road.floor-4);r<road.floor;r++)g[r][c]='.';g[road.floor][c]='M';}
 if(main.edge==='down')for(const c of main.cols){
  // Keep the upward entrance permeable through the bank above it.
  for(let r=floor[c];r<=22;r++)g[r][c]=r===floor[c]||r===22?'M':'.';
 }
 // Entered from above (a road that ends by dropping): the ceiling stays open over those columns.
 if(main.edge==='up')for(const c of main.cols)for(let r=0;r<floor[c];r++)g[r][c]='.';
 g[21][mid]='P';
 return {id,name,map:g.map(r=>r.join('')),cols,rows,exit:'none',entry:main.edge,dashes:1,palette:w.palette,connector:true,atlasJunction:true,atlasSockets:sockets,atlasMain:main,atlasRegion:w.n,atlasRoads:roads,atlasDecks:decks,atlasFloor:floor};
}
function bridge(w,l,index){
 const [name,style,lf,rf,cols]=designs[l.id],rows=style==='chains'?100:style==='belltower'?84:style==='canopy'?78:64,g=grid(cols,rows);
 const floor=Array(cols).fill(rows-5),decks=[],scenery=[];
 const lerpProfile=knots=>{for(let k=1;k<knots.length;k++){const [a,y]=knots[k-1],[b,z]=knots[k];for(let c=a;c<=Math.min(cols-1,b);c++)floor[c]=Math.round(y+(z-y)*(c-a)/(b-a));}};
 let route=[],gateC=null,crown=null;
 const deck=(c,r,width=9,material='stone')=>{decks.push({c:c-Math.floor(width/2),r,w:width,material});route.push({c,r});};
 const ground=knots=>{lerpProfile(knots);for(let c=4;c<cols-4;c+=5)route.push({c,r:floor[c],ground:true});route.push({c:cols-5,r:rf,ground:true});};
 // Each border has an authored silhouette and traversal rhythm. The floor under
 // exposed walks is a recoverable lower route, not a lethal platforming gauntlet.
 if(style==='roots'){
  ground([[0,lf],[14,lf],[30,43],[43,43],[58,36],[74,36],[88,rf],[cols-1,rf]]);
  scenery.push({kind:'root',c:27,r:20},{kind:'root',c:63,r:16},{kind:'pool',c:15,r:51,w:32});
 }else if(style==='viaduct'){
  lerpProfile([[0,lf],[13,lf],[19,54],[cols-20,54],[cols-13,rf],[cols-1,rf]]);
  for(const p of [[4,lf,9],[15,lf,11],[27,33,11],[39,33,10],[50,30,10],[62,32,11],[74,29,10],[86,29,10],[99,rf,14],[cols-5,rf,9]])deck(...p,'bridge');
  scenery.push({kind:'broken-arch',c:23,r:33,w:24},{kind:'broken-arch',c:56,r:32,w:29},{kind:'fallen-bell',c:62,r:54});
 }else if(style==='canopy'){
  lerpProfile([[0,lf],[14,lf],[22,rows-5],[cols-20,rows-5],[cols-13,rf],[cols-1,rf]]);
  deck(5,lf,10,'root');deck(17,lf,14,'root');
  for(let i=1;i<=13;i++)deck([25,33,41,33][(i-1)%4],lf-i*3,11,'root');
  for(let c=45;c<cols-4;c+=11)deck(c,rf,13,'root');deck(cols-5,rf,10,'root');
  scenery.push({kind:'hollow-tree',c:34,r:6,w:42});
 }else if(style==='aqueduct'){
  ground([[0,lf],[15,lf],[24,42],[39,42],[45,46],[57,46],[66,40],[80,40],[89,rf],[cols-1,rf]]);
  scenery.push({kind:'waterfall',c:44,r:14,w:4},{kind:'pool',c:24,r:47,w:58},{kind:'pipe',c:69,r:30,w:19});
 }else if(style==='belltower'){
  lerpProfile([[0,lf],[13,lf],[20,rows-5],[cols-18,rows-5],[cols-13,rf],[cols-1,rf]]);
  deck(5,lf,10);deck(17,lf,14);
  for(let i=1;i<=16;i++)deck([27,35,43,35][(i-1)%4],lf-i*3,10,'bell');
  for(let c=45;c<cols-4;c+=11)deck(c,rf,13,'bell');deck(cols-5,rf,10);
  scenery.push({kind:'bell',c:36,r:12,w:20},{kind:'tower',c:18,r:8,w:41});
 }else if(style==='siege'){
  ground([[0,lf],[17,lf],[27,35],[42,35],[51,40],[66,40],[78,34],[91,34],[100,rf],[cols-1,rf]]);
  scenery.push({kind:'ram',c:56,r:35,w:25},{kind:'rubble',c:32,r:35,w:16},{kind:'torn-banner',c:88,r:12});
 }else if(style==='thaw'){
  ground([[0,lf],[17,lf],[31,40],[48,40],[61,48],[75,48],[88,rf],[cols-1,rf]]);
  scenery.push({kind:'ice-roof',c:10,r:22,w:84},{kind:'pool',c:47,r:49,w:35},{kind:'waterfall',c:64,r:20,w:2});
 }else if(style==='chains'){
  lerpProfile([[0,lf],[16,lf],[22,rows-5],[cols-18,rows-5],[cols-12,rf],[cols-1,rf]]);
  deck(4,lf,9,'cage');deck(16,lf,14,'cage');
  for(let i=1;i<=16;i++)deck([26,34,42,34][(i-1)%4],lf+i*4,10,'cage');
  deck(48,rf,17,'cage');deck(cols-5,rf,12,'cage');
  decks.push({c:22,r:lf,w:40,material:'cage'});
  scenery.push({kind:'counterweight',c:50,r:8,w:7},{kind:'chain-shaft',c:19,r:5,w:30});
 }else if(style==='glass'){
  lerpProfile([[0,lf],[14,lf],[20,51],[cols-18,51],[cols-12,rf],[cols-1,rf]]);
  for(const p of [[5,lf,10],[17,lf,13],[28,35,12],[40,32,12],[52,34,12],[64,31,12],[76,28,12],[88,28,13],[cols-5,rf,14]])deck(...p,'ice');
  scenery.push({kind:'mirror',c:17,r:52,w:70},{kind:'crystal',c:43,r:18,w:9},{kind:'crystal',c:79,r:10,w:8});
 }else if(style==='procession'){
  ground([[0,lf],[15,lf],[29,28],[40,28],[55,35],[68,35],[83,42],[96,42],[107,rf],[cols-1,rf]]);
  scenery.push({kind:'procession',c:20,r:16,w:78},{kind:'torn-banner',c:37,r:10},{kind:'torn-banner',c:85,r:24});
 }else if(style==='spillway'){
  ground([[0,lf],[18,lf],[25,46],[43,46],[51,41],[65,41],[74,46],[91,46],[100,rf],[cols-1,rf]]);
  // A low vaulted pipe gives this crossing a compressed horizontal silhouette.
  for(let c=15;c<cols-14;c++)for(let r=0;r<floor[c]-7-Math.round(Math.sin((c-15)*Math.PI/22)*2);r++)g[r][c]='#';
  scenery.push({kind:'drain',c:28,r:46,w:57},{kind:'waterfall',c:53,r:32,w:2});
 }else if(style==='windbridge'){
  lerpProfile([[0,lf],[12,lf],[18,56],[cols-18,56],[cols-12,rf],[cols-1,rf]]);
  for(const p of [[5,lf,10],[17,30,12],[29,33,12],[41,36,12],[53,33,11],[65,30,11],[77,27,11],[89,30,13],[cols-5,rf,13]])deck(...p,'rope');
  scenery.push({kind:'sail',c:26,r:15,w:10},{kind:'sail',c:59,r:14,w:11},{kind:'sail',c:88,r:12,w:9});
 }
 for(let c=0;c<cols;c++)for(let r=floor[c];r<rows;r++)g[r][c]='#';
 for(const p of decks){span(g,p.r,p.c,p.w,'M');}
 // Three distinct old service routes have physical shutters; the other borders
 // use open geography, fallen spans or switchbacks instead of repeating a gate.
 const shutter={siege:52,spillway:57,procession:64}[style];
 if(shutter){
  gateC=shutter;crown=floor[gateC]-6;
  for(let r=crown+2;r<floor[gateC];r++)span(g,r,gateC,2,'G');
  const bypass=[{c:gateC-10,r:floor[gateC]-3},{c:gateC-3,r:crown},{c:gateC+5,r:crown},{c:gateC+12,r:floor[gateC]-3}];
  // Clear ceiling over the service catwalk, including the spillway inspection vent.
  for(let c=gateC-15;c<=gateC+17;c++)for(let r=crown-4;r<floor[c];r++)if(g[r]?.[c]==='#')g[r][c]='.';
  for(const p of bypass){p.r=Math.min(p.r,floor[p.c]-2);decks.push({c:p.c-4,r:p.r,w:9,material:style==='spillway'?'pipe':'stone'});span(g,p.r,p.c-4,9,'M');}
  route=route.filter(p=>p.c<gateC-15||p.c>gateC+17).concat(bypass).sort((a,b)=>a.c-b.c);
 }
 const winch=shutter?(dir(l)>0?gateC+20:gateC-20):null;
 if(winch)g[floor[winch]-1][winch]='c';
 const sp=dir(l)>0?4:cols-5;g[floor[sp]-1][sp]='P';
 const id=passageId(l),left=dir(l)>0?l.a:l.b,right=dir(l)>0?l.b:l.a;
 const def={id,name,cols,rows,map:g.map(r=>r.join('')),exit:'none',dashes:1,connector:true,palette:palettes[left],
  atlasTransit:{link:l.id,a:l.a,b:l.b,left,right,style,floor,gateC,crown,winch,decks,route,scenery,name},
  atlasSockets:[{edge:'left',floor:lf,kind:'region',world:left,link:l.id},{edge:'right',floor:rf,kind:'region',world:right,link:l.id}],
  hint:{roots:'Follow the river beneath the roots.',viaduct:'The broken road crosses the old valley. The undercroft offers a way back up.',canopy:'Climb the branches toward the light in the hollow tree.',aqueduct:'Follow the water through the abandoned channels.',belltower:'Climb toward the great bell; the Keep lies beyond its crown.',siege:'The siege engine fell across the service road. Its shutter still has a working winch.',thaw:'Meltwater runs beneath the hanging ice.',chains:'The cages form a stair. Board the counterweight lift at the foot of the shaft to return.',glass:'Follow the ice shelves across the mirror lake.',procession:'The old procession climbs toward the court. A winch opens the service road.',spillway:'The inspection walk rises above the culvert shutter.',windbridge:'Cross the sagging spans between the wind sails.'}[style]};
 if(style==='chains')def.atlasTransit.lift={x:54*8,w:8*8,top:lf*8,bottom:rf*8};
 if(residents[l.id]){const stop=route[Math.floor(route.length*.6)];def.people=[{...residents[l.id],c:stop.c,r:stop.r-1}];}
 w.rooms.push(def);w.passages.push({room:id,x:3000+index*160,y:0,fire:{c:sp,r:floor[sp]-1}});
 if(root.BladefallClimbPassageTapes?.[id])w.tapes[id]=root.BladefallClimbPassageTapes[id];
}
function prepare(w){
 if(w.atlasPassagesReady)return;w.atlasPassagesReady=true;w.passages=[];
 const first=w.sections[0],fd=w.rooms.find(r=>r.id===first.room);
 w.atlasStart=first.room;
 // (7.278) a world every link reaches through a gate room over its road (the Fractured Outskirts) has no arrival
 const gated=l=>w.rooms.some(r=>r.atlasGate&&r.atlasSockets?.some(s=>s.link===l.id));
 if(w.n!==1&&AT().links.some(l=>(l.b===w.n||l.kind==='crossing'&&l.a===w.n)&&!gated(l))){
  let pc=0,pr=0;fd.map.forEach((row,r)=>{if(row.includes('P')){pc=row.indexOf('P');pr=r;}});
  const entry=pc<20?'left':'right',src=fd.map.map(r=>[...r]),end=entry==='left'?0:39;
  for(let c=Math.min(end,pc);c<=Math.max(end,pc);c++){
   for(let r=Math.max(0,pr-3);r<=pr;r++)if(src[r][c]!=='P')src[r][c]='.';
   src[pr+1][c]='#';
  }
  fd.map=src.map(r=>r.join(''));fd.entry=entry;fd.atlasMouth={edge:entry,floor:pr+1};
  const id=`cl${w.n}-atlas-arrival`,main={edge:entry==='left'?'right':'left',floor:18,to:first.room,toFloor:pr+1};
  fd.atlasSockets=[{kind:'room',edge:entry,floor:pr+1,to:id,toFloor:18}];
  // (a link that ends at a gate room over the road, Sunspire's entrances, does not come into the arrival)
  const gates=new Set(w.rooms.flatMap(r=>r.atlasGate?r.atlasSockets.map(s=>s.link):[]));
  const incoming=AT().links.filter(l=>(l.b===w.n||l.kind==='crossing'&&l.a===w.n)&&!gates.has(l.id));
  const hd=hub(w,id,lowNames[w.n],main,incoming,entry);
  w.rooms.push(hd);w.sections.unshift({room:id,x:first.x+(entry==='left'?-hd.cols:40),y:first.y+pr+1-18,fire:{c:Math.floor(hd.cols/2),r:21},atlasJunction:true});
 }
 const terminal=w.sections.at(-1),old=w.rooms.find(r=>r.id===terminal.room),source=w.rooms.find(r=>r.id===w.atlasEnd);
 const main={edge:old.entry,floor:old.map.findIndex(row=>row.includes('P'))+1};
 if(main.edge!=='down'&&main.edge!=='up'){
  const edge=source.exit==='left'?0:(source.cols||40)-1,open=source.map.map((row,r)=>['.','G'].includes(row[edge])?r:-1).filter(r=>r>=0);let last=open.at(-1);
  // (7.278) a room entered and left by the same wall (the Fractured Woods' last door): the opening by its fire is the
  // way in, so the road leaves by the next opening above it
  const fr=source.map.findIndex(row=>row.includes('P'));
  if(last!=null&&open.includes(fr)){let top=fr;while(open.includes(top-1))top--;const above=open.filter(r=>r<top-1);if(above.length)last=above.at(-1);}
  if(last!=null){const sp=w.sections.find(s=>s.room===source.id);main.floor=sp.y+last+1-terminal.y;main.height=1;while(open.includes(last-main.height))main.height++;}
  const sp=w.sections.find(s=>s.room===source.id);main.to=source.id;main.toFloor=terminal.y+main.floor-sp.y;source.atlasSockets=[...(source.atlasSockets||[]),{kind:'room',preview:true,edge:main.edge==='left'?'right':'left',floor:main.toFloor,height:main.height,to:old.id,toFloor:main.floor}];}
 if(main.edge==='down')main.cols=[...source.map[0]].flatMap((ch,i)=>ch!=='#'?[i]:[]);
 if(main.edge==='up')main.cols=[...source.map.at(-1)].flatMap((ch,i)=>ch!=='#'?[i]:[]);
 const outgoing=AT().links.filter(l=>l.a===w.n&&l.kind==='road');
 const hd=hub(w,old.id,highNames[w.n],main,outgoing,main.edge);
 if(main.edge==='right')terminal.x-=hd.cols-(old.cols||40);
 Object.assign(old,hd);terminal.fire={c:Math.floor(hd.cols/2),r:21};
 AT().links.forEach((l,i)=>{if(l.a===w.n)bridge(w,l,i);});
}
root.BladefallClimbPassages={prepare,designs,names,side,passageId};
})(typeof window!=='undefined'?window:globalThis);
