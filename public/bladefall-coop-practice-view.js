(function(root){
'use strict';
const P=root.BladefallCoopPracticeCore,S=root.BladefallCoopPracticeSession,$=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
const colors=['#efba69','#75d2e4'],symbols=['red-circle','blue-square','gold-triangle'],symbolColors=['#ef8585','#8fbbff','#eed06d'];
const descriptions=[
 ['Carry the weight','Ride the cage','E picks up or sets down the lantern. Move it from the left scale to the right scale. Your partner rides the cage and uses E at the upper latch. Move the weight back left, then board your return lift.'],
 ['First portal pair','Second portal pair','Q at your marked surface activates your pair. E carries or throws the lantern. Pass it through both pairs into the gold receiver, then board the return lifts.'],
 ['Left brake','Right crossing','J strikes a nearby lever. The left lever opens the right crossing; the middle lever opens the left crossing. Cross while the six-second lights are on, then meet on the middle ledge.'],
 ['Brace the shield','Cut the rear tether','Hold K facing left at the shield stand. Your partner crosses behind the shield, gets to the right of the tether, then faces left and presses J. Keep shielding until the cut stops the arrows.'],
 ['Lift operator','Launch rider','Hold E at the lever to raise the tilted lift. Release near the top; the rider holds Jump, steers right, then dashes to the high ledge. E at its latch calls the return lift.'],
 ['Read and hold the shutter','Enter the symbol order','The observer holds E at the viewing grille and pings the three symbols in order. The other knight walks to each matching switch and presses E. Keep the shutter held until all three are entered.'],
 ['Raise the rescue basket','Retrieve the key','Hold E at the upper console to raise the basket. Your partner drops for the key. Once they are caught, Q at the console opens the return portal. Both of you can drop onto the basket to use it.'],
 ['Climb the left steps','Take the spring route','Reach the two gold locks. Keep both occupied for 1.5 seconds to open the central arch. The left path climbs; the right path drops under the wall to a spring. Then meet at the arch.'],
];
P.names.forEach((n,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+' · '+n;$('room').append(o);});
let role=null,peer=null,conn=null,host=null,code='',token='',epoch=0,seq=0,state=null,previous=null,receivedAt=0,connected=false,readyFlags=[false,false],lastPacket=0,ping=null,loadPromise=null,linkGeneration=0;
const keys=new Set();
const mapping={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d',Space:'jump',KeyZ:'jump',ShiftLeft:'dash',ShiftRight:'dash',KeyX:'dash',KeyG:'grab',KeyJ:'strike',KeyK:'parry',KeyE:'use',KeyQ:'portal',KeyR:'reset'};
const input=()=>{const b={};for(const k of keys)if(mapping[k])b[mapping[k]]=true;return b;};
function send(m){try{if(conn?.open)conn.send(m);}catch{}}
function showPing(m){ping={...m,at:performance.now()};$('ping').textContent=(m.player===(role==='host'?0:1)?'You':'Partner')+': '+m.kind.replaceAll('-',' ')+(m.point?' ('+m.point.x+', '+m.point.y+')':'');}
function submit(){const b=input();if(role==='host')host?.local(b);else if(connected)send({type:'input',token,epoch,seq:++seq,buttons:b});}
function clear(){keys.clear();submit();}
function postPing(kind,point){if(role==='host')host?.ping(kind,point);else if(connected)send({type:'ping',token,kind,point});}
function ready(){clear();if(role==='host')host?.ready();else send({type:'ready',token,epoch});}
function setState(next){if(!next)return;previous=state;state={...next,map:next.map||(state?.index===next.index?state.map:null)};receivedAt=performance.now();$('game').hidden=false;document.body.classList.add('playing');updateUI();}
function updateUI(){if(!state)return;const me=role==='host'?0:1,operator=state.roles%2,d=descriptions[state.index];
 $('roomTitle').textContent=(state.index+1)+' / 8 · '+state.name;$('job').textContent=(me===operator?d[0]:d[1])+' · '+(me===0?'gold knight':'blue knight');$('job').style.color=colors[me];$('instructions').textContent=d[2];
 $('connection').textContent=code+' · '+(connected?'linked':'paused');$('swap').hidden=role!=='host';$('pause').hidden=connected&&!state.paused&&!state.complete;
 $('pauseTitle').textContent=state.complete?(state.index===7?'Course complete':'Room complete'):!connected?'Waiting for your friend':'Ready to begin?';
 $('pauseText').textContent=!connected?'Share code '+code+'. A disconnected partner can rejoin with the same code.':state.complete?'Both knights made it. Continue together; the next room swaps your jobs.':'Read your job below. Both players press Ready to start or resume.';
 $('ready').textContent=state.complete?(state.index===7?'Ready to replay':'Ready for next room'):readyFlags[me]?'Waiting for partner…':'Ready';$('ready').disabled=!connected||readyFlags[me];$('reconnect').hidden=role!=='guest'||connected;
}
function loadPeer(){if(root.Peer)return Promise.resolve();return loadPromise||(loadPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='peerjs.min.js';s.onload=resolve;s.onerror=()=>{loadPromise=null;reject(Error('Could not load matchmaking. Try again.'));};document.head.append(s);}));}
function stop(){linkGeneration++;try{conn?.close();peer?.destroy();}catch{}conn=peer=null;host=null;connected=false;role=null;keys.clear();state=previous=null;$('game').hidden=true;document.body.classList.remove('playing');$('network').textContent='Session ended. Choose a room to begin.';}
function attach(c,generation){
 if(role==='host'&&conn?.open&&host?.state.connected){c.on('open',()=>{c.send({type:'busy'});c.close();});return;}
 conn=c;c.on('open',()=>{if(generation!==linkGeneration)return;if(role==='guest')send({type:'hello',token});});
 c.on('data',m=>{if(generation!==linkGeneration||conn!==c||!m)return;lastPacket=performance.now();
  if(role==='host'){const accepted=host.receive(m);connected=host.state.connected;if(m.type==='hello'&&!accepted){c.send({type:'rejected'});c.close();}return;}
  if(m.type==='busy'||m.type==='rejected'){$('network').textContent='This practice session already belongs to another partner.';connected=false;c.close();return;}
  if(m.type==='ping'){showPing(m);return;}
  if(m.state){if(!Number.isSafeInteger(m.epoch)||m.epoch<epoch)return;epoch=m.epoch;readyFlags=m.ready||[false,false];connected=m.type!=='pause';if(m.type==='welcome'||m.type==='epoch'){seq=0;keys.clear();}setState(m.state);if(m.type==='pause')setTimeout(()=>{if(conn===c&&c.open)send({type:'hello',token});},300);}
 });
 c.on('close',()=>{if(generation!==linkGeneration||conn!==c)return;connected=false;if(role==='host')host.disconnect();if(state)state.paused=true;updateUI();});
 c.on('error',()=>{if(conn!==c)return;connected=false;if(role==='host')host.disconnect();if(state)state.paused=true;updateUI();});
}
async function startHost(){stop();role='host';const generation=linkGeneration;code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');$('network').textContent='Starting practice…';
 host=S.create({room:+$('room').value,requireReady:true,send,onPing:showPing});setState(host.snapshot(0));
 try{await loadPeer();if(generation!==linkGeneration)return;peer=new root.Peer('bladefall-practice-'+code.toLowerCase(),{debug:0});peer.on('open',()=>{$('network').textContent='Your code: '+code+' — share it with your friend.';updateUI();});peer.on('connection',c=>attach(c,generation));peer.on('disconnected',()=>{try{peer.reconnect();}catch{}});peer.on('error',e=>{$('network').textContent=e?.type==='unavailable-id'?'That code is in use. Press Host practice for another.':'Matchmaking is unavailable. Your current room is kept while this page stays open.';});}catch(e){$('network').textContent=e.message;}
}
async function startGuest(rejoin=false){const requested=(rejoin?code:$('code').value).trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(requested)){$('network').textContent='Enter your friend’s six-character code.';return;}
 const savedState=rejoin?state:null;stop();role='guest';code=requested;state=savedState;epoch=0;seq=0;const generation=linkGeneration,key='bladefall.practice.guest.'+code;try{token=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,token);}catch{token=crypto.randomUUID();}
 $('network').textContent='Joining '+code+'…';try{await loadPeer();if(generation!==linkGeneration)return;peer=new root.Peer({debug:0});peer.on('open',()=>attach(peer.connect('bladefall-practice-'+code.toLowerCase(),{reliable:true}),generation));peer.on('error',()=>{$('network').textContent='Could not reach that host. Check the code or try Reconnect.';connected=false;if(state){state.paused=true;$('game').hidden=false;}updateUI();});setTimeout(()=>{if(generation===linkGeneration&&!connected)$('network').textContent='Still waiting for the host. Check that their practice page is open.';},12000);}catch(e){$('network').textContent=e.message;}
}
canvas.onpointerdown=e=>{const r=canvas.getBoundingClientRect();postPing('here',{x:(e.clientX-r.left)*640/r.width,y:(e.clientY-r.top)*360/r.height});};
$('retry').onclick=()=>{keys.add('KeyR');submit();setTimeout(()=>{keys.delete('KeyR');submit();},50);};
$('host').onclick=startHost;$('join').onclick=()=>startGuest();$('reconnect').onclick=()=>startGuest(true);$('leave').onclick=stop;$('ready').onclick=ready;$('swap').onclick=()=>{clear();host?.chooseRoom(host.state.game.index,true);};$('room').onchange=()=>{if(role==='host')host.chooseRoom(+$('room').value,false);};$('code').onkeydown=e=>{if(e.key==='Enter')startGuest();};
document.querySelectorAll('[data-ping]').forEach(b=>b.onclick=()=>postPing(b.dataset.ping));
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(mapping[e.code]){e.preventDefault();keys.add(e.code);submit();}else if(/^Digit[1-6]$/.test(e.code)&&!e.repeat){e.preventDefault();postPing([...symbols,'ready','wait','here'][+e.code.slice(-1)-1]);}else if(e.code==='Enter'&&!e.repeat&&state?.paused)ready();});
addEventListener('keyup',e=>{if(mapping[e.code]){keys.delete(e.code);submit();}});addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();if(role==='host')host?.disconnect();}});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);submit();};b.onpointerup=b.onpointercancel=()=>{keys.delete(b.dataset.key);submit();};});
setInterval(()=>{if(role==='guest'){if(connected){submit();if(performance.now()-lastPacket>1800){connected=false;if(state)state.paused=true;updateUI();}}else if(conn?.open)send({type:'hello',token});}},100);
function text(t,x,y,color='#e6d9b7',size=7){ctx.font=size+'px monospace';ctx.fillStyle=color;ctx.fillText(t,x,y);}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function symbol(n,x,y,r=5){ctx.fillStyle=symbolColors[n];ctx.beginPath();if(n===0)ctx.arc(x,y,r,0,Math.PI*2);else if(n===1)ctx.rect(x-r,y-r,r*2,r*2);else{ctx.moveTo(x,y-r);ctx.lineTo(x+r,y+r);ctx.lineTo(x-r,y+r);}ctx.fill();}
function ring(x,y,color,active=true){ctx.strokeStyle=active?color:'#5a5066';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,5,14,0,0,Math.PI*2);ctx.stroke();}
function label(t,x,y){text(t,x,y,'#dcca9e',6);}
function devices(v){const q=v.puzzle,i=v.index;
 if(i===0){ctx.strokeStyle='#5c4e58';ctx.lineWidth=1;ctx.setLineDash([2,4]);for(const [x,bx,id]of [[116,256,'return'],[236,320,'cage']]){const b=v.bodies.find(b=>b.id===id);ctx.beginPath();ctx.moveTo(x,325);ctx.lineTo(x,72);ctx.lineTo(bx,72);ctx.lineTo(bx,b.y);ctx.stroke();}ctx.setLineDash([]);rect(96,325,40,3,q.returnWeighted?'#edce74':'#756550');label('RETURN SCALE',81,339);rect(216,325,40,3,q.weighted?'#edce74':'#756550');label('SCALE',218,339);label('E · LATCH',392,103);rect(405,107,6,12,'#eed080');}
 if(i===1){ring(196,302,colors[v.roles%2],q.portals[0]);ring(248,226,colors[v.roles%2],q.portals[0]);ring(404,302,colors[1-v.roles%2],q.portals[1]);ring(480,102,colors[1-v.roles%2],q.portals[1]);rect(528,129,52,7,q.latched?'#b6e79e':'#947644');label('RECEIVER',528,123);label('Q',181,276);label('Q',389,276);}
 if(i===2){for(const[x,y]of[[160,270],[352,224]]){rect(x-2,y-8,4,14,'#efc77d');label('J',x-2,y-13);}label('BRAKE '+(q.timer/60).toFixed(1)+'s',278,286);}
 if(i===3){label('K + ←',104,272);rect(q.shieldDir>0?140:121,281,3,30,q.shield?'#9de8e9':'#655c76');rect(20,282,8,23,'#bc6e7b');if(!q.latched){rect(514,277,2,27,'#d5b374');label('J ←',512,268);}label('SHIELD',108,323);}
 if(i===4){label('HOLD E',91,301);label('RELEASE',325,189);label('E · LATCH',505,130);ctx.strokeStyle='#635a67';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(304,312);ctx.lineTo(368,200);ctx.stroke();ctx.setLineDash([]);}
 if(i===5){rect(77,250,72,30,'#292334');if(q.clue)q.clue.forEach((n,j)=>symbol(n,90+j*22,266));else for(let x=80;x<150;x+=8)rect(x,250,2,30,'#595063');label('HOLD E',89,299);[296,376,456].forEach((x,n)=>{symbol(n,x,308);label('E',x-2,339);});q.entered.forEach((n,j)=>symbol(n,360+j*15,282,3));label(q.shutter?'SHUTTER OPEN':'SHUTTER CLOSED',296,256);}
 if(i===6){label('E · RAISE / Q · OPEN',60,128);if(!q.key)symbol(2,364,264,6);ring(372,270,'#85dce2',q.portal);ring(589,136,'#85dce2',q.portal);label('CATCH BASKET',342,310);}
 if(i===7){[[240,248],[456,248]].forEach(([x,y],j)=>{rect(x-12,y-3,24,3,q.locks[j]?'#e6d891':'#7d6f58');label('LOCK',x-10,y+13);});rect(290,263,90,4,'#43394c');rect(290,263,q.charge,4,'#c5dda3');label(q.latched?'TOGETHER':'HOLD BOTH · 1.5s',285,279);}
}
function draw(now){ctx.setTransform(2,0,0,2,0,0);rect(0,0,640,360,'#130f1b');if(!state?.map)return;const v=state;
 for(let x=24;x<640;x+=64)rect(x,38+(x%5)*27,16,322,'#1b1525');
 v.map.forEach((row,r)=>{for(let c=0;c<row.length;c++){const ch=row[c],x=c*8,y=r*8;if(ch==='#'){rect(x,y,8,8,(r+c)%2?'#42364e':'#3b3047');rect(x,y,8,1,'#61526c');}else if('^v<>'.includes(ch)){ctx.fillStyle='#be7b9c';ctx.beginPath();if(ch==='^'){ctx.moveTo(x,y+8);ctx.lineTo(x+4,y);ctx.lineTo(x+8,y+8);}else if(ch==='v'){ctx.moveTo(x,y);ctx.lineTo(x+4,y+8);ctx.lineTo(x+8,y);}else if(ch==='<'){ctx.moveTo(x+8,y);ctx.lineTo(x,y+4);ctx.lineTo(x+8,y+8);}else{ctx.moveTo(x,y);ctx.lineTo(x+8,y+4);ctx.lineTo(x,y+8);}ctx.fill();}else if(ch==='s'){rect(x,y+5,8,3,'#dab977');text('⌃',x,y+4,'#e3cd8a',10);}}});
 for(const b of v.bodies){if(!b.solid)continue;rect(b.x,b.y,b.w,b.h,b.id.includes('gate')||b.id.includes('door')?'#805264':'#69566d');rect(b.x,b.y,b.w,2,'#d7bd80');if(b.id.includes('return')||b.id.includes('cage')||b.id.includes('basket')||b.id==='launch'){for(let y=b.y+8;y<Math.min(352,b.y+40);y+=6){rect(b.x+5,y,2,3,'#74677b');rect(b.x+b.w-7,y,2,3,'#74677b');}}}
 devices(v);if(v.lantern){rect(v.lantern.x,v.lantern.y,10,12,'#d1b467');rect(v.lantern.x+3,v.lantern.y+3,4,5,'#fff0a7');}for(const b of v.bolts||[])rect(b.x,b.y,b.w,b.h,'#f2a681');
 v.players.forEach((p,i)=>{let x=p.x,y=p.y;if(role==='guest'&&previous?.index===v.index&&previous.players?.[i]){const a=previous.players[i],t=Math.min(1,(now-receivedAt)/50);if(Math.hypot(x-a.x,y-a.y)<64){x=a.x+(x-a.x)*t;y=a.y+(y-a.y)*t;}}x=Math.round(x);y=Math.round(y);rect(x,y+8,3,3,'#252132');rect(x+5,y+8,3,3,'#252132');rect(x,y+3,8,6,colors[i]);rect(x,y,8,5,'#c7ccd5');rect(x+(p.f>0?5:1),y+2,2,1,'#161823');rect(x+(p.f>0?-5:8),y+5,5,2,colors[i]);text(i===v.player?'YOU':String(i+1),x-2,y-5,colors[i],6);});
 text('SHARED RETRIES '+v.deaths,10,15,'#bdb0c6',7);if(ping&&now-ping.at<3000){const p=ping.point||v.players[ping.player];if(ping.point){ctx.strokeStyle='#afe1d4';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.stroke();}text(ping.kind.replaceAll('-',' '),Math.max(8,Math.min(550,p.x-12)),p.y-18,'#afe1d4',7);}else if(ping){ping=null;$('ping').textContent='';}
}
let last=performance.now(),acc=0;function frame(now){acc+=Math.min(250,now-last);last=now;if(role==='host'&&host){while(acc>=1000/60){host.tick();acc-=1000/60;}connected=host.state.connected;readyFlags=host.state.ready;state=host.snapshot(0);updateUI();}else acc=0;draw(now);requestAnimationFrame(frame);}requestAnimationFrame(frame);
root.BladefallCoopPracticeView={descriptions,input,ready,postPing,startHost,startGuest,stop,draw,get state(){return state;},get host(){return host;}};
})(globalThis);
