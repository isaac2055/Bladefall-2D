extends Node2D
## Pixel canvas plus genuine Godot tile layers and lights. Presentation never affects simulation.
var sim
var world_data
var placements = {}
var active_position = Vector2.ZERO
var tiles: TileMapLayer
var light: PointLight2D
var ambient: CanvasModulate
var lit = true
var clock = 0.0
var camera = Vector2.ZERO
var tile_set: TileSet
func _ready():
 texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
 var sections = world_data.world.sections.duplicate(true)
 for q in world_data.world.quests: sections.append_array(q.sections)
 for q in world_data.world.get("secrets",[]): sections.append_array(q.sections)
 sections.append_array(world_data.world.get("passages",[]))
 for s in sections: placements[s.room] = Vector2(s.x*8,s.y*8)
 tile_set = make_tiles()
 tiles = TileMapLayer.new()
 tiles.tile_set = tile_set
 add_child(tiles)
 ambient = CanvasModulate.new()
 ambient.color = Color("9ba6b8")
 add_child(ambient)
 light = PointLight2D.new()
 var image = Image.create(128,128,false,Image.FORMAT_RGBA8)
 for y in range(128):
  for x in range(128):
   var distance = Vector2(x-64,y-64).length()/64.0
   image.set_pixel(x,y,Color(1,0.61,0.28,pow(max(0,1-distance),2)*0.9))
 light.texture = ImageTexture.create_from_image(image)
 light.energy = 1.7
 add_child(light)
func load_scene(core):
 sim = core
 active_position = placements.get(sim.room.id,Vector2.ZERO)
 tiles.clear()
 for definition in world_data.world.rooms:
  var position_in_world = placements.get(definition.id,Vector2.ZERO)
  var cols = int(definition.get("cols",40))
  var rows = int(definition.get("rows",23))
  for r in range(rows):
   for c in range(cols):
    var ch = AscendRoomLoader.glyph(definition,c,r)
    var cell = Vector2i(c,r)+Vector2i(position_in_world/8)
    if ch in ["#","%"]:
     var above = AscendRoomLoader.glyph(definition,c,r-1) if r>0 else "#"
     tiles.set_cell(cell,0,Vector2i(1 if above in ["#","%"] else 0,0))
    elif ch=="=": tiles.set_cell(cell,0,Vector2i(2,0))
 camera = Vector2.ZERO
 queue_redraw()
func make_tiles():
 var img = Image.create(24,8,false,Image.FORMAT_RGBA8)
 img.fill(Color.TRANSPARENT)
 for variant in range(2):
  for y in range(8):
   for x in range(8):
    var color = Color("303b43") if variant==1 else Color("46534d")
    if y==0 and variant==0: color = Color("a5af7a")
    elif y<2 and variant==0: color = Color("6f8556")
    elif x==0 or y==7: color = Color("25333b")
    elif (x*3+y*7)%13==0: color = Color("56605b")
    img.set_pixel(variant*8+x,y,color)
 for y in range(2):
  for x in range(8): img.set_pixel(16+x,y,Color("94936c") if y==0 else Color("485a5e"))
 var atlas = TileSetAtlasSource.new()
 atlas.texture = ImageTexture.create_from_image(img)
 atlas.texture_region_size = Vector2i(8,8)
 for x in range(3): atlas.create_tile(Vector2i(x,0))
 var result = TileSet.new()
 result.tile_size = Vector2i(8,8)
 result.add_source(atlas,0)
 return result
func _process(delta):
 clock += delta
 if sim==null: return
 camera = Vector2(floor(max(0,active_position.x+sim.p.x-156)),floor(active_position.y+clamp(sim.p.y-96,0,max(0,sim.room.h-184))))
 tiles.position = -camera
 ambient.color = Color("9ba6b8") if lit else Color.WHITE
 light.enabled = lit
 var fire = sim.room.def.get("decor",[]).filter(func(d):return d.k=="watchfire")
 light.position = active_position + (Vector2(fire[0].c*8+4,fire[0].r*8-3) if not fire.is_empty() else Vector2(sim.p.x+4,sim.p.y+3))-camera
 light.energy = 1.7+sin(clock*12)*0.12
 queue_redraw()
func box(x,y,w,h,color): draw_rect(Rect2(x,y,w,h),Color(color))
func _draw():
 # A restrained Outskirts palette: cool sky, distant watchtowers, warm roadside fires.
 for y in range(184):
  draw_line(Vector2(0,y),Vector2(320,y),Color("0d1721").lerp(Color("4f6870"),float(y)/184))
 draw_circle(Vector2(249,37),14,Color("d0d3b0"))
 draw_circle(Vector2(253,34),13,Color("465d69"))
 for layer in range(3):
  var offset = camera.x*(0.08+layer*0.06)
  for i in range(-1,12):
   var x = i*39-fmod(offset,39)
   var top = 75+layer*12+sin(i*4.1+layer)*16
   draw_colored_polygon(PackedVector2Array([Vector2(x-13,184),Vector2(x+9,top),Vector2(x+26,top+11),Vector2(x+54,184)]),Color("1e303c") if layer==0 else (Color("293e48") if layer==1 else Color("354c53")))
 for i in range(7):
  var x = i*63-fmod(camera.x*0.15,63)
  box(x,88,9,63,"293c46")
  box(x-2,84,13,5,"30434b")
  for j in range(3): box(x-2+j*5,81,3,4,"30434b")
  box(x+3,96,2,5,"647775")
 if sim==null: return
 # All world geometry is represented by the native TileMapLayer above this backdrop.
 draw_set_transform(active_position-camera)
 for d in sim.room.def.get("decor",[]):
  var x = d.c*8
  var y = d.r*8
  if d.k=="watchfire":
   box(x-3,y-1,15,2,"654d36")
   for i in range(4):
    var h = 5+int(abs(sin(clock*7+i*2))*7)
    box(x+i*2,y-h,3,h,"e99b46")
    box(x+i*2,y-h+3,2,max(1,h-3),"f5d77d")
  elif d.k=="tent":
   draw_colored_polygon(PackedVector2Array([Vector2(x-5,y+8),Vector2(x+9,y-14),Vector2(x+26,y+8)]),Color("71745a"))
   draw_colored_polygon(PackedVector2Array([Vector2(x+8,y+8),Vector2(x+9,y-11),Vector2(x+18,y+8)]),Color("28353b"))
   box(x-5,y+8,31,2,"404c43")
  elif d.k=="trumpets":
   for j in range(4):
    var xx = x+j*3
    box(xx,y-3-j%2,1,11,"85916a")
    box(xx-1,y-4-j%2,3,2,"e5dfb5")
 for person in sim.room.def.get("people",[]):
  var x = person.c*8
  var y = person.r*8+8
  box(x-1,y-10,7,8,"77785f")
  box(x,y-14,5,5,"c6a98a")
  box(x-1,y-16,7,3,"8e9178")
  box(x+7,y-15,1,16,"b3b4a0")
 for r in range(int(sim.room.rows)):
  for c in range(int(sim.room.cols)):
   var t = sim.tile(c,r)
   if t>=3:
    var x = c*8
    var y = r*8
    var points = [Vector2(x,y+8),Vector2(x+4,y+2),Vector2(x+8,y+8)]
    if t==4: points = [Vector2(x,y),Vector2(x+4,y+6),Vector2(x+8,y)]
    elif t==5: points = [Vector2(x+8,y),Vector2(x+2,y+4),Vector2(x+8,y+8)]
    elif t==6: points = [Vector2(x,y),Vector2(x+6,y+4),Vector2(x,y+8)]
    draw_colored_polygon(PackedVector2Array(points),Color("e6dfbe"))
 for e in sim.ents:
  if e.get("gone",false) or e.get("broken",false) or e.get("held",false): continue
  match e.type:
   "gate","held":
    if e.get("open",false) or e.type=="held" and not e.solid: continue
    box(e.x,e.y,e.w,e.h,"53605c")
    for x in range(int(e.x),int(e.x+e.w),4): box(x,e.y,1,e.h,"a6ac84")
   "crumble":
    box(e.x,e.y,e.w,e.h,"6e7160")
    box(e.x,e.y,e.w,1,"c3bb8c")
    for x in range(int(e.x)+3,int(e.x+e.w),7): box(x,e.y+2,1,e.h-2,"354345")
   "zip":
    draw_line(Vector2(e.ox+e.w/2,e.oy),Vector2(e.tx+e.w/2,e.ty),Color("9c9b7a"),1)
    box(e.x,e.y,e.w,e.h,"56625b")
    box(e.x,e.y,e.w,2,"d8bb7c")
   "refill","shard","stone":
    if e.type=="refill" and e.timer>0: continue
    var color = Color("e8c878") if e.type=="stone" else (Color("a6e3d8") if e.type=="refill" else Color("cfa5c0"))
    if e.get("lit",false): color = Color("75966d")
    draw_colored_polygon(PackedVector2Array([Vector2(e.x+4,e.y),Vector2(e.x+8,e.y+4),Vector2(e.x+4,e.y+8),Vector2(e.x,e.y+4)]),color)
    box(e.x+3,e.y+2,2,2,"f4edcf")
   "lantern":
    box(e.x+2,e.y,4,2,"c8bc84")
    box(e.x,e.y+2,8,6,"c9a363")
    box(e.x+2,e.y+3,4,4,"f0dda2")
   "plate": box(e.x,e.y,e.w,e.h,"89bfa7" if e.get("down",false) else "bcab77")
 for e in sim.sweepers:
  draw_circle(Vector2(e.x,e.y),e.radius,Color("bf756c"))
  for i in range(6):
   var a = clock*2+i*TAU/6
   draw_line(Vector2(e.x,e.y),Vector2(e.x+cos(a)*(e.radius+3),e.y+sin(a)*(e.radius+3)),Color("e1b1a3"))
 var p = sim.p
 if p.state!="dead":
  var x = p.x
  var y = p.y
  # The familiar pale helmet and indigo scarf, at the original 8 x 11 collision size.
  var scarf = -p.facing
  for i in range(4): box(x+3+scarf*(4+i*2),y+4+int(sin(clock*10+i)*1.3),3,2,"7286b8")
  box(x+1,y+4,6,6,"454c67")
  box(x+1,y,6,5,"d9dfd2")
  box(x,y+1,8,3,"e8e7d5")
  box(x+(5 if p.facing>0 else 1),y+2,2,1,"303d48")
  box(x+1,y+9,2,2,"272f42")
  box(x+5,y+9,2,2,"272f42")
  if p.carrying!=null:
   box(x,y-6,8,6,"c9a363")
   box(x+2,y-5,4,4,"f0dda2")
 draw_set_transform(Vector2.ZERO)
