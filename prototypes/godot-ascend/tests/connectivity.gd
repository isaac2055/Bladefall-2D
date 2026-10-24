extends SceneTree
const World=preload("res://scripts/world.gd")
func _initialize():
 var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json")))
 for core in world.cores.values():
  for e in core.ents:
   if e.type=="gate": e.open=true
   elif e.type=="held": e.solid=false
 var edges={}
 for a in world.regions:
  edges[a]=[]
  var ar=world.rectangles[a]
  for b in world.regions:
   if a==b: continue
   var br=world.rectangles[b]
   if not ar.grow(1).intersects(br): continue
   var axis=0 if abs(ar.end.x-br.position.x)<=8 or abs(br.end.x-ar.position.x)<=8 else 1
   var plane=(max(ar.position.x,br.position.x) if axis==0 else max(ar.position.y,br.position.y))
   var lo=max(ar.position.y,br.position.y) if axis==0 else max(ar.position.x,br.position.x)
   var hi=min(ar.end.y,br.end.y) if axis==0 else min(ar.end.x,br.end.x)
   var open=false
   for v in range(int(lo),int(hi)):
    var gx=plane-4 if axis==0 else v
    var gy=v if axis==0 else plane-6
    var core=world.cores[a]
    if world.blocker(core,gx-core.world_origin.x,gy-core.world_origin.y,8,11,-1)==-1:
     open=true
     break
   if open: edges[a].append(b)
 var reached={"cl1-o1-road":true}
 var queue=["cl1-o1-road"]
 while not queue.is_empty():
  var a=queue.pop_front()
  for b in edges[a]:
   if not reached.has(b): reached[b]=true;queue.append(b)
 for s in world.data.world.sections: print("main ",s.room," connected ",reached.has(s.room)," exits ",edges[s.room])
 print("unconnected ",world.regions.filter(func(id):return not reached.has(id)))
 var ok=true
 for section in world.data.world.sections:
  if not reached.has(section.room): ok=false
 for id in world.regions:
  if id not in ["cl1-passage-1-2","cl1-passage-1-3"] and not reached.has(id): ok=false
 for a in edges:
  for b in edges[a]:
   if a not in edges[b]: ok=false
 if "cl1-atlas-crossroads" in edges["cl1-o1-gate"]: ok=false
 print("PASS all main rooms and optional branches connect in both directions; no overlap between Gatehouse and Upper Watch" if ok else "FAIL physical connectivity")
 world.shutdown()
 quit(0 if ok else 1)
