/* Continuous Core worlds, opened by both halves of their plant in Garden & skins.
   Legacy cside fields preserve reward saves; the public name and API are Cores. */
(function(root){'use strict';
const CL=root.BladefallClimb;if(!CL)return;
const worlds=(root.BladefallClimbCoreData||[]).map(source=>{
 const room={...source.room,id:source.room.coreProgressKey,origin:source.room.id},k=room.core;
 const W={n:100+k,key:'core-'+k,core:k,cside:k,draft:source.draft,name:({1:'Outskirts',2:'Black Woods',3:'Causeway'}[k]||'World '+k)+' · Core',palette:room.palette,kit:k===1?['dash']:['dash','strike'],
 blurb:source.description,outro:({1:'The trumpet sounds.',2:'The Oath Root is cleared.',3:'The last counterweight comes to rest.'}[k]||'Core cleared.'),sections:[{room:room.id,x:0,y:0,fire:source.fire}],quests:[],secrets:[],rooms:[room],tapes:{[room.id]:source.tape},folk:{},props:{},saved:[],difficulty:{min:5,max:5},atlasStart:room.id,atlasEnd:room.id,passages:[],atlasPassagesReady:true,requiredBankRooms:[],requiredMainRooms:[]};
 if(CL.wanted)CL.addWorld(W);return W;
});
root.BladefallClimbCores=Object.freeze({worlds,rooms:worlds.flatMap(w=>w.rooms)});
})(typeof window!=='undefined'?window:globalThis);
