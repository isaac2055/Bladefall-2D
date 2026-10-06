// Authoring driver follows the deliberately laid-out route, in either direction.
export function walkPassage(Core,def,direction=1){
 const d=def.atlasTransit,g=Core.createGame([def]);g.dropThru=true;g.springUp=true;
 g.p.x=direction===1?32:g.room.w-40;g.p.y=d.floor[Math.floor(g.p.x/8)]*8-11;
 const route=direction===1?d.route:[...d.route].reverse(),steps=route.map(p=>({x:p.c*8+4,y:p.r*8,ground:p.ground})),recorded=[];
 let i=0,hold=0,aim=0,aimDir=0,lastJump=-100,lastDash=-100;
 for(let f=0;f<12000&&i<steps.length;f++){
  const t=steps[i],p=g.p,dx=t.x-(p.x+4),dy=p.y+p.h-t.y;
  if(Math.abs(dx)<9&&dy<=2&&dy>=-(t.ground?20:2)&&p.onGround){i++;continue;}
  const inp={l:dx<-3,r:dx>3};
  if(p.onGround&&f-lastJump>24&&(dy>2||Core.solidAt(g,p.x+(dx<0?-3:9),p.y,2,11)||Math.abs(dx)>32&&!Core.solidAt(g,p.x+(dx<0?-16:16),p.y+p.h+1,8,8))){hold=19;lastJump=f;}
  inp.jump=hold-->0;
  if(!aim&&!p.onGround&&p.vy>0&&dy>1&&Math.abs(dx)<90&&p.dashes>0&&f-lastDash>25){inp.dash=true;aim=14;aimDir=Math.abs(dx)>30?Math.sign(dx):0;lastDash=f;}
  if(aim>0){aim--;inp.u=true;inp.l=aimDir<0;inp.r=aimDir>0;}
  // One-way catwalks may be descended intentionally on the return journey.
  if(p.onGround&&dy<-3&&Math.abs(dx)<25&&f-lastJump>24){inp.d=true;inp.jump=true;lastJump=f;}
  recorded.push((inp.l?'l':'')+(inp.r?'r':'')+(inp.u?'u':'')+(inp.d?'d':'')+(inp.jump?'j':'')+(inp.dash?'x':''));Core.step(g,inp);g.events.length=0;
 }
 return {g,recorded,complete:i===steps.length,index:i,target:steps[i]};
}
