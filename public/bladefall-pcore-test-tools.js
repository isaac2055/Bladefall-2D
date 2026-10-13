/* Temporary authoring aids, enabled only by the existing five-press test-mode switch. */
(function(root){'use strict';
let api=null,flag=null,pan=null,drag=null,bar=null,note='',lastRefresh='';
const excluded=new Set(['defs','rooms','spikeSafe','events']);
const enabled=()=>!!api?.enabled();
function resetCamera(){if(!api)return;api.view.camRoom=null;root.BladefallPitchView?.climb?.resetCamera?.();}
function stopDrag(){if(!drag)return;const id=drag.id;drag=null;try{api.view.canvas.releasePointerCapture(id);}catch{}}
function follow(){stopDrag();pan=null;resetCamera();api?.clearInput();refresh();}
function sync(){if(!api)return;const g=api.view.g;
 if(!enabled()||!g||api.view.mode!=='play'){stopDrag();if(flag||pan){flag=null;note='';follow();}refresh();return;}
 if(flag&&(flag.game!==g||flag.chapter!==api.view.chapter)){flag=null;note='';}
 if(pan&&(pan.game!==g||pan.room!==g.room.id))follow();
 if(drag&&drag.game!==g)stopDrag();
 refresh();
}
function canUse(){sync();return enabled()&&api.view.mode==='play'&&!!api.view.g&&!api.overlayOpen()&&!root.document?.querySelector('dialog[open]')&&!api.view.wipe;}
function tell(text){note=text;refresh();}
function invalidate(reason){root.BladefallClimbSession?.invalidate(reason);const st=root.BladefallPitchView?.climb?.state?.();if(st)st.perfectRun=false;}
function place(){if(!canUse())return false;const g=api.view.g;
 if(['dead','respawn'].includes(g.p.state)||g.exited){tell('Place a flag while the knight is alive.');return false;}
 try{
  const state=Object.fromEntries(Object.entries(g).filter(([key,value])=>!excluded.has(key)&&typeof value!=='function'));
  // One graph clone keeps carried items and device references connected to their entities.
  flag={game:g,room:g.room.id,chapter:api.view.chapter,roomTimer:api.view.roomTimer,state:root.structuredClone(state),spikeSafe:g.spikeSafe,context:root.BladefallPitchView?.climb?.captureTestCheckpoint?.()};
  invalidate('manual test checkpoint');tell('Flag placed · R / Retry restores this scene.');return true;
 }catch{tell('Could not capture this scene; the previous flag is unchanged.');return false;}
}
function restore(){sync();const g=api?.view.g;if(!enabled()||!flag||flag.game!==g||flag.chapter!==api.view.chapter)return false;
 const state=root.structuredClone(flag.state),keep={defs:g.defs,rooms:g.rooms,deaths:g.deaths,roomDeaths:g.roomDeaths,assist:g.assist};
 for(const key of Object.keys(g))if(!Object.hasOwn(keep,key))delete g[key];
 Object.assign(g,state,keep,{spikeSafe:flag.spikeSafe,events:[]});
 root.BladefallPitchView?.climb?.restoreTestCheckpoint?.(flag.context);api.view.roomTimer=flag.roomTimer;api.view.frameAcc=0;
 api.view.wipe=0;api.view.wipeTo=null;api.view.parts=[];api.view.deathAt=null;api.view.flash=0;api.view.shake={x:0,y:0,t:0,mag:0};
 follow();invalidate('manual test checkpoint');tell('Returned to test flag.');return true;
}
function clearFlag(){flag=null;tell('Flag cleared · Retry uses the normal checkpoint.');}
function camera(g,view){sync();if(!pan||pan.game!==g)return false;view.cam.x=pan.x;view.cam.y=pan.y;view.camRoom=g.room.id;return true;}
function inspecting(){sync();return !!pan;}
function limits(){const g=api.view.g,world=root.BladefallPitchView?.climb?.testCameraBounds?.();return world||{x:0,y:0,w:g.room.w,h:g.room.h};}
function move(e){if(!drag||e.pointerId!==drag.id)return;if(!canUse()){stopDrag();refresh();return;}const view=api.view;
 if(!pan){if(Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)<3)return;pan={game:view.g,room:view.g.room.id,x:view.cam.x,y:view.cam.y};drag.x=pan.x;drag.y=pan.y;api.clearInput();invalidate('test camera inspection');note='Camera inspection · scene held still';}
 const b=limits(),w=view.viewportW,h=view.viewportH,mx=w/4,my=h/4;
 const minX=b.x-mx,maxX=Math.max(minX,b.x+b.w-w+mx),minY=b.y-my,maxY=Math.max(minY,b.y+b.h-h+my);
 pan.x=Math.max(minX,Math.min(maxX,drag.x-(e.clientX-drag.clientX)*drag.ratio));
 pan.y=Math.max(minY,Math.min(maxY,drag.y-(e.clientY-drag.clientY)*drag.ratio));
 e.preventDefault();refresh();
}
function down(e){if(e.pointerType!=='mouse'||e.button!==0||!canUse()||api.view.paused||api.view.replay)return;
 const view=api.view,g=view.g,rect=view.canvas.getBoundingClientRect();
 drag={game:g,id:e.pointerId,clientX:e.clientX,clientY:e.clientY,x:pan?.x??view.cam.x,y:pan?.y??view.cam.y,ratio:(view.canvas.width/Math.max(1,rect.width))/Math.max(1,view.scale)};
 try{view.canvas.setPointerCapture(e.pointerId);}catch{}
 e.preventDefault();refresh();
}
function up(e){if(!drag||e.pointerId!==drag.id)return;stopDrag();refresh();}
function refresh(){if(!bar)return;const view=api.view,active=enabled()&&view.mode==='play'&&!!view.g&&!api.overlayOpen()&&!root.document.querySelector('dialog[open]');
 const signature=[active,note,!!pan,!!flag,!!drag].join('|');if(signature===lastRefresh)return;lastRefresh=signature;
 bar.hidden=!active;bar.querySelector('[data-note]').textContent=note||'I · place test flag   R · retry   Mouse drag · inspect';
 bar.querySelector('[data-follow]').hidden=!pan;bar.querySelector('[data-clear]').hidden=!flag;
 view.canvas.style.cursor=active?(drag?'grabbing':'grab'):'';
}
function init(options){api=options;if(bar)return;
 const style=document.createElement('style');style.textContent='#pcTestTools{position:fixed;z-index:24;left:8px;bottom:8px;max-width:calc(100vw - 24px);display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px;background:#111b27e8;color:#c8e6f0;border:1px solid #608598;border-radius:5px;font:12px system-ui}#pcTestTools[hidden],#pcTestTools [hidden]{display:none}#pcTestTools button{font:inherit;background:#203349;color:#e2eff4;border:1px solid #7595a3;border-radius:3px;padding:4px 8px;cursor:pointer}';document.head.appendChild(style);
 bar=document.createElement('div');bar.id='pcTestTools';bar.hidden=true;bar.innerHTML='<span data-note role="status"></span><button type="button" data-follow>Follow knight · resume</button><button type="button" data-clear>Clear test flag</button>';document.body.appendChild(bar);
 bar.querySelector('[data-follow]').onclick=follow;bar.querySelector('[data-clear]').onclick=clearFlag;
 const canvas=api.view.canvas;canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',()=>{drag=null;refresh();});root.addEventListener('blur',stopDrag);
 refresh();
}
function draw(b,g){sync();if(!enabled()||!flag||flag.room!==g.room.id)return;const p=flag.state.p,x=Math.round(p.x+4),y=Math.round(flag.state.flipped===g.flipped?p.y+p.h:g.room.h-p.y);
 b.fillStyle='#112938';b.fillRect(x-2,y-23,3,23);b.fillStyle='#e2f5ff';b.fillRect(x-1,y-22,1,22);b.fillStyle='#6ed2eb';b.fillRect(x,y-22,11,7);b.fillRect(x,y-15,7,2);b.fillStyle='#162c42';b.fillRect(x+4,y-21,1,5);b.fillRect(x+3,y-21,3,1);b.fillRect(x+3,y-17,3,1);b.fillStyle='#b6e9f2';b.fillRect(x-4,y-1,8,1);
}
root.BladefallPrecisionTestTools={init,place,restore,clearFlag,follow,camera,inspecting,sync,draw,state:()=>({flag:flag?{room:flag.room,x:flag.state.p.x,y:flag.state.p.y}:null,pan:pan?{x:pan.x,y:pan.y}:null})};
})(globalThis);
