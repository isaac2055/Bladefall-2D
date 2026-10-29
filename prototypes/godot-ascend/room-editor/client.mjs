import {clone,TERRAIN,TYPES,bounds,label,newObject,validate,paint,moveObject,resizeRoom,line} from './model.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],canvas=$('#canvas'),ctx=canvas.getContext('2d');
let doc,revision,token,roomIndex=0,selected=null,area=null,tool='select',brush='#',placement='Z',hover=null,gesture=null,space=false,busy=false,grid=true,clipboard=null;
let undo=[],redo=[],saved='',view={x:0,y:0,cell:18},toastTimer,draftTimer;
const draftKey='bladefall-room-editor-draft-v1';
const room=()=>doc.rooms[roomIndex],chosen=()=>selected==='goal'?{kind:'Goal',...room().goal}:room().objects.find(o=>o.id===selected);
const clean=d=>{const value=clone(d);delete value.revision;return value;};
const stringify=()=>JSON.stringify(doc),dirty=()=>doc&&stringify()!==saved;
const escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function toast(text,error=false){clearTimeout(toastTimer);const el=$('#toast');el.textContent=text;el.classList.toggle('error',error);el.hidden=false;toastTimer=setTimeout(()=>el.hidden=true,error?8500:4200);}
async function api(url,body){const response=await fetch(url,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json','X-Editor-Token':token},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not complete that action.');return result;}
function stash(){clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{if(dirty())localStorage.setItem(draftKey,JSON.stringify({doc,revision,time:new Date().toISOString()}));else localStorage.removeItem(draftKey);}catch{toast('Browser draft storage is full. Save or export a file to keep your changes.',true);}},150);}
function changed(before){if(before===stringify())return;undo.push(before);if(undo.length>100)undo.shift();redo=[];stash();refresh();}
function perform(fn){if(busy||!doc)return;const before=stringify();fn();changed(before);}
function undoEdit(direction){if(busy)return;cancelGesture();const source=direction==='undo'?undo:redo,target=direction==='undo'?redo:undo;if(!source.length)return;target.push(stringify());doc=JSON.parse(source.pop());selected=null;area=null;stash();refresh();}
function setTool(value){tool=value;area=null;$$('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===tool)));$$('[data-brush]').forEach(b=>b.setAttribute('aria-pressed',String(tool==='paint'&&brush===b.dataset.brush)));$$('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String(tool==='place'&&placement===b.dataset.object)));canvas.style.cursor=tool==='select'?'default':tool==='area'?'crosshair':tool==='pan'?'grab':'crosshair';render();}
function refresh(){
 if(!doc)return;
 $('#save-status').textContent=busy?'Saving native level…':dirty()?'● Unsaved changes':'● All changes saved';$('#save-status').classList.toggle('dirty',dirty());
 $('#save').disabled=busy||!dirty();$('#play').disabled=busy;$('#undo').disabled=busy||!undo.length;$('#redo').disabled=busy||!redo.length;
 const select=$('#rooms');select.replaceChildren(...doc.rooms.map((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${String(i+1).padStart(2,'0')} · ${r.name}`;return o;}));select.value=roomIndex;
 $('#room-title').textContent=room().name;$('#room-size').textContent=`${room().width} × ${room().height} squares · 1 square = 8 game pixels`;
 properties();issues();render();
}
function issues(){const errors=validate(doc),box=$('#issues');box.hidden=!errors.length;box.replaceChildren();if(errors.length){const strong=document.createElement('strong');strong.textContent='Before you save';box.append(strong);errors.slice(0,7).forEach(t=>{const p=document.createElement('p');p.textContent=t;box.append(p);});if(errors.length>7){const p=document.createElement('p');p.textContent=`…and ${errors.length-7} more`;box.append(p);}}return errors;}
function field(parent,title,value,onChange,{type='number',min=0,max=200,step=1,id=''}={}){const wrap=document.createElement('label');wrap.className='property-label';wrap.textContent=title;const input=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.value=value;if(id)input.id=id;if(type==='number'){input.min=min;input.max=max;input.step=step;}wrap.append(input);parent.append(wrap);input.addEventListener('change',()=>{if(type==='number'&&(!Number.isFinite(input.valueAsNumber)||!input.checkValidity())){input.value=value;toast('Use a number within the shown range.',true);return;}perform(()=>onChange(type==='number'?input.valueAsNumber:input.value));});return input;}
function pair(parent,title,values,onChange,names=['X','Y'],ids=[]){const titleEl=document.createElement('div');titleEl.className='property-label';titleEl.textContent=title;parent.append(titleEl);const p=document.createElement('div');p.className='pair';parent.append(p);values.forEach((v,i)=>field(p,names[i],v,value=>onChange(i,value),{id:ids[i],min:0,max:200}));}
function button(parent,text,callback,cls=''){const b=document.createElement('button');b.textContent=text;b.className=cls;b.addEventListener('click',callback);parent.append(b);return b;}
function properties(){
 const panel=$('#selection-properties');panel.replaceChildren();const o=chosen();
 if(o){const h=document.createElement('h2');h.textContent=label(o);panel.append(h);
  const tip=document.createElement('p');tip.textContent=o.kind==='Goal'?'Drag the flag to move the finish. Its line sits on top of the landing.':o.glyph==='Z'?'Drag the block to move it. Drag its circular handle to change the destination.':'Drag to move. Arrow keys nudge one square.';panel.append(tip);
  pair(panel,'Position · grid squares',[o.x,o.y],(i,value)=>{if(selected==='goal')room().goal[i?'y':'x']=value;else moveObject(chosen(),i?chosen().x:value,i?value:chosen().y);},['X','Y'],['object-x','object-y']);
  if(['Z','K','~','A','B','G'].includes(o.glyph))pair(panel,'Size · grid squares',[o.w,o.h],(i,value)=>chosen()[i?'h':'w']=Math.max(1,value),['Width','Height'],['object-width','object-height']);
  if(selected==='goal')field(panel,'Finish width · squares',o.w,v=>room().goal.w=v,{min:1,id:'goal-width'});
  if(o.glyph==='Z'){
   pair(panel,'Destination · grid squares',[o.targetX,o.targetY],(i,v)=>chosen()[i?'targetY':'targetX']=v,['X','Y'],['target-x','target-y']);
   field(panel,'Pause at destination · seconds',o.holdFrames/60,v=>chosen().holdFrames=Math.max(1,Math.round(v*60)),{min:1/60,max:60,step:'any',id:'hold-seconds'});
   field(panel,'Return trip · seconds',o.returnFrames/60,v=>chosen().returnFrames=Math.max(1,Math.round(v*60)),{min:1/60,max:60,step:'any',id:'return-seconds'});
   const note=document.createElement('p');note.className='muted small';note.textContent='The outward trip is always 0.5 seconds. Timing uses 60 frames per second.';panel.append(note);
  }
  if(o.glyph==='R'){field(panel,'Width · squares',o.w,v=>chosen().w=v,{min:1,max:200,id:'recoil-width'});field(panel,'Load depth · squares',o.depth,v=>chosen().depth=v,{min:1,max:12,id:'recoil-depth'});field(panel,'Load time · seconds',o.loadFrames/60,v=>chosen().loadFrames=Math.max(1,Math.round(v*60)),{min:1/60,max:60,step:'any',id:'recoil-load'});field(panel,'Release speed · pixels/second',o.releaseSpeed,v=>chosen().releaseSpeed=v,{min:1,max:300,id:'recoil-speed'});}
  if(o.glyph==='T'){field(panel,'Arm length · squares',o.length,v=>chosen().length=v,{min:2,max:40,id:'arm-length'});const label=document.createElement('label');label.className='property-label';label.textContent='Starting direction';const select=document.createElement('select');select.id='arm-direction';for(const dir of ['right','down','left','up']){const option=document.createElement('option');option.value=dir;option.textContent=dir;select.append(option);}select.value=o.dir;select.onchange=()=>perform(()=>chosen().dir=select.value);label.append(select);panel.append(label);const note=document.createElement('p');note.textContent='Position moves the brass hub. W strikes it clockwise. A blocked turn jams safely.';panel.append(note);}
  const actions=document.createElement('div');actions.className='selection-actions';panel.append(actions);
  if(o.kind!=='Spawn'&&o.kind!=='Goal')button(actions,'Duplicate',duplicate);
  if(o.kind!=='Goal')button(actions,'Delete',deleteSelection,'danger');
 }else if(area){const h=document.createElement('h2');h.textContent='Terrain selection';panel.append(h);const p=document.createElement('p');p.textContent=`${area.w} × ${area.h} squares. Drag the selection to move the terrain. Objects stay in place.`;panel.append(p);const a=document.createElement('div');a.className='selection-actions';panel.append(a);button(a,'Copy',copySelection);button(a,'Delete',deleteSelection,'danger');}
 else{panel.innerHTML='<h2>Nothing selected</h2><p>Click an object in the room to move it or change its settings.</p><p>To move ground, choose <b>Tiles</b> and drag a box around it.</p>';}
 const r=$('#room-properties');r.replaceChildren();const h=document.createElement('h2');h.textContent='Room settings';r.append(h);
 field(r,'Room name',room().name,v=>room().name=v,{type:'text',id:'room-name'});
 pair(r,'Room size · grid squares',[room().width,room().height],(i,v)=>{if(!resizeRoom(room(),i?room().width:v,i?v:room().height))toast('That would cut off terrain, an object, or a destination. Clear the edge first.',true);},['Columns','Rows'],['room-width','room-height']);
 const check=document.createElement('label');check.className='check-label';const cb=document.createElement('input');cb.type='checkbox';cb.id='require-pickup';cb.checked=room().requirePickup;cb.onchange=()=>perform(()=>{room().requirePickup=cb.checked;if(!cb.checked)room().requireAllPickups=false;});check.append(cb,document.createTextNode('Require a shard at the flag'));r.append(check);
 const allLabel=document.createElement('label');allLabel.className='check-label';const all=document.createElement('input');all.type='checkbox';all.id='require-all-pickups';all.checked=!!room().requireAllPickups;all.onchange=()=>perform(()=>{room().requireAllPickups=all.checked;if(all.checked)room().requirePickup=true;});allLabel.append(all,document.createTextNode('Require every shard at the flag'));r.append(allLabel);
 const pickupTip=document.createElement('p');pickupTip.className='muted small';pickupTip.textContent='One / all is a room rule for every shard here. Duplicate shards to add more. Death or retry resets carried shards.';r.append(pickupTip);
 for(const [key,title] of [['requireStakes','Light all stakes to finish'],['keepStakes','Keep lit stakes after retry']]){const label=document.createElement('label');label.className='check-label';const input=document.createElement('input');input.type='checkbox';input.id=key;input.checked=!!room()[key];input.onchange=()=>perform(()=>room()[key]=input.checked);label.append(input,document.createTextNode(title));r.append(label);}
 field(r,'Optional hint shown with H',room().hint,v=>room().hint=v,{type:'textarea',id:'room-hint'});
}
function duplicate(){const o=chosen();if(!o||o.kind==='Spawn'||o.kind==='Goal'){toast('Move the existing start or finish instead of duplicating it.');return;}perform(()=>{const next=clone(o);next.id=newObject(o.glyph,0,0).id;moveObject(next,o.x+1,o.y+1);room().objects.push(next);selected=next.id;});}
function deleteSelection(){perform(()=>{if(area){for(let y=area.y;y<area.y+area.h;y++)for(let x=area.x;x<area.x+area.w;x++)paint(room(),x,y,'.');area=null;}else if(selected&&selected!=='goal'){room().objects=room().objects.filter(o=>o.id!==selected);selected=null;}});}
function copySelection(){if(!area)return;clipboard={w:area.w,h:area.h,tiles:room().tiles.slice(area.y,area.y+area.h).map(row=>row.slice(area.x,area.x+area.w))};toast('Terrain copied. Press ⌘V / Ctrl+V, then click to place it.');}
function regionApply(source,x,y,copy=false){const r=room();if(x<0||y<0||x+source.w>r.width||y+source.h>r.height){toast('Keep the terrain selection inside the room.',true);return;}
 const tiles=source.tiles||r.tiles.slice(source.y,source.y+source.h).map(row=>row.slice(source.x,source.x+source.w));
 if(tiles.some((row,dy)=>[...row].some((g,dx)=>g!=='.'&&r.objects.some(o=>o.enabled&&o.kind!=='Prop'&&x+dx>=bounds(o).x&&x+dx<bounds(o).x+bounds(o).w&&y+dy>=bounds(o).y&&y+dy<bounds(o).y+bounds(o).h)))){toast('Move the objects out of the terrain’s destination first.',true);return;}
 if(!copy)for(let dy=0;dy<source.h;dy++)for(let dx=0;dx<source.w;dx++)paint(r,source.x+dx,source.y+dy,'.');
 for(let dy=0;dy<source.h;dy++)for(let dx=0;dx<source.w;dx++)paint(r,x+dx,y+dy,tiles[dy][dx]);area={x,y,w:source.w,h:source.h};
}
function position(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left-view.x)/view.cell,y:(event.clientY-r.top-view.y)/view.cell,px:event.clientX-r.left,py:event.clientY-r.top};}
function hit(p){const g=room().goal;if(p.x>=g.x&&p.x<=g.x+g.w&&p.y>=g.y-2.6&&p.y<=g.y+.5)return 'goal';for(const o of [...room().objects].reverse()){if(!o.enabled)continue;const padding=o.kind==='Prop'?.7:0;const b=bounds(o);if(p.x>=b.x-padding&&p.x<b.x+b.w+padding&&p.y>=b.y-(o.kind==='Prop'?2:0)&&p.y<b.y+b.h)return o.id;}return null;}
function pointerDown(event){if(!doc||busy)return;canvas.focus();const p=position(event);hover=p;canvas.setPointerCapture(event.pointerId);
 if(space||event.button===1){gesture={type:'pan',x:p.px,y:p.py,vx:view.x,vy:view.y};canvas.style.cursor='grabbing';return;}
 if(event.button!==0&&event.button!==2)return;
 const x=Math.floor(p.x),y=Math.floor(p.y);if(x<0||y<0||x>=room().width||y>=room().height)return;
 if(event.button===2||tool==='paint'||tool==='erase'){
  const glyph=event.button===2||tool==='erase'?'.':brush;
  gesture={type:'paint',before:stringify(),x,y,glyph};paint(room(),x,y,glyph);render();return;
 }
 if(tool==='paste'&&clipboard){perform(()=>regionApply(clipboard,x,y,true));setTool('area');refresh();return;}
 if(tool==='place'){
  perform(()=>{if(placement==='flag'){room().goal.x=x;room().goal.y=y;selected='goal';}
   else if(placement==='P'){const o=room().objects.find(o=>o.kind==='Spawn');if(o){moveObject(o,x,y);selected=o.id;}else{const o=newObject('P',x,y);room().objects.push(o);selected=o.id;}}
   else{const pickup=placement==='*'||placement==='*all';const o=newObject(pickup?'*':placement,x,y);if(pickup){room().requirePickup=true;room().requireAllPickups=placement==='*all';}if(o.glyph==='Z'&&o.targetX+o.w>room().width)o.targetX=Math.max(0,x-8);room().objects.push(o);selected=o.id;}
  });setTool('select');refresh();return;
 }
 if(tool==='area'){
  if(area&&p.x>=area.x&&p.x<area.x+area.w&&p.y>=area.y&&p.y<area.y+area.h)gesture={type:'region',source:clone(area),x,y,dx:0,dy:0};
  else{selected=null;area={x,y,w:1,h:1};gesture={type:'area',x,y};}
  properties();render();return;
 }
 const o=chosen();
 if(o?.glyph==='Z'&&Math.hypot(p.x-o.targetX-o.w/2,p.y-o.targetY-o.h/2)<.65){gesture={type:'target',before:stringify(),original:clone(o),x:p.x,y:p.y};return;}
 if(o&&['Z','K','~','A','B','G'].includes(o.glyph)&&Math.hypot(p.x-o.x-o.w,p.y-o.y-o.h)<.6){gesture={type:'resize',before:stringify(),original:clone(o),x:p.x,y:p.y};return;}
 selected=hit(p);area=null;const current=chosen();if(current)gesture={type:'object',before:stringify(),original:clone(current),x:p.x,y:p.y};properties();render();
}
function pointerMove(event){if(!doc)return;const p=position(event);hover=p;$('#coordinates').textContent=`X ${Math.floor(p.x)}  Y ${Math.floor(p.y)}`;
 if(!gesture){render();return;}const x=Math.floor(p.x),y=Math.floor(p.y),g=gesture;
 if(g.type==='pan'){view.x=g.vx+p.px-g.x;view.y=g.vy+p.py-g.y;render();return;}
 if(g.type==='paint'){line(g.x,g.y,x,y,(cx,cy)=>paint(room(),cx,cy,g.glyph));g.x=x;g.y=y;}
 if(g.type==='area'){area={x:Math.max(0,Math.min(g.x,x)),y:Math.max(0,Math.min(g.y,y)),w:Math.min(room().width-1,Math.max(g.x,x))-Math.max(0,Math.min(g.x,x))+1,h:Math.min(room().height-1,Math.max(g.y,y))-Math.max(0,Math.min(g.y,y))+1};}
 if(g.type==='region'){g.dx=x-g.x;g.dy=y-g.y;}
 const o=chosen();if(o&&['object','target','resize'].includes(g.type)){
  const dx=Math.round(p.x-g.x),dy=Math.round(p.y-g.y);
  if(g.type==='object'){
   const nx=Math.max(0,Math.min(room().width-o.w,g.original.x+dx)),ny=Math.max(0,Math.min(room().height-(selected==='goal'?0:o.h),g.original.y+dy));
   if(selected==='goal'){room().goal.x=nx;room().goal.y=ny;}else{Object.assign(o,clone(g.original));moveObject(o,nx,ny);}
  }
  if(g.type==='target'){o.targetX=Math.max(0,Math.min(room().width-o.w,g.original.targetX+dx));o.targetY=Math.max(0,Math.min(room().height-o.h,g.original.targetY+dy));}
  if(g.type==='resize'){o.w=Math.max(1,Math.min(room().width-o.x,g.original.w+dx));o.h=Math.max(1,Math.min(room().height-o.y,g.original.h+dy));}
 }
 render();
}
function pointerUp(event){if(!gesture)return;const g=gesture;gesture=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);canvas.style.cursor=tool==='select'?'default':'crosshair';
 if(g.type==='region')perform(()=>regionApply(g.source,g.source.x+g.dx,g.source.y+g.dy));
 else if(g.before)changed(g.before);
 refresh();
}
function cancelGesture(){if(gesture?.before)doc=JSON.parse(gesture.before);gesture=null;render();}
function fit(){if(!doc)return;const bounds=canvas.getBoundingClientRect();view.cell=Math.max(3,Math.min(36,(bounds.width-68)/room().width,(bounds.height-105)/room().height));view.x=(bounds.width-room().width*view.cell)/2;view.y=(bounds.height-room().height*view.cell)/2+16;render();}
function zoom(factor,point){const bounds=canvas.getBoundingClientRect(),p=point||{px:bounds.width/2,py:bounds.height/2};const before={x:(p.px-view.x)/view.cell,y:(p.py-view.y)/view.cell};view.cell=Math.max(3,Math.min(64,view.cell*factor));view.x=p.px-before.x*view.cell;view.y=p.py-before.y*view.cell;render();}
function tile(g,x,y){
 if(g==='#'||g==='%'){ctx.fillStyle=g==='#'?'#4e6470':'#566e65';ctx.fillRect(x,y,1,1);ctx.fillStyle=g==='#'?'#778c93':'#87988a';if(room().tiles[y-1]?.[x]!==g)ctx.fillRect(x,y,1,.09);ctx.strokeStyle='#263d4999';ctx.lineWidth=.04;ctx.strokeRect(x+.02,y+.02,.96,.96);ctx.fillStyle='#8a9a9b22';ctx.fillRect(x+.15+(x+y)%3*.15,y+.3,.2,.35);}
 else if(g==='='){ctx.fillStyle='#ceb98c';ctx.fillRect(x,y,1,.16);ctx.fillStyle='#6e6251';ctx.fillRect(x,y+.16,1,.12);}
 else if('^v<>'.includes(g)){ctx.fillStyle='#d8b9c2';ctx.beginPath();for(let i=0;i<2;i++){const a=i*.5;if(g==='^'){ctx.moveTo(x+a,y+1);ctx.lineTo(x+a+.25,y+.05);ctx.lineTo(x+a+.5,y+1);}if(g==='v'){ctx.moveTo(x+a,y);ctx.lineTo(x+a+.25,y+.95);ctx.lineTo(x+a+.5,y);}if(g==='<'){ctx.moveTo(x+1,y+a);ctx.lineTo(x+.05,y+a+.25);ctx.lineTo(x+1,y+a+.5);}if(g==='>'){ctx.moveTo(x,y+a);ctx.lineTo(x+.95,y+a+.25);ctx.lineTo(x,y+a+.5);} }ctx.fill();}
}
function object(o,ghost=false){
 ctx.save();if(ghost)ctx.globalAlpha=.45;const {x,y,w,h}=bounds(o);
 if(o.kind==='Goal'){
  ctx.strokeStyle='#edcf8c';ctx.lineWidth=.09;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-2.5);ctx.stroke();ctx.fillStyle='#edcf8c';ctx.fillRect(x,y-2.5,1.2,.7);ctx.fillStyle='#edcf8c88';ctx.fillRect(x,y-.1,w,.17);ctx.restore();return;
 }
 if(o.kind==='Spawn'){
  ctx.fillStyle='#73b7dc22';ctx.fillRect(x,y,1,1);ctx.fillStyle='#b8c6db';ctx.fillRect(x+.18,y-.35,.64,.65);ctx.fillStyle='#20333f';ctx.fillRect(x+.45,y-.1,.45,.14);ctx.fillStyle='#658cc0';ctx.fillRect(x+.18,y+.35,.64,.48);ctx.fillStyle='#e3c27e';ctx.fillRect(x+.72,y+.25,.5,.12);ctx.fillStyle='#c2ccd3';ctx.fillRect(x+.19,y+.84,.2,.2);ctx.fillRect(x+.62,y+.84,.2,.2);
 }else if(o.kind==='Prop'&&o.prop==='post'){
  ctx.fillStyle='#b9a27a';ctx.fillRect(x+.1,y-1.4,.2,2.4);ctx.fillRect(x-.4,y-1.4,1.5,.45);
 }else if(o.kind==='Prop'){
  ctx.strokeStyle='#8bb39b';ctx.lineWidth=.13;for(let i=0;i<3;i++){const xx=x+.15+i*.35;ctx.beginPath();ctx.moveTo(xx,y+1);ctx.lineTo(xx,y-.5-i%2*.45);ctx.stroke();ctx.fillStyle=o.prop==='fern'?'#81aa8d':'#cebcdf';if(o.prop==='fern'){ctx.beginPath();ctx.ellipse(xx,y,.3,.15,-.5,0,Math.PI*2);ctx.fill();}else ctx.fillRect(xx-.16,y-.6-i%2*.45,.33,.3);}
 }else if(['R','T'].includes(o.glyph)){
  ctx.fillStyle=o.glyph==='R'?'#806b46':'#8d6950';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#e1bb77';ctx.lineWidth=.1;ctx.strokeRect(x+.08,y+.08,w-.16,h-.16);
  if(o.glyph==='R'){ctx.strokeStyle='#b6a48a';ctx.setLineDash([.2,.2]);ctx.strokeRect(x,y+o.depth,w,1);ctx.setLineDash([]);ctx.fillStyle='#f0d491';ctx.font='.75px sans-serif';ctx.textAlign='center';ctx.fillText('↑',x+w/2,y+.8);}
  else{ctx.fillStyle='#edd18b';ctx.beginPath();ctx.arc(o.x+.5,o.y+.5,.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#382c27';ctx.fillRect(o.x+.43,o.y+.14,.14,.72);}
 }else if(['Z','K','~','A','B','G'].includes(o.glyph)){
  ctx.fillStyle=o.tint!=='ffffffff'?'#'+o.tint:o.glyph==='Z'?'#426d6b':o.glyph==='~'?'#786e62':o.glyph==='A'?'#aa8749':o.glyph==='B'?'#4b9295':o.glyph==='G'?'#806f53':'#627783';ctx.fillRect(x,y,w,h);ctx.strokeStyle=o.glyph==='Z'?'#a7d8bc':'#c3b59b';ctx.lineWidth=.1;ctx.strokeRect(x+.09,y+.09,w-.18,h-.18);ctx.fillStyle='#0e242d55';for(let i=1;i<w;i++)ctx.fillRect(x+i,y+.2,.055,h-.4);ctx.fillStyle='#c8e0c0';for(const xx of [x+.3,x+w-.3])for(const yy of [y+.3,y+h-.3])ctx.fillRect(xx-.055,yy-.055,.11,.11);if(o.glyph==='~'){ctx.strokeStyle='#d1baa0';ctx.beginPath();ctx.moveTo(x+w*.4,y);ctx.lineTo(x+w*.55,y+h*.4);ctx.lineTo(x+w*.35,y+h);ctx.stroke();}
 }else if(['b','x','c'].includes(o.glyph)){
  ctx.fillStyle=o.glyph==='b'?'#a5c9a4':o.glyph==='x'?'#dbbc7d':'#e2b775';ctx.beginPath();ctx.arc(x+.5,y+.5,.38,0,Math.PI*2);ctx.fill();ctx.fillStyle='#213a36';ctx.font='.6px sans-serif';ctx.textAlign='center';ctx.fillText(o.glyph==='b'?'•':o.glyph==='x'?'↔':'✦',x+.5,y+.72);
 }else if(o.glyph==='o'||o.glyph==='*'){
  const cx=x+.5,cy=y+.5;ctx.fillStyle=o.glyph==='o'?'#a3e5cf':'#e8c383';ctx.beginPath();ctx.moveTo(cx,y+.08);ctx.lineTo(x+.88,cy);ctx.lineTo(cx,y+.95);ctx.lineTo(x+.12,cy);ctx.closePath();ctx.fill();ctx.strokeStyle='#e7fff3';ctx.lineWidth=.06;ctx.stroke();ctx.fillStyle='#142e3b66';ctx.fillRect(cx-.04,y+.23,.08,.5);
 }else if(o.glyph==='s'){ctx.fillStyle='#dca9a8';ctx.fillRect(x,y+.6,1,.25);ctx.strokeStyle='#e1dbc1';ctx.lineWidth=.1;ctx.beginPath();ctx.moveTo(x+.2,y+.55);ctx.lineTo(x+.8,y+.4);ctx.lineTo(x+.2,y+.25);ctx.stroke();}
 if(!o.enabled){ctx.fillStyle='#0b1428aa';ctx.fillRect(x,y,w,h);}
 ctx.restore();
}
function render(){if(!doc)return;const viewport=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;if(canvas.width!==Math.round(viewport.width*dpr)||canvas.height!==Math.round(viewport.height*dpr)){canvas.width=Math.round(viewport.width*dpr);canvas.height=Math.round(viewport.height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,viewport.width,viewport.height);ctx.fillStyle='#0c141d';ctx.fillRect(0,0,viewport.width,viewport.height);ctx.translate(view.x,view.y);ctx.scale(view.cell,view.cell);const r=room();
 ctx.fillStyle='#17252f';ctx.fillRect(0,0,r.width,r.height);ctx.strokeStyle='#547079';ctx.lineWidth=1/view.cell;ctx.strokeRect(0,0,r.width,r.height);
 for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++)if(r.tiles[y][x]!=='.')tile(r.tiles[y][x],x,y);
 if(grid){ctx.strokeStyle='#9ebec012';ctx.lineWidth=.7/view.cell;ctx.beginPath();for(let x=0;x<=r.width;x++){ctx.moveTo(x,0);ctx.lineTo(x,r.height);}for(let y=0;y<=r.height;y++){ctx.moveTo(0,y);ctx.lineTo(r.width,y);}ctx.stroke();if(view.cell>=9){ctx.fillStyle='#78939b';ctx.font=`${10/view.cell}px system-ui`;ctx.textAlign='center';for(let x=0;x<r.width;x+=5)ctx.fillText(x,x+.5,-.55);ctx.textAlign='right';for(let y=0;y<r.height;y+=5)ctx.fillText(y,-.45,y+.7);}}
 for(const o of r.objects)if(o.glyph==='Z'&&o.enabled){ctx.strokeStyle=o.id===selected?'#edcd8c':'#8fae8266';ctx.lineWidth=.08;ctx.setLineDash([.25,.25]);ctx.beginPath();ctx.moveTo(o.x+o.w/2,o.y+o.h/2);ctx.lineTo(o.targetX+o.w/2,o.targetY+o.h/2);ctx.stroke();ctx.setLineDash([]);ctx.strokeRect(o.targetX,o.targetY,o.w,o.h);}
 r.objects.forEach(o=>object(o));object({kind:'Goal',...r.goal});
 const o=chosen();if(o){ctx.strokeStyle='#eace97';ctx.lineWidth=.1;ctx.setLineDash([.23,.15]);const b=bounds(o);ctx.strokeRect(b.x-.08,b.y-(selected==='goal'?2.7:.08),b.w+.16,selected==='goal'?3:b.h+.16);ctx.setLineDash([]);if(o.glyph==='Z'){ctx.beginPath();ctx.arc(o.targetX+o.w/2,o.targetY+o.h/2,.35,0,Math.PI*2);ctx.fillStyle='#eace97';ctx.fill();ctx.strokeStyle='#172d37';ctx.stroke();}if(['Z','K','~','A','B','G'].includes(o.glyph)){ctx.fillStyle='#eace97';ctx.fillRect(o.x+o.w-.18,o.y+o.h-.18,.36,.36);}}
 if(area){const a=gesture?.type==='region'?{...area,x:area.x+gesture.dx,y:area.y+gesture.dy}:area;ctx.fillStyle='#b9dfcc22';ctx.fillRect(a.x,a.y,a.w,a.h);ctx.strokeStyle='#b9dfcc';ctx.lineWidth=.1;ctx.setLineDash([.3,.15]);ctx.strokeRect(a.x,a.y,a.w,a.h);ctx.setLineDash([]);}
 if(hover&&!gesture&&hover.x>=0&&hover.y>=0&&hover.x<r.width&&hover.y<r.height){const x=Math.floor(hover.x),y=Math.floor(hover.y);if(tool==='paint'||tool==='erase'){ctx.globalAlpha=.55;if(tool==='paint')tile(brush,x,y);ctx.fillStyle=tool==='erase'?'#f0a6b744':'#b9dfcc22';ctx.fillRect(x,y,1,1);ctx.globalAlpha=1;ctx.strokeStyle='#cde6dc';ctx.lineWidth=.08;ctx.strokeRect(x,y,1,1);}if(tool==='place'){let ghost=newObject(placement==='*all'?'*':placement,x,y);if(placement==='flag')ghost={kind:'Goal',x,y,w:r.goal.w,h:.5};object(ghost,true);}if(tool==='paste'&&clipboard){ctx.globalAlpha=.5;clipboard.tiles.forEach((row,dy)=>[...row].forEach((g,dx)=>{if(g!=='.')tile(g,x+dx,y+dy);}));ctx.globalAlpha=1;}}
 $('#zoom').textContent=Math.round(view.cell/18*100)+'%';$('#stage-hint').textContent=gesture?.type==='pan'?'Drag to pan · Release to continue':tool==='place'?`Click to place ${placement==='flag'?'the finish flag':placement==='P'?'the player start':placement.startsWith('prop:')?'foliage':TYPES[placement==='*all'?'*':placement]}`:tool==='paint'?`${TERRAIN[brush]} · Drag to paint · Right-drag to erase`:tool==='erase'?'Drag to erase terrain · Objects use Select → Delete':tool==='area'?'Drag a box around terrain · Then drag the box to move it':tool==='paste'?'Click to place copied terrain':o?.glyph==='Z'?'Drag block to move · Drag circular handle for destination':o?'Drag to move · Arrow keys nudge · Delete removes':'Click an object to select it · Scroll to zoom';
}
async function save({play=false}={}){if(busy||!doc)return;cancelGesture();const errors=issues();if(errors.length){toast(errors[0],true);return;}busy=true;document.body.classList.add('busy');refresh();try{
 if(dirty()){const result=await api('/api/save',{...doc,revision});revision=result.document.revision;doc=clean(result.document);saved=stringify();stash();toast('Saved to Godot. A backup of the previous version is available.');}
 if(play){await api('/api/play',{revision,room:room().id});toast('Room opened in Godot. Close the game window to return here; Save & play restarts this playtest.');}
 }catch(error){toast(error.message,true);}finally{busy=false;document.body.classList.remove('busy');refresh();}}
function confirmReplace(){return !dirty()||confirm('You have unsaved changes. Export a file first if you want to keep them. Replace the current draft?');}
async function reload(){if(!confirmReplace())return;try{const result=await api('/api/document');revision=result.revision;doc=clean(result);saved=stringify();undo=[];redo=[];selected=null;area=null;stash();refresh();fit();toast('Loaded the saved native rooms.');}catch(error){toast(error.message,true);}}
function download(){const portable=clone(doc);delete portable.restoreFrom;const blob=new Blob([JSON.stringify(portable,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`bladefall-workshop-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Exported all workshop rooms as an editable file.');}
function replaceDraft(next){
 if(!next||!Array.isArray(next.rooms)||next.rooms.some(r=>!doc.rooms.some(current=>current.id===r.id)&&!(doc.retiredRoomIds||[]).includes(r.id)))throw new Error('This file contains rooms outside the current workshop.');
 const retired=next.rooms.filter(r=>(doc.retiredRoomIds||[]).includes(r.id));
 if(retired.length)localStorage.setItem('bladefall-editor-retired-draft-v019',JSON.stringify({time:Date.now(),doc:next}));
 const incoming=clean(next);incoming.retiredRoomIds=clone(doc.retiredRoomIds||[]);incoming.rooms=doc.rooms.map(current=>clone(incoming.rooms.find(r=>r.id===current.id)||current));
 const errors=validate(incoming);if(errors.length)throw new Error(errors[0]);perform(()=>{doc=incoming;selected=null;area=null;});fit();
}
function setup(){
 const palette=$('#terrain-palette'),icons={'#':'','%':'','=':'','^':'▲','v':'▼','<':'◀','>':'▶','.':'×'},classes={'#':'stone','%':'weathered','=':'ledge','.':'erase'};
 for(const [glyph,title] of Object.entries(TERRAIN)){if(glyph==='.')continue;const b=button(palette,'',()=>{brush=glyph;setTool('paint');});b.dataset.brush=glyph;b.innerHTML=`<span class="swatch ${classes[glyph]||''}" aria-hidden="true">${icons[glyph]}</span><span>${escapeHTML(title)}</span>`;b.title=title;}
 for(const [type,title,icon] of [['R','Recoil platform','↟'],['T','Hinged arm','↱'],['Z','Moving block','▰'],['o','Dash refill','◇'],['*','Return shard · one','◆'],['*all','Return shards · all','❖'],['s','Spring','⌁'],['~','Crumble platform','▤'],['K','Pushable block','▣'],['b','Moth pod','●'],['x','Phase bell','♧'],['c','Gate stake','✦'],['G','Stake gate','▥'],['A','Amber phase branch','▰'],['B','Blue phase branch','▱'],['P','Player start','⚑'],['flag','Finish flag','⚐'],['prop:trumpets','Flowers','✿'],['prop:fern','Fern','❧']]){const b=button($('#object-palette'),'',()=>{placement=type;setTool('place');});b.dataset.object=type;b.innerHTML=`<span class="icon" aria-hidden="true">${icon}</span><span>${title}</span>`;}
 $$('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));$('#rooms').onchange=()=>{cancelGesture();roomIndex=Number($('#rooms').value);localStorage.setItem('bladefall-editor-room',room().id);selected=null;area=null;setTool('select');refresh();fit();};
 $('#undo').onclick=()=>undoEdit('undo');$('#redo').onclick=()=>undoEdit('redo');$('#save').onclick=()=>save();$('#play').onclick=()=>save({play:true});$('#fit').onclick=fit;$('#zoom-in').onclick=()=>zoom(1.2);$('#zoom-out').onclick=()=>zoom(1/1.2);$('#grid').onclick=()=>{grid=!grid;$('#grid').setAttribute('aria-pressed',String(grid));render();};
 $('#help').onclick=$('#shortcuts').onclick=()=>$('#help-dialog').showModal();$$('.dialog-close,.dialog-done').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 $('#dismiss-welcome').onclick=()=>{$('#welcome').hidden=true;localStorage.setItem('bladefall-editor-intro','seen');fit();};$('#export').onclick=download;$('#reload').onclick=reload;
 $('#import').onclick=()=>$('#file').click();$('#file').onchange=async()=>{const file=$('#file').files[0];if(!file)return;try{const next=JSON.parse(await file.text());if(confirmReplace()){replaceDraft(next);toast('File loaded as a draft. Save to apply it to Godot.');}}catch(error){toast(error.message,true);}$('#file').value='';};
 $('#backups').onclick=async()=>{try{const list=await api('/api/backups'),box=$('#backup-list');box.replaceChildren();if(!list.backups.length)box.textContent='Your first backup will appear after you save a change.';for(const entry of list.backups)button(box,new Date(entry.time).toLocaleString(),async()=>{if(!confirmReplace())return;try{const next=await api('/api/backup?id='+encodeURIComponent(entry.id));replaceDraft(next);$('#backup-dialog').close();toast('Backup loaded for review. Save when you’re ready to apply it.');}catch(error){toast(error.message,true);}});$('#backup-dialog').showModal();}catch(error){toast(error.message,true);}};
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',()=>{cancelGesture();refresh();});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerleave',()=>{hover=null;render();});canvas.addEventListener('wheel',e=>{e.preventDefault();if(!gesture)zoom(e.deltaY<0?1.1:1/1.1,position(e));},{passive:false});
 document.addEventListener('keydown',e=>{if(!doc||busy||$$('dialog[open]').length)return;const form=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();e.target.blur();save();return;}if(form)return;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undoEdit(e.shiftKey?'redo':'undo');return;}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='y'){e.preventDefault();undoEdit('redo');return;}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicate();return;}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='c'&&area){e.preventDefault();copySelection();return;}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='v'&&clipboard){e.preventDefault();selected=null;setTool('paste');return;}
  if(e.code==='Space'){e.preventDefault();space=true;canvas.style.cursor='grab';return;}if(e.key==='Escape'){cancelGesture();selected=null;area=null;setTool('select');refresh();return;}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();deleteSelection();return;}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&selected){e.preventDefault();const dx=(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*(e.shiftKey?5:1),dy=(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*(e.shiftKey?5:1);perform(()=>{const o=chosen();if(o.kind==='Goal'){room().goal.x+=dx;room().goal.y+=dy;}else moveObject(o,o.x+dx,o.y+dy);});return;}
  if(!e.metaKey&&!e.ctrlKey){if(e.key.toLowerCase()==='v')setTool('select');if(e.key.toLowerCase()==='b')setTool('paint');if(e.key.toLowerCase()==='e')setTool('erase');if(e.key.toLowerCase()==='f')fit();}
 });document.addEventListener('keyup',e=>{if(e.code==='Space'){space=false;canvas.style.cursor=tool==='select'?'default':'crosshair';}});window.addEventListener('blur',()=>{space=false;cancelGesture();if(doc)refresh();});
 window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});new ResizeObserver(()=>render()).observe($('#stage'));
}
async function boot(){setup();try{({token}=await api('/api/meta'));const result=await api('/api/document');revision=result.revision;doc=clean(result);saved=stringify();const requestedRoom=new URLSearchParams(location.search).get('room')||localStorage.getItem('bladefall-editor-room');roomIndex=Math.max(0,doc.rooms.findIndex(r=>r.id===requestedRoom));$('#loading').hidden=true;$('#welcome').hidden=localStorage.getItem('bladefall-editor-intro')==='seen';refresh();fit();
 const raw=localStorage.getItem(draftKey);if(raw){let draft;try{draft=JSON.parse(raw);}catch{localStorage.removeItem(draftKey);}if(draft&&JSON.stringify(draft.doc)!==saved){$('#draft-description').textContent=`Last edited ${new Date(draft.time).toLocaleString()}. ${draft.revision!==revision?'The saved rooms have changed since then. Recovering loads your older draft for review; it does not save automatically.':'Recover your work, or continue with the saved Godot rooms.'}`;$('#restore-draft').onclick=()=>{try{replaceDraft(draft.doc);$('#draft-dialog').close();}catch(error){toast(error.message,true);}};$('#discard-draft').onclick=()=>{localStorage.removeItem(draftKey);$('#draft-dialog').close();};$('#draft-dialog').showModal();}}
 }catch(error){$('#loading').textContent=error.message;toast(error.message,true);}}
// Read-only diagnostics for browser interaction tests; edits still go through pointer/keyboard controls.
window.editorState=()=>({document:clone(doc),roomIndex,selected,area:clone(area),view:clone(view),tool,dirty:dirty(),busy});
boot();
