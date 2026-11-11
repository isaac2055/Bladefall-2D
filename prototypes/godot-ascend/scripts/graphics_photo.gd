extends CanvasLayer
## A crop of the live world viewport. The game camera and HUD stay untouched.

class Preview extends Control:
 var source:SubViewport
 var crop=Rect2i()

 func _draw():
  if is_instance_valid(source) and crop.has_area():
   draw_texture_rect_region(source.get_texture(),Rect2(Vector2.ZERO,size),Rect2(crop))

signal closed

var preview:Preview
var renderer:Node2D
var game:Node
var lab
var source:SubViewport
var game_was_processing:bool
var renderer_was_processing:bool
var zoom:Slider
var horizontal:Slider
var vertical:Slider
var look:Label
var status:Label
var save_button:Button
var dragging=false
var capturing=false
var open=true
var photo_folder="user://photos"
var prefix:String

func setup(owner_game:Node,world:SubViewport,world_renderer:Node2D,graphics_lab,name_prefix:String):
 game=owner_game
 source=world
 renderer=world_renderer
 lab=graphics_lab
 prefix=name_prefix
 layer=95
 game_was_processing=game.is_processing()
 renderer_was_processing=renderer.is_processing()
 game.set_process(false)
 renderer.set_process(false)

 var backdrop=ColorRect.new()
 backdrop.color=Color("#10141f")
 backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 add_child(backdrop)
 var title=Label.new()
 title.text="Photo mode"
 title.position=Vector2(40,43)
 title.add_theme_font_size_override("font_size",34)
 backdrop.add_child(title)
 look=Label.new()
 look.position=Vector2(40,91)
 look.add_theme_color_override("font_color",Color("#b8c7df"))
 backdrop.add_child(look)

 preview=Preview.new()
 preview.source=source
 preview.position=Vector2(40,146)
 preview.size=Vector2(880,506)
 preview.texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
 preview.mouse_default_cursor_shape=Control.CURSOR_DRAG
 preview.gui_input.connect(preview_input)
 backdrop.add_child(preview)

 var tools=VBoxContainer.new()
 tools.position=Vector2(952,146)
 tools.custom_minimum_size.x=288
 tools.add_theme_constant_override("separation",12)
 backdrop.add_child(tools)
 zoom=slider(tools,"Zoom",1.0,3.0,.25,1.0)
 horizontal=slider(tools,"Horizontal frame",0.0,1.0,.01,.5)
 vertical=slider(tools,"Vertical frame",0.0,1.0,.01,.5)
 button(tools,"Reset framing",reset_framing)
 save_button=button(tools,"Save PNG",save_photo)
 if not OS.has_feature("web"):
  button(tools,"Open photo folder",open_folder)
 button(tools,"Back to pause",close)
 keep_focus_inside(tools)

 status=Label.new()
 status.position=Vector2(40,677)
 status.size=Vector2(880,85)
 status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 status.text="Zoom and drag to frame the shot."
 backdrop.add_child(status)
 lab.changed.connect(refresh_look)
 source.size_changed.connect(refresh_crop)
 refresh_look()
 save_button.grab_focus()

func slider(parent:VBoxContainer,title:String,low:float,high:float,step_size:float,initial:float)->Slider:
 var label=Label.new()
 label.text=title
 parent.add_child(label)
 var control=HSlider.new()
 control.accessibility_name=title
 control.custom_minimum_size.y=32
 control.min_value=low
 control.max_value=high
 control.step=step_size
 control.value=initial
 control.value_changed.connect(func(_value):refresh_crop())
 parent.add_child(control)
 return control

func button(parent:VBoxContainer,title:String,action:Callable)->Button:
 var control=Button.new()
 control.text=title
 control.custom_minimum_size.y=52
 control.add_theme_font_size_override("font_size",23)
 control.pressed.connect(action)
 parent.add_child(control)
 return control

func keep_focus_inside(tools:VBoxContainer):
 var controls=tools.get_children().filter(func(child): return child is BaseButton or child is Slider)
 for i in range(controls.size()):
  var control:Control=controls[i]
  control.focus_next=control.get_path_to(controls[(i+1)%controls.size()])
  control.focus_previous=control.get_path_to(controls[posmod(i-1,controls.size())])
  control.focus_neighbor_bottom=control.focus_next
  control.focus_neighbor_top=control.focus_previous
  control.focus_neighbor_left=NodePath(".")
  control.focus_neighbor_right=NodePath(".")

func refresh_look():
 if not open: return
 look.text="Previewing "+lab.comparison_name() if lab.comparing else lab.current_name()
 if not game.mobile: look.text+="   ·   F8 compares   ·   F9 cycles looks"
 renderer._process(0.0)
 refresh_crop()

func crop_rect(pixels:Vector2i)->Rect2i:
 var area=Vector2i(Vector2(pixels)/zoom.value).clamp(Vector2i.ONE,pixels)
 var free=pixels-area
 var origin=Vector2i(roundi(free.x*horizontal.value),roundi(free.y*vertical.value))
 return Rect2i(origin,area)

func refresh_crop():
 if not open: return
 preview.crop=crop_rect(source.size)
 preview.queue_redraw()

func reset_framing():
 zoom.set_value_no_signal(1.0)
 horizontal.set_value_no_signal(.5)
 vertical.set_value_no_signal(.5)
 refresh_crop()

func preview_input(event:InputEvent):
 if event is InputEventMouseButton and event.button_index==MOUSE_BUTTON_LEFT:
  dragging=event.pressed
 elif event is InputEventMouseMotion and dragging:
  if not event.button_mask & MOUSE_BUTTON_MASK_LEFT:
   dragging=false
   return
  var free=source.size-preview.crop.size
  if free.x<=0 or free.y<=0: return
  var delta=event.relative/preview.size*Vector2(preview.crop.size)
  horizontal.value-=delta.x/free.x
  vertical.value-=delta.y/free.y

func _input(event:InputEvent):
 if not open: return
 if event.is_action_pressed("knight_pause") or event.is_action_pressed("ui_cancel"):
  get_viewport().set_input_as_handled()
  close()
 elif lab.handle_shortcut(event):
  get_viewport().set_input_as_handled()

func save_photo():
 if not open or capturing or DisplayServer.get_name()=="headless": return
 capturing=true
 save_button.disabled=true
 await get_tree().process_frame
 await RenderingServer.frame_post_draw
 if not open: return
 var image=source.get_texture().get_image()
 var name=prefix+"-"+Time.get_datetime_string_from_system().replace(":","-")+"-%d.png"%Time.get_ticks_msec()
 var result=ERR_CANT_CREATE
 if image!=null and not image.is_empty():
  var shot=image.get_region(crop_rect(image.get_size()))
  if OS.has_feature("web"):
   JavaScriptBridge.download_buffer(shot.save_png_to_buffer(),name,"image/png")
   result=OK
  elif DirAccess.make_dir_recursive_absolute(photo_folder)==OK:
   result=shot.save_png(photo_folder.path_join(name))
 status.text="Saved "+name if result==OK else "Could not save the photo."
 save_button.disabled=false
 capturing=false

func open_folder():
 if DirAccess.make_dir_recursive_absolute(photo_folder)!=OK or OS.shell_open(ProjectSettings.globalize_path(photo_folder))!=OK:
  status.text="Could not open the photo folder."

func close():
 if not open: return
 open=false
 game.set_process(game_was_processing)
 renderer.set_process(renderer_was_processing)
 hide()
 closed.emit()
 queue_free()
