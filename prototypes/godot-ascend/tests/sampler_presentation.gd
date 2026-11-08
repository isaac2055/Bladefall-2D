extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var app
func _initialize(): run.call_deferred()
func shot(path):
 await create_timer(.5).timeout
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(path)
 print("PASS screenshot ",path)
func run():
 app=Main.instantiate()
 app.test_mode=true
 app.sampler=Run.new("user://sampler-presentation-test.json")
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 for n in [1,2,3]:
  var p=app.sampler.profile.garden(n)
  p.root=true;p.top=true;p.core=true;p.flower_shiny=true;p.core_shiny=true
 app.switch_chapter(23)
 app.restart_world()
 for i in range(30):
  app.world.step(Inputs.decode("l"))
  app.sampler.tick(app.world)
  if app.sampler.carrying(): break
 app.sync_sampler_scene()
 await shot("/tmp/bladefall-carried.png")
 app.switch_chapter(2)
 var route=app.world.data.world.campaignWorkshop
 app.world.enter(route.entry,true)
 app.world.active().p.onGround=true
 app.sim=app.world.active()
 app.landscape.load_scene(app.sim)
 app.sampler.start(app.world,false)
 app.sampler.tick(app.world)
 for i in range(50): app.sampler.tick(app.world)
 app.sync_sampler_scene()
 if not app.sampler.ride.is_empty():
  var at=app.sampler.ride_point()
  app.landscape.current_actor=at
  app.landscape.previous_actor=at
  app.landscape.actor=at
 await shot("/tmp/bladefall-hoist.png")
 app.queue_free()
 await process_frame
 quit()
