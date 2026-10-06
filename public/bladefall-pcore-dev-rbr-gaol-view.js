/* Precision Core — Room by Room · 7. The Warden, drawing (7.259).
   A tall warder in blued steel behind a tower shield as high as he is. His visor is turned down and away: he does
   not look at what he guards. Through the tell he sets the shield and the visor burns; in the charge he leans into
   it. Returned, he flies back with the shield thrown wide; crashed, he sits against the wall with the shield down
   and his chest bare. Wounds left are pips over his helm; the jailers' ring of ticks shows him making up his mind
   to turn. Kneeling (the end), he lays his shield flat on the floor in front of him. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const COL={steel:'#37485e',steelL:'#5a7594',steelD:'#222c3a',rim:'#aeb9c6',shield:'#8f9aaa',shieldD:'#5a6474',visor:'#ffcf6a',cape:'#7a1f2e',key:'#d6b25a'};
function warden(b,w,t){
 const x=Math.round(w.x),y=Math.round(w.y),d=w.dir,st=w.state;
 const tell=st==='tell',rush=st==='rush',back=st==='back',crash=st==='crash'||st==='kneel',daze=st==='daze';
 const lean=rush?d*2:back?-d*2:0,sit=crash?6:0;
 // cape behind him
 px(b,d>0?x-1+lean:x+w.w-3+lean,y+6+sit,4,w.h-8-sit,COL.cape);
 // legs (striding in the charge)
 const step=rush?((t>>2)&1)*2:0;
 if(crash){px(b,x+1,y+w.h-3,w.w-2,3,COL.steelD);}
 else{px(b,x+3+step,y+w.h-6,4,6,COL.steelD);px(b,x+w.w-7-step,y+w.h-6,4,6,COL.steelD);}
 // body
 px(b,x+2+lean,y+7+sit,w.w-4,w.h-12-(crash?3:0),COL.steel);px(b,x+2+lean,y+7+sit,w.w-4,1,COL.steelL);
 px(b,x+4+lean,y+10+sit,w.w-8,1,COL.rim);
 // helm, visor turned down and away from the way he faces
 const hy=y+sit;px(b,x+3+lean,hy,w.w-6,7,COL.steelL);px(b,x+3+lean,hy+6,w.w-6,1,COL.steelD);px(b,x+6+lean,hy-1,2,1,COL.rim);
 const vis=tell?((t>>1)&1?'#ffffff':COL.visor):rush?COL.visor:crash?'#4a3a2a':'#a8823e';
 px(b,d>0?x+4+lean:x+w.w-7+lean,hy+4,3,1,vis);
 // the tower shield: on the facing side, full height; thrown wide when returned; down in a crash
 if(st==='kneel'){}else if(crash){px(b,d>0?x+w.w-2:x-6,y+w.h-3,8,3,COL.shieldD);px(b,d>0?x+w.w-1:x-5,y+w.h-3,6,1,COL.shield);}
 else if(back){px(b,d>0?x+w.w+1:x-4,y+2,3,w.h-6,COL.shieldD);}
 else{const sx=d>0?x+w.w-3+lean:x-2+lean;px(b,sx,y+1,5,w.h-3,COL.shieldD);px(b,d>0?sx+1:sx,y+1,4,w.h-3,COL.shield);px(b,d>0?sx+4:sx,y+1,1,w.h-3,COL.rim);
  if(tell){b.globalAlpha=.3;px(b,sx-1,y,7,w.h-1,'#ffe6a0');b.globalAlpha=1;}}
 // stars when dazed or crashed
 if(daze||st==='crash')for(let i=0;i<3;i++){const a=t/8+i*2.1;px(b,x+w.w/2+Math.cos(a)*7,hy-3+Math.sin(a)*2,1,1,st==='crash'&&w.t>130?'#ff6a4a':'#fff1a0');}
 // the shield, laid flat in front of him
 if(st==='kneel'){px(b,d>0?x+w.w+1:x-13,y+w.h-2,12,2,COL.shieldD);px(b,d>0?x+w.w+1:x-13,y+w.h-2,12,1,COL.shield);}
 // wounds left
 if(st!=='kneel'&&w.hp>1)for(let i=0;i<w.hp;i++)px(b,x+w.w/2-w.hp*2+i*4,hy-5,3,2,i<w.hp-w.wounds?'#e05a4a':'#3a3c44');
 // making up his mind to turn
 if(w.turn>0&&w.turnT>0){const n=12,k=Math.ceil(w.turnT/w.turn*n);for(let i=0;i<n;i++){const a=-Math.PI/2+i/n*Math.PI*2;px(b,x+w.w/2+Math.cos(a)*6-0.5,hy-9+Math.sin(a)*3,1,1,i<k?'#ffcf6a':'#4a4d55');}}
}
/* Opt-in chain (7.277): winding, the key ring swings over his head and a dashed line runs along the locked aim;
   the thrown shackle is drawn over its foe bolt as a ring of iron trailing links. */
function chain(b,g,w,t){
 if(w.wind>0&&w.aim){
  const cx=w.x+w.w/2,cy=w.y+4,k=w.wind,a=t/3;
  for(let i=1;i<=4;i++)px(b,cx+Math.cos(a)*i*2.5,cy-6+Math.sin(a)*i*1.2,2,2,i===4?COL.key:'#8a8f98');
  const C=root.BladefallPrecisionCore;let L=10;while(L<300&&!(C&&C.solidAt(g,Math.round(cx+w.aim.x*L),Math.round(cy+w.aim.y*L),1,1)))L+=3;
  b.strokeStyle=k<10?'#ffe7b1':'#8a6a3a';b.lineWidth=1;b.setLineDash([2,3]);b.beginPath();b.moveTo(Math.round(cx)+.5,Math.round(cy)+.5);b.lineTo(Math.round(cx+w.aim.x*L)+.5,Math.round(cy+w.aim.y*L)+.5);b.stroke();b.setLineDash([]);
 }
 for(const o of g.bolts||[]){if(o.from!=='warden'||!o.alive)continue;
  b.strokeStyle=o.friendly?'#7ad0b8':COL.key;b.lineWidth=1;b.beginPath();b.arc(o.x+3,o.y+3,4,0,Math.PI*2);b.stroke();
  const n=Math.hypot(o.vx,o.vy)||1;for(let i=1;i<=3;i++)px(b,o.x+3-o.vx/n*i*4-1,o.y+3-o.vy/n*i*4-1,2,2,'#8a8f98');}
}
function draw(b,g){
 const w=g.warden;if(!w||w.gone)return;
 warden(b,w,g.roomFrame);
 if(w.d.chain)chain(b,g,w,g.roomFrame);
}
function event(e,{view,burst,shake}){
 switch(e.type){
  case 'warden-rush':shake&&shake(1,8);break;
  case 'warden-slam':burst(e.x,e.y,10,'#aeb9c6',60,16);shake&&shake(2,8);break;
  case 'warden-return':burst(e.x,e.y,14,'#ffe6a0',80,20);shake&&shake(2.5,8);break;
  case 'warden-crash':burst(e.x,e.y,18,'#aeb9c6',70,26,80);shake&&shake(3.5,12);break;
  case 'warden-hit':burst(e.x,e.y,20,'#e05a4a',80,26,60);shake&&shake(3,10);break;
  case 'warden-gone':burst(e.x,e.y,16,'#d6b25a',50,30);break;
  case 'warden-shove':burst(e.x,e.y,12,'#aeb9c6',90,18);shake&&shake(2.5,8);break;
  case 'warden-call':burst(e.jx,8,10,'#aeb9c6',40,24,120);shake&&shake(1.5,10);break;
  case 'jailer-land':burst(e.x,e.y,10,'#8a7a6a',50,16,120);shake&&shake(2,8);break;
  case 'jailer-fell':if(e.how==='warden'){burst(e.x,e.y,16,'#aeb9c6',90,22,120);shake&&shake(3,10);}break;
 }
}
const sfx={'warden-tell':(e,{tone})=>tone(140,.25,'square',.03,40),
 'warden-rush':(e,{noise})=>noise(.25,.05,500),
 'warden-slam':(e,{tone,noise})=>{noise(.15,.06,300);tone(90,.2,'square',.04,-30);},
 'warden-return':(e,{tone})=>tone(260,.15,'triangle',.05,200),
 'warden-crash':(e,{tone,noise})=>{noise(.3,.08,250);tone(70,.35,'square',.05,-20);},
 'warden-hit':(e,{tone})=>tone(330,.3,'triangle',.05,-160),
 'warden-gone':(e,{tone})=>tone(440,.4,'triangle',.04,220),
 'warden-wind':(e,{tone})=>tone(520,.08,'square',.015,80),'warden-throw':(e,{noise})=>noise(.12,.04,1200),
 'warden-shove':(e,{tone,noise})=>{noise(.12,.05,400);tone(120,.15,'square',.04,60);},
 'warden-call':(e,{tone})=>{tone(110,.5,'sawtooth',.05,-20);tone(165,.5,'sawtooth',.03,-30);},
 'jailer-land':(e,{noise})=>noise(.15,.06,300)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-gaol',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
