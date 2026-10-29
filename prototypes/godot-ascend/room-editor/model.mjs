export const clone = value => structuredClone(value);
export const TERRAIN = {'.':'Erase','#':'Stone','%':'Weathered stone','=':'One-way ledge','^':'Spikes up','v':'Spikes down','<':'Spikes left','>':'Spikes right'};
export const TYPES = {l:'Lantern weight',R:'Recoil platform',T:'Hinged arm',Z:'Moving block',K:'Pushable block','~':'Crumble platform',o:'Dash refill','*':'Shard',s:'Spring',b:'Moth pod',x:'Phase bell',c:'Gate stake',G:'Stake gate',A:'Amber phase branch',B:'Blue phase branch'};
export const label = o => o.kind === 'Spawn' ? 'Player start' : o.kind === 'Goal' ? 'Finish flag' : o.kind === 'Prop' ? (o.prop === 'fern' ? 'Fern' : o.prop === 'post' ? 'Post' : 'Flowers') : TYPES[o.glyph] || o.kind;
export function newObject(type,x,y) {
 const o={id:`edit_${crypto.randomUUID().replaceAll('-','')}`,kind:type==='P'?'Spawn':type.startsWith('prop:')?'Prop':['R','T'].includes(type)?'Mechanism':'Fixture',glyph:type==='P'?'P':type.startsWith('prop:')?'':type,x,y,w:1,h:1,enabled:true,tint:'ffffffff',prop:type.startsWith('prop:')?type.slice(5):'trumpets'};
 if(type==='R')Object.assign(o,{w:6,depth:3,loadFrames:30,releaseSpeed:120});
 if(type==='T')Object.assign(o,{length:8,dir:'right'});
 if(type==='Z')Object.assign(o,{w:3,h:2,targetX:x+8,targetY:y,holdFrames:30,returnFrames:120});
 if(type==='K'||type==='~')o.w=3;
 return o;
}
export function bounds(o){if(o.glyph!=='T')return o;const n=o.length;return {...o,x:o.x-(o.dir==='left'?n-1:0),y:o.y-(o.dir==='up'?n-1:0),w:['left','right'].includes(o.dir)?n:1,h:['up','down'].includes(o.dir)?n:1};}
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
   if(!['Spawn','Fixture','Prop','Mechanism'].includes(o.kind)||typeof o.enabled!=='boolean'||!Number.isInteger(o.x)||!Number.isInteger(o.y)||!Number.isInteger(o.w)||!Number.isInteger(o.h)||o.w<1||o.h<1||o.w>200||o.h>100||typeof o.tint!=='string'||!/^[0-9a-f]{8}$/i.test(o.tint)){fail('object positions and sizes must use whole grid squares.');continue;}
   if(o.kind==='Mechanism'&&!['R','T'].includes(o.glyph)||o.kind==='Fixture'&&(!Object.hasOwn(TYPES,o.glyph)||['R','T'].includes(o.glyph))||o.kind==='Spawn'&&o.glyph!=='P'||o.kind==='Prop'&&!['trumpets','fern','post'].includes(o.prop))fail('unknown object type.');
   if(o.glyph==='R'&&(!Number.isInteger(o.depth)||o.depth<1||o.depth>12||o.h!==1||!Number.isInteger(o.loadFrames)||o.loadFrames<1||o.loadFrames>3600||!Number.isFinite(o.releaseSpeed)||o.releaseSpeed<1||o.releaseSpeed>300))fail('recoil settings need depth 1–12, load time 1–3600 frames and release speed 1–300.');
   if(o.glyph==='T'&&(!Number.isInteger(o.length)||o.length<2||o.length>40||!['right','down','left','up'].includes(o.dir)||o.w!==1||o.h!==1))fail('hinged arms need length 2–40 and a starting direction.');
   if(!o.enabled)continue;
   if(o.kind==='Spawn')starts++;
   if(o.glyph==='*')shards++;
   const b=bounds(o);
   if(b.x<0||b.y<0||b.x+b.w>room.width||b.y+b.h>room.height)fail(`${label(o)} is outside the room.`);
   if(o.kind!=='Prop')for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){
    const key=`${x},${y}`;
    if(occupied.has(key)||room.tiles[y]?.[x]!=='.')fail(`${label(o)} overlaps terrain or another object at ${x}, ${y}.`);
    occupied.add(key);
   }
   if(o.glyph==='Z'){
    if(!Number.isInteger(o.targetX)||!Number.isInteger(o.targetY)||o.targetX<0||o.targetY<0||o.targetX+o.w>room.width||o.targetY+o.h>room.height)fail('a moving block’s destination must fit inside the room.');
    if(!Number.isInteger(o.holdFrames)||!Number.isInteger(o.returnFrames)||o.holdFrames<1||o.returnFrames<1||o.holdFrames>3600||o.returnFrames>3600)fail('block timing must be 1–3600 frames.');
   }
   if(!['Z','K','~','A','B','G','R'].includes(o.glyph)&&o.kind!=='Prop'&&(o.w!==1||o.h!==1))fail(`${label(o)} must be one square.`);
  }
  // Mirror the game's row-first rectangle grouping. Touching shapes are safe
  // when they retain the same individual collision rectangles after compilation.
  const grouped=room.objects.filter(o=>o?.enabled&&['Z','K','~','A','B','G'].includes(o.glyph)&&[o.x,o.y,o.w,o.h].every(Number.isInteger)&&o.x>=0&&o.y>=0&&o.w>0&&o.h>0&&o.x+o.w<=room.width&&o.y+o.h<=room.height);
  const cells=new Map(),seen=new Set();
  for(const o of grouped)for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)cells.set(y*room.width+x,o.glyph);
  for(let y=0;y<room.height;y++)for(let x=0;x<room.width;x++){
   const key=y*room.width+x,glyph=cells.get(key);if(!glyph||seen.has(key))continue;
   let w=1,h=1;while(x+w<room.width&&cells.get(key+w)===glyph&&!seen.has(key+w))w++;
   while(y+h<room.height&&Array.from({length:w},(_,dx)=>(y+h)*room.width+x+dx).every(k=>cells.get(k)===glyph&&!seen.has(k)))h++;
   for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)seen.add((y+dy)*room.width+x+dx);
   if(!grouped.some(o=>o.glyph===glyph&&o.x===x&&o.y===y&&o.w===w&&o.h===h))fail('Leave a square between separate objects, or resize them to match the game’s rectangle grouping.');
  }
  if(room.requireStakes!==undefined&&typeof room.requireStakes!=='boolean'||room.keepStakes!==undefined&&typeof room.keepStakes!=='boolean')fail('invalid stake settings.');
  if(room.requireStakes&&!room.objects.some(o=>o.enabled&&o.glyph==='c'))fail('add a gate stake, or turn off “Light all stakes to finish”.');
  if(starts!==1)fail('keep exactly one player start.');
  if(room.requireAllPickups!==undefined&&typeof room.requireAllPickups!=='boolean')fail('invalid return pickup setting.');
  if((room.requirePickup||room.requireAllPickups)&&shards===0)fail('add a shard, or turn off the shard requirements in Room settings.');
  const g=room.goal;
  if(!g||![g.x,g.y,g.w,g.h].every(Number.isFinite)||!Number.isInteger(g.x)||!Number.isInteger(g.y)||!Number.isInteger(g.w)||g.w<1||g.x<0||g.y<0||g.x+g.w>room.width||g.y>room.height||g.h!==0.5)fail('finish flag must fit inside the room.');
 }
 return [...new Set(errors)].slice(0,30);
}
export function paint(room,x,y,glyph){
 if(x<0||y<0||x>=room.width||y>=room.height)return false;
 if(glyph!=='.'&&room.objects.some(o=>{const b=bounds(o);return o.enabled&&o.kind!=='Prop'&&x>=b.x&&y>=b.y&&x<b.x+b.w&&y<b.y+b.h;}))return false;
 if(room.tiles[y][x]===glyph)return false;
 room.tiles[y]=room.tiles[y].slice(0,x)+glyph+room.tiles[y].slice(x+1);return true;
}
export function moveObject(o,x,y){
 if(o.glyph==='Z'){o.targetX+=x-o.x;o.targetY+=y-o.y;}
 o.x=x;o.y=y;
}
export function resizeRoom(room,width,height){
 if(room.objects.some(o=>bounds(o).x+bounds(o).w>width||bounds(o).y+bounds(o).h>height||o.glyph==='Z'&&(o.targetX+o.w>width||o.targetY+o.h>height))||room.goal.x+room.goal.w>width||room.goal.y>height)return false;
 if(room.tiles.some((row,y)=>[...row].some((v,x)=>v!=='.'&&(x>=width||y>=height))))return false;
 room.tiles=Array.from({length:height},(_,y)=>(room.tiles[y]||'').padEnd(width,'.').slice(0,width));room.width=width;room.height=height;return true;
}
export function line(x0,y0,x1,y1,fn){
 const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
 for(;;){fn(x0,y0);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
}
