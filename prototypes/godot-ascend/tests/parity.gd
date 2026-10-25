extends SceneTree
const Loader = preload("res://scripts/room_loader.gd")
const Core = preload("res://scripts/core.gd")
func _initialize():
 var data = JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json"))
 var tests = JSON.parse_string(FileAccess.get_file_as_string(OS.get_cmdline_user_args()[0]))
 var failed = 0
 var count = 0
 for test in tests:
  var parsed = test.parsed
  var sim = Core.new(data.constants,data.playerDefaults)
  var native_room = Loader.parse(parsed.def)
  if not equivalent(native_room.grid,parsed.grid):
   print("FAIL native tile parser ",test.id," sizes ",native_room.grid.size()," / ",parsed.grid.size())
   for i in range(min(native_room.grid.size(),parsed.grid.size())):
    if native_room.grid[i]!=parsed.grid[i]: print("cell ",i,": ",native_room.grid[i]," / ",parsed.grid[i])
   quit(1)
   return
  if not equivalent(native_room.entities,parsed.entities):
   print("FAIL native entity parser ",test.id)
   quit(1)
   return
  sim.load_room(native_room)
  var name = test.get("label",test.id)
  var index = 0
  var failure = ""
  for f in test.frames:
   sim.step(f.raw)
   for key in f.state:
    var actual = sim.p.get(key)
    var expected = f.state[key]
    if actual==null and expected is bool and not expected: continue
    if (expected is float or expected is int) and (actual is float or actual is int):
     if abs(actual-expected)<=0.00000001: continue
    elif actual==expected: continue
    failure = "%s frame %d · %s expected %s got %s" % [name,index+1,key,str(expected),str(actual)]
    break
   if failure=="" and f.has("combat") and f.combat!=null and not equivalent(sim.combat,f.combat):
    failure="%s frame %d · combat expected %s got %s"%[name,index+1,JSON.stringify(f.combat),JSON.stringify(sim.combat)]
   if failure=="" and f.has("bruteWaves") and not equivalent(sim.brute_waves,f.bruteWaves):
    failure="%s frame %d · shockwave mismatch"%[name,index+1]
   if failure=="":
    for i in range(f.entities.size()):
     for key in f.entities[i]:
      var expected = f.entities[i][key]
      var actual = sim.ents[i].get(key)
      if expected is float or expected is int:
       if (actual is float or actual is int) and abs(expected-actual)<=0.00000001: continue
      elif expected==actual: continue
      failure = "%s frame %d entity %d · %s expected %s got %s" % [name,index+1,i,key,str(expected),str(actual)]
      break
     if failure!="": break
   if failure!="": break
   var carrying = sim.p.carrying.id if sim.p.carrying!=null else null
   if carrying!=f.carrying:
    failure = "%s frame %d · carried object mismatch" % [name,index+1]
    break
   if sim.freeze!=f.freeze or sim.exited!=f.exited or sim.deaths!=f.deaths:
    failure = "%s frame %d · lifecycle mismatch" % [name,index+1]
    break
   index += 1
   count += 1
  if failure!="":
   failed += 1
   print("FAIL ",failure)
  else: print("PASS ",name," · ",index," frames")
 print("Compared ",count," frames; ",failed," of ",tests.size()," traces failed")
 quit(1 if failed>0 else 0)

func equivalent(a,b):
 if (a is float or a is int) and (b is float or b is int): return abs(a-b)<0.00000001
 if a is Array and b is Array:
  if a.size()!=b.size(): return false
  for i in range(a.size()):
   if not equivalent(a[i],b[i]): return false
  return true
 if a is Dictionary and b is Dictionary:
  if a.size()!=b.size(): return false
  for key in a:
   if not b.has(key) or not equivalent(a[key],b[key]): return false
  return true
 return a==b
