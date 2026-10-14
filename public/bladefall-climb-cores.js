/* Continuous Core worlds, opened by both halves of their plant in Garden & skins.
   Legacy cside fields preserve reward saves; the public name and API are Cores. */
(function(root){'use strict';
const CL=root.BladefallClimb;if(!CL)return;
const worlds=(root.BladefallClimbCoreData||[]).map(source=>{
 const room={...source.room,id:source.room.coreProgressKey,origin:source.room.id},k=room.core;
 const W={n:100+k,key:'core-'+k,core:k,cside:k,draft:source.draft,name:({1:'Outskirts',2:'Black Woods',3:'Causeway',4:'Updrafts',5:'Hollow Marksman',6:'Ruined Keep',7:'Gaol',8:'Frostfell',9:'White Court',10:'Emberdeep',11:'Colossus Foundry',12:'The Inversion',13:'Tyrant Citadel',14:'Abyss Throne',15:'The Deep Line'}[k]||'World '+k)+' · Core',palette:room.palette,kit:k===1?['dash']:k>=6?['dash','strike','parry','portal']:k===5?['dash','strike','parry']:['dash','strike'],
 blurb:source.description,outro:({1:'The trumpet sounds.',2:'The Oath Root is cleared.',3:'The last counterweight comes to rest.',4:'The borrowed sky releases you.',5:'The watch has its answer.',6:'The mason’s grip holds.',7:'The unwritten sentence ends.',8:'The winter opens.',9:'The borrowed marble returns to water.',10:'The furnace gives up its shape.',11:'The last stroke cools.',12:'The weight settles where it belongs.',13:'The wall remembers you were here.',14:'The place you left is yours again.',15:'The line runs out; you do not.'}[k]||'Core cleared.'),sections:[{room:room.id,x:0,y:0,fire:source.fire}],quests:[],secrets:[],rooms:[room],tapes:{[room.id]:source.tape},folk:{},props:{},saved:[],difficulty:{min:5,max:5},atlasStart:room.id,atlasEnd:room.id,passages:[],atlasPassagesReady:true,requiredBankRooms:[],requiredMainRooms:[]};
 if(CL.wanted)CL.addWorld(W);return W;
});
root.BladefallClimbCores=Object.freeze({worlds,rooms:worlds.flatMap(w=>w.rooms)});
})(typeof window!=='undefined'?window:globalThis);
