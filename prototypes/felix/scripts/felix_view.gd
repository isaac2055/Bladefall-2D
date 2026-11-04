extends "res://scripts/landscape.gd"
## The New House at night: the Outskirts' rooms, collision and devices are unchanged.
## Only what they are is redrawn: a firefly-sized light climbing a child's bedroom.

var story=null
var felix_light: PointLight2D
var door_light: PointLight2D
var moon_light: PointLight2D
var glow_lights=[]
var glow_texture: Texture2D
var room_material={}
var felix_glow=1.0
var gift_pulse=0.0
var riding=false

# Where the bedroom's furniture stands, in world pixels. Rooms are open air in front of it.
const DOOR=Rect2(150,8,74,136)
const BED=Rect2(980,-46,600,46)
const HEADBOARD=Rect2(1560,-130,26,130)
const PILLOW=Vector2(1500,-58)
const SHELF=Rect2(1330,-330,560,250)
const DESK=Rect2(1960,-420,520,190)
const DRESSER=Rect2(2580,-500,930,230)
# The window, sill and moon sit behind the windowsill room wherever the world puts it.
var WINDOW=Rect2()
var SILL_Y=0.0
var MOON=Vector2()
const WARDROBE_X=4500.0

func _ready():
 var sill=runtime.placements.get("cl1-atlas-crossroads",Vector2.ZERO)
 SILL_Y=sill.y+80
 WINDOW=Rect2(sill.x+40,SILL_Y-230,240,230)
 MOON=Vector2(sill.x+200,SILL_Y-170)
 super._ready()
 wind.amount=18
 var dust=wind.process_material as ParticleProcessMaterial
 dust.color=Color(.75,.8,1,.10)
 dust.initial_velocity_min=1
 dust.initial_velocity_max=3
 dust.direction=Vector3(.2,-.3,0)
 glow_texture=radial_texture(Color(1,1,1))
 felix_light=make_point_light(Color(1,.97,.88),1.0,.9,true)
 door_light=make_point_light(Color(1,.78,.48),1.2,.85,false)
 moon_light=make_point_light(Color(.62,.72,1),.9,6.0,false)
 for i in range(10): glow_lights.append(make_point_light(Color(.8,1,.7),.7,.35,false))

func radial_texture(tint):
 var image=Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var d=Vector2(x-64,y-64).length()/64.0
   image.set_pixel(x,y,Color(tint.r,tint.g,tint.b,pow(max(0,1-d),1.8)))
 return ImageTexture.create_from_image(image)

func make_point_light(color,energy,scale_value,shadows):
 var light=PointLight2D.new()
 light.texture=glow_texture if glow_texture!=null else radial_texture(Color.WHITE)
 light.color=color
 light.energy=energy
 light.texture_scale=scale_value
 light.shadow_enabled=shadows
 light.shadow_color=Color(0,0,0,.55)
 light.shadow_filter=Light2D.SHADOW_FILTER_PCF5
 add_child(light)
 return light

func configure_mood():
 accent=Color("#fff4d6")
 mood=Color("#5a6390")

# Twenty tiles: floorboards and furniture wood, moving-box cardboard, a ruler shelf, open air.
func make_tiles():
 var image=Image.create(160,8,false,Image.FORMAT_RGBA8)
 image.fill(Color.TRANSPARENT)
 for variant in range(20):
  for y in range(8):
   for x in range(8):
    var color=Color.TRANSPARENT
    if variant<=10 or variant in [16,17]:
     # Floorboards: long planks, a seam only now and then.
     color=Color("#4c3424")
     if y==7: color=Color("#3a281c")
     if variant in [0,4] and x==6 and y<7: color=Color("#34241a")
     if hash_at(x,y,variant)%11==0: color=color.lightened(.05)
     if variant<4:
      if y==0: color=Color("#b3875c")
      elif y==1: color=Color("#8d6342")
      elif y==2: color=Color("#694832")
     elif variant==8 and x==0: color=Color("#6c4b33")
     elif variant==9 and x==7: color=Color("#2c1f15")
     elif variant==10 and y==7: color=Color("#24180f")
     if variant in [16,17]:
      color=Color("#2a1d15") if (y+variant)%4 else Color("#231811")
      if hash_at(x,y,variant)%9==0: color=Color("#31231a")
    elif variant<=14 or variant in [18,19]:
     color=Color("#a77c49")
     if x%2==0: color=Color("#9f7443")
     if hash_at(x,y,variant)%17==0: color=color.darkened(.08)
     if variant==11:
      if y==0: color=Color("#dcb882")
      elif y==1: color=Color("#c39a64")
      if x in [3,4] and y<=3: color=Color("#d9cfa6")
     elif variant==13 and x==0: color=Color("#c9a26c")
     elif variant==14 and x==7: color=Color("#76552f")
     elif variant in [18,19]: color=color.darkened(.12)
    elif variant==15:
     if y==0: color=Color("#ead79d")
     elif y==1: color=Color("#b99d5c") if x%2==0 else Color("#cdb377")
    image.set_pixel(variant*8+x,y,color)
 var atlas=TileSetAtlasSource.new()
 atlas.texture=ImageTexture.create_from_image(image)
 atlas.texture_region_size=Vector2i(8,8)
 for x in range(20): atlas.create_tile(Vector2i(x,0))
 var result=TileSet.new()
 result.tile_size=Vector2i(8,8)
 result.add_source(atlas,0)
 return result

func solid_at(cell): return runtime.cells.get(cell,0)==1

# Rock joined to a room's frame is the house: floorboards and furniture. Anything
# standing free inside a room is a moving box.
func build_terrain():
 for d in world_data.world.rooms:
  var origin=placements.get(d.id,Vector2.ZERO)
  var cols=int(d.get("cols",40))
  var rows=int(d.get("rows",23))
  var base=Vector2i(origin/8)
  var frame={}
  var queue=[]
  for r in range(rows):
   for c in range(cols):
    if (r in [0,rows-1] or c in [0,cols-1]) and solid_at(base+Vector2i(c,r)):
     frame[Vector2i(c,r)]=true
     queue.append(Vector2i(c,r))
  while not queue.is_empty():
   var at=queue.pop_back()
   for step in [Vector2i(1,0),Vector2i(-1,0),Vector2i(0,1),Vector2i(0,-1)]:
    var next=at+step
    if next.x<0 or next.y<0 or next.x>=cols or next.y>=rows or frame.has(next): continue
    if solid_at(base+next):
     frame[next]=true
     queue.append(next)
  for r in range(rows):
   for c in range(cols):
    var cell=base+Vector2i(c,r)
    var value=runtime.cells.get(cell,0)
    if value==2:
     tiles.set_cell(cell,0,Vector2i(15,0))
     continue
    if value!=1: continue
    var wood=frame.has(Vector2i(c,r))
    room_material[cell]="wood" if wood else "box"
    var open_up=not solid_at(cell+Vector2i(0,-1))
    var seam=posmod(cell.x+(cell.y%2)*3,6)==0
    var variant=(4 if seam else [5,6,7][hash_at(cell.x,cell.y)%3]) if wood else 12
    var deep=solid_at(cell+Vector2i(0,-1)) and solid_at(cell+Vector2i(0,-2)) and solid_at(cell+Vector2i(-1,0)) and solid_at(cell+Vector2i(1,0))
    if deep: variant=(16 if wood else 18)+hash_at(cell.x,cell.y,3)%2
    if open_up:
     variant=(0 if seam else [1,2,3][hash_at(cell.x,cell.y)%3]) if wood else 11
     surfaces.append(Vector2(cell)*8)
    elif not solid_at(cell+Vector2i(-1,0)): variant=8 if wood else 13
    elif not solid_at(cell+Vector2i(1,0)): variant=9 if wood else 14
    elif not solid_at(cell+Vector2i(0,1)): variant=10 if wood else 12
    tiles.set_cell(cell,0,Vector2i(variant,0))
  build_shadows(d,origin,cols,rows)
 for section in sections:
  if section.get("fire")!=null:
   var at=placements[section.room]+Vector2(section.fire.c*8+3,section.fire.r*8-10)
   if not fires.any(func(f):return f.distance_to(at)<16): fires.append(at)

func draw_boundary_tiles():
 if runtime==null: return
 for cell in runtime.closed_edges: tiles.set_cell(cell,0,Vector2i(4+hash_at(cell.x,cell.y)%4,0))

# Checkpoints are crayon stars on the wall; their glow is soft, not firelight.
func make_lights():
 for point in fires:
  var light=make_point_light(Color(1,.93,.72),.55,.45,false)
  var sparks=GPUParticles2D.new()
  sparks.emitting=false
  sparks.amount=1
  add_child(sparks)
  lights.append({"node":light,"sparks":sparks,"point":point})

func _process(delta):
 super._process(delta)
 if sim==null: return
 for item in lights:
  item.node.energy=.45+sin(clock*1.3+item.point.x)*.05
  item.sparks.emitting=false
 gift_pulse=max(0,gift_pulse-delta)
 var center=actor+Vector2(4,5)-camera
 felix_light.position=center
 var target=story.felix_radius() if story!=null else 1.0
 felix_glow=lerp(felix_glow,target,1-exp(-delta*3))
 felix_light.texture_scale=felix_glow*(1+gift_pulse*.6)
 felix_light.energy=1.1+gift_pulse*1.5
 felix_light.color=Color(1,.97,.88).lerp(Color(.7,1,.6),clamp(float(sim.p.get("pollen",0))/45.0,0,1)*.6)
 felix_light.visible=sim.p.state!="dead"
 door_light.position=Vector2(DOOR.position.x+DOOR.size.x/2,DOOR.end.y-2)-camera
 door_light.visible=Rect2(-200,-200,720,580).has_point(door_light.position)
 moon_light.position=MOON+Vector2(0,40)-camera
 moon_light.energy=(story.moon_strength() if story!=null else .9)
 ambient.color=story.ambient() if story!=null else mood
 place_glow_lights()

func place_glow_lights():
 var view=Rect2(camera-Vector2(40,40),Vector2(400,264))
 var spots=[]
 var scenes=runtime.cores.values()
 for scene in scenes:
  if not Rect2(scene.world_origin,Vector2(scene.room.w,scene.room.h)).intersects(view): continue
  for e in scene.ents:
   var at=scene.world_origin+Vector2(e.x+e.w/2.0,e.y+e.h/2.0)
   if not view.has_point(at): continue
   if e.type=="refill" and e.timer==0: spots.append([at,Color(.78,1,.62),.55,.3])
   elif e.type=="stone" and e.get("lit",false): spots.append([at,Color(1,.86,.5),.9,.55])
   elif e.type=="lantern" and not e.get("held",false): spots.append([at,Color(1,.84,.55),1.6,1.6])
 if sim.p.carrying!=null: spots.append([actor+Vector2(4,-4),Color(1,.84,.55),1.6,1.6])
 for i in range(glow_lights.size()):
  var light=glow_lights[i]
  if i<spots.size():
   light.visible=true
   light.position=spots[i][0]-camera
   light.color=spots[i][1]
   light.energy=spots[i][2]
   light.texture_scale=spots[i][3]
  else: light.visible=false

# ---------------------------------------------------------------- background
func _draw():
 if Engine.is_editor_hint(): return
 ink=self
 var top=Color("#141a2e")
 var bottom=Color("#262c44")
 for band in range(12):
  box(0,band*16,320,16,top.lerp(bottom,band/11.0))
 draw_set_transform(-camera)
 var view=Rect2(camera-Vector2(30,30),Vector2(380,244))
 wallpaper(view)
 baseboard(view)
 if view.intersects(DOOR.grow(20)): door()
 moving_boxes(view)
 if view.intersects(SHELF.grow(10)): shelf()
 if view.intersects(DESK.grow(30)): desk()
 if view.intersects(DRESSER.grow(30)): dresser()
 if view.intersects(WINDOW.grow(120)): window()
 if view.intersects(Rect2(3840,-720,640,400)): curtains()
 if view.end.x>WARDROBE_X and view.position.x<WINDOW.position.x-40: wardrobe(view)
 if view.intersects(WINDOW.grow(60)): photo_wall()
 if view.intersects(Rect2(BED.position-Vector2(0,100),BED.size+Vector2(40,250))): bed()
 for point in fires:
  if view.has_point(point): crayon_star(point,runtime.checkpoint_id!="" and placements.get(runtime.checkpoint_id,Vector2(-9e9,0)).distance_to(point)<400)
 if story!=null:
  story_dark(view)
  draw_boy()
 draw_set_transform(Vector2.ZERO)

func wallpaper(view):
 var step=22
 for gy in range(floori(view.position.y/step),ceili(view.end.y/step)+1):
  for gx in range(floori(view.position.x/step),ceili(view.end.x/step)+1):
   var at=Vector2(gx*step+(11 if gy%2 else 0),gy*step)
   var h=hash_at(gx,gy,4)
   if h%3==0:
    box(at.x,at.y,1,1,"#39406a")
    box(at.x-1,at.y,3,.5,Color("#39406a",.5))
   elif h%3==1:
    circle(at,1.6,"#323a5e")
    circle(at+Vector2(.8,-.5),1.4,"#1d2338")
 for stripe in range(floori(view.position.x/88),ceili(view.end.x/88)+1):
  box(stripe*88,view.position.y,1,view.size.y,Color("#2c3352",.6))

func baseboard(view):
 # The floor runs under the first five rooms; skirting boards trace it.
 if view.end.y<120 or view.position.x>1640: return
 box(max(view.position.x,0),130,min(view.size.x,1640),14,"#2f3149")
 box(max(view.position.x,0),130,min(view.size.x,1640),1.5,"#535475")

func door():
 var d=DOOR
 box(d.position.x-5,d.position.y-5,d.size.x+10,d.size.y+5,"#3b3a55")
 box(d.position.x,d.position.y,d.size.x,d.size.y,"#2e2c43")
 for panel in [Rect2(d.position+Vector2(8,10),Vector2(d.size.x-16,50)),Rect2(d.position+Vector2(8,70),Vector2(d.size.x-16,56))]:
  ink.draw_rect(panel,Color("#3e3b5a"),false,1.2)
 circle(Vector2(d.end.x-10,d.position.y+72),2.2,"#8a7a5a")
 # Hallway light under the door: someone is still awake out there.
 box(d.position.x+2,d.end.y-2,d.size.x-4,2,"#f3c785")
 polygon([Vector2(d.position.x+2,d.end.y),Vector2(d.end.x-2,d.end.y),Vector2(d.end.x+16,d.end.y+1),Vector2(d.position.x-16,d.end.y+1)],Color(1,.8,.5,.35))

func moving_boxes(view):
 # Unpacked boxes, stacked behind the play rooms near the door.
 var boxes=[[Rect2(236,72,58,72),"BOOKS"],[Rect2(298,96,44,48),"MOM"],[Rect2(246,34,40,38),"ISAAC"],[Rect2(560,88,70,56),"TOYS"],[Rect2(860,100,52,44),"DAD - TAKE"],[Rect2(870,62,36,38),""]]
 for item in boxes:
  var b=item[0]
  if not view.intersects(b): continue
  box(b.position.x,b.position.y,b.size.x,b.size.y,"#4d3d2e")
  box(b.position.x,b.position.y,b.size.x,2,"#6c5641")
  box(b.position.x+b.size.x/2-3,b.position.y,6,b.size.y*.4,"#6e6450")
  line(b.position+Vector2(0,b.size.y),b.end,"#2b2119",1)
  if item[1]!="": marker(item[1],b.position+Vector2(5,b.size.y*.62),6,Color("#1f1a18"))

func marker(text_value,at,size,color):
 ink.draw_string(ThemeDB.fallback_font,at,text_value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color*ink_color)

func bed():
 var b=BED
 # Legs reach the floor; the frame sits above the room you crawl through underneath.
 for x in [b.position.x+8,b.end.x-30]: box(x,b.end.y,10,144-b.end.y,"#3a2a22")
 box(b.position.x,b.position.y+30,b.size.x,16,"#4b3528")
 box(b.position.x,b.position.y+30,b.size.x,2,"#6a4c38")
 # Mattress and quilt.
 box(b.position.x+4,b.position.y+12,b.size.x-8,20,"#c9c4d6")
 var quilt=[Color("#405a8c"),Color("#5d7aa8"),Color("#6a5590"),Color("#3f6e7a")]
 for i in range(int(b.size.x/26)):
  var x=b.position.x+6+i*26
  if x>b.end.x-90: break
  box(x,b.position.y+4,26,30,quilt[i%4])
  box(x,b.position.y+4,26,1.5,quilt[i%4].lightened(.25))
  for k in range(3): box(x+4+k*8,b.position.y+18,2,2,Color(1,1,1,.12))
 # Headboard and pillow.
 var h=HEADBOARD
 box(h.position.x,h.position.y,h.size.x,h.size.y,"#4e382b")
 circle(Vector2(h.position.x+h.size.x/2,h.position.y),13,"#4e382b")
 box(h.position.x+4,h.position.y+10,h.size.x-8,2,"#6a4c38")
 ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D(-.06,PILLOW))
 box(-34,-10,68,22,"#e4e0ec")
 box(-34,-10,68,3,"#f6f4fb")
 ink.draw_set_transform(-camera)

func shelf():
 var s=SHELF
 box(s.position.x,s.position.y,s.size.x,s.size.y,"#2b2537")
 for k in range(4):
  var y=s.position.y+k*62+52
  box(s.position.x,y,s.size.x,6,"#47394f")
  var x=s.position.x+8
  var i=0
  while x<s.end.x-14:
   var w=6+hash_at(i,k,1)%7
   var hgt=26+hash_at(i,k,2)%20
   var col=[Color("#6e3f4d"),Color("#3f5a6e"),Color("#6a6a3c"),Color("#4f3f6e"),Color("#3c6a58")][hash_at(i,k,3)%5]
   if hash_at(i,k,4)%9==0: x+=10
   else:
    box(x,y-hgt,w,hgt,col)
    box(x+1,y-hgt+4,w-2,1,col.lightened(.25))
   x+=w+1
   i+=1

func desk():
 var d=DESK
 box(d.position.x,d.position.y+16,d.size.x,10,"#4a3a30")
 box(d.position.x,d.position.y+16,d.size.x,1.5,"#6d5747")
 for x in [d.position.x+10,d.end.x-22]: box(x,d.position.y+26,12,d.size.y,"#3c2f27")
 # A desk lamp, switched off, and a cup of crayons.
 var base=Vector2(d.position.x+80,d.position.y+16)
 box(base.x-14,base.y-4,28,4,"#3d4258")
 line(base,base+Vector2(18,-46),"#4c526c",3)
 line(base+Vector2(18,-46),base+Vector2(-12,-70),"#4c526c",3)
 polygon([base+Vector2(-12,-70),base+Vector2(-36,-58),base+Vector2(-20,-48)],"#5a607d")
 var cup=Vector2(d.end.x-120,d.position.y+16)
 box(cup.x,cup.y-22,20,22,"#5d6f8c")
 for i in range(5):
  var col=[Color("#d0574d"),Color("#e1b84a"),Color("#4f8fd0"),Color("#5fae6a"),Color("#a46ad1")][i]
  line(cup+Vector2(3+i*3.5,-20),cup+Vector2(2+i*3.6,-34-i%2*4),col,2)

func dresser():
 var d=DRESSER
 box(d.position.x,d.position.y,d.size.x,d.size.y,"#33283a")
 box(d.position.x,d.position.y,d.size.x,6,"#4b3b52")
 for row in range(3):
  for col in range(4):
   var r=Rect2(d.position.x+12+col*(d.size.x-24)/4,d.position.y+18+row*70,(d.size.x-24)/4-10,58)
   ink.draw_rect(r,Color("#45384f"),false,1.5)
   circle(r.position+r.size/2,3,"#7d6a52")
 # Toys asleep on top: a robot, a stacking-ring tower, a rocket.
 var top=d.position.y
 var robot=Vector2(d.position.x+160,top)
 box(robot.x-12,robot.y-30,24,22,"#5a6274")
 box(robot.x-9,robot.y-48,18,16,"#6b7387")
 box(robot.x-5,robot.y-42,3,3,"#2a2d38")
 box(robot.x+2,robot.y-42,3,3,"#2a2d38")
 line(robot+Vector2(0,-48),robot+Vector2(0,-56),"#6b7387",1.5)
 circle(robot+Vector2(0,-57),2,"#9a4a4a")
 box(robot.x-10,robot.y-8,6,8,"#4a5262")
 box(robot.x+4,robot.y-8,6,8,"#4a5262")
 var rings=Vector2(d.position.x+520,top)
 line(rings,rings+Vector2(0,-62),"#6d5b45",3)
 for i in range(5):
  var w=36-i*6
  box(rings.x-w/2,rings.y-10-i*10,w,9,[Color("#a34d4d"),Color("#c4893f"),Color("#b9a947"),Color("#4f8d5c"),Color("#4c6fa3")][i])
 var rocket=Vector2(d.position.x+760,top)
 polygon([rocket+Vector2(-8,0),rocket+Vector2(8,0),rocket+Vector2(6,-40),rocket+Vector2(0,-56),rocket+Vector2(-6,-40)],"#b7b2c4")
 circle(rocket+Vector2(0,-30),4,"#3c5f8a")
 polygon([rocket+Vector2(-8,0),rocket+Vector2(-15,4),rocket+Vector2(-7,-14)],"#a44848")
 polygon([rocket+Vector2(8,0),rocket+Vector2(15,4),rocket+Vector2(7,-14)],"#a44848")

func window():
 var w=WINDOW
 # Night sky behind the glass, with a slow parallax so it feels far away.
 var sky_top=Color("#0e1630")
 var sky_low=Color("#2a3c6a")
 for i in range(10): box(w.position.x,w.position.y+i*w.size.y/10,w.size.x,w.size.y/10+1,sky_top.lerp(sky_low,i/9.0))
 var drift=camera*.12
 for i in range(70):
  var at=Vector2(w.position.x+fposmod(i*97.3-drift.x,w.size.x),w.position.y+fposmod(i*41.9-drift.y,w.size.y*.8))
  var a=.35+sin(clock*.9+i)*.25
  box(at.x,at.y,1,1,Color(1,1,.9,a))
 var moon=MOON-drift*.15
 circle(moon,34,Color(.85,.9,1,.06))
 circle(moon,24,Color(.9,.93,1,.12))
 circle(moon,16,"#f1efdc")
 circle(moon+Vector2(-5,-3),3,"#dcd8c0")
 circle(moon+Vector2(6,5),2.2,"#dcd8c0")
 # Frame and mullions.
 var frame=Color("#5d6688")
 ink.draw_rect(w,frame,false,7)
 box(w.position.x+w.size.x/2-3,w.position.y,6,w.size.y,frame)
 box(w.position.x,w.position.y+w.size.y/2-3,w.size.x,6,frame)
 box(w.position.x-14,SILL_Y,w.size.x+28,9,"#6c7598")
 box(w.position.x-14,SILL_Y,w.size.x+28,2,"#9aa3c4")
 for side in [-1,1]:
  var x=w.position.x-24 if side<0 else w.end.x+4
  for fold in range(2):
   polygon([Vector2(x+fold*10,w.position.y-14),Vector2(x+10+fold*10,w.position.y-14),Vector2(x+10+fold*10+sin(clock*.6+fold)*1.2,SILL_Y+30),Vector2(x+fold*10,SILL_Y+30)],[Color("#5a3d63"),Color("#4c3355")][fold])
 box(w.position.x-30,w.position.y-20,w.size.x+60,5,"#7d6a52")

func photo_wall():
 # The good days Felix brought up, propped along the windowsill against the glass.
 if story==null: return
 for i in range(story.photos.size()):
  var at=Vector2(WINDOW.position.x+14+i*23,SILL_Y-9-(i%2)*2)
  photo(at,story.wardrobe_rooms.find(story.photos[i]),sin(i*1.7)*.14)

func curtains():
 # The long curtains of the room's other window: the climb before the wardrobe.
 for side in [3862.0,4352.0]:
  for fold in range(6):
   var x=side+fold*16
   var sway=sin(clock*.6+fold)*1.5
   polygon([Vector2(x,-700),Vector2(x+16,-700),Vector2(x+16+sway,-340),Vector2(x+sway,-340)],[Color("#5a3d63"),Color("#4c3355")][fold%2])
 box(3840,-706,620,6,"#7d6a52")

func wardrobe(view):
 # The top of the wardrobe: dark panels behind a shelf of packed-away boxes.
 var left=max(view.position.x,WARDROBE_X)
 var right=min(view.end.x,WINDOW.position.x-40)
 box(left,max(view.position.y,-712),right-left,view.end.y-max(view.position.y,-712),Color("#20182a"))
 for gx in range(floori(view.position.x/34),ceili(view.end.x/34)+1):
  box(gx*34,view.position.y,1.5,view.size.y,"#2c2236")
 # Below the walkway the rooms are the insides of the boxes: corrugated cardboard.
 if view.end.y>-664:
  var top=max(view.position.y,-664)
  box(left,top,right-left,view.end.y-top,Color("#2e2218"))
  for gx in range(floori(left/6),ceili(right/6)+1): box(gx*6,top,1,view.end.y-top,Color("#3a2c1f"))
 # On the shelf, more boxes waiting their turn.
 for gx in range(floori(view.position.x/90),ceili(view.end.x/90)+1):
  var h=30+hash_at(gx,5,9)%14
  var b=Rect2(gx*90+hash_at(gx,4,9)%30,-672-h,50+hash_at(gx,6,9)%20,h)
  if b.position.x<left or b.end.x>right: continue
  box(b.position.x,b.position.y,b.size.x,b.size.y,"#3a2e26")
  box(b.position.x,b.position.y,b.size.x,2,"#56443a")
  marker(["PHOTOS","FAMILY","BABY STUFF","PHOTOS","XMAS"][posmod(gx,5)],b.position+Vector2(4,b.size.y*.62),6,Color("#15100c"))

func crayon_star(point,current):
 var col=Color("#ffe39a") if current else Color("#d9c17a")
 var r=6.0+(sin(clock*2)*.6 if current else 0.0)
 var pts=[]
 for i in range(10):
  var angle=-PI/2+i*PI/5
  var rr=r if i%2==0 else r*.45
  pts.append(point+Vector2(cos(angle),sin(angle))*rr)
 pts.append(pts[0])
 ink.draw_polyline(PackedVector2Array(pts),col*ink_color,1.2)
 if current: circle(point,2,Color(col,.6))

func story_dark(view):
 # The dark from under the bed climbs the wall as the night goes on.
 var amount=story.dark_amount()
 if amount<=0: return
 var base=view.end.y+10
 for i in range(14):
  var x=view.position.x+i*30+sin(clock*.5+i)*6
  var reach=(60+hash_at(i,3,9)%70)*amount
  var pts=[Vector2(x-14,base),Vector2(x+14,base)]
  for k in range(6):
   var t=k/5.0
   pts.insert(1,Vector2(x+14-t*10+sin(clock*1.3+i+k)*4,base-reach*t))
   pts.append(Vector2(x-14+t*10+sin(clock*1.1+i+k)*4,base-reach*t))
  var hull=[Vector2(x-14,base)]
  for k in range(6): hull.append(Vector2(x-14+k*2+sin(clock*1.1+i+k)*3,base-reach*k/5.0))
  hull.append(Vector2(x+1,base-reach-6))
  for k in range(5,-1,-1): hull.append(Vector2(x+14-k*2+sin(clock*1.3+i+k)*3,base-reach*k/5.0))
  hull.append(Vector2(x+14,base))
  polygon(hull,Color(0,0,.02,.55*amount))
  if amount>.5 and hash_at(i,7,1)%4==0 and fmod(clock+i,5.0)>.25:
   var eye=Vector2(x,base-reach*.6)
   box(eye.x-3,eye.y,2,1.2,Color(.9,.85,1,.7*amount))
   box(eye.x+1,eye.y,2,1.2,Color(.9,.85,1,.7*amount))

# ---------------------------------------------------------------- the boy
func draw_boy():
 var b=story.boy
 if not b.visible: return
 var at=b.position
 match b.pose:
  "crying","looking": boy_sitting(at,b.pose=="crying")
  "kneel": boy_kneeling(at,b.facing,b.prop)
  "run","stand","wave","point": boy_standing(at,b.facing,b.pose)
  "bed": boy_in_bed(at)

func boy_head(c,face_dir,mood_name):
 circle(c,15,"#f1c9a5")
 # Messy hair.
 polygon([c+Vector2(-16,-2),c+Vector2(-14,-14),c+Vector2(-4,-19),c+Vector2(8,-18),c+Vector2(16,-9),c+Vector2(15,-1),c+Vector2(9,-9),c+Vector2(0,-8),c+Vector2(-8,-11)],"#5b3a24")
 polygon([c+Vector2(-2,-17),c+Vector2(2,-25),c+Vector2(5,-17)],"#5b3a24")
 var e=c+Vector2(face_dir*3,1)
 match mood_name:
  "crying":
   line(e+Vector2(-7,0),e+Vector2(-3,1),"#3b2a22",1.3)
   line(e+Vector2(3,1),e+Vector2(7,0),"#3b2a22",1.3)
   box(e.x-6,e.y+3,1,4+sin(clock*3)*1.5,Color("#9fd0ff",.8))
   line(e+Vector2(-3,8),e+Vector2(3,8),"#7a4636",1.2)
  "asleep":
   line(e+Vector2(-7,0),e+Vector2(-3,0),"#3b2a22",1.2)
   line(e+Vector2(3,0),e+Vector2(7,0),"#3b2a22",1.2)
  _:
   circle(e+Vector2(-5,0),2.2,"#2b211c")
   circle(e+Vector2(5,0),2.2,"#2b211c")
   box(e.x-5.5,e.y-1,1,1,"#ffffff")
   box(e.x+4.5,e.y-1,1,1,"#ffffff")
   ink.draw_arc(e+Vector2(0,5),3.5,.2,PI-.2,8,Color("#7a4636")*ink_color,1.2)
 circle(c+Vector2(-9+face_dir*2,5),2.6,Color("#f09a8a",.35))
 circle(c+Vector2(9+face_dir*2,5),2.6,Color("#f09a8a",.35))

func pajamas(rect):
 box(rect.position.x,rect.position.y,rect.size.x,rect.size.y,"#5170a3")
 for i in range(int(rect.size.x*rect.size.y/90)):
  var at=rect.position+Vector2(hash_at(i,1,5)%int(rect.size.x),hash_at(i,2,5)%int(rect.size.y))
  box(at.x,at.y,1.5,1.5,"#d9cf86")

func boy_sitting(at,crying):
 # at: where he sits on the floor. Knees up, arms around them.
 var rock=sin(clock*2.4)*1.2 if crying else 0.0
 pajamas(Rect2(at+Vector2(-14,-46),Vector2(26,40)))
 polygon([at+Vector2(-2,-8),at+Vector2(26,-8),at+Vector2(30,-38),at+Vector2(12,-42)],"#46639a")
 box(at.x+22,at.y-8,12,7,"#f1c9a5")
 line(at+Vector2(-8,-34),at+Vector2(20,-36),"#f1c9a5",5)
 boy_head(at+Vector2(4+rock,-60),1 if not crying else 0,"crying" if crying else "look")

func boy_standing(at,facing,pose):
 var run=pose=="run"
 var t=clock*9
 for side in [-1,1]:
  var swing=sin(t+(0.0 if side<0 else PI))*(10 if run else 0)
  line(at+Vector2(side*5,-46),at+Vector2(side*5+swing,-2),"#46639a",8)
  box(at.x+side*5+swing-5,at.y-4,11,4,"#e8e4ee")
 pajamas(Rect2(at+Vector2(-13,-86),Vector2(26,42)))
 var arm_a=at+Vector2(-12,-80)
 var arm_b=at+Vector2(12,-80)
 if pose=="wave": line(arm_b,arm_b+Vector2(10,-26+sin(clock*8)*4),"#5170a3",6)
 elif pose=="point": line(arm_b,arm_b+Vector2(facing*24,-22),"#5170a3",6)
 else: line(arm_b,arm_b+Vector2(4+sin(t)*(8 if run else 1),26),"#5170a3",6)
 line(arm_a,arm_a+Vector2(-4-sin(t)*(8 if run else 1),26),"#5170a3",6)
 boy_head(at+Vector2(0,-102),facing,"look")

func boy_kneeling(at,facing,prop):
 pajamas(Rect2(at+Vector2(-13,-62),Vector2(26,40)))
 line(at+Vector2(-6,-24),at+Vector2(-18*facing,-2),"#46639a",8)
 line(at+Vector2(6,-24),at+Vector2(10,-2),"#46639a",8)
 var hand=at+Vector2(facing*20,-40)
 line(at+Vector2(facing*10,-56),hand,"#5170a3",6)
 if prop=="sock":
  for k in range(5): box(hand.x+facing*k*3,hand.y-2+k*1.2,3,5,"#c84a46" if k%2==0 else "#f2ede4")
 boy_head(at+Vector2(0,-78),facing,"look")

func boy_in_bed(at):
 if story.boy.get("hidden",false):
  # Under the quilt, a small lump that shakes now and then.
  var shiver=sin(clock*14)*.6 if fmod(clock,3.0)<.6 else 0.0
  circle(at+Vector2(shiver,6),17,"#5d7aa8")
  polygon([at+Vector2(14,10),at+Vector2(-120,6),at+Vector2(-124,22),at+Vector2(16,22)],"#5d7aa8")
  ink.draw_arc(at+Vector2(shiver,6),17,PI*1.1,PI*1.9,10,Color("#86a0c8")*ink_color,1.5)
  return
 boy_head(at,-1,"asleep" if story.boy.asleep else "look")
 # The quilt pulled up to his chin.
 polygon([at+Vector2(10,8),at+Vector2(-120,6),at+Vector2(-124,22),at+Vector2(14,22)],"#5d7aa8")
 line(at+Vector2(10,8),at+Vector2(-120,6),"#86a0c8",1.5)
 if story.boy.asleep and fmod(clock,4.0)<2.6:
  var z=fmod(clock,4.0)
  marker("z",at+Vector2(-14-z*4,-18-z*8),7,Color(.8,.85,1,.6*(1-z/2.6)))

# ---------------------------------------------------------------- the play plane
const LEGO=[Color("#d8433a"),Color("#f0c234"),Color("#3a6fd0"),Color("#ece8e0")]
func draw_hazard(t,point):
 var h=hash_at(point.x,point.y,7)
 if t==3:
  # Loose building bricks, studs up. Nobody steps on these twice.
  var col=LEGO[h%4]
  var lift=float(h%2)
  box(point.x+.5,point.y+3+lift,7,5-lift,col.darkened(.45))
  box(point.x+.5,point.y+3+lift,7,4-lift,col)
  box(point.x+.5,point.y+3+lift,7,1,col.lightened(.35))
  for s in [1.5,4.5]:
   box(point.x+s,point.y+1.2+lift,2,2,col.lightened(.1))
   box(point.x+s,point.y+1.2+lift,2,.7,col.lightened(.45))
 elif t==4:
  for s in [1,5]:
   box(point.x+s-1,point.y,4,2,"#c94a42" if h%2 else "#3f73c4")
   line(point+Vector2(s+1,2),point+Vector2(s+1,7),"#d8dde4",1)
 else:
  var dir=-1 if t==5 else 1
  var wall=point.x+(8 if t==5 else 0)
  for s in [1,5]:
   var col=[Color("#d8433a"),Color("#f0c234"),Color("#3a6fd0"),Color("#4f9e58")][(h+s)%4]
   box(wall-(3 if t==5 else 0),point.y+s-1,3,4,col)
   line(Vector2(wall+dir*3,point.y+s+1),Vector2(wall+dir*8,point.y+s+1),"#d8dde4",1)

func draw_front():
 if sim==null: return
 ink=front
 paint_transform=Transform2D(0,-camera)
 ink.draw_set_transform_matrix(paint_transform)
 var view=Rect2(camera-Vector2(20,35),Vector2(360,235))
 for scene in runtime.cores.values():
  var origin=scene.world_origin
  if not Rect2(origin,Vector2(scene.room.w,scene.room.h)).intersects(view): continue
  for r in range(max(0,floori((view.position.y-origin.y)/8)),min(int(scene.room.rows),ceili((view.end.y-origin.y)/8))):
   for c in range(max(0,floori((view.position.x-origin.x)/8)),min(int(scene.room.cols),ceili((view.end.x-origin.x)/8))):
    var t=scene.room.grid[r*int(scene.room.cols)+c]
    if t>=3: draw_hazard(t,origin+Vector2(c*8,r*8))
  if scene.room.def.has("workshopGoal"): goal_drawing(scene,origin)
  for e in scene.ents:
   if Rect2(origin+Vector2(e.x,e.y),Vector2(e.w,e.h)).grow(18).intersects(view): draw_entity(e,origin)
  for e in scene.sweepers: dust_bunny(e,origin,scene.room.id)
 slime_puddles(view)
 if story!=null: story_items(view)
 for trail in trails:
  var alpha=trail.life/trail.max*(.12 if reduced_motion else .4)
  circle(trail.p+Vector2(4,5),4,Color(1,.98,.9,alpha))
  circle(trail.p+Vector2(4,5),2,Color(1,1,1,alpha*1.4))
 for part in particles:
  var col=part.color
  col.a=clamp(part.life/part.max,0,1)*.8
  if part.get("spark",false): box(part.p.x,part.p.y,1,1,Color(1,.97,.85,col.a))
  else: box(part.p.x,part.p.y,1,1,col)
 draw_feel_world()
 if sim.p.state!="dead": draw_knight()
 ink.draw_set_transform(Vector2.ZERO)
 if fade>0: box(0,0,320,184,Color(0.02,0.02,0.05,fade*2.5))

func draw_entity_body(e,origin):
 if e.get("gone",false) or e.get("broken",false): return
 var x=origin.x+e.x
 var y=origin.y+e.y
 match e.type:
  "gate":
   # A cardboard flap. Light every lamp in the room and it folds up out of the way.
   if e.get("open",false):
    if e.t>=18: return
    y-=e.h*(1-pow(1-float(e.t)/18,2))
   box(x,y,e.w,e.h,"#b98d55")
   box(x,y,e.w,1.5,"#dcbc85")
   for c in range(0,int(e.w),2): box(x+c,y+2,.6,e.h-3,Color("#9a7040",.6))
   if e.w>=16 and e.h>=10: marker("KEEP OUT",Vector2(x+2,y+e.h/2+2),5,Color("#5a2a22"))
   line(Vector2(x,y+e.h),Vector2(x+e.w,y+e.h),"#5e4224",1)
  "held":
   # A wall of the dark itself. The nightlight on its dock holds it back.
   var a=1.0 if e.solid else .14
   box(x,y,e.w,e.h,Color(.02,.02,.06,.92*a))
   for k in range(int(e.h/6)):
    var wob=sin(clock*2+k*.9)*2
    circle(Vector2(x+e.w/2+wob,y+k*6+3),e.w*.6,Color(.03,.03,.09,.6*a))
   if e.solid and fmod(clock+x*.01,4.5)>.2:
    var eye=Vector2(x+e.w/2,y+e.h*.35+sin(clock*.7)*8)
    box(eye.x-3,eye.y,2,1.3,Color(.85,.8,1,.9))
    box(eye.x+1,eye.y,2,1.3,Color(.85,.8,1,.9))
  "crumble":
   # A row of alphabet blocks: they topple, and come back stacked.
   var jitter=sin(clock*70)*.6 if e.get("shaking",0)>0 else 0.0
   for c in range(0,int(e.w),8):
    var col=[Color("#d9574a"),Color("#e9be4c"),Color("#4d86cf"),Color("#5ca866")][hash_at(x+c,y,2)%4]
    box(x+c+jitter,y,8,e.h,col)
    box(x+c+jitter,y,8,1,col.lightened(.3))
    ink.draw_rect(Rect2(x+c+1.5+jitter,y+1.5,5,e.h-3),col.lightened(.35)*ink_color,false,.6)
    marker(["A","B","C","D"][hash_at(x+c,y,3)%4],Vector2(x+c+2.3+jitter,y+6.4),5,col.darkened(.45))
  "refill":
   # A glow-in-the-dark star sticker. Taking its glow leaves the outline.
   var center=Vector2(x+4,y+4+sin(clock*2+x)*.6)
   var lit_now=e.timer==0
   var pts=[]
   for i in range(10):
    var angle=-PI/2+i*PI/5
    pts.append(center+Vector2(cos(angle),sin(angle))*(4.5 if i%2==0 else 2))
   if lit_now:
    circle(center,6,Color(.75,1,.6,.12))
    polygon(pts,"#c9f59a")
    box(center.x-1,center.y-1,1,1,"#f4ffe0")
   else:
    pts.append(pts[0])
    ink.draw_polyline(PackedVector2Array(pts),Color(.6,.75,.55,.45)*ink_color,.7)
  "stone":
   # A jar with a firefly. Touch it and it lights.
   var lit=e.get("lit",false)
   box(x+1,y+1,6,7,Color(.75,.85,.95,.35))
   box(x+1,y,6,1.5,"#a7a39a")
   ink.draw_rect(Rect2(x+1,y+1,6,7),Color("#c9d6e4")*ink_color,false,.6)
   if lit:
    circle(Vector2(x+4,y+5+sin(clock*3)*.8),4,Color(1,.9,.5,.25))
    circle(Vector2(x+4,y+5+sin(clock*3)*.8),1.4,"#fff0a8")
   else: box(x+3.5,y+5,1,1,"#5a5a48")
  "shard" when origin.x>=WARDROBE_X:
   # A torn piece of the photo: it has to be brought to the rest of it.
   var tc=Vector2(x+4,y+4+sin(clock*2+x)*.8)
   circle(tc,5,Color(1,.95,.8,.12))
   polygon([tc+Vector2(-3,-3),tc+Vector2(3,-2.4),tc+Vector2(2,1),tc+Vector2(3.2,3),tc+Vector2(-2.6,2.6),tc+Vector2(-2,0)],"#f4efe2")
   polygon([tc+Vector2(-2,-2),tc+Vector2(2.2,-1.6),tc+Vector2(1.2,.6),tc+Vector2(-1.4,.4)],"#7fb6e6")
  "shard":
   # One of the boy's crayons, dropped on the way to bed.
   var col=Color({"ASH":"#d0574d","GLASS":"#4f8fd0","IRON":"#e1b84a"}.get(sim.room.def.get("bearing",""),"#a46ad1"))
   var c=Vector2(x+4,y+4+sin(clock*2+x)*.8)
   circle(c,5,Color(col,.12))
   ink.draw_set_transform_matrix(paint_transform*Transform2D(-.6,c))
   box(-4,-1.5,7,3,col)
   box(-4,-1.5,7,1,col.lightened(.3))
   polygon([Vector2(3,-1.5),Vector2(5,0),Vector2(3,1.5)],"#f1d9b5")
   box(-2,-1.5,1.2,3,col.darkened(.35))
   ink.draw_set_transform_matrix(paint_transform)
  "lantern":
   if e.get("held",false): return
   nightlight(Vector2(x,y))
  "plate":
   # The nightlight's dock: a little round stand that clicks when something sits on it.
   var down=e.get("down",false)
   box(x-2,y-1+(1 if down else 0),e.w+4,e.h+1,"#59607a")
   box(x-1,y-1+(1 if down else 0),e.w+2,1,"#f2d58f" if down else "#8e95b0")
  "zip":
   # A berry basket on a string: the boy's pulley.
   var at=origin+Vector2(e.x,e.y)
   line(origin+Vector2(e.ox+e.w/2,e.oy),origin+Vector2(e.tx+e.w/2,e.ty)-Vector2(0,40),"#d9d2c0",.6)
   line(at+Vector2(e.w/2,0),at+Vector2(e.w/2,-200),"#d9d2c0",.6)
   box(at.x,at.y,e.w,e.h,"#3f8a5a")
   for c in range(1,int(e.w),3): box(at.x+c,at.y+1,1,e.h-1,"#2d6744")
   box(at.x,at.y,e.w,1.2,"#66b07e")
  "thru":
   box(x,y,e.w,1.5,"#c9cfe8")
   box(x,y+1.5,e.w,min(e.h-1,2),"#6c7598")
  "spring":
   box(x,y+1,8,2,"#8a6a9a")
   box(x+1,y-1 if e.timer==0 else y,6,2,"#e3c2ea")
  _:
   super.draw_entity_body(e,origin)

func nightlight(at):
 circle(at+Vector2(4,4),8,Color(1,.85,.55,.14))
 box(at.x+1,at.y+5,6,3,"#d8d2c4")
 circle(at+Vector2(4,3.5),3.4,"#fde6a6")
 circle(at+Vector2(5.4,2.6),2.6,"#d8d2c4")
 box(at.x+3,at.y+8,1,1.5,"#9a9486")
 box(at.x+5,at.y+8,1,1.5,"#9a9486")

func dust_bunny(e,origin,room_id):
 var at=origin+Vector2(e.x,e.y)
 var r=float(e.radius)
 var late=room_id=="cl1-bank-b62"
 var body=Color("#1a1828") if late else Color("#7d7686")
 var fluff=Color("#2a2640") if late else Color("#9e95a2")
 for i in range(11):
  var angle=i*TAU/11+clock*.5
  var edge=at+Vector2(cos(angle),sin(angle))*r*.75
  circle(edge,r*.38,fluff)
 circle(at,r*.8,body)
 var look=clamp((actor.x-at.x)/60.0,-1,1)
 var eye=Color("#ffe7a8") if late else Color("#262330")
 circle(at+Vector2(-r*.28+look,-r*.15),max(.8,r*.16),eye)
 circle(at+Vector2(r*.28+look,-r*.15),max(.8,r*.16),eye)

# The white flowers are spilled slime: same patches, same slowing, now visible.
func slime_puddles(view):
 if not runtime.data.has("whiteFlowers"): return
 for patch in runtime.data.whiteFlowers.patches:
  var at=runtime.placements[patch.room]+Vector2(patch.x,patch.y)
  if not view.grow(20).has_point(at): continue
  var w=float(patch.w)
  var bottom=at.y+float(patch.h)
  var pts=[Vector2(at.x-1,bottom)]
  var bumps=max(3,int(w/3))
  for i in range(bumps+1):
   var t=float(i)/bumps
   var rise=2.2+sin(t*PI)*1.6+sin(clock*2.2+i*1.7)*.35
   pts.append(Vector2(at.x-1+t*(w+2),bottom-rise))
  pts.append(Vector2(at.x+w+1,bottom))
  polygon(pts,"#5fcf4a")
  box(at.x,bottom-1,w,1,"#3e9a33")
  box(at.x+w*.2,bottom-3.2,w*.35,.8,Color("#d6ffb8",.8))
  for i in range(int(w/7)+1):
   var bx=at.x+3+i*7+fposmod(i*2.3,3)
   var age=fposmod(clock*.5+i*.37,1.0)
   circle(Vector2(bx,bottom-3-age*3),.6+age*.5,Color("#a8f08f",(1-age)*.8))

func goal_drawing(scene,origin):
 # Each box holds one photo of a good day, hanging on the boy's string from the flaps.
 var goal=scene.room.def.workshopGoal
 var index=story.wardrobe_rooms.find(scene.room.id) if story!=null else 0
 var at=origin+Vector2(goal[0]+goal[2]/2.0,goal[1]-24)
 var taken=story!=null and scene.room.id in story.photos
 line(Vector2(at.x,origin.y),at+Vector2(0,-7),"#d9d2c0",.6)
 if taken: return
 circle(at,10,Color(1,.95,.75,.12))
 photo(at,index,sin(clock*.8)*.06)
 box(origin.x+goal[0],origin.y+goal[1],goal[2],1,Color("#f4efe2",.35))

# A small instant photo: one good day each.
func photo(at,index,angle=0.0,size=1.0):
 ink.draw_set_transform_matrix(paint_transform*Transform2D(angle,Vector2(size,size),0,at))
 box(-7,-7,14,14,"#f4efe2")
 var sky=[Color("#7fb6e6"),Color("#e9c27a"),Color("#a48a78"),Color("#c9d6e6"),Color("#8cc4e8"),Color("#9fc6e8"),Color("#e2b98c"),Color("#8cc4e8"),Color("#7fa9d6"),Color("#f0d48a")][index%10]
 box(-6,-6,12,9,sky)
 var ground=[Color("#e8d08a"),Color("#c98a5a"),Color("#6a4f6e"),Color("#f2f4f8"),Color("#6fae5c"),Color("#6a6e78"),Color("#b98a5a"),Color("#7fbf6a"),Color("#4f7fb0"),Color("#7fbf6a")][index%10]
 box(-6,0,12,3,ground)
 match index%10:
  1: # a birthday cake
   box(-3,-2,6,3,"#f6e2ea")
   box(-.5,-4,1,2,"#f2f2f2")
   box(-.5,-5,1,1,"#ffb347")
  3: # a snowman
   circle(Vector2(2,-1),1.6,"#ffffff")
   circle(Vector2(2,-3.3),1.1,"#ffffff")
  5: # the car, on a trip
   box(-4,-2,7,2,"#c94a42")
   box(-3,-3.5,4,1.5,"#c94a42")
  7: # a giraffe at the zoo
   box(2,-5,1,5,"#e0b04a")
   box(1,-1,3,1.5,"#e0b04a")
  _: pass
 # The three of them, small.
 var people=[[-4.5,"#4f6ea8"],[-2.6,"#b8576a"],[-3.4,"#e8c84a"]]
 for k in range(3):
  var px=-4.5+k*1.9 if index%2==0 else -5+k*2.2
  var tall=2.6 if k<2 else 1.7
  box(px,-tall,1.2,tall,people[k][1])
  circle(Vector2(px+.6,-tall-.7),.7,"#f1c9a5")
 box(-7,4,14,3,"#f4efe2")
 ink.draw_set_transform_matrix(paint_transform)

func story_items(view):
 for item in story.items():
  if not view.has_point(item.at): continue
  if item.kind=="drawing" and not item.taken:
   var at=item.at+Vector2(0,sin(clock*2)*1.2)
   circle(at,9,Color(1,.95,.8,.1))
   ink.draw_set_transform_matrix(paint_transform*Transform2D(.12,at))
   box(-6,-5,12,10,"#f4efe2")
   circle(Vector2(0,-.5),2.6,"#ffe9a0")
   line(Vector2(-1,2),Vector2(-2,4.5),"#3a3a3a",.5)
   line(Vector2(1,2),Vector2(2,4.5),"#3a3a3a",.5)
   for k in range(3): box(-4+k*1.5,0+k*.6,1.5,1,"#c84a46" if k%2==0 else "#f2ede4")
   ink.draw_set_transform_matrix(paint_transform)

# ---------------------------------------------------------------- Felix
const FelixBody=preload("res://scripts/felix_body.gd")
var body=FelixBody.new()

func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 var p=sim.p
 var x=actor.x
 var y=actor.y
 var g=story.gifts if story!=null else {"legs":true,"cape":true,"arms":true,"face":true}
 var center=body.draw(self,g)
 # Riding the boy's basket up and out of a finished room.
 if riding:
  line(Vector2(x+4,y+9),Vector2(x+4,y-400),"#d9d2c0",.6)
  box(x-2,y+9,12,5,"#3f8a5a")
  for c in range(0,12,3): box(x-2+c,y+10,1,4,"#2d6744")
  box(x-2,y+9,12,1,"#66b07e")
  if story!=null and story.ride!=null: photo(Vector2(x+8,y+7),story.ride.photo,.25,.55)
 if p.carrying!=null:
  for side in [-1,1]: line(center+Vector2(side*3,-1),Vector2(x+4+side*2.5,y-3),"#fff7e2",.6)
  nightlight(Vector2(x,y-11))

# The basket ride leaves the room's frame, so the camera follows Felix up and along the shelf.
func target_camera():
 if riding: return Vector2(actor.x-153,actor.y-100)
 return super.target_camera()
