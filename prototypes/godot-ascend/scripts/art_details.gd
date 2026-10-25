extends RefCounted
## Drawing and decoration placement only; never changes authored maps or simulation objects.
static func ground_clear(a,point,width=14,height=16):
 if a.runtime==null: return true
 var area=Rect2(point+Vector2(-4,-height),Vector2(width+4,height))
 for row in range(floori(area.position.y/8),ceili(point.y/8)):
  for col in range(floori(area.position.x/8),ceili(area.end.x/8)):
   if a.runtime.tile_global(col,row)!=0: return false
 for col in range(floori(area.position.x/8),ceili(area.end.x/8)):
  if a.runtime.tile_global(col,floori(point.y/8))!=1: return false
 return true
static func flora_safe(a,point,width=14,height=16):
 if a.runtime==null: return true
 var area=Rect2(point+Vector2(-4,-height),Vector2(width+4,height))
 if not ground_clear(a,point,width,height): return false
 if a.runtime.data.has("whiteFlowers"):
  for patch in a.runtime.data.whiteFlowers.patches:
   var toxic=Rect2(a.runtime.placements[patch.room]+Vector2(patch.x,patch.y),Vector2(patch.w,patch.h))
   if area.grow(3).intersects(toxic): return false
 for id in a.runtime.nearby(area.grow(8)):
  var core=a.runtime.cores[id]
  for e in core.ents:
   if area.grow(3).intersects(Rect2(core.world_origin+Vector2(e.x,e.y),Vector2(e.w,e.h))): return false
  for person in core.room.def.get("people",[]):
   var at=core.world_origin+Vector2(person.c*8,person.r*8+8)
   if abs(at.x-point.x)<20 and abs(at.y-point.y)<18: return false
 for section in a.sections:
  if section.get("fire")!=null:
   var fire=a.placements[section.room]+Vector2(section.fire.c*8,section.fire.r*8+8)
   if abs(fire.x-point.x)<18 and abs(fire.y-point.y)<18: return false
 return true
static func place_flora(a,d,prop,origin):
 var best=null
 var score=INF
 for dy in range(-3,4):
  for dx in range(-8,9):
   var c=int(prop.c)+dx
   var r=int(prop.r)+dy
   if c<1 or c>int(d.get("cols",40))-3 or r<2 or r>=int(d.get("rows",23))-1: continue
   var point=origin+Vector2(c*8,r*8+8)
   var distance=abs(dx)+abs(dy)*4
   if distance<score and flora_safe(a,point):
    best=prop.duplicate(true)
    best.c=c
    best.r=r
    score=distance
 if best==null:
  a.flora_skipped+=1
  return null
 if best.c!=prop.c or best.r!=prop.r: a.flora_adjusted+=1
 return best
static func grass(a,point):
 if not ground_clear(a,point+Vector2(2,0),6,7): return
 var seed=a.hash_at(point.x,point.y)
 if seed%4==0: return
 var col=Color("#8caa72" if a.forest else ("#a89b72" if a.causeway else "#9aa582"))
 if a.fractured: col=col.lerp(a.accent,.22)
 for i in range(2+seed%3):
  var x=point.x+1+i*1.6
  var h=2+(seed+i)%4
  var sway=sin(a.clock*1.4+x*.1)*.35
  a.line(Vector2(x,point.y),Vector2(x+sway,point.y-h),col.darkened(.3),.8)
  a.box(x+sway,point.y-h,1,1,col)
 if seed%7==0:
  a.box(point.x+3,point.y-2,2,1,col.darkened(.08))
static func flowers(a,point):
 var palette=["#c4acd5","#e0c08e","#d9b37f"]
 var petal=Color(palette[1 if a.forest else (2 if a.causeway else 0)])
 if a.fractured: petal=petal.lerp(a.accent,.2)
 for i in range(3):
  var x=point.x+i*4
  var sway=sin(a.clock*1.1+x*.12)*.45
  var top=Vector2(x+sway,point.y-6-i%2*3)
  a.line(Vector2(x,point.y),top,"#73886b",.8)
  a.line(Vector2(x,point.y-2),Vector2(x-2,point.y-4),"#a4b18a",.8)
  a.box(top.x-2,top.y,4,1,petal)
  a.box(top.x-1,top.y-1,2,3,petal.lightened(.1))
  a.box(top.x,top.y+1,1,1,"#c8a46d")
static func fern(a,point):
 for i in range(5):
  var h=3+i%3*2
  var tip=Vector2(point.x-1+i*2+sin(a.clock+x_seed(point))*.3,point.y-h)
  a.line(point+Vector2(3,0),tip,"#91a477",.7)
  for j in range(2):
   var at=tip+Vector2(0,j*2)
   a.line(at-Vector2(2,-1),at+Vector2(2,1),"#6f8c65",.8)
static func x_seed(point): return point.x*.11+point.y*.03
static func person_base(a,who,point,active):
 var x=point.x
 var y=point.y
 var sit=3 if who.who in ["vey","rowan","hale"] else 0
 var phase=a.clock*1.6+x*.03
 var lift=sin(phase)*.2
 var coat=Color({"vey":"#a28b6d","mara":"#7e9c8b","rowan":"#8a8c81","olan":"#7a8194","elsie":"#a29378","silas":"#777d89","orra":"#8f9f7c","sable":"#8c7b95"}.get(who.who,"#87917f"))
 if a.fractured: a.circle(point+Vector2(2,-10+sit),10,Color(a.accent,.055))
 a.line(Vector2(x-3,y),Vector2(x+8,y),Color(.02,.04,.06,.35),1)
 a.polygon([Vector2(x,y-11+sit),Vector2(x+5,y-11+sit),Vector2(x+7,y-3),Vector2(x-2,y-3)],coat.darkened(.15))
 a.box(x,y-9+sit,5,6-sit,coat)
 a.line(Vector2(x,y-10+sit),Vector2(x+2,y-5),coat.lightened(.25),.7)
 a.line(Vector2(x+5,y-10+sit),Vector2(x+3,y-6),coat.darkened(.3),.8)
 a.box(x+2,y-7,1,5,"#c1ac7c")
 a.box(x-1,y-3,2,2,"#3b4650")
 a.box(x+4,y-3,2,2,"#3b4650")
 a.box(x-2,y-1,4,1,"#8e8473")
 a.box(x+4,y-1,4,1,"#8e8473")
 a.box(x,y-15+sit+lift,5,5,"#b89b7e")
 a.box(x+1,y-15+sit+lift,4,4,"#dfc6a2")
 a.box(x-1,y-17+sit+lift,7,3,coat.darkened(.25))
 a.box(x,y-17+sit+lift,5,1,coat.lightened(.3))
 var face=who.get("face",1)
 a.box(x+(4 if face>0 else 0),y-13+sit+lift,1,1,"#29353c")
 a.box(x+(5 if face>0 else -1),y-12+sit+lift,1,1,"#d8bd98")
 a.box(x+1,y-10+sit,3,1,"#ae8e72")
 if active and a.speaker==who.who and int(a.clock*6)%2==0: a.box(x+(3 if face>0 else 0),y-11+sit,1,1,"#6f4c43")
 if who.who=="mara":
  a.line(Vector2(x-2,y-10),Vector2(x+6,y-10),"#c9ba8f",1)
  a.box(x-1,y-7,2,3,"#a6b69b")
 if who.who=="elsie":
  a.box(x,y-8,4,5,"#cec5a2")
  a.box(x+1,y-6,2,2,"#939d7e")
 if who.who in ["rowan","sentinel"]:
  a.box(x-2,y-10+sit,2,4,"#9fa9a8")
  a.box(x+5,y-10+sit,2,4,"#b7bcab")
static func hazard_vertex(v,t):
 if t==4: return Vector2(v.x,8-v.y)
 if t==5: return Vector2(v.y,v.x)
 if t==6: return Vector2(8-v.y,v.x)
 return v
static func spikes(a,t,point):
 var metal=Color("#d8ddcf").lerp(a.accent,.12 if a.fractured else .03)
 var root=[]
 for v in [Vector2(0,7),Vector2(8,7),Vector2(8,8),Vector2(0,8)]: root.append(point+hazard_vertex(v,t))
 a.polygon(root,"#6e7a78")
 for x in [0,4]:
  var verts=[]
  for v in [Vector2(x,7),Vector2(x+2,0),Vector2(x+4,7)]: verts.append(point+hazard_vertex(v,t))
  a.polygon(verts,metal)
  a.polygon([point+hazard_vertex(Vector2(x,7),t),point+hazard_vertex(Vector2(x+2,0),t),point+hazard_vertex(Vector2(x+2,7),t)],"#879b9f")
  a.line(point+hazard_vertex(Vector2(x+2,1),t),point+hazard_vertex(Vector2(x+3,5),t),"#f3f2df",.7)
static func dust_bunny(a,e,origin):
 var at=origin+Vector2(e.x,e.y)
 var r=float(e.radius)
 a.circle(at,r+2,Color(.8,.45,.4,.07))
 for i in range(9):
  var angle=i*TAU/9+a.clock*.4
  var edge=at+Vector2(cos(angle),sin(angle))*r*.72
  a.circle(edge,r*.35,"#746b78")
  a.line(edge,edge+Vector2(cos(angle),sin(angle))*(r*.35+1),"#b6a0a0",.6)
 a.circle(at,r*.75,"#92838a")
 a.circle(at+Vector2(-r*.2,-r*.25),r*.42,"#b29c9d")
 a.line(at+Vector2(-r*.65,r*.3),at+Vector2(r*.5,-r*.35),"#6b6574",.8)
 for side in [-1,1]:
  a.box(at.x+side*r*.32-.5,at.y-1,1,1,"#f1dcc0")
 a.box(at.x,at.y+1,1,1,"#4f4453")
static func background_details(a):
 if a.forest:
  for i in range(8):
   var x=fposmod(i*59-a.camera.x*.08,380)-30
   var y=91+(i%3)*17-a.camera.y*.015
   a.line(Vector2(x,y),Vector2(x+13,y-18),Color(.35,.48,.39,.24),1)
   for j in range(3): a.line(Vector2(x+j*4,y-j*5),Vector2(x+j*4-4,y-j*5-6),Color(.4,.55,.43,.18),1)
 elif a.causeway:
  for i in range(7):
   var x=fposmod(i*73-a.camera.x*.12,420)-35
   var y=104+i%2*16-a.camera.y*.02
   a.line(Vector2(x,y),Vector2(x+48,y),"#7b6760",.7)
   a.box(x+8,y-10,4,9,"#4c444b")
   a.box(x+9,y-9,1,3,Color(a.accent,.22))
 else:
  for i in range(6):
   var x=fposmod(i*83-a.camera.x*.18,430)-40
   var y=110+i%3*9-a.camera.y*.02
   a.box(x,y,24,2,"#42545c")
   for c in range(4): a.box(x+c*6,y-3,3,3,"#4d5f64")
   a.line(Vector2(x+3,y+2),Vector2(x+3,y+30),"#344650",1)
 if a.fractured:
  for i in range(4):
   var x=fposmod(i*101-a.camera.x*.025,370)-20
   a.line(Vector2(x,21+i*7),Vector2(x+7,32+i*7),Color(a.accent,.1),.6)
   a.line(Vector2(x+7,32+i*7),Vector2(x+3,47+i*7),Color(a.accent,.07),.6)
