(function installBladefallMilestones(root) {
  'use strict';

  const VERSION = 1;
  const BOARD_CATEGORIES = Object.freeze(['base', 'ng1', 'ng2', 'rush']);

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);for (const item of Object.values(value)) freeze(item);return value;
  }
  function finite(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function uniqueStrings(value) {
    return [...new Set((Array.isArray(value) ? value : []).map(String).filter(Boolean))];
  }

  /* These contracts describe the verbs already authored into each encounter.
     They are progression truth, not alternate boss implementations. */
  const bossContracts = freeze([
    { type:'brute', zone:'brute', required:['jump','weapon'], solution:'break-armor-and-use-counterweight', phases:2, retry:'yard-checkpoint' },
    { type:'archer', zone:'hollow-marksman', required:['jump','weapon','dash','portal-single'], reward:'portal-pair', solution:'bank-one-marked-arrow-through-linked-mouth', phases:3, retry:'deadeye-threshold' },
    { type:'warden', zone:'warden', required:['jump','weapon','portal-pair','wall-jump'], solution:'portal-flank-the-guard', phases:2, retry:'gaol-checkpoint' },
    { type:'sorcerer', zone:'frost-sorcerer', required:['jump','weapon','portal-pair','double-jump'], solution:'route-spells-through-siphons', phases:3, retry:'court-checkpoint' },
    { type:'colossus', zone:'ember-colossus', required:['jump','weapon','portal-pair','double-jump','downward-strike','companion-command'], solution:'make-the-ground-and-refuse-the-pour', phases:4, retry:'foundry-checkpoint' },
    { type:'tyrant', zone:'void-tyrant', required:['jump','weapon','portal-pair','gravity-flip'], solution:'align-low-mid-high-paradox-bands', phases:3, retry:'citadel-checkpoint' },
    { type:'king', zone:'abyss-king', required:['jump','weapon','portal-pair','counter','gravity-flip'], solution:'survive-hijack-and-shatter-crowns', phases:4, retry:'throne-checkpoint' },
  ]);
  const bossByType = new Map(bossContracts.map((contract) => [contract.type, contract]));

  function bossEligibility(type, capabilities) {
    const contract=bossByType.get(type);
    if(!contract)return freeze({ok:false,reason:'unknown-boss',missing:[],contract:null});
    const owned=new Set(uniqueStrings(capabilities && capabilities.acquired || capabilities));
    const missing=contract.required.filter((id)=>!owned.has(id));
    return freeze({ok:missing.length===0,reason:missing.length?'missing-capabilities':'ready',missing,contract});
  }

  function attachBossContract(enemy, capabilities) {
    if(!enemy || !enemy.boss)return null;
    const result=bossEligibility(enemy.type,capabilities);
    enemy.milestoneContract=result.contract;
    enemy.milestoneEligibility={ok:result.ok,reason:result.reason,missing:[...result.missing]};
    return result;
  }

  function createRun(raw) {
    const source=raw&&typeof raw==='object'?raw:{};
    const zones={};
    for(const [zoneId,row] of Object.entries(source.zones||source.stages||{})){
      if(!row||typeof row!=='object')continue;
      const done=Math.max(0,Math.floor(finite(row.done,0)));
      const total=Math.max(done,Math.floor(finite(row.total,0)));
      zones[String(zoneId)]={done,total,at:Math.max(0,Math.floor(finite(row.at,0)))};
    }
    const aggregate=Object.values(zones).reduce((out,row)=>({done:out.done+row.done,total:out.total+row.total}),{done:0,total:0});
    return {version:VERSION,zones,done:aggregate.done,total:aggregate.total};
  }

  function zoneReceipt(snapshot) {
    const source=snapshot&&typeof snapshot==='object'?snapshot:{};
    const enemies=Math.max(0,Math.floor(finite(source.enemyTotal,0)));
    const kills=clamp(Math.floor(finite(source.enemyDone,0)),0,enemies);
    const coins=Math.max(0,Math.floor(finite(source.coinTotal,0)));
    const coinDone=clamp(Math.floor(finite(source.coinDone,0)),0,coins);
    const travelers=Math.max(0,Math.floor(finite(source.travelerTotal,0)));
    const travelerDone=clamp(Math.floor(finite(source.travelerDone,0)),0,travelers);
    return freeze({done:kills+coinDone+travelerDone,total:enemies+coins+travelers,
      parts:{enemies:{done:kills,total:enemies},coins:{done:coinDone,total:coins},travelers:{done:travelerDone,total:travelers}}});
  }

  function commitZone(run, zoneId, snapshot, at) {
    const state=createRun(run),receipt=zoneReceipt(snapshot),id=String(zoneId||'');
    if(!id)return freeze({changed:false,run:state,receipt,reason:'missing-zone'});
    const previous=state.zones[id];
    /* Revisit receipts may improve, but never erase a better result. A larger
       authored denominator replaces an old one so expanded levels stay honest. */
    const improved=!previous||receipt.total>previous.total||
      (receipt.total===previous.total&&receipt.done>previous.done);
    if(improved)state.zones[id]={done:receipt.done,total:receipt.total,at:Math.max(0,Math.floor(finite(at,Date.now())))};
    const aggregate=Object.values(state.zones).reduce((out,row)=>({done:out.done+row.done,total:out.total+row.total}),{done:0,total:0});
    state.done=aggregate.done;state.total=aggregate.total;
    return freeze({changed:improved,run:state,receipt,reason:improved?'recorded':'best-kept'});
  }

  function completionPercent(run) {
    const state=createRun(run);return state.total?Math.round((state.done/state.total)*1000)/10:0;
  }

  function categoryFor(input) {
    const state=input||{};if(state.bossRush)return 'rush';
    return ['base','ng1','ng2'][clamp(Math.floor(finite(state.ngPlus,0)),0,2)];
  }
  function cleanName(value) { return String(value||'').trim().replace(/\s+/g,' ').slice(0,18); }
  function cleanEntry(raw) {
    if(!raw||typeof raw!=='object')return null;
    const name=cleanName(raw.name),time=finite(raw.time,-1),completion=finite(raw.completion,-1),at=finite(raw.at,0);
    if(!name||time<0||completion<0||completion>100)return null;
    return freeze({name,time,completion:Math.round(completion*10)/10,at:Math.max(0,Math.floor(at))});
  }
  function createArchive(raw) {
    const source=raw&&typeof raw==='object'?raw:{},archive={lastName:cleanName(source.lastName)};
    for(const category of BOARD_CATEGORIES)archive[category]=(Array.isArray(source[category])?source[category]:[]).map(cleanEntry).filter(Boolean);
    return archive;
  }
  function addEntry(archive, category, raw) {
    const state=createArchive(archive),entry=cleanEntry(raw);
    if(!BOARD_CATEGORIES.includes(category))return freeze({ok:false,reason:'unknown-category',archive:state,entry:null});
    if(!entry)return freeze({ok:false,reason:'invalid-entry',archive:state,entry:null});
    state[category].push(entry);state.lastName=entry.name;
    return freeze({ok:true,reason:'recorded',archive:state,entry});
  }
  function rank(entries, mode) {
    return (Array.isArray(entries)?entries:[]).map(cleanEntry).filter(Boolean).sort(mode==='completion'
      ?((a,b)=>b.completion-a.completion||a.time-b.time||a.at-b.at)
      :((a,b)=>a.time-b.time||b.completion-a.completion||a.at-b.at));
  }
  function runEligibility(input) {
    const state=input||{},reasons=[];
    if(state.levelSelect)reasons.push('level-select');
    if(state.testMode)reasons.push('test-mode');
    if(state.coop)reasons.push('single-player-only');
    if(state.submitted)reasons.push('already-submitted');
    return freeze({ok:reasons.length===0,reasons,category:categoryFor(state)});
  }

  function validate() {
    const errors=[];
    if(bossContracts.length!==7)errors.push('seven boss contracts required');
    if(new Set(bossContracts.map(row=>row.type)).size!==bossContracts.length)errors.push('boss types must be unique');
    if(bossContracts.some(row=>!row.required.includes('weapon')||row.phases<2||!row.solution))errors.push('boss contracts require abilities, phases, and solution verbs');
    if(BOARD_CATEGORIES.length!==4)errors.push('single-player archive needs four categories');
    return freeze({ok:errors.length===0,errors,bosses:bossContracts.length,categories:BOARD_CATEGORIES.length});
  }

  root.BladefallMilestones=freeze({VERSION,BOARD_CATEGORIES,bossContracts,bossEligibility,attachBossContract,
    createRun,zoneReceipt,commitZone,completionPercent,categoryFor,createArchive,addEntry,rank,runEligibility,validate});
})(typeof globalThis!=='undefined'?globalThis:window);
