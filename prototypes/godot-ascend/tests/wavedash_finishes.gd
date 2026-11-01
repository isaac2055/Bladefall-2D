extends SceneTree
## Preserve the accepted carriage and reproduce shortcuts before rejecting them.
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Codec=preload("res://authoring/codec.gd")
const R=preload("res://tests/workshop_routes.gd")
const S=preload("res://tests/woods_search.gd")
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func run_tape(c,tape):
 var finish=false
 for part in tape:
  for f in range(int(part[0])):
   c.step(R.decode(part[1]));finish=finish or R.at_goal(c)
   if c.deaths>0:return false
 return finish
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 var fixture=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/wavedash-finish-regressions.json"))
 for old in fixture.unchangedRooms:
  var current=d.world.rooms.filter(func(r):return r.id==old.id)[0]
  current=current.duplicate(true)
  if current.id=="cl21-atlas-crossroads":
   # Later approved rooms extend only this incoming link, not its geometry.
   current.atlasMain.to="cl21-puzzle-door-shut";current.atlasMain.toFloor=21.0
   current.atlasSockets[0].to="cl21-puzzle-door-shut";current.atlasSockets[0].toFloor=21.0
  check(old.fingerprint==Codec.fingerprint(current),"unchanged accepted room: "+old.name)
 for id in fixture.unchangedTapes:check(Codec.fingerprint(d.world.tapes[id])==fixture.unchangedTapes[id],"unchanged recording: "+id)
 for room in d.world.rooms:
  if room.has("puzzleGoal"):room.workshopGoal=room.puzzleGoal
 for list in [fixture.previousFinishRooms,fixture.bypasses]:
  for item in list:
   var old=d.duplicate(true);old.world.rooms[item.index]=item.room.duplicate(true);old.world.rooms[item.index].workshopGoal=item.room.puzzleGoal
   check(R.play(old,item.index,item.tape).finish and not R.play(d,item.index,item.tape).finish,"former super/ground-hyper shortcut clears its original layout and fails the wavedash revision: "+str(item.index))
 # Test the full range of supported starting positions on each small landing.
 # Grounded hypers get their coyote window; ordinary jumps retain the dash.
 for index in [38,40]:
  var r=d.world.rooms[index];var c=Core.new(d.constants,d.playerDefaults);c.load_room(Loader.parse(r))
  run_tape(c,r.puzzleRoutes[0].tape.slice(0,13 if index==38 else 32))
  var state=S.snapshot(c);var escapes=0;var attempts=0
  for x in range(int(r.puzzleWavedashPad[0])-7,int(r.puzzleWavedashPad[0])+8):
   for wait in range(1,41):
    for keys in ["rdx","rj"]:
     S.restore(c,state);c.p.x=x;c.p.remX=0
     var candidate=[[wait,keys],[45,"rj"],[65,"r"]] if keys=="rdx" else [[wait,"rj"],[12,"rux"],[65,"r"]]
     if run_tape(c,candidate):escapes+=1
     attempts+=1
   for wait in range(1,41):
    S.restore(c,state);c.p.x=x;c.p.remX=0
    if run_tape(c,[[wait,"rj"],[12,"rx"],[65,"r"]]):escapes+=1
    attempts+=1
  check(escapes==0,"no grounded hyper or ordinary jump/dash escape from any supported landing position: "+str(index)+" · "+str(attempts)+" attempts, "+str(escapes)+" escapes")
 print("WAVEDASH FINISHES ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
