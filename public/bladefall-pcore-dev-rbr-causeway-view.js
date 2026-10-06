/* Precision Core — Room by Room · Broken Causeway, drawing (7.259): the Brute.
   Drawn over the Combat view's hound (device views draw after it), on the Brute's own 24×16 body:
   iron plates and rivets, a low helm with one eye slit. The slit is dim asleep, burns through the tell,
   and the whole body leans into a charge. Dazed (after it slams into something) it sags and the slit gutters. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function brute(b,e,t){
 // Heaved out from under a weight: drawn sliding the last few pixels of the way (e.shove, e.shoveT: the device).
 const sh=e.shoveT>0?-e.shove*e.shoveT/12:0;
 const rear=e.stampT>0?-Math.round((10-e.stampT)/3):0;   // rearing up for a stamp
 const x=Math.round(e.x+sh),y=Math.round(e.y)+rear,f=e.face>0?1:-1;
 const tell=e.state==='tell',charge=e.state==='attack',dazed=e.state==='recover'||e.stun>0;
 const lean=charge?f*2:0,sag=dazed?1:0;
 // Legs: two stumps, striding while it charges.
 const step=charge?((t>>2)&1)*2:0;
 px(b,x+4+step,y+12,5,4,'#2c2724');px(b,x+15-step,y+12,5,4,'#2c2724');
 // Body: an iron hulk over the old hound frame.
 px(b,x+1+lean,y+3+sag,22,10,'#3b3532');
 px(b,x+2+lean,y+4+sag,20,8,'#5a514b');
 for(let i=0;i<4;i++)px(b,x+3+lean+i*5,y+5+sag,4,6,i%2?'#6c625a':'#62584f');
 px(b,x+1+lean,y+3+sag,22,1,'#8a7d70');
 for(let i=0;i<5;i++)px(b,x+3+lean+i*4,y+12+sag,1,1,'#c8a878');      // rivets along the hem
 // A hump of plate over the shoulders, and the broken chain still shackled to it, trailing up and back.
 px(b,x+3+lean,y+sag,18,4,'#4a433e');px(b,x+4+lean,y+sag,16,1,'#8a7d70');
 for(let i=0;i<4;i++)px(b,x+2-i*2,y+1-i,2,2,i%2?'#9a8e7c':'#7a7068');
 // Helm on the facing side, with the eye slit.
 const hx=f>0?x+17+lean:x+lean;
 px(b,hx,y+1+sag,7,8,'#2e2a28');px(b,hx+1,y+2+sag,5,6,'#4d4540');
 const lit=tell?(t%6<3?'#ffd28a':'#ff9a4a'):charge?'#ffb35a':dazed?((t>>3)&1?'#6a3a24':'#3a2418'):'#7a4a2a';
 px(b,f>0?hx+3:hx+1,y+4+sag,3,1,lit);
 if(tell){b.globalAlpha=.25;px(b,f>0?hx+2:hx,y+3+sag,5,3,'#ffb35a');b.globalAlpha=1;}
 // Dust off the heels in a charge; little stars when dazed.
 if(charge&&t%3===0){b.globalAlpha=.5;px(b,f>0?x-2:x+24,y+14,2,2,'#8a7a6a');b.globalAlpha=1;}
 if(dazed)for(let i=0;i<3;i++){const a=t/9+i*2.1;px(b,x+12+Math.cos(a)*8,y-4+Math.sin(a)*2,1,1,'#ffe6a0');}
 // Cracked armour (crush:n): seams of furnace light through the plates, one per crush taken; enraged, they pulse.
 if(e.cracks>0){
  const glow=(t>>2)&1?'#ffb35a':'#ff7a2a';
  const seams=[[6,3,1,1],[7,4,1,2],[6,6,1,1],[5,7,1,2],[6,9,1,1]];
  for(let k=0;k<e.cracks;k++){const ox=k?13:0;for(const [sx,sy,w,h]of seams)px(b,x+ox+sx+lean+(k?-(sx-6)*2:0),y+sy+sag,w,h,glow);}
  b.globalAlpha=.18;px(b,x+1+lean,y+3+sag,22,10,'#ff7a2a');b.globalAlpha=1;
 }
}
/* The stamp's shockwave: a low ripple of broken floor running along the ground. */
function wave(b,w,t){
 const x=Math.round(w.x),y=w.y;
 px(b,x-1,y-6,6,6,'rgba(255,170,90,.18)');
 const lift=[2,4,6,4,2];
 for(let i=0;i<5;i++)px(b,x-w.dir*i*2+(w.dir>0?2:0),y-lift[i],2,lift[i],i===2?'#ffd28a':'#9a8466');
 if(t%2===0)px(b,x-w.dir*10,y-2,2,2,'#7a6a58');
}
function draw(b,g){
 for(const e of g.combat?.enemies||[])if(e.brute&&!e.dead)brute(b,e,g.frame);
 for(const w of g.bruteWaves||[])wave(b,w,g.frame);
}
function event(e,{view,shake}){
 if(e.type==='guard-block'&&e.brute){shake&&shake(1.5,6);for(let i=0;i<5;i++)view.parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*60,vy:-Math.random()*40,life:14,max:14,col:'#ffe6a0',grav:200,size:1});}
 if(e.type==='brute-crack'){shake&&shake(4,14);for(let i=0;i<16;i++)view.parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*140,vy:-Math.random()*110,life:26,max:26,col:i%3?'#6c625a':'#ffb35a',grav:260,size:i%4?1:2});}
 if(e.type==='brute-stamp'){shake&&shake(2.5,10);for(let i=0;i<10;i++)view.parts.push({x:e.x+(Math.random()-.5)*20,y:e.y-1,vx:(Math.random()-.5)*50,vy:-Math.random()*70,life:18,max:18,col:'#9a8466',grav:240,size:1});}
}
const sfx={'guard-block':(e,{tone})=>{if(e.brute)tone(110,.12,'square',.04,90);},
 'brute-crack':(e,{tone})=>{tone(70,.3,'sawtooth',.06,40);tone(150,.12,'square',.04,60);},
 'brute-rear':(e,{tone})=>{tone(90,.1,'triangle',.03,120);},
 'brute-stamp':(e,{tone})=>{tone(55,.28,'sawtooth',.07,35);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-causeway',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
