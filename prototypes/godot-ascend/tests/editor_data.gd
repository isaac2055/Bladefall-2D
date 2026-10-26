extends SceneTree
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const World=preload("res://scripts/world.gd")
var failed=false
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func run():
 var comparison=Codec
 for number in [1,2,3,21,22,23]:
  var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number))
  var base=Authoring.baseline(source)
  var scene=load("res://levels/world%d.tscn"%number).instantiate()
  var compiled=scene.compile_into(base)
  var delta=comparison.first_difference(base,compiled)
  check(delta=="","Saved chapter %d round trip: "%number+delta)
  var errors=scene.validate_data(compiled)
  check(errors.is_empty(),"Chapter %d validates: "%number+str(errors))
  var data=Authoring.read(source)
  check(comparison.first_difference(base,data)=="","Runtime reads chapter %d scene without data loss"%number)
  var room=scene.get_node("Rooms").get_child(0)
  var tile=room.get_node("Tiles")
  var before=compiled.world.rooms[0].map[1][1]
  preload("res://authoring/codec.gd").set_glyph(tile,Vector2i(1,1),"^" if before!="^" else "#")
  var edited=scene.compile_into(base)
  check(edited.world.rooms[0].map[1][1]!=before,"Chapter %d tile edit compiles into gameplay"%number)
  # Save real mutations, reload through the same loader used by gameplay, then parse collision.
  var prop=null
  var actor=null
  var bunny=null
  var fixture=null
  var mechanism=null
  for area in scene.get_node("Rooms").get_children():
   for item in area.get_node("Objects").get_children():
    if item.kind=="Prop" and prop==null: prop=item
    if item.kind=="NPC" and actor==null: actor=item
    if item.kind=="Bunny" and bunny==null: bunny=item
    if item.kind=="Fixture" and item.glyph!="Z" and fixture==null: fixture=item
    if item.kind=="Mechanism" and mechanism==null: mechanism=item
  if prop!=null:
   prop.position+=Vector2(8,0)
   prop.tint=Color("#a4d5bc")
   prop.scale=Vector2(1.25,1.5)
   prop.rotation=.2
   prop.petal_color=Color("#ee6699")
  if actor!=null:
   actor.position+=Vector2(8,0)
   actor.character_style=2
  if bunny!=null:
   bunny.period+=17
   bunny.tint=Color("#99aacc")
   bunny.get_node("MotionPath").curve.set_point_position(0,bunny.get_node("MotionPath").curve.get_point_position(0)+Vector2(8,0))
  if mechanism!=null: mechanism.position+=Vector2(8,0)
  scene.accent_color=Color("#aabbcc")
  var packed=PackedScene.new()
  check(packed.pack(scene)==OK,"Pack edited chapter %d"%number)
  var folder="user://editor-tests"
  DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
  var path=folder+"/world%d.tscn"%number
  check(ResourceSaver.save(packed,path)==OK,"Save edited chapter %d"%number)
  var reloaded=Authoring.read(source,path)
  var parsed=preload("res://scripts/room_loader.gd").parse(reloaded.world.rooms[0])
  check(parsed.grid[parsed.cols+1]==(3 if before!="^" else 1),"Chapter %d saved tile changes real collision"%number)
  check(reloaded.world.authoring_palette.accent=="aabbccff","Chapter %d palette survives disk and runtime load"%number)
  if prop!=null:
   var id=prop.get_parent().get_parent().room_id
   var definition=reloaded.world.rooms.filter(func(d):return d.id==id)[0]
   var value=definition.decor[0]
   check(value.tint=="a4d5bcff" and value.visual_scale==[1.25,1.5] and is_equal_approx(value.visual_rotation,.2) and value.petal_color=="ee6699ff","Chapter %d prop transform and colors survive disk/runtime"%number)
  if actor!=null:
   var id=actor.get_parent().get_parent().room_id
   var value=reloaded.world.rooms.filter(func(d):return d.id==id)[0].people[0]
   check(value.character_style==2 and value.c==actor.position.x/8,"Chapter %d NPC position/style survives disk/runtime"%number)
  if bunny!=null:
   var id=bunny.get_parent().get_parent().room_id
   var value=reloaded.world.rooms.filter(func(d):return d.id==id)[0].sweepers[0]
   check(value.period==bunny.period and value.tint=="99aaccff" and is_equal_approx(value.path[0][0],bunny.parameters.path[0][0]+1),"Chapter %d bunny path/timing/tint survives disk/runtime"%number)
  if mechanism!=null:
   var id=mechanism.get_parent().get_parent().room_id
   var edited_definition=reloaded.world.rooms.filter(func(d):return d.id==id)[0]
   var value=edited_definition
   for field in mechanism.field_path: value=value[field]
   if mechanism.array_element: value=value[0]
   var expected=preload("res://authoring/codec.gd").position_data(mechanism)
   check(comparison.first_difference(expected,value)=="","Chapter %d mechanism coordinate edit survives disk/runtime"%number)
  # Invalid edits are caught before launching.
  preload("res://authoring/codec.gd").set_glyph(tile,Vector2i(-1,0),"#")
  check(not scene.validate_data(scene.compile_into(base)).is_empty(),"Chapter %d rejects tiles outside room bounds"%number)
  scene.free()
 quit(1 if failed else 0)
