extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
var app
var failed=0
var path=""
var trace=[]
var captures=OS.get_cmdline_user_args().has("--capture")
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize(): run.call_deferred()
func step():
 if app.paused: app.set_paused(false)
 app.landscape.set_process(false)
 app._physics_process(1.0/60)
 app.landscape._process(1.0/60)
func capture(name):
 app.set_paused(false);app.landscape.set_process(false)
 app.landscape.ink.queue_redraw()
 await process_frame
 app.set_paused(false);app.landscape.set_process(false)
 app.landscape.ink.queue_redraw()
 RenderingServer.force_draw()
 root.get_texture().get_image().save_png("/tmp/transport-"+name+".png")
func run():
 path="user://transport-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.sampler=Run.new(path);app.test_mode=true;root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.landscape.set_process(false)
 app.title_screen.hide();app.game_started=true;app.set_dev_mode(true)
 for reduced in [false,true]:
  for n in [1,2,3]:
   app.switch_chapter(n);app.restart_world();app.set_paused(false)
   app.set_physics_process(false);app.landscape.set_process(false);app.landscape.reduced_motion=reduced
   var route=app.world.data.world.campaignWorkshop
   app.world.enter(route.entry,true);app.sync_sampler_scene()
   app.landscape.camera_float=app.landscape.current_actor-Vector2(153,100)
   app.landscape.camera_velocity=Vector2.ZERO
   app.story.check_begin()
   var ride=app.sampler.ride
   check(ride.get("phase","")=="reveal","persistent ride exists in first establishing frame %d/%s"%[n,reduced])
   var old_actor=app.landscape.current_actor
   var old_cradle=app.sampler.cradle_point(old_actor,app.sim.p.h)
   var old_camera=app.landscape.camera_float
   var cradle_velocity=Vector2.ZERO
   var velocity=Vector2.ZERO
   var camera_velocity=Vector2.ZERO
   var max_actor=0.0;var max_cradle=0.0;var max_camera=0.0;var max_accel=0.0;var max_camera_accel=0.0
   var boundaries=[]
   var previous_phase="reveal"
   var frames=0
   while not app.sampler.ride.is_empty() and frames<1100:
    var before_phase=app.sampler.ride.get("phase","")
    # Pause freezes all transport phases, including reveal and docking.
    if frames==20 or before_phase!=previous_phase:
     app.set_paused(true)
     var frozen=var_to_bytes(app.sampler.ride)
     var age=app.story.age
     app._physics_process(1.0/60)
     check(frozen==var_to_bytes(app.sampler.ride) and age==app.story.age,"pause freezes "+before_phase)
     app.set_paused(false);app.landscape.set_process(false)
    previous_phase=before_phase
    step();frames+=1
    var phase=app.sampler.ride.get("phase","control")
    var actor=app.landscape.current_actor
    var cradle=app.sampler.cradle_point(actor,app.sim.p.h) if not app.sampler.ride.is_empty() else old_cradle
    var camera=app.landscape.camera_float
    var v=actor-old_actor
    var cv=camera-old_camera
    max_actor=maxf(max_actor,v.length());max_cradle=maxf(max_cradle,cradle.distance_to(old_cradle));max_camera=maxf(max_camera,cv.length())
    max_accel=maxf(max_accel,(v-velocity).length());max_camera_accel=maxf(max_camera_accel,(cv-camera_velocity).length())
    if phase!=before_phase:
     boundaries.append({"from":before_phase,"to":phase,"actor_step":v.length(),"cradle_step":cradle.distance_to(old_cradle),"cradle_acceleration":(cradle-old_cradle-cradle_velocity).length(),"camera_step":cv.length(),"actor_acceleration":(v-velocity).length(),"camera_acceleration":(cv-camera_velocity).length()})
     check(is_same(ride,app.sampler.ride) or phase=="control","ride identity retained at "+phase)
    trace.append({"world":n,"reduced":reduced,"frame":frames,"phase":phase,"actor":[actor.x,actor.y],"render_actor":[app.landscape.actor.x,app.landscape.actor.y],"previous_actor":[app.landscape.previous_actor.x,app.landscape.previous_actor.y],"cradle":[cradle.x,cradle.y],"camera":[camera.x,camera.y],"camera_velocity":[app.landscape.camera_velocity.x,app.landscape.camera_velocity.y]})
    if captures and not reduced and (frames in [1,50,100,180,240,249,250,251,252,253,254,255,256,260,270,280] or phase!=before_phase or phase=="landing" and int(app.sampler.ride.get("landing_frame",0)) in [1,2,3,10,20,27,28,29] or phase=="travel" and app.sampler.ride.frame>=ceili(app.sampler.ride_duration()*60)-3):
     await capture("%d-%04d-%s"%[n,frames,phase])
    # Snapshot each phase and prove exact persistent transform/clock restoration.
    if frames==30 or phase!=before_phase and phase!="control":
     var payload=app.sampler.ride.duplicate(true)
     check(Save.write(app.world,app.sampler),"save "+phase)
     check(Save.restore(app.world,app.sampler) and app.sampler.ride==payload,"restore exact ride/camera state in "+phase)
     ride=app.sampler.ride
    cradle_velocity=cradle-old_cradle
    old_actor=actor;old_cradle=cradle;old_camera=camera;velocity=v;camera_velocity=cv
   check(frames<1100 and app.world.active_id==route.rooms[0] and app.world.checkpoint_id==route.rooms[0],"dock retains individual puzzle checkpoint")
   check(max_actor<12 and max_cradle<12 and max_camera<12 and max_accel<2 and max_camera_accel<2,"bounded transforms and velocity changes %d/%s: %.3f %.3f %.3f %.3f %.3f"%[n,reduced,max_actor,max_cradle,max_camera,max_accel,max_camera_accel])
   print("BOUNDARIES ",n," reduced=",reduced," ",JSON.stringify(boundaries))
   check(boundaries.size()==3,"reveal -> travel -> landing -> control")
   app.dev_mode=false
   app.world.enter(route.entry,true);app.sync_sampler_scene()
   check(not app.story.check_begin(),"normal reveal plays once")
   app.sampler.retry(app.world)
   check(app.sampler.ride.is_empty(),"death/retry does not retain a transport")
   app.restart_world()
   check(app.sampler.ride.is_empty() and not app.story.active(),"restart clears transport presentation")
   app.dev_mode=true
 # Exercise the real Continue path, plus Retry while each transport phase is active.
 for n in [1,2,3]:
  for stage in ["reveal","travel","landing"]:
   app.switch_chapter(n);app.restart_world();app.set_paused(false)
   app.set_physics_process(false);app.landscape.set_process(false)
   app.landscape.reduced_motion=false
   var route=app.world.data.world.campaignWorkshop
   app.world.enter(route.entry,true);app.sync_sampler_scene()
   app.sampler.profile.discover(n,route.entry)
   app.story.begin("reveal")
   if stage=="reveal":
    for i in range(35): step()
   else:
    app.story.phase="";app.story.hide();app.landscape.story={}
    app.sampler.ride.phase="travel"
    app.sampler.ride.frame=90
    if stage=="landing":
     app.sampler.ride.frame=ceili(app.sampler.ride_duration()*60)
     app.sampler.tick(app.world);app.sync_sampler_scene()
    var point=app.sampler.ride_point()
    app.landscape.current_actor=point;app.landscape.previous_actor=point;app.landscape.actor=point
    app.landscape.camera_float=point-Vector2(153,100)
    app.landscape.camera_velocity=Vector2(7,-3)
    app.landscape.tick_feel(1.0/60)
   var point=app.sampler.ride_point()
   var cradle=app.sampler.cradle_point(point,app.sim.p.h)
   var camera=app.landscape.camera_float
   var velocity=app.landscape.camera_velocity
   var reveal_age=app.sampler.ride.get("reveal_age",0)
   check(Save.write(app.world,app.sampler) and app.resume_world(n),"Continue restores %d/%s"%[n,stage])
   app.set_physics_process(false);app.landscape.set_process(false)
   check(app.landscape.current_actor.is_equal_approx(point) and app.sampler.cradle_point(point,app.sim.p.h).is_equal_approx(cradle) and app.landscape.camera_float.is_equal_approx(camera) and app.landscape.camera_velocity.is_equal_approx(velocity),"Continue preserves actor, cradle, camera and camera velocity")
   if stage=="reveal": check(app.story.active() and is_equal_approx(app.story.age,reveal_age),"Continue restores establishing clock")
   if stage=="reveal":
    var duration=app.sampler.ride.reveal_duration
    var before=app.sampler.cradle_point(app.landscape.current_actor,app.sim.p.h)
    app.landscape.reduced_motion=true
    step()
    check(app.sampler.ride.reveal_duration==duration and app.sampler.cradle_point(app.landscape.current_actor,app.sim.p.h).distance_to(before)<3,"changing reduced motion preserves active boarding timeline")
   var checkpoint=app.world.checkpoint_id
   app.retry_room()
   check(app.sampler.ride.is_empty() and not app.story.active() and app.landscape.story.is_empty() and app.world.active_id==checkpoint,"Retry cancels transport at its individual checkpoint: "+stage)
 FileAccess.open("/tmp/transport-continuity.json",FileAccess.WRITE).store_string(JSON.stringify(trace))
 app.queue_free();await process_frame
 var profile=Run.new(path).profile
 for n in [1,2,3]: Save.clear(profile,n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("TRANSPORT CONTINUITY FAILURES ",failed)
 quit(1 if failed else 0)
