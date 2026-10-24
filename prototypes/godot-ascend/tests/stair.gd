extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json")))
 world.enter("cl1-bank-b62",true)
 var p=world.active().p
 p.x=8
 p.y=37
 for i in range(24):
  world.step({"l":true})
  world.update_region()
 print("entry ",world.active_id," ",world.position()," deaths ",world.active().deaths)
 var jumps=0
 var held=0
 var cooldown=0
 for f in range(1600):
  var core=world.active()
  if cooldown>0: cooldown-=1
  if core.p.onGround and held==0 and cooldown==0: held=12;cooldown=22;jumps+=1
  var jump=held>0
  if held>0: held-=1
  var x=world.position().x
  var top=world.position().y<=-810
  var target=3812 if not top else 3768
  var raw={"l":x>target+2,"r":x<target-2,"jump":jump}

  world.step(raw)
  world.update_region()
  if world.active_id=="cl1-atlas-crossroads": break
 print("top ",world.active_id," ",world.position()," deaths ",world.active().deaths," jumps ",jumps)
 var ok=world.active_id=="cl1-atlas-crossroads" and world.active().deaths==0
 for i in range(400):
  var core=world.active()
  var point=world.position()
  var target=3858 if point.y> -640 else 3820
  world.step({"r":point.x<target,"l":point.x>target+5,"d":true,"jump":core.p.onGround and i%3!=0})
  world.update_region()
  if world.active_id=="cl1-bank-b62": break
 print("return ",world.active_id," ",world.position()," deaths ",world.active().deaths)
 ok=ok and world.active_id=="cl1-bank-b62" and world.active().deaths==0
 world.shutdown()
 if not ok: push_error("Watch Stair must be traversable up and down with normal jumps")
 quit(0 if ok else 1)
