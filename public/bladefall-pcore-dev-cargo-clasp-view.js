/* Open brackets admit light and the knight. A filled bracket holds the ordinary lantern. */
(function(root){
'use strict';
function draw(b,g){
 const D=root.BladefallPrecisionCargoClasp;if(!D)return;
 b.save();b.lineWidth=1;
 for(const e of D.clasps(g)){
  const occupied=!!D.cargo(g,e),c=e.pulse?'#fff2bf':occupied?'#eac67f':e.open?'#7c9296':'#96caca';
  b.strokeStyle=c;b.fillStyle=c;const x=e.x,y=e.y;
  b.globalAlpha=e.open?.55:1;
  for(const [dx,dy,sx,sy] of [[-2,-2,1,1],[10,-2,-1,1],[-2,10,1,-1],[10,10,-1,-1]]){
   b.beginPath();b.moveTo(x+dx+sx*3,y+dy);b.lineTo(x+dx,y+dy);b.lineTo(x+dx,y+dy+sy*3);b.stroke();
  }
  b.save();b.translate(x+4,y-6);if(g.flipped)b.scale(1,-1);b.font='bold 5px monospace';b.textAlign='center';b.textBaseline='middle';b.fillText(e.label.slice(0,1),0,0);b.restore();
  if(!occupied&&!e.open){b.globalAlpha=.3;b.strokeRect(x+2.5,y+2.5,3,3);}
 }
 b.restore();
}
function event(e,{burst}){if(e.type==='clasp-catch')burst(e.x,e.y,5,'#ead49a',18,12);else if(e.type==='clasp-release'||e.type==='clasp-take')burst(e.x,e.y,3,'#a1d5d2',14,10);}
const sfx={
 'clasp-catch':(e,{tone})=>tone(640,.1,'triangle',.035,-160),
 'clasp-release':(e,{tone})=>tone(310,.1,'triangle',.03,110),
 'clasp-take':(e,{tone})=>tone(470,.07,'triangle',.025,90)
};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'cargo-clasp',draw,event,sfx});
})(typeof window!=='undefined'?window:globalThis);
