import {Core} from './rbr-lib.mjs';
import fs from 'node:fs';import vm from 'node:vm';
export function bootFixture(entries=[],review=false,geography=false){
const dir=new URL('../public/',import.meta.url),storage=new Map(entries);
const R={chapters:[],all:[],tapes:{},addPart(p){Object.assign(this.tapes,p.tapes||{});this.chapters.push(...p.chapters);this.all.push(...p.chapters.flatMap(c=>c.rooms));}};
const ctx={BLADEFALL_CLIMB:true,BladefallPrecisionRooms:R,BladefallPrecisionCore:Core,BladefallPrecisionGravity:globalThis.BladefallPrecisionGravity,BladefallPitchView:{helpers:{FOLK:{},prop(){},person(){},hash(){return .5;}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console};vm.createContext(ctx);
for(const f of ['bladefall-climb.js','bladefall-climb-atlas.js','bladefall-climb-passages.js','bladefall-climb-passage-tapes.js','bladefall-climb-worlds.js','bladefall-climb-geography.js','bladefall-climb-geography-build.js','bladefall-climb-passage-art.js','bladefall-climb-view.js'])vm.runInContext(fs.readFileSync(new URL(f,dir),'utf8'),ctx);
const view={scarf:[],parts:[],trail:[]};ctx.BladefallPrecisionView={view,palettes:{footing:{}},persist(){}};
const api={view,music(){},startChapter(c,r){view.chapter=c;view.g=Core.createGame(R.all,{room:R.chapters.slice(0,c).reduce((n,c)=>n+c.rooms.length,0)+r});view.mode='play';view.chapterStats={deaths:0,frames:0};}};
const PV=ctx.BladefallPitchView;PV.start(new URLSearchParams('pitch=climb&world=1'+(review?'&review':'')+(geography?'':'&legacygeography')),api);
const st=PV.climb.state(),worlds=ctx.BladefallClimb.worlds;
return {ctx,Core,worlds,view,PV,st,R,storage};
}
export const {ctx,worlds,view,PV,st,R,storage}=bootFixture();
export {Core};
