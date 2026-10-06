import assert from 'node:assert/strict';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const routes=JSON.parse(await readFile('docs/charters/early-platforming/evidence/routes.json','utf8'));
const b=await launchChrome({headless:true});try{const page=await b.newPage();await page.goto('http://localhost:8371/');await page.waitForFunction(()=>window.__BF);const rows=[];
for(const route of routes.rows)for(const disabled of [false,true]){
 const result=await page.evaluate(({route,disabled})=>{
  BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:route.stage,levelSelect:true});mode='play';meta.testMode=false;
  const p=G.p,a=G.earlyPlatforming,original=BladefallEarlyPlatforming;
  if(route.stage===1||route.stage===22){if(route.stage===22)BladefallFractured.grantBlade();else grantPermanentCapability('weapon','opening-route-fixture',{quiet:true});p.weapon=oathbladeWeapon();}
  Object.assign(p,{x:a.room.spawn[0],y:a.room.spawn[1],vx:0,vy:0,onGround:true,jumps:0});
  if(disabled)window.BladefallEarlyPlatforming={...original,swing:()=>{},late:(dt,p)=>{a.grace=0;original.late(dt,p);}};
  const keys=__BF.input.keys,pressed=__BF.input.pressed;
  for(const frame of route.frames){for(const k of Object.keys(keys))keys[k]=false;BFKeyboard.clearPressed();for(const k of frame.keys)keys[k]=true;for(const k of frame.pressed)pressed[k]=true;update(1/60);BFKeyboard.clearPressed();if(p.dead||a.retries)break;}
  for(const k of Object.keys(keys))keys[k]=false;window.BladefallEarlyPlatforming=original;
  return {stage:route.stage,disabled,completed:a.completed,retries:a.retries,x:p.x,y:p.y,blood:p.blood,used:Object.keys(a.used),movement:movementProfile()};
 },{route,disabled});rows.push(result);console.log(JSON.stringify({...result,movement:undefined}));
 assert.equal(result.completed,!disabled,`${route.stage} disabled=${disabled}`);if(!disabled)assert.equal(result.retries,0);
 if([0,1,2,21,22].includes(route.stage))assert.equal(result.movement.dash,false);
 for(const key of ['doubleJump','wallJump','gravityFlip','downwardStrike'])assert.equal(result.movement[key],false);
}
await writeFile('docs/charters/early-platforming/evidence/replay.json',JSON.stringify({scope:'Independent replay of recorded legal inputs, plus the same routes with device impulses disabled. Counterfactual is not an exhaustive shortcut search.',rows},null,2));
}finally{await b.close();}
