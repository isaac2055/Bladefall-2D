#!/usr/bin/env python3
"""Register one Act Three echo everywhere a stage must be registered (anchored edits; every anchor
is asserted before anything is written). Usage: scripts/register-echo.py '<json args>'  (then: node scripts/repin-stage-counts.mjs)
args: stage, zone, name, len, prev_zone, connector, site_id, site_name, road_mp3, road_title, road_mood,
      trial_mp3 (optional), file_base (e.g. 'fractured-woods'), version (e.g. '7.202.0'), cache (e.g. 285),
      col, row, blueprint {systems, signature, acts}"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = json.loads(sys.argv[1])
st = a['stage']; prev = st - 1
P = lambda f: os.path.join(ROOT, f)

def edit(f, pairs, extra=None):
    s = open(P(f)).read()
    for old, new in pairs:
        n = s.count(old)
        assert n == 1, (f, old[:90], n)
        s = s.replace(old, new)
    if extra: s = extra(s)
    return f, s

writes = []
# ── index.html ──
def idx_extra(s):
    s = re.sub(r"const VERSION='[\d.]+'", "const VERSION='%s'" % a['version'], s)
    return s
last_art = re.findall(r'<script src="(bladefall-fractured-[a-z-]+-art\.js)\?v=[\d.]+"></script>', open(P('public/index.html')).read())[-1]
idx_pairs = [
    ('<script src="%s?v=' % last_art, None),  # placeholder, handled below
]
s = open(P('public/index.html')).read()
m = re.search(r'<script src="%s\?v=[\d.]+"></script>' % re.escape(last_art), s); assert m
tag = m.group(0)
new_tags = tag + '\n<script src="bladefall-%s.js?v=%s"></script>\n<script src="bladefall-%s-art.js?v=%s"></script>' % (a['file_base'], a['version'], a['file_base'], a['version'])
lvl_old = re.search(r"  %d:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(%d\):null\)\};" % (prev, prev), s).group(0)
lvl_new = lvl_old[:-2] + ",\n  %d:(typeof BladefallActTwo!=='undefined'?BladefallActTwo.level(%d):null)};" % (st, st)
v4_old = "const V4_LAST_STAGE=%d;" % prev
mus_old = re.search(r"  %d:Object\.freeze\(\{id:'[^']+',src:'[^']+',\n    title:'[^']*',artist:'[^']*',mood:'[^']*'\}\)\n\}\);" % prev, s).group(0)
mus_new = mus_old[:-4] + ",\n  %d:Object.freeze({id:'%s',src:'./audio/music/%s',\n    title:'%s',artist:'Aerth score',mood:'%s'})\n});" % (st, a['zone'] + '-road', a['road_mp3'], a['road_title'], a['road_mood'])
writes.append(edit('public/index.html', [(tag, new_tags), (lvl_old, lvl_new), (v4_old, "const V4_LAST_STAGE=%d;" % st), (mus_old, mus_new)], idx_extra))
# ── renderer ──
r = open(P('public/bladefall-respec-renderer.js')).read()
sup = re.search(r"const SUPPORTED_STAGES = new Set\(\[([\d, ]+)\]\);", r)
writes.append(edit('public/bladefall-respec-renderer.js', [(sup.group(0), "const SUPPORTED_STAGES = new Set([%s, %d]);" % (sup.group(1), st))]))
# ── campaign ──
c = open(P('public/bladefall-campaign.js')).read()
row_old = re.findall(r"    \{ name: '[^']+', len: \d+, theme: '[^']+', sky: '[^']+', ground: '[^']+', grunts: 0, flyers: 0, type: 'normal', act: 3 \},\n  \];", c)[-1]
row_new = row_old[:-5] + "\n    { name: '%s', len: %d, theme: 'fractured', sky: '#0c1020', ground: '#221e28', grunts: 0, flyers: 0, type: 'normal', act: 3 },\n  ];" % (a['name'], a['len'])
bp = a['blueprint']
bp_old_end = "      customExtension: 0,\n    },\n  ];"
bp_count = c.count(bp_old_end); assert bp_count == 1, bp_count
bp_new = "      customExtension: 0,\n    },\n    {\n      id: '%s',\n      source: 'custom',\n      systems: %s,\n      signature: %s,\n      acts: %s,\n      composition: { recipe: 'none', at: 0.5 },\n      cadence: { adds: 0, foes: [], accents: [] },\n      customExtension: 0,\n    },\n  ];" % (a['zone'], json.dumps(bp['systems']).replace('"', "'"), json.dumps(bp['signature']), json.dumps(bp['acts']).replace('"', "'"))
cnt = re.search(r"if \(blueprints\.length !== (\d+)\) errors\.push\(\{ code: 'campaign\.count', message: 'Campaign must define exactly (\d+) stages\.' \}\);", c)
n = int(cnt.group(1))
writes.append(edit('public/bladefall-campaign.js', [(row_old, row_new), (bp_old_end, bp_new),
    (cnt.group(0), "if (blueprints.length !== %d) errors.push({ code: 'campaign.count', message: 'Campaign must define exactly %d stages.' });" % (n + 1, n + 1))]))
# ── progression ──
g = open(P('public/bladefall-progression.js')).read()
zrow = re.search(r"    \['%s', %d, '[^']+', \d+, \d+, '[a-z]+', \d+, \d+, \d+\],\n" % (re.escape(a['prev_zone']), prev), g).group(0)
zcount = re.search(r"if \(zones\.length !== (\d+) \|\|", g); zn = int(zcount.group(1))
zmsg = "'zones must uniquely cover all %d reachable stages'" % zn
conn_old = re.findall(r"    connector\('[^']+', '[^']+', '[^']+', '[^']+', \[[^\]]*\]\),\n  \];", g)[-1]
conn_new = conn_old[:-5] + "\n    connector('%s', '%s', '%s', 'echo-road', []),\n  ];" % (a['connector'], a['prev_zone'], a['zone'])
writes.append(edit('public/bladefall-progression.js', [(zrow, zrow + "    ['%s', %d, '%s', %d, %d, 'boss', 12000, 25, 8],\n" % (a['zone'], st, a['name'], a['col'], a['row'])),
    (zcount.group(0), "if (zones.length !== %d ||" % (zn + 1)), (zmsg, "'zones must uniquely cover all %d reachable stages'" % (zn + 1)), (conn_old, conn_new)]))
# ── world ──
w = open(P('public/bladefall-world.js')).read()
node_old = re.search(r"    \['%s', %d, '[^']+', %d, %d, '[a-z]+', false\],\n" % (re.escape(a['prev_zone']), prev, prev, prev), w).group(0)
route_old = re.findall(r"    \['[^']+', '[^']+', '[^']+', 'act-three', \[\]\],\n", w)[-1]
ncount = re.search(r"if \(nodes\.length !== (\d+)\) errors\.push\('world graph must cover all (\d+) reachable stages'\);", w); nn = int(ncount.group(1))
writes.append(edit('public/bladefall-world.js', [(node_old, node_old + "    ['%s', %d, '%s', %d, %d, 'boss', false],\n" % (a['zone'], st, a['name'], st, st)),
    (route_old, route_old + "    ['%s', '%s', '%s', 'act-three', []],\n" % (a['connector'], a['prev_zone'], a['zone'])),
    (ncount.group(0), "if (nodes.length !== %d) errors.push('world graph must cover all %d reachable stages');" % (nn + 1, nn + 1))]))
# ── zones ──
z = open(P('public/bladefall-zones.js')).read()
seam_old = re.findall(r"    \['[^']+', '[^']+', 'east', '[a-z]+', 0\.5, '[^']+', 'west', 'walk', 0\.5\],\n  \];", z)[-1]
seam_new = seam_old[:-5] + "\n    ['%s', '%s', 'east', 'walk', 0.5, '%s', 'west', 'walk', 0.5],\n  ];" % (a['connector'], a['prev_zone'], a['zone'])
writes.append(edit('public/bladefall-zones.js', [(seam_old, seam_new)]))
# ── recovery ──
rc = open(P('public/bladefall-recovery.js')).read()
site_old = re.findall(r"    \['[^']+', '[^']+', '[^']+', [\d.]+, false\],\n  \];", rc)[-1]
site_new = site_old[:-5] + "\n    ['%s', '%s', '%s', 0.03, false],\n  ];" % (a['site_id'], a['zone'], a['site_name'])
writes.append(edit('public/bladefall-recovery.js', [(site_old, site_new)]))
# ── sw / deploy / attribution ──
sw = open(P('public/sw.js')).read()
swc = re.search(r"const CACHE_NAME = 'bladefall-v(\d+)';", sw)
add_files = "  './bladefall-%s.js?v=%s',\n  './bladefall-%s-art.js?v=%s',\n" % (a['file_base'], a['version'], a['file_base'], a['version'])
last_sw_art = re.findall(r"  '\./bladefall-fractured-[a-z-]+-art\.js\?v=[\d.]+',\n", sw)[-1]
if "bladefall-fractured.js" not in sw:
    first_fx = re.search(r"  '\./bladefall-fractured-outskirts\.js\?v=[\d.]+',\n", sw).group(0)
    sw = sw.replace(first_fx, "  './bladefall-fractured.js?v=%s',\n" % a['version'] + first_fx)
    open(P('public/sw.js'), 'w').write(sw)
mus = "  './audio/music/%s',\n" % a['road_mp3'] + ("  './audio/music/%s',\n" % a['trial_mp3'] if a.get('trial_mp3') else '')
last_mus = re.findall(r"  '\./audio/music/[a-z-]+\.mp3',\n", sw)[-1]
writes.append(edit('public/sw.js', [(swc.group(0), "const CACHE_NAME = 'bladefall-v%d';" % a['cache']), (last_sw_art, last_sw_art + add_files), (last_mus, last_mus + mus)]))
bd = open(P('build-deploy.sh')).read()
last_bd_art = re.findall(r"  bladefall-fractured-[a-z-]+-art\.js\n", bd)[-1]
if "bladefall-fractured.js" not in bd:
    bd = bd.replace("  bladefall-fractured-outskirts.js\n", "  bladefall-fractured.js\n  bladefall-fractured-outskirts.js\n")
    open(P('build-deploy.sh'), 'w').write(bd)
last_bd_mus = re.findall(r"  audio/music/[a-z-]+\.mp3\n", bd)[-1]
bd_mus = "  audio/music/%s\n" % a['road_mp3'] + ("  audio/music/%s\n" % a['trial_mp3'] if a.get('trial_mp3') else '')
writes.append(edit('build-deploy.sh', [(last_bd_art, last_bd_art + "  bladefall-%s.js\n  bladefall-%s-art.js\n" % (a['file_base'], a['file_base'])), (last_bd_mus, last_bd_mus + bd_mus)]))
at = open(P('public/audio/ATTRIBUTION.md')).read()
last_row = [l for l in at.split('\n') if l.startswith('| The Fractured') or l.startswith('| Fractured')][-1] + '\n'
writes.append(edit('public/audio/ATTRIBUTION.md', [(last_row, last_row + "| %s (Act Three) | “%s” | %s | — |\n" % (a['name'], a['road_title'], ("“%s” (the C-side)" % a['trial_title']) if a.get('trial_title') else '—'))]))
# all asserted: write
for f, s in writes:
    open(P(f), 'w').write(s)
# stamps: page scripts to the new version (the shared data modules and anything listed in 'touched'); sw follows the page
s = open(P('public/index.html')).read()
for name in ['bladefall-campaign.js', 'bladefall-progression.js', 'bladefall-world.js', 'bladefall-zones.js', 'bladefall-recovery.js',
             'bladefall-respec-renderer.js'] + a.get('touched', []):
    s, k = re.subn(r'<script src="%s\?v=[\d.]+"' % re.escape(name), '<script src="%s?v=%s"' % (name, a['version']), s)
    assert k == 1, name
open(P('public/index.html'), 'w').write(s)
stamps = dict(re.findall(r'<script src="([^"?]+)\?v=([\d.]+)"', s))
sw = open(P('public/sw.js')).read()
sw = re.sub(r"'\./([^'?]+)\?v=([\d.]+)'", lambda m: "'./%s?v=%s'" % (m.group(1), stamps.get(m.group(1), m.group(2))), sw)
open(P('public/sw.js'), 'w').write(sw)
# the campaign test's stage-name list gains the echo
t = open(P('tests/campaign.test.mjs')).read()
anchor = "',   // Act Three's echoes, stages 21+"
assert t.count(anchor) == 1
t = t.replace(anchor, "', '%s" % a['name'] + anchor)
open(P('tests/campaign.test.mjs'), 'w').write(t)
print('registered stage', st, a['zone'], '- now run scripts/repin-stage-counts.mjs')
