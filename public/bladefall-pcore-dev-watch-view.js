/* Precision Core — the Colony, drawing (7.254). A watch lamp is a hooded brass lantern; its cone is a pale
   wash cut off by rock. Smoke drifts in soft grey puffs. When a lamp glimpses the knight an amber mark
   appears over him and grows to red as the count runs out. */
(function(root){
'use strict';
const TILE=8;
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function coneEdge(g,l,a){const s=Math.cos(a),c=Math.sin(a),W=root.BladefallPrecisionWatch;let d=0;for(;d<l.range;d+=2){const x=l.x+s*d,y=l.y+c*d;if(W?W.blocks(g,x,y):root.BladefallPrecisionCore.tileAt(g,Math.floor(x/TILE),Math.floor(y/TILE))===1)break;}return [l.x+s*d,l.y+c*d];}
function drawBack(b,g){
 const t=g.frame,clarity=!!g.room.def.watchClarity;
 // Smoke: a thin haze over the whole patch, and soft puffs that rise through it and wrap round (clipped to
 // the patch, so its edge reads as the edge of cover). Drawn as haze, never as blocks, so it cannot be
 // mistaken for rock.
 for(const s of g.smoke||[]){
  b.save();b.beginPath();b.rect(s.x,s.y,s.w,s.h);b.clip();
  b.globalAlpha=clarity?.2:.24;b.fillStyle=clarity?'#64bdce':'#8c8c96';b.fillRect(s.x,s.y,s.w,s.h);
  for(let y=s.y-6;y<s.y+s.h+6;y+=9)for(let x=s.x;x<s.x+s.w+6;x+=10){
   const k=((x*7+y*13)%23+23)%23,rise=(t*.3+k*5)%(s.h+12),yy=s.y+s.h+6-((y-s.y+rise)%(s.h+12)),xx=x+Math.sin((t+k*17)/45)*3;
   b.globalAlpha=k%3?.1:.16;b.fillStyle=clarity?(k%2?'#a1e8df':'#69bdcc'):(k%2?'#b4b4bc':'#9a9aa4');b.beginPath();b.arc(xx,yy,4+k%4,0,Math.PI*2);b.fill();
  }
  b.restore();b.globalAlpha=1;
  if(clarity){b.save();b.globalAlpha=.42;b.strokeStyle='#9ce5db';b.lineWidth=.5;b.setLineDash([2,3]);b.strokeRect(s.x+.5,s.y+.5,s.w-1,s.h-1);b.restore();}
 }
 for(const l of g.lights||[]){
  const W=l.width*Math.PI/180,n=16;b.globalAlpha=clarity?.23:.16;b.fillStyle=clarity?'#ffb65c':'#fff2b0';b.beginPath();b.moveTo(l.x,l.y);
  for(let i=0;i<=n;i++){const [x,y]=coneEdge(g,l,l.angle-W+2*W*i/n);b.lineTo(x,y);}b.closePath();b.fill();b.globalAlpha=1;
  if(clarity){b.save();b.globalAlpha=.65;b.strokeStyle='#ffcb77';b.lineWidth=.5;b.stroke();b.restore();}
 }
}
function draw(b,g){
 for(const l of g.lights||[]){px(b,l.x-3,l.y-3,6,6,'#5a4a2a');px(b,l.x-2,l.y-2,4,4,'#ffe28a');px(b,l.x+Math.cos(l.angle)*3-1,l.y+Math.sin(l.angle)*3-1,2,2,'#ffffff');}
}
function drawFront(b,g){
 const p=g.p;
 // B52 opts into a visual cover cue. The gameplay detector remains the source of truth.
 if(g.room.def.watchClarity&&p.state!=='dead'&&p.state!=='respawn'&&root.BladefallPrecisionWatch?.hidden(g,p)){
  b.save();b.globalAlpha=.85;b.strokeStyle='#a4eee0';b.lineWidth=.6;
  b.beginPath();b.moveTo(p.x-2,p.y-1);b.lineTo(p.x-2,p.y+p.h-2);b.lineTo(p.x+p.w/2,p.y+p.h+2);b.lineTo(p.x+p.w+2,p.y+p.h-2);b.lineTo(p.x+p.w+2,p.y-1);b.stroke();b.restore();
 }
 if(!(p.seenT>0)||p.state==='dead')return;
 const k=p.seenT/6;px(b,p.x+3,p.y-7,2,4,k>.6?'#ff4a3a':'#ffb347');px(b,p.x+3,p.y-2,2,1,k>.6?'#ff4a3a':'#ffb347');
}
function event(e,{burst,shake}){if(e.type==='seen'){burst(e.x,e.y,16,'#fff2b0',60,20);shake(2,8);}}
const sfx={glimpse:(e,{tone})=>tone(880,.06,'square',.02),seen:(e,{tone})=>{tone(660,.15,'square',.04);tone(990,.2,'square',.04,0,.12);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'watch',drawBack,draw,drawFront,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
