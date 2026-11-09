extends SceneTree
const Main=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
var app
var path=""
func _initialize(): run.call_deferred()
func shot(name):
 await create_timer(.25).timeout
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("/tmp/bladefall-v46-"+name+".png")
 print("PASS rendered ",name)
func run():
 path="user://presentation46-%d.json"%OS.get_process_id()
 app=Main.instantiate();app.test_mode=true;app.sampler=Run.new(path);root.add_child(app)
 await process_frame
 app.set_physics_process(false);app.set_dev_mode(false);app.game_started=false
 app.title_screen.open(false)
 await shot("title")
 app.root_ui.show();app.root_ui.move_to_front();app.set_paused(true)
 await shot("title-settings")
 app.title_screen.hide();app.root_ui.show()
 app.sampler.profile.start(1);app.sampler.profile.tick("end",3);app.sampler.result=app.sampler.profile.finish()
 app.sampler_overlay.showing_result=true;app.sampler_overlay.show_result()
 await shot("complete")
 app.sampler.profile.hearts["1"]={"branch:fixture":true}
 app.sampler_overlay.open_garden()
 await shot("garden")
 app.sampler_overlay.close();app.title_screen.hide();app.restart_world();app.set_physics_process(false)
 var route=app.world.data.world.campaignWorkshop
 app.world.enter(route.entry,true);app.sim=app.world.active();app.landscape.load_scene(app.sim)
 app.sampler.start(app.world,false)
 app.sampler.begin_ride(app.world,route.walks[0])
 for i in range(50):app.sampler.tick(app.world)
 app.landscape.previous_actor=app.sampler.ride_point();app.landscape.current_actor=app.sampler.ride_point();app.landscape.actor=app.sampler.ride_point()
 await shot("travel")
 app.queue_free();await process_frame
 var p=preload("res://scripts/run_profile.gd").new(path)
 for n in [1,2,3,21,22,23,101,102,103]: Save.clear(p,n)
 if FileAccess.file_exists(path): DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 quit()
