extends RefCounted
## The authored survive-2 controller extensions; ordinary rooms retain their original controller.
static func reset(g):
 g.p.erase("move2")
 if g.room.def.get("movement","")=="survive-2": g.p.move2={"jumpHeld":false,"jumpIntent":0,"grabArmed":false,"grabIntent":0,"inputX":0,"wallGrace":0,"wallGraceFrame":-1,"naturalDashFrame":-1,"reverse":null}
static func clear_action(g):
 if not g.p.has("move2"): return
 g.p.move2.wallGrace=0
 g.p.move2.reverse=null
static func before_read(g):
 if not g.p.has("move2"): return
 var m=g.p.move2
 if g.p.state not in ["normal","dash"]: m.wallGrace=0
 if m.jumpIntent>0: m.jumpIntent-=1
 if m.grabIntent>0: m.grabIntent-=1
 if m.grabIntent==0 and not g.prev.get("grab",false): m.grabArmed=false
static func read(g,cur):
 if not g.p.has("move2"): return
 var m=g.p.move2
 m.jumpHeld=cur.jump
 m.inputX=int(cur.r)-int(cur.l)
 if cur.jump and not g.prev.get("jump",false): m.jumpIntent=5
 if cur.grab and not g.prev.get("grab",false):
  m.grabArmed=true
  m.grabIntent=5
  m.wallGrace=0
 if m.grabArmed and (cur.grab or g.prev.get("grab",false)): m.grabIntent=5
static func before_player(g,inp):
 if not g.p.has("move2"): return
 var p=g.p
 var m=p.move2
 if m.reverse!=null and (p.state not in ["normal","dash"] or p.carrying!=null or inp.grab or inp.parry or p.parryTimer>0): m.reverse=null
 if p.state!="normal" or p.carrying!=null or inp.grab or inp.strike or inp.parry or p.strikeTimer>0 or p.parryTimer>0: m.wallGrace=0
static func landed(g):
 if not g.p.has("move2"): return
 var p=g.p
 if p.move2.reverse!=null and p.onGround and not p.wasGround and p.state!="dash": p.move2.reverse=null
 if p.onGround: p.move2.wallGrace=0
static func can_cut(g):
 var p=g.p
 return p.has("move2") and p.move2.reverse!=null and p.state=="dash" and not p.dashAim and p.dashDir.y==0
static func late_reverse(g,inp):
 var p=g.p
 if not p.has("move2"): return false
 var r=p.move2.reverse
 if r==null or g.buf.jump<=0 or inp.mx!=-r.dir or p.y>r.y+8: return false
 p.ducking=r.hyper
 g.super_jump()
 g.emit_event("late-reverse")
 return true
static func normal(g,inp):
 var p=g.p
 if not p.has("move2"): return false
 if p.move2.reverse!=null and p.move2.reverse.left>0 and late_reverse(g,inp): return true
 if p.move2.wallGrace>0 and g.buf.jump>0:
  for dir in [1,-1]:
   if g.body_solid(dir*g.K.superWallJumpCheck,0) and not g.thorned(dir):
    g.jump(inp,"wallbounce",-dir)
    g.emit_event("late-wallbounce")
    return true
 return false
static func dash_catch(g):
 var p=g.p
 if not p.has("move2"): return false
 var m=p.move2
 if not m.grabArmed or m.grabIntent<=0 or p.dashAim or p.carrying!=null or p.state=="dead": return false
 for e in g.ents:
  if e.type!="lantern" or e.get("held",false) or e.get("returning",false) or not g.overlap(g.rect(p.x-4,p.y-4,p.w+8,p.h+8),e): continue
  m.grabArmed=false
  m.grabIntent=0
  m.wallGrace=0
  m.naturalDashFrame=-1
  m.reverse=null
  g.buf.grab=0
  e.held=true
  e.vx=0
  e.vy=0
  p.carrying=e
  p.state="normal"
  p.dashTimer=0
  p.dashAim=false
  p.ducking=false
  p.varJump=0
  p.autoJump=false
  p.jumpGrace=0
  p.coast=true
  p.fling=false
  g.emit_event("pickup")
  g.emit_event("cargo-dash-catch")
  return true
 return false
static func dash_track(g):
 var p=g.p
 if p.has("move2") and p.dashDir.y==0 and p.jumpGrace>0: p.move2.reverse={"dir":sign(p.dashDir.x),"hyper":p.ducking,"y":p.y,"left":0,"frame":g.room_frame}
static func dash_end(g):
 var p=g.p
 if not p.has("move2"): return
 var m=p.move2
 if m.reverse!=null:
  m.reverse.left=8
  m.reverse.frame=g.room_frame
 m.naturalDashFrame=g.room_frame
 if p.dashDir.x==0 and p.dashDir.y<0:
  m.wallGrace=6
  m.wallGraceFrame=g.room_frame
static func after(g):
 var p=g.p
 if not p.has("move2"): return
 var m=p.move2
 if m.reverse!=null:
  var r=m.reverse
  if p.state not in ["normal","dash"] or p.carrying!=null or p.state=="normal" and r.left==0 or p.onGround and not p.wasGround and p.state!="dash" or p.y>r.y+8: m.reverse=null
  elif r.left>0 and r.frame!=g.room_frame:
   r.left-=1
   if r.left==0: m.reverse=null
 if m.wallGrace>0:
  if p.state!="normal" or p.carrying!=null: m.wallGrace=0
  elif m.wallGraceFrame!=g.room_frame: m.wallGrace-=1
