/* Shared topology for the Emerald Ascent. Coordinates describe the regional map;
   section coordinates remain local to their authored continuous climb. */
(function(root){
'use strict';
const positions={1:[0,7.5],2:[-1.2,6.35],3:[1.2,6.35],4:[-1.2,5.15],5:[1.2,5.15],6:[0,3.95],7:[1.2,3.95],8:[-1.2,3.95],9:[0,2.8],
 10:[-1.2,1.65],11:[0,1.65],12:[1.2,1.65],13:[-1.45,.6],14:[1.45,.6],
 // the apex and the outer circuit (7.275): 20 Sunspire's label sits at (2.43,4.8); its territory is the whole right flank
 15:[0,0],16:[-2.1,2.5],17:[-2.65,4.8],18:[-1.9,7.1],19:[0,8.65],20:[2.43,4.8],
 // (7.278) the Fractured emerald, the lower braid reflected below the Path to the Palace
 21:[0,9.8],22:[-1.2,10.95],23:[1.2,10.95],24:[-1.2,12.15],
 // (7.278) the rest of the Fractured emerald: the base emerald turned over below 21 (19's reflection would sit on 19,
 // so the Fractured Path stands to its right)
 25:[1.2,12.15],26:[0,13.35],27:[1.2,13.35],28:[-1.2,13.35],29:[0,14.5],30:[-1.2,15.65],31:[0,15.65],32:[1.2,15.65],33:[-1.45,16.7],34:[1.45,16.7],35:[0,17.3],36:[-2.1,14.8],37:[-2.65,12.5],38:[-1.9,10.2],39:[1.9,8.9],40:[2.43,12.5]};
const roads=[[1,2],[1,3],[2,4],[3,5],[4,6],[5,6],[6,8],[6,7],[8,9],[7,9],
 // the crown (7.274): Frost Sorcerer opens onto Emberdeep, Ember Colossus and the Inversion; their shoulders rise to
 // the Void Tyrant and the Abyss King. The Deep Line (15) and the outer circuit are still reserved.
 [9,10],[9,11],[9,12],[10,13],[12,14],
 // the apex and the outer circuit (7.275): all five crown regions rise to the Deep Line; 13–16–17–18–19–20–14 runs around
 [13,16],[11,15],[13,15],[10,15],[12,15],[14,15],   // (this order sets the mouth heights at both ends; each trip stays under ten seconds)
[16,17],[17,18],[18,19],[19,20],[20,14],
 // (7.278) one way down into the Fractured emerald, then its own braid (1–2, 1–3, 2–4 reflected); its echoes stay
 // sealed until the base quest's keepsake is held (the view's echo seal), so the road itself needs no keepsake
 [19,21],[21,22],[21,23],[22,24],
 // (7.278) the Fractured braid, crown, apex and circuit, as the base's (its gate links 39–21, 40–23/25/27 not yet)
 [23,25],[24,26],[25,26],[26,28],[26,27],[28,29],[27,29],[29,30],[29,31],[29,32],[30,33],[32,34],[33,36],[31,35],[33,35],[30,35],[32,35],[34,35],[36,37],[37,38],[38,39],[39,40],[40,34]];
const crossings=[[2,3],[4,5],
 // spokes from the outer circuit into the inner braid (7.275); 19–1 (7.276) ends at a gate room over the Outskirts' road
 [16,8],[17,4],[18,2],[19,1],
 // (7.276) Sunspire's three entrances, each a gate room over its road (a mid-world socket), not its arrival junction
 [20,3],[20,5],[20,7],
 // (7.278) the Fractured braid's crossing, as 2–3 below
 [22,23],[24,25],[36,28],[37,24],[38,22]];
const links=[...roads.map(([a,b])=>({id:`${a}-${b}`,a,b,kind:'road'})),...crossings.map(([a,b])=>({id:`${a}-${b}`,a,b,kind:'crossing'}))];
const reserved=[];
function prepareWorld(w){
 if(!positions[w.n]||w.atlasEnd)return;
 const last=w.sections.at(-1),def=w.rooms.find(r=>r.id===last.room),dir=def.exit||'right';
 w.atlasEnd=last.room;
 w.atlasMiddle=w.sections[Math.floor(w.sections.length/2)].room;
 // The Climb's straight-up springs reach the pod later than the original
 // room tape. Retiming the demonstration preserves the existing physics.
 if(w.n===4)w.tapes['cl4-u4-crown']=[[20,'ru'],[5,'rx'],[20,'ru'],[5,'ux'],[55,'ru'],[10,'l'],[1,'ds'],[100,'ru']];
 const cols=def.cols||40,rows=def.rows||23;
 const grid=Array.from({length:rows},()=>Array(cols).fill('.'));
 // Side entries remain open at every height, so authored exit trajectories are preserved.
 for(let r=0;r<rows;r++){if(dir!=='right')grid[r][0]='#';if(dir!=='left')grid[r][cols-1]='#';}
 // (a road ending downward drops into the crossroads from above, through its ceiling)
 let floor=rows-1;
 if(dir!=='up'&&dir!=='down'){
  const edge=dir==='left'?0:cols-1;
  floor=def.map.reduce((last,row,i)=>row[edge]&&row[edge]!=='#'?i+1:last,rows-1);
 }
 for(let r=floor;r<rows;r++)for(let c=0;c<cols;c++)grid[r][c]='#';
 if(dir==='up')for(let c=0;c<cols;c++)if(def.map[0][c]!== '#')grid[rows-1][c]='M';
 const c=dir==='left'?cols-6:5,r=floor-1;grid[r][c]='P';
 const id=`cl${w.n}-atlas-crossroads`;
 const room={id,name:w.n===9?'The Crown Approach':'The Crossroads',map:grid.map(row=>row.join('')),cols,rows,exit:'none',entry:dir==='up'?'down':dir==='down'?'up':dir==='left'?'right':'left',dashes:1,palette:w.palette,atlasJunction:true,connector:true};
 w.rooms.push(room);
 w.sections.push({room:id,x:last.x+(dir==='right'?cols:dir==='left'?-cols:0),y:last.y+(dir==='up'?-rows:dir==='down'?(def.rows||23):0),fire:{c,r},atlasJunction:true});
}
function create(worlds,stored){
 const byId=new Map(worlds.filter(w=>positions[w.n]).map(w=>[w.n,w]));
 const roomWorld=new Map();
 for(const w of byId.values())for(const r of w.rooms)roomWorld.set(r.id,w.n);
 const clean=stored&&stored.version===1?stored:{};
 const state={version:1,visited:{1:true},solved:{},open:{},checkpoint:null};
 for(const id of Object.keys(clean.visited||{}))if(byId.has(+id))state.visited[id]=true;
 for(const id of Object.keys(clean.solved||{}))if(roomWorld.has(id)&&clean.solved[id])state.solved[id]=true;
 for(const l of links)if(clean.open?.[l.id])state.open[l.id]=true;
 let cp=clean.checkpoint;
 const replacement=cp&&byId.get(cp.world)?.retiredPassages?.[cp.room];
 if(replacement)cp={world:cp.world,room:replacement,via:null,entry:null};
 if(cp&&roomWorld.get(cp.room)===cp.world){state.checkpoint={world:cp.world,room:cp.room,via:cp.via==='back'?'back':cp.via==='door'?'door':null,entry:cp.entry==='left'||cp.entry==='right'?cp.entry:null};state.visited[cp.world]=true;}
 const last=n=>byId.get(n)?.atlasEnd||byId.get(n)?.sections.at(-1)?.room;
 function refresh(){
  const opened=[];
  for(const l of links){
   const ready=l.kind==='road'?state.solved[last(l.a)]:state.solved[last(l.a)]&&state.solved[last(l.b)];
   if(ready&&!state.open[l.id]){state.open[l.id]=true;opened.push(l.id);}
  }
  return opened;
 }
 refresh();
 return {
  state,positions,links,reserved,
  visit(world,room,via=null,entry=null){if(roomWorld.get(room)!==world)return false;state.visited[world]=true;state.checkpoint={world,room,via:via==='back'?'back':via==='door'?'door':null,entry:entry==='left'||entry==='right'?entry:null};return true;},
  solve(room){if(!roomWorld.has(room))return [];state.solved[room]=true;return refresh();},
  routes(world){return links.filter(l=>l.a===world||l.b===world).map(l=>({...l,to:l.a===world?l.b:l.a,open:!!state.open[l.id]}));},
  canTravel(from,to){return links.some(l=>((l.a===from&&l.b===to)||(l.b===from&&l.a===to))&&state.open[l.id]);},
  endpoint(linkId,world){
   const l=links.find(l=>l.id===linkId),w=byId.get(world);
   if(!l||!w||(l.a!==world&&l.b!==world))return null;
   // a mid-world socket (a gate room over the road, 7.276) is that link's end in its world
   const gate=w.rooms.find(d=>d.atlasGate&&d.atlasSockets?.some(s=>s.link===linkId));if(gate)return gate.id;
   return l.kind==='crossing'?w.sections[0].room:l.a===world?w.sections.at(-1).room:w.sections[0].room;
  },
  snapshot(){return JSON.parse(JSON.stringify(state));}
 };
}
root.BladefallClimbAtlas={create,prepareWorld,positions,links,reserved};
})(typeof window!=='undefined'?window:globalThis);
