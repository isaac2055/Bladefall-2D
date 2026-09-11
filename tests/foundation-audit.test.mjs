import test from 'node:test';
import assert from 'node:assert/strict';
await import('../public/bladefall-foundation-audit.js');
const Audit=globalThis.BladefallFoundationAudit;

function goodEvidence(){return{
  authorities:Object.fromEntries(Audit.AUTHORITY_NAMES.map(name=>[name,true])),
  slice:Audit.SLICE_STAGES.map(stage=>({stage,charterOk:true,geometryOk:true,ownershipCoverage:1,levelLength:7000,obstacles:60,bossContract:stage===2||stage===4?'authored':null})),
  performance:{update:{samples:60,p95:3},render:{samples:60,p95:8}},targetFrameMs:16.667,
  accessibility:{canvasRole:true,canvasLabel:true,settingCount:14,remappableControls:10,reducedMotionClass:true,highContrastClass:true,largeTextClass:true,pauseLabel:true},
  migration:{schema:13,receiptChanged:true,receiptTo:13,worldOk:true,capabilitiesOk:true,secretsOk:true,questsOk:true,settingsBounded:true,storageFailures:0}
};}
test('final foundation audit closes only when every release gate has evidence',()=>{
  const result=Audit.audit(goodEvidence());assert.equal(result.ok,true);assert.deepEqual(result.errors,[]);
  assert.equal(result.gates.authorities.required,16);assert.equal(result.gates.slice.stages,5);
});
test('audit identifies concrete vertical-slice, performance, accessibility, and migration debt',()=>{
  const evidence=goodEvidence();evidence.slice[3].ownershipCoverage=.8;evidence.performance.render.p95=30;
  evidence.accessibility.canvasLabel=false;evidence.migration.schema=12;
  const result=Audit.audit(evidence);assert.equal(result.ok,false);
  assert.ok(result.errors.includes('slice:stage-3:ownership'));
  assert.ok(result.errors.includes('performance:render:p95-over-hard-budget'));
  assert.ok(result.errors.includes('accessibility:canvas-semantics'));
  assert.ok(result.errors.includes('migration:save-schema'));
});
test('performance audit keeps telemetry bounded and separates warnings from hard failure',()=>{
  const soft=Audit.auditPerformance({update:{samples:180,p95:17},render:{samples:180,p95:12}},16.667);
  assert.equal(soft.ok,true);assert.deepEqual(soft.warnings,['update:p95-over-target']);
  assert.equal(Audit.auditPerformance({update:{samples:181,p95:1},render:{samples:1,p95:1}},16.667).ok,false);
});
