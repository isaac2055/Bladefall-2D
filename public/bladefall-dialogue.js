(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BladefallDialogue=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=1,STORAGE_KEY='bladefall_dialogue_overrides_v1';
  const ENTRIES=Object.freeze({
    'ui.rest':{level:0,type:'ui',speaker:'Waystation',text:'Rested at {name}. Blood restored; tools refilled.'},
    'outskirts.mara.ask':{level:0,type:'npc',speaker:'Mara',text:"Stay flat, you... Oh. Hello. Mara, surveyor. Could I borrow your legs? Three posts between here and the Muster, and I need a bearing off each one. Stand close until the vane swings."},
    'outskirts.mara.progress':{level:0,type:'npc',speaker:'Mara',text:"Still missing some. Ash is by the old camp. Glass is up on the high ledge in Watcher’s Cut. Iron’s at the Muster."},
    'outskirts.mara.done':{level:0,type:'npc',speaker:'Mara',text:"That’s all three. It reaches the woods. Thank you. Keep the chart; I’ll draw another."},
    'outskirts.vey.before':{level:0,type:'npc',speaker:'Vey',text:"Nearly... there. Sorry, I’d stand, but I’d regret it. Vey. The fire’s for anyone."},
    'outskirts.vey.after':{level:0,type:'npc',speaker:'Vey',text:"Back again. Sit, if you like. I won’t ask where you’ve been."},
    'outskirts.olan.first':{level:0,type:'npc',speaker:'Olan',text:"Twenty to four. Every blessed day. ...You came from the west? There’s nothing west but the old camp. Patrols turn at the post. Mind them."},
    'outskirts.olan.revisit':{level:0,type:'npc',speaker:'Olan',text:"You got past the patrols? Hm. Most turn round at the first post."},
    'outskirts.olan.muster':{level:0,type:'npc',speaker:'Olan',text:"Soldiers at every post, and I never heard them march in. Did you?"},
    'outskirts.vey.rowan':{level:0,type:'npc',speaker:'Vey',text:"Rowan’s coming over tonight. Says he’s bringing his own bowl. I’ll pretend that’s a surprise."},
    'outskirts.olan.hint':{level:0,type:'npc',speaker:'Olan',text:"Mara’s after the Glass post? Upper road. Quicker, if heights don’t bother you."},
    'outskirts.olan.slow':{level:0,type:'npc',speaker:'Olan',text:"Then go slow at the crossing."},
    'outskirts.mara.handover':{level:0,type:'npc',speaker:'Mara',text:"Keep it out of the rain. I’ve only got the one."},
    'outskirts.mara.replay':{level:0,type:'npc',speaker:'Mara',text:"Everything you’ve walked is drawn in. The blanks are the bits you haven’t."},
    'outskirts.exit':{level:0,type:'sign',speaker:'Tunnel marker',text:'MOTHLIGHT TUNNEL · BLACK WOODS'},
    'outskirts.relic.first-draught':{level:0,type:'item',speaker:'Chalice of the First Draught',text:'A tin cup rolls from a gloved hand beside a tent. The light is much too bright.'},
    'woods.orra.first':{level:1,type:'npc',speaker:'Orra',text:"Stopped again. And yes, I wound it—this morning, same as every morning since my daughter gave it me. Anyway. If you’re going farther in, look at a branch before you stand on it. Some of them aren’t there at all."},
    'woods.orra.revisit':{level:1,type:'npc',speaker:'Orra',text:"Still stopped. I gave it a shake, which the man who mended it told me never to do, so that’s two of us it won’t listen to. Anyway—the path back’s clear, if that’s where you’re off to."},
    'woods.orra.muster':{level:1,type:'npc',speaker:'Orra',text:"Bells started while you were gone—don’t ask me who’s ringing them, I’ve stopped asking. Anyway. If the low road’s crowded, there’s the workers’ reserve up above the far end of Briar Run. Let it go and a walkway comes down through the canopy."},
    'woods.pell.first':{level:1,type:'npc',speaker:'Pell',text:"See the amber on the bark? Here’s the trick. Good branch, the amber sits on the side facing the wind. Amber on the lee side, away from the wind—don’t jump. You’ll go straight through. Learned that in a nettle patch."},
    'woods.pell.revisit':{level:1,type:'npc',speaker:'Pell',text:"Wind first, then amber. Wind first, then amber. Say it twice and you won’t forget it. No shame standing here a minute—beats finding out halfway through a jump."},
    'woods.blade.bound':{level:1,type:'item',speaker:'Oathblade',text:'Roots grip the blade. A vine climbs toward an old counterweight.'},
    'woods.blade.free':{level:1,type:'item',speaker:'Oathblade',text:'The roots slacken. The blade can be taken.'},
    'woods.hale.before':{level:1,type:'npc',speaker:'Hale',text:"Sword in the roots up ahead. Tried pulling it. Shoulder lost. Vine runs up to a counterweight—put your weight on that, not the sword."},
    'woods.hale.after':{level:1,type:'npc',speaker:'Hale',text:"Got it out, then. Good. Keep it handy past this clearing. I’ll sit a while. Shoulder’s not done complaining, and I’d only slow you down."},
    'woods.exit':{level:1,type:'sign',speaker:'Root tunnel marker',text:'BROKEN CAUSEWAY · ROOT TUNNEL'},
    'woods.bram.first':{level:1,type:'npc',speaker:'Bram',text:"I’ll bring the lamp! Stay close enough to see what she lights up, right? And tell me when you want me to wait. Some of these branches look solid right up till you shine a light through them."},
    'woods.bram.repeat':{level:1,type:'npc',speaker:'Bram',text:"Look—see that branch? Light’s going straight through it. Don’t land there! I’ll wait here, no rush, while you find a proper way across."},
    'woods.bram.done':{level:1,type:'npc',speaker:'Bram',text:"You’re across! I’ll leave the lamp on this side so you can find your way back. And thanks for waiting at the tricky bits—I jump like a sack of flour with her in my hand."},
    'woods.relic.red-clasp':{level:1,type:'item',speaker:'Clasp of the Unbroken Standard',text:'A fist closes around a red cloak clasp. Tent canvas snaps overhead; the hand will not release it.'},
    'causeway.oren.first':{level:2,type:'npc',speaker:'Oren',text:'“Hear that groan? That’s the gate chain, taking the whole load on its own. Been listening to it all morning.”'},
    'causeway.oren.revisit':{level:2,type:'npc',speaker:'Oren',text:'“Aye, still pulling. I can feel it through the handle. That chain’ll not take much more.”'},
    'causeway.oren.muster':{level:2,type:'npc',speaker:'Oren',text:'“Chain rattled end to end last night, every link, like someone ran a stick along it. I never touched the handle. Nobody did.”'},
    'causeway.sable.first':{level:2,type:'npc',speaker:'Sable',text:'“Two ways over. The lower planks are slow, but you’re covered. The hanging walk is quick, and every guard in the yard can see you. Choose the one you can manage today.”'},
    'causeway.sable.revisit':{level:2,type:'npc',speaker:'Sable',text:'“Lower planks, under cover. Or the chainwalk, in plain view. Either way, breathe first.”'},
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
