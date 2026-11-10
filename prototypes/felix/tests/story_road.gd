extends SceneTree
const World=preload("res://scripts/world.gd")
const Decode=preload("res://tests/workshop_routes.gd")
var failures=0
var world
var story
var cut_to_tale=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func settle_scene():
 for f in range(4000):
  if not story.blocking(): return
  story.tick(world,world.active(),1.0/60)
  consume_cut()
 push_error("Story scene failed to release control")
 failures+=1
func consume_cut():
 if story.get("cut")!=null and story.cut!="":
  var to=story.cut
  story.cut=""
  world.enter(to,true)
  if to=="story-walk-0": cut_to_tale=true
func tick(keys):
 settle_scene()
 var raw=Decode.decode(keys)
 if not story.gifts.get("sword",false) and not story.gifts.get("dagger",false): raw.strike=false
 if not story.gifts.get("counter",false): raw.parry=false
 raw.portal=false
 world.step(raw)
 world.update_region()
 story.tick(world,world.active(),1.0/60)
 consume_cut()
func _initialize(): run.call_deferred()
func run():
 for n in [2,3]:
  world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n)))
  story=(preload("res://scripts/woods_story.gd") if n==2 else preload("res://scripts/phantom_story.gd")).new(world)
  story.start()
  cut_to_tale=false
  var tape=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d-tour.json"%n)).tape
  for part in tape:
   for f in range(int(part[0])):
    tick(part[1])
    if cut_to_tale: break
   if cut_to_tale: break
  for f in range(700 if n==2 else 240):
   if cut_to_tale: break
   tick("l" if n==2 else "r")
  settle_scene()
  check(cut_to_tale,"chapter %d complete road enters imagined journey through its story scene"%n)
  check(story.done.get("knighted",false) if n==2 else story.done.get("handoff",false),"chapter %d required family scene occurs"%n)
  check(world.active().deaths==0,"chapter %d original road remains deathless"%n)
  var first=world.data.world.campaignWorkshop.rooms[0]
  for f in range(1600):
   if world.active_id==first: break
   tick("r")
  check(world.active_id==first,"chapter %d walks from story entrance into first puzzle"%n)
  if n==3:
   check(not story.in_car and not story.man.visible and not story.mom.visible and not story.boy.visible,"normal handoff leaves Felix visible and family at the lot")
  world.shutdown()
 print("STORY ROAD FAILURES ",failures)
 quit(1 if failures else 0)
