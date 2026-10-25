extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world3.json")))
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/world3-tour.json"))
 var visited={world.active_id:true}
 for part in tour.tape:
  var raw={}
  for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
  for i in range(int(part[0])):
   world.step(raw)
   world.update_region()
   visited[world.active_id]=true
 var ok=world.frames==tour.frames and world.active_id=="cl3-atlas-crossroads" and world.active().deaths==0
 for id in tour.visited:
  if not visited.has(id): ok=false
 print("PASS" if ok else "FAIL"," continuous World 3 road · ",world.frames," normal-input frames · ",visited.size()," regions · ",world.active().deaths," deaths")
 world.shutdown()
 quit(0 if ok else 1)
