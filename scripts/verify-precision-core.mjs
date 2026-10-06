// Precision Core verification (7.245).
//  1. Movement rules measured against their constants: jump arc, coyote and buffer windows,
//     corner correction, super/hyper, wall jump reach, crystal rule, stone rebound, lantern return.
//  2. Every room's intended route replays to its exit with no deaths, identically twice.
//  3. Every puzzle room's tempting wrong strategies fail — the evidence that the room asks a
//     question instead of only testing timing. These are families of legal inputs, not proofs
//     that no other route exists; alternate solutions are allowed if they are found and kept.
import {Core,Rooms,runRoom,expand,keysToInput} from './pcore-tape.mjs';
let fail=0,pass=0;const say=(ok,msg)=>{ok?pass++:fail++;console.log((ok?'  ok   ':'  FAIL ')+msg);};
const idx=id=>Rooms.all.findIndex(d=>d.id===id);
const sim=(id,tape,extra=0)=>runRoom(Rooms.all,idx(id),tape,{maxExtra:extra});
const range=(a,b,s=1)=>{const o=[];for(let v=a;v<=b;v+=s)o.push(v);return o;};
const none=(label,id,tapes)=>{let n=0;for(const t of tapes)if(sim(id,t).exited)n++;say(n===0,`${id}: ${label} (${tapes.length} tried, ${n} finish)`);};

// ---------------------------------------------------------------- 1. movement rules
console.log('Movement rules');
const flat={id:'flat',name:'flat',map:(()=>{const m=[];for(let r=0;r<23;r++)m.push(r===0||r>=21?'#'.repeat(40):'#'+'.'.repeat(38)+'#');m[20]='#'+'.'.repeat(9)+'P'+'.'.repeat(28)+'#';return m;})()};
const run=(def,tape)=>{const g=Core.createGame([def]);const log=[];for(const k of expand(tape)){Core.step(g,keysToInput(k));log.push({x:g.p.x,y:g.p.y,vx:g.p.vx,vy:g.p.vy,st:g.p.state,gr:g.p.onGround,d:g.p.dashes,ev:g.events.map(e=>e.type)});g.events.length=0;}return {g,log};};
{
 const {log}=run(flat,[[2,''],[60,'j']]);const y0=log[0].y,rise=y0-Math.min(...log.map(t=>t.y));
 say(rise===27,`full jump rises 27 px (${rise})`);
 const tap=run(flat,[[2,''],[1,'j'],[60,'']]).log;say(y0-Math.min(...tap.map(t=>t.y))<12,'a tapped jump is short (variable height)');
 const dash=run(flat,[[2,''],[5,'rx'],[30,'']]).log;const dx=Math.max(...dash.map(t=>t.x))-dash[0].x;
 say(dx>=40&&dx<=56,`ground dash covers ${dx} px`);
 say(dash.filter(t=>t.st==='dash').length>=9,'dash lasts 9 frames after a 3-frame freeze');
 // Coyote: walk off a ledge, then press jump N frames later.
 const ledge={id:'ledge',name:'ledge',map:(()=>{const m=[];for(let r=0;r<23;r++)m.push('#'+'.'.repeat(38)+'#');m[0]='#'.repeat(40);m[16]='#'+'#'.repeat(9)+'.'.repeat(29)+'#';m[15]='#P'+'.'.repeat(37)+'#';m[22]='#'.repeat(40);return m;})()};
 const offAt=run(ledge,[[90,'r']]).log.findIndex(t=>!t.gr);
 const jumpAfter=n=>run(ledge,[[offAt+n,'r'],[1,'rj'],[10,'r']]).log.slice(offAt+n).some(t=>t.ev.includes('jump'));
 const coyote=range(0,10).filter(jumpAfter).length;
 say(coyote>=5&&coyote<=6,`coyote time: a jump is still accepted for ${coyote} frames after leaving a ledge`);
 // Jump buffer: press jump N frames before landing; it fires on landing.
 const first=run(flat,[[2,''],[1,'j'],[80,'']]).log;const L=first.findIndex((t,i)=>i>4&&t.gr);
 const buffered=n=>run(flat,[[2,''],[1,'j'],[L-3-n,''],[1,'j'],[40,'']]).log.filter(t=>t.ev.includes('jump')).length===2;
 const buf=range(1,10).filter(buffered).length;
 say(buf===4,`jump buffer: a press up to ${buf} frames before landing still jumps`);
 // Super and hyper from a ground dash.
 const sup=run(flat,[[2,''],[5,'rx'],[3,'r'],[1,'rj'],[20,'rj']]).log;say(sup.some(t=>t.ev.includes('super'))&&Math.max(...sup.map(t=>t.vx))>=259,'jumping out of a ground dash is a super (260 px/s)');
 const hyp=run(flat,[[2,''],[5,'rdx'],[3,'rd'],[1,'rj'],[20,'rj']]).log;say(hyp.some(t=>t.ev.includes('hyper'))&&Math.max(...hyp.map(t=>t.vx))>=320,'from a down-diagonal dash it is a hyper (325 px/s)');
 // Corner correction: a jump that clips a ceiling corner by 3 px slides past it.
 const ccMap=[];for(let r=0;r<23;r++)ccMap.push(r===0||r>=21?'#'.repeat(40):'#'+'.'.repeat(38)+'#');
 ccMap[20]='#P'+'.'.repeat(37)+'#';ccMap[16]='#'+'.'.repeat(9)+'#'+'.'.repeat(28)+'#';
 const cg=Core.createGame([{id:'cc',name:'cc',map:ccMap}]);cg.p.x=75;let top=cg.p.y;
 for(let i=0;i<40;i++){Core.step(cg,keysToInput('j'));top=Math.min(top,cg.p.y);}
 say(top<136&&cg.p.x===72,`upward corner correction slides a 3 px overlap past a ceiling corner (x 75→${cg.p.x}, top ${top})`);
}
{
 // Crystal rule: a crystal is not spent while you have your dash and are not tired.
 const room={id:'cr',name:'cr',map:(()=>{const m=[];for(let r=0;r<23;r++)m.push('#'+'.'.repeat(38)+'#');m[0]='#'.repeat(40);m[21]='#'.repeat(40);m[22]='#'.repeat(40);m[20]='#P'+'.'.repeat(37)+'#';m[16]='#o'+'.'.repeat(37)+'#';return m;})()};
 const a=run(room,[[2,''],[40,'j']]);say(!a.log.some(t=>t.ev.includes('refill')),'a crystal ignores a knight who still has a dash');
 const b=run(room,[[2,''],[5,'ux'],[30,'']]);say(b.log.some(t=>t.ev.includes('refill')),'the same crystal restores a spent dash');
}
{
 // Slide stone: dash into it and it runs until blocked, and the knight rebounds with the dash spent.
 const i=idx('k1');const g=Core.createGame(Rooms.all,{room:i});for(const k of expand([[28,'r'],[5,'rx'],[60,'']]))Core.step(g,keysToInput(k));
 const s=g.ents.find(e=>e.type==='slide');say(s.x===144&&!s.moving,`a pushed slide stone stops flush against the post (x=${s.x})`);
 // Lantern returns home after falling into thorns.
 const j=idx('l1');const h=Core.createGame(Rooms.all,{room:j});for(const k of expand([[15,'r'],[1,'rg'],[2,''],[1,'g'],[140,'']]))Core.step(h,keysToInput(k));
 const l=h.ents.find(e=>e.type==='lantern');say(l.x===l.ox&&l.y===l.oy&&!l.held,'a lantern thrown into thorns floats back to where it started');
 // Retry restores everything in the room.
 const k=idx('k3');const q=Core.createGame(Rooms.all,{room:k});for(const t of expand([[22,'r'],[5,'rx'],[60,'']]))Core.step(q,keysToInput(t));
 Core.resetRoom(q);const s2=q.ents.find(e=>e.type==='slide');say(s2.x===s2.ox&&s2.y===s2.oy&&q.phase===0,'retry returns stones, machinery and lanterns to their places');
}

// ---------------------------------------------------------------- 2. routes
console.log('Intended routes');
for(const [i,d] of Rooms.all.entries()){
 const tape=Rooms.tapes[d.id];
 if(!tape){say(false,`${d.id} has no tape`);continue;}
 const a=runRoom(Rooms.all,i,tape),b=runRoom(Rooms.all,i,tape);
 say(a.exited&&a.deaths===0,`${d.id} ${d.name}: exits at frame ${a.exitFrame}, no deaths`);
 if(Core.digest(a.g)!==Core.digest(b.g))say(false,`${d.id} replays identically`);
}

// Focused regression mode for changes to shared movement and room boundaries.
// The default invocation still runs every puzzle/foe/portal strategy search.
if(process.argv.includes('--movement-and-routes')){
 console.log(`\nMovement and intended routes: ${pass} passed, ${fail} failed`);
 process.exit(fail?1:0);
}

// ---------------------------------------------------------------- 3. the wrong answers fail
console.log('Tempting wrong strategies fail');
const oneDash=(runs,jumps,dirs)=>{const o=[];for(const w of runs)for(const j of jumps)for(const d of dirs)o.push([[w,'r'],[j,'rj'],[5,d+'x'],[200,'r']]);return o;};
none('one dash cannot cross Green Glass without the crystal','d1',oneDash(range(0,40,4),range(4,24,2),['r','ru']));
none('one dash cannot reach Height First\'s ledge without the crystal','d2',oneDash(range(0,40,4),range(4,24,2),['r','ru','u']));
none('the far gap in Spend It Low needs the refunded dash','d3',[[[8,'l'],[8,''],[10,'j'],[5,'jux'],[6,'j'],[118,'lgu'],[16,''],[8,'r'],[30,'rj'],[140,'r']]]);
none('Spend It Low cannot be climbed without dashing first','d3',range(0,30,3).map(w=>[[w,'l'],[10,'lj'],[300,'lgu'],[4,''],[16,'rj'],[5,'rjx'],[120,'r']]));
none('Cut Back cannot be crossed with one dash','b3',oneDash(range(0,40,4),range(4,24,2),['r','ru']));
none('Last One Home: dropping first strands you below the high stone','t3',range(20,56,4).flatMap(w=>range(40,160,20).flatMap(c=>['lx','lux','lu'].map(d=>[[w,'r'],[80,''],[60,'r'],[8,'rj'],[c,'rgu'],[1,'lgj'],[4,'l'],[5,d+(d.includes('x')?'':'x')],[80,'l'],[200,'r']]))));
none('Count: crossing without flipping first drops you through the cyan landing','s2',oneDash(range(0,40,4),range(4,22,2),['r','ru']));
none('The Bell: a plain dash erases the cyan landing','s3',oneDash(range(0,20,2),range(4,22,2),['r','ru']));
none('The Bell: a plain jump falls short','s3',range(0,30,2).flatMap(w=>range(4,24,2).map(j=>[[w,'r'],[j,'rj'],[200,'r']])));
none('Stepping Stone cannot be crossed without pushing the stone','k1',oneDash(range(0,60,4),range(4,22,2),['r','ru']));
none('A Step Up cannot be climbed without moving the stone','k2',range(0,120,4).flatMap(w=>range(4,16,2).flatMap(j=>['u','ru'].map(d=>[[w,'r'],[j,'j'],[5,'j'+d+'x'],[60,'rgu'],[20,'l'],[10,''],[10,'j'],[5,'jux'],[60,'j']]))));
none('Down the Well cannot be passed without plunging the stone','k3',range(0,120,4).flatMap(w=>['r',''].map(d=>[[w,'r'],[4,''],[20,'d'],[40,d+'g'],[200,'r']])));
none('Seed Lantern cannot be crossed without the lantern','l1',oneDash(range(0,50,2),range(4,22,2),['r','ru']));
none('Under the Door cannot be passed without the lantern','l3',range(0,120,4).flatMap(w=>[[[w,'r'],[300,'r']],[[w,'r'],[14,'rj'],[5,'rx'],[300,'r']]]));
none('Ride: the high ledge is out of reach without the zip','z1',oneDash(range(0,60,4),range(4,16,4),['u','ru']));
none('Wait for It: riding on top or jumping across fails','z2',range(0,40,2).flatMap(w=>[[[w,'r'],[10,'rj'],[300,'r']],[[w,'r'],[10,'rj'],[5,'rx'],[300,'r']]]));
none('Full Hands: gliding the amber gap in the wrong phase fails','m1',range(60,200,4).flatMap(w=>range(4,20,4).map(j=>[[114,'r'],[4,''],[4,'r'],[1,'rg'],[2,''],[w,'r'],[j,'rj'],[60,'r'],[1,'dg'],[200,'r']])));
none('Machine Step: pushing without flipping first sends the stone too far','m2',range(0,120,4).flatMap(w=>[30,60].map(c=>[[5,'rx'],[60,''],[w,'r'],[14,'rj'],[10,'r'],[20,''],[12,'j'],[5,'jux'],[c,'rgu'],[20,'l'],[10,''],[12,'j'],[5,'jux'],[60,'j']])));

none('Super: a jump and a dash cannot span the pit','x1',oneDash(range(20,90,2),range(4,22,2),['r','ru']));
none('Low Road: a jump and a dash cannot pass under the ceiling','x2',oneDash(range(20,90,2),range(4,22,2),['r','ru']));
none('Low Road: a super bonks the ceiling and falls short','x2',range(40,90,2).flatMap(w=>range(1,8).map(k=>[[w,'r'],[5,'rx'],[k,'r'],[1,'rj'],[60,'rj'],[100,'r']])));

// ---------------------------------------------------------------- Part II: combined ideas
console.log('Part II: tempting wrong strategies fail');
const chain=(id,count)=>{let n=0;for(const t of count)if(sim(id,t).exited)n++;return n;};
none('There and Back: no single dash crosses the pit','r1',oneDash(range(0,40,2),range(4,24,2),['r','ru']));
none('Hang Time: the gate holds without the stone','r2',range(0,20,4).flatMap(w=>range(8,22,4).flatMap(j=>range(6,16,4).flatMap(k=>['r','ru'].map(d=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,'rx'],[30,'rg'],[300,'rgu'],[60,'']])))));
none('Pollen Count: the chain alone leaves the gate shut','g1',range(0,24,2).flatMap(w=>['r','ru'].map(d=>[[30,'r'],[4,'r'],[6,'rd'],[1,'rds'],[2,'r'],[32,'r'],[6,'rd'],[1,'rds'],[2,'r'],[10,'r'],[5,'rx'],[30,'r'],[6,'rd'],[1,'rds'],[2,'r'],[w,'r'],[5,d+'x'],[200,'r']])));
none('Cut Back Twice: one dash never crosses','g2',oneDash(range(0,40,4),range(4,24,2),['r','ru']));
none('Glass Counts Too: two dashes land the wrong colour','w1',range(16,44,4).flatMap(w=>range(8,22,2).flatMap(j=>['r','ru'].flatMap(d=>range(4,16,2).flatMap(k=>['r','ru'].map(e=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,e+'x'],[200,'r']]))))));
none('Read the Colors: the long hop fails without the bell','w2',range(0,16,2).flatMap(w=>range(4,20,2).flatMap(j=>['r','ru'].flatMap(d=>range(0,16,4).map(k=>[[4,'r'],[10,'rj'],[20,''],[6,'r'],[10,'rj'],[5,'rx'],[20,''],[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[200,'r']])))));
none('Far Stone First: pushing the near stone first jams the stair','n1',range(0,30,3).flatMap(w=>range(0,80,8).flatMap(v=>['u','ru'].map(d=>[[16,'r'],[5,'rx'],[60,''],[w,'r'],[14,'rj'],[5,'ux'],[20,'r'],[v,'r'],[12,'j'],[5,'j'+d+'x'],[60,'rgu'],[200,'r']]))));
none('Bell Stop: pushing without the bell loses the ledge and the stone','n2',range(0,30,2).flatMap(k=>[[[17,'r'],[5,'rx'],[k,''],[300,'r']],[[17,'r'],[5,'rx'],[k,'r'],[12,'j'],[5,'jux'],[200,'rgu']]]));
none('Hold the Door: the landing is out of reach without the lantern','q1',range(0,30,2).flatMap(w=>range(6,22,2).flatMap(j=>['r','ru'].map(d=>[[3,'r'],[1,'rg'],[2,''],[30,'r'],[1,'dg'],[6,''],[40,'r'],[w,'r'],[j,'rj'],[5,d+'x'],[300,'r']]))));
{let n=0,t=0;for(const w of range(0,40,2))for(const j of range(4,22,2)){t++;const r=sim('q2',[[3,'r'],[1,'rg'],[2,''],[w,'r'],[j,'rj'],[200,'r']]);if(r.g.p.carrying&&r.g.p.onGround&&r.g.p.x>=150&&r.g.p.x<=190)n++;}say(n===0,`q2: Separate Ways: carrying the lantern never reaches the higher shelf (${t} tried, ${n} land)`);}
none('Zip Tally: skipping the high stone keeps the gate shut','y1',range(0,40,2).map(w=>[[10,'r'],[14,'rg'],[30,'rg'],[4,'rgu'],[w,'r'],[200,'r']]));
none('Handoff: no apex dash skips the tall block','y2',range(0,30,2).flatMap(w=>range(4,20,1).flatMap(j=>['u','lu'].map(d=>[[0,'r'],[8,'rj'],[6,'r'],[6,''],[36,''],[w,''],[j,'j'],[5,'j'+d+'x'],[20,'lgu'],[40,'lu'],[200,'l']]))));
none('Stone Cart: the gate holds without the lantern','o1',range(0,40,4).flatMap(w=>range(4,22,4).flatMap(j=>['r','ru'].flatMap(d=>range(4,16,4).map(k=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,'rx'],[300,'r']])))));
none('Lamp Down the Well: the tunnel gate holds without the lantern','o2',range(0,40,4).map(w=>[[28,'r'],[5,'rx'],[60,''],[34,'r'],[12,'rj'],[16,'r'],[20,''],[5,'dx'],[80,''],[w,''],[300,'r']]));
none('Sealed: walking past leaves stones unlit','h1',range(0,160,8).flatMap(w=>[[[w,'r'],[300,'r']],[[34,'r'],[5,'ux'],[20,''],[w,'r'],[300,'r']]]));
none('Stepping Tally: crossing without the high stone keeps the gate shut','h2',range(0,20,2).flatMap(w=>range(6,20,2).flatMap(j=>['r','ru'].map(d=>[[28,'r'],[5,'rx'],[40,''],[20,'rj'],[5,'rx'],[20,'r'],[20,''],[w,'r'],[j,'rj'],[5,d+'x'],[300,'r']]))));
none('Zip Colors: riding without bells stops at the walls','v1',range(0,20,1).flatMap(w=>range(0,60,4).map(k=>[[w,'r'],[4,''],[k,''],[14,'rj'],[200,'r']])));
none('Bell Tower: dashing up turns the next floor solid overhead','v2',range(0,40,2).flatMap(w=>range(0,14,2).flatMap(j=>['u','ru'].flatMap(d=>range(0,20,4).map(k=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,''],[20,''],[8,'j'],[5,'jux'],[30,''],[8,'j'],[5,'jux'],[30,''],[8,'j'],[5,'jux'],[30,''],[10,'rj'],[200,'r']])))));
none('The Counted Crossing: without the bell the cyan landing is gone','u1',range(0,16,4).flatMap(w=>range(8,20,2).flatMap(j=>['r','ru'].flatMap(d=>range(4,14,2).flatMap(k=>['r','ru'].map(e=>[[6,'r'],[14,'rj'],[5,'rx'],[12,'r'],[20,''],[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,e+'x'],[300,'r']]))))));
none('Lantern Line: the gate holds if the lantern stays behind','u2',range(0,50,2).flatMap(w=>range(4,14,2).flatMap(j=>['r','ru'].map(d=>[[3,'r'],[4,'rj'],[4,'r'],[4,''],[w,''],[j,'rj'],[5,d+'x'],[300,'r']]))));
{let n=0,t=0;for(const w of range(0,30,2))for(const j of range(6,16,2))for(const d of ['ru','u'])for(const h of range(0,40,4))for(const e of ['ru','r']){t++;const r=sim('u3',[[w,'r'],[j,'rj'],[5,d+'x'],[h,''],[1,'ds'],[2,''],[4,'r'],[5,e+'x'],[40,'r']]);if(r.events.filter(x=>x.type==='stone-lit').length>=1&&r.g.p.onGround&&r.g.p.y===61)n++;}say(n===0,`u3: The Deep Climb: without an extra flip the amber is gone when you arrive (${t} tried, ${n} land)`);}

// ---------------------------------------------------------------- Part III: medium to hard
console.log('Part III: tempting wrong strategies fail');
// never(): count tapes for which the wrong strategy "works" by the given test; zero is the pass.
const never=(label,id,tapes,works)=>{let n=0;for(const t of tapes)if(works(sim(id,t)))n++;say(n===0,`${id}: ${label} (${tapes.length} tried, ${n} succeed)`);};
const X=(...lists)=>lists.reduce((acc,l)=>acc.flatMap(a=>l.map(v=>[...a,v])),[[]]);
const ev=(r,t)=>r.events.some(e=>e.type===t);
const lanOf=r=>r.g.ents.find(e=>e.type==='lantern');
const slideOf=r=>r.g.ents.find(e=>e.type==='slide');
never('Unbroken: dashing before the glass leaves it growing on the way back','e1',X(range(4,20,4),range(2,16,2),['r','ru'],range(0,16,4),range(0,40,8),['l','lu']).map(([w,j,d,k,m,e])=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,'rx'],[6,'r'],[m,'l'],[5,e+'x'],[40,'l']]),r=>r.deaths===0&&r.g.p.onGround&&r.g.p.x<=40&&ev(r,'stone-lit'));
never('Glass Ladder: leaving the wall well before the glass grows back falls short','e2',range(0,104,4).map(w=>{const t=Rooms.tapes.e2.map(s=>[...s]);t[6][0]=w;return t;}),r=>r.exited);
never('Downstroke: pogo and dash without the up-cuts','i1',X(range(0,16,4),range(2,14,2),['r','ru'],range(0,30,3),['r','ru','rd']).map(([w,j,d,k,e])=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'rd'],[1,'rds'],[4,'r'],[5,e+'x'],[200,'r']]),r=>r.exited);
never('Double Cut: the pod alone leaves the amber down','i2',X(range(0,20,4),range(2,14,2),['r','ru'],range(0,20,2),['r','ru']).map(([w,j,d,k,e])=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[1,'rds'],[3,'r'],[4,'r'],[5,e+'x'],[200,'r']]),r=>r.exited&&!ev(r,'bell'));
never('Inside Out: dashing up from outside a ghost makes it a lid','j1',[...X(range(0,30,1),['u','ru','lu']).map(([w,d])=>[[w,''],[5,d+'x'],[40,'']]),...range(1,30,1).map(j=>[[j,'j'],[40,'']])],r=>r.g.p.onGround&&r.g.p.y<=109);
never('Ghost Wall: no crossing without climbing the ghost','j2',X(range(0,30,4),range(2,20,2),['r','ru'],range(0,20,4),['r','ru']).map(([w,j,d,k,e])=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,e+'x'],[300,'r']]),r=>r.exited);
never('Plumb: the way out is out of reach without driving the stone down','a1',[...X(range(0,40,4),range(1,14,1),['r','rd','d'],range(0,40,4)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']]),...X(range(0,40,2),['r','rd'],['r','']).map(([k,d,h])=>[[14,'r'],[6,'rj'],[10,'r'],[30,''],[20,'r'],[k,h],[5,d+'x'],[200,'r']])],r=>r.exited&&!r.events.some(e=>e.type==='stone-hit'&&e.dy===1));
never('Across, Then Down: dropping the stone where it hangs strands it','a2',X(range(1,9,2),range(0,16,4),range(2,16,2),['r','ru']).map(([j,w,jj,d])=>[[j,'j'],[6,'r'],[20,''],[4,'j'],[5,'dx'],[60,''],[w,'r'],[jj,'rj'],[5,d+'x'],[200,'r']]),r=>r.exited);
never('Across, Then Down: going on from the high stone without driving it down','a2',X(range(0,30,2),['r','rd','ru'],range(0,40,4),['r','']).map(([w,d,k,h])=>[[0,'r'],[5,'rx'],[60,''],[8,'r'],[16,'rj'],[5,'rx'],[24,'r'],[5,'rux'],[20,'r'],[40,''],[w,'r'],[k,h],[5,d+'x'],[200,'r']]),r=>r.exited);
never('Lamp Stairs: the lantern cannot be carried up a step','c1',X(range(0,30,2),range(2,20,2),range(0,40,4)).map(([w,j,k])=>[[w,'r'],[1,'rg'],[4,'r'],[j,'rj'],[k,'r'],[60,'r']]),r=>r.g.p.carrying&&r.g.p.onGround&&r.g.p.y+11<=128);
never('The Slot: the lantern cannot be carried over the wall','c2',X(range(0,60,4),range(2,20,2),['ru','u'],range(0,20,2)).map(([w,j,d,k])=>[[34,'r'],[1,'rg'],[2,''],[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[60,'r']]),r=>r.g.p.carrying&&r.g.p.x>=120);
never('Slingshot: no route to the shelf without riding the rail','p1',X(range(0,40,2),range(4,16,2),range(0,30,2),['ru','r','u']).map(([w,j,k,d])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[120,'r']]),r=>r.exited&&!ev(r,'zip-start'));
never('Slingshot: jumping off before the stop, or after it, falls short','p1',X([...range(0,18,2),...range(60,200,20)],range(4,16,4),range(0,30,4),['ru','r']).map(([w,j,k,d])=>[[25,'r'],[w,''],[j,'rj'],[k,'r'],[5,d+'x'],[120,'r']]),r=>r.exited);
never('Relay: the tall block is out of reach on one dash','p2',X(range(0,60,4),range(4,16,4),range(0,30,4),['r','ru'],range(0,40,8)).map(([w,j,k,d,h])=>[[20,'r'],[w,''],[j,'rj'],[k,'r'],[5,d+'x'],[h,'r'],[40,'rg']]),r=>r.events.some(e=>e.type==='zip-start'&&e.x===280)&&!ev(r,'refill'));
never("Mason's Count: skipping the stone, or stopping it at cyan",'st1',[...X(range(0,16,4),range(2,16,4),['ru','r','u'],range(0,40,8),['r','ru','u'],['','us']).map(([w,j,d,k,e,h])=>[[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,e+'x'],[6,'r'],...(h?[[1,h]]:[]),[160,'r']]),...X(range(0,16,4),range(2,16,4),['ru','r'],range(0,40,8),['r','ru'],range(4,14,4)).map(([w,j,d,k,e,h])=>[[1,'lx'],[30,''],[0,'r'],[5,'rx'],[60,''],[w,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[5,e+'x'],[20,'r'],[40,''],[h,'j'],[1,'us'],[20,''],[0,'rj'],[5,'rx'],[160,'r']])],r=>r.exited);
never('Sealed Step: without the bell the stone runs past the post','st2',X(range(0,16,4),range(2,16,2),range(0,24,4),['r','ru','u'],['','us']).map(([w,j,k,d,h])=>[[2,'r'],[5,'rx'],[60,''],[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],...(h?[[1,h]]:[]),[40,'r'],[60,'']]),r=>ev(r,'gate-open')&&r.deaths===0);
never('Sealed Step: lighting it in flight from the hanging stone leaves nowhere to land','st2',X([0,1],range(0,16,4),range(2,16,2),range(0,24,4),['r','ru','u'],['','us']).map(([b,w,j,k,d,h])=>[...(b?[[0,'r'],[4,'j'],[0,''],[1,'s'],[30,'']]:[]),[10,'r'],[6,'rj'],[10,'r'],[20,''],[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],...(h?[[1,h]]:[]),[40,'r'],[60,'']]),r=>ev(r,'gate-open')&&r.deaths===0&&r.g.p.onGround&&r.g.p.x>72&&!ev(r,'stone-hit'));
never('Lift and Toss: the lantern cannot ride up onto the shelf in hand','lr1',X(range(0,30,2),range(0,60,1),['','r','l']).map(([w,j,h])=>[[10,'r'],[1,'rg'],[2,''],[w,'r'],[4,'rj'],[10,''],[j,''],[12,'j'],[40,h]]),r=>r.g.p.carrying&&r.g.p.onGround&&r.g.p.y+11<=24);
never('Under the Roof: riding on top with the lantern, or throwing it, never delivers it','lr2',[...X(range(0,40,2),range(0,60,4),['r','']).map(([w,j,h])=>[[w,'r'],[4,'rj'],[10,'r'],[1,'rg'],[j,h],[100,'r']]),...X(range(0,40,4),range(2,14,2),range(0,12,2)).map(([w,j,k])=>[[w,'r'],[4,'rj'],[10,'r'],[1,'rg'],[2,''],[20,'l'],[j,'rj'],[k,'r'],[1,'rg'],[80,'']])],r=>{const l=lanOf(r);return (l.held&&r.g.p.x>=256&&r.g.p.state!=='dead')||(!l.held&&!l.returning&&l.x>=256);});
never('Upstroke: the pod alone never reaches the high shelf','en1',X(range(0,40,8),range(4,14,2),['u','lu','ru'],range(0,24,4),['','r'],range(0,12,4),['r','ru','u']).map(([w,j,d,k,h,m,e])=>[[w,'l'],[j,'j'],[5,d+'x'],[k,h],[1,'ds'],[m,'r'],[5,e+'x'],[40,'r']]),r=>r.g.p.onGround&&r.g.p.y<=45&&r.g.p.state!=='dead');
never('Upstroke: flipping once before the push sends the stone to the roof','en1',[[[2,'lx'],[40,''],[12,'r'],[0,'j'],[2,''],[5,'ux'],[80,'']]],r=>slideOf(r).y===56);
never('Doorstop: without the lantern in the wall the stone misses its post','en2',X([[[2,'r'],[5,'rx'],[80,'']],[[0,''],[5,'ux'],[30,''],[2,'r'],[5,'rx'],[80,'']]],range(0,120,12),range(2,16,4),range(0,24,8),['r','ru']).map(([pre,w,j,k,d])=>[...pre,[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[30,'r'],[10,'rj'],[5,'rux'],[120,'r']]),r=>r.exited);
never('The Push Counts: a dash on the way to the stone makes the count wrong','ts1',X(range(0,30,4),range(2,12,4),['r','ru','u'],range(0,40,8),['','r']).map(([w,j,d,m,e])=>[[2,'r'],[5,'rx'],[40,''],[w,'r'],[j,'rj'],[5,d+'x'],[20,''],[0,'j'],[5,'dx'],[80,''],[m,'r'],[8,'rj'],[6,'r'],...(e?[[5,e+'x']]:[]),[30,'r'],[6,'rj'],[160,'r']]),r=>r.exited);
never('The Push Counts: dropping down the open shaft lands on thorns','ts1',X(range(0,80,4),['','r'],range(0,30,6),['','r','rd']).map(([w,h,k,e])=>[[w,'r'],[k,h],...(e?[[5,e+'x']]:[]),[40,'r'],[4,'rj'],[6,'r'],[5,'rx'],[30,'r'],[6,'rj'],[160,'r']]),r=>r.exited&&!r.events.some(e=>e.type==='stone-hit'&&e.dy===1));
never('Last Lamp: the lantern cannot be carried over the wall','ts2',X(range(0,60,4),range(2,16,2),range(0,30,3)).map(([w,j,k])=>[[6,'r'],[1,'rg'],[2,''],[w,'r'],[j,'rj'],[k,'r'],[5,'rux'],[20,'rgu'],[60,'r']]),r=>r.g.p.carrying&&r.g.p.x>=144);
never('Third Summit: the launch alone never reaches the sill','ts3',X(range(20,40,2),range(4,16,2),range(0,24,4),['ru','u','r']).map(([w,j,k,d])=>[[20,'r'],[w,''],[j,'rj'],[k,'r'],[5,d+'x'],[60,'r']]),r=>r.g.p.onGround&&r.g.p.y<=45&&r.g.p.state!=='dead');

// ---------------------------------------------------------------- Part IV (7.250): Foes and Combat actors, merged
console.log('Part IV: shared rules for both foe sets');
{
 const Foes=globalThis.BladefallPrecisionFoes,Combat=globalThis.BladefallPrecisionCombat;
 const base=(extra={},edits=[])=>{const m=Array.from({length:23},(_,y)=>Array(40).fill(y>=20?'#':'.'));m[19][3]='P';for(const [x,y,ch]of edits)m[y][x]=ch;return {id:'fx',exit:'right',map:m.map(r=>r.join('')),...extra};};
 const game=(extra,edits)=>Core.createGame([base(extra,edits)]);
 const st=(g,k='',n=1)=>{for(let i=0;i<n;i++)Core.step(g,keysToInput(k));};
 // One ward for everyone: arming lives in the core, both modules read it.
 {const g=game({study:true,foes:[{kind:'moth',x:20,y:10}]});st(g,'',30);say(g.awake===false&&g.fclock===0,'study: foes wait, still, until the first input');st(g,'p');say(g.awake&&g.p.parryTimer===Core.PARRY.window,'a press wakes the room and arms the one shared ward (9 ticks)');st(g,'',Core.PARRY.window);say(g.p.parryTimer===0&&g.p.parryCooldown===Core.PARRY.recovery-Core.PARRY.window,'a whiff leaves the shared recovery running');}
 // Contact: attacks hurt; bodies hurt only if thorned.
 {const g=game({foes:[{kind:'moth',x:3,y:18}]});st(g,'r');st(g,'',10);say(g.p.state!=='dead','a plain body (moth) is safe to touch');}
 {const g=game({foes:[{kind:'moth',x:3,y:18,thorns:true}]});st(g,'r');st(g,'',10);say(g.deaths===1,'the same moth placed with thorns:true hurts');}
 {const g=game({foes:[{kind:'shell',x:5,y:19,dir:-1}]});st(g,'',40);say(g.deaths===1,'a shellback is thorned: walking into it hurts');}
 {const g=game({foes:[{kind:'ram',x:3,y:19,dir:1,patrol:[1,6]}]});st(g,'u');st(g,'',2);say(g.p.state!=='dead','a walking ram is plain: its body is safe');}
 // Returned shots cross between the sets.
 {const g=game({foes:[{kind:'husk',x:12,y:17,w:1,h:3}],combat:{waitForMove:false,enemies:[],receivers:[],doors:[]}});g.combat.shots.push({id:1,x:80,y:146,w:4,h:4,remX:0,remY:0,vx:180,vy:0,life:100,reflected:true});st(g,'',10);say(!g.foes[0].alive,'a returned Combat shot breaks a husk');}
 {const g=game({foes:[{kind:'shell',x:12,y:19,dir:1}],combat:{waitForMove:false,enemies:[],receivers:[],doors:[]}});g.combat.shots.push({id:1,x:80,y:150,w:4,h:4,remX:0,remY:0,vx:180,vy:0,life:100,reflected:true});st(g,'',10);say(g.foes[0].state==='flip','a returned Combat shot flips a shellback');}
 {const g=game({foes:[{kind:'spit',x:30,y:18,dir:[-1,0],every:600,offset:599}],combat:{waitForMove:false,enemies:[],receivers:[{id:'c',x:120,y:145}],doors:[]}});g.bolts.push({x:100,y:146,w:6,h:6,vx:190,vy:0,friendly:true,alive:true});st(g,'',8);say(g.combat.receivers[0].lit,'a returned foe bolt powers a Combat coil');}
 {const g=game({foes:[{kind:'spit',x:30,y:18,dir:[-1,0],every:600,offset:599}],combat:{waitForMove:false,enemies:[{kind:'sentry',x:120,y:144,delay:999}],receivers:[],doors:[]}});g.bolts.push({x:100,y:150,w:6,h:6,vx:190,vy:0,friendly:true,alive:true});st(g,'',8);say(g.combat.enemies[0].hp===1,'a returned foe bolt damages a Combat actor');}
 // Charges break both kinds of wall.
 {const g=game({foes:[{kind:'husk',x:20,y:17,w:1,h:3}],combat:{waitForMove:false,enemies:[{kind:'hound',x:100,y:150,delay:999}],receivers:[],doors:[]}});Object.assign(g.combat.enemies[0],{state:'attack',t:80,face:1});st(g,'',30);say(!g.foes[0].alive,'a Combat hound\'s charge breaks a husk');}
 {const g=game({foes:[{kind:'ram',x:10,y:19,dir:1}],combat:{waitForMove:false,enemies:[],receivers:[],doors:[{x:200,y:8,w:8,h:152,brittle:true}]}});const r=g.foes[0];r.state='charge';st(g,'',50);say(g.ents.find(e=>e.type==='brittle').open,'a ram\'s charge breaks cracked masonry');}
}

console.log('Part IV: tempting wrong strategies fail');
const pogoMoth=(r)=>r.events.filter(e=>e.type==='enemy-defeat').length;
const W=[[1,'u']];   // a first input wakes a studied room
never('Moth Wing: one dash, or one moth, never reaches the ledge','fa1',[...X(range(0,40,8),range(4,20,4),['r','ru'],range(0,30,6)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']]),...X(range(0,100,8),range(6,14,4),['r','ru'],range(0,20,4),range(0,30,6),['r','ru']).map(([w,j,d,k,m,e])=>[...W,[w,''],[4,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[3,'ds'],[4,'r'],[m,'r'],[5,e+'x'],[200,'r']])],r=>r.exited&&pogoMoth(r)<2);
never('Belly Up: the ledge is out of reach from the floor','fa2',X(range(0,240,12),range(4,14,2),['u','ru'],range(0,14,2)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[60,'r']]),r=>r.deaths===0&&r.g.p.onGround&&r.g.p.y<=77&&!r.events.some(e=>e.type==='enemy-hit'||e.type==='enemy-pogo'));
never('Up the Shaft: no way out without an aimed parry','fa3',X(range(20,60,4),range(0,300,12),['p','s','us']).map(([w,b,k])=>[[w,'l'],[b,''],[1,k],[40,''],[12,'j'],[5,'ux'],[200,'gu']]),r=>r.exited);
never('Stand Your Ground: dodging the charge leaves the ram dazed in the wrong place','fa5',[...X(range(0,200,12),range(4,14,2),['u','ru'],range(0,14,4)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[60,'r']]),...X(range(0,120,8),range(0,200,16),range(4,14,4),['u','ru']).map(([b,w,j,d])=>[[100,'r'],[b,''],[14,'j'],[30,''],[w,'l'],[j,'lj'],[5,d+'x'],[60,'r']])],r=>r.deaths===0&&r.g.p.onGround&&r.g.p.y<=77);
never('Shieldbreaker: no blade reaches the guard across the pit','fc1',X(range(0,60,4),range(4,16,2),['l','lu'],range(0,20,4)).map(([w,j,d,k])=>[[w,'l'],[j,'lj'],[k,'l'],[5,d+'x'],[3,'ls'],[60,'']]),r=>r.g.combat.enemies[0].dead);
never('Shieldbreaker: shots sent straight home never open the door','fc1',range(0,160,4).map(b=>[...W,[b,''],[1,'p'],[160,''],[1,'p'],[200,''],[1,'lp'],[200,''],[1,'lp'],[100,''],[200,'r']]),r=>r.exited);
never('Knock It Over: no crossing without dealing with the shellback','fc2',X(range(0,60,8),range(4,16,2),['r','ru'],range(0,20,4)).map(([w,j,d,k])=>[...W,[w,''],[2,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[30,''],[4,'r'],[12,'rj'],[6,'r'],[5,'rux'],[150,'r']]),r=>r.exited&&r.deaths===0&&!r.events.some(e=>e.type==='enemy-hit'||e.type==='enemy-pogo'));
never('Moth and Coil: one dash never crosses the thorns','fc3',X(range(0,60,6),range(4,20,2),['r','ru'],range(0,30,3)).map(([w,j,d,k])=>[...W,[w,''],[4,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[40,'r']]),r=>r.g.p.onGround&&r.g.p.x>=224&&r.deaths===0);
never('Shell Road: the long perch is out of reach without the first shellback','fb1',X(range(0,120,12),range(4,16,2),['r','ru'],range(0,30,6)).map(([w,j,d,k])=>[[w,''],[2,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[40,'r']]),r=>r.deaths===0&&r.g.p.onGround&&r.g.p.x>=192&&r.g.p.y===125&&!r.events.some(e=>e.type==='enemy-pogo'||e.type==='enemy-hit'));
never('Second Wind: no crossing to the platform without a parry','fb3',X(range(0,40,4),range(4,16,4),['r','ru'],range(0,24,4),['','rs','us','s'],[0,6]).map(([w,j,d,k,s,m])=>[...W,[w,''],[2,'r'],[j,'rj'],[5,d+'x'],[k,'r'],...(s?[[1,s]]:[]),[m,'r'],[5,'rx'],[40,'r']]),r=>r.deaths===0&&r.g.p.onGround&&r.g.p.x>=150&&!ev(r,'parry'));
never('Second Wind: no crossing from the platform on one dash','fb3',X(range(0,40,4),range(4,16,4),['r','ru'],range(0,24,4)).map(([w,j,d,k])=>[...Rooms.tapes.fb3.slice(0,10),[w,''],[2,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']]),r=>r.exited&&r.events.filter(e=>e.type==='parry').length<2);
never('Stepping Ram: the moth is out of reach without the dazed ram','fb4',X(range(0,200,12),range(4,14,2),['u','ru','lu'],range(0,14,4),range(0,20,8),['u','ru']).map(([w,j,d,k,m,e])=>[[w,'r'],[j,'rj'],[k,''],[5,d+'x'],[m,''],[1,'ds'],[4,''],[5,e+'x'],[60,'r']]),r=>r.deaths===0&&r.g.p.onGround&&r.g.p.y<=45);
never('Hunting Ground: parrying the charge leaves the husk standing','fb5',X(range(0,40,4),range(0,120,12),['u','ur','']).map(([b,w,a])=>[[0,'r'],[b,''],[1,'p'],[30,''],[w,'r'],[1,a+'p'],[8,a],[40,''],[200,'r']]),r=>r.exited);
never('Hunting Ground: sending a bolt home first loses the only way to the stone','fb5',X(range(0,80,8),range(0,60,6)).map(([w,b])=>[[0,'r'],[19,''],[12,'j'],[30,''],[w,'r'],[b,''],[1,'p'],[20,''],[40,'r'],[1,'up'],[200,'']]),r=>ev(r,'gate-open'));
never('Wardens\' Hall: the gallery is out of reach without the parried ram','fd1',X(range(0,200,8),range(4,14,2),['u','ru'],range(0,14,2),['','ds']).map(([w,j,d,k,s])=>[[w,'r'],[j,'rj'],[k,'r'],...(s?[[1,s]]:[]),[5,d+'x'],[40,'r']]),r=>r.g.p.onGround&&r.g.p.y<=77&&r.deaths===0&&!ev(r,'parry'));
never('Bank Shot: one dash never reaches the far ledge','fd2',X(range(0,80,4),range(4,16,4),['r','ru','rd'],range(0,24,4)).map(([w,j,d,k])=>[...W,[w,''],[2,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']]),r=>r.exited);
never('Bank Shot: no parry from the ledges reaches the stone','fd2',X(range(0,160,2),['urp','up','rp','p','ulp']).map(([b,a])=>[...W,[b,''],[1,a],[40,'']]),r=>r.events.some(e=>e.type==='stone-lit'));
never('Bank Shot: the stone lit by hand leaves no way on','fd2',X(range(40,160,4),[8,12],['r','ru'],range(0,30,3),['ru','u']).map(([w,j,d,k,e])=>[...W,[w,''],[2,'r'],[j,'rj'],[5,d+'x'],[k,'r'],[1,'rp'],[4,'r'],[5,e+'x'],[200,'r']]),r=>r.exited&&r.events.some(e=>e.type==='stone-lit'&&!e.cut));

// ---------------------------------------------------------------- Part V (7.252): portals
console.log('Part V: portal rules');
{
 const trace=(id,tape)=>{const g=Core.createGame(Rooms.all,{room:idx(id)});const log=[];for(const k of expand(tape)){Core.step(g,keysToInput(k));log.push({p:{...g.p},ev:g.events.map(e=>({...e})),portals:g.portals&&{blue:g.portals.blue&&{...g.portals.blue},orange:g.portals.orange&&{...g.portals.orange}},next:g.portalNext});g.events.length=0;}return {g,log};};
 // A shot snaps to a two-tile slot on the face it hits.
 const a=trace('pw4',[[0,'l'],[1,'lq'],[1,'']]);const b0=a.g.portals.blue;
 say(b0&&b0.c===2&&b0.r===8&&b0.face==='r','a shot snaps to the two-tile slot on the face it hits (post at c2 r8, right face)');
 // Two-portal rooms alternate blue, orange, blue; the pip shows the next.
 const t3=Rooms.tapes.pw3,rel=trace('pw3',t3);const opens=rel.log.flatMap(l=>l.ev.filter(e=>e.type==='portal-open').map(e=>e.color));
 say(opens.join(',')==='blue,orange,blue','two-portal shots alternate blue, orange, blue ('+opens.join(',')+')');
 // Bolts through a portal become the knight's and cross barrier lines; both coils light.
 const passes=rel.log.flatMap(l=>l.ev.filter(e=>e.type==='portal-pass'&&e.kind==='bolt'));
 const litIds=rel.log.flatMap(l=>l.ev.filter(e=>e.type==='receiver-lit').map(e=>e.id));
 say(passes.length>=2&&litIds.includes('high')&&litIds.includes('low'),'a bolt through a portal is the knight\'s: two relayed bolts light both coils behind the barrier');
 // Crossing a barrier line closes the knight's ends.
 const closeAt=rel.log.findIndex(l=>l.ev.some(e=>e.type==='portal-close'));
 say(closeAt>0&&!rel.log[closeAt].portals.blue&&!rel.log[closeAt].portals.orange,'crossing a barrier line closes both of the knight\'s ends');
 // A dash keeps dashing through a portal (pw4: into the post, up out of the island).
 const d4=trace('pw4',Rooms.tapes.pw4);const pi=d4.log.findIndex(l=>l.ev.some(e=>e.type==='portal-pass'&&e.kind==='knight'));
 say(pi>0&&d4.log[pi].p.state==='dash'&&d4.log[pi].p.vy<-200,'a dash keeps dashing through a portal, turned by the faces (right-to-left into a post, up out of a floor)');
 // A floor portal remembers the fall; the loop builds toward the fling limit.
 const lp=trace('pw1',Rooms.tapes.pw1);const fast=Math.max(...lp.log.map(l=>Math.abs(l.p.vy)));
 say(fast>=400&&fast<=Core.K.flingMaxFall+1,`falling through a floor portal into a roof portal builds speed to the fling limit (${Math.round(fast)} px/s, cap ${Core.K.flingMaxFall})`);
 const fl=lp.log.some(l=>l.p.fling&&Math.abs(l.p.vx)>Core.K.maxRun+50);say(fl,'out of a portal the knight is flung: speed above a run is kept in the air');
}
console.log('Part V and Momentum: tempting wrong strategies fail');
never('Where You Stand: no way into the alcove without a portal','pv0',X(range(0,300,20),range(4,16,4),['u','ru'],[0,60,120]).map(([w,j,d,c])=>[[w,'r'],[j,'rj'],[5,d+'x'],[c,'rgu'],[100,'r']]),r=>r.exited);
never('Speedy Thing: no crossing without the fall into the portal','pv1',X(range(0,30,4),range(4,16,4),['r','ru','rd'],range(0,20,4)).map(([w,j,d,k])=>[[w,'r'],[10,'rj'],[150,'rgu'],[6,'r'],[10,''],[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']]),r=>r.exited);
never('Speedy Thing: a short fall into the portal does not carry you across','pv1',X(range(0,40,2),[0,6,12]).map(([w,j])=>[[4,'l'],[1,'dq'],[1,''],[w,'l'],...(j?[[j,'lj']]:[]),[200,'r']]),r=>r.exited);
never('Dash Goes Vertical: walking into the portal is too slow','pv2',X(range(0,60,4),range(0,40,8),['ru','u'],range(0,30,6)).map(([w,h,d,k])=>[[36,'r'],[1,'ruq'],[1,''],[w,'r'],[h,'r'],[10,'rj'],[40,'r'],[k,''],[5,d+'x'],[200,'r']]),r=>{const pi=r.events.findIndex(x=>x.type==='portal-pass');return r.exited&&!r.events.slice(0,pi).some(e=>e.type==='dash');});
never('Special Delivery: standing on the plate yourself does not hold the door','pv3',X(range(0,40,8),[6,10,14],['u','']).map(([w,j,d])=>[[0,'r'],[1,'rq'],[1,''],[80,'r'],[20,''],[j,'j'],...(d?[[5,d+'x']]:[]),[300,'r']]),r=>r.exited);
never('Catch and Move: into the nook first leaves the coil dark','pv4',X(range(0,40,4),range(0,200,20)).map(([w,b])=>[[1,'u'],[w,'l'],[1,'lq'],[1,''],[80,'l'],[b,''],[300,'r']]),r=>r.exited);
never('Both Ends: no way over the thorned wall without portals','pw0',X(range(0,160,12),range(4,16,4),['ru','u','r'],[0,80,160]).map(([w,j,d,c])=>[[w,'r'],[j,'rj'],[5,d+'x'],[c,'rgu'],[200,'r']]),r=>r.exited);
never('Loop and Let Go: a super, a hyper or a jump-dash crosses the pit but the gate stays shut (Isaac\'s skip)','pw1',[...X(range(0,30,3),range(2,12,1),[0,10,20]).flatMap(([w,k,m])=>[[[w,'r'],[1,'rx'],[k,'r'],[12,'rj'],[m,'r'],[200,'r']],[[w,'r'],[1,'rdx'],[k,'rd'],[12,'rj'],[m,'r'],[200,'r']]]),...X(range(0,40,4),range(4,16,4),['r','ru','u'],['','us']).map(([w,j,d,s])=>[[w,'r'],[j,'rj'],[8,'r'],[5,d+'x'],...(s?[[1,s]]:[]),[200,'r']])],r=>r.exited);
never('Loop and Let Go: one drop without the loop falls short','pw1',[...X(range(8,20,2),range(0,30,3)).map(([w,h])=>[[w,'r'],[1,'lq'],[1,''],[h,''],[1,'dq'],[20,''],[200,'r']]),...X(range(0,40,8),range(4,16,4),['r','ru'],range(0,16,4)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']])],r=>r.exited);
never('Stone Through Stone: no way to the shelf without the stone sent through','pw2',[...X(range(0,240,16),range(4,16,4),['u','ru'],[0,60,120]).map(([w,j,d,c])=>[[w,'r'],[j,'rj'],[5,d+'x'],[c,'rgu'],[100,'r']]),...X(range(0,240,16),range(4,16,4),['u','ru']).map(([w,j,d])=>[[0,'r'],[5,'rx'],[60,''],[w,'r'],[j,'rj'],[5,d+'x'],[40,'r'],[10,'rj'],[5,'rux'],[100,'r']])],r=>r.exited);
{const pre=[[17,'r'],[1,'luq'],[1,''],[0,'r'],[12,'rj'],[20,'r'],[6,''],[1,'rq'],[1,'']];
 never('Stone Through Stone: the knight through the portals, without the stone, never reaches the shelf','pw2',X([0,8],range(0,60,6),range(0,30,6),['u','ru','r'],['x','']).map(([b,w,k,d,x])=>[...pre,[b,'l'],[12,'lj'],[w,'l'],[8,'r'],[k,'r'],[5,d+x],[20,'r'],[10,'rj'],[5,'rux'],[200,'r']]),r=>r.exited);}
never('Bolt Relay: no coil lights by blade or parry, and the door holds','pw3',[...X(range(200,300,8),['s','us','rs'],[0,8,14]).map(([w,a,j])=>[[w,'r'],...(j?[[j,'rj']]:[]),[1,a],[10,''],[1,'s'],[20,''],[1,'us'],[20,''],[200,'r']]),...X(range(0,240,12),['ru','u','r','rd'],['','ux'],[60,170,280]).map(([w,d,x,k])=>[[w,'r'],[k,''],[14,'j'],...(x?[[5,x]]:[]),[1,d+'p'],[80,''],[300,'r']])],r=>r.exited||r.g.combat.receivers.some(c=>c.lit));
never('Bolt Relay: one delivery end lights one coil only','pw3',[['luq'],['lq']].map(([e])=>[[44,'r'],[1,'ruq'],[1,''],[0,'l'],[16,'l'],[1,e],[1,''],[500,''],[300,'r']]),r=>r.exited);
{const post=[[0,'l'],[1,'lq'],[1,'']],isl=[[18,'r'],[1,'rdq'],[1,'']];
 never('Thinking with Portals: island first, post second — the mid-air shot moves the wrong end','pw4',X(range(0,12,2),range(0,40,8),['ru','u','r']).map(([a,b,d])=>[...isl,[0,'l'],[1,'lq'],[1,''],[32,'l'],[5,'lx'],[11,''],[a,''],[1,'rdq'],[1,''],[b,''],[10,'r'],[5,d+'x'],[200,'r']]),r=>r.exited&&r.deaths===0);
 never('Thinking with Portals: walking into the post is too low for the mid-air shot','pw4',X(range(40,70,6),range(0,40,4),range(0,60,12),['ru','u']).map(([w,a,b,d])=>[...post,...isl,[w,'l'],[a,''],[1,'rdq'],[1,''],[b,''],[10,'r'],[5,d+'x'],[200,'r']]),r=>r.exited&&r.deaths===0);
 never('Thinking with Portals: without the mid-air shot the ledge is out of reach','pw4',X(range(0,40,2),['ru','r','u'],range(0,20,4)).map(([a,d,k])=>[...post,...isl,[32,'l'],[5,'lx'],[11,''],[a,'r'],[5,d+'x'],[k,'r'],[200,'r']]),r=>r.exited&&r.deaths===0);
 never('Thinking with Portals: linking the islands from a jump off the ledge fails','pw4',X(range(0,24,4),['r','rd','d'],range(0,20,4),['ru','u','r','']).map(([k,d,e,f])=>[...post,...isl,[4,'r'],[14,'rj'],[k,'r'],[1,'rdq'],[1,''],[e,'r'],[5,d+'x'],[40,''],...(f?[[5,f+'x']]:[]),[200,'r']]),r=>r.exited&&r.deaths===0);}
// Momentum (X1–X5)
never('X2 Two Flips: a jump and dash never makes the far landing','xm2',X(range(0,20,2),range(4,16,2),['r','ru'],range(0,16,4)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[40,'']]),r=>r.g.p.onGround&&r.g.p.x>=140&&r.g.p.x<=190&&r.deaths===0);
{const pre=Rooms.tapes.xm2.slice(0,5);
 never('X2 Two Flips: from the landing, a super or a jump-dash never reaches the exit (a hyper does)','xm2',[...X(range(0,20,4),range(2,12,1),range(0,40,8)).map(([w,k,m])=>[...pre,[20,''],[w,'r'],[1,'rx'],[k,'r'],[12,'rj'],[m,'r'],[200,'r']]),...X(range(0,20,4),range(4,16,2),range(0,16,4)).map(([w,j,k])=>[...pre,[20,''],[w,'r'],[j,'rj'],[k,'r'],[5,'rx'],[200,'r']])],r=>r.exited);}
never('X3 Pod in the Arc: without a super the pod never carries you','xm3',X(range(0,20,4),range(4,16,4),['r','ru'],range(0,20,4),range(0,20,8),['r','ru']).map(([w,j,d,k,m,e])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[m,'r'],[3,'ds'],[4,'r'],[5,e+'x'],[120,'r']]),r=>r.exited&&!ev(r,'super'));
never('X3 Pod in the Arc: a super alone falls short','xm3',X([0,6,12],range(2,12,1),[0,10,20]).map(([w,k,m])=>[[w,'r'],[1,'rx'],[k,'r'],[12,'rj'],[m,'r'],[120,'r']]),r=>r.exited);
never('X4 Clear the Lane: nothing gets through while the stone blocks the lane','xm4',[...X(range(0,40,4),range(2,12,1),[0,10,20]).flatMap(([w,k,m])=>[[[w,'r'],[1,'rx'],[k,'r'],[12,'rj'],[m,'r'],[200,'r']],[[w,'r'],[1,'rdx'],[k,'rd'],[12,'rj'],[m,'r'],[200,'r']]]),...X(range(0,40,4),range(2,14,2),range(0,14,2)).map(([w,j,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,'rx'],[200,'r']])],r=>r.exited&&!ev(r,'stone-hit'));
{const pre=Rooms.tapes.xm5,toRunway=pre.slice(0,10),toLedge=pre.slice(0,15);
 never('X5 Both at the End: a hyper from the runway, or a jump-dash, never makes the raised ledge','xm5',[...X(range(0,30,2),range(2,12,1),[0,10,20]).map(([w,k,m])=>[...toRunway,[w,'r'],[1,'rdx'],[k,'rd'],[12,'rj'],[m,'r'],[40,'']]),...X(range(0,30,4),range(4,16,2),['r','ru'],range(0,16,4)).map(([w,j,d,k])=>[...toRunway,[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[40,'']])],r=>r.g.p.onGround&&r.g.p.y===37&&r.g.p.x>=160&&r.deaths===0);
 never('X5 Both at the End: a super, or a jump-dash, under the roof never makes the door','xm5',[...X(range(0,30,2),range(2,12,1),[0,10,20]).map(([w,k,m])=>[...toLedge,[w,'r'],[1,'rx'],[k,'r'],[12,'rj'],[m,'r'],[120,'r']]),...X(range(0,30,4),range(4,16,2),['r','ru'],range(0,16,4)).map(([w,j,d,k])=>[...toLedge,[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[120,'r']])],r=>r.exited);}

// ---------------------------------------------------------------- Part VI (7.253): portals and everything before
console.log('Part VI: tempting wrong strategies fail');
{const tp=id=>Rooms.tapes[id];
 never('Spring Loaded: no crossing without the spring and the portal','vi0',[...X(range(0,120,8),range(4,16,4),['r','ru','u'],range(0,16,8)).map(([w,j,d,k])=>[[w,'r'],[j,'rj'],[k,'r'],[5,d+'x'],[200,'r']]),...X(range(0,30,4),range(0,40,4),['r','ru','u']).map(([w,k,d])=>[[w,'r'],[k,'r'],[5,d+'x'],[200,'r']]),...X(range(0,30,4),range(0,30,6),['r','ru']).map(([w,k,d])=>[[12,'r'],[1,'uq'],[1,''],[0,'l'],[w,'l'],[12,'j'],[k,''],[5,d+'x'],[200,'r']])],r=>r.exited);
 {const d1=[[0,'r'],[5,'rx'],[10,'']],shots=[[16,'l'],[1,'luq'],[1,''],[0,'l'],[1,'lq'],[1,'']];
  never('Behind the Cyan: a shot before any dash stops at the cyan','vi1',X(range(0,120,8),['r','l']).map(([w,d])=>[[w,d],[1,'luq'],[1,''],[0,'l'],[1,'lq'],[1,''],[40,'l'],[5,'rx'],[300,'r']]),r=>r.exited);
  never('Behind the Cyan: two dashes on the ground bring the cyan back in front of the stone','vi1',X(range(0,30,6),range(0,120,16),range(0,12,6)).map(([a,w,k])=>[...d1,[a,'r'],[5,'lx'],[20,''],[w,'r'],[1,'luq'],[1,''],[0,'l'],[1,'lq'],[1,''],[40,'l'],[k,'r'],[5,'rx'],[300,'r']]),r=>r.exited);
  never('Behind the Cyan: without a dash in flight there is no bridge','vi1',X(range(30,46,1),range(0,40,8)).map(([w,k])=>[...d1,...shots,[w,'l'],[k,'r'],[12,'rj'],[300,'r']]),r=>r.exited);
  never('Behind the Cyan: no climbing or jumping to the bridge','vi1',X(range(0,240,16),range(4,16,4),['u','ru','lu'],[0,60,120],['rgu','lgu']).map(([w,j,d,c,h])=>[[w,h[0]],[j,h[0]+'j'],[5,d+'x'],[c,h],[200,'r']]),r=>r.exited);}
 {const plate=r=>r.events.some(e=>e.type==='held-open')&&!r.events.some(e=>e.type==='bell');
  never('Bell from Afar: without the bell the lantern never reaches the plate','vi2',[...X(range(0,20,4),[10,14],range(0,16,8),['rg','dg','g'],['ru','u','r']).map(([a,j,k,t,e])=>[[1,'u'],[20,'r'],[5,'rx'],[10,''],[14,'l'],[1,'g'],[2,''],[a,'r'],[j,'rj'],[k,'r'],[10,''],[1,t],[2,''],[5,e+'x'],[10,'r'],[1,'g'],[4,''],[j,'rj'],[k,'r'],[30,''],[200,'r']]),...X(range(0,120,8),['r','l'],[0,10,14]).map(([w,d,j])=>[[1,'u'],[34,'r'],[1,'g'],[2,''],[w,d],...(j?[[j,d+'j']]:[]),[1,'rg'],[30,''],[10,'rj'],[5,'rux'],[20,'r'],[10,'rj'],[5,'rux'],[200,'r']])],plate);
  never('Bell from Afar: climbing without the lantern leaves the door shut','vi2',X(range(0,120,12),['ru','u']).map(([w,d])=>[[1,'u'],[w,'r'],[12,'rj'],[5,d+'x'],[10,'r'],[12,'rj'],[5,d+'x'],[10,'r'],[12,'rj'],[5,d+'x'],[200,'r']]),r=>r.exited);}
 never('Parry Through: no parry reaches the sealed stone without the portals','vi3',X(range(0,200,8),['u','lu','ru','l','r',''],range(0,110,10)).map(([w,d,t])=>[[w,w%16?'l':'r'],[t,''],[1,d+'p'],[200,'']]),r=>r.events.some(e=>e.type==='stone-lit'));
 never('Parry Through: with the portals but no parry, no bolt gets there','vi3',range(0,400,8).map(w=>[...tp('vi3').slice(0,6),[w,''],[14,'j'],[400,'']]),r=>r.events.some(e=>e.type==='stone-lit'));
 {const T=tp('vi4'),shots=T.slice(0,7),took=T.slice(0,T.findIndex((s,i)=>i>7&&s[1]==='g')+2),crossed=r=>r.deaths===0&&r.g.p.x>=272&&r.g.p.y<=85;
  never('Lantern Flight: without the lantern the fling falls into the pit','vi4',X(range(0,80,8),range(0,40,8),range(0,40,8),['r','ru']).map(([w,a,b,d])=>[...shots,[w,'r'],[a,''],[b,'r'],[5,d+'x'],[200,'r']]),r=>crossed(r)||r.exited);
  never('Lantern Flight: one pass with the lantern is too slow','vi4',X(range(0,80,4),range(0,60,12)).map(([w,f])=>[...took,[w,'r'],[f,'l'],[300,'r']]),r=>crossed(r)&&r.events.filter(e=>e.type==='portal-pass'&&e.kind==='knight').length<=2);
  never('Lantern Flight: a thrown lantern never reaches the plate','vi4',X(range(0,80,4),['r','l'],[0,14]).map(([w,d,j])=>[...took,[w,d],...(j?[[j,d+'j']]:[]),[1,'rg'],[200,''],[300,'r']]),r=>r.events.some(e=>e.type==='held-open'));}
 {const T=tp('vi5'),toFar=T.slice(0,10);
  never('Tally Tour: the high ledge is out of reach from the floor','vi5',X(range(0,200,12),['u','ru','lu'],[10,14],[0,40,80]).map(([w,d,j,c])=>[...toFar,[w,'r'],[j,'rj'],[5,d+'x'],[c,'rgu'],[100,'r']]),r=>r.deaths===0&&r.g.p.onGround&&r.g.p.y<=45);
  never('Tally Tour: the upward stone alone leaves the gate shut','vi5',X(range(0,40,1),['ru','u']).map(([k,d])=>[[11,'r'],[1,'uq'],[1,''],[1,'dq'],[4,''],[k,''],[1,'rdq'],[42,''],[5,d+'x'],[300,'r']]),r=>r.exited);}
 {const T=tp('vi6');
  never('Moth Flight: no moth, no crossing, whenever you let go and dash','vi6',X(range(0,60,2),range(0,60,2),['r','ru']).map(([k,a,d])=>[...T.slice(0,5),[k,''],[1,'lq'],[a,''],[5,d+'x'],[200,'r']]),r=>r.exited);
  never('Moth Flight: no crossing without the loop','vi6',X(range(0,30,2),range(0,40,4)).map(([k,a])=>[[8,'r'],[1,'uq'],[1,''],[1,'dq'],[k,''],[1,'lq'],[a,''],[1,'ds'],[20,''],[1,'ds'],[10,''],[5,'rx'],[200,'r']]),r=>r.exited);}
 never('Hold the Door: off the plate the door shuts before you reach it','vi7',X(range(0,30,4),[0,10,14],['r','ru'],range(0,20,8)).map(([w,j,d,k])=>[[w,'l'],[4,''],[40,'r'],...(j?[[j,'rj']]:[]),[k,'r'],[5,d+'x'],[300,'r']]),r=>r.deaths===0&&r.g.p.x>=168);
 never('Hold the Door: a shut door stops the shot','vi7',X(range(0,120,8),['r','ru']).map(([w,d])=>[[w,'r'],[1,d+'q'],[1,''],[1,'lq'],[1,''],[300,'l']]),r=>r.deaths===0&&r.g.p.x>=168);
 {const inArena=tp('vi8').slice(0,7);
  never('Ram Breach: a parried charge stops dead and breaks nothing','vi8',X(['l','r'],range(0,60,8),range(0,120,4)).map(([d,w,a])=>[...inArena,[w,d],[a,''],[1,d==='r'?'lp':'rp'],[30,''],[300,'r']]),r=>r.events.some(e=>e.type==='breach'));
  never('Ram Breach: the blade does not break cracked masonry','vi8',X(range(0,80,8),['rs','s','us','ds']).map(([w,s])=>[...inArena,[w,'r'],[1,s],[10,''],[1,s],[40,'']]),r=>r.events.some(e=>e.type==='breach'));}
 {const T=tp('vi9'),loop=T.slice(0,14);
  never('Everything Before: no moth, no ledge','vi9',X(range(0,60,1),range(0,50,2),['r','ru']).map(([k,a,d])=>[...loop,[k,''],[1,'lq'],[a,''],[5,d+'x'],[200,'r']]),r=>r.exited);
  never('Everything Before: a shut door stops the first shot','vi9',X(range(0,4,1),['l','lu']).map(([w,d])=>[[1,'l'],[w,''],[1,d+'q'],[1,''],[1,'rq'],[1,''],[40,'r'],[300,'l']]),r=>r.deaths===0&&r.g.p.x<240);
  never('Everything Before: without the loop the flight falls short','vi9',X(range(0,40,2),range(0,40,4)).map(([k,a])=>[...T.slice(0,8),[k,''],[1,'lq'],[a,''],[1,'ds'],[20,''],[5,'rux'],[200,'r']]),r=>r.exited);}
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
