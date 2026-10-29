extends SceneTree
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Device=preload("res://scripts/causeway_devices.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var failed=false
var checks=[]
var data
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);checks.append({"passed":bool(ok),"label":label});failed=failed or not ok
func replay(index,tape):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(Loader.parse(data.world.rooms[index]))
 for part in tape:
  for f in range(int(part[0])):
   c.step(R.decode(part[1]))
   if c.deaths>0:return c
 return c
func arm(c,label="A"):return c.ents.filter(func(e):return e.type=="hingeArm" and e.label==label)[0]
func plate(c):return c.ents.filter(func(e):return e.type=="recoilPlatform")[0]
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"));data=Authoring.read(source)
 var hashes=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/workshop-v023-hashes.json"))
 for room in source.world.rooms.filter(func(r):return hashes.has(r.id)):check(Codec.fingerprint(room)==hashes[room.id],"prior room and recordings preserved: "+room.name)
 var native=load("res://levels/world4.tscn").instantiate()
 check(Codec.first_difference(Authoring.baseline(source),native.compile_into(Authoring.baseline(source)))=="","all retained native rooms roundtrip")
 native.free()
 for i in [13,14,15]:
  var room=data.world.rooms[i];var p=R.play(data,i,room.workshopRoutes[0].tape)
  check(p.finish and p.deaths==0 and not p.advanced,"ordinary deathless puzzle solution: "+room.name)
 var first=data.world.rooms[13].workshopRoutes[0].tape
 var outward=replay(13,first.slice(0,6))
 check(R.carried(outward) and arm(outward).dir=="right","bridge reaches the far shard before it is removed")
 var dropped=replay(13,first.slice(0,10))
 check(arm(dropped).dir=="down" and dropped.p.onGround and dropped.p.y+dropped.p.h==plate(dropped).y,"removing the borrowed bridge drops the player onto its spring")
 var wrong=first.slice(0,6)+[[25,"r"],[30,""],[52,"l"],[15,""],[20,"lj"],[30,"lgu"],[10,""],[30,"d"],[12,""],[40,"lj"],[20,""],[30,"d"],[12,""],[40,"lj"],[20,""]]
 var roof=replay(13,wrong)
 check(roof.deaths==0 and R.carried(roof) and arm(roof).dir=="right" and not R.at_goal(roof),"a real return below the intact bridge keeps the shard but cannot launch home")
 var wrong_a=replay(14,[[10,""],[5,"l"],[10,""],[1,"us"],[20,""],[1,"us"]])
 check(arm(wrong_a).dir=="right" and arm(wrong_a).jamReason=="arm","A first makes its next turn jam against B")
 check(Device.obstruction(wrong_a,arm(wrong_a,"B"),Device.pose(arm(wrong_a,"B"),"up"))=="arm","the same wrong first turn also prevents B from advancing")
 var bypass=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-puzzle-bypass.json"))
 var former=data.duplicate(true);former.world.rooms[14]=bypass.room
 check(R.play(former,14,bypass.tape).finish,"positive control reproduces the solver-discovered rest-pad climb")
 check(not R.play(data,14,bypass.tape).finish,"one-way rest pad rejects the discovered finish without B's climb")
 var second=data.world.rooms[14].workshopRoutes[0].tape
 var stopped=replay(14,second.slice(0,7)+second.slice(9,20))
 check(arm(stopped,"B").dir=="up" and arm(stopped).dir=="up" and arm(stopped).jamReason=="arm","stopping B at its useful upright pose still blocks A")
 var staged=replay(14,second.slice(0,25))
 check(arm(staged).dir=="left" and arm(staged,"B").dir=="right","temporary right-facing B lets A reach its left bridge")
 var shelf=replay(14,second.slice(0,29))
 check(R.carried(shelf) and arm(shelf).dir=="left" and arm(shelf,"B").dir=="right","A's left bridge enables the shard visit before B's final climb")
 var last=data.world.rooms[15].workshopRoutes[0].tape
 var weighted=replay(15,last.slice(0,10))
 var lantern=weighted.ents.filter(func(e):return e.type=="lantern")[0]
 check(weighted.p.x<120 and plate(weighted).charge==24 and plate(weighted).loadedBy=="lantern" and lantern.y+lantern.h==plate(weighted).y,"lantern holds the lowered plate while the player stands at the distant hub")
 var clear=replay(15,last.slice(0,14))
 check(arm(clear).dir=="down" and arm(clear).turns==2 and plate(clear).charge==24,"the remote weight permits both required clockwise turns")
 var self_load=replay(15,[[10,""],[8,"l"],[10,""],[1,""],[24,"lj"],[30,""],[30,"d"],[1,"l"],[44,"l"],[20,""],[1,"us"],[20,""],[1,"us"],[20,""]])
 check(plate(self_load).charge==0 and arm(self_load).dir=="up" and arm(self_load).jamReason=="solid","loading yourself and walking to the hub returns the plate and jams the turn")
 for pair in [[13,8],[13,11],[14,2],[14,6],[14,20],[15,7],[15,11],[15,19]]:
  var w=R.timing_window(data,pair[0],pair[1],4)
  check(w.size()>=4,"nearby successful timings: "+data.world.rooms[pair[0]].name+" "+str(w))
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in [13,14,15]:
  app.watch=false;app.load_section(i);var room=app.sim.room.def
  app.journey=[];app.journey_frame=0
  for part in room.workshopRoutes[0].tape:
   for f in range(int(part[0])):app.journey.append(part[1])
  for f in range(app.journey.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==0 and app.workshop_completed.has(room.id),"actual application clear: "+room.name)
  app.retry_room()
  check(not R.carried(app.sim) and app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.charge==0),"retry clears inventory and stored force: "+room.name)
  app.sim.die()
  for f in range(50):app._physics_process(1.0/60.0)
  check(app.sim.p.state not in ["dead","respawn"] and arm(app.sim).dir=="up","death restores the initial machine puzzle: "+room.name)
  var deaths_before_watch=app.sim.deaths
  app.toggle_watch()
  for f in range(app.tape.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==deaths_before_watch,"demonstration completes: "+room.name)
  app.toggle_watch()
 app.restart_world()
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"restart clears every puzzle award")
 app.queue_free();await process_frame
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify(checks,"  "))
 print("CAUSEWAY PUZZLES ","FAILED" if failed else "PASSED"," · ",checks.size()," checks");quit(1 if failed else 0)
