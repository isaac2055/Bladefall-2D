extends "res://scripts/challenge_landscape.gd"
## The approved B/C-side machinery, with Felix's familiar small body and a darker night palette.
const FelixBody=preload("res://scripts/felix_body.gd")
var body=FelixBody.new()
var riding=false
var gift_pulse=0.0
var felix_story=null
func _ready():
 super._ready()
 ambient.color=Color(.72,.76,.9)
func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 if felix_story==null: return
 var center=body.draw(self,felix_story.gifts)
 var home=home_world()
 if home==2:
  ink.draw_texture_rect(preload("res://art/woods/helmet.png"),Rect2((center+Vector2(-4,-10)).round(),Vector2(9,9)),false,ink_color)
 elif home==3:
  ink.draw_texture(preload("res://art/phantom/hood.png"),(center+Vector2(-5,-8)).round(),ink_color)
  ink.draw_texture(preload("res://art/phantom/mask.png"),(center+Vector2(-4,-2)).round(),ink_color)
 if home in [2,3]:
  var p=body.pose(self)
  var aim=Vector2(p.facing*5,-3)
  if p.get("strikeTimer",0)>0:
   var dir=p.get("strikeDir",{"x":p.facing,"y":0})
   aim=Vector2(dir.x,dir.y).normalized()*7
  ink.draw_set_transform_matrix(paint_transform*Transform2D(aim.angle(),(center+Vector2(p.facing*3.6,1.4)).round()))
  ink.draw_texture_rect(preload("res://art/woods/sword.png") if home==2 else preload("res://art/phantom/dagger.png"),Rect2(-2,-2,aim.length()+3,5),false,ink_color)
  ink.draw_set_transform_matrix(paint_transform)

func home_world():
 var n=int(world_data.world.n)
 return n-100 if n>=101 else n-20
func make_tiles():
 if home_world()==3: return super.make_tiles()
 var atlas=TileSetAtlasSource.new()
 atlas.texture={1:preload("res://art/tiles/bedroom.png"),2:preload("res://art/woods/terrain.png")}[home_world()]
 atlas.texture_region_size=Vector2i(8,8)
 for x in range(20): atlas.create_tile(Vector2i(x,0))
 var result=TileSet.new()
 result.tile_size=Vector2i(8,8)
 result.add_source(atlas,0)
 return result
func _draw():
 if world_data==null or home_world()!=1:
  super._draw()
  return
 ink=self
 draw_rect(Rect2(0,0,320,184),Color("#101420"))
 draw_set_transform(-camera)
 var wallpaper=preload("res://art/room/wallpaper.png")
 for y in range(floori(camera.y/88)-1,ceili((camera.y+184)/88)+1):
  for x in range(floori(camera.x/88)-1,ceili((camera.x+320)/88)+1):
   draw_texture(wallpaper,Vector2(x*88,y*88),Color(.7,.7,.88))
 # The familiar room becomes a quiet, empty night version, with the same playable silhouettes.
 for id in runtime.nearby(Rect2(camera,Vector2(320,184))):
  var room=runtime.rectangles[id]
  var box_at=room.position+Vector2(40,room.size.y-100)
  if Rect2(box_at,Vector2(80,80)).intersects(Rect2(camera,Vector2(320,184))):
   draw_texture_rect(preload("res://art/room/box.png"),Rect2(box_at,Vector2(80,80)),false,Color(.5,.5,.65))
 draw_set_transform(Vector2.ZERO)

var room_material={}
func solid_at(cell): return runtime.cells.get(cell,0)==1
func build_terrain():
 if home_world()!=1:
  super.build_terrain()
  return
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
