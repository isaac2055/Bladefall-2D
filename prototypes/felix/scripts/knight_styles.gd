@tool
extends RefCounted
## All alternatives use the classic 8x11 blue knight, compact steel helmet and side visor.
const CHOICES=[0,3,8,9,1,4,2,5,6,7]
const NAMES=["Pixel · Classic","Ink · Contour","Illustration · Soft","Pixel · Fine","Ink · Crosshatch","Illustration · Brush","Paper · Folded Classic","Paper · Layered Classic","Pixel · Weathered","Pixel · Bold"]
static func draw(a,p,at,phase,id,flow):
 if flow.x==INF: flow=Vector2(-p.facing*clamp(abs(p.vx)/55.0,0,1),1-clamp(abs(p.vx)/55.0,0,1))
 var pixel=id in [3,8,9]
 var edge=Color("#233247")
 var steel=Color("#b9c2cf")
 var shade=Color("#7c8796")
 var blue=Color("#2d4a78")
 var gold=Color("#ffb347") if p.dashes>0 else Color("#56708c")
 var origin=at
 var amount=a.squash*(.3 if a.reduced_motion else 1.0)
 var width=max(6,round(8*(1+amount)))
 var height=round(11/(1+amount))
 var x=origin.x+4-width/2
 var y=origin.y+11-height
 var f=p.facing
 var collar=at+Vector2(3,4)
 var cloak=[collar]
 var motion=1-flow.y
 var direction=flow.x/max(.001,motion)
 for i in range(1,7):
  var rest=Vector2(-f*.25+sin(phase*.2-i*.6)*.15,1.25)
  var moving=Vector2(direction*1.9,sin(phase*.4-i*.8)*.5-.15)
  cloak.append(cloak[-1]+rest.lerp(moving,motion))
  a.line(cloak[i-1].round() if pixel else cloak[i-1],cloak[i].round() if pixel else cloak[i],Color(gold,1-i/10.0),max(.5,(1.35 if pixel else 1.1)-i*.12))
 var walking=p.onGround and p.state=="normal" and abs(p.vx)>10
 for side in [-1,1]:
  var stride=sin(phase/4.7+(0 if side<0 else PI)) if walking else 0.0
  var offset=round(stride) if pixel else stride*.8
  var lift=round(max(0,-stride)) if pixel else max(0,-stride)*.6
  var foot=Vector2(x+(1 if side<0 else width-3)+offset,y+height-2-lift)
  a.box(foot.x,foot.y,2,2,"#1c2938")
  a.box(foot.x,foot.y,1,1,"#82909d")
 var body=[Vector2(x+1,y+4),Vector2(x+width-1,y+4),Vector2(x+width-1,y+height-2),Vector2(x+1,y+height-2)]
 a.polygon(body,blue)
 a.box(x+1,y+4,width-2,1,"#4a6aa0")
 a.box(x+1,y+height-4,width-2,1,"#6b4e2a")
 a.box(x if f>0 else x+width-1,y+height-6,1,4,steel)
 if id==9:
  a.line(body[0],body[3],edge,1)
  a.line(body[1],body[2],edge,1)
 elif id==8:
  a.box(x+2,y+6,2,1,"#667598")
  a.box(x+5,y+7,1,1,"#203b61")
 elif id==3:
  a.box(x+2,y+5,1,2,"#7192ba")
  a.box(x+width-3,y+6,1,2,"#213d64")
 elif id in [1,4]:
  a.line(body[0],body[3],edge,.3)
  if id==4:
   for i in range(4): a.line(Vector2(x+2+i,y+5),Vector2(x+1.6+i,y+7),"#7c94ad",.12)
 elif id in [2,5]:
  a.box(x+1.6,y+5.2,1.7,height-8,Color(.4,.55,.72,.3))
  if id==5:
   for i in range(3): a.line(Vector2(x+2+i,y+5.6),Vector2(x+2.2+i,y+7.5),"#597aa2",.45)
 elif id==6:
  a.polygon([body[0],Vector2(x+4,y+5),Vector2(x+4,y+height-2),body[3]],"#203d67")
 elif id==7:
  a.box(x+2,y+5,4,2,"#45658d")
  a.line(body[0],body[1],"#97a8b8",.3)
 # Helmet stays six pixels wide and five tall, with the same two-pixel facing visor.
 if pixel:
  a.box(x+1,y,width-2,5,steel)
  a.box(x+1,y+4,width-2,1,shade)
  if id==3:
   a.box(x+2,y,3,1,"#e1e4e2")
   a.box(x+width-2,y+1,1,2,"#91a2b4")
  elif id==8:
   a.box(x+2,y+1,1,1,"#e0dcd0")
   a.box(x+3,y+3,1,1,"#687b91")
   a.box(x+width-2,y,1,1,"#8291a4")
  elif id==9:
   a.box(x,y+1,1,3,edge)
   a.box(x+width-1,y+1,1,3,edge)
   a.box(x+2,y,3,1,"#e5e5dd")
 else:
  var cut=.35 if id in [1,4,6] else .65
  var helmet=[Vector2(x+1+cut,y),Vector2(x+width-1-cut,y),Vector2(x+width-1,y+cut),Vector2(x+width-1,y+4.5),Vector2(x+1,y+4.5),Vector2(x+1,y+cut)]
  a.polygon(helmet,steel)
  for i in range(helmet.size()): a.line(helmet[i],helmet[(i+1)%helmet.size()],edge,.18 if id in [2,5] else .3)
  a.line(Vector2(x+1.4,y+4.1),Vector2(x+width-1.4,y+4.1),shade,.65)
  if id==1: a.line(Vector2(x+2,y+.4),Vector2(x+5,y+.4),"#e1e3dd",.35)
  elif id==4:
   for i in range(4): a.line(Vector2(x+1.8+i*.7,y+.5),Vector2(x+1.6+i*.7,y+1.5),"#70869e",.13)
  elif id==2: a.box(x+1.6,y+.45,2.8,1.25,Color(.94,.94,.88,.6))
  elif id==5:
   for i in range(4): a.line(Vector2(x+1.7+i*.8,y+.4),Vector2(x+2+i*.8,y+1.5),"#d5dce0",.5)
  elif id==6:
   a.polygon([helmet[0],Vector2(x+4,y+.7),Vector2(x+4,y+4),Vector2(x+1,y+4)],"#d7dcd9")
   a.line(Vector2(x+4,y+.7),Vector2(x+4,y+4),"#91a4b3",.18)
  elif id==7:
   a.box(x+1.5,y+.5,width-3,1,"#d9dcd4")
   a.box(x+1.5,y+3.5,width-3,.5,"#71859d")
 var visor_x=x+width-4 if f>0 else x+2
 a.box(visor_x,y+2,2,1,"#1a1f28")
 a.box(x+width/2-1,y-2,2,2,gold)
 a.box(x+1 if f>0 else x+width-3,y+4,2,1,gold)
 if p.state=="climb":
  a.box(x+width-1 if f>0 else x,y+3,1,3,steel)
  a.box(at.x+1,at.y-5,6,1,"#263b45")
  a.box(at.x+1,at.y-5,6*clamp(p.stamina/110,0,1),1,"#d2c08b")
 elif p.vy< -20: a.box(x if f>0 else x+width-1,y+3,1,2,steel)
