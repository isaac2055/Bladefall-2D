/* Precision Core — the shade, drawing (7.280). The shade is the knight's own shape in near-black violet with a
   pale cyan eye and a ragged edge, drawn over a faint dotted line of the next stretch of your path it will
   walk, so you can always see where it is going (it is going where you went). */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const POSES=['idle','run','rise','fall','climb','dash'];
/* The knight's outline, all in shadow: no pale helm, no orange plume; one cyan eye on the side it faces. */
function drawShade(b,x,y,f,pose,t){
 const dark='#140b1e',mid='#2c1a42',rim='#5a3a86';
 const leg=pose==='run'?(t>>3)&1:0;
 px(b,x+1,y+9,2,2,dark);px(b,x+5,y+9,2,2,dark);if(pose==='run')px(b,x+(leg?0:2),y+10,2,1,dark);
 px(b,x+1,y+4,6,5,dark);px(b,x+1,y,6,5,mid);px(b,x+1,y+4,6,1,rim);px(b,x+1,y,6,1,rim);
 px(b,x+3,y-2,2,2,mid);
 if(pose==='climb')px(b,f>0?x+7:x,y+3,1,3,mid);
 if(pose==='dash'){b.globalAlpha*=.6;px(b,f>0?x-4:x+8,y+3,4,5,mid);b.globalAlpha/=.6;}
 px(b,f>0?x+5:x+2,y+2,1,1,'#9ff6ff');
}
function draw(b,g){
 const S=root.BladefallPrecisionShade;if(!g.shade||!S)return;
 for(const e of g.ents){
  if(e.type!=='shade'||e.state!=='on')continue;
  // Its path ahead: where you were a moment ago.
  b.globalAlpha=.35;for(const [x,y] of S.ahead(g,e,30))px(b,x+3,y+5,2,2,'#7d5aa6');b.globalAlpha=1;
  const fade=Math.min(1,e.age/12);
  b.globalAlpha=.25*fade;px(b,e.x-2,e.y-2,12,15,'#2a1440');b.globalAlpha=.92*fade;
  drawShade(b,e.x,e.y,e.f,POSES[e.pose]||'idle',g.frame);
  // Ragged edge: a few dark motes peeling off.
  for(let i=0;i<3;i++){const s=(g.frame*3+i*7+e.k*5)%11;px(b,e.x+((i*3+s)%8),e.y-1-(s%4),1,1,'#3a2456');}
  b.globalAlpha=1;
 }
}
function event(e,{burst,shake}){
 if(e.type==='shade-wake'){burst(e.x,e.y,12,'#3a2456',40,20);burst(e.x,e.y,4,'#9ff6ff',30,12);}
 if(e.type==='shade-touch'){burst(e.x,e.y,16,'#3a2456',70,22);shake(2,6);}
}
const sfx={
 'shade-wake':(e,{tone})=>{tone(110,.35,'sawtooth',.03,-30);tone(165,.3,'sine',.02,-40,.05);},
 'shade-touch':(e,{noise,tone})=>{noise(.2,.04,400);tone(90,.25,'square',.03,-40);},
};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'shade',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
