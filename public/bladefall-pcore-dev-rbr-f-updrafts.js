/* Breathing thermals keep the established wind physics: their real force reverses with the visible clock.
   7.280, opt-in room field `slick:[[c0,r0,c1,r1],...]` (tiles; rock the wind has polished): the rock stays solid, but
   it gives no grip. The knight cannot hold it, climb it or wall-jump off it; the one way to push off it is a
   wallbounce (dash straight up beside it and jump while the dash runs). A room without the field is untouched. */
(function(root){'use strict';const TILE=8;
function reset(g){const d=g.room.def.breathing;g.breathing=d?{...d,t:0}:null;
 const sl=g.room.def.slick;g.slick=null;
 if(sl&&sl.length){const cols=g.room.def.cols||40,rows=g.room.def.rows||23,m=new Uint8Array(cols*rows);
  for(const [c0,r0,c1,r1] of sl)for(let r=Math.max(0,r0);r<=Math.min(rows-1,r1);r++)for(let c=Math.max(0,c0);c<=Math.min(cols-1,c1);c++)m[r*cols+c]=1;
  g.slick={m,cols,rows};}
 if(!d)return;let i=0;for(const w of g.winds||[])if(w.dy<=-200){w.breath={lift:w.dy,offset:d.offsets?.[i++]||0,phase:0,warning:false};}}
// Is the wall `dist` px to this side of the knight slick (every solid tile it would push off is slick)?
function slickSide(g,p,dir,dist){const s=g.slick,Core=root.BladefallPrecisionCore;if(!s||!Core)return false;
 const x0=dir>0?p.x+p.w-1+dist:p.x-dist,c=Math.floor(x0/TILE),r0=Math.floor(p.y/TILE),r1=Math.floor((p.y+p.h-1)/TILE);
 let slick=false,grip=false;
 for(let r=r0;r<=r1;r++){if(c<0||c>=s.cols||r<0||r>=s.rows)continue;
  if(Core.solidAt(g,c*TILE,r*TILE,TILE,TILE)){if(s.m[r*s.cols+c])slick=true;else grip=true;}}
 return slick&&!grip;}
function before(g,inp){const b=g.breathing;
 if(b){if(g.awake)b.t++;for(const w of g.winds||[]){const z=w.breath;if(!z)continue;const t=(b.t+z.offset)%b.period;z.phase=t<b.inhale?0:1;z.warning=z.phase===0?t>=b.inhale-27:t>=b.period-27;w.dy=z.phase===0?z.lift:120;}}
 const p=g.p;if(!g.slick||!p||p.state==='dead'||p.state==='respawn')return;
 const upDash=p.state==='dash'&&p.dashDir&&p.dashDir.x===0&&p.dashDir.y<0;
 const lateBounce=p.state==='normal'&&p.move2?.wallGrace>0;
 // A knight who pressed into the polished wall just before the up-dash would otherwise get his push back the frame
 // after the wallbounce (the core's four-frame wall-speed retention) and be turned round into the wall.
 if(upDash&&(slickSide(g,p,-1,5)||slickSide(g,p,1,5)))p.retainTimer=0;
 const L=slickSide(g,p,-1,3),R=slickSide(g,p,1,3);if(!L&&!R)return;
 if(inp)inp.grab=false;                       // nothing to hold
 if(p.state==='climb')p.state='normal';
 // no wall jump off it: only the jump that ends a straight-up dash (the wallbounce) pushes off
 if(g.buf&&g.buf.jump>0&&!p.onGround&&!(p.jumpGrace>0)&&!upDash&&!lateBounce)g.buf.jump=0;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-f-updrafts',reset,before});
})(typeof window!=='undefined'?window:globalThis);
