/* Moving thorns have a smaller lethal core than their visible silhouette; their route stays visible. */
(function(root){
'use strict';
function draw(b,g){
 b.save();b.lineWidth=.65;
 for(const e of g.sweepers||[]){
  b.strokeStyle='#d28b94';b.globalAlpha=.34;b.setLineDash([1,3]);b.beginPath();e.path.forEach(([x,y],i)=>i?b.lineTo(x,y):b.moveTo(x,y));if(e.loop)b.closePath();b.stroke();b.setLineDash([]);
  b.globalAlpha=.48;for(const [x,y] of e.path){b.strokeRect(x-1.5,y-1.5,3,3);}
  b.globalAlpha=1;b.fillStyle='#753944';b.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8+g.sweeperClock*.018,r=i%2?e.radius+.3:e.radius+2,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;i?b.lineTo(x,y):b.moveTo(x,y);}b.closePath();b.fill();b.strokeStyle='#ffc0b8';b.stroke();
  b.fillStyle='#ffe7c9';b.fillRect(Math.round(e.x)-1,Math.round(e.y)-1,2,2);
  const v=Math.hypot(e.x-e.prevX,e.y-e.prevY);if(v>.01){b.strokeStyle='#ffe7c9';b.beginPath();b.moveTo(e.x,e.y);b.lineTo(e.x+(e.x-e.prevX)/v*3,e.y+(e.y-e.prevY)/v*3);b.stroke();}
 }
 b.restore();
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'sweeper',draw});
})(typeof window!=='undefined'?window:globalThis);
