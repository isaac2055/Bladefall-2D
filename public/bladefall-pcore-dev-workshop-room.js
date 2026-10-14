/* Campaign connections end an isolated workshop test; room-local machinery stays native. */
(function(root){'use strict';
const C=()=>root.BladefallPrecisionCore,active=g=>!!(g.workshop||g.players),alive=p=>p.state!=='dead'&&p.state!=='respawn';
function ports(g){const d=g.room.def;return [...(d.atlasSockets||[]).filter(s=>!s.preview),...(d.doors||[]).map(s=>({...s,edge:s.edge||'up'}))];}
function fits(s,x,y,w,h){return s.edge==='left'||s.edge==='right'?y>=s.floor*8-Math.max(32,(s.height||0)*8)&&y+h<=s.floor*8+1:Array.isArray(s.cols)&&x+w>s.cols[0]*8&&x<(s.cols[s.cols.length-1]+1)*8;}
function open(g,edge,x,y,w,h){return active(g)&&ports(g).some(s=>s.edge===edge&&fits(s,x,y,w,h));}
function exited(g,p){if(!active(g))return false;return ports(g).some(s=>fits(s,p.x,p.y,p.w,p.h)&&(s.edge==='left'?p.x<= (s.plane??0)-p.w+2:s.edge==='right'?p.x>=(s.plane??g.room.w)-2:s.edge==='up'?p.y<=-3:s.edge==='down'?p.y>=g.room.h-2:false));}
function reset(g){if(active(g)&&g.room.def.seam?.length){const opened=C().parseRoom(g.room.def);for(const [c,r]of g.room.def.seam){const i=r*g.room.cols+c;g.room.grid[i]=opened.grid[i];g.room.portalable[i]=opened.portalable[i];}}g.workshopRoom={closed:false};}
function before(g){if(!active(g))return;const spec=g.room.def.atlasTransit?.lift;if(!spec)return;
 let lift=g.ents.find(e=>e.type==='climb-lift');if(!lift){lift={type:'climb-lift',id:'workshop-lift',dev:true,solid:true,presses:true,x:spec.x,y:spec.bottom,w:spec.w,h:5,remX:0,remY:0,state:'idle',timer:0};g.ents.push(lift);}
 if(spec.lockedByWinch&&!g.ents.some(e=>e.type==='stone'&&e.lit))return;
 if(lift.state==='idle'&&C().riderOf(g,lift)){lift.state='up';lift.timer=0;}
 else if(lift.state==='up'){C().moveSolid(g,lift,0,Math.max(-1.25,spec.top-lift.y));if(lift.y<=spec.top){lift.state='wait';lift.timer=90;}}
 else if(lift.state==='wait'){if(--lift.timer<=0)lift.state='down';}
 else if(lift.state==='down'){C().moveSolid(g,lift,0,Math.min(1.25,spec.bottom-lift.y));if(lift.y>=spec.bottom){lift.state='idle';lift.remY=0;}}
}
function settle(g){if(!active(g)||g.flipped||g.workshopRoom.closed)return;const d=g.room.def,seam=d.seam;if(!seam?.length||!(d.closeWhilePlayed||['k6-stacks','s9-wheel'].includes(d.origin)))return;
 const Core=C(),players=(g.players||[g.p]).filter(alive),sp=g.room.spawn;
 const support=g.ents.find(e=>!e.gone&&(e.solid||['zip','slide','thru'].includes(e.type)||e.thru)&&Math.abs(e.oy-(sp.y+g.p.h))<=1&&sp.x<e.ox+e.w&&sp.x+g.p.w>e.ox);
 if(!players.some(p=>{const near=Math.abs(p.x-sp.x)<=12&&(Math.abs(p.y-sp.y)<=12||support&&Core.standingOn(g,p,support))&&p.onGround,clear=!seam.some(([c,r])=>Math.abs(c*8+4-p.x-4)<20&&Math.abs(r*8+4-p.y-5)<24);return p.state==='normal'&&p.onGround&&(d.closeWhilePlayed?near:near||clear&&(p.x-sp.x)**2+(p.y-sp.y)**2<48*48);}))return;
 const map=d.map.map(r=>r.split(''));for(const [c,r,ch]of seam){if(!map[r]||c<0||c>=map[r].length)return;map[r][c]=ch;}const closed=Core.parseRoom({...d,map:map.map(r=>r.join(''))}),cols=g.room.cols;
 if(players.some(p=>seam.some(([c,r])=>closed.grid[r*cols+c]&&Core.overlap(p.x,p.y,p.w,p.h,c*8,r*8,8,8))))return;
 const original=g.room.grid,restored=original.slice();for(const [c,r]of seam)restored[r*cols+c]=closed.grid[r*cols+c];
 let safe;try{g.room.grid=restored;safe=players.every(p=>!p.onGround||Core.onGroundCheck(g,p)||support&&p.x<support.x+support.w&&p.x+p.w>support.x&&support.y>=p.y+p.h&&support.y-p.y-p.h<=48);}finally{g.room.grid=original;}if(!safe)return;
 for(const [c,r]of seam){const i=r*cols+c;g.room.grid[i]=closed.grid[i];g.room.portalable[i]=closed.portalable[i];}g.room.rev=(g.room.rev||0)+1;g.workshopRoom.closed=true;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'workshop-room',reset,before,after:g=>{if(!g.players)settle(g);},afterPlayers:settle});
root.BladefallWorkshopRoom={open,exited};
})(globalThis);
