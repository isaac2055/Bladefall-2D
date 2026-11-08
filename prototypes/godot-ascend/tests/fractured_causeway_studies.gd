extends SceneTree
## Spatial Causeway puzzles: ordinary-input witnesses, physical dependencies,
## preservation, native authoring, application Watch and independent checkpoints.
const Main=preload("res://main.tscn")
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var failed=false
var checks=0
func check(ok,label):
 checks+=1;print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func play(d,index,tape,mode=""):
 var r=d.world.rooms[index].duplicate(true);r.workshopGoal=r.puzzleGoal
 var c=Core.new(d.constants.duplicate(true),d.playerDefaults);c.load_room(L.parse(r))
 if mode=="no_lines":c.ents=c.ents.filter(func(e):return e.type!="zipline")
 if mode=="no_lantern":c.ents=c.ents.filter(func(e):return e.type!="lantern")
 if mode=="no_brute":c.combat.enemies=[]
 if mode=="no_boost":c.K.liftYCap=0
 var q={"finish":false,"deaths":0,"exited":false,"breaches":0,"rides":0,"turns":0,"waves":0,"wave":false,"lift_jump":false,"handoff":false,"lantern_load":false,"brute_alive":false,"thrown_clear":false,"carrying":false,"climbed":false}
 var dash={};var frame=0
 for part in tape:
  for tick in range(int(part[0])):
   frame+=1
   var raw=R.decode(part[1])
   if mode=="no_turn":raw.strike=false
   if mode=="keep_lantern" and frame>300 and c.p.carrying!=null:raw.grab=false
   if mode=="no_runway":
    for e in c.ents:
     if e.type=="hingeArm" and e.dir=="left":e.solid=false
   c.step(raw)
   q.climbed=q.climbed or c.p.state=="climb"
   q.finish=q.finish or R.at_goal(c);q.exited=c.exited
   if "breach" in c.events:q.breaches+=1
   if "zip-in" in c.events:q.rides+=1
   if "hinge-turn" in c.events:q.turns+=1
   if "recoil-jump" in c.events:q.lift_jump=true
   if "dash-start" in c.events:dash={"air":not c.p.onGround,"down":false}
   if "dash" in c.events:dash.down=c.p.dashDir.x!=0 and c.p.dashDir.y>0
   if "super" in c.events:
    q.waves+=1;q.wave=q.wave or dash.get("air",false) and dash.get("down",false)
   for e in c.ents:
    if e.type=="recoilPlatform":
     q.lantern_load=q.lantern_load or e.loadedBy=="lantern"
     q.handoff=q.handoff or e.loadedBy=="knight" and c.p.carrying!=null and e.charge==e.depth
    if e.type=="lantern" and frame>=344 and e.x==118 and e.y==168:q.thrown_clear=true
   if c.deaths>0:q.deaths=c.deaths;return q
 q.carrying=c.p.carrying!=null
 if not c.combat.is_empty():q.brute_alive=c.combat.enemies.size()==1 and not c.combat.enemies[0].get("dead",false)
 return q
func clears(q):return q.finish and q.deaths==0
func _initialize():run.call_deferred()
func run():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world23.json"))
 var old=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-three-preservation.json"))
 check(d.world.rooms.size()==43 and d.world.requiredMainRooms.size()==19,"43 definitions, 19 independent main requirements")
 for id in old.rooms:
  check(d.world.rooms.any(func(r):return r.id==id and JSON.stringify(r).sha256_text()==old.rooms[id]),"preserved room: "+id)
 check(old.tapes.keys().all(func(id):return JSON.stringify(d.world.tapes[id]).sha256_text()==old.tapes[id]),"all prior road recordings preserved")
 check(d.world.sections.slice(0,old.sections.size())==old.sections and d.world.requiredMainRooms.slice(0,old.required.size())==old.required,"prior placements, checkpoints and main requirements preserved")
 var crossroads=d.world.rooms.filter(func(r):return r.id=="cl23-atlas-crossroads")[0].duplicate(true)
 var incoming=crossroads.atlasMain.to==d.world.rooms[42].id and crossroads.atlasSockets[0].to==d.world.rooms[42].id and crossroads.atlasMain.toFloor==28 and crossroads.atlasSockets[0].toFloor==28
 crossroads.atlasMain=old.crossroads.atlasMain;crossroads.atlasSockets[0]=old.crossroads.atlasSockets[0]
 check(incoming and crossroads==old.crossroads,"crossroads changes only its incoming link to the last new room")
 var metadata=d.world.duplicate(true)
 for key in ["rooms","tapes","sections","requiredMainRooms"]:metadata.erase(key)
 check(JSON.stringify(metadata).sha256_text()==old.metadata,"quests, secrets, passages and chapter metadata preserved")
 var placements=d.world.sections.duplicate(true)
 placements.append_array(d.world.get("passages",[]))
 for branch in d.world.quests+d.world.secrets:placements.append_array(branch.get("sections",[]))
 for section in d.world.sections.slice(-4):
  var def=d.world.rooms.filter(func(r):return r.id==section.room)[0]
  var bounds=Rect2(section.x,section.y,def.get("cols",def.map[0].length()),def.get("rows",def.map.size()))
  var overlaps=[]
  for other in placements:
   if other.room==section.room:continue
   var peer=d.world.rooms.filter(func(r):return r.id==other.room)[0]
   if bounds.intersects(Rect2(other.x,other.y,peer.get("cols",peer.map[0].length()),peer.get("rows",peer.map.size()))):overlaps.append(other.room)
  check(overlaps.is_empty(),"new placement leaves road, secrets and passages clear: "+section.room+" "+str(overlaps))
 var rejected=["cl23-puzzle-line-away","cl23-puzzle-line-keeps-speed","cl23-puzzle-line-runs-home","cl23-puzzle-sill-clock","cl23-puzzle-line-downhill","cl23-puzzle-keep-weight-off","cl23-puzzle-line-on-beat","cl23-puzzle-lift-on-beat"]
 check(rejected.all(func(id):return not d.world.rooms.any(func(r):return r.id==id) and not d.world.tapes.has(id) and not d.world.requiredMainRooms.has(id)),"eight retired studies stay absent")
 for index in [37,38,39]:
  var r=d.world.rooms[index];var ref=r.puzzleRoutes[0].tape;var q=play(d,index,ref)
  check(r.puzzleStudy and r.dashes==1 and r.lock==["parry","portal"] and d.world.requiredMainRooms.has(r.id) and d.world.tapes[r.id]==ref,"required room and full reference: "+r.name)
  check(clears(q) and q.exited,"deathless flag and physical exit: "+r.name)
  if index==37:
   check(q.breaches==2 and q.brute_alive and q.rides==2,"same living brute breaches twice; puzzle line and post-flag connector")
   for mode in ["no_brute","no_lines"]:check(not clears(play(d,index,ref,mode)),"two-wall dependency: "+mode)
   for prefix in [4,7]:
    var wait=play(d,index,ref.slice(0,prefix)+[[1800,""]])
    check(not wait.finish and wait.breaches==1 and wait.deaths==0,"a long safe wait cannot open the second wall: "+str(prefix))
   check(not clears(play(d,index,ref.slice(0,8)+[[180,"l"],[120,"luxg"]])),"walking below the lookout cannot replace its line")
   check(not play(d,index,[[37,"r"],[10,""],[25,"rj"],[12,"rux"],[200,"rgu"]]).exited,"roof cannot bypass the flag and exit connector")
  if index==38:
   check(q.lantern_load and q.handoff and q.thrown_clear and q.lift_jump,"lantern load, knight handoff, retrievable left throw and stored launch")
   for mode in ["no_lantern","no_turn","no_boost","keep_lantern"]:
    var blocked=play(d,index,ref,mode)
    check(not clears(blocked) and not blocked.exited,"weight preparation and empty-handed exit: "+mode)
   var recover=play(d,index,ref.slice(0,21)+[[60,""],[45,"d"],[1,""]]+ref.slice(21))
   check(clears(recover) and recover.exited,"missed stored launch can be recharged and cleared without retry")
   var retrieve=play(d,index,ref.slice(0,21)+[[60,""],[24,"l"],[25,""],[1,"g"]])
   check(retrieve.carrying and retrieve.deaths==0,"discarded lantern remains physically retrievable on the permanent shelf")
  if index==39:
   check(q.climbed and q.turns==1 and q.rides==1 and q.wave,"climb, fold, ride, airborne landing dash and wavedash")
   for mode in ["no_turn","no_lines","no_runway"]:check(not clears(play(d,index,ref,mode)),"folded runway dependency: "+mode)
  for segment in {37:[4,7],38:[18,21,22],39:[5,14,16]}[index]:
   var wins=[]
   for delta in range(-2,3):
    var t=ref.duplicate(true);t[segment][0]=max(1,t[segment][0]+delta)
    if clears(play(d,index,t)):wins.append(delta)
   check(wins.size()>=2,"several complete nearby inputs at segment "+str(segment)+": "+str(wins))
 var bypasses=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/causeway-three-bypasses.json"))
 for witness in bypasses:check(not clears(play(d,int(witness.i),witness.tape)),"reproduced edge-grab shortcut rejected: "+witness.label)
 var native=load("res://levels/world23.tscn").instantiate();var base=Authoring.baseline(d);var compiled=native.compile_into(base)
 check(Codec.first_difference(base,compiled)=="" and native.validate_data(compiled).is_empty(),"all 43 native rooms round-trip and validate")
 native.free()
 var app=Main.instantiate();app.test_mode=true;app.initial_world=23;root.add_child(app)
 await process_frame;app.set_physics_process(false)
 for index in [37,38,39]:
  var id=d.world.rooms[index].id
  app.watch=false;app.world.restart();app.load_section(index)
  check(app.sim.room.id==id and app.room_picker.get_selected_id()==index and app.world.checkpoint_id==id,"real room menu and independent checkpoint: "+id)
  app.watch=true;app.load_section(index);var sim=app.sim
  for tick in range(app.tape.size()):
   app._physics_process(1.0/60)
   if sim.exited:break
  check(sim.exited and sim.deaths==0,"complete application Watch: "+id)
  app.watch=false;app.world.restart();app.load_section(index)
  for part in d.world.rooms[index].puzzleRoutes[0].tape.slice(0,{37:12,38:16,39:10}[index]):
   for tick in range(int(part[0])):app.sim.step(R.decode(part[1]))
  app.retry_room()
  check(app.sim.p.x==app.sim.room.spawn.x and app.sim.p.y==app.sim.room.spawn.y and app.world.checkpoint_id==id and app.sim.ents.filter(func(e):return e.type=="brittle").all(func(e):return not e.open) and app.sim.ents.filter(func(e):return e.type=="hingeArm").all(func(e):return e.turns==0) and app.sim.ents.filter(func(e):return e.type=="recoilPlatform").all(func(e):return e.charge==0),"retry restores complete puzzle: "+id)
 app.queue_free();await process_frame
 print("CAUSEWAY THREE ","FAILED" if failed else "PASSED"," · ",checks," checks")
 quit(1 if failed else 0)
