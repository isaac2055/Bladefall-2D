extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Controls=preload("res://scripts/controls.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var app
var failed=0
var trace=[]
var captures=OS.get_cmdline_user_args().has("--capture")
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
 root.get_texture().get_image().save_png("/tmp/connected-"+name+".png")
func run():
 path="user://connected-camera-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.title_screen.hide();app.game_started=true;app.set_dev_mode(true)
 for reduced in [false,true]:
  for n in [1,2,3,23]:
   app.switch_chapter(n);app.restart_world();app.set_physics_process(false);app.set_paused(false)
   app.landscape.set_process(false);app.landscape.reduced_motion=reduced
   var route=app.world.data.world.campaignWorkshop
   var id=route.rooms[0]
   app.world.enter(id,true);app.sync_sampler_scene()
   app.landscape.camera_float=app.landscape.target_camera();app.landscape.camera_velocity=Vector2.ZERO
   var solved=false
   for part in app.world.data.world.tapes[id]:
    for f in range(int(part[0])):
     step(part[1])
     if app.world.campaign_completed.has(id): solved=true;break
    if solved: break
   check(solved,"application solves first puzzle: %d/%s"%[n,reduced])
   if not reduced: await shot(str(n)+"-flag")
   var seams=0
   var old_room=app.world.active_id
   var max_actor=0.0;var max_camera=0.0
   var sequence=0
   var after=0
   for f in range(1600):
    var actor=app.world.position()
    var camera=app.landscape.camera_float
    step("r")
    if app.world.active_id!=old_room:
     seams+=1
     max_actor=maxf(max_actor,actor.distance_to(app.world.position()))
     max_camera=maxf(max_camera,camera.distance_to(app.landscape.camera_float))
     old_room=app.world.active_id
     after=4
    if not reduced and (after>0 or seams==0 and app.sim.p.x>=app.sim.room.w-18):
     await shot("%d-seam-%03d"%[n,sequence]);sequence+=1;after=maxi(0,after-1)
    if app.world.active_id==route.rooms[1] and after==0: break
   check(seams==2 and app.world.active_id==route.rooms[1] and app.world.checkpoint_id==route.rooms[1],"application walks both room seams into the next checkpoint")
   check(max_actor<=2 and max_camera<8 and app.sampler.ride.is_empty() and not app.story.active(),"actor/camera stay continuous with full control: %.3f / %.3f"%[max_actor,max_camera])
 FileAccess.open("/tmp/connected-camera.json",FileAccess.WRITE).store_string(JSON.stringify(trace))
 app.queue_free();await process_frame
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("CONNECTED CAMERA FAILURES ",failed)
 quit(1 if failed else 0)
