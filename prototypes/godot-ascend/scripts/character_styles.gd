extends RefCounted
## Two continuous-curve renderers alongside the original pixel knight. No actor state is changed.
static func line(a,from,to,color,width=.3):
 a.ink.draw_line(from,to,Color(color) if color is String else color,width,false)
static func disc(a,at,r,color):
 a.ink.draw_circle(at,r,Color(color) if color is String else color,true,-1,false)
static func shape(a,points,color,outline="#172c40",width=.23):
 a.ink.draw_colored_polygon(PackedVector2Array(points),Color(color) if color is String else color)
 var border=points.duplicate()
 border.append(points[0])
 a.ink.draw_polyline(PackedVector2Array(border),Color(outline) if outline is String else outline,width,false)
static func oval(a,at,radii,color,outline="",width=.25):
 var pts=[]
 for i in range(28): pts.append(at+Vector2(cos(i*TAU/28)*radii.x,sin(i*TAU/28)*radii.y))
 shape(a,pts,color,color if outline is String and outline=="" else outline,width)
static func knight(a,p,at,phase,style):
 var ink=style==1
 var face=p.facing
 var stride=sin(phase/4.7) if p.onGround and p.state=="normal" and abs(p.vx)>10 else 0.0
 var motion=clamp(abs(p.vx)/55.0,0,1)
 var x=at.x
 var y=at.y+min(a.squash*2,.7)
 var blue=Color("#325a87" if ink else "#456f9c")
 var metal=Color("#cad5d6" if ink else "#c3d1d2")
 var cloak=Color("#e2ab49" if ink else "#d5a558") if p.dashes>0 else Color("#718998")
 # Ink is a sharp pen silhouette; illustration uses broad layered brush shapes and soft edges.
 var collar=Vector2(x+3,y+4)
 var tip=collar+Vector2(-face*(1.1+motion*(8 if ink else 9)),6*(1-motion)+sin(phase*.3)*.45)
 if ink:
  shape(a,[collar+Vector2(-face*.6,-.2),collar+Vector2(-face*3,1),tip+Vector2(0,1.2),tip+Vector2(face*2,-1.2)],cloak,"#86613c",.16)
 else:
  shape(a,[collar+Vector2(-face*.6,-.2),collar+Vector2(-face*3,1),tip+Vector2(-face,2.2),tip+Vector2(face,1.5),tip+Vector2(face*2,-1.2)],cloak,"#b88b4f",.09)
  line(a,collar+Vector2(-face*1.2,1),tip+Vector2(0,1),"#e8bf75",.65)
 line(a,collar,tip,cloak.lightened(.27),.22 if ink else .45)
 for side in [-1,1]:
  var foot=Vector2(x+4+side*1.65+stride*side*.9,at.y+10.1-max(0,-stride*side)*.7)
  line(a,Vector2(x+4+side*1.4,y+7.4),foot,"#253d59",1.15 if ink else 1.5)
  oval(a,foot+Vector2(face*.25,.35),Vector2(1.12,.5),"#24384d","#15283a",.18)
 shape(a,[Vector2(x+1.6,y+4.6),Vector2(x+6.3,y+4.6),Vector2(x+7,y+8.7),Vector2(x+1,y+8.7)],blue,"#1c354e",.27 if ink else .12)
 if ink:
  line(a,Vector2(x+2.2,y+5),Vector2(x+2.6,y+7.8),"#8aaac2",.25)
  line(a,Vector2(x+1.3,y+8),Vector2(x+6.7,y+8),"#987645",.55)
 else:
  oval(a,Vector2(x+3.4,y+6.2),Vector2(2.1,1.8),blue.lightened(.12),blue.lightened(.12),.1)
  line(a,Vector2(x+2,y+8.1),Vector2(x+6.2,y+8.2),"#a48454",.45)
  for i in range(4): disc(a,Vector2(x+2+i*.7,y+5.2+(i%2)*.7),.09,"#a5b6c3")
 # Ink uses a pointed, hatched steel silhouette; illustration is a soft rounded brush figure.
 if ink:
  shape(a,[Vector2(x+1,y+3.7),Vector2(x+1.3,y+.9),Vector2(x+3.8,y-.7),Vector2(x+6.7,y+.7),Vector2(x+7,y+3.7),Vector2(x+4.6,y+5.1),Vector2(x+2,y+4.8)],metal,"#173344",.35)
 else:
  oval(a,Vector2(x+4,y+2.4),Vector2(3.2,2.6),metal,"#6f8799",.15)
 if ink:
  line(a,Vector2(x+2,y+.3),Vector2(x+2.2,y+1.7),"#f3eee0",.42)
  shape(a,[Vector2(x+1.2,y+2.2),Vector2(x+6.8,y+2.2),Vector2(x+6.5,y+3.1),Vector2(x+1.5,y+3.1)],"#233b4d","#233b4d",.1)
  line(a,Vector2(x+4,y-.2),Vector2(x+4,y+4.4),"#758d9a",.18)
  for i in range(3): line(a,Vector2(x+4+i*.6,y+6.5),Vector2(x+3.7+i*.6,y+7.5),"#1d3c5c",.13)
 else:
  oval(a,Vector2(x+3,y+1.4),Vector2(1.7,1.2),"#e3e4db","#e3e4db",.08)
  line(a,Vector2(x+2,y+2.8),Vector2(x+6.5,y+2.7),"#334e64",.72)
  line(a,Vector2(x+1.5,y+4),Vector2(x+6.3,y+4.1),"#9faeae",.4)
 line(a,Vector2(x+4,y-.1),Vector2(x+4.4,y-1.6),cloak,.8 if ink else 1.1)
 for side in [-1,1]:
  var hand=Vector2(x+4+side*3.1,y+7.6)
  if p.carrying!=null: hand=Vector2(x+4+side*3,y-4)
  elif p.state=="climb" and side==face: hand=Vector2(x+4+side*3.6,y+2.7)
  line(a,Vector2(x+4+side*2.3,y+5.1),hand,blue.darkened(.13),.85)
  disc(a,hand,.55,metal)
 line(a,Vector2(x+4-face*3,y+6),Vector2(x+4-face*3.5,y+9.7),"#d5d9cf",.45)
static func person(a,who,point,active,style):
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
