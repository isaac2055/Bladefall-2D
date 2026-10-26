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
static func at_goal(core):
 var goal=core.room.def.workshopGoal
 return core.p.state not in ["dead","respawn"] and core.p.onGround and Rect2(goal[0],goal[1]-2,goal[2],goal[3]+4).has_point(Vector2(core.p.x+core.p.w/2,core.p.y+core.p.h)) and (not core.room.def.get("workshopRequireShard",false) or carried(core))
static func play(data,index,tape,mode=""):
 var core=Core.new(data.constants.duplicate(true),data.playerDefaults)
 core.load_room(Loader.parse(data.world.rooms[index]))
 if mode in ["no_boost","no_x_boost"]: core.K.liftXCap=0
 if mode in ["no_boost","no_y_boost"]: core.K.liftYCap=0
 if mode=="static":
  for e in core.ents:
   if e.type=="zip": e.type="slide"
 var proof={"finish":false,"deaths":0,"frames":0,"advanced":false,"contacts":[],"actions":[],"shard":false,"first_pickup_dash":-1,"landings":[]}
 var last_contact=""
 for segment in tape:
  for f in range(int(segment[0])):
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
   if carried(core) and not proof.shard: proof.first_pickup_dash=core.p.dashes
   proof.shard=carried(core)
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
  if play(data,index,changed).finish: success.append(dt)
 return success
