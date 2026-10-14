(function(root){'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){const h=g.chainHydra;if(!h)return;if(h.hunt){drawHunt(b,g,h);return;}const x=h.c*8,y=h.r*8,phase=h.t%240,open=phase>=50&&phase<205;
 const hx=208,hy=h.done?174:148;rect(b,hx-14,hy,35,12,'#56858a');rect(b,hx+16,hy-3,18,10,'#7ba79a');rect(b,hx+28,hy-1,2,2,'#f2dba1');rect(b,hx-6,hy+8,14,28,'#426c76');
 if(!h.done){
 // (7.280) A dragged lock may sit nearly level with the head: the chain then runs as dots along the straight line.
 if(hy-(y+9)>=24)for(let yy=y+9;yy<hy;yy+=5)rect(b,x+3+(hx+26-x-3)*(yy-y-9)/(hy-y-9),yy,2,3,open?'#dac28c':'#80765c');
 else{const L=Math.hypot(hx+26-x-3,hy-y-4),n=Math.max(2,Math.floor(L/5));for(let i=0;i<=n;i++){const k=i/n;rect(b,x+3+(hx+26-x-3)*k,y+4+(hy-y-4)*k-1,3,2,open?'#dac28c':'#80765c');}}
 rect(b,x,y,8,9,(g.players?g.p.hydraClimb?.grace:h.grace)>0?'#ffe8a0':'#ad9160');rect(b,x+3,y,2,9,'#564839');for(let i=0;i<(h.need||2)-h.hits;i++)rect(b,x+i*5,y-4,3,2,'#fff0be');
 const HY=root.BladefallPrecisionHydra;if(h.spit&&HY){const due=HY.spitDue(h);if(due<=HY.HS.tell){const on=due<8||(due>>2)%2===0;rect(b,hx+26,hy+3,8,3,on?'#ffffff':'#bfe6d6');b.globalAlpha=.3;rect(b,hx+22,hy-2,16,12,'#d8f3e6');b.globalAlpha=1;}}
 if(phase>=20&&phase<40){b.globalAlpha=.25;rect(b,80,132,160,12,'#e8d598');b.globalAlpha=1;}if(phase>=40&&phase<50)rect(b,80,135,160,5,'#7ca8a0');}
}
// The new encounters show three distinct necks and a physical mouth, not a remote lock.
function drawHunt(b,g,h){
 const heads=h.locks||[[h.c,h.r]],active=h.hits;
 heads.forEach(([c,r],i)=>{
  if(i<active)return;
  const awake=i===active&&!h.done,ax=c*8+4,ay=r*8+4,x=awake?h.jawX:ax,y=ay,face=awake?h.face:-1;
  const skin=awake?'#458b86':'#344d59',light=awake?'#7fb7a0':'#526d72',bone='#d9d9b0';
  // Segmented neck curls out of the cliff below its matching ring/landing.
  const bx=(h.hunt.body?.[0]??g.room.cols*.55)*8,by=(h.hunt.body?.[1]??g.room.rows-2)*8,steps=Math.max(8,Math.ceil(Math.hypot(bx-x,by-y)/4));
  for(let k=0;k<=steps;k++){const t=k/steps,nx=(1-t)*(1-t)*bx+2*(1-t)*t*ax+t*t*x,ny=(1-t)*(1-t)*by+2*(1-t)*t*(ay+32)+t*t*ay;
   if(root.BladefallPrecisionCore.solidAt(g,Math.round(nx-5),Math.round(ny-3),10,7))continue;
   rect(b,nx-7,ny-4,14,9,'#172e3a');rect(b,nx-5,ny-3,10,7,skin);if(k%3===0)rect(b,nx-3,ny+1,6,3,light);
  }
  rect(b,x-13,y-10,25,17,'#152a35');rect(b,x-11,y-8,22,12,skin);rect(b,x-8,y-11,13,3,light);
  rect(b,x-face*9-2,y-15,4,7,bone);rect(b,x-face*3-2,y-14,3,5,bone);
  const open=awake&&h.mode==='open',bite=awake&&h.mode==='bite',gap=open?8:bite?6:2;
  rect(b,x+face*4-8,y-1,16,gap+2,'#15212e');
  rect(b,x+face*4-8,y+gap+1,16,4,light);
  for(let k=0;k<4;k++){rect(b,x+face*4-6+k*4,y-1,2,3,bone);if(gap>3)rect(b,x+face*4-6+k*4,y+gap-1,2,3,bone);}
  const eye=awake&&h.mode==='tell'?'#ffbc63':open?'#a8f7ed':awake?'#ffdf86':'#718b92';rect(b,x+face*5-2,y-7,3,2,eye);
  if(open){rect(b,x+face*4-4,y+2,7,3,'#ffb388');rect(b,x-2,y-21,3,7,'#a8f7ed');rect(b,x-4,y-17,7,2,'#a8f7ed');}
  if(awake&&h.mode==='tell'){
   const reach=h.hunt.stages?.[h.hits]?.reach??h.hunt.reach??40;b.globalAlpha=.35;rect(b,Math.min(ax,ax+face*reach)-9,y-6,reach+18,12,'#ffad72');b.globalAlpha=1;
   for(let k=0;k<4;k++)rect(b,ax+face*(12+k*8),y-1,3,2,'#ffdd9b');
  }
 });
 for(const e of g.ents)if(e.type==='hydra-spine'){
  rect(b,e.x,e.y,e.w,e.h,'#243d45');rect(b,e.x,e.y,e.w,2,'#cad3ad');
  for(let x=e.x+2;x<e.x+e.w;x+=8){rect(b,x,e.y+2,4,5,'#9eae94');rect(b,x+1,e.y+2,2,2,'#e5e7c8');}
 }
}
const event=(e,{burst})=>{if(['hydra-lock','hydra-free','hydra-spine'].includes(e.type))burst(e.x,e.y,15,'#e8d3a0',35,25);if(e.type==='hydra-drag'){burst(e.fx,e.fy,10,'#80765c',30,18);burst(e.x,e.y,14,'#e8d3a0',40,22);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-cliffs',draw,event});
})(typeof window!=='undefined'?window:globalThis);
