extends SceneTree
const Main=preload("res://main.tscn")
const Knights=preload("res://scripts/knight_styles.gd")
var app
var failed=false
var output=""
var gallery
var gallery_kind="knights"
var captures=[]
var capture_textures=[]
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func frame():
 await process_frame
 if output!="": await RenderingServer.frame_post_draw
func screenshot(name):
 if output=="": return
 await frame()
 root.get_texture().get_image().save_png(output+"/"+name+".png")
func state(): return JSON.stringify([app.sim.p,app.sim.ents,app.sim.frame,app.world.frames,app.world.cells])
func run():
 if not OS.get_cmdline_user_args().is_empty(): output=OS.get_cmdline_user_args()[0]
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 app.set_process(false)
 for chapter in app.chapters.values(): chapter.landscape.set_process(false)
 var original=state()
 check(not app.audio.manifest.effects.has("ui-pause") and not ResourceLoader.exists("res://audio/sfx/ui-pause.mp3"),"pause recording is absent from manifest and game resources")
 var count=app.audio.counts.effects
 var children=app.audio.get_child_count()
 for i in range(5): app.set_paused(true);app.set_paused(false)
 check(app.audio.counts.effects==count and app.audio.get_child_count()==children,"repeated pause/unpause creates no sounds or players")
 var buttons=app.root_ui.find_children("*","Button",true,false)
 var pause_button=buttons.filter(func(b):return b.text=="II  Esc")[0]
 var resume_button=buttons.filter(func(b):return b.text=="Resume")[0]
 pause_button.pressed.emit()
 resume_button.pressed.emit()
 check(app.audio.counts.effects==count and not app.paused,"actual pause and Resume buttons are silent")
 app.open_mixer()
 check(app.mixer_panel.visible and app.paused and app.volume_sliders.size()==7,"dedicated mixer exposes seven channels while gameplay is paused")
 app.volume_sliders.Efforts.value=0
 check(AudioServer.is_bus_mute(AudioServer.get_bus_index("Efforts")),"knight efforts can be muted independently")
 var id=app.mixer_effect_names.find("jump")
 app.mixer_effect_picker.select(id)
 app.update_effect_mixer()
 app.mixer_effect_slider.value=.25
 app.audio.preview_effect("jump")
 var player=app.audio.get_child(-1)
 check(player.bus=="Effects" and player.playing and not player.stream_paused and is_equal_approx(player.volume_db,linear_to_db(.48*.25)),"preview uses the selected effect's actual gain while paused")
 app.mixer_effect_slider.value=0
 check(not player.playing,"muting an individual effect stops its current preview immediately")
 count=app.audio.counts.effects
 app.audio.effect("jump")
 check(app.audio.counts.effects==count,"disabled effects are not played during gameplay")
 app.audio.set_effect_level("jump",.35)
 app.close_mixer()
 app.set_paused(false)
 check(app.npc_picker.item_count==8 and app.design_picker.item_count==10,"people retain eight choices; knight has Classic plus nine rebuilt alternatives")
 for id_at in Knights.CHOICES:
  app.design_picker.item_selected.emit(app.design_picker.get_item_index(id_at))
  check(app.landscape.knight_design==id_at,"knight menu selects "+Knights.NAMES[id_at])
 var tiles={}
 for palette in app.landscape.Themes.CHOICES:
  app.environment_picker.item_selected.emit(app.environment_picker.get_item_index(palette))
  for feel in range(3):
   app.feel_picker.item_selected.emit(feel)
   var texture=app.landscape.tiles.tile_set.get_source(0).texture.get_image()
   tiles[texture.get_data().hex_encode().sha256_text()]=true
   if feel==1:
    var seamless=true
    for v in range(4,8):
     for y in range(8):
      for x in range(8): seamless=seamless and texture.get_pixel(v*8+x,y)==texture.get_pixel(4*8,0)
    check(seamless,"smooth palette %d has no internal tile seams"%palette)
   app.landscape._process(.016)
   if output!="":
    await frame()
    var image=root.get_texture().get_image()
    image.save_png(output+"/scenery-%d-%d.png"%[palette,feel])
    captures.append(image)
    capture_textures.append(ImageTexture.create_from_image(image))
 check(tiles.size()==9,"all nine palette/treatment combinations have distinct terrain")
 check(state()==original,"mixer, knight and scenery changes leave gameplay state unchanged")
 app.preferences_path="user://refinements-%d.cfg"%OS.get_process_id()
 app.test_mode=false
 app.apply_character_settings(9,6)
 app.apply_environment_settings(3)
 app.apply_surface_settings(1)
 app.save_preferences()
 var second=Main.instantiate()
 second.preferences_path=app.preferences_path
 root.add_child(second)
 await process_frame
 second.set_physics_process(false)
 check(second.landscape.knight_design==9 and second.landscape.npc_design==6 and second.landscape.environment_design==3 and second.landscape.environment_feel==1,"all appearance selectors restore from saved preferences")
 check(second.audio.levels.Efforts==0 and is_equal_approx(second.audio.effect_levels.jump,.35),"channel mutes and individual effect gains restore from disk")
 second.queue_free()
 app.test_mode=true
 DirAccess.remove_absolute(app.preferences_path)
 await frame()
 if output!="":
  var overlay=CanvasLayer.new()
  overlay.layer=100
  root.add_child(overlay)
  gallery=Node2D.new()
  overlay.add_child(gallery)
  gallery.draw.connect(paint_gallery)
  await screenshot("knights-classic-family")
  var picture=root.get_texture().get_image()
  var hashes={}
  var classic=picture.get_region(Rect2i(70,91,48,66))
  for k in range(10):
   var x=70+(k%2)*632
   var y=91+(k/2)*154
   var tile=picture.get_region(Rect2i(x,y,48,66))
   hashes[tile.get_data().hex_encode().sha256_text()]=true
   var union_count=0
   var matched=0
   var background=Color("#203346")
   for py in range(66):
    for px in range(48):
     var a=classic.get_pixel(px,py)!=background
     var b=tile.get_pixel(px,py)!=background
     if a or b: union_count+=1
     if a and b: matched+=1
   check(float(matched)/max(1,union_count)>.75,"classic silhouette retained by "+Knights.NAMES[Knights.CHOICES[k]])
  check(hashes.size()==10,"all ten knight renderers produce distinct GPU pixels")
  gallery_kind="scenery"
  gallery.queue_redraw()
  await screenshot("scenery-nine-combinations")
  overlay.queue_free()
  app.open_mixer()
  await screenshot("sound-mixer")
  app.close_mixer()
 app.queue_free()
 await process_frame
 quit(1 if failed else 0)
func paint_gallery():
 gallery.draw_rect(Rect2(0,0,1280,832),Color("#142333"))
 if gallery_kind=="scenery":
  for i in range(captures.size()):
   var col=i/3
   var row=i%3
   var at=Vector2(col*426,row*266)
   gallery.draw_texture_rect(capture_textures[i],Rect2(at+Vector2(0,28),Vector2(426,238)),false)
   gallery.draw_string(ThemeDB.fallback_font,at+Vector2(5,19),app.landscape.Themes.NAMES[app.landscape.Themes.CHOICES[col]]+" · "+app.landscape.Themes.FEELS[row],HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("#e4d6ad"))
  return
 var a=app.landscape
 var old=a.ink
 var design=a.knight_design
 a.ink=gallery
 gallery.draw_string(ThemeDB.fallback_font,Vector2(20,26),"THE CLASSIC KNIGHT · TEN CLOSE RELATIVES",HORIZONTAL_ALIGNMENT_LEFT,-1,20,Color("#e4d6ad"))
 for k in range(10):
  var id=Knights.CHOICES[k]
  var x=16+(k%2)*632
  var y=42+(k/2)*154
  gallery.draw_rect(Rect2(x,y,616,144),Color("#203346"))
  gallery.draw_string(ThemeDB.fallback_font,Vector2(x+12,y+22),Knights.NAMES[id],HORIZONTAL_ALIGNMENT_LEFT,-1,17,Color("#d9cbac"))
  gallery.draw_set_transform(Vector2(x+54,y+49),0,Vector2(6,6))
  a.knight_design=id
  for i in range(4):
   var pose=app.sim.p.duplicate(true)
   pose.merge({"vx":0 if i==0 else 90,"vy":0,"facing":-1 if i==2 else 1,"state":"climb" if i==3 else "normal","onGround":i!=3,"parryTimer":0,"strikeTimer":0,"carrying":null,"dashes":1},true)
   a.draw_knight(pose,Vector2(i*23,0),13)
  gallery.draw_set_transform(Vector2.ZERO)
  gallery.draw_string(ThemeDB.fallback_font,Vector2(x+16,y+134),"Idle                     Run                 Turn                   Cling",HORIZONTAL_ALIGNMENT_LEFT,-1,12,Color("#a8bbc2"))
 a.knight_design=design
 a.ink=old
