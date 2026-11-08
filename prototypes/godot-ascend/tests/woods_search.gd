extends RefCounted
## Bounded input search with opt-in advanced moves; pruning is not a proof of impossibility.
## Every branch retains exact player, input-buffer and device timers. Beam pruning
## limits coverage: failure means 'not found within budget', never 'impossible'.
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Routes=preload("res://tests/workshop_routes.gd")
const FIELDS=["p","ents","prev","buf","frame","room_frame","freeze","phase","shards","foothold_previous","kick_direction","awake","combat","brute_waves","exited","actor_bounds"]
static func snapshot(core):
 var state={}
 for field in FIELDS:
  var value=core.get(field)
  state[field]=value.duplicate(true) if value is Array or value is Dictionary else value
 return state
static func restore(core,state):
 for field in FIELDS:
  var value=state[field]
  core.set(field,value.duplicate(true) if value is Array or value is Dictionary else value)
 # Restoring p and entities separately must preserve the held-object alias.
 if core.p.get("carrying")!=null:
  var id=core.p.carrying.id
  var matches=core.ents.filter(func(e):return str(e.id)==str(id))
  core.p.carrying=matches[0] if not matches.is_empty() else null
 if core.p.get("hook")!=null:
  var matches=core.ents.filter(func(e):return str(e.get("id",""))==str(core.p.hook.ring.get("id","")))
  core.p.hook.ring=matches[0] if not matches.is_empty() else core.p.hook.ring
 if core.p.get("lastRing")!=null:
  var matches=core.ents.filter(func(e):return str(e.get("id",""))==str(core.p.lastRing.get("id","")))
  core.p.lastRing=matches[0] if not matches.is_empty() else core.p.lastRing
 core.events=[];core.deaths=0
static func actions():
 var values=[]
 for keys in ["","l","r","d","lg","rg","lgu","rgu","ljg","rjg","lj","rj","j"]:
  for frames in [6,18]: values.append([frames,keys])
 for keys in ["lxg","rxg","uxg","dxg","luxg","ruxg","ldxg","rdxg"]: values.append([12,keys])
 return values
static func restrict(core,mode):
 if mode=="no_lines":core.ents=core.ents.filter(func(e):return e.type!="zipline")
 if mode=="held_open":
  for e in core.ents:
   if e.type=="held":e.latchedOpen=true
 if mode=="no_hooks":core.ents=core.ents.filter(func(e):return e.type not in ["hookCarrier","ring"])
 if mode=="no_lantern": core.ents=core.ents.filter(func(e):return e.type!="lantern")
 if mode=="no_pods": core.ents=core.ents.filter(func(e):return e.type!="pod")
 if mode=="no_bells": core.ents=core.ents.filter(func(e):return e.type!="bell")
static func field(core,target,permanent):
 var cols=int(core.room.cols);var rows=int(core.room.rows)
 var blocked={}
 for i in range(core.room.grid.size()):
  if core.room.grid[i] in [1,3,4,5,6]: blocked[i]=true
 if permanent:
  for e in core.ents:
   if e.type=="crumble":
    for y in range(int(e.y/8),int((e.y+e.h)/8)):
     for x in range(int(e.x/8),int((e.x+e.w)/8)):blocked[y*cols+x]=true
 var at=Vector2i(clampi(int(target.x/8),0,cols-1),clampi(int(target.y/8),0,rows-1))
 var result={at.y*cols+at.x:0};var queue=[at];var cursor=0
 while cursor<queue.size():
  var p=queue[cursor];cursor+=1
  for v in [Vector2i.LEFT,Vector2i.RIGHT,Vector2i.UP,Vector2i.DOWN]:
   var n=p+v;var key=n.y*cols+n.x
   if n.x<0 or n.y<0 or n.x>=cols or n.y>=rows or blocked.has(key) or result.has(key):continue
   result[key]=result[p.y*cols+p.x]+1;queue.append(n)
 return result
static func solve(data,index,options={}):
 var core=Core.new(data.constants.duplicate(true),data.playerDefaults)
 core.load_room(Loader.parse(data.world.rooms[index]))
 var permanent=options.get("mode","")=="permanent_crumble"
 if options.get("mode","")=="static":
  for e in core.ents:
   if e.type=="zip":e.type="slide"
 restrict(core,options.get("mode",""))
 var track_wave=options.get("forbid_wavedash",false)
 var dash_trace={}
 var prefix=options.get("start",[])
 for part in prefix:
  for f in range(int(part[0])):
   core.step(Routes.decode(part[1]))
   if track_wave:dash_trace=observe_dash(core,dash_trace)
 if core.deaths>0:return {"found":false,"nodes":0,"error":"invalid starting replay"}
 restrict(core,options.get("mode_after_start",""))
 if options.get("disable_lift_x_after_start",false):core.K.liftXCap=0
 if options.get("freeze_zip_after_start",false):
  for e in core.ents:
   if e.type=="zip":e.type="slide"
 if options.has("park_zip_after_start"):
  for e in core.ents:
   if e.type=="zip":
    e.x=e.ox if options.park_zip_after_start=="home" else e.tx
    e.y=e.oy if options.park_zip_after_start=="home" else e.ty
    e.remX=0;e.remY=0;e.type="slide"
 if permanent:
  # Restore the real cap, even when the reachable decision state follows its collapse.
  for e in core.ents:
   if e.type=="crumble":e.broken=false;e.shaking=0;e.timer=0
 var g=core.room.def.workshopGoal
 var home_field=field(core,Vector2(g[0]+g[2]/2.0,g[1]-6),permanent)
 var pickup_field=home_field
 for e in core.ents:
  if e.type=="shard":pickup_field=field(core,Vector2(e.x+4,e.y+4),permanent)
 var pending=[{"state":snapshot(core),"tape":[],"score":0.0,"dash_trace":dash_trace}]
 var seen={};var nodes=0;var maximum=options.get("budget",12000);var width=options.get("width",100)
 var moves=actions()+options.get("extra_actions",[])
 for keys in ["s","ls","rs","us","ds","dsj","rdsj","ldsj","lus","rus"]:
  moves.append([6,keys])
 var best=INF
 for depth in range(options.get("depth",30)):
  var next=[]
  for parent in pending:
   for action in moves:
    nodes+=1
    if nodes>maximum:return {"found":false,"nodes":nodes-1,"depth":depth,"best_distance":best,"reason":"budget exhausted"}
    restore(core,parent.state)
    var invalid=false
    var branch_dash=parent.dash_trace.duplicate()
    for tick in range(action[0]):
     if permanent:
      for e in core.ents:
       if e.type=="crumble":e.broken=false;e.shaking=0
     if options.has("max_hook_length") and core.p.get("hook")!=null and core.p.hook.len>options.max_hook_length:invalid=true;break
     var was_ground=core.p.onGround
     core.step(Routes.decode(action[1]))
     if options.has("forbid_enemy_tell_face") and "enemy-tell" in core.events and core.combat.get("enemies",[]).any(func(e):return e.state=="tell" and e.face==options.forbid_enemy_tell_face):invalid=true;break
     if track_wave:
      branch_dash=observe_dash(core,branch_dash)
      if "super" in core.events and branch_dash.get("air",false) and branch_dash.get("down",false):invalid=true;break
     if options.get("forbid_ground_dash",false) and (was_ground or core.p.onGround) and "dash-start" in core.events:invalid=true;break
     if options.has("forbid_ground_recovery_before_x") and core.p.onGround and core.p.x<options.forbid_ground_recovery_before_x and "refill-dash" in core.events:invalid=true;break
     if options.get("forbid_slide_y",false) and core.ents.any(func(e):return e.type=="slide" and e.y!=e.oy):invalid=true;break
     if options.get("forbid_zip_face","")=="left" and core.ents.any(func(e):return e.type=="zip" and core.p.x+core.p.w<=e.x and e.x-(core.p.x+core.p.w)<=3 and core.p.y<e.y+e.h and core.p.y+core.p.h>e.y):invalid=true;break
     if options.get("forbid_climb",false) and core.p.state=="climb":invalid=true;break
     if options.get("forbid_recoil_jump",false) and "recoil-jump" in core.events:invalid=true;break
     if options.has("slide_max_x") and core.ents.any(func(e):return e.type=="slide" and e.x>options.slide_max_x):invalid=true;break
     if core.p.onGround and core.ents.any(func(e):return e.type in options.get("forbid_landing",[]) and core.standing(e)):invalid=true;break
     if core.ents.any(func(e):return e.type=="hingeArm" and e.dir in options.get("forbid_pose",{}).get(e.label,[])):invalid=true;break
     if options.get("forbid_weight",false) and core.ents.any(func(e):return e.type=="recoilPlatform" and e.get("loadedBy","")=="lantern"):invalid=true;break
     var forbidden=[]
     if not options.get("allow_hyper",false):forbidden.append("hyper")
     if not options.get("allow_wallbounce",false):forbidden.append("wallbounce")
     if not options.get("allow_super",false):forbidden.append("super")
     if not options.get("allow_ultra",false):forbidden.append("ultra")
     if core.deaths>0 or forbidden.any(func(k):return k in core.events):invalid=true;break
     if options.has("max_x") and core.p.x>options.max_x:invalid=true;break
     if Routes.at_goal(core):return {"found":true,"nodes":nodes,"depth":depth,"tape":prefix+parent.tape+[action]}
    if invalid:continue
    var state=snapshot(core)
    var digest=hash([state.p,state.ents,state.prev,state.buf,state.freeze,state.phase,state.kick_direction,state.combat,state.brute_waves,state.awake])
    if track_wave:digest=hash([digest,branch_dash])
    if seen.has(digest):continue
    seen[digest]=true
    var need_pickup=core.room.def.get("workshopRequireShard",false) and not Routes.carried(core)
    var distances=pickup_field if need_pickup else home_field
    var cell=clampi(int((core.p.y+6)/8),0,core.room.rows-1)*core.room.cols+clampi(int((core.p.x+3)/8),0,core.room.cols-1)
    var distance=distances.get(cell,1000)
    best=min(best,distance)
    var score=float(distance)+depth*.03-(0.15 if core.p.dashes>0 else 0)
    next.append({"state":state,"tape":parent.tape+[action],"score":score,"dash_trace":branch_dash})
  next.sort_custom(func(a,b):return a.score<b.score)
  pending=[];var regions={}
  for node in next:
   var p=node.state.p
   var region=[int(p.x/12),int(p.y/12),p.dashes,p.state,node.state.ents.any(func(e):return e.type=="shard" and e.get("gone",false))]
   var key=str(region)
   if regions.get(key,0)>=3:continue
   regions[key]=regions.get(key,0)+1;pending.append(node)
   if pending.size()>=width:break
  if pending.is_empty():return {"found":false,"nodes":nodes,"depth":depth,"reason":"frontier exhausted"}
 return {"found":false,"nodes":nodes,"reason":"depth exhausted","best_distance":best}

static func observe_dash(core,trace):
 # Search-only history follows the real dash aim across snapshot branches.
 if "dash-start" in core.events:trace={"air":not core.p.onGround,"down":false}
 if "dash" in core.events:trace.down=core.p.dashDir.x!=0 and core.p.dashDir.y>0
 return trace
