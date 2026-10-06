/* Presentation only. Attack silhouettes, aim tells and physical links expose simulation state. */
(function(root){
'use strict';
const rect=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function line(b,x,y,xx,yy,c,dash=[]){b.strokeStyle=c;b.lineWidth=1;b.setLineDash(dash);b.beginPath();b.moveTo(Math.round(x)+.5,Math.round(y)+.5);b.lineTo(Math.round(xx)+.5,Math.round(yy)+.5);b.stroke();b.setLineDash([]);}
function draw(b,g){
 const co=g.combat;if(!co)return;
 for(const d of g.ents.filter(e=>e.type==='combatGate'||e.type==='brittle')){
  if(d.type==='brittle'){
   if(d.open){rect(b,d.x,d.y+d.h-3,d.w,3,'#675048');continue;}
   rect(b,d.x,d.y,d.w,d.h,'#493a37');
   for(let y=d.y;y<d.y+d.h;y+=8){rect(b,d.x,y,d.w,1,'#987261');line(b,d.x+3,y+1,d.x+d.w-4,y+7,'#cc9d77');}
   continue;
  }
  const links=d.ward?co.enemies.filter(e=>e.ward===d.ward):co.receivers.filter(r=>(d.coils||[]).includes(r.id));
  for(const r of links){const col=d.open?'#84e3cd':'#475c69';line(b,r.x+5,r.y+5,d.x+4,r.y+5,col,[2,3]);line(b,d.x+4,r.y+5,d.x+4,d.y+d.h,col,[2,3]);}
  rect(b,d.x-1,d.y,2,d.h,'#7c887e');rect(b,d.x+d.w-1,d.y,2,d.h,'#7c887e');
  if(!d.open){for(let x=d.x+2;x<d.x+d.w;x+=3)rect(b,x,d.y,1,d.h,'#b9c5b0');for(let y=d.y+5;y<d.y+d.h;y+=12)rect(b,d.x,y,d.w,2,'#7a8a85');}
  for(let i=0;i<links.length;i++)rect(b,d.x+i*4,d.y,3,3,(links[i].lit||links[i].dead)?'#abffe4':'#4a606c');
 }
 for(const r of co.receivers){
  rect(b,r.x-2,r.y-2,14,14,'#293b47');rect(b,r.x,r.y,10,10,r.lit?'#7fe6c8':'#657f8b');
  rect(b,r.x+2,r.y+2,6,6,'#12222c');rect(b,r.x+4,r.y+1,2,8,r.lit?'#d9fff0':'#9fb7bf');
  rect(b,r.x+1,r.y+4,8,2,r.lit?'#d9fff0':'#9fb7bf');
  if(r.lit){line(b,r.x-3,r.y+3,r.x-5,r.y+3,'#70a89b');line(b,r.x+13,r.y+6,r.x+15,r.y+6,'#70a89b');}
 }
 for(const e of co.enemies){
  const x=e.x,y=e.y,cx=x+e.w/2,cy=y+e.h/2;
  if(e.dead)continue;
  const active=e.state==='attack',tell=e.state==='tell',flash=e.flash>0;
  const edge=flash?'#ffffff':e.exposed>0?'#c4f5df':active?'#ffccaa':tell?'#f3c968':'#bba595';
  if(e.kind==='guard'){
   rect(b,x+2,y+5,8,9,'#774a55');rect(b,x+1,y+3,10,4,edge);rect(b,x+3,y,6,4,'#c8c2b2');
   rect(b,x+3,y+2,6,1,'#293444');rect(b,x+2,y+14,3,2,'#a09c90');rect(b,x+8,y+14,3,2,'#a09c90');
   if(e.exposed<=0){rect(b,e.face>0?x+9:x-1,y+5,4,8,'#9e9987');rect(b,e.face>0?x+10:x,y+7,2,3,'#536c76');}
   const end=e.face>0?x+e.w+(active?19:7):x-(active?19:7);
   line(b,cx,y+8,end,y+(tell?3:8),edge);rect(b,end-1,y+(tell?2:7),2,3,edge);
  }else if(e.kind==='wing'){
   const flap=g.frame%16<8?-3:1;
   rect(b,x-4,y+2+flap,6,3,'#82949f');rect(b,x+10,y+2+flap,6,3,'#82949f');
   rect(b,x-2,y+3+flap,5,3,edge);rect(b,x+9,y+3+flap,5,3,edge);
   rect(b,x+3,y+1,6,8,'#667582');rect(b,x+4,y,4,4,edge);rect(b,x+(e.face>0?7:3),y+2,2,2,'#f7dc94');
  }else if(e.kind==='hound'){
   rect(b,x+2,y+2,11,6,'#835258');rect(b,x+(e.face>0?11:0),y,5,6,edge);
   rect(b,x+2,y+8,3,2,edge);rect(b,x+11,y+8,3,2,edge);
   line(b,x+3,y+1,x-3,y-3,'#b89984');rect(b,x+(e.face>0?14:0),y+1,2,1,'#fff0b2');
  }else{
   rect(b,x+1,y+10,10,6,'#526269');rect(b,x+3,y+3,6,10,'#8a7767');rect(b,x+2,y,8,6,edge);
   rect(b,x+4,y+2,4,2,'#e6c47c');line(b,cx,cy,cx+(e.aimX||e.face)*10,cy+(e.aimY||0)*10,'#bbc5b4');
  }
  root.BladefallClimbArt?.combatDetail(b,g,e);
  // The committed aim remains visible throughout the tell; a bright final tick warns of release.
  if(tell){
   const len=e.kind==='guard'?27:55;
   line(b,cx,cy,cx+(e.aimX||e.face)*len,cy+(e.aimY||0)*len,e.t<8?'#ffe7b1':'#a37d55',[2,3]);
   rect(b,cx-1,y-8,2,4,'#ffda85');rect(b,cx-1,y-3,2,1,'#ffda85');
  }
  if(e.exposed>0){line(b,x-3,y-3,x+e.w+2,y-3,'#b5f6d8');}
  for(let i=0;i<e.hp;i++)rect(b,x+i*4,y-5,2,1,e.exposed>0?'#b5f6d8':'#bb8f83');
 }
 for(const s of co.shots){
  line(b,s.x+2,s.y+2,s.x+2-s.vx*.035,s.y+2-s.vy*.035,s.reflected?'#70acaa':'#906758');
  rect(b,s.x-1,s.y-1,6,6,s.reflected?'#458f92':'#a4634f');rect(b,s.x,s.y,4,4,s.reflected?'#c5fff2':'#ffe1a0');
 }
 if(g.p.parryTimer>0){
  b.strokeStyle='#d5f7e9';b.lineWidth=1;b.beginPath();b.arc(g.p.x+4,g.p.y+5,12,0,Math.PI*2);b.stroke();
  const a=g.p.parryAim;if(a?.x||a?.y)line(b,g.p.x+4,g.p.y+5,g.p.x+4+a.x*16,g.p.y+5+a.y*16,'#e9fff5');
 }
}
root.BladefallPrecisionCombatView={draw};
})(typeof window!=='undefined'?window:globalThis);
