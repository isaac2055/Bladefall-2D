(function(root){'use strict';
// 7.280: slick rock (room field `slick`) — a pale glaze on every open face, with wind-scoured streaks, so the
// faces you cannot hold read at a glance.
function drawSlick(b,g){const s=g.slick;if(!s)return;const map=g.room.def.map,open=(c,r)=>{const ch=(map[r]||'')[c];return ch!==undefined&&ch!=='#';};
 for(let r=0;r<s.rows;r++)for(let c=0;c<s.cols;c++){if(!s.m[r*s.cols+c])continue;const x=c*8,y=r*8;
  b.fillStyle='rgba(206,232,244,.20)';b.fillRect(x,y,8,8);
  b.fillStyle='#d7eef8';
  if(open(c-1,r))b.fillRect(x,y,2,8);
  if(open(c+1,r))b.fillRect(x+6,y,2,8);
  if(open(c,r-1))b.fillRect(x,y,8,1);
  if(open(c,r+1))b.fillRect(x,y+7,8,1);
  b.fillStyle='rgba(240,250,255,.55)';const k=(c*7+r*3)%8;b.fillRect(x+k,y+((k*5)%6),1,2);b.fillRect(x+((k+4)%8),y+((k*3+3)%6),1,2);}}
function draw(b,g){drawSlick(b,g);for(const w of g.winds||[]){const z=w.breath;if(!z)continue;b.fillStyle=z.warning?'#efc76b':z.phase?'#b87996':'#9cbbcf';b.fillRect(w.x,w.y,1,w.h);b.fillRect(w.x+w.w-1,w.y,1,w.h);for(let y=w.y+12;y<w.y+w.h-5;y+=22){const x=w.x+w.w/2|0,dy=z.phase?1:-1;b.fillRect(x-1,y,2,6);b.fillRect(x-3,y+(dy>0?3:0),2,2);b.fillRect(x+1,y+(dy>0?3:0),2,2);b.fillRect(x-2,y+(dy>0?5:-2),4,2);}}}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'rbr-f-updrafts',draw});
})(typeof window!=='undefined'?window:globalThis);
