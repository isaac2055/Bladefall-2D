extends RefCounted
## The original paired portal-stone device, including orientation and fall-height momentum.
const N={"u":[0,-1],"d":[0,1],"l":[-1,0],"r":[1,0]}
static func tiles(pt):
 return [[pt.c,pt.r],[pt.c+1,pt.r]] if pt.face in ["u","d"] else [[pt.c,pt.r],[pt.c,pt.r+1]]
static func box(g,pt): return g.rect(pt.c*8,pt.r*8,16 if pt.face in ["u","d"] else 8,8 if pt.face in ["u","d"] else 16)
static func linked(g): return g.portals!=null and g.portals.blue!=null and g.portals.orange!=null
static func refresh(g):
 g.portal_holes={}
 if linked(g):
  for pt in [g.portals.blue,g.portals.orange]:
   for t in tiles(pt): g.portal_holes[Vector2i(t[0],t[1])]=true
 if g.world_context!=null: g.world_context.set_portal_holes(g,g.portal_holes)
static func reset(g):
 g.portals=null
 g.portal_holes={}
 g.portal_next="blue"
 g.portal_shots=0
 if not g.room.def.has("portalMode"): return
 g.portals={"blue":null,"orange":null}
 for d in g.room.def.get("portals",[]):
  g.portals[d.color]={"color":d.color,"c":d.c,"r":d.r,"face":d.face,"fixed":true}
 refresh(g)
 g.p.portalCool=0
static func slot_ok(g,pt):
 for t in tiles(pt):
  var c=int(t[0])
  var r=int(t[1])
  if c<0 or c>=g.room.cols or r<0 or r>=g.room.rows or AscendRoomLoader.glyph(g.room.def,c,r)!="%" or g.room.grid[r*int(g.room.cols)+c]!=1: return false
  var fc=c+N[pt.face][0]
  var fr=r+N[pt.face][1]
  if fc<0 or fc>=g.room.cols or fr<0 or fr>=g.room.rows or g.room.grid[fr*int(g.room.cols)+fc]==1: return false
 for other in g.portals.values():
  if other==null or other.color==pt.color: continue
  for t in tiles(other):
   for q in tiles(pt):
    if t[0]==q[0] and t[1]==q[1]: return false
 return true
static func fire(g,dx,dy):
 var n=sqrt(dx*dx+dy*dy)
 if n==0: n=1
 var sx=dx/n
 var sy=dy/n
 var x=g.p.x+4
 var y=g.p.y+5
 var pc=floori(x/8)
 var pr=floori(y/8)
 for i in range(420):
  x+=sx
  y+=sy
  var c=floori(x/8)
  var r=floori(y/8)
  if x<0 or y<0 or x>=g.room.w or y>=g.room.h: return {"ok":false,"x":x,"y":y}
  if AscendRoomLoader.glyph(g.room.def,c,r)=="!": return {"ok":false,"x":x,"y":y,"grill":true}
  for e in g.ents:
   if not e.get("shotThrough",false) and g.solid_entity(e) and x>=e.x and x<e.x+e.w and y>=e.y and y<e.y+e.h: return {"ok":false,"x":x,"y":y}
  if g.tile(c,r)==1:
   var face=""
   if c!=pc and r!=pr: face=("l" if sx>0 else "r") if abs(sx)>=abs(sy) else ("u" if sy>0 else "d")
   elif c!=pc: face="l" if sx>0 else "r"
   else: face="u" if sy>0 else "d"
   var horizontal=face in ["u","d"]
   var along=x/8-c if horizontal else y/8-r
   var tries=([[c-1,r],[c,r]] if along<.5 else [[c,r],[c-1,r]]) if horizontal else ([[c,r-1],[c,r]] if along<.5 else [[c,r],[c,r-1]])
   return {"ok":true,"x":x,"y":y,"face":face,"tries":tries,"c":c,"r":r}
  pc=c
  pr=r
 return {"ok":false,"x":x,"y":y}
static func place(g,dx,dy):
 var mode=g.room.def.portalMode
 var color="blue" if mode=="one" else g.portal_next
 var hit=fire(g,dx,dy)
 var pt=null
 if hit.ok:
  for t in hit.tries:
   var candidate={"color":color,"c":t[0],"r":t[1],"face":hit.face,"fixed":false}
   if slot_ok(g,candidate):
    pt=candidate
    break
 g.portal_shots+=1
 if pt==null:
  g.emit_event("portal-fizzle")
  return
 g.portals[color]=pt
 if mode=="two": g.portal_next="orange" if color=="blue" else "blue"
 refresh(g)
 g.emit_event("portal-open")
static func turn(vx,vy,in_face,out_face):
 var inward=N[in_face]
 var outward=N[out_face]
 for r in [[1,0,0,1],[0,-1,1,0],[-1,0,0,-1],[0,1,-1,0]]:
  if r[0]*-inward[0]+r[1]*-inward[1]==outward[0] and r[2]*-inward[0]+r[3]*-inward[1]==outward[1]: return {"x":r[0]*vx+r[1]*vy,"y":r[2]*vx+r[3]*vy}
 return {"x":vx,"y":vy}
static func other(g,pt): return g.portals.orange if pt.color=="blue" else g.portals.blue
static func exit_position(g,from,to,x,y,w,h):
 var fb=box(g,from)
 var tb=box(g,to)
 var fh=from.face in ["u","d"]
 var th=to.face in ["u","d"]
 var denominator=16-w if fh else 16-h
 if denominator==0: denominator=1
 var t=clamp((x-fb.x)/denominator if fh else (y-fb.y)/denominator,0,1)
 if th:
  var nx=g.js_round(tb.x+t*(16-w))
  return {"x":clamp(nx,tb.x,tb.x+16-w),"y":tb.y-h if to.face=="u" else tb.y+8}
 var ny=g.js_round(tb.y+t*(16-h))
 return {"x":tb.x-w if to.face=="l" else tb.x+8,"y":clamp(ny,tb.y,tb.y+16-h)}
static func entered(g,x,y,w,h):
 if not linked(g): return null
 for pt in [g.portals.blue,g.portals.orange]:
  if g.overlap(g.rect(x,y,w,h),box(g,pt)): return pt
 return null
static func carry(g,body,vx_key,vy_key):
 var pt=entered(g,g.js_round(body.x),g.js_round(body.y),body.w,body.h)
 if pt==null: return false
 var to=other(g,pt)
 var pos=exit_position(g,pt,to,body.x,body.y,body.w,body.h)
 var velocity=turn(body[vx_key],body[vy_key],pt.face,to.face)
 if to.face=="u" and velocity.y > -170: velocity.y=-170
 body.x=pos.x
 body.y=pos.y
 body[vx_key]=velocity.x
 body[vy_key]=velocity.y
 if body.has("remX"):
  body.remX=0
  body.remY=0
 g.emit_event("portal-pass")
 return true
static func before(g,inp):
 if g.portals==null: return
 var p=g.p
 if p.portalCool>0: p.portalCool-=1
 if g.buf.portal>0 and g.room.def.portalMode!="fixed" and p.state not in ["dead","respawn"] and p.carrying==null:
  g.buf.portal=0
  place(g,inp.mx if inp.mx!=0 or inp.my!=0 else p.facing,inp.my)
 if not linked(g): return
 for e in g.ents:
  if e.type=="lantern" and not e.get("held",false) and not e.get("returning",false): carry(g,e,"vx","vy")
  elif e.type=="slide" and e.get("moving",false):
   var body={"x":e.x,"y":e.y,"w":e.w,"h":e.h,"vx":e.dirX,"vy":e.dirY}
   if carry(g,body,"vx","vy"):
    e.x=body.x
    e.y=body.y
    e.dirX=sign(g.js_round(body.vx))
    e.dirY=sign(g.js_round(body.vy))
    e.remX=0
    e.remY=0
static func after(g):
 if g.portals==null: return
 var p=g.p
 var crossed=false
 for r in range(floori(p.y/8),floori((p.y+p.h-1)/8)+1):
  for c in range(floori(p.x/8),floori((p.x+p.w-1)/8)+1):
   if r>=0 and r<g.room.rows and c>=0 and c<g.room.cols and AscendRoomLoader.glyph(g.room.def,c,r)=="!": crossed=true
 if crossed:
  var any=false
  for key in ["blue","orange"]:
   if g.portals[key]!=null and not g.portals[key].fixed:
    g.portals[key]=null
    any=true
  if any:
   refresh(g)
   g.emit_event("portal-close")
 if not linked(g) or p.portalCool>0: return
 var pt=entered(g,p.x,p.y,p.w,p.h)
 if pt==null:
  if p.onGround or p.state=="climb" or p.get("airPeakY")==null or p.y<p.airPeakY: p.airPeakY=p.y
  return
 var to=other(g,pt)
 var pos=exit_position(g,pt,to,p.x,p.y,p.w,p.h)
 if pt.face=="u" and p.vy>0 and p.get("airPeakY")!=null:
  var height=p.y-p.airPeakY
  if height>0: p.vy=max(p.vy,min(g.K.flingMaxFall,sqrt(2*g.K.gravity*height)))
 var velocity=turn(p.vx,p.vy,pt.face,to.face)
 if to.face=="u" and velocity.y > -170: velocity.y=-170
 if p.state=="dash": p.dashDir=turn(p.dashDir.x,p.dashDir.y,pt.face,to.face)
 if p.state=="climb": p.state="normal"
 p.x=pos.x
 p.y=pos.y
 p.remX=0
 p.remY=0
 p.vx=velocity.x
 p.vy=velocity.y
 p.onGround=false
 p.portalCool=4
 p.fling=true
 if velocity.x!=0: p.facing=sign(velocity.x)
 if p.carrying!=null:
  p.carrying.x=p.x
  p.carrying.y=p.y-8
 p.airPeakY=p.y
 g.emit_event("portal-pass")
