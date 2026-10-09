/* Opt-in load/release supports (Run 3).
   recoilPlatforms:[{id:'A',c:10,r:15,w:5,depth:3,loadFrames:30,releaseSpeed:120}]
   c/r/w/depth are tiles. A grounded knight holds Down (without Jump/Dash) to compress; release Down, then choose
   when to jump from the rising solid. Loose lanterns and living grounded Combat actors also load it.
   Picking up/removing the last passive weight releases it. Holding cargo permits manual loading.
   The return latches until extended. No forced jump, dash refill or private player impulse:
   every takeoff uses Core.moveSolid and the ordinary bounded lift/grace policy.
   Partial loads return more slowly (sqrt of stored depth). The physical axis mirrors with gravity. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,TILE=8;
const RK=Object.freeze({depth:3,loadFrames:30,releaseSpeed:120,maxDepth:6,maxSpeed:130});
const platforms=g=>g.ents.filter(e=>e.type==='recoilPlatform');
const on=(q,e)=>q.y+q.h===e.y&&q.x<e.x+e.w&&q.x+q.w>e.x;
function reset(g){
 const seen=new Set();
 for(const[i,d]of(g.room.def.recoilPlatforms||[]).entries()){
  const label=String(d.id??String.fromCharCode(65+i)),depth=d.depth??RK.depth,loadFrames=d.loadFrames??RK.loadFrames,speed=d.releaseSpeed??RK.releaseSpeed;
  if(seen.has(label)||![d.c,d.r,d.w,depth,loadFrames].every(Number.isInteger)||d.w<2||depth<1||depth>RK.maxDepth||loadFrames<12||!Number.isFinite(speed)||speed<30||speed>RK.maxSpeed)throw new Error('Invalid recoil platform '+label+' in '+g.room.id);
  seen.add(label);const e={type:'recoilPlatform',dev:true,solid:true,id:'recoil:'+label,label,x:d.c*TILE,y:d.r*TILE,w:d.w*TILE,h:TILE,
   ox:d.c*TILE,oy:d.r*TILE,depth:depth*TILE,loadFrames,releaseSpeed:speed,axis:1,charge:0,releaseV:0,state:'idle',loadedBy:'',remX:0,remY:0,pulse:0,jammed:false};
  if(e.x<0||e.y<0||e.x+e.w>g.room.w||e.y+e.h+e.depth>g.room.h||C().blockerAt(g,e.x,e.y,e.w,e.h,e))throw new Error('Recoil platform '+label+' starts obstructed in '+g.room.id);
  g.ents.push(e);
 }
}
function load(g,e,inp){
 if(e.axis!==1)return ''; // A mirrored plate retains its physical axis; its underside is not a weight sensor.
 const p=g.p;
 if(p.state==='normal'&&p.vy>=0&&on(p,e)&&inp.my>0&&!inp.dash&&!inp.jump)return 'knight';
 if(g.ents.some(q=>q.type==='lantern'&&!q.held&&!q.returning&&on(q,e)))return 'lantern';
 if((g.combat?.enemies||[]).some(q=>!q.dead&&q.kind!=='wing'&&on(q,e)))return 'combat';
 return '';
}
function move(g,e,target){
 const Core=C(),wanted=e.oy+e.axis*target,dy=wanted-(e.y+e.remY),next=e.y+Math.round(e.remY+dy);
 if(Core.blockerAt(g,e.x,next,e.w,e.h,e)){if(!e.jammed)Core.emit(g,'recoil-jam',{x:e.x+e.w/2,y:e.y,label:e.label});e.jammed=true;return false;}
 const oldGround=g.p.onGround;if(on(g.p,e)&&g.p.vy>=0)g.p.onGround=true;
 Core.moveSolid(g,e,0,dy);g.p.onGround=oldGround;e.charge=target;e.jammed=false;return true;
}
function before(g,inp){
 const Core=C(),p=g.p;
 for(const e of platforms(g)){
  if(e.pulse)e.pulse--;
  if(!g.awake)continue;
  const weight=load(g,e,inp);e.loadedBy=weight;
  if(e.state!=='release'){
   if(weight){
    if(e.state!=='load'){e.state='load';Core.emit(g,'recoil-load',{x:e.x+e.w/2,y:e.y,label:e.label,by:weight});}
    move(g,e,Math.min(e.depth,e.charge+e.depth/e.loadFrames));
   }else if(e.charge>0){
    // Divide the complete stroke into equal simulation steps. A tiny final remainder must not
    // replace the useful lift with a one-frame crawl at an otherwise identical charge.
    const peak=e.releaseSpeed*Math.sqrt(e.charge/e.depth),frames=Math.ceil(e.charge/(peak/60));
    e.releaseStep=e.charge/frames;e.releaseSteps=frames;e.releaseV=e.releaseStep*60;e.state='release';e.pulse=12;
    Core.emit(g,'recoil-release',{x:e.x+e.w/2,y:e.y,label:e.label,charge:+e.charge.toFixed(2),speed:+e.releaseV.toFixed(2)});
   }else e.state='idle';
  }
  if(e.state==='release'){
   if(on(p,e)){p.recoilSource=e.id;p.recoilSourceUntil=g.frame+Core.K.liftGraceFrames+1;}
   if(move(g,e,e.releaseSteps===1?0:Math.max(0,e.charge-e.releaseStep))){e.releaseSteps--;if(e.charge===0){e.state='idle';e.releaseV=0;}}
  }
 }
}
function after(g){
 const p=g.p;if(!p.recoilSource||g.frame>p.recoilSourceUntil)return;
 const jump=g.events.find(e=>e.frame===g.frame&&((e.type==='jump'&&e.lift)||(['hyper','super','wallbounce'].includes(e.type)&&p.liftY<0))); 
 if(jump){C().emit(g,'recoil-jump',{x:p.x+4,y:p.y+p.h,source:p.recoilSource,vx:p.vx,vy:p.vy});p.recoilSource=null;}
}
function mirror(g){for(const e of platforms(g))e.axis=-e.axis;g.p.recoilSource=null;}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'recoil',reset,before,after,mirror});
root.BladefallPrecisionRecoil=Object.freeze({RK,platforms,load});
})(typeof window!=='undefined'?window:globalThis);
