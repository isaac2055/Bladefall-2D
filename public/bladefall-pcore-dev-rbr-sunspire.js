/* Sunspire's King: routed light on the far side opens his gold. Two blooms per hour, three checkpointed rooms.
   The garden handles permanently close each room's sun-window; the flowers can finally open.

   7.280 (Isaac: "the bosses are a bit too easy/simple"). Opt-in fields; a room without them plays the old fight.
   On the room's dayKing:
    need   blooms before he yields (default 2).
    beat   [frames, ...] the glove's period after 0, 1, 2 ... blooms. With it the glove keeps its own clock, which
           restarts at each bloom: a 24-frame tell, then the 8-frame sweep, landing at period-60. (Without it: the
           old 150-frame beat on the room clock.)
    wave   (any of need/beat/wave/suns works alone) from this many blooms on, each sweep also sends a sun-wave along the floor away from him on your side:
           8 px tall, on the floor he stands on, 150 px/s, gone at rock or where that floor ends. A ground
           attack that stays on the floor; jump it.
    suns   [{c,r,dir}, ...] the window that throws the sunlight after 0, 1, 2 ... blooms (suns[0] is the room's
           beam). Each bloom turns the hour: the light goes out for `dark` frames (default 36) while the next
           window glows and its line is drawn, then that window lights. Your door now catches nothing; find
           where the new sun can be caught and open your end there.
    shrug  (Fractured) true: he will not be held or stood on: a knight holding his side or standing on him is
           shoved off (no harm).
    ripen  (Fractured) frames: his gold opens only after the routed light has lain on the same side this long.
    guard  (Fractured, needs beat) px: a knight standing on the floor this close to him starts the glove's tell at
           once (the sweep follows 24 frames later); jump in and strike from the air.
   On the room's hydraRide (true = the old boarding; an object = the King's last light):
    shafts [c, ...] columns where sunlight falls from the ceiling, burning down to whatever stops it.
    heads  [{at, w, up, down, phase}] the hydra's heads, `at` tiles along her back, `w` tiles wide (default 2), held three
           tiles above it while up (they shade the shaft) and dipped into the sea while down, on the deck's clock.
           A head shakes for its last 20 frames up. Stand under a raised head as each shaft crosses her back. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
const HR=Object.freeze({headW:16,headH:8,lift:26,tell:20,waveV:2.5,waveW:6,waveH:8,dark:36});
const alive=p=>p.state!=='dead'&&p.state!=='respawn';
function eachPlayer(g,fn){const p=g.p,a=g.coopActor;try{for(const [i,k]of (g.players||[p]).entries()){g.p=k;if(g.players)g.coopActor=i;fn(k);}}finally{g.p=p;g.coopActor=a;}}
function reset(g){const d=g.room.def;g.dayKing=d.dayKing?{...d.dayKing,x:d.dayKing.c*8,y:(d.dayKing.r+1)*8-24,w:14,h:24,type:'dayKing',dev:true,solid:true,id:'dayking',hits:0,t:0,hurt:0,yielded:false,litSide:0,ripeT:0,ripeSide:0}:null;
 if(g.dayKing){g.ents.push(g.dayKing);for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
  const k=g.dayKing;if(k.beat||k.wave!=null||k.suns){k.gt=0;k.waves=[];k.sunT=0;k.sunNext=null;}}
 g.gardenShade=d.gardenShade?{...d.gardenShade,done:false}:null;
 const h=d.hydraRide;g.hydraLight=h&&typeof h==='object'&&h.shafts?{shafts:h.shafts.slice(),heads:(h.heads||[]).map(q=>({...q,upNow:true,y:0,x:0})),bands:[]}:null;
}
/* The glove's state this frame: 'tell', 'sweep' or '' (shared with the view). */
function glovePhase(k){
 if(!k.beat){const ph=k.t%150;return ph>=90&&ph<98?'sweep':ph>=65&&ph<90?'tell':'';}
 const P=k.beat[Math.min(k.hits,k.beat.length-1)],ph=k.gt%P,at=Math.max(24,P-60);
 return ph>=at&&ph<at+8?'sweep':ph>=at-24&&ph<at?'tell':'';
}
function gloveStart(k){if(!k.beat)return k.t%150===90;const P=k.beat[Math.min(k.hits,k.beat.length-1)];return k.gt%P===Math.max(24,P-60);}
function deckOf(g){return g.ents.find(e=>e.type==='deck');}
function headBox(g,q,dk){const up=q.upNow;return {x:dk.x+q.at*8,y:up?dk.y-HR.lift:dk.y+dk.h+4,w:(q.w||2)*8,h:HR.headH,up};}
function headUp(q,clock){const P=q.up+q.down;return ((clock+(q.phase||0))%P+P)%P<q.up;}
function headTell(q,clock){const P=q.up+q.down,u=((clock+(q.phase||0))%P+P)%P;return u<q.up&&u>=q.up-HR.tell;}
function before(g){const k=g.dayKing;if(k&&!k.yielded&&g.awake){k.t++;if(k.hurt>0)k.hurt--;if(k.beat)k.gt++;}}
function worldAfter(g){const Core=C(),p=g.p,k=g.dayKing,s=g.gardenShade,L=g.hydraLight;
 if(s&&!s.done){const stones=g.ents.filter(e=>e.type==='stone');if(stones.length&&stones.every(e=>e.lit)){s.done=true;if(g.beams){g.beams.emit=[];g.beams.paths=[];}Core.emit(g,'garden-shade',{x:s.c*8,y:s.r*8});}}
 if(L)hydraLight(g,L);
 if(!k||k.yielded||!(g.players||[p]).some(alive))return;
 // The hour turning: the next window glows, then lights.
 if(k.sunNext&&--k.sunT<=0){if(g.beams)g.beams.emit=[{c:k.sunNext.c,r:k.sunNext.r,dir:k.sunNext.dir}];Core.emit(g,'dayking-sun',{x:k.sunNext.c*8+4,y:k.sunNext.r*8+4});k.sunNext=null;}
 k.litSide=0;
 // Only segments beyond a complete portal pair count; direct windows cannot open the King's gold.
 if(g.portals?.blue&&g.portals?.orange)for(const [x0,y0,x1,y1]of (g.beams?.paths||[]).slice(1)){
  if(Math.abs(y0-y1)>1||y0<k.y||y0>k.y+k.h)continue;
  if(x0<k.x&&Math.abs(x1-k.x)<3)k.litSide=-1;
  if(x0>k.x+k.w&&Math.abs(x1-(k.x+k.w))<3)k.litSide=1;
 }
 // 7.280 Fractured (opt-in `ripen`, frames): the gold opens only once the light has lain on the same side that long.
 if(k.ripen){const raw=k.litSide;if(raw&&raw===k.ripeSide)k.ripeT++;else{k.ripeSide=raw;k.ripeT=raw?1:0;}
  if(k.ripeT<k.ripen)k.litSide=0;else if(k.ripeT===k.ripen)Core.emit(g,'dayking-ripe',{x:k.x+7,y:k.y+8});}
}
function actorAfter(g,phase='all'){const Core=C(),p=g.p,k=g.dayKing;if(!k||k.yielded||!alive(p))return;
 const side=p.x+p.w/2>=k.x+k.w/2?1:-1,open=k.litSide===-side,need=k.need||2;
 if(phase!=='hurt'&&p.strikeTimer>0&&!p.strikeHit.has(k.id)&&Core.overlap(...Core.strikeBox(p),k.x,k.y,k.w,k.h)){
  p.strikeHit.add(k.id);if(open&&!k.hurt){k.hits++;k.hurt=40;Core.emit(g,'dayking-bloom',{x:k.x+7,y:k.y+8});if(k.hits>=need){k.yielded=true;g.beams.emit=[];g.beams.paths=[];if(k.waves)k.waves.length=0;Core.emit(g,'dayking-yield',{x:k.x+7,y:k.y});}
   else{if(k.beat)k.gt=0;
    if(k.suns&&k.suns[k.hits]&&g.beams){k.sunNext=k.suns[k.hits];k.sunT=k.dark??HR.dark;g.beams.emit=[];g.beams.paths=[];Core.emit(g,'dayking-turn',{x:k.sunNext.c*8+4,y:k.sunNext.r*8+4});}}}
  else Core.emit(g,'guard-block',{x:k.x+7,y:k.y+8});
 }
 if(k.yielded||phase==='strike')return;
 // 7.280 Fractured (opt-in `shrug`): a knight holding his side or standing on him is shoved off, unharmed.
 if(k.shrug){const onSide=p.state==='climb'&&p.y<k.y+k.h&&p.y+p.h>k.y&&(Math.abs(p.x+p.w-k.x)<1||Math.abs(p.x-(k.x+k.w))<1);
  const onTop=p.onGround&&Math.abs(p.y+p.h-k.y)<1&&p.x<k.x+k.w&&p.x+p.w>k.x;
  if(onSide||onTop){const dir=p.x+p.w/2>=k.x+k.w/2?1:-1;p.state='normal';p.vx=dir*120;p.vy=Math.min(p.vy,-60);Core.emit(g,'dayking-shrug',{x:k.x+7,y:k.y});}}
 // 7.280 Fractured (opt-in `guard`, px; needs `beat`): a knight standing on the floor within `guard` px of him is
 // answered at once: the glove's clock jumps to its tell, so the sweep lands 24 frames later. Strike from the air.
 if(k.guard&&k.beat&&p.onGround&&glovePhase(k)===''&&(side>0?p.x-(k.x+k.w):k.x-(p.x+p.w))<=k.guard){
  const P=k.beat[Math.min(k.hits,k.beat.length-1)],at=Math.max(24,P-60);k.gt=Math.floor(k.gt/P)*P+at-24;Core.emit(g,'dayking-guard',{x:k.x+7,y:k.y+8});}
 if(glovePhase(k)==='sweep'){const x=side>0?k.x+k.w:k.x-34;if(Core.overlap(p.x,p.y,p.w,p.h,x,k.y+12,34,12))Core.kill(g,p,'glove');}
}
function wavesAfter(g){const Core=C(),k=g.dayKing;if(!k||k.yielded||!(g.players||[g.p]).some(alive))return;
 if(k.waves&&k.wave!=null&&k.hits>=k.wave&&gloveStart(k)){
  const sides=new Set((g.players||[g.p]).filter(alive).map(p=>p.x+p.w/2>=k.x+k.w/2?1:-1));
  for(const side of sides){k.waves.push({x:side>0?k.x+k.w+34-HR.waveW:k.x-34,y:k.y+k.h-HR.waveH,dir:side});Core.emit(g,'dayking-wave',{x:k.x+7,y:k.y+k.h});}
 }
 if(k.waves&&k.waves.length){
  for(const w of k.waves){w.x+=w.dir*HR.waveV;const lead=w.dir>0?w.x+HR.waveW:w.x;
   if(Core.solidAt(g,w.dir>0?w.x+HR.waveW-1:w.x,w.y,1,HR.waveH-1)||!Core.solidAt(g,lead-w.dir,w.y+HR.waveH,1,1)||lead<0||lead>(g.room.w||Core.W))w.gone=true;
   else eachPlayer(g,p=>{if(alive(p)&&Core.overlap(p.x,p.y,p.w,p.h,w.x,w.y,HR.waveW,HR.waveH))Core.kill(g,p,'sun-wave');});}
  k.waves=k.waves.filter(w=>!w.gone);
 }
}
/* The King's last light over the sea: shafts burn down to a raised head, the deck, or the water. */
function hydraLight(g,L){const Core=C(),dk=deckOf(g);L.bands=[];if(!dk)return;
 for(const q of L.heads){q.upNow=headUp(q,dk.clock);q.tell=headTell(q,dk.clock);const b=headBox(g,q,dk);q.x=b.x;q.y=b.y;q.pw=b.w;}
 for(const c of L.shafts){const x=c*8+4;let y1=g.room.h||Core.H;
  for(const q of L.heads)if(q.upNow&&x-1>=q.x&&x+1<=q.x+q.pw)y1=Math.min(y1,q.y);
  if(x+1>dk.x&&x-1<dk.x+dk.w)y1=Math.min(y1,dk.y);
  for(let r=1;r<Math.floor(y1/8);r++)if(Core.tileAt(g,c,r)===Core.SOLID){y1=r*8;break;}
  L.bands.push([x,8,y1]);
  eachPlayer(g,p=>{if(alive(p)&&Core.overlap(p.x,p.y,p.w,9,x-1,8,2,y1-8))Core.kill(g,p,'light');});
 }
}
function after(g){if(!g.players){worldAfter(g);actorAfter(g);wavesAfter(g);}}
function afterPlayers(g){worldAfter(g);eachPlayer(g,()=>actorAfter(g,'strike'));eachPlayer(g,()=>actorAfter(g,'hurt'));wavesAfter(g);}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-sunspire',reset,before,after,afterPlayers,gateHold:g=>!!(g.dayKing&&!g.dayKing.yielded)});
root.BladefallSunspire=Object.freeze({HR,glovePhase});
})(typeof window!=='undefined'?window:globalThis);
