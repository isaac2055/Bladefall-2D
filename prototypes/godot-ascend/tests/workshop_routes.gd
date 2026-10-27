extends RefCounted
## Ordinary-input witnesses and counterfactuals, separate from the application's UI tests.
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
static func decode(keys):
 var raw={}
 for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["j","jump"],["x","dash"],["g","grab"]]: raw[pair[1]]=pair[0] in keys
 return raw
static func carried(core):
 return core.ents.any(func(e):return e.type=="shard" and e.get("gone",false))
static func device(core,role):
 var at=core.room.def.get("workshopDevices",{}).get(role,[])
 if at.size()!=2: return null
 for e in core.ents:
  if e.type in ["zip","slide"] and e.ox==at[0] and e.oy==at[1]: return e
 return null
static func at_goal(core):
 var goal=core.room.def.workshopGoal
 return core.p.state not in ["dead","respawn"] and core.p.onGround and Rect2(goal[0],goal[1]-2,goal[2],goal[3]+4).has_point(Vector2(core.p.x+core.p.w/2,core.p.y+core.p.h)) and (not core.room.def.get("workshopRequireShard",false) or carried(core))
static func play(data,index,tape,mode=""):
 var core=Core.new(data.constants.duplicate(true),data.playerDefaults)
 core.load_room(Loader.parse(data.world.rooms[index]))
 if mode in ["no_boost","no_x_boost"]: core.K.liftXCap=0
 if mode in ["no_boost","no_y_boost"]: core.K.liftYCap=0
 if mode=="no_refill": core.ents=core.ents.filter(func(e):return e.type!="refill")
 if mode=="no_home_refill": core.ents=core.ents.filter(func(e):return not (e.type=="refill" and e.x==320 and e.y==104))
 if mode.begins_with("freeze:"):
  var e=device(core,mode.get_slice(":",1))
  if e!=null: e.type="slide"
 if mode.begins_with("early:"):
  var e=device(core,mode.get_slice(":",1))
  if e!=null: e.state="wind";e.t=0
 if mode=="permanent_crumble":
  for e in core.ents:
   if e.type=="crumble": e.type="slide"
 if mode=="static":
  for e in core.ents:
   if e.type=="zip": e.type="slide"
 var proof={"finish":false,"deaths":0,"frames":0,"advanced":false,"contacts":[],"actions":[],"refills":[],"shard":false,"first_pickup_dash":-1,"pickup_frame":-1,"landings":[],"crumbles":[]}
 var last_contact=""
 var seen_refills={}
 var crumble_states={}
 for segment in tape:
  for f in range(int(segment[0])):
   if mode.begins_with("park:") and carried(core):
    var role=mode.get_slice(":",1)
    var e=device(core,role)
    if e!=null and (role!="counter" or core.p.state=="climb" and core.p.x==400):
     e.type="slide";e.x=e.ox;e.y=e.oy;e.remX=0;e.remY=0
   if mode.begins_with("hold:"):
    var e=device(core,mode.get_slice(":",1))
    if e!=null and e.state=="hold": e.type="slide"
   if mode=="park_high":
    for e in core.ents:
     if e.type=="zip" and e.state=="hold": e.type="slide"
   if mode=="park_low" and core.p.state=="climb" and core.p.x==144 and core.p.dashes==0:
    for e in core.ents:
     if e.type=="zip": e.type="slide";e.x=e.ox;e.y=e.oy
   var raw=decode(segment[1])
   if mode=="no_dash" or (mode=="no_return_dash" and carried(core)): raw.dash=false
   var lift=core.lift()
   core.step(raw)
   proof.frames+=1
   for kind in ["super","hyper","wallbounce","ultra"]: proof.advanced=proof.advanced or kind in core.events
   if carried(core) and not proof.shard:
    proof.first_pickup_dash=core.p.dashes
    proof.pickup_frame=proof.frames
   proof.shard=carried(core)
   for e in core.ents:
    if e.type=="crumble":
     var status="broken" if e.get("broken",false) else ("shaking" if e.get("shaking",0)>0 else "ready")
     if crumble_states.get(e.id,"")!=status:
      proof.crumbles.append({"f":proof.frames,"state":status,"x":e.x,"y":e.y,"dash":core.p.dashes,"player":[core.p.x,core.p.y]})
      crumble_states[e.id]=status
    if e.type=="refill" and e.timer>0 and not seen_refills.has(e.id):
     seen_refills[e.id]=true
     proof.refills.append({"f":proof.frames,"x":e.x,"y":e.y})
   if "land" in core.events: proof.landings.append([proof.frames,core.p.x,core.p.y])
   for kind in ["jump","climbjump","walljump","dash-start"]:
    if kind in core.events: proof.actions.append({"f":proof.frames,"kind":kind,"x":core.p.x,"y":core.p.y,"dash":core.p.dashes,"vx":core.p.vx,"vy":core.p.vy,"lift":lift})
   var contact=""
   for e in core.ents:
    # onGround updates on the following tick; observe the landing before its dash refill.
    var feet_on=core.p.y+core.p.h==e.y and core.p.x<e.x+e.w and core.p.x+core.p.w>e.x and core.p.vy==0
    if e.type=="zip" and (core.riding(e) or feet_on):
     contact="%s,%s/%s/%s"%[e.ox,e.oy,e.state,core.p.dashes]
     if contact!=last_contact: proof.contacts.append({"f":proof.frames,"origin":[e.ox,e.oy],"state":e.state,"dash":core.p.dashes,"player_state":core.p.state,"x":core.p.x,"y":core.p.y})
   last_contact=contact
   proof.finish=proof.finish or at_goal(core)
   if core.deaths>0: break
  if core.deaths>0: break
 proof.deaths=core.deaths
 proof.final_position=[core.p.x,core.p.y]
 return proof
static func timing_window(data,index,part,radius=8):
 var tape=data.world.rooms[index].workshopRoutes[0].tape
 var success=[]
 for dt in range(-radius,radius+1):
  var changed=tape.duplicate(true)
  changed[part][0]=max(0,changed[part][0]+dt)
  var proof=play(data,index,changed)
  if proof.finish and proof.deaths==0 and not proof.advanced: success.append(dt)
 return success
