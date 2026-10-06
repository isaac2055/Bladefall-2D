/* Precision Core portals — drawing (7.252). Portal stone is pale and panelled, so the surfaces that take
   a portal read at a glance; barrier lines shimmer; each open end is a coloured oval on its face, bright
   when linked and hollow when waiting for its partner. A faint sight line shows where a shot fired now
   would land — a bracket in the next colour if it would open, a small cross if not. */
(function(root){
'use strict';
const TILE=8,COLS=40,ROWS=23;
const COL={blue:'#6fb6ff',blueD:'#2c5d9c',orange:'#ffae52',orangeD:'#a35a17',stone:'#d9dde2',stoneL:'#f4f6f8',stoneD:'#aab2bc',grill:'#9fe7ff'};
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
function drawStone(b,g){
 const room=g.room;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  if(!room.portalable[r*COLS+c])continue;const x=c*TILE,y=r*TILE;
  px(b,x,y,8,8,COL.stone);px(b,x,y,8,1,COL.stoneL);px(b,x,y,1,8,COL.stoneL);px(b,x+7,y,1,8,COL.stoneD);px(b,x,y+7,8,1,COL.stoneD);
  px(b,x+3,y+3,2,2,COL.stoneD);
 }
}
function drawGrill(b,g,t){
 const room=g.room;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  if(!room.grill[r*COLS+c])continue;const x=c*TILE,y=r*TILE;
  b.globalAlpha=.35+.25*Math.sin((t+r*7+c*3)/6);px(b,x+3,y,2,8,COL.grill);b.globalAlpha=1;
  if(((t>>2)+r)%3===0)px(b,x+3,y+((t+c*5)%8),2,1,'#ffffff');
 }
}
function drawPortal(b,pt,linked,t){
 const P=root.BladefallPrecisionPortals,bx=P.boxOf(pt),col=COL[pt.color],dark=COL[pt.color+'D'];
 const horiz=pt.face==='u'||pt.face==='d';
 // The oval sits on the face, in the open air in front of the stone.
 let x,y,w,h;
 if(pt.face==='u'){x=bx.x;y=bx.y-3;w=16;h=4;}else if(pt.face==='d'){x=bx.x;y=bx.y+7;w=16;h=4;}
 else if(pt.face==='l'){x=bx.x-3;y=bx.y;w=4;h=16;}else{x=bx.x+7;y=bx.y;w=4;h=16;}
 px(b,x,y,w,h,dark);
 if(linked){const s=(t>>2)&3;if(horiz)px(b,x+2+s*3,y+1,3,2,col);else px(b,x+1,y+2+s*3,2,3,col);}
 if(horiz){px(b,x+1,y,w-2,1,col);px(b,x+1,y+h-1,w-2,1,col);px(b,x,y+1,1,h-2,col);px(b,x+w-1,y+1,1,h-2,col);}
 else{px(b,x,y+1,1,h-2,col);px(b,x+w-1,y+1,1,h-2,col);px(b,x+1,y,w-2,1,col);px(b,x+1,y+h-1,w-2,1,col);}
 if(pt.fixed){px(b,horiz?x+7:x+1,horiz?y+1:y+7,2,2,'#ffffff');}   // a fixed end wears a white rivet
}
function drawPreview(b,g,t){
 const P=root.BladefallPrecisionPortals,p=g.p;if(p.state==='dead'||p.carrying)return;
 const k=g.prev||{},dx=(k.r?1:0)-(k.l?1:0),dy=(k.d?1:0)-(k.u?1:0);
 const pv=P.preview(g,dx,dy);if(!pv)return;
 const col=COL[pv.color];
 // Dotted sight line from the knight to the hit.
 const x0=p.x+4,y0=p.y+5,n=Math.hypot(pv.x-x0,pv.y-y0)||1;
 b.globalAlpha=.35;for(let s=6;s<n;s+=6)px(b,x0+(pv.x-x0)*s/n,y0+(pv.y-y0)*s/n,1,1,col);b.globalAlpha=1;
 if(pv.ok){const bx=pv.box,horiz=pv.pt.face==='u'||pv.pt.face==='d';b.globalAlpha=.55;
  if(horiz){const yy=pv.pt.face==='u'?bx.y-1:bx.y+8;px(b,bx.x,yy,3,1,col);px(b,bx.x+13,yy,3,1,col);}
  else{const xx=pv.pt.face==='l'?bx.x-1:bx.x+8;px(b,xx,bx.y,1,3,col);px(b,xx,bx.y+13,1,3,col);}b.globalAlpha=1;}
 else{b.globalAlpha=.45;px(b,pv.x-1,pv.y-1,1,1,'#ff8a8a');px(b,pv.x+1,pv.y+1,1,1,'#ff8a8a');px(b,pv.x+1,pv.y-1,1,1,'#ff8a8a');px(b,pv.x-1,pv.y+1,1,1,'#ff8a8a');b.globalAlpha=1;}
}
function draw(b,g,view){
 const room=g.room;if(!room.portalable)return;
 if(room._stone===undefined)room._stone=room.portalable.some(v=>v)||room.grill.some(v=>v);
 if(!room._stone&&!g.portals)return;
 const t=g.roomFrame;
 drawStone(b,g);drawGrill(b,g,t);
 if(!g.portals)return;
 const linked=!!(g.portals.blue&&g.portals.orange);
 for(const k of ['blue','orange'])if(g.portals[k])drawPortal(b,g.portals[k],linked,t);
 drawPreview(b,g,t);
 // Two-portal rooms: a pip over the knight in the colour the next shot will open.
 if(g.room.def.portalMode==='two'&&g.p.state!=='dead')px(b,g.p.x+3,g.p.y-4,2,2,COL[g.portalNext]);
}
root.BladefallPrecisionPortalsView=Object.freeze({draw});
})(typeof window!=='undefined'?window:globalThis);
