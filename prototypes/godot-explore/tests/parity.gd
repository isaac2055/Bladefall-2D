extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var args=OS.get_cmdline_user_args()
 var traces=JSON.parse_string(FileAccess.get_file_as_string(args[0]))
 var data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json"))
 var total=0
 var failures=0
 for test in traces:
  var world=World.new(data)
  world.regions[0].obstacles=[{"id":0,"type":"plat","x":500.0,"y":0.0,"w":10000.0,"h":20.0,"gone":false,"t":0.0}]
  world.regions[0].enemies=[]
  world.regions[0].npcs=[]
  world.regions[0].authored.blight=[]
  world.p.x=500.0
  for i in range(test.frames.size()):
   var entry=test.frames[i]
   world.step(entry.input)
   for key in entry.state:
    var actual=world.p[key]
    var expected=entry.state[key]
    var same=actual==expected if expected is bool else abs(float(actual)-float(expected))<0.00000001
    if not same:
     print("FAIL ",test.name," frame ",i," ",key," native ",actual," browser ",expected)
     failures+=1
     break
   total+=1
   if failures>0: break
  print("PASS " if failures==0 else "FAILED ",test.name)
  if failures>0: break
 print("Compared ",total," actual browser/native frames, failures ",failures)
 quit(0 if failures==0 else 1)
