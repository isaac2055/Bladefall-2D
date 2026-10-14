/* Precision Core — mirror panes, drawing (7.280). A pane is a tall sheet of glass with a bright edge and slow
   diagonal glints. Cyan glass will swap left and right; white glass (once you are swapped) will swap them back.
   While swapped the knight carries a cyan glint with a small two-way arrow over him and both side edges of the
   screen glow cyan, so the swapped state is never off screen. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type!=='pane')continue;
  const col=(g.players?g.p.mirrorLR:g.mirrorLR)?'#f4f8ff':'#7fe7ff',glow=(g.players?e.armedPlayers?.[g.players.indexOf(g.p)]!==false:e.armed)?1:.45;
  b.globalAlpha=.16*glow;px(b,e.x-1,e.y,e.w+2,e.h,col);
  b.globalAlpha=.55*glow;px(b,e.x+Math.floor(e.w/2)-1,e.y,2,e.h,col);
  b.globalAlpha=.9*glow;px(b,e.x+Math.floor(e.w/2)-1,e.y,2,1,'#ffffff');px(b,e.x+Math.floor(e.w/2)-1,e.y+e.h-1,2,1,'#ffffff');
  // A glint sliding down the glass.
  const gy=e.y+((t>>1)%Math.max(1,e.h+6))-6;b.globalAlpha=.7*glow;px(b,e.x+Math.floor(e.w/2)-1,Math.max(e.y,gy),2,Math.min(4,e.y+e.h-Math.max(e.y,gy)),'#ffffff');
  b.globalAlpha=1;
 }
}
function drawFront(b,g,view){
 if(!(g.players?g.p.mirrorLR:g.mirrorLR))return;
 const p=g.p;if(p.state==='dead')return;
 const cx=p.x+4,y=p.y-5;
 b.globalAlpha=.85;px(b,cx-3,y,7,1,'#7fe7ff');px(b,cx-3,y-1,1,3,'#7fe7ff');px(b,cx+3,y-1,1,3,'#7fe7ff');
 b.globalAlpha=.3;px(b,p.x-1,p.y-1,p.w+2,p.h+2,'#7fe7ff');
 // The screen's side edges (the camera's, in a room wider than a screen).
 const H=g.room.h||184,x0=view&&view.g===g&&view.cam?Math.round(view.cam.x):0;b.globalAlpha=.35+.1*((g.frame>>3)&1);px(b,x0,0,2,H,'#7fe7ff');px(b,x0+318,0,2,H,'#7fe7ff');
 b.globalAlpha=1;
}
function event(e,{burst,shake}){if(e.type==='mirror'){burst(e.x,e.y,18,e.on?'#7fe7ff':'#f4f8ff',70,18);shake(1,4);}}
const sfx={mirror:(e,{tone})=>{tone(e.on?990:660,.16,'triangle',.03,e.on?-330:330);tone(1480,.1,'sine',.015,0,.04);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'mirror',draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
