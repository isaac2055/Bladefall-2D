(function(root){'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function miner(b,x,y){rect(b,x-3,y-10,7,10,'#6e604d');rect(b,x-2,y-14,6,5,'#c6a98d');rect(b,x-3,y-16,8,3,'#d3b184');rect(b,x+2,y-16,2,2,'#fff0a1');rect(b,x-2,y-7,4,3,'#d3b184');rect(b,x-3,y,2,2,'#44392d');rect(b,x+2,y,2,2,'#44392d');}
function draw(b,g){const h=g.rescueHoist,e=g.rescueEscort;
 if(h){const x=h.cage*8,y=177-h.t/h.hold*35;rect(b,h.cradle*8-10,141,21,3,h.driven?'#e4c27c':'#897051');rect(b,x-9,112,2,69,'#6c594b');rect(b,x+9,112,2,69,'#6c594b');rect(b,h.cradle*8,113,x-h.cradle*8+10,2,'#b89a6d');rect(b,h.cradle*8,114,2,25,'#b89a6d');rect(b,x,114,1,y-114,'#b89a6d');rect(b,x-8,y,18,2,'#bf9d69');rect(b,x-8,y-20,1,20,'#9b805b');rect(b,x+9,y-20,1,20,'#9b805b');miner(b,x,y-2);}
 if(e){miner(b,e.x,e.y-2);rect(b,e.to*8-3,135,13,3,'#9a7851');rect(b,e.to*8-1,138,2,6,'#6c513a');rect(b,e.to*8+7,138,2,6,'#6c513a');rect(b,e.to*8,132,8,3,e.done?'#dce6b1':'#d3c9ac');if(e.done)rect(b,e.to*8+1,133,5,1,'#526043');}
}
const event=(e,{burst})=>{if(['miner-raised','miner-ledger'].includes(e.type))burst(e.x,e.y,10,'#e4c27c',25,20);};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-deepline',draw,event});
})(typeof window!=='undefined'?window:globalThis);
