extends SceneTree
const World=preload("res://scripts/world.gd")
var recording=[]
var visited=[]
func advance(w,raw):
 var keys=""
 for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"],["parry","p"],["portal","q"]]:
  if raw.get(pair[0],false): keys+=pair[1]
 if not recording.is_empty() and recording[-1][1]==keys: recording[-1][0]+=1
 else: recording.append([1,keys])
 w.step(raw)
 var changed=w.update_region()
 if "death" in w.active().events: print("DEATH ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y))
 return changed
func decoded(keys):
 var raw={}
 for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"],["parry","p"],["portal","q"]]: raw[pair[0]]=pair[1] in keys
 return raw
func _initialize():
 var number=int(OS.get_cmdline_user_args()[0])
 var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%number)))
 var previous=""
 var expected_count=0
 for section in w.data.world.sections:
  if w.data.world.tapes.has(section.room): expected_count+=1
 for section in w.data.world.sections:
  if not w.data.world.tapes.has(section.room): continue
  var id=section.room
  if w.active_id!=id:
   print("STOP expected ",id," got ",w.active_id)
   break
  visited.append(id)
  var seam=null
  for link in w.data.world.get("continuousSeams",[]):
   if link.from==previous and link.to==id: seam=link
  if seam!=null:
   for part in seam.get("toFire",[]):
    for i in range(int(part[0])): advance(w,decoded(part[1]))
  var target=w.active().room.spawn
  if target.x>=w.active().room.w-48 and w.active().p.y>target.y+12:
   for i in range(90):
    var p=w.active().p
    var dx=target.x-p.x
    var desired=clamp(dx*12,-90,90)
    if dx==0 and p.vx==0 and p.onGround and p.dashes>0 and p.dashCooldown==0: break
    advance(w,{"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1})
   var lower_row=clampi(floori((w.active().p.y+8)/8),0,int(w.active().room.rows)-1)
   var safe_min=0
   for c in range(int(w.active().room.cols)):
    if w.active().tile(c,lower_row)>=3: safe_min=(c+1)*8
   var launch_x=safe_min+2 if id=="cl22-fw22-briar" else max(safe_min+2,target.x-8)
   for i in range(90):
    var p=w.active().p
    var dx=launch_x-p.x
    var desired=clamp(dx*12,-90,90)
    if dx==0 and p.vx==0: break
    advance(w,{"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1})
   for i in range(14):
    advance(w,{"l":true,"jump":true})
   for i in range(18):
    advance(w,{"r":true,"u":id!="cl22-fw22-briar","dash":true})
   for i in range(90):
    advance(w,{"r":true,"grab":true,"u":true})
    if w.active().p.y<=target.y and w.active().p.x>=target.x-8: break
  if id=="cl22-fw22-briar":
   for i in range(6): advance(w,{"d":true,"dash":true})
   for i in range(30): advance(w,{})
  if id=="cl23-fc23-east":
   for part in [[12,"ljg"],[8,"lgu"],[12,"rjg"],[20,"rgu"]]:
    for i in range(part[0]): advance(w,decoded(part[1]))
  var bottom=w.active().room.def.map[-1]
  var column=clampi(floori((w.active().p.x+4)/8),0,bottom.length()-1)
  if bottom[column]=="." and w.active().p.y>target.y+12:
   for climb in range(240):
    advance(w,{"r":true,"grab":true,"u":true})
    if w.active_id!=id or w.active().p.y<=target.y: break
  for wait in range(360):
   var p=w.active().p
   if p.x==target.x and abs(p.y-target.y)<=1 and abs(p.vx)<.001 and p.onGround and p.state=="normal": break
   var dx=target.x-p.x
   var desired=clamp(dx*12,-90,90)
   advance(w,{"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1,"jump":p.onGround and p.y>target.y+10 and wait%30<12})
   if w.active_id!=id: break
  if w.active_id!=id:
   print("APPROACH left ",id," into ",w.active_id)
   break
  var adjustments=JSON.parse_string(OS.get_cmdline_user_args()[2]) if OS.get_cmdline_user_args().size()>2 else {"cl22-fw22-canopy":{"0":1},"cl22-fw22-oath2":{"0":1},"cl23-bank-f23":{"0":-2},"cl23-fc23-gantry":{"15":3},"cl23-fc23-standard":{"6":{"duration":8,"keys":"rgu"},"7":{"keys":"ux"},"8":{"keys":"r"},"9":{"keys":"r"},"11":{"keys":"r","duration":90}}}
  for i in range(int(adjustments.get(id,{}).get("_wait",0))): advance(w,{})
  var core=w.active()
  for wait in range(14400):
   var aligned=true
   for e in core.ents:
    if e.type=="hookCarrier" and int(e.clock)%int(e.period)!=0: aligned=false
    if e.type=="zipline" and e.period!=0 and int(core.room_frame)%int(e.period)!=0: aligned=false
   if core.beams!=null:
    for e in core.ents:
     if e.type=="shutter" and int(core.beams.clock)%int(e.beat.open+e.beat.shut)!=0: aligned=false
   for e in core.sweepers:
    if core.sweeper_clock%int(e.period)!=0: aligned=false
   if core.sentinel!=null and int(core.sentinel.t)%int(core.sentinel.period)!=0: aligned=false
   if core.resin_wind!=null and int(core.resin_wind.t)%int(core.resin_wind.period*2)!=0: aligned=false
   if core.root_lash!=null:
    for lash in core.root_lash.lashes:
     if int(core.root_lash.t)%int(lash.period)!=0: aligned=false
   if core.foes!=null:
    for foe in core.foes:
     if core.foe_clock%int(foe.period)!=0: aligned=false
   if aligned: break
   advance(w,{})
   if w.active_id!=id or w.active().deaths>0: break
  print("ENTER ",id," ",Vector2(w.active().p.x,w.active().p.y)," spawn ",target," frame ",core.room_frame," rem ",Vector2(core.p.remX,core.p.remY))
  var changed=false
  var frame=0
  var last={}

  var part_index=0
  for part in w.data.world.tapes[id]:
   if changed: break
   last=decoded(part[1])
   var adjustment=adjustments.get(id,{}).get(str(part_index),0)
   var duration=int(part[0])+int(adjustment.get("duration",0) if adjustment is Dictionary else adjustment)
   if adjustment is Dictionary and adjustment.has("keys"): last=decoded(adjustment["keys"])
   part_index+=1
   for i in range(max(0,duration)):
    changed=advance(w,last)
    frame+=1
    if changed: break
  for extra in range(8):
   if changed: break
   changed=advance(w,last)
  if id=="cl21-walk-3-15" and not changed:
   for i in range(4): advance(w,{"r":true})
   for i in range(100):
    changed=advance(w,{})
    if changed: break
  if id in ["cl23-conn-4","cl23-conn-5"] and not changed:
   for i in range(120):
    changed=advance(w,{"r":id=="cl23-conn-4","l":id=="cl23-conn-5","grab":true,"u":true})
    if changed: break
  if not changed: print("STOPPED ",id," p ",JSON.stringify(w.active().p)," ents ",JSON.stringify(w.active().ents)," combat ",JSON.stringify(w.active().combat))
  print("LEAVE ",frame," ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y)," deaths ",w.active().deaths)
  previous=id
  if w.active().deaths>0: break
 var ok=visited.size()==expected_count and w.active_id=="cl%d-atlas-crossroads"%number and w.active().deaths==0
 if ok:
  var file=FileAccess.open(OS.get_cmdline_user_args()[1],FileAccess.WRITE)
  file.store_string(JSON.stringify({"world":number,"frames":w.frames,"deaths":0,"visited":visited,"tape":recording},"  ")+"\n")
  file.close()
 print("PASS" if ok else "FAIL"," continuous Fractured journey · ",number," · ",w.frames," frames · ",visited.size()," / ",expected_count," road sections · ",w.active().deaths," deaths")
 w.shutdown()
 quit(0 if ok else 1)
