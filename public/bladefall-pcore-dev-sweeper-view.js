/* Thorns have a smaller lethal core than their visible silhouette. Routes and endpoints are intentionally hidden. */
(function(root){
'use strict';
function draw(b,g){
 b.save();b.lineWidth=.65;
 for(const e of g.sweepers||[]){
  b.globalAlpha=1;b.fillStyle='#753944';b.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8+g.sweeperClock*.018,r=i%2?e.radius+.3:e.radius+2,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;i?b.lineTo(x,y):b.moveTo(x,y);}b.closePath();b.fill();b.strokeStyle='#ffc0b8';b.stroke();
  b.fillStyle='#ffe7c9';b.fillRect(Math.round(e.x)-1,Math.round(e.y)-1,2,2);
 }
 b.restore();
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'sweeper',draw});
})(typeof window!=='undefined'?window:globalThis);
