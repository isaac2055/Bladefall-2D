/* Precision Core — the zipline, drawing (7.280). Drawn like the main game's seam: a violet tear with a pale
   core and motes running its length (the way it carries you; both ways unless it is one-way), a pale mouth
   bar at each end with a halo, a dotted scar while it is shut, a faint ghost once spent. Entering pulses
   the mouth; riding wraps the knight in violet with sparks streaming off the tear. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawLine(b,e,t){
 const open=e.state==='',ax=e.ax,ay=e.ay,bx=e.bx,by=e.by;
 b.save();b.lineCap='round';
 b.globalAlpha=e.spent?.18:open?.95:.38;
 b.strokeStyle=open?'rgba(196,123,255,.85)':'rgba(120,96,150,.8)';b.lineWidth=open?3:1;
 if(!open)b.setLineDash([2,3]);
 b.beginPath();b.moveTo(ax,ay);b.lineTo(bx,by);b.stroke();b.setLineDash([]);
 if(open){
  b.strokeStyle='rgba(241,214,255,.95)';b.lineWidth=1;b.beginPath();b.moveTo(ax,ay);b.lineTo(bx,by);b.stroke();
  const len=Math.hypot(bx-ax,by-ay)||1,ux=(bx-ax)/len,uy=(by-ay)/len,n=Math.max(2,Math.round(len/24));
  for(let k=0;k<n;k++){
   const d=(t*1.6+k*len/n)%len;px(b,ax+ux*d-1,ay+uy*d-1,2,2,'#f1d6ff');
   if(!e.oneWay){const d2=len-((t*1.6+(k+.5)*len/n)%len);b.globalAlpha=.5;px(b,ax+ux*d2-1,ay+uy*d2-1,2,2,'#e2c2ff');b.globalAlpha=.95;}
  }
 }
 // The mouths (a one-way tear's far end is drawn smaller: it does not take you in).
 for(const [mx,my,k] of [[ax,ay,0],[bx,by,1]]){
  const mouth=!(e.oneWay&&k===1),r=open?(mouth?6:3):2;
  if(open&&mouth){b.globalAlpha=.3+(e.pulse>0?e.pulse/14*.5:0);px(b,mx-4,my-r-2,8,r*2+4,'#c47bff');b.globalAlpha=e.spent?.18:.95;}
  px(b,mx-1,my-r,2,r*2,open?'#f1d6ff':'#6b5a80');
  if(e.pulse>0&&open){const s=(14-e.pulse)*1.2;b.globalAlpha=e.pulse/14;b.strokeStyle='#f1d6ff';b.lineWidth=1;b.strokeRect(mx-3-s,my-r-1-s,6+2*s,r*2+2+2*s);b.globalAlpha=.95;}
 }
 b.restore();
}
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents)if(e.type==='zipline')drawLine(b,e,t);
}
function drawFront(b,g,view){
 const p=g.p;if(p.state!=='ride'||!p.ride)return;
 const R=p.ride,cx=p.x+4,cy=p.y+5;
 b.globalAlpha=.35;px(b,p.x-2,p.y-2,p.w+4,p.h+4,'#c47bff');b.globalAlpha=.8;
 b.strokeStyle='#f1d6ff';b.lineWidth=1;b.beginPath();b.moveTo(cx-R.dx*14,cy-R.dy*14);b.lineTo(cx,cy);b.stroke();
 b.globalAlpha=1;
 // Sparks off the tear while riding (visual only; the running game alone).
 if(view&&view.g===g&&view.parts&&g.frame%2===0)for(let i=0;i<2;i++){
  const s=((g.frame*7+i*13)%17)/17-.5,u=((g.frame*11+i*5)%13)/13-.5;
  view.parts.push({x:cx+s*6,y:cy+u*8,vx:-R.dx*40+s*30,vy:-R.dy*40+u*30,life:14,max:14,col:i?'#c47bff':'#f1d6ff',grav:0,size:1});
 }
}
function event(e,{burst,shake}){
 if(e.type==='zip-in'){burst(e.x,e.y,14,'#c47bff',70,16);burst(e.x,e.y,6,'#f1d6ff',40,12);}
 if(e.type==='zip-out'){burst(e.x,e.y,14,'#f1d6ff',90,18);shake(1,4);}
}
const sfx={
 'zip-in':(e,{tone})=>{tone(220,.18,'sawtooth',.03,520);tone(880,.12,'sine',.02,0,.03);},
 'zip-out':(e,{tone,noise})=>{tone(660,.12,'triangle',.03,-260);noise(.08,.02,1800);},
};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'zipline',draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
