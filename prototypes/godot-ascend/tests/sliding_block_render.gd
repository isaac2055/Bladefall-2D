extends SceneTree
const Landscape=preload("res://scripts/landscape.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
var painter
var canvas
var block
var drawing_origin=Vector2.ZERO
func _initialize(): run.call_deferred()
func run():
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world3.json"))
 var def=data.world.rooms.filter(func(d):return d.id=="cl3-c3-rise")[0]
 var core=Core.new(data.constants,data.playerDefaults)
 core.load_room(Loader.parse(def))
 block=core.ents.filter(func(e):return e.type=="slide")[0]
 var view=SubViewport.new()
 view.size=Vector2i(96,64)
 view.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(view)
 canvas=Node2D.new()
 view.add_child(canvas)
 painter=Landscape.new()
 painter.ink=canvas
 canvas.draw.connect(func():painter.draw_entity(block,drawing_origin))
 var ok=true
 for moving in [false,true]:
  if moving:
   core.push_stone(block,1,0)
   for i in range(5): core.update_slide(block)
  drawing_origin=Vector2(16-block.x,16-block.y)
  canvas.queue_redraw()
  await process_frame
  await RenderingServer.frame_post_draw
  var screenshot=view.get_texture().get_image()
  var count=0
  for y in range(16,16+int(block.h)):
   for x in range(16,16+int(block.w)):
    var c=screenshot.get_pixel(x,y)
    if c.r+c.g+c.b>.3: count+=1
  var passed=count>block.w*block.h*.8
  ok=ok and passed
  print("PASS" if passed else "FAIL"," authored sliding block visible ","after moving" if moving else "before moving"," · ",count," painted pixels")
  if OS.get_cmdline_user_args().size()>0: screenshot.save_png(OS.get_cmdline_user_args()[0]+("-moving.png" if moving else "-idle.png"))
 painter.free()
 view.queue_free()
 await process_frame
 quit(0 if ok else 1)
