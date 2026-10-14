/* Precision Core — Oren's relay, drawing (7.254). Oren is a small figure in a moss-green cloak with a round
   shield. Walking, he follows your footprints (drawn faintly ahead of him); holding, he plants his shield
   and a pale ring marks the step on his shoulders. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){
 for(const state of g.players||[g]){const R=state.relay;if(!R)continue;const e=R.e,t=g.frame;
 if(!R.held){b.globalAlpha=.25;for(let k=R.i+6;k<R.path.length;k+=8){const s=R.path[k];px(b,s.x+3,s.y+10,2,1,'#9ab86a');}b.globalAlpha=1;}
 const x=e.x,y=e.y,f=e.facing||1,step=R.held?0:(t>>3)&1;
 px(b,x+1,y+4,6,6,'#4f6a3a');px(b,x+2,y+1,4,4,'#cdb294');px(b,x+1,y,6,2,'#3a4a2a');px(b,f>0?x+4:x+2,y+2,1,1,'#1a1a1a');
 px(b,x+1+step,y+9,2,2,'#2a2a22');px(b,x+5-step,y+9,2,2,'#2a2a22');
 px(b,f>0?x+6:x-1,y+4,3,R.held?6:4,'#b89a5e');px(b,f>0?x+7:x,y+5,1,R.held?4:2,'#e0c890');
 if(R.held){b.globalAlpha=.5+.2*Math.sin(t/8);px(b,x-1,y-1,10,1,'#e8f0c0');b.globalAlpha=1;}
}}
function event(e,{burst}){if(e.type==='oren-hold')burst(e.x,e.y,8,'#e0c890',30,14);else if(e.type==='oren-go')burst(e.x,e.y,5,'#9ab86a',30,12);}
const sfx={'oren-hold':(e,{tone})=>tone(330,.12,'triangle',.04),'oren-go':(e,{tone})=>tone(495,.1,'triangle',.03)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'relay',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
