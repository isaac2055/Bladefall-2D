/* Screen-resolution text; the world remains visible behind each conversation. */
(function(root){
  'use strict';
  const VOICES={
    mara:[["Leave it with me.", "Good. Get right up close—I can’t chart what you squinted at from across the road. Take the high ground slowly; a late reading beats a broken leg."]],
    vey:[["That bandage needs changing.", "It does. Most days it’s just me and whatever I’m minding, and you stop noticing yourself. Hand me that roll, then."]],
    olan:[["How many in a patrol?", "Four, and the last one always dawdles. Can’t run like I used to, but I can still count."]],
    bram:[["We’ll take it slow.", "Thanks! Just let me get my feet under me before the next bend, right? If I drop her, we’re both in the dark."]],
    orra:[["That watch means a lot to you.", "My daughter gave it me. Kept good time for years—well, good enough. I’m not throwing it away because this wood’s got strange ideas."]],
    pell:[["Thanks. I’d have missed that.", "Everyone does, first time. I did—straight into a nettle patch. Started checking the resin after that, I can tell you."]],
    hale:[["Can I help with your shoulder?", "No. Rest’ll do more than pulling on it. Get that sword loose—that’s help enough."]],
    oren:[['You can hear it breaking?','Before it breaks. Every chain hums a little flat a day ahead. Let’s get us both through this one.']],
    sable:[['You look like you haven’t slept.','I haven’t. The water won’t wait for me to rest, and neither will they. Sit where I can see you; it steadies me.']],
    talla:[['That’s careful work.','Has to be. Wind finds every lazy stitch, and it finds it at the worst height.']],
    edrin:[['Who taught you to read rain?','The gutters did. A little water goes a long way if you watch where it wants to run, you see.']],
    senn:[['Thanks for the warning.','I’d rather mend cloth than people. Cloth doesn’t argue.']],
    veya:[['Is that fire yours?','Mine to feed. It’s the only thing in this place that still works, so I don’t let it go out.']],
    nim:[['I’ll stay with you.','Good. Then I can keep the flame out of the wind. That’s my job. Yours is the walking.']],
    daro:[['Is this your mark on the hinge?','It is. Means I made it and I stand behind it. I’d settle for it being used properly.']]
  };
  function voice(name){const key=String(name||'').trim().toLowerCase().split(/[ ·,]/)[0];return VOICES[key]||null;}
  /* ── THE CUT-IN (2026-09-27). A framed box at the top of the screen, a talking portrait on the speaker's side
     (the knight on the left, everyone else on the right), the line typed out, and the world still visible below —
     eased a little closer and letterboxed while the conversation lasts. Faces: bladefall-portraits.js.
     Contract kept: show({title,text,accent,choices,onClose}) and close(); choice actions still receive {body,close};
     the full line is in the DOM from the first frame (only its unrevealed part is transparent), so a reader or a
     test sees the whole text at once. Optional: speaker, portrait (id, or null for none), side ('left'|'right'),
     mood, and lines: [{text, speaker|portrait, side, mood}] for several beats. */
  let panel=null,finish=null,previousFocus=null,pendingReply=null,loop=0,view=null;
  const RATE=48,KNIGHT_NAME='The Knight';
  const css=`#fieldConversation{position:fixed;z-index:90;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(1000px,calc(100vw - 24px));max-height:62vh;overflow:auto;touch-action:pan-y;overscroll-behavior:contain;box-sizing:border-box;padding:16px 20px;background:#110f18f2;border:2px solid #d8ccb0;outline:2px solid #110f18;box-shadow:inset 0 0 0 2px #3a3444,inset 0 0 0 3px var(--voice,#c9baa0),0 8px 30px #000a;color:#eee8dc;font:21px/1.45 system-ui,sans-serif;text-shadow:none;filter:none;cursor:pointer}
#fieldConversation .bfc-row{display:flex;gap:18px;align-items:flex-start}#fieldConversation .bfc-main{flex:1;min-width:0;position:relative}
#fieldConversation .bfc-face{flex:none;width:var(--face,144px);height:var(--face,144px);border:2px solid #d8ccb0;outline:2px solid #110f18;box-shadow:inset 0 0 0 2px var(--voice,#c9baa0);background:#15131c;order:0}
#fieldConversation .bfc-face.bfc-right{order:2}#fieldConversation .bfc-face canvas{display:block;width:100%;height:100%;image-rendering:pixelated}
#fieldConversation .bfc-c{position:absolute;width:9px;height:9px;background:#d8ccb0;transform:rotate(45deg);box-shadow:0 0 0 2px #110f18;pointer-events:none}
#fieldConversation .bfc-c::after{content:'';position:absolute;inset:3px;background:var(--voice,#c9baa0)}
#fieldConversation .bfc-tl{top:1px;left:1px}#fieldConversation .bfc-tr{top:1px;right:1px}#fieldConversation .bfc-bl{bottom:1px;left:1px}#fieldConversation .bfc-br{bottom:1px;right:1px}
#fieldConversation h2{font:700 14px/1.3 system-ui,sans-serif;letter-spacing:.12em;color:var(--voice,#c9baa0);margin:2px 0 8px;text-transform:uppercase}#fieldConversation.bfc-rightspeaker h2{text-align:right}
#fieldConversation p{margin:0 0 10px;white-space:pre-line;min-height:2.9em}#fieldConversation .bfc-rest{color:transparent}
#fieldConversation .bfc-more{display:block;margin:0 0 0 auto;width:auto;min-width:44px;background:none;border:0;color:#d8ccb0;font:16px/1 system-ui,sans-serif;padding:6px 8px;text-align:center;animation:bfcBob 1s ease-in-out infinite}
#fieldConversation button{display:block;width:100%;background:#242735;color:#f1eadd;border:1px solid #555360;padding:9px 14px;margin:7px 0 0;text-align:left;font:18px/1.4 system-ui,sans-serif;cursor:pointer}
#fieldConversation button:hover,#fieldConversation button:focus-visible{background:#363949;outline:2px solid #bdb29b;outline-offset:1px}
#fieldConversation.bfc-typing .bfc-choices button{opacity:.32}#fieldConversation .bfc-choices.bfc-hidden{display:none}
@keyframes bfcBob{50%{transform:translateY(3px)}}
.bfc-bar{position:fixed;left:0;right:0;height:0;background:#07060b;z-index:8;pointer-events:none;transition:height .4s ease}.bfc-bar.bfc-on{height:5.5vh}.bfc-bar.bfc-top{top:0}.bfc-bar.bfc-bottom{bottom:0}
#gameContainer.bfc-zoom canvas{image-rendering:pixelated}
@media(max-width:600px){#fieldConversation{font-size:18px;padding:12px 14px}#fieldConversation button{font-size:16px}}
@media(max-height:500px){#fieldConversation{top:max(6px,env(safe-area-inset-top));max-height:calc(100vh - 14px);font-size:15px;line-height:1.3;padding:8px 12px}#fieldConversation .bfc-row{gap:10px}#fieldConversation h2{font-size:11px;margin:0 0 3px}#fieldConversation p{min-height:0;margin:0 0 5px}#fieldConversation .bfc-choices{display:grid;grid-template-columns:1fr 1fr;gap:4px 6px}#fieldConversation .bfc-choices.bfc-hidden{display:none}#fieldConversation .bfc-choices button{font-size:13px;line-height:1.25;padding:5px 8px;margin:0}#fieldConversation .bfc-more{padding:2px 6px}}
@media(prefers-reduced-motion:reduce){#fieldConversation .bfc-more{animation:none}.bfc-bar{transition:none}}`;
  const reduced=()=>{try{if(typeof meta!=='undefined'&&meta&&meta.reducedMotion)return true;}catch(_e){}return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);};
  const faces=()=>root.BladefallPortraits||null;
  function faceSize(){const h=innerHeight,w=innerWidth;return h<500?64:(h<700||w<800)?96:144;}

  /* ── The camera: the world leans in toward the speaker, with bars top and bottom ─────────────────────── */
  const cam={release:0};
  function worldG(){try{return typeof G!=='undefined'?G:null;}catch(_e){return null;}}
  function speakerObject(id){
    const g=worldG(),A=root.BladefallResidentArt;if(!g||!g.p)return null;
    const pool=[...(g.obstacles||[]),...(g.npcs||[])],near=o=>Math.abs(o.x-g.p.x)<420&&Math.abs((o.y||0)-(g.p.y||0))<260&&!o.gone;
    const kind=o=>A&&A.designFor?A.designFor(o):null,person=o=>kind(o)||o.type==='shop'||o.type==='actOren'||o.type==='sideStoryActor';
    const best=list=>list.sort((a,b)=>Math.abs(a.x-g.p.x)-Math.abs(b.x-g.p.x))[0]||null;
    return best(pool.filter(o=>near(o)&&id&&kind(o)===id))||best(pool.filter(o=>near(o)&&person(o)));
  }
  /* In the container's own (unzoomed) layout pixels, so a re-show mid-zoom measures the same world. */
  function localPoint(box,wx,wy){
    try{const c=box.querySelector('canvas');if(!c)return null;const cw=c.offsetWidth,ch=c.offsetHeight;
      return {x:(box.offsetWidth-cw)/2+(wx-G.cam)*cw/VW,y:(box.offsetHeight-ch)/2+(GROUND_Y+(G.camY||0)-wy)*ch/VH};}catch(_e){return null;}
  }
  function bars(on){
    for(const side of ['top','bottom']){let b=document.getElementById('bfcBar-'+side);
      if(!b&&on){b=document.createElement('div');b.id='bfcBar-'+side;b.className='bfc-bar bfc-'+side;document.body.append(b);void b.offsetHeight;}
      if(b)b.classList.toggle('bfc-on',!!on);}
  }
  /* Scale 1.16 about the container's corner, then slide so the pair (weighted to the speaker) sits in the clear
     band between the box's foot and the bottom bar — never uncovering an edge of the world. */
  function cameraOn(id,boxBottom){
    clearTimeout(cam.release);const box=document.getElementById('gameContainer'),g=worldG();if(!box||!g||!g.p||reduced())return;
    const o=speakerObject(id),sx=o?o.x:g.p.x,sy=o?(o.y||0):(g.p.y||0);
    const pt=localPoint(box,g.p.x*.4+sx*.6,Math.max(g.p.y||0,sy)+22);if(!pt)return;
    const S=1.16,W=box.offsetWidth,H=box.offsetHeight,px=pt.x,py=pt.y;
    const band=Math.max(0,(boxBottom||0)-box.offsetTop),ty0=(band+H*(1-.055))/2+H*.06;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),tx=clamp(-(S-1)*px,W*(1-S),0),ty=clamp(ty0-S*py,H*(1-S),0);
    bars(true);box.classList.add('bfc-zoom');box.style.transformOrigin='0 0';
    box.style.transition='transform .45s cubic-bezier(.2,.7,.25,1)';box.style.transform='translate('+Math.round(tx)+'px,'+Math.round(ty)+'px) scale('+S+')';
  }
  function cameraOff(){
    clearTimeout(cam.release);
    cam.release=setTimeout(()=>{const box=document.getElementById('gameContainer');bars(false);if(!box)return;
      box.style.transform='translate(0px,0px) scale(1)';cam.release=setTimeout(()=>{if(panel)return;box.style.transform='';box.style.transition='';box.style.transformOrigin='';box.classList.remove('bfc-zoom');},480);},40);
  }

  /* ── Beats: who speaks, which side, what they say ────────────────────────────────────────────────────── */
  function beat(b,fallbackTitle,accent){
    const P=faces(),id=b.portrait!==undefined?b.portrait:(P?P.resolve(b.speaker||fallbackTitle):null);
    const face=id&&P&&P.has(id)?id:null,side=b.side||(face==='knight'?'left':'right');
    const name=face==='knight'&&!b.speaker&&!(fallbackTitle&&b.portrait===undefined)?KNIGHT_NAME:(b.speaker||fallbackTitle||'Traveler');
    return {face,side,name,text:String(b.text==null?'':b.text),accent:b.accent||accent,mood:b.mood||(P&&P.mood?P.mood(b.text):'neutral')};
  }

  function close(){if(!panel)return;cancelAnimationFrame(loop);panel.remove();panel=null;view=null;cameraOff();const done=finish;finish=null;if(previousFocus&&previousFocus.isConnected)previousFocus.focus();if(done)done();}
  // Escape also works after clicking the world and moving focus off the panel; Enter/Space still advance a line.
  window.addEventListener('keydown',e=>{
    if(!panel)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}
    if(!panel.contains(document.activeElement)&&(e.key==='Enter'||e.key===' ')&&view&&!view.choicesLive()){e.preventDefault();e.stopImmediatePropagation();view.press();}
  },true);

  function show({title,text,accent,choices,onClose,speaker,portrait,side,lines,mood}={}){
    if(root.BladefallText){const T=root.BladefallText;title=T.applyPlain(title);text=T.applyPlain(text);speaker=T.applyPlain(speaker);if(Array.isArray(lines))lines=lines.map(l=>typeof l==='string'?T.applyPlain(l):l&&Object.assign({},l,{text:T.applyPlain(l.text)},l.speaker?{speaker:T.applyPlain(l.speaker)}:null));if(choices)choices=choices.map(c=>Object.assign({},c,{label:T.applyPlain(c.label)}));}   // Dialogue Editor edits (BladefallText): keep this one line at the top of show()
    const reply=pendingReply;pendingReply=null;
    close();
    if(!document.getElementById('fieldConversationStyle')){const style=document.createElement('style');style.id='fieldConversationStyle';style.textContent=css;document.head.append(style);}
    const beats=(Array.isArray(lines)&&lines.length?lines.map(l=>typeof l==='string'?{text:l}:l):[{text,speaker,portrait,side,mood}]).map(b=>beat(b,title,accent));
    if(reply&&beats[0].face&&beats[0].face!=='knight')beats.unshift(beat({text:reply,portrait:'knight',side:'left'},null,'#9ff4ff'));
    const person=beats.some(b=>b.face&&b.face!=='knight');
    previousFocus=document.activeElement;finish=onClose;panel=document.createElement('section');panel.id='fieldConversation';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','fieldSpeaker');panel.tabIndex=-1;
    panel.style.setProperty('--voice',accent||'#c9baa0');panel.style.setProperty('--face',faceSize()+'px');
    for(const c of ['tl','tr','bl','br']){const d=document.createElement('span');d.className='bfc-c bfc-'+c;d.setAttribute('aria-hidden','true');panel.append(d);}
    const row=document.createElement('div');row.className='bfc-row';panel.append(row);
    const faceBox=document.createElement('div');faceBox.className='bfc-face';faceBox.setAttribute('aria-hidden','true');
    const canvas=document.createElement('canvas');canvas.width=canvas.height=48;faceBox.append(canvas);const fctx=canvas.getContext('2d');
    const main=document.createElement('div');main.className='bfc-main';row.append(faceBox,main);
    const heading=document.createElement('h2');heading.id='fieldSpeaker';main.append(heading);
    const body=document.createElement('p');const shown=document.createElement('span'),rest=document.createElement('span');rest.className='bfc-rest';body.append(shown,rest);main.append(body);
    const list=document.createElement('div');list.className='bfc-choices';main.append(list);
    const more=document.createElement('button');more.className='bfc-more';more.textContent='▼';more.setAttribute('aria-label','Continue');main.append(more);   // after the choices: the first button is always a choice
    const fine=typeof G!=='undefined'&&G?.stageIndex<2&&innerHeight<500;
    for(const choice of choices||[{label:'Continue',action:close}]){const button=document.createElement('button');button.textContent=choice.label;if(fine)button.style.fontSize='15px';
      button.onclick=e=>{e.stopPropagation();const live=panel;pendingReply=person&&choices&&!/^(continue|got it)$/i.test(String(choice.label).trim())?String(choice.label):null;
        try{choice.action({body,close});}finally{pendingReply=null;}if(panel===live&&live)live.focus({preventScroll:true});};
      list.append(button);}

    // ── the reveal ──
    let at=0,count=0,hold=0,last=performance.now(),nextBlink=last+2600+Math.random()*1800,blinkUntil=0,drawn='';
    const instant=reduced();
    const cur=()=>beats[at],full=()=>count>=cur().text.length,final=()=>at===beats.length-1;
    function paint(now){
      const b=cur(),P=faces();if(!b.face||!P)return;
      const talking=!full()&&hold<=0,mouth=talking?[0,1,1,0,1,2,1,0][Math.floor(now/120)%8]:0;
      if(now>nextBlink){blinkUntil=now+130;nextBlink=now+2400+Math.random()*2200;}
      const blink=now<blinkUntil,yawn=!talking&&b.face&&/clerk|servicekeeper/.test(b.face)&&(now%9000)<900,key=b.face+mouth+blink+b.mood+yawn+((now/250)|0);
      if(key===drawn)return;drawn=key;P.draw(fctx,b.face,{t:now/1000,blink,mouth,mood:b.mood,yawn});
    }
    function layout(){
      const b=cur();heading.textContent=b.name;panel.style.setProperty('--voice',b.accent||accent||'#c9baa0');
      faceBox.style.display=b.face?'':'none';faceBox.classList.toggle('bfc-right',b.side==='right');panel.classList.toggle('bfc-rightspeaker',!!b.face&&b.side==='right');
      drawn='';paint(performance.now());
    }
    function sync(){
      const b=cur();shown.textContent=b.text.slice(0,count);rest.textContent=b.text.slice(count);
      const done=full();panel.classList.toggle('bfc-typing',!done);
      more.style.display=done&&!final()?'':'none';list.classList.toggle('bfc-hidden',!final());
    }
    let liveAt=0;
    function complete(){count=cur().text.length;hold=0;sync();if(final())liveAt=performance.now();if(final()&&panel&&panel.contains(document.activeElement))list.querySelector('button')?.focus({preventScroll:true});}
    function next(){if(final())return;at++;count=instant?cur().text.length:0;hold=0;layout();sync();if(final()&&full())liveAt=performance.now();if(final()&&full())list.querySelector('button')?.focus({preventScroll:true});}
    function press(){if(!full())complete();else if(!final())next();}
    view={press,choicesLive:()=>final()&&full()};
    function frame(now){
      if(!panel||view.press!==press)return;
      const dt=Math.min(.1,(now-last)/1000);last=now;const b=cur();
      if(!full()){
        if(hold>0)hold-=dt;
        else{const before=count;count=Math.min(b.text.length,count+dt*RATE);const whole=Math.floor(count);
          for(let i=Math.floor(before);i<whole;i++){const ch=b.text[i];const pause=/[.!?…]/.test(ch)&&b.text[i+1]!==ch?.32:/[,;:—–]/.test(ch)?.14:ch==='\n'?.3:0;if(pause&&i<b.text.length-1){count=i+1;hold=pause;break;}}
          count=Math.min(count,b.text.length);}
        const c=Math.floor(count);if(shown.textContent.length!==c)sync();if(full())complete();
      }
      paint(now);loop=requestAnimationFrame(frame);
    }
    more.onclick=e=>{e.stopPropagation();press();panel?.focus({preventScroll:true});};
    panel.addEventListener('click',()=>{if(!view||view.press!==press)return;press();});
    panel.addEventListener('keydown',e=>{
      // The game engine consumes Tab and arrows at window level. A dialog owns
      // its keys so keyboard navigation cannot move the knight or lose focus.
      e.stopPropagation();
      if(e.key==='Escape'){e.preventDefault();close();return;}
      if(!view.choicesLive()){
        if(e.repeat||['Shift','Control','Alt','Meta','Tab'].includes(e.key)){if(e.key==='Tab')e.preventDefault();return;}
        e.preventDefault();press();return;
      }
      if((e.key==='Enter'||e.key===' ')&&performance.now()-liveAt<280){e.preventDefault();return;}
      if(['Tab','ArrowDown','ArrowUp'].includes(e.key)){
        e.preventDefault();const buttons=[...list.querySelectorAll('button')];
        const step=e.key==='ArrowUp'||(e.key==='Tab'&&e.shiftKey)?-1:1;
        const index=buttons.indexOf(document.activeElement);
        buttons[(index+step+buttons.length)%buttons.length]?.focus();
      }else if((e.key==='Enter'||e.key===' ')&&!list.contains(document.activeElement)){e.preventDefault();list.querySelector('button')?.focus();}
    });
    // LittleJS cancels document-level touch events. Keep menu gestures local,
    // including scrolling long conversations without turning a swipe into a choice.
    let touchY=null,touchMoved=0;
    panel.addEventListener('touchstart',e=>{e.stopPropagation();touchY=e.touches[0]?.clientY??null;touchMoved=0;},{passive:true});
    panel.addEventListener('touchmove',e=>{e.stopPropagation();if(touchY===null)return;const y=e.touches[0]?.clientY;if(y==null)return;const dy=touchY-y;touchY=y;touchMoved+=Math.abs(dy);if(touchMoved>3){panel.scrollTop+=dy;e.preventDefault();}},{passive:false});
    panel.addEventListener('touchend',e=>{e.stopPropagation();if(touchMoved>3)e.preventDefault();touchY=null;},{passive:false});
    panel.addEventListener('touchcancel',e=>{e.stopPropagation();touchY=null;});
    panel.addEventListener('keyup',e=>{if(e.key===' '&&performance.now()-liveAt<280)e.preventDefault();});
    if(instant)count=cur().text.length;
    layout();sync();document.body.append(panel);
    if(final()&&full())list.querySelector('button').focus({preventScroll:true});else panel.focus({preventScroll:true});
    panel.scrollTop=0;
    if(person)cameraOn(beats.find(b=>b.face&&b.face!=='knight')?.face||null,panel.getBoundingClientRect().bottom);
    loop=requestAnimationFrame(frame);
  }
  root.BladefallConversation=Object.freeze({show,close,voice});
})(typeof globalThis!=='undefined'?globalThis:window);
