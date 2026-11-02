@tool
extends RefCounted
## Resident drawing families and shared prop helpers. People designs are preserved.
const CHOICES=[0,3,1,4,2,5,6,7]
const NAMES=["Pixel · Classic","Ink · Classic","Illustration · Classic","Pixel · Steel","Ink · Etched","Illustration · Storybook","Paper · Folded","Paper · Cutout"]
static func line(a,from,to,color,width=.3):
 a.ink.draw_line(from,to,(Color(color) if color is String else color)*a.ink_color,width,false)
static func disc(a,at,r,color):
 a.ink.draw_circle(at,r,(Color(color) if color is String else color)*a.ink_color,true,-1,false)
static func shape(a,points,color,outline="#172c40",width=.23):
 a.ink.draw_colored_polygon(PackedVector2Array(points),(Color(color) if color is String else color)*a.ink_color)
 var border=points.duplicate()
 border.append(points[0])
 a.ink.draw_polyline(PackedVector2Array(border),(Color(outline) if outline is String else outline)*a.ink_color,width,false)
static func oval(a,at,radii,color,outline="",width=.25):
 var pts=[]
 for i in range(28): pts.append(at+Vector2(cos(i*TAU/28)*radii.x,sin(i*TAU/28)*radii.y))
 shape(a,pts,color,color if outline is String and outline=="" else outline,width)
static func person(a,who,point,active,style):
 if style>=3:
  alternate_person(a,who,point,style)
  return
 var ink=style==1
 var x=point.x
 var y=point.y
 var sit=3 if who.who in ["vey","rowan","hale"] else 0
 var face=who.get("face",1)
 var coat=Color({"vey":"#9a856e","mara":"#66897b","rowan":"#7b8591","elsie":"#a3997c","silas":"#7a8796","orra":"#889b7c","sable":"#7f758e"}.get(who.who,"#808d82"))
 var edge="#263c47" if ink else "#626e6b"
 oval(a,Vector2(x+2,y-.2),Vector2(5,.7),Color(.04,.07,.1,.18),Color(.04,.07,.1,.18),.1)
 for side in [-1,1]:
  line(a,Vector2(x+2+side*1.7,y-4),Vector2(x+2+side*2,y-1),"#394e5d",1.5)
  oval(a,Vector2(x+2+side*2+face*.4,y-.7),Vector2(1.5,.6),"#3a4952",edge,.18)
 shape(a,[Vector2(x-.2,y-11+sit),Vector2(x+4.8,y-11+sit),Vector2(x+7,y-3),Vector2(x-2.5,y-3)],coat,edge,.27 if ink else .12)
 if not ink:
  oval(a,Vector2(x+1,y-7+sit*.3),Vector2(2.4,2.6),coat.lightened(.13),coat.lightened(.13),.1)
 else:
  line(a,Vector2(x,y-10+sit),Vector2(x+2,y-6),"#d2c5a4",.3)
  line(a,Vector2(x+5,y-10+sit),Vector2(x+3,y-6),coat.darkened(.3),.3)
 for side in [-1,1]:
  var shoulder=Vector2(x+2+side*3,y-9+sit)
  var hand=Vector2(x+2+side*4,y-5)
  line(a,shoulder,hand,coat.darkened(.13),1.35)
  disc(a,hand,.7,"#d9bc96")
 if ink:
  for i in range(3): line(a,Vector2(x+3+i*.6,y-6),Vector2(x+2.5+i*.6,y-4.3),coat.darkened(.4),.1)
 var head=Vector2(x+2.5,y-13+sit)
 oval(a,head,Vector2(2.7,3),"#d3b38e",edge,.24 if ink else .1)
 oval(a,head+Vector2(-.6,-.6),Vector2(1.8,1.9),"#e5c6a0","#e5c6a0",.08)
 disc(a,head+Vector2(face*1.35,-.3),.25,"#263b48")
 line(a,head+Vector2(face*.8,-1),head+Vector2(face*1.8,-1),"#7c6958",.2)
 shape(a,[head+Vector2(face*2,-.1),head+Vector2(face*2.7,.7),head+Vector2(face*1.8,.8)],"#c39d7d","#c39d7d",.12)
 line(a,head+Vector2(face*1.1,1.4),head+Vector2(face*1.9,1.25),"#946c58",.18)
 if who.who=="rowan":
  shape(a,[head+Vector2(-1.9,1),head+Vector2(2,1),head+Vector2(1.5,2.8),head+Vector2(-1.2,2.6)],"#a8afa4",edge,.12)
 if who.who=="silas":
  oval(a,head,Vector2(3,3),"#9eafb9",edge,.3)
  line(a,head-Vector2(2,.1),head+Vector2(2,.1),"#243746",1)
  disc(a,head+Vector2(face*1.2,0),.3,"#f1c77f")
 elif who.who=="elsie":
  shape(a,[head+Vector2(-3,-1),head+Vector2(-2,-3.2),head+Vector2(2.2,-3.2),head+Vector2(3,-.3)],"#e5d9ba",edge,.17)
  shape(a,[Vector2(x,y-8),Vector2(x+4,y-8),Vector2(x+5,y-3),Vector2(x-1,y-3)],"#d4c6a5",edge,.15)
  line(a,Vector2(x+1,y-5),Vector2(x+3,y-5),"#9b9d82",.4)
 elif who.who in ["rowan","sentinel"]:
  shape(a,[head+Vector2(-3,-1.3),head+Vector2(-2.7,-3),head+Vector2(2.7,-3),head+Vector2(3,-1.3)],"#8e9da7",edge,.2)
  line(a,head+Vector2(-3,-1.3),head+Vector2(3,-1.3),"#d6d5c6",.4)
 else:
  oval(a,head+Vector2(-.2,-2.7),Vector2(3.4,.7),coat.darkened(.1),edge,.18)
  shape(a,[head+Vector2(-2.2,-2.8),head+Vector2(-1.9,-4),head+Vector2(2,-3.8),head+Vector2(2.3,-2.8)],coat.lightened(.08),edge,.17)
 if a.fractured: oval(a,head,Vector2(4,4.3),Color(a.accent,.03),Color(a.accent,.12),.1)
static func lantern(a,at):
 var x=at.x
 var y=at.y
 oval(a,Vector2(x+4,y+.5),Vector2(1.6,1.6),Color(0,0,0,0),"#b5a274",.4)
 disc(a,Vector2(x+4,y+4.5),6.5,Color(1,.75,.3,.065))
 shape(a,[Vector2(x+1.7,y+2),Vector2(x+6.3,y+2),Vector2(x+7,y+6.4),Vector2(x+5.7,y+7.5),Vector2(x+2.3,y+7.5),Vector2(x+1,y+6.4)],"#64706b","#283c43",.35)
 shape(a,[Vector2(x+2.3,y+2.8),Vector2(x+5.7,y+2.8),Vector2(x+6.1,y+6),Vector2(x+2,y+6)],"#c9a766","#917b52",.15)
 oval(a,Vector2(x+4,y+4.7),Vector2(1,1.65+sin(a.clock*8)*.15),"#f9db8c","#fff0b4",.15)
 line(a,Vector2(x+3,y+2.5),Vector2(x+2.6,y+6.6),"#7b7f6d",.35)
 line(a,Vector2(x+5,y+2.5),Vector2(x+5.4,y+6.6),"#7b7f6d",.35)
 line(a,Vector2(x+1.8,y+7),Vector2(x+6,y+7),"#b7a06c",.5)
static func lift(a,e,origin):
 var at=origin+Vector2(e.x,e.y)
 var from=origin+Vector2(e.ox+e.w/2,e.oy)
 var to=origin+Vector2(e.tx+e.w/2,e.ty)
 line(a,from,to,"#665e4c",.9)
 line(a,from+Vector2(.7,0),to+Vector2(.7,0),"#bba477",.3)
 for anchor in [from,to]:
  disc(a,anchor,2.3,"#36454c")
  oval(a,anchor,Vector2(1.6,1.6),"#85816d","#b7ae8d",.25)
 shape(a,[at,at+Vector2(e.w,0),at+Vector2(e.w,e.h),at+Vector2(0,e.h)],"#6b6250","#293b43",.4)
 for plank in range(3,int(e.w),5): line(a,at+Vector2(plank,1),at+Vector2(plank-1,e.h-1),"#3c4546",.4)
 line(a,at+Vector2(1,1),at+Vector2(e.w-1,1),"#c6b48d",.7)
 line(a,at+Vector2(1,e.h-2),at+Vector2(e.w-1,e.h-2),"#34464d",1.1)
 for edge in [2,e.w-3]:
  line(a,at+Vector2(edge,1),at+Vector2(edge,e.h-1),"#8b938a",1.0)
  disc(a,at+Vector2(edge,2),.4,"#e1d4ab")

static func alternate_person(a,who,at,style):
 var sitting=who.who in ["vey","rowan","hale"]
 var sit=3 if sitting else 0
 var face=who.get("face",1)
 var coat=Color({"vey":"#a18a69","mara":"#5c877b","rowan":"#64798e","elsie":"#aa9678","silas":"#7e93a4"}.get(who.who,"#849679"))
 var head=at+Vector2(2,-13+sit)
 if style==3:
  a.box(at.x-1,at.y-10+sit,7,8-sit,coat)
  a.box(at.x-2,at.y-10+sit,9,2,coat.darkened(.3))
  a.box(at.x+1,at.y-9+sit,2,6-sit,"#d9c7a3")
  a.box(head.x-2,head.y-2,5,5,"#d9bb93")
  a.box(head.x-3,head.y-3,7,1,coat.darkened(.4))
  a.box(head.x-2,head.y-5,5,2,coat)
  a.box(head.x+face,head.y,1,1,"#253d4b")
  for side in [-1,1]:
   a.box(at.x+2+side*4,at.y-8+sit,2,4,"#bd9e7c")
   a.box(at.x+1+side*2,at.y-2,3,2,"#2a3f50")
  if who.who=="rowan": a.box(head.x-2,head.y+2,5,2,"#b8c0b7")
  return
 var paper=style>=6
 var round=style in [5,7]
 var edge="#263d4b"
 for side in [-1,1]:
  line(a,at+Vector2(2+side*1.5,-4),at+Vector2(2+side*2,-1),"#2e4656",1.5)
  oval(a,at+Vector2(2+side*2+face*.3,-.6),Vector2(1.4,.6),"#304553",edge,.15)
 var body=[at+Vector2(-1,-11+sit),at+Vector2(5,-11+sit),at+Vector2(7,-2),at+Vector2(-3,-2)]
 if round:
  oval(a,at+Vector2(2,-6+sit*.4),Vector2(4.5,4.4-sit*.3),coat,edge,.18)
  oval(a,at+Vector2(.8,-7+sit*.3),Vector2(2.3,2.6),coat.lightened(.19),coat.lightened(.19),.1)
 else: shape(a,body,coat,edge,.3 if style==4 else .15)
 if style==4:
  for i in range(6): line(a,at+Vector2(-1+i,-8+sit),at+Vector2(-2+i,-3),coat.darkened(.4),.12)
  line(a,at+Vector2(0,-10+sit),at+Vector2(4,-3),"#ddc7a0",.65)
 elif style==6:
  shape(a,[body[0],at+Vector2(2,-8+sit),at+Vector2(2,-2),body[3]],coat.darkened(.27),coat.darkened(.27),.1)
 elif style==7:
  shape(a,[at+Vector2(0,-9+sit),at+Vector2(4,-9+sit),at+Vector2(5,-3),at+Vector2(-1,-3)],"#d9c49b",edge,.15)
  for i in range(3): disc(a,at+Vector2(2,-7+sit+i),.25,coat.darkened(.5))
 else:
  for i in range(3): line(a,at+Vector2(-1+i,-7),at+Vector2(1+i,-5),coat.lightened(.3),.6)
 for side in [-1,1]:
  var hand=at+Vector2(2+side*4,-5)
  line(a,at+Vector2(2+side*2.8,-9+sit),hand,coat.darkened(.12),1.3)
  disc(a,hand,.75,"#d4b58d")
 if round: oval(a,head,Vector2(3,3.2),"#dbbc94",edge,.15)
 else: shape(a,[head+Vector2(-2,-3),head+Vector2(2,-3),head+Vector2(3,1),head+Vector2(0,3),head+Vector2(-2,2)],"#dbbc94",edge,.2)
 if paper: shape(a,[head+Vector2(-2,-3),head,head+Vector2(0,3),head+Vector2(-2,2)],"#b28e6e","#b28e6e",.1)
 disc(a,head+Vector2(face*1.5,-.2),.25,"#233b4e")
 line(a,head+Vector2(face,1.5),head+Vector2(face*2,1.3),"#996b55",.2)
 if who.who=="rowan": shape(a,[head+Vector2(-2,1),head+Vector2(2.5,1),head+Vector2(1,4)],"#b6bfb4",edge,.12)
 if who.who=="elsie":
  oval(a,head+Vector2(0,-2),Vector2(3.5,1.2),"#e4d7b7",edge,.17)
 else:
  shape(a,[head+Vector2(-3,-2),head+Vector2(-2,-5),head+Vector2(2,-4),head+Vector2(3,-2)],coat.darkened(.12),edge,.2)
 if style==4:
  for i in range(3): line(a,head+Vector2(-1+i,-1.6),head+Vector2(-1.4+i,.6),"#b59170",.1)
