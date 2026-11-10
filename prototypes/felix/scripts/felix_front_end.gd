extends Control
## A willow, moonlight, and Felix: the release entry point is separate from each chapter's opening.
var app
var age=0.0
var intro=true
var menu:VBoxContainer
var routes:OptionButton
var play:Button
const LIGHT=preload("res://art/felix/light.png")
func _ready():
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 mouse_filter=Control.MOUSE_FILTER_STOP
 menu=VBoxContainer.new()
 menu.position=Vector2(710,330)
 menu.custom_minimum_size.x=480
 menu.add_theme_constant_override("separation",14)
 add_child(menu)
 play=app.button(menu,"",continue_selected,false)
 routes=OptionButton.new()
 routes.custom_minimum_size.y=62
 routes.add_theme_font_size_override("font_size",24)
 menu.add_child(routes)
 refresh_worlds()
 routes.item_selected.connect(func(_index):refresh())
 app.button(menu,"Begin selected chapter again",func():app.load_chapter(routes.get_selected_id(),false),false)
 app.button(menu,"Controls",func():app.controls_menu.open(),false)
 app.button(menu,"Settings",func():app.set_paused(true);app.pause_box.move_to_front(),false)
 app.button(menu,"Quit",app.close_app,false)
 refresh()
 menu.hide()
func refresh_worlds():
 routes.clear()
 for n in [1,2,3,21,22,23,101,102,103]:
  if app.sampler.profile.has_world(n): routes.add_item(app.world_label(n),n)
 var selected=routes.get_item_index(app.chapter)
 routes.select(maxi(0,selected))

func refresh():
 play.text="Continue" if app.has_checkpoint(routes.get_selected_id()) else "Start journey"
func open(with_intro=false):
 refresh_worlds()
 refresh()
 intro=with_intro and not app.view.reduced_motion
 age=0
 visible=true
 menu.visible=not intro
 app.title_box.hide()
 app.set_paused(true)
 app.pause_box.hide()
 if not intro: play.grab_focus()
func continue_selected():
 var n=routes.get_selected_id()
 if n!=app.chapter:
  app.load_chapter(n,true)
 else:
  hide()
  app.set_paused(false)
  app.title_box.visible=app.story.phase=="black"
func _process(delta):
 if not visible: return
 age+=delta
 if intro and age>=4.2:
  intro=false
  menu.show()
  play.grab_focus()
 queue_redraw()
func _gui_input(event):
 if intro and age>.5 and ((event is InputEventMouseButton or event is InputEventScreenTouch) and event.pressed):
  age=4.2
func _draw():
 draw_rect(Rect2(0,0,1280,832),Color("#10131f"))
 if intro:
  willow(Vector2(640,450),smoothstep(0,2.6,age),1)
  var font=ThemeDB.fallback_font
  draw_string(font,Vector2(435,560),"WILLOW STUDIOS",HORIZONTAL_ALIGNMENT_LEFT,-1,36,Color("#eee2bf"))
  return
 draw_circle(Vector2(240,190),64,Color("#e8e2c1"))
 draw_circle(Vector2(265,170),59,Color("#10131f"))
 willow(Vector2(295,670),1,1.65)
 for i in range(26):
  var at=Vector2(70+fposmod(i*89+age*7,570),180+fposmod(i*53+sin(age*.4+i)*15,460))
  draw_circle(at,1.5,Color(.94,.84,.54,.35))
 var glow=Vector2(450,470+sin(age*1.6)*5)
 draw_circle(glow,34,Color(1,.9,.6,.035))
 draw_circle(glow,17,Color(1,.9,.6,.07))
 draw_texture_rect(LIGHT,Rect2(glow-Vector2(24,24),Vector2(48,48)),false)
 var font=ThemeDB.fallback_font
 draw_string(font,Vector2(710,220),"FELIX",HORIZONTAL_ALIGNMENT_LEFT,-1,84,Color("#fff0c9"))
 draw_string(font,Vector2(715,266),"a quiet light, a long way home",HORIZONTAL_ALIGNMENT_LEFT,-1,23,Color("#b5bdd4"))
 draw_string(font,Vector2(715,770),"WILLOW STUDIOS",HORIZONTAL_ALIGNMENT_LEFT,-1,18,Color("#7d879f"))

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
   var hang=end+Vector2(j*7-7,35+sin(age*1.4+i+j)*7)*scale_factor*amount
   draw_line(end,hang,Color("#758c6b"),scale_factor)
   draw_line(hang-Vector2(0,7)*scale_factor,hang+Vector2(3,4)*scale_factor,Color("#bdc88a"),3*scale_factor)

