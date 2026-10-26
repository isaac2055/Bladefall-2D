@tool
extends RefCounted
const NAMES=["Original · Watch Road","Dawn Ramparts","Moonlit Engraving"]
static func tile_color(style,variant,x,y):
 if variant==15:
  if y>1: return Color.TRANSPARENT
  return Color("#d5b873" if style==1 else "#c0dbe0") if y==0 else Color("#676857" if style==1 else "#627d95")
 var top=variant<4
 if style==1:
  var color=Color("#8c806c") if variant<16 else Color("#454b4a")
  var seam=y==7 or x==((4 if variant%2==0 else 0)+(4 if y>3 else 0))%8
  if seam: color=Color("#534f49")
  elif y==0 or y==4: color=Color("#b4a17f")
  elif (x*3+y+variant)%11==0: color=Color("#9b8e76")
  if top and y<2: color=Color("#c9bd79" if y==0 else "#879166")
  if variant>=16: color=color.darkened(.3)
  return color
 var color=Color("#344967") if variant<16 else Color("#17283d")
 if x==0 or y==7: color=Color("#172e47")
 elif y==0: color=Color("#829cad")
 elif (x+y+variant)%5==0: color=Color("#506b88")
 if top and y<2: color=Color("#a4c1bb" if y==0 else "#627f87")
 if variant>=16: color=color.darkened(.25)
 return color
static func background(a,style):
 if style==1:
  a.box(0,0,320,184,"#b9b5a2")
  for y in range(0,184,4): a.box(0,y,320,4,Color("#e6c99c").lerp(Color("#668b8c"),float(y)/230))
  a.circle(Vector2(245-fposmod(a.camera.x*.015,25),40),19,"#f6deb0")
  for layer in range(3):
   var points=[Vector2(-30,184)]
   for i in range(-2,14):
    var index=i+floor(a.camera.x*(.025+layer*.025)/35)
    var x=i*35-fposmod(a.camera.x*(.025+layer*.025),35)
    points.append(Vector2(x,85+layer*21+sin(index*.63+layer)*13-a.camera.y*.012))
   points.append(Vector2(360,184))
   a.polygon(points,["#abb39d","#839e94","#5f8280"][layer])
  for i in range(-1,6):
   var x=i*76-fposmod(a.camera.x*.14,76)
   var y=101-a.camera.y*.018
   a.box(x,y,7,83,"#516e70")
   a.box(x-3,y-3,13,4,"#718985")
   a.line(Vector2(x+6,y+5),Vector2(x+70,y+5),"#718985",5)
   for j in range(3):
    var center=Vector2(x+17+j*18,y+17)
    a.ink.draw_arc(center,9,PI,TAU,20,Color("#718985"),3)
   a.box(x+68,y,7,83,"#516e70")
  for i in range(9):
   var x=fposmod(i*43-a.camera.x*.28,380)-30
   var y=153+i%3*9
   a.polygon([Vector2(x-4,y),Vector2(x,y-22-i%3*5),Vector2(x+4,y)],"#3e6465")
   a.line(Vector2(x,y),Vector2(x,y+30),"#3e6465",1)
  for i in range(5):
   var x=fposmod(i*81+a.clock*1.2-a.camera.x*.04,410)-50
   a.box(x,62+i*14,65,1,Color(.95,.86,.67,.12))
 else:
  a.box(0,0,320,184,"#14223c")
  for y in range(0,184,4): a.box(0,y,320,4,Color("#121e36").lerp(Color("#3e5267"),float(y)/190))
  var moon=Vector2(246-fposmod(a.camera.x*.02,24),39)
  a.circle(moon,19,"#cfb894")
  a.circle(moon+Vector2(-6,-3),16,"#172740")
  for i in range(60):
   var x=fposmod(i*53.7-a.camera.x*.025,330)
   var y=fposmod(i*23.1,105)
   a.line(Vector2(x,y),Vector2(x+1,y),"#8fa3b4",.5)
  for layer in range(3):
   var points=[]
   for i in range(-1,13):
    var x=i*32-fposmod(a.camera.x*(.04+layer*.04),32)
    var h=95+layer*24+sin((i+floor(a.camera.x*(.04+layer*.04)/32))*.7)*12-a.camera.y*.015
    points.append(Vector2(x,h))
   var fill=[Vector2(-40,184)]+points+[Vector2(360,184)]
   a.polygon(fill,["#263950","#2f465b","#354e60"][layer])
   for i in range(points.size()-1): a.line(points[i],points[i+1],"#738b9b",.4)
  for i in range(-1,8):
   var x=i*49-fposmod(a.camera.x*.18,49)
   var y=97+i%3*11
   a.polygon([Vector2(x-6,184),Vector2(x-5,y),Vector2(x,y-24),Vector2(x+6,y),Vector2(x+6,184)],"#223c51")
   a.line(Vector2(x,y-24),Vector2(x+6,y),"#91a6ad",.45)
   for j in range(4): a.line(Vector2(x-4,y+8+j*8),Vector2(x+3,y+4+j*8),"#4d6b7f",.4)
   a.box(x,y+4,1,6,"#bba980")
  for i in range(7):
   var x=fposmod(i*64-a.camera.x*.33,390)-30
   a.line(Vector2(x,156),Vector2(x,110),"#23404e",1)
   for j in range(5): a.line(Vector2(x,112+j*7),Vector2(x-5-j,118+j*7),"#23404e",1)
