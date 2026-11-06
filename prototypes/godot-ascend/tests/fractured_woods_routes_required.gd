extends SceneTree
## Replayed counterexamples and broad timing/approach families, before skipped actions.
## These finite families complement physical geometry review and bounded searches.
const Core=preload("res://scripts/core.gd")
const L=preload("res://scripts/room_loader.gd")
const R=preload("res://tests/workshop_routes.gd")
var data
var failed=false
var tested=0
func run_route(index,tape,ordinary=false,no_pods=false,override=null,cap_pod_speed=false):
 var room=data.world.rooms[index].duplicate(true) if override==null else override.duplicate(true)
 room.workshopGoal=room.puzzleGoal
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(L.parse(room))
 if no_pods:c.ents=c.ents.filter(func(e):return e.type!="pod")
 for part in tape:
  for tick in range(int(part[0])):
   c.step(R.decode(part[1]))
   if cap_pod_speed and "pod" in c.events:c.p.vx=sign(c.p.vx)*90
   if c.deaths>0:return false
   if ordinary and ["super","hyper","wallbounce"].any(func(e):return e in c.events):return false
   if R.at_goal(c):return true
 return false
func reject(index,tape,label,ordinary=false,no_pods=false,cap_pod_speed=false):
 tested+=1
 if run_route(index,tape,ordinary,no_pods,null,cap_pod_speed):
  failed=true;print("FAIL ",label," ",JSON.stringify(tape))
func _initialize():
 data=JSON.parse_string(FileAccess.get_file_as_string("res://data/world22.json"))
 var fixtures=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/woods-035-bypasses.json"))
 for f in fixtures.cases:
  var ordinary=f.index!=39
  if not run_route(int(f.index),f.tape,ordinary,f.index==39,f.room):
   failed=true;print("FAIL historical positive control ",f.index)
  else:print("PASS historical positive control ",f.index)
  reject(int(f.index),f.tape,"historical shortcut",ordinary,f.index==39)
 var t=data.world.rooms[37].puzzleRoutes[0].tape
 var start=t.slice(0,12)+[[12,"rx"],[16,"r"]]
 for jump in [12,18,24,30,36]:
  for aim in ["rxg","uxg","ruxg"]:
   reject(37,start+[[jump,"rjg"],[12,aim],[65,"rg"]],"ordinary late jump/dash",true)
   for grab in [12,24,36,50,68]:
    reject(37,start+[[jump,"rjg"],[12,aim],[grab,"lgu"],[20,"r"],[12,"dx"],[32,"rj"],[12,"rx"],[60,"r"]],"canopy climb/refill",true)
 print("CHECKED Pod ordinary approach families · ",tested)
 t=data.world.rooms[38].puzzleRoutes[0].tape
 # Prefixes cover the bank, amber steps and completed upper-bell landing.
 # Pods and ordinary phase dashes remain available.
 for prefix in [7,9,11,15,19]:
  for walk in [0,12,24]:
   for jump in [12,24,36]:
    for dash in ["","ruxg"]:
     for cut in ["dsj","rdsj"]:
      for wait in [18,30,38]:
       var tape=t.slice(0,prefix)
       if prefix==19:tape.append([8,""])
       if walk>0:tape.append([walk,"r"])
       tape.append([jump,"rj"])
       if dash!="":tape.append([12,dash])
       tape.append_array([[6,cut],[wait,"rj"],[12,"ruxg"],[70,"rg"]])
       reject(38,tape,"ordinary pod approach from bank, roots or upper-bell landing",true)
 print("CHECKED Crossing pod approaches from bank and amber steps · ",tested)
 # Let the full launch happen, then remove only the speed carried through the pod.
 # Vary pod contact and dash timing instead of merely replaying one fixed tape.
 for fly in [21,23,25,27,29]:
  for cut in ["dsj","rdsj","ldsj"]:
   for wait in [10,14,18,22,26,30,34,38,42,46]:
    for aim in ["ruxg","rxg"]:
     reject(38,t.slice(0,19)+[[fly,"rj"],[4,cut],[wait,"rj"],[12,aim],[70,"rg"]],"pod speed reset with varied contact and late dash",false,false,true)
 print("CHECKED Crossing ordinary-speed pod/dash envelopes · ",tested)
 t=data.world.rooms[39].puzzleRoutes[0].tape
 # Pod is removed before play; final wavedash remains available in these attempts.
 for climb in [45,60,75,85,95,100,105,110]:
  for jump in [6,12,18]:
   for aim in ["lx","lux","ux"]:
    for settle in ["l","lgu"]:
     for duration in [8,24]:
      reject(39,t.slice(0,8)+[[climb,"lgu"],[jump,"rj"],[12,aim],[duration,settle],[7,"lj"],[10,"ldx"],[18,"lj"],[12,"ux"],[14,"l"],[15,""]],"pod-free wall departure",false,true)
 print("CHECKED Wall climb/departure families · ",tested)
 print("FRACTURED WOODS REQUIRED ROUTES ","FAILED" if failed else "PASSED"," · ",tested," attempts plus three historical positive controls")
 quit(1 if failed else 0)
