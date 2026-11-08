extends SceneTree
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const Pickups=preload("res://scripts/workshop_pickups.gd")
const R=preload("res://tests/workshop_routes.gd")
const World=preload("res://scripts/world.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
const Main=preload("res://main.tscn")
var failed=false
var checks=0
func check(ok,label):
 checks+=1;print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func goal(c):
 var g=c.room.def.puzzleGoal
 if not Pickups.ready(c.room.def,c.ents):return false
 return c.p.state not in ["dead","respawn"] and c.p.onGround and Rect2(g[0],g[1]-2,g[2],g[3]+4).has_point(Vector2(c.p.x+4,c.p.y+11))
func make(d,index):
 var r=d.world.rooms[index].duplicate(true);r.workshopGoal=r.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(r));return c
func play(d,index,tape,mode=""):
 var c=make(d,index)
 if mode=="no_brute":c.combat.enemies=[]
 if mode=="no_part":c.ents=c.ents.filter(func(e):return e.type!="shard")
 if mode=="no_lines":c.ents=c.ents.filter(func(e):return e.type!="zipline")
 if mode=="first_sealed":c.ents.filter(func(e):return e.type=="brittle")[0].type="combatGate"
 var q={"finish":false,"exited":false,"deaths":0,"turns":[],"tells":[],"breaches":[],"rides":[],"delivered":false,"final_dash":false,"caught":false,"final_jumps":0,"alive":false,"shard_frame":-1,"shard_pose":"","shard_breaches":0,"delivered_x":-1};var frame=0;var goal_frame=-1;var final_breach=-1
 for part in tape:
  for tick in range(int(part[0])):
   var raw=R.decode(part[1]);frame+=1
   if mode=="no_turn" or mode=="no_crossing" and not q.turns.is_empty():raw.strike=false
   c.step(raw)
   var e=c.combat.enemies[0] if not c.combat.enemies.is_empty() else {}
   if "hinge-turn" in c.events:q.turns.append({"frame":frame,"dir":c.ents.filter(func(x):return x.type=="hingeArm")[0].dir,"enemy":e.duplicate(true)})
   if "enemy-tell" in c.events:q.tells.append({"frame":frame,"face":e.face,"p":[c.p.x,c.p.y]})
   if "breach" in c.events:
    q.breaches.append({"frame":frame,"face":e.face,"p":[c.p.x,c.p.y]})
    if q.breaches.size()==(3 if index==0 else 1):final_breach=frame
   if "zip-in" in c.events:q.rides.append(c.p.ride.li)
   if index==1 and not e.is_empty() and e.y==368 and q.breaches.is_empty() and q.delivered_x<0:q.delivered_x=e.x;q.delivered=e.x>=224
   if index==0 and q.shard_frame<0 and R.carried(c):
    q.shard_frame=frame;q.shard_pose=c.ents.filter(func(x):return x.type=="hingeArm")[0].dir;q.shard_breaches=q.breaches.size()
   if final_breach>0 and goal_frame<0:
    if "dash-start" in c.events:q.final_dash=true
    if "jump" in c.events:q.final_jumps+=1
    if c.p.onGround and (index==0 and c.p.y+11==256 and c.p.x>=384 or index==1 and c.p.y+11==384 and c.p.x>=336):q.caught=true
   if goal(c):q.finish=true
   if q.finish and goal_frame<0:goal_frame=frame
   q.exited=c.exited
   if c.deaths>0:break
  if c.deaths>0:break
 q.deaths=c.deaths;q.p=[c.p.x,c.p.y]
 q.alive=c.combat.enemies.size()==1 and not c.combat.enemies[0].get("dead",false) and not c.combat.enemies[0].felled
 return q
func clears(q):return q.finish and q.deaths==0
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-cover-comparison.json"))
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/cover-comparison-preservation.json"))
 for path in old:check(JSON.stringify(JSON.parse_string(FileAccess.get_file_as_string("res://data/"+path))).sha256_text()==old[path],"canonical chapter preserved exactly: "+path)
 var canonical=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 check(d.constants==canonical.constants and d.playerDefaults==canonical.playerDefaults,"both alternatives use the unchanged shared movement and enemy constants")
 check(d.world.rooms.size()==2 and d.world.requiredMainRooms==d.world.rooms.map(func(r):return r.id),"two independent test rooms in A then B order")
 var native=load(d.nativeScene).instantiate();var base=Authoring.baseline(d);var compiled=native.compile_into(base)
 check(Codec.first_difference(base,compiled)=="" and native.validate_data(compiled).is_empty(),"both native editable rooms compile losslessly and validate")
 native.free()
 check(Authoring.read(canonical).world.rooms.size()==43 and Authoring.read(d).world.rooms.size()==2,"normal and comparison native scenes load independently")
 for index in [0,1]:
  var r=d.world.rooms[index];var t=r.puzzleRoutes[0].tape;var q=play(d,index,t)
  check(clears(q) and q.exited and q.alive,"deathless ordinary-input flag and physical exit: "+r.name)
  check(not q.final_dash and q.final_jumps>0,"after the final breach, ordinary hops reach the flag without a dash: "+r.name)
  check(clears(play(d,index,t.slice(0,{0:55,1:37}[index])+[[1200,""]])),"standing at the completed flag stays safe: "+r.name)
  check(d.world.tapes[r.id]==t and r.lock==["parry","portal"],"complete Watch reference with the existing kit: "+r.name)
  if index==0:
   check(q.turns.map(func(e):return e.dir)==["up","right"] and q.breaches.size()==3,"the same arm stays upright through alcove preparation and becomes the crossing afterward")
   check(q.breaches.map(func(e):return e.face)==[-1,1,1] and q.shard_frame>q.breaches[1].frame and q.shard_frame<q.turns[1].frame and q.shard_pose=="up","open left alcove, clear its guard right, retrieve shard, then spend shelter in that order")
   check(q.shard_breaches==2 and q.rides==[0],"the raised tunnel shard is collected before the escape line and final breach")
   for stage in [4,13,24,46]:
    var wait=play(d,index,t.slice(0,stage)+[[1200,""]])
    check(wait.deaths==0 and wait.breaches.size()==(2 if stage==46 else (1 if stage==24 else 0)),"sheltered waiting does not solve the next task at A stage "+str(stage))
   for mode in ["no_turn","no_crossing","no_lines","first_sealed","no_brute","no_part"]:check(not clears(play(d,index,t,mode)),"A reference dependency: "+mode)
   var shortcut=play(d,index,t.slice(0,17)+[[18,"j"],[10,""],[32,"lj"],[12,"ux"],[80,""]])
   check(shortcut.shard_frame<0 and not shortcut.finish,"direct entry while the brute guards the low tunnel cannot grab the shard")
   var retry=play(d,index,t.slice(0,53)+[[18,"rj"],[60,""],[40,"r"],[12,"rj"],[30,""],[38,"lj"],[30,""]])
   check(clears(retry) and retry.caught and not retry.final_dash,"A final-hop miss has a local ordinary-jump recovery")
  else:
   var turn=q.turns[0]
   check(q.turns.size()==1 and turn.dir=="up" and turn.enemy.x==256 and turn.enemy.y==224 and q.delivered and q.delivered_x==256,"return charge stops over the useful bay; folding delivers the living brute there")
   check(q.tells[0].face==-1 and q.tells[1].face==1 and q.turns[0].frame>q.tells[1].frame,"the upper reference positions the brute with opposed charges before folding")
   check(q.breaches.size()==1 and q.breaches[0].face==1 and q.rides==[1,2],"separate descent and lower bait open the exit wall")
   for stage in [7,26]:
    var wait=play(d,index,t.slice(0,stage)+[[1200,""]])
    check(wait.deaths==0 and wait.breaches.is_empty(),"the safe perch does not perform the next bait at B stage "+str(stage))
   for mode in ["no_turn","no_lines","first_sealed","no_brute"]:check(not clears(play(d,index,t,mode)),"B delivery dependency: "+mode)
   var wrong=play(d,index,t.slice(0,7)+t.slice(13))
   check(not wrong.finish and not wrong.delivered and wrong.delivered_x==192 and wrong.breaches.is_empty(),"folding after the obvious first stop traps the brute in the wrong bay and cannot open the wall")
   var retry=play(d,index,t.slice(0,35)+[[4,"r"],[40,""],[24,"rj"],[35,""]])
   check(clears(retry) and retry.caught and not retry.final_dash,"B final-hop miss has a local ordinary-jump recovery")
   var recovery=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/cover-comparison-recovery.json"))
   check(clears(play(d,index,recovery.tape)),"B can wait out the initial opportunity, then reposition and finish without a reset")
  for segment in {0:[1,7,17,21,28,42,43,49,50,51,53],1:[1,3,4,7,9,10,17,27,28,29,33,35]}[index]:
   var wins=[]
   for delta in range(-2,3):
    var varied=t.duplicate(true);varied[segment][0]=max(1,varied[segment][0]+delta)
    if clears(play(d,index,varied)):wins.append(delta)
   check(0 in wins and wins.size()>=3,"nearby successful timings "+str(index)+":"+str(segment)+" "+str(wins))
 var tour=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-cover-comparison-tour.json"));var w=World.new(d);var reached={};var dead=false;var visited={w.active_id:true}
 for part in tour.tape:
  for tick in range(int(part[0])):
   w.step(R.decode(part[1]));w.update_region();visited[w.active_id]=true
   if goal(w.active()):reached[w.active_id]=true
   dead=dead or w.active().deaths>0
 check(not dead and reached.size()==2 and visited.size()==2 and w.frames==tour.frames and w.active_id==d.world.rooms[1].id,"continuous normal-input A-to-B journey reaches both flags without deaths or state resets")
 check(w.checkpoint_id==d.world.rooms[1].id,"the physical handoff sets B's own checkpoint")
 w.shutdown()
 var app=Main.instantiate();app.test_mode=true;app.cover_comparison=true;app.initial_world=23;root.add_child(app);await process_frame;app.set_physics_process(false)
 check(app.data.world.rooms.size()==2 and app.room_picker.item_count==2,"actual comparison mode offers precisely A and B in the room menu")
 app.workshop_next.emit_signal("pressed")
 check(app.sim.room.id==d.world.rooms[1].id and app.world.checkpoint_id==d.world.rooms[1].id,"Next room control switches directly from A to B")
 app.workshop_previous.emit_signal("pressed")
 check(app.sim.room.id==d.world.rooms[0].id,"Previous room returns directly to A")
 for index in [0,1]:
  var id=d.world.rooms[index].id;app.world.restart();app.watch=false;app.load_section(index)
  check(app.world.checkpoint_id==id,"independent actual application checkpoint: "+id)
  app.show_workshop_hint();check(app.notice_label.text==d.world.rooms[index].hint,"actual optional hint: "+id)
  app.watch=true;app.load_section(index);var sim=app.sim;var reached_flag=false
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60);reached_flag=reached_flag or goal(sim)
   if sim.exited:break
  check(reached_flag and sim.exited and sim.deaths==0 and not app.workshop_completed.has(id),"actual application Watch completes the flag and exit: "+id)
  app.watch=false;app.world.restart();app.load_section(index);app.journey=[];app.journey_frame=0
  for part in d.world.rooms[index].puzzleRoutes[0].tape:
   for tick in range(int(part[0])):
    app.journey.append(part[1]);app._physics_process(1.0/60)
    if app.workshop_completed.has(id):break
   if app.workshop_completed.has(id):break
  check(app.workshop_completed.has(id) and app.sim.deaths==0,"actual live play records the gold-flag completion: "+id)
  app.watch=false;app.world.restart();app.load_section(index);app.journey=[];app.journey_frame=0
  for part in d.world.rooms[index].puzzleRoutes[0].tape.slice(0,{0:46,1:31}[index]):
   for tick in range(int(part[0])):app.journey.append(part[1]);app._physics_process(1.0/60)
  check(app.sim.deaths==0,"live preparation is deathless before retry: "+id)
  app.retry_room()
  check(app.sim.room.id==id and app.world.checkpoint_id==id and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.dir=="left" and e.turns==0) and app.sim.ents.filter(func(e):return e.type=="brittle").all(func(e):return not e.open) and app.sim.ents.filter(func(e):return e.type=="shard").all(func(e):return not e.get("gone",false)) and app.sim.combat.enemies.all(func(e):return e.x==e.ox and e.y==e.oy and e.state=="idle"),"retry restores this room's arm, barriers and brute without sending the player back to A: "+id)
 app.queue_free();await process_frame
 var regular=Main.instantiate();regular.test_mode=true;regular.initial_world=23;root.add_child(regular);await process_frame;regular.set_physics_process(false)
 check(regular.data.world.rooms.size()==43 and regular.data.world.rooms[41].id=="cl23-puzzle-cover-take-away","normal launch still loads the unchanged current chapter")
 regular.queue_free();await process_frame
 print("COVER COMPARISON ","FAILED" if failed else "PASSED"," · ",checks," checks")
 quit(1 if failed else 0)
