extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Route=preload("res://scripts/affixed_route.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var failed=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize(): run.call_deferred()
func run():
 var path="user://sampler-test-%d.json"%Time.get_ticks_usec()
 var tracker=Run.new(path)
 for n in [1,2,3,21,22,23,101,102,103]:
  var raw=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
  var w=World.new(raw)
  tracker.start(w)
  check(w.active_id==w.data.world.atlasStart,"world starts at its original spawn: "+str(n))
  if n in [1,2,3,23]:
   var route=w.data.world.campaignWorkshop
   check(route.rooms.size()==(5 if n==23 else 10),"all approved appended rooms present: "+str(n))
   check(route.walks.size()==route.rooms.size(),"each appended puzzle has a connected gallery")
   for id in route.rooms:
    var d=w.parsed[id].def
    var core=Core.new(raw.constants,raw.playerDefaults)
    core.load_room(Loader.parse(d))
    var goal=false
    for part in w.data.world.tapes.get(id,[]):
     for frame in range(int(part[0])):
      core.step(Inputs.decode(part[1]))
      goal=goal or Route.at_goal(core)
    check(goal and core.deaths==0,"approved route still clears: "+id)
   # Completion extraction and gallery descent really change world ownership and checkpoint.
   w.enter(route.entry,true)
   tracker.start(w)
   tracker.tick(w)
   check(not tracker.ride.is_empty(),"automatic hoist at old world ending")
   var limit=0
   while not tracker.ride.is_empty() and limit<20000:
    tracker.tick(w)
    limit+=1
   check(w.active_id==route.rooms[0] and w.checkpoint_id==route.rooms[0],"one uninterrupted ride arrives at the puzzle checkpoint")

  if n in [21,22,23]:
   var count=0
   for d in w.data.world.rooms:
    if d.get("puzzleStudy",false) and not d.id in w.data.world.get("retiredSamplerRooms",[]): count+=1
   check(count=={21:9,22:9,23:10}[n],"accepted Fractured additions: "+str(count))
  # An arbitrary room jump cannot accidentally earn a reward.
  tracker.invalidate()
  check(tracker.profile.finish().is_empty(),"practice is ineligible: "+str(n))
  w.shutdown()
 var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world101.json")))
 tracker.profile.garden(1).core=true
 tracker.start(w,true,true)
 w.active().core_run.index=2
 w.active().die()
 tracker.tick(w)
 while tracker.failure_frames>0: tracker.tick(w)
 check(w.active().core_run.index==-1 and not tracker.carrying(),"shiny death clears Core checkpoint and drops reward")
 tracker.start(w,true,true)
 w.active().core_run.index=1
 tracker.retry(w)
 check(w.active().core_run.index==-1 and not tracker.carrying(),"shiny Retry resets whole Core")
 tracker.start(w)
 w.active().core_run.index=1
 tracker.retry(w)
 check(w.active().core_run.index==1,"ordinary Retry retains Core checkpoint")
 check(tracker.profile.garden(1).core,"failed shiny attempts keep permanent reward")
 w.shutdown()
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("SAMPLER FAILURES ",failed)
 quit(1 if failed else 0)
