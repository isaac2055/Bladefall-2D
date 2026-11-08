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
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(Loader.parse(d.world.rooms[index]));return c
func play(d,index,tape,mode=""):
 var c=make(d,index)
 if mode=="no_lantern":c.ents=c.ents.filter(func(e):return e.type!="lantern")
 if mode=="no_boost":c.K.liftYCap=0
 var q={"finish":false,"deaths":0,"throws":[],"pickups":[],"launches":[],"boards":[],"receiver_loaded":false,"descending_board":false,"handoff":false,"dash_after_throw":false,"events":[],"last_throw":-1};var f=0;var final_start=-1
 for part in tape:
  for tick in range(int(part[0])):
   var raw=Routes.decode(part[1])
   if mode=="no_dash":raw.dash=false
   if mode=="keep_cargo" and index==0 and f>120:raw.grab=false;raw.g=false
   if mode=="no_handoff" and index==1 and f>=227:raw.grab=false;raw.g=false
   if mode=="walk_exit" and index==1 and f>=230:raw.dash=false
   c.step(raw);f+=1
   for event in c.events:q.events.append([f,event])
   var receiver=c.ents.filter(func(e):return e.type=="recoilPlatform" and e.label=="Receiver")[0]
   q.receiver_loaded=q.receiver_loaded or receiver.loadedBy=="lantern"
   q.handoff=q.handoff or receiver.loadedBy=="knight" and c.p.carrying!=null
   if "throw" in c.events:q.throws.append({"f":f,"ground":c.p.onGround,"p":[c.p.x,c.p.y]});q.last_throw=f
   if "pickup" in c.events:q.pickups.append(f)
   if "recoil-jump" in c.events:q.launches.append(f)
   if c.p.onGround and c.p.y+c.p.h==receiver.y and c.p.x<receiver.x+receiver.w and c.p.x+c.p.w>receiver.x:
    if q.boards.is_empty():q.boards.append([f,receiver.y,receiver.loadedBy])
    q.descending_board=q.descending_board or receiver.state=="load" and receiver.charge>0 and receiver.charge<receiver.depth
   if "dash-start" in c.events and q.last_throw>0 and f>q.last_throw:q.dash_after_throw=true
   q.finish=q.finish or Routes.at_goal(c)
   if c.deaths>0:break
  if c.deaths>0:break
 q.deaths=c.deaths;q.core=c;return q
func clears(q):return q.finish and q.deaths==0
# Overapproximate movement: free flight, no hazard deaths, and no launch-plate
# obstruction. Use the runtime's full-body solid collision at every pixel.
func body_reachability(d,index,lower_receiver):
 var c=make(d,index)
 c.ents=c.ents.filter(func(e):return e.type!="lantern" and not (e.type=="recoilPlatform" and e.label=="Launch"))
 var receiver=c.ents.filter(func(e):return e.type=="recoilPlatform")[0]
 if lower_receiver:receiver.y+=receiver.depth
 var width=int(c.room.w)-int(c.p.w)+1;var height=int(c.room.h)-int(c.p.h)+1
 var cells=PackedByteArray();cells.resize(width*height)
 for y in range(height):
  for x in range(width):cells[y*width+x]=1 if c.solid(x,y,c.p.w,c.p.h) else 0
 var start=int(c.p.y)*width+int(c.p.x);var queue=[start];cells[start]=2
 var head=0;var result={"flag":false,"receiver":false};var goal=c.room.def.puzzleGoal
 while head<queue.size():
  var i=queue[head];head+=1;var x=i%width;var y=int(i/width)
  if y+c.p.h==goal[1] and x+c.p.w/2>=goal[0] and x+c.p.w/2<goal[0]+goal[2]:result.flag=true
  if y+c.p.h==receiver.y and x<receiver.x+receiver.w and x+c.p.w>receiver.x:result.receiver=true
  for k in [i-1 if x>0 else -1,i+1 if x+1<width else -1,i-width if y>0 else -1,i+width if y+1<height else -1]:
   if k>=0 and cells[k]==0:cells[k]=2;queue.append(k)
 return result
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/causeway-weight-comparison.json"))
 var preservation=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/weight-comparison-preservation.json"))
 for path in preservation:
  if path.ends_with(".json") or FileAccess.file_exists("res://"+path):check(FileAccess.get_sha256("res://"+path)==preservation[path],"previous room bank preserved: "+path)
  else:check(ResourceLoader.exists("res://"+path),"preserved compiled resource available: "+path)
 var canonical=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 check(d.constants==canonical.constants and d.playerDefaults==canonical.playerDefaults,"unchanged movement, carry, enemy and launch rules")
 check(d.world.rooms.size()==2 and d.world.requiredMainRooms==d.world.rooms.map(func(r):return r.id),"two separate comparison rooms")
 var native=load(d.nativeScene).instantiate();var base=Authoring.baseline(d);var compiled=native.compile_into(base)
 check(Codec.first_difference(base,compiled)=="" and native.validate_data(compiled).is_empty(),"native editable scenes validate and compile without data loss");native.free()
 for index in [0,1]:
  var r=d.world.rooms[index];var tape=r.puzzleRoutes[0].tape;var q=play(d,index,tape)
  var closed=body_reachability(d,index,false);var opened=body_reachability(d,index,true)
  check(not closed.flag,"even free flight without hazard deaths cannot bypass the unloaded receiver: "+r.name)
  check(not closed.receiver,"the unloaded receiver cannot be reached for self-loading: "+r.name)
  check(opened.flag,"lowering the receiver opens a full-body route to the flag: "+r.name)
  check(clears(q),"ordinary-input deathless flag: "+r.name)
  check(q.receiver_loaded and not q.boards.is_empty() and q.dash_after_throw,"real lantern delivery precedes a dash and boarding: "+r.name)
  check(r.lock==["parry","portal"] and d.world.tapes[r.id]==tape,"existing kit and complete Watch recording: "+r.name)
  check(clears(play(d,index,tape+[[600,""]])),"standing at the completed flag is safe: "+r.name)
  for mode in ["no_lantern","no_boost","no_dash"]:check(not clears(play(d,index,tape,mode)),"reference dependency "+str(index)+": "+mode)
  if index==0:
   check(q.throws.size()==1 and not q.throws[0].ground and q.launches.size()==1 and q.launches[0]<q.throws[0].f,"A throws during its single committed launch")
   check(q.pickups.size()==1,"A leaves the delivered lantern working; no retrieval cleanup")
   check(not clears(play(d,index,tape,"keep_cargo")),"keeping the lantern prevents the required empty-handed dash")
   var retreat=play(d,0,tape.slice(0,9)+[[12,"lx"],[90,"l"]])
   check(not clears(retreat),"throw-then-retreat witness cannot complete the crossing")
   var c=make(d,0);var first=c.ents.filter(func(e):return e.type=="recoilPlatform" and e.label=="Launch")[0]
   check(range(int(first.x)-7,int(first.x+first.w)).all(func(x):return c.solid(x,first.y-c.p.h,c.p.w,c.p.h)),"every possible standing position on the returned launch plate intersects the low roof")
   check(range(46,54).all(func(x):return range(0,22).all(func(y):return c.tile(x,y)==1)),"the receiving roof reaches the ceiling, closing the over-the-second-spikes shortcut")
   check(range(23,r.rows).all(func(y):return c.tile(42,y) in [1,3]),"divider reaches the lethal floor; no lower-right passage")
  else:
   check(q.descending_board and q.handoff and q.throws.size()==2,"B boards during the actual descent, takes the weight and throws clear")
   check(not clears(play(d,index,tape,"no_handoff")),"keeping the load on the descending plate fails the witnessed exit")
   check(not clears(play(d,index,tape,"walk_exit")),"walking cannot replace the timed dash out from beneath the roof")
   var late=tape.slice(0,13)+[[90,""]]+tape.slice(13)
   check(not clears(play(d,index,late)),"late interception misses the witnessed delivery window")
   var c=make(d,1)
   check(c.tile(44,29)==1 and c.tile(44,31)==1 and c.tile(44,26)==1,"exit has a fixed floor and roof; walking under the unloaded receiver cannot reach it")
  for segment in ({0:[2,5,6,7,9,10,11,12,15,16,18],1:[2,5,6,7,8,9,10,12,13,17,18,21]}[index]):
   var wins=[]
   for delta in range(-2,3):
    var varied=tape.duplicate(true);varied[segment][0]=max(1,varied[segment][0]+delta)
    if clears(play(d,index,varied)):wins.append(delta)
   check(0 in wins and wins.size()>=3,"nearby successful timings "+str(index)+":"+str(segment)+" "+str(wins))
 var app=Main.instantiate();app.test_mode=true;app.weight_comparison=true;app.initial_world=23;root.add_child(app);await process_frame;app.set_physics_process(false)
 check(app.room_picker.item_count==2 and app.data.world.rooms.size()==2,"actual weight-comparison menu offers exactly the two fixes")
 app.workshop_next.emit_signal("pressed");check(app.sim.room.id==d.world.rooms[1].id,"Next opens B")
 app.workshop_previous.emit_signal("pressed");check(app.sim.room.id==d.world.rooms[0].id,"Previous returns to A")
 for index in [0,1]:
  var id=d.world.rooms[index].id;app.watch=false;app.world.restart();app.load_section(index)
  check(app.world.checkpoint_id==id,"independent checkpoint: "+id)
  app.show_workshop_hint();check(app.notice_label.text==d.world.rooms[index].hint,"optional hint belongs to this room")
  app.watch=true;app.load_section(index);var sim=app.sim;var reached=false
  for tick in range(app.tape.size()):app._physics_process(1.0/60);reached=reached or Routes.at_goal(sim)
  check(reached and sim.deaths==0,"real application Watch reaches the flag: "+id)
  app.watch=false;app.world.restart();app.load_section(index);app.journey=[];app.journey_frame=0
  for part in d.world.rooms[index].puzzleRoutes[0].tape:
   for tick in range(int(part[0])):app.journey.append(part[1]);app._physics_process(1.0/60)
  check(app.workshop_completed.has(id) and app.sim.deaths==0,"live application records completion: "+id)
  app.retry_room()
  check(app.world.checkpoint_id==id and app.sim.room.id==id and app.sim.p.carrying==null and app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.y==e.oy and e.charge==0),"retry restores this room's plate positions and lantern")
 app.queue_free();await process_frame
 print("WEIGHT COMPARISON ","FAILED" if failed else "PASSED"," · ",checks," checks");quit(1 if failed else 0)
