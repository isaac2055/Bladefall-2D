extends SceneTree
## Run with --dev-graphics; use the normal renderer for the screenshot checks.
var failures=0

func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1

func _initialize(): run.call_deferred()

func run():
 var felix=ResourceLoader.exists("res://felix.tscn")
 var game=load("res://felix.tscn" if felix else "res://main.tscn").instantiate()
 if felix: game.developer_mode=true
 else: game.test_mode=true
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
 check(not view.lab_atmosphere.visible and lab.preset_picker.selected==3,"Effects can be overridden independently")
 lab.preset_picker.item_selected.emit(0)
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
 quit(1 if failures else 0)
