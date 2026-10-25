extends RefCounted
## Test-only controller: explores short input sequences against the real native simulation.
## It never writes player coordinates, grants abilities, removes enemies, or changes geometry.
var world
var recorded=[]
const GLOBALS=["stage","p","prev","clock","deaths","bearings","chart","mara_asked","weapon","mantle","checkpoint","flags","dead_time","rowan","elsie","moth_perch","moth_t","moth_from","moth","lantern_held","lantern","log_hits","bell_held","quest_cue","quest_time","ride","beam","bram_follow","bram_done","frame","kill_count"]
func _init(runtime): world=runtime
func snapshot():
 var result={"vars":{},"regions":[]}
 for name in GLOBALS:
  var value=world.get(name)
  result.vars[name]=value.duplicate(true) if value is Dictionary or value is Array else value
 for r in world.regions:
  var row={"time":r.time,"visited":r.visited,"end":r.get("draft_end",false),"hazards":r.hazards.duplicate(true),"projectiles":r.projectiles.duplicate(true),"objects":[],"enemies":r.enemies.duplicate(true),"npcs":r.npcs.duplicate(true),"pickups":r.pickups.duplicate(true)}
  for o in r.obstacles: row.objects.append([o.x,o.get("y",0),o.gone,o.t,o.get("aligned",false),o.get("released",false),o.get("usedUntil",0)])
  result.regions.append(row)
 return result
func restore(snapshot):
 for name in GLOBALS:
  var value=snapshot.vars[name]
  world.set(name,value.duplicate(true) if value is Dictionary or value is Array else value)
 for i in range(world.regions.size()):
  var r=world.regions[i]
  var saved=snapshot.regions[i]
  r.time=saved.time;r.visited=saved.visited;r.draft_end=saved.end
  r.hazards=saved.hazards.duplicate(true)
  r.projectiles=saved.projectiles.duplicate(true)
  r.enemies=saved.enemies.duplicate(true)
  r.npcs=saved.npcs.duplicate(true)
  r.pickups=saved.pickups.duplicate(true)
  for n in range(r.obstacles.size()):
   var o=r.obstacles[n]
   var s=saved.objects[n]
   o.x=s[0];o.y=s[1];o.gone=s[2];o.t=s[3];o.aligned=s[4];o.released=s[5];o.usedUntil=s[6]
func reached(target): return abs(world.p.x-target.x)<22 and abs(world.p.y-target.y)<7 and world.p.onGround
func score(target):
 if world.p.dead: return -1000000.0
 var distance=abs(target.x-world.p.x)+abs(target.y-world.p.y)*1.7
 var risk=(5-world.p.blood)*1800+world.deaths*10000
 return -distance-risk+(30 if reached(target) else 0)
func go(target,max_frames=600):
 var used=0
 var last_best=-1000000.0
 var stuck=0
 while used<max_frames:
  if reached(target): return true
  var direct=false
  if world.p.onGround and abs(world.p.y-target.y)<7:
   if abs(world.p.x-target.x)<80: direct=true
   else:
    direct=true
    var dir=sign(target.x-world.p.x)
    for n in range(1,7):
     var x=world.p.x+dir*n*28
     var floor=world.floor_at(x,world.p.y+2)
     if floor.id<0 or abs(floor.y-world.p.y)>2: direct=false;break
     for zone in world.region().authored.get("blight",[]):
      if x>zone[0] and x<zone[1] and world.p.y<zone[2]: direct=false
    for e in world.region().enemies:
     if not e.dead and abs(e.x-world.p.x)<400: direct=false
  if direct:
   var raw={"right":target.x>world.p.x,"left":target.x<world.p.x}
   world.step(raw)
   recorded.append(raw)
   used+=1
   continue
  var origin=snapshot()
  var beam=[{"state":origin,"path":[],"score":score(target)}]
  var options=[]
  var direction="right" if target.x>=world.p.x else "left"
  var opposite="left" if direction=="right" else "right"
  for raw in [{direction:true},{direction:true,"jump":true},{}, {opposite:true}]: options.append(raw)
  if world.weapon: options.append({direction:true,"interact":true,"attack":true});options.append({direction:true,"attack":true})
  var selected={}
  for depth in range(6):
   var candidates=[]
   var bins={}
   for node in beam:
    for raw in options:
     restore(node.state)
     var count=40 if raw.get("jump",false) and world.p.onGround and not world.prev.get("jump",false) else 8
     var done=false
     var simulated=0
     for i in range(count):
      world.step(raw)
      simulated+=1
      if reached(target) and world.p.blood==origin.vars.p.blood:
       done=true
       break
     if world.p.dead: continue
     var value=score(target)
     var key=str(roundi(world.p.x/12))+":"+str(roundi(world.p.y/12))+":"+str(roundi(world.p.vy/100))+":"+str(world.p.onGround)+":"+str(raw.get("jump",false))
     if bins.has(key) and bins[key]>=value: continue
     bins[key]=value
     var path=node.path.duplicate()
     path.append({"input":raw,"count":simulated})
     candidates.append({"state":snapshot(),"path":path,"score":value,"done":done})
   if candidates.is_empty(): break
   candidates.sort_custom(func(a,b):return a.score>b.score)
   var finished=candidates.filter(func(c):return c.done)
   if not finished.is_empty():
    selected=finished[0]
    break
   beam=candidates.slice(0,6)
   selected=beam[0]
  restore(origin)
  if selected.is_empty(): return false
  if selected.score<=last_best+1: stuck+=1
  else: stuck=0
  last_best=max(last_best,selected.score)
  if stuck>35:
   print("STUCK target ",target," at ",world.point()," blood ",world.p.blood)
   return false
  var raw=selected.path[0].input
  for i in range(int(selected.path[0].count)):
   world.step(raw)
   recorded.append(raw)
   used+=1
   if reached(target): return true
 return false
