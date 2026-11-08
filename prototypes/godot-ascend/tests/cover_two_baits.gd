extends SceneTree
## Ordinary-input witnesses for two opposed lures; no AI/physics overrides.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
var checks=0
func check(ok,label):
 checks+=1;print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func play(d,tape,mode=""):
 var r=d.world.rooms[41].duplicate(true);r.workshopGoal=r.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(r))
 if mode=="no_brute":c.combat.enemies=[]
 if mode=="no_first_line":c.ents=c.ents.filter(func(e):return e.type!="zipline" or e.li!=0)
 if mode=="no_finish_line":c.ents=c.ents.filter(func(e):return e.type!="zipline" or e.li!=1)
 var doors=c.ents.filter(func(e):return e.type=="brittle")
 if mode=="first_sealed":doors[0].type="combatGate"
 if mode=="second_sealed":doors[1].type="combatGate"
 var q={"finish":false,"exited":false,"deaths":0,"turn":-1,"tells":[],"breaches":[],"rides":[],"first_open":false,"second_open":false,"alive":false};var frame=0
 for part in tape:
  for tick in range(int(part[0])):
   frame+=1;var raw=R.decode(part[1])
   if mode=="no_turn":raw.strike=false
   c.step(raw)
   if "hinge-turn" in c.events and q.turn<0:q.turn=frame
   var enemy=c.combat.enemies[0] if not c.combat.enemies.is_empty() else {}
   if "enemy-tell" in c.events:q.tells.append({"frame":frame,"face":enemy.face,"p":[c.p.x,c.p.y]})
   if "breach" in c.events:q.breaches.append({"frame":frame,"face":enemy.face,"p":[c.p.x,c.p.y],"doors":doors.map(func(e):return e.open)})
   if "zip-in" in c.events:q.rides.append(c.p.ride.li)
   q.finish=q.finish or R.at_goal(c);q.exited=c.exited
   if c.deaths>0:break
  if c.deaths>0:break
 q.deaths=c.deaths;q.first_open=doors[0].open;q.second_open=doors[1].open
 q.alive=c.combat.enemies.size()==1 and not c.combat.enemies[0].get("dead",false) and not c.combat.enemies[0].felled
 q.p=[c.p.x,c.p.y]
 return q
func clears(q):return q.finish and q.deaths==0
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"));var r=d.world.rooms[41];var t=r.puzzleRoutes[0].tape
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/cover-two-baits-preservation.json"))
 for id in old.rooms:check(d.world.rooms.any(func(room):return room.id==id and JSON.stringify(room).sha256_text()==old.rooms[id]),"other room unchanged: "+id)
 check(old.tapes.keys().all(func(id):return JSON.stringify(d.world.tapes[id]).sha256_text()==old.tapes[id]),"every other Watch recording unchanged")
 var metadata=d.world.duplicate(true);metadata.erase("rooms");metadata.erase("tapes")
 check(JSON.stringify(metadata).sha256_text()==old.metadata,"placements, checkpoints, requirements, passages and all chapter metadata unchanged")
 check(range(r.map.size()).all(func(i):return r.map[i].substr(48)==old.finish_map[i]) and r.puzzleGoal==old.goal and t.slice(35)==old.finish_tape and r.lines[1].b==old.finish_lines[0].b and r.lines[1].setDown==old.finish_lines[0].setDown and r.lines[2]==old.finish_lines[1],"original finishing geometry, destination, flag, input sequence and exit retained")
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23-tour.json"));var prefix="";var count=0
 for part in tour.tape:
  for tick in range(int(part[0])):
   if count>=int(old.tour_prefix_frames):break
   prefix+=part[1]+"\n";count+=1
  if count>=int(old.tour_prefix_frames):break
 check(count==int(old.tour_prefix_frames) and prefix.sha256_text()==old.tour_prefix_hash,"all 14,476 input frames before entering the revised room remain exact")
 var q=play(d,t)
 check(clears(q) and q.exited and q.alive,"both opposed breaches, flag and physical exit without deaths or killing the brute")
 check(q.breaches.size()==2 and q.breaches[0].face==-1 and q.breaches[1].face==1 and q.breaches[0].doors==[true,false] and q.breaches[1].doors==[true,true],"separate left then right charges open exactly one barrier each")
 check(q.tells[0].frame>q.turn and q.tells[0].p[0]>=128 and q.tells[0].p[0]<160 and q.tells[0].p[1]>=368,"first charge requires descending into the exposed left bait pocket")
 var right=q.tells.filter(func(e):return e.face==1)
 check(not right.is_empty() and right[0].frame>q.breaches[0].frame and right[0].p[0]>=264 and right[0].p[0]<296 and right[0].p[1]>=368,"opposite charge requires the lower right bait pocket after the first breach")
 check(q.breaches[0].p[1]==325 and q.breaches[1].p[1]==341 and q.rides==[0,1,2],"escape to sheltered perches, cross through first alcove, then enter the separately opened finish alcove")
 for item in [[4,false],[10,false],[18,true],[20,true],[22,true]]:
  var wait=play(d,t.slice(0,item[0])+[[1200,""]])
  check(wait.deaths==0 and wait.first_open==item[1] and not wait.second_open and (item[1] or wait.tells.is_empty()),"waiting safely does not replace a lure at stage "+str(item[0]))
 for mode in ["no_turn","no_brute","first_sealed","second_sealed","no_first_line","no_finish_line"]:
  check(not clears(play(d,t,mode)),"required route dependency: "+mode)
 check(not clears(play(d,old.old_tape)),"previous automatic-cover solution no longer clears")
 for skip in [[13,15],[27,29]]:
  var hit=play(d,t.slice(0,skip[0])+t.slice(skip[1]))
  check(hit.deaths>0 and not hit.finish,"standing in a committed charge requires an escape: "+str(skip))
 var skip_second=play(d,t.slice(0,22)+t.slice(30))
 check(not skip_second.second_open and not skip_second.finish,"first breach and crossing alone do not open the final alcove")
 for segment in [8,12,13,14,16,26,27,28,31]:
  var wins=[]
  for delta in range(-2,3):
   var varied=t.duplicate(true);varied[segment][0]=max(1,varied[segment][0]+delta)
   if clears(play(d,varied)):wins.append(delta)
  check(wins.size()>=3 and 0 in wins,"nearby successful bait/escape inputs at "+str(segment)+": "+str(wins))
 print("COVER TWO BAITS ","FAILED" if failed else "PASSED"," · ",checks," checks")
 quit(1 if failed else 0)
