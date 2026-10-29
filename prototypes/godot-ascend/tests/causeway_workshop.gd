extends SceneTree
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var failed=false
var checks=[]
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);checks.append({"passed":bool(ok),"label":label});failed=failed or not ok
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"));var data=Authoring.read(source)
 check(data.world.rooms.size()==19,"Causeway introductions remain available among nineteen workshop rooms")
 var native=load("res://levels/world4.tscn").instantiate()
 check(Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","native roundtrip preserves Causeway mechanism definitions")
 native.free()
 for i in [13,14,15]:
  var room=data.world.rooms[i];var tape=room.workshopRoutes[0].tape;var p=R.play(data,i,tape)
  check(p.finish and p.deaths==0 and not p.advanced,"deathless ordinary solution: "+room.name)
  check(room.workshopBiome=="causeway" and room.dashes==0,"Causeway identity and explicit no-dash study: "+room.name)
  if i!=14:
   check(p.events.filter(func(e):return e.kind=="recoil-jump").size()==2,"two recovered recoil launches: "+room.name)
   check(not R.play(data,i,tape,"no_load").finish,"recorded route fails without storing force: "+room.name)
   check(not R.play(data,i,tape,"no_boost").finish,"recorded route needs shared lift momentum: "+room.name)
  if i!=13:
   check(p.events.any(func(e):return e.kind=="hinge-turn"),"hub changes the traversal surface: "+room.name)
   check(not R.play(data,i,tape,"no_turn").finish,"recorded route fails without turning the arm: "+room.name)
 for pair in [[13,3],[13,8],[14,4],[15,3],[15,8],[15,11]]:
  var timings=R.timing_window(data,pair[0],pair[1],4)
  check(timings.size()>=4,"several nearby successful timings: "+data.world.rooms[pair[0]].name+" "+str(timings))
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in [13,14,15]:
  app.watch=false;app.load_section(i)
  var room=app.sim.room.def
  # Feed ordinary inputs through the actual live application, not only core replay.
  app.journey=[];app.journey_frame=0
  for part in room.workshopRoutes[0].tape:
   for f in range(int(part[0])):app.journey.append(part[1])
  for f in range(app.journey.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==0 and app.workshop_completed.has(room.id),"actual application awards the clear: "+room.name)
  check(app.landscape.causeway and not app.landscape.forest,"Causeway rendering selected: "+room.name)
  app.retry_room()
  check(app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.charge==0 and e.state=="idle"),"retry clears stored force: "+room.name)
  check(app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.dir=="up"),"retry restores upright arms: "+room.name)
  app.sim.die()
  for f in range(50):app._physics_process(1.0/60.0)
  check(app.sim.p.state not in ["dead","respawn"] and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.dir=="up"),"death restores the checkpoint machinery: "+room.name)
  app.toggle_watch()
  for f in range(app.tape.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached(),"demonstration completes: "+room.name)
  app.toggle_watch()
 app.load_section(8)
 check(app.landscape.forest and not app.landscape.causeway,"switching back restores Woods rendering")
 app.load_section(0)
 check(not app.landscape.forest and not app.landscape.causeway,"switching back restores Outskirts rendering")
 app.queue_free();await process_frame
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(checks,"  "))
 print("CAUSEWAY WORKSHOP ","FAILED" if failed else "PASSED"," · ",checks.size()," checks");quit(1 if failed else 0)
