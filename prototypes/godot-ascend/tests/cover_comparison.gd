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
 if mode=="exit_sealed":c.ents.filter(func(e):return e.type=="brittle")[-1].type="combatGate"
 if mode=="first_sealed":c.ents.filter(func(e):return e.type=="brittle")[0].type="combatGate"
 var q={"finish":false,"exited":false,"deaths":0,"turns":[],"tells":[],"breaches":[],"rides":[],"delivered":false,"final_dash":false,"caught":false,"final_jumps":0,"alive":false,"shard_frame":-1,"shard_pose":"","shard_breaches":0,"delivered_x":-1,"air_faces":[],"gantry":false,"return_refuge":false};var frame=0;var goal_frame=-1;var final_breach=-1
 for part in tape:
  for tick in range(int(part[0])):
   var raw=R.decode(part[1]);frame+=1
   if mode=="no_turn" or mode=="no_crossing":raw.strike=false
   c.step(raw)
   var e=c.combat.enemies[0] if not c.combat.enemies.is_empty() else {}
   if "hinge-turn" in c.events:q.turns.append({"frame":frame,"dir":c.ents.filter(func(x):return x.type=="hingeArm")[0].dir,"enemy":e.duplicate(true)})
   if "enemy-tell" in c.events:q.tells.append({"frame":frame,"face":e.face,"p":[c.p.x,c.p.y]})
   if "breach" in c.events:
    q.breaches.append({"frame":frame,"face":e.face,"p":[c.p.x,c.p.y]})
    if q.breaches.size()==(3 if index==0 else 2):final_breach=frame
   if "zip-in" in c.events:q.rides.append(c.p.ride.li)
   if index==1 and not e.is_empty() and e.y==368 and q.breaches.size()<2 and not q.turns.is_empty() and q.delivered_x<0:q.delivered_x=e.x;q.delivered=e.x>=224
   if not e.is_empty() and e.state=="attack" and c.p.x<e.x+e.w and c.p.x+c.p.w>e.x and c.p.y+9<=e.y and e.face not in q.air_faces:q.air_faces.append(e.face)
   if index==1 and q.turns.is_empty() and q.breaches.size()==1:
    if c.p.onGround and c.p.y+11==176 and c.p.x>=184 and c.p.x<208:q.return_refuge=true
    if c.p.x>=240 and c.p.x<288 and c.p.y+11<=168:q.gantry=true
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
  check(clears(play(d,index,t.slice(0,{0:21,1:39}[index])+[[1200,""]])),"standing at the completed flag stays safe: "+r.name)
  check(d.world.tapes[r.id]==t and r.lock==["parry","portal"],"complete Watch reference with the existing kit: "+r.name)
  if index==0:
   check(q.turns.map(func(e):return e.dir)==["right"] and q.breaches.size()==3,"the prepared upright arm is spent only after the encounter and shard retrieval")
   check(q.breaches.map(func(e):return e.face)==[-1,1,1] and q.air_faces==[-1,1],"both opposed charges pass below the knight in the overhead opening")
   check(q.shard_breaches==2 and q.shard_pose=="up" and q.shard_frame<q.turns[0].frame and q.rides==[0],"land behind the guard, retrieve the shard, escape, then turn the arm")
   var wait=play(d,index,[[1,"l"],[300,""]])
   check(wait.deaths>0,"standing in the encounter cannot replace its airborne dodge")
   for segment in [2,3,6,7]:
    var omitted=t.duplicate(true);omitted[segment][1]=""
    check(not clears(play(d,index,omitted)),"A witnessed airborne dependency at segment "+str(segment))
   var low=play(d,index,[[1,"l"],[53,""],[18,"j"],[1,"dj"],[100,""]])
   check(low.deaths>0 and low.shard_frame<0,"the old retreat below the charge is sealed")
   for mode in ["no_crossing","first_sealed","no_brute","no_part"]:check(not clears(play(d,index,t,mode)),"A reference dependency: "+mode)
   var retry=play(d,index,t.slice(0,19)+[[18,"rj"],[60,""],[40,"r"],[12,"rj"],[30,""],[38,"lj"],[30,""]])
   check(clears(retry) and retry.caught and not retry.final_dash,"A final-hop miss still recovers locally with ordinary jumps")
  else:
   var turn=q.turns[0]
   check(q.return_refuge and q.gantry and turn.enemy.x==256 and q.delivered and q.delivered_x==256,"return to the left refuge, cross above the gantry, and deliver from the useful dock position")
   check(turn.dir=="up" and turn.enemy.state=="tell" and turn.enemy.attackId==3 and turn.enemy.t>0,"the successful fold beats the brute's next charge")
   check(q.breaches.map(func(e):return e.face)==[1,1] and q.rides==[1,2],"upper buffer breaks first; separate descent and lower bait open the exit")
   var late=play(d,index,t.slice(0,23)+[[70,""]]+t.slice(23))
   check(not clears(late) and not late.delivered,"hesitating at the hub loses the delivery opportunity")
   var no_cross=t.duplicate(true);no_cross[15][1]=""
   check(not clears(play(d,index,no_cross)),"ordinary movement cannot replace the dash across the gantry")
   var wrong_tape=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/cover-comparison-wrong-bay.json")).tape
   var wrong=play(d,index,wrong_tape)
   check(not wrong.finish and not wrong.delivered and wrong.deaths==0 and wrong.delivered_x==192 and wrong.turns.size()==1,"an early fold commits the living brute to the sealed wrong bay")
   var wait=play(d,index,t.slice(0,29)+[[1200,""]])
   check(wait.deaths==0 and wait.breaches.size()==1,"the lower receiving perch does not perform the lower bait")
   for mode in ["no_turn","exit_sealed","no_brute"]:check(not clears(play(d,index,t,mode)),"B reference dependency: "+mode)
   var retry=play(d,index,t.slice(0,36)+[[12,"r"],[40,""],[24,"rj"],[35,""]])
   check(clears(retry) and retry.caught and not retry.final_dash,"B final-hop miss still recovers locally with an ordinary jump")
  for segment in {0:[1,2,3,5,6,7,9,15,16,17,19],1:[2,3,8,9,10,11,13,14,15,16,17,20,21,30,31,32,37]}[index]:
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
  for part in d.world.rooms[index].puzzleRoutes[0].tape.slice(0,{0:12,1:34}[index]):
   for tick in range(int(part[0])):app.journey.append(part[1]);app._physics_process(1.0/60)
  check(app.sim.deaths==0,"live preparation is deathless before retry: "+id)
  app.retry_room()
  check(app.sim.room.id==id and app.world.checkpoint_id==id and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.dir==("up" if index==0 else "left") and e.turns==0) and app.sim.ents.filter(func(e):return e.type=="brittle").all(func(e):return not e.open) and app.sim.ents.filter(func(e):return e.type=="shard").all(func(e):return not e.get("gone",false)) and app.sim.combat.enemies.all(func(e):return e.x==e.ox and e.y==e.oy and e.state=="idle"),"retry restores this room's arm, barriers and brute without sending the player back to A: "+id)
 app.queue_free();await process_frame
 var regular=Main.instantiate();regular.test_mode=true;regular.initial_world=23;root.add_child(regular);await process_frame;regular.set_physics_process(false)
 check(regular.data.world.rooms.size()==43 and regular.data.world.rooms[41].id=="cl23-puzzle-cover-take-away","normal launch still loads the unchanged current chapter")
 regular.queue_free();await process_frame
 print("COVER COMPARISON ","FAILED" if failed else "PASSED"," · ",checks," checks")
 quit(1 if failed else 0)
