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
func begin_ride(world,target):
 var spawn=world.parsed[target].spawn
 ride={"from":world.position(),"to":world.placements[target]+Vector2(spawn.x,spawn.y),"target":target,"frame":0}
func ride_point():
 var a=ride.from
 var b=ride.to
 var top=minf(a.y,b.y)-32
 var up=maxf(.4,absf(a.y-top)/100)
 var across=maxf(.3,absf(a.x-b.x)/180)
 var down=maxf(.4,absf(b.y-top)/100)
 var t=float(ride.frame)/60
 if t<up: return a.lerp(Vector2(a.x,top),smoothstep(0,up,t))
 t-=up
 if t<across: return Vector2(lerpf(a.x,b.x,smoothstep(0,across,t)),top)
 t-=across
 return Vector2(b.x,lerpf(top,b.y,smoothstep(0,down,t)))
func ride_duration():
 var top=minf(ride.from.y,ride.to.y)-32
 return maxf(.4,absf(ride.from.y-top)/100)+maxf(.3,absf(ride.from.x-ride.to.x)/180)+maxf(.4,absf(ride.to.y-top)/100)
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
  ride.frame+=1
  if float(ride.frame)/60>=ride_duration():
   var target=ride.target
   var count=core.deaths
   world.enter(target,true)
   world.active().deaths=count
   last_deaths=count
   ride={}
   return "landed"
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
    begin_ride(world,route.walks[0])
    return "ride"
  elif route.walkTargets.has(core.room.id):
   if core.p.onGround and absf(core.p.x-core.room.def.galleryDock*8)<12:
    begin_ride(world,route.walkTargets[core.room.id])
    return "ride"
  elif core.room.id in route.rooms and Route.at_goal(core):
   profile.mark_clear(core.room.id)
   world.campaign_completed[core.room.id]=true
   var next=route.landing[core.room.id]
   if next!="":
    begin_ride(world,next)
    return "ride"
   complete(world)
 elif int(w.n) in [21,22]:
  if core.room.id=="cl%d-atlas-crossroads"%int(w.n) and core.p.onGround: complete(world)
 elif int(w.n)>=101 and core.p.state not in ["dead","respawn"]:
  # Authored Core exit aperture: near the east edge, at an open row (never a wall).
  var r=clampi(int((core.p.y+core.p.h/2)/8),0,int(core.room.rows)-1)
  if core.p.x>=core.room.w-20 and core.room.def.map[r][-1] in [".","G"]: complete(world)
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
 if carrying(): reset_failed(world)
 else:
  world.retry()
  world.active().deaths+=1
  if not profile.run.is_empty() and not profile.run.finished: profile.run.deaths+=1
 last_deaths=world.active().deaths
