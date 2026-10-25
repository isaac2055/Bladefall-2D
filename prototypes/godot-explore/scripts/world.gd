extends RefCounted
## Explore uses authored world units and height above ground, not Ascend's tile solver.
const DT=1.0/60.0
const Combat=preload("res://scripts/combat.gd")
var data
var regions=[]
var stage=0
var p={}
var prev={}
var events=[]
var clock=0.0
var deaths=0
var bearings={}
var chart=false
var mara_asked=false
var weapon=false
var mantle=false
var checkpoint={"stage":0,"x":70.0,"y":0.0}
var flags=1
var dead_time=0.0
var rowan=0
var elsie=0
var moth_perch=0
var moth_t=1.0
var moth_from=Vector2.ZERO
var moth=Vector2(1250,0)
var lantern_held=false
var lantern=Vector2(5320,0)
var log_hits=0
var bell_held=false
var quest_cue=""
var quest_time=0.0
var ride={}
var beam=0.0
var bram_follow=false
var bram_done=false
var frame=0
var kill_count=0
const PERCHES=[Vector2(1250,0),Vector2(2000,0),Vector2(2750,0),Vector2(3020,70),Vector2(3640,40),Vector2(4340,0),Vector2(5320,0)]
func _init(source):
 data=source
 restart()
func restart():
 regions=data.stages.duplicate(true)
 for r in regions:
  for i in range(r.obstacles.size()):
   var o=r.obstacles[i]
   o.id=i
   o.gone=bool(o.get("gone",false))
   o.homeX=o.x
   o.homeY=o.get("y",0)
   o.t=0.0
  for e in r.enemies:
   e.mode="patrol"
   e.timer=0.0
   e.alert=0.0
   e.lastHit=-1
   e.dir=e.face
  r.hazards=[]
  r.projectiles=[]
  r.time=0.0
  r.visited=false
 stage=0
 p=data.fresh.duplicate(true)
 p.x=70.0
 p.y=0.0
 p.vx=0.0
 p.vy=0.0
 p.onGround=true
 p.floor=-1
 p.invuln=0.0
 p.swingT=0.0
 p.atkCd=0.0
 p.atkBuf=0.0
 p.jumpBuf=0.0
 p.coyote=0.0
 p.jumpCutOk=false
 p.dead=false
 p.upSwing=false
 p.swingHits={}
 p.blood=5
 prev={}
 events=[]
 clock=0
 deaths=0
 bearings={}
 chart=false
 mara_asked=false
 weapon=false
 mantle=false
 checkpoint={"stage":0,"x":70.0,"y":0.0}
 flags=1
 dead_time=0
 rowan=0
 elsie=0
 moth_perch=0
 moth_t=1.0
 moth=PERCHES[0]
 lantern_held=false
 lantern=Vector2(5320,0)
 log_hits=0
 bell_held=false
 ride={}
 bram_follow=false
 bram_done=false
 quest_time=0
 kill_count=0
 frame=0
 regions[0].visited=true
func region(): return regions[stage]
func objects(): return region().obstacles
func point(): return Vector2(p.x,p.y)
func emit(kind,x=-99999.0,y=-99999.0,extra={}):
 var event={"kind":kind,"x":p.x if x==-99999 else x,"y":p.y if y==-99999 else y}
 event.merge(extra)
 events.append(event)
func cue(text):
 quest_cue=text
 quest_time=5.0
 emit("quest")
func say(name,id): emit("speech",-99999,-99999,{"name":name,"voice":id})
func near(x,y,dx=65,dy=80): return abs(p.x-x)<dx and abs(p.y-y)<dy
func edge(raw,key): return bool(raw.get(key,false)) and not bool(prev.get(key,false))
func top(o,x):
 if o.get("slope",false):
  var t=clamp((x-o.x+o.w/2)/o.w,0.0,1.0)
  return lerp(float(o.slopeY0),float(o.slopeY1),t*t*(3-2*t))
 return float(o.get("y",0))+float(o.get("h",0)) if o.type=="crate" else float(o.get("y",0))
func platform(o):
 if o.gone or o.get("fake",false): return false
 if o.get("requiresWorld","")!="": return false
 return o.type in ["plat","wall","crate"]
func floor_at(x,old_y,body_w=0.0):
 var found={"y":-10000.0,"id":-1}
 for o in objects():
  if not platform(o) or abs(x-o.x)>=o.w/2+body_w/2-2: continue
  var y=top(o,x)
  if y<=old_y+2 and y>found.y: found={"y":y,"id":o.id}
 return found
func retry():
 ride={}
 if lantern_held:
  lantern_held=false
  lantern=Vector2(5320,0)
  cue("The moths take the lantern back")
 if bell_held and rowan==3:
  rowan=2
  cue("The bell is back at the tower")
 bell_held=false
 stage=int(checkpoint.stage)
 p.x=checkpoint.x
 p.y=checkpoint.y
 p.vx=0.0
 p.vy=0.0
 p.dead=false
 p.upSwing=false
 p.swingHits={}
 p.blood=5
 p.invuln=1.0
 p.onGround=false
 p.floor=-1
 p.jumpBuf=0.0
 p.atkBuf=0.0
 p.swingT=0.0
 p.jumps=0
 dead_time=0
 prev={}
 emit("respawn")
func hurt(from_x,wound=1):
 if p.invuln>0 or p.dead: return
 if mantle and p.get("ward",0)>=3:
  p.ward=0
  emit("ward")
  return
 p.blood-=wound
 p.invuln=1.1
 p.vx=170*sign(p.x-from_x)
 p.vy=-150.0
 if lantern_held:
  lantern_held=false
  lantern=Vector2(5320,0)
  cue("The moths take the lantern back")
 emit("hurt")
 if p.blood<=0: die()
func die():
 if p.dead: return
 p.dead=true
 deaths+=1
 dead_time=0.8
 emit("death")
func enter(index,x,y):
 stage=index
 p.x=x
 p.y=y
 p.vx=0.0
 p.vy=0.0
 p.floor=-1
 p.onGround=false
 regions[stage].visited=true
 checkpoint={"stage":stage,"x":x,"y":y}
 flags=max(flags,1)
 emit("region")
func step(raw):
 events=[]
 frame+=1
 clock+=DT
 quest_time=max(0,quest_time-DT)
 for r in regions: r.time+=DT
 if p.dead:
  dead_time-=DT
  if dead_time<=0: retry()
  prev=raw.duplicate()
  return
 if not ride.is_empty():
  p.vx=0.0
  p.vy=0.0
  p.onGround=false
  ride.t+=DT/7.5
  var t=min(1.0,ride.t)
  p.x=lerp(float(ride.start),float(ride.end),t)
  p.y=lerp(float(ride.y0),0.0,t)+sin(t*PI)*500
  if t>=1:
   ride={}
   p.invuln=0.5
   p.onGround=false
   emit("land")
  prev=raw.duplicate()
  return
 for key in ["invuln","swingT","atkCd","atkBuf","jumpBuf"]: p[key]=max(0,float(p.get(key,0))-DT)
 if edge(raw,"dash"): cue("A dash memory is missing")
 if edge(raw,"jump"): p.jumpBuf=0.12
 if edge(raw,"attack"): p.atkBuf=0.16
 var mx=int(bool(raw.get("right",false)))-int(bool(raw.get("left",false)))
 var target=mx*float(data.movement.runSpeed)
 var rate=22.0 if p.onGround else 9.0
 if mx!=0 and sign(mx)!=sign(p.vx) and abs(p.vx)>20: rate=40.0 if p.onGround else 14.0
 elif abs(p.vx)>abs(target)+15: rate=(22.0 if mx==0 else 2.5) if p.onGround else 1.0
 p.vx=lerp(float(p.vx),target,min(1.0,rate*DT))
 if mx!=0: p.face=mx
 if p.onGround:
  p.coyote=0.1
  p.jumps=0
 else:
  p.coyote-=DT
  if p.jumps==0 and p.coyote<=0: p.jumps=1
 if p.jumpBuf>0 and p.jumps<1:
  p.jumpBuf=0.0
  p.vy=-float(data.movement.jumpVelocity)*sqrt(0.9)
  p.jumps+=1
  p.onGround=false
  p.floor=-1
  p.jumpCutOk=true
  emit("jump")
 if not raw.get("jump",false) and p.jumpCutOk and p.vy< -220: p.vy=-220.0
 if p.atkBuf>0 and p.atkCd<=0:
  p.atkBuf=0.0
  if weapon:
   p.atkCd=0.38
   p.swingT=0.22
   p.swingId+=1
   p.upSwing=raw.get("interact",false)
   p.swingHits={}
   emit("swing")
  else: cue("The Oathblade waits in Black Woods")
 if p.swingT>0: strike()
 var old_x=p.x
 p.x=clamp(p.x+p.vx*DT,20.0,float(region().catalog.len)-20)
 for o in objects():
  if o.gone or o.type not in ["wall","crate"]: continue
  var wall_top=top(o,p.x)
  var wall_bottom=wall_top-o.get("h",0)
  if p.y+40<=wall_bottom or p.y+4>=wall_top: continue
  var hw=o.w/2+13
  var dir=sign(p.x-old_x)
  var boundary=o.x-dir*hw
  if dir>0 and old_x<=boundary and p.x>boundary or dir<0 and old_x>=boundary and p.x<boundary:
   if o.type=="crate" and rowan==1:
    var push=sign(p.vx)*min(abs(p.vx),110)*DT
    o.x+=push
    p.x=o.x-dir*hw
    p.vx=clamp(p.vx,-130.0,130.0)
   else:
    p.x=boundary
    p.vx=0.0
 var old_y=p.y
 var was_ground=p.onGround
 var apex=not p.onGround and raw.get("jump",false) and abs(p.vy)<60 and p.jumpCutOk
 p.vy+=1400*DT*(0.55 if apex else 1.0)
 p.y-=p.vy*DT
 p.onGround=false
 p.floor=-1
 if p.vy>=0:
  var support=floor_at(p.x,old_y,p.w)
  if p.y<=support.y and support.id>=0:
   p.y=support.y
   p.vy=0.0
   p.onGround=true
   p.jumps=0
   p.floor=support.id
   if not was_ground: emit("land")
   var o=objects()[support.id]
   if o.get("crumble",false) and o.t==0: o.t=0.45;emit("crumble",o.x,o.y)
 else:
  for o in objects():
   if o.type!="wall" or o.gone: continue
   var ceiling=o.y-o.h
   if abs(p.x-o.x)<o.w/2+11 and old_y+44<=ceiling and p.y+44>=ceiling:
    p.y=ceiling-44
    p.vy=0.0
 for o in objects():
  if o.type=="plat" and o.get("crumble",false) and o.t>0:
   o.t-=DT
   if o.t<=0: o.gone=true;o.t=-3.0
  elif o.get("crumble",false) and o.t<0:
   o.t+=DT
   if o.t>=0: o.t=0.0;o.gone=false
  if o.type=="spikes":
   var up=fposmod(region().time+o.get("phase",0),o.period)<o.upT
   if up and near(o.x,o.get("y",0),o.w/2+10,23): hurt(o.x)
  if o.get("oathbladeCounterweight",false) and not o.get("released",false) and p.onGround and near(o.x,205,52,35):
   o.released=true
   for item in region().pickups:
    if item.get("acquisitionId","")=="black-woods-oathblade": item.ritualLocked=false
   emit("roots",3640,40)
   cue("The roots release the Oathblade · C to take it")
  if o.type=="surveyStake" and not o.get("aligned",false) and near(o.x,o.y,48,50):
   o.t+=DT
   if o.t>=0.55:
    o.aligned=true
    bearings[o.bearingName]=true
    emit("bearing",o.x,o.y)
    cue(o.bearingName+" bearing · "+str(bearings.size())+" / 3"+(" · return to Mara" if bearings.size()==3 else ""))
 var in_blight=false
 for zone in region().authored.get("blight",[]):
  if p.x>zone[0] and p.x<zone[1] and p.y<zone[2]: in_blight=true
 if in_blight:
  p.blightT=float(p.get("blightT",0))+DT
  if p.blightT>=0.8: p.blightT=0.0;hurt(p.x-p.face)
 else: p.blightT=0.0
 if p.y< -180: die()
 if (edge(raw,"interact") and not raw.get("attack",false)) or edge(raw,"command"): interact()
 if edge(raw,"pickup"): pickup()
 if edge(raw,"flag"):
  if flags>0 and p.onGround:
   checkpoint={"stage":stage,"x":p.x,"y":p.y}
   flags-=1
   cue("Checkpoint flag planted")
   emit("flag")
  else: cue("No checkpoint flag available" if flags==0 else "Land before planting a flag")
 if stage==1 and p.x>12140 and p.onGround and not region().get("draft_end",false):
  region().draft_end=true
  cue("The forest road is open · Broken Causeway lies beyond this draft")
 if stage==0 and near(13590,0,38,70) and p.face>0: enter(1,150,0)
 elif stage==1 and p.x<110 and p.face<0: enter(0,13550,0)
 update_enemies()
 if not p.dead: update_stories(raw)
 prev=raw.duplicate()
func pickup():
 for item in region().pickups:
  if item.get("taken",false) or item.get("ritualLocked",false) or not near(item.x,item.y,55,70): continue
  item.taken=true
  if item.has("weapon"):
   weapon=true
   p.weapon=item.weapon.duplicate(true)
   cue("Recovered Oathblade · W to strike")
   emit("weapon",item.x,item.y)
  elif item.has("armor"):
   mantle=true
   p.ward=3
   cue("Mothsilk Mantle · a banked ward")
   emit("ward")
func interact():
 if stage==0:
  if rowan>=5 and near(11020,0,85,70):
   ride={"start":p.x,"end":330.0,"y0":p.y,"t":0.0}
   p.face=-1
   emit("ride")
   return
  if near(1950,0):
   if chart:
    say("Mara","outskirts/mara.handover")
   elif bearings.size()==3:
    chart=true
    say("Mara","outskirts/mara.done")
    cue("Mara's field chart complete · three bearings agree")
   else:
    say("Mara","outskirts/mara.progress" if mara_asked else "outskirts/mara.ask")
    mara_asked=true
   return
  if near(250,0):
   if rowan==0:
    rowan=1
    say("Rowan","outskirts/rowan.opening")
    say("The Knight","outskirts/knight.walked")
    say("Rowan","outskirts/rowan.accept")
    cue("Rowan · roll the cart onto the iron stop at 1050")
   elif rowan==4:
    rowan=5
    say("Rowan","outskirts/rowan.ready")
    say("Rowan","outskirts/rowan.reward")
    cue("A Bell for the Camp · complete · drake shortcut unlocked")
   elif rowan>=5:
    ride={"start":p.x,"end":11020.0,"y0":p.y,"t":0.0}
    p.face=1
    emit("ride")
   else: say("Rowan","outskirts/rowan.task."+["","ballast","bell","hang"][rowan])
   return
  if rowan==1 and near(1050,0,65,60):
   var carts=objects().filter(func(o):return o.type=="crate")
   if not carts.is_empty() and abs(carts[0].x-1050)<35:
    rowan=2
    cue("Brake locked · climb Rowan's bell tower")
    emit("gate")
   return
  if rowan==2 and near(1370,282,60,50):
   rowan=3
   bell_held=true
   cue("Bell released · carry it to Rowan's post")
   emit("bell")
   return
  if rowan==3 and near(360,0,65,60):
   rowan=4
   bell_held=false
   cue("Bell hung · return to Rowan")
   emit("bell")
   return
 if stage==1:
  if elsie>=5 and near(11530,0,85,70):
   ride={"start":p.x,"end":820.0,"y0":p.y,"t":0.0}
   p.face=-1
   emit("ride")
   return
  if near(700,0):
   if elsie==0:
    elsie=1
    say("Elsie","woods/refuge.opening")
    say("The Knight","woods/refuge.short")
    say("Elsie","woods/refuge.accept")
    cue("Elsie · follow the lantern moths east")
   elif elsie==4:
    elsie=5
    say("Elsie","woods/refuge.ending")
    say("Elsie","woods/refuge.rewardLine")
    cue("A Place for Supper · complete · moth flight unlocked")
   elif elsie>=5:
    ride={"start":p.x,"end":11530.0,"y0":p.y,"t":0.0}
    p.face=1
    emit("ride")
   else: say("Elsie","woods/refuge.task."+(["","moths","lantern","log"][elsie]))
   return
  if near(6900,0) and not bram_done:
   bram_follow=true
   say("Bram","woods/bram.first")
   cue("Keep Bram's lamp close · amber reveals the real branches")
   return
 pickup()
 for o in objects():
  if o.type=="ambientFigure" and near(o.x,o.y):
   var voice={"Vey":"outskirts/vey.first","Olan":"outskirts/olan.first","Orra":"woods/orra.first","Pell":"woods/pell.first","Hale":"woods/hale.after" if weapon else "woods/hale.before"}.get(o.name,"")
   if voice!="": say(o.name,voice)
   return
  if o.type=="restSite" and near(o.x,o.y):
   p.blood=5
   cue(o.name+" · rested")
   emit("rest")
   return
  if o.type in ["storyRelic","sign"] and near(o.x,o.get("y",0)):
   o.read=true
   cue(o.get("title","Old survey mark"))
   emit("page")
   return
func strike():
 for e in region().enemies:
  var key="enemy-"+str(e.aiId)
  var center=Vector2(p.x,p.y+70) if p.upSwing else Vector2(p.x+p.face*36,p.y+24)
  if e.dead or p.swingHits.has(key) or abs(e.x-center.x)>49+e.w/2 or abs(e.y+e.h/2-center.y)>40: continue
  p.swingHits[key]=true
  if e.get("frontShield",false) and (p.x-e.x)*e.face>0 and not p.upSwing:
   emit("clang",e.x,e.y+20)
   continue
  e.hp-=11
  e.hitFlash=0.18
  e.x+=p.face*10
  e.mode="recover"
  e.timer=0.3
  emit("hit",e.x,e.y+20)
  if e.hp<=0:
   e.dead=true
   kill_count+=1
   flags=min(1,flags+1)
   if mantle: p.ward=min(3,p.get("ward",0)+1)
   emit("kill",e.x,e.y+20)
 for o in objects():
  if o.type!="earlyBlade" or not p.upSwing or p.swingHits.has(o.earlyId) or o.get("usedUntil",0)>clock: continue
  if abs(p.x-o.x)<o.w/2+12 and o.y>=p.y+p.h-10 and o.y<=p.y+p.h+64:
   p.swingHits[o.earlyId]=true
   o.usedUntil=clock+0.6
   p.vy=-o.speed
   p.onGround=false
   p.floor=-1
   p.jumpCutOk=false
   p.swingT=0.0
   p.atkCd=0.2
   emit("launch",o.x,o.y)
 if stage==1 and elsie==3 and not p.upSwing and not p.swingHits.has("log") and near(2290,0,85,70):
  p.swingHits.log=true
  log_hits+=1
  emit("chop",2290,20)
  if log_hits>=3:
   elsie=4
   cue("Board split · return to Elsie")
func update_enemies():
 for e in region().enemies:
  Combat.tick(self,e)
  if stage==0 and not weapon and not e.dead and e.mode!="veil" and abs(e.x-p.x)<(e.w+p.w)/2 and abs(e.y+e.h/2-p.y-p.h/2)<(e.h+p.h)/2:
   hurt(e.x)
 Combat.threats(self)
func update_stories(raw):
 if stage==1:
  if elsie==1:
   if moth_t<1:
    moth_t=min(1,moth_t+DT/0.9)
    moth=moth_from.lerp(PERCHES[moth_perch],moth_t)+Vector2(0,sin(moth_t*PI)*90)
   elif near(moth.x,moth.y,160,150):
    if moth_perch<PERCHES.size()-1:
     moth_from=moth
     moth_perch+=1
     moth_t=0.0
     emit("moths",moth.x,moth.y)
    elif near(moth.x,moth.y,40,50):
     elsie=2
     lantern_held=true
     cue("Lantern caught · carry it home to Elsie without taking a hit")
  if elsie==2:
   if not lantern_held and near(lantern.x,lantern.y,40,50): lantern_held=true;emit("pickup")
   if lantern_held:
    lantern=point()+Vector2(-16*p.face,30)
    if near(820,0,60,50):
     lantern_held=false
     lantern=Vector2(820,0)
     elsie=3
     cue("Lantern home · split Hale's log with the Oathblade")
  if bram_follow:
   var n=region().npcs[0]
   if not n.has("onGround"):
    n.onGround=true
    n.recalls=0
    n.vx=0.0
    n.vy=0.0
   var target_x=9650 if p.x>9570 else p.x-60
   var dx=target_x-n.x
   n.vx=sign(dx)*min(220.0,abs(dx)*4)
   if n.onGround and abs(dx)>25:
    var ahead=floor_at(n.x+sign(dx)*72,n.y+90)
    var close=floor_at(n.x+sign(dx)*32,n.y+2)
    if (ahead.id>=0 and ahead.y>n.y+20) or (close.id<0 and p.y>=n.y-10):
     n.vy=-500.0
     n.onGround=false
   var old_y=n.y
   n.x+=n.vx*DT
   n.vy+=1400*DT
   n.y-=n.vy*DT
   n.onGround=false
   if n.vy>=0:
    var floor=floor_at(n.x,old_y,26)
    if floor.id>=0 and n.y<=floor.y:
     n.y=floor.y
     n.vy=0.0
     n.onGround=true
   if n.y< -180:
    # An essential guide retries from his last grounded refuge, in view, rather than following into a void.
    n.recalls+=1
    n.x=n.get("safeX",6900)
    n.y=n.get("safeY",0)
    n.vy=0.0
   if n.onGround: n.safeX=n.x;n.safeY=n.y
   if p.x>9570 and abs(n.x-9650)<8 and n.y>=600:
    bram_follow=false
    bram_done=true
    say("Bram","woods/bram.done")
    cue("Bram's lamp stays lit · the return path is clear")
func objective():
 var lines=[]
 if stage==0:
  if chart: lines.append("Mara's chart · complete")
  elif mara_asked or not bearings.is_empty(): lines.append("Mara · "+str(bearings.size())+" / 3 bearings"+(" · return to her" if bearings.size()==3 else ""))
  if rowan>=5: lines.append("Rowan · bell hung · drake unlocked")
  if rowan in [1,2,3,4]: lines.append(["","Rowan · cart to brake stop","Rowan · release the tower bell","Rowan · hang the bell by his bench","Rowan · return to him"][rowan])
 else:
  if elsie>=5: lines.append("Elsie · supper ready · moth flight unlocked")
  if elsie in [1,2,3,4]: lines.append(["","Elsie · follow the moths east","Elsie · lantern home safely","Elsie · split Hale's log · "+str(log_hits)+" / 3","Elsie · return to her"][elsie])
  if not weapon: lines.append("Oathblade · stand on the hanging counterweight")
 return "    /    ".join(lines)

func hint():
 if p.dead: return "Returning to your checkpoint flag…"
 if not ride.is_empty(): return "The shortcut crosses the road you opened"
 if stage==0:
  if rowan>=5 and near(11020,0,85,70): return "↑  Ride the drake back to Rowan"
  if near(250,0): return "↑  Ride the drake shortcut" if rowan>=5 else "↑  Talk to Rowan"
  if near(1950,0): return "↑  Return the three bearings to Mara" if bearings.size()==3 and not chart else "↑  Talk to Mara"
  if rowan==1 and near(1050,0,100,65): return "Push the stone cart to the iron stop · ↑ to lock the brake"
  if rowan==2 and near(1370,282,80,80): return "↑  Release the bell"
  if rowan==3 and near(360,0,90,65): return "↑  Hang the bell at Rowan's post"
 else:
  if p.x>12100: return "End of this draft · ← Return through Black Woods"
  if elsie>=5 and near(11530,0,85,70): return "↑  Take the moth flight home"
  if near(700,0): return "↑  Take the moth flight" if elsie>=5 else "↑  Talk to Elsie"
  if not weapon and near(3640,40,110,100):
   var blade=region().pickups[0]
   return "C  Take the freed Oathblade" if not blade.ritualLocked else "Climb the three branches to the hanging counterweight"
  for o in objects():
   if o.type=="earlyBlade" and near(o.x,o.y,180,220): return "↑ + W  Strike the pale underside · the resin launches you"
  if elsie==3 and near(2290,0,110,80): return "W  Split Hale's log" if weapon else "Hale's log needs the Oathblade · east in the clearing"
  if near(6900,0): return "↑  Ask Bram to light the real branches"
 for o in objects():
  if o.type=="ambientFigure" and near(o.x,o.y): return "↑  Talk to "+o.name
  if o.type=="restSite" and near(o.x,o.y): return "↑  Rest at "+o.name
 return "← → MOVE    SPACE JUMP    ↑ TALK / USE    W STRIKE    C TAKE    R FLAG"
