@tool
extends EditorPlugin
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const NUMBERS=[1,2,3,21,22,23,4]
const TITLES=["The Outskirts","Black Woods","Broken Causeway","Fractured Outskirts","Fractured Woods","Fractured Causeway","Movement Workshop · test level"]
var dock:ScrollContainer
var body:VBoxContainer
var chapter:OptionButton
var room_picker:OptionButton
var templates:OptionButton
var status:Label
var rooms=[]
var prototypes=[]
var chapter_root
var catalog_signature=0
var poll_time=0.0
func button(label,callback):
 var b=Button.new()
 b.text=label
 b.pressed.connect(callback)
 body.add_child(b)
 return b
func _enter_tree():
 dock=ScrollContainer.new()
 dock.name="Ascend"
 dock.custom_minimum_size.x=250*EditorInterface.get_editor_scale()
 dock.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED
 body=VBoxContainer.new()
 body.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 dock.add_child(body)
 var title=Label.new()
 title.text="ASCEND · CHAPTER EDITOR"
 body.add_child(title)
 chapter=OptionButton.new()
 chapter.clip_text=true
 for name in TITLES: chapter.add_item(name)
 body.add_child(chapter)
 button("Open chapter",open_chapter)
 room_picker=OptionButton.new()
 room_picker.clip_text=true
 room_picker.item_selected.connect(func(_i):select_room(false))
 body.add_child(room_picker)
 button("Select + frame room",func():select_room(false))
 button("Paint tiles in this room",func():select_room(true))
 button("Snap selected to 8px",snap_selected)
 templates=OptionButton.new()
 templates.clip_text=true
 body.add_child(templates)
 button("Add a copy in this room",add_object)
 button("Validate chapter",validate_chapter)
 button("Save + play this room",play_room)
 var help=Label.new()
 help.text="Paint with the TileMap palette.\nMove objects in 2D; edit values in Inspector.\nSelect MotionPath to edit route points.\nCtrl/Cmd-D duplicates; Delete removes.\nCtrl/Cmd-S saves; Ctrl/Cmd-Z undoes.\nAdvanced data retains every device setting."
 help.custom_minimum_size.x=240*EditorInterface.get_editor_scale()
 help.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 help.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 body.add_child(help)
 status=Label.new()
 status.custom_minimum_size.x=240*EditorInterface.get_editor_scale()
 status.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 body.add_child(status)
 add_control_to_dock(DOCK_SLOT_LEFT_BR,dock)
 reveal_dock.call_deferred()
 scene_changed.connect(refresh)
 refresh(EditorInterface.get_edited_scene_root())
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--ascend-editor-test="):
   run_editor_test.call_deferred(arg.trim_prefix("--ascend-editor-test="))
func reveal_dock():
 var child:Node=dock
 while child.get_parent()!=null:
  var parent=child.get_parent()
  if parent is TabContainer:
   var index=parent.get_tab_idx_from_control(child)
   if index>=0: parent.current_tab=index
   return
  child=parent
func _exit_tree():
 remove_control_from_docks(dock)
 dock.queue_free()
func open_chapter(): EditorInterface.open_scene_from_path("res://levels/world%d.tscn"%NUMBERS[chapter.selected])
func signature(root_node):
 var values=[]
 for room in root_node.get_node("Rooms").get_children():
  values.append([room.get_instance_id(),room.room_title,room.room_id])
  for item in room.get_node("Objects").get_children(): values.append([item.get_instance_id(),item.kind,item.glyph,item.parameters])
 return hash(values)
func _process(delta):
 poll_time+=delta
 if poll_time<.5: return
 poll_time=0
 if not is_instance_valid(chapter_root): return
 if signature(chapter_root)!=catalog_signature: refresh(chapter_root)
func refresh(root_node):
 var previous_room=""
 if not rooms.is_empty() and room_picker.selected>=0 and room_picker.selected<rooms.size() and is_instance_valid(rooms[room_picker.selected]): previous_room=rooms[room_picker.selected].room_id
 var previous_template=templates.get_item_text(templates.selected) if templates.selected>=0 else ""
 chapter_root=root_node
 rooms.clear()
 prototypes.clear()
 room_picker.clear()
 templates.clear()
 if root_node==null or not root_node.has_method("compile_into"):
  chapter_root=null
  status.text="Choose a chapter, then Open chapter."
  return
 chapter.select(NUMBERS.find(root_node.world_number))
 for room in root_node.get_node("Rooms").get_children():
  rooms.append(room)
  room_picker.add_item(room.room_title+" · "+room.room_id)
  for item in room.get_node("Objects").get_children():
   if item.kind=="Spawn": continue
   var label=item.kind+" · "+str(item.parameters.get("k",item.parameters.get("who",item.glyph if item.glyph!="" else item.name)))
   if templates.get_item_count()>0:
    var exists=false
    for i in range(templates.item_count):
     if templates.get_item_text(i)==label: exists=true;break
    if exists: continue
   templates.add_item(label)
   prototypes.append(item)
 for i in range(rooms.size()):
  if rooms[i].room_id==previous_room: room_picker.select(i)
 for i in range(templates.item_count):
  if templates.get_item_text(i)==previous_template: templates.select(i)
 catalog_signature=signature(root_node)
 status.text="%d rooms · saved scenes feed the game directly."%rooms.size()
func selected_room():
 if rooms.is_empty(): return null
 var candidate=rooms[max(0,room_picker.selected)]
 if not is_instance_valid(candidate):
  refresh(chapter_root)
  return rooms[0] if not rooms.is_empty() else null
 return candidate
func select_room(paint):
 var room=selected_room()
 if room==null: return
 var node=room.get_node("Tiles") if paint else room
 var selection=EditorInterface.get_selection()
 selection.clear()
 selection.add_node(node)
 EditorInterface.edit_node(node)
 EditorInterface.set_main_screen_editor("2D")
 focus_room.call_deferred(room)
 status.text="Editing "+room.room_title+". Use the wheel to zoom."
func focus_room(room):
 # These bound editor methods belong to the pinned Godot 4.5.1 UI.
 var editors=EditorInterface.get_base_control().find_children("*","CanvasItemEditor",true,false)
 if editors.is_empty(): return
 var canvas=editors[0]
 var widgets=canvas.find_children("*","EditorZoomWidget",true,false)
 if not widgets.is_empty():
  var view=EditorInterface.get_editor_viewport_2d()
  var size=Vector2(room.map_width*8,room.map_height*8)
  var zoom=clamp(min(view.size.x/(size.x+80),view.size.y/(size.y+80)),.25,6.0)
  widgets[0].call("set_zoom",zoom)
  widgets[0].emit_signal("zoom_changed",zoom)
 if canvas.has_method("center_at"): canvas.call_deferred("center_at",room.global_position+Vector2(room.map_width,room.map_height)*4)
func snap_selected():
 var undo=get_undo_redo()
 undo.create_action("Snap Ascend objects to grid")
 for node in EditorInterface.get_selection().get_selected_nodes():
  if node is Node2D:
   undo.add_do_property(node,"position",node.position.snapped(Vector2(8,8)))
   undo.add_undo_property(node,"position",node.position)
 undo.commit_action()
func set_owners(node,owner_node):
 node.owner=owner_node
 for child in node.get_children(): set_owners(child,owner_node)
func add_object():
 var room=selected_room()
 if room==null or prototypes.is_empty(): return
 var original=prototypes[templates.selected]
 if not is_instance_valid(original):
  refresh(chapter_root)
  return
 var node=original.duplicate()
 var spawn=room.get_node_or_null("Objects/Spawn")
 node.position=(spawn.position if spawn!=null else Vector2(16,16))+Vector2(16,0)
 node.name=str(original.name)+"_copy"
 var parent=room.get_node("Objects")
 var undo=get_undo_redo()
 undo.create_action("Add Ascend "+node.kind)
 undo.add_do_method(parent,"add_child",node,true)
 undo.add_do_method(self,"set_owners",node,chapter_root)
 undo.add_undo_method(parent,"remove_child",node)
 undo.add_do_reference(node)
 undo.commit_action()
 EditorInterface.get_selection().clear()
 EditorInterface.get_selection().add_node(node)
 EditorInterface.edit_node(node)
func validate_chapter():
 if chapter_root==null: return false
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%chapter_root.world_number))
 var data=chapter_root.compile_into(Authoring.baseline(source))
 var errors=chapter_root.validate_data(data)
 status.text="Chapter valid · %d rooms ready to play."%rooms.size() if errors.is_empty() else "\n".join(errors)
 return errors.is_empty()
func play_room():
 if not validate_chapter(): return
 var room=selected_room()
 var undo=get_undo_redo()
 undo.create_action("Choose Ascend play room")
 undo.add_do_property(chapter_root,"play_room_id",room.room_id)
 undo.add_undo_property(chapter_root,"play_room_id",chapter_root.play_room_id)
 undo.commit_action()
 if EditorInterface.save_scene()!=OK:
  status.text="Save failed; chapter was not launched."
  return
 EditorInterface.play_custom_scene(chapter_root.scene_file_path)
func run_editor_test(path):
 var runner=load(path).new()
 add_child(runner)
 runner.run(self)
