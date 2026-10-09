/* Carriers are solid bronze sleds; the existing hook view draws their mounted ring and rope. */
(function(root){
'use strict';
function drawBack(b,g){b.save();b.strokeStyle='#8a7460';b.setLineDash([2,3]);for(const e of g.ents)if(e.type==='hookCarrier'){b.beginPath();b.moveTo(e.ox+e.w/2,e.oy+e.h/2);b.lineTo(e.ox+e.dx+e.w/2,e.oy+e.dy+e.h/2);b.stroke();for(const[x,y]of[[e.ox,e.oy],[e.ox+e.dx,e.oy+e.dy]])b.strokeRect(x+e.w/2-2,y+e.h/2-2,4,4);}b.restore();}
function draw(b,g){for(const e of g.ents)if(e.type==='hookCarrier'){const x=Math.round(e.x+e.remX),y=Math.round(e.y+e.remY);b.fillStyle='#645748';b.fillRect(x,y,e.w,e.h);b.fillStyle='#d2ad67';b.fillRect(x,y,e.w,2);b.fillRect(x+2,y+e.h-2,e.w-4,2);b.fillStyle='#252935';for(let k=4;k<e.w-2;k+=6)b.fillRect(x+k,y+3,2,2);b.fillStyle='#bd9861';b.fillRect(x+e.w/2-1,y+e.h,2,5);}}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'moving-hook',drawBack,draw});
})(typeof window!=='undefined'?window:globalThis);
