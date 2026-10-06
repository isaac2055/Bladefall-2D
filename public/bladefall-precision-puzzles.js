/* Fractured puzzle proposals. Decisions alter visible geometry; all state lives
   in the current attempt and is restored by the ordinary room retry. */
(function(root){
'use strict';
const kinds=['unspent-step','borrowed-weight','second-impression','quiet-garden','return-address'];
const active=()=>typeof G!=='undefined'&&G?.stageIndex===44&&kinds.includes(G.celeste?.rooms[G.celeste.room]?.kind);
const room=()=>G.celeste.rooms[G.celeste.room];
const objects=()=>G.obstacles.filter(o=>o.ceRoom===G.celeste.room);
const state=()=>G.celeste.puzzle||(G.celeste.puzzle={recorded:[],echoOpen:false,program:0,commands:0,ballastRides:0});
function build(kind,b){
 if(!kinds.includes(kind))return false;
 const {r,x,add,plat,hazard,ring,blade,tear,roof,gravity}=b;r.noDashFlight=true;r.cameraHigh=true;r.ceiling=1450;r.puzzle=true;
 const crag=(px,y,w,h)=>Object.assign(hazard(px,y,w,h),{ceCrag:true});
 const stone=(px,y,w=70,extra={})=>plat(px,w,y,extra);
 const bell=(px,y,dx,dy)=>add({type:'ceRicochet',x:x+px,y,w:42,h:42,dx,dy});
 const fold=(px,y,phase,w=72)=>stone(px,y,w,{ceFold:true,cePhase:phase,ceFoldT:phase?0:1,gone:!!phase});
 const vine=(px,y,w=140)=>stone(px,y,w,{ceRoot:true,ceOriginX:x+px,ceOriginY:y,ceFullWidth:w,ceAnchorX:x+px-w/2,ceRootDir:1,ceRootAge:-1,ceRootLife:4.2,gone:true});
 if(kind==='unspent-step'){
  r.dashSwitch=true;
  fold(580,100,1);fold(350,220,1);fold(730,380,0);fold(1120,490,1);fold(1530,330,1);fold(1810,500,0);fold(2150,610,1);
  blade(1450,230,'pogo');bell(2490,660,.8,.6);ring(2780,730,true);
  crag(690,220,170,34);crag(995,-400,50,720);crag(1430,800,390,400);crag(1690,-400,50,745);crag(2070,900,240,460);
  add({type:'ceSwitchMotor',x:x+1190,y:840,w:40,h:40});
 }
 if(kind==='borrowed-weight'){
  r.lanternRecall=true;
  add({type:'ceSeed',x:x+255,y:42,w:14,h:14,ceOriginX:x+255,ceOriginY:42,ceCarried:false,ceVx:0,ceVy:0,ceRest:true});
  add({type:'ceSeedSocket',x:x+810,y:450,w:30,h:30,ceSocketId:0,ceLit:false,ceCloseAt:0});
  for(const [px,y,w]of [[510,80,100],[810,110,86],[1280,470,74],[810,410,72],[1480,610,74],[2010,580,74],[2530,370,70]])stone(px,y,w,{ceSeedPerch:true});
  stone(1020,70,100,{ceBallast:true,ceSocket:0,ceHomeY:70,ceHighY:340});
  crag(1140,-400,50,790);crag(1440,550,180,40);crag(1700,-400,70,1030);
  add({type:'ceSeedSocket',x:x+2230,y:820,w:30,h:30,ceSocketId:1,ceLit:false,ceCloseAt:0});
  stone(2270,290,92,{ceBallast:true,ceSocket:1,ceHomeY:290,ceHighY:610});
  crag(2380,-400,52,900);ring(2820,520,true);bell(3060,470,.8,.6);
 }
 if(kind==='second-impression'){
  const records=[[570,80],[970,140],[1390,200]];
  for(const [i,[px,y]]of records.entries()){
   stone(px,y,72,{ceEchoRecord:i});stone(px,690-i*90,62,{ceEchoCopy:i,gone:true});
   add({type:'ceMemoryBud',x:x+px,y:y+18,w:18,h:22,ceSlot:i});
  }
  stone(1800,300,82,{ceEchoSwitch:true});stone(1650,470,70);crag(1150,390,540,28);crag(2000,-400,54,1030);
  tear(450,820,2320,700,{setDown:1});stone(2310,675,84);blade(2480,585,'pogo');ring(2820,780,true);
 }
 if(kind==='quiet-garden'){
  stone(520,80,84);vine(870,170);stone(1260,290,72);vine(1580,430);stone(1960,570,68);vine(2270,480);stone(2610,330,66);
  for(const [px,y]of [[975,160],[1690,420],[2380,470]])add({type:'ceHazard',x:x+px,y,w:42,h:140,ceSleeper:true,ceWakeT:0,gone:true});
  crag(720,-400,45,500);crag(1130,455,220,500);crag(1430,-400,50,690);crag(1890,760,210,400);crag(2160,-400,50,710);
  blade(2840,225,'pogo');ring(3080,460,true);
 }
 if(kind==='return-address'){
  stone(610,90,80);
  stone(580,40,105,{ceProgramRail:true,ceHomeX:x+580,ceHomeY:40,ceX:x+580,ceY:40,ceMoving:false});
  add({type:'ceRailControl',x:x+285,y:58,w:35,h:45});
  stone(1250,360,78);stone(1590,510,72);stone(1930,670,70);stone(2330,500,68);
  add({type:'ceRailControl',x:x+1260,y:402,w:35,h:45,ceRemote:true});
  crag(950,-400,60,600);crag(1480,650,240,500);crag(1800,-400,48,810);
  gravity();add({type:'cePrism',x:x+2570,y:520,w:38,h:92,ceUp:true});roof(2450,2890,720);add({type:'cePrism',x:x+2940,y:650,w:38,h:92,ceUp:false});ring(3200,440,true);
 }
 return true;
}
function reset(){if(typeof G!=='undefined'&&G?.celeste)G.celeste.puzzle=null;if(!active())return;for(const o of objects()){if(o.ceBallast)o.y=o.ceHomeY;if(o.ceEchoCopy!==undefined)o.gone=true;if(o.ceSleeper){o.ceWakeT=0;o.gone=true;}if(o.ceProgramRail){o.x=o.ceHomeX;o.y=o.ceHomeY;o.ceX=o.x;o.ceY=o.y;o.ceMoving=false;}}}
function dash(p,l){
 if(!active())return;const s=state(),list=objects();
 for(const o of list){
  if(o.ceSleeper&&Math.hypot(p.x-o.x,p.y-o.y)<260)o.ceWakeT=1.5;
  if(o.type==='ceRailControl'&&Math.hypot(p.x-o.x,p.y+22-o.y)<115){
   const rail=list.find(q=>q.ceProgramRail),up=l.dy>.25,back=l.dx<-.25;s.program=back?0:up?2:1;s.commands++;
   const [tx,ty]=o.ceRemote?(back?[1250,530]:up?[1710,800]:[1520,390]):(back?[580,40]:up?[1000,250]:[1040,70]);rail.ceX=room().x+tx;rail.ceY=ty;rail.ceMoving=true;
  }
 }
}
function before(dt,p){
 if(!active())return;const s=state(),list=objects();
 if(p.onGround&&p.floorPlat?.ceEchoRecord!==undefined&&!s.recorded.includes(p.floorPlat.ceEchoRecord))s.recorded.push(p.floorPlat.ceEchoRecord);
 if(p.onGround&&p.floorPlat?.ceEchoSwitch)s.echoOpen=true;
 for(const o of list){
  if(o.ceEchoCopy!==undefined)o.gone=!s.echoOpen||!s.recorded.includes(o.ceEchoCopy);
  if(o.ceSleeper){o.ceWakeT=Math.max(0,o.ceWakeT-dt);o.gone=o.ceWakeT<=0||o.ceWakeT>1.32;}
  if(o.ceBallast){const lit=list.find(q=>q.type==='ceSeedSocket'&&q.ceSocketId===o.ceSocket)?.ceLit,old=o.y,target=lit?o.ceHighY:o.ceHomeY;o.y+=Math.sign(target-o.y)*Math.min(Math.abs(target-o.y),240*dt);if(p.onGround&&p.floorPlat===o){p.y+=o.y-old;s.ballastRides++;}}
  if(o.ceProgramRail){const ox=o.x,oy=o.y,dx=o.ceX-o.x,dy=o.ceY-o.y,d=Math.hypot(dx,dy),k=Math.min(1,450*dt/(d||1));o.x+=dx*k;o.y+=dy*k;o.ceMoving=d>2;if(p.onGround&&p.floorPlat===o){p.x+=o.x-ox;p.y+=o.y-oy;}}
 }
}
function draw(phase,api,o){
 if(!active())return false;const {B,WX,WY,Z,ctx:c}=api,s=state();
 if(phase==='world'){
  const list=objects();for(const q of list){
   if(q.gone&&(q.ceEchoCopy!==undefined||q.ceSleeper))draw(q.ceSleeper?'object':'plat',api,q);
   if(q.ceBallast){const socket=list.find(n=>n.type==='ceSeedSocket'&&n.ceSocketId===q.ceSocket);c.save();c.strokeStyle=socket.ceLit?'#c2d9a3':'#627052';c.lineWidth=2*Z;c.beginPath();c.moveTo(WX(socket.x),WY(socket.y));c.lineTo(WX(q.x),WY(q.ceHighY+50));c.lineTo(WX(q.x),WY(q.y));c.stroke();c.restore();}
   if(q.type==='ceRailControl'){const targets=q.ceRemote?[[1250,530],[1710,800],[1520,390]]:[[580,40],[1000,250],[1040,70]];c.save();c.strokeStyle='#415d61';c.setLineDash([3*Z,7*Z]);for(const [px,py]of targets){c.beginPath();c.moveTo(WX(q.x),WY(q.y));c.lineTo(WX(room().x+px),WY(py));c.stroke();B(WX(room().x+px)-28*Z,WY(py),56*Z,2*Z,'#58757b');}c.restore();}
  }return false;
 }
 if(phase==='plat'&&(o.ceEchoCopy!==undefined||o.ceBallast||o.ceProgramRail)){
  const x=WX(o.x),y=WY(o.y),w=o.w*Z,col=o.ceEchoCopy!==undefined?'#aa9cc9':o.ceBallast?'#c1b788':'#87aeb7';
  if(o.gone){for(let q=0;q<w;q+=12)B(x-w/2+q,y,6,2,'#5f566e');return true;}
  B(x-w/2,y,w,4*Z,col);B(x-w/2+3*Z,y+4*Z,w-6*Z,9*Z,'#45524c');
  if(o.ceBallast){const y0=WY(o.ceHighY+50);B(x-w/2-5*Z,y0,2*Z,Math.max(1,y-y0),'#a19c77');B(x+w/2+3*Z,y0,2*Z,Math.max(1,y-y0),'#a19c77');}
  if(o.ceProgramRail){c.save();c.strokeStyle='#627c81';c.setLineDash([4,5]);c.beginPath();c.moveTo(x,y);c.lineTo(WX(o.ceX),WY(o.ceY));c.stroke();c.restore();}return true;
 }
 if(phase==='object'&&o.ceSleeper){const x=WX(o.x),y=WY(o.y),tell=o.ceWakeT>1.32,height=o.gone?(tell?10+(o.h-10)*(1.5-o.ceWakeT)/.18:10):o.h,col=tell?'#cab474':o.gone?'#78855d':'#c38578';
  for(let j=0;j<5;j++){const xx=x+(j-2)*8*Z;B(xx-2*Z,y-height*Z,4*Z,height*Z,col);for(let q=12;q<height;q+=22){B(xx-6*Z,y-q*Z,12*Z,3*Z,col);B(xx+(j%2?4:-6)*Z,y-(q+5)*Z,2*Z,6*Z,col);}}return true;}
 if(phase==='object'&&o.type==='ceMemoryBud'){const x=WX(o.x),y=WY(o.y);B(x-7*Z,y-10*Z,14*Z,20*Z,s.recorded.includes(o.ceSlot)?'#cab9e7':'#655a79');B(x-2*Z,y-6*Z,4*Z,12*Z,'#e2d9f1');return true;}
 if(phase==='object'&&o.type==='ceRailControl'){const x=WX(o.x),y=WY(o.y);B(x-15*Z,y-18*Z,30*Z,40*Z,'#485c61');B(x-11*Z,y-12*Z,22*Z,22*Z,'#b6c4ba');c.save();c.font='16px monospace';c.fillStyle='#243b40';c.textAlign='center';c.fillText(s.program===2?'↗':s.program===1?'→':'←',x,y+4);c.restore();return true;}
 return false;
}
root.BladefallPrecisionPuzzles=Object.freeze({build,reset,dash,before,draw});
})(typeof window!=='undefined'?window:globalThis);
