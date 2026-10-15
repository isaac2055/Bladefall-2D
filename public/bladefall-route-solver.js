/* Intended routes that survive edits (7.340). Shared by the game, the level builder's test play and
   scripts/routes/solve.mjs, so a route found anywhere replays the same everywhere.
   A route is {tape:[[frames,keys]…], path:[[x,y]…] (the knight every `sample` frames), frames, room (a digest
   of the compiled room it was made for), flags (climb physics: dropThru/springUp), source, at}.
   play() checks a route against the room as it is now; repair() finds a new one, following the old route's
   path (or a player's run) waypoint by waypoint and rejoining the old inputs wherever they fit again. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,SAMPLE=8,WATCH_EXTRA=90;
const keysToInput=k=>({l:k.includes('l'),r:k.includes('r'),u:k.includes('u'),d:k.includes('d'),jump:k.includes('j'),dash:k.includes('x'),grab:k.includes('g'),strike:k.includes('s'),parry:k.includes('p'),portal:k.includes('q')});
function expand(tape){const out=[];for(const [n,k]of tape||[])for(let i=0;i<n;i++)out.push(k||'');return out;}
function zip(frames){const out=[];for(const k of frames){const last=out[out.length-1];if(last&&last[1]===k)last[0]++;else out.push([1,k]);}return out;}
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
/* A digest of a compiled room: equal digests mean the route was made for exactly this geometry. */
function digest(room){const s=stable(room);let a=0x811c9dc5,b=0x9e3779b9;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,0x01000193)>>>0;b=Math.imul(b^c,0x5bd1e995)>>>0;b^=b>>>13;}return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');}
/* A game for one room, set up the way the builder's test play and its "Watch" set it up. */
function game(room,flags={}){const g=C().createGame([room]);g.workshop=true;if(flags.dropThru!=null)g.dropThru=!!flags.dropThru;if(flags.springUp!=null)g.springUp=!!flags.springUp;C().enterRoom(g,0);return g;}
const SKIP=new Set(['defs','rooms','room','spikeSafe']);
function snapshot(g){const o={};for(const k in g)if(!SKIP.has(k))o[k]=g[k];const c=structuredClone(o);c.defs=g.defs;c.rooms=g.rooms;c.room=g.room;
 // Frozen pools change terrain in place, so each branch keeps its own grid; tide hazards close over the game.
 if(g.water)c.room={...g.room,grid:g.room.grid.slice(),ice:g.room.ice?.slice()};
 if(c.water?.tide){const W=root.BladefallPrecisionWater;c.spikeSafe=(cc,r)=>W.tideSafe(c,cc,r);}else c.spikeSafe=g.spikeSafe||null;
 return c;}
// A waypoint: where the knight is, how fast it moves and what dashes it holds.
// The sixth number counts lit stones, open gates and plate-held doors, so a repaired route still does what the old one did;
// the seventh says the knight carries something (a lantern that must not be left behind).
const done=g=>g.ents.reduce((n,e)=>n+(e.lit?1:0)+(e.open?1:0)+(e.type==='held'&&!e.solid?1:0),0);   // held: doors a weighted plate keeps open
const pose=g=>[Math.round(g.p.x),Math.round(g.p.y),Math.round(g.p.vx),Math.round(g.p.vy),g.p.dashes|0,done(g),g.p.carrying?1:0];
const step=(g,k)=>{C().step(g,keysToInput(k));let dead=false,exit=null;for(const e of g.events){if(e.type==='death')dead=true;else if(e.type==='exit')exit=e;}g.events.length=0;return {dead,exit};};
/* Replays a tape (and the 90 idle frames Watch allows after it). ok: it reached an exit and nobody died. */
function play(room,tape,{flags={},sample=SAMPLE,extra=WATCH_EXTRA}={}){
 const g=game(room,flags),frames=expand(tape),path=[];let death=-1,exit=-1,side=false,i=0;
 for(;i<frames.length+extra;i++){const r=step(g,frames[i]||'');if(i%sample===0)path.push(pose(g));if(r.dead){death=i;break;}if(r.exit){exit=i;side=!!r.exit.side;break;}}
 return {ok:exit>=0&&death<0,exit,death,side,frames:frames.length,path,end:[Math.round(g.p.x),Math.round(g.p.y)]};
}
/* A route object from a tape known (or hoped) to work. */
function route(room,tape,{flags={},source='original'}={}){const r=play(room,tape,{flags});return {tape:zip(expand(tape).slice(0,r.ok?r.exit+1:undefined)),path:r.path,sample:SAMPLE,frames:r.ok?r.exit+1:r.frames,room:digest(room),flags,source,ok:r.ok,at:new Date().toISOString()};}
/* Inputs worth trying here: movement, jumps, dashes and climbing always; blade, parry, portals and the echo
   only where the room has something they act on. */
function actions(room,dir='r'){
 const back=dir==='r'?'l':'r',D8=['r','l','u','d','ru','lu','rd','ld'],out=[];
 const text=JSON.stringify(room),parry=/"(foes|combat|jailers|enemies|archers|turrets|boss|duel|echoDuel)"/.test(text);
 for(const k of ['',dir,back,dir+'j',back+'j','j','u','d',dir+'g',back+'g',dir+'gu',back+'gu',dir+'gj',back+'gj','ugj',dir+'d',dir+'u'])for(const n of [4,10,18])out.push([[n,k]]);
 for(const k of D8)out.push([[8,k+'x'],[4,k]]);
 for(const d of [dir,back])out.push([[5,d+'dx'],[5,d],[18,d+'j']],[[5,d+'x'],[5,d],[18,d+'j']],[[5,d+'ux'],[5,d],[18,d+'j']],[[2,d+'j'],[6,d+'dx'],[10,d]]);
 for(const k of ['s','ds','us','ujs',dir+'s',dir+'js',back+'s','djs'])for(const n of [4,10])out.push([[n,k]]);
 if(parry)for(const k of ['p',dir+'p',back+'p',dir+'jp',back+'jp',dir+'gp',back+'gp','ugp','ugjp'])for(const n of [4,10])out.push([[n,k]]);
 if(room.portalMode)for(const d of D8)out.push([[1,d+'q'],[3,d]],[[1,d+'gq'],[3,d+'g']]);
 if(room.echo)for(const k of ['',dir,back,dir+'j',back+'j','u','d'])out.push([[1,k+'q']],[[1,k+'q'],[3,k]]);
 return out;
}
function key(g){const p=g.p,ents=g.ents.map(e=>(e.gone?'g':'')+(e.lit?'l':'')+(e.open?'o':'')+(e.solid?'s':'')+(e.x!==e.ox||e.y!==e.oy?((e.x>>3)+','+(e.y>>3)):'')+(e.state&&e.state!=='idle'?e.state:'')).join(';');
 return [p.x>>2,p.y>>2,Math.round(p.vx/35),Math.round(p.vy/35),p.state,p.dashes,p.onGround?1:0,p.airJumps||0,p.carrying?1:0,p.swimming?1:0,g.phase,g.flipped?1:0,g.echo?(g.echo.x>>3)+','+(g.echo.y>>3):'',g.portals?JSON.stringify(g.portals):'',ents].join('|');}
const dist=(g,t)=>Math.hypot(g.p.x-t[0],(g.p.y-t[1])*1.3);
// Arriving at the right speed with the dashes the route had matters as much as the place.
const miss=(g,t)=>dist(g,t)+(t.length>2?Math.hypot(g.p.vx-t[2],g.p.vy-t[3])*.04+Math.max(0,t[4]-g.p.dashes)*12+Math.max(0,(t[5]||0)-done(g))*40+(t[6]&&!g.p.carrying?60:0):0);
// Where the route stood still (lining up a jump), arrive within a few pixels; on the move, within a tile.
const arrived=(g,t,radius)=>dist(g,t)<=(t.length>2&&Math.abs(t[2])+Math.abs(t[3])<30?Math.min(radius,3):radius)&&(t.length<5||g.p.dashes>=t[4])&&(t.length<6||done(g)>=t[5])&&(!t[6]||!!g.p.carrying)&&g.p.state!=='dead';
/* Beam search from `start` until the knight is within `radius` of `target` (or, with exit, leaves the room
   near it). Yields between layers so a browser can keep drawing. */
function* reach(room,start,target,{radius=10,exit=false,beam=60,depth=24,budget}){
 const acts=actions(room,target[0]>=start.g.p.x?'r':'l');let frontier=[start];const seen=new Set([key(start.g)]);
 for(let d=0;d<depth&&frontier.length;d++){
  const next=[];
  for(const node of frontier)for(const a of acts){
   if(budget.left--<=0)return null;
   const z=snapshot(node.g),frames=[];let dead=false,left=null;
   outer:for(const [n,k]of a)for(let i=0;i<n;i++){const r=step(z,k);frames.push(k);if(r.dead){dead=true;break outer;}if(r.exit){left=r.exit;break outer;}}
   if(dead)continue;
   const t=node.t.concat(frames),dd=dist(z,target);
   if(left){if(exit&&!left.side===!exit.side&&dd<=Math.max(radius,48))return {g:z,t,exited:true};continue;}
   if(!exit&&arrived(z,target,radius))return {g:z,t};
   const k=key(z);if(seen.has(k))continue;seen.add(k);
   next.push({g:snapshot(z),t,s:miss(z,target)+t.length*.02+(z.p.y>target[1]+80?100:0)});
  }
  next.sort((a,b)=>a.s-b.s);frontier=next.slice(0,beam);
  yield {depth:d,best:frontier[0]?.s};
 }
 return null;
}
/* Where the old route's inputs still work from here: try its suffix from nearby frames and keep the best.
   Arriving early on the ground, it also waits out the difference first, so clocks, tides and carriers line up again. */
function rejoin(room,node,oldFrames,from,path,sample){
 let best=null;const early=from-node.t.length,tries=[];
 for(const o of [0,-2,2,-4,4,-8,8,-12,12])tries.push([o,0]);
 if(early>0&&node.g.p.onGround)for(const o of [0,-2,2,-4,4])if(early+o>0)tries.push([0,early+o]);
 for(const [o,wait] of tries){
  const s=from+o;if(s<0||s>=oldFrames.length)continue;
  const z=snapshot(node.g),t=node.t.slice();let i=s,exit=null,dead=false;
  for(let w=0;w<wait&&!dead;w++){dead=step(z,'').dead;t.push('');}if(dead)continue;
  for(;i<oldFrames.length+WATCH_EXTRA;i++){const k=oldFrames[i]||'';const r=step(z,k);t.push(k);if(r.dead){dead=true;break;}if(r.exit){exit=r.exit;break;}}
  if(exit&&!dead)return {done:true,g:z,t};
  // How far along the old path did it stay close? Keep inputs up to a second before it went wrong.
  const kept=Math.max(0,t.length-node.t.length-wait-60);if(kept<sample*6)continue;
  const zz=snapshot(node.g),tt=node.t.slice();for(let w=0;w<wait;w++){step(zz,'');tt.push('');}
  for(let j=0;j<kept;j++){const k=oldFrames[s+j]||'';step(zz,k);tt.push(k);}   // past the tape's end the knight idles, as Watch lets it
  const at=Math.min(path.length-1,Math.floor((s+kept)/sample)),off=dist(zz,path[at]);
  if(off<24&&(!best||kept>best.kept))best={kept,g:zz,t:tt,wi:at};
 }
 return best;
}
/* A point just outside the room's exit (its opening when the room gives one). */
function exitPoint(room){const W=room.cols*8,H=room.rows*8,sp=room.exitSpan?(room.exitSpan[0]+room.exitSpan[1])*4:null,P=room.map.findIndex(r=>r.includes('P')),py=P*8,px=P<0?0:room.map[P].indexOf('P')*8;
 return {right:[W+4,sp??py],left:[-12,sp??py],up:[sp??px,-12],down:[sp??px,H+4]}[room.exit]||[W+4,py];}
/* Finds a deathless route to the exit. Follows `path` (the old route's or a player's), rejoining `tape`
   where possible; with neither it heads for the exit edge. Generator: yields progress; returns the result. */
function* repair(room,{tape=null,path=null,flags={},sample=SAMPLE,budget:limit=600000}={}){
 const budget={left:limit},oldFrames=expand(tape);
 // Without a path, follow the old inputs as far as they still go, then head for the exit.
 if(tape){const r=play(room,tape,{flags,sample});if(r.ok)return {ok:true,unchanged:true,route:route(room,tape,{flags,source:'original'})};if(!path?.length)path=r.path.slice(0,Math.max(1,r.path.length-8)).concat([exitPoint(room)]);}
 if(!path?.length)path=[exitPoint(room)];
 let node={g:game(room,flags),t:[]},wi=0;
 // Keep the old inputs up to a second before they first fail, then search from there.
 if(oldFrames.length){const r=play(room,tape,{flags,sample});const keep=Math.max(0,(r.death>=0?r.death:r.frames)-60);for(let i=0;i<keep;i++){const k=oldFrames[i]||'';step(node.g,k);node.t.push(k);}wi=Math.min(path.length-1,Math.floor(keep/sample));}
 const history=[{node:{g:snapshot(node.g),t:node.t.slice()},wi}];let misses=0;
 while(true){
  const last=wi>=path.length-1;
  // Next waypoint: the first path point at least 28 px ahead (skipping points the knight has already passed).
  let ti=wi;while(ti<path.length-1&&Math.hypot(path[ti][0]-node.g.p.x,path[ti][1]-node.g.p.y)<28)ti++;
  ti=Math.min(path.length-1,ti+misses*3);
  const finale=ti>=path.length-1;
  yield {text:`Waypoint ${ti+1}/${path.length}`,done:ti/path.length,left:budget.left};
  const found=yield* reach(room,{g:snapshot(node.g),t:node.t},path[ti],{exit:finale?{side:false}:null,budget,radius:finale?48:10,depth:finale?36:24,beam:finale?90:60});
  if(found?.exited)return finish(room,found.t,flags);
  if(!found&&finale&&!last){misses=0;wi=path.length-1;continue;}
  if(found){node=found;wi=ti;misses=0;history.push({node:{g:snapshot(node.g),t:node.t.slice()},wi});
   if(oldFrames.length){const j=rejoin(room,node,oldFrames,wi*sample,path,sample);if(j?.done)return finish(room,j.t,flags);if(j){node={g:j.g,t:j.t};wi=j.wi;history.push({node:{g:snapshot(node.g),t:node.t.slice()},wi});}}
   continue;}
  if(budget.left<=0)return {ok:false,reason:'Ran out of search time',reached:wi,of:path.length};
  // Skip a waypoint the edit made unreachable; after three misses step back one waypoint and try again.
  if(++misses<=3&&ti<path.length-1)continue;
  if(history.length>1){history.pop();const h=history[history.length-1];node={g:snapshot(h.node.g),t:h.node.t.slice()};wi=h.wi;misses=1;continue;}
  return {ok:false,reason:'No way past waypoint '+(ti+1),reached:wi,of:path.length};
 }
}
function finish(room,frames,flags){const r=route(room,zip(frames),{flags,source:'solved'});return r.ok?{ok:true,route:r}:{ok:false,reason:'The found route did not replay'};}
/* Runs repair to completion (Node, or a browser that does not mind blocking). */
function solve(room,opts={}){const it=repair(room,opts);let r;while(!(r=it.next()).done)opts.onProgress?.(r.value);return r.value;}
/* Runs repair in slices of `slice` ms so the page keeps drawing. */
function solveAsync(room,opts={},slice=24){const it=repair(room,opts);return new Promise((resolve,reject)=>{const tick=()=>{const end=Date.now()+slice;try{while(Date.now()<end){const r=it.next();if(r.done){resolve(r.value);return;}opts.onProgress?.(r.value);}}catch(e){reject(e);return;}setTimeout(tick,0);};tick();});}
root.BladefallRouteSolver=Object.freeze({SAMPLE,WATCH_EXTRA,expand,zip,digest,game,pose,play,route,repair,solve,solveAsync,actions,keysToInput});
})(globalThis);
