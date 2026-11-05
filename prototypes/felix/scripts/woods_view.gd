extends "res://scripts/landscape.gd"
## Chapter Two pixel art over Codex's approved Black Woods tiles and devices.
## On top: Felix (the light, then Sir Felix), the boy walking with him, the afternoon going to
## dusk, Dad's cabin, the storm, and the flashlight story.


const SPRITES={
 "acorn":preload("res://art/woods/acorn.png"),
 "beam":preload("res://art/woods/beam.png"),
 "boy-arm":preload("res://art/woods/boy-arm.png"),
 "boy-asleep":preload("res://art/woods/boy-asleep.png"),
 "boy-head-asleep":preload("res://art/woods/boy-head-asleep.png"),
 "boy-head-look":preload("res://art/woods/boy-head-look.png"),
 "boy-kneel":preload("res://art/woods/boy-kneel.png"),
 "boy-leg":preload("res://art/woods/boy-leg.png"),
 "boy-pack":preload("res://art/woods/boy-pack.png"),
 "boy-shirt":preload("res://art/woods/boy-shirt.png"),
 "boy-shadow":preload("res://art/woods/boy-shadow.png"),
 "terrain":preload("res://art/woods/terrain.png"),
 "twig-rail":preload("res://art/woods/twig-rail.png"),
 "bark-block":preload("res://art/woods/bark-block.png"),
 "thorn-3":preload("res://art/woods/thorn-3.png"),
 "thorn-4":preload("res://art/woods/thorn-4.png"),
 "thorn-5":preload("res://art/woods/thorn-5.png"),
 "thorn-6":preload("res://art/woods/thorn-6.png"),
 "cabin-off":preload("res://art/woods/cabin-off.png"),
 "cabin-on":preload("res://art/woods/cabin-on.png"),
 "cloud":preload("res://art/woods/cloud.png"),
 "dad-cold":preload("res://art/woods/dad-cold.png"),
 "dad-warm":preload("res://art/woods/dad-warm.png"),
 "drawing":preload("res://art/woods/drawing.png"),
 "fern":preload("res://art/woods/fern.png"),
 "flashlight":preload("res://art/woods/flashlight.png"),
 "grass":preload("res://art/woods/grass.png"),
 "helmet-down":preload("res://art/woods/helmet-down.png"),
 "helmet":preload("res://art/woods/helmet.png"),
 "lantern":preload("res://art/woods/lantern.png"),
 "leaf":preload("res://art/woods/leaf.png"),
 "lightning":preload("res://art/woods/lightning.png"),
 "mote":preload("res://art/woods/mote.png"),
 "mushroom":preload("res://art/woods/mushroom.png"),
 "pool":preload("res://art/woods/pool.png"),
 "rain-0":preload("res://art/woods/rain-0.png"),
 "rain-1":preload("res://art/woods/rain-1.png"),
 "shafts":preload("res://art/woods/shafts.png"),
 "sky-afternoon":preload("res://art/woods/sky-afternoon.png"),
 "sky-dusk":preload("res://art/woods/sky-dusk.png"),
 "sky-night":preload("res://art/woods/sky-night.png"),
 "splash":preload("res://art/woods/splash.png"),
 "sun":preload("res://art/woods/sun.png"),
 "sword-down":preload("res://art/woods/sword-down.png"),
 "sword":preload("res://art/woods/sword.png"),
 "tree-0":preload("res://art/woods/tree-0.png"),
 "tree-1":preload("res://art/woods/tree-1.png"),
 "tree-2":preload("res://art/woods/tree-2.png"),
}

# Chapter Two sprite helpers, independent of Chapter One's view and assets.
func sprite(name,at,size=Vector2.ZERO,tint=Color.WHITE):
 var texture=SPRITES[name]
 if size==Vector2.ZERO: ink.draw_texture(texture,at.round(),tint*ink_color)
 else: ink.draw_texture_rect(texture,Rect2(at.round(),size),false,tint*ink_color)

func sprite_limb(name,a,b,width):
 ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D((b-a).angle()-PI/2,a.round()))
 sprite(name,Vector2(-width/2,0),Vector2(width,a.distance_to(b)))
 ink.draw_set_transform(-camera)

func power_visible():
 return story.power and not story.in_tale and story.phase not in ["ending","end"]

# The story already stands him on clear ground (woods_story.stand_spot), so draw him there.
func boy_background_target():
 return story.boy.position

func render_boy_point():
 return boy_draw_point if boy_draw_point.x!=INF else story.boy.position

# Reuse the base view's tile coordinates: moss, earth, roots, bark and a twig
# occupy the same twenty slots. No physics layers are added to the TileSet.
func make_tiles():
 var atlas=TileSetAtlasSource.new()
 atlas.texture=SPRITES["terrain"]
 atlas.texture_region_size=Vector2i(8,8)
 for x in range(20): atlas.create_tile(Vector2i(x,0))
 var result=TileSet.new()
 result.tile_size=Vector2i(8,8)
 result.add_source(atlas,0)
 return result

func draw_boundary_tiles():
 super.draw_boundary_tiles()
 # Mix higher hash bits for soil variations; the base hash's lowest two bits
 # repeat in a checkerboard. Cell positions, surface lists and solidity stay put.
 for cell in tiles.get_used_cells():
  var variant=tiles.get_cell_atlas_coords(cell).x
  if variant in [4,5,6,7,16,17,18,19]:
   var base=4 if variant<16 else 16
   tiles.set_cell(cell,0,Vector2i(base+((hash_at(cell.x,cell.y,19)>>7)%4),0))

func draw_hazard(t,point):
 sprite("thorn-"+str(t),point)

const FelixBody=preload("res://scripts/felix_body.gd")
const Story=preload("res://scripts/woods_story.gd")
var body=FelixBody.new()
var story=null
var riding=false
var gift_pulse=0.0
var felix_glow=1.0
var felix_light: PointLight2D
var beam_light: PointLight2D
var cabin_light: PointLight2D
var goal_light: PointLight2D
var glow: Texture2D
var drops=[]
var boy_draw_point=Vector2(INF,INF)
var backdrop: Node2D       # the boy, Dad and the cabin: in front of the forest, behind the tiles
# Dad's cabin stands on the overlook's floor, where Felix comes down to it, in world pixels.
var CABIN=Rect2()
var FLOOR_Y=0.0

func _ready():
 var hall=runtime.placements.get(Story.CABIN,Vector2.ZERO)
 FLOOR_Y=hall.y+22*8
 CABIN=Rect2(hall.x+14*8,FLOOR_Y-320,300,320)
 super._ready()
 glow=radial()
 felix_light=point_light(Color(1,.97,.88),1.0,.9)
 beam_light=point_light(Color(.85,.92,1),1.6,1.4)
 cabin_light=point_light(Color(1,.8,.5),1.3,3.0)
 goal_light=point_light(Color(.7,.85,1),1.15,1.0)
 for i in range(140): drops.append(Vector2(hash_at(i,7)%340,hash_at(i,9)%200))
 backdrop=Node2D.new()
 add_child(backdrop)
 move_child(backdrop,tiles.get_index())
 backdrop.draw.connect(draw_backdrop)

func radial():
 var image=Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var d=Vector2(x-64,y-64).length()/64.0
   image.set_pixel(x,y,Color(1,1,1,pow(max(0,1-d),1.8)))
 return ImageTexture.create_from_image(image)

func point_light(color,energy,scale_value):
 var light=PointLight2D.new()
 light.texture=glow
 light.color=color
 light.energy=energy
 light.texture_scale=scale_value
 add_child(light)
 return light

func _process(delta):
 super._process(delta)
 if sim==null or story==null: return
 var boy_target=boy_background_target()
 if boy_draw_point.x==INF or not story.boy.follow: boy_draw_point=boy_target
 else: boy_draw_point=boy_draw_point.lerp(boy_target,1-exp(-delta*9))
 gift_pulse=max(0,gift_pulse-delta)
 ambient.color=story.ambient()
 felix_glow=lerp(felix_glow,story.felix_radius(),1-exp(-delta*3))
 felix_light.position=actor+Vector2(4,5)-camera
 felix_light.texture_scale=felix_glow*(1+gift_pulse*.6)
 felix_light.energy=1.0+gift_pulse*1.5
 felix_light.visible=sim.p.state!="dead"
 # In Dad's story the flashlight follows the knight; at the goal it is a bright pool.
 beam_light.visible=story.in_tale or story.ride!=null
 beam_light.position=actor+Vector2(4,-10)-camera
 var lit_cabin=power_visible() and story.room==Story.CABIN
 cabin_light.visible=story.room==Story.CABIN
 cabin_light.position=Vector2(CABIN.position.x+205,CABIN.position.y+230)-camera
 cabin_light.energy=1.3 if lit_cabin else (.5 if story.dad.flashlight else 0.0)
 cabin_light.color=Color(1,.8,.5) if lit_cabin else Color(.8,.88,1)
 goal_light.visible=story.in_tale and sim.room.def.has("workshopGoal") and not riding
 if goal_light.visible:
  var goal=sim.room.def.workshopGoal
  goal_light.position=active_position+Vector2(goal[0]+goal[2]/2.0,goal[1]-8)-camera
 for node in forest_layers:
  node.modulate=Color("#dfd1ad").lerp(Color("#768ea6"),clamp(story.dusk*1.5-.4,0,1))
 backdrop.queue_redraw()

# ---------------------------------------------------------------- behind the play plane
func _draw():
 if story==null or sim==null: return
 ink=self
 var late=story.dusk
 var sunset=clamp(late*2,0,1)
 var night=clamp(late*1.6-.6,0,1)
 sprite("sky-afternoon",Vector2.ZERO)
 sprite("sky-dusk",Vector2.ZERO,Vector2.ZERO,Color(1,1,1,sunset))
 sprite("sky-night",Vector2.ZERO,Vector2.ZERO,Color(1,1,1,night))
 var sun=Vector2(fposmod(255-camera.x*.018,380)-20,28-camera.y*.012)
 sprite("sun",sun-Vector2(10,10),Vector2.ZERO,Color(1,1,1,1-night))
 if night>0:
  ink.draw_texture(preload("res://art/room/moon.png"),sun-Vector2(16,16),Color(.75,.85,1,night*.8))
 for i in range(3):
  var x=fposmod(i*119+clock*(1+i*.3)-camera.x*.025,420)-96
  sprite("cloud",Vector2(x,18+i*26),Vector2.ZERO,Color(.65,.76,.9,(.08+night*.18)*max(story.raining,.3)))
 sprite("shafts",Vector2.ZERO,Vector2.ZERO,Color(1,1,1,(1-night)*.6))
 for i in range(18):
  var at=Vector2(fposmod(i*47.3+sin(clock*.3+i)*3-camera.x*.12,340)-10,40+fposmod(i*31.7-camera.y*.04,130))
  sprite("mote",at,Vector2(1,1),Color(.8,.9,.65,(.12+sin(clock+i)*.08)*(1-night*.4)))
 if story.thunder>0:
  sprite("lightning",Vector2(235,0),Vector2.ZERO,Color(1,1,1,story.thunder*.8))
  box(0,0,320,184,Color(.75,.85,1,.16*story.thunder))

func draw_backdrop():
 if story==null or sim==null: return
 ink=backdrop
 backdrop.draw_set_transform(-camera)
 var view=Rect2(camera-Vector2(30,30),Vector2(380,244))
 if story.in_tale or story.room in story.tale_rooms: tale_backdrop(view)
 forest_dressing(view)
 if view.intersects(CABIN.grow(80)): cabin()
 draw_boy()
 if story.dad.visible and view.intersects(CABIN.grow(120)): draw_dad()
 ink=self

# Dad's cabin, seen from a firefly's height: the bottom log, the step and the lit door.
func cabin():
 sprite("cabin-on" if power_visible() else "cabin-off",CABIN.position)
 marker("Felix's Weekend Castle",CABIN.position+Vector2(117,204),9,Color("#413c3d") if power_visible() else Color("#c7d4db"))

func marker(text_value,at,size,color):
 ink.draw_string(ThemeDB.fallback_font,at,text_value,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color*ink_color)

# Dad: a big shape sitting on the porch step, backlit by the door, so we never see his face.
# Side view, facing out toward Felix. Later, the boy sleeps across his knees.
func dad_point(): return Vector2(CABIN.position.x+236,FLOOR_Y)

func draw_dad():
 var at=dad_point()
 sprite("dad-warm" if power_visible() else "dad-cold",at+Vector2(-41,-116))
 var hand=at+Vector2(24,-50)
 if story.dad.flashlight:
  sprite("flashlight",hand+Vector2(-2,-4))
  var tip=hand+Vector2(12,-1)
  var points=PackedVector2Array([tip+Vector2(0,-3),tip+Vector2(0,3),tip+Vector2(155,65),tip+Vector2(155,-50)])
  ink.draw_polygon(points,PackedColorArray([Color.WHITE]),PackedVector2Array([Vector2(0,0),Vector2(1,0),Vector2(1,1),Vector2(0,1)]),SPRITES["beam"])
 if story.dad.lap: boy_asleep(at+Vector2(8,-27))

func tale_backdrop(view):
 # Mist sits in the depth, rather than covering the knight or his route.
 for i in range(3):
  var at=Vector2(floor(view.position.x/96)*96+i*120,view.position.y+65+i*18)
  sprite("cloud",at,Vector2.ZERO,Color(.35,.5,.75,.12))

func draw_front():
 draw_play_plane()
 if story==null or sim==null: return
 ink=front
 front.draw_set_transform(Vector2.ZERO)
 if story.raining>0:
  var fall=clock*260
  for i in range(drops.size()):
   var d=drops[i]
   var at=Vector2(fposmod(d.x-fall*.25-camera.x*.3,340)-10,fposmod(d.y+fall-camera.y*.3,200)-10)
   sprite("rain-"+str(i%2),at,Vector2.ZERO,Color(1,1,1,(.17 if i%3 else .3)*story.raining))
  for point in surfaces:
   if not Rect2(camera,Vector2(320,184)).has_point(point) or hash_at(point.x,point.y)%13: continue
   var age=fposmod(clock*3+point.x*.13,1.0)
   sprite("splash",point-camera-Vector2(2,2),Vector2.ZERO,Color(1,1,1,(1-age)*.3*story.raining))
 if not story.drawing.taken:
  var d=story.drawing.at-camera
  if Rect2(-20,-20,360,224).has_point(d):
   sprite("drawing",d+Vector2(-9,-9+sin(clock*2)*1.2))
 if story.in_tale and sim.room.def.has("workshopGoal") and not riding:
  var goal=sim.room.def.workshopGoal
  var pool=active_position+Vector2(goal[0]+goal[2]/2.0,goal[1])-camera
  var width=goal[2]+14
  sprite("beam",pool-Vector2(width/2-sin(clock*.9)*3,260),Vector2(width,264))
 if riding and story.ride!=null:
  var top=actor-camera
  sprite("beam",top-Vector2(10,200),Vector2(28,214),Color(1,1,1,1.5))
  var direction=1 if story.ride.get("lower",false) else -1
  for i in range(5):
   var y=fposmod(clock*28*direction+i*39,192)-180
   sprite("mote",top+Vector2(sin(i*2+clock)*7,y),Vector2.ZERO,Color(.8,.9,1,.35))
 front.draw_set_transform_matrix(paint_transform)
 # Sparse grass in the near plane, clear of Felix and every hazard.
 for point in surfaces:
  if not Rect2(camera,Vector2(320,184)).has_point(point) or point.distance_to(actor)<28: continue
  if hash_at(point.x,point.y,23)%23==0 and safe_flora(point):
   sprite("grass",point-Vector2(4,19),Vector2.ZERO,Color("#62786d"))

# ---------------------------------------------------------------- the boy
# He stands back in the forest's depth, softer than the play plane, except while he knights Felix.
func draw_boy():
 var b=story.boy
 if not b.visible or b.pose=="lap": return
 if story.in_tale or story.room in story.tale_rooms: return
 var at=render_boy_point()
 var keep=ink_color
 var far_path=b.follow or (story.room!=Story.CABIN and b.pose!="kneel")
 ink_color*=Color(.56,.65,.69,.80) if far_path else Color(.86,.88,.8,.94)
 match b.pose:
  "kneel": boy_kneeling(at,b.facing,b.prop)
  _: boy_standing(at,b.facing,b.pose)
 ink_color=keep

func boy_head(c,face_dir,mood_name):
 sprite("boy-head-"+("asleep" if mood_name=="asleep" else "look"),c+Vector2(-9,-10))

func shirt(rect):
 sprite("boy-shirt",rect.position,rect.size)

func boy_standing(at,facing,pose):
 var run=pose=="run"
 var t=clock*9
 for side in [-1,1]:
  var swing=sin(t+(0.0 if side<0 else PI))*(4 if run else 0)
  sprite_limb("boy-leg",at+Vector2(side*3,-21),at+Vector2(side*3+swing,0),4)
 sprite("boy-pack",at+Vector2(-facing*9-4,-37))
 sprite("boy-shirt",at+Vector2(-6,-38))
 for side in [-1,1]:
  var arm=at+Vector2(side*6,-35)
  var hand=arm+Vector2(side*(2+sin(t)*(3 if run else .5)),15)
  if pose=="point" and side==1: hand=arm+Vector2(facing*13,-8)
  sprite_limb("boy-arm",arm,hand,4)
 boy_head(at+Vector2(0,-46),facing,"look")

func boy_kneeling(at,facing,prop):
 sprite("boy-kneel",at+Vector2(-13,-25))
 var hand=at+Vector2(facing*11,-20)
 sprite_limb("boy-arm",at+Vector2(facing*5,-24),hand,4)
 if prop=="stick":
  # Only the drawing changes: the tip still rests on Felix at the original point.
  var tip=actor+Vector2(4,-1+sin(clock*2)*1.5)
  var angle=(tip-hand).angle()
  ink.draw_set_transform_matrix(Transform2D(0,-camera)*Transform2D(angle,hand))
  sprite("sword",Vector2(-2,-1.5),Vector2(hand.distance_to(tip)+3,3))
  ink.draw_set_transform(-camera)
 boy_head(at+Vector2(0,-35),facing,"look")

func boy_asleep(at):
 sprite("boy-asleep",at+Vector2(-24,-19))
 if fmod(clock,4.0)<2.6:
  var z=fmod(clock,4.0)
  marker("z",at+Vector2(-18-z*4,-26-z*8),7,Color(.85,.88,1,.6*(1-z/2.6)))

# ---------------------------------------------------------------- Felix
func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 var p=sim.p
 var g=story.gifts if story!=null else {"legs":true,"cape":true,"arms":true,"face":true,"sword":true,"helmet":true}
 var center=body.draw(self,g)
 if g.get("helmet",false): helmet(center,p.facing)
 if g.get("sword",false): sword(center,p)
 elif story!=null and story.phase in ["ending","end"] and story.end_time>12.5:
  # Set down beside him for the night.
  sprite("helmet-down",actor+Vector2(10,5))
  sprite("sword-down",actor+Vector2(9,7))

# A cardboard helmet with a crayon plume.
func helmet(center,facing):
 var point=center+Vector2(-4,-10)
 ink.draw_texture_rect(SPRITES["helmet"],Rect2(point.round(),Vector2(9,9)),false,ink_color)

func sword(center,p):
 var f=p.facing
 var swing=p.get("strikeTimer",0)
 var hand=center+Vector2(f*3.6,1.4)
 var aim=Vector2(f*5.2,-4.2)
 if p.state=="strike" or swing>0:
  var dir=p.get("strikeDir",{"x":f,"y":0})
  aim=Vector2(dir.get("x",f) if dir is Dictionary else f,dir.get("y",0) if dir is Dictionary else 0)
  if aim==Vector2.ZERO: aim=Vector2(f,0)
  # An arc of the sprite follows the existing strike timer; no hitbox or timer changes.
  var u=clamp(float(swing)/max(1,sim.K.get("strikeFrames",5)),0,1)
  aim=aim.normalized().rotated((u-.5)*1.15*f)*7.5
 ink.draw_set_transform_matrix(paint_transform*Transform2D(aim.angle(),hand.round()))
 sprite("sword",Vector2(-2,-2),Vector2(aim.length()+3,5))
 ink.draw_set_transform_matrix(paint_transform)

func draw_world_hearts(): pass

func target_camera():
 if riding: return Vector2(actor.x-153,actor.y-100)
 # At the cabin, frame Dad, the boy and Felix together while the scene plays.
 if story!=null and story.room==Story.CABIN and story.dad.visible and (story.freeze>0 or story.phase in ["ending","end"]):
  var mid=(dad_point().x+actor.x)/2.0
  return Vector2(mid-160,actor.y-133)
 return super.target_camera()

func draw_tale_goal(scene,origin):
 var goal=scene.room.def.workshopGoal
 var center=origin+Vector2(goal[0]+goal[2]/2.0,goal[1])
 sprite("pool",center-Vector2(goal[2]/2.0+5,3),Vector2(goal[2]+10,8))
 circle(center+Vector2(0,-12),15,Color(.65,.82,1,.10))
 sprite("lantern",center+Vector2(-5,-23))


func draw_forest_layer(layer,node):
 ink=node
 var base=int(node.get_meta("base"))
 var spacing=31+layer*16
 for i in range(-2,14):
  var seed=hash_at(i+base,layer)
  sprite("tree-"+str(seed%3),Vector2(i*spacing-18,-18+seed%25),Vector2.ZERO,[Color("#45616a"),Color("#69817b"),Color("#a1ad87")][layer])
 ink=self


func safe_flora(point):
 var cell=Vector2i(point/8)
 for dx in range(-2,3):
  for dy in range(-2,1):
   if runtime.cells.get(cell+Vector2i(dx,dy),0)>=3: return false
 return true


func forest_dressing(view):
 for point in surfaces:
  if not view.has_point(point) or not safe_flora(point): continue
  var n=hash_at(point.x,point.y,17)
  if n%13!=0: continue
  var names=["fern","leaf","mushroom","acorn"]
  var name=names[n%4]
  var dimensions=SPRITES[name].get_size()
  sprite(name,point+Vector2(4-dimensions.x/2,-dimensions.y+1),Vector2.ZERO,Color("#96a48b") if story.in_tale else Color.WHITE)


func draw_play_plane():
 if sim==null: return
 var profile_start=Time.get_ticks_usec()
 ink = front
 paint_transform=Transform2D(0,-camera)
 ink.draw_set_transform_matrix(paint_transform)
 var view = Rect2(camera-Vector2(20,35),Vector2(360,235))
 # A soft contact shadow lies on the ground, beneath devices and Felix. The boy
 # himself remains behind the terrain and foreground branches.
 if story.boy.visible and story.boy.pose!="lap" and not story.in_tale:
  sprite("boy-shadow",render_boy_point()+Vector2(-11,-2))
 for surface in surfaces:
  if not view.has_point(surface): continue
  Art.grass(self,surface)
 if runtime!=null and sim.world_context!=null and runtime.data.has("whiteFlowers"):
  for patch in runtime.data.whiteFlowers.patches:
   var at=runtime.placements[patch.room]+Vector2(patch.x,patch.y)
   if not view.has_point(at): continue
   var previous=ink_color
   ink_color*=Color(patch.get("tint","ffffffff"))
   for i in range(max(1,ceili(float(patch.w)/2.6))):
    var top=at+Vector2(1+i*2.6,1+sin(clock*1.5+i)*.25)
    Styles.line(self,at+Vector2(1+i*2.6,patch.h),top,"#839b83",.5)
    Styles.oval(self,top,Vector2(1.5,.9),"#fffbee","#cdd8c7",.12)
    circle(top,.3,"#d0c397")
   ink_color=previous
 for item in decorations:
  var point = item.origin+Vector2(item.d.c*8,item.d.r*8+8)
  if view.has_point(point) and (item.d.k not in ["trumpets","fern"] or Art.flora_safe(self,point)): draw_prop(item.d.k,point,item.d)
 for point in fires:
  if view.has_point(point): draw_fire(point)
 for item in people:
  var point = item.origin+Vector2(item.d.c*8,item.d.r*8+8)
  if view.has_point(point): draw_person(item.d,point,item.room==sim.room.id)
 # Every room's actual state is visible before entry and retained after departure.
 var scenes=runtime.cores.values() if runtime!=null else [sim]
 for scene in scenes:
  var origin=scene.world_origin if runtime!=null else active_position
  if not Rect2(origin,Vector2(scene.room.w,scene.room.h)).intersects(view): continue
  if world_data.world.has("campaignWorkshop") and scene.room.id==world_data.world.campaignWorkshop.entry:
   var door=origin+Vector2(scene.room.spawn.x+scene.p.w/2.0,scene.room.spawn.y+scene.p.h)
   line(door+Vector2(-10,0),door+Vector2(-10,-25),"#87c9dc",2)
   line(door+Vector2(10,0),door+Vector2(10,-25),"#87c9dc",2)
   line(door+Vector2(-10,-25),door+Vector2(10,-25),"#87c9dc",2)
   line(door+Vector2(0,-13),door+Vector2(0,-20),"#d4f2f7",1)
   line(door+Vector2(0,-20),door+Vector2(-3,-17),"#d4f2f7",1)
   line(door+Vector2(0,-20),door+Vector2(3,-17),"#d4f2f7",1)
  if scene.room.def.has("workshopGoal"):
   draw_tale_goal(scene,origin)
  for r in range(max(0,floori((view.position.y-origin.y)/8)),min(int(scene.room.rows),ceili((view.end.y-origin.y)/8))):
   for c in range(max(0,floori((view.position.x-origin.x)/8)),min(int(scene.room.cols),ceili((view.end.x-origin.x)/8))):
    var t=scene.room.grid[r*int(scene.room.cols)+c]
    var glyph=scene.room.def.map[r][c]
    if glyph in ["-","(",")"]:
     var rail=origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8)
     sprite("twig-rail",rail)
     if glyph!="-": box(rail.x+3,rail.y+5,1,1,"#c4ac76")
    if glyph=="%":
     var surface=origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8)
     sprite("bark-block",surface)
    if t>=3:
     if scene.flipped: t=4 if t==3 else (3 if t==4 else t)
     draw_hazard(t,origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8))
  for e in scene.ents:
   var painted=e
   if scene.flipped:
    painted=e.duplicate(true)
    scene.GravityDevice.mirror_body(painted,scene.room.h)
    if e.type=="zipline":
     painted.ay=scene.room.h-e.ay
     painted.by=scene.room.h-e.by
   if Rect2(origin+Vector2(painted.x,painted.y),Vector2(painted.w,painted.h)).grow(18).intersects(view): draw_entity(painted,origin)
  draw_region_devices(scene,origin,view)
  for wave in scene.brute_waves:
   var point=origin+Vector2(wave.x,wave.y)
   if view.has_point(point):
    for k in range(4): box(point.x-1+k,point.y-2-k%2*3,1,2+k%2*3,"#d6ad76")
  for enemy in scene.combat.get("enemies",[]):
   if not enemy.get("dead",false) and view.has_point(origin+Vector2(enemy.x,enemy.y)): draw_hound(enemy,origin)
  for e in scene.sweepers:
   var point=origin+Vector2(e.x,e.y)
   Art.dust_bunny(self,e,origin)
 for trail in trails:
  var alpha = trail.life/trail.max*(.15 if reduced_motion else .48)
  var col=Color(trail.color,alpha)
  box(trail.p.x+1,trail.p.y+1,6,9,col)
  if not reduced_motion:
   line(trail.p+Vector2(4,5),trail.p+Vector2(4,5)-trail.dir*12,Color(trail.color,alpha*.55),2)
 for part in particles:
  var col = part.color
  col.a = clamp(part.life/part.max,0,1)*0.8
  if part.get("spark",false):
   circle(part.p,1.8,Color(accent,col.a*.12))
   line(part.p,part.p-part.v.normalized()*4,col,1)
   box(part.p.x,part.p.y,1,1,Color(1,.95,.82,col.a))
  elif part.get("dust",false):
   circle(part.p,1.2,Color(col,col.a*.35))
   box(part.p.x,part.p.y,1,1,col)
  else: box(part.p.x,part.p.y,1,1,col)
 draw_feel_world()
 if runtime!=null:
  if int(world_data.world.n)==2: draw_elsie_quest()
  if causeway and int(world_data.world.n)==3: draw_silas_quest()
  draw_world_hearts()
 if sim.p.state!="dead":
  if sim.flipped: ink.draw_set_transform(Vector2(-camera.x,-camera.y+actor.y*2+sim.p.h),0,Vector2(1,-1))
  draw_knight()
  if sim.flipped: ink.draw_set_transform(-camera)
 ink.draw_set_transform(Vector2.ZERO)
 draw_award_screen()
 if flash>0 and not reduced_motion: box(0,0,320,184,Color(0.92,0.85,0.65,flash*0.7))
 if fade>0: box(0,0,320,184,Color(0.03,0.05,0.08,fade*2.5))
 draw_cpu_us.foreground=Time.get_ticks_usec()-profile_start
