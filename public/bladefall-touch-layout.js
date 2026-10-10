/* Shared, per-mode touch layout preferences. Coordinates are fractions of the visible screen. */
(function(root){'use strict';
const KEY='bladefall.touch-layout.v1',clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function read(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}}
function config(mode){return read()[mode]||{};}
function write(mode,next){const all=read();all[mode]=next;try{localStorage.setItem(KEY,JSON.stringify(all));}catch{}}
function resolve(mode,id,base,w=innerWidth,h=innerHeight){const v=config(mode)[id];if(!v)return {...base};const r=clamp((v.r||base.r/Math.min(w,h))*Math.min(w,h),18,Math.min(w,h)*.24);return {...base,x:clamp(v.x*w,r,w-r),y:clamp(v.y*h,r,h-r),r};}
function open({mode,items,onChange=()=>{},onClose=()=>{}}){
 document.getElementById('bfTouchEditor')?.remove();let selected=null,drag=null;
 const el=document.createElement('div');el.id='bfTouchEditor';el.setAttribute('role','dialog');el.setAttribute('aria-label','Adjust touch controls');
 el.style.cssText='position:fixed;inset:0;z-index:10000;background:#080c14ef;color:#fff;font:14px system-ui;touch-action:none;';
 el.innerHTML='<div style="position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:2;width:min(470px,92vw);padding:10px;border-radius:12px;background:#222936;text-align:center"><b>Drag a control to move it</b><br><label id="bfTouchSizeLabel">Select a control to resize <input id="bfTouchSize" aria-label="Selected control size" type="range" min="36" max="180" value="80" disabled style="width:140px;vertical-align:middle;touch-action:none"></label><br><button id="bfTouchReset">Reset layout</button> <button id="bfTouchDone">Done</button></div><div id="bfTouchPieces"></div>';
 for(const type of ['mousedown','mouseup','mousemove','keydown','keyup'])el.addEventListener(type,e=>e.stopPropagation());
 document.body.appendChild(el);const list=()=>typeof items==='function'?items():items,area=el.querySelector('#bfTouchPieces'),slider=el.querySelector('#bfTouchSize');
 function place(id,b){const n=config(mode);n[id]={x:b.x/innerWidth,y:b.y/innerHeight,r:b.r/Math.min(innerWidth,innerHeight)};write(mode,n);onChange();}
 function paint(){area.innerHTML='';for(const item of list()){const b=resolve(mode,item.id,item),node=document.createElement('button');node.type='button';node.dataset.control=item.id;node.textContent=item.label||item.id;node.style.cssText=`position:absolute;left:${b.x-b.r}px;top:${b.y-b.r}px;width:${b.r*2}px;height:${b.r*2}px;border-radius:50%;border:2px solid ${selected===item.id?'#ffd783':'#94a6c7'};color:white;background:#435575bb;touch-action:none;user-select:none;font-size:12px;`;area.appendChild(node);node.onpointerdown=e=>{e.preventDefault();e.stopPropagation();selected=item.id;drag={id:item.id,pointer:e.pointerId,dx:e.clientX-b.x,dy:e.clientY-b.y,b};slider.disabled=false;slider.value=Math.round(b.r*2);el.setPointerCapture(e.pointerId);paint();};}}
 el.onpointermove=e=>{if(!drag||e.pointerId!==drag.pointer)return;e.preventDefault();place(drag.id,{...drag.b,x:clamp(e.clientX-drag.dx,drag.b.r,innerWidth-drag.b.r),y:clamp(e.clientY-drag.dy,drag.b.r,innerHeight-drag.b.r)});paint();};
 const release=()=>{drag=null;};el.onpointerup=release;el.onpointercancel=release;
 slider.oninput=()=>{const base=list().find(x=>x.id===selected);if(!base)return;place(selected,{...resolve(mode,selected,base),r:+slider.value/2});paint();};
 el.querySelector('#bfTouchReset').onclick=()=>{write(mode,{});selected=null;slider.disabled=true;onChange();paint();};
 const resize=()=>paint();addEventListener('resize',resize);el.querySelector('#bfTouchDone').onclick=()=>{removeEventListener('resize',resize);el.remove();onChange();onClose();};paint();
}
function fullscreen(){try{if(root.parent!==root)return;const orientation=()=>screen.orientation?.lock?.('landscape').catch(()=>{});if(document.fullscreenElement||matchMedia('(display-mode: standalone),(display-mode: fullscreen)').matches){orientation();return;}document.documentElement.requestFullscreen?.({navigationUI:'hide'}).then(orientation).catch(()=>{});}catch{}}
root.BladefallTouchLayout=Object.freeze({config,resolve,open,fullscreen});
})(typeof window!=='undefined'?window:globalThis);
