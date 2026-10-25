extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var tours=JSON.parse_string(FileAccess.get_file_as_string("res://data/quest-tours.json"))
 for name in ["rowan","elsie"]:
  var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
  if name=="elsie": world.enter(1,150,0)
  var frames=0
  for part in tours[name].tape:
   for i in range(int(part[0])):
    var raw={}
    for pair in [["left","l"],["right","r"],["jump","j"],["attack","a"],["interact","u"],["pickup","c"],["command","e"],["flag","f"]]: raw[pair[0]]=pair[1] in part[1]
    world.step(raw)
    frames+=1
  var done=world.rowan==5 if name=="rowan" else world.elsie==5
  var home=330.0 if name=="rowan" else 820.0
  var ok=done and world.deaths==0 and world.p.blood==5 and abs(world.p.x-home)<5 and world.ride.is_empty()
  print("PASS" if ok else "FAIL"," full normal-input quest ",name," frames ",frames," p ",world.point()," blood ",world.p.blood," deaths ",world.deaths)
  if not ok: quit(1);return
 quit()
