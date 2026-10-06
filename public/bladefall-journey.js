/* One authored reward ledger for campaign upgrades and perfect-entry previews. */
(function(root){
  'use strict';
  // entry is the first level whose preview includes this reward. Return-route
  // rewards unlock after Frostfell, even when their objects live in early regions.
  const rows=[
    // 7.234 (owner): the Black Woods fragment is Elsie's, for her optional supper, not Bram's on the main road.
    ['traveler:mara',1,1,0],['traveler:bram',2,0,0],['sidestory:refuge',2,1,0],
    ['secret:sentinel-vigil',2,0,1],
    ['boss:brute',3,0,1],['quest:release-the-causeway',3,0,1],
    ['secret:kite-mast',4,0,1],['secret:rain-catcher-height',4,1,0],
    ['boss:archer',5,1,1],['secret:windcut-command-token',5,0,1],
    ['secret:marksman-return-loft',6,0,1],['quest:road-without-a-name',6,1,0],
    ['boss:warden',7,1,1],['secret:frost-washhouse-wrap',8,1,0],
    ['authored:frost-hearths',8,0,1],['quest:kindling-the-sky',8,1,0],
    ['secret:recall-return-warden',8,1,0],['secret:recall-return-outskirts',8,0,1],
    ['secret:recall-return-black-woods',8,1,0],['secret:recall-return-brute',8,0,1],
    ['authored:court-service-wheel',9,0,1],['secret:court-high-cache',9,1,0],
    ['boss:sorcerer',9,2,0],['boss:colossus',11,1,2],
    ['quest:inventory-of-effects',11,1,0],
    ['secret:echo-press',14,0,1],['secret:throne-tide-cache',14,1,0],['dialogue:oren-throne-repair',14,0,1],
    ['secret:citadel-refuge-loft',13,1,0],['secret:citadel-vigil-cache',13,0,1],
    ['workshop:last-inventory',12,1,0],['authored:inversion-drop-lock',12,0,1],['authored:inversion-last-breath',12,1,0],
    ['workshop:ethereal-goods',2,1,0],['workshop:bellows-exchange',4,0,1],
    ['workshop:keepers-counter',6,0,1],['workshop:white-exchange',8,1,0],
    ['workshop:sluice-counter',9,0,1],['workshop:cinder-ledger',10,1,0]
  ];
  const GIFTS=Object.freeze({ward:2,'gathering-thread':2,'blood-vow':3,'fault-bell':3,'chain-vow':3,'gale-stitch':4,'far-thread':5,'road-knot':6,'gilded-instinct':7,'red-tempo':7,'sky-kindling':8,'rime-step':9,'white-hush':9,'cinder-oath':11,'ember-step':10,'oren-dash':10,'pure-nail':14});
  const REWARDS=Object.freeze(Object.fromEntries(rows.map(([id,entry,vitality,forge])=>[id,Object.freeze({id,entry,vitality,forge})])));
  function create(raw){return {version:1,gifts:[...new Set((raw&&raw.gifts||[]).filter(id=>GIFTS[id]))],claimed:[...new Set((raw&&raw.claimed||[]).filter(id=>REWARDS[id]))],attitudes:{...(raw&&raw.attitudes||{})}};}
  function claim(raw,id){const state=create(raw),reward=REWARDS[id];if(!reward||state.claimed.includes(id))return {state,changed:false};state.claimed.push(id);return {state,changed:true,reward};}
  function profile(raw){const state=create(raw);let vitality=0,forge=0;for(const id of state.claimed){vitality+=REWARDS[id].vitality;forge+=REWARDS[id].forge;}return {vitality,fragments:vitality%4,healthBonus:Math.floor(vitality/4),forge,powerMultiplier:1+forge*.06};}
  // Shops are cut for now (owner 7.234), so a preview never assumes a workshop gift.
  function preview(stage){return create({gifts:Object.keys(GIFTS).filter(id=>GIFTS[id]<=stage),claimed:rows.filter(row=>row[1]<=stage&&!row[0].startsWith('workshop:')).map(row=>row[0])});}
  function migrate(raw,legacy){const state=create(raw);for(const id of legacy&&legacy.sources||[])if(REWARDS[id]&&!state.claimed.includes(id))state.claimed.push(id);return state;}
  root.BladefallJourney=Object.freeze({REWARDS,GIFTS,create,claim,profile,preview,migrate});
})(typeof globalThis!=='undefined'?globalThis:window);
