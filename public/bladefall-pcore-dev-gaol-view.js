/* Precision Core — the Gaol, drawing (7.254). A jailer is a grey warder with a tall iron shield on the side
   it faces; its spear glints during the tell and extends on the thrust. While you stand behind it, ticks fill
   a ring over its helm: when the ring closes, it turns. Staggered, the shield hangs low and its eyes dim.
   A pressure pod is a brass bellows ringed with rivets; spent, it sags until it re-arms. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const COL={body:'#5b5e66',bodyD:'#3a3c43',helm:'#8d929c',shield:'#a9b1bd',shieldD:'#6c7480',rim:'#d9dee6',spear:'#e8e2d0',eye:'#ffcf6a',
 pod:'#b0843e',podD:'#6e4f22',podL:'#f0cf86',rivet:'#e6d7b0',ward:'#d5f7e9'};
function drawJailer(b,j,t,p){
 const x=Math.round(j.x),y=Math.round(j.y),d=j.dir,stag=j.state==='stagger',tell=j.state==='tell',thrust=j.state==='thrust';
 // legs, body, helm
 px(b,x+2,y+13,3,3,COL.bodyD);px(b,x+7,y+13,3,3,COL.bodyD);
 px(b,x+1,y+5,10,9,COL.body);px(b,x+1,y+5,10,1,COL.helm);
 px(b,x+2,y,8,6,COL.helm);px(b,x+2,y+5,8,1,COL.bodyD);
 px(b,d>0?x+6:x+3,y+2,3,1,stag?'#555a60':COL.eye);
 // spear: glints on the tell, extends on the thrust
 const sy=y+8;
 if(thrust){px(b,d>0?x+j.w:x-18,sy,18,1,COL.spear);px(b,d>0?x+j.w+16:x-19,sy-1,3,3,COL.spear);}
 else px(b,d>0?x+6:x-2,sy,8,1,tell&&(t>>1)&1?'#ffffff':COL.spear);
 // shield on the facing side (hangs low while staggered)
 const shx=d>0?x+j.w-2:x-2,shy=stag?y+8:y+2;
 px(b,shx,shy,4,stag?8:13,COL.shieldD);px(b,d>0?shx+1:shx,shy,3,stag?8:13,COL.shield);px(b,d>0?shx+3:shx,shy,1,stag?8:13,COL.rim);
 if(stag){const warn=j.t<30;for(let i=0;i<3;i++){const a=t/6+i*2.1;px(b,x+6+Math.cos(a)*6,y-3+Math.sin(a)*2,1,1,warn&&(t>>2)&1?'#ff6a4a':'#fff1a0');}}
 // turning ring: ticks fill while you are behind it
 if(j.turn>0&&j.turnT>0){const n=12,k=Math.ceil(j.turnT/j.turn*n);for(let i=0;i<n;i++){const a=-Math.PI/2+i/n*Math.PI*2;px(b,x+6+Math.cos(a)*5-0.5,y-6+Math.sin(a)*3,1,1,i<k?'#ffcf6a':'#4a4d55');}}
 if(j.turn===0)px(b,x+5,y-3,2,1,COL.rim);   // a fixed jailer wears a bar on its crest: it never turns
}
function drawPod(b,e,t){
 const x=e.x,y=e.y;
 if(e.timer>0){px(b,x+1,y+3,6,4,COL.podD);px(b,x+2,y+2,4,1,COL.podD);return;}
 const pulse=(t>>4)&1;
 px(b,x,y+1,8,6,COL.pod);px(b,x+1,y,6,8,COL.pod);px(b,x+2,y+2,4,4,COL.podD);px(b,x+3,y+3,2,2,pulse?COL.podL:COL.pod);
 px(b,x,y,1,1,COL.rivet);px(b,x+7,y,1,1,COL.rivet);px(b,x,y+7,1,1,COL.rivet);px(b,x+7,y+7,1,1,COL.rivet);
}
function drawWard(b,p){
 if(!(p.parryTimer>0))return;
 b.strokeStyle=COL.ward;b.lineWidth=1;b.beginPath();b.arc(p.x+4,p.y+5,12,0,Math.PI*2);b.stroke();
}
function draw(b,g){
 const t=g.roomFrame;
 for(const e of g.ents)if(e.type==='recoil')drawPod(b,e,t);
 if(g.jailers)for(const j of g.jailers)if(j.alive)drawJailer(b,j,t,g.p);
 if(g.parryable&&!g.foes&&!g.combat&&g.p.state!=='dead')drawWard(b,g.p);
}
function event(e,{burst,shake}){
 switch(e.type){
  case 'recoil':burst(e.x,e.y,12,'#f0cf86',70,20);shake(2,6);break;
  case 'jailer-fell':burst(e.x,e.y,16,'#a9b1bd',60,28,80);shake(2,8);break;
  case 'jailer-turn':burst(e.x,e.y,6,'#ffcf6a',30,14);break;
  case 'guard-block':burst(e.x,e.y,6,'#ffffff',50,10);break;
 }
}
const sfx={recoil:(e,{tone,noise})=>{noise(.12,.05,400);tone(180,.2,'square',.04,320);},
 'jailer-fell':(e,{tone,noise})=>{noise(.2,.06,300);tone(220,.3,'triangle',.04,-120);},
 'jailer-turn':(e,{tone})=>tone(320,.08,'square',.03,-60),
 'jailer-thrust':(e,{noise})=>noise(.08,.04,2000),
 'recoil-back':(e,{tone})=>tone(520,.06,'triangle',.02)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'gaol',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
