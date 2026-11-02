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
 app.switch_chapter(22)
 app.landscape.set_process(false)
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22-tour.json"))
 for part in tour.tape:
  for i in range(int(part[0])): app.journey.append(part[1])
 var transitions=0
 var worst=0.0
 var mismatch=false
 var visited={app.world.active_id:true}
 for i in range(tour.frames):
  var room=app.world.active_id
  var camera=app.landscape.camera_float
  app._physics_process(1.0/60)
  visited[app.world.active_id]=true
  var state=JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.sim.freeze,app.world.frames])
  app.landscape._process([1.0/120,1.0/60,1.0/30][i%3])
  if JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.sim.freeze,app.world.frames])!=state: mismatch=true
  var distance=camera.distance_to(app.landscape.camera_float)
  worst=max(worst,distance)
  if room!=app.world.active_id:
   transitions+=1
   if distance>16: mismatch=true
  if i%120==0: await process_frame
 var ok=not mismatch and transitions==tour.visited.size()-1 and visited.size()==tour.visited.size() and tour.visited.all(func(id):return visited.has(id)) and app.world.data.world.requiredMainRooms.all(func(id):return visited.has(id)) and app.world.frames==tour.frames and app.world.active_id=="cl22-atlas-crossroads" and app.sim.deaths==0
 print("PASS" if ok else "FAIL"," actual Woods application road with polish · ",app.world.frames," normal-input physics frames · ",transitions," smooth ownership changes · ",app.sim.deaths," deaths · worst camera step ",snapped(worst,.01)," px")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(0 if ok else 1)
