@tool
extends RefCounted
const CHOICES=[0,2,3]
const NAMES={0:"Original · Watch Road",2:"Moonlit Engraving",3:"Purple · Original Game"}
const FEELS=["Masonry","Smooth · continuous stone","Weathered · rock strata"]
static func palette(style):
 if style==2: return [Color("#344967"),Color("#172e47"),Color("#829cad"),Color("#a4c1bb")]
 if style==3: return [Color("#4a4658"),Color("#2b2937"),Color("#8f88a6"),Color("#6f8d5a")]
 return [Color("#414651"),Color("#29323c"),Color("#50555e"),Color("#a4a884")]
static func tile_color(style,variant,x,y,feel=0):
 var p=palette(style)
 if variant==15:
  if y>1: return Color.TRANSPARENT
  return p[2].lightened(.12) if y==0 else p[1]
 var top=variant<4
 var color=p[0]
 if variant>=16: color=p[1].darkened(.1)
 if feel==1:
  # Interior cells are identical; only exposed boundaries are drawn. No internal grid.
  if top and y==0: return p[3]
  if top and y==1: return p[3].lerp(p[0],.6)
  if variant==8 and x==0 or variant==9 and x==7 or variant==10 and y==7: return p[2]
  return color
 if feel==2:
  var band=(y+int(sin(x*.55+variant)*1.5))%8
  if band==2: color=color.lightened(.065)
  if band==6: color=color.darkened(.09)
  if (x*7+y*13+variant*17)%23==0: color=color.lightened(.11)
  if top and y<2: color=p[3].lerp(color,.15 if y==0 else .55)
  if top and y==2 and (x+variant)%5==0: color=p[3].darkened(.25)
  return color
 if style==2:
  if x==0 or y==7: color=p[1]
  elif y==0: color=p[2]
  elif (x+y+variant)%5==0: color=Color("#506b88")
 else:
  if y==7 or x==(3 if variant%2 else 7) and y>2: color=p[1]
  elif y==0: color=p[2]
  elif (x*3+y+variant)%13==0: color=color.lightened(.07)
 if top and y<2: color=p[3] if y==0 else p[3].lerp(p[0],.55)
 return color
static func round_ridge(points):
 var result=[]
 for i in range(points.size()-1):
  var a=points[max(0,i-1)]
  var b=points[i]
  var c=points[i+1]
  var d=points[min(points.size()-1,i+2)]
  for step in range(5):
   var t=step/5.0
   result.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
 result.append(points[-1])
 return result
static func background(a,style,feel=0):
 if style==3:
  purple_background(a,feel)
 else:
  moonlit_background(a,feel)
 finish_background(a,style,feel)
static func purple_background(a,feel):
 for y in range(184):
  var t=y/183.0
  var col=Color("#0c1224").lerp(Color("#2a2440"),t/.7) if t<.7 else Color("#2a2440").lerp(Color("#43304a"),(t-.7)/.3)
  a.box(0,y,320,1,col)
 for i in range(40):
  var x=fposmod(i*67.3-a.camera.x*.03,324)
  var y=fposmod(i*31.7,86)
  a.box(x,y,.7,.7,Color(.91,.89,1,.3))
 a.circle(Vector2(270-fposmod(a.camera.x*.02,24),34),11,"#f3e6c4")
 for layer in range(2):
  var points=[]
  for i in range(-2,15):
   var index=i+floor(a.camera.x*(.1+layer*.12)/28)
   points.append(Vector2(i*28-fposmod(a.camera.x*(.1+layer*.12),28),96+layer*24+sin(index*.64+layer)*16+cos(index*1.3)*5-a.camera.y*(.04+layer*.04)))
  if feel==1: points=round_ridge(points)
  a.polygon([Vector2(-40,184)]+points+[Vector2(360,184)],"#262640" if layer==0 else "#1f1d33")
  if feel==2:
   for i in range(points.size()-1): a.line(points[i],points[i+1],Color(.55,.47,.68,.25),.4)
static func finish_background(a,style,feel):
 if feel==1:
  var color=Color("#b4b4d3" if style==3 else "#a8bdc1")
  for i in range(4):
   for j in range(16):
    color.a=sin(PI*j/15.0)*.012
    a.box(-20,90+i*24+sin(a.clock*.2+i)*2+j,360,1,color)
 elif feel==2:
  for i in range(19):
   var x=fposmod(i*43.1-a.camera.x*.06+a.clock*.4,350)-15
   var y=fposmod(i*29.4,150)
   a.line(Vector2(x,y),Vector2(x+1,y-1),Color(.78,.7,.85,.16),.4)
static func moonlit_background(a,feel):
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
  if feel==1: points=round_ridge(points)
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
