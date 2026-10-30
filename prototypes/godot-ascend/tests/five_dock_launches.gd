extends SceneTree
## Sweep normal jumps and all eight dash directions from the far service ledge.
const S=preload("res://tests/woods_search.gd")
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
func sweep(data,definition,prefix):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults);c.load_room(Loader.parse(definition))
 for part in prefix:
  for tick in range(int(part[0])):c.step(R.decode(part[1]))
 if c.deaths>0 or not c.p.onGround:return {"found":false,"cases":0,"error":"launch prefix did not reach a live standing state"}
 var state=S.snapshot(c);var count=0
 for walk in [6,10,14,18,22,26]:
  for jump in [12,18,24,30,36,42]:
   for dash in ["rxg","lxg","uxg","dxg","ruxg","luxg","rdxg","ldxg"]:
    S.restore(c,state);count+=1
    var invalid=false
    var tape=[[walk,"rg"],[jump,"rjg"],[12,dash],[18,"rjg"],[24,"rgu"],[20,""]]
    for part in tape:
     for tick in range(int(part[0])):
      c.step(R.decode(part[1]))
      if c.deaths>0 or c.ents.any(func(e):return e.type=="slide" and e.x!=176) or ["super","hyper","ultra","wallbounce"].any(func(e):return e in c.events):invalid=true;break
      if R.at_goal(c):return {"found":true,"cases":count,"tape":prefix+tape}
     if invalid:break
 return {"found":false,"cases":count}
func _initialize():
 var d=JSON.parse_string(FileAccess.get_file_as_string("res://data/world4.json"))
 var fixtures=JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/five-puzzle-bypasses.json"))
 var old=fixtures.filter(func(f):return f.label=="Dock: coyote jump from the outer service edge skips the final dock")[0]
 var prefix=d.world.rooms[23].workshopRoutes[0].tape.slice(0,28)
 var control=sweep(d,old.room,old.tape.slice(0,27));var revised=sweep(d,d.world.rooms[23],prefix)
 var ok=control.found and not revised.found and not revised.has("error")
 print("PASS " if ok else "FAIL ","far-service launch sweep · former shortcut=",control.found," revised shortcut=",revised.found," cases=",revised.cases)
 var top=fixtures.filter(func(f):return f.label=="Dock: coyote jump from upright B skips the final dock")[0]
 var top_prefix=d.world.rooms[23].workshopRoutes[0].tape.slice(0,30)+[[1,"uls"],[25,""],[140,"lgu"],[12,"ljg"],[8,"r"],[25,""]]
 var top_control=sweep(d,top.room,top.tape.slice(0,31));var top_revised=sweep(d,d.world.rooms[23],top_prefix)
 var top_ok=top_control.found and not top_revised.found and not top_revised.has("error");ok=ok and top_ok
 print("PASS " if top_ok else "FAIL ","upright-arm launch sweep · former shortcut=",top_control.found," revised shortcut=",top_revised.found," cases=",top_revised.cases)
 var args=OS.get_cmdline_user_args()
 if not args.is_empty():FileAccess.open(args[0],FileAccess.WRITE).store_string(JSON.stringify({"control":control,"revised":revised,"top_control":top_control,"top_revised":top_revised},"  "))
 quit(0 if ok else 1)
