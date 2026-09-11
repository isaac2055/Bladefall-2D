(function installBladefallCinematics(root){
  'use strict';

  const VERSION=1;
  const sharedWake=[
    {id:'wake-delirious',scene:'real-wake',text:'Canvas. Cold earth. His own breath scraping back into his lungs.',duration:3900},
    {id:'enemy-soldiers-enter',scene:'breach',text:'Boots stopped outside. The tent ties parted beneath a soldier’s knife.',duration:4100},
    {id:'halfway-defense',scene:'desperate-fight',text:'He found his feet. One intruder fell. A second recoiled. For one impossible moment, training was enough.',duration:5100},
  ];

  const scripts={
    prologue:{id:'prologue',title:'The Waking',beats:[
      {id:'rise-to-wake',scene:'text-only',text:'His vision swims. The Knight rises beneath a sky he does not remember.',duration:5200},
    ]},
    'wake-fall':{id:'wake-fall',title:'The Waking',beats:[
      ...sharedWake,
      {id:'overwhelmed',scene:'overwhelmed',text:'Then the room doubled. His sword passed through a shadow. Three real blades did not.',duration:4700},
      {id:'knight-killed',scene:'death',text:'The Warden fell before the hallucination released him.',duration:4500},
      {id:'game-over',scene:'game-over',text:'He did not wake again.',duration:4800},
    ]},
    'wake-armed':{id:'wake-armed',title:'The Waking',beats:[
      ...sharedWake,
      {id:'flameblade-focus',scene:'flame-focus',text:'At the killing stroke, fire gathered around the shape of a blade beside him.',duration:4600},
      {id:'dream-images-return',scene:'dream-images',text:'Blue and orange mouths. A banked flame. A line beneath the world. The impossible returned all at once.',duration:5400},
      {id:'rusty-axe-defense',scene:'axe-fight',text:'He seized the burning weapon and drove the intruders from the tent, one by one.',duration:5100},
      {id:'knight-collapses',scene:'collapse',text:'When the last soldier fell, so did he.',duration:4000},
      {id:'ordinary-axe-reveal',scene:'axe-reveal',text:'The fire went out. In his hand lay an ordinary, rusted axe.',duration:5200},
      {id:'darkness',scene:'dark-voice',text:'Darkness. Footsteps running closer.',duration:3800},
      {id:'comrade-voice',scene:'dark-voice',text:'“He who saved us has awoken.”',duration:5200},
      {id:'eyes-open',scene:'eyes-open',text:'His eyes opened.',duration:5000},
    ]},
  };

  function clone(value){if(Array.isArray(value))return value.map(clone);if(!value||typeof value!=='object')return value;const out={};for(const [k,v] of Object.entries(value))out[k]=clone(v);return out;}
  function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.freeze(value);for(const item of Object.values(value))deepFreeze(item);return value;}
  deepFreeze(scripts);

  function script(id){return scripts[id]?clone(scripts[id]):null;}
  function endingId(storyState){return storyState&&storyState.eligible&&scripts[storyState.id]?storyState.id:null;}
  function validate(){
    const errors=[];
    const ids=new Set();
    for(const item of Object.values(scripts)){for(const beat of item.beats){if(ids.has(item.id+':'+beat.id))errors.push(`duplicate beat ${item.id}:${beat.id}`);ids.add(item.id+':'+beat.id);if(!beat.scene||!beat.text||beat.duration<2500)errors.push(`invalid beat ${item.id}:${beat.id}`);}}
    const fall=scripts['wake-fall'].beats,armed=scripts['wake-armed'].beats;
    for(let i=0;i<sharedWake.length;i++)if(JSON.stringify(fall[i])!==JSON.stringify(armed[i]))errors.push('both endings must share the same waking attack');
    const prologue=scripts.prologue.beats;
    if(prologue.length!==1||prologue[0].scene!=='text-only'||prologue[0].text!=='His vision swims. The Knight rises beneath a sky he does not remember.')errors.push('prologue must preserve the agreed single-line waking overlay');
    if(!fall.some(beat=>beat.id==='knight-killed'))errors.push('direct ending must kill the knight');
    if(!armed.some(beat=>beat.id==='ordinary-axe-reveal'))errors.push('truth ending must reveal the ordinary axe');
    if(!armed.some(beat=>beat.text==='“He who saved us has awoken.”'))errors.push('truth ending must retain the agreed final voice line');
    return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),scripts:Object.keys(scripts).length,prologueBeats:scripts.prologue.beats.length,directBeats:fall.length,truthBeats:armed.length,sharedWakeBeats:sharedWake.length});
  }

  root.BladefallCinematics=Object.freeze({VERSION,scripts,script,endingId,validate});
})(typeof globalThis!=='undefined'?globalThis:window);
