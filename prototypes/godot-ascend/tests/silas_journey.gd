extends SceneTree
const Main=preload("res://main.tscn")
func _initialize(): run.call_deferred()
func run():
 var app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.switch_chapter(3)
 app.world.restart()
 app.audio.restart_world()
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/silas-tour.json"))
 app.load_section(app.world.regions.find(tour.start_room))
 for part in tour.tape:
  for i in range(int(part[0])): app.journey.append(part[1])
 for i in range(int(tour.frames)): app._physics_process(1.0/60.0)
 var w=app.world
 var ok=w.quest_complete and not w.quest_key and w.heart_count()==1 and app.sim.deaths==0 and w.frames==tour.frames and app.audio.heard.has("defector:line0") and app.audio.heard.has("defector:line1")
 print("PASS" if ok else "FAIL"," full Silas quest through application · ",tour.frames," normal-input frames · ",app.sim.deaths," deaths · hearts ",w.heart_count())
 ok=ok and app.audio.heard.has("defector:done") and app.audio.active_voice.get("id")==app.audio.manifest.voices["defector:done"].id
 for line in app.audio.voice_queue:
  if line.id==app.audio.manifest.voices["defector:line1"].id: ok=false
 print("PASS" if ok else "FAIL"," hook hand-in replaces the stale carry instruction with the existing closing recording")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(0 if ok else 1)
