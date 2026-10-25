extends SceneTree
const World=preload("res://scripts/world.gd")
var w
func check(ok,message):
 if not ok: push_error(message);quit(1);return false
 print("PASS ",message)
 return true
func fixture(stage,x,y):
 w.stage=stage
 w.p.x=x;w.p.y=y;w.p.vx=0.0;w.p.vy=0.0
 w.p.onGround=true;w.p.jumps=0;w.p.invuln=0.0
 w.prev={}
func frames(n,raw={}):
 for i in range(n): w.step(raw)
func _initialize():
 w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json")))
 if not check(w.regions.size()==2 and w.regions[0].obstacles.size()==143 and w.regions[1].obstacles.size()==97,"both authored regions and all 240 objects exist before entry"): return
 if not check(w.regions[0].enemies.size()==7 and w.regions[1].enemies.size()==6,"all authored opening encounters are preloaded"): return
 fixture(1,3640,40)
 frames(1,{"pickup":true})
 if not check(not w.weapon,"the Oathblade cannot be taken while the roots hold it"): return
 fixture(1,3425,205)
 frames(1)
 var weight=w.objects().filter(func(o):return o.get("oathbladeCounterweight",false))[0]
 if not check(weight.released and not w.region().pickups[0].ritualLocked,"standing on the real counterweight releases the original weapon"): return
 fixture(1,3640,40)
 frames(1,{"pickup":true})
 if not check(w.weapon and w.p.weapon.name=="Recovered Oathblade","C takes and equips the actual Oathblade pickup"): return
 fixture(1,4600,55)
 w.p.onGround=false
 frames(1,{"interact":true,"attack":true})
 if not check(w.p.vy< -570 and not w.p.jumpCutOk and w.p.jumps==0,"an upward strike on a resin pod gives its authored 600-unit launch"): return
 frames(1,{})
 if not check(w.p.vy< -540,"releasing Jump does not cut a device launch"): return
 fixture(0,1950,0)
 frames(1,{"interact":true})
 if not check(w.mara_asked,"Mara starts her survey through the normal interaction input"): return
 for point in [Vector2(2340,0),Vector2(6000,175),Vector2(11370,0)]:
  fixture(0,point.x,point.y)
  frames(36)
 if not check(w.bearings.size()==3 and not w.chart,"the three actual vanes align and await Mara's handover"): return
 fixture(0,1950,0)
 frames(1,{"interact":true})
 if not check(w.chart and w.events.any(func(e):return e.get("voice","")=="outskirts/mara.done"),"Mara hands over the chart with her existing completed recording"): return
 fixture(1,700,0)
 frames(1,{"interact":true})
 if not check(w.elsie==1,"Elsie's original quest starts through interaction"): return
 for point in w.PERCHES:
  fixture(1,point.x,point.y)
  frames(65)
 fixture(1,5320,0)
 frames(65)
 if not check(w.elsie==2 and w.lantern_held,"following every authored perch catches the lantern"): return
 w.p.invuln=0
 w.hurt(w.p.x-40)
 if not check(not w.lantern_held and w.lantern==Vector2(5320,0) and w.elsie==2,"taking a hit sends the lantern back to the moths without deleting quest progress"): return
 fixture(1,5320,0);frames(1)
 fixture(1,820,0);frames(1)
 if not check(w.elsie==3 and not w.lantern_held,"bringing the lantern home advances to Hale's log"): return
 fixture(1,2290,0)
 for i in range(3):
  frames(1,{"attack":true})
  frames(26)
 if not check(w.log_hits==3 and w.elsie==4 and "return to Elsie" in w.quest_cue,"three distinct blade swings split the log and give a durable return cue"): return
 fixture(1,700,0);frames(1,{"interact":true})
 if not check(w.elsie==5 and w.events.any(func(e):return e.get("voice","")=="woods/refuge.ending"),"Elsie finishes with her existing recording and unlocks moth flight"): return
 frames(1);frames(1,{"interact":true})
 if not check(not w.ride.is_empty(),"the earned moth flight is a real ride rather than a teleport"): return
 frames(451)
 if not check(w.ride.is_empty() and abs(w.p.x-11530)<5,"moth flight lands at the far end of the authored forest road"): return
 w.checkpoint={"stage":1,"x":210.0,"y":0.0}
 fixture(1,700,0);frames(1,{"interact":true});frames(30)
 w.retry()
 if not check(w.ride.is_empty() and w.p.x==210 and w.elsie==5,"retry interrupts a shortcut flight and preserves the earned reward"): return
 fixture(0,250,0);frames(1,{"interact":true})
 if not check(w.rowan==1,"Rowan offers the existing bell quest"): return
 fixture(0,920,0)
 frames(70,{"right":true})
 var cart=w.objects().filter(func(o):return o.type=="crate")[0]
 if not check(cart.x>1000,"normal horizontal collision pushes Rowan's actual stone cart"): return
 var target=1050-cart.x
 frames(int(abs(target)/110*60),{"right":target>0,"left":target<0})
 fixture(0,1050,0);frames(1,{"interact":true})
 if not check(w.rowan==2,"the brake locks only when the cart reaches the iron stop"): return
 fixture(0,1370,282);frames(1,{"interact":true})
 if not check(w.rowan==3 and w.bell_held,"releasing the tower bell starts the physical carry step"): return
 fixture(0,360,0);frames(1,{"interact":true})
 fixture(0,250,0);frames(1,{"interact":true})
 if not check(w.rowan==5,"hanging the bell and returning to Rowan unlocks the drake"): return
 w.checkpoint={"stage":1,"x":210.0,"y":0.0}
 w.die();frames(50)
 if not check(w.weapon and w.chart and w.elsie==5 and w.rowan==5 and w.stage==1 and not w.p.dead,"native death and retry preserve equipment, both quests, and Mara's chart"): return
 frames(60,{"left":true})
 if not check(w.stage==0,"normal leftward movement returns through the forest tunnel to the Outskirts"): return
 frames(80,{"right":true})
 if not check(w.stage==1 and w.regions[1].pickups[0].taken and w.weapon,"the same tunnel leads back with the preloaded world and equipment state intact"): return
 w.restart()
 if not check(not w.weapon and not w.chart and w.bearings.is_empty() and w.elsie==0 and w.rowan==0 and w.deaths==0 and w.p.x==70,"full journey restart clears progress and restores the initial unarmed state"): return
 quit()
