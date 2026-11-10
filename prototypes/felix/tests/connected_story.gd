extends SceneTree
## Play all thirty original puzzle recordings, with real walking between them and no puzzle resets.
const World=preload("res://scripts/world.gd")
const Inputs=preload("res://tests/connected_route_inputs.gd")
const Stories=[preload("res://scripts/felix_story.gd"),preload("res://scripts/woods_story.gd"),preload("res://scripts/phantom_story.gd")]
class StoryRun:
 var story
 var heard=[]
 func _init(value): story=value
 func tick(world):
  story.tick(world,world.active(),1.0/60)
  for line in story.lines:
   if line.get("delay",0)<=0 and line.text not in heard: heard.append(line.text)
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
 return ok
func _initialize(): run.call_deferred()
func run():
 for chapter in [1,2,3]:
  var world=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%chapter)))
  var story=Stories[chapter-1].new(world)
  story.skip_prologue()
  var tracker=StoryRun.new(story)
  var rooms=world.data.world.campaignWorkshop.rooms
  world.enter(world.data.world.campaignWorkshop.walks[0],true)
  check(Inputs.next_puzzle(world,tracker,rooms[0]),"walk from chapter entrance to first puzzle")
  for i in range(rooms.size()):
   var id=rooms[i]
   if not check(world.active_id==id,"chapter %d reached %s"%[chapter,id]): break
   if not check(Inputs.settle_spawn(world,tracker),"walked to authored checkpoint "+id): break
   var completed=false
   for part in world.data.world.tapes.get(id,[]):
    for f in range(int(part[0])):
     Inputs.tick(world,tracker,part[1])
     if world.campaign_completed.has(id):
      completed=true
      break
    if completed: break
   if not check(completed,"original puzzle solved "+id):
    print("STOP ",world.active_id," ",world.active().p)
    break
   check(story.ride==null,"no transport after "+id)
   check(story.photos.count(id)==1,"story reward collected once "+id)
   check(world.checkpoint_id==id,"individual checkpoint retained "+id)
   if i<rooms.size()-1:
    if not check(Inputs.next_puzzle(world,tracker,rooms[i+1]),"physical connection to "+rooms[i+1]): break
  if chapter==1:
   check(Inputs.next_puzzle(world,tracker,story.SILL),"walk to windowsill ending")
  else:
   for f in range(12000):
    if story.cut!="": break
    tracker.tick(world)
   check(story.cut==("cl2-atlas-crossroads" if chapter==2 else "cl3-atlas-crossroads"),"chapter scene returns after final line")
   if story.cut!="":
    world.enter(story.cut,true)
    story.cut=""
  for f in range(1600): tracker.tick(world)
  check(story.phase=="end","chapter %d ending preserved"%chapter)
  check(story.photos.size()==10,"chapter %d all ten story rewards"%chapter)
  check(world.active().deaths==0,"chapter %d connected journey without deaths"%chapter)
  if chapter==2:
   for beat in story.TALE:
    check(beat[0] in tracker.heard and beat[1] in tracker.heard,"both tale lines reach the player: "+beat[0])
   for beat in story.INTERRUPTIONS: check(beat[2] in tracker.heard,"boy's interruption is retained: "+beat[2])
  if chapter==3:
   for beat in story.DRIVE:
    check(beat[0] in tracker.heard and beat[2] in tracker.heard,"both drive lines reach the player: "+beat[0])
   check(not story.in_car,"Felix leaves car state for drive gameplay")
  world.shutdown()
 print("CONNECTED STORY FAILURES ",failures)
 quit(1 if failures else 0)
