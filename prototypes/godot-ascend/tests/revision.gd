extends SceneTree
const World=preload("res://scripts/world.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Main=preload("res://main.tscn")
var failed=false
var app
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func shot(label):
 if OS.get_cmdline_user_args().is_empty(): return
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(OS.get_cmdline_user_args()[0]+"/"+label+".png")
func sandbox(data,slow):
 var d=data.world.rooms[0].duplicate(true)
 d.map=[]
 for r in range(23): d.map.append("#..P...................................#" if r==17 else ("########################################" if r>=18 or r==0 else "#......................................#"))
 d.erase("sweepers")
 var core=Core.new(data.constants,data.playerDefaults)
 core.load_room(Loader.parse(d))
 core.step({})
 if slow:
  core.pollen_config=JSON.parse_string(FileAccess.get_file_as_string("res://data/white-flowers.json"))
  core.p.pollen=180
 return core
func run():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json"))
 var w=World.new(data)
 var sleeping=[]
 for c in w.cores.values():
  if not c.awake and not c.sweepers.is_empty(): sleeping.append(c)
 check(not sleeping.is_empty(),"fixture contains Outskirts study-room bunnies before entry")
 var moved=false
 var c=sleeping[0]
 var initial=Vector2(c.sweepers[0].x,c.sweepers[0].y)
 for i in range(32):
  w.step({})
  moved=moved or initial.distance_to(Vector2(c.sweepers[0].x,c.sweepers[0].y))>.1
 var all_clocks=true
 for core in w.cores.values():
  if not core.sweepers.is_empty(): all_clocks=all_clocks and core.sweeper_clock==32
 check(moved and all_clocks and not c.awake,"unvisited sleeping-room bunnies move continuously without waking its machinery")
 w.enter(c.room.id,true)
 var old=c.sweeper_clock
 c.freeze=4
 w.step({})
 check(c.sweeper_clock==old+1,"bunnies keep moving during player freeze")
 c.freeze=0
 c.p.state="dead"
 c.p.deadTimer=10
 old=c.sweeper_clock
 w.step({})
 check(c.sweeper_clock==old+1,"bunnies keep moving during player death")
 old=c.sweeper_clock
 var point=Vector2(c.sweepers[0].x,c.sweepers[0].y)
 w.retry()
 check(c.sweeper_clock==old and point==Vector2(c.sweepers[0].x,c.sweepers[0].y),"retry preserves the continuous bunny phase")
 w.restart()
 c=w.active()
 c.p.x=64
 c.p.y=133
 c.p.vx=0
 c.p.onGround=true
 w.step({})
 check(c.p.get("pollen",0)==180 and "pollen-slow" in c.events,"touching an actual white flower starts the three-second sap effect")
 c.p.x=24
 for i in range(179): w.step({})
 check(c.p.get("pollen",0)==1,"sap persists for the authored duration after leaving")
 w.step({})
 check(not c.p.has("pollen"),"sap expires completely")
 var patch_contacts=true
 for patch in w.data.whiteFlowers.patches:
  w.enter(patch.room,true)
  var actor=w.active().p
  actor.x=patch.x
  actor.y=patch.y-4
  actor.vx=0
  actor.vy=0
  w.step({})
  patch_contacts=patch_contacts and actor.get("pollen",0)>0 and w.active().deaths==0
 check(patch_contacts,"all four authored patches trigger sap without dealing direct damage")
 w.retry()
 check(not w.active().p.has("pollen"),"retry cures the sap")
 var normal=sandbox(data,false)
 var slow=sandbox(data,true)
 var constants=JSON.stringify(data.constants)
 for i in range(25):
  normal.step({"r":true})
  slow.step({"r":true})
 check(abs(slow.p.vx/normal.p.vx-.55)<.001,"sap reduces normal running to 55 percent")
 normal=sandbox(data,false)
 slow=sandbox(data,true)
 normal.step({"jump":true})
 slow.step({"jump":true})
 check(abs(slow.p.vy/normal.p.vy-.67)<.001,"sap reduces jump launch to 67 percent")
 var recovered=sandbox(data,true)
 recovered.p.pollen=1
 recovered.step({})
 recovered.step({"jump":true})
 check(abs(recovered.p.vy-data.constants.jumpSpeed)<.001,"expiration restores full jump launch")
 normal=sandbox(data,false)
 slow=sandbox(data,true)
 for i in range(6):
  normal.step({"r":true,"dash":true})
  slow.step({"r":true,"dash":true})
 check(abs(slow.p.vx/normal.p.vx-.6)<.001,"sap reduces the actual dash to 60 percent")
 var airborne=sandbox(data,false)
 for i in range(6): airborne.step({"r":true,"dash":true})
 airborne.pollen_config=JSON.parse_string(FileAccess.get_file_as_string("res://data/white-flowers.json"))
 airborne.white_flowers=[{"x":airborne.p.x,"y":airborne.p.y,"w":8,"h":11}]
 var full_dash=airborne.p.vx
 airborne.step({"r":true})
 check(abs(airborne.p.vx/full_dash-.6)<.001,"contact weakens a dash already in flight immediately")
 check(JSON.stringify(data.constants)==constants,"the effect never edits shared movement constants")
 # Both start on the actual first ledge. Only normal inputs follow the starting fixture.
 for early in [true,false]:
  var trial=World.new(data)
  var p=trial.active().p
  p.x=48 if early else 64
  p.y=133
  p.vx=90
  p.onGround=true
  if not early: trial.step({})
  for i in range(48):
   trial.step({"r":true,"jump":i<12})
   trial.update_region()
  check(trial.active().deaths==0 and trial.active().p.get("pollen",0)==0 if early else trial.active().deaths>0,"jumping early clears flower and gap" if early else "flower contact makes the nearby thorn crossing lethal")
  trial.shutdown()
 w.shutdown()
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.set_process(false)
 check(app.design_picker.item_count==3 and app.npc_picker.item_count==3,"three genuinely distinct knight renderers and three people renderers are selectable")
 app.watch=true
 app.load_section(0)
 check(not app.sim.autonomous_sweepers and app.sim.pollen_config.is_empty(),"Watch keeps the original browser-reference fixture")
 app.switch_chapter(2)
 app.switch_chapter(1)
 check(app.sim.autonomous_sweepers and not app.sim.pollen_config.is_empty() and app.sim.world_context==app.world,"returning from Watch through another chapter restores live hazards")
 app.watch=true
 app.load_section(0)
 app.toggle_watch()
 check(app.sim.autonomous_sweepers and not app.sim.pollen_config.is_empty(),"Take control restores flower effects and continuous bunnies")
 var before=JSON.stringify([app.sim.p,app.sim.ents,app.sim.room.grid])
 for style in range(3):
  app.apply_character_settings(style,style)
  var shared=true
  for chapter in app.chapters.values(): shared=shared and chapter.landscape.knight_design==style and chapter.landscape.npc_design==style and chapter.landscape.walking_style==1
  check(shared,"all chapters use measured walking and selected character style "+str(style))
  app.set_paused(true)
  app.preview_clock=.19
  app.appearance_preview.queue_redraw()
  await shot("styles-"+str(style))
 check(JSON.stringify([app.sim.p,app.sim.ents,app.sim.room.grid])==before,"all character previews leave gameplay state untouched")
 app.preferences_path="user://revision-test-%d.cfg"%OS.get_process_id()
 app.test_mode=false
 app.apply_character_settings(2,1)
 var prefs=ConfigFile.new()
 check(prefs.load(app.preferences_path)==OK and prefs.get_value("display","walking_style")==1 and prefs.get_value("display","knight_design")==2 and prefs.get_value("display","npc_design")==1,"style preferences persist; obsolete gait choices migrate to measured")
 DirAccess.remove_absolute(app.preferences_path)
 app.test_mode=true
 # Show the actual carried object rather than the old anonymous rectangle.
 app.set_paused(false)
 app.switch_chapter(1)
 var id="cl1-o1-gate"
 app.load_section(app.world.regions.find(id))
 var lantern=app.sim.ents.filter(func(e):return e.type=="lantern")[0]
 app.sim.p.carrying=lantern
 lantern.held=true
 app.landscape.snap_actor()
 app.landscape._process(.016)
 for style in range(3):
  app.apply_character_settings(style,1)
  await shot("held-lantern-"+str(style))
 app.load_section(0)
 app.sim.p.x=64
 app.sim.p.y=133
 app.world.step({})
 app.landscape.snap_actor()
 app.landscape._process(.016)
 app.quest_label.text=app.bearing_caption()
 await shot("white-flowers")
 var lift_room=""
 var lift=null
 for core in app.world.cores.values():
  for e in core.ents:
   if e.type=="zip" and lift==null:
    lift=e
    lift_room=core.room.id
 if lift!=null:
  app.load_section(app.world.regions.find(lift_room))
  app.sim.p.x=lift.x+4
  app.sim.p.y=lift.y-11
  app.landscape.snap_actor()
  app.landscape.camera_float=app.landscape.actor-Vector2(153,100)
  app.landscape._process(.016)
  await shot("outskirts-lift")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(1 if failed else 0)
