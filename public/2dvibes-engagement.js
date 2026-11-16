// Local input state only. No key, pointer or controller values leave this helper.
(()=>{window.dvCreateEngagement=(target,doc=document,view=window,onFirst=()=>{})=>{
 const keys=new Set(),pointers=new Set();let last=-Infinity,first=false;
 const visible=()=>!doc.hidden&&(!doc.hasFocus||doc.hasFocus());
 const mark=()=>{last=performance.now();if(!first){first=true;onFirst();}};
 const reset=()=>{keys.clear();pointers.clear();last=-Infinity;};
 target.addEventListener('keydown',e=>{if(!e.isTrusted||!visible())return;keys.add(e.code);mark();},{passive:true});
 target.addEventListener('pointerdown',e=>{if(!e.isTrusted||!visible())return;pointers.add(e.pointerId);mark();},{passive:true});
 target.addEventListener('touchstart',e=>{if(e.isTrusted&&visible())mark();},{passive:true});
 doc.addEventListener('keyup',e=>{if(e.isTrusted)keys.delete(e.code);},{passive:true});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])doc.addEventListener(event,e=>{if(e.isTrusted)pointers.delete(e.pointerId);},{passive:true});
 doc.addEventListener('visibilitychange',reset);view.addEventListener('blur',reset);
 return {reset,active(){if(!visible()){reset();return false;}let controller=false;try{controller=Array.from(view.navigator?.getGamepads?.()||[]).some(p=>p?.connected&&(p.buttons.some(b=>b.pressed)||p.axes.some(a=>Math.abs(a)>.25)));}catch{/* Unsupported or policy-blocked gamepads do not affect play. */}
 if(keys.size||pointers.size||controller)mark();return performance.now()-last<15000;}};
};})();
