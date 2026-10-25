extends Node2D
## Presentation is interpolated and layered; the integer simulation is never modified here.
const Room = preload("res://scripts/room_loader.gd")
var sim
var forest=false
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
var observed = {"bursts":0,"afterimages":0,"joins":0}
func _ready():
 forest=int(world_data.world.n)==2
 var sky=Image.create(1,184,false,Image.FORMAT_RGBA8)
 for y in range(184):
  sky.set_pixel(0,y,Color("0b191b").lerp(Color("344937"),float(y)/225) if forest else Color("101526").lerp(Color("53636a"),float(y)/200.0))
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
 material.direction = Vector3(-1,-0.08,0)
 material.spread = 12
 material.gravity = Vector3(0,-0.2,0)
 material.initial_velocity_min = 4
 material.initial_velocity_max = 9
 material.scale_min = 0.35
 material.scale_max = 0.6
 material.color = Color(0.8,0.85,0.82,0.28)
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
    if variant==15:
     if y<2: image.set_pixel(variant*8+x,y,Color("9d9c82") if y==0 else Color("4e5a62"))
     continue
    var color = Color("414651")
    var tint = float(variant%4)*0.012
    color = color.lightened(tint)
    if y==7 or x==7: color = Color("2b303c")
    elif y==0: color = Color("50555e")
    elif x==0: color = Color("343a46")
    if hash_at(x,y,variant)%17==0: color = color.lightened(0.08)
    if hash_at(x,y,variant+5)%23==0: color = color.darkened(0.13)
    if variant<4:
     if y==0: color = Color("a4a884") if (x+variant)%3!=0 else Color("899976")
     elif y==1: color = Color("6f825d") if (x+variant)%4!=0 else Color("8d996d")
     elif y==2 and (x+variant)%3==0: color = Color("657555")
    elif variant==8 and x==0: color = Color("808c86")
    elif variant==9 and x==7: color = Color("6a7880")
    elif variant==10 and y==7: color = Color("7a8581")
    if variant in [5,7,11] and x==((y+variant)%6)+1 and y in [3,4,5]: color = Color("2c3440")
    if variant>=16:
     color=Color("252e3a").lightened(float(variant-16)*0.012)
     if x==7 or y==7: color=Color("1b2430")
     elif y==0: color=color.lightened(0.035)
     if hash_at(x,y,variant)%19==0: color=color.lightened(0.04)
    if forest:
     color=Color(color.r*0.72,color.g*0.92,color.b*0.72,color.a)
    image.set_pixel(variant*8+x,y,color)
 var atlas = TileSetAtlasSource.new()
 atlas.texture = ImageTexture.create_from_image(image)
 atlas.texture_region_size = Vector2i(8,8)
 for x in range(20): atlas.create_tile(Vector2i(x,0))
 var result = TileSet.new()
 result.tile_size = Vector2i(8,8)
 result.add_source(atlas,0)
 return result
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
  for prop in d.get("decor",[]): decorations.append({"d":prop,"origin":origin})
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
  camera_float = Vector2(actor.x-153,actor.y-133) if runtime!=null else target_camera()
  camera = camera_float
  fade = 0.16
  trails.clear()
  particles.clear()
 else: observed.joins += 1
 queue_redraw()
func snap_actor():
 current_actor = active_position+Vector2(sim.p.x,sim.p.y)
 previous_actor = current_actor
 actor = current_actor
 plume.clear()
 for i in range(7): plume.append(actor+Vector2(3,4))
func before_tick():
 if sim==null: return {}
 previous_actor = current_actor
 var states = {}
 for e in sim.ents: states[entity_key(e)] = {"lit":e.get("lit",false),"open":e.get("open",false),"broken":e.get("broken",false),"solid":e.get("solid",true),"shaking":e.get("shaking",0),"down":e.get("down",false),"timer":e.get("timer",0),"state":e.get("state","idle"),"returning":e.get("returning",false),"gone":e.get("gone",false)}
 return {"entities":states,"frame":sim.frame}
func entity_key(e):
 return str(e.get("source_room", ""))+":"+str(e.get("source_id", e.id))
func after_tick(before):
 if before.is_empty() or before.frame==sim.frame: return []
 current_actor = active_position+Vector2(sim.p.x,sim.p.y)
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
 for type in sim.events: event_effect(type,current_actor+Vector2(4,9))
 return types
func event_effect(type,point):
 match type:
  "jump","walljump","climbhop": burst(point,6,Color("b8b8a1"),18)
  "land":
   squash = 0.15
   burst(point+Vector2(0,2),8,Color("b7b49a"),22)
  "dash":
   flash = 0.05
   burst(point,12,Color("edbd72"),35)
  "death":
   shake = 0.23
   flash = 0.08
   burst(point,28,Color("e8cbb3"),50)
  "respawn":
   fade = 0.12
   burst(point,18,Color("e7c887"),28)
  "refill","refill-dash","shard","stone-lit": burst(point,10,Color("d4e2b1"),24)
  "gate-open","held-open","crumble":
   shake = 0.12
   burst(point,14,Color("a6a28e"),24)
  "zip-start","zip-stop": burst(point,8,Color("dbbe83"),20)
func burst(point,count,color,speed):
 observed.bursts += 1
 for i in range(count):
  var a = float(i)*TAU/count+clock
  particles.append({"p":point,"v":Vector2(cos(a)*speed,sin(a)*speed*0.6-10),"life":0.3+float(i%4)*0.09,"max":0.57,"color":color})
func target_camera():
 var look=clamp(sim.p.vx*0.07,-13,13) if not reduced_motion else 0
 if runtime==null: return Vector2(max(0,actor.x-153+look),active_position.y+clamp(actor.y-active_position.y-94,0,max(0,sim.room.h-184)))
 # Ownership changes never change framing. Follow a world-space dead zone instead.
 var y=camera_float.y
 if actor.y-y<62: y=actor.y-62
 elif actor.y-y>136: y=actor.y-136
 return Vector2(actor.x-153+look,y)
func _process(delta):
 var profile_start=Time.get_ticks_usec()
 clock += delta
 if sim==null: return
 actor = previous_actor.lerp(current_actor,clamp(Engine.get_physics_interpolation_fraction(),0,1))
 if sim.p.state=="dead": actor=current_actor
 walking += abs(sim.p.vx)*delta
 camera_float = camera_float.lerp(target_camera(),1-exp(-delta*(12 if reduced_motion else 7)))
 var offset = Vector2.ZERO
 if shake>0 and not reduced_motion: offset=Vector2(sin(clock*97),cos(clock*83))*shake*4
 camera = (camera_float+offset).snapped(Vector2(0.5,0.5))
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
 ambient.color = Color("bcc2d2") if lit else Color.WHITE
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
 ambient_counter += delta
 if sim.p.state=="dash" and not reduced_motion and ambient_counter>0.025:
  ambient_counter=0
  trails.append({"p":actor,"life":0.18})
  observed.afterimages += 1
 if plume.size()==7:
  plume[0] = actor+Vector2(3,4)
  for i in range(1,7):
   var target = plume[i-1]+Vector2(-sim.p.facing*1.9,sin(clock*7-i*0.8)*0.5-0.15)
   plume[i] = plume[i].lerp(target,1-exp(-delta*23))
   var tether = plume[i]-plume[i-1]
   if tether.length()>2.2: plume[i] = plume[i-1]+tether.normalized()*2.2
 squash = max(0,squash-delta)
 shake = max(0,shake-delta)
 flash = max(0,flash-delta)
 fade = max(0,fade-delta)
 post.material.set_shader_parameter("strength",0.5 if reduced_motion else 1.0)
 queue_redraw()
 front.queue_redraw()
 draw_cpu_us.presentation=Time.get_ticks_usec()-profile_start
func box(x,y,w,h,color): ink.draw_rect(Rect2(x,y,w,h),Color(color) if color is String else color)
func line(a,b,color,width=1.0): ink.draw_line(a,b,Color(color) if color is String else color,width)
func polygon(points,color): ink.draw_colored_polygon(PackedVector2Array(points),Color(color) if color is String else color)
func circle(point,radius,color): ink.draw_circle(point,radius,Color(color) if color is String else color)
func _draw():
 var profile_start=Time.get_ticks_usec()
 ink = self
 if forest:
  draw_woods()
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
func draw_front():
 if sim==null: return
 var profile_start=Time.get_ticks_usec()
 ink = front
 ink.draw_set_transform(-camera)
 var view = Rect2(camera-Vector2(20,35),Vector2(360,235))
 for surface in surfaces:
  if not view.has_point(surface): continue
  var seed = hash_at(surface.x,surface.y)
  if seed%3==0:
   for i in range(2+seed%3):
    var x = surface.x+1+i*2
    var height = 2+(seed+i)%4
    var sway = sin(clock*1.6+x*0.11)*0.65
    line(Vector2(x,surface.y),Vector2(x+sway,surface.y-height),"#7c9165",0.7)
  if seed%7==0:
   box(surface.x+2,surface.y+2,3,1,"#6d795a")
 for item in decorations:
  var point = item.origin+Vector2(item.d.c*8,item.d.r*8+8)
  if view.has_point(point): draw_prop(item.d.k,point)
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
    if t>=3: draw_hazard(t,origin+Vector2(c*8,r*8))
  for e in scene.ents:
   if Rect2(origin+Vector2(e.x,e.y),Vector2(e.w,e.h)).grow(18).intersects(view): draw_entity(e,origin)
  for e in scene.sweepers:
   var point=origin+Vector2(e.x,e.y)
   circle(point,e.radius+2,Color(0.8,0.42,0.33,0.08))
   circle(point,e.radius,Color("935d5d"))
   circle(point,e.radius-1,Color("bf8980"))
   for i in range(8):
    var a=clock*1.8+i*TAU/8
    line(point+Vector2(cos(a),sin(a))*(e.radius-1),point+Vector2(cos(a),sin(a))*(e.radius+2),"#e0b09f",0.8)
 for trail in trails:
  var alpha = trail.life/0.18*0.3
  box(trail.p.x+1,trail.p.y,6,10,Color(0.88,0.77,0.51,alpha))
 for part in particles:
  var col = part.color
  col.a = clamp(part.life/part.max,0,1)*0.8
  box(part.p.x,part.p.y,1,1,col)
 if runtime!=null and forest:
  draw_elsie_quest()
  draw_world_hearts()
 if sim.p.state!="dead": draw_knight()
 ink.draw_set_transform(Vector2.ZERO)
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
func draw_prop(kind,point):
 var x = point.x
 var y = point.y
 match kind:
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
  "fern":
   for i in range(5):
    var tip=Vector2(x-6+i*3+sin(clock*1.1+x)*.5,y-4-abs(2-i)*1.5)
    line(Vector2(x,y),tip,"#8ca06b",.8)
    line(tip,tip+Vector2(-2,1),"#78925f",1)
  "roots":
   for i in range(4):
    line(Vector2(x+i*3,y-12),Vector2(x+i*4-4,y-3),"#66734f",1.5)
    line(Vector2(x+i*4-4,y-3),Vector2(x+i*6-8,y),"#7a8056",1)
  "trumpets":
   for i in range(4):
    var xx = x+i*2.8
    var sway = sin(clock*1.4+xx*0.12)*0.65
    line(Vector2(xx,y),Vector2(xx+sway,y-7-i%2),"#879572",0.8)
    box(xx+sway-1,y-8-i%2,3,1.3,"#e5dfbc")
    box(xx+sway,y-6-i%2,1,2,"#c7c79f")
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
 var x = point.x
 var y = point.y
 var phase = clock*1.6+x*.03
 var coat = {"vey":"#9b8665","mara":"#788d81","rowan":"#8a8571","olan":"#777b83","sentinel":"#7e8b83","orra":"#7c8a76","elsie":"#8c7964","hale":"#6e7b8b","pell":"#7d8064","bram":"#7c8879"}.get(who.who,"#7d887d")
 var sit = 3 if who.who in ["vey","rowan","hale"] else 0
 var move = sin(phase)*0.25
 box(x-3,y-1,12,1,Color(0.02,0.04,0.07,0.3))
 box(x-1,y-10+sit,7,8-sit,coat)
 box(x-1,y-2,2,2,"#34444b")
 box(x+4,y-2,3,2,"#34444b")
 box(x,y-15+sit+move,5,5,"#c7b296")
 box(x-1,y-17+sit+move,7,3,"#969a84")
 var face = who.get("face",1)
 box(x+(3 if face>0 else 0),y-13+sit,1,1,"#3c4544")
 if active and speaker==who.who and int(clock*6)%2==0: box(x+(3 if face>0 else 0),y-11+sit,1,1,"#5e534a")
 match who.who:
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
 var x = point.x
 var y = point.y
 if t==3:
  for i in range(2):
   var xx = x+1+i*4
   line(Vector2(xx,y+8),Vector2(xx,y+3),"#8d927d",0.8)
   polygon([Vector2(xx-1,y+6),Vector2(xx+1,y+2),Vector2(xx+3,y+6)],"#e5e0c6")
   box(xx,y+5,1,1,"#b3aa7b")
 elif t==4: polygon([Vector2(x,y),Vector2(x+4,y+6),Vector2(x+8,y)],"#d5d5c0")
 elif t==5: polygon([Vector2(x+8,y),Vector2(x+2,y+4),Vector2(x+8,y+8)],"#d5d5c0")
 else: polygon([Vector2(x,y),Vector2(x+6,y+4),Vector2(x,y+8)],"#d5d5c0")
func draw_entity(e,origin):
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
  "zip":
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
   polygon([center+Vector2(0,-4),center+Vector2(4,0),center+Vector2(0,4),center+Vector2(-4,0)],color)
   polygon([center+Vector2(0,-4),center,center+Vector2(-4,0)],color.lightened(0.22))
   if e.type=="stone": box(x+3,y+3,2,2,"#f0dfaf")
  "lantern":
   circle(Vector2(x+4,y+4),8,Color(1,.78,.4,.08))
   box(x+2,y,4,2,"#9c9d80")
   box(x,y+2,8,6,"#9a805a")
   box(x+2,y+3,4,4,"#f4d38b")
  "plate":
   box(x-1,y-1,e.w+2,e.h+1,"#485959")
   box(x,y,e.w,e.h,"#9fc7a6" if e.get("down",false) else "#b9ac7f")
func draw_knight():
 var p = sim.p
 var x = actor.x
 var y = actor.y
 var face = p.facing
 var ready_color = Color("ffb347") if p.dashes>0 else Color("56708c")
 for i in range(1,plume.size()):
  line(plume[i-1],plume[i],Color(ready_color,1-float(i)/10),max(0.5,1.5-i*.15))
 # Default browser sprite (bladefall-pcore-view.js drawKnightSprite), at its 8 × 11 scale.
 var sy=1.0/(1.0+squash)
 var sx=1.0+squash
 var height=round(11*sy)
 var width=max(6,round(8*sx))
 var bx=x+4-width/2
 var by=y+11-height
 var body="#c05050" if p.get("tired",false) and int(sim.frame/4)%2==0 else "#2d4a78"
 box(bx+1,by+height-2,2,2,"#1c2130")
 box(bx+width-3,by+height-2,2,2,"#1c2130")
 if p.onGround and abs(p.vx)>10:
  box(bx+(0 if int(walking/6)%2 else 2),by+height-1,2,1,"#1c2130")
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
 if p.strikeTimer>0:
  var aim = Vector2(p.strikeDir.x,p.strikeDir.y).normalized()
  var center = Vector2(x+4,y+5)
  var angle = aim.angle()+(float(p.strikeTimer)/5-.5)*1.5
  line(center,center+Vector2(cos(angle),sin(angle))*15,"#eee4c4",1.5)
 if p.carrying!=null:
  box(x,y-6,8,6,"#a38d61")
  box(x+2,y-5,4,4,"#f4d38b")

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
 box(point.x-2,point.y-3,4,6,"#b79d68")
 box(point.x-1,point.y-2,2,4,"#ffe6a2")
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
 for reward in runtime.data.get("secretRewards",[]):
  var point=runtime.placements[reward.room]+Vector2(reward.x,reward.y+sin(clock*3))
  if not Rect2(camera-Vector2(15,15),Vector2(350,214)).has_point(point): continue
  var taken=runtime.secret_hearts.has(reward.id)
  var color=Color(reward.color)
  if taken: color.a=0.25
  else: circle(point,11,Color(color,0.08))
  pixel_heart(point,color)
  if not taken and not runtime.secret_front_entry: ink.draw_arc(point,8,0,TAU,24,Color(.8,.85,1,.5),0.7)
 var age=(runtime.frames-runtime.quest_award_frame)/60.0
 if age>=0 and age<3:
  var u=clamp((age-0.6)/1.0,0,1)
  var at=(actor+Vector2(4,-10)).lerp(camera+Vector2(285,10),1-pow(1-u,3))
  pixel_heart(at,Color(runtime.award_color))
