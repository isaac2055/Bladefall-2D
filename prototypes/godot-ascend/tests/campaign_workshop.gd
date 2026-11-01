extends SceneTree
const Main=preload("res://main.tscn")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
var failed=false
func _initialize(): run.call_deferred()
func check(ok,message):
 print("PASS " if ok else "FAIL ",message)
 failed=failed or not ok
func load_id(app,id):
 app.watch=false
 for i in range(app.data.world.rooms.size()):
  if app.data.world.rooms[i].id==id: app.load_section(i);return
 check(false,"missing destination "+id)
func run():
 Input.use_accumulated_input=false
 var workshop=Authoring.read(JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json")))
 var original_hash=FileAccess.get_sha256("res://levels/world1.tscn")
 var app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 for number in [1,2,3]:
  app.switch_chapter(number)
  var base=Authoring.read(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number)))
  var route=app.data.world.campaignWorkshop
  check(route.entry=="cl%d-atlas-crossroads"%number,"extension begins at the actual final crossroads in world %d"%number)
  check(route.rooms.size()==10 and app.data.world.rooms.size()==base.world.rooms.size()+10,"ten appended rooms in world %d"%number)
  check(app.data.world.sections.slice(0,base.world.sections.size())==base.world.sections,"existing section placements preserved in world %d"%number)
  for i in range(base.world.rooms.size()): check(Codec.first_difference(base.world.rooms[i],app.data.world.rooms[i])=="","existing native definition preserved "+base.world.rooms[i].id)
  for id in base.world.tapes: check(Codec.first_difference(base.world.tapes[id],app.data.world.tapes[id])=="","existing tape preserved "+id)
  load_id(app,route.entry)
  for f in range(30): app._physics_process(1.0/60.0)
  app.campaign_up_held=false
  var key=InputEventKey.new()
  key.physical_keycode=KEY_UP
  key.keycode=KEY_UP
  key.pressed=true
  Input.parse_input_event(key)
  app._physics_process(1.0/60.0)
  key=key.duplicate()
  key.pressed=false
  Input.parse_input_event(key)
  check(app.sim.room.id==route.rooms[0],"crossroads enters first room in world %d"%number)
  for i in range(route.rooms.size()):
   var id=route.rooms[i]
   check(app.sim.room.id==id,"finish link enters "+id)
   var source=workshop.world.rooms.filter(func(room):return room.id==id)[0]
   check(app.world.rectangles.keys().all(func(other):return other==id or not app.world.rectangles[id].intersects(app.world.rectangles[other])),"extension placement overlaps no existing room: "+id)
   var imported=app.sim.room.def.duplicate(true)
   imported.erase("campaignWorkshop")
   check(Codec.first_difference(source,imported)=="","approved layout and finish rules unchanged "+id)
   app.campaign_travel({})
   app.campaign_travel({"u":true})
   check(app.sim.room.id==id,"Up cannot skip unsolved room "+id)
   app.journey=[]
   app.journey_frame=0
   for part in app.data.world.tapes[id]:
    for f in range(int(part[0])): app.journey.append(part[1])
   var deaths=app.sim.deaths
   for f in range(app.journey.size()): app._physics_process(1.0/60.0)
   check(app.workshop_goal_reached() and app.sim.deaths==deaths and app.world.campaign_completed.has(id),"deathless actual campaign clear "+id)
   check(app.landscape.target_camera().x>=app.world.placements[id].x and app.landscape.target_camera().y>=app.world.placements[id].y,"camera stays within imported room "+id)
   if source.get("workshopRequireAllShards",false):
    var shard=app.sim.ents.filter(func(e):return e.type=="shard")[0]
    shard.gone=false
    app.campaign_travel({})
    app.campaign_travel({"u":true})
    check(app.sim.room.id==id and not app.workshop_goal_reached(),"missing one return item blocks finish "+id)
    shard.gone=true
   app.campaign_travel({})
   app.campaign_travel({"u":true})
   var target=route.rooms[i+1] if i+1<route.rooms.size() else route.entry
   check(app.sim.room.id==target,"solved flag continues to "+target)
   app.campaign_travel({"u":true})
   check(app.sim.room.id==target,"holding Up cannot skip or bounce "+target)
  check(app.world.campaign_completed.size()==10,"world %d records all ten independent clears"%number)
  app.world.campaign_completed.clear()
  for id in route.rooms:
   load_id(app,id)
   var routes=app.sim.room.def.workshopRoutes
   for demo in range(routes.size()):
    app.watch=false
    app.workshop_demo_picker.select(demo)
    app.toggle_watch()
    var deaths=app.sim.deaths
    for f in range(app.tape.size()): app._physics_process(1.0/60.0)
    check(app.workshop_goal_reached() and app.sim.deaths==deaths and app.world.campaign_completed.is_empty(),"campaign demonstration without awards: "+id+" / "+routes[demo].name)
    app.toggle_watch()
  var return_id=route.rooms.filter(func(id):return workshop.world.rooms.filter(func(room):return room.id==id)[0].get("workshopRequireShard",false))[0]
  load_id(app,return_id)
  check(not app.sim.ents.any(func(e):return e.type=="shard" and e.get("gone",false)),"reenter resets returned pickups "+return_id)
  var shard=app.sim.ents.filter(func(e):return e.type=="shard")[0]
  shard.gone=true
  app.retry_room()
  check(not app.sim.ents.any(func(e):return e.type=="shard" and e.get("gone",false)),"retry does not bank return pickups "+return_id)
  app.sim.ents.filter(func(e):return e.type=="shard")[0].gone=true
  app.sim.die()
  for f in range(50): app._physics_process(1.0/60.0)
  check(not app.sim.ents.any(func(e):return e.type=="shard" and e.get("gone",false)),"death does not bank return pickups "+return_id)
  app.restart_world()
  check(app.world.campaign_completed.is_empty(),"world restart clears only its campaign completion")
 check(app.workshop_completed.is_empty() and app.workshop_shards.is_empty(),"campaign clears do not award practice chapter")
 check(FileAccess.get_sha256("res://levels/world1.tscn")==original_hash,"user native world 1 scene untouched")
 app.queue_free()
 await process_frame
 print("CAMPAIGN WORKSHOP ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
