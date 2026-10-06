/* The Climb · co-op (7.270). Isaac: "add co-op to these new worlds so I can play with a friend. We both still have to
   complete the rooms/sections to move on, but he can see me do it first … let co-op players skip ahead of others so
   we can both explore at our leisure. Holding T should teleport you to co-player as well with a neat little animation."

   Two knights in the same world, each on his own run: every section is still yours to clear (your fires, your deaths,
   your rewards), and you see your partner's knight wherever he is, live, so you can watch him do a room first.
   Either of you may go on ahead. Hold T to go to him (a short charge, then you fold into light and come out beside
   him). Into a quest or a secret that way, its reward stays sealed: it is earned from its door.

   Transport: PeerJS (peerjs.min.js, the main game's), room code of four letters; or, for two tabs on one machine,
   ?coop=local (a BroadcastChannel). Messages: {t:'hi'|'world'|'s'}. Nothing here touches the core or the saves. */
(function(root){
'use strict';
const V=()=>root.BladefallPrecisionView,P=()=>root.BladefallPitchView,CL=()=>root.BladefallClimb;
const ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CO={status:'off',role:null,code:null,err:null,remote:null,shown:null,holdT:0,tele:null,tDown:false,seen:0};
let peer=null,conn=null,chan=null,sendTimer=null;
const st=()=>P()&&P().climb&&P().climb.state();
const local=()=>{const s=st();return s&&s.world?s:null;};

/* ---------------------------------------------------------------- transport */
function send(m){try{if(chan)chan.postMessage({...m,from:CO.role});else if(conn&&conn.open)conn.send(m);}catch(e){}}
function onMessage(m){
 if(!m||m.from===CO.role&&chan)return;
 CO.seen=Date.now();
 if(m.t==='hi'||m.t==='world'){
  if(CO.status!=='on'){CO.status='on';announce('Partner joined',160);}
  if(m.t==='hi'&&CO.role==='host')send({t:'hi',world:local()?.world.n||0});
  // Joining puts you in your partner's world. After that each of you goes where you like (Isaac: "let co-op players
  // skip ahead of others so we can both explore at our leisure"): a later world change never pulls the other along.
  const s=local();if(m.world&&!s)P().climb.startWorld(m.world);
  refreshMenu();return;
 }
 if(m.t==='s'){CO.remote={...m,at:Date.now()};if(CO.status!=='on'){CO.status='on';refreshMenu();}}
}
function loadPeer(){
 if(root.Peer)return Promise.resolve();
 return new Promise((res,rej)=>{const s=document.createElement('script');s.src='peerjs.min.js';s.onload=res;s.onerror=()=>rej(new Error('Could not load peerjs.min.js'));document.head.appendChild(s);});
}
const peerId=code=>'bladefall-climb-'+code.toLowerCase();
function attach(c){conn=c;c.on('open',()=>{CO.status='on';send({t:'hi',world:local()?.world.n||0});refreshMenu();});c.on('data',onMessage);
 c.on('close',()=>{CO.status='lost';CO.remote=null;announce('Partner left',160);refreshMenu();});}
function host(){
 if(new URLSearchParams(location.search).get('coop')==='local')return localLink('host');
 CO.role='host';CO.code=Array.from({length:4},()=>ALPHA[Math.floor(Math.random()*ALPHA.length)]).join('');CO.status='starting';CO.err=null;refreshMenu();
 loadPeer().then(()=>{peer=new root.Peer(peerId(CO.code),{debug:0});
  peer.on('open',()=>{CO.status='waiting';refreshMenu();});
  peer.on('connection',attach);
  peer.on('error',e=>{if(e&&e.type==='unavailable-id'){try{peer.destroy();}catch(x){}host();return;}if(conn&&conn.open)return;CO.status='error';CO.err='Could not reach the matchmaking service.';refreshMenu();});
 }).catch(e=>{CO.status='error';CO.err=e.message;refreshMenu();});
 startSending();
}
function join(code){
 if(new URLSearchParams(location.search).get('coop')==='local')return localLink('guest');
 code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);if(code.length!==4){CO.status='error';CO.err='Enter the 4-letter code.';refreshMenu();return;}
 CO.role='guest';CO.code=code;CO.status='starting';CO.err=null;refreshMenu();
 loadPeer().then(()=>{peer=new root.Peer({debug:0});
  peer.on('open',()=>{CO.status='waiting';refreshMenu();attach(peer.connect(peerId(code),{reliable:true}));setTimeout(()=>{if(CO.status==='waiting'){CO.status='error';CO.err='No climb found with that code.';refreshMenu();}},12000);});
  peer.on('error',()=>{if(CO.status==='on')return;CO.status='error';CO.err='Could not reach that climb.';refreshMenu();});
 }).catch(e=>{CO.status='error';CO.err=e.message;refreshMenu();});
 startSending();
}
function localLink(role){
 // two tabs on one machine (and the page check): a BroadcastChannel stands in for the network
 CO.role=role;CO.code='LOCAL';CO.status='waiting';chan=new BroadcastChannel('bladefall-climb-coop');chan.onmessage=e=>onMessage(e.data);
 send({t:'hi',world:local()?.world.n||0});refreshMenu();startSending();
}
function leave(){try{conn&&conn.close();}catch(e){}try{peer&&peer.destroy();}catch(e){}try{chan&&chan.close();}catch(e){}
 conn=peer=chan=null;CO.status='off';CO.role=null;CO.code=null;CO.remote=null;clearInterval(sendTimer);sendTimer=null;refreshMenu();}
function startSending(){
 clearInterval(sendTimer);
 // twenty times a second: where my knight is (world pixels), how he stands, and which section he is in
 sendTimer=setInterval(()=>{const s=local(),g=V()?.view?.g;if(!s||!g||CO.status==='off')return;const pl=P().climb.sectionOf(g);if(!pl)return;const p=g.p;
  send({t:'s',world:s.world.n,room:g.room.id,name:g.room.def.name||'',x:Math.round(pl.x+p.x),y:Math.round(pl.y+p.y),f:p.facing,st:p.state,vx:Math.round(p.vx),vy:Math.round(p.vy),g:p.onGround?1:0,tele:CO.tele?CO.tele.t:0});},50);
}
function announce(t,n){try{P().climb.announce(t,n);}catch(e){}}

/* ---------------------------------------------------------------- the world menu panel */
CO.menuHtml=function(){
 const s=CO.status,code=CO.code;
 const body=s==='off'?`<button class="pcBtn ghost" id="coHost">Play with a friend · host</button><span class="pcRow"><input id="coCode" maxlength="4" placeholder="CODE" style="width:6em;text-transform:uppercase;font:inherit;padding:.4em;background:#11141c;color:#efe4cc;border:1px solid #3a4152"><button class="pcBtn ghost" id="coJoin">Join</button></span>`
  :s==='starting'?`<p class="pcSub">Starting…</p>`
  :s==='waiting'&&CO.role==='host'?`<p class="pcSub">Your code: <b style="letter-spacing:.2em;color:#ffd98a">${code}</b> · waiting for your friend to join</p>`
  :s==='waiting'?`<p class="pcSub">Joining ${code}…</p>`
  :s==='on'?`<p class="pcSub">Playing together${code&&code!=='LOCAL'?' · '+code:''}. Pick a world: your partner comes too. Hold <b>T</b> to go to your partner.</p>`
  :s==='lost'?`<p class="pcSub">Your partner left.</p>`
  :`<p class="pcSub">${CO.err||'Something went wrong.'}</p>`;
 return `<div class="pcCard" id="coPanel" style="margin-top:.6em"><h2 style="margin:.2em 0">Co-op</h2>
 <p class="pcSub">Two knights, one world: each of you clears every section yourself, and you see your partner do it. Either of you can go on ahead.</p>
 ${body}${s!=='off'?'<button class="pcBtn ghost" id="coLeave">Leave co-op</button>':''}</div>`;
};
CO.bindMenu=function(){
 const $=id=>document.getElementById(id);
 if($('coHost'))$('coHost').onclick=host;
 if($('coJoin'))$('coJoin').onclick=()=>join($('coCode').value);
 if($('coCode'))$('coCode').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')join($('coCode').value);};
 if($('coLeave'))$('coLeave').onclick=leave;
};
function refreshMenu(){const el=document.getElementById('coPanel');if(!el)return;el.outerHTML=CO.menuHtml();CO.bindMenu();}
CO.worldStarted=function(n){if(CO.status!=='off')send({t:'world',world:n});};

/* ---------------------------------------------------------------- hold T: to your partner */
addEventListener('keydown',e=>{if(e.key==='t'||e.key==='T'){CO.tDown=true;}});
addEventListener('keyup',e=>{if(e.key==='t'||e.key==='T'){CO.tDown=false;}});
const CHARGE=36,FOLD=14;   // frames to hold, frames to fold into light
CO.tick=function(g){
 const s=local(),r=CO.remote;
 // the fold: the knight is light for a moment, then stands beside his partner
 if(CO.tele){const T=CO.tele;T.t++;
  if(T.t===FOLD){const ok=P().climb.teleport(T.room,T.x,T.y);if(!ok){CO.tele=null;return false;}g=V().view.g;}
  if(T.t>=FOLD*2){CO.tele=null;}
  return T.t<FOLD;   // hold the game while he folds away; let it run as he arrives
 }
 const ready=r&&s&&(CL()?.geography||r.world===s.world.n)&&Date.now()-r.at<3000;
 if(CO.tDown&&ready){CO.holdT++;if(CO.holdT>=CHARGE){CO.holdT=0;CO.tDown=false;
   // beside him, not on top of him: a step behind, on his side of the room
   CO.tele={t:0,room:r.room,x:r.x-(r.f||1)*10,y:r.y,from:{x:0,y:0}};announce('To your partner',90);}}
 else if(!CO.tDown)CO.holdT=0;
 else if(CO.tDown&&!ready&&CO.holdT===0&&CO.status==='on'){CO.holdT=-1;announce('Your partner is in another world',120);}
 return false;
};

/* ---------------------------------------------------------------- where a knight is on the map */
/* Positions are sent in section space. A folded passage keeps its rooms off the map (they are projected at their two
   mouths), so a knight in one is placed along that passage's route between its mouths instead. */
function mapPos(world,room,x,y){
 const C=CL(),w=C&&C.world(world),def=w&&C.def(w,room);if(!def||!def.atlasFold||!C.geography)return {x,y};
 const sec=C.place(w,room),route=(C.geography.routes||[]).find(r=>r.link===def.atlasTransit?.link),ports=def.atlasSockets||[];
 if(!sec||!route||ports.length<2)return {x,y};
 const lx=x-sec.x,ly=y-sec.y,t=Math.max(0,Math.min(1,(lx+4-ports[0].plane)/((ports[1].plane-ports[0].plane)||1))),a=route.points[0],b=route.points[1];
 const floorY=(ports[0].floor+(ports[1].floor-ports[0].floor)*t)*8-11;
 return {x:(a.x+(b.x-a.x)*t)*8-4,y:(a.y+(b.y-a.y)*t)*8-11+(ly-floorY)};
}
/* The partner's position in my room's own coordinates (for drawing and for the arrow). */
function partnerLocal(g,pl,r){
 const s=local();if(!s)return null;
 if(r.room===g.room.id)return {x:r.x-pl.x,y:r.y-pl.y};
 const me=mapPos(s.world.n,g.room.id,pl.x+g.p.x,pl.y+g.p.y),him=mapPos(r.world,r.room,r.x,r.y);
 return {x:g.p.x+(him.x-me.x),y:g.p.y+(him.y-me.y)};
}

/* ---------------------------------------------------------------- drawing */
const BODY='#3d6b5a',SCARF='#7ad1c2';
CO.draw=function(b,g,pl){
 const s=local(),r=CO.remote,t=g.frame;
 // my charge: a ring that closes as T is held
 if(CO.holdT>0){const p=g.p,k=CO.holdT/CHARGE;b.save();b.strokeStyle=`rgba(122,209,194,${.4+.6*k})`;b.lineWidth=1;b.beginPath();b.arc(p.x+p.w/2,p.y+p.h/2,12-6*k,-Math.PI/2,-Math.PI/2+k*6.283);b.stroke();b.restore();}
 if(CO.tele){const p=g.p,T=CO.tele,k=T.t<FOLD?T.t/FOLD:1-(T.t-FOLD)/FOLD;b.save();b.globalAlpha=Math.max(0,k);
  for(let i=0;i<10;i++){const a=i*0.628+t*.2,rr=4+k*14;b.fillStyle=SCARF;b.fillRect(Math.round(p.x+p.w/2+Math.cos(a)*rr),Math.round(p.y+p.h/2+Math.sin(a)*rr),1,1);}
  b.fillStyle='rgba(200,255,240,'+(.6*k)+')';b.fillRect(p.x-1,p.y-2,p.w+2,p.h+3);b.restore();}
 if(!r||!s||(!CL()?.geography&&r.world!==s.world.n)||Date.now()-r.at>3000)return;
 // my partner's knight, smoothed between messages
 const at=partnerLocal(g,pl,r);if(!at)return;
 if(!CO.shown||CO.shown.key!==g.room.id+'|'+r.room||Math.hypot(CO.shown.x-at.x,CO.shown.y-at.y)>200)CO.shown={x:at.x,y:at.y,key:g.room.id+'|'+r.room};
 CO.shown.x+=(at.x-CO.shown.x)*.5;CO.shown.y+=(at.y-CO.shown.y)*.5;
 const x=Math.round(CO.shown.x),y=Math.round(CO.shown.y);
 const pose=r.st==='climb'?'climb':r.st==='dash'?'dash':!r.g?(r.vy<0?'rise':'fall'):Math.abs(r.vx)>10?'run':'idle';
 b.save();if(r.st==='dead'||r.st==='respawn')b.globalAlpha=.35;if(r.tele)b.globalAlpha=Math.max(.15,1-Math.min(r.tele,FOLD)/FOLD);
 try{V().drawKnight(b,x,y,r.f||1,pose,BODY,SCARF,1,1,(t/6)%4);}catch(e){b.fillStyle=BODY;b.fillRect(x,y,8,11);}
 b.font='6px ui-monospace,Menlo,monospace';b.fillStyle='rgba(14,16,24,.7)';b.fillRect(x-2,y-10,12,8);b.fillStyle=SCARF;b.fillText('P2',x-1,y-4);
 b.restore();
};
CO.hud=function(ctx,ox,oy,scale,fs,g,view){
 if(CO.status==='off')return;
 const s=local(),r=CO.remote,cam=view.cam||{x:0,y:0},W0=view.buf?view.buf.width:320,H0=view.buf?view.buf.height:184;
 // where my partner is: an arrow at the screen's edge when he is out of sight, and the section he is in
 let txt=CO.status==='on'?'Co-op':CO.status==='waiting'&&CO.role==='host'?`Co-op · code ${CO.code}`:'Co-op · '+CO.status;
 if(r&&s&&(CL()?.geography||r.world===s.world.n)){const pl=P().climb.sectionOf(g),at=partnerLocal(g,pl,r)||{x:r.x-pl.x,y:r.y-pl.y};const sx=(at.x-cam.x),sy=(at.y-cam.y);
  const off=sx<0||sy<0||sx>W0||sy>H0;
  if(off){const cx=W0/2,cy=H0/2,dx=sx-cx,dy=sy-cy,k=Math.min((W0/2-10)/Math.abs(dx||1e-6),(H0/2-10)/Math.abs(dy||1e-6)),ax=cx+dx*k,ay=cy+dy*k,a=Math.atan2(dy,dx);
   ctx.save();ctx.translate(ox+ax*scale,oy+ay*scale);ctx.rotate(a);ctx.fillStyle=SCARF;ctx.beginPath();ctx.moveTo(fs*.9,0);ctx.lineTo(-fs*.5,-fs*.5);ctx.lineTo(-fs*.5,fs*.5);ctx.fill();ctx.restore();}
  txt+=` · partner: ${r.name||'?'}${off?' · hold T to go':''}`;}
 else if(r&&s)txt+=' · partner in another world';
 ctx.save();const tw=ctx.measureText(txt).width+fs*1.2,ty=oy+H0*scale-fs*4.2;ctx.fillStyle='rgba(14,16,24,.65)';ctx.fillRect(ox+6,ty,tw,fs*1.6);ctx.fillStyle=SCARF;ctx.fillText(txt,ox+6+fs*.6,ty+fs*.3);ctx.restore();   // just above the room's hint line (the top left carries the landmark title)
};
CO.state=()=>CO;CO.host=host;CO.join=join;CO.leave=leave;
root.BladefallClimbCoop=CO;
})(typeof window!=='undefined'?window:globalThis);
