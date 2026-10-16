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
`;
export const script=(label,body)=>({label,script:HELPERS+body});
