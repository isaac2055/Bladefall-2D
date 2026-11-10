extends RefCounted
const Inputs=preload("res://tests/workshop_routes.gd")
static func tick(w,run,keys):
 var deaths=w.active().deaths
 w.step(Inputs.decode(keys));w.update_region();run.tick(w)
 if w.active().deaths>deaths: print("INPUT DEATH ",w.active_id," ",w.active().p.x," ",w.active().p.y," keys ",keys)
static func approach(w,run):
 var route=w.data.world.campaignWorkshop
 var waypoint=0
 var jump_left=0
 for f in range(2400):
  if w.active_id==route.rooms[0]: return true
  var keys="r"
  var core=w.active()
  if core.room.def.get("roadStair",false):
   var points=core.room.def.roadWaypoints
   while waypoint<points.size() and w.position().y+core.p.h<=points[waypoint][1]*8+2 and absf(w.position().x+4-points[waypoint][0]*8)<20: waypoint+=1
   if waypoint<points.size():
    var dx=points[waypoint][0]*8-w.position().x-4
    keys="r" if dx>3 else "l" if dx< -3 else ""
  if core.room.id==route.entry:
   var mouth=w.rectangles["bladefall-road-stair-%d"%int(w.data.world.n)]
   if w.position().x>=mouth.position.x+48: keys="lgu";jump_left=0
  if keys!="lgu" and (core.room.id==route.entry or core.room.def.get("roadStair",false)):
   if core.p.onGround and jump_left<=0 and not core.prev.get("jump",false): jump_left=15
   if jump_left>0: keys+="j";jump_left-=1
  tick(w,run,keys)
 return false
static func settle_spawn(w,run):
 var core=w.active()
 var spawn=core.room.spawn
 var approach=core.room.def.has("roadEntrance") and not w.road_entered.has(core.room.id)
 var staged=not approach
 for f in range(1200):
  core=w.active()
  var target=spawn.x if staged else maxf(0,spawn.x-16)
  var dx=target-core.p.x
  if absf(dx)<.1 and absf(core.p.vx)<.1 and core.p.onGround:
   if not staged:
    # Walk the last tiles slowly, including checkpoints beside authored thorns.
    for pulse in range(80):
     if core.p.x>=spawn.x: break
     tick(w,run,"r")
     for idle in range(4): tick(w,run,"")
    staged=true
    continue
   if is_equal_approx(absf(core.p.remX),.5):
    tick(w,run,"l" if core.p.remX>0 else "r")
    for idle in range(4): tick(w,run,"")
   else: tick(w,run,"")
   return absf(core.p.x-spawn.x)<.1
  var aim=dx-core.p.vx*absf(core.p.vx)/(2*float(core.K.runReduce))
  tick(w,run,"r" if aim>.25 else "l" if aim< -.25 else "")
 return false
static func next_puzzle(w,run,target):
 for f in range(1600):
  if w.active_id==target: return true
  tick(w,run,"r")
 var core=w.active()
 print("ROAD BLOCKER ",core.room.id," ",core.p.x," ",core.p.y," index=",w.blocker(core,core.p.x+1,core.p.y,core.p.w,core.p.h,-1))
 for id in w.nearby(Rect2(w.position(),Vector2(24,24))):
  for e in w.cores[id].ents:
   if w.cores[id].solid_entity(e) and Rect2(w.placements[id]+Vector2(e.x,e.y),Vector2(e.w,e.h)).intersects(Rect2(w.position(),Vector2(24,24))): print("OBSTRUCTION ",id," ",e)
 return false
