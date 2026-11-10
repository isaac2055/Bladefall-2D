extends SceneTree
const World=preload("res://scripts/world.gd")
const Route=preload("res://scripts/affixed_route.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Connected=preload("res://tests/connected_route_inputs.gd")
const Codec=preload("res://authoring/codec.gd")
var failed=0
var chapter_override=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize():
 var args=OS.get_cmdline_user_args()
 var n=chapter_override if chapter_override>0 else int(args[0]) if not args.is_empty() else 2
 var path="user://sampler-journey-%d.json"%n
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 var run=Run.new(path)
 var raw=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
 if n==23:
  var native=Authoring.read(raw)
  var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/sampler-causeway-preservation.json"))
  for d in native.world.rooms:
   if old.has(d.id): check(Codec.fingerprint(d)==old[d.id],"original native room preserved: "+d.id)
 var w=World.new(raw)
 var shiny=args.size()>1 and args[1]=="shiny"
 if shiny:
  for base in [1,2,3]: run.profile.completed[str(base)]=true
  var plant=run.profile.garden(run.profile.home(n))
  plant.root=true;plant.top=true;plant.core=true
 run.start(w,true,shiny)
 var tape=[]
 if n==1:
  # Fixture starts at the old ending. Existing road geometry is separately checked in world_checks.gd.
  w.enter("cl1-atlas-crossroads",true)
  run.start(w)
  for id in w.data.world.requiredMainRooms: run.profile.run.visited[id]=true
  w.active().p.onGround=true
  run.tick(w)
 elif n>=101:
  tape=w.data.world.tapes[w.active_id]
 else:
  tape=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d-tour.json"%n)).tape
 var frame=0
 var diverted=false
 for part in tape:
  for f in range(int(part[0])):
   if not run.result.is_empty(): break
   if not run.ride.is_empty():
    diverted=true
    break
   w.step(Inputs.decode(part[1]))
   w.update_region()
   run.tick(w)
   frame+=1
   if n==23 and w.active_id=="cl23-puzzle-cover-take-away": diverted=true;break
  if diverted or not run.result.is_empty(): break
 if n==23:
  check(w.active_id=="cl23-puzzle-cover-take-away" and run.profile.run.cleared.has("cl23-puzzle-bridge-backwards"),"original road crosses the completed bridge into the bypass")
  for f in range(2400):
   if w.active_id=="cl23-puzzle-delivery-cannot-ride": break
   Connected.tick(w,run,"r")
  check(w.active_id=="cl23-puzzle-delivery-cannot-ride" and run.ride.is_empty(),"normal inputs walk the retired cover bypass without a cradle")
  if w.active_id=="cl23-puzzle-delivery-cannot-ride":
   check(Connected.settle_spawn(w,run),"physical bypass reaches the delivery checkpoint")
   var solved=false
   for part in w.data.world.tapes[w.active_id]:
    for f in range(int(part[0])):
     Connected.tick(w,run,part[1])
     if Route.at_goal(w.active()): solved=true;break
    if solved: break
   check(solved,"original delivery puzzle remains required and solvable")
   for f in range(1800):
    if w.active_id==w.data.world.campaignWorkshop.entry: break
    Connected.tick(w,run,"r")
 # At the old crossroads the route continues through ordinary geometry.
 if w.data.world.has("campaignWorkshop"):
  var route=w.data.world.campaignWorkshop
  check(w.active_id==route.entry,"original road reaches its junction before appended rooms")
  check(Connected.approach(w,run),"normal inputs climb the approach to the first appended checkpoint")
  for i in range(route.rooms.size()):
   var id=route.rooms[i]
   check(w.active_id==id and w.checkpoint_id==id,"physical road enters each puzzle checkpoint")
   if w.active_id!=id: break
   check(Connected.settle_spawn(w,run),"normal inputs reach the original puzzle start: "+id)
   var solved=false
   for part in w.data.world.tapes[id]:
    for f in range(int(part[0])):
     Connected.tick(w,run,part[1])
     if w.campaign_completed.has(id): solved=true;break
    if solved: break
   check(solved and run.ride.is_empty(),"original inputs complete the puzzle without transport: "+id)
   if not solved: break
   if i+1<route.rooms.size(): check(Connected.next_puzzle(w,run,route.rooms[i+1]),"walk from the flag to the next puzzle")
 check(not run.result.is_empty(),"full world completion awards a real result: "+str(n))
 if run.result.is_empty():
  print("AT ",w.active_id," deaths=",w.active().deaths," pos=",w.position()," missing required:")
  for id in w.data.world.get("requiredMainRooms",[]):
   if not run.profile.run.visited.has(id): print(id)
 else:
  check(run.result.deaths==0,"complete normal-input world has zero deaths")
  check(run.profile.board(n,"shiny" if shiny else "normal").size()==1,"one end-of-world record saved")
 if shiny and not run.result.is_empty():
  var plant=run.profile.garden(run.profile.home(n))
  check(plant.core_shiny if n>=101 else plant.flower_shiny,"carried whole-world clear upgrades reward to shiny")
 w.shutdown()
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("JOURNEY FAILURES ",failed)
 quit(1 if failed else 0)
