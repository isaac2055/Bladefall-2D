extends SceneTree
## Run with the graphical renderer, --dev-graphics, and a room start.

func _initialize():
 run.call_deferred()

func require(ok:bool,label:String)->bool:
 print("PASS " if ok else "FAIL ",label)
 if not ok: quit(1)
 return ok

func run():
 var felix=ResourceLoader.exists("res://felix.tscn")
 var game=load("res://felix.tscn" if felix else "res://main.tscn").instantiate()
 if felix: game.developer_mode=true
 else: game.test_mode=true
 root.add_child(game)
 var lab=game.graphics_lab
 lab.cli_override=true
 var renderer=game.view if felix else game.landscape
 game.set_paused(true)
 lab.select_preset(9,true)
 var room=game.world.active_id
 var frame=game.world.frames
 var checkpoint=game.world.checkpoint_id
 var camera=renderer.camera
 lab.photo_button.pressed.emit()
 var photo=game.graphics_photo
 if not require(photo!=null and game.paused and not renderer.is_processing(),"Photo mode opens from the Graphics Lab and pauses presentation"): return
 var full=game.viewport.size
 if not require(photo.crop_rect(full)==Rect2i(Vector2i.ZERO,full),"Full frame includes the entire world viewport"): return
 photo.zoom.value=2.0
 photo.horizontal.value=1.0
 photo.vertical.value=0.0
 var half=Vector2i(Vector2(full)*.5)
 var crop=Rect2i(Vector2i(full.x-half.x,0),half)
 if not require(photo.preview.crop==crop,"Zoom and sliders select a bounded crop"): return
 var pan=InputEventMouseButton.new()
 pan.button_index=MOUSE_BUTTON_LEFT
 pan.pressed=true
 photo.preview.gui_input.emit(pan)
 var motion=InputEventMouseMotion.new()
 motion.button_mask=MOUSE_BUTTON_MASK_LEFT
 motion.relative=Vector2(140,-100)
 photo.preview.gui_input.emit(motion)
 if not require(photo.preview.crop.position.x<crop.position.x and photo.preview.crop.position.y>crop.position.y,"Dragging pans the crop without moving the camera"): return

 var f8=InputEventKey.new()
 f8.physical_keycode=KEY_F8
 f8.pressed=true
 photo._input(f8)
 if not require(lab.comparing and photo.look.text.begins_with("Previewing Original"),"F8 compares the rendered photo look"): return
 photo._input(f8)
 if not require(not lab.comparing and photo.look.text.begins_with("Storm"),"F8 returns to the current look"): return
 photo.reset_framing()
 if not require(photo.preview.crop==Rect2i(Vector2i.ZERO,full),"Reset framing returns to the full viewport"): return
 photo.zoom.value=2.0
 photo.photo_folder="user://graphics-photo-test-%d"%OS.get_process_id()
 await photo.save_photo()
 var files=DirAccess.get_files_at(photo.photo_folder)
 if not require(files.size()==1 and files[0].ends_with(".png"),"Save writes one PNG while Photo mode is open"): return
 var path=photo.photo_folder.path_join(files[0])
 var image=Image.load_from_file(path)
 var expected=game.viewport.get_texture().get_image().get_region(photo.crop_rect(full))
 if not require(image.get_size()==half and image.get_data()==expected.get_data(),"PNG matches the source crop pixel for pixel, with no interface"): return
 DirAccess.remove_absolute(path)
 DirAccess.remove_absolute(photo.photo_folder)
 if not require(game.world.active_id==room and game.world.frames==frame and game.world.checkpoint_id==checkpoint and renderer.camera==camera,"Framing and capture preserve room, world frame, camera and checkpoint"): return
 game.set_paused(false)
 if not require(game.graphics_photo==null and game.paused and game.is_processing(),"Exiting Photo mode returns to pause and restores processing"): return
 game.queue_free()
 await process_frame
 quit()
