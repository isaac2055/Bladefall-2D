(function(root){'use strict';function draw(b,g){const d=g.cargoDock;if(!d)return;const e=g.ents.find(e=>e.type==='deck');if(!e)return;const x=d.done?d.c*8+30:e.x+e.w-9,y=d.done?d.r*8:e.y;b.fillStyle='#917955';b.fillRect(x,y-9,7,9);b.fillStyle='#c3a56e';b.fillRect(x+2,y-11,3,3);b.fillStyle=d.done?'#d5dfb1':'#aa956a';b.fillRect(d.c*8-2,d.r*8,33,2);}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-path',draw});
})(typeof window!=='undefined'?window:globalThis);
