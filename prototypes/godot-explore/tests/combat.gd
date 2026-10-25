extends SceneTree
const World=preload("res://scripts/world.gd")
var w
func check(ok,message):
 if not ok: push_error(message);quit(1);return false
 print("PASS ",message)
 return true
func frames(n,raw={}):
 for i in range(n): w.step(raw)
func fixture(x,y):
 w.p.x=x;w.p.y=y;w.p.vx=0.0;w.p.vy=0.0;w.p.onGround=true;w.p.invuln=100.0
 w.prev={}
func _initialize():
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 w.enter(1,210,0)
 var guard=w.region().enemies.filter(func(e):return e.forestRole=="root-guard")[0]
 fixture(guard.x-50,guard.y)
 for i in range(100):
  frames(1)
  if guard.mode=="wind": break
 if not check(guard.mode=="wind" and guard.frontShield,"root guard visibly commits to a shielded wind-up before striking"): return
 w.weapon=true
 w.p.face=1
 var hp=guard.hp
 frames(1,{"attack":true})
 if not check(guard.hp==hp and w.events.any(func(e):return e.kind=="clang"),"a strike into the facing shield is blocked"): return
 w.p.x=guard.x+45;w.p.face=-1;w.p.atkCd=0;w.p.swingT=0;w.prev={}
 frames(1,{"attack":true})
 if not check(guard.hp==hp-11,"a flank strike damages the same guard"): return
 var seed=w.region().enemies.filter(func(e):return e.forestRole=="tunnel-controller")[0]
 fixture(seed.x-80,0)
 for i in range(120):
  frames(1)
  if not w.region().hazards.is_empty(): break
 if not check(not w.region().hazards.is_empty(),"the tunnel controller warns and then attacks the floor"): return
 for h in w.region().hazards:
  var floor=w.floor_at(h.x,10)
  if not check(floor.id>=0 and h.y==floor.y and h.y<=10,"root attacks sit on actual ground rather than hanging in the air"): return
 fixture(5420,325)
 var controller=w.region().enemies.filter(func(e):return e.forestRole=="canopy-controller")[0]
 for i in range(150):
  frames(1)
  if not w.region().projectiles.is_empty(): break
 if not check(w.region().projectiles.any(func(s):return s.spore),"a target in the canopy gets a real drifting spore projectile"): return
 var diver=w.region().enemies.filter(func(e):return e.forestRole=="canopy-diver")[0]
 fixture(diver.homeX-80,185)
 var marked=false
 var attacked=false
 var returned=false
 for i in range(250):
  frames(1)
  if diver.mode=="dive-mark": marked=true
  if diver.mode=="dive": attacked=true
  if diver.mode=="rise" and attacked: returned=true;break
 if not check(marked and attacked and returned,"the canopy diver marks, commits, then recovers toward its perch"): return
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 var patrol=w.region().enemies[0]
 fixture(patrol.x,patrol.y)
 w.p.invuln=0
 frames(1)
 if not check(w.p.blood==4,"an unarmed knight takes the original patrol contact damage"): return
 w.p.y=patrol.y+patrol.h+2
 w.p.vy=0
 w.p.onGround=false
 w.p.invuln=0
 frames(1)
 if not check(w.p.blood==4,"a jump above the patrol's body safely avoids contact"): return
 print("PASS distinct forest encounters, contact avoidance, shield flanking, grounded roots and projectile threats")
 quit()
