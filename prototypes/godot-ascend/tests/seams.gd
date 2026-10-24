extends SceneTree
const Core = preload("res://scripts/core.gd")
const Loader = preload("res://scripts/room_loader.gd")
func _initialize():
 var data = JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json"))
 var fixtures = JSON.parse_string(FileAccess.get_file_as_string(OS.get_cmdline_user_args()[0]))
 for f in fixtures:
  var d = data.world.rooms.filter(func(r):return r.id==f.to)[0]
  var sim = Core.new(data.constants,data.playerDefaults)
  sim.load_room(Loader.parse(d))
  sim.carry_from(f.snapshot,f.source,f.target,f.continuous)
  for key in f.expected:
   var a = sim.p.get(key)
   var b = f.expected[key]
   if a==null and b is bool and not b: continue
   if (a is float or a is int) and (b is float or b is int) and abs(a-b)<0.00000001: continue
   if a==b: continue
   print("FAIL seam ",f.from," → ",f.to," ",key," ",a," != ",b)
   quit(1)
   return
  if (not sim.body_solid(0,0))!=f.clear:
   print("FAIL seam collision ",f.to)
   quit(1)
   return
  print("PASS seam ",f.from," → ",f.to)
 print("PASS: ",fixtures.size()," browser/native room transfers")
 quit(0)
