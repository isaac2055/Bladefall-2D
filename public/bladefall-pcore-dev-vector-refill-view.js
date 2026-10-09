/* Directional crystals: mint gems with a dark, literal direction arrow. Spent gems retain the outline. */
(function(root){
'use strict';
function arrow(b,e,x,y,col){
 // Integer pixels keep the arrow distinct at the native 320px playfield resolution.
 const up=['0001000','0011100','0101010','1001001','0001000','0001000','0001000'];b.fillStyle=col;
 for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(up[r][c]==='1'){
  const u=c-3,v=r-3,dx=-e.dy*u-e.dx*v,dy=e.dx*u-e.dy*v;
  b.fillRect(Math.round(x+dx),Math.round(y+dy),1,1);
 }
}
function draw(b,g){
 b.save();
 for(const e of g.ents){
  if(e.type!=='vectorRefill')continue;
  const spent=e.spent||e.timer>0,bob=spent?0:Math.round(Math.sin(g.frame/14+e.x)),x=e.x+4,y=e.y+4+bob;
  b.beginPath();b.moveTo(x,y-6);b.lineTo(x+6,y);b.lineTo(x,y+6);b.lineTo(x-6,y);b.closePath();
  b.lineWidth=1;b.strokeStyle=spent?'#456f62':'#d5fff0';
  if(!spent){b.fillStyle='#8ff0c5';b.fill();}b.stroke();
  arrow(b,e,x,y,spent?'#456f62':'#17392f');
  // Three approach dots form a short tail behind the arrow, reinforcing that it marks movement direction.
  if(!spent){b.fillStyle='#8ff0c5';for(let i=0;i<3;i++){b.globalAlpha=.55-i*.15;const d=8+i*3;b.fillRect(Math.round(x-e.dx*d),Math.round(y-e.dy*d),1,1);}b.globalAlpha=1;}
  if(e.once){b.fillStyle=spent?'#456f62':'#fff0b0';b.fillRect(x+5,y+5,2,2);}
 }
 b.restore();
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'vector-refill',draw});
})(typeof window!=='undefined'?window:globalThis);
