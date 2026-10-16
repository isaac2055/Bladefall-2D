// Per-level plans for the Explore route builder (scripts/explore-routes/build.mjs): what a level needs done
// before (or on the way along) its road, which the traversal bot cannot find by itself. Steps run in order
// from the level-select start, before the bot drives the road:
//   {reach:[x,y], xr, yr}            drive to stand within xr/yr of (x, y) (the bot finds the movement)
//   {press:[[input, frames], ...]}   hold inputs (TAS button names: left right jump attack up slam pickup …)
//   {script:'…', label}              a closed-loop controller run in the page (tas = the TAS API; the helpers
//                                    below are in scope). Every frame it steps is recorded into the route; a
//                                    restoreState rewinds the recording to that save, so a script may search.
//                                    Return false (or leave the knight dead) to end the plan there.
// finish: x            the route is complete on reaching x (for a level whose way on is not a walked seam);
// finishNote: text     what the Watch says there.
// Keep a plan to what the level itself requires; the bot drives the rest.
export const HELPERS=`
const go=(x,max=3000,extra={})=>{for(let i=0;i<max&&Math.abs(G.p.x-x)>8&&!G.p.dead;i++)tas.stepFrames(1,{right:G.p.x<x,left:G.p.x>x,...(typeof extra==='function'?extra(i):extra)});return Math.abs(G.p.x-x)<=8;};
const wait=(n)=>tas.stepFrames(n,{});
const press=(input,n=1)=>tas.stepFrames(n,input);
const steer=(x)=>{const e=x-G.p.x-G.p.vx*.13;return {right:e>3,left:e<-3};};
// Fight whatever stands within r: close to striking range, face it, swing. Returns true once none is left.
const foes=(r)=>G.enemies.filter(e=>!e.dead&&!e.boss&&e.hp>0&&Math.abs(e.x-G.p.x)<r&&Math.abs((e.y||0)-(G.p.y||0))<120);
const fight=(r=260,max=900)=>{for(let i=0;i<max&&!G.p.dead;i++){const f=foes(r).sort((a,b)=>Math.abs(a.x-G.p.x)-Math.abs(b.x-G.p.x))[0];if(!f)return true;
 const d=f.x-G.p.x,far=Math.abs(d)>46;tas.stepFrames(1,{right:d>0&&(far||G.p.face<0),left:d<0&&(far||G.p.face>0),attack:!far&&i%10===0});}return !foes(r).length;};
`;
export const script=(label,body)=>({label,script:HELPERS+body});
