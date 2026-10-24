extends Node
const Core = preload("res://scripts/core.gd")
const Loader = preload("res://scripts/room_loader.gd")
const Landscape = preload("res://scripts/landscape.gd")
var data
var sim
var landscape
var current = 0
var watch = false
var tape = []
var tape_frame = 0
var hold = 0
var status: Label
var title: Label
var room_picker: OptionButton
var watch_button: Button
var capture_path = ""
var ticks = 0
var screenshot_after = 100
var viewport: SubViewport
func label_at(text,x,y,size,color="#cad5d5"):
 var l = Label.new()
 l.text = text
 l.position = Vector2(x,y)
 l.add_theme_font_size_override("font_size",size)
 l.add_theme_color_override("font_color",Color(color))
 add_child(l)
 return l
func button_at(text,x,y,callback):
 var b = Button.new()
 b.text = text
 b.position = Vector2(x,y)
 b.size = Vector2(110,30)
 b.focus_mode = Control.FOCUS_NONE
 b.pressed.connect(callback)
 add_child(b)
 return b
func _ready():
 var bindings = {"move_left":[KEY_LEFT,KEY_A],"move_right":[KEY_RIGHT,KEY_D],"aim_up":[KEY_UP,KEY_W],"aim_down":[KEY_DOWN,KEY_S],"knight_jump":[KEY_SPACE],"knight_dash":[KEY_X],"knight_grab":[KEY_SHIFT],"knight_strike":[KEY_C]}
 for action in bindings:
  if not InputMap.has_action(action): InputMap.add_action(action)
  for code in bindings[action]:
   var event = InputEventKey.new()
   event.physical_keycode = code
   InputMap.action_add_event(action,event)
 RenderingServer.set_default_clear_color(Color("101b26"))
 data = JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json"))
 sim = Core.new(data.constants,data.playerDefaults)
 label_at("B L A D E F A L L     /     E N G I N E   S T U D Y",32,16,13,"#b5b392")
 title = label_at("ASCEND · THE OUTSKIRTS",32,36,27,"#e6e4d0")
 label_at("Godot 4.5 · native fixed-step movement · original 8 px maps",33,74,14,"#9cabaa")
 var container = SubViewportContainer.new()
 container.position = Vector2(32,112)
 container.size = Vector2(960,552)
 container.stretch = true
 viewport = SubViewport.new()
 viewport.size = Vector2i(320,184)
 viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
 viewport.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
 container.add_child(viewport)
 # Stretch shrink preserves a true low-resolution canvas at exactly 3x.
 container.stretch_shrink = 3
 add_child(container)
 landscape = Landscape.new()
 landscape.world_data = data
 viewport.add_child(landscape)
 room_picker = OptionButton.new()
 room_picker.position = Vector2(540,36)
 room_picker.size = Vector2(450,32)
 for d in data.world.rooms: room_picker.add_item(d.get("name",d.id))
 room_picker.focus_mode = Control.FOCUS_NONE
 room_picker.item_selected.connect(func(index):load_section(index))
 add_child(room_picker)
 watch_button = button_at("Watch route",540,73,toggle_watch)
 button_at("Restart · R",658,73,func():load_section(current))
 button_at("Lighting",776,73,func():landscape.lit = not landscape.lit)
 status = label_at("",32,670,14)
 label_at("← → / A D  move     SPACE  jump     X  dash     SHIFT  grab / carry     ↑ ↓  aim / climb",32,695,13,"#9cabaa")
 var args = OS.get_cmdline_user_args()
 for i in range(args.size()):
  if args[i]=="--capture" and i+1<args.size(): capture_path = args[i+1]
  elif args[i]=="--watch": watch = true
  elif args[i]=="--room" and i+1<args.size(): current = int(args[i+1])
 load_section(current)
func toggle_watch():
 if watch:
  watch = false
  hold = 0
  watch_button.text = "Watch route"
 else:
  watch = true
  load_section(current)
func load_section(index):
 current = index
 sim.prev = {}
 sim.buf = {"jump":0,"dash":0,"grab":0,"strike":0,"parry":0,"portal":0}
 sim.freeze = 0
 sim.load_room(Loader.parse(data.world.rooms[index]))
 landscape.load_scene(sim)
 tape = []
 for part in data.world.tapes.get(sim.room.id,[]):
  for i in range(int(part[0])): tape.append(part[1])
 tape_frame = 0
 hold = 0
 room_picker.select(index)
 watch_button.text = "Take control" if watch else "Watch route"
 title.text = "ASCEND · "+sim.room.name.to_upper()
 # Long room names stay in the picker; the world title remains readable.
 if title.text.length()>29: title.text = "ASCEND · THE OUTSKIRTS"
func input_now():
 return {"l":Input.is_action_pressed("move_left"),"r":Input.is_action_pressed("move_right"),"u":Input.is_action_pressed("aim_up"),"d":Input.is_action_pressed("aim_down"),"jump":Input.is_action_pressed("knight_jump"),"dash":Input.is_action_pressed("knight_dash"),"grab":Input.is_action_pressed("knight_grab"),"strike":Input.is_action_pressed("knight_strike")}
func decode(keys):
 var raw = {}
 var letters = {"l":"l","r":"r","u":"u","d":"d","jump":"j","dash":"x","grab":"g","strike":"s","parry":"p","portal":"q"}
 for key in letters: raw[key] = letters[key] in keys
 return raw
func _physics_process(_delta):
 if sim==null: return
 ticks += 1
 if Input.is_physical_key_pressed(KEY_R): load_section(current)
 if hold>0:
  hold -= 1
  if hold==0 and watch: next_section()
 else:
  if watch:
   if tape_frame<tape.size():
    sim.step(decode(tape[tape_frame]))
    tape_frame += 1
  else: sim.step(input_now())
  if sim.exited:
   if watch: hold = 55
   else: next_section()
 status.text = "%s   ·   %s   ·   Dash %d   ·   Stamina %d   ·   Deaths %d" % ["RECORDED ROUTE" if watch else "PLAY",sim.room.name,sim.p.dashes,max(0,sim.p.stamina),sim.deaths]
 if watch and tape.is_empty(): status.text = "No recorded route for this connecting passage · Take control to explore"
 if capture_path!="" and ticks==screenshot_after: capture.call_deferred()
func next_section():
 var sections = data.world.sections
 var index = -1
 for i in range(sections.size()):
  if sections[i].room==sim.room.id: index = i
 if index>=0 and index+1<sections.size():
  var target = sections[index+1].room
  for i in range(data.world.rooms.size()):
   if data.world.rooms[i].id==target:
    var source = sections[index]
    var destination = sections[index+1]
    var snapshot = {"p":sim.p.duplicate(true),"prev":sim.prev.duplicate(),"buf":sim.buf.duplicate()}
    load_section(i)
    if not watch:
     sim.carry_from(snapshot,{"x":source.x*8,"y":source.y*8},{"x":destination.x*8,"y":destination.y*8},sim.room.def.get("atlasJunction",false))
    return
 watch = false
 status.text = "Route finished · select another section to compare"
func capture():
 await RenderingServer.frame_post_draw
 var result = get_viewport().get_texture().get_image().save_png(capture_path)
 print("Capture: ",capture_path," result ",result)
 get_tree().quit(0 if result==OK else 1)
