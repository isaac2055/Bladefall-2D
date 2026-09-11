(function installBladefallFoundationAudit(root){
  'use strict';
  const VERSION=1;
  const SLICE_STAGES=Object.freeze([0,1,2,3,4]);
  const AUTHORITY_NAMES=Object.freeze(['progression','zones','world','capabilities','movement','portals','weapons',
    'equipment','echoes','reactions','ecology','secrets','quests','milestones','recovery','streaming']);
  function freeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.freeze(value);for(const item of Object.values(value))freeze(item);return value;}
  function finite(value,fallback){return Number.isFinite(Number(value))?Number(value):fallback;}

  function auditAuthorities(source){
    const input=source||{},missing=[],failed=[];
    for(const name of AUTHORITY_NAMES){if(!(name in input))missing.push(name);else if(input[name]!==true)failed.push(name);}
    return freeze({ok:missing.length===0&&failed.length===0,required:AUTHORITY_NAMES.length,missing,failed});
  }
  function auditSlice(receipts){
    const rows=Array.isArray(receipts)?receipts:[],errors=[];
    for(const stage of SLICE_STAGES){const row=rows.find(item=>item&&item.stage===stage);
      if(!row){errors.push(`stage-${stage}:missing`);continue;}
      if(!row.charterOk)errors.push(`stage-${stage}:charter`);
      if(!row.geometryOk)errors.push(`stage-${stage}:geometry`);
      if(finite(row.ownershipCoverage,0)<1)errors.push(`stage-${stage}:ownership`);
      if(finite(row.levelLength,0)<4000)errors.push(`stage-${stage}:length`);
      if(finite(row.obstacles,0)<20)errors.push(`stage-${stage}:content`);
      if((stage===2||stage===4)&&!row.bossContract)errors.push(`stage-${stage}:boss-contract`);
    }
    return freeze({ok:errors.length===0,stages:SLICE_STAGES.length,errors});
  }
  function auditPerformance(snapshot,targetFrameMs){
    const metrics=snapshot||{},target=Math.max(1,finite(targetFrameMs,16.667)),errors=[],warnings=[];
    for(const channel of ['update','render']){const row=metrics[channel]||{},p95=finite(row.p95,Infinity),samples=finite(row.samples,0);
      if(samples<1)errors.push(`${channel}:no-samples`);
      if(samples>180)errors.push(`${channel}:unbounded-samples`);
      if(p95>target*1.5)errors.push(`${channel}:p95-over-hard-budget`);
      else if(p95>target)warnings.push(`${channel}:p95-over-target`);
    }
    return freeze({ok:errors.length===0,targetFrameMs:target,errors,warnings,metrics});
  }
  function auditAccessibility(source){
    const row=source||{},errors=[];
    if(!row.canvasRole||!row.canvasLabel)errors.push('canvas-semantics');
    if(finite(row.settingCount,0)<12)errors.push('settings-coverage');
    if(finite(row.remappableControls,0)<8)errors.push('remappable-controls');
    if(!row.reducedMotionClass)errors.push('reduced-motion-runtime');
    if(!row.highContrastClass)errors.push('high-contrast-runtime');
    if(!row.largeTextClass)errors.push('large-text-runtime');
    if(!row.pauseLabel)errors.push('pause-label');
    return freeze({ok:errors.length===0,errors});
  }
  function auditMigration(source){
    const row=source||{},errors=[];
    if(finite(row.schema,0)!==13)errors.push('save-schema');
    if(!row.receiptChanged||finite(row.receiptTo,0)!==13)errors.push('migration-receipt');
    if(!row.worldOk||!row.capabilitiesOk||!row.secretsOk||!row.questsOk)errors.push('module-repair');
    if(!row.settingsBounded)errors.push('settings-repair');
    if(finite(row.storageFailures,0)!==0)errors.push('storage-failure');
    return freeze({ok:errors.length===0,errors});
  }
  function audit(input){
    const source=input||{},gates={authorities:auditAuthorities(source.authorities),slice:auditSlice(source.slice),
      performance:auditPerformance(source.performance,source.targetFrameMs),accessibility:auditAccessibility(source.accessibility),
      migration:auditMigration(source.migration)};
    const errors=[],warnings=[];for(const [name,row] of Object.entries(gates)){for(const error of row.errors||[])errors.push(`${name}:${error}`);for(const warning of row.warnings||[])warnings.push(`${name}:${warning}`);}
    return freeze({ok:errors.length===0,version:VERSION,gates,errors,warnings});
  }
  root.BladefallFoundationAudit=freeze({VERSION,SLICE_STAGES,AUTHORITY_NAMES,auditAuthorities,auditSlice,auditPerformance,auditAccessibility,auditMigration,audit});
})(typeof globalThis!=='undefined'?globalThis:window);
