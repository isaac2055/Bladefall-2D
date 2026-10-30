extends SceneTree
## Physical witnesses and local counterfactuals; these do not establish route uniqueness.
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Devices=preload("res://scripts/causeway_devices.gd")
var failed=false
var data
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func replay(index,tape):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults)
 c.load_room(Loader.parse(data.world.rooms[index]))
 for part in tape:
  for tick in range(int(part[0])):c.step(R.decode(part[1]))
 return c
func entity(c,type,label=""):
 return c.ents.filter(func(e):return e.type==type and (label=="" or e.get("label","")==label))[0]
func _initialize():
 var args=OS.get_cmdline_user_args()
 data=JSON.parse_string(FileAccess.get_file_as_string(args[0] if not args.is_empty() else "res://data/world4.json"))
 var counts={"outskirts":0,"woods":0,"causeway":0}
 for room in data.world.rooms:counts[room.get("workshopBiome","outskirts")]+=1
 check(counts=={"outskirts":10,"woods":10,"causeway":10},"30 rooms, ten per biome")
 for i in range(19,24):
  var room=data.world.rooms[i]
  check(room.dashes==1 and not "dash" in room.lock,"normal dash: "+room.name)
  for route in room.workshopRoutes:
   var proof=R.play(data,i,route.tape)
   check(proof.finish and proof.deaths==0 and not proof.advanced,"ordinary deathless route: "+route.name)
 var root=data.world.rooms[19].workshopRoutes[0].tape
 var wrong_root=root.slice(0,4).duplicate(true);wrong_root[0][1]=""
 var overshot=replay(19,wrong_root)
 check(entity(overshot,"slide").x>200,"wrong starting phase sends the stone past its useful dock")
 var stopped=replay(19,root.slice(0,4))
 check(entity(stopped,"slide").x==168 and stopped.phase==0,"amber root stops the stone at its intermediate dock")
 var opened=replay(19,root.slice(0,12))
 check(entity(opened,"slide").x==168 and opened.phase==1,"upper bell opens the root without moving the parked stone")
 check(not R.play(data,19,root,"no_pods").finish,"canonical Root route loses its finish without the preserving loft")
 check(R.play(data,19,data.world.rooms[19].workshopRoutes[1].tape,"no_pods").finish,"restoring and climbing the root provides a distinct pod-free phase plan")
 var routes=data.world.rooms[20].workshopRoutes
 check(routes.size()==2,"Canopy supplies two demonstrations")
 check(replay(20,routes[0].tape.slice(0,5)).phase==0 and replay(20,routes[1].tape.slice(0,5)).phase==1,"Canopy approaches arrive in different phases")
 var ferry=data.world.rooms[21].workshopRoutes[0].tape
 check(not R.play(data,21,ferry,"no_x_boost").finish,"canonical ferry return depends on inherited horizontal movement")
 check(not R.play(data,21,ferry,"static").finish,"canonical ferry route does not work with the ferry parked at home")
 var catches=0
 for delta in [-18,-12,-6,0,6,12,18]:
  var varied=ferry.duplicate(true);varied[19][0]+=delta;varied[20][0]-=delta
  var proof=R.play(data,21,varied)
  if proof.finish and proof.deaths==0:catches+=1
 check(catches>=5,"ferry catch allows varied approach timing with an adjusted wait: "+str(catches)+"/7")
 var weight=data.world.rooms[22].workshopRoutes[0].tape
 var initial_weight=replay(22,[])
 var arm=entity(initial_weight,"hingeArm")
 check(Devices.obstruction(initial_weight,arm,Devices.pose(arm,"right"))=="solid","unloaded first plate blocks the carrying bridge")
 var transfer=replay(22,weight.slice(0,19))
 check(transfer.p.carrying!=null and entity(transfer,"recoilPlatform","First").jammed and entity(transfer,"hingeArm").dir=="right","retrieved lantern leaves the first plate safely held by the arm")
 var loaded=replay(22,weight.slice(0,37))
 check(entity(loaded,"recoilPlatform","Second").charge==24 and entity(loaded,"recoilPlatform","Second").loadedBy=="lantern","same lantern fully loads the second plate")
 check(Devices.obstruction(transfer,entity(transfer,"hingeArm"),Devices.pose(entity(transfer,"hingeArm"),"down"))=="solid" and Devices.obstruction(loaded,entity(loaded,"hingeArm"),Devices.pose(entity(loaded,"hingeArm"),"down"))==null,"second load clears the previously blocked down pose")
 var freed=replay(22,weight.slice(0,50))
 check(entity(freed,"hingeArm").dir=="down" and entity(freed,"recoilPlatform","First").charge==0,"turning down releases the first plate completely")
 check(not R.play(data,22,weight,"no_load").finish,"canonical finish needs the final player-loaded recoil")
 for delay in [5,45,90]:
  var varied=weight.duplicate(true);varied[18][0]=delay
  var proof=R.play(data,22,varied)
  check(proof.finish and proof.deaths==0,"jammed plate safely waits for the lantern transfer: "+str(delay)+" frames")
 var dock=data.world.rooms[23].workshopRoutes[0].tape
 var initial_dock=replay(23,[])
 check(Devices.obstruction(initial_dock,entity(initial_dock,"hingeArm","A"),Devices.pose(entity(initial_dock,"hingeArm","A"),"right"))=="solid","initial stone blocks A's bridge")
 check(entity(initial_dock,"hingeArm","B").dir=="down" and Devices.obstruction(initial_dock,entity(initial_dock,"hingeArm","B"),Devices.pose(entity(initial_dock,"hingeArm","B"),"right"))=="rock","B begins as the stop and its unused right pose meets visible housing")
 var near=replay(23,dock.slice(0,24)+[[16,"rj"],[20,""],[1,"urs"],[25,""]])
 check(entity(near,"hingeArm","B").dir=="down" and entity(near,"hingeArm","B").jamReason=="knight","near-side slot physically rejects B's next pose")
 var temporary=replay(23,dock.slice(0,4))
 check(entity(temporary,"slide").x==176 and entity(temporary,"hingeArm","B").dir=="down","first shove parks at the temporary dock")
 var return_bridge=replay(23,dock.slice(0,30))
 check(entity(return_bridge,"hingeArm","B").dir=="left" and entity(return_bridge,"slide").x==176,"B becomes the return bridge before the second shove")
 var upright=replay(23,dock.slice(0,68))
 check(entity(upright,"hingeArm","B").dir=="up" and entity(upright,"slide").x==312,"second far-service visit turns B upright after relocating the stone")
 check(Devices.obstruction(upright,entity(upright,"hingeArm","B"),Devices.pose(entity(upright,"hingeArm","B"),"right"))=="rock","upright B cannot cycle back into a substitute bridge")
 var onward=replay(23,dock.slice(0,43))
 check(entity(onward,"slide").x==312,"second shove reaches the permanent dock")
 print("FIVE PUZZLES ","FAILED" if failed else "PASSED")
 quit(1 if failed else 0)
