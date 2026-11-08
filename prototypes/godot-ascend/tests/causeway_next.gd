extends SceneTree
## The next three Causeway puzzles: physical ordering, sight cover, split delivery,
## powered finishes, preservation, native editing and real application playback.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
const Main=preload("res://main.tscn")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
var failed=false
var checks=0
func check(ok,label):
 checks+=1;print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func make(d,index):
 var room=d.world.rooms[index].duplicate(true);room.workshopGoal=room.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(room));return c
func play(d,index,tape,mode=""):
 var c=make(d,index)
 if mode=="no_lantern":c.ents=c.ents.filter(func(e):return e.type!="lantern")
 if mode=="no_lines":c.ents=c.ents.filter(func(e):return e.type!="zipline")
 if mode=="no_return":c.ents=c.ents.filter(func(e):return e.type!="zipline" or e.li!=1)
 if mode=="no_outbound":c.ents=c.ents.filter(func(e):return e.type!="zipline" or e.li!=0)
 if mode=="no_brute":c.combat.enemies=[]
 var q={"finish":false,"exited":false,"deaths":0,"turns":[],"rides":0,"wave":false,"first_turn":-1,"first_tell":-1,"breach":-1,"delivery":-1,"sent_separately":false,"lamp_holds_finish":false,"alive":true}
 var previous={};var trace={};var frame=0
 for e in c.ents:
  if e.type=="hingeArm":previous[e.label]=e.dir
 for part in tape:
  for tick in range(int(part[0])):
   var raw=R.decode(part[1]);frame+=1
   if mode=="no_turn":raw.strike=false
   if mode=="no_far_restore" and frame>400 and c.p.y<260:raw.strike=false
   if mode=="keep_lantern" and frame>100 and c.p.carrying!=null:raw.grab=false
   c.step(raw)
   q.finish=q.finish or R.at_goal(c);q.exited=c.exited
   if "enemy-tell" in c.events and q.first_tell<0:q.first_tell=frame
   if "breach" in c.events:q.breach=frame
   if "zip-in" in c.events:q.rides+=1
   if "dash-start" in c.events:trace={"air":not c.p.onGround,"down":false}
   if "dash" in c.events:trace.down=c.p.dashDir.x!=0 and c.p.dashDir.y>0
   if "super" in c.events:q.wave=q.wave or trace.get("air",false) and trace.get("down",false)
   for e in c.ents:
    if e.type=="hingeArm" and previous[e.label]!=e.dir:
     previous[e.label]=e.dir;q.turns.append([e.label,e.dir])
     if q.first_turn<0:q.first_turn=frame
    if e.type=="lantern" and e.x>=304 and c.p.x<280 and q.first_turn<0:q.sent_separately=true
    if e.type=="recoilPlatform" and e.loadedBy=="lantern" and e.charge==e.depth:
     if q.delivery<0:q.delivery=frame
     if q.finish:q.lamp_holds_finish=true
   if c.deaths>0:q.deaths=c.deaths;return q
 if not c.combat.is_empty():q.alive=c.combat.enemies.size()==1 and not c.combat.enemies[0].get("dead",false) and not c.combat.enemies[0].felled
 return q
func clears(q):return q.finish and q.deaths==0
func advance(c,tape):
 for part in tape:
  for tick in range(int(part[0])):c.step(R.decode(part[1]))
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-next-preservation.json"))
 check(d.world.rooms.size()==43 and d.world.requiredMainRooms.size()==19,"43 definitions and 19 independently required challenges")
 for id in old.rooms:
  check(d.world.rooms.any(func(r):return r.id==id and JSON.stringify(r).sha256_text()==old.rooms[id]),"prior room preserved: "+id)
 check(old.tapes.keys().all(func(id):return JSON.stringify(d.world.tapes[id]).sha256_text()==old.tapes[id]),"all earlier Watch references preserved")
 check(d.world.sections.slice(0,old.sections.size())==old.sections and d.world.requiredMainRooms.slice(0,old.required.size())==old.required,"all earlier placements, checkpoints and main requirements preserved")
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23-tour.json"))
 var prefix="";var count=0
 for part in tour.tape:
  for tick in range(int(part[0])):
   if count>=int(old.tour_frames):break
   prefix+=part[1]+"\n";count+=1
  if count>=int(old.tour_frames):break
 check(count==int(old.tour_frames) and prefix.sha256_text()==old.tour_prefix,"all 12,775 prior continuous-road input frames remain an exact prefix")
 var metadata=d.world.duplicate(true)
 for key in ["rooms","tapes","sections","requiredMainRooms"]:metadata.erase(key)
 check(JSON.stringify(metadata).sha256_text()==old.metadata,"quests, secrets, passages, rewards and chapter metadata preserved")
 var cross=d.world.rooms.filter(func(r):return r.id=="cl23-atlas-crossroads")[0].duplicate(true)
 var incoming=cross.atlasMain.to==d.world.rooms[42].id and cross.atlasMain.toFloor==28 and cross.atlasSockets[0].to==d.world.rooms[42].id and cross.atlasSockets[0].toFloor==28
 cross.atlasMain=old.crossroads.atlasMain;cross.atlasSockets[0]=old.crossroads.atlasSockets[0]
 check(incoming and cross==old.crossroads,"crossroads changes only its incoming connection")
 for index in [40,41,42]:
  var r=d.world.rooms[index];var ref=r.puzzleRoutes[0].tape;var q=play(d,index,ref)
  check(r.puzzleStudy and r.dashes==1 and r.lock==["parry","portal"] and d.world.requiredMainRooms.has(r.id) and d.world.tapes[r.id]==ref,"independent required puzzle with full recording: "+r.name)
  check(clears(q) and q.exited,"ordinary-input deathless flag and physical exit: "+r.name)
  check(q.wave,"prepared runway supplies airborne landing dash and wavedash: "+r.name)
  if index==40:
   check(q.turns==[["Far bridge","up"],["Near bridge","left"],["Near bridge","up"],["Near bridge","right"],["Far bridge","right"],["Far bridge","down"],["Far bridge","left"]] and q.rides==3,"park the far bridge, pass the near arm through up, restore the far bridge, then ride home")
   for mode in ["no_turn","no_far_restore","no_return","no_outbound"]:check(not clears(play(d,index,ref,mode)),"construction dependency: "+mode)
   var c=make(d,index);var near=c.ents.filter(func(e):return e.type=="hingeArm" and e.label=="Near bridge")[0]
   check(c.Causeway.obstruction(c,near,c.Causeway.pose(near,"up"))=="arm","initial far bridge physically obstructs the near arm's intermediate up pose")
   advance(c,ref.slice(0,6))
   check(c.Causeway.obstruction(c,near,c.Causeway.pose(near,"up"))==null,"parking the far bridge clears that same sweep")
   c=make(d,index);advance(c,ref.slice(0,14))
   var far=c.ents.filter(func(e):return e.type=="hingeArm" and e.label=="Far bridge")[0]
   check(c.Causeway.obstruction(c,far,c.Causeway.pose(far,"left"))=="arm","restoring the far bridge early jams against the upright near arm")
   advance(c,ref.slice(14,16))
   check(c.Causeway.obstruction(c,far,c.Causeway.pose(far,"left"))==null,"the completed near bridge frees the far bridge's final pose")
  if index==41:
   check(q.first_turn>0 and q.first_tell>q.first_turn and q.breach>q.first_tell and q.alive and q.rides==2,"removing sight cover reveals the bait; living brute opens the lower route")
   var wait=play(d,index,ref.slice(0,2)+[[1200,""]])
   check(wait.deaths==0 and wait.first_tell<0 and wait.breach<0,"waiting under the intact cover never alerts the brute")
   for mode in ["no_turn","no_brute","no_lines"]:check(not clears(play(d,index,ref,mode)),"covered-court dependency: "+mode)
  if index==42:
   check(q.sent_separately and q.delivery>0 and q.delivery<q.first_turn and q.rides==2 and q.lamp_holds_finish,"lantern goes through the chute first, dock becomes an open hatch, knight rides separately and weight stays on runway")
   for mode in ["no_lantern","no_turn","no_lines","keep_lantern"]:check(not clears(play(d,index,ref,mode)),"split-delivery dependency: "+mode)
  for segment in {40:[6,28,35,37],41:[3,8,12,16,18],42:[4,18,20]}[index]:
   var wins=[]
   for delta in range(-2,3):
    var t=ref.duplicate(true);t[segment][0]=max(1,t[segment][0]+delta)
    if clears(play(d,index,t)):wins.append(delta)
   check(wins.size()>=3 and 0 in wins,"nearby successful finish inputs at segment "+str(segment)+": "+str(wins))
 var bypass=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-next-bypasses.json"))
 for witness in bypass:check(not clears(play(d,int(witness.i),witness.tape)),"reproduced shortcut is closed: "+witness.label)
 var chapter=load("res://levels/world23.tscn").instantiate();var base=Authoring.baseline(d);var compiled=chapter.compile_into(base)
 check(Codec.first_difference(base,compiled)=="" and chapter.validate_data(compiled).is_empty(),"all 43 native rooms compile without loss and validate")
 chapter.free()
 var app=Main.instantiate();app.test_mode=true;app.initial_world=23;root.add_child(app);await process_frame;app.set_physics_process(false)
 for index in [40,41,42]:
  var id=d.world.rooms[index].id
  app.watch=false;app.world.restart();app.load_section(index)
  check(app.sim.room.id==id and app.world.checkpoint_id==id and app.room_picker.get_selected_id()==index,"real room menu and independent checkpoint: "+id)
  app.show_workshop_hint();check(app.notice_label.text==d.world.rooms[index].hint,"actual optional hint: "+id)
  app.watch=true;app.load_section(index);var sim=app.sim
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60)
   if sim.exited:break
  check(sim.exited and sim.deaths==0,"complete application Watch exits the room: "+id)
  app.watch=false;app.world.restart();app.load_section(index)
  app.journey=[];app.journey_frame=0
  for part in d.world.rooms[index].puzzleRoutes[0].tape.slice(0,{40:28,41:4,42:12}[index]):
   for tick in range(int(part[0])):
    app.journey.append(part[1]);app._physics_process(1.0/60)
  check(app.sim.deaths==0,"live preparation before retry is deathless: "+id)
  app.retry_room()
  check(app.sim.p.x==app.sim.room.spawn.x and app.sim.p.y==app.sim.room.spawn.y and app.world.checkpoint_id==id and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.turns==0) and app.sim.ents.filter(func(e):return e.type=="brittle").all(func(e):return not e.open) and app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.charge==0) and app.sim.ents.filter(func(e):return e.type=="lantern").all(func(e):return e.x==e.ox and e.y==e.oy and not e.get("held",false) and not e.get("returning",false)) and app.sim.combat.get("enemies",[]).all(func(e):return e.x==e.ox and e.y==e.oy and e.state=="idle" and not e.get("dead",false)),"retry restores complete puzzle: "+id)
 app.queue_free();await process_frame
 print("CAUSEWAY NEXT ","FAILED" if failed else "PASSED"," · ",checks," checks")
 quit(1 if failed else 0)
