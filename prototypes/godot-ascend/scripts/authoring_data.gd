extends RefCounted
## Native scenes are the editable source. Browser fixtures remain reference-only.
const Layout=preload("res://scripts/world_layout.gd")
const Codec=preload("res://authoring/codec.gd")
static func baseline(source):
 var data=source.duplicate(true)
 data.world=Layout.build(source.world)
 if int(source.world.n)==1: data.whiteFlowers=JSON.parse_string(FileAccess.get_file_as_string("res://data/white-flowers.json"))
 return data
static func read(source,path=""):
 var base=baseline(source)
 if path=="": path="res://levels/world%d.tscn"%int(source.world.n)
 if not ResourceLoader.exists(path):
  push_error("Missing native chapter scene: "+path)
  return base
 var packed=load(path)
 var scene=packed.instantiate()
 if scene.source_fingerprint!=Codec.fingerprint(base):
  push_error("Native scene source has changed; reconcile its browser import before playing: "+path)
  scene.free()
  return base
 var data=scene.compile_into(base)
 var errors=scene.validate_data(data)
 scene.free()
 if not errors.is_empty():
  for message in errors: push_error(path+": "+message)
  return base
 return data
