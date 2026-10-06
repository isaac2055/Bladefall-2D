/* Precision Core — Room by Room · Ruined Keep, drawing (7.259): the keystone and the book box.
   In the Ruined Keep's rooms (room.def.rbr === 6) the core's lantern is drawn over as the keep's keystone: a pale
   wedge of dressed stone, wider at the top, with a gold mason's seam; a room with crate:true draws it instead as
   the Archivist's book box. Device views draw after the entities, so this covers the lantern's sprite exactly
   (its 8×8 body and the hanger above it). Landing knocks a little masonry dust loose. Drawing only. */
(function(root){
'use strict';
const px=(b,x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);};
const isKeep=g=>!!(g&&g.room&&g.room.def&&g.room.def.rbr===6);
function keystone(b,x,y,t){
 // Under-paint the lantern's body and hanger in the stone's shadow colour, then the wedge itself.
 px(b,x,y,8,8,'#3e3a52');
 px(b,x,y-1,8,2,'#cfc8e0');            // the wide top face
 px(b,x,y+1,8,2,'#b3abc9');
 px(b,x+1,y+3,6,3,'#a39bbb');
 px(b,x+2,y+6,4,2,'#8f87a8');           // narrowing to the bottom
 px(b,x,y+3,1,3,'#3e3a52');px(b,x+7,y+3,1,3,'#3e3a52');px(b,x,y+6,2,2,'#3e3a52');px(b,x+6,y+6,2,2,'#3e3a52');
 px(b,x+3,y,2,7,'#e9c47a');             // the mason's seam
 px(b,x+3,y+2,2,1,'#fff0c0');
 if((t>>4)%6===0)px(b,x+1,y-1,1,1,'#ffffff');
}
function crate(b,x,y){
 px(b,x,y-1,8,9,'#5a3e26');
 px(b,x,y-1,8,1,'#8a6440');
 const spines=['#7a2a2a','#2e4a6a','#6a5a2a','#3a5a3a'];
 for(let i=0;i<4;i++)px(b,x+1+i*1.5,y+1,1,5,spines[i]);
 px(b,x+6,y+1,1,5,'#bca4db');
 px(b,x,y+6,8,1,'#3a2818');
}
function draw(b,g){
 if(!isKeep(g))return;
 const def=g.room.def,t=g.frame;
 for(const e of g.ents){
  if(e.type!=='lantern')continue;
  if(e.returning)b.globalAlpha=.4*(e.timer/40);
  const x=Math.round(e.x),y=Math.round(e.y);
  if(def.crate)crate(b,x,y);else keystone(b,x,y,t);
  b.globalAlpha=1;
 }
}
function event(e,{view}){
 if(e.type!=='lantern-land'||!isKeep(view&&view.g))return;
 for(let i=0;i<5;i++)view.parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*50,vy:-Math.random()*25,life:16,max:16,col:'#b3abc9',grav:160,size:1});
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-keep',draw,event});
})(typeof window!=='undefined'?window:globalThis);
