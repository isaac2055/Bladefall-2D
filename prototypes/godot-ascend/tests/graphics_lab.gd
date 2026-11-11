extends SceneTree
## Run with --dev-graphics; use the normal renderer for the screenshot checks.
var failures=0

func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1

func _initialize(): run.call_deferred()

func run():
 var felix=ResourceLoader.exists("res://felix.tscn")
 var fixture="user://graphics-lab-qa-%d.json"%OS.get_process_id()
 var game=load("res://felix.tscn" if felix else "res://main.tscn").instantiate()
 if felix: game.developer_mode=true
 else:
  game.test_mode=true
  game.sampler=load("res://scripts/sampler_run.gd").new(fixture)
 root.add_child(game)
 game.set_physics_process(false)
 var lab=game.graphics_lab
 lab.cli_override=true
 var view=game.view if felix else game.landscape
 var container=game.viewport.get_parent()
 var auto=container.stretch_shrink
 var bounds=container.get_rect()
 var frames=game.world.frames
 var position=game.world.position()
 var checkpoint=game.world.checkpoint_id
 var signature=game.world.content_signature
 view.reduced_motion=false
 var shadows=view.lights.map(func(item): return item.node.shadow_enabled)
 game.set_paused(true)
 check(lab.active and lab.visible,"Graphics Lab is available in the dev pause menu")
 var quick=InputEventKey.new()
 quick.physical_keycode=KEY_F9
 quick.pressed=true
 game._unhandled_input(quick)
 check(lab.preset_picker.selected==1,"F9 compares the next preset in place")
 check(not view.post.visible and not view.wind.visible and not view.wind.emitting,"Clear bypasses post-processing and ambient emissions")
 check(view.lights.all(func(item):return not item.node.shadow_enabled and not item.sparks.emitting),"Clear disables only decorative shadows and sparks")
 lab.scale_picker.item_selected.emit(2)
 check(game.viewport.size==Vector2i(640,368) and view.scale==Vector2(2,2) and container.get_rect()==bounds,"Half scale leaves the logical gameplay and touch rectangle unchanged")
 lab.scale_picker.item_selected.emit(1)
 check(game.viewport.size==Vector2i(1280,736) and view.scale==Vector2(4,4) and container.get_rect()==bounds,"Full scale leaves the logical gameplay and touch rectangle unchanged")
 lab.preset_picker.item_selected.emit(2)
 check(view.lab_atmosphere!=null and view.lab_atmosphere.visible and view.lab_atmosphere.motion,"Atmospheric adds a moving layer")
 view.reduced_motion=true
 game.apply_graphics_lab()
 check(not view.lab_atmosphere.motion and not view.wind.emitting,"Reduced Motion suppresses atmospheric movement")
 lab.switches.atmosphere.toggled.emit(false)
 check(not view.lab_atmosphere.visible and lab.preset_picker.selected==lab.CUSTOM,"Effects can be overridden independently")
 var original_material=view.tiles.material
 view.reduced_motion=false
 lab.preset_picker.item_selected.emit(3)
 check(view.lab_atmosphere.visible and view.lab_atmosphere.scenery==1 and view.lab_atmosphere.weather==2 and view.lab_atmosphere.speed==1,"Illustrated combines scenery, glints and gentle motion")
 check(view.tiles.material is ShaderMaterial and view.tiles.material.get_shader_parameter("finish")==2,"Etched finish applies only to terrain paint")
 var layer=view.lab_atmosphere
 var sample_clock=view.clock
 layer.update_sample(sample_clock+.04,view.camera.x,false)
 var gentle_age=layer.age
 layer.speed=2
 layer.update_sample(sample_clock+.08,view.camera.x,false)
 check(is_equal_approx(layer.age-gentle_age,.04),"Changing weather speed preserves its current animation phase")
 lab.preset_picker.item_selected.emit(4)
 check(view.lab_atmosphere.scenery==2 and view.lab_atmosphere.weather==1 and not view.wind.emitting,"Nightfall uses rain without stacking ambient particles")
 game._unhandled_input(quick)
 check(lab.preset_picker.selected==5 and view.lab_atmosphere.weather==4 and view.lab_atmosphere.palette==1 and view.tiles.material.get_shader_parameter("finish")==3,"F9 selects Autumn leaves, Amber scenery and Brushed terrain")
 lab.save_favorite()
 lab.select_preset(0,false)
 lab.recall_favorite()
 check(lab.options.preset==5 and lab.options.weather==4 and lab.options.finish==3,"New seasonal IDs survive favorite validation and recall")
 game._unhandled_input(quick)
 check(lab.preset_picker.selected==6 and view.lab_atmosphere.weather==3 and view.lab_atmosphere.palette==2,"F9 selects Frostlight snow and Frost scenery")
 view.reduced_motion=true
 game.apply_graphics_lab()
 check(not view.lab_atmosphere.motion,"Reduced Motion stops the seasonal weather")
 view.reduced_motion=false
 game._unhandled_input(quick)
 check(lab.preset_picker.selected==0,"F9 wraps Frostlight back to Original")
 lab.preset_picker.item_selected.emit(4)
 lab.extra_pickers.weather.item_selected.emit(2)
 check(view.lab_atmosphere.weather==2 and view.lab_atmosphere.scenery==2,"Weather can change without replacing the backdrop")
 lab.extra_pickers.motion.item_selected.emit(0)
 check(not view.lab_atmosphere.motion and view.lab_atmosphere.visible,"Still freezes the scenery without removing the backdrop")
 lab.extra_pickers.finish.item_selected.emit(0)
 check(view.tiles.material==original_material and view.lab_atmosphere.visible,"Surface and backdrop can be changed independently")
 lab.preset_picker.item_selected.emit(3)
 lab.strength_sliders.surface_strength.value=35
 lab.strength_sliders.backdrop_strength.value=60
 lab.strength_sliders.weather_strength.value=40
 lab.extra_pickers.density.item_selected.emit(0)
 check(is_equal_approx(view.tiles.material.get_shader_parameter("strength"),.35) and is_equal_approx(view.lab_atmosphere.backdrop_strength,.6) and is_equal_approx(view.lab_atmosphere.weather_strength,.4) and view.lab_atmosphere.density==0,"Strength and density controls reach the real render layers")
 var custom=lab.options.duplicate()
 var compare=InputEventKey.new()
 compare.physical_keycode=KEY_F8
 compare.pressed=true
 game._unhandled_input(compare)
 check(lab.comparing and view.tiles.material==original_material and not view.lab_atmosphere.visible and lab.options==custom,"F8 previews Original without discarding custom settings")
 check(lab.badge.visible and lab.badge.text.contains("Original"),"A/B comparison announces the displayed look")
 game._unhandled_input(compare)
 check(not lab.comparing and lab.options==custom and view.lab_atmosphere.visible and is_equal_approx(view.tiles.material.get_shader_parameter("strength"),.35),"F8 restores the exact custom look")
 var config_path="user://graphics-favorite-qa-%d.cfg"%OS.get_process_id()
 lab.path=config_path
 lab.cli_override=false
 lab.save_favorite()
 lab.preset_picker.item_selected.emit(0)
 lab.recall_favorite()
 check(lab.options==custom and lab.favorite==custom and not lab.recall_button.disabled,"Favorite survives preset changes and restores all strengths")
 var other=load("res://scripts/graphics_lab.gd").new()
 other.setup(root,null,false,PackedStringArray())
 other.path=config_path
 other.set_active(true)
 check(other.favorite==custom and other.options==custom,"Developer options and favorite survive a fresh settings instance")
 other.free()
 lab.cli_override=true
 if FileAccess.file_exists(config_path): DirAccess.remove_absolute(ProjectSettings.globalize_path(config_path))
 lab.strength_sliders.surface_strength.value=0
 lab.strength_sliders.backdrop_strength.value=0
 lab.strength_sliders.weather_strength.value=0
 check(view.tiles.material==original_material and not view.lab_atmosphere.visible,"Zero strength removes experimental rendering work")
 lab.strength_sliders.backdrop_strength.value=60
 lab.set_override("parallax",false)
 check(not view.lab_atmosphere.parallax,"Scenery camera motion can be disabled separately")
 var legacy=ConfigFile.new()
 legacy.set_value("graphics","preset",3)
 legacy.set_value("graphics","particles",false)
 legacy.set_value("graphics","scale",2)
 lab.read_options(legacy)
 check(lab.options.preset==lab.CUSTOM and not lab.options.particles and lab.options.scale==2 and lab.options.scenery==0,"Old custom settings migrate without becoming Illustrated")
 var previous_favorite={"preset":5,"weather":2,"surface_strength":35}
 var migrated=lab.validated(previous_favorite,3)
 check(migrated.preset==lab.CUSTOM and migrated.weather==2 and migrated.surface_strength==35,"Version 3 custom favorites remain Custom after seasonal presets are added")
 legacy.set_value("graphics","version",3)
 legacy.set_value("graphics","preset",5)
 lab.read_options(legacy)
 check(lab.options.preset==lab.CUSTOM,"Version 3 custom options do not silently become Autumn")
 lab.preset_picker.item_selected.emit(0)
 check(view.tiles.material==original_material and not view.lab_atmosphere.visible,"Original removes both experimental render layers")
 check(view.post.visible and view.wind.visible and container.stretch_shrink==auto,"Original restores post, ambient particles and automatic resolution")
 check(view.lights.map(func(item):return item.node.shadow_enabled)==shadows,"Original restores each light's previous shadow setting")
 check(game.paused and game.world.frames==frames and game.world.position()==position and game.world.checkpoint_id==checkpoint and game.world.content_signature==signature,"Changing visuals while paused preserves the world and checkpoint")
 if not felix:
  lab.preset_picker.item_selected.emit(1)
  game.switch_chapter(3)
  check(game.chapter_number==3 and not game.landscape.post.visible,"Selected preset follows Bladefall route changes")
  game.set_dev_mode(false)
  check(not lab.visible and game.landscape.post.visible,"Leaving dev mode hides the panel and restores Original")
 game.queue_free()
 await process_frame
 if FileAccess.file_exists(fixture): DirAccess.remove_absolute(ProjectSettings.globalize_path(fixture))
 quit(1 if failures else 0)
