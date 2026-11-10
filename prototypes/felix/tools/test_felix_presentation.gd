extends SceneTree
## Live integration checks for the naming beat and in-menu soundtrack auditioning.
## godot --path . --script tools/test_felix_presentation.gd
var failures=[]
func check(condition,message):
 if not condition:
  failures.append(message)
  push_error(message)
func _initialize(): call_deferred("run")
func run():
 var fake_world={"data":{"world":{"campaignWorkshop":{"rooms":[]}}},"placements":{},"cores":{}}
 var story=preload("res://scripts/felix_story.gd").new(fake_world)
 story.begin_ending(fake_world,{"deaths":0})
 for i in range(80):story.tick_ending(1.0/60)
 check(story.lines[0].text=="I think I'll name you...","Naming lead-in must appear before Felix's name")
 check(not story.gifts.face,"Felix must still be faceless during the naming lead-in")
 for i in range(170):story.tick_ending(1.0/60)
 check(story.lines[0].text=="...Felix.","The name must follow the lead-in")
 check(not story.gifts.face,"The smile must arrive after his name")
 for i in range(110):story.tick_ending(1.0/60)
 check(story.gifts.face,"Felix receives his face after being named")
 for i in range(250):story.tick_ending(1.0/60)
 check(story.phase=="end","Ending still completes after the additional line")
 print("NAMING SEQUENCE checked")
 var game=load("res://felix.tscn").instantiate()
 game.developer_mode=true
 root.add_child(game)
 await process_frame
 game.story.skip_prologue()
 game.begin_play()
 game.cover.color.a=0
 game.set_paused(true)
 game.chapter_music.settings_path="user://felix_music_qa.cfg"
 var clock_before=game.story.clock
 var frame_before=game.sim.frame
 await create_timer(.2).timeout
 check(game.story.clock==clock_before and game.sim.frame==frame_before,"Menu must pause both story and movement")
 check(not game.audio.music.stream_paused,"Music must remain audible while auditioning in the menu")
 check(game.audio.ambience.stream_paused,"Other audio must retain normal pause behavior")
 root.get_texture().get_image().save_png("res://shots/music-menu.png")
 var available=0
 for i in range(game.chapter_music.tracks.size()):
  if not game.chapter_music.available(i):continue
  available+=1
  game.music_picker.select(i)
  game.music_picker.item_selected.emit(i)
  await create_timer(.15).timeout
  check(game.chapter_music.selected==i,"Menu selects the requested track")
  check(game.audio.music.playing and not game.audio.music.stream_paused,"New track starts while menu is paused")
  check(game.audio.music.stream.loop,"Each selected stream must loop")
  check(abs(game.audio.music.stream.get_length()-240)<.1,"Each score must be four minutes")
  check(game.music_description.text==game.chapter_music.tracks[i].description,"Menu description follows track selection")
  game.audio.music.seek(239.9)
  await create_timer(.45).timeout
  check(game.audio.music.playing and game.audio.music.get_playback_position()<2,"Playback crosses the loop boundary without stopping")
  check(game.music_picker.selected==i,"Menu visibly selects the requested track")
  await process_frame
  RenderingServer.force_draw(false)
  root.get_texture().get_image().save_png("res://shots/music-menu-%d.png"%(i+1))
  print("MUSIC TRACK ",i+1," menu, length and live loop checked")
 if available==3:
  game.chapter_music.set_gain(.35)
  var remembered=preload("res://scripts/felix_music.gd").new()
  remembered.settings_path=game.chapter_music.settings_path
  remembered.setup(game.audio.music)
  check(remembered.selected==2 and is_equal_approx(remembered.gain,.35),"Track choice and volume survive restart")
 else:
  print("PENDING: ",3-available," soundtrack assets have not been generated yet")
 game.chapter_music.set_gain(0)
 check(game.chapter_music.volume_db(-10,true)==-80,"Volume slider can silence music")
 game.set_paused(false)
 var resumed=game.story.clock
 await create_timer(.1).timeout
 check(game.story.clock>resumed,"Keep climbing resumes the story")
 DirAccess.remove_absolute(ProjectSettings.globalize_path(game.chapter_music.settings_path))
 game.queue_free()
 await process_frame
 print("PRESENTATION CHECKS: ","PASS" if failures.is_empty() else "FAIL", " (",available,"/3 music tracks present)")
 quit(0 if failures.is_empty() else 1)
