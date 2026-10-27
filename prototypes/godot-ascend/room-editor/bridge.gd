extends SceneTree
## Dedicated editor bridge. Reads/writes only a supplied native workshop scene.
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Item=preload("res://authoring/item.gd")
var scene
var baseline
var fault=[]
func _initialize(): run.call_deferred()
func snapshot():
 var rooms=[]
 for room in scene.get_node("Rooms").get_children():
  var things=[]
  for item in Codec.objects(room):
   var d={"id":str(item.name),"kind":item.kind,"glyph":item.glyph,"x":item.position.x/8,"y":item.position.y/8,"w":item.footprint.x,"h":item.footprint.y,"enabled":item.enabled,"tint":item.tint.to_html(),"prop":item.parameters.get("k","trumpets")}
   if item.kind=="Fixture" and item.glyph=="Z":
    var curve=item.get_node("MotionPath").curve
    var end=item.position+curve.get_point_position(1)
    d.targetX=end.x/8;d.targetY=end.y/8
    d.holdFrames=item.parameters.get("holdFrames",30)
    d.returnFrames=item.parameters.get("returnFrames",120)
   things.append(d)
  var goal=room.settings.workshopGoal
  rooms.append({"id":room.room_id,"name":room.room_title,"width":room.map_width,"height":room.map_height,"tiles":Codec.read_map(room),"objects":things,"goal":{"x":goal[0]/8.0,"y":goal[1]/8.0,"w":goal[2]/8.0,"h":goal[3]/8.0},"requirePickup":room.settings.get("workshopRequireShard",false),"hint":room.settings.get("hint","")})
 return {"format":"bladefall-workshop-editor","version":1,"rooms":rooms}
func own(parent,node):
 parent.add_child(node,true)
 node.owner=scene
func apply_document(doc):
 var before=snapshot()
 if doc.get("format","")!="bladefall-workshop-editor" or doc.get("version",0)!=1 or doc.get("rooms",[]).size()!=before.rooms.size():
  fault.append("This file does not match the workshop’s room list.");return
 for index in range(before.rooms.size()):
  var original=before.rooms[index]
  var d=doc.rooms[index]
  var room=scene.get_node("Rooms").get_child(index)
  if d.id!=room.room_id: fault.append("Room IDs and order must be preserved.");continue
  if Codec.first_difference(original,d)=="": continue
  room.room_title=d.name
  room.map_width=int(d.width);room.map_height=int(d.height)
  room.settings.hint=d.hint
  room.settings.workshopRequireShard=d.requirePickup
  room.settings.workshopGoal=[d.goal.x*8,d.goal.y*8,d.goal.w*8,d.goal.h*8]
  # Old solutions describe old geometry; retain them in backups, not the edited room.
  room.settings.workshopRoutes=[]
  scene.world_settings.tapes[room.room_id]=[]
  var layer=room.get_node("Tiles")
  layer.clear()
  for y in range(d.tiles.size()):
   for x in range(d.tiles[y].length()): Codec.set_glyph(layer,Vector2i(x,y),d.tiles[y][x])
  var existing={}
  for item in Codec.objects(room): existing[str(item.name)]=item
  var kept={}
  for value in d.objects:
   var item=existing.get(value.id)
   if item==null:
    if value.kind not in ["Spawn","Fixture","Prop"]: fault.append("Unsupported new object type.");continue
    item=Item.new()
    item.name=value.id
    item.kind=value.kind
    item.world_number=4
    item.parameters={"k":value.get("prop","trumpets"),"c":value.x,"r":value.y-1} if value.kind=="Prop" else {}
    item.original_position=Vector2(value.x,value.y)*8
    own(room.get_node("Objects"),item)
   kept[value.id]=true
   var old=item.position/8
   item.position=Vector2(value.x,value.y)*8
   item.enabled=value.enabled
   item.glyph=value.glyph
   item.footprint=Vector2i(value.w,value.h)
   item.tint=Color(value.tint)
   if item.kind=="Prop": item.parameters.k=value.prop
   if item.kind=="Fixture" and item.glyph=="Z":
    var path=item.get_node_or_null("MotionPath")
    if path==null:
     path=Path2D.new();path.name="MotionPath";own(item,path)
    var curve=Curve2D.new()
    curve.add_point(Vector2.ZERO)
    curve.add_point(Vector2(value.targetX-value.x,value.targetY-value.y)*8)
    path.curve=curve
    item.parameters={}
    if value.holdFrames!=30: item.parameters.holdFrames=int(value.holdFrames)
    if value.returnFrames!=120: item.parameters.returnFrames=int(value.returnFrames)
   if room.settings.has("workshopDevices"):
    for role in room.settings.workshopDevices:
     if room.settings.workshopDevices[role]==[old.x*8,old.y*8]: room.settings.workshopDevices[role]=[item.position.x,item.position.y]
  for id in existing:
   if not kept.has(id):
    var item=existing[id]
    if room.settings.has("workshopDevices"):
     for role in room.settings.workshopDevices.keys():
      if room.settings.workshopDevices[role]==[item.position.x,item.position.y]: room.settings.workshopDevices.erase(role)
    item.get_parent().remove_child(item);item.free()
func run():
 var args=OS.get_cmdline_user_args()
 if args.size()<3: quit(2);return
 var mode=args[0]
 var input=args[1]
 var output=args[2]
 var packed=load(input)
 if packed==null: quit(2);return
 scene=packed.instantiate()
 baseline=Authoring.baseline(JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json")))
 if mode=="apply" and scene.source_fingerprint!=Codec.fingerprint(baseline): fault.append("The source import changed. Reconcile it before editing this native workshop.")
 if mode=="apply" and fault.is_empty():
  if args.size()<5: quit(2);return
  var doc=JSON.parse_string(FileAccess.get_file_as_string(args[3]))
  apply_document(doc)
  if fault.is_empty(): fault.append_array(scene.validate_data(scene.compile_into(baseline)))
  if fault.is_empty():
   var result=PackedScene.new()
   var err=result.pack(scene)
   if err==OK: err=ResourceSaver.save(result,args[4])
   if err!=OK: fault.append("Could not write the native scene: "+str(err))
 var response={"ok":fault.is_empty(),"errors":fault,"document":snapshot()}
 var file=FileAccess.open(output,FileAccess.WRITE)
 if file!=null: file.store_string(JSON.stringify(response,"  "))
 scene.free()
 quit(0 if fault.is_empty() else 1)
