import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const source=await readFile(new URL('public/index.html',root),'utf8');
const worker=await readFile(new URL('public/sw.js',root),'utf8');
const build=await readFile(new URL('build-deploy.sh',root),'utf8');

test('Updrafts keeps one uninterrupted exploration cue across every checkpoint',async()=>{
  const file='wind-over-the-trees.ogg';
  assert.ok((await stat(new URL('public/audio/music/'+file,root))).size>1000);
  assert.ok(worker.includes(file));assert.ok(build.includes(file));
  assert.match(source,/3:Object\.freeze\(\{id:'updrafts-wind-over-trees'.*wind-over-the-trees\.ogg/s);
  const music=source.slice(source.indexOf('const LEVEL_MUSIC='),source.indexOf('function syncLevelMusic'));
  assert.doesNotMatch(music,/bellows-rest-floating-dream|level\.refuge|G\.p\.x>=4800/);
});
