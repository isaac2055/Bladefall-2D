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
 check(app.walking_picker.item_count==4 and app.design_picker.item_count==3,"settings offer three walks plus Off and three related knight designs")
 var flowers=0
 var relocated=0
 var skipped=0
 var safe=true
 for n in app.CHAPTERS:
  app.switch_chapter(n)
  app.landscape.set_process(false)
  var scene=app.landscape
  for item in scene.decorations:
   if item.d.k in ["trumpets","fern"]:
    flowers+=1
    safe=safe and Art.flora_safe(scene,item.origin+Vector2(item.d.c*8,item.d.r*8+8))
  relocated+=scene.flora_adjusted
  skipped+=scene.flora_skipped
  scene._process(.016)
  await shot("world-"+str(n))
 check(flowers>0 and safe,"all "+str(flowers)+" painted flower/fern patches have solid support, hazard clearance and space around people/devices")
 print("FLORA · ",relocated," moved to safe ledges · ",skipped," omitted when no safe patch exists")
 app.switch_chapter(1)
 app.load_section(0)
 var scene=app.landscape
 scene.set_process(false)
 var state=fingerprint()
 for i in range(120): scene._process(1.0/60)
 var tail=scene.plume[-1]-scene.plume[0]
 check(tail.y>5 and abs(tail.x)<3,"idle cape hangs nearly parallel with the body")
 var old=scene.plume[-1]
 for i in range(20): scene._process(1.0/60)
 check(old.distance_to(scene.plume[-1])<1,"stationary cape has only a slight wave")
 check(fingerprint()==state,"cape and art updates leave simulation untouched")
 app.sim.p.vx=90
 state=fingerprint()
 for i in range(120): scene._process(1.0/60)
 tail=scene.plume[-1]-scene.plume[0]
 check(abs(tail.x)>8 and abs(tail.y)<3,"moving cape retains the original trailing silhouette")
 check(fingerprint()==state,"moving cloth changes no physics")
 app.sim.p.vx=0
 state=fingerprint()
 var walk_hashes={}
 var design_hashes={}
 for design in range(3):
  for walk in range(4):
   app.walking_picker.item_selected.emit(walk)
   app.design_picker.item_selected.emit(design)
   var shared=true
   for chapter in app.chapters.values(): shared=shared and chapter.landscape.walking_style==walk and chapter.landscape.knight_design==design
   check(shared,"appearance selection shared by every chapter: "+str(design)+" / "+str(walk))
   app.set_paused(true)
   app.preview_clock=.17
   app.appearance_preview.queue_redraw()
   await shot("knight-"+str(design)+"-walk-"+str(walk))
   if not OS.get_cmdline_user_args().is_empty():
    var hashes=[]
    for phase in [.17,.28,.42]:
     app.preview_clock=phase
     app.appearance_preview.queue_redraw()
     await process_frame
     await RenderingServer.frame_post_draw
     var at=app.appearance_preview.global_position
     var feet=root.get_texture().get_image().get_region(Rect2i(Vector2i(at)+Vector2i(220,45),Vector2i(65,25)))
     hashes.append(feet.get_data().hex_encode().sha256_text())
    if design==0: walk_hashes[str(hashes)]=true
    if walk==1:
     var at=app.appearance_preview.global_position
     var sprite=root.get_texture().get_image().get_region(Rect2i(Vector2i(at),Vector2i(560,88)))
     design_hashes[sprite.get_data().hex_encode().sha256_text()]=true
    if walk==0: check(hashes[0]==hashes[1] and hashes[1]==hashes[2],"Off keeps the leg pixels still")
 if not OS.get_cmdline_user_args().is_empty(): check(walk_hashes.size()==4 and design_hashes.size()==3,"GPU pixels distinguish all four gait choices and all three knight designs")
 check(fingerprint()==state,"appearance controls and previews change no player, entity or collision state")
 app.preferences_path="user://art-test-%d.cfg"%OS.get_process_id()
 app.test_mode=false
 app.apply_art_settings(2,1)
 var config=ConfigFile.new()
 check(config.load(app.preferences_path)==OK and config.get_value("display","walking_style")==2 and config.get_value("display","knight_design")==1,"appearance choices save to preferences")
 var second=Main.instantiate()
 second.test_mode=false
 second.preferences_path=app.preferences_path
 root.add_child(second)
 await process_frame
 second.set_physics_process(false)
 check(second.landscape.walking_style==2 and second.landscape.knight_design==1 and second.walking_picker.selected==2 and second.design_picker.selected==1,"appearance choices reload through actual application startup")
 second.queue_free()
 app.test_mode=true
 DirAccess.remove_absolute(app.preferences_path)
 await process_frame
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(1 if failed else 0)
