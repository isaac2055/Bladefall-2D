extends SceneTree
const World=preload("res://scripts/world.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
func _initialize():
 var failed=0
 for spec in [[1,"cl1-secret-r2","secret-1"],[1,"cl1-o1-q-tower","rowan-bonus"],[2,"cl2-secret-w2","secret-2"],[3,"cl3-secret-e2","secret-3"]]:
  var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%spec[0])))
  w.enter(spec[1],true);w.branch_entered[spec[2]]=true
  for part in w.data.world.tapes[spec[1]]:
   for i in range(int(part[0])):
    w.step(Inputs.decode(part[1]));w.update_region()
  var ok=w.secret_hearts.has(spec[2]) or w.branch_hearts.has(spec[2])
  print("PASS" if ok else "FAIL"," authored bonus route reaches purple heart: ",spec[2]," deaths=",w.active().deaths)
  if not ok: failed+=1
  w.shutdown()
 quit(1 if failed else 0)
