extends SceneTree
func _initialize(): call_deferred("run")
func run():
 var Main=load("res://scripts/felix_main.gd")
 Main.chapter=2
 var game=load("res://felix.tscn").instantiate()
 root.add_child(game)
 await process_frame
 game.story.skip_prologue()
 game.begin_play()
 game.set_paused(true)
 game.chapter_music.settings_path="user://felix_chapter_merge_qa.cfg"
 var texts=[]
 var volume=null
 for child in game.pause_box.get_child(0).get_children():
  if child is Button and not child is OptionButton: texts.append(child.text)
  if child is HSlider: volume=child
 assert(texts==["Keep climbing","Begin the chapter again","Chapter One","Quit"],"Both chapter controls must survive")
 assert(game.music_picker.item_count==3,"Three music choices must survive")
 assert(volume!=null,"Volume control must survive")
 volume.value=35
 assert(is_equal_approx(game.chapter_music.gain,.35),"Volume slider must update score gain")
 game.music_picker.select(2)
 game.music_picker.item_selected.emit(2)
 var selected=game.audio.music.stream
 await create_timer(.2).timeout
 var time=game.audio.music.get_playback_position()
 game.go_to("story-walk-0")
 assert(game.audio.music.stream==selected,"A story cut must keep the selected score")
 assert(abs(game.audio.music.get_playback_position()-time)<.15,"A story cut must keep the listening position")
 assert(not game.audio.music.stream_paused,"Music auditions while paused")
 game.cover.color.a=0
 for i in range(3): await process_frame
 RenderingServer.force_draw(false)
 root.get_texture().get_image().save_png("res://shots/ch2-merged-menu.png")
 DirAccess.remove_absolute(ProjectSettings.globalize_path(game.chapter_music.settings_path))
 print("GOAL CROOKED ",game.world.parsed["workshop-crooked"].def.workshopGoal)
 print("MERGED MENU PASS: music picker, volume, chapter buttons, and score across cuts")
 game.queue_free()
 await process_frame
 quit()
