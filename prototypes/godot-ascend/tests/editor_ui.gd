@tool
extends Node
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func frames(count=12):
 for i in range(count): await get_tree().process_frame
func run(plugin):
 await frames(40)
 for i in range(plugin.NUMBERS.size()):
  plugin.chapter.select(i)
  plugin.open_chapter()
  await frames(30)
  check(plugin.chapter_root!=null and plugin.chapter_root.world_number==plugin.NUMBERS[i],"Editor opens chapter "+str(plugin.NUMBERS[i]))
  check(plugin.validate_chapter(),"Editor validates all rooms in chapter "+str(plugin.NUMBERS[i]))
  plugin.room_picker.select(0)
  plugin.select_room(true)
  check(EditorInterface.get_selection().get_selected_nodes()==[plugin.rooms[0].get_node("Tiles")],"TileMap selected for painting")
 plugin.chapter.select(1)
 plugin.open_chapter()
 await frames(30)
 var room=plugin.rooms[0]
 var template=-1
 for i in range(plugin.prototypes.size()):
  if plugin.prototypes[i].kind=="Prop": template=i;break
 plugin.templates.select(template)
 var parent=room.get_node("Objects")
 var before=parent.get_child_count()
 plugin.add_object()
 check(parent.get_child_count()==before+1,"Dock adds an owned editable prop")
 var added=parent.get_child(-1)
 check(added.owner==plugin.chapter_root,"New prop persists with scene ownership")
 var undo=plugin.get_undo_redo().get_history_undo_redo(plugin.get_undo_redo().get_object_history_id(plugin.chapter_root))
 undo.undo()
 check(parent.get_child_count()==before,"Undo removes added prop")
 undo.redo()
 check(parent.get_child_count()==before+1,"Redo restores added prop")
 added.tint=Color("#d270b9")
 added.scale=Vector2(1.5,1.25)
 added.position+=Vector2(8,0)
 EditorInterface.mark_scene_as_unsaved()
 EditorInterface.save_scene_as("res://tests/editor-workbench.tscn")
 await frames(15)
 var disk=ResourceLoader.load("res://tests/editor-workbench.tscn","",ResourceLoader.CACHE_MODE_IGNORE).instantiate()
 var copy=disk.get_node("Rooms").get_child(0).get_node("Objects").get_child(-1)
 check(copy.tint==added.tint and copy.scale==added.scale and copy.position==added.position,"Editor saves transform and color to disk")
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world2.json"))
 var data=preload("res://scripts/authoring_data.gd").read(source,"res://tests/editor-workbench.tscn")
 check(data.world.rooms[0].decor[-1].tint==added.tint.to_html(),"Game loads the prop actually saved by the editor")
 disk.free()
 plugin.reveal_dock()
 await frames(8)
 plugin.room_picker.select(0)
 plugin.select_room(false)
 await frames(8)
 var viewport=EditorInterface.get_editor_viewport_2d()
 var center=room.global_position+Vector2(room.map_width,room.map_height)*4
 var screen=viewport.global_canvas_transform*center
 check(screen.distance_to(Vector2(viewport.size)*.5)<50,"Room navigation centers the actual 2D editor view")
 check(viewport.size.y<get_tree().root.size.y,"Dock layout keeps editor viewport within the window")
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 EditorInterface.get_base_control().queue_redraw()
 await RenderingServer.frame_post_draw
 viewport.get_texture().get_image().save_png(ProjectSettings.globalize_path("res://../../.cache/godot/editor-canvas.png"))
 var picture=get_tree().root.get_texture().get_image()
 picture.save_png(ProjectSettings.globalize_path("res://../../.cache/godot/editor-ui.png"))
 print("EDITOR UI RESULT: ",failures," failures")
 get_tree().quit(1 if failures else 0)
