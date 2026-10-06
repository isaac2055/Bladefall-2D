(function(root){'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){const s=g.sentinel;if(!s)return;const e=s.body,P=s.period||240,t=s.t%P,end=30+(s.hold??170);rect(b,s.c*8+3,0,1,s.r*8,'#796b57');rect(b,s.c*8,s.r*8,8,7,s.done?'#eeddb0':'#b79b65');rect(b,s.c*8+2,s.r*8+7,4,2,'#e1c780');
 if(e.solid){if(s.mode==='hammer'){rect(b,e.x+8,e.y,12,e.h-10,'#887a68');rect(b,e.x,e.y+e.h-12,e.w,12,'#b0a086');rect(b,e.x,e.y,e.w,3,'#d0b781');}else{rect(b,e.x,e.y+10,e.w,e.h-10,'#665d58');rect(b,e.x-2,e.y,e.w+4,10,'#b0a086');rect(b,e.x+4,e.y+13,8,8,'#bdad8c');}
  // (7.280) the last 30 frames of a stand: the top flickers, so the knight knows it is about to be taken back
  if(!s.done&&t>=end-30&&t<end&&(t>>2)%2===0)rect(b,e.x,e.y,e.w,3,'#fff1c8');}
 const land=(s.land??104)+40,to=s.to??160,from=s.from??288;
 if(!s.done&&t<30){b.globalAlpha=.3;if(s.mode==='hammer')rect(b,s.target-14,land-5,28,5,'#ebca83');else rect(b,Math.min(to,from),land-5,Math.abs(from-to)+28,5,'#ebca83');b.globalAlpha=1;}
 if(s.sweep&&!s.done&&t>=120&&t<150){b.globalAlpha=t<140?.3:1;rect(b,80,136,180,4,'#c4ab80');b.globalAlpha=1;}
}
const event=(e,{burst})=>{if(e.type==='sentinel-bell')burst(e.x,e.y,16,'#edd3a1',35,30);};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-f-outskirts',draw,event});
})(typeof window!=='undefined'?window:globalThis);
