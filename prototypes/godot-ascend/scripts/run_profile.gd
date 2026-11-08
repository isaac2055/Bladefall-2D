extends RefCounted
## Persistent rewards and local records. Run state is deliberately never checkpoint-saved.
const VERSION=1
const ROUTE_VERSION="sampler-1"
const PLANTS=["Outskirts Trumpet","Black Woods Oak","Causeway Ivy"]
const CORES=["Trumpet Sprite","Oak Wisp","Clockwork Seed"]
var path="user://bladefall-garden.json"
var plants={}
var records={}
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
func save_profile():
 var file=FileAccess.open(path+".tmp",FileAccess.WRITE)
 if file==null:
  save_error="Cannot save Garden: "+error_string(FileAccess.get_open_error())
  return false
 file.store_string(JSON.stringify({"version":VERSION,"plants":plants,"records":records}))
 file.close()
 var error=DirAccess.rename_absolute(ProjectSettings.globalize_path(path+".tmp"),ProjectSettings.globalize_path(path))
 save_error="" if error==OK else "Cannot save Garden: "+error_string(error)
 return error==OK
static func home(chapter):
 return chapter-100 if chapter>=101 else chapter-20 if chapter>=21 else chapter
func garden(number):
 var key=str(number)
 if not plants.has(key): plants[key]={"root":false,"top":false,"core":false,"flower_shiny":false,"core_shiny":false}
 return plants[key]
func core_open(number):
 var item=garden(number)
 return item.root and item.top
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
 run.finished=true
 var n=home(run.chapter)
 var item=garden(n)
 var award=""
 if run.chapter in [1,2,3] and run.deaths==0:
  item.root=true
  award="Flower root earned"
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
 last_result=entry.duplicate(true)
 last_result.award=award
 last_result.saved=save_profile()
 return last_result
func board(chapter,mode="normal"):
 return records.get("%s:%d:%s"%[ROUTE_VERSION,chapter,mode],[])
static func duration(frames):
 var cs=int(frames*100/60)
 return "%02d:%02d.%02d"%[cs/6000,(cs/100)%60,cs%100]
