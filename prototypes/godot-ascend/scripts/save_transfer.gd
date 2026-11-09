extends RefCounted
## Portable, object-free bundle shared by desktop and browser builds.
const PROFILE="bladefall-garden.json"
const CHAPTERS=[1,2,3,21,22,23,101,102,103]
const LIMIT=32*1024*1024
static func names():
 var out=[PROFILE,"prototype-settings.cfg","bladefall-controls.cfg"]
 for n in CHAPTERS: out.append(PROFILE+".world-%d.save"%n)
 return out
static func export_bundle(directory="user://"):
 var files={}
 for name in names():
  var path=directory.path_join(name)
  if FileAccess.file_exists(path): files[name]=Marshalls.raw_to_base64(FileAccess.get_file_as_bytes(path))
 return JSON.stringify({"format":"bladefall-save","version":1,"files":files})
static func import_bundle(source,directory="user://"):
 if source.length()>LIMIT: return "Save file is too large."
 var bundle=JSON.parse_string(source)
 if not bundle is Dictionary or bundle.get("format")!="bladefall-save" or bundle.get("version")!=1 or not bundle.get("files") is Dictionary: return "This is not a Bladefall save export."
 if not bundle.files.has(PROFILE): return "The Garden profile is missing."
 var decoded={}
 for name in bundle.files:
  if name not in names() or not bundle.files[name] is String: return "The save contains an unknown file."
  var bytes=Marshalls.base64_to_raw(bundle.files[name])
  if bytes.is_empty(): return "The save contains an empty or invalid file."
  if name==PROFILE:
   var value=JSON.parse_string(bytes.get_string_from_utf8())
   if not value is Dictionary or value.get("version")!=1: return "The Garden profile is invalid."
   for key in ["plants","records","discovered","completed","hearts","story_seen"]:
    if value.has(key) and not value[key] is Dictionary: return "The Garden profile is invalid."
  elif name.ends_with(".cfg"):
   var config=ConfigFile.new()
   if config.parse(bytes.get_string_from_utf8())!=OK: return "The settings file is invalid."
  elif not valid_world(bytes): return "A world checkpoint is damaged."
  decoded[name]=bytes
 # Validate the entire bundle before touching live saves. Keep a complete prior
 # export for recovery, and stage every write before replacing any live file.
 var backup=FileAccess.open(directory.path_join("bladefall-before-import.json"),FileAccess.WRITE)
 if backup==null: return "Cannot back up the existing save."
 backup.store_string(export_bundle(directory));backup.close()
 for name in decoded:
  var file=FileAccess.open(directory.path_join(name+".import"),FileAccess.WRITE)
  if file==null: return "Cannot prepare the imported save."
  file.store_buffer(decoded[name]);file.close()
 for name in names():
  var target=directory.path_join(name)
  if decoded.has(name):
   if DirAccess.rename_absolute(ProjectSettings.globalize_path(target+".import"),ProjectSettings.globalize_path(target))!=OK: return "Cannot replace the save; the previous save is in bladefall-before-import.json."
  elif FileAccess.file_exists(target):
   if DirAccess.remove_absolute(ProjectSettings.globalize_path(target))!=OK: return "Cannot clear an old checkpoint."
 return ""
static func valid_world(bytes):
 if bytes.size()<32 or bytes.size()>LIMIT: return false
 var stream=StreamPeerBuffer.new();stream.data_array=bytes
 var header=PackedByteArray()
 while stream.get_position()<stream.get_size():
  var c=stream.get_u8()
  if c==10: break
  header.append(c)
  if header.size()>32: return false
 if header.get_string_from_utf8()!="BLADEFALL SAVE 1": return false
 # Pascal strings in Godot files use a 32-bit byte length.
 for index in range(2):
  if stream.get_available_bytes()<4: return false
  var length=stream.get_u32()
  if length>4096 or length>stream.get_available_bytes(): return false
  var text=stream.get_data(length)[1].get_string_from_utf8()
  if index==1:
   if stream.get_available_bytes()<8: return false
   var size=stream.get_u64()
   if size!=stream.get_available_bytes(): return false
   var payload=stream.get_data(size)[1]
   if preload("res://scripts/world_save.gd").digest(payload)!=text: return false
   var value=bytes_to_var(payload)
   if not value is Dictionary or value.get("chapter",0) not in CHAPTERS: return false
   if value.get("challenge",false): return true
   for key in ["world","cores","run","ride","audio"]:
    if not value.get(key) is Dictionary: return false
   return true
 return false
