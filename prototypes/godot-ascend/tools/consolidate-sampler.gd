extends SceneTree
## One-time native import: append approved comparison rooms without changing existing geometry.
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
func _initialize():
 var path="res://data/world23.json"
 var raw=JSON.parse_string(FileAccess.get_file_as_string(path))
 if raw.world.has("samplerAppendedRooms"):
  print("Causeway rooms already consolidated")
  quit()
  return
 var baseline=Authoring.read(raw)
 var evidence={}
 for room in baseline.world.rooms: evidence[room.id]=Codec.fingerprint(room)
 var ids=[]
 for spec in [["causeway-cover-comparison",[]],["causeway-launch-rooms",["cl23-puzzle-roof-launch"]],["causeway-weight-comparison",[]]]:
  var extra=Authoring.read(JSON.parse_string(FileAccess.get_file_as_string("res://data/"+spec[0]+".json")))
  for room in extra.world.rooms:
   if not spec[1].is_empty() and not room.id in spec[1]: continue
   var copy=room.duplicate(true)
   copy.name=copy.name.trim_prefix("A · ").trim_prefix("B · ")
   baseline.world.rooms.append(copy)
   baseline.world.sections.append({"room":copy.id,"x":1100+ids.size()*100,"y":-260,"fire":null})
   baseline.world.tapes[copy.id]=extra.world.tapes.get(copy.id,[])
   ids.append(copy.id)
 baseline.world.samplerAppendedRooms=ids
 var file=FileAccess.open(path,FileAccess.WRITE)
 file.store_string(JSON.stringify(baseline,"  ")+"\n")
 file.close()
 file=FileAccess.open("res://tests/fixtures/sampler-causeway-preservation.json",FileAccess.WRITE)
 file.store_string(JSON.stringify(evidence,"  ")+"\n")
 print("Consolidated five approved rooms; recorded ",evidence.size()," native room fingerprints")
 quit()
