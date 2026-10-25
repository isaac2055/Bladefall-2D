extends SceneTree
const Landscape=preload("res://scripts/landscape.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
var painter
var canvas
var entity
var drawing_origin=Vector2.ZERO
func _initialize(): run.call_deferred()
func run():
 var entities={}
 for number in [21,22,23]:
  var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number))
  for def in data.world.rooms:
   var core=Core.new(data.constants,data.playerDefaults)
   core.load_room(Loader.parse(def))
   for e in core.ents:
    if not entities.has(e.type): entities[e.type]=e.duplicate(true)
 var view=SubViewport.new()
 view.size=Vector2i(128,128)
 view.transparent_bg=true
 view.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(view)
 canvas=Node2D.new()
 view.add_child(canvas)
 painter=Landscape.new()
 painter.ink=canvas
 canvas.draw.connect(func():painter.draw_entity(entity,drawing_origin))
 var ok=true
 for kind in entities:
  entity=entities[kind]
  drawing_origin=Vector2(32-entity.x,32-entity.y)
  canvas.queue_redraw()
  await process_frame
  await RenderingServer.frame_post_draw
  var screenshot=view.get_texture().get_image()
  var count=0
  for y in range(128):
   for x in range(128):
    if screenshot.get_pixel(x,y).a>.05: count+=1
  var passed=count>4
  ok=ok and passed
  print("PASS" if passed else "FAIL"," authored ",kind," visible · ",count," painted pixels")
 painter.free()
 view.queue_free()
 await process_frame
 quit(0 if ok else 1)
