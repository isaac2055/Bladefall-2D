extends SceneTree
const Main=preload("res://main.tscn")
var app
func _initialize(): run.call_deferred()
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.switch_chapter(21)
 app.landscape.set_process(false)
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21-tour.json"))
 for part in tour.tape:
  for i in range(int(part[0])): app.journey.append(part[1])
 var transitions=0
 var worst=0.0
 var mismatch=false
 for i in range(tour.frames):
  var room=app.world.active_id
  var camera=app.landscape.camera_float
  app._physics_process(1.0/60)
  var state=JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.sim.freeze,app.world.frames])
  app.landscape._process([1.0/120,1.0/60,1.0/30][i%3])
  if JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.sim.freeze,app.world.frames])!=state: mismatch=true
  var distance=camera.distance_to(app.landscape.camera_float)
  worst=max(worst,distance)
  if room!=app.world.active_id:
   transitions+=1
   if distance>16: mismatch=true
  if i%120==0: await process_frame
 var ok=not mismatch and transitions==18 and app.world.frames==tour.frames and app.world.active_id=="cl21-atlas-crossroads" and app.sim.deaths==0
 print("PASS" if ok else "FAIL"," actual application road with polish · ",app.world.frames," unchanged physics frames · ",transitions," smooth ownership changes · ",app.sim.deaths," deaths · worst camera step ",snapped(worst,.01)," px")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(0 if ok else 1)
