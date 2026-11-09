extends SceneTree
const World=preload("res://scripts/world.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
const Inputs=preload("res://tests/workshop_routes.gd")
var failed=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failed+=1
func _initialize(): run.call_deferred()
func run():
 # Reconstruct the actual previous layout, not a new save merely labelled with an old hash.
 var script=preload("res://tests/fixtures/previous_transport_world.gd")
 var path="user://connected-save-%d.json"%OS.get_process_id()
 for n in [1,2,3,23]:
  var raw=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
  var old=script.new(raw)
  var fresh=World.new(raw)
  var a=Run.new(path);var b=Run.new(path)
  var route=old.data.world.campaignWorkshop
  check(old.content_signature==fresh.transport_legacy_signature,"legacy layout fingerprint matches previous release: "+str(n))
  old.enter(route.rooms[0],true);a.start(old)
  for f in range(40): old.step(Inputs.decode(""));a.tick(old)
  old.active().deaths=3;a.last_deaths=3;a.profile.run.deaths=3
  var state=Save.digest(var_to_bytes([old.active().p,old.active().ents,old.active().frame]))
  var frames=a.profile.run.frames
  check(Save.write(old,a) and Save.restore(fresh,b),"previous puzzle snapshot migrates: "+str(n))
  check(state==Save.digest(var_to_bytes([fresh.active().p,fresh.active().ents,fresh.active().frame])) and fresh.active().world_origin==fresh.placements[fresh.active_id],"puzzle position, inventory and machinery survive relocation")
  check(b.profile.run.frames==frames and b.profile.run.deaths==3 and b.profile.run.eligible and b.result.is_empty(),"migration preserves run clock/deaths/eligibility and grants no reward")
  check(fresh.road_entered.has(fresh.active_id),"resumed puzzle retains its original closed approach")
  if n==1:
   check(old.legacy_content_signature==fresh.transport_legacy_bonus_signature,"pre-bonus Outskirts layout remains compatible")
   var current=old.content_signature
   old.content_signature=old.legacy_content_signature
   check(Save.write(old,a) and Save.restore(fresh,b),"pre-bonus Outskirts puzzle save migrates")
   old.content_signature=current
  for target in [route.walks[1],route.rooms[1]]:
   a.begin_ride(old,target)
   for f in range(30): a.tick(old)
   frames=a.profile.run.frames
   check(Save.write(old,a) and Save.restore(fresh,b),"previous in-flight snapshot migrates")
   check(b.ride.is_empty() and fresh.active_id==route.rooms[1] and fresh.checkpoint_id==route.rooms[1] and fresh.active().deaths==3 and b.profile.run.frames==frames,"old ride docks once at its intended individual checkpoint")
  old.enter(route.walks[0],true);a.ride={};a.start(old)
  check(Save.write(old,a) and Save.restore(fresh,b) and fresh.active_id==route.rooms[0],"old gallery save enters the corresponding puzzle on foot")
  if n==23:
   old.enter("cl23-puzzle-cover-take-away",true);a.start(old);old.active().deaths=2
   check(Save.write(old,a) and Save.restore(fresh,b) and fresh.active().room.name=="The Freight Bypass" and fresh.active().deaths==2 and fresh.active().combat.is_empty(),"retired-cover save becomes a safe bypass without resurrecting its old machinery")
  # New saves keep route openings across resume and close them on a fresh run.
  fresh.enter(route.rooms[0],true);b.start(fresh)
  fresh.campaign_completed[route.rooms[0]]=true;fresh.open_road_exit(route.rooms[0])
  check(Save.write(fresh,b) and Save.restore(fresh,b) and fresh.road_opened.has(route.rooms[0]),"new save retains a completed service passage")
  fresh.restart()
  check(fresh.road_opened.is_empty() and fresh.campaign_completed.is_empty(),"new run restores original puzzle exits")
  old.shutdown();fresh.shutdown();Save.clear(a.profile,n)
 DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
 print("CONNECTED SAVES FAILURES ",failed)
 quit(1 if failed else 0)
