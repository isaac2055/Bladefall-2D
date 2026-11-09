extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Controls=preload("res://scripts/controls.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var app
var failed=0
var trace=[]
var captures=DisplayServer.get_name()!="headless"
var path=""
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize(): run.call_deferred()
func step(keys):
 if app.paused: app.set_paused(false)
 var raw=Inputs.decode(keys)
 for verb in Controls.ACTIONS:
  if verb in ["retry","pause"]: continue
  if raw.get(verb,false): Input.action_press(Controls.ACTIONS[verb])
  else: Input.action_release(Controls.ACTIONS[verb])
 app.landscape.set_process(false)
 app._physics_process(1.0/60)
 app.landscape._process(1.0/60)
 trace.append({"world":app.chapter_number,"room":app.world.active_id,"actor":[app.world.position().x,app.world.position().y],"camera":[app.landscape.camera_float.x,app.landscape.camera_float.y]})
func shot(name):
 if not captures: return
 for verb in Controls.ACTIONS: Input.action_release(Controls.ACTIONS[verb])
 await process_frame
 app.set_paused(false);app.landscape.set_process(false)
 app.landscape.ink.queue_redraw()
 RenderingServer.force_draw()
 root.get_texture().get_image().save_png("/tmp/passage-"+name+".png")
func run():
 path="user://connected-camera-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.title_screen.hide();app.game_started=true;app.set_dev_mode(true)
 for reduced in [false,true]:
  for n in [1,2,3,23]:
   app.set_dev_mode(true)
   app.switch_chapter(n);app.restart_world();app.set_physics_process(false);app.set_paused(false)
   app.landscape.set_process(false);app.landscape.reduced_motion=reduced
   var route=app.world.data.world.campaignWorkshop
   var id=route.rooms[0]
   app.world.enter(id,true);app.sync_sampler_scene()
   for completed in [1,2,3,21,22]: app.sampler.profile.completed[str(completed)]=true
   app.sampler.profile.discover(n,id)
   app.set_dev_mode(false)
   app.room_banner.text=app.sim.room.name.to_upper()
   app.landscape.camera_float=app.landscape.target_camera();app.landscape.camera_velocity=Vector2.ZERO
   var solved=false
   for part in app.world.data.world.tapes[id]:
    for f in range(int(part[0])):
     step(part[1])
     if app.world.campaign_completed.has(id): solved=true;break
    if solved: break
   check(solved,"application solves first puzzle: %d/%s"%[n,reduced])
   check(app.bearing_caption().contains("PASSAGE OPEN"),"completion text describes the lit passage")
   if not reduced: await shot(str(n)+"-00")
   var initial_camera=app.landscape.camera_float
   for frame in range(1,91):
    step("")
    if frame in [6,18,30,54,90] and (not reduced or frame==18): await shot("%d-%02d%s"%[n,frame,"-reduced" if reduced else ""])
   check(not app.world.road_opening.has(id),"completed sequence settles and releases its transient render state")
   check(initial_camera.distance_to(app.landscape.camera_float)<35,"completion camera remains with the knight")
 FileAccess.open("/tmp/passage-camera.json",FileAccess.WRITE).store_string(JSON.stringify(trace))
 for n in app.CHAPTERS: app.SaveState.clear(app.sampler.profile,n)
 app.queue_free();await process_frame
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("PASSAGE SHOTS FAILURES ",failed)
 quit(1 if failed else 0)
