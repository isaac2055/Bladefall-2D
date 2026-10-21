/* Explore object graph: keep circuit IDs, shared boss references, Sets and Maps intact while editing. */
(function(root){
'use strict';
const M=()=>root.BladefallWorkshopModel;
const collections=['obstacles','enemies','pickups','npcs'];
function pack(value,{nativeRoot}={}){
 const nativePaths=new Map(),visited=new Set();
 function scan(v,path){if(typeof v==='function'){nativePaths.set(v,path);return;}if(!v||typeof v!=='object'||visited.has(v))return;visited.add(v);for(const[k,x]of Object.entries(v))scan(x,[...path,k]);}
 if(nativeRoot)scan(nativeRoot,[]);
 const nodes={},seen=new Map();let next=0;
 function encode(v){
  if(v===undefined)return {$undefined:true};
  if(typeof v==='number'&&!Number.isFinite(v))return {$num:String(v)};   // (7.363) Infinity / NaN in stage state (the Outskirts has some)
  if(v===null||['number','string','boolean'].includes(typeof v))return M().json(v);
  if(typeof v==='function'&&nativePaths.has(v))return {$native:nativePaths.get(v)};
  if(typeof v!=='object')throw Error('This level contains executable state that cannot be saved as a level.');
  if(seen.has(v))return {$ref:seen.get(v)};
  const id='node-'+next++;seen.set(v,id);nodes[id]=null;
  const kind=Object.prototype.toString.call(v);
  if(kind==='[object Set]')nodes[id]={kind:'set',items:[...v].map(encode)};
  else if(kind==='[object Map]')nodes[id]={kind:'map',items:[...v].map(([k,x])=>[encode(k),encode(x)])};
  else if(Array.isArray(v))nodes[id]={kind:'array',items:v.map(encode)};
  else if(kind==='[object Object]')nodes[id]={kind:'object',props:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)]))};
  else throw Error('Unsupported level data: '+kind);
  return {$ref:id};
 }
 const entry=encode(value);return M().json({entry,nodes});
}
function unpack(input,{nativeRoot}={}){
 const graph=M().json(input),out={};
 for(const[id,n]of Object.entries(graph.nodes)){
  if(!['object','array','set','map'].includes(n.kind))throw Error('Unknown object kind.');out[id]=n.kind==='array'?[]:n.kind==='set'?new Set():n.kind==='map'?new Map():{};
 }
 function decode(v){
  if(v===null||typeof v!=='object')return v;
  if(Array.isArray(v.$native)&&Object.keys(v).length===1){
   if(!v.$native.length||!v.$native.every(k=>typeof k==='string'&&!['__proto__','prototype','constructor'].includes(k)))throw Error('Invalid native behavior reference.');
   if(!nativeRoot)return undefined;let fn=nativeRoot;for(const k of v.$native)fn=fn&&Object.hasOwn(fn,k)?fn[k]:undefined;
   if(typeof fn!=='function')throw Error('This level uses a native behavior that is no longer available.');return fn;
  }
  if(v.$undefined===true&&Object.keys(v).length===1)return undefined;
  if(typeof v.$num==='string'&&Object.keys(v).length===1){if(!['Infinity','-Infinity','NaN'].includes(v.$num))throw Error('Invalid number in level data.');return Number(v.$num);}
  if(typeof v.$ref!=='string'||Object.keys(v).length!==1||!Object.hasOwn(out,v.$ref))throw Error('An object link points to missing level data.');return out[v.$ref];
 }
 for(const[id,n]of Object.entries(graph.nodes)){
  if(n.kind==='object')for(const[k,v]of Object.entries(n.props))Object.defineProperty(out[id],k,{value:decode(v),enumerable:true,configurable:true,writable:true});
  else if(n.kind==='map')for(const[k,v]of n.items)out[id].set(decode(k),decode(v));
  else if(n.kind==='set')for(const v of n.items)out[id].add(decode(v));
  else for(const v of n.items)out[id].push(decode(v));
 }
 return decode(graph.entry);
}
function fromState(state){
 const level={stageIndex:state.stageIndex,levelLength:state.levelLength,killGoal:state.killGoal||0,start:{x:state.p?.ckSet?state.p.ckX:state.p?.x||70,y:state.p?.ckSet?state.p.ckY:state.p?.y||0},boss:state.boss||null,portal:state.portal||null};
 for(const key of collections)level[key]=state[key]||[];
 // Keep stage-specific mechanisms and their aliases in the same graph as the entities.
 const omitted=new Set([...collections,'p','boss','portal','particles','texts','projectiles','aoes','shadows','runStats','runCompletion','runCoinFound','sessionQuests','sessionSideStories','sessionCapabilities','sessionZoneState','sessionJourney','baseLoadout','levelStartSnap','checkpointLoadout','authoring','levelCharter','geometryAudit','levelSelectMode','bossRush','ngPlus','ngHp','ngDmg','simSeed','usedTestMode']);
 level.context=Object.fromEntries(Object.entries(state).filter(([key])=>!omitted.has(key)&&!/^(_?coop|session|leaderboard|worldProgress|run|playtest)/.test(key)));
 return {kind:'explore',graph:pack(level,{nativeRoot:state})};
}
function blank(){return {kind:'explore',graph:pack({blank:true,kit:'full',stageIndex:0,levelLength:2400,killGoal:0,start:{x:100,y:0},boss:null,portal:{x:2280,y:0,t:0},obstacles:[{type:'plat',x:1200,y:0,w:2400,h:20}],enemies:[],pickups:[],npcs:[],context:{}})};}
function compile(def,options){
 if(def.kind!=='explore')throw Error('This is not an Explore level.');const level=unpack(def.graph,options);
 if(level.blank!==undefined&&typeof level.blank!=='boolean')throw Error('Invalid blank-level setting.');
 if(level.blank&&level.kit!==undefined&&!['jump','dash','full'].includes(level.kit))throw Error('Choose a valid starting ability kit.');
 if(level.blank&&(level.stageIndex!==0||Object.keys(level.context||{}).length))throw Error('Blank levels use their own stage with no campaign context.');
 if(!Number.isInteger(level.stageIndex)||level.stageIndex<0||!Number.isFinite(level.levelLength)||level.levelLength<=0)throw Error('Invalid Explore level bounds.');
 for(const c of collections){if(!Array.isArray(level[c]))throw Error('Missing '+c+' collection.');for(const e of level[c])if(!e||!Number.isFinite(e.x)||(e.y!==undefined&&!Number.isFinite(e.y)))throw Error('Every '+c+' object needs finite x and y coordinates.');}
 if(level.portal&&(!Number.isFinite(level.portal.x)||level.portal.y!==undefined&&!Number.isFinite(level.portal.y)))throw Error('Place a valid level exit.');
 if(!level.start||!Number.isFinite(level.start.x)||!Number.isFinite(level.start.y))throw Error('Place a valid knight spawn.');return level;
}
function objects(def){
 const graph=def.graph,level=graph.nodes[graph.entry.$ref],out=[],seen=new Set();
 const add=(ref,collection)=>{if(!ref?.$ref||seen.has(ref.$ref))return;const n=graph.nodes[ref.$ref];if(n?.kind!=='object'||!Number.isFinite(n.props.x)||(n.props.y!==undefined&&!Number.isFinite(n.props.y)))return;seen.add(ref.$ref);const p=n.props,w=Number.isFinite(p.w)?p.w:collection==='portal'?90:20,h=p.wall&&Number.isFinite(p.len)?p.len:Number.isFinite(p.h)?p.h:collection==='portal'?110:p.type==='pit'?80:20,topAnchored=['plat','pit','wall','door','fluid'].includes(p.type),anchorY=topAnchored?0:((p.wall&&p.type==='spikes')||collection==='pickups'||p.type==='lportal')?0.5:1;out.push({id:ref.$ref,path:['definition','graph','nodes',ref.$ref,'props'],collection,kind:'object',label:p.type||p.kind||collection,x:p.x-w/2,y:-(p.y||0)-anchorY*h,w,h,topAnchored,anchorY,data:M().json(p)});};
 for(const c of collections){const arr=graph.nodes[level.props[c]?.$ref];for(const ref of arr?.items||[])add(ref,c);}
 add(level.props.boss,'boss');add(level.props.portal,'portal');add(level.props.start,'spawn');return out;
}
function move(def,id,{x,y,w,h}){
 const obj=objects(def).find(o=>o.id===id);if(!obj)throw Error('Object no longer exists.');const width=w??obj.w,height=h??obj.h;
 const data={...obj.data,x:x+width/2,y:-y-obj.anchorY*height};if(w!==undefined)data.w=width;if(h!==undefined){if(data.wall&&data.type==='spikes')data.len=height;else data.h=height;}
 const dx=data.x-obj.data.x,dy=data.y-(obj.data.y||0);
 for(const k of ['x0','x1','x2','fx','homeX','spawnX'])if(Number.isFinite(data[k]))data[k]+=dx;
 for(const k of ['y0','y1','y2','yPrev','fy','homeY','spawnY','slopeY0','slopeY1'])if(Number.isFinite(data[k]))data[k]+=dy;
 return {path:obj.path,value:data};
}
const palette=[['plat','Platform'],['wall','Climbable wall'],['pit','Pit'],['spikes','Timed spikes'],['crate','Crate'],['spring','Spring'],['updraft','Updraft'],['lever','Lever'],['plate','Pressure plate'],['door','Circuit door'],['lportal','Portal mouth'],['check','Checkpoint flag'],['exit','Level exit']];
function insert(def,{id,glyph,x,y,w=40,h=20}){
 if(def.graph.nodes[id])throw Error('Object ID already exists.');
 if(!palette.some(([key])=>key===glyph))throw Error('Choose an Explore object type.');
 const sizes={plat:[160,20],wall:[30,160],pit:[180,80],spikes:[100,20],crate:[36,34],spring:[40,20],updraft:[120,320],lever:[24,40],plate:[60,10],door:[36,180],lportal:[40,80],check:[24,64],exit:[90,110]};
 const [width,height]=sizes[glyph],data={type:glyph,x:x+width/2,y:-y-(['plat','wall','pit','door'].includes(glyph)?0:height),w:width,h:height};
 if(glyph==='check')data.active=0;
 if(glyph==='exit')data.t=0;
 if(glyph==='wall')data.clingSurface=1;
 if(glyph==='spikes')Object.assign(data,{period:2.4,phase:0,upT:1,dmg:12});
 if(glyph==='crate')Object.assign(data,{x0:data.x,y0:data.y,yPrev:data.y,vy:0,resetF:0});
 if(glyph==='spring')Object.assign(data,{pow:930,anim:0});
 if(glyph==='lever')Object.assign(data,{id:'new-circuit',dur:4,timer:0,flip:0});
 if(glyph==='plate')Object.assign(data,{id:'new-circuit',latch:false,crateOnly:false,pressed:false,down:0});
 if(glyph==='door')data.circuit='new-circuit';
 if(glyph==='lportal')Object.assign(data,{pg:'new-pair',nx:1,ny:0,t:0,portalLesson:'fixed'});
 const nodes=def.graph.nodes,level=nodes[def.graph.entry.$ref],arrayId=level.props.obstacles.$ref;
 if(glyph==='exit')return [{path:['definition','graph','nodes',id],value:{kind:'object',props:data}},{path:['definition','graph','nodes',def.graph.entry.$ref,'props','portal'],value:{$ref:id}}];
 return [{path:['definition','graph','nodes',id],value:{kind:'object',props:data}},{path:['definition','graph','nodes',arrayId,'items'],value:[...nodes[arrayId].items,{$ref:id}]}];
}
function remove(def,id){
 const nodes=def.graph.nodes,level=nodes[def.graph.entry.$ref];if(level.props.start.$ref===id)throw Error('Move the knight spawn instead of deleting it.');
 if(!objects(def).some(o=>o.id===id))throw Error('Object no longer exists.');const edits=[];
 // Remove incoming aliases as well; never leave dangling references in saved circuits.
 for(const[key,node]of Object.entries(nodes)){
  if(key===id)continue;
  const path=['definition','graph','nodes',key];
  if(node.kind==='object'){for(const[prop,value]of Object.entries(node.props))if(value?.$ref===id)edits.push({path:[...path,'props',prop],value:null});}
  else{const items=node.kind==='map'?node.items.filter(pair=>!pair.some(v=>v?.$ref===id)):node.items.filter(v=>v?.$ref!==id);if(items.length!==node.items.length)edits.push({path:[...path,'items'],value:items});}
 }
 edits.push({path:['definition','graph','nodes',id],remove:true});return edits;
}
function duplicate(def,id,{newId,dx=40,dy=0}){
 const obj=objects(def).find(o=>o.id===id);if(!obj||obj.collection==='spawn')throw Error('Select an object to duplicate.');if(obj.collection==='portal')throw Error('Each Explore level has one exit. Move it or add a replacement.');
 const nodes=def.graph.nodes,level=nodes[def.graph.entry.$ref],collection=collections.includes(obj.collection)?obj.collection:'obstacles';
 const arrayId=level.props[collection].$ref,entityIds=new Set(objects(def).map(o=>o.id)),copies=new Map([[id,newId]]),edits=[];
 function copyRef(v){if(!v?.$ref||entityIds.has(v.$ref)&&v.$ref!==id)return M().json(v);if(copies.has(v.$ref))return {$ref:copies.get(v.$ref)};const key=newId+'-config-'+copies.size;copies.set(v.$ref,key);copyNode(v.$ref,key);return {$ref:key};}
 function copyNode(old,key){if(nodes[key])throw Error('Object ID already exists.');const n=nodes[old];const value=n.kind==='object'?{kind:n.kind,props:Object.fromEntries(Object.entries(n.props).map(([k,v])=>[k,copyRef(v)]))}:{kind:n.kind,items:n.items.map(v=>n.kind==='map'?v.map(copyRef):copyRef(v))};edits.push({path:['definition','graph','nodes',key],value});}
 copyNode(id,newId);const body=edits.find(e=>e.path.at(-1)===newId).value.props,moved=move(def,id,{x:obj.x+dx,y:obj.y+dy}).value;
 for(const[k,v]of Object.entries(moved))if(v===null||typeof v!=='object')body[k]=v;
 delete body._zoneEntityId;delete body.entityId;
 edits.push({path:['definition','graph','nodes',arrayId,'items'],value:[...nodes[arrayId].items,{$ref:newId}]});return edits;
}
function settings(def){const id=def.graph.entry.$ref,p=def.graph.nodes[id].props,out=[{key:'levelLength',label:'Level length',value:p.levelLength,min:100,step:100,path:['definition','graph','nodes',id,'props','levelLength']}];if(p.blank)out.push({key:'kit',label:'Starting abilities',value:p.kit||'full',choices:[['jump','Jump only'],['dash','Sword and dash'],['full','Full expedition kit']],path:['definition','graph','nodes',id,'props','kit']});return out;}
root.BladefallWorkshopExplore=Object.freeze({pack,unpack,fromState,blank,compile,objects,move,insert,remove,duplicate,palette,settings,collections});
})(globalThis);
