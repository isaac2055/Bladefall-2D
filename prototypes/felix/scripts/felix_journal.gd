extends Control
## Earned plants, keepsakes and local records, shared across story and challenge routes.
const Art=preload("res://scripts/reward_art.gd")
var app
var age=0.0
var selected=1
func _ready():
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var done=app.button(self,"Return",close,false)
 done.position=Vector2(520,725)
 done.custom_minimum_size.x=240
 if app.mobile:
  for item in [["Previous",-1,180],["Next",1,910]]:
   var direction=int(item[1])
   var change=app.button(self,item[0],func():selected=wrapi(selected+direction,1,4);queue_redraw(),false)
   change.position=Vector2(item[2],725)
   change.custom_minimum_size.x=190
 hide()
func open():
 app.set_paused(true)
 app.pause_box.hide()
 age=0
 show()
 move_to_front()
 get_child(0).grab_focus()
func close():
 hide()
 if app.front_end.visible:
  app.pause_box.hide()
  app.front_end.play.grab_focus()
 else:
  app.set_paused(true)
  app.focus_pause()
func _input(event):
 if visible and event.is_action_pressed("ui_cancel"):
  close()
  get_viewport().set_input_as_handled()
func _process(delta):
 if visible:
  if not app.reduced_motion: age+=delta
  queue_redraw()
func words(value,at,size=20,color=Color("#bac2d8")):
 draw_string(ThemeDB.fallback_font,at,value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color)
func _draw():
 draw_rect(Rect2(0,0,1280,832),Color("#10131f"))
 words("The little things we keep",Vector2(90,95),42,Color("#fff0c9"))
 words("Keep an exported save to take these memories with you." if app.mobile else "Your garden and records stay on this device. Export a save to take them with you.",Vector2(90,140),26 if app.mobile else 19)
 for n in ([selected] if app.mobile else [1,2,3]):
  var x=350 if app.mobile else 90+(n-1)*400
  var item=app.sampler.profile.garden(n)
  words(["The New House","Sir Felix","Phantom"][n-1],Vector2(x,208),36 if app.mobile else 27,Color("#fff0c9"))
  draw_rect(Rect2(x,235,580 if app.mobile else 330,170),Color("#1c2233"))
  draw_set_transform(Vector2(x+(170 if app.mobile else 95),{1:350,2:340,3:325}[n]),0,Vector2(7,7))
  Art.draw_part(self,Vector2.ZERO,n,item.root,item.top,item.root_shiny or item.flower_shiny,age)
  draw_set_transform(Vector2(x+(420 if app.mobile else 250),325),0,Vector2(7,7))
  if item.core: Art.draw(self,Vector2.ZERO,n,true,item.core_shiny,age)
  draw_set_transform(Vector2.ZERO)
  var statuses=["Story · "+("complete" if item.root else "still to come"),"Fractured · "+("complete" if item.top else "still to come"),"Core · "+("complete" if item.core else "still to come")]
  for i in range(statuses.size()): words(statuses[i],Vector2(x,447+i*33),28 if app.mobile else 20)
  var memories=app.sampler.profile.story_seen.get("felix-chapter-%d"%n,{"photos":[],"secret":false})
  words("%d / 10 memories%s"%[memories.photos.size()," · secret found" if memories.secret else ""],Vector2(x,556),26 if app.mobile else 17)
  for i in range(3):
   var route=[n,n+20,n+100][i]
   var board=app.sampler.profile.board(route)
   var value=["Story","Fractured","Core"][i]+" · "
   value+=(app.sampler.profile.duration(board[0].frames)+" · %d falls"%board[0].deaths) if not board.is_empty() else "no record yet"
   words(value,Vector2(x,595+i*31),25 if app.mobile else 16)

 words("Complete the three stories to open Fractured. Clear Fractured to open Core.",Vector2(90,687),18)
