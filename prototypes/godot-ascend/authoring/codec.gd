@tool
extends RefCounted
const STATIC_GLYPHS=".#%=^v<>-()I{}"
const GROUP_GLYPHS="ABKZGHM~VXQCY"
static func fingerprint(data): return JSON.stringify(data,"",true,true).sha256_text()
static func key(type,x,y): return "%s@%.4f,%.4f"%[type,x,y]
static func objects(room): return room.get_node("Objects").get_children()
static func glyph_at(layer,cell):
 var tile=layer.get_cell_tile_data(cell)
 return str(tile.get_custom_data("glyph")) if tile!=null else "."
static func set_glyph(layer,cell,glyph):
 if glyph==".": layer.erase_cell(cell);return
 var atlas=layer.tile_set.get_source(0)
 for i in range(atlas.get_tiles_count()):
  var at=atlas.get_tile_id(i)
  if atlas.get_tile_data(at,0).get_custom_data("glyph")==glyph:
   layer.set_cell(cell,0,at)
   return
static func read_map(room):
 var rows=[]
 for r in range(room.map_height):
  var row=""
  for c in range(room.map_width): row+=glyph_at(room.get_node("Tiles"),Vector2i(c,r))
  rows.append(row)
 return rows
static func put(rows,cell,glyph):
 if cell.y<0 or cell.y>=rows.size() or cell.x<0 or cell.x>=rows[cell.y].length(): return
 var row=rows[cell.y]
 row[cell.x]=glyph
 rows[cell.y]=row
static func position_data(item):
 var d=item.parameters.duplicate(true)
 var delta=item.position-item.original_position
 match item.kind:
  "Prop","NPC":
   if delta!=Vector2.ZERO:
    d.c=item.position.x/8.0
    d.r=item.position.y/8.0-1
   if item.scale!=Vector2.ONE: d.visual_scale=[item.scale.x,item.scale.y]
   if item.rotation!=0: d.visual_rotation=item.rotation
   if item.tint!=Color.WHITE: d.tint=item.tint.to_html()
   if item.kind=="NPC" and item.character_style>=0: d.character_style=item.character_style
   if item.petal_color!=item.original_petal_color: d.petal_color=item.petal_color.to_html()
  "Bunny":
   var path=[]
   if not item.has_node("MotionPath") or item.get_node("MotionPath").curve==null: return d
   var curve=item.get_node("MotionPath").curve
   for i in range(curve.point_count):
    var at=item.position+curve.get_point_position(i)-Vector2(4,4)
    var old=d.get("path",[])
    var unchanged=i<old.size() and delta==Vector2.ZERO and curve.get_point_position(i)==Vector2(old[i][0],old[i][1])*8+Vector2(4,4)-item.original_position
    path.append(old[i] if unchanged else [at.x/8.0,at.y/8.0])
   d.path=path
   for pair in [["period",item.period,180],["phase",item.phase,0],["radius",item.radius,4.0],["loop",item.loop_path,false]]:
    if d.has(pair[0]) or pair[1]!=pair[2]: d[pair[0]]=pair[1]
   if item.tint!=Color.WHITE: d.tint=item.tint.to_html()
  "White flower":
   d.x=item.position.x
   d.y=item.position.y
   d.w=item.footprint.x
   d.h=item.footprint.y
   if item.tint!=Color.WHITE: d.tint=item.tint.to_html()
  "Mechanism":
   if delta!=Vector2.ZERO:
    if d.has("c") and d.has("r"):
     d.c+=delta.x/8
     d.r+=delta.y/8
    elif d.has("x") and d.has("y"):
     var unit=8.0 if item.field_path[0]=="foes" else 1.0
     d.x+=delta.x/unit
     d.y+=delta.y/unit
   if item.has_node("MotionPath") and item.get_node("MotionPath").curve!=null and d.has("a") and d.has("b"):
    var curve=item.get_node("MotionPath").curve
    for i in range(min(2,curve.point_count)):
     var at=item.position+curve.get_point_position(i)
     var field="a" if i==0 else "b"
     if delta!=Vector2.ZERO or curve.get_point_position(i)!=Vector2(d[field][0],d[field][1])*8-item.original_position: d[field]=[at.x/8,at.y/8]
 return d
static func set_nested(root,path,value):
 var d=root
 for i in range(path.size()-1):
  if not d.has(path[i]): d[path[i]]={}
  d=d[path[i]]
 d[path[-1]]=value
static func compile_room(room):
 var d=room.settings.duplicate(true)
 d.id=room.room_id
 d.name=room.room_title
 if d.has("cols") or room.map_width!=40: d.cols=room.map_width
 if d.has("rows") or room.map_height!=23: d.rows=room.map_height
 var rows=read_map(room)
 var props=[]
 var people=[]
 var bunnies=[]
 var white=[]
 var zips=[]
 var shutters=[]
 var visuals={}
 var arrays={}
 for path in room.array_fields: arrays[JSON.stringify(path)]={"path":path,"items":[]}
 for item in objects(room):
  if not item.enabled: continue
  match item.kind:
   "Spawn": put(rows,Vector2i(item.position/8),"P")
   "Fixture":
    var cell=Vector2i(item.position/8)
    for r in range(item.footprint.y):
     for c in range(item.footprint.x): put(rows,cell+Vector2i(c,r),item.glyph)
    if item.glyph=="X": shutters.append({"cell":cell,"value":item.parameters.duplicate(true)})
    if item.glyph=="Z" and item.has_node("MotionPath") and item.get_node("MotionPath").curve!=null:
     var curve=item.get_node("MotionPath").curve
     if curve.point_count==2:
      var offset=curve.get_point_position(1)-curve.get_point_position(0)
      zips.append({"cell":cell,"value":[offset.x/8,offset.y/8]})
    if item.tint!=Color.WHITE: visuals[key(item.preview_entity.get("type",""),item.position.x+item.preview_offset.x,item.position.y+item.preview_offset.y)]={"tint":item.tint.to_html()}
   "Prop": props.append(position_data(item))
   "NPC": people.append(position_data(item))
   "Bunny": bunnies.append(position_data(item))
   "White flower": white.append(position_data(item))
   "Mechanism":
    var value=position_data(item)
    if item.array_element:
     var k=JSON.stringify(item.field_path)
     if not arrays.has(k): arrays[k]={"path":item.field_path,"items":[]}
     arrays[k].items.append(value)
    else: set_nested(d,item.field_path,value)
 for group in arrays.values(): set_nested(d,group.path,group.items)
 if room.original_fields.has("decor") or not props.is_empty(): d.decor=props
 if room.original_fields.has("people") or not people.is_empty(): d.people=people
 if room.original_fields.has("sweepers") or not bunnies.is_empty(): d.sweepers=bunnies
 for config in [["Z","zips",zips,[0,-4]],["X","shutters",shutters,{}]]:
  var offsets={}
  for value in config[2]: offsets[value.cell]=value.value
  var values=[]
  for cell in group_cells(rows,config[0]): values.append(offsets.get(cell,config[3]))
  if room.original_fields.has(config[1]) or not values.is_empty(): d[config[1]]=values
 if not visuals.is_empty(): d.authoring_visuals=visuals
 d.map=rows
 return {"definition":d,"white":white}
static func group_cells(rows,glyph):
 var result=[]
 var seen={}
 for r in range(rows.size()):
  for c in range(rows[r].length()):
   var cell=Vector2i(c,r)
   if rows[r][c]!=glyph or seen.has(cell): continue
   result.append(cell)
   var width=0
   while c+width<rows[r].length() and rows[r][c+width]==glyph and not seen.has(cell+Vector2i(width,0)): width+=1
   var height=1
   while r+height<rows.size():
    var fit=true
    for x in range(width):
     if c+x>=rows[r+height].length() or rows[r+height][c+x]!=glyph or seen.has(cell+Vector2i(x,height)): fit=false
    if not fit: break
    height+=1
   for y in range(height):
    for x in range(width): seen[cell+Vector2i(x,y)]=true
 return result
static func compile_world(root,base):
 var result=base.duplicate(true)
 for field in root.gameplay_settings: result[field]=root.gameplay_settings[field].duplicate(true) if root.gameplay_settings[field] is Dictionary or root.gameplay_settings[field] is Array else root.gameplay_settings[field]
 result.world=root.world_settings.duplicate(true)
 result.world.name=root.chapter_title
 result.world.rooms=[]
 var positions={}
 var fires={}
 var white=[]
 for room in root.get_node("Rooms").get_children():
  var compiled=compile_room(room)
  result.world.rooms.append(compiled.definition)
  positions[room.room_id]=room.position/8
  var spawns=objects(room).filter(func(item):return item.kind=="Spawn" and item.enabled)
  var spawn=spawns[0] if spawns.size()==1 else null
  if spawn!=null: fires[room.room_id]=spawn.position/8-room.original_spawn/8
  for patch in compiled.white:
   patch.room=room.room_id
   white.append(patch)
 var lists=[result.world.sections,result.world.get("passages",[])]
 for branch in result.world.get("quests",[])+result.world.get("secrets",[]): lists.append(branch.sections)
 for sections in lists:
  for section in sections:
   if positions.has(section.room):
    section.x=positions[section.room].x
    section.y=positions[section.room].y
    if section.get("fire")!=null and fires.has(section.room):
     section.fire.c+=fires[section.room].x
     section.fire.r+=fires[section.room].y
 var palette={}
 for field in ["ambient","accent","flowers","bunnies"]:
  var value=root.get(field+"_color")
  if value.to_html()!=root.original_palette[field]: palette[field]=value.to_html()
 if not palette.is_empty(): result.world.authoring_palette=palette
 if result.has("whiteFlowers"): result.whiteFlowers.patches=white
 return result
static func validate(root,data):
 var errors=[]
 var ids={}
 for container in [root,root.get_node("Rooms")]:
  if container.position!=Vector2.ZERO or container.scale!=Vector2.ONE or container.rotation!=0: errors.append(str(container.name)+": keep the chapter and Rooms container transforms at identity")
 for room in root.get_node("Rooms").get_children():
  if ids.has(room.room_id): errors.append("Duplicate room ID: "+room.room_id)
  ids[room.room_id]=true
  if room.position!=room.position.snapped(Vector2(8,8)): errors.append(room.room_id+": snap the room position to the 8px grid")
  if room.rotation!=0 or room.scale!=Vector2.ONE: errors.append(room.room_id+": rooms must stay axis aligned and unscaled")
  for container in [room.get_node("Tiles"),room.get_node("Objects")]:
   if container.position!=Vector2.ZERO or container.scale!=Vector2.ONE or container.rotation!=0: errors.append(room.room_id+" / "+container.name+": move individual objects or paint tiles; keep this container transform at identity")
  var fields={}
  for item in objects(room):
   if item.enabled and item.kind=="Mechanism" and not item.array_element:
    var field=JSON.stringify(item.field_path)
    if fields.has(field): errors.append(room.room_id+": duplicate singleton mechanism "+field)
    fields[field]=true
  var d=data.world.rooms.filter(func(r):return r.id==room.room_id)[0]
  for cell in room.get_node("Tiles").get_used_cells():
   if cell.x<0 or cell.y<0 or cell.x>=room.map_width or cell.y>=room.map_height: errors.append(room.room_id+": painted tile outside room at "+str(cell))
  var occupied={}
  for item in objects(room):
   if not item.enabled or item.kind not in ["Fixture","Spawn"]: continue
   for r in range(item.footprint.y):
    for c in range(item.footprint.x):
     var cell=Vector2i(item.position/8)+Vector2i(c,r)
     if occupied.has(cell): errors.append(room.room_id+": overlapping fixture at "+str(cell))
     occupied[cell]=true
     if glyph_at(room.get_node("Tiles"),cell)!=".": errors.append(room.room_id+": fixture overlaps painted tile at "+str(cell))
  var spawns=0
  for row in d.map: spawns+=row.count("P")
  if spawns!=1: errors.append(room.room_id+": exactly one spawn is required")
  for item in objects(room):
   if not item.enabled: continue
   if item.kind in ["Fixture","Spawn"]:
    if item.position!=item.position.snapped(Vector2(8,8)): errors.append(room.room_id+" / "+item.name+": snap fixture to the 8px grid")
    if item.scale!=Vector2.ONE or item.rotation!=0: errors.append(room.room_id+" / "+item.name+": use Footprint for the collision size; fixtures cannot be scaled/rotated")
    var end=item.position+Vector2(item.footprint)*8
    if item.position.x<0 or item.position.y<0 or end.x>room.map_width*8 or end.y>room.map_height*8: errors.append(room.room_id+" / "+item.name+": fixture lies outside the room")
   if item.kind in ["Bunny","White flower","Mechanism"] and (item.scale!=Vector2.ONE or item.rotation!=0): errors.append(room.room_id+" / "+item.name+": this object's simulation uses position and size fields; reset node scale/rotation")
   if item.kind in ["Fixture","White flower"] and (item.footprint.x<1 or item.footprint.y<1): errors.append(room.room_id+": footprint must be positive")
   if item.kind=="Bunny" or item.kind=="Fixture" and item.glyph=="Z" or item.kind=="Mechanism" and item.parameters.has("a") and item.parameters.has("b"):
    var path=item.get_node_or_null("MotionPath")
    if path==null or path.curve==null: errors.append(room.room_id+": missing MotionPath")
    else:
     if item.kind=="Bunny" and path.curve.point_count<2: errors.append(room.room_id+": bunny needs at least two path points")
     if item.kind in ["Fixture","Mechanism"] and path.curve.point_count!=2: errors.append(room.room_id+": lift path needs exactly two endpoints")
     if item.kind=="Bunny" and path.curve.get_baked_length()<=0: errors.append(room.room_id+": bunny path must have length")
   if item.kind=="Bunny" and item.period<=0: errors.append(room.room_id+": bunny period must be positive")
   if item.kind=="Fixture" and (item.glyph.length()!=1 or item.glyph not in "ABKZGHM~VXQCYocbxs*l_Nf/\\Ok"): errors.append(room.room_id+": invalid fixture glyph")
 var lists=[data.world.sections,data.world.get("passages",[])]
 for q in data.world.get("quests",[])+data.world.get("secrets",[]): lists.append(q.sections)
 for sections in lists:
  for section in sections:
   if not ids.has(section.room): errors.append("Missing referenced room: "+section.room)
 for reward in data.get("branchRewards",[])+data.get("secretRewards",[]):
  for id in [reward.room]+reward.get("rooms",[])+([reward.host] if reward.has("host") else []):
   if not ids.has(id): errors.append("Missing reward room: "+str(id))
 return errors

static func first_difference(a,b,path=""):
 if a is Dictionary and b is Dictionary:
  for k in a:
   if not b.has(k): return path+" missing "+str(k)
   var delta=first_difference(a[k],b[k],path+"/"+str(k))
   if delta!="": return delta
  for k in b:
   if not a.has(k): return path+" added "+str(k)
 elif a is Array and b is Array:
  if a.size()!=b.size(): return path+" array size %d / %d"%[a.size(),b.size()]
  for i in range(a.size()):
   var delta=first_difference(a[i],b[i],path+"/"+str(i))
   if delta!="": return delta
 elif a!=b: return path+" : "+str(a)+" != "+str(b)
 return ""
