extends "res://scripts/landscape.gd"
## The New House at night: the Outskirts' rooms, collision and devices are unchanged.
## Only what they are is redrawn: a firefly-sized light climbing a child's bedroom.


# Authored sprites use one texture pixel per world pixel.
const PIXELS={
 "props/basket-weave":preload("res://art/props/basket-weave.png"),
 "props/basket":preload("res://art/props/basket.png"),
 "props/block-a":preload("res://art/props/block-a.png"),
 "props/block-b":preload("res://art/props/block-b.png"),
 "props/block-c":preload("res://art/props/block-c.png"),
 "props/block-d":preload("res://art/props/block-d.png"),
 "props/checkpoint":preload("res://art/props/checkpoint.png"),
 "props/crayon":preload("res://art/props/crayon.png"),
 "props/dark-0":preload("res://art/props/dark-0.png"),
 "props/dark-1":preload("res://art/props/dark-1.png"),
 "props/dark-2":preload("res://art/props/dark-2.png"),
 "props/dark-wall":preload("res://art/props/dark-wall.png"),
 "props/dock":preload("res://art/props/dock.png"),
 "props/drawing":preload("res://art/props/drawing.png"),
 "props/dust-bunny":preload("res://art/props/dust-bunny.png"),
 "props/firefly":preload("res://art/props/firefly.png"),
 "props/gate":preload("res://art/props/gate.png"),
 "props/glass-platform":preload("res://art/props/glass-platform.png"),
 "props/jar":preload("res://art/props/jar.png"),
 "props/lego-blue":preload("res://art/props/lego-blue.png"),
 "props/lego-green":preload("res://art/props/lego-green.png"),
 "props/lego-red":preload("res://art/props/lego-red.png"),
 "props/lego-white":preload("res://art/props/lego-white.png"),
 "props/lego-yellow":preload("res://art/props/lego-yellow.png"),
 "props/nightlight":preload("res://art/props/nightlight.png"),
 "props/photo-0":preload("res://art/props/photo-0.png"),
 "props/photo-1":preload("res://art/props/photo-1.png"),
 "props/photo-2":preload("res://art/props/photo-2.png"),
 "props/photo-3":preload("res://art/props/photo-3.png"),
 "props/photo-4":preload("res://art/props/photo-4.png"),
 "props/photo-5":preload("res://art/props/photo-5.png"),
 "props/photo-6":preload("res://art/props/photo-6.png"),
 "props/photo-7":preload("res://art/props/photo-7.png"),
 "props/photo-8":preload("res://art/props/photo-8.png"),
 "props/photo-9":preload("res://art/props/photo-9.png"),
 "props/pin-blue":preload("res://art/props/pin-blue.png"),
 "props/pin-green":preload("res://art/props/pin-green.png"),
 "props/pin-red":preload("res://art/props/pin-red.png"),
 "props/pin-white":preload("res://art/props/pin-white.png"),
 "props/pin-yellow":preload("res://art/props/pin-yellow.png"),
 "props/slime":preload("res://art/props/slime.png"),
 "props/spring":preload("res://art/props/spring.png"),
 "props/star":preload("res://art/props/star.png"),
 "props/star-spent":preload("res://art/props/star-spent.png"),
 "props/torn-photo":preload("res://art/props/torn-photo.png"),
 "room/baseboard":preload("res://art/room/baseboard.png"),

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

func pixel_tile(name,rect,tint=Color.WHITE,world_aligned=true):
 # Background repeats stay in the world; moving devices keep their own weave.
 var texture=PIXELS[name]
 var step=texture.get_size()
 var offset=Vector2.ZERO if world_aligned else rect.position
 var local=Rect2(rect.position-offset,rect.size)
 for y in range(floori(local.position.y/step.y),ceili(local.end.y/step.y)):
  for x in range(floori(local.position.x/step.x),ceili(local.end.x/step.x)):
   var tile=Rect2(Vector2(x,y)*step+offset,step)
   var part=tile.intersection(rect)
   if part.has_area(): ink.draw_texture_rect_region(texture,part,Rect2(part.position-tile.position,part.size),tint*ink_color)

func basket(at,dimensions):
 pixel_tile("props/basket-weave",Rect2(at+Vector2(0,1),dimensions-Vector2(0,1)),Color.WHITE,false)
 ink.draw_texture_rect_region(PIXELS["props/basket"],Rect2(at,Vector2(dimensions.x,1)),Rect2(0,0,12,1),ink_color)

func pixel_strip(rect,vertical=false):
 ink.draw_texture_rect_region(PIXELS["room/frame"],rect,Rect2(0,7,7,2) if vertical else Rect2(7,0,2,7),ink_color)

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
 if view.end.y<120 or view.position.x>1640: return
 pixel_tile("room/baseboard",Rect2(max(view.position.x,0),130,min(view.size.x,1640),14))

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
 pixel_strip(Rect2(w.position.x+w.size.x/2-3,w.position.y,6,w.size.y),true)
 pixel_strip(Rect2(w.position.x,w.position.y+w.size.y/2-3,w.size.x,6))
 pixel_strip(Rect2(w.position.x-14,SILL_Y,w.size.x+28,9))
 for side in [-1,1]:
  var x=w.position.x-24 if side<0 else w.end.x+4
  for fold in range(2):
   var sway=sin(clock*.6+fold)*1.2
   ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D(Vector2(1,0),Vector2(sway/(w.size.y+44),1),Vector2(x+fold*10,w.position.y-14)))
   pixel_tile("room/curtain",Rect2(0,0,10,w.size.y+44))
 ink.draw_set_transform(-camera)
 pixel_strip(Rect2(w.position.x-30,w.position.y-20,w.size.x+60,5))

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
 pixel_strip(Rect2(3840,-706,620,6))

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
 var tint=Color("#ffe39a") if current else Color("#d9c17a")
 var r=6.0+(sin(clock*2)*.6 if current else 0.0)
 pixel("props/checkpoint",point-Vector2(r,r),Vector2(r*2+1,r*2+1),tint)
 if current: circle(point,2,Color(tint,.3))

func story_dark(view):
 var amount=story.dark_amount()
 if amount<=0: return
 var base=view.end.y+10
 for i in range(14):
  var x=view.position.x+i*30+sin(clock*.5+i)*6
  var reach=(60+hash_at(i,3,9)%70)*amount
  pixel("props/dark-"+str(i%3),Vector2(x-14,base-reach-6),Vector2(28,reach+6),Color(1,1,1,.55*amount))
  if amount>.5 and hash_at(i,7,1)%4==0 and fmod(clock+i,5.0)>.25:
   var eye=Vector2(x,base-reach*.6)
   box(eye.x-3,eye.y,2,1,Color(.9,.85,1,.7*amount))
   box(eye.x+1,eye.y,2,1,Color(.9,.85,1,.7*amount))

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
 var colors=["red","yellow","blue","white"]
 if t==3:
  var lift=float(h%2)
  pixel("props/lego-"+colors[h%4],point+Vector2(0,lift),Vector2(8,8-lift))
 elif t==4:
  for side in [1,5]: pixel("props/pin-"+("red" if h%2 else "blue"),point+Vector2(side-1,0))
 else:
  var dir=-1 if t==5 else 1
  var wall=point.x+(8 if t==5 else 0)
  for side in [1,5]:
   var tint=["red","yellow","blue","green"][(h+side)%4]
   ink.draw_set_transform_matrix(paint_transform*Transform2D(Vector2(0,1),Vector2(dir,0),Vector2(wall,point.y+side-1)))
   pixel("props/pin-"+tint,Vector2.ZERO)
  ink.draw_set_transform_matrix(paint_transform)

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
   if e.get("open",false):
    if e.t>=18: return
    y-=e.h*(1-pow(1-float(e.t)/18,2))
   pixel_tile("props/gate",Rect2(x,y,e.w,e.h),Color.WHITE,false)
   if e.w>=16 and e.h>=10: marker("KEEP OUT",Vector2(x+2,y+e.h/2+2),5,Color("#5a2a22"))
  "held":
   var a=1.0 if e.solid else .14
   pixel("props/dark-wall",Vector2(x,y),Vector2(e.w,e.h),Color(1,1,1,.92*a))
   for k in range(int(e.h/6)):
    var wob=sin(clock*2+k*.9)*2
    pixel("props/dark-wall",Vector2(x-e.w*.1+wob,y+k*6),Vector2(e.w*1.2,8),Color(1,1,1,.6*a))
   if e.solid and fmod(clock+x*.01,4.5)>.2:
    var eye=Vector2(x+e.w/2,y+e.h*.35+sin(clock*.7)*8)
    box(eye.x-3,eye.y,2,1,Color(.85,.8,1,.9))
    box(eye.x+1,eye.y,2,1,Color(.85,.8,1,.9))
  "crumble":
   var jitter=sin(clock*70)*.6 if e.get("shaking",0)>0 else 0.0
   for c in range(0,int(e.w),8):
    pixel("props/block-"+["a","b","c","d"][hash_at(x+c,y,3)%4],Vector2(x+c+jitter,y),Vector2(8,e.h))
  "refill":
   var center=Vector2(x+4,y+4+sin(clock*2+x)*.6)
   var lit_now=e.timer==0
   if lit_now: circle(center,6,Color(.75,1,.6,.12))
   pixel("props/star" if lit_now else "props/star-spent",center-Vector2(4,4))
  "stone":
   var lit=e.get("lit",false)
   pixel("props/jar",Vector2(x,y))
   if lit:
    var at=Vector2(x+4,y+5+sin(clock*3)*.8)
    circle(at,4,Color(1,.9,.5,.25))
    pixel("props/firefly",at-Vector2.ONE)
   else: box(x+3.5,y+5,1,1,"#5a5a48")
  "shard" when origin.x>=WARDROBE_X:
   var tc=Vector2(x+4,y+4+sin(clock*2+x)*.8)
   circle(tc,5,Color(1,.95,.8,.12))
   pixel("props/torn-photo",tc-Vector2(3,3))
  "shard":
   var col=Color({"ASH":"#d0574d","GLASS":"#4f8fd0","IRON":"#e1b84a"}.get(sim.room.def.get("bearing",""),"#a46ad1"))
   var c=Vector2(x+4,y+4+sin(clock*2+x)*.8)
   circle(c,5,Color(col,.12))
   ink.draw_set_transform_matrix(paint_transform*Transform2D(-.6,c))
   pixel("props/crayon",Vector2(-4,-2),Vector2.ZERO,col.lightened(.3))
   ink.draw_set_transform_matrix(paint_transform)
  "lantern":
   if e.get("held",false): return
   nightlight(Vector2(x,y))
  "plate":
   var down=e.get("down",false)
   pixel("props/dock",Vector2(x-2,y-1+(1 if down else 0)),Vector2(e.w+4,e.h+1),Color("#f2d58f") if down else Color.WHITE)
  "zip":
   var at=origin+Vector2(e.x,e.y)
   line(origin+Vector2(e.ox+e.w/2,e.oy),origin+Vector2(e.tx+e.w/2,e.ty)-Vector2(0,40),"#d9d2c0",.6)
   line(at+Vector2(e.w/2,0),at+Vector2(e.w/2,-200),"#d9d2c0",.6)
   basket(at,Vector2(e.w,e.h))
  "thru":
   pixel_tile("props/glass-platform",Rect2(x,y,e.w,min(e.h+1,4)))
  "spring":
   pixel("props/spring",Vector2(x,y-1 if e.timer==0 else y),Vector2(8,4 if e.timer==0 else 3))
  _:
   super.draw_entity_body(e,origin)

func nightlight(at):
 circle(at+Vector2(4,4),8,Color(1,.85,.55,.14))
 pixel("props/nightlight",at)

func dust_bunny(e,origin,room_id):
 var at=origin+Vector2(e.x,e.y)
 var r=float(e.radius)
 var late=room_id=="cl1-bank-b62"
 pixel("props/dust-bunny",at-Vector2(r,r),Vector2(r*2,r*2),Color("#59506d") if late else Color.WHITE)
 var look=clamp((actor.x-at.x)/60.0,-1,1)
 if late:
  var eye=Color("#ffe7a8")
  box(at.x-r*.28+look,at.y-r*.15,1,1,eye)
  box(at.x+r*.28+look,at.y-r*.15,1,1,eye)

func slime_puddles(view):
 if not runtime.data.has("whiteFlowers"): return
 for patch in runtime.data.whiteFlowers.patches:
  var at=runtime.placements[patch.room]+Vector2(patch.x,patch.y)
  if not view.grow(20).has_point(at): continue
  var w=float(patch.w)
  var bottom=at.y+float(patch.h)
  var rise=4+sin(clock*2.2)*.35
  pixel("props/slime",Vector2(at.x-1,bottom-rise),Vector2(w+2,rise))
  for i in range(int(w/7)+1):
   var bx=at.x+3+i*7+fposmod(i*2.3,3)
   var age=fposmod(clock*.5+i*.37,1.0)
   pixel("props/firefly",Vector2(bx,bottom-3-age*3),Vector2(1+age,1+age),Color(.7,1,.6,(1-age)*.8))

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
 pixel("props/photo-"+str(posmod(index,10)),Vector2(-7,-7))
 ink.draw_set_transform_matrix(paint_transform)

func story_items(view):
 for item in story.items():
  if not view.has_point(item.at): continue
  if item.kind=="drawing" and not item.taken:
   var at=item.at+Vector2(0,sin(clock*2)*1.2)
   circle(at,9,Color(1,.95,.8,.1))
   ink.draw_set_transform_matrix(paint_transform*Transform2D(.12,at))
   pixel("props/drawing",Vector2(-6,-5))
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
  pixel("props/basket",Vector2(x-2,y+9))
  if story!=null and story.ride!=null: photo(Vector2(x+8,y+7),story.ride.photo,.25,.55)
 if p.carrying!=null:
  for side in [-1,1]: body.limb(self,center+Vector2(side*3,-1),Vector2(x+4+side*2.5,y-3),1.3)
  nightlight(Vector2(x,y-11))

# The basket ride leaves the room's frame, so the camera follows Felix up and along the shelf.
func target_camera():
 if riding: return Vector2(actor.x-153,actor.y-100)
 return super.target_camera()
