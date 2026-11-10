extends RefCounted
## Core save points (bladefall-pcore-dev-core-checkpoints.js): opt-in, in one continuous room.
## Terrain resets after death; the earned save point survives and becomes the respawn.
static func reset(g):
 var points=g.room.def.get("coreCheckpoints",[])
 if points.is_empty():
  g.core_run=null
  return
 if g.core_run==null or g.core_run.room!=g.room.id: g.core_run={"room":g.room.id,"index":-1}
 var index=int(g.core_run.index)
 if index>=0 and index<points.size():
  var q=points[index]
  g.p.x=q.c*8
  g.p.y=q.r*8+8-g.p.h
  g.p.facing=q.get("facing",1) if q.get("facing",1)!=0 else 1
static func after(g):
 var points=g.room.def.get("coreCheckpoints",[])
 var p=g.p
 if points.is_empty() or g.core_run==null or g.flipped or p.state in ["dead","respawn"] or not p.onGround: return
 for i in range(points.size()):
  var q=points[i]
  var half=float(q.get("width",40))/2.0
  if i>int(g.core_run.index) and abs(p.y+p.h-(q.r+1)*8)<1 and p.x+p.w>q.c*8-half and p.x<q.c*8+half:
   g.core_run.index=i
   if q.get("resetClocks",true)!=false:
    if g.resin_wind!=null: g.resin_wind.t=0
    if g.root_lash!=null: g.root_lash.t=0
   g.emit_event("core-checkpoint")
