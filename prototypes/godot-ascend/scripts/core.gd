class_name AscendCore
extends RefCounted
## Native, fixed-tick port of bladefall-pcore.js. No CharacterBody2D or delta physics.
const DT = 1.0 / 60.0
var world_context = null
var world_origin = Vector2.ZERO
var K = {}
var room = {}
var p = {}
var ents = []
var prev = {}
var buf = {"jump":0,"dash":0,"grab":0,"strike":0,"parry":0,"portal":0}
var frame = 0
var room_frame = 0
var freeze = 0
var deaths = 0
var exited = false
var phase = 0
var shards = {}
var events = []
var defaults = {}
var sweepers = []
var sweeper_clock = 0
var awake = true
var decks_awake = false
var foothold_previous = {}
var kick_direction=0
var moving_decks=[]
var spent_footholds=[]

func _init(constants: Dictionary, player_defaults: Dictionary):
 K = constants
 defaults = player_defaults

func load_room(parsed: Dictionary, respawn = false):
 room = parsed
 p = defaults.duplicate(true)
 p.x = room.spawn.x
 p.y = room.spawn.y
 p.maxDashes = room.maxDashes
 p.dashes = room.maxDashes
 p.strikeHit = {}
 ents = room.entities.duplicate(true)
 for i in range(ents.size()):
  var e = ents[i]
  e.merge({"id":i,"ox":e.x,"oy":e.y,"remX":0.0,"remY":0.0,"vx":0.0,"vy":0.0,"timer":0,"t":0,"state":"idle"},true)
 # Device reset order matches the browser: spent footholds precede moving decks.
 for group in device_groups("Y"):
  group.merge({"type":"foothold","dev":true,"solid":true,"id":"fh"+str(ents.size()),"used":false})
  ents.append(group)
 for i in range(room.def.get("decks",[]).size()):
  var d=room.def.decks[i]
  ents.append({"type":"deck","dev":true,"solid":true,"x":d.c*8,"y":d.r*8,"w":d.w*8,"h":d.get("h",1)*8,"ox":d.c*8,"oy":d.r*8,"dx":d.to[0]*8,"dy":d.to[1]*8,"period":d.get("period",180),"phase":d.get("phase",0),"remX":0.0,"remY":0.0,"clock":0,"id":"dk"+str(i)})
 moving_decks=ents.filter(func(e):return e.type=="deck")
 spent_footholds=ents.filter(func(e):return e.type=="foothold")
 decks_awake=false
 sweepers = []
 sweeper_clock = 0
 awake = not room.def.get("study",false)
 for d in room.def.get("sweepers",[]):
  var e = {"path":[],"period":d.get("period",180),"phase":d.get("phase",0),"radius":d.get("radius",4),"loop":d.get("loop",false),"lengths":[],"length":0.0}
  for point in d.path: e.path.append([point[0]*8+4,point[1]*8+4])
  for i in range(e.path.size() if e.loop else e.path.size()-1):
   var a = e.path[i]
   var b = e.path[(i+1)%e.path.size()]
   var distance = sqrt(pow(a[0]-b[0],2)+pow(a[1]-b[1],2))
   e.lengths.append(distance)
   e.length += distance
  e.merge(sweeper_at(e,0))
  e.prevX = e.x
  e.prevY = e.y
  sweepers.append(e)
 room_frame = 0
 phase = 0
 exited = false
 if respawn:
  p.state = "respawn"
  p.respawnTimer = K.respawnFrames

func emit_event(kind: String):
 events.append(kind)

func tile(c: int, r: int):
 if world_context!=null: return world_context.tile_global(c+int(world_origin.x/8),r+int(world_origin.y/8))
 if c < 0 or c >= room.cols or r < 0 or r >= room.rows: return 0
 return room.grid[r * int(room.cols) + c]

func overlap(a, b):
 return a.x < b.x+b.w and a.x+a.w > b.x and a.y < b.y+b.h and a.y+a.h > b.y

func rect(x,y,w,h): return {"x":x,"y":y,"w":w,"h":h}
func solid_entity(e):
 if e.get("gone",false): return false
 match e.type:
  "toggle","held": return e.get("solid",false)
  "slide","zip": return true
  "gate": return not e.get("open",false)
  "crumble": return not e.get("broken",false)
 return e.get("dev",false) and e.get("solid",false)

func blocker(x,y,w,h, ignore = -1):
 if world_context!=null: return world_context.blocker(self,x,y,w,h,ignore)
 var ex = room.exit
 var side = room.def.get("side", "")
 var span = room.def.get("exitSpan",[])
 var value = y+h/2.0 if ex in ["left","right"] else x+w/2.0
 if not span.is_empty() and (value < span[0]*8 or value >= span[1]*8):
  if ex == "left" and x < 0 or ex == "right" and x+w > room.w: return -2
 if x < 0 and ex != "left" and side != "left": return -2
 if x+w > room.w and ex != "right" and side != "right": return -2
 if y < 0 and ex != "up" and side != "up": return -2
 for r in range(floori(y/8.0),floori((y+h-1)/8.0)+1):
  for c in range(floori(x/8.0),floori((x+w-1)/8.0)+1):
   if tile(c,r) == 1: return -2
 for i in range(ents.size()):
  if i != ignore and solid_entity(ents[i]) and overlap(rect(x,y,w,h),ents[i]): return i
 return -1

func solid(x,y,w,h,ignore = -1): return blocker(x,y,w,h,ignore) != -1
func body_solid(dx,dy,w = -1,h = -1): return solid(p.x+dx,p.y+dy,p.w if w<0 else w,p.h if h<0 else h)
func thru(a):
 if world_context!=null: return world_context.thru_global(self,a)
 var bottom = a.y+a.h
 if fmod(bottom,8) == 0:
  for c in range(floori(a.x/8.0),floori((a.x+a.w-1)/8.0)+1):
   if tile(c,int(bottom/8)) == 2: return true
 for e in ents:
  if e.type == "thru" and e.y == bottom and a.x < e.x+e.w and a.x+a.w > e.x: return true
 return false

# JS Math.round rounds ties toward +infinity (Godot round differs for negatives).
func js_round(v):
 # Adding 0.5 first rounds the predecessor of 0.5 up to 1.0 in IEEE doubles.
 # Math.round compares the fractional part, so preserve its boundary exactly.
 var lower=floor(v)
 return lower+1 if v-lower>=0.5 else lower
func approach(v,t,d): return max(v-d,t) if v>t else min(v+d,t)
func move_axis(a,amount,horizontal,ignore = -1,platforms = true,collide: Callable = Callable()):
 var rem = "remX" if horizontal else "remY"
 a[rem] += amount
 var movement = js_round(a[rem])
 if movement == 0: return
 a[rem] -= movement
 var direction = sign(movement)
 while movement != 0:
  var b = blocker(a.x+direction if horizontal else a.x,a.y if horizontal else a.y+direction,a.w,a.h,ignore)
  if b == -1 and not horizontal and direction > 0 and platforms and thru(a): b = -2
  if b != -1:
   a[rem] = 0
   if collide.is_valid(): collide.call(b,direction)
   return
  if horizontal: a.x += direction
  else: a.y += direction
  movement -= direction

func refill():
 if p.dashes < p.maxDashes:
  p.dashes = p.maxDashes
  p.dashFlash = 8
  emit_event("refill-dash")
  return true
 return false
func die():
 if p.state == "dead": return
 p.state = "dead"
 p.deadTimer = K.deathFrames
 deaths += 1
 freeze = 4
 if p.carrying != null:
  p.carrying.held = false
  p.carrying = null
 emit_event("death")
func wall_check(direction,dist = 3): return body_solid(direction*dist,0) and not p.onGround
func climb_check(direction,dy = 0): return body_solid(direction*K.climbCheck,dy,p.w,p.h-3)
func thorned(direction):
 var x0 = p.x+p.w if direction > 0 else p.x-K.superWallJumpCheck
 for r in range(floori(p.y/8.0),floori((p.y+p.h-1)/8.0)+1):
  for c in range(floori(x0/8.0),floori((x0+K.superWallJumpCheck-1)/8.0)+1):
   if tile(c,r) == (5 if direction>0 else 6): return true
 return false
func lift():
 if p.liftTimer <= 0: return {"x":0,"y":0}
 return {"x":clamp(p.liftX,-K.liftXCap,K.liftXCap),"y":max(K.liftYCap,p.liftY) if p.liftY<0 else 0}
func jump(inp,kind = "jump",direction = 0):
 buf.jump = 0
 p.ducking = false
 p.jumpGrace = 0
 p.varJump = K.superWallVarFrames if kind == "wallbounce" else K.varJumpFrames
 p.autoJump = false
 p.wallSlide = K.wallSlideFrames
 p.wallBoostTimer = 0
 if kind == "jump": p.vx += K.jumpHBoost*inp.mx
 elif kind == "walljump":
  p.vx = K.wallJumpH*direction
  if inp.mx != 0:
   p.forceMoveX = direction
   p.forceMoveTimer = K.wallJumpForceFrames
 elif kind == "wallbounce": p.vx = K.superWallJumpH*direction
 p.vy = K.superWallJumpSpeed if kind == "wallbounce" else K.jumpSpeed
 var l = lift()
 p.vx += l.x
 p.vy += l.y
 p.varJumpSpeed = p.vy
 if kind == "jump": p.liftTimer = 0
 else:
  p.facing = direction
  p.state = "normal"
 if kind in ["walljump","wallbounce"]: kick_direction=direction
 emit_event(kind)
func climb_jump(inp):
 p.stamina -= K.climbJumpCost
 jump(inp)
 if inp.mx == 0:
  p.wallBoostDir = -p.facing
  p.wallBoostTimer = K.climbJumpBoostFrames
 p.state = "normal"
 kick_direction=-p.facing
 emit_event("climbjump")
func super_jump():
 buf.jump = 0
 p.jumpGrace = 0
 p.varJump = K.varJumpFrames
 p.autoJump = false
 p.wallSlide = K.wallSlideFrames
 p.facing = sign(p.dashDir.x) if p.dashDir.x != 0 else p.facing
 p.vx = K.superJumpH*p.facing
 p.vy = K.jumpSpeed
 if p.ducking:
  p.vx *= K.hyperXMult
  p.vy *= K.hyperYMult
  p.ducking = false
 var l = lift()
 p.vx += l.x
 p.vy += l.y
 p.varJumpSpeed = p.vy
 p.liftTimer = 0
 p.state = "normal"
 emit_event("super")
func start_dash(inp):
 buf.dash = 0
 p.dashes -= 1
 p.state = "dash"
 p.dashTimer = K.dashFrames
 p.dashCooldown = K.dashCooldownFrames
 p.dashRefillCooldown = K.dashRefillCooldownFrames
 p.beforeDash = {"x":p.vx,"y":p.vy}
 p.pressAim = {"x":inp.mx,"y":inp.my}
 p.vx = 0
 p.vy = 0
 p.dashAim = true
 p.ducking = false
 p.wallBoostTimer = 0
 p.varJump = 0
 freeze = K.dashFreezeFrames
 emit_event("dash-start")
 flip_phase()
func enter_climb():
 p.state = "climb"
 p.vx = 0
 p.vy *= 0.2
 p.wallSlide = K.wallSlideFrames
 p.climbNoMove = K.climbNoMoveFrames
 p.wallBoostTimer = 0
 p.varJump = 0
 for i in range(int(K.climbCheck)):
  if not body_solid(p.facing,0): p.x += p.facing
  else: break
 emit_event("grab")
func normal_update(inp):
 if buf.grab>0:
  if p.carrying == null:
   for e in ents:
    if e.type=="lantern" and not e.get("held",false) and not e.get("returning",false) and overlap(rect(p.x-4,p.y-4,p.w+8,p.h+8),e):
     buf.grab = 0
     e.held = true
     e.vx = 0
     e.vy = 0
     p.carrying = e
     emit_event("pickup")
     break
  else:
   buf.grab = 0
   var e = p.carrying
   p.carrying = null
   e.held = false
   if inp.my>0:
    e.vx = p.vx*0.5
    e.vy = 0
   else:
    e.vx = K.throwX*p.facing+p.vx*0.3
    e.vy = K.throwY
   e.x = p.x
   e.y = p.y-8
   if solid(e.x,e.y,8,8):
    e.y = p.y
    if solid(e.x,e.y,8,8): e.y = p.y+3
   e.remX = 0
   e.remY = 0
   emit_event("throw")
 if inp.mx != 0 and p.forceMoveTimer <= 0: p.facing = inp.mx
 if p.forceMoveTimer > 0: p.facing = p.forceMoveX
 if (inp.grab and p.vy >= 0) and p.carrying == null and p.stamina >= K.climbTired and sign(p.vx) != -p.facing:
  if climb_check(p.facing):
   enter_climb()
   climb_update(inp)
   return
  if inp.my < 1:
   for i in range(1,3):
    if not body_solid(0,-i) and climb_check(p.facing,-i):
     p.y -= i
     enter_climb()
     climb_update(inp)
     return
 if buf.dash > 0 and p.dashes > 0 and p.dashCooldown <= 0 and p.carrying == null:
  start_dash(inp)
  return
 var mult = p.get("traction",1) if p.onGround else K.airMult
 if abs(p.vx) > K.maxRun and sign(p.vx) == inp.mx: p.vx = approach(p.vx,K.maxRun*inp.mx,K.runReduce*mult*DT)
 else: p.vx = approach(p.vx,K.maxRun*inp.mx,K.runAccel*mult*DT)
 if p.wallBoostTimer > 0 and inp.mx == p.wallBoostDir:
  p.vx = K.wallJumpH*inp.mx
  p.stamina += K.climbJumpCost
  p.wallBoostTimer = 0
  emit_event("wallboost")
 if not p.onGround:
  var max_fall = K.carryMaxFall if p.carrying != null else (K.fastMaxFall if inp.my>0 and p.vy>=K.maxFall else K.maxFall)
  p.maxFall = approach(p.maxFall,max_fall,K.fastMaxAccel*DT)
  if p.carrying != null: p.maxFall = min(p.maxFall,K.carryMaxFall)
  var fall = p.maxFall
  if inp.mx == p.facing and p.vy > 0 and p.carrying == null and climb_check(p.facing):
   fall = K.wallSlideStartMax+(fall-K.wallSlideStartMax)*(1-p.wallSlide/K.wallSlideFrames)
   if p.wallSlide > 0: p.wallSlide -= 1
  var half = abs(p.vy)<K.halfGravThreshold and (inp.jump or p.autoJump)
  p.vy = approach(p.vy,fall,K.gravity*(0.5 if half else 1)*DT)
 if p.varJump > 0:
  if inp.jump or p.autoJump: p.vy = min(p.vy,p.varJumpSpeed)
  else: p.varJump = 0
 if p.vy >= 0: p.autoJump = false
 if buf.jump > 0:
  if p.jumpGrace > 0: jump(inp)
  elif p.carrying == null:
   for direction in [1,-1]:
    if wall_check(direction):
     if p.facing == direction and inp.grab and p.stamina > 0 and climb_check(direction): climb_jump(inp)
     else: jump(inp,"walljump",-direction)
     break
func climb_update(inp):
 if not inp.grab or p.carrying != null:
  p.state = "normal"
  return
 if buf.jump > 0:
  if inp.mx == -p.facing: jump(inp,"walljump",-p.facing)
  else: climb_jump(inp)
  return
 if buf.dash > 0 and p.dashes > 0 and p.dashCooldown <= 0:
  start_dash(inp)
  return
 p.vx = 0
 if not climb_check(p.facing):
  if p.vy < 0 or inp.my < 0:
   p.vx = K.climbHopX*p.facing
   p.vy = min(p.vy,K.climbHopY)
   p.forceMoveX = p.facing
   p.forceMoveTimer = K.climbHopForceFrames
   emit_event("climbhop")
  p.state = "normal"
  return
 var target = 0
 var cost = K.climbStillCost
 if p.climbNoMove <= 0:
  if inp.my < 0 and not body_solid(0,-1):
   target = K.climbUpSpeed
   cost = K.climbUpCost
  elif inp.my > 0:
   target = K.climbDownSpeed
   cost = 0
 if p.stamina <= 0: target = K.climbSlipSpeed
 p.vy = approach(p.vy,target,K.climbAccel*DT)
 p.stamina -= cost*DT
 if p.stamina <= 0:
  p.stamina = 0
  p.state = "normal"
  emit_event("tired")
 if inp.my > 0 and p.onGround: p.state = "normal"
func dash_update(inp):
 if p.dashAim:
  p.dashAim = false
  var dx = inp.mx
  var dy = inp.my
  if dx == 0 and dy == 0:
   dx = p.pressAim.x
   dy = p.pressAim.y
  if dx == 0 and dy == 0: dx = p.facing
  var length = sqrt(dx*dx+dy*dy)
  p.dashDir = {"x":dx/length,"y":dy/length}
  if dx != 0: p.facing = sign(dx)
  p.vx = p.dashDir.x*K.dashSpeed
  p.vy = p.dashDir.y*K.dashSpeed
  if sign(p.beforeDash.x) == sign(p.vx) and abs(p.beforeDash.x)>abs(p.vx): p.vx = p.beforeDash.x
  if p.dashDir.y > 0 and p.dashDir.x != 0: p.ducking = true
  emit_event("dash")
 if p.onGround and p.dashDir.x != 0 and p.dashDir.y > 0:
  p.dashDir = {"x":sign(p.dashDir.x),"y":0}
  p.vy = 0
  p.vx *= K.ultraMult
  p.ducking = true
  emit_event("ultra")
 if buf.jump > 0:
  if p.dashDir.y == 0 and p.jumpGrace > 0:
   super_jump()
   return
  if p.dashDir.x == 0 and p.dashDir.y < 0:
   for direction in [1,-1]:
    if body_solid(direction*K.superWallJumpCheck,0) and not thorned(direction):
     jump(inp,"wallbounce",-direction)
     return
  if p.jumpGrace > 0:
   p.state = "normal"
   p.ducking = false
   jump(inp)
   return
  for direction in [1,-1]:
   if wall_check(direction):
    jump(inp,"walljump",-direction)
    return
 if inp.grab and p.dashTimer < K.dashFrames-2 and not p.onGround and p.dashDir.y<=0 and climb_check(p.facing) and sign(p.vx)!=-p.facing:
  enter_climb()
  return
 p.dashTimer -= 1
 if p.dashTimer <= 0:
  if p.dashDir.y <= 0:
   p.vx = p.dashDir.x*K.endDashSpeed*(abs(p.vx)/K.dashSpeed if abs(p.vx)>K.dashSpeed else 1)
   p.vy = p.dashDir.y*K.endDashSpeed
  if p.vy < 0: p.vy *= K.endDashUpMult
  p.state = "normal"
  p.ducking = false
  p.maxFall = K.maxFall
func collide_h(_b,s):
 if p.state == "dash" and p.dashDir.y == 0:
  for i in range(1,int(K.dashCorner)+1):
   for j in [-1,1]:
    if not body_solid(s,i*j):
     p.y += i*j
     p.x += s
     return
 if abs(p.vx)>0 and p.retainTimer<=0:
  p.retained = p.vx
  p.retainTimer = K.wallSpeedRetentionFrames
 p.vx = 0
func collide_v(_b,s):
 if s < 0:
  var order = [-1] if p.vx<0 else ([1] if p.vx>0 else [-1,1])
  for d in order:
   for i in range(1,int(K.upwardCorner)+1):
    if not body_solid(i*d,-1):
     p.x += i*d
     return
  p.varJump = 0
 p.vy = 0
func read_input(raw):
 var inp = {}
 for key in ["l","r","u","d","jump","dash","grab","strike","parry","portal"]:
  inp[key] = raw.get(key,false)
  if buf.has(key) and inp[key] and not prev.get(key,false): buf[key] = int(K.bufferFrames) if key in ["jump","dash"] else 3
 prev = inp.duplicate()
 inp.mx = int(inp.r)-int(inp.l)
 inp.my = int(inp.d)-int(inp.u)
 return inp
func step(raw):
 frame += 1
 events = []
 raw = raw.duplicate()
 for key in room.def.get("lock",[]): raw[key] = false
 if freeze > 0:
  read_input(raw)
  freeze -= 1
  return
 for key in buf:
  if buf[key]>0: buf[key] -= 1
 var inp = read_input(raw)
 room_frame += 1
 update_entities()
 if p.state == "dead":
  p.deadTimer -= 1
  if p.deadTimer<=0:
   load_room(room,true)
   emit_event("respawn")
  return
 if p.state == "respawn":
  p.respawnTimer -= 1
  if p.respawnTimer<=0: p.state = "normal"
  return
 if not awake and (inp.mx!=0 or inp.my!=0 or inp.jump or inp.dash or inp.grab or inp.strike or inp.parry): awake = true
 var from = {"x":p.x,"y":p.y}
 update_devices(inp)
 if awake: sweeper_clock += 1
 for e in sweepers:
  e.prevX = e.x
  e.prevY = e.y
  e.merge(sweeper_at(e,sweeper_clock),true)
 if ents.any(func(e):return e.type=="stone") and ents.filter(func(e):return e.type=="stone").all(func(e):return e.get("lit",false)):
  for d in room.def.get("bearingLifts",[]):
   for e in ents:
    if e.type=="zip" and e.ox==d.c*8 and e.oy==d.r*8:
     e.tx = e.ox+d.after[0]*8
     e.ty = e.oy+d.after[1]*8
 for key in ["dashCooldown","dashRefillCooldown","forceMoveTimer","wallBoostTimer","climbNoMove","liftTimer","strikeCooldown","dashFlash","varJump"]:
  if p[key]>0: p[key] -= 1
 p.traction = 1
 var intent = inp.duplicate()
 intent.mx = p.forceMoveX if p.forceMoveTimer>0 else inp.mx
 if p.get("dropT",0)>0: p.dropT -= 1
 if (world_context!=null or room.def.get("dropThru",false)) and inp.my>0 and buf.jump>0 and p.state=="normal" and thru(p) and not body_solid(0,1):
  buf.jump = 0
  p.dropT = 8
  p.jumpGrace = 0
  p.y += 1
 p.wasGround = p.onGround
 p.onGround = p.vy>=0 and (body_solid(0,1) or (not p.get("dropT",0)>0 and thru(p)))
 if p.onGround:
  if not p.wasGround and p.get("lastFallSpeed",0)>40: emit_event("land")
  p.jumpGrace = K.jumpGraceFrames
  p.wallSlide = K.wallSlideFrames
  if p.state != "climb":
   p.stamina = K.climbMaxStamina
   if p.dashRefillCooldown<=0: refill()
 elif p.jumpGrace>0: p.jumpGrace -= 1
 p.lastFallSpeed = p.vy
 if p.retainTimer>0:
  p.retainTimer -= 1
  if not body_solid(sign(p.retained),0):
   p.vx = p.retained
   p.retainTimer = 0
 if buf.strike>0 and p.strikeCooldown<=0 and p.state!="dash" and p.carrying==null and p.parryTimer<=0:
  buf.strike = 0
  p.strikeTimer = K.strikeFrames
  p.strikeCooldown = K.strikeCooldownFrames
  p.strikeHit.clear()
  var side = -p.facing if p.state=="climb" else p.facing
  if room.def.get("aim8",false):
   p.strikeDir = {"x":inp.mx,"y":-1} if inp.my<0 else ({"x":inp.mx,"y":1} if inp.my>0 and not p.onGround else {"x":inp.mx if inp.mx!=0 else side,"y":0})
  else:
   p.strikeDir = {"x":0,"y":-1} if inp.my<0 else ({"x":0,"y":1} if inp.my>0 and not p.onGround else {"x":side,"y":0})
  emit_event("strike")
 match p.state:
  "normal": normal_update(intent)
  "climb": climb_update(intent)
  "dash": dash_update(intent)
 move_axis(p,p.vx*DT+p.get("pushX",0),true,-1,true,collide_h)
 p.pushX = 0
 move_axis(p,p.vy*DT,false,-1,not p.get("dropT",0)>0,collide_v)
 if p.carrying != null:
  p.carrying.x = p.x
  p.carrying.y = p.y-8
 if p.strikeTimer>0: p.strikeTimer -= 1
 interact()
 finish_devices()
 if p.state != "dead":
  sweeper_collision(from)
 if p.state != "dead" and world_context==null: check_exit()
func update_entities():
 var pressed = false
 for e in ents:
  if e.type=="plate":
   var top = rect(e.x,e.y-1,e.w,e.h+1)
   e.down = overlap(p,top) or ents.any(func(l):return l.type=="lantern" and not l.get("held",false) and overlap(l,top))
   if e.down: pressed = true
 var occupied={}
 for e in ents:
  if e.type=="toggle" and (overlap(p,e) or ents.any(func(l):return l.type=="lantern" and overlap(l,e))): occupied[e.body]=true
 var left = ents.filter(func(e):return e.type=="stone" and not e.get("lit",false)).size()
 for e in ents:
  if e.type=="toggle":
   var want=e.phase==phase
   if want and not e.solid:
    if occupied.has(e.body): e.pending=true
    else: e.solid=true;e.pending=false
   elif not want: e.solid=false;e.pending=false
  if e.type=="held":
   if pressed or e.get("latchedOpen",false): e.solid = false
   elif not e.solid and not overlap(p,e): e.solid = true
  if e.type=="lantern": update_lantern(e)
  if e.type=="zip": update_zip(e)
  if e.type=="gate":
   if not e.get("open",false) and left==0 and ents.any(func(a):return a.type=="stone"):
    e.open = true
    e.t = 0
   if e.get("open",false): e.t += 1
  if e.type in ["refill","pod","bell"] and e.timer>0: e.timer -= 1
  if e.type=="crumble":
   if e.get("broken",false):
    if e.timer>0: e.timer -= 1
    elif not overlap(p,e):
     e.broken = false
     e.shaking = 0
   elif e.get("shaking",0)>0:
    e.shaking -= 1
    if e.shaking==0:
     e.broken = true
     e.timer = K.crumbleRespawnFrames
   elif riding(e): e.shaking = K.crumbleShakeFrames
func interact():
 for r in range(floori(p.y/8.0),floori((p.y+8)/8.0)+1):
  for c in range(floori(p.x/8.0),floori((p.x+p.w-1)/8.0)+1):
   var t = tile(c,r)
   var hit = null
   if t==3 and p.vy>=0: hit = rect(c*8,r*8+5,8,3)
   elif t==4 and p.vy<=0: hit = rect(c*8,r*8,8,3)
   elif t==5 and p.vx>=0: hit = rect(c*8+5,r*8,3,8)
   elif t==6 and p.vx<=0: hit = rect(c*8,r*8,3,8)
   if hit!=null and overlap(rect(p.x,p.y,p.w,9),hit):
    die()
    return
 if world_context==null and p.y>room.h+2 and room.exit!="down" and room.def.get("side","")!="down":
  die()
  return
 for e in ents:
  if e.type=="spring" and not e.get("gone",false):
   if overlap(p,e) and p.vy>=0 and p.state!="climb":
    if world_context!=null:
     p.vx=0
     p.forceMoveTimer=0
     p.remX=0
     var cx=js_round(e.x+e.w/2-p.w/2)
     if not solid(cx,p.y,p.w,p.h): p.x=cx
    p.state="normal"
    p.dashTimer=0
    p.ducking=false
    p.vy=K.springSpeed
    p.varJumpSpeed=p.vy
    p.varJump=K.varJumpFrames
    p.autoJump=true
    p.jumpGrace=0
    p.remY=0
    refill()
    p.stamina=K.climbMaxStamina
    e.timer=8
    emit_event("spring")
   if e.timer>0: e.timer-=1
  if e.get("gone",false) or not overlap(p,e): continue
  if e.type=="stone" and not e.get("lit",false): e.lit = true
  elif e.type=="shard": e.gone = true
  elif e.type=="refill" and e.timer==0:
   var used = refill()
   if used or p.stamina<K.climbTired:
    p.stamina = K.climbMaxStamina
    e.timer = K.refillRespawnFrames
    freeze = 2
 if p.strikeTimer>0:
  var d=p.strikeDir
  var sb
  if d.x!=0 and d.y!=0: sb=rect(p.x+p.w-3 if d.x>0 else p.x-11,p.y-12 if d.y<0 else p.y+p.h-3,14,14)
  elif d.y<0: sb=rect(p.x-3,p.y-14,14,14)
  elif d.y>0: sb=rect(p.x-3,p.y+p.h,14,13)
  else: sb=rect(p.x+p.w if d.x>0 else p.x-15,p.y-1,15,12)
  for e in ents:
   if p.strikeHit.has(e.id) or not overlap(sb,rect(e.x-2,e.y-2,e.w+4,e.h+4)): continue
   if e.type=="pod" and e.timer==0:
    p.strikeHit[e.id]=true
    e.timer=30
    if d.y>0:
     p.vy=K.podSpeed
     p.varJumpSpeed=p.vy
     p.varJump=7
     p.autoJump=true
    elif d.y<0: p.vy=K.podDown
    else:
     p.vx=-d.x*K.podSide
     p.vy=min(p.vy,-90)
     p.forceMoveX=-d.x
     p.forceMoveTimer=7
    if p.state=="climb": p.state="normal"
    p.jumpGrace=0
    refill()
    p.stamina=K.climbMaxStamina
    freeze=3
    emit_event("pod")
   elif e.type=="stone" and not e.get("lit",false):
    p.strikeHit[e.id]=true
    e.lit=true
   elif e.type=="bell" and e.timer==0:
    p.strikeHit[e.id]=true
    e.timer=18
    flip_phase()
    freeze=2
    emit_event("bell")
func flip_phase():
 if ents.any(func(e):return e.type=="toggle"):
  phase=1-phase
  emit_event("phase")
func device_groups(glyph):
 var groups=[]
 var seen={}
 for r in range(int(room.rows)):
  for c in range(int(room.cols)):
   if seen.has(Vector2i(c,r)) or AscendRoomLoader.glyph(room.def,c,r)!=glyph: continue
   var w=0
   while c+w<room.cols and AscendRoomLoader.glyph(room.def,c+w,r)==glyph and not seen.has(Vector2i(c+w,r)): w+=1
   var h=1
   while r+h<room.rows:
    var fits=true
    for x in range(w):
     if AscendRoomLoader.glyph(room.def,c+x,r+h)!=glyph or seen.has(Vector2i(c+x,r+h)): fits=false;break
    if not fits: break
    h+=1
   for y in range(h):
    for x in range(w): seen[Vector2i(c+x,r+y)]=true
   groups.append(rect(c*8,r*8,w*8,h*8))
 return groups
func update_devices(inp):
 if moving_decks.is_empty() and spent_footholds.is_empty(): return
 kick_direction=0
 if not spent_footholds.is_empty(): foothold_previous=p.duplicate()
 for e in spent_footholds:
  if not e.get("gone",false) and p.state not in ["dead","respawn"] and p.y+p.h==e.y and p.x<e.x+e.w and p.x+p.w>e.x: e.used=true
 if not decks_awake and awake and (inp.mx!=0 or inp.my!=0 or inp.jump or inp.dash or inp.grab or inp.strike or inp.parry or inp.portal): decks_awake=true
 for e in moving_decks:
  if decks_awake: e.clock+=1
  var u=fmod(e.clock+e.phase,e.period)/e.period
  var k=u*2 if u<0.5 else 2-u*2
  var ease=k*k*(3-2*k)
  move_solid(e,e.ox+e.dx*ease-(e.x+e.remX),e.oy+e.dy*ease-(e.y+e.remY))
func finish_devices():
 for e in spent_footholds:
  if e.get("gone",false): continue
  var on=riding(e) or (p.state not in ["dead","respawn"] and p.onGround and p.y+p.h==e.y and p.x<e.x+e.w and p.x+p.w>e.x)
  if not on and kick_direction!=0 and not foothold_previous.is_empty():
   var q=foothold_previous
   if overlap(rect(q.x-6 if kick_direction>0 else q.x+q.w,q.y,6,q.h),e): e.used=true
  if on: e.used=true
  elif e.used:
   e.gone=true
   e.solid=false
   emit_event("foothold-spent")
func check_exit():
 var ex = room.exit
 var out = p.x>=room.w-2 if ex=="right" else (p.x<=-p.w+2 if ex=="left" else (p.y<=-3 if ex=="up" else p.y>=room.h-2))
 if ex=="none": out = false
 var span = room.def.get("exitSpan",[])
 if out and not span.is_empty():
  var value = p.y+p.h/2.0 if ex in ["left","right"] else p.x+p.w/2.0
  out = value>=span[0]*8 and value<span[1]*8
 if out: exited = true

func update_lantern(e):
 e.rbrOnBelt = false
 if e.get("held",false): return
 if e.get("returning",false):
  e.timer -= 1
  if e.timer<=0:
   e.returning = false
   e.x = e.ox
   e.y = e.oy
   e.vx = 0
   e.vy = 0
  return
 if solid(e.x,e.y+1,e.w,e.h) or thru(e): e.vx = approach(e.vx,0,350*DT)
 else: e.vy = approach(e.vy,K.maxFall,K.gravity*DT)
 move_axis(e,e.vx*DT,true,-1,true,func(_b,_d):e.vx *= -0.4)
 move_axis(e,e.vy*DT,false,-1,true,func(_b,_d):e.vy = 0)
 var lost = e.y>room.h+8
 for r in range(floori(e.y/8.0),floori((e.y+e.h-1)/8.0)+1):
  for c in range(floori(e.x/8.0),floori((e.x+e.w-1)/8.0)+1):
   if tile(c,r)>=3: lost = true
 if lost:
  e.returning = true
  e.timer = 40
func try_shift(a,dx,dy,ignore):
 if solid(a.x+dx,a.y+dy,a.w,a.h,ignore): return false
 a.x += dx
 a.y += dy
 return true
func move_solid(e,dx,dy):
 e.remX += dx
 e.remY += dy
 var mx = js_round(e.remX)
 var my = js_round(e.remY)
 e.remX -= mx
 e.remY -= my
 var alive = p.state not in ["dead","respawn"]
 var riding = alive and (standing(e) or (p.state=="climb" and (p.x+p.w==e.x if p.facing>0 else p.x==e.x+e.w) and p.y<e.y+e.h and p.y+p.h>e.y))
 for axis in [0,1]:
  var count = mx if axis==0 else my
  var ax = sign(count) if axis==0 else 0
  var ay = sign(count) if axis==1 else 0
  for i in range(int(abs(count))):
   e.x += ax
   e.y += ay
   if alive and overlap(p,e):
    var nx = (e.x+e.w if ax>0 else e.x-p.w) if ax!=0 else p.x
    var ny = (e.y+e.h if ay>0 else e.y-p.h) if ay!=0 else p.y
    var ddx = nx-p.x
    var ddy = ny-p.y
    for j in range(int(abs(ddx))):
     if not try_shift(p,sign(ddx),0,ents.find(e)):
      die()
      return
    for j in range(int(abs(ddy))):
     if not try_shift(p,0,sign(ddy),ents.find(e)):
      die()
      return
   elif alive and riding:
    try_shift(p,ax,0,ents.find(e))
    try_shift(p,0,ay,ents.find(e))
 if alive and (riding or overlap(rect(p.x-1,p.y-1,p.w+2,p.h+2),e)) and (mx!=0 or my!=0):
  p.liftX = dx*60
  p.liftY = dy*60
  p.liftTimer = K.liftGraceFrames
func riding(e): return standing(e) or (p.state=="climb" and (p.x+p.w==e.x if p.facing>0 else p.x==e.x+e.w) and p.y<e.y+e.h and p.y+p.h>e.y)
func standing(e): return p.y+p.h==e.y and p.x<e.x+e.w and p.x+p.w>e.x and (p.onGround or p.state=="dash")
func update_zip(e):
 if e.state=="idle":
  if e.get("cool",0)>0: e.cool -= 1
  elif riding(e):
   e.state = "wind"
   e.t = 0
 elif e.state=="wind":
  e.t += 1
  if e.t>=4:
   e.state = "go"
   e.t = 0
 elif e.state=="go" or e.state=="back":
  e.t += 1
  var a = min(1.0,e.t/(30.0 if e.state=="go" else 120.0))
  var nx = e.ox+(e.tx-e.ox)*a*a if e.state=="go" else e.tx+(e.ox-e.tx)*a
  var ny = e.oy+(e.ty-e.oy)*a*a if e.state=="go" else e.ty+(e.oy-e.ty)*a
  move_solid(e,nx-(e.x+e.remX),ny-(e.y+e.remY))
  if a>=1:
   var going = e.state=="go"
   e.x = e.tx if going else e.ox
   e.y = e.ty if going else e.oy
   e.remX = 0
   e.remY = 0
   e.state = "hold" if going else "idle"
   if going: e.t = 0
   else: e.cool = 20
 elif e.state=="hold":
  e.t += 1
  if e.t>=30:
   e.state = "back"
   e.t = 0

func sweeper_at(e,clock):
 if e.path.size()==1: return {"x":e.path[0][0],"y":e.path[0][1]}
 var u = fposmod(clock+e.phase,e.period)/e.period
 if not e.loop: u = u*2 if u<0.5 else 2-u*2
 var distance = u*e.length
 for i in range(e.lengths.size()):
  var n = e.lengths[i]
  if distance<=n or i==e.lengths.size()-1:
   var a = e.path[i]
   var b = e.path[(i+1)%e.path.size()]
   var t = min(1.0,distance/n)
   return {"x":a[0]+(b[0]-a[0])*t,"y":a[1]+(b[1]-a[1])*t}
  distance -= n
 return {}
func sweeper_collision(from):
 for e in sweepers:
  var dx = p.x-from.x
  var dy = p.y-from.y
  var n = max(1,ceili(sqrt(pow(dx-(e.x-e.prevX),2)+pow(dy-(e.y-e.prevY),2))/2))
  for i in range(n+1):
   var t = float(i)/n
   var x = e.prevX+(e.x-e.prevX)*t
   var y = e.prevY+(e.y-e.prevY)*t
   var qx = clamp(x,from.x+dx*t,from.x+dx*t+p.w)
   var qy = clamp(y,from.y+dy*t,from.y+dy*t+p.h)
   if pow(qx-x,2)+pow(qy-y,2)<e.radius*e.radius:
    die()
    return

func carry_from(snapshot,source,target,continuous = false):
 # The original Climb seam: world-space position survives; each room owns its dash budget.
 var motion = snapshot.p
 if continuous:
  var maximum = p.maxDashes
  p = motion.duplicate(true)
  p.maxDashes = maximum
  p.dashes = min(p.dashes,maximum)
  p.x = motion.x+source.x-target.x
  p.y = motion.y+source.y-target.y
  p.carrying = null
  p.strikeHit = {}
 else:
  var x = clamp(js_round(motion.x+source.x-target.x),0,room.w-p.w)
  var y = clamp(js_round(motion.y+source.y-target.y),0,room.h-1 if motion.vy<0 else room.h-p.h)
  if solid(x,y,p.w,p.h):
   var best = null
   var distance = 1e9
   for dy in range(-56,57):
    for dx in range(-24,25):
     var weight = abs(dx)*2+abs(dy)
     if weight>=distance: continue
     var nx = x+dx
     var ny = y+dy
     if nx<0 or ny<0 or nx+p.w>room.w or ny+p.h>room.h: continue
     if not solid(nx,ny,p.w,p.h):
      best = [nx,ny]
      distance = weight
   if best!=null:
    x = best[0]
    y = best[1]
  p.x = x
  p.y = y
  p.remX = 0
  p.remY = 0
  for key in ["vx","vy","facing","stamina"]: p[key] = motion[key]
  p.dashes = min(motion.dashes,p.maxDashes)
  p.onGround = false
  p.wasGround = false
  p.state = "normal"
 prev = snapshot.prev.duplicate()
 buf = snapshot.buf.duplicate()
