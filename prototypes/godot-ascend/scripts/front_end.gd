extends Control
## Original code-drawn opening: a willow grows, a knight crosses the broken road, the title arrives.
var app
var squash=0.0
var reduced_motion=false
var age=0.0
var phase="studio"
var menu:VBoxContainer
var back:Button
var play:Button
var routes:HBoxContainer
var worlds:OptionButton
var scene_time=0.0
var first_focus=true
func _ready():
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 mouse_filter=Control.MOUSE_FILTER_STOP
 menu=VBoxContainer.new();menu.position=Vector2(740,380);menu.custom_minimum_size.x=360;menu.add_theme_constant_override("separation",12);add_child(menu)
 play=app.button(menu,"Start journey",start_selected,false)
 worlds=OptionButton.new();worlds.focus_mode=Control.FOCUS_ALL;worlds.custom_minimum_size.y=42;menu.add_child(worlds)
 worlds.item_selected.connect(func(_index):refresh_play();refresh_routes())
 routes=HBoxContainer.new();routes.add_theme_constant_override("separation",8);menu.add_child(routes)
 app.button(menu,"Controls and remapping",func():app.controls_menu.open(),false)
 app.button(menu,"Settings",func():
  app.root_ui.show();app.root_ui.move_to_front();app.set_paused(true);app.pause_panel.show();app.focus_pause(),false)
 app.button(menu,"Quit",func():app.close_app(),false)
 menu.hide()
 back=app.button(self,"Return to journey",func():hide();app.root_ui.show();app.set_paused(false),false);back.position=Vector2(740,750);back.hide()
func open(intro=false):
 intro=intro and not app.landscape.reduced_motion
 show();move_to_front();age=0
 phase="studio" if intro else "title"
 menu.visible=not intro
 back.visible=not intro and app.world.frames>0
 refresh_worlds()
 app.set_paused(true);app.pause_panel.hide()
 app.root_ui.hide()
 if not intro: play.grab_focus()
func show_title():
 app.pause_panel.hide()
 app.root_ui.hide()
 move_to_front()
 phase="title";age=0;menu.show()
 app.audio.music.stream_paused=false
 refresh_worlds();play.grab_focus()
func refresh_worlds():
 if worlds==null: return
 worlds.clear()
 for n in app.CHAPTERS:
  if n==4 or not app.sampler.profile.has_world(n): continue
  worlds.add_item(app.world_label(n),n)
 var desired=worlds.get_item_index(app.sampler.profile.last_world)
 worlds.select(maxi(0,desired))
 if worlds.item_count>0:
  refresh_play()
 refresh_routes()
func start_selected():
 if worlds.item_count==0: return
 var n=worlds.get_selected_id()
 hide();app.root_ui.show()
 if app.SaveState.exists(app.sampler.profile,n): app.resume_world(n)
 else:
  app.switch_chapter(n)
  app.restart_world()
 app.discover_current()
func _input(event):
 if not visible or app.controls_menu!=null and app.controls_menu.visible: return
 if phase!="title": get_viewport().set_input_as_handled()
func _process(delta):
 if not visible: return
 age+=delta
 reduced_motion=app.landscape.reduced_motion
 if not app.landscape.reduced_motion: scene_time+=delta
 if phase=="studio" and age>4.2:
  phase="cutscene";age=0
  app.audio.music.stream_paused=false
 elif phase=="cutscene" and age>6.2: show_title()
 queue_redraw()
func word(value,at,size,color):
 var font=ThemeDB.fallback_font
 draw_string(font,at,value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color)
func _draw():
 draw_rect(Rect2(0,0,1280,832),Color("#09151c"))
 if phase=="studio":
  var growth=smoothstep(0,2.6,age)
  draw_circle(Vector2(640,335),130,Color(.24,.37,.34,.08))
  willow(Vector2(640,460),growth,1)
  var fade=smoothstep(.8,2.5,age)*(1-smoothstep(3.5,4.2,age))
  word("WILLOW STUDIOS",Vector2(434,560),36,Color(.88,.85,.70,fade))
  word("a quiet light, a long way home",Vector2(496,597),17,Color(.57,.68,.64,fade))
  return
 # Moon, distant keeps and moving forest silhouettes remain animated behind the title.
 draw_circle(Vector2(1180,125),64,Color("#d6ceab"))
 draw_circle(Vector2(1207,106),62,Color("#09151c"))
 for i in range(10):
  var x=i*143-60
  var y=300+sin(i*2.1)*56
  draw_rect(Rect2(x,y,72,440),Color("#142932"))
  for tooth in range(4): draw_rect(Rect2(x+tooth*20-3,y-15,12,20),Color("#142932"))
 for i in range(6):
  var x=i*245-90
  draw_line(Vector2(x,690),Vector2(x+35,260),Color("#19342f"),24)
  for j in range(5): draw_line(Vector2(x+22,410+j*30),Vector2(x+sin(j*2.4)*130,300+j*28),Color("#19342f"),12)
 # The broken causeway has a visible arch and weathered strata.
 for i in range(8):
  var x=i*180-80
  draw_rect(Rect2(x,650,132,182),Color("#263c42"))
  draw_rect(Rect2(x-8,636,196,16),Color("#7c8d7c"))
  for j in range(6): draw_line(Vector2(x,665+j*26),Vector2(x+132,666+j*26),Color("#172d36"),2)
  draw_arc(Vector2(x+154,690),37,PI,TAU,16,Color("#415654"),18)
 willow(Vector2(280,640),1,1.8)
 for i in range(25):
  var at=Vector2(fposmod(i*77+scene_time*(9+i%4),1340)-30,140+fposmod(i*41+scene_time*13,510))
  draw_line(at,at+Vector2(4+sin(scene_time+i)*2,2),Color(.72,.75,.48,.35),1.5)
 var progress=smoothstep(0,3.8,age) if phase=="cutscene" else 1.0
 var knight=Vector2(lerpf(-40,530,progress),620)
 if phase=="title": knight.y+=sin(scene_time*1.5)*1.5
 draw_set_transform(knight+Vector2(-10,-18),0,Vector2(3,3))
 var pose={"facing":1,"dashes":1,"vx":90 if phase=="cutscene" and progress<1 else 0,"vy":0,"state":"normal","onGround":true,"stamina":110}
 preload("res://scripts/knight_styles.gd").draw(self,pose,Vector2.ZERO,scene_time*55,5,Vector2(INF,INF))
 draw_set_transform(Vector2.ZERO)
 var title_alpha=1.0 if phase=="title" else smoothstep(2.5,5,age)
 word("BLADEFALL",Vector2(694,260),72,Color(.90,.86,.71,title_alpha))
 word("ASCEND",Vector2(850,303),22,Color(.58,.71,.66,title_alpha))
 draw_line(Vector2(740,331),Vector2(1100,331),Color(.65,.63,.44,title_alpha*.7),1)
 if phase=="cutscene":
  var glow=Vector2(knight.x+16,knight.y-38+sin(scene_time*3)*4)
  draw_circle(glow,12,Color(.95,.80,.43,.10))
  draw_circle(glow,3,Color("#eed393"))
func willow(root,growth,scale_factor):
 var color=Color("#748d76")
 var tip=root-Vector2(16,185)*scale_factor*growth
 draw_line(root,tip,Color("#6f7b65"),5*scale_factor)
 for i in range(9):
  var amount=clampf(growth*2-float(i)/12,0,1)
  var start=root+Vector2(-12,-65-i*13)*scale_factor*growth
  var end=start+Vector2((-1 if i%2==0 else 1)*(35+i*5),-30)*scale_factor*amount
  draw_line(start,end,color,2*scale_factor)
  for j in range(3):
   var hang=end+Vector2(j*7-7,35+sin(scene_time*1.4+i+j)*7)*scale_factor*amount
   draw_line(end,hang,Color("#758c6b"),scale_factor)
   draw_line(hang-Vector2(0,7)*scale_factor,hang+Vector2(3,4)*scale_factor,Color("#bdc88a"),3*scale_factor)

func refresh_routes():
 if routes==null or worlds.item_count==0: return
 for child in routes.get_children():
  routes.remove_child(child)
  child.queue_free()
 var home=app.sampler.profile.home(worlds.get_selected_id())
 var options=[]
 if home<3: options.append([home+1,"Next road"])
 options.append([home+20,"Fractured"])
 options.append([home+100,"Core"])
 for option in options:
  var destination=option[0]
  if not app.sampler.profile.available(destination) or app.sampler.profile.has_world(destination): continue
  var button=app.button(routes,option[1],func():
   hide();app.root_ui.show();app.travel_to_world(destination),false)
  button.size_flags_horizontal=Control.SIZE_EXPAND_FILL
  button.tooltip_text="Enter a new route opened by your completed journey."
 routes.visible=routes.get_child_count()>0

func line(from,to,color,width=1.0):
 draw_line(from,to,Color(color) if color is String else color,width,true)
func box(x,y,width,height,color):
 draw_rect(Rect2(x,y,width,height),Color(color) if color is String else color)
func polygon(points,color):
 draw_colored_polygon(PackedVector2Array(points),Color(color) if color is String else color)

func refresh_play():
 var n=worlds.get_selected_id()
 play.text=("Continue " if app.SaveState.exists(app.sampler.profile,n) else "Play ")+app.world_label(n)
 if not app.SaveState.exists(app.sampler.profile,n) and app.sampler.profile.completed.is_empty(): play.text="Start journey"
