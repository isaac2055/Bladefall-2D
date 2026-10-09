// Focused contact contracts for the opt-in Run 2 movement profile. No authored rooms are changed.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core,keysToInput} from './pcore-tape.mjs';

const tests=[];
function test(name,fn){tests.push([name,fn]);}
function room(profile=true,{wall=false,thorn=false,slick=false,pod=false,lantern=false,phase=false,lateFace=false}={}){
 const map=Array.from({length:23},()=>Array(40).fill('.'));
 map[0].fill('#');map[21].fill('#');map[22].fill('#');map[20][5]='P';
 if(wall)for(let y=2;y<(lateFace?14:21);y++)map[y][12]='#';
 if(thorn)for(let y=2;y<21;y++)map[y][11]='<';
 if(pod)map[13][12]='b';if(lantern)map[11][12]='l';if(phase)map[20][35]='A';
 return {id:'movement-contract',name:'Movement contract fixture',map:map.map(r=>r.join('')),exit:'right',...(profile?{movement:'survive-2'}:{}),...(slick?{slick:[[12,2,12,20]]}:{})};
}
function game(profile=true,opts={}){return Core.createGame([room(profile,opts)]);}
function ticks(g,n,k=''){for(let i=0;i<n;i++)Core.step(g,keysToInput(k));}
function has(g,type){return g.events.some(e=>e.type===type);}
function count(g,type){return g.events.filter(e=>e.type===type).length;}
function airborne(g,{x=96,y=80,vx=0,vy=0,dashes=0,stamina=7}={}){Object.assign(g.p,{x,y,vx,vy,dashes,stamina,onGround:false,wasGround:false,jumpGrace:0});return g;}
function upDash(profile=true,opts={}){
 const g=airborne(game(profile,{wall:true,phase:true,...opts}),{x:opts.thorn?84:88,y:opts.lateFace?149:140,dashes:1});
 ticks(g,1,'ux');for(let i=0;i<30&&g.p.state==='dash';i++)ticks(g,1,'u');
 assert.equal(g.p.state,'normal');assert.equal(count(g,'dash'),1);return g;
}
function cargo(profile=true){return airborne(game(profile,{lantern:true,phase:true}),{x:60,y:88,vx:0,vy:0,dashes:1});}
function until(g,predicate,keys,n=40){for(let i=0;i<n&&!predicate(g);i++)ticks(g,1,keys);assert.ok(predicate(g),'expected contact within bounded trace');}

for(const [name,keys,speed]of [['super','rx',260],['hyper','rdx',325]]){
 test('reverse '+name+' uses jump direction once',()=>{const g=game(true,{phase:true});ticks(g,7,keys);ticks(g,1,'lj');assert.ok(has(g,'reverse-'+name));assert.ok(has(g,name));assert.equal(g.p.vx,-speed);assert.equal(count(g,'phase'),1);assert.equal(g.p.dashes,0);});
 test('legacy '+name+' keeps dash direction',()=>{const g=game(false,{phase:true});ticks(g,7,keys);ticks(g,1,'lj');assert.ok(has(g,name));assert.ok(!has(g,'reverse-'+name));assert.equal(g.p.vx,speed);assert.equal(count(g,'phase'),1);});
 test('neutral '+name+' keeps dash direction',()=>{const g=game();ticks(g,7,keys);ticks(g,1,'j');assert.ok(has(g,name));assert.ok(!has(g,'reverse-'+name));assert.equal(g.p.vx,speed);});
}

test('pogo low/loft require actual blade contact and preserve lateral speed',()=>{
 for(const [keys,event,speed]of [['ds','pogo-low',-135],['djs','pogo-loft',-210]]){
  const g=airborne(game(true,{pod:true}),{vx:190});g.p.coast=true;ticks(g,1,keys);
  assert.ok(has(g,event));assert.ok(has(g,'pod'));assert.equal(g.p.vy,speed);assert.equal(g.p.vx,190);assert.equal(g.p.dashes,1);assert.equal(g.p.stamina,110);
 }
 const old=airborne(game(false,{pod:true}));ticks(old,1,'ds');assert.equal(old.p.vy,-210);assert.ok(!has(old,'pogo-low'));
 const miss=airborne(game());ticks(miss,1,'djs');assert.ok(!has(miss,'pogo-loft'));assert.equal(miss.p.dashes,0);assert.equal(miss.p.stamina,7);
});

test('pogo loft accepts the five-frame jump intent, then expires',()=>{
 for(const [wait,event]of [[3,'pogo-loft'],[4,'pogo-low']]){const g=airborne(game(true,{pod:true}));ticks(g,1,'j');ticks(g,wait);ticks(g,1,'ds');assert.ok(has(g,event));}
});

test('one buffered loft intent applies to every downward contact in that strike',()=>{
 const g=airborne(game(true,{pod:true}));
 const pod=g.ents.find(e=>e.type==='pod');g.ents.push({...pod,id:999,x:pod.x+8});
 ticks(g,1,'j');ticks(g,2);ticks(g,1,'ds');
 assert.equal(count(g,'pod'),2);assert.equal(count(g,'pogo-loft'),2);assert.equal(count(g,'pogo-low'),0);assert.equal(g.p.vy,-210);
});

test('cargo catch can be held from before dash; velocity and spent resource survive',()=>{
 const g=cargo();ticks(g,1,'g');ticks(g,1,'rxg');until(g,q=>has(q,'cargo-dash-catch'),'rg');
 const e=g.events.find(e=>e.type==='cargo-dash-catch');assert.equal(e.vx,240);assert.equal(e.vy,0);assert.equal(g.p.vx,240);assert.equal(g.p.vy,0);
 assert.equal(g.p.dashes,0);assert.equal(g.p.state,'normal');assert.ok(g.p.carrying);assert.equal(count(g,'phase'),1);
 ticks(g,6,'rg');assert.equal(count(g,'pickup'),1);assert.equal(count(g,'throw'),0);assert.equal(g.p.vx,240);assert.ok(g.p.vy<=45);assert.equal(g.p.dashes,0);
});

test('a successful ordinary throw consumes that Grab press before a later dash',()=>{
 const g=cargo();g.p.x=96;ticks(g,1,'g');assert.ok(g.p.carrying);ticks(g,1);ticks(g,1,'g');
 assert.ok(has(g,'throw'));assert.equal(g.p.move2.grabArmed,false);assert.equal(g.p.move2.grabIntent,0);
 ticks(g,1,'ux');ticks(g,5,'u');assert.ok(!has(g,'cargo-dash-catch'));assert.equal(g.p.carrying,null);
});

test('diagonal cargo catch preserves inherited horizontal and vertical dash velocity',()=>{
 const g=cargo();g.p.y=112;g.p.vx=300;g.p.coast=true;ticks(g,1,'ruxg');until(g,q=>has(q,'cargo-dash-catch'),'rug');
 const e=g.events.find(e=>e.type==='cargo-dash-catch');assert.equal(e.vx,300);assert.ok(Math.abs(e.vy+240/Math.sqrt(2))<1e-8);assert.equal(g.p.dashes,0);assert.equal(count(g,'phase'),1);
});

test('cargo release buffer catches without requiring Grab on the contact frame',()=>{
 const g=cargo();ticks(g,1,'rxg');until(g,q=>q.p.x>=80,'rg');ticks(g,1,'r');until(g,q=>has(q,'cargo-dash-catch'),'r',5);
 assert.ok(g.p.carrying);assert.equal(g.p.dashes,0);assert.equal(count(g,'phase'),1);
});

test('cargo catch is opt-in and requires fresh Grab intent',()=>{
 const legacy=cargo(false);ticks(legacy,1,'rxg');ticks(legacy,11,'rg');assert.ok(!has(legacy,'cargo-dash-catch'));assert.equal(legacy.p.carrying,null);
 const noGrab=cargo();ticks(noGrab,1,'rx');ticks(noGrab,11,'r');assert.ok(!has(noGrab,'cargo-dash-catch'));assert.equal(noGrab.p.carrying,null);
 const expired=cargo();ticks(expired,1,'g');ticks(expired,6);ticks(expired,1,'rx');ticks(expired,11,'r');assert.ok(!has(expired,'cargo-dash-catch'));
});

test('late wallbounce works on first and sixth post-dash ticks without another phase flip',()=>{
 for(const wait of [0,5]){const g=upDash();assert.equal(g.p.move2.wallGrace,6);ticks(g,wait);ticks(g,1,'j');assert.ok(has(g,'late-wallbounce'));assert.equal(count(g,'wallbounce'),1);assert.equal(count(g,'phase'),1);assert.equal(g.p.move2.wallGrace,0);assert.equal(g.p.dashes,0);assert.equal(g.p.vx,-170);}
});

test('Jump buffered before the late wall contact waits for contact instead of consuming grace',()=>{
 for(const wait of [0,1,2,3,4,5]){const g=upDash(true,{lateFace:true});ticks(g,wait);ticks(g,1,'j');ticks(g,4,'j');assert.equal(count(g,'late-wallbounce'),1);assert.equal(count(g,'phase'),1);}
 const miss=upDash(true,{lateFace:true});ticks(miss,6);ticks(miss,1,'j');ticks(miss,4,'j');assert.ok(!has(miss,'late-wallbounce'));
});

test('late wallbounce expires, is opt-in, and rejects thorned faces',()=>{
 const expired=upDash();ticks(expired,6);ticks(expired,1,'j');assert.ok(!has(expired,'late-wallbounce'));assert.ok(has(expired,'walljump'));
 const legacy=upDash(false);ticks(legacy,1,'j');assert.ok(!has(legacy,'late-wallbounce'));assert.ok(has(legacy,'walljump'));
 const thorn=upDash(true,{thorn:true});ticks(thorn,1,'j');assert.ok(!has(thorn,'wallbounce'));assert.ok(!has(thorn,'late-wallbounce'));
});

test('slick walls allow the same opt-in late wallbounce, not an ordinary wall kick',()=>{
 const g=upDash(true,{slick:true});ticks(g,1,'j');assert.ok(has(g,'late-wallbounce'));
 const expired=upDash(true,{slick:true});ticks(expired,6);ticks(expired,1,'j');assert.ok(!has(expired,'wallbounce'));assert.ok(!has(expired,'walljump'));
});

test('a Strike buffered during freeze cancels the late wallbounce when it starts',()=>{
 const g=upDash(true,{slick:true});g.freeze=2;ticks(g,1,'sj');ticks(g,1);ticks(g,1);
 assert.ok(has(g,'strike'));assert.ok(!has(g,'late-wallbounce'));assert.equal(g.p.move2.wallGrace,0);
});

test('a simultaneous echo swap and Jump cannot carry grace to the destination wall',()=>{
 const g=upDash(true,{slick:true});g.echoOn=true;g.echo={type:'echo',dev:true,presses:true,x:88,y:80,w:8,h:11,id:'echo',facing:1};g.ents.push(g.echo);
 ticks(g,1,'qj');assert.ok(has(g,'echo-swap'));assert.ok(!has(g,'late-wallbounce'));assert.equal(g.p.move2.wallGrace,0);
});

test('grab, another movement state, and reset consume the contact window',()=>{
 const grab=upDash();ticks(grab,1,'g');assert.equal(grab.p.move2.wallGrace,0);
 const frozen=upDash();frozen.freeze=2;ticks(frozen,1,'g');ticks(frozen,1);assert.equal(frozen.p.move2.wallGrace,0);
 const other=upDash();other.p.state='hook';ticks(other,1);assert.equal(other.p.move2.wallGrace,0);
 const reset=upDash();reset.p.move2.grabArmed=true;reset.p.move2.grabIntent=5;reset.p.move2.jumpIntent=5;Core.resetRoom(reset);
 assert.equal(reset.p.move2.wallGrace,0);assert.equal(reset.p.move2.grabArmed,false);assert.equal(reset.p.move2.jumpIntent,0);assert.equal(reset.p.carrying,null);
});

// Optional one-time before/after comparison against the saved pre-edit source. The regular test
// command is self-contained; no old source copy is required after the implementation review.
const baseline=process.argv.indexOf('--legacy');
if(baseline>=0)test('unprofiled deterministic tapes equal the pre-edit core on every frame',()=>{
 const ctx={};vm.runInNewContext(readFileSync(process.argv[baseline+1],'utf8'),ctx);const old=ctx.BladefallPrecisionCore;
 for(const tape of [[[7,'rx'],[1,'lj'],[35,'r']],[[7,'rdx'],[1,'lj'],[35,'r']],[[1,'j'],[12,'r'],[12,'ux'],[15,'rg'],[1,'lj'],[20,'l']]]){
  const d=room(false,{wall:true,phase:true,lantern:true,pod:true});const a=old.createGame([d]),b=Core.createGame([d]);
  for(const[n,k]of tape)for(let i=0;i<n;i++){old.step(a,keysToInput(k));Core.step(b,keysToInput(k));assert.equal(Core.digest(b),old.digest(a));assert.equal(JSON.stringify(b.events),JSON.stringify(a.events));}
 }
});

let failures=0;for(const[name,fn]of tests){try{fn();console.log('PASS '+name);}catch(e){failures++;console.error('FAIL '+name+'\n'+e.stack);}}
if(failures)process.exitCode=1;else console.log('All '+tests.length+' movement contracts passed.');
