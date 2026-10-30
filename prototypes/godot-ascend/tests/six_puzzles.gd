extends SceneTree
## Ordinary clears, observable dependencies and local timing ranges; no uniqueness claim.
const R=preload("res://tests/workshop_routes.gd")
const Core=preload("res://scripts/core.gd")
const Loader=preload("res://scripts/room_loader.gd")
const Pickups=preload("res://scripts/workshop_pickups.gd")
var failed=false
var data
func check(ok,label):
 print("PASS " if ok else "FAIL ",label);failed=failed or not ok
func tape(i):return data.world.rooms[i].workshopRoutes[0].tape
func replay(i,parts):
 var c=Core.new(data.constants.duplicate(true),data.playerDefaults)
 c.load_room(Loader.parse(data.world.rooms[i]))
 for part in parts:
  for f in range(int(part[0])):c.step(R.decode(part[1]))
 return c
func entity(c,type):return c.ents.filter(func(e):return e.type==type)[0]
func _initialize():
 var args=OS.get_cmdline_user_args()
 data=JSON.parse_string(FileAccess.get_file_as_string(args[0] if not args.is_empty() else "res://data/world4.json"))
 for i in range(24,30):
  var room=data.world.rooms[i];var q=R.play(data,i,tape(i))
  check(room.dashes==1 and not "dash" in room.lock and q.finish and q.deaths==0 and not q.advanced,"ordinary deathless clear: "+room.name)
 var delivered=replay(24,tape(24).slice(0,24))
 check(entity(delivered,"plate").down and not entity(delivered,"held").solid and delivered.p.x>170 and delivered.p.carrying==null,"distant resting load holds the gate after the second ascent")
 for i in [24,26]:
  check(not R.play(data,i,tape(i),"no_lantern").finish,"canonical gate finish loses its remote weight: "+str(i+1))
 check(not R.play(data,24,tape(24),"static").finish,"parked cargo lift cannot execute the two ascents")
 var lower=replay(25,tape(25).slice(0,11))
 check(Pickups.counts(lower.ents)==[2,2] and lower.p.onGround and entity(lower,"zip").state=="hold","both visible shards are collected before boarding the low lift")
 for i in [25,29]:
  check(not R.play(data,i,tape(i),"no_y_boost").finish,"canonical return launch needs upward movement: "+str(i+1))
  check(not R.play(data,i,tape(i),"static").finish,"idle lift cannot execute the route: "+str(i+1))
 var road=replay(26,tape(26).slice(0,8))
 check(road.phase==1 and road.p.carrying!=null and road.p.x<100,"blue road carries the lantern through the missing amber trunk")
 var home=replay(26,tape(26))
 check(home.phase==0 and entity(home,"plate").down,"final dash restores amber while the delivered load remains on the plate")
 var wrong=tape(26).duplicate(true);wrong[2][1]="r"
 check(not R.play(data,26,wrong).finish,"unprepared carrying phase does not complete the recorded journey")
 var rise=replay(27,tape(27).slice(0,5));var blue=replay(27,tape(27).slice(0,6))
 check(rise.phase==0 and rise.p.y<152 and blue.phase==1 and blue.p.y<120,"pod preserves amber through the cap before the late dash restores blue")
 check(not R.play(data,27,tape(27),"no_pods").finish,"canonical midair landing needs the pod loft")
 var early=tape(27).duplicate(true);early[4][0]=10
 check(not R.play(data,27,early).finish,"early restoration catches the rise under the cap")
 var occupied=tape(27).duplicate(true);occupied[4][0]=15
 var occupied_proof=R.play(data,27,occupied)
 check(occupied_proof.finish and occupied_proof.deaths==0,"occupied-root protection admits an earlier valid phase plan")
 var moved=replay(28,tape(28).slice(0,2));var recovered=replay(28,tape(28).slice(0,9))
 check(entity(moved,"slide").x==232 and entity(recovered,"slide").x==232 and recovered.p.onGround and recovered.p.dashes==1,"moved ceiling becomes the far dash recovery")
 check(not R.play(data,28,tape(28),"fixed_stone").finish,"stationary stone cannot replace its distant recovery")
 check(not R.play(data,28,tape(28),"no_load").finish,"unloaded spring does not reach the relocated stone")
 var low=replay(29,tape(29).slice(0,11))
 check(Pickups.counts(low.ents)==[1,1] and entity(low,"zip").state=="hold","first recoil prepares the lower lift and shard excursion")
 check(not R.play(data,29,tape(29),"no_load").finish,"first recoil is needed by the demonstrated high-lift transfer")
 check(not R.play(data,29,tape(29),"park_high").finish,"leaving the lift below removes the final return launch")
 for pair in [[24,4,12],[25,11,8],[26,11,12],[27,4,12],[28,4,12],[28,5,6],[29,11,12],[29,3,12]]:
  var window=R.timing_window(data,pair[0],pair[1],8)
  check(window.size()>=pair[2],"nearby input timings clear room "+str(pair[0]+1)+" segment "+str(pair[1])+": "+str(window))
 print("SIX PUZZLES ","FAILED" if failed else "PASSED");quit(1 if failed else 0)
