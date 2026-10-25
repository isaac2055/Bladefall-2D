extends RefCounted
## One authoritative physical world, with every room and entity state constructed before play.
const Core = preload("res://scripts/core.gd")
const Loader = preload("res://scripts/room_loader.gd")
const Layout = preload("res://scripts/world_layout.gd")
var data
var cores = {}
var placements = {}
var rectangles = {}
var cells = {}
var regions = []
var active_id = ""
var checkpoint_id = ""
var bearings = {}
var mara_complete = false
var notices = []
var frames = 0
var closed_edges = []
var restore_count = 0
var buckets = {}
var dormant = {}
var mara_registered=false
var parsed = {}
var progress = {}
var elsie_met=false
var elsie_perch=0
var quest_lantern=false
var quest_complete=false
var quest_award_frame=-1000
var quest_deaths=0
func _init(source):
 data=source.duplicate(true)
 data.world=Layout.build(source.world)
 var sections=data.world.sections.duplicate(true)
 for q in data.world.quests: sections.append_array(q.sections)
 for q in data.world.get("secrets",[]): sections.append_array(q.sections)
 sections.append_array(data.world.get("passages",[]))
 for s in sections: placements[s.room]=Vector2(s.x*8,s.y*8)
 for d in data.world.rooms:
  var room=Loader.parse(d)
  parsed[d.id]=room
  var point=placements.get(d.id,Vector2.ZERO)
  rectangles[d.id]=Rect2(point,Vector2(room.w,room.h))
  regions.append(d.id)
  for by in range(floori(point.y/64),floori((point.y+room.h-1)/64)+1):
   for bx in range(floori(point.x/64),floori((point.x+room.w-1)/64)+1):
    var bucket=Vector2i(bx,by)
    if not buckets.has(bucket): buckets[bucket]=[]
    buckets[bucket].append(d.id)
  for r in range(int(room.rows)):
   for c in range(int(room.cols)):
    var key=Vector2i(point/8)+Vector2i(c,r)
    var value=room.grid[r*int(room.cols)+c]
    if not cells.has(key) or value==1 or cells[key]==0: cells[key]=value
 # Close exposed edges with actual stone. No invisible room-boundary walls exist in play.
 for id in regions:
  var room=parsed[id]
  var origin=Vector2i(placements[id]/8)
  for r in range(int(room.rows)):
   for c in range(int(room.cols)):
    if c not in [0,int(room.cols)-1] and r not in [0,int(room.rows)-1]: continue
    var key=origin+Vector2i(c,r)
    if cells.get(key,0)!=0: continue
    var outward=Vector2i(-1,0) if c==0 else (Vector2i(1,0) if c==int(room.cols)-1 else (Vector2i(0,-1) if r==0 else Vector2i(0,1)))
    if not cells.has(key+outward):
     cells[key]=1
     closed_edges.append(key)
 restart()
func restart():
 for old in cores.values(): old.world_context=null
 cores.clear()
 progress.clear()
 bearings.clear()
 elsie_met=false
 elsie_perch=0
 quest_lantern=false
 quest_complete=false
 quest_award_frame=-1000
 quest_deaths=0
 mara_complete=false
 mara_registered=false
 dormant=data.playerDefaults.duplicate(true)
 dormant.x=-1000000
 dormant.y=-1000000
 dormant.state="dead"
 dormant.strikeHit={}
 notices.clear()
 frames=0
 for id in regions:
  var core=Core.new(data.constants,data.playerDefaults)
  core.load_room(parsed[id])
  core.world_context=self
  core.world_origin=placements[id]
  for e in core.ents:
   e.source_room=id
   e.source_id=e.id
  cores[id]=core
 active_id=data.world.get("atlasStart",data.world.sections[0].room)
 checkpoint_id=active_id
func active(): return cores[active_id]
func position(core=null):
 var current=active() if core==null else core
 return current.world_origin+Vector2(current.p.x,current.p.y)
func tile_global(c,r): return cells.get(Vector2i(c,r),1)
func blocker(core,x,y,w,h,ignore):
 var origin=core.world_origin
 var gx=x+origin.x
 var gy=y+origin.y
 for r in range(floori(gy/8.0),floori((gy+h-1)/8.0)+1):
  for c in range(floori(gx/8.0),floori((gx+w-1)/8.0)+1):
   if tile_global(c,r)==1: return -2
 var area=Rect2(gx,gy,w,h)
 for id in nearby(area):
  if not rectangles[id].grow(8).intersects(area): continue
  var other=cores[id]
  var shift=other.world_origin
  for i in range(other.ents.size()):
   if other==core and i==ignore: continue
   var e=other.ents[i]
   if other.solid_entity(e) and area.intersects(Rect2(e.x+shift.x,e.y+shift.y,e.w,e.h)):
    return i if other==core else -2
 return -1
func thru_global(core,a):
 var x=a.x+core.world_origin.x
 var y=a.y+core.world_origin.y+a.h
 if fmod(y,8)==0:
  for c in range(floori(x/8.0),floori((x+a.w-1)/8.0)+1):
   if tile_global(c,int(y/8))==2: return true
 for id in nearby(Rect2(x,y-1,a.w,3)):
  var other=cores[id]
  for e in other.ents:
   if e.type=="thru" and not e.get("gone",false) and e.y+other.world_origin.y==y and x<e.x+other.world_origin.x+e.w and x+a.w>e.x+other.world_origin.x: return true
 return false
func step(raw):
 var current=active()
 var old_state=current.p.state
 if old_state=="dead" and current.p.deadTimer<=1 and current.freeze==0: return_extra_objects(current)
 frames+=1
 current.step(raw)
 if old_state=="dead" and current.p.state=="respawn":
  restore_progress(current)
  restore_count+=1
 tick_inactive()
 collect_progress()
 tick_elsie()
func tick_inactive():
 var current=active()
 for id in regions:
  var other=cores[id]
  if other==current: continue
  # Room machinery remains alive; a dormant proxy is never mistaken for a rider or visitor.
  var player=other.p
  other.p=dormant
  other.update_entities()
  other.update_devices({"mx":0,"my":0,"jump":false,"dash":false,"grab":false,"strike":false,"parry":false,"portal":false})
  other.p=player
  other.room_frame+=1
  if other.awake: other.sweeper_clock+=1
  for e in other.sweepers:
   e.prevX=e.x
   e.prevY=e.y
   e.merge(other.sweeper_at(e,other.sweeper_clock),true)
func collect_progress():
 # Only the active knight can collect or light a stake. Inactive machinery cannot.
 for id in [active_id]:
  var core=cores[id]
  var kept=progress.get(id,{})
  for e in core.ents:
   if e.type=="shard" and e.get("gone",false):
    kept[str(e.source_id)]={"gone":true}
    var name=core.room.def.get("bearing","")
    if name!="" and not bearings.has(name):
     bearings[name]=true
     notices.append(name+" bearing found · "+str(bearings.size())+" / 3")
   elif e.type=="stone" and e.get("lit",false): kept[str(e.source_id)]={"lit":true}
  progress[id]=kept
 if bearings.size()==3 and not mara_complete:
  mara_complete=true
  notices.append("All three bearings agree · return to Mara")
func restore_progress(core):
 for e in core.ents:
  e.source_room=core.room.id
  e.source_id=e.id
  var saved=progress.get(core.room.id,{}).get(str(e.id),{})
  e.merge(saved,true)
 # A home-room retry must not duplicate an object left in another preloaded room.
 for other in cores.values():
  if other==core: continue
  for moved in other.ents:
   if moved.get("source_room", "")==core.room.id:
    core.ents=core.ents.filter(func(e):return e.source_id!=moved.source_id)
 for i in range(core.ents.size()): core.ents[i].id=i
func retry():
 var core=active()
 var deaths=core.deaths
 return_extra_objects(core)
 core.load_room(parsed[active_id],true)
 core.deaths=deaths
 restore_progress(core)
func enter(id,practice=false):
 if id==active_id and not practice: return false
 var old=active()
 var point=position()
 var motion=old.p
 if practice:
  active_id=id
  checkpoint_id=id
  var destination=active()
  destination.p=data.playerDefaults.duplicate(true)
  destination.p.x=destination.room.spawn.x
  destination.p.y=destination.room.spawn.y
  destination.p.maxDashes=destination.room.maxDashes
  destination.p.dashes=destination.room.maxDashes
  destination.p.strikeHit={}
  destination.freeze=0
  destination.prev={}
  destination.buf={"jump":0,"dash":0,"grab":0,"strike":0,"parry":0,"portal":0}
  return true
 active_id=id
 var destination=active()
 var carry=motion.carrying
 if carry!=null:
  old.ents.erase(carry)
  for i in range(old.ents.size()): old.ents[i].id=i
  carry.x+=old.world_origin.x-destination.world_origin.x
  carry.y+=old.world_origin.y-destination.world_origin.y
  carry.ox+=old.world_origin.x-destination.world_origin.x
  carry.oy+=old.world_origin.y-destination.world_origin.y
  carry.id=destination.ents.size()
  destination.ents.append(carry)
 destination.p=motion
 destination.p.x=point.x-destination.world_origin.x
 destination.p.y=point.y-destination.world_origin.y
 destination.p.maxDashes=destination.room.maxDashes
 destination.p.dashes=min(destination.p.dashes,destination.p.maxDashes)
 destination.p.strikeHit={}
 destination.prev=old.prev.duplicate()
 destination.buf=old.buf.duplicate()
 destination.freeze=old.freeze
 destination.deaths=old.deaths
 checkpoint_id=id
 return true
func update_region():
 var point=position()+Vector2(4,5)
 if rectangles[active_id].has_point(point): return false
 for id in regions:
  if id!=active_id and rectangles[id].has_point(point): return enter(id)
 return false

func shutdown():
 for core in cores.values(): core.world_context=null
 cores.clear()

func nearby(area):
 var result=[]
 for by in range(floori(area.position.y/64),floori(area.end.y/64)+1):
  for bx in range(floori(area.position.x/64),floori(area.end.x/64)+1):
   for id in buckets.get(Vector2i(bx,by),[]):
    if id not in result: result.append(id)
 return result
func register_mara():
 if mara_complete and not mara_registered:
  mara_registered=true
  notices.append("Mara's chart is complete · all three bearings registered")

func return_extra_objects(core):
 for e in core.ents.duplicate():
  if e.source_room==core.room.id: continue
  var source=cores[e.source_room]
  core.ents.erase(e)
  e.x=e.ox+core.world_origin.x-source.world_origin.x
  e.y=e.oy+core.world_origin.y-source.world_origin.y
  e.ox=e.x
  e.oy=e.y
  e.vx=0
  e.vy=0
  e.remX=0
  e.remY=0
  e.held=false
  e.returning=false
  e.id=source.ents.size()
  source.ents.append(e)
 core.p.carrying=null

func tick_elsie():
 if int(data.world.n)!=2 or not elsie_met or quest_complete: return
 var core=active()
 if core.deaths>quest_deaths:
  quest_deaths=core.deaths
  if quest_lantern:
   quest_lantern=false
   elsie_perch=data.quest.perches.size()-1
   notices.append("The moths take it back · find their last perch")
 if core.p.state in ["dead","respawn"]: return
 var point=Vector2(core.p.x+4,core.p.y+5.5)
 if quest_lantern:
  if active_id=="cl2-w2-kitchen" and abs(point.x-92)<14 and abs(point.y-138)<18:
   quest_lantern=false
   quest_complete=true
   quest_award_frame=frames
   notices.append("♥ Heart · A Place for Supper")
  return
 var perch=data.quest.perches[elsie_perch]
 var last=elsie_perch==data.quest.perches.size()-1
 if active_id==perch.room and abs(point.x-perch.x)<(10 if last else 44) and abs(point.y-perch.y)<(12 if last else 40):
  if last:
   quest_lantern=true
   notices.append("The lantern · bring it to Elsie")
  else: elsie_perch+=1
func elsie_voice():
 elsie_met=true
 return "refuge:done" if quest_complete else ("refuge:line1" if quest_lantern else "refuge:line0")
