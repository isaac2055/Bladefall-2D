extends Node2D
## A bounded, purely decorative layer below tiles, actors and UI.
var style=0 # Bladefall, bedroom, Woods, Causeway
var age=0.0
var offset=0.0
var motion=true

func update_sample(world_clock,camera_x,reduced):
 var next_age=0.0 if reduced else world_clock
 var next_offset=0.0 if reduced else camera_x
 if next_age==age and next_offset==offset and motion==(not reduced): return
 age=next_age
 offset=next_offset
 motion=not reduced
 queue_redraw()

func _draw():
 var haze=[Color("#6379a0"),Color("#c69769"),Color("#6e8464"),Color("#738db7")][style]
 var mote=[Color("#f2a66c"),Color("#f2ca94"),Color("#b9d57a"),Color("#a5bbdd")][style]
 # Soft background bands; solid tiles and hazards draw over these.
 for band in range(12):
  var t=(band+1)/12.0
  draw_rect(Rect2(0,100+band*7,320,7),Color(haze,t*t*.13))
 if not motion: return
 for i in range(26 if style!=3 else 16):
  var x=fposmod(i*127.31+age*(4.0+i%4)-offset*.12,320.0)
  var y=fposmod(i*41.79-age*(1.0+i%3),177.0)
  var pulse=.20+.14*sin(i*1.7+age*1.3)
  draw_rect(Rect2(floor(x),floor(y),2 if i%5==0 else 1,1),Color(mote,pulse))
