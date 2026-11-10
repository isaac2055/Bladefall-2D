extends SceneTree
func _initialize():
 var source=Image.load_from_file("res://art/app-icon.svg")
 source.resize(1024,1024,Image.INTERPOLATE_LANCZOS)
 source.save_png("res://art/app-icon.png")
 quit()
