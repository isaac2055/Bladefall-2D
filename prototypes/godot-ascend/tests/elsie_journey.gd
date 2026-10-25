extends SceneTree
const Main=preload("res://main.tscn")
func _initialize(): run.call_deferred()
func run():
 var app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.switch_chapter(2)
 app.world.restart()
 app.audio.restart_world()
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/elsie-tour.json"))
 app.load_section(app.world.regions.find(tour.start_room))
 for part in tour.tape:
  for i in range(int(part[0])): app.journey.append(part[1])
 for i in range(int(tour.frames)): app._physics_process(1.0/60.0)
 var ok=app.world.quest_complete and not app.world.quest_lantern and app.world.active_id=="cl2-w2-kitchen" and app.sim.deaths==0 and app.world.frames==tour.frames and app.audio.heard.has("refuge:done") and not app.audio.heard.has("refuge:line1")
 print("PASS" if ok else "FAIL"," full Elsie quest through application · ",tour.frames," frames · ",app.sim.deaths," deaths · heart ",app.world.quest_complete," · closing recording queued without a stale carry reminder ",app.audio.heard.has("refuge:done"))
 app.queue_free()
 await process_frame
 await create_timer(0.15).timeout
 quit(0 if ok else 1)
