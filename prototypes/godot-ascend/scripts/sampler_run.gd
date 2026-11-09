extends RefCounted
## One full-world attempt. Transport is animated in world coordinates and shares its run clock.
const Profile=preload("res://scripts/run_profile.gd")
const Route=preload("res://scripts/affixed_route.gd")
var profile
var ride={}
var result={}
var last_deaths=0
var pickup_left=false
var pickup_origin=Vector2.ZERO
var pickup_drop=0.0
var failure_frames=0
var drop_origin=Vector2.ZERO
var award_age=0.0
func _init(save_path="user://bladefall-garden.json"):
 profile=Profile.new(save_path)
func start(world,eligible=true,carrying=false):
 ride={}
 result={}
 pickup_left=false
 pickup_drop=0
 failure_frames=0
 award_age=0
 var spawn=world.parsed[world.active_id].spawn
 pickup_origin=world.placements[world.active_id]+Vector2(spawn.x-12,spawn.y)
 last_deaths=world.active().deaths
 profile.start(int(world.data.world.n),eligible,carrying)
func invalidate():
 profile.invalidate()
 ride={}
func carrying(): return not profile.run.is_empty() and profile.run.carrying
func begin_ride(world,target,from_point=null):
 var spawn=world.parsed[target].spawn
 var from=world.position() if from_point==null else from_point
 var to=world.placements[target]+Vector2(spawn.x,spawn.y)
 var height=clampf(absf(to.x-from.x)*.18+32,48,120)
 var top=minf(from.y,to.y)-height
 ride={"phase":"travel","from":from,"to":to,"target":target,"frame":0,"c1":Vector2(from.x,top),"c2":Vector2(to.x,top),"duration":clampf((from.distance_to(to)+height)/250.0,1.4,9.0)}
func begin_reveal(world):
 begin_ride(world,world.data.world.campaignWorkshop.rooms[0])
 ride.phase="reveal"
 ride.reveal_age=0.0
 ride.reveal_duration=4.2
 ride.home=profile.home(int(world.data.world.n))
func cradle_point(actor,height):
 if ride.get("phase","")=="reveal":
  var t=float(ride.get("reveal_age",0))/float(ride.get("reveal_duration",4.2))*4.2
  var home=int(ride.get("home",1))
  var lower=smoothstep(1.4 if home==1 else 1.0 if home==2 else 1.8,3.7,t)
  var start=Vector2(60,-74) if home==1 else Vector2(25,-100) if home==2 else Vector2(96,-42)
  return ride.from+start.lerp(Vector2(-3,height),lower)
 return actor+Vector2(-3,height)
func ride_point():
 var t=clampf(float(ride.frame)/60/ride_duration(),0,1)
 t=t*t*t*(t*(t*6-15)+10)
 var u=1-t
 return u*u*u*ride.from+3*u*u*t*ride.c1+3*u*t*t*ride.c2+t*t*t*ride.to
func ride_duration(): return ride.get("duration",2.0)
func tick(world,practice=false):
 if profile.run.is_empty(): start(world,not practice)
 if practice: profile.invalidate()
 var core=world.active()
 var deaths=core.deaths
 var delta=maxi(0,deaths-last_deaths)
 last_deaths=deaths
 profile.tick(core.room.id,delta)
 award_age+=1.0/60.0
 pickup_drop=maxf(0,pickup_drop-1.0/60.0)
 if failure_frames>0:
  failure_frames-=1
  if failure_frames==0:
   reset_failed(world)
   return "reset"
  return "failure"
 if carrying() and delta>0:
  failure_frames=24
  drop_origin=world.position()
  profile.run.carrying=false
  pickup_drop=.4
  return "failure"
 if not ride.is_empty():
  if ride.get("phase","")=="reveal": return "ride"
  if ride.get("phase","")=="landing":
   ride.landing_frame+=1
   if ride.landing_frame>=30:
    ride={}
    return "landed"
   return "ride"
  ride.frame+=1
  if float(ride.frame)/60>=ride_duration():
   var target=ride.target
   var count=core.deaths
   world.enter(target,true)
   world.active().deaths=count
   last_deaths=count
   ride.phase="landing"
   ride.landing_frame=0
   return "docked"
  return "ride"
 if not result.is_empty() or practice: return ""
 # Start patch is behind the fresh-world spawn. Returning from later rooms cannot opt in.
 var start_id=world.data.world.get("atlasStart",world.regions[0])
 if core.room.id==start_id and profile.can_carry(int(world.data.world.n)) and not carrying() and profile.run.eligible:
  var at=world.position()
  if at.distance_to(pickup_origin)>24: pickup_left=true
  if profile.run.visited.size()<=1 and at.distance_to(pickup_origin)<7:
   world.restart()
   start(world,true,true)
   return "reset"
 var w=world.data.world
 # Remove the superseded cover challenge from the road without touching its editable study.
 if int(w.n)==23 and core.room.id=="cl23-puzzle-bridge-backwards" and Route.at_goal(core):
  profile.mark_clear(core.room.id)
  begin_ride(world,"cl23-puzzle-delivery-cannot-ride")
  return "ride"
 if w.has("campaignWorkshop"):
  var route=w.campaignWorkshop
  if core.room.id==route.entry:
   if core.p.onGround and core.p.state not in ["dead","respawn"]:
    begin_ride(world,route.rooms[0])
    return "ride"
  elif route.walkTargets.has(core.room.id):
   if core.p.onGround:
    begin_ride(world,route.walkTargets[core.room.id])
    return "ride"
  elif core.room.id in route.rooms and Route.at_goal(core):
   profile.mark_clear(core.room.id)
   world.campaign_completed[core.room.id]=true
   var next=route.landing[core.room.id]
   if next!="":
    begin_ride(world,route.walkTargets.get(next,next))
    return "ride"
   complete(world)
 elif int(w.n) in [21,22]:
  if core.room.id=="cl%d-atlas-crossroads"%int(w.n) and core.p.onGround: complete(world)
 elif int(w.n)>=101 and core.p.state not in ["dead","respawn"]:
  # Authored Core exit aperture: near the east edge, at an open row (never a wall).
  var r=clampi(int((core.p.y+core.p.h/2)/8),0,int(core.room.rows)-1)
  var blocked=core.ents.any(func(e):return e.type=="gate" and e.x>=core.room.w-24 and not e.get("open",false))
  if not blocked and core.p.x>=core.room.w-16 and core.room.def.map[r][-1] in [".","G"]: complete(world)
 return ""
func complete(world):
 var required=world.data.world.get("requiredMainRooms",[]).duplicate()
 if world.data.world.has("campaignWorkshop"):
  for id in world.data.world.campaignWorkshop.rooms:
   if not profile.run.cleared.has(id): return
 result=profile.finish(required)
 if not result.is_empty(): award_age=0
func reset_failed(world):
 world.restart()
 start(world,true,false)
 pickup_drop=0
func retry(world):
 ride={}
 if carrying(): reset_failed(world)
 else:
  world.retry()
  world.active().deaths+=1
  if not profile.run.is_empty() and not profile.run.finished: profile.run.deaths+=1
 last_deaths=world.active().deaths

# Explicit developer completion path: uses the real result/reward/unlock pipeline.
func dev_next(world):
 var w=world.data.world
 var core=world.active()
 var order=w.get("requiredMainRooms",[]).duplicate()
 var route=w.get("campaignWorkshop",{})
 if not route.is_empty():
  if not route.entry in order: order.append(route.entry)
  for id in route.rooms:
   if not id in order: order.append(id)
 if int(w.n)>=101:
  profile.tick(core.room.id,maxi(0,core.deaths-last_deaths))
  last_deaths=core.deaths
  dev_finish_pose(core)
  complete(world)
  return
 var index=order.find(core.room.id)
 if index<0:
  for reward in world.data.get("secretRewards",[]):
   if reward.room==core.room.id: world.claim_secret(reward)
  for reward in world.data.get("branchRewards",[]):
   if core.room.id in reward.rooms: world.claim_branch(reward)
  var next=order[0] if not order.is_empty() else ""
  if next!="": world.enter(next,true)
  return
 for i in range(index+1):
  profile.mark_clear(order[i])
  profile.run.visited[order[i]]=true
 profile.tick(core.room.id,maxi(0,core.deaths-last_deaths))
 last_deaths=core.deaths
 if not route.is_empty() and core.room.id in route.rooms:
  world.campaign_completed[core.room.id]=true
  if index==order.size()-1:
   dev_finish_pose(core)
   complete(world)
  else: begin_ride(world,order[index+1])
 elif index+1<order.size():
  var count=core.deaths
  world.enter(order[index+1],true)
  world.active().deaths=count
 else:
  var ending="cl%d-atlas-crossroads"%int(w.n)
  if world.cores.has(ending):
   var count=core.deaths
   world.enter(ending,true)
   world.active().deaths=count
  complete(world)

func dev_finish_pose(core):
 var goal=core.room.def.get("workshopGoal",core.room.def.get("puzzleGoal",[]))
 if goal.size()==4:
  core.p.x=goal[0]+goal[2]/2-core.p.w/2
  core.p.y=goal[1]-core.p.h
 elif int(profile.run.chapter)>=101:
  for row in range(int(core.room.rows)-1,0,-1):
   if core.room.def.map[row][-1] in [".","G"]:
    core.p.x=core.room.w-16
    core.p.y=(row+1)*8-core.p.h
    break
 core.p.vx=0;core.p.vy=0;core.p.onGround=true;core.p.state="normal"
