import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function setup(){
 const g={obstacles:[{courtGlaze:true},{courtFinalGlaze:true}],aoes:[],projectiles:[],particles:[],shake:0};
 const c=vm.createContext({G:g,GROUND_Y:480,meta:{soundOn:false},SFX:{},addText(){},hurtPlayer(){},bossShoot(e,p,kind){g.projectiles.push({kind});},hitEnemy(e,n){e.hp-=n;},Math});
 const start=html.indexOf('function beginCourtFinal('),end=html.indexOf('function drawCourtScenery(',start);
 vm.runInContext(html.slice(start,end),c);
 const e={hp:900,maxHp:900,x:14300,y:0,w:58,h:84,dmg:24,face:1,courtBreaks:2,spellArenaL:13060,spellArenaR:14970};
 const p={x:14500,y:0,w:24,h:44};return {c,g,e,p,o:{boss:e,x:13960,y:205}};
}
test('third ward starts a protected second phase; returns expose and clear pressure',()=>{
 const {c,g,e,o}=setup();c.breakCourtWard(o,{life:1,portalHops:1,stolenSpell:true});
 assert.equal(e.courtBreaks,3);assert.equal(e.courtFinal.beat,'prepare');assert.equal(e.hp,450);assert.equal(e.portalGate,'spellBreak');assert.equal(e.exposeT,0);
 e.courtFinal.beat='return';e.courtFinal.hazards.push({});g.aoes.push({courtAttack:true});
 assert.equal(c.breakCourtWard(o,{life:1,portalHops:0,stolenSpell:true}),false);
 assert.equal(c.breakCourtWard(o,{life:1,portalHops:1,stolenSpell:true}),true);
 assert.equal(e.exposeT,5);assert.equal(e.courtFinal.hazards.length,0);assert.equal(g.aoes.length,0);assert.ok(e.hp<450);
 assert.equal(c.breakCourtWard(o,{life:1,portalHops:1,stolenSpell:true}),false);
});
test('barrage has warned high/low lanes, faster escalation and a stationary return window',()=>{
 const {c,g,e,p,o}=setup();c.beginCourtFinal(e);const f=e.courtFinal;f.hits=2;
 const seen=new Set(),lanes=[];
 for(let i=0;i<1200&&f.beat!=='return';i++){
  c.updateCourtFinal(e,p,1/60);c.updateCourtReceiver(o);
  for(const h of f.hazards)if(!seen.has(h)){seen.add(h);lanes.push({y:h.y,speed:Math.abs(h.vx),warn:h.warn});}
 }
 assert.deepEqual(lanes.map(h=>h.y),[14,112,14]);assert.ok(lanes.every(h=>h.speed===610&&h.warn>.8));assert.equal(f.beat,'return');assert.equal(g.projectiles.length,1);
 const x=o.x;for(let i=0;i<20;i++){c.updateCourtFinal(e,p,1/60);c.updateCourtReceiver(o);}assert.equal(o.x,x);
 for(let i=0;i<170;i++){c.updateCourtFinal(e,p,1/60);c.updateCourtReceiver(o);}
 assert.equal(g.projectiles.length,3,'three returnable shots per window');assert.equal(o.x,x);
});
test('missed returns and spent openings retry without permanently frozen footing',()=>{
 const {c,g,e,p,o}=setup();c.beginCourtFinal(e);const f=e.courtFinal;
 f.beat='return';f.t=.01;c.updateCourtFinal(e,p,.02);assert.equal(f.beat,'prepare');assert.equal(f.round,1);
 f.beat='return';c.breakCourtWard(o,{life:1,portalHops:1,stolenSpell:true});assert.ok(g.obstacles.every(o=>!o.ice&&!o.courtFrostWarn));
 for(let i=0;i<302;i++)c.updateCourtFinal(e,p,1/60);
 assert.equal(f.beat,'prepare');assert.equal(e.exposeT,0);assert.equal(f.hits,1);
});
test('all inline scripts parse',()=>{
 for(const [,code] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(code.trim())new vm.Script(code);
});
test('rupture drains to the last fifth, then draws the court\u2019s cold back to 70% for a long finale',()=>{
 const {c,g,e,p}=setup();g.p=p;c.beginCourtFinal(e);
 assert.equal(c.courtFinalDamage(e,9999),270);
 e.hp-=c.courtFinalDamage(e,9999);c.updateCourtFinal(e,p,1/60);
 assert.equal(e.hp,630,'the rupture restores him to 70% of max');
 assert.equal(e.portalGate,null);assert.equal(e.courtFinal.ruptured,true);
 assert.ok(g.particles.length>0&&g.shake>0,'the refill reads as an event, not a silent heal');
 assert.equal(c.courtFinalDamage(e,9999),9999,'final phase can be killed normally');
 const attacks=new Set(),lanes=new Set();let recoveryWithHazard=false,sawIce=false,sawWarning=false;
 for(let i=0;i<600;i++){
  c.updateCourtFinal(e,p,1/60);const f=e.courtFinal;attacks.add(f.attack);
  for(const h of f.hazards)if(!h.vy)lanes.add(h.y);
  recoveryWithHazard ||= f.attack==='recover'&&f.hazards.length>0;
  sawIce ||= g.obstacles.some(o=>o.ice);sawWarning ||= g.obstacles.some(o=>o.courtFrostWarn);
  assert.ok(e.x>=e.spellArenaL&&e.x<=e.spellArenaR);
 }
 assert.deepEqual([...attacks].sort(),['recover','rush','windup']);assert.deepEqual([...lanes].sort((a,b)=>a-b),[14,112]);
 assert.ok(recoveryWithHazard&&sawIce&&sawWarning);
 assert.equal(e.hp,630,'the refill happens once, never topping up mid-phase');
});
test('saved level-select session survives JSON storage without becoming campaign progress',()=>{
 const meta={capabilities:{acquired:['campaign-only']}},g={levelSelectMode:true,stageIndex:8,p:{},
  sessionCapabilities:{acquired:['jump','dash','portal']},sessionQuests:{done:['preview']},sessionZoneState:{opened:['preview-door']}};
 const c=vm.createContext({G:g,meta,persist(){},snapOf(){return {};}});
 const start=html.indexOf('function savedRunSession('),end=html.indexOf('\n/* The Forge:',start);
 vm.runInContext(html.slice(start,end),c);c.saveRunAtStage(8,{});
 const stored=JSON.parse(JSON.stringify(meta.run)),restored=c.savedRunSession(stored);
 assert.equal(restored.levelSelectMode,true);
 assert.deepEqual(JSON.parse(JSON.stringify(restored.sessionCapabilities)),g.sessionCapabilities);
 assert.deepEqual(JSON.parse(JSON.stringify(restored.sessionZoneState)),g.sessionZoneState);
 restored.sessionCapabilities.acquired.push('later');assert.equal(stored.sessionCapabilities.acquired.length,3);
 assert.deepEqual(meta.capabilities.acquired,['campaign-only']);
 const campaign=c.savedRunSession({levelSelectMode:false});assert.equal(campaign.sessionCapabilities,null);
});
test('rupture cycles left/right/left/up/down with committed, warned vertical columns',()=>{
 const {c,g,e,p}=setup();g.p=p;c.beginCourtFinal(e);e.hp=180;
 const seen=new Set(),directions=[];let vertical=null,startY=0;
 for(let i=0;i<590;i++){
  c.updateCourtFinal(e,p,1/60);
  for(const h of e.courtFinal.hazards)if(!seen.has(h)){
   seen.add(h);directions.push(h.vy?(h.vy>0?'up':'down'):(h.vx>0?'right':'left'));
   assert.ok(h.warn>.75,'warning retained before motion');
   if(h.vy>0){vertical=h;startY=h.y;}
  }
 }
 assert.deepEqual(directions,['right','left','right','up','down']);
 assert.ok(vertical.y>startY,'upward projectile travels');
 const down=e.courtFinal.hazards.find(h=>h.vy<0),column=down.x;
 p.x-=200;for(let i=0;i<120;i++)c.updateCourtFinal(e,p,1/60);
 assert.equal(down.x,column,'vertical column does not track player');
 assert.ok(!e.courtFinal.hazards.includes(down),'vertical projectile is removed after leaving arena');
});
