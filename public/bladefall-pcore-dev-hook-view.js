/* Precision Core — Thunder Cliffs, drawing (7.254). A hook ring is a bronze ring on a bolt; in the air, the
   rings you could catch right now brighten. The chain is drawn link by link while you swing. Decks are
   lashed timber on iron runners, with their track dotted behind them. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawBack(b,g){
 for(const e of g.ents){if(e.type!=='deck')continue;b.strokeStyle='#5b5344';b.setLineDash([2,3]);b.beginPath();b.moveTo(e.ox+e.w/2+.5,e.oy+e.h/2+.5);b.lineTo(e.ox+e.dx+e.w/2+.5,e.oy+e.dy+e.h/2+.5);b.stroke();b.setLineDash([]);}
}
function draw(b,g){
 const p=g.p,H=root.BladefallPrecisionHook,t=g.frame;
 const reach=p.state!=='dead'&&!p.onGround&&p.state!=='hook'?H.ringFor(g,p):null;
 for(const e of g.ents){
  if(e.type==='ring'){const hot=reach&&reach.ring===e;b.strokeStyle=hot?'#ffe2a0':'#b08a4a';b.lineWidth=2;b.beginPath();b.arc(e.x+4,e.y+4,3,0,Math.PI*2);b.stroke();b.lineWidth=1;px(b,e.x+3,e.y-1,2,2,'#6a5a3a');
   if(hot&&(t>>3)&1){b.globalAlpha=.3;b.fillStyle='#ffe2a0';b.beginPath();b.arc(e.x+4,e.y+4,6,0,Math.PI*2);b.fill();b.globalAlpha=1;}}
  else if(e.type==='deck'){px(b,e.x,e.y,e.w,e.h,'#6b4e2e');for(let x=e.x+3;x<e.x+e.w;x+=6)px(b,x,e.y,1,e.h,'#4a3520');px(b,e.x,e.y,e.w,1,'#c09a60');px(b,e.x,e.y+e.h-1,e.w,1,'#3a3a40');}
 }
 if(p.state==='hook'&&p.hook){const r=p.hook.ring,x0=r.x+4,y0=r.y+4,x1=p.x+4,y1=p.y+4,n=Math.max(2,Math.hypot(x1-x0,y1-y0)/3|0);
  for(let i=0;i<=n;i++)px(b,x0+(x1-x0)*i/n-.5,y0+(y1-y0)*i/n-.5,i%2?1:2,i%2?1:2,i%2?'#8a8e98':'#c8ccd4');}
}
function event(e,{burst}){if(e.type==='hook')burst(e.x,e.y,8,'#ffe2a0',40,14);else if(e.type==='unhook')burst(e.x,e.y,4,'#c8ccd4',30,10);}
const sfx={hook:(e,{tone,noise})=>{noise(.06,.04,2500);tone(520,.1,'square',.03);},unhook:(e,{tone})=>tone(380,.06,'triangle',.02)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'hook',drawBack,draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
