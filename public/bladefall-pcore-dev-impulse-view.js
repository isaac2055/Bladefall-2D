/* Broad leaf silhouette and a gold four-petal core: an interactable seed, never a thorn. */
(function(root){'use strict';
function draw(b,g){const D=root.BladefallPrecisionImpulse;if(!D)return;b.save();b.lineWidth=1;
 for(const e of D.seeds(g)){
  const x=Math.round(e.x+4),y=Math.round(e.y+4),hot=e.state==='charged',wind=e.state==='windup',cool=e.state==='cooldown';
  const color=cool?'#706c86':hot?'#fff3a2':wind?'#eeb562':'#8fd7bd';
  b.fillStyle=cool?'#383044':'#253b36';b.strokeStyle=color;
  b.beginPath();b.moveTo(x,y-6);b.quadraticCurveTo(x+8,y-6,x+5,y);b.quadraticCurveTo(x+8,y+6,x,y+6);b.quadraticCurveTo(x-8,y+6,x-5,y);b.quadraticCurveTo(x-8,y-6,x,y-6);b.fill();b.stroke();
  if(hot){b.globalAlpha=.35+.2*Math.sin(g.frame/6);b.strokeRect(x-8.5,y-8.5,17,17);b.globalAlpha=1;}
  b.fillStyle=color;b.fillRect(x-2,y-2,4,4);
  if(wind){const k=1-e.timer/D.IK.windup;b.fillStyle='#eeb562';b.fillRect(x-6,y+9,Math.ceil(12*k),2);
   const n=Math.hypot(e.vx,e.vy)||1;b.strokeStyle=color;b.beginPath();b.moveTo(x,y);b.lineTo(x+e.vx/n*11,y+e.vy/n*11);b.stroke();
  }else if(hot){b.fillStyle='#fff3a2';b.fillRect(x-6,y+10,Math.ceil(12*e.timer/D.IK.charged),1);}
  if(e.pulse){b.strokeStyle='#fffbd8';b.strokeRect(x-7-e.pulse/3,y-7-e.pulse/3,14+e.pulse*2/3,14+e.pulse*2/3);}
 }
 b.restore();}
function event(e,{burst}){if(e.type==='impulse-prime')burst(e.x,e.y,4,'#8fd7bd',18,9);if(e.type==='impulse-ready')burst(e.x,e.y,6,'#fff3a2',20,12);if(e.type==='impulse-burst')burst(e.x,e.y,15,'#fff3a2',80,20);}
const sfx={'impulse-prime':(e,{tone})=>tone(290,.12,'triangle',.04,190),'impulse-ready':(e,{tone})=>tone(650,.16,'sine',.035,160),'impulse-burst':(e,{tone,noise})=>{tone(180,.18,'triangle',.06,-70);noise(.08,.03,2000);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'impulse',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
