extends RefCounted
## Authored Deep Line carts, boost track and switches used by Fractured Causeway.
static func reset(g):
 g.room.boost=[]
 g.room.boost.resize(int(g.room.cols*g.room.rows))
 g.room.boost.fill(0)
 for r in range(int(g.room.rows)):
  for c in range(int(g.room.cols)):
   var ch=AscendRoomLoader.glyph(g.room.def,c,r)
   if ch in ["-","(",")"]:
    g.room.grid[r*int(g.room.cols)+c]=1
    if ch!="-": g.room.boost[r*int(g.room.cols)+c]=-1 if ch=="(" else 1
   elif ch=="k": g.ents.append({"type":"switch","dev":true,"x":c*8,"y":r*8,"w":8,"h":8,"id":"sw"+str(g.ents.size())})
 for b in g.device_groups("C"):
  g.ents.append({"type":"cart","dev":true,"solid":true,"x":b.x,"y":b.y,"w":b.w,"h":b.h,"ox":b.x,"oy":b.y,"vx":0,"vy":0,"remX":0,"remY":0,"id":"ct"+str(g.ents.size()),"lost":0})
 g.p.seat=null
static func seated(g,e):
 var p=g.p
 return p.state!="dead" and p.y+p.h==e.y and p.x+4>=e.x and p.x+4<e.x+e.w and p.vy>=0
static func boost_under(g,e):
 var r=(e.y+e.h)/8.0
 if r!=floor(r) or r>=g.room.rows: return 0
 var d=0
 for c in range(floori(e.x/8),floori((e.x+e.w-1)/8)+1):
  var index=int(r)*int(g.room.cols)+c
  if index>=0 and index<g.room.boost.size() and g.room.boost[index]!=0: d=g.room.boost[index]
 return d
static func before(g,inp):
 var p=g.p
 for e in g.ents:
  if e.type!="cart": continue
  if e.lost>0:
   e.lost-=1
   if e.lost==0:
    e.x=e.ox
    e.y=e.oy
    e.vx=0
    e.vy=0
    e.remX=0
    e.remY=0
    e.gone=false
    e.solid=true
    g.emit_event("cart-home")
   continue
  var riding=seated(g,e) and p.onGround
  var lean=inp.mx
  if p.state not in ["dead","respawn"] and p.y+p.h==e.y and p.x<e.x+e.w and p.x+p.w>e.x:
   p.dashRefillCooldown=max(p.dashRefillCooldown,2)
   g.buf.dash=0
   if p.state=="dash" and not p.dashAim:
    p.state="normal"
    p.dashTimer=0
    p.ducking=false
    p.vx=0
    p.vy=0
  var on_rail=g.solid(e.x,e.y+1,e.w,e.h,g.ents.find(e))
  if riding and on_rail and lean!=0 and (abs(e.vx)<150 or sign(e.vx)!=lean): e.vx=g.approach(e.vx,150*lean,260*g.DT)
  if on_rail:
   for s in g.ents:
    if s.type=="crumble" and not s.get("broken",false) and not s.get("shaking",0)>0 and g.overlap(g.rect(e.x,e.y+e.h,e.w,1),s):
     s.shaking=g.K.crumbleShakeFrames
     g.emit_event("crumble-shake")
   var b=boost_under(g,e)
   if b!=0:
    if e.vx*b<300:
     e.vx=b*300
     g.emit_event("boost")
   elif not (riding and lean!=0): e.vx=g.approach(e.vx,0,40*g.DT)
   e.vy=0
  else: e.vy=min(240,e.vy+900*g.DT)
  for s in g.ents:
   if s.type!="switch": continue
   if on_rail and e.vx!=0 and g.overlap(g.rect(e.x,e.y,e.w,e.h+1),s) and e.get("hopped")==null:
    if riding and lean==sign(e.vx):
     e.vy=-310
     e.hopped=s.id
     g.emit_event("switch-high")
    elif e.get("passed")!=s.id:
     e.passed=s.id
     g.emit_event("switch-low")
  if on_rail and e.vy>=0 and e.get("hopped")!=null and not g.ents.any(func(s):return s.type=="switch" and g.overlap(g.rect(e.x,e.y,e.w,e.h+1),s)): e.hopped=null
  e.remX+=e.vx*g.DT
  var nx=g.js_round(e.remX)
  e.remX-=nx
  while nx!=0:
   var s=sign(nx)
   if g.solid(e.x+s,e.y,e.w,e.h,g.ents.find(e)):
    if abs(e.vx)>60: g.emit_event("cart-bump")
    e.vx=0
    e.remX=0
    break
   g.move_solid(e,s,0)
   nx-=s
  e.remY+=e.vy*g.DT
  var ny=g.js_round(e.remY)
  e.remY-=ny
  while ny!=0:
   var s=sign(ny)
   if g.solid(e.x,e.y+s,e.w,e.h,g.ents.find(e)):
    if s>0 and e.vy>120: g.emit_event("cart-land")
    e.vy=0
    e.remY=0
    break
   g.move_solid(e,0,s)
   ny-=s
  if seated(g,e) and p.onGround:
   p.liftX=e.vx
   p.liftY=min(0,e.vy)
   p.liftTimer=g.K.liftGraceFrames
  if e.y>g.room.h+8:
   e.lost=40
   e.gone=true
   e.solid=false
   g.emit_event("cart-lost")
static func forces(g):
 var p=g.p
 var found=g.ents.filter(func(e):return e.type=="cart" and not e.get("gone",false) and seated(g,e))
 var cart=found[0] if not found.is_empty() else null
 if cart!=null and p.onGround and p.state=="normal" and p.vy>=0:
  p.vx=0
  p.seat=cart
  var want=g.js_round(cart.x+cart.w/2.0-4)
  if want!=p.x: g.move_axis(p,sign(want-p.x),true)
 else:
  if p.seat!=null and p.vy<0 and abs(p.vx)>g.K.maxRun: p.coast=true
  p.seat=null
static func dash_hit(g,e,sx):
 if e.type!="cart" or sx==0 or g.p.state!="dash": return false
 e.vx=sx*200
 var p=g.p
 p.state="normal"
 p.dashTimer=0
 p.ducking=false
 p.vx=-sx*120
 p.vy=-120
 p.varJumpSpeed=p.vy
 p.varJump=9
 p.autoJump=true
 g.freeze=2
 g.emit_event("stone-hit")
 return true
