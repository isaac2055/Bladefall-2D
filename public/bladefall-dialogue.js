(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BladefallDialogue=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=1,STORAGE_KEY='bladefall_dialogue_overrides_v1';
  const ENTRIES=Object.freeze({
    'ui.rest':{level:0,type:'ui',speaker:'Waystation',text:'Rested at {name}. Blood restored; tools refilled.'},
    'outskirts.mara.ask':{level:0,type:'npc',speaker:'Mara',text:"Three bearings for my chart. Ash, old camp. Glass, Watcher’s Cut. Iron, Broken Muster—meet me there."},
    'outskirts.mara.progress':{level:0,type:'npc',speaker:'Mara',text:"Still short. Ash is by the old camp. Glass is the high one, up on the ledge in Watcher’s Cut. Iron’s at Broken Muster. Walk right up to each post till the vane swings round—that’s the reading. I’ll wait."},
    'outskirts.mara.done':{level:0,type:'npc',speaker:'Mara',text:"Last one. They agree: the tunnel reaches the woods. Take the chart. Past that, it’s blank."},
    'outskirts.vey.before':{level:0,type:'npc',speaker:'Vey',text:"There’s room by the fire if you want it—I keep it going for whoever comes off the road, and nobody’s come off the road in a while, so you’d be doing me a favour. Sit. Rest your feet."},
    'outskirts.vey.after':{level:0,type:'npc',speaker:'Vey',text:"You’re back, and in one piece, look at that. Sit this side—the other blanket’s still wet, and I keep meaning to hang it out. Kettle’s warm. Can’t promise it’s still tea."},
    'outskirts.olan.first':{level:0,type:'npc',speaker:'Olan',text:"Don’t go trustin’ that clock. Stuck at twenty to four, and nobody’s been up to fix it. Patrols still come through, mind. Watch where they turn before you cross."},
    'outskirts.olan.revisit':{level:0,type:'npc',speaker:'Olan',text:"Clock’s still broke. Was goin’ to fetch a ladder, but my knees had words with me. Have a look down the road before you go—them patrols don’t keep the same gaps twice."},
    'outskirts.olan.muster':{level:0,type:'npc',speaker:'Olan',text:"There’s soldiers at the posts now. Weren’t there this mornin’, and I never heard them come. Take your time at the crossing, I reckon."},
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
