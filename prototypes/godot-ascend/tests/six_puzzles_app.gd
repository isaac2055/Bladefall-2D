extends SceneTree
const Main=preload("res://main.tscn")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func restored(c):
 return c.phase==0 and c.p.carrying==null and c.ents.all(func(e):return (e.type!="hingeArm" or e.turns==0) and (e.type!="recoilPlatform" or e.charge==0) and (e.type!="slide" or e.x==e.ox) and (e.type!="zip" or (e.state=="idle" and e.x==e.ox and e.y==e.oy)) and (e.type!="shard" or not e.get("gone",false)) and (e.type!="held" or e.solid) and (e.type!="plate" or not e.get("down",false)) and (e.type!="lantern" or (e.x==e.ox and e.y==e.oy)))
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var preserved=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/workshop-v027-preservation.json"))
 for i in range(24):
  var r=source.world.rooms[i]
  check(Codec.fingerprint(r)==preserved.rooms[r.id] and source.world.sections[i]==preserved.sections[i] and Codec.fingerprint(source.world.tapes[r.id])==preserved.tapes[r.id],"prior room, placement and recording preserved: "+r.name)
 var native=load("res://levels/world4.tscn").instantiate()
 var baseline=Authoring.baseline(source)
 check(native.get_node("Rooms").get_child_count()==30 and Codec.first_difference(baseline,native.compile_into(baseline))=="","30 native rooms compile exactly to source")
 check(native.validate_data(native.compile_into(baseline)).is_empty(),"native room validation")
 native.free()
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in range(24,30):
  var room=source.world.rooms[i]
  for index in range(room.workshopRoutes.size()):
   app.watch=false;app.load_section(i)
   app.journey=[];app.journey_frame=0
   for part in room.workshopRoutes[index].tape:
    for f in range(int(part[0])):app.journey.append(part[1])
   var prior=app.sim.deaths
   for f in range(app.journey.size()):app._physics_process(1.0/60.0)
   check(app.workshop_goal_reached() and app.sim.deaths==prior and app.workshop_completed.has(room.id),"actual application clear: "+room.workshopRoutes[index].name)
   app.retry_room();check(restored(app.sim),"retry restores phase, machinery and inventory: "+room.name)
   app.sim.die()
   for f in range(50):app._physics_process(1.0/60.0)
   check(app.sim.p.state not in ["dead","respawn"] and restored(app.sim),"death restores initial room: "+room.name)
   app.workshop_completed.erase(room.id)
   app.workshop_demo_picker.select(index);prior=app.sim.deaths;app.toggle_watch()
   for f in range(app.tape.size()):app._physics_process(1.0/60.0)
   check(app.workshop_goal_reached() and app.sim.deaths==prior and not app.workshop_completed.has(room.id),"selected Watch route clears without awarding completion: "+room.workshopRoutes[index].name)
   app.toggle_watch()
 app.restart_world();check(app.workshop_completed.is_empty(),"restart clears awards")
 app.queue_free();await process_frame
 print("SIX PUZZLES APP ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
