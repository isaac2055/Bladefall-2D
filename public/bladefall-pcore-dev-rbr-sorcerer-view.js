/* Precision Core — Room by Room · 9. The Frost Sorcerer, drawing (7.259).
   A tall figure in white court robes with a pale blue hem, a crown of ice shards and a long glass staff. He stands
   on his water as if it were a floor. While the pool under him is water, his ward is a ring of pale facets around
   him that turns slowly; when it freezes the ring shatters and he staggers, robes dragging on the ice. In the tell
   a dotted line runs from his hand along the locked aim and brightens before he casts; his orbs are the foes'
   bolts with a frost halo. Off his shelf (the Last Ward) he lies on the floor in a heap of white cloth; kneeling
   at the end, his staff lies across the ice. Simulation: bladefall-pcore-dev-rbr-sorcerer.js. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function line(b,x,y,xx,yy,c,dash){b.strokeStyle=c;b.lineWidth=1;if(dash)b.setLineDash(dash);b.beginPath();b.moveTo(Math.round(x)+.5,Math.round(y)+.5);b.lineTo(Math.round(xx)+.5,Math.round(yy)+.5);b.stroke();b.setLineDash([]);}
const COL={robe:'#e8eef2',robeD:'#b9c7d2',hem:'#7fb8d8',skin:'#d9cfc4',crown:'#bfeaff',staff:'#9fd7ff',eye:'#3a6f9a',ward:'#cfefff'};
function sorcerer(b,s,t){
 const x=s.x,y=s.y,f=s.face||-1,st=s.state;
 if(st==='blink'){const k=Math.abs(s.t-18)/18;b.globalAlpha=Math.max(0,k);}
 if(st==='leave'){b.globalAlpha=Math.max(0,1-s.t/40);}
 if(st==='down'||st==='kneel'){
  // In a heap on the floor (down) or kneeling (the end).
  const kneel=st==='kneel';
  px(b,x-2,y+12,s.w+4,6,COL.robeD);px(b,x-1,y+12,s.w+2,1,COL.robe);px(b,x-2,y+17,s.w+4,1,COL.hem);
  px(b,x+(f>0?6:0),y+(kneel?6:9),5,4,COL.skin);px(b,x+(f>0?5:-1),y+(kneel?5:8),7,1,COL.crown);
  if(kneel){px(b,x+3,y+6,4,7,COL.robe);px(b,x-6,y+17,s.w+12,1,COL.staff);}
  else{for(let i=0;i<3;i++){const a=t/8+i*2.1;px(b,x+s.w/2+Math.cos(a)*7,y+6+Math.sin(a)*2,1,1,'#e8fbff');}}
  b.globalAlpha=1;return;
 }
 const sway=st==='broken'?Math.round(Math.sin(t/5)*1.5):0;
 // robe, widening to the hem on the water
 px(b,x+2+sway,y+6,6,8,COL.robe);px(b,x+1,y+12,8,5,COL.robe);px(b,x,y+16,10,2,COL.hem);px(b,x+3+sway,y+7,1,6,COL.robeD);
 // head, eye toward the knight, crown of shards
 px(b,x+3+sway,y+1,4,5,COL.skin);px(b,(f>0?x+5:x+3)+sway,y+3,1,1,COL.eye);
 px(b,x+2+sway,y,6,1,COL.crown);px(b,x+3+sway,y-2,1,2,COL.crown);px(b,x+5+sway,y-3,1,3,COL.crown);px(b,x+7+sway,y-2,1,2,COL.crown);
 // the staff, held on the far side
 const sx=f>0?x-1:x+10;px(b,sx,y-2,1,19,COL.staff);px(b,sx-1,y-3,3,2,'#ffffff');
 // hand raised in the tell
 if(st==='tell'&&s.aim){const hx=x+5+(s.aim.x<0?-4:4),hy=y+6;px(b,hx-1,hy-1,3,3,(t>>1)&1?'#ffffff':COL.ward);}
 // the ward: a ring of facets while his water holds
 if(s.warded&&st!=='broken'){
  const cx=x+s.w/2,cy=y+9,n=10;b.globalAlpha=(b.globalAlpha||1)*.8;
  for(let i=0;i<n;i++){const a=t/40+i/n*Math.PI*2;px(b,cx+Math.cos(a)*10-1,cy+Math.sin(a)*12-1,2,2,i%2?COL.ward:'#8fc8e8');}
  b.globalAlpha=st==='blink'?b.globalAlpha:1;
 }
 // wounds left, as shards over the crown
 if(s.need>1)for(let i=0;i<s.need;i++)px(b,x+s.w/2-s.need*2+i*4,y-7,2,2,i<s.need-s.hits?'#bfeaff':'#4a5a66');
 b.globalAlpha=1;
}
/* Opt-in icicles (7.277): growing on the roof through his tell (shivering as they come loose), with a pale mark on
   the ground under each; falling; and stuck in stone as ice stakes that fade as they melt. */
function icicles(b,g){
 const t=g.frame,C=root.BladefallPrecisionCore;
 for(const c of g.icicles||[]){
  const x=Math.round(c.x),y=Math.round(c.y);
  if(c.state==='form'){
   const s=g.sorc,k=s&&s.state==='tell'?Math.min(1,s.t/(s.tell*.7)):1,len=Math.max(2,Math.round(c.h*k)),sh=k>=1&&(t>>1)&1?1:0;
   px(b,x+1+sh,y,4,Math.ceil(len*.5),'#cfefff');px(b,x+2+sh,y,2,len,'#e8fbff');px(b,x+2+sh,y+len-1,1,1,'#ffffff');
   // where it will land: a pale mark on the first stone under it
   let gy=y+c.h;while(gy<g.room.h&&!(C&&C.solidAt(g,x+1,gy,4,1)))gy++;
   b.globalAlpha=.35+.25*((t>>2)&1);px(b,x-1,gy-1,8,1,'#cfefff');b.globalAlpha=1;
  }else if(c.state==='fall'){
   px(b,x+1,y,4,5,'#cfefff');px(b,x+2,y,2,c.h,'#e8fbff');px(b,x+2,y+c.h-1,2,1,'#ffffff');
   b.globalAlpha=.3;px(b,x+2,y-6,2,6,'#cfefff');b.globalAlpha=1;
  }else if(c.state==='stake'){
   const life=c.life/((g.sorc&&g.sorc.d.icicles&&g.sorc.d.icicles.stake)||150);
   b.globalAlpha=.55+.45*Math.min(1,life*1.5);
   px(b,x,y+2,c.w,c.h-2,'#9fd2ea');px(b,x+1,y,c.w-2,3,'#cfefff');px(b,x+1,y+2,1,c.h-3,'#e8fbff');px(b,x,y+c.h-1,c.w,1,'#6aa8c8');
   if(life<.3&&(t>>2)&1)px(b,x+2,y+c.h,2,1,'#cfefff');   // dripping as it goes
   b.globalAlpha=1;
  }
 }
}
function draw(b,g){
 const s=g.sorc;if(!s)return;
 // the locked aim, until stone stops it (as the orb will)
 icicles(b,g);
 if(!s.gone&&s.state==='tell'&&s.aim&&s.mode!=='ice'){
  const k=s.tell-s.t,hx=s.x+s.w/2+(s.aim.x<0?-4:4),hy=s.y+6;
  const C=root.BladefallPrecisionCore;let L=8;while(L<360&&!(C&&C.solidAt(g,Math.round(hx+s.aim.x*L),Math.round(hy+s.aim.y*L),1,1)))L+=3;
  line(b,hx,hy,hx+s.aim.x*L,hy+s.aim.y*L,k<12?'#e8fbff':'#5f8fb0',[1,3]);
 }
 if(!s.gone)sorcerer(b,s,g.frame);
 // his orbs: a frost halo around the foes' bolt
 for(const o of g.bolts||[]){if(!o.frost||!o.alive)continue;b.globalAlpha=.5;b.strokeStyle=o.friendly?'#7fe0c0':'#cfefff';b.beginPath();b.arc(o.x+3,o.y+3,5,0,Math.PI*2);b.stroke();b.globalAlpha=1;px(b,o.x+2,o.y+2,2,2,'#ffffff');}
}
function event(e,{burst,shake}){
 switch(e.type){
  case 'sorc-frost':burst(e.x,e.y,14,'#e8fbff',60,18);shake&&shake(1.5,6);break;
  case 'sorc-break':burst(e.x,e.y,18,'#cfefff',80,22);shake&&shake(2,8);break;
  case 'sorc-ward':burst(e.x,e.y,8,'#8fc8e8',40,14);break;
  case 'sorc-down':burst(e.x,e.y,12,'#e8eef2',60,16);shake&&shake(2.5,8);break;
  case 'sorc-hit':burst(e.x,e.y,20,'#9fd7ff',90,26);shake&&shake(3,10);break;
  case 'sorc-blink':burst(e.x,e.y,12,'#ffffff',70,20);break;
  case 'sorc-gone':burst(e.x,e.y,22,'#e8fbff',70,30);break;
  case 'icicle-break':burst(e.x,e.y,8,'#e8fbff',60,14);break;
  case 'icicle-stake':burst(e.x,e.y,6,'#cfefff',40,12);shake&&shake(1,4);break;
  case 'icicle-melt':burst(e.x,e.y,5,'#9fd2ea',20,14);break;
 }
}
const sfx={'sorc-tell':(e,{tone})=>tone(1040,.08,'triangle',.015,-200),
 'sorc-frost':(e,{tone,noise})=>{noise(.12,.04,2400);tone(1320,.2,'triangle',.03,-600);},
 'sorc-break':(e,{tone,noise})=>{noise(.25,.06,1800);tone(660,.3,'triangle',.04,-300);},
 'sorc-ward':(e,{tone})=>tone(880,.15,'sine',.02,200),
 'sorc-hit':(e,{tone})=>tone(330,.3,'triangle',.05,-160),
 'sorc-blink':(e,{tone})=>tone(990,.12,'sine',.03,400),
 'sorc-gone':(e,{tone})=>{tone(523,.3,'triangle',.03);tone(392,.5,'triangle',.03);},
 'sorc-icicles':(e,{tone})=>tone(1560,.1,'triangle',.02,-500),
 'icicle-break':(e,{noise})=>noise(.08,.04,3000),'icicle-stake':(e,{tone})=>tone(1180,.08,'square',.015,-300)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-sorcerer',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
