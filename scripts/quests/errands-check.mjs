// Plays the three reworked Explore side stories (bladefall-quest-errands.js) step by step in a headless page:
// Elsie (Black Woods), Silas (Causeway), the Archivist (Ruined Keep). Movement is real input; long walks over
// gaps the bot cannot jump are bridged by placing the knight (Q.put), never the quest props.
//   node scripts/quests/errands-check.mjs
import assert from 'node:assert/strict';
import {open} from './harness.mjs';
const {page,errors,close}=await open();
const fails=[];
const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  '+detail:''));if(!ok)fails.push(name);};
try{
 // ---------------------------------------------------------------- Elsie
 const elsie=await page.evaluate(()=>{const Q=__q,out={};Q.setup(1,'refuge');
  out.noStairs=!G.obstacles.some(o=>o.sideStory==='refuge'&&['step','task'].includes(o.sideStoryRole));
  for(let i=0;i<10;i++){const m=Q.er().find(o=>o.e==='moths'&&!o.gone);if(!m)break;if(Q.walk(m.x-(m.perch<6?70:0),m.y)<0)Q.put(m.x-(m.perch<6?70:5),m.y);Q.frames(70);}
  out.caught=Q.row('refuge').step===1&&Q.er().some(o=>o.e==='lantern'&&o.held);
  // a hit on the way home: the moths take it back
  Q.put(4200,0);G.p.invuln=0;hurtPlayer(1,1,true);Q.frames(5);
  out.dropped=!Q.er().find(o=>o.e==='lantern').held&&Q.er().find(o=>o.e==='lantern').x===5320;
  Q.put(5300,0);Q.frames(5);out.retaken=Q.er().find(o=>o.e==='lantern').held;
  G.p.invuln=99;Q.put(4300,0);Q.walk(820,0);Q.frames(20);out.home=Q.row('refuge').step===2;
  G.p.weapon=oathbladeWeapon();Q.walk(2250,0);G.p.face=1;for(let i=0;i<4;i++)Q.swing();
  out.chopped=Q.row('refuge').phase==='ready';out.completionCue=/RETURN TO ELSIE/.test(G.sideStoryScene.questBeat?.text);
  // finish: talk, then the gift is a vitality fragment (no healing)
  const actor=G.obstacles.find(o=>o.sideStory==='refuge'&&o.sideStoryRole==='actor');Q.walk(actor.x+20,0);
  BladefallSideStoryWorld.interact(actor);[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent===BladefallSideStories.byId.refuge.thanks)?.click();BladefallConversation.close();mode='play';
  out.done=Q.row('refuge').phase==='completed';
  const before=JSON.stringify(meta.advancement||{}),blood=G.p.blood;const reward=G.obstacles.find(o=>o.sideStory==='refuge'&&o.sideStoryRole==='reward');
  // (level select never grants advancement: read what the thanks says)
  let said='';if(reward){Q.put(reward.x,reward.y);BladefallSideStoryWorld.interact(reward);said=document.querySelector('#fieldConversation')?.textContent||'';BladefallConversation.close();mode='play';}
  out.gift=/vitality fragment/.test(said)&&/Mothlight Swarm/.test(said)&&!/Blood\./.test(said.replace('a measure of Blood',''))&&G.p.blood===blood;
  return out;});
 for(const [k,v] of Object.entries(elsie))check('Elsie · '+k,v);

 // ---------------------------------------------------------------- Silas
 const silas=await page.evaluate(()=>{const Q=__q,out={};Q.setup(2,'defector');G.p.weapon=oathbladeWeapon();G.p.invuln=99;
  const gear=G.obstacles.find(o=>o.errand==='gear');Q.put(gear.x-40,gear.y);G.p.face=1;
  // strike while the bright tooth is away: nothing; then wait for it
  gear.t=1.2;Q.swing();out.wrongTooth=Q.row('defector').step===0;
  gear.t=2.38;Q.swing();out.gear=Q.row('defector').step===1;out.gearStopped=gear.stopped;out.nextGoal=/WALK SILAS/.test(G.sideStoryScene.questBeat?.text);
  const canvas=document.createElement('canvas'),c=canvas.getContext('2d'),tips=[];c.fillText=text=>tips.push(text);BladefallQuestErrands.draw(c,gear,BladefallSideStories.byId.defector,Q.row('defector'));out.noStaleToothTip=!tips.includes('Strike the bright tooth');
  const actor=G.obstacles.find(o=>o.sideStory==='defector'&&o.sideStoryRole==='actor');
  // standing still: Silas does not move
  Q.put(10560,0);const x0=actor.x;Q.frames(120);out.waits=Math.abs(actor.x-x0)<1;
  // walk west in short stretches, stopping while an arm is down over him
  Q.put(actor.x-50,actor.y);let guard=0;
  while(Q.row('defector').step===1&&guard++<1500){
   const danger=G.obstacles.filter(o=>o.errand==='arm').some(a=>{const d=actor.x-a.x,ph=(a.t||0)%3.2;return d>0&&d<110&&ph>1.7;});
   if(danger)Q.frames(3);else Q.frames(3,{ArrowLeft:true});
  }
  out.led=Q.row('defector').step===2&&Math.abs(actor.x-9480)<2;out.ledAt=Math.round(actor.x)+' step '+Q.row('defector').step+' guard '+guard;
  // the key: from Silas to the toll tower hook
  Q.put(actor.x+30,0);Q.frames(10);out.keyTaken=Q.er().some(o=>o.e==='key'&&o.held);
  Q.put(9300,325);Q.frames(10);out.hung=Q.row('defector').phase==='ready';
  return out;});
 for(const [k,v] of Object.entries(silas))if(k!=='ledAt')check('Silas · '+k,v);console.log(silas.ledAt);

 // ---------------------------------------------------------------- the Archivist
 const archivist=await page.evaluate(()=>{const Q=__q,out={};Q.setup(5,'archivist');G.p.weapon=oathbladeWeapon();G.p.invuln=99;
  // any order: the belfry pages first, too slowly, then in time
  const pages=()=>Q.er().filter(o=>o.e==='page');
  for(const p of pages().slice(0,2)){Q.put(p.x,p.y);Q.frames(3);}
  Q.put(9050,210);Q.frames(60*19);out.windTakesThem=pages().every(p=>!p.gone);
  for(const p of G.obstacles.filter(o=>o.errand==='page')){Q.put(p.x,p.y);Q.frames(3);}
  out.drifting=G.obstacles.filter(o=>o.errand==='page').some(o=>Math.abs(o.x-o.home[0])>10);
  out.pages=Q.row('archivist').step===1;
  const wall=Q.er().find(o=>o.e==='volume'&&!o.gone);Q.put(wall.x,wall.y);Q.frames(5);out.wall=Q.row('archivist').step===2;
  const m=G.obstacles.find(o=>o.errand==='masonry');Q.put(m.x-45,m.y);G.p.face=1;for(let i=0;i<5;i++)Q.swing();
  const v=Q.er().find(o=>o.e==='volume'&&!o.gone);out.revealed=!!v;if(v){Q.put(v.x,v.y);Q.frames(5);}
  out.ready=Q.row('archivist').phase==='ready';out.returnCue=/RETURN TO THE ARCHIVIST/.test(G.sideStoryScene.questBeat?.text);
  const view=BladefallSideStories.view(BladefallSideStoryWorld.state(),'archivist');out.oneButton=view.choices.length===1;
  return out;});
 for(const [k,v] of Object.entries(archivist))check('Archivist · '+k,v);
 check('no page errors',!errors.filter(e=>!/serviceWorker|register/.test(e)).length,errors.join(' | '));
}finally{await close();}
if(fails.length){console.log('\n'+fails.length+' failed');process.exit(1);}
console.log('\nPASS');
