"""Pixel-authored toys, memories and soft shadows. No runtime drawing dependency."""
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent

def new(w,h):
 im=Image.new('RGBA',(w,h));return im,ImageDraw.Draw(im)
def save(im,name):
 p=R/name;p.parent.mkdir(parents=True,exist_ok=True);im.save(p)
def pattern(name,rows,palette):
 assert len({len(row) for row in rows})==1,name
 im=Image.new('RGBA',(len(rows[0]),len(rows)))
 for y,row in enumerate(rows):
  for x,c in enumerate(row):
   if c!='.':im.putpixel((x,y),tuple(bytes.fromhex(palette[c]))+(255,))
 save(im,name);return im
# Every hazard keeps the original 8px cell and the original direction.
for name,colors in {
 'red':['f4a18b','df635b','b5404b','783748'],
 'yellow':['fff0a4','edca60','bf914a','78573f'],
 'blue':['a1c6f3','5c91d0','4767a7','354268'],
 'white':['fff6ed','d9d5df','a3a2b9','62647e'],
 'green':['b6dea1','80b77a','4c8868','365a56'],
}.items():
 p=dict(zip('hmsd',colors))
 pattern(f'props/lego-{name}.png',['........','.hh.hh..','.mm.mm..','hhhhhhhd','mmmmmmms','mmsmmsms','smssssss','dddddddd'],p)
 pattern(f'props/pin-{name}.png',['hmmh....','mssm....','.ds.....','..h.....','..h.....','..s.....','..s.....','..d.....'],dict(p,h=colors[0]))
pattern('props/checkpoint.png',[
 '......h......','......h......','.....hmh.....','.....h.h.....','hhhhhh.hhhhhh','.hm.......mh.','..hm.....mh..','...h.....h...','...h..h..h...','..h..hmh..h..','..h.hm.mh.h..','.hhm.....mhh.','.............'],dict(h='ffe9b0',m='c7a174'))
pattern('props/star.png',['....h....','....h....','...hmh...','hhhhmmhhh','.hmmmmmh.','..hmmmh..','..hmhmh..','.hm...mh.','.........'],dict(h='e8ffba',m='a9d58a'))
pattern('props/star-spent.png',['....h....','....h....','...h.h...','hhhh.hhhh','.h.....h.','..h...h..','..h.h.h..','.hh...hh.','.........'],dict(h='677d70'))
pattern('props/nightlight.png',['..hhh...','.hwwsh..','hwws....','hwws....','.hwwsh..','.hhssh..','.cwwsc..','.csssc..','..d.d...','..d.d...'],dict(h='ffecc0',w='fff8d9',s='e7cc93',c='d0ced3',d='8b8a9d'))
pattern('props/jar.png',['.hhsssh.','.dmmmmh.','.h....s.','.h....s.','.h....s.','.h....s.','.h....s.','.hmmmmh.','..ssss..'],dict(h='b8ccd7',s='687d97',d='69708c',m='8c98a7'))
pattern('props/firefly.png',['.h.','hwh','.h.'],dict(h='e7cf83',w='fff4b5'))
pattern('props/basket.png',['hhhhhhhhhhhh','mssmssmssmss','smssmssmssms','mssmssmssmss','ssssssssssss'],dict(h='97c59b',m='4f956f',s='336455'))
pattern('props/basket-weave.png',['mssmss','smssms','mssmss','smssms'],dict(m='4f956f',s='336455'))
pattern('props/gate.png',['hhhhhhhh','mmmmmmsm','mdmdmdsm','mdmdmdsm','mdmdmdsm','mdmdmdsm','mdmdmdsm','dddddddd'],dict(h='ddbd8c',m='b68c59',s='8c6345',d='9a704b'))
pattern('props/dock.png',['.hhhhhh.','hmmmmmmh','dmmmmmmc','dddddddd'],dict(h='a9aecb',m='67738f',c='d8ba86',d='454d6d'))
pattern('props/spring.png',['.hhhhhh.','.smhhs..','..msm...','.smhhs..','..msm...','hmmmmmmh','dssssssd','dddddddd'],dict(h='e0c3df',s='886e9b',m='b699be',d='524867'))
pattern('props/glass-platform.png',['hhhhhhhh','mmsmmmsm','dddddddd'],dict(h='dce4ee',m='8d9cb9',s='a7b7cc',d='576683'))
pattern('props/crayon.png',['.mmmmmmm..','hmsmmmmmms','hmsmmmmmhs','.ddddddd..'],dict(h='fff2d5',m='cba0ed',s='795892',d='8b689c'))
pattern('props/torn-photo.png',['.hhhh..','hhsssh.','.hssmh.','hssmm..','.hmmmhh','.hhhhh.','..hh...'],dict(h='f5ecd8',s='8bbdda',m='6aa07e'))
pattern('props/drawing.png',['hhhhhhhhhhhh','h....s.....h','h...scs....h','h..scwcs...h','h..scwcs...h','h...scs....h','h..e...e...h','h.e.....e..h','h........r.h','hhhhhhhhhhhh'],dict(h='eee0c3',s='dfbd7e',c='ffe9a2',w='fff3c1',e='6b5a65',r='c96868'))
pattern('room/baseboard.png',['hhhhhhhhhhhhhhhh','llllllllllllllll','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm','bbbbbbbbbbbbbbbb','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm','bbbbbbbbbbbbbbbb','bbbbbbbbbbbbbbbb','dddddddddddddddd','dddddddddddddddd','ssssssssssssssss','ssssssssssssssss'],dict(h='6d6c8a',l='4b4c6b',m='3b3c58',b='33344d',d='2b2c43',s='23263b'))
pattern('props/slime.png',['......hhh.......','....hhmmmhhh....','..hhmmmmmmsmh...','.hmmmhhmmmssmh..','hmmsssssssssssmh'],dict(h='a1e77c',m='68c751',s='3c9348'))
# Dusk bunnies are lint and fluff, with stitched-looking eyes, never monsters.
im,d=new(20,20)
d.polygon([(3,8),(1,5),(5,6),(4,2),(8,4),(10,0),(12,4),(17,2),(16,7),(20,8),(17,11),(19,15),(15,16),(14,19),(10,17),(6,19),(5,16),(1,16),(3,12),(0,10)],fill='#6a607e')
d.polygon([(5,6),(10,3),(15,6),(17,10),(15,15),(10,17),(5,15),(3,10)],fill='#9990a4')
d.polygon([(5,8),(7,5),(12,5),(15,8),(11,7),(7,10)],fill='#c2adb7');d.polygon([(5,12),(9,14),(15,12),(13,16),(8,16)],fill='#80718e')
for x in [7,12]:d.rectangle((x,9,x+1,10),fill='#352d49')
for x,y in [(1,5),(16,3),(18,13),(3,17)]:d.point((x,y),fill='#cab3b8')
save(im,'props/dust-bunny.png')
# Alphabet blocks: wooden bevel and hand-set 3x5 lettering.
letters={'A':['.x.','x.x','xxx','x.x','x.x'],'B':['xx.','x.x','xx.','x.x','xx.'],'C':['.xx','x..','x..','x..','.xx'],'D':['xx.','x.x','x.x','x.x','xx.']}
for i,(letter,rows) in enumerate(letters.items()):
 im,d=new(8,8);d.rectangle((0,0,7,7),fill=['#ad545d','#bb9450','#527ba6','#579372'][i]);d.rectangle((0,0,6,0),fill='#ead4a6');d.rectangle((0,1,0,6),fill='#d7b583');d.rectangle((7,0,7,7),fill='#655060');d.rectangle((1,1,6,6),outline='#d9bc8a')
 for y,row in enumerate(rows):
  for x,c in enumerate(row):
   if c=='x':d.point((x+3,y+2),fill='#f3dba9')
 save(im,f'props/block-{letter.lower()}.png')
# The larger memory pictures are authored separately, at one pixel per world pixel.
# Keep the existing photo-N asset names for the ten approved collectible scenes.
from make_memory_art import make_memories
make_memories()
# Soft-edged shadow silhouettes. Dither only at the outer edges, never blurred pixels.
for variant in range(3):
 im,d=new(28,128)
 points=[(0,127),(27,127),(26,80),(24,57),(22,36),(19,17),(15,3),(12,0),(9,8),(11,28),(8,51),(4,76)]
 if variant==1:points=[(27-x,y) for x,y in points]
 if variant==2:points=[(min(27,max(0,x+(2 if y<60 else 0))),y) for x,y in points]
 d.polygon(points,fill=(3,4,12,220))
 d.line(points[:2],fill=(6,7,20,180))
 # A single low contrast stepped rim keeps the dark soft against the wallpaper.
 d.line(points[2:]+[points[0]],fill=(10,10,25,120),width=1)
 save(im,f'props/dark-{variant}.png')
pattern('props/dark-wall.png',['....mmmmmmmm....','..mmmmmmmmmmmm..','.mmmmmmmmmmmmmm.','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm','mmmmmmmmmmmmmmmm'],dict(m='090b1c'))
