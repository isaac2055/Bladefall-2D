// Finds a two-track route for each Ascend Together room with simple closed-loop controllers (walk to a column,
// jump, strike the bell, wait for the partner), then replays the recorded inputs as plain tapes to prove them.
//   node scripts/together/prove.mjs            prints whether each room is proven, and writes the tapes to
//                                              scripts/together/routes.json
import {writeFileSync} from 'node:fs';
import {Shared,input} from './sim.mjs';
import {rooms} from './rooms.mjs';
const T=8;
// A controller step for one knight: {to:col} walk until standing at the column; {jump:dir,hold:frames};
// {strike:'u'|''}; {wait:pred(s)}; {exit:true} walk right off the room.
function run(def,plans,limit=4000){
 const s=Shared.create(def),tapes=[[],[]],at=[0,0],timer=[0,0];let deaths=0;
 for(let f=0;f<limit&&!s.complete;f++){
  const keys=[0,1].map(i=>{const a=s.actors[i],p=a.p,plan=plans[i],st=plan[at[i]];if(!st||a.exited)return '';
   const cx=(p.x+4)/T;
   const next=()=>{at[i]++;timer[i]=0;};
   timer[i]++;
   if(st.to!=null||st.go){
    // walk (and hop) to a cell: jump at a gap or spikes ahead, or when the target is higher and near
    const tc=st.go?st.go[0]:st.to,tr=st.go?st.go[1]:null,d=tc+.5-cx,row=(p.y+p.h)/T,dir=Math.sign(d);
    const G=s.g.room,tile=(c,r)=>G.grid[r*G.cols+c]??1,solidT=t=>t===1||t===2;
    const footC=Math.floor((p.x+4+dir*7)/T),below=tile(footC,Math.round(row));
    if(Math.abs(d)<.45&&p.onGround&&(tr==null||Math.abs(row-tr)<.6)){next();return '';}
    if(p.onGround){a.hop=0;
     const gap=Math.abs(d)>1&&!solidT(below);
     const up=tr!=null&&tr<row-.5&&Math.abs(d)<(st.reach||4.5);
     const wall=dir&&solidT(tile(Math.floor((p.x+4+dir*6)/T),Math.floor(row-1)));
     if(gap||up||wall){a.hop=1;return (dir>0?'r':dir<0?'l':'')+'j';}
    }else if(a.hop&&a.hop++<14){return (Math.abs(d)<.3?'':dir>0?'r':'l')+'j';}
    if(!p.onGround&&Math.abs(d)<.3)return '';
    return dir>0?'r':dir<0?'l':'';}
   if(st.jump!=null){if(timer[i]===1&&!p.onGround){timer[i]=0;return '';}const k=(st.jump>0?'r':st.jump<0?'l':'')+(timer[i]<=(st.hold||12)?'j':'');if(timer[i]>(st.air||30)&&p.onGround){next();}return k;}
   if(st.strike!=null){if(timer[i]===1)return (st.strike||'')+'s';if(timer[i]>(st.after||16))next();return '';}
   if(st.wait){if(st.wait(s,f))next();return st.hold2||'';}
   if(st.exit)return 'r';
   return '';});
  tapes[0].push(keys[0]);tapes[1].push(keys[1]);
  s.g.events.length=0;Shared.step(s,keys.map(input));
  for(const e of s.g.events)if(e.type==='death')deaths++;
  if(deaths)return {ok:false,why:'death at frame '+f+' '+JSON.stringify(s.actors.map(a=>[Math.round(a.p.x/8),Math.round(a.p.y/8),a.p.state])),at:[...at],tapes};
 }
 return {ok:s.complete,why:s.complete?'':'not out: '+JSON.stringify({at,pos:s.actors.map(a=>[Math.round(a.p.x/8),Math.round(a.p.y/8),a.p.state,a.exited])}),tapes,frames:tapes[0].length};
}
const col=(s,i)=>(s.actors[i].p.x+4)/8, row=(s,i)=>(s.actors[i].p.y+11)/8;
const airborne=(s,i)=>!s.actors[i].p.onGround;
const PLANS=[
 // 1 · Hold the Door: 0 holds the near plate; 1 goes through and holds the far one (on the ledge); 0 comes through
 [[{to:12},{wait:s=>col(s,1)>27&&s.actors[1].p.onGround&&row(s,1)<18.5},{go:[27,18]},{go:[37,21]},{exit:true}],
  [{wait:(s,f)=>f>40},{go:[28,18]},{wait:s=>col(s,0)>26.5&&s.actors[0].p.onGround},{go:[37,21]},{exit:true}]],
 // 2 · Ring for Me: 0 rings on the left, 1 runs; then 1 rings on the right for 0
 [[{to:5},{wait:s=>airborne(s,1)&&col(s,1)>15.2&&col(s,1)<17},{strike:'u'},{wait:s=>airborne(s,1)&&col(s,1)>22.2&&col(s,1)<24},{strike:'u'},
   {wait:s=>col(s,1)>34.5&&s.actors[1].p.onGround},{go:[13,19]},{go:[20,19]},{go:[27,19]},{go:[35,19]},{exit:true}],
  [{wait:(s,f)=>f>20},{go:[13,19]},{go:[20,19]},{go:[27,19]},{go:[36,19]},
   {wait:s=>airborne(s,0)&&col(s,0)>15.2&&col(s,0)<17},{strike:'u'},{wait:s=>airborne(s,0)&&col(s,0)>22.2&&col(s,0)<24},{strike:'u'},{wait:s=>col(s,0)>34.5},{exit:true}]],
 // 3 · Two Lights: 0 holds the plate while 1 lights the inner stone; then 0 climbs the bell steps while 1 rings
 [[{to:11},{wait:s=>s.g.ents.some(e=>e.type==='stone'&&e.lit)&&col(s,1)>9.5},{go:[19,18]},{go:[22,16]},{go:[25,14]},{go:[28,12]},{go:[32,10]},
   {wait:s=>s.g.ents.filter(e=>e.type==='stone').every(e=>e.lit)},{exit:true}],
  [{wait:(s,f)=>f>30},{to:4},{to:13},{to:23},{wait:s=>airborne(s,0)&&col(s,0)>20.6},{strike:''},{wait:s=>airborne(s,0)&&col(s,0)>23.6},{strike:''},{wait:s=>airborne(s,0)&&col(s,0)>26.6},{strike:''},{wait:s=>airborne(s,0)&&col(s,0)>29.6},{strike:''},
   {wait:s=>s.g.ents.filter(e=>e.type==='stone').every(e=>e.lit)},{exit:true}]],
];
const routes={};let bad=0;
for(const [i,def] of rooms().entries()){
 const r=run(def,PLANS[i]);
 // replay the recorded inputs as plain tapes: the proof
 let proven=false;if(r.ok){const {play}=await import('./sim.mjs');proven=play(def,r.tapes).complete;}
 console.log(def.id,def.name,r.ok&&proven?'PROVEN in '+r.frames+' frames':'NOT YET · '+r.why);
 if(r.ok&&proven)routes[def.id]=r.tapes.map(t=>{const z=[];for(const k of t){const l=z.at(-1);if(l&&l[1]===k)l[0]++;else z.push([1,k]);}return z;});else bad++;
}
writeFileSync(new URL('./routes.json',import.meta.url),JSON.stringify(routes)+'\n');
process.exit(bad?1:0);
