extends RefCounted
## Fixed and moving hook rings. All rope constraints use double-precision scalars.
static func point(e):
 var u=float(posmod(int(e.clock+e.phase),int(e.period)))/e.period
 var k=u*2 if u<.5 else 2-u*2
 var ease=k*k*(3-2*k)
 return {"x":e.ox+e.dx*ease,"y":e.oy+e.dy*ease}
static func mount(e,r):
 r.x=e.x+e.remX+e.w/2.0-4
 r.y=e.y+e.remY+e.h+2
static func reset(g):
 for i in range(g.room.def.get("movingHooks",[]).size()):
  var d=g.room.def.movingHooks[i]
  var id="moving-hook:"+str(d.get("id",i))
  var e={"type":"hookCarrier","dev":true,"solid":true,"id":id,"label":str(d.get("id",i)),"x":d.c*8,"y":d.r*8,"w":d.get("w",2)*8,"h":d.get("h",1)*8,"ox":d.c*8,"oy":d.r*8,"dx":d.to[0]*8,"dy":d.to[1]*8,"period":d.get("period",240),"phase":d.get("phase",0),"clock":0,"remX":0,"remY":0,"vx":0,"vy":0,"stepX":0,"stepY":0,"blocked":false}
  var q=point(e)
  e.x=g.js_round(q.x)
  e.y=g.js_round(q.y)
  e.remX=q.x-e.x
  e.remY=q.y-e.y
  var ring={"type":"ring","dev":true,"movingHook":true,"carrierId":id,"id":id+":ring","w":8,"h":8}
  mount(e,ring)
  g.ents.append(e)
  g.ents.append(ring)
 for r in range(int(g.room.rows)):
  for c in range(int(g.room.cols)):
   if AscendRoomLoader.glyph(g.room.def,c,r)=="O": g.ents.append({"type":"ring","dev":true,"x":c*8,"y":r*8,"w":8,"h":8,"id":"rg"+str(g.ents.size())})
static func clear(g,x0,y0,x1,y1):
 var n=ceil(sqrt(pow(x1-x0,2)+pow(y1-y0,2))/3)
 for i in range(1,int(n)):
  if g.solid(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1): return false
 return true
static func release(g,why):
 var p=g.p
 if p.hook!=null and p.hook.ring.get("movingHook",false):
  g.emit_event("moving-unhook")
  p.liftTimer=0
 p.lastRing=p.hook.ring if p.hook!=null else null
 p.hook=null
 p.state="normal"
 p.coast=true
 p.fling=false
 p.maxFall=max(p.maxFall,g.K.maxFall)
 g.emit_event("unhook")
static func move_carrier(g,e,delta,vertical):
 var key="remY" if vertical else "remX"
 var total=e[key]+delta
 var n=g.js_round(total)
 var s=sign(n)
 e[key]=0
 for i in range(int(abs(n))):
  if g.solid(e.x+(0 if vertical else s),e.y+(s if vertical else 0),e.w,e.h,g.ents.find(e)):
   e.blocked=true
   return
  g.move_solid(e,0 if vertical else s,s if vertical else 0)
  if vertical: e.remY=0
  else: e.remX=0
 e[key]=total-n
static func before(g,inp):
 var p=g.p
 for e in g.ents:
  if e.type!="hookCarrier": continue
  var r=g.ents.filter(func(q):return str(q.id)==e.id+":ring")[0]
  var old_x=e.x+e.remX
  var old_y=e.y+e.remY
  var was_blocked=e.blocked
  var rider=g.riding(e) and p.state not in ["dead","respawn"]
  e.blocked=false
  if g.awake: e.clock+=1
  var q=point(e)
  move_carrier(g,e,q.x-(e.x+e.remX),false)
  move_carrier(g,e,q.y-(e.y+e.remY),true)
  if e.blocked and g.awake: e.clock-=1
  e.stepX=e.x+e.remX-old_x
  e.stepY=e.y+e.remY-old_y
  e.vx=e.stepX/g.DT
  e.vy=e.stepY/g.DT
  mount(e,r)
  if rider:
   p.liftX=e.vx
   p.liftY=e.vy
   p.liftTimer=g.K.liftGraceFrames
  if e.blocked and not was_blocked: g.emit_event("moving-carrier-stop")
  if g.awake and fmod(e.clock+e.phase,e.period/2.0)==0: g.emit_event("moving-hook-turn")
  if p.hook!=null and p.hook.ring==r:
   if sqrt(e.stepX*e.stepX+e.stepY*e.stepY)>8:
    release(g,"anchor-discontinuity")
    g.emit_event("moving-hook-blocked")
    continue
   if p.hook.has("carrierVX"):
    p.vx+=e.vx-p.hook.carrierVX
    p.vy+=e.vy-p.hook.carrierVY
   p.hook.carrierVX=e.vx
   p.hook.carrierVY=e.vy
   p.liftTimer=0
 if p.state in ["dead","respawn"]:
  p.hook=null
  return
 if p.state=="hook":
  if g.buf.dash>0 and p.dashes>0: release(g,"dash")
  elif g.buf.jump>0:
   g.buf.jump=0
   release(g,"jump")
   p.vy=min(p.vy,0)-90
   g.emit_event("jump")
  elif not inp.grab: release(g,"let-go")
  return
 if g.buf.grab>0: p.lastRing=null
 if inp.grab and p.state=="normal" and not p.onGround and p.carrying==null and not g.solid(p.x+p.facing*2,p.y,p.w,p.h-3):
  var best=null
  var distance=57.0
  for e in g.ents:
   if e.type!="ring" or e==p.lastRing: continue
   var d=sqrt(pow(e.x-p.x,2)+pow(e.y-p.y,2))
   if d<distance and clear(g,p.x+4,p.y+4,e.x+4,e.y+4):
    distance=d
    best=e
  if best!=null:
   g.buf.grab=0
   g.buf.jump=0
   g.buf.dash=0
   p.hook={"ring":best,"len":max(12,distance)}
   p.state="hook"
   p.varJump=0
   p.autoJump=false
   p.fling=false
   p.coast=false
   g.emit_event("hook")
static func forces(g,inp):
 var p=g.p
 if p.state!="hook" or p.hook==null: return
 var h=p.hook
 var moving=h.ring.get("movingHook",false)
 var carrier=null
 if moving:
  var found=g.ents.filter(func(e):return str(e.id)==h.ring.carrierId)
  if found.is_empty():
   release(g,"missing-carrier")
   return
  carrier=found[0]
  if not h.has("carrierVX"):
   h.carrierVX=carrier.vx
   h.carrierVY=carrier.vy
   p.liftTimer=0
   g.emit_event("moving-hook")
 if inp.my<0: h.len=max(12,h.len-70*g.DT)
 elif inp.my>0: h.len=min(80,h.len+70*g.DT)
 var vx=p.vx-(carrier.vx if moving else 0)
 var vy=p.vy-(carrier.vy if moving else 0)+900*g.DT
 var dx=p.x+4-(h.ring.x+4-(carrier.stepX if moving else 0))
 var dy=p.y+4-(h.ring.y+4-(carrier.stepY if moving else 0))
 var d=sqrt(dx*dx+dy*dy)
 if d==0: d=1
 var ux=dx/d
 var uy=dy/d
 if d<h.len and not inp.my>0: h.len=max(min(h.len,32),d)
 if inp.mx!=0: vx+=inp.mx*260*g.DT*abs(uy)
 var out=vx*ux+vy*uy
 if d>=h.len-.01 and out>0:
  vx-=out*ux
  vy-=out*uy
 var nx=dx+vx*g.DT
 var ny=dy+vy*g.DT
 var nd=sqrt(nx*nx+ny*ny)
 if nd>h.len:
  var k=h.len/nd
  vx=(nx*k-dx)/g.DT
  vy=(ny*k-dy)/g.DT
 p.vx=vx+(carrier.vx if moving else 0)
 p.vy=vy+(carrier.vy if moving else 0)
 if p.vx!=0: p.facing=sign(p.vx)
static func after(g):
 var p=g.p
 if p.state!="hook" or p.hook==null or not p.hook.ring.get("movingHook",false): return
 var h=p.hook
 var rx=h.ring.x+4
 var ry=h.ring.y+4
 var dx=p.x+4-rx
 var dy=p.y+4-ry
 var d=sqrt(dx*dx+dy*dy)
 var n=ceil(d/2)
 for i in range(1,int(n)):
  if g.solid(rx+dx*i/n,ry+dy*i/n,1,1):
   release(g,"rope-obstructed")
   g.emit_event("moving-hook-blocked")
   return
 if d>h.len+4:
  release(g,"body-obstructed")
  g.emit_event("moving-hook-blocked")
