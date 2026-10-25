extends RefCounted
## Beam cells, mirrors and shutters from bladefall-pcore-dev-beam.js.
const DIRECTIONS={"r":[1,0],"l":[-1,0],"u":[0,-1],"d":[0,1]}
static func reset(g):
 g.beams=null
 for r in range(int(g.room.rows)):
  for c in range(int(g.room.cols)):
   var ch=AscendRoomLoader.glyph(g.room.def,c,r)
   if ch in ["/","\\"]: g.ents.append({"type":"mirror","dev":true,"x":c*8,"y":r*8,"w":8,"h":8,"slant":ch,"id":"mr"+str(g.ents.size()),"timer":0})
 var groups=g.device_groups("X")
 for i in range(groups.size()):
  var b=groups[i]
  var defs=g.room.def.get("shutters",[])
  var d=defs[i] if i<defs.size() else {}
  var e={"type":"shutter","dev":true,"x":b.x,"y":b.y,"w":b.w,"h":b.h,"beat":{"open":d.get("open",60),"shut":d.get("shut",60),"offset":d.get("offset",0)},"id":"sh"+str(i)}
  e.open=shutter_open(e,0)
  g.ents.append(e)
 if g.room.def.has("beams"): g.beams={"emit":g.room.def.beams.duplicate(true),"paths":[],"clock":0,"harmless":g.room.def.get("beamsHarmless",false)}
static func shutter_open(e,clock): return posmod(int(clock+e.beat.offset),int(e.beat.open+e.beat.shut))<e.beat.open
static func before(g):
 if g.beams!=null and g.awake: g.beams.clock+=1
 var clock=g.beams.clock if g.beams!=null else g.room_frame
 for e in g.ents:
  if e.type=="shutter":
   var open=shutter_open(e,clock)
   if open!=e.open:
    e.open=open
    g.emit_event("shutter-open" if open else "shutter-shut")
  elif e.type=="mirror" and e.timer>0: e.timer-=1
static func trace(g):
 if g.beams==null: return
 var paths=[]
 var lit=[]
 var mirrors={}
 var blocking=[]
 for e in g.ents:
  if e.type=="mirror": mirrors[Vector2i(e.x/8,e.y/8)]=e
  elif e.type=="shutter" and not e.open or e.type=="lantern" and not e.get("returning",false) or e.type!="shutter" and g.solid_entity(e): blocking.append(e)
 for em in g.beams.emit:
  var c=em.c
  var r=em.r
  var dx=DIRECTIONS[em.dir][0]
  var dy=DIRECTIONS[em.dir][1]
  var sx=c*8+4
  var sy=r*8+4
  for step in range(max(400,4*int(g.room.cols+g.room.rows))):
   var nc=c+dx
   var nr=r+dy
   if nc<0 or nc>=g.room.cols or nr<0 or nr>=g.room.rows:
    c=nc
    r=nr
    paths.append([sx,sy,c*8+4,r*8+4])
    break
   if g.tile(nc,nr)==1:
    paths.append([sx,sy,nc*8+4-dx*4,nr*8+4-dy*4])
    break
   var cx=nc*8+4
   var cy=nr*8+4
   var band=g.rect(nc*8 if dx!=0 else cx-1,nr*8 if dy!=0 else cy-1,8 if dx!=0 else 2,8 if dy!=0 else 2)
   var hits=blocking.filter(func(e):return g.overlap(band,e))
   if not hits.is_empty():
    var ex=cx
    var ey=cy
    if dx>0:
     ex=INF
     for e in hits: ex=min(ex,e.x)
    elif dx<0:
     ex=-INF
     for e in hits: ex=max(ex,e.x+e.w)
    elif dy>0:
     ey=INF
     for e in hits: ey=min(ey,e.y)
    else:
     ey=-INF
     for e in hits: ey=max(ey,e.y+e.h)
    if dx!=0: ex=clamp(ex,nc*8,nc*8+8)
    if dy!=0: ey=clamp(ey,nr*8,nr*8+8)
    paths.append([sx,sy,ex-dx,ey-dy])
    break
   c=nc
   r=nr
   for e in g.ents:
    if e.type=="stone" and not e.get("lit",false) and cx>=e.x and cx<e.x+e.w and cy>=e.y and cy<e.y+e.h and e not in lit: lit.append(e)
   var m=mirrors.get(Vector2i(c,r))
   if m!=null:
    paths.append([sx,sy,cx,cy])
    sx=cx
    sy=cy
    var old_dx=dx
    dx=-dy if m.slant=="/" else dy
    dy=-old_dx if m.slant=="/" else old_dx
 g.beams.paths=paths
 for e in lit:
  e.lit=true
  g.emit_event("stone-lit")
static func after(g):
 var p=g.p
 if p.strikeTimer>0:
  for e in g.ents:
   if e.type=="mirror" and e.timer<=0 and not p.strikeHit.has(e.id) and g.overlap(g.strike_box(),g.rect(e.x-2,e.y-2,e.w+4,e.h+4)):
    p.strikeHit[e.id]=true
    e.slant="\\" if e.slant=="/" else "/"
    e.timer=12
    g.emit_event("mirror")
 if g.beams==null: return
 trace(g)
 if g.beams.harmless or p.state in ["dead","respawn"]: return
 for b in g.beams.paths:
  if g.overlap(g.rect(p.x,p.y,p.w,9),g.rect(min(b[0],b[2])-1,min(b[1],b[3])-1,abs(b[2]-b[0])+2,abs(b[3]-b[1])+2)):
   g.die()
   return
