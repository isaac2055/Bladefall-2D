/* Editor-only native scene cache and device guides. No gameplay steps or campaign state swaps. */
(function(root){
'use strict';
function create(onReady=()=>{}){
 let key=null,game=null,error=null,closed=false;const frames=new Map();
 function surface(mode){
  if(mode==='ascend'&&root.BladefallPrecisionView?.drawWorkshop)return root;
  if(frames.has(mode))return frames.get(mode).ready?frames.get(mode).frame.contentWindow:null;
  if(!root.document)return null;
  const frame=root.document.createElement('iframe'),entry={frame,ready:false};frame.hidden=true;frame.title=mode+' editor artwork';frames.set(mode,entry);
  frame.onload=()=>{if(closed)return;entry.ready=true;onReady();};frame.onerror=()=>{error='Could not load native '+mode+' artwork.';onReady();};
  frame.src=(mode==='ascend'?'precision.html?pitch=climb&':'index.html?')+'workshopSource=1';root.document.body.append(frame);return null;
 }
 function native(ctx,doc,area){
  const w=surface(doc.mode);if(!w)return false;
  const next=doc.mode+':'+doc.id+':'+doc.revision;
  if(next!==key){key=next;game=null;error=null;try{
   if(doc.mode==='ascend')game=w.BladefallPrecisionCore.createGame([root.BladefallWorkshopAscend.compile(doc.definition)]);
   else{const runtime=w.BladefallWorkshopExploreRuntime;if(!runtime?.drawWorkshop)throw Error('Explore artwork is not ready.');runtime.start(doc.definition);runtime.pause();game=runtime;}
  }catch(e){error=e.message;}}
  if(!game)return false;
  try{if(doc.mode==='ascend')w.BladefallPrecisionView.drawWorkshop(ctx,game,area);else game.drawWorkshop(ctx,area);return true;}catch(e){error=e.message;return false;}
 }
 function close(){closed=true;for(const {frame}of frames.values())frame.remove();frames.clear();game=null;}
 return {native,close,error:()=>error};
}
function guides(ctx,doc,objects,{zoom,selected}){
 const number=v=>Number.isFinite(v)?v:0;
 const linked=objects.filter(o=>selected.has(o.id));
 const point=o=>({x:o.x+o.w/2,y:o.y+o.h/2});
 function line(a,b,color){ctx.strokeStyle=color;ctx.lineWidth=1.5/zoom;ctx.setLineDash([5/zoom,4/zoom]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=color;ctx.fillRect(b.x-3/zoom,b.y-3/zoom,6/zoom,6/zoom);}
 for(const o of linked){
  const p=o.data,a=point(o);
  if(doc.mode==='ascend'&&p.glyph==='Z'){const travel=Array.isArray(p.settings)?p.settings:[0,-4],[dx,dy]=[number(travel[0]),number(travel[1])];line(a,{x:a.x+dx*8,y:a.y+dy*8},'#e8c46a');ctx.strokeStyle='#e8c46a';ctx.strokeRect(o.x+dx*8,o.y+dy*8,o.w,o.h);}
  if(doc.mode==='explore'){
   const nodes=doc.definition.graph.nodes,move=p.move?.$ref?nodes[p.move.$ref]?.props:p.move;
   if(move){const center={x:a.x+(Number.isFinite(p.x0)?p.x0-p.x:0),y:a.y-(Number.isFinite(p.y0)?p.y0-(p.y||0):0)},dx=number(move.dx),dy=number(move.dy);
    if(move.mode==='orbit'){ctx.strokeStyle='#e8c46a';ctx.lineWidth=1.5/zoom;ctx.beginPath();ctx.ellipse(center.x,center.y,Math.abs(Number.isFinite(move.rx)?move.rx:dx),Math.abs(Number.isFinite(move.ry)?move.ry:dy),0,0,Math.PI*2);ctx.stroke();}
    else if(dx||dy)line({x:center.x-dx,y:center.y+dy},{x:center.x+dx,y:center.y-dy},'#e8c46a');
   }
   const circuit=p.type==='door'?p.circuit:['plate','lever'].includes(p.type)?p.id:null;
   if(circuit)for(const other of objects){if(other.id===o.id)continue;const q=other.data;if(q.type==='door'&&q.circuit===circuit||['plate','lever'].includes(q.type)&&q.id===circuit)line(a,point(other),'#9ee3c2');}
   if(p.type==='lportal'&&p.pg)for(const other of objects)if(other.id!==o.id&&other.data.type==='lportal'&&other.data.pg===p.pg)line(a,point(other),'#d3a6ff');
  }
 }
}
root.BladefallWorkshopRender={create,guides};
})(globalThis);
