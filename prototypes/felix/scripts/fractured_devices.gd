extends RefCounted
## Deterministic native ports of the existing Fractured region devices.
static func reset(g):
 g.sentinel=null
 g.oath_root=null
 g.resin_wind=null
 g.root_lash=null
 g.super_fractured=null
 var d=g.room.def
 if d.has("sentinel"):
  var s=d.sentinel.duplicate(true)
  s.merge({"t":0,"done":false,"ridden":false,"target":80,"hold":s.get("hold",170),"range":s.get("range",[28,260]),"land":s.get("floor",18)*8-40,"from":s.get("from",288),"to":s.get("to",160),"ry":s.get("y",100),"period":s.get("period",240)},true)
  var e={"type":"sentinelStep","dev":true,"solid":false,"id":"sentinel-step","x":s.from if s.mode=="rush" else 68,"y":s.ry if s.mode=="rush" else -48,"w":28,"h":40,"remX":0,"remY":0}
  g.ents.append(e)
  s.body=e
  g.sentinel=s
  key_gates(g)
 if d.has("oathRoot"):
  g.oath_root=d.oathRoot.duplicate(true)
  g.oath_root.merge({"released":false,"taken":false})
  key_gates(g)
 if d.has("resinWind"):
  g.resin_wind=d.resinWind.duplicate(true)
  g.resin_wind.merge({"t":0,"phase":0},true)
  for i in range(g.resin_wind.branches.size()):
   var b=g.resin_wind.branches[i]
   g.ents.append({"type":"resinBranch","id":"resin-"+str(i),"dev":true,"solid":b.phase==0 or b.phase==2,"x":b.c*8,"y":b.r*8,"w":b.w*8,"h":4,"phase":b.phase})
 if d.has("lashes") or d.has("rootCrown"):
  g.root_lash={"t":0,"lashes":[],"crown":null}
  for l in d.get("lashes",[]):
   var q=l.duplicate(true)
   q.merge({"phase":l.get("phase",0),"live":false,"warn":false},true)
   g.root_lash.lashes.append(q)
  if d.has("rootCrown"):
   g.root_lash.crown=d.rootCrown.duplicate(true)
   g.root_lash.crown.cut=false
   key_gates(g)
 if d.has("superFractured"): g.super_fractured={"d":d.superFractured.duplicate(true),"stage":0}
 for i in range(d.get("lines",[]).size()):
  var l=d.lines[i]
  var ax=l.a[0]*8+4
  var ay=l.a[1]*8+2.5
  var bx=l.b[0]*8+4
  var by=l.b[1]*8+2.5
  g.ents.append({"type":"zipline","dev":true,"solid":false,"x":min(ax,bx)-4,"y":min(ay,by)-6,"w":abs(ax-bx)+8,"h":abs(ay-by)+12,"id":"zl"+str(i),"li":i,"ax":ax,"ay":ay,"bx":bx,"by":by,"setDown":l.get("setDown",false),"oneWay":l.get("oneWay",false),"once":l.get("once",false),"period":l.get("period",0),"upT":l.get("upT",int(l.get("period",0))/2),"phase":l.get("phase",0),"spent":false,"pulse":0,"state":""})
static func key_gates(g):
 for e in g.ents:
  if e.type=="gate": e.devKeyed=true
static func gate_hold(g):
 return g.sentinel!=null and not g.sentinel.done or g.oath_root!=null and not g.oath_root.taken or g.root_lash!=null and g.root_lash.crown!=null and not g.root_lash.crown.cut
static func input(g,raw):
 var o=g.oath_root
 var p=g.p
 if o==null or p.state in ["dead","respawn"]: return raw
 if o.released and not o.taken and raw.get("u",false) and abs(p.x+4-(o.bladeC*8+4))<14 and abs(p.y+11-(o.bladeR*8+8))<16:
  o.taken=true
  g.emit_event("oath-taken")
 if not o.taken: raw.strike=false
 return raw
static func before(g):
 sentinel_before(g)
 if g.resin_wind!=null:
  var w=g.resin_wind
  if g.awake: w.t+=1
  w.phase=int(floor(float(w.t)/w.period))%2
  for e in g.ents:
   if e.type=="resinBranch": e.solid=e.phase==2 or e.phase==w.phase
 if g.root_lash!=null:
  if g.awake: g.root_lash.t+=1
  for l in g.root_lash.lashes: lash_state(g.root_lash,l)
 zip_before(g)
static func sentinel_before(g):
 var s=g.sentinel
 if s==null or s.done or not g.awake: return
 var e=s.body
 s.t+=1
 var t=int(s.t)%int(s.period)
 var end=30+s.hold
 if s.mode=="hammer":
  if t<30: s.target=clamp(g.p.x+4,s.range[0],s.range[1])
  if t==30:
   e.x=g.js_round(s.target-14)
   e.y=-48
   e.solid=true
   s.ridden=false
  if t>=30 and t<60 and e.y<s.land:
   var dy=min(7,s.land-e.y)
   if g.p.state not in ["dead","respawn"] and g.overlap(g.p,g.rect(e.x,e.y+dy,e.w,e.h)): g.die()
   g.move_solid(e,0,dy)
  if t==end:
   e.solid=false
   e.y=-48
   s.ridden=false
 else:
  var dir=-1 if s.to<s.from else 1
  if t==30:
   e.x=s.from
   e.y=s.ry
   e.h=40
   e.solid=true
   s.ridden=false
  if t>=30 and t<100 and (e.x>s.to if dir<0 else e.x<s.to):
   var dx=dir*min(5,abs(e.x-s.to))
   if g.p.state not in ["dead","respawn"] and g.overlap(g.p,g.rect(e.x+dx,e.y,e.w,e.h)): g.die()
   g.move_solid(e,dx,0)
  if e.x==s.to and e.y==s.ry and t<end:
   g.move_solid(e,0,-12)
   e.h=52
   g.emit_event("sentinel-stun")
  if t==end:
   e.solid=false
   e.x=s.from
   e.y=s.ry
   e.h=40
   s.ridden=false
static func lash_state(lash,l):
 var k=int(lash.t+l.phase)%int(l.period)
 var cut=lash.crown!=null and lash.crown.cut
 l.live=not cut and k<l.on
 l.warn=not l.live and not cut and k>=l.period-30
static func after(g):
 var p=g.p
 if p.state in ["dead","respawn"]: return
 var s=g.sentinel
 if s!=null and not s.done:
  var e=s.body
  if e.solid and p.onGround and p.y+p.h==e.y and p.x+p.w>e.x and p.x<e.x+e.w:
   if not s.ridden: g.emit_event("sentinel-ride")
   s.ridden=true
  if s.ridden and g.overlap(p,g.rect(s.c*8-2,s.r*8-2,12,12)):
   s.done=true
   g.emit_event("sentinel-bell")
  var t=int(s.t)%int(s.period)
  if s.get("sweep",false) and t>=140 and t<150 and g.overlap(p,g.rect(80,134,180,10)): g.die()
 var o=g.oath_root
 if o!=null and not o.released and p.onGround and p.y+p.h==o.r*8 and p.x+p.w>o.c*8 and p.x<(o.c+2)*8:
  o.released=true
  g.emit_event("oath-roots")
 var lash=g.root_lash
 if lash!=null:
  for l in lash.lashes:
   if l.live and g.overlap(g.rect(p.x,p.y,p.w,9),g.rect(l.c0*8,l.r0*8,(l.c1-l.c0+1)*8,(l.r1-l.r0+1)*8)):
    g.die()
    return
  var crown=lash.crown
  if crown!=null and not crown.cut and p.strikeTimer>0 and g.overlap(g.strike_box(),g.rect(crown.c*8-2,crown.r*8-2,20,20)):
   crown.cut=true
   g.freeze=max(g.freeze,6)
   g.emit_event("root-cut")
   for l in lash.lashes: lash_state(lash,l)
 var a=g.super_fractured
 if a!=null and a.d.kind=="sentinel" and g.sentinel.done and a.stage==0:
  var q=a.d.shelf
  g.ents.append({"id":"old-hammer-rest","type":"superRest","dev":true,"solid":true,"x":q.c*8,"y":q.r*8,"w":q.w*8,"h":8,"remX":0,"remY":0})
  a.stage=1
  s.merge(a.d.second,true)
  s.done=false
  s.ridden=false
  s.t=0
  s.land=a.d.second.floor*8-40
  s.body.solid=false
  s.body.y=-48
  g.emit_event("sentinel-relocate")
 zip_after(g)
static func zip_open(g,e): return not e.spent and (not e.period or int(g.room_frame+e.phase)%int(e.period)<e.upT)
static func zip_before(g):
 var p=g.p
 if p.get("zipCoast",0)>0:
  p.zipCoast-=1
  if p.zipCoast==0: p.coast=false
 if p.state=="ride" and (p.get("ride")==null or p.ride.room!=g.room.id):
  var r=p.get("ride")
  p.ride=null
  p.state="normal"
  if r!=null:
   p.vx=r.dx*220
   p.vy=r.dy*220
   if abs(p.vx)>g.K.maxRun:
    p.coast=true
    p.zipCoast=24
   p.dashCooldown=0
   g.refill()
  return
 if p.get("ride")!=null and p.state!="ride": p.ride=null
 var any=false
 for e in g.ents:
  if e.type!="zipline": continue
  any=true
  if e.pulse>0: e.pulse-=1
  e.state="spent" if e.spent else ("" if zip_open(g,e) else "shut")
 if not any or p.get("ride")==null: return
 var r=p.ride
 g.buf.strike=0
 g.buf.grab=0
 g.buf.portal=0
 r.t+=1
 if r.t<r.n:
  var k=float(r.t)/r.n
  p.x=g.js_round(r.fx+(r.tx-r.fx)*k-4)
  p.y=g.js_round(r.fy+(r.ty-r.fy)*k-5.5)
  p.remX=0
  p.remY=0
  return
 var lines=g.ents.filter(func(e):return e.type=="zipline" and e.li==r.li)
 var e=lines[0] if not lines.is_empty() else null
 p.ride=null
 p.state="normal"
 p.remX=0
 p.remY=0
 p.x=g.js_round(r.tx-4)
 p.y=g.js_round(r.ty-5.5)
 for i in range(1,9):
  if not g.solid(p.x,p.y,p.w,p.h): break
  p.y-=1
 if e!=null and e.setDown:
  p.vx=sign(r.dx)*30
  p.vy=0
 elif r.dy < -.25:
  p.vx=r.dx*220*.35
  p.vy=-110
 else:
  p.vx=r.dx*220
  p.vy=r.dy*220
 if abs(p.vx)>g.K.maxRun:
  p.coast=true
  p.zipCoast=24
 if r.dx!=0: p.facing=sign(r.dx)
 p.maxFall=max(g.K.maxFall,p.vy)
 p.varJump=0
 p.autoJump=false
 p.dashCooldown=0
 p.dashRefillCooldown=0
 g.refill()
 p.zipLast=r.li
 if e!=null:
  if e.once: e.spent=true
  e.pulse=14
 g.emit_event("zip-out")
static func forces(g):
 var p=g.p
 if p.state!="ride" or p.get("ride")==null: return
 var r=p.ride
 p.vx=r.dx*400
 p.vy=r.dy*400
 p.remX=-p.vx*g.DT
 p.remY=-p.vy*g.DT
 p.pushX=0
static func zip_after(g):
 var p=g.p
 if p.state!="dash" or p.dashAim: return
 var cx=p.x+4
 var cy=p.y+5.5
 var best=null
 var score=INF
 var from_end=0
 for e in g.ents:
  if e.type!="zipline" or not zip_open(g,e): continue
  for end in ([0] if e.oneWay else [0,1]):
   var mx=e.bx if end else e.ax
   var my=e.by if end else e.ay
   var ox=e.ax if end else e.bx
   var oy=e.ay if end else e.by
   if abs(cx-mx)>10 or abs(cy-my)>12: continue
   var length=sqrt(pow(ox-mx,2)+pow(oy-my,2))
   if length==0: length=1
   if (p.dashDir.x*(ox-mx)+p.dashDir.y*(oy-my))/length < -.01: continue
   var value=(1000 if e.li==p.get("zipLast") else 0)+sqrt(pow(cx-mx,2)+pow(cy-my,2))
   if best==null or value<score:
    best=e
    score=value
    from_end=end
 if best==null: return
 var e=best
 var fx=e.bx if from_end else e.ax
 var fy=e.by if from_end else e.ay
 var tx=e.ax if from_end else e.bx
 var ty=e.ay if from_end else e.by
 var length=sqrt(pow(tx-fx,2)+pow(ty-fy,2))
 if length==0: length=1
 p.ride={"li":e.li,"room":g.room.id,"fx":fx,"fy":fy,"tx":tx,"ty":ty,"dx":(tx-fx)/length,"dy":(ty-fy)/length,"t":0,"n":max(2,ceil(length/(400*g.DT)))}
 p.state="ride"
 p.dashTimer=0
 p.ducking=false
 p.vx=0
 p.vy=0
 p.remX=0
 p.remY=0
 p.varJump=0
 p.autoJump=false
 p.coast=false
 p.fling=false
 p.zipCoast=0
 p.x=g.js_round(fx-4)
 p.y=g.js_round(fy-5.5)
 e.pulse=14
 g.emit_event("zip-in")
