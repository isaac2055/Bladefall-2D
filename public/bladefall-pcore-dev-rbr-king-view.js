(function(root){
'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){const c=g.crown,h=g.hand,a=g.alarm;
 if(c){c.marks.forEach((m,i)=>{rect(b,m.c*8-2,m.r*8+5,12,3,c.done?'#b3e5d0':c.lit[i]?'#ffe4a0':'#796381');for(let k=0;k<3;k++)rect(b,m.c*8+k*3,m.r*8+2,2,3,c.lit[i]?'#ffe4a0':'#aa87b8');});
  if(c.king){const x=272,y=96;rect(b,x-4,y-10,28,48,'#37283d');rect(b,x,y,20,8,'#877089');rect(b,x+3,y-18,14,18,c.done?'#696371':'#a69bad');rect(b,x+5,y-11,3,2,'#171421');rect(b,x+11,y-11,3,2,'#171421');rect(b,x,y-22,20,4,c.done?'#786550':'#d9bd72');for(let k=0;k<3;k++)rect(b,x+1+k*7,y-26,3,4,'#d9bd72');rect(b,x+5,y+12,4,25,'#7d668c');rect(b,x+12,y+12,4,25,'#7d668c');
   if(!c.done)for(let i=0;i<(c.hold||1);i+=5)rect(b,x-5+i/5*3,y-32,2,2,i<c.t?'#ffe4a0':'#514158');
   // (7.280) His eyes burn before he throws; the seals still to come are pips over the crown.
   const K=root.BladefallPrecisionKing;if(c.bolts&&!c.done&&K){const due=K.kingDue(c);if(due<=K.KB.tell){const on=due<8||(due>>2)%2===0;rect(b,x+4,y-12,5,3,on?'#ffffff':'#ffb38a');rect(b,x+11,y-12,5,3,on?'#ffffff':'#ffb38a');b.globalAlpha=.3;rect(b,x+1,y-16,18,10,'#ffd0a8');b.globalAlpha=1;}}
   if(c.phases)for(let i=0;i<=c.phases.length;i++)rect(b,x+2+i*6,y-38,4,3,c.done||i<c.phase?'#b3e5d0':i===c.phase?'#ffe4a0':'#514158');}
  // The next pair, faint: where the crown will turn.
  if(c.phases&&!c.done&&c.phase<c.phases.length){b.globalAlpha=.35;for(const m of c.phases[c.phase]){rect(b,m.c*8-2,m.r*8+5,12,3,'#9a87a6');for(let k=0;k<3;k++)rect(b,m.c*8+k*3,m.r*8+3,2,2,'#9a87a6');}b.globalAlpha=1;}
 }
 if(h&&h.fade<60){b.globalAlpha=h.gone?1-h.fade/60:1;
  rect(b,h.x,h.y+7,14,15,'#46324f');rect(b,h.x+2,h.y,10,8,'#afa4bd');rect(b,h.x+2,h.y+3,10,2,(root.BladefallPrecisionKing?root.BladefallPrecisionKing.handOpen(h):h.t<30||h.t>=60&&h.t<90)?'#fff0ad':'#302539');rect(b,h.x,h.y-3,14,3,'#bda16c');
  for(let i=0;i<(h.need||3)-h.hits;i++)rect(b,h.x+i*5,h.y-7,3,2,'#d4c3eb');b.globalAlpha=1;
  if(!h.gone&&h.t>=30&&h.t<60){const q=h.places[(h.i+1)%h.places.length];rect(b,q.c*8-3,(q.r+1)*8-2,20,2,'#dfc2ff');b.globalAlpha=.4;rect(b,q.c*8,(q.r+1)*8-22,14,20,'#c1a4dd');b.globalAlpha=1;}
 }
 if(a){for(const q of a.bells){const x=q.c*8,y=q.r*8;rect(b,x+3,y-2,2,3,'#8d7650');rect(b,x+(q.note==='long'?0:2),y+1,q.note==='long'?8:4,7,a.flash?'#ffe7a5':'#c1a267');rect(b,x+3,y+8,2,2,'#6f593d');}
  a.pattern.forEach((n,i)=>rect(b,140+i*9,22,n==='long'?7:3,3,i<a.at?'#c1e8d2':'#77615b'));}
}
const event=(e,{burst})=>{if(['crown-seal','all-clear','hand-spent'].includes(e.type))burst(e.x,e.y,16,'#d8c4ea',45,28);if(e.type==='crown-turn')burst(e.x,e.y,12,'#ffe4a0',40,22);};
const sfx={'alarm-note':(e,{tone})=>tone(e.note==='long'?330:660,e.note==='long'?.5:.15,'sine',.05), 'crown-seal':(e,{tone})=>tone(220,.7,'sine',.05,440)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-king',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
