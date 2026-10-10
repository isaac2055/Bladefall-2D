// A temporary, visible approach beside a phase roof. It changes grid cells only:
// dash phase, tallies, lanterns, the phase roof and the launch footing stay native.
// Restore each recorded cell from Core.parseRoom(closedDef).grid at the fire so
// directional spikes regain their exact collision type as well as their artwork.
export function entranceDrop(def,dc=28){
 const C=def.cols||40,R=def.rows||23,g=Array.from({length:R},(_,r)=>(def.map[r]||'').padEnd(C,'.').split(''));
 let sp=null;for(let r=0;r<R;r++){const c=g[r].indexOf('P');if(c>=0){sp={c,r};break;}}
 if(!sp||dc<1||dc+1>=C-1||dc>=sp.c||sp.r+1>=R)return null;
 const seam=[...(def.seam||[])],remember=(c,r,ch)=>{if(!seam.some(x=>x[0]===c&&x[1]===r))seam.push([c,r,g[r][c]]);g[r][c]=ch;};
 for(const c of [dc,dc+1])for(let r=0;r<sp.r;r++){
  const ch=g[r][c];
  // Never cut a phase block (an entity), a gate, or another solid puzzle object.
  if('#%v^<>'.includes(ch))remember(c,r,'.');
  else if(ch!=='.'&&ch!=='l')return null;
 }
 for(let c=dc;c<sp.c;c++)if(g[sp.r+1][c]==='.')remember(c,sp.r+1,'=');
 return {...def,map:g.map(r=>r.join('')),seam,entryBridge:true,closeWhilePlayed:true};
}
