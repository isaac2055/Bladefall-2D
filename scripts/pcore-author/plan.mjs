// Generic clean-route planner: beam search with a human action set, then compression.
import {beam,ACT,compress} from '../pcore-search.mjs';
export const H={
 walk:[[[8,'r']],[[8,'l']],[[4,'r']],[[4,'l']],[[8,'']]],
 jump:[[[14,'rj']],[[14,'lj']],[[14,'j']],[[8,'rj']],[[8,'lj']]],
 climb:[[[20,'rgu']],[[20,'lgu']],[[10,'rgu']],[[10,'lgu']]],
 dash:['r','l','u','d','ru','lu','rd','ld'].map(d=>[[5,d+'x']]),
 strike:[[[1,'rs']],[[1,'ls']],[[1,'ds']],[[1,'us']]],
 parry:[[[1,'p']],[[1,'rp']],[[1,'lp']],[[1,'up']]],
 portal:['r','l','u','d','ru','lu','rd','ld'].map(d=>[[1,d+'q'],[1,'']]),
};
export function plan(id,{sets=['walk','jump'],extra=[],score,key,beam:B=1500,depth=150,goal=g=>g.exited,start=[],reject}={}){
 const actions=[...sets.flatMap(s=>H[s]),...extra];
 const r=beam(id,{actions,key,goal,score,beam:B,maxDepth:depth,start,reject});
 return r?compress(r.tape):null;
}
