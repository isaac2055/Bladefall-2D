extends SceneTree
const Painter=preload("res://scripts/landscape.gd")
var painter
var canvas
var viewport
var values={}
func _initialize(): run.call_deferred()
func image_for(data):
 values=data
 canvas.queue_redraw()
 await process_frame
 await RenderingServer.frame_post_draw
 return viewport.get_texture().get_image()
func paint():
 painter.ink=canvas
 painter.paint_transform=Transform2D.IDENTITY
 painter.draw_prop("trumpets",Vector2(50,55),values)
 painter.draw_person({"who":"silas","tint":values.get("tint","ffffffff"),"visual_scale":values.get("visual_scale",[1,1]),"visual_rotation":values.get("visual_rotation",0),"character_style":2},Vector2(110,65),false)
func differences(a,b):
 var count=0
 for y in range(a.get_height()):
  for x in range(a.get_width()):
   if a.get_pixel(x,y)!=b.get_pixel(x,y): count+=1
 return count
func run():
 painter=Painter.new()
 painter.world_data={"world":{"n":3}}
 painter.causeway=true
 painter.configure_mood()
 viewport=SubViewport.new()
 viewport.size=Vector2i(180,110)
 viewport.transparent_bg=true
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(viewport)
 canvas=Node2D.new()
 viewport.add_child(canvas)
 canvas.draw.connect(paint)
 var original=await image_for({})
 var color=await image_for({"tint":"e477aaff","petal_color":"5544ddff"})
 var transformed=await image_for({"visual_scale":[1.7,1.3],"visual_rotation":.4})
 var changed_color=differences(original,color)
 var changed_transform=differences(original,transformed)
 var passed=changed_color>20 and changed_transform>50
 print("PASS " if passed else "FAIL ","GPU renders authored tint/petals (%d pixels) and scale/rotation (%d pixels)"%[changed_color,changed_transform])
 if not OS.get_cmdline_user_args().is_empty(): transformed.save_png(OS.get_cmdline_user_args()[0])
 painter.free()
 viewport.queue_free()
 await process_frame
 quit(0 if passed else 1)
