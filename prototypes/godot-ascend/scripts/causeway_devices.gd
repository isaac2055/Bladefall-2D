extends RefCounted
## Source-backed Causeway mechanisms. Every movement uses the shared pixel sweeps.
const DIRS=["right","down","left","up"]
static func reset(g):
 g.combat={}
 g.brute_waves=[]
 for i in range(g.room.def.get("recoilPlatforms",[]).size()):
  var d=g.room.def.recoilPlatforms[i]
  var label=str(d.get("id",String.chr(65+i)))
  g.ents.append({"type":"recoilPlatform","dev":true,"solid":true,"id":"recoil:"+label,"label":label,"x":d.c*8,"y":d.r*8,"w":d.w*8,"h":8,"ox":d.c*8,"oy":d.r*8,"depth":d.get("depth",3)*8,"loadFrames":d.get("loadFrames",30),"releaseSpeed":d.get("releaseSpeed",120),"axis":1,"charge":0,"releaseV":0,"state":"idle","loadedBy":"","remX":0,"remY":0,"pulse":0,"jammed":false})
 for i in range(g.room.def.get("hingeArms",[]).size()):
  var d=g.room.def.hingeArms[i]
  var label=str(d.get("id",String.chr(65+i)))
  var e={"type":"hingeArm","dev":true,"solid":true,"id":"hinge:"+label,"label":label,"group":i,"pivotX":d.c*8,"pivotY":d.r*8,"length":d.length,"dir":d.dir,"state":d.dir,"pulse":0,"jam":0,"jamReason":null,"turns":0,"remX":0,"remY":0}
  e.merge(pose(e,d.dir))
  g.ents.append(e)
 if g.room.def.has("combat"):
  var d=g.room.def.combat
  g.combat={"awake":not d.get("waitForMove",false),"shots":[],"serial":0,"parries":0,"kills":0,"pogos":0,"receivers":[],"enemies":[],"hits":0}
  for i in range(d.enemies.size()):
   var e=d.enemies[i].duplicate(true)
   e.merge({"id":"enemy:"+str(i),"w":24,"h":16,"ox":e.x,"oy":e.y,"remX":0,"remY":0,"vx":0,"vy":0,"hp":0,"cracks":0,"felled":false,"stampT":0,"prevState":"idle","state":"idle","t":e.get("delay",0),"face":e.get("face",-1),"cooldown":e.get("delay",30),"stun":0,"exposed":0,"flash":0,"attackId":0},true)
   g.combat.enemies.append(e)
  for door in d.get("doors",[]):
   var e=door.duplicate(true)
   e.merge({"type":"brittle" if door.get("brittle",false) else "combatGate","id":"door:"+str(g.ents.size()),"open":false},true)
   g.ents.append(e)
static func pose(e,dir):
 var n=e.length*8
 match dir:
  "down": return {"x":e.pivotX,"y":e.pivotY,"w":8,"h":n}
  "left": return {"x":e.pivotX-n+8,"y":e.pivotY,"w":n,"h":8}
  "up": return {"x":e.pivotX,"y":e.pivotY-n+8,"w":8,"h":n}
 return {"x":e.pivotX,"y":e.pivotY,"w":n,"h":8}
static func on(q,e): return q.y+q.h==e.y and q.x<e.x+e.w and q.x+q.w>e.x
static func recoil_move(g,e,target):
 var dy=e.oy+e.axis*target-(e.y+e.remY)
 var next=e.y+g.js_round(e.remY+dy)
 if g.solid(e.x,next,e.w,e.h,g.ents.find(e)):
  if not e.jammed: g.emit_event("recoil-jam")
  e.jammed=true
  return false
 var ground=g.p.onGround
 if on(g.p,e) and g.p.vy>=0: g.p.onGround=true
 g.move_solid(e,0,dy)
 g.p.onGround=ground
 e.charge=target
 e.jammed=false
 return true
static func before(g,inp):
 combat_before(g)
 brute_before(g)
 for e in g.ents:
  if e.type=="hingeArm":
   if e.pulse>0: e.pulse-=1
   if e.jam>0: e.jam-=1
  if e.type!="recoilPlatform": continue
  if e.pulse>0: e.pulse-=1
  if not g.awake: continue
  var weight=""
  if e.axis==1:
   if g.p.state=="normal" and g.p.vy>=0 and on(g.p,e) and inp.my>0 and not inp.dash and not inp.jump: weight="knight"
   elif g.ents.any(func(q):return q.type=="lantern" and not q.get("held",false) and not q.get("returning",false) and on(q,e)): weight="lantern"
   elif g.combat.get("enemies",[]).any(func(q):return not q.get("dead",false) and on(q,e)): weight="combat"
  e.loadedBy=weight
  if e.state!="release":
   if weight!="":
    if e.state!="load":
     e.state="load"
     g.emit_event("recoil-load")
    recoil_move(g,e,min(e.depth,e.charge+float(e.depth)/e.loadFrames))
   elif e.charge>0:
    var peak=e.releaseSpeed*sqrt(float(e.charge)/e.depth)
    var frames=ceil(e.charge/(peak/60.0))
    e.releaseStep=e.charge/frames
    e.releaseSteps=frames
    e.releaseV=e.releaseStep*60
    e.state="release"
    e.pulse=12
    g.emit_event("recoil-release")
   else: e.state="idle"
  if e.state=="release":
   if on(g.p,e):
    g.p.recoilSource=e.id
    g.p.recoilSourceUntil=g.frame+g.K.liftGraceFrames+1
   if recoil_move(g,e,0 if e.releaseSteps==1 else max(0,e.charge-e.releaseStep)):
    e.releaseSteps-=1
    if e.charge==0:
     e.state="idle"
     e.releaseV=0
static func obstruction(g,e,b):
 if b.x<0 or b.y<0 or b.x+b.w>g.room.w or b.y+b.h>g.room.h: return "edge"
 var hit=g.blocker(b.x,b.y,b.w,b.h,g.ents.find(e))
 if hit!=-1: return ("arm" if g.ents[hit].type=="hingeArm" else "solid") if hit>=0 else "rock"
 if g.p.state not in ["dead","respawn"] and g.overlap(b,g.p): return "knight"
 if g.ents.any(func(q):return q.type=="lantern" and not q.get("returning",false) and g.overlap(b,q)): return "lantern"
 return null
static func after(g):
 if g.p.state=="dead": return
 combat_after(g)
 var p=g.p
 if p.state not in ["dead","respawn"] and p.strikeTimer>0 and not p.strikeHit.has("hinge:stroke"):
  var hits=g.ents.filter(func(e):return e.type=="hingeArm" and g.overlap(g.strike_box(),g.rect(e.pivotX-2,e.pivotY-2,12,12)))
  hits.sort_custom(func(a,b):return Vector2(a.pivotX-p.x,a.pivotY-p.y-1).length()<Vector2(b.pivotX-p.x,b.pivotY-p.y-1).length())
  if not hits.is_empty():
   var e=hits[0]
   var dir=DIRS[(DIRS.find(e.dir)+1)%4]
   var b=pose(e,dir)
   var why=obstruction(g,e,b)
   p.strikeHit["hinge:stroke"]=true
   p.strikeHit[e.id]=true
   if why!=null:
    e.jam=24
    e.jamReason=why
    g.emit_event("hinge-jam")
   else:
    e.merge(b,true)
    e.dir=dir
    e.state=dir
    e.turns+=1
    e.pulse=16
    e.jam=0
    e.jamReason=null
    if p.onGround and not (g.body_solid(0,1) or g.thru(p)): p.onGround=false
    g.emit_event("hinge-turn")
 if p.get("recoilSource")!=null and g.frame<=p.get("recoilSourceUntil",0):
  if ("jump" in g.events and p.liftY!=0) or (("hyper" in g.events or "super" in g.events or "wallbounce" in g.events) and p.liftY<0):
   g.emit_event("recoil-jump")
   p.recoilSource=null
 brute_after(g)
static func visible(g,a,b):
 var n=ceil(sqrt(pow(b.x-a.x,2)+pow(b.y-a.y,2))/3)
 for i in range(1,int(n)):
  if g.solid(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,1,1): return false
 return true
static func combat_before(g):
 if g.combat.is_empty() or not g.awake: return
 g.actor_bounds=true
 g.combat.awake=true
 for e in g.combat.enemies:
  if e.get("dead",false): continue
  if e.flash>0: e.flash-=1
  if e.exposed>0: e.exposed-=1
  if e.stun>0:
   e.stun-=1
   e.vy=min(160,e.vy+g.K.gravity*g.DT)
   g.move_axis(e,e.vx*g.DT,true,-1,true,func(_b,_s):e.vx=0)
   g.move_axis(e,e.vy*g.DT,false,-1,true,func(_b,_s):e.vy=0)
   continue
  e.vy=min(160,e.vy+g.K.gravity*g.DT)
  g.move_axis(e,e.vy*g.DT,false,-1,true,func(_b,_s):e.vy=0)
  if e.state=="tell":
   e.t-=1
   if e.t<=0:
    e.state="attack"
    e.t=80
  elif e.state=="attack":
   e.vx=e.face*160
   g.move_axis(e,e.vx*g.DT,true,-1,true,func(b,_s):
    if b>=0 and g.ents[b].type=="brittle":
     g.ents[b].open=true
     g.emit_event("breach")
    e.state="recover"
    e.t=65
    e.exposed=90
    e.vx=0)
   e.t-=1
   if e.t<=0:
    e.state="recover"
    e.t=48
    e.vx=0
    e.vy=0
  elif e.state=="recover":
   e.t-=1
   if e.t<=0:
    e.state="idle"
    e.cooldown=24
  else:
   if e.cooldown>0: e.cooldown-=1
   var a={"x":e.x+e.w/2.0,"y":e.y+e.h/2.0}
   var b={"x":g.p.x+g.p.w/2.0,"y":g.p.y+g.p.h/2.0}
   if e.cooldown<=0 and abs(b.x-a.x)<180 and abs(b.y-a.y)<150 and visible(g,a,b):
    e.face=-1 if b.x<a.x else 1
    var delta={"x":b.x-a.x,"y":b.y-a.y}
    var n=sqrt(delta.x*delta.x+delta.y*delta.y)
    if n==0: n=1
    e.aimX=delta.x/n
    e.aimY=delta.y/n
    e.state="tell"
    e.t=36
    e.attackId+=1
    g.emit_event("enemy-tell")
  if e.y>g.room.h+20:
   e.dead=true
   g.emit_event("enemy-fell")
 g.actor_bounds=false
static func combat_after(g):
 if g.combat.is_empty() or not g.combat.awake: return
 var p=g.p
 if p.strikeTimer>0:
  for e in g.combat.enemies:
   if e.get("dead",false) or p.strikeHit.has(e.id) or not g.overlap(g.strike_box(),e): continue
   p.strikeHit[e.id]=true
   if p.strikeDir.y>0:
    # Same blade rebound used by the existing seed pods.
    g.blade_rebound(p.strikeDir)
    g.combat.pogos+=1
    g.emit_event("enemy-pogo")
    g.freeze=max(g.freeze,3)
   e.hp-=2 if e.exposed>0 and p.strikeDir.y>=0 else 1
   e.flash=8
   e.stun=18
   if p.strikeDir.y<0:
    e.vy=g.K.springSpeed
    e.stun=38
   else:
    e.vx=p.strikeDir.x*65
    e.vy=0
   if e.hp<=0:
    e.dead=true
    g.combat.kills+=1
    g.emit_event("enemy-defeat")
   else:
    e.state="recover"
    e.t=45
    g.emit_event("enemy-hit")
 for e in g.combat.enemies:
  if not e.get("dead",false) and e.state=="attack" and g.overlap(g.rect(p.x,p.y,p.w,9),e):
   g.combat.hits+=1
   g.die()
   return
 for e in g.ents:
  if e.type=="combatGate" and e.has("ward") and g.combat.enemies.filter(func(q):return q.get("ward")==e.ward).all(func(q):return q.get("dead",false)):
   if not e.open:
    e.open=true
    g.emit_event("combat-gate")

static func brute_forces(g):
 var p=g.p
 if g.combat.is_empty() or p.strikeTimer<=0: return
 if p.strikeTimer==g.K.strikeFrames or not p.has("bruteGlance"): p.bruteGlance={}
 var sb=g.strike_box()
 sb.x-=4
 sb.y-=4
 sb.w+=8
 sb.h+=8
 for e in g.combat.enemies:
  if e.get("dead",false): continue
  p.strikeHit[e.id]=true
  if not g.overlap(sb,e) or p.bruteGlance.has(e.id): continue
  p.bruteGlance[e.id]=true
  p.vx=(-1 if p.x+4<e.x+e.w/2 else 1)*150
  p.vy=min(p.vy,-80)
  if p.state=="climb": p.state="normal"
  g.freeze=max(g.freeze,2)
  g.emit_event("guard-block")
static func crack(g,e):
 e.dead=false
 e.cracks+=1
 g.combat.kills=max(0,g.combat.kills-1)
 g.events.erase("enemy-defeat")
 var to=null
 for d in range(0,int(g.room.w)+1,2):
  var order=[d,-d] if e.x+e.w/2<g.room.w/2 else [-d,d]
  for dx in order:
   var x=e.x+dx
   if to==null and x>=0 and x+e.w<=g.room.w and not g.solid(x,e.y-24,e.w,e.h+24): to=x
  if to!=null: break
 if to==null: to=e.x
 e.shove=to-e.x
 e.shoveT=12
 e.x=to
 e.remX=0
 e.vx=0
 e.vy=0
 e.stun=0
 e.exposed=0
 e.face=-1 if e.shove>0 else (1 if e.shove<0 else e.face)
 e.state="recover"
 e.t=40
 e.stampT=0
 g.freeze=max(g.freeze,6)
 g.emit_event("brute-crack")
static func brute_before(g):
 g.actor_bounds=true
 for e in g.combat.get("enemies",[]):
  if e.get("dead",false) and not e.felled:
   if e.cracks+1<e.get("crush",1): crack(g,e)
   else: e.felled=true
  if e.get("dead",false): continue
  if e.get("shoveT",0)>0: e.shoveT-=1
  if e.cracks>0 and g.awake:
   if e.state=="tell" and e.t>2 and int(e.t)%3==0: e.t-=1
   if e.state=="attack":
    g.move_axis(e,e.face*70*g.DT,true,-1,true,func(b,_s):
     if b>=0 and g.ents[b].type=="brittle":
      g.ents[b].open=true
      g.emit_event("breach")
     e.state="recover"
     e.t=65
     e.exposed=90
     e.vx=0)
  var stamp=e.get("stamp",false)
  var stamps=str(stamp)=="always" or (str(stamp)=="true" and e.cracks>0)
  if stamps and e.prevState=="attack" and e.state=="recover" and e.t>=60:
   e.stampT=10
   g.emit_event("brute-rear")
  if e.stampT>0:
   e.stampT-=1
   if e.stampT==0 and e.state=="recover":
    for dir in [-1,1]: g.brute_waves.append({"x":e.x+e.w/2-2,"y":e.y+e.h,"dir":dir,"t":0})
    g.freeze=max(g.freeze,2)
    g.emit_event("brute-stamp")
  e.prevState=e.state
 for w in g.brute_waves:
  w.t+=1
  w.rem=w.get("rem",0)+150*g.DT
  var n=floori(w.rem)
  w.rem-=n
  for i in range(n):
   if w.get("done",false): break
   var nx=w.x+w.dir
   if g.solid(nx+(3 if w.dir>0 else 0),w.y-6,1,5) or not g.solid(nx+1,w.y,2,1) or nx < -4 or nx>g.room.w: w.done=true
   else: w.x=nx
 g.brute_waves=g.brute_waves.filter(func(w):return not w.get("done",false))
 g.actor_bounds=false
static func brute_after(g):
 if g.p.state in ["dead","respawn"]: return
 for w in g.brute_waves:
  if g.overlap(g.p,g.rect(w.x-1,w.y-6,6,6)):
   g.die()
   return
static func solid_moved(g,e,dx,dy,riders):
 for q in g.combat.get("enemies",[]):
  if q.get("dead",false): continue
  var pushing=g.overlap(q,e)
  if not pushing and q.id not in riders: continue
  var mx=(e.x+e.w-q.x if dx>0 else e.x-q.w-q.x) if pushing and dx!=0 else dx
  var my=(e.y+e.h-q.y if dy>0 else e.y-q.h-q.y) if pushing and dy!=0 else dy
  for axis in [0,1]:
   var amount=mx if axis==0 else my
   for i in range(int(abs(amount))):
    var x=q.x+(sign(amount) if axis==0 else 0)
    var y=q.y+(sign(amount) if axis==1 else 0)
    if x<0 or x+q.w>g.room.w or y<0 or g.solid(x,y,q.w,q.h,g.ents.find(e)):
     if pushing:
      q.dead=true
      g.combat.kills+=1
      g.emit_event("enemy-defeat")
     break
    q.x=x
    q.y=y
