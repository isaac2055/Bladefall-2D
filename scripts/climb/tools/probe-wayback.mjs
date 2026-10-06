// node probe-wayback.mjs WORLD QUESTID : play the branch's last room, then each way-back piece's #through tape, with a trail
import {launchChrome} from '../../../tests/launch-chrome.mjs';
const W=+process.argv[2],Q=process.argv[3];
const b=await launchChrome({headless:true,args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:720});
await p.goto('http://localhost:8371/precision.html?pitch=climb&world='+W,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g,{timeout:120000});
await p.evaluate(()=>{const w=BladefallPitchView.climb.state().world,need=(w?.quests||[]).map(q=>q.needs).filter(Boolean);localStorage.setItem('bladefall.rbr.v1',JSON.stringify({keepsakes:Object.fromEntries(need.map(k=>[k,true]))}));});
const r=await p.evaluate((Q)=>{
 const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view,st=BladefallPitchView.climb.state(),w=st.world,CL=BladefallClimb;v.paused=false;
 const fr=t=>{const o=[];for(const [m,k] of t||[])for(let i=0;i<m;i++)o.push(k);return o;};
 const go=id=>{const i=R.chapters[st.chapter].rooms.findIndex(r=>r.id===id);V.goRoom(R.chapters.slice(0,st.chapter).reduce((n,c)=>n+c.rooms.length,0)+i);for(let i=0;i<12;i++)V.advance(['']);};
 const br=[...w.quests,...w.secrets].find(q=>q.id===Q),real=br.sections.filter(s=>!s.passage),pass=br.sections.filter(s=>s.passage);
 const trail=[];const log=(tag)=>trail.push(tag+':'+v.g.room.id.replace(/^cl\d+-/,'')+'@'+Math.round(v.g.p.x/8)+','+Math.round(v.g.p.y/8));
 const play=key=>{const from=v.g.room.id,f=fr(R.tapes[key]);if(!f.length)trail.push('NO TAPE '+key);for(let i=0;i<f.length+40;i++){V.advance([f[i]||'']);if(i%15===0)log(i);if(v.g.room.id!==from)break;}log('end');return v.g.room.id;};
 st.branchVia='door';go(real.at(-1).room);V.advance(['']);V.retryRoom();play(real.at(-1).room);
 // when a piece's own route does not carry on, try plain climbing a player would use (grab the shaft wall and climb,
 // then step out toward the piece's exit), from a saved state, and keep the first that reaches the next piece
 const SNAP=()=>JSON.parse(JSON.stringify({room:v.g.room.id}));
 const tries=d=>{const side=d==='left'?'l':'r';return [[[40,side+'gu'],[30,side]],[[50,'gu'],[10,side+'j'],[30,side]],[[5,'ux'],[40,side+'gu'],[30,side]],[[30,'lgu'],[30,'rgu'],[12,side+'j'],[30,side]],[[60,'rgu'],[12,'lj'],[30,'l']],[[60,'lgu'],[12,'rj'],[30,'r']]];};
 for(const [i,s] of pass.entries()){trail.push('| piece '+s.room.replace(/^cl\d+-/,'')+' (in '+v.g.room.id.replace(/^cl\d+-/,'')+')');
  const want=i+1<pass.length?pass[i+1].room:br.returnTo;const save=BladefallClimb&&V.snapshot?V.snapshot():null;
  play(s.room+'#through');
  if(v.g.room.id!==want&&v.g.room.id!==s.room){trail.push('(fell back to '+v.g.room.id.replace(/^cl\d+-/,'')+')');}
  if(v.g.room.id!==want){const d=CL.def(w,s.room).exit;let ok=false;
   for(const t of tries(d)){if(v.g.room.id===want)break;const f=fr(t);for(let k=0;k<f.length;k++){V.advance([f[k]]);if(v.g.room.id===want){ok=true;break;}}if(ok){trail.push('(climbed on by hand: '+JSON.stringify(t)+')');break;}}
   if(!ok)trail.push('(STUCK)');}
 }
 return {pieces:pass.map(s=>s.room),returnTo:br.returnTo,end:v.g.room.id,deaths:v.chapterStats.deaths,trail:trail.join(' ')};},Q);
console.log(JSON.stringify(r,null,1));
await p.screenshot({path:decodeURIComponent(new URL('./wayback-end.png',import.meta.url).pathname)});await b.close();
