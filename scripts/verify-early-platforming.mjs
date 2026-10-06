import {launchChrome} from '../tests/launch-chrome.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='docs/charters/early-platforming/evidence';await mkdir(dir,{recursive:true});
const b=await launchChrome({headless:true});
try{const page=await b.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8371/');await page.waitForFunction(()=>window.__BF);await page.setViewport({width:1200,height:800});
const rows=[];
for(const stage of [1,2,21,22,25]){
 const row=await page.evaluate(stage=>{
  beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='play';meta.testMode=false;G.stageBanner=0;
  const a=G.earlyPlatforming,r=a.room,p=G.p;
  if(stage===1||stage===22){if(stage===22)BladefallFractured.grantBlade();else grantPermanentCapability('weapon','opening-route-fixture',{quiet:true});p.weapon=oathbladeWeapon();}
  Object.assign(p,{x:r.spawn[0],y:r.spawn[1],vx:0,vy:0,onGround:true,jumps:0});
  const keys=__BF.input.keys,pressed=__BF.input.pressed,trace=[],frames=[];let previousJump=false,previousAttack=false,jumpAge=100;
  for(let i=0;i<1100;i++){
   let right=true,left=false,jump=false,up=false,down=false,attack=false;
   if(r.carriers.length){
    const carrier=p.floorPlat?.earlyCarrier?p.floorPlat:null;
    if(carrier){right=false;jump=carrier.charged&&Math.abs(carrier.x-carrier.toX)<30;right=jump;}
    else if(p.onGround){
     const ahead=G.obstacles.filter(o=>o.earlyCarrier&&o.toX>=p.x-20).sort((a,b)=>a.homeX-b.homeX)[0];
     if(ahead){const target=ahead.homeX;if(p.x>target+8){left=true;right=false;}else if(p.x>target-8)right=false;
      if(stage!==0&&Math.abs(p.x-target)<70&&ahead.y>p.y+5&&ahead.y<p.y+60)jump=true;
     }
    }
   if(!p.onGround&&a.carrier&&r.carriers.length>1){const other=G.obstacles.find(o=>o.earlyCarrier&&o.homeX>a.carrier.homeX+20);if(other){const tx=other.homeX-20;if(p.x>tx-40){right=false;left=p.x>tx;}}}
   }else{
    const target=G.obstacles.filter(o=>o.type==='earlyBlade'&&!(a.used[o.earlyId]>G.time)&&o.x>p.x-30).sort((a,b)=>a.x-b.x)[0];
    if(target){
     jump=p.onGround&&target.x-p.x<135;
     up=target.direction==='up';down=!up;
     attack=Math.abs(target.x-p.x)<target.w/2+10&&(up?(target.y>=p.y+p.h-10&&target.y<p.y+p.h+60):(p.y>=target.y-10&&p.y<target.y+65));
    }
   }
   if(p.onGround&&!p.floorPlat?.earlyCarrier&&!r.carriers.some(c=>Math.abs(c[0]-p.x)<100)){const ledge=G.obstacles.filter(o=>o.type==='plat'&&!o.gone&&o.x>p.x&&o.x-p.x<150&&o.y>p.y+10&&o.y<p.y+80).sort((a,b)=>a.x-b.x)[0];if(ledge)jump=true;}
   keys.ArrowRight=right;keys.ArrowLeft=left;keys.ArrowUp=up;keys.ArrowDown=down;if(jump&&!previousJump)jumpAge=0;else jumpAge++;keys[kbCode('jump')]=jumpAge<25;keys[kbCode('attack')]=attack;
   if(jump&&!previousJump)pressed[kbCode('jump')]=true;
   if(attack&&!previousAttack)pressed[kbCode('attack')]=true;
   previousJump=jump;previousAttack=attack;
   frames.push({keys:Object.keys(keys).filter(k=>keys[k]),pressed:Object.keys(pressed).filter(k=>pressed[k])});update(1/60);BFKeyboard.clearPressed();
   if(i%(stage===0?15:60)===0)trace.push({i,x:Math.round(p.x),y:Math.round(p.y),vx:Math.round(p.vx),vy:Math.round(p.vy),floor:p.floorPlat?.earlyId,carrier:G.obstacles.find(o=>o.earlyCarrier)?.x,mode,retries:a.retries});
   if((a.completed&&(stage!==2||p.x>r.end+100))||p.dead)break;
  }
  for(const k of Object.keys(keys))keys[k]=false;
  return {stage,completed:a.completed,retries:a.retries,position:{x:p.x,y:p.y,dead:p.dead,blood:p.blood,mode},used:a.used,movement:movementProfile(),trace,frames};
 },stage);
 rows.push(row);console.log(JSON.stringify({...row,frames:undefined,movement:undefined}));
 await page.screenshot({path:`${dir}/${stage}.png`});
}
await writeFile(`${dir}/routes.json`,JSON.stringify({scope:'Prototype fixture route search; only completed rows prove a crossing.',rows,errors},null,2));if(errors.length||rows.some(r=>!r.completed))process.exitCode=1;
}finally{await b.close();}
