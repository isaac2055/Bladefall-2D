extends RefCounted
## Atomic, checked, object-free world snapshots. Shiny challenges never resume checkpoints.
const WORLD_FIELDS=["active_id","checkpoint_id","frames","cells","parsed","progress","bearings","campaign_completed","mara_complete","mara_registered","silas_met","silas_step","quest_key","quest_striking","governor_flash","elsie_met","elsie_perch","quest_lantern","quest_complete","quest_award_frame","quest_deaths","seam_closed","branch_hearts","branch_entered","portal_rooms","portal_cells","secret_hearts","secret_front_entry","award_color","restore_count","notices","sampler_practice","road_entered"]
const RUN_FIELDS=["ride","last_deaths","pickup_origin","pickup_left","pickup_drop","failure_frames","drop_origin","award_age"]
static func path(profile,chapter): return profile.path+".world-%d.save"%chapter
static func exists(profile,chapter): return FileAccess.file_exists(path(profile,chapter))
static func clear(profile,chapter):
 var file=path(profile,chapter)
 if FileAccess.file_exists(file): DirAccess.remove_absolute(ProjectSettings.globalize_path(file))
static func links(value,entities,root=false):
 if value is Dictionary:
  if not root and value.has("id") and value.has("type"):
   for i in range(entities.size()):
    if is_same(value,entities[i]): return {"__bf_entity":i}
  var out={}
  for key in value: out[key]=links(value[key],entities)
  return out
 if value is Array:
  var out=[]
  for item in value: out.append(links(item,entities))
  return out
 return value
static func unlinks(value,entities):
 if value is Dictionary:
  if value.size()==1 and value.has("__bf_entity"):
   var index=int(value.__bf_entity)
   return entities[index] if index>=0 and index<entities.size() else null
  for key in value: value[key]=unlinks(value[key],entities)
 elif value is Array:
  for i in range(value.size()): value[i]=unlinks(value[i],entities)
 return value
static func capture(world,sampler,audio=null):
 var out={"chapter":int(world.data.world.n),"signature":world.content_signature,"world":{},"cores":{},"run":sampler.profile.run.duplicate(true),"ride":{},"audio":{}}
 if sampler.carrying() or sampler.failure_frames>0:
  out.challenge=true
  return out
 for field in WORLD_FIELDS:
  var value=world.get(field)
  if value!=null: out.world[field]=value
 for id in world.cores:
  var core=world.cores[id]
  var state={}
  for property in core.get_property_list():
   var field=property.name
   if not (property.usage&PROPERTY_USAGE_SCRIPT_VARIABLE) or field in ["K","defaults","world_context"]: continue
   if field in ["room","upright_room"] and not core.flipped: continue
   if field=="ents":
    state.ents=[]
    for entity in core.ents: state.ents.append(links(entity,core.ents,true))
   else: state[field]=links(core.get(field),core.ents)
  out.cores[id]=state
 for field in RUN_FIELDS: out.ride[field]=sampler.get(field)
 if audio!=null: out.audio={"heard":audio.heard.duplicate(true)}
 return out
static func write(world,sampler,audio=null):
 var run=sampler.profile.run
 if run.is_empty() or not run.eligible: return false
 var chapter=int(world.data.world.n)
 if run.finished:
  clear(sampler.profile,chapter)
  return true
 var payload=capture(world,sampler,audio)
 var bytes=var_to_bytes(payload)
 var target=path(sampler.profile,chapter)
 var file=FileAccess.open(target+".tmp",FileAccess.WRITE)
 if file==null: return false
 file.store_line("BLADEFALL SAVE 1")
 file.store_pascal_string(world.content_signature)
 file.store_pascal_string(digest(bytes))
 file.store_64(bytes.size())
 file.store_buffer(bytes)
 file.close()
 return DirAccess.rename_absolute(ProjectSettings.globalize_path(target+".tmp"),ProjectSettings.globalize_path(target))==OK
static func read(profile,chapter,signature):
 var target=path(profile,chapter)
 if not FileAccess.file_exists(target): return {}
 var file=FileAccess.open(target,FileAccess.READ)
 if file==null or file.get_length()<32 or file.get_length()>268435456: return {}
 if file.get_line()!="BLADEFALL SAVE 1" or file.get_pascal_string()!=signature: return {}
 var digest=file.get_pascal_string()
 var size=file.get_64()
 if size<1 or size!=file.get_length()-file.get_position(): return {}
 var bytes=file.get_buffer(size)
 if digest(bytes)!=digest: return {}
 var data=bytes_to_var(bytes)
 return data if data is Dictionary and data.get("chapter",0)==chapter else {}
static func restore(world,sampler,audio=null):
 var data=read(sampler.profile,int(world.data.world.n),world.content_signature)
 if data.is_empty() and world.legacy_content_signature!="": data=read(sampler.profile,int(world.data.world.n),world.legacy_content_signature)
 if data.is_empty() and world.transport_legacy_signature!="": data=read(sampler.profile,int(world.data.world.n),world.transport_legacy_signature)
 if data.is_empty() and world.transport_legacy_bonus_signature!="": data=read(sampler.profile,int(world.data.world.n),world.transport_legacy_bonus_signature)
 if data.is_empty(): return false
 var migrated=data.get("signature","")!=world.content_signature
 world.restart()
 if data.get("challenge",false):
  sampler.start(world,true,false)
  clear(sampler.profile,int(world.data.world.n))
  return true
 if not data.get("world",{}).has("active_id") or not world.cores.has(data.world.active_id): return false
 for field in WORLD_FIELDS:
  if data.world.has(field) and not (migrated and field in ["cells","parsed"]): world.set(field,data.world[field])
 for id in data.cores:
  if not world.cores.has(id): continue
  var core=world.cores[id]
  var state=data.cores[id]
  core.ents=state.ents
  for i in range(core.ents.size()): core.ents[i]=unlinks(core.ents[i],core.ents)
  for field in state:
   if field!="ents": core.set(field,unlinks(state[field],core.ents))
  core.world_context=world
  core.world_origin=world.placements[id]
  if not core.flipped:
   core.room=world.parsed[id]
   core.upright_room=core.room
 sampler.profile.run=data.run
 for field in RUN_FIELDS:
  if data.ride.has(field): sampler.set(field,data.ride[field])
 if migrated:
  for id in world.data.world.get("campaignWorkshop",{}).get("rooms",[]):
   if data.run.visited.has(id) or id==world.active_id: world.close_road_entrance(id)
  if world.active_id in world.data.world.get("retiredSamplerRooms",[]):
   var deaths=world.active().deaths
   world.active().load_room(world.parsed[world.active_id])
   world.enter(world.active_id,true)
   world.active().deaths=deaths
   sampler.last_deaths=deaths
 # Older active saves may still target the removed intermediate gallery stop.
 var targets=world.data.world.get("campaignWorkshop",{}).get("walkTargets",{})
 if not sampler.ride.is_empty() and targets.has(sampler.ride.target):
  var point=sampler.ride_point()
  sampler.begin_ride(world,targets[sampler.ride.target],point)
 if migrated and world.active_id in targets and sampler.ride.is_empty(): world.enter(targets[world.active_id],true)
 if world.data.world.get("campaignWorkshop",{}).get("geometry",false) and not sampler.ride.is_empty():
  var target=sampler.ride.target
  target=targets.get(target,target)
  sampler.ride={}
  if world.cores.has(target):
   var deaths=world.active().deaths
   world.enter(target,true)
   world.active().deaths=deaths
   sampler.last_deaths=deaths
 for id in world.campaign_completed: world.open_road_exit(id)
 for id in sampler.profile.run.get("cleared",{}): world.open_road_exit(id)
 for id in world.seam_closed: world.set_seam(id,world.seam_closed[id])
 sampler.result={}
 if audio!=null:
  audio.heard=data.audio.get("heard",{}).duplicate(true)
  audio.voice_queue.clear()
  audio.speech.stop()
 return true

static func digest(bytes):
 var hash=HashingContext.new()
 hash.start(HashingContext.HASH_SHA256)
 hash.update(bytes)
 return hash.finish().hex_encode()
