/* Authored spaces and outcome performances for the first two optional stories. */
(function(root){
'use strict';
const active=()=>typeof G!=='undefined'&&G&&G.stageIndex<2;
function layout(q){return q.id==='gatekeeper'?{x:250,y:0,dir:1}:q.id==='refuge'?{x:700,y:0,dir:1}:null;}
function install(q,scene){
 if(!active())return;
 const id=q.id,add=o=>G.obstacles.push({sideStory:id,...o});
 // These replace only our old generic side-story staircase, never authored campaign platforms.
 G.obstacles=G.obstacles.filter(o=>o.sideStory!==id||!['step','task'].includes(o.sideStoryRole));
 const positions=id==='gatekeeper'?[[1050,0],[1370,282],[360,0]]:[[1650,168],[1900,280],[780,0],[850,0]];
 // Rowan's bell tower (7.231, owner: "a lot of platform clutter at the start"): one compact
 // zig-zag scaffold hugging the tower, starting from the creek hop at 1220/58 that the road
 // already has, instead of five loose ledges strung 520 units across the verge.
 if(id==='gatekeeper'){
  for(const [x,y,w]of [[1300,114,110],[1190,170,100],[1300,226,110],[1370,282,110]])add({type:'plat',sideStoryRole:'step',x,y,w,h:12,openingLedge:true});
  add({type:'sideStoryProp',sideStoryRole:'routeBackdrop',scaffold:true,x:1300,y:0,w:360,h:300});
 }else{
  const steps=[[1260,56],[1390,112],[1520,168],[1650,168],[1770,224],[1900,280]];
  for(const [x,y]of steps){add({type:'plat',sideStoryRole:'step',x,y,w:116,h:12,openingLedge:true});add({type:'sideStoryProp',sideStoryRole:'routeBackdrop',x,y,w:150,h:y+60});}
 }
 q.tasks.forEach((task,i)=>add({type:'sideStoryProp',sideStoryRole:'task',task:task.id,index:i,x:positions[i][0],y:positions[i][1],w:36,h:42,title:task.label,accent:q.accent}));
 if(id==='gatekeeper')add({...Crate(960,0),sideStoryRole:'ballast',openingBallast:true});
 if(id==='gatekeeper')add({type:'sideStoryProp',sideStoryRole:'tower',x:1370,y:0,w:200,h:350});
 add({type:'sideStoryProp',sideStoryRole:'carried',x:scene.base.x,y:0,w:32,h:35,gone:true});
 const scenery=G.obstacles.filter(o=>o.sideStory===id&&['scene','tower','routeBackdrop'].includes(o.sideStoryRole));
 G.obstacles=[...scenery,...G.obstacles.filter(o=>!scenery.includes(o))];
 const saved=BladefallSideStories.row(BladefallSideStoryWorld.state(),id);
 scene.performance={phase:saved.phase,step:saved.step,t:20,actionT:20,clock:0,fromX:scene.base.x};
 for(const o of G.obstacles.filter(o=>o.sideStory===id&&o.sideStoryRole==='scene')){o.x=id==='gatekeeper'?300:790;o.y=0;}
 for(const o of G.obstacles.filter(o=>o.sideStory===id&&o.sideStoryRole==='reward')){o.x=id==='gatekeeper'?330:890;o.y=0;}

}
function requirement(o,r){
 if(!active())return null;
 if(o.task==='ballast'){
  const crate=G.obstacles.find(p=>p.openingBallast);
  if(!crate||Math.abs(crate.x-o.x)>30||Math.abs(crate.y-o.y)>12)return 'Push the stone-filled cart onto the iron stop below this handle. Its weight will hold the bell while you climb.';
 }
 if(o.task==='bell'&&r.step<1)return 'Secure the cart at the brake handle first. The bell is too heavy to lower with the rope loose.';
 return null;
}
function update(dt,r){
 if(!active()||!G.sideStoryScene)return;
 const scene=G.sideStoryScene,a=scene.performance;if(!a)return;
 a.t+=dt;a.actionT+=dt;a.clock+=dt;
 for(const n of G.npcs||[]){if(!['mara','bram'].includes(n.profileId))continue;if(n._openingDone!==!!n.done){n._openingDone=!!n.done;n._openingDoneT=0;}else n._openingDoneT=(n._openingDoneT||0)+dt;}
 if(a.phase!==r.phase){a.phase=r.phase;a.t=0;a.fromX=G.obstacles.find(o=>o.sideStoryRole==='actor')?.x||scene.base.x;}
 if(a.step!==r.step){a.step=r.step;a.actionT=0;}
 const actor=G.obstacles.find(o=>o.sideStory===scene.id&&o.sideStoryRole==='actor');
 if(actor&&r.phase==='completed'&&scene.id==='gatekeeper'){
  const fraction=Math.min(1,a.t/3.2);actor.x=scene.base.x+75*fraction;actor.openingWalking=fraction<1;
 }
 if(actor&&r.phase==='harsh'&&scene.id==='gatekeeper'){actor.x=scene.base.x-25*Math.min(1,a.t/2);actor.openingWalking=a.t<2;}
 for(const shop of G.obstacles.filter(o=>o.shopId==='ethereal-goods')){const gifted=journeyState().claimed.includes('workshop:ethereal-goods');if(shop._openingGifted!==gifted){shop._openingGiftT=shop._openingGifted===undefined?20:0;shop._openingGifted=gifted;}else shop._openingGiftT=(shop._openingGiftT||0)+dt;}
 const carried=G.obstacles.find(o=>o.sideStory===scene.id&&o.sideStoryRole==='carried');
 if(carried){carried.x=G.p.x-18*(G.p.face||1);carried.y=G.p.y+12;carried.gone=!(scene.id==='refuge'?((r.step===2&&a.actionT>=1.5)||r.step===3):(r.step===2&&a.actionT>=2.4));}
 const crate=G.obstacles.find(o=>o.openingBallast);
 if(crate&&r.step>0){crate.x=1050;crate.y=0;crate.vx=crate.vy=0;}
}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
function person(c,x,y,kind,t,seated=false){
 c.save();c.translate(x,y);
 const p={assessor:['#4f7371','#bf8f70','#c4c1ad'],gatekeeper:['#65786b','#cbb38b','#737c87'],refuge:['#8d5150','#b37d58','#d9d3b9'],mara:['#617d95','#d8aa80','#493d3d'],vey:['#826479','#ad795e','#bab2a5'],olan:['#7d7956','#d8b18a','#56534c'],orra:['#536f88','#ac765d','#d7cec0'],pell:['#8b6645','#d3a279','#3e3931'],hale:['#686c77','#c28a69','#aca999'],bram:['#81936a','#e0b48c','#5a4435']}[kind]||['#777','#c99','#333'];
 const h=seated?32:46,bob=Math.sin(t*1.8)*.6;
 rect(c,-10,-h+11+bob,20,h-14,p[0]);rect(c,-7,-h-4+bob,14,16,p[1]);rect(c,-8,-h-7+bob,16,7,p[2]);
 rect(c,-9,-7,7,7,'#292c32');rect(c,3,-7,7,7,'#292c32');rect(c,5,-h+2,2,2,'#302e2d');
 if(kind==='assessor'){rect(c,-9,-h+1,19,4,'#8b784f');rect(c,-7,-h,5,5,'#b7c6bd');rect(c,2,-h,5,5,'#b7c6bd');rect(c,-8,-26,16,25,'#a19369');}
 if(kind==='gatekeeper'){rect(c,-12,-h+10,24,5,'#a8a277');rect(c,-18,-39,4,39,'#967653');rect(c,-22,-42,12,5,'#bcc3bb');}
 if(kind==='refuge'){rect(c,-7,-26,14,23,'#d9c7a4');rect(c,-12,-h-8,24,5,'#d9d3b9');rect(c,12,-27,3,19,'#715440');rect(c,10,-30,7,6,'#c8ad76');}
 if(kind==='mara'){rect(c,6,-31,15,17,'#d9ca9e');rect(c,9,-27,8,1,'#677280');rect(c,-13,-28,6,16,'#6b4939');}
 if(kind==='vey'){rect(c,-13,-18,26,16,'#907680');rect(c,7,-22,8,7,'#c6a175');}
 if(kind==='olan'){rect(c,-9,-h+8,18,4,'#b9a06f');rect(c,15,-39,3,39,'#8b785a');rect(c,11,-42,11,5,'#939e99');}
 if(kind==='orra'){rect(c,-12,-h-8,24,3,'#af9473');rect(c,11,-27,9,12,'#c9b47c');rect(c,14,-24,2,5,'#5a584e');}
 if(kind==='pell'){rect(c,-8,-26,16,24,'#ba9363');rect(c,12,-27,3,22,'#b2ada0');rect(c,9,-30,9,4,'#d6cbb0');}
 if(kind==='hale'){c.strokeStyle='#d2c7a6';c.lineWidth=5;c.beginPath();c.moveTo(-8,-35);c.lineTo(9,-21);c.lineTo(-6,-17);c.stroke();rect(c,-14,-27,9,7,'#9a9279');rect(c,-8,-25,16,3,'#c5bea3');rect(c,12,-21,4,18,'#a3977f');}
 if(kind==='bram'){rect(c,15,-28,2,12,'#9c8459');rect(c,10,-18,13,14,'#564b37');rect(c,13,-15,7,8,'#edd899');}
 c.restore();
}
function backdrop(c,x,y,w,h){
 rect(c,x-w/2,y-h,w,h,'#252c29');
 for(let i=0;i<h;i+=13){rect(c,x-w/2+5,y-h+i,w-10,1,'#364037');for(let j=20;j<w;j+=58)rect(c,x-w/2+j+(i%26?12:0),y-h+i,1,11,'#2c342f');}
 for(const dx of [-w/2+4,w/2-9]){rect(c,x+dx,y-h,5,h,'#645b45');rect(c,x+dx+1,y-h,1,h,'#81735a');}
 rect(c,x-w/2-8,y-h-5,w+16,6,'#685d48');rect(c,x-w/2,y-3,w,3,'#89775e');
}
function bell(c,x,y,swing=0){c.save();c.translate(x,y);c.rotate(swing);rect(c,-10,-24,20,23,'#beaa68');rect(c,-14,-3,28,5,'#d6bf79');rect(c,-2,3,4,6,'#9b8356');c.restore();}
function lantern(c,x,y){rect(c,x-1,y-38,2,12,'#b8a372');rect(c,x-8,y-26,16,22,'#847047');rect(c,x-5,y-23,10,15,'#eed291');}

function draw(c,o,q,r,scene){
 if(!active())return false;
 const x=o.x,y=GROUND_Y-o.y,a=scene.performance||{t:10,actionT:10},done=r.phase==='completed',bad=r.phase==='harsh';
 if(o.sideStoryRole==='carried'){if(q.id==='gatekeeper'){c.save();c.translate(x,y);c.scale(.7,.7);bell(c,0,0,Math.sin(a.clock*6)*.06);c.restore();}else lantern(c,x,y);return true;}
 if(o.sideStoryRole==='routeBackdrop'){
  if(o.scaffold){
   // One timber frame behind the whole climb: three posts, a ledger under each step, two X-braces.
   const g=GROUND_Y;for(const px of [1144,1246,1354])rect(c,px-4,g-236,8,260,'#3a3835');
   for(const [sx,sy,w]of [[1220,58,140],[1300,114,110],[1190,170,100],[1300,226,110]])rect(c,sx-w/2,g-sy+10,w,5,'#2f2d2a');
   c.strokeStyle='#49443a';c.lineWidth=4;c.beginPath();
   c.moveTo(1148,g+20);c.lineTo(1242,g-108);c.moveTo(1242,g+20);c.lineTo(1148,g-108);
   c.moveTo(1250,g-116);c.lineTo(1350,g-220);c.moveTo(1350,g-116);c.lineTo(1250,g-220);c.stroke();
   return true;
  }
  if(q.id==='gatekeeper'){rect(c,x-43,y+10,8,o.y-10,'#3a3835');rect(c,x+37,y+10,8,o.y-10,'#3a3835');c.strokeStyle='#49443a';c.lineWidth=5;c.beginPath();c.moveTo(x-39,GROUND_Y);c.lineTo(x+39,y+12);c.stroke();}
  else{c.strokeStyle='#3b4835';c.lineWidth=12;c.beginPath();c.moveTo(x+15,GROUND_Y);c.quadraticCurveTo(x+30,y+45,x-40,y+8);c.lineTo(x+50,y+8);c.stroke();for(let i=0;i<4;i++)rect(c,x-60+i*32,y-24-(i%2)*9,39,8,'#3c5137');}
  return true;
 }
 if(o.sideStoryRole==='ballast'){rect(c,x-20,y-32,40,26,'#746b5b');rect(c,x-16,y-39,13,10,'#9fa49c');rect(c,x,y-36,14,8,'#bbb8a6');rect(c,x-18,y-5,9,5,'#292c32');rect(c,x+10,y-5,9,5,'#292c32');return true;}
 if(o.sideStoryRole==='tower'){rect(c,x-25,GROUND_Y-350,50,345,'#283039');rect(c,x-20,GROUND_Y-350,40,12,'#777462');c.strokeStyle='#8c805f';c.lineWidth=2;c.beginPath();c.moveTo(x,GROUND_Y-338);c.lineTo(x,GROUND_Y-295);c.stroke();return true;}
 if(o.sideStoryRole==='actor'){
  c.save();c.translate(x,y);if(bad&&q.id==='gatekeeper')c.scale(-1,1);person(c,0,0,q.id,a.clock,(done||bad&&q.id==='gatekeeper')&&!o.openingWalking);c.restore();
  if(q.id==='refuge'&&done&&a.t<3){const f=Math.min(1,a.t/3);rect(c,x+12+f*22,y-28,11,5,'#d5c49e');}
  if(q.id==='gatekeeper'&&bad){rect(c,x-24,y-22,15,3,'#9b8564');}
  if(o.openingWalking){const stride=Math.sin(a.t*12)*5;rect(c,x-9+stride,y-5,7,5,'#292c32');}
  if(bad){rect(c,x+12,y-24,Math.min(18,a.t*12),3,'#bea17c');}
  return true;
 }
 if(o.sideStoryRole==='scene'){
  if(q.id==='refuge'&&scene.revisit&&done){const f=Math.min(1,a.clock/3);rect(c,660,GROUND_Y-3,265,3,'#695f4f');for(let i=0;i<5;i++)rect(c,675+i*49,GROUND_Y-5-(1-f)*(80-i*9),32,4,'#786a50');if(f>=1)return true;c.save();c.globalAlpha=1-f;}
  if(q.id==='gatekeeper'){
   backdrop(c,300,GROUND_Y,270,102);rect(c,205,GROUND_Y-85,5,85,'#746651');rect(c,220,GROUND_Y-56,70,5,'#8b785a');
   c.save();if(bad)c.translate(-100*Math.min(1,a.t/2),0);
   rect(c,300,GROUND_Y-25,50,6,'#987b55');rect(c,302,GROUND_Y-19,5,19,'#6f5b43');rect(c,340,GROUND_Y-19,5,19,'#6f5b43');rect(c,300,GROUND_Y-42,4,20,'#8e7452');rect(c,300,GROUND_Y-42,48,4,'#987b55');c.restore();
  }else{
   c.save();c.translate(-300,0);
   backdrop(c,1090,GROUND_Y,310,118);rect(c,945,GROUND_Y-110,5,110,'#75614c');rect(c,1230,GROUND_Y-110,5,110,'#75614c');
   rect(c,944,GROUND_Y-118,288,8,'#826b51');rect(c,963,GROUND_Y-82,70,36,'#363b38');rect(c,974,GROUND_Y-78,48,28,'#716d50');
   rect(c,1150,GROUND_Y-26,64,6,'#ad8960');rect(c,1154,GROUND_Y-20,5,20,'#785f46');rect(c,1204,GROUND_Y-20,5,20,'#785f46');
   const repaired=r.step>=3;rect(c,1060,GROUND_Y-4,repaired?66:18,4,'#a48a67');
   if(repaired){const f=r.step===3?Math.min(1,a.actionT/1.5):1;rect(c,1080,GROUND_Y-35*(1-f)-4,45,4,'#c0a77e');}
   rect(c,980,GROUND_Y-32,40,32,'#5f605a');rect(c,985,GROUND_Y-23,30,14,'#ac6941');
   for(let i=0;i<3;i++)rect(c,991+i*8,GROUND_Y-40-((a.clock*10+i*9)%22),3,5,'#858985');
   if(r.step>=4){const rise=Math.min(1,a.actionT/1.6);lantern(c,1180,GROUND_Y-30-30*rise);}
   const bowls=bad?1:2;for(let i=0;i<bowls;i++)rect(c,1160+i*30,GROUND_Y-31,12,5,'#d7c5a0');
   if(done){rect(c,1179,GROUND_Y-33,17,6,'#ad8753');rect(c,1182,GROUND_Y-35,11,3,'#ceb280');}
   if(bad){rect(c,1155,GROUND_Y-47,4,18,'#c4b68f');rect(c,1155,GROUND_Y-53+Math.sin(a.clock*7),4,6,'#f5d88c');rect(c,1213,GROUND_Y-26,22,4,'#998362');}
   if(done){const pour=Math.min(1,a.t/2);rect(c,1164,GROUND_Y-31,5,Math.max(1,9*(1-pour)),'#c79763');for(let i=0;i<2;i++)rect(c,1162+i*30,GROUND_Y-40-(a.clock*8%13),2,5,'#a7a496');}
   if(bad){rect(c,1190+Math.min(1,a.t/1.5)*28,GROUND_Y-31,12,5,'#d7c5a0');}
   c.restore();
   if(q.id==='refuge'&&scene.revisit&&done)c.restore();
  }
  return true;
 }
 if(o.sideStoryRole==='task'){
  if(o.index<r.step&&['bell','lantern'].includes(o.task)){
   if(o.task==='bell'&&r.step===2&&a.actionT<2.4){const lower=Math.min(1,a.actionT/2.4);bell(c,x,y-26+lower*34,Math.sin(lower*Math.PI)*.15);rect(c,x-1,y-64,2,38+lower*34,'#a18b64');}
   if(o.task==='lantern'&&r.step===2&&a.actionT<1.5){const f=a.actionT/1.5;lantern(c,x+(G.p.x-x)*f,y+(GROUND_Y-G.p.y-y)*f);}
if(o.task==='lantern'){rect(c,x-2,y-50,4,18,'#aa946b');rect(c,x-2,y-35,10,3,'#aa946b');}return true;}
  if(o.task==='bell'||o.task==='hang'){
   if(o.task==='hang'&&r.step<3){rect(c,x-2,y-66,4,66,'#8a7353');rect(c,x-2,y-65,26,4,'#b69b6c');}
   else{c.save();c.translate(x,y-26+(o.task==='hang'&&r.step===3?19*(1-Math.min(1,a.actionT/1.6)):0));c.rotate(Math.sin(a.clock*3)*(done?.1:.025));rect(c,-13,-21,26,24,'#beaa68');rect(c,-17,0,34,5,'#d6bf79');rect(c,-2,5,4,6,'#9b8356');c.restore();}
  }else if(o.task==='ballast'){rect(c,x-25,y-4,50,4,'#a4ada7');rect(c,x+20,y-45,4,43,'#a69b7a');rect(c,x+12,y-48,22,5,'#c8bb93');}
  else if(o.task==='line'){rect(c,x-3,y-55,6,55,'#917955');c.strokeStyle='#b8aa77';c.beginPath();c.moveTo(x,y-50);const slack=r.step>0?(r.step===1?Math.min(1,a.actionT/1.5):1):0;c.quadraticCurveTo(1775,GROUND_Y-265+slack*90,1900,GROUND_Y-320);c.stroke();rect(c,x-5,y-52+slack*12,10,4,'#c0aa78');}
  else if(o.task==='lantern'){rect(c,x-2,y-48,4,18,'#ad9664');rect(c,x-10,y-30,20,26,'#847047');rect(c,x-6,y-26,12,17,'#eed291');}
  else if(o.task==='floor'){rect(c,x-21,y-5,42,5,r.step>=3?'#baa17c':'#766b59');}
  // Table is already rendered by the kitchen; no duplicate prop.
  if(o.index===r.step&&r.phase==='active'&&Math.abs(G.p.x-x)<150&&Math.abs(G.p.y-o.y)<100){
   c.font='13px system-ui';c.textAlign='center';const width=c.measureText(o.title).width+20;rect(c,x-width/2,y-80,width,23,'#101820');c.fillStyle='#f0e4cc';c.fillText(o.title,x,y-64);
  }
  return true;
 }
 return false;
}

function residentKind(o){
 return ({'outskirts-survivor':'vey','outskirts-roadkeeper':'olan','woods-clockkeeper':'orra','woods-resinworker':'pell','woods-veteran':'hale'})[o.residentId]||(['mara','bram','vey','olan','orra','pell','hale'].includes(o.profileId)?o.profileId:null);
}
function drawResident(c,o){
 const kind=residentKind(o);if(!active()||!kind)return false;
 // Mara's run to Broken Muster (index.html updateMaraRun): she folds the survey board before she sets off.
 const x=o.x,y=GROUND_Y-(o.y||0),moving=o.state==='follow'||!!(o.maraPose&&o.maraPose!=='fold');
 if(!moving){
  if(kind==='mara'){const f=o.maraPose==='fold'?1-Math.min(1,o.maraFold||0):1;
   if(f>.02){rect(c,x-7-38*f,y-27,38*f,5,'#917753');rect(c,x-13-29*f,y-35,29*f,8,'#d4c49d');rect(c,x-9-34*f,y-22,4,22*f,'#665644');}}
  if(kind==='vey'){rect(c,x-20,y-10,39,9,'#665851');rect(c,x+26,y-16,18,16,'#514f45');rect(c,x+29,y-19,13,3,'#91856c');}
  if(kind==='olan'){rect(c,x-37,y-85,5,85,'#665d4a');rect(c,x-40,y-85,22,8,'#aea17d');rect(c,x+25,y-18,26,18,'#584f43');}
  if(kind==='orra'){rect(c,x-46,y-28,30,5,'#947451');for(let i=0;i<3;i++)rect(c,x-42+i*9,y-36,6,8,'#b5a579');}
  if(kind==='pell'){rect(c,x+27,y-29,42,6,'#98794b');for(let i=0;i<3;i++)rect(c,x+30+i*12,y-43,8,14,'#a8894d');rect(c,x+29,y-23,4,23,'#64523a');}
  if(kind==='hale'){rect(c,x-18,y-10,43,8,'#675b50');rect(c,x+30,y-32,5,32,'#88765b');rect(c,x+25,y-35,15,4,'#ad9972');}
  if(kind==='bram'){rect(c,x+37,y-54,4,54,'#8c7658');rect(c,x+23,y-56,22,4,'#aa9470');}
 }
 if(!root.BladefallResidentArt?.drawLegacy(c,o))person(c,x,y,kind,G.time,kind==='vey'||kind==='hale');
 if(o.done&&kind==='mara'){const f=Math.min(1,(o._openingDoneT||0)/2);rect(c,x+10+f*22,y-26+f*5,17,12,'#d9ca9e');rect(c,x+13+f*22,y-23+f*5,9,1,'#62778a');}
 if(o.done&&kind==='bram'){const f=Math.min(1,(o._openingDoneT||0)/2);lantern(c,x+15+f*23,y-4-f*20);}
 return true;
}


function drawShop(c,o){
 if(!active()||o.shopId!=='ethereal-goods')return false;
 const x=o.x,y=GROUND_Y-(o.y||0);c.save();
 rect(c,x-49,y-67,98,53,'#263f39');rect(c,x-55,y-72,110,7,'#8d9c7c');
 for(let i=0;i<6;i++)rect(c,x-54+i*18,y-65,17,12,i%2?'#b5c09b':'#839776');
 if(!root.BladefallResidentArt?.drawKeeper(c,o,x,y-12))person(c,x,y-12,'assessor',G.time);
 const gift=o._openingGifted,f=Math.min(1,(o._openingGiftT??20)/2);
 if(gift&&f<1){rect(c,x+12+f*27,y-39,7,6,'#d7c5dc');rect(c,x+9,y-33,7+f*27,3,'#bf8f70');}
 rect(c,x-55,y-21,110,8,'#987b55');rect(c,x-48,y-13,5,13,'#69553d');rect(c,x+43,y-13,5,13,'#69553d');
 for(let i=0;i<3;i++){rect(c,x-43+i*10,y-34,6,12,['#738da5','#b7a567','#7d9f81'][i]);rect(c,x-42+i*10,y-38,4,4,'#c4ae83');}
 rect(c,x+31,y-42,3,20,'#b1a071');rect(c,x+21,y-41,23,2,'#d0bf83');rect(c,x+20,y-32,8,3,'#93855f');rect(c,x+39,y-32,8,3,'#93855f');
 c.font='bold 10px system-ui';c.textAlign='center';c.fillStyle='#d2ddc2';c.fillText('TAMSIN · ETHEREAL GOODS',x,y-84);
 if(Math.abs(G.p.x-x)<110){rect(c,x-58,y-111,116,19,'#13221e');c.fillStyle='#e5ebd6';c.fillText('['+keyLabel(kbCode('companion'))+'] BROWSE',x,y-98);}
 c.restore();return true;
}

root.BladefallOpeningStories=Object.freeze({drawShop,residentKind,drawResident,layout,install,requirement,update,draw,person});
})(globalThis);
