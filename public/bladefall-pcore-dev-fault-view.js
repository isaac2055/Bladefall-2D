/* Precision Core — fault lines, drawing (7.280). Fault stone is dark rock split by a pale amber seam. Cracked,
   the seam widens and glows hotter as its fuse runs down, and the tile shakes in its last frames, so you can
   watch the crack run toward your feet. A fallen tile leaves a faint outline that fills in just before it
   returns. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){
 const t=g.frame;
 for(const e of g.ents){
  if(e.type!=='fault')continue;
  if(!e.solid){
   const soon=e.down<24;
   b.globalAlpha=soon?.25+.35*(1-e.down/24):.14;b.strokeStyle='#e9b86a';b.lineWidth=1;b.strokeRect(e.x+.5,e.y+.5,7,7);b.globalAlpha=1;
   if(soon&&((t>>1)&1))px(b,e.x+3,e.y+3,2,2,'#ffd79a');
   continue;
  }
  const cracking=e.fuse>=0,k=cracking?Math.max(0,1-e.fuse/24):0;
  const jx=cracking&&e.fuse<8?((t+e.c)&1?1:-1):0;
  const x=e.x+jx,y=e.y;
  px(b,x,y,8,8,'#2a2230');px(b,x,y,8,1,'#4a3c52');px(b,x,y+7,8,1,'#18131c');
  // The seam: a zig-zag through the middle; wider and hotter as the fuse runs.
  const seam=cracking?(k>.6?'#fff0c8':'#ffc066'):'#b0884e';
  px(b,x+1,y+3,2,1,seam);px(b,x+3,y+4,2,1,seam);px(b,x+5,y+3,2,1,seam);
  if(cracking){px(b,x+2,y+2,1,1,seam);px(b,x+5,y+5,1,1,seam);if(k>.5){px(b,x+3,y+1,1,2,seam);px(b,x+4,y+5,1,2,seam);}
   b.globalAlpha=.25*k;px(b,x-1,y-1,10,10,'#ffb050');b.globalAlpha=1;}
 }
}
function event(e,{burst,dust,shake}){
 if(e.type==='fault-crack'){burst(e.x,e.y,6,'#ffc066',40,12);}
 if(e.type==='fault-fall'){burst(e.x,e.y,5,'#4a3c52',40,22,220,2);burst(e.x,e.y,3,'#ffc066',30,10);}
 if(e.type==='fault-back'){burst(e.x,e.y,4,'#e9b86a',20,10);}
}
const sfx={
 'fault-crack':(e,{tone,noise})=>{noise(.12,.03,600);tone(140,.12,'square',.02,-40);},
 'fault-fall':(e,{noise})=>{noise(.06,.015,300);},
};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'fault',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
