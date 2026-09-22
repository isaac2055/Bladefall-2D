(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BladefallDialogue=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=1,STORAGE_KEY='bladefall_dialogue_overrides_v1';
  const ENTRIES=Object.freeze({
    'ui.rest':{level:0,type:'ui',speaker:'Waystation',text:'Rested at {name}. Blood restored; tools refilled.'},
    'outskirts.mara.ask':{level:0,type:'npc',speaker:'Mara',text:'Three bearings still stand. Walk them with me and the chart is finished.'},
    'outskirts.mara.progress':{level:0,type:'npc',speaker:'Mara',text:'There’s still a stretch of road I can’t account for.'},
    'outskirts.mara.done':{level:0,type:'npc',speaker:'Mara',text:'They agree. The tunnel reaches the woods. Take the chart; I have it by heart.'},
    'outskirts.vey.before':{level:0,type:'npc',speaker:'Vey',text:'“The coals are warm. I don’t remember lighting them.”'},
    'outskirts.vey.after':{level:0,type:'npc',speaker:'Vey',text:'“You came back. I kept a place by the fire.”'},
    'outskirts.olan.first':{level:0,type:'npc',speaker:'Olan',text:'“The clock stopped at 3:40. The patrols didn’t.”'},
    'outskirts.olan.revisit':{level:0,type:'npc',speaker:'Olan',text:'“Still 3:40.”'},
    'outskirts.olan.muster':{level:0,type:'npc',speaker:'Olan',text:'“Those posts were empty this morning. I never heard anyone arrive.”'},
    'outskirts.exit':{level:0,type:'sign',speaker:'Tunnel marker',text:'MOTHLIGHT TUNNEL · BLACK WOODS'},
    'outskirts.relic.first-draught':{level:0,type:'item',speaker:'Chalice of the First Draught',text:'A tin cup rolls from a gloved hand beside a tent. The light is much too bright.'},
    'woods.orra.first':{level:1,type:'npc',speaker:'Orra',text:'“Still 3:40. It has been, all morning.”'},
    'woods.orra.revisit':{level:1,type:'npc',speaker:'Orra',text:'“Three forty. The hand has not moved.”'},
    'woods.orra.muster':{level:1,type:'npc',speaker:'Orra',text:'“Three forty still. But the bells are ringing, and no bell keeps this hour. The workers’ reserve above the end of Briar Run lowers an honest canopy walk.”'},
    'woods.pell.first':{level:1,type:'npc',speaker:'Pell',text:'“Honest bark wears amber on its windward edge. Copies shine against the wind.”'},
    'woods.pell.revisit':{level:1,type:'npc',speaker:'Pell',text:'“Amber with the wind means honest.”'},
    'woods.blade.bound':{level:1,type:'item',speaker:'Oathblade',text:'Roots grip the blade. A vine climbs toward an old counterweight.'},
    'woods.blade.free':{level:1,type:'item',speaker:'Oathblade',text:'The roots slacken. The blade can be taken.'},
    'woods.hale.before':{level:1,type:'npc',speaker:'Hale',text:'The road’s blade is caught in the roots ahead. Free it before the trees learn your shape.'},
    'woods.hale.after':{level:1,type:'npc',speaker:'Hale',text:'That blade knows this road. Keep it between you and whatever knows your name.'},
    'woods.exit':{level:1,type:'sign',speaker:'Root tunnel marker',text:'BROKEN CAUSEWAY · ROOT TUNNEL'},
    'woods.bram.first':{level:1,type:'npc',speaker:'Bram',text:'I’ll bring the lamp. The wind keeps changing.'},
    'woods.bram.repeat':{level:1,type:'npc',speaker:'Bram',text:'See how the light passes through that bark?'},
    'woods.bram.done':{level:1,type:'npc',speaker:'Bram',text:'Solid ground. I’ll keep a light here for your return.'},
    'woods.relic.red-clasp':{level:1,type:'item',speaker:'Clasp of the Unbroken Standard',text:'A fist closes around a red cloak clasp. Tent canvas snaps overhead; the hand will not release it.'},
    'causeway.oren.first':{level:2,type:'npc',speaker:'Oren',text:'“I have been listening to that gate all morning.”'},
    'causeway.oren.revisit':{level:2,type:'npc',speaker:'Oren',text:'“Still pulling. I can feel it through the handle.”'},
    'causeway.oren.muster':{level:2,type:'npc',speaker:'Oren',text:'“The chain counted itself last night. Every link answered. I never touched the handle.”'},
    'causeway.sable.first':{level:2,type:'npc',speaker:'Sable',text:'“The lower planks are slower but covered. The hanging walk is quicker, and every guard can see it.”'},
    'causeway.sable.revisit':{level:2,type:'npc',speaker:'Sable',text:'“Choose the lower cover or the visible chainwalk. Neither choice is a secret.”'},
    'causeway.weight-sign':{level:2,type:'sign',speaker:'Yard sign',text:'A LANDED WEIGHT HOLDS WHAT IT HITS.'},
    'causeway.relic.wristguard':{level:2,type:'item',speaker:'Wristguard of the Bearer',text:'Rough leather bites one wrist. Weight crosses both shoulders; earth fills the view beneath snapping tent canvas.'},
    'causeway.bow':{level:2,type:'item',speaker:'Chainwake Longbow',text:'A recurved bow built for high, exact shots.'},
    'causeway.rivets':{level:2,type:'object',speaker:'Retaining Rivets',text:'Three bright rivets hold the alarm assembly.'},
    'causeway.counterweight':{level:2,type:'object',speaker:'Counterweight',text:'A resettable weight hangs over the old killing floor.'}
  });
  function safeOverrides(raw){const out={};if(raw&&typeof raw==='object')for(const id of Object.keys(ENTRIES))if(typeof raw[id]==='string')out[id]=raw[id];return out;}
  function load(){try{return safeOverrides(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'));}catch(_){return{};}}
  function save(raw){const value=safeOverrides(raw);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value));}catch(_){}return value;}
  function text(id,tokens,overrides){let value=(safeOverrides(overrides)[id]||load()[id]||(ENTRIES[id]&&ENTRIES[id].text)||id);for(const key in tokens||{})value=value.replaceAll('{'+key+'}',String(tokens[key]));return value;}
  function catalog(){return Object.keys(ENTRIES).map(id=>Object.assign({id},ENTRIES[id]));}
  return Object.freeze({VERSION,STORAGE_KEY,ENTRIES,safeOverrides,load,save,text,catalog});
});
