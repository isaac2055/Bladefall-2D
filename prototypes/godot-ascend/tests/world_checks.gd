extends SceneTree
const Sound=preload("res://scripts/audio.gd")
const World=preload("res://scripts/world.gd")
var world
func check(ok,message):
 if not ok:
  push_error(message)
  if world!=null: world.shutdown()
  quit(1)
  return false
 print("PASS ",message)
 return true
func frames(n,input):
 for i in range(n):
  world.step(input)
  world.update_region()
func start(id,x=-1,y=-100000):
 world.enter(id,true)
 if x>=0: world.active().p.x=x
 if y> -100000: world.active().p.y=y
func _initialize(): run.call_deferred()
func run():
 world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world1.json")))
 if not check(world.cores.size()==30,"all authored rooms and the repaired watch stair are preloaded"): return
 var gate=world.cores["cl1-o1-gate"]
 var lamp=gate.ents.filter(func(e):return e.type=="lantern")[0]
 var same=gate.get_instance_id()
 if not check(lamp.x>0 and world.cores["cl1-bank-b62"].sweepers.size()>0,"unentered rooms already have lanterns, gates and moving hazards"): return
 start("cl1-o1-camp",300,133)
 frames(40,{"r":true})
 print("floor",world.active_id,world.position(),world.active().deaths)
 if not check(world.active_id=="cl1-o1-q-yard" and world.active().deaths==0 and abs(world.position().y-133)<1,"walk across the screenshot's visible floor beside the camp fire"): return
 frames(48,{"l":true})
 if not check(world.active_id=="cl1-o1-camp" and world.active().deaths==0,"walk back from the Bell Yard into Camp Echo"): return
 if not check(gate.get_instance_id()==same,"room traversal never reconstructs preloaded room state"): return
 start("cl1-o1-verge",4,133)
 frames(20,{"l":true})
 if not check(world.active_id=="cl1-o1-road","backtrack through an earlier road doorway"): return
 start("cl1-o1-gate",44,133)
 frames(1,{"grab":true})
 if not check(world.active().p.carrying!=null,"pick up the real Gatehouse lantern"): return
 frames(44,{"l":true})
 if not check(world.active_id=="cl1-o1-yard" and world.active().p.carrying!=null,"carry the lantern backwards through a room boundary"): return
 world.retry()
 var returned=world.cores["cl1-o1-gate"].ents.any(func(e):return e.type=="lantern" and not e.get("held",false))
 if not check(returned,"retry safely returns a carried foreign object to its home room"): return
 start("cl1-o1-camp",272,40)
 for e in world.active().ents:
  if e.type=="gate": e.open=true
 world.active().p.facing=-1
 world.active().p.onGround=false
 frames(104,{"grab":true,"u":true})
 if not check(world.active_id=="cl1-o1-lookout" and world.active().deaths==0,"climb the real shaft from Camp Echo into the preloaded Lookout"): return
 frames(50,{})
 frames(1,{"d":true,"jump":true})
 frames(70,{"d":true})
 if not check(world.active_id=="cl1-o1-camp" and world.active().deaths==0,"drop back through the Lookout landing into Camp Echo"): return
 world.restart()
 for id in ["cl1-o1-camp","cl1-o1-cut","cl1-o1-muster"]:
  start(id)
  var name=world.active().room.def.bearing
  var tape=world.data.world.tapes[id+"#bearing"]
  var count=0
  for part in tape:
   for i in range(int(part[0])):
    if world.bearings.has(name): break
    var raw={}
    for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"]]: raw[pair[0]]=pair[1] in part[1]
    frames(1,raw)
    count+=1
   if world.bearings.has(name): break
  print("bearing route ",id," frames ",count," p ",world.position()," deaths ",world.active().deaths)
  if not check(world.bearings.has(name),"normal movement collects "+name+" on its actual authored route"): return
 if not check(world.mara_complete and world.bearings.size()==3,"collecting all three actual shard entities records Ash, Glass and Iron"): return
 var audio=Sound.new()
 audio.world_runtime=world
 root.add_child(audio)
 await create_timer(0.1).timeout
 for i in range(180):
  var left=world.active().p.x>268
  frames(1,{"l":left})
  audio.tick(world.active(),1.0/60.0)
  if world.mara_registered: break
 if not check(world.mara_registered and audio.active_voice.id=="ascend/w1-o1-muster.mara.done","walk back down to Mara and hear the existing completed-chart acknowledgement"): return
 audio.shutdown()
 await create_timer(0.1).timeout
 audio.queue_free()
 await process_frame
 world.retry()
 if not check(world.mara_complete,"retry preserves collected bearings"): return
 world.active().die()
 frames(50,{})
 if not check(world.mara_complete and world.mara_registered and world.bearings.size()==3,"normal death and respawn preserve Mara completion and all three bearings"): return
 world.restart()
 if not check(world.bearings.is_empty() and not world.mara_complete and world.active_id=="cl1-o1-road" and world.active().deaths==0,"full-world restart clears progress, deaths, items and location"): return
 world.shutdown()
 world=null
 await create_timer(0.15).timeout
 quit(0)
