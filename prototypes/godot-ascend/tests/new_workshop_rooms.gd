extends SceneTree
const R=preload("res://tests/workshop_routes.gd")
const Search=preload("res://tests/workshop_search.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const Codec=preload("res://authoring/codec.gd")
var checks=[]
var searches={}
var failed=false
func _initialize():run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 checks.append({"passed":bool(ok),"label":label});failed=failed or not ok
func route(data,index,variant=0,mode=""):
 return R.play(data,index,data.world.rooms[index].workshopRoutes[variant].tape,mode)
func run():
 var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var data=Authoring.read(source)
 var fixture=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/new-workshop-regressions.json"))
 for i in range(6):check(Codec.first_difference(data.world.rooms[i],fixture.existingRooms[i])=="","existing workshop room preserved: "+fixture.existingRooms[i].name)
 for i in [6,7]:
  for variant in range(data.world.rooms[i].workshopRoutes.size()):
   var p=route(data,i,variant)
   check(p.finish and p.deaths==0 and not p.advanced,"ordinary deathless route: "+data.world.rooms[i].workshopRoutes[variant].name)
 var upper=route(data,6);var lower=route(data,6,1);var gallery=route(data,7)
 check(not upper.refills.is_empty() and lower.refills.is_empty(),"Tower routes use different resource plans")
 check(upper.contacts.any(func(c):return c.origin==[320,224] and c.state=="go"),"Tower high route leaves the rising weight")
 check(lower.contacts.any(func(c):return c.origin==[320,224] and c.state=="back" and c.dash==0),"Tower low route catches the returning weight with no dash")
 for config in [[0,"no_refill",false],[1,"no_refill",true],[0,"no_y_boost",false],[1,"no_y_boost",true],[0,"park_high",true],[1,"park_high",false],[0,"static",false],[1,"static",false]]:
  check(route(data,6,config[0],config[1]).finish==config[2],"Tower route %d / %s"%[config[0]+1,config[1]])
 check(gallery.shard and gallery.crumbles.any(func(e):return e.state=="shaking") and gallery.crumbles.any(func(e):return e.state=="broken"),"Gallery visits and collapses its outward foothold")
 check(gallery.landings.any(func(e):return e[2]==133) and gallery.contacts.any(func(c):return c.state=="back" and c.dash==0),"Gallery restores on the cap, then catches the returning ferry without a dash")
 for mode in ["permanent_crumble","static","park:ferry","no_return_dash"]:
  check(not route(data,7,0,mode).finish,"Gallery dependency: "+mode)
 var former=data.duplicate(true);former.world.rooms[6]=fixture.formerTower
 check(R.play(former,6,fixture.staticTowerSkip,"static").finish,"positive control replays the search-discovered stationary Tower shortcut")
 check(not R.play(data,6,fixture.staticTowerSkip,"static").finish,"revised Tower blocks that exact stationary shortcut")
 var third=data.duplicate(true);third.world.rooms[6]=fixture.formerTowerThird
 check(R.play(third,6,fixture.staticTowerThirdSkip,"static").finish,"positive control replays the third stationary shortcut")
 check(not R.play(data,6,fixture.staticTowerThirdSkip,"static").finish,"tall parked weight and housing block the third shortcut")
 var second=data.duplicate(true);second.world.rooms[6]=fixture.formerTowerSecond
 check(R.play(second,6,fixture.staticTowerSecondSkip,"static").finish,"positive control replays the second search-discovered stationary shortcut")
 check(not R.play(data,6,fixture.staticTowerSecondSkip,"static").finish,"raised finish blocks the second stationary shortcut")
 for pair in [[6,0,5],[6,1,8],[7,0,9]]:
  var d=data.duplicate(true);d.world.rooms[pair[0]].workshopRoutes[0]=data.world.rooms[pair[0]].workshopRoutes[pair[1]]
  var window=R.timing_window(d,pair[0],pair[2])
  check(window.size()>=3,"nearby successful timings: room %d route %d %s"%[pair[0],pair[1],str(window)])
 # These searches choose fresh inputs after a reachable pickup state or from spawn.
 # A failed search is explicitly bounded; the successful control tests search capability.
 var prefix=data.world.rooms[7].workshopRoutes[0].tape.slice(0,10)
 searches.gallery_return=Search.solve(data,7,{"start":prefix,"budget":20000,"width":120})
 check(searches.gallery_return.found,"independent search finds a new ordinary Gallery return")
 if searches.gallery_return.found:
  var p=R.play(data,7,searches.gallery_return.tape)
  check(p.finish and not p.advanced,"independently found return replays through the unmodified physics")
 searches.permanent_gallery=Search.solve(data,7,{"start":prefix,"mode":"permanent_crumble","budget":20000,"width":120})
 check(not searches.permanent_gallery.found,"no permanent-cap recovery found within 20,000 search branches")
 searches.static_tower=Search.solve(data,6,{"mode":"static","budget":20000,"width":100})
 check(not searches.static_tower.found,"no stationary Tower clear found within 20,000 search branches")
 searches.static_gallery=Search.solve(data,7,{"mode":"static","budget":12000,"width":80})
 check(not searches.static_gallery.found,"no stationary Gallery clear found within 12,000 search branches")
 var app=preload("res://main.tscn").instantiate();app.test_mode=true;app.initial_world=4
 root.add_child(app);await process_frame;app.set_physics_process(false)
 for i in [6,7]:
  app.watch=false;app.load_section(i);app.workshop_demo_picker.select(1);app.toggle_watch()
  var deaths=app.sim.deaths
  for f in range(app.tape.size()):app._physics_process(1.0/60.0)
  check(app.workshop_goal_reached() and app.sim.deaths==deaths,"actual game plays the second demonstration: "+app.sim.room.name)
  app.toggle_watch()
 var output=OS.get_cmdline_user_args()
 if not output.is_empty():
  var file=FileAccess.open(output[0],FileAccess.WRITE);file.store_string(JSON.stringify({"checks":checks,"searches":searches},"  "))
 print("NEW WORKSHOP ROOMS ","FAILED" if failed else "PASSED"," · ",checks.size()," checks")
 await app.close_app(1 if failed else 0)
