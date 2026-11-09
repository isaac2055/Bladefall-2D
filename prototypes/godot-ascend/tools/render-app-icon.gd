extends SceneTree
func _initialize():
 var image=Image.new()
 var error=image.load_svg_from_string(FileAccess.get_file_as_string("res://art/app-icon.svg"),1.0)
 if error!=OK: quit(1);return
 if image.save_png("res://art/app-icon.png")!=OK: quit(1);return
 var splash=Image.create(1280,832,false,Image.FORMAT_RGBA8)
 splash.fill(Color("#09151c"))
 image.resize(384,384,Image.INTERPOLATE_LANCZOS)
 splash.blit_rect(image,Rect2i(0,0,384,384),Vector2i(448,200))
 if splash.save_png("res://art/boot-splash.png")!=OK: quit(1);return
 print("APP ICON RENDERED")
 quit()
