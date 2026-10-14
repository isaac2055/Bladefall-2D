/* Playtest frames get disposable campaign/profile storage; the draft library remains available. */
(function(root){
'use strict';
const query=new URLSearchParams(root.location.search);
if(!query.has('workshopPlay')&&!query.has('workshopSource'))return;
root.BLADEFALL_WORKSHOP_SOURCE=query.has('workshopSource');
if(root.BLADEFALL_WORKSHOP_SOURCE)root.BLADEFALL_ROOM_BANK=true;
root.BLADEFALL_WORKSHOP_PLAY=true;
for(const key of ['localStorage','sessionStorage']){const data=new Map(),storage={getItem:k=>data.has(String(k))?data.get(String(k)):null,setItem:(k,v)=>data.set(String(k),String(v)),removeItem:k=>data.delete(String(k)),clear:()=>data.clear(),key:i=>[...data.keys()][i]??null,get length(){return data.size;}};Object.defineProperty(root,key,{value:storage,configurable:true});}
})(globalThis);
