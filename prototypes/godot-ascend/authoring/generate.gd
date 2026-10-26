extends SceneTree
const WorldNode=preload("res://authoring/world.gd")
const RoomNode=preload("res://authoring/room.gd")
const Item=preload("res://authoring/item.gd")
const Codec=preload("res://authoring/codec.gd")
const Layout=preload("res://scripts/world_layout.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Core=preload("res://scripts/core.gd")
var errors=0
func _initialize(): run.call_deferred()
func owned(parent,node,root_node):
 parent.add_child(node,true)
 node.owner=root_node
 return node
func handle(parent,kind,label,at,params,root_node):
 var node=Item.new()
 node.name=label.validate_node_name()
 node.kind=kind
 node.position=at
 node.original_position=at
 node.parameters=params.duplicate(true)
 node.world_number=root_node.world_number
 node.set_meta("_edit_group_",true)
 owned(parent,node,root_node)
 var hit=Sprite2D.new()
 hit.name="Selection"
 var image=Image.create(8,8,false,Image.FORMAT_RGBA8)
 image.fill(Color.WHITE)
 hit.texture=ImageTexture.create_from_image(image)
 hit.modulate=Color(1,1,1,.025)
 var bounds=Rect2(0,0,8,8)
 if kind=="Prop": bounds=Rect2(-8,-40,38,40)
 elif kind=="NPC": bounds=Rect2(-8,-22,28,22)
 elif kind=="Bunny": bounds=Rect2(-7,-7,14,14)
 elif kind=="Mechanism": bounds=Rect2(-5,-5,10,10)
 hit.position=bounds.get_center()
 hit.scale=bounds.size/8
 hit.show_behind_parent=true
 owned(node,hit,root_node)
 return node
func curve(node,points,root_node):
 var path=Path2D.new()
 path.name="MotionPath"
 path.curve=Curve2D.new()
 for point in points: path.curve.add_point(point-node.position)
 owned(node,path,root_node)
func tileset(number):
 var glyphs="#%=^v<>-()I{}ABKZGHM~VXQCYocbxs*l_Nf/\\OkP"
 var image=Image.create(glyphs.length()*8,8,false,Image.FORMAT_RGBA8)
 image.fill(Color.TRANSPARENT)
 for i in range(glyphs.length()):
  var ch=glyphs[i]
  for y in range(8):
   for x in range(8):
    var col=Color.TRANSPARENT
    if ch in "#%": col=Color("#526b61" if number in [2,22] else "#626c78").lightened(.08 if y==0 or x==0 else -.04 if (x+y)%5==0 else 0)
    elif ch=="=": col=Color("#baab87") if y<2 else Color.TRANSPARENT
    elif ch in "^v<>":
     var a=x if ch in "^v" else y
     var b=y if ch in "^v" else x
     if ch in "v>": b=7-b
     if abs(a-3.5)<=b*.5: col=Color("#e6c8cb")
    else:
     if x==0 or y==0 or x==7 or y==7 or x==y: col=Color.from_hsv(float(i)/glyphs.length(),.4,.9,.8)
    image.set_pixel(i*8+x,y,col)
 var atlas=TileSetAtlasSource.new()
 atlas.texture=ImageTexture.create_from_image(image)
 atlas.texture_region_size=Vector2i(8,8)
 var result=TileSet.new()
 result.tile_size=Vector2i(8,8)
 result.add_custom_data_layer()
 result.set_custom_data_layer_name(0,"glyph")
 result.set_custom_data_layer_type(0,TYPE_STRING)
 result.add_source(atlas,0)
 for i in range(glyphs.length()):
  atlas.create_tile(Vector2i(i,0))
  atlas.get_tile_data(Vector2i(i,0),0).set_custom_data("glyph",glyphs[i])
 return result
func spatial(d):
 if not d is Dictionary: return false
 return d.has("c") and d.has("r") or d.has("x") and d.has("y") or d.has("a") and d.has("b") and d.a is Array and d.b is Array
func mechanism_position(d,field):
 if d.has("c") and d.has("r"): return Vector2(d.c*8,d.r*8)
 if d.has("x") and d.has("y"): return Vector2(d.x,d.y)*(8 if field=="foes" else 1)
 return Vector2(d.a[0],d.a[1])*8
func mechanisms(value,path,room,root_node):
 if value is Array and not value.is_empty() and value.all(spatial):
  room.array_fields.append(path)
  Codec.set_nested(room.settings,path,[])
  for i in range(value.size()): mechanism(value[i],path,true,room,root_node,i)
 elif value is Dictionary:
  if spatial(value): mechanism(value,path,false,room,root_node,0)
  else:
   for field in value: mechanisms(value[field],path+[field],room,root_node)
func mechanism(d,path,is_array,room,root_node,index):
 var node=handle(room.get_node("Objects"),"Mechanism",str(path[-1])+"_"+str(index),mechanism_position(d,path[0]),d,root_node)
 node.field_path=path
 node.array_element=is_array
 if not is_array:
  var settings=room.settings
  for key in path.slice(0,-1): settings=settings[key]
  settings.erase(path[-1])
 if d.has("a") and d.has("b") and d.a is Array and d.b is Array:
  curve(node,[Vector2(d.a[0],d.a[1])*8,Vector2(d.b[0],d.b[1])*8],root_node)
func generate(base):
 var root_node=WorldNode.new()
 root_node.name="Ascend_"+str(int(base.world.n))
 root_node.world_number=int(base.world.n)
 root_node.chapter_title=base.world.name
 root_node.gameplay_settings=base.duplicate(true)
 root_node.gameplay_settings.erase("world")
 root_node.world_settings=base.world.duplicate(true)
 root_node.world_settings.erase("rooms")
 root_node.source_fingerprint=Codec.fingerprint(base)
 var colors={1:["#efbf79","#bac9dc"],2:["#b7e1a0","#a9c4ab"],3:["#f3a66d","#cfb6a7"],21:["#cbb7ff","#b6aedc"],22:["#84e6d8","#98bfc2"],23:["#e8a5dc","#c4a6cf"]}
 var pair=colors.get(root_node.world_number,colors[1])
 root_node.accent_color=Color(pair[0])
 root_node.ambient_color=Color(pair[1])
 root_node.flowers_color=Color("#e0c08e" if root_node.world_number in [2,22] else "#d9b37f" if root_node.world_number in [3,23] else "#c4acd5")
 if root_node.world_number>=21: root_node.flowers_color=root_node.flowers_color.lerp(root_node.accent_color,.2)
 root_node.original_palette={"ambient":root_node.ambient_color.to_html(),"accent":root_node.accent_color.to_html(),"flowers":root_node.flowers_color.to_html(),"bunnies":"ffffffff"}
 var rooms=Node2D.new()
 rooms.name="Rooms"
 owned(root_node,rooms,root_node)
 var placements={}
 var lists=[base.world.sections,base.world.get("passages",[])]
 for q in base.world.quests+base.world.get("secrets",[]): lists.append(q.sections)
 for sections in lists:
  for section in sections: placements[section.room]=Vector2(section.x,section.y)*8
 var palette=tileset(root_node.world_number)
 for definition in base.world.rooms:
  var room=RoomNode.new()
  room.name=definition.id.validate_node_name()
  room.room_id=definition.id
  room.room_title=definition.get("name",definition.id)
  room.position=placements.get(definition.id,Vector2.ZERO)
  room.map_width=int(definition.get("cols",40))
  room.map_height=int(definition.get("rows",23))
  room.settings=definition.duplicate(true)
  room.original_fields=definition.keys()
  for field in ["map","decor","people","sweepers","zips","shutters"]: room.settings.erase(field)
  owned(rooms,room,root_node)
  var layer=TileMapLayer.new()
  layer.name="Tiles"
  layer.tile_set=palette
  owned(room,layer,root_node)
  var objects=Node2D.new()
  objects.name="Objects"
  owned(room,objects,root_node)
  var simulation=Core.new(base.constants,base.playerDefaults)
  simulation.load_room(Loader.parse(definition))
  var seen={}
  var zip_index=0
  var shutter_index=0
  for r in range(room.map_height):
   for c in range(room.map_width):
    var ch=Loader.glyph(definition,c,r)
    var cell=Vector2i(c,r)
    if ch==".": continue
    if ch in Codec.STATIC_GLYPHS:
     Codec.set_glyph(layer,cell,ch)
     continue
    if seen.has(cell): continue
    var size=Vector2i.ONE
    if ch in Codec.GROUP_GLYPHS:
     while c+size.x<room.map_width and Loader.glyph(definition,c+size.x,r)==ch and not seen.has(cell+Vector2i(size.x,0)): size.x+=1
     while r+size.y<room.map_height:
      var fit=true
      for x in range(size.x):
       if Loader.glyph(definition,c+x,r+size.y)!=ch or seen.has(cell+Vector2i(x,size.y)): fit=false
      if not fit: break
      size.y+=1
    for y in range(size.y):
     for x in range(size.x): seen[cell+Vector2i(x,y)]=true
    var item=handle(objects,"Spawn" if ch=="P" else "Fixture","Spawn" if ch=="P" else "Fixture_%s_%d_%d"%[ch,c,r],Vector2(cell)*8,{},root_node)
    item.glyph=ch
    item.footprint=size
    if ch=="P": room.original_spawn=item.position
    else:
     for e in simulation.ents:
      if abs(e.x-item.position.x)<.01 and abs(e.y-item.position.y)<8:
       item.preview_entity=e.duplicate(true)
       item.preview_offset=Vector2(e.x,e.y)-item.position
       if e.has("authoring_tint"):
        item.tint=Color(e.authoring_tint)
        item.preview_entity.erase("authoring_tint")
       break
    if ch=="X":
     var shutters=definition.get("shutters",[])
     item.parameters=shutters[shutter_index].duplicate(true) if shutter_index<shutters.size() else {}
     shutter_index+=1
    if ch=="Z":
     var z=definition.get("zips",[])
     var target=z[zip_index] if zip_index<z.size() else [0,-4]
     if target.size()>2 and target[2] is Dictionary: item.parameters=target[2].duplicate(true)
     curve(item,[item.position,item.position+Vector2(target[0],target[1])*8],root_node)
     zip_index+=1
  for d in definition.get("decor",[]):
   var prop=handle(objects,"Prop",d.k,Vector2(d.c*8,d.r*8+8),d,root_node)
   prop.petal_color=root_node.flowers_color
   prop.original_petal_color=prop.petal_color
  for d in definition.get("people",[]): handle(objects,"NPC",d.who,Vector2(d.c*8,d.r*8+8),d,root_node)
  for i in range(definition.get("sweepers",[]).size()):
   var d=definition.sweepers[i]
   var points=[]
   for at in d.path: points.append(Vector2(at[0],at[1])*8+Vector2(4,4))
   var item=handle(objects,"Bunny","Bunny_"+str(i),points[0],d,root_node)
   item.period=int(d.get("period",180))
   item.phase=int(d.get("phase",0))
   item.radius=d.get("radius",4)
   item.loop_path=d.get("loop",false)
   curve(item,points,root_node)
  for d in base.get("whiteFlowers",{}).get("patches",[]):
   if d.room!=definition.id: continue
   var params=d.duplicate(true)
   params.erase("room")
   var item=handle(objects,"White flower","White_flower",Vector2(d.x,d.y),params,root_node)
   item.footprint=Vector2i(d.w,d.h)
  for field in ["movingHooks","recoilPlatforms","hingeArms","lines","beams","portals","combat","resinWind","lashes","rootCrown","oathRoot","sentinel","foes","decks","anvilSleds"]:
   if definition.has(field): mechanisms(definition[field],[field],room,root_node)
 return root_node
func run():
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://levels"))
 var numbers=[1,2,3,21,22,23,4]
 var args=OS.get_cmdline_user_args()
 if "--world" in args:
  var index=args.find("--world")
  if index+1>=args.size() or not int(args[index+1]) in numbers:
   push_error("--world requires an existing chapter number")
   quit(1)
   return
  numbers=[int(args[index+1])]
 for number in numbers:
  var base=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number))
  base.world=Layout.build(base.world)
  if number==1: base.whiteFlowers=JSON.parse_string(FileAccess.get_file_as_string("res://data/white-flowers.json"))
  var scene=generate(base)
  var compiled=scene.compile_into(base)
  var difference=Codec.first_difference(base,compiled)
  if difference!="":
   push_error("World %d round trip: %s"%[number,difference])
   errors+=1
  else:
   print("PASS World %d: %d rooms preserve all native data"%[number,base.world.rooms.size()])
   var path="res://levels/world%d.tscn"%number
   if not FileAccess.file_exists(path) or "--force" in OS.get_cmdline_user_args():
    var packed=PackedScene.new()
    var packed_error=packed.pack(scene)
    var saved=ResourceSaver.save(packed,path) if packed_error==OK else packed_error
    if saved!=OK: errors+=1;push_error("Cannot save "+path)
    else: print("Saved "+path)
  scene.free()
 quit(1 if errors else 0)
