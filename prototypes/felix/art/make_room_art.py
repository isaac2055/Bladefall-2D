"""Author Chapter One's room and prop sprites at one pixel per world pixel.
All drawing below is offline source art, using a restricted, shared pixel palette.
Run with python3 art/make_room_art.py; requires Pillow, never used by the game.
"""
from pathlib import Path
from PIL import Image, ImageDraw
R=Path(__file__).resolve().parent

def canvas(w,h):
 im=Image.new('RGBA',(w,h));return im,ImageDraw.Draw(im)
def save(im,path):
 p=R/path;p.parent.mkdir(parents=True,exist_ok=True);im.save(p)
def rect(d,b,c): d.rectangle(tuple(map(int,b)),fill=c)
def line(d,p,c,w=1): d.line(p,fill=c,width=w)
def wood(d,b):
 x,y,x2,y2=map(int,b)
 rect(d,b,'#483343');rect(d,(x,y,x2,y+1),'#80606b');rect(d,(x,y+2,x2,y+3),'#5f4656')
 for yy in range(y+7,y2,8):
  line(d,[(x+2,yy),(x2-2,yy)],'#392c3b')
  for xx in range(x+7,x2,37): line(d,[(xx,yy-3),(min(x2-2,xx+14),yy-3)],'#58404e')
 line(d,[(x,y2),(x2,y2)],'#271f2e')
def quilt(d,b):
 x,y,x2,y2=map(int,b);colors=['#526e9b','#705a91','#4a7b86','#626ca0']
 for j,yy in enumerate(range(y,y2+1,15)):
  for i,xx in enumerate(range(x,x2+1,26)):
   endx=min(xx+25,x2);endy=min(yy+14,y2);rect(d,(xx,yy,endx,endy),colors[(i+j)%4])
   line(d,[(xx,yy),(endx,yy)],'#8c9bb8')
   for sx in range(xx+3,endx,4):
    if yy+2<=y2:d.point((sx,yy+2),fill='#b1b5c7')
   if yy+8<=y2 and xx+15<x2:
    line(d,[(xx+12,yy+5),(xx+12,yy+11)],'#b4bfd0');line(d,[(xx+9,yy+8),(xx+15,yy+8)],'#b4bfd0')
# Wallpaper tile, stitched little moons and stars, sparse enough for dark playfields.
im,d=canvas(88,88);rect(d,(0,0,87,87),'#242b46')
line(d,[(0,0),(0,87)],'#303753');line(d,[(2,0),(2,87)],'#1f263e')
for x,y in [(20,16),(64,60)]:
 d.polygon([(x,y-3),(x+1,y-1),(x+3,y),(x+1,y+1),(x,y+3),(x-1,y+1),(x-3,y),(x-1,y-1)],fill='#3b4465')
for x,y in [(64,16),(20,60)]:
 d.ellipse((x-3,y-3,x+3,y+3),fill='#394261');d.ellipse((x-1,y-4,x+5,y+1),fill='#242b46')
for x,y in [(42,37),(8,82),(78,39)]:d.point((x,y),fill='#3a425e')
save(im,'room/wallpaper.png')
# Door, including its moulding and little brass handle.
im,d=canvas(84,141);rect(d,(0,0,83,140),'#302d43');rect(d,(1,0,82,2),'#666078');rect(d,(3,3,80,140),'#484057');rect(d,(5,5,78,140),'#353047')
for yy,hh in [(15,50),(75,56)]:
 rect(d,(13,yy,70,yy+hh),'#25273b');line(d,[(13,yy),(70,yy),(70,yy+hh)],'#53475e');line(d,[(15,yy+2),(68,yy+2),(68,yy+hh-2)],'#302b40')
rect(d,(62,72,70,83),'#4a4052');d.ellipse((63,74,68,79),fill='#b79a69');d.point((64,75),fill='#e5c48a');rect(d,(7,139,76,140),'#f3c785')
save(im,'room/door.png')
# Resizable background box: label is deliberately left to the game's exact story text.
im,d=canvas(64,64);rect(d,(0,0,63,63),'#70553f');rect(d,(1,2,62,61),'#87694c');rect(d,(0,0,63,1),'#b7976b');rect(d,(1,3,62,4),'#977958')
for y in range(8,60,6):line(d,[(3,y),(60,y)],'#806146')
d.polygon([(42,4),(61,4),(61,24)],fill='#795b43');rect(d,(28,1,34,26),'#b2a087');rect(d,(30,1,31,25),'#c7b99e');rect(d,(5,34,57,49),'#a38967')
line(d,[(2,61),(61,61)],'#4c3b30');line(d,[(61,3),(61,60)],'#594431');save(im,'room/box.png')
# Bed including quilt, upholstered mattress, hand-carved frame and legs.
im,d=canvas(600,190)
for x in [8,570]:wood(d,(x,46,x+9,189))
wood(d,(0,30,599,45));rect(d,(4,12,595,31),'#bbb8d2');line(d,[(4,13),(595,13)],'#eeebed');line(d,[(5,28),(594,28)],'#85839e')
quilt(d,(6,4,509,33));save(im,'room/bed.png')
im,d=canvas(26,143);d.ellipse((0,0,25,25),fill='#735449');wood(d,(0,13,25,142));line(d,[(4,26),(21,26)],'#ad8770');rect(d,(5,36,20,109),'#3c2c31');line(d,[(7,38),(18,38),(18,107)],'#654840');save(im,'room/headboard.png')
im,d=canvas(68,22);d.polygon([(3,0),(63,0),(67,4),(67,18),(63,21),(2,21),(0,17),(0,4)],fill='#cbc8dc');rect(d,(4,2,63,3),'#fff6ef');line(d,[(2,5),(2,16),(6,19),(62,19)],'#a4a0bf');line(d,[(6,5),(61,5)],'#e6deeb');save(im,'room/pillow.png')
# Bookshelf with individually bound spines; variation is authored and repeats in a long row.
im,d=canvas(560,250);rect(d,(0,0,559,249),'#211e31')
books=['#815363','#4c6e82','#85814e','#685382','#427b70','#8e664b']
for row in range(4):
 yy=row*62+52;wood(d,(0,yy,559,yy+5));x=8;i=0
 while x<546:
  w=[8,6,10,7,12,9,6][(i+row)%7];h=[37,30,43,34,39][(i+row*2)%5]
  if i%13==8:x+=11
  else:
   col=books[(i+row)%6];rect(d,(x,yy-h,x+w-1,yy-1),col)
   line(d,[(x,yy-h+1),(x,yy-2)],'#a59b9c');line(d,[(x+w-1,yy-h),(x+w-1,yy-1)],'#2a2538')
   for by in [yy-h+4,yy-5]:line(d,[(x+1,by),(x+w-2,by)],'#ae9b89')
   if w>7:rect(d,(x+3,yy-h+10,x+w-3,yy-h+15),'#c3b5a0')
  x+=w+1;i+=1
wood(d,(0,0,5,249));wood(d,(554,0,559,249));save(im,'room/shelf.png')
# Desk. Silhouette retains all original leg endpoints and switched-off lamp.
im,d=canvas(520,286);wood(d,(0,70,519,79))
for x in [10,498]:wood(d,(x,80,x+11,269))
rect(d,(8,81,510,95),'#392f40');rect(d,(68,66,93,69),'#626779');line(d,[(80,70),(98,24),(68,0)],'#78809b',3);line(d,[(81,66),(99,24)],'#b0a2a7')
d.polygon([(68,0),(44,12),(60,22)],fill='#505b7e');line(d,[(45,12),(60,21)],'#8e94b2');rect(d,(400,48,419,69),'#5d7d9a');rect(d,(401,49,402,68),'#a2adc0');line(d,[(400,69),(419,69)],'#333450')
for i,col in enumerate(['#d96b63','#e4c16e','#7ca6da','#7db47b','#ad83c9']):
 x=403+i*3;rect(d,(x,36-i%2*4,x+1,51),col);d.point((x,35-i%2*4),fill='#e8cda0')
save(im,'room/desk.png')
# Dresser: panels, recessed drawer fronts, brass cup pulls, familiar toys on top.
im,d=canvas(930,292);wood(d,(0,62,929,291));rect(d,(2,64,927,67),'#856b7b')
for row in range(3):
 for col in range(4):
  x=12+col*226;y=80+row*70;rect(d,(x,y,x+216,y+57),'#292337');rect(d,(x+2,y+2,x+214,y+54),'#4c3d53');line(d,[(x+3,y+3),(x+212,y+3)],'#70596b');line(d,[(x+4,y+51),(x+212,y+51)],'#3c3046')
  rect(d,(x+103,y+25,x+113,y+29),'#b49a72');rect(d,(x+104,y+29,x+112,y+30),'#66514a');line(d,[(x+104,y+25),(x+112,y+25)],'#e4c693')
# robot
rect(d,(148,32,171,53),'#5a6b82');rect(d,(151,14,168,29),'#8592a5');rect(d,(152,15,167,17),'#bac2c8');rect(d,(155,20,157,22),'#263147');rect(d,(162,20,164,22),'#263147');line(d,[(155,26),(164,26)],'#b3ac93');line(d,[(160,14),(160,6)],'#8892aa');rect(d,(159,3,161,6),'#d9766c')
for x in [150,164]:rect(d,(x,54,x+5,61),'#485469')
rect(d,(154,36,166,43),'#b6a07d');rect(d,(156,38,157,40),'#ce735f');rect(d,(162,38,164,40),'#90b9b0')
# ring tower
line(d,[(520,62),(520,0)],'#a98c69',3)
for i,col in enumerate(['#b76362','#c39353','#c3b760','#639875','#6487ba']):
 w=36-i*6;x=520-w//2;y=52-i*10;rect(d,(x,y,x+w-1,y+8),col);line(d,[(x+2,y),(x+w-3,y)],'#c4af9f');rect(d,(x,y+7,x+w-1,y+8),'#675164')
# rocket
d.polygon([(752,62),(768,62),(766,22),(760,6),(754,22)],fill='#cdc8d4');line(d,[(760,8),(755,24),(755,57)],'#f2e2df');d.ellipse((756,28,764,36),fill='#425b82');d.point((759,30),fill='#cbdbe5');d.polygon([(752,62),(745,66),(753,48)],fill='#b8626a');d.polygon([(768,62),(775,66),(767,48)],fill='#b8626a');save(im,'room/dresser.png')
# Curtain, seamless vertically, with embroidered hem supplied separately.
im,d=canvas(32,32)
for x,col in enumerate(['#745573']*2+['#6c4e70']*4+['#604466']*6+['#513a5b']*5+['#402f4e']*5+['#493453']*4+['#5a3e61']*4+['#694b6b']*2):rect(d,(x,0,x,31),col)
for yy in [6,22]:line(d,[(3,yy),(3,yy+2)],'#8c6b88')
save(im,'room/curtain.png')
im,d=canvas(34,32);rect(d,(0,0,33,31),'#2d2337');line(d,[(0,0),(0,31)],'#4b3749');line(d,[(2,0),(2,31)],'#38293e');line(d,[(32,0),(32,31)],'#191c2b')
for x,y in [(9,6),(17,18),(8,26)]:line(d,[(x,y),(x+6,y+1)],'#35283e')
save(im,'room/wardrobe.png')
im,d=canvas(24,32);rect(d,(0,0,23,31),'#483523')
for x in range(0,24,6):
 line(d,[(x,0),(x,31)],'#342b23');line(d,[(x+1,0),(x+1,31)],'#5c452c');line(d,[(x+3,0),(x+3,31)],'#4d3a27')
for x,y in [(3,8),(14,24)]:line(d,[(x,y),(x+3,y)],'#674c30')
save(im,'room/corrugated.png')
# Moon and craters. Pixel-step outline, cool rim, no vector smoothing.
im,d=canvas(32,32);d.ellipse((0,0,31,31),fill='#a9adc9');d.ellipse((1,0,30,29),fill='#e6e7d8');d.ellipse((3,1,28,26),fill='#f6f0db')
for x,y,r in [(7,11,3),(18,21,2),(21,9,2),(12,25,1)]:
 d.ellipse((x-r,y-r,x+r,y+r),fill='#cacfc6');line(d,[(x-r,y),(x-r+1,y+r-1),(x+1,y+r)],'#dce0d1')
save(im,'room/moon.png')
# Window moulding tile: nine-slice keeps the approved window dimensions.
im,d=canvas(16,16);rect(d,(0,0,15,15),'#4b526f');rect(d,(1,1,14,14),'#7c88a3');rect(d,(3,3,12,12),'#59637f');rect(d,(5,5,10,10),'#303d59');rect(d,(7,7,8,8),'#1d2c4d');save(im,'room/frame.png')
# Boy head variants: the same 38 x 46 anchor and hair silhouette in every pose.
skin='#e7b698';shade='#bf8d83';pale='#f7d4af';hair='#50363b'
for mood in ['look','crying','asleep']:
 im,d=canvas(38,46)
 d.polygon([(6,18),(30,18),(33,24),(33,33),(29,40),(23,43),(14,43),(7,40),(4,34),(4,24)],fill=shade)
 d.polygon([(7,18),(29,18),(31,25),(30,34),(25,39),(14,40),(7,35),(5,26)],fill=skin)
 d.polygon([(7,21),(16,17),(25,19),(27,26),(19,29),(8,27)],fill=pale)
 rect(d,(2,26,5,31),skin);rect(d,(32,26,35,31),shade)
 d.polygon([(3,25),(3,14),(6,8),(12,5),(16,5),(19,0),(22,6),(29,6),(34,12),(35,24),(30,21),(27,17),(19,19),(12,15),(8,20)],fill=hair)
 d.polygon([(5,17),(7,10),(14,7),(19,8),(22,7),(29,9),(31,13),(22,12),(17,14),(12,11)],fill='#78504a')
 line(d,[(8,12),(13,9),(17,10)],'#95634f');line(d,[(24,10),(28,11)],'#95634f')
 rect(d,(7,32,10,33),'#d9968e');rect(d,(26,32,29,33),'#d9968e');rect(d,(19,31,20,32),'#c88e7e')
 if mood=='look':
  for x in [12,24]:
   rect(d,(x,27,x+2,30),'#403440');d.point((x,27),fill='#fff0dc')
  line(d,[(16,35),(17,36),(21,36),(23,34)],'#885452')
 elif mood=='crying':
  line(d,[(10,28),(13,29),(15,28)],'#674349');line(d,[(23,28),(25,29),(28,28)],'#674349')
  line(d,[(11,30),(11,35)],'#bce4eb');line(d,[(12,31),(12,36)],'#8ab7d3');line(d,[(17,36),(19,35),(22,36)],'#885452')
 else:
  line(d,[(10,29),(15,29)],'#674349');line(d,[(23,29),(28,29)],'#674349');line(d,[(18,35),(21,35)],'#a36e68')
 save(im,f'boy/head-{mood}.png')
# Pajamas, hem ribbing and little yellow stars.
def pajamas(d,b):
 x,y,x2,y2=map(int,b);rect(d,b,'#4c6d9b');rect(d,(x,y,x+2,y2),'#7892b6');rect(d,(x2-3,y,x2,y2),'#354e7c');line(d,[(x+1,y2-2),(x2-1,y2-2)],'#9eafc7')
 for xx,yy in [(x+7,y+8),(x+19,y+18),(x+8,y+30)]:
  if xx+1<x2 and yy+2<y2:
   line(d,[(xx,yy-1),(xx,yy+1)],'#e7cf8e');line(d,[(xx-1,yy),(xx+1,yy)],'#e7cf8e')
im,d=canvas(30,44);pajamas(d,(1,0,28,43));d.polygon([(9,0),(15,5),(21,0)],fill='#c0b3b0');line(d,[(15,7),(15,38)],'#3c567f');
for y in [10,20,30]:d.point((17,y),fill='#d6c8a5')
save(im,'boy/torso.png')
im,d=canvas(9,46);pajamas(d,(0,0,8,41));rect(d,(0,42,8,45),'#c1bbd1');rect(d,(0,42,6,42),'#f5e8df');save(im,'boy/leg.png')
im,d=canvas(8,30);pajamas(d,(0,0,7,23));rect(d,(1,24,6,28),skin);rect(d,(2,25,4,26),pale);save(im,'boy/arm.png')
im,d=canvas(56,48);pajamas(d,(4,0,29,39));d.polygon([(18,39),(46,39),(50,9),(46,5),(34,2),(27,8)],fill='#354e7c');line(d,[(29,10),(36,6),(44,8)],'#6c88af');rect(d,(42,39,53,45),shade);rect(d,(42,39,51,41),pale);line(d,[(11,13),(38,11)],skin,5);line(d,[(12,11),(34,10)],pale);save(im,'boy/sitting.png')
im,d=canvas(52,64);pajamas(d,(11,0,36,39));d.polygon([(12,38),(3,59),(0,62),(12,63),(23,43)],fill='#354e7c');d.polygon([(26,36),(28,62),(42,63),(36,58),(34,38)],fill='#4c6d9b');rect(d,(1,61,12,63),'#c5c0d2');rect(d,(29,61,42,63),'#c5c0d2');save(im,'boy/kneeling.png')
im,d=canvas(140,44);quilt(d,(0,23,139,43));d.polygon([(103,25),(105,15),(110,8),(119,4),(128,5),(134,11),(139,23)],fill='#5d7aa8');line(d,[(106,16),(112,9),(121,7),(129,9)],'#93a9c8');line(d,[(112,18),(112,25)],'#8ca3c2');save(im,'boy/hidden.png')
im,d=canvas(140,18);quilt(d,(0,0,139,17));save(im,'boy/quilt.png')
