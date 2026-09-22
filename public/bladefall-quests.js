(function installBladefallQuests(root) {
  'use strict';

  const SCHEMA = 'bladefall.quest-progress';
  const VERSION = 3;

  const questRecords = [
    {
      id: 'road-without-a-name', title: 'A Road Without a Name', giver: 'mara', accent: '#e4d9a7',
      requirements: { capabilities: ['jump'] },
      start: { type: 'traveler-helped', target: 'mara' },
      intro: 'Mara gives you her field chart, then asks you to compare the road with the marks its builders left elsewhere.',
      objectives: [
        { id: 'hear-third-note', type: 'inspect', target: 'third-note', stage: 'updrafts', label: 'Read the Sky-Well plaque in the Updrafts.' },
        { id: 'measure-keep', type: 'inspect', target: 'two-wardens', stage: 'ruined-keep', label: 'Compare the Ruined Keep foundation.' },
        { id: 'return-mara', type: 'talk', target: 'mara', stage: 'outskirts', label: 'Return to Mara at Broken Muster in The Outskirts.' },
      ],
      reward: { gold: 180 },
      dialogue: {
        active: 'A road is not its stones. Bring me the windwrights’ note and the Keep’s oldest measure.',
        turnIn: 'You found the same hand in sky and stone. Then this road was made to lead somewhere—not merely away.',
        complete: 'The road has a name now, though I am no longer certain it belongs to this place.',
      },
    },
    {
      id: 'kindling-the-sky', title: 'Kindling the Sky', giver: 'ilyra', accent: '#9fe0ff',
      requirements: { capabilities: ['portal-single'] },
      start: { type: 'traveler-helped', target: 'ilyra' },
      intro: 'Ilyra believes a carried flame can reveal whether the world’s winds remember one another.',
      objectives: [
        { id: 'banked-flame', type: 'traveler-helped', target: 'nim', stage: 'frostfell', label: 'Bring Nim and the banked flame through Frostfell.' },
        { id: 'ignite-current', type: 'air-reaction', target: 'fire', stage: null, label: 'Ignite a wind tunnel or updraft with a fire weapon.' },
        { id: 'return-ilyra', type: 'talk', target: 'ilyra', stage: 'updrafts', label: 'Return to Ilyra in the Updraft Canyons.' },
      ],
      reward: { gold: 240 },
      dialogue: {
        active: 'The frost tenders bank fire without consuming it. If their craft can enter a current, the sky may answer.',
        turnIn: 'It sang the third note, didn’t it? Fire should roar. Here, it remembered a song.',
        complete: 'I still hear that impossible note whenever the wind changes.',
      },
    },
    {
      id: 'couriers-proof', title: "The Courier’s Proof", giver: 'sera', accent: '#7fe8ff',
      requirements: { capabilities: ['portal-pair'] },
      start: { type: 'traveler-helped', target: 'sera' },
      intro: 'Sera asks for proof that a hostile message can cross a threshold and return changed.',
      objectives: [
        { id: 'return-hostile-shot', type: 'return-projectile', target: 'enemy', stage: null, label: 'Send an enemy projectile through your portal.' },
        { id: 'read-two-floors', type: 'inspect', target: 'two-floors', stage: 'inversion', label: 'Read the polarity prayer in the Inversion.' },
        { id: 'return-sera', type: 'talk', target: 'sera', stage: 'emberdeep', label: 'Return to Sera in Emberdeep.' },
      ],
      reward: { gold: 320 },
      dialogue: {
        active: 'A courier is not the message. Turn one of theirs around and see whether the road changes it.',
        turnIn: 'Returned steel, two floors, one road. Good. The seal was never deciding what could pass—only what it believed.',
        complete: 'Every locked threshold now looks like an argument I have already won.',
      },
    },
    {
      id: 'inventory-of-effects', title: 'Inventory of Effects', giver: 'ethereal-goods', accent: '#c7d6b4',
      requirements: { capabilities: ['weapon'] },
      start: { type: 'shop-visit', target: 'ethereal-goods' },
      intro: 'The Assessor quietly requests three entries missing from the inventory.',
      objectives: [
        { id: 'record-counterweight', type: 'inspect', target: 'counterweight', stage: 'brute', label: 'Inspect the Broken Standard beyond the Woods.' },
        { id: 'record-cold-rhythm', type: 'inspect', target: 'cold-rhythm', stage: 'frost-sorcerer', label: 'Inspect the Frost Court’s siphon record.' },
        { id: 'record-returned-ember', type: 'inspect', target: 'returned-ember', stage: 'ember-colossus', label: 'Inspect the Foundry ledger.' },
        { id: 'return-assessor', type: 'shop-visit', target: 'ethereal-goods', stage: 'black-woods', label: 'Return to Ethereal Goods in Black Woods.' },
      ],
      reward: { gold: 200 },
      dialogue: {
        active: 'Three effects remain unpriced: a broken standard, a cold rhythm, and an ember returned.',
        turnIn: 'Forgive me. I had hoped the list would become less familiar when complete.',
        complete: 'Your effects are in order. I am sorry they were ever scattered.',
      },
    },
    {
      id: 'release-the-causeway', title: 'Release the Causeway', giver: 'oren', accent: '#d59a68',
      requirements: { capabilities: ['weapon'] },
      scope: 'local',
      start: { type: 'talk', target: 'oren', stage: 'brute' },
      intro: 'Release the first catch, settle the hoist on its cradle, then free the gate catch.',
      objectives: [
        { id: 'yard-catch', type: 'inspect', target: 'causeway-catch-yard', stage: 'brute', label: 'Release the Drop Yard safety catch.' },
        { id: 'rise-catch', type: 'inspect', target: 'causeway-catch-rise', stage: 'brute', label: 'Release the upper Drop Yard safety catch.' },
      ],
      reward: { gold: 160 },
      dialogue: {
        offer: 'The gate chain is under strain. I have been listening to it all morning.',
        active: 'That lower cradle used to take the weight. Now the gate carries all of it.',
        turnIn: 'There. Quiet at last.',
        complete: 'I will keep this road open. You have somewhere to come back to.',
      },
    },
    {
      id: 'the-open-watch', title: 'The Open Watch', giver: 'daro', accent: '#d8b875',
      requirements: { capabilities: ['portal-single'] },
      scope: 'local',
      start: { type: 'talk', target: 'daro', stage: 'hollow-marksman' },
      intro: 'Daro recognizes the maker’s mark on the watch token above the gallery.',
      objectives: [
        { id: 'find-command-token', type: 'inspect', target: 'watch-command-token', stage: 'hollow-marksman', label: 'Find the command token in the upper watchworks.' },
        { id: 'return-command-token', type: 'talk', target: 'daro', stage: 'hollow-marksman', label: 'Return the command token to Daro.' },
      ],
      reward: { gold: 180 },
      dialogue: {
        offer: 'My mark is on the old watch token. I left it above the gallery.',
        active: 'I will wait at the far gate. The firing sounds different from there.',
        turnIn: 'My mark. I made that before the masks. Here, take the purse.',
        complete: 'I used to know every bow by its sound.',
      },
    },
  ];

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }
  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);for (const item of Object.values(value)) deepFreeze(item);return value;
  }
  const quests = deepFreeze(questRecords.map(clone));
  const questById = new Map(quests.map((quest) => [quest.id, quest]));

  function createProgress(source) {
    const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    const state = {};
    for (const quest of quests) {
      const row = input.quests && input.quests[quest.id];
      const started = !!(row && row.started);
      const step = started ? Math.max(0, Math.min(quest.objectives.length, Math.floor(Number(row.step) || 0))) : 0;
      const completed = started && (step >= quest.objectives.length || !!row.completed);
      state[quest.id] = { started, step: completed ? quest.objectives.length : step, completed, claimed: completed && !!row.claimed };
    }
    const history=[...new Set((Array.isArray(input.history)?input.history:[]).map(String).filter(value=>/^traveler-helped:[a-z-]+(?::[a-z-]+)?$/.test(value)))];
    return { schema: SCHEMA, version: VERSION, quests: state, history };
  }

  function migrateProgress(raw) {
    const progress = createProgress(raw);
    const current = !!raw && raw.schema === SCHEMA && raw.version === VERSION;
    return Object.freeze({ progress, receipt: Object.freeze({ changed: !current, from: raw && raw.version || 0, to: VERSION }) });
  }

  function matches(requirement, event) {
    if (!requirement || !event || requirement.type !== event.type || requirement.target !== event.target) return false;
    return !requirement.stage || requirement.stage === event.stage;
  }

  function eligible(quest, context) {
    if(context==null)return {ok:true,missingCapabilities:[],missingClears:[]};
    const requirements=quest&&quest.requirements||{},owned=new Set((context&&context.capabilities||[]).map(String));
    const cleared=new Set((context&&context.clearedZones||[]).map(String));
    const missingCapabilities=(requirements.capabilities||[]).filter(id=>!owned.has(id));
    const missingClears=(requirements.clearedZones||[]).filter(id=>!cleared.has(id));
    return {ok:missingCapabilities.length===0&&missingClears.length===0,missingCapabilities,missingClears};
  }
  function historicalMatch(state, requirement) {
    if(!requirement||requirement.type!=='traveler-helped')return false;
    const prefix=`${requirement.type}:${requirement.target}`;
    return requirement.stage?state.history.includes(`${prefix}:${requirement.stage}`):
      state.history.some(value=>value===prefix||value.startsWith(prefix+':'));
  }

  function record(progress, event, context) {
    const state = createProgress(progress), changes=[];
    let historyChanged=false;
    if(event&&event.type==='traveler-helped'&&event.target){
      const key=`${event.type}:${event.target}${event.stage?':'+event.stage:''}`;
      if(!state.history.includes(key)){state.history.push(key);historyChanged=true;}
    }
    for (const quest of quests) {
      const row=state.quests[quest.id];
      if(!row.started){
        if((!matches(quest.start,event)&&!historicalMatch(state,quest.start))||!eligible(quest,context).ok)continue;
        row.started=true;
        changes.push({questId:quest.id,type:'started',step:0,objective:clone(quest.objectives[0])});
        continue;
      }
      if(row.completed)continue;
      const objective=quest.objectives[row.step];
      if(!matches(objective,event))continue;
      row.step++;
      if(row.step>=quest.objectives.length){row.completed=true;changes.push({questId:quest.id,type:'completed',step:row.step,objective:null});}
      else changes.push({questId:quest.id,type:'advanced',step:row.step,objective:clone(quest.objectives[row.step])});
    }
    return Object.freeze({ changed: changes.length>0||historyChanged, progress: state, changes: deepFreeze(changes) });
  }

  function hasEvent(progress,type,target,stage) {
    const state=createProgress(progress),prefix=`${type}:${target}`;
    return stage?state.history.includes(`${prefix}:${stage}`):state.history.some(value=>value===prefix||value.startsWith(prefix+':'));
  }

  function claim(progress) {
    const state=createProgress(progress),rewards=[],claimed=[];
    for(const quest of quests){const row=state.quests[quest.id];if(!row.completed||row.claimed)continue;
      row.claimed=true;claimed.push(quest.id);rewards.push({questId:quest.id,title:quest.title,...clone(quest.reward)});
    }
    return Object.freeze({changed:claimed.length>0,progress:state,rewards:deepFreeze(rewards),claimed:Object.freeze(claimed)});
  }

  function journal(progress) {
    const state=createProgress(progress);
    return quests.map((quest)=>{
      const row=state.quests[quest.id],objective=row.started&&!row.completed?quest.objectives[row.step]:null;
      return {id:quest.id,title:quest.title,giver:quest.giver,accent:quest.accent,status:row.completed?'completed':row.started?'active':'hidden',step:row.step,total:quest.objectives.length,objective:objective?clone(objective):null,reward:clone(quest.reward)};
    });
  }

  function dialogue(progress, actorId, context) {
    const state=createProgress(progress),related=quests.filter((quest)=>quest.giver===actorId);
    for(const quest of related){const row=state.quests[quest.id];
      if(row.completed)return {questId:quest.id,state:'complete',line:quest.dialogue.complete};
      if(row.started){const objective=quest.objectives[row.step],turnIn=objective&&((objective.type==='talk'&&objective.target===actorId)||(objective.type==='shop-visit'&&objective.target===actorId));
        return {questId:quest.id,state:turnIn?'turn-in':'active',line:turnIn?quest.dialogue.turnIn:quest.dialogue.active};}
      if(quest.start&&quest.start.type==='talk'&&quest.start.target===actorId&&eligible(quest,context).ok)
        return {questId:quest.id,state:'available',line:quest.dialogue.offer||quest.intro};
    }
    return null;
  }

  function contact(progress, actorId, context) {
    const state=createProgress(progress);
    for(const quest of quests){const row=state.quests[quest.id];
      if(!row.started&&quest.start&&quest.start.type==='talk'&&quest.start.target===actorId&&eligible(quest,context).ok)
        return {questId:quest.id,objective:clone(quest.start)};
      if(!row.started||row.completed)continue;
      const objective=quest.objectives[row.step];
      if(objective.type==='talk'&&objective.target===actorId)return {questId:quest.id,objective:clone(objective)};
    }
    return null;
  }

  function validateCatalog() {
    const errors=[],ids=new Set();
    for(const quest of quests){
      if(ids.has(quest.id))errors.push(`duplicate quest ${quest.id}`);ids.add(quest.id);
      if(!quest.start||!quest.objectives.length)errors.push(`quest ${quest.id} has no playable sequence`);
      if(quest.scope!=='local'&&!quest.objectives.some(o=>o.stage&&o.stage!==quest.objectives[0].stage))errors.push(`quest ${quest.id} is not multi-stage`);
      if(!quest.objectives.some(o=>['inspect','air-reaction','return-projectile','talk','shop-visit'].includes(o.type)))errors.push(`quest ${quest.id} lacks a non-trivial verb`);
      if(!(quest.reward&&quest.reward.gold>0))errors.push(`quest ${quest.id} has no reward`);
      if(!quest.requirements||!(quest.requirements.capabilities||[]).length)errors.push(`quest ${quest.id} has no progression requirement`);
    }
    return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),quests:quests.length,objectives:quests.reduce((n,q)=>n+q.objectives.length,0)});
  }

  root.BladefallQuests=Object.freeze({SCHEMA,VERSION,quests,createProgress,migrateProgress,record,claim,journal,dialogue,contact,eligible,hasEvent,validateCatalog});
})(typeof globalThis!=='undefined'?globalThis:window);
