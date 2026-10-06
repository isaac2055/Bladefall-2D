(function(root){'use strict';const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function draw(b,g){const h=g.chainHydra;if(!h)return;const x=h.c*8,y=h.r*8,phase=h.t%240,open=phase>=50&&phase<205;
 const hx=208,hy=h.done?174:148;rect(b,hx-14,hy,35,12,'#56858a');rect(b,hx+16,hy-3,18,10,'#7ba79a');rect(b,hx+28,hy-1,2,2,'#f2dba1');rect(b,hx-6,hy+8,14,28,'#426c76');
 if(!h.done){
 // (7.280) A dragged lock may sit nearly level with the head: the chain then runs as dots along the straight line.
 if(hy-(y+9)>=24)for(let yy=y+9;yy<hy;yy+=5)rect(b,x+3+(hx+26-x-3)*(yy-y-9)/(hy-y-9),yy,2,3,open?'#dac28c':'#80765c');
 else{const L=Math.hypot(hx+26-x-3,hy-y-4),n=Math.max(2,Math.floor(L/5));for(let i=0;i<=n;i++){const k=i/n;rect(b,x+3+(hx+26-x-3)*k,y+4+(hy-y-4)*k-1,3,2,open?'#dac28c':'#80765c');}}
 rect(b,x,y,8,9,h.grace>0?'#ffe8a0':'#ad9160');rect(b,x+3,y,2,9,'#564839');for(let i=0;i<(h.need||2)-h.hits;i++)rect(b,x+i*5,y-4,3,2,'#fff0be');
 const HY=root.BladefallPrecisionHydra;if(h.spit&&HY){const due=HY.spitDue(h);if(due<=HY.HS.tell){const on=due<8||(due>>2)%2===0;rect(b,hx+26,hy+3,8,3,on?'#ffffff':'#bfe6d6');b.globalAlpha=.3;rect(b,hx+22,hy-2,16,12,'#d8f3e6');b.globalAlpha=1;}}
 if(phase>=20&&phase<40){b.globalAlpha=.25;rect(b,80,132,160,12,'#e8d598');b.globalAlpha=1;}if(phase>=40&&phase<50)rect(b,80,135,160,5,'#7ca8a0');}
}
const event=(e,{burst})=>{if(['hydra-lock','hydra-free'].includes(e.type))burst(e.x,e.y,15,'#e8d3a0',35,25);if(e.type==='hydra-drag'){burst(e.fx,e.fy,10,'#80765c',30,18);burst(e.x,e.y,14,'#e8d3a0',40,22);}};
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-cliffs',draw,event});
})(typeof window!=='undefined'?window:globalThis);
