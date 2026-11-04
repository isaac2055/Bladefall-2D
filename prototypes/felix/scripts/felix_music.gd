extends RefCounted
## Chapter One's score selector. Shared audio.gd still owns SFX and story ducking.
const PLAYLIST_PATH="res://audio/music/tracks.json"
const SETTINGS_PATH="user://felix_music.cfg"
var tracks=[]
var player: AudioStreamPlayer
var selected=-1
var settings_path=SETTINGS_PATH
var gain=1.0

func setup(music_player):
 player=music_player
 tracks=JSON.parse_string(FileAccess.get_file_as_string(PLAYLIST_PATH)).tracks
 var saved=ConfigFile.new()
 var preferred=0
 if saved.load(settings_path)==OK:
  preferred=int(saved.get_value("music","track",0))
  gain=clampf(float(saved.get_value("music","volume",1.0)),0,1)
 if available(preferred): select_track(preferred,false)
 else:
  for i in range(tracks.size()):
   if available(i):
    select_track(i,false)
    break

func available(index):
 return index>=0 and index<tracks.size() and ResourceLoader.exists(tracks[index].path)

func select_track(index,save=true):
 if not available(index): return false
 if index==selected: return true
 var stream=load(tracks[index].path).duplicate()
 if stream is AudioStreamOggVorbis or stream is AudioStreamMP3:
  stream.loop=true
 else: return false
 player.stream=stream
 player.play()
 selected=index
 if save: save_settings()
 return true

func set_gain(value):
 gain=clampf(value,0,1)
 save_settings()

func volume_db(story_db,auditioning=false):
 if gain<=0: return -80.0
 return (-10.0 if auditioning else story_db)+linear_to_db(gain)

func save_settings():
 var settings=ConfigFile.new()
 settings.set_value("music","track",selected)
 settings.set_value("music","volume",gain)
 settings.save(settings_path)
