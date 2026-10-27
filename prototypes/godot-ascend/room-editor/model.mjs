export const clone = value => structuredClone(value);
export const TERRAIN = {'.':'Erase','#':'Stone','%':'Weathered stone','=':'One-way ledge','^':'Spikes up','v':'Spikes down','<':'Spikes left','>':'Spikes right'};
export const TYPES = {Z:'Moving block',K:'Pushable block','~':'Crumble platform',o:'Dash refill','*':'Shard',s:'Spring'};
export const label = o => o.kind === 'Spawn' ? 'Player start' : o.kind === 'Goal' ? 'Finish flag' : o.kind === 'Prop' ? (o.prop === 'fern' ? 'Fern' : o.prop === 'post' ? 'Post' : 'Flowers') : TYPES[o.glyph] || o.kind;
export function newObject(type,x,y) {
 const o={id:`edit_${crypto.randomUUID().replaceAll('-','')}`,kind:type==='P'?'Spawn':type.startsWith('prop:')?'Prop':'Fixture',glyph:type==='P'?'P':type.startsWith('prop:')?'':type,x,y,w:1,h:1,enabled:true,tint:'ffffffff',prop:type.slice(5)};
 if(type==='Z')Object.assign(o,{w:3,h:2,targetX:x+8,targetY:y,holdFrames:30,returnFrames:120});
 if(type==='K'||type==='~')o.w=3;
 return o;
}
export function validate(doc) {
 const errors=[];
 if(doc?.format!=='bladefall-workshop-editor'||doc.version!==1||!Array.isArray(doc.rooms)||doc.rooms.length<1||doc.rooms.length>64)return ['Choose a Bladefall workshop file with 1–64 rooms.'];
 const ids=new Set();
 for(const room of doc.rooms){
  const prefix=`${room.name||'Room'}: `, fail=text=>errors.push(prefix+text);
  if(typeof room.id!=='string'||ids.has(room.id))fail('room IDs must be unique.');ids.add(room.id);
  if(typeof room.name!=='string'||!room.name.trim()||room.name.length>90)fail('give the room a name, up to 90 characters.');
  if(typeof room.hint!=='string'||room.hint.length>2000||typeof room.requirePickup!=='boolean')fail('invalid room settings.');
  if(!Number.isInteger(room.width)||!Number.isInteger(room.height)||room.width<8||room.height<8||room.width>200||room.height>100){fail('room size must be 8–200 columns and 8–100 rows.');continue;}
  if(!Array.isArray(room.tiles)||room.tiles.length!==room.height||room.tiles.some(row=>typeof row!=='string'||row.length!==room.width||[...row].some(g=>!Object.hasOwn(TERRAIN,g)))){fail('terrain grid has an invalid size or tile.');continue;}
  if(!Array.isArray(room.objects)||room.objects.length>1000){fail('too many objects.');continue;}
  const occupied=new Set(),objectIds=new Set();let starts=0,shards=0;
  for(const o of room.objects){
   if(!o||typeof o.id!=='string'||!/^[A-Za-z0-9_*~-]{1,100}$/.test(o.id)||objectIds.has(o.id)){fail('invalid or repeated object ID.');continue;}objectIds.add(o.id);
   if(!['Spawn','Fixture','Prop'].includes(o.kind)||typeof o.enabled!=='boolean'||!Number.isInteger(o.x)||!Number.isInteger(o.y)||!Number.isInteger(o.w)||!Number.isInteger(o.h)||o.w<1||o.h<1||o.w>200||o.h>100||typeof o.tint!=='string'||!/^[0-9a-f]{8}$/i.test(o.tint)){fail('object positions and sizes must use whole grid squares.');continue;}
   if(o.kind==='Fixture'&&!Object.hasOwn(TYPES,o.glyph)||o.kind==='Spawn'&&o.glyph!=='P'||o.kind==='Prop'&&!['trumpets','fern','post'].includes(o.prop))fail('unknown object type.');
   if(!o.enabled)continue;
   if(o.kind==='Spawn')starts++;
   if(o.glyph==='*')shards++;
   if(o.x<0||o.y<0||o.x+o.w>room.width||o.y+o.h>room.height)fail(`${label(o)} is outside the room.`);
   if(o.kind!=='Prop')for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++){
    const key=`${x},${y}`;
    if(occupied.has(key)||room.tiles[y]?.[x]!=='.')fail(`${label(o)} overlaps terrain or another object at ${x}, ${y}.`);
    occupied.add(key);
   }
   if(o.glyph==='Z'){
    if(!Number.isInteger(o.targetX)||!Number.isInteger(o.targetY)||o.targetX<0||o.targetY<0||o.targetX+o.w>room.width||o.targetY+o.h>room.height)fail('a moving block’s destination must fit inside the room.');
    if(!Number.isInteger(o.holdFrames)||!Number.isInteger(o.returnFrames)||o.holdFrames<1||o.returnFrames<1||o.holdFrames>3600||o.returnFrames>3600)fail('block timing must be 1–3600 frames.');
   }
   if(!['Z','K','~'].includes(o.glyph)&&o.kind!=='Prop'&&(o.w!==1||o.h!==1))fail(`${label(o)} must be one square.`);
  }
  for(let i=0;i<room.objects.length;i++)for(let j=i+1;j<room.objects.length;j++){
   const a=room.objects[i],b=room.objects[j];
   if(!a?.enabled||!b?.enabled||!['Z','K','~'].includes(a.glyph)||a.glyph!==b.glyph)continue;
   if(((a.x+a.w===b.x||b.x+b.w===a.x)&&a.y<b.y+b.h&&a.y+a.h>b.y)||((a.y+a.h===b.y||b.y+b.h===a.y)&&a.x<b.x+b.w&&a.x+a.w>b.x))fail(`Leave a square between separate ${label(a).toLowerCase()}s so the game does not merge them.`);
  }
  if(starts!==1)fail('keep exactly one player start.');
  if(room.requirePickup&&shards===0)fail('add a shard, or turn off “Require pickup at finish”.');
  const g=room.goal;
  if(!g||![g.x,g.y,g.w,g.h].every(Number.isFinite)||!Number.isInteger(g.x)||!Number.isInteger(g.y)||!Number.isInteger(g.w)||g.w<1||g.x<0||g.y<0||g.x+g.w>room.width||g.y>room.height||g.h!==0.5)fail('finish flag must fit inside the room.');
 }
 return [...new Set(errors)].slice(0,30);
}
export function paint(room,x,y,glyph){
 if(x<0||y<0||x>=room.width||y>=room.height)return false;
 if(glyph!=='.'&&room.objects.some(o=>o.enabled&&o.kind!=='Prop'&&x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h))return false;
 if(room.tiles[y][x]===glyph)return false;
 room.tiles[y]=room.tiles[y].slice(0,x)+glyph+room.tiles[y].slice(x+1);return true;
}
export function moveObject(o,x,y){
 if(o.glyph==='Z'){o.targetX+=x-o.x;o.targetY+=y-o.y;}
 o.x=x;o.y=y;
}
export function resizeRoom(room,width,height){
 if(room.objects.some(o=>o.x+o.w>width||o.y+o.h>height||o.glyph==='Z'&&(o.targetX+o.w>width||o.targetY+o.h>height))||room.goal.x+room.goal.w>width||room.goal.y>height)return false;
 if(room.tiles.some((row,y)=>[...row].some((v,x)=>v!=='.'&&(x>=width||y>=height))))return false;
 room.tiles=Array.from({length:height},(_,y)=>(room.tiles[y]||'').padEnd(width,'.').slice(0,width));room.width=width;room.height=height;return true;
}
export function line(x0,y0,x1,y1,fn){
 const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
 for(;;){fn(x0,y0);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
}
