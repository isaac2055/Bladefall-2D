extends SceneTree

const Game=preload("res://main.tscn")
const Run=preload("res://scripts/sampler_run.gd")
const Save=preload("res://scripts/world_save.gd")
var failures=0

func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1

func _initialize(): run.call_deferred()

func run():
 var folder="user://bladefall-recovery-qa-%d"%OS.get_process_id()
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(folder))
 var game=Game.instantiate()
 game.sampler=Run.new(folder.path_join("profile.json"))
 game.preferences_path=folder.path_join("settings.cfg")
 root.add_child(game)
 game.set_physics_process(false)
 check(game.chapters.keys()==[1],"normal title constructs only the first route")
 var first_world=game.world.get_instance_id()
 game.title_screen.hide()
 game.root_ui.show()
 game.game_started=false
 var target=Save.path(game.sampler.profile,1)
 var original="This checkpoint is corrupt.".to_utf8_buffer()
 var file=FileAccess.open(target,FileAccess.WRITE)
 file.store_buffer(original)
 file.close()
 check(not game.resume_world(1),"corrupt checkpoint rejected during Continue")
 var backups=Array(DirAccess.get_files_at(folder)).filter(func(name): return name.begins_with("profile.json.world-1.save.recovery-"))
 check(backups.size()==1,"Continue archives the old file before restarting")
 if backups.size()==1:
  check(FileAccess.get_file_as_bytes(folder.path_join(backups[0]))==original,"recovery copy preserves every original byte")
 check(not Save.read(game.sampler.profile,1,game.world.content_signature).is_empty(),"fallback creates a valid new checkpoint")
 game.notification(Node.NOTIFICATION_APPLICATION_PAUSED)
 check(game.paused,"backgrounding activates the pause menu")
 game.sampler.profile.completed["1"]=true
 game.travel_to_world(2)
 check(game.chapter_number==2 and game.chapters.size()==2,"unlock and travel create only the selected route")
 check(game.chapters[2].container.get_index()<game.root_ui.get_index(),"new viewport stays behind the menus")
 game.switch_chapter(1)
 check(game.world.get_instance_id()==first_world,"switching routes retains the already visited world")
 game.free()
 await process_frame
 for name in DirAccess.get_files_at(folder):
  DirAccess.remove_absolute(ProjectSettings.globalize_path(folder.path_join(name)))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(folder))
 quit(1 if failures else 0)
