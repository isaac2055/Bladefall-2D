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
var silas_met=false
var silas_step=0
var quest_key=false
var quest_striking=false
var governor_flash=0
var elsie_met=false
var elsie_perch=0
var quest_lantern=false
var quest_complete=false
var quest_award_frame=-1000
var quest_deaths=0
var seam_tiles={}
var seam_closed={}
var branch_hearts={}
var branch_entered={}
var portal_rooms={}
var portal_cells={}
var secret_hearts={}
var secret_front_entry=false
var award_color="#ff9fc8"
func _init(source):
 data=preload("res://scripts/authoring_data.gd").read(source)
 var sections=data.world.sections.duplicate(true)
 for q in data.world.quests: sections.append_array(q.sections)
 for q in data.world.get("secrets",[]): sections.append_array(q.sections)
 sections.append_array(data.world.get("passages",[]))
 for s in sections: placements[s.room]=Vector2(s.x*8,s.y*8)
 for d in data.world.rooms:
  var room=Loader.parse(d)
  for r in range(int(room.rows)):
   for c in range(int(room.cols)):
    if Loader.glyph(d,c,r) in ["-","(",")","I","{","}"]: room.grid[r*int(room.cols)+c]=1
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
 for id in regions:
  if parsed[id].def.get("nativeLiftClearance",false):
   var origin=Vector2i(placements[id]/8)
   for r in range(17,23): cells[origin+Vector2i(-1,r)]=0
 # Close exposed edges with actual stone. No invisible room-boundary walls exist in play.
 for id in regions:
  var room=parsed[id]
  var origin=Vector2i(placements[id]/8)
  for r in range(int(room.rows)):
   for c in range(int(room.cols)):
    if c not in [0,int(room.cols)-1] and r not in [0,int(room.rows)-1]: continue
    var key=origin+Vector2i(c,r)
    # Preserve the secret shaft and native governor lift clearance.
    # Rock backing supplies the outside wall; an extra edge cap seals the entry.
    if room.def.get("nativeOpenLeftShaft",false) and c==0 and r>=(17 if room.def.get("nativeLiftClearance",false) else 18): continue
    if cells.get(key,0)!=0: continue
    var outward=Vector2i(-1,0) if c==0 else (Vector2i(1,0) if c==int(room.cols)-1 else (Vector2i(0,-1) if r==0 else Vector2i(0,1)))
    if not cells.has(key+outward):
     cells[key]=1
     closed_edges.append(key)
 for id in regions:
  var def=parsed[id].def
  if int(data.world.n)>=21 and def.get("closeWhilePlayed",false) and def.has("seam"):
   seam_tiles[id]=[]
   for tile in def.seam:
    var local=Vector2i(tile[0],tile[1])
    var key=Vector2i(placements[id]/8)+local
    var value={"#":1,"%":1,"=":2,"^":3,"v":4,"<":5,">":6}.get(tile[2],0)
    seam_tiles[id].append({"local":local,"point":key,"open":cells.get(key,0),"closed":value})
 restart()
func restart():
 for old in cores.values(): old.world_context=null
 cores.clear()
 for id in seam_tiles: set_seam(id,false)
 progress.clear()
 bearings.clear()
 silas_met=false
 silas_step=0
 quest_key=false
 quest_striking=false
 governor_flash=0
 elsie_met=false
 elsie_perch=0
 quest_lantern=false
 quest_complete=false
 quest_award_frame=-1000
 quest_deaths=0
 branch_hearts.clear()
 branch_entered.clear()
 portal_rooms.clear()
 portal_cells.clear()
 secret_hearts.clear()
 secret_front_entry=false
 award_color="#ff9fc8"
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
  configure_live_core(core)
  core.world_origin=placements[id]
  for e in core.ents:
   e.source_room=id
   e.source_id=e.id
  cores[id]=core
 active_id=data.world.get("atlasStart",data.world.sections[0].room)
 checkpoint_id=active_id
func configure_live_core(core):
 core.autonomous_sweepers=int(data.world.n)==1
 if data.has("whiteFlowers"):
  core.pollen_config=data.whiteFlowers
  core.white_flowers=data.whiteFlowers.patches.filter(func(patch):return patch.room==core.room.id)
func active(): return cores[active_id]
func position(core=null):
 var current=active() if core==null else core
 return current.world_origin+Vector2(current.p.x,current.room.h-current.p.y-current.p.h if current.flipped else current.p.y)
func tile_global(c,r): return 0 if portal_cells.has(Vector2i(c,r)) else cells.get(Vector2i(c,r),1)
func blocker(core,x,y,w,h,ignore):
 var origin=core.world_origin
 if core.flipped: y=core.room.h-y-h
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
   if other.solid_entity(e) and area.intersects(Rect2(e.x+shift.x,(other.room.h-e.y-e.h if other.flipped else e.y)+shift.y,e.w,e.h)):
    return i if other==core else -2
 return -1
func thru_global(core,a):
 var x=a.x+core.world_origin.x
 var y=(core.room.h-a.y-a.h if core.flipped else a.y+a.h)+core.world_origin.y
 if fmod(y,8)==0:
  for c in range(floori(x/8.0),floori((x+a.w-1)/8.0)+1):
   if tile_global(c,int(y/8)-(1 if core.flipped else 0))==2: return true
 for id in nearby(Rect2(x,y-1,a.w,3)):
  var other=cores[id]
  for e in other.ents:
   if e.type!="thru" or e.get("gone",false): continue
   var ey=(other.room.h-e.y-e.h if other.flipped else e.y)+other.world_origin.y
   var edge=ey+e.h if core.flipped else ey
   if edge==y and x<e.x+other.world_origin.x+e.w and x+a.w>e.x+other.world_origin.x: return true
 return false
func step(raw):
 var current=active()
 update_seams(raw)
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
 tick_silas()
 tick_secret_hearts()
 tick_branch_rewards()
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
  other.advance_sweepers(other.sweeper_clock+(1 if other.awake or int(data.world.n)==1 else 0))
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
 for i in range(core.ents.size()):
  if not core.ents[i].id is String: core.ents[i].id=i
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
 if old.flipped: old.GravityDevice.mirror(old)
 for reward in data.get("branchRewards",[]):
  if practice and id in reward.rooms: branch_entered[reward.id]=false
  elif id==reward.rooms[0] and active_id==reward.host: branch_entered[reward.id]=true
  if not practice and active_id==reward.room and id in reward.rooms and id!=reward.room and branch_entered.get(reward.id,false): claim_branch(reward)
 if id=="cl3-secret-e2": secret_front_entry=not practice and active_id=="cl3-c3-upper"
 if not practice and active_id=="cl3-secret-e2" and id=="cl3-pass-14" and secret_front_entry:
  for reward in data.get("secretRewards",[]): claim_secret(reward)
 if id=="cl2-secret-w2": secret_front_entry=not practice and active_id=="cl2-w2-descent"
 if not practice and active_id=="cl2-secret-w2" and id=="cl2-pass-29" and secret_front_entry:
  for reward in data.get("secretRewards",[]): claim_secret(reward)
 var point=position()
 var motion=old.p
 if practice:
  active_id=id
  checkpoint_id=id
  var destination=active()
  if data.world.get("workshop",false): destination.load_room(parsed[id])
  configure_live_core(destination)
  destination.world_context=self
  destination.p=data.playerDefaults.duplicate(true)
  destination.p.x=destination.room.spawn.x
  destination.p.y=destination.room.spawn.y
  destination.p.maxDashes=destination.room.maxDashes
  destination.p.dashes=destination.room.maxDashes
  destination.p.strikeHit={}
  destination.MovementTwo.reset(destination)
  destination.freeze=0
  destination.prev={}
  destination.buf={"jump":0,"dash":0,"grab":0,"strike":0,"parry":0,"portal":0}
  return true
 active_id=id
 var destination=active()
 configure_live_core(destination)
 destination.world_context=self
 var carry=motion.carrying
 if carry!=null:
  old.ents.erase(carry)
  for i in range(old.ents.size()):
   if not old.ents[i].id is String: old.ents[i].id=i
  carry.x+=old.world_origin.x-destination.world_origin.x
  carry.y+=old.world_origin.y-destination.world_origin.y
  carry.ox+=old.world_origin.x-destination.world_origin.x
  carry.oy+=old.world_origin.y-destination.world_origin.y
  carry.id=destination.ents.size()
  destination.ents.append(carry)
 destination.p=motion
 if destination.room.def.get("movement","")=="survive-2":
  if not destination.p.has("move2"): destination.MovementTwo.reset(destination)
 else: destination.p.erase("move2")
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
   award_color="#ff9fc8"
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

func heart_count(): return int(quest_complete)+secret_hearts.size()+branch_hearts.size()
func claim_secret(reward):
 if secret_hearts.has(reward.id): return
 secret_hearts[reward.id]=true
 quest_award_frame=frames
 award_color=reward.color
 notices.append("♥ "+reward.name+" · "+reward.title)
func tick_secret_hearts():
 if not secret_front_entry or active().p.state in ["dead","respawn"]: return
 var p=active().p
 for reward in data.get("secretRewards",[]):
  if active_id==reward.room and abs(p.x+4-reward.x)<=9 and abs(p.y+5.5-reward.y)<=11: claim_secret(reward)

func silas_voice():
 silas_met=true
 return "defector:done" if quest_complete else ("defector:line1" if silas_step>=1 else "defector:line0")
func tick_silas():
 if int(data.world.n)!=3 or not silas_met or quest_complete: return
 var core=active()
 var died=core.deaths>quest_deaths
 quest_deaths=core.deaths
 var strike_new=core.p.strikeTimer>0 and not quest_striking
 quest_striking=core.p.strikeTimer>0
 if governor_flash>0: governor_flash-=1
 if died and quest_key:
  quest_key=false
  notices.append("Silas catches the key · collect it from him again")
  return
 if core.p.state in ["dead","respawn"]: return
 if silas_step==0:
  var sp=data.quest.tooth
  if active_id==sp.room and strike_new and core.overlap(core.strike_box(),core.rect(sp.x-10,sp.y-10,20,20)):
   if core.frame%144<44:
    silas_step=1
    notices.append("The governor stops · take the key from Silas")
   else:
    governor_flash=8
    notices.append("Clang · wait for the bright tooth")
  return
 var point=Vector2(core.p.x+4,core.p.y+5.5)
 var sp=data.quest.hook if quest_key else data.quest.giver
 if active_id!=sp.room: return
 if abs(point.x-sp.x)<(14 if quest_key else 16) and abs(point.y-sp.y)<18:
  if not quest_key:
   quest_key=true
   notices.append("The winding key · hang it on the toll hook")
  else:
   quest_key=false
   quest_complete=true
   silas_step=2
   quest_award_frame=frames
   award_color="#ff9fc8"
   notices.append("♥ Heart · The Clockwork Defector")

func set_portal_holes(core,holes):
 var points=[]
 for cell in holes:
  points.append(Vector2i(core.world_origin/8)+Vector2i(cell.x,int(core.room.rows)-1-cell.y if core.flipped else cell.y))
 portal_rooms[core.room.id]=points
 portal_cells.clear()
 for list in portal_rooms.values():
  for cell in list: portal_cells[cell]=true
func claim_branch(reward):
 if branch_hearts.has(reward.id): return
 branch_hearts[reward.id]=true
 quest_award_frame=frames
 award_color=reward.color
 notices.append("♥ Heart · "+reward.title)
func tick_branch_rewards():
 var core=active()
 if core.p.state in ["dead","respawn"]: return
 var p=Vector2(core.p.x+4,(core.room.h-core.p.y-core.p.h if core.flipped else core.p.y)+5.5)
 for reward in data.get("branchRewards",[]):
  if active_id==reward.room and branch_entered.get(reward.id,false) and abs(p.x-reward.x)<=9 and abs(p.y-reward.y)<=11: claim_branch(reward)

func set_seam(id,closed):
 seam_closed[id]=closed
 for tile in seam_tiles.get(id,[]):
  var value=tile.closed if closed else tile.open
  cells[tile.point]=value
  var index=tile.local.y*int(parsed[id].cols)+tile.local.x
  parsed[id].grid[index]=value
  if cores.has(id): cores[id].room.grid[index]=value
func update_seams(raw):
 for id in seam_tiles:
  if id!=active_id:
   if seam_closed.get(id,false): set_seam(id,false)
   continue
  var core=active()
  var p=core.p
  var near=abs(p.x-core.room.spawn.x)<=12 and abs(p.y-core.room.spawn.y)<=12
  var ordinary=p.state=="normal" and p.onGround and not raw.get("grab",false) and not raw.get("jump",false) and not raw.get("dash",false)
  var walking_back=false
  if ordinary:
   for tile in seam_tiles[id]:
    var left=tile.local.x==0 and raw.get("l",false)
    var right=tile.local.x==int(core.room.cols)-1 and raw.get("r",false)
    if (left or right) and abs(tile.local.x*8+4-p.x-4)<72: walking_back=true
  if walking_back:
   if seam_closed.get(id,false): set_seam(id,false)
   continue
  if seam_closed.get(id,false) or not near or p.state!="normal" or not p.onGround: continue
  var clear=true
  for tile in seam_tiles[id]:
   if tile.closed!=0 and core.overlap(p,core.rect(tile.local.x*8,tile.local.y*8,8,8)): clear=false
  if clear: set_seam(id,true)
func watch_room(id):
 if not seam_tiles.has(id): return parsed[id]
 var def=parsed[id].def.duplicate(true)
 for tile in def.seam:
  var row=def.map[int(tile[1])]
  row[int(tile[0])]=tile[2]
  def.map[int(tile[1])]=row
 return Loader.parse(def)
