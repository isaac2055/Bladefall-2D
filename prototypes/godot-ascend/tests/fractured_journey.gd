extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var ok=true
 for number in [21,22,23]:
  var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number)))
  var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d-tour.json"%number))
  var visited={w.active_id:true}
  for part in tour.tape:
   var raw={}
   for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"],["parry","p"],["portal","q"]]: raw[pair[0]]=pair[1] in part[1]
   for i in range(int(part[0])):
    w.step(raw)
    w.update_region()
    visited[w.active_id]=true
  var passed=w.frames==tour.frames and w.active_id=="cl%d-atlas-crossroads"%number and w.active().deaths==0
  for id in tour.visited: passed=passed and visited.has(id)
  print("PASS" if passed else "FAIL"," continuous Fractured road ",number," · ",w.frames," normal-input frames · ",visited.size()," regions · ",w.active().deaths," deaths")
  ok=ok and passed
  w.shutdown()
 quit(0 if ok else 1)
