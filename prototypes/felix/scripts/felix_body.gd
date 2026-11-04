extends RefCounted
## Felix himself: the ball of light and whatever the boy has imagined onto him so far.
## Shared by every chapter. A chapter's view calls draw() for the body, then adds its own
## costume or props around the returned center. Gifts: legs, cape, arms, face.

const LIGHT=preload("res://art/felix/light.png")
const FACE=preload("res://art/felix/face.png")
const SLIME=preload("res://art/felix/slime.png")
const SLIME_FACE=preload("res://art/felix/slime-face.png")
const LIMB=preload("res://art/felix/limb.png")
const FOOT=preload("res://art/felix/foot.png")
const CAPE_RED=preload("res://art/felix/cape-red.png")
const CAPE_CREAM=preload("res://art/felix/cape-cream.png")
const DRIP=preload("res://art/felix/drip.png")

# The limb's long axis points down in its authored sprite.
func limb(v,a,b,width=1.5):
 v.ink.draw_set_transform_matrix(v.paint_transform*Transform2D((b-a).angle()-PI/2,a.round()))
 v.ink.draw_texture_rect(LIMB,Rect2(-width/2,0,width,a.distance_to(b)+1),false,v.ink_color)
 v.ink.draw_set_transform_matrix(v.paint_transform)

func draw(v,g):
 var p=v.sim.p
 var x=v.actor.x
 var y=v.actor.y
 var stretch=Vector2.ONE
 if p.state=="dash" and not v.reduced_motion: stretch=Vector2(1+.35*abs(p.dashDir.x),1+.35*abs(p.dashDir.y))
 var amount=v.squash*(.3 if v.reduced_motion else 1.0)
 stretch*=Vector2(1+amount,1/(1+amount))
 var bob=0.0 if g.legs else sin(v.clock*3)*1.2-1.5
 var center=Vector2(x+4,y+4.5+bob)
 var walking_now=p.onGround and p.state=="normal" and abs(p.vx)>10
 var cycle=v.walking/4.2
 if g.cape:
  var ready=p.dashes>0
  var root=center+Vector2(-p.facing*2.5,-1.5)
  var shift=root-v.plume[0]
  for i in range(1,v.plume.size()):
   var a=v.plume[i-1]+shift
   var b=v.plume[i]+shift
   var tint=Color.WHITE if ready else Color("#82758c")
   var width=max(1.4,3.0-i*.25)
   v.ink.draw_set_transform_matrix(v.paint_transform*Transform2D((b-a).angle()-PI/2,a.round()))
   v.ink.draw_texture_rect(CAPE_RED if i%2 else CAPE_CREAM,Rect2(-width/2,0,width,max(2,a.distance_to(b)+1)),false,tint*v.ink_color)
  v.ink.draw_set_transform_matrix(v.paint_transform)
 if g.legs:
  for side in [-1,1]:
   var stride=sin(cycle+(0.0 if side<0 else PI)) if walking_now else 0.0
   var hip=center+Vector2(side*1.4,2.8)
   var foot=Vector2(x+4+side*1.8+stride*1.6,y+11-max(0,-stride)*1.2)
   if not p.onGround: foot=hip+Vector2(side*1.2,3.5)
   limb(v,hip,foot,1.4)
   v.ink.draw_texture_rect(FOOT,Rect2((foot-Vector2(1,1)).round(),Vector2(3,2)),false,v.ink_color)
 if g.arms:
  for side in [-1,1]:
   var shoulder=center+Vector2(side*3.2,.6)
   var hand=shoulder+Vector2(side*2.2,1.8+sin(cycle+side)*(.8 if walking_now else .2))
   if p.state=="climb" and side==p.facing: hand=shoulder+Vector2(side*2.4,-2.2+sin(v.clock*10)*(.6 if abs(p.vy)>1 else 0))
   limb(v,shoulder,hand,1.3)
 v.ink.draw_set_transform_matrix(v.paint_transform*Transform2D(0,stretch,0,center))
 var pulse=sin(v.clock*2.2)*.3+v.gift_pulse*2.0
 # Soft light remains an effect behind the crisp, eight-pixel sprite.
 v.circle(Vector2.ZERO,7+pulse,Color(1,.97,.85,.06))
 v.circle(Vector2.ZERO,5+pulse*.6,Color(1,.97,.85,.14))
 v.ink.draw_texture(FACE if g.face else LIGHT,Vector2(-4,-4.5),v.ink_color)
 var slimed=clamp(float(p.get("pollen",0))/45.0,0,1)
 if slimed>0:
  v.ink.draw_texture(SLIME_FACE if g.face else SLIME,Vector2(-4,-4.5),Color(1,1,1,slimed)*v.ink_color)
 v.ink.draw_set_transform_matrix(v.paint_transform)
 if slimed>0:
  for i in range(2):
   var age=fposmod(v.clock*1.6+i*.5,1.0)
   v.ink.draw_texture_rect(DRIP,Rect2((center+Vector2(-1.5+i*3,3.5+age*5)).round(),Vector2(1,2)),false,Color(1,1,1,(1-age)*slimed)*v.ink_color)
 if p.state=="climb":
  v.box(x+1,y-5,6,1,Color(0,0,0,.4))
  v.box(x+1,y-5,6*clamp(p.stamina/110,0,1),1,"#fff1c4")
 return center
