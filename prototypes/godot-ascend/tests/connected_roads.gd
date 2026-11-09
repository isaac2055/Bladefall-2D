extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Route=preload("res://scripts/affixed_route.gd")
const Connected=preload("res://tests/connected_route_inputs.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var failed=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func tick(w,run,keys):
 w.step(Inputs.decode(keys));w.update_region();run.tick(w)
func _initialize(): run.call_deferred()
func run():
 var path="user://connected-roads-%d.json"%OS.get_process_id()
 var tracker=Run.new(path)
 for n in [1,2,3,23]:
  var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
  var route=w.data.world.campaignWorkshop
  check(route.geometry and route.rooms.size()==(5 if n==23 else 10),"all approved rooms form the connected road: "+str(n))
  w.enter(route.entry,true);tracker.start(w)
  var f=0
  var disjoint=true
  for id in route.rooms:
   for other in w.regions:
    if other in route.rooms or other in route.walks or other.begins_with("bladefall-road-stair"): continue
    if w.rectangles[id].intersects(w.rectangles[other]): disjoint=false;print("OVERLAP ",id," ",other)
  check(disjoint,"new rooms preserve all existing road/secret/passage footprints")
  check(Connected.approach(w,tracker) and tracker.ride.is_empty() and w.active().deaths==0,"normal-input staircase reaches first puzzle: "+str(n))
  for i in range(route.rooms.size()):
   var id=route.rooms[i]
   w.enter(id,true);tracker.start(w)
   var solved=false
   for part in w.data.world.tapes[id]:
    for frame in range(int(part[0])):
     tick(w,tracker,part[1])
     if w.campaign_completed.has(id): solved=true;break
    if solved: break
   check(solved and w.active().deaths==0,"original puzzle inputs still solve: "+id)
   if not solved: print("SOLVE BLOCKED ",id," ",w.active_id," ",w.active().p.x," ",w.active().p.y," deaths ",w.active().deaths)
   if i+1<route.rooms.size():
    f=0
    var target=route.rooms[i+1]
    var checkpoint_stable=true
    while w.active_id!=target and f<900:
     tick(w,tracker,"r");f+=1
     if w.active_id!=target and w.checkpoint_id!=id: checkpoint_stable=false
    check(w.active_id==target and w.checkpoint_id==target and checkpoint_stable and tracker.ride.is_empty(),"walk from completed flag to next individual checkpoint: "+id)
    if w.active_id!=target: print("EXIT BLOCKED ",id," ",w.active_id," ",w.active().p.x," ",w.active().p.y)
   check(tracker.ride.is_empty(),"no automatic cradle: "+id)
  w.shutdown()
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("CONNECTED ROADS FAILURES ",failed)
 quit(1 if failed else 0)
