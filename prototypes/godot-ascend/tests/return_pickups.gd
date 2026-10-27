extends SceneTree
const Main=preload("res://main.tscn")
const R=preload("res://tests/workshop_routes.gd")
const Pickups=preload("res://scripts/workshop_pickups.gd")
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func run():
 var app=Main.instantiate();app.test_mode=true;app.initial_world=4;root.add_child(app);await process_frame;app.set_physics_process(false)
 app.load_section(12)
 var tape=app.sim.room.def.workshopRoutes[0].tape
 var collected=[]
 var previous=0
 for part in tape:
  for f in range(int(part[0])):
   app.sim.step(R.decode(part[1]))
   var count=Pickups.counts(app.sim.ents)[0]
   if count>previous:collected.append([app.sim.p.x,app.sim.p.y]);previous=count
 var items=app.sim.ents.filter(func(e):return e.type=="shard")
 check(items.size()==3 and collected.size()==3,"ordinary route collects three separately placed return shards")
 check(collected[0][0]>280 and collected[1][1]<160 and collected[2][0]<200,"pickups cover the far bank, high branches and bell approach")
 check(app.sim.deaths==0 and app.workshop_goal_reached(),"all three return to the flag without deaths")
 for item in items:
  item.gone=false
  check(not app.workshop_goal_reached(),"finish rejects a missing shard at "+str([item.x,item.y]))
  app.tick_workshop()
  check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"partial return cannot bank completion")
  item.gone=true
 app.sim.room.def.workshopRequireAllShards=false
 for item in items:item.gone=false
 check(not app.workshop_goal_reached(),"single-return mode also rejects an empty-handed finish")
 items[0].gone=true
 check(app.workshop_goal_reached(),"single-return mode accepts any one of several shards")
 app.sim.room.def.workshopRequireAllShards=true
 check("1 / 3" in app.bearing_caption(),"HUD reports partial inventory")
 for item in items:item.gone=true
 check("RETURN TO THE GOLD FLAG" in app.bearing_caption(),"HUD directs the completed collection back home")
 app.tick_workshop()
 check(app.workshop_completed.has(app.sim.room.id) and app.workshop_shards.has(app.sim.room.id),"full return banks completion")
 check("All 3 shards brought home" in app.notice_label.text,"completion confirms every shard was returned")
 app.restart_world();app.load_section(12)
 check(Pickups.counts(app.sim.ents)==[0,3] and app.workshop_shards.is_empty(),"full restart clears pickups and awards")
 app.sim.ents.filter(func(e):return e.type=="shard")[0].gone=true
 app.retry_room()
 check(Pickups.counts(app.sim.ents)==[0,3],"retry resets every unbanked shard")
 app.sim.ents.filter(func(e):return e.type=="shard")[0].gone=true
 app.sim.die()
 for f in range(50):app._physics_process(1.0/60.0)
 check(Pickups.counts(app.sim.ents)==[0,3] and app.workshop_shards.is_empty(),"death resets carried shards without banking")
 app.toggle_watch()
 for f in range(app.tape.size()):app._physics_process(1.0/60.0)
 check(app.workshop_goal_reached() and app.workshop_completed.is_empty(),"demonstration collects all three without awarding player completion")
 check(not Pickups.ready({"workshopRequireAllShards":true},[]),"an all-return room with no pickups cannot auto-complete")
 app.queue_free();await process_frame
 print("RETURN PICKUPS ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
