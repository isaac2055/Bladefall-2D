extends RefCounted
## Native versions of the opening road and forest encounter roles.
## Wind-up, committed attack and recovery are separate simulation phases.
const DT=1.0/60.0
static func change(e,mode,timer):
 e.mode=mode
 e.timer=timer
static func ground_step(w,e,dx):
 var nx=e.x+dx
 var support=w.floor_at(nx,e.y+8,e.w)
 if support.id<0 or abs(support.y-e.y)>35:
  e.dir=-e.dir
  return false
 for o in w.objects():
  if o.type=="wall" and abs(nx-o.x)<o.w/2+e.w/2 and e.y+e.h>o.y-o.h+4 and e.y<o.y-4: return false
 e.x=nx
 e.y=support.y
 return true
static func patrol(w,e,speed):
 var lo=e.get("patrolMin",e.spawnX-130)
 var hi=e.get("patrolMax",e.spawnX+130)
 if e.x<=lo: e.dir=1
 elif e.x>=hi: e.dir=-1
 e.face=e.dir
 ground_step(w,e,e.dir*speed*DT)
static func tick(w,e):
 if e.dead: return
 if not e.has("homeY"):
  e.homeY=e.y
  e.homeX=e.x
  e.cooldown=0.0
  e.memory=0.0
 e.timer=max(0,e.timer-DT)
 e.cooldown=max(0,e.cooldown-DT)
 e.hitFlash=max(0,e.hitFlash-DT)
 var dx=w.p.x-e.x
 var dy=w.p.y-e.y
 var distance=Vector2(dx,dy).length()
 var inside=(dx*e.face>0 and abs(dy)<max(96,abs(dx)*0.68)) or distance<170
 var visible=distance<e.get("noticeRange",500 if w.stage==1 else 380) and inside
 for wall in w.objects():
  if wall.type=="wall" and wall.x>min(e.x,w.p.x) and wall.x<max(e.x,w.p.x) and w.p.y+25<wall.y and w.p.y+25>wall.y-wall.h: visible=false
 e.alert=clamp(e.alert+(DT*3.8 if visible else -DT*1.15),0,1)
 if e.alert>=0.34: e.memory=4.4
 else: e.memory=max(0,e.memory-DT)
 if visible: e.lastX=w.p.x;e.lastY=w.p.y
 var engaged=e.alert>=0.34 or e.memory>0
 if w.stage==1:
  match e.get("forestRole",""):
   "canopy-controller","tunnel-controller": seed_attack(w,e,engaged);return
   "canopy-diver","mirror-diver": diver(w,e,engaged);return
   "root-stalker": stalker(w,e,engaged);return
   "oathblade-guard","root-guard","mirror-pursuer": duel(w,e,engaged);return
 if w.stage==0 and not w.weapon:
  match e.get("encounterRole",""):
   "upper-sentry": sentry(w,e,engaged);return
   "final-feint": stalker(w,e,engaged);return
   "platform-bypass": rush(w,e,engaged);return
 generic(w,e,engaged)
static func generic(w,e,engaged):
 var dx=w.p.x-e.x
 var dy=w.p.y-e.y
 if e.mode=="wind":
  if e.timer<=0: change(e,"strike",0.32)
 elif e.mode=="strike":
  ground_step(w,e,e.face*e.speed*2.15*DT)
  if abs(dx)<54 and abs(dy)<48: w.hurt(e.x)
  if e.timer<=0: change(e,"recover",0.68)
 elif e.mode=="recover":
  if e.timer<=0: change(e,"patrol",0)
 elif engaged:
  e.face=sign(dx) if dx!=0 else e.face
  if abs(dx)<92 and abs(dy)<82: change(e,"wind",0.34)
  else: ground_step(w,e,e.face*e.speed*1.22*DT)
 else: patrol(w,e,e.speed*0.72)
static func duel(w,e,engaged):
 var shield=e.forestRole=="root-guard"
 var wind=0.52 if shield else 0.42
 var advance=0.58 if shield else 0.72
 var dx=w.p.x-e.x
 var dy=w.p.y-e.y
 e.frontShield=false
 if e.mode not in ["wind","strike"]: e.face=sign(dx) if dx!=0 else e.face
 if e.mode=="challenge":
  if e.timer<=0: change(e,"advance",0)
 elif e.mode=="advance":
  e.frontShield=shield
  if abs(dx)<(126 if shield else 112) and abs(dy)<82: change(e,"wind",wind)
  else: ground_step(w,e,e.face*e.speed*advance*DT)
 elif e.mode=="wind":
  e.frontShield=shield
  if e.timer<=0: change(e,"strike",0.34)
 elif e.mode=="strike":
  ground_step(w,e,e.face*e.speed*(2.0 if shield else 2.15)*DT)
  if abs(dx)<56 and abs(dy)<50: w.hurt(e.x)
  if e.timer<=0: change(e,"recover",1.15 if shield else 1.0)
 elif e.mode=="recover":
  if e.timer<=0: change(e,"advance" if engaged else "patrol",0)
 elif engaged: change(e,"challenge",0.55 if shield else 0.72)
 else: patrol(w,e,e.speed*0.42)
static func seed_attack(w,e,engaged):
 e.face=sign(w.p.x-e.x) if w.p.x!=e.x else e.face
 e.x=lerp(float(e.x),float(e.homeX),DT*2.2)
 if e.mode=="root-wind":
  if e.timer<=0:
   var positions=[e.aimX,e.aimX-e.face*105] if e.forestRole=="tunnel-controller" else [e.aimX]
   for x in positions:
    var floor=w.floor_at(x,10)
    if floor.id>=0 and floor.y<=10:
     w.region().hazards.append({"x":x,"y":floor.y,"r":82 if e.forestRole=="tunnel-controller" else 64,"t":0.72,"color":"aa78c1" if e.forestRole=="tunnel-controller" else "9fa85e"})
     w.emit("root-attack",x,floor.y)
   e.cooldown=2.55
   change(e,"recover",0.72)
 elif e.mode=="spore-wind":
  if e.timer<=0:
   var from=Vector2(e.x+e.face*12,e.y+e.h*0.7)
   var toward=Vector2(e.aimX,e.aimY+22)
   var velocity=(toward-from).normalized()*200
   w.region().projectiles.append({"x":from.x,"y":from.y,"vx":velocity.x,"vy":velocity.y,"life":2.4,"size":15,"spore":true})
   e.cooldown=2.55
   change(e,"recover",0.72)
 elif e.mode=="recover":
  if e.timer<=0: change(e,"hold",0)
 elif engaged and e.cooldown<=0:
  e.aimX=clamp(w.p.x+w.p.vx*0.22,e.get("patrolMin",e.x-500),e.get("patrolMax",e.x+500))
  e.aimY=w.p.y
  if w.p.onGround and w.p.y<=10: change(e,"root-wind",0.78)
  else: change(e,"spore-wind",0.6)
static func diver(w,e,engaged):
 if e.mode=="dive-mark":
  if e.timer<=0: change(e,"dive",0.62)
 elif e.mode=="dive":
  var toward=Vector2(e.aimX-e.x,e.aimY-e.y)
  var velocity=toward.normalized()*e.speed*3.65*DT
  e.x+=velocity.x;e.y+=velocity.y
  if abs(w.p.x-e.x)<32 and abs(w.p.y+22-e.y-e.h/2)<42: w.hurt(e.x)
  if e.timer<=0 or toward.length()<22: change(e,"rise",0.9)
 elif e.mode=="rise":
  e.x=lerp(float(e.x),float(e.homeX),DT*1.45)
  e.y=lerp(float(e.y),float(e.homeY),DT*2.25)
  if e.timer<=0: e.cooldown=2.45;change(e,"perch",0)
 elif engaged and e.cooldown<=0:
  e.aimX=clamp(w.p.x,e.get("patrolMin",e.homeX-240),e.get("patrolMax",e.homeX+240))
  e.aimY=w.p.y+18
  change(e,"dive-mark",0.62)
 else:
  e.x=lerp(float(e.x),float(e.homeX),DT*0.55)
  e.y=lerp(float(e.y),float(e.homeY),DT*1.25)
  e.face=sign(w.p.x-e.x) if engaged else (1 if int(w.clock*1.4+e.aiId)%2 else -1)
static func stalker(w,e,engaged):
 if e.mode=="veil":
  if e.timer<=0:
   e.x=e.aimX;e.y=e.aimY
   e.face=sign(w.p.x-e.x) if w.p.x!=e.x else e.face
   change(e,"wind",0.34)
 elif e.mode=="wind":
  if e.timer<=0: change(e,"strike",0.3)
 elif e.mode=="strike":
  ground_step(w,e,e.face*e.speed*2.35*DT)
  if abs(w.p.x-e.x)<52 and abs(w.p.y-e.y)<48: w.hurt(e.x)
  if e.timer<=0: change(e,"recover",1.05)
 elif e.mode=="recover":
  if e.timer<=0: e.cooldown=2.15;change(e,"perch",0)
 elif engaged and e.cooldown<=0:
  e.aimX=clamp(w.p.x-w.p.face*76,e.get("patrolMin",e.homeX-80),e.get("patrolMax",e.homeX+80))
  var floor=w.floor_at(e.aimX,w.p.y+20)
  e.aimY=floor.y if floor.id>=0 else e.homeY
  change(e,"veil",0.62)
 elif not engaged: patrol(w,e,e.speed*0.18)
static func sentry(w,e,engaged):
 if e.mode=="wind":
  if e.timer<=0:
   var from=Vector2(e.x,e.y+25)
   var velocity=(Vector2(e.aimX,e.aimY+20)-from).normalized()*260
   w.region().projectiles.append({"x":from.x,"y":from.y,"vx":velocity.x,"vy":velocity.y,"life":2.6,"size":7,"spore":false})
   change(e,"recover",1.35)
 elif e.mode=="recover":
  if e.timer<=0: e.alert=0;e.memory=0;change(e,"watch",0)
 elif engaged:
  e.aimX=w.p.x;e.aimY=w.p.y;e.face=sign(w.p.x-e.x)
  change(e,"wind",0.68)
 else: e.face=1 if int(w.clock/2.15)%2 else -1
static func rush(w,e,engaged):
 if e.mode=="wind":
  if e.timer<=0: change(e,"strike",0.58)
 elif e.mode=="strike":
  ground_step(w,e,e.face*e.speed*2.45*DT)
  if abs(w.p.x-e.x)<52 and abs(w.p.y-e.y)<50: w.hurt(e.x)
  if e.timer<=0: e.cooldown=2.1;change(e,"recover",1.15)
 elif e.mode=="recover":
  if e.timer<=0: change(e,"patrol",0)
 elif engaged and abs(w.p.x-e.x)<190 and abs(w.p.y-e.y)<65 and e.cooldown<=0:
  e.face=sign(w.p.x-e.x)
  change(e,"wind",0.48)
 else: patrol(w,e,e.speed*0.86)
static func threats(w):
 for h in w.region().hazards:
  h.t-=DT
  if abs(w.p.x-h.x)<h.r and w.p.y<h.y+28 and w.p.y>=h.y-8: w.hurt(h.x)
 w.region().hazards=w.region().hazards.filter(func(h):return h.t>0)
 for shot in w.region().projectiles:
  shot.x+=shot.vx*DT;shot.y+=shot.vy*DT;shot.life-=DT
  if abs(w.p.x-shot.x)<13+shot.size and abs(w.p.y+22-shot.y)<22+shot.size:
   w.hurt(shot.x);shot.life=0
 w.region().projectiles=w.region().projectiles.filter(func(shot):return shot.life>0)
