/* Precision Core — the Throne, drawing (7.254). The echo is the knight's outline in pale violet, flickering;
   a thread joins it to the knight so a trade can be read before it is made. The wake is a black shade
   with ember eyes, leaving smoke. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function figure(b,x,y,f,body,edge){px(b,x+1,y+4,6,5,body);px(b,x+1,y,6,5,edge);px(b,x+1,y+9,2,2,body);px(b,x+5,y+9,2,2,body);px(b,f>0?x+4:x+2,y+2,2,1,'#1a1a22');}
function draw(b,g){
 const t=g.frame,p=g.p;
 if(g.echo){const e=g.echo;
  if(p.state!=='dead'){b.strokeStyle='#b9a0ff44';b.setLineDash([1,3]);b.beginPath();b.moveTo(p.x+4.5,p.y+5.5);b.lineTo(e.x+4.5,e.y+5.5);b.stroke();b.setLineDash([]);}
  b.globalAlpha=.55+.2*Math.sin(t/6);figure(b,e.x,e.y,e.facing||1,'#6f5aa8','#c9b8ff');b.globalAlpha=1;}
 if(g.wake&&g.wake.shade){const s=g.wake.shade;b.globalAlpha=.85;figure(b,s.x,s.y,1,'#0b0a10','#1c1822');b.globalAlpha=1;px(b,s.x+2,s.y+2,1,1,'#ff7a3a');px(b,s.x+5,s.y+2,1,1,'#ff7a3a');}
}
function event(e,{burst}){
 if(e.type==='echo-place')burst(e.x,e.y,10,'#c9b8ff',40,20);
 else if(e.type==='echo-swap'){burst(e.x,e.y,12,'#c9b8ff',50,18);burst(e.fx,e.fy,8,'#8a70d0',30,18);}
 else if(e.type==='echo-fizzle')burst(e.x,e.y,6,'#ff8a8a',30,14);
 else if(e.type==='wake-rise')burst(e.x,e.y,14,'#2a2530',30,30,-20,2);
}
const sfx={'echo-place':(e,{tone})=>tone(660,.15,'sine',.04,-200),'echo-swap':(e,{tone})=>{tone(440,.1,'triangle',.04,440);tone(880,.12,'sine',.03,-440,.04);},
 'echo-fizzle':(e,{noise})=>noise(.1,.03,1200),'wake-rise':(e,{tone})=>tone(90,.5,'sawtooth',.03,-30),reaim:(e,{tone})=>tone(520,.12,'square',.02,-100)};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'throne',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
