"""Hand-authored Chapter Three pixel art; one source pixel is one world pixel.
Rebuild: python3 art/make_phantom_art.py (Pillow is authoring-only).
People are 56/70/82 pixels tall, matching the story's existing floor-clearance rule.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import math
R=Path(__file__).resolve().parent/'phantom';R.mkdir(exist_ok=True)
def new(w,h):
 im=Image.new('RGBA',(w,h));return im,ImageDraw.Draw(im)
def save(im,name):im.save(R/(name+'.png'))
def pattern(name,rows,p):
 im,d=new(len(rows[0]),len(rows))
 for y,row in enumerate(rows):
  for x,c in enumerate(row):
   if c!='.':d.point((x,y),fill=p[c])
 save(im,name)
pattern('hood',['.....h.....','....hmm....','...hmms....','..hmmsss...','.hmmssssd..','hmmdddddss.','hmd.....ds.','hd.......d.'],dict(h='#87949e',m='#465366',s='#2e354c',d='#1e263a'))
pattern('mask',['ddddddddd','dwwddwwdd','.ddddddd.'],dict(d='#1b2333',w='#fff5d5'))
pattern('tie',['..sss.','ssdd..','....dd'],dict(s='#465366',d='#232a3b'))
pattern('dagger',['..h....','..m....','ddmhhhs','..m....'],dict(h='#dfbf8e',m='#a97c53',d='#65504b',s='#7c5e4d'))
pattern('folded',['...hhh.....','..hmmmss...','.hmmsssdd..','hmmmmssddd.','.dddddddd..','..wwddww...','...dddd....'],dict(h='#7c8998',m='#495368',s='#32394f',d='#202739',w='#e8dcb8'))
# Duffel, stitched handles and cream address tag: handed over without changing story cues.
im,d=new(20,16)
d.line([(4,7),(6,1),(12,1),(15,7)],fill='#1f3535',width=2)
d.line([(7,2),(12,2)],fill='#9b9b76')
d.polygon([(3,6),(16,6),(19,9),(18,15),(2,15),(0,12),(1,8)],fill='#263d3c')
d.rectangle((3,7,16,13),fill='#4b6b5c');d.line([(4,7),(15,7)],fill='#8b9b76')
d.line([(5,8),(5,13)],fill='#a7a785');d.line([(14,8),(14,13)],fill='#2d4d46')
d.rectangle((15,10,18,12),fill='#b7ae8b');d.point((16,11),fill='#6e705d')
d.line([(3,14),(16,14)],fill='#1f3434');save(im,'duffel')
# Faces carry the same warm cheeks / brown hair family palette as Chapters One and Two.
skin='#e6b99b';light='#f5cfaa';shade='#c28c79';hair='#513a39';ink='#30313f'
def sleeve(d,points,base,hi,width=5,hand=True):
 d.line(points,fill='#28333d',width=width+2)
 d.line(points,fill=base,width=width)
 d.line([(x-1,y) for x,y in points],fill=hi,width=1)
 if hand:
  x,y=points[-1];d.rectangle((x-1,y-1,x+1,y+2),fill=skin);d.point((x-1,y-1),fill=light)
def legs(d,c,y,end,walking,base,hi):
 # Four discrete walk drawings keep feet crisp on the existing floor anchor.
 swing=[0,3,0,-3][walking] if walking is not None else 0
 for side in [-1,1]:
  x=c+side*3;fx=x+side*swing
  d.line([(x,y),(x+side,y+(end-y)//2),(fx,end-3)],fill='#25303e',width=5)
  d.line([(x,y),(fx,end-3)],fill=base,width=3)
  d.line([(x-1,y+2),(fx-1,end-5)],fill=hi,width=1)
  d.rectangle((fx-2,end-3,fx+3,end-1),fill='#27303a')
  d.line([(fx-2,end),(fx+4,end)],fill='#78818a')
  d.point((fx+3,end-2),fill='#a6aaa1')
def person(who,pose,walk=None,soft=False):
 h={'boy':56,'mom':70,'man':82}[who];w=48;c=24
 im,d=new(w,h)
 if who=='boy':
  base='#354f79';hi='#6b7f9c'
  legs(d,c,34,55,walk,'#3e5572','#718199')
  # Hood down, shoulder seams, ribbed waistband and a worn little patch.
  d.polygon([(17,15),(21,12),(28,12),(32,17),(31,34),(29,36),(17,35),(16,21)],fill='#243750')
  d.polygon([(18,17),(29,16),(30,33),(18,33)],fill=base)
  d.line([(18,18),(18,31)],fill=hi);d.line([(19,34),(29,34)],fill='#1e334f')
  d.polygon([(18,14),(22,18),(28,18),(30,13),(27,12),(21,12)],fill='#2b3f5f')
  d.line([(20,15),(23,16),(27,15)],fill='#6c7f98')
  d.rectangle((22,26,25,27),fill='#aaa792');d.point((25,26),fill='#e7d5ab')
  d.line([(21,29),(27,29)],fill='#263e60');d.line([(22,19),(22,23)],fill='#b5bdba')
  a=-2 if walk==1 else 2 if walk==3 else 0
  sleeve(d,[(18,19),(16-a,27),(16-a,32)],base,hi,4)
  if pose=='point':sleeve(d,[(29,19),(35,21),(42,7)],base,hi,4)
  elif pose=='give':sleeve(d,[(29,19),(33,26),(38,23)],base,hi,4)
  else:sleeve(d,[(29,19),(31+a,26),(32+a,32)],base,hi,4)
  # Older Isaac: narrower face and less round cheeks than his seven-year-old portrait.
  d.polygon([(19,4),(28,3),(31,7),(30,11),(27,14),(22,14),(18,10)],fill=shade)
  d.polygon([(20,4),(27,4),(29,7),(29,11),(26,13),(22,12),(20,9)],fill=skin)
  d.line([(21,5),(27,5)],fill=light)
  d.polygon([(18,8),(18,3),(21,1),(25,1),(27,0),(30,3),(31,6),(28,5),(25,4),(22,5),(20,9)],fill=hair)
  d.line([(20,3),(23,2),(27,2)],fill='#89634f');d.rectangle((27,7,28,8),fill=ink)
  d.point((27,7),fill='#f5e9cc');d.point((29,10),fill='#d19683')
  d.line([(26,11),(27,11)],fill='#8c5a56')
 elif who=='mom':
  base='#50767c';hi='#81a09c';down=pose=='down';hy=2 if down else 0
  legs(d,c,44,69,walk,'#354153','#637182')
  # Long hair is behind coat; scarf breaks the cool silhouette.
  d.polygon([(17,4+hy),(28,3+hy),(32,10+hy),(32,30),(17,30),(15,24)],fill='#46343a')
  d.line([(17,13),(17,26)],fill='#92664e')
  d.polygon([(18,19),(29,19),(32,24),(31,44),(28,47),(16,45),(16,26)],fill='#2c4d59')
  d.polygon([(18,21),(28,20),(30,42),(27,44),(17,43)],fill=base)
  d.line([(18,23),(18,41)],fill=hi);d.line([(25,23),(26,44)],fill='#375c69')
  d.polygon([(19,19),(25,21),(29,18),(28,23),(25,24),(19,22)],fill='#c57b72')
  d.line([(19,20),(23,21)],fill='#e5a18c');d.rectangle((22,23,24,28),fill='#a86165')
  for y in [28,35,41]:d.point((26,y),fill='#d2b995')
  d.line([(18,35),(22,35)],fill='#83a09a')
  sleeve(d,[(18,24),(15,35),(15,42)],base,hi,4)
  if pose=='wave':sleeve(d,[(29,24),(35,31),(38,8)],base,hi,4)
  elif not down:sleeve(d,[(29,24),(32,35),(33,42)],base,hi,4)
  d.polygon([(19,5+hy),(27,5+hy),(30,9+hy),(30,14+hy),(26,18+hy),(21,17+hy),(18,12+hy)],fill=shade)
  d.polygon([(21,6+hy),(27,6+hy),(29,10+hy),(28,15+hy),(25,17+hy),(21,14+hy)],fill=skin)
  d.line([(22,7+hy),(26,7+hy)],fill=light)
  d.polygon([(17,10+hy),(17,5+hy),(20,1+hy),(25,0+hy),(29,3+hy),(31,8+hy),(28,7+hy),(24,5+hy),(20,7+hy),(19,13+hy)],fill='#65443d')
  d.line([(18,5+hy),(21,3+hy),(25,2+hy)],fill='#a07152')
  if down:
   d.line([(26,12+hy),(28,13+hy)],fill='#5a4146')
   # No smile: tucked chin, lowered eyelid, hand pressed to cheek.
   d.point((27,16+hy),fill='#9f6966')
   sleeve(d,[(29,25),(34,33),(29,17)],base,hi,4)
   d.line([(29,14),(30,18)],fill=light,width=2)
  else:
   d.rectangle((27,10,28,11),fill=ink);d.point((27,10),fill='#fbe3bd')
   d.line([(25,15),(26,16),(28,15)],fill='#9e6061');d.point((29,13),fill='#d89483')
 else:
  base='#93704d' if soft else '#70533f';hi='#bd9465' if soft else '#a27c56';dark='#4d413c'
  legs(d,c,51,81,walk,'#3c4a5e','#6c7987')
  # A broad work jacket, canvas seams, patch pockets and a pale collar.
  d.polygon([(16,19),(30,19),(35,24),(34,51),(31,55),(13,54),(12,26)],fill=dark)
  d.polygon([(16,21),(29,20),(32,25),(31,51),(15,51),(15,26)],fill=base)
  d.line([(16,24),(16,49)],fill=hi);d.line([(25,23),(25,51)],fill='#4b3d36')
  d.polygon([(18,18),(23,22),(21,27),(17,23)],fill='#d4c6a7')
  d.polygon([(23,22),(28,18),(29,23),(26,27)],fill='#b1a98f')
  d.line([(17,52),(31,52)],fill='#b28a61' if soft else '#8b6b4e')
  for y in [30,36,43,49]:d.point((26,y),fill='#d5b98b')
  for x in [17,27]:
   d.rectangle((x,33,x+4,40),fill='#5d4a3a' if not soft else '#7c5b40')
   d.line([(x,33),(x+4,33)],fill=hi);d.point((x+2,34),fill='#c3ac80')
  a=-3 if walk==1 else 3 if walk==3 else 0
  if pose!='coffees':sleeve(d,[(14,25),(12-a,37),(12-a,46)],base,hi,6)
  if pose=='phone':sleeve(d,[(32,25),(38,33),(34,12)],base,hi,6)
  elif pose=='coffees':
   sleeve(d,[(14,25),(11,40),(17,42)],base,hi,6)
   sleeve(d,[(32,25),(38,42),(36,42)],base,hi,6)
  elif pose!='hold':sleeve(d,[(32,25),(35+a,37),(36+a,46)],base,hi,6)
  # Strong brows and a short beard read gruff, never threatening.
  d.polygon([(18,6),(29,6),(32,10),(31,16),(27,19),(21,18),(17,14)],fill='#ad7b66')
  d.polygon([(19,7),(28,7),(30,11),(29,15),(26,17),(21,15),(19,12)],fill='#d0a07c')
  d.line([(20,8),(27,8)],fill='#e5bd92')
  d.polygon([(18,13),(22,15),(28,14),(30,12),(29,18),(26,20),(21,18)],fill='#6a5147')
  eye=21 if pose=='back' else 28
  d.line([(eye-1,10),(eye+1,10)],fill='#57443e');d.point((eye,11),fill='#292b32')
  d.line([(25,16),(27,16)],fill='#ba957b')
  d.polygon([(16,6),(17,2),(20,0),(28,0),(31,3),(32,7)],fill='#34474c')
  for x in [18,21,24,27,30]:d.line([(x,2),(x,5)],fill='#526465')
  d.rectangle((16,6,31,8),fill='#283a40');d.line([(17,6),(30,6)],fill='#72817a')
  if pose=='phone':
   d.rectangle((32,9,35,17),fill='#202c38');d.rectangle((33,10,34,14),fill='#8eb3b7');d.point((33,16),fill='#c6c1a4')
  if pose=='coffees':
   for x in [17,36]:
    d.polygon([(x-3,34),(x+3,34),(x+2,42),(x-2,42)],fill='#ddcdb0')
    d.rectangle((x-2,37,x+2,39),fill='#9a6853')
    d.line([(x-3,33),(x+3,33)],fill='#f2e7cb');d.point((x,34),fill='#b4a990')
  if pose=='bag':im.alpha_composite(Image.open(R/'duffel.png'),(1,48))
 save(im,who+'-'+pose+('-'+str(walk) if walk is not None else '')+('-warm' if soft else ''))
for who,poses in [('boy',['stand','point','give']),('mom',['stand','wave','down']),('man',['stand','phone','back','coffees','hold','bag'])]:
 for soft in ([False,True] if who=='man' else [False]):
  for pose in poses:person(who,pose,soft=soft)
  for frame in range(4):person(who,'walk',frame,soft)
# Dad's blue-grey car: 80 x 32, same body, wheel and window anchors as the placeholder.
im,d=new(80,32)
d.polygon([(1,15),(12,14),(22,2),(25,0),(57,0),(61,3),(68,13),(76,14),(79,17),(79,24),(2,24),(0,21)],fill='#273947')
d.polygon([(3,15),(14,15),(25,2),(56,2),(67,15),(76,16),(78,20),(77,24),(2,24)],fill='#657c8b')
d.polygon([(4,17),(74,17),(76,20),(4,21)],fill='#8194a0')
d.line([(4,23),(75,23)],fill='#344c5d');d.line([(25,1),(55,1)],fill='#a9b2ac')
d.polygon([(18,13),(26,3),(39,3),(39,13)],fill='#9baead')
d.polygon([(43,3),(55,3),(64,13),(43,13)],fill='#a1b6b5')
d.polygon([(21,12),(28,4),(31,4),(25,12)],fill='#becbc2')
d.line([(41,3),(41,22)],fill='#3e5665');d.line([(20,15),(20,21)],fill='#546f80')
for x in [31,54]:d.line([(x,16),(x+4,16)],fill='#d2d2be')
# Driver's quiet silhouette and steering wheel.
d.ellipse((46,4,52,10),fill='#27323e');d.polygon([(46,10),(52,10),(56,13),(44,13)],fill='#27323e')
d.line([(53,10),(58,12)],fill='#354550');d.arc((56,9,61,15),180,350,fill='#27323e')
for x in [16,64]:
 d.rectangle((x-6,23,x+6,27),fill='#293742')
 d.ellipse((x-5,21,x+5,31),fill='#1c2734');d.ellipse((x-3,23,x+3,29),fill='#8a9399')
 d.line([(x-2,24),(x+2,28)],fill='#c6c9bc');d.point((x,26),fill='#4c5d6c')
d.rectangle((0,16,2,19),fill='#bb6055');d.point((1,16),fill='#f0a17a')
d.rectangle((76,16,79,18),fill='#f9edb9');d.line([(76,15),(78,15)],fill='#bfbd9d')
d.rectangle((76,23,79,24),fill='#aeb3aa');d.rectangle((0,23,4,24),fill='#aeb3aa')
save(im,'car')
pattern('rear-face',['.hhhh..','hhhshh.','hllllh.','.sees..','.slls..','..ss...','nnnnnn.'],dict(h=hair,s=shade,l=skin,e=ink,n='#354f79'))
# Collision-sized work-jacket caricature: no monster silhouette or added attack area.
for state in ['idle','tell','attack','hurt']:
 im,d=new(24,16)
 jacket='#a47a50' if state=='tell' else '#806044';hi='#d2a36c' if state=='tell' else '#ac855a'
 if state=='hurt':jacket='#ba9875';hi='#ead2a0'
 d.polygon([(3,7),(6,5),(17,5),(21,8),(23,12),(19,13),(3,13),(0,11)],fill='#3a3c3e')
 d.polygon([(4,7),(8,6),(16,6),(20,8),(21,11),(3,11)],fill=jacket)
 d.line([(5,7),(8,7)],fill=hi);d.line([(14,7),(18,8)],fill=hi)
 d.rectangle((10,7,11,11),fill='#503f36');d.point((12,8),fill='#e0c7a1')
 d.rectangle((6,9,8,11),fill='#604b3c');d.point((6,9),fill=hi)
 for x in [5,17]:
  d.rectangle((x,12,x+3,14),fill='#3c4a5e');d.line([(x-1,15),(x+4,15)],fill='#88918d')
 d.polygon([(12,2),(19,2),(21,5),(18,7),(13,6)],fill='#ce9d79')
 d.line([(13,6),(18,7),(20,5)],fill='#695147',width=2);d.point((19,4),fill='#30333a')
 d.rectangle((11,1,20,2),fill='#34474c');d.line([(12,0),(18,0)],fill='#5d7170')
 d.line([(11,2),(20,2)],fill='#72817a');d.point((17,1),fill='#8a9789')
 if state=='attack':d.line([(19,10),(23,10)],fill='#cfaa82',width=2)
 save(im,'brute-'+state)
# Homemade badge: cut paper corners, red crayon header, glued photo, string hole.
im,d=new(14,11)
d.polygon([(1,0),(11,0),(13,2),(13,9),(11,10),(0,10),(0,1)],fill='#aa9c82')
d.polygon([(1,0),(11,0),(12,2),(12,9),(1,9)],fill='#eee1b9')
d.line([(2,1),(10,1)],fill='#be6462');d.rectangle((2,3,5,7),fill='#7b9694')
d.point((3,3),fill=hair);d.rectangle((3,4,4,5),fill=skin);d.rectangle((2,6,5,7),fill='#354f79')
d.line([(7,4),(10,4)],fill='#5c6370');d.line([(7,6),(11,6)],fill='#7b7b75')
d.point((8,8),fill='#b16b66');d.point((10,8),fill='#b16b66');d.point((11,2),fill='#665b52');save(im,'id-card')
# Painted sky, clouds and stepped reflected light. No filtering or runtime gradients.
def rgb(s):return tuple(bytes.fromhex(s.lstrip('#')))
for state,top,edge,water in [('day','#4a526a','#e0b78a','#536b79'),('sunset','#3e405b','#d89a79','#655b6d'),('night','#131e34','#46536b','#283c51')]:
 im,d=new(320,184);a=rgb(top);b=rgb(edge);sea=rgb(water)
 for y in range(184):
  t=min(1,(y//4*4)/116)
  col=tuple(round(a[k]*(1-t)+b[k]*t) for k in range(3)) if y<117 else tuple(max(0,int(sea[k]*(1-(y-117)*.003))) for k in range(3))
  d.line([(0,y),(319,y)],fill=col)
 for n in range(13):
  x=(n*71+23)%340-20;y=12+(n*19)%82
  co=tuple(min(255,c+7) for c in rgb(top));d.line([(x,y),(x+14+n%4*5,y)],fill=co)
  d.line([(x+6,y+1),(x+25,y+1)],fill=co)
 for y in range(119,184,3):
  for n in range(9):
   x=(n*43+y*7)%320;length=3+(y+n)%14
   co=tuple(min(255,int(c+9)) for c in sea)
   d.line([(x,y),(min(319,x+length),y)],fill=co)
  if state!='night':
   cx=245+int(math.sin(y*.7)*9);spread=(y-115)//3
   co='#d1ad87' if state=='day' else '#d9a17a'
   d.line([(cx-spread,y),(cx+spread,y)],fill=co)
 if state=='night':
  for n in range(26):d.point(((n*83+17)%320,(n*37+6)%103),fill='#8993a2' if n%3 else '#c5c9bd')
 save(im,'sky-'+state)
im,d=new(29,29)
d.ellipse((0,0,28,28),fill=(255,205,146,16));d.ellipse((4,4,24,24),fill=(255,209,148,35));d.ellipse((7,7,21,21),fill='#f1cd9c');d.line([(9,10),(19,10)],fill='#f9e0b3');save(im,'sun')
# Repeating bridge silhouette. Arches leave the water visible between the piers.
im,d=new(96,110)
d.rectangle((0,0,95,5),fill='#393f50');d.line([(0,0),(95,0)],fill='#7d7d7c')
d.polygon([(0,5),(95,5),(95,109),(84,109),(84,38),(81,27),(75,20),(65,16),(34,16),(23,19),(17,26),(12,38),(12,109),(0,109)],fill='#424959')
for x in [2,88]:
 d.line([(x,8),(x,109)],fill='#5c6070')
 for y in range(15,110,14):d.line([(x,y),(x+6,y)],fill='#363d50')
for x in range(17,83,8):d.point((x,7),fill='#72717a')
d.line([(20,21),(26,17),(35,14),(64,14),(74,18),(79,23)],fill='#626574');save(im,'viaduct')
# Dressing is transparent and sits on existing surfaces; never a new tile/obstacle.
im,d=new(16,7)
d.line([(0,0),(15,0)],fill='#aa9d7c');d.line([(0,1),(15,1)],fill='#514f4b')
for x in [2,11]:
 d.rectangle((x,2,x+2,4),fill='#353e49');d.point((x,2),fill='#b1ae94');d.point((x+1,3),fill='#818676')
d.line([(7,3),(7,5),(9,6)],fill='#88624a');d.point((6,4),fill='#b5895c');save(im,'rivets')
im,d=new(10,38)
for y in range(0,34,6):
 d.line([(4,y),(6,y+2),(6,y+4),(4,y+6),(2,y+4),(2,y+2),(4,y)],fill='#515665')
 d.line([(3,y+1),(2,y+3)],fill='#91918a')
save(im,'chain')
pattern('gravel',['.....h.......','..s.hds......','hds....dh..s.'],dict(h='#a69a7f',d='#505059',s='#766c65'))
pattern('bottle-cap',['.hhhh.','hmmmsh','hmmsdh','.sdds.'],dict(h='#bba891',m='#687b86',s='#394954',d='#2c3648'))
im,d=new(32,3)
for x in range(32):
 d.line([(x,0),(x,1 if x%5 else 0)],fill='#b4b39a' if x%7 else '#6f7776')
save(im,'parking-stripe')
# Tall sodium fixture and its stepped translucent pool: the actual goal stays put.
im,d=new(28,124)
d.rectangle((23,7,25,122),fill='#384757');d.line([(23,9),(23,121)],fill='#73818a')
d.line([(24,9),(21,2),(6,2),(3,5)],fill='#596b75',width=2)
d.rectangle((0,5,8,8),fill='#293d4e');d.line([(1,8),(7,8)],fill='#f6d69c');d.line([(2,9),(6,9)],fill='#ffe8b3')
d.rectangle((21,121,27,123),fill='#3a4956');d.line([(22,121),(25,121)],fill='#7a867f');save(im,'streetlamp')
im,d=new(64,9)
for y in range(9):
 half=[16,23,29,31,31,29,25,19,10][y]
 d.line([(32-half,y),(min(63,32+half),y)],fill=(249,206,137,[8,15,23,33,39,31,23,15,8][y]))
save(im,'light-pool')
im,d=new(96,184)
for y in range(184):
 half=5+y//5;alpha=10+int(y/184*8)
 d.line([(48-half,y),(48+half,y)],fill=(255,213,151,alpha))
save(im,'light-shaft')
im,d=new(140,30)
for x in range(140):
 half=2+x//12;alpha=int(35*(1-x/140))
 d.line([(x,15-half),(x,15+half)],fill=(255,235,180,alpha))
save(im,'headlights')
im,d=new(6,12);d.rectangle((0,0,5,11),fill='#806043');d.line([(0,0),(0,11)],fill='#bd9465');d.line([(5,0),(5,11)],fill='#4d413c');save(im,'sleeve-warm')
pattern('hand',['.hhh','hlll','hsss','.ss.'],dict(h=light,l=skin,s=shade))

print('Authored',len(list(R.glob('*.png'))),'native pixel sprites')
