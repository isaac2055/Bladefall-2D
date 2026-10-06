import fs from 'node:fs';import vm from 'node:vm';import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds}=bootFixture();
for(const f of ['bladefall-climb-geography.js','bladefall-climb-geography-build.js'])vm.runInContext(fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8'),ctx);
const {geo,routes}=ctx.BladefallClimbGeographyBuild.build(worlds);
for(const r of routes)console.log(r.link,r.length,'tiles',r.points.length,'points');
const bounds=geo.bounds,margin=100;
const svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[bounds.x-margin,bounds.y-margin,bounds.w+margin*2,bounds.h+margin*2].join(' ')+'" style="background:#111725">'];
const colors=['#b0b586','#63866e','#af907a','#b5a381','#ad9777','#9285b4','#70878b','#9cbdcf','#bdd9e3'];
for(const r of geo.rooms.values()){svg.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${colors[r.world-1]}" opacity=".65" stroke="#121726" stroke-width="1"/>`);}
for(const r of routes)svg.push(`<path d="${r.points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')}" fill="none" stroke="${colors[r.a.world-1]}" stroke-width="5"/>`);
for(const region of geo.regions.values())svg.push(`<text x="${region.bounds.x}" y="${region.bounds.y-8}" fill="#fff" font-size="16">${region.world} · ${region.name}</text>`);
svg.push('</svg>');fs.writeFileSync('/tmp/bladefall-shared-geography/layout.svg',svg.join('\n'));
