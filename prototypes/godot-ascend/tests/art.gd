extends SceneTree
const Main=preload("res://main.tscn")
const Art=preload("res://scripts/art_details.gd")
var app
var failed=false
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func fingerprint(): return JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.sim.freeze,app.world.frames,app.sim.room.grid])
func shot(label):
 if OS.get_cmdline_user_args().is_empty(): return
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(OS.get_cmdline_user_args()[0]+"/"+label+".png")
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.set_process(false)
 check(app.design_picker.item_count==10 and app.npc_picker.item_count==8,"settings offer ten classic-based knights and eight retained people designs")
 var flowers=0
 var safe=true
 for n in app.CHAPTERS:
  app.switch_chapter(n)
  app.landscape.set_process(false)
  var scene=app.landscape
  for item in scene.decorations:
   if item.d.k in ["trumpets","fern"]:
    flowers+=1
    safe=safe and Art.flora_safe(scene,item.origin+Vector2(item.d.c*8,item.d.r*8+8))
  scene._process(.016)
  await shot("world-"+str(n))
 check(flowers>0 and safe,"harmless decorative flower/fern patches still have safe clearance")
 app.switch_chapter(1)
 app.load_section(0)
 var scene=app.landscape
 scene.set_process(false)
 var state=fingerprint()
 for i in range(120): scene._process(1.0/60)
 var tail=scene.plume[-1]-scene.plume[0]
 check(tail.y>5 and abs(tail.x)<3,"base knight retains the hanging idle cape")
 var old=scene.plume[-1]
 for i in range(20): scene._process(1.0/60)
 check(old.distance_to(scene.plume[-1])<1 and fingerprint()==state,"slight cape wave changes no simulation state")
 app.sim.p.vx=90
 state=fingerprint()
 for i in range(120): scene._process(1.0/60)
 tail=scene.plume[-1]-scene.plume[0]
 check(abs(tail.x)>8 and abs(tail.y)<3 and fingerprint()==state,"moving cape keeps its trailing shape and leaves physics alone")
 app.sim.p.vx=0
 state=fingerprint()
 var hero_hashes={}
 var npc_hashes={}
 for design in range(3):
  for npc in range(3):
   app.apply_character_settings(design,npc)
   var shared=true
   for n in app.chapters:
    var scene_at=app.chapters[n].landscape
    shared=shared and scene_at.walking_style==1
    if n==1: shared=shared and scene_at.knight_design==design and scene_at.npc_design==npc
   check(shared,"independent knight / people styles selected in Outskirts: "+str(design)+" / "+str(npc))
   app.set_paused(true)
   app.preview_clock=.17
   app.appearance_preview.queue_redraw()
   await shot("knight-"+str(design)+"-people-"+str(npc))
   if not OS.get_cmdline_user_args().is_empty():
    var at=app.appearance_preview.global_position
    var image=root.get_texture().get_image()
    if npc==0: hero_hashes[image.get_region(Rect2i(Vector2i(at),Vector2i(560,80))).get_data().hex_encode().sha256_text()]=true
    if design==0: npc_hashes[image.get_region(Rect2i(Vector2i(at)+Vector2i(0,80),Vector2i(560,88))).get_data().hex_encode().sha256_text()]=true
 if not OS.get_cmdline_user_args().is_empty(): check(hero_hashes.size()==3 and npc_hashes.size()==3,"GPU pixels distinguish each renderer for both heroes and NPCs")
 check(fingerprint()==state,"all previews and style changes leave simulation state untouched")
 app.preferences_path="user://art-test-%d.cfg"%OS.get_process_id()
 app.test_mode=false
 app.apply_character_settings(2,1)
 var config=ConfigFile.new()
 check(config.load(app.preferences_path)==OK and config.get_value("display","walking_style")==1 and config.get_value("display","outskirts_knight_design")==2 and config.get_value("display","outskirts_npc_design")==1,"style selections save, with measured walking fixed")
 config.set_value("display","walking_style",3)
 config.save(app.preferences_path)
 var second=Main.instantiate()
 second.test_mode=false
 second.preferences_path=app.preferences_path
 root.add_child(second)
 await process_frame
 second.set_physics_process(false)
 check(second.landscape.walking_style==1 and second.landscape.knight_design==2 and second.landscape.npc_design==1,"actual application startup restores both style selections")
 second.queue_free()
 app.test_mode=true
 DirAccess.remove_absolute(app.preferences_path)
 await process_frame
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(1 if failed else 0)
