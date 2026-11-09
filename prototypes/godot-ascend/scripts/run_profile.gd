extends RefCounted
## Persistent rewards, unlocks and local records; active worlds use a separate atomic resume file.
const VERSION=1
const ROUTE_VERSION="sampler-3"
const PLANTS=["Outskirts Trumpet","Black Woods Oak","Causeway Ivy"]
const CORES=["Trumpet Sprite","Oak Wisp","Clockwork Seed"]
var path="user://bladefall-garden.json"
var plants={}
var records={}
var discovered={"1":{}}
var completed={}
var hearts={}
var story_seen={}
var last_world=1
var run={}
var last_result={}
var save_error=""
func _init(save_path="user://bladefall-garden.json"):
 path=save_path
 load_profile()
func load_profile():
 if not FileAccess.file_exists(path): return
 var value=JSON.parse_string(FileAccess.get_file_as_string(path))
 if not value is Dictionary or value.get("version",0)!=VERSION: return
 plants=value.get("plants",{}) if value.get("plants") is Dictionary else {}
 records=value.get("records",{}) if value.get("records") is Dictionary else {}
 discovered=value.get("discovered",{"1":{}})
 story_seen=value.get("story_seen",{}) if value.get("story_seen") is Dictionary else {}
 hearts=value.get("hearts",{}) if value.get("hearts") is Dictionary else {}
 completed=value.get("completed",{})
 last_world=int(value.get("last_world",1))
 if not discovered is Dictionary: discovered={"1":{}}
 if not completed is Dictionary: completed={}
 # Older profiles already prove these worlds were completed.
 for key in records:
  for entry in records[key]:
   var n=int(entry.get("chapter",0))
   if n in [1,2,3,21,22,23,101,102,103]:
    completed[str(n)]=true
    if n in [1,2,3] and entry.get("deaths",1)==0: garden(n).root_shiny=true
    if not discovered.has(str(n)): discovered[str(n)]={}
 for chapter in [1,2,3]:
  if completed.get(str(chapter),false): garden(chapter).root=true
func save_profile():
 var file=FileAccess.open(path+".tmp",FileAccess.WRITE)
 if file==null:
  save_error="Cannot save Garden: "+error_string(FileAccess.get_open_error())
  return false
 file.store_string(JSON.stringify({"version":VERSION,"plants":plants,"records":records,"discovered":discovered,"completed":completed,"last_world":last_world,"hearts":hearts,"story_seen":story_seen}))
 file.close()
 var error=DirAccess.rename_absolute(ProjectSettings.globalize_path(path+".tmp"),ProjectSettings.globalize_path(path))
 save_error="" if error==OK else "Cannot save Garden: "+error_string(error)
 return error==OK
static func home(chapter):
 return chapter-100 if chapter>=101 else chapter-20 if chapter>=21 else chapter
func garden(number):
 var key=str(number)
 if not plants.has(key): plants[key]={}
 for field in ["root","top","core","root_shiny","flower_shiny","core_shiny"]:
  if not plants[key].has(field): plants[key][field]=false
 return plants[key]
func core_open(number):
 var item=garden(number)
 return all_bases_clear() and item.root and item.top
func can_carry(chapter):
 var number=home(chapter)
 if number not in [1,2,3]: return false
 return garden(number).core if chapter>=101 else core_open(number) if chapter>=21 else false
func start(chapter,eligible=true,carrying=false):
 run={"chapter":chapter,"frames":0,"deaths":0,"eligible":eligible and home(chapter) in [1,2,3],"carrying":carrying and can_carry(chapter),"finished":false,"visited":{},"cleared":{}}
 last_result={}
func invalidate():
 if not run.is_empty():
  run.eligible=false
  run.carrying=false
func tick(room,death_delta=0):
 if run.is_empty() or run.finished: return
 run.frames+=1
 run.deaths+=maxi(0,death_delta)
 run.visited[room]=true
func mark_clear(room):
 if not run.is_empty(): run.cleared[room]=true
func finish(required=[]):
 if run.is_empty() or run.finished or not run.eligible: return {}
 for room in required:
  if not run.visited.has(room) and not run.cleared.has(room): return {}
 var first_clear=not completed.get(str(run.chapter),false)
 completed[str(run.chapter)]=true
 run.finished=true
 var n=home(run.chapter)
 var item=garden(n)
 var award=""
 if run.chapter in [1,2,3]:
  item.root=true
  award="Flower root earned"
  if run.deaths==0:
   item.root_shiny=true
   award="Shiny flower root earned"
  if run.chapter<3 and not discovered.has(str(run.chapter+1)): discovered[str(run.chapter+1)]={}
  if all_bases_clear():
   for chapter in [21,22,23]:
    if not discovered.has(str(chapter)): discovered[str(chapter)]={}

 elif run.chapter in [21,22,23]:
  item.top=true
  award="Flower crown earned"
  if run.carrying and run.deaths==0:
   item.flower_shiny=true
   award="Shiny "+PLANTS[n-1]
 elif run.chapter in [101,102,103]:
  item.core=true
  award=CORES[n-1]+" earned"
  if run.carrying and run.deaths==0:
   item.core_shiny=true
   award="Shiny "+CORES[n-1]
 var mode="shiny" if run.carrying else "normal"
 var key="%s:%d:%s"%[ROUTE_VERSION,run.chapter,mode]
 var entry={"frames":run.frames,"deaths":run.deaths,"date":Time.get_datetime_string_from_system(),"chapter":run.chapter,"mode":mode}
 var board=records.get(key,[])
 board.append(entry)
 board.sort_custom(func(a,b):return a.frames<b.frames if a.frames!=b.frames else a.deaths<b.deaths)
 if board.size()>20: board.resize(20)
 records[key]=board
 if run.chapter in [1,2,3] and run.deaths==0:
  var shiny_key="%s:%d:shiny"%[ROUTE_VERSION,run.chapter]
  var perfect=entry.duplicate(true);perfect.mode="shiny"
  var perfect_board=records.get(shiny_key,[]);perfect_board.append(perfect)
  perfect_board.sort_custom(func(a,b):return a.frames<b.frames)
  if perfect_board.size()>20: perfect_board.resize(20)
  records[shiny_key]=perfect_board
 last_result=entry.duplicate(true)
 last_result.first_clear=first_clear
 last_result.award=award
 last_result.saved=save_profile()
 return last_result
func board(chapter,mode="normal"):
 return records.get("%s:%d:%s"%[ROUTE_VERSION,chapter,mode],[])
static func duration(frames):
 var cs=int(frames*100/60)
 return "%02d:%02d.%02d"%[cs/6000,(cs/100)%60,cs%100]

func all_bases_clear(): return completed.get("1",false) and completed.get("2",false) and completed.get("3",false)
func has_world(chapter):
 if chapter in [21,22,23]: return all_bases_clear()
 if chapter in [101,102,103]: return core_open(chapter-100) and discovered.has(str(chapter))
 if chapter in [2,3]: return completed.get(str(chapter-1),false) or discovered.has(str(chapter))
 return discovered.has(str(chapter))
func has_room(chapter,room): return discovered.get(str(chapter),{}).has(room)
func discover(chapter,room,remember=true):
 if chapter not in [1,2,3,21,22,23,101,102,103]: return false
 var key=str(chapter)
 if not discovered.has(key): discovered[key]={}
 var fresh=not discovered[key].has(room)
 var moved=remember and last_world!=chapter
 discovered[key][room]=true
 if remember: last_world=chapter
 if fresh or moved: save_profile()
 return fresh
func available(chapter):
 if chapter in [21,22,23]: return all_bases_clear()
 if chapter in [101,102,103]: return core_open(chapter-100)
 if has_world(chapter): return true
 if chapter in [2,3]: return completed.get(str(chapter-1),false)
 if chapter in [21,22,23]: return completed.get(str(chapter-20),false)
 if chapter in [101,102,103]: return core_open(chapter-100)
 return chapter==1

func collect_hearts(world):
 var chapter=int(world.data.world.n)
 var key=str(chapter)
 if not hearts.has(key): hearts[key]={}
 var before=hearts[key].size()
 for id in world.branch_hearts: hearts[key]["branch:"+str(id)]=true
 for id in world.secret_hearts: hearts[key]["secret:"+str(id)]=true
 if world.quest_complete: hearts[key]["quest"]=true
 if hearts[key].size()!=before: save_profile()
func heart_count(chapter=0):
 if chapter!=0: return hearts.get(str(chapter),{}).size()
 var count=0
 for earned in hearts.values(): count+=earned.size()
 return count
