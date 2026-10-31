extends SceneTree
## Physical route evidence, preparation states, counterfactuals and timing variations.
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
var data
var failed=false
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func tape(i):return data.world.rooms[i].puzzleRoutes[0].tape
func entity(c,type):return c.ents.filter(func(e):return e.type==type)[0]
func replay(i,parts,mode=""):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults)
 c.load_room(Loader.parse(data.world.rooms[i]))
 if mode=="held_open":
  for e in c.ents:
   if e.type=="held":e.latchedOpen=true
 var finish=false;var supers=[];var advanced=false;var minimum_stamina=110.0
 for part in parts:
  for f in range(int(part[0])):
   if mode=="fixed_stone":
    for e in c.ents:
     if e.type=="slide":e.x=e.ox;e.y=e.oy;e.moving=false
   c.step(R.decode(part[1]));finish=finish or R.at_goal(c)
   minimum_stamina=min(minimum_stamina,c.p.stamina)
   if "super" in c.events:supers.append([c.p.vx,c.p.vy])
   advanced=advanced or ["hyper","ultra","wallbounce","late-wallbounce","late-reverse"].any(func(e):return e in c.events)
   if c.deaths>0:break
  if c.deaths>0:break
 return {"core":c,"finish":finish,"supers":supers,"advanced":advanced,"minimum_stamina":minimum_stamina}
func _initialize():
 data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 for r in data.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 for i in range(38,41):
  var q=replay(i,tape(i))
  check(q.finish and q.core.deaths==0 and not q.advanced and q.minimum_stamina>=0,"deathless taught-kit clear: "+data.world.rooms[i].name)
  check(data.world.rooms[i].dashes==1 and q.supers.all(func(s):return abs(s[0])==260 and s[1]==-105),"one dash, ordinary supers and no hyper launch: "+str(i))
 var prepared=replay(38,tape(38).slice(0,10)).core
 check(entity(prepared,"slide").x==144 and entity(prepared,"slide").y==248 and prepared.p.onGround,"lowered stone creates the stable floor beneath the roof")
 check(not replay(38,tape(38),"fixed_stone").finish,"original stone position cannot execute the prepared route")
 var stable=tape(38).duplicate(true);stable[9][0]+=180
 check(replay(38,stable).finish,"lowered runway waits without a timing deadline")
 var front=replay(39,tape(39).slice(0,2)).core
 var front_zip=entity(front,"zip")
 check(front.p.x==front_zip.x+front_zip.w and front.p.state=="climb","outward trip uses the leading face")
 var rest=replay(39,tape(39).slice(0,4)).core
 check(rest.p.onGround and rest.p.stamina==110,"far alcove permits full stamina recovery")
 var back=replay(39,tape(39).slice(0,10)).core
 check(back.p.x+back.p.w==entity(back,"zip").x and back.p.state=="climb","return catches the opposite face")
 check(not R.play(data,39,tape(39),"static").finish,"parked carriage cannot execute the full route")
 for former in JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/fractured-carriage-bypass.json")):
  var goal_before=data.world.rooms[39].workshopGoal
  if former.has("goal"):data.world.rooms[39].workshopGoal=former.goal
  var revised=R.play(data,39,former.tape,former.mode)
  data.world.rooms[39].workshopGoal=goal_before
  var old=data.duplicate(true);old.world.rooms[39]=former.room
  var positive=R.play(old,39,former.tape,former.mode)
  check(positive.finish and positive.deaths==0 and not revised.finish,"reproduced shortcut rejected: "+former.label)
 var initial=replay(40,[[30,""]]).core
 check(entity(initial,"plate").down and not entity(initial,"held").solid,"initial resting lantern holds the outward door open")
 var withdrawn=replay(40,tape(40).slice(0,25)+[[2,""]]).core
 check(withdrawn.p.carrying!=null and entity(withdrawn,"held").solid,"withdrawing the weight closes the future runway safely below the player")
 var aside=replay(40,tape(40).slice(0,30)).core
 check(aside.p.carrying==null and not entity(aside,"plate").down and entity(aside,"held").solid,"set-aside load leaves a stable empty switch and closed launch surface")
 check(not replay(40,tape(40),"held_open").finish,"permanently open door removes the required final runway")
 for open_bypass in JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/fractured-door-bypass.json")):
  var revised_door=replay(40,open_bypass.tape,"held_open")
  var actual=data.world.rooms[40];data.world.rooms[40]=open_bypass.room
  var former_door=replay(40,open_bypass.tape,"held_open");data.world.rooms[40]=actual
  check(former_door.finish and former_door.core.deaths==0 and not revised_door.finish,"reproduced open-door shortcut rejected: "+open_bypass.label)
 for pair in [[38,11],[38,12],[39,9],[39,10],[40,30],[40,31]]:
  var window=[]
  for dt in range(-8,9):
   var varied=tape(pair[0]).duplicate(true);varied[pair[1]][0]+=dt
   var q=replay(pair[0],varied)
   if q.finish and q.core.deaths==0 and not q.advanced:window.append(dt)
  check(window.size()>=5,"nearby clear timings "+str(pair)+": "+str(window))
 print("FRACTURED PUZZLES ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
