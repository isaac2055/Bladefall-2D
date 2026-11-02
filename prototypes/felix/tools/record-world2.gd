extends SceneTree
const World=preload("res://scripts/world.gd")
var recording=[]
var visited=[]
func advance(w,raw):
 var keys=""
 for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]:
  if raw.get(pair[0],false): keys+=pair[1]
 if not recording.is_empty() and recording[-1][1]==keys: recording[-1][0]+=1
 else: recording.append([1,keys])
 w.step(raw)
 return w.update_region()
func _initialize():
 var w=World.new(JSON.parse_string(FileAccess.get_file_as_string("res://data/world2.json")))
 for section in w.data.world.sections:
  if not w.data.world.tapes.has(section.room): continue
  var id=section.room
  if w.active_id!=id:
   print("STOP expected ",id," got ",w.active_id)
   break
  visited.append(id)
  var target=w.active().room.spawn
  for wait in range(360):
   var p=w.active().p
   if p.x==target.x and abs(p.y-target.y)<=1 and abs(p.vx)<0.001 and p.onGround: break
   var dx=target.x-p.x
   var desired=clamp(dx*12,-90,90)
   var raw={"r":dx!=0 and p.vx<desired-1,"l":dx!=0 and p.vx>desired+1,"jump":p.onGround and p.y>target.y+10 and wait%30<12}
   advance(w,raw)
   if w.active_id!=id: break
  if not w.active().sweepers.is_empty() or not w.active().moving_decks.is_empty():
   var core=w.active()
   for wait in range(7200):
    var aligned=true
    for sweeper in core.sweepers:
     if core.sweeper_clock%int(sweeper.period)!=0: aligned=false
    for deck in core.moving_decks:
     if int(deck.clock)%int(deck.period)!=0: aligned=false
    if aligned: break
    advance(w,{})
  print("ENTER ",id," ",Vector2(w.active().p.x,w.active().p.y)," spawn ",w.active().room.spawn)
  var changed=false
  var frame=0
  for part in w.data.world.tapes[id]:
   if changed: break
   for i in range(int(part[0])):
    var raw={}
    for pair in [["l","l"],["r","r"],["u","u"],["d","d"],["jump","j"],["dash","x"],["grab","g"],["strike","s"]]: raw[pair[0]]=pair[1] in part[1]
    changed=advance(w,raw)
    frame+=1
    if changed: break
  if id=="cl2-walk-2-10" and w.active_id==id:
   for extra in range(90):
    if advance(w,{"r":extra<15}): break
  print("LEAVE ",frame," ",w.active_id," ",Vector2(w.active().p.x,w.active().p.y)," deaths ",w.active().deaths)
 var ok=visited.size()==12 and w.active_id=="cl2-atlas-crossroads" and w.active().deaths==0
 if ok:
  var path=OS.get_cmdline_user_args()[0]
  var file=FileAccess.open(path,FileAccess.WRITE)
  file.store_string(JSON.stringify({"world":2,"frames":w.frames,"deaths":0,"visited":visited,"tape":recording},"  ")+"\n")
  file.close()
  print("PASS continuous native journey · ",w.frames," frames · no deaths, warps, state resets or physics edits")
 else: push_error("Continuous native journey did not reach the crossroads")
 w.shutdown()
 quit(0 if ok else 1)
