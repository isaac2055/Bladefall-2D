extends SceneTree
const Main=preload("res://main.tscn")
var app
var directory
func _initialize(): run.call_deferred()
func freeze(stage,x,y):
 app.world.stage=stage
 app.world.p.x=x;app.world.p.y=y;app.world.p.vx=0.0;app.world.p.vy=0.0
 app.landscape.snap()
 app.last_room=""
 app.update_hud()
func shot(name):
 await create_timer(0.25).timeout
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(directory+"/"+name+".png")
 print("SHOT ",name)
func run():
 directory=OS.get_cmdline_user_args()[0]
 app=Main.instantiate();app.test_mode=true;root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 freeze(0,310,0)
 await shot("camp")
 freeze(0,1895,0)
 app.world.step({"interact":true})
 app.audio.handle(app.world.events)
 app.audio._process(0.01)
 await shot("mara")
 app.audio.restart()
 freeze(1,3200,135)
 await shot("oathblade")
 freeze(1,4600,52)
 app.world.weapon=true
 app.world.p.face=1
 app.world.p.atkCd=0
 app.world.prev={}
 app.landscape.before_tick()
 app.world.step({"interact":true,"attack":true})
 app.landscape.after_tick()
 await shot("resin")
 freeze(1,10860,210)
 var guard=app.world.region().enemies.filter(func(e):return e.get("forestRole","")=="root-guard")[0]
 guard.mode="wind";guard.timer=.24;guard.frontShield=true;guard.face=-1
 await shot("root-guard")
 freeze(1,700,0)
 app.world.elsie=5
 app.world.log_hits=3
 app.world.lantern=Vector2(820,0)
 app.world.quest_cue="A Place for Supper · complete · moth flight unlocked"
 app.world.quest_time=5
 app.update_hud()
 await shot("elsie")
 app.world.prev={}
 app.world.step({"interact":true})
 for i in range(150): app.world.step({})
 app.landscape.snap()
 app.update_hud()
 await shot("moth-flight")
 app.world.ride={}
 freeze(0,250,0)
 app.world.rowan=5
 app.world.prev={}
 app.world.step({"interact":true})
 for i in range(150): app.world.step({})
 app.landscape.snap()
 app.update_hud()
 await shot("drake-flight")
 app.world.ride={}
 freeze(1,700,0)
 app.set_paused(true)
 await shot("menu")
 app.set_paused(false)
 app.world.chart=true
 app.world.bearings={"ASH":true,"GLASS":true,"IRON":true}
 for o in app.world.regions[0].obstacles:
  if o.type=="surveyStake": o.aligned=true
 app.toggle_map()
 await shot("chart")
 await app.close_app()
