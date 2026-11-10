extends SceneTree
## Run with the normal audio driver; Godot headless can retain stopped Ogg playback at exit.

const Game=preload("res://felix.tscn")
const Save=preload("res://scripts/felix_save.gd")
var failures=0

func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1

func _initialize(): run.call_deferred()

func run():
 Save.directory="user://felix-recovery-qa-%d"%OS.get_process_id()
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(Save.directory))
 # A valid envelope from a different layout is rejected before restoring cores.
 var payload={"format":"felix-checkpoint","chapter":1,"signature":"obsolete-layout","story":{"phase":"play"}}
 check(Save.write_payload(payload),"write incompatible checkpoint fixture")
 var original=FileAccess.get_file_as_bytes(Save.path(1))

 var game=Game.instantiate()
 game.play_on_ready=true
 root.add_child(game)
 game.set_physics_process(false)
 await process_frame
 var backups=Array(DirAccess.get_files_at(Save.directory)).filter(func(name): return name.begins_with("felix-story-1.save.recovery-"))
 check(backups.size()==1,"launch moves the rejected checkpoint out of the active slot")
 if backups.size()==1:
  check(FileAccess.get_file_as_bytes(Save.directory.path_join(backups[0]))==original,"recovery copy preserves every original byte")
 check(Save.read(1).get("signature")==game.world.content_signature,"fresh checkpoint uses the current layout")
 check(not game.recovery_notice.is_empty(),"recovery status is visible to the player")

 game.story.skip_prologue()
 game.paused=false
 var before=game.world.frames
 game.notification(Node.NOTIFICATION_APPLICATION_FOCUS_OUT)
 game._physics_process(1.0/60.0)
 check(game.paused and game.pause_box.visible and game.world.frames==before,"focus loss pauses simulation and shows Resume")
 game.set_paused(false)
 game.notification(Node.NOTIFICATION_APPLICATION_PAUSED)
 game._physics_process(1.0/60.0)
 check(game.paused and game.world.frames==before,"application backgrounding also pauses simulation")
 game.queue_free()
 await process_frame
 for name in DirAccess.get_files_at(Save.directory):
  DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.directory.path_join(name)))
 DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.directory))
 quit(1 if failures else 0)
