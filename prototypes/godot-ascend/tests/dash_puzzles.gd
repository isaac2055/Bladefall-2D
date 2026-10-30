extends SceneTree
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Devices=preload("res://scripts/causeway_devices.gd")
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Main=preload("res://main.tscn")
var failed=false
var data
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func entity(c,type,label=""):
 return c.ents.filter(func(e):return e.type==type and (label=="" or e.get("label","")==label))[0]
func replay(index,tape):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(Loader.parse(data.world.rooms[index]))
 for part in tape:
  for f in range(int(part[0])):
   c.step(R.decode(part[1]))
   if c.deaths>0:return c
 return c
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"));data=Authoring.read(source)
 var hashes=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/workshop-v025-hashes.json"))
 for room in source.world.rooms.slice(0,19):check(Codec.fingerprint(room)==hashes[room.id],"original room and recordings preserved: "+room.name)
 var native=load("res://levels/world4.tscn").instantiate()
 check(Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","all 30 native rooms match source")
 native.free()
 for i in [16,17,18]:
  var room=data.world.rooms[i];var p=R.play(data,i,room.workshopRoutes[0].tape)
  check(room.dashes==1 and not "dash" in room.lock,"normal one-dash kit: "+room.name)
  check(p.finish and p.deaths==0 and not p.advanced,"ordinary deathless solution: "+room.name)
 var first=data.world.rooms[16].workshopRoutes[0].tape
 var airborne=replay(16,first.slice(0,6))
 check(airborne.p.dashes==0 and not airborne.p.onGround,"outward launch has spent its dash before reaching the lid")
 var landed=replay(16,first.slice(0,8))
 check(landed.p.onGround and landed.p.dashes==1 and landed.standing(entity(landed,"hingeArm")),"landing on the removable arm restores the final dash")
 var opened=replay(16,first.slice(0,9))
 check(entity(opened,"hingeArm").dir=="down" and opened.p.dashes==1,"folding the refill landing retains the recovered dash")
 check(not R.play(data,16,first,"no_turn").finish,"the intact lid blocks the exit route")
 var second=data.world.rooms[17].workshopRoutes[0].tape
 var initial=replay(17,[[10,""]])
 check(Devices.obstruction(initial,entity(initial,"hingeArm"),Devices.pose(entity(initial,"hingeArm"),"down"))=="solid","initial stone physically blocks the next arm pose")
 var docked=replay(17,second.slice(0,3))
 check(entity(docked,"slide").x==344 and Devices.obstruction(docked,entity(docked,"hingeArm"),Devices.pose(entity(docked,"hingeArm"),"down"))==null,"right dock both clears the arm and parks a shaft landing")
 var refill=replay(17,second.slice(0,19))
 check(refill.p.dashes==1 and refill.p.onGround and refill.standing(entity(refill,"slide")),"the shaft entry dash is recovered by landing on the repositioned stone")
 var folded=replay(17,second.slice(0,14))
 for pose in ["left","up","right"]:
  check(Devices.obstruction(folded,entity(folded,"hingeArm"),Devices.pose(entity(folded,"hingeArm"),pose))==null,"service clearance allows recovery through arm pose: "+pose)
 var mistakes=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/dash-puzzle-mistakes.json"))
 var wrong=replay(17,mistakes.wrongDock)
 check(wrong.deaths==0 and entity(wrong,"slide").x==200 and Devices.obstruction(wrong,entity(wrong,"hingeArm"),Devices.pose(entity(wrong,"hingeArm"),"down"))==null,"wrong left dock also clears the arm but leaves no stone inside the shaft")
 var recovered=replay(17,mistakes.recoverDock)
 check(recovered.deaths==0 and entity(recovered,"slide").x==344,"wrong left dock can be re-shoved to the useful dock without dying or resetting")
 var missing=replay(17,mistakes.wrongDockAttempt)
 check(entity(missing,"hingeArm").dir=="down" and missing.deaths==1 and not R.at_goal(missing),"the same open-shaft attempt fails when the stone was left at the wrong dock")
 var third=data.world.rooms[18].workshopRoutes[0].tape
 var delivered=replay(18,third.slice(0,11))
 check(entity(delivered,"recoilPlatform").loadedBy=="lantern" and entity(delivered,"recoilPlatform").charge==24,"delivered lantern keeps the remote plate lowered")
 check(Devices.obstruction(delivered,entity(delivered,"hingeArm","A"),Devices.pose(entity(delivered,"hingeArm","A"),"right"))==null,"lantern load clears the first exit-arm turn")
 check(Devices.obstruction(delivered,entity(delivered,"hingeArm","A"),Devices.pose(entity(delivered,"hingeArm","A"),"down"))=="arm","cargo bridge still blocks the second exit-arm turn")
 var remote=replay(18,third.slice(0,31))
 check(entity(remote,"hingeArm","A").dir=="down" and entity(remote,"hingeArm","B").dir=="up" and entity(remote,"recoilPlatform").loadedBy=="lantern" and remote.p.x<=120,"both remote turns require leaving the delivered weight across the removed bridge")
 var empty=replay(18,[[10,""],[19,"r"],[6,""],[5,"j"],[1,"us"],[20,""]])
 check(entity(empty,"hingeArm","A").dir=="up" and entity(empty,"hingeArm","A").jamReason=="solid","unloaded plate physically jams the exit arm")
 for pair in [[16,4],[16,9],[17,16],[17,20],[18,19],[18,52]]:
  var w=R.timing_window(data,pair[0],pair[1],3)
  check(w.size()>=3,"nearby successful timings: "+str(pair)+" "+str(w))
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in [16,17,18]:
  app.watch=false;app.load_section(i);var room=app.sim.room.def
  app.journey=[];app.journey_frame=0
  for part in room.workshopRoutes[0].tape:
   for f in range(int(part[0])):app.journey.append(part[1])
  for f in range(app.journey.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==0 and app.workshop_completed.has(room.id),"actual application clear and award: "+room.name)
  app.retry_room()
  check(app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.charge==0) and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.turns==0) and app.sim.p.carrying==null,"retry restores machinery and inventory: "+room.name)
  app.sim.die()
  for f in range(50):app._physics_process(1.0/60.0)
  check(app.sim.p.state not in ["dead","respawn"] and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.turns==0),"death restores initial poses: "+room.name)
  var prior=app.sim.deaths;app.toggle_watch()
  for f in range(app.tape.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==prior,"watch completes the normal-dash route: "+room.name)
  app.toggle_watch()
 app.restart_world();check(app.workshop_completed.is_empty(),"restart clears all awards")
 app.queue_free();await process_frame
 print("DASH PUZZLES ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
