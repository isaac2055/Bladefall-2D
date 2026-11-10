extends Node2D
## Shared native/web multitouch controls. Touch state is merged with real devices,
## never injected as keyboard events or allowed to release a held physical key.
const Controls=preload("res://scripts/controls.gd")
var app
var enabled=false
var owners={}
var pad_origin=Vector2(160,660)
var pad_vector=Vector2.ZERO
var showing=false
const PAD=Rect2(24,480,290,320)
const BUTTONS={
 "jump":{"at":Vector2(1170,704),"r":68,"label":"JUMP"},
 "dash":{"at":Vector2(1008,686),"r":65,"label":"DASH"},
 "grab":{"at":Vector2(1138,536),"r":61,"label":"CARRY"},
 "strike":{"at":Vector2(978,524),"r":60,"label":"STRIKE"},
 "parry":{"at":Vector2(1210,374),"r":54,"label":"PARRY"},
 "portal":{"at":Vector2(1060,366),"r":54,"label":"PORTAL"},
 "retry":{"at":Vector2(1068,174),"r":54,"label":"RETRY"},
 "pause":{"at":Vector2(1200,174),"r":54,"label":"PAUSE"}}
func _ready():
 enabled=app.mobile
 get_viewport().size_changed.connect(release_all)
func gameplay():
 return enabled and app.game_started and not app.paused and not app.title_screen.visible and not app.controls_menu.visible and not app.sampler_overlay.showing_result and not app.story.active()
func release_all():
 owners.clear();Controls.touch.clear();pad_vector=Vector2.ZERO;pad_origin=Vector2(160,660)
 queue_redraw()
func _exit_tree():
 Controls.touch.clear()
func _notification(what):
 if what==NOTIFICATION_APPLICATION_FOCUS_OUT: release_all()
func _process(_delta):
 var active=gameplay()
 if not active and not owners.is_empty(): release_all()
 if showing!=active: showing=active
 visible=showing
 queue_redraw()
func _input(event):
 if not event is InputEventScreenTouch and not event is InputEventScreenDrag: return
 if event is InputEventScreenTouch and event.pressed and not enabled:
  enabled=true
 if not gameplay():
  release_all()
  return
 if event is InputEventScreenTouch:
  if not event.pressed or event.canceled:
   if owners.has(event.index):
    owners.erase(event.index);rebuild();get_viewport().set_input_as_handled()
   return
  var chosen=""
  for verb in BUTTONS:
   if event.position.distance_to(BUTTONS[verb].at)<=BUTTONS[verb].r: chosen=verb;break
  if chosen=="" and PAD.has_point(event.position) and not owners.values().any(func(p):return p.verb=="pad"):
   chosen="pad"
   pad_origin=Vector2(clampf(event.position.x,120,220),clampf(event.position.y,570,700))
  if chosen=="": return
  if chosen in ["pause","retry"]:
   release_all()
   if chosen=="pause": app.set_paused(true)
   else: app.retry_room()
  else:
   owners[event.index]={"verb":chosen,"at":event.position}
   rebuild()
  get_viewport().set_input_as_handled()
 elif owners.has(event.index):
  owners[event.index].at=event.position
  rebuild();get_viewport().set_input_as_handled()
func rebuild():
 Controls.touch.clear();pad_vector=Vector2.ZERO
 for owner in owners.values():
  if owner.verb=="pad":
   var delta=owner.at-pad_origin
   if delta.length()>170: pad_origin=owner.at-delta.normalized()*130;delta=owner.at-pad_origin
   pad_vector=(delta/95).limit_length()
   Controls.touch.l=pad_vector.x<-.28
   Controls.touch.r=pad_vector.x>.28
   Controls.touch.u=pad_vector.y<-.28
   Controls.touch.d=pad_vector.y>.28
  elif owner.at.distance_to(BUTTONS[owner.verb].at)<=BUTTONS[owner.verb].r+30:
   Controls.touch[owner.verb]=true
 queue_redraw()
func label(value,at,size,color):
 var font=ThemeDB.fallback_font
 var width=font.get_string_size(value,HORIZONTAL_ALIGNMENT_LEFT,-1,size).x
 draw_string(font,at-Vector2(width/2.0,0),value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color)
func _draw():
 if not showing: return
 var base=Color(.04,.09,.12,.66)
 var gold=Color(.93,.81,.56,.8)
 draw_circle(pad_origin,124,base)
 draw_arc(pad_origin,124,0,TAU,64,Color(.65,.76,.74,.5),2,true)
 for direction in [Vector2.LEFT,Vector2.RIGHT,Vector2.UP,Vector2.DOWN]:
  var at=pad_origin+direction*86
  var side=Vector2(-direction.y,direction.x)
  draw_polyline(PackedVector2Array([at-direction*12+side*10,at,at-direction*12-side*10]),gold,3,true)
 draw_circle(pad_origin+pad_vector*61,32,Color(.7,.8,.75,.35))
 label("MOVE / AIM",pad_origin+Vector2(0,35),22,Color(.8,.86,.8,.8))
 for verb in BUTTONS:
  var button=BUTTONS[verb]
  var held=Controls.touch.get(verb,false)
  draw_circle(button.at,button.r,Color(.42,.40,.25,.9) if held else base)
  draw_arc(button.at,button.r,0,TAU,48,gold if held or verb in ["jump","dash"] else Color(.65,.76,.74,.6),2,true)
  label(button.label,button.at+Vector2(0,10),30 if button.label.length()<6 else 26,Color(.95,.94,.86,.95))
