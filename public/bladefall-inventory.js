(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BladefallInventory=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=1,CAPACITY=24;
  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function createState(raw){
    const src=raw&&typeof raw==='object'?raw:{};
    return{version:VERSION,revision:Number(src.revision)||0,nextId:Math.max(1,Number(src.nextId)||1),items:Array.isArray(src.items)?src.items.slice(0,CAPACITY).map(clone):[]};
  }
  function kindOf(item){return item&&item.arche?'weapon':item&&item.slot?'armor':'item';}
  function collect(raw,item,sourceId){
    const state=createState(raw);if(!item)return{ok:false,reason:'missing-item',state};
    if(state.items.length>=CAPACITY)return{ok:false,reason:'bag-full',state};
    const entry={id:'bag-'+state.nextId++,kind:kindOf(item),sourceId:String(sourceId||''),item:clone(item)};
    state.items.push(entry);state.revision++;
    return{ok:true,state,entry:clone(entry)};
  }
  function remove(raw,id){
    const state=createState(raw),index=state.items.findIndex(row=>row.id===id);
    if(index<0)return{ok:false,reason:'missing-entry',state};
    const entry=state.items.splice(index,1)[0];state.revision++;return{ok:true,state,entry};
  }
  function get(raw,id){return createState(raw).items.find(row=>row.id===id)||null;}
  function label(entry){const item=entry&&entry.item||{};return item.name||item.disp||item.arche||item.slot||'Unknown object';}
  return Object.freeze({VERSION,CAPACITY,createState,collect,remove,get,label,kindOf});
});
