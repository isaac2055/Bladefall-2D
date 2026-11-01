extends SceneTree
## Physical witnesses, preparation states, nearby timings and search-state fidelity.
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const S=preload("res://tests/woods_search.gd")
var failed=false
var data
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func tape(i):return data.world.rooms[i].puzzleRoutes[0].tape
func play(i,parts,mode="",park_after=-1):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(Loader.parse(data.world.rooms[i]))
 if mode=="permanent":
  for e in c.ents:
   if e.type=="crumble":e.type="slide"
 if mode=="no_boost":c.K.liftXCap=0
 var q={"core":c,"finish":false,"waves":[],"advanced":false,"broke":false,"crossed_open_ceiling":false,"return_land":false,"return_refill":false,"low_catch":false}
 var dash={};var segment=0
 for part in parts:
  if segment==park_after:
   for e in c.ents:
    if e.type=="zip":e.x=e.ox if mode=="home" else e.tx;e.y=e.oy if mode=="home" else e.ty;e.remX=0;e.remY=0;e.type="slide"
  for f in range(int(part[0])):
   var raw=R.decode(part[1])
   if mode=="no_down" and c.p.state=="hook":raw.d=false
   c.step(raw);q.finish=q.finish or R.at_goal(c)
   if "dash-start" in c.events:dash={"air":not c.p.onGround,"down":raw.d and (raw.l or raw.r)}
   if "super" in c.events and dash.get("air",false) and dash.get("down",false):q.waves.append([c.frame,c.p.vx,c.p.vy,c.p.dashes])
   q.advanced=q.advanced or ["hyper","wallbounce","late-wallbounce","late-reverse"].any(func(e):return e in c.events)
   if c.p.get("hook")!=null and c.p.x>168 and c.p.x<256 and c.p.y>=235:q.low_catch=true
   for e in c.ents:
    if e.type=="crumble" and e.get("broken",false):
     q.broke=true
     if c.p.x>=184 and c.p.y<144:q.crossed_open_ceiling=true
    if e.type=="zip" and e.state=="back" and c.standing(e):
     q.return_land=q.return_land or "land" in c.events
     q.return_refill=q.return_refill or "refill-dash" in c.events
   if c.deaths>0:break
  if c.deaths>0:break
  segment+=1
 return q
func _initialize():
 data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world21.json"))
 for r in data.world.rooms:
  if r.has("puzzleGoal"):r.workshopGoal=r.puzzleGoal
 for i in range(41,44):
  var q=play(i,tape(i));check(q.finish and q.core.deaths==0 and q.waves.size()==1 and not q.advanced,"deathless one-dash/wavedash reference: "+data.world.rooms[i].name)
  check(data.world.rooms[i].dashes==1 and q.waves[0][2]==-52.5 and q.waves[0][3]==1,"wavedash preserves the charge needed for the exit: "+str(i))
 var ceiling=play(41,tape(41));check(ceiling.broke and ceiling.crossed_open_ceiling,"upper crumble is physically removed before the lower upward escape")
 check(not play(41,tape(41),"permanent").finish,"permanent ceiling rejects the complete reference")
 var settled=play(41,tape(41).slice(0,11)).core
 check(settled.p.onGround and settled.p.dashes==1 and settled.ents.any(func(e):return e.type=="crumble" and e.broken),"real lower rest after breaking the slab")
 var late=tape(41).duplicate(true);late[10][0]+=16
 check(play(41,late).finish,"sixteen additional settle frames fit the unchanged crumble duration")
 var hook=play(42,tape(42));check(hook.low_catch and not play(42,tape(42),"no_down").finish,"low rope contact clears the fixed divider; unchanged hanging reference fails")
 var rest=play(42,tape(42).slice(0,7)).core
 check(rest.p.onGround and rest.p.stamina==110 and rest.p.dashes==1 and rest.p.hook==null,"far shelf restores resources and ends the hook ride")
 var rope=play(42,tape(42).slice(0,3)).core;var snapshot=S.snapshot(rope)
 for f in range(24):rope.step(R.decode("g"))
 var uninterrupted=S.snapshot(rope);S.restore(rope,snapshot)
 for f in range(24):rope.step(R.decode("g"))
 check(JSON.stringify(S.snapshot(rope))==JSON.stringify(uninterrupted),"search snapshots preserve the moving ring alias and exact rope evolution")
 var returning=play(43,tape(43));check(returning.return_land and returning.return_refill,"returning roof supplies the actual landing and recovered dash")
 check(not play(43,tape(43),"home",17).finish and not play(43,tape(43),"far",17).finish,"both parked endpoints reject the reference from a valid prepared state")
 check(play(43,tape(43),"no_boost").finish,"return position remains useful without inherited horizontal momentum")
 var revised=data.world.rooms[43]
 for fixture in JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/next-fractured-bypasses.json")):
  data.world.rooms[43]=fixture.room.duplicate(true)
  if fixture.goal!=null:data.world.rooms[43].workshopGoal=fixture.goal
  var prior=play(43,fixture.tape,fixture.mode,fixture.parkAfter)
  data.world.rooms[43]=revised
  var saved_goal=revised.workshopGoal
  if fixture.goal!=null:revised.workshopGoal=fixture.goal
  var current=play(43,fixture.tape,fixture.mode,fixture.parkAfter)
  revised.workshopGoal=saved_goal
  check(prior.finish and prior.core.deaths==0 and not current.finish,"reproduced bypass rejected: "+fixture.label)
 for pair in [[41,10],[41,11],[41,12],[41,13],[42,2],[42,4],[42,11],[43,17],[43,18],[43,19],[43,20]]:
  var window=[]
  for delta in range(-8,9):
   var varied=tape(pair[0]).duplicate(true);varied[pair[1]][0]+=delta
   if varied[pair[1]][0]<1:continue
   var clears=false
   if pair[0]==42 and pair[1] in [2,4]:
    # The rest deliberately separates rope timing from the launch position.
    # Find an ordinary walk-and-settle continuation; never teleport the actor.
    var recovered=play(42,varied.slice(0,7)).core
    if recovered.p.onGround and recovered.p.stamina==110 and recovered.p.hook==null:
     for walk_frames in range(25):
      var q=play(42,varied.slice(0,7)+[[walk_frames,"r"],[10,""]]+tape(42).slice(9))
      if q.finish and q.core.deaths==0 and q.waves.size()==1 and not q.advanced:clears=true;break
   else:
    var q=play(pair[0],varied)
    clears=q.finish and q.core.deaths==0 and q.waves.size()==1 and not q.advanced
   if clears:window.append(delta)
  check(window.size()>=3,"nearby timing clears "+str(pair)+": "+str(window))
 print("NEXT FRACTURED PHYSICS ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
