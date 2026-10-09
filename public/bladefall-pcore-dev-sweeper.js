/* Opt-in path sweepers. Points are tile centers; period is a full out/back or loop circuit.
   A single point creates a stationary thorn. Non-solid thorns: no footing, damage, parry or cargo interaction. Clock starts on input. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
function at(e,clock){
 if(e.path.length===1)return {x:e.path[0][0],y:e.path[0][1]};
 let u=(((clock+e.phase)%e.period)+e.period)%e.period/e.period;
 if(!e.loop)u=u<.5?u*2:2-u*2;
 let distance=u*e.length;
 for(let i=0;i<e.lengths.length;i++){
  const n=e.lengths[i];if(distance<=n||i===e.lengths.length-1){const a=e.path[i],b=e.path[(i+1)%e.path.length],t=Math.min(1,distance/n);return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t};}distance-=n;
 }
}
function reset(g){
 g.sweeperClock=0;g.sweeperAwake=!!g.awake;g.sweeperPlayerBefore=null;
 g.sweepers=(g.room.def.sweepers||[]).map((d,i)=>{
  if(!Array.isArray(d.path)||d.path.length<1||d.path.some(q=>!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isFinite(v))))throw new Error('Invalid sweeper path in '+g.room.id);
  const e={id:String(d.id??i),path:d.path.map(([c,r])=>[c*8+4,r*8+4]),period:d.period??180,phase:d.phase??0,radius:d.radius??4,loop:!!d.loop};
  if(!Number.isFinite(e.period)||!Number.isFinite(e.phase)||!Number.isFinite(e.radius)||e.period<30||e.radius<2||e.radius>12)throw new Error('Invalid sweeper timing or radius in '+g.room.id);
  e.lengths=e.path.length===1?[]:e.path.slice(0,e.loop?undefined:-1).map((a,j)=>Math.hypot(a[0]-e.path[(j+1)%e.path.length][0],a[1]-e.path[(j+1)%e.path.length][1]));
  if(e.lengths.some(n=>n===0))throw new Error('Zero-length sweeper segment in '+g.room.id);
  e.length=e.lengths.reduce((a,b)=>a+b,0);Object.assign(e,at(e,0));e.prevX=e.x;e.prevY=e.y;return e;
 });
}
function before(g,inp){
 if(!g.sweepers.length)return;
 g.sweeperPlayerBefore={x:g.p.x,y:g.p.y,events:g.events.length};
 if(g.awake||inp?.portal)g.sweeperAwake=true;
 if(g.sweeperAwake)g.sweeperClock++;
 for(const e of g.sweepers){e.prevX=e.x;e.prevY=e.y;Object.assign(e,at(e,g.sweeperClock));}
}
function touches(x,y,p,r){const qx=Math.max(p.x,Math.min(x,p.x+p.w)),qy=Math.max(p.y,Math.min(y,p.y+p.h));return (qx-x)**2+(qy-y)**2<r*r;}
function after(g){
 const p=g.p,from=g.sweeperPlayerBefore;if(!from||p.state==='dead'||p.state==='respawn')return;
 // Portal/echo travel is discontinuous: test the arrival, not the unoccupied middle. Ordinary
 // fast movement still receives relative swept collision, even at dash or carriage-launch speeds.
 const teleported=g.events.slice(from.events).some(e=>e.type==='echo-swap'||(e.type==='portal-pass'&&e.kind==='knight'));
 for(const e of g.sweepers){
  const dx=teleported?0:p.x-from.x,dy=teleported?0:p.y-from.y,px=teleported?p.x:from.x,py=teleported?p.y:from.y;
  const n=Math.max(1,Math.ceil(Math.hypot(dx-(e.x-e.prevX),dy-(e.y-e.prevY))/2));
  for(let i=0;i<=n;i++){const t=i/n;if(touches(e.prevX+(e.x-e.prevX)*t,e.prevY+(e.y-e.prevY)*t,{x:px+dx*t,y:py+dy*t,w:p.w,h:p.h},e.radius)){C().kill(g,p,'sweeper');return;}}
 }
}
function mirror(g){for(const e of g.sweepers||[]){e.path=e.path.map(([x,y])=>[x,g.room.h-y]);e.y=g.room.h-e.y;e.prevY=g.room.h-e.prevY;}g.sweeperPlayerBefore=null;}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'sweeper',reset,before,after,mirror});
root.BladefallPrecisionSweeper=Object.freeze({at,touches});
})(typeof window!=='undefined'?window:globalThis);
