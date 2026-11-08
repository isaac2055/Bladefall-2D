extends RefCounted
## Original procedural reward art. Visual only: never a carried physics entity.
static func draw(canvas,at,number,core_reward,shiny,time):
 var colors=[Color("eee0a5"),Color("9bcda2"),Color("b6d4c2")]
 var col=colors[clampi(number-1,0,2)]
 var bob=sin(time*2)*1.2
 at+=Vector2(0,bob)
 if shiny:
  col=col.lerp(Color.from_hsv(fposmod(time*.12,1),.25,1),.45)
  canvas.draw_circle(at,12,Color(col,.09))
 if not core_reward:
  if number==1:
   canvas.draw_line(at+Vector2(0,7),at+Vector2(0,-2),Color("779b71"),1)
   canvas.draw_line(at+Vector2(0,3),at+Vector2(-4,0),Color("92ba82"),2)
   for i in range(5):
    var a=float(i)*TAU/5
    canvas.draw_circle(at+Vector2(cos(a),sin(a))*3,2,col)
   canvas.draw_circle(at,1.5,Color("d7aa58"))
  elif number==2:
   canvas.draw_line(at+Vector2(0,7),at+Vector2(0,-2),Color("b6a17e"),2)
   for i in range(5):
    var a=i*TAU/5
    canvas.draw_circle(at+Vector2(cos(a)*3,sin(a)*2-3),2.5,col)
   for side in [-1,1]: canvas.draw_line(at+Vector2(0,5),at+Vector2(side*3,8),Color("b6a17e"),1)
  else:
   for i in range(7):
    var v=at+Vector2(sin(i*.8+time*.3)*2,i*2-6)
    canvas.draw_line(v,v+Vector2(1,2),Color("789e83"),1)
    if i%2==0: canvas.draw_line(v,v+Vector2(4 if i%4==0 else -4,-2),col,2)
 elif number==1:
  for side in [-1,1]:
   var wing=Vector2(side*(5+sin(time*11)*2),-2)
   canvas.draw_line(at,at+wing,Color(col,.75),2)
  canvas.draw_colored_polygon(PackedVector2Array([at+Vector2(-3,-4),at+Vector2(3,-4),at+Vector2(1,3),at+Vector2(-1,3)]),col)
  canvas.draw_circle(at+Vector2(0,3),1.5,Color("e5bb68"))
 elif number==2:
  canvas.draw_circle(at,4,Color("cba16b"))
  canvas.draw_line(at+Vector2(-4,-2),at+Vector2(4,-2),Color("887252"),2)
  for i in range(3):
   var a=time*1.5+i*TAU/3
   var leaf=at+Vector2(cos(a)*7,sin(a)*4)
   canvas.draw_line(leaf-Vector2(1,1),leaf+Vector2(1,1),col,2)
 else:
  canvas.draw_circle(at,2,Color("f2bd76"))
  for i in range(5):
   var a=time*.8+i*TAU/5
   var v=Vector2(cos(a),sin(a))
   var reach=5+sin(time*2)*1.5
   canvas.draw_line(at+v*2,at+v*reach,Color("bda982"),2)
   canvas.draw_circle(at+v*reach,1,col)
 if shiny:
  var angle=time*2
  var p=at+Vector2(cos(angle)*9,sin(angle)*7)
  canvas.draw_line(p-Vector2(2,0),p+Vector2(2,0),Color.WHITE,1)
  canvas.draw_line(p-Vector2(0,2),p+Vector2(0,2),Color.WHITE,1)
static func draw_part(canvas,at,number,root,top,shiny,time):
 if root and top:
  draw(canvas,at,number,false,shiny,time)
  return
 var color=[Color("eee0a5"),Color("9bcda2"),Color("b6d4c2")][clampi(number-1,0,2)]
 if root:
  canvas.draw_line(at+Vector2(0,-2),at+Vector2(0,5),Color("b7a37c"),1.5)
  for side in [-1,1]: canvas.draw_line(at+Vector2(0,2),at+Vector2(side*4,7),Color("b7a37c"),1)
 if top:
  for i in range(5):
   var a=i*TAU/5
   canvas.draw_circle(at+Vector2(cos(a)*3,sin(a)*3-4),2,color)
