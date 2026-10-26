@tool
extends Node2D
## Presentation is interpolated and layered; the integer simulation is never modified here.
const KnightStyles=preload("res://scripts/knight_styles.gd")
const Styles=preload("res://scripts/character_styles.gd")
const Art=preload("res://scripts/art_details.gd")
const Room = preload("res://scripts/room_loader.gd")
var sim
var walking_style=1
const Themes=preload("res://scripts/outskirts_themes.gd")
var environment_design=0
var environment_feel=0
var cape_flow=Vector2(0,1)
var knight_design=0
var npc_design=1
var flora_adjusted=0
var flora_skipped=0
var fractured=false
var forest=false
var causeway=false
var sky_gradient: Texture2D
var forest_layers=[]
var draw_cpu_us={"background":0,"foreground":0,"presentation":0}
var runtime = null
var world_data
var placements = {}
var sections = []
var definitions = {}
var active_position = Vector2.ZERO
var occluders: Node2D
var occluder_count = 0
var tiles: TileMapLayer
var front: Node2D
var ink: CanvasItem
var ambient: CanvasModulate
var wind: GPUParticles2D
var post: ColorRect
var fires = []
var wall_lamps=[]
var surfaces = []
var decorations = []
var people = []
var lights = []
var lit = true
var reduced_motion = false
var speaker = ""
var clock = 0.0
var camera = Vector2.ZERO
var camera_float = Vector2.ZERO
var previous_actor = Vector2.ZERO
var current_actor = Vector2.ZERO
var actor = Vector2.ZERO
var walking = 0.0
var squash = 0.0
var flash = 0.0
var shake = 0.0
var fade = 0.0
var particles = []
var trails = []
var plume = []
var ambient_counter = 0.0
var ink_color = Color.WHITE
var paint_transform=Transform2D.IDENTITY
var petal_override=""
var observed = {"bursts":0,"afterimages":0,"joins":0,"landings":0,"dash_hits":0,"wall_sparks":0,"deaths":0,"respawns":0,"awards":0}
# All timers below are presentation seconds. No simulation clock or input is changed.
var accent=Color("#efbf79")
var mood=Color("#bac9dc")
var camera_lead=Vector2.ZERO
var camera_velocity=Vector2.ZERO
var camera_kick=Vector2.ZERO
var kick_velocity=Vector2.ZERO
var rings=[]
var impact_power=0.0
var render_hold=0.0
var held_actor=Vector2.ZERO
var death_time=0.0
var death_point=Vector2.ZERO
var respawn_time=0.0
var award_time=-1.0
var award_point=Vector2.ZERO
var award_seen=-1000
var wall_spark_frame=-100
var dash_ghost_frame=-100
var landing_speed=0.0
var observed_room=""
func configure_mood():
 var colors={1:["#efbf79","#bac9dc"],2:["#b7e1a0","#a9c4ab"],3:["#f3a66d","#cfb6a7"],21:["#cbb7ff","#b6aedc"],22:["#84e6d8","#98bfc2"],23:["#e8a5dc","#c4a6cf"]}
 var pair=colors.get(int(world_data.world.n),colors[1])
 accent=Color(pair[0])
 mood=Color(pair[1])
 if int(world_data.world.n)==1 and environment_design>0:
  accent=Color("#e9c47a" if environment_design==3 else "#b8d7e3")
  mood=Color("#c4b8dc" if environment_design==3 else "#acbdd7")
 var palette=world_data.world.get("authoring_palette",{})
 accent=Color(palette.get("accent",accent.to_html()))
 mood=Color(palette.get("ambient",mood.to_html()))
func ring_at(point,color,power=1.0,kind="impact"):
 rings.append({"p":point,"color":color,"life":0.4,"max":0.4,"power":power,"kind":kind})
func kick(velocity):
 if not reduced_motion: kick_velocity+=velocity
func reset_feel():
 wall_spark_frame=-100
 dash_ghost_frame=-100
 camera_velocity=Vector2.ZERO
 camera_lead=Vector2.ZERO
 camera_kick=Vector2.ZERO
 kick_velocity=Vector2.ZERO
 render_hold=0
 death_time=0
 respawn_time=0
 award_time=-1
 award_seen=runtime.quest_award_frame if runtime!=null else -1000
 rings.clear()
 impact_power=0
func _ready():
 if Engine.is_editor_hint(): return
 fractured=int(world_data.world.n)>=21
 forest=int(world_data.world.n) in [2,22]
 causeway=int(world_data.world.n) in [3,23]
 configure_mood()
 var sky=Image.create(1,184,false,Image.FORMAT_RGBA8)
 for y in range(184):
  sky.set_pixel(0,y,Color("0b191b").lerp(Color("344937"),float(y)/225) if forest else Color("101526").lerp(Color("53636a"),float(y)/200.0))
 if causeway:
  for y in range(184): sky.set_pixel(0,y,Color("191b2c").lerp(Color("916d59"),float(y)/220))
 if fractured:
  for y in range(184): sky.set_pixel(0,y,Color("111020").lerp(Color("485866" if forest else ("6c4a66" if causeway else "514563")),float(y)/205))
 sky_gradient=ImageTexture.create_from_image(sky)
 if forest:
  for layer in range(3):
   var node=Node2D.new()
   node.set_meta("base",-999999)
   node.draw.connect(draw_forest_layer.bind(layer,node))
   add_child(node)
   forest_layers.append(node)
 texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
 sections = world_data.world.sections.duplicate(true)
 for q in world_data.world.quests: sections.append_array(q.sections)
 for q in world_data.world.get("secrets",[]): sections.append_array(q.sections)
 sections.append_array(world_data.world.get("passages",[]))
 for s in sections: placements[s.room] = Vector2(s.x*8,s.y*8)
 for d in world_data.world.rooms: definitions[d.id] = d
 tiles = TileMapLayer.new()
 tiles.tile_set = make_tiles()
 tiles.z_index = 1
 add_child(tiles)
 occluders = Node2D.new()
 add_child(occluders)
 build_terrain()
 draw_boundary_tiles()
 front = Node2D.new()
 front.z_index = 2
 front.draw.connect(draw_front)
 add_child(front)
 ambient = CanvasModulate.new()
 ambient.color = Color("b6becf")
 add_child(ambient)
 make_lights()
 wind = GPUParticles2D.new()
 wind.position = Vector2(160,90)
 wind.amount = 38
 wind.lifetime = 9
 wind.preprocess = 5
 wind.visibility_rect = Rect2(-200,-120,400,240)
 var material = ParticleProcessMaterial.new()
 material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
 material.emission_box_extents = Vector3(180,110,0)
 material.direction = Vector3(-1,-0.08,0) if not forest else Vector3(.3,-.5,0)
 material.spread = 12
 material.gravity = Vector3(0,-0.2,0)
 material.initial_velocity_min = 2 if forest else (10 if causeway else 4)
 material.initial_velocity_max = 5 if forest else (19 if causeway else 9)
 material.scale_min = 0.35
 material.scale_max = 0.6
 material.color = Color(accent,0.25 if fractured else .18)
 wind.process_material = material
 wind.z_index = 3
 add_child(wind)
 post = ColorRect.new()
 post.size = Vector2(320,184)
 post.mouse_filter = Control.MOUSE_FILTER_IGNORE
 post.z_index = 5
 var shader = ShaderMaterial.new()
 shader.shader = preload("res://shaders/atmosphere.gdshader")
 post.material = shader
 add_child(post)
func hash_at(x,y,salt=0): return posmod(int(x)*73856093^int(y)*19349663^int(salt)*83492791,2147483647)
func make_tiles():
 var image = Image.create(160,8,false,Image.FORMAT_RGBA8)
 image.fill(Color.TRANSPARENT)
 for variant in range(20):
  for y in range(8):
   for x in range(8):
    if int(world_data.world.n)==1 and (environment_design>0 or environment_feel>0):
     image.set_pixel(variant*8+x,y,Themes.tile_color(environment_design,variant,x,y,environment_feel))
     continue
    if variant==15:
     if y<2: image.set_pixel(variant*8+x,y,Color("9d9c82") if y==0 else Color("4e5a62"))
     continue
    var color = Color("414651")
    var tint = float(variant%4)*0.012
    color = color.lightened(tint)
    if y==7 or (x==(3 if variant%2 else 7) and y>2): color = Color("29323c")
    elif y==0: color = Color("50555e")
    elif x==0: color = Color("343a46")
    if x in [1,2] and y in [2,3] and variant%3==0: color=color.lightened(.06)
    if hash_at(x,y,variant)%17==0: color = color.lightened(0.08)
    if hash_at(x,y,variant+5)%23==0: color = color.darkened(0.13)
    if variant<4:
     if y==0: color = Color("a4a884") if (x+variant)%3!=0 else Color("899976")
     elif y==1: color = Color("6f825d") if (x+variant)%4!=0 else Color("8d996d")
     elif y==2 and (x+variant)%3==0: color = Color("657555")
    elif variant==8 and x==0: color = Color("808c86")
    elif variant==9 and x==7: color = Color("6a7880")
    elif variant==10 and y==7: color = Color("7a8581")
    if variant<4 and y==3 and x in [1,6] and variant%2: color=Color("#708171")
    if variant in [5,7,11] and x==((y+variant)%6)+1 and y in [3,4,5]: color = Color("2c3440")
    if variant>=16:
     color=Color("252e3a").lightened(float(variant-16)*0.012)
     if x==7 or y==7: color=Color("1b2430")
     elif y==0: color=color.lightened(0.035)
     if hash_at(x,y,variant)%19==0: color=color.lightened(0.04)
    if forest:
     color=Color(color.r*0.72,color.g*0.92,color.b*0.72,color.a)
    if causeway:
     color=Color(color.r*1.08,color.g*0.88,color.b*0.76,color.a)
     if variant<4 and y<2: color=Color("9c8a6e") if y==0 else Color("625b53")
    if fractured:
     color=Color(color.r*.88,color.g*.88,color.b*1.15,color.a)
     if variant<16 and y in [3,4,5] and x==(variant*3+y)%7 and variant%3==0: color=Color("#9eb9ce")
    image.set_pixel(variant*8+x,y,color)
 var atlas = TileSetAtlasSource.new()
 atlas.texture = ImageTexture.create_from_image(image)
 atlas.texture_region_size = Vector2i(8,8)
 for x in range(20): atlas.create_tile(Vector2i(x,0))
 var result = TileSet.new()
 result.tile_size = Vector2i(8,8)
 result.add_source(atlas,0)
 return result
func set_environment_design(value):
 if int(world_data.world.n)!=1: return
 environment_design=value if value in Themes.CHOICES else 0
 configure_mood()
 if tiles!=null: tiles.tile_set=make_tiles()
 if ambient!=null: ambient.color=mood if lit else Color.WHITE
 if post!=null: post.material.set_shader_parameter("mood_tint",Vector3(mood.r,mood.g,mood.b))
 queue_redraw()
func set_environment_feel(value):
 environment_feel=clampi(value,0,2)
 set_environment_design(environment_design)
func tick_cape(delta):
 var motion=clamp(abs(sim.p.vx)/55.0,0,1)
 var target=Vector2(-sim.p.facing*motion,1-motion)
 cape_flow=cape_flow.lerp(target,1-exp(-delta*6.0))
func build_terrain():
 # Build the full static map once, not at every doorway.
 for d in world_data.world.rooms:
  var origin = placements.get(d.id,Vector2.ZERO)
  var cols = int(d.get("cols",40))
  var rows = int(d.get("rows",23))
  for r in range(rows):
   for c in range(cols):
    var ch = Room.glyph(d,c,r)
    var cell = Vector2i(c,r)+Vector2i(origin/8)
    if runtime!=null:
     var value=runtime.cells.get(cell,0)
     ch="#" if value==1 else ("=" if value==2 else ch)
    if ch in ["#","%"]:
     var above = Room.glyph(d,c,r-1) if r>0 else "#"
     var variant = 4+hash_at(cell.x,cell.y)%4
     if above not in ["#","%"]:
      variant = hash_at(cell.x,cell.y)%4
      surfaces.append(Vector2(cell)*8)
     elif c>0 and Room.glyph(d,c-1,r) not in ["#","%"]: variant = 8
     elif c+1<cols and Room.glyph(d,c+1,r) not in ["#","%"]: variant = 9
     elif r+1<rows and Room.glyph(d,c,r+1) not in ["#","%"]: variant = 10
     tiles.set_cell(cell,0,Vector2i(variant,0))
    elif ch=="=": tiles.set_cell(cell,0,Vector2i(15,0))
  build_shadows(d,origin,cols,rows)
  for prop in d.get("decor",[]):
   var painted=Art.place_flora(self,d,prop,origin) if prop.k in ["trumpets","fern"] else prop
   if painted!=null: decorations.append({"d":painted,"origin":origin})
  for person in d.get("people",[]): people.append({"d":person,"origin":origin,"room":d.id})
 for section in sections:
  if section.get("fire")!=null:
   var position_in_world = placements[section.room]+Vector2(section.fire.c*8+3,section.fire.r*8+7)
   if not fires.any(func(f):return f.distance_to(position_in_world)<16): fires.append(position_in_world)
 for item in decorations:
  if item.d.k=="sconce": wall_lamps.append(item.origin+Vector2(item.d.c*8+9,item.d.r*8-2))
  if item.d.k=="watchfire":
   var position_in_world = item.origin+Vector2(item.d.c*8+4,item.d.r*8+7)
   if not fires.any(func(f):return f.distance_to(position_in_world)<16): fires.append(position_in_world)
func draw_boundary_tiles():
 if runtime==null: return
 for cell in runtime.closed_edges: tiles.set_cell(cell,0,Vector2i(10 if posmod(cell.y,5)==0 else 8,0))
 # A dark rock backing around each outer wall prevents seeing into unbuilt outside space.
 for id in runtime.regions:
  var area=runtime.rectangles[id]
  for r in range(int(area.position.y/8)-24,int(area.end.y/8)+24):
   for c in range(int(area.position.x/8)-24,int(area.end.x/8)+24):
    var cell=Vector2i(c,r)
    if not runtime.cells.has(cell): tiles.set_cell(cell,0,Vector2i(16+hash_at(c,r)%4,0))
func make_lights():
 var image = Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var distance = Vector2(x-64,y-64).length()/64.0
   image.set_pixel(x,y,Color(1,0.75,0.46,pow(max(0,1-distance),2)))
 var texture = ImageTexture.create_from_image(image)
 for point in fires+wall_lamps:
  var light = PointLight2D.new()
  light.texture = texture
  light.energy = 1.5
  light.shadow_enabled = true
  light.shadow_color = Color(0.03,0.05,0.08,0.4)
  light.shadow_filter = Light2D.SHADOW_FILTER_PCF5
  light.texture_scale = 0.85
  add_child(light)
  var sparks = GPUParticles2D.new()
  sparks.amount = 9
  sparks.lifetime = 1.8
  sparks.preprocess = 0.8
  sparks.visibility_rect = Rect2(-40,-60,80,90)
  var material = ParticleProcessMaterial.new()
  material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
  material.emission_sphere_radius = 2
  material.direction = Vector3(-0.2,-1,0)
  material.spread = 20
  material.gravity = Vector3(0,-4,0)
  material.initial_velocity_min = 9
  material.initial_velocity_max = 16
  material.scale_min = 0.35
  material.scale_max = 0.65
  material.color = Color(1,0.57,0.2,0.7)
  sparks.process_material = material
  sparks.z_index = 3
  add_child(sparks)
  lights.append({"node":light,"sparks":sparks,"point":point})
func load_scene(core,smooth_join=false):
 sim = core
 active_position = placements.get(sim.room.id,Vector2.ZERO)
 snap_actor()
 if not smooth_join:
  reset_feel()
  camera_float = Vector2(actor.x-153,actor.y-133) if runtime!=null else target_camera()
  camera = camera_float
  fade = 0.16
  trails.clear()
  particles.clear()
 else: observed.joins += 1
 queue_redraw()
func snap_actor():
 current_actor = actor_position()
 previous_actor = current_actor
 actor = current_actor
 plume.clear()
 for i in range(7): plume.append(actor+Vector2(3,4))
func actor_position():
 return active_position+Vector2(sim.p.x,sim.room.h-sim.p.y-sim.p.h if sim.flipped else sim.p.y)
func before_tick():
 if sim==null: return {}
 if observed_room!=sim.room.id:
  observed_room=sim.room.id
  wall_spark_frame=-100
  dash_ghost_frame=-100
 previous_actor = current_actor
 var states = {}
 for e in sim.ents: states[entity_key(e)] = {"lit":e.get("lit",false),"open":e.get("open",false),"broken":e.get("broken",false),"solid":e.get("solid",true),"shaking":e.get("shaking",0),"down":e.get("down",false),"timer":e.get("timer",0),"state":e.get("state","idle"),"returning":e.get("returning",false),"gone":e.get("gone",false)}
 return {"entities":states,"frame":sim.frame,"fall_speed":max(sim.p.vy,sim.p.get("lastFallSpeed",0))}
func entity_key(e):
 return str(e.get("source_room", ""))+":"+str(e.get("source_id", e.id))
func after_tick(before):
 if before.is_empty() or before.frame==sim.frame: return []
 current_actor = actor_position()
 if previous_actor.distance_to(current_actor)>55 or "respawn" in sim.events: snap_actor()
 var types = sim.events.duplicate()
 for i in range(sim.ents.size()):
  var e = sim.ents[i]
  var key=entity_key(e)
  if not before.entities.has(key): continue
  var old = before.entities[key]
  var type = ""
  if e.type=="stone" and e.get("lit",false) and not old.lit: type="stone-lit"
  elif e.type=="gate" and e.get("open",false) and not old.open: type="gate-open"
  elif e.type=="crumble":
   if e.get("broken",false) and not old.broken: type="crumble"
   elif e.get("shaking",0)>0 and old.shaking==0: type="crumble-shake"
  elif e.type=="held" and e.solid!=old.solid: type="held-close" if e.solid else "held-open"
  elif e.type=="plate" and e.get("down",false) and not old.down: type="plate"
  elif e.type=="shard" and e.get("gone",false) and not old.gone: type="shard"
  elif e.type=="refill" and e.timer>old.timer: type="refill"
  elif e.type=="zip":
   if e.state=="wind" and old.state=="idle": type="zip-start"
   elif e.state=="hold" and old.state=="go": type="zip-stop"
  elif e.type=="lantern" and e.get("returning",false) and not old.returning: type="lantern-lost"
  if type!="":
   types.append(type)
   event_effect(type,active_position+Vector2(e.x+e.w/2,e.y+e.h/2))
 landing_speed=before.get("fall_speed",0)
 if "land" in types and landing_speed>115: types[types.find("land")]="land-heavy"
 for type in sim.events: event_effect(type,current_actor+Vector2(4,0 if sim.flipped else 11))
 # A cadence in simulation frames makes contact sparks independent of render fps.
 if sim.p.state=="normal" and not sim.p.onGround and sim.p.vy>0 and sim.p.wallSlide<sim.K.wallSlideFrames and sim.climb_check(sim.p.facing) and sim.frame-wall_spark_frame>=4:
  wall_spark_frame=sim.frame
  observed.wall_sparks+=1
  var at=current_actor+Vector2(8 if sim.p.facing>0 else 0,7)
  for i in range(3 if not reduced_motion else 1):
   var life=.16+i*.045
   particles.append({"p":at,"v":Vector2(-sim.p.facing*(14+i*9),-12+i*13),"life":life,"max":life,"color":accent,"spark":true})
 if sim.p.state=="dash" and sim.frame-dash_ghost_frame>=2:
  dash_ghost_frame=sim.frame
  trails.append({"p":current_actor,"life":.22,"max":.22,"color":accent,"dir":Vector2(sim.p.dashDir.x,sim.p.dashDir.y)})
  observed.afterimages+=1
 if runtime!=null and runtime.quest_award_frame!=award_seen:
  award_seen=runtime.quest_award_frame
  if runtime.frames-award_seen<=1:
   award_time=0
   award_point=current_actor+Vector2(4,-8)
   observed.awards+=1
   ring_at(award_point,Color(runtime.award_color),1.5,"award")
   burst(award_point,28,Color(runtime.award_color),40)
   kick(Vector2(0,28))
 return types
func event_effect(type,point):
 match type:
  "jump","walljump","climbhop": burst(point,6,Color("b8b8a1"),18)
  "land":
   var power=clamp((landing_speed-35)/125.0,.2,1.4)
   observed.landings+=1
   impact_power=max(impact_power,power)
   squash=max(squash,.13+power*.23)
   shake=max(shake,power*.12)
   var normal=-1 if sim.flipped else 1
   kick(Vector2(0,40*power*normal))
   ring_at(point,accent,power)
   for side in [-1,1]:
    for i in range(2 if reduced_motion else 4+int(power*5)):
     var life=.2+i*.025
     particles.append({"p":point+Vector2(side*3,0),"v":Vector2(side*(15+i*5)*power,(-8-i*2)*normal),"life":life,"max":life,"color":mood,"dust":true})
  "dash","dash-start":
   observed.dash_hits+=1
   flash=max(flash,.1)
   render_hold=.045 if not reduced_motion else 0.0
   held_actor=current_actor
   var aim=sim.p.get("pressAim",{"x":sim.p.facing,"y":0})
   var dir=Vector2(aim.x,aim.y)
   if dir==Vector2.ZERO: dir=Vector2(sim.p.facing,0)
   dir=dir.normalized()
   kick(-dir*34)
   ring_at(point,accent,.7,"dash")
   burst(point,14,accent,42)
  "death":
   observed.deaths+=1
   death_time=.55
   death_point=point
   shake=max(shake,.3)
   flash=max(flash,.1)
   render_hold=.055 if not reduced_motion else 0.0
   held_actor=current_actor
   kick(Vector2(-sim.p.facing*35,-30))
   ring_at(point,Color("#dc9b9f"),1.2,"death")
   burst(point,38,Color("#e5bbbe"),65)
   trails.clear()
  "respawn":
   observed.respawns+=1
   respawn_time=.6
   death_time=0
   render_hold=0
   fade=.15
   wall_spark_frame=-100
   dash_ghost_frame=-100
   camera_float=Vector2(current_actor.x-153,current_actor.y-118) if runtime!=null else target_camera()
   camera_velocity=Vector2.ZERO
   camera_kick=Vector2.ZERO
   kick_velocity=Vector2.ZERO
   ring_at(point,accent,1.4,"respawn")
   burst(point,22,accent,27)
  "refill","refill-dash","shard","stone-lit": burst(point,10,Color("d4e2b1"),24)
  "gate-open","held-open","crumble":
   shake = 0.12
   burst(point,14,Color("a6a28e"),24)
  "parry","parry-success": burst(point,12,Color("#c2ecfa"),30)
  "portal-pass","gravity","void-in","void-out": burst(point,14,Color("#c8a4ee"),28)
  "sentinel-bell": burst(point,18,Color("#f2d28a"),35)
  "zip-start","zip-stop": burst(point,8,Color("dbbe83"),20)
func burst(point,count,color,speed):
 if reduced_motion:
  count=min(count,6)
  speed*=.35
 observed.bursts += 1
 for i in range(count):
  var a = float(i)*TAU/count+clock
  particles.append({"p":point,"v":Vector2(cos(a)*speed,sin(a)*speed*0.6-10),"life":0.3+float(i%4)*0.09,"max":0.57,"color":color})
func target_camera():
 var look=camera_lead if not reduced_motion else Vector2.ZERO
 if runtime==null: return Vector2(max(0,actor.x-153+look.x),active_position.y+clamp(actor.y-active_position.y-94+look.y,0,max(0,sim.room.h-184)))
 # Continuous world coordinates keep doorway ownership out of the camera calculation.
 var y=camera_float.y
 if actor.y+look.y-y<65: y=actor.y+look.y-65
 elif actor.y+look.y-y>123: y=actor.y+look.y-123
 return Vector2(actor.x-153+look.x,y)
func spring_camera(target,delta):
 # Exact critically damped spring: stable across frame rates and never overshoots at rest.
 var omega=13.0 if reduced_motion else 9.0
 var displacement=camera_float-target
 var decay=exp(-omega*delta)
 var temp=(camera_velocity+displacement*omega)*delta
 camera_float=target+(displacement+temp)*decay
 camera_velocity=(camera_velocity-temp*omega)*decay
func tick_feel(delta):
 var dt=min(delta,.05)
 render_hold=max(0,render_hold-delta)
 death_time=max(0,death_time-delta)
 respawn_time=max(0,respawn_time-delta)
 impact_power=max(0,impact_power-delta*5)
 if award_time>=0:
  award_time+=delta
  if award_time>2.8: award_time=-1
 var desired=Vector2(clamp(sim.p.vx*.17,-25,25),clamp(sim.p.vy*.1,-9,17))
 if sim.p.onGround: desired.y=0
 camera_lead=camera_lead.lerp(desired,1-exp(-dt*5))
 if render_hold<=0: spring_camera(target_camera(),dt)
 kick_velocity+=(-camera_kick*210-kick_velocity*22)*dt
 camera_kick+=kick_velocity*dt
 if reduced_motion:
  camera_kick=Vector2.ZERO
  kick_velocity=Vector2.ZERO
  render_hold=0
 for ring in rings: ring.life-=delta
 rings=rings.filter(func(r):return r.life>0)
func _process(delta):
 if Engine.is_editor_hint(): return
 var profile_start=Time.get_ticks_usec()
 clock += delta
 if sim==null: return
 actor = previous_actor.lerp(current_actor,clamp(Engine.get_physics_interpolation_fraction(),0,1))
 if sim.p.state=="dead": actor=current_actor
 if render_hold>0 and not reduced_motion: actor=held_actor
 walking += abs(sim.p.vx)*delta
 if int(world_data.world.n)==1: tick_cape(delta)
 tick_feel(delta)
 var offset = Vector2.ZERO
 if shake>0 and not reduced_motion: offset=Vector2(sin(clock*97),cos(clock*83))*shake*4
 camera = (camera_float+camera_kick+offset).snapped(Vector2(0.5,0.5))
 for layer in range(forest_layers.size()):
  var node=forest_layers[layer]
  var parallax=0.035+layer*0.055
  var spacing=31+layer*16
  var base=int(floor(camera.x*parallax/spacing))
  node.position=Vector2(-fposmod(camera.x*parallax,spacing),-camera.y*0.008)
  if node.get_meta("base")!=base:
   node.set_meta("base",base)
   node.queue_redraw()
 tiles.position = -camera
 occluders.position = -camera
 ambient.color = mood if lit else Color.WHITE
 wind.emitting = not reduced_motion
 for item in lights:
  var point = item.point-camera
  var visible_now = Rect2(-70,-60,460,320).has_point(point)
  item.node.visible = lit and visible_now
  item.node.position = point-Vector2(0,5)
  item.node.energy = (0.8 if forest else 1.45)+sin(clock*9+item.point.x)*0.04
  item.sparks.position = point-Vector2(0,5)
  item.sparks.emitting = visible_now and not reduced_motion
 for part in particles:
  part.life -= delta
  part.p += part.v*delta
  part.v.y += delta*38
 particles = particles.filter(func(part):return part.life>0)
 for trail in trails: trail.life -= delta
 trails = trails.filter(func(t):return t.life>0)
 if plume.size()==7:
  plume[0] = actor+Vector2(3,4)
  for i in range(1,7):
   var motion=1-cape_flow.y if int(world_data.world.n)==1 else (clamp(abs(sim.p.vx)/55.0,0,1) if sim.p.state=="normal" else 1.0)
   var rest=Vector2(-sim.p.facing*.25+sin(clock*1.8-i*.6)*.15,1.25)
   var direction=cape_flow.x/max(.001,1-cape_flow.y) if int(world_data.world.n)==1 else -sim.p.facing
   var moving=Vector2(direction*1.9,sin(clock*7-i*.8)*.5-.15)
   var target=plume[i-1]+rest.lerp(moving,motion)
   plume[i] = plume[i].lerp(target,1-exp(-delta*23))
   var tether = plume[i]-plume[i-1]
   if tether.length()>2.2: plume[i] = plume[i-1]+tether.normalized()*2.2
 squash = max(0,squash-delta)
 shake = max(0,shake-delta)
 flash = max(0,flash-delta)
 fade = max(0,fade-delta)
 post.material.set_shader_parameter("strength",0.5 if reduced_motion else 1.0)
 post.material.set_shader_parameter("mood_tint",Vector3(mood.r,mood.g,mood.b))
 post.material.set_shader_parameter("pulse",0.0 if reduced_motion else max(death_time*.35,impact_power*.05))
 queue_redraw()
 front.queue_redraw()
 draw_cpu_us.presentation=Time.get_ticks_usec()-profile_start
func box(x,y,w,h,color): ink.draw_rect(Rect2(x,y,w,h),(Color(color) if color is String else color)*ink_color)
func line(a,b,color,width=1.0): ink.draw_line(a,b,(Color(color) if color is String else color)*ink_color,width)
func polygon(points,color): ink.draw_colored_polygon(PackedVector2Array(points),(Color(color) if color is String else color)*ink_color)
func circle(point,radius,color): ink.draw_circle(point,radius,(Color(color) if color is String else color)*ink_color)
func _draw():
 if Engine.is_editor_hint(): return
 var profile_start=Time.get_ticks_usec()
 ink = self
 if int(world_data.world.n)==1 and environment_design>0:
  Themes.background(self,environment_design,environment_feel)
  draw_cpu_us.background=Time.get_ticks_usec()-profile_start
  return
 if causeway:
  draw_causeway()
  Art.background_details(self)
  draw_cpu_us.background=Time.get_ticks_usec()-profile_start
  return
 if forest:
  draw_woods()
  Art.background_details(self)
  draw_cpu_us.background=Time.get_ticks_usec()-profile_start
  return
 ink.draw_texture_rect(sky_gradient,Rect2(0,0,320,184),false)
 # A fixed celestial depth with slowly moving cloud veils.
 var moon = Vector2(252-camera.x*0.018,35-camera.y*0.025)
 moon.x = fposmod(moon.x+40,380)-20
 circle(moon,18,Color(0.77,0.79,0.63,0.025))
 circle(moon,15,Color(0.83,0.83,0.66,0.04))
 circle(moon,11,Color("c8c9ac"))
 circle(moon+Vector2(4,-2),10.1,Color("273244"))
 for i in range(45):
  var x = fposmod(i*67.3-camera.x*0.035,324)
  var y = fposmod(i*31.7,86)
  var alpha = 0.13+sin(clock*0.7+i)*0.07
  box(x,y,0.6,0.6,Color(0.88,0.87,0.72,alpha))
 for layer in range(3):
  var parallax = 0.06+layer*0.065
  var offset = fposmod(camera.x*parallax,35)
  var points = [Vector2(-40,184)]
  for i in range(-2,14):
   var x = i*35-offset
   var y = 87+layer*18+sin((i+floor(camera.x*parallax/35))*1.3+layer)*11+cos(i*2.4)*5-camera.y*0.02
   points.append(Vector2(x,y))
  points.append(Vector2(360,184))
  if int(world_data.world.n)==1 and environment_feel==1: points=Themes.round_ridge(points)
  polygon(points,[Color("233042"),Color("2c3e4c"),Color("3d5059")][layer])
 # Watchtowers, arches, broken roofs and narrow distant windows.
 for i in range(-1,7):
  var world_index = i+int(floor(camera.x*0.16/72))
  var x = i*72-fposmod(camera.x*0.16,72)
  var top = 70+hash_at(world_index,2)%29
  var width = 14+hash_at(world_index,3)%12
  box(x,top,width,100,"293a48")
  box(x-2,top-3,width+4,4,"344650")
  for c in range(0,width+4,5): box(x-2+c,top-6,3,4,"344650")
  box(x+width/2-1,top+8,2,5,"64736c")
  box(x+width/2-1,top+24,2,6,"202f3c")
  for r in range(3): line(Vector2(x,top+14+r*12),Vector2(x+width,top+14+r*12),Color(0.23,0.3,0.33,0.5))
  line(Vector2(x+width,top+34),Vector2(x+56,top+34),"#334650",2)
  line(Vector2(x+width+3,top+35),Vector2(x+width+8,top+49),"#263746",2)
 for band in range(4):
  var y = 91+band*21
  for i in range(9):
   var x = fposmod(i*49+clock*(1+band*.3)-camera.x*.08,400)-40
   box(x,y+sin(x*.02+clock*.1)*3,50,3,Color(0.51,0.61,0.63,0.025))
 # Deliberately dim foreground ruin work behind the authored collision tiles.
 for i in range(-1,10):
  var x = i*45-fposmod(camera.x*0.4,45)
  box(x,132,4,52,Color(0.22,0.29,0.33,0.55))
  line(Vector2(x+4,138),Vector2(x+34,138),Color(0.24,0.3,0.34,0.45),2)
 draw_cpu_us.background=Time.get_ticks_usec()-profile_start
 Art.background_details(self)
 if int(world_data.world.n)==1: Themes.finish_background(self,environment_design,environment_feel)

func draw_front():
 if sim==null: return
 var profile_start=Time.get_ticks_usec()
 ink = front
 paint_transform=Transform2D(0,-camera)
 ink.draw_set_transform_matrix(paint_transform)
 var view = Rect2(camera-Vector2(20,35),Vector2(360,235))
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
  for r in range(max(0,floori((view.position.y-origin.y)/8)),min(int(scene.room.rows),ceili((view.end.y-origin.y)/8))):
   for c in range(max(0,floori((view.position.x-origin.x)/8)),min(int(scene.room.cols),ceili((view.end.x-origin.x)/8))):
    var t=scene.room.grid[r*int(scene.room.cols)+c]
    var glyph=scene.room.def.map[r][c]
    if glyph in ["-","(",")"]:
     var rail=origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8)
     box(rail.x,rail.y,8,2,"#debe82" if glyph!= "-" else "#a9b2be")
     box(rail.x+2,rail.y+3,3,4,"#585b68")
     if glyph!= "-": line(rail+Vector2(2,3),rail+Vector2(6,5),"#efac69",1)
    if glyph=="%":
     var surface=origin+Vector2(c*8,(int(scene.room.rows)-1-r if scene.flipped else r)*8)
     box(surface.x,surface.y,8,8,"#c8c8cc")
     box(surface.x+1,surface.y+1,6,1,"#edf0ed")
     line(surface+Vector2(2,3),surface+Vector2(6,6),"#9d95ad",.8)
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
func draw_fire(point):
 var x = point.x
 var y = point.y
 for i in range(4):
  box(x-6+i*4,y-1,3,2,"#77796b")
  box(x-4+i*3,y-2,3,1,"#473d35")
 for i in range(5):
  var height = 3+abs(sin(clock*8+i*1.7+x))*5
  box(x-4+i*1.8,y-height-2,2,height,"#e48d3c")
  box(x-3+i*1.6,y-height+1,1.2,max(1,height-2),"#f6d78c")
 for i in range(4):
  var age = fposmod(clock*0.25+i*0.25,1)
  var smoke = Vector2(x-age*8+sin(age*5+x)*3,y-6-age*27)
  circle(smoke,2+age*4,Color(0.51,0.55,0.55,(1-age)*0.065))
func draw_prop(kind,point,values={}):
 var before=ink_color
 var old_petal=petal_override
 ink_color*=Color(values.get("tint","ffffffff"))
 petal_override=values.get("petal_color","")
 var dimensions=values.get("visual_scale",[1,1])
 var transformed=values.has("visual_scale") or values.has("visual_rotation")
 if transformed: ink.draw_set_transform_matrix(paint_transform*Transform2D(float(values.get("visual_rotation",0)),Vector2(dimensions[0],dimensions[1]),0,point))
 draw_prop_body(kind,Vector2.ZERO if transformed else point)
 if transformed: ink.draw_set_transform_matrix(paint_transform)
 ink_color=before
 petal_override=old_petal
func draw_prop_body(kind,point):
 if kind=="trumpets":
  Art.flowers(self,point)
  return
 if kind=="fern":
  Art.fern(self,point)
  return
 if fractured and world_data.world.get("props",{}).has(kind):
  for bit in world_data.world.props[kind]: box(point.x+bit[0],point.y+bit[1],bit[2],bit[3],bit[4])
  return
 var x = point.x
 var y = point.y
 match kind:
  "cw-chain","cw-chain-long":
   var length=58 if kind=="cw-chain-long" else 28
   line(Vector2(x+3,y-length),Vector2(x+3,y),"#544d48",1)
   for r in range(0,length,5):
    ink.draw_arc(Vector2(x+3,y-r),2,0,TAU,8,Color("#b2a08a"),.6)
  "cw-winch","cw-gear":
   var center=Vector2(x+6,y-7)
   box(x-3,y-2,19,2,"#6c6051")
   circle(center,7,"#393b40")
   circle(center,5,"#a68b62")
   var a=clock*.5 if kind=="cw-gear" else sin(clock*.3)*.1
   for i in range(6):
    var d=Vector2(cos(a+i*TAU/6),sin(a+i*TAU/6))
    line(center+d*2,center+d*8,"#d3b583",1.5)
   circle(center,2,"#464347")
  "cw-crate":
   box(x,y-12,14,12,"#75634d")
   box(x+1,y-11,12,10,"#4f4d49")
   line(Vector2(x+1,y-11),Vector2(x+13,y-1),"#ab8d64",1.5)
   box(x+1,y-12,12,1,"#c1a579")
  "cw-stretcher":
   line(Vector2(x-3,y-5),Vector2(x+25,y-5),"#ba9d72",1.5)
   box(x,y-6,22,2,"#8b8371")
   for side in [1,20]: box(x+side,y-4,2,4,"#625a4e")
  "cw-standard":
   box(x,y-30,1,30,"#a99a7f")
   for i in range(10): box(x+i+1,y-28+sin(clock*2+i*.2),1,10,"#93694f" if i%3 else "#bb946b")
  "sconce":
   box(x+5,y-15,2,10,"#526466")
   line(Vector2(x+6,y-10),Vector2(x+12,y-12),"#a79d78",1.2)
   box(x+10,y-16,3,5,"#a58b60")
   var height=4+sin(clock*9+x)*1.2
   box(x+10,y-16-height,3,height,"#e7a95f")
   box(x+11,y-17-height*.6,1,height*.7,"#f1d797")
  "tent":
   polygon([Vector2(x-8,y),Vector2(x+9,y-22),Vector2(x+31,y)],"#777b64")
   polygon([Vector2(x+10,y),Vector2(x+9,y-22),Vector2(x+31,y)],"#4e5b52")
   polygon([Vector2(x+5,y),Vector2(x+9,y-19),Vector2(x+19,y)],"#283a40")
   line(Vector2(x-8,y),Vector2(x+9,y-22),"#b5ad86")
   line(Vector2(x+31,y),Vector2(x+36,y),"#7c7863")
   line(Vector2(x-8,y),Vector2(x-13,y),"#7c7863")
   box(x+20,y-3,6,3,"#6b5a42")
  "hut":
   box(x-10,y-23,35,23,"#405044")
   polygon([Vector2(x-15,y-22),Vector2(x+6,y-37),Vector2(x+31,y-22)],"#687057")
   box(x+2,y-17,9,17,"#263a32")
   box(x+15,y-17,6,6,"#dbc78c")
   for c in range(-8,25,5): line(Vector2(x+c,y-22),Vector2(x+c,y),"#53614c",0.6)
  "table","step":
   box(x-4,y-7,19,3,"#8d815f")
   box(x-2,y-4,2,4,"#5e6048")
   box(x+11,y-4,2,4,"#5e6048")
   if kind=="table": box(x+2,y-10,5,3,"#c4b38b")
  "stove":
   box(x-3,y-8,13,8,"#53604d")
   box(x,y-4,6,3,"#dfb56e")
   box(x-2,y-12,11,4,"#424b41")
   for i in range(3): circle(Vector2(x+2+sin(clock+i)*2,y-16-i*3),1.5,Color(.7,.76,.62,.12))
  "lantern","elsielamp":
   line(Vector2(x+3,y-24),Vector2(x+3,y-11),"#74795b")
   box(x,y-12,6,8,"#9d8d61")
   box(x+1,y-11,4,5,"#eddaa0")
   circle(Vector2(x+3,y-8),9,Color(1,.8,.4,.05))
  "cradle":
   box(x-2,y-8,14,6,"#7c7556")
   for i in range(4): box(x+i*3,y-11,1,8,"#a69c70")
   line(Vector2(x-4,y),Vector2(x+13,y),"#9d9370",1)
  "roots":
   for i in range(4):
    line(Vector2(x+i*3,y-12),Vector2(x+i*4-4,y-3),"#66734f",1.5)
    line(Vector2(x+i*4-4,y-3),Vector2(x+i*6-8,y),"#7a8056",1)
  "palisade":
   for i in range(5):
    var h = 15+i%3*3
    box(x+i*5,y-h,3,h,"#555d57")
    polygon([Vector2(x+i*5,y-h),Vector2(x+i*5+1.5,y-h-3),Vector2(x+i*5+3,y-h)],"#8b8b71")
    line(Vector2(x+i*5+1,y-h),Vector2(x+i*5+1,y),"#7a8068",0.7)
   box(x-1,y-11,26,2,"#837e63")
   box(x-1,y-5,26,2,"#77745c")
  "milestone","post":
   box(x,y-12,8,12,"#5d6565")
   box(x+1,y-13,6,2,"#a5a88c")
   box(x+2,y-8,4,1,"#b6b18a")
   box(x+3,y-5,2,1,"#b6b18a")
  "clock":
   box(x+3,y-24,2,24,"#5d665e")
   circle(Vector2(x+4,y-25),7,"#7f8474")
   circle(Vector2(x+4,y-25),5.5,"#d0c7a2")
   line(Vector2(x+4,y-25),Vector2(x+4,y-29),"#39464b")
   line(Vector2(x+4,y-25),Vector2(x+7,y-24),"#39464b")
  "mast":
   box(x,y-35,2,35,"#949782")
   line(Vector2(x-2,y-26),Vector2(x+18,y-26),"#9a9b83")
   for i in range(14):
    var flap = sin(clock*2.8+i*.24+x)*1.3
    box(x+2+i,y-33+flap,1,8-i*.1,"#8c7962" if i%4 else "#b39a72")
   line(Vector2(x+1,y-33),Vector2(x-13,y),"#68756d",0.6)
  "gatehouse":
   box(x-5,y-36,6,36,"#4c5960")
   box(x+23,y-36,6,36,"#4c5960")
   box(x-7,y-39,38,4,"#808a7e")
   for i in range(8): box(x-6+i*5,y-43,3,4,"#65746c")
   line(Vector2(x+1,y-31),Vector2(x+23,y-31),"#888e78",2)
func draw_person(who,point,active):
 var before=ink_color
 var design=npc_design
 ink_color*=Color(who.get("tint","ffffffff"))
 npc_design=int(who.get("character_style",npc_design))
 var dimensions=who.get("visual_scale",[1,1])
 var transformed=who.has("visual_scale") or who.has("visual_rotation")
 if transformed: ink.draw_set_transform_matrix(paint_transform*Transform2D(float(who.get("visual_rotation",0)),Vector2(dimensions[0],dimensions[1]),0,point))
 draw_person_body(who,Vector2.ZERO if transformed else point,active)
 if transformed: ink.draw_set_transform_matrix(paint_transform)
 ink_color=before
 npc_design=design
func draw_person_body(who,point,active):
 var x = point.x
 var y = point.y
 var phase = clock*1.6+x*.03
 var sit = 3 if who.who in ["vey","rowan","hale"] else 0
 if npc_design==0: Art.person_base(self,who,point,active)
 else: Styles.person(self,who,point,active,npc_design)
 match who.who:
  "silas":
   if npc_design==0:
    box(x-1,y-14,7,6,"#a6a49a")
    box(x,y-13,5,2,"#45454a")
    box(x+1,y-13,1,1,"#edc783")
   circle(Vector2(x+3,y-5),2,"#b29868")
   line(Vector2(x+3,y-8),Vector2(x+3,y-2),"#574a38")
   box(x-6,y-8,4,1,"#c7a76a")
   box(x-7,y-10,2,5,"#c7a76a")
  "oren":
   line(Vector2(x+3,y-8),Vector2(x+10,y-5+sin(phase)*2),"#c9b08b",1.4)
   box(x+8,y-3,10,3,"#6a5d4c")
  "sable":
   box(x-3,y-17,11,2,"#57545c")
   line(Vector2(x+9,y-17),Vector2(x+9,y),"#9e8968")
  "elsie":
   box(x+8,y-3,8,3,"#484d42")
   box(x+9,y-6,6,4,"#727b60")
   line(Vector2(x+4,y-8),Vector2(x+12+sin(phase)*2,y-7),"#c9b597",1)
   for i in range(2): circle(Vector2(x+11+sin(phase+i),y-10-i*3),1,Color(.8,.8,.65,.2))
  "orra":
   line(Vector2(x+4,y-9),Vector2(x+8,y-12+sin(phase)*.4),"#c8b195",1)
   circle(Vector2(x+9,y-12),1.6,"#d4c38e")
   line(Vector2(x+9,y-11),Vector2(x+7,y-5),"#958a62",.5)
  "pell":
   line(Vector2(x-5,y-13),Vector2(x+13,y-13),"#9a8761",1.5)
   for side in [-4,11]:
    line(Vector2(x+side,y-13),Vector2(x+side,y-6),"#a39878",.6)
    box(x+side-2,y-6,5,5,"#7a795c")
    box(x+side-1,y-5,3,1,"#c0a970")
  "hale":
   box(x-2,y-2,12,2,"#5f614f")
   line(Vector2(x+2,y-7),Vector2(x+7+sin(phase),y-8),"#d4c4a4",1.5)
   box(x+4,y-9,3,2,"#c6cbb3")
  "bram":
   line(Vector2(x+9,y-19),Vector2(x+9,y),"#a49672",1)
   box(x+10,y-15,5,6,"#b49d68")
   box(x+11,y-14,3,4,"#f4df9d")
  "vey":
   box(x-3,y-3,13,2,"#5b5547")
   box(x+9,y-5,6,4,"#3b4648")
   line(Vector2(x+5,y-8+sit),Vector2(x+12+sin(phase)*2,y-5),"#c8b091",1)
  "mara":
   box(x+5,y-8,8,5,"#bfb897")
   line(Vector2(x+6,y-5),Vector2(x+11,y-7),"#778878",0.6)
   line(Vector2(x+4,y-8),Vector2(x+10+sin(phase*2),y-6),"#b9a88b")
  "rowan","sentinel":
   line(Vector2(x+10,y-22),Vector2(x+10,y),"#9a9780")
   polygon([Vector2(x+8,y-23),Vector2(x+10,y-27),Vector2(x+12,y-23)],"#c7cdc1")
   line(Vector2(x+4,y-8+sit),Vector2(x+9,y-10+sin(phase)),"#b1a18a")
  "olan":
   box(x+6,y-8,4,4,"#c6ba94")
   line(Vector2(x+4,y-8),Vector2(x+8,y-7+sin(phase)*.5),"#b8a98e")
func draw_hazard(t,point):
 Art.spikes(self,t,point)
func draw_entity(e,origin):
 var before=ink_color
 ink_color*=Color(e.get("authoring_tint","ffffffff"))
 draw_entity_body(e,origin)
 ink_color=before
func draw_entity_body(e,origin):
 if e.get("gone",false) or e.get("broken",false) or e.get("held",false): return
 var x = origin.x+e.x
 var y = origin.y+e.y
 match e.type:
  "gate","held":
   if e.type=="held" and not e.solid: return
   if e.get("open",false):
    if e.t>=18: return
    y-=e.h*(1-pow(1-float(e.t)/18,2))
   box(x-1,y,e.w+2,e.h,"#36434a")
   for c in range(0,int(e.w),4):
    box(x+c,y,1.5,e.h,"#b4b294")
    box(x+c+1,y,0.5,e.h,"#696e64")
   for r in range(4,int(e.h),12): box(x,y+r,e.w,2,"#707c71")
  "crumble":
   var jitter = sin(clock*70)*0.5 if e.get("shaking",0)>0 else 0
   box(x+jitter,y,e.w,e.h,"#78796a")
   box(x+jitter,y,e.w,1,"#bfb89b")
   for c in range(3,int(e.w),7):
    line(Vector2(x+c,y+1),Vector2(x+c-1,y+e.h-1),"#424d50")
  "superRest","resinBranch":
   var solid=e.get("solid",true)
   box(x,y,e.w,e.h,Color("#8c8aaa") if solid else Color(.5,.65,.8,.18))
   box(x,y,e.w,1,"#c6d7ce" if solid else "#536373")
   for c in range(3,int(e.w),7): line(Vector2(x+c,y+1),Vector2(x+c+3,y+e.h-1),"#4a4657")
  "sentinelStep":
   box(x,y,e.w,e.h,"#4e5266")
   box(x,y,e.w,2,"#c9c2ae")
   box(x+2,y+3,e.w-4,e.h-6,"#72748a")
   for c in range(3,int(e.w),6): box(x+c,y+5,2,max(1,e.h-10),"#3d4154")
   box(x+e.w/2-4,y+8,8,2,"#e0b58c")
   line(Vector2(x+e.w/2,y+12),Vector2(x+e.w/2,y+e.h-4),"#b0a9a1",2)
  "hookCarrier":
   line(origin+Vector2(e.ox+e.w/2,e.oy),origin+Vector2(e.ox+e.dx+e.w/2,e.oy+e.dy),"#596a83",1)
   box(x,y,e.w,e.h,"#55546b")
   box(x,y,e.w,2,"#c4b1d1")
   for c in range(3,int(e.w),6): box(x+c,y+3,2,2,"#d4c3a4")
  "ring":
   var center=Vector2(x+4,y+4)
   ink.draw_arc(center,3.2,0,TAU,16,Color("#b8d5da"),1.3)
   circle(center,5.5,Color(.5,.7,.9,.09))
   box(x+3,y-1,2,2,"#dacbb1")
  "zipline":
   var from=origin+Vector2(e.ax,e.ay)
   var to=origin+Vector2(e.bx,e.by)
   var col=Color("#c0b7ff") if e.state=="" else Color("#515371")
   line(from,to,Color(col,.3),1)
   for at in [from,to]:
    circle(at,4,Color(col,.12))
    line(at-Vector2(1,4),at+Vector2(1,4),col,1.5)
    line(at-Vector2(2,2),at+Vector2(2,2),col,1)
   if e.pulse>0: line(from,to,Color(col,.6),2)
  "mirror":
   box(x,y,8,8,"#4a5264")
   var from=Vector2(x+1,y+6 if e.slant=="/" else y+1)
   var to=Vector2(x+6,y+1 if e.slant=="/" else y+6)
   line(from,to,"#e1dceb",1.5)
   box(x+3,y+3,2,2,"#c1a678")
  "shutter":
   box(x,y,e.w,e.h,Color(.3,.35,.5,.16) if e.open else Color("#675970"))
   for r in range(1,int(e.h),4): line(Vector2(x,y+r),Vector2(x+e.w,y+r),"#79778e" if e.open else "#d6b88e",.6 if e.open else 1.3)
  "anvil":
   polygon([Vector2(x-2,y),Vector2(x+10,y),Vector2(x+8,y+3),Vector2(x+5,y+4),Vector2(x+6,y+7),Vector2(x+1,y+7),Vector2(x+2,y+4),Vector2(x,y+3)],"#9396b0")
   box(x-1,y,10,1,"#ebe0c3")
   box(x,y+7,8,1,"#4c5067")
  "feather":
   if e.timer>0: return
   var bob=sin(clock*2+x)
   line(Vector2(x+1,y+7+bob),Vector2(x+6,y+bob),"#d6edf0")
   for r in range(4): line(Vector2(x+2+r,y+6-r+bob),Vector2(x+1+r,y+3-r+bob),"#a8c4e2",1)
  "switch":
   box(x+2,y+4,4,4,"#aa8f6a")
   line(Vector2(x+4,y+4),Vector2(x+6,y-2),"#d4bb85",1.4)
  "cart":
   box(x,y,e.w,e.h,"#636078")
   box(x-1,y,e.w+2,2,"#c6b7a0")
   for c in [2,e.w-4]: circle(Vector2(x+c,y+e.h),2,"#b1adc5")
   line(Vector2(x+2,y+3),Vector2(x+e.w-2,y+3),"#444456")
  "void":
   box(x,y,e.w,e.h,"#171c36")
   for r in range(1,int(e.h),4): line(Vector2(x+1,y+r),Vector2(x+e.w-1,y+r),Color(.4,.4,.7,.25))
   ink.draw_rect(Rect2(x+.5,y+.5,e.w-1,e.h-1),Color("#9294c5"),false,.7)
  "prism":
   var center=Vector2(x+e.w/2,y+e.h/2)
   polygon([center+Vector2(0,-5),center+Vector2(5,0),center+Vector2(0,5),center+Vector2(-5,0)],"#82c3d0" if e.armed else "#566c84")
   line(center-Vector2(0,3),center+Vector2(0,3),"#e8d7ed")
   line(center+Vector2(-2,-1),center+Vector2(0,-3),"#e8d7ed")
   line(center+Vector2(0,3),center+Vector2(2,1),"#e8d7ed")
  "slide":
   # Sliding stones are live solids, including after they leave their map glyphs.
   box(x,y,e.w,e.h,"#55565b")
   box(x,y,e.w,2,"#d7ba83")
   box(x,y+e.h-2,e.w,2,"#353b43")
   for c in range(3,int(e.w)-2,8):
    box(x+c,y+3,2,2,"#b39b73")
    if e.h>9: box(x+c,y+e.h-5,2,2,"#9b8666")
   var center=Vector2(x+e.w/2,y+e.h/2)
   circle(center,min(4,e.h/2-1),"#343b43")
   if e.get("moving",false):
    var dir=Vector2(e.dirX,e.dirY)
    line(center-dir*2,center+dir*3,"#f3d296",1.3)
    line(center+dir*3,center+dir+Vector2(-dir.y,dir.x)*2,"#f3d296")
    line(center+dir*3,center+dir-Vector2(-dir.y,dir.x)*2,"#f3d296")
   else:
    box(center.x-1,center.y-1,2,2,"#d4b988")
  "recoilPlatform":
   var base=origin+Vector2(e.ox,e.oy+e.depth+7)
   for side in [3,e.w-5]:
    var start=Vector2(x+side,y+e.h)
    for k in range(5):
     line(start+Vector2(-2 if k%2==0 else 2,(base.y-start.y)*k/5),start+Vector2(2 if k%2==0 else -2,(base.y-start.y)*(k+1)/5),"#b19266")
   box(x,y,e.w,e.h,"#605a50")
   box(x,y,e.w,2,"#dab77a")
   for c in range(4,int(e.w),8): box(x+c,y+3,2,2,"#b29263")
  "hingeArm":
   box(x,y,e.w,e.h,"#73665b")
   box(x,y,e.w,1,"#bca37a")
   var hub=origin+Vector2(e.pivotX+4,e.pivotY+4)
   circle(hub,5,"#332e2c")
   circle(hub,3.5,"#edd099" if e.pulse>0 else ("#cd7c69" if e.jam>0 else "#b99865"))
   line(hub-Vector2(2,0),hub+Vector2(2,0),"#51473b")
  "combatGate","brittle":
   if e.open: return
   box(x,y,e.w,e.h,"#6d5e58" if e.type=="brittle" else "#414b55")
   for r in range(2,int(e.h),8): line(Vector2(x,y+r),Vector2(x+e.w,y+r),"#aa8f73")
   if e.type=="brittle":
    line(Vector2(x+e.w/2,y+2),Vector2(x+e.w/2-3,y+e.h/2),"#312c2d",1.5)
    line(Vector2(x+e.w/2-3,y+e.h/2),Vector2(x+e.w/2+2,y+e.h-2),"#312c2d",1.5)
  "zip":
   if world_data!=null and int(world_data.world.n)==1:
    Styles.lift(self,e,origin)
    return
   line(origin+Vector2(e.ox+e.w/2,e.oy),origin+Vector2(e.tx+e.w/2,e.ty),"#8c967e",0.7)
   box(x,y,e.w,e.h,"#53635e")
   box(x,y,e.w,2,"#c8b58a")
   for c in range(3,int(e.w)-2,7): circle(Vector2(x+c,y+e.h/2),1,"#a7a58b")
  "toggle":
   var col=Color("d7b46f") if e.phase==0 else Color("73b8b1")
   if not e.solid: col.a=0.22
   box(x,y,e.w,e.h,col.darkened(0.35))
   box(x,y,e.w,1,col)
   for c in range(2,int(e.w),5): box(x+c,y+2,1,min(3,e.h-2),col)
  "pod":
   var available=e.timer==0
   circle(Vector2(x+4,y+4),3.8,"#a5c9a4" if available else "#42634f")
   line(Vector2(x+2,y+1),Vector2(x+4,y+6),"#304c3d")
   line(Vector2(x+6,y+1),Vector2(x+4,y+6),"#304c3d")
   if available: box(x+3,y+2,2,2,"#e6edbb")
  "bell":
   line(Vector2(x+4,y-3),Vector2(x+4,y),"#b5a57a")
   polygon([Vector2(x+2,y+1),Vector2(x+6,y+1),Vector2(x+8,y+6),Vector2(x,y+6)],"#bb9d68")
   box(x+3,y+7,2,1,"#e4cc8d")
  "deck","foothold":
   box(x,y,e.w,e.h,"#58674e" if e.type=="foothold" else "#556d68")
   box(x,y,e.w,1,"#c0bc88")
   for c in range(3,int(e.w),8): box(x+c,y+2,2,2,"#9d9a73")
   if e.get("used",false): line(Vector2(x+e.w/2,y),Vector2(x+e.w/2-2,y+e.h),"#252e30")
  "spring":
   box(x,y+1,8,2,"#8b9984")
   box(x+1,y-1 if e.timer==0 else y,6,2,"#d4c995")
  "thru":
   box(x,y,e.w,1,"#b1b997")
   box(x,y+1,e.w,min(e.h-1,2),"#546b5a")
  "refill","shard","stone":
   if e.type=="refill" and e.timer>0: return
   var center = Vector2(x+4,y+4)
   var color = Color("d8bd81") if e.type=="stone" else (Color("b4dfe1") if e.type=="refill" else Color("d9b2cc"))
   if e.get("lit",false): color=Color("83aa82")
   if e.type!="stone":
    center.y += sin(clock*2+x)*0.8
    circle(center,6,Color(color,0.08))
   polygon([center+Vector2(0,-5),center+Vector2(5,0),center+Vector2(0,5),center+Vector2(-5,0)],"#354550")
   polygon([center+Vector2(0,-4),center+Vector2(4,0),center+Vector2(0,4),center+Vector2(-4,0)],color)
   polygon([center+Vector2(0,-4),center,center+Vector2(-4,0)],color.lightened(0.22))
   line(center,center+Vector2(0,3),color.darkened(.32),.8)
   box(center.x-1,center.y-2,1,1,"#f4f2da")
   if e.type=="stone":
    box(x,y+7,8,1,"#7b8079")
    box(x+3,y+3,2,2,"#f0dfaf")
   elif int(clock*3+x)%7==0:
    var sparkle=center+Vector2(6,-4)
    line(sparkle-Vector2(1,0),sparkle+Vector2(1,0),Color(color,.7),.6)
    line(sparkle-Vector2(0,1),sparkle+Vector2(0,1),Color(color,.7),.6)
  "lantern":
   Styles.lantern(self,Vector2(x,y))
  "plate":
   box(x-1,y-1,e.w+2,e.h+1,"#485959")
   box(x,y,e.w,e.h,"#9fc7a6" if e.get("down",false) else "#b9ac7f")
 if e.type in ["slide","zip","deck","foothold","crumble"]:
  line(Vector2(x+2,y+e.h-2),Vector2(x+e.w-2,y+e.h-2),"#343d48",.6)
  if e.w>=16:
   for edge in [3,e.w-4]: box(x+edge,y+2,1,1,"#d6d0b3")

func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 var preview=pose!=null
 var p=sim.p if not preview else pose
 var x=actor.x if not preview else at.x
 var y=actor.y if not preview else at.y
 var phase=walking if phase_override<0 else phase_override
 var face = p.facing
 if p.parryTimer>0:
  var aim=p.get("pressAim",{"x":face,"y":0})
  var angle=atan2(aim.y,aim.x) if aim.x!=0 or aim.y!=0 else (0.0 if face>0 else PI)
  ink.draw_arc(Vector2(x+4,y+5.5),13,angle-1.1,angle+1.1,16,Color("#d6f4ff"),1.5)
 var ready_color = Color("ffb347") if p.dashes>0 else Color("56708c")
 if knight_design>0:
  var flow=cape_flow if not preview and int(world_data.world.n)==1 else Vector2(INF,INF)
  KnightStyles.draw(self,p,Vector2(x,y),phase,knight_design,flow)
  draw_knight_attachments(p,Vector2(x,y))
  return
 var cloak=plume
 if preview:
  cloak=[Vector2(x+3,y+4)]
  var motion=clamp(abs(p.vx)/55.0,0,1)
  for i in range(1,7):
   cloak.append(cloak[-1]+Vector2(-p.facing*.25+sin(phase*.2-i*.6)*.15,1.25).lerp(Vector2(-p.facing*1.9,sin(phase*.4-i*.8)*.5-.15),motion))
 for i in range(1,cloak.size()):
  line(cloak[i-1],cloak[i],Color(ready_color,1-float(i)/10),max(.5,1.5-i*.15))
 # Default browser sprite (bladefall-pcore-view.js drawKnightSprite), at its 8 × 11 scale.
 var amount=0.0 if preview else squash*(.3 if reduced_motion else 1.0)
 var sy=1.0/(1.0+amount)
 var sx=1.0+amount
 if p.state=="dash" and not reduced_motion:
  sx+=.18*abs(p.dashDir.x)
  sy+=.18*abs(p.dashDir.y)
 var height=round(11*sy)
 var width=max(6,round(8*sx))
 var bx=x+4-width/2
 var by=y+11-height
 var body="#c05050" if p.get("tired",false) and int(sim.frame/4)%2==0 else "#2d4a78"
 var walking_now=p.onGround and p.state=="normal" and abs(p.vx)>10
 var cycle=phase/4.7
 for side in [-1,1]:
  var stride=sin(cycle+(.0 if side<0 else PI)) if walking_now else 0.0
  var offset=round(stride)
  var lift=0 if not walking_now else (round(max(0,-stride)*1))
  var foot=bx+(1 if side<0 else width-3)+offset
  box(foot,by+height-2-lift,2,2,"#1c2938")
  box(foot,by+height-2-lift,1,1,"#82909d")
 box(bx+1,by+4,width-2,height-6,body)
 box(bx+1,by+4,width-2,1,"#4a6aa0")
 box(bx+1,by+height-4,width-2,1,"#6b4e2a")
 box(bx if face>0 else bx+width-1,by+height-6,1,4,"#c9ced8")
 box(bx+1,by,width-2,5,"#b9c2cf")
 box(bx+1,by+4,width-2,1,"#7c8796")
 box(bx+width-4 if face>0 else bx+2,by+2,2,1,"#1a1f28")
 box(bx+width/2-1,by-2,2,2,ready_color)
 box(bx+1 if face>0 else bx+width-3,by+4,2,1,ready_color)
 if p.state=="climb":
  box(bx+width-1 if face>0 else bx,by+3,1,3,"#b9c2cf")
  box(x+1,y-5,6,1,"#263b45")
  box(x+1,y-5,6*clamp(p.stamina/110,0,1),1,"#d2c08b")
 elif p.vy< -20:
  box(bx if face>0 else bx+width-1,by+3,1,2,"#b9c2cf")
 draw_knight_attachments(p,Vector2(x,y))
func draw_knight_attachments(p,at):
 var x=at.x
 var y=at.y
 if p.strikeTimer>0:
  var aim=Vector2(p.strikeDir.x,p.strikeDir.y).normalized()
  var center=at+Vector2(4,5)
  var angle=aim.angle()+(float(p.strikeTimer)/5-.5)*1.5
  Styles.line(self,center,center+Vector2(cos(angle),sin(angle))*15,"#eee4c4",1.5)
 if p.carrying!=null:
  for side in [-1,1]: Styles.line(self,at+Vector2(4+side*3,5),at+Vector2(4+side*2.5,-3),"#b6c5ce",.6)
  Styles.lantern(self,at+Vector2(0,-8))
 if p.get("pollen",0)>0:
  for i in range(3):
   var at_petal=at+Vector2(4+cos(clock*2+i*2.1)*6,6+sin(clock*3+i*2.1)*4)
   circle(at_petal,.65,Color(.94,.97,.87,.65))

func build_shadows(d,origin,cols,rows):
 var used = {}
 for r in range(rows):
  for c in range(cols):
   if used.has(r*cols+c) or Room.glyph(d,c,r) not in ["#","%"]: continue
   var w = 0
   while c+w<cols and not used.has(r*cols+c+w) and Room.glyph(d,c+w,r) in ["#","%"]: w+=1
   var h = 1
   while r+h<rows:
    var fits = true
    for k in range(w):
     if used.has((r+h)*cols+c+k) or Room.glyph(d,c+k,r+h) not in ["#","%"]: fits=false;break
    if not fits: break
    h+=1
   for y in range(h):
    for k in range(w): used[(r+y)*cols+c+k]=true
   var shadow = LightOccluder2D.new()
   var shape = OccluderPolygon2D.new()
   var point = origin+Vector2(c*8,r*8)
   shape.polygon = PackedVector2Array([point,point+Vector2(w*8,0),point+Vector2(w*8,h*8),point+Vector2(0,h*8)])
   shadow.occluder = shape
   occluders.add_child(shadow)
   occluder_count += 1

func draw_woods():
 # Layered trunks keep the navigable foreground distinct from the forest depth.
 ink.draw_texture_rect(sky_gradient,Rect2(0,0,320,184),false)
 var moon=Vector2(fposmod(255-camera.x*0.018,380)-20,30-camera.y*0.012)
 circle(moon,16,Color("abb997"))
 circle(moon+Vector2(4,-1),14,Color("22382d"))
 for i in range(18):
  var x=fposmod(i*47.3+sin(clock*.3+i)*3-camera.x*.12,340)-10
  var y=40+fposmod(i*31.7-camera.y*.04,130)
  circle(Vector2(x,y),0.45,Color(.72,.83,.48,.12+sin(clock+i)*.08))
 for band in range(3):
  var y=95+band*27
  var x=fposmod(clock*.7-camera.x*.08+band*61,380)-40
  box(x,y,95,2,Color(.58,.71,.56,.025))

func draw_elsie_quest():
 if not runtime.elsie_met: return
 var point=Vector2.ZERO
 if runtime.quest_complete: return
 if runtime.quest_lantern: point=actor+Vector2(4,-6)
 else:
  var perch=runtime.data.quest.perches[runtime.elsie_perch]
  point=runtime.placements[perch.room]+Vector2(perch.x,perch.y)
 if not Rect2(camera-Vector2(20,20),Vector2(360,224)).has_point(point): return
 circle(point,9,Color(1,.8,.4,.08))
 Styles.lantern(self,point-Vector2(4,4))
 if not runtime.quest_lantern:
  for i in range(4):
   var at=point+Vector2(cos(clock*2+i*1.6)*7,sin(clock*2.7+i*1.6)*4)
   box(at.x-1,at.y,2,1,"#d9dfb5")

func draw_forest_layer(layer,node):
 ink=node
 var base=int(node.get_meta("base"))
 var spacing=31+layer*16
 var col=[Color("162d29"),Color("1e3930"),Color("294332")][layer]
 for i in range(-2,14):
  var seed=hash_at(i+base,layer)
  var x=i*spacing
  var width=3+seed%5+layer*2
  var top=5+seed%55
  box(x,top,width,200,col)
  if layer>0:
   for scar in range(4):
    var yy=top+17+scar*29+seed%11
    line(Vector2(x+1,yy),Vector2(x+width-1,yy-4),Color(col.lightened(.15),.6),.6)
    if scar%2==0: box(x+width-2,yy-8,1,2,Color(col.lightened(.22),.5))
  for branch in range(3):
   var yy=top+10+branch*24
   var side=1 if (seed+branch)%2 else -1
   line(Vector2(x+width/2,yy+10),Vector2(x+width/2+side*(12+seed%14),yy-5),col,2+layer)
   var reach=14+hash_at(i+base,branch+layer)%18
   polygon([Vector2(x-reach,yy-2),Vector2(x-reach+4,yy-8),Vector2(x-reach+1,yy-12),Vector2(x-7,yy-16),Vector2(x-3,yy-24-layer*2),Vector2(x+5,yy-21),Vector2(x+width+4,yy-25),Vector2(x+width+11,yy-15),Vector2(x+width+reach-4,yy-13),Vector2(x+width+reach,yy-5),Vector2(x+width+reach-7,yy+2)],col)
  if layer==2:
   line(Vector2(x+width-1,top+20),Vector2(x+width-1,top+100),Color("3c5340"),0.7)

func pixel_heart(point,color):
 for row in [[-4,-3,3],[1,-3,3],[-5,-2,10],[-5,-1,10],[-4,0,8],[-3,1,6],[-2,2,4],[-1,3,2]]:
  box(point.x+row[0],point.y+row[1],row[2],1,color)
 box(point.x-3,point.y-2,1,1,Color(1,1,1,color.a))
func draw_world_hearts():
 for reward in runtime.data.get("secretRewards",[])+runtime.data.get("branchRewards",[]):
  var point=runtime.placements[reward.room]+Vector2(reward.x,reward.y+sin(clock*3))
  if not Rect2(camera-Vector2(15,15),Vector2(350,214)).has_point(point): continue
  var taken=runtime.secret_hearts.has(reward.id) or runtime.branch_hearts.has(reward.id)
  var color=Color(reward.color)
  if taken: color.a=0.25
  else: circle(point,11,Color(color,0.08))
  pixel_heart(point,color)
  if not taken and not (runtime.branch_entered.get(reward.id,false) if reward.has("kind") else runtime.secret_front_entry): ink.draw_arc(point,8,0,TAU,24,Color(.8,.85,1,.5),0.7)

func draw_feel_world():
 for ring in rings:
  var t=1-ring.life/ring.max
  var radius=(5+t*22*ring.power)*(0.5 if reduced_motion else 1.0)
  var color=Color(ring.color,(1-t)*.55)
  if ring.kind=="impact":
   line(ring.p-Vector2(radius,0),ring.p+Vector2(radius,0),color,max(.5,1.5*(1-t)))
  else: ink.draw_arc(ring.p,radius,0,TAU,32,color,.8)
 if death_time>0:
  var t=1-death_time/.55
  circle(death_point,2+9*(1-t),Color(.9,.65,.7,(1-t)*.35))
 if respawn_time>0:
  var t=respawn_time/.6
  var point=actor+Vector2(4,5)
  circle(point,6+t*11,Color(accent,t*.09))
  if not reduced_motion:
   line(point+Vector2(0,-5-t*18),point+Vector2(0,5),Color(accent,t*.45),1)
func draw_award_screen():
 if award_time<0 or runtime==null: return
 var col=Color(runtime.award_color)
 var t=award_time
 var start=award_point-camera
 var destination=Vector2(285,10)
 var u=clamp((t-.95)/.85,0,1)
 var at=start.lerp(destination,u*u*(3-2*u))
 at.y-=sin(u*PI)*24 if not reduced_motion else 0
 if t<.95 and not reduced_motion: at.y-=sin(min(1,t/.4)*PI/2)*9
 var alpha=clamp((2.8-t)/.5,0,1)
 circle(at,13,Color(col,.12*alpha))
 if t<.95:
  for i in range(8):
   var angle=i*TAU/8+t*.5
   var radius=12+min(t,.6)*17
   line(at+Vector2(cos(angle),sin(angle))*radius,at+Vector2(cos(angle),sin(angle))*(radius+3),Color(col,(1-min(t/.95,1))*.8),1)
 var size=(1+.6*sin(min(t/.3,1)*PI)) if not reduced_motion and t<.3 else 1.0
 ink.draw_set_transform(at,0,Vector2.ONE*size)
 pixel_heart(Vector2.ZERO,Color(col,alpha))
 ink.draw_set_transform(Vector2.ZERO)
 if t>1.75:
  ink.draw_arc(destination,6+(t-1.75)*15,0,TAU,32,Color(col,alpha*.4),1)

func draw_causeway():
 ink.draw_texture_rect(sky_gradient,Rect2(0,0,320,184),false)
 circle(Vector2(245,39),18,Color(.92,.63,.38,.08))
 circle(Vector2(245,39),11,"#d2a579")
 for layer in range(3):
  var parallax=.06+layer*.075
  var pitch=76-layer*10
  var offset=fposmod(camera.x*parallax,pitch)
  for i in range(-1,7):
   var x=i*pitch-offset
   var y=88+layer*26-camera.y*.025
   var col=["#33343d","#444049","#55474a"][layer]
   box(x,y,9,110,col)
   box(x-2,y-5,pitch+4,5,col)
   # Arched viaduct piers and hanging iron chains over the mist.
   for k in range(8):
    var xx=x+9+k*(pitch-9)/8.0
    var depth=5+pow((k-3.5)/3.5,2)*16
    box(xx,y,(pitch-9)/8.0+1,depth,col)
   line(Vector2(x+4,y-5),Vector2(x+pitch-3,y-5),"#71605b",.7)
   if layer==2:
    for r in range(5):
     ink.draw_arc(Vector2(x+pitch/2,y+20+r*7),2,0,TAU,8,Color("6d5d56"),.7)
    line(Vector2(x+pitch/2,y-2),Vector2(x+pitch/2,y+18),"#74645c")
 for band in range(5):
  for i in range(7):
   var x=fposmod(i*63-clock*(2+band*.5)-camera.x*.1,400)-45
   box(x,107+band*18+sin(clock*.2+i)*2,62,3,Color(.83,.73,.65,.04))
func draw_hound(e,origin):
 var at=origin+Vector2(e.x,e.y)
 var col="#b88469" if e.flash>0 else ("#cd9a61" if e.state=="tell" else "#7f7067")
 box(at.x+2,at.y+1,e.w-4,e.h-4,col)
 for i in range(e.get("cracks",0)): line(at+Vector2(7+i*5,2),at+Vector2(9+i*5,e.h-4),"#e7bd7c",1.2)
 box(at.x+(e.w-4 if e.face>0 else -2),at.y,6,5,col)
 box(at.x+(e.w if e.face>0 else -1),at.y+1,1,1,"#f0ce87")
 for side in [2,11]:
  var stride=sin(clock*12+side)*1.5 if e.state=="attack" else 0
  box(at.x+side+stride,at.y+e.h-4,3,4,"#514e51")
 if e.state=="tell":
  box(at.x+7,at.y-7,1,4,"#f4d390")
  box(at.x+7,at.y-2,1,1,"#f4d390")
func draw_silas_quest():
 var sp=runtime.data.quest.tooth
 var point=runtime.placements[sp.room]+Vector2(sp.x,sp.y-4)
 if Rect2(camera-Vector2(20,20),Vector2(360,224)).has_point(point):
  var stopped=runtime.silas_step>=1
  var core=runtime.cores[sp.room]
  var angle=0.0 if stopped else core.frame*TAU/144
  var col=Color("#776953" if stopped else "#d0a85f")
  circle(point,6,col)
  for i in range(8):
   var a=angle+i*TAU/8
   var edge=point+Vector2(cos(a),sin(a))*8
   circle(edge,1.5,"#fff1b8" if i==7 and not stopped and core.frame%144<44 else col)
  circle(point,2,"#363436")
  if runtime.governor_flash>0: circle(point,9,Color(1,.7,.4,.25))
 sp=runtime.data.quest.hook
 point=runtime.placements[sp.room]+Vector2(sp.x,sp.y)
 if runtime.silas_step>=1:
  line(point+Vector2(-3,-8),point+Vector2(3,-8),"#bca477")
  line(point+Vector2(0,-8),point,"#bca477")
  if runtime.quest_complete: draw_key(point+Vector2(0,-3))
 if runtime.quest_key: draw_key(actor+Vector2(4-sim.p.facing*6,-2))
func draw_key(at):
 circle(at,2,"#e1b973")
 circle(at,1,"#544838")
 box(at.x,at.y+1,1,5,"#e1b973")
 box(at.x,at.y+4,3,1,"#e1b973")

func draw_region_devices(scene,origin,view):
 if runtime!=null and runtime.seam_closed.get(scene.room.id,false):
  for tile in runtime.seam_tiles[scene.room.id]:
   var at=Vector2(tile.point)*8
   if not view.has_point(at): continue
   if tile.closed==1:
    box(at.x,at.y,8,8,"#4a5262")
    box(at.x,at.y,8,1,"#b8adbf")
    line(at+Vector2(1,2),at+Vector2(6,7),"#343b4c")
   elif tile.closed>=3: draw_hazard(tile.closed,at)
 if scene.beams!=null:
  for beam in scene.beams.paths:
   var from=origin+Vector2(beam[0],scene.room.h-beam[1] if scene.flipped else beam[1])
   var to=origin+Vector2(beam[2],scene.room.h-beam[3] if scene.flipped else beam[3])
   line(from,to,Color(1,.82,.55,.13),4)
   line(from,to,"#ffe3a1",1.5)
 if scene.foes!=null:
  for foe in scene.foes:
   if not foe.alive: continue
   var at=origin+Vector2(foe.x+4,scene.room.h-foe.y-4 if scene.flipped else foe.y+4)
   if view.has_point(at):
    var flap=abs(sin(clock*13))*3
    polygon([at+Vector2(-5,-flap),at+Vector2(-1,3),at+Vector2(0,-2)],"#b6d7e1")
    polygon([at+Vector2(5,-flap),at+Vector2(1,3),at+Vector2(0,-2)],"#9ab8da")
    box(at.x,at.y-2,1,5,"#ddd9bd")
 if scene.sentinel!=null:
  var s=scene.sentinel
  var bell=origin+Vector2(s.c*8+4,s.r*8+4)
  if view.has_point(bell):
   circle(bell,7,Color(.9,.7,.4,.12))
   polygon([bell+Vector2(-3,-3),bell+Vector2(3,-3),bell+Vector2(5,3),bell+Vector2(-5,3)],"#9fc9bd" if s.done else "#e0bb81")
   box(bell.x-1,bell.y+4,2,2,"#f5dc9d")
  var t=int(s.t)%int(s.period)
  if not s.done and t>0 and t<30:
   if s.mode=="hammer":
    var at=origin+Vector2(s.target,s.land)
    line(Vector2(at.x,camera.y),at+Vector2(0,40),Color(1,.65,.5,.35),1)
    line(at-Vector2(14,0),at+Vector2(14,0),"#e7b6a0",1.5)
   else: line(origin+Vector2(s.from,s.ry+40),origin+Vector2(s.to,s.ry+40),"#d2a192",1.5)
 if scene.root_lash!=null:
  for lash in scene.root_lash.lashes:
   var at=origin+Vector2(lash.c0*8,lash.r0*8)
   var size=Vector2((lash.c1-lash.c0+1)*8,(lash.r1-lash.r0+1)*8)
   if not view.intersects(Rect2(at,size)): continue
   if lash.live:
    box(at.x,at.y,size.x,size.y,Color(.55,.25,.55,.14))
    for x in range(0,int(size.x),5):
     line(at+Vector2(x,0),at+Vector2(x+2,size.y),"#8e638e",1)
     polygon([at+Vector2(x,size.y-5),at+Vector2(x+2,size.y),at+Vector2(x+4,size.y-5)],"#db9fb1")
   elif lash.warn:
    for x in range(0,int(size.x),5): box(at.x+x,at.y+size.y-1,2,1,"#d6b8d2")
  var crown=scene.root_lash.crown
  if crown!=null:
   var at=origin+Vector2(crown.c*8+8,crown.r*8+8)
   if view.has_point(at):
    circle(at,8,"#4a4553" if crown.cut else "#667171")
    for i in range(5):
     var d=Vector2(cos(i*TAU/5),sin(i*TAU/5))
     line(at+d*4,at+d*10,"#6a5a73" if crown.cut else "#b9cebe",1.5)
    if not crown.cut: circle(at,3,"#dab4d2")
 if scene.oath_root!=null and not scene.oath_root.taken:
  var o=scene.oath_root
  var at=origin+Vector2(o.bladeC*8+4,o.bladeR*8)
  if view.has_point(at):
   box(at.x-1,at.y-10,2,11,"#d4e1ec" if o.released else "#7d8593")
   box(at.x-4,at.y-1,8,1,"#cfb58a")
   box(at.x,at.y,1,4,"#9c8d79")
   if o.released: circle(at,10,Color(.7,.7,.9,.12))
 if scene.portals!=null:
  for pt in scene.portals.values():
   if pt==null: continue
   var b=scene.PortalDevices.box(scene,pt)
   if scene.flipped: b.y=scene.room.h-b.y-b.h
   var at=origin+Vector2(b.x,b.y)
   var col=Color("#efa97d" if pt.color=="orange" else "#89bee9")
   box(at.x,at.y,b.w,b.h,"#141e34")
   ink.draw_rect(Rect2(at+Vector2(.6,.6),Vector2(b.w-1.2,b.h-1.2)),col,false,1)
 if sim==scene and sim.p.hook!=null:
  var ring=sim.p.hook.ring
  var at=origin+Vector2(ring.x+4,scene.room.h-ring.y-4 if scene.flipped else ring.y+4)
  line(at,actor+Vector2(4,4),"#a6c4ce",.8)
