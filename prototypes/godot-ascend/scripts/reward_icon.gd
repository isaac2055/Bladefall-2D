extends Control
var number=1
var core_reward=false
var shiny=false
var owned=false
var root=false
var top=false
var clock=0.0
func _ready():
 custom_minimum_size=Vector2(100,70)
 mouse_filter=Control.MOUSE_FILTER_IGNORE
func _process(delta):
 clock+=delta
 queue_redraw()
func _draw():
 draw_set_transform(Vector2(45,35),0,Vector2(3,3))
 if core_reward:
  if owned: preload("res://scripts/reward_art.gd").draw(self,Vector2.ZERO,number,true,shiny,clock)
  else: draw_arc(Vector2.ZERO,7,0,TAU,20,Color("#455954"),.7)
 elif root and top:
  preload("res://scripts/reward_art.gd").draw(self,Vector2.ZERO,number,false,shiny,clock)
 else:
  if root:
   draw_line(Vector2(0,-1),Vector2(0,5),Color("#b7a37c"),1)
   for side in [-1,1]:
    draw_line(Vector2(0,2),Vector2(side*3,6),Color("#b7a37c"),1)
  if top:
   for i in range(5):
    var a=i*TAU/5
    draw_circle(Vector2(cos(a)*3,sin(a)*3)-Vector2(0,4),2,Color("#caddaa"))
  if not root and not top: draw_line(Vector2(-5,6),Vector2(5,6),Color("#455954"),1)
