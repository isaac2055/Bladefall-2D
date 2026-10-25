extends Control
var world
func _ready(): mouse_filter=Control.MOUSE_FILTER_IGNORE
func text(value,at,size=16,color=Color("c7d0bd")):
 draw_string(ThemeDB.fallback_font,at,value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color)
func _draw():
 if world==null: return
 draw_rect(Rect2(0,0,1120,580),Color("13282a"))
 text("MARA’S FIELD CHART",Vector2(28,44),26,Color("e4d6a8"))
 text("The old road · two regions · the route stays open in both directions",Vector2(28,75),15)
 for index in range(2):
  var region=world.regions[index]
  var y=150+index*225
  text(region.catalog.name.to_upper(),Vector2(28,y-10),18,Color("ded1a3"))
  var x0=40.0
  var width=1020.0
  var factor=width/region.catalog.len
  draw_line(Vector2(x0,y+72),Vector2(x0+width,y+72),Color("49645b"),2)
  for room in region.rooms:
   var left=x0+room.x1*factor
   var right=x0+room.x2*factor
   draw_rect(Rect2(left,y+88,right-left-3,23),Color("2c4a3d" if index else "334b51"))
   text(room.name,Vector2(left+3,y+105),11,Color("c1c8b1"))
  for o in region.obstacles:
   if o.type=="plat" and not o.get("fake",false):
    var x=x0+(o.x-o.w/2)*factor
    var top=y+70-o.get("y",0)*0.08
    draw_rect(Rect2(x,top,max(1,o.w*factor),3),Color("789275" if index else "8f9b85"))
   elif o.type=="surveyStake":
    var x=x0+o.x*factor
    var c=Color("e1ca88") if o.get("aligned",false) else Color("63796e")
    draw_circle(Vector2(x,y+52),5,c)
    text(o.bearingName,Vector2(x-15,y+41),11,c)
  if world.stage==index:
   var x=x0+world.p.x*factor
   var top=y+68-world.p.y*0.08
   draw_circle(Vector2(x,top),5,Color("eee4b3"))
   draw_line(Vector2(x,top-7),Vector2(x,top-24),Color("eee4b3"),2)
   text("YOU",Vector2(x-12,top-29),11,Color("eee4b3"))
  var cx=x0+world.checkpoint.x*factor
  if int(world.checkpoint.stage)==index:
   draw_line(Vector2(cx,y+118),Vector2(cx,y+137),Color("c3a66c"),2)
   draw_colored_polygon(PackedVector2Array([Vector2(cx,y+118),Vector2(cx+12,y+122),Vector2(cx,y+128)]),Color("c3a66c"))
 text("● Your position    ◆ Aligned bearing    ⚑ Your checkpoint",Vector2(28,550),14,Color("a8bdac"))
