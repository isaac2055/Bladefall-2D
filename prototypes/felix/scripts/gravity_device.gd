extends RefCounted
## Gravity keeps one upright map and a mirrored simulation copy, as in the browser core.
static func reset(g):
 g.flipped=false
 g.upright_room=g.room
 for b in g.device_groups("Q"):
  g.ents.append({"type":"prism","dev":true,"x":b.x,"y":b.y,"w":b.w,"h":b.h,"id":"pr"+str(g.ents.size()),"armed":true})
static func input(g,raw):
 if g.flipped:
  var up=raw.get("u",false)
  raw.u=raw.get("d",false)
  raw.d=up
 return raw
static func mirror_body(e,height):
 if e.has("y") and e.has("h"): e.y=height-e.y-e.h
 if e.has("oy") and e.has("h"): e.oy=height-e.oy-e.h
 if e.has("ty") and e.has("h"): e.ty=height-e.ty-e.h
 if e.has("homeY"): e.homeY=height-e.homeY-e.h
 for key in ["vy","remY","dirY"]:
  if e.has(key): e[key]=-e[key]
 if e.get("type")=="deck" and e.has("dy"): e.dy=-e.dy
static func mirror(g):
 var height=g.room.h
 if g.flipped: g.room=g.upright_room
 else:
  g.upright_room=g.room
  g.room=g.room.duplicate(true)
  for r in range(int(g.room.rows)):
   for c in range(int(g.room.cols)):
    var t=g.upright_room.grid[(int(g.room.rows)-1-r)*int(g.room.cols)+c]
    g.room.grid[r*int(g.room.cols)+c]=4 if t==3 else (3 if t==4 else t)
  g.room.exit="down" if g.room.exit=="up" else ("up" if g.room.exit=="down" else g.room.exit)
 for e in g.ents: mirror_body(e,height)
 for f in g.foes if g.foes!=null else []:
  f.y0=height-f.y0-f.h
  f.path=[f.path[0],-f.path[1]]
  mirror_body(f,height)
 if g.portals!=null:
  for key in ["blue","orange"]:
   var pt=g.portals[key]
   if pt==null: continue
   if pt.face in ["u","d"]:
    pt.r=g.room.rows-1-pt.r
    pt.face="d" if pt.face=="u" else "u"
   else: pt.r=g.room.rows-2-pt.r
  g.PortalDevices.refresh(g)
 var p=g.p
 p.y=height-p.y-p.h
 p.vy=-p.vy
 p.remY=-p.remY
 p.varJumpSpeed=-p.get("varJumpSpeed",0)
 if p.varJump>0:
  p.varJump=0
  p.autoJump=false
 for key in ["dashDir","beforeDash","pressAim","parryAim","strikeDir"]:
  if p.has(key):
   p[key]=p[key].duplicate()
   p[key].y=-p[key].y
 if p.get("airPeakY")!=null: p.airPeakY=height-p.airPeakY-p.h
 p.liftY=-p.liftY
 p.onGround=false
 p.wasGround=false
 p.jumpGrace=0
 if p.carrying!=null:
  p.carrying.x=p.x
  p.carrying.y=p.y-8
 for e in g.ents:
  if e.type=="zipline":
   e.ay=height-e.ay
   e.by=height-e.by
  elif e.type=="recoilPlatform": e.axis=-e.axis
  elif e.type=="hingeArm":
   e.pivotY=height-e.pivotY-8
   if e.dir in ["up","down"]: e.dir="down" if e.dir=="up" else "up"
   e.state=e.dir
   e.merge(g.Causeway.pose(e,e.dir),true)
 if p.get("ride")!=null:
  p.ride.fy=height-p.ride.fy
  p.ride.ty=height-p.ride.ty
  p.ride.dy=-p.ride.dy
 if g.void_travel!=null:
  g.void_travel.vy=-g.void_travel.vy
  g.void_travel.ry=-g.void_travel.ry
 g.flipped=not g.flipped
 if g.portals!=null: g.PortalDevices.refresh(g)
static func before(g):
 if g.p.state in ["dead","respawn"]: return
 for e in g.ents:
  if e.type!="prism": continue
  var inside=g.overlap(g.p,e)
  if not inside:
   e.armed=true
   continue
  if e.armed and g.p.state=="dash" and not g.p.dashAim:
   e.armed=false
   mirror(g)
   g.emit_event("gravity")
