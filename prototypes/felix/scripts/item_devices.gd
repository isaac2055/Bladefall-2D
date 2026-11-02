extends RefCounted
## Existing anvil, feather, moth and void-stone mechanics used by the first Fractured regions.
static func reset_early(g):
 g.foes=null
 g.foe_clock=0
 g.void_travel=null
 g.void_grace=0
 if g.room.def.has("foes"):
  g.foes=[]
  for i in range(g.room.def.foes.size()):
   var d=g.room.def.foes[i]
   assert(d.kind=="moth","Native Fractured foe port expects the authored moth")
   var f=d.duplicate(true)
   f.merge({"id":i,"alive":true,"t":0,"state":"idle","remX":0,"remY":0,"vx":0,"vy":0,"timer":0,"w":8,"h":8,"x0":d.x*8,"y0":d.y*8,"x":d.x*8,"y":d.y*8,"period":d.get("period",120),"path":d.get("path",[0,0]),"phase":d.get("phase",0)},true)
   g.foes.append(f)
 for r in range(int(g.room.rows)):
  for c in range(int(g.room.cols)):
   if AscendRoomLoader.glyph(g.room.def,c,r)=="N": g.ents.append({"type":"anvil","dev":true,"solid":true,"x":c*8,"y":r*8,"w":8,"h":8,"id":"an"+str(g.ents.size()),"timer":0})
 for r in range(int(g.room.rows)):
  for c in range(int(g.room.cols)):
   var ch=AscendRoomLoader.glyph(g.room.def,c,r)
   if ch=="f": g.ents.append({"type":"feather","dev":true,"x":c*8,"y":r*8,"w":8,"h":8,"id":"fe"+str(g.ents.size()),"timer":0})
static func reset_late(g):
 for d in g.room.def.get("anvilSleds",[]):
  var found=g.ents.filter(func(e):return e.type=="slide" and e.x==d.c*8 and e.y==d.r*8)
  if found.is_empty(): continue
  var s=found[0]
  g.ents.append({"type":"anvil","dev":true,"solid":true,"id":"sled-anvil-"+str(s.id),"x":s.x+d.get("offset",0)*8,"y":s.y-8,"w":8,"h":8,"timer":0,"remX":0,"remY":0})
 for b in g.device_groups("V"):
  g.ents.append({"type":"void","dev":true,"solid":true,"x":b.x,"y":b.y,"w":b.w,"h":b.h,"id":"void"+str(g.ents.size())})
static func foes_before(g):
 if g.foes==null or not g.awake: return
 g.foe_clock+=1
 for f in g.foes:
  if not f.alive: continue
  f.t+=1
  var u=float(posmod(int(g.foe_clock+f.phase),int(f.period)))/f.period
  var k=u*2 if u<.5 else 2-u*2
  f.x=g.js_round(f.x0+f.path[0]*8*k)
  f.y=g.js_round(f.y0+f.path[1]*8*k)
static func foes_after(g):
 if g.foes==null or not g.awake or g.p.state in ["dead","respawn"]: return
 var p=g.p
 if p.strikeTimer>0:
  for f in g.foes:
   var key="foe"+str(f.id)
   if not f.alive or p.strikeHit.has(key) or not g.overlap(g.strike_box(),g.rect(f.x-1,f.y-1,f.w+2,f.h+2)): continue
   p.strikeHit[key]=true
   g.blade_rebound(p.strikeDir)
   g.freeze=3
   f.alive=false
   g.emit_event("enemy-defeat")
static func before(g):
 var p=g.p
 for e in g.ents:
  if e.type!="feather": continue
  if e.timer>0:
   e.timer-=1
   if e.timer==0: g.emit_event("feather-back")
   continue
  if p.state!="dead" and p.airJumps<=0 and g.overlap(p,e) and not p.onGround:
   p.airJumps=1
   e.timer=150
   g.emit_event("feather")
 if p.onGround and p.airJumps>0:
  p.airJumps=0
  g.emit_event("feather-melt")
 follow_sled(g)
 void_before(g)
static func after(g):
 var p=g.p
 if p.strikeTimer>0:
  for e in g.ents:
   if e.type!="anvil": continue
   var key="nk"+str(e.id)
   if p.strikeHit.has(key) or not g.overlap(g.strike_box(),g.rect(e.x-2,e.y-2,e.w+4,e.h+4)): continue
   p.strikeHit[key]=true
   if p.strikeDir.y>0:
    p.vy=-330
    p.varJumpSpeed=p.vy
    p.varJump=7
    p.autoJump=true
    p.jumpGrace=0
    g.refill()
    p.stamina=g.K.climbMaxStamina
    g.freeze=3
    g.emit_event("anvil")
   else: g.emit_event("guard-block")
 follow_sled(g)
static func follow_sled(g):
 for d in g.room.def.get("anvilSleds",[]):
  var stones=g.ents.filter(func(e):return e.type=="slide" and e.ox==d.c*8 and e.oy==d.r*8)
  if stones.is_empty(): continue
  var s=stones[0]
  var anvils=g.ents.filter(func(e):return str(e.id)=="sled-anvil-"+str(s.id))
  if anvils.is_empty(): continue
  var a=anvils[0]
  var dx=s.x+d.get("offset",0)*8-a.x
  var dy=s.y-8-a.y
  if dx!=0 or dy!=0: g.move_solid(a,dx,dy)
static func dash_hit(g,e):
 if e.type!="void" or g.p.state!="dash": return false
 var p=g.p
 g.void_travel={"vx":p.dashDir.x*240,"vy":p.dashDir.y*240,"rx":0,"ry":0,"entered":false,"dashTimer":p.dashTimer}
 p.state="void"
 p.dashTimer=0
 p.vx=0
 p.vy=0
 p.remX=0
 p.remY=0
 p.ducking=false
 p.varJump=0
 g.emit_event("void-in")
 return true
static func void_before(g):
 var p=g.p
 var v=g.void_travel
 if g.void_grace>0: g.void_grace-=1
 if v==null: return
 if p.state!="void":
  g.void_travel=null
  return
 var voids=g.ents.filter(func(e):return e.type=="void")
 g.buf.strike=0
 g.buf.grab=0
 g.buf.portal=0
 v.rx+=v.vx*g.DT
 v.ry+=v.vy*g.DT
 var mx=g.js_round(v.rx)
 var my=g.js_round(v.ry)
 v.rx-=mx
 v.ry-=my
 for e in voids: e.solid=false
 var dead=false
 var out=false
 while (mx!=0 or my!=0) and not dead and not out:
  for axis in [0,1]:
   var dv=sign(mx) if axis==0 else sign(my)
   if dv==0: continue
   var nx=p.x+(dv if axis==0 else 0)
   var ny=p.y+(dv if axis==1 else 0)
   if g.solid(nx,ny,p.w,p.h):
    dead=true
    break
   p.x=nx
   p.y=ny
   if axis==0: mx-=dv
   else: my-=dv
   var inside=voids.any(func(e):return g.overlap(p,e))
   if inside: v.entered=true
   elif v.entered:
    out=true
    break
 for e in voids: e.solid=true
 p.vx=0
 p.vy=0
 if dead:
  g.void_travel=null
  p.state="normal"
  g.die()
  return
 if not v.entered:
  g.void_travel=null
  p.state="dash"
  p.dashTimer=max(1,v.dashTimer-1)
  p.vx=v.vx
  p.vy=v.vy
  return
 if out:
  g.void_travel=null
  p.state="normal"
  p.vx=v.vx
  p.vy=v.vy
  p.remX=0
  p.remY=0
  p.maxFall=max(g.K.maxFall,v.vy)
  p.dashCooldown=0
  p.dashRefillCooldown=0
  g.refill()
  if v.vy>=0:
   p.jumpGrace=max(p.jumpGrace,6)
   g.void_grace=6
  if v.vx!=0: p.facing=sign(v.vx)
  if abs(v.vx)>g.K.maxRun: p.coast=true
  g.emit_event("void-out")
static func forces(g):
 if g.p.state!="void" or g.void_travel==null: return
 var p=g.p
 var v=g.void_travel
 p.vx=v.vx
 p.vy=v.vy
 p.remX=-v.vx*g.DT
 p.remY=-v.vy*g.DT
 p.pushX=0
