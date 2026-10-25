extends SceneTree
const World=preload("res://scripts/world.gd")
var world
func _initialize():
 world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world2.json")))
 world.enter("cl2-w2-kitchen",true)
 for frame in range(240):
  var input={"r":frame>=10 and frame<27,"jump":frame>=1 and frame<20,"grab":true,"u":true}
  world.step(input)
  world.update_region()
 for frame in range(121):
  var input={"l":frame<12,"r":frame>=12 and frame<18 or frame>=26,"jump":frame>=18 and frame<40,"grab":frame>=26,"u":true}
  world.step(input)
  world.update_region()
 var entered=world.active_id=="cl2-w2-q-fork" and world.active().deaths==0
 for frame in range(95):
  world.step({"l":frame<32,"d":frame>=32,"jump":frame==33})
  world.update_region()
 var returned=world.active_id=="cl2-w2-kitchen" and world.active().deaths==0
 print("BRANCH ENTRY ",entered," RETURN ",returned)
 if entered and returned: print("PASS normal-input climb from the kitchen into the fork and drop back through the same shaft · no deaths")
 else: push_error("Kitchen / branch traversal failed")
 world.shutdown()
 quit(0 if entered and returned else 1)
