extends SceneTree
const World=preload("res://scripts/world.gd")
const Save=preload("res://scripts/felix_save.gd")
const Run=preload("res://scripts/sampler_run.gd")
const Stories=[preload("res://scripts/felix_story.gd"),preload("res://scripts/woods_story.gd"),preload("res://scripts/phantom_story.gd")]
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize(): run.call_deferred()
func run():
 Save.directory="user://felix-save-qa-%d"%OS.get_process_id()
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(Save.directory))
 for n in [1,2,3]:
  var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
  var world=World.new(source)
  var story=Stories[n-1].new(world)
  var tracker=Run.new(Save.directory.path_join("felix-garden.json"))
  tracker.start(world)
  check(Save.write_payload(Save.capture(world,story,tracker)),"chapter %d opening saved"%n)
  var restored_world=World.new(source)
  var restored_story=Stories[n-1].new(restored_world)
  var restored_run=Run.new(Save.directory.path_join("felix-garden.json"))
  check(Save.restore(restored_world,restored_story,restored_run),"chapter %d opening resumes"%n)
  check(restored_story.phase=="black" and restored_story.gifts==story.gifts,"opening retains initial gifts")
  restored_world.shutdown()
  story.skip_prologue()
  preload("res://scripts/felix_dialogue.gd").append(story.lines,"first line","above",2.0)
  preload("res://scripts/felix_dialogue.gd").append(story.lines,"next line","below",3.0)
  var id=world.data.world.campaignWorkshop.rooms[0]
  world.enter(id,true)
  world.campaign_completed[id]=true
  story.photos.append(id)
  tracker.profile.mark_clear(id)
  world.open_road_exit(id,true)
  if n==3:
   story.in_car=false
   story.in_drive=true
   story.man.lead=false
   story.man.visible=false
  check(Save.write_payload(Save.capture(world,story,tracker)),"chapter %d mid-reveal story snapshot"%n)
  var before=FileAccess.get_file_as_bytes(Save.path(n))
  check(preload("res://scripts/save_transfer.gd").valid_story(before,n),"portable story envelope validates")
  tracker.profile.save_profile()
  var bundle=preload("res://scripts/save_transfer.gd").export_bundle(Save.directory)
  var destination=Save.directory+"-import"
  DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(destination))
  check(preload("res://scripts/save_transfer.gd").import_bundle(bundle,destination)=="","portable Felix bundle imports")
  check(FileAccess.get_file_as_bytes(destination.path_join("felix-story-%d.save"%n))==before,"portable story bytes round trip")
  for name in DirAccess.get_files_at(destination): DirAccess.remove_absolute(ProjectSettings.globalize_path(destination.path_join(name)))
  DirAccess.remove_absolute(ProjectSettings.globalize_path(destination))
  story.freeze=100
  check(Save.capture(world,story,tracker).is_empty(),"timed dialogue keeps prior stable checkpoint")
  check(before==FileAccess.get_file_as_bytes(Save.path(n)),"timed scene does not overwrite safe story state")
  story.freeze=0
  restored_world=World.new(source)
  restored_story=Stories[n-1].new(restored_world)
  restored_run=Run.new(Save.directory.path_join("felix-garden.json"))
  check(Save.restore(restored_world,restored_story,restored_run),"chapter %d completed room resumes"%n)
  check(restored_world.active_id==id and restored_world.checkpoint_id==id,"individual checkpoint round trip")
  check(restored_story.lines==story.lines,"queued narration survives save and resume")
  check(restored_story.gifts==story.gifts and restored_story.photos==story.photos and restored_story.done==story.done,"story gifts, rewards and beat guards round trip")
  check(restored_world.road_opened.has(id) and restored_world.road_opening.is_empty(),"earned passage settles open on resume")
  check(restored_run.profile.run.cleared.has(id),"completion record survives")
  restored_world.retry()
  restored_world.step({})
  check(restored_world.road_opened.has(id) and restored_story.photos.count(id)==1,"retry preserves earned passage without duplicate photo")
  if n==3: check(not restored_story.in_car and not restored_story.man.visible,"drive visibility state survives relaunch")
  var payload=Save.read(n)
  payload.signature="wrong-content"
  Save.write_payload(payload)
  check(not Save.restore(restored_world,restored_story,restored_run),"different content cannot overwrite the live game")
  restored_world.shutdown()
  world.shutdown()
  DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.path(n)))
 for name in DirAccess.get_files_at(Save.directory): DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.directory.path_join(name)))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.directory))
 print("STORY SAVE FAILURES ",failures)
 quit(1 if failures else 0)
