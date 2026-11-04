extends "res://scripts/landscape.gd"
## The New House at night: the Outskirts' rooms, collision and devices are unchanged.
## Only what they are is redrawn: a firefly-sized light climbing a child's bedroom.


# Authored sprites use one texture pixel per world pixel.
const PIXELS={
 "boy/arm":preload("res://art/boy/arm.png"),
 "boy/head-asleep":preload("res://art/boy/head-asleep.png"),
 "boy/head-crying":preload("res://art/boy/head-crying.png"),
 "boy/head-look":preload("res://art/boy/head-look.png"),
 "boy/hidden":preload("res://art/boy/hidden.png"),
 "boy/kneeling":preload("res://art/boy/kneeling.png"),
 "boy/leg":preload("res://art/boy/leg.png"),
 "boy/quilt":preload("res://art/boy/quilt.png"),
 "boy/sitting":preload("res://art/boy/sitting.png"),
 "boy/torso":preload("res://art/boy/torso.png"),
 "room/bed":preload("res://art/room/bed.png"),
 "room/box":preload("res://art/room/box.png"),
 "room/corrugated":preload("res://art/room/corrugated.png"),
 "room/curtain":preload("res://art/room/curtain.png"),
 "room/desk":preload("res://art/room/desk.png"),
 "room/door":preload("res://art/room/door.png"),
 "room/dresser":preload("res://art/room/dresser.png"),
 "room/frame":preload("res://art/room/frame.png"),
 "room/headboard":preload("res://art/room/headboard.png"),
 "room/moon":preload("res://art/room/moon.png"),
 "room/pillow":preload("res://art/room/pillow.png"),
 "room/shelf":preload("res://art/room/shelf.png"),
 "room/wallpaper":preload("res://art/room/wallpaper.png"),
 "room/wardrobe":preload("res://art/room/wardrobe.png"),
}

func pixel(name,at,size=Vector2.ZERO,tint=Color.WHITE):
 var texture=PIXELS[name]
 if size==Vector2.ZERO: ink.draw_texture(texture,at.round(),tint*ink_color)
 else: ink.draw_texture_rect(texture,Rect2(at.round(),size),false,tint*ink_color)

func pixel_tile(name,rect,tint=Color.WHITE):
 ink.draw_texture_rect(PIXELS[name],rect,true,tint*ink_color)

func pixel_frame(rect):
 # Nine-sliced moulding, with an open center for the live night sky.
 var texture=PIXELS["room/frame"]
 var edges=[0.0,7.0,rect.size.x-7,rect.size.x]
 var rows=[0.0,7.0,rect.size.y-7,rect.size.y]
 var uv=[0.0,7.0,9.0,16.0]
 for y in range(3):
  for x in range(3):
   if x==1 and y==1: continue
   ink.draw_texture_rect_region(texture,Rect2(rect.position+Vector2(edges[x],rows[y]),Vector2(edges[x+1]-edges[x],rows[y+1]-rows[y])),Rect2(uv[x],uv[y],uv[x+1]-uv[x],uv[y+1]-uv[y]),ink_color)

func boy_limb(name,a,b,width):
 ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D((b-a).angle()-PI/2,a.round()))
 pixel(name,Vector2(-width/2,0),Vector2(width,a.distance_to(b)))
 ink.draw_set_transform(-camera)

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
 var atlas=TileSetAtlasSource.new()
 atlas.texture=preload("res://art/tiles/bedroom.png")
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
 # Stable world-aligned repeats avoid swimming when the camera moves.
 for y in range(floori(view.position.y/88),ceili(view.end.y/88)):
  for x in range(floori(view.position.x/88),ceili(view.end.x/88)):
   pixel("room/wallpaper",Vector2(x*88,y*88))

func baseboard(view):
 # The floor runs under the first five rooms; skirting boards trace it.
 if view.end.y<120 or view.position.x>1640: return
 box(max(view.position.x,0),130,min(view.size.x,1640),14,"#2f3149")
 box(max(view.position.x,0),130,min(view.size.x,1640),1.5,"#535475")

func door():
 pixel("room/door",DOOR.position-Vector2(5,5))
 # Hallway light remains a live lighting effect.
 polygon([Vector2(DOOR.position.x+2,DOOR.end.y),Vector2(DOOR.end.x-2,DOOR.end.y),Vector2(DOOR.end.x+16,DOOR.end.y+1),Vector2(DOOR.position.x-16,DOOR.end.y+1)],Color(1,.8,.5,.35))

func moving_boxes(view):
 var boxes=[[Rect2(236,72,58,72),"BOOKS"],[Rect2(298,96,44,48),"MOM"],[Rect2(246,34,40,38),"ISAAC"],[Rect2(560,88,70,56),"TOYS"],[Rect2(860,100,52,44),"DAD - TAKE"],[Rect2(870,62,36,38),""]]
 for item in boxes:
  var b=item[0]
  if not view.intersects(b): continue
  pixel("room/box",b.position,b.size,Color("#b9a8ae"))
  if item[1]!="": marker(item[1],b.position+Vector2(5,b.size.y*.62),6,Color("#1f1a18"))

func marker(text_value,at,size,color):
 ink.draw_string(ThemeDB.fallback_font,at,text_value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color*ink_color)

func bed():
 pixel("room/bed",BED.position)
 pixel("room/headboard",HEADBOARD.position-Vector2(0,13))
 ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D(-.06,PILLOW))
 pixel("room/pillow",Vector2(-34,-10))
 ink.draw_set_transform(-camera)

func shelf():
 pixel("room/shelf",SHELF.position)

func desk():
 pixel("room/desk",DESK.position-Vector2(0,54))

func dresser():
 pixel("room/dresser",DRESSER.position-Vector2(0,62))

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
 pixel("room/moon",moon-Vector2(16,16))
 pixel_frame(Rect2(w.position-Vector2(4,4),w.size+Vector2(8,8)))
 pixel_tile("room/frame",Rect2(w.position.x+w.size.x/2-3,w.position.y,6,w.size.y))
 pixel_tile("room/frame",Rect2(w.position.x,w.position.y+w.size.y/2-3,w.size.x,6))
 pixel_tile("room/frame",Rect2(w.position.x-14,SILL_Y,w.size.x+28,9))
 for side in [-1,1]:
  var x=w.position.x-24 if side<0 else w.end.x+4
  for fold in range(2):
   var sway=sin(clock*.6+fold)*1.2
   ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D(Vector2(1,0),Vector2(sway/(w.size.y+44),1),Vector2(x+fold*10,w.position.y-14)))
   pixel_tile("room/curtain",Rect2(0,0,10,w.size.y+44))
 ink.draw_set_transform(-camera)
 pixel_tile("room/frame",Rect2(w.position.x-30,w.position.y-20,w.size.x+60,5))

func photo_wall():
 # The good days Felix brought up, propped along the windowsill against the glass.
 if story==null: return
 for i in range(story.photos.size()):
  var at=Vector2(WINDOW.position.x+14+i*23,SILL_Y-9-(i%2)*2)
  photo(at,story.wardrobe_rooms.find(story.photos[i]),sin(i*1.7)*.14)

func curtains():
 for side in [3862.0,4352.0]:
  for fold in range(6):
   var sway=sin(clock*.6+fold)*1.5
   ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D(Vector2(1,0),Vector2(sway/360,1),Vector2(side+fold*16,-700)))
   pixel_tile("room/curtain",Rect2(0,0,16,360),Color.WHITE if fold%2==0 else Color("#c4afcb"))
 ink.draw_set_transform(-camera)
 pixel_tile("room/frame",Rect2(3840,-706,620,6))

func wardrobe(view):
 var left=max(view.position.x,WARDROBE_X)
 var right=min(view.end.x,WINDOW.position.x-40)
 var top=max(view.position.y,-712)
 pixel_tile("room/wardrobe",Rect2(left,top,right-left,view.end.y-top))
 if view.end.y>-664:
  top=max(view.position.y,-664)
  pixel_tile("room/corrugated",Rect2(left,top,right-left,view.end.y-top))
 for gx in range(floori(view.position.x/90),ceili(view.end.x/90)+1):
  var h=30+hash_at(gx,5,9)%14
  var b=Rect2(gx*90+hash_at(gx,4,9)%30,-672-h,50+hash_at(gx,6,9)%20,h)
  if b.position.x<left or b.end.x>right: continue
  pixel("room/box",b.position,b.size,Color("#b9a8ae"))
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
 pixel("boy/head-"+(mood_name if mood_name in ["crying","asleep"] else "look"),c+Vector2(-19,-26))

func pajamas(rect):
 pixel("boy/torso",rect.position,rect.size)

func boy_sitting(at,crying):
 var rock=sin(clock*2.4)*1.2 if crying else 0.0
 pixel("boy/sitting",at+Vector2(-18,-47))
 boy_head(at+Vector2(4+rock,-60),1 if not crying else 0,"crying" if crying else "look")

func boy_standing(at,facing,pose):
 var run=pose=="run"
 var t=clock*9
 for side in [-1,1]:
  var swing=sin(t+(0.0 if side<0 else PI))*(10 if run else 0)
  boy_limb("boy/leg",at+Vector2(side*5,-46),at+Vector2(side*5+swing,0),9)
 pixel("boy/torso",at+Vector2(-15,-87))
 var arm_a=at+Vector2(-12,-80)
 var arm_b=at+Vector2(12,-80)
 if pose=="wave": boy_limb("boy/arm",arm_b,arm_b+Vector2(10,-26+sin(clock*8)*4),7)
 elif pose=="point": boy_limb("boy/arm",arm_b,arm_b+Vector2(facing*24,-22),7)
 else: boy_limb("boy/arm",arm_b,arm_b+Vector2(4+sin(t)*(8 if run else 1),26),7)
 boy_limb("boy/arm",arm_a,arm_a+Vector2(-4-sin(t)*(8 if run else 1),26),7)
 boy_head(at+Vector2(0,-102),facing,"look")

func boy_kneeling(at,facing,prop):
 pixel("boy/kneeling",at+Vector2(-24,-64))
 var hand=at+Vector2(facing*20,-40)
 boy_limb("boy/arm",at+Vector2(facing*10,-56),hand,7)
 if prop=="sock":
  for k in range(5):
   ink.draw_texture_rect(body.CAPE_RED if k%2==0 else body.CAPE_CREAM,Rect2(hand+Vector2(facing*k*3,-2+k*1.2),Vector2(3,5)),false,ink_color)
 boy_head(at+Vector2(0,-78),facing,"look")

func boy_in_bed(at):
 if story.boy.get("hidden",false):
  var shiver=sin(clock*14)*.6 if fmod(clock,3.0)<.6 else 0.0
  pixel("boy/hidden",at+Vector2(-123+shiver,-21))
  return
 boy_head(at,-1,"asleep" if story.boy.asleep else "look")
 pixel("boy/quilt",at+Vector2(-124,6))
 if story.boy.asleep and fmod(clock,4.0)<2.6:
  var z=fmod(clock,4.0)
  marker("z",at+Vector2(-14-z*4,-18-z*8),7,Color(.8,.85,1,.6*(1-z/2.6)))

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
