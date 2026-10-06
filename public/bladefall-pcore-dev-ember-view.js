/* Precision Core — Emberdeep, drawing (7.254). Stone slabs are dark basalt; molten slabs glow and churn;
   glass slabs are amber and see-through with a bright top edge (a floor from above only). A row of pips
   on every slab counts down, one pip per quarter second, to its next change, and the pip colour is the
   state that comes next. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const NEXT={stone:'molten',molten:'glass',glass:'stone'},PIP={stone:'#9a8f86',molten:'#ff7a2a',glass:'#ffd27a'};
function draw(b,g){
 if(!g.slabs)return;
 const t=g.frame;
 for(const e of g.slabs){
  const {x,y,w,h}=e;
  if(e.state==='stone'){px(b,x,y,w,h,e.pending&&(t>>2)&1?'#5a4a44':'#3b3432');px(b,x,y,w,1,'#7d716a');for(let i=0;i<w;i+=6)px(b,x+i+2,y+3+(i%4),2,1,'#2a2422');}
  else if(e.state==='molten'){
   px(b,x,y,w,h,'#c2410c');
   for(let i=0;i<w;i+=2){const k=Math.sin((t+i*3+x)/7)*1.5;px(b,x+i,y+2+k,2,2,'#ffb347');}
   b.globalAlpha=.25;px(b,x-2,y-2,w+4,h+4,'#ff7a2a');b.globalAlpha=1;
  }else{b.globalAlpha=.4;px(b,x,y,w,h,'#e0a040');b.globalAlpha=1;px(b,x,y,w,2,'#ffe2a0');for(let i=3;i<w;i+=7)px(b,x+i,y+3,1,h-4>0?h-4:1,'#fff0c0');}
  // countdown pips to the next change
  // (7.254.x) a narrow, tall slab (a door) stacks its pips up its middle instead of spilling past its edge
  const tall=h>w&&w<25,room=Math.floor(((tall?h:w)-1)/3),n=Math.min(8,room,Math.ceil((e.left||0)/15));
  for(let i=0;i<n;i++)if(tall)px(b,x+Math.floor(w/2)-1,y+h-3-i*3,2,2,PIP[NEXT[e.state]]);else px(b,x+1+i*3,y+h-3,2,2,PIP[NEXT[e.state]]);
 }
}
function event(e,{burst,shake}){
 if(e.type==='slab-molten'){burst(e.x,e.y,10,'#ff9a3a',40,22,-20);}
 else if(e.type==='slab-stone'){burst(e.x,e.y,6,'#7d716a',30,14,60);}
}
const sfx={'slab-molten':(e,{noise})=>noise(.15,.02,500),'slab-stone':(e,{tone})=>tone(140,.1,'square',.02)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'ember',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
