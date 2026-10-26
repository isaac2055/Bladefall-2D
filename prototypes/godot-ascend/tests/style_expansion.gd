extends SceneTree
const Main=preload("res://main.tscn")
const Styles=preload("res://scripts/character_styles.gd")
var app
var failed=false
var gallery
var render_gallery=false
var people=[]
var output=""
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func state(): return JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.sim.room.grid,app.world.frames])
func frame():
 await process_frame
 if output!="": await RenderingServer.frame_post_draw
func shot(name):
 if output=="": return
 await frame()
 root.get_texture().get_image().save_png(output+"/"+name+".png")
func run():
 if not OS.get_cmdline_user_args().is_empty(): output=OS.get_cmdline_user_args()[0]
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.set_process(false)
 for chapter in app.chapters.values(): chapter.landscape.set_process(false)
 check(app.design_picker.item_count==8 and app.npc_picker.item_count==8,"eight designs for both knight and people")
 var others={}
 for n in [2,3,21,22,23]: others[n]=[app.chapters[n].landscape.knight_design,app.chapters[n].landscape.npc_design,app.chapters[n].landscape.environment_design]
 var baseline=state()
 for id in Styles.CHOICES:
  var index=app.design_picker.get_item_index(id)
  app.design_picker.item_selected.emit(index)
  app.npc_picker.item_selected.emit(app.npc_picker.get_item_index(id))
  check(app.landscape.knight_design==id and app.landscape.npc_design==id,"actual menu selects "+Styles.NAMES[id])
 var untouched=true
 for n in others: untouched=untouched and others[n]==[app.chapters[n].landscape.knight_design,app.chapters[n].landscape.npc_design,app.chapters[n].landscape.environment_design]
 check(untouched,"new character choices leave the other five chapters unchanged")
 var scene=app.landscape
 app.sim.p.vx=90
 for i in range(120): scene.tick_cape(1.0/60)
 var moving=scene.cape_flow
 app.sim.p.vx=0
 scene.tick_cape(1.0/60)
 check(scene.cape_flow.distance_to(moving)<.15 and abs(scene.cape_flow.x)>.8,"stop preserves cloth momentum on the first frame")
 for i in range(60): scene.tick_cape(1.0/60)
 check(abs(scene.cape_flow.x)<.01 and scene.cape_flow.y>.99,"cape settles naturally to hanging over one second")
 # Equal elapsed time gives the same easing at different render rates.
 scene.cape_flow=Vector2(-1,0)
 for i in range(30): scene.tick_cape(1.0/30)
 var slow=scene.cape_flow
 scene.cape_flow=Vector2(-1,0)
 for i in range(144): scene.tick_cape(1.0/144)
 check(scene.cape_flow.distance_to(slow)<.0001,"cloth settling is independent of render frame rate")
 var grids=app.world.cells.duplicate(true)
 for theme in range(3):
  app.environment_picker.item_selected.emit(theme)
  check(scene.environment_design==theme and app.world.cells==grids,"theme %d changes scenery without changing collision"%theme)
  scene._process(.016)
  await shot("outskirts-theme-"+str(theme))
 var difference=preload("res://authoring/codec.gd").first_difference(JSON.parse_string(baseline),JSON.parse_string(state()))
 check(difference=="","menus, themes and cloth updates do not advance gameplay: "+difference)
 app.preferences_path="user://style-expansion-%d.cfg"%OS.get_process_id()
 app.test_mode=false
 app.apply_character_settings(7,6)
 app.apply_environment_settings(2)
 var second=Main.instantiate()
 second.preferences_path=app.preferences_path
 second.test_mode=false
 root.add_child(second)
 await process_frame
 second.set_physics_process(false)
 check(second.landscape.knight_design==7 and second.landscape.npc_design==6 and second.landscape.environment_design==2,"startup restores both new character designs and scenery")
 second.queue_free()
 app.test_mode=true
 DirAccess.remove_absolute(app.preferences_path)
 if output!="":
  for name in ["vey","mara","rowan"]:
   for core in app.world.cores.values():
    for person in core.room.def.get("people",[]):
     if person.who==name and not people.any(func(p):return p.who==name): people.append(person)
  var overlay=CanvasLayer.new()
  overlay.layer=100
  root.add_child(overlay)
  gallery=Node2D.new()
  overlay.add_child(gallery)
  gallery.draw.connect(paint_gallery)
  await shot("characters-eight-designs")
  var pic=root.get_texture().get_image()
  var knights={}
  var residents={}
  for k in range(8):
   var x=16+(k%2)*632
   var y=48+(k/2)*190
   knights[pic.get_region(Rect2i(x,y+28,302,112)).get_data().hex_encode().sha256_text()]=true
   residents[pic.get_region(Rect2i(x+302,y+28,306,112)).get_data().hex_encode().sha256_text()]=true
  check(knights.size()==8 and residents.size()==8,"GPU pixels distinguish all eight knight and resident designs")
  overlay.queue_free()
 app.queue_free()
 await process_frame
 quit(1 if failed else 0)
func paint_gallery():
 gallery.draw_rect(Rect2(0,0,1280,832),Color("#142333"))
 gallery.draw_string(ThemeDB.fallback_font,Vector2(20,30),"OUTSKIRTS · FOUR FAMILIES / TWO DESIGNS",HORIZONTAL_ALIGNMENT_LEFT,-1,20,Color("#e7d4ad"))
 var a=app.landscape
 var old=a.ink
 var old_design=a.knight_design
 var old_npc=a.npc_design
 a.ink=gallery
 for k in range(8):
  var id=Styles.CHOICES[k]
  var x=16+(k%2)*632
  var y=48+(k/2)*190
  gallery.draw_rect(Rect2(x,y,616,180),Color("#203346"))
  gallery.draw_string(ThemeDB.fallback_font,Vector2(x+12,y+22),Styles.NAMES[id],HORIZONTAL_ALIGNMENT_LEFT,-1,17,Color("#d9cbac"))
  gallery.draw_set_transform(Vector2(x+30,y+55),0,Vector2(6,6))
  a.knight_design=id
  a.npc_design=id
  for i in range(3):
   var pose=app.sim.p.duplicate(true)
   pose.merge({"vx":0 if i==0 else 90,"facing":1,"state":"climb" if i==2 else "normal","onGround":i!=2,"parryTimer":0,"strikeTimer":0,"carrying":null,"dashes":1},true)
   a.draw_knight(pose,Vector2(i*16,0),13)
  for i in range(people.size()): a.draw_person(people[i],Vector2(53+i*15,12),false)
  gallery.draw_set_transform(Vector2.ZERO)
  gallery.draw_string(ThemeDB.fallback_font,Vector2(x+12,y+164),"Idle       Run       Cling             Vey          Mara          Rowan",HORIZONTAL_ALIGNMENT_LEFT,-1,12,Color("#a1b5bc"))
 a.knight_design=old_design
 a.npc_design=old_npc
 a.ink=old
