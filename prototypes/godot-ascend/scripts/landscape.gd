extends Node2D
## Presentation is interpolated and layered; the integer simulation is never modified here.
const Room = preload("res://scripts/room_loader.gd")
var sim
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
 var image = Image.create(128,8,false,Image.FORMAT_RGBA8)
 image.fill(Color.TRANSPARENT)
 for variant in range(16):
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
    image.set_pixel(variant*8+x,y,color)
 var atlas = TileSetAtlasSource.new()
 atlas.texture = ImageTexture.create_from_image(image)
 atlas.texture_region_size = Vector2i(8,8)
 for x in range(16): atlas.create_tile(Vector2i(x,0))
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
  if item.d.k=="watchfire":
   var position_in_world = item.origin+Vector2(item.d.c*8+4,item.d.r*8+7)
   if not fires.any(func(f):return f.distance_to(position_in_world)<16): fires.append(position_in_world)
func make_lights():
 var image = Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var distance = Vector2(x-64,y-64).length()/64.0
   image.set_pixel(x,y,Color(1,0.75,0.46,pow(max(0,1-distance),2)))
 var texture = ImageTexture.create_from_image(image)
 for point in fires:
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
  camera_float = target_camera()
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
 var states = []
 for e in sim.ents: states.append({"lit":e.get("lit",false),"open":e.get("open",false),"broken":e.get("broken",false),"solid":e.get("solid",true),"shaking":e.get("shaking",0),"down":e.get("down",false),"timer":e.timer,"state":e.state,"returning":e.get("returning",false),"gone":e.get("gone",false)})
 return {"entities":states,"frame":sim.frame}
func after_tick(before):
 if before.is_empty() or before.frame==sim.frame: return []
 current_actor = active_position+Vector2(sim.p.x,sim.p.y)
 if previous_actor.distance_to(current_actor)>55 or "respawn" in sim.events: snap_actor()
 var types = sim.events.duplicate()
 for i in range(sim.ents.size()):
  var e = sim.ents[i]
  var old = before.entities[i]
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
 var look = clamp(sim.p.vx*0.07,-13,13) if not reduced_motion else 0
 return Vector2(max(0,actor.x-153+look),active_position.y+clamp(actor.y-active_position.y-94,0,max(0,sim.room.h-184)))
func _process(delta):
 clock += delta
 if sim==null: return
 actor = previous_actor.lerp(current_actor,clamp(Engine.get_physics_interpolation_fraction(),0,1))
 if sim.p.state=="dead": actor=current_actor
 walking += abs(sim.p.vx)*delta
 camera_float = camera_float.lerp(target_camera(),1-exp(-delta*(12 if reduced_motion else 7)))
 var offset = Vector2.ZERO
 if shake>0 and not reduced_motion: offset=Vector2(sin(clock*97),cos(clock*83))*shake*4
 camera = (camera_float+offset).snapped(Vector2(0.5,0.5))
 tiles.position = -camera
 occluders.position = -camera
 ambient.color = Color("bcc2d2") if lit else Color.WHITE
 wind.emitting = not reduced_motion
 for item in lights:
  var point = item.point-camera
  var visible_now = Rect2(-70,-60,460,320).has_point(point)
  item.node.visible = lit and visible_now
  item.node.position = point-Vector2(0,5)
  item.node.energy = 1.45+sin(clock*9+item.point.x)*0.07
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
  plume[0] = actor+Vector2(3,3)
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
func box(x,y,w,h,color): ink.draw_rect(Rect2(x,y,w,h),Color(color) if color is String else color)
func line(a,b,color,width=1.0): ink.draw_line(a,b,Color(color) if color is String else color,width)
func polygon(points,color): ink.draw_colored_polygon(PackedVector2Array(points),Color(color) if color is String else color)
func circle(point,radius,color): ink.draw_circle(point,radius,Color(color) if color is String else color)
func _draw():
 ink = self
 for y in range(184):
  line(Vector2(0,y),Vector2(320,y),Color("101526").lerp(Color("53636a"),float(y)/200.0))
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
func draw_front():
 if sim==null: return
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
 # Active hazards and machinery preserve the exact original geometry.
 for r in range(int(sim.room.rows)):
  for c in range(int(sim.room.cols)):
   var t = sim.tile(c,r)
   if t>=3: draw_hazard(t,active_position+Vector2(c*8,r*8))
 for e in sim.ents: draw_entity(e,active_position)
 for e in sim.sweepers:
  var point = active_position+Vector2(e.x,e.y)
  circle(point,e.radius+2,Color(0.8,0.42,0.33,0.08))
  circle(point,e.radius,Color("935d5d"))
  circle(point,e.radius-1,Color("bf8980"))
  for i in range(8):
   var a = clock*1.8+i*TAU/8
   line(point+Vector2(cos(a),sin(a))*(e.radius-1),point+Vector2(cos(a),sin(a))*(e.radius+2),"#e0b09f",0.8)
 for trail in trails:
  var alpha = trail.life/0.18*0.3
  box(trail.p.x+1,trail.p.y,6,10,Color(0.88,0.77,0.51,alpha))
 for part in particles:
  var col = part.color
  col.a = clamp(part.life/part.max,0,1)*0.8
  box(part.p.x,part.p.y,1,1,col)
 if sim.p.state!="dead": draw_knight()
 ink.draw_set_transform(Vector2.ZERO)
 if flash>0 and not reduced_motion: box(0,0,320,184,Color(0.92,0.85,0.65,flash*0.7))
 if fade>0: box(0,0,320,184,Color(0.03,0.05,0.08,fade*2.5))
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
  "tent":
   polygon([Vector2(x-8,y),Vector2(x+9,y-22),Vector2(x+31,y)],"#777b64")
   polygon([Vector2(x+10,y),Vector2(x+9,y-22),Vector2(x+31,y)],"#4e5b52")
   polygon([Vector2(x+5,y),Vector2(x+9,y-19),Vector2(x+19,y)],"#283a40")
   line(Vector2(x-8,y),Vector2(x+9,y-22),"#b5ad86")
   line(Vector2(x+31,y),Vector2(x+36,y),"#7c7863")
   line(Vector2(x-8,y),Vector2(x-13,y),"#7c7863")
   box(x+20,y-3,6,3,"#6b5a42")
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
 var coat = {"vey":"#9b8665","mara":"#788d81","rowan":"#8a8571","olan":"#777b83","sentinel":"#7e8b83","orra":"#7c8a76"}.get(who.who,"#7d887d")
 var sit = 3 if who.who in ["vey","rowan"] else 0
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
   if e.get("open",false) or e.type=="held" and not e.solid: return
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
 var ready_color = Color("eeb46a") if p.dashes>0 else Color("667f94")
 for i in range(1,plume.size()):
  line(plume[i-1],plume[i],Color(ready_color,1-float(i)/10),max(0.5,2.5-i*.28))
 var run = sin(walking*0.15)
 var bob = abs(run)*0.45 if p.onGround and abs(p.vx)>20 else sin(clock*2)*0.1
 var crouch = squash*2
 # Silhouette shadow, two-tone armour, moving feet and a breathing idle.
 if p.onGround: box(x-1,y+10,10,1,Color(0.01,.03,.05,.2))
 box(x+1,y+4+bob+crouch,6,5-crouch,"#53647e")
 box(x+1,y+4+bob,2,5,"#7b8d9c")
 box(x+5,y+5+bob,2,4,"#35465c")
 var leg = run*0.8 if p.onGround and abs(p.vx)>10 else (1 if not p.onGround else 0)
 box(x+1+leg,y+9,2,2,"#354052")
 box(x+5-leg,y+9-(0.5 if not p.onGround else 0),2,2,"#354052")
 box(x+1,y+bob+crouch,6,5,"#c8d1cd")
 box(x,y+1+bob+crouch,8,3,"#e1e3d3")
 box(x+1,y+1+bob+crouch,1,2,"#f2edda")
 box(x+(5 if face>0 else 1),y+2+bob+crouch,2,1,"#344353")
 box(x+3,y+4+bob+crouch,3,1,"#9ba9ab")
 if p.state=="climb":
  box(x+(7 if face>0 else -1),y+2,2,3,"#aebdbb")
  box(x+1,y-5,6,1,"#263b45")
  box(x+1,y-5,6*clamp(p.stamina/110,0,1),1,"#d2c08b")
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
