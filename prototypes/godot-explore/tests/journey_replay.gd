extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 var tours=JSON.parse_string(FileAccess.get_file_as_string("res://data/tours.json"))
 var frames=0
 var launches=0
 for id in ["outskirts","forest"]:
  for part in tours[id].tape:
   for i in range(int(part[0])):
    var raw={}
    for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"],["command","e"],["flag","f"]]: raw[pair[0]]=pair[1] in part[1]
    world.step(raw)
    for e in world.events:
     if e.kind=="launch": launches+=1
    frames+=1
  print("END ",id," ",world.stage," ",world.point()," blood ",world.p.blood," deaths ",world.deaths," frames ",frames)
 var ok=world.stage==1 and world.p.x>12150 and world.deaths==0 and world.weapon and world.mantle and world.bearings.size()==3 and launches>=4 and world.bram_done and world.regions[1].npcs[0].get("recalls",0)==0 and world.region().get("draft_end",false)
 print("Bram arrived ",world.bram_done," with ",world.regions[1].npcs[0].get("recalls",0)," recalls")
 print("PASS full two-region journey through actual controls" if ok else "FAIL two-region journey")
 quit(0 if ok else 1)
