extends SceneTree
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Routes=preload("res://tests/workshop_routes.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var failed=false
var checks=0
func check(ok,label):
 checks+=1;print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func make(d,index):
 var r=d.world.rooms[index].duplicate(true);r.workshopGoal=r.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(Loader.parse(r));return c
func play(d,index,tape,mode=""):
 var c=make(d,index)
 if mode=="no_lantern":c.ents=c.ents.filter(func(e):return e.type!="lantern")
 if mode=="no_boost":c.K.liftYCap=0
 var q={"finish":false,"deaths":0,"events":[],"turns":[],"landings":[],"receiver_loaded":false,"handoff":false,"low_entry":false,"braked":false};var frame=0
 for part in tape:
  for tick in range(int(part[0])):
   var raw=Routes.decode(part[1])
   if mode=="no_turn":raw.strike=false
   if mode=="no_dash":raw.dash=false
   if mode=="no_wallbounce" and c.p.state=="dash":raw.jump=false
   c.step(raw);frame+=1
   for event in c.events:q.events.append(event)
   if "hinge-turn" in c.events:q.turns.append([frame,c.p.x,c.p.y,c.p.onGround])
   if "land" in c.events:q.landings.append([frame,c.p.x,c.p.y])
   if index==0:
    var receiver=c.ents.filter(func(e):return e.type=="recoilPlatform" and e.label=="Receiver")[0]
    q.receiver_loaded=q.receiver_loaded or receiver.loadedBy=="lantern" and c.p.x<304
    q.handoff=q.handoff or receiver.loadedBy=="knight" and c.p.carrying!=null
    q.low_entry=q.low_entry or c.p.x>=328 and c.p.x<360 and c.p.y>=216 and c.p.y+11==248
    q.braked=q.braked or c.p.x>=312 and c.p.x<=320 and c.p.onGround and c.p.y+11==224
   q.finish=q.finish or Routes.at_goal(c)
   if c.deaths>0:break
  if c.deaths>0:break
 q.deaths=c.deaths;q.core=c
 return q
func clears(q):return q.finish and q.deaths==0
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-launch-rooms.json"))
 var preservation=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-launch-preservation.json"))
 for path in preservation:
  # Export remaps scripts/scenes to compiled resources; raw identity is checked
  # in source, JSON identity and compiled availability in the shipping pack.
  if path.ends_with(".json") or FileAccess.file_exists("res://"+path):
   check(FileAccess.get_sha256("res://"+path)==preservation[path],"existing chapter or bank preserved: "+path)
  else:check(ResourceLoader.exists("res://"+path),"preserved resource available in compiled pack: "+path)
 var canonical=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 check(d.constants==canonical.constants and d.playerDefaults==canonical.playerDefaults,"unchanged movement, carry and recoil rules")
 check(d.world.rooms.size()==2 and d.world.requiredMainRooms==d.world.rooms.map(func(r):return r.id),"two independent rooms in the proposed order")
 var native=load(d.nativeScene).instantiate();var base=Authoring.baseline(d);var compiled=native.compile_into(base)
 check(Codec.first_difference(base,compiled)=="" and native.validate_data(compiled).is_empty(),"native editable rooms validate and round-trip without loss");native.free()
 for index in [0,1]:
  var r=d.world.rooms[index];var tape=r.puzzleRoutes[0].tape;var q=play(d,index,tape)
  check(clears(q),"deathless ordinary-input reference: "+r.name)
  check("recoil-jump" in q.events,"stored launch occurs: "+r.name)
  check(d.world.tapes[r.id]==tape and r.lock==["parry","portal"],"complete Watch tape and original movement kit: "+r.name)
  check(clears(play(d,index,tape+[[600,""]])),"completed flag remains safe: "+r.name)
  for mode in (["no_lantern","no_boost","no_dash"] if index==0 else ["no_turn","no_boost","no_dash","no_wallbounce"]):
   check(not clears(play(d,index,tape,mode)),"reference dependency "+str(index)+": "+mode)
  if index==0:
   check(q.receiver_loaded and q.handoff and q.low_entry and q.braked,"lantern arrives first, brake beside roof, enter below, then hand load to knight")
   check(q.events.count("throw")==3 and q.events.count("pickup")==3,"set down, send ahead, retrieve and throw clear")
   var after_landing=tape.slice(0,14)+[[1200,""]]
   check(play(d,index,after_landing).deaths==0,"small receiving shelf allows a safe pause before descent")
  else:
   check(q.turns.size()==1 and not q.turns[0][3] and q.events.count("wallbounce")==1,"fold the roof while airborne, then bounce from its wall pose")
   check(q.core.ents.filter(func(e):return e.type=="hingeArm")[0].dir=="down","roof finishes as the hanging launch wall")
  var recovery=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-launch-recovery-"+("a" if index==0 else "b")+".json"))
  check(clears(play(d,index,recovery)),"a missed transfer recovers locally without restarting: "+r.name)
  for segment in ({0:[2,7,9,10,11,12,15,16,17,20,24],1:[0,2,3,5,6]}[index]):
   var wins=[]
   for delta in range(-2,3):
    var varied=tape.duplicate(true);varied[segment][0]=max(1,varied[segment][0]+delta)
    if clears(play(d,index,varied)):wins.append(delta)
   check(0 in wins and wins.size()>=3,"nearby successful input timings "+str(index)+":"+str(segment)+" "+str(wins))
 var app=Main.instantiate();app.test_mode=true;app.causeway_launch_rooms=true;app.initial_world=23;root.add_child(app);await process_frame;app.set_physics_process(false)
 check(app.data.world.rooms.size()==2 and app.room_picker.item_count==2,"actual launch mode exposes exactly the two new rooms")
 app.workshop_next.emit_signal("pressed");check(app.sim.room.id==d.world.rooms[1].id,"Next opens the second room")
 app.workshop_previous.emit_signal("pressed");check(app.sim.room.id==d.world.rooms[0].id,"Previous returns to the first room")
 for index in [0,1]:
  var id=d.world.rooms[index].id;app.world.restart();app.watch=false;app.load_section(index)
  check(app.world.checkpoint_id==id,"independent room checkpoint: "+id)
  app.show_workshop_hint();check(app.notice_label.text==d.world.rooms[index].hint,"optional hint matches this room")
  app.watch=true;app.load_section(index);var sim=app.sim;var reached=false
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60);reached=reached or Routes.at_goal(sim)
  check(reached and sim.deaths==0,"actual Watch reaches the flag without deaths: "+id)
  app.watch=false;app.world.restart();app.load_section(index);app.journey=[];app.journey_frame=0
  for part in d.world.rooms[index].puzzleRoutes[0].tape:
   for tick in range(int(part[0])):
    app.journey.append(part[1]);app._physics_process(1.0/60)
  check(app.workshop_completed.has(id) and app.sim.deaths==0,"live application records room completion: "+id)
  app.retry_room()
  check(app.sim.room.id==id and app.world.checkpoint_id==id and app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.y==e.oy and e.charge==0) and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.dir=="right" and e.turns==0) and app.sim.p.carrying==null,"retry restores initial machinery at this room's checkpoint")
 app.queue_free();await process_frame
 var regular=Main.instantiate();regular.test_mode=true;regular.initial_world=23;root.add_child(regular);await process_frame;regular.set_physics_process(false)
 check(regular.data.world.rooms.size()==43,"normal chapter still loads its unchanged 43 definitions");regular.queue_free();await process_frame
 print("CAUSEWAY LAUNCH ROOMS ","FAILED" if failed else "PASSED"," · ",checks," checks");quit(1 if failed else 0)
