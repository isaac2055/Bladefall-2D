/* Lossless tile-room adapter. Device timing/travel settings follow the moved body, not map order. */
(function(root){
'use strict';
const M=()=>root.BladefallWorkshopModel;
const bound={Z:{field:'zips',fallback:[0,-4]},E:{field:'slabs',fallback:{}},X:{field:'shutters',fallback:{}}};
const rectangular=new Set('#=^v<>%!ABKZGHM~EXYQ|CVSFRw'.split(''));
function groups(map,cols,rows){const seen=new Set(),out=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
 const glyph=map[r][c],key=r*cols+c;if(glyph==='.'||seen.has(key))continue;let w=1,h=1;
 if(rectangular.has(glyph)){while(c+w<cols&&map[r][c+w]===glyph&&!seen.has(r*cols+c+w))w++;outer:while(r+h<rows){for(let i=0;i<w;i++)if(map[r+h][c+i]!==glyph||seen.has((r+h)*cols+c+i))break outer;h++;}}
 for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)seen.add(y*cols+x);out.push({glyph,c,r,w,h});
}return out;}
function fromRoom(input){
 const room=M().json(Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined))),cols=room.cols||40,rows=room.rows||23;
 if(!Array.isArray(room.map)||room.map.length!==rows||room.map.some(r=>typeof r!=='string'||r.length!==cols))throw Error('The room map dimensions do not match.');
 const bodies={},counts={};groups(room.map,cols,rows).forEach((b,i)=>{const cfg=bound[b.glyph],n=counts[b.glyph]||0;counts[b.glyph]=n+1;if(cfg&&Array.isArray(room[cfg.field])&&n<room[cfg.field].length)b.settings=M().json(room[cfg.field][n]);bodies['tile-'+i]=b;});
 delete room.map;
 const tails={};for(const [glyph,cfg]of Object.entries(bound)){if(Array.isArray(room[cfg.field]))tails[cfg.field]=room[cfg.field].slice(counts[glyph]||0);delete room[cfg.field];}
 return {kind:'ascend',room,bodies,tails};
}
function compile(def){
 if(def.kind!=='ascend')throw Error('This is not an Ascend level.');const room=M().json(def.room),cols=room.cols||40,rows=room.rows||23;
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<2||rows<2||cols*rows>1000000)throw Error('Choose valid room dimensions (up to one million tiles).');
 const map=Array.from({length:rows},()=>Array(cols).fill('.')),owners=new Map(),bodies=Object.entries(def.bodies).sort((a,b)=>a[1].r-b[1].r||a[1].c-b[1].c||a[0].localeCompare(b[0]));
 for(const [id,b]of bodies){
  if(typeof b.glyph!=='string'||b.glyph.length!==1||b.glyph==='.'||!['c','r','w','h'].every(k=>Number.isInteger(b[k]))||b.c<0||b.r<0||b.w<1||b.h<1||b.c+b.w>cols||b.r+b.h>rows)throw Error('A tile object is outside the room or has invalid dimensions.');
  for(let r=b.r;r<b.r+b.h;r++)for(let c=b.c;c<b.c+b.w;c++){if(map[r][c]!=='.')throw Error('Tile objects overlap. Move or remove the existing tiles first.');map[r][c]=b.glyph;owners.set(r*cols+c,id);}
 }
 room.map=map.map(r=>r.join(''));
 const parsed=groups(room.map,cols,rows),counts={};
 for(const [glyph,cfg]of Object.entries(bound)){
  const list=parsed.filter(b=>b.glyph===glyph),settings=[];let last=-1;
  for(const [i,b]of list.entries()){
   const id=owners.get(b.r*cols+b.c),original=def.bodies[id];
   for(let r=b.r;r<b.r+b.h;r++)for(let c=b.c;c<b.c+b.w;c++)if(owners.get(r*cols+c)!==id)throw Error('Separate these '+glyph+' devices by one tile so their settings remain independent.');
   if(original.c!==b.c||original.r!==b.r||original.w!==b.w||original.h!==b.h)throw Error('A configured device was split by other geometry.');
   settings.push(Object.hasOwn(original,'settings')?M().json(original.settings):M().json(cfg.fallback));if(Object.hasOwn(original,'settings'))last=i;
  }
  const tail=def.tails?.[cfg.field]||[];if(tail.length)room[cfg.field]=[...settings,...M().json(tail)];else if(last>=0)room[cfg.field]=settings.slice(0,last+1);else if(Object.hasOwn(def.tails||{},cfg.field))room[cfg.field]=[];
  counts[glyph]=list.length;
 }
 if(room.map.join('').split('P').length!==2)throw Error('Place exactly one knight spawn.');
 return room;
}
function objects(def){
 const out=Object.entries(def.bodies).map(([id,b])=>({id,path:['definition','bodies',id],kind:'tile',label:b.glyph,x:b.c*8,y:b.r*8,w:b.w*8,h:b.h*8,data:M().json(b)}));
 function walk(v,path){if(!v||typeof v!=='object')return;
  if(!Array.isArray(v)&&(Number.isFinite(v.c)&&Number.isFinite(v.r)||Number.isFinite(v.x)&&Number.isFinite(v.y))){const tile=Number.isFinite(v.c)&&Number.isFinite(v.r),scale=tile?8:1;out.push({id:'config/'+path.join('/'),path:['definition','room',...path],kind:'device',tile,scale,label:String(v.name||v.id||path[0]),x:(tile?v.c:v.x)*scale,y:(tile?v.r:v.y)*scale,w:(v.w||1)*scale,h:(v.h||1)*scale,data:M().json(v)});}
  for(const[k,x]of Object.entries(v))walk(x,[...path,Array.isArray(v)?+k:k]);
 }walk(def.room,[]);return out;
}
function move(def,id,{x,y,w,h}){const obj=objects(def).find(o=>o.id===id);if(!obj)throw Error('Object no longer exists.');
 if(obj.kind==='device'){const next={...obj.data,[obj.tile?'c':'x']:Math.round(x/obj.scale),[obj.tile?'r':'y']:Math.round(y/obj.scale)};if(w!==undefined)next.w=Math.max(1,Math.round(w/obj.scale));if(h!==undefined)next.h=Math.max(1,Math.round(h/obj.scale));return {path:obj.path,value:next};}
 const b=obj.data,next={...b,c:Math.round(x/8),r:Math.round(y/8),w:w===undefined?b.w:Math.max(1,Math.round(w/8)),h:h===undefined?b.h:Math.max(1,Math.round(h/8))};return {path:obj.path,value:next};
}
function insert(def,{id,glyph,x,y,w=8,h=8}){const b={glyph,c:Math.round(x/8),r:Math.round(y/8),w:Math.max(1,Math.round(w/8)),h:Math.max(1,Math.round(h/8))};if(bound[glyph])b.settings=M().json(bound[glyph].fallback);const edit={path:['definition','bodies',id],value:b};if(glyph==='P'){b.w=b.h=1;return [...Object.entries(def.bodies).filter(([,body])=>body.glyph==='P').map(([key])=>({path:['definition','bodies',key],remove:true})),edit];}return edit;}
function remove(def,id){const obj=objects(def).find(o=>o.id===id);if(!obj)throw Error('Object no longer exists.');const path=obj.path,last=path.at(-1);if(typeof last!=='number')return {path,remove:true};let arr=def;for(const key of path.slice(1,-1))arr=arr[key];return {path:path.slice(0,-1),value:arr.filter((_,i)=>i!==last)};}
function duplicate(def,id,{newId,dx=16,dy=0}){
 const obj=objects(def).find(o=>o.id===id);if(!obj||obj.data.glyph==='P')throw Error('Select an object other than the knight spawn.');
 const value=move(def,id,{x:obj.x+dx,y:obj.y+dy}).value;
 if(obj.kind==='tile'){if(def.bodies[newId])throw Error('Object ID already exists.');return {path:['definition','bodies',newId],value};}
 const path=obj.path,last=path.at(-1);if(typeof last!=='number')throw Error('This unique device cannot be duplicated.');let arr=def;for(const key of path.slice(1,-1))arr=arr[key];return {path:path.slice(0,-1),value:[...arr,value]};
}
function settings(def){return [['cols','Width in tiles'],['rows','Height in tiles']].map(([key,label])=>({key,label,value:def.room[key],min:2,path:['definition','room',key]}));}
root.BladefallWorkshopAscend=Object.freeze({fromRoom,compile,objects,move,insert,remove,duplicate,settings,bound});
})(globalThis);
