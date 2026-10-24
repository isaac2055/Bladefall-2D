extends SceneTree
const Main=preload("res://main.tscn")
var app
func _initialize(): run.call_deferred()
func room_index(id):
 for i in range(app.data.world.rooms.size()):
  if app.data.world.rooms[i].id==id: return i
 return 0
func shot(name,id,x,y):
 app.load_section(room_index(id))
 app.sim.p.x=x
 app.sim.p.y=y
 app.landscape.snap_actor()
 app.landscape.camera_float=Vector2(max(0,app.landscape.actor.x-153),app.landscape.actor.y-133)
 app.quest_label.text=app.bearing_caption()
 await create_timer(0.25).timeout
 await RenderingServer.frame_post_draw
 var path=OS.get_cmdline_user_args()[0]+"/"+name+".png"
 root.get_texture().get_image().save_png(path)
 print("SHOT ",name)
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 await shot("camp-floor","cl1-o1-camp",294,133)
 await shot("gatehouse-ceiling","cl1-o1-gate",24,24)
 await shot("gatehouse-ground","cl1-o1-gate",16,133)
 await shot("upper-watch","cl1-atlas-crossroads",112,69)
 await shot("watch-stair","godot-overlook-stair",24,152)
 app.set_paused(true)
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(OS.get_cmdline_user_args()[0]+"/restart-menu.png")
 await app.close_app()
