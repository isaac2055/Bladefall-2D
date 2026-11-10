extends RefCounted
## Stable story boundaries plus complete object-free world state. Timed scenes replay from the
## most recent stable point, so a save never loses the remaining Callable-based dialogue cues.
const WorldSave=preload("res://scripts/world_save.gd")
const VERSION=1
static var directory="user://"
static func path(chapter): return directory.path_join("felix-story-%d.save"%chapter)
static func exists(chapter): return FileAccess.file_exists(path(chapter))
static func stable(story):
 return story.freeze==0 and story.ride==null and (story.get("cut")==null or story.cut=="")
static func capture(world,story,run,audio=null):
 if not stable(story): return {}
 var payload=WorldSave.capture(world,run,audio)
 payload.format="felix-checkpoint"
 payload.version=VERSION
 payload.story={}
 for property in story.get_property_list():
  if not (property.usage&PROPERTY_USAGE_SCRIPT_VARIABLE): continue
  var field=property.name
  if field in ["world_ref","cue","ride"]: continue
  payload.story[field]=story.get(field)
 return payload
static func write_payload(payload):
 if payload.is_empty(): return false
 var target=path(int(payload.chapter))
 var bytes=var_to_bytes(payload)
 var file=FileAccess.open(target+".tmp",FileAccess.WRITE)
 if file==null: return false
 file.store_var({"format":"felix-checkpoint","version":VERSION,"sha256":WorldSave.digest(bytes),"bytes":bytes})
 file.close()
 return DirAccess.rename_absolute(ProjectSettings.globalize_path(target+".tmp"),ProjectSettings.globalize_path(target))==OK
static func read(chapter):
 var file=FileAccess.open(path(chapter),FileAccess.READ)
 if file==null or file.get_length()>32*1024*1024: return {}
 var wrapper=file.get_var(false)
 if not wrapper is Dictionary or wrapper.get("format")!="felix-checkpoint" or wrapper.get("version")!=VERSION: return {}
 if not wrapper.get("bytes") is PackedByteArray or WorldSave.digest(wrapper.bytes)!=wrapper.get("sha256"): return {}
 var payload=bytes_to_var(wrapper.bytes)
 if not payload is Dictionary or payload.get("format")!="felix-checkpoint" or payload.get("chapter")!=chapter: return {}
 return payload
static func restore(world,story,run,audio=null):
 var payload=read(int(world.data.world.n))
 if payload.is_empty() or payload.get("signature")!=world.content_signature: return false
 if not payload.get("world",{}).has("active_id") or not world.cores.has(payload.world.active_id): return false
 # Validate before mutating the live world. Native scenes provide the permitted room set.
 if not payload.get("cores") is Dictionary or not payload.get("story") is Dictionary: return false
 for id in payload.cores:
  if not world.cores.has(id) or not payload.cores[id].get("ents") is Array: return false
 world.restart()
 for field in WorldSave.WORLD_FIELDS:
  if payload.world.has(field): world.set(field,payload.world[field])
 for id in payload.cores:
  var core=world.cores[id]
  var state=payload.cores[id]
  core.ents=state.ents
  for i in range(core.ents.size()): core.ents[i]=WorldSave.unlinks(core.ents[i],core.ents)
  for field in state:
   if field!="ents": core.set(field,WorldSave.unlinks(state[field],core.ents))
  core.world_context=world
  core.world_origin=world.placements[id]
  if not core.flipped:
   core.room=world.parsed[id]
   core.upright_room=core.room
 for property in story.get_property_list():
  if not (property.usage&PROPERTY_USAGE_SCRIPT_VARIABLE): continue
  var field=property.name
  if field not in ["world_ref","cue","ride"] and payload.story.has(field): story.set(field,payload.story[field])
 story.cue=[]
 story.ride=null
 run.profile.run=payload.run
 for field in WorldSave.RUN_FIELDS:
  if payload.ride.has(field): run.set(field,payload.ride[field])
 for id in world.campaign_completed: world.open_road_exit(id)
 for id in world.seam_closed: world.set_seam(id,world.seam_closed[id])
 world.road_opening.clear()
 world.invalidate_road_terrain()
 if audio!=null:
  audio.heard=payload.audio.get("heard",{}).duplicate(true)
  audio.voice_queue.clear()
  audio.speech.stop()
 return true
