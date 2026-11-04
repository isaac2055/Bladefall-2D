"""Hand-authored pixel patterns for Chapter One. Run from the Felix project folder.

One character = one world pixel. No antialiasing, random noise, or runtime drawing.
Requires Pillow only when editing/rebuilding art; the game loads the committed PNGs.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent

def sprite(path, rows, palette):
    assert len({len(row) for row in rows}) == 1, path
    im = Image.new('RGBA', (len(rows[0]), len(rows)))
    for y, row in enumerate(rows):
        for x, pixel in enumerate(row):
            if pixel != '.': im.putpixel((x, y), tuple(bytes.fromhex(palette[pixel])) + (255,))
    dest = ROOT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    return im

light = dict(o='d9ac70', s='f5cf89', c='fff1bf', w='fffbea', h='ffffff', e='51424e', r='efad9a')
ball = [
 '..sccs..',
 '.schhcs.',
 'schhhhcs',
 'cwhhhhcc',
 'cwhhhwcc',
 'scwwwcco',
 '.scccso.',
 '..osso..',
 '........',
]
sprite('felix/light.png', ball, light)
face = ball.copy()
face[3] = 'cwehhewc'
face[4] = 'cwrhhrcc'
face[5] = 'scewweco'
face[6] = '.sceecs.'
sprite('felix/face.png', face, light)
slime = dict(light, o='659d50', s='93d368', c='c9f69b', w='e8ffd0', h='f6ffe8')
sprite('felix/slime.png', ball, slime)
sprite('felix/slime-face.png', face, slime)
sprite('felix/limb.png', ['wh','cw','sc','os','ss','cc'], light)
sprite('felix/foot.png', ['.cc.', 'scwh', 'osss'], light)
sprite('felix/cape-red.png', ['.rh.', 'rssr', '.dr.', '..d.'], dict(r='cc555c',h='f79181',s='e56c67',d='813e54'))
sprite('felix/cape-cream.png', ['.hh.', 'hccs', '.ss.', '..d.'], dict(h='fff3d4',c='e9d1b9',s='c69d99',d='813e54'))
sprite('felix/drip.png', ['.h.', '.c.', 'scs', '.s.'], slime)
# Twenty 8x8 tiles in precisely the established atlas order. Horizontally continuous
# grain, small knots and bevels; surface and side variants retain the old silhouettes.
wood = dict(H='d0a877', h='b4885c', l='946644', m='795137', b='65432f',
            d='503626', s='3c2b24', x='2e2320', n='a77b52')
patterns = [
 ['hhhhhhsh','llllllsl','mmmmbmsm','bbmmmbsm','bbbbbbsm','ddddddsd','dddsddsd','ssssssss'],
 ['hhhhhhhh','llllllll','mmmmmmmm','mbbbmmbb','bbbbbbbb','dddbbbdd','dddddssd','ssssssss'],
 ['hhhhhhhh','llllllll','mmmmmmmm','bbbmmmmn','bbbbbbbm','ddddbbbb','dddsdddd','ssssssss'],
 ['hhhhhhhh','llllllll','mmmmmmmm','mmmbbbbb','bmmbbbbb','bbbddddd','dddddssd','ssssssss'],
 ['bmbbbbsm','bbbbbbsm','dddbbbsm','bbddddsd','ddddddsd','dddsddsd','ddddddsd','ssssssss'],
 ['bbbbbbbb','ddbbbbbb','bbdddddd','bbbbdddd','ddbbdddd','ddddssdd','dddddddd','ssssssss'],
 ['bbbbbbbb','bbbbdddd','dddssddd','dddbbddb','ddddbbbd','bddddddd','dddbbbdd','ssssssss'],
 ['bbbbbbbb','bbbdddbb','dddddddd','dbbddddd','ddbbdddd','dddddddb','bbbbdddd','ssssssss'],
 ['hmbbbbbb','lbbddddd','lbbddddd','lbbssddd','ldbbdddd','ldbbdddd','lddddddd','lsssssss'],
 ['bbbbbbds','ddbbbdss','ddddbdss','ddddddss','ddbbddss','ddddddss','ddddddss','ssssssss'],
 ['bbdddddd','dddddddd','ddssdddd','dddddddd','dddddddd','ssssssss','xxxxxxxx','xxxxxxxx'],
]
boxpal=dict(H='e7c99a',h='caa474',l='b48b5d',m='a17b52',b='926b48',d='805b40',s='684b37',x='533c2e',n='d8bc91')
patterns += [
 ['HHHHHHHH','hhlHHlhh','lllnnlll','mlmnnmlm','mlmlmlml','mlmlmlml','blblblbl','dddddddd'],
 ['lmlmlmlm','mlmlmlml','mlmlmlml','lmlmlmlm','mlmlmlml','mlblmlml','blmlmlml','dddddddd'],
 ['hlmlmlml','hlmlmlml','hlmlmlml','hlmlmlml','hlmlmlml','hlmlmlml','hlblmlml','hddddddd'],
 ['lmlmlmds','mlmlmlds','mlmlmlds','lmlmlmds','mlmlmlds','mlmlmlds','blmlmlds','ddddddds'],
]
ruler = ['HHHHHHHH','lHlHlHlH','lHlHlHlH','lHHHlHHH','lHHHlHHH','hhhhhhhh','........','........']
patterns += [ruler,
 ['dddddddd','ddssdddd','dddddddd','ddddddss','ssssssss','xxssxxxx','xxxxxxxx','ssssssss'],
 ['dddddddd','ddddddss','dddddddd','ddssdddd','ssssssss','xxxxssxx','xxxxxxxx','ssssssss'],
 ['bdbdbdbd','dbdbdbdb','bdbdbdbd','dbdbdbdb','bdbdbdbd','dbdbdbdb','bdbdbdbd','ssssssss'],
 ['dbdbdbdb','bdbdbdbd','dbdbdbdb','bdbdbdbd','dbdbdbdb','bdbdbdbd','dbdbdbdb','ssssssss'],
]
atlas = Image.new('RGBA', (160,8))
for i,rows in enumerate(patterns):
    palette = boxpal if i in (11,12,13,14,18,19) else wood
    if i==15: palette=dict(H='ebd7a0',l='6d6251',h='b39260')
    im=Image.new('RGBA',(8,8))
    for y,row in enumerate(rows):
        for x,c in enumerate(row):
            if c!='.': im.putpixel((x,y),tuple(bytes.fromhex(palette[c]))+(255,))
    atlas.paste(im,(8*i,0))
atlas.save(ROOT/'tiles/bedroom.png')
