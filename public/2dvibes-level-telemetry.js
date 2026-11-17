// Read-only game-clock sampling. No key values, coordinates, saves or player names.
(function(root){
 root.dvCreateLevelTracker=api=>{
  let enabled=false,previous=null,current=null,pending=0;
  const uuid=()=>root.crypto.randomUUID();
  const play=uuid(),id=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,80}$/.test(v);
  const context=()=>({...current.context});
  const emit=(event,value=0,reason)=>{if(enabled&&current?.entered)api.emit(event,value,{...context(),...(reason?{reason}:{})});};
  function flush(){if(pending>0){emit('level_active',Math.min(30000,Math.round(pending)));pending=0;}}
  function enter(){if(!enabled||!current||current.entered)return;current.context.visit=uuid();current.entered=true;emit('level_enter');}
  function end(reason='exit'){flush();emit('level_exit',0,reason);if(current)current.entered=false;}
  function sample(s){
   if(!s||!id(String(s.level||''))||!id(String(s.chapter||''))||!id(String(s.attempt||''))||!Number.isFinite(s.ms)||s.ms<0||!Number.isInteger(s.deaths)||s.deaths<0||typeof s.playing!=='boolean')return;
   if(previous?.finished&&s.finished&&previous.attempt===s.attempt){previous={...s};return;}
   const build=String(api.build?.()||'unknown');if(!id(build))return;
   const key=[s.attempt,s.chapter,s.level,build].join('|');
   const changed=current?.key!==key;
   if(changed){
    if(current)end(previous?.attempt===s.attempt?'transition':'restart');
    current={key,entered:false,context:{level:String(s.level),chapter:String(s.chapter),attempt:String(s.attempt),build,play,visit:uuid()}};
   }
   if(enabled&&s.playing)enter();
   // No catch-up after consent, pauses, hidden tabs, room boundaries or long stalls.
   const advancing=previous&&previous.attempt===s.attempt&&s.ms>=previous.ms;
   const delta=advancing&&!changed?Math.min(1100,s.ms-previous.ms):0;
   const engaged=enabled&&s.playing&&api.engaged();
   if(engaged&&previous?.playing){
    pending+=delta;
    if(pending>=5000)flush();
    const deaths=advancing?Math.max(0,s.deaths-previous.deaths):0;
    if(deaths)emit('level_death',Math.min(100,deaths));
   }
   if(!s.playing)flush();
   if(s.finished){end('complete');current=null;}
   previous={...s};
  }
  return {sample,flush,end,setConsent(allow){enabled=allow===true;pending=0;previous=null;if(current)current.entered=false;},current:()=>current?.entered?context():null};
 };
})(typeof window==='undefined'?globalThis:window);
